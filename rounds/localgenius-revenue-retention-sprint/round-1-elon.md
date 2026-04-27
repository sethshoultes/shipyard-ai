# Elon Musk — Round 1 Review

## Architecture
This is embarrassingly simple. Two Stripe plans, a radio button, and a SQL query. Don't overcomplicate it. The existing webhook handler already processes subscriptions—just add `localgenius-annual-base` and `localgenius-annual-pro` price IDs. No new services. No new databases. If you're building microservices for this, you've already failed.

## Performance
The `insight_actions` query is the only new compute. At 10,000 users with ~100 actions/month, that's 1M rows. Trivial for any Postgres instance. The real bottleneck is the weekly digest *send*, not the query. If your email pipeline is synchronous, fix that—but that's pre-existing debt, not this sprint. 10x path: make the digest generation async with a job queue. But for this scope, just add the `(user_id, created_at)` index and move on.

## Distribution
The PRD hand-waves here. Annual billing doesn't attract users—it monetizes existing ones. A weekly digest with MoM stats is retention, not acquisition. To hit 10,000 users without paid ads, you need viral mechanics or channel partnerships. Where's the "Share my stats" button? Where's the referral loop? The PRD explicitly defers referrals. That's fine, but be honest: this sprint adds $0 of new user acquisition. Distribution for this sprint is **zero**.

## What to CUT
Cut the dashboard "time saved" teaser immediately. "If trivial to add" is scope creep dressed as humility—it always takes 3x longer than estimated. Cut the A/B test; you don't have enough traffic for statistical significance. Cut the pro-ration explanation in the confirmation email. Handle proration in Stripe's Customer Portal. Restaurant owners don't read emails; they call support if confused. Cut the annual billing badge—pure v2 vanity.

## Technical Feasibility
One agent session can build this in under 4 hours. Stripe plan creation is API calls. The radio button is 10 lines of HTML. The SQL query is a `GROUP BY DATE_TRUNC`. The email is template interpolation. The "proration logic" is Stripe's built-in proration with `proration_behavior: 'create_prorations'`. Don't reinvent what Stripe already solved.

## Scaling
At 100x usage, two things break: (1) weekly digest generation if it's a single synchronous sweep, and (2) webhook handling without idempotency keys—duplicate subscription events will corrupt your billing state. Stripe webhooks must be idempotent. Emails must be batched. These aren't theoretical; they're table stakes. Fix them now if they don't exist, or 100x usage means 100x support tickets.
