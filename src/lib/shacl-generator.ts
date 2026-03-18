/**
 * shacl-generator.ts
 *
 * Utility to analyze an RDF triplestore and automatically generate
 * SHACL shape definitions based on the discovered schema.
 *
 * Usage:
 *   import { generateShaclFromRdf } from '@/lib/shacl-generator';
 *
 *   const shaclTurtle = await generateShaclFromRdf(rdfText, 'text/turtle', {
 *     shapePrefix: 'ex',
 *     shapeNamespace: 'http://example.org/shapes#',
 *     includeCardinality: true,
 *     closed: false,
 *   });
 */

import type { Quad } from "@rdfjs/types";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

interface PropertyInfo {
  predicate: string;
  values: string[];
  datatypes: Set<string>;
  isObjectProperty: boolean;
  objectClasses: Set<string>;
  minCount: number;
  maxCount: number;
  instanceCounts: Map<string, number>;
}

interface Schema {
  classes: Map<string, Set<string>>;
  properties: Map<string, Map<string, PropertyInfo>>;
  instances: Map<string, Set<string>>;
  resourceTypes: Map<string, Set<string>>;
}

export interface ShaclGeneratorOptions {
  shapePrefix?: string;
  shapeNamespace?: string;
  includeCardinality?: boolean;
  closed?: boolean;
  minInstancesPerClass?: number;
  includeTimestamp?: boolean;
}

function analyzeSchema(quads: Quad[]): Schema {
  const schema: Schema = {
    classes: new Map(),
    properties: new Map(),
    instances: new Map(),
    resourceTypes: new Map(),
  };

  // First pass: find all typed resources
  for (const quad of quads) {
    if (quad.predicate.value === RDF_TYPE) {
      const subject = quad.subject.value;
      const type = quad.object.value;

      if (!schema.classes.has(type)) {
        schema.classes.set(type, new Set());
      }
      schema.classes.get(type)!.add(subject);

      if (!schema.instances.has(subject)) {
        schema.instances.set(subject, new Set());
      }
      schema.instances.get(subject)!.add(type);

      if (!schema.resourceTypes.has(subject)) {
        schema.resourceTypes.set(subject, new Set());
      }
      schema.resourceTypes.get(subject)!.add(type);
    }
  }

  // Second pass: analyze properties for each class
  for (const [className, instances] of schema.classes.entries()) {
    const classProps = new Map<string, PropertyInfo>();

    for (const instance of instances) {
      for (const quad of quads) {
        if (
          quad.subject.value === instance &&
          quad.predicate.value !== RDF_TYPE
        ) {
          const predicate = quad.predicate.value;

          if (!classProps.has(predicate)) {
            classProps.set(predicate, {
              predicate,
              values: [],
              datatypes: new Set(),
              isObjectProperty: false,
              objectClasses: new Set(),
              minCount: 0,
              maxCount: 0,
              instanceCounts: new Map(),
            });
          }

          const propInfo = classProps.get(predicate)!;
          propInfo.values.push(quad.object.value);

          if (!propInfo.instanceCounts.has(instance)) {
            propInfo.instanceCounts.set(instance, 0);
          }
          propInfo.instanceCounts.set(
            instance,
            propInfo.instanceCounts.get(instance)! + 1
          );

          if (
            quad.object.termType === "NamedNode" ||
            quad.object.termType === "BlankNode"
          ) {
            const objectTypes = schema.resourceTypes.get(quad.object.value);
            if (objectTypes && objectTypes.size > 0) {
              propInfo.isObjectProperty = true;
              objectTypes.forEach((t) => propInfo.objectClasses.add(t));
            }
          } else if (quad.object.termType === "Literal") {
            const datatype =
              (quad.object as { datatype?: { value: string } }).datatype
                ?.value ?? XSD_STRING;
            propInfo.datatypes.add(datatype);
          }
        }
      }
    }

    // Calculate cardinality after all instances
    for (const propInfo of classProps.values()) {
      const counts = Array.from(propInfo.instanceCounts.values());
      if (counts.length > 0) {
        propInfo.minCount = Math.min(...counts);
        propInfo.maxCount = Math.max(...counts);
      }
    }

    schema.properties.set(className, classProps);
  }

  return schema;
}

