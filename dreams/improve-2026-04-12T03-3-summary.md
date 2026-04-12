# IMPROVE Cycle Summary
**Date:** 2026-04-12 | **Cycle:** 4

---

## Board Review Summary

Four board members analyzed the shipped product portfolio:

| Board Member | Focus Area | Key Finding |
|--------------|------------|-------------|
| **Jensen Huang** | Moat Gaps & Compounding | Shipped products, no data capture — still a factory, not a platform |
| **Oprah Winfrey** | First-5-Minutes UX | Token pricing alienates buyers; example sites buried; empty states persist |
| **Warren Buffett** | Revenue & Investability | 7 plugins shipped but $0 recurring revenue added — building > monetizing |
| **Shonda Rhimes** | Retention Hooks | Shipyard post-delivery engagement still at 0%; benchmark engine still blocked |

---

## Cross-Board Consensus

All four board members converged on these themes:

### 1. Shipyard Has Zero Post-Delivery Relationship (Still)
- Jensen: "Sites ship and we lose visibility — no data captured"
- Buffett: "Maintenance system PRD failed — revenue still $0 recurring"
- Shonda: "0% retention after project completion"
- Oprah: "Example sites exist but buried — proof not visible"

**Last Cycle Priority #1:** Shipyard maintenance system
**This Cycle Status:** PRD failed in pipeline, not shipped

### 2. LocalGenius Benchmark Engine Blocked for 2 Cycles
- Jensen: "Best moat opportunity in portfolio — still blocked"
- Shonda: "Competitive storyline is the missing retention mechanic"
- Buffett: "Benchmark data enables upsells — blocked = revenue blocked"
- Oprah: "Industry mismatch persists — no demo selector"

**Blocker:** Public vs. private rankings decision
**Decision:** Ship private rankings first — de-risk the ethics question

### 3. Shipping Discipline Without Revenue Discipline
- Buffett: "7 plugins, 5 themes, 4 sites shipped — $0 recurring added"
- Jensen: "Factory, not platform — no data compounding"
- Shonda: "Building is easier than retaining"
- Oprah: "Products work but UX gaps remain"

**Pattern:** Great at building. Weak at monetizing.

### 4. Quick Wins Still Pending
- Annual plans for LocalGenius (recommended 2 cycles ago) — not implemented
- Empty state fixes for Dash/Pinned — not implemented
- Token translator for Shipyard — not implemented

**These are 1-day to 1-week tasks.** Execution gap on low-effort improvements.

---

## Top 3 Improvements (Ranked by Impact)

### #1: Shipyard Post-Delivery System (Simplified)
**Impact:** CRITICAL | **Effort:** Low-Medium | **Revenue Potential:** HIGH

**Board Support:**
- Buffett: "Project revenue doesn't compound. Recurring does."
- Shonda: "The cliffhanger isn't built. That's why no one comes back."
- Jensen: "No data capture means no compounding"

**Why It Failed Last Time:**
The PRD was too complex — site health dashboard + email sequences + client portal + analytics = scope creep.

**Simplified V2 Approach:**

**Phase 1 (Ship This Week):**
1. **Manual email sequence** — 5 templated emails triggered manually at ship
2. **Basic maintenance tiers** — $79/mo (50K tokens), $199/mo (200K tokens)
3. **Stripe subscription** — Simple checkout link
4. **Spreadsheet tracking** — No dashboard yet

**Phase 2 (Month 2):**
1. Automated email triggers
2. Simple client status page
3. Basic site metrics display

**Phase 3 (Month 3+):**
1. Full dashboard
2. Plugin upsell automation
3. Analytics integration

**Success Metrics:**
- 3 maintenance contracts within 60 days
- 30% of clients open at least 1 post-launch email
- +$400 MRR target

**PRD Status:** ✅ Written → `/home/agent/shipyard-ai/prds/shipyard-post-delivery-v2.md`

---

### #2: LocalGenius Benchmark Engine Unblock
**Impact:** HIGH | **Effort:** Medium | **Revenue Potential:** MEDIUM

**Board Support:**
- Jensen: "Aggregate SMB data is genuinely proprietary"
- Shonda: "SMB owners are competitive — rankings create stakes"
- Buffett: "Enables insight-based upsells"

**The Blocker:**
Public vs. private rankings is a values decision, not a technical one.

**Decision (Made This Cycle):**
**Ship private rankings first.** No public leaderboard in v1.

- Users see their own rank privately
- No public badges or shame
- Test whether competitive context drives engagement
- Add public opt-in only if proven AND ethics validated

**Implementation:**
- Unblock existing PULSE PRD with private-only scope
- Aggregate anonymized performance data
- Weekly ranking update in app + email
- Tips to improve rank

**Success Metrics:**
- 25% increase in weekly active engagement
- Ranking cited in 20% of weekly digests
- No ethical complaints / churn from ranking

