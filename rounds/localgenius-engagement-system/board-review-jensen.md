# Board Review: LocalGenius Engagement System
**Reviewer:** Jensen Huang (NVIDIA CEO)
**Date:** 2026-04-18
**Project:** Pulse v1

---

## What's the Moat?

**Business Journal = Proprietary Labeled Training Data**

Only moat that compounds. Owner annotations create dataset competitors can't buy or scrape.

- Weekly prompts: "What drove these results?"
- Tags: holiday, menu item, weather, competitor action
- Correlates future performance, personalizes AI per restaurant

**Problems:**
- One file exists (cliffhanger.ts). Database schemas promised but not delivered.
- Spec says 231 tasks. Todo shows 0% complete.
- Journal storage.ts missing. Can't verify moat is real.

**Verdict:** Moat strategy correct. Implementation 5% done.

---

## Where's the AI Leverage?

**Missing the 10x opportunities:**

AI should generate:
- Cliffhanger copy (context-aware, personalized)
- Insight narratives (not just "up 22%", explain WHY)
- Badge thresholds (adaptive per restaurant segment)
- Journal prompts (rotate based on business performance)

**What's built:** Template strings with variables. Not AI. Static logic.

**What's missing:**
- No LLM calls in cliffhanger.ts
- No embeddings for journal data
- No predictive models for trends
- No recommendation engine

**Where AI would 10x:**
1. Generate insight explanations: "22% up because new lunch special posted Thursday drove 40 clicks"
2. Personalized journal prompts: "Your traffic spiked Tuesday. What changed?"
3. Competitive intelligence: "3 restaurants near you changed menus this week. Should you?"

**Verdict:** AI leverage = 0%. Pure CRUD app with notification queue.

---

## Unfair Advantage Not Built

**What compounds but isn't here:**

1. **Network effects:** Badge shares don't create virality loop. No referral mechanic.
2. **Cross-restaurant insights:** "Restaurants like you see 40% traffic from Instagram vs Google". Data goldmine unused.
3. **Temporal patterns:** Journal + performance data = predictive model for "best days to post". Not built.
4. **API-first architecture:** Can't white-label. Can't sell insights to Yelp/OpenTable.

**Competitive move we're missing:**
- Toast (POS) has transaction data. We have marketing data.
- Integration = total restaurant OS moat.
- Spec mentions none of this.

---

## Platform vs. Product

**To become platform:**

1. **API layer** → Other tools consume our insights (Yelp, Resy, Shopify for restaurants)
2. **Marketplace** → Third-party plugins (inventory mgmt, hiring, menu design)
3. **Data products** → Sell aggregated trends to food brands, real estate, investors
4. **White-label** → Franchise chains rebrand Pulse as their own tool

**Current state:** Standalone notification feature. No extensibility.

**One change that unlocks platform:**
- Expose `/api/insights/{business_id}` endpoint
- Yelp widget: "LocalGenius Score: 4.8/5 engagement trend"
- Reservation platforms pre-populate marketing copy from our AI
- Food suppliers see which menu items drive traffic

---

## Score: 4/10

**Justification:** Strong strategy document, zero execution. One TypeScript file in deliverables. Moat design correct but unproven. AI leverage claimed but not implemented. Platform thinking absent.

---

## What Would Make This a 9/10

**Fast (2 weeks):**
1. Ship journal storage + 100 real entries from beta users
2. Add LLM call to cliffhanger (GPT-4 generates, not templates)
3. Implement cross-restaurant benchmark: "You're top 15% in your category"

**Strategic (3 months):**
1. API documentation + Zapier integration
2. Predictive model: "Post on Thursdays 6pm, you'll get 40% more clicks"
3. Journal embeddings → semantic search → "Show me all weeks when weather impacted traffic"

**Platform (6 months):**
1. Public API with rate limits + pricing
2. Yelp/Google My Business widgets powered by our data
3. White-label offering for franchise chains
4. Insight marketplace: sell anonymized trends to food brands

---

## Critical Gaps

- **No database schema verification.** Can't trust spec if DB doesn't exist.
- **No AI in "AI-powered" product.** Template strings ≠ intelligence.
- **No network effects.** Badges shared to Instagram don't loop back.
- **No API documentation.** Can't extend or integrate.

---

## Recommendation

**Don't ship this as-is.**

Reframe as "Phase 1: Manual-Intelligence System" → proves engagement patterns work.

Then "Phase 2: AI Automation" → LLMs generate insights.

Then "Phase 3: Platform" → API + marketplace.

Current deliverables = 5% of Phase 1. Spec is roadmap, not artifact.

---

**Next Review Trigger:** Show working database + 50 journal entries from real users + one LLM-generated insight.
