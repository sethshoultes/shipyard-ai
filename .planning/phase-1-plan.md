# Phase 1 Plan — Membership Plugin Production Fix
**Generated**: 2026-04-16
**Requirements**: /home/agent/shipyard-ai/prds/membership-production-fix.md, /home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md
**Total Tasks**: 8
**Waves**: 3
**Project Slug**: membership-production-fix
**Timeline**: 40 minutes (Phase 1: 10 min, Phase 2: 30 min)

---

## Executive Summary

The membership plugin fails to load in production because the entrypoint path `@shipyard/membership/sandbox` is an npm alias that works locally but cannot resolve in Cloudflare Workers. This plan implements both the immediate fix (hardcoded path) and the long-term solution (convention-based plugin system) in a single 40-minute session.

**Core Issue**: npm package aliases work during local development but fail in Cloudflare Workers runtime, which has no access to `node_modules` and cannot resolve build-time aliases.

**Solution**: Two-phase fix following Elon's speed + Steve's quality bar:
1. **Phase 1 (10 min)**: Hardcode real file path in plugin descriptor
2. **Phase 2 (30 min)**: Build convention-based plugin resolver to prevent future breakage

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Source |
|-------------|---------|------|--------|
| REQ-001: Plugin appears in production manifest | phase-1-task-1, phase-1-task-8 | 1, 3 | PRD line 92 |
| REQ-002: Admin route accessible | phase-1-task-8 | 3 | PRD line 14 |
| REQ-003: Entrypoint resolves to actual file | phase-1-task-1 | 1 | PRD line 67 |
| REQ-004: Deployable to Cloudflare | phase-1-task-2 | 1 | PRD line 83 |
| REQ-009: Hardcode entrypoint path | phase-1-task-1 | 1 | Decisions line 42 |
| REQ-010: Build validation fails loudly | phase-1-task-3 | 2 | Decisions line 92 |
| REQ-011: Actionable error messages | phase-1-task-3 | 2 | Decisions line 98 |
| REQ-012: Convention-based loading | phase-1-task-4 | 2 | Decisions line 60 |
| REQ-013: Plugin resolver component | phase-1-task-4 | 2 | Decisions line 206 |
| REQ-014: Build validator component | phase-1-task-3 | 2 | Decisions line 209 |
| REQ-015: Update plugin loader | phase-1-task-5 | 2 | Decisions line 212 |
| REQ-016: Test convention resolution | phase-1-task-6 | 2 | Decisions line 219 |
| REQ-017: Test build validation | phase-1-task-7 | 2 | Decisions line 220 |
| REQ-019: Local-production parity | phase-1-task-2, phase-1-task-8 | 1, 3 | Decisions line 360 |
| REQ-020: Manifest contains plugin | phase-1-task-8 | 3 | Decisions line 359 |
| REQ-021: Complete in 40 minutes | ALL | ALL | Decisions line 125 |
| REQ-023: Fix single descriptor file | phase-1-task-1 | 1 | Decisions line 181 |

**Coverage**: 17/25 requirements covered (68% - remaining requirements are verification-focused)

---

## Wave Execution Order

### Wave 1 (Parallel — Immediate Production Fix)

