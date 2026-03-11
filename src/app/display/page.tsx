'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { ArrowLeft, Eye, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const attributes = [
  { name: 'template', type: 'string', description: 'URL to template file' },
  { name: 'mode', type: 'string', default: 'single', description: 'Display mode (single, list, grid, table)' },
  { name: 'theme', type: 'string', description: 'Theme identifier for styling' },
  { name: 'class', type: 'string', description: 'CSS classes to apply' },
];

const events = [
  { name: 'render-complete', detail: '{ html, data, duration }', description: 'Rendering completed' },
  { name: 'render-error', detail: '{ message, phase, error }', description: 'Error rendering' },
];

const templateSyntax = [
  { 
    syntax: '{{field}}', 
    description: 'Output the value of a field',
    example: '<span>{{name}}</span>'
  },
  { 
    syntax: '${data.field}', 
    description: 'Alternative interpolation syntax',
    example: '<span>${data.name}</span>'
  },
  { 
    syntax: '{{{field}}}', 
    description: 'Output unescaped HTML',
    example: '<div>{{{description}}}</div>'
  },
  { 
    syntax: '{{#field}}...{{/field}}', 
    description: 'Conditional block (renders if field is truthy)',
    example: '{{#email}}<a href="mailto:{{email}}">{{email}}</a>{{/email}}'
  },
  { 
    syntax: '{{^field}}...{{/field}}', 
    description: 'Inverse conditional (renders if field is falsy)',
    example: '{{^email}}<span>No email</span>{{/email}}'
  },
  { 
    syntax: '{{#each items}}...{{/each}}', 
    description: 'Loop over an array',
    example: '{{#each friends}}<li>{{name}}</li>{{/each}}'
  },
  { 
    syntax: '{{@index}}', 
    description: 'Current index in a loop',
    example: '{{#each items}}<li>{{@index}}: {{name}}</li>{{/each}}'
  },
  { 
    syntax: '{{this}}', 
    description: 'Current item in a loop (for primitive arrays)',
    example: '{{#each tags}}<span>{{this}}</span>{{/each}}'
  },
  { 
    syntax: '{{nested.field}}', 
    description: 'Access nested properties',
    example: '<span>{{address.city}}</span>'
  },
];

const examples = {
  basic: `<!-- Basic card template -->
<article class="card">
  <h2>{{name}}</h2>
  {{#email}}
  <p>Email: <a href="mailto:{{email}}">{{email}}</a></p>
  {{/email}}
  {{^email}}
  <p class="muted">No email provided</p>
  {{/email}}
</article>`,

  loop: `<!-- Template with loops -->
<article class="person-card">
  <h2>{{name}}</h2>
  
  {{#hobbies}}
  <section class="hobbies">
    <h3>Hobbies ({{hobbies.length}})</h3>
    <ul>
      {{#each hobbies}}
      <li>{{name}} - {{years}} years</li>
      {{/each}}
    </ul>
  </section>
  {{/hobbies}}
  
  {{#friends}}
  <section class="friends">
    <h3>Friends</h3>
    <ul>
      {{#each friends}}
      <li>{{name}}</li>
      {{/each}}
    </ul>
  </section>
  {{/friends}}
</article>`,

  nested: `<!-- Nested object template -->
<article class="person">
  <h2>{{name}}</h2>
  
  <address>
    {{#address}}
    <p>{{street}}</p>
    <p>{{city}}, {{country}}</p>
    {{/address}}
  </address>
  
  {{#company}}
  <div class="company">
    <h3>Works at {{name}}</h3>
    <p>Position: {{position}}</p>
    {{#department}}
    <p>Department: {{department}}</p>
    {{/department}}
  </div>
  {{/company}}
</article>`,

  table: `<!-- Table mode template -->
<table class="data-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    {{#each items}}
    <tr>
      <td>{{name}}</td>
      <td>{{age}}</td>
      <td>{{email}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>`,

  grid: `<!-- Grid card template -->
<div class="grid-card">
  <img src="{{avatar}}" alt="{{name}}" />
  <h3>{{name}}</h3>
  <p class="role">{{role}}</p>
  
  <div class="stats">
    <div class="stat">
      <span class="value">{{followers}}</span>
      <span class="label">Followers</span>
    </div>
    <div class="stat">
      <span class="value">{{posts}}</span>
      <span class="label">Posts</span>
    </div>
  </div>
  
  {{#tags}}
  <div class="tags">
    {{#each tags}}
    <span class="tag">{{this}}</span>
    {{/each}}
  </div>
  {{/tags}}
</div>`,

  complete: `<!-- Complete usage example -->
<lens-display 
  template="templates/person-card.html"
  mode="grid"
  theme="modern"
  class="my-4"
>
  <rdf-lens 
    shape-file="shapes/person.ttl" 
    shape-class="http://example.org/Person"
    multiple
  >
    <rdf-adapter 
      url="data.ttl"
      cache="indexedDB"
    ></rdf-adapter>
  </rdf-lens>
</lens-display>

<!-- person-card.html template file -->
<article class="person-card {{theme}}">
  <header>
    <img src="{{avatar}}" alt="{{name}}" class="avatar" />
    <div class="info">
      <h2>{{name}}</h2>
      {{#title}}<p class="title">{{title}}</p>{{/title}}
    </div>
  </header>
  
  <dl class="details">
    {{#email}}
    <div class="detail-row">
      <dt>Email</dt>
      <dd><a href="mailto:{{email}}">{{email}}</a></dd>
    </div>
    {{/email}}
    
    {{#phone}}
    <div class="detail-row">
      <dt>Phone</dt>
      <dd><a href="tel:{{phone}}">{{phone}}</a></dd>
    </div>
    {{/phone}}
  </dl>
  
  {{#skills}}
  <section class="skills">
    <h3>Skills</h3>
    <ul class="skill-list">
      {{#each skills}}
      <li class="skill">{{name}} <span class="level">{{level}}</span></li>
      {{/each}}
    </ul>
  </section>
  {{/skills}}
</article>`,
};

