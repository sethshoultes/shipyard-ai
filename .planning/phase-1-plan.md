# Phase 1 Plan — PromptOps/Drift Build Phase

**Generated**: April 12, 2026
**Project Slug**: promptops
**Product Name**: Drift (CLI + API) + NERVE (Pipeline Daemon)
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 12
**Waves**: 4
**Status**: READY FOR BUILD
**Estimated Time**: 6-8 hours (sequential), 4-5 hours (parallelized)

---

## The Essence

> **What it is:** The undo button for AI—turning prompt deployment from a gamble into a system.

> **The feeling:** Peace. The 3 AM panic, gone.

> **What must be perfect:** The rollback. One command. Instant. No thinking.

> **Creative direction:** Disappear. Work always.

---

## Build Status

**Existing Code:** ~1,275 lines built (API: 731, CLI: 447, NERVE: 1,055)
**Missing:** SDK (0 lines), Dashboard (0 lines), CLI list/rollback commands
**Board Verdict:** HOLD (5.1/10) — Build phase never completed

### Locked Decisions

| Decision | Winner | Rationale |
|----------|--------|-----------|
| Product Name: **Drift/NERVE** | Steve Jobs | One-word names shape destiny |
| No Proxy in V1 | Elon Musk | 15-80ms latency is commercial suicide |
| SDK-First Architecture | Elon Musk | "Add 2 lines of code" > "reroute traffic" |
| Dashboard: Read-Only HTML | Elon Musk | Static, no rollback buttons |
| 60-Second Time-to-Value | Both | First dopamine hit must be fast |
| Bash Over Agents (NERVE) | Consensus | Determinism over probabilistic |

### What Must Ship

| # | Component | Status | Gap |
|---|-----------|--------|-----|
| 1 | API endpoints | BUILT | Deploy to Cloudflare |
| 2 | CLI init/push | PARTIAL | Complete and test |
| 3 | CLI list/rollback | NOT BUILT | Implement commands |
| 4 | SDK getPrompt() | NOT BUILT | Build with caching |
| 5 | Dashboard | NOT BUILT | Static HTML |
| 6 | D1 Database | NOT DONE | Create and migrate |
| 7 | NERVE scripts | BUILT | Test and document |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-META-002: D1 database deployed | phase-1-task-1 | 1 |
| REQ-API-001 to 006: API endpoints | phase-1-task-2 | 1 |
| REQ-CLI-001, 002: init and push | phase-1-task-3 | 2 |
| REQ-CLI-003, 004: list and rollback | phase-1-task-4 | 2 |
| REQ-SDK-001, 002: getPrompt with caching | phase-1-task-5 | 2 |
| REQ-DASH-001 to 006: Dashboard | phase-1-task-6 | 2 |
| REQ-NERVE-001 to 005: NERVE scripts | phase-1-task-7 | 3 |
| REQ-CLI-005: npm publish CLI | phase-1-task-8 | 3 |
| REQ-SDK-005: npm publish SDK | phase-1-task-9 | 3 |
| REQ-META-001: 60-second test | phase-1-task-10 | 4 |
| Git commit all changes | phase-1-task-11 | 4 |
| QA Pass verification | phase-1-task-12 | 4 |

---

## Documentation References

This plan cites specific sections from source documents:

- **decisions.md Section I**: Locked Decisions (13 items)
- **decisions.md Section II**: MVP Feature Set (CLI, API, SDK, Dashboard)
- **decisions.md Section III**: File Structure (expected directories)
- **decisions.md Section IV**: Open Questions (4 items needing resolution)
- **decisions.md Section IX**: Build Phase Acceptance Criteria
- **docs/EMDASH-GUIDE.md Section 5**: Cloudflare Workers deployment patterns

### Existing Code Locations

- `/home/agent/shipyard-ai/deliverables/promptops/drift/api/` — API (731 lines)
- `/home/agent/shipyard-ai/deliverables/promptops/drift/cli/` — CLI (447 lines)
- `/home/agent/shipyard-ai/nerve/` — NERVE scripts (1,055 lines)

---

## Wave Execution Order

### Wave 1 (Parallel) — Infrastructure Foundation

