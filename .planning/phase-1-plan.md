# Phase 1 Plan — Membership Plugin Hotfix

**Generated**: 2026-04-16
**Requirements**: /home/agent/shipyard-ai/prds/membership-hotfix.md
**Total Tasks**: 4
**Waves**: 2

## Executive Summary

This is a p0 production hotfix for the Membership plugin on yoga.shipyard.company. Two runtime bugs are blocking customers:
1. Blank settings page (admin dashboard returns empty blocks)
2. Members page crash (null reference error on `.map()`)

The fix involves adding a default page_load handler and reinforcing null guards on KV operations.

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-1: Fix blank settings page | phase-1-task-1 | 1 |
| REQ-2: Implement dashboard page_load handler | phase-1-task-1 | 1 |
| REQ-3: Add null guard to members list | phase-1-task-2 | 1 |
| REQ-4: Add null guard to view_members handler | phase-1-task-2 | 1 |
| REQ-5: Add null guard to view_plans handler | phase-1-task-2 | 1 |
| REQ-6: Verify all array operations have null guards | phase-1-task-2 | 1 |
| REQ-7: Verify zero banned patterns | phase-1-task-3 | 2 |
| REQ-8: Commit and push changes | phase-1-task-4 | 2 |

## Wave Execution Order

### Wave 1 (Parallel) — Core Fixes

These tasks are independent and can be executed in parallel:

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Add default admin dashboard page_load handler</title>
  <requirement>REQ-1, REQ-2: Fix blank settings page by adding page_load handler for root admin page</requirement>
  <description>
    The admin handler currently only responds to `/members` and `/plans` routes. When users navigate to the root plugin admin page (/_emdash/admin/plugins/membership), no handler matches and it returns empty blocks, causing a blank screen. This task adds a default dashboard handler that shows member stats, plan stats, and navigation buttons.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Main plugin file containing admin handler (lines 2202-2525)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Block Kit format reference (lines 1015-1047)" />
    <file path="/home/agent/shipyard-ai/prds/membership-hotfix.md" reason="PRD with exact fix instructions (lines 36-57)" />
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts" reason="Working example of admin page_load handlers (lines 2862-2939)" />
  </context>

  <steps>
    <step order="1">Read lines 2202-2525 of sandbox-entry.ts to understand current admin handler structure</step>
    <step order="2">Locate the members page handler (starts at line 2211) - this is the reference pattern</step>
    <step order="3">Add new handler BEFORE the members page handler (insert before line 2211) that checks: `if (interaction.type === "page_load" && (!interaction.page || interaction.page === "/"))`</step>
    <step order="4">Inside this handler, fetch member list and plans list from KV: `const listJson = await ctx.kv.get&lt;string&gt;("members:list") ?? "[]"; const memberEmails = parseJSON&lt;string[]&gt;(listJson, []); const plansJson = await ctx.kv.get&lt;string&gt;("plans") ?? "[]"; const plans = parseJSON(plansJson, DEFAULT_PLANS);`</step>
    <step order="5">Return Block Kit response with: (1) Header block with text "MemberShip — Membership Management", (2) Stats block with "Total Members" count and "Active Plans" count, (3) Actions block with 3 buttons: "Manage Members" (action_id: "view_members", style: "primary"), "Manage Plans" (action_id: "view_plans"), "Settings" (action_id: "view_settings")</step>
    <step order="6">Verify the Block Kit structure matches the format in EMDASH-GUIDE.md (lines 1022-1047) and PRD example (lines 42-56)</step>
  </steps>

  <verification>
    <check type="manual">Navigate to https://yoga.shipyard.company/_emdash/admin/plugins/membership and verify: (1) Page is NOT blank, (2) Header shows "MemberShip — Membership Management", (3) Stats show member and plan counts, (4) Three action buttons are visible</check>
    <check type="test">Access the admin page in a local dev environment and verify blocks render correctly</check>
    <check type="code-review">Verify the new handler is placed BEFORE line 2211 (members page handler) so it catches root page requests first</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is an independent fix -->
  </dependencies>

  <commit-message>fix(membership): add default admin dashboard page_load handler

The admin handler now responds to root page requests (/_emdash/admin/plugins/membership)
with a dashboard showing member/plan stats and action buttons. Previously returned
empty blocks causing blank screen.

