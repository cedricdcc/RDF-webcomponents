'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type StepId = 'source-rdf' | 'rdf-lens' | 'lens-display';

type ModelOption = {
  id: string;
  name: string;
  contextLength: number;
  promptPrice: number | null;
  completionPrice: number | null;
};

type SourceGuidedValues = {
  useRemoteData: boolean;
  remoteDataUrl: string;
  dataStrategy: 'file' | 'sparql' | 'cbd';
  dataFormat: 'turtle' | 'json-ld' | 'rdf-xml' | 'n-triples';
  sparqlSelectorMode: 'subjectClass' | 'subject' | 'subjectQuery';
  subjectClass: string;
  subjectValue: string;
  subjectQuery: string;
  cbdDepth: string;
};

type SourceAgentOutput = {
  guidedValues: SourceGuidedValues;
  ttlConfig: string;
  explanation?: string;
};

type LensAgentOutput = {
  shapeClass: string;
  multiple: boolean;
  shaclTtl: string;
  lensConfigTtl: string;
  explanation?: string;
};

type DisplayAgentOutput = {
  templateHtml: string;
  explanation?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  step: StepId;
  at: string;
};

type RuntimeConfig = {
  dataUrl: string;
  shapeUrl: string;
  templateUrl: string;
  key: number;
};

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const KEY_STORAGE = 'rdf-ai-playground-openrouter-key';
const MODEL_STORAGE = 'rdf-ai-playground-model-id';
const HOSTED_BUNDLE_URL = 'https://cedricdcc.github.io/RDF-webcomponents/rdf-webcomponents.js';

const STEP_DETAILS: Record<StepId, { title: string; does: string; returns: string }> = {
  'source-rdf': {
    title: 'Source-RDF Agent',
    does: 'Builds or refines source-rdf retrieval config with guided values for file, SPARQL, or CBD flows.',
    returns: 'Guided form values and a ready-to-use source-rdf TTL config.',
  },
  'rdf-lens': {
    title: 'RDF-Lens Agent',
    does: 'Inspects triplestore data first, then designs SHACL extraction shapes for the requested output.',
    returns: 'SHACL Turtle and rdf-lens TTL config.',
  },
  'lens-display': {
    title: 'Lens-Display Agent',
    does: 'Generates a context-aware HTML template from extracted fields and display intent.',
    returns: 'Template HTML compatible with lens-display rendering syntax.',
  },
};

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

function nowTime(): string {
  return new Date().toLocaleTimeString();
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return 0;
}

function parsePossibleJson<T>(content: string): T {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue with fence and bracket extraction.
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return JSON.parse(fenceMatch[1]) as T;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  }

  throw new Error('Could not parse JSON response from model.');
}

function sanitizeModelName(name: unknown, id: string): string {
  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }
  return id;
}

function normalizeModels(raw: any[]): ModelOption[] {
  const normalized = raw
    .map((entry) => {
      const id = String(entry?.id ?? '').trim();
      const name = sanitizeModelName(entry?.name, id);
      const contextLength = Math.max(
        toNumber(entry?.context_length),
        toNumber(entry?.top_provider?.context_length),
        toNumber(entry?.architecture?.context_length),
      );
      const promptPriceRaw = entry?.pricing?.prompt;
      const completionPriceRaw = entry?.pricing?.completion;
      const promptPrice = promptPriceRaw != null ? Number(promptPriceRaw) : null;
      const completionPrice = completionPriceRaw != null ? Number(completionPriceRaw) : null;
      return {
        id,
        name,
        contextLength,
        promptPrice: Number.isFinite(promptPrice as number) ? promptPrice : null,
        completionPrice: Number.isFinite(completionPrice as number) ? completionPrice : null,
      } as ModelOption;
    })
    .filter((m) => m.id.length > 0 && m.contextLength > 0);

  const freeOnly = normalized.filter((model) => {
    const idLooksFree = /(^|:)free$/i.test(model.id) || /free/i.test(model.name);
    const hasBothPrices = model.promptPrice != null && model.completionPrice != null;
    const priceLooksFree = hasBothPrices ? model.promptPrice === 0 && model.completionPrice === 0 : false;
    return idLooksFree || priceLooksFree;
  });

  return freeOnly
    .sort((a, b) => b.contextLength - a.contextLength)
    .slice(0, 5);
}