Two independent tasks provisioning infrastructure and deploying API. **Estimated time: 45 minutes**

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create and configure D1 database</title>
  <requirement>REQ-META-002: D1 database deployed with schema</requirement>
  <description>
    Per decisions.md Section III and EMDASH-GUIDE.md Section 5:
    Create Cloudflare D1 database for Drift and apply schema.

    Schema exists at: deliverables/promptops/drift/api/src/db/schema.sql
    Contains: projects, prompts, versions tables with proper indexes.

    Database name: drift
    Binding: DB
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/src/db/schema.sql" reason="D1 schema definition (53 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/wrangler.toml" reason="Worker config with D1 binding placeholder" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: D1 database creation pattern" />
  </context>

  <steps>
    <step order="1">Run: wrangler d1 create drift</step>
    <step order="2">Copy the database_id from output</step>
    <step order="3">Update wrangler.toml with real database_id</step>
    <step order="4">Apply schema: wrangler d1 execute drift --file=src/db/schema.sql</step>
    <step order="5">Verify tables: wrangler d1 execute drift --command="SELECT name FROM sqlite_master WHERE type='table'"</step>
    <step order="6">Verify indexes exist on projects.api_key_hash, prompts.name</step>
  </steps>

  <verification>
    <check type="bash">wrangler d1 list | grep drift</check>
    <check type="bash">wrangler d1 execute drift --command="SELECT count(*) FROM sqlite_master WHERE type='table'"</check>
    <check type="manual">Returns 3 tables: projects, prompts, versions</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>chore(drift): create D1 database and apply schema

Create 'drift' D1 database with tables:
- projects (id, name, api_key_hash, created_at)
- prompts (id, project_id, name, active_version, created_at)
- versions (id, prompt_id, version, content, message, created_at)

Indexes on api_key_hash and prompt name for fast lookups.

Per decisions.md Section III: database-first architecture.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Deploy Drift API worker to Cloudflare</title>
  <requirement>REQ-API-001 to 006: All API endpoints functional</requirement>
  <description>
    Per decisions.md Section II and existing code at deliverables/promptops/drift/api/:
    Deploy the Cloudflare Worker with all API routes.

    Endpoints:
    - POST /api/projects (create project, generate API key)
    - GET /api/prompts (list all prompts)
    - POST /api/prompts (create/update prompt version)
    - GET /api/prompts/:name (get prompt with history)
    - POST /api/prompts/:name/rollback (revert to version)

    Code is built (731 lines). Deploy and verify.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/src/index.ts" reason="Worker entry point (124 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/src/middleware/auth.ts" reason="API key validation (129 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/src/routes/projects.ts" reason="Project creation (97 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/src/routes/prompts.ts" reason="Prompt CRUD (381 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/wrangler.toml" reason="Worker config" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: Worker deployment patterns" />
  </context>

  <steps>
    <step order="1">cd deliverables/promptops/drift/api</step>
    <step order="2">npm install</step>
    <step order="3">Verify wrangler.toml has correct database_id (from task-1)</step>
    <step order="4">Run: wrangler deploy</step>
    <step order="5">Note deployed URL: drift-api.{subdomain}.workers.dev</step>
    <step order="6">Test: curl -X POST https://drift-api.{subdomain}.workers.dev/api/projects -H "Content-Type: application/json" -d '{"name":"test-project"}'</step>
    <step order="7">Verify response contains api_key and project_id</step>
    <step order="8">Test auth: curl with API key, verify 200 response</step>
    <step order="9">Test without auth: verify 401 response</step>
  </steps>

  <verification>
    <check type="bash">curl -X POST https://drift-api.{subdomain}.workers.dev/api/projects -H "Content-Type: application/json" -d '{"name":"test"}'</check>
    <check type="manual">POST /api/projects returns {api_key, project_id}</check>
    <check type="manual">GET /api/prompts with valid key returns 200</check>
    <check type="manual">GET /api/prompts without key returns 401</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="D1 database must exist for API to function" />
  </dependencies>

  <commit-message>feat(drift): deploy API worker to Cloudflare

Drift API worker deployed with endpoints:
- POST /api/projects (project creation)
- GET /api/prompts (list prompts)
- POST /api/prompts (push version)
- GET /api/prompts/:name (get prompt)
- POST /api/prompts/:name/rollback (revert version)

Auth middleware validates API keys (SHA-256 hashed).

Per decisions.md Section II: SDK-first architecture.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Components

Four tasks building CLI commands, SDK, and Dashboard. **Estimated time: 2.5 hours**

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>Complete CLI init and push commands</title>
  <requirement>REQ-CLI-001, REQ-CLI-002: drift init and drift push functional</requirement>
  <description>
    Per decisions.md Section II and existing code at deliverables/promptops/drift/cli/:
    Complete the init and push commands. Partial implementations exist.

    init.ts (43 lines): Creates project via API, saves config
    push.ts (63 lines): Reads file, pushes version to API

    Must integrate with deployed API from task-2.
    Config stored at ~/.drift/config.json per decisions.md OQ-003.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/commands/init.ts" reason="Init command implementation" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/commands/push.ts" reason="Push command implementation" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/api.ts" reason="API client (207 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/config.ts" reason="Config management (131 lines)" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="OQ-003: Auth model (project-level key)" />
  </context>

  <steps>
    <step order="1">cd deliverables/promptops/drift/cli</step>
    <step order="2">npm install</step>
    <step order="3">Update src/api.ts with production API URL</step>
    <step order="4">Test init: npm run dev -- init test-project</step>
    <step order="5">Verify ~/.drift/config.json contains api_key and project_id</step>
    <step order="6">Create test prompt file: echo "You are a helpful assistant" > test-prompt.txt</step>
    <step order="7">Test push: npm run dev -- push system-prompt --file test-prompt.txt</step>
    <step order="8">Verify API received prompt: curl GET /api/prompts with API key</step>
    <step order="9">Push second version, verify version number increments</step>
  </steps>

  <verification>
    <check type="bash">npm run dev -- init test-project-verify</check>
    <check type="bash">cat ~/.drift/config.json | grep api_key</check>
    <check type="bash">npm run dev -- push verify-prompt --file test-prompt.txt</check>
    <check type="manual">Init creates config file with credentials</check>
    <check type="manual">Push uploads prompt and returns version number</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="API must be deployed for CLI to call" />
  </dependencies>

  <commit-message>feat(drift): complete CLI init and push commands

CLI commands functional:
- drift init <name>: Creates project, saves API key to ~/.drift/config.json
- drift push <name> --file <path>: Reads file, pushes version to API

Per decisions.md: 60-second time-to-value target.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Implement CLI list and rollback commands</title>
  <requirement>REQ-CLI-003, REQ-CLI-004: drift list and drift rollback functional</requirement>
  <description>
    Per decisions.md Section II:
    Implement the missing list and rollback commands.

    drift list: Display all prompts with version history
    drift rollback <name> --version <n>: Revert to specific version

    API endpoints exist (GET /api/prompts, POST /api/prompts/:name/rollback).
    Must create CLI wrappers.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/api.ts" reason="API client has listPrompts, rollbackPrompt methods" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/config.ts" reason="Config loading for API key" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/src/commands/" reason="Commands directory, add list.ts and rollback.ts" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Section IX: Acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create src/commands/list.ts</step>
    <step order="2">Import api.listPrompts() and config loader</step>
    <step order="3">Format output as table: Name | Active Version | Total Versions | Created</step>
    <step order="4">Create src/commands/rollback.ts</step>
    <step order="5">Accept arguments: prompt name, --version flag</step>
    <step order="6">Call api.rollbackPrompt(name, version)</step>
    <step order="7">Display success message: "Rolled back {name} to version {n}"</step>
    <step order="8">Register both commands in bin/drift.js</step>
    <step order="9">Test list: npm run dev -- list</step>
    <step order="10">Test rollback: npm run dev -- rollback system-prompt --version 1</step>
    <step order="11">Verify active version changed via list</step>
  </steps>

  <verification>
    <check type="bash">npm run dev -- list</check>
    <check type="bash">npm run dev -- rollback test-prompt --version 1</check>
    <check type="manual">List displays all prompts in table format</check>
    <check type="manual">Rollback changes active version immediately</check>
    <check type="manual">Re-running list shows updated active version</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="API must be deployed" />
    <depends-on task-id="phase-1-task-3" reason="Must have prompts to list/rollback" />
  </dependencies>

  <commit-message>feat(drift): implement CLI list and rollback commands

CLI commands complete:
- drift list: Shows all prompts with version history
- drift rollback <name> --version <n>: Reverts to specified version

Per decisions.md: "The rollback. One command. Instant. No thinking."

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Build SDK with getPrompt and caching</title>
  <requirement>REQ-SDK-001, REQ-SDK-002: getPrompt() with 5-minute TTL caching</requirement>
  <description>
    Per decisions.md Section II and locked decision #3 (SDK-First):
    Build the TypeScript SDK that applications use to fetch prompts.

    Core function: getPrompt(name) -> { version, content, updatedAt }
    Caching: 5-minute TTL (per decisions.md locked decision)
    Fallback: If API fails, return cached version with warning

    Package: @drift/sdk or drift-sdk
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/" reason="Create sdk/ directory alongside api/ and cli/" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Decision #3: SDK-First, 5-min TTL" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="OQ-006: npm package name" />
  </context>

  <steps>
    <step order="1">Create deliverables/promptops/drift/sdk/ directory</step>
    <step order="2">Initialize npm package: npm init (name: drift-sdk)</step>
    <step order="3">Add TypeScript config: tsconfig.json</step>
    <step order="4">Create src/index.ts with Drift class</step>
    <step order="5">Implement constructor: new Drift({ apiKey, endpoint? })</step>
    <step order="6">Implement getPrompt(name): fetches from API, caches result</step>
    <step order="7">Implement cache: Map with TTL tracking (5 minutes = 300000ms)</step>
    <step order="8">Add fallback: on API error, return stale cache with console.warn</step>
    <step order="9">Export types: Prompt, DriftConfig, PromptResult</step>
    <step order="10">Add environment variable support: DRIFT_API_KEY, DRIFT_ENDPOINT</step>
    <step order="11">Build: npm run build</step>
    <step order="12">Test: import SDK, call getPrompt, verify cache hit on second call</step>
  </steps>

  <verification>
    <check type="bash">cd deliverables/promptops/drift/sdk && npm run build</check>
    <check type="manual">getPrompt() returns { version, content, updatedAt }</check>
    <check type="manual">Second call within 5 minutes hits cache (no network)</check>
    <check type="manual">Cache miss after 5 minutes triggers API fetch</check>
    <check type="manual">API failure returns stale cache with warning</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="API must be deployed for SDK to fetch" />
  </dependencies>

  <commit-message>feat(drift): build SDK with getPrompt and caching

SDK implementation:
- Drift class with constructor({ apiKey, endpoint })
- getPrompt(name) fetches prompt with 5-minute TTL cache
- Graceful fallback: returns stale cache on API failure
- Environment variable config: DRIFT_API_KEY, DRIFT_ENDPOINT

Per decisions.md Decision #3: "Add 2 lines of code" adoption curve.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Build read-only Dashboard</title>
  <requirement>REQ-DASH-001 to 006: Static HTML dashboard showing prompts</requirement>
  <description>
    Per decisions.md Decisions #4, #5 and OQ-005:
    Build minimal static HTML dashboard for read-only visibility.

    Features:
    - List all prompts with active version
    - Click prompt -> show version history with timestamps
    - NO rollback buttons (CLI only per Decision #4)
    - Professional styling with Tailwind CDN

    Hosting: Embed in Worker (single deployment per OQ-005 recommendation)
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/api/src/index.ts" reason="Embed dashboard route in Worker" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Decision #4: Dashboard minimal, Decision #5: polished" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="OQ-005: Hosting recommendation" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Not directly applicable but provides styling patterns" />
  </context>

  <steps>
    <step order="1">Create deliverables/promptops/drift/dashboard/ directory</step>
    <step order="2">Create index.html with Tailwind CDN</step>
    <step order="3">Build table: Prompt Name | Active Version | Total Versions | Last Updated</step>
    <step order="4">Add JavaScript to fetch /api/prompts and populate table</step>
    <step order="5">Add click handler: clicking row shows version history modal</step>
    <step order="6">Style: Clean typography, good spacing, responsive</step>
    <step order="7">Keep under 500 lines total (per REQ-DASH-006)</step>
    <step order="8">Embed in Worker: update api/src/index.ts to serve HTML at GET /</step>
    <step order="9">Re-deploy Worker with dashboard embedded</step>
    <step order="10">Test: Navigate to drift-api.{subdomain}.workers.dev/ in browser</step>
    <step order="11">Verify prompts display, version history works</step>
  </steps>

  <verification>
    <check type="bash">curl https://drift-api.{subdomain}.workers.dev/</check>
    <check type="manual">Returns HTML page with prompt list</check>
    <check type="manual">Table shows all prompts with versions</check>
    <check type="manual">Click reveals version history</check>
    <check type="manual">No rollback buttons present</check>
    <check type="manual">Styling is professional, not "anxious"</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="API must serve dashboard and data" />
  </dependencies>

  <commit-message>feat(drift): build read-only dashboard

Dashboard embedded in Worker at GET /:
- Lists all prompts with version info
- Click to view version history
- No rollback buttons (CLI only)
- Tailwind CDN styling, <500 lines

Per decisions.md Decision #4: "Static HTML. Clean but not elaborate."

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Polish and Publish

Three tasks testing NERVE and publishing packages. **Estimated time: 1.5 hours**

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Test and document NERVE scripts</title>
  <requirement>REQ-NERVE-001 to 005: NERVE scripts functional and documented</requirement>
  <description>
    Per decisions.md Section II (NERVE) and existing code at /nerve/:
    NERVE scripts are built (1,055 lines). Test and verify functionality.

    Scripts:
    - daemon.sh: Main loop with PID lockfile
    - queue.sh: Persistent queue with recovery
    - abort.sh: Clean shutdown via flag
    - parse-verdict.sh: QA verdict parsing
    - status.sh: Status reporting

    Note: NERVE integration with Drift is deferred per Board feedback.
    V1 ships NERVE as standalone infrastructure.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/daemon.sh" reason="Daemon loop (260 lines)" />
    <file path="/home/agent/shipyard-ai/nerve/queue.sh" reason="Queue persistence (306 lines)" />
    <file path="/home/agent/shipyard-ai/nerve/abort.sh" reason="Abort management (178 lines)" />
    <file path="/home/agent/shipyard-ai/nerve/parse-verdict.sh" reason="Verdict parsing (136 lines)" />
    <file path="/home/agent/shipyard-ai/nerve/status.sh" reason="Status reporting (175 lines)" />
    <file path="/home/agent/shipyard-ai/nerve/README.md" reason="Documentation (301 lines)" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Decision #6: Bash over agents" />
  </context>

  <steps>
    <step order="1">cd /home/agent/shipyard-ai/nerve</step>
    <step order="2">Test daemon start: ./daemon.sh start</step>
    <step order="3">Verify PID lockfile created: ls -la /tmp/nerve.pid or configured path</step>
    <step order="4">Test duplicate prevention: ./daemon.sh start (should fail)</step>
    <step order="5">Test queue enqueue: ./queue.sh enqueue "test-item"</step>
    <step order="6">Verify queue persisted: ls /tmp/nerve-queue/ or configured path</step>
    <step order="7">Test abort: ./abort.sh set</step>
    <step order="8">Verify daemon responds to abort (clean shutdown)</step>
    <step order="9">Test verdict parsing: echo "PASS: 0 issues" | ./parse-verdict.sh</step>
    <step order="10">Verify JSON output: {"verdict": "PASS", "issues": 0}</step>
    <step order="11">Test status: ./status.sh</step>
    <step order="12">Verify README documents all commands accurately</step>
  </steps>

  <verification>
    <check type="bash">./daemon.sh start && ls /tmp/nerve.pid</check>
    <check type="bash">./abort.sh set && sleep 2 && ./status.sh</check>
    <check type="bash">echo "FAIL: 3 issues" | ./parse-verdict.sh</check>
    <check type="manual">Daemon starts, creates lockfile</check>
    <check type="manual">Duplicate daemon rejected with error</check>
    <check type="manual">Abort flag triggers clean shutdown</check>
    <check type="manual">Parse-verdict returns valid JSON</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Drift API provides context but not required" />
  </dependencies>

  <commit-message>test(nerve): verify all scripts functional

NERVE scripts tested:
- daemon.sh: PID lock, signal handling
- queue.sh: Persistence, recovery
- abort.sh: Flag management
- parse-verdict.sh: JSON verdict output
- status.sh: Metrics reporting

Per decisions.md Decision #6: "Trust bash, not instructions."

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Publish CLI to npm</title>
  <requirement>REQ-CLI-005: CLI installable via npm</requirement>
  <description>
    Per decisions.md OQ-006:
    Publish CLI package to npm registry.

    Package name: drift-cli (check availability)
    Fallback: @drift-prompt/cli

    Users install with: npm install -g drift-cli
    Then run: drift init, drift push, etc.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/package.json" reason="Package config" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/cli/bin/drift.js" reason="CLI entry point" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="OQ-006: npm name" />
  </context>

  <steps>
    <step order="1">cd deliverables/promptops/drift/cli</step>
    <step order="2">Check npm name availability: npm view drift-cli</step>
    <step order="3">If taken, use fallback: @drift-prompt/cli</step>
    <step order="4">Update package.json with correct name, version 1.0.0</step>
    <step order="5">Ensure bin field points to bin/drift.js</step>
    <step order="6">Build: npm run build</step>
    <step order="7">Test locally: npm link && drift --help</step>
    <step order="8">Verify all 4 commands show in help</step>
    <step order="9">Publish: npm publish --access public</step>
    <step order="10">Test install: npm install -g drift-cli && drift --help</step>
  </steps>

  <verification>
    <check type="bash">npm view drift-cli || echo "Available"</check>
    <check type="bash">drift --help</check>
    <check type="manual">npm publish succeeds</check>
    <check type="manual">Global install works: drift --help shows all commands</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Init and push must be complete" />
    <depends-on task-id="phase-1-task-4" reason="List and rollback must be complete" />
  </dependencies>

  <commit-message>chore(drift): publish CLI to npm

CLI published as drift-cli (or fallback name):
- drift init <name>
- drift push <name> --file <path>
- drift list
- drift rollback <name> --version <n>

Install with: npm install -g drift-cli

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Publish SDK to npm</title>
  <requirement>REQ-SDK-005: SDK installable via npm</requirement>
  <description>
    Per decisions.md OQ-006:
    Publish SDK package to npm registry.

    Package name: drift-sdk (check availability)
    Fallback: @drift-prompt/sdk

    Users install with: npm install drift-sdk
    Then use: import { Drift } from 'drift-sdk'
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/sdk/package.json" reason="Package config (from task-5)" />
    <file path="/home/agent/shipyard-ai/deliverables/promptops/drift/sdk/src/index.ts" reason="SDK entry point" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="OQ-006: npm name" />
  </context>

  <steps>
    <step order="1">cd deliverables/promptops/drift/sdk</step>
    <step order="2">Check npm name availability: npm view drift-sdk</step>
    <step order="3">If taken, use fallback: @drift-prompt/sdk</step>
    <step order="4">Update package.json with correct name, version 1.0.0</step>
    <step order="5">Ensure main points to dist/index.js, types to dist/index.d.ts</step>
    <step order="6">Build: npm run build</step>
    <step order="7">Test locally: create test file that imports and calls getPrompt</step>
    <step order="8">Publish: npm publish --access public</step>
    <step order="9">Test install: npm install drift-sdk in new directory</step>
    <step order="10">Verify import and getPrompt work</step>
  </steps>

  <verification>
    <check type="bash">npm view drift-sdk || echo "Available"</check>
    <check type="bash">npm install drift-sdk && node -e "require('drift-sdk')"</check>
    <check type="manual">npm publish succeeds</check>
    <check type="manual">Import and getPrompt work in test file</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="SDK must be built" />
  </dependencies>

  <commit-message>chore(drift): publish SDK to npm

SDK published as drift-sdk (or fallback name):
- new Drift({ apiKey })
- drift.getPrompt(name) with 5-minute caching

Install with: npm install drift-sdk

Per decisions.md Decision #3: "Add 2 lines of code."

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Verification and Commit

Three tasks verifying time-to-value, committing changes, and running QA. **Estimated time: 30 minutes**

```xml
<task-plan id="phase-1-task-10" wave="4">
  <title>Verify 60-second time-to-value</title>
  <requirement>REQ-META-001: npm install + drift init + drift push in under 60 seconds</requirement>
  <description>
    Per decisions.md Decision #8:
    "npm install + drift init + drift push must work in under 60 seconds.
    If setup takes longer than the first dopamine hit, we've failed."

    Test the complete user journey from fresh install to first prompt deployed.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Decision #8: 60-second target" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Section IX: Acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create fresh directory: mkdir /tmp/drift-test && cd /tmp/drift-test</step>
    <step order="2">Start timer</step>
    <step order="3">Install CLI: npm install -g drift-cli</step>
    <step order="4">Initialize project: drift init my-test-project</step>
    <step order="5">Create prompt: echo "You are a helpful assistant" > system.txt</step>
    <step order="6">Push prompt: drift push system --file system.txt</step>
    <step order="7">Stop timer</step>
    <step order="8">Record time in seconds</step>
    <step order="9">Verify prompt visible: drift list</step>
    <step order="10">If over 60 seconds, identify bottleneck and document</step>
  </steps>

  <verification>
    <check type="manual">Total time from npm install to first push: ____ seconds</check>
    <check type="manual">If < 60 seconds: PASS</check>
    <check type="manual">If > 60 seconds: Document bottleneck for optimization</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="CLI must be published to npm" />
  </dependencies>

  <commit-message>test(drift): verify 60-second time-to-value

Tested complete user journey:
- npm install -g drift-cli
- drift init my-project
- drift push system --file prompt.txt

Total time: XX seconds (target: <60)

Per decisions.md Decision #8: First dopamine hit.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="4">
  <title>Commit all changes to git</title>
  <requirement>Meta: All files committed to deliverables</requirement>
  <description>
    Per decisions.md Section IX Meta requirements:
    Commit all modified and new files in the drift and nerve directories.

    Changes include:
    - API worker updates
    - CLI commands
    - SDK implementation
    - Dashboard
    - NERVE tests
    - Configuration updates
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/promptops/" reason="All drift code" />
    <file path="/home/agent/shipyard-ai/nerve/" reason="NERVE scripts" />
    <file path="/home/agent/shipyard-ai/.planning/" reason="Planning docs" />
  </context>

  <steps>
    <step order="1">cd /home/agent/shipyard-ai</step>
    <step order="2">git status (review all changes)</step>
    <step order="3">git add deliverables/promptops/ nerve/ .planning/</step>
    <step order="4">Create comprehensive commit</step>
    <step order="5">git status (verify clean working tree)</step>
  </steps>

  <verification>
    <check type="bash">cd /home/agent/shipyard-ai && git status --porcelain</check>
    <check type="manual">git status shows clean working tree</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Dashboard must be complete" />
    <depends-on task-id="phase-1-task-7" reason="NERVE tests must be complete" />
    <depends-on task-id="phase-1-task-10" reason="Time-to-value verified" />
  </dependencies>

  <commit-message>feat(drift): complete Phase 1 build

Phase 1 Drift/NERVE build complete:
- API: 5 endpoints deployed to Cloudflare Workers
- CLI: 4 commands (init, push, list, rollback)
- SDK: getPrompt() with 5-minute caching
- Dashboard: Read-only prompt visibility
- NERVE: All scripts tested and documented

Resolves Board HOLD condition: "Demonstrate code, not documents."

Total implementation: ~2,500 lines TypeScript + 1,055 lines bash

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Run QA Pass verification</title>
  <requirement>QA validation before launch</requirement>
  <description>
    Per decisions.md Section IX acceptance criteria:
    Execute comprehensive QA verification of all components.

    All P0 requirements must pass.
    Board conditions for PROCEED must be met.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Acceptance criteria checklist" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Section IX: Build Phase Acceptance Criteria" />
  </context>

  <steps>
    <step order="1">Verify REQ-CLI-001: drift init creates project, generates API key</step>
    <step order="2">Verify REQ-CLI-002: drift push versions prompt, stores in D1</step>
    <step order="3">Verify REQ-CLI-003: drift list shows prompts with history</step>
    <step order="4">Verify REQ-CLI-004: drift rollback reverts version immediately</step>
    <step order="5">Verify REQ-SDK-001: getPrompt() returns prompt content</step>
    <step order="6">Verify REQ-SDK-002: Cache hit within 5 minutes (no network)</step>
    <step order="7">Verify REQ-DASH-001: Dashboard displays prompts</step>
    <step order="8">Verify REQ-DASH-002: No rollback buttons (read-only)</step>
    <step order="9">Verify REQ-META-001: Time-to-value under 60 seconds</step>
    <step order="10">Verify REQ-NERVE-001 to 005: All scripts functional</step>
    <step order="11">Verify README.md exists and is under 50 lines</step>
    <step order="12">Verify at least one component runs (execution gate)</step>
    <step order="13">Document QA Pass results</step>
  </steps>

  <verification>
    <check type="manual">All 16 P0 requirements: PASS</check>
    <check type="manual">All acceptance criteria: PASS</check>
    <check type="manual">Overall verdict: PASS</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="All changes must be committed" />
  </dependencies>

  <commit-message>docs(drift): QA Pass verification complete

All P0 requirements verified:
- CLI: 4/4 commands functional
- API: 6/6 endpoints working
- SDK: Caching verified
- Dashboard: Read-only display
- NERVE: Scripts tested
- Time-to-value: XX seconds

QA Director: Margaret Hamilton
Verdict: PASS

Board condition for PROCEED: MET

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism | Est. Time |
|------|-------|-------------|-------------|-----------|
| 1 | 2 | Infrastructure: D1 database, API deployment | 2 parallel | 45 min |
| 2 | 4 | Core: CLI commands, SDK, Dashboard | 4 parallel (after Wave 1) | 2.5 hours |
| 3 | 3 | Publish: NERVE tests, CLI npm, SDK npm | 3 parallel (after Wave 2) | 1.5 hours |
| 4 | 3 | Verify: 60-sec test, git commit, QA pass | Sequential (after Wave 3) | 30 min |

**Total Tasks:** 12
**Maximum Parallelism:** Wave 2 (4 concurrent builds)
**Total Time (Sequential):** ~6-8 hours
**Total Time (Parallelized):** ~4-5 hours

---

## Dependencies Diagram

```
Wave 1:  [task-1: D1 Database] ──────────────────────────────────────────────>
         [task-2: API Deploy] ───> (depends on 1) ───────────────────────────>

Wave 2:  [task-3: CLI init/push] ──> (depends on 2) ─────────────────────────>
         [task-4: CLI list/rollback] ─> (depends on 2,3) ────────────────────>
         [task-5: SDK Build] ───────> (depends on 2) ────────────────────────>
         [task-6: Dashboard] ──────> (depends on 2) ─────────────────────────>

Wave 3:  [task-7: NERVE Tests] ────> (parallel) ─────────────────────────────>
         [task-8: CLI npm] ────────> (depends on 3,4) ───────────────────────>
         [task-9: SDK npm] ────────> (depends on 5) ─────────────────────────>

Wave 4:  [task-10: 60-sec Test] ───> (depends on 8) ─────────────────────────>
         [task-11: Git Commit] ────> (depends on 6,7,10) ────────────────────>
         [task-12: QA Pass] ───────> (depends on 11) ────────────────────────>
```

---

## Risk Notes

### Mitigated in This Plan

| Risk | Mitigation | Task |
|------|------------|------|
| D1 not created | Create database first, apply schema | task-1 |
| API not deployed | Deploy before CLI/SDK | task-2 |
| SDK not built | Build with caching in Wave 2 | task-5 |
| Dashboard missing | Build static HTML in Wave 2 | task-6 |
| NERVE untested | Test all scripts in Wave 3 | task-7 |
| npm names taken | Check availability, use fallback | task-8, task-9 |
| Time-to-value > 60s | Benchmark and document | task-10 |

### Remaining Risks (Monitor)

| Risk | Impact | Notes |
|------|--------|-------|
| npm publish permissions | Medium | May need npm login |
| D1 write limits | High | Monitor in production |
| SDK adoption unclear | High | Track installs post-launch |
| NERVE integration deferred | Medium | V1.1 decision needed |

---

## Verification Checklist

- [x] All 16 P0 requirements have task coverage
- [x] All P1 requirements addressed or deferred
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed
- [x] decisions.md cited throughout
- [x] docs/EMDASH-GUIDE.md Section 5 referenced for deployment
- [x] Critical path identified (API → CLI/SDK → Publish → QA)

---

## Ship Test

> Does `npm install -g drift-cli && drift init && drift push` work in under 60 seconds?

> Does `drift rollback` feel instant and safe?

> Does the SDK cache work transparently?

> Is the dashboard clean and professional?

> **If yes to all, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/promptops/decisions.md, prds/promptops.md, docs/EMDASH-GUIDE.md*
*Project Slug: promptops*
*Product Name: Drift + NERVE*
