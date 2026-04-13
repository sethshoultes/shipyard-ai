# Phase 1 Plan — Daemon Stagger Review (Breathe)

**Generated:** 2024-04-13
**Project Slug:** daemon-stagger-review
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 4
**Waves:** 3
**Internal Codename:** "Breathe"

---

## The Essence

> **What is this fix REALLY about?**
> Teaching a system to breathe instead of gasp.

> **What's the feeling it should evoke?**
> Trust. Quiet confidence that things just work.

> **What's the North Star?**
> Reliability. Zero crashes. Everything else is noise.

> **Creative direction:**
> Rhythm over force. Inhale (2 run), exhale (2 finish).

---

## Problem Statement

The board review phase runs 4 Claude agents concurrently, and creative review runs 3 concurrently. Combined with Claude SDK overhead per agent, peak memory spikes to ~2.3GB on an 8GB droplet. This triggers OOM kills — **48 documented OOM restarts**.

Swap is a safety net, not a plan. The correct fix: cap concurrent agent fan-out to 2 at a time.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-1: Split runBoardReview() into 2+2 batches | phase-1-task-1 | 1 |
| REQ-2: Split runCreativeReview() into 2+1 batches | phase-1-task-2 | 1 |
| REQ-3: Preserve exact function signatures | phase-1-task-1, phase-1-task-2 | 1 |
| REQ-4: Achieve 50% peak memory reduction | phase-1-task-3 | 2 |
| REQ-5: Semantic commit message format | phase-1-task-4 | 3 |
| REQ-6: Commit to great-minds-plugin repo | phase-1-task-4 | 3 |
| REQ-7: No scope creep | All tasks | All |

---

## Wave Execution Order

### Wave 1 (Parallel) — Code Changes

