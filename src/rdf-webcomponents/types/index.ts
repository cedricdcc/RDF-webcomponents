/**
 * @fileoverview Core type definitions for RDF Web Components
 * @module rdf-webcomponents/types
 * 
 * This module defines all the TypeScript interfaces and types used throughout
 * the RDF Web Components library, including message protocols, data structures,
 * and component properties.
 */

import type { Quad, Term, NamedNode, Literal, BlankNode, DefaultGraph } from '@rdfjs/types';

// ============================================================================
// RDF Core Types
// ============================================================================

/**
 * Represents an RDF triple/quad with subject, predicate, object, and optional graph
 */
export type RdfQuad = Quad;

/**
 * RDF Term types
 */
export type RdfTerm = Term;
export type RdfNamedNode = NamedNode;
export type RdfLiteral = Literal;
export type RdfBlankNode = BlankNode;
export type RdfDefaultGraph = DefaultGraph;

/**
 * A collection of RDF quads representing a triplestore
 */
export type TripleStore = Quad[];

/**
 * Supported RDF serialization formats
 */
export type RdfFormat = 
  | 'turtle' 
  | 'n-triples' 
  | 'n-quads' 
  | 'rdf-xml' 
  | 'json-ld' 
  | 'rdfa'
  | 'sparql-results';

/**
 * Data source strategies
 */
export type DataSourceStrategy = 
  | 'file'      // Static RDF file
  | 'sparql'    // SPARQL endpoint
  | 'cbd';      // Concise Bounded Description

// ============================================================================
// Worker Message Protocol
// ============================================================================

/**
 * Base message structure for worker communication
 */
export interface WorkerMessage<T = unknown> {
  /** Unique message identifier for request/response correlation */
  id: string;
  /** Message type identifier */
  type: string;
  /** Message payload */
  payload: T;
  /** Timestamp when message was created */
  timestamp: number;
}

/**
 * Message types for worker communication
 */
export enum MessageType {
  // Adapter messages
  FETCH_REQUEST = 'FETCH_REQUEST',
  FETCH_RESPONSE = 'FETCH_RESPONSE',
  FETCH_ERROR = 'FETCH_ERROR',
  FETCH_PROGRESS = 'FETCH_PROGRESS',
  
  // Parse messages
  PARSE_REQUEST = 'PARSE_REQUEST',
  PARSE_RESPONSE = 'PARSE_RESPONSE',
  PARSE_ERROR = 'PARSE_ERROR',
  PARSE_PROGRESS = 'PARSE_PROGRESS',
  
  // Query messages
  QUERY_REQUEST = 'QUERY_REQUEST',
  QUERY_RESPONSE = 'QUERY_RESPONSE',
  QUERY_ERROR = 'QUERY_ERROR',
  
  // Shape extraction messages
  EXTRACT_SHAPES_REQUEST = 'EXTRACT_SHAPES_REQUEST',
  EXTRACT_SHAPES_RESPONSE = 'EXTRACT_SHAPES_RESPONSE',
  EXTRACT_SHAPES_ERROR = 'EXTRACT_SHAPES_ERROR',
  
  // Lens execution messages
  EXECUTE_LENS_REQUEST = 'EXECUTE_LENS_REQUEST',
  EXECUTE_LENS_RESPONSE = 'EXECUTE_LENS_RESPONSE',
  EXECUTE_LENS_ERROR = 'EXECUTE_LENS_ERROR',
  
  // Template rendering messages
  RENDER_TEMPLATE_REQUEST = 'RENDER_TEMPLATE_REQUEST',
  RENDER_TEMPLATE_RESPONSE = 'RENDER_TEMPLATE_RESPONSE',
  RENDER_TEMPLATE_ERROR = 'RENDER_TEMPLATE_ERROR',
  
  // Cache messages
  CACHE_GET_REQUEST = 'CACHE_GET_REQUEST',
  CACHE_GET_RESPONSE = 'CACHE_GET_RESPONSE',
  CACHE_SET_REQUEST = 'CACHE_SET_REQUEST',
  CACHE_SET_RESPONSE = 'CACHE_SET_RESPONSE',
  CACHE_CLEAR_REQUEST = 'CACHE_CLEAR_REQUEST',
  CACHE_CLEAR_RESPONSE = 'CACHE_CLEAR_RESPONSE',
  
  // Worker lifecycle
  WORKER_READY = 'WORKER_READY',
  WORKER_ERROR = 'WORKER_ERROR',
}

// ============================================================================
// Fetch Messages
// ============================================================================

/**
 * Request to fetch RDF data from a URL
 */
export interface FetchRequestPayload {
  /** URL to fetch RDF data from */
  url: string;
  /** Expected RDF format (auto-detected if not specified) */
  format?: RdfFormat;
  /** Data source strategy */
  strategy: DataSourceStrategy;
  
