# SPARK — Locked Decisions

*Consolidated by Phil Jackson, Zen Master*
*Source: Round 1 & 2 Debate — Elon Musk vs. Steve Jobs*

---

## 1. Locked Decisions

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Product name is SPARK** | Steve | Steve (conceded by Elon) | Four letters. One breath. The thing an owner installs, talks about, and checks at midnight is SPARK. "LocalGenius" dies. Company/legal entity can remain LocalGenius. |
| 2 | **One admin screen only** | Elon | Elon (conceded by Steve) | Onboarding + widget on/off toggle. Everything else is API-configurable or lives in Stripe Customer Portal. wp-admin is a utility room, not a museum. Every additional screen is a support vector across 10,000 hosting stacks. |
| 3 | **Static demo, no live scraping** | Elon | Elon (conceded by Steve) | Pre-scrape 100 sites into KV. Serve instantly. Dynamic scraping is a scaling nightmare, CPU burnout, and security liability. The magic is in the *result*, not the mechanism. |
| 4 | **No onboarding wizards / progress bars** | Steve | Steve (conceded by Elon) | No "Step 1 of 4." The feeling is single-field onboarding, not a wizard. Discipline means removing steps, not decorating them. |
| 5 | **No AI badges, sparkle icons, robot illustrations** | Steve | Steve (conceded by Elon) | Taste is a filter, not a feature. No "AI-powered" labels. Speak like a great bartender, not a SaaS manual. |
| 6 | **No Shopify in v1** | Steve | Steve (conceded by Elon) | Focus is a weapon. A WordPress plugin that tries to be a Shopify app ships in neither ecosystem. |
| 7 | **Brand voice: warm, direct, zero jargon** | Steve | Steve (conceded by Elon) | "You're #3 of 47." Not: "You have achieved a competitive ranking within your vertical cohort." Warm, direct, confident. |
| 8 | **Cut account card / billing UI from wp-admin** | Elon | Elon (conceded by Steve) | If quota exceeded, widget shows upgrade message. Everything else lives in Stripe Customer Portal. Don't rebuild billing UI inside WordPress. |
| 9 | **Cut thumbs up/down from SPARK widget** | Elon | Elon (conceded by Steve) | The widget is <10KB. Keep it that way. Helpfulness signals can be inferred from click-through rates. Shipping means knowing when to stop touching the product. |
| 10 | **Cut FAQ reordering UI** | Elon | Elon (conceded by Steve) | Pre-populate 10 FAQs. Toggle on/off only. No drag-and-drop manager. Reordering is a nice-to-have for a product with zero users. |
| 11 | **Pre-computed demo dataset (100 sites)** | Elon | Elon (conceded by Steve) | Curate 100 beautiful previews. Cache in KV forever. Instant load, zero CPU risk. Live URL scraping at request time is a DDoS vector wearing a feature's clothes. |

---

## 2. Zen Master's Rulings (Contested Items)

Where the titans deadlocked, the Zen Master finds the third way:

### Ruling A: The Benchmark Engine Ships in v1 — But It's "Benchmark Lite"
- **Conflict**: Steve called it the soul ("dignity"). Elon called it a leaderboard for a game no one plays ("#1 of 1").
- **Ruling**: The benchmark ships because without "You are #3 of 47," SPARK is a commodity chat widget. However, it is implemented with **broad buckets** (city-level + broad category: Restaurant / Retail / Service) instead of zip-code + cuisine. A suppression rule hides rankings when a bucket has <5 businesses, showing a "You're building something" growth state instead. This preserves dignity while respecting density.
- **Why**: Density follows dignity, but only if the dignity isn't a lie. Steve wins the soul; Elon wins the implementation.

### Ruling B: Brand Color Detection — Simple Meta-Tag, Not Computer Vision
- **Conflict**: Steve wanted auto brand-color detection ("telepathic"). Elon called it CV engineering.
- **Ruling**: Use `theme-color` meta tag or favicon dominant color via a lightweight library. One API call. If neither exists, fall back to **three presets** (light, dark, brand). No OpenGraph image analysis.
- **Why**: 80% of sites have a meta theme-color. We get the love-at-first-sight moment without the six-month film shoot.

### Ruling C: Onboarding — "Zero Form" in Spirit, One Field in Reality
- **Conflict**: Steve demanded zero forms, zero passwords. Elon noted WordPress requires an admin with `install_plugins`, Stripe requires an email, and the API requires a key.
- **Ruling**: The admin screen shows **one field: business URL**. The user is already logged into wp-admin. Everything else pre-populates from the static demo cache or API. One field. One click. The *feeling* is recognition before permission, even if the mechanism requires WordPress auth.
- **Why**: The hook is the shock of being seen. We preserve the emotional impact within technical reality.

