# Phase 1 Plan — Deploy All Plugins to Sunrise Yoga

**Generated**: 2026-04-16
**Requirements**: /home/agent/shipyard-ai/prds/deploy-all-plugins.md
**Requirements Doc**: /home/agent/shipyard-ai/.planning/REQUIREMENTS.md
**Total Tasks**: 8
**Waves**: 4
**Priority**: P0 (Hotfix)

---

## Executive Summary

This is a P0 hotfix to deploy Sunrise Yoga with all 6 plugins registered and verified. The PRD explicitly states that prerequisites (plugin entrypoints + EventDash 95 banned pattern violations) must be completed first. Research reveals these prerequisites are **NOT YET COMPLETE**:

1. **EventDash has 95 violations** (BLOCKER) - Fixed version exists at `/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts`
2. **Three plugins use banned npm alias entrypoints** - formforge, reviewpulse, seodash still use `@shipyard/{name}/sandbox`
3. **Only 2 of 6 plugins registered** - commercekit, formforge, reviewpulse, seodash missing from astro.config.mjs

This plan addresses all blockers and completes the full deployment pipeline: fix prerequisites → register all → build → deploy → smoke test → commit.

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Status |
|-------------|---------|------|--------|
| **Prerequisites** | | | |
| Fix EventDash violations | phase-1-task-1 | 1 | ❌ 95 violations |
| Fix plugin entrypoints | phase-1-task-2, 3, 4 | 1 | ❌ 3 plugins broken |
| **Core Requirements** | | | |
| REQ-1: All plugins registered | phase-1-task-5 | 2 | ❌ 4 missing |
| REQ-2: Zero violations | phase-1-task-1 | 1 | ❌ EventDash |
| REQ-3: Build succeeds | phase-1-task-5 | 2 | ⚠️ Blocked |
| REQ-4: Deploy succeeds | phase-1-task-6 | 3 | ⚠️ Blocked |
| REQ-5: Smoke tests pass | phase-1-task-7 | 3 | ⚠️ Blocked |
| REQ-6: Commit and push | phase-1-task-8 | 4 | ⚠️ Blocked |

---

## Wave Execution Order

### Wave 1 (Parallel) — Prerequisites: Fix Violations & Entrypoints

