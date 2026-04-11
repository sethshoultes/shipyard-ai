# NERVE — Locked Decisions

**Project:** promptops / NERVE
**Date Locked:** 2026-04-11
**Locked By:** Agency Execute Skill

---

## Resolved Open Questions

### OQ-001: Log Format — RESOLVED

**Decision:** `[TIMESTAMP] [COMPONENT] message`

**Rationale:**
- Clinical (Steve's requirement): No emoji, no color codes in daemon output, professional tone
- Greppable (Elon's requirement): Square brackets enable precise grep patterns:
  - `grep '\[DAEMON\]'` — all daemon messages
  - `grep '\[QUEUE\]'` — all queue operations
  - `grep '\[ABORT\]'` — all abort events
  - `grep '\[METRICS\]'` — all metrics output
  - `grep '\[VERDICT\]'` — all verdict parsing

**Format Details:**
- Timestamp: ISO 8601 UTC format `[2026-04-11T14:22:33Z]`
- Components: `DAEMON`, `QUEUE`, `ABORT`, `VERDICT`, `METRICS`
- Message: Plain text, no emoji, no ANSI color codes

**Examples:**
```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] initialized with 3 pending items
[2026-04-11T14:22:35Z] [QUEUE] processed item abc123 in 2.3s
[2026-04-11T14:22:36Z] [METRICS] depth=2 latency=2.3s errors=0
[2026-04-11T14:22:37Z] [ABORT] shutdown requested
[2026-04-11T14:22:38Z] [DAEMON] shutdown complete
```

---

### OQ-002: Process Naming — RESOLVED

**Decision:** `nerve`

**Rationale:**
- Brand-aligned: "NERVE" is the product name, `nerve` is the process
- One word: Memorable, typeable, grep-able
- Distinct: No collision with common system processes
- Searchable: `ps aux | grep nerve` returns only NERVE processes

**Implementation:**
- Script names: `daemon.sh`, `queue.sh`, `abort.sh`, `parse-verdict.sh` (in `nerve/` directory)
- Process visibility: Scripts run as `nerve/daemon.sh`
- PID file: `/tmp/nerve.pid`
- Abort flag: `/tmp/nerve.abort`
- Queue directory: `/tmp/nerve-queue/`
- Metrics file: `/tmp/nerve-metrics.json`

**Alternative Considered:**
- `promptops-daemon` — Rejected: Too long, harder to type, confuses project name with process name

---

## Consensus Confirmation

Both decisions satisfy:
1. Steve's requirement for clinical, professional appearance
2. Elon's requirement for greppable, debuggable output
3. Both agree: No emoji, no color in daemon logs

---

*Locked decisions cannot be changed without explicit stakeholder review.*
