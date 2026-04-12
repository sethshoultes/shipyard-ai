# Phase 1 Plan — Tuned (Prompt Version Control)

**Generated**: April 12, 2026
**Project Slug**: promptops
**Product Name**: Tuned (formerly PromptOps)
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 14
**Waves**: 4
**Status**: READY FOR BUILD
**Time Budget**: 7 hours

---

## The Essence

> **What it's really about:** Closing the gap between knowing AI is powerful and knowing how to wield it.

> **The feeling:** Competence. The relief of finally understanding what you're saying.

> **The one thing that must be perfect:** First touch — value before effort, in under 60 seconds.

> **Creative direction:** Instrument, not control panel.

---

## Build Status

**Technical MVP:** 0% (greenfield build)
**Board Verdict:** LOCKED (Steve + Elon convergence complete)
**Current State:** Debate complete, ready for build

### Locked Decisions

| Decision | Winner | Rationale |
|----------|--------|-----------|
| Product Name: **Tuned** | Steve Jobs | "PromptOps sounds like IT middleware. Tuned is one word, musical, works as verb and noun." |
| Architecture: **SDK-Only, No Proxy** | Elon Musk | Proxy adds 15-80ms latency — commercial suicide. Zero latency impact. |
| Time Constraint: **7 Hours** | Elon Musk | If it can't be built in 7 hours, it's cut. |
| CLI Is The Product | Elon Musk | `tuned push` must work in <60 seconds from install. |
| Dashboard: **Static HTML** | Elon Musk | No React, no build process, read-only. |
| Brand Voice: **Direct, Confident** | Steve Jobs | "This prompt has a problem. Here's the fix." |
| Pricing: **One Tier** | Steve Jobs | No feature walls, full product at one price. |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-025, REQ-026, REQ-028: D1 Schema | phase-1-task-1 | 1 |
| REQ-027, REQ-030: KV + Worker Config | phase-1-task-2 | 1 |
| REQ-029, REQ-032: Config + API Key Strategy | phase-1-task-3 | 1 |
| REQ-007, REQ-008: CRUD Prompts/Versions | phase-1-task-4 | 2 |
| REQ-009, REQ-010: KV Read + Sync | phase-1-task-5 | 2 |
| REQ-011, REQ-031: Async Logging | phase-1-task-6 | 2 |
| REQ-001: tuned init | phase-1-task-7 | 3 |
| REQ-002: tuned push | phase-1-task-8 | 3 |
| REQ-003: tuned list | phase-1-task-9 | 3 |
| REQ-004: tuned rollback | phase-1-task-10 | 3 |
| REQ-015, REQ-016, REQ-017, REQ-019: SDK | phase-1-task-11 | 3 |
| REQ-020, REQ-021, REQ-022, REQ-023, REQ-024: Dashboard | phase-1-task-12 | 4 |
| REQ-006: Quickstart Docs | phase-1-task-13 | 4 |
| Sara Blakely customer gut-check | phase-1-task-14 | 4 |

---

## Documentation References

This plan cites specific sections from the source documents:

- **decisions.md**: MVP Feature Set, File Structure, Database Schema
- **decisions.md Section VII**: Build Phase Priorities (7-hour breakdown)
- **docs/EMDASH-GUIDE.md Section 5**: Cloudflare deployment (D1, R2, wrangler.toml)
- **Codebase patterns**: /workers/wardrobe-analytics/ (D1 binding), /workers/contact-form/ (CORS), /memory-store/ (CLI)

---

## Wave Execution Order

### Wave 1 (Parallel) — Infrastructure Foundation

Three independent tasks setting up database, KV, and configuration. **Time budget: 1.5 hours**

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create D1 database schema</title>
  <requirement>REQ-025: Prompts Table, REQ-026: Versions Table, REQ-028: D1 Creation</requirement>
  <description>
    Per decisions.md File Structure and Database Schema sections:
    Create D1 database with prompts and versions tables.

    Schema from decisions.md:
    - prompts: id (TEXT PK), name (TEXT UNIQUE), created_at, updated_at
    - versions: id (TEXT PK), prompt_id (FK), version (INT), content (TEXT), is_active (BOOL), created_at

    Reference: /workers/wardrobe-analytics/schema.sql for D1 pattern
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/wardrobe-analytics/schema.sql" reason="D1 schema pattern" />
    <file path="/home/agent/shipyard-ai/workers/wardrobe-analytics/wrangler.toml" reason="D1 binding config" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: D1 deployment" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Database Schema section" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/projects/tuned/worker/ directory structure</step>
    <step order="2">Create schema.sql with prompts table: id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP</step>
    <step order="3">Add versions table: id TEXT PRIMARY KEY, prompt_id TEXT REFERENCES prompts(id), version INTEGER NOT NULL, content TEXT NOT NULL, is_active BOOLEAN DEFAULT false, created_at DATETIME DEFAULT CURRENT_TIMESTAMP</step>
    <step order="4">Add index on versions(prompt_id, version) for efficient lookups</step>
    <step order="5">Add index on versions(is_active) for finding active versions</step>
    <step order="6">Create wrangler.toml with D1 database binding (binding: DB)</step>
    <step order="7">Add KV namespace binding placeholder (binding: PROMPTS_KV)</step>
    <step order="8">Set compatibility_date and compatibility_flags per docs/EMDASH-GUIDE.md</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/schema.sql && echo "schema exists"</check>
    <check type="bash">grep "prompts" /home/agent/shipyard-ai/projects/tuned/worker/schema.sql</check>
    <check type="bash">grep "versions" /home/agent/shipyard-ai/projects/tuned/worker/schema.sql</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/wrangler.toml && echo "wrangler exists"</check>
    <check type="test">Both tables defined with correct columns</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(tuned): create D1 database schema

