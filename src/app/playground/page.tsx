'use client';

import Link from 'next/link';
import { ArrowLeft, Layers, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const basePath = rawBasePath
  ? rawBasePath.startsWith('/')
    ? rawBasePath
    : `/${rawBasePath}`
  : '';

const withBasePath = (path: string) => `${basePath}${path}`;
const BUNDLE = withBasePath('/rdf-webcomponents.js');

const personTemplate = `<div class="demo-grid">
  {{#each items}}
  <article class="person-card">
    <h3>{{name}}</h3>
    {{#role}}<p><strong>Role:</strong> {{role}}</p>{{/role}}
    {{#email}}<p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>{{/email}}
    {{#age}}<p><strong>Age:</strong> {{age}}</p>{{/age}}
    {{#city}}<p><strong>City:</strong> {{city}}</p>{{/city}}
  </article>
  {{/each}}
</div>`;

const bookTemplate = `<div class="book-list">
  {{#each items}}
  <article class="book-card">
    <h3>{{title}}</h3>
    {{#author}}<p class="author">by {{author}}</p>{{/author}}
    <div class="meta">
      {{#year}}<span class="tag">📅 {{year}}</span>{{/year}}
      {{#genre}}<span class="tag">📚 {{genre}}</span>{{/genre}}
      {{#isbn}}<span class="tag isbn">ISBN: {{isbn}}</span>{{/isbn}}
    </div>
  </article>
  {{/each}}
</div>`;

const orgTemplate = `<div class="org-list">
  {{#each items}}
  <article class="org-card">
    <div class="org-header">
      {{#shortName}}<span class="short-name">{{shortName}}</span>{{/shortName}}
      <h3>{{name}}</h3>
    </div>
    <div class="org-meta">
      {{#founded}}<span class="tag">🏛 Est. {{founded}}</span>{{/founded}}
      {{#city}}<span class="tag">📍 {{city}}</span>{{/city}}
      {{#focus}}<span class="tag focus">🎯 {{focus}}</span>{{/focus}}
    </div>
    {{#url}}<a class="org-link" href="{{url}}" target="_blank">Visit website →</a>{{/url}}
  </article>
  {{/each}}
</div>`;

const inlineBadgeTemplate = `<div style="display:flex;flex-wrap:wrap;gap:8px">{{#each items}}<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9999px;background:#e0f2fe;color:#0c4a6e;font-size:0.8rem;font-weight:500">{{#role}}<span title="{{role}}" style="width:8px;height:8px;border-radius:50%;background:#0ea5e9;display:inline-block"></span>{{/role}}{{name}}{{#city}}<span style="opacity:.6;font-size:.7rem">({{city}})</span>{{/city}}</span>{{/each}}</div>`;

const lensPersonConfig = `{
  "shapeFile": "/demo/shapes.ttl",
  "shapeClass": "http://example.org/Person",
  "multiple": true
}`;

const lensBookConfig = `{
  "shapeFile": "/demo/book-shapes.ttl",
  "shapeClass": "http://example.org/Book",
  "multiple": true
}`;

const lensOrgConfig = `{
  "shapeFile": "/demo/org-shapes.ttl",
  "shapeClass": "http://example.org/Organisation",
  "multiple": true
}`;

// ---------------------------------------------------------------------------
// Shared iframe boilerplate
// ---------------------------------------------------------------------------
const iframeBase = (title: string, bodyHtml: string, extraHead = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script type="module" src="${BUNDLE}"></script>
  ${extraHead}
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;padding:16px;font-family:ui-sans-serif,system-ui,sans-serif;background:#f8fafc;color:#0f172a;font-size:.875rem}
    a{color:#0e7490;font-weight:500}
    .label{font-weight:600;margin-bottom:.4rem;font-size:.8rem;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
    .links{display:flex;flex-direction:column;gap:.5rem;margin:.5rem 0 1rem}
    .note{font-size:.75rem;color:#94a3b8;margin:.4rem 0 0}
    .rdf-org-links a{color:#059669;font-weight:500}
    .rdf-book-links a{color:#7c3aed;font-weight:500}
    pre{background:#1e293b;color:#e2e8f0;border-radius:.5rem;padding:.75rem;font-size:.75rem;overflow-x:auto;margin:0}
    hr{border:none;border-top:1px solid #e2e8f0;margin:1rem 0}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

// ---------------------------------------------------------------------------
// Example 1 — CSS attribute selector  (`css` key)
// ---------------------------------------------------------------------------
const ex1Html = iframeBase(
  'CSS Selector Matching',
  `<link-orchestration config-src="${withBasePath('/demo/config-css-selector.json')}">
  <p class="label">Rule: <code>css: "a[href$='.ttl'][data-type='book']"</code></p>
  <p>Only links with <code>data-type="book"</code> AND ending in <code>.ttl</code> are matched. The plain people link below is <em>not</em> matched.</p>

  <div class="links">
    <a href="${withBasePath('/demo/books.ttl')}" data-type="book">📚 Books dataset (matched — has data-type="book")</a>
    <a href="${withBasePath('/demo/people.ttl')}">👤 People dataset (skipped — no data-type="book")</a>
  </div>
  <p class="note">Try adding <code>data-type="book"</code> to the second link to see it get orchestrated too.</p>
</link-orchestration>`,
);

// ---------------------------------------------------------------------------
// Example 2 — URL glob pattern  (`urlPattern` key)
// ---------------------------------------------------------------------------
const ex2Html = iframeBase(
  'URL Glob Pattern',
  `<link-orchestration config-src="${withBasePath('/demo/config-url-glob.json')}"></link-orchestration>

<p class="label">Rule: <code>urlPattern: "**/demo/people.ttl"</code></p>
<p>Matches any URL whose path ends with <code>/demo/people.ttl</code>. Glob <code>**</code> matches any prefix.</p>

<div class="links">
  <a href="${withBasePath('/demo/people.ttl')}">👤 /demo/people.ttl (matched)</a>
  <a href="${withBasePath('/demo/books.ttl')}">📚 /demo/books.ttl (skipped — different filename)</a>
  <a href="${withBasePath('/demo/organisations.ttl')}">🏢 /demo/organisations.ttl (skipped)</a>
</div>`,
);

// ---------------------------------------------------------------------------
// Example 3 — URL regex pattern  (`urlRegex` key)
// ---------------------------------------------------------------------------
const ex3Html = iframeBase(
  'URL Regex Pattern',
  `<link-orchestration config-src="${withBasePath('/demo/config-url-regex.json')}"></link-orchestration>

<p class="label">Rule: <code>urlRegex: "\\.(ttl|n3|nt)(\\?.*)?$"</code></p>
<p>Matches URLs ending in <code>.ttl</code>, <code>.n3</code>, or <code>.nt</code> (with optional query string). Useful for matching any RDF serialisation.</p>

<div class="links">
  <a href="${withBasePath('/demo/people.ttl')}">👤 people.ttl (matched)</a>
  <a href="${withBasePath('/demo/people.ttl')}?version=2">👤 people.ttl?version=2 (matched — query string allowed)</a>
  <a href="${withBasePath('/demo/person-card.html')}">📄 person-card.html (skipped — .html not in regex)</a>
</div>`,
);

// ---------------------------------------------------------------------------
// Example 4 — Parent CSS scope  (`parentCss` key)
// ---------------------------------------------------------------------------
const ex4Html = iframeBase(
  'Parent CSS Scope',
  `<link-orchestration config-src="${withBasePath('/demo/config-parent-css.json')}"></link-orchestration>

<p class="label">Rule: <code>parentCss: ".rdf-org-links"</code></p>
<p>Only links that are inside an element matching <code>.rdf-org-links</code> are orchestrated, regardless of other attributes.</p>

<div class="rdf-org-links">
  <div class="label" style="margin-top:.5rem">Inside .rdf-org-links</div>
  <div class="links">
    <a href="${withBasePath('/demo/organisations.ttl')}">🏢 organisations.ttl (matched — inside .rdf-org-links)</a>
  </div>
</div>

<hr />

<div>
  <div class="label">Outside .rdf-org-links</div>
  <div class="links">
    <a href="${withBasePath('/demo/organisations.ttl')}">🏢 organisations.ttl (skipped — not inside .rdf-org-links)</a>
  </div>
</div>`,
);

// ---------------------------------------------------------------------------
// Example 5 — Path prefix matching  (`pathStartsWith` key)
// ---------------------------------------------------------------------------
const ex5Html = iframeBase(
  'Path Prefix Matching',
  `<link-orchestration config-src="${withBasePath('/demo/config-multi-rule.json')}"></link-orchestration>

<p class="label">Rules: <code>pathStartsWith</code> per dataset type (books / people / orgs)</p>
<p>Three rules each check if the URL path starts with a different prefix. First-match-wins ensures each link type gets its own display template.</p>

<div class="label" style="margin-top:.5rem">Link set — each routed to the correct rule:</div>
<div class="links">
  <a href="${withBasePath('/demo/books.ttl')}">📚 /demo/books.ttl → book-card template</a>
  <a href="${withBasePath('/demo/people.ttl')}">👤 /demo/people.ttl → person-card template</a>
  <a href="${withBasePath('/demo/organisations.ttl')}">🏢 /demo/organisations.ttl → org-card template</a>
</div>`,
);

// ---------------------------------------------------------------------------
// Example 6 — XPath selector  (`xpath` key)
// ---------------------------------------------------------------------------
const ex6Html = iframeBase(
  'XPath Selector',
  `<link-orchestration>
  <script type="application/json">
  {
    "debounceMs": 150,
    "rules": [
      {
        "id": "xpath-first-link",
        "match": {
          "xpath": "//ol[@id='dataset-list']//li[position()<=2]//a",
          "contentType": "text"
        },
        "adapter": { "strategy": "file", "cache": "none" },
        "lens": {
          "shapeFile": "${withBasePath('/demo/shapes.ttl')}",
          "shapeClass": "http://example.org/Person",
          "multiple": true
        },
        "display": {
          "template": "${withBasePath('/demo/person-card.html')}",
          "mode": "grid"
        },
        "decorators": { "enabled": true, "icons": { "loading": "⏳", "ready": "🔍", "error": "⚠" } }
      }
    ]
  }
  </script>

  <p class="label">Rule: <code>xpath: "//ol[@id='dataset-list']//li[position()&lt;=2]//a"</code></p>
  <p>XPath selects only links in the first two list items. The third link is identical but not selected.</p>

  <ol id="dataset-list">
    <li><a href="${withBasePath('/demo/people.ttl')}">people.ttl — item 1 (matched by XPath)</a></li>
    <li><a href="${withBasePath('/demo/people.ttl')}">people.ttl — item 2 (matched by XPath)</a></li>
    <li><a href="${withBasePath('/demo/people.ttl')}">people.ttl — item 3 (skipped — position > 2)</a></li>
  </ol>
</link-orchestration>`,
);

// ---------------------------------------------------------------------------
// Example 7 — Inline template  (templateInline + decorators)
// ---------------------------------------------------------------------------
const ex7Html = iframeBase(
  'Inline Template & Custom Decorators',
  `<link-orchestration config-src="${withBasePath('/demo/config-inline-template.json')}"></link-orchestration>

<p class="label">Rule: inline Handlebars template in config + custom decorator icons</p>
<p>The display template is embedded directly in the config JSON as a single-line HTML string — no extra file fetch needed. Custom decorator emojis replace the defaults.</p>

<div class="links">
  <a href="${withBasePath('/demo/people.ttl')}">👤 people.ttl → inline badge template</a>
</div>`,
);

// ---------------------------------------------------------------------------
// Example 8 — Multi-rule priority / first-match-wins + disabled rule
// ---------------------------------------------------------------------------
const ex8Html = iframeBase(
  'Multi-rule Priority & Disabled Rules',
  `<link-orchestration>
  <script type="application/json">
  {
    "debounceMs": 150,
    "rules": [
      {
        "id": "priority-books-exact",
        "match": {
          "css": "a[href$='books.ttl']",
          "contentType": "text"
        },
        "adapter": { "strategy": "file", "cache": "none" },
        "lens": {
          "shapeFile": "${withBasePath('/demo/book-shapes.ttl')}",
          "shapeClass": "http://example.org/Book",
          "multiple": true
        },
        "display": { "template": "${withBasePath('/demo/book-card.html')}", "mode": "grid" },
        "decorators": { "enabled": true, "icons": { "loading": "⏳", "ready": "📚", "error": "⚠" } }
      },
      {
        "id": "priority-orgs-exact",
        "match": {
          "css": "a[href$='organisations.ttl']",
          "contentType": "text"
        },
        "adapter": { "strategy": "file", "cache": "none" },
        "lens": {
          "shapeFile": "${withBasePath('/demo/org-shapes.ttl')}",
          "shapeClass": "http://example.org/Organisation",
          "multiple": true
        },
        "display": { "template": "${withBasePath('/demo/org-card.html')}", "mode": "grid" },
        "decorators": { "enabled": true, "icons": { "loading": "⏳", "ready": "🏢", "error": "⚠" } }
      },
      {
        "id": "priority-catchall-disabled",
        "enabled": false,
        "match": { "css": "a[href$='.ttl']", "contentType": "text" },
        "adapter": { "strategy": "file" },
        "lens": { "shapeFile": "${withBasePath('/demo/shapes.ttl')}", "shapeClass": "http://example.org/Person", "multiple": true },
        "display": { "template": "${withBasePath('/demo/person-card.html')}", "mode": "grid" }
      }
    ]
  }
  </script>

  <p class="label">Three rules — books rule, orgs rule, and a catch-all that is <code>enabled: false</code></p>
  <p>Each link is matched against rules in order. The disabled catch-all never fires even though its CSS would match all <code>.ttl</code> links.</p>

  <div class="links">
    <a href="${withBasePath('/demo/books.ttl')}">📚 books.ttl → matched by rule 1 (book card)</a>
    <a href="${withBasePath('/demo/organisations.ttl')}">🏢 organisations.ttl → matched by rule 2 (org card)</a>
    <a href="${withBasePath('/demo/people.ttl')}">👤 people.ttl → rule 3 disabled, no match (link unchanged)</a>
  </div>
</link-orchestration>`,
);

// ---------------------------------------------------------------------------
// Example 9 — Body-scoped vs head-scoped isolation
// ---------------------------------------------------------------------------
const ex9Html = iframeBase(
  'Scoped vs Global Orchestration',
  `<link-orchestration>
  <script type="application/json">
  {
    "debounceMs": 100,
    "rules": [
      {
        "id": "scoped-books",
        "match": { "css": "a[href$='books.ttl']", "contentType": "text" },
        "adapter": { "strategy": "file", "cache": "none" },
        "lens": {
          "shapeFile": "${withBasePath('/demo/book-shapes.ttl')}",
          "shapeClass": "http://example.org/Book",
          "multiple": true
        },
        "display": { "template": "${withBasePath('/demo/book-card.html')}", "mode": "grid" },
        "decorators": { "enabled": true, "icons": { "loading": "⏳", "ready": "📚", "error": "⚠" } }
      }
    ]
  }
  </script>

  <div style="border:2px solid #86efac;border-radius:.5rem;padding:.75rem;background:#f0fdf4">
    <p class="label" style="color:#166534">Inside body-scoped &lt;link-orchestration&gt;</p>
    <div class="links">
      <a href="${withBasePath('/demo/books.ttl')}">📚 books.ttl (orchestrated by scoped instance)</a>
    </div>
  </div>
</link-orchestration>

<div style="border:2px solid #fca5a5;border-radius:.5rem;padding:.75rem;background:#fff1f2;margin-top:1rem">
  <p class="label" style="color:#991b1b">Outside &lt;link-orchestration&gt; — not orchestrated</p>
  <div class="links">
    <a href="${withBasePath('/demo/books.ttl')}">📚 books.ttl (plain link — outside scope)</a>
  </div>
</div>`,
);

// ---------------------------------------------------------------------------
// Playground definition
// ---------------------------------------------------------------------------
type Example = {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  matchingKey: string;
  notes: string;
  disclaimer?: string;
  iframeHtml: string;
  configCode: string;
  lensCode: string;
  templateCode: string;
};

const examples: Example[] = [
  {
    id: 'css-selector',
    title: 'CSS Attribute Selector',
    badge: 'css',
    badgeColor: 'bg-blue-100 text-blue-800',
    description:
      'Target links with precise CSS selectors. Combine attribute selectors, pseudo-classes, and class names for surgical matching.',
    matchingKey: 'match.css',
    disclaimer: 'This example is not currently working as expected. It is kept here for debugging and documentation purposes.',
    notes:
      `Uses css: "a[href$='.ttl'][data-type='book']". Only the link with the correct data-type attribute is orchestrated.`,
    iframeHtml: ex1Html,
    lensCode: lensBookConfig,
    templateCode: bookTemplate,
    configCode: `{
  "rules": [{
    "id": "css-books",
    "match": {
      "css": "a[href$='.ttl'][data-type='book']"
    }
  }]
}`,
  },
  {
    id: 'url-glob',
    title: 'URL Glob Pattern',
    badge: 'urlPattern',
    badgeColor: 'bg-violet-100 text-violet-800',
    description:
      'Match links by URL glob. Use ** for any path segment sequence. Simple and readable alternative to regex for common cases.',
    matchingKey: 'match.urlPattern',
    disclaimer: 'This example is not currently working as expected. It is kept here for debugging and documentation purposes.',
    notes: 'Pattern **/demo/people.ttl matches the exact file regardless of origin or path prefix.',
    iframeHtml: ex2Html,
    lensCode: lensPersonConfig,
    templateCode: personTemplate,
    configCode: `{
  "rules": [{
    "id": "url-glob-people",
    "match": {
      "urlPattern": "**/demo/people.ttl"
    }
  }]
}`,
  },
  {
    id: 'url-regex',
    title: 'URL Regular Expression',
    badge: 'urlRegex',
    badgeColor: 'bg-orange-100 text-orange-800',
    description:
      'Full regex power over the link href. Match any RDF serialisation by file extension, optional query strings, fragments, etc.',
    matchingKey: 'match.urlRegex',
    disclaimer: 'This example is not currently working as expected. It is kept here for debugging and documentation purposes.',
    notes: 'Pattern \\.(ttl|n3|nt)(\\?.*)?$ matches .ttl, .n3, and .nt links, with or without a query string.',
    iframeHtml: ex3Html,
    lensCode: lensPersonConfig,
    templateCode: personTemplate,
    configCode: `{
  "rules": [{
    "id": "regex-rdf-files",
    "match": {
      "urlRegex": "\\\\.(ttl|n3|nt)(\\\\?.*)?$"
    }
  }]
}`,
  },
  {
    id: 'parent-css',
    title: 'Parent CSS Scope Guard',
    badge: 'parentCss',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    description:
      'Restrict orchestration to links inside a specific ancestor element. Ideal for feature-flagging a section of a page without touching the rest.',
    matchingKey: 'match.parentCss',
    disclaimer: 'This example is not currently working as expected. It is kept here for debugging and documentation purposes.',
    notes:
      'parentCss: ".rdf-org-links" means the rule only fires for anchors whose closest ancestor matches .rdf-org-links. Identical links outside that container are left alone.',
    iframeHtml: ex4Html,
    lensCode: lensOrgConfig,
    templateCode: orgTemplate,
    configCode: `{
  "rules": [{
    "id": "parent-css-orgs",
    "match": {
      "parentCss": ".rdf-org-links"
    }
  }]
}`,
  },
  {
    id: 'path-prefix',
    title: 'Path-Prefix Multi-Rule Routing',
    badge: 'pathStartsWith',
    badgeColor: 'bg-teal-100 text-teal-800',
    description:
      'Route different data files to different display templates using pathStartsWith. Three rules handle books, people, and organisations each with their own card template.',
    matchingKey: 'match.pathStartsWith',
    disclaimer: 'This example is not currently working as expected. It is kept here for debugging and documentation purposes.',
    notes: 'First-match-wins: rules are evaluated top-to-bottom. Each link hits the most specific applicable rule.',
    iframeHtml: ex5Html,
    lensCode: `Books rule lens config:

  ${lensBookConfig}

  People rule lens config:

  ${lensPersonConfig}

  Organisations rule lens config:

  ${lensOrgConfig}`,
    templateCode: `Books rule template (/demo/book-card.html):

  ${bookTemplate}

  People rule template (/demo/person-card.html):

  ${personTemplate}

  Organisations rule template (/demo/org-card.html):

  ${orgTemplate}`,
    configCode: `{
  "rules": [
    { "id": "books", "match": { "pathStartsWith": "/demo/books" } },
    { "id": "people", "match": { "pathStartsWith": "/demo/people" } },
    { "id": "orgs",   "match": { "pathStartsWith": "/demo/organisations" } }
  ]
}`,
  },
  {
    id: 'xpath',
    title: 'XPath Selector',
    badge: 'xpath',
    badgeColor: 'bg-pink-100 text-pink-800',
    description:
      'Use full XPath 1.0 expressions for structural matching — position, axis traversal, sibling checks. Goes beyond what CSS selectors can express.',
    matchingKey: 'match.xpath',
    notes:
      'XPath //ol[@id="dataset-list"]//li[position()<=2]//a selects only links in the first two list items. The third list item contains an identical link that is deliberately left unorchestrated.',
    iframeHtml: ex6Html,
    lensCode: lensPersonConfig,
    templateCode: personTemplate,
    configCode: `{
  "rules": [{
    "id": "xpath-first-two",
    "match": {
      "xpath": "//ol[@id='dataset-list']//li[position()<=2]//a"
    }
  }]
}`,
  },
  {
    id: 'inline-template',
    title: 'Inline Template & Custom Decorators',
    badge: 'templateInline',
    badgeColor: 'bg-amber-100 text-amber-800',
    description:
      'Embed the Handlebars display template directly inside the rule config JSON — no extra HTTP request for the template file. Also demonstrates custom decorator icons per rule.',
    matchingKey: 'display.templateInline + decorators.icons',
    disclaimer: 'This example is not currently working as expected. It is kept here for debugging and documentation purposes.',
    notes:
      'The template is a single-line HTML string. The orchestrator creates a Blob URL at runtime so the display component can still fetch it.',
    iframeHtml: ex7Html,
    lensCode: lensPersonConfig,
    templateCode: inlineBadgeTemplate,
    configCode: `{
  "rules": [{
    "id": "inline-badge",
    "display": {
      "templateInline": "<div>{{#each items}}<span>{{name}}</span>{{/each}}</div>"
    },
    "decorators": {
      "enabled": true,
      "icons": { "loading": "🔄", "ready": "🏷", "error": "❌" }
    }
  }]
}`,
  },
  {
    id: 'multi-rule-priority',
    title: 'Multi-Rule Priority & Disabled Rules',
    badge: 'enabled: false',
    badgeColor: 'bg-slate-100 text-slate-700',
    description:
      'Multiple rules evaluated in order — first match wins. A disabled catch-all rule at the end demonstrates that enabled: false completely skips a rule even if its CSS would match.',
    matchingKey: 'rule.enabled + first-match-wins',
    notes:
      'Rules 1 and 2 match books and organisations. Rule 3 has enabled: false so even though its CSS (a[href$=".ttl"]) would catch the people link, it is never evaluated.',
    iframeHtml: ex8Html,
    lensCode: `Books rule lens config (rule 1):

  ${lensBookConfig}

  Organisations rule lens config (rule 2):

  ${lensOrgConfig}

  People rule lens config (rule 3, disabled):

  ${lensPersonConfig}`,
    templateCode: `Books template (rule 1):

  ${bookTemplate}

  Organisations template (rule 2):

  ${orgTemplate}

  People template (rule 3, disabled):

  ${personTemplate}`,
    configCode: `{
  "rules": [
    { "id": "books-exact", "match": { "css": "a[href$='books.ttl']" } },
    { "id": "orgs-exact",  "match": { "css": "a[href$='organisations.ttl']" } },
    { "id": "catchall",    "enabled": false,
      "match": { "css": "a[href$='.ttl']" } }
  ]
}`,
  },
  {
    id: 'scoped-isolation',
    title: 'Body-Scoped Isolation',
    badge: 'scope',
    badgeColor: 'bg-cyan-100 text-cyan-800',
    description:
      'A body-scoped <link-orchestration> only orchestrates links inside its own DOM subtree. Identical links outside are untouched, even if a global orchestrator is present.',
    matchingKey: 'placement in body (not head)',
    notes:
      'The green box is inside the orchestrator element — those links are processed. The red box is a sibling — those links are out of scope.',
    iframeHtml: ex9Html,
    lensCode: lensBookConfig,
    templateCode: bookTemplate,
    configCode: `{
  "debounceMs": 100,
  "rules": [
    {
      "id": "scoped-books",
      "match": { "css": "a[href$='books.ttl']", "contentType": "text" },
      "adapter": { "strategy": "file", "cache": "none" },
      "lens": {
        "shapeFile": "/demo/book-shapes.ttl",
        "shapeClass": "http://example.org/Book",
        "multiple": true
      },
      "display": { "template": "/demo/book-card.html", "mode": "grid" }
    }
  ]
}`,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ExampleCard({ example }: { example: Example }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{example.title}</CardTitle>
            <CardDescription className="text-xs">{example.description}</CardDescription>
          </div>
          <Badge className={`text-xs shrink-0 ${example.badgeColor} border-0`}>{example.badge}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {example.disclaimer && (
          <div className="flex gap-2 items-start rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
            <span>{example.disclaimer}</span>
          </div>
        )}

        {/* Notes callout */}
        <div className="flex gap-2 items-start rounded-md border bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-cyan-600" />
          <span>{example.notes}</span>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="html">HTML Code</TabsTrigger>
            <TabsTrigger value="rules">Orchestrator Rules</TabsTrigger>
            <TabsTrigger value="lens">RDF-Lens Config</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="mt-3">
            <iframe
              srcDoc={example.iframeHtml}
              className="w-full rounded-md border bg-white"
              style={{ height: 280 }}
              title={example.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </TabsContent>

          <TabsContent value="html" className="mt-3">
            <pre className="text-xs rounded-md border bg-slate-900 text-slate-100 dark:bg-slate-950 p-3 overflow-x-auto whitespace-pre-wrap">
              {example.iframeHtml}
            </pre>
          </TabsContent>

          <TabsContent value="rules" className="mt-3">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Link-Orchestration Rules JSON
            </p>
            <pre className="text-xs rounded-md border bg-slate-900 text-slate-100 dark:bg-slate-950 p-3 overflow-x-auto whitespace-pre-wrap">
              {example.configCode}
            </pre>
          </TabsContent>

          <TabsContent value="lens" className="mt-3">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              RDF-Lens Component Config
            </p>
            <pre className="text-xs rounded-md border bg-slate-900 text-slate-100 dark:bg-slate-950 p-3 overflow-x-auto whitespace-pre-wrap">
              {example.lensCode}
            </pre>
          </TabsContent>

          <TabsContent value="template" className="mt-3">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Lens-Display Component Template
            </p>
            <pre className="text-xs rounded-md border bg-slate-900 text-slate-100 dark:bg-slate-950 p-3 overflow-x-auto whitespace-pre-wrap">
              {example.templateCode}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Orchestration Playground</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Interactive examples covering every matching capability of &lt;link-orchestration&gt;
            </p>
          </div>
          <div className="ml-auto">
            <Link href="/orchestration">
              <Button variant="outline" size="sm">
                Docs
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Intro */}
        <Card>
          <CardHeader>
            <CardTitle>Capability Overview</CardTitle>
            <CardDescription>
              Each example below runs in an isolated iframe with a full standalone HTML document. No build step required — just the bundle and your config.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {examples.map((ex) => (
                <a
                  key={ex.id}
                  href={`#${ex.id}`}
                  className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium border transition-opacity hover:opacity-80 ${ex.badgeColor}`}
                >
                  {ex.badge}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matching capabilities quick-ref */}
        <Card>
          <CardHeader>
            <CardTitle>Matching Keys Quick Reference</CardTitle>
            <CardDescription>All available fields in the <code>match</code> object of a rule.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {[
                ['css', 'CSS selector — the link itself must match'],
                ['xpath', 'XPath 1.0 expression evaluated on the scope root'],
                ['parentCss', 'CSS selector — an ancestor of the link must match'],
                ['urlPattern', 'Glob pattern matched against the full href'],
                ['urlRegex', 'JavaScript regex matched against the full href'],
                ['hostEquals', 'Exact hostname match (e.g. "example.org")'],
                ['pathStartsWith', 'URL pathname prefix (e.g. "/api/data/")'],
                ['contentType', '"text" | "image" — detected from link children'],
              ].map(([key, desc]) => (
                <div key={key} className="flex gap-2 rounded-md border bg-white/70 dark:bg-slate-900/60 px-3 py-2">
                  <code className="font-mono text-cyan-700 dark:text-cyan-400 shrink-0">{key}</code>
                  <span className="text-slate-600 dark:text-slate-400">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Example cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {examples.map((ex) => (
            <div key={ex.id} id={ex.id}>
              <ExampleCard example={ex} />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 items-start text-sm text-slate-600 dark:text-slate-400">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-cyan-600" />
              <div className="space-y-1">
                <p>
                  All examples use{' '}
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 rounded px-1">sandbox="allow-scripts allow-same-origin"</code>{' '}
                  on the iframes so the web component bundle can load and the RDF fetch requests can reach the demo files.
                </p>
                <p>
                  Rules are evaluated left-to-right, top-to-bottom. Only the first matching rule fires for each link — subsequent rules are skipped.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
