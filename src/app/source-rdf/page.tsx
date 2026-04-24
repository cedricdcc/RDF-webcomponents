'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, Database, Copy, Check, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const basePath = rawBasePath
  ? rawBasePath.startsWith('/')
    ? rawBasePath
    : `/${rawBasePath}`
  : '';

const withBasePath = (path: string) => `${basePath}${path}`;
const WEB_COMPONENTS_VERSION = '20260311-1';

type DemoSourceRdfElement = HTMLElement & {
  url?: string;
  quads?: unknown[];
  quadCount?: number;
  reload?: () => Promise<void>;
};

const formats = [
  { name: 'Turtle', ext: '.ttl', mime: 'text/turtle' },
  { name: 'N-Triples', ext: '.nt', mime: 'application/n-triples' },
  { name: 'N-Quads', ext: '.nq', mime: 'application/n-quads' },
  { name: 'RDF/XML', ext: '.rdf', mime: 'application/rdf+xml' },
  { name: 'JSON-LD', ext: '.jsonld', mime: 'application/ld+json' },
  { name: 'SPARQL', ext: '-', mime: 'application/sparql-results+json' },
];

const strategies = [
  { name: 'file', description: 'Load static RDF files from URLs' },
  { name: 'sparql', description: 'Run SPARQL DESCRIBE/CONSTRUCT query strategies' },
  { name: 'cbd', description: 'Extract Concise Bounded Description' },
];

const attributes = [
  { name: 'url', type: 'string', required: false, description: 'Optional data URL override (takes precedence over srdf:url in config).' },
  { name: 'config', type: 'string', required: false, description: 'Inline RDF config in source-rdf vocabulary (Turtle, JSON-LD, RDF/XML, N-Triples, N-Quads).' },
];

const configProperties = [
  { name: 'srdf:url', type: 'IRI or string', required: true, description: 'Source URL or SPARQL endpoint URL.' },
  { name: 'srdf:format', type: 'string', required: false, description: 'RDF format hint: turtle, json-ld, rdf-xml, n-triples, n-quads.' },
  { name: 'srdf:strategy', type: 'string', required: false, description: 'Strategy: file, sparql, cbd. Defaults to file.' },
  { name: 'srdf:subject', type: 'IRI or string', required: false, description: 'Subject selector (required by cbd, optional for sparql).' },
  { name: 'srdf:subjectQuery', type: 'string', required: false, description: 'SPARQL DESCRIBE/CONSTRUCT query returning triples.' },
  { name: 'srdf:subjectClass', type: 'IRI or string', required: false, description: 'Class selector for sparql strategy.' },
  { name: 'srdf:depth', type: 'integer', required: false, description: 'CBD depth. Default: 2.' },
  { name: 'srdf:cache', type: 'string', required: false, description: 'Cache strategy: none, memory, localStorage, indexedDB.' },
  { name: 'srdf:cacheTtl', type: 'integer', required: false, description: 'Cache TTL in seconds.' },
  { name: 'srdf:shared', type: 'boolean', required: false, description: 'Whether to use shared cache.' },
  { name: 'srdf:headers', type: 'string', required: false, description: 'JSON object string for HTTP headers.' },
];

const events = [
  { name: 'triplestore-ready', detail: '{ quadCount, url, fromCache, duration }', description: 'Data loaded successfully' },
  { name: 'triplestore-error', detail: '{ message, phase, error }', description: 'Error loading data' },
  { name: 'triplestore-loading', detail: '{ phase }', description: 'Loading started' },
];

const examples = {
  static: `<!-- Load a static Turtle file with inline RDF config -->
<source-rdf config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:url <https://example.org/data.ttl> ;
  srdf:format "turtle" ;
  srdf:cache "indexedDB" ;
  srdf:shared true .'></source-rdf>`,

  sparql: `<!-- Query SPARQL endpoint for all instances of a class -->
<source-rdf config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:url <https://dbpedia.org/sparql> ;
  srdf:strategy "sparql" ;
  srdf:subjectClass <http://dbpedia.org/ontology/Person> ;
  srdf:cache "memory" ;
  srdf:cacheTtl 300 .'></source-rdf>`,

  cbd: `<!-- Extract CBD for a specific subject -->
<source-rdf config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:url <https://dbpedia.org/sparql> ;
  srdf:strategy "cbd" ;
  srdf:subject <http://dbpedia.org/resource/Albert_Einstein> ;
  srdf:depth 3 .'></source-rdf>`,

  query: `<!-- Use custom SPARQL CONSTRUCT query returning triples -->
<source-rdf config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:url <https://query.wikidata.org/sparql> ;
  srdf:strategy "sparql" ;
  srdf:subjectQuery "CONSTRUCT { ?s ?p ?o } WHERE { ?s wdt:P31 wd:Q5 . ?s ?p ?o } LIMIT 50" .'></source-rdf>`,

  config: `<!-- Config from inline script instead of config attribute -->
<source-rdf>
  <script type="text/turtle">
    @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
    [] a srdf:SourceRdfConfig ;
      srdf:url <https://example.org/data.ttl> ;
      srdf:strategy "file" .
  </script>
</source-rdf>`,

  headers: `<!-- Use RDF config headers for authenticated requests -->
<source-rdf config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:url <https://protected.example.org/data.ttl> ;
  srdf:headers "{\\"Authorization\\":\\"Bearer token123\\"}" .'></source-rdf>`,
};

