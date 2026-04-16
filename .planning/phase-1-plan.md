# Phase 1 Plan — Issue #74 EventDash Entrypoint Fix (Verification & Closure)

**Generated**: 2026-04-16
**Requirements**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-74.md`
**Decisions**: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-74/decisions.md`
**Total Tasks**: 6
**Waves**: 2

---

## Executive Summary

**Current Status**: Issue #74 technical implementation is **COMPLETE**. The EventDash plugin entrypoint has been successfully changed from npm alias (`@shipyard/eventdash/sandbox`) to file path resolution using Node.js standard library. The pattern matches the proven Membership plugin implementation exactly.

**What Remains**: Verification, documentation, and closure. No additional code changes required for Issue #74 itself.

**Key Finding**: The fix is done, but board scored 2.75/10 due to missing deployment, unresolved test failures, and lack of prevention mechanisms. This phase plan addresses verification and proper closure.

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Status |
|-------------|---------|------|--------|
| R1: Change entrypoint from npm alias to file path | N/A | N/A | ✅ DONE (pre-planning) |
| R2: Use Node.js standard library | N/A | N/A | ✅ DONE (pre-planning) |
| R3: Match Membership plugin pattern | N/A | N/A | ✅ DONE (pre-planning) |
| R4: Verify sandbox-entry.ts exists | phase-1-task-1 | 1 | ⏳ PENDING |
| R5: Test Cloudflare Workers build | phase-1-task-2 | 1 | ⏳ PENDING |
| R6: Verify astro.config.mjs registration | phase-1-task-3 | 1 | ⏳ PENDING |
| R7: Create human-readable summary | phase-1-task-4 | 2 | ⏳ PENDING |
| R8: Create visual before/after diff | phase-1-task-5 | 2 | ⏳ PENDING |
| R9: Document blockers | phase-1-task-6 | 2 | ⏳ PENDING |

---

## Wave Execution Order

### Wave 1 (Parallel Verification Tasks)

<task-plan id="phase-1-task-1" wave="1">
  <title>Verify sandbox-entry.ts File Exists</title>
  <requirement>R4: Verify sandbox-entry.ts exists at correct location</requirement>
  <description>
    Confirm that the entrypoint file referenced in index.ts actually exists at the expected path.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/index.ts" reason="Contains entrypoint path construction" />
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts" reason="The entrypoint file that must exist" />
  </context>

  <steps>
    <step order="1">Read plugins/eventdash/src/index.ts</step>
    <step order="2">Use ls -lh to verify sandbox-entry.ts exists</step>
    <step order="3">Record file size</step>
  </steps>

  <verification>
    <check type="manual">File exists and is ~111KB</check>
  </verification>

  <dependencies></dependencies>

  <commit-message><!-- No commit --></commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>Test Cloudflare Workers Build</title>
  <requirement>R5: Test Cloudflare Workers build succeeds</requirement>
  <description>
    Verify EventDash plugin builds successfully for Cloudflare Workers.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/package.json" reason="Build scripts" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: Deployment patterns" />
  </context>

  <steps>
    <step order="1">Navigate to plugins/eventdash</step>
    <step order="2">Run npm run build</step>
    <step order="3">Check for errors</step>
  </steps>

  <verification>
    <check type="build">cd plugins/eventdash && npm run build</check>
  </verification>

  <dependencies></dependencies>

  <commit-message><!-- No commit --></commit-message>
</task-plan>

<task-plan id="phase-1-task-3" wave="1">
  <title>Verify astro.config.mjs Registration</title>
  <requirement>R6: Verify astro.config.mjs registration</requirement>
  <description>
    Confirm EventDash plugin is registered in Sunrise Yoga config.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Plugin registration" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin registration" />
  </context>

  <steps>
    <step order="1">Read examples/sunrise-yoga/astro.config.mjs</step>
    <step order="2">Confirm import statement</step>
    <step order="3">Verify plugin in plugins array</step>
  </steps>

  <verification>
    <check type="manual">Import present</check>
    <check type="manual">Plugin registered</check>
  </verification>

  <dependencies></dependencies>

  <commit-message><!-- No commit --></commit-message>
</task-plan>

### Wave 2 (Documentation Tasks)

<task-plan id="phase-1-task-4" wave="2">
  <title>Create Human-Readable Summary</title>
  <requirement>R7: Document what was fixed</requirement>
  <description>
    Write concise, non-technical summary per board mandate.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-74/decisions.md" reason="Section XII: Template" />
  </context>

  <steps>
    <step order="1">Review Wave 1 results</step>
    <step order="2">Draft summary (max 100 words)</step>
    <step order="3">Write to SUMMARY.md</step>
  </steps>

  <verification>
    <check type="manual">Under 100 words</check>
    <check type="manual">No jargon</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs verification results" />
    <depends-on task-id="phase-1-task-2" reason="Needs build results" />
    <depends-on task-id="phase-1-task-3" reason="Needs registration status" />
  </dependencies>

  <commit-message>
    docs: add human-readable summary for Issue #74

    Board feedback: 14K-word doc drowned the win.

    Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  </commit-message>
</task-plan>

<task-plan id="phase-1-task-5" wave="2">
  <title>Create Visual Before/After Diff</title>
  <requirement>R8: Create visual diff</requirement>
  <description>
    Side-by-side code comparison showing the change.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/index.ts" reason="Current state" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-74/decisions.md" reason="BEFORE code" />
  </context>

  <steps>
    <step order="1">Extract BEFORE from decisions.md</step>
    <step order="2">Extract AFTER from index.ts</step>
    <step order="3">Create markdown comparison</step>
    <step order="4">Write to VISUAL_DIFF.md</step>
  </steps>

  <verification>
    <check type="manual">Code blocks accurate</check>
    <check type="manual">Key difference clear</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Confirms file exists" />
    <depends-on task-id="phase-1-task-2" reason="Validates fix" />
  </dependencies>

  <commit-message>
    docs: add visual before/after diff for Issue #74

    Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  </commit-message>
</task-plan>

<task-plan id="phase-1-task-6" wave="2">
  <title>Document Blockers and Follow-Up</title>
  <requirement>R9: Document blockers</requirement>
  <description>
    List deployment blockers and follow-up issues.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-74/decisions.md" reason="Risk Register" />
  </context>

  <steps>
    <step order="1">List 4 blockers with owners</step>
    <step order="2">Define follow-up issues</step>
    <step order="3">Write to BLOCKERS.md</step>
  </steps>

  <verification>
    <check type="manual">All blockers documented</check>
    <check type="manual">Issues defined</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Verification results" />
    <depends-on task-id="phase-1-task-2" reason="Build results" />
    <depends-on task-id="phase-1-task-3" reason="Registration status" />
  </dependencies>

  <commit-message>
    docs: document blockers and follow-up for Issue #74

    Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  </commit-message>
</task-plan>

---

## Success Criteria

- [ ] Wave 1 verification complete
- [ ] Wave 2 documentation complete
- [ ] All 6 tasks executed
- [ ] No code changes required

---

**Plan Status:** READY FOR EXECUTION
**Estimated Completion:** 1 day (Wave 1: 2h, Wave 2: 4h)
