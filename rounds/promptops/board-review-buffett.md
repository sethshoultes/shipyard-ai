# Board Review: PromptOps (Drift)
**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-11

---

## Executive Summary

I've spent sixty years looking for businesses with durable competitive advantages. What I see here is a technically competent MVP that solves a real problem, but lacks the economic moat that would make me write a check.

---

## Unit Economics: What Does It Cost to Acquire and Serve One User?

**Infrastructure Cost Per User: Near Zero**
- Cloudflare Workers: $0.50 per million requests
- D1 Database: $0.75 per million reads, $1.00 per million writes
- At 1,000 prompts × 10 versions × 100 users = 1M records, cost is pennies

**The Real Cost: Acquisition**
- No billing system means no revenue attribution
- Distribution strategy relies entirely on viral channels (HN, Twitter, ProductHunt)
- CAC is effectively $0 today, but that's because there's no marketing spend
- First 100 users will be free. Getting the next 10,000 paid users? That's the hard part.

**Serving Cost Analysis:**
- Each API request: ~0.001 cents (Workers edge computing)
- Storage: Text prompts are tiny (< 10KB average)
- Bandwidth: Negligible
- This is capital-efficient infrastructure. Cloudflare is subsidizing your R&D.

**Verdict:** The cost to *serve* is excellent. The cost to *acquire* paying customers is undefined because there's no payment mechanism and no sales motion.

---

## Revenue Model: Is This a Business or a Hobby?

**Current State: Hobby**

The PRD proposes:
- **Free:** 3 prompts, 1K requests/month
- **Pro ($29/mo):** Unlimited prompts, 100K requests, A/B testing
- **Team ($99/mo):** Multiple users, audit log, SSO

**What's Actually Built:**
- No billing integration
- No usage limits or metering
- No A/B testing (listed as "nice to have")
- No team features
- No SSO

**The Hard Truth:**
This is a freemium product with no "mium." Every user is free, indefinitely. The pricing tiers are hypothetical. As I've said many times: *"Only when the tide goes out do you discover who's been swimming naked."* Right now, you can't distinguish between product-market fit and "free is popular."

**Path to Revenue:**
1. Must implement Stripe integration (not in scope)
2. Must add usage metering (not in scope)
3. Must build A/B testing to justify Pro tier (not in scope)

**Verdict:** This is a hobby project with business aspirations. The revenue model exists on paper but not in code.

---

## Competitive Moat: What Stops Someone From Copying This in a Weekend?

**Honest Answer: Nothing**

Let me walk through the competitive landscape from the PRD:

| Competitor | What They Have | What PromptOps/Drift Has |
|------------|---------------|--------------------------|
| LangSmith | Deep Langchain integration, enterprise customers, $10M+ funding | A CLI and an API |
| Helicone | Proxy logging, established user base | No proxy (it's in scope but not built) |
| Weights & Biases | Brand recognition, ML community trust | A fresh npm package |
| Git | Already on every developer's machine | Another tool to install |

**What's Actually Defensible:**
- **Brand?** No. "Drift" is a common name. No trademark value.
- **Network effects?** No. Each project is siloed. No sharing, no community.
- **Data advantage?** No. Prompts are stored per-user. No aggregate intelligence.
- **Switching costs?** Minimal. Export is trivial (it's just text).
- **Patents?** No. This is basic CRUD with version numbers.

**The Proxy Gap:**
The PRD's most compelling feature—the proxy that sits between your app and the LLM—is not built. Without it, this is just "prompts in a database with a CLI." That's a weekend project for any competent developer.

**Verdict:** Zero moat. A funded competitor could replicate this in days, not months. The only defense is speed to market and user acquisition, but there's no mechanism to lock users in.

---

## Capital Efficiency: Are We Spending Wisely?

**What Was Promised (MVP Scope):**
- [x] CLI with init, push, list, rollback commands
- [ ] Cloudflare Worker proxy that injects prompts *(NOT BUILT)*
- [x] D1 database storing prompts, versions, metadata
- [x] Simple API key auth
- [ ] Basic web dashboard *(NOT BUILT)*

**What Was Delivered:**
- Clean API (Cloudflare Workers)
- Functional CLI (Node.js/TypeScript)
- Proper auth (API keys, SHA-256 hashing, constant-time comparison)
- Database schema with proper indexes
- Environment variable support for CI/CD

**Capital Efficiency Score: 60%**

The engineering is solid. The code is clean—proper TypeScript, good error handling, security-conscious authentication. But 40% of the promised MVP is missing:
1. **No proxy** — The core value proposition ("inject prompts without code changes")
2. **No dashboard** — Requires CLI for everything, limiting adoption

This is concerning. Either the scope was underestimated, or the build was interrupted. Either way, the product cannot deliver on its primary promise: *"Proxy sits between your app and the LLM."*

**The Good:**
- Infrastructure costs are minimal (Cloudflare's free tier covers early growth)
- TypeScript throughout (maintainable)
- Proper security practices (no corners cut)

**The Bad:**
- No tests in the deliverables
- No README/documentation (though mentioned in build checklist)
- The proxy—the entire differentiation—is vapor

---

## Risk Assessment

| Risk | Severity | Notes |
|------|----------|-------|
| No revenue mechanism | Critical | Cannot sustain development |
| Missing proxy feature | High | Core value prop undelivered |
| No competitive moat | High | Easily replicated |
| Single-developer dependency | Medium | No team, no bus factor |
| Security (prompt exposure) | Medium | Prompts are sensitive IP |

---

## Score: 4/10

**Justification:** Solid engineering on an incomplete product with no moat, no revenue, and missing its core differentiating feature—the proxy that makes it useful.

---

## Recommendations

**If you want to make this a business:**

1. **Build the proxy.** Today. It's the only thing that differentiates you from a git repo.

2. **Add Stripe.** Even if it's just $5/month. You need to prove someone will pay.

3. **Ship the dashboard.** Developers may use CLI, but their managers need a UI.

4. **Find your wedge.** The market is crowded. Consider:
   - Deep integration with one LLM provider (become "the prompt tool for Anthropic")
   - Focus on compliance/audit (SOC2-ready prompt versioning)
   - Target a vertical (prompts for customer service, legal, healthcare)

5. **Create switching costs.** Add features that make leaving painful:
   - Prompt analytics and performance tracking
   - A/B testing with statistical significance
   - Team collaboration and approval workflows

**If this is a hobby or portfolio piece:** It's well-executed. Ship it, get the HN points, and move on. Just don't pretend it's a business.

---

## The Buffett Test

*"Would I buy this company for $10 million and hold it for 10 years?"*

No. There's no durable competitive advantage. A well-funded competitor could replicate the functionality in a sprint, and likely will if the market proves valuable. The product doesn't generate cash, can't demonstrate unit economics, and relies entirely on user goodwill and first-mover advantage—neither of which compound.

This is a feature, not a company. Features get acquired or obsoleted. Companies endure.

---

*"Price is what you pay. Value is what you get."*
Right now, the price to build this was low. The value created is speculative at best.

— Warren Buffett
