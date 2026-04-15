# Phase 1 Plan — MEMBERSHIP-V2 (HARBOR)

**Generated**: 2026-04-15
**Requirements**: `/home/agent/shipyard-ai/prds/membership-v2.md`, `/home/agent/shipyard-ai/rounds/membership-v2/decisions.md`
**Total Tasks**: 12
**Waves**: 4

---

## EXECUTIVE SUMMARY

**What we're building:** Fix 4 banned pattern violations in the membership plugin and deploy to Sunrise Yoga for smoke testing.

**Why it matters:** The Harbor plugin (internal codename for MemberShip v2) is a production-grade binary membership validator for Emdash CMS. Currently blocked by 4 TypeScript violations using banned patterns (`rc.user` checks and `throw new Response` in admin routes).

**Core principle:** Copy working code, don't rewrite. This is a surgical fix, not a refactor.

**Critical constraints:**
- Do NOT rewrite, refactor, or optimize the working code
- 30-day code freeze after deployment (no changes, no optimizations)
- Manual smoke tests required (automation deferred 30 days)
- Zero new features beyond binary membership checks

**Success criteria:**
- ✅ 0 banned pattern violations (verified by grep)
- ✅ All 6 smoke tests pass (100% success rate required)
- ✅ Plugin registered in Sunrise Yoga
- ✅ Test documentation complete
- ✅ Code committed and deployed

---

## REQUIREMENTS TRACEABILITY

| Requirement | Task(s) | Wave | Source |
|-------------|---------|------|--------|
| R1.1 - Verify source files exist | phase-1-task-1 | 1 | PRD Phase 1 |
| R1.2 - Remove `approve` route violations | phase-1-task-2 | 2 | PRD Phase 1 |
| R1.3 - Remove `revoke` route violations | phase-1-task-2 | 2 | PRD Phase 1 |
| R1.4 - Verify violations eliminated | phase-1-task-3 | 3 | PRD Phase 1 |
| R2.1 - Read Sunrise Yoga config | phase-1-task-4 | 1 | PRD Phase 2 |
| R2.2 - Locate plugin descriptor | phase-1-task-4 | 1 | PRD Phase 2 |
| R2.3 - Add plugin import | phase-1-task-5 | 2 | PRD Phase 2 |
| R2.4 - Register in emdash config | phase-1-task-5 | 2 | PRD Phase 2 |
| R2.5 - Verify KV binding | phase-1-task-6 | 3 | PRD Phase 2 |
| R3.1-3.6 - Execute smoke tests | phase-1-task-7, phase-1-task-8, phase-1-task-9 | 3 | PRD Phase 3 |
| R4.1 - Document test results | phase-1-task-10 | 4 | PRD Phase 4 |
| R4.2 - Commit changes | phase-1-task-11 | 4 | PRD Phase 4 |
| R4.3 - Deploy | phase-1-task-12 | 4 | PRD Phase 4 |

---

## WAVE EXECUTION ORDER

### Wave 1 (Parallel) — Research & Verification

