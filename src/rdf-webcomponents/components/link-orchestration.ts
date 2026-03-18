import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

type LinkContentType = 'text' | 'image';

type LifecycleIconConfig = {
  loading?: string;
  ready?: string;
  error?: string;
};

type LinkDecoratorConfig = {
  enabled?: boolean;
  icons?: LifecycleIconConfig;
};

type LinkMatchRule = {
  id: string;
  enabled?: boolean;
  css?: string;
  xpath?: string;
  urlPattern?: string;
  urlRegex?: string;
  hostEquals?: string;
  pathStartsWith?: string;
  contentType?: LinkContentType;
  parentCss?: string;
};

type AdapterConfig = {
  url?: string;
  format?: string;
  strategy?: string;
  subject?: string;
  subjectQuery?: string;
  subjectClass?: string;
  depth?: number;
  cache?: 'none' | 'memory' | 'localStorage' | 'indexedDB';
  cacheTtl?: number;
  shared?: boolean;
  headers?: Record<string, string>;
};

type LensConfig = {
  shapeFile?: string;
  shapeClass?: string;
  shapes?: string;
  strict?: boolean;
  multiple?: boolean;
  subject?: string;
};

type DisplayConfig = {
  template?: string;
  templateInline?: string;
  mode?: 'single' | 'list' | 'grid' | 'table';
  theme?: string;
  class?: string;
};

type LinkOrchestrationRule = {
  id: string;
  enabled?: boolean;
  match?: LinkMatchRule;
  adapter?: AdapterConfig;
  lens?: LensConfig;
  display?: DisplayConfig;
  decorators?: LinkDecoratorConfig;
  overrideContentType?: LinkContentType;
};

type LinkOrchestrationConfig = {
  debounceMs?: number;
  maxConcurrentPipelines?: number;
  allowRecursive?: boolean;
  decorators?: LinkDecoratorConfig;
  rules: LinkOrchestrationRule[];
};

type LinkRuntimeState = 'loading' | 'ready' | 'error' | 'rolled-back';

type LinkRecord = {
  link: HTMLAnchorElement;
  ruleId: string;
  ownerId: string;
  pipelineHost: HTMLSpanElement | null;
  displayElement: HTMLElement | null;
  adapterElement: HTMLElement | null;
  iconElement: HTMLSpanElement | null;
  state: LinkRuntimeState;
  inlineTemplateBlobUrl?: string;
};

const ORCHESTRATED_ATTR = 'data-orchestrated';
const ORCHESTRATOR_OWNER_ATTR = 'data-orchestrator-owner';
const ORCHESTRATOR_STATE_ATTR = 'data-orchestrator-state';
const ORCHESTRATED_INSTANCE_ATTR = 'data-orchestrated-instance';

