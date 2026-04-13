# REQUIREMENTS — Daemon Stagger Review

**Project Slug:** daemon-stagger-review
**Generated:** 2024-04-13
**Sources:** PRD (`prds/daemon-stagger-review.md`), Decisions (`rounds/daemon-stagger-review/decisions.md`)

---

## Core Requirements

### REQ-1: Split runBoardReview() into Sequential Batches of 2 Agents

| Field | Value |
|-------|-------|
| **Source** | PRD (Section: Change 1) |
| **Description** | Modify `runBoardReview()` in `/home/agent/great-minds-plugin/daemon/src/pipeline.ts` to execute board review agents in two sequential Promise.all blocks instead of one. Batch 1: Jensen + Oprah. Batch 2: Warren + Shonda. |
| **Current Code** | Lines 404-409: Single Promise.all with 4 agents |
| **Target Code** | Two sequential Promise.all blocks, each with 2 agents |
| **Verification** | TypeScript compiles; logs show 2-wave agent arrival pattern (2 START, 2 DONE, 2 START, 2 DONE) |

### REQ-2: Split runCreativeReview() into Sequential Batches (2+1 Pattern)

| Field | Value |
|-------|-------|
| **Source** | PRD (Section: Change 2) |
| **Description** | Modify `runCreativeReview()` to execute creative review agents in two sequential phases. Batch 1: Jony Ive + Maya Angelou (visual + copy). Batch 2: Aaron Sorkin solo (demo script). |
| **Current Code** | Lines 388-392: Single Promise.all with 3 agents |
| **Target Code** | One Promise.all with 2 agents, then one sequential `await runAgent()` |
| **Verification** | TypeScript compiles; logs show sequential agent execution |

### REQ-3: Preserve Exact Function Signatures

| Field | Value |
|-------|-------|
| **Source** | PRD (Sections: Change 1 & 2) |
| **Description** | All function call signatures must match PRD specification exactly: agent identifiers, timeout values (20 for board agents, 15 for visual/copy, 20 for demo), output file paths. |
| **Verification** | Code diff shows exact match to PRD template; no argument reordering |

### REQ-4: Achieve 50% Peak Memory Reduction

| Field | Value |
|-------|-------|
| **Source** | Decisions (Decision 1) |
| **Description** | Peak memory must reduce from ~2.3GB to ~1.15GB through the batching constraint. This is the engineering goal underpinning the strategy. |
| **Verification** | `ps -o rss` during pipeline shows peak ≤ 1.8GB; zero OOM restarts in 72-hour window |

### REQ-5: Semantic Commit Message Format

| Field | Value |
|-------|-------|
| **Source** | Decisions (Decision 4) |
| **Description** | Commit message must follow exact format: `fix(pipeline): batch agents in pairs to reduce peak memory 50%` |
| **Verification** | `git log --oneline` shows exact commit message |

### REQ-6: Commit to great-minds-plugin Repository

| Field | Value |
|-------|-------|
| **Source** | PRD (Section: CRITICAL) |
| **Description** | Changes must be committed and pushed to `/home/agent/great-minds-plugin/daemon/src/pipeline.ts`, NOT shipyard-ai. Post-push: `systemctl restart shipyard-daemon.service` |
| **Verification** | `git log` in great-minds-plugin shows new commit; systemctl confirms restart |

### REQ-7: No Scope Creep

| Field | Value |
|-------|-------|
| **Source** | Decisions (Decision 5) |
| **Description** | Single targeted fix only. No new features, abstractions, or files. One PR, one purpose. |
| **Verification** | PR contains only pipeline.ts changes; no new files added |

---

## Explicit Scope Exclusions

The following are **explicitly OUT of scope** per Decisions Document (Decision 5):

| Category | Excluded Item |
|----------|---------------|
| Architecture | Pipeline restructuring |
| Agent Config | Agent renaming |
| Prompts | Agent prompt changes |
| Observability | Metrics collection |
| Observability | Dashboards |
| Observability | Alerts |
| Configuration | Dynamic batch sizing |
| Configuration | Configuration flags |
| Code Structure | New abstractions (BatchManager, AgentScheduler) |
| Code Structure | New manager classes |
| Code Structure | New files |

