# Phase 1 Plan — Intake: Add p2 Support

**Generated**: 2024-04-14
**Project Slug**: intake-add-p2
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 5
**Waves**: 3

---

## The Essence

From decisions.md:

> **What is this product REALLY about?**
> Intake makes work matter by ensuring nothing falls through the cracks.

> **What's the feeling it should evoke?**
> Trust. The quiet relief of knowing the system sees you.

> **What's the one thing that must be perfect?**
> Invisibility. It works, so you never think about it.

> **Creative direction:**
> Disappear into the workflow.

---

## Problem Statement

The GitHub intake daemon in `health.ts` only polls for `p0` and `p1` labeled issues. GitHub issues #34 (SEODash) and #35 (CommerceKit) are labeled `p2` and will never be auto-queued. The intake should grab all actionable priority labels.

Per Decision 7: "Minimum viable delta. Ship the diff, not the refactor."

**This is a 4-6 line code change.**

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-001: Add p2 label fetch | phase-1-task-1 | 1 |
| REQ-002: Include p2 in merged array | phase-1-task-1 | 1 |
| REQ-003: Deduplication handles 3 labels | phase-1-task-1 | 1 |
| REQ-004: Update polling log message | phase-1-task-2 | 1 |
| REQ-005: Update results log message | phase-1-task-2 | 1 |
| REQ-007: Configurable labels (optional) | phase-1-task-3 | 2 |
| REQ-012: TypeScript compiles | phase-1-task-4 | 2 |
| REQ-020-022: Commit, push, restart | phase-1-task-5 | 3 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Core Changes

