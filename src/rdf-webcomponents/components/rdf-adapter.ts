/**
 * @fileoverview RDF Adapter Web Component
 * @module rdf-webcomponents/components/rdf-adapter
 * 
 * <rdf-adapter> fetches and parses RDF data from various sources:
 * - Static RDF files (Turtle, N-Triples, N-Quads, RDF/XML, JSON-LD)
 * - SPARQL endpoints with multiple extraction strategies
 * - Supports caching and shared triplestores
 * 
 * @example
 * ```html
 * <rdf-adapter 
 *   url="https://example.org/data.ttl"
 *   format="turtle"
 *   cache="indexedDB"
 *   shared
 * ></rdf-adapter>
 * ```
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, eventOptions } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { 
  RdfAdapterProps,
  RdfFormat,
  DataSourceStrategy,
  SerializedQuad,
  TriplestoreReadyEvent,
  ErrorEvent as RdfErrorEvent,
} from '../types';
import { MessageType } from '../types';
import { WorkerMessenger, createWorkerFromModule } from '../core/protocol';

// ============================================================================
// Component Definition
// ============================================================================

/**
 * RDF Adapter Web Component
 * 
 * Fetches and parses RDF data from URLs or SPARQL endpoints.
 * Emits events when data is loaded and provides the triplestore
 * to child components.
 */
@customElement('rdf-adapter')
export class RdfAdapter extends LitElement implements RdfAdapterProps {
  // ===========================================================================
  // Static Properties
  // ===========================================================================

  static override styles = css`
    :host {
      display: contents;
    }
    
    :host([hidden]) {
      display: none;
    }
    
    .rdf-adapter-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-loading-color, #666);
    }
    
    .rdf-adapter-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-error-color, #c00);
      background: var(--rdf-error-bg, #fee);
      border-radius: 4px;
    }
    
    .rdf-adapter-error-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .rdf-adapter-error-message {
      font-family: monospace;
      font-size: 0.875rem;
    }
    
    @keyframes rdf-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    
    .rdf-adapter-loading::after {
      content: '';
      width: 1rem;
      height: 1rem;
      margin-left: 0.5rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: rdf-pulse 1s ease-in-out infinite;
    }
  `;

  // ===========================================================================
  // Properties
  // ===========================================================================

  /** URL to RDF data or SPARQL endpoint */
  @property({ type: String, reflect: true })
  url: string = '';

  /** RDF format (auto-detected if not specified) */
  @property({ type: String, reflect: true })
  format?: RdfFormat;

  /** Data source strategy */
  @property({ type: String, reflect: true })
  strategy?: DataSourceStrategy = 'file';

  /** Subject URI for CBD or direct lookup */
  @property({ type: String, reflect: true })
  subject?: string;

  /** Custom SPARQL query for subject discovery */
  @property({ type: String, attribute: 'subject-query' })
  subjectQuery?: string;

  /** Class URI to discover instances */
  @property({ type: String, attribute: 'subject-class' })
  subjectClass?: string;

  /** Depth for CBD traversal */
  @property({ type: Number, reflect: true })
  depth?: number = 2;

  /** Named graph to query */
  @property({ type: String, reflect: true })
  graph?: string;

  /** Cache strategy */
  @property({ type: String, reflect: true })
  cache?: 'none' | 'memory' | 'localStorage' | 'indexedDB' = 'memory';

  /** Cache time-to-live in seconds */
  @property({ type: Number, attribute: 'cache-ttl' })
  cacheTtl?: number;

  /** Whether to use shared global cache */
  @property({ type: Boolean, reflect: true })
  shared?: boolean = false;

  /** Custom HTTP headers (JSON string) */
  @property({ type: String, reflect: true })
  headers?: string;

  // ===========================================================================
  // Internal State
  // ===========================================================================

  private _quads: SerializedQuad[] = [];
  private _loading = false;
  private _error: string | null = null;
  private _worker: WorkerMessenger | null = null;
  private _cacheKey: string = '';

  // ===========================================================================
  // Public API
  // ===========================================================================

  /** Returns the parsed quads */
  get quads(): SerializedQuad[] {
    return this._quads;
  }

  /** Returns the quad count */
  get quadCount(): number {
    return this._quads.length;
  }

  /** Returns whether data is loading */
  get loading(): boolean {
    return this._loading;
  }

  /** Returns the current error */
  get error(): string | null {
    return this._error;
  }

  /** Returns the cache key for the current data */
  get cacheKey(): string {
    return this._cacheKey;
  }

