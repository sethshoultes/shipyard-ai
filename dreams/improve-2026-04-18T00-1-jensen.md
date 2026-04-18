# IMPROVE Cycle Review — Jensen Huang
**Date**: 2026-04-18
**Cycle**: IMPROVE-001
**Focus**: Moat Gaps & Compounding Advantages

---

## Portfolio Overview

Five shipped products reviewed for defensibility, data compounding, and platform leverage.

---

## Product-by-Product Analysis

### 1. LocalGenius (localgenius.company)

**Current Moat Status: YELLOW**

*What's compounding:*
- Every restaurant interaction generates business-specific training data
- Review responses accumulate brand voice fingerprint
- Weekly digest metrics create switching cost (historical data lock-in)
- Multi-location rollout creates network effects within franchise groups

*Moat gaps:*
- **Data moat underspecified.** The promise of "AI that learns your business" has no visible feedback loop. Users can't see the AI getting smarter. If they can't see it, they won't believe it, and they won't stay.
- **No proprietary data source.** Google Business Profile data, social metrics, reviews — all available to competitors. What unique signal does LocalGenius capture that nobody else can?
- **Missing compounding trigger.** The weekly digest is consumption, not creation. Users should be prompted to add context: "Was this a good week? What drove the 340 visits?" That annotation becomes the moat.

*Recommended fix:*
Add a "Business Journal" feature where owners annotate weekly performance with real-world context (holiday rush, new menu item, competitor opened). This creates proprietary labeled training data no competitor can replicate.

---

### 2. Shipyard AI (shipyard.company)

**Current Moat Status: YELLOW**

*What's compounding:*
- Every PRD processed improves the debate/plan/execute pipeline
- Bug memory and do-not-repeat lists get smarter with each failure
- Token efficiency data compounds (knowing which tasks need 500K vs 2M tokens)
- File anatomy knowledge transfers across similar projects

*Moat gaps:*
- **The pipeline is the product, but the pipeline is open source.** Great Minds Plugin is MIT licensed. Anyone can fork it. The moat must be in proprietary execution data, not code.
- **No visible learning loop.** Clients don't see "This is the 47th React e-commerce build. We've learned these 12 patterns." That credibility signal is missing.
- **Token pricing is transparent but undifferentiated.** Competitors could undercut. What prevents a race to the bottom?

*Recommended fix:*
Create a "Build Intelligence Score" — a visible metric showing how many similar projects Shipyard has completed and what it learned. "This is the 23rd Next.js dashboard. Expected completion: 4 hours based on 22 prior builds." The data exhaust becomes the differentiation.

---

### 3. Dash (WordPress Command Bar)

**Current Moat Status: GREEN**

*What's compounding:*
- Index size grows with WordPress installation (more posts = more value)
- Recent items create personalized shortcuts (user behavior data)
- Developer API adoption creates ecosystem lock-in

*Moat gaps:*
- **No network effects.** Each installation is isolated. There's no learning across WordPress sites.
- **Feature complete = vulnerable to cloning.** 6KB, zero dependencies — easy to replicate.

*Recommended fix:*
Acceptable for a free plugin. If monetized in future, consider: anonymized aggregate data on most-searched terms across all Dash installations, enabling "suggested commands" that no single-site tool can provide.

---

### 4. Pinned Notes (WordPress Sticky Notes)

**Current Moat Status: GREEN**

*What's compounding:*
- Historical notes create organizational memory
- @mention patterns reveal team communication graphs
- Note aging data shows what matters (what gets renewed vs archived)

*Moat gaps:*
- **No cross-site intelligence.** Same isolation problem as Dash.
- **Limited expansion surface.** Feature-complete for scope; hard to add more value.

*Recommended fix:*
Acceptable for free plugin. If monetized: aggregate "what do teams pin most" data to suggest note templates by industry/role.

---

### 5. Great Minds Plugin

**Current Moat Status: GREEN (for now)**

*What's compounding:*
- Bug memory expands with every failure
- Do-not-repeat list is a proprietary anti-pattern database
- Agent persona prompts improve through iteration
- Token ledger creates optimization knowledge

*Moat gaps:*
- **Open source = no moat.** Anyone can use the learnings.
- **Dependent on Claude Code.** Platform risk is high.

*Recommended fix:*
The plugin's moat is in how it's *used*, not the code itself. Shipyard AI is the moat. The plugin is the sales funnel.

---

## Cross-Portfolio Moat Vulnerabilities

### 1. Platform Dependency
- LocalGenius depends on Google, Meta, review platforms
- Shipyard depends on Anthropic (Claude Code)
- WP plugins depend on WordPress ecosystem

**Mitigation:** Diversify. LocalGenius should capture direct customer data (email, SMS, loyalty). Shipyard should abstract to support multiple AI providers.

### 2. Data Exhaust Isn't Captured
Across all products, the learning happens but isn't surfaced to users. If users don't see the compounding, they don't value it.

**Mitigation:** Add "intelligence scores" or "learning indicators" that show the AI improving over time.

### 3. No Network Effects
Each product serves individual users/installations. No cross-customer learning.

**Mitigation:** Opt-in anonymized intelligence sharing: "Learn from 10,000 other restaurants" or "Built with patterns from 100 prior Shipyard projects."

---

## Top 3 Compounding Improvements (Ranked by Moat Impact)

| Rank | Product | Improvement | Moat Impact |
|------|---------|-------------|-------------|
| 1 | LocalGenius | **Business Journal** — Owner annotations on weekly performance | Creates proprietary labeled data no competitor can replicate |
| 2 | Shipyard AI | **Build Intelligence Score** — Visible learning from prior projects | Transforms execution data into sales differentiator |
| 3 | All Products | **Learning Indicators** — Surface AI improvement to users | Converts invisible moat to visible switching cost |

---

## Jensen's Verdict

**The code is solid. The data strategy is weak.**

You're building products that generate valuable data exhaust, but you're letting it evaporate. Every LocalGenius restaurant interaction, every Shipyard build, every Dash search — that's training data. But it's not captured, not surfaced, and not defensible.

The fix isn't engineering. It's product design. Add the annotation hooks. Show the learning. Make the moat visible.

**Priority action:** LocalGenius Business Journal. It's the highest-leverage improvement because restaurant owners are already engaged weekly (digest). Adding one question — "What happened this week?" — creates years of proprietary context.

---

*Review complete. Ready for board consolidation.*