const defaultTemplates = {
  card: `<article class="rdf-card">
  <h3 class="rdf-card-title">{{name}}</h3>
  <dl class="rdf-card-content">
    {{#each _properties}}
    <div class="rdf-card-property">
      <dt class="rdf-card-key">{{@key}}</dt>
      <dd class="rdf-card-value">{{this}}</dd>
    </div>
    {{/each}}
  </dl>
</article>`,
  list: `<ul class="rdf-list">
  {{#each items}}
  <li class="rdf-list-item">{{name}}</li>
  {{/each}}
</ul>`,
  table: `<table class="rdf-table">
  <thead>
    <tr>
      <th>Property</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {{#each _properties}}
    <tr>
      <td>{{@key}}</td>
      <td>{{this}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>`,
};

export default function LensDisplayDocs() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
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
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  &lt;lens-display&gt;
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Template Rendering Component
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
                <a href="#overview" className="block text-purple-600 hover:underline">Overview</a>
                <a href="#syntax" className="block text-slate-600 hover:text-slate-900">Template Syntax</a>
                <a href="#attributes" className="block text-slate-600 hover:text-slate-900">Attributes</a>
                <a href="#events" className="block text-slate-600 hover:text-slate-900">Events</a>
                <a href="#examples" className="block text-slate-600 hover:text-slate-900">Examples</a>
                <a href="#defaults" className="block text-slate-600 hover:text-slate-900">Default Templates</a>
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
                  Render extracted RDF data using HTML templates
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  <code>&lt;lens-display&gt;</code> is the final component in the RDF Web Components 
                  pipeline. It takes structured data from <code>&lt;rdf-lens&gt;</code> and renders 
                  it using HTML templates with a simple, Mustache-inspired syntax.
                </p>
                <h3 className="text-lg font-semibold mt-6">Key Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>URL-based template loading</li>
                  <li>Mustache-style syntax</li>
                  <li>Conditionals and loops</li>
                  <li>Nested property access</li>
                  <li>Multiple display modes</li>
                  <li>Theme support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Template Syntax */}
            <Card id="syntax">
              <CardHeader>
                <CardTitle>Template Syntax</CardTitle>
                <CardDescription>
                  Complete reference for the template language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templateSyntax.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <code className="text-purple-600 font-mono text-lg">{item.syntax}</code>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-3 overflow-x-auto">
                        {item.example}
                      </pre>
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
                            <code className="text-purple-600">{attr.name}</code>
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
                    <TabsTrigger value="loop">Loops</TabsTrigger>
                    <TabsTrigger value="nested">Nested</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="complete">Complete</TabsTrigger>
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
                        <ScrollArea className="h-[300px]">
                          <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg">
                            {code}
                          </pre>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Default Templates */}
            <Card id="defaults">
              <CardHeader>
                <CardTitle>Default Templates</CardTitle>
                <CardDescription>
                  Built-in templates used when no template URL is specified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="card">
                  <TabsList className="mb-4">
                    <TabsTrigger value="card">Card (single)</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                  </TabsList>

                  {Object.entries(defaultTemplates).map(([key, code]) => (
                    <TabsContent key={key} value={key}>
                      <pre className="text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                        {code}
                      </pre>
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
                <ScrollArea className="h-[200px]">
                  <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg">
{`// Get component reference
const display = document.querySelector('lens-display');

// Access properties
console.log(display.data);     // Rendered data
console.log(display.loading);  // boolean
console.log(display.error);    // string | null

// Programmatically set data
display.setData([
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
]);

// Reload template
await display.reloadTemplate();

// Listen for events
display.addEventListener('render-complete', (e) => {
  console.log('Rendered HTML:', e.detail.html);
  console.log('Data:', e.detail.data);
  console.log('Duration:', e.detail.duration, 'ms');
});

display.addEventListener('render-error', (e) => {
  console.error('Render error:', e.detail.message);
});`}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Link href="/lens">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous: rdf-lens
                </Button>
              </Link>
              <Link href="/">
                <Button>
                  Back to Overview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
