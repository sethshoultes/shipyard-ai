# Decisions — Daemon Stagger Review

**Consolidated by:** Phil Jackson, Zen Master
**Debate Participants:** Elon Musk (Engineering), Steve Jobs (Design & Brand)
**Status:** LOCKED — Ready for Build Phase

---

## Decision Register

### Decision 1: Core Architecture Approach
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | Split `Promise.all` into two sequential batches of 2 agents each |
| **Why** | Minimum viable change. Two lines of code. No new abstractions. Reduces peak memory from ~2.3GB to ~1.15GB (50% reduction). Wall-clock cost of ~60s is acceptable tradeoff for stability. |

### Decision 2: Batch Size
| | |
|---|---|
| **Proposed by** | Both (convergent) |
| **Winner** | Unanimous |
| **Decision** | Fixed batch size of 2 agents |
| **Why** | Pairs = maximum safe concurrency on 8GB box. No configuration flags. No "let's try 3" experiments. Binary rhythm: inhale (2 run), exhale (2 finish). |

### Decision 3: Internal Naming
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Decision** | Internal codename: "Breathe" |
| **Why** | Creates vocabulary for future decisions. "Does this fit the Breathe philosophy?" Philosophy outlasts implementation. Team will use it as shorthand. |

### Decision 4: Commit Message Format
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | `fix(pipeline): batch agents in pairs to reduce peak memory 50%` |
| **Why** | Semantic commit convention. Searchable. Grep-able. Git history serves future debuggers at 2am, not marketing. |

### Decision 5: Scope Discipline
| | |
|---|---|
| **Proposed by** | Both (convergent) |
| **Winner** | Unanimous |
| **Decision** | No scope creep — one fix, one PR, one purpose |
| **Why** | Explicit NOs: no metrics, no dashboards, no alerts, no dynamic batch sizing, no config flags, no `BatchManager` abstraction, no `AgentScheduler`, no new files. |

### Decision 6: Implementation Timeline
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | Ship in one agent session, today |
| **Why** | 15 minutes coding, 5 minutes testing. Every hour debating is an hour the server is still OOMing. 48 OOM restarts are the burning platform. |

---

## MVP Feature Set (v1 Ships)

### In Scope
1. **Pipeline batching** — Split existing `Promise.all` blocks in `pipeline.ts` into sequential pairs
2. **Two-agent concurrency** — Maximum 2 agents running simultaneously per phase
3. **Peak memory target** — ~1.15GB (down from ~2.3GB)

### Explicitly Out of Scope
- Pipeline restructuring
- Agent renaming
- Agent prompt changes
- Metrics/observability
- Dashboards
- Alerts
- Dynamic batch sizing
- Configuration flags
- New abstractions or manager classes
- New files

---

## File Structure (What Gets Built)

```
Modified:
└── pipeline.ts
    ├── Phase 1 Promise.all → Split into 2 sequential batches
    └── Phase 2 Promise.all → Split into 2 sequential batches

No new files created.
No files deleted.
No files renamed.
```

### Implementation Pattern
```typescript
// BEFORE (current)
await Promise.all([agent1(), agent2(), agent3(), agent4()]);

// AFTER (Breathe)
await Promise.all([agent1(), agent2()]);
await Promise.all([agent3(), agent4()]);
```

---

## Open Questions (Require Resolution)

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | Is 7 agents per pipeline architecturally sound? | v2 Architecture | No — deferred |
| 2 | What's the queue-based execution design for 100x scale? | v2 Architecture | No — deferred |
| 3 | Agent pooling strategy (reuse warm Claude SDK instances)? | v2 Architecture | No — deferred |
| 4 | Horizontal scaling topology (multiple workers)? | v2 Architecture | No — deferred |
| 5 | Should observability be added post-stabilization? | Post-ship review | No — deferred |

**Note:** All open questions are explicitly deferred to v2. None block this ship.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Wall-clock time doubles** (~60s → ~120s per phase) | Certain | Medium | Accepted tradeoff. Reliability > speed. Users prefer slow-and-working over fast-and-crashed. |
| **Fix doesn't scale to 100x** | Certain | High | Acknowledged. This buys time. v2 requires queues, pooling, horizontal scaling. |
| **Someone adds "just one more thing"** | Medium | High | Scope locked. PR must be reviewed for creep. No exceptions. |
| **Batch size of 2 is too conservative** | Low | Low | Test in production. If margin exists, revisit in v2. Do not experiment in v1. |
| **Memory estimates are wrong** | Low | Medium | Success criteria: zero OOM restarts in 72 hours. If OOMs persist, investigate actual memory profiles. |
| **Future engineer misunderstands intent** | Medium | Low | Commit message is technical (Elon). Internal docs use "Breathe" vocabulary (Steve). Both perspectives preserved. |

---

## Success Criteria

1. **Zero OOM restarts** in 72-hour observation window post-deploy
2. **Peak memory ≤ 1.5GB** under normal pipeline load
3. **All existing tests pass** — no functional regression
4. **Single PR** — no follow-up fixes required

---

## Philosophy (From Essence)

> Teaching a system to breathe instead of gasp.

**Feeling:** Trust. Quiet confidence that things just work.
**North Star:** Reliability. Zero crashes. Everything else is noise.
**Creative Direction:** Rhythm over force.

---

## Final Verdict

**SHIP IT.**

The debate is over. Both parties agree on the fix. The only remaining work is execution.

- Elon provides the engineering precision: minimal change, clear metrics, surgical deployment
- Steve provides the institutional memory: "Breathe" as vocabulary, intention over mechanism

This is not buying time. This is paying down debt. The original architecture was the loan. Breathe is the first payment.

*Stop debating. Deploy.*
