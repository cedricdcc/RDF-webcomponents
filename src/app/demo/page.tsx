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
  const [sparqlSelectorMode, setSparqlSelectorMode] = useState<"subjectClass" | "subject" | "subjectQuery">("subjectClass");
  const [subjectValue, setSubjectValue] = useState("");
  const [subjectClass, setSubjectClass] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [cbdDepth, setCbdDepth] = useState("2");
  const [sourceCardTab, setSourceCardTab] = useState<"guided" | "ttl">("guided");
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

  const toTurtleString = (value: string) =>
    `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;

  const toIriOrString = (value: string) => {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed) || /^urn:/i.test(trimmed)) {
      return `<${trimmed}>`;
    }
    return toTurtleString(trimmed);
  };

  const buildSourceConfigRdf = (sourceUrl: string) => {
    const triples: string[] = [
      `srdf:url ${toIriOrString(sourceUrl)}`,
      `srdf:strategy ${toTurtleString(dataStrategy)}`,
    ];

    if (dataFormat) {
      triples.push(`srdf:format ${toTurtleString(dataFormat)}`);
    }

    if (dataStrategy === "sparql") {
      if (sparqlSelectorMode === "subjectClass" && subjectClass.trim()) {
        triples.push(`srdf:subjectClass ${toIriOrString(subjectClass)}`);
      }
      if (sparqlSelectorMode === "subject" && subjectValue.trim()) {
        triples.push(`srdf:subject ${toIriOrString(subjectValue)}`);
      }
      if (sparqlSelectorMode === "subjectQuery" && subjectQuery.trim()) {
        triples.push(`srdf:subjectQuery ${toTurtleString(subjectQuery.trim())}`);
      }
    }

    if (dataStrategy === "cbd") {
      if (subjectValue.trim()) {
        triples.push(`srdf:subject ${toIriOrString(subjectValue)}`);
      }
      const parsedDepth = Number(cbdDepth);
      if (Number.isFinite(parsedDepth) && parsedDepth > 0) {
        triples.push(`srdf:depth ${Math.floor(parsedDepth)}`);
      }
    }

    return `@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .\n\n[] a srdf:SourceRdfConfig ;\n  ${triples.join(
      ' ;\n  '
    )} .`;
  };

  const previewSourceUrl = useMemo(() => {
    if (useRemoteData) {
      return remoteDataUrl.trim() || "https://example.org/data.ttl";
    }
    return "urn:playground:inline-data";
  }, [useRemoteData, remoteDataUrl]);

  const sourceConfigRdf = useMemo(() => {
    return buildSourceConfigRdf(previewSourceUrl);
  }, [
    previewSourceUrl,
    dataFormat,
    dataStrategy,
    sparqlSelectorMode,
    subjectClass,
    subjectValue,
    subjectQuery,
    cbdDepth,
  ]);

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
    setSparqlSelectorMode("subjectClass");
    setSubjectValue("");
    setSubjectClass("");
    setSubjectQuery("");
    setCbdDepth("2");
    setSourceCardTab("guided");
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
      pushEvent("source-rdf: triplestore-ready", detail);
    };
    const onAdapterLoading = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAdapterStatus("loading");
      pushEvent("source-rdf: triplestore-loading", detail);
    };
    const onAdapterError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAdapterStatus("error");
      pushEvent("source-rdf: triplestore-error", detail);
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
            three sections that map directly to <strong>source-rdf</strong>, <strong>rdf-lens</strong>, and
            <strong> lens-display</strong>.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <Link className="underline" href="/source-rdf">source-rdf docs</Link>
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
            <h2 className="text-lg font-semibold">1. source-rdf</h2>
            <p className="text-xs text-slate-600">
              Strategy-driven builder for source-rdf config. Pick a strategy first, then provide only the variables required
              for that strategy.
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
            <div className="rounded-md border p-2">
              <div className="mb-2 flex gap-2 text-xs">
                <button
                  type="button"
                  className={`rounded px-2 py-1 ${sourceCardTab === "guided" ? "bg-slate-900 text-white" : "border"}`}
                  onClick={() => setSourceCardTab("guided")}
                >
                  Guided Inputs
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1 ${sourceCardTab === "ttl" ? "bg-slate-900 text-white" : "border"}`}
                  onClick={() => setSourceCardTab("ttl")}
                >
                  Generated TTL Config
                </button>
              </div>

              {sourceCardTab === "guided" ? (
                <div className="space-y-2">
                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">1) strategy</span>
                    <select
                      className="w-full rounded-md border px-2 py-1.5"
                      value={dataStrategy}
                      onChange={(e) => setDataStrategy(e.target.value)}
                    >
                      <option value="file">file</option>
                      <option value="sparql">sparql</option>
                      <option value="cbd">cbd</option>
                    </select>
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">2) format</span>
                    <select
                      className="w-full rounded-md border px-2 py-1.5"
                      value={dataFormat}
                      onChange={(e) => setDataFormat(e.target.value)}
                    >
                      <option value="turtle">turtle</option>
                      <option value="json-ld">json-ld</option>
                      <option value="rdf-xml">rdf-xml</option>
                      <option value="n-triples">n-triples</option>
                    </select>
                  </label>

                  {dataStrategy === "sparql" ? (
                    <>
                      <label className="block space-y-1 text-sm">
                        <span className="font-medium">3) sparql selector mode</span>
                        <select
                          className="w-full rounded-md border px-2 py-1.5"
                          value={sparqlSelectorMode}
                          onChange={(e) => setSparqlSelectorMode(e.target.value as "subjectClass" | "subject" | "subjectQuery")}
                        >
                          <option value="subjectClass">subjectClass</option>
                          <option value="subject">subject</option>
                          <option value="subjectQuery">subjectQuery</option>
                        </select>
                      </label>

                      {sparqlSelectorMode === "subjectClass" ? (
                        <label className="block space-y-1 text-sm">
                          <span className="font-medium">4) subjectClass (required)</span>
                          <input
                            className="w-full rounded-md border px-2 py-1.5"
                            placeholder="http://example.org/Person"
                            value={subjectClass}
                            onChange={(e) => setSubjectClass(e.target.value)}
                          />
                        </label>
                      ) : null}

                      {sparqlSelectorMode === "subject" ? (
                        <label className="block space-y-1 text-sm">
                          <span className="font-medium">4) subject (required)</span>
                          <input
                            className="w-full rounded-md border px-2 py-1.5"
                            placeholder="http://example.org/Alice"
                            value={subjectValue}
                            onChange={(e) => setSubjectValue(e.target.value)}
                          />
                        </label>
                      ) : null}

                      {sparqlSelectorMode === "subjectQuery" ? (
                        <label className="block space-y-1 text-sm">
                          <span className="font-medium">4) subjectQuery (required)</span>
                          <textarea
                            className="h-24 w-full rounded-md border p-2 font-mono text-xs"
                            placeholder="CONSTRUCT { ?s ?p ?o } WHERE { ?s a <http://example.org/Person> . ?s ?p ?o } LIMIT 20"
                            value={subjectQuery}
                            onChange={(e) => setSubjectQuery(e.target.value)}
                          />
                        </label>
                      ) : null}
                    </>
                  ) : null}

                  {dataStrategy === "cbd" ? (
                    <>
                      <label className="block space-y-1 text-sm">
                        <span className="font-medium">3) subject (required)</span>
                        <input
                          className="w-full rounded-md border px-2 py-1.5"
                          placeholder="http://example.org/Alice"
                          value={subjectValue}
                          onChange={(e) => setSubjectValue(e.target.value)}
                        />
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="font-medium">4) depth</span>
                        <input
                          className="w-full rounded-md border px-2 py-1.5"
                          type="number"
                          min={1}
                          value={cbdDepth}
                          onChange={(e) => setCbdDepth(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">
                    TTL config built from your current selections.
                  </p>
                  <textarea
                    readOnly
                    className="h-72 w-full rounded-md border bg-slate-50 p-2 font-mono text-xs"
                    value={sourceConfigRdf}
                  />
                </div>
              )}
            </div>
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
              This is the real web component chain: <code>source-rdf</code> -&gt; <code>rdf-lens</code> -&gt; <code>lens-display</code>.
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
                    <source-rdf
                      ref={(node) => {
                        adapterRef.current = node;
                      }}
                      key={`adapter-${runtime.key}`}
                      config={buildSourceConfigRdf(runtime.dataUrl)}
                    ></source-rdf>
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