Per decisions.md Database Schema section:
- prompts table with name uniqueness
- versions table with FK to prompts
- is_active flag for version selection
- Indexes for efficient queries
- wrangler.toml with D1 binding

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Configure Edge KV namespace and Worker entry</title>
  <requirement>REQ-027: KV Schema, REQ-030: Worker Env, REQ-012: Worker Config</requirement>
  <description>
    Per decisions.md Edge KV Structure:
    Key format: prompt:{name}
    Value: { version: number, content: string }

    Create Worker entry point with routing skeleton.
    Reference: /workers/prd-chat/src/index.ts for routing pattern
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/prd-chat/src/index.ts" reason="Worker routing pattern" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="CORS and validation pattern" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Edge KV Structure section" />
  </context>

  <steps>
    <step order="1">Update wrangler.toml to add KV namespace binding: [[kv_namespaces]] binding = "PROMPTS_KV"</step>
    <step order="2">Create src/index.ts with Env interface: DB (D1Database), PROMPTS_KV (KVNamespace)</step>
    <step order="3">Add fetch handler with URL routing using new URL(request.url)</step>
    <step order="4">Add route stubs: /api/prompts, /api/versions, /kv/prompt/:name, /log</step>
    <step order="5">Add CORS helper function following /workers/contact-form pattern</step>
    <step order="6">Add OPTIONS handler for preflight requests</step>
    <step order="7">Create src/lib/kv.ts with helpers: getActivePrompt(name), setActivePrompt(name, version, content)</step>
    <step order="8">KV key format: prompt:{name}, value JSON: {version, content}</step>
    <step order="9">Create tsconfig.json with ES2020 target, strict mode, @cloudflare/workers-types</step>
    <step order="10">Create package.json with wrangler, typescript, @cloudflare/workers-types</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/index.ts && echo "entry exists"</check>
    <check type="bash">grep "PROMPTS_KV" /home/agent/shipyard-ai/projects/tuned/worker/wrangler.toml</check>
    <check type="bash">grep "kv_namespaces" /home/agent/shipyard-ai/projects/tuned/worker/wrangler.toml</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/lib/kv.ts && echo "kv helpers exist"</check>
    <check type="test">Worker skeleton compiles without errors</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(tuned): configure Edge KV and Worker entry

Per decisions.md Edge KV Structure:
- KV namespace binding: PROMPTS_KV
- Key format: prompt:{name}
- Value: {version, content} JSON
- Worker routing skeleton
- CORS support for CLI/SDK access

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Define API key strategy and local config format</title>
  <requirement>REQ-029: Local Config, REQ-032: API Key Strategy</requirement>
  <description>
    Per decisions.md Open Questions - resolved with recommendations:
    - API key strategy: Project-level key generated on init
    - Config location: .tuned.json in project root

    Create config handling for CLI and auth middleware for Worker.
    Reference: /memory-store/src/store.ts for config patterns
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/memory-store/src/store.ts" reason="Config handling pattern" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Open Questions section" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/projects/tuned/cli/ directory structure</step>
    <step order="2">Create cli/src/config.ts with TunedConfig interface: projectId, apiKey, backendUrl</step>
    <step order="3">Add loadConfig(): reads .tuned.json from cwd, returns TunedConfig or null</step>
    <step order="4">Add saveConfig(config): writes .tuned.json to cwd</step>
    <step order="5">Add configExists(): checks if .tuned.json exists in cwd</step>
    <step order="6">Create worker/src/lib/auth.ts with validateApiKey(key, env) function</step>
    <step order="7">API key validation: simple Bearer token check for MVP (projects table gets api_key column later)</step>
    <step order="8">Create worker/src/lib/auth.ts middleware pattern: check Authorization header</step>
    <step order="9">Return 401 if no key, 403 if invalid key</step>
    <step order="10">Document config format in comments: { projectId: "uuid", apiKey: "tuned_...", backendUrl: "https://..." }</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/src/config.ts && echo "config module exists"</check>
    <check type="bash">grep "loadConfig" /home/agent/shipyard-ai/projects/tuned/cli/src/config.ts</check>
    <check type="bash">grep "saveConfig" /home/agent/shipyard-ai/projects/tuned/cli/src/config.ts</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/lib/auth.ts && echo "auth module exists"</check>
    <check type="test">Config and auth modules have correct exports</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(tuned): define API key strategy and config format

