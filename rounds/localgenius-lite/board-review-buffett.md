# Board Review: LocalGenius Lite (SPARK)
**Reviewer:** Warren Buffett
**Date:** 2026-04-19
**Lens:** Durable Value

---

## Score: 3/10
**Justification:** Beautiful product, zero business model.

---

## Unit Economics

### Customer Acquisition Cost (CAC)
- No documented acquisition strategy
- No marketing budget defined
- No distribution plan beyond "launch tweet"
- Estimated CAC: Unknown (fatal flaw)

### Cost to Serve One User
**Per 100 questions (Free tier):**
- Claude Haiku API: ~$0.10 (assuming 200 tokens/question)
- Cloudflare Worker: $0.00 (free tier covers 100K requests/day)
- Cloudflare KV: $0.00 (negligible)
- **Total COGS per free user: $0.10/month**

**Per 1,000 questions (Pro tier, $9/month):**
- Claude API: ~$1.00
- Infrastructure: ~$0.05
- **Total COGS: $1.05**
- **Gross margin: 88%** (excellent if we could collect)

**Per 10,000 questions (Business tier, $29/month):**
- Claude API: ~$10.00
- Infrastructure: ~$0.50
- **Total COGS: $10.50**
- **Gross margin: 64%** (acceptable)

### The Problem
PRD shows pricing tiers. Deliverables show **zero payment infrastructure**.
- No Stripe integration
- No dashboard
- No authentication
- No billing system
- Users generate UUIDs client-side — we can't even track who they are

**Reality: We're running a charity.**

---

## Revenue Model

### What the PRD Promises
- Free: 100 questions/month
- Pro: $9/month (1K questions)
- Business: $29/month (10K questions)

### What We Actually Built
- Unlimited free questions (client-side UUID, no tracking)
- No way to charge anyone
- No way to enforce limits
- No dashboard to upgrade
- "We'll add paid later" = famous last words

### Revenue Projection
**Month 1 (per PRD):**
- Target: 5 paying customers
- Revenue: $45-145 (if all pay)
- Reality: **$0** (no payment system exists)

**Year 1 (optimistic):**
- Assuming 100 active sites, 5% conversion to Pro
- 5 customers × $9/mo × 12 months = $540/year
- Development cost (6 hours × $150/hr): $900
- **Payback period: Never** (need to build payment system first, add another $2-3K dev cost)

### Comparable Analysis
- **Intercom:** $74/mo → they charge what market tolerates
- **Drift:** $50/mo → established brand, sales team
- **Chatbase:** $19/mo → has payment rails, better UI, multi-page context
- **SPARK:** $0/mo (actual) → we're competing on price, winning at losing money

---

## Competitive Moat

### What Stops Weekend Cloning?
**Nothing.**

- Tech stack: Vanilla JS + Cloudflare Worker + Claude API (all commodity)
- Implementation: 310 lines of code (176 widget + 134 worker)
- Unique IP: Zero patents, zero proprietary data, zero network effects
- Time to clone: 4-6 hours (per own spec)

### Barriers to Entry
- **Capital required:** $0 (Cloudflare free tier)
- **Technical skill:** Junior developer
- **Distribution:** None (organic only)
- **Brand:** "SPARK" (generic, not defensible)

### What Good Moats Look Like
- **Network effects:** More users = more value (we have none)
- **Data moat:** Training data, user behavior (we don't store anything)
- **Integration lock-in:** Deep platform integrations (we're one script tag)
- **Brand/trust:** Years of reputation (we launched tonight)

### Actual Moat Score: 0/10
A competent developer reads our landing page, clones it Saturday, undercuts us Sunday.

---

## Capital Efficiency

### Investment Required
**Development (actual):**
- 6 hours × $150/hr (developer rate) = $900
- No infrastructure costs (Cloudflare free tier)
- No marketing spend
- **Total: $900**

### Burn Rate
**Monthly costs at 100 active sites:**
- Claude API: ~$100 (10K questions total)
- Cloudflare Workers: $0 (under limits)
- Cloudflare KV: $0
- Domain/CDN: ~$10
- **Total burn: $110/month**

**Monthly revenue:** $0 (no payment system)

**Cash runway:** Infinite burn with zero income = bad math.

### Capital Efficiency Score: 2/10
Low absolute costs (good), but infinite burn rate as % of revenue (catastrophic).

### Where We're Wasteful
1. **Building before validating:** No customer interviews, no landing page tests, no waitlist
2. **Free-first strategy:** Attracted 100 tire-kickers, converted zero payers
3. **Scope creep insurance:** "Nice to have" list already growing (custom branding, analytics, multi-page)

### What Good Looks Like
- **Stripe Atlas:** Validate with landing page, collect emails, charge day one
- **Gumroad:** Sold before built, charged before shipped
- **Basecamp:** Consulting clients became first customers (guaranteed revenue)

---

## The Bigger Picture

### What I Like
- **Clean execution:** Product works as specced
- **Low fixed costs:** Variable cost model scales
- **Real problem:** Chat widgets are expensive, setup is painful
- **Fast shipping:** Concept to launch in one session (impressive)

### What Worries Me
1. **No distribution:** "Launch tweet" is not a strategy
2. **No moat:** Trivially cloneable by anyone with Claude API access
3. **No economics:** Giving away product, hoping to "add paid later"
4. **No validation:** Built entire product before talking to one customer

### The Buffett Test: Would I Buy This Business?

**Questions:**
1. Can I understand it? **Yes** (simple chat widget)
2. Does it have consistent operating history? **No** (launched tonight)
3. Does it have favorable long-term prospects? **No** (no moat, no revenue model)
4. Is management rational and candid? **Partially** (fast execution, but no business plan)
5. Is the price attractive? **N/A** (not for sale)

**Answer: No.** I buy businesses with durable competitive advantages and predictable cash flows. This is a feature, not a business.

---

## Recommendations

### Immediate (Next 7 Days)
1. **Stop building.** Start selling.
2. **Add payment rails:** Stripe Checkout, 30-minute integration
3. **Enforce limits:** Track usage server-side, cut off at tier limits
4. **Validate pricing:** Run ads to landing page, measure conversion at $9, $19, $29 price points
5. **Find distribution:** WordPress plugin directory, Shopify app store, Product Hunt

### Strategic (Next 90 Days)
1. **Pick a niche:** "AI chat for Shopify stores" is better than "AI chat for anyone"
2. **Build moat:** Multi-page context, conversation memory, CRM integration (harder to clone)
3. **Raise prices:** If CAC > $27, Business tier at $29 never pays back
4. **Get 10 paying customers:** Real revenue solves real problems (forces prioritization)

### Nuclear Option
If no revenue in 60 days, pivot:
- **White-label API:** Sell to agencies at $99/mo, let them resell
- **Open source:** Give away widget, charge for hosted backend ($19/mo)
- **Acquihire:** Sell team to Intercom/Drift, collect salary instead of equity

---

## Final Verdict

You built a Porsche. Beautiful engineering. Shipped fast. Works perfectly.

But you're giving test drives in a parking lot with no roads, no gas stations, and no one knows you exist.

**This is a science project, not a business.**

Come back when you have 10 paying customers. Then we'll talk about durable value.

---

**Status:** NOT APPROVED FOR FUNDING
**Reason:** No revenue model, no moat, no distribution
**Path to Approval:** Prove unit economics with real paying customers

*"Price is what you pay. Value is what you get. Right now, customers pay nothing and get everything. That's not a business."* — WB
