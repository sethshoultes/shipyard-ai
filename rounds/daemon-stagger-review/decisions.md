# Decisions — Daemon Stagger Review ("Breathe")

**Consolidated by:** Phil Jackson, Zen Master
**Debate Participants:** Elon Musk (Engineering), Steve Jobs (Design & Brand)
**Board Reviewers:** Jensen Huang, Warren Buffett, Oprah Winfrey, Shonda Rhimes
**QA Director:** Margaret Hamilton
**Retrospective Observer:** Marcus Aurelius
**Status:** LOCKED — Ready for Build Phase
**Date:** 2026-04-13

---

## Executive Summary

The Great Minds Agency daemon was crashing with 48 OOM restarts due to running 4 concurrent Claude agents (~575MB each) on an 8GB droplet. The fix: batch agents in pairs (2+2) to reduce peak memory from ~2.3GB to ~1.15GB. Internal codename: "Breathe."

**Board Verdict:** PROCEED (unanimous 4/4)
**Average Score:** 5.75/10 (range: 4-8)
**QA Status:** BLOCKED until working tree cleanup

---

## Decision Register

### Decision 1: Core Architecture Approach

| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | Split `Promise.all` into two sequential batches of 2 agents each |
| **Why** | Minimum viable change. Two lines of code. No new abstractions. Reduces peak memory from ~2.3GB to ~1.15GB (50% reduction). Wall-clock cost of ~60s is acceptable tradeoff for stability. First-principles thinking: minimum viable change that solves the problem. |

---

### Decision 2: Batch Size

| | |
|---|---|
| **Proposed by** | Both (convergent) |
| **Winner** | Unanimous |
| **Decision** | Fixed batch size of 2 agents |
| **Why** | Pairs = maximum safe concurrency on 8GB box. No configuration flags. No "let's try 3" experiments. Binary rhythm: inhale (2 run), exhale (2 finish). Steve's "Breathe" metaphor crystallizes this: two agents at a time is sustainable respiration, not gasping. |

---

### Decision 3: Internal Naming

| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Decision** | Internal codename: "Breathe" |
| **Why** | Creates vocabulary for future decisions ("Does this fit the Breathe philosophy?"). Philosophy outlasts implementation. Team will use it as shorthand. Maya Angelou's review validated the metaphor: "Teaching a system to breathe instead of gasp" resonates in the body. |
| **Elon's Concession** | "I'll even take 'Breathe' as internal shorthand—it's memorable, and the team will use it." |

---

### Decision 4: Commit Message Format

| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | `fix(pipeline): batch agents in pairs to reduce peak memory 50%` |
| **Why** | Semantic commit convention. Searchable. Grep-able. Git history serves future debuggers at 2am, not marketing. Steve argued for `Breathe: pace agents for stability` but conceded that technical accuracy matters for posterity. |
| **Resolution** | Internal docs use "Breathe"; git history uses technical format. Both perspectives preserved. |

---

### Decision 5: Scope Discipline

| | |
|---|---|
| **Proposed by** | Both (convergent) |
| **Winner** | Unanimous |
| **Decision** | No scope creep — one fix, one PR, one purpose |
| **Why** | This was the strongest point of agreement between Elon and Steve. Both explicitly enumerated what NOT to do. The board unanimously reinforced this discipline. |

**Explicit NOs:**
- ❌ No metrics
- ❌ No dashboards
- ❌ No alerts
- ❌ No dynamic batch sizing
- ❌ No configuration flags
- ❌ No `BatchManager` abstraction
- ❌ No `AgentScheduler`
- ❌ No new files
- ❌ No pipeline restructuring
- ❌ No agent renaming
- ❌ No agent prompt changes

---

### Decision 6: Implementation Timeline

| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | Ship in one agent session |
| **Why** | 15 minutes coding, 5 minutes testing. Every hour debating is an hour the server is still OOMing. 48 OOM restarts are the burning platform. |
| **Steve's Agreement** | "Ship it. Absolutely. Analysis paralysis kills more products than bad names ever will." |

---

## Board Review Synthesis

### Scoring

| Reviewer | Score | Lens | Key Quote |
|----------|-------|------|-----------|
| **Oprah Winfrey** | 8/10 | Trust & Care | "The experience of 'things just working' is itself a welcome." |
| **Warren Buffett** | 6/10 | Capital Efficiency | "Competent but should have been prevented." |
| **Jensen Huang** | 5/10 | Strategic Value | "Technical debt payment, not investment. Zero compounding." |
| **Shonda Rhimes** | 4/10 | Narrative/Retention | "Outside my domain—infrastructure should be emotionally inert." |

**Average:** 5.75/10

### Points of Unanimous Agreement

