'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { ArrowLeft, Zap, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const attributes = [
  { name: 'config', type: 'string', description: 'Inline RDF config using the rdf-lens vocabulary' },
  { name: 'lrdf:shapeFile', type: 'IRI/string', description: 'URL to SHACL shapes file' },
  { name: 'lrdf:shapeClass', type: 'IRI/string', description: 'Target class URI to extract' },
  { name: 'lrdf:shapes', type: 'string', description: 'Inline SHACL shapes (Turtle format)' },
  { name: 'lrdf:strict', type: 'boolean', default: 'false', description: 'Throw on extraction errors' },
  { name: 'lrdf:multiple', type: 'boolean', default: 'false', description: 'Extract all matching subjects' },
  { name: 'lrdf:subject', type: 'IRI/string', description: 'Specific subject URI to extract' },
];

const events = [
  { name: 'shape-processed', detail: '{ data, shapeClass, count, duration }', description: 'Data extracted successfully' },
  { name: 'shape-error', detail: '{ message, phase, error }', description: 'Error extracting data' },
  { name: 'shapes-loaded', detail: '{ count }', description: 'Shapes loaded successfully' },
  { name: 'extraction-start', detail: '{ }', description: 'Extraction started' },
];

const shaclProperties = [
  { name: 'sh:targetClass', description: 'The class this shape applies to' },
  { name: 'sh:property', description: 'Defines a property constraint' },
  { name: 'sh:name', description: 'Human-readable property name (becomes JS property)' },
  { name: 'sh:path', description: 'The RDF predicate path' },
  { name: 'sh:datatype', description: 'Expected datatype (for literals)' },
  { name: 'sh:class', description: 'Expected class (for nested objects)' },
  { name: 'sh:minCount', description: 'Minimum cardinality (required if > 0)' },
  { name: 'sh:maxCount', description: 'Maximum cardinality' },
];

const examples = {
  basic: `<!-- Basic usage with external shape file -->
<rdf-lens 
  config='@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
[] a lrdf:RdfLensConfig ;
  lrdf:shapeFile "shapes/person.ttl" ;
  lrdf:shapeClass <http://example.org/Person> .'
>
  <source-rdf url="data.ttl"></source-rdf>
</rdf-lens>`,

  multiple: `<!-- Extract all instances -->
<rdf-lens 
  config='@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
[] a lrdf:RdfLensConfig ;
  lrdf:shapeFile "shapes/person.ttl" ;
  lrdf:shapeClass <http://example.org/Person> ;
  lrdf:multiple true .'
>
  <source-rdf 
    url="https://dbpedia.org/sparql"
    config='@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
[] a srdf:SourceRdfConfig ;
  srdf:strategy "sparql" ;
  srdf:subjectClass <http://dbpedia.org/ontology/Person> .'
  ></source-rdf>
</rdf-lens>`,

  inline: `<!-- Inline SHACL shapes -->
<rdf-lens config='@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
[] a lrdf:RdfLensConfig ;
  lrdf:shapeClass <http://example.org/Person> ;
  lrdf:shapes "@prefix sh: <http://www.w3.org/ns/shacl#> . @prefix ex: <http://example.org/> . @prefix xsd: <http://www.w3.org/2001/XMLSchema#> . ex:PersonShape a sh:NodeShape ; sh:targetClass ex:Person ; sh:property [ sh:name \\\"name\\\" ; sh:path ex:name ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ] , [ sh:name \\\"age\\\" ; sh:path ex:age ; sh:datatype xsd:integer ; sh:maxCount 1 ] ." .'>
  <source-rdf url="data.ttl"></source-rdf>
</rdf-lens>`,

  nested: `<!-- Nested object extraction -->
<script type="text/turtle">
  ex:AddressShape a sh:NodeShape ;
    sh:targetClass ex:Address ;
    sh:property [
      sh:name "street" ;
      sh:path ex:street ;
      sh:datatype xsd:string ;
    ] , [
      sh:name "city" ;
      sh:path ex:city ;
      sh:datatype xsd:string ;
    ] .
    
  ex:PersonShape a sh:NodeShape ;
    sh:targetClass ex:Person ;
    sh:property [
      sh:name "name" ;
      sh:path ex:name ;
      sh:datatype xsd:string ;
    ] , [
      sh:name "address" ;
      sh:path ex:address ;
      sh:class ex:Address ;
      sh:maxCount 1 ;
    ] .
</script>`,

  validation: `<!-- Strict extraction mode -->
<rdf-lens 
  config='@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
[] a lrdf:RdfLensConfig ;
  lrdf:shapeFile "shapes/person.ttl" ;
  lrdf:shapeClass <http://example.org/Person> ;
  lrdf:strict true .'
>
  <source-rdf url="data.ttl"></source-rdf>
</rdf-lens>`,
};

const shaclExample = `@prefix sh: <http://www.w3.org/ns/shacl#> .
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

const dataExample = `@prefix ex: <http://example.org/> .
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

