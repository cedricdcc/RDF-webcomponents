/**
 * @fileoverview SPARQL endpoint client with subject resolution strategies
 * @module rdf-webcomponents/core/worker/sparql
 * 
 * This module provides comprehensive SPARQL endpoint integration with multiple
 * strategies for discovering and extracting RDF data.
 */

import type { Quad, Term, DataFactory as DataFactoryType } from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { 
  DataSourceStrategy,
  SerializedQuad,
  SparqlResults,
  SparqlBinding,
} from '../../../types';
import { serializeQuad, serializeTerm } from '../../../types';
import { parseRdf } from '../parsers';
import { generateRdfCacheKey } from '../../cache';

// ============================================================================
// Data Factory
// ============================================================================

const factory = new DataFactory();

// ============================================================================
// SPARQL Client Configuration
// ============================================================================

export interface SparqlClientConfig {
  /** SPARQL endpoint URL */
  endpoint: string;
  /** Default graph URI */
  defaultGraph?: string;
  /** Named graph URIs */
  namedGraphs?: string[];
  /** Custom HTTP headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of results */
  limit?: number;
}

/**
 * Subject resolution options
 */
export interface SubjectResolutionOptions {
  /** Direct subject URI */
  subject?: string;
  /** SPARQL query to discover subjects */
  subjectQuery?: string;
  /** Class URI to discover instances */
  subjectClass?: string;
  /** Maximum number of subjects to discover */
  limit?: number;
}

/**
 * CBD extraction options
 */
export interface CbdOptions {
  /** Subject URI to extract CBD for */
  subject: string;
  /** Maximum depth to traverse */
  depth?: number;
  /** Include inverse references */
  includeInverse?: boolean;
}

// ============================================================================
// SPARQL Client
// ============================================================================

export class SparqlClient {
  private config: Required<Omit<SparqlClientConfig, 'namedGraphs'>> & Pick<SparqlClientConfig, 'namedGraphs'>;

  constructor(config: SparqlClientConfig) {
    this.config = {
      endpoint: config.endpoint,
      defaultGraph: config.defaultGraph ?? '',
      headers: config.headers ?? {},
      timeout: config.timeout ?? 30000,
      limit: config.limit ?? 10000,
      namedGraphs: config.namedGraphs,
    };
  }

