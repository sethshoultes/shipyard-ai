# Board Review — Warren Buffett

**Project:** PromptOps (Drift + NERVE)
**Date:** 2026-04-12
**Role:** Board Member, Great Minds Agency
**Lens:** Durable Value

---

## Executive Summary

The team has built two distinct products under the "promptops" umbrella:

1. **Drift** — A prompt versioning service (API + CLI)
2. **NERVE** — A pipeline daemon system (bash scripts)

Both are technically competent. Neither has a clear path to durable profit.

Drift is a vitamin, not a painkiller. Companies solving real problems don't version prompts separately from their code—they just use git. The competitive moat is a puddle.

---

## What Was Actually Built

| Component | Lines of Code | Status |
|-----------|---------------|--------|
| Drift API (Cloudflare Worker) | ~400 | 80% complete |
| Drift CLI (Node.js) | ~250 | 70% complete |
| NERVE daemon (bash) | ~500 | 90% complete |
| Dashboard | 0 | Not built |
| Proxy (core differentiator) | 0 | Not built |

The MVP scope in the PRD listed both Dashboard and Proxy as "Must Have." Neither was delivered.

---

## Unit Economics: What Does It Cost to Acquire and Serve One User?

### Serving Costs

| Component | Cost Model | Per-User Estimate |
|-----------|------------|-------------------|
| Cloudflare Workers | 10M requests/month free | ~$0 |
| D1 Database | 5GB free tier | ~$0 |
| npm distribution | Free | $0 |

**Current marginal cost per user: $0** (within free tier)

This is good infrastructure selection. The team correctly chose serverless with generous free tiers. However, zero cost also means zero signal—we have no way to know when we're approaching unsustainable scale.

### Acquisition Costs

The PRD proposes organic distribution: Hacker News, Twitter, Reddit, ProductHunt.

**Estimated CAC: $0-5** (time cost of community posts)

**The problem:** Zero-cost acquisition sounds good until you realize it means zero-scalable acquisition. Show HN might get 100 users. Then what? Hope for virality? That's not a business plan.

### LTV Calculation (Per Proposed Pricing)

| Tier | Price | Expected Churn | 12-Month LTV |
|------|-------|----------------|--------------|
| Free | $0 | N/A | $0 |
| Pro ($29/mo) | ~5%/mo | $210 |
| Team ($99/mo) | ~3%/mo | $830 |

Developer tools in this category see 90%+ free tier usage. If 5% convert to Pro:

**Blended LTV per acquired user: ~$10.50**

**Unit Economics Grade: C+**

Low cost is not the same as good economics. We can serve users for nothing, but we can't make money doing it.

---

## Revenue Model: Is This a Business or a Hobby?

### What's Missing for Revenue

- No billing integration
- No usage metering
- No payment collection
- No subscription management
- No trial-to-paid conversion flow

**This is a hobby wearing a business plan.**

The PRD mentions "$29/mo Pro tier" but nothing in the deliverables collects money. The distance between "here's our pricing" and "here's how we collect payment" is the difference between fantasy and business.

### The Value Proposition Problem

> "Git for prompts"

Git already exists. Developers already version prompts in git with their code. They do this for $0.

The proxy architecture (sitting between app and LLM) adds latency and a single point of failure. Companies with serious AI deployments won't accept that tradeoff for "prompt versioning" when they can `git commit` for free.

**Revenue Model Grade: D**

No mechanism to collect revenue. Value proposition competes with free built-in solutions.

---

## Competitive Moat: What Stops Someone From Copying This in a Weekend?

### Moat Analysis

| Moat Type | Present? | Notes |
|-----------|----------|-------|
| Network effects | No | Each project is isolated |
| Switching costs | Minimal | Prompts are text files |
| Brand/trust | No | Zero users, zero reputation |
| Patents | No | Standard CRUD + versioning |
| Data advantage | No | User data stays with user |
| Technical complexity | Low | ~650 lines of TypeScript |

### The Weekend Test

Could a competent developer replicate Drift in a weekend?

- D1 schema (3 tables): 30 minutes
- CRUD API in Workers: 2 hours
- CLI with commander.js: 2 hours
- API key auth: 1 hour

**Total: One afternoon.**

### Competitive Reality

The PRD acknowledges competitors:

