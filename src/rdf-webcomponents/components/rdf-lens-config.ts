import type { RdfFormat } from '../types';
import { detectFormat, parseRdf } from '../core/worker/parsers';

export type RdfLensConfig = {
  shapeFile?: string;
  shapeClass?: string;
  shapes?: string;
  strict?: boolean;
  multiple?: boolean;
  subject?: string;
};

export type ParsedRdfLensConfig = {
  config: RdfLensConfig;
  warnings: string[];
  providedKeys: Set<string>;
};

export const RDF_LENS_NS = 'https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#';
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const RDF_LENS_CONFIG_TYPE = `${RDF_LENS_NS}RdfLensConfig`;

const CONFIG_KEYS = new Set([
  'shapeFile',
  'shapeClass',
  'shapes',
  'strict',
  'multiple',
  'subject',
]);

function parseBoolean(value: string): boolean {
  return value === 'true' || value === '1';
}

export async function parseRdfLensConfigRdf(
  content: string,
  format: RdfFormat | undefined,
  source: string,
): Promise<ParsedRdfLensConfig> {
  const parsedFormat = format ?? detectFormat(source, content);
  const parsed = await parseRdf(content, parsedFormat, source);

  if (parsed.errors.length > 0) {
    throw new Error(`Config parse failed: ${parsed.errors[0].message}`);
  }

  const warnings: string[] = [];
  const providedKeys = new Set<string>();
  const config: RdfLensConfig = {};

  const configSubjects = new Set(
    parsed.quads
      .filter((quad) => quad.predicate.value === RDF_TYPE && quad.object.value === RDF_LENS_CONFIG_TYPE)
      .map((quad) => quad.subject.value),
  );

  for (const quad of parsed.quads) {
    if (configSubjects.size > 0 && !configSubjects.has(quad.subject.value)) {
      continue;
    }

    const predicate = quad.predicate.value;
    if (!predicate.startsWith(RDF_LENS_NS)) {
      continue;
    }

    const localName = predicate.slice(RDF_LENS_NS.length);
    if (!CONFIG_KEYS.has(localName)) {
      warnings.push(`Unknown rdf-lens property '${localName}' in config RDF`);
      continue;
    }

    providedKeys.add(localName);
    const value = quad.object.value;

    switch (localName) {
      case 'shapeFile':
        config.shapeFile = value;
        break;
      case 'shapeClass':
        config.shapeClass = value;
        break;
      case 'shapes':
        config.shapes = value;
        break;
      case 'strict':
        config.strict = parseBoolean(value);
        break;
      case 'multiple':
        config.multiple = parseBoolean(value);
        break;
      case 'subject':
        config.subject = value;
        break;
      default:
        break;
    }
  }

  return { config, warnings, providedKeys };
}

export function validateRdfLensConfig(config: RdfLensConfig): string[] {
  if (!config.shapeFile?.trim() && !config.shapes?.trim()) {
    throw new Error('rdf-lens config requires either shapeFile or shapes.');
  }

  return [];
}