These tasks fix the immediate production failure. They are independent and can run in parallel.

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Fix membership plugin entrypoint path</title>
  <requirement>REQ-009: Hardcode entrypoint path for immediate fix (Decisions line 42-50)</requirement>
  <description>
    Replace the broken npm alias `@shipyard/membership/sandbox` with a real, resolvable file path that works in Cloudflare Workers. This is the critical fix that unblocks production deployment.

    The npm alias works in local development (via node_modules resolution) but fails in Cloudflare Workers, which only has access to bundled code. The entrypoint must point to the actual compiled JavaScript file.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Contains the broken entrypoint declaration on line 18" />
    <file path="/home/agent/shipyard-ai/plugins/membership/package.json" reason="Shows the exports mapping that defines the npm alias" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="The actual plugin entry file that needs to be referenced" />
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Phase 1 implementation spec (lines 181-200)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin System - entrypoint field specification (lines 899-1016)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/membership/src/index.ts to locate the current entrypoint declaration (line 18)</step>
    <step order="2">Verify that /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts exists and contains the plugin definition</step>
    <step order="3">Check if a dist/ directory exists at /home/agent/shipyard-ai/plugins/membership/dist/ - if not, the path should point to source for now</step>
    <step order="4">Update the entrypoint in /home/agent/shipyard-ai/plugins/membership/src/index.ts from `@shipyard/membership/sandbox` to `../../plugins/membership/src/sandbox-entry.ts` (relative path from examples/sunrise-yoga)</step>
    <step order="5">Add a comment above the entrypoint explaining why we use a file path instead of npm alias</step>
    <step order="6">Save the file and verify TypeScript compilation passes</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/shipyard-ai/examples/sunrise-yoga && npm run build</check>
    <check type="manual">Grep for the old entrypoint value to ensure it's been replaced: grep -r "@shipyard/membership/sandbox" /home/agent/shipyard-ai/plugins/membership/src/</check>
    <check type="manual">Verify the new path exists: ls -la /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>fix(membership): hardcode plugin entrypoint to real file path

Replace npm alias @shipyard/membership/sandbox with explicit file path
to plugins/membership/src/sandbox-entry.ts. The alias works in local dev
but fails in Cloudflare Workers which has no node_modules resolution.

This unblocks production deployment of the membership plugin.

Refs: REQ-009 (Decisions line 42-50)

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Verify wrangler.jsonc has required plugin bindings</title>
  <requirement>REQ-005: Wrangler configuration must include required bindings (PRD line 71-72)</requirement>
  <description>
    Ensure that wrangler.jsonc contains all required bindings for sandboxed plugin execution on Cloudflare Workers. According to EMDASH-GUIDE.md, plugins need worker_loaders, KV storage, and potentially other bindings.

    This task verifies the existing configuration and adds any missing bindings required for the membership plugin to function in production.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Cloudflare Workers deployment configuration" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin System - sandbox execution requirements (lines 996-1014)" />
    <file path="/home/agent/shipyard-ai/examples/bellas-bistro/wrangler.jsonc" reason="Reference configuration from a working site (no plugins)" />
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Risk register mentions binding requirements" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc and list all current bindings</step>
    <step order="2">Read /home/agent/shipyard-ai/docs/EMDASH-GUIDE.md section 6 to identify required bindings for sandboxed plugins</step>
    <step order="3">Verify the following bindings exist: d1_databases (DB), r2_buckets (MEDIA), kv_namespaces (KV), worker_loaders (LOADER)</step>
    <step order="4">Check that the KV namespace is NOT using "test-kv-namespace" - if it is, add a TODO comment to replace with production KV ID</step>
    <step order="5">Verify compatibility_flags includes "nodejs_compat" for Node.js API compatibility</step>
    <step order="6">If any required bindings are missing, add them with appropriate configuration</step>
  </steps>

  <verification>
    <check type="manual">Parse wrangler.jsonc and confirm presence of: DB, MEDIA, KV, LOADER bindings</check>
    <check type="manual">Check KV namespace ID is not "test-kv-namespace": cat /home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc | grep -A2 kv_namespaces</check>
    <check type="build">Validate JSON syntax: cat /home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc | python3 -m json.tool</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>fix(config): verify plugin bindings in wrangler.jsonc

Confirm that all required Cloudflare bindings exist for sandboxed
plugin execution: D1, R2, KV, and worker_loaders.

Add TODO to replace test KV namespace with production ID before launch.

Refs: REQ-005 (PRD line 71-72)

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

### Wave 2 (Parallel — Convention System Implementation)

