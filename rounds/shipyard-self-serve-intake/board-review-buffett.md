# Board Review: Shipyard Self-Serve Intake
**Reviewer:** Warren Buffett
**Date:** 2026-04-16
**Score:** 3/10

*Infrastructure play masquerading as a business.*

---

## Unit Economics: F

**Cost to acquire one user:** Unknown. Zero CAC analysis.

**Cost to serve one user:** Indeterminate, but expensive:
- GitHub API calls (free tier until it isn't)
- Next.js hosting (Vercel pricing curve steep past free tier)
- PostgreSQL database (managed = $$)
- Anthropic/OpenAI API (content analysis) - cost per request uncapped
- No usage caps, no cost modeling, no budget guardrails

**Observation:** Can't calculate LTV:CAC when you don't measure either.

---

## Revenue Model: Hobby

**Current monetization:** $0.00

**Planned monetization:** Not specified in deliverables.

**What I see:**
- Webhook listener (free to run, zero revenue)
- Issue parser (commodity functionality)
- Logger (logs cost money to store, generate zero revenue)
- 17 passing tests (impressive; unprofitable)

**Question:** Who pays? When? How much?

**Answer:** Nobody. Never. Nothing.

This is a cost center dressed up as a product.

---

## Competitive Moat: Weekend Project

**Defensibility analysis:**

What stops replication:
- Nothing

Time to clone:
- Junior dev: 3 days
- Senior dev: Saturday afternoon
- GitHub Copilot: 47 minutes

**"Moat" inventory:**
- ✗ Network effects (single-tenant)
- ✗ Proprietary data
- ✗ Regulatory barriers
- ✗ Patents
- ✗ Brand equity
- ✗ Switching costs
- ✓ 2,000 lines of well-tested code (easily rewritten)

**Verdict:** Zero margin of safety against competition.

---

## Capital Efficiency: Poor

**What was built:** Internal tooling for intake workflow automation.

**Market size for this product:** Approximately zero.

TAM = companies running GitHub Enterprise + wanting self-serve intake + not using Linear/Jira/ClickUp + willing to host custom Next.js app

**That's not a market. That's a Venn diagram with three people in it.**

**R&D spend:** Unknown (no budget doc).

**Customer interviews:** Zero evidence.

**PMF validation:** Zero evidence.

**Distribution strategy:** "Build it and they will come" (they won't).

---

## What I'd Want to See

**Before investing another dollar:**

1. **Revenue model** - Who pays $X/month for this?
2. **Customer validation** - 10 paying pilot customers
3. **Unit economics** - Cost per intake request < $0.10
4. **Differentiation** - One thing this does 10x better than Linear
5. **Pricing tiers** - Free/Pro/Enterprise with clear ARR path
6. **CAC payback** - <12 months
7. **Gross margin** - >80% (SaaS standard)

**None of these exist.**

---

## What This Actually Is

A well-engineered internal tool:
- Solves a real problem (webhook → PRD automation)
- Clean code, good tests, proper logging
- Useful for *one team* at *one company*

**Not a business:**
- No revenue
- No moat
- No market
- No distribution
- No pricing power

---

## The Brutal Truth

"I could end the deficit in 5 minutes. You just pass a law that says that anytime there is a deficit of more than 3% of GDP all sitting members of Congress are ineligible for re-election."

Same principle applies here:

**Pass this rule:**

*"No new feature gets built until the last feature generates $1 of revenue."*

Would focus the mind wonderfully.

---

## What Would Make This a 7+

**Path to real business:**

1. **Pivot to horizontal SaaS**
   - Multi-tenant architecture
   - GitHub Marketplace app
   - $49/month per repo pricing
   - Target: 1,000 indie devs wanting intake automation

2. **Or: Vertical integration**
   - Agency service business using this tool
   - "We run intake for YC companies" - $2k/month
   - Tool becomes moat for service revenue

3. **Or: Kill it**
   - Open source the code
   - Get GitHub stars
   - Recruiting funnel for real business

**Right now? It's a cost with no return.**

---

## Recommendation

**Do not scale this.**

Well-built. Wrong problem. No business model.

Move team to revenue-generating work.

Allocate capital where moats exist.

---

**Final Score: 3/10**

*+1 for clean code*
*+1 for test coverage*
*+1 for security implementation*
*-7 for being a hobby project with enterprise infrastructure costs*