These tasks fix blockers and can run in parallel:

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Fix EventDash 95 banned pattern violations</title>
  <requirement>PRD Prerequisite: Fix EventDash 95 banned pattern violations. REQ-2: Verify zero violations.</requirement>
  <description>
    EventDash currently has 95 banned pattern violations (77 `throw new Response`, 18 `rc.user`/`rc.pathParams` accesses) which cause INTERNAL_ERROR at runtime. A fixed version with 0 violations exists at /home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts. Copy this fixed version to replace the broken one.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts" reason="Broken file with 95 violations (3442 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts" reason="Fixed version with 0 violations to copy from" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements REQ-2 with verification command (lines 36-58)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin sandbox patterns § 6 (lines 995-1047)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts to verify it exists and has content</step>
    <step order="2">Run verification on BOTH files to confirm: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` (should show 95) and same command on deliverables/eventdash-fix/sandbox-entry.ts (should show 0)</step>
    <step order="3">Backup current file: `cp plugins/eventdash/src/sandbox-entry.ts plugins/eventdash/src/sandbox-entry.ts.backup-$(date +%Y%m%d)`</step>
    <step order="4">Copy fixed version: `cp deliverables/eventdash-fix/sandbox-entry.ts plugins/eventdash/src/sandbox-entry.ts`</step>
    <step order="5">Run verification again on the now-replaced file: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` (MUST show 0)</step>
    <step order="6">Verify file compiles: `cd plugins/eventdash && npx tsc --noEmit src/sandbox-entry.ts`</step>
  </steps>

  <verification>
    <check type="build">grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts MUST return 0</check>
    <check type="build">npx tsc --noEmit plugins/eventdash/src/sandbox-entry.ts MUST exit 0 (no TypeScript errors)</check>
    <check type="manual">Compare file sizes: fixed version should be similar size to original (within 10%)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can run immediately -->
  </dependencies>

  <commit-message>fix(eventdash): replace sandbox-entry with fixed version (0 violations)

Replaced plugins/eventdash/src/sandbox-entry.ts with the fixed version from
deliverables/eventdash-fix/ which has zero banned pattern violations.

Before: 95 violations (77 throw new Response, 18 rc.user/rc.pathParams)
After: 0 violations

All banned patterns replaced with correct sandbox-compliant patterns:
- throw new Response → return Response.json()
- rc.user → ctx.user
- rc.pathParams → route handler params

This is a prerequisite for deployment per PRD.

Fixes: REQ-2 (EventDash portion)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Fix formforge plugin entrypoint</title>
  <requirement>PRD Prerequisite: Fix plugin entrypoints. Formforge uses banned npm alias pattern.</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/formforge/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. The npm alias works in local dev via node_modules but fails on Cloudflare Workers which only has access to bundled code.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="File to modify (lines 1-37, line 26 has broken entrypoint)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/plugins/commercekit/src/index.ts" reason="Another working example (lines 1-50)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Reference pattern (lines 228-244)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/formforge/src/index.ts to confirm line 26 has: entrypoint: "@shipyard/formforge/sandbox"</step>
    <step order="2">Add imports at top of file AFTER the existing `import type { PluginDescriptor } from "emdash";` line: `import { fileURLToPath } from "node:url";` and on next line: `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside formforgePlugin() function, add path resolution code BEFORE the return statement: First line: `const currentDir = dirname(fileURLToPath(import.meta.url));` Second line: `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Add comment above path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/formforge/sandbox)` then next line: `// The alias works in local dev via node_modules but fails in Cloudflare Workers` then next line: `// which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="5">Replace line 26: change `entrypoint: "@shipyard/formforge/sandbox",` to `entrypoint: entrypointPath,`</step>
    <step order="6">Verify pattern matches membership plugin exactly (compare lines 16-28 of membership to formforge)</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit plugins/formforge/src/index.ts MUST exit 0</check>
    <check type="manual">grep "entrypointPath" plugins/formforge/src/index.ts MUST find the variable</check>
    <check type="manual">grep "@shipyard/formforge/sandbox" plugins/formforge/src/index.ts MUST NOT find the banned pattern</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can run immediately -->
  </dependencies>

  <commit-message>fix(formforge): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/formforge/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

This is a prerequisite for deployment per PRD.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Fix reviewpulse plugin entrypoint</title>
  <requirement>PRD Prerequisite: Fix plugin entrypoints. Reviewpulse uses banned npm alias pattern.</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/reviewpulse/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. The npm alias works in local dev via node_modules but fails on Cloudflare Workers which only has access to bundled code.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts" reason="File to modify (lines 1-38, line 24 has broken entrypoint)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Reference pattern (lines 228-244)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts to confirm line 24 has: entrypoint: "@shipyard/reviewpulse/sandbox"</step>
    <step order="2">Add imports at top of file AFTER the existing `import type { PluginDescriptor } from "emdash";` line: `import { fileURLToPath } from "node:url";` and on next line: `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside reviewpulsePlugin() function, add path resolution code BEFORE the return statement: First line: `const currentDir = dirname(fileURLToPath(import.meta.url));` Second line: `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Add comment above path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/reviewpulse/sandbox)` then next line: `// The alias works in local dev via node_modules but fails in Cloudflare Workers` then next line: `// which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="5">Replace line 24: change `entrypoint: "@shipyard/reviewpulse/sandbox",` to `entrypoint: entrypointPath,`</step>
    <step order="6">Verify pattern matches membership plugin exactly</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit plugins/reviewpulse/src/index.ts MUST exit 0</check>
    <check type="manual">grep "entrypointPath" plugins/reviewpulse/src/index.ts MUST find the variable</check>
    <check type="manual">grep "@shipyard/reviewpulse/sandbox" plugins/reviewpulse/src/index.ts MUST NOT find the banned pattern</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can run immediately -->
  </dependencies>

  <commit-message>fix(reviewpulse): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/reviewpulse/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

