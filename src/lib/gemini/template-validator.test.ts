import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateTemplateAgainstJson,
  extractAvailableJsonProperties,
} from './template-validator';
import { GeminiClient, DEFAULT_MODEL_CANDIDATES } from './gemini-client';

if (!globalThis.localStorage) {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  } as any;
}

describe('template-validator', () => {
  const sampleJson = [
    {
      name: 'Alice Smith',
      role: 'Data Engineer',
      email: 'alice@example.org',
      age: 31,
      city: 'Brussels',
      address: {
        zip: '1000',
        country: 'Belgium',
      },
    },
  ];

  it('extracts available properties correctly from JSON array and nested objects', () => {
    const props = extractAvailableJsonProperties(sampleJson);
    expect(props.has('name')).toBe(true);
    expect(props.has('role')).toBe(true);
    expect(props.has('email')).toBe(true);
    expect(props.has('age')).toBe(true);
    expect(props.has('city')).toBe(true);
    expect(props.has('address')).toBe(true);
    expect(props.has('address.zip')).toBe(true);
    expect(props.has('items')).toBe(true);
  });

  it('validates a correct Mustache template successfully', () => {
    const validTemplate = `
      <div class="cards">
        {{#each items}}
        <article class="person-card">
          <h3>{{name}}</h3>
          {{#role}}<p>Role: {{role}}</p>{{/role}}
          {{#email}}<p><a href="mailto:{{email}}">{{email}}</a></p>{{/email}}
        </article>
        {{/each}}
      </div>
      <style>
        .cards { display: grid; }
      </style>
    `;

    const report = validateTemplateAgainstJson(validTemplate, sampleJson);
    expect(report.valid).toBe(true);
    expect(report.errors.length).toBe(0);
    expect(report.matchedProperties).toContain('name');
    expect(report.matchedProperties).toContain('role');
    expect(report.matchedProperties).toContain('email');
  });

  it('detects unclosed Mustache block tags', () => {
    const unclosedTemplate = `
      <div>
        {{#each items}}
          <h3>{{name}}</h3>
          {{#email}}
            <p>{{email}}</p>
        <!-- Missing closing tag for email -->
        {{/each}}
      </div>
    `;

    const report = validateTemplateAgainstJson(unclosedTemplate, sampleJson);
    expect(report.valid).toBe(false);
    expect(report.errors.some(e => e.type === 'unbalanced_tag')).toBe(true);
  });

  it('flags properties used in template that do not exist in JSON', () => {
    const templateWithUnknownField = `
      <div>
        {{#each items}}
          <h3>{{name}}</h3>
          <p>{{salary}}</p>
          <p>{{department}}</p>
        {{/each}}
      </div>
    `;

    const report = validateTemplateAgainstJson(templateWithUnknownField, sampleJson);
    expect(report.missingProperties).toContain('salary');
    expect(report.missingProperties).toContain('department');
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('returns invalid if template is empty', () => {
    const report = validateTemplateAgainstJson('', sampleJson);
    expect(report.valid).toBe(false);
    expect(report.errors[0].type).toBe('syntax');
  });
});

describe('gemini-client fallback logic', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('falls back to the next model when primary model returns 404', async () => {
    const statusEvents: any[] = [];
    const mockApiKey = 'test-api-key-12345';

    // Mock fetch: first call (gemini-2.5-flash) returns 404, second call (gemini-2.0-flash) returns 200
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      callCount++;
      if (url.includes('gemini-2.5-flash')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: async () => JSON.stringify({ error: { message: 'models/gemini-2.5-flash not found' } }),
        });
      }
      if (url.includes('gemini-2.0-flash')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: '<article><h3>{{name}}</h3></article>' }],
                },
              },
            ],
          }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    const result = await GeminiClient.generateWithFallback('Design a card', {
      apiKey: mockApiKey,
      onStatusChange: update => statusEvents.push(update),
    });

    expect(callCount).toBe(2);
    expect(result.modelUsed).toBe('gemini-2.0-flash');
    expect(result.fallbacksTriggered).toContain('gemini-2.0-flash');
    expect(result.text).toContain('<article><h3>{{name}}</h3></article>');

    // Check status events for fallback notification
    const fallbackUpdate = statusEvents.find(e => e.status === 'fallback');
    expect(fallbackUpdate).toBeDefined();
    expect(fallbackUpdate.model).toBe('gemini-2.0-flash');
    expect(fallbackUpdate.previousModel).toBe('gemini-2.5-flash');
  });

  it('handles local storage operations safely', () => {
    GeminiClient.setStoredApiKey('my-secret-key');
    expect(GeminiClient.getStoredApiKey()).toBe('my-secret-key');
    GeminiClient.clearStoredApiKey();
    expect(GeminiClient.getStoredApiKey()).toBe('');
  });
});

describe('block-converter', () => {
  it('parses template with block annotations into VisualBlock array', async () => {
    const { parseTemplateToBlocks, blocksToTemplate } = await import('./block-converter');
    const annotatedHtml = `
      <div class="rdf-card-grid">
        {{#each items}}
        <article class="rdf-card-item">
          <!-- Block: name -->
          <h3 class="item-title">{{name}}</h3>

          <!-- Block: ? role -->
          {{#role}}<p><strong>Role:</strong> {{role}}</p>{{/role}}
        </article>
        {{/each}}
      </div>
    `;

    const blocks = parseTemplateToBlocks(annotatedHtml);
    expect(blocks.length).toBe(2);
    expect(blocks[0].name).toBe('name');
    expect(blocks[0].type).toBe('property');
    expect(blocks[1].name).toBe('role');
    expect(blocks[1].type).toBe('conditional');

    // Round-trip into template
    const compiled = blocksToTemplate(blocks, 'card');
    expect(compiled).toContain('<!-- Block: name -->');
    expect(compiled).toContain('<!-- Block: ? role -->');
    expect(compiled).toContain('{{#each items}}');
    expect(compiled).toContain('.rdf-card-grid');
  });
});

