# Board Review: Shipyard Care

**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-06
**Lens:** Durable Value

---

## Executive Summary

Shipyard Care transforms a project-based business into a relationship-based business. This is exactly the right strategic move. The difference between a $5,000 one-time project and a $5,000 project plus $99-499/month in perpetuity is the difference between a job and a business.

---

## Unit Economics

**What does it cost to acquire and serve one user?**

| Cost Component | Basic ($99/mo) | Pro ($249/mo) | Enterprise ($499/mo) |
|----------------|----------------|---------------|----------------------|
| **Acquisition Cost** | ~$0 (existing customer) | ~$0 | ~$0 |
| **Infrastructure (hosting, DB, APIs)** | ~$2-5/mo | ~$2-5/mo | ~$2-5/mo |
| **PageSpeed API calls** | ~$0 (free tier) | ~$0 | ~$0 |
| **Email delivery (Sendgrid)** | ~$0.001/email | ~$0.001/email | ~$0.001/email |
| **Stripe fees (2.9% + $0.30)** | ~$3.17/mo | ~$7.52/mo | ~$14.77/mo |
| **Support time (human)** | ~0 hrs | ~1-2 hrs @ $50/hr | ~2-4 hrs @ $50/hr |
| **Content work (Pro/Ent)** | $0 | 4 hrs @ $50 = $200 | 8 hrs @ $50 = $400 |
| **Gross Margin Estimate** | **~92-95%** | **~15-20%** | **~15-20%** |

**The Verdict:** Basic tier is a cash machine with 90%+ gross margins. Pro and Enterprise tiers are problematic—the content/development hours eat margins alive. Either raise prices significantly on Pro/Enterprise or automate more of the content work using Shipyard's AI capabilities.

**Blended Revenue per Customer:** If we assume 60% Basic, 30% Pro, 10% Enterprise adoption:
- Blended ARPU: $164/month
- Blended margin: ~55-60% (dragged down by labor-intensive tiers)

---

## Revenue Model

**Is this a business or a hobby?**

**This is a business.** Here's why:

1. **Recurring revenue:** $99-499/month per customer transforms LTV dramatically
   - Old LTV: ~$5,000 (one-time project)
   - New LTV: $5,000 + ($164 x 24 months) = **$8,936** (78% increase at 2-year retention)

2. **Built-in expansion revenue:** The tier upgrade path (Basic → Pro → Enterprise) creates natural upsell opportunities. The Site Performance Story email is cleverly designed to surface upgrade moments.

3. **Network effects on the moat:** Every site monitored feeds data into the pattern library. This is the hidden gold. After 1,000 sites, Shipyard can say: "Sites with hero sections like X convert 23% better." Competitors can't copy that.

4. **Predictable cash flows:** Monthly subscriptions smooth revenue and make forecasting possible. This is the difference between being able to hire and being afraid to.

**Revenue Projections (conservative):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| New projects delivered | 100 | 150 | 200 |
| Care adoption rate | 40% | 50% | 60% |
| Care subscribers (cumulative) | 40 | 115 | 235 |
| Monthly recurring revenue | $6,560 | $18,860 | $38,540 |
| Annual recurring revenue | $78,720 | $226,320 | $462,480 |

---

## Competitive Moat

**What stops someone from copying this in a weekend?**

Let me be direct: **The code itself has no moat.** Any competent developer could build a Stripe integration, uptime checker, and PageSpeed API wrapper in 2-3 days. The deliverables are solid engineering but not defensible.

**Where the moat actually lives:**

1. **Existing customer relationships:** The brilliant insight is targeting existing Shipyard customers first. Someone who just paid $5,000 for a website has high trust. A cold competitor offering "website monitoring" has zero trust. The switching cost isn't technical—it's emotional.

2. **The pattern library (future moat):** The PRD mentions this but it's underemphasized. After 500 monitored sites, Shipyard will have real data: "Hero sections with testimonials convert 23% better." This data compounds and cannot be replicated quickly.

3. **Bundled value:** Care isn't sold alone—it's sold as "Shipyard built your site, Shipyard maintains your site." The integration with the build process creates stickiness.

**Moat Strength: 4/10 today, potentially 7/10 in 24 months** if the pattern library is executed well.

---

## Capital Efficiency

**Are we spending wisely?**

**Infrastructure Choices: A+**
- PostgreSQL for data (simple, reliable, cheap)
- Stripe for billing (industry standard, predictable costs)
- Google PageSpeed API (free tier sufficient for scale)
- Session-based auth with refresh tokens (no expensive auth provider)
- Next.js API routes (serverless-friendly, low operational overhead)

**Development Investment: B+**
- Token budget: 1M tokens (~$15-30 in Claude API costs)
- Delivered: Billing system, webhook handling, uptime monitoring, health scoring, auth—essentially an MVP SaaS
- What's missing: No dashboard UI, no email template system, no recommendation engine yet
- The core plumbing is done; the customer-facing polish is not

**What concerns me:**
- No evidence of monitoring/alerting infrastructure cost
- Pro/Enterprise tiers require human labor—this doesn't scale
- The "8 hours/month development" in Enterprise is a ticking time bomb

**Recommendation:** Before scaling, automate more of Pro/Enterprise deliverables. Consider:
- AI-generated content suggestions instead of human content work
- Templatized updates for common requests
- Clear scope limits with overage billing

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Low adoption from existing customers | Medium | 50% discount for first 3 months (already planned) |
| Pro/Enterprise margin compression | High | Raise prices or automate labor-intensive features |
| Competitor undercuts on price | Low | Moat is relationship, not price |
| Support burden at scale | Medium | Self-service dashboard + clear tier boundaries |
| Churn after Year 1 | Medium | Site Performance Story keeps engagement high |

---

## Score: 7/10

**Justification:** Excellent strategic move converting one-time revenue to recurring, with solid technical foundation, but Pro/Enterprise unit economics need work before scale.

---

## Recommendations for Next Phase

1. **Launch Basic tier first.** It's the profit engine. Get 50 customers before investing in Pro/Enterprise complexity.

2. **Build the pattern library infrastructure now.** Every site monitored should feed anonymized data. This is the moat.

3. **Rethink Pro/Enterprise pricing.** At current margins, you're paying customers to use these tiers. Either:
   - Raise prices (Pro → $399, Enterprise → $799)
   - Cap hours strictly and charge overage
   - Automate content work with AI

4. **Complete the dashboard and email system.** The code exists for metrics—the customer-facing presentation does not.

5. **Track cohort retention religiously.** The business model assumes 12-24 month retention. If churn exceeds 10%/month, the economics collapse.

---

*"Price is what you pay. Value is what you get." In Shipyard Care, the value proposition is clear: peace of mind for site owners, recurring revenue for Shipyard. The foundation is solid—now execute.*

— Warren Buffett
Board Member, Great Minds Agency