export default function SourceRdfDocs() {
  const [copied, setCopied] = useState<string | null>(null);
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [bundleError, setBundleError] = useState(false);
  const [demoUri, setDemoUri] = useState(withBasePath('/demo/people.ttl'));
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoQuadCount, setDemoQuadCount] = useState(0);
  const [demoQuads, setDemoQuads] = useState<unknown[]>([]);
  const [demoHasRun, setDemoHasRun] = useState(false);
  const sourceDemoRef = useRef<DemoSourceRdfElement | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    if (!bundleLoaded || !sourceDemoRef.current) {
      return;
    }

    const adapter = sourceDemoRef.current;

    const onLoading = () => {
      setDemoLoading(true);
      setDemoError(null);
    };

    const onReady = (event: Event) => {
      const detail = (event as CustomEvent<{ quadCount?: number }>).detail;
      setDemoLoading(false);
      setDemoError(null);
      setDemoHasRun(true);
      setDemoQuadCount(detail?.quadCount ?? adapter.quadCount ?? adapter.quads?.length ?? 0);
      setDemoQuads(adapter.quads ?? []);
    };

    const onError = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setDemoLoading(false);
      setDemoError(detail.message ?? 'Unable to load RDF data from this URI.');
      setDemoQuadCount(0);
      setDemoQuads([]);
      setDemoHasRun(true);
    };

    adapter.addEventListener('triplestore-loading', onLoading);
    adapter.addEventListener('triplestore-ready', onReady);
    adapter.addEventListener('triplestore-error', onError);

    return () => {
      adapter.removeEventListener('triplestore-loading', onLoading);
      adapter.removeEventListener('triplestore-ready', onReady);
      adapter.removeEventListener('triplestore-error', onError);
    };
  }, [bundleLoaded]);

  const runDemo = async () => {
    const trimmed = demoUri.trim();
    if (!trimmed || !sourceDemoRef.current) {
      return;
    }

    setDemoLoading(true);
    setDemoError(null);
    setDemoQuadCount(0);
    setDemoQuads([]);
    setDemoHasRun(false);

    const adapter = sourceDemoRef.current;

    if (adapter.url === trimmed) {
      if (typeof adapter.reload === 'function') {
        await adapter.reload();
      }
      return;
    }

    // Updating url triggers one fetch via source-rdf.updated().
    adapter.setAttribute('url', trimmed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Script
        type="module"
        src={withBasePath(`/rdf-webcomponents.js?v=${WEB_COMPONENTS_VERSION}`)}
        strategy="afterInteractive"
        onLoad={() => setBundleLoaded(true)}
        onError={() => setBundleError(true)}
      />
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  &lt;source-rdf&gt;
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  RDF Data Fetching Component
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">On this page</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <a href="#overview" className="block text-blue-600 hover:underline">Overview</a>
                <a href="#formats" className="block text-slate-600 hover:text-slate-900">Supported Formats</a>
                <a href="#strategies" className="block text-slate-600 hover:text-slate-900">Data Strategies</a>
                <a href="#attributes" className="block text-slate-600 hover:text-slate-900">Attributes</a>
                <a href="#events" className="block text-slate-600 hover:text-slate-900">Events</a>
                <a href="#demo" className="block text-slate-600 hover:text-slate-900">URI Demo</a>
                <a href="#examples" className="block text-slate-600 hover:text-slate-900">Examples</a>
                <a href="#api" className="block text-slate-600 hover:text-slate-900">JavaScript API</a>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <Card id="overview">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  The source-rdf component fetches and parses RDF data from various sources
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  <code>&lt;source-rdf&gt;</code> is the foundation of the RDF Web Components stack. 
                  It handles fetching RDF data from URLs or SPARQL endpoints and parsing it into a 
                  triplestore that can be consumed by child components. The public element API is intentionally small:
                  only <code>url</code> and <code>config</code> attributes are supported, while strategy-specific options
                  live inside RDF config.
                </p>
                <h3 className="text-lg font-semibold mt-6">Key Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Auto-detection of RDF formats</li>
                  <li>Multiple caching strategies</li>
                  <li>SPARQL endpoint integration</li>
                  <li>CBD (Concise Bounded Description) extraction</li>
                  <li>Shared global cache for cross-component reuse</li>
                </ul>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card id="formats">
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {formats.map(format => (
                    <div key={format.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <span className="font-medium">{format.name}</span>
                        <span className="text-sm text-slate-500 ml-2">{format.ext}</span>
                      </div>
                      <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                        {format.mime}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategies */}
            <Card id="strategies">
              <CardHeader>
                <CardTitle>Data Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.map(strategy => (
                    <div key={strategy.name} className="p-4 border rounded-lg">
                      <code className="text-blue-600 font-mono">{strategy.name}</code>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{strategy.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card id="attributes">
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Attribute</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Default</th>
                        <th className="text-left py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributes.map(attr => (
                        <tr key={attr.name} className="border-b">
                          <td className="py-2">
                            <code className="text-blue-600">{attr.name}</code>
                            {attr.required && <span className="text-red-500 ml-1">*</span>}
                          </td>
                          <td className="py-2 text-slate-600">{attr.type}</td>
                          <td className="py-2 text-slate-500">{attr.default || '-'}</td>
                          <td className="py-2 text-slate-600">{attr.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <h4 className="mb-2 font-medium">RDF Config Properties</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Property</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Required</th>
                        <th className="text-left py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configProperties.map(prop => (
                        <tr key={prop.name} className="border-b">
                          <td className="py-2"><code className="text-blue-600">{prop.name}</code></td>
                          <td className="py-2 text-slate-600">{prop.type}</td>
                          <td className="py-2 text-slate-500">{prop.required ? 'yes' : 'no'}</td>
                          <td className="py-2 text-slate-600">{prop.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Events */}
            <Card id="events">
              <CardHeader>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.name} className="p-4 border rounded-lg">
                      <code className="text-green-600 font-mono">{event.name}</code>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-2 overflow-x-auto">
                        {event.detail}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card id="demo">
              <CardHeader>
                <CardTitle>Try It With Your Own URI</CardTitle>
                <CardDescription>
                  Enter an RDF URI and inspect the returned quads from <code>&lt;source-rdf&gt;</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <source-rdf ref={sourceDemoRef} hidden></source-rdf>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={demoUri}
                    onChange={(event) => setDemoUri(event.target.value)}
                    placeholder="https://example.org/data.ttl"
                    aria-label="RDF URI"
                  />
                  <Button
                    onClick={runDemo}
                    disabled={!bundleLoaded || bundleError || demoLoading || !demoUri.trim()}
                  >
                    {demoLoading ? 'Loading...' : 'Load Quads'}
                  </Button>
                </div>

                {bundleError ? (
                  <p className="text-sm text-red-600">
                    Failed to load <code>rdf-webcomponents.js</code>. Rebuild it and refresh this page.
                  </p>
                ) : !bundleLoaded ? (
                  <p className="text-sm text-slate-500">Loading web component bundle...</p>
                ) : null}

                {demoError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {demoError}
                  </div>
                )}

                {!demoError && !demoLoading && demoHasRun && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Loaded <span className="font-semibold text-slate-900">{demoQuadCount}</span> quads.
                    </p>
                    {demoQuads.length > 0 ? (
                      <ScrollArea className="h-[280px] rounded-lg border bg-slate-950 p-4">
                        <pre className="text-xs text-slate-100 whitespace-pre-wrap break-all">
                          {JSON.stringify(demoQuads, null, 2)}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        Request succeeded but no quads were returned.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Examples */}
            <Card id="examples">
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="static">
                  <TabsList className="mb-4 flex-wrap">
                    <TabsTrigger value="static">Static File</TabsTrigger>
                    <TabsTrigger value="sparql">SPARQL</TabsTrigger>
                    <TabsTrigger value="cbd">CBD</TabsTrigger>
                    <TabsTrigger value="query">Custom Query</TabsTrigger>
                    <TabsTrigger value="config">RDF Config</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>

                  {Object.entries(examples).map(([key, code]) => (
                    <TabsContent key={key} value={key}>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(code, key)}
                        >
                          {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                          {code}
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* JavaScript API */}
            <Card id="api">
              <CardHeader>
                <CardTitle>JavaScript API</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg">
{`// Get component reference
const adapter = document.querySelector('source-rdf');

// Access properties
console.log(adapter.quads);      // SerializedQuad[]
console.log(adapter.quadCount);  // number
console.log(adapter.loading);    // boolean
console.log(adapter.error);      // string | null
console.log(adapter.cacheKey);   // string

// Methods
await adapter.reload();          // Reload data from URL
await adapter.refresh();         // Clear cache and reload

// Listen for events
adapter.addEventListener('triplestore-ready', (e) => {
  console.log('Loaded', e.detail.quadCount, 'quads');
  console.log('From cache:', e.detail.fromCache);
  console.log('Duration:', e.detail.duration, 'ms');
});

adapter.addEventListener('triplestore-error', (e) => {
  console.error('Error:', e.detail.message);
  console.error('Phase:', e.detail.phase);
});`}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
              </Link>
              <Link href="/lens">
                <Button>
                  Next: rdf-lens
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
