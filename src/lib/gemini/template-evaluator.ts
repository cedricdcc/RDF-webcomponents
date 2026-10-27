/**
 * Utility to evaluate Mustache-style templates against JSON data for live preview.
 * Matches the syntax and semantics of <lens-display>'s TemplateEngine:
 * - {{#each items}}...{{/each}}
 * - {{#field}}...{{/field}}
 * - {{^field}}...{{/field}}
 * - {{field}} and {{{field}}}
 * - {{@index}}
 * - Dot notation for nested properties (e.g. {{address.city}})
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getNestedValue(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;
  if (!path || path.trim() === '') return undefined;

  const parts = path.split('.').map(p => p.trim()).filter(Boolean);
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    // Array index support: field[0]
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      current = current[arrayName]?.[parseInt(index, 10)];
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Render a single data item through a template.
 */
function renderItem(template: string, data: any, index: number = 0): string {
  if (!template) return '';
  let result = template;

  // Replace {{@index}}
  result = result.replace(/\{\{@index\}\}/g, String(index));

  // 1. Handle inner loops: {{#each field}}...{{/each}}
  result = result.replace(/\{\{#each\s+([a-zA-Z0-9_.-]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, field, inner) => {
    const arr = getNestedValue(data, field);
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          return renderItem(inner, item, idx);
        }
        return inner.replace(/\{\{this\}\}/g, escapeHtml(String(item))).replace(/\{\{@index\}\}/g, String(idx));
      }).join('');
    }
    return '';
  });

  // 2. Handle conditionals: {{#field}}...{{/field}}
  // Note: Only match when field is not 'each'
  result = result.replace(/\{\{#(?!each\b)([a-zA-Z0-9_.-]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, field, inner) => {
    const val = getNestedValue(data, field);
    const isTruthy = val !== undefined && val !== null && val !== false && val !== '' && !(Array.isArray(val) && val.length === 0);
    if (isTruthy) {
      return renderItem(inner, data, index);
    }
    return '';
  });

  // 3. Handle inverse conditionals: {{^field}}...{{/field}}
  result = result.replace(/\{\{\^([a-zA-Z0-9_.-]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, field, inner) => {
    const val = getNestedValue(data, field);
    const isFalsy = val === undefined || val === null || val === false || val === '' || (Array.isArray(val) && val.length === 0);
    if (isFalsy) {
      return renderItem(inner, data, index);
    }
    return '';
  });

  // 4. Handle unescaped interpolation: {{{field}}}
  result = result.replace(/\{\{\{([a-zA-Z0-9_.-]+)\}\}\}/g, (_, field) => {
    const val = getNestedValue(data, field.trim());
    return val !== undefined && val !== null ? String(val) : '';
  });

  // 5. Handle simple interpolation: {{field}}
  result = result.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, field) => {
    const trimmed = field.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('^') || trimmed === 'this' || trimmed === '@index') {
      return '';
    }
    const val = getNestedValue(data, trimmed);
    return val !== undefined && val !== null ? escapeHtml(String(val)) : '';
  });

  return result;
}

/**
 * Main evaluation function. Takes a Mustache template and JSON data (object or array)
 * and returns the rendered HTML string ready for display.
 */
export function evaluateMustacheTemplate(templateHtml: string, jsonData: any): string {
  if (!templateHtml || !templateHtml.trim()) {
    return '';
  }

  // Normalize data into an items array and root object
  let items: any[] = [];
  let rootContext: any = {};

  if (Array.isArray(jsonData)) {
    items = jsonData;
    rootContext = { items, ...(jsonData[0] || {}) };
  } else if (jsonData && typeof jsonData === 'object') {
    if (Array.isArray(jsonData.items)) {
      items = jsonData.items;
      rootContext = jsonData;
    } else {
      items = [jsonData];
      rootContext = { items: [jsonData], ...jsonData };
    }
  } else {
    items = [{ value: String(jsonData) }];
    rootContext = { items };
  }

  let result = templateHtml;

  // Process {{#each items}}...{{/each}}
  const loopRegex = /\{\{#each\s+items\}\}([\s\S]*?)\{\{\/each\}\}/g;
  if (loopRegex.test(result)) {
    result = result.replace(/\{\{#each\s+items\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, inner) => {
      if (items.length === 0) {
        return '<p class="rdf-empty-note">No items found to render</p>';
      }
      return items.map((item, idx) => renderItem(inner, item, idx)).join('\n');
    });
  }

  // If there are remaining tags at root level (outside of {{#each items}}):
  result = renderItem(result, rootContext, 0);

  return result;
}

/**
 * Generates an isolated HTML document string suitable for an iframe srcDoc.
 * Injects responsive viewport, base typography, and custom reset styles.
 */
export function generatePreviewDocument(renderedBodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 1rem;
      background-color: #f8fafc;
      color: #1e293b;
      min-height: 100%;
      -webkit-font-smoothing: antialiased;
    }
    .rdf-empty-note {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
      font-style: italic;
      font-size: 0.875rem;
    }
    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  </style>
</head>
<body>
  ${renderedBodyHtml}
</body>
</html>`;
}