Tasks can run in parallel as they only read files and gather information.

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Verify source and target files exist</title>
  <requirement>R1.1 - Verify clean deliverable file and target source file exist with expected line counts</requirement>
  <description>
    Confirm that the clean reference implementation exists at deliverables/membership-fix/sandbox-entry.ts
    (3,441 lines, 0 violations) and the target file exists at plugins/membership/src/sandbox-entry.ts
    (3,600 lines, 4 violations). This verification ensures we have the correct files before making changes.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/membership-fix/sandbox-entry.ts" reason="Clean reference file with 0 violations" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Target file with 4 violations to fix" />
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD with file location details" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Emdash plugin system documentation" />
  </context>

  <steps>
    <step order="1">Use Bash to count lines in deliverable file: `wc -l /home/agent/shipyard-ai/deliverables/membership-fix/sandbox-entry.ts`</step>
    <step order="2">Verify deliverable has ~3,441 lines</step>
    <step order="3">Use Bash to count lines in target file: `wc -l /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`</step>
    <step order="4">Verify target has ~3,600 lines (159 lines difference is expected)</step>
    <step order="5">Use Grep to count violations in deliverable: `grep -c "rc\.user" deliverables/membership-fix/sandbox-entry.ts || echo 0`</step>
    <step order="6">Confirm deliverable has 0 violations</step>
    <step order="7">Use Grep to count violations in target: `grep -c "rc\.user" plugins/membership/src/sandbox-entry.ts`</step>
    <step order="8">Confirm target has 2 violations (approve and revoke routes)</step>
  </steps>

  <verification>
    <check type="manual">Deliverable file exists with ~3,441 lines</check>
    <check type="manual">Target file exists with ~3,600 lines</check>
    <check type="manual">Deliverable has 0 rc.user violations</check>
    <check type="manual">Target has 2 rc.user violations (4 total violations including throw new Response)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is a Wave 1 verification task -->
  </dependencies>

  <commit-message>N/A - verification task only, no code changes</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Research Sunrise Yoga configuration and plugin registration</title>
  <requirement>R2.1, R2.2 - Understand how to register the membership plugin in Sunrise Yoga's Astro config</requirement>
  <description>
    Read Sunrise Yoga's astro.config.mjs to understand the current emdash configuration and plugin
    registration pattern. Locate the membership plugin descriptor (plugins/membership/src/index.ts)
    to determine the correct import path and function name. Verify the plugin follows Emdash's
    descriptor pattern as documented in EMDASH-GUIDE.md section 6.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Target configuration file where plugin needs to be registered" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Plugin descriptor with registration metadata" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6 - Plugin System registration documentation" />
    <file path="/home/agent/shipyard-ai/plugins/membership/package.json" reason="Package exports and module metadata" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs to understand current emdash() integration</step>
    <step order="2">Note the database binding (d1({ binding: "DB" })) and storage binding (r2({ binding: "MEDIA" }))</step>
    <step order="3">Check if a plugins array exists in the emdash configuration</step>
    <step order="4">Read /home/agent/shipyard-ai/plugins/membership/src/index.ts to find the plugin descriptor function</step>
    <step order="5">Verify the descriptor exports a function (likely `membershipPlugin()`)</step>
    <step order="6">Check package.json exports to understand import path (@shipyard/membership vs relative path)</step>
    <step order="7">Review EMDASH-GUIDE.md section 6 "Registering Plugins in astro.config.mjs" for the correct pattern</step>
    <step order="8">Document the exact import statement and registration line needed</step>
  </steps>

  <verification>
    <check type="manual">Confirmed Sunrise Yoga's current emdash configuration structure</check>
    <check type="manual">Located membership plugin descriptor function name</check>
    <check type="manual">Determined correct import path for the plugin</check>
    <check type="manual">Documented registration pattern matching Emdash conventions</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is a Wave 1 research task -->
  </dependencies>

  <commit-message>N/A - research task only, no code changes</commit-message>
</task-plan>

---

### Wave 2 (Parallel, after Wave 1) — Code Modifications

These tasks modify code but can run in parallel as they affect different files.

---