Two independent tasks that can run in parallel.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Add p2 label fetch and merge into dedup array</title>
  <requirement>REQ-001, REQ-002, REQ-003</requirement>
  <description>
    Add p2 label fetching to pollGitHubIssuesWithLabels() function.
    This is the core change: one new line to fetch, one line modified to merge.
    Existing Set-based deduplication automatically handles 3 labels.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/health.ts" reason="Main file to modify, lines 162-222" />
    <file path="/home/agent/shipyard-ai/prds/intake-add-p2.md" reason="PRD with code examples" />
    <file path="/home/agent/shipyard-ai/rounds/intake-add-p2/decisions.md" reason="Decision 8: Deduplication via Set" />
  </context>

  <steps>
    <step order="1">Open health.ts and locate pollGitHubIssuesWithLabels() function (line 162)</step>
    <step order="2">Find the p0Issues and p1Issues fetch calls (lines 187-188)</step>
    <step order="3">Add new line after p1Issues: const p2Issues = fetchByLabel("p2");</step>
    <step order="4">Modify merged array (line 192) from [...p0Issues, ...p1Issues] to [...p0Issues, ...p1Issues, ...p2Issues]</step>
    <step order="5">Verify Set deduplication logic works unchanged with 3 sources</step>
  </steps>

  <verification>
    <check type="test">grep "fetchByLabel.*p2" daemon/src/health.ts returns 1 match</check>
    <check type="test">grep "p2Issues" daemon/src/health.ts returns at least 2 matches (declaration + usage)</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(intake): add p2 label to GitHub issue polling</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Update log messages from p0/p1 to p0/p1/p2</title>
  <requirement>REQ-004, REQ-005</requirement>
  <description>
    Update the two log messages in pollGitHubIssuesWithLabels() to reflect p2 support.
    Per Decision 3: "Observability — Logging Over Silence"
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/health.ts" reason="Log messages at lines 163 and 220" />
    <file path="/home/agent/shipyard-ai/rounds/intake-add-p2/decisions.md" reason="Decision 3: Logging requirements" />
  </context>

  <steps>
    <step order="1">Find line 163: log("INTAKE: Polling GitHub for p0/p1 issues")</step>
    <step order="2">Change "p0/p1" to "p0/p1/p2"</step>
    <step order="3">Find line 220: log(`INTAKE: Found ${issues.length} p0/p1 issue(s)...`)</step>
    <step order="4">Change "p0/p1" to "p0/p1/p2"</step>
    <step order="5">Verify no other p0/p1 strings exist that should be updated</step>
  </steps>

  <verification>
    <check type="test">grep "p0/p1 issue" daemon/src/health.ts returns 0 results (all updated)</check>
    <check type="test">grep "p0/p1/p2" daemon/src/health.ts returns 2 results</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>docs(intake): update log messages to reflect p2 support</commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Optional Config + Verification

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>Add configurable priority labels (OPTIONAL)</title>
  <requirement>REQ-007, REQ-008</requirement>
  <description>
    Per Decision 4: "Labels as Config, Not Constants"

    IMPORTANT: Decision 7 mandates "minimal diff". This task is OPTIONAL.
    If implementing config adds significant complexity, SKIP this task
    and hardcode ['p0', 'p1', 'p2'] for v1.

    If implemented, follow existing config.ts pattern at lines 9, 59, 62:
    process.env.VAR || defaultValue
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/config.ts" reason="Existing config patterns" />
    <file path="/home/agent/great-minds-plugin/daemon/src/health.ts" reason="Where labels would be consumed" />
    <file path="/home/agent/shipyard-ai/rounds/intake-add-p2/decisions.md" reason="Decision 4 and Decision 7" />
  </context>

  <steps>
    <step order="1">EVALUATE: Can configurable labels be added in under 10 lines?</step>
    <step order="2">IF YES: Add to config.ts:
      export const INTAKE_PRIORITY_LABELS =
        process.env.INTAKE_PRIORITY_LABELS?.split(',').map(s => s.trim()) || ['p0', 'p1', 'p2'];</step>
    <step order="3">IF YES: Update health.ts to import INTAKE_PRIORITY_LABELS</step>
    <step order="4">IF YES: Replace hardcoded fetchByLabel calls with loop over config array</step>
    <step order="5">IF NO: Skip this task, hardcoded ['p0', 'p1', 'p2'] is acceptable for v1</step>
  </steps>

  <verification>
    <check type="test">If implemented: INTAKE_PRIORITY_LABELS=p0,p1 should exclude p2</check>
    <check type="test">If implemented: grep "INTAKE_PRIORITY_LABELS" daemon/src/config.ts returns match</check>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="manual">Diff is still minimal (~10 lines total, not more)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Core p2 support must be added first" />
  </dependencies>

  <commit-message>feat(intake): make priority labels configurable via env var</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Verify TypeScript compilation and run tests</title>
  <requirement>REQ-012, REQ-013</requirement>
  <description>
    Verify the build passes and the diff is minimal as required by Decision 7.
    No tests exist for pollGitHubIssuesWithLabels() (per Codebase Scout),
    so focus on TypeScript compilation.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/package.json" reason="Build and test scripts" />
    <file path="/home/agent/great-minds-plugin/daemon/tsconfig.json" reason="TypeScript config" />
    <file path="/home/agent/great-minds-plugin/daemon/tests/health.test.ts" reason="Existing tests (checkMemory, runHeartbeat only)" />
  </context>

  <steps>
    <step order="1">Run TypeScript compilation: cd /home/agent/great-minds-plugin/daemon && npx tsc --noEmit</step>
    <step order="2">Run existing tests: npm test</step>
    <step order="3">Review git diff to verify minimal change (~4-6 lines)</step>
    <step order="4">Verify no unintended changes to other functions</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit exits with code 0</check>
    <check type="test">npm test passes (existing tests)</check>
    <check type="manual">git diff shows only health.ts modified (and optionally config.ts)</check>
    <check type="manual">Total lines changed is under 15</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Core changes must be complete" />
    <depends-on task-id="phase-1-task-2" reason="Log changes must be complete" />
  </dependencies>

  <commit-message>N/A — verification only, no commit</commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Deploy

