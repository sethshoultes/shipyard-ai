# Daemon Fixes — Locked Decisions
## Consolidated by Phil Jackson, The Zen Master

---

## Decision Register

### Decision 1: Scope of Changes
| | |
|---|---|
| **Proposed by** | Both (aligned) |
| **Winner** | Consensus |
| **Resolution** | Two changes only. One function call (`gitAutoCommit()` wired into `runHeartbeat()`). One query fix (split `--label p0,p1` into separate calls, dedupe). No refactoring. No "while we're in there" improvements. |
| **Why** | Steve: "Every line you add is a line that can break." Elon: "Premature optimization is a worse sin than the current bugs." Both recognized scope discipline as non-negotiable. |

### Decision 2: Naming — "Pulse" vs "Daemon"
| | |
|---|---|
| **Proposed by** | Steve (Pulse) vs Elon (keep Daemon) |
| **Winner** | Elon |
| **Resolution** | Keep functional naming. No rebrand for internal tooling. "Pulse" goes to parking lot for future user-facing monitoring. |
| **Why** | Elon: "Zero users will see this name. Renaming requires updating docs, logs, systemd, scripts — all for vibes." Steve conceded internal tooling can use functional names; the rebrand adds no value until user-facing. |

### Decision 3: Shipping Velocity
| | |
|---|---|
| **Proposed by** | Elon (<15 min) vs Steve (test before ship) |
| **Winner** | Synthesis |
| **Resolution** | Ship in <30 minutes. But: actually run the daemon, watch commits push, confirm issues intake before declaring done. |
| **Why** | Elon was right that days of delay is unacceptable. Steve was right that "15 minutes and done" is how we got here. The synthesis: fast but verified. |

### Decision 4: Logging Philosophy
| | |
|---|---|
| **Proposed by** | Steve |
| **Winner** | Steve (Elon conceded) |
| **Resolution** | Silent success, loud failure. No notifications on success. Clear, direct messages when speaking: "Committed 3 files to great-minds-plugin" — not verbose technical logs. |
| **Why** | Elon explicitly conceded: "When we do speak, speak clearly. I'll take that." The absence of noise is the success state. |

### Decision 5: Process Fix — Monitoring
| | |
|---|---|
| **Proposed by** | Elon |
| **Winner** | Elon (Steve implicitly agreed) |
| **Resolution** | After shipping the code fix, add monitoring for: (1) commits not pushed in 24h, (2) issue intake returned 0 for 3 consecutive cycles. |
| **Why** | Both agreed the real failure was sitting on 14 unpushed commits for days unnoticed. The bug isn't just the code — it's that we didn't notice. |

### Decision 6: Design Philosophy
| | |
|---|---|
| **Proposed by** | Steve |
| **Winner** | Consensus |
| **Resolution** | "Invisible reliability" is the north star. The best experience is no experience. Users should wake up and find their work already committed, issues already converted to PRDs. |
| **Why** | Both agreed completely. Elon: "If users notice it, we've failed." Steve: "The moment of not noticing is the experience." |

---

## MVP Feature Set (What Ships in v1)

### Code Changes
1. **Wire up `gitAutoCommit()`**
   - Add `gitAutoCommit();` call at end of `runHeartbeat()` function
   - Location: `health.ts`

2. **Fix label query**
   - Replace single `--label p0,p1` call with two separate calls
   - Deduplicate results
   - Location: Intake logic in daemon

### Verification Criteria
- [ ] Run daemon manually
- [ ] Observe commits pushing to remote
- [ ] Confirm issue intake returns results for both p0 and p1 labels
- [ ] Check logs show clean, minimal output

### What Does NOT Ship
- No configuration options for auto-commit behavior
- No monitoring dashboard
- No abstractions around GitHub CLI calls
- No verbose logging
- No renaming/rebranding
- No "improvements" beyond the two fixes

---

## File Structure (What Gets Built)

```
health.ts
├── runHeartbeat()
│   └── ADD: gitAutoCommit() call at function end
│
└── [intake logic location]
    └── REPLACE: --label p0,p1 → two separate gh issue list calls + dedupe
```

No new files. No new modules. Two surgical edits to existing code.

---

## Open Questions (What Still Needs Resolution)

### 1. gh CLI Version Behavior
**Question:** Is `--label a,b` vs `--label a --label b` version-dependent?
**Impact:** If yes, we need to either pin gh CLI version or test on target environment.
**Owner:** TBD
**Resolution needed before:** Production deployment

### 2. Monitoring Implementation Details
**Question:** Where do the post-fix monitors live? Same daemon or separate?
**Impact:** Affects deployment and alerting architecture.
**Owner:** TBD
**Resolution needed before:** Next sprint (not blocking this fix)

### 3. Why Was `gitAutoCommit()` Never Wired Up?
**Question:** Process failure — what checklist or review should have caught this?
**Impact:** Affects future PR review process.
**Owner:** TBD
**Resolution needed before:** Retrospective (not blocking this fix)

### 4. Deduplication Strategy
**Question:** How exactly to dedupe issues from two separate label queries?
**Impact:** Could affect issue ordering or metadata.
**Owner:** Implementing engineer
**Resolution needed before:** Implementation

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Two gh calls hit API rate limits** | Low (at 2 repos) | Medium | Acceptable for v1. Monitor. Scale to GraphQL batching at 100+ repos. |
| **Deduplication loses issue data** | Low | Medium | Test with actual p0+p1 issues before shipping. |
| **Fix introduces regression** | Low | High | Run daemon manually, verify both functions work before deploying. |
| **gh CLI version mismatch** | Medium | Medium | Test on target environment. Pin version if needed. |
| **"While we're in there" scope creep** | Medium | High | This document exists to prevent it. Two changes only. |
| **Silent failure continues post-fix** | Medium | High | Add monitoring (Decision 5) immediately after shipping code fix. |

---

## Consensus Statement

Steve and Elon agree on more than they disagree:
- **Scope:** Two fixes, no more
- **Philosophy:** Invisible reliability
- **Urgency:** Ship today
- **Testing:** Verify before declaring done

The debate refined the execution plan. The path is clear.

---

## Next Action

**Fix the bug. Ship today. Then add monitoring. Then move on.**

*— Phil Jackson, The Zen Master*
