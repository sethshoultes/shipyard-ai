# Round 1 — Elon Musk (Chief Product & Growth)

## The Reality Check

Let's be honest about what we're debating. We have two plugins claiming "v1" status:
- **MemberShip**: ~5,700 lines, Phases 1-4 complete, Phase 5 planned
- **EventDash/Convene**: ~6,400 lines, Phases 1-4 Wave 2 complete, Wave 3 planned

That's 12,000+ lines of code that has been "verified" by reading verification reports that *themselves* haven't been validated against running code. The QA report says "SHIP" but admits Task 12 (Documentation) is "PENDING."

**Question 1: Has anyone actually run this on a live EmDash site?** The decisions.md says "Tested on a live EmDash site (Sunrise Yoga for EventDash, Bella's for MemberShip)" — but where's the evidence?

## Architecture: What's The Simplest System?

The original Round 1 decision was correct: **Stripe as source of truth, D1 for list operations.** But I see no D1 in the current codebase. Everything is still KV. The decisions were made, but were they implemented?

**First principles:** Two plugins that do nearly identical things:
- User registration → Stripe payment → webhook confirmation → KV update → email
- Admin CRUD → list/filter/paginate → dashboard

That's the pattern. Everything else is feature bloat.

**The 10x simpler architecture:**
1. One shared auth module (JWT, currently duplicated)
2. One shared Stripe module (checkout, webhooks, currently duplicated)
3. One shared email module (Resend, currently duplicated)
4. Plugin-specific: only the data model and admin UI

We're shipping two plugins that are 60% identical code.

## Performance: Where Are The Bottlenecks?

**KV list iteration is still the problem.** The verification report claims "Member lookup: O(1) via email hash" — but admin list views still iterate. Phase 4 added "reporting" endpoints. How do those work at 10,000 records?

**The numbers that matter:**
- Stripe webhook processing: 3-5 seconds latency acceptable? No. 500ms or fail.
- Admin dashboard load: < 2 seconds claimed. Prove it with 1,000 members.
- Email sending: Resend has 100/second limits. What happens at a 500-person event?

**10x path:** Background job queue for anything that can be async. Webhook confirms immediately, queues the email. Dashboard fetches paginated data, not full dumps.

## Distribution: Path to 10,000 Users

The PRD is still silent on distribution. This is still a fatal error.

**Reality:** EmDash has how many users today? 100? 500? The plugins are ahead of the market.

**What we should be doing:**
1. Ship one plugin (MemberShip) perfectly. Not two plugins at 80%.
2. Embed it in every EmDash template by default.
3. Get 10 paying customers using it in production before launching the second.

**The anti-pattern we're doing:** Building feature parity with MemberPress/EventBrite for an audience that doesn't exist yet.

## What to CUT

**Phase 5 MemberShip features (all should be cut from v1):**
- Astro admin reporting dashboard → The API exists. Site owners can build their own UI. Defer.
- Multi-step registration forms → 90% of signups are single-form. Defer.
- Integration testing → Should have been done in Phase 2, not Phase 5. This is technical debt, not a feature.

**EventDash Wave 3 (all should be cut from v1):**
- Multi-day events → Single-day events with "Part 1 of 3" in title works fine. Defer.
- CSV import → Manual onboarding for first 50 customers. Learn their needs. Defer.
- Cohort analysis → Zero customers have asked for this. Defer.
- Advanced webhooks with retry → Ship simple webhooks. Add retry when someone complains.

**What to keep for v1:**
- Core payment flows (done)
- Email confirmation (done)
- Admin dashboard (done)
- Basic reporting (done)

## Technical Feasibility

**Can one agent session finish this?** The code exists. The question is validation.

**What's actually blocking ship:**
1. Live deployment on a real EmDash site (not just "test on Sunrise Yoga" — actually do it)
2. 5 real transactions through Stripe (not test mode — production)
3. Webhook failure handling verified (kill the webhook endpoint mid-transaction)

If those three pass, ship. If they don't, we have real work to do.

## What Breaks at 100x

At 100x scale (1,000 → 100,000 operations/day):
1. **KV costs:** $0.50/million reads × 100K reads/day = $1.50/day per site. Acceptable but not efficient.
2. **Stripe API limits:** 100 requests/second. Checkout creates are 2-3 calls each. Max ~35 concurrent checkouts/sec.
3. **Email rate limits:** Resend's free tier is 100/day. Growth plan is 50K/month. Event with 500 attendees eats 1% of monthly quota.
4. **No queue system:** Everything is synchronous. One slow Stripe call blocks the entire request.

**Fix before shipping:** Add a simple queue for emails. Everything else can wait.

## Bottom Line

**We're building Phase 5 features when we haven't validated Phase 2 in production.**

Ship criteria should be:
1. One plugin (MemberShip) deployed to one real customer
2. Three real Stripe transactions completed
3. Webhook failure recovery tested
4. Documentation complete (not "PENDING")

Everything else is procrastination. Stop planning. Start shipping.
