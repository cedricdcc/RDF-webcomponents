/**
 * @fileoverview RDF format parsers for all supported formats
 * @module rdf-webcomponents/core/worker/parsers
 * 
 * This module provides parsers for:
 * - Turtle (.ttl)
 * - N-Triples (.nt)
 * - N-Quads (.nq)
 * - RDF/XML (.rdf, .xml)
 * - JSON-LD (.json, .jsonld)
 * - RDFa (embedded in HTML)
 */

import { Parser as N3Parser } from 'n3';
import { RdfXmlParser } from 'rdfxml-streaming-parser';
import { JsonLdParser } from 'jsonld-streaming-parser';
import { RdfaParser } from 'rdfa-streaming-parser';
import type { Quad, Term, DataFactory as DataFactoryType } from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { RdfFormat, SerializedQuad } from '../../../types';
import { serializeQuad } from '../../../types';

// ============================================================================
// Data Factory
// ============================================================================

const factory = new DataFactory();

// ============================================================================
// Parser Result Types
// ============================================================================

export interface ParseResult {
  quads: Quad[];
  format: RdfFormat;
  errors: ParseError[];
  warnings: string[];
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  context?: string;
}

export interface ParseProgress {
  phase: 'parsing' | 'building';
  progress: number;
  message: string;
  quadCount: number;
}

// ============================================================================
// Format Detection
// ============================================================================

/**
 * Detects RDF format from URL or content
 */
export function detectFormat(url: string, content?: string): RdfFormat {
  // Try to detect from URL extension
  const urlLower = url.toLowerCase();
  
  if (urlLower.endsWith('.ttl')) return 'turtle';
  if (urlLower.endsWith('.nt')) return 'n-triples';
  if (urlLower.endsWith('.nq') || urlLower.endsWith('.nquads')) return 'n-quads';
  if (urlLower.endsWith('.rdf') || urlLower.endsWith('.owl')) return 'rdf-xml';
  if (urlLower.endsWith('.jsonld') || urlLower.endsWith('.json')) return 'json-ld';
  
  // SPARQL endpoints
  if (url.includes('sparql') || url.includes('query')) {
    return 'sparql-results';
  }
  
  // Try to detect from content
  if (content) {
    const trimmed = content.trim();
    
    // JSON-LD detection
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const json = JSON.parse(trimmed);
        if (json['@context'] || json['@graph'] || json['@id'] || Array.isArray(json)) {
          return 'json-ld';
        }
      } catch {
        // Not valid JSON
      }
    }
    
    // RDF/XML detection
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<rdf:RDF')) {
      return 'rdf-xml';
    }
    
    // Turtle/N-Triples detection
    if (trimmed.startsWith('@prefix') || trimmed.startsWith('@base') || trimmed.startsWith('PREFIX')) {
      return 'turtle';
    }
    
    // N-Triples/N-Quads (simple subject predicate object format)
    const lines = trimmed.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    if (lines.length > 0) {
      const firstLine = lines[0];
      // N-Quads has 4 terms, N-Triples has 3
      const uriCount = (firstLine.match(/<[^>]+>/g) || []).length;
      if (uriCount >= 3) {
        if (uriCount >= 4) return 'n-quads';
        return 'n-triples';
      }
    }
  }
  
  // Default to Turtle
  return 'turtle';
}

/**
 * Gets the MIME type for a format
 */
export function getMimeType(format: RdfFormat): string {
  const mimeTypes: Record<RdfFormat, string> = {
    'turtle': 'text/turtle',
    'n-triples': 'application/n-triples',
    'n-quads': 'application/n-quads',
    'rdf-xml': 'application/rdf+xml',
    'json-ld': 'application/ld+json',
    'rdfa': 'text/html',
    'sparql-results': 'application/sparql-results+json',
  };
  return mimeTypes[format] || 'text/turtle';
}

/**
 * Gets the Accept header value for a format
 */
