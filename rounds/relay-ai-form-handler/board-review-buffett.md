# Board Review — Relay AI Form Handler
**Director:** Warren Buffett
**Verdict:** Reject as presently scoped. Fix economics or kill it.

---

## Unit Economics
- **CAC:** Near-zero (WP.org organic), but freemium with no paywall means 100% of users acquired at infinite loss.
- **Cost to serve:** Claude Haiku per unique classification. ~$0.001–0.003 per lead. Cache dedupes identical payloads — real-world hit rate near zero because names/emails differ.
- **At 1,000 leads/day:** ~$30–90/month in API burn per free user. No metering. No usage caps. No billing.
- **Relay pays to give away software.** Backwards.

## Revenue Model
- No paid tier in v1. No billing code. No SaaS dashboard. No metered API gating.
- PRD promises "freemium drives volume; paid tiers unlock AI classification" — yet AI classification ships in the free plugin.
- Routing, caching, admin inbox all in GPL plugin. Nothing left to upsell except Slack and CSV.
- This is a hobby with an AWS bill, not a business.

## Competitive Moat
- **Zero.** WordPress plugin calling a third-party API. Replicable by any PHP developer in 48 hours.
- No proprietary data flywheel. Classifications not training a custom model.
- No network effects. No switching costs. GPL means competitors fork freely.
- "Agency scale" pitch is undifferentiated — every plugin claims this.

## Capital Efficiency
- 775K tokens for a free plugin with no revenue mechanism. Excessive polish on a leaky bucket.
- Smart cut: Cloudflare Worker eliminated. Direct PHP-to-Claude saves one deployment target.
- Dumb spend: Admin CSS/JS polish, encrypted key storage, dashboard widget — all cost, no monetization.
- No pre-sales validation. No LOIs. Build-first, price-never.

## Score: 3/10
**Competent engineering. Catastrophic business model.** A product that pays its customers to use it cannot compound shareholder value. Re-scope with paid SaaS metering, or redeploy team to something with pricing attached.
