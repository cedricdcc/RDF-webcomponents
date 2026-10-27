/**
 * Automated Template Validator for lens-display Mustache Templates.
 * Cross-references template variables and blocks against extracted RDF lens JSON data.
 */

export interface ValidationError {
  type: 'syntax' | 'missing_property' | 'unbalanced_tag' | 'html';
  message: string;
  tag?: string;
  line?: number;
}

export interface ValidationWarning {
  type: 'empty_loop' | 'unrecommended_pattern' | 'missing_style';
  message: string;
  suggestion?: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  matchedProperties: string[];
  missingProperties: string[];
  detectedBlocksCount: number;
}

/**
 * Extracts all property paths available in a sample JSON data structure.
 */
export function extractAvailableJsonProperties(data: any): Set<string> {
  const properties = new Set<string>();

  if (!data || typeof data !== 'object') {
    return properties;
  }

  // If top-level is an array, inspect elements and also allow 'items' loop variable
  if (Array.isArray(data)) {
    properties.add('items');
    for (const item of data) {
      if (item && typeof item === 'object') {
        for (const [key, val] of Object.entries(item)) {
          properties.add(key);
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            for (const subKey of Object.keys(val)) {
              properties.add(`${key}.${subKey}`);
              properties.add(subKey);
            }
          }
        }
      }
    }
    return properties;
  }

  // If top-level object
  for (const [key, val] of Object.entries(data)) {
    properties.add(key);
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const subKey of Object.keys(val)) {
        properties.add(`${key}.${subKey}`);
        properties.add(subKey);
      }
    } else if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object') {
          for (const subKey of Object.keys(item)) {
            properties.add(`${key}.${subKey}`);
            properties.add(subKey);
          }
        }
      }
    }
  }

  return properties;
}

/**
 * Validates a Mustache template against input JSON data.
 */
