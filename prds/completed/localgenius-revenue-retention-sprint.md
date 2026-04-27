# PRD — LocalGenius Revenue & Retention Sprint

> Scope-controlled sprint. Frontend redesign is explicitly out of scope. Use existing pricing page HTML and existing email template.

---

## 1. Project Overview

**Project name:** LocalGenius Revenue & Retention Sprint
**Product type:** Feature enhancement (billing + email)
**Target URL/domain:** localgenius.company
**Deadline:** 2026-04-25 (3 days)

---

## 2. Business Context

**What does this business do?**
LocalGenius is AI-powered marketing for local businesses (restaurants). It suggests marketing actions, drafts responses, and schedules posts.

**Who is the target audience?**
Restaurant owners with 1–5 locations. Price-sensitive, time-starved, skeptical of marketing tools.

**What's the primary goal of this sprint?**
1. Increase cash flow predictability by adding annual billing (20% discount)
2. Increase retention by adding month-over-month progress narrative to the existing weekly digest
3. Reduce plan-choice anxiety at signup

---

## 3. Pages / Features

| # | Page/Feature | Description | Priority |
|---|-------------|-------------|----------|
| 1 | Annual Billing Toggle | Add "$278/year (save $70)" radio button to existing `/pricing` page. Existing monthly option remains default. | Must-have |
| 2 | Stripe Annual Plan | Create new Stripe plan: `localgenius-annual-base` at $278/year, `localgenius-annual-pro` at $798/year. Webhook handling identical to monthly. | Must-have |
| 3 | Weekly Digest MoM Line | Query `insight_actions` table for current month vs previous month: reviews_responded, posts_published, avg_engagement_rate. Add 3-line comparison to existing Sunday digest email template. | Must-have |
| 4 | Annual Billing Email | Send "You chose annual — here's what happens next" confirmation with pro-rated upgrade/downgrade logic explained. | Must-have |
| 5 | Pricing Page Annual Toggle UI | Minimal HTML radio group. No new CSS framework. Must match existing brand colors. | Must-have |
| 6 | Dashboard "Time Saved" Teaser | If trivial to add, show "You've saved ~X hours this month" on dashboard using existing action logs. | Nice-to-have |

---

## 4. Design Direction

**Brand colors (hex if available):** Use existing localgenius.company brand colors
**Typography preferences:** Use existing site typography — no new fonts
**Reference sites (URLs of sites you like):** Current `/pricing` page
**Logo / brand assets provided?** [x] Yes (use existing)

---

## 5. Content

**Who provides the copy?** [x] AI generates from business info
**Photos/images:** [x] Use existing
**Blog posts (if applicable):** Count: 0

**Copy Requirements:**
- Pricing page: "$278/year (save $70)" — "Pay annually and get 2 months free"
- Weekly digest line: "Compared to last month: Reviews responded [+/-X], Posts published [+/-X], Engagement [+/-X%]"
- Confirmation email: "Thanks for choosing annual billing. You're all set for 12 months of hands-off marketing."

---

## 6. Integrations

Check all that apply:
- [x] E-commerce (products, cart, checkout) — Stripe subscription
- [ ] Blog / CMS
- [ ] Contact form
- [x] Email newsletter signup — Weekly digest modification
- [ ] Social media links/feeds
- [ ] Analytics (Google Analytics, etc.)
- [x] User authentication / accounts — Existing auth
- [x] Third-party API: Stripe
- [ ] Multi-language: Languages: _______________
- [ ] Search functionality

---

## 7. Must-Haves vs. Nice-to-Haves

**Must-haves (will not ship without these):**
1. Stripe annual plan created and active in production
2. Pricing page radio toggle (monthly vs annual) with correct pricing displayed
3. Weekly digest query against `insight_actions` for 3 MoM metrics
4. Annual billing confirmation email sent on subscription
5. downgrade/upgrade path: annual → monthly prorated credit; monthly → annual immediate charge with proration

**Nice-to-haves (only if tokens allow):**
1. Dashboard "time saved" teaser
2. Annual billing badge on account settings
3. A/B test: annual as default vs monthly as default

---

## 8. Token Budget

_Filled by Shipyard AI during INTAKE — client reviews and approves._

| Item | Tokens |
|------|--------|
| Base package | 1,500 |
| Stripe plan + webhook handling | +500 |
| Email template modification | +300 |
| Query + digest integration | +400 |
| QA + edge cases (proration, cancellation) | +300 |
| **Total budget** | **3,000** |
| Estimated revision credits needed | 500 |

---

## 9. Out of Scope — Explicitly

The following are NOT part of this PRD to avoid scope creep and frontend PRD rejection:

1. **No pricing page redesign.** Use existing HTML structure. Radio button only.
2. **No new landing page sections.** Demo video, testimonials, and "See It In Action" are tracked separately.
3. **No benchmark engine work.** MoM comparison is per-user only, not cross-customer benchmarks.
4. **No referral program.** Deferred to post-annual-billing retention proof.
5. **No middle tier ($49).** Deferred to next revenue cycle.
6. **No new CSS framework.** Existing styles only.

---

## 10. Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Annual plan adoption | 0% | 15% of new signups within 30 days | Stripe subscription counts |
| Weekly digest open rate | Current rate | +10% | Email analytics |
| Weekly digest reply rate | Current rate | +5% | Email analytics |
| Churn reduction (annual cohort) | Monthly churn rate | -30% relative to monthly cohort | Cohort analysis at 90 days |
| Cash flow pull-forward | $0 | 1.5 months equivalent | Revenue recognition |

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Frontend PRD rejection pattern repeats | Medium | High | Explicit no-redesign clause; HTML-only |
| Stripe webhook edge cases (proration, cancellation) | Medium | Medium | Test with Stripe test mode; manual QA on upgrade/downgrade |
| `insight_actions` query performance | Low | Medium | Add index on `(user_id, created_at)` if missing; query limited to last 60 days |
| Annual pricing confusion ("is this a contract?") | Medium | Medium | Copy explicitly states "cancel anytime, prorated refund" |

---

*PRD Owner:* Phil Jackson / Great Minds Board
*Cycle:* IMPROVE-2026-04-22T23-0
*Status:* Ready for INTAKE
