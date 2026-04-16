# Phase 1 Plan — Deploy Sunrise Yoga + Verify Plugins

**Generated**: 2026-04-16
**Requirements**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-75.md`
**Total Tasks**: 6
**Waves**: 3
**Target Timeline**: < 15 minutes (per Decision 4 in decisions.md)

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Priority |
|-------------|---------|------|----------|
| REQ-1: Verify Prerequisites | phase-1-task-1 | 1 | P0 |
| REQ-2: Fix EventDash Registration | phase-1-task-2, phase-1-task-3 | 1 | P0 |
| REQ-3: Fix EventDash Entrypoint | phase-1-task-4 | 1 | P0 |
| REQ-4: Build Application | phase-1-task-5 | 2 | P0 |
| REQ-5: Deploy to Production | phase-1-task-5 | 2 | P0 |
| REQ-6-9: Smoke Tests | phase-1-task-5 | 2 | P0 |
| REQ-10: Commit & Push | phase-1-task-6 | 3 | P0 |

---

## Wave Execution Order

### Wave 1 (Parallel Configuration Fixes)
Tasks that fix configuration issues. All are independent and can run in parallel:
- **phase-1-task-1**: Verify prerequisites (wrangler, environment)
- **phase-1-task-2**: Register EventDash in astro.config.mjs
- **phase-1-task-3**: Add EventDash dependency to package.json
- **phase-1-task-4**: Fix EventDash entrypoint path to use absolute path

**Estimated Time**: 3-5 minutes

### Wave 2 (Build + Deploy + Verify — Sequential)
Tasks that build, deploy, and verify. Must run after Wave 1:
- **phase-1-task-5**: Build, deploy, and run all smoke tests

**Estimated Time**: 5-8 minutes

### Wave 3 (Version Control)
Final commit after verification passes:
- **phase-1-task-6**: Commit and push changes

**Estimated Time**: 1-2 minutes

**Total Estimated Time**: 9-15 minutes

---

## Task Plans

<task-plan id="phase-1-task-1" wave="1">
  <title>Verify Prerequisites</title>
  <requirement>REQ-1: Verify wrangler.jsonc worker_loaders binding and environment are configured</requirement>
  <description>
    Verify that prior related issues (worker_loaders binding, environment setup) have been fixed and that the system is ready for deployment.

    **Technical Context**: Per EMDASH-GUIDE.md Section 6, sandboxed plugins require worker_loaders binding in wrangler.jsonc. This was addressed in a related issue but must be verified before proceeding.

    **Why This Matters**: Building without proper configuration wastes time (2-3 min build time) and could cause silent failures.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Must contain worker_loaders binding" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/.env" reason="Contains CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Lines 1005-1013 define required worker_loaders configuration" />
  </context>

  <steps>
    <step order="1">Run `npx wrangler whoami` to verify Cloudflare authentication is working</step>
    <step order="2">Read wrangler.jsonc and verify worker_loaders binding exists with exact syntax: "worker_loaders": [{"binding": "LOADER"}]</step>
    <step order="3">Verify .env file exists and contains CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID</step>
    <step order="4">Verify D1 database binding is present (binding: "DB")</step>
    <step order="5">Verify R2 bucket binding is present (binding: "MEDIA")</step>
  </steps>

  <verification>
    <check type="manual">npx wrangler whoami returns valid account information</check>
    <check type="manual">grep -q '"worker_loaders"' examples/sunrise-yoga/wrangler.jsonc</check>
    <check type="manual">grep -q 'CLOUDFLARE_API_TOKEN' examples/sunrise-yoga/.env</check>
    <check type="manual">All prerequisite fixes from related issues are in place</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is a prerequisite check -->
  </dependencies>

  <commit-message>N/A - No changes made, verification only</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Register EventDash Plugin in astro.config.mjs</title>
  <requirement>REQ-2 (Part 1): Import and register eventdashPlugin in Emdash integration</requirement>
  <description>
    Add EventDash plugin registration to astro.config.mjs. Currently only membership plugin is registered, but both plugins must be active for smoke tests to pass.

    **Current State**: plugins: [membershipPlugin()]
    **Required State**: plugins: [membershipPlugin(), eventdashPlugin()]

    **Why This Matters**: Per decisions.md Decision 2, manifest endpoint must return exactly {'membership', 'eventdash'}. Missing registration causes smoke test failure.

    **Technical Reference**: EMDASH-GUIDE.md Section 6 shows plugin registration pattern. Membership plugin serves as working reference implementation.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Target file that needs eventdashPlugin registration" />
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/index.ts" reason="Exports eventdashPlugin() function" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation for plugin registration pattern" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6 (lines 915-936) documents plugin registration" />
  </context>

  <steps>
    <step order="1">Read astro.config.mjs to understand current plugin configuration</step>
    <step order="2">Add import statement after membership import: import { eventdashPlugin } from "../../plugins/eventdash/src/index.js"</step>
    <step order="3">Add eventdashPlugin() to plugins array in emdash integration: plugins: [membershipPlugin(), eventdashPlugin()]</step>
    <step order="4">Verify JavaScript syntax is valid (no trailing commas, proper array formatting)</step>
  </steps>

  <verification>
    <check type="manual">grep -q 'eventdashPlugin' examples/sunrise-yoga/astro.config.mjs</check>
    <check type="manual">Verify import statement points to correct path: ../../plugins/eventdash/src/index.js</check>
    <check type="manual">Verify plugins array contains both membershipPlugin() and eventdashPlugin()</check>
    <check type="manual">Run: node -c examples/sunrise-yoga/astro.config.mjs to verify syntax</check>
  </verification>

  <dependencies>
    <!-- Independent of other Wave 1 tasks -->
  </dependencies>

  <commit-message>fix(sunrise-yoga): register eventdash plugin in astro config

Add eventdashPlugin to Emdash integration plugins array. Both
membership and eventdash plugins must be registered for production
deployment per requirements.

Part of #75</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Add EventDash Dependency to package.json</title>
  <requirement>REQ-2 (Part 2): Add @shipyard/eventdash as file dependency</requirement>
  <description>
    Add EventDash plugin to package.json dependencies. Currently only membership is listed. Without this, npm install and build may fail to resolve the plugin module.

    **Required Entry**: "@shipyard/eventdash": "file:../../plugins/eventdash"

    **Pattern**: Match existing membership dependency format exactly.

    **Why This Matters**: Node module resolution requires all imported packages to be declared in dependencies, even for local file references.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/package.json" reason="Target file that needs eventdash dependency" />
    <file path="/home/agent/shipyard-ai/plugins/eventdash/package.json" reason="Eventdash plugin package definition" />
  </context>

  <steps>
    <step order="1">Read package.json to locate dependencies section</step>
    <step order="2">Find the existing membership dependency entry: "@shipyard/membership": "file:../../plugins/membership"</step>
    <step order="3">Add eventdash dependency after membership with same pattern: "@shipyard/eventdash": "file:../../plugins/eventdash"</step>
    <step order="4">Verify JSON syntax is valid (proper commas, formatting)</step>
    <step order="5">Ensure dependency path is correct relative to examples/sunrise-yoga/</step>
  </steps>

  <verification>
    <check type="manual">grep -q '@shipyard/eventdash' examples/sunrise-yoga/package.json</check>
    <check type="manual">Verify path is exactly: file:../../plugins/eventdash</check>
    <check type="manual">Run: jq empty examples/sunrise-yoga/package.json to validate JSON</check>
  </verification>

  <dependencies>
    <!-- Independent of other Wave 1 tasks -->
  </dependencies>

  <commit-message>fix(sunrise-yoga): add eventdash plugin dependency

Add @shipyard/eventdash to package.json dependencies to enable
module resolution for the eventdash plugin import.

Part of #75</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Fix EventDash Plugin Entrypoint Path</title>
  <requirement>REQ-3: Change EventDash to use absolute file path instead of npm alias</requirement>
  <description>
    Fix EventDash plugin entrypoint to use absolute file path resolution, matching the membership plugin pattern. NPM aliases (@shipyard/eventdash/sandbox) work in Node.js but fail in Cloudflare Workers where there's no access to node_modules.

    **Current (BROKEN)**: entrypoint: "@shipyard/eventdash/sandbox"
    **Required (WORKING)**: entrypoint: join(dirname(fileURLToPath(import.meta.url)), "sandbox-entry.ts")

    **Why This Matters**: Per decisions.md and codebase research, this exact issue was fixed for membership plugin in commit d9a06f7. EventDash must use the same pattern.

    **Technical Reference**: EMDASH-GUIDE.md Section 6 documents plugin entrypoint requirements. Bundlers resolve absolute paths correctly for Workers deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/index.ts" reason="Target file with broken npm alias entrypoint" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation showing correct absolute path pattern (lines 16-19)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6 documents plugin descriptor format" />
  </context>

  <steps>
    <step order="1">Read plugins/eventdash/src/index.ts to see current entrypoint configuration</step>
    <step order="2">Read plugins/membership/src/index.ts lines 16-28 to see correct pattern</step>
    <step order="3">Add required imports at top of eventdash index.ts: import { fileURLToPath } from "node:url"; import { dirname, join } from "node:path";</step>
    <step order="4">Add path resolution before return statement: const currentDir = dirname(fileURLToPath(import.meta.url)); const entrypointPath = join(currentDir, "sandbox-entry.ts");</step>
    <step order="5">Replace entrypoint value from "@shipyard/eventdash/sandbox" to entrypointPath variable</step>
    <step order="6">Add inline comment explaining why absolute path is required: // NOTE: Use real file path instead of npm alias. The alias works in local dev via node_modules but fails in Cloudflare Workers which only has access to bundled code. Bundler resolves absolute paths correctly.</step>
  </steps>

  <verification>
    <check type="manual">grep -q 'fileURLToPath' plugins/eventdash/src/index.ts</check>
    <check type="manual">grep -q 'entrypointPath' plugins/eventdash/src/index.ts</check>
    <check type="manual">Verify npm alias "@shipyard/eventdash/sandbox" is removed from code</check>
    <check type="manual">Diff eventdash/src/index.ts against membership/src/index.ts to confirm pattern match</check>
  </verification>

  <dependencies>
    <!-- Independent of other Wave 1 tasks -->
  </dependencies>

  <commit-message>fix(eventdash): use absolute path for plugin entrypoint

Change entrypoint from npm alias "@shipyard/eventdash/sandbox" to
absolute file path resolution. NPM aliases work in Node.js but fail
in Cloudflare Workers (no node_modules access).

Matches membership plugin pattern from commit d9a06f7.

Part of #75</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Build, Deploy, and Verify Plugins</title>
  <requirement>REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-9: Build application, deploy to production, and run complete smoke test suite</requirement>
  <description>
    Build the Sunrise Yoga application, deploy to Cloudflare Workers production, and run the complete smoke test suite to verify both plugins load correctly.

    **Zero Tolerance Policy** (Decision 2): All smoke tests must pass. No INTERNAL_ERROR responses allowed. Manifest must be source of truth.

    **Smoke Tests**:
    1. Manifest endpoint returns clean JSON
    2. Both plugins present in manifest
    3. Python assertion passes: plugins == {'membership', 'eventdash'}
    4. Membership admin route returns non-500
    5. EventDash admin route returns non-500

    **Why This Matters**: Per decisions.md, this is the proof that the deployment works. Failing any smoke test means the task is incomplete.

    **Time Budget**: Must complete in <15 minutes total per Decision 4.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/package.json" reason="Contains build and deploy scripts" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Deployment configuration" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/.env" reason="Cloudflare credentials" />
    <file path="/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-75.md" reason="Lines 35-53 define exact smoke test commands" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-75/decisions.md" reason="Lines 139-154 define smoke test suite; Decision 2 establishes zero-tolerance policy" />
  </context>

  <steps>
    <step order="1">Change directory to examples/sunrise-yoga</step>
    <step order="2">Source environment: source /home/agent/shipyard-ai/.env</step>
    <step order="3">Export credentials: export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID</step>
    <step order="4">Run build: npm run build</step>
    <step order="5">Verify build succeeded with exit code 0</step>
    <step order="6">Deploy to production: npx wrangler deploy</step>
    <step order="7">Wait for deployment completion (note deployment URL)</step>
    <step order="8">SMOKE TEST 1: curl -s https://yoga.shipyard.company/_emdash/api/manifest | jq . (verify returns clean JSON)</step>
    <step order="9">SMOKE TEST 2: Run Python assertion to verify exact plugin set - curl manifest, parse JSON, assert plugins == {'membership', 'eventdash'}</step>
    <step order="10">SMOKE TEST 3: curl -s https://yoga.shipyard.company/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"page_load"}' (verify no INTERNAL_ERROR)</step>
    <step order="11">SMOKE TEST 4: curl -s https://yoga.shipyard.company/_emdash/api/plugins/eventdash/admin -H "Content-Type: application/json" -d '{"type":"page_load"}' (verify no INTERNAL_ERROR)</step>
    <step order="12">Verify ALL smoke tests passed before marking task complete</step>
  </steps>

  <verification>
    <check type="build">npm run build exits with code 0</check>
    <check type="manual">npx wrangler deploy completes successfully</check>
    <check type="test">Manifest endpoint returns HTTP 200 with valid JSON</check>
    <check type="test">Python assertion passes: assert plugins == {'membership', 'eventdash'}</check>
    <check type="test">Membership admin route returns non-500, no INTERNAL_ERROR</check>
    <check type="test">EventDash admin route returns non-500, no INTERNAL_ERROR</check>
    <check type="manual">All 4 smoke tests completed successfully</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="EventDash must be registered in astro.config.mjs before build" />
    <depends-on task-id="phase-1-task-3" reason="EventDash dependency must be in package.json before build" />
    <depends-on task-id="phase-1-task-4" reason="EventDash entrypoint must use absolute path before build" />
  </dependencies>

  <commit-message>N/A - Verification task, changes will be committed in phase-1-task-6</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="3">
  <title>Commit and Push Changes</title>
  <requirement>REQ-10: Commit all changes with proper message and push to origin main</requirement>
  <description>
    Commit all configuration fixes to version control with a descriptive conventional commit message that references Issue #75.

    **Files to Commit**:
    - examples/sunrise-yoga/astro.config.mjs (eventdash registration)
    - examples/sunrise-yoga/package.json (eventdash dependency)
    - plugins/eventdash/src/index.ts (absolute path entrypoint)

    **Commit Format**: Conventional commits with detailed body explaining what was fixed and why. Include "Resolves #75" for GitHub issue linking.

    **Why This Matters**: Version control preserves the fix, enables auditing, and allows rollback if needed. Proper commit message documents the problem and solution for future developers.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Modified - eventdash registration" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/package.json" reason="Modified - eventdash dependency" />
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/index.ts" reason="Modified - absolute path entrypoint" />
    <file path="/home/agent/shipyard-ai/CLAUDE.md" reason="Lines 135-177 define git commit protocol" />
  </context>

  <steps>
    <step order="1">Run git status to see all modified files</step>
    <step order="2">Run git diff to review exact changes</step>
    <step order="3">Verify only intentional changes are present (3 files expected)</step>
    <step order="4">Stage all changes: git add examples/sunrise-yoga/astro.config.mjs examples/sunrise-yoga/package.json plugins/eventdash/src/index.ts</step>
    <step order="5">Create commit with HEREDOC message format per CLAUDE.md</step>
    <step order="6">Commit message title: fix: Deploy Sunrise Yoga with verified plugins</step>
    <step order="7">Commit message body: Document what was fixed (eventdash registration, dependency, entrypoint path) and verification results (all smoke tests passed)</step>
    <step order="8">Include "Resolves #75" footer for GitHub issue linking</step>
    <step order="9">Include Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt; footer</step>
    <step order="10">Execute commit</step>
    <step order="11">Push to origin main: git push origin main</step>
    <step order="12">Verify push succeeded and working tree is clean</step>
  </steps>

  <verification>
    <check type="manual">git log -1 --oneline shows commit with "fix: Deploy Sunrise Yoga" prefix</check>
    <check type="manual">git show HEAD displays correct 3 file changes</check>
    <check type="manual">Commit message includes "Resolves #75"</check>
    <check type="manual">git status shows working tree clean</check>
    <check type="manual">git log -1 confirms push to origin main successful</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Cannot commit until all smoke tests pass" />
  </dependencies>

  <commit-message>fix: Deploy Sunrise Yoga with verified plugins

Register EventDash plugin and fix configuration issues to enable
both membership and eventdash plugins in production.

Changes:
- Added eventdashPlugin import and registration in astro.config.mjs
- Added @shipyard/eventdash dependency to package.json
- Fixed EventDash entrypoint to use absolute path (not npm alias)

All smoke tests passing:
✓ Manifest endpoint returns clean JSON
✓ Both plugins present: {'membership', 'eventdash'}
✓ Membership admin route accessible (no INTERNAL_ERROR)
✓ EventDash admin route accessible (no INTERNAL_ERROR)

Resolves #75

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

## Risk Notes

### Critical Risks Identified by Risk Scanner

**RISK 1: EventDash Plugin Not Registered** (CRITICAL - Now Mitigated)
- **Issue**: astro.config.mjs only has membership plugin
- **Impact**: Smoke tests will fail; eventdash won't be in manifest
- **Mitigation**: phase-1-task-2 fixes registration
- **Status**: Addressed in Wave 1

**RISK 2: EventDash Uses NPM Alias** (HIGH - Now Mitigated)
- **Issue**: entrypoint uses "@shipyard/eventdash/sandbox" instead of absolute path
- **Impact**: Plugin fails to load in Cloudflare Workers
- **Mitigation**: phase-1-task-4 converts to absolute path
- **Status**: Addressed in Wave 1

**RISK 3: Time Limit Exceeded** (MEDIUM)
- **Issue**: 15-minute session limit per decisions.md
- **Likelihood**: Medium if network slow or npm cache invalidates
- **Mitigation**: Pre-verify wrangler auth, skip npm install if possible
- **Escalation**: If exceeds 15 min, mark incomplete and escalate

**RISK 4: Smoke Tests Pass but Production Broken** (MEDIUM)
- **Issue**: Tests verify HTTP responses but not full functionality
- **Likelihood**: Low with exact production URLs
- **Mitigation**: Use EXACT production URLs (not localhost), run all 4 tests
- **Monitoring**: Steve reviews quality gates per Decision 2

**RISK 5: Environment Secrets Missing** (LOW)
- **Issue**: EMDASH_AUTH_SECRET might not be in Cloudflare dashboard
- **Impact**: Auth fails silently in production
- **Mitigation**: Verify .env exists in phase-1-task-1
- **Note**: Secret should be configured in Cloudflare, not just .env

---

## Wave Dependencies Diagram

```
Wave 1 (Parallel - 4 tasks)
├─ task-1: Verify prerequisites
├─ task-2: Register EventDash in astro.config.mjs
├─ task-3: Add EventDash to package.json
└─ task-4: Fix EventDash entrypoint path
      ↓
