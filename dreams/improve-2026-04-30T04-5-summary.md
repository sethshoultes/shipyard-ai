# featureDream IMPROVE Cycle — Consolidated Summary
## Date: 2026-04-30
## Orchestrator: Phil Jackson
## Board: Jensen Huang, Oprah Winfrey, Warren Buffett, Shonda Rhimes

---

## Portfolio Health Scorecard

| Product | Jensen (Moat) | Oprah (First-5) | Buffett (Revenue) | Shonda (Retention) | AVG |
|---------|--------------|----------------|------------------|-------------------|-----|
| Shipyard AI | 2/10 | 3/10 | 2/10 | 2/10 | **2.3/10** |
| LocalGenius | 1/10 | 0/10 | 1/10 | 3/10 | **1.3/10** |
| Dash | 1/10 | 5/10 | 0/10 | 3/10 | **2.3/10** |
| Pinned | 1/10 | 5/10 | 0/10 | 2/10 | **2.0/10** |
| Great Minds | 6/10 | 4/10 | 3/10 | 6/10 | **4.8/10** |

**Portfolio average: 2.5/10.**

The pattern is unambiguous: Great Minds is the only product scoring above 4/10. It is infrastructure with genuine technical differentiation. Everything else is either incomplete (LocalGenius), undifferentiated (Dash, Pinned), or structurally unsound (Shipyard AI's revenue model).

---

## Cross-Board Themes

### Theme 1: We Ship Infrastructure, Not Product
Jensen called it: "Backend services, database schemas, and API endpoints are not moats. Customers do not buy Cloudflare Workers. They buy outcomes." LocalGenius has shipped Workers, KV caching, Stripe billing, and D1 tables. It has not shipped a frontend. Shipyard AI has shipped a marketing site and a pipeline spec. It has not shipped a verified auto-pipeline.

### Theme 2: The Promise Mismatch Is Systemic
Oprah identified it in every product: Shipyard sells "autonomous AI" but delivers human-managed quotes. Dash is named after a command palette but delivers a custom post type. LocalGenius promises "60-second onboarding" but has empty directories. Users feel the mismatch before they can articulate it.

### Theme 3: No Recurring Revenue = No Business
Buffett was direct: "Total portfolio MRR: $0." Shipyard has one-time project fees with 50% beta discounts. LocalGenius has annual billing with zero customers. Dash and Pinned are dead. Great Minds is R&D. A portfolio with no recurring revenue is a portfolio of hope, not investability.

### Theme 4: Retention Is an Afterthought
Shonda's assessment: "Tools are rented. Stories are remembered." The weekly digest is the only retention mechanism across the entire portfolio. No daily touchpoints. No milestones. No cliffhangers. No emotional peaks. We track events. We do not craft narratives.

### Theme 5: Designed Moats, Never Shipped
Both Jensen and Shonda flagged this: LocalGenius designed the Benchmark Engine, Business Journal, and Pulse notifications. None were built. Shipyard AI designed a proprietary training corpus from 60+ PRDs. It was never captured. The gap between design and delivery is the portfolio's fatal flaw.

---

## Top 3 Improvements — Ranked by Impact

### #1: Shipyard AI — Harden Auto-Pipeline + Launch Maintenance Subscription
**Impact: EXISTENTIAL**
**Owners: Elon Musk (Engineering), Buffett (Business Model)**
**Est. Effort: 3-4 weeks**

**The problem**: The auto-pipeline is Shipyard's core value proposition ("PRD in. Production out.") and it has never been tested end-to-end. Plugin deployment failures (EventDash: 95 banned patterns; broken npm aliases; permission denied errors) block customer sites. The pricing model is one-time project fees with 50% beta discounts — a consulting business, not a SaaS.

**The fix**: Two parallel tracks:
1. **Engineering**: End-to-end test the GitHub Actions auto-pipeline. Fix plugin deployment blockers. Add pre-deployment validation (lint, banned pattern scan, alias resolution).
2. **Business model**: Launch "Shipyard Care" — a maintenance subscription at $149-$499/month including hosting, updates, security monitoring, and monthly content tweaks.

**Why this is #1**: Shipyard AI is the flagship. Without a working pipeline, there is no product. Without recurring revenue, there is no business. This fix transforms both the technology and the economics.

**Success metrics**:
- Auto-pipeline completes end-to-end without human intervention on 5 consecutive test projects
- Plugin deployment success rate: >95%
- First maintenance subscription signed within 14 days of launch
- MRR target: $1,000 by Month 3

---

### #2: LocalGenius — Complete the Frontend + Ship the Benchmark Engine
**Impact: HIGH**
**Owners: Steve Jobs (Design), Jensen Huang (Moat)**
**Est. Effort: 4-6 weeks**

**The problem**: LocalGenius has a working backend (SPARK widget, Cloudflare Workers, Stripe billing, weekly digest) but no frontend. The WordPress plugin directories are empty. The onboarding flow exists only in spec. Worse: the Benchmark Engine — the designed moat feature that creates competitive rankings from cross-restaurant data — was never built.

**The fix**: Three tracks:
1. **Frontend**: Ship the WordPress plugin with the 60-second onboarding flow (auto-detect via schema.org/OpenGraph, pre-populate FAQs, single-screen admin, widget preview).
2. **Benchmark Engine**: Build the cross-business competitive ranking system ("You're #3 of 47 Italian restaurants in your zip code"). Requires anonymized aggregation of chat volume, response quality, and engagement.
3. **Live demo**: One-click demo where a user enters any restaurant URL and sees the SPARK widget preview with auto-detected FAQs. No signup required.

**Why this is #2**: The infrastructure is already built. The SPARK widget works. The digest works. This is not a ground-up build — it is finishing what was started. The Benchmark Engine is the only designed moat feature in the entire portfolio with genuine data-network-effect potential.

**Success metrics**:
- WordPress plugin submitted to WordPress.org
- Frontend onboarding completion rate: >60%
- Benchmark Engine live for 3 verticals (restaurants, dental, yoga)
- First 10 paying customers
- MRR target: $290 by Week 8

---

### #3: LocalGenius — Add Daily Pulse Notifications + Weekly Cliffhangers
**Impact: MEDIUM-HIGH (but CHEAPEST)**
**Owners: Shonda Rhimes (Retention), Maya Angelou (Copy)**
**Est. Effort: 1-2 weeks**

**The problem**: The weekly digest is LocalGenius's only retention mechanism. There is no reason to return on Tuesday, Wednesday, or Thursday. The email ends. The user forgets. Shonda: "Weekly digest ends. Add cliffhangers."

**The fix**: Two micro-features:
1. **Pulse notifications**: Daily micro-touchpoints via email or in-widget: "3 new questions waiting," "Your response time beat 89% of competitors yesterday," "A customer bookmarked your answer."
2. **Weekly cliffhangers**: One sentence at the end of every digest: "Next week, I am analyzing which responses drive the most walk-in traffic. Stay tuned."

**Why this is #3**: This is the highest ROI improvement in the portfolio. It builds on an existing, working feature (the digest). It requires no new infrastructure — just copy and notification logic. It addresses the retention gap that Shonda identified as the portfolio's most solvable problem.

**Success metrics**:
- Digest open rate: >40% (baseline: unknown)
- Pulse notification click-through rate: >15%
- Weekly cliffhanger recall: Measured via week-over-week open rate lift
- Churn reduction: Target 20% improvement

---

## What We Are NOT Doing (Explicit Deprioritization)

### Dash and Pinned: Archive Confirmed
The WP Intelligence Suite was killed per Cagan decision (commit `e26524c`). These plugins are competent but commodity. Reviving them would require 4-6 weeks each to reach standalone quality, and the WordPress plugin market for team notes/agreements is crowded. **Decision**: Keep repos archived. Do not allocate senior engineering time.

### Great Minds: Infrastructure, Not Product
Great Minds scored highest (4.8/10) but Buffett was clear: "This is R&D, not P&L." The framework should continue to be the engine that builds other products, not a standalone revenue center. **Decision**: No dedicated PRD. Continue incremental improvements (bug memory embeddings, daemon extraction) as part of Shipyard/LocalGenius build cycles.

---

## Portfolio Strategy Shift

**Old pattern**: Build backend → design frontend → abandon frontend → start new sprint.
**New pattern**: Ship end-to-end → validate with customers → compound with data.

The portfolio has two products that could matter (Shipyard AI, LocalGenius) and three that do not (Dash, Pinned, Great Minds as standalone). The strategy shift is simple: **concentrate firepower.**

- Elon and Margaret own Shipyard's pipeline hardening.
- Steve and Jony own LocalGenius's frontend completion.
- Jensen owns the Benchmark Engine architecture.
- Maya and Shonda own the retention narrative.
- Buffett owns the maintenance subscription pricing and unit economics tracking.

Everything else is a distraction.

---

## Next Steps

1. **Elon**: Schedule end-to-end auto-pipeline test within 48 hours. Report pass/fail per stage.
2. **Steve**: Review LocalGenius frontend spec from Activation Sprint. Estimate completion timeline.
3. **Buffett**: Draft "Shipyard Care" pricing and scope document. Present at next board review.
4. **Shonda**: Write 4 weekly cliffhanger templates for LocalGenius digest.
5. **Phil**: Create PRDs for Improvement #1 and Improvement #2. Queue in pipeline.

---

> **Bottom line from the board**: We are a team that designs moats and ships plumbing. That stops now. The next 60 days are about finishing what we started — the auto-pipeline, the frontend, the benchmark engine — and adding the one thing no competitor can copy: customers who love us enough to stay.