---

## Implementation Patterns

### Pattern 1: Board Review (4 agents → 2+2 batches)

**BEFORE (Lines 404-409):**
```typescript
await Promise.all([
  runAgent("jensen-huang-review", jensenHuangBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-jensen.md")), 20),
  runAgent("oprah-winfrey-review", oprahWinfreyBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-oprah.md")), 20),
  runAgent("warren-buffett-review", warrenBuffettBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-buffett.md")), 20),
  runAgent("shonda-rhimes-review", shondaRhimesBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-shonda.md")), 20),
]);
```

**AFTER:**
```typescript
// Batch 1: Jensen + Oprah
await Promise.all([
  runAgent("jensen-huang-review", jensenHuangBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-jensen.md")), 20),
  runAgent("oprah-winfrey-review", oprahWinfreyBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-oprah.md")), 20),
]);

// Batch 2: Warren + Shonda
await Promise.all([
  runAgent("warren-buffett-review", warrenBuffettBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-buffett.md")), 20),
  runAgent("shonda-rhimes-review", shondaRhimesBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-shonda.md")), 20),
]);
```

### Pattern 2: Creative Review (3 agents → 2+1 batches)

**BEFORE (Lines 388-392):**
```typescript
await Promise.all([
  runAgent("jony-ive-review", jonyIveVisualReview(delDir, resolve(roundsDir, "review-jony-ive.md")), 15),
  runAgent("maya-angelou-review", mayaAngelouCopyReview(delDir, resolve(roundsDir, "review-maya-angelou.md")), 15),
  runAgent("aaron-sorkin-demo", aaronSorkinDemoScript(project, delDir, resolve(roundsDir, "demo-script.md")), 20),
]);
```

**AFTER:**
```typescript
// Batch 1: Jony + Maya (visual + copy)
await Promise.all([
  runAgent("jony-ive-review", jonyIveVisualReview(delDir, resolve(roundsDir, "review-jony-ive.md")), 15),
  runAgent("maya-angelou-review", mayaAngelouCopyReview(delDir, resolve(roundsDir, "review-maya-angelou.md")), 15),
]);

// Batch 2: Aaron solo (demo script is independent)
await runAgent("aaron-sorkin-demo", aaronSorkinDemoScript(project, delDir, resolve(roundsDir, "demo-script.md")), 20);
```

---

## Success Criteria

### From PRD

- [ ] `pipeline.ts` shows two batched blocks in `runBoardReview()` and `runCreativeReview()`
- [ ] TypeScript compiles without errors
- [ ] Pipeline logs show board review agents arriving in two waves (2 START, 2 DONE, 2 START, 2 DONE)
- [ ] Peak RSS of daemon process during board-review stays ≤ 1.8GB
- [ ] Pipeline completes end-to-end
- [ ] Changes committed to `great-minds-plugin` and pushed
- [ ] `systemctl restart shipyard-daemon.service` executed after push

### From Decisions

- [ ] Zero OOM restarts in 72-hour observation window post-deploy
- [ ] Peak memory ≤ 1.5GB under normal pipeline load
- [ ] All existing tests pass (no functional regression)
- [ ] Single PR with no follow-up fixes required

---

## Risk Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Wall-clock time doubles (~60s → ~120s per phase) | MEDIUM | Accepted tradeoff per decisions.md |
| Memory estimate wrong | MEDIUM | 72-hour observation window; rollback ready |
| Scope creep | MEDIUM | Explicit NOs documented; enforce in review |
| Sequential overhead | LOW | Negligible; pure await statement |

---

## Deferred to v2 Architecture

The following are explicitly deferred and do NOT block this ship:

1. Is 7 agents per pipeline architecturally sound?
2. Queue-based execution design for 100x scale
3. Agent pooling strategy (warm Claude SDK instances)
4. Horizontal scaling topology (multiple workers)
5. Post-stabilization observability

---

## File Scope

**ONLY ONE FILE MODIFIED:**
```
/home/agent/great-minds-plugin/daemon/src/pipeline.ts
```

- No new files created
- No files deleted
- No files renamed