<task-plan id="phase-1-task-2" wave="2">
  <title>Remove banned patterns from approve and revoke routes</title>
  <requirement>R1.2, R1.3 - Eliminate 4 violations by removing rc.user guard blocks from admin routes</requirement>
  <description>
    Remove the redundant admin authentication checks from the approve and revoke routes in
    plugins/membership/src/sandbox-entry.ts. Each route contains a 4-line block checking rc.user
    and throwing new Response errors. These checks are unnecessary because Emdash authenticates
    requests before they reach plugin route handlers (per EMDASH-GUIDE.md section 6). Removing
    these blocks eliminates all 4 banned pattern violations.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Target file containing the 4 violations to remove" />
    <file path="/home/agent/shipyard-ai/deliverables/membership-fix/sandbox-entry.ts" reason="Clean reference showing violations already removed" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Documents that route handlers receive authenticated context" />
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD Phase 1 with exact violation patterns to remove" />
  </context>

  <steps>
    <step order="1">Read plugins/membership/src/sandbox-entry.ts to locate the approve route (around line 1233)</step>
    <step order="2">Identify the 4-line admin check block: `const adminUser = rc.user as Record... if (!adminUser || !adminUser.isAdmin) { throw new Response(...) }`</step>
    <step order="3">Use Edit tool to remove the entire 4-line block from the approve route</step>
    <step order="4">Locate the revoke route (around line 1285)</step>
    <step order="5">Identify the identical 4-line admin check block</step>
    <step order="6">Use Edit tool to remove the entire 4-line block from the revoke route</step>
    <step order="7">Save the file</step>
    <step order="8">Verify no syntax errors were introduced by reading the modified sections</step>
  </steps>

  <verification>
    <check type="build">File has valid TypeScript syntax (no parsing errors)</check>
    <check type="manual">Approve route no longer contains rc.user check</check>
    <check type="manual">Revoke route no longer contains rc.user check</check>
    <check type="manual">No other code blocks accidentally removed</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Must verify target file exists before modifying it" />
  </dependencies>

  <commit-message>N/A - changes will be committed in phase-1-task-11 with all other modifications</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Register membership plugin in Sunrise Yoga config</title>
  <requirement>R2.3, R2.4 - Add plugin import and registration to astro.config.mjs</requirement>
  <description>
    Add the membership plugin to Sunrise Yoga's Astro configuration. This involves importing the
    plugin descriptor function and adding it to the emdash plugins array. The plugin registration
    follows the pattern documented in EMDASH-GUIDE.md section 6: import the descriptor, call it
    with any options, and include it in the plugins array passed to emdash().
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Configuration file to modify" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Plugin descriptor function to import" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6 - Plugin registration pattern documentation" />
    <file path="/home/agent/shipyard-ai/rounds/membership-v2/decisions.md" reason="Specifies zero-config requirement and plugin ID" />
  </context>

  <steps>
    <step order="1">Read the current astro.config.mjs to identify the emdash integration section</step>
    <step order="2">Add import statement at top of file: `import { membershipPlugin } from "../../plugins/membership/src/index.js";` (adjust path as needed)</step>
    <step order="3">Locate the emdash() function call in the integrations array</step>
    <step order="4">Add a plugins array to the emdash configuration if it doesn't exist: `plugins: [membershipPlugin()]`</step>
    <step order="5">If plugins array already exists, append membershipPlugin() to it</step>
    <step order="6">Save the file</step>
    <step order="7">Verify syntax by attempting to import the config (or run npm run build in dry-run mode)</step>
  </steps>

  <verification>
    <check type="build">astro.config.mjs has valid JavaScript syntax</check>
    <check type="manual">Import statement added for membershipPlugin</check>
    <check type="manual">Plugin registered in emdash plugins array</check>
    <check type="build">npm run build succeeds (validates configuration)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Must understand registration pattern before modifying config" />
  </dependencies>

  <commit-message>N/A - changes will be committed in phase-1-task-11 with all other modifications</commit-message>
</task-plan>

---

### Wave 3 (Sequential, after Wave 2) — Verification & Testing

These tasks must run sequentially after code modifications to verify the fixes worked.

---

