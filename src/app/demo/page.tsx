"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

type RuntimeConfig = {
  dataUrl: string;
  shapeUrl: string;
  templateUrl: string;
  key: number;
};

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = rawBasePath
  ? rawBasePath.startsWith("/")
    ? rawBasePath
    : `/${rawBasePath}`
  : "";

const withBasePath = (path: string) => `${basePath}${path}`;
const WEB_COMPONENTS_VERSION = '20260311-1';

const DEMO_DATA = `@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:Alice a ex:Person ;
  ex:name "Alice Smith" ;
  ex:email "alice@example.org" ;
  ex:role "Data Engineer" ;
  ex:age 31 ;
  ex:city "Brussels" .

ex:Bob a ex:Person ;
  ex:name "Bob Johnson" ;
  ex:email "bob@example.org" ;
  ex:role "Knowledge Graph Architect" ;
  ex:age 36 ;
  ex:city "Ghent" .`;

const DEMO_SHAPES = `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:name "name" ;
    sh:path ex:name ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
  ] , [
    sh:name "email" ;
    sh:path ex:email ;
    sh:datatype xsd:string ;
    sh:maxCount 1 ;
  ] , [
    sh:name "role" ;
    sh:path ex:role ;
    sh:datatype xsd:string ;
    sh:maxCount 1 ;
  ] , [
    sh:name "age" ;
    sh:path ex:age ;
    sh:datatype xsd:integer ;
    sh:maxCount 1 ;
  ] , [
    sh:name "city" ;
    sh:path ex:city ;
    sh:datatype xsd:string ;
    sh:maxCount 1 ;
  ] .`;

