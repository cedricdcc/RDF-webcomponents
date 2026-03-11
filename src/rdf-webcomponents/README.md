# RDF Web Components

A powerful, framework-agnostic Web Component library for working with RDF data. Build semantic web applications with declarative HTML components that fetch, transform, and visualize linked data.

## 🚀 Quick Start

### Installation

```bash
npm install rdf-webcomponents
# or
bun add rdf-webcomponents
# or use CDN
```

### CDN Usage

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load individual components for smaller bundles -->
  <script type="module" src="https://cdn.example.com/rdf-adapter.js"></script>
  <script type="module" src="https://cdn.example.com/rdf-lens.js"></script>
  <script type="module" src="https://cdn.example.com/lens-display.js"></script>
  
  <!-- Or load all components at once -->
  <script type="module" src="https://cdn.example.com/rdf-webcomponents.js"></script>
</head>
<body>
  <lens-display template="person-card.html">
    <rdf-lens shape-file="shapes.ttl" shape-class="Person">
      <rdf-adapter url="https://example.org/data.ttl"></rdf-adapter>
    </rdf-lens>
  </lens-display>
</body>
</html>
```

## 📦 Components

### `<rdf-adapter>`

Fetches and parses RDF data from various sources.

#### Supported Formats

| Format | Extensions | MIME Type |
|--------|------------|-----------|
| Turtle | `.ttl` | `text/turtle` |
| N-Triples | `.nt` | `application/n-triples` |
| N-Quads | `.nq`, `.nquads` | `application/n-quads` |
| RDF/XML | `.rdf`, `.owl` | `application/rdf+xml` |
| JSON-LD | `.jsonld`, `.json` | `application/ld+json` |
| SPARQL | - | `application/sparql-results+json` |

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | URL to RDF data or SPARQL endpoint |
| `format` | string | auto | RDF format (auto-detected if not specified) |
| `strategy` | string | `file` | Data source strategy |
| `subject` | string | - | Subject URI for CBD or direct lookup |
| `subject-query` | string | - | SPARQL query to discover subjects |
| `subject-class` | string | - | Class URI to discover instances |
| `depth` | number | `2` | CBD traversal depth |
| `graph` | string | - | Named graph to query |
| `cache` | string | `memory` | Cache strategy (`none`, `memory`, `localStorage`, `indexedDB`) |
| `cache-ttl` | number | `3600` | Cache TTL in seconds |
| `shared` | boolean | `false` | Use shared global cache |
| `headers` | string | - | Custom HTTP headers (JSON string) |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `triplestore-ready` | `{ quadCount, url, fromCache, duration }` | Data loaded successfully |
| `triplestore-error` | `{ message, phase, error }` | Error loading data |
| `triplestore-loading` | `{ phase }` | Loading started |

#### Examples

**Static RDF File:**
```html
<rdf-adapter 
  url="https://example.org/data.ttl"
  format="turtle"
  cache="indexedDB"
  shared
></rdf-adapter>
```

**SPARQL Endpoint - All instances of a class:**
```html
<rdf-adapter 
  url="https://dbpedia.org/sparql"
  strategy="sparql"
  subject-class="dbo:Person"
></rdf-adapter>
```

**SPARQL Endpoint - CBD for a specific subject:**
```html
<rdf-adapter 
  url="https://dbpedia.org/sparql"
  strategy="cbd"
  subject="http://dbpedia.org/resource/Albert_Einstein"
  depth="3"
></rdf-adapter>
```

**SPARQL Endpoint - Custom subject query:**
```html
<rdf-adapter 
  url="https://query.wikidata.org/sparql"
  strategy="sparql"
  subject-query="SELECT ?s WHERE { ?s wdt:P31 wd:Q5 . ?s wdt:P27 wd:Q30 } LIMIT 100"
></rdf-adapter>
```

---

### `<rdf-lens>`

Extracts structured data from RDF using SHACL shapes.

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `shape-file` | string | - | URL to SHACL shapes file |
| `shape-class` | string | - | Target class URI to extract |
| `shapes` | string | - | Inline SHACL shapes (Turtle format) |
| `validate` | boolean | `false` | Validate against shapes |
| `strict` | boolean | `false` | Throw on validation errors |
| `multiple` | boolean | `false` | Extract all matching subjects |
| `subject` | string | - | Specific subject URI to extract |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `shape-processed` | `{ data, shapeClass, count, duration }` | Data extracted successfully |
| `shape-error` | `{ message, phase, error }` | Error extracting data |
| `shapes-loaded` | `{ count }` | Shapes loaded successfully |

#### SHACL Shape Example

```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
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
  ] .
```

#### Examples

**With external shape file:**
```html
<rdf-lens 
  shape-file="shapes.ttl"
  shape-class="Person"
  multiple
>
  <rdf-adapter url="data.ttl"></rdf-adapter>
