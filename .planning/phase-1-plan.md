# Phase 1 Plan — Membership Production Fix

**Generated**: 2026-04-16
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 12
**Waves**: 3
**Time Budget**: 40 minutes maximum (10 min immediate fix + 30 min convention system)

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-1 (Fix entrypoint path) | phase-1-task-1 | 1 |
| REQ-2 (Update astro.config) | phase-1-task-1 | 1 |
| REQ-3 (Configure worker_loaders) | phase-1-task-2 | 1 |
| REQ-4 (Build and deploy) | phase-1-task-3 | 1 |
| REQ-5 (Verify manifest) | phase-1-task-4 | 2 |
| REQ-6 (Verify routes) | phase-1-task-4 | 2 |
| REQ-7 (Create resolver) | phase-1-task-5 | 2 |
| REQ-8 (Implement convention) | phase-1-task-5 | 2 |
| REQ-9 (Create validator) | phase-1-task-6 | 2 |
| REQ-10 (Modify loader) | phase-1-task-7 | 2 |
| REQ-11 (Simplified registration) | phase-1-task-8 | 2 |
| REQ-12 (Canonical example) | phase-1-task-8 | 2 |
| REQ-13-16 (Tests) | phase-1-task-9 | 2 |
| REQ-17-19 (Deployment) | phase-1-task-10, phase-1-task-11, phase-1-task-12 | 3 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Immediate Fix (10-minute budget)