function uriToLocalName(uri: string): string {
  const match = uri.match(/[#/]([^#/]+)$/);
  if (match) {
    const name = match[1]
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/^[^a-zA-Z]+/, "");
    return name || "Shape";
  }
  return "Shape";
}

function getPrefixedName(
  uri: string,
  prefixes: Record<string, string>
): string {
  for (const [namespace, prefix] of Object.entries(prefixes)) {
    if (uri.startsWith(namespace)) {
      const localName = uri.substring(namespace.length);
      return `${prefix}:${localName}`;
    }
  }
  return `<${uri}>`;
}

function detectNamespaces(
  classes: Map<string, Set<string>>
): Record<string, string> {
  const namespaces = new Map<string, string>();
  const commonPrefixes: Record<string, string> = {
    "http://www.w3.org/ns/shacl#": "sh",
    "http://www.w3.org/2001/XMLSchema#": "xsd",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
    "http://www.w3.org/2000/01/rdf-schema#": "rdfs",
    "http://purl.org/dc/terms/": "dct",
    "http://xmlns.com/foaf/0.1/": "foaf",
    "http://www.w3.org/ns/dcat#": "dcat",
    "http://schema.org/": "schema",
    "http://www.opengis.net/ont/geosparql#": "geosparql",
  };

  for (const [ns, prefix] of Object.entries(commonPrefixes)) {
    namespaces.set(prefix, ns);
  }

  for (const classUri of classes.keys()) {
    const match = classUri.match(/^(.+[#/])[^#/]+$/);
    if (match) {
      const ns = match[1];
      if (!Array.from(namespaces.values()).includes(ns)) {
        const nsMatch = ns.match(/\/([^/]+)[/#]?$/);
        if (nsMatch) {
          const prefix = nsMatch[1].toLowerCase().substring(0, 8);
          namespaces.set(prefix, ns);
        }
      }
    }
  }

  const result: Record<string, string> = {};
  for (const [prefix, ns] of namespaces.entries()) {
    result[ns] = prefix;
  }
  return result;
}

function generatePropertyName(predicate: string): string {
  const match = predicate.match(/[#/]([^#/]+)$/);
  if (match) {
    return match[1].replace(/_/g, "").replace(/-/g, "");
  }
  return "property";
}

export function generateShaclShapes(
  quads: Quad[],
  options: ShaclGeneratorOptions = {}
): string {
  const {
    shapePrefix = "ex",
    shapeNamespace = "http://example.org/shapes#",
    includeCardinality = true,
    closed = false,
    minInstancesPerClass = 1,
    includeTimestamp = true,
  } = options;

  const schema = analyzeSchema(quads);
  const prefixes = detectNamespaces(schema.classes);
  prefixes[shapeNamespace] = shapePrefix;

  let turtle = "";
  turtle += "# Auto-generated SHACL shapes\n";
  if (includeTimestamp) {
    turtle += `# Generated on: ${new Date().toISOString()}\n`;
  }
  turtle += "\n";

  for (const [namespace, prefix] of Object.entries(prefixes)) {
    turtle += `@prefix ${prefix}: <${namespace}> .\n`;
  }
  turtle += "\n";

  for (const [className, instances] of schema.classes.entries()) {
    if (instances.size < minInstancesPerClass) {
      continue;
    }

    const classProps = schema.properties.get(className);
    if (!classProps || classProps.size === 0) {
      continue;
    }

    const shapeName = `${shapePrefix}:${uriToLocalName(className)}Shape`;

    turtle += `# ${"─".repeat(60)}\n`;
    turtle += `# Shape for ${getPrefixedName(className, prefixes)}\n`;
    turtle += `# Found ${instances.size} instance(s)\n`;
    turtle += `# ${"─".repeat(60)}\n\n`;

    turtle += `${shapeName}\n`;
    turtle += `    a sh:NodeShape ;\n`;
    turtle += `    sh:targetClass ${getPrefixedName(className, prefixes)} ;\n\n`;

    const propArray = Array.from(classProps.values());
    for (let i = 0; i < propArray.length; i++) {
      const prop = propArray[i];
      const isLast = i === propArray.length - 1;

      turtle += `    sh:property [\n`;
      turtle += `        sh:name "${generatePropertyName(prop.predicate)}" ;\n`;
      turtle += `        sh:path ${getPrefixedName(prop.predicate, prefixes)} ;\n`;

      if (prop.isObjectProperty && prop.objectClasses.size > 0) {
        const objectClass = Array.from(prop.objectClasses)[0];
        turtle += `        sh:class ${getPrefixedName(objectClass, prefixes)} ;\n`;
        const nestedShapeName = `${shapePrefix}:${uriToLocalName(objectClass)}Shape`;
        turtle += `        # sh:node ${nestedShapeName} ;\n`;
      } else if (prop.datatypes.size > 0) {
        const datatype = Array.from(prop.datatypes)[0];
        turtle += `        sh:datatype ${getPrefixedName(datatype, prefixes)} ;\n`;
      } else {
        turtle += `        sh:nodeKind sh:IRI ;\n`;
      }

      if (includeCardinality) {
        if (prop.minCount > 0) {
          turtle += `        sh:minCount ${prop.minCount} ;\n`;
        }
        if (prop.maxCount > 0 && prop.maxCount === prop.minCount) {
          turtle += `        sh:maxCount ${prop.maxCount} ;\n`;
        }
      }

      turtle += `    ]${isLast ? "" : " ;"}\n`;
      if (!isLast) turtle += "\n";
    }

    if (closed) {
      turtle += ` ;\n    sh:closed true .\n`;
    } else {
      turtle += ` .\n`;
    }

    turtle += "\n";
  }

  return turtle;
}

/**
 * Generate SHACL shapes from an RDF text string.
 * Parses the text with N3 and then runs the shape generator.
 */
export async function generateShaclFromRdf(
  rdfText: string,
  format = "text/turtle",
  options: ShaclGeneratorOptions = {}
): Promise<string> {
  const { Parser } = await import("n3");

  return new Promise((resolve, reject) => {
    const parser = new Parser({ format });
    const quads: Quad[] = [];

    parser.parse(rdfText, (error, quad) => {
      if (error) {
        reject(error);
      } else if (quad) {
        quads.push(quad as unknown as Quad);
      } else {
        resolve(generateShaclShapes(quads, options));
      }
    });
  });
}