  // SPARQL-specific options
  /** SPARQL query to execute */
  query?: string;
  /** Subject URI for CBD extraction */
  subject?: string;
  /** Depth for CBD traversal */
  depth?: number;
  /** Custom headers for the request */
  headers?: Record<string, string>;
}

/**
 * Response from a fetch operation
 */
export interface FetchResponsePayload {
  /** Original request URL */
  url: string;
  /** Raw content (if applicable) */
  content?: string;
  /** Detected or specified format */
  format: RdfFormat;
  /** Parsed quads */
  quads: SerializedQuad[];
  /** Number of quads parsed */
  quadCount: number;
  /** Time taken to fetch and parse (ms) */
  duration: number;
  /** Cache key for this data */
  cacheKey: string;
  /** Whether result was from cache */
  fromCache: boolean;
}

/**
 * Progress update during fetch/parse operation
 */
export interface FetchProgressPayload {
  /** Current phase of operation */
  phase: 'fetching' | 'parsing' | 'building';
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  message: string;
}

// ============================================================================
// Query Messages
// ============================================================================

/**
 * Request to execute a SPARQL query
 */
export interface QueryRequestPayload {
  /** SPARQL endpoint URL */
  endpoint: string;
  /** SPARQL query string */
  query: string;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * Response from a SPARQL query
 */
export interface QueryResponsePayload {
  /** Query results */
  results: SparqlResults;
  /** Time taken to execute query (ms) */
  duration: number;
}

/**
 * SPARQL query results structure
 */
export interface SparqlResults {
  /** Variable names */
  head: {
    vars: string[];
  };
  /** Result bindings */
  results: {
    bindings: Record<string, SparqlBinding>;
  };
}

/**
 * SPARQL result binding
 */
export interface SparqlBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  datatype?: string;
  'xml:lang'?: string;
}

// ============================================================================
// Shape Extraction Messages
// ============================================================================

/**
 * Request to extract SHACL shapes from quads
 */
export interface ExtractShapesRequestPayload {
  /** Quads containing SHACL shape definitions */
  quads: SerializedQuad[];
  /** Custom apply functions (serialized) */
  customApply?: Record<string, string>;
}

/**
 * Response from shape extraction
 */
export interface ExtractShapesResponsePayload {
  /** Extracted shape definitions */
  shapes: SerializedShape[];
  /** Available lens keys (class URIs) */
  lensKeys: string[];
  /** Time taken to extract shapes (ms) */
  duration: number;
}

/**
 * Serialized SHACL shape definition
 */
export interface SerializedShape {
  /** Shape identifier */
  id: string;
  /** Target class */
  ty: string;
  /** Shape description */
  description?: string;
  /** Shape fields */
  fields: SerializedShapeField[];
}

/**
 * Serialized shape field
 */
export interface SerializedShapeField {
  /** Field name */
  name: string;
  /** Predicate path */
  path: string;
  /** Minimum cardinality */
  minCount?: number;
  /** Maximum cardinality */
  maxCount?: number;
  /** Datatype IRI */
  datatype?: string;
  /** Class IRI for nested objects */
  class?: string;
}

// ============================================================================
// Lens Execution Messages
// ============================================================================

/**
 * Request to execute a lens on RDF data
 */
export interface ExecuteLensRequestPayload {
  /** Quads to process */
  quads: SerializedQuad[];
  /** Shape quads (if not already cached) */
  shapeQuads?: SerializedQuad[];
  /** Target class URI */
  targetClass?: string;
  /** Specific subject URI to extract */
  subject?: string;
  /** Whether to extract all matching subjects */
  multiple?: boolean;
  /** Shape cache key */
  shapeCacheKey?: string;
}

/**
 * Response from lens execution
 */
export interface ExecuteLensResponsePayload {
  /** Extracted data objects */
  data: unknown[] | unknown;
  /** Number of items extracted */
  count: number;
  /** Subject URIs that were processed */
  subjects: string[];
  /** Shape that was used */
  shapeClass: string;
  /** Time taken to execute (ms) */
  duration: number;
}

// ============================================================================
// Template Rendering Messages
// ============================================================================

/**
 * Request to render a template with data
 */
export interface RenderTemplateRequestPayload {
  /** Template content (lit-html format) */
  template: string;
  /** Data to render */
  data: unknown | unknown[];
  /** Template name for caching */
  templateName?: string;
}

/**
 * Response from template rendering
 */
export interface RenderTemplateResponsePayload {
  /** Rendered HTML string */
  html: string;
  /** Time taken to render (ms) */
  duration: number;
}

// ============================================================================
// Cache Messages
// ============================================================================

