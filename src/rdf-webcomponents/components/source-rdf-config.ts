import type { DataSourceStrategy, RdfFormat } from '../types';
import { detectFormat, parseRdf } from '../core/worker/parsers';

export type CacheStrategy = 'none' | 'memory' | 'localStorage' | 'indexedDB';

export type SourceRdfConfig = {
  url?: string;
  format?: RdfFormat;
  strategy?: DataSourceStrategy;
  subject?: string;
  subjectQuery?: string;
  subjectClass?: string;
  depth?: number;
  cache?: CacheStrategy;
  cacheTtl?: number;
  shared?: boolean;
  headers?: Record<string, string>;
};

export type ParsedSourceRdfConfig = {
  config: SourceRdfConfig;
  warnings: string[];
  providedKeys: Set<string>;
};

export const SOURCE_RDF_NS = 'https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#';
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const SOURCE_RDF_CONFIG_TYPE = `${SOURCE_RDF_NS}SourceRdfConfig`;

export const CONFIG_KEYS = new Set([
  'url',
  'format',
  'strategy',
  'subject',
  'subjectQuery',
  'subjectClass',
  'depth',
  'cache',
  'cacheTtl',
  'shared',
  'headers',
]);

const ALLOWED_STRATEGIES = new Set<DataSourceStrategy>(['file', 'sparql', 'cbd']);

const RELEVANT_CONFIG_KEYS: Record<DataSourceStrategy, Set<string>> = {
  file: new Set(['url', 'format', 'strategy', 'cache', 'cacheTtl', 'shared', 'headers']),
  sparql: new Set([
    'url',
    'format',
    'strategy',
    'subject',
    'subjectQuery',
    'subjectClass',
    'cache',
    'cacheTtl',
    'shared',
    'headers',
  ]),
  cbd: new Set(['url', 'format', 'strategy', 'subject', 'depth', 'cache', 'cacheTtl', 'shared', 'headers']),
};

function parseBoolean(value: string): boolean {
  return value === 'true' || value === '1';
}

function parseHeadersLiteral(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('headers must be a JSON object string');
    }
    return parsed as Record<string, string>;
  } catch (error) {
    throw new Error(`Invalid headers in config RDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function parseSourceRdfConfigRdf(
  content: string,
  format: RdfFormat | undefined,
  source: string,
): Promise<ParsedSourceRdfConfig> {
  const parsedFormat = format ?? detectFormat(source, content);
  const parsed = await parseRdf(content, parsedFormat, source);

  if (parsed.errors.length > 0) {
    throw new Error(`Config parse failed: ${parsed.errors[0].message}`);
  }

  const warnings: string[] = [];
  const providedKeys = new Set<string>();
  const config: SourceRdfConfig = {};

  const configSubjects = new Set(
    parsed.quads
      .filter((quad) => quad.predicate.value === RDF_TYPE && quad.object.value === SOURCE_RDF_CONFIG_TYPE)
      .map((quad) => quad.subject.value),
  );

  for (const quad of parsed.quads) {
    if (configSubjects.size > 0 && !configSubjects.has(quad.subject.value)) {
      continue;
    }

    const predicate = quad.predicate.value;
    if (!predicate.startsWith(SOURCE_RDF_NS)) {
      continue;
    }

    const localName = predicate.slice(SOURCE_RDF_NS.length);
    if (!CONFIG_KEYS.has(localName)) {
      warnings.push(`Unknown source-rdf property '${localName}' in config RDF`);
      continue;
    }

    providedKeys.add(localName);
    const value = quad.object.value;

    switch (localName) {
      case 'url':
        config.url = value;
        break;
      case 'format':
        config.format = value as RdfFormat;
        break;
      case 'strategy':
        config.strategy = value as DataSourceStrategy;
        break;
      case 'subject':
        config.subject = value;
        break;
      case 'subjectQuery':
        config.subjectQuery = value;
        break;
      case 'subjectClass':
        config.subjectClass = value;
        break;
      case 'depth':
        config.depth = Number(value);
        break;
      case 'cache':
        config.cache = value as CacheStrategy;
        break;
      case 'cacheTtl':
        config.cacheTtl = Number(value);
        break;
      case 'shared':
        config.shared = parseBoolean(value);
        break;
      case 'headers':
        config.headers = parseHeadersLiteral(value);
        break;
      default:
        break;
    }
  }

  return { config, warnings, providedKeys };
}

function startsWithConstructOrDescribe(query: string): boolean {
  const withoutLineComments = query
    .split('\n')
    .map((line) => line.replace(/#.*/, ''))
    .join('\n');

  const normalized = withoutLineComments
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:BASE\s+<[^>]+>\s*)+/i, '')
    .replace(/^(?:PREFIX\s+[A-Za-z][\w-]*:\s*<[^>]+>\s*)+/i, '')
    .trim()
    .toUpperCase();

  return normalized.startsWith('CONSTRUCT') || normalized.startsWith('DESCRIBE');
}

export function validateSourceRdfConfig(config: SourceRdfConfig, providedKeys: Set<string>): string[] {
  const warnings: string[] = [];
  const strategy = config.strategy ?? 'file';

  if (!ALLOWED_STRATEGIES.has(strategy)) {
    throw new Error(`Unsupported strategy '${String(strategy)}'. Allowed: file, sparql, cbd`);
  }

  if (!config.url?.trim()) {
    throw new Error('source-rdf requires a url (either attribute or config RDF property).');
  }

  if (strategy === 'sparql') {
    const selectors = [config.subject, config.subjectQuery, config.subjectClass].filter((v) => !!v?.trim());
    if (selectors.length !== 1) {
      throw new Error('sparql strategy requires exactly one of: subject, subject-query, subject-class');
    }

    if (config.subjectQuery) {
      if (!startsWithConstructOrDescribe(config.subjectQuery)) {
        throw new Error('subject-query must be a DESCRIBE or CONSTRUCT query returning triples');
      }
    }
  }

  if (strategy === 'cbd' && !config.subject?.trim()) {
    throw new Error('cbd strategy requires subject');
  }

  if (providedKeys.size > 0) {
    const relevant = RELEVANT_CONFIG_KEYS[strategy];
    for (const key of providedKeys) {
      if (!relevant.has(key)) {
        warnings.push(`Property '${key}' is not used by strategy '${strategy}'`);
      }
    }
  }

  return warnings;
}

export function buildSparqlQuery(strategy: DataSourceStrategy, config: SourceRdfConfig): string {
  if (strategy === 'cbd') {
    return buildCbdConstructQuery(config.subject!, config.depth ?? 2);
  }

  if (config.subjectQuery) {
    return config.subjectQuery;
  }

  if (config.subjectClass) {
    return `CONSTRUCT { ?s ?p ?o } WHERE { ?s a <${config.subjectClass}> . ?s ?p ?o . }`;
  }

  return `DESCRIBE <${config.subject}>`;
}

export function buildCbdConstructQuery(subject: string, depth: number): string {
  const safeDepth = Math.max(1, depth);
  const constructLines = [`<${subject}> ?p ?o .`];
  const whereLines = [`<${subject}> ?p ?o .`];

  for (let i = 1; i <= safeDepth; i++) {
    const prevVar = i === 1 ? 'o' : `o${i - 1}`;
    constructLines.push(`?o${i - 1} ?p${i} ?o${i} .`);
    whereLines.push(`OPTIONAL { ?${prevVar} ?p${i} ?o${i} . FILTER(isBlank(?${prevVar})) }`);
  }

  return `CONSTRUCT { ${constructLines.join(' ')} } WHERE { ${whereLines.join(' ')} }`;
}
