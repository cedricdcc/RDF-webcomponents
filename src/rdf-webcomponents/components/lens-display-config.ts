import type { RdfFormat, SerializedQuad } from '../types';

export type LensDisplayConfig = {
  theme?: string;
  class?: string;
};

export type ParsedLensDisplayConfig = {
  config: LensDisplayConfig;
  warnings: string[];
  providedKeys: Set<string>;
};

export const LENS_DISPLAY_NS = 'https://cedricdcc.github.io/RDF-webcomponents/ns/lens-display.ttl#';
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const LENS_DISPLAY_CONFIG_TYPE = `${LENS_DISPLAY_NS}LensDisplayConfig`;

const CONFIG_KEYS = new Set(['theme', 'class']);

export async function parseLensDisplayConfigRdf(
  content: string,
  format: RdfFormat | undefined,
  source: string,
): Promise<ParsedLensDisplayConfig> {
  const parsedQuads = await parseTurtleConfig(content, source, format);

  const warnings: string[] = [];
  const providedKeys = new Set<string>();
  const config: LensDisplayConfig = {};

  const configSubjects = new Set(
    parsedQuads
      .filter((quad) => quad.predicate.value === RDF_TYPE && quad.object.value === LENS_DISPLAY_CONFIG_TYPE)
      .map((quad) => quad.subject.value),
  );

  for (const quad of parsedQuads) {
    if (configSubjects.size > 0 && !configSubjects.has(quad.subject.value)) {
      continue;
    }

    const predicate = quad.predicate.value;
    if (!predicate.startsWith(LENS_DISPLAY_NS)) {
      continue;
    }

    const localName = predicate.slice(LENS_DISPLAY_NS.length);
    if (!CONFIG_KEYS.has(localName)) {
      warnings.push(`Unknown lens-display property '${localName}' in config RDF`);
      continue;
    }

    providedKeys.add(localName);
    const value = quad.object.value;

    if (localName === 'theme') {
      config.theme = value;
    }
    if (localName === 'class') {
      config.class = value;
    }
  }

  return { config, warnings, providedKeys };
}

export function validateLensDisplayConfig(_config: LensDisplayConfig): string[] {
  return [];
}

async function parseTurtleConfig(
  content: string,
  source: string,
  format: RdfFormat | undefined,
): Promise<SerializedQuad[]> {
  if (format && format !== 'turtle' && format !== 'n-triples' && format !== 'n-quads') {
    throw new Error(`lens-display config supports Turtle-like serializations only. Received '${format}'.`);
  }

  const { Parser } = await import('n3');
  const parser = new Parser({ baseIRI: source });

  return new Promise((resolve, reject) => {
    const quads: SerializedQuad[] = [];

    parser.parse(content, (error: Error | null, quad: any) => {
      if (error) {
        reject(new Error(`Config parse failed: ${error.message}`));
        return;
      }

      if (!quad) {
        resolve(quads);
        return;
      }

      quads.push({
        subject: serializeTerm(quad.subject),
        predicate: serializeTerm(quad.predicate),
        object: serializeTerm(quad.object),
        graph: quad.graph ? serializeTerm(quad.graph) : undefined,
      });
    });
  });
}

function serializeTerm(term: any): SerializedQuad['subject'] {
  return {
    termType: term.termType,
    value: term.value,
    datatype: term.datatype?.value,
    language: term.language,
  };
}