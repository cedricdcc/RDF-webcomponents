'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Workflow, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const basePath = rawBasePath
  ? rawBasePath.startsWith('/')
    ? rawBasePath
    : `/${rawBasePath}`
  : '';

const withBasePath = (path: string) => `${basePath}${path}`;
const WEB_COMPONENTS_VERSION = '20260317-1';

const precedence = [
  { source: 'JavaScript property', value: 'element.config = {...}', priority: 1 },
  { source: 'Inline child JSON', value: '<script type="application/json">...</script>', priority: 2 },
  { source: 'Remote config URL', value: 'config-src="/orchestrator.json"', priority: 3 },
];

const lifecycleEvents = [
  'orchestrator-scan-start',
  'orchestrator-scan-complete',
  'orchestrator-link-loading',
  'orchestrator-link-ready',
  'orchestrator-link-error',
  'orchestrator-link-rollback',
];

const headExample = `<head>
  <script type="module" src="/rdf-webcomponents.js"></script>
  <link-orchestration config-src="/demo/link-orchestrator.config.json"></link-orchestration>
</head>`;

const bodyExample = `<link-orchestration>
  <script type="application/json">
  {
    "debounceMs": 150,
    "maxConcurrentPipelines": 4,
    "rules": [
      {
        "id": "docs-person-links",
        "match": {
          "css": "article a[href*='people.ttl']",
          "contentType": "text"
        },
        "adapter": { "strategy": "file" },
        "lens": {
          "shapeClass": "Person",
          "shapes": "@prefix sh: <http://www.w3.org/ns/shacl#> . ..."
        },
        "display": {
          "templateInline": "<span class='person'>{{name}}</span>"
        },
        "decorators": {
          "enabled": true,
          "icons": {
            "loading": "⏳",
            "ready": "✅",
            "error": "⚠"
          }
        }
      }
    ]
  }
  </script>

  <article>
    <a href="/demo/people.ttl">People dataset</a>
  </article>
</link-orchestration>`;

const headIframeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Head Scope Orchestration Demo</title>
  <script type="module" src="${withBasePath('/rdf-webcomponents.js')}?v=${WEB_COMPONENTS_VERSION}"></script>
  <link-orchestration config-src="${withBasePath('/demo/link-orchestrator.config.json')}"></link-orchestration>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 16px; background: #f8fafc; color: #0f172a; }
    .box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
    a { color: #0e7490; }
  </style>
</head>
<body>
  <div class="box">
    <p style="margin-top: 0">Head-scoped orchestration applies to the whole page.</p>
    <a href="${withBasePath('/demo/people.ttl')}">People dataset (head iframe demo)</a>
  </div>
</body>
</html>`;

const bodyIframeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Body Scope Orchestration Demo</title>
  <script type="module" src="${withBasePath('/rdf-webcomponents.js')}?v=${WEB_COMPONENTS_VERSION}"></script>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 16px; background: #f8fafc; color: #0f172a; }
    .box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
    a { color: #0e7490; }
  </style>
</head>
<body>
  <link-orchestration>
    <script type="application/json">
      {
        "debounceMs": 120,
        "maxConcurrentPipelines": 3,
        "rules": [
          {
            "id": "body-iframe-person-link",
            "match": {
              "css": "a[href*='people.ttl']",
              "contentType": "text"
            },
            "adapter": {
              "strategy": "file",
              "cache": "none"
            },
            "lens": {
              "shapeFile": "${withBasePath('/demo/shapes.ttl')}",
              "shapeClass": "http://example.org/Person",
              "multiple": true
            },
            "display": {
              "template": "${withBasePath('/demo/person-card.html')}"
            },
            "decorators": {
              "enabled": true,
              "icons": {
                "loading": "⏳",
                "ready": "✅",
                "error": "⚠"
              }
            }
          }
        ]
      }
    </script>

    <div class="box">
      <p style="margin-top: 0">Body-scoped orchestration only applies inside this component.</p>
      <a href="${withBasePath('/demo/people.ttl')}">People dataset (body iframe demo)</a>
    </div>
  </link-orchestration>
</body>
</html>`;

export default function LinkOrchestrationDocsPage() {
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [bundleError, setBundleError] = useState(false);

  const bodyLiveConfig = useMemo(
    () => ({
      debounceMs: 120,
      maxConcurrentPipelines: 3,
      rules: [
        {
          id: 'body-live-person-link',
          match: {
            css: 'a[href*="people.ttl"]',
            contentType: 'text',
          },
          adapter: {
            strategy: 'file',
            cache: 'none',
          },
          lens: {
            shapeFile: withBasePath('/demo/shapes.ttl'),
            shapeClass: 'http://example.org/Person',
            multiple: true,
          },
          display: {
            template: withBasePath('/demo/person-card.html'),
          },
          decorators: {
            enabled: true,
            icons: {
              loading: '⏳',
              ready: '✅',
              error: '⚠',
            },
          },
        },
      ],
    }),
    [],
  );

  useEffect(() => {
    if (!bundleLoaded) {
      return;
    }

    const orchestrator = document.createElement('link-orchestration') as HTMLElement & {
      config?: unknown;
    };

    const bodyOrchestrator = document.createElement('link-orchestration') as HTMLElement & {
      config?: unknown;
    };

    const bodyHost = document.getElementById('body-live-output-host');
    const bodyScope = document.getElementById('body-live-output-scope');

    orchestrator.config = {
      debounceMs: 120,
      maxConcurrentPipelines: 3,
      rules: [
        {
          id: 'head-live-person-link',
          match: {
            css: '#head-live-output a[href*="people.ttl"]',
            contentType: 'text',
          },
          adapter: {
            strategy: 'file',
            cache: 'none',
          },
          lens: {
            shapeFile: withBasePath('/demo/shapes.ttl'),
            shapeClass: 'http://example.org/Person',
            multiple: true,
          },
          display: {
            template: withBasePath('/demo/person-card.html'),
          },
          decorators: {
            enabled: true,
            icons: {
              loading: '⏳',
              ready: '✅',
              error: '⚠',
            },
          },
        },
      ],
    };

    bodyOrchestrator.config = bodyLiveConfig;

    document.head.appendChild(orchestrator);

    if (bodyHost && bodyScope) {
      bodyOrchestrator.appendChild(bodyScope);
      bodyHost.appendChild(bodyOrchestrator);
    }

    return () => {
      if (bodyHost && bodyScope && bodyOrchestrator.contains(bodyScope)) {
        bodyHost.appendChild(bodyScope);
      }
      bodyOrchestrator.remove();
      orchestrator.remove();
    };
  }, [bodyLiveConfig, bundleLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Script
        type="module"
        src={`${withBasePath('/rdf-webcomponents.js')}?v=${WEB_COMPONENTS_VERSION}`}
        onLoad={() => setBundleLoaded(true)}
        onError={() => setBundleError(true)}
      />

      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">&lt;link-orchestration&gt;</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rule-driven link orchestration for RDF pipeline mounting</p>
          </div>
          <div className="ml-auto">
            <Link href="/playground">
              <Button variant="outline" size="sm">
                Playground
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Scope Rules</CardTitle>
            <CardDescription>Global when declared in head, local when declared in body.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p>If the element is defined in head, it scans the full document.</p>
            <p>If the element is defined in body, it only scans descendant anchors in its own subtree.</p>
            <p>Body scoped orchestrators take precedence over global orchestration for overlapping links.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Config Priority</CardTitle>
            <CardDescription>Higher priority sources override lower priority ones.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {precedence.map((item) => (
                <div key={item.source} className="flex items-center justify-between rounded-md border p-3 bg-white/70 dark:bg-slate-900/60">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.source}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.value}</p>
                  </div>
                  <Badge>Priority {item.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Events</CardTitle>
            <CardDescription>Events emitted by v1 orchestration flow.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
            {lifecycleEvents.map((eventName) => (
              <code key={eventName} className="rounded-md border bg-white/70 dark:bg-slate-900/60 px-3 py-2">
                {eventName}
              </code>
            ))}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Head Example</CardTitle>
              <CardDescription>Page-wide orchestration using remote JSON config.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="text-xs whitespace-pre-wrap rounded-md border bg-white/70 dark:bg-slate-900/60 p-3 overflow-x-auto">{headExample}</pre>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">Live Output</p>
                <div id="head-live-output" className="rounded-md border bg-white/70 dark:bg-slate-900/60 p-3 min-h-24">
                  {bundleError ? (
                    <p className="text-xs text-red-600">Failed to load web components bundle.</p>
                  ) : (
                    <>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        This link is orchestrated by an instance mounted in document head.
                      </p>
                      <a className="underline text-cyan-700" href={withBasePath('/demo/people.ttl')}>
                        People dataset (head-scoped orchestration)
                      </a>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Example</CardTitle>
              <CardDescription>Scoped orchestration with inline JSON rule config.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="text-xs whitespace-pre-wrap rounded-md border bg-white/70 dark:bg-slate-900/60 p-3 overflow-x-auto">{bodyExample}</pre>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">Live Output</p>
                <div className="rounded-md border bg-white/70 dark:bg-slate-900/60 p-3 min-h-24">
                  {bundleError ? (
                    <p className="text-xs text-red-600">Failed to load web components bundle.</p>
                  ) : (
                    <div id="body-live-output-host">
                      <div id="body-live-output-scope">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          This link is orchestrated only inside this body-scoped subtree.
                        </p>
                        <a className="underline text-cyan-700" href={withBasePath('/demo/people.ttl')}>
                          People dataset (body-scoped orchestration)
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Notes</CardTitle>
            <CardDescription>Designed for progressive enhancement on large link sets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 mt-0.5 text-cyan-600" />
              <p>MutationObserver with debounce keeps rescans bounded while reacting to dynamic DOM changes.</p>
            </div>
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 mt-0.5 text-cyan-600" />
              <p>Processing uses a concurrency queue so pages with 2K+ links degrade gracefully.</p>
            </div>
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 mt-0.5 text-cyan-600" />
              <p>First match wins, and already orchestrated descendants are skipped by default.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