Fixes: REQ-1, REQ-2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Add comprehensive null guards to KV array operations</title>
  <requirement>REQ-3, REQ-4, REQ-5, REQ-6: Add null guards with ?? [] fallbacks to all KV list fetches</requirement>
  <description>
    The members and plans page handlers call .map() on KV results. While parseJSON() provides fallbacks, the PRD indicates crashes occur with "Cannot read properties of undefined (reading 'map')". This task adds explicit null coalescing operators (?? []) to every KV list fetch to ensure arrays are never undefined before map operations.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Contains all KV list fetches and array operations" />
    <file path="/home/agent/shipyard-ai/prds/membership-hotfix.md" reason="PRD with exact null guard pattern (lines 59-70)" />
  </context>

  <steps>
    <step order="1">Search for all instances of `ctx.kv.get` followed by array operations in sandbox-entry.ts</step>
    <step order="2">Locate members list fetch at line 2212: `const listJson = await ctx.kv.get&lt;string&gt;("members:list");` - add null coalescing: `await ctx.kv.get&lt;string&gt;("members:list") ?? "[]"`</step>
    <step order="3">Verify plans list fetch at line 2386 already has proper fallback via parseJSON (should be safe, but verify)</step>
    <step order="4">Search for all other KV list fetches (members:list, plans, gating-rules:list, groups:list, webhooks:list) and ensure each has either ?? [] or parseJSON with array default</step>
    <step order="5">Run grep command to find all .map() calls: `grep -n "\.map(" plugins/membership/src/sandbox-entry.ts` and verify each has a null-safe source</step>
    <step order="6">Update the default return at line 2511 from `return { blocks: [] }` to include a comment explaining this is the fallback for unknown interaction types</step>
  </steps>

  <verification>
    <check type="test">Create test scenario with empty members KV and access members page - should show empty table, not crash</check>
    <check type="test">Create test scenario with empty plans KV and access plans page - should show default plans, not crash</check>
    <check type="build">Run grep to verify pattern: `grep -c "ctx\.kv\.get.*members:list" plugins/membership/src/sandbox-entry.ts` followed by manual verification each has null guard</check>
    <check type="manual">Code review: verify every .map(), .filter(), .forEach(), .reduce() call operates on a null-safe array</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is an independent fix -->
  </dependencies>

  <commit-message>fix(membership): add null guards to all KV array operations

Added ?? [] null coalescing to members:list and other KV fetches to prevent
"Cannot read properties of undefined (reading 'map')" crashes when KV stores
are empty or return null.

Fixes: REQ-3, REQ-4, REQ-5, REQ-6

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 2 (Parallel, after Wave 1) — Verification & Deploy

These tasks depend on Wave 1 completing:

---

<task-plan id="phase-1-task-3" wave="2">
  <title>Verify zero banned patterns</title>
  <requirement>REQ-7: Verify code contains no banned patterns (throw new Response, rc.user, rc.pathParams)</requirement>
  <description>
    Emdash sandboxed plugins have banned patterns that will cause runtime failures. This task verifies the codebase does not contain any of these patterns. According to the Risk Scanner agent, the code already passes this check, but we verify again after our changes.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="File to verify" />
    <file path="/home/agent/shipyard-ai/prds/membership-hotfix.md" reason="PRD lists banned patterns (lines 81-84)" />
  </context>

  <steps>
    <step order="1">Run grep command: `grep -c "throw new Response" plugins/membership/src/sandbox-entry.ts` - expect output: 0</step>
    <step order="2">Run grep command: `grep -c "rc\.user" plugins/membership/src/sandbox-entry.ts` - expect output: 0</step>
    <step order="3">Run grep command: `grep -c "rc\.pathParams" plugins/membership/src/sandbox-entry.ts` - expect output: 0</step>
    <step order="4">If any command returns > 0, identify the line and fix it before proceeding</step>
    <step order="5">Document verification results in commit message</step>
  </steps>

  <verification>
    <check type="build">Run combined grep: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts` - must return 0</check>
    <check type="manual">Visual code review of admin handler section to confirm proper patterns are used</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Verification must run after code changes are complete" />
    <depends-on task-id="phase-1-task-2" reason="Verification must run after code changes are complete" />
  </dependencies>

  <commit-message>chore(membership): verify zero banned patterns

Confirmed sandbox-entry.ts contains no banned patterns:
- No "throw new Response"
- No "rc.user" references
- No "rc.pathParams" references

Fixes: REQ-7

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="2">
  <title>Commit and push all changes</title>
  <requirement>REQ-8: Commit all changes with descriptive message and push to remote</requirement>
  <description>
    After all fixes are complete and verified, commit the changes to git and push to the remote repository. This makes the hotfix available for deployment to yoga.shipyard.company.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Modified file to commit" />
    <file path="/home/agent/shipyard-ai/CLAUDE.md" reason="Git commit guidelines (lines 141-151)" />
  </context>

  <steps>
    <step order="1">Run `git status` to verify sandbox-entry.ts is modified and no other unexpected changes exist</step>
    <step order="2">Run `git add plugins/membership/src/sandbox-entry.ts` to stage the file</step>
    <step order="3">Create commit with conventional commit format: `git commit -m "$(cat &lt;&lt;'EOF'