This is a prerequisite for deployment per PRD.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Fix seodash plugin entrypoint</title>
  <requirement>PRD Prerequisite: Fix plugin entrypoints. Seodash uses banned npm alias pattern.</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/seodash/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. The npm alias works in local dev via node_modules but fails on Cloudflare Workers which only has access to bundled code.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/index.ts" reason="File to modify (lines 1-37, line 23 has broken entrypoint)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Reference pattern (lines 228-244)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/seodash/src/index.ts to confirm line 23 has: entrypoint: "@shipyard/seodash/sandbox"</step>
    <step order="2">Add imports at top of file AFTER the existing `import type { PluginDescriptor } from "emdash";` line: `import { fileURLToPath } from "node:url";` and on next line: `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside seodashPlugin() function, add path resolution code BEFORE the return statement: First line: `const currentDir = dirname(fileURLToPath(import.meta.url));` Second line: `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Add comment above path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/seodash/sandbox)` then next line: `// The alias works in local dev via node_modules but fails in Cloudflare Workers` then next line: `// which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="5">Replace line 23: change `entrypoint: "@shipyard/seodash/sandbox",` to `entrypoint: entrypointPath,`</step>
    <step order="6">Verify pattern matches membership plugin exactly</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit plugins/seodash/src/index.ts MUST exit 0</check>
    <check type="manual">grep "entrypointPath" plugins/seodash/src/index.ts MUST find the variable</check>
    <check type="manual">grep "@shipyard/seodash/sandbox" plugins/seodash/src/index.ts MUST NOT find the banned pattern</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can run immediately -->
  </dependencies>

  <commit-message>fix(seodash): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/seodash/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

This is a prerequisite for deployment per PRD.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 2 (After Wave 1) — Registration & Build

After all prerequisites are fixed, register all plugins and build:

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Register all 6 plugins in Sunrise Yoga and build</title>
  <requirement>REQ-1: All plugins registered. REQ-3: Build succeeds.</requirement>
  <description>
    Update examples/sunrise-yoga/astro.config.mjs to import and register all 6 working plugins. Currently only membership and eventdash are registered. Add commercekit, formforge, reviewpulse, and seodash. Then run build to verify all plugins load successfully without errors.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="File to modify (lines 1-23, currently has 2 plugins)" />
    <file path="/home/agent/shipyard-ai/plugins/commercekit/src/index.ts" reason="Verify export: commercekitPlugin" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="Verify export: formforgePlugin (should be fixed by task 2)" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts" reason="Verify export: reviewpulsePlugin (should be fixed by task 3)" />
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/index.ts" reason="Verify export: seodashPlugin (should be fixed by task 4)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Registration pattern (lines 202-223)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs - lines 6-7 have membership and eventdash imports, line 18 has plugins array</step>
    <step order="2">Add 4 new import statements AFTER line 7: `import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";` then `import { formforgePlugin } from "../../plugins/formforge/src/index.js";` then `import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";` then `import { seodashPlugin } from "../../plugins/seodash/src/index.js";`</step>
    <step order="3">Update plugins array at line 18: replace `plugins: [membershipPlugin(), eventdashPlugin()],` with `plugins: [membershipPlugin(), eventdashPlugin(), commercekitPlugin(), formforgePlugin(), reviewpulsePlugin(), seodashPlugin()],`</step>
    <step order="4">Verify the change: run `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` - MUST return 6</step>
    <step order="5">Clear build cache: `rm -rf examples/sunrise-yoga/dist examples/sunrise-yoga/.astro`</step>
    <step order="6">Run build: `cd examples/sunrise-yoga && npm run build 2>&1 | tee build.log`</step>
    <step order="7">Check build result: `tail -10 build.log` should show completion with no ERROR messages</step>
    <step order="8">Verify dist folder created: `ls examples/sunrise-yoga/dist` should list build output</step>
  </steps>

  <verification>
    <check type="build">grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs MUST return 6</check>
    <check type="build">cd examples/sunrise-yoga && npm run build MUST exit with code 0</check>
    <check type="build">ls examples/sunrise-yoga/dist MUST show build output files</check>
    <check type="manual">grep "ERROR" examples/sunrise-yoga/build.log MUST return no matches</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="EventDash violations must be fixed before build will succeed" />
    <depends-on task-id="phase-1-task-2" reason="formforge entrypoint must be fixed before registration" />
    <depends-on task-id="phase-1-task-3" reason="reviewpulse entrypoint must be fixed before registration" />
    <depends-on task-id="phase-1-task-4" reason="seodash entrypoint must be fixed before registration" />
  </dependencies>

  <commit-message>feat(sunrise-yoga): register all 6 plugins and verify build

