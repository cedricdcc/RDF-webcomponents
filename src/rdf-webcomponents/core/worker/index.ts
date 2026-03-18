/**
 * @fileoverview WebWorker for RDF processing operations
 * @module rdf-webcomponents/core/worker
 * 
 * This worker handles all heavy RDF operations:
 * - Fetching RDF data from URLs
 * - Parsing various RDF formats
 * - SPARQL endpoint queries
 * - SHACL shape extraction
 * - Lens execution
 * - Caching
 */

import { WorkerMessageHandler, reportProgress } from '../protocol';
import { MessageType, type WorkerMessage, type SerializedQuad } from '../../types';
import { serializeQuad } from '../../types';
import { parseRdf, detectFormat, getAcceptHeader, serializeQuads } from './parsers';
import { SparqlClient, sparqlResultsToQuads } from './sparql';
import { extractShapes, toLens, type Shapes, type Shape } from 'rdf-lens';
import { DataFactory } from 'n3';
import { CacheManager, generateRdfCacheKey, generateShapeCacheKey } from '../cache';

const { namedNode } = DataFactory;

// ============================================================================
// Worker State
// ============================================================================

const cacheManager = CacheManager.getInstance();
const shapeCache = new Map<string, Shapes>();
const clientCache = new Map<string, SparqlClient>();

// ============================================================================
// Message Handler
// ============================================================================

const handler = new WorkerMessageHandler();

// ============================================================================
// Fetch Handler
// ============================================================================

