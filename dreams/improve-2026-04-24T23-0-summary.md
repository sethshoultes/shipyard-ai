# featureDream IMPROVE Cycle — Consolidated Summary
**Date:** 2026-04-24
**Facilitator:** Phil Jackson
**Board:** Jensen Huang · Oprah Winfrey · Warren Buffett · Shonda Rhimes
**Scope:** LocalGenius · Shipyard AI · Dash · Pinned · Great Minds

---

## Executive Summary

After reviewing all five shipped products across four board dimensions — moat, first-5-minutes clarity, revenue capture, and retention narrative — a single pattern dominates: **the engineering is complete, but the experience is not.**

We have built:
- Cloudflare Workers, D1 schemas, and Stripe webhooks for LocalGenius — with an empty frontend
- A 95%-ship-rate multi-agent pipeline for Shipyard — with zero recurring revenue infrastructure
- Three WordPress plugins (Dash, Pinned, LocalGenius Lite) — with zero monetization
- An extraordinary multi-agent framework (Great Minds) — locked behind a CS degree

The portfolio generates approximately $35K ARR with near-zero recurring revenue percentage. Every board member identified the same root cause: we optimize for what compiles, not what converts.

---

## Cross-Board Themes

| Theme | Jensen | Oprah | Buffett | Shonda |
|-------|--------|-------|---------|--------|
| **Moat / Differentiation** | Benchmark engine staged, not shipped | "Does a tired owner understand this at 9pm?" | "Price is what you pay, value is what you get" | "Data without drama is just a spreadsheet" |
| **First-5-Minutes** | Auto-detection, not manual entry | Auto-populate, don't ask users to create from void | Clarity drives conversion | Narrative arc begins immediately or never |
| **Revenue** | Data moat = uncopyable product | Dollar pricing removes friction | Annual billing is a balance sheet event | Retention lifts are revenue multipliers |
| **Retention** | Network effects need nodes | Clarity is kindness, kindness is retention | Recurring revenue changes your multiple | "Make people wonder what happens next" |

---

## Top 3 Improvements — Ranked by Impact

### #1 — ACTIVATE LOCALGENIUS REVENUE & RETENTION INFRASTRUCTURE
**Impact: CRITICAL | Effort: LOW | Status: Built, not deployed**

**What it is:**
Deploy the already-built annual billing toggle, activate the benchmark engine query, and complete the auto-onboarding flow so users see value in 3 minutes, not 3 days.

**Why it's #1:**
- **Revenue:** Annual billing pull-forward of $8K+ in 30 days, plus 40% churn reduction on converted customers
- **Moat:** The benchmark engine is the only truly uncopyable asset in the portfolio. Every week it sits in staging, competitors get closer.
- **Conversion:** Auto-detected FAQs + widget preview in minute 3 transforms "install and abandon" into "I saw the magic."

**Board Consensus:**
- Jensen: "The schema is the moat. The query is the product."
- Buffett: "9.3x LTV/CAC means nothing if you don't collect the LTV."
- Oprah: "Show the widget preview in minute 3, not day 3."
- Shonda: "Data without drama is just a spreadsheet. Ship the narrative."

**Specific Actions:**
1. Deploy annual billing toggle to `/pricing` (code exists in branch)
2. Create Stripe annual plans (`localgenius-annual-base`, `localgenius-annual-pro`)
3. Query `insight_actions` for MoM comparison and add to weekly digest
4. Activate benchmark query: "You're in the top X% for review response rate in [city]"
5. Pre-populate FAQs by business category (restaurant, dental, retail)
6. Auto-detect business metadata from schema.org and footer content

**Existing PRD:** `localgenius-revenue-retention-sprint.md` (completed, awaiting deployment)

---

### #2 — CONVERT SHIPYARD FROM TRANSACTIONAL TO RECURRING
**Impact: CRITICAL | Effort: MEDIUM | Status: PRDs written, not deployed**

**What it is:**
Launch the maintenance subscription ($199-$500/month), ship the client-facing project status page, and activate the post-ship lifecycle emails that convert one-time projects into ongoing relationships.

**Why it's #2:**
- **Business Model:** A 93-97% margin business without recurring revenue is a consulting firm (1x multiple), not a SaaS company (10x multiple).
- **Retention:** Every shipped site currently ends with "goodbye." A 30-day check-in + maintenance offer converts that ending into a Season 2 renewal.
- **Cash Flow:** Maintenance subscriptions provide predictable cash flow that funds the improvement delivery gap.

**Board Consensus:**
- Buffett: "You built a factory and forgot to sell what it makes."
- Shonda: "The client relationship is a story, not a transaction."
- Jensen: "One page prevents churn for every project shipped."
- Oprah: "Show a live demo. Lead with outcomes, not tokens."