export function getAcceptHeader(format?: RdfFormat): string {
  if (format) {
    return getMimeType(format);
  }
  
  // Accept all RDF formats
  return [
    'text/turtle',
    'application/n-triples',
    'application/n-quads',
    'application/rdf+xml',
    'application/ld+json',
    'application/sparql-results+json',
    'application/sparql-results+xml',
  ].join(', ');
}

// ============================================================================
// Turtle/N-Triples/N-Quads Parser (N3)
// ============================================================================

/**
 * Parses Turtle, N-Triples, or N-Quads content
 */
export function parseN3(
  content: string,
  format: 'turtle' | 'n-triples' | 'n-quads' = 'turtle',
  onProgress?: (progress: ParseProgress) => void
): Promise<ParseResult> {
  return new Promise((resolve) => {
    const quads: Quad[] = [];
    const errors: ParseError[] = [];
    const warnings: string[] = [];

    const parser = new N3Parser({
      format,
      blankNodePrefix: '_:',
    });

    let quadCount = 0;
    const totalLines = content.split('\n').length;

    // N3.Parser uses a callback-based API — NOT an EventEmitter.
    // The callback is called with (error, quad, prefixes);
    // when quad is null parsing is complete.
    parser.parse(content, (error: Error | null, quad: Quad | null) => {
      if (error) {
        errors.push({ message: error.message });
        // N3 stops on error; resolve what we have
        resolve({ quads, format, errors, warnings });
      } else if (quad) {
        quads.push(quad);
        quadCount++;
        if (onProgress && quadCount % 1000 === 0) {
          onProgress({
            phase: 'parsing',
            progress: Math.min(90, (quadCount / Math.max(1, totalLines)) * 100),
            message: `Parsed ${quadCount} triples`,
            quadCount,
          });
        }
      } else {
        // quad === null → parsing complete
        resolve({ quads, format, errors, warnings });
      }
    });
  });
}

// ============================================================================
// RDF/XML Parser
// ============================================================================

/**
 * Parses RDF/XML content
 */
