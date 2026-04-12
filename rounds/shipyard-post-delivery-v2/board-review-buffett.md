# Board Review: Anchor Deliverables (Post-Build)

**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-12
**Lens:** Durable Value
**Review Type:** Deliverables Evaluation (Post-Build)

---

## Executive Summary

I reviewed the PRD before the build and gave it a 7/10. Now I'm looking at what was actually shipped. The team delivered exactly what they promised—nothing more, nothing less. This is rare and valuable. The system is operational, capital-efficient, and ready to generate recurring revenue this week.

---

## Unit Economics

### What Does It Cost to Acquire and Serve One Anchor Client?

**Customer Acquisition Cost: $0 incremental**

The Anchor client is sourced from an existing project relationship. No new marketing spend. The cost is purely operational:

| Activity | Time Investment | Frequency |
|----------|-----------------|-----------|
| Add client to Notion | 2 minutes | Once |
| Send Day 0 email | 3 minutes | Once |
| Send Day 7 email | 2 minutes | Once |
| Send Day 30 email | 2 minutes | Once |
| Send Month 6 email | 2 minutes | Once |
| **Total acquisition effort** | **11 minutes** | **Per client** |

At a labor cost of $50/hour, that's **$9.17 per client** to run the full Anchor sequence.

**Cost to Serve (Monthly)**

| Tier | Price | Token Cost (@$0.01/1K) | Labor (est.) | Gross Margin |
|------|-------|------------------------|--------------|--------------|
| Anchor Basic | $79 | $0.50 max | $15/month | ~80%+ |
| Anchor Pro | $149 | $2.00 max | $25/month | ~82%+ |

Even assuming 30 minutes of actual work per client per month (generous), margins exceed 80%. If clients don't use their full token allowance—which most won't—margins approach 95%.

**Verdict:** Excellent unit economics. This is a high-margin, low-touch recurring revenue stream.

---

## Revenue Model

### Is This a Business or a Hobby?

**This is a business.** Here's the arithmetic:

**Scenario: 4 project clients per month, 25% attach rate**

| Month | New Projects | New Anchor | MRR (Basic) | Cumulative MRR |
|-------|--------------|------------|-------------|----------------|
| 1 | 4 | 1 | $79 | $79 |
| 2 | 4 | 1 | $79 | $158 |
| 3 | 4 | 1 | $79 | $237 |
| 4 | 4 | 1 | $79 | $316 |
| 5 | 4 | 1 | $79 | $395 |
| 6 | 4 | 1 | $79 | $474 |

**By month 6:** $474 MRR = **$5,688 ARR**

**By month 12:** $948 MRR = **$11,376 ARR** (assuming no churn)

With 50% Pro tier adoption: **$13,680 ARR** in year one.

This isn't venture-scale, but it doesn't need to be. It's a self-funding business line that:
1. Covers its own operational costs from day one
2. Compounds without additional marketing spend
3. Creates stickiness that protects the core project business
4. Generates cash flow that can fund product development

**The key insight:** Every Anchor client is a client who won't shop for their next project. The recurring revenue is real, but the relationship lock-in may be more valuable.

---

## Competitive Moat

### What Stops Someone From Copying This in a Weekend?

**Technically, nothing.** The deliverables are:
- 4 email templates
- 2 Stripe products
- 1 Notion database schema
- 1 brand voice guide
- 1 process document

Any competent agency could replicate this in a day.

**But moats aren't built from what you create—they're built from what you execute.**

**The Real Moat:**

1. **Operational discipline.** The SEND-PROCESS.md document and Notion automation system transform good intentions into reliable execution. Most agencies have maintenance plans. None have documented processes to ensure emails actually get sent.

2. **First-mover in the relationship.** By the time a competitor thinks to offer maintenance, the Anchor sequence has already established Shipyard as "the team that doesn't disappear" through Day 0, 7, and 30 touchpoints. The client isn't comparison shopping.

3. **Compounding trust.** Each email that lands on time reinforces the positioning. "We don't disappear" stops being a tagline and becomes a fact. This takes 6+ months to build—and competitors can't shortcut it.

4. **Institutional memory.** The brand voice guide ensures consistency regardless of who sends the emails. This is process capital that competitors would need to develop from scratch.

**Moat Strength Today:** Weak (unproven)
**Moat Strength at 25 Clients:** Moderate (track record established)
**Moat Strength at 100 Clients:** Strong (operational excellence + brand = defensible)

---

## Capital Efficiency

### Are We Spending Wisely?

**This is one of the most capital-efficient builds I've reviewed.**