### Ruling D: Distribution Is Not v1 Scope, But It Is v1 Blocker
- **Conflict**: Elon demanded a viral loop, SEO flywheel, and designer partnerships before shipping. Steve treated distribution as a consequence of a great product.
- **Ruling**: Distribution mechanics ("Powered by SPARK" badge, public FAQ pages, designer partnerships) are **designed into v1 architecture** (badge toggle, FAQ public permalink structure) but **not built in the first session**. They are Sprint 2, gated by 50 installs.
- **Why**: Beautiful products die in obscurity. But you cannot optimize a viral loop for a product that doesn't exist. Build the bridge first; add the billboards next.

---

## 3. MVP Feature Set (What Ships in v1)

### WordPress Plugin (One Agent Session)
- `spark.php` — main plugin file, minimal bootstrap
- One admin screen: single-field onboarding (URL) + widget on/off toggle
- API client: auth key, config fetch, heartbeat
- Widget loader: injects <10KB SPARK widget via wp_footer
- FAQ module: pre-populated 10 FAQs, toggle on/off (no reordering UI)
- Stripe integration: quota exceeded → widget shows upgrade message → links to Stripe Customer Portal
- Transient caching for API responses (subscription status, config)
- PHP 7.4+ compatibility, WPCS compliance, nonce verification, proper escaping

### Static Demo (Pre-computed)
- 100 restaurant/retail/service websites scraped once
- Stored in Cloudflare KV
- Served instantly by Worker
- Update cadence: manual refresh, not live

### Benchmark Engine Lite (Cloudflare Worker + D1)
- Aggregation cron: weekly, city + broad category buckets
- Suppression logic: hide ranking if bucket <5 businesses
- Fallback state: "You're building something" / growth messaging
- Privacy: pseudonymized; no zip-code-level drilldown in v1

### Brand / Design
- Three widget presets: light, dark, brand-match (via meta-tag detection)
- Admin CSS: clean, fast, no animations that conflict with caching plugins
- Voice: warm, direct, no SaaS jargon

### What Is NOT in v1
- FAQ reordering UI
- Account card / billing dashboard in wp-admin
- Thumbs up/down in widget
- Live URL scraping at request time
- Shopify app
- AI badges, sparkle icons, robot illustrations
- Onboarding wizard / multi-step flows
- Full distribution suite (badge SEO, partnerships — architected but not built)

---

## 4. File Structure

```
spark/
├── spark.php                         # Main plugin file (bootstrap)
├── readme.txt                        # WordPress.org readme
├── LICENSE                           # GPL v2
│
├── admin/
│   ├── class-spark-admin.php         # One-screen admin (onboarding + toggle)
│   ├── css/
│   │   └── spark-admin.css           # Utility-room clean styles
│   └── js/
│       └── spark-admin.js            # Minimal: URL validation, toggle
│
├── includes/
│   ├── class-spark-api.php           # API client (GET/POST, transient caching)
│   ├── class-spark-widget.php        # Widget injection (wp_footer hook)
│   ├── class-spark-faq.php           # FAQ toggle logic (10 items, on/off)
│   └── class-spark-assets.php       # Asset enqueue (wp-admin + frontend)
│
├── assets/
│   └── (compiled/minified admin assets — mirrored from admin/css and admin/js)
│
├── languages/                        # i18n .pot files (WordPress standard)
│
└── vendor/                           # If any Composer deps (keep empty in v1)

cloudflare-workers/
├── demo-worker/
│   ├── src/index.ts                  # KV demo serve + static preview mapping
│   └── wrangler.toml                 # KV namespace binding
│
└── benchmark-worker/
    ├── src/index.ts                  # Weekly cron + aggregation endpoint
    ├── src/aggregate.ts              # D1 GROUP BY logic (broad buckets)
    ├── src/suppress.ts               # <5 business suppression rules
    ├── src/privacy.ts                # Pseudonymization helpers
    └── wrangler.toml                 # D1 database binding

infra/
├── sql/
│   └── benchmark-schema.sql          # D1 table creation (businesses, aggregates, buckets)
├── scripts/
│   └── scrape-demo-batch.ts          # One-time: scrape 100 sites → KV
└── demo-data/
    └── demo-previews.json            # Source of truth for 100 cached previews
```

