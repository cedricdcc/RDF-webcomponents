---
phase: 1
plan: 3
wave: 2
depends_on:
  - 1
  - 2
files_modified:
  - src/app/demo/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Step 3 captures extracted JSON from rdf-lens or synthesizes preview JSON from analyzed classes"
    - "AI Designer button in Step 3 opens the conversational assistant window"
    - "Applying generated blocks updates visualBlocks, templateInput, and live lens-display preview"
  artifacts:
    - "src/app/demo/page.tsx updated with LlmDesignerDialog integration and state binding"
  key_links:
    - "shape-processed event listener updates lensJsonData state in demo/page.tsx"
    - "onApply callback sets visualBlocks and triggers runPipelineWithValues({ template })"
---

# Plan 1.3: Step 3 Demo Integration & End-to-End Pipeline Verification

<objective>
Integrate the AI Designer modal and its conversational workflow into Step 3 (`lens-display`) of `src/app/demo/page.tsx`, wiring live data from `rdf-lens`, adding prominent trigger actions in the Visual Designer, and verifying end-to-end execution.

Purpose: Provide the end-user with a complete, cohesive pair-design experience where the LLM writes and refines Mustache templates that seamlessly drive the visual blocks canvas and live Lit element.
Output: Updated `src/app/demo/page.tsx` and validated build.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/app/demo/page.tsx
- src/components/demo/llm-designer-dialog.tsx
- src/lib/gemini/gemini-client.ts
</context>

<tasks>

<task type="auto">
  <name>Wire AI Designer Dialog and Extracted Lens JSON into Demo Step 3</name>
  <files>src/app/demo/page.tsx</files>
  <action>
    Update `src/app/demo/page.tsx`:
    1. Add state `lensExtractedJson: any` initialized to null or derived from `DEMO_DATA` sample object.
    2. In the `onShapeProcessed` event listener, capture `detail.data` and save it to `lensExtractedJson`.
    3. Add a helper `getActiveLensJson()` that returns `lensExtractedJson` if available, or synthesizes a representative JSON record from `analyzedClasses[selectedClass]` if Step 2 has not run yet.
    4. In Step 3 UI header (next to Visual Designer and HTML Code Editor toggle), add an "AI Designer" button with Sparkles icon and badge ("Gemini AI").
    5. Also add an AI button inside the Visual Designer canvas header ("Design with AI...").
    6. Mount `LlmDesignerDialog`:
       - Pass `isOpen`, `onClose`, `jsonData={getActiveLensJson()}`, `currentBlocks={visualBlocks}`, `selectedClass={selectedClass}`.
       - In `onApplyTemplate({ blocks, templateHtml })`:
         * Update `visualBlocks` with the generated blocks.
         * Update `templateInput` with `templateHtml`.
         * Call `runPipelineWithValues({ template: templateHtml })` to trigger the Lit `<lens-display>` element re-render.
         * Display a success toast ("AI Template applied to Visual Designer!").
    AVOID: Breaking existing drag-and-drop or manual block editing; ensure state remains synchronized across both modes.
  </action>
  <verify>bun run build:webcomponents && next build</verify>
  <done>Demo page renders with AI Designer button, dialog opens, passes JSON data, and updates blocks on apply.</done>
</task>

<task type="auto">
  <name>Run Full Verification and Lint Checks</name>
  <files>src/app/demo/page.tsx</files>
  <action>
    Run project test suites, linting, and build validation:
    1. Run `npx vitest run` to ensure all tests pass (including template validator and Gemini tests).
    2. Run `npm run lint` or check for TypeScript compilation errors using `npx tsc --noEmit`.
    3. Verify that the production build completes cleanly without errors.
  </action>
  <verify>npm test && npx tsc --noEmit</verify>
  <done>Zero TypeScript errors, zero lint errors, all tests green, and build succeeds.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Step 3 header contains "AI Designer" button
- [ ] Dialog opens with live or synthesized lens JSON data
- [ ] Applying template updates visual blocks and triggers preview refresh
- [ ] TypeScript and Vitest tests pass without errors
</verification>

<success_criteria>
- [ ] All 3 plans in Phase 1 complete and verified
- [ ] End-to-end integration functional in Demo Step 3
</success_criteria>
