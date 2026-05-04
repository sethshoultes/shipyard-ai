# featureDream IMPROVE Cycle — Consolidated Summary
**Date:** 2026-05-04
**Moderator:** Phil Jackson
**Board:** Jensen Huang, Oprah Winfrey, Warren Buffett, Shonda Rhimes
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

This cycle revealed a structural crisis hiding inside our portfolio: two products we marked as "shipped" are broken, and our primary storefront is 404ing. These are not improvement opportunities. They are credibility emergencies that make every other board recommendation moot until resolved.

Once the foundation is repaired, the highest-impact improvement is LocalGenius activation and monetization. It is our only product with demonstrated unit economics, a working backend, and a new distribution channel (AgentPress). Everything else is either a feature (Beam), a cost center (Great Minds), or a broken deliverable (Pinned WP Suite / Shipyard DNS).

The board voted unanimously: fix the breaks, then monetize LocalGenius.

---

## What Changed Since May 2

| Finding | May 2 Status | May 4 Status | Impact |
|---------|-------------|--------------|--------|
| Shipyard homepage | Assumed live | 404ing (Issue #98) | Storefront offline |
| "Dash" product | Assumed Cmd+K | WP Intelligence Suite notes tracker | Identity crisis |
| Beam product | Not identified | Actual Cmd+K palette, works | Brand misalignment |
| Pinned plugin | Assumed sticky notes | Fatal error on activation | Broken |
| AgentPress PRD | Not shipped | Shipped May 3 | Distribution channel for LocalGenius |
| standalone-apps-portfolio-v3 | Not shipped | Shipped May 3 | `/work` page updated |
| LocalGenius widget | Assumed working | Not auto-rendering | Invisible to end users |

---

## Board Consensus by Product

### LocalGenius — ACTIVATE AND MONETIZE
- **Jensen:** Close the insight_actions feedback loop. Build the Knowledge Graph.
- **Oprah:** Auto-render the widget. No activation barrier. Make the demo the front door.
- **Buffett:** Launch $1 trial. Three tiers. AgentPress upsell. Only path to revenue.
- **Shonda:** Monday Morning Report. Weekly ritual. Push notification default on.

### Shipyard AI — FIX THEN BUILD
- **Jensen:** Extract PRD templates. Fix memory store learning layer.
- **Oprah:** Fix DNS today. Add three homepage lanes. PRD wizard.
- **Buffett:** Pick Lane A ($99/mo agency SaaS). Sunset broken plugins.
- **Shonda:** Monthly Site Health newsletter. Turn one-time builder into ongoing relationship.

### Beam (Cmd+K) — POLISH AND BUNDLE
- **Jensen:** Rename/brand as "Shipyard Beam." Add register_dash_command API.
- **Oprah:** Floating Cmd+K hint. Empty-state help. Gutenberg collision fix.
- **Buffett:** $29/year bundle gateway drug. Mine search data for template intelligence.
- **Shonda:** Recent commands in localStorage. Click counter celebration.

### Pinned (WP Intelligence Suite) — DELIST OR REPAIR
- **All four board members:** Fatal error on activation. Zero score across all dimensions. Delist immediately or ship missing `class-agreements-list-table.php`.

### Great Minds Plugin — EXTRACT AND CHARGE
- **Jensen:** Ship `@shipyard/daemon` to npm this quarter.
- **Oprah:** One install path. One demo command (`/great-minds-demo`).
- **Buffett:** Token dashboard. Enterprise license ($10K/year). Cloud hosting ($99/mo).
- **Shonda:** Weekly ship report (`~/great-minds-report.md`). Streak counter.

---

## Top 3 Improvements Ranked by Impact

### #1 — EMERGENCY: Fix Broken Production Assets (P0)
**Scope:** Issue #98 (shipyard.company DNS → 404) + Pinned fatal error + Dash WP Suite naming collision
**Impact:** Infinite. A 404ing storefront and a fatal-error plugin actively destroy trust for every future product.
**Effort:** 2-4 hours
**Owner:** Elon Musk (infra fix) + Margaret Hamilton (QA verification)
**Validation:** `curl -I https://shipyard.company` returns 200. Pinned activates without fatal error.

**What we learned:** Our "shipped" label is not trustworthy. We need post-deploy verification that checks: (a) plugin activates, (b) homepage loads, (c) no fatal errors in WP debug log. Margaret Hamilton should add this to the QA loop permanently.

---

### #2 — LocalGenius Activation & Revenue Sprint (P1)
**Scope:** Widget auto-render → Monday Morning Report → $1 trial → AgentPress upsell → insight_actions feedback loop
**Impact:** Only product with LTV/CAC of 9.3x. New AgentPress channel creates organic acquisition with near-zero CAC. Target: $10K MRR in 90 days.
**Effort:** 2-3 weeks
**Owner:** Steve Jobs (UX) + Warren Buffett (pricing) + Jensen Huang (data loop)
**Validation:** 100 paying customers in 90 days. Widget renders on 100% of active installs. Monday report open rate >40%.

**What we learned:** LocalGenius has been "almost ready" for too long. The backend is complete. The frontend is not auto-rendering. The pricing is not live. The insight table is write-only. These are not missing features — they are missing *wires* between existing features. We need a sprint, not a rebuild.

---

### #3 — Great Minds Platform Extraction (P2)
**Scope:** `@shipyard/daemon` npm package + weekly ship report + token dashboard + enterprise license page
**Impact:** Turns a cost center into a profit center. Opens market from 100K developers to 10M business operators. Builds the strongest moat in the portfolio.
**Effort:** 3-4 weeks
**Owner:** Elon Musk (daemon extraction) + Buffett (pricing tiers) + Shonda (retention hooks)
**Validation:** npm package downloaded >100 times in 30 days. First "Great Minds Cloud" subscriber. First enterprise license inquiry.

**What we learned:** Great Minds is the only product where users already feel emotional investment (the agents have personalities). We are giving away the most sticky product in the portfolio. The daemon is ready for extraction. The token ledger exists. We just need to package and price it.

---

## What the Pipeline Should Pick Up

| PRD Needed | Why | Size |
|------------|-----|------|
| ✅ LocalGenius Activation & Revenue Sprint | Multi-feature, multi-owner, 90-day metric | Medium |
| ✅ Great Minds Daemon Extraction | Architectural + pricing + packaging | Medium |

Both PRDs are written and placed in `/home/agent/shipyard-ai/prds/` for automatic pipeline intake.

---

## The Phil Jackson Decision

As moderator, I see the board converging on one truth: **we have been confusing shipping with finishing.**

A PRD marked "shipped" is not done if the storefront 404s. A plugin marked "shipped" is not done if it fatals on activation. A product marked "shipped" is not done if the user can't see the widget.

The pipeline's QA gate needs a new rule:
> **"Shipped means a stranger can discover it, install it, and receive value in the first 5 minutes without help."**

By that definition, our portfolio has 2 truly shipped products: Beam and Great Minds. Everything else is in various states of "almost."

The May 4 cycle is not about new features. It is about honest accounting. Fix the broken. Wire the almost-done. Monetize what works.

Then build what comes next.

---

## Metrics to Watch This Cycle

| Metric | Baseline | Target (90 days) |
|--------|----------|-----------------|
| shipyard.company uptime | 0% | 99.9% |
| Pinned activation success | 0% | 100% |
| LocalGenius paying customers | 0 | 100 |
| LocalGenius widget render rate | Unknown | 100% |
| Monday Morning Report open rate | N/A | >40% |
| `@shipyard/daemon` npm downloads | 0 | >100 |
| Portfolio revenue | $0 | >$10K MRR |

*Phil Jackson*
*Head Coach, Shipyard AI*
