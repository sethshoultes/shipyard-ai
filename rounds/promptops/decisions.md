# NERVE — Final Decisions Document

**Project:** Autonomous Pipeline Daemon for Operations Hardening
**Arbiter:** Phil Jackson
**Debate Participants:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Reviewers:** Jony Ive (Design), Maya Angelou (Copy), Margaret Hamilton (QA)
**Board:** Warren Buffett, Jensen Huang, Oprah Winfrey
**Date:** 2026-04-11
**Status:** READY FOR BUILD

---

## I. Locked Decisions

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: NERVE** | Steve | **Steve** | One word, four letters. Communicates function (central nervous system). "PromptOps" describes a ticket; NERVE describes what it *feels* like—essential, alive, connected. Names shape destiny. |
| 2 | **No Proxy in v1** | Elon | **Elon** | Proxy adds 90% of the risk for 30% of the value. Streaming complexity, provider compatibility, security surface—all deferred. SDK fetch-on-boot handles 95% of use cases. |
| 3 | **No Dashboards v1** | Steve | **Steve** | "If you need a chart to know if it works, it doesn't work simply enough." Dashboard is read-only observation theater—deferred to v2. |
| 4 | **Bash Over Agent Prompts** | Both | **Consensus** | "Trust bash, not instructions." Deterministic execution is the architectural contract. When something must happen, code makes it happen. No probabilistic operations for critical paths. |
| 5 | **Zero Configuration** | Steve | **Steve** | Every option is a failure to decide. Opinionated defaults, no config sprawl. Users trust; we decide. |
| 6 | **Rate Limiting Per API Key** | Elon | **Elon** | One bad actor shouldn't kill everyone. Non-negotiable before any external exposure. |
| 7 | **CLI-First Architecture** | Both | **Consensus** | Dashboard is read-only v1. CLI handles all operations including rollback. `nerve push`, `nerve status`, `nerve abort`—these are the verbs. |
| 8 | **Observability Before Scale** | Elon | **Elon** | Three metrics (queue depth, latency, error count) must exist before any sharding work. Numbers before features. |
| 9 | **PRD Required Before v2** | Elon | **Elon** | Technical debt acknowledged. Process discipline for future work. |
| 10 | **Clinical Voice** | Both | **Consensus** | `[QUEUE] 47 items processed. 2.3s elapsed.` No exclamation marks. No emoji. No "Oops!" Competent systems report and move on. |

---

## II. MVP Feature Set (What Ships in v1)

### Core Components

| Component | Description | Implementation |
|-----------|-------------|----------------|
| **PID Lockfile** | Prevents duplicate daemon instances | `daemon.sh` checks/creates `/tmp/nerve.pid` |
| **Queue Persistence** | Survives crashes, no lost state | `queue.sh` writes to `/tmp/nerve-queue/` directory |
| **Abort Flag** | Stops runaway pipelines cleanly | `abort.sh` manages `/tmp/nerve.abort` file |
| **Strict Verdict Parsing** | Unambiguous QA results (PASS/FAIL/BLOCKED) | `parse-verdict.sh` returns JSON with verdict, issue counts |
| **Deterministic Commits** | Bash execution, not agent requests | All operations are shell commands, not LLM prompts |
| **Crash Recovery** | Moves in-progress items back to pending on restart | `queue.sh` handles state recovery on init |

### User Experience

**First 30 seconds:** Nothing happens that the user notices. That's the point.

- Daemon starts silently
- Queue persists automatically
- Pipelines complete without drama
- No duplicate runs, no hung processes, no lost state

**The product is the absence of friction.**

### Explicitly Deferred (v2+)