---

## 5. Open Questions (What Still Needs Resolution)

| # | Question | Context | Urgency |
|---|----------|---------|---------|
| 1 | **How do we populate the first 100 demo sites?** | Manual curation vs. automated batch scrape? Who chooses which sites represent "good" vs. "bad" previews? | High — blocks static demo |
| 2 | **What is the exact D1 schema for broad buckets?** | City-level + 3 categories may still yield empty buckets in rural areas. Do we need state-level fallback? | High — blocks benchmark build |
| 3 | **What does the widget show when quota is exceeded?** | "Upgrade" message design and CTA. Is it disruptive or polite? | Medium — Stripe integration dependency |
| 4 | **Who owns the WordPress.org submission?** | Plugin repo review can take weeks. Do we submit immediately or wait for private beta? | Medium — distribution dependency |
| 5 | **How are API keys provisioned?** | Manual copy-paste from Stripe/portal into wp-admin? Or auto-generated on first API call? | Medium — onboarding flow dependency |
| 6 | **Is there a free tier, and what are its limits?** | Elon mentioned "quota exceeded." What is the free tier cap? This determines the upgrade funnel. | Medium — business model dependency |
| 7 | **GDPR: what is our legal basis for benchmark aggregation?** | Elon flagged deanonymization by exclusion. Do we need explicit consent in the plugin terms? | Low — but scales with user count |
| 8 | **What happens when a business URL isn't in the 100-site demo cache?** | Fallback to generic preview? Or skip the recognition moment? | Low — affects Steve's "zero-form" hook |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Benchmark buckets remain empty** (city-level still too narrow) | Medium | High (core value proposition fails) | Implement state-level fallback; suppress ranking and show "growth" state; monitor fill rates before public launch. |
| **WordPress hosting incompatibility** (PHP 5.6, 128MB memory, caching plugins) | High | Medium (support burden, bad reviews) | Strict PHP 7.4+ check on activation; minimal CSS/JS; no animations; test on 5 shared hosts before release. |
| **One agent session cannot finish MVP** (scope still too large) | Medium | High (nothing ships) | Ruthless enforcement of "one screen" rule; benchmark lite = one aggregation query + one endpoint; pre-scrape demos manually if script fails. |
| **50 installs in 30 days target is missed** | High | High (no density, no data, no dignity) | Lower target to "10 delighted users" if needed; treat first 30 days as feedback loop, not growth loop. |
| **GDPR fine via deanonymization** (small zip codes reveal identities) | Low | High (legal liability) | Ship with broad buckets only; no zip-code-level data in v1; add privacy policy clause; audit aggregation logic. |
| **Static demo becomes stale** (businesses close, websites change) | Medium | Low (diminished "recognition" magic) | Set quarterly refresh cadence post-launch; manual update script; monitor 404 rates in KV. |
| **No distribution engine built** (Sprint 2 never happens) | Medium | High (product dies in obscurity) | Architect badge toggle and public FAQ permalinks in v1 so Sprint 2 is pure content, not infrastructure. |
| **Stripe Customer Portal UX mismatch** (users expect billing inside WordPress) | Medium | Medium (confusion, churn) | Clear copy in widget and admin: "Manage your plan in Stripe"; email receipts; no surprise charges. |
| **Brand color meta-tag detection fails** (no theme-color, complex favicon) | Medium | Low (falls back to presets) | Fallback chain: meta theme-color → favicon dominant → 3 presets. User can override in one click. |
| **D1 weekly cron times out at scale** (10,000+ businesses) | Low (future) | High (benchmark data stale) | Monitor query duration; batch writes; if D1 hits limits, move aggregates to ClickHouse/BigQuery in v2. |

---

## 7. Non-Negotiables for the Build Phase

1. **SPARK is the name.** No committee amendments.
2. **One admin screen.** Onboarding + toggle. If you need a second screen, cut the feature.
3. **Static demo only.** No live scraping. No exceptions.
4. **The widget stays <10KB.** No new database columns for micro-interactions.
5. **Brand voice is warm, direct, and human.** If a sentence contains "leverage," "optimize," or "drive outcomes," rewrite it.
6. **Benchmark ships, but it's Lite.** Broad buckets. Suppression logic. No empty-leaderboard embarrassment.
7. **One agent session builds the WordPress plugin.** If it can't be built in 4-6 hours of coherent context, it doesn't ship in v1.

---

*"The strength of the team is each individual member. The strength of each member is the team."*
*— Phil Jackson*
