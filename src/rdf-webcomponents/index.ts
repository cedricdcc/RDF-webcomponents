/**
 * @fileoverview RDF Web Components - Main Entry Point
 * @module rdf-webcomponents
 * 
 * A collection of Web Components for working with RDF data:
 * 
 * - `<source-rdf>` - Fetches and parses RDF data from various sources
 * - `<rdf-lens>` - Extracts structured data using SHACL shapes
 * - `<lens-display>` - Renders data using HTML templates
 * - `<link-orchestration>` - Scans links and mounts RDF pipeline by rule
 * 
 * @example Basic Usage
 * ```html
 * <!DOCTYPE html>
 * <html>
 * <head>
 *   <script type="module" src="https://cdn.example.com/rdf-webcomponents.js"></script>
 * </head>
 * <body>
 *   <lens-display template="person-card.html">
 *     <rdf-lens config='@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
 * [] a lrdf:RdfLensConfig ;
 *   lrdf:shapeFile "shapes.ttl" ;
 *   lrdf:shapeClass "Person" .'>
 *       <source-rdf url="data.ttl"></source-rdf>
 *     </rdf-lens>
 *   </lens-display>
 * </body>
 * </html>
 * ```
 * 
 * @example SPARQL Endpoint
 * ```html
 * <lens-display template="card.html">
 *   <rdf-lens config='@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
 * [] a lrdf:RdfLensConfig ;
 *   lrdf:shapeFile "shapes.ttl" ;
 *   lrdf:shapeClass "Person" ;
 *   lrdf:multiple true .'>
 *     <source-rdf 
 *       url="https://dbpedia.org/sparql"
 *       config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
 * [] a srdf:SourceRdfConfig ;
 *   srdf:strategy "sparql" ;
 *   srdf:subjectClass <http://dbpedia.org/ontology/Person> .'
 *     ></source-rdf>
 *   </rdf-lens>
 * </lens-display>
 * ```
 * 
 * @packageDocumentation
 */

// ============================================================================
// Component Exports
// ============================================================================

export { SourceRdf } from './components/source-rdf';
export { RdfLens } from './components/rdf-lens';
export { LensDisplay } from './components/lens-display';
export { LinkOrchestration } from './components/link-orchestration';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  SourceRdfProps,
  RdfLensProps,
  LensDisplayProps,
  RdfFormat,
  DataSourceStrategy,
  SerializedQuad,
  SerializedTerm,
  TriplestoreReadyEvent,
  ShapeProcessedEvent,
  RenderCompleteEvent,
  ErrorEvent as RdfErrorEvent,
} from './types';

export { MessageType } from './types';

// ============================================================================
// Core Exports (for advanced usage)
// ============================================================================

export { CacheManager, LRUCache, LocalStorageCache, IndexedDBCache } from './core/cache';
export { WorkerMessenger, WorkerMessageHandler } from './core/protocol';
export { parseRdf, detectFormat, getAcceptHeader } from './core/worker/parsers';
export { SparqlClient } from './core/worker/sparql';

// ============================================================================
// Auto-Registration
// ============================================================================

// Components are automatically registered via @customElement decorators
// when this module is imported.

// Log registration
if (typeof window !== 'undefined') {
  console.log('[RDF WebComponents] Components registered:', {
    'source-rdf': customElements.get('source-rdf') ? '✓' : '✗',
    'rdf-lens': customElements.get('rdf-lens') ? '✓' : '✗',
    'lens-display': customElements.get('lens-display') ? '✓' : '✗',
    'link-orchestration': customElements.get('link-orchestration') ? '✓' : '✗',
  });
}