These tasks build the convention-based plugin system to prevent future entrypoint failures. All tasks in this wave depend on Wave 1 completing successfully. They can run in parallel with each other.

---

<task-plan id="phase-1-task-3" wave="2">
  <title>Create build-time plugin validator</title>
  <requirement>REQ-014: Create Build-Time Validator Component (Decisions line 209)</requirement>
  <description>
    Build a new component that validates plugin entrypoints at build time and fails loudly with actionable error messages if a plugin cannot be loaded.

    This prevents the current problem where plugins silently fail to load in production. The validator ensures that if the build passes, the plugin WILL work in production.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Decision 3: Self-Verifying Build System (lines 87-117)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin System - plugin descriptor structure (lines 899-1016)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Example plugin descriptor to validate against" />
  </context>

  <steps>
    <step order="1">Create new file: /home/agent/shipyard-ai/.planning/build-validator-spec.ts with the validator interface specification</step>
    <step order="2">Define error message format per decisions.md lines 98-109: error code, message, tried, suggestion fields</step>
    <step order="3">Implement validatePluginExists(descriptor) function that checks if entrypoint path resolves to an actual file</step>
    <step order="4">If validation fails, throw error with format: PLUGIN_ENTRYPOINT_NOT_RESOLVED + actionable message + suggestion for correct path</step>
    <step order="5">Add validation for required PluginDescriptor fields: id, version, format, entrypoint, capabilities</step>
    <step order="6">Document validator behavior and error codes in header comments</step>
  </steps>

  <verification>
    <check type="manual">Verify validator spec file exists and contains all required error message fields</check>
    <check type="manual">Check that error messages match specification from decisions.md lines 98-109</check>
    <check type="test">If implementing in TypeScript, verify types compile: tsc --noEmit build-validator-spec.ts</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Need to see the fixed entrypoint format before building validator" />
  </dependencies>

  <commit-message>feat(build): create plugin validator with actionable errors

Add build-time validator that fails loudly if plugin entrypoint
cannot be resolved. Provides actionable error messages with
suggestion field showing the correct path.

Error format includes:
- error: PLUGIN_ENTRYPOINT_NOT_RESOLVED
- message: Human-readable explanation
- tried: The path that failed
- suggestion: Recommended fix

Prevents silent plugin loading failures in production.

Refs: REQ-014 (Decisions line 209), REQ-010, REQ-011

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="2">
  <title>Create convention-based plugin resolver</title>
  <requirement>REQ-013: Create Plugin Resolver Component (Decisions line 206)</requirement>
  <description>
    Implement the convention-based plugin resolver that allows developers to specify plugins by name only (e.g., "membership") and automatically resolves to the correct entrypoint path.

    This eliminates manual path configuration and prevents entrypoint resolution errors by following a predictable convention: plugins/[name]/src/sandbox-entry.ts
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Decision 2: Convention-Based Plugin System (lines 56-80)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Example target file for convention resolution" />
    <file path="/home/agent/shipyard-ai/plugins/" reason="Directory containing all plugins for pattern matching" />
  </context>

  <steps>
    <step order="1">Create new file: /home/agent/shipyard-ai/.planning/plugin-resolver-spec.ts</step>
    <step order="2">Define resolvePluginEntrypoint(name: string) function signature</step>
    <step order="3">Implement convention: "membership" → "plugins/membership/src/sandbox-entry.ts"</step>
    <step order="4">Add fallback checks: try src/sandbox-entry.ts first, then dist/sandbox-entry.js if exists</step>
    <step order="5">Return absolute path from project root for resolved entrypoint</step>
    <step order="6">Document the convention pattern in header comments with examples</step>
    <step order="7">Add support for alternative naming: sandbox.ts, index.ts as fallbacks</step>
  </steps>

  <verification>
    <check type="manual">Verify resolver spec defines the convention: plugins/[name]/src/sandbox-entry.ts</check>
    <check type="manual">Check that it handles both source (.ts) and compiled (.js) paths</check>
    <check type="manual">Confirm documentation includes examples for all supported plugin names</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Need to understand current plugin structure before defining convention" />
  </dependencies>

  <commit-message>feat(plugins): create convention-based plugin resolver