Per decisions.md Open Questions (resolved):
- API key: Project-level, generated on init
- Config: .tuned.json in project root
- Format: {projectId, apiKey, backendUrl}
- Auth middleware for Worker API

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Worker API Implementation

Three tasks implementing the API layer. **Time budget: 1.5 hours**

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Implement CRUD endpoints for prompts and versions</title>
  <requirement>REQ-007: CRUD Prompts, REQ-008: CRUD Versions</requirement>
  <description>
    Per decisions.md API section:
    - CRUD operations for prompts and versions
    - D1 for writes and dashboard reads
    - Auto-versioning on push

    Reference: /workers/wardrobe-analytics for D1 prepared statements
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/src/index.ts" reason="Add routes here" />
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/schema.sql" reason="Table structure" />
    <file path="/home/agent/shipyard-ai/workers/wardrobe-analytics/src/index.ts" reason="D1 query pattern" />
  </context>

  <steps>
    <step order="1">Create worker/src/routes/prompts.ts</step>
    <step order="2">Implement POST /api/prompts: create new prompt with uuid, name, timestamps</step>
    <step order="3">Implement GET /api/prompts: list all prompts (for dashboard)</step>
    <step order="4">Implement GET /api/prompts/:name: get prompt by name with active version</step>
    <step order="5">Create worker/src/routes/versions.ts</step>
    <step order="6">Implement POST /api/prompts/:name/versions: create version with auto-increment</step>
    <step order="7">Auto-increment: SELECT MAX(version) FROM versions WHERE prompt_id = ?, then +1</step>
    <step order="8">Set is_active = false on all existing versions, is_active = true on new version</step>
    <step order="9">Implement GET /api/prompts/:name/versions: list all versions for prompt</step>
    <step order="10">Implement PUT /api/prompts/:name/versions/:version/activate: set version as active (for rollback)</step>
    <step order="11">Add auth middleware check to all write endpoints</step>
    <step order="12">Wire routes into index.ts fetch handler</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/routes/prompts.ts && echo "prompts route exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/routes/versions.ts && echo "versions route exists"</check>
    <check type="bash">grep "POST" /home/agent/shipyard-ai/projects/tuned/worker/src/routes/prompts.ts</check>
    <check type="bash">grep "auto-increment\|MAX(version)" /home/agent/shipyard-ai/projects/tuned/worker/src/routes/versions.ts</check>
    <check type="test">CRUD operations use D1 prepared statements</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="D1 schema must exist" />
    <depends-on task-id="phase-1-task-2" reason="Worker entry and routing must exist" />
    <depends-on task-id="phase-1-task-3" reason="Auth middleware must exist" />
  </dependencies>

  <commit-message>feat(tuned): implement CRUD endpoints for prompts/versions