@customElement('link-orchestration')
export class LinkOrchestration extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    .orchestrator-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.35rem;
      font-size: 0.875em;
      line-height: 1;
    }

    .orchestrated-link-host {
      display: contents;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['config-src', 'debounce-ms', 'max-concurrent-pipelines', 'allow-recursive'];
  }

  configSrc?: string;
  debounceMs: number = 120;
  maxConcurrentPipelines: number = 4;
  allowRecursive: boolean = false;

  private _observer: MutationObserver | null = null;
  private _scanTimer: number | null = null;
  private _active = 0;
  private _queue: Array<() => Promise<void>> = [];
  private _records = new Map<HTMLAnchorElement, LinkRecord>();
  private _ownerId = `orchestrator-${Math.random().toString(36).slice(2, 10)}`;
  private _resolvedConfig: LinkOrchestrationConfig = { rules: [] };
  private _configOverride: LinkOrchestrationConfig | null = null;
  private _isConnected = false;

  set config(value: LinkOrchestrationConfig | null) {
    this._configOverride = value;
    if (this._isConnected) {
      void this.loadConfig();
    }
  }

  get config(): LinkOrchestrationConfig | null {
    return this._configOverride;
  }

  override render() {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._isConnected = true;
    void this.loadConfig();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._isConnected = false;
    this.disconnectObserver();
    this.rollbackAll();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (oldValue === newValue) {
      return;
    }

    if (name === 'config-src') {
      this.configSrc = newValue ?? undefined;
    }

    if (name === 'debounce-ms') {
      const parsed = Number(newValue);
      this.debounceMs = Number.isFinite(parsed) ? parsed : 120;
    }

    if (name === 'max-concurrent-pipelines') {
      const parsed = Number(newValue);
      this.maxConcurrentPipelines = Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
    }

    if (name === 'allow-recursive') {
      this.allowRecursive = newValue !== null && newValue !== 'false';
    }

    if (this._isConnected) {
      void this.loadConfig();
    }
  }

  async loadConfig(): Promise<void> {
    try {
      const config = await this._resolveConfig();
      this._resolvedConfig = config;

      if (typeof config.debounceMs === 'number') {
        this.debounceMs = config.debounceMs;
      }
      if (typeof config.maxConcurrentPipelines === 'number') {
        this.maxConcurrentPipelines = Math.max(1, config.maxConcurrentPipelines);
      }
      if (typeof config.allowRecursive === 'boolean') {
        this.allowRecursive = config.allowRecursive;
      }

      this._startObserver();
      await this.refresh();
    } catch (error) {
      this._emitEvent('orchestrator-link-error', {
        message: error instanceof Error ? error.message : String(error),
        phase: 'config',
      });
    }
  }

  async refresh(): Promise<void> {
    this._emitEvent('orchestrator-scan-start', {
      ownerId: this._ownerId,
      scope: this._isGlobal() ? 'document' : 'descendants',
    });

    const candidates = this._collectCandidates();
    const matched = this._matchCandidates(candidates);

    for (const [link, record] of this._records.entries()) {
      const expectedRule = this._findFirstMatchingRule(link);
      if (!expectedRule || expectedRule.id !== record.ruleId) {
        this._rollbackLink(link);
      }
    }

    for (const item of matched) {
      if (this._records.has(item.link)) {
        continue;
      }
      this._enqueue(async () => this._processMatch(item.link, item.rule));
    }

    this._drainQueue();

    this._emitEvent('orchestrator-scan-complete', {
      ownerId: this._ownerId,
      candidates: candidates.length,
      matched: matched.length,
      active: this._records.size,
    });
  }

  rollbackAll(): void {
    const links = [...this._records.keys()];
    for (const link of links) {
      this._rollbackLink(link);
    }
  }

  disconnectObserver(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    if (this._scanTimer !== null) {
      window.clearTimeout(this._scanTimer);
      this._scanTimer = null;
    }
  }

  private _startObserver(): void {
    this.disconnectObserver();

    const root = this._scopeRoot();
    this._observer = new MutationObserver((mutations) => {
      if (this._shouldIgnoreMutations(mutations)) {
        return;
      }

      if (this._scanTimer !== null) {
        window.clearTimeout(this._scanTimer);
      }
      this._scanTimer = window.setTimeout(() => {
        void this.refresh();
      }, this.debounceMs);
    });

    this._observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'class', 'src'],
    });
  }

  private async _resolveConfig(): Promise<LinkOrchestrationConfig> {
    if (this._configOverride) {
      return this._configOverride;
    }

    const inlineScript = this.querySelector('script[type="application/json"]');
    if (inlineScript?.textContent?.trim()) {
      return this._parseConfig(inlineScript.textContent);
    }

    if (this.configSrc) {
      const response = await fetch(this.configSrc);
      if (!response.ok) {
        throw new Error(`Failed to fetch config from ${this.configSrc}: ${response.status} ${response.statusText}`);
      }
      const content = await response.text();
      return this._parseConfig(content);
    }

    return { rules: [] };
  }

  private _parseConfig(raw: string): LinkOrchestrationConfig {
    const parsed = JSON.parse(raw) as Partial<LinkOrchestrationConfig>;
    return {
      debounceMs: parsed.debounceMs,
      maxConcurrentPipelines: parsed.maxConcurrentPipelines,
      allowRecursive: parsed.allowRecursive,
      decorators: parsed.decorators,
      rules: Array.isArray(parsed.rules) ? parsed.rules : [],
    };
  }

  private _collectCandidates(): HTMLAnchorElement[] {
    const root = this._scopeRoot();
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));

    return links.filter(link => {
      if (!this.allowRecursive && link.closest(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`)) {
        return false;
      }

      if (this._isGlobal() && this._isOwnedByBodyOrchestrator(link)) {
        return false;
      }

      const owner = link.getAttribute(ORCHESTRATOR_OWNER_ATTR);
      if (owner && owner !== this._ownerId) {
        return false;
      }

      return true;
    });
  }

  private _matchCandidates(candidates: HTMLAnchorElement[]): Array<{ link: HTMLAnchorElement; rule: LinkOrchestrationRule }> {
    const matches: Array<{ link: HTMLAnchorElement; rule: LinkOrchestrationRule }> = [];

    for (const link of candidates) {
      const rule = this._findFirstMatchingRule(link);
      if (rule) {
        matches.push({ link, rule });
      }
    }

    return matches;
  }

  private _findFirstMatchingRule(link: HTMLAnchorElement): LinkOrchestrationRule | null {
    for (const rule of this._resolvedConfig.rules) {
      if (!rule || !rule.id || rule.enabled === false) {
        continue;
      }
      if (this._matchesRule(link, rule)) {
        return rule;
      }
    }

    return null;
  }

  private _shouldIgnoreMutations(mutations: MutationRecord[]): boolean {
    if (mutations.length === 0) {
      return true;
    }

    return mutations.every((mutation) => {
      const targetNode = mutation.target as Element | null;
      const isInternalTarget = !!targetNode?.closest?.(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`);

      const addedAllInternal = Array.from(mutation.addedNodes).every((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return true;
        }
        return !!(node as Element).closest?.(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`) ||
          (node as Element).hasAttribute?.(ORCHESTRATED_INSTANCE_ATTR);
      });

      const removedAllInternal = Array.from(mutation.removedNodes).every((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return true;
        }
        const element = node as Element;
        return element.hasAttribute?.(ORCHESTRATED_INSTANCE_ATTR) ||
          !!element.querySelector?.(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`);
      });

      return isInternalTarget && addedAllInternal && removedAllInternal;
    });
  }

  private _matchesRule(link: HTMLAnchorElement, rule: LinkOrchestrationRule): boolean {
    const match = rule.match;
    if (!match || match.enabled === false) {
      return false;
    }

    if (match.css) {
      try {
        if (!link.matches(match.css)) {
          return false;
        }
      } catch {
        return false;
      }
    }

    if (match.xpath && !this._matchesXPath(link, match.xpath)) {
      return false;
    }

    if (match.parentCss) {
      try {
        if (!link.closest(match.parentCss)) {
          return false;
        }
      } catch {
        return false;
      }
    }

    if (match.urlPattern && !this._globMatch(link.href, match.urlPattern)) {
      return false;
    }

    if (match.urlRegex) {
      let regex: RegExp;
      try {
        regex = new RegExp(match.urlRegex);
      } catch {
        return false;
      }
      if (!regex.test(link.href)) {
        return false;
      }
    }

    if (match.hostEquals) {
      const url = this._safeUrl(link.href);
      if (!url || url.hostname !== match.hostEquals) {
        return false;
      }
    }

    if (match.pathStartsWith) {
      const url = this._safeUrl(link.href);
      if (!url || !url.pathname.startsWith(match.pathStartsWith)) {
        return false;
      }
    }

    const contentType = rule.overrideContentType || this._detectContentType(link);
    if (match.contentType && contentType !== match.contentType) {
      return false;
    }

    return true;
  }

  private _matchesXPath(link: HTMLAnchorElement, xpath: string): boolean {
    try {
      const root = this._scopeRoot();
      const result = document.evaluate(
        xpath,
        root,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );

      for (let i = 0; i < result.snapshotLength; i += 1) {
        const node = result.snapshotItem(i);
        if (node === link) {
          return true;
        }
      }
    } catch {
      return false;
    }

    return false;
  }

  private _safeUrl(value: string): URL | null {
    try {
      return new URL(value, document.baseURI);
    } catch {
      return null;
    }
  }

  private _globMatch(value: string, pattern: string): boolean {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${escaped}$`);
    return regex.test(value);
  }

  private _detectContentType(link: HTMLAnchorElement): LinkContentType {
    const hasMedia = !!link.querySelector('img, picture, video, svg, canvas');
    return hasMedia ? 'image' : 'text';
  }

  private _enqueue(task: () => Promise<void>): void {
    this._queue.push(task);
  }

  private _drainQueue(): void {
    while (this._active < this.maxConcurrentPipelines && this._queue.length > 0) {
      const task = this._queue.shift();
      if (!task) {
        break;
      }

      this._active += 1;
      void task().finally(() => {
        this._active -= 1;
        this._drainQueue();
      });
    }
  }

  private async _processMatch(link: HTMLAnchorElement, rule: LinkOrchestrationRule): Promise<void> {
    const decorators = this._resolveDecorators(rule);
    const contentType = rule.overrideContentType || this._detectContentType(link);

    this._emitEvent('orchestrator-link-loading', {
      ownerId: this._ownerId,
      href: link.href,
      ruleId: rule.id,
      contentType,
    });

    const record: LinkRecord = {
      link,
      ruleId: rule.id,
      ownerId: this._ownerId,
      pipelineHost: null,
      displayElement: null,
      adapterElement: null,
      iconElement: null,
      state: 'loading',
    };

    this._records.set(link, record);

    link.setAttribute(ORCHESTRATED_ATTR, 'true');
    link.setAttribute(ORCHESTRATOR_OWNER_ATTR, this._ownerId);
    link.setAttribute(ORCHESTRATOR_STATE_ATTR, 'loading');

    if (decorators.enabled && contentType === 'text') {
      record.iconElement = this._setLifecycleIcon(link, decorators.icons?.loading ?? '⏳');
    }

    try {
      const staged = await this._createStagedPipeline(link, rule);
      this._commitPipeline(link, record, staged, decorators, contentType);

      this._emitEvent('orchestrator-link-ready', {
        ownerId: this._ownerId,
        href: link.href,
        ruleId: rule.id,
        contentType,
      });
    } catch (error) {
      this._cleanupRecord(record);
      link.removeAttribute(ORCHESTRATED_ATTR);
      link.removeAttribute(ORCHESTRATOR_OWNER_ATTR);
      link.removeAttribute(ORCHESTRATOR_STATE_ATTR);

      this._emitEvent('orchestrator-link-error', {
        ownerId: this._ownerId,
        href: link.href,
        ruleId: rule.id,
        message: error instanceof Error ? error.message : String(error),
        phase: 'pipeline',
      });

      this._records.delete(link);
    }
  }

  private _resolveDecorators(rule: LinkOrchestrationRule): LinkDecoratorConfig {
    return {
      ...this._resolvedConfig.decorators,
      ...rule.decorators,
      icons: {
        ...this._resolvedConfig.decorators?.icons,
        ...rule.decorators?.icons,
      },
    };
  }

  private _setLifecycleIcon(link: HTMLAnchorElement, icon: string): HTMLSpanElement {
    const existing = link.querySelector(':scope > .orchestrator-icon');
    if (existing) {
      existing.textContent = icon;
      return existing as HTMLSpanElement;
    }

    const iconElement = document.createElement('span');
    iconElement.className = 'orchestrator-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = icon;

    link.prepend(iconElement);
    return iconElement;
  }

  private async _createStagedPipeline(
    link: HTMLAnchorElement,
    rule: LinkOrchestrationRule,
  ): Promise<{ display: HTMLElement; lens: HTMLElement; adapter: HTMLElement; inlineTemplateBlobUrl?: string }> {
    const adapter = document.createElement('source-rdf');
    adapter.setAttribute('url', rule.adapter?.url ?? link.href);

    this._applyAdapterConfig(adapter, rule.adapter);

    const lens = document.createElement('rdf-lens');
    this._applyLensConfig(lens, rule.lens);
    lens.appendChild(adapter);

    const display = document.createElement('lens-display');
    const inlineTemplateBlobUrl = this._applyDisplayConfig(display, rule.display);
    display.appendChild(lens);

    await this._awaitPipeline(display);

    return {
      display,
      lens,
      adapter,
      inlineTemplateBlobUrl,
    };
  }

  private _applyAdapterConfig(adapter: HTMLElement, config?: AdapterConfig): void {
    if (!config) {
      return;
    }

    const rdfConfig = this._buildAdapterConfigRdf(config);
    if (rdfConfig) {
      adapter.setAttribute('config', rdfConfig);
    }
  }

  private _buildAdapterConfigRdf(config: AdapterConfig): string {
    const triples: string[] = [];

    if (config.url) triples.push(`srdf:url ${this._iriOrString(config.url)}`);
    if (config.format) triples.push(`srdf:format ${this._ttlString(config.format)}`);
    if (config.strategy) triples.push(`srdf:strategy ${this._ttlString(config.strategy)}`);
    if (config.subject) triples.push(`srdf:subject ${this._iriOrString(config.subject)}`);
    if (config.subjectQuery) triples.push(`srdf:subjectQuery ${this._ttlString(config.subjectQuery)}`);
    if (config.subjectClass) triples.push(`srdf:subjectClass ${this._iriOrString(config.subjectClass)}`);
    if (typeof config.depth === 'number') triples.push(`srdf:depth ${config.depth}`);
    if (config.cache) triples.push(`srdf:cache ${this._ttlString(config.cache)}`);
    if (typeof config.cacheTtl === 'number') triples.push(`srdf:cacheTtl ${config.cacheTtl}`);
    if (typeof config.shared === 'boolean') triples.push(`srdf:shared ${config.shared}`);
    if (config.headers) triples.push(`srdf:headers ${this._ttlString(JSON.stringify(config.headers))}`);

    if (triples.length === 0) {
      return '';
    }

    return [
      '@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .',
      '',
      `[] a srdf:SourceRdfConfig ;\n  ${triples.join(' ;\n  ')} .`,
    ].join('\n');
  }

  private _ttlString(value: string): string {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }

  private _iriOrString(value: string): string {
    if (/^https?:\/\//i.test(value)) {
      return `<${value}>`;
    }
    return this._ttlString(value);
  }

  private _applyLensConfig(lens: HTMLElement, config?: LensConfig): void {
    if (!config) {
      return;
    }

    const rdfConfig = this._buildLensConfigRdf(config);
    if (rdfConfig) {
      lens.setAttribute('config', rdfConfig);
    }
  }

  private _buildLensConfigRdf(config: LensConfig): string {
    const triples: string[] = [];

    if (config.shapeFile) triples.push(`lrdf:shapeFile ${this._iriOrString(config.shapeFile)}`);
    if (config.shapeClass) triples.push(`lrdf:shapeClass ${this._iriOrString(config.shapeClass)}`);
    if (config.shapes) triples.push(`lrdf:shapes ${this._ttlString(config.shapes)}`);
    if (typeof config.strict === 'boolean') triples.push(`lrdf:strict ${config.strict}`);
    if (typeof config.multiple === 'boolean') triples.push(`lrdf:multiple ${config.multiple}`);
    if (config.subject) triples.push(`lrdf:subject ${this._iriOrString(config.subject)}`);

    if (triples.length === 0) {
      return '';
    }

    return [
      '@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .',
      '',
      `[] a lrdf:RdfLensConfig ;\n  ${triples.join(' ;\n  ')} .`,
    ].join('\n');
  }

  private _applyDisplayConfig(display: HTMLElement, config?: DisplayConfig): string | undefined {
    if (!config) {
      return undefined;
    }

    if (config.mode) display.setAttribute('mode', config.mode);
    if (config.theme) display.setAttribute('theme', config.theme);
    if (config.class) display.setAttribute('class', config.class);

    if (config.templateInline && !config.template) {
      const blob = new Blob([config.templateInline], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      display.setAttribute('template', url);
      return url;
    }

    if (config.template) {
      display.setAttribute('template', config.template);
    }

    return undefined;
  }

  private _awaitPipeline(display: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const stage = document.createElement('div');
      stage.style.display = 'none';
      stage.appendChild(display);
      document.body.appendChild(stage);

      const done = () => {
        display.removeEventListener('render-complete', onReady as EventListener);
        display.removeEventListener('render-error', onError as EventListener);
        display.removeEventListener('shape-error', onError as EventListener);
        display.removeEventListener('triplestore-error', onError as EventListener);
        stage.remove();
      };

      const onReady = () => {
        done();
        resolve();
      };

      const onError = (event: Event) => {
        done();
        const detail = (event as CustomEvent).detail as { message?: string } | undefined;
        reject(new Error(detail?.message || 'Pipeline failed'));
      };

      display.addEventListener('render-complete', onReady as EventListener, { once: true });
      display.addEventListener('render-error', onError as EventListener, { once: true });
      display.addEventListener('shape-error', onError as EventListener, { once: true });
      display.addEventListener('triplestore-error', onError as EventListener, { once: true });
    });
  }

  private _commitPipeline(
    link: HTMLAnchorElement,
    record: LinkRecord,
    staged: { display: HTMLElement; adapter: HTMLElement; inlineTemplateBlobUrl?: string },
    decorators: LinkDecoratorConfig,
    contentType: LinkContentType,
  ): void {
    const parent = link.parentNode;
    if (!parent) {
      throw new Error('Target link has no parent node');
    }

    const host = document.createElement('span');
    host.className = 'orchestrated-link-host';
    host.setAttribute(ORCHESTRATED_INSTANCE_ATTR, 'true');
    host.setAttribute(ORCHESTRATOR_OWNER_ATTR, this._ownerId);

    if (decorators.enabled && contentType === 'text') {
      const icon = document.createElement('span');
      icon.className = 'orchestrator-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = decorators.icons?.ready ?? '✅';
      host.appendChild(icon);
      record.iconElement?.remove();
      record.iconElement = icon;
    } else if (record.iconElement) {
      record.iconElement.remove();
      record.iconElement = null;
    }

    const adapterElement = staged.adapter;
    link.hidden = true;
    link.setAttribute('aria-hidden', 'true');
    adapterElement.appendChild(link);

    host.appendChild(staged.display);
    parent.appendChild(host);

    record.pipelineHost = host;
    record.displayElement = staged.display;
    record.adapterElement = adapterElement;
    record.inlineTemplateBlobUrl = staged.inlineTemplateBlobUrl;
    record.state = 'ready';

    link.setAttribute(ORCHESTRATOR_STATE_ATTR, 'ready');
  }

  private _rollbackLink(link: HTMLAnchorElement): void {
    const record = this._records.get(link);
    if (!record) {
      return;
    }

    if (record.pipelineHost && record.pipelineHost.parentNode) {
      const originalParent = record.pipelineHost.parentNode;
      link.hidden = false;
      link.removeAttribute('aria-hidden');
      originalParent.insertBefore(link, record.pipelineHost);
      record.pipelineHost.remove();
    }

    link.removeAttribute(ORCHESTRATED_ATTR);
    link.removeAttribute(ORCHESTRATOR_OWNER_ATTR);
    link.setAttribute(ORCHESTRATOR_STATE_ATTR, 'rolled-back');

    this._cleanupRecord(record);
    this._records.delete(link);

    this._emitEvent('orchestrator-link-rollback', {
      ownerId: this._ownerId,
      href: link.href,
      ruleId: record.ruleId,
    });
  }

  private _cleanupRecord(record: LinkRecord): void {
    if (record.iconElement) {
      record.iconElement.remove();
      record.iconElement = null;
    }

    if (record.inlineTemplateBlobUrl) {
      URL.revokeObjectURL(record.inlineTemplateBlobUrl);
      record.inlineTemplateBlobUrl = undefined;
    }

    if (record.pipelineHost) {
      record.pipelineHost.remove();
      record.pipelineHost = null;
    }
  }

  private _scopeRoot(): ParentNode {
    if (this._isGlobal()) {
      return document;
    }
    return this;
  }

  private _isGlobal(): boolean {
    return this.parentElement?.tagName === 'HEAD';
  }

  private _isOwnedByBodyOrchestrator(link: HTMLAnchorElement): boolean {
    const orchestrators = Array.from(document.querySelectorAll('body link-orchestration'));
    for (const orchestrator of orchestrators) {
      if (orchestrator !== this && orchestrator.contains(link)) {
        return true;
      }
    }
    return false;
  }

  private _emitEvent(eventName: string, detail: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'link-orchestration': LinkOrchestration;
  }

  interface GlobalEventHandlersEventMap {
    'orchestrator-scan-start': CustomEvent<Record<string, unknown>>;
    'orchestrator-scan-complete': CustomEvent<Record<string, unknown>>;
    'orchestrator-link-loading': CustomEvent<Record<string, unknown>>;
    'orchestrator-link-ready': CustomEvent<Record<string, unknown>>;
    'orchestrator-link-error': CustomEvent<Record<string, unknown>>;
    'orchestrator-link-rollback': CustomEvent<Record<string, unknown>>;
  }
}