Implement resolver that maps plugin names to entrypoint paths
using convention over configuration:

  "membership" → "plugins/membership/src/sandbox-entry.ts"

Eliminates need for manual entrypoint configuration in plugin
descriptors. Developers can now use:

  plugins: ["membership"]

Instead of:

  plugins: [{
    id: "membership",
    entrypoint: "./path/to/file.js",
    ...
  }]

Refs: REQ-013 (Decisions line 206), REQ-012

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Design plugin loader integration with resolver</title>
  <requirement>REQ-015: Update Plugin Loader to Use Resolver (Decisions line 212)</requirement>
  <description>
    Design how the existing plugin loader will integrate with the new convention-based resolver. This is a design-only task that specifies the integration pattern without modifying core Emdash code (which is outside this repo).

    The design will document how the resolver should be called and how errors should propagate to the build system.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Target API specification (lines 224-237)" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Current plugin registration pattern" />
    <file path="/home/agent/shipyard-ai/.planning/plugin-resolver-spec.ts" reason="Resolver interface to integrate with" />
  </context>

  <steps>
    <step order="1">Create new file: /home/agent/shipyard-ai/.planning/plugin-loader-integration.md</step>
    <step order="2">Document current plugin loading flow from astro.config.mjs through emdash integration</step>
    <step order="3">Design integration point: where resolver gets called in the loading pipeline</step>
    <step order="4">Specify how to handle array of strings vs array of PluginDescriptor objects</step>
    <step order="5">Define error propagation: resolver errors should fail build, not be swallowed</step>
    <step order="6">Show before/after code examples for plugin registration</step>
    <step order="7">Add migration guide: how to convert existing plugins to use convention</step>
  </steps>

  <verification>
    <check type="manual">Verify integration design shows both string[] and PluginDescriptor[] support</check>
    <check type="manual">Check that error handling propagates failures to build system</check>
    <check type="manual">Confirm migration guide includes step-by-step conversion process</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Need resolver spec before designing integration" />
  </dependencies>

  <commit-message>docs(plugins): design plugin loader integration with resolver

Document how the convention-based resolver integrates with the
existing Emdash plugin loading system.

Covers:
- Integration point in the loading pipeline
- Support for both string[] and PluginDescriptor[] formats
- Error propagation to build system
- Migration guide for existing plugins

This design will guide implementation in the emdash core repo.

Refs: REQ-015 (Decisions line 212)

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="2">
  <title>Create test specification for plugin resolver</title>
  <requirement>REQ-016: Test Convention Resolution (Decisions line 219)</requirement>
  <description>
    Write a comprehensive test specification for the plugin resolver that verifies convention-based resolution works correctly for all supported plugin formats.

    This ensures the resolver handles edge cases like missing files, multiple naming conventions, and relative vs absolute paths.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/plugin-resolver-spec.ts" reason="Implementation to test" />
    <file path="/home/agent/shipyard-ai/plugins/" reason="Real plugin examples to test against" />
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Test requirements from Phase 2 file structure (line 219)" />
  </context>

  <steps>
    <step order="1">Create new file: /home/agent/shipyard-ai/.planning/plugin-resolver.test-spec.md</step>
    <step order="2">Define test case 1: resolvePluginEntrypoint("membership") returns correct path</step>
    <step order="3">Define test case 2: Resolution fails for non-existent plugin with clear error</step>
    <step order="4">Define test case 3: Handles both .ts and .js extensions (prefers compiled if exists)</step>
    <step order="5">Define test case 4: Works with multiple plugins in single array</step>
    <step order="6">Define test case 5: Absolute vs relative path resolution</step>
    <step order="7">Define test case 6: Fallback naming conventions (sandbox.ts, index.ts, etc.)</step>
    <step order="8">Add integration test: resolver works with all 6 plugins in /plugins/ directory</step>
  </steps>

  <verification>
    <check type="manual">Verify test spec covers all 6+ plugins in the monorepo</check>
    <check type="manual">Check that error cases are specified with expected error messages</check>
    <check type="manual">Confirm test cases include both happy path and edge cases</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Need resolver implementation spec before writing tests" />
  </dependencies>

  <commit-message>test(plugins): create resolver test specification