export function validateTemplateAgainstJson(
  templateHtml: string,
  jsonData: any
): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const availableProps = extractAvailableJsonProperties(jsonData);
  const matchedProperties = new Set<string>();
  const missingProperties = new Set<string>();

  if (!templateHtml || !templateHtml.trim()) {
    errors.push({
      type: 'syntax',
      message: 'Template is empty.',
    });
    return {
      valid: false,
      errors,
      warnings,
      matchedProperties: [],
      missingProperties: [],
      detectedBlocksCount: 0,
    };
  }

  // 1. Check balanced Mustache block tags: {{#tag}}, {{^tag}} vs {{/tag}}
  const tagStack: { name: string; full: string; line: number }[] = [];
  const blockRegex = /\{\{([#^/])\s*([a-zA-Z0-9_.-]+(?:\s+[a-zA-Z0-9_.-]+)?)\s*\}\}/g;
  const lines = templateHtml.split('\n');

  let match: RegExpExecArray | null;
  let blockCount = 0;

  // Track lines
  const getLineNumber = (index: number): number => {
    const textUpTo = templateHtml.slice(0, index);
    return textUpTo.split('\n').length;
  };

  while ((match = blockRegex.exec(templateHtml)) !== null) {
    blockCount++;
    const type = match[1]; // '#' or '^' or '/'
    const rawTag = match[2].trim();
    const line = getLineNumber(match.index);

    // Normalize tag name (e.g. "each items" -> "items" or "each items")
    let tagName = rawTag;
    if (rawTag.startsWith('each ')) {
      tagName = rawTag.slice(5).trim();
    }

    if (type === '#' || type === '^') {
      const isEach = rawTag.startsWith('each ');
      tagStack.push({ name: tagName, full: match[0], line, isEach });

      // Check if tag property exists in JSON (special keywords like 'this' or 'items' allowed)
      if (
        tagName !== 'this' &&
        tagName !== 'items' &&
        availableProps.size > 0 &&
        !availableProps.has(tagName)
      ) {
        missingProperties.add(tagName);
      } else if (availableProps.has(tagName)) {
        matchedProperties.add(tagName);
      }
    } else if (type === '/') {
      const top = tagStack.pop();
      if (!top) {
        errors.push({
          type: 'unbalanced_tag',
          message: `Unexpected closing block {{/${rawTag}}} with no matching opening block.`,
          tag: rawTag,
          line,
        });
      } else {
        const isMatchingEach = top.isEach && (rawTag === 'each' || tagName === top.name);
        const isStandardMatch = top.name === tagName || top.name === rawTag;
        if (!isMatchingEach && !isStandardMatch) {
          errors.push({
            type: 'unbalanced_tag',
            message: `Mismatched closing tag: expected closing for ${top.full} (line ${top.line}) but found {{/${rawTag}}} on line ${line}.`,
            tag: rawTag,
            line,
          });
        }
      }
    }
  }

  // Any remaining unclosed tags
  while (tagStack.length > 0) {
    const unclosed = tagStack.pop()!;
    errors.push({
      type: 'unbalanced_tag',
      message: `Unclosed block ${unclosed.full} starting on line ${unclosed.line}.`,
      tag: unclosed.name,
      line: unclosed.line,
    });
  }

  // 2. Check standalone variable expressions {{prop}}, {{{prop}}}, and ${data.prop}
  const varRegex = /\{\{\{?([a-zA-Z0-9_.-]+)\}?\}\}|\$\{data\.([a-zA-Z0-9_.-]+)\}/g;
  while ((match = varRegex.exec(templateHtml)) !== null) {
    const varName = (match[1] || match[2] || '').trim();
    if (!varName) continue;

    // Skip special built-in mustache variables
    if (varName === 'this' || varName === '@index' || varName === '@key' || varName === '.') {
      continue;
    }

    if (availableProps.size > 0) {
      if (availableProps.has(varName)) {
        matchedProperties.add(varName);
      } else {
        missingProperties.add(varName);
        // Only add warning if not already tracked
        warnings.push({
          type: 'unrecommended_pattern',
          message: `Property '{{${varName}}}' was not found in the provided lens JSON data.`,
          suggestion: `Check available properties: ${Array.from(availableProps).slice(0, 5).join(', ')}...`,
        });
      }
    }
  }

  // 3. Basic HTML element balanced tags check (div, article, section, p, h1-h6, table, tr, td)
  const htmlTagRegex = /<\/?([a-zA-Z0-9-]+)(?:\s+[^>]*)?>/g;
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);
  const htmlStack: { tag: string; line: number }[] = [];

  while ((match = htmlTagRegex.exec(templateHtml)) !== null) {
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[0].endsWith('/>');
    const tagName = match[1].toLowerCase();
    const line = getLineNumber(match.index);

    if (voidElements.has(tagName) || isSelfClosing) {
      continue;
    }

    // Ignore script, style, comments or mustache wrappers
    if (tagName === 'style' || tagName === 'script') {
      continue;
    }

    if (!isClosing) {
      htmlStack.push({ tag: tagName, line });
    } else {
      const top = htmlStack.pop();
      if (!top) {
        warnings.push({
          type: 'unrecommended_pattern',
          message: `Unmatched closing HTML tag </${tagName}> on line ${line}.`,
        });
      } else if (top.tag !== tagName) {
        warnings.push({
          type: 'unrecommended_pattern',
          message: `Mismatched HTML closing tag </${tagName}> on line ${line}, expected </${top.tag}> from line ${top.line}.`,
        });
      }
    }
  }

  // Remaining unclosed HTML tags
  if (htmlStack.length > 0) {
    const unclosedHtml = htmlStack.slice(-3).map(h => `<${h.tag}> (line ${h.line})`).join(', ');
    warnings.push({
      type: 'unrecommended_pattern',
      message: `Potentially unclosed HTML elements: ${unclosedHtml}`,
      suggestion: 'Ensure container tags like <div> and <article> are closed before {{/each}}',
    });
  }

  // 4. Style check: Recommend style container
  if (!templateHtml.includes('<style>') && !templateHtml.includes('class=')) {
    warnings.push({
      type: 'missing_style',
      message: 'Template contains no CSS <style> or class attributes. It may render without layout styling.',
      suggestion: 'Include a <style> block defining grid, card, or typography rules.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    matchedProperties: Array.from(matchedProperties),
    missingProperties: Array.from(missingProperties),
    detectedBlocksCount: blockCount,
  };
}
