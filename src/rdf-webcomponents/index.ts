/**
 * @fileoverview RDF Web Components - Main Entry Point
 * @module rdf-webcomponents
 * 
 * A collection of Web Components for working with RDF data:
 * 
 * - `<rdf-adapter>` - Fetches and parses RDF data from various sources
 * - `<rdf-lens>` - Extracts structured data using SHACL shapes
 * - `<lens-display>` - Renders data using HTML templates
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
 *     <rdf-lens shape-file="shapes.ttl" shape-class="Person">
 *       <rdf-adapter url="data.ttl"></rdf-adapter>
 *     </rdf-lens>
 *   </lens-display>
 * </body>
 * </html>
 * ```
 * 
 * @example SPARQL Endpoint
 * ```html
 * <lens-display template="card.html">
 *   <rdf-lens shape-file="shapes.ttl" shape-class="Person" multiple>
 *     <rdf-adapter 
 *       url="https://dbpedia.org/sparql"
 *       strategy="sparql"
 *       subject-class="dbo:Person"
 *     ></rdf-adapter>
 *   </rdf-lens>
 * </lens-display>
 * ```
 * 
 * @packageDocumentation
 */

// ============================================================================
// Component Exports
// ============================================================================

export { RdfAdapter } from './components/rdf-adapter';
export { RdfLens } from './components/rdf-lens';
export { LensDisplay } from './components/lens-display';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  RdfAdapterProps,
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
    'rdf-adapter': customElements.get('rdf-adapter') ? '✓' : '✗',
    'rdf-lens': customElements.get('rdf-lens') ? '✓' : '✗',
    'lens-display': customElements.get('lens-display') ? '✓' : '✗',
  });
}
