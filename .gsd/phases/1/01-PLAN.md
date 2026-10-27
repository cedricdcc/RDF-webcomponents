---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified:
  - src/lib/gemini/gemini-client.ts
  - src/lib/gemini/template-validator.ts
  - src/lib/gemini/template-validator.test.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Gemini client can discover available models and automatically fallback across candidates on failure"
    - "Template validator checks Mustache tags against JSON data fields and reports errors or unclosed tags"
    - "Automated unit tests confirm validator precision and fallback cascade behavior"
  artifacts:
    - "src/lib/gemini/gemini-client.ts exists and exports GeminiClient"
    - "src/lib/gemini/template-validator.ts exists and exports validateTemplateAgainstJson"
    - "src/lib/gemini/template-validator.test.ts passes with bun run test or vitest"
  key_links:
    - "Gemini client calls Google Generative Language REST API directly with user API key"
    - "Template validator accepts template string and JSON object to output diagnostic warnings/errors"
---

# Plan 1.1: Gemini Client with Fallback & Automated Template Validator

<objective>
Build the core Gemini API client service with automatic model discovery and multi-tier fallback, alongside an automated syntax and semantic validator that validates generated Mustache templates against RDF lens JSON data.

Purpose: Provide robust, resilient AI connectivity and deterministic correctness checking so that templates generated for `lens-display` are verified against actual data schemas.
Output: `gemini-client.ts`, `template-validator.ts`, and test suite in `template-validator.test.ts`.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/rdf-webcomponents/components/lens-display.ts
- package.json
</context>

<tasks>

<task type="auto">
  <name>Create Gemini API Client with Automated Model Discovery & Multi-Tier Fallback</name>
  <files>src/lib/gemini/gemini-client.ts</files>
  <action>
    Implement a client-side Gemini service using direct `fetch` to Google's Generative Language REST API (`https://generativelanguage.googleapis.com/v1beta/`).
    Features:
    1. Local storage persistence for API key with get/set/clear methods.
    2. Dynamic model candidate list: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`.
    3. `discoverModels(apiKey)`: Queries `v1beta/models` to discover supported models for the key, filtering for `generateContent` support.
    4. `generateWithFallback(prompt, options)`: Iterates through the fallback chain if a model returns 404 (Not Found), 429 (Rate Limit/Quota), or 503.
    5. Dispatches progress callbacks: `onStatusChange(status, modelName, isFallback)` and `onToken(token)` for comprehensive generation visibility.
    AVOID: Relying on heavy server-side SDKs that require server secrets; keys must remain in client browser storage for user privacy.
  </action>
  <verify>bun test or vitest run src/lib/gemini/template-validator.test.ts</verify>
  <done>GeminiClient handles model discovery, fallback progression, and prompt execution with typed responses.</done>
</task>

<task type="auto">
  <name>Implement Automated Mustache & JSON Schema Template Validator</name>
  <files>src/lib/gemini/template-validator.ts</files>
  <action>
    Implement an automated validator `validateTemplateAgainstJson(templateHtml: string, jsonData: any): ValidationReport`.
    Capabilities:
    1. Parse all Mustache tags: `{{field}}`, `{{{unescaped}}}`, `{{#conditional}}`, `{{^inverted}}`, `{{#each items}}`, `{{/block}}`.
    2. Validate tag balance: Ensure all opening block tags have corresponding closing tags with correct nesting order.
    3. Cross-reference property references against `jsonData` schema (supports single object and array of objects).
    4. Detect orphaned tags, missing JSON properties (e.g. template uses `{{user_age}}` but JSON only has `age`), and unclosed HTML elements.
    5. Return structured report: `{ valid: boolean, errors: ValidationError[], warnings: ValidationWarning[], matchedProperties: string[], missingProperties: string[] }`.
    AVOID: Using basic substring checks; use token/regex parsing to properly detect block scope and avoid false positives.
  </action>
  <verify>bun test or vitest run src/lib/gemini/template-validator.test.ts</verify>
  <done>Validator accurately reports errors for missing fields and unbalanced tags, and passes valid templates.</done>
</task>

<task type="auto">
  <name>Write Comprehensive Unit Tests for Fallback and Validator</name>
  <files>src/lib/gemini/template-validator.test.ts</files>
  <action>
    Create Vitest test suite covering:
    1. Template Validator:
       - Valid template matching JSON fields returns `valid: true`.
       - Template with missing property returns warning/error with missing property name.
       - Template with unclosed `{{#block}}` returns balance error.
       - Template with array `{{#each items}}` correctly scopes inner properties.
    2. Gemini Client Fallback Logic:
       - Mock fetch simulating 404/429 on primary model, verifying it cascades to next fallback model.
       - Verifies fallback notification callback is triggered.
  </action>
  <verify>npx vitest run src/lib/gemini/template-validator.test.ts</verify>
  <done>All unit tests pass with zero errors.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `src/lib/gemini/gemini-client.ts` implements fallback sequence
- [ ] `src/lib/gemini/template-validator.ts` flags mismatched fields and syntax issues
- [ ] `npx vitest run src/lib/gemini/template-validator.test.ts` passes
</verification>

<success_criteria>
- [ ] All 3 tasks executed and verified
- [ ] Unit tests pass cleanly
</success_criteria>