function toIriOrString(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed) || /^urn:/i.test(trimmed)) {
    return `<${trimmed}>`;
  }
  return `"${trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

function buildSourceConfigRdf(values: SourceGuidedValues, sourceUrlOverride?: string): string {
  const sourceUrl = sourceUrlOverride
    ? sourceUrlOverride
    : values.useRemoteData
      ? values.remoteDataUrl.trim()
      : 'urn:playground:inline-data';

  const triples: string[] = [
    `srdf:url ${toIriOrString(sourceUrl || 'https://example.org/data.ttl')}`,
    `srdf:strategy "${values.dataStrategy}"`,
    `srdf:format "${values.dataFormat}"`,
  ];

  if (values.dataStrategy === 'sparql') {
    if (values.sparqlSelectorMode === 'subjectClass' && values.subjectClass.trim()) {
      triples.push(`srdf:subjectClass ${toIriOrString(values.subjectClass)}`);
    }
    if (values.sparqlSelectorMode === 'subject' && values.subjectValue.trim()) {
      triples.push(`srdf:subject ${toIriOrString(values.subjectValue)}`);
    }
    if (values.sparqlSelectorMode === 'subjectQuery' && values.subjectQuery.trim()) {
      triples.push(`srdf:subjectQuery ${toIriOrString(values.subjectQuery)}`);
    }
  }

  if (values.dataStrategy === 'cbd') {
    if (values.subjectValue.trim()) {
      triples.push(`srdf:subject ${toIriOrString(values.subjectValue)}`);
    }
    const depth = Number(values.cbdDepth);
    if (Number.isFinite(depth) && depth > 0) {
      triples.push(`srdf:depth ${Math.floor(depth)}`);
    }
  }

  return `@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .\n\n[] a srdf:SourceRdfConfig ;\n  ${triples.join(
    ' ;\n  '
  )} .`;
}

function buildLensConfigRdf(shapeClass: string, multiple: boolean, shapeUrl = 'urn:playground:inline-shacl'): string {
  return `@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .\n\n[] a lrdf:RdfLensConfig ;\n  lrdf:shapeFile ${toIriOrString(
    shapeUrl
  )} ;\n  lrdf:shapeClass ${toIriOrString(shapeClass)} ;\n  lrdf:multiple ${multiple} .`;
}

function buildStandaloneHtml(params: {
  sourceConfig: string;
  lensConfig: string;
  shaclTtl: string;
  template: string;
  rdfInput: string;
  useRemoteData: boolean;
  remoteDataUrl: string;
}): string {
  const sourceConfigJs = JSON.stringify(params.sourceConfig);
  const lensConfigJs = JSON.stringify(params.lensConfig);
  const templateJs = JSON.stringify(params.template);
  const rdfInputJs = JSON.stringify(params.rdfInput);
  const remoteDataUrlJs = JSON.stringify(params.remoteDataUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RDF Webcomponents Export</title>
  <script type="module" src="${HOSTED_BUNDLE_URL}"></script>
  <style>
    body{font-family:ui-sans-serif,system-ui,sans-serif;margin:0;padding:24px;background:#f8fafc;color:#0f172a}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px}
  </style>
</head>
<body>
  <div class="card">
    <h1>RDF Webcomponents Export</h1>
    <p>Inline source config, lens config, and template are embedded below.</p>
    <div id="mount"></div>
  </div>

  <script>
    const sourceConfig = ${sourceConfigJs};
    const lensConfig = ${lensConfigJs};
    const templateHtml = ${templateJs};
    const useRemoteData = ${params.useRemoteData ? 'true' : 'false'};
    const remoteDataUrl = ${remoteDataUrlJs};
    const rdfInline = ${rdfInputJs};

    const mount = document.getElementById('mount');
    const display = document.createElement('lens-display');
    const lens = document.createElement('rdf-lens');
    const source = document.createElement('source-rdf');

    const urls = [];
    const trackUrl = (u) => {
      urls.push(u);
      return u;
    };

    const templateBlobUrl = trackUrl(URL.createObjectURL(new Blob([templateHtml], { type: 'text/html;charset=utf-8' })));
    display.setAttribute('template', templateBlobUrl);

    if (useRemoteData) {
      source.setAttribute('config', sourceConfig);
    } else {
      const rdfBlobUrl = trackUrl(URL.createObjectURL(new Blob([rdfInline], { type: 'text/turtle;charset=utf-8' })));
      const patchedConfig = sourceConfig.replace('urn:playground:inline-data', rdfBlobUrl);
      source.setAttribute('config', patchedConfig);
    }

    const shaclBlobUrl = trackUrl(URL.createObjectURL(new Blob([${JSON.stringify(params.shaclTtl)}], { type: 'text/turtle;charset=utf-8' })));
    const patchedLensConfig = lensConfig.replace('urn:playground:inline-shacl', shaclBlobUrl);
    lens.setAttribute('config', patchedLensConfig);

    lens.appendChild(source);
    display.appendChild(lens);
    mount.appendChild(display);

    window.addEventListener('beforeunload', () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    });
  </script>
</body>
</html>`;
}

function isSourceGuidedValues(input: unknown): input is SourceGuidedValues {
  const x = input as Record<string, unknown>;
  if (!x || typeof x !== 'object') {
    return false;
  }
  return (
    typeof x.useRemoteData === 'boolean' &&
    typeof x.remoteDataUrl === 'string' &&
    ['file', 'sparql', 'cbd'].includes(String(x.dataStrategy)) &&
    ['turtle', 'json-ld', 'rdf-xml', 'n-triples'].includes(String(x.dataFormat)) &&
    ['subjectClass', 'subject', 'subjectQuery'].includes(String(x.sparqlSelectorMode)) &&
    typeof x.subjectClass === 'string' &&
    typeof x.subjectValue === 'string' &&
    typeof x.subjectQuery === 'string' &&
    typeof x.cbdDepth === 'string'
  );
}

function isSourceAgentOutput(input: unknown): input is SourceAgentOutput {
  const x = input as Record<string, unknown>;
  return (
    !!x &&
    typeof x === 'object' &&
    isSourceGuidedValues(x.guidedValues) &&
    typeof x.ttlConfig === 'string' &&
    x.ttlConfig.trim().length > 0
  );
}

function isLensAgentOutput(input: unknown): input is LensAgentOutput {
  const x = input as Record<string, unknown>;
  return (
    !!x &&
    typeof x === 'object' &&
    typeof x.shapeClass === 'string' &&
    typeof x.multiple === 'boolean' &&
    typeof x.shaclTtl === 'string' &&
    x.shaclTtl.trim().length > 0 &&
    typeof x.lensConfigTtl === 'string' &&
    x.lensConfigTtl.trim().length > 0
  );
}

function isDisplayAgentOutput(input: unknown): input is DisplayAgentOutput {
  const x = input as Record<string, unknown>;
  return !!x && typeof x === 'object' && typeof x.templateHtml === 'string' && x.templateHtml.trim().length > 0;
}