<task-plan id="phase-1-task-3" wave="3">
  <title>Verify all banned patterns eliminated</title>
  <requirement>R1.4 - Confirm zero violations remain in the modified file</requirement>
  <description>
    Run grep commands to verify that all banned patterns have been successfully removed from
    plugins/membership/src/sandbox-entry.ts. The file must have zero matches for rc.user,
    throw new Response, and rc.pathParams patterns. This verification confirms the Wave 2
    edits were successful and the file is ready for deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Modified file to verify" />
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD defines banned patterns to check" />
  </context>

  <steps>
    <step order="1">Use Grep to search for rc.user pattern: `grep -c "rc\.user" plugins/membership/src/sandbox-entry.ts || echo 0`</step>
    <step order="2">Verify result is 0</step>
    <step order="3">Use Grep to search for throw new Response in admin context: `grep -n "throw new Response" plugins/membership/src/sandbox-entry.ts | grep -E "(approve|revoke)" || echo "No matches"`</step>
    <step order="4">Verify no matches in approve or revoke routes</step>
    <step order="5">Use Grep to search for rc.pathParams: `grep -c "rc\.pathParams" plugins/membership/src/sandbox-entry.ts || echo 0`</step>
    <step order="6">Verify result is 0</step>
    <step order="7">Run comprehensive check: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts || echo 0`</step>
    <step order="8">Verify total count is 0</step>
  </steps>

  <verification>
    <check type="test">grep "rc\.user" returns 0 matches</check>
    <check type="test">grep "throw new Response.*approve\|revoke" returns no matches</check>
    <check type="test">grep "rc\.pathParams" returns 0 matches</check>
    <check type="test">Combined grep for all banned patterns returns 0</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Must complete code modifications before verification" />
  </dependencies>

  <commit-message>N/A - verification task only</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="3">
  <title>Verify KV namespace binding configuration</title>
  <requirement>R2.5 - Confirm KV namespace is properly configured for plugin storage</requirement>
  <description>
    Verify that Cloudflare KV namespace binding is configured for the membership plugin to store
    member data, plans, and gating rules. Check both astro.config.mjs and wrangler.jsonc for KV
    bindings. The plugin accesses KV via ctx.kv in the plugin context, so the binding must exist
    for the plugin to function. Document the binding configuration or flag as missing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="May contain KV binding in emdash config" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Cloudflare Workers KV binding configuration" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5 - Deployment and KV configuration patterns" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Shows ctx.kv usage patterns" />
  </context>

  <steps>
    <step order="1">Read examples/sunrise-yoga/wrangler.jsonc to check for kv_namespaces binding</step>
    <step order="2">Look for binding like `kv_namespaces = [{ binding = "KV", id = "..." }]`</step>
    <step order="3">If found, note the binding name (e.g., "KV")</step>
    <step order="4">Read astro.config.mjs to see if KV binding is passed to emdash()</step>
    <step order="5">Check if plugin context automatically provides ctx.kv or if explicit binding needed</step>
    <step order="6">Review EMDASH-GUIDE.md section on KV storage for plugins</step>
    <step order="7">Document findings: either "KV binding configured" or "KV binding missing - needs setup"</step>
    <step order="8">If missing, flag as blocker and document required wrangler.jsonc changes</step>
  </steps>

  <verification>
    <check type="manual">KV namespace binding exists in wrangler.jsonc OR documented as auto-configured</check>
    <check type="manual">Binding name documented for reference</check>
    <check type="manual">If missing, blocker flagged with remediation steps</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Config must be updated before verifying bindings" />
  </dependencies>

  <commit-message>N/A - verification task only</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-7" wave="3">
  <title>Execute smoke tests 1-3: Admin page, registration, status lookup</title>
  <requirement>R3.1, R3.2, R3.3, R3.4 - Verify core plugin endpoints work end-to-end</requirement>
  <description>
    Start the Sunrise Yoga dev server and run the first three smoke tests: admin page load,
    member registration, and status lookup. These tests verify that the plugin is properly
    registered, routes are accessible, and basic member operations work. Test 3 specifically
    checks for double-encoding issues (a known past problem with KV serialization).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Contains plugin registration to test" />
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD Phase 3 defines exact curl commands and expected results" />
    <file path="/home/agent/shipyard-ai/rounds/membership-v2/decisions.md" reason="Test matrix with expected outputs" />
  </context>

  <steps>
    <step order="1">Start Sunrise Yoga dev server: `cd examples/sunrise-yoga && npm run dev` (run in background)</step>
    <step order="2">Wait 10 seconds for server to fully start</step>
    <step order="3">Run Test 1 - Admin page load: `curl -s http://localhost:4321/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"page_load"}'`</step>
    <step order="4">Verify response contains `"blocks":[...]` and no error fields, HTTP 200</step>
    <step order="5">Run Test 2 - Member registration: `curl -s -X POST http://localhost:4321/_emdash/api/plugins/membership/register -H "Content-Type: application/json" -d '{"email":"test@example.com","plan":"basic"}'`</step>
    <step order="6">Verify response is `{"success":true}` or similar success indicator, HTTP 200</step>
    <step order="7">Run Test 3 - Status lookup: `curl -s http://localhost:4321/_emdash/api/plugins/membership/status -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`</step>
    <step order="8">Verify response is JSON object with email, plan, status fields (NOT a string, NOT double-encoded)</step>
    <step order="9">Check for double-encoding: response should be `{"email":"test@example.com",...}` NOT `"{\"email\":\"test@example.com\",...}"`</step>
    <step order="10">Document actual curl output for all 3 tests</step>
  </steps>

  <verification>
    <check type="test">Test 1 returns blocks array, no errors</check>
    <check type="test">Test 2 returns success response</check>
    <check type="test">Test 3 returns properly typed MemberRecord object</check>
    <check type="test">Test 3 response is NOT double-encoded JSON string</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Code must be violation-free before testing" />
    <depends-on task-id="phase-1-task-6" reason="KV binding must be verified before testing storage operations" />
  </dependencies>

  <commit-message>N/A - testing task only</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-8" wave="3">
  <title>Execute smoke tests 4-5: Block Kit admin actions</title>
  <requirement>R3.5 - Verify admin UI Block Kit handlers return valid responses</requirement>
  <description>
    Run smoke tests for the admin Block Kit action handlers (view members, view plans). These
    tests verify that the plugin's admin UI can render member lists and plan configurations
    using Emdash's Block Kit JSON UI format. Each action should return a blocks array with
    proper structure.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD Phase 3 Test 5 defines curl commands" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6 - Block Kit format documentation" />
  </context>

  <steps>
    <step order="1">Ensure dev server is still running from phase-1-task-7</step>
    <step order="2">Run Test 4 - View members: `curl -s http://localhost:4321/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"action","action_id":"view_members"}'`</step>
    <step order="3">Verify response contains `"blocks":[...]` with member data, HTTP 200</step>
    <step order="4">Run Test 5 - View plans: `curl -s http://localhost:4321/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"action","action_id":"view_plans"}'`</step>
    <step order="5">Verify response contains `"blocks":[...]` with plan configurations, HTTP 200</step>
    <step order="6">Document actual curl output for both tests</step>
  </steps>

  <verification>
    <check type="test">Test 4 returns valid Block Kit JSON with member list blocks</check>
    <check type="test">Test 5 returns valid Block Kit JSON with plan list blocks</check>
    <check type="test">Both responses have HTTP 200 status</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Must run after basic tests and dev server is confirmed running" />
  </dependencies>

  <commit-message>N/A - testing task only</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-9" wave="3">
  <title>Execute final smoke test: Banned patterns recheck</title>
  <requirement>R3.6 - Final verification that no banned patterns exist in deployed code</requirement>
  <description>
    Run a comprehensive final check for all banned patterns in the source file. This is a safety
    verification to ensure no patterns were accidentally reintroduced during earlier edits or
    that additional violations weren't discovered during testing. This is the last gate before
    documentation and deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="File to verify" />
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD Phase 3 Test 6 defines comprehensive grep pattern" />
  </context>

  <steps>
    <step order="1">Run comprehensive banned pattern check: `grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/membership/src/sandbox-entry.ts || echo 0`</step>
    <step order="2">Verify result is 0</step>
    <step order="3">If non-zero, identify which pattern matched and flag as CRITICAL BLOCKER</step>
    <step order="4">Document test result (PASS if 0, FAIL if >0)</step>
  </steps>

  <verification>
    <check type="test">Comprehensive grep returns 0 matches for all banned patterns</check>
    <check type="test">No rc.user references</check>
    <check type="test">No throw new Response in admin routes</check>
    <check type="test">No rc.pathParams references</check>
    <check type="test">No manual JSON.stringify KV double-encoding</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Run as final verification after all other tests pass" />
  </dependencies>

  <commit-message>N/A - testing task only</commit-message>