```xml
<task-plan id="phase-1-task-5" wave="3">
  <title>Commit, push, and restart daemon</title>
  <requirement>REQ-020, REQ-021, REQ-022</requirement>
  <description>
    Commit the changes to great-minds-plugin repository, push to remote,
    and restart the daemon service.

    Per PRD: "systemctl restart shipyard-daemon.service after push"
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/health.ts" reason="Modified file to commit" />
    <file path="/home/agent/great-minds-plugin/daemon/src/config.ts" reason="Potentially modified if config added" />
  </context>

  <steps>
    <step order="1">Stage changes: git add daemon/src/health.ts (and config.ts if modified)</step>
    <step order="2">Commit with conventional commit message (see below)</step>
    <step order="3">Push to remote: git push</step>
    <step order="4">Restart daemon: systemctl restart shipyard-daemon.service</step>
    <step order="5">Verify daemon is running: systemctl status shipyard-daemon.service</step>
    <step order="6">Check logs for p0/p1/p2 polling: journalctl -u shipyard-daemon.service -f</step>
  </steps>

  <verification>
    <check type="test">git status shows clean working tree</check>
    <check type="test">git log --oneline -1 shows expected commit message</check>
    <check type="test">systemctl status shipyard-daemon.service shows "active (running)"</check>
    <check type="manual">journalctl shows "INTAKE: Polling GitHub for p0/p1/p2 issues"</check>
    <check type="manual">p2 issues #34 and #35 are converted to PRDs on next poll cycle</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Verification must pass before deploy" />
  </dependencies>

  <commit-message>feat(intake): add p2 label support for GitHub issue polling

Per PRD intake-add-p2 and locked decisions:
- Poll for p0, p1, AND p2 labeled issues
- Deduplicate via Set before processing
- Update log messages to reflect p0/p1/p2

One targeted change. No refactor.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **SCOPE CREEP (High Likelihood, High Impact)**: Decision 7 is a HARD CONSTRAINT — "Minimal Diff, No Refactor". The temptation to refactor the fetchByLabel loop or add comprehensive config is explicitly forbidden.

2. **Hardcoded References (High Likelihood, Medium Impact)**: Search for ALL "p0/p1" strings before committing. Lines 163 and 220 are known, but verify no others exist.

3. **Test Coverage Gap (High Likelihood, Medium Impact)**: No tests exist for `pollGitHubIssuesWithLabels()`. Accepted for v1 per "ship today" mandate. Add tests in v2.

4. **Config Complexity (Medium Likelihood, Medium Impact)**: Decision 4 wants configurable labels, but Decision 7 mandates minimal diff. Resolution: Task 3 is OPTIONAL. If config adds >10 lines, skip it.

5. **Three API Calls at Scale (Low Likelihood, High Impact)**: Current scale (6 repos, 5-min polling) is safe. Monitor via logs. Batched query optimization deferred to v2 per Decision 9.

---

## Summary

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 (Parallel) | 2 tasks | Add p2 fetch + update log messages |
| Wave 2 (Parallel) | 2 tasks | Optional config + verification |
| Wave 3 (Sequential) | 1 task | Commit, push, restart |
| **Total** | **5 tasks** | |

**Critical Path:** Wave 1 → Wave 2 → Wave 3

**Estimated Total LOC Change:** 4-6 lines (core) + 0-10 lines (optional config) = 4-16 lines max

---

## Success Criteria (from PRD)

- [x] Intake polls for p0, p1, AND p2 issues
- [ ] Issues #34 and #35 are auto-converted to PRDs on next poll
- [x] TypeScript compiles
- [ ] Committed to great-minds-plugin, pushed
- [ ] `systemctl restart shipyard-daemon.service` after push

---

## Files to Modify

Per PRD and minimal diff requirement:

| File | Changes |
|------|---------|
| `/home/agent/great-minds-plugin/daemon/src/health.ts` | Add p2 fetch (1 line), modify merged array (1 line), update 2 log messages |
| `/home/agent/great-minds-plugin/daemon/src/config.ts` | OPTIONAL: Add INTAKE_PRIORITY_LABELS export |

---

## Scope Lock

Per decisions.md, the following are **EXPLICITLY NOT IN SCOPE**:

- Dashboard or status page (Decision 6)
- User-facing configuration UI (Decision 5)
- p3, p4 or additional priority levels (MVP)
- Batched API query optimization (Decision 9 — v2)
- Health check endpoint (MVP — v2)
- Refactoring existing code (Decision 7)

**If it's not in this plan, it's out of scope.**

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2024-04-14*
