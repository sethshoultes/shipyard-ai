# Board Review: Emdash Themes

**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-08
**Lens:** Durable Value

---

## Executive Summary

The PRD promised 5 visually distinct themes (Ember, Drift, Forge, Bloom, Slate) plus redesigns of 4 existing client sites. The deliverable contains 2 themes in a directory called "palette"—neither of which matches the named themes in the PRD. We built approximately 40% of what was specified, and what we built has no clear path to revenue.

This is a case of excellent craftsmanship applied to an incomplete scope with no commercial strategy.

---

## Unit Economics

**What does it cost to acquire and serve one user?**

Let me be precise about what we're discussing: HTML/CSS templates with no backend.

| Cost Component | Per Theme | Notes |
|----------------|-----------|-------|
| **Development cost** | ~$600-1,200 | ~4-8 hours @ $150/hr (estimated) |
| **Hosting cost** | ~$0-2/mo | Static files, negligible bandwidth |
| **Distribution cost** | Variable | WordPress.org = free; ThemeForest = 30% cut; Direct = marketing spend |
| **Support cost** | ~$15-50/sale | Theme support is notoriously labor-intensive |
| **Acquisition cost** | Unknown | No go-to-market strategy defined |

**The Math Problem:**
- We've invested ~$1,200-2,400 in development for 2 themes
- Revenue model: undefined
- Customer acquisition cost: undefined
- LTV: undefined

You cannot calculate unit economics when the units are free and the economics don't exist.

**Serving Cost (if sold):** Near zero. These are static HTML/CSS files. A $5/month hosting plan could serve millions of pageviews. The marginal cost of serving customer #10,000 is effectively the same as customer #1.

---

## Revenue Model

**Is this a business or a hobby?**

**This is neither a business nor a hobby—it's a portfolio piece.**

The PRD states these themes will be "showcased as portfolio pieces and offered to clients." Let me translate that into commercial reality:

**Option A: Showcase Only (Portfolio)**
- Revenue: $0
- Value: Marketing collateral for Shipyard's web development services
- ROI: Indirect, unmeasurable

**Option B: Theme Marketplace (ThemeForest, Creative Market)**
| Price Point | Market Volume | Realistic Sales | Gross Revenue | Platform Cut | Net Revenue |
|-------------|---------------|-----------------|---------------|--------------|-------------|
| $29 | High competition | ~50-200/year per theme | $1,450-5,800 | ~30% | ~$1,000-4,000 |
| $49 | Medium competition | ~20-100/year per theme | $980-4,900 | ~30% | ~$686-3,430 |

At 2 themes × $2,000 average net = **$4,000/year maximum** (optimistic).

**Option C: Premium Theme Business (Self-hosted)**
- Requires: Marketing, SEO, trust-building, support infrastructure
- Timeline to profitability: 12-24 months
- Success rate: <5% of theme businesses reach $100K ARR

**Option D: Custom Client Upsell**
- Scenario: Client chooses "Ember" instead of default template
- Upsell price: $500-2,000 per project
- Volume: Depends on Shipyard project pipeline

The PRD doesn't specify which option we're pursuing. Without a revenue model, this is overhead, not product.

**Comparison to What Works:**

| Business | Model | Annual Revenue |
|----------|-------|----------------|
| Elegant Themes (Divi) | Subscription ($89-249/yr) | ~$20M+ ARR |
| ThemeForest Top Sellers | One-time + support ($59 avg) | $1-5M/year for top 1% |
| Tailwind UI | Component library ($299 one-time) | ~$2M+ in first year |
| Emdash Themes | ??? | $0 |

The successful theme businesses either (a) build a massive catalog with network effects, (b) create a subscription model with continuous value, or (c) integrate with a larger ecosystem (WordPress, Webflow, Shopify).

Emdash Themes does none of these.

---

## Competitive Moat

**What stops someone from copying this in a weekend?**

**Absolutely nothing.**

Let me count the ways this is defensible:

1. **Proprietary technology:** None. HTML, CSS, and CSS custom properties are public domain.

2. **Unique data:** None. The design decisions are visible in the source code.

3. **Network effects:** None. Themes don't get better as more people use them.

4. **Brand recognition:** None. "Palette One" and "Palette Two" are placeholder names with no trademark value.

5. **Distribution lock-in:** None. These aren't integrated with any platform that creates switching costs.

6. **Scale advantages:** None. A solo developer with Figma and ChatGPT can produce equivalent themes in 2-4 hours per theme.

**The Brutal Reality:**