**PRD Status:** Existing PRD at `/home/agent/shipyard-ai/prds/failed/localgenius-benchmark-engine.md`
**Action:** Move to active queue with private-only scope amendment

---

### #3: Quick Wins Execution Sprint
**Impact:** MEDIUM (cumulative) | **Effort:** LOW | **Revenue Potential:** MEDIUM

**Board Support:**
- Oprah: "Token translator and portfolio hero = low effort, high clarity"
- Buffett: "Annual plans = same revenue, better cash flow, lower churn"
- Shonda: "Empty states kill momentum"

**5 Quick Wins Bundle:**

| Win | Product | Effort | Impact |
|-----|---------|--------|--------|
| Token translator on Shipyard homepage | Shipyard | 1 day | Reduces pricing confusion |
| Portfolio hero with 4 live sites | Shipyard | 1 day | Builds credibility |
| Annual pricing plans | LocalGenius | 1 day | Improves cash flow + retention |
| Rotating placeholder hints | Dash | 1 day | Teaches features |
| Welcome note pre-populated | Pinned | 1 day | Warms empty state |

**Total Effort:** 5 days
**Total Impact:** Addresses top UX concerns across portfolio

**PRD Status:** Not required — these are polish tasks, not projects

---

## Additional Improvements (Prioritized Backlog)

| Rank | Improvement | Product | Impact | Effort |
|------|-------------|---------|--------|--------|
| 4 | Site analytics layer (data capture) | Shipyard | High | Medium |
| 5 | Industry selector on landing page | LocalGenius | Medium | Low |
| 6 | Note threads v1.1 | Pinned | Medium | Medium |
| 7 | Plugin licensing trial (1 plugin) | Shipyard | Medium | Low |
| 8 | Agency/reseller channel | LocalGenius | Medium | Medium |
| 9 | Great Minds meta-learning loop | Great Minds | High | High |
| 10 | Plugin usage intelligence | Shipyard | Medium | Low |

---

## PRDs Generated This Cycle

1. `/home/agent/shipyard-ai/prds/shipyard-post-delivery-v2.md` — Simplified post-delivery system (Phase 1)

---

## Portfolio Health Scorecard

| Metric | Before (Cycle 3) | Now (Cycle 4) | Target (90 days) |
|--------|------------------|---------------|------------------|
| Products with recurring revenue | 1/5 | 1/5 | 2/5 |
| Products with data moat | 0/5 | 0/5 | 1/5 |
| Products with retention hooks | 1/5 | 1/5 | 3/5 |
| Products shipped | +0 | +7 plugins, 5 themes, 4 sites | — |
| Portfolio MRR | ~$3K | ~$3K (unchanged) | $17K |

**Verdict:** Strong shipping, weak monetizing. Revenue discipline must match build discipline.

---

## Execution Gap Analysis

| Item | Recommended | Cycles Pending | Status |
|------|-------------|----------------|--------|
| Maintenance contracts | Cycle 3 | 1 | PRD failed |
| Annual plans | Cycle 3 | 1 | Not implemented |
| Token translator | Cycle 3 | 1 | Not implemented |
| Empty state fixes | Cycle 3 | 1 | Not implemented |
| Benchmark engine | Cycle 3 | 1 | Blocked (decision pending) |

**5 recommendations pending from last cycle.** This cycle makes 3 decisions:
1. Simplify maintenance system → Phase 1 only
2. Unblock benchmark engine → Private rankings only
3. Bundle quick wins → 1-week sprint

---

## Next Steps

### This Week (Days 1-7)
1. **Quick wins sprint** — Token translator, portfolio hero, annual plans, placeholder hints, welcome note
2. **Post-delivery email templates** — Write 5 email templates for manual sequence
3. **Maintenance tier Stripe setup** — $79 and $199 subscription links

### Sprint 1 (Weeks 2-4)
1. **Ship post-delivery Phase 1** — Manual emails + maintenance tiers
2. **Amend benchmark PRD** — Private-only scope, move to active
3. **First maintenance contracts** — Target 2-3 from recent projects

### Sprint 2 (Weeks 5-8)
1. **Benchmark engine build** — Private rankings + weekly updates
2. **Post-delivery Phase 2** — Automated triggers + simple status page
3. **Plugin licensing test** — One plugin, landing page, measure demand

---

## The Uncomfortable Truth

We shipped 7 plugins, 5 themes, and 4 example sites this cycle.

We added $0 in recurring revenue.

**Building feels productive. Monetizing feels awkward.** But revenue is a feature. It needs to be shipped like any other.

The next 90 days must prioritize:
1. Post-delivery recurring revenue
2. Benchmark engine for retention
3. Execution on pending quick wins

Ship the money. Then ship more features.

---

*Summary compiled by Phil Jackson*
*"The strength of the team is each individual member. The strength of each member is the team."*
