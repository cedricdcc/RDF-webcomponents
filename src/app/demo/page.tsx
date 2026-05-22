"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Layers,
  Table,
  Activity,
  Search,
  Copy,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code,
  Eye,
  FileText,
} from "lucide-react";

type RuntimeConfig = {
  dataUrl: string;
  shapeUrl: string;
  templateUrl: string;
  shapeClass: string;
  multiple: boolean;
  key: number;
};

type VisualBlock = {
  id: string;
  type: "property" | "conditional" | "html";
  name: string;
  label: string;
  content?: string;
};

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = rawBasePath
  ? rawBasePath.startsWith("/")
    ? rawBasePath
    : `/${rawBasePath}`
  : "";

const withBasePath = (path: string) => `${basePath}${path}`;
const WEB_COMPONENTS_VERSION = "20260311-1";

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
  <!-- Block: # each items -->
  {{#each items}}
  <article class="person-card">
    <!-- Block: name -->
    <h3>{{name}}</h3>
    
    <!-- Block: ? role -->
    {{#role}}<p><strong>Role:</strong> {{role}}</p>{{/role}}
    
    <!-- Block: ? email -->
    {{#email}}<p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>{{/email}}
    
    <!-- Block: ? age -->
    {{#age}}<p><strong>Age:</strong> {{age}}</p>{{/age}}
    
    <!-- Block: ? city -->
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
  const rdfContentRef = useRef<string>("");
  const rdfBlobUrlRef = useRef<string>("");
  const shaclContentRef = useRef<string>("");
  const shaclBlobUrlRef = useRef<string>("");
  const templateContentRef = useRef<string>("");
  const templateBlobUrlRef = useRef<string>("");
  
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [bundleError, setBundleError] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeConfig | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [adapterStatus, setAdapterStatus] = useState("idle");
  const [lensStatus, setLensStatus] = useState("idle");
  const [displayStatus, setDisplayStatus] = useState("idle");

  // Step Wizard States
  const [activeStep, setActiveStep] = useState(1);
  const [step1Tab, setStep1Tab] = useState<"data" | "console">("data");
  const [step2Tab, setStep2Tab] = useState<"visualizer" | "editor" | "console">("visualizer");
  const [step3Tab, setStep3Tab] = useState<"render" | "export" | "console">("render");
  const [copiedExport, setCopiedExport] = useState(false);

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
  const [targetClasses, setTargetClasses] = useState<string[]>(["http://example.org/Person"]);
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
  const [step3Mode, setStep3Mode] = useState<"visual" | "code">("visual");
  const [visualBlocks, setVisualBlocks] = useState<VisualBlock[]>([
    { id: "default-name", type: "property", name: "name", label: "Name" },
    { id: "default-role", type: "conditional", name: "role", label: "Role" },
    { id: "default-email", type: "conditional", name: "email", label: "Email" },
    { id: "default-age", type: "conditional", name: "age", label: "Age" },
    { id: "default-city", type: "conditional", name: "city", label: "City" }
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const generateVisualBlocksForClass = (classUri: string, properties: Record<string, any>): VisualBlock[] => {
    const propEntries = Object.entries(properties);
    
    // Find a title property if possible, e.g. name, label, title, heading, id
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
    
    const blocks: VisualBlock[] = [];
    
    // Add title block
    if (titlePropKey) {
      blocks.push({
        id: `block-${titlePropKey}-${Date.now()}-0`,
        type: 'property',
        name: titlePropKey,
        label: titlePropKey.charAt(0).toUpperCase() + titlePropKey.slice(1)
      });
    }
    
    // Add other properties as conditional blocks
    propEntries.forEach(([pred], index) => {
      const key = pred.split(/[#/]/).pop() || "";
      if (key !== titlePropKey) {
        blocks.push({
          id: `block-${key}-${Date.now()}-${index + 1}`,
          type: 'conditional',
          name: key,
          label: key.charAt(0).toUpperCase() + key.slice(1)
        });
      }
    });
    
    return blocks;
  };

  const compileVisualBlocksToHtml = (blocks: VisualBlock[]) => {
    let fieldsHtml = "";
    
    blocks.forEach(block => {
      if (block.type === 'property') {
        fieldsHtml += `    <!-- Block: ${block.name} -->\n`;
        fieldsHtml += `    <h3>{{${block.name}}}</h3>\n\n`;
      } else if (block.type === 'conditional') {
        fieldsHtml += `    <!-- Block: ? ${block.name} -->\n`;
        fieldsHtml += `    {{#${block.name}}}<p><strong>${block.label}:</strong> {{${block.name}}}</p>{{/${block.name}}}\n\n`;
      } else if (block.type === 'html') {
        fieldsHtml += `    <!-- Block: HTML -->\n`;
        fieldsHtml += `    ${block.content}\n\n`;
      }
    });
    
    return `<div class="generated-grid">
  <!-- Block: # each items -->
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
  };

  const addVisualBlock = (type: 'property' | 'conditional' | 'html', name: string) => {
    const newBlock: VisualBlock = {
      id: `block-${name}-${Date.now()}`,
      type,
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      content: type === 'html' ? '<p>Custom HTML</p>' : undefined
    };
    
    setVisualBlocks(prev => {
      const next = [...prev, newBlock];
      const compiled = compileVisualBlocksToHtml(next);
      setTemplateInput(compiled);
      runPipelineWithValues({ template: compiled });
      return next;
    });
  };

  const deleteVisualBlock = (id: string) => {
    setVisualBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      const compiled = compileVisualBlocksToHtml(next);
      setTemplateInput(compiled);
      runPipelineWithValues({ template: compiled });
      return next;
    });
  };

  const moveVisualBlock = (index: number, direction: 'up' | 'down') => {
    setVisualBlocks(prev => {
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      
      const compiled = compileVisualBlocksToHtml(next);
      setTemplateInput(compiled);
      runPipelineWithValues({ template: compiled });
      return next;
    });
  };

  const toggleBlockConditional = (id: string) => {
    setVisualBlocks(prev => {
      const next = prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            type: (b.type === 'property' ? 'conditional' : 'property') as any
          };
        }
        return b;
      });
      const compiled = compileVisualBlocksToHtml(next);
      setTemplateInput(compiled);
      runPipelineWithValues({ template: compiled });
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    setVisualBlocks(prev => {
      const next = [...prev];
      const draggedBlock = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, draggedBlock);

      const compiled = compileVisualBlocksToHtml(next);
      setTemplateInput(compiled);
      runPipelineWithValues({ template: compiled });
      return next;
    });

    setDraggedIndex(null);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const templateTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const urlsRef = useRef<string[]>([]);

  const toTurtleString = (value: string) =>
    `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;

  const toIriOrString = (value: string) => {
    const trimmed = value.trim();
    if (/^(https?|urn|blob):/i.test(trimmed)) {
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

  const buildLensConfigRdf = (shapeUrl: string, shapeClsParam?: string, multParam?: boolean) => {
    const finalShapeCls = shapeClsParam !== undefined ? shapeClsParam : shapeClass;
    const finalMult = multParam !== undefined ? multParam : multiple;
    const triples: string[] = [
      `lrdf:shapeFile ${toIriOrString(shapeUrl)}`,
      `lrdf:shapeClass ${toIriOrString(finalShapeCls)}`,
      `lrdf:multiple ${finalMult}`,
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
    if (rdfBlobUrlRef.current) {
      URL.revokeObjectURL(rdfBlobUrlRef.current);
      rdfBlobUrlRef.current = "";
    }
    if (shaclBlobUrlRef.current) {
      URL.revokeObjectURL(shaclBlobUrlRef.current);
      shaclBlobUrlRef.current = "";
    }
    if (templateBlobUrlRef.current) {
      URL.revokeObjectURL(templateBlobUrlRef.current);
      templateBlobUrlRef.current = "";
    }
  };

  const getRdfBlobUrl = (content: string) => {
    if (rdfContentRef.current === content && rdfBlobUrlRef.current) {
      return rdfBlobUrlRef.current;
    }
    if (rdfBlobUrlRef.current) {
      URL.revokeObjectURL(rdfBlobUrlRef.current);
    }
    rdfContentRef.current = content;
    rdfBlobUrlRef.current = URL.createObjectURL(new Blob([content], { type: "text/turtle;charset=utf-8" }));
    return rdfBlobUrlRef.current;
  };

  const getShaclBlobUrl = (content: string) => {
    if (shaclContentRef.current === content && shaclBlobUrlRef.current) {
      return shaclBlobUrlRef.current;
    }
    if (shaclBlobUrlRef.current) {
      URL.revokeObjectURL(shaclBlobUrlRef.current);
    }
    shaclContentRef.current = content;
    shaclBlobUrlRef.current = URL.createObjectURL(new Blob([content], { type: "text/turtle;charset=utf-8" }));
    return shaclBlobUrlRef.current;
  };

  const getTemplateBlobUrl = (content: string) => {
    if (templateContentRef.current === content && templateBlobUrlRef.current) {
      return templateBlobUrlRef.current;
    }
    if (templateBlobUrlRef.current) {
      URL.revokeObjectURL(templateBlobUrlRef.current);
    }
    templateContentRef.current = content;
    templateBlobUrlRef.current = URL.createObjectURL(new Blob([content], { type: "text/html;charset=utf-8" }));
    return templateBlobUrlRef.current;
  };

  const generateShaclForClasses = (classUris: string[], primaryClass: string, currentClassesData?: any) => {
    const dataObj = currentClassesData || analyzedClasses;
    const classes = classUris.length > 0 ? classUris : [primaryClass];
    const primaryLocalName = primaryClass.split(/[#/]/).pop() || "Shape";
    const shapeUri = `ex:${primaryLocalName}Shape`;
    
    let shacl = `@prefix sh: <http://www.w3.org/ns/shacl#> .\n`;
    shacl += `@prefix ex: <http://example.org/> .\n`;
    shacl += `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n`;
    shacl += `${shapeUri} a sh:NodeShape ;\n`;
    
    const targetClassStr = classes.map(clazz => {
      const isAbsolute = clazz.startsWith('http://') || clazz.startsWith('https://');
      return isAbsolute ? `<${clazz}>` : clazz;
    }).join(" , ");
    
    shacl += `  sh:targetClass ${targetClassStr} ;\n`;
    
    // Merge properties from all target classes
    const mergedProperties: Record<string, any> = {};
    classes.forEach(clazz => {
      const classData = dataObj[clazz];
      if (classData && classData.properties) {
        Object.entries(classData.properties).forEach(([pred, details]) => {
          mergedProperties[pred] = details;
        });
      }
    });
    
    const propEntries = Object.entries(mergedProperties);
    if (propEntries.length === 0) {
      shacl += `  sh:property [ ] .`;
    } else {
      shacl += `  sh:property `;
      const propBlocks = propEntries.map(([pred, details]: [string, any], index) => {
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
    
    // Find a title property if possible, e.g. name, label, title, heading, id
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
    
    fieldsHtml += `    <!-- Block: ${titlePropKey || "id"} -->\n`;
    fieldsHtml += `    <h3>{{${titlePropKey || "id"}}}</h3>\n\n`;
    
    otherProps.forEach(([pred]) => {
      const key = pred.split(/[#/]/).pop() || "";
      const formattedLabel = key.charAt(0).toUpperCase() + key.slice(1);
      fieldsHtml += `    <!-- Block: ? ${key} -->\n`;
      fieldsHtml += `    {{#${key}}}<p><strong>${formattedLabel}:</strong> {{${key}}}</p>{{/${key}}}\n\n`;
    });
    
    const template = `<div class="generated-grid">
  <!-- Block: # each items -->
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
          if (pred === typePredicate) return;

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
    
    const availableClasses = Object.keys(classesData);
    if (availableClasses.length > 0) {
      const firstTyped = availableClasses.find(c => c !== 'http://example.org/UntypedResource');
      const activeClass = firstTyped || availableClasses[0];
      setSelectedClass(activeClass);
      
      const currentShapeClassExists = availableClasses.includes(shapeClass);
      const isDefaultShacl = shaclInput === DEMO_SHAPES;
      
      if (!currentShapeClassExists || isDefaultShacl || shapeClass === "") {
        setShapeClass(activeClass);
        setTargetClasses([activeClass]);
        const classData = classesData[activeClass];
        if (classData && activeClass !== 'http://example.org/UntypedResource') {
          const shaclTemplate = generateShaclForClasses([activeClass], activeClass, classesData);
          setShaclInput(shaclTemplate);
          
          const newTemplate = generateTemplateForClass(activeClass, classData.properties);
          setTemplateInput(newTemplate);
          
          const defaultBlocks = generateVisualBlocksForClass(activeClass, classData.properties);
          setVisualBlocks(defaultBlocks);
          
          pushEvent(`Auto-applied class ${activeClass} to pipeline (fresh dataset or default config detected)`);

          // Auto-trigger live pipeline refresh immediately!
          runPipelineWithValues({
            shacl: shaclTemplate,
            template: newTemplate,
            shapeCls: activeClass
          });
        }
      } else {
        setTargetClasses([shapeClass]);
      }
    } else {
      setSelectedClass("");
    }
  };

  const runPipelineWithValues = (params: {
    rdf?: string;
    shacl?: string;
    template?: string;
    shapeCls?: string;
    mult?: boolean;
  } = {}) => {
    const finalRdf = params.rdf !== undefined ? params.rdf : rdfInput;
    const finalShacl = params.shacl !== undefined ? params.shacl : shaclInput;
    const finalTemplate = params.template !== undefined ? params.template : templateInput;
    const finalShapeCls = params.shapeCls !== undefined ? params.shapeCls : shapeClass;
    const finalMult = params.mult !== undefined ? params.mult : multiple;

    if (params.shapeCls !== undefined) {
      setShapeClass(params.shapeCls);
    }
    if (params.mult !== undefined) {
      setMultiple(params.mult);
    }

    const dataUrl = useRemoteData
      ? remoteDataUrl.trim()
      : getRdfBlobUrl(finalRdf);
    const shapeUrl = getShaclBlobUrl(finalShacl);
    const templateUrl = getTemplateBlobUrl(finalTemplate);

    setAdapterStatus("loading");
    setLensStatus("waiting");
    setDisplayStatus("waiting");
    
    setRuntime({
      dataUrl,
      shapeUrl,
      templateUrl,
      shapeClass: finalShapeCls,
      multiple: finalMult,
      key: Date.now()
    });
  };

  const applyClassToPipeline = (clazz: string) => {
    setSelectedClass(clazz);
    setShapeClass(clazz);
    setTargetClasses([clazz]);
    
    const classData = analyzedClasses[clazz];
    if (classData) {
      const shaclTemplate = generateShaclForClasses([clazz], clazz);
      setShaclInput(shaclTemplate);
      
      const newTemplate = generateTemplateForClass(clazz, classData.properties);
      setTemplateInput(newTemplate);
      
      const defaultBlocks = generateVisualBlocksForClass(clazz, classData.properties);
      setVisualBlocks(defaultBlocks);
      
      pushEvent(`Configured pipeline for class ${clazz}`);

      // Auto-trigger live pipeline refresh immediately!
      runPipelineWithValues({
        shacl: shaclTemplate,
        template: newTemplate,
        shapeCls: clazz
      });
    }
  };

  const handleTargetClassesChange = (updatedClasses: string[]) => {
    setTargetClasses(updatedClasses);
    
    const mergedProperties: Record<string, any> = {};
    updatedClasses.forEach(clazz => {
      const classData = analyzedClasses[clazz];
      if (classData && classData.properties) {
        Object.entries(classData.properties).forEach(([pred, details]) => {
          mergedProperties[pred] = details;
        });
      }
    });
    
    const shaclTemplate = generateShaclForClasses(updatedClasses, selectedClass);
    setShaclInput(shaclTemplate);
    
    const newTemplate = generateTemplateForClass(selectedClass, mergedProperties);
    setTemplateInput(newTemplate);
    
    const defaultBlocks = generateVisualBlocksForClass(selectedClass, mergedProperties);
    setVisualBlocks(defaultBlocks);
    
    pushEvent(`Updated target classes: [${updatedClasses.map(c => c.split(/[#/]/).pop()).join(", ")}]`);

    // Auto-trigger live pipeline refresh immediately!
    runPipelineWithValues({
      shacl: shaclTemplate,
      template: newTemplate
    });
  };

  const runPipeline = () => {
    runPipelineWithValues();
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
    setTargetClasses(["http://example.org/Person"]);
    setMultiple(true);
    setShaclInput(DEMO_SHAPES);
    setTemplateInput(DEMO_TEMPLATE);
    setQuads([]);
    setAnalyzedClasses({});
    setSelectedClass("");
    setActiveStep(1);
    setVisualBlocks([
      { id: "default-name", type: "property", name: "name", label: "Name" },
      { id: "default-role", type: "conditional", name: "role", label: "Role" },
      { id: "default-email", type: "conditional", name: "email", label: "Email" },
      { id: "default-age", type: "conditional", name: "age", label: "Age" },
      { id: "default-city", type: "conditional", name: "city", label: "City" }
    ]);
  };

  const insertBlockAtCursor = (blockText: string) => {
    const textarea = templateTextareaRef.current;
    if (!textarea) {
      setTemplateInput(prev => prev + "\n" + blockText);
      return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    const nextText = currentText.substring(0, start) + blockText + currentText.substring(end);
    setTemplateInput(nextText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + blockText.length, start + blockText.length);
    }, 50);
  };

  const handleExportStandaloneHtml = () => {
    const hostOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const bundleSrc = `${hostOrigin}${withBasePath("/rdf-webcomponents.js")}?v=${WEB_COMPONENTS_VERSION}`;
    
    const dataUrlStr = useRemoteData
      ? (remoteDataUrl.trim() || "https://example.org/data.ttl")
      : `data:text/turtle;charset=utf-8,${encodeURIComponent(rdfInput)}`;
      
    const shapeUrlStr = `data:text/turtle;charset=utf-8,${encodeURIComponent(shaclInput)}`;
    const templateUrlStr = `data:text/html;charset=utf-8,${encodeURIComponent(templateInput)}`;
    
    const sourceConfigStr = buildSourceConfigRdf(dataUrlStr);
    const lensConfigStr = buildLensConfigRdf(shapeUrlStr, shapeClass, multiple);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RDF Web Components - Exported Live Render</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <script type="module" src="${bundleSrc}"></script>
  
  <style>
    :root {
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: 'Fira Code', monospace;
    }
    
    body {
      font-family: var(--font-sans);
      margin: 0;
      padding: 2.5rem 1.5rem;
      background-color: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    header {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    h1 {
      margin: 0;
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #0f172a;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 0.95rem;
      color: #64748b;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      margin-top: 0.75rem;
      border: 1px solid #c7d2fe;
    }
    
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
      transition: box-shadow 0.3s ease;
    }
    
    .card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
      font-size: 0.85rem;
      color: #475569;
      background: #f1f5f9;
      border-radius: 0.75rem;
      padding: 1rem;
      border: 1px solid #e2e8f0;
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .meta-label {
      font-weight: 600;
      color: #64748b;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .meta-value {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>RDF Live Render</h1>
      <p class="subtitle">Standalone client-side execution of RDF Web Components pipeline.</p>
      <div class="badge">
        <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        Fully Standalone
      </div>
    </header>
    
    <div class="card">
      <lens-display template="${templateUrlStr}">
        <rdf-lens config='${lensConfigStr.replace(/'/g, "\\'")}' >
          <source-rdf config='${sourceConfigStr.replace(/'/g, "\\'")}'></source-rdf>
        </rdf-lens>
      </lens-display>
    </div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Primary Class</span>
        <span class="meta-value">${shapeClass}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Extraction Mode</span>
        <span class="meta-value">${multiple ? "Multiple" : "Single"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Data Strategy</span>
        <span class="meta-value">${dataStrategy}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && window.customElements) {
      const checkRegistered = () => {
        const isDefined =
          window.customElements.get("source-rdf") &&
          window.customElements.get("rdf-lens") &&
          window.customElements.get("lens-display");
        if (isDefined) {
          setBundleLoaded(true);
        }
      };

      checkRegistered();

      Promise.all([
        window.customElements.whenDefined("source-rdf"),
        window.customElements.whenDefined("rdf-lens"),
        window.customElements.whenDefined("lens-display")
      ]).then(() => {
        setBundleLoaded(true);
      }).catch(() => {});
    }

    return () => revokeAllUrls();
  }, []);

  useEffect(() => {
    if (!mounted || !bundleLoaded || runtime) {
      return;
    }
    runPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, bundleLoaded, runtime]);

  // Bubble-based event listening at the parent wrapper level
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onAdapterReady = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAdapterStatus("ready");
      pushEvent("source-rdf: triplestore-ready", detail);
      
      const sourceElement = container.querySelector("source-rdf") as any;
      if (sourceElement) {
        const loadedQuads = sourceElement.quads || [];
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

    container.addEventListener("triplestore-ready", onAdapterReady);
    container.addEventListener("triplestore-loading", onAdapterLoading);
    container.addEventListener("triplestore-error", onAdapterError);
    container.addEventListener("shapes-loaded", onShapesLoaded);
    container.addEventListener("shape-processed", onShapeProcessed);
    container.addEventListener("shape-error", onShapeError);
    container.addEventListener("render-complete", onRenderComplete);
    container.addEventListener("render-error", onRenderError);

    return () => {
      container.removeEventListener("triplestore-ready", onAdapterReady);
      container.removeEventListener("triplestore-loading", onAdapterLoading);
      container.removeEventListener("triplestore-error", onAdapterError);
      container.removeEventListener("shapes-loaded", onShapesLoaded);
      container.removeEventListener("shape-processed", onShapeProcessed);
      container.removeEventListener("shape-error", onShapeError);
      container.removeEventListener("render-complete", onRenderComplete);
      container.removeEventListener("render-error", onRenderError);
    };
  }, [mounted, runtime]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Script
        type="module"
        src={bundleUrl}
        strategy="afterInteractive"
        onLoad={() => setBundleLoaded(true)}
        onError={() => setBundleError(true)}
      />

      <div className="container mx-auto px-4 py-8 space-y-6" ref={containerRef}>
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
            <div>
              <Link href="/" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-1 group">
                <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to docs
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent">
                RDF Web Components Playground
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Walk through our 3-step interactive pipeline to design, validate, and preview your semantic web components live.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 bg-white shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                onClick={loadDemoDefaults}
              >
                Reset to Demo Content
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <nav aria-label="Progress" className="py-2">
            <ol role="list" className="flex items-center justify-between w-full max-w-4xl mx-auto">
              {[
                { id: 1, name: "1. Source RDF", desc: "Load & parse RDF graphs" },
                { id: 2, name: "2. RDF Lens", desc: "Select classes & SHACL shape" },
                { id: 3, name: "3. Lens Display", desc: "Design template & live render" }
              ].map((step, stepIdx) => {
                const isCompleted = activeStep > step.id;
                const isActive = activeStep === step.id;
                return (
                  <li key={step.name} className={`relative ${stepIdx !== 2 ? 'pr-8 sm:pr-20 flex-1' : ''}`}>
                    {stepIdx !== 2 && (
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className={`h-0.5 w-full transition-colors duration-300 ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeStep === 1 && step.id > 1) {
                          runPipeline();
                        }
                        setActiveStep(step.id);
                      }}
                      className="group relative flex items-start text-left focus:outline-none cursor-pointer"
                      disabled={!bundleLoaded}
                    >
                      <span className="flex items-center">
                        <span className={`relative flex h-8 w-8 flex-none items-center justify-center rounded-full transition-all duration-300 border-2 ${
                          isCompleted
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : isActive
                            ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                        }`}>
                          {isCompleted ? (
                            <Check className="h-4 w-4 stroke-[3]" />
                          ) : (
                            <span className="text-xs font-bold font-mono">{step.id}</span>
                          )}
                        </span>
                        <span className="ml-3 hidden md:block">
                          <span className={`text-sm font-semibold tracking-wide transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-800'}`}>{step.name}</span>
                          <span className="text-[10px] text-slate-500 block">{step.desc}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </header>

        {bundleError ? (
          <section className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            Failed to load <code>rdf-webcomponents.js</code>. Rebuild with <code>bun run build:webcomponents</code> and refresh.
          </section>
        ) : !bundleLoaded ? (
          <section className="rounded-xl border bg-white p-6 text-center text-sm text-slate-500">
            <div className="animate-pulse flex items-center justify-center gap-2">
              <div className="h-4 w-4 rounded-full bg-slate-300 animate-bounce"></div>
              Loading web component bundle...
            </div>
          </section>
        ) : null}

        {bundleLoaded && (
          <div className="space-y-6">
            {/* STEP 1: source-rdf */}
            <div className={activeStep === 1 ? "" : "hidden"}>
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column - Settings */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b pb-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-800">1. source-rdf Settings</h2>
                        <span className="text-[10px] text-slate-400">Configure your RDF data retrieval strategy</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium select-none cursor-pointer py-1.5 px-2 bg-slate-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={useRemoteData}
                        className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 h-4 w-4"
                        onChange={(e) => setUseRemoteData(e.target.checked)}
                      />
                      Use remote URL instead of inline RDF
                    </label>

                    {useRemoteData ? (
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-semibold text-slate-600">RDF URL or SPARQL endpoint</span>
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900"
                          value={remoteDataUrl}
                          onChange={(e) => setRemoteDataUrl(e.target.value)}
                        />
                      </label>
                    ) : (
                      <label className="block space-y-1.5 text-xs flex-1">
                        <span className="font-semibold text-slate-600">RDF input (Turtle / N3 Format)</span>
                        <textarea
                          className="h-[240px] w-full rounded-lg border border-slate-200 p-3 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
                          value={rdfInput}
                          onChange={(e) => setRdfInput(e.target.value)}
                        />
                      </label>
                    )}

                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex gap-2 text-[10px] border-b pb-2">
                        <button
                          type="button"
                          className={`rounded px-2.5 py-1 font-semibold transition-all cursor-pointer ${sourceCardTab === "guided" ? "bg-slate-900 text-white shadow-sm" : "border bg-white text-slate-600"}`}
                          onClick={() => setSourceCardTab("guided")}
                        >
                          Guided Inputs
                        </button>
                        <button
                          type="button"
                          className={`rounded px-2.5 py-1 font-semibold transition-all cursor-pointer ${sourceCardTab === "ttl" ? "bg-slate-900 text-white shadow-sm" : "border bg-white text-slate-600"}`}
                          onClick={() => setSourceCardTab("ttl")}
                        >
                          Generated TTL Config
                        </button>
                      </div>

                      {sourceCardTab === "guided" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block space-y-1 text-xs">
                            <span className="font-semibold text-slate-600">srdf:strategy</span>
                            <select
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 bg-white cursor-pointer"
                              value={dataStrategy}
                              onChange={(e) => setDataStrategy(e.target.value)}
                            >
                              <option value="file">file</option>
                              <option value="sparql">sparql</option>
                              <option value="cbd">cbd</option>
                            </select>
                          </label>

                          <label className="block space-y-1 text-xs">
                            <span className="font-semibold text-slate-600">srdf:format</span>
                            <select
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 bg-white cursor-pointer"
                              value={dataFormat}
                              onChange={(e) => setDataFormat(e.target.value)}
                            >
                              <option value="turtle">turtle</option>
                              <option value="json-ld">json-ld</option>
                              <option value="rdf-xml">rdf-xml</option>
                              <option value="n-triples">n-triples</option>
                            </select>
                          </label>

                          {dataStrategy === "sparql" && (
                            <div className="col-span-2 space-y-2 border-t pt-2 mt-1">
                              <label className="block space-y-1 text-xs">
                                <span className="font-semibold text-slate-600">sparql selector mode</span>
                                <select
                                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 bg-white"
                                  value={sparqlSelectorMode}
                                  onChange={(e) => setSparqlSelectorMode(e.target.value as any)}
                                >
                                  <option value="subjectClass">subjectClass</option>
                                  <option value="subject">subject</option>
                                  <option value="subjectQuery">subjectQuery</option>
                                </select>
                              </label>

                              {sparqlSelectorMode === "subjectClass" && (
                                <label className="block space-y-1 text-xs">
                                  <span className="font-semibold text-slate-600">subjectClass (URI)</span>
                                  <input
                                    className="w-full rounded-lg border px-2 py-1.5 font-mono text-[10px]"
                                    placeholder="http://example.org/Person"
                                    value={subjectClass}
                                    onChange={(e) => setSubjectClass(e.target.value)}
                                  />
                                </label>
                              )}

                              {sparqlSelectorMode === "subject" && (
                                <label className="block space-y-1 text-xs">
                                  <span className="font-semibold text-slate-600">subject (URI)</span>
                                  <input
                                    className="w-full rounded-lg border px-2 py-1.5 font-mono text-[10px]"
                                    placeholder="http://example.org/Alice"
                                    value={subjectValue}
                                    onChange={(e) => setSubjectValue(e.target.value)}
                                  />
                                </label>
                              )}

                              {sparqlSelectorMode === "subjectQuery" && (
                                <label className="block space-y-1 text-xs">
                                  <span className="font-semibold text-slate-600">subjectQuery (SPARQL)</span>
                                  <textarea
                                    className="h-20 w-full rounded-lg border p-2 font-mono text-[10px]"
                                    placeholder="CONSTRUCT { ?s ?p ?o } WHERE { ?s a <http://example.org/Person> . ?s ?p ?o } LIMIT 20"
                                    value={subjectQuery}
                                    onChange={(e) => setSubjectQuery(e.target.value)}
                                  />
                                </label>
                              )}
                            </div>
                          )}

                          {dataStrategy === "cbd" && (
                            <div className="col-span-2 space-y-2 border-t pt-2 mt-1 grid grid-cols-2 gap-3">
                              <label className="block space-y-1 text-xs">
                                <span className="font-semibold text-slate-600">subject (URI)</span>
                                <input
                                  className="w-full rounded-lg border px-2 py-1.5 font-mono text-[10px]"
                                  placeholder="http://example.org/Alice"
                                  value={subjectValue}
                                  onChange={(e) => setSubjectValue(e.target.value)}
                                />
                              </label>
                              <label className="block space-y-1 text-xs">
                                <span className="font-semibold text-slate-600">depth (levels)</span>
                                <input
                                  className="w-full rounded-lg border px-2 py-1.5"
                                  type="number"
                                  min={1}
                                  value={cbdDepth}
                                  onChange={(e) => setCbdDepth(e.target.value)}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-400">
                            Turtle representation parsed by <code>source-rdf</code> to initialize state.
                          </p>
                          <textarea
                            readOnly
                            className="h-36 w-full rounded-lg border bg-slate-50 p-2 font-mono text-[10px] text-slate-500"
                            value={sourceConfigRdf}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PROMINENT FETCH & ANALYZE BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      runPipelineWithValues();
                      setStep1Tab("data");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-xs font-bold text-white transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                    Fetch & Analyze RDF Data
                  </button>
                  
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Component State:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                      adapterStatus === "ready" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      adapterStatus === "loading" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      adapterStatus === "error" ? "bg-red-50 text-red-700 border border-red-100" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {adapterStatus}
                    </span>
                  </div>
                </div>

                {/* Right Column - Workspace Tabs */}
                <div className="lg:col-span-7 flex flex-col min-h-[500px]">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step1Tab === "data" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep1Tab("data")}
                        >
                          <Table className="h-3.5 w-3.5" />
                          Data & Detected Classes ({quads.length})
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step1Tab === "console" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep1Tab("console")}
                        >
                          <Activity className="h-3.5 w-3.5" />
                          Event Console ({events.length})
                        </button>
                      </div>
                    </div>

                    {step1Tab === "data" ? (
                      <div className="space-y-4 flex-1 flex flex-col">
                        {quads.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-slate-50 flex-1">
                            <Table className="h-12 w-12 text-slate-300 mb-2 stroke-[1.5]" />
                            <p className="text-sm font-bold text-slate-600">No Triples Loaded Yet</p>
                            <p className="text-xs text-slate-400 max-w-xs mt-1">Press "Fetch & Analyze RDF Data" to extract the triples structure.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 flex-1 flex flex-col">
                            {/* Detected Classes Stats */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-600">Detected RDF Classes</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(analyzedClasses).map(([clazz, data]) => {
                                  const label = clazz === "http://example.org/UntypedResource" ? "Untyped Resources" : (clazz.split(/[#/]/).pop() || clazz);
                                  return (
                                    <div key={clazz} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                                      <span className="font-semibold text-slate-700 truncate mr-2" title={clazz}>{label}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold font-mono">{data.instanceCount} instances</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Triples List */}
                            <div className="space-y-2 flex-1 flex flex-col mt-2">
                              <span className="text-xs font-semibold text-slate-600">Triples Store</span>
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search triples by subject, predicate or object..."
                                  className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                                  value={triplesSearch}
                                  onChange={(e) => { setTriplesSearch(e.target.value); setTriplesPage(1); }}
                                />
                              </div>

                              {(() => {
                                const filtered = quads.filter(q => {
                                  const term = triplesSearch.toLowerCase();
                                  if (!term) return true;
                                  return q.subject.value.toLowerCase().includes(term) ||
                                         q.predicate.value.toLowerCase().includes(term) ||
                                         q.object.value.toLowerCase().includes(term);
                                });

                                const pageSize = 6;
                                const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                                const pagedTriples = filtered.slice((triplesPage - 1) * pageSize, triplesPage * pageSize);

                                return (
                                  <div className="flex-1 flex flex-col justify-between">
                                    <div className="overflow-auto border rounded-lg max-h-[220px]">
                                      <table className="w-full text-left text-xs divide-y divide-slate-100">
                                        <thead className="bg-slate-50 sticky top-0 font-semibold text-[10px] text-slate-500">
                                          <tr>
                                            <th className="p-2">Subject</th>
                                            <th className="p-2">Predicate</th>
                                            <th className="p-2">Object</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                                          {pagedTriples.length > 0 ? (
                                            pagedTriples.map((q, idx) => (
                                              <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="p-2 max-w-[120px] truncate text-slate-700" title={q.subject.value}>
                                                  {q.subject.termType === 'BlankNode' ? `_:${q.subject.value}` : q.subject.value}
                                                </td>
                                                <td className="p-2 max-w-[120px] truncate text-slate-500" title={q.predicate.value}>
                                                  {q.predicate.value.split(/[#/]/).pop() || q.predicate.value}
                                                </td>
                                                <td className="p-2 max-w-[180px] truncate text-slate-900" title={q.object.value}>
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

                                    {totalPages > 1 && (
                                      <div className="flex items-center justify-between pt-3 border-t mt-3 text-[10px]">
                                        <span className="text-slate-500">
                                          Showing {(triplesPage - 1) * pageSize + 1} - {Math.min(triplesPage * pageSize, filtered.length)} of {filtered.length} triples
                                        </span>
                                        <div className="flex gap-1">
                                          <button
                                            type="button"
                                            className="rounded border p-1 disabled:opacity-40 hover:bg-slate-50 bg-white cursor-pointer"
                                            onClick={() => setTriplesPage(prev => Math.max(prev - 1, 1))}
                                            disabled={triplesPage === 1}
                                          >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                          </button>
                                          <span className="font-semibold px-2 py-1 select-none font-mono">
                                            {triplesPage} / {totalPages}
                                          </span>
                                          <button
                                            type="button"
                                            className="rounded border p-1 disabled:opacity-40 hover:bg-slate-50 bg-white cursor-pointer"
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
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <p className="text-[10px] text-slate-500 mb-2">
                          Debug stream specifically tuned for <code>source-rdf</code> ingestion events and warnings.
                        </p>
                        <div className="flex-1 min-h-[280px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-[10px] text-slate-200">
                          {events.length > 0 ? (
                            events.map((line, index) => (
                              <div key={`${line}-${index}`} className="whitespace-pre-wrap break-words leading-relaxed">
                                {line}
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 italic">No events generated yet. Run the pipeline.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: rdf-lens */}
            <div className={activeStep === 2 ? "" : "hidden"}>
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column - Settings */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b pb-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-800">2. rdf-lens Settings</h2>
                        <span className="text-[10px] text-slate-400">Class mapping, target classes, and extraction modes</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Primary Class Selector */}
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-semibold text-slate-600 flex items-center justify-between">
                          <span>Select Primary Detected Class</span>
                          <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
                            <Sparkles className="h-3 w-3 animate-pulse" /> Live Updates Output!
                          </span>
                        </span>
                        <select
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 bg-white font-mono text-[11px] cursor-pointer"
                          value={selectedClass}
                          onChange={(e) => {
                            applyClassToPipeline(e.target.value);
                          }}
                        >
                          {Object.keys(analyzedClasses).length === 0 ? (
                            <option value="">No classes found. Run Step 1 first.</option>
                          ) : (
                            Object.entries(analyzedClasses).map(([clazz, data]) => {
                              const label = clazz === "http://example.org/UntypedResource" ? "Untyped Resources" : (clazz.split(/[#/]/).pop() || clazz);
                              return (
                                <option key={clazz} value={clazz}>
                                  {label} ({data.instanceCount} instances)
                                </option>
                              );
                            })
                          )}
                        </select>
                      </label>

                      {/* Multiple Target Classes Checklist */}
                      <div className="space-y-2 border-t pt-4">
                        <span className="text-xs font-semibold text-slate-700 block">sh:targetClass Selection</span>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Select which classes inside your RDF graph this shape targets. If you select multiple classes, the generated SHACL shape will target all of them and merge their properties.
                        </p>
                        <div className="space-y-1.5 max-h-36 overflow-auto border rounded-lg p-2.5 bg-slate-50/50 mt-1">
                          {Object.keys(analyzedClasses).length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2 text-center">No classes detected yet (Run Step 1 first)</p>
                          ) : (
                            Object.keys(analyzedClasses).map(clazz => {
                              const isChecked = targetClasses.includes(clazz);
                              const label = clazz === "http://example.org/UntypedResource" ? "Untyped Resources" : (clazz.split(/[#/]/).pop() || clazz);
                              return (
                                <label key={clazz} className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer py-1 px-1.5 rounded hover:bg-slate-100/50 select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 h-3.5 w-3.5"
                                    onChange={(e) => {
                                      const nextTargets = e.target.checked
                                        ? [...targetClasses, clazz]
                                        : targetClasses.filter(t => t !== clazz);
                                      handleTargetClassesChange(nextTargets);
                                    }}
                                  />
                                  <span className="truncate flex-1" title={clazz}>{label}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold font-mono">({analyzedClasses[clazz].instanceCount})</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-4">
                        <label className="block space-y-1 text-xs">
                          <span className="font-semibold text-slate-600">lrdf:shapeClass</span>
                          <input
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-[10px]"
                            value={shapeClass}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setShapeClass(newVal);
                              runPipelineWithValues({ shapeCls: newVal });
                            }}
                          />
                        </label>

                        <label className="flex flex-col justify-end pb-1 text-xs">
                          <span className="font-semibold text-slate-600 mb-1">lrdf:multiple</span>
                          <div className="flex items-center gap-1.5 py-1">
                            <input
                              type="checkbox"
                              id="multipleMode"
                              checked={multiple}
                              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                              onChange={(e) => {
                                const newVal = e.target.checked;
                                setMultiple(newVal);
                                runPipelineWithValues({ mult: newVal });
                              }}
                            />
                            <label htmlFor="multipleMode" className="text-slate-600 select-none cursor-pointer">multiple extraction</label>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Component State:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                      lensStatus === "ready" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      lensStatus === "loading" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      lensStatus === "error" ? "bg-red-50 text-red-700 border border-red-100" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {lensStatus}
                    </span>
                  </div>
                </div>

                {/* Right Column - Workspace Tabs */}
                <div className="lg:col-span-7 flex flex-col min-h-[500px]">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step2Tab === "visualizer" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep2Tab("visualizer")}
                        >
                          <Layers className="h-3.5 w-3.5" />
                          Schema Visualizer
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step2Tab === "editor" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep2Tab("editor")}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          SHACL Shape File
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step2Tab === "console" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep2Tab("console")}
                        >
                          <Activity className="h-3.5 w-3.5" />
                          Event Console ({events.length})
                        </button>
                      </div>
                    </div>

                    {step2Tab === "visualizer" ? (
                      <div className="space-y-4 flex-1 flex flex-col">
                        {Object.keys(analyzedClasses).length === 0 ? (
                          <div className="flex flex-col items-center justify-center flex-1 py-16 text-center border-2 border-dashed rounded-xl bg-slate-50">
                            <Layers className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-sm font-semibold text-slate-600">No Data Analyzed Yet</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">Run Step 1 or load an RDF dataset to inspect its structure and build custom schemas.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 flex items-center justify-between mb-3">
                                <span>
                                  Mapped <strong>{selectedClass && analyzedClasses[selectedClass] ? Object.keys(analyzedClasses[selectedClass].properties).length : 0}</strong> property/properties
                                </span>
                                <span className="font-mono text-[9px] text-slate-400 truncate max-w-[200px]" title={selectedClass}>
                                  {selectedClass}
                                </span>
                              </div>

                              <div className="overflow-auto border rounded-lg max-h-[260px]">
                                <table className="w-full text-left text-xs divide-y divide-slate-100">
                                  <thead className="bg-slate-50 sticky top-0 font-semibold text-[10px] text-slate-500">
                                    <tr>
                                      <th className="p-2">Property</th>
                                      <th className="p-2">Type</th>
                                      <th className="p-2">Example Value</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {selectedClass && analyzedClasses[selectedClass] && Object.values(analyzedClasses[selectedClass].properties).map((prop: any) => {
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
                                                    className={`text-[8px] rounded px-1.5 py-0.5 font-mono ${isXsd ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600 border'}`}
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
                            </div>

                            {selectedClass && selectedClass !== "http://example.org/UntypedResource" && (
                              <div className="flex items-center gap-2 pt-3 border-t">
                                <button
                                  type="button"
                                  onClick={() => {
                                    runPipeline();
                                  }}
                                  className="flex-grow flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-all active:scale-[0.98] cursor-pointer"
                                >
                                  <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                  Apply Shapes and Run Pipeline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const shaclTemplate = generateShaclForClasses(targetClasses, selectedClass);
                                    navigator.clipboard.writeText(shaclTemplate);
                                    setCopiedShacl(true);
                                    setTimeout(() => setCopiedShacl(false), 2000);
                                    pushEvent("Generated and copied SHACL template to clipboard");
                                  }}
                                  className="flex-none rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-2 text-slate-700 transition-all cursor-pointer"
                                  title="Copy SHACL code to clipboard"
                                >
                                  {copiedShacl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : step2Tab === "editor" ? (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <label className="block space-y-1.5 text-xs flex-1 flex flex-col">
                          <span className="font-semibold text-slate-600">SHACL File Content (Turtle Format)</span>
                          <textarea
                            className="w-full flex-1 min-h-[250px] rounded-lg border border-slate-200 p-3 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
                            value={shaclInput}
                            onChange={(e) => setShaclInput(e.target.value)}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">
                          Edit the SHACL node shapes manually. Click Run Pipeline to compile updates.
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <p className="text-[10px] text-slate-500 mb-2">
                          Debug log stream specifically tuned for <code>rdf-lens</code> validation and shape-matching events.
                        </p>
                        <div className="flex-1 min-h-[280px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-[10px] text-slate-200">
                          {events.length > 0 ? (
                            events.map((line, index) => (
                              <div key={`${line}-${index}`} className="whitespace-pre-wrap break-words leading-relaxed">
                                {line}
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 italic">No events generated yet. Run the pipeline.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: lens-display */}
            <div className={activeStep === 3 ? "" : "hidden"}>
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column - Settings */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 border-b pb-3 mb-1">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Code className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-800">3. lens-display Settings</h2>
                        <span className="text-[10px] text-slate-400">Create HTML template syntax utilizing Mustache tags</span>
                      </div>
                    </div>

                    {/* Visual/Code Toggle tabs */}
                    <div className="flex border rounded-lg p-1 bg-slate-50 gap-1 mb-2">
                      <button
                        type="button"
                        onClick={() => setStep3Mode("visual")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${step3Mode === "visual" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-600 hover:text-slate-800"}`}
                      >
                        Visual Designer
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep3Mode("code")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${step3Mode === "code" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-600 hover:text-slate-800"}`}
                      >
                        HTML Code Editor
                      </button>
                    </div>

                    {step3Mode === "visual" ? (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        {/* Drag and Drop Canvas */}
                        <div className="border-2 border-dashed border-amber-300 bg-amber-50/20 rounded-xl p-4 flex-1 flex flex-col space-y-3 min-h-[300px]">
                          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                              Loop: <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[10px] font-mono">{"{{#each items}}"}</code>
                            </span>
                            <span className="text-[10px] text-amber-600 font-mono">{"{{/each}}"}</span>
                          </div>

                          <div className="space-y-3 flex-1 overflow-auto max-h-[340px] pr-1 py-1">
                            {visualBlocks.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-lg bg-white">
                                <p className="text-xs font-semibold text-slate-400">Empty Canvas</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Click properties below to add blocks!</p>
                              </div>
                            ) : (
                              visualBlocks.map((block, idx) => (
                                <div
                                  key={block.id}
                                  draggable={true}
                                  onDragStart={() => handleDragStart(idx)}
                                  onDragOver={(e) => handleDragOver(e, idx)}
                                  onDragEnter={(e) => handleDragEnter(e, idx)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, idx)}
                                  className={`flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm transition-all group cursor-move ${
                                    block.type === "property"
                                      ? "border-blue-200 hover:border-blue-300 bg-gradient-to-r from-blue-50/15 to-white"
                                      : block.type === "conditional"
                                      ? "border-emerald-200 hover:border-emerald-300 bg-gradient-to-r from-emerald-50/15 to-white"
                                      : "border-purple-200 hover:border-purple-300 bg-gradient-to-r from-purple-50/15 to-white"
                                  } ${draggedIndex === idx ? "opacity-30 scale-[0.98]" : ""} ${
                                    dragOverIndex === idx ? "border-indigo-400 bg-indigo-50/30 scale-[1.01]" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {/* Grip Handle */}
                                    <div className="grid grid-cols-2 gap-0.5 w-2.5 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                      <div className="h-0.75 w-0.75 rounded-full bg-slate-500"></div>
                                      <div className="h-0.75 w-0.75 rounded-full bg-slate-500"></div>
                                      <div className="h-0.75 w-0.75 rounded-full bg-slate-500"></div>
                                      <div className="h-0.75 w-0.75 rounded-full bg-slate-500"></div>
                                      <div className="h-0.75 w-0.75 rounded-full bg-slate-500"></div>
                                      <div className="h-0.75 w-0.75 rounded-full bg-slate-500"></div>
                                    </div>

                                    {/* Render block EXACTLY like Mustache Template syntax blocks */}
                                    <div className="flex-1 min-w-0">
                                      {block.type === "property" ? (
                                        <div className="space-y-0.5 text-left font-mono">
                                          <div className="text-[9px] text-blue-500 font-semibold select-none">&lt;!-- Block: {block.name} --&gt;</div>
                                          <div className="text-[10px] text-slate-800 font-bold truncate">
                                            &lt;h3&gt;{"{"}{"{"}{block.name}{"}"}{"}"}&lt;/h3&gt;
                                          </div>
                                        </div>
                                      ) : block.type === "conditional" ? (
                                        <div className="space-y-0.5 text-left font-mono">
                                          <div className="text-[9px] text-emerald-600 font-semibold select-none">&lt;!-- Block: ? {block.name} --&gt;</div>
                                          <div className="text-[9px] text-slate-700 leading-tight space-y-0.5">
                                            <div>{"{"}{"{"}#{block.name}{"}"}{"}"}</div>
                                            <div className="pl-3 text-slate-500">&lt;p&gt;&lt;strong&gt;{block.label}:&lt;/strong&gt; {"{"}{"{"}{block.name}{"}"}{"}"}&lt;/p&gt;</div>
                                            <div>{"{"}{"{"}/{block.name}{"}"}{"}"}</div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-0.5 text-left font-mono">
                                          <div className="text-[9px] text-purple-500 font-semibold select-none">&lt;!-- Block: HTML --&gt;</div>
                                          <div className="text-[10px] text-slate-600 truncate">{block.content}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    {/* Toggle type button */}
                                    {block.type !== "html" && (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleBlockConditional(block.id); }}
                                        className="rounded hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors text-[9px] font-semibold cursor-pointer border bg-slate-50 px-1.5 py-0.5 shadow-sm"
                                        title={block.type === "property" ? "Change to Conditional block" : "Change to Simple Property block"}
                                      >
                                        {block.type === "property" ? "? Cond" : "🗲 Prop"}
                                      </button>
                                    )}
                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); deleteVisualBlock(block.id); }}
                                      className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer text-[10px] font-bold"
                                      title="Delete block"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Property insertiondeck */}
                        <div className="space-y-2 border-t pt-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Detected Class Fields (Click to append block)</span>
                          <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            {selectedClass && analyzedClasses[selectedClass] ? (
                              Object.keys(analyzedClasses[selectedClass].properties).map(pred => {
                                const propName = pred.split(/[#/]/).pop() || pred;
                                const exists = visualBlocks.some(b => b.name === propName);
                                return (
                                  <button
                                    key={pred}
                                    type="button"
                                    onClick={() => addVisualBlock("conditional", propName)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all hover:scale-[1.02] cursor-pointer border ${
                                      exists
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 shadow-sm"
                                    }`}
                                    disabled={exists}
                                    title={exists ? `Already added to canvas` : `Add ${propName} to template`}
                                  >
                                    <span>+ {propName}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No class properties found. (Run Step 1)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        {/* INTERACTIVE TEMPLATE BUILDING BLOCKS */}
                        <div className="space-y-2 pb-2">
                          <span className="text-xs font-bold text-slate-700 block">Template Building Blocks</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Click any block below to plug it directly into your HTML template at the cursor position.
                          </p>
                          
                          <div className="space-y-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            {/* Property Blocks */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Extracted Properties</span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedClass && analyzedClasses[selectedClass] ? (
                                  Object.keys(analyzedClasses[selectedClass].properties).map(pred => {
                                    const propName = pred.split(/[#/]/).pop() || pred;
                                    return (
                                      <button
                                        key={pred}
                                        type="button"
                                        onClick={() => insertBlockAtCursor(`{{${propName}}}`)}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono text-[10px] font-medium transition-all hover:scale-[1.02] cursor-pointer"
                                        title={`Insert {{${propName}}}`}
                                      >
                                        <span>{propName}</span>
                                        <span className="text-[9px] text-blue-400 font-bold font-sans">+</span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No class properties found.</span>
                                )}
                              </div>
                            </div>

                            {/* Conditional Section Blocks */}
                            <div className="space-y-1 border-t pt-2.5">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Conditional Sections</span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedClass && analyzedClasses[selectedClass] ? (
                                  Object.keys(analyzedClasses[selectedClass].properties).map(pred => {
                                    const propName = pred.split(/[#/]/).pop() || pred;
                                    return (
                                      <button
                                        key={`cond-${pred}`}
                                        type="button"
                                        onClick={() => insertBlockAtCursor(`{{#${propName}}}\n  <p><strong>${propName.charAt(0).toUpperCase() + propName.slice(1)}:</strong> {{${propName}}}</p>\n{{/${propName}}}`)}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-medium transition-all hover:scale-[1.02] cursor-pointer"
                                        title={`Insert conditional section for ${propName}`}
                                      >
                                        <span>? {propName}</span>
                                        <span className="text-[9px] text-emerald-400 font-bold font-sans">+</span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No class properties found.</span>
                                )}
                              </div>
                            </div>

                            {/* Control Structure Loops */}
                            <div className="space-y-1 border-t pt-2.5">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Control Loops</span>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => insertBlockAtCursor(`{{#each items}}\n  <article class="generated-card">\n    <!-- Plug property blocks here, e.g. {{name}} -->\n  </article>\n{{/each}}`)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-mono text-[10px] font-medium transition-all hover:scale-[1.02] cursor-pointer"
                                  title="Insert each item loop structure"
                                >
                                  <span># each items</span>
                                  <span className="text-[9px] text-amber-400 font-bold font-sans">+</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <label className="block space-y-1.5 text-xs flex-1 flex flex-col border-t pt-3">
                          <span className="font-semibold text-slate-600">HTML Code Template (HTML + mustache blocks)</span>
                          <textarea
                            ref={templateTextareaRef}
                            className="w-full flex-1 min-h-[220px] rounded-lg border border-slate-200 p-3 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed font-semibold leading-relaxed"
                            value={templateInput}
                            onChange={(e) => setTemplateInput(e.target.value)}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Component State:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                      displayStatus === "ready" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      displayStatus === "loading" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      displayStatus === "error" ? "bg-red-50 text-red-700 border border-red-100" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {displayStatus}
                    </span>
                  </div>
                </div>

                {/* Right Column - Workspace Tabs */}
                <div className="lg:col-span-7 flex flex-col min-h-[500px]">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step3Tab === "render" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep3Tab("render")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Live Render Output
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step3Tab === "export" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep3Tab("export")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Export Standalone HTML
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${step3Tab === "console" ? "bg-slate-900 text-white shadow-sm" : "border text-slate-600 hover:bg-slate-50"}`}
                          onClick={() => setStep3Tab("console")}
                        >
                          <Activity className="h-3.5 w-3.5" />
                          Event Console ({events.length})
                        </button>
                      </div>
                    </div>

                    {step3Tab === "render" ? (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-600 block mb-2">Live Web Components Chain Output</span>
                          <div className="min-h-[220px] rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                            {mounted && bundleLoaded && runtime ? (
                              <lens-display
                                key="playground-display"
                                template={runtime.templateUrl}
                              >
                                <rdf-lens
                                  key="playground-lens"
                                  config={buildLensConfigRdf(runtime.shapeUrl, runtime.shapeClass, runtime.multiple)}
                                >
                                  <source-rdf
                                    key="playground-source"
                                    config={buildSourceConfigRdf(runtime.dataUrl)}
                                  ></source-rdf>
                                </rdf-lens>
                              </lens-display>
                            ) : (
                              <p className="text-sm text-slate-400 italic text-center py-16">Waiting for pipeline parameters to execute...</p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <button
                            type="button"
                            onClick={runPipeline}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                            Run Live Render Pipeline
                          </button>
                        </div>
                      </div>
                    ) : step3Tab === "export" ? (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-xs font-semibold text-slate-600 block">Single-File Standalone HTML Exporter</span>
                          <p className="text-xs text-slate-500 leading-normal">
                            Generate a fully self-contained HTML page containing your templates, SHACL shapes, inline RDF data, and styles. All transient parameters are compiled into highly compatible, standard offline-ready <code>data:</code> URLs, ensuring immediate cross-browser rendering.
                          </p>
                          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-[11px] font-mono text-slate-600 space-y-1 overflow-x-auto max-h-56">
                            <div>&lt;!DOCTYPE html&gt;</div>
                            <div>&lt;html lang="en"&gt;</div>
                            <div className="text-indigo-600">&lt;script type="module" src="https://.../rdf-webcomponents.js"&gt;&lt;/script&gt;</div>
                            <div className="text-emerald-600">&lt;lens-display template="data:text/html;..."&gt;</div>
                            <div className="text-amber-600">  &lt;rdf-lens config="... lrdf:shapeFile 'data:text/turtle;...' "&gt;</div>
                            <div className="text-blue-600">    &lt;source-rdf config="... srdf:url 'data:text/turtle;...' "&gt;&lt;/source-rdf&gt;</div>
                            <div>  &lt;/rdf-lens&gt;</div>
                            <div>&lt;/lens-display&gt;</div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => {
                              const exportHtml = handleExportStandaloneHtml();
                              navigator.clipboard.writeText(exportHtml);
                              setCopiedExport(true);
                              setTimeout(() => setCopiedExport(false), 2000);
                              pushEvent("Compiled and copied standalone HTML export to clipboard");
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                          >
                            {copiedExport ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            {copiedExport ? "Copied Standalone Export to Clipboard!" : "Copy Standalone HTML to Clipboard"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <p className="text-[10px] text-slate-500 mb-2">
                          Debug log stream specifically tuned for <code>lens-display</code> interpolation and template compilation events.
                        </p>
                        <div className="flex-1 min-h-[280px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-[10px] text-slate-200">
                          {events.length > 0 ? (
                            events.map((line, index) => (
                              <div key={`${line}-${index}`} className="whitespace-pre-wrap break-words leading-relaxed">
                                {line}
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 italic">No events generated yet. Run the pipeline.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t mt-8 bg-white px-6 py-4 rounded-xl border border-slate-100 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
                disabled={activeStep === 1}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Step
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={runPipeline}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-indigo-100 text-indigo-600" />
                  Run Pipeline
                </button>
                
                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === 1) {
                        runPipeline();
                      }
                      setActiveStep(prev => Math.min(prev + 1, 3));
                    }}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all active:scale-[0.98] select-none cursor-pointer"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const exportHtml = handleExportStandaloneHtml();
                      navigator.clipboard.writeText(exportHtml);
                      setCopiedExport(true);
                      setTimeout(() => setCopiedExport(false), 2000);
                      pushEvent("Compiled and copied standalone HTML export to clipboard");
                    }}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all active:scale-[0.98] select-none cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    {copiedExport ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
                    {copiedExport ? "Copied!" : "Copy Standalone HTML"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