- Time to replicate Palette One: ~4 hours for a competent developer
- Time to replicate Palette Two: ~4 hours for a competent developer
- Cost of AI-assisted replication: <$10 in API calls + 1-2 hours of human refinement

The themes are well-built. The CSS architecture is clean (CSS custom properties, proper responsive breakpoints, accessibility considerations). The HTML is semantic. But craftsmanship is not a moat when the craftsmanship is trivially reproducible.

**What Could Create a Moat (But Doesn't Exist):**

1. **Emdash integration depth:** If these themes had deep hooks into Emdash's editor, content blocks, and publishing system, switching costs would emerge.

2. **Component library:** A Tailwind-style utility system that spans multiple themes, creating muscle memory and learning investment.

3. **Template marketplace with reviews/ratings:** Network effects from user-generated social proof.

4. **Subscription model with updates:** Continuous value delivery that justifies ongoing payment.

5. **White-label licensing:** Agency partners who resell create distribution moat.

None of these exist in the deliverable.

---

## Capital Efficiency

**Are we spending wisely?**

**What the PRD Specified:**
- 5 named themes (Ember, Drift, Forge, Bloom, Slate)
- Full template sets per theme (homepage, about, services, contact, blog)
- 4 existing site redesigns using new themes
- Screenshots for portfolio
- Responsive + accessible + dark mode toggles

**What Was Delivered:**
- 2 generic themes ("Palette One", "Palette Two")
- 1 page per theme (homepage only)
- 0 site redesigns
- 0 screenshots
- Responsive: Yes
- Accessible: Yes
- Dark mode: Palette Two only (by design), none for Palette One

**Completion Rate:** ~20-30% of scope

**Estimated Spend:**
| Item | Hours | Cost @ $150/hr |
|------|-------|----------------|
| Palette One (HTML + CSS + vars) | 4-6 | $600-900 |
| Palette Two (HTML + CSS + vars) | 4-6 | $600-900 |
| **Total** | 8-12 | **$1,200-1,800** |

**Expected Revenue:** $0 (no monetization strategy)

**What Should Have Been Built:**
If the goal is portfolio demonstration, one fully-complete theme (all 5 pages, responsive, dark mode, screenshots) is worth more than two incomplete themes.

If the goal is a theme marketplace business, we need:
- 5+ themes minimum for catalog breadth
- Purchase flow integration
- Documentation
- Support infrastructure

If the goal is client upsell, we need:
- Emdash integration
- Client-facing selector/preview system
- Pricing structure

We built none of these. We built fragments.

**The Capital Efficiency Question:**

Building 40% of a product generates 0% of the value. This is the classic "half-dug hole" problem. You can't half-cross a chasm.

---

## What I'd Need to See for Investment Consideration

1. **Choose a business model.** Portfolio piece, marketplace product, or client upsell? Each requires different execution.

2. **Complete what was started.** 5 themes as specified, or acknowledge the scope change and justify why 2 unnamed themes serve the business better.

3. **Show me the math.** If this is a product: X themes × Y sales × $Z price = revenue. If this is marketing: X portfolio pieces → Y leads → Z conversions × $W project value = pipeline.

4. **Define the moat strategy.** Either integrate deeply with Emdash (creating switching costs) or build a larger catalog (creating scale effects). Standalone themes with generic names have no defensibility.

5. **Demonstrate customer validation.** Has any actual customer seen these themes? Would they pay? How much? For what?

---

## Score: 3/10

**Justification:** Well-crafted CSS with solid accessibility practices, but only 40% of specified scope delivered, no revenue model, no competitive moat, and no clear strategic purpose—we've built a beautiful car with no engine and no road.

---

## Closing Thought

*"Should you find yourself in a chronically leaking boat, energy devoted to changing vessels is likely to be more productive than energy devoted to patching leaks."*

The themes are technically competent. The developers did good work. But the project suffers from three fatal flaws:

1. **Incomplete scope:** We promised 5 themes and 4 redesigns. We delivered 2 themes and 0 redesigns.

2. **No commercial strategy:** "Portfolio pieces" is not a business model. Neither is "offered to clients" without pricing, packaging, or distribution.

3. **Zero moat:** Any competitor—human or AI—can replicate this work in a day.

If Shipyard wants to be in the theme business, commit to it: build 20+ themes, integrate with Emdash, create a subscription model, and compete seriously. If Shipyard doesn't want to be in the theme business, acknowledge that this was an R&D exploration and move on.

What we cannot do is continue investing in fragments. Fragments generate no returns.

The code is fine. The strategy is absent.

---

**Warren Buffett**
Board Member, Great Minds Agency
