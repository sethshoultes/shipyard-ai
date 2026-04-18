# Warren Buffett — Board Review
**LocalGenius Engagement System (Pulse)**
**Date:** 2026-04-18

---

## Score: 3/10
**Justification:** Features don't generate revenue — they leak CAC through notification costs without monetization path.

---

## Unit Economics

**Customer Acquisition Cost (CAC):**
- Not specified in PRD or spec
- SMS costs: $0.03/notification × 30/month × 10K users = $9K/month operational drain
- Email infrastructure: Resend costs (estimated $500-1K/month at scale)
- Badge image generation: S3/CDN storage + compute (estimated $200-500/month)
- **Operating cost per user:** ~$0.93/month (SMS alone) + email/storage overhead

**Revenue per user:**
- Zero direct revenue from Pulse features
- Conversion target: 5% Base → Pro within 30 days
- Assumes existing Pro pricing model (not documented in PRD)
- **Problem:** If Pro is <$20/month, economics underwater immediately

**LTV calculation missing:**
- No churn rate baseline provided
- No retention improvement quantified in dollars
- Hypothesis: retention ↑ 15% → LTV increases by X% (undefined)
- **Can't evaluate ROI without knowing Pro pricing and existing LTV**

**Verdict:** SMS costs compound monthly. If Pro tier is $15/month and conversion hits 5% target, you're paying $18.60/month in SMS costs to generate $0.75/month in incremental revenue ($15 × 5%). **Economics collapse.**

---

## Revenue Model

**Current state:**
- Pulse is a retention feature, not a revenue product
- Monetization entirely dependent on "inline upgrade prompts" driving Base → Pro conversion

**Upgrade prompt strategy:**
- 6 trigger points (post performance, multi-location, competitor mentions, 90-day streak, milestones)
- Target: 5% conversion within 30 days
- **Problem:** No pricing anchor. If Pro costs $10/month, CAC payback is 25+ months at these conversion rates

**What's missing:**
- Pro tier pricing not in PRD (critical oversight)
- No expansion revenue beyond Base → Pro
- No usage-based pricing (e.g., charge $5/month for SMS notifications)
- No multi-location pricing ladder
- No enterprise/franchise tier

**Competitive context:**
- Toast, Square Marketing, Yelp all monetize via usage or transactions
- LocalGenius monetizes via... unclear subscription model
- **Moat erosion:** If you can't charge for notifications, competitors give them away free (e.g., Yelp sends review alerts for free)

**Verdict:** This is a cost center disguised as a growth feature. Inline prompts won't offset SMS burn rate unless Pro pricing is $30+/month **and** you hit 10%+ conversion (not 5%).

---

## Competitive Moat

**What's defensible:**
- Business Journal (proprietary labeled training data) — Jensen's endorsement valid
- Journal entries create switching costs (data portability friction)
- If users invest 52 weeks of journal entries, migration cost ≠ trivial

**What's not defensible:**
- Daily notifications: Toast does this. Yelp does this. Square does this.
- Milestone badges: Gamification 101. Duolingo cloned in 48 hours.
- Trend narratives: WoW deltas are SQL window functions. Commoditized.
- Cliffhanger copy: Clever writing ≠ moat. Competitors hire copywriters.

**Time to clone:**
- Notification infrastructure: 1 week (Twilio + Resend boilerplate)
- Badge system: 3 days (achievements table + confetti library)
- Trend narratives: 2 days (SQL + templating)
- **Total clone time:** 2-3 weeks for competent team

