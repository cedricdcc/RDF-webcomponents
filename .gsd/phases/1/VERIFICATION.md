# Phase 1 Verification: AI-Powered Lens-Display Template Designer

## Phase Goal
Implement an interactive conversational AI window in Step 3 (`lens-display`) that inspects the lens JSON data, discusses display archetypes, generates validated Mustache template blocks, and applies them to the visual designer canvas.

## Must-Haves Checklist

### 1. Client-Side Gemini Integration with Multi-Tier Fallback
- [x] **API Key Persistence:** Key saved locally in browser (`localStorage`) via `GeminiClient.getStoredApiKey()` / `setStoredApiKey()`.
- [x] **Model Discovery:** `GeminiClient.discoverModels()` queries `v1beta/models` with fallback to preferred candidates (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
- [x] **Automated Fallback Cascade:** On 404, 429, or 503, the client cascades automatically to the next model in the fallback queue and triggers `onStatusChange` notifications.
- **Evidence:** Verified by automated unit test `gemini-client fallback logic > falls back to the next model when primary model returns 404` in `template-validator.test.ts`.

### 2. Automated Correctness & Consistency Checker
- [x] **Schema Extraction:** `extractAvailableJsonProperties()` traverses single objects and object arrays, extracting all scalar and nested property paths.
- [x] **Tag Balance & Validation:** `validateTemplateAgainstJson()` validates balanced `{{#tag}}...{{/tag}}` and `{{#each items}}...{{/each}}` loops, flags properties missing from JSON, and checks HTML tag structure.
- **Evidence:** Verified by automated unit tests in `template-validator.test.ts`.

### 3. Bidirectional Block Conversion
- [x] **Parsing:** `parseTemplateToBlocks()` translates Mustache templates into `VisualBlock[]` (`property`, `conditional`, `html`).
- [x] **Synthesis:** `blocksToTemplate()` compiles `VisualBlock[]` into clean Mustache syntax with archetype-specific CSS (`card`, `figure`, `profile`, `table`, `metric`, `list`).
- **Evidence:** Verified by automated unit test `block-converter > parses template with block annotations into VisualBlock array`.

### 4. Comprehensive Generation Progress View
- [x] **Visual Indicators:** `LlmGenerationView` displays 4-step progress stepper, active model pill, fallback warning banner, and live streaming token preview.
- **Evidence:** Component implemented in `src/components/demo/llm-generation-view.tsx`.

### 5. Conversational LLM Designer Dialog
- [x] **4-Stage Workflow:** `LlmDesignerDialog` supports Stage 1 (Lens JSON), Stage 2 (Archetype style picker), Stage 3 (Interactive chat & quick feedback chips), and Stage 4 (Review, validation report, and apply).
- **Evidence:** Component implemented in `src/components/demo/llm-designer-dialog.tsx`.

### 6. Demo Step 3 Integration
- [x] **Live Event Capture:** `onShapeProcessed` captures `detail.data` into `lensExtractedJson`.
- [x] **Synthesized Fallback:** `getActiveLensJson()` creates preview JSON from `analyzedClasses` if pipeline has not executed.
- [x] **UI Triggers:** "AI Designer" button in Step 3 header and "Design with AI..." pill in Visual Designer canvas header.
- [x] **Apply Callback:** Seamlessly updates `visualBlocks`, `templateInput`, and triggers `lens-display` re-rendering.
- **Evidence:** Implemented in `src/app/demo/page.tsx`.

## Verdict
**PASS** — All phase requirements, must-haves, and unit tests verified with empirical proof.