Added 4 new plugins to Sunrise Yoga astro.config.mjs:
- commercekit (e-commerce)
- formforge (form builder)
- reviewpulse (review aggregation)
- seodash (SEO management)

All 6 plugins now registered and verified:
- membership ✓
- eventdash ✓ (violations fixed)
- commercekit ✓
- formforge ✓ (entrypoint fixed)
- reviewpulse ✓ (entrypoint fixed)
- seodash ✓ (entrypoint fixed)

Build verified successful with all plugins loaded.

Fixes: REQ-1, REQ-3

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 3 (After Wave 2) — Deploy & Smoke Test

After successful build, deploy to Cloudflare and run smoke tests:

---

<task-plan id="phase-1-task-6" wave="3">
  <title>Deploy Sunrise Yoga to Cloudflare Workers</title>
  <requirement>REQ-4: Deploy succeeds</requirement>
  <description>
    Deploy Sunrise Yoga to Cloudflare Workers using wrangler. Load environment variables from .env file, verify credentials, and run deployment. Deployment must complete with "Published" or "Deployed" message and no errors.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.env" reason="Contains CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Wrangler config with D1/R2 bindings (lines 1-8)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Deployment verification (lines 82-98)" />
    <file path="/home/agent/shipyard-ai/prds/deploy-all-plugins.md" reason="PRD Step 4 (lines 39-45)" />
  </context>

  <steps>
    <step order="1">Verify .env file exists: `test -f /home/agent/shipyard-ai/.env && echo "exists" || echo "missing"`</step>
    <step order="2">Source environment: `cd /home/agent/shipyard-ai/examples/sunrise-yoga && source /home/agent/shipyard-ai/.env`</step>
    <step order="3">Export required vars: `export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID`</step>
    <step order="4">Verify vars are set: `echo "Token: ${CLOUDFLARE_API_TOKEN:0:10}... Account: $CLOUDFLARE_ACCOUNT_ID"` (should show partial token + account ID)</step>
    <step order="5">Run deployment: `npx wrangler deploy 2>&1 | tee deploy.log`</step>
    <step order="6">Check deployment result: `tail -10 deploy.log` should contain "Published" or "Deployed"</step>
    <step order="7">Verify no errors: `grep -i "error" deploy.log` should return no critical errors</step>
    <step order="8">Extract deployed URL from deploy.log (look for https://yoga.shipyard.company or https://sunrise-yoga.*.workers.dev)</step>
  </steps>

  <verification>
    <check type="build">npx wrangler deploy MUST exit with code 0</check>
    <check type="manual">deploy.log MUST contain "Published" or "Deployed"</check>
    <check type="manual">grep -i "error" deploy.log MUST show no critical errors</check>
    <check type="manual">Deployed URL must be accessible: curl https://yoga.shipyard.company should return 200</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Build must succeed before deployment" />
  </dependencies>

  <commit-message>deploy(sunrise-yoga): deploy all 6 plugins to production

Deployed Sunrise Yoga to Cloudflare Workers with all 6 plugins:
- membership
- eventdash (violations fixed)
- commercekit
- formforge (entrypoint fixed)
- reviewpulse (entrypoint fixed)
- seodash (entrypoint fixed)

Deployment successful to: https://yoga.shipyard.company

Next: smoke test all plugin routes

Fixes: REQ-4

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-7" wave="3">
  <title>Smoke test all 6 plugin routes</title>
  <requirement>REQ-5: Smoke test each plugin route</requirement>
  <description>
    Test all 6 plugin admin API routes to verify they return UNAUTHORIZED (not NOT_FOUND or INTERNAL_ERROR). UNAUTHORIZED means the plugin is loaded and auth-gated, which is the expected behavior. NOT_FOUND means plugin not registered. INTERNAL_ERROR means plugin has runtime errors (likely violations).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/deploy-all-plugins.md" reason="PRD Step 5 with exact test commands (lines 48-56)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Expected outputs (lines 101-126)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin API routes § 6 (lines 1616-1705)" />
  </context>

  <steps>
    <step order="1">Run smoke test script from PRD for all 6 plugins: `for plugin in membership eventdash commercekit formforge reviewpulse seodash; do echo "=== $plugin ==="; curl -s https://yoga.shipyard.company/_emdash/api/plugins/$plugin/admin -H "Content-Type: application/json" -d '{"type":"page_load"}' | head -3; echo ""; done | tee smoke-test.log`</step>
    <step order="2">Analyze results for EACH plugin - verify response contains `UNAUTHORIZED` (SUCCESS) or identify failures</step>
    <step order="3">Check for membership: grep "=== membership ===" -A 3 smoke-test.log - MUST show UNAUTHORIZED</step>
    <step order="4">Check for eventdash: grep "=== eventdash ===" -A 3 smoke-test.log - MUST show UNAUTHORIZED</step>
    <step order="5">Check for commercekit: grep "=== commercekit ===" -A 3 smoke-test.log - MUST show UNAUTHORIZED</step>
    <step order="6">Check for formforge: grep "=== formforge ===" -A 3 smoke-test.log - MUST show UNAUTHORIZED</step>
    <step order="7">Check for reviewpulse: grep "=== reviewpulse ===" -A 3 smoke-test.log - MUST show UNAUTHORIZED</step>
    <step order="8">Check for seodash: grep "=== seodash ===" -A 3 smoke-test.log - MUST show UNAUTHORIZED</step>
    <step order="9">If ANY plugin returns NOT_FOUND: plugin not registered (check astro.config.mjs). If ANY returns INTERNAL_ERROR: plugin has runtime errors (check violations)</step>
    <step order="10">Count successes: `grep -c "UNAUTHORIZED" smoke-test.log` - MUST return 6</step>
  </steps>

  <verification>
    <check type="build">grep -c "UNAUTHORIZED" smoke-test.log MUST return 6</check>
    <check type="manual">grep "NOT_FOUND" smoke-test.log MUST return NO matches (all plugins registered)</check>
    <check type="manual">grep "INTERNAL_ERROR" smoke-test.log MUST return NO matches (no runtime errors)</check>
    <check type="manual">Each plugin section in smoke-test.log MUST show UNAUTHORIZED response</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Deployment must succeed before smoke testing" />
  </dependencies>

  <commit-message>test(sunrise-yoga): smoke test all 6 plugins - all pass

Smoke tested all 6 plugin admin API routes:
✓ membership: UNAUTHORIZED (loaded, auth-gated)
✓ eventdash: UNAUTHORIZED (loaded, auth-gated)
✓ commercekit: UNAUTHORIZED (loaded, auth-gated)
✓ formforge: UNAUTHORIZED (loaded, auth-gated)
✓ reviewpulse: UNAUTHORIZED (loaded, auth-gated)
✓ seodash: UNAUTHORIZED (loaded, auth-gated)

All plugins confirmed loading on production.
No NOT_FOUND or INTERNAL_ERROR responses.

Fixes: REQ-5

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 4 (After Wave 3) — Commit & Push

After all verifications pass, commit all changes:

---

<task-plan id="phase-1-task-8" wave="4">
  <title>Commit and push all changes</title>
  <requirement>REQ-6: Commit and push</requirement>
  <description>
    Commit all changes made during this hotfix: EventDash violations fix, 3 plugin entrypoint fixes, astro.config.mjs plugin registrations. Use conventional commit format with Co-Authored-By line per CLAUDE.md guidelines.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts" reason="Modified by task 1 (violations fix)" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="Modified by task 2 (entrypoint fix)" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts" reason="Modified by task 3 (entrypoint fix)" />
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/index.ts" reason="Modified by task 4 (entrypoint fix)" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Modified by task 5 (plugin registrations)" />
    <file path="/home/agent/shipyard-ai/CLAUDE.md" reason="Git commit guidelines (lines 141-168)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements REQ-6 (lines 128-135)" />
  </context>

  <steps>
    <step order="1">Change to repo root: `cd /home/agent/shipyard-ai`</step>
    <step order="2">Run git status to verify expected files modified: `git status` should show 5 modified files</step>
    <step order="3">Review all changes: `git diff HEAD` to see all modifications</step>
    <step order="4">Stage all modified files: `git add plugins/eventdash/src/sandbox-entry.ts plugins/formforge/src/index.ts plugins/reviewpulse/src/index.ts plugins/seodash/src/index.ts examples/sunrise-yoga/astro.config.mjs`</step>
    <step order="5">Create commit using HEREDOC for proper formatting: `git commit -m "$(cat <<'EOF'`  then message then `EOF` then `)"`</step>
    <step order="6">Commit message: `deploy: register all 6 plugins in Sunrise Yoga` then blank line then body explaining: prerequisites fixed (EventDash violations, entrypoints), all 6 plugins registered, build/deploy/smoke test successful, then blank line then `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`</step>
    <step order="7">Verify commit created: `git log -1 --oneline` should show commit with "deploy:" prefix</step>
    <step order="8">Push to remote: `git push origin main`</step>
    <step order="9">Verify push succeeded: `git status` should show "Your branch is up to date with 'origin/main'"</step>
  </steps>

  <verification>
    <check type="build">git status after commit MUST show "nothing to commit, working tree clean"</check>
    <check type="build">git log -1 --grep "deploy:" MUST find the commit</check>
    <check type="build">git status after push MUST show "Your branch is up to date"</check>
    <check type="manual">Verify commit appears in GitHub at https://github.com/sethshoultes/shipyard-ai/commits/main</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Must commit after all smoke tests pass" />
  </dependencies>

  <commit-message>deploy: register all 6 plugins in Sunrise Yoga

Fixed prerequisites and deployed all 6 plugins:

Prerequisites fixed:
- EventDash: 95 violations → 0 violations (copied from deliverables/eventdash-fix)
- formforge: npm alias entrypoint → file path resolution
- reviewpulse: npm alias entrypoint → file path resolution
- seodash: npm alias entrypoint → file path resolution

All 6 plugins registered in examples/sunrise-yoga/astro.config.mjs:
✓ membership
✓ eventdash
✓ commercekit
✓ formforge
✓ reviewpulse
✓ seodash

Verified:
- Build: successful (exit 0, no errors)
- Deploy: successful (https://yoga.shipyard.company)
- Smoke tests: all 6 plugins return UNAUTHORIZED (loaded, auth-gated)

No NOT_FOUND or INTERNAL_ERROR responses.

Fixes: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

### CRITICAL RISKS (Must mitigate before deployment)

1. **EventDash 95 Violations** (HIGH)
   - **Issue**: EventDash sandbox-entry.ts has 95 banned pattern violations that cause INTERNAL_ERROR
   - **Impact**: EventDash plugin will not work, smoke test will fail
   - **Mitigation**: Fixed version exists at deliverables/eventdash-fix/sandbox-entry.ts - COPY IT (2 minutes)
   - **Verification**: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` MUST return 0

2. **Three Plugins Use Banned npm Alias Entrypoints** (HIGH)
   - **Issue**: formforge, reviewpulse, seodash use `@shipyard/{name}/sandbox` which fails on Cloudflare Workers
   - **Impact**: Build will fail with "Cannot find module" errors
   - **Mitigation**: Add file path resolution (5 min each × 3 = 15 minutes)
   - **Verification**: Each plugin index.ts MUST have `fileURLToPath + dirname + join` pattern

3. **Deployment Credentials** (MEDIUM)
   - **Issue**: Deployment requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from .env
   - **Impact**: Deploy will fail if credentials missing/invalid
   - **Mitigation**: Verify .env exists and source before deployment
   - **Verification**: `echo "${CLOUDFLARE_API_TOKEN:0:10}..."` should show partial token

### MEDIUM RISKS

4. **Build Cache Corruption** (MEDIUM)
   - **Issue**: Stale .astro cache can cause "Permission denied" errors
   - **Impact**: Build fails with confusing error message
   - **Mitigation**: Clear cache before build: `rm -rf examples/sunrise-yoga/dist examples/sunrise-yoga/.astro`
   - **Rollback**: Re-run build after clearing cache

5. **Untested Plugin Integration** (MEDIUM)
   - **Issue**: Only membership/eventdash tested in production, 4 new plugins untested
   - **Impact**: Plugins may have runtime issues not caught in build
   - **Mitigation**: Smoke tests catch loading failures, gradual rollout possible
   - **Rollback**: Remove failing plugin from astro.config.mjs, redeploy

### LOW RISKS

6. **Wrangler Version Compatibility** (LOW)
   - **Issue**: Different wrangler versions may have different deploy output format
   - **Impact**: May need to adjust grep patterns for "Published" vs "Deployed"
   - **Mitigation**: Check deploy.log for either keyword

---

## Verification Strategy

### Pre-Deployment Checklist

Before running Wave 1:
- [ ] Verify deliverables/eventdash-fix/sandbox-entry.ts exists
- [ ] Verify .env file exists with Cloudflare credentials
- [ ] Verify all 6 plugin sandbox-entry.ts files exist

After Wave 1 (Prerequisites):
- [ ] `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` returns 0
- [ ] `grep "entrypointPath" plugins/formforge/src/index.ts` finds variable
- [ ] `grep "entrypointPath" plugins/reviewpulse/src/index.ts` finds variable
- [ ] `grep "entrypointPath" plugins/seodash/src/index.ts` finds variable

After Wave 2 (Registration & Build):
- [ ] `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` returns 6
- [ ] `cd examples/sunrise-yoga && npm run build` exits 0
- [ ] `ls examples/sunrise-yoga/dist` shows build output

After Wave 3 (Deploy & Smoke Test):
- [ ] `tail -10 deploy.log` contains "Published" or "Deployed"
- [ ] `grep -c "UNAUTHORIZED" smoke-test.log` returns 6
- [ ] No "NOT_FOUND" or "INTERNAL_ERROR" in smoke-test.log

---

## Rollback Plan

If deployment fails at any stage:

**Wave 1 Rollback** (prerequisites):
```bash
cd /home/agent/shipyard-ai
git checkout HEAD -- plugins/eventdash/src/sandbox-entry.ts
git checkout HEAD -- plugins/formforge/src/index.ts
git checkout HEAD -- plugins/reviewpulse/src/index.ts
git checkout HEAD -- plugins/seodash/src/index.ts
```

**Wave 2 Rollback** (registration):
```bash
git checkout HEAD -- examples/sunrise-yoga/astro.config.mjs
cd examples/sunrise-yoga && npm run build
```

**Wave 3 Rollback** (deployment):
- Previous deployment remains live
- Fix issues and redeploy
- If catastrophic: deploy from previous git commit

**Full Rollback** (all changes):
```bash
git reset --hard HEAD
cd examples/sunrise-yoga && npm run build && npx wrangler deploy
```

---

## Success Criteria (Final)

Per PRD and requirements:

- [ ] **REQ-1**: `grep -c "Plugin" astro.config.mjs` returns 6
- [ ] **REQ-2**: All plugins show 0 violations in grep check
- [ ] **REQ-3**: `npm run build` exits with code 0 and no errors
- [ ] **REQ-4**: `wrangler deploy` exits with code 0 and shows "Published"
- [ ] **REQ-5**: All 6 plugins return UNAUTHORIZED (not NOT_FOUND or INTERNAL_ERROR)
- [ ] **REQ-6**: Changes committed and pushed to git

---

## Token Budget Summary

**Research Phase**: ~50K tokens (3 haiku sub-agents)
**Planning Phase**: ~8K tokens (this document + REQUIREMENTS.md)
**Implementation Phase**: ~30K tokens (estimated, 8 tasks)
**Verification & Review**: ~12K tokens (estimated)
**Buffer**: ~0K tokens (tight budget)
**TOTAL**: ~100K tokens (Revision tier budget per CLAUDE.md)

---

## Post-Deployment Verification

After successful deployment and commit:

1. Verify all plugins accessible in admin panel: `https://yoga.shipyard.company/_emdash/admin`
2. Check each plugin's admin page loads without errors
3. Monitor Cloudflare Workers logs for first 24 hours for any plugin errors
4. Document any issues in GitHub issue tracker
5. Update STATUS.md with completion status

---

*Generated by agency-plan skill • GSD methodology*
*Task plans include fresh context for autonomous executor agents*
*Per EMDASH-GUIDE.md § 6. Plugin System (lines 899-1158)*
*Per CLAUDE.md deployment requirements (lines 141-168)*