Both code changes can run in parallel as they modify different functions within the same file.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Split runBoardReview() into 2+2 sequential batches</title>
  <requirement>REQ-1, REQ-3</requirement>
  <description>
    Modify runBoardReview() in pipeline.ts to execute board review agents in two
    sequential Promise.all blocks instead of one. Batch 1: Jensen + Oprah.
    Batch 2: Warren + Shonda. Reduces concurrent agents from 4 to 2.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="Target file for modification" />
    <file path="/home/agent/shipyard-ai/prds/daemon-stagger-review.md" reason="PRD with exact code pattern (Change 1)" />
    <file path="/home/agent/shipyard-ai/rounds/daemon-stagger-review/decisions.md" reason="Locked decisions and scope boundaries" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Atomic requirements REQ-1, REQ-3" />
  </context>

  <steps>
    <step order="1">Read pipeline.ts and locate runBoardReview() function (lines 397-422)</step>
    <step order="2">Find the Promise.all block at lines 404-409 with 4 agents</step>
    <step order="3">Replace single Promise.all with two sequential Promise.all blocks</step>
    <step order="4">Batch 1 (lines 404-407): Jensen + Oprah
      await Promise.all([
        runAgent("jensen-huang-review", jensenHuangBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-jensen.md")), 20),
        runAgent("oprah-winfrey-review", oprahWinfreyBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-oprah.md")), 20),
      ]);</step>
    <step order="5">Add comment "// Batch 1: Jensen + Oprah" above first Promise.all</step>
    <step order="6">Batch 2 (sequential after Batch 1): Warren + Shonda
      await Promise.all([
        runAgent("warren-buffett-review", warrenBuffettBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-buffett.md")), 20),
        runAgent("shonda-rhimes-review", shondaRhimesBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-shonda.md")), 20),
      ]);</step>
    <step order="7">Add comment "// Batch 2: Warren + Shonda" above second Promise.all</step>
    <step order="8">Verify all function call signatures match PRD exactly (agent names, maxTurns=20, output paths)</step>
    <step order="9">Verify no other code in the function is changed</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/great-minds-plugin/daemon && npx tsc --noEmit</check>
    <check type="manual">Count Promise.all blocks in runBoardReview() — should be 2</check>
    <check type="manual">Each Promise.all should have exactly 2 agents</check>
    <check type="manual">All agent names and parameters unchanged from original</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(pipeline): batch board review agents in pairs (2+2)</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Split runCreativeReview() into 2+1 sequential batches</title>
  <requirement>REQ-2, REQ-3</requirement>
  <description>
    Modify runCreativeReview() in pipeline.ts to execute creative review agents in two
    sequential phases. Batch 1: Jony Ive + Maya Angelou (visual + copy, in Promise.all).
    Batch 2: Aaron Sorkin solo (sequential await, not Promise.all).
    Reduces concurrent agents from 3 to 2.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="Target file for modification" />
    <file path="/home/agent/shipyard-ai/prds/daemon-stagger-review.md" reason="PRD with exact code pattern (Change 2)" />
    <file path="/home/agent/shipyard-ai/rounds/daemon-stagger-review/decisions.md" reason="Locked decisions and scope boundaries" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Atomic requirements REQ-2, REQ-3" />
  </context>

  <steps>
    <step order="1">Read pipeline.ts and locate runCreativeReview() function (lines 382-395)</step>
    <step order="2">Find the Promise.all block at lines 388-392 with 3 agents</step>
    <step order="3">Replace single Promise.all with: one Promise.all(2 agents) + one sequential await</step>
    <step order="4">Batch 1 (Promise.all with 2 agents): Jony + Maya
      await Promise.all([
        runAgent("jony-ive-review", jonyIveVisualReview(delDir, resolve(roundsDir, "review-jony-ive.md")), 15),
        runAgent("maya-angelou-review", mayaAngelouCopyReview(delDir, resolve(roundsDir, "review-maya-angelou.md")), 15),
      ]);</step>
    <step order="5">Add comment "// Batch 1: Jony + Maya (visual + copy)" above Promise.all</step>
    <step order="6">Batch 2 (sequential after Batch 1): Aaron solo — NOT Promise.all
      await runAgent("aaron-sorkin-demo", aaronSorkinDemoScript(project, delDir, resolve(roundsDir, "demo-script.md")), 20);</step>
    <step order="7">Add comment "// Batch 2: Aaron solo (demo script is independent)" above Aaron's call</step>
    <step order="8">Verify all function call signatures match PRD exactly (Jony/Maya maxTurns=15, Aaron maxTurns=20)</step>
    <step order="9">Verify no other code in the function is changed</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/great-minds-plugin/daemon && npx tsc --noEmit</check>
    <check type="manual">Count Promise.all blocks in runCreativeReview() — should be 1</check>
    <check type="manual">Promise.all should have exactly 2 agents (Jony + Maya)</check>
    <check type="manual">Aaron Sorkin should be sequential await (not in Promise.all)</check>
    <check type="manual">All agent names and parameters unchanged from original</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies, can run parallel with task-1 -->
  </dependencies>

  <commit-message>fix(pipeline): batch creative review agents (2+1 pattern)</commit-message>
</task-plan>
```

---

### Wave 2 (After Wave 1) — Verification

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>TypeScript compilation and dry-run verification</title>
  <requirement>REQ-4</requirement>
  <description>
    Verify the modified pipeline.ts compiles without TypeScript errors.
    Run a dry verification to ensure the code is syntactically correct.
    This is the gate before committing.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="Modified file to verify" />
    <file path="/home/agent/great-minds-plugin/daemon/tsconfig.json" reason="TypeScript configuration" />
    <file path="/home/agent/great-minds-plugin/daemon/package.json" reason="Build scripts" />
  </context>

  <steps>
    <step order="1">Change directory to /home/agent/great-minds-plugin/daemon</step>
    <step order="2">Run npx tsc --noEmit to check for TypeScript errors</step>
    <step order="3">If errors: identify which task introduced them, fix in that task</step>
    <step order="4">Run git diff daemon/src/pipeline.ts to review all changes</step>
    <step order="5">Verify ONLY the two targeted functions were modified</step>
    <step order="6">Verify NO new files were created (REQ-7: no scope creep)</step>
    <step order="7">Verify NO agent names were changed</step>
    <step order="8">Verify NO agent prompt functions were modified</step>
    <step order="9">Count total lines changed — should be minimal (~10-15 lines)</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/great-minds-plugin/daemon && npx tsc --noEmit — must exit 0</check>
    <check type="test">git status shows ONLY pipeline.ts modified</check>
    <check type="manual">git diff shows surgical changes to Promise.all blocks only</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Must have modified runBoardReview()" />
    <depends-on task-id="phase-1-task-2" reason="Must have modified runCreativeReview()" />
  </dependencies>

  <commit-message>N/A — verification only, no commit</commit-message>
</task-plan>
```

---

### Wave 3 (After Wave 2) — Commit and Deploy

```xml
<task-plan id="phase-1-task-4" wave="3">
  <title>Commit, push, and restart daemon service</title>
  <requirement>REQ-5, REQ-6</requirement>
  <description>
    Commit changes with exact semantic commit message from decisions.md.
    Push to great-minds-plugin repository. Restart shipyard-daemon.service
    to load the new code.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="File to commit" />
    <file path="/home/agent/shipyard-ai/rounds/daemon-stagger-review/decisions.md" reason="Decision 4: exact commit message" />
    <file path="/home/agent/shipyard-ai/prds/daemon-stagger-review.md" reason="PRD Section: CRITICAL repo instructions" />
  </context>

  <steps>
    <step order="1">Change directory to /home/agent/great-minds-plugin</step>
    <step order="2">Run git status to confirm only pipeline.ts is modified</step>
    <step order="3">Run git add daemon/src/pipeline.ts</step>
    <step order="4">Run git commit with EXACT message from Decision 4:
      git commit -m "fix(pipeline): batch agents in pairs to reduce peak memory 50%"</step>
    <step order="5">Run git push origin main (or current branch)</step>
    <step order="6">Run: sudo systemctl restart shipyard-daemon.service</step>
    <step order="7">Run: sudo systemctl status shipyard-daemon.service to verify running</step>
    <step order="8">Check daemon logs for any startup errors: journalctl -u shipyard-daemon.service -n 50</step>
  </steps>

  <verification>
    <check type="test">git log --oneline -1 shows exact commit message</check>
    <check type="test">git status shows clean working tree</check>
    <check type="test">systemctl status shipyard-daemon.service shows active (running)</check>
    <check type="manual">No errors in daemon startup logs</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Must pass verification before committing" />
  </dependencies>

  <commit-message>fix(pipeline): batch agents in pairs to reduce peak memory 50%</commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **RISK: Wall-clock time doubles (~60s → ~120s per phase)** — ACCEPTED per decisions.md. Reliability > speed.

2. **RISK: Memory estimate wrong, still OOMs** — MEDIUM likelihood, LOW impact. Mitigation: 72-hour observation window post-deploy. If OOMs persist, profile actual memory.

3. **RISK: Scope creep** — MEDIUM likelihood. Mitigation: decisions.md explicitly lists NOs. Enforce in PR review.

4. **RISK: Sequential overhead** — LOW. The split is pure `await`, no new mechanisms.

5. **NO TEST COVERAGE** — The daemon has no unit tests. Success criteria are production-based: zero OOM restarts in 72 hours.

6. **NO RACE CONDITIONS INTRODUCED** — Each agent writes to distinct files. Splitting to sequential batches maintains file isolation.

---

## Post-Deploy Monitoring (Success Criteria)

From PRD and Decisions:

| Metric | Target | How to Check |
|--------|--------|--------------|
| OOM restarts | 0 in 72 hours | `journalctl -u shipyard-daemon.service | grep -i oom` |
| Peak memory | ≤ 1.5GB | `ps -o rss -p $(pgrep -f shipyard-daemon)` during pipeline |
| Pipeline completion | End-to-end success | Check Telegram notifications |
| Agent arrival pattern | 2 START, 2 DONE, 2 START, 2 DONE | Daemon logs during board-review phase |

---

## Summary

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 (Parallel) | 2 tasks | Code changes: split runBoardReview() and runCreativeReview() |
| Wave 2 (Sequential) | 1 task | Verification: TypeScript compilation, diff review |
| Wave 3 (Sequential) | 1 task | Deploy: commit, push, restart daemon |
| **Total** | **4 tasks** | |

**Critical Path:** Wave 1 → Wave 2 → Wave 3

**Parallelization:**
- Wave 1: Both code change tasks can run in parallel

**Time Estimate:** 15-20 minutes total (per Decision 6: "Ship in one agent session, today")

---

## Scope Lock

Per Decision 5 (Scope Discipline), the following are **EXPLICITLY NOT ALLOWED**:

- Pipeline restructuring
- Agent renaming
- Agent prompt changes
- Metrics/observability
- Dashboards
- Alerts
- Dynamic batch sizing
- Configuration flags
- New abstractions (BatchManager, AgentScheduler)
- New manager classes
- New files

**If it's not in this plan, it's out of scope.**

---

## Philosophy Lock

From `rounds/daemon-stagger-review/decisions.md`:

> Teaching a system to breathe instead of gasp.

**Feeling:** Trust. Quiet confidence that things just work.
**North Star:** Reliability. Zero crashes. Everything else is noise.
**Creative Direction:** Rhythm over force.

This is not buying time. This is paying down debt.

**SHIP IT.**

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2024-04-13*