export function parseRdfXml(
  content: string,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParseResult> {
  return new Promise((resolve) => {
    const quads: Quad[] = [];
    const errors: ParseError[] = [];
    const warnings: string[] = [];
    
    const parser = new RdfXmlParser({
      dataFactory: factory as unknown as DataFactoryType,
    });
    
    let quadCount = 0;
    
    parser.on('data', (quad: Quad) => {
      quads.push(quad);
      quadCount++;
      
      if (onProgress && quadCount % 1000 === 0) {
        onProgress({
          phase: 'parsing',
          progress: 90,
          message: `Parsed ${quadCount} triples`,
          quadCount,
        });
      }
    });
    
    parser.on('error', (error: Error) => {
      errors.push({
        message: error.message,
      });
    });
    
    parser.on('end', () => {
      resolve({
        quads,
        format: 'rdf-xml',
        errors,
        warnings,
      });
    });
    
    // Write content to parser
    parser.write(content);
    parser.end();
  });
}

// ============================================================================
// JSON-LD Parser
// ============================================================================

/**
 * Parses JSON-LD content
 */
export function parseJsonLd(
  content: string,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParseResult> {
  return new Promise((resolve) => {
    const quads: Quad[] = [];
    const errors: ParseError[] = [];
    const warnings: string[] = [];
    
    const parser = new JsonLdParser({
      dataFactory: factory as unknown as DataFactoryType,
    });
    
    let quadCount = 0;
    
    parser.on('data', (quad: Quad) => {
      quads.push(quad);
      quadCount++;
      
      if (onProgress && quadCount % 1000 === 0) {
        onProgress({
          phase: 'parsing',
          progress: 90,
          message: `Parsed ${quadCount} triples`,
          quadCount,
        });
      }
    });
    
    parser.on('error', (error: Error) => {
      errors.push({
        message: error.message,
      });
    });
    
    parser.on('end', () => {
      resolve({
        quads,
        format: 'json-ld',
        errors,
        warnings,
      });
    });
    
    // Write content to parser
    parser.write(content);
    parser.end();
  });
}

// ============================================================================
// RDFa Parser
// ============================================================================

/**
 * Parses RDFa content from HTML
 */
export function parseRdfa(
  content: string,
  baseUrl: string,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParseResult> {
  return new Promise((resolve) => {
    const quads: Quad[] = [];
    const errors: ParseError[] = [];
    const warnings: string[] = [];
    
    const parser = new RdfaParser({
      dataFactory: factory as unknown as DataFactoryType,
      baseIRI: baseUrl,
    });
    
    let quadCount = 0;
    
    parser.on('data', (quad: Quad) => {
      quads.push(quad);
      quadCount++;
      
      if (onProgress && quadCount % 100 === 0) {
        onProgress({
          phase: 'parsing',
          progress: 90,
          message: `Parsed ${quadCount} triples`,
          quadCount,
        });
      }
    });
    
    parser.on('error', (error: Error) => {
      errors.push({
        message: error.message,
      });
    });
    
    parser.on('end', () => {
      resolve({
        quads,
        format: 'rdfa',
        errors,
        warnings,
      });
    });
    
    // Write content to parser
    parser.write(content);
    parser.end();
  });
}

// ============================================================================
// Unified Parser
// ============================================================================

/**
 * Parses RDF content in any supported format
 */
export async function parseRdf(
  content: string,
  format: RdfFormat,
  baseUrl?: string,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParseResult> {
  onProgress?.({
    phase: 'parsing',
    progress: 0,
    message: `Starting ${format} parsing`,
    quadCount: 0,
  });
  
  let result: ParseResult;
  
  switch (format) {
    case 'turtle':
    case 'n-triples':
    case 'n-quads':
      result = await parseN3(content, format, onProgress);
      break;
      
    case 'rdf-xml':
      result = await parseRdfXml(content, onProgress);
      break;
      
    case 'json-ld':
      result = await parseJsonLd(content, onProgress);
      break;
      
    case 'rdfa':
      result = await parseRdfa(content, baseUrl || 'http://example.org/', onProgress);
      break;
      
    case 'sparql-results':
      // SPARQL results are handled separately
      throw new Error('SPARQL results should be parsed with parseSparqlResults');
      
    default:
      // Try to parse as Turtle
      result = await parseN3(content, 'turtle', onProgress);
  }
  
  onProgress?.({
    phase: 'building',
    progress: 100,
    message: `Parsed ${result.quads.length} triples`,
    quadCount: result.quads.length,
  });
  
  return result;
}

/**
 * Serializes quads to a serialized format for postMessage
 */
export function serializeQuads(quads: Quad[]): SerializedQuad[] {
  return quads.map(serializeQuad);
}

// ============================================================================
// SPARQL Results Parser
// ============================================================================

/**
 * Parses SPARQL JSON results
 */
export interface SparqlResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: Record<string, {
      type: 'uri' | 'literal' | 'bnode';
      value: string;
      datatype?: string;
      'xml:lang'?: string;
    }>;
  }[];
}

export function parseSparqlResults(content: string): SparqlResult {
  return JSON.parse(content);
}

/**
 * Converts SPARQL results to quads
 */
export function sparqlResultsToQuads(
  results: SparqlResult,
  baseUrl: string = 'http://example.org/result/'
): Quad[] {
  const quads: Quad[] = [];
  
  for (let i = 0; i < results.results.bindings.length; i++) {
    const binding = results.results.bindings[i];
    const subjectNode = factory.blankNode(`result${i}`);
    
    for (const varName of results.head.vars) {
      const value = binding[varName];
      if (!value) continue;
      
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
            objectNode = factory.literal(value.value, factory.namedNode(value.datatype));
          } else {
            objectNode = factory.literal(value.value);
          }
          break;
        default:
          continue;
      }
      
      quads.push(
        factory.quad(
          subjectNode,
          factory.namedNode(baseUrl + varName),
          objectNode
        )
      );
    }
  }
  
  return quads;
}
