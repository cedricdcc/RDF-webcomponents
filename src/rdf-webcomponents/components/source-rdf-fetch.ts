type WrxExtractedRdf = {
  content: string;
  format: string;
  url: string;
};

type WrxExtractRdf = (url: string) => Promise<WrxExtractedRdf | null>;

const RDF_ACCEPT =
  'text/turtle,application/n-triples,application/n-quads,application/rdf+xml,application/ld+json,text/html';

let wrxExtractorPromise: Promise<WrxExtractRdf | null> | null = null;

function getRuntimeLabel(): string {
  return typeof window === 'undefined' ? 'server' : 'client';
}

async function getWrxExtractor(): Promise<WrxExtractRdf | null> {
  if (!wrxExtractorPromise) {
    wrxExtractorPromise = import('wrx')
      .then((module) => {
        const extractRDF = (module as { extractRDF?: unknown }).extractRDF;
        return typeof extractRDF === 'function' ? (extractRDF as WrxExtractRdf) : null;
      })
      .catch((error) => {
        console.warn(`[source-rdf][${getRuntimeLabel()}] wrx module could not be loaded; using direct fetch fallback.`, error);
        return null;
      });
  }

  return wrxExtractorPromise;
}

export async function fetchRdfWithWrxFallback(
  sourceUrl: string,
  headers: Record<string, string>,
): Promise<{ content: string; url: string; contentType: string | null }> {
  const extractor = await getWrxExtractor();
  if (extractor) {
    try {
      const extracted = await extractor(sourceUrl);
      if (extracted?.content) {
        console.log(
          `[source-rdf][${getRuntimeLabel()}] wrx extracted RDF from ${sourceUrl} -> ${extracted.url ?? sourceUrl} (${extracted.format ?? 'unknown format'})`,
        );
        return {
          content: extracted.content,
          url: extracted.url ?? sourceUrl,
          contentType: extracted.format ?? null,
        };
      }

      console.warn(
        `[source-rdf][${getRuntimeLabel()}] wrx returned no RDF content for ${sourceUrl}; falling back to direct fetch.`,
      );
    } catch {
      console.warn(
        `[source-rdf][${getRuntimeLabel()}] wrx extraction threw for ${sourceUrl}; falling back to direct fetch.`,
      );
    }
  } else {
    console.warn(
      `[source-rdf][${getRuntimeLabel()}] wrx extractor is unavailable; using direct fetch for ${sourceUrl}.`,
    );
  }

  const response = await fetch(sourceUrl, {
    headers: {
      Accept: RDF_ACCEPT,
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  return {
    content: await response.text(),
    url: response.url || sourceUrl,
    contentType: response.headers.get('Content-Type'),
  };
}
