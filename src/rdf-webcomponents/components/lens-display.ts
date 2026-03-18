/**
 * @fileoverview Lens Display Web Component
 * @module rdf-webcomponents/components/lens-display
 * 
 * <lens-display> renders extracted data using HTML templates.
 * It receives data from a child <rdf-lens> component and renders
 * it using lit-html templates loaded from a URL.
 * 
 * @example
 * ```html
 * <lens-display template="person-card.html">
 *   <rdf-lens shape-file="shapes.ttl" shape-class="Person">
 *     <source-rdf url="data.ttl"></source-rdf>
 *   </rdf-lens>
 * </lens-display>
 * ```
 */

import { LitElement, html, css, svg, render, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { 
  LensDisplayProps,
  RenderCompleteEvent,
  ErrorEvent as RdfErrorEvent,
} from '../types';

// ============================================================================
// Template Engine
// ============================================================================

/**
 * Simple template engine that supports:
 * - ${data.field} - value interpolation
 * - {{field}} - mustache-style interpolation
 * - Conditional rendering with data- attributes
 * - Loop rendering with template repetition
 */
class TemplateEngine {
  private templateCache = new Map<string, string>();

  /**
   * Loads a template from a URL
   */
  async loadTemplate(url: string): Promise<string> {
    // Check cache
    const cached = this.templateCache.get(url);
    if (cached) {
      return cached;
    }

    // Fetch template
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
    }

    const template = await response.text();
    this.templateCache.set(url, template);
    return template;
  }

  /**
   * Renders a template with data
   */
  render(template: string, data: unknown | unknown[]): string {
    const items = Array.isArray(data) ? data : [data];
    
    return items.map(item => this.renderItem(template, item)).join('');
  }

  /**
   * Renders a single item
   */
  private renderItem(template: string, data: any): string {
    let result = template;

    // Handle loops first so inner blocks are evaluated in each item's context.
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, field, content) => {
      const items = this.getNestedValue(data, field);
      if (Array.isArray(items)) {
        return items.map((item, index) => {
          let itemContent = content;
          // Replace {{@index}} with the index
          itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));

          // For primitive arrays, {{this}} should map directly to the primitive value.
          // For object items, keep {{this}} unresolved here so renderItem can resolve
          // item.this (for templates like {{#each _properties}}{{this}}{{/each}}).
          if (typeof item !== 'object' || item === null) {
            itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
          }

          // Replace {{.field}} with nested values
          if (typeof item === 'object' && item !== null) {
            itemContent = this.renderItem(itemContent, item);
          }
          return itemContent;
        }).join('');
      }
      return '';
    });

    // Handle conditionals: {{#field}}...{{/field}}
    result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, field, content) => {
      const value = this.getNestedValue(data, field);
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return this.renderItem(content, data);
      }
      return '';
    });

    // Handle inverse conditionals: {{^field}}...{{/field}}
    result = result.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, field, content) => {
      const value = this.getNestedValue(data, field);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return this.renderItem(content, data);
      }
      return '';
    });

    // Handle ${data.field} interpolation
    result = result.replace(/\$\{(?:data\.)?([^}]+)\}/g, (_, path) => {
      const value = this.getNestedValue(data, path);
      return this.escapeHtml(String(value ?? ''));
    });

    // Handle {{field}} interpolation (mustache-style)
    result = result.replace(/\{\{([^#/][^}]*)\}\}/g, (_, path) => {
      const trimmedPath = path.trim();
      
      // Handle special helpers
      if (trimmedPath === '@index') {
        return '0'; // Default in non-loop context
      }
      
      const value = this.getNestedValue(data, trimmedPath);
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return this.escapeHtml(String(value));
    });

    // Handle {{{field}}} (unescaped)
    result = result.replace(/\{\{\{([^}]+)\}\}\}/g, (_, path) => {
      const value = this.getNestedValue(data, path.trim());
      return String(value ?? '');
    });

    return result;
  }

  /**
   * Gets a nested value from an object
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array access: items[0]
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

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(str: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, char => htmlEntities[char]);
  }

  /**
   * Clears the template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}

// ============================================================================
// Built-in Templates
// ============================================================================

/**
 * Default card template
 */
const DEFAULT_CARD_TEMPLATE = `
<article class="rdf-card">
  <h3 class="rdf-card-title">{{name}}</h3>
  <dl class="rdf-card-content">
    {{#each _properties}}
    <div class="rdf-card-property">
      <dt class="rdf-card-key">{{@key}}</dt>
      <dd class="rdf-card-value">{{this}}</dd>
    </div>
    {{/each}}
  </dl>
</article>
`;

/**
 * Default list template
 */
const DEFAULT_LIST_TEMPLATE = `
<ul class="rdf-list">
  {{#each items}}
  <li class="rdf-list-item">
    {{name}}
  </li>
  {{/each}}
</ul>
`;

/**
 * Default table template
 */
const DEFAULT_TABLE_TEMPLATE = `
<table class="rdf-table">
  <thead>
    <tr>
      <th>Property</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {{#each _properties}}
    <tr>
      <td>{{@key}}</td>
      <td>{{this}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>
`;

// ============================================================================
// Component Definition
// ============================================================================

/**
 * Lens Display Web Component
 * 
 * Renders extracted RDF data using HTML templates.
 */
@customElement('lens-display')
export class LensDisplay extends LitElement implements LensDisplayProps {
  // ===========================================================================
  // Static Properties
  // ===========================================================================

  static override styles = css`
    :host {
      display: block;
    }
    
    :host([hidden]) {
      display: none;
    }
    
    /* Default styles */
    .rdf-container {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: #333;
    }
    
    .rdf-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-loading-color, #666);
    }
    
    .rdf-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-error-color, #c00);
      background: var(--rdf-error-bg, #fee);
      border-radius: 4px;
    }
    
    .rdf-empty {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
    
    /* Card styles */
    .rdf-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .rdf-card-title {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: #333;
    }
    
    .rdf-card-content {
      margin: 0;
    }
    
    .rdf-card-property {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .rdf-card-key {
      font-weight: 500;
      min-width: 120px;
    }
    
    .rdf-card-value {
      margin: 0;
    }
    
    /* List styles */
    .rdf-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .rdf-list-item {
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .rdf-list-item:hover {
      background: #f5f5f5;
    }
    
    /* Table styles */
    .rdf-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .rdf-table th,
    .rdf-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    .rdf-table th {
      background: #f5f5f5;
      font-weight: 500;
    }
    
    /* Grid layout */
    .rdf-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    /* Animation */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .rdf-animated {
      animation: fadeIn 0.3s ease-out;
    }
  `;

  // ===========================================================================
  // Properties
  // ===========================================================================

  /** URL to template file */
  @property({ type: String, reflect: true })
  template?: string;

  /** Display mode */
  @property({ type: String, reflect: true })
  mode?: 'single' | 'list' | 'grid' | 'table' = 'single';

  /** Theme identifier */
  @property({ type: String, reflect: true })
  theme?: string;

  /** CSS class to apply */
  @property({ type: String, reflect: true })
  override class?: string;

  // ===========================================================================
  // Internal State
  // ===========================================================================

  @state()
  private _data: unknown | unknown[] | null = null;

  @state()
  private _renderedHtml: string = '';

  @state()
  private _templateContent: string = '';

  @state()
  private _loading = false;

  @state()
  private _error: string | null = null;

  private _engine = new TemplateEngine();

  // ===========================================================================
  // Public API
  // ===========================================================================

  /** Returns the current data */
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

  /** Sets the data to render */
  setData(data: unknown | unknown[]): void {
    this._data = data;
    this._renderData();
  }

  /** Reloads the template */
  async reloadTemplate(): Promise<void> {
    if (this.template) {
      await this._loadTemplate();
      if (this._data) {
        this._renderData();
      }
    }
  }

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

  protected override async firstUpdated(): Promise<void> {
    // Always initialize template content (custom template or default by mode).
    await this._loadTemplate();

    // If data arrived before firstUpdated (possible with fast child updates),
    // render now that the template is initialized.
    if (this._data) {
      this._renderData();
    }
  }

  protected override async updated(changedProperties: Map<string, any>): Promise<void> {
    super.updated(changedProperties);

    if (changedProperties.has('template')) {
      await this._loadTemplate();
      if (this._data) {
        this._renderData();
      }
    }

    // Recompute default template when mode changes and no explicit template is set.
    if (changedProperties.has('mode') && !this.template) {
      await this._loadTemplate();
      if (this._data) {
        this._renderData();
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('shape-processed', this._onShapeProcessed as EventListener);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Attach as early as possible to avoid missing early child events.
    this.addEventListener('shape-processed', this._onShapeProcessed as EventListener);
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

  override render() {
    const containerClasses = {
      'rdf-container': true,
      'rdf-grid': this.mode === 'grid',
      [`rdf-theme-${this.theme}`]: !!this.theme,
      'rdf-animated': true,
    };

    if (this.class) {
      containerClasses[this.class] = true;
    }

    return html`
      <div class=${classMap(containerClasses)}>
        <slot name="loading" ?hidden=${!this._loading}>
          ${this._loading ? html`
            <div class="rdf-loading">
              Rendering template...
            </div>
          ` : ''}
        </slot>
        
        <slot name="error" ?hidden=${!this._error}>
          ${this._error ? html`
            <div class="rdf-error">
              <strong>Render Error</strong>
              <p>${this._error}</p>
            </div>
          ` : ''}
        </slot>
        
        <slot name="empty" ?hidden=${!this._data || (Array.isArray(this._data) && this._data.length === 0)}>
          ${(!this._data || (Array.isArray(this._data) && this._data.length === 0)) && !this._loading && !this._error ? html`
            <div class="rdf-empty">
              No data to display
            </div>
          ` : ''}
        </slot>
        
        ${this._renderedHtml ? unsafeHTML(this._renderedHtml) : ''}
        
        <slot ?hidden=${this._loading || this._error}></slot>
      </div>
    `;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private async _loadTemplate(): Promise<void> {
    if (!this.template) {
      // Use default template based on mode
      this._templateContent = this._getDefaultTemplate();
      return;
    }

    this._loading = true;
    this._error = null;

    try {
      this._templateContent = await this._engine.loadTemplate(this.template);
      this._loading = false;
      console.log(`[lens-display] template loaded from ${this.template} (${this._templateContent.length} chars)`);

      // Re-render when data is already available and template finishes loading.
      if (this._data) {
        this._renderData();
      }
      this.requestUpdate();
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      this._emitEvent('render-error', {
        message: this._error,
        phase: 'render',
        error: error instanceof Error ? error : undefined,
      });
      this.requestUpdate();
    }
  }

  private _getDefaultTemplate(): string {
    switch (this.mode) {
      case 'list':
        return DEFAULT_LIST_TEMPLATE;
      case 'table':
        return DEFAULT_TABLE_TEMPLATE;
      case 'grid':
      case 'single':
      default:
        return DEFAULT_CARD_TEMPLATE;
    }
  }

  private _renderData(): void {
    if (!this._data || !this._templateContent) {
      console.warn('[lens-display] _renderData called but missing data or template',
        { hasData: !!this._data, templateLength: this._templateContent.length });
      return;
    }

    console.group('[lens-display] rendering');
    console.log('mode:', this.mode, '| data:', this._data);

    const startTime = Date.now();

    try {
      // Prepare data for rendering
      let dataToRender: unknown;

      if (Array.isArray(this._data)) {
        const preparedItems = this._data.map(item => this._prepareItem(item));

        // For grid/list/table modes the template is expected to iterate over
        // an `items` array (e.g. {{#each items}}). Wrap the array so the
        // template engine receives a single object with an `items` key.
        if (this.mode === 'grid' || this.mode === 'list' || this.mode === 'table') {
          dataToRender = { items: preparedItems };
          console.log(`[lens-display] wrapped array as { items: [${preparedItems.length}] } for mode=${this.mode}`);
        } else {
          // 'single': render template once per item
          dataToRender = preparedItems;
        }
      } else {
        dataToRender = this._prepareItem(this._data);
      }

      console.log('[lens-display] dataToRender:', dataToRender);

      // Render the template
      this._renderedHtml = this._engine.render(this._templateContent, dataToRender);

      console.log(`[lens-display] rendered HTML length: ${this._renderedHtml.length} chars in ${Date.now() - startTime}ms`);
      console.groupEnd();

      // Emit completion event
      const eventDetail: RenderCompleteEvent = {
        html: this._renderedHtml,
        data: this._data,
        duration: Date.now() - startTime,
      };

      this._emitEvent('render-complete', eventDetail);
      this.requestUpdate();

    } catch (error) {
      console.error('[lens-display] render error:', error);
      console.groupEnd();
      this._error = error instanceof Error ? error.message : String(error);
      this._emitEvent('render-error', {
        message: this._error,
        phase: 'render',
        error: error instanceof Error ? error : undefined,
      });
      this.requestUpdate();
    }
  }

  private _prepareItem(item: any): any {
    if (typeof item !== 'object' || item === null) {
      return item;
    }

    // Create a copy
    const prepared = { ...item };

    // Add _properties array for default templates
    if (!prepared._properties) {
      prepared._properties = Object.entries(item)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => ({ '@key': key, 'this': value }));
    }

    return prepared;
  }

  private _onShapeProcessed = (event: CustomEvent): void => {
    // event.detail.data is set explicitly by rdf-lens — use it directly.
    // Do NOT use event.target.data: in Shadow DOM, event.target is
    // retargeted to the host element and will never be the inner rdf-lens.
    const detail = event.detail as { data?: unknown; count?: number; shapeClass?: string };
    console.log('[lens-display] shape-processed received — detail:', detail);

    if (detail?.data !== undefined && detail.data !== null) {
      this._data = detail.data;
      console.log('[lens-display] data set from event.detail.data:',
        Array.isArray(this._data) ? `array[${(this._data as unknown[]).length}]` : typeof this._data,
        '| templateContent length:', this._templateContent.length);
      this._renderData();
    } else {
      console.warn('[lens-display] shape-processed received but event.detail.data is empty:', detail);
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
    'lens-display': LensDisplay;
  }
  
  interface GlobalEventHandlersEventMap {
    'render-complete': CustomEvent<RenderCompleteEvent>;
    'render-error': CustomEvent<RdfErrorEvent>;
  }
}
