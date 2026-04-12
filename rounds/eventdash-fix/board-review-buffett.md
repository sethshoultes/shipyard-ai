# Board Review: EventDash Fix

**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-12
**Project:** eventdash-fix

---

## Executive Summary

This isn't a new product. It's technical debt cleanup on an existing plugin that was shipped broken. I'm being asked to evaluate the business case for fixing what should never have been shipped faulty in the first place.

Let me be direct: **This is a cost center disguised as a deliverable.**

---

## Unit Economics: What Does It Cost to Acquire and Serve One User?

**The uncomfortable truth: Unknown.**

I've read 600+ lines of documentation. Not a single number tells me:
- Customer acquisition cost (CAC)
- Cost to serve per user (hosting, support, KV storage operations)
- Lifetime value (LTV) of an EventDash user
- Conversion rate from free plugin to paid tier (if one exists)

What I *can* see:
- **Development cost for this fix:** ~8-16 hours of agent time for a "mechanical find-and-replace" across 443 pattern violations
- **Infrastructure:** Cloudflare Workers + KV storage (consumption-based, low marginal cost)
- **No pricing model visible** in any documentation

**My concern:** If you don't know your unit economics, you're not running a business—you're running a science experiment with someone else's money.

---

## Revenue Model: Is This a Business or a Hobby?

**Verdict: Hobby, until proven otherwise.**

From the deliverables:
- EventDash is a **plugin** for the Emdash platform
- It appears to be **bundled** with Emdash deployments (e.g., "Sunrise Yoga" site)
- No pricing tier, no premium features, no upsell path mentioned

**What I see:**
- A free event management tool
- Deployed on existing customer infrastructure
- No standalone monetization

**What a business would look like:**
- Tiered pricing: Free (3 events), Pro ($X/month, unlimited)
- Transaction fees on paid tickets (Stripe integration mentioned but not implemented)
- Premium features: Custom branding, analytics, integrations

The PRD mentions "Stripe ticketing" in the original codebase, but it was explicitly **cut** to ship faster. That's the revenue engine—and it's sitting on the cutting room floor.

**Bottom line:** When the thing that makes money is the first thing you cut, you've confused shipping with succeeding.

---

## Competitive Moat: What Stops Someone From Copying This in a Weekend?

**Moat width: Approximately zero.**

Let's be honest about what EventDash is:
- A CRUD interface for events (name, date, description)
- KV storage with list/get/set operations
- Block Kit rendering for admin UI
- 133 lines of TypeScript

**What protects this:**
- Nothing.

**What could protect this:**
- Deep integration with Emdash ecosystem (moderate switching cost)
- Network effects (attendee data, recurring events)
- Proprietary data (analytics, recommendations)
- Regulatory compliance (GDPR event management)

None of these exist today. Any developer with the Emdash SDK could replicate this in an afternoon. The "Stripe ticketing" mentioned in the PRD would add meaningful differentiation—but again, that's not shipping.

**Charlie Munger would say:** "If your business can be replicated over a weekend, it's not a business—it's a feature."

---

## Capital Efficiency: Are We Spending Wisely?

**Mixed verdict.**

**What they got right:**
1. **Scope discipline** — The decisions document shows they resisted feature creep (no recurring events, no attendee management, no analytics dashboards)
2. **Mechanical execution** — This is pattern-replacement work, not creative exploration
3. **Deferred complexity** — Phase 3 integration and KV architecture refactor pushed to separate PRs
4. **Minimal viable surface** — 3 fields (Name, Date, Description) instead of 5

**What concerns me:**
1. **No evidence of customer demand** — The PRD is auto-generated from a GitHub issue. Where's the user research? Who asked for EventDash?
2. **Fixing the wrong problem** — The plugin was "written against a non-existent API surface and has never been tested against real Emdash." That's not a bug—that's a process failure. Fixing the code doesn't fix the process.
3. **Opportunity cost invisible** — What else could this development time build? The research notes mention ReviewPulse (2051 lines, production-ready). What's the ROI comparison?

**The capital efficiency question I'd ask the team:**
*"If you had $10,000 and one week, would you spend it fixing EventDash or building something new that customers are actually asking for?"*

If the answer is "fix EventDash," show me the customer demand. If it's "build something new," why are we here?

---

## What I Would Need to Change My Mind

1. **Customer data** — Show me 10 customers who need EventDash and will churn without it
2. **Revenue path** — Show me the Stripe integration roadmap with projected take rate
3. **Platform strategy** — Explain how EventDash increases Emdash's competitive position
4. **Unit economics model** — Even rough estimates: CAC, LTV, payback period

Without these, I'm being asked to approve maintenance work on a feature nobody's proven they want.

---

## Score: 4/10

**Justification:** Competent execution of scope-controlled technical debt, but no evidence this creates economic value—we're paying to maintain a hobby project.

---

## Recommendations

1. **Ship this fix** — The admin page is literally broken. You can't evaluate customer demand for something that doesn't work. Get it functional.

2. **Instrument immediately** — Add telemetry: How many events created? How many unique admin sessions? Time to first event? You need data to know if this matters.

3. **Define a revenue experiment** — Re-introduce the Stripe ticketing feature as a 30-day experiment. Measure conversion.

4. **Set a kill threshold** — If EventDash has <X active users after 90 days, deprecate it. Don't maintain zombie features.

5. **Fix the process** — How did code "written against a non-existent API surface" get merged? That's the real bug.

---

*"Price is what you pay. Value is what you get."*

Right now, we're paying in developer hours, and I can't tell you what value we're getting back. That's not a criticism of the team—it's a criticism of the measurement systems.

Fix the plugin. Then fix the dashboards. Then we'll talk about whether this is a business.

---

**Warren Buffett**
*Board Member, Great Minds Agency*
