# Specification: AI-Powered Lens-Display Template Designer

**Status: FINALIZED**

## 1. Problem Statement
In the RDF Webcomponents interactive demo (`src/app/demo/page.tsx`), Step 3 (`lens-display`) features a Visual Block Designer and an HTML Code Editor. While users can manually assemble Mustache blocks (`{{property}}`, `{{#conditional}}`) from detected RDF class properties, creating complex, visually appealing semantic templates (like cards, figures, tables, or profile badges) requires manual assembly and syntax knowledge.

Users need an AI-assisted conversational workflow powered by Google Gemini where an LLM agent inspects the extracted JSON data from `rdf-lens`, discusses display archetypes with the user, iteratively generates the Mustache template blocks, performs automated correctness checks against the JSON schema, and seamlessly injects the generated blocks into the visual designer canvas.

## 2. Requirements

### 2.1 Gemini API Key & Client Management
- Secure user-supplied Gemini API key storage (`localStorage`), masked input, and clear/reset actions.
- Client-side direct connection to Google Gemini API (privacy-preserving; keys never touch a remote backend).

### 2.2 Automated Model Discovery & Multi-Tier Fallback
- Dynamic model selection prioritizing high-capability and high-speed models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
- Automatic fallback cascade: If an API call fails due to model unavailability (404), quota exhaustion (429), or service degradation (503), the client automatically tries the next candidate model in the fallback chain.
- The UI visibly informs the user of fallback triggers and active model.

### 2.3 Conversational Design Flow with Lens JSON
- Stage 1: **Lens JSON Inspection**: Feed the actual JSON object/array extracted by `rdf-lens` (or synthesized from RDF graph analysis) to the model and display it cleanly to the user.
- Stage 2: **Display Archetype Selection**: Offer predefined presentation options (Card, Figure/Media, Profile Badge, Data Table/Grid, Metric/Dashboard Card, Compact List) as well as custom prompts.
- Stage 3: **Conversational Refinement**: Multi-turn dialogue between user and agent to tune layout, styling, and field inclusion.
- Stage 4: **Block Narrowing & Mustache Generation**: Generate structured `VisualBlock[]` definitions and corresponding HTML + Mustache templates compatible with `lens-display`.

### 2.4 Automated Correctness & Consistency Checks
- Automated syntax validation: Check that all Mustache variables (`{{var}}`, `{{#var}}`) reference properties present in the input JSON data.
- Check balanced block tags (e.g., `{{#prop}}...{{/prop}}`, `{{#each items}}...{{/each}}`).
- Check HTML safety and structural completeness.
- Display a clear validation report card (Passed checks, Warnings, Suggested fixes).
- Offer feedback loop: user can give feedback to regenerate or refine.

### 2.5 Comprehensive Generation Indicator
- Real-time visual progress indicator during generation:
  - Step-by-step status transitions ("Inspecting JSON schema...", "Connecting to Gemini...", "Synthesizing blocks...", "Validating syntax...").
  - Pulse/shimmer animations and stream preview so the user always knows the LLM is actively working.

### 2.6 Seamless Visual Designer Integration
- "Apply to Visual Designer" action injects the generated blocks into `visualBlocks` in Step 3.
- Automatically compiles the template, updates `templateInput`, and triggers the live `lens-display` pipeline re-render.

## 3. Success Criteria
1. User can enter and store their Gemini API key with immediate validity feedback.
2. If the preferred Gemini model is unavailable, the fallback sequence automatically recovers without failing the user request.
3. Extracted JSON from `rdf-lens` is accurately presented and fed to Gemini.
4. The user can converse with the AI to refine template layout and generate Mustache blocks.
5. Automated validation detects mismatched fields or unclosed Mustache tags before applying.
6. Generation states and streaming progress are comprehensively visualized.
7. Generated blocks appear on the Step 3 visual designer canvas and render live in `lens-display`.
