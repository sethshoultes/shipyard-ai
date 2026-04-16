# IMPROVE Cycle Review — Warren Buffett
**Date:** 2026-04-16
**Cycle:** IMPROVE-2026-04-16T03-1
**Lens:** Revenue opportunities, investability

---

## Portfolio Overview

Reviewing five shipped products for revenue clarity and investment potential:

- **LocalGenius** — AI marketing platform for local businesses
- **Shipyard AI** — Autonomous site builder
- **Dash** — WordPress command palette
- **Pinned** — WordPress sticky notes
- **Great Minds Plugin** — Multi-agent orchestration daemon

---

## Revenue Model Assessment

### LocalGenius: Clear Unit Economics, Unproven Distribution

**Revenue Model:** SaaS subscription (pricing not visible on landing page)

**What I Like:**
- **LTV/CAC of 9.3x at base case** (from Board Review #48). Three scenarios all above the 3:1 minimum. This is not a guess—it's derived from real assumptions with real sensitivity analysis.
- **90% cost reduction from prompt caching** (Board Review #112). That's structural—not incremental—improvement to unit economics.
- **Weekly Digest creates retention loop.** Users return for insights, not just to manage.

**What Concerns Me:**
- **No users yet.** The deck is the output of the wrong kind of work right now. Every hour on slide 7 unit economics is an hour not spent getting three Austin restaurant owners into the product. At this stage, traction *is* the deck. (Board Review #58)
- **Pricing hidden on landing page.** Hard to evaluate CAC when conversion funnel has friction.
- **Single vertical (restaurants initially).** Narrow focus is good for product-market fit, but limits TAM storytelling.

**Investability:** B+ — Strong economics on paper, needs proof of customer acquisition.

---

### Shipyard AI: Novel Model, Pricing Transparency Problem

**Revenue Model:** Token-based project pricing (500K-2M tokens per deliverable)

**What I Like:**
- **Fixed scope eliminates margin erosion.** Traditional agencies die by scope creep. Token budgets kill that problem.
- **"No meetings required" = structural cost advantage.** Sales cost per project approaches zero compared to agency model.
- **100% ship rate claim.** If true, this is remarkable. Risk is on Shipyard, not client.

**What Concerns Me:**
- **Token pricing without dollar conversion.** I cannot evaluate revenue per project. Is 500K tokens $50 or $500? This is basic business communication failure.
- **No portfolio or case studies visible.** Claims of "100% ship rate" without evidence are marketing, not proof.
- **Unclear capacity constraints.** How many projects can run in parallel? What's the throughput limit? Revenue is a function of volume × price.

**Investability:** C — Interesting model but impossible to underwrite without revenue clarity.

**Immediate Fix:** Put dollar amounts on the pricing page. Today. This costs nothing and unlocks investor conversations.

---

### Dash: Free Plugin, Platform Economics Potential

**Revenue Model:** Free WordPress.org plugin (no direct revenue)

**What I Like:**
- **Platform play potential.** If third-party plugins (WooCommerce, Yoast, MemberPress) build Dash extensions, it becomes infrastructure. Infrastructure owners capture value.
- **Zero marginal cost distribution.** WordPress.org is free distribution at scale.
- **Developer API is extensible.** Four filter hooks are integration points.

**What Concerns Me:**
- **No revenue model.** Free plugins build distribution, not revenue. Unless there's a premium tier or enterprise offering planned, this is a marketing asset, not a business.
- **Critical bugs block distribution.** A plugin that crashes on 30% of hosts won't get WordPress.org directory approval. No approval = no distribution = no platform play.
- **Competitive landscape.** Core WordPress added command palette in 6.3. Differentiation is unclear.

**Investability:** D — No revenue model, blocked by bugs, unclear differentiation from core.

**Note:** Could become valuable as part of a WordPress productivity bundle (with Pinned), but needs to ship first.

---

### Pinned: Free Plugin, Enterprise Upsell Possible

**Revenue Model:** Free WordPress.org plugin (no direct revenue currently)

**What I Like:**
- **Clean, delightful UX.** (Per Oprah's review, this has the best first-5-minutes in the portfolio.)
- **Team collaboration features.** @mentions, acknowledgments, read-count badges—this is enterprise-adjacent functionality.
- **Multi-site ready.** Database operations support WordPress multisite. This is enterprise infrastructure.

**What Concerns Me:**
- **No revenue model.** Same problem as Dash—free distribution builds audience, not revenue.
- **No cross-site aggregation.** Enterprise buyers want org-wide visibility. Single-site sticky notes don't scale to enterprise purchasing decisions.

**Investability:** C- — Solid product, no monetization path visible.

**Revenue Opportunity:** "Pinned Pro" with:
- Multi-site dashboard aggregation
- Analytics (which notes get acknowledged fastest?)
- SSO integration
- Audit logging for compliance

This moves from "free tool" to "enterprise productivity suite." Price at $99/year per site.

---

### Great Minds Plugin: Infrastructure, Not Product

**Revenue Model:** Powers Shipyard AI (internal infrastructure)

**What I Like:**
- **20+ projects shipped, 250+ commits.** This is operational proof, not vaporware.
- **Token ledger tracks cost per agent.** Internal visibility into unit economics.
- **Daemon architecture is production-ready.** Telegram notifications, crash recovery, hung agent detection.

**What Concerns Me:**
- **This is infrastructure, not a revenue-generating product.** The value flows through Shipyard AI projects, not directly from the plugin.
- **Open-source means no direct monetization.** The code is public; the value capture is in Shipyard's services.

**Investability:** N/A — This is the factory, not the product. Evaluate through Shipyard revenue.

---

## Revenue Opportunity Matrix

| Product | Current Revenue | Opportunity | Effort | Impact |
|---------|----------------|-------------|--------|--------|
| LocalGenius | Planned subscription | Get first paying customer | Medium | High |
| Shipyard | Token-based services | Add dollar pricing, build portfolio | Low | High |
| Dash | None | Fix bugs, consider premium tier | High | Medium |
| Pinned | None | Launch "Pinned Pro" with enterprise features | Medium | Medium |
| Great Minds | None (infrastructure) | N/A — value flows through Shipyard | — | — |

---

## Investability Ranking

| Product | Score | Rationale |
|---------|-------|-----------|
| **LocalGenius** | B+ | Strong unit economics, needs customer proof |
| **Shipyard** | C | Novel model, pricing opacity blocks evaluation |
| **Pinned** | C- | Good product, no monetization |
| **Great Minds** | N/A | Infrastructure, not standalone business |
| **Dash** | D | No revenue, blocked by bugs |

---

## The Fundamental Problem

**This portfolio has four products with zero revenue and one product with planned revenue but no customers.**

Every product review I've done for Great Minds and LocalGenius over the past weeks has said some version of: "Stop polishing the deck and get paying customers."

The prompt caching shipped. The provisioning engine shipped. The campaign engine shipped. The insights layer shipped. **None of that matters if no one is paying.**

---

## Three Actions to Improve Investability

### 1. LocalGenius: First Dollar, First Month
Get one paying customer in the next 30 days. Not a pilot. Not a beta. A customer who enters a credit card and gets charged monthly. The entire business model validation hangs on this single proof point.

**Target:** 1 paying SMB customer by May 16, 2026.

### 2. Shipyard: Dollar Pricing on Landing Page
Convert token budgets to dollar amounts. This is 30 minutes of work that unlocks every investor conversation and every customer evaluation.

**Example:**
- Emdash Sites: $500-$2,000 (500K-2M tokens)
- Emdash Plugins: $500 (500K tokens)
- Revisions: $100 per round

**Target:** Update pricing page by end of week.

### 3. Pinned Pro: Launch Enterprise Tier
The free plugin is feature-complete. Package enterprise features (multi-site aggregation, analytics, SSO) as "Pinned Pro" at $99/site/year.

**Target:** Ship Pinned Pro within 60 days.

---

## What Makes a Business Investable

1. **Clear revenue model.** How do you make money? (LocalGenius: yes. Others: unclear or none.)
2. **Customer proof.** Who is paying? (None currently.)
3. **Unit economics.** LTV > 3× CAC? (LocalGenius: yes on paper. Others: unknown.)
4. **Distribution channel.** How do customers find you? (WordPress.org for plugins. Unknown for SaaS.)
5. **Moat.** What stops competition? (Data for LocalGenius. Platform for Dash. Neither proven yet.)

**This portfolio scores 1-2 out of 5 on investability.**

The products exist. The code is shipped. The infrastructure is solid. **The business hasn't started.**

---

## Verdict

I like the unit economics of LocalGenius. I like the cost structure of Shipyard. I see enterprise potential in Pinned. But I can't invest in products without customers or revenue models.

**Focus the next 90 days on three things:**
1. LocalGenius first paying customer
2. Shipyard pricing transparency
3. Pinned Pro enterprise tier

Everything else is optimization before validation.

---

*"Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1."*

— Warren Buffett, Board Member