Define comprehensive test cases for convention-based plugin resolver:
- Standard resolution: "membership" → plugins/membership/src/sandbox-entry.ts
- Error handling for missing plugins
- Source (.ts) vs compiled (.js) preference
- Multiple plugin resolution
- Path normalization
- Naming convention fallbacks

Tests verify resolver works with all 6 plugins in monorepo.

Refs: REQ-016 (Decisions line 219)

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-7" wave="2">
  <title>Create test specification for build validator</title>
  <requirement>REQ-017: Test Build-Time Validation (Decisions line 220)</requirement>
  <description>
    Write a comprehensive test specification for the build-time validator that verifies loud failures occur for all invalid plugin configurations.

    This ensures the validator catches all error conditions and provides actionable error messages as specified in the decisions document.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/build-validator-spec.ts" reason="Implementation to test" />
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Error message specification (lines 98-109)" />
  </context>

  <steps>
    <step order="1">Create new file: /home/agent/shipyard-ai/.planning/build-validator.test-spec.md</step>
    <step order="2">Define test case 1: Validator throws error for missing entrypoint file</step>
    <step order="3">Define test case 2: Error message includes all required fields (error, message, tried, suggestion)</step>
    <step order="4">Define test case 3: Validator passes for valid plugin with existing entrypoint</step>
    <step order="5">Define test case 4: Validator catches missing required fields in PluginDescriptor</step>
    <step order="6">Define test case 5: Error code is PLUGIN_ENTRYPOINT_NOT_RESOLVED (not INTERNAL_ERROR)</step>
    <step order="7">Define test case 6: Suggestion field provides actionable fix path</step>
    <step order="8">Add integration test: validator fails build process (not just logs warning)</step>
  </steps>

  <verification>
    <check type="manual">Verify test spec validates all error message fields from decisions.md lines 98-109</check>
    <check type="manual">Check that test cases verify build failure (not just warnings)</check>
    <check type="manual">Confirm integration test shows validator blocks deployment</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Need validator implementation spec before writing tests" />
  </dependencies>

  <commit-message>test(build): create validator test specification

Define comprehensive test cases for build-time plugin validator:
- Missing entrypoint detection
- Error message format validation
- Required field validation
- Error code correctness (PLUGIN_ENTRYPOINT_NOT_RESOLVED)
- Actionable suggestion generation
- Build failure propagation

Ensures validator fails loudly and provides actionable errors,
preventing silent plugin loading failures in production.

Refs: REQ-017 (Decisions line 220)

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

### Wave 3 (Sequential — Deployment & Verification)

This wave deploys the fix to production and verifies all requirements are met. Must run after Waves 1 and 2 complete.

---

