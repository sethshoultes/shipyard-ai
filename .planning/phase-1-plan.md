# Phase 1 Plan — Anvil: Cloudflare Workers AI Template Generator (v1 MVP)

**Generated**: 2026-04-30
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 9
**Waves**: 4
**Project Slug**: `github-issue-sethshoultes-shipyard-ai-86`

---

## Documentation Review

### Verified Technical Context

1. **Platform Lock**: Node.js CLI tool distributed via npm, NOT Emdash/Cloudflare. The locked decisions explicitly define this as a standalone CLI product (`anvil`). No Astro, no WordPress, no Emdash plugin patterns apply.

2. **Architecture Lock**: Dynamic generation from live Cloudflare Workers AI OpenAPI spec (decisions.md §3). **Zero static templates.** If the generator fails, it fails loudly. No bundled fallbacks.

3. **Streaming-Only Contract**: Locked decision #2 — `stream: true` is the only code path. No batch mode, no multimodal flags, no image/audio logic in generated workers.

4. **Generated Artifact Design Rule**: `index.ts` and `wrangler.toml` only. If a third file is required, the generator is wrong (decisions.md §File Structure).

5. **Cloudflare Workers AI Streaming API** (verified via docs/EMDASH-GUIDE.md §5 and decisions.md):
   - Binding: `env.AI.run(model, { messages, stream: true })`
   - Returns a `ReadableStream` forwarded with `Content-Type: text/event-stream`
   - Model is `@cf/` prefixed text-generation model selected at scaffold time

6. **Brand Voice Lock**: Plainspoken, human, zero corporate jargon. Error messages explain what to do next. No raw stack traces as UI. "If a sentence sounds like it could live on an IBM landing page, delete it."

7. **Production Metric**: 100 concurrent streaming requests, stable. This is the agreed v1 ceiling test.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| ANV-001 | phase-1-task-1, phase-1-task-6 | 1, 3 |
| ANV-002 | phase-1-task-2 | 1 |
| ANV-003 | phase-1-task-4 | 2 |
| ANV-004 | phase-1-task-5 | 2 |
| ANV-005 | phase-1-task-7 | 3 |
| ANV-006 | phase-1-task-3 | 1 |
| ANV-007 | phase-1-task-4, phase-1-task-6 | 2, 3 |
| ANV-008 | phase-1-task-2 | 1 |
| ANV-009 | phase-1-task-1, phase-1-task-7, phase-1-task-8 | 1, 3, 3 |
| ANV-010 | phase-1-task-9 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation
**Duration**: Day 1
**Dependencies**: None — all tasks run in parallel.

#### Task 1.1: Bootstrap CLI Project Structure
**Output**: Working `bin/anvil` entry point, `package.json`, `tsconfig.json`

#### Task 1.2: Build Cloudflare Spec Fetcher + Default Model Selector
**Output**: `src/generators/spec.ts` that fetches live spec and picks the best text-generation model

#### Task 1.3: Scaffold Zero-Install GitHub Template
**Output**: `github-template/` with Deploy button, placeholder worker, and minimal deps

---

### Wave 2 (Parallel) — Generators
**Duration**: Day 1-2
**Dependencies**: Wave 1 complete. Both generators depend on `spec.ts` interface from Task 1.2.

#### Task 2.1: Build Streaming Worker Code Generator
**Output**: `src/generators/worker.ts` — emits `index.ts` with streaming inference handler

#### Task 2.2: Build Wrangler.toml Generator
**Output**: `src/generators/worker.ts` (or adjacent function) — emits minimal `wrangler.toml`

---

### Wave 3 (Parallel) — Orchestration & Polish
**Duration**: Day 2
**Dependencies**: Wave 2 complete. Tasks 3.1 and 3.2 can run in parallel; both need generators ready.

#### Task 3.1: Build CLI Create Command + Deploy Wrapper
**Output**: `src/commands/create.ts` and `src/utils/deploy.ts`

#### Task 3.2: Write Plainspoken README, Error Messages, and CLI Polish
**Output**: `README.md` and human-voiced strings throughout the CLI

---

### Wave 4 — Integration Verification
**Duration**: Day 2-3
**Dependencies**: All prior waves complete.

#### Task 4.1: End-to-End Integration Test
**Output**: Verified 60-second path from `npx anvil create --llm` to streaming response