1. **This is plumbing, not product** — Infrastructure that should be invisible
2. **The fix is correct and well-executed** — Clean, surgical, minimal blast radius
3. **Reliability has value** — Even when invisible, preventing crashes matters
4. **This should have been prevented** — 48 OOM restarts = excessive tolerance for pain

### Board Verdict: PROCEED ✅

All four reviewers approved. No blocking conditions before merge.

---

## MVP Feature Set (v1 Ships)

### ✅ In Scope

| Feature | Implementation |
|---------|----------------|
| **Board review batching** | `runBoardReview()`: Jensen + Oprah first, then Warren + Shonda |
| **Creative review batching** | `runCreativeReview()`: Jony + Maya first, then Aaron solo |
| **Two-agent concurrency** | Maximum 2 agents running simultaneously per phase |
| **Peak memory target** | ~1.15GB (down from ~2.3GB) |
| **Timeout preservation** | Board: 20min, Visual/Copy: 15min, Demo: 20min |

### ❌ Explicitly Out of Scope

- Pipeline restructuring
- Agent renaming or prompt changes
- Metrics, dashboards, or alerts
- Dynamic batch sizing
- Configuration flags
- New abstractions, manager classes, or files

---

## File Structure (What Gets Built)

```
great-minds-plugin/
└── daemon/
    └── src/
        └── pipeline.ts    ← MODIFIED (single file)
            ├── runBoardReview()
            │   ├── Batch 1: Jensen + Oprah (timeout: 20)
            │   └── Batch 2: Warren + Shonda (timeout: 20)
            └── runCreativeReview()
                ├── Batch 1: Jony + Maya (timeout: 15)
                └── Batch 2: Aaron solo (timeout: 20)

No new files created.
No files deleted.
No files renamed.
```

### Implementation Pattern

```typescript
// BEFORE (crashed)
await Promise.all([
  runAgent("jensen-huang-review", ..., 20),
  runAgent("oprah-winfrey-review", ..., 20),
  runAgent("warren-buffett-review", ..., 20),
  runAgent("shonda-rhimes-review", ..., 20),
]);

// AFTER (Breathe)
// Batch 1: Jensen + Oprah
await Promise.all([
  runAgent("jensen-huang-review", ..., 20),
  runAgent("oprah-winfrey-review", ..., 20),
]);

// Batch 2: Warren + Shonda
await Promise.all([
  runAgent("warren-buffett-review", ..., 20),
  runAgent("shonda-rhimes-review", ..., 20),
]);
```

---

## Open Questions (Deferred to v2)

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Is 7 agents per pipeline architecturally sound? | v2 Architecture | Deferred |
| 2 | Queue-based execution design for 100x scale? | v2 Architecture | Deferred |
| 3 | Agent pooling strategy (reuse warm Claude SDK instances)? | v2 Architecture | Deferred |
| 4 | Horizontal scaling topology (multiple workers)? | v2 Architecture | Deferred |
| 5 | Observability post-stabilization? | Post-ship review | Deferred |
| 6 | Should we upgrade to 16GB droplet instead? | Operations | Per Buffett: evaluate cost/benefit within 90 days |
| 7 | What does a full pipeline run cost in API tokens? | Finance + Engineering | Per Buffett: establish burn rate visibility |
| 8 | Are we building a pipeline or a runtime? | Product + Engineering Leadership | Per Jensen: strategic roadmap decision needed |