  /**
   * Executes a SPARQL query
   */
  async executeQuery(query: string, accept = 'application/sparql-results+json'): Promise<SparqlResults> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': accept,
          ...this.config.headers,
        },
        body: `query=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`SPARQL query timed out after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Executes a CONSTRUCT query and returns quads
   */
  async executeConstruct(query: string): Promise<Quad[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/turtle,application/n-triples,application/rdf+xml',
          ...this.config.headers,
        },
        body: `query=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`SPARQL CONSTRUCT failed: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      const contentType = response.headers.get('Content-Type') || 'text/turtle';
      
      // Determine format from content type
      let format: 'turtle' | 'n-triples' | 'rdf-xml' = 'turtle';
      if (contentType.includes('n-triples')) format = 'n-triples';
      if (contentType.includes('rdf+xml')) format = 'rdf-xml';
      
      const result = await parseRdf(content, format, this.config.endpoint);
      return result.quads;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`SPARQL CONSTRUCT timed out after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Executes a DESCRIBE query and returns quads
   */
  async executeDescribe(uri: string): Promise<Quad[]> {
    const query = `DESCRIBE <${uri}>`;
    return this.executeConstruct(query);
  }

  // ========================================================================
  // Subject Resolution Strategies
  // ========================================================================

  /**
   * Resolves subjects based on the specified strategy
   */
  async resolveSubjects(options: SubjectResolutionOptions): Promise<string[]> {
    // Direct subject
    if (options.subject) {
      return [options.subject];
    }
    
    // Custom query
    if (options.subjectQuery) {
      return this.resolveFromQuery(options.subjectQuery);
    }
    
    // Class-based discovery
    if (options.subjectClass) {
      return this.resolveFromClass(options.subjectClass, options.limit);
    }
    
    // Default: discover all subjects with rdf:type
    return this.discoverAllSubjects(options.limit);
  }

  /**
   * Resolves subjects from a custom query
   */
  private async resolveFromQuery(query: string): Promise<string[]> {
    const results = await this.executeQuery(query);
    const subjects: string[] = [];
    
    for (const binding of results.results.bindings) {
      // Look for ?s or ?subject variable
      const subject = binding.s || binding.subject;
      if (subject && subject.type === 'uri') {
        subjects.push(subject.value);
      }
    }
    
    return subjects;
  }

  /**
   * Resolves subjects from a class
   */
  private async resolveFromClass(classUri: string, limit?: number): Promise<string[]> {
    const query = `
      SELECT DISTINCT ?s WHERE {
        ?s a <${classUri}> .
      }
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await this.executeQuery(query);
    return results.results.bindings
      .filter(b => b.s?.type === 'uri')
      .map(b => b.s!.value);
  }

  /**
   * Discovers all typed subjects
   */
  private async discoverAllSubjects(limit?: number): Promise<string[]> {
    const query = `
      SELECT DISTINCT ?s WHERE {
        ?s a ?type .
      }
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await this.executeQuery(query);
    return results.results.bindings
      .filter(b => b.s?.type === 'uri')
      .map(b => b.s!.value);
  }

  // ========================================================================
  // Data Extraction Strategies
  // ========================================================================

  /**
   * Extracts data using the specified strategy
   */
  async extractData(
    strategy: DataSourceStrategy,
    options: {
      subject?: string;
      subjectQuery?: string;
      subjectClass?: string;
      depth?: number;
      graph?: string;
      limit?: number;
    } = {}
  ): Promise<Quad[]> {
    switch (strategy) {
      case 'sparql':
        return this.extractFromSubjects(options);
        
      case 'cbd':
        if (!options.subject) {
          throw new Error('CBD strategy requires a subject URI');
        }
        return this.extractCbd({
          subject: options.subject,
          depth: options.depth ?? 2,
        });
        
      case 'graph':
        return this.extractGraph(options.graph);
        
      case 'file':
      default:
        throw new Error(`Strategy '${strategy}' not supported for SPARQL endpoint`);
    }
  }

  /**
   * Extracts data for multiple subjects
   */
  private async extractFromSubjects(options: SubjectResolutionOptions): Promise<Quad[]> {
    const subjects = await this.resolveSubjects(options);
    const allQuads: Quad[] = [];
    
    // Extract data for each subject (with reasonable limit)
    const maxSubjects = Math.min(subjects.length, this.config.limit);
    
    for (let i = 0; i < maxSubjects; i++) {
      const subject = subjects[i];
      const quads = await this.executeDescribe(subject);
      allQuads.push(...quads);
    }
    
    return allQuads;
  }

  /**
   * Extracts Concise Bounded Description (CBD)
   */
  async extractCbd(options: CbdOptions): Promise<Quad[]> {
    const { subject, depth = 2, includeInverse = false } = options;
    
    // Build CBD query
    const query = this.buildCbdQuery(subject, depth, includeInverse);
    return this.executeConstruct(query);
  }

  /**
   * Builds a CBD CONSTRUCT query
   */
  private buildCbdQuery(subject: string, depth: number, includeInverse: boolean): string {
    const lines: string[] = [];
    
    // Base case: direct properties
    lines.push(`CONSTRUCT {`);
    lines.push(`  <${subject}> ?p ?o .`);
    
    // Add blank node traversal
    for (let i = 1; i <= depth; i++) {
      const indent = '  '.repeat(i + 1);
      lines.push(`${indent}?o${i - 1} ?p${i} ?o${i} .`);
    }
    
    lines.push(`} WHERE {`);
    lines.push(`  <${subject}> ?p ?o .`);
    
    // Add blank node traversal with filtering
    for (let i = 1; i <= depth; i++) {
      const indent = '  '.repeat(i + 1);
      const prevVar = i === 1 ? 'o' : `o${i - 1}`;
      lines.push(`${indent}OPTIONAL {`);
      lines.push(`${indent}  ?${prevVar} ?p${i} ?o${i} .`);
      lines.push(`${indent}  FILTER(isBlank(?${prevVar}))`);
      lines.push(`${indent}}`);
    }
    
    // Include inverse references if requested
    if (includeInverse) {
      lines.push(`  OPTIONAL { ?inverseSubject ?inversePredicate <${subject}> }`);
    }
    
    lines.push(`}`);
    
    return lines.join('\n');
  }

  /**
   * Extracts all triples from a named graph
   */
  async extractGraph(graphUri?: string): Promise<Quad[]> {
    const graphClause = graphUri ? `FROM <${graphUri}>` : '';
    const query = `
      CONSTRUCT { ?s ?p ?o }
      WHERE {
        ${graphClause}
        ?s ?p ?o .
      }
      LIMIT ${this.config.limit}
    `;
    
    return this.executeConstruct(query);
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Gets the endpoint capabilities
   */
  async getCapabilities(): Promise<{
    supportsSelect: boolean;
    supportsConstruct: boolean;
    supportsDescribe: boolean;
    supportsAsk: boolean;
    supportsUpdate: boolean;
  }> {
    // Simple capability detection
    try {
      await this.executeQuery('SELECT * WHERE { ?s ?p ?o } LIMIT 1');
      return {
        supportsSelect: true,
        supportsConstruct: true,
        supportsDescribe: true,
        supportsAsk: true,
        supportsUpdate: false,
      };
    } catch {
      return {
        supportsSelect: false,
        supportsConstruct: false,
        supportsDescribe: false,
        supportsAsk: false,
        supportsUpdate: false,
      };
    }
  }

  /**
   * Gets all classes in the endpoint
   */
  async getClasses(): Promise<string[]> {
    const query = `
      SELECT DISTINCT ?class WHERE {
        ?s a ?class .
        FILTER(isIRI(?class))
      }
      ORDER BY ?class
    `;
    
    const results = await this.executeQuery(query);
    return results.results.bindings
      .filter(b => b.class?.type === 'uri')
      .map(b => b.class!.value);
  }

  /**
   * Gets all predicates used in the endpoint
   */
  async getPredicates(): Promise<string[]> {
    const query = `
      SELECT DISTINCT ?p WHERE {
        ?s ?p ?o .
        FILTER(isIRI(?p))
      }
      ORDER BY ?p
      LIMIT 1000
    `;
    
    const results = await this.executeQuery(query);
    return results.results.bindings
      .filter(b => b.p?.type === 'uri')
      .map(b => b.p!.value);
  }
}

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Builds a SELECT query for subject discovery
 */
export function buildSubjectDiscoveryQuery(options: {
  classUri?: string;
  property?: string;
  value?: string;
  limit?: number;
}): string {
  const clauses: string[] = [];
  
  if (options.classUri) {
    clauses.push(`?s a <${options.classUri}> .`);
  }
  
  if (options.property && options.value) {
    clauses.push(`?s <${options.property}> "${options.value}" .`);
  }
  
  if (clauses.length === 0) {
    clauses.push('?s a ?type .');
  }
  
  return `
    SELECT DISTINCT ?s WHERE {
      ${clauses.join('\n      ')}
    }
    ${options.limit ? `LIMIT ${options.limit}` : ''}
  `;
}

/**
 * Builds a CONSTRUCT query for CBD
 */
export function buildCbdConstructQuery(subject: string, depth = 2): string {
  return `
    CONSTRUCT {
      <${subject}> ?p ?o .
      ?bnode1 ?p1 ?o1 .
      ?bnode2 ?p2 ?o2 .
    }
    WHERE {
      <${subject}> ?p ?o .
      OPTIONAL {
        FILTER(isBlank(?o))
        BIND(?o AS ?bnode1)
        ?bnode1 ?p1 ?o1 .
        OPTIONAL {
          FILTER(isBlank(?o1))
          BIND(?o1 AS ?bnode2)
          ?bnode2 ?p2 ?o2 .
        }
      }
    }
  `;
}

/**
 * Builds a query for class instances
 */
export function buildClassInstancesQuery(classUri: string, limit?: number): string {
  return `
    SELECT ?s WHERE {
      ?s a <${classUri}> .
    }
    ${limit ? `LIMIT ${limit}` : ''}
  `;
}

// ============================================================================
// SPARQL Results to Quads Converter
// ============================================================================

/**
 * Converts SPARQL JSON results to Quads
 */
export function sparqlResultsToQuads(
  results: SparqlResults,
  resultBaseIri: string = 'http://example.org/result/'
): Quad[] {
  const quads: Quad[] = [];
  
  for (let i = 0; i < results.results.bindings.length; i++) {
    const binding = results.results.bindings[i];
    const subjectNode = factory.blankNode(`result${i}`);
    
    for (const varName of results.head.vars) {
      const value = binding[varName];
      if (!value) continue;
      
      const predicateNode = factory.namedNode(resultBaseIri + varName);
      let objectNode: Term;
      
      switch (value.type) {
        case 'uri':
          objectNode = factory.namedNode(value.value);
          break;
        case 'bnode':
          objectNode = factory.blankNode(value.value);
          break;
        case 'literal':
          if (value['xml:lang']) {
            objectNode = factory.literal(value.value, value['xml:lang']);
          } else if (value.datatype) {
            objectNode = factory.literal(
              value.value,
              factory.namedNode(value.datatype)
            );
          } else {
            objectNode = factory.literal(value.value);
          }
          break;
        default:
          continue;
      }
      
      quads.push(factory.quad(subjectNode, predicateNode, objectNode));
    }
  }
  
  return quads;
}