const resultExample = `[
  {
    "name": "Alice Smith",
    "age": 30,
    "email": "alice@example.org",
    "friends": [
      { "name": "Bob Johnson", "age": 25 },
      { "name": "Charlie Brown", "age": 35 }
    ]
  },
  {
    "name": "Bob Johnson",
    "age": 25,
    "email": "bob@example.org"
  },
  {
    "name": "Charlie Brown",
    "age": 35
  }
]`;

export default function RdfLensDocs() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
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
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  &lt;rdf-lens&gt;
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  SHACL Shape Extraction Component
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
                <a href="#overview" className="block text-green-600 hover:underline">Overview</a>
                <a href="#shacl" className="block text-slate-600 hover:text-slate-900">SHACL Shapes</a>
                <a href="#attributes" className="block text-slate-600 hover:text-slate-900">Config Vocabulary</a>
                <a href="#events" className="block text-slate-600 hover:text-slate-900">Events</a>
                <a href="#examples" className="block text-slate-600 hover:text-slate-900">Examples</a>
                <a href="#workflow" className="block text-slate-600 hover:text-slate-900">Data Workflow</a>
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
                  Extract structured JavaScript objects from RDF data using SHACL shapes
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  <code>&lt;rdf-lens&gt;</code> uses SHACL (Shapes Constraint Language) definitions 
                  to transform RDF triples into structured JavaScript objects. It integrates with 
                  the <code>rdf-lens</code> library for powerful type-safe extraction.
                </p>
                <h3 className="text-lg font-semibold mt-6">Key Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>SHACL-based shape definitions</li>
                  <li>RDF config-driven setup via <code>lrdf:RdfLensConfig</code></li>
                  <li>Automatic type conversion (string, integer, boolean, date)</li>
                  <li>Nested object extraction</li>
                  <li>Array handling for multi-value properties</li>
                  <li>Strict extraction mode for per-subject errors</li>
                </ul>
              </CardContent>
            </Card>

            {/* SHACL */}
            <Card id="shacl">
              <CardHeader>
                <CardTitle>SHACL Shapes</CardTitle>
                <CardDescription>
                  Supported SHACL properties for shape definitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Property</th>
                          <th className="text-left py-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shaclProperties.map(prop => (
                          <tr key={prop.name} className="border-b">
                            <td className="py-2">
                              <code className="text-green-600">{prop.name}</code>
                            </td>
                            <td className="py-2 text-slate-600">{prop.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Example Shape</h4>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(shaclExample, 'shacl')}
                      >
                        {copied === 'shacl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <ScrollArea className="h-[250px]">
                        <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg">
                          {shaclExample}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card id="attributes">
              <CardHeader>
                <CardTitle>Config Vocabulary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Property</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Default</th>
                        <th className="text-left py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributes.map(attr => (
                        <tr key={attr.name} className="border-b">
                          <td className="py-2">
                            <code className="text-green-600">{attr.name}</code>
                          </td>
                          <td className="py-2 text-slate-600">{attr.type}</td>
                          <td className="py-2 text-slate-500">{attr.default || '-'}</td>
                          <td className="py-2 text-slate-600">{attr.description}</td>
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
                      <code className="text-purple-600 font-mono">{event.name}</code>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-2 overflow-x-auto">
                        {event.detail}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Examples */}
            <Card id="examples">
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic">
                  <TabsList className="mb-4 flex-wrap">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="multiple">Multiple</TabsTrigger>
                    <TabsTrigger value="inline">Inline Shapes</TabsTrigger>
                    <TabsTrigger value="nested">Nested</TabsTrigger>
                    <TabsTrigger value="validation">Strict Mode</TabsTrigger>
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

            {/* Data Workflow */}
            <Card id="workflow">
              <CardHeader>
                <CardTitle>Data Transformation Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-slate-500">1. Input RDF</h4>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => copyToClipboard(dataExample, 'data')}
                      >
                        {copied === 'data' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <ScrollArea className="h-[200px]">
                        <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded">
                          {dataExample}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">rdf-lens</p>
                      <p className="text-xs text-slate-500">Shape Extraction</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-slate-500">3. Output JSON</h4>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => copyToClipboard(resultExample, 'result')}
                      >
                        {copied === 'result' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <ScrollArea className="h-[200px]">
                        <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded">
                          {resultExample}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JavaScript API */}
            <Card id="api">
              <CardHeader>
                <CardTitle>JavaScript API</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg">
{`// Get component reference
const lens = document.querySelector('rdf-lens');

// Access properties
console.log(lens.data);     // Extracted data object(s)
console.log(lens.loading);  // boolean
console.log(lens.error);    // string | null

// Programmatically set quads
lens.setQuads(adapter.quads);

// Listen for events
lens.addEventListener('shape-processed', (e) => {
  console.log('Extracted:', e.detail.data);
  console.log('Shape class:', e.detail.shapeClass);
  console.log('Count:', e.detail.count);
  console.log('Duration:', e.detail.duration, 'ms');
});

lens.addEventListener('shape-error', (e) => {
  console.error('Extraction error:', e.detail.message);
  console.error('Phase:', e.detail.phase);
});`}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Link href="/source-rdf">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous: source-rdf
                </Button>
              </Link>
              <Link href="/display">
                <Button>
                  Next: lens-display
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