  /** Reloads the data from the URL */
  async reload(): Promise<void> {
    if (this.url) {
      await this._fetchData();
    }
  }

  /** Clears the cache and reloads */
  async refresh(): Promise<void> {
    // Clear cache for this URL
    if (this._worker) {
      await this._worker.send(MessageType.CACHE_CLEAR_REQUEST, {});
    }
    await this.reload();
  }

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

  constructor() {
    super();
    this._initWorker();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    // Re-fetch when URL or strategy changes
    if (
      changedProperties.has('url') ||
      changedProperties.has('strategy') ||
      changedProperties.has('subject') ||
      changedProperties.has('subjectQuery') ||
      changedProperties.has('subjectClass')
    ) {
      if (this.url) {
        this._fetchData();
      }
    }
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

  override render() {
    // Use slots for loading/error states
    return html`
      <slot name="loading" ?hidden=${!this._loading}>
        ${this._loading ? html`
          <div class="rdf-adapter-loading">
            Loading RDF data...
          </div>
        ` : ''}
      </slot>
      
      <slot name="error" ?hidden=${!this._error}>
        ${this._error ? html`
          <div class="rdf-adapter-error">
            <div class="rdf-adapter-error-title">Error loading RDF data</div>
            <div class="rdf-adapter-error-message">${this._error}</div>
          </div>
        ` : ''}
      </slot>
      
      <slot ?hidden=${this._loading || this._error}></slot>
    `;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private _initWorker(): void {
    // Create worker from inline code (for bundled version)
    const workerCode = `
      // Worker will be loaded dynamically
      self.postMessage({ type: 'WORKER_READY', payload: { timestamp: Date.now() } });
    `;
    
    // For now, create a simple worker
    // In production, this would load the actual worker module
    try {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      
      this._worker = new WorkerMessenger(worker, 60000);
      this._worker.on('WORKER_READY', () => {
        URL.revokeObjectURL(workerUrl);
      });
    } catch (error) {
      console.warn('WebWorker not available, falling back to main thread');
    }
  }

  private async _fetchData(): Promise<void> {
    if (!this.url) return;

    console.group(`[rdf-adapter] fetch started`);
    console.log('url:', this.url, '| format:', this.format, '| strategy:', this.strategy);

    this._loading = true;
    this._error = null;
    this._quads = [];

    // Emit loading event
    this._emitEvent('triplestore-loading', { phase: 'fetch' });
    
    try {
      // Parse headers if provided as JSON string
      let headers: Record<string, string> = {};
      if (this.headers) {
        try {
          headers = JSON.parse(this.headers);
        } catch {
          console.warn('Invalid headers JSON, ignoring');
        }
      }
      
      // Determine strategy from URL if not specified
      let strategy = this.strategy;
      if (!strategy || strategy === 'file') {
        if (this.url.includes('sparql') || this.url.includes('query')) {
          strategy = 'sparql';
        }
      }
      
      // Fetch and parse RDF data
      const result = await this._fetchAndParseRdf({
        url: this.url,
        format: this.format,
        strategy: strategy as DataSourceStrategy,
        subject: this.subject,
        subjectQuery: this.subjectQuery,
        subjectClass: this.subjectClass,
        depth: this.depth,
        graph: this.graph,
        headers,
        cache: this.cache,
        cacheTtl: this.cacheTtl,
        shared: this.shared,
      });
      
      this._quads = result.quads;
      this._cacheKey = result.cacheKey;
      this._loading = false;

      console.log(`[rdf-adapter] parsed ${result.quadCount} quads in ${result.duration}ms (format: ${result.format})`);
      console.log('[rdf-adapter] emitting triplestore-ready');
      console.groupEnd();

      // Emit ready event
      const eventDetail: TriplestoreReadyEvent = {
        quadCount: result.quadCount,
        url: result.url,
        fromCache: result.fromCache,
        duration: result.duration,
      };

      this._emitEvent('triplestore-ready', eventDetail);

      // Update reactive property
      this.requestUpdate();
      
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      console.error('[rdf-adapter] fetch/parse error:', error);
      console.groupEnd();

      // Emit error event
      const eventDetail: RdfErrorEvent = {
        message: this._error,
        phase: 'fetch',
        error: error instanceof Error ? error : undefined,
      };

      this._emitEvent('triplestore-error', eventDetail);
      this.requestUpdate();
    }
  }

  private async _fetchAndParseRdf(options: {
    url: string;
    format?: RdfFormat;
    strategy: DataSourceStrategy;
    subject?: string;
    subjectQuery?: string;
    subjectClass?: string;
    depth?: number;
    graph?: string;
    headers: Record<string, string>;
    cache?: string;
    cacheTtl?: number;
    shared?: boolean;
  }): Promise<{
    quads: SerializedQuad[];
    quadCount: number;
    url: string;
    format: RdfFormat;
    duration: number;
    cacheKey: string;
    fromCache: boolean;
  }> {
    const startTime = Date.now();
    
    // Use main thread implementation for now
    // (Worker would be used in production)
    
    const response = await fetch(options.url, {
      headers: {
        'Accept': 'text/turtle,application/n-triples,application/n-quads,application/rdf+xml,application/ld+json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${options.url}: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    const contentType = response.headers.get('Content-Type') || '';
    
    // Detect format
    let format = options.format;
    if (!format) {
      if (contentType.includes('turtle') || contentType.includes('n3')) {
        format = 'turtle';
      } else if (contentType.includes('n-triples')) {
        format = 'n-triples';
      } else if (contentType.includes('n-quads')) {
        format = 'n-quads';
      } else if (contentType.includes('rdf+xml')) {
        format = 'rdf-xml';
      } else if (contentType.includes('ld+json') || contentType.includes('json')) {
        format = 'json-ld';
      } else {
        // Try to detect from URL or content
        format = this._detectFormat(options.url, content);
      }
    }
    
    // Parse the content
    const quads = await this._parseRdf(content, format, options.url);
    
    const cacheKey = `${options.url}|${options.strategy || 'file'}|${options.subject || ''}`;
    
    return {
      quads,
      quadCount: quads.length,
      url: options.url,
      format,
      duration: Date.now() - startTime,
      cacheKey,
      fromCache: false,
    };
  }

  private _detectFormat(url: string, content: string): RdfFormat {
    const urlLower = url.toLowerCase();
    
    if (urlLower.endsWith('.ttl')) return 'turtle';
    if (urlLower.endsWith('.nt')) return 'n-triples';
    if (urlLower.endsWith('.nq') || urlLower.endsWith('.nquads')) return 'n-quads';
    if (urlLower.endsWith('.rdf') || urlLower.endsWith('.owl')) return 'rdf-xml';
    if (urlLower.endsWith('.jsonld') || urlLower.endsWith('.json')) return 'json-ld';
    
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json-ld';
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<rdf:RDF')) return 'rdf-xml';
    if (trimmed.startsWith('@prefix') || trimmed.startsWith('@base')) return 'turtle';
    
    return 'turtle';
  }

  private async _parseRdf(content: string, format: RdfFormat, baseUrl: string): Promise<SerializedQuad[]> {
    // Dynamic import of N3 for parsing
    const { Parser } = await import('n3');

    const parser = new Parser({
      format: format === 'turtle' ? undefined : format,
      baseIRI: baseUrl,
    });

    console.log(`[rdf-adapter] parsing content (${content.length} chars) as format=${format}`);

    return new Promise((resolve, reject) => {
      const quads: SerializedQuad[] = [];

      // N3.Parser is NOT an EventEmitter — use the callback form of parse().
      // Callback signature: (error, quad, prefixes) — quad is null when done.
      parser.parse(content, (error: Error | null, quad: any) => {
        if (error) {
          console.error('[rdf-adapter] N3 parse error:', error.message);
          reject(error);
        } else if (quad) {
          quads.push({
            subject: this._serializeTerm(quad.subject),
            predicate: this._serializeTerm(quad.predicate),
            object: this._serializeTerm(quad.object),
            graph: quad.graph ? this._serializeTerm(quad.graph) : undefined,
          });
        } else {
          // quad === null → parsing complete
          console.log(`[rdf-adapter] N3 parse complete: ${quads.length} quads`);
          resolve(quads);
        }
      });
    });
  }

  private _serializeTerm(term: any): any {
    return {
      termType: term.termType,
      value: term.value,
      datatype: term.datatype?.value,
      language: term.language,
    };
  }

  private _emitEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// ============================================================================
// Type Declarations
// ============================================================================

declare global {
  interface HTMLElementTagNameMap {
    'rdf-adapter': RdfAdapter;
  }
  
  // Event types
  interface GlobalEventHandlersEventMap {
    'triplestore-ready': CustomEvent<TriplestoreReadyEvent>;
    'triplestore-error': CustomEvent<RdfErrorEvent>;
    'triplestore-loading': CustomEvent<{ phase: string }>;
  }
}
