'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import Script from 'next/script';
import Link from 'next/link';
import { 
  Code, 
  Database, 
  Eye, 
  Zap, 
  FileCode, 
  Globe, 
  Layers,
  ChevronRight,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const basePath = rawBasePath
  ? rawBasePath.startsWith('/')
    ? rawBasePath
    : `/${rawBasePath}`
  : '';

const withBasePath = (path: string) => `${basePath}${path}`;
const WEB_COMPONENTS_VERSION = '20260311-1';

// Documentation sections
const documentation = {
  overview: `
# RDF Web Components

A powerful, framework-agnostic Web Component library for working with RDF data.

## Features

- **<source-rdf>** - Fetch and parse RDF data from multiple sources
- **<rdf-lens>** - Extract structured data using SHACL shapes
- **<lens-display>** - Render data with HTML templates

## Quick Start

\`\`\`html
<script type="module" src="https://cdn.example.com/rdf-webcomponents.js"></script>

<lens-display template="person-card.html">
  <rdf-lens shape-file="shapes.ttl" shape-class="Person">
    <source-rdf url="data.ttl"></source-rdf>
  </rdf-lens>
</lens-display>
\`\`\`
`,
  adapter: `
# &lt;source-rdf&gt;

Fetches and parses RDF data from various sources.

## Supported Formats

- Turtle: .ttl
- N-Triples: .nt
- N-Quads: .nq
- RDF/XML: .rdf, .owl
- JSON-LD: .jsonld, .json
- SPARQL: endpoint

## Attributes

- **url** - Optional source URL override
- **config** - Inline RDF config using source-rdf vocabulary

## RDF Config Properties

- **srdf:url** - Source URL or SPARQL endpoint
- **srdf:format** - Optional format hint
- **srdf:strategy** - file, sparql, cbd
- **srdf:subject / srdf:subjectClass / srdf:subjectQuery** - Strategy selectors
- **srdf:depth** - CBD traversal depth
- **srdf:cache / srdf:cacheTtl / srdf:shared** - Caching controls
- **srdf:headers** - JSON object string for request headers

## Example

\`\`\`html
<source-rdf 
  url="https://dbpedia.org/sparql"
  config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "sparql" ;
  srdf:subjectClass <http://dbpedia.org/ontology/Person> ;
  srdf:cache "indexedDB" .'
></source-rdf>
\`\`\`
`,
  lens: `
# &lt;rdf-lens&gt;

Extracts structured data using SHACL shapes.

## Attributes

- **shape-file** - URL to SHACL shapes file
- **shape-class** - Target class to extract
- **shapes** - Inline SHACL shapes (Turtle)
- **multiple** - Extract all matching subjects
- **validate** - Validate against shapes

## SHACL Example

\`\`\`turtle
ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:name "name" ;
    sh:path ex:name ;
    sh:datatype xsd:string ;
  ] .
\`\`\`

## Usage

\`\`\`html
<rdf-lens 
  shape-file="shapes.ttl" 
  shape-class="Person"
  multiple
>
  <source-rdf url="data.ttl"></source-rdf>
</rdf-lens>
\`\`\`
`,
  display: `
# &lt;lens-display&gt;

Renders data using HTML templates.

## Template Syntax

- **\${data.field}** - Value interpolation
- **{{field}}** - Mustache-style
- **{{#field}}** - Conditional
- **{{#each items}}** - Loop

## Example Template

\`\`\`html
<article class="card">
  <h2>{{name}}</h2>
  {{#email}}
  <a href="mailto:{{email}}">{{email}}</a>
  {{/email}}
  {{#each friends}}
  <span>{{name}}</span>
  {{/each}}
</article>
\`\`\`

## Attributes

- **template** - URL to template file
- **mode** - Display mode (single, list, grid, table)
- **theme** - Theme identifier
`,
};

// Sample data for demos
const sampleShapes = `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:name "name" ;
    sh:path ex:name ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
  ] , [
    sh:name "age" ;
    sh:path ex:age ;
    sh:datatype xsd:integer ;
    sh:maxCount 1 ;
  ] , [
    sh:name "email" ;
    sh:path ex:email ;
    sh:datatype xsd:string ;
  ] , [
    sh:name "friends" ;
    sh:path ex:friend ;
    sh:class ex:Person ;
  ] .`;

const sampleData = `@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:Alice a ex:Person ;
  ex:name "Alice Smith" ;
  ex:age 30 ;
  ex:email "alice@example.org" ;
  ex:friend ex:Bob , ex:Charlie .

ex:Bob a ex:Person ;
  ex:name "Bob Johnson" ;
  ex:age 25 ;
  ex:email "bob@example.org" .

ex:Charlie a ex:Person ;
  ex:name "Charlie Brown" ;
  ex:age 35 .`;

const sampleTemplate = `<article class="rdf-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #fff;">
  <h3 style="margin: 0 0 0.5rem; color: #333;">{{name}}</h3>
  {{#age}}<p style="margin: 0.25rem 0; color: #666;">Age: {{age}}</p>{{/age}}
  {{#email}}<p style="margin: 0.25rem 0;"><a href="mailto:{{email}}" style="color: #0066cc;">{{email}}</a></p>{{/email}}
</article>`;

export default function RDFWebComponentsDemo() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [demoOutput, setDemoOutput] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [bundleError, setBundleError] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const bundleUrl = `${withBasePath('/rdf-webcomponents.js')}?v=${WEB_COMPONENTS_VERSION}`;
  const dataUrl = withBasePath('/demo/people.ttl');
  const shapeUrl = withBasePath('/demo/shapes.ttl');
  const templateUrl = withBasePath('/demo/person-card.html');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    setMounted(true);

    // Demo simulation
    const runDemo = async () => {
      try {
        // Simulate data extraction
        const { Parser } = await import('n3');
        const { extractShapes } = await import('rdf-lens');
        
        const parser = new Parser();
        const dataQuads = parser.parse(sampleData);
        const shapeQuads = parser.parse(sampleShapes);
        
        const shapes = extractShapes(shapeQuads);
        const lens = shapes.lenses['http://example.org/Person'];
        
        if (lens) {
          const results: unknown[] = [];
          const subjects = dataQuads
            .filter(q => q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && 
                        q.object.value === 'http://example.org/Person')
            .map(q => q.subject);
          
          for (const subject of subjects) {
            try {
              const result = lens.execute({ id: subject, quads: dataQuads });
              results.push(result);
            } catch (e) {
              console.warn('Extraction error:', e);
            }
          }
          
          setDemoOutput(JSON.stringify(results, null, 2));
        }
      } catch (error) {
        console.error('Demo error:', error);
        setDemoOutput('Error running demo. Check console for details.');
      }
    };
    
    runDemo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Script
        type="module"
        src={bundleUrl}
        strategy="afterInteractive"
        onLoad={() => setBundleLoaded(true)}
        onError={() => setBundleError(true)}
      />

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  vliz-be-opsci RDF Web Components
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Semantic Web Data Visualization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                v0.1.0
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/ajuvercr/rdf-lens" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  rdf-lens
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Build Semantic Web Applications
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A powerful trio of Web Components for fetching, transforming, and visualizing 
              RDF data using SHACL shapes and HTML templates.
            </p>
            <div className="mt-6">
              <Link
                href="/demo"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Open Interactive Playground
              </Link>
            </div>
          </div>

          {/* Component Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/source-rdf" className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">source-rdf</CardTitle>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <CardDescription>
                    Fetch and parse RDF data from files and SPARQL endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Turtle</Badge>
                    <Badge variant="outline" className="text-xs">N3</Badge>
                    <Badge variant="outline" className="text-xs">RDF/XML</Badge>
                    <Badge variant="outline" className="text-xs">JSON-LD</Badge>
                    <Badge variant="outline" className="text-xs">SPARQL</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/lens" className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-green-400 dark:hover:border-green-600 cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">rdf-lens</CardTitle>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                  </div>
                  <CardDescription>
                    Extract structured data using SHACL shape definitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">SHACL</Badge>
                    <Badge variant="outline" className="text-xs">Type Safety</Badge>
                    <Badge variant="outline" className="text-xs">Validation</Badge>
                    <Badge variant="outline" className="text-xs">Nesting</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/display" className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-600 cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">lens-display</CardTitle>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <CardDescription>
                    Render extracted data with HTML templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Templates</Badge>
                    <Badge variant="outline" className="text-xs">Mustache</Badge>
                    <Badge variant="outline" className="text-xs">lit-html</Badge>
                    <Badge variant="outline" className="text-xs">Themes</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/orchestration" className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-cyan-400 dark:hover:border-cyan-600 cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">link-orchestration</CardTitle>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <CardDescription>
                    Detect links and mount source-rdf, rdf-lens, and lens-display by rule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">CSS</Badge>
                    <Badge variant="outline" className="text-xs">XPath</Badge>
                    <Badge variant="outline" className="text-xs">URL Rules</Badge>
                    <Badge variant="outline" className="text-xs">Lifecycle</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/playground" className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Orchestration Playground</CardTitle>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <CardDescription>
                    Interactive examples for every matching capability — css, xpath, urlPattern, urlRegex, parentCss, pathStartsWith
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">9 Examples</Badge>
                    <Badge variant="outline" className="text-xs">Live iframes</Badge>
                    <Badge variant="outline" className="text-xs">Config snippets</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Documentation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Learn how to use RDF Web Components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="adapter">source-rdf</TabsTrigger>
                    <TabsTrigger value="lens">rdf-lens</TabsTrigger>
                    <TabsTrigger value="display">lens-display</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[500px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                      <ReactMarkdown
                        components={{
                          code({ className, children }) {
                            const language = className?.replace('language-', '') ?? '';
                            const isInline = !language;
                            if (isInline) {
                              return <code>{children}</code>;
                            }
                            return (
                              <pre className="overflow-x-auto rounded-lg bg-slate-100 p-4 text-xs dark:bg-slate-800">
                                <code className={className}>{children}</code>
                              </pre>
                            );
                          },
                        }}
                      >
                        {documentation[activeTab as keyof typeof documentation]}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Code Samples */}
          <div className="space-y-6">
            {/* Live Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-green-500" />
                  Live Demo
                </CardTitle>
                <CardDescription>
                  Data extraction in action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto">
                    {demoOutput || 'Processing...'}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* SHACL Shapes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SHACL Shapes</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sampleShapes, 'shapes')}
                >
                  {copied === 'shapes' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    {sampleShapes}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Sample Data */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RDF Data</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sampleData, 'data')}
                >
                  {copied === 'data' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    {sampleData}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Template */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Template</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sampleTemplate, 'template')}
                >
                  {copied === 'template' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[100px]">
                  <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    {sampleTemplate}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Usage Examples */}
        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Usage Examples
          </h3>
          {!bundleLoaded && !bundleError ? (
            <p className="mb-4 text-xs text-slate-500">Loading webcomponents bundle for live examples...</p>
          ) : null}
          {bundleError ? (
            <p className="mb-4 text-xs text-red-600">Could not load <code>rdf-webcomponents.js</code>. Rebuild with <code>bun run build:webcomponents</code>.</p>
          ) : null}

          <div className="grid md:grid-cols-2 gap-6">
            {/* SPARQL Example */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <CardTitle>SPARQL Endpoint</CardTitle>
                </div>
                <CardDescription>
                  Query DBpedia for Person data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Example snippet</p>
                <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto">
{`<lens-display template="card.html">
  <rdf-lens shape-file="shapes.ttl" 
            shape-class="dbo:Person" 
            multiple>
    <source-rdf 
      url="https://dbpedia.org/sparql"
      config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "sparql" ;
  srdf:subjectClass <http://dbpedia.org/ontology/Person> ;
  srdf:cache "indexedDB" .'
    />
  </rdf-lens>
</lens-display>`}
                </pre>
                <p className="mb-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Live output</p>
                <div className="rounded-lg border bg-white p-3">
                  {mounted && bundleLoaded ? (
                    <lens-display template={templateUrl} mode="grid">
                      <rdf-lens shape-file={shapeUrl} shape-class="http://example.org/Person" multiple>
                        <source-rdf
                          url={dataUrl}
                          config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "file" ;
  srdf:format "turtle" .'
                        ></source-rdf>
                      </rdf-lens>
                    </lens-display>
                  ) : (
                    <p className="text-xs text-slate-500">Waiting for bundle...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Static File Example */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-green-500" />
                  <CardTitle>Static RDF File</CardTitle>
                </div>
                <CardDescription>
                  Load data from Turtle file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Example snippet</p>
                <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto">
{`<lens-display template="card.html">
  <rdf-lens shape-file="shapes.ttl" 
            shape-class="Person">
    <source-rdf 
      url="data.ttl"
      config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "file" ;
  srdf:format "turtle" ;
  srdf:cache "memory" ;
  srdf:shared true .'
    />
  </rdf-lens>
</lens-display>`}
                </pre>
                <p className="mb-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Live output</p>
                <div className="rounded-lg border bg-white p-3">
                  {mounted && bundleLoaded ? (
                    <lens-display key="live-static" template={templateUrl} mode="grid">
                      <rdf-lens shape-file={shapeUrl} shape-class="http://example.org/Person" multiple>
                        <source-rdf
                          url={dataUrl}
                          config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "file" ;
  srdf:format "turtle" .'
                        ></source-rdf>
                      </rdf-lens>
                    </lens-display>
                  ) : (
                    <p className="text-xs text-slate-500">Waiting for bundle...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CBD Example */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  <CardTitle>CBD Extraction</CardTitle>
                </div>
                <CardDescription>
                  Concise Bounded Description for a subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Example snippet</p>
                <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto">
{`<lens-display template="card.html">
  <rdf-lens shape-file="shapes.ttl">
    <source-rdf 
      url="https://dbpedia.org/sparql"
      config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "cbd" ;
  srdf:subject <http://dbpedia.org/resource/Albert_Einstein> ;
  srdf:depth 3 .'
    />
  </rdf-lens>
</lens-display>`}
                </pre>
                <p className="mb-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Live output</p>
                <div className="rounded-lg border bg-white p-3">
                  {mounted && bundleLoaded ? (
                    <lens-display key="live-cbd" template={templateUrl} mode="grid">
                      <rdf-lens
                        shape-file={shapeUrl}
                        shape-class="http://example.org/Person"
                        subject="http://example.org/Alice"
                        multiple
                      >
                        <source-rdf
                          url={dataUrl}
                          config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "cbd" ;
  srdf:format "turtle" ;
  srdf:subject <http://example.org/Alice> ;
  srdf:depth 1 .'
                        ></source-rdf>
                      </rdf-lens>
                    </lens-display>
                  ) : (
                    <p className="text-xs text-slate-500">Waiting for bundle...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inline Shapes Example */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-orange-500" />
                  <CardTitle>Inline Shapes</CardTitle>
                </div>
                <CardDescription>
                  Define shapes directly in HTML
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Example snippet</p>
                <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto">
{`<rdf-lens shape-class="Person">
  <script type="text/turtle">
    ex:PersonShape a sh:NodeShape ;
      sh:targetClass ex:Person ;
      sh:property [
        sh:name "name" ;
        sh:path ex:name ;
        sh:datatype xsd:string ;
      ] .
  </script>
  <source-rdf url="data.ttl"/>
</rdf-lens>`}
                </pre>
                <p className="mb-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Live output</p>
                <div className="rounded-lg border bg-white p-3">
                  {mounted && bundleLoaded ? (
                    <lens-display template={templateUrl} mode="grid">
                      <rdf-lens shape-class="http://example.org/Person" multiple>
                        <script type="text/turtle">
                          {`@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [ sh:name "name" ; sh:path ex:name ; sh:datatype xsd:string ] .`}
                        </script>
                        <source-rdf
                          url={dataUrl}
                          config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "file" ;
  srdf:format "turtle" .'
                        ></source-rdf>
                      </rdf-lens>
                    </lens-display>
                  ) : (
                    <p className="text-xs text-slate-500">Waiting for bundle...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Architecture</CardTitle>
              <CardDescription>
                Data flow through the component hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
                <div className="space-y-4 text-sm">
                  <div className="border border-purple-300 dark:border-purple-700 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2">lens-display</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">Template Engine</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li>• Interpolation: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{'{field}'}</code> or <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{'{{field}}'}</code></li>
                      <li>• Conditionals: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{'{#field}...{/field}'}</code></li>
                      <li>• Loops: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{'{#each items}...{/each}'}</code></li>
                    </ul>
                  </div>
                  <div className="flex justify-center">
                    <div className="text-slate-400">▲ data</div>
                  </div>
                  <div className="border border-green-300 dark:border-green-700 rounded-lg p-4">
                    <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">rdf-lens</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">SHACL Shape Processor</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li>• Extract shapes from SHACL definitions</li>
                      <li>• Execute lenses: RDF → JS objects</li>
                      <li>• Handle nested objects and arrays</li>
                    </ul>
                  </div>
                  <div className="flex justify-center">
                    <div className="text-slate-400">▲ quads</div>
                  </div>
                  <div className="border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">source-rdf</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">RDF Processing Pipeline</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li>• Fetch: HTTP, SPARQL endpoints</li>
                      <li>• Parse: Turtle, N3, RDF/XML, JSON-LD</li>
                      <li>• Cache: Memory, localStorage, IndexedDB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Built with{' '}
            <a href="https://github.com/ajuvercr/rdf-lens" className="text-blue-600 hover:underline">
              rdf-lens
            </a>
            ,{' '}
            <a href="https://lit.dev/" className="text-purple-600 hover:underline">
              Lit
            </a>
            , and{' '}
            <a href="https://n3js.org/" className="text-green-600 hover:underline">
              N3.js
            </a>
          </p>
          <p className="mt-2">
            Released under the MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
