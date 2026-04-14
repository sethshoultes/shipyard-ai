# ReviewPulse Plugin — First Principles Analysis

## Architecture: What's the simplest system that could work?

The current 2,051-line monolith is over-engineered for v1. Here's what actually matters:

1. **Sync reviews from Google/Yelp** — one API call per source, store in KV
2. **Display widget** — render reviews on frontend
3. **Admin dashboard** — view/filter reviews, mark featured/flagged

That's it. Everything else is v2 scope creep.

The plugin stores reviews in KV with a `reviews:list` array pattern. This is O(n) on every read. For <1000 reviews it's fine. At 10,000+ reviews it's a bottleneck. But that's a v2 problem — no restaurant has 10,000 reviews on day one.

**Keep:** KV storage, Google/Yelp sync, basic CRUD routes, widget rendering.
**Cut:** See below.

## Performance: Where are the bottlenecks?

1. **getAllReviews() is O(n) KV reads** — loops through every review ID, fetches each one. Fine for <500 reviews. At 1000+ this becomes slow (50+ KV reads per request).
2. **Stats computation** — recalculates from scratch on every sync. Cache is TTL'd but sync triggers full recalc.
3. **Email notifications** — sync blocks on sending up to 10 emails sequentially. Should be fire-and-forget.

**10x path:** Batch KV reads, pre-compute stats on write, async email queue. But these are optimizations for proven product-market fit, not day-one concerns.

## Distribution: How does this reach 10,000 users without paid ads?

ReviewPulse is a commodity feature. Every restaurant owner wants review management. The distribution play is:

1. **Bundled with Bella's Bistro template** — every Emdash restaurant site gets it free
2. **SEO widgets** — review schema markup (JSON-LD) improves search rankings. Free traffic.
3. **Integration flywheel** — connect Google Business Profile once, auto-sync forever. Sticky.

The 10,000 user path: Emdash templates get distribution, ReviewPulse is built-in, word spreads through restaurant owner networks. No paid ads needed if the template is good.

## What to CUT (v2 features masquerading as v1)

Looking at the 2,051 lines, here's what's scope creep:

| Feature | Lines | Verdict |
|---------|-------|---------|
| Response templates | ~150 | **CUT** — manual reply works fine |
| Email campaigns | ~200 | **CUT** — this is a marketing tool, not review management |
| Notification emails | ~100 | **CUT** — admin dashboard is sufficient for v1 |
| 30-day trend analysis | ~50 | **KEEP** — tiny, useful for dashboard |
| Manual review creation | ~80 | **CUT** — focus on sync, not manual entry |

**v1 should be:** Sync + Display + Filter. ~800 lines max.

## Technical Feasibility: Can one agent session build this?

**Yes, but only if scoped correctly.**

The PRD says 72 `throw new Response()` patterns and 17 `rc.user` references need fixing. That's mechanical refactoring — an agent can do it.

The real question: does the code work at all? PRD says "never tested against real Emdash." That's the risk. An agent can fix patterns, but can't manually test against live Google/Yelp APIs without credentials.

**Recommendation:** Fix the banned patterns, test against Bella's Bistro with mock data, defer real API integration testing to human QA.

## Scaling: What breaks at 100x usage?

| Current scale | 100x scale | What breaks |
|---------------|------------|-------------|
| 100 reviews | 10,000 reviews | `getAllReviews()` O(n) KV reads |
| 1 sync/day | 100 syncs/day | Google Places API rate limits (50 req/day free) |
| 1 admin user | 100 concurrent | KV write contention on `reviews:list` |
| 10 emails/sync | 1000 emails | Email provider rate limits, queue needed |

**First thing that breaks:** Google Places API has a free tier limit. At 100x, you need Places API billing enabled. This is a business decision, not a code problem.

**Second thing:** The `reviews:list` array pattern breaks. At 10,000 reviews, you need pagination at the storage layer (cursor-based KV keys like `reviews:2024-01`, `reviews:2024-02`).

## Final Verdict

Ship a minimal v1:
- Sync (Google + Yelp)
- Display widget
- Admin filter/view
- Featured/flagged toggles

Cut campaigns, cut templates, cut email notifications, cut manual entry. Those are v2 features for proven product-market fit.

The 72 banned patterns are mechanical fixes. The real risk is untested API integration. Fix the patterns, test with mocks, ship to Bella's Bistro, iterate.