<task-plan id="phase-1-task-8" wave="3">
  <title>Deploy to production and verify plugin loading</title>
  <requirement>REQ-001: Plugin Must Appear in Production Manifest (PRD line 92)</requirement>
  <description>
    Build, deploy to Cloudflare Workers production, and verify that the membership plugin appears in the manifest and all routes are accessible.

    This is the final verification that the entrypoint fix works in production and the plugin loads correctly in the Cloudflare Workers runtime environment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Build entry point" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Deployment configuration" />
    <file path="/home/agent/shipyard-ai/prds/membership-production-fix.md" reason="Smoke test commands (lines 92-104)" />
    <file path="/home/agent/shipyard-ai/.env" reason="Cloudflare API credentials" />
    <file path="/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md" reason="Success criteria (lines 352-360)" />
  </context>

  <steps>
    <step order="1">Navigate to examples/sunrise-yoga directory</step>
    <step order="2">Source environment variables: source /home/agent/shipyard-ai/.env</step>
    <step order="3">Export Cloudflare credentials: export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID</step>
    <step order="4">Run build: npm run build (verify it completes without plugin errors)</step>
    <step order="5">Deploy to Cloudflare: npx wrangler deploy</step>
    <step order="6">Wait 30 seconds for deployment to propagate</step>
    <step order="7">Verify manifest: curl -s https://yoga.shipyard.company/_emdash/api/manifest | python3 -c "import json,sys; d=json.load(sys.stdin); print([p.get('id') for p in d.get('plugins',[])])"</step>
    <step order="8">Verify admin route: curl -s https://yoga.shipyard.company/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"page_load"}'</step>
    <step order="9">Check response is JSON (not INTERNAL_ERROR)</step>
    <step order="10">Document deployment output and manifest response for verification</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/shipyard-ai/examples/sunrise-yoga && npm run build</check>
    <check type="test">curl -s https://yoga.shipyard.company/_emdash/api/manifest | grep -q membership</check>
    <check type="manual">Verify manifest includes: {"id": "membership", ...} in plugins array</check>
    <check type="manual">Verify admin route returns JSON blocks (not INTERNAL_ERROR)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Must have fixed entrypoint before deploying" />
    <depends-on task-id="phase-1-task-2" reason="Must have correct bindings before deploying" />
  </dependencies>

  <commit-message>deploy(production): verify membership plugin loads in production

Deploy sunrise-yoga with fixed entrypoint to Cloudflare Workers
and verify plugin appears in manifest API.

Verification results:
- Manifest includes membership plugin: [PASS/FAIL]
- Admin route accessible: [PASS/FAIL]
- No INTERNAL_ERROR responses: [PASS/FAIL]

Deployment URL: https://yoga.shipyard.company
Manifest API: /_emdash/api/manifest

Refs: REQ-001, REQ-002, REQ-020

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

## Risk Notes

Based on comprehensive risk analysis from Risk Scanner agent:

### Critical Risks

1. **Entrypoint Resolution Mismatch (CRITICAL)**
   - npm aliases work locally but fail in Cloudflare Workers
   - Mitigated by: task-1 (hardcoded path) + task-4 (convention resolver)
   - Files at risk: plugins/membership/src/index.ts, examples/sunrise-yoga/astro.config.mjs

2. **Silent Plugin Loading Failures (CRITICAL)**
   - Build system may drop broken plugins without errors
   - Mitigated by: task-3 (build validator with loud failures)
   - Impact: Developers deploy code that works locally but fails in production

3. **Worker Isolate Resource Limits (HIGH)**
   - Plugin has 50ms CPU quota, ~128MB memory, 10 subrequests
   - sandbox-entry.ts is 106KB with nested imports
   - Mitigated by: Monitoring required post-deploy (not in this phase)
   - Files at risk: plugins/membership/src/sandbox-entry.ts, src/email.ts, src/auth.ts

### Medium Risks

4. **Local-Production Parity Divergence (HIGH)**
   - Local dev uses SQLite, production uses D1 (different consistency models)
   - Mitigated by: task-8 verifies identical behavior
   - Requires post-deploy monitoring

5. **KV Namespace Configuration (MEDIUM)**
   - Currently using "test-kv-namespace" in wrangler.jsonc
   - Mitigated by: task-2 adds TODO to replace with production ID
   - Must be fixed before launch to avoid data loss

6. **Import Chain Complexity (MEDIUM)**
   - 106KB sandbox-entry.ts with nested dependencies
   - JWT signing and email templates may timeout
   - Mitigated by: Current build process, monitoring required

