# Board Review: Shipyard Maintenance Subscription
**Reviewer:** Jensen Huang, NVIDIA CEO
**Date:** 2026-04-20
**Score:** 4/10

---

## Verdict
**This is middleware, not infrastructure.** Token-based maintenance is the right primitive, but we're not compounding advantage. No data moat. No AI leverage at scale. Platform potential ignored.

---

## What's the Moat? What Compounds?

**Current state:**
- Token budget system
- Stripe billing
- Email-based incident reports
- Referral credits

**The problem:**
- Zero data flywheel. We're not learning from failures across customers.
- Incident reports describe what broke, not why it broke or how to prevent it system-wide.
- Each customer's maintenance is isolated. No cross-customer learning.
- Referral credits drive growth but don't compound product quality.

**What should compound:**
- **Failure prediction model.** Every incident should train a classifier: "Projects using X framework + Y hosting + Z traffic pattern fail in N days." Feed this back into PRD review.
- **Auto-healing scripts.** First incident = manual fix + incident report. Second identical incident = automated prevention deployed. Third = never happens.
- **Code quality signals.** Token usage patterns reveal which PRDs generate fragile vs. robust code. Feed this into the PRD → code pipeline to improve first-time quality.

**Missing moat:** We're maintaining sites. We should be maintaining *knowledge* about what makes sites fail and auto-preventing it.

---

## Where's the AI Leverage?

**Token tracking is not AI leverage.** It's accounting.

**Current AI usage:**
- Claude processes PRDs (same as free tier)
- Claude generates incident reports (templated summaries)

**Where's the 10x opportunity?**
- **Predictive maintenance.** Train a model on: deployment patterns, code structure, traffic patterns, failure rates. Alert *before* things break.
- **Auto-remediation.** LLM agent that reads incident, generates fix, tests fix, deploys fix. Human-in-loop only for approval, not diagnosis.
- **Cross-customer intelligence.** "5 other Next.js sites broke this week after Vercel's edge runtime update. We've pre-patched your site."
- **Maintenance PRD generation.** Customer says "site is slow." AI agent profiles performance, writes PRD for optimization, submits to pipeline. No human-written PRD required.

**Current state: AI does same work faster.**
**Target state: AI does different work we couldn't do manually.**

We're not there.

---

## What's the Unfair Advantage We're Not Building?

**The data.**

Every maintenance cycle generates signals:
- Which code patterns break under load?
- Which frameworks have hidden footguns?
- Which hosting configs are fragile?
- Which PRD ambiguities lead to maintenance burden?

**No one else has this dataset.** It spans:
- PRD → Code pipeline (what was requested)
- Deployed artifacts (what was built)
- Incident reports (what broke)
- Fix PRDs (how it was repaired)

**We should be building:**
- **PRD quality score.** Predict maintenance burden before writing code. "This PRD will require 3 maintenance rounds in 90 days based on similar requests."
- **Framework fragility index.** "Svelte + Netlify has 40% lower maintenance cost than Next.js + Vercel for projects <10K MAU."
- **Auto-suggest optimizations.** "Your site uses 80K tokens/month for maintenance. Migrating to static generation would drop that to 20K."

**Current advantage:** We do maintenance faster than hiring a dev.
**Unfair advantage:** We know what breaks before you build it, and auto-prevent it.

---

## What Would Make This a Platform?

**Not a product: Subscription maintenance service.**
**Platform: Maintenance-as-a-dataset + API.**

**Platform primitives:**
1. **Maintenance Intelligence API**
   - `GET /predict-maintenance-cost?prd=<id>` → Returns token forecast + risk factors
   - `POST /auto-fix` → Accepts incident description, returns PR with fix
   - `GET /framework-health` → Returns real-time fragility index for stacks

2. **Developer SDK**
   - Other AI code generators (Cursor, v0, Replit) consume our maintenance intelligence
   - They pay per query: "Will this code require high maintenance?"
   - Shipyard becomes the "durability layer" for AI-generated code

3. **Marketplace for Auto-Healing Scripts**
   - Customer A's incident generates reusable fix pattern
   - Customer B with similar stack auto-applies fix (with credit split)
   - Network effect: More customers = more fixes = less maintenance for everyone

4. **White-label Maintenance**
   - Other agencies use Shipyard Care backend, their brand
   - We operate the intelligence layer, they operate customer relationships
   - Platform revenue: Per-token API pricing

**Current model:** Netflix (we own content, sell subscriptions).
**Platform model:** AWS (we own infrastructure, everyone builds on it).

---

## What I'd Do Differently

**Keep token-based billing.** Aligns incentives correctly.

**But add:**

1. **Failure prediction endpoint (Day 1)**
   - Parse deployed code, predict MTBF (mean time between failures)
   - Surface in health reports: "Your auth flow has 60% chance of breaking in next 30 days based on similar patterns."

2. **Cross-customer anonymized learning (Month 2)**
   - "Next.js 14 + Supabase auth has 3x higher incident rate this month. Recommend migration to Clerk."
   - This is defensible. No one else sees across customers.

3. **Auto-fix approval workflow (Month 3)**
   - Incident detected → AI generates fix PRD → Customer approves with one click → Auto-deployed
   - Reduces token cost (less human PRD writing) and latency (no back-and-forth)

4. **API launch (Month 6)**
   - Other tools query: "Is this code maintainable?"
   - Charge per API call, not per maintenance incident
   - Decouples growth from incident volume (good for customers, good for margin)

---

## Why This Matters

**Maintenance is the training data for durability.**

NVIDIA doesn't sell GPUs that break and offer "GPU Care" subscriptions. We sell GPUs that don't break because we learned from every failure in the fab process.

Shipyard should sell code that doesn't break because you learned from every maintenance incident across all customers.

**Right now:** Shipyard Care is AppleCare for websites.
**Opportunity:** Shipyard Care is the TensorRT compiler for AI-generated code — makes it faster, smaller, more reliable before it ships.

---

## Score Justification

**4/10: Correct billing model, zero compounding advantage.**

- +2 for token-based pricing (aligns incentives)
- +2 for incident-only reporting (avoids noise)
- +1 for referral loop (viral distribution)
- -3 for no data moat (each customer isolated)
- -2 for no AI leverage (same work, faster != 10x)
- -2 for no platform vision (subscription service, not infrastructure)

**This doesn't become more valuable as we scale.** Subscriber #100 gets same service as subscriber #1. That's a service business, not a platform.

**Fix:** Make every maintenance cycle train the system. Subscriber #100 should have 10x fewer incidents than subscriber #1 because we learned from the first 99.

---

**Recommendation:** Ship V1 to generate revenue. Immediately start V2 with failure prediction model. Treat every incident as training data, not just a ticket to resolve.

Platform potential is latent. Revenue model is correct. Missing the compounding layer.
