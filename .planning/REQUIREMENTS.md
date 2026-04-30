# Requirements Traceability Matrix
# Anvil — Cloudflare Workers AI Template Generator (v1 MVP)

**Generated**: 2026-04-30
**Source Documents**:
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-86.md` (PRIMARY — dream candidate PRD)
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md` (LOCKED — overrides PRD where in conflict)

**Project Slug**: `github-issue-sethshoultes-shipyard-ai-86`
**Product Name**: Anvil (locked per decisions.md §1)
**Total Requirements**: 10
**Status**: Phase 1 — v1 MVP Build

---

## CRITICAL: This is NOT an Emdash Project

**Platform**: Node.js CLI tool distributed via npm
**Technology**: TypeScript, Wrangler CLI, Cloudflare Workers AI
**Architecture**: CLI scaffolds standalone Cloudflare Workers projects; no CMS integration

Anvil is a completely separate product from the Emdash CMS ecosystem. It generates production-ready Cloudflare Workers AI inference endpoints. Agents must NOT apply Emdash plugin patterns, sandbox rules, or Astro conventions to this build. The only shared surface is Cloudflare Workers deployment (wrangler).

---

## Requirements Summary

| ID | Requirement | Priority | Source | Kill Switch |
|----|-------------|----------|--------|-------------|
| ANV-001 | Single-command LLM worker scaffolding: `npx anvil create --llm` | P0 | decisions.md §MVP #1 | **Non-negotiable** |
| ANV-002 | Dynamic code generation from live Cloudflare Workers AI OpenAPI spec (fetch at scaffold time, parse default LLM model + bindings) | P0 | decisions.md §MVP #2, §3 | **Non-negotiable** |
| ANV-003 | One generated `index.ts` — streaming inference handler (WebSocket/text streaming), no blocking/batch mode | P0 | decisions.md §MVP #3, §CUT | **Non-negotiable** |
| ANV-004 | One generated `wrangler.toml` — model binding, minimal config, no hand-tuning required | P0 | decisions.md §MVP #4 | **Non-negotiable** |
| ANV-005 | Wrangler deploy integration — one keystroke from generated code to live worker | P0 | decisions.md §MVP #5 | **Non-negotiable** |
| ANV-006 | Zero-install onboarding path — GitHub template + "Deploy to Workers" button for first-timers | P0 | decisions.md §MVP #6 | **Non-negotiable** |
| ANV-007 | Streaming-only responses — no blocking/batch mode, no multimodal | P0 | decisions.md §MVP #7, §CUT | **Non-negotiable** |
| ANV-008 | One default LLM model — convention over configuration; no model picker | P0 | decisions.md §MVP #8 | **Non-negotiable** |
| ANV-009 | Plainspoken CLI output and error messages — human voice, no stack traces as UI | P0 | decisions.md §MVP #9, §4 | **Non-negotiable** |
| ANV-010 | Target experience: 60 seconds from command to first streaming response that makes the user grin | P0 | decisions.md §MVP #10 | **Non-negotiable** |

---

## Atomic Requirements

### ANV-001: Single-Command LLM Worker Scaffolding
**Type**: CLI Interface
**Priority**: P0
**Scope**: `npx anvil create --llm` command with argument parsing, project directory creation, and generator invocation.

#### Acceptance Criteria
- [ ] `anvil create --llm` is recognized as a valid command
- [ ] Command accepts optional `--name <project-name>` argument (defaults to `anvil-worker`)
- [ ] Command creates a new directory with the project name
- [ ] Command invokes the generator pipeline and writes files into the new directory
- [ ] Command exits 0 on success, non-zero on failure with plainspoken error
- [ ] `--help` flag prints concise, human usage instructions

#### Verification
```bash
node bin/anvil create --llm --name test-worker
# Expected: Directory test-worker/ created with index.ts and wrangler.toml
```

---

### ANV-002: Dynamic Code Generation from Live Cloudflare Spec
**Type**: Code Generation — Runtime Spec Fetching
**Priority**: P0
**Scope**: Fetch and parse Cloudflare Workers AI OpenAPI spec at scaffold time; extract available models, bindings, and required configuration.

