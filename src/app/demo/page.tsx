"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, Table, Activity, Search, Copy, Check, Zap, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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

  // Analyzer States
  const [quads, setQuads] = useState<any[]>([]);
  const [analyzedClasses, setAnalyzedClasses] = useState<Record<string, {
    classUri: string;
    instanceCount: number;
    properties: Record<string, {
      predicate: string;
      count: number;
      observedTypes: string[];
      exampleValues: string[];
    }>;
  }>>({});
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [analyzerTab, setAnalyzerTab] = useState<"triples" | "events">("triples");
  const [lensCardTab, setLensCardTab] = useState<"visualizer" | "editor">("visualizer");
  const [triplesSearch, setTriplesSearch] = useState<string>("");
  const [triplesPage, setTriplesPage] = useState(1);
  const [copiedShacl, setCopiedShacl] = useState(false);

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

  const buildLensConfigRdf = (shapeUrl: string) => {
    const triples: string[] = [
      `lrdf:shapeFile ${toIriOrString(shapeUrl)}`,
      `lrdf:shapeClass ${toIriOrString(shapeClass)}`,
      `lrdf:multiple ${multiple}`,
    ];

    return `@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .\n\n[] a lrdf:RdfLensConfig ;\n  ${triples.join(
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

  const analyzeQuads = (serializedQuads: any[]) => {
    if (!serializedQuads || serializedQuads.length === 0) {
      setAnalyzedClasses({});
      setSelectedClass("");
      return;
    }

    const typePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    const classesData: Record<string, {
      classUri: string;
      instanceCount: number;
      properties: Record<string, {
        predicate: string;
        count: number;
        observedTypes: string[];
        exampleValues: string[];
      }>;
    }> = {};

    // Group subjects by class
    const classInstances: Record<string, Set<string>> = {};
    serializedQuads.forEach(quad => {
      if (quad.predicate.value === typePredicate) {
        const clazz = quad.object.value;
        const subject = quad.subject.value;
        if (!classInstances[clazz]) {
          classInstances[clazz] = new Set();
        }
        classInstances[clazz].add(subject);
      }
    });

    // Handle untyped resources
    const typedSubjects = new Set<string>();
    Object.values(classInstances).forEach(instances => {
      instances.forEach(inst => typedSubjects.add(inst));
    });
    
    const allSubjects = new Set(serializedQuads.map(q => q.subject.value));
    const untypedSubjects = Array.from(allSubjects).filter(sub => !typedSubjects.has(sub));

    if (untypedSubjects.length > 0) {
      const untypedClass = 'http://example.org/UntypedResource';
      classInstances[untypedClass] = new Set(untypedSubjects);
    }

    // Analyze properties for each class
    Object.entries(classInstances).forEach(([clazz, instances]) => {
      classesData[clazz] = {
        classUri: clazz,
        instanceCount: instances.size,
        properties: {}
      };

      instances.forEach(instance => {
        const instanceQuads = serializedQuads.filter(q => q.subject.value === instance);
        instanceQuads.forEach(q => {
          const pred = q.predicate.value;
          if (pred === typePredicate) return; // skip type predicate itself in properties visualizer

          if (!classesData[clazz].properties[pred]) {
            classesData[clazz].properties[pred] = {
              predicate: pred,
              count: 0,
              observedTypes: [],
              exampleValues: []
            };
          }

          const prop = classesData[clazz].properties[pred];
          prop.count += 1;

          // Determine type label
          let typeLabel = q.object.termType;
          if (q.object.termType === 'Literal') {
            typeLabel = q.object.datatype ? q.object.datatype : 'http://www.w3.org/2001/XMLSchema#string';
          } else if (q.object.termType === 'NamedNode') {
            typeLabel = 'IRI';
          } else if (q.object.termType === 'BlankNode') {
            typeLabel = 'BlankNode';
          }

          if (!prop.observedTypes.includes(typeLabel)) {
            prop.observedTypes.push(typeLabel);
          }

          if (prop.exampleValues.length < 3 && !prop.exampleValues.includes(q.object.value)) {
            prop.exampleValues.push(q.object.value);
          }
        });
      });
    });

    setAnalyzedClasses(classesData);
    
    // Auto-select the first class found, prioritizing typed ones over UntypedResource
    const availableClasses = Object.keys(classesData);
    if (availableClasses.length > 0) {
      const firstTyped = availableClasses.find(c => c !== 'http://example.org/UntypedResource');
      const activeClass = firstTyped || availableClasses[0];
      setSelectedClass(activeClass);
      
      // Smart Auto-Apply: if the current shapeClass is not in the analyzed dataset,
      // or if we are using default DEMO_SHAPES, or is empty, auto-apply immediately!
      const currentShapeClassExists = availableClasses.includes(shapeClass);
      const isDefaultShacl = shaclInput === DEMO_SHAPES;
      
      if (!currentShapeClassExists || isDefaultShacl || shapeClass === "") {
        setShapeClass(activeClass);
        const classData = classesData[activeClass];
        if (classData && activeClass !== 'http://example.org/UntypedResource') {
          const shaclTemplate = generateShaclForClass(activeClass, classData.properties);
          setShaclInput(shaclTemplate);
          
          const newTemplate = generateTemplateForClass(activeClass, classData.properties);
          setTemplateInput(newTemplate);
          
          pushEvent(`Auto-applied class ${activeClass} to pipeline (fresh dataset or default config detected)`);
        }
      }
    } else {
      setSelectedClass("");
    }
  };

  const generateShaclForClass = (classUri: string, properties: Record<string, any>) => {
    const localName = classUri.split(/[#/]/).pop() || "Shape";
    const shapeUri = `ex:${localName}Shape`;
    
    let shacl = `@prefix sh: <http://www.w3.org/ns/shacl#> .\n`;
    shacl += `@prefix ex: <http://example.org/> .\n`;
    shacl += `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n`;
    shacl += `${shapeUri} a sh:NodeShape ;\n`;
    
    const isAbsolute = classUri.startsWith('http://') || classUri.startsWith('https://');
    const targetClassStr = isAbsolute ? `<${classUri}>` : classUri;
    shacl += `  sh:targetClass ${targetClassStr} ;\n`;
    
    const propEntries = Object.entries(properties);
    if (propEntries.length === 0) {
      shacl += `  sh:property [ ] .`;
    } else {
      shacl += `  sh:property `;
      const propBlocks = propEntries.map(([pred, details], index) => {
        const predLocal = pred.split(/[#/]/).pop() || "property";
        const observedType = details.observedTypes[0] || "";
        
        let propStr = `[\n`;
        propStr += `    sh:name "${predLocal}" ;\n`;
        
        const pathUri = pred.startsWith('http://') || pred.startsWith('https://') ? `<${pred}>` : pred;
        propStr += `    sh:path ${pathUri} ;\n`;
        
        if (observedType.startsWith('http://www.w3.org/2001/XMLSchema#')) {
          propStr += `    sh:datatype <${observedType}> ;\n`;
        } else if (observedType === 'IRI') {
          propStr += `    sh:datatype xsd:anyURI ;\n`;
        } else {
          // Fallback to xsd:string to satisfy rdf-lens's requirement of having sh:datatype/sh:class
          propStr += `    sh:datatype xsd:string ;\n`;
        }
        
        propStr += `    sh:minCount 1 ;\n`;
        propStr += `    sh:maxCount 1 ;\n`;
        propStr += `  ]`;
        
        if (index > 0) {
          return `    ` + propStr;
        }
        return propStr;
      });
      shacl += propBlocks.join(' , \n') + ' .';
    }
    return shacl;
  };

  const generateTemplateForClass = (classUri: string, properties: Record<string, any>) => {
    const propEntries = Object.entries(properties);
    
    let fieldsHtml = "";
    
    // Find a title property if possible, e.g. name, title, label, etc.
    let titlePropKey = "";
    const propKeys = propEntries.map(([pred]) => pred.split(/[#/]/).pop() || "");
    const titleCandidates = ["name", "title", "label", "heading", "id"];
    for (const cand of titleCandidates) {
      const idx = propKeys.indexOf(cand);
      if (idx !== -1) {
        titlePropKey = propEntries[idx][0].split(/[#/]/).pop() || "";
        break;
      }
    }
    
    if (!titlePropKey && propKeys.length > 0) {
      titlePropKey = propKeys[0];
    }
    
    const otherProps = propEntries.filter(([pred]) => {
      const key = pred.split(/[#/]/).pop() || "";
      return key !== titlePropKey;
    });
    
    fieldsHtml += `    <h3>{{${titlePropKey || "id"}}}</h3>\n`;
    
    otherProps.forEach(([pred]) => {
      const key = pred.split(/[#/]/).pop() || "";
      const formattedLabel = key.charAt(0).toUpperCase() + key.slice(1);
      fieldsHtml += `    {{#${key}}}<p><strong>${formattedLabel}:</strong> {{${key}}}</p>{{/${key}}}\n`;
    });
    
    const template = `<div class="generated-grid">
  {{#each items}}
  <article class="generated-card">
${fieldsHtml}  </article>
  {{/each}}
</div>

<style>
  .generated-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.25rem;
    padding: 0.5rem 0;
  }

  .generated-card {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.25rem;
    background: #ffffff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .generated-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1;
  }

  .generated-card h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #0f172a;
  }

  .generated-card p {
    margin: 0.35rem 0;
    font-size: 0.875rem;
    color: #475569;
    line-height: 1.5;
  }

  .generated-card strong {
    color: #1e293b;
    font-weight: 500;
  }
</style>`;

    return template;
  };

  const applyClassToPipeline = (clazz: string) => {
    setSelectedClass(clazz);
    setShapeClass(clazz);
    
    const classData = analyzedClasses[clazz];
    if (classData) {
      const shaclTemplate = generateShaclForClass(clazz, classData.properties);
      setShaclInput(shaclTemplate);
      
      const newTemplate = generateTemplateForClass(clazz, classData.properties);
      setTemplateInput(newTemplate);
      
      pushEvent(`Configured pipeline for class ${clazz}`);
    }
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
    setQuads([]);
    setAnalyzedClasses({});
    setSelectedClass("");
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
    setTemplateInput(DEMO_TEMPLATE);
    setQuads([]);
    setAnalyzedClasses({});
    setSelectedClass("");
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
      if (adapterRef.current) {
        const loadedQuads = (adapterRef.current as any).quads || [];
        setQuads(loadedQuads);
        analyzeQuads(loadedQuads);
      }
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

          <section className="rounded-xl border bg-white p-4 space-y-3 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-1.5">
                <Layers className="h-5 w-5 text-indigo-500" />
                2. rdf-lens
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${lensCardTab === "visualizer" ? "bg-slate-900 text-white" : "border text-slate-600 hover:bg-slate-50"}`}
                  onClick={() => setLensCardTab("visualizer")}
                >
                  Schema Visualizer
                </button>
                <button
                  type="button"
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${lensCardTab === "editor" ? "bg-slate-900 text-white" : "border text-slate-600 hover:bg-slate-50"}`}
                  onClick={() => setLensCardTab("editor")}
                >
                  SHACL Shape File
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-xs">
                  <span className="font-semibold text-slate-600">lrdf:shapeClass</span>
                  <input
                    className="w-full rounded-md border px-2 py-1.5 font-mono text-[10px]"
                    value={shapeClass}
                    onChange={(e) => setShapeClass(e.target.value)}
                  />
                </label>
                <label className="flex flex-col justify-end pb-1.5 text-xs">
                  <span className="font-semibold text-slate-600 mb-1">Extraction Mode</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="multipleMode"
                      checked={multiple}
                      className="rounded text-slate-900 focus:ring-slate-900"
                      onChange={(e) => setMultiple(e.target.checked)}
                    />
                    <label htmlFor="multipleMode" className="text-slate-600 select-none cursor-pointer">multiple extraction</label>
                  </div>
                </label>
              </div>
            </div>

            {lensCardTab === "visualizer" ? (
              <div className="space-y-3 flex-1 flex flex-col">
                {Object.keys(analyzedClasses).length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 text-center border-2 border-dashed rounded-lg bg-slate-50">
                    <Layers className="h-10 w-10 text-slate-400 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No data analyzed yet</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Run the playground or load remote RDF data to inspect classes and properties.</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <label className="block space-y-1 text-xs">
                      <span className="font-semibold text-slate-600 flex items-center justify-between">
                        <span>Select Detected Class</span>
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3" /> Auto-updates Shape & Template
                        </span>
                      </span>
                      <select
                        className="w-full rounded-md border px-2 py-1.5 font-mono text-[11px] bg-white cursor-pointer"
                        value={selectedClass}
                        onChange={(e) => {
                          const val = e.target.value;
                          applyClassToPipeline(val);
                        }}
                      >
                        {Object.entries(analyzedClasses).map(([clazz, data]) => {
                          const label = clazz === "http://example.org/UntypedResource" ? "Untyped Resources" : (clazz.split(/[#/]/).pop() || clazz);
                          return (
                            <option key={clazz} value={clazz}>
                              {label} ({data.instanceCount} instances)
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    {selectedClass && analyzedClasses[selectedClass] ? (
                      <div className="space-y-3 flex-1 flex flex-col">
                        <div className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-100 flex items-center justify-between">
                          <span>
                            Mapped <strong>{Object.keys(analyzedClasses[selectedClass].properties).length}</strong> property/properties
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 truncate max-w-[200px]" title={selectedClass}>
                            {selectedClass}
                          </span>
                        </div>

                        {/* Compact Properties List */}
                        <div className="overflow-auto border rounded-lg max-h-[220px] flex-1">
                          <table className="w-full text-left text-xs divide-y divide-slate-100">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="p-2 font-semibold text-slate-500 text-[10px]">Property</th>
                                <th className="p-2 font-semibold text-slate-500 text-[10px]">Type</th>
                                <th className="p-2 font-semibold text-slate-500 text-[10px]">Example</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {Object.values(analyzedClasses[selectedClass].properties).map((prop: any) => {
                                const propLabel = prop.predicate.split(/[#/]/).pop() || prop.predicate;
                                return (
                                  <tr key={prop.predicate} className="hover:bg-slate-50/50 text-[11px]">
                                    <td className="p-2 max-w-[120px] truncate" title={prop.predicate}>
                                      <div className="font-semibold text-slate-800">{propLabel}</div>
                                      <div className="text-[9px] font-mono text-slate-400 truncate">{prop.predicate}</div>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex flex-wrap gap-0.5">
                                        {prop.observedTypes.map((t: string) => {
                                          const shortType = t.split(/[#/]/).pop() || t;
                                          const isXsd = t.includes('XMLSchema#');
                                          return (
                                            <span
                                              key={t}
                                              className={`text-[8px] rounded px-1 py-0.5 font-mono ${isXsd ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600 border'}`}
                                              title={t}
                                            >
                                              {shortType}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </td>
                                    <td className="p-2 max-w-[120px] truncate font-mono text-[9px] text-slate-500" title={prop.exampleValues.join(', ')}>
                                      {prop.exampleValues[0]}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {selectedClass !== "http://example.org/UntypedResource" && (
                          <div className="flex items-center gap-2 mt-auto pt-2 border-t font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                applyClassToPipeline(selectedClass);
                                runPipeline();
                              }}
                              className="flex-grow flex items-center justify-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                            >
                              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              Apply and Run Pipeline
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const shaclTemplate = generateShaclForClass(selectedClass, analyzedClasses[selectedClass].properties);
                                navigator.clipboard.writeText(shaclTemplate);
                                setCopiedShacl(true);
                                setTimeout(() => setCopiedShacl(false), 2000);
                                pushEvent("Generated and copied SHACL template to clipboard");
                              }}
                              className="flex-none rounded-md border border-slate-200 bg-white hover:bg-slate-50 p-1.5 text-slate-700 transition-all cursor-pointer"
                              title="Copy SHACL code to clipboard"
                            >
                              {copiedShacl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center flex-1 border border-dashed rounded-lg bg-slate-50 text-slate-400 text-xs py-8">
                        Select an analyzed class from the list.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="block space-y-1 text-xs flex-1 flex flex-col">
                  <span className="font-semibold text-slate-600">SHACL file content (Turtle)</span>
                  <textarea
                    className="w-full flex-1 min-h-[300px] rounded-md border p-2 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-950"
                    value={shaclInput}
                    onChange={(e) => setShaclInput(e.target.value)}
                  />
                </label>
                <div className="text-[10px] text-slate-500">
                  Tip: write standard SHACL NodeShape shapes to target and extract data from RDF graphs.
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-slate-500 pt-1 border-t mt-auto">
              Status: <span className="font-semibold text-slate-700">{lensStatus}</span>
            </p>
          </section>

          <section className="rounded-xl border bg-white p-4 space-y-3">
            <h2 className="text-lg font-semibold">3. lens-display</h2>
            <p className="text-xs text-slate-600">
              Render the extracted JSON using template tags like <code>{"{{name}}"}</code> and
              <code>{"{{#each items}}"}</code> blocks.
            </p>
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
                >
                  <rdf-lens
                    ref={(node) => {
                      lensRef.current = node;
                    }}
                    key={`lens-${runtime.key}`}
                    config={buildLensConfigRdf(runtime.shapeUrl)}
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

          <section className="rounded-xl border bg-white p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${analyzerTab === "triples" ? "bg-slate-900 text-white" : "border text-slate-600 hover:bg-slate-50"}`}
                  onClick={() => { setAnalyzerTab("triples"); setTriplesPage(1); }}
                >
                  <Table className="h-3.5 w-3.5" />
                  Raw Triples ({quads.length})
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${analyzerTab === "events" ? "bg-slate-900 text-white" : "border text-slate-600 hover:bg-slate-50"}`}
                  onClick={() => setAnalyzerTab("events")}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Event Console ({events.length})
                </button>
              </div>
            </div>

            {analyzerTab === "triples" && (
              <div className="space-y-3">
                {quads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-slate-50">
                    <Table className="h-10 w-10 text-slate-400 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No triples loaded</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Run the playground to load triples from your RDF input or remote URL.</p>
                  </div>
                ) : (() => {
                  const filtered = quads.filter(q => {
                    const term = triplesSearch.toLowerCase();
                    if (!term) return true;
                    return q.subject.value.toLowerCase().includes(term) ||
                           q.predicate.value.toLowerCase().includes(term) ||
                           q.object.value.toLowerCase().includes(term);
                  });

                  const pageSize = 15;
                  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                  const pagedTriples = filtered.slice((triplesPage - 1) * pageSize, triplesPage * pageSize);

                  return (
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search triples by subject, predicate or object..."
                          className="w-full rounded-md border pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                          value={triplesSearch}
                          onChange={(e) => { setTriplesSearch(e.target.value); setTriplesPage(1); }}
                        />
                      </div>

                      {/* Triples List / Table */}
                      <div className="overflow-x-auto border rounded-lg max-h-[300px]">
                        <table className="w-full text-left text-xs divide-y divide-slate-100">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="p-2 font-semibold text-slate-500">Subject</th>
                              <th className="p-2 font-semibold text-slate-500">Predicate</th>
                              <th className="p-2 font-semibold text-slate-500">Object</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                            {pagedTriples.length > 0 ? (
                              pagedTriples.map((q, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2 max-w-[150px] truncate text-slate-700" title={q.subject.value}>
                                    {q.subject.termType === 'BlankNode' ? `_:${q.subject.value}` : q.subject.value}
                                  </td>
                                  <td className="p-2 max-w-[150px] truncate text-slate-500" title={q.predicate.value}>
                                    {q.predicate.value.split(/[#/]/).pop() || q.predicate.value}
                                  </td>
                                  <td className="p-2 max-w-[200px] truncate text-slate-900" title={q.object.value}>
                                    {q.object.termType === 'Literal' ? `"${q.object.value}"` : q.object.value}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="p-4 text-center text-slate-400 italic">No matching triples found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-[10px] text-slate-500">
                            Showing {(triplesPage - 1) * pageSize + 1} - {Math.min(triplesPage * pageSize, filtered.length)} of {filtered.length} triples
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="rounded border p-1 disabled:opacity-40 hover:bg-slate-50"
                              onClick={() => setTriplesPage(prev => Math.max(prev - 1, 1))}
                              disabled={triplesPage === 1}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-medium px-2 py-1 select-none">
                              Page {triplesPage} of {totalPages}
                            </span>
                            <button
                              type="button"
                              className="rounded border p-1 disabled:opacity-40 hover:bg-slate-50"
                              onClick={() => setTriplesPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={triplesPage === totalPages}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {analyzerTab === "events" && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500">
                  Debug stream from adapter/lens/display events. Useful when your SHACL or template is invalid.
                </p>
                <div className="h-[360px] overflow-auto rounded-md border bg-slate-950 p-3 font-mono text-[10px] text-slate-100">
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
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