**Note:** All open questions are explicitly deferred. None block this ship.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Wall-clock time doubles** (~60s → ~120s per phase) | Certain | Medium | Accepted tradeoff. Reliability > speed. Users prefer slow-and-working over fast-and-crashed. |
| **Fix doesn't scale to 100x** | Certain | High | Acknowledged. This buys time. v2 requires queues, pooling, horizontal scaling. Per Elon: "This fix doesn't scale. It buys time." |
| **Someone adds "just one more thing"** | Medium | High | Scope locked. PR must be reviewed for creep. No exceptions. |
| **Batch size of 2 is too conservative** | Low | Low | Test in production. If margin exists, revisit in v2. Do not experiment in v1. |
| **Memory estimates are wrong** | Low | Medium | Success criteria: zero OOM restarts in 72 hours. If OOMs persist, investigate actual memory profiles. |
| **Future engineer misunderstands intent** | Medium | Low | Add inline comment block in pipeline.ts explaining *why* (per Oprah's recommendation). |
| **Working tree reversion** | HIGH (per QA) | Critical | **QA BLOCKER:** Uncommitted changes in great-minds-plugin would REVERT the fix. Must run `git checkout -- daemon/src/pipeline.ts` before deploy. |
| **Service restart not verified** | Medium | High | Must execute `systemctl restart shipyard-daemon.service` after clean working tree. |
| **Pre-existing TypeScript errors** | Low | Low | Tech debt (`logError` undefined, missing @types/better-sqlite3). Track separately, doesn't block this ship. |

---

## QA Status: BLOCKED ⚠️

**QA Director:** Margaret Hamilton

### Critical Issues (Must Resolve Before Ship)

| ID | Issue | Resolution |
|----|-------|------------|
| **P0-1** | Working tree in great-minds-plugin has uncommitted changes that REVERT the fix | Run `git checkout -- daemon/src/pipeline.ts` in great-minds-plugin |
| **P0-2** | Empty deliverables directory in shipyard-ai | Document that deliverable IS the pipeline.ts change |

### Required Actions

```bash
# 1. Clean working tree
cd /home/agent/great-minds-plugin
git reset HEAD daemon/src/pipeline.ts
git checkout -- daemon/src/pipeline.ts
git status  # Should show clean

# 2. Verify correct implementation
git show HEAD:daemon/src/pipeline.ts | grep -A5 "Batch 1: Jensen"
git show HEAD:daemon/src/pipeline.ts | grep -A5 "Batch 2: Warren"

# 3. Deploy
systemctl restart shipyard-daemon.service
```

---

## Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| OOM restarts | Zero | 72-hour observation window post-deploy |
| Peak memory | ≤ 1.5GB | `ps -o rss` during board review phase |
| Functional regression | None | All existing tests pass |
| PR cleanliness | Single PR | No follow-up fixes required |

---

## Post-Ship Recommendations (From Board)

### Within 30 Days (Strongly Recommended)

1. **Add Inline Documentation** — Comment block in `pipeline.ts` explaining *why* agents are batched (per Oprah)
2. **Implement Memory Monitoring** — `process.memoryUsage()` per agent run, alerts at >70% RAM (per Buffett)
3. **Parameterize Concurrency** — Extract `MAX_CONCURRENT_AGENTS=2` to environment config (per Jensen)

### Within 90 Days (Recommended)

4. **Cost Analysis** — Per-pipeline cost in Claude API tokens + compute time (per Buffett)
5. **Vertical Scaling Evaluation** — Cost/benefit of 8GB → 16GB droplet (per Buffett)
6. **Strategic Roadmap Discussion** — Pipeline vs. runtime decision (per Jensen)

---

## Retention Roadmap (Per Shonda)

Infrastructure fixes don't create retention—they prevent churn. Future retention features to consider:

1. **Visible Board Review Experience** — Show users the review in progress
2. **Staggered Feedback Reveals** — Release feedback reviewer-by-reviewer
3. **Distinct Reviewer Personas** — Make each board member's voice anticipated
4. **"What's Next?" Hooks** — End every review session with forward momentum
5. **Review Streak & History** — Track user engagement over time

*See `shonda-retention-roadmap.md` for full specification.*

---

## Philosophy

> "Teaching a system to breathe instead of gasp."

| Element | Definition |
|---------|------------|
| **Feeling** | Trust. Quiet confidence that things just work. |
| **North Star** | Reliability. Zero crashes. Everything else is noise. |
| **Creative Direction** | Rhythm over force. |

---

## Retrospective Learnings (Per Marcus Aurelius)

### What Worked

- Disciplined scope that held its boundaries
- Productive debate that converged (Elon + Steve agreed on 90%)
- Multi-perspective board review (4 distinct lenses)
- Honest assessment of value (everyone called it "plumbing")
- Quality creative artifacts (demo script, Maya's copy review, "Breathe" metaphor)

### What Didn't Work

- 48 OOM restarts before action (escalated too late)
- Uncommitted reversion in working tree (critical QA failure)
- Empty deliverables directory (unclear handoff protocol)
- Service restart not verified (deployment incomplete)
- Pre-existing TypeScript errors (normalized tech debt)

### Process Adherence Score: 6/10

> "The *thinking* was strong... But the *execution hygiene* failed at critical points."

---

## Final Verdict

### SHIP IT. ✅

The debate is over. Both parties agree on the fix. The board unanimously approves. The only remaining work is execution hygiene.

**Before merge:**
1. Clean the working tree
2. Verify the committed implementation
3. Restart the service
4. Observe for 72 hours

---

> *"This is not buying time. This is paying down debt. The original architecture was the loan. Breathe is the first payment."*
> — Steve Jobs, Round 2

> *"Clock's ticking. 48 more OOM restarts are happening while we talk. Let's stop debating and deploy."*
> — Elon Musk, Round 2

> *"The absence of drama is sometimes the whole point. This keeps the lights on so the real show can happen elsewhere."*
> — Shonda Rhimes, Board Review

---

**Document Version:** Final
**Last Updated:** 2026-04-13
**Next Review:** Post 72-hour observation window
