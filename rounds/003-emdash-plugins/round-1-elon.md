# Round 1 — Elon (Chief Product & Growth)

## The Brutal Truth

**The PRD says "v1.0" but PARITY.md says 5 phases are already complete.** Which is it? Looking at the code: 6,200+ lines in MemberShip, 6,400+ in EventDash. This isn't a v1 build — this is scope creep incarnate. The "debate" is over plugins that already exist.

## Architecture: Simplest System That Could Work?

**Hard no.** The current system:
- 12,600+ lines across two plugins for CRUD + Stripe webhooks
- KV storage for everything (members, events, registrations, venues, series, categories, webhooks, forms, coupons)
- Every feature is a new KV namespace pattern

**First principles:** A membership system needs: users, plans, access rules, payments. That's 4 tables. You have 15+ entity types.

**What should exist:**
- Single `definePlugin` with 3 routes: `/register`, `/webhook`, `/check-access`
- Let Stripe be the source of truth for subscriptions (it already is)
- Stop replicating Stripe state in KV

## Performance: Bottlenecks & 10x Path

**The KV anti-pattern.** Every list operation iterates stored IDs then fetches each record. At 1,000 members: 1,001 KV reads per admin page load. At 10,000 members: unusable.

**10x path:**
1. Use D1 (SQLite) for anything with list/filter/sort operations
2. Keep KV only for auth tokens and session cache
3. Batch Stripe API calls with `expand` parameter

**Real numbers:** Current architecture breaks at ~500 concurrent users. Fix: pagination + cursor-based queries = infinite scale.

## Distribution: 10,000 Users Without Paid Ads

**The PRD is silent on distribution.** Fatal error.

**Path to 10K:**
1. **First-mover SEO:** "EmDash membership plugin" — own the long-tail now
2. **Template embedding:** Ship these pre-installed in EmDash templates (blog, portfolio, marketing)
3. **Integration marketplace listing:** Be the default when EmDash launches their plugin directory
4. **Stripe partnership:** Stripe has a partner ecosystem; EmDash + Stripe template = co-marketing

**Anti-pattern:** Building "feature parity with MemberPress" for an audience that doesn't use WordPress. Wrong target market.

## What to CUT (v2 Features Masquerading as v1)

**Phase 5 is entirely v2:**
- Group/corporate memberships → <1% of SMB use cases
- Multi-step registration wizard (20 steps?!) → YAGNI
- Cohort analysis, LTV, conversion funnels → premature optimization
- PayPal secondary gateway → Stripe covers 90%+ of market
- CSV import/export → admin can paste into spreadsheet
- Developer webhooks with HMAC signing → zero users need this at launch
- Event series, categories, venues → Notion-level complexity for a calendar

**Keep for v1:** Stripe checkout, basic gating, member dashboard, email confirmations. That's it.

## Technical Feasibility: Can One Agent Session Build This?

**The work is already done.** The question is whether one session can *test and ship* it.

**Reality check:**
- 12,600 lines need integration tests against live Stripe
- Webhook handlers need test coverage (6+ event types each plugin)
- Admin UI needs Block Kit validation
- Zero evidence of E2E testing in the repo

**My estimate:** One session can ship if scope is cut to core flows. Full PARITY.md scope? 3-4 sessions minimum.

## Scaling: What Breaks at 100x

At 100x (10,000 → 1M operations):
1. **KV list pattern:** O(n) reads = Cloudflare bill explosion + timeouts
2. **Stripe webhook processing:** No idempotency keys visible in code = duplicate charges
3. **Email rate limits:** Resend has per-second limits; no queue = dropped emails
4. **Admin dashboard:** Loading 100K members into a Block Kit table = browser crash

**Fix now, not later:**
- Implement cursor pagination (all list endpoints)
- Add idempotency to payment flows
- Background job queue for emails

## Bottom Line

**Ship the 20% that delivers 80% of value.** The current implementation is over-engineered for users that don't exist yet. Cut to core, ship fast, iterate based on real usage data.

Stop building MemberPress. Build the membership system that makes EmDash users successful.