- Metrics/observability dashboard
- Multi-daemon coordination
- Distributed locking (Redis/etcd)
- Queue partitioning
- Automated recovery beyond abort flags
- LLM-powered verdict parsing (Jensen's recommendation)
- Execution history persistence for training data
- API/SDK for external access
- Chronicle, Health Score, and retention features (Shonda's roadmap)

---

## III. File Structure (What Gets Built)

```
nerve/
├── daemon.sh              # Main daemon loop with PID lockfile
├── queue.sh               # Queue persistence and recovery
├── abort.sh               # Abort flag management
├── parse-verdict.sh       # Strict QA verdict parsing
└── README.md              # Documentation
```

**Constraints:**
- Four executable scripts + one README
- No external dependencies beyond bash
- All files fit in `/tmp/nerve-*` namespace
- Each script is independently runnable

### Implementation Specifications

| File | Key Functions | Exit Codes |
|------|---------------|------------|
| `daemon.sh` | `start`, `stop`, `status` | 0=success, 1=error, 2=already running |
| `queue.sh` | `push`, `pop`, `peek`, `depth`, `metrics` | 0=success, 1=error, 2=empty queue |
| `abort.sh` | `set`, `clear`, `status`, `force-kill` | 0=success, 1=error |
| `parse-verdict.sh` | `report`, `batch`, `metrics` | 0=success, 1=parse error, 2=file not found |

---

## IV. Open Questions (Require Resolution Before Build)

| # | Question | Blocking? | Recommended Resolution |
|---|----------|-----------|------------------------|
| OQ-001 | **Log format specification** — Steve wants "clinical surgeon," Elon wants greppable. Both agree on no emoji. | **YES** | `[TIMESTAMP] [COMPONENT] message` where TIMESTAMP is ISO8601 UTC, COMPONENT is DAEMON/QUEUE/ABORT/VERDICT |
| OQ-002 | **Process naming** — Should `ps aux \| grep nerve` work, or `ps aux \| grep promptops`? | **YES** | Use `nerve` consistently. PID file at `/tmp/nerve.pid`, not `/tmp/promptops.pid` |
| OQ-003 | **Metrics timing** — When do we add the three metrics? Before v2 features, or as first v2 feature? | No | Sequencing only. Metrics are first v2 item per Elon's recommendation. |
| OQ-004 | **Retrospective PRD location** — Where does the post-build PRD get filed? | No | `/home/agent/shipyard-ai/rounds/promptops/PRD.md` after v1 ships |

### Resolution for Blocking Questions

**OQ-001 RESOLVED:** Log format is `[TIMESTAMP] [COMPONENT] message`

Examples:
```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] pushed item a1b2c3d4 (type: qa-pass)
[2026-04-11T14:22:35Z] [ABORT] shutdown requested
```

**OQ-002 RESOLVED:** Process naming uses `nerve` prefix

- PID file: `/tmp/nerve.pid`
- Abort flag: `/tmp/nerve.abort`
- Queue directory: `/tmp/nerve-queue/`
- `ps aux | grep nerve` works

---

## V. Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Single-machine architecture breaks at scale** | Medium | High | Known limitation. Sharding path is clear: partition queue, run multiple workers. Not a v1 problem. | Elon |
| **No automated testing for infra that manages tests** | Low | Medium | "Testing infrastructure that manages tests creates infinite regress." Accept risk. Ship proves correctness. | Steve |
| **Documentation debt compounds** | High | Medium | PRD must exist before v2. README ships with v1. | Elon |
| **Observability gap masks failures** | Low | High | Three metrics added before any scale work. Acceptable blind spot for v1 single-machine. | Elon |
| **No competitive moat** | High | Medium | Board consensus: this is commodity infrastructure. Acceptable for internal tooling. External product requires differentiation (AI layer). | Board |
| **No revenue path** | High | High | NERVE is overhead, not product. Justified only if preventing demonstrable operational failures. Track before/after metrics. | Buffett |
| **PromptOps name has zero prompts** | Medium | Low | Renamed to NERVE. Credibility gap closed. | Jensen |
| **Process naming ambiguity** | Medium | Low | RESOLVED: Use `nerve` consistently. | Both |
| **Queue corruption on crash during write** | Low | High | Atomic file writes: write to temp file, then `mv` to final location. | Build |
| **Orphan processes on unclean shutdown** | Medium | Medium | Abort escalation: SIGTERM → 5 second wait → SIGKILL. | Build |

---

## VI. Board Conditions (From Board Verdict)

**Overall Board Score:** 4.7/10
**Verdict:** HOLD — with conditions for proceeding

### To Move from HOLD to PROCEED, Pick One Path:

**Path A: Make It a Product**
- [ ] Define external customer segment
- [ ] Build API/SDK for programmatic access
- [ ] Establish pricing model
- [ ] Ship one paying customer

**Path B: Add the AI** (Jensen's recommendation)
- [ ] LLM-powered verdict parsing
- [ ] Execution history persistence for training data
- [ ] At minimum one predictive capability
- [ ] Rename if AI doesn't ship (DONE: renamed to NERVE)

**Path C: Validate Internal ROI** (Buffett's recommendation)
- [ ] Document baseline metrics before NERVE
- [ ] Document post-NERVE metrics
- [ ] Prove that NERVE prevented X failures worth $Y

### Recommended Regardless of Path:
- [ ] Add human introduction to documentation explaining WHY (Oprah)
- [ ] Reduce process overhead for internal tooling (Buffett)
- [ ] Do not build another internal tool until one customer-facing product ships (Buffett)

---

## VII. Consensus Principles

Both Steve and Elon agreed on these foundational truths:

1. **Determinism over elegance.** When something must happen, it happens. No asking. No hoping.
2. **Invisible architecture.** The best infra is infra you forget exists.
3. **Resist scope creep.** Could have rewritten entire pipeline. Didn't.
4. **Clinical voice.** Professional tools speak like professionals.
5. **Leverage work.** This isn't a product—it's the foundation for products.

---

## VIII. The Essence

**What it is:** The invisible backbone that makes everything else possible.

**The feeling:** Peace. The absence of the 3 AM knot in your stomach.

**The one thing that must be perfect:** Determinism. When something must happen, it happens.

**Creative direction:** Disappear completely. Work always.

---

## IX. Build Phase Acceptance Criteria

For v1 to be considered COMPLETE:

- [ ] `daemon.sh` starts, creates PID lockfile, prevents duplicate instances
- [ ] `queue.sh` persists queue to disk, recovers state on restart
- [ ] `abort.sh` sets flag, daemon responds, shutdown is clean
- [ ] `parse-verdict.sh` returns JSON with verdict (PASS/FAIL/BLOCKED) and issue counts
- [ ] All scripts use consistent log format: `[TIMESTAMP] [COMPONENT] message`
- [ ] All scripts use `nerve` prefix for file paths
- [ ] README.md documents all commands with examples
- [ ] All files committed to deliverables directory
- [ ] QA Pass confirms zero P0 issues

---

*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
*"When the floor is solid, the dance is free."* — Phil Jackson

---

**Status:** READY FOR BUILD PHASE