#### Acceptance Criteria
- [ ] Fetches live Cloudflare Workers AI OpenAPI spec over HTTPS at scaffold time
- [ ] Parses spec to extract available text-generation LLM models
- [ ] Identifies required Wrangler bindings (e.g., `AI` binding for Workers AI)
- [ ] Gracefully handles network failure: plainspoken error, no crash
- [ ] Never uses bundled static templates as fallback (locked decision #3)
- [ ] Spec parser is version-aware and can handle spec drift

#### Verification
```bash
node -e "const { fetchSpec } = require('./dist/generators/spec.js'); fetchSpec().then(s => console.log(s.models.length, 'models found'))"
# Expected: >0 models found, no exceptions
```

---

### ANV-003: Streaming Inference Handler Generator
**Type**: Code Generation — Worker Entry Point
**Priority**: P0
**Scope**: Generate a single `index.ts` that implements a streaming LLM inference handler using the Cloudflare Workers AI binding.

#### Acceptance Criteria
- [ ] Generated `index.ts` exports a default fetch handler
- [ ] Handler accepts POST requests with JSON body: `{ messages: Array<{role, content}> }`
- [ ] Handler calls `env.AI.run(model, { messages, stream: true })`
- [ ] Response streams back as `text/event-stream` (Server-Sent Events)
- [ ] No blocking/batch mode code paths exist in generated file
- [ ] No multimodal (image/audio) logic exists in generated file
- [ ] Generated file is TypeScript with proper types for `Env` binding
- [ ] Generated file includes a simple health check GET `/`

#### Verification
```bash
grep -c "stream.*true" test-worker/index.ts
# Expected: >=1
grep -c "batch\|multimodal\|image\|audio" test-worker/index.ts
# Expected: 0
```

---

### ANV-004: Wrangler Config Generator
**Type**: Code Generation — Deployment Config
**Priority**: P0
**Scope**: Generate a minimal `wrangler.toml` with the AI binding pre-configured for the selected default model.

#### Acceptance Criteria
- [ ] Generated `wrangler.toml` has `name` matching the project name
- [ ] Generated `wrangler.toml` includes `compatibility_date` (current date)
- [ ] Generated `wrangler.toml` includes `ai` binding with `binding = "AI"`
- [ ] No hand-tuning required — deploy works with `wrangler deploy` immediately after generation
- [ ] File is valid TOML (parses with any standard TOML parser)
- [ ] No extraneous fields or commented-out boilerplate

#### Verification
```bash
npx wrangler deploy --dry-run test-worker/wrangler.toml
# Expected: Dry run succeeds, no config errors
```

---

### ANV-005: Wrangler Deploy Integration
**Type**: CLI Utility
**Priority**: P0
**Scope**: Wrap `wrangler deploy` with plainspoken output, auth edge-case handling, and success confirmation.

#### Acceptance Criteria
- [ ] `anvil create --llm` optionally runs `wrangler deploy` after generation (prompt or `--deploy` flag)
- [ ] Deploy wrapper detects missing `wrangler auth` and prints helpful next steps (not raw wrangler errors)
- [ ] Deploy wrapper prints plainspoken progress messages
- [ ] On success, prints the deployed Worker URL
- [ ] On failure, prints actionable error message in human voice
- [ ] Deploy step is skippable (user can deploy manually later)

#### Verification
```bash
node bin/anvil create --llm --name test-deploy --deploy
# Expected: Either deploys successfully or prints friendly auth guidance
```

---

### ANV-006: Zero-Install GitHub Template
**Type**: Onboarding Artifact
**Priority**: P0
**Scope**: Provide a GitHub repository template with a "Deploy to Workers" button for users who skip the CLI.

#### Acceptance Criteria
- [ ] `github-template/` directory contains a minimal Worker project skeleton
- [ ] Template includes `src/index.ts` bootstrap placeholder (replaced by generator, but valid as-is)
- [ ] Template includes base `wrangler.toml` with AI binding
- [ ] Template includes `package.json` with minimal dependencies (`wrangler`, `@cloudflare/workers-types`)
- [ ] Template `README.md` includes a "Deploy to Workers" button linking to Cloudflare deploy flow
- [ ] Template README describes the 10-second zero-install path
- [ ] Template is valid and deploys a basic "Hello, Anvil" response before generator runs

#### Verification
```bash
cd github-template && npm install && npx wrangler deploy --dry-run
# Expected: Dry run succeeds
```

---

### ANV-007: Streaming-Only Contract
**Type**: Design Constraint
**Priority**: P0
**Scope**: Enforce streaming-only responses across all generated code and CLI UX.

#### Acceptance Criteria
- [ ] Generated `index.ts` only implements streaming responses
- [ ] CLI help text and README prominently mention "streaming-only"
- [ ] No flags or options exist to enable batch/blocking mode
- [ ] No code comments suggest future multimodal support

#### Verification
```bash
grep -ri "blocking\|batch" projects/github-issue-sethshoultes-shipyard-ai-86/build/src/
# Expected: 0 matches (except in this document)
```

---

### ANV-008: One Default LLM Model
**Type**: Design Constraint — Model Selection
**Priority**: P0
**Scope**: Automatically select the best default text-generation model from the live Cloudflare spec; no user configuration.

#### Acceptance Criteria
- [ ] Default model selection runs automatically during scaffolding
- [ ] Selection logic picks highest-version text-generation model available at scaffold time
- [ ] Selected model name is baked into generated `index.ts`
- [ ] No `--model` flag exists in v1
- [ ] If no text-generation models are found, CLI fails loudly with plainspoken error

#### Verification
```bash
node -e "const { selectDefaultModel } = require('./dist/generators/spec.js'); console.log(selectDefaultModel([{name:'@cf/meta/llama-2-7b-chat-int8', task:'text-generation'}, {name:'@cf/openai/whisper', task:'speech-recognition'}]))"
# Expected: @cf/meta/llama-2-7b-chat-int8
```

---

### ANV-009: Plainspoken CLI Voice
**Type**: UX — Brand Voice
**Priority**: P0
**Scope**: All CLI output and error messages use a plainspoken, human voice with zero corporate jargon.

#### Acceptance Criteria
- [ ] No error message contains a raw stack trace as primary UI
- [ ] No sentence sounds like it could live on an IBM landing page
- [ ] Success messages make the user grin (or at least smile)
- [ ] Auth errors explain what to do next, not just "401 Unauthorized"
- [ ] Progress messages feel like a friend helping, not a server logging

#### Verification
```bash
grep -ri "unauthorized\|bad request\|internal server error\|please contact your administrator" projects/github-issue-sethshoultes-shipyard-ai-86/build/src/
# Expected: 0 matches
```

---

### ANV-010: 60-Second Grin Path
**Type**: Experience Metric
**Priority**: P0
**Scope**: From running `npx anvil create --llm` to seeing the first streaming response must take <60 seconds for a user with Wrangler already authenticated.

#### Acceptance Criteria
- [ ] Scaffolding completes in <5 seconds
- [ ] `wrangler deploy` completes in <45 seconds (typical)
- [ ] First `curl` to the deployed Worker returns a streaming response in <10 seconds
- [ ] Total time from command to first streamed token is <60 seconds
- [ ] If auth is missing, the auth flow + deploy + first request must still complete in <2 minutes

#### Verification
```bash
time (node bin/anvil create --llm --name speed-test --deploy && curl -N -X POST https://speed-test.<subdomain>.workers.dev -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hi"}]}')
# Expected: real < 60s
```

---

## Explicitly CUT from v1

Per locked decisions.md §CUT, these are **out of scope** for Phase 1:

| Feature | Rationale |
|---------|-----------|
| Rate limiting | Separate product; would turn v1 into a framework |
| Caching | Separate product; scope creep |
| Monitoring | Separate product; scope creep |
| Image and audio models | Locked decision #2: "image and audio models are V2 masquerading as V1" |
| Multi-cloud support (AWS/GCP/Azure) | Locked decision #4: "no multi-cloud support" |
| Dashboards, web UI, 47 CLI flags | Locked decision #4: "no config hell" |
| Model picker / multimodal logic | Locked decision #2: "One LLM template, streaming only" |
| Static/cookiecutter hand-written templates | Locked decision #3: "zero hand-written templates" |

---

## Technical Context (Verified)

### Architecture Lock
- **Platform**: Node.js CLI tool, NOT Emdash/Cloudflare per decisions.md §2, §4
- **Runtime**: Node.js 22+ (TypeScript compiled to CJS/ESM hybrid for `npx` compatibility)
- **Deployment target**: Cloudflare Workers (generated artifact)
- **Generated artifact**: Single Worker project with 3 files max (`index.ts`, `wrangler.toml`, `package.json`)

### Cloudflare Workers AI Streaming API (docs/EMDASH-GUIDE.md §5)
The generated worker uses the `AI` binding:
```ts
const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
  messages: [{ role: "user", content: "Hello" }],
  stream: true,
});
```
The `stream: true` option returns a `ReadableStream` that must be forwarded with `Content-Type: text/event-stream`.

### Design Rule (Locked)
`index.ts` and `wrangler.toml` only. If a third file is required, the generator is wrong.

---

## Risk Register & Hindsight Integration

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Spec drift / Generation failure** | Medium | High | Version-pin spec parser; add smoke test that fails CI if generator output doesn't `wrangler deploy --dry-run` cleanly. |
| **`npm install` / `wrangler auth` drop-off** | High | High | Zero-install button must work flawlessly; CLI auth flow needs explicit hand-holding (not raw wrangler errors). |
| **Scope creep into framework territory** | High | Medium | Reject any feature that doesn't serve the 60-second grin. Steve's "Say NO" list is law. |
| **Template rot via static fallbacks** | Low | High | **Never hand-write a template.** If dynamic generator fails, fail loudly. |
| **Demo-quality product** | Medium | High | Optimizing for HN upvotes instead of daily use kills retention. |
| **100 concurrent stream ceiling** | Medium | High | Load test the generated output before tagging v1. |
| **Name/brand dilution** | Low | Medium | Ship as Anvil, voice locked, no IBM sentences. |

### Hindsight-Flagged Files
The following files from `.great-minds/hindsight-report.md` have high churn or bug associations. **None directly intersect with this greenfield build**, but agents should avoid editing these:
- `.daemon-queue.json` (113 changes) — agency orchestration; do not touch
- `.planning/phase-1-plan.md` (49 changes) — this file; high churn is expected
- `plugins/membership/src/sandbox-entry.ts` (33 changes) — unrelated Emdash plugin
- `plugins/eventdash/src/sandbox-entry.ts` (28 changes) — unrelated Emdash plugin
- `STATUS.md` (11 changes) — agency state; update only if required by pipeline

### Uncommitted State
```
M .github-intake-state.json
?? prds/github-issue-sethshoultes-shipyard-ai-86.md
?? rounds/github-issue-sethshoultes-shipyard-ai-86/
```
The untracked PRD and decisions are our input documents. No conflicts expected.

---

## Decision Log Extracts

| Decision | Resolution | Rationale |
|----------|----------|-----------|
| Name | Anvil | Essence.md: "One word. Strike once." Two syllables, hard consonant, precision and permanence. |
| One LLM template, streaming only | Locked | Elon's cut accepted. Keeps build to a single session. |
| Dynamic generation from Cloudflare spec | Locked | Steve conceded: "hand-written templates rot — generate from Cloudflare's spec dynamically." |
| Brand voice | Plainspoken, human, zero corporate jargon | Steve's design philosophy locked. "If a sentence sounds like it could live on an IBM landing page, delete it." |
| The "grin" moment | Core metric | Time-to-magic beats time-to-deploy if the deploy feels like filing taxes. |
| Production metric | 100 concurrent streaming requests, stable | Elon's metric replaces "production-ready" marketing fluff. |
| Convention over configuration | One way to deploy, one model | Steve's philosophy = engineering necessity. |

---

## Reference Files

- PRD: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-86.md`
- Decisions: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-86/decisions.md`
- Emdash Guide (Cloudflare deployment section only): `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` §5
- Hindsight: `/home/agent/shipyard-ai/.great-minds/hindsight-report.md`

---

*End of Requirements Traceability Matrix*
