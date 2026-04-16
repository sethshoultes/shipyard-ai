# IMPROVE Cycle Summary
**Date:** 2026-04-16
**Cycle:** IMPROVE-2026-04-16T03-1
**Consolidated by:** Phil Jackson

---

## Board Consensus

Four board members reviewed five shipped products. Here's what emerged:

| Reviewer | Lens | Key Finding |
|----------|------|-------------|
| **Jensen Huang** | Moat gaps | LocalGenius is the only product with a working data moat. Dash's platform play is blocked by bugs. Shipyard has no operational learning. |
| **Oprah Winfrey** | First-5-minutes | Pinned has the best first impression. Dash's onboarding is broken. Shipyard confuses non-technical users with token jargon. |
| **Warren Buffett** | Revenue opportunities | Zero revenue across portfolio. LocalGenius needs its first paying customer. Shipyard needs dollar pricing visible. |
| **Shonda Rhimes** | Retention hooks | LocalGenius Weekly Digest is strong. Shipyard has zero retention—each project is an ending, not a beginning. |

---

## Top 3 Improvements Ranked by Impact

### #1. Fix Dash Critical Bugs (Blocking All Downstream Value)

**Impact:** HIGH | **Effort:** 2-3 weeks | **Urgency:** Immediate

**The Problem:**
- 3 P0 functional bugs (onboarding never shows, recent items broken, admin JS not enqueued)
- 4 CRITICAL security issues (SQL injection, private post leak, MyISAM incompatibility, search timeout DoS)
- 3 architectural issues (sync rebuild times out at 10K posts)

**Why This Is #1:**
- **Jensen:** "Platform play is blocked by engineering debt."
- **Oprah:** "A user who discovers Dash broken will assume it's abandonware. They'll deactivate within 60 seconds."
- **Buffett:** "No revenue, blocked by bugs, unclear differentiation from core."
- **Shonda:** "Retention grade: F — Currently broken."

**Every board member flagged Dash as blocked.** The plugin cannot be submitted to WordPress.org, cannot build distribution, cannot create platform value until these issues are resolved.

**Action:** Fix 10 critical issues before any new feature work.

---

### #2. Shipyard Post-Ship Lifecycle + Dollar Pricing

**Impact:** HIGH | **Effort:** 1-2 weeks | **Urgency:** This month

**The Problem:**
Shipyard is a one-shot service. Projects end at deployment. There's no reason to return, no relationship beyond the transaction, and pricing is opaque (tokens without dollar amounts).

**Why This Is #2:**
- **Shonda:** "Retention grade: D — No retention mechanics. Each project is an ending, not a beginning."
- **Buffett:** "Token pricing without dollar conversion. I cannot evaluate revenue per project."
- **Jensen:** "Shipyard builds sites but doesn't learn from them. No operational data, no compounding."
- **Oprah:** "Token pricing without dollar amounts is a deal-breaker for anyone with a budget."

**Two fixes, both essential:**

1. **Add dollar pricing to landing page.** Convert token budgets to USD ranges:
   - Emdash Sites: $500-$2,000
   - Emdash Plugins: $500
   - Revisions: $100/round

2. **Create post-ship lifecycle emails:**
   - Day 30: Performance report
   - Day 90: Security update recommendation
   - Day 365: Anniversary touchpoint with web standards update

**Action:** Update pricing page this week. Design lifecycle email sequence for PRD.

---

### #3. LocalGenius First Paying Customer + Progression Milestones

**Impact:** HIGH | **Effort:** Ongoing | **Urgency:** Next 30 days

**The Problem:**
LocalGenius has strong unit economics on paper (LTV/CAC 9.3x) and the best retention mechanics (Weekly Digest). But there are zero paying customers. The business model is unvalidated.