fix(membership): fix blank settings page and null reference crashes

Two production bugs fixed:
1. Admin dashboard now shows member/plan stats and navigation buttons
2. Added null guards to prevent .map() crashes on empty KV stores

The admin handler previously returned empty blocks for root page requests,
causing a blank screen. Now returns proper dashboard with stats and actions.

All KV list fetches now use ?? [] null coalescing to prevent undefined
errors when stores are empty.

Fixes: REQ-1 through REQ-8

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;
EOF
)"`</step>
    <step order="4">Run `git log -1` to verify commit was created with correct message</step>
    <step order="5">Run `git push` to push changes to remote (or `git push origin HEAD` if on a feature branch)</step>
    <step order="6">Verify push succeeded by checking git status shows "Your branch is up to date"</step>
  </steps>

  <verification>
    <check type="build">Run `git status` - should show clean working tree</check>
    <check type="build">Run `git log -1 --oneline` - should show commit with "fix(membership)" prefix</check>
    <check type="build">Run `git status` after push - should show "Your branch is up to date with 'origin/...'"</check>
    <check type="manual">Verify commit appears in GitHub/remote repository</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Must commit after code changes are complete" />
    <depends-on task-id="phase-1-task-2" reason="Must commit after code changes are complete" />
    <depends-on task-id="phase-1-task-3" reason="Must commit after verification passes" />
  </dependencies>

  <commit-message>chore(membership): phase 1 complete - ready for deploy

All hotfix tasks completed:
- Dashboard page_load handler added
- Null guards added to all KV operations
- Banned patterns verified (zero violations)
- Changes committed and pushed

Ready for deployment to yoga.shipyard.company

Fixes: REQ-8

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

### HIGH RISK
- **Production Hotfix**: This is fixing a live site (yoga.shipyard.company). Test changes thoroughly before deployment.
- **KV State Assumptions**: The fix assumes DEFAULT_PLANS constant is properly defined. Verify this exists and is an array.

### MEDIUM RISK
- **Regression Risk**: Changes to admin handler could affect existing /members and /plans pages. Test all admin pages after changes.
- **Block Kit Format**: Must follow exact format from EMDASH-GUIDE.md. Incorrect format will cause rendering failures.

### LOW RISK
- **Null Guard Redundancy**: Some null guards may be redundant with parseJSON, but redundancy improves safety for production hotfix.

## Deployment Notes

After Phase 1 completion:
1. Test changes locally using `npm run dev`
2. Verify all admin pages load correctly
3. Deploy to yoga.shipyard.company using deployment procedure
4. Monitor for errors in production logs
5. Have rollback plan ready (revert commit if issues occur)

## Token Budget Summary

- **Research Phase**: ~54K tokens (3 haiku agents)
- **Planning Phase**: ~2K tokens (this document)
- **Implementation Phase**: ~30K tokens (estimated)
- **Review & Deploy**: ~10K tokens (estimated)
- **Buffer**: ~4K tokens
- **TOTAL**: ~100K tokens (within hotfix tier budget)

---

*Generated by agency-plan skill • GSD methodology*
*Fresh context embedded in each task plan for autonomous executor agents*
