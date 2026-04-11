# NERVE — Locked Decisions

**Project:** Operations Hardening for Autonomous Pipeline Daemon
**Debate Rounds:** 2
**Participants:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Arbiter:** Phil Jackson
**Date:** 2026-04-11

---

## Decision Summary

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | Name: NERVE | Steve | **Steve** | One word, four letters, communicates function (central nervous system). Internal infra becomes external infra — naming discipline is thinking discipline. |
| 2 | No Dashboards v1 | Steve | **Steve** | If you need a chart to know if it works, it doesn't work simply enough. Observation theater deferred. |
| 3 | Bash over Agent Prompts | Both | **Consensus** | "Trust bash, not instructions." Deterministic execution is the architectural contract. No probabilistic operations for critical paths. |
| 4 | PRD Required Before v2 | Elon | **Elon** | Technical debt acknowledged. Process discipline for future work, even if v1 shipped without it. |
| 5 | Observability Before Scale | Elon | **Elon** | Three metrics (queue depth, latency, error count) before sharding. No dashboard required, but numbers must exist. |
| 6 | Zero Configuration Philosophy | Steve | **Steve** | Every option is a failure to decide. Opinionated defaults, no config sprawl. |

---

## MVP Feature Set (v1 Ships)

### Core Components
1. **PID Lockfile** — Prevents duplicate daemon instances
2. **Queue Persistence** — Survives crashes, no lost state
3. **Abort Flag** — Stops runaway pipelines cleanly
4. **Strict Verdict Parsing** — Unambiguous QA results
5. **Deterministic Commits** — Bash execution, not agent requests

### Explicitly Deferred (v2+)
- Metrics/observability endpoint
- Multi-daemon coordination
- Distributed locking (Redis/etcd)
- Queue partitioning
- Automated recovery beyond abort flags
- Dashboard/visualization

---

## File Structure (What Gets Built)

```
nerve/
├── daemon.sh              # Main daemon loop with PID lockfile
├── queue.sh               # Queue persistence and recovery
├── abort.sh               # Abort flag management
├── parse-verdict.sh       # Strict QA verdict parsing
└── README.md              # Documentation (debt to pay)
```

**Principle:** Four files, no new dependencies, defense in depth.

---

## Open Questions (Require Resolution)

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | Where does the retrospective PRD get filed? | Elon | No — v1 shipped |
| 2 | What's the exact log format? Steve wants "clinical surgeon," Elon wants greppable. Both agree on no emoji. | Both | Yes — affects build |
| 3 | Should `ps aux | grep nerve` work, or `ps aux | grep promptops`? Process naming vs. brand naming. | Unresolved | Yes — affects daemon naming |
| 4 | When do we add the three metrics? Before v2 features, or as first v2 feature? | Elon | No — sequencing only |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Single-machine architecture breaks at scale** | Medium | High | Known limitation. Sharding path is clear: partition queue, run multiple workers. Not a v1 problem. | Elon |
| **No automated testing for infra that manages tests** | Low | Medium | "Testing infrastructure that manages tests creates infinite regress." Accept risk. Ship proves correctness. | Steve |
| **Documentation debt compounds** | High | Medium | PRD must exist before v2. README shipped with v1. | Elon |
| **Process name ambiguity** | Medium | Low | Resolve before build: either `nerve` or `promptops-daemon`, not both. | Both |
| **Observability gap masks failures** | Low | High | Three metrics added before any scale work. Acceptable blind spot for v1 single-machine. | Elon |
| **Brand name "NERVE" confuses ops engineers** | Low | Low | Steve's counter: clarity compounds. When 3 AM page doesn't come, "NERVE handled it" is the answer. | Steve |

---

## Consensus Principles (Both Agreed)

1. **Determinism over elegance.** When something must happen, it happens. No asking. No hoping.
2. **Invisible architecture.** The best infra is infra you forget exists.
3. **Resist scope creep.** Could have rewritten entire pipeline. Didn't.
4. **Clinical voice.** `[QUEUE] processed 47 items in 2.3s`. No emoji. No "Oops!"
5. **Leverage work.** This isn't a product — it's the foundation for products.

---

## The Essence

**What it is:** The invisible backbone that makes everything else possible.

**The feeling:** Peace. The absence of the 3 AM knot in your stomach.

**The one thing that must be perfect:** Determinism.

**Creative direction:** Disappear completely. Work always.

---

*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
*"When the floor is solid, the dance is free."* — Phil Jackson

---

**Status:** Ready for build phase.