**Why This Is #3:**
- **Buffett:** "Every hour on slide 7 unit economics is an hour not spent getting three Austin restaurant owners into the product. At this stage, traction *is* the deck."
- **Shonda:** "Weekly Digest is strong but missing long-arc narrative. No streaks, milestones, or progression."
- **Jensen:** "LocalGenius is the only product with a working data moat." (This is praise—it's ready to monetize.)
- **Oprah:** "Strong start, but anxiety creeps in around pricing and trust. Put pricing on landing page."

**Two improvements:**

1. **Get first paying customer by May 16, 2026.** Focus acquisition efforts on Austin restaurants. The prompt caching shipped, the cost structure is viable, the product is ready.

2. **Add progression milestones to Weekly Digest:**
   - "Week 12 of your marketing journey"
   - "Best performing month so far"
   - "100th review response milestone"
   - Year-end "Marketing Rewind"

**Action:** Shift focus from feature development to customer acquisition. Add milestone tracking to Weekly Digest.

---

## Improvements That Rose to PRD Level

### PRD #1: Shipyard Post-Ship Lifecycle System

This improvement is significant enough to warrant a formal project. The gap between "project ends at deployment" and "ongoing customer relationship" is a fundamental business model change.

**Writing PRD to:** `/home/agent/shipyard-ai/prds/shipyard-post-ship-lifecycle.md`

---

## Full Improvement List by Product

### LocalGenius
| Improvement | Source | Priority |
|-------------|--------|----------|
| Get first paying customer | Buffett | P0 |
| Add pricing to landing page | Oprah, Buffett | P1 |
| Add diverse testimonials | Oprah | P2 |
| Add FAQ section | Oprah | P2 |
| Add progression milestones to Weekly Digest | Shonda | P2 |
| Add "Marketing Rewind" year-end feature | Shonda | P3 |

### Shipyard AI
| Improvement | Source | Priority |
|-------------|--------|----------|
| Add dollar pricing to landing page | Buffett, Oprah | P0 |
| Create post-ship lifecycle emails | Shonda | P1 (PRD written) |
| Add portfolio/case studies page | Oprah, Buffett | P1 |
| Add project telemetry for compounding | Jensen | P2 |
| Clarify what happens after PRD submission | Oprah | P2 |

### Dash
| Improvement | Source | Priority |
|-------------|--------|----------|
| Fix 3 P0 functional bugs | All | P0 BLOCKING |
| Fix 4 CRITICAL security issues | Jensen | P0 BLOCKING |
| Fix 3 architectural issues | Jensen | P0 BLOCKING |
| Add welcome tooltip (after fix) | Oprah | P1 |
| Add usage insights layer | Shonda | P3 |

### Pinned
| Improvement | Source | Priority |
|-------------|--------|----------|
| Add welcome note on first run | Oprah | P1 |
| Add weekly team digest | Shonda | P2 |
| Add multi-site aggregation | Jensen | P2 |
| Launch Pinned Pro enterprise tier | Buffett | P2 |
| Add unacknowledged note reminders | Shonda | P3 |

### Great Minds Plugin
| Improvement | Source | Priority |
|-------------|--------|----------|
| Add sample PRD for new users | Oprah | P2 |
| Surface token efficiency in deliverables | Jensen | P2 |
| Add milestone celebrations | Shonda | P3 |
| Distribute agent personas as products | Jensen | P3 |

---

## Next Actions

1. **Dash bug fixes** — Assign to Great Minds pipeline immediately
2. **Shipyard pricing update** — 30-minute landing page edit
3. **Shipyard lifecycle PRD** — Written below, pipeline ready
4. **LocalGenius customer acquisition** — Shift focus from features to sales
5. **Pinned welcome note** — Quick UX improvement

---

## Appendix: Board Review Files

- `/home/agent/shipyard-ai/dreams/improve-2026-04-16T03-1-jensen.md`
- `/home/agent/shipyard-ai/dreams/improve-2026-04-16T03-1-oprah.md`
- `/home/agent/shipyard-ai/dreams/improve-2026-04-16T03-1-buffett.md`
- `/home/agent/shipyard-ai/dreams/improve-2026-04-16T03-1-shonda.md`

---

*"The strength of the team is each individual member. The strength of each member is the team."*

— Phil Jackson, Orchestrator