**Goal:** Fix broken entrypoint, configure deployment, build and deploy to production

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Fix Plugin Entrypoint Path</title>
  <requirement>REQ-1, REQ-2 - Replace npm alias with real file path</requirement>
  <description>
    Fix the membership plugin descriptor entrypoint from fake npm alias `@shipyard/membership/sandbox` to actual resolvable path. Per research findings, the plugin uses package.json exports to resolve paths, so we need to ensure the entrypoint resolves correctly.

    **Critical Finding from Research:** The plugin's package.json already has the correct export mapping (`"./sandbox": "./src/sandbox-entry.ts"`), so the entrypoint should work IF the package is resolvable. The issue is that the astro.config is importing the descriptor correctly but the build-time module resolution fails.

    **Solution:** Keep the current pattern (it's correct per Emdash architecture) but ensure the plugin is properly linked/available during build.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Plugin descriptor with entrypoint definition" />
    <file path="/home/agent/shipyard-ai/plugins/membership/package.json" reason="Package exports configuration" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Plugin registration in site config" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6 defines plugin system architecture" />
  </context>

  <steps>
    <step order="1">Read current plugin descriptor: `/home/agent/shipyard-ai/plugins/membership/src/index.ts`</step>
    <step order="2">Read plugin package.json to verify exports: `/home/agent/shipyard-ai/plugins/membership/package.json`</step>
    <step order="3">Verify the export mapping `"./sandbox": "./src/sandbox-entry.ts"` exists</step>
    <step order="4">Check if sunrise-yoga has the plugin as a dependency - run `cat /home/agent/shipyard-ai/examples/sunrise-yoga/package.json | grep membership`</step>
    <step order="5">If missing, add plugin as local dependency: `"@shipyard/membership": "file:../../plugins/membership"` to sunrise-yoga package.json</step>
    <step order="6">Run `cd /home/agent/shipyard-ai/examples/sunrise-yoga && npm install` to link the plugin</step>
    <step order="7">Verify the plugin can be imported: Check that astro.config.mjs import works</step>
  </steps>

  <verification>
    <check type="test">Plugin package exports include "./sandbox" mapping</check>
    <check type="test">Sunrise yoga package.json includes @shipyard/membership dependency</check>
    <check type="test">npm install completes without errors</check>
    <check type="manual">Import statement in astro.config.mjs resolves correctly</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is wave 1 task -->
  </dependencies>

  <commit-message>fix(membership): link plugin to sunrise-yoga for build resolution

Added @shipyard/membership as local file dependency in sunrise-yoga.
Plugin entrypoint @shipyard/membership/sandbox now resolves via package.json exports.

Technical approach verified against EMDASH-GUIDE.md Section 6 (Plugin System).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Configure Worker Loaders for Sandboxed Plugins</title>
  <requirement>REQ-3 - Add worker_loaders binding if needed</requirement>
  <description>
    Check if wrangler.jsonc has worker_loaders binding configured for sandboxed plugin execution. Per EMDASH-GUIDE.md lines 1005-1014, sandboxed plugins require this binding on Cloudflare.

    **Research Finding:** Current wrangler.jsonc has D1, R2, and KV bindings but may be missing worker_loaders.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Cloudflare configuration file" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Lines 1005-1014 document worker_loaders requirement" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Plugin descriptor shows format: standard (sandboxed)" />
  </context>

  <steps>
    <step order="1">Read current wrangler.jsonc: `/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc`</step>
    <step order="2">Check if "worker_loaders" binding exists in configuration</step>
    <step order="3">If missing, add worker_loaders configuration: `"worker_loaders": [{"binding": "LOADER"}]`</step>
    <step order="4">Verify JSON is valid after modification</step>
    <step order="5">Document change if added, otherwise note that configuration was already correct</step>
  </steps>

  <verification>
    <check type="test">wrangler.jsonc is valid JSON</check>
    <check type="test">worker_loaders binding present in configuration</check>
    <check type="manual">Configuration matches EMDASH-GUIDE.md requirements</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is wave 1 task -->
  </dependencies>

  <commit-message>config(sunrise-yoga): add worker_loaders for sandboxed plugins

Added worker_loaders binding to wrangler.jsonc per Emdash requirements.
Required for sandboxed plugin execution on Cloudflare Workers.

Reference: EMDASH-GUIDE.md lines 1005-1014

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Build and Deploy to Production</title>
  <requirement>REQ-4 - Execute build and deployment workflow</requirement>
  <description>
    Build the sunrise-yoga site and deploy to production Cloudflare Workers. This validates that the plugin registration fix works and gets the plugin loaded in production.

    **Critical:** Source environment variables from .env file before deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/" reason="Site to build and deploy" />
    <file path="/home/agent/shipyard-ai/.env" reason="Environment variables for deployment" />
    <file path="/home/agent/shipyard-ai/prds/membership-production-fix.md" reason="Deploy command reference at lines 83-90" />
  </context>

  <steps>
    <step order="1">Change to sunrise-yoga directory: `cd /home/agent/shipyard-ai/examples/sunrise-yoga`</step>
    <step order="2">Source environment variables: `source /home/agent/shipyard-ai/.env`</step>
    <step order="3">Export required vars: `export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID`</step>
    <step order="4">Run build: `npm run build` (verify completes without errors)</step>
    <step order="5">Deploy to Cloudflare: `npx wrangler deploy`</step>
    <step order="6">Verify deployment completes successfully</step>
    <step order="7">Note the deployment URL (should be yoga.shipyard.company)</step>
  </steps>

  <verification>
    <check type="build">npm run build exits with code 0</check>
    <check type="build">No module resolution errors during build</check>
    <check type="test">npx wrangler deploy succeeds</check>
    <check type="manual">Deployment URL confirmed</check>
  </verification>

  <dependencies>
    <!-- No dependencies in wave 1 - but logically depends on task-1 and task-2 -->
  </dependencies>

  <commit-message>deploy(sunrise-yoga): deploy with membership plugin fix

Deployed to production with fixed plugin registration.
Build completed successfully with plugin entrypoint resolved.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 2 (Parallel after Wave 1) — Convention System & Verification (30-minute budget)

**Goal:** Implement convention-based plugin resolution and verify production deployment

---

<task-plan id="phase-1-task-4" wave="2">
  <title>Verify Plugin in Production</title>
  <requirement>REQ-5, REQ-6 - Verify manifest and plugin routes</requirement>
  <description>
    Verify that the membership plugin appears in the production manifest and that plugin routes are accessible (not returning INTERNAL_ERROR). This confirms the immediate fix worked.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/membership-production-fix.md" reason="Smoke test commands at lines 92-104" />
  </context>

  <steps>
    <step order="1">Test manifest: `curl -s https://yoga.shipyard.company/_emdash/api/manifest | python3 -c "import json,sys; d=json.load(sys.stdin); print([p.get('id') for p in d.get('plugins',[])])"`</step>
    <step order="2">Verify output includes "membership" in plugins list</step>
    <step order="3">Test admin route: `curl -s https://yoga.shipyard.company/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"page_load"}' | head -10`</step>
    <step order="4">Verify response is not INTERNAL_ERROR (expect 200 or auth error)</step>
    <step order="5">Test register route: `curl -s -X POST https://yoga.shipyard.company/_emdash/api/plugins/membership/register -H "Content-Type: application/json" -d '{"email":"test@example.com","plan":"basic"}' | head -10`</step>
    <step order="6">Verify response is not INTERNAL_ERROR</step>
    <step order="7">Document results: Manifest shows plugin, routes accessible</step>
  </steps>

  <verification>
    <check type="test">Manifest API returns ["membership"] in plugins array</check>
    <check type="test">Admin route returns 200 or 401/302 (not 500 INTERNAL_ERROR)</check>
    <check type="test">Register route returns valid response (not INTERNAL_ERROR)</check>
    <check type="manual">All smoke tests pass</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Must deploy before verifying production" />
  </dependencies>

  <commit-message>test(membership): verify production deployment - plugin loading

Production verification results:
✅ Plugin appears in manifest
✅ Admin route accessible
✅ Register route accessible
✅ No INTERNAL_ERROR responses

Immediate fix confirmed working.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Create Convention-Based Plugin Resolver</title>
  <requirement>REQ-7, REQ-8 - Build plugin name → path resolution system</requirement>
  <description>
    Create a plugin resolver module that implements the convention: plugin name "membership" → "plugins/membership/sandbox.ts". This eliminates the need for manual path configuration.

    **Decision Rationale:** Per decisions.md, convention over configuration prevents 100 future developers from wasting 5 hours each debugging paths.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Decision 2 defines convention system (lines 24-48)" />
  </context>

  <steps>
    <step order="1">Create shipyard-core directory if needed: `mkdir -p /home/agent/shipyard-ai/shipyard-core`</step>
    <step order="2">Create plugin-resolver.ts with resolvePluginEntrypoint function</step>
    <step order="3">Implement convention: `plugins/${name}/sandbox.ts`</step>
    <step order="4">Add path existence validation</step>
    <step order="5">Add error handling for missing plugins</step>
    <step order="6">Export function for use by plugin loader</step>
  </steps>

  <verification>
    <check type="test">resolvePluginEntrypoint("membership") returns "plugins/membership/sandbox.ts"</check>
    <check type="test">Function throws error for non-existent plugin names</check>
    <check type="manual">Code is clean, well-documented, follows TypeScript best practices</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Verify immediate fix works before building convention system" />
  </dependencies>

  <commit-message>feat(core): add convention-based plugin resolver

Created shipyard-core/plugin-resolver.ts implementing:
- Convention: plugin name → plugins/<name>/sandbox.ts
- Path validation and error handling
- Zero-config plugin loading foundation

Per Decision 2: Convention over configuration.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="2">
  <title>Create Build-Time Validator</title>
  <requirement>REQ-9 - Build validation that fails loudly</requirement>
  <description>
    Create a build validator that checks plugin entrypoints exist and throws errors (not warnings) when paths are invalid. This catches broken plugins at build time before they cause production issues.

    **Decision Rationale:** Per decisions.md Decision 3, "Build fails LOUDLY if plugin won't work in production."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Decision 3 mandates loud build failures (lines 53-63)" />
  </context>

  <steps>
    <step order="1">Create build-validator.ts in shipyard-core</step>
    <step order="2">Implement validatePluginExists function that checks file existence</step>
    <step order="3">Throw clear error (not warning) when entrypoint doesn't exist</step>
    <step order="4">Include helpful error message with file path and resolution suggestion</step>
    <step order="5">Add validation for plugin descriptor fields</step>
    <step order="6">Export function for build system integration</step>
  </steps>

  <verification>
    <check type="test">Validator throws error for invalid entrypoint paths</check>
    <check type="test">Error messages are clear and actionable</check>
    <check type="test">Validator passes for valid plugin configurations</check>
    <check type="manual">Error output helps developers fix issues quickly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Validator uses resolver to check paths" />
  </dependencies>

  <commit-message>feat(core): add build-time plugin validator

Created shipyard-core/build-validator.ts:
- Validates plugin entrypoints exist before build
- Throws errors (not warnings) for missing files
- Clear, actionable error messages

Per Decision 3: Make wrong things impossible at build time.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-7" wave="2">
  <title>Modify Plugin Loader</title>
  <requirement>REQ-10 - Update loader to use convention resolver</requirement>
  <description>
    Modify the plugin loader to accept string array syntax and use the convention resolver to auto-resolve entrypoints. This enables `plugins: ["membership"]` instead of descriptor objects.

    **Note:** This may need to be implemented in Emdash core rather than shipyard-ai if the plugin loader is part of the framework.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/shipyard-core/plugin-resolver.ts" reason="Convention resolver to use" />
    <file path="/home/agent/shipyard-ai/shipyard-core/build-validator.ts" reason="Validator to integrate" />
  </context>

  <steps>
    <step order="1">Locate or create plugin loader module in shipyard-core</step>
    <step order="2">Add support for string array input: `plugins: string[]`</step>
    <step order="3">For each string, call resolvePluginEntrypoint to get path</step>
    <step order="4">Call validatePluginExists before loading</step>
    <step order="5">Load plugin using resolved path</step>
    <step order="6">Maintain backwards compatibility with descriptor object syntax</step>
  </steps>

  <verification>
    <check type="test">loadPlugins(["membership"]) resolves and loads plugin</check>
    <check type="test">loadPlugins([descriptorObject]) still works (backwards compatible)</check>
    <check type="test">Build fails loudly when plugin string doesn't resolve</check>
    <check type="manual">API is intuitive and well-documented</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Needs validator for build-time checks" />
  </dependencies>

  <commit-message>feat(core): add string array support to plugin loader

Modified plugin loader to accept plugins: ["membership"] syntax:
- Uses convention resolver for path resolution
- Integrates build validator for loud failures
- Maintains backwards compatibility with descriptor objects

Per Decision 2: Zero-config plugin loading.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-8" wave="2">
  <title>Update Astro Config with Convention Syntax</title>
  <requirement>REQ-11, REQ-12 - Simplified registration and canonical example</requirement>
  <description>
    Update sunrise-yoga's astro.config.mjs to use the new convention-based syntax: `plugins: ["membership"]`. This serves as the canonical 5-line example.

    **Decision Rationale:** Per decisions.md Decision 5, "Documentation is an apology for bad design" - make the example self-explanatory.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Site config to update" />
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Decision 5 defines documentation philosophy (lines 83-93)" />
  </context>

  <steps>
    <step order="1">Read current astro.config.mjs</step>
    <step order="2">Replace `plugins: [membershipPlugin()]` with `plugins: ["membership"]`</step>
    <step order="3">Remove import statement: `import { membershipPlugin } from ...` (no longer needed)</step>
    <step order="4">Add comment explaining convention: `// Plugin names resolve to plugins/<name>/sandbox.ts`</step>
    <step order="5">Verify configuration is clean and minimal (5 lines or less for plugin config)</step>
    <step order="6">Test build to ensure convention system works</step>
  </steps>

  <verification>
    <check type="test">Build succeeds with new syntax</check>
    <check type="test">Plugin still loads correctly</check>
    <check type="manual">Config is clean, minimal, self-explanatory</check>
    <check type="manual">Serves as canonical example (copy-paste ready)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Plugin loader must support string syntax first" />
  </dependencies>

  <commit-message>refactor(sunrise-yoga): use convention-based plugin syntax

Simplified plugin registration:
- Before: import + function call + descriptor object
- After: plugins: ["membership"]

Serves as canonical 5-line example per Decision 5.
Zero manual configuration required.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-9" wave="2">
  <title>Create Unit and Integration Tests</title>
  <requirement>REQ-13, REQ-14, REQ-15, REQ-16 - Test coverage for new components</requirement>
  <description>
    Create comprehensive test suites for plugin resolver, build validator, and multi-plugin builds. Ensures the convention system is robust and well-tested.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/shipyard-core/plugin-resolver.ts" reason="Module to test" />
    <file path="/home/agent/shipyard-ai/shipyard-core/build-validator.ts" reason="Module to test" />
  </context>

  <steps>
    <step order="1">Create tests directory: `mkdir -p /home/agent/shipyard-ai/tests`</step>
    <step order="2">Create plugin-resolver.test.ts with unit tests</step>
    <step order="3">Test: resolvePluginEntrypoint("membership") returns correct path</step>
    <step order="4">Test: resolver throws error for non-existent plugins</step>
    <step order="5">Create build-validator.test.ts with unit tests</step>
    <step order="6">Test: validator fails on invalid entrypoints</step>
    <step order="7">Test: validator passes for valid configurations</step>
    <step order="8">Create integration test for multi-plugin builds</step>
    <step order="9">Run test suite: `npm test` (or equivalent)</step>
  </steps>

  <verification>
    <check type="test">All unit tests pass</check>
    <check type="test">Integration tests pass</check>
    <check type="test">Test coverage is comprehensive</check>
    <check type="manual">Tests are well-documented and maintainable</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Need full system working before integration tests" />
  </dependencies>

  <commit-message>test(core): add comprehensive test coverage for plugin system

Created test suites:
- plugin-resolver.test.ts: Convention resolution tests
- build-validator.test.ts: Build-time validation tests
- Integration tests for multi-plugin scenarios

All tests passing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 3 (Sequential after Wave 2) — Deployment & Finalization

**Goal:** Commit changes, verify production, finalize deployment

---

<task-plan id="phase-1-task-10" wave="3">
  <title>Commit All Changes</title>
  <requirement>REQ-17 - Git commit with clear message</requirement>
  <description>
    Commit all implementation changes with a clear, comprehensive commit message documenting both the immediate fix and the convention system.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/" reason="Repository root" />
  </context>

  <steps>
    <step order="1">Stage all modified files: `git add -A`</step>
    <step order="2">Review staged changes: `git status`</step>
    <step order="3">Create commit with comprehensive message documenting both phases</step>
    <step order="4">Include technical details and decision references</step>
    <step order="5">Verify commit created successfully</step>
  </steps>

  <verification>
    <check type="test">git status shows clean working tree</check>
    <check type="test">git log shows commit with clear message</check>
    <check type="manual">Commit message references requirements and decisions</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="All work complete before committing" />
  </dependencies>

  <commit-message>feat(membership): fix production plugin loading + convention system

Phase 1: Immediate Fix (10 min)
✅ Fixed plugin entrypoint resolution by adding local dependency
✅ Configured worker_loaders for sandboxed execution
✅ Deployed to production - plugin now loading
✅ Verified manifest shows membership plugin
✅ Verified routes accessible (no INTERNAL_ERROR)

Phase 2: Convention System (30 min)
✅ Created plugin-resolver.ts for convention-based resolution
✅ Created build-validator.ts for loud build failures
✅ Modified plugin loader to support string array syntax
✅ Updated astro.config to use plugins: ["membership"]
✅ Added comprehensive test coverage

Technical Approach:
- Verified against EMDASH-GUIDE.md Section 6
- Follows package.json exports pattern
- Convention: plugin name → plugins/<name>/sandbox.ts
- Build validation throws errors (not warnings)

Decision Alignment:
- Decision 1: Hardcode fix + convention in 40 minutes ✅
- Decision 2: Convention over configuration ✅
- Decision 3: Self-verifying build system ✅
- Decision 4: Ship timeline 40 minutes ✅
- Decision 5: Zero documentation needed (self-explanatory) ✅

Total time: ≤40 minutes
Zero banned patterns: N/A (build system fix, not code change)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-11" wave="3">
  <title>Final Production Verification</title>
  <requirement>REQ-18, REQ-19 - Deploy within budget and verify production</requirement>
  <description>
    Final verification that the plugin works in production and the implementation was completed within the 40-minute time budget.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Decision 4 mandates 40-minute timeline" />
  </context>

  <steps>
    <step order="1">Calculate total elapsed time from task-1 start</step>
    <step order="2">Verify time ≤ 40 minutes (10 min phase 1 + 30 min phase 2)</step>
    <step order="3">Re-test production manifest: `curl https://yoga.shipyard.company/_emdash/api/manifest`</step>
    <step order="4">Re-test plugin routes to confirm no regressions</step>
    <step order="5">Document final production state</step>
    <step order="6">Confirm all success criteria met</step>
  </steps>

  <verification>
    <check type="test">Total time ≤ 40 minutes</check>
    <check type="test">Production manifest shows membership plugin</check>
    <check type="test">Plugin routes accessible</check>
    <check type="manual">All success criteria from requirements met</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Verify after commit" />
  </dependencies>

  <commit-message>verify(membership): production deployment confirmed - all criteria met

Final production verification:
✅ Plugin in manifest
✅ Routes accessible
✅ Convention system working
✅ Build fails loudly on errors
✅ Time budget: ≤40 minutes

Success criteria achieved:
- Plugin loads in production ✅
- Zero manual configuration required ✅
- Build fails loudly on broken plugins ✅
- Total implementation time ≤40 minutes ✅

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-12" wave="3">
  <title>Sara Blakely Customer Gut-Check</title>
  <requirement>SKILL.md Step 7 - Customer perspective validation</requirement>
  <description>
    Spawn a haiku sub-agent as Sara Blakely to gut-check the implementation from a customer perspective. Would a customer pay for this? What feels like engineering vanity vs customer value?
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/skills/agency-plan/SKILL.md" reason="Step 7 mandates Sara Blakely review" />
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/prds/membership-production-fix.md" reason="Original PRD" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent with Sara Blakely persona</step>
    <step order="2">Agent reads phase-1-plan.md and membership-production-fix.md</step>
    <step order="3">Agent answers: Would a customer pay? What's the hook? Engineering vanity vs value?</step>
    <step order="4">Agent writes to .planning/sara-blakely-review.md</step>
    <step order="5">Review results for critical customer concerns</step>
  </steps>

  <verification>
    <check type="test">Sara Blakely review file created</check>
    <check type="manual">Review customer perspective feedback</check>
    <check type="manual">No major red flags requiring changes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Complete all work before customer review" />
  </dependencies>

  <commit-message>review(membership): Sara Blakely customer gut-check complete

Customer perspective review completed.
See .planning/sara-blakely-review.md for analysis.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

**Critical Risks from Research Agents:**

1. **Plugin Package Linking** - The plugin may not be resolvable if not properly linked as a dependency. Mitigation: Add as local file dependency in task-1.

2. **Build Time Validation** - No existing loud failures for broken plugins. Mitigation: Build validator in task-6.

3. **Time Budget** - 40 minutes is tight for both phases. Mitigation: Clear scope, ruthless discipline, parallel execution where possible.

4. **Convention System Complexity** - Risk of over-engineering. Mitigation: Keep resolver simple (single function, clear convention).

---

## Definition of Done

Phase 1 is complete when:

- [ ] Plugin loads in production (manifest verification)
- [ ] Plugin routes accessible (no INTERNAL_ERROR)
- [ ] Convention system implemented (plugins: ["membership"] works)
- [ ] Build fails loudly on broken plugins
- [ ] Tests passing
- [ ] Changes committed with clear message
- [ ] Total time ≤40 minutes
- [ ] Sara Blakely review complete

---

**Plan Status**: READY FOR EXECUTION
**Time Budget**: 40 minutes maximum
**Quality Standard**: Binary outcome - works completely or rollback