/**
 * Request to get item from cache
 */
export interface CacheGetRequestPayload {
  /** Cache key */
  key: string;
  /** Cache namespace */
  namespace?: string;
}

/**
 * Response from cache get
 */
export interface CacheGetResponsePayload {
  /** Whether item was found */
  found: boolean;
  /** Cached value (if found) */
  value?: SerializedQuad[] | unknown;
  /** Age of cached item (ms) */
  age?: number;
}

/**
 * Request to set item in cache
 */
export interface CacheSetRequestPayload {
  /** Cache key */
  key: string;
  /** Value to cache */
  value: SerializedQuad[] | unknown;
  /** Time-to-live in seconds */
  ttl?: number;
  /** Cache namespace */
  namespace?: string;
}

// ============================================================================
// Serialization Helpers
// ============================================================================

/**
 * Serialized RDF quad for postMessage transfer
 */
export interface SerializedQuad {
  subject: SerializedTerm;
  predicate: SerializedTerm;
  object: SerializedTerm;
  graph?: SerializedTerm;
}

/**
 * Serialized RDF term for postMessage transfer
 */
export interface SerializedTerm {
  termType: 'NamedNode' | 'Literal' | 'BlankNode' | 'DefaultGraph' | 'Variable';
  value: string;
  datatype?: string;
  language?: string;
}

/**
 * Serializes an RDF quad for postMessage transfer
 */
export function serializeQuad(quad: Quad): SerializedQuad {
  return {
    subject: serializeTerm(quad.subject),
    predicate: serializeTerm(quad.predicate),
    object: serializeTerm(quad.object),
    graph: quad.graph ? serializeTerm(quad.graph) : undefined,
  };
}

/**
 * Serializes an RDF term for postMessage transfer
 */
export function serializeTerm(term: Term): SerializedTerm {
  const serialized: SerializedTerm = {
    termType: term.termType,
    value: term.value,
  };
  
  if (term.termType === 'Literal') {
    if (term.datatype) {
      serialized.datatype = term.datatype.value;
    }
    if (term.language) {
      serialized.language = term.language;
    }
  }
  
  return serialized;
}

// ============================================================================
// Component Properties
// ============================================================================

/**
 * Properties for the source-rdf component
 */
export interface SourceRdfProps {
  // Data source
  /** Optional URL to RDF data or SPARQL endpoint (overrides srdf:url in config). */
  url?: string;

  /** Inline RDF config content in the source-rdf vocabulary. */
  config?: string;
}

/**
 * Properties for the rdf-lens component
 */
export interface RdfLensProps {
  /** Inline RDF config content in the rdf-lens vocabulary. */
  config?: string;
}

/**
 * Properties for the lens-display component
 */
export interface LensDisplayProps {
  // Template
  /** URL to template file */
  template?: string;

  /** Inline RDF config content in the lens-display vocabulary (property use). */
  config?: string;
  
  // Styling configured through config RDF
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Event detail for triplestore-ready event
 */
export interface TriplestoreReadyEvent {
  /** Number of quads loaded */
  quadCount: number;
  /** Source URL */
  url: string;
  /** Whether data came from cache */
  fromCache: boolean;
  /** Time taken to load (ms) */
  duration: number;
}

/**
 * Event detail for shape-processed event
 */
export interface ShapeProcessedEvent {
  /** Extracted data */
  data: unknown | unknown[];
  /** Shape class used */
  shapeClass: string;
  /** Number of items extracted */
  count: number;
  /** Time taken (ms) */
  duration: number;
}

/**
 * Event detail for render-complete event
 */
export interface RenderCompleteEvent {
  /** Rendered HTML */
  html: string;
  /** Data that was rendered */
  data: unknown | unknown[];
  /** Time taken (ms) */
  duration: number;
}

/**
 * Event detail for error events
 */
export interface ErrorEvent {
  /** Error message */
  message: string;
  /** Error phase */
  phase: 'fetch' | 'parse' | 'shape' | 'extract' | 'render' | 'config';
  /** Original error */
  error?: Error;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Common RDF namespace prefixes
 */
export const RDF_PREFIXES: Record<string, string> = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  sh: 'http://www.w3.org/ns/shacl#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dct: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  dbo: 'http://dbpedia.org/ontology/',
  dbr: 'http://dbpedia.org/resource/',
  schema: 'http://schema.org/',
};

/**
 * Default cache TTL in seconds (1 hour)
 */
export const DEFAULT_CACHE_TTL = 3600;

/**
 * Maximum cache size (number of entries)
 */
export const MAX_CACHE_SIZE = 1000;

/**
 * Worker message timeout in milliseconds
 */
export const WORKER_TIMEOUT = 60000;