**Durable advantage test:**
- Remove Business Journal → moat evaporates
- Journal alone doesn't justify $9K/month SMS spend
- **Verdict:** Moat depends entirely on one feature (Journal) that users may ignore (target 40% completion rate = 60% don't engage)

---

## Capital Efficiency

**Development spend:**
- Spec estimates 900 lines of new code
- 14-day timeline with 3 engineers (42 engineer-days)
- Assuming $150/hour blended rate = ~$50K development cost
- **One-time cost:** $50K

**Ongoing operational costs (annual):**
- SMS (10K users, 30 notifications/month): $108K/year
- Email (Resend at scale): $6-12K/year
- Storage/CDN (badge images): $3-6K/year
- Monitoring/alerting infrastructure: $2-4K/year
- **Annual operating cost:** $119-130K/year

**Payback analysis:**
- Must convert 247 users to Pro at $40/month to break even in Year 1 ($50K dev + $120K ops = $170K ÷ $40/mo × 12mo)
- At 5% conversion and 10K users: 500 conversions → $240K annual revenue
- **Gross margin after Pulse costs:** $240K - $130K = $110K (54% margin)
- If Pro tier is $20/month: $120K revenue - $130K costs = **net loss**

**Alternative capital allocation:**
- $50K buys 8 weeks of sales hiring (2 reps × $75K salary ÷ 12 months × 2)
- Sales reps at 10 deals/month × 2 reps × 8 weeks = 160 new customers
- Customer value at $20/month × 12 months = $38,400 Year 1 revenue
- **ROI comparison:** Sales hiring returns 6.8x ($38K ÷ $50K × 9 months), Pulse returns 2.2x ($110K ÷ $50K but only if Pro is $40/month)

**Verdict:** Capital inefficient unless Pro pricing ≥ $35/month and conversion ≥ 7%. Better ROI: invest in sales team or reduce churn via customer success hires.

---

## What I'd Fix

**Immediate changes:**
1. **Gate SMS behind Pro tier.** Free tier gets email only. SMS costs justify Pro pricing increase to $29/month.
2. **Add usage-based pricing.** Charge $5/month per additional location for multi-location users (franchise revenue).
3. **Monetize badges.** Charge $10 one-time fee to unlock "premium" shareable badge designs (vanity revenue, high margin).
4. **Test pricing before build.** Run fake door test: show upgrade prompt with $29/month price, measure click-through. If <3%, feature won't pay for itself.
5. **Cut scope to Journal-only MVP.** Ship Business Journal as standalone feature. Defer notifications/badges until Journal completion rate proves engagement hypothesis (40%+ target). Costs $10K to build, zero operational overhead.

**Strategic question:**
- What's current churn rate and why are users leaving?
- If churn is due to "not seeing value," notifications won't fix that — product depth will.
- If churn is due to "too expensive," adding $130K/year in costs makes problem worse.

---

## Red Flags

1. **No pricing model in PRD.** Can't evaluate unit economics without knowing Pro tier price.
2. **SMS costs scale linearly with users.** No economies of scale. At 100K users, you're spending $1.08M/year on SMS.
3. **5% conversion assumption unvalidated.** Industry benchmark for freemium SaaS is 2-4%. Assuming 5% is optimistic without A/B test data.
4. **"Inline upgrade prompts" under-spec'd.** Section 4.6 lists triggers but no copy, no A/B test plan, no conversion funnel tracking.
5. **Badge share rate target (10%) unrealistic.** Duolingo's badge share rate is 3-5% among highly engaged users. Restaurant owners sharing "50 reviews managed" badges to Instagram? Skeptical.
6. **Journal completion target (40%) unproven.** If actual rate is 15%, moat disappears and you're left with expensive gamification.

---

## What I Like

1. **Business Journal creates proprietary data moat** — if users engage.
2. **Cliffhanger concept is clever** — builds anticipation, uncommon in B2B SaaS.
3. **Trend narratives improve digest readability** — low-cost, high-value enhancement.
4. **First-run experience focus** — "30-second dopamine hit or fail" prevents empty-state churn.

---

## Bottom Line

You're building a $170K feature set (Year 1 fully-loaded cost) to drive 5% conversion on an undefined pricing model.

**This is a bet, not a business.**

If Pro tier is $40/month and you hit 7% conversion, economics work. If Pro is $20/month or conversion is 3%, you're subsidizing engagement at a loss.

**My recommendation:** Shelve notifications and badges. Ship Journal as standalone feature for $10K build cost. Measure completion rate for 8 weeks. If ≥30%, revisit notification strategy with usage-based pricing. If <20%, kill project and reallocate capital to sales or product depth.

**Durable businesses don't rely on gamification to mask weak product-market fit.**

---

**Warren Buffett**
Board Member, Great Minds Agency
"Price is what you pay. Value is what you get."