</rdf-lens>
```

**With inline shapes:**
```html
<rdf-lens shape-class="Person">
  <script type="text/turtle">
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix ex: <http://example.org/> .
    
    ex:PersonShape a sh:NodeShape ;
      sh:targetClass ex:Person ;
      sh:property [
        sh:name "name" ;
        sh:path ex:name ;
        sh:datatype xsd:string ;
      ] .
  </script>
  <rdf-adapter url="data.ttl"></rdf-adapter>
</rdf-lens>
```

---

### `<lens-display>`

Renders extracted data using HTML templates.

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `template` | string | - | URL to template file |
| `mode` | string | `single` | Display mode (`single`, `list`, `grid`, `table`) |
| `theme` | string | - | Theme identifier |
| `class` | string | - | CSS classes to apply |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `render-complete` | `{ html, data, duration }` | Rendering completed |
| `render-error` | `{ message, phase, error }` | Error rendering |

#### Template Syntax

The template engine supports:

**Value Interpolation:**
```html
<div>
  <h2>${data.name}</h2>
  <p>Age: {{age}}</p>
</div>
```

**Conditionals:**
```html
<div>
  {{#email}}
  <a href="mailto:{{email}}">{{email}}</a>
  {{/email}}
  {{^email}}
  <span>No email</span>
  {{/email}}
</div>
```

**Loops:**
```html
<ul>
  {{#each friends}}
  <li class="friend">
    {{name}} ({{age}})
  </li>
  {{/each}}
</ul>
```

**Nested Properties:**
```html
<div>
  <span>{{address.city}}</span>
  <span>{{address.country.name}}</span>
</div>
```

**Unescaped HTML:**
```html
<div>
  {{{description}}}
</div>
```

#### Template File Example

```html
<!-- person-card.html -->
<article class="person-card">
  <header>
    <h2>{{name}}</h2>
    {{#age}}<span class="age">Age: {{age}}</span>{{/age}}
  </header>
  
  <dl class="details">
    {{#email}}
    <dt>Email</dt>
    <dd><a href="mailto:{{email}}">{{email}}</a></dd>
    {{/email}}
    
    {{#phone}}
    <dt>Phone</dt>
    <dd>{{phone}}</dd>
    {{/phone}}
  </dl>
  
  {{#friends}}
  <section class="friends">
    <h3>Friends ({{friends.length}})</h3>
    <ul>
      {{#each friends}}
      <li>{{name}}</li>
      {{/each}}
    </ul>
  </section>
  {{/friends}}
</article>
```

## 🏗 Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    <lens-display>                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Template Engine (lit-html inspired)                      │  │
│  │  - Value interpolation: ${data.field}, {{field}}          │  │
│  │  - Conditionals: {{#field}}...{{/field}}                  │  │
│  │  - Loops: {{#each items}}...{{/each}}                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ▲ data                                │
│                            │                                     │
│                    <rdf-lens>                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  SHACL Shape Processor (rdf-lens)                         │  │
│  │  - Extract shapes from SHACL definitions                  │  │
│  │  - Execute lenses to transform RDF → JS objects           │  │
│  │  - Handle nested objects and arrays                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ▲ quads                               │
│                            │                                     │
│                    <rdf-adapter>                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  RDF Processing Pipeline                                  │  │
│  │  - Fetch: HTTP, SPARQL endpoints                          │  │
│  │  - Parse: Turtle, N3, RDF/XML, JSON-LD                    │  │
│  │  - Cache: Memory, localStorage, IndexedDB                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Communication

Components communicate via **reactive properties** and **DOM events**:

```html
<lens-display>           ← receives .data from child
  <rdf-lens>             ← receives .quads from child
    <rdf-adapter>        ← emits 'triplestore-ready' event
    </rdf-adapter>
  </rdf-lens>            ← emits 'shape-processed' event
</lens-display>          ← emits 'render-complete' event
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cache Manager                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Per-Adapter    │  │  Shared Cache   │  │  Shape Cache    │  │
│  │  (LRU)          │  │  (LRU, larger)  │  │  (by URL)       │  │
│  │                 │  │                 │  │                 │  │
│  │  - TTL: 1hr     │  │  - TTL: 1hr     │  │  - TTL: 24hr    │  │
│  │  - Max: 1000    │  │  - Max: 2000    │  │  - Max: 100     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  Storage Backends:                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Memory         │  │  localStorage   │  │  IndexedDB      │  │
│  │  (fastest)      │  │  (5MB limit)    │  │  (large data)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 API Reference

### JavaScript API

```typescript
import { RdfAdapter, RdfLens, LensDisplay } from 'rdf-webcomponents';

// Get component reference
const adapter = document.querySelector('rdf-adapter') as RdfAdapter;

// Access properties
console.log(adapter.quads);      // SerializedQuad[]
console.log(adapter.quadCount);  // number
console.log(adapter.loading);    // boolean
console.log(adapter.error);      // string | null

// Methods
await adapter.reload();          // Reload data
await adapter.refresh();         // Clear cache and reload

// Set data programmatically
const lens = document.querySelector('rdf-lens') as RdfLens;
lens.setQuads(adapter.quads);

const display = document.querySelector('lens-display') as LensDisplay;
display.setData([{ name: 'John', age: 30 }]);
```

### Events

```typescript
// Listen for events
document.querySelector('rdf-adapter').addEventListener('triplestore-ready', (e) => {
  console.log('Loaded', e.detail.quadCount, 'quads');
  console.log('From cache:', e.detail.fromCache);
  console.log('Duration:', e.detail.duration, 'ms');
});

document.querySelector('rdf-lens').addEventListener('shape-processed', (e) => {
  console.log('Extracted', e.detail.count, 'items');
  console.log('Shape class:', e.detail.shapeClass);
  console.log('Data:', e.detail.data);
});

document.querySelector('lens-display').addEventListener('render-complete', (e) => {
  console.log('Rendered HTML:', e.detail.html);
});
```

### Error Handling

```html
<lens-display>
  <slot name="loading">
    <div class="custom-loading">Loading...</div>
  </slot>
  
  <slot name="error">
    <div class="custom-error">Error: ${error}</div>
  </slot>
  
  <rdf-lens>
    <rdf-adapter url="data.ttl"></rdf-adapter>
  </rdf-lens>
</lens-display>
```

## 🔧 Advanced Usage

### SPARQL Endpoint Integration

```html
<!-- Query DBpedia for all cities -->
<lens-display template="city-card.html">
  <rdf-lens shape-file="shapes.ttl" shape-class="dbo:City" multiple>
    <rdf-adapter 
      url="https://dbpedia.org/sparql"
      strategy="sparql"
      subject-class="dbo:City"
      cache="indexedDB"
      cache-ttl="86400"
    ></rdf-adapter>
  </rdf-lens>
</lens-display>
```

### Multiple Data Sources

```html
<!-- Combine data from multiple sources -->
<rdf-adapter id="source1" url="data1.ttl" shared></rdf-adapter>
<rdf-adapter id="source2" url="data2.ttl" shared></rdf-adapter>

<script>
  const combined = [...source1.quads, ...source2.quads];
  lens.setQuads(combined);
</script>
```

### Custom Parsers

```typescript
import { parseRdf, detectFormat } from 'rdf-webcomponents/core/worker/parsers';

// Parse custom RDF content
const content = await fetch('custom.rdf').then(r => r.text());
const format = detectFormat('custom.rdf', content);
const { quads, errors } = await parseRdf(content, format, 'http://example.org/');
```

## 🎨 Styling

### CSS Custom Properties

```css
lens-display {
  --rdf-loading-color: #666;
  --rdf-error-color: #c00;
  --rdf-error-bg: #fee;
}

.rdf-card {
  border-radius: 8px;
  background: var(--card-bg, #fff);
  box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.1));
}
```

### Theme Support

```html
<lens-display template="card.html" theme="dark">
  <rdf-lens shape-file="shapes.ttl">
    <rdf-adapter url="data.ttl"></rdf-adapter>
  </rdf-lens>
</lens-display>

<style>
  .rdf-theme-dark {
    --card-bg: #333;
    --card-shadow: 0 2px 4px rgba(0,0,0,0.5);
    color: #fff;
  }
</style>
```

## 📊 Performance

### Bundle Sizes (gzipped)

| Component | Size |
|-----------|------|
| `rdf-adapter.js` | ~15KB |
| `rdf-lens.js` | ~8KB |
| `lens-display.js` | ~6KB |
| `rdf-webcomponents.js` (all) | ~25KB |

### Optimization Tips

1. **Use appropriate caching:**
   ```html
   <rdf-adapter url="data.ttl" cache="indexedDB" shared>
   ```

2. **Load components separately:**
   ```html
   <script type="module" src="rdf-adapter.js"></script>
   <script type="module" src="rdf-lens.js"></script>
   <!-- Only load if needed -->
   <script type="module" src="lens-display.js"></script>
   ```

3. **Use `multiple` attribute wisely:**
   ```html
   <!-- Good: Limited results -->
   <rdf-lens shape-class="Person" multiple>
   
   <!-- Avoid: Unlimited extraction from large datasets -->
   <rdf-lens shape-class="Thing" multiple>
   ```

## 🧪 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 14+ |
| Edge | 80+ |

Features used:
- Web Components v1
- Custom Elements v1
- Shadow DOM v1
- ES2020+ (optional chaining, nullish coalescing)
- Fetch API
- IndexedDB (optional)

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## 📚 Resources

- [SHACL Specification](https://www.w3.org/TR/shacl/)
- [RDF 1.1 Concepts](https://www.w3.org/TR/rdf11-concepts/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [rdf-lens Library](https://github.com/ajuvercr/rdf-lens)
- [N3.js Library](https://github.com/rdfjs/N3.js)
- [Lit Documentation](https://lit.dev/)