const DEMO_TEMPLATE = `<div class="demo-grid">
  {{#each items}}
  <article class="person-card">
    <h3>{{name}}</h3>
    {{#role}}<p><strong>Role:</strong> {{role}}</p>{{/role}}
    {{#email}}<p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>{{/email}}
    {{#age}}<p><strong>Age:</strong> {{age}}</p>{{/age}}
    {{#city}}<p><strong>City:</strong> {{city}}</p>{{/city}}
  </article>
  {{/each}}
</div>

<style>
  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .person-card {
    border: 1px solid #dbe2ea;
    border-radius: 0.75rem;
    padding: 0.9rem;
    background: #ffffff;
  }

  .person-card h3 {
    margin: 0 0 0.4rem;
  }

  .person-card p {
    margin: 0.2rem 0;
    font-size: 0.9rem;
  }
</style>`;

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [bundleError, setBundleError] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeConfig | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [adapterStatus, setAdapterStatus] = useState("idle");
  const [lensStatus, setLensStatus] = useState("idle");
  const [displayStatus, setDisplayStatus] = useState("idle");

  const [useRemoteData, setUseRemoteData] = useState(false);
  const [remoteDataUrl, setRemoteDataUrl] = useState(withBasePath("/demo/people.ttl"));
  const [dataFormat, setDataFormat] = useState("turtle");
  const [dataStrategy, setDataStrategy] = useState("file");
  const [subjectClass, setSubjectClass] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [rdfInput, setRdfInput] = useState(DEMO_DATA);

  const [shapeClass, setShapeClass] = useState("http://example.org/Person");
  const [multiple, setMultiple] = useState(true);
  const [shaclInput, setShaclInput] = useState(DEMO_SHAPES);

  const [displayMode, setDisplayMode] = useState("grid");
  const [templateInput, setTemplateInput] = useState(DEMO_TEMPLATE);

  const adapterRef = useRef<HTMLElement | null>(null);
  const lensRef = useRef<HTMLElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const urlsRef = useRef<string[]>([]);

  const bundleUrl = useMemo(
    () => `${withBasePath("/rdf-webcomponents.js")}?v=${WEB_COMPONENTS_VERSION}`,
    []
  );

  const pushEvent = (label: string, detail?: unknown) => {
    const time = new Date().toLocaleTimeString();
    const suffix = detail ? ` ${JSON.stringify(detail)}` : "";
    setEvents((prev) => [`[${time}] ${label}${suffix}`, ...prev].slice(0, 40));
  };

  const revokeAllUrls = () => {
    for (const url of urlsRef.current) {
      URL.revokeObjectURL(url);
    }
    urlsRef.current = [];
  };

  const makeTextUrl = (text: string, type: string) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    urlsRef.current.push(url);
    return url;
  };

  const runPipeline = () => {
    revokeAllUrls();

    const dataUrl = useRemoteData
      ? remoteDataUrl.trim()
      : makeTextUrl(rdfInput, "text/turtle;charset=utf-8");
    const shapeUrl = makeTextUrl(shaclInput, "text/turtle;charset=utf-8");
    const templateUrl = makeTextUrl(templateInput, "text/html;charset=utf-8");

    setAdapterStatus("loading");
    setLensStatus("waiting");
    setDisplayStatus("waiting");
    setEvents([]);
    setRuntime({ dataUrl, shapeUrl, templateUrl, key: Date.now() });
  };

  const loadDemoDefaults = () => {
    setUseRemoteData(false);
    setRemoteDataUrl(withBasePath("/demo/people.ttl"));
    setDataFormat("turtle");
    setDataStrategy("file");
    setSubjectClass("");
    setSubjectQuery("");
    setRdfInput(DEMO_DATA);
    setShapeClass("http://example.org/Person");
    setMultiple(true);
    setShaclInput(DEMO_SHAPES);
    setDisplayMode("grid");
    setTemplateInput(DEMO_TEMPLATE);
  };

  useEffect(() => {
    setMounted(true);
    return () => revokeAllUrls();
  }, []);

  useEffect(() => {
    if (!mounted || !bundleLoaded || runtime) {
      return;
    }
    runPipeline();
    // The initial run should happen once after the web component bundle is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, bundleLoaded, runtime]);

  useEffect(() => {
    const adapter = adapterRef.current;
    const lens = lensRef.current;
    const display = displayRef.current;
    if (!adapter || !lens || !display) {
      return;
    }

    const onAdapterReady = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAdapterStatus("ready");
      pushEvent("rdf-adapter: triplestore-ready", detail);
    };
    const onAdapterLoading = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAdapterStatus("loading");
      pushEvent("rdf-adapter: triplestore-loading", detail);
    };
    const onAdapterError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAdapterStatus("error");
      pushEvent("rdf-adapter: triplestore-error", detail);
    };

    const onShapesLoaded = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLensStatus("loading");
      pushEvent("rdf-lens: shapes-loaded", detail);
    };
    const onShapeProcessed = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLensStatus("ready");
      pushEvent("rdf-lens: shape-processed", detail);
    };
    const onShapeError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLensStatus("error");
      pushEvent("rdf-lens: shape-error", detail);
    };

    const onRenderComplete = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setDisplayStatus("ready");
      pushEvent("lens-display: render-complete", detail);
    };
    const onRenderError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setDisplayStatus("error");
      pushEvent("lens-display: render-error", detail);
    };

    adapter.addEventListener("triplestore-ready", onAdapterReady);
    adapter.addEventListener("triplestore-loading", onAdapterLoading);
    adapter.addEventListener("triplestore-error", onAdapterError);
    lens.addEventListener("shapes-loaded", onShapesLoaded);
    lens.addEventListener("shape-processed", onShapeProcessed);
    lens.addEventListener("shape-error", onShapeError);
    display.addEventListener("render-complete", onRenderComplete);
    display.addEventListener("render-error", onRenderError);

    return () => {
      adapter.removeEventListener("triplestore-ready", onAdapterReady);
      adapter.removeEventListener("triplestore-loading", onAdapterLoading);
      adapter.removeEventListener("triplestore-error", onAdapterError);
      lens.removeEventListener("shapes-loaded", onShapesLoaded);
      lens.removeEventListener("shape-processed", onShapeProcessed);
      lens.removeEventListener("shape-error", onShapeError);
      display.removeEventListener("render-complete", onRenderComplete);
      display.removeEventListener("render-error", onRenderError);
    };
  }, [runtime]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Script
        type="module"
        src={bundleUrl}
        strategy="afterInteractive"
        onLoad={() => setBundleLoaded(true)}
        onError={() => setBundleError(true)}
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <Link href="/" className="text-sm underline">
            Back to docs
          </Link>
          <h1 className="text-3xl font-bold">RDF Playground</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Edit RDF input, build your own SHACL shape, and tune the rendering template. This page is split into
            three sections that map directly to <strong>rdf-adapter</strong>, <strong>rdf-lens</strong>, and
            <strong> lens-display</strong>.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <Link className="underline" href="/adapter">rdf-adapter docs</Link>
            <Link className="underline" href="/lens">rdf-lens docs</Link>
            <Link className="underline" href="/display">lens-display docs</Link>
            <Link className="underline" href="/orchestration">link-orchestration docs</Link>
          </div>
        </header>

        <section className="rounded-xl border bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
              onClick={runPipeline}
              disabled={bundleError || !bundleLoaded}
            >
              Run Playground
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={loadDemoDefaults}
            >
              Reset To Demo Content
            </button>
            <span className="text-xs text-slate-500">
              Tip: after editing RDF or SHACL text, run the pipeline again to refresh the output.
            </span>
          </div>
          {bundleError ? (
            <p className="text-sm text-red-600">
              Failed to load <code>rdf-webcomponents.js</code>. Rebuild with <code>bun run build:webcomponents</code> and refresh.
            </p>
          ) : !bundleLoaded ? (
            <p className="text-sm text-slate-600">Loading web component bundle...</p>
          ) : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border bg-white p-4 space-y-3">
            <h2 className="text-lg font-semibold">1. rdf-adapter</h2>
            <p className="text-xs text-slate-600">
              Loads RDF from inline text or a remote URL/endpoint. Use remote mode when you want to query a SPARQL endpoint.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useRemoteData}
                onChange={(e) => setUseRemoteData(e.target.checked)}
              />
              Use remote URL instead of inline RDF
            </label>
            {useRemoteData ? (
              <label className="block space-y-1 text-sm">
                <span className="font-medium">RDF URL or SPARQL endpoint</span>
                <input
                  className="w-full rounded-md border px-2 py-1.5"
                  value={remoteDataUrl}
                  onChange={(e) => setRemoteDataUrl(e.target.value)}
                />
              </label>
            ) : (
              <label className="block space-y-1 text-sm">
                <span className="font-medium">RDF input (Turtle by default)</span>
                <textarea
                  className="h-48 w-full rounded-md border p-2 font-mono text-xs"
                  value={rdfInput}
                  onChange={(e) => setRdfInput(e.target.value)}
                />
              </label>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="space-y-1">
                <span className="font-medium">format</span>
                <select
                  className="w-full rounded-md border px-2 py-1.5"
                  value={dataFormat}
                  onChange={(e) => setDataFormat(e.target.value)}
                >
                  <option value="turtle">turtle</option>
                  <option value="jsonld">jsonld</option>
                  <option value="rdfxml">rdfxml</option>
                  <option value="ntriples">ntriples</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-medium">strategy</span>
                <select
                  className="w-full rounded-md border px-2 py-1.5"
                  value={dataStrategy}
                  onChange={(e) => setDataStrategy(e.target.value)}
                >
                  <option value="file">file</option>
                  <option value="sparql">sparql</option>
                  <option value="cbd">cbd</option>
                  <option value="graph">graph</option>
                </select>
              </label>
            </div>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">subject-class (optional)</span>
              <input
                className="w-full rounded-md border px-2 py-1.5"
                placeholder="http://example.org/Person"
                value={subjectClass}
                onChange={(e) => setSubjectClass(e.target.value)}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">subject-query (optional)</span>
              <textarea
                className="h-20 w-full rounded-md border p-2 font-mono text-xs"
                placeholder="SELECT ?s WHERE { ?s a <http://example.org/Person> } LIMIT 20"
                value={subjectQuery}
                onChange={(e) => setSubjectQuery(e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">Status: {adapterStatus}</p>
          </section>

          <section className="rounded-xl border bg-white p-4 space-y-3">
            <h2 className="text-lg font-semibold">2. rdf-lens</h2>
            <p className="text-xs text-slate-600">
              Define SHACL in Turtle and extract structured objects from your RDF graph.
            </p>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">shape-class</span>
              <input
                className="w-full rounded-md border px-2 py-1.5"
                value={shapeClass}
                onChange={(e) => setShapeClass(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={multiple}
                onChange={(e) => setMultiple(e.target.checked)}
              />
              multiple extraction mode
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">SHACL file content</span>
              <textarea
                className="h-72 w-full rounded-md border p-2 font-mono text-xs"
                value={shaclInput}
                onChange={(e) => setShaclInput(e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">
              Docs quick tip: use <code>sh:name</code> for output property names and <code>sh:path</code> for predicates.
            </p>
            <p className="text-xs text-slate-500">Status: {lensStatus}</p>
          </section>

          <section className="rounded-xl border bg-white p-4 space-y-3">
            <h2 className="text-lg font-semibold">3. lens-display</h2>
            <p className="text-xs text-slate-600">
              Render the extracted JSON using template tags like <code>{"{{name}}"}</code> and
              <code>{"{{#each items}}"}</code> blocks.
            </p>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">mode</span>
              <select
                className="w-full rounded-md border px-2 py-1.5"
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
              >
                <option value="single">single</option>
                <option value="list">list</option>
                <option value="grid">grid</option>
                <option value="table">table</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Template content (HTML + mustache tags)</span>
              <textarea
                className="h-72 w-full rounded-md border p-2 font-mono text-xs"
                value={templateInput}
                onChange={(e) => setTemplateInput(e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">Status: {displayStatus}</p>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">Live Render</h2>
            <p className="mb-3 text-xs text-slate-600">
              This is the real web component chain: <code>rdf-adapter</code> -&gt; <code>rdf-lens</code> -&gt; <code>lens-display</code>.
            </p>
            <div className="min-h-40 rounded-md border bg-slate-50 p-3">
              {mounted && bundleLoaded && runtime ? (
                <lens-display
                  ref={(node) => {
                    displayRef.current = node;
                  }}
                  key={`display-${runtime.key}`}
                  template={runtime.templateUrl}
                  mode={displayMode}
                >
                  <rdf-lens
                    ref={(node) => {
                      lensRef.current = node;
                    }}
                    key={`lens-${runtime.key}`}
                    shape-file={runtime.shapeUrl}
                    shape-class={shapeClass}
                    multiple={multiple}
                  >
                    <rdf-adapter
                      ref={(node) => {
                        adapterRef.current = node;
                      }}
                      key={`adapter-${runtime.key}`}
                      url={runtime.dataUrl}
                      format={dataFormat}
                      strategy={dataStrategy}
                      cache="none"
                      subject-class={subjectClass || undefined}
                      subject-query={subjectQuery || undefined}
                    ></rdf-adapter>
                  </rdf-lens>
                </lens-display>
              ) : (
                <p className="text-sm text-slate-500">Waiting for bundle and first run...</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">Event Console</h2>
            <p className="mb-3 text-xs text-slate-600">
              Debug stream from adapter/lens/display events. Useful when your SHACL or template is invalid.
            </p>
            <div className="h-72 overflow-auto rounded-md border bg-slate-950 p-3 font-mono text-xs text-slate-100">
              {events.length > 0 ? (
                events.map((line, index) => (
                  <div key={`${line}-${index}`} className="whitespace-pre-wrap break-words">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No events yet. Run the playground to start.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
