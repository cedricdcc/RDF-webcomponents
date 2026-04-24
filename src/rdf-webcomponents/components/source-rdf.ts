/**
 * @fileoverview source-rdf Web Component
 * @module rdf-webcomponents/components/source-rdf
 */

import { LitElement, css, html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type {
  ErrorEvent as RdfErrorEvent,
  RdfFormat,
  SerializedQuad,
  SourceRdfProps,
  TriplestoreReadyEvent,
} from '../types';
import { serializeQuads, parseRdf, detectFormat } from '../core/worker/parsers';
import { fetchRdfWithWrxFallback } from './source-rdf-fetch';
import {
  buildSparqlQuery,
  type SourceRdfConfig,
  parseSourceRdfConfigRdf,
  validateSourceRdfConfig,
} from './source-rdf-config';

type ParsedConfigResult = {
  config: SourceRdfConfig;
  warnings: string[];
  providedKeys: Set<string>;
};

@customElement('source-rdf')
export class SourceRdf extends LitElement implements SourceRdfProps {
  static override styles = css`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none;
    }

    .source-rdf-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-loading-color, #666);
    }

    .source-rdf-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-error-color, #c00);
      background: var(--rdf-error-bg, #fee);
      border-radius: 4px;
    }

    .source-rdf-error-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .source-rdf-error-message {
      font-family: monospace;
      font-size: 0.875rem;
    }

    @keyframes rdf-pulse {
      0%,
      100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }

    .source-rdf-loading::after {
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

  @property({ type: String, reflect: true })
  url = '';

  @property({ type: String, reflect: true })
  config = '';

  private _quads: SerializedQuad[] = [];
  private _loading = false;
  private _error: string | null = null;
  private _cacheKey = '';

  get quads(): SerializedQuad[] {
    return this._quads;
  }

  get quadCount(): number {
    return this._quads.length;
  }

  get loading(): boolean {
    return this._loading;
  }

  get error(): string | null {
    return this._error;
  }

  get cacheKey(): string {
    return this._cacheKey;
  }

  async reload(): Promise<void> {
    await this._fetchData();
  }

  async refresh(): Promise<void> {
    await this.reload();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('url') ||
      changedProperties.has('config')
    ) {
      void this._fetchData();
    }
  }

  override render() {
    return html`
      <slot name="loading" ?hidden=${!this._loading}>
        ${this._loading
          ? html`
              <div class="source-rdf-loading">Loading RDF data...</div>
            `
          : ''}
      </slot>

      <slot name="error" ?hidden=${!this._error}>
        ${this._error
          ? html`
              <div class="source-rdf-error">
                <div class="source-rdf-error-title">Error loading RDF data</div>
                <div class="source-rdf-error-message">${this._error}</div>
              </div>
            `
          : ''}
      </slot>

      <slot ?hidden=${this._loading || this._error}></slot>
    `;
  }

  private async _fetchData(): Promise<void> {
    this._loading = true;
    this._error = null;
    this._quads = [];

    this._emitEvent('triplestore-loading', { phase: 'fetch' });

    try {
      const resolvedConfig = await this._resolveConfig();
      const merged = this._mergeWithAttributes(resolvedConfig.config);
      const warnings = [...resolvedConfig.warnings];
      const providedKeys = this._collectProvidedKeys(resolvedConfig.providedKeys);

      const strategy = merged.strategy ?? 'file';
      warnings.push(...validateSourceRdfConfig(merged, providedKeys));

      for (const warning of warnings) {
        console.warn(`[source-rdf] ${warning}`);
      }

      const start = Date.now();
      const headers = merged.headers ?? {};

      let content = '';
      let sourceUrl = merged.url!;
      let format = merged.format;

      if (strategy === 'file') {
        const result = await fetchRdfWithWrxFallback(sourceUrl, headers);
        console.log(`[source-rdf] Fetched RDF content from ${result.url} with format ${result.contentType}`);
        content = result.content;
        sourceUrl = result.url;
        format = this._resolveResponseFormat(format, sourceUrl, content, result.contentType);
      } else {
        const sparqlQuery = buildSparqlQuery(strategy, merged);
        content = await this._executeSparqlConstruct(sourceUrl, sparqlQuery, headers);
        if (strategy === 'sparql' && merged.subjectQuery) {
          // User requirement: subject-query must return triples.
          if (!content.trim()) {
            throw new Error('subject-query returned an empty RDF graph');
          }
        }
        format = this._resolveResponseFormat(format, sourceUrl, content, 'text/turtle');
      }

      const parseResult = await parseRdf(content, format!, sourceUrl);
      if (parseResult.errors.length > 0) {
        throw new Error(`RDF parsing failed: ${parseResult.errors[0].message}`);
      }

      this._quads = serializeQuads(parseResult.quads);
      this._cacheKey = `${sourceUrl}|${strategy}|${merged.subject ?? ''}`;
      this._loading = false;

      const eventDetail: TriplestoreReadyEvent = {
        quadCount: this._quads.length,
        url: sourceUrl,
        fromCache: false,
        duration: Date.now() - start,
      };

      this._emitEvent('triplestore-ready', eventDetail);
      this.requestUpdate();
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);

      const eventDetail: RdfErrorEvent = {
        message: this._error,
        phase: 'fetch',
        error: error instanceof Error ? error : undefined,
      };

      this._emitEvent('triplestore-error', eventDetail);
      this.requestUpdate();
    }
  }

  private _resolveResponseFormat(
    explicitFormat: RdfFormat | undefined,
    url: string,
    content: string,
    contentType: string | null,
  ): RdfFormat {
    if (explicitFormat) {
      return explicitFormat;
    }

    const ct = (contentType ?? '').toLowerCase();
    if (ct.includes('turtle')) return 'turtle';
    if (ct.includes('n-triples')) return 'n-triples';
    if (ct.includes('n-quads')) return 'n-quads';
    if (ct.includes('rdf+xml')) return 'rdf-xml';
    if (ct.includes('ld+json') || ct.includes('json')) return 'json-ld';

    return detectFormat(url, content);
  }

  private async _resolveConfig(): Promise<ParsedConfigResult> {
    if (this.config && this.config.trim()) {
      return parseSourceRdfConfigRdf(this.config, undefined, 'inline-config-attribute');
    }

    const inline = this._readInlineConfigScript();
    if (inline) {
      return parseSourceRdfConfigRdf(inline.content, inline.format, 'inline-config-script');
    }

    return { config: {}, warnings: [], providedKeys: new Set<string>() };
  }

  private _readInlineConfigScript(): { content: string; format?: RdfFormat } | null {
    const script = this.querySelector('script[type]');
    if (!script || !script.textContent?.trim()) {
      return null;
    }

    const type = script.getAttribute('type')?.toLowerCase() ?? '';
    const content = script.textContent;

    if (type.includes('ld+json')) return { content, format: 'json-ld' };
    if (type.includes('rdf+xml')) return { content, format: 'rdf-xml' };
    if (type.includes('n-triples')) return { content, format: 'n-triples' };
    if (type.includes('n-quads')) return { content, format: 'n-quads' };
    if (type.includes('turtle') || type.includes('ttl')) return { content, format: 'turtle' };
    if (type.includes('html')) return { content, format: 'rdfa' };

    return { content };
  }

  private _mergeWithAttributes(config: SourceRdfConfig): SourceRdfConfig {
    return {
      ...config,
      url: this.url || config.url,
    };
  }

  private _collectProvidedKeys(configKeys: Set<string>): Set<string> {
    const keys = new Set(configKeys);

    if (this.hasAttribute('url')) keys.add('url');

    return keys;
  }

  private async _executeSparqlConstruct(
    endpoint: string,
    query: string,
    headers: Record<string, string>,
  ): Promise<string> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/turtle,application/n-triples,application/n-quads,application/rdf+xml,application/ld+json',
        ...headers,
      },
      body: `query=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  private _emitEvent(eventName: string, detail: unknown): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'source-rdf': SourceRdf;
  }

  interface GlobalEventHandlersEventMap {
    'triplestore-ready': CustomEvent<TriplestoreReadyEvent>;
    'triplestore-error': CustomEvent<RdfErrorEvent>;
    'triplestore-loading': CustomEvent<{ phase: string }>;
  }
}