Per decisions.md API section:
- POST/GET prompts endpoints
- POST/GET versions endpoints
- Auto-versioning (MAX(version) + 1)
- is_active flag management
- Auth middleware on write operations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Implement KV read endpoint and active version sync</title>
  <requirement>REQ-009: KV Read Endpoint, REQ-010: Active Version Sync</requirement>
  <description>
    Per decisions.md:
    - Edge KV for active prompt reads (<5ms latency)
    - Sync active version to KV on push/rollback

    This is the critical path for SDK reads - must be fast.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/src/lib/kv.ts" reason="KV helpers" />
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/src/routes/versions.ts" reason="Integrate sync" />
  </context>

  <steps>
    <step order="1">Create worker/src/routes/kv.ts for KV read endpoint</step>
    <step order="2">Implement GET /kv/prompt/:name: read from KV, return {version, content}</step>
    <step order="3">Return 404 if key not found: { error: "Prompt not found" }</step>
    <step order="4">No auth required for KV read (SDK must read without auth token per design)</step>
    <step order="5">Update versions.ts POST handler: after D1 write, call setActivePrompt(name, version, content)</step>
    <step order="6">Update versions.ts PUT activate handler: after D1 update, sync to KV</step>
    <step order="7">KV sync is fire-and-forget (waitUntil pattern) to not block response</step>
    <step order="8">Add error logging if KV sync fails (but don't fail the request)</step>
    <step order="9">Wire /kv/prompt/:name route into index.ts</step>
    <step order="10">Test KV read latency target: <5ms (document in comments)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/routes/kv.ts && echo "kv route exists"</check>
    <check type="bash">grep "setActivePrompt" /home/agent/shipyard-ai/projects/tuned/worker/src/routes/versions.ts</check>
    <check type="bash">grep "waitUntil\|fire-and-forget" /home/agent/shipyard-ai/projects/tuned/worker/src/routes/versions.ts</check>
    <check type="test">KV sync happens after D1 write</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="D1 schema for version data" />
    <depends-on task-id="phase-1-task-2" reason="KV namespace and helpers" />
  </dependencies>

  <commit-message>feat(tuned): implement KV read and active version sync

Per decisions.md latency requirements:
- GET /kv/prompt/:name for SDK reads
- <5ms target latency
- Fire-and-forget sync on version create/activate
- No auth on KV read (SDK design)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Implement async logging endpoint</title>
  <requirement>REQ-011: Async Logging, REQ-031: Logging Backend</requirement>
  <description>
    Per decisions.md Open Questions (resolved):
    - Use Cloudflare Analytics Engine for volume writes
    - D1 cannot handle 1000+ writes/day at scale
    - Logging is fire-and-forget, never blocks prompt delivery

    Reference: /workers/wardrobe-analytics for fire-and-forget pattern
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/wardrobe-analytics/src/index.ts" reason="Fire-and-forget pattern" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Logging Backend question" />
  </context>

  <steps>
    <step order="1">Create worker/src/routes/log.ts</step>
    <step order="2">Implement POST /log: accept log event payload</step>
    <step order="3">Log event schema: { promptName, version, timestamp, event: "read"|"error" }</step>
    <step order="4">Return 200 immediately (fire-and-forget)</step>
    <step order="5">Use ctx.waitUntil to process log async</step>
    <step order="6">For MVP: console.log the event (Analytics Engine integration in v1.1)</step>
    <step order="7">Add Analytics Engine binding placeholder in wrangler.toml (commented)</step>
    <step order="8">Document Analytics Engine migration path in comments</step>
    <step order="9">Wire /log route into index.ts</step>
    <step order="10">No auth on /log endpoint (SDK sends logs without blocking)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/worker/src/routes/log.ts && echo "log route exists"</check>
    <check type="bash">grep "waitUntil" /home/agent/shipyard-ai/projects/tuned/worker/src/routes/log.ts</check>
    <check type="bash">grep "fire-and-forget\|Analytics Engine" /home/agent/shipyard-ai/projects/tuned/worker/src/routes/log.ts</check>
    <check type="test">Logging does not block response</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Worker entry and routing" />
  </dependencies>

  <commit-message>feat(tuned): implement async logging endpoint

Per decisions.md logging requirements:
- POST /log for SDK telemetry
- Fire-and-forget via waitUntil
- Console.log for MVP (Analytics Engine in v1.1)
- Never blocks prompt delivery

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — CLI and SDK Implementation

Five tasks implementing CLI commands and SDK. **Time budget: 2.5 hours**

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Implement tuned init command</title>
  <requirement>REQ-001: tuned init</requirement>
  <description>
    Per decisions.md CLI Commands:
    - Initialize project, create config
    - Must complete in <60 seconds
    - Generate project-level API key

    Reference: /memory-store/src/cli.ts for commander.js pattern
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/memory-store/src/cli.ts" reason="Commander.js CLI pattern" />
    <file path="/home/agent/shipyard-ai/memory-store/bin/memory" reason="Bin entry script" />
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/config.ts" reason="Config module" />
  </context>

  <steps>
    <step order="1">Create cli/src/cli.ts with commander.js setup</step>
    <step order="2">Create cli/src/commands/init.ts</step>
    <step order="3">init command: Check if .tuned.json already exists, warn if so</step>
    <step order="4">Generate UUID for projectId</step>
    <step order="5">Generate API key: tuned_{random32chars}</step>
    <step order="6">Set default backendUrl (placeholder for now: https://tuned-api.workers.dev)</step>
    <step order="7">Call saveConfig() to write .tuned.json</step>
    <step order="8">Print success message with brand voice: "Tuned. Ready to push prompts."</step>
    <step order="9">Create cli/bin/tuned bash wrapper script using tsx</step>
    <step order="10">Create cli/package.json with bin entry, commander, tsx dependencies</step>
    <step order="11">Add --help with description: "Initialize Tuned in this project"</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/src/commands/init.ts && echo "init command exists"</check>
    <check type="bash">grep "tuned_" /home/agent/shipyard-ai/projects/tuned/cli/src/commands/init.ts</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/bin/tuned && echo "bin entry exists"</check>
    <check type="bash">grep '"bin"' /home/agent/shipyard-ai/projects/tuned/cli/package.json</check>
    <check type="test">init command creates .tuned.json with correct structure</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Config module must exist" />
    <depends-on task-id="phase-1-task-4" reason="API must exist to validate against (optional)" />
  </dependencies>

  <commit-message>feat(tuned): implement tuned init command

Per decisions.md CLI Commands:
- Creates .tuned.json in project root
- Generates projectId (UUID)
- Generates API key (tuned_xxx)
- Brand voice: "Tuned. Ready to push prompts."
- <60 second target

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Implement tuned push command</title>
  <requirement>REQ-002: tuned push</requirement>
  <description>
    Per decisions.md CLI Commands:
    - Push prompt to registry with auto-versioning
    - Must complete in <60 seconds

    This is the core workflow: `tuned push "my-prompt" -c "prompt content"`
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/cli.ts" reason="Add command here" />
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/config.ts" reason="Load config for API key" />
  </context>

  <steps>
    <step order="1">Create cli/src/commands/push.ts</step>
    <step order="2">Add push command to cli.ts: tuned push <name> -c <content> or tuned push <name> -f <file></step>
    <step order="3">Load config with loadConfig(), error if not initialized</step>
    <step order="4">If -f flag, read content from file</step>
    <step order="5">If -c flag, use content directly</step>
    <step order="6">If neither, read from stdin (pipe support)</step>
    <step order="7">Create cli/src/api.ts with API client functions</step>
    <step order="8">API client: createPrompt(name), createVersion(name, content) using fetch()</step>
    <step order="9">Push logic: check if prompt exists (GET), create if not (POST), then create version</step>
    <step order="10">Print success: "Pushed {name} v{version}. Live at edge."</step>
    <step order="11">Print error with brand voice: "Push failed. Check your connection."</step>
    <step order="12">Add -m flag for optional version message (stored in versions table)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/src/commands/push.ts && echo "push command exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/src/api.ts && echo "api client exists"</check>
    <check type="bash">grep "createVersion" /home/agent/shipyard-ai/projects/tuned/cli/src/api.ts</check>
    <check type="bash">grep "Live at edge" /home/agent/shipyard-ai/projects/tuned/cli/src/commands/push.ts</check>
    <check type="test">Push creates prompt and version via API</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="CRUD API must exist" />
    <depends-on task-id="phase-1-task-7" reason="init must exist for config" />
  </dependencies>

  <commit-message>feat(tuned): implement tuned push command

Per decisions.md CLI Commands:
- tuned push <name> -c "content" or -f file.txt
- Auto-versioning (version number from API)
- Brand voice: "Pushed {name} v{version}. Live at edge."
- API client with fetch()

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Implement tuned list command</title>
  <requirement>REQ-003: tuned list</requirement>
  <description>
    Per decisions.md CLI Commands:
    - List all prompts and versions
    - Show name, version number, timestamp
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/cli.ts" reason="Add command here" />
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/api.ts" reason="Add list API call" />
  </context>

  <steps>
    <step order="1">Create cli/src/commands/list.ts</step>
    <step order="2">Add list command to cli.ts: tuned list [name]</step>
    <step order="3">If name provided, list versions for that prompt</step>
    <step order="4">If no name, list all prompts with their active version</step>
    <step order="5">Add listPrompts() and listVersions(name) to api.ts</step>
    <step order="6">Format output as table: NAME | VERSION | UPDATED</step>
    <step order="7">Mark active version with * or highlight</step>
    <step order="8">Print "No prompts yet. Run tuned push to create one." if empty</step>
    <step order="9">Add -j flag for JSON output (machine-readable)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/src/commands/list.ts && echo "list command exists"</check>
    <check type="bash">grep "listPrompts" /home/agent/shipyard-ai/projects/tuned/cli/src/api.ts</check>
    <check type="bash">grep "NAME.*VERSION\|table" /home/agent/shipyard-ai/projects/tuned/cli/src/commands/list.ts</check>
    <check type="test">List shows prompts in table format</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="List API must exist" />
    <depends-on task-id="phase-1-task-7" reason="init must exist for config" />
  </dependencies>

  <commit-message>feat(tuned): implement tuned list command

Per decisions.md CLI Commands:
- tuned list (all prompts)
- tuned list <name> (versions for prompt)
- Table format: NAME | VERSION | UPDATED
- -j flag for JSON output

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Implement tuned rollback command</title>
  <requirement>REQ-004: tuned rollback</requirement>
  <description>
    Per decisions.md CLI Commands:
    - Revert to previous version
    - Updates active version in D1 and Edge KV
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/cli.ts" reason="Add command here" />
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/api.ts" reason="Add activate API call" />
  </context>

  <steps>
    <step order="1">Create cli/src/commands/rollback.ts</step>
    <step order="2">Add rollback command: tuned rollback <name> [version]</step>
    <step order="3">If version specified, rollback to that version</step>
    <step order="4">If no version, rollback to previous version (current - 1)</step>
    <step order="5">Add activateVersion(name, version) to api.ts</step>
    <step order="6">Call PUT /api/prompts/:name/versions/:version/activate</step>
    <step order="7">Print success: "Rolled back {name} to v{version}. Live at edge."</step>
    <step order="8">Print error if version doesn't exist: "Version {v} not found for {name}."</step>
    <step order="9">Confirm before rollback: "Roll back {name} to v{version}? [y/N]" (unless --yes flag)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/cli/src/commands/rollback.ts && echo "rollback command exists"</check>
    <check type="bash">grep "activateVersion" /home/agent/shipyard-ai/projects/tuned/cli/src/api.ts</check>
    <check type="bash">grep "Rolled back" /home/agent/shipyard-ai/projects/tuned/cli/src/commands/rollback.ts</check>
    <check type="test">Rollback activates specified version</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Activate API must exist" />
    <depends-on task-id="phase-1-task-5" reason="KV sync must work" />
    <depends-on task-id="phase-1-task-7" reason="init must exist for config" />
  </dependencies>

  <commit-message>feat(tuned): implement tuned rollback command

Per decisions.md CLI Commands:
- tuned rollback <name> [version]
- Defaults to previous version
- Confirmation prompt (--yes to skip)
- Syncs to Edge KV via API

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Implement SDK with getPrompt() and 5-min cache</title>
  <requirement>REQ-015: getPrompt(), REQ-016: 5-min TTL Cache, REQ-017: Zero-Latency, REQ-019: SDK Auth</requirement>
  <description>
    Per decisions.md SDK section:
    - getPrompt(name) — single function
    - Aggressive caching (5-min TTL)
    - Local injection, no proxy in request path

    This is the SDK developers import into their apps.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/memory-store/src/store.ts" reason="Caching pattern" />
    <file path="/home/agent/shipyard-ai/plugins/eventdash/package.json" reason="SDK package.json structure" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="SDK section" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/projects/tuned/sdk/ directory</step>
    <step order="2">Create sdk/src/cache.ts with in-memory Map: { key: { content, expiresAt } }</step>
    <step order="3">TTL: 5 minutes (300000ms)</step>
    <step order="4">getFromCache(key): return cached if not expired, null otherwise</step>
    <step order="5">setInCache(key, content): store with expiresAt = Date.now() + TTL</step>
    <step order="6">Create sdk/src/index.ts with getPrompt(name, options?) export</step>
    <step order="7">Options: { apiKey?, baseUrl? } for configuration</step>
    <step order="8">getPrompt flow: check cache, if miss fetch from /kv/prompt/:name, cache result</step>
    <step order="9">Return type: Promise<{ version: number, content: string } | null></step>
    <step order="10">Create sdk/package.json with "type": "module", exports field</step>
    <step order="11">Package name: @tuned/sdk (backup if "tuned" taken per REQ-033)</step>
    <step order="12">Add TypeScript types in sdk/src/types.ts</step>
    <step order="13">Add sdk/tsconfig.json for ES module output</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/sdk/src/index.ts && echo "sdk entry exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/sdk/src/cache.ts && echo "cache module exists"</check>
    <check type="bash">grep "getPrompt" /home/agent/shipyard-ai/projects/tuned/sdk/src/index.ts</check>
    <check type="bash">grep "5.*minute\|300000\|TTL" /home/agent/shipyard-ai/projects/tuned/sdk/src/cache.ts</check>
    <check type="bash">grep '"type": "module"' /home/agent/shipyard-ai/projects/tuned/sdk/package.json</check>
    <check type="test">SDK exports getPrompt function with caching</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="KV read endpoint must exist" />
  </dependencies>

  <commit-message>feat(tuned): implement SDK with getPrompt() and 5-min cache

Per decisions.md SDK section:
- getPrompt(name) single exported function
- 5-minute TTL local cache
- Zero latency impact (cached reads)
- @tuned/sdk package structure
- TypeScript types included

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Parallel, after Wave 3) — Dashboard, Docs, Review

Three final tasks. **Time budget: 1.5 hours**

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Create static HTML dashboard</title>
  <requirement>REQ-020: Static HTML, REQ-021: Read-Only View, REQ-022: CSS, REQ-023: Fetch Script, REQ-024: Hosting</requirement>
  <description>
    Per decisions.md Dashboard section:
    - Static HTML (no React)
    - Read-only visibility
    - Shows: prompt name, version number, timestamp, content
    - No buttons, no actions
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Dashboard section" />
    <file path="/home/agent/shipyard-ai/website/src/app/" reason="Reference for styling patterns" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/projects/tuned/dashboard/ directory</step>
    <step order="2">Create dashboard/index.html with semantic HTML structure</step>
    <step order="3">Header: "Tuned Dashboard", no navigation (read-only)</step>
    <step order="4">Main: prompts table container with id="prompts-list"</step>
    <step order="5">Table columns: Name | Active Version | Last Updated | Content Preview</step>
    <step order="6">Create dashboard/styles.css with minimal, professional styling</step>
    <step order="7">Use CSS custom properties for consistent colors</step>
    <step order="8">Mobile-responsive table (horizontal scroll on small screens)</step>
    <step order="9">Create dashboard/script.js with vanilla fetch()</step>
    <step order="10">Fetch GET /api/prompts on page load</step>
    <step order="11">Render prompts into table using textContent (not innerHTML for XSS safety)</step>
    <step order="12">Content preview: truncate to 100 chars with ellipsis</step>
    <step order="13">Empty state: "No prompts yet. Use tuned push to create one."</step>
    <step order="14">Error handling: "Unable to load prompts. Check your connection."</step>
    <step order="15">Add wrangler.toml for Cloudflare Pages deployment (or serve from Worker)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/dashboard/index.html && echo "dashboard exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/dashboard/styles.css && echo "styles exist"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/dashboard/script.js && echo "script exists"</check>
    <check type="bash">grep -v "innerHTML" /home/agent/shipyard-ai/projects/tuned/dashboard/script.js | grep "textContent"</check>
    <check type="test">No edit/delete buttons in HTML</check>
    <check type="manual">Dashboard renders prompts table correctly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="API must exist to fetch prompts" />
  </dependencies>

  <commit-message>feat(tuned): create static HTML dashboard

Per decisions.md Dashboard section:
- Static HTML, no React
- Read-only prompt list
- Vanilla JS fetch()
- XSS-safe (textContent, not innerHTML)
- Mobile-responsive CSS

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="4">
  <title>Create quickstart documentation</title>
  <requirement>REQ-006: Quickstart Docs</requirement>
  <description>
    Per decisions.md:
    - 60-second setup guide
    - "Works in <5 minutes is the right bar"

    Document the complete flow: install → init → push → SDK usage
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/" reason="CLI commands to document" />
    <file path="/home/agent/shipyard-ai/projects/tuned/sdk/" reason="SDK usage to document" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Value before effort principle" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/projects/tuned/docs/ directory</step>
    <step order="2">Create docs/quickstart.md</step>
    <step order="3">Title: "Quickstart: 60 seconds to your first prompt"</step>
    <step order="4">Step 1: Install CLI (npm install -g @tuned/cli)</step>
    <step order="5">Step 2: Initialize project (tuned init)</step>
    <step order="6">Step 3: Push first prompt (tuned push "greeting" -c "You are a helpful assistant.")</step>
    <step order="7">Step 4: Install SDK (npm install @tuned/sdk)</step>
    <step order="8">Step 5: Use in code (import { getPrompt } from '@tuned/sdk')</step>
    <step order="9">Include complete code example with OpenAI integration</step>
    <step order="10">Apply brand voice: direct, confident, not robotic</step>
    <step order="11">No "Getting Started" fluff — straight to the commands</step>
    <step order="12">Time the full workflow to verify <60 seconds claim</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/tuned/docs/quickstart.md && echo "quickstart exists"</check>
    <check type="bash">grep "60 seconds\|npm install" /home/agent/shipyard-ai/projects/tuned/docs/quickstart.md</check>
    <check type="bash">grep "getPrompt" /home/agent/shipyard-ai/projects/tuned/docs/quickstart.md</check>
    <check type="manual">Workflow completes in under 60 seconds following docs</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="init command documented" />
    <depends-on task-id="phase-1-task-8" reason="push command documented" />
    <depends-on task-id="phase-1-task-11" reason="SDK documented" />
  </dependencies>

  <commit-message>docs(tuned): add quickstart guide

Per decisions.md value before effort:
- 60-second workflow: install → init → push → use
- Complete code example with OpenAI
- Direct voice, no fluff
- Time-verified flow

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="4">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per SKILL.md Step 7:
    Spawn Sara Blakely agent for customer perspective.
    Tuned customers are developers using AI APIs.
    "Would they pay for this? What feels like engineering vanity?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Product essence" />
    <file path="/home/agent/shipyard-ai/projects/tuned/docs/quickstart.md" reason="User experience" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely</step>
    <step order="2">Prompt: Read phase plan and quickstart docs</step>
    <step order="3">Answer: Would a developer actually switch from hardcoded prompts?</step>
    <step order="4">Answer: What would make them say "I need this"?</step>
    <step order="5">Answer: Does the 60-second quickstart feel achievable or intimidating?</step>
    <step order="6">Answer: Is "Tuned" memorable? Would they tell a coworker?</step>
    <step order="7">Answer: What's missing that a real user would notice immediately?</step>
    <step order="8">Answer: Does the SDK feel like it adds value or just complexity?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps if any</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-13" reason="Quickstart must exist for review" />
  </dependencies>

  <commit-message>docs(tuned): add Sara Blakely customer gut-check

Per SKILL.md Step 7:
- Customer perspective validation
- Developer adoption barriers assessed
- 60-second promise evaluated
- SDK value proposition reviewed

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism | Time Budget |
|------|-------|-------------|-------------|-------------|
| 1 | 3 | Infrastructure: D1 schema, KV config, auth strategy | 3 parallel | 1.5 hours |
| 2 | 3 | Worker API: CRUD, KV sync, logging | 3 parallel (after Wave 1) | 1.5 hours |
| 3 | 5 | CLI + SDK: init, push, list, rollback, getPrompt | 5 parallel (after Wave 2) | 2.5 hours |
| 4 | 3 | Dashboard, docs, review | 3 parallel (after Wave 3) | 1.5 hours |

**Total Tasks:** 14
**Maximum Parallelism:** Wave 3 (5 concurrent tasks)
**Total Time Budget:** 7 hours

---

## Dependencies Diagram

```
Wave 1:  [task-1: D1 Schema] ───────────────────────────────────────────────>
         [task-2: KV + Worker] ─────────────────────────────────────────────>
         [task-3: Config + Auth] ───────────────────────────────────────────>

Wave 2:  [task-4: CRUD API] ──────> (depends on 1,2,3) ─────────────────────>
         [task-5: KV Sync] ───────> (depends on 1,2) ───────────────────────>
         [task-6: Logging] ───────> (depends on 2) ─────────────────────────>

Wave 3:  [task-7: init] ──────────> (depends on 3,4) ───────────────────────>
         [task-8: push] ──────────> (depends on 4,7) ───────────────────────>
         [task-9: list] ──────────> (depends on 4,7) ───────────────────────>
         [task-10: rollback] ─────> (depends on 4,5,7) ─────────────────────>
         [task-11: SDK] ──────────> (depends on 5) ─────────────────────────>

Wave 4:  [task-12: Dashboard] ────> (depends on 4) ─────────────────────────>
         [task-13: Docs] ─────────> (depends on 7,8,11) ────────────────────>
         [task-14: Sara Review] ──> (depends on 13) ────────────────────────>
```

---

## Risk Notes

### Mitigated in This Plan

| Risk | Mitigation | Task |
|------|------------|------|
| Scope creep | 7-hour hard cap, ruthless cuts | All |
| npm name collision | @tuned/sdk as backup | task-11 |
| D1 cold start | KV for reads, D1 for writes only | task-5 |
| Cache staleness | Version-based cache in SDK | task-11 |
| CLI >60 seconds | Minimal dependencies, no prompts | task-7,8 |
| Auth complexity | Project-level key, simple validation | task-3 |

### Accepted for v1 (Not Blocking)

| Risk | Impact | Notes |
|------|--------|-------|
| Manual npm publish | Low | Document process, automate in v1.1 |
| Analytics Engine integration | Medium | Console.log for MVP, migrate later |
| No A/B testing | Low | Cut per decisions.md |
| No prompt diff | Low | Cut per decisions.md |

---

## Open Questions Resolved

| Question | Resolution | Rationale |
|----------|------------|-----------|
| Logging backend | Analytics Engine (console.log for MVP) | Native to Workers, scales |
| API key strategy | Project-level, generated on init | Simplest, fits 7h scope |
| Config location | .tuned.json in project root | Project-local, git-ignorable |
| Dashboard hosting | Serve from Worker or Pages | Decision during build |
| npm package name | @tuned/sdk | Safe fallback |

---

## Verification Checklist

- [x] All requirements have task coverage (38 requirements → 14 tasks)
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed
- [x] 7-hour timeline achievable with parallelism
- [x] Sara Blakely customer gut-check scheduled (task-14)
- [x] docs/EMDASH-GUIDE.md cited for Cloudflare patterns (Section 5)
- [x] Codebase patterns cited (workers/wardrobe-analytics, memory-store)

---

## Ship Test

> Does the developer feel in control after using Tuned?

> Does `tuned push` feel as natural as `git push`?

> Does the SDK add value without adding complexity?

> Can someone go from npm install to live prompt in 60 seconds?

> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/promptops/decisions.md, docs/EMDASH-GUIDE.md*
*Project Slug: promptops*