| Investment | Cost | Status |
|------------|------|--------|
| Engineering time | $0 | No code written |
| Design work | $0 | Templates only |
| Infrastructure | $0 | Stripe + Notion (existing tools) |
| Marketing | $0 | Leverages existing client relationships |
| Automation | $0 | Deferred until proven demand |

**Total capital deployed:** $0 beyond labor to write the templates.

**What I appreciate:**

1. **"Ship manual, automate later"** is actually happening. The PRD said it, and the deliverables prove it. No premature automation. No dashboards. No token tracking database. Just templates and a process.

2. **Milestone-gated spending.** Automation evaluation at 15 clients. Deployment at 25. CRM consideration at 50. This is disciplined capital allocation.

3. **Scope reduction from V1 to V2.** The original PRD failed because it was too ambitious. The team cut 60% of scope and shipped. This is wisdom, not weakness.

4. **Phase 2 is appropriately deferred.** The PRD lists what could be built later. None of it is being built now. Good.

**One concern:** The 2-day build timeline (per decisions.md) means labor cost is ~$800-1,600. If Anchor generates $5,000+ ARR in year one, ROI exceeds 300%. Acceptable.

---

## What's Actually Been Built (Deliverables Review)

| Deliverable | Status | Quality Assessment |
|-------------|--------|-------------------|
| Email 1: Launch Day | ✓ Built | Excellent. Leads with celebration. "We don't disappear" in paragraph 1. Clear CTA. |
| Email 2: Day 7 | ✓ Built | Good. Soft CTA appropriate. Relationship-focused. |
| Email 3: Day 30 | ✓ Built | Good. Hard CTA with clear path to purchase. |
| Email 4: Month 6 | ✓ Built | Good. Anniversary framing. Renewal positioning. |
| Stripe Basic ($79) | ✓ Documented | Clear product definition. Setup instructions included. |
| Stripe Pro ($149) | ✓ Documented | Clear differentiation from Basic. Value prop articulated. |
| Notion Database | ✓ Documented | Comprehensive schema. Formula fields auto-calculate. |
| Brand Voice Guide | ✓ Built | "Confident, warm, slightly irreverent." Examples clear. |
| Send Process | ✓ Built | Detailed workflow. Escalation protocol. Edge cases covered. |

**All PRD requirements met.** No gold-plating. No scope creep.

---

## Concerns

### 1. Token Pricing Risk Remains

50K and 200K token allowances are assumptions. If a typical update requires 30K tokens and clients average 2 updates/month, Basic clients consume 60K tokens—exceeding allowance.

**Recommendation:** Track actual token usage for first 10 clients. Adjust allowances or pricing by month 3.

### 2. Manual Process Execution Risk

The entire system fails if someone forgets to open Notion. The mitigations (daily task view, automated reminders) are appropriate but untested.

**Recommendation:** Assign one person explicit ownership of daily email check. Track compliance rate.

### 3. Month 6 Is a Long Wait

After Day 30, clients don't hear from Shipyard for 5 months. That's enough time to forget and seek alternatives.

**Recommendation:** Consider adding a lightweight Day 90 check-in (not the full refresh proposal that was cut) as a relationship maintenance touchpoint.

### 4. No Churn Recovery Process

If a client cancels Anchor, there's no documented win-back process.

**Recommendation:** Add 60-day post-churn email: "Door's still open. Ready when you are."

---

## Score: 7/10

**Justification:** The team shipped exactly what they promised with zero capital deployment and excellent unit economics. The moat is still theoretical—execution over the next 90 days will determine if this becomes a durable business line or a well-documented idea that no one followed through on.

---

## The Buffett Test

*"What is the most important question to answer about this investment?"*

**Can Shipyard actually send emails on time, every time, for 50+ clients?**

Everything else—pricing, positioning, moat—depends on operational consistency. If Day 7 emails go out on Day 12, "we don't disappear" becomes "we sometimes remember you exist."

The deliverables are solid. The process is documented. Now we need to see if humans follow the process.

---

## Recommendation

**Approve. Ship immediately.**

Start sending Launch Day emails to the next project delivery. Track these metrics for 90-day review:

1. **On-time send rate** (target: 95%)
2. **Attach rate** (target: 20%+)
3. **Token utilization** (actual vs. allowance)
4. **Reply rate per email** (baseline needed)
5. **Churn rate** (target: <10% monthly)

If metrics hold, Phase 2 automation is justified at client 25.

---

## Final Thought

*"The difference between successful people and really successful people is that really successful people say no to almost everything."*

This team said no to dashboards, automation, token tracking, analytics, and email triggers. They said yes to four templates, two products, and one process.

That's how you build something that lasts.

---

— Warren Buffett
Board Member, Great Minds Agency