</task-plan>

---

### Wave 4 (Sequential, after Wave 3) — Documentation & Deployment

Final tasks to document results and commit/deploy the changes.

---

<task-plan id="phase-1-task-10" wave="4">
  <title>Create comprehensive test results documentation</title>
  <requirement>R4.1 - Document all smoke test results with actual outputs</requirement>
  <description>
    Create deliverables/membership-v2/TEST-RESULTS.md with complete documentation of all 6 smoke
    tests. Include the exact curl commands used, actual response outputs, pass/fail status for
    each test, and timestamp. This document serves as proof of testing and reference for future
    regression testing (when automated after 30-day stability period).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/membership-v2.md" reason="PRD defines required test documentation format" />
    <file path="/home/agent/shipyard-ai/rounds/membership-v2/decisions.md" reason="Specifies test matrix and expected outputs" />
  </context>

  <steps>
    <step order="1">Create directory if needed: `mkdir -p deliverables/membership-v2`</step>
    <step order="2">Create TEST-RESULTS.md file</step>
    <step order="3">Add header with timestamp, test environment (dev server), and success criteria</step>
    <step order="4">Document Test 1 (Admin page load): curl command, actual response, PASS/FAIL status</step>
    <step order="5">Document Test 2 (Registration): curl command, actual response, PASS/FAIL status</step>
    <step order="6">Document Test 3 (Status lookup): curl command, actual response, PASS/FAIL status, double-encoding check result</step>
    <step order="7">Document Test 4 (View members): curl command, actual response, PASS/FAIL status</step>
    <step order="8">Document Test 5 (View plans): curl command, actual response, PASS/FAIL status</step>
    <step order="9">Document Test 6 (Banned patterns check): grep command, result count (must be 0), PASS/FAIL status</step>
    <step order="10">Add summary section: total tests (6), passed, failed, overall result</step>
    <step order="11">If any test failed, add BLOCKERS section with remediation steps</step>
  </steps>

  <verification>
    <check type="manual">TEST-RESULTS.md file created in deliverables/membership-v2/</check>
    <check type="manual">All 6 tests documented with actual outputs</check>
    <check type="manual">Pass/fail status recorded for each test</check>
    <check type="manual">Timestamp included</check>
    <check type="manual">Summary shows 6/6 tests passed (or blockers documented if failures)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="All tests must complete before documentation" />
  </dependencies>

  <commit-message>N/A - documentation will be committed in phase-1-task-11</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-11" wave="4">
  <title>Commit all changes to version control</title>
  <requirement>R4.2 - Commit fixed source file, config changes, and test documentation</requirement>
  <description>
    Stage and commit all changes made during Phase 1: the fixed sandbox-entry.ts file with
    violations removed, the updated Sunrise Yoga astro.config.mjs with plugin registration,
    and the TEST-RESULTS.md documentation. Use a clear commit message following repo conventions
    that references the Harbor plugin and violation fixes.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Modified file to commit" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Modified config to commit" />
    <file path="/home/agent/shipyard-ai/deliverables/membership-v2/TEST-RESULTS.md" reason="New documentation to commit" />
    <file path="/home/agent/shipyard-ai/rounds/membership-v2/decisions.md" reason="Specifies commit message format" />
  </context>

  <steps>
    <step order="1">Use Bash git status to verify modified files</step>
    <step order="2">Stage sandbox-entry.ts: `git add plugins/membership/src/sandbox-entry.ts`</step>
    <step order="3">Stage astro.config.mjs: `git add examples/sunrise-yoga/astro.config.mjs`</step>
    <step order="4">Stage TEST-RESULTS.md: `git add deliverables/membership-v2/TEST-RESULTS.md`</step>
    <step order="5">Verify staging with `git status` - should show 3 staged files</step>
    <step order="6">Create commit with message: `git commit -m "fix: Harbor plugin - resolve 4 violations, register in Sunrise Yoga, verify via smoke tests"`</step>
    <step order="7">Verify commit succeeded with `git log -1 --oneline`</step>
    <step order="8">Verify working directory is clean with `git status`</step>
  </steps>

  <verification>
    <check type="manual">3 files staged: sandbox-entry.ts, astro.config.mjs, TEST-RESULTS.md</check>
    <check type="manual">Commit created with clear message referencing violations and Harbor</check>
    <check type="manual">Git log shows new commit</check>
    <check type="manual">Working directory clean (no uncommitted changes)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Documentation must be created before committing" />
  </dependencies>

  <commit-message>fix: Harbor plugin - resolve 4 violations, register in Sunrise Yoga, verify via smoke tests</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-12" wave="4">
  <title>Deploy to Sunrise Yoga and verify production functionality</title>
  <requirement>R4.3, R4.4 - Deploy to Cloudflare Workers and verify in production</requirement>
  <description>
    Deploy the updated Sunrise Yoga site with the Harbor plugin to Cloudflare Workers. Run the
    smoke tests again against the production deployment to ensure everything works in the live
    environment. If deployment is not ready (env vars missing, KV namespace not created), document
    the blockers and mark deployment as pending with remediation steps.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Cloudflare deployment configuration" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/package.json" reason="Deploy scripts" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5 - Cloudflare deployment steps" />
    <file path="/home/agent/shipyard-ai/rounds/membership-v2/decisions.md" reason="Open questions about deployment target" />
  </context>

  <steps>
    <step order="1">Navigate to Sunrise Yoga directory: `cd examples/sunrise-yoga`</step>
    <step order="2">Verify wrangler.jsonc has valid configuration for D1, R2, and KV bindings</step>
    <step order="3">If KV namespace missing, create it: `wrangler kv:namespace create "MEMBERSHIP_KV"` and update wrangler.jsonc</step>
    <step order="4">Build the site: `npm run build`</step>
    <step order="5">Deploy to Cloudflare: `npx wrangler deploy`</step>
    <step order="6">Note the deployed URL from wrangler output (e.g., https://sunrise-yoga.seth-a02.workers.dev)</step>
    <step order="7">Wait 30 seconds for deployment to propagate</step>
    <step order="8">Rerun Test 1 against production URL (replace localhost:4321 with deployed URL)</step>
    <step order="9">Rerun Tests 2-5 against production URL</step>
    <step order="10">Document production test results (all must pass)</step>
    <step order="11">If any test fails, investigate error logs: `wrangler tail` or Cloudflare dashboard</step>
    <step order="12">Document deployment completion or blockers in TEST-RESULTS.md</step>
  </steps>

  <verification>
    <check type="build">npm run build succeeds</check>
    <check type="build">wrangler deploy succeeds</check>
    <check type="test">All 5 smoke tests pass on production URL</check>
    <check type="manual">Deployment URL documented</check>
    <check type="manual">No 500 errors or auth failures in production</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Changes must be committed before deployment" />
  </dependencies>

  <commit-message>N/A - deployment task, no code changes</commit-message>
</task-plan>

---

## RISK NOTES

Based on the Risk Scanner Agent's assessment:

### CRITICAL RISKS

**Risk 1: KV Namespace Binding Missing**
- **Status:** Medium likelihood, High impact
- **Mitigation:** Task 6 verifies binding; if missing, create namespace via wrangler and update wrangler.jsonc
- **Owner:** Task 6 executor

**Risk 2: Environment Variables Missing**
- **Status:** Medium likelihood, High impact
- **Variables needed:** JWT_SECRET, STRIPE_WEBHOOK_SECRET, STRIPE_API_SECRET, APP_URL
- **Mitigation:** Document in TEST-RESULTS.md if missing; add to wrangler secrets before deploy
- **Owner:** Task 12 executor

**Risk 3: Monolithic File Complexity**
- **Status:** Low likelihood (for this phase), Medium impact
- **Concern:** Single 3,600-line file concentrates all logic; high refactoring risk
- **Mitigation:** DO NOT refactor in this phase; 30-day freeze policy
- **Owner:** Code review (deferred to V2)

### HIGH RISKS

**Risk 4: Double-Encoding KV Data**
- **Status:** Known past issue
- **Mitigation:** Test 3 explicitly checks for double-encoding; if detected, tests BLOCKED
- **Owner:** Task 7 executor

**Risk 5: Dev Server Port Mismatch**
- **Status:** Low likelihood, Low impact
- **Concern:** PRD assumes localhost:4321, actual port may differ
- **Mitigation:** Verify actual port when starting dev server in Task 7
- **Owner:** Task 7 executor

### MEDIUM RISKS

**Risk 6: Integration Test Suite May Fail**
- **Status:** Medium likelihood, Medium impact
- **Concern:** Existing __tests__/integration.test.ts may have assertions expecting old code
- **Mitigation:** Run `npm run test` after Task 3; if failures, investigate and fix
- **Owner:** Optional post-Wave 3 verification

---

## EXECUTION TIMELINE

- **Wave 1 (Research):** 5 minutes (tasks 1, 4 run in parallel)
- **Wave 2 (Code changes):** 3 minutes (tasks 2, 5 run in parallel)
- **Wave 3 (Verification & tests):** 12 minutes (tasks 3, 6, 7, 8, 9 run sequentially)
- **Wave 4 (Documentation & deploy):** 10 minutes (tasks 10, 11, 12 run sequentially)
- **Total estimated:** 30 minutes

---

## CRITICAL SUCCESS FACTORS

1. **All 6 smoke tests must pass** - Partial success (5/6) is failure
2. **Zero banned pattern violations** - Verified by grep returning 0
3. **No code rewrites or refactors** - Only remove specified violation blocks
4. **30-day code freeze** - No optimizations or improvements after deployment
5. **Manual testing discipline** - Copy-paste curl commands exactly, document actual output

---

## NEXT STEPS AFTER PHASE 1

1. **30-day monitoring period** - Watch error logs, no code changes
2. **If stable:** Unlock automation (convert curls to CI script)
3. **If unstable:** Root cause analysis, targeted fix only (no refactors)
4. **V2 planning** - Only after 30-day stability proven

---

**Status:** Ready for execution
**Owner:** Build agent (single session execution)
**Timeline:** <30 minutes from start to deployment
**Next step:** Execute Wave 1 tasks (phase-1-task-1, phase-1-task-4)
