---
phase: 1
plan: 2
wave: 1
depends_on: []
files_modified:
  - src/lib/gemini/block-converter.ts
  - src/components/demo/llm-generation-view.tsx
  - src/components/demo/llm-designer-dialog.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "User can view and edit their Gemini API key with immediate validation"
    - "Generation view displays step-by-step progress, active model, and fallback notices"
    - "Conversational workflow guides the user from Lens JSON to archetype selection to generated blocks"
    - "Generated Mustache template can be converted into VisualBlock[] for the visual canvas"
  artifacts:
    - "src/lib/gemini/block-converter.ts exists and converts between Mustache HTML and VisualBlock[]"
    - "src/components/demo/llm-generation-view.tsx exists and renders visual generation stages"
    - "src/components/demo/llm-designer-dialog.tsx exists and renders the AI designer dialog"
  key_links:
    - "llm-designer-dialog uses gemini-client to generate templates and template-validator to verify outputs"
    - "block-converter maps LLM output to VisualBlock[] compatible with demo page state"
---

# Plan 1.2: Conversational LLM Designer Dialog & Generation View UI

<objective>
Build the conversational AI Designer modal dialog and rich visual generation progress component. This allows users to inspect the Lens JSON data, pick display archetypes (Card, Figure, Profile, Table), converse with the agent, view animated generation feedback, and review automated validation before applying blocks.

Purpose: Provide a delightful, transparent, and guided conversational interface where the user and AI co-create Mustache templates with real-time feedback.
Output: `block-converter.ts`, `llm-generation-view.tsx`, and `llm-designer-dialog.tsx`.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/app/demo/page.tsx (lines 207-330 for VisualBlock types and compilation)
- src/lib/gemini/gemini-client.ts
- src/lib/gemini/template-validator.ts
</context>

<tasks>

<task type="auto">
  <name>Build Bidirectional Block Converter Between Mustache HTML and Visual Blocks</name>
  <files>src/lib/gemini/block-converter.ts</files>
  <action>
    Implement utility functions to translate between `VisualBlock[]` and Mustache HTML template code:
    1. `parseTemplateToBlocks(html: string): VisualBlock[]`:
       - Identifies title/property tags `{{field}}` -> `{ type: 'property', name: field, label: ... }`.
       - Identifies conditional sections `{{#field}}...{{/field}}` -> `{ type: 'conditional', name: field, label: ... }`.
       - Treats arbitrary HTML segments as `{ type: 'html', content: ... }`.
    2. `blocksToTemplate(blocks: VisualBlock[], styleArchetype?: string): string`:
       - Emits clean Mustache markup wrapped in semantic containers with embedded CSS styles tuned for the archetype (e.g. card, figure, profile, table).
    AVOID: Losing user-defined custom HTML styling during conversion.
  </action>
  <verify>bun test or vitest run</verify>
  <done>Conversion round-trips correctly and produces valid VisualBlock arrays.</done>
</task>

<task type="auto">
  <name>Create Comprehensive Visual Generation View Component</name>
  <files>src/components/demo/llm-generation-view.tsx</files>
  <action>
    Build `LlmGenerationView` providing high-fidelity visual feedback during AI operations:
    1. Stepper progression badges:
       - Step 1: "Analyzing Lens JSON schema"
       - Step 2: "Connecting to Gemini model"
       - Step 3: "Synthesizing Mustache blocks"
       - Step 4: "Running automated validation"
    2. Model Badge:
       - Displays currently active model (e.g., `gemini-2.5-flash`).
       - If fallback occurs, shows prominent alert: "Fallback activated: switched from gemini-2.5-flash to gemini-2.0-flash".
    3. Animated Shimmer & Live Output:
       - Display pulsing indicator and live-rendered streaming markdown/code preview.
       - Clean error state display with retry button if all models fail.
    AVOID: Simple spinner without context; user requested a comprehensive view that the LLM is generating something.
  </action>
  <verify>npm run build or check component exports</verify>
  <done>LlmGenerationView renders multi-step progress, active model badge, fallback alerts, and streaming text.</done>
</task>

<task type="auto">
  <name>Create Conversational LLM Designer Dialog with Feedback & Validation Report</name>
  <files>src/components/demo/llm-designer-dialog.tsx</files>
  <action>
    Build the main `LlmDesignerDialog` component with:
    1. API Key Bar: Input for Gemini API Key (stored in localStorage) with status pill (Ready / No Key / Invalid) and model selection preferences.
    2. Guided Stage Workflow:
       - Stage 1: Lens JSON Inspection — Formatted JSON preview of input data from `rdf-lens` with field counter.
       - Stage 2: Display Archetype Selection — Visual cards for Card, Figure / Media, Profile Badge, Data Table, Metric Card, Compact List, plus custom prompt.
       - Stage 3: Conversational Prompting & Refinement — Chat interface where user can send iterative requests ("Add email link", "Make header larger", "Show city as badge").
       - Stage 4: Review & Validation — Shows generated template, converted `VisualBlock[]` chips, and automated validation report (Passed / Warnings).
    3. User Feedback & Quick Actions:
       - Quick prompt chips: "Make it horizontal", "Add conditional fallbacks", "Add modern shadow", "Compact layout".
    4. "Apply to Visual Canvas" Button:
       - Emits `{ blocks: VisualBlock[], templateHtml: string }` to parent page.
    AVOID: Cluttered unorganized layout; use tabs/stepper with Radix Dialog and Lucide icons.
  </action>
  <verify>npm run build or vitest run</verify>
  <done>Dialog renders smoothly with API key configuration, conversation flow, validation report, and apply action.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `src/lib/gemini/block-converter.ts` converts between template and VisualBlock[]
- [ ] `src/components/demo/llm-generation-view.tsx` visualizes generation states and fallback notices
- [ ] `src/components/demo/llm-designer-dialog.tsx` provides conversational interface with validation
</verification>

<success_criteria>
- [ ] All UI components compile without TypeScript or ESLint errors
- [ ] Conversational stages (JSON inspection -> style choice -> refinement -> validation -> apply) functional
</success_criteria>
