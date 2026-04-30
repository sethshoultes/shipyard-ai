# Elon Musk — Round 1 Review

## Architecture

The backend exists. The frontend is a WordPress plugin that calls an API. This is not rocket science — it's a CRUD wrapper in PHP. The proposed architecture is fine. The problem is **feature bloat masquerading as architecture**. A WordPress plugin with an onboarding screen, dashboard, FAQ manager, widget settings, account card, and preview iframe is not "simplest system." It's six products wearing one plugin's clothes.

**Verdict**: Ship a plugin with ONE admin screen: onboarding + toggle widget on/off. Everything else is API-configurable later.

## Performance

The SPARK widget is <10KB. Good. The rest is concerning.

- **D1 aggregation on Sundays at 2 AM**: With 100 businesses this is trivial. With 10,000 businesses, a single Cloudflare Cron doing `GROUP BY` across three joined tables in SQLite will **timeout or get killed**. There's no mention of pagination, batching, or incremental aggregation.
- **Live demo scraping arbitrary URLs**: 5 previews per IP per hour is cute until someone rotates IPs. Scraping is I/O-bound and CPU-bound (parsing HTML). At 100x usage, this Worker will hit CPU limits.
- **WordPress admin making API calls to check subscription status on every page load**: This will make wp-admin feel like molasses.

**10x path**: Don't build a benchmark engine until you have 500+ paying customers. Cache everything in WordPress transients. Make the demo static — pre-scrape 100 popular sites, serve from KV, don't do live scraping.

## Distribution

Target: 50 WordPress installs in 30 days. That's **1.6 installs per day**. That's not a target, that's a rounding error. At that velocity, the benchmark engine will show "#1 of 2" for six months.

The live demo is smart. WordPress.org organic discovery is real. But where is:
- **Viral loop?** Restaurant owners talk to each other. Where's the "Powered by LocalGenius" badge that drives referrals?
- **Content flywheel?** The FAQs you generate are SEO gold. Where's the public FAQ page that ranks on Google?
- **Partnerships?** Web designers who build restaurant sites are the channel. WordPress.org is a graveyard without distribution.

10,000 users without paid ads requires **one** of: (a) product-led viral loop, (b) SEO moat, or (c) channel partnership. This PRD has none of the above.

## What to CUT (Scope Creep Analysis)

**Benchmark Engine: CUT.** This is v2 wearing v1 clothing. The PRD admits the risk: "Benchmark buckets too small (<5 businesses) — Likelihood: High." With a target of 50 installs in 30 days, you won't have 5 Italian restaurants in 60614. You might not have 5 restaurants *total* in 60614. Building a ranking system for empty buckets is building a leaderboard for a game no one plays. Ship it when you have 500+ businesses.

**FAQ Manager with reordering: CUT.** Pre-populate 10 FAQs, let users toggle on/off. Reordering is a nice-to-have for a product that has zero users.

**Widget color theming with brand color detection: CUT.** Three preset colors. Done. Auto-detecting brand colors from OpenGraph images is CV engineering, not product.

**Account Card with subscription status in wp-admin: CUT.** If quota exceeded, widget shows upgrade message. Everything else lives in Stripe Customer Portal. Don't rebuild billing UI inside WordPress.

**Thumbs up/down in SPARK widget: CUT.** The Non-Goals section says "We are NOT redesigning the SPARK widget UI." Then Open Question #2 says "Add thumbs up/down to SPARK widget as part of this PRD." This is scope creep by committee. The helpfulness signal can be inferred from click-through rates and follow-up questions. Don't touch the widget.

**Live demo dynamic scraping: CUT to pre-computed.** Scraping arbitrary URLs at request time is a scaling nightmare and a security risk. Scrape 100 top restaurant websites once, cache in KV forever, serve instantly.

## Technical Feasibility

**Can one agent session build this? No.**

The PRD estimates 1.5M tokens and 4-6 weeks. An agent session is not 4-6 weeks. An agent session is 4-6 hours of coherent context. The WordPress plugin alone — with WPCS compliance, nonce verification, proper escaping, accessibility, and PHP 7.4 compatibility — is 2-3 days of focused work. The benchmark engine's SQL aggregation logic with proper privacy rules, suppression logic, and geography fallback is another 2-3 days. The live demo scraping infrastructure is another day. The integration testing between all three surfaces is another 2 days.

**One agent session can build the WordPress plugin MVP** (onboarding + widget toggle + API client). Everything else is follow-up.

## Scaling

**What breaks at 100x usage?**

1. **D1 write volume**: Cloudflare D1 has [documented limits](https://developers.cloudflare.com/d1/platform/limits/) on writes and query duration. A weekly aggregation job writing benchmark aggregates for 10,000 businesses will likely hit the query timeout. SQLite is not designed for analytical workloads. You will need to move benchmarks to ClickHouse, BigQuery, or at minimum batch the D1 writes.

2. **Demo scraping**: At 100x, live URL scraping becomes a DDoS vector and a CPU burnout. Pre-compute or kill it.

3. **WordPress plugin support**: 10,000 WordPress sites running your plugin means 10,000 different hosting configurations — shared hosting with PHP 5.6 (despite your 7.4+ requirement), aggressive caching plugins, security plugins blocking API calls, and users who will file support requests because their theme conflicts with your CSS. The PRD has zero mention of support infrastructure.

4. **The "moat" becomes a liability**: The benchmark engine's aggregation is pseudonymized, but with enough businesses in a small zip code, you can deanonymize by exclusion ("There's only one Michelin-starred restaurant in this zip, so this must be them"). GDPR fine risk scales with user count.

## Bottom Line

This PRD is two sprints of work dressed up as six. The real v1 is: WordPress plugin with 60-second onboarding + widget toggle + API communication. That's it. The benchmark engine is a fantasy until you have density. The live demo should be static. Cut 70% of the scope, ship in one week, get 50 real installs, then decide if benchmarks matter.

Stop building moats. Build a bridge to the first customer.