export default function AiPlaygroundPage() {
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [bundleError, setBundleError] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [currentStep, setCurrentStep] = useState<StepId>('source-rdf');

  const [useRemoteData, setUseRemoteData] = useState(false);
  const [remoteDataUrl, setRemoteDataUrl] = useState('https://dbpedia.org/sparql');
  const [dataStrategy, setDataStrategy] = useState<'file' | 'sparql' | 'cbd'>('file');
  const [dataFormat, setDataFormat] = useState<'turtle' | 'json-ld' | 'rdf-xml' | 'n-triples'>('turtle');
  const [sparqlSelectorMode, setSparqlSelectorMode] = useState<'subjectClass' | 'subject' | 'subjectQuery'>('subjectClass');
  const [subjectClass, setSubjectClass] = useState('http://example.org/Person');
  const [subjectValue, setSubjectValue] = useState('');
  const [subjectQuery, setSubjectQuery] = useState('');
  const [cbdDepth, setCbdDepth] = useState('2');
  const [rdfInput, setRdfInput] = useState(DEMO_DATA);
  const [sourceConfigPreview, setSourceConfigPreview] = useState(() =>
    buildSourceConfigRdf({
      useRemoteData,
      remoteDataUrl,
      dataStrategy,
      dataFormat,
      sparqlSelectorMode,
      subjectClass,
      subjectValue,
      subjectQuery,
      cbdDepth,
    })
  );

  const [shapeClass, setShapeClass] = useState('http://example.org/Person');
  const [multiple, setMultiple] = useState(true);
  const [shaclInput, setShaclInput] = useState(DEMO_SHAPES);
  const [lensConfigPreview, setLensConfigPreview] = useState(() => buildLensConfigRdf('http://example.org/Person', true));

  const [templateInput, setTemplateInput] = useState(DEMO_TEMPLATE);

  const [runtime, setRuntime] = useState<RuntimeConfig | null>(null);
  const [activity, setActivity] = useState<string[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const [estimatedUsageTokens, setEstimatedUsageTokens] = useState(0);

  const sourceRef = useRef<HTMLElement | null>(null);
  const lensRef = useRef<HTMLElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const runtimeUrlsRef = useRef<string[]>([]);

  const [adapterStatus, setAdapterStatus] = useState('idle');
  const [lensStatus, setLensStatus] = useState('idle');
  const [displayStatus, setDisplayStatus] = useState('idle');

  const selectedModel = useMemo(() => models.find((m) => m.id === selectedModelId) ?? null, [models, selectedModelId]);
  const maxContext = selectedModel?.contextLength ?? 0;
  const estimatedRemaining = Math.max(0, maxContext - estimatedUsageTokens);

  const sourceValues = useMemo<SourceGuidedValues>(
    () => ({
      useRemoteData,
      remoteDataUrl,
      dataStrategy,
      dataFormat,
      sparqlSelectorMode,
      subjectClass,
      subjectValue,
      subjectQuery,
      cbdDepth,
    }),
    [
      useRemoteData,
      remoteDataUrl,
      dataStrategy,
      dataFormat,
      sparqlSelectorMode,
      subjectClass,
      subjectValue,
      subjectQuery,
      cbdDepth,
    ]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedKey = window.localStorage.getItem(KEY_STORAGE) ?? '';
    const storedModel = window.localStorage.getItem(MODEL_STORAGE) ?? '';
    if (storedKey) {
      setApiKey(storedKey);
      setActivity((prev) => [`[${nowTime()}] Loaded API key from localStorage.`, ...prev].slice(0, 80));
    }
    if (storedModel) {
      setSelectedModelId(storedModel);
    }
  }, []);

  const appendActivity = (line: string): void => {
    setActivity((prev) => [`[${nowTime()}] ${line}`, ...prev].slice(0, 80));
  };

  const syncSourcePreview = (values: SourceGuidedValues): void => {
    setSourceConfigPreview(buildSourceConfigRdf(values));
  };

  const syncLensPreview = (nextShapeClass: string, nextMultiple: boolean): void => {
    setLensConfigPreview(buildLensConfigRdf(nextShapeClass, nextMultiple));
  };

  const saveApiKey = (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(KEY_STORAGE, apiKey.trim());
    appendActivity('Saved API key to localStorage.');
  };

  const clearApiKey = (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    setApiKey('');
    window.localStorage.removeItem(KEY_STORAGE);
    appendActivity('Cleared API key from localStorage.');
  };

  const fetchModels = async (): Promise<void> => {
    if (!apiKey.trim()) {
      window.alert('Please provide your OpenRouter API key first.');
      return;
    }

    setIsBusy(true);
    appendActivity('Fetching free OpenRouter models.');

    try {
      const response = await fetch(OPENROUTER_MODELS_URL, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Model fetch failed with status ${response.status}.`);
      }

      const json = await response.json();
      const topModels = normalizeModels(Array.isArray(json?.data) ? json.data : []);

      setModels(topModels);
      if (topModels.length === 0) {
        appendActivity('No free models found for this key.');
        return;
      }

      const storedModel = typeof window !== 'undefined' ? window.localStorage.getItem(MODEL_STORAGE) : null;
      const selected = topModels.find((m) => m.id === storedModel) ?? topModels[0];
      setSelectedModelId(selected.id);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(MODEL_STORAGE, selected.id);
      }
      appendActivity(`Selected model ${selected.id} (${selected.contextLength} ctx).`);
    } catch (error) {
      appendActivity(`Model fetch error: ${(error as Error).message}`);
      window.alert((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const runPipeline = (): void => {
    if (!bundleLoaded || bundleError) {
      return;
    }

    for (const url of runtimeUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    runtimeUrlsRef.current = [];

    const dataUrl = useRemoteData
      ? remoteDataUrl.trim()
      : URL.createObjectURL(new Blob([rdfInput], { type: 'text/turtle;charset=utf-8' }));
    const shapeUrl = URL.createObjectURL(new Blob([shaclInput], { type: 'text/turtle;charset=utf-8' }));
    const templateUrl = URL.createObjectURL(new Blob([templateInput], { type: 'text/html;charset=utf-8' }));

    if (!useRemoteData) {
      runtimeUrlsRef.current.push(dataUrl);
    }
    runtimeUrlsRef.current.push(shapeUrl, templateUrl);

    setRuntime({ dataUrl, shapeUrl, templateUrl, key: Date.now() });
    setAdapterStatus('loading');
    setLensStatus('waiting');
    setDisplayStatus('waiting');
    appendActivity('Pipeline rerun requested.');
  };

  const summarizeTriplestore = async (): Promise<string> => {
    const sourceEl = sourceRef.current as any;
    const quads = sourceEl?.quads;

    if (Array.isArray(quads) && quads.length > 0) {
      const sample = quads.slice(0, 40);
      const predicateCounts = new Map<string, number>();
      for (const quad of sample) {
        const key = String(quad?.predicate?.value ?? 'unknown');
        predicateCounts.set(key, (predicateCounts.get(key) ?? 0) + 1);
      }
      const ranked = [...predicateCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([p, n]) => `${p} (${n})`)
        .join(', ');
      return `Runtime triplestore available. Quad count: ${quads.length}. Top predicates: ${ranked}.`;
    }

    if (dataStrategy === 'sparql' && useRemoteData && remoteDataUrl.trim()) {
      const ok = window.confirm('No runtime triplestore found. Run a fallback SPARQL inspection query now?');
      if (!ok) {
        return 'No runtime triplestore was available, and user declined fallback SPARQL inspection.';
      }

      appendActivity('Running fallback SPARQL inspection query.');
      try {
        const endpoint = remoteDataUrl.trim();
        const query = 'SELECT ?s ?p WHERE { ?s ?p ?o } LIMIT 30';
        const body = new URLSearchParams({ query });
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/sparql-results+json',
          },
          body,
        });
        if (!response.ok) {
          return `Fallback SPARQL inspection failed with status ${response.status}.`;
        }
        const json = await response.json();
        const bindings = Array.isArray(json?.results?.bindings) ? json.results.bindings : [];
        const preview = bindings
          .slice(0, 10)
          .map((row: any) => `${row?.s?.value ?? '?s'} ${row?.p?.value ?? '?p'}`)
          .join('\n');
        return `Fallback SPARQL sample rows: ${bindings.length}.\n${preview}`;
      } catch (error) {
        return `Fallback SPARQL inspection failed: ${(error as Error).message}`;
      }
    }

    return 'No triplestore runtime data found. Continue with current user-provided config and SHACL draft.';
  };

  const buildPromptForStep = async (step: StepId, userComment: string): Promise<string> => {
    const ontologyAndUsage = `
Component ontology and usage references:
- source-rdf config vocabulary: srdf:url, srdf:strategy(file|sparql|cbd), srdf:format, srdf:subject, srdf:subjectClass, srdf:subjectQuery, srdf:depth
- rdf-lens config vocabulary: lrdf:shapeFile, lrdf:shapeClass, lrdf:multiple
- lens-display template uses mustache-like tags: {{name}}, {{#each items}}...{{/each}}, conditional blocks.
`;

    const context = `
Current source-rdf TTL:
${sourceConfigPreview}

Current SHACL:
${shaclInput}

Current template:
${templateInput}

User comment:
${userComment || '(none)'}
`;

    if (step === 'source-rdf') {
      return `${ontologyAndUsage}
You are the source-rdf specialist.
Return strict JSON only with this schema:
{
  "guidedValues": {
    "useRemoteData": boolean,
    "remoteDataUrl": string,
    "dataStrategy": "file" | "sparql" | "cbd",
    "dataFormat": "turtle" | "json-ld" | "rdf-xml" | "n-triples",
    "sparqlSelectorMode": "subjectClass" | "subject" | "subjectQuery",
    "subjectClass": string,
    "subjectValue": string,
    "subjectQuery": string,
    "cbdDepth": string
  },
  "ttlConfig": string,
  "explanation": string
}
The ttlConfig must be directly usable by <source-rdf config="...">.
${context}`;
    }

    if (step === 'rdf-lens') {
      const triplestoreSummary = await summarizeTriplestore();
      return `${ontologyAndUsage}
You are the rdf-lens specialist.
First analyze triplestore facts and create a SHACL file to extract the user-requested fields.
Return strict JSON only with this schema:
{
  "shapeClass": string,
  "multiple": boolean,
  "shaclTtl": string,
  "lensConfigTtl": string,
  "explanation": string
}
Use real predicates from triplestore inspection whenever possible.
Triplestore inspection:
${triplestoreSummary}
${context}`;
    }

    return `${ontologyAndUsage}
You are the lens-display specialist.
Use extracted field names and generate a polished HTML template that is compatible with lens-display mustache syntax.
Return strict JSON only with this schema:
{
  "templateHtml": string,
  "explanation": string
}
${context}`;
  };

  const callOpenRouter = async (prompt: string): Promise<{ content: string; modelId: string }> => {
    if (!apiKey.trim()) {
      throw new Error('OpenRouter API key is missing.');
    }
    const candidateIds = [
      selectedModelId,
      ...models.map((m) => m.id),
    ].filter((id, index, arr): id is string => Boolean(id) && arr.indexOf(id) === index);

    if (candidateIds.length === 0) {
      throw new Error('No model candidates available. Fetch models first.');
    }

    let lastError = 'No model returned usable content.';

    for (const modelId of candidateIds) {
      const payload = {
        model: modelId,
        messages: [
          {
            role: 'system',
            content:
              'You are an RDF assistant that always returns valid JSON exactly matching the required schema. No markdown fences.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      };

      const promptTokenEstimate = estimateTokens(JSON.stringify(payload));
      setEstimatedUsageTokens((prev) => prev + promptTokenEstimate);

      try {
        const response = await fetch(OPENROUTER_CHAT_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 429) {
            appendActivity(`Model ${modelId} hit rate limit (429). Trying next model.`);
            lastError = `Model ${modelId} rate limited.`;
            continue;
          }
          appendActivity(`Model ${modelId} failed (${response.status}). Trying next model.`);
          lastError = `Model ${modelId} failed with status ${response.status}.`;
          continue;
        }

        const json = await response.json();
        const content = json?.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.trim()) {
          setEstimatedUsageTokens((prev) => prev + estimateTokens(content));
          appendActivity(`Model ${modelId} returned a valid response.`);
          return { content, modelId };
        }

        appendActivity(`Model ${modelId} returned empty content. Trying next model.`);
        lastError = `Model ${modelId} returned empty content.`;
      } catch (error) {
        appendActivity(`Model ${modelId} error: ${(error as Error).message}. Trying next model.`);
        lastError = (error as Error).message;
      }
    }

    throw new Error(`All model attempts failed. Last error: ${lastError}`);
  };

  const exportJson = (): void => {
    const payload = {
      version: 1,
      selectedModelId,
      sourceGuidedValues: sourceValues,
      sourceConfigPreview,
      shapeClass,
      multiple,
      shaclInput,
      lensConfigPreview,
      templateInput,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rdf-ai-playground-config.json';
    a.click();
    URL.revokeObjectURL(url);
    appendActivity('Exported JSON configuration.');
  };

  const onImportJson = async (file: File | null): Promise<void> => {
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json?.sourceGuidedValues) {
        const s = json.sourceGuidedValues as SourceGuidedValues;
        setUseRemoteData(Boolean(s.useRemoteData));
        setRemoteDataUrl(String(s.remoteDataUrl ?? ''));
        setDataStrategy((s.dataStrategy as SourceGuidedValues['dataStrategy']) ?? 'file');
        setDataFormat((s.dataFormat as SourceGuidedValues['dataFormat']) ?? 'turtle');
        setSparqlSelectorMode((s.sparqlSelectorMode as SourceGuidedValues['sparqlSelectorMode']) ?? 'subjectClass');
        setSubjectClass(String(s.subjectClass ?? ''));
        setSubjectValue(String(s.subjectValue ?? ''));
        setSubjectQuery(String(s.subjectQuery ?? ''));
        setCbdDepth(String(s.cbdDepth ?? '2'));
      }
      if (typeof json?.sourceConfigPreview === 'string') {
        setSourceConfigPreview(json.sourceConfigPreview);
      }
      if (typeof json?.shapeClass === 'string') {
        setShapeClass(json.shapeClass);
      }
      if (typeof json?.multiple === 'boolean') {
        setMultiple(json.multiple);
      }
      if (typeof json?.shaclInput === 'string') {
        setShaclInput(json.shaclInput);
      }
      if (typeof json?.lensConfigPreview === 'string') {
        setLensConfigPreview(json.lensConfigPreview);
      }
      if (typeof json?.templateInput === 'string') {
        setTemplateInput(json.templateInput);
      }
      if (typeof json?.selectedModelId === 'string') {
        setSelectedModelId(json.selectedModelId);
      }
      appendActivity('Imported JSON configuration.');
    } catch (error) {
      window.alert(`Import failed: ${(error as Error).message}`);
    }
  };

  const exportStandaloneHtml = (): void => {
    const html = buildStandaloneHtml({
      sourceConfig: sourceConfigPreview,
      lensConfig: lensConfigPreview,
      shaclTtl: shaclInput,
      template: templateInput,
      rdfInput,
      useRemoteData,
      remoteDataUrl,
    });

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rdf-ai-playground-export.html';
    a.click();
    URL.revokeObjectURL(url);
    appendActivity('Exported standalone HTML with inline configs and template.');
  };

  const recalcPreviews = (): void => {
    syncSourcePreview(sourceValues);
    syncLensPreview(shapeClass, multiple);
  };

  const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  const runStepWithRetries = async (step: StepId, baseComment: string, maxAttempts = 3): Promise<void> => {
    let lastError = 'Unknown step error.';

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const repairHint =
          attempt === 1
            ? ''
            : `\nPrevious attempt failed: ${lastError}\nFix the issue and return a valid strict JSON output.`;
        const prompt = await buildPromptForStep(step, `${baseComment}${repairHint}`);
        const completion = await callOpenRouter(prompt);
        const content = completion.content;

        if (completion.modelId !== selectedModelId) {
          setSelectedModelId(completion.modelId);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(MODEL_STORAGE, completion.modelId);
          }
        }

        if (step === 'source-rdf') {
          const parsed = parsePossibleJson<unknown>(content);
          if (!isSourceAgentOutput(parsed)) {
            throw new Error('Invalid source-rdf agent output schema.');
          }
          const guided = parsed.guidedValues;
          setUseRemoteData(guided.useRemoteData);
          setRemoteDataUrl(guided.remoteDataUrl);
          setDataStrategy(guided.dataStrategy);
          setDataFormat(guided.dataFormat);
          setSparqlSelectorMode(guided.sparqlSelectorMode);
          setSubjectClass(guided.subjectClass);
          setSubjectValue(guided.subjectValue);
          setSubjectQuery(guided.subjectQuery);
          setCbdDepth(guided.cbdDepth);
          setSourceConfigPreview(parsed.ttlConfig);
        }

        if (step === 'rdf-lens') {
          const parsed = parsePossibleJson<unknown>(content);
          if (!isLensAgentOutput(parsed)) {
            throw new Error('Invalid rdf-lens agent output schema.');
          }
          setShapeClass(parsed.shapeClass);
          setMultiple(parsed.multiple);
          setShaclInput(parsed.shaclTtl);
          setLensConfigPreview(parsed.lensConfigTtl);
        }

        if (step === 'lens-display') {
          const parsed = parsePossibleJson<unknown>(content);
          if (!isDisplayAgentOutput(parsed)) {
            throw new Error('Invalid lens-display agent output schema.');
          }
          setTemplateInput(parsed.templateHtml);
        }

        appendActivity(`${step} completed on attempt ${attempt} using ${completion.modelId}.`);
        setChat((prev) => [
          {
            role: 'assistant',
            step,
            at: nowTime(),
            content: `${STEP_DETAILS[step].title} completed automatically (attempt ${attempt}).`,
          },
          ...prev,
        ]);
        return;
      } catch (error) {
        lastError = (error as Error).message;
        appendActivity(`${step} attempt ${attempt} failed: ${lastError}`);
      }
    }

    throw new Error(`${step} failed after ${maxAttempts} attempts. Last error: ${lastError}`);
  };

  const runAutonomousPipeline = async (): Promise<void> => {
    if (isBusy) {
      return;
    }
    if (!apiKey.trim()) {
      window.alert('OpenRouter API key is missing.');
      return;
    }

    const objective = chatInput.trim() ||
      'Run full autonomous pipeline and generate coherent source-rdf config, SHACL extraction, and final template.';

    setIsBusy(true);
    setChatInput('');
    setChat((prev) => [
      {
        role: 'user',
        step: currentStep,
        at: nowTime(),
        content: `Autonomous pipeline request: ${objective}`,
      },
      ...prev,
    ]);
    appendActivity('Starting autonomous pipeline run. Human approval is skipped until final output.');

    try {
      setCurrentStep('source-rdf');
      await runStepWithRetries('source-rdf', objective);
      runPipeline();
      await sleep(1000);

      setCurrentStep('rdf-lens');
      await runStepWithRetries('rdf-lens', objective);
      runPipeline();
      await sleep(1000);

      setCurrentStep('lens-display');
      await runStepWithRetries('lens-display', objective);
      runPipeline();

      appendActivity('Autonomous pipeline finished successfully.');
      setChat((prev) => [
        {
          role: 'assistant',
          step: 'lens-display',
          at: nowTime(),
          content: 'Full pipeline finished. Config, SHACL, and template have been updated automatically.',
        },
        ...prev,
      ]);
    } catch (error) {
      appendActivity(`Autonomous pipeline failed: ${(error as Error).message}`);
      setChat((prev) => [
        {
          role: 'assistant',
          step: currentStep,
          at: nowTime(),
          content: `Autonomous pipeline failed after retries. ${(error as Error).message}`,
        },
        ...prev,
      ]);
      window.alert((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const onSourceReady = (event: Event): void => {
    setAdapterStatus('ready');
    appendActivity(`source-rdf: triplestore-ready ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onSourceLoading = (event: Event): void => {
    setAdapterStatus('loading');
    appendActivity(`source-rdf: triplestore-loading ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onSourceError = (event: Event): void => {
    setAdapterStatus('error');
    appendActivity(`source-rdf: triplestore-error ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onLensReady = (event: Event): void => {
    setLensStatus('ready');
    appendActivity(`rdf-lens: shape-processed ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onLensLoading = (event: Event): void => {
    setLensStatus('loading');
    appendActivity(`rdf-lens: shapes-loaded ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onLensError = (event: Event): void => {
    setLensStatus('error');
    appendActivity(`rdf-lens: shape-error ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onDisplayReady = (event: Event): void => {
    setDisplayStatus('ready');
    appendActivity(`lens-display: render-complete ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const onDisplayError = (event: Event): void => {
    setDisplayStatus('error');
    appendActivity(`lens-display: render-error ${JSON.stringify((event as CustomEvent).detail ?? {})}`);
  };

  const mountSourceRef = (node: HTMLElement | null): void => {
    if (sourceRef.current) {
      sourceRef.current.removeEventListener('triplestore-ready', onSourceReady as EventListener);
      sourceRef.current.removeEventListener('triplestore-loading', onSourceLoading as EventListener);
      sourceRef.current.removeEventListener('triplestore-error', onSourceError as EventListener);
    }
    sourceRef.current = node;
    if (node) {
      node.addEventListener('triplestore-ready', onSourceReady as EventListener);
      node.addEventListener('triplestore-loading', onSourceLoading as EventListener);
      node.addEventListener('triplestore-error', onSourceError as EventListener);
    }
  };

  const mountLensRef = (node: HTMLElement | null): void => {
    if (lensRef.current) {
      lensRef.current.removeEventListener('shape-processed', onLensReady as EventListener);
      lensRef.current.removeEventListener('shapes-loaded', onLensLoading as EventListener);
      lensRef.current.removeEventListener('shape-error', onLensError as EventListener);
    }
    lensRef.current = node;
    if (node) {
      node.addEventListener('shape-processed', onLensReady as EventListener);
      node.addEventListener('shapes-loaded', onLensLoading as EventListener);
      node.addEventListener('shape-error', onLensError as EventListener);
    }
  };

  const mountDisplayRef = (node: HTMLElement | null): void => {
    if (displayRef.current) {
      displayRef.current.removeEventListener('render-complete', onDisplayReady as EventListener);
      displayRef.current.removeEventListener('render-error', onDisplayError as EventListener);
    }
    displayRef.current = node;
    if (node) {
      node.addEventListener('render-complete', onDisplayReady as EventListener);
      node.addEventListener('render-error', onDisplayError as EventListener);
    }
  };

  useEffect(() => {
    return () => {
      for (const url of runtimeUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      runtimeUrlsRef.current = [];
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Script
        type="module"
        src={HOSTED_BUNDLE_URL}
        strategy="afterInteractive"
        onLoad={() => {
          setBundleLoaded(true);
          appendActivity('Hosted bundle loaded.');
        }}
        onError={() => {
          setBundleError(true);
          appendActivity('Failed to load hosted bundle URL.');
        }}
      />

      <div className="container mx-auto space-y-6 px-4 py-8 lg:pr-[420px]">
        <header className="space-y-2">
          <Link href="/" className="text-sm underline">
            Back to docs
          </Link>
          <h1 className="text-3xl font-bold">AI RDF Playground</h1>
          <p className="max-w-4xl text-sm text-slate-600">
            OpenRouter-powered multi-step assistant for source-rdf, rdf-lens, and lens-display.
          </p>
        </header>

        <section className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">OpenRouter Setup</h2>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="How to get an OpenRouter API key"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  ?
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get your OpenRouter API key</DialogTitle>
                  <DialogDescription>
                    Follow these steps, then paste your key in this playground.
                  </DialogDescription>
                </DialogHeader>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  <li>
                    Go to{' '}
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline">
                      openrouter.ai/keys
                    </a>
                    .
                  </li>
                  <li>Sign in or create an account.</li>
                  <li>Create a new API key.</li>
                  <li>Copy the key and paste it into the API key field in this page.</li>
                  <li>Click Save key, then click Fetch top 5 free models.</li>
                </ol>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="rounded-md border px-2 py-2 md:col-span-2"
              type="password"
              placeholder="OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="rounded-md bg-slate-900 px-3 py-2 text-white" onClick={saveApiKey}>
              Save key
            </button>
            <button className="rounded-md border px-3 py-2" onClick={clearApiKey}>
              Clear key
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <button className="rounded-md border px-3 py-2" onClick={fetchModels} disabled={isBusy}>
              Fetch top 5 free models
            </button>
            <select
              className="rounded-md border px-2 py-2 md:col-span-3"
              value={selectedModelId}
              onChange={(e) => {
                setSelectedModelId(e.target.value);
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(MODEL_STORAGE, e.target.value);
                }
              }}
            >
              <option value="">Select model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id} ({model.contextLength} ctx)
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              className={`rounded-md px-3 py-1.5 text-sm ${currentStep === 'source-rdf' ? 'bg-slate-900 text-white' : 'border'}`}
              onClick={() => setCurrentStep('source-rdf')}
            >
              1. source-rdf
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm ${currentStep === 'rdf-lens' ? 'bg-slate-900 text-white' : 'border'}`}
              onClick={() => setCurrentStep('rdf-lens')}
            >
              2. rdf-lens
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm ${currentStep === 'lens-display' ? 'bg-slate-900 text-white' : 'border'}`}
              onClick={() => setCurrentStep('lens-display')}
            >
              3. lens-display
            </button>
          </div>

          <div className="mb-4 rounded-md border bg-slate-50 p-3 text-sm">
            <p className="font-semibold">Current step behavior: {STEP_DETAILS[currentStep].title}</p>
            <p className="mt-1 text-slate-700">{STEP_DETAILS[currentStep].does}</p>
            <p className="mt-1 text-slate-600">Output: {STEP_DETAILS[currentStep].returns}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 rounded-lg border bg-slate-50 p-3">
              <h3 className="font-semibold">Source-RDF Guided Values</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useRemoteData} onChange={(e) => setUseRemoteData(e.target.checked)} />
                Use remote data URL
              </label>
              <input
                className="w-full rounded-md border px-2 py-1.5 text-sm"
                value={remoteDataUrl}
                onChange={(e) => setRemoteDataUrl(e.target.value)}
                placeholder="RDF URL or SPARQL endpoint"
              />
              <select
                className="w-full rounded-md border px-2 py-1.5 text-sm"
                value={dataStrategy}
                onChange={(e) => setDataStrategy(e.target.value as SourceGuidedValues['dataStrategy'])}
              >
                <option value="file">file</option>
                <option value="sparql">sparql</option>
                <option value="cbd">cbd</option>
              </select>
              <select
                className="w-full rounded-md border px-2 py-1.5 text-sm"
                value={dataFormat}
                onChange={(e) => setDataFormat(e.target.value as SourceGuidedValues['dataFormat'])}
              >
                <option value="turtle">turtle</option>
                <option value="json-ld">json-ld</option>
                <option value="rdf-xml">rdf-xml</option>
                <option value="n-triples">n-triples</option>
              </select>

              {dataStrategy === 'sparql' ? (
                <>
                  <select
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                    value={sparqlSelectorMode}
                    onChange={(e) => setSparqlSelectorMode(e.target.value as SourceGuidedValues['sparqlSelectorMode'])}
                  >
                    <option value="subjectClass">subjectClass</option>
                    <option value="subject">subject</option>
                    <option value="subjectQuery">subjectQuery</option>
                  </select>
                  <input
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                    value={subjectClass}
                    onChange={(e) => setSubjectClass(e.target.value)}
                    placeholder="subjectClass"
                  />
                  <input
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                    value={subjectValue}
                    onChange={(e) => setSubjectValue(e.target.value)}
                    placeholder="subject"
                  />
                  <textarea
                    className="h-20 w-full rounded-md border p-2 font-mono text-xs"
                    value={subjectQuery}
                    onChange={(e) => setSubjectQuery(e.target.value)}
                    placeholder="subjectQuery"
                  />
                </>
              ) : null}

              {dataStrategy === 'cbd' ? (
                <>
                  <input
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                    value={subjectValue}
                    onChange={(e) => setSubjectValue(e.target.value)}
                    placeholder="subject"
                  />
                  <input
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                    type="number"
                    min={1}
                    value={cbdDepth}
                    onChange={(e) => setCbdDepth(e.target.value)}
                  />
                </>
              ) : null}

              <textarea
                className="h-24 w-full rounded-md border p-2 font-mono text-xs"
                value={rdfInput}
                onChange={(e) => setRdfInput(e.target.value)}
                placeholder="Inline RDF data"
              />
            </div>

            <div className="space-y-3 rounded-lg border bg-slate-50 p-3">
              <h3 className="font-semibold">RDF-Lens</h3>
              <input
                className="w-full rounded-md border px-2 py-1.5 text-sm"
                value={shapeClass}
                onChange={(e) => setShapeClass(e.target.value)}
                placeholder="shapeClass"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={multiple} onChange={(e) => setMultiple(e.target.checked)} />
                multiple
              </label>
              <textarea
                className="h-72 w-full rounded-md border p-2 font-mono text-xs"
                value={shaclInput}
                onChange={(e) => setShaclInput(e.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border bg-slate-50 p-3">
              <h3 className="font-semibold">Lens-Display Template</h3>
              <textarea
                className="h-80 w-full rounded-md border p-2 font-mono text-xs"
                value={templateInput}
                onChange={(e) => setTemplateInput(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={recalcPreviews}>
              Refresh TTL previews
            </button>
            <button className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white" onClick={runPipeline}>
              Run Playground
            </button>
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={exportJson}>
              Export JSON
            </button>
            <label className="rounded-md border px-3 py-1.5 text-sm">
              Import JSON
              <input
                className="hidden"
                type="file"
                accept="application/json"
                onChange={(e) => {
                  void onImportJson(e.target.files?.[0] ?? null);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={exportStandaloneHtml}>
              Export standalone HTML
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold">source-rdf TTL preview</p>
              <textarea className="h-40 w-full rounded-md border p-2 font-mono text-xs" readOnly value={sourceConfigPreview} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold">rdf-lens TTL preview</p>
              <textarea className="h-40 w-full rounded-md border p-2 font-mono text-xs" readOnly value={lensConfigPreview} />
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:fixed lg:right-4 lg:top-44 lg:w-[380px]">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">Chat and AI Step Agent</h2>
            <p className="text-xs text-slate-600">
              Autonomous mode: run source-rdf, rdf-lens, and lens-display in one chain with automatic retries and auto-apply.
            </p>
            <div className="mt-3 rounded-md border bg-slate-50 p-2 text-xs">
              <div className="font-semibold">{STEP_DETAILS[currentStep].title}</div>
              <div className="mt-1">{STEP_DETAILS[currentStep].does}</div>
              <div className="mt-1 text-slate-600">Output: {STEP_DETAILS[currentStep].returns}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                className={`rounded-md px-2 py-1 text-xs ${currentStep === 'source-rdf' ? 'bg-slate-900 text-white' : 'border'}`}
                onClick={() => setCurrentStep('source-rdf')}
              >
                source-rdf
              </button>
              <button
                className={`rounded-md px-2 py-1 text-xs ${currentStep === 'rdf-lens' ? 'bg-slate-900 text-white' : 'border'}`}
                onClick={() => setCurrentStep('rdf-lens')}
              >
                rdf-lens
              </button>
              <button
                className={`rounded-md px-2 py-1 text-xs ${currentStep === 'lens-display' ? 'bg-slate-900 text-white' : 'border'}`}
                onClick={() => setCurrentStep('lens-display')}
              >
                lens-display
              </button>
            </div>
            <textarea
              className="mt-3 h-24 w-full rounded-md border p-2 text-sm"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Write your overall goal for the autonomous run"
            />
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
                onClick={() => {
                  void runAutonomousPipeline();
                }}
                disabled={isBusy}
              >
                {isBusy ? 'Running...' : 'Run full autonomous pipeline'}
              </button>
            </div>

            <div className="mt-3 h-52 overflow-auto rounded-md border bg-slate-950 p-3 font-mono text-xs text-slate-100">
              {chat.length === 0 ? <div className="text-slate-400">No chat messages yet.</div> : null}
              {chat.map((msg, idx) => (
                <div key={`${msg.at}-${idx}`} className="mb-2">
                  <div className="text-slate-400">[{msg.at}] {msg.role} ({msg.step})</div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">Activity + Context meter</h2>
            <p className="text-xs text-slate-600">Token counts are estimated, not provider-verified exact usage.</p>
            <div className="mt-2 rounded-md border bg-slate-100 p-2 text-xs">
              <div>Current step: {currentStep}</div>
              <div>Model max context: {maxContext || 0}</div>
              <div>Estimated used: {estimatedUsageTokens}</div>
              <div>Estimated remaining: {estimatedRemaining}</div>
              <div>source-rdf status: {adapterStatus}</div>
              <div>rdf-lens status: {lensStatus}</div>
              <div>lens-display status: {displayStatus}</div>
            </div>
            <div className="mt-3 h-52 overflow-auto rounded-md border bg-slate-950 p-3 font-mono text-xs text-slate-100">
              {activity.length === 0 ? <div className="text-slate-400">No events yet.</div> : null}
              {activity.map((line, idx) => (
                <div key={`${line}-${idx}`} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold">Live Render</h2>
          <p className="text-xs text-slate-600">Real chain: source-rdf -&gt; rdf-lens -&gt; lens-display.</p>
          <div className="mt-3 min-h-40 rounded-md border bg-slate-50 p-3">
            {bundleError ? <p className="text-sm text-red-600">Failed to load hosted webcomponents bundle.</p> : null}
            {!bundleLoaded && !bundleError ? <p className="text-sm text-slate-500">Loading hosted bundle...</p> : null}
            {bundleLoaded && runtime ? (
              <lens-display ref={mountDisplayRef} key={`display-${runtime.key}`} template={runtime.templateUrl}>
                <rdf-lens ref={mountLensRef} key={`lens-${runtime.key}`} config={buildLensConfigRdf(shapeClass, multiple, runtime.shapeUrl)}>
                  <source-rdf
                    ref={mountSourceRef}
                    key={`source-${runtime.key}`}
                    config={buildSourceConfigRdf(sourceValues, runtime.dataUrl)}
                  ></source-rdf>
                </rdf-lens>
              </lens-display>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