- **LangSmith** — Full observability, backed by LangChain, well-funded
- **Helicone** — Proxy with logging, VC-backed, already shipped
- **Weights & Biases** — Established ML platform

We're bringing a butter knife to a gunfight. LangSmith does everything Drift does, plus actual observability, with a real team and real funding.

**Competitive Moat Grade: F**

There is no moat. The code is straightforward, the architecture is standard, and better-funded competitors already exist.

---

## Capital Efficiency: Are We Spending Wisely?

### What Was Built vs. What Was Promised

**PRD "Must Have" Features:**

| Feature | Built? |
|---------|--------|
| CLI (init, push, list, rollback) | Yes |
| Cloudflare Worker proxy | **No** |
| D1 database | Yes |
| API key auth | Yes |
| Basic web dashboard | **No** |

**Completion rate on Must Haves: ~60%**

### The NERVE Problem

NERVE consumed an estimated 40% of build effort. It's a well-engineered pipeline daemon that:

- Has zero customers
- Provides zero revenue
- Solves a problem we don't yet have

This is the cardinal sin: **building infrastructure before customers.** When you have 10,000 users and pipeline reliability matters, build NERVE. When you have 0 users, ship the dashboard.

### The Security Bright Spot

The auth implementation shows craft:

- SHA-256 hashed API keys (good)
- Proper key prefix format (`drift_`) for easy identification (thoughtful)
- Clean middleware pattern

This is competent security engineering. It's just in service of a product nobody uses.

**Capital Efficiency Grade: C**

Smart infrastructure choices. Wrong priorities. 40% of effort on NERVE instead of customer-facing features. Core differentiators (proxy, dashboard) not built.

---

## The Buffett Test

I apply three questions to every investment:

### 1. Do I understand it?

Yes. Version control for AI prompts, delivered via CLI and API. Clear concept.

### 2. Does it have durable competitive advantage?

No. The architecture is standard. The code is simple. LangSmith already exists with more features and more funding. A competent developer replicates this in hours.

### 3. Is it priced attractively?

The build cost is low (free infrastructure, developer time). But developer time is not free—it has opportunity cost. Hours spent on NERVE and auth middleware are hours not spent talking to potential customers.

---

## Score: 4/10

**Justification:** Competent engineering in search of a customer—a solution looking for a problem that git already solves for free.

---

## Recommendations

### If We Proceed

1. **Kill NERVE.** It's premature optimization. Defer until we have users.

2. **Ship the proxy.** Without it, Drift is just "another database." The proxy that intercepts LLM calls is the product. Build that first.

3. **Talk to users before more code.** Find 10 companies with prompt management pain. Confirm they'd pay $29/mo. If you can't find them, that's your answer.

4. **Add billing immediately.** You can't learn if people will pay without letting them pay. Stripe takes 30 minutes to integrate.

5. **Ship the dashboard.** CLI-only tools don't convert. Non-technical stakeholders (PMs, content writers) need a visual interface to see value.

### If We're Honest

This is a feature, not a company.

Prompt versioning will be absorbed into:
- LangSmith (already doing it)
- OpenAI's platform (inevitable)
- Claude's platform (inevitable)
- Developers' existing CI/CD (git + deploy scripts)

There is no sustainable competitive advantage.

The team's engineering is sound. The security implementation shows real craft. Direct this talent toward a problem with a moat.

---

## What Would Make This a 7+

1. **A customer who pays money.** Just one. Real money. Real pain solved.

2. **The proxy working in production.** The proxy is the moat, not the versioning.

3. **Network effects.** A prompt marketplace? Shared templates? Something that gets better with more users?

4. **Demonstrated switching costs.** Why can't a customer leave for git after using Drift?

None of these exist today.

---

## Final Word

Charlie Munger said: *"Show me the incentive and I'll show you the outcome."*

The incentive here is to build interesting software. The outcome is interesting software. But interesting software doesn't compound.

Revenue compounds. Customer relationships compound. Competitive advantages compound. Prompt versioning databases do not.

The PRD says "Git for prompts." Git is free and everyone has it. That's our competition.

---

*"Price is what you pay. Value is what you get."*

I see price (developer hours, process overhead, infrastructure setup).

I don't yet see value (revenue, customers, moat).

Ship something someone will pay for.

— Warren Buffett
Board Member, Great Minds Agency
