/**
 * Converter between Mustache HTML templates and VisualBlock structures.
 * Integrates with Step 3 Visual Designer in the RDF Webcomponents demo.
 */

export type VisualBlockType = 'property' | 'conditional' | 'html';

export interface VisualBlock {
  id: string;
  type: VisualBlockType;
  name: string;
  label: string;
  content?: string;
}

export type DisplayArchetype =
  | 'card'
  | 'figure'
  | 'profile'
  | 'table'
  | 'metric'
  | 'list';

/**
 * Parses an HTML Mustache template into an array of VisualBlocks for the visual canvas.
 */
export function parseTemplateToBlocks(templateHtml: string): VisualBlock[] {
  const blocks: VisualBlock[] = [];
  if (!templateHtml || !templateHtml.trim()) return blocks;

  // 1. Check if the template contains explicit block markers: <!-- Block: [?] name -->
  const blockMarkerRegex = /<!--\s*Block:\s*(\?)?\s*([^->]+?)\s*-->\s*([\s\S]*?)(?=<!--\s*Block:|$)/g;
  let hasExplicitMarkers = false;
  let match: RegExpExecArray | null;

  while ((match = blockMarkerRegex.exec(templateHtml)) !== null) {
    const isCond = Boolean(match[1]);
    const rawName = match[2].trim();
    const content = match[3].trim();

    // Skip the loop wrapper block marker
    if (rawName.startsWith('# each') || rawName.startsWith('/ each')) {
      continue;
    }

    hasExplicitMarkers = true;
    const name = rawName.replace(/^each\s+/, '').trim();
    const id = `block-${name}-${Date.now()}-${blocks.length}`;

    if (rawName.toLowerCase() === 'html') {
      blocks.push({
        id,
        type: 'html',
        name: 'html',
        label: 'Custom HTML',
        content,
      });
    } else if (isCond) {
      blocks.push({
        id,
        type: 'conditional',
        name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        content,
      });
    } else {
      blocks.push({
        id,
        type: 'property',
        name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        content,
      });
    }
  }

  if (hasExplicitMarkers && blocks.length > 0) {
    return blocks;
  }

  // 2. Fallback heuristic parser: Extract inside {{#each items}} or body
  const innerMatch = /\{\{#each\s+items\}\}([\s\S]*?)\{\{\/each\}\}/i.exec(templateHtml);
  const searchContent = innerMatch ? innerMatch[1] : templateHtml;

  // Find conditional blocks: {{#field}}...{{/field}}
  const condRegex = /\{\{#([a-zA-Z0-9_.-]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  const processedFields = new Set<string>();

  while ((match = condRegex.exec(searchContent)) !== null) {
    const fieldName = match[1];
    if (fieldName === 'items' || fieldName === 'this') continue;

    processedFields.add(fieldName);
    blocks.push({
      id: `block-${fieldName}-${Date.now()}-${blocks.length}`,
      type: 'conditional',
      name: fieldName,
      label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
      content: match[2].trim(),
    });
  }

  // Find simple property interpolations: {{field}}
  const propRegex = /\{\{([a-zA-Z0-9_.-]+)\}\}/g;
  while ((match = propRegex.exec(searchContent)) !== null) {
    const fieldName = match[1];
    if (
      fieldName.startsWith('#') ||
      fieldName.startsWith('/') ||
      fieldName.startsWith('^') ||
      fieldName === 'this' ||
      fieldName === '@index' ||
      processedFields.has(fieldName)
    ) {
      continue;
    }

    processedFields.add(fieldName);
    blocks.push({
      id: `block-${fieldName}-${Date.now()}-${blocks.length}`,
      type: 'property',
      name: fieldName,
      label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
    });
  }

  return blocks;
}

/**
 * Compiles an array of VisualBlocks into an HTML template with archetype-specific styles.
 */
export function blocksToTemplate(
  blocks: VisualBlock[],
  archetype: DisplayArchetype = 'card',
  customStyles?: string
): string {
  let fieldsHtml = '';

  blocks.forEach(block => {
    if (block.type === 'property') {
      fieldsHtml += `    <!-- Block: ${block.name} -->\n`;
      fieldsHtml += `    <h3 class="item-title">{{${block.name}}}</h3>\n\n`;
    } else if (block.type === 'conditional') {
      fieldsHtml += `    <!-- Block: ? ${block.name} -->\n`;
      fieldsHtml += `    {{#${block.name}}}<p class="item-field"><strong>${block.label}:</strong> {{${block.name}}}</p>{{/${block.name}}}\n\n`;
    } else if (block.type === 'html') {
      fieldsHtml += `    <!-- Block: HTML -->\n`;
      fieldsHtml += `    ${block.content || '<div class="custom-block"></div>'}\n\n`;
    }
  });

  const styles = customStyles || getArchetypeStyles(archetype);

  return `<div class="rdf-${archetype}-grid">
  <!-- Block: # each items -->
  {{#each items}}
  <article class="rdf-${archetype}-item">
${fieldsHtml}  </article>
  {{/each}}
</div>

<style>
${styles}
</style>`;
}

/**
 * Returns tailored CSS styles for each presentation archetype.
 */
export function getArchetypeStyles(archetype: DisplayArchetype): string {
  switch (archetype) {
    case 'figure':
      return `  .rdf-figure-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem 0;
  }
  .rdf-figure-item {
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.25rem;
    background: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .rdf-figure-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .rdf-figure-item .item-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #0f172a;
  }
  .rdf-figure-item .item-field {
    margin: 0.35rem 0;
    font-size: 0.9rem;
    color: #475569;
  }`;

    case 'profile':
      return `  .rdf-profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
    padding: 0.5rem 0;
  }
  .rdf-profile-item {
    border: 1px solid #cbd5e1;
    border-top: 4px solid #6366f1;
    border-radius: 0.75rem;
    padding: 1.25rem;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }
  .rdf-profile-item .item-title {
    margin: 0 0 0.75rem 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1e1b4b;
  }
  .rdf-profile-item .item-field {
    margin: 0.35rem 0;
    font-size: 0.85rem;
    color: #475569;
  }`;

    case 'table':
      return `  .rdf-table-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
  .rdf-table-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    background: #ffffff;
  }
  .rdf-table-item .item-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    min-width: 140px;
  }
  .rdf-table-item .item-field {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
  }`;

    case 'metric':
      return `  .rdf-metric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    padding: 0.5rem 0;
  }
  .rdf-metric-item {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.25rem;
    background: #f8fafc;
    text-align: center;
  }
  .rdf-metric-item .item-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    font-weight: 800;
    color: #0284c7;
  }
  .rdf-metric-item .item-field {
    margin: 0.25rem 0;
    font-size: 0.85rem;
    color: #475569;
  }`;

    case 'list':
      return `  .rdf-list-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .rdf-list-item {
    border-left: 3px solid #0284c7;
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-left-width: 4px;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
  }
  .rdf-list-item .item-title {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
  }
  .rdf-list-item .item-field {
    margin: 0.2rem 0;
    font-size: 0.85rem;
    color: #64748b;
  }`;

    case 'card':
    default:
      return `  .rdf-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.25rem;
    padding: 0.5rem 0;
  }
  .rdf-card-item {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.25rem;
    background: #ffffff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  .rdf-card-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1;
  }
  .rdf-card-item .item-title {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #0f172a;
  }
  .rdf-card-item .item-field {
    margin: 0.35rem 0;
    font-size: 0.875rem;
    color: #475569;
    line-height: 1.5;
  }`;
  }
}
