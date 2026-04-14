# Intake: Add p2 Support — Locked Decisions

*Consolidated by Phil Jackson, The Zen Master*

---

## Decision Log

### Decision 1: Product Name — "Intake"
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Rationale** | One word. Verb and noun. The system *inhales* issues from chaos and transforms them into actionable work. Elon conceded: "It's perfect. One word. Memorable. I was going to call it `github-priority-poller-service`. Steve saved us from ourselves." |

### Decision 2: Ship Today
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Both (unanimous) |
| **Winner** | Consensus |
| **Rationale** | Steve: "Every day this doesn't ship is a day we're telling developers their p2 work doesn't matter." Elon: "This is a 15-minute code change. If it's not deployed by EOD, we've failed." |

### Decision 3: Observability — Logging Over Silence
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Rationale** | Steve wanted "invisible infrastructure" but Elon countered: "Observability isn't vanity—it's survival." Compromise reached: logs yes, dashboards no. Every poll cycle logs timestamp, issues found, issues processed. `journalctl` is the debug interface, not a status page. |

### Decision 4: Labels as Config, Not Constants
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Rationale** | Steve wanted hardcoded `['p0', 'p1', 'p2']` as "discipline." Elon: "Hardcoding isn't discipline—it's technical debt disguised as philosophy. A config array costs nothing and prevents a code deploy when someone inevitably asks for p3." Priority labels come from config (env var or config file). |

### Decision 5: No User-Facing Configuration UI
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Steve Jobs |
| **Winner** | Consensus |
| **Rationale** | Both agreed: no settings panel for users. Steve: "The absence of choice *is* the feature." Elon clarified: "*Operators* configure via env vars. Users never see configuration." |

### Decision 6: No Dashboards
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (with Elon's caveat) |
| **Rationale** | Steve: "A dashboard says 'we expect this to fail'—and that expectation becomes self-fulfilling." Elon accepted but advocates for a minimal health endpoint (`{"status":"ok","last_poll":"..."}`) as future consideration, not v1 blocker. |

### Decision 7: Implementation — Minimal Diff, No Refactor
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Both (unanimous) |
| **Winner** | Consensus |
| **Rationale** | Steve: "The best code change is the smallest one that solves the problem completely." Elon: "Minimum viable delta. Ship the diff, not the refactor." PRD's directive honored: "One targeted change. Do not refactor or reorganize." |

### Decision 8: Deduplication via Set
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Rationale** | Defensive deduplication using Set. O(1) cost, prevents duplicate PRDs if GitHub returns overlapping issues across label queries. "Technically optional... but defensive. Keep it." |

### Decision 9: Batched API Query — Deferred to v2
| Attribute | Value |
|-----------|-------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (deferred) |
| **Rationale** | `label:p0 OR label:p1 OR label:p2` reduces 3 API calls to 1. Both agree it's elegant. Both agree it's not today's problem. Trigger: implement when rate limits become a concern. |

---

## MVP Feature Set (v1 Ships)

### Must Have
- [x] Poll for `p0`, `p1`, `p2` labeled issues (expand from p0/p1 only)
- [x] Configurable priority labels via env var or config file
- [x] Deduplication via Set before processing
- [x] Logging: timestamp, issues found, issues processed per poll cycle
- [x] Generate PRD for each qualifying issue

### Must NOT Have
- [ ] Dashboard or status page
- [ ] User-facing configuration UI
- [ ] p3, p4 or additional priority levels (defer until requested)
- [ ] Batched API query optimization (v2)
- [ ] Health check endpoint (v2)
- [ ] Zero-downtime deploy infrastructure (out of scope)

---

## File Structure (What Gets Built)

```
shipyard-intake/
├── src/
│   └── intake.ts          # MODIFY: Add p2 to label array (~line 187)
│                          #         Update log string to reflect p0-p2
│                          #         Labels pulled from config, not hardcoded
├── config/
│   └── intake.config.ts   # MODIFY or CREATE: priority labels config
│                          #         Default: ['p0', 'p1', 'p2']
│                          #         Override via INTAKE_PRIORITY_LABELS env var
└── (no new files)         # Minimal diff. No new modules.
```

**Deployment:**
```bash
tsc && systemctl restart shipyard-intake
```

---

## Open Questions (Needs Resolution)

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | Where exactly does the config live? (env var `INTAKE_PRIORITY_LABELS` vs `config/intake.config.ts` vs both?) | Build Agent | Yes |
| 2 | Should the log output include the label name per issue, or just counts? | Build Agent | No |
| 3 | What's the current polling interval? Is 60s acceptable for p2 issues? | Ops | No |
| 4 | Is there an existing config pattern in the codebase to follow? | Build Agent | Yes — must read before implementing |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Line number drift** — "around line 187" becomes stale | High | Low | Treat as handrail, not spec. Agent should grep for existing label array. |
| **Rate limit hit at scale** — 3 calls/poll × repos × frequency | Low (at current scale) | High | Defer batched query to v2. Monitor via logs. |
| **Duplicate PRDs** — Same issue returned by multiple label queries | Medium | Medium | Dedupe via Set before processing. Already in spec. |
| **Config not read on restart** — Labels stay hardcoded in running process | Medium | Medium | Verify config loads at daemon start, not compile time. |
| **Silent failure** — Daemon crashes with no alert | Medium | High | Ensure logging captures fatal errors. Rely on systemd for restart. Future: health endpoint. |
| **Scope creep** — "While we're in there, let's refactor..." | High | High | PRD explicitly forbids. Honor the constraint. Minimal diff only. |

---

## The Essence (Guiding Principles)

> **What is this product REALLY about?**
> Intake makes work matter by ensuring nothing falls through the cracks.

> **What's the feeling it should evoke?**
> Trust. The quiet relief of knowing the system sees you.

> **What's the one thing that must be perfect?**
> Invisibility. It works, so you never think about it.

> **Creative direction:**
> Disappear into the workflow.

---

## Final Verdict

**SHIP IT.**

Steve made it beautiful. Elon made it work. The Zen Master says: *stop debating, start deploying.*

One file. One diff. One restart. Done.