---

## XML Task Plans

### Wave 1 (Parallel)

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Bootstrap Anvil CLI project structure</title>
  <requirement>ANV-001: Single-command LLM worker scaffolding; ANV-009: Plainspoken CLI voice</requirement>
  <description>
    Create the foundational Node.js/TypeScript project for the Anvil CLI.
    This includes package.json with correct bin entry, tsconfig.json for Node 22+,
    the executable bin/anvil file, and the src/index.ts CLI entry point with
    argument parsing and plainspoken --help text.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="File structure spec and brand voice constraints" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-001 and ANV-009 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create the project root at `projects/github-issue-sethshoultes-shipyard-ai-86/build/anvil/`</step>
    <step order="2">Write `package.json` with: name="@shipyard/anvil", bin={anvil:"./dist/index.js"}, type="module", engines={node:">=22"}, dependencies include commander and chalk (for plainspoken colors)</step>
    <step order="3">Write `tsconfig.json` targeting ES2022, module NodeNext, outDir "./dist", strict mode enabled</step>
    <step order="4">Create `bin/anvil` executable shell script that runs `node ./dist/index.js "$@"`</step>
    <step order="5">Write `src/index.ts` — CLI entry that imports `commands/create.ts`, sets up a friendly CLI banner (plainspoken, human), and delegates to the create command</step>
    <step order="6">Ensure `--help` prints concise usage: "anvil create --llm [--name <project>] [--deploy]" with warm, plainspoken descriptions</step>
    <step order="7">Run `npm install` in the project root</step>
    <step order="8">Run `npm run build` (or `npx tsc`) and verify `dist/index.js` is created</step>
    <step order="9">Execute `node bin/anvil --help` and confirm output matches plainspoken brand voice (no IBM sentences, no raw stack traces)</step>
  </steps>

  <verification>
    <check type="build">npm run build succeeds with zero TypeScript errors</check>
    <check type="test">node bin/anvil --help prints usage and exits 0</check>
    <check type="manual">Read --help output; confirm it is warm, human, and plainspoken</check>
  </verification>

  <dependencies>
    <!-- None — wave 1 -->
  </dependencies>

  <commit-message>feat(cli): bootstrap Anvil project with entry point and plainspoken help</commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>Build Cloudflare Workers AI spec fetcher and default model selector</title>
  <requirement>ANV-002: Dynamic spec fetching; ANV-008: One default LLM model</requirement>
  <description>
    Build the generator module that fetches the live Cloudflare Workers AI OpenAPI spec,
    parses available text-generation models, and selects the highest-version default model.
    This module is the engine of Anvil — zero static templates, pure dynamic generation.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="Dynamic generation requirement and default model selection logic" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Cloudflare Workers deployment context (§5)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-002 and ANV-008 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create `src/generators/spec.ts`</step>
    <step order="2">Implement `fetchSpec(): Promise<CloudflareSpec>` that GETs the Cloudflare Workers AI OpenAPI spec endpoint (verify actual URL from Cloudflare docs: https://developers.cloudflare.com/api/ or Workers AI REST API docs)</step>
    <step order="3">Parse the spec to extract an array of model objects: each must have `name`, `task`, and optional `version` fields</step>
    <step order="4">Implement `selectDefaultModel(models: Model[]): string` that filters for `task === 'text-generation'` and picks the highest-version model. If versions are equal, prefer the model with the most recent name pattern (e.g., llama-3 over llama-2)</step>
    <step order="5">If no text-generation models are found, throw a plainspoken error: "Couldn't find a text-generation model in the Cloudflare catalog. They might be updating things — try again in a minute?"</step>
    <step order="6">If the network request fails, throw a plainspoken error with actionable next steps (check connection, try again)</step>
    <step order="7">Export a TypeScript interface `CloudflareSpec` and `Model` so downstream generators are type-safe</step>
    <step order="8">Write a unit test that mocks the spec response and asserts `selectDefaultModel` picks the right model</step>
    <step order="9">Run build and tests; verify no static template fallbacks exist anywhere in the codebase</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">Unit test: mocked spec with 3 models → selectDefaultModel returns the highest-version text-generation model</check>
    <check type="test">Unit test: empty text-generation array → throws plainspoken error</check>
    <check type="manual">Run a real fetch against Cloudflare's live spec and log the selected model name</check>
  </verification>

  <dependencies>
    <!-- None — wave 1. Interface must be stable before Wave 2 starts. -->
  </dependencies>

  <commit-message>feat(generator): fetch live Cloudflare AI spec and select default text-generation model</commit-message>
</task-plan>

<task-plan id="phase-1-task-3" wave="1">
  <title>Scaffold zero-install GitHub template</title>
  <requirement>ANV-006: Zero-install onboarding path</requirement>
  <description>
    Create the `github-template/` directory — a minimal Cloudflare Worker project that
    serves as both a GitHub template repository and a fallback zero-install path. It must
    include a "Deploy to Workers" button, a placeholder worker, and minimal dependencies.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="GitHub template file structure and zero-install requirements" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-006 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create `github-template/` directory inside the project root</step>
    <step order="2">Write `github-template/src/index.ts` — a minimal placeholder worker that responds "Hello from Anvil! Run `npx anvil create --llm` to replace this with a streaming LLM worker." on GET /</step>
    <step order="3">Write `github-template/wrangler.toml` with: name="anvil-template", compatibility_date=(today), ai={binding="AI"}</step>
    <step order="4">Write `github-template/package.json` with minimal deps: `wrangler` (devDependency) and `@cloudflare/workers-types` (devDependency). No runtime dependencies.</step>
    <step order="5">Write `github-template/README.md` with: a prominent "Deploy to Workers" button (SVG badge linking to Cloudflare's deploy flow), a 10-second description, and a link to the npm package</step>
    <step order="6">Verify the template compiles: `cd github-template && npm install && npx wrangler deploy --dry-run`</step>
    <step order="7">Confirm template has exactly 4 files: src/index.ts, wrangler.toml, package.json, README.md</step>
  </steps>

  <verification>
    <check type="build">cd github-template && npm install && npx wrangler deploy --dry-run succeeds</check>
    <check type="test">ls github-template/ contains exactly src/index.ts, wrangler.toml, package.json, README.md</check>
    <check type="manual">README.md preview shows a clear "Deploy to Workers" button and 10-second onboarding path</check>
  </verification>

  <dependencies>
    <!-- None — wave 1 -->
  </dependencies>

  <commit-message>feat(template): add zero-install GitHub template with Deploy to Workers button</commit-message>
</task-plan>
```

### Wave 2 (Parallel) — After Wave 1

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Build streaming worker code generator</title>
  <requirement>ANV-003: Streaming inference handler; ANV-007: Streaming-only contract</requirement>
  <description>
    Build the generator that emits `index.ts` — a production-ready Cloudflare Worker
    with a streaming LLM inference handler. The generated file must use `env.AI.run(model, { messages, stream: true })`,
    forward the ReadableStream as `text/event-stream`, and contain zero batch/multimodal code paths.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="Streaming-only contract and generated file constraints" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-003 and ANV-007 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Cloudflare Workers deployment and AI binding context (§5)" />
  </context>

  <steps>
    <step order="1">Read `src/generators/spec.ts` from Task 1.2 to understand the `Model` and selected model interface</step>
    <step order="2">Create `src/generators/worker.ts` with `generateWorker(modelName: string): string`</step>
    <step order="3">Implement `generateWorker` to return a TypeScript string containing: Env interface with `AI: Ai`, default fetch handler, GET / health check, POST / handler that parses `{ messages }` from JSON body</step>
    <step order="4">Ensure the generated handler calls `env.AI.run(modelName, { messages, stream: true })` — verify the exact Cloudflare Workers AI streaming API from https://developers.cloudflare.com/workers-ai/models/ or official docs; do not guess</step>
    <step order="5">Ensure the generated handler returns `new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })`</step>
    <step order="6">Add a try/catch around the inference call that returns `{ error: "The model had a hiccup. Try again?" }` (or similar plainspoken message) as a JSON Response on failure</step>
    <step order="7">Verify the generated string contains zero instances of: `batch`, `blocking`, `multimodal`, `image`, `audio`</step>
    <step order="8">Write a unit test that calls `generateWorker('@cf/test/model')` and asserts the output string contains `stream: true` and no banned words</step>
    <step order="9">Run build and tests; verify the generated TypeScript is syntactically valid (run it through a TS parser or write it to a temp file and `tsc --noEmit`)</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">Unit test: generateWorker output contains `stream: true` and `text/event-stream`</check>
    <check type="test">Unit test: generateWorker output contains zero banned words (batch, blocking, multimodal, image, audio)</check>
    <check type="test">Write generated output to temp file and `npx tsc --noEmit --skipLibCheck` passes</check>
    <check type="manual">Read generated `index.ts` string; confirm it would make a developer grin at its simplicity</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure and build pipeline must exist" />
    <depends-on task-id="phase-1-task-2" reason="Needs selected model name and CloudflareSpec types from spec generator" />
  </dependencies>

  <commit-message>feat(generator): emit streaming LLM worker index.ts with zero blocking paths</commit-message>
</task-plan>

<task-plan id="phase-1-task-5" wave="2">
  <title>Build wrangler.toml generator</title>
  <requirement>ANV-004: Wrangler config generator</requirement>
  <description>
    Build the generator that emits a minimal `wrangler.toml` with the AI binding
    pre-configured. The file must be valid TOML, require zero hand-tuning, and
    contain no extraneous boilerplate.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="Generated wrangler.toml constraints" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-004 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Cloudflare wrangler.jsonc/wrangler.toml config examples (§5)" />
  </context>

  <steps>
    <step order="1">Read `src/generators/spec.ts` from Task 1.2 to understand model metadata that may affect bindings</step>
    <step order="2">In `src/generators/worker.ts` (or `src/generators/config.ts`), implement `generateWrangler(projectName: string): string`</step>
    <step order="3">Generate TOML with exactly these fields: `name = projectName`, `compatibility_date = (today's date)`, `compatibility_flags = ["nodejs_compat"]`, and `[[ai]]` binding table with `binding = "AI"`</step>
    <step order="4">Verify the generated string is valid TOML by parsing it with `@iarna/toml` or `toml` npm package in a unit test</step>
    <step order="5">Verify the generated TOML passes `npx wrangler deploy --dry-run` when written to a temp directory with a dummy `index.ts`</step>
    <step order="6">Confirm no commented-out boilerplate, no extra bindings, no environment-specific overrides</step>
    <step order="7">Run build and tests</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">Unit test: generated TOML parses cleanly with a TOML parser</check>
    <check type="test">Dry-run `wrangler deploy` on generated config + dummy worker succeeds</check>
    <check type="manual">Inspect generated TOML; confirm it is minimal and requires zero edits</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure and build pipeline must exist" />
    <depends-on task-id="phase-1-task-2" reason="May need model metadata for binding configuration" />
  </dependencies>

  <commit-message>feat(generator): emit minimal wrangler.toml with AI binding</commit-message>
</task-plan>
```

### Wave 3 (Parallel) — After Wave 2

```xml
<task-plan id="phase-1-task-6" wave="3">
  <title>Build CLI create command orchestration</title>
  <requirement>ANV-001: Single-command scaffolding; ANV-007: Streaming-only contract</requirement>
  <description>
    Wire the CLI entry point to the generators. Implement `src/commands/create.ts`
    that orchestrates: fetch spec → select model → generate index.ts → generate wrangler.toml
    → write to new directory → optionally run deploy. This is the heart of the 60-second path.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="MVP feature set and file structure" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-001 and ANV-007 acceptance criteria" />
    <file path="projects/github-issue-sethshoultes-shipyard-ai-86/build/anvil/src/generators/spec.ts" reason="Interface for spec fetching and model selection" />
    <file path="projects/github-issue-sethshoultes-shipyard-ai-86/build/anvil/src/generators/worker.ts" reason="Interface for worker and wrangler generation" />
  </context>

  <steps>
    <step order="1">Create `src/commands/create.ts` importing `generators/spec.ts` and `generators/worker.ts`</step>
    <step order="2">Implement `create({ llm: boolean, name?: string, deploy?: boolean })`</step>
    <step order="3">If `!llm`, print plainspoken error: "Right now Anvil only speaks LLM. Try `--llm`?" and exit 1</step>
    <step order="4">Fetch the live Cloudflare spec using `fetchSpec()`</step>
    <step order="5">Select default model using `selectDefaultModel()`</step>
    <step order="6">Create the target directory (default `anvil-worker` or user-provided `--name`)</step>
    <step order="7">Write `index.ts` via `generateWorker(modelName)` into the target directory</step>
    <step order="8">Write `wrangler.toml` via `generateWrangler(projectName)` into the target directory</step>
    <step order="9">Write a minimal `package.json` into the target directory with `wrangler` and `@cloudflare/workers-types` as dev deps</step>
    <step order="10">Print plainspoken success: "Your worker is forged in ./{name}/. Two files. One purpose."</step>
    <step order="11">If `--deploy` flag is passed, invoke `deploy.ts` wrapper (Task 3.2) after generation</step>
    <step order="12">If `--deploy` is not passed, print a hint: "Run `cd {name} && npx wrangler deploy` when you're ready to ship it."</step>
    <step order="13">Verify the command creates exactly 3 files in the output directory (design rule: index.ts + wrangler.toml + package.json only)</step>
    <step order="14">Run `node bin/anvil create --llm --name test-worker` in a temp directory and verify output</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">`node bin/anvil create --llm --name test-worker` creates directory with 3 files and exits 0</check>
    <check type="test">`node bin/anvil create` (without --llm) prints friendly error and exits 1</check>
    <check type="test">`node bin/anvil create --llm --name test-worker --deploy` triggers deploy flow (or mocked deploy)</check>
    <check type="manual">Read success message; confirm it is warm, human, and makes you grin</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="CLI entry point and project structure must exist" />
    <depends-on task-id="phase-1-task-2" reason="Needs spec fetcher and model selector" />
    <depends-on task-id="phase-1-task-4" reason="Needs worker generator to emit index.ts" />
    <depends-on task-id="phase-1-task-5" reason="Needs wrangler generator to emit wrangler.toml" />
  </dependencies>

  <commit-message>feat(cli): wire create command to generators for 60-second scaffolding</commit-message>
</task-plan>

<task-plan id="phase-1-task-7" wave="3">
  <title>Build wrangler deploy wrapper and auth edge-case handling</title>
  <requirement>ANV-005: Wrangler deploy integration; ANV-009: Plainspoken CLI voice</requirement>
  <description>
    Build `src/utils/deploy.ts` — a thin wrapper around `wrangler deploy` that detects
    missing authentication, prints plainspoken guidance instead of raw Wrangler errors,
    and celebrates successful deploys with the Worker URL.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="Auth friction open question and deploy requirements" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-005 and ANV-009 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create `src/utils/deploy.ts` with `deploy(projectPath: string): Promise<void>`</step>
    <step order="2">Use `child_process.spawn` to run `npx wrangler deploy` in the project directory</step>
    <step order="3">Stream Wrangler's stdout/stderr through a filter that replaces cryptic errors with plainspoken messages</step>
    <step order="4">Detect "not authenticated" or "Unauthorized" in output and print: "Looks like Wrangler needs to know who you are. Run `npx wrangler login` and come back — we'll wait." Then exit 1</step>
    <step order="5">Detect successful deploy and extract the deployed URL from Wrangler output (e.g., `https://<name>.<subdomain>.workers.dev`)</step>
    <step order="6">On success, print: "It's live! {url} — your worker is answering requests from 200 cities right now."</step>
    <step order="7">On generic failure, print: "Deploy hit a snag. Here's what Wrangler said: {cleanedError}" plus a suggestion to check the Cloudflare dashboard</step>
    <step order="8">Write a unit test that mocks spawn stdout/stderr and verifies the plainspoken error paths</step>
    <step order="9">Run build and tests</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">Mocked spawn with "Unauthorized" → plainspoken auth guidance message</check>
    <check type="test">Mocked spawn with success → URL extracted and celebrated</check>
    <check type="manual">Read error messages; confirm zero IBM sentences and zero raw stack traces as primary UI</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure and build pipeline must exist" />
  </dependencies>

  <commit-message>feat(deploy): wrap wrangler deploy with plainspoken auth handling and celebration</commit-message>
</task-plan>

<task-plan id="phase-1-task-8" wave="3">
  <title>Write plainspoken README, error messages, and CLI polish</title>
  <requirement>ANV-009: Plainspoken CLI voice; ANV-010: 60-second grin path</requirement>
  <description>
    Audit every user-facing string in the CLI. Write a README.md that sells the 60-second
    promise. Ensure all error messages, progress messages, and help text are warm, human,
    and plainspoken. No corporate jargon. No stack traces as UI.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="Brand voice locked decisions (#4) and emotional payoff metric (#5)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-009 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Audit all strings in `src/index.ts`, `src/commands/create.ts`, `src/utils/deploy.ts`, and `src/generators/*.ts`</step>
    <step order="2">Replace any message that sounds like an IBM landing page, a server log, or a stack trace with warm, plainspoken copy</step>
    <step order="3">Write `README.md` at project root with: hero sentence ("One command. One worker. One grin."), 60-second promise, install instructions (`npm install -g @shipyard/anvil`), usage example, zero-install button link, and a "What gets built" section</step>
    <step order="4">Ensure README contains no jargon: no "leverage", "synergy", "scalable solution", "best-in-class"</step>
    <step order="5">Add a `CHANGELOG.md` or release notes section with v1.0.0 entry</step>
    <step order="6">Run `grep -ri "unauthorized\|bad request\|internal server error\|please contact\|stack trace\|at \S* (\S*:\d*:\d*)" src/` and confirm zero matches (except in comments documenting what NOT to do)</step>
    <step order="7">Run `grep -ri "leverage\|synergy\|scalable\|best-in-class\|end-to-end solution" README.md src/` and confirm zero matches</step>
    <step order="8">Run build and verify no string literals break TypeScript compilation</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">Grep for corporate jargon in README + src/ returns 0 matches</check>
    <check type="test">Grep for raw HTTP status strings as primary error UI returns 0 matches</check>
    <check type="manual">Read README aloud; confirm it makes you want to run the command immediately</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-6" reason="Needs create command strings to audit" />
    <depends-on task-id="phase-1-task-7" reason="Needs deploy strings to audit" />
  </dependencies>

  <commit-message>docs: plainspoken README and CLI voice audit — zero IBM sentences</commit-message>
</task-plan>
```

### Wave 4 — After Wave 3

```xml
<task-plan id="phase-1-task-9" wave="4">
  <title>End-to-end integration test and 60-second path verification</title>
  <requirement>ANV-010: 60-second grin path</requirement>
  <description>
    Run the full Anvil pipeline end-to-end: scaffold a worker, typecheck the generated code,
    run a dry-run deploy, and measure the time from command to "ready to deploy." Fix any
    friction that pushes the experience over 60 seconds. This is the grin test.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md" reason="60-second target experience and 100-concurrent-stream production metric" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="ANV-010 acceptance criteria" />
    <file path="projects/github-issue-sethshoultes-shipyard-ai-86/build/anvil/src/commands/create.ts" reason="Create command to exercise end-to-end" />
    <file path="projects/github-issue-sethshoultes-shipyard-ai-86/build/anvil/src/utils/deploy.ts" reason="Deploy wrapper to verify dry-run" />
  </context>

  <steps>
    <step order="1">In a clean temp directory, run `time node /path/to/bin/anvil create --llm --name e2e-test`</step>
    <step order="2">Verify the output directory `e2e-test/` contains exactly 3 files: `index.ts`, `wrangler.toml`, `package.json`</step>
    <step order="3">Run `cd e2e-test && npm install` and measure time</step>
    <step order="4">Run `cd e2e-test && npx tsc --noEmit --skipLibCheck index.ts` and verify TypeScript compiles with zero errors</step>
    <step order="5">Run `cd e2e-test && npx wrangler deploy --dry-run` and verify dry-run succeeds</step>
    <step order="6">Sum the times from steps 1-5. If total > 60 seconds, identify the bottleneck and file a fix task (or fix inline if trivial)</step>
    <step order="7">Inspect generated `index.ts` to confirm it contains `stream: true`, health check, and no banned patterns</step>
    <step order="8">Inspect generated `wrangler.toml` to confirm it is minimal and valid</step>
    <step order="9">Write a script `scripts/e2e-smoke.sh` that automates steps 1-5 for CI</step>
    <step order="10">Add a GitHub Actions workflow `.github/workflows/ci.yml` that runs `npm run build`, `npm run test`, and `scripts/e2e-smoke.sh`</step>
    <step order="11">Run the full CI pipeline locally and confirm green</step>
  </steps>

  <verification>
    <check type="build">npm run build passes</check>
    <check type="test">npm run test passes (all unit tests green)</check>
    <check type="test">scripts/e2e-smoke.sh passes and completes in <60 seconds on a warm cache</check>
    <check type="test">Generated worker TypeScript compiles with zero errors</check>
    <check type="manual">Run the command yourself. Does it make you grin? If not, fix the friction.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project must be fully built" />
    <depends-on task-id="phase-1-task-2" reason="Spec fetcher must work live" />
    <depends-on task-id="phase-1-task-3" reason="GitHub template must be valid" />
    <depends-on task-id="phase-1-task-4" reason="Worker generator must emit valid code" />
    <depends-on task-id="phase-1-task-5" reason="Wrangler generator must emit valid config" />
    <depends-on task-id="phase-1-task-6" reason="Create command must orchestrate correctly" />
    <depends-on task-id="phase-1-task-7" reason="Deploy wrapper must handle dry-run" />
    <depends-on task-id="phase-1-task-8" reason="README and voice polish must be in place" />
  </dependencies>

  <commit-message>test(e2e): verify 60-second path and add CI smoke test</commit-message>
</task-plan>
```

---

## Risk Notes

### High-Risk Items from Hindsight

1. **Spec Drift / Generation Failure** (Likelihood: Medium, Impact: High)
   - The live Cloudflare Workers AI OpenAPI spec may change model names, bindings, or response shapes.
   - **Mitigation**: Task 1.2 (spec fetcher) includes version-aware parsing and loud failure. Task 4.1 (E2E test) runs a daily smoke test that fails CI if the generator output doesn't compile or dry-run cleanly. No static fallback templates are permitted.

2. **`npm install` / `wrangler auth` Drop-off** (Likelihood: High, Impact: High)
   - First-time users hit `wrangler login` and lose the grin.
   - **Mitigation**: Task 1.3 (GitHub template) provides a zero-install bypass. Task 3.2 (deploy wrapper) replaces raw Wrangler auth errors with plainspoken hand-holding.

3. **Scope Creep into Framework Territory** (Likelihood: High, Impact: Medium)
   - The original PRD mentions "rate limiting, caching, streaming, and monitoring built in." Decisions explicitly CUT these.
   - **Mitigation**: Every task plan references the CUT list. Any feature request outside ANV-001 through ANV-010 must be rejected or deferred.

4. **Demo-Quality Product** (Likelihood: Medium, Impact: High)
   - Optimizing for HN upvotes instead of daily use kills retention.
   - **Mitigation**: Task 4.1 is literally "the grin test." If the 60-second path doesn't produce delight, the plan is not complete.

### Low-Risk Items

5. **Name/Brand Dilution** (Likelihood: Low, Impact: Medium)
   - Already locked as "Anvil" in decisions.md §1. Task 1.1 and Task 3.3 enforce the name and voice.

6. **Template Rot via Static Fallbacks** (Likelihood: Low, Impact: High)
   - Locked decision #3 forbids static templates. Task 1.2 and Task 2.1 enforce dynamic-only generation.

### Hindsight-File Intersection
- **None**. This is a greenfield build in a new workspace. The high-churn files (`.planning/phase-1-plan.md`, `.planning/REQUIREMENTS.md`) are expected to be overwritten for each active project.
- Agents should **not** touch `plugins/membership/src/sandbox-entry.ts` or `plugins/eventdash/src/sandbox-entry.ts` — these are unrelated Emdash plugins with their own maintenance cycles.

---

## Execution Notes

- **Build workspace**: `projects/github-issue-sethshoultes-shipyard-ai-86/build/anvil/`
- **Token budget**: Per CLAUDE.md, this is a "Plugin"-sized build (500K tokens base). Debate + Plan should use ≤10% (50K). Build gets 60% (300K). Review + Deploy get 20% (100K). Reserve 10% (50K).
- **Model for sub-agents**: Haiku (as per CLAUDE.md, all sub-agents run on haiku).
- **Quality gate**: Margaret Hamilton (QA) must approve before merge to main. No exceptions.
- **Branch**: `feature/anvil-v1` → PR → `main`.

---

*End of Phase 1 Plan*