handler.handle(MessageType.FETCH_REQUEST, async (payload: any, message) => {
  const { 
    url, 
    format, 
    strategy = 'file',
    subject,
    subjectQuery,
    subjectClass,
    depth = 2,
    headers = {},
    cache = 'memory',
    cacheTtl,
    shared = false,
  } = payload;
  
  const startTime = Date.now();
  
  // Check cache first
  const cacheKey = generateRdfCacheKey(url, { strategy, subject, query: subjectQuery });
  const cached = await cacheManager.get(cacheKey, cache, shared);
  
  if (cached && Array.isArray(cached)) {
    return {
      url,
      format: format || 'turtle',
      quads: cached as SerializedQuad[],
      quadCount: (cached as SerializedQuad[]).length,
      duration: Date.now() - startTime,
      cacheKey,
      fromCache: true,
    };
  }
  
  reportProgress(message.id, 'fetching', 0, 'Starting fetch...');
  
  let quads: any[] = [];
  let detectedFormat = format;
  
  // Handle different strategies
  if (url.includes('sparql') || url.includes('query') || strategy !== 'file') {
    // SPARQL endpoint
    reportProgress(message.id, 'fetching', 10, 'Connecting to SPARQL endpoint...');
    
    let client = clientCache.get(url);
    if (!client) {
      client = new SparqlClient({ endpoint: url, headers });
      clientCache.set(url, client);
    }
    
    reportProgress(message.id, 'parsing', 30, 'Executing SPARQL query...');
    
    quads = await client.extractData(strategy, {
      subject,
      subjectQuery,
      subjectClass,
      depth,
    });
    
    detectedFormat = 'turtle';
  } else {
    // HTTP fetch
    reportProgress(message.id, 'fetching', 10, 'Fetching RDF data...');
    
    const response = await fetch(url, {
      headers: {
        'Accept': getAcceptHeader(format),
        ...headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    
    reportProgress(message.id, 'parsing', 40, 'Parsing RDF data...');
    
    // Detect format if not specified
    detectedFormat = format || detectFormat(url, content);
    
    // Parse the content
    const result = await parseRdf(content, detectedFormat, url, (progress) => {
      reportProgress(message.id, 'parsing', 40 + progress.progress * 0.4, progress.message);
    });
    
    quads = result.quads;
    
    if (result.errors.length > 0) {
      console.warn('Parse errors:', result.errors);
    }
  }
  
  reportProgress(message.id, 'building', 90, 'Building triplestore...');
  
  // Serialize quads for transfer
  const serializedQuads = serializeQuads(quads);
  
  // Cache the result
  if (cache !== 'none') {
    await cacheManager.set(cacheKey, serializedQuads, cacheTtl, cache, shared);
  }
  
  return {
    url,
    format: detectedFormat,
    quads: serializedQuads,
    quadCount: serializedQuads.length,
    duration: Date.now() - startTime,
    cacheKey,
    fromCache: false,
  };
});

// ============================================================================
// Query Handler
// ============================================================================

handler.handle(MessageType.QUERY_REQUEST, async (payload: any) => {
  const { endpoint, query, headers = {} } = payload;
  const startTime = Date.now();
  
  let client = clientCache.get(endpoint);
  if (!client) {
    client = new SparqlClient({ endpoint, headers });
    clientCache.set(endpoint, client);
  }
  
  const results = await client.executeQuery(query);
  
  return {
    results,
    duration: Date.now() - startTime,
  };
});

// ============================================================================
// Shape Extraction Handler
// ============================================================================

handler.handle(MessageType.EXTRACT_SHAPES_REQUEST, async (payload: any, message) => {
  const { quads: serializedQuads, customApply = {} } = payload;
  const startTime = Date.now();
  
  reportProgress(message.id, 'parsing', 0, 'Converting quads...');
  
  // Convert serialized quads back to N3 quads
  const quads: any[] = serializedQuads.map((sq: SerializedQuad) => {
    return DataFactory.quad(
      deserializeTerm(sq.subject),
      deserializeTerm(sq.predicate),
      deserializeTerm(sq.object),
      sq.graph ? deserializeTerm(sq.graph) : undefined
    );
  });
  
  reportProgress(message.id, 'parsing', 30, 'Extracting shapes...');
  
  // Extract shapes using rdf-lens
  const shapes = extractShapes(quads, customApply);
  
  // Cache the shapes
  const cacheKey = `shapes-${Date.now()}`;
  shapeCache.set(cacheKey, shapes);
  
  // Serialize shapes for transfer
  const serializedShapes = shapes.shapes.map((shape: Shape) => ({
    id: shape.id,
    ty: shape.ty.value,
    description: shape.description,
    fields: shape.fields.map((f: any) => ({
      name: f.name,
      path: typeof f.path === 'string' ? f.path : 'complex-path',
      minCount: f.minCount,
      maxCount: f.maxCount,
    })),
  }));
  
  return {
    shapes: serializedShapes,
    lensKeys: Object.keys(shapes.lenses),
    duration: Date.now() - startTime,
  };
});

// ============================================================================
// Lens Execution Handler
// ============================================================================

handler.handle(MessageType.EXECUTE_LENS_REQUEST, async (payload: any, message) => {
  const { 
    quads: serializedQuads, 
    shapeQuads: serializedShapeQuads,
    targetClass,
    subject,
    multiple = false,
    validate = false,
    shapeCacheKey,
  } = payload;
  
  const startTime = Date.now();
  
  reportProgress(message.id, 'parsing', 0, 'Converting quads...');
  
  // Convert serialized quads back to N3 quads
  const dataQuads: any[] = serializedQuads.map((sq: SerializedQuad) => {
    return DataFactory.quad(
      deserializeTerm(sq.subject),
      deserializeTerm(sq.predicate),
      deserializeTerm(sq.object),
      sq.graph ? deserializeTerm(sq.graph) : undefined
    );
  });
  
  let shapes: Shapes | undefined;
  
  // Get shapes from cache or parse
  if (shapeCacheKey && shapeCache.has(shapeCacheKey)) {
    shapes = shapeCache.get(shapeCacheKey);
  } else if (serializedShapeQuads) {
    reportProgress(message.id, 'parsing', 20, 'Parsing shape definitions...');
    
    const shapeQuadsParsed: any[] = serializedShapeQuads.map((sq: SerializedQuad) => {
      return DataFactory.quad(
        deserializeTerm(sq.subject),
        deserializeTerm(sq.predicate),
        deserializeTerm(sq.object),
        sq.graph ? deserializeTerm(sq.graph) : undefined
      );
    });
    
    shapes = extractShapes(shapeQuadsParsed);
  } else {
    throw new Error('No shapes provided. Either provide shapeQuads or shapeCacheKey.');
  }
  
  if (!shapes) {
    throw new Error('Failed to load shapes');
  }
  
  reportProgress(message.id, 'parsing', 40, 'Finding subjects...');
  
  // Find subjects to extract
  let subjects: string[] = [];
  
  if (subject) {
    subjects = [subject];
  } else if (targetClass) {
    // Find all instances of the target class
    const typePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    subjects = dataQuads
      .filter(q => q.predicate.value === typePredicate && q.object.value === targetClass)
      .map(q => q.subject.value);
  } else {
    // Use all subjects with a type
    const typePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    subjects = [...new Set(
      dataQuads
        .filter(q => q.predicate.value === typePredicate)
        .map(q => q.subject.value)
    )];
  }
  
  if (subjects.length === 0) {
    throw new Error('No subjects found to extract');
  }
  
  reportProgress(message.id, 'parsing', 60, `Extracting ${subjects.length} subjects...`);
  
  // Get the lens for the target class
  const lensKey = targetClass || subjects[0];
  const lens = shapes.lenses[lensKey];
  
  if (!lens) {
    throw new Error(`No lens found for class: ${lensKey}. Available: ${Object.keys(shapes.lenses).join(', ')}`);
  }
  
  // Execute lens on subjects
  const results: any[] = [];
  const validationErrors: string[] = [];
  
  const subjectsToProcess = multiple ? subjects : subjects.slice(0, 1);
  
  for (let i = 0; i < subjectsToProcess.length; i++) {
    const subjectUri = subjectsToProcess[i];
    
    try {
      const result = lens.execute({ 
        id: namedNode(subjectUri), 
        quads: dataQuads 
      });
      results.push(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (validate) {
        validationErrors.push(`${subjectUri}: ${errorMsg}`);
      } else {
        console.warn(`Failed to extract ${subjectUri}:`, errorMsg);
      }
    }
    
    if (i % 100 === 0) {
      reportProgress(message.id, 'parsing', 60 + (i / subjectsToProcess.length) * 30, 
        `Extracted ${i}/${subjectsToProcess.length} subjects`);
    }
  }
  
  return {
    data: multiple ? results : results[0],
    count: results.length,
    subjects: subjectsToProcess,
    shapeClass: lensKey,
    duration: Date.now() - startTime,
    validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
  };
});

// ============================================================================
// Template Rendering Handler
// ============================================================================

handler.handle(MessageType.RENDER_TEMPLATE_REQUEST, async (payload: any) => {
  const { template, data, templateName } = payload;
  const startTime = Date.now();
  
  // Simple template rendering (lit-html would be better but requires more setup)
  // For now, do basic string interpolation
  let html = template;
  
  const renderData = Array.isArray(data) ? data : [data];
  
  // Render each item
  const rendered = renderData.map(item => {
    let result = template;
    
    // Replace ${data.field} patterns
    result = result.replace(/\$\{(?:data\.)?([^}]+)\}/g, (_, path) => {
      const value = getNestedValue(item, path);
      return value !== undefined ? String(value) : '';
    });
    
    // Replace {{field}} patterns (mustache-style)
    result = result.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = getNestedValue(item, path.trim());
      return value !== undefined ? String(value) : '';
    });
    
    return result;
  }).join('');
  
  return {
    html: rendered,
    duration: Date.now() - startTime,
  };
});

// ============================================================================
// Cache Handlers
// ============================================================================

handler.handle(MessageType.CACHE_GET_REQUEST, async (payload: any) => {
  const { key, namespace } = payload;
  const value = await cacheManager.get(key, 'memory', false);
  
  return {
    found: value !== undefined,
    value,
  };
});

handler.handle(MessageType.CACHE_SET_REQUEST, async (payload: any) => {
  const { key, value, ttl, namespace } = payload;
  await cacheManager.set(key, value, ttl, 'memory', false);
  
  return { success: true };
});

handler.handle(MessageType.CACHE_CLEAR_REQUEST, async () => {
  await cacheManager.clearAll();
  return { success: true };
});

// ============================================================================
// Helper Functions
// ============================================================================

function deserializeTerm(term: any): any {
  switch (term.termType) {
    case 'NamedNode':
      return namedNode(term.value);
    case 'Literal':
      if (term.language) {
        return DataFactory.literal(term.value, term.language);
      }
      if (term.datatype) {
        return DataFactory.literal(term.value, namedNode(term.datatype));
      }
      return DataFactory.literal(term.value);
    case 'BlankNode':
      return DataFactory.blankNode(term.value);
    case 'DefaultGraph':
      return DataFactory.defaultGraph();
    default:
      return namedNode(term.value);
  }
}

function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    
    // Handle array access
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      current = current[arrayName]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }
  
  return current;
}

// ============================================================================
// Start Worker
// ============================================================================

handler.start();