Wave 2 (Sequential - 1 task)
└─ task-5: Build + Deploy + Smoke Tests (depends on Wave 1 complete)
      ↓
Wave 3 (Sequential - 1 task)
└─ task-6: Commit & Push (depends on task-5 passing)
```

---

## Success Criteria (Launch Readiness)

### Phase 1 Complete When:
- [ ] wrangler.jsonc verified (worker_loaders present)
- [ ] EventDash imported in astro.config.mjs
- [ ] EventDash in plugins array
- [ ] EventDash dependency in package.json
- [ ] EventDash uses absolute path entrypoint
- [ ] npm run build succeeds (exit code 0)
- [ ] npx wrangler deploy succeeds
- [ ] Manifest endpoint returns HTTP 200 with clean JSON
- [ ] Manifest includes exactly {'membership', 'eventdash'}
- [ ] Python assertion passes
- [ ] Membership admin route returns non-500
- [ ] EventDash admin route returns non-500
- [ ] All changes committed with proper message
- [ ] Changes pushed to origin main
- [ ] Git working tree clean

### Phase 1 Fails If:
- [ ] Any smoke test fails
- [ ] Build fails after configuration changes
- [ ] Deploy fails with errors
- [ ] Manifest returns INTERNAL_ERROR
- [ ] Plugin routes return 500 status
- [ ] Python assertion fails (wrong plugins in manifest)
- [ ] Session exceeds 15 minutes

---

## Key References (Read Before Execution)

**Critical Documentation:**
- `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (Section 6: Plugin System) — Technical reference for plugin architecture
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-75/decisions.md` — Locked decisions constraining implementation
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-75.md` — Original issue and smoke test specifications

**Code Patterns:**
- `/home/agent/shipyard-ai/plugins/membership/src/index.ts` — Reference implementation for absolute path entrypoint (lines 16-28)
- `/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs` — Target file for plugin registration

**Configuration Files:**
- `/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc` — Cloudflare Workers configuration
- `/home/agent/shipyard-ai/examples/sunrise-yoga/package.json` — Dependencies and scripts

---

## Philosophical Synthesis (Per decisions.md)

**Elon's Physics**: Ship the simplest thing that works. Bash scripts + curl assertions. No abstraction layers. Fix config → rebuild → deploy → verify → commit.

**Steve's Poetry**: Every endpoint is a promise. Zero tolerance for INTERNAL_ERROR. Manifest is source of truth. Quality isn't optional.

**Zen Master's Truth**: Speed and quality aren't enemies. Simple fixes ship fast (config changes), prove they work (smoke tests), then automate (future CI/CD).

---

**Plan Status:** READY FOR EXECUTION
**Owner:** Build Agent
**Reviewer:** Phil Jackson (Orchestrator)
**Created:** 2026-04-16
**Estimated Completion:** < 15 minutes

---

*"The strength of the team is each individual member. The strength of each member is the team."* — Phil Jackson