**Specific Actions:**
1. Deploy "Shipyard Care" maintenance subscription: $199/month, 2 revision rounds, priority queue
2. Ship one-page client project status: project name, current stage, tokens used, next milestone
3. Send 30-day check-in email: "Your site has been live for 30 days. Here's what we've noticed. Want to talk about Phase 2?"
4. Switch website pricing to dollar amounts: "$149-$499 per project"
5. Add live demo / interactive walkthrough to homepage

**Existing PRDs:**
- `shipyard-maintenance-subscription.md`
- `shipyard-client-portal.md`
- `shipyard-post-ship-lifecycle.md`
- `shipyard-care.md`

---

### #3 — MONETIZE THE WORDPRESS PLUGIN PORTFOLIO
**Impact: HIGH | Effort: MEDIUM | Status: NEW PROJECT — requires PRD**

**What it is:**
Bundle Dash, Pinned, and LocalGenius Lite into the "WordPress Intelligence Suite" — a single $99/year plugin with unified onboarding, cross-plugin analytics, and clear upgrade paths. Add individual Pro tiers for Dash ($49/year) and Pinned ($5/user/month team tier).

**Why it's #3:**
- **Revenue Velocity:** Zero-R&D revenue. The plugins exist. The bundle is packaging.
- **Distribution:** A paid plugin with a marketing budget can afford WordPress.org promotion, ProductHunt launches, and content marketing. Free plugins cannot.
- **Data Flywheel:** Cross-plugin usage patterns inform LocalGenius feature priorities and Shipyard plugin roadmap.

**Board Consensus:**
- Buffett: "Three free plugins are three liabilities. One bundle is an asset."
- Jensen: "Dash search analytics should inform LocalGenius. That's the data flywheel."
- Oprah: "One install, one settings page, three superpowers. That's clarity."
- Shonda: "A bundle has a story: 'The complete WordPress intelligence stack.'"

**Specific Actions:**
1. Create "WordPress Intelligence Suite" master plugin that bundles Dash + Pinned + LocalGenius Lite
2. Single $99/year pricing with annual billing
3. Add Dash Pro tier ($49/year): custom commands, analytics dashboard, multi-site sync
4. Add Pinned Team tier ($5/user/month): cross-site sync, Slack integration, team analytics
5. Add agency license ($199/year): unlimited sites, white-label, template marketplace
6. Cross-promote in each plugin's settings: "Upgrade to the full Intelligence Suite"

**New PRD Required:** Yes — see `wp-intelligence-suite.md`

---

## Honorable Mentions

| Improvement | Board Champion | Why It Didn't Make Top 3 |
|-------------|--------------|--------------------------|
| Great Minds Hosted SaaS | Jensen + Buffett | Requires multi-tenancy, auth, billing — significant engineering before revenue. Defer until maintenance subscription proves recurring model. |
| LocalGenius Multi-Week Story Threads | Shonda | Already specified in `localgenius-engagement-system.md`. Should ship as part of #1 activation, not a separate project. |
| Dash First-Use Tooltip | Oprah | Too small for a standalone project. Ship as part of #3 bundle onboarding. |
| Shipyard Plugin API Migrations | Jensen | Important but not revenue-blocking. EventDash works; the other four are deferred maintenance. |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Annual billing deployment delayed | Medium | Critical | Strip to 72-hour MVP: radio button + Stripe plan + one email template |
| Maintenance subscription seen as "just another cost" | Medium | High | Lead with health report + priority queue value, not "subscription" framing |
| WordPress bundle confusion (too many features) | Medium | Medium | Single onboarding flow; features unlock progressively, not all at once |
| Improvement delivery gap persists | High | Critical | Separate "Improvement Track" from feature PRD pipeline; assign dedicated agent |

---

## Capital Allocation Recommendation

Based on Buffett's analysis:

| Allocation | Destination | Expected Return |
|------------|-------------|-----------------|
| 40% | LocalGenius activation (#1) | Immediate cash pull-forward + moat defense |
| 35% | Shipyard recurring revenue (#2) | Multiple expansion (1x → 10x valuation) |
| 20% | WordPress Intelligence Suite (#3) | New ARR stream from zero marginal R&D |
| 5% | Process improvement | Separate improvement track to prevent future gaps |

---

## Next Steps

1. **Phil Jackson** to queue #1 and #2 for immediate pipeline execution (PRDs exist)
2. **Pipeline** to pick up new PRD: `wp-intelligence-suite.md`
3. **Margaret Hamilton** to add "deployment verification" checkpoint — PRDs cannot mark complete until features are live, not just merged
4. **Marcus Aurelius** to run retrospective in 14 days: Did we ship experiences or just code?

---

*"The best time to plant a tree was 20 years ago. The second best time is now. The best time to deploy annual billing was last week. The second best time is this week."*

— Phil Jackson