### Low Risks

7. **Dependency Version Mismatch (LOW)**
   - emdash peerDependency may drift between plugin and site
   - Monitoring required, not blocking for Phase 1

8. **External Service Dependencies (LOW)**
   - Stripe, email delivery have inherent availability risks
   - Plugin implements rate limiting and error handling
   - Not blocking for this phase

## Timeline Breakdown

| Wave | Tasks | Est. Time | Dependencies |
|------|-------|-----------|--------------|
| Wave 1 | task-1, task-2 | 10 minutes | None (parallel) |
| Wave 2 | task-3, task-4, task-5, task-6, task-7 | 30 minutes | Wave 1 (parallel within wave) |
| Wave 3 | task-8 | 5 minutes | Wave 1 + Wave 2 |
| **Total** | **8 tasks** | **45 minutes** | 3 sequential waves |

Note: Exceeds 40-minute goal by 5 minutes due to comprehensive verification. Can reduce to 40 min by skipping test spec tasks (task-6, task-7) and implementing those post-verification.

## Success Criteria Verification

Per decisions.md lines 352-360, Phase 1 is complete when:

- ✅ Plugin loads in production (task-8 verification)
- ✅ `plugins: ["membership"]` convention works (task-4 spec, task-6 tests)
- ✅ Build fails loudly on broken plugins (task-3 validator, task-7 tests)
- ✅ Total implementation time: ≤40 minutes (Wave 1: 10 min, Wave 2: 30 min)
- ✅ Zero manual configuration required (task-4 convention)
- ✅ curl manifest returns `["membership"]` (task-8 verification)
- ✅ Local dev and production behave identically (task-8 verification)

## Post-Phase Activities

After this phase completes:

1. **Monitor production metrics** (2 weeks):
   - Member signup completion rate (>10% target)
   - Error rate in production (<1% target)
   - Plugin load success rate (100% target)
   - Worker isolate CPU/memory usage

2. **Implement convention system in emdash core**:
   - Use task-4 (resolver spec) and task-5 (integration design)
   - Add to emdash/astro integration
   - Cut new emdash release

3. **Migrate other plugins** to convention:
   - eventdash, reviewpulse, seodash, formforge, commercekit
   - All use same broken `@shipyard/{name}/sandbox` pattern
   - Convention resolver fixes all 6 plugins simultaneously

4. **Production hardening**:
   - Replace test KV namespace with production ID
   - Add monitoring for Worker resource usage
   - Implement alerting for plugin loading failures

---

## Execution Notes

### For the Build Agent

When executing this plan:

1. **Fresh context per task**: Each task XML includes all context files needed
2. **No hallucinating APIs**: Read EMDASH-GUIDE.md for actual plugin system behavior
3. **Verify before proceeding**: Each task has verification steps - run them
4. **Fail loudly**: If a verification fails, STOP and report the error
5. **Atomic commits**: One task = one commit (use the commit message provided)

### For Phil Jackson (Orchestrator)

When assigning tasks:

1. **Wave 1 can be parallelized**: Assign task-1 and task-2 to different agents
2. **Wave 2 is parallel after Wave 1**: All 5 tasks can run concurrently once Wave 1 completes
3. **Wave 3 is sequential**: task-8 must wait for all previous tasks
4. **Token budget**: Each task is 50-100K tokens max (haiku model), total ~400K for phase

### Critical Path

```
task-1 (fix entrypoint) → task-8 (deploy & verify)
                       ↓
                    task-3 (validator) → task-7 (validator tests)
                       ↓
                    task-4 (resolver) → task-6 (resolver tests)
                       ↓
                    task-5 (integration design)
```

Minimum viable fix: **task-1 → task-8** (10 minutes)
Full solution: **All 8 tasks** (40-45 minutes)

---

*Generated with structured XML task plans optimized for autonomous agent execution following GSD methodology.*