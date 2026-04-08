# Round 1: Elon Musk — First-Principles Review

**PRD:** Shipyard Maintenance & Post-Delivery System
**Date:** 2026-04-08

---

## Architecture: What's the Simplest System That Could Work?

The PRD describes a 4-component system. It should be 2.

**Cut:**
- Separate "Client Dashboard" is unnecessary. Embed 3 metrics in a status page generated at build time. No API calls. Static HTML with Cloudflare's built-in analytics iframe.
- Dedicated database is overkill for <100 clients. Use a JSON file in the repo. Graduate to SQLite when you hit 500 clients. Postgres at 5,000.

**Keep:**
- Email automation (this IS the product)
- Stripe for payments (don't reinvent billing)

Simplest MVP: An email sequence + a Stripe checkout link. Ship in 3 days, not 8 weeks.

---

## Performance: Bottlenecks & 10x Path

**Bottleneck isn't technical—it's sales.**

The system depends on 30% "attach rate" for maintenance contracts. Zero clients have ever bought maintenance from Shipyard. This is a cold-start problem.

**10x path:**
1. First 10 contracts must be hand-sold by a human. No automation until PMF is proven.
2. Once 10 clients pay, THEN build the dashboard. Not before.
3. Token tracking is premature optimization. Just log time manually for 6 months.

You're optimizing the wrong thing. The bottleneck is convincing ANY client to pay $79/month. Build the invoice, not the token tracker.

---

## Distribution: How to Reach 10,000 Users Without Paid Ads

This PRD doesn't address distribution at all. Critical oversight.

**Reality check:** Shipyard's current client base is <50. Getting to 10,000 requires 200x growth.

**Actual distribution strategy:**
1. Every deployed site is a billboard. Add "Built by Shipyard" footer with link. Free impressions.
2. Public dashboards as marketing. "See how this site performs" generates leads.
3. Case studies with real metrics. Not "we built a site," but "97 Lighthouse score, 40% conversion lift."
4. Client referral discount: 1 month free for every referral that converts.

Email sequences to existing clients ≠ distribution. It's retention. Don't confuse them.

---

## What to CUT: Scope Creep & v2 Features

**Immediate cuts:**
- "Geographic distribution" metric — Who cares? Cut.
- "Triggered alerts" for performance drops — Complex, rarely useful. Cut.
- "White-labeling options" — Zero clients have asked for this. Cut.
- "Password protection for dashboards" — YAGNI. Cut.
- "Enterprise tier" — You have zero Pro customers. Don't build Enterprise.
- "Quarterly refresh proposal" — This is a human sales motion, not a feature.
- Overage handling at $0.15/1K — Hard caps instead. "Upgrade or wait."

**Phase 4 (Polish & Scale) should not exist.** Ship 3 phases, then wait for feedback.

---

## Technical Feasibility: Can One Agent Session Build This?

**Yes, but only if you cut 60% of the scope.**

One agent can build:
- Email templates (5 emails × 30 min = 2.5 hours)
- Stripe checkout integration (2 hours)
- Static dashboard template (3 hours)
- Cloudflare analytics embed (1 hour)

One agent CANNOT build in one session:
- Real-time token tracking with overage calculations
- Lighthouse CI pipeline integration
- Triggered email system with webhooks
- Multi-tier subscription management

**Recommendation:** Ship email + Stripe in Session 1. Dashboard in Session 2. Tokens in Session 5.

---

## Scaling: What Breaks at 100x Usage

At 100x (5,000 clients instead of 50):

| Component | Breaks At | Solution |
|-----------|-----------|----------|
| JSON file DB | 500 clients | SQLite |
| Manual token tracking | 50 contracts | Automate logging |
| Single dashboard template | 200 clients | Static site generator |
| Manual email sends | 100 clients | ESP automation |
| Lighthouse CI daily | 100 sites | Weekly batch, sample |

**The real scaling problem:** Token estimation. Zero historical data. You'll guess for 12+ months. Accept this. Price in margin.

---

## Final Verdict

**This PRD solves the right problem (no recurring revenue) with 3x too much system.**

**Ship this week:**
1. Maintenance offer email → Stripe checkout → Manual fulfillment
2. 5-email drip sequence (Resend, 4 hours setup)
3. Static dashboard per client (no APIs, just numbers)

**Ship in 90 days if traction:**
- Token tracking
- Automated usage reports

**Never ship (until 1,000 paying clients):**
- Enterprise tier
- White-labeling
- Geographic analytics

The goal is one signed contract, not a perfect system. Optimize for learning speed.

---

*— Elon*
