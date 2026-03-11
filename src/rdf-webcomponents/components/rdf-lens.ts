/**
 * @fileoverview RDF Lens Web Component
 * @module rdf-webcomponents/components/rdf-lens
 * 
 * <rdf-lens> processes RDF data using SHACL shapes and rdf-lens.
 * It extracts structured data from the triplestore provided by
 * a child <rdf-adapter> component.
 * 
 * @example
 * ```html
 * <rdf-lens 
 *   shape-file="shapes.ttl"
 *   shape-class="Person"
 *   multiple
 * >
 *   <rdf-adapter url="data.ttl"></rdf-adapter>
 * </rdf-lens>
 * ```
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { 
  RdfLensProps,
  SerializedQuad,
  ShapeProcessedEvent,
  ErrorEvent as RdfErrorEvent,
} from '../types';
import { MessageType } from '../types';

// ============================================================================
// Component Definition
// ============================================================================

/**
 * RDF Lens Web Component
 * 
 * Uses SHACL shapes to extract structured data from RDF triplestores.
 * Works with <rdf-adapter> as a child component.
 */
@customElement('rdf-lens')
export class RdfLens extends LitElement implements RdfLensProps {
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
    
    .rdf-lens-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-loading-color, #666);
    }
    
    .rdf-lens-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-error-color, #c00);
      background: var(--rdf-error-bg, #fee);
      border-radius: 4px;
    }
    
    .rdf-lens-error-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .rdf-lens-error-message {
      font-family: monospace;
      font-size: 0.875rem;
    }
  `;

  // ===========================================================================
  // Properties
  // ===========================================================================

  /** URL to SHACL shapes file */
  @property({ type: String, attribute: 'shape-file' })
  shapeFile?: string;

  /** Target class URI to extract */
  @property({ type: String, attribute: 'shape-class' })
  shapeClass?: string;

  /** Inline SHACL shapes (Turtle format) */
  @property({ type: String })
  shapes?: string;

  /** Whether to validate against shapes */
  @property({ type: Boolean, reflect: true })
  validate?: boolean = false;

  /** Whether to throw on validation errors */
  @property({ type: Boolean, reflect: true })
  strict?: boolean = false;

  /** Whether to extract all matching subjects */
  @property({ type: Boolean, reflect: true })
  multiple?: boolean = false;

  /** Specific subject URI to extract */
  @property({ type: String, reflect: true })
  subject?: string;

  // ===========================================================================
  // Internal State
  // ===========================================================================

  private _data: unknown | unknown[] | null = null;
  private _quads: SerializedQuad[] = [];
  private _shapeQuads: SerializedQuad[] = [];
  private _loading = false;
  private _error: string | null = null;
  private _shapesLoaded = false;

  // ===========================================================================
  // Public API
  // ===========================================================================

  /** Returns the extracted data */
  get data(): unknown | unknown[] | null {
    return this._data;
  }

  /** Returns whether data is loading */
  get loading(): boolean {
    return this._loading;
  }

  /** Returns the current error */
  get error(): string | null {
    return this._error;
  }

  /** Sets the triplestore data (called by parent or through events) */
  setQuads(quads: SerializedQuad[]): void {
    this._quads = quads;
    if (this._shapesLoaded) {
      this._extractData();
    }
  }

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

  protected override async firstUpdated(changedProperties: PropertyValues): Promise<void> {
    super.firstUpdated(changedProperties);
    
    // Load shapes if shape-file is provided
    if (this.shapeFile) {
      await this._loadShapes();
    } else if (this.shapes) {
      await this._parseInlineShapes();
    } else {
      await this._parseInlineScriptShapes();
    }
    
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Attach early so fast child adapter events are not missed.
    this.addEventListener('triplestore-ready', this._onTriplestoreReady as EventListener);
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    // Re-load shapes if shape file changes
    if (changedProperties.has('shapeFile') && this.shapeFile) {
      this._loadShapes();
    }
    
    // Re-parse inline shapes
    if (changedProperties.has('shapes') && this.shapes) {
      this._parseInlineShapes();
    }

    // If no explicit shape source is provided, retry reading inline script shapes.
    if (
      !this.shapeFile &&
      !this.shapes &&
      !this._shapesLoaded
    ) {
      this._parseInlineScriptShapes();
    }
    
    // Re-extract data if extraction options change
    if (
      changedProperties.has('shapeClass') ||
      changedProperties.has('multiple') ||
      changedProperties.has('subject')
    ) {
      if (this._quads.length > 0 && this._shapesLoaded) {
        this._extractData();
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('triplestore-ready', this._onTriplestoreReady as EventListener);
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

  override render() {
    return html`
      <slot name="loading" ?hidden=${!this._loading}>
        ${this._loading ? html`
          <div class="rdf-lens-loading">
            Extracting data from shapes...
          </div>
        ` : ''}
      </slot>
      
      <slot name="error" ?hidden=${!this._error}>
        ${this._error ? html`
          <div class="rdf-lens-error">
            <div class="rdf-lens-error-title">Error extracting data</div>
            <div class="rdf-lens-error-message">${this._error}</div>
          </div>
        ` : ''}
      </slot>
      
      <slot ?hidden=${this._loading || this._error}></slot>
    `;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private async _loadShapes(): Promise<void> {
    if (!this.shapeFile) return;
    
    this._loading = true;
    this._error = null;
    this._emitEvent('shape-loading', { phase: 'fetch' });
    
    try {
      const response = await fetch(this.shapeFile);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shapes: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      await this._parseShapesContent(content, this.shapeFile);
      
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      
      const eventDetail: RdfErrorEvent = {
        message: this._error,
        phase: 'shape',
        error: error instanceof Error ? error : undefined,
      };
      
      this._emitEvent('shape-error', eventDetail);
      this.requestUpdate();
    }
  }

  private async _parseInlineShapes(): Promise<void> {
    if (!this.shapes) return;
    
    this._loading = true;
    
    try {
      await this._parseShapesContent(this.shapes, 'inline');
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      this._emitEvent('shape-error', {
        message: this._error,
        phase: 'shape',
        error: error instanceof Error ? error : undefined,
      });
      this.requestUpdate();
    }
  }

  private async _parseInlineScriptShapes(): Promise<void> {
    const script = this.querySelector('script[type="text/turtle"]');
    const content = script?.textContent?.trim();
    if (!content) {
      return;
    }

    this._loading = true;

    try {
      await this._parseShapesContent(content, 'inline-script');
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      this._emitEvent('shape-error', {
        message: this._error,
        phase: 'shape',
        error: error instanceof Error ? error : undefined,
      });
      this.requestUpdate();
    }
  }

  private async _parseShapesContent(content: string, baseUrl: string): Promise<void> {
    // Parse SHACL shapes using N3
    const { Parser, DataFactory } = await import('n3');
    const { namedNode } = DataFactory;
    
    const parser = new Parser({ baseIRI: baseUrl });

    return new Promise((resolve, reject) => {
      const quads: SerializedQuad[] = [];

      // N3.Parser is NOT an EventEmitter — use the callback form of parse().
      // Callback signature: (error, quad, prefixes) — quad is null when done.
      parser.parse(content, (error: Error | null, quad: any) => {
        if (error) {
          console.error('[rdf-lens] shape parse error:', error.message);
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
          console.log(`[rdf-lens] shapes parsed: ${quads.length} quads | dataQuads already available: ${this._quads.length}`);
          this._shapeQuads = quads;
          this._shapesLoaded = true;
          this._loading = false;
          this._emitEvent('shapes-loaded', { count: quads.length });
          this.requestUpdate();

          // If we already have data, extract now
          if (this._quads.length > 0) {
            this._extractData();
          }

          resolve();
        }
      });
    });
  }

  private async _extractData(): Promise<void> {
    if (this._quads.length === 0 || this._shapeQuads.length === 0) return;
    
    this._loading = true;
    this._error = null;
    this._emitEvent('extraction-start', {});
    
    const startTime = Date.now();
    
    try {
      // Use rdf-lens for extraction
      const result = await this._executeLens();
      
      this._data = result.data;
      this._loading = false;
      
      const eventDetail: ShapeProcessedEvent = {
        data: result.data,
        shapeClass: result.shapeClass,
        count: result.count,
        duration: Date.now() - startTime,
      };
      
      this._emitEvent('shape-processed', eventDetail);
      this.requestUpdate();
      
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      
      const eventDetail: RdfErrorEvent = {
        message: this._error,
        phase: 'extract',
        error: error instanceof Error ? error : undefined,
      };
      
      this._emitEvent('shape-error', eventDetail);
      this.requestUpdate();
    }
  }

  private async _executeLens(): Promise<{
    data: unknown | unknown[];
    count: number;
    shapeClass: string;
  }> {
    // Dynamic import of rdf-lens
    const { extractShapes } = await import('rdf-lens');
    const { DataFactory } = await import('n3');
    const { namedNode } = DataFactory;

    // Synchronous term deserializer — must NOT be async so map() gets real terms,
    // not Promise objects.
    const dt = (term: SerializedQuad['subject']): any => {
      switch (term.termType) {
        case 'NamedNode':
          return DataFactory.namedNode(term.value);
        case 'Literal':
          if (term.language) return DataFactory.literal(term.value, term.language);
          if (term.datatype) return DataFactory.literal(term.value, DataFactory.namedNode(term.datatype));
          return DataFactory.literal(term.value);
        case 'BlankNode':
          return DataFactory.blankNode(term.value);
        case 'DefaultGraph':
          return DataFactory.defaultGraph();
        default:
          return DataFactory.namedNode(term.value);
      }
    };

    // Convert serialized quads back to real N3 Quad objects with .equals() etc.
    const shapeQuads = this._shapeQuads.map(q =>
      DataFactory.quad(dt(q.subject), dt(q.predicate), dt(q.object),
        q.graph ? dt(q.graph) : DataFactory.defaultGraph())
    );

    const dataQuads = this._quads.map(q =>
      DataFactory.quad(dt(q.subject), dt(q.predicate), dt(q.object),
        q.graph ? dt(q.graph) : DataFactory.defaultGraph())
    );
    
    // Extract shapes
    const shapes = extractShapes(shapeQuads);
    console.log('[rdf-lens] extractShapes result — available lenses:', Object.keys(shapes.lenses));
    console.log('[rdf-lens] dataQuads count:', dataQuads.length, '| shapeQuads count:', shapeQuads.length);

    // Find subjects to process
    let subjects: string[] = [];
    const targetType = this.shapeClass;
    console.log('[rdf-lens] target shapeClass:', targetType);
    
    if (this.subject) {
      subjects = [this.subject];
    } else if (targetType) {
      // Find all subjects of the target type
      const typePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
      subjects = dataQuads
        .filter(q => q.predicate.value === typePredicate && q.object.value === targetType)
        .map(q => q.subject.value);
    } else {
      // Use the first available shape
      const availableClass = Object.keys(shapes.lenses).find(k => 
        k.startsWith('http') && !k.includes('rdf-lens')
      );
      
      if (availableClass) {
        const typePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
        subjects = dataQuads
          .filter(q => q.predicate.value === typePredicate && q.object.value === availableClass)
          .map(q => q.subject.value);
      }
    }
    
    console.log('[rdf-lens] subjects found:', subjects);

    if (subjects.length === 0) {
      throw new Error('No subjects found to extract. Ensure your data has instances of the target class.');
    }

    // Get the lens
    const lensKey = targetType || subjects[0];
    const lens = shapes.lenses[lensKey];
    
    if (!lens) {
      const availableKeys = Object.keys(shapes.lenses);
      throw new Error(`No lens found for class: ${lensKey}. Available: ${availableKeys.join(', ')}`);
    }
    
    // Execute lens
    const results: unknown[] = [];
    const subjectsToProcess = this.multiple ? subjects : subjects.slice(0, 1);
    console.log(`[rdf-lens] executing lens for ${subjectsToProcess.length} subject(s) (multiple=${this.multiple})`);

    for (const subjectUri of subjectsToProcess) {
      try {
        const result = lens.execute({
          id: namedNode(subjectUri),
          quads: dataQuads,
        });
        console.log(`[rdf-lens] extracted subject ${subjectUri}:`, result);
        results.push(result);
      } catch (error) {
        if (this.strict) {
          throw error;
        }
        console.warn(`[rdf-lens] failed to extract ${subjectUri}:`, error);
      }
    }

    console.log(`[rdf-lens] extraction complete: ${results.length} results, emitting shape-processed`);
    return {
      data: this.multiple ? results : results[0],
      count: results.length,
      shapeClass: lensKey,
    };
  }

  private _serializeTerm(term: any): SerializedQuad['subject'] {
    return {
      termType: term.termType,
      value: term.value,
      datatype: term.datatype?.value,
      language: term.language,
    };
  }

  private _onTriplestoreReady = (event: CustomEvent): void => {
    // triplestore-ready detail only has { quadCount, url, fromCache, duration }.
    // The actual SerializedQuad[] lives on the adapter's `.quads` getter.
    // Use composedPath()[0] to reliably get the originating element even
    // across shadow-DOM slot boundaries.
    const source = (event.composedPath?.()[0] ?? event.target) as any;
    console.log('[rdf-lens] triplestore-ready received — source:', source?.tagName,
      '| quads on source:', source?.quads?.length ?? 'n/a',
      '| shapesLoaded:', this._shapesLoaded);

    if (source?.quads && Array.isArray(source.quads)) {
      this._quads = source.quads;
      console.log(`[rdf-lens] stored ${this._quads.length} quads from adapter`);
    } else {
      console.warn('[rdf-lens] triplestore-ready: could not read quads from source element');
    }

    if (this._shapesLoaded) {
      this._extractData();
    } else {
      console.log('[rdf-lens] shapes not yet loaded — extraction deferred');
    }
  };

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
    'rdf-lens': RdfLens;
  }
  
  interface GlobalEventHandlersEventMap {
    'shape-processed': CustomEvent<ShapeProcessedEvent>;
    'shape-error': CustomEvent<RdfErrorEvent>;
    'shapes-loaded': CustomEvent<{ count: number }>;
    'extraction-start': CustomEvent<{ phase?: string }>;
  }
}
