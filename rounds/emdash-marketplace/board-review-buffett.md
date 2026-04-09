# Board Review: Emdash Marketplace (Wardrobe)

**Reviewer:** Warren Buffett, Board Member
**Date:** April 8, 2026
**Project:** emdash-marketplace

---

## Executive Summary

This is a theme marketplace CLI for Emdash CMS. Five themes. One command to install. The team built exactly what the PRD requested — no more, no less. But I must evaluate this as a business, not as a piece of engineering.

Let me be direct: **This is currently a feature, not a business.**

---

## Unit Economics: What Does It Cost to Acquire and Serve One User?

**Acquisition Cost: Near Zero (for now)**

The user acquisition model relies entirely on organic discovery:
- Users find themes via the showcase website (static HTML, ~30KB)
- Installation via `npx wardrobe install [theme]` — no account required
- Theme tarballs are tiny (~5-6KB each)

**Serving Cost per User:**

| Component | Monthly Cost Estimate |
|-----------|----------------------|
| CDN (R2) for tarballs | ~$0.015/1000 downloads |
| Showcase website hosting (Cloudflare Pages) | $0 |
| Registry JSON (~1KB) | Negligible |

At 10,000 monthly installs, we're looking at maybe $0.15/month in serving costs. **Capital efficient? Yes. Revenue generating? No.**

**The Problem:** There's no mechanism to *know* who your users are. No accounts. No telemetry. No relationship. You're serving users for free and learning nothing about them.

---

## Revenue Model: Is This a Business or a Hobby?

**Current State: Hobby**

I see no pricing anywhere. The PRD doesn't mention it. The showcase doesn't mention it. Every theme is free. The CLI has no authentication. There's no premium tier.

**Potential Revenue Models (Not Implemented):**

1. **Premium Themes:** Charge $29-99 for professionally designed themes
2. **Theme Creator Revenue Share:** 70/30 split with third-party designers
3. **Marketplace Listing Fee:** Charge theme creators to list
4. **Emdash Pro Bundling:** Include premium themes with paid Emdash tier
5. **Enterprise Themes:** White-label themes for agencies

**My Assessment:** Without pricing, this is a loss leader. That's fine if Emdash itself has strong unit economics and themes drive conversion. But I don't see that flywheel documented here.

> "Price is what you pay, value is what you get." — The themes provide value, but we capture none of it.

---

## Competitive Moat: What Stops Someone From Copying This in a Weekend?

**Current Moat: Almost Nothing**

Let me count what we have:

| Asset | Defensibility |
|-------|---------------|
| 5 themes | Low — CSS can be copied |
| CLI tool | Very Low — 200 lines of TypeScript |
| Showcase website | None — static HTML |
| Brand ("Wardrobe") | Nascent — no awareness yet |
| Emdash integration | Medium — tied to proprietary CMS |

**What Would Create a Moat:**

1. **Network Effects:** Third-party theme creators earning money here, not elsewhere
2. **Data Moat:** Knowing which themes convert, which industries prefer what
3. **Switching Costs:** Theme-specific plugins that only work with Wardrobe
4. **Community:** Theme support, forums, reviews, ratings — reasons to stay
5. **Content Library:** 50+ themes vs. 5 makes this harder to replicate

**The Hard Truth:** Right now, a competent developer could rebuild this in a weekend. The themes themselves might take a week. There's no network effect, no data advantage, no lock-in.

---

## Capital Efficiency: Are We Spending Wisely?

**What Was Built:**

- CLI with list/install/preview commands ✓
- 5 complete Astro themes with CSS ✓
- Theme registry (JSON) ✓
- Showcase website (HTML/CSS/JS) ✓
- Build pipeline for tarballs ✓
- Distribution documentation ✓

**What This Cost (Estimated):**

Assuming this was 1-2 developer-days of AI-assisted work:
- Development time: ~$500-1,000 equivalent
- Infrastructure: $0 (not deployed yet)
- Total: Under $1,000

**Verdict: Extremely capital efficient for MVP scope.**

The team delivered the full PRD with minimal resources. Tarballs are tiny (5-6KB). No over-engineering. No unnecessary dependencies. Clean code.

But efficiency without revenue is just *efficient loss*.

---

## Missing Elements (Warren's Concerns)

1. **No pricing strategy** — You can't have a marketplace without commerce
2. **No user identity** — Anonymous users can't become paying customers
3. **No third-party themes** — Platform value comes from creators, not just our 5 themes
4. **No analytics** — Which themes do people install? We have no idea
5. **No preview with user content** — PRD mentioned it, not delivered
6. **No live demo sites** — PRD mentioned "deployed to Cloudflare Workers," not present

---

## Recommendations

1. **Add Pricing Before Launch:** Even if themes are free now, build the rails for paid themes
2. **Track Installs Anonymously:** Simple telemetry on which themes are installed
3. **Launch with 10+ Themes:** 5 feels sparse; recruit 2-3 external designers
4. **Define the Emdash Relationship:** Is this a feature or a standalone product?
5. **Build Creator Tools:** If you want a marketplace, you need sellers

---

## Score: 5/10

**Justification:** Technically complete MVP with zero revenue mechanism — a well-built feature masquerading as a business.

---

*"In the business world, the rearview mirror is always clearer than the windshield."*

The team executed cleanly on the spec. But the spec was incomplete. This needs a business model before it's investable.

— Warren Buffett
Board Member, Great Minds Agency
