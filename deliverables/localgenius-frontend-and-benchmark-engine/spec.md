# Spec: SPARK Frontend + Benchmark Engine Lite

**Project slug:** `localgenius-frontend-and-benchmark-engine`
**Product name:** SPARK (locked decision #1)
**Status:** READY FOR BUILD
**Sources:** PRD §2, §5, §6, §8, §9 | Decisions §1–§7 | Phase-1 Plan Waves 1–4

---

## 1. Goals

### 1.1 Frontend Goals

| # | Goal | PRD Ref | Decision Override |
|---|------|---------|-------------------|
| G1 | Ship a working WordPress plugin (`spark.zip`) installable via WordPress admin or direct download. | §2 Frontend | Name = SPARK (#1) |
| G2 | Implement sub-60-second onboarding: one field (business URL), auto-detect via static cache, single-screen admin, widget preview. | §2 Frontend, §5.1.2 | One admin screen only (#2); no wizard (#4); one field in spirit (#3, Ruling C) |
| G3 | Provide a static one-click demo: user enters a URL from a pre-computed 100-site cache and sees an instant SPARK widget preview. No signup required. | §2 Frontend, §5.3 | Static demo only (#3, #11); no live scraping |
| G4 | Prepare plugin for WordPress.org submission (readme.txt, WPCS compliance, PHPCS audit, GPL v2 license). | §2 Frontend | Direct download immediately; WP.org submission parallel |

### 1.2 Benchmark Engine Goals

| # | Goal | PRD Ref | Decision Override |
|---|------|---------|-------------------|
| G5 | Build an anonymized data aggregation pipeline from `chat_logs` and `faq_usage` tables. | §2 Benchmark | Broad buckets (city + category) per Ruling A |
| G6 | Generate competitive rankings by broad vertical + city geography. Suppress rankings when a bucket has <5 businesses; show a growth-state message instead. | §2 Benchmark, §5.2.2 | Benchmark Lite — no zip-code drilldown in v1 |
| G7 | Surface benchmarks in the weekly digest and in the widget admin dashboard via a single API endpoint. | §2 Benchmark | One admin screen only (#2) |
| G8 | Ensure GDPR/CCPA compliance: no PII in aggregation, pseudonymized business IDs, opt-out available, minimum bucket size enforced. | §2 Benchmark, §5.2.1 | Broad buckets only; no zip-level data in v1 |

### 1.3 Non-Goals (Explicitly Out of Scope)

- Pulse daily notifications (P1 — separate PRD)
- Milestone badges or shareable OG images (P2)
- Shopify, Squarespace, or non-WordPress platforms (P3)
- Redesign of the SPARK widget UI beyond three color presets
- Live URL scraping at request time for the demo
- FAQ reordering UI (drag-and-drop)
- Account card / billing dashboard inside wp-admin (Stripe Customer Portal only)
- Thumbs up/down in the SPARK widget
- AI badges, sparkle icons, robot illustrations
- Full distribution suite (badge SEO, partnerships — architected but not built)

---

## 2. Implementation Approach

### 2.1 Philosophy (Locked)

1. **SPARK is the name.** No committee amendments.
2. **One admin screen.** Onboarding + toggle. If a feature needs a second screen, cut the feature.
3. **Static demo only.** No live scraping. No exceptions.
4. **The widget stays <10KB.** No new database columns for micro-interactions.
5. **Brand voice is warm, direct, and human.** If a sentence contains "leverage," "optimize," or "drive outcomes," rewrite it.
6. **Benchmark ships, but it's Lite.** Broad buckets. Suppression logic. No empty-leaderboard embarrassment.
7. **One agent session builds the WordPress plugin.** If it can't be built in 4–6 hours of coherent context, it doesn't ship in v1.

### 2.2 WordPress Plugin (PHP 7.4+, WPCS)

**Architecture:** Minimal bootstrap. No Composer dependencies in v1. No React/Webpack.

**Bootstrap flow:**
1. `spark.php` registers activation/deactivation hooks, loads textdomain, instantiates the `SPARK` singleton.
2. `SPARK` singleton (in `includes/class-spark.php`) wires up: `SPARK_Admin`, `SPARK_API`, `SPARK_Widget`, `SPARK_FAQ`, `SPARK_Assets`.
3. On activation: schedule transient cleanup cron. On deactivation: clear cron.

**Admin screen (`admin/class-spark-admin.php`):**
- One screen. Two conceptual zones:
  - **Onboarding zone:** Business URL input. On change/focus-loss, fetch static preview from Cloudflare Worker. Show: detected business name, 10 pre-populated FAQs with toggles, brand-color preset selector (light / dark / detected).
  - **Widget zone:** On/off toggle. Greeting message input. Position selector (bottom-right, bottom-left). Save button.
- Auto-save via AJAX (no page reload). Nonce verification on every request.
- Capability gate: `manage_options`.
- Output escaping: `esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`.

**Widget injection (`includes/class-spark-widget.php`):**
- Hook `wp_footer`. Inject a single `<script>` tag that loads `spark.min.js` from the plugin's `assets/` directory.
- Pass configuration via a `window.SPARK_CONFIG` JSON object (escaped with `wp_json_encode` + `esc_js`).
- Config includes: `apiKey`, `apiBase`, `greeting`, `position`, `theme`, `faqs`.
- If subscription quota is exceeded, override `greeting` with a warm upgrade message and link to Stripe Customer Portal.

**FAQ module (`includes/class-spark-faq.php`):**
- Stores active FAQs in a WordPress option (`spark_active_faqs`).
- On onboarding: fetch 10 FAQ templates from Worker by broad category. Store as inactive by default; user toggles on/off. No reordering.
- Format: JSON array of `{question, answer, enabled}`.

**API client (`includes/class-spark-api.php`):**
- `wp_remote_get` / `wp_remote_post` wrappers to Cloudflare Worker endpoints.
- Transient caching (5-minute TTL) for: subscription status, benchmark data, FAQ templates.
- Auth header: `X-Spark-Key` from plugin option (set during onboarding or manually).
- Endpoints consumed:
  - `GET /detect?url={business_url}` — returns cached preview metadata
  - `GET /faqs?category={category}` — returns FAQ templates
  - `GET /benchmarks?business_id={id}&vertical={v}&geography={city}` — returns rank data
  - `POST /chat` — proxied from widget frontend (CORS handled at Worker)
  - `POST /subscribe` — returns Stripe Customer Portal URL

**Asset loader (`includes/class-spark-assets.php`):**
- Enqueue `spark-admin.css` and `spark-admin.js` only on the SPARK admin screen (`$hook` check).
- Frontend: no CSS/JS enqueued from plugin (widget is self-contained in `spark.min.js`).

### 2.3 Static Demo (Cloudflare Worker + KV)

**Pre-computation:**
- A one-time script (`infra/scripts/scrape-demo-batch.ts`) scrapes 100 restaurant/retail/service websites.
- Output: `infra/demo-data/demo-previews.json` (source of truth).
- Deploy to Cloudflare KV namespace `SPARK_DEMO_CACHE`.

**Worker endpoint (`cloudflare-workers/demo-worker/src/index.ts`):**
- `GET /detect?url={url}` — normalize URL, look up in KV. If miss, return a graceful generic preview (not a live scrape).
- Response includes: `business_name`, `category`, `hours`, `location`, `cuisine_or_type`, `faqs`, `brand_color`.
- Rate limit: 5 previews per IP per hour (Cloudflare Rate Limiting Rules).
- CORS: allow `*` for GET requests (public demo).

**Update cadence:** Manual refresh only. No auto-scraper in v1.

### 2.4 Benchmark Engine Lite (Cloudflare Worker + D1)

**Schema additions (`infra/sql/benchmark-schema.sql`):**
```sql
CREATE TABLE benchmark_aggregates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical TEXT NOT NULL,           -- 'restaurant', 'retail', 'service'
  sub_vertical TEXT,                -- 'italian', 'pizza', 'sushi' (nullable in v1)
  geography TEXT NOT NULL,          -- city name
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  business_count INTEGER DEFAULT 0,
  avg_questions_answered REAL,
  p50_response_time REAL,
  p90_response_time REAL,
  top_faq_patterns TEXT,            -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_benchmarks_lookup
ON benchmark_aggregates(vertical, geography, period_end);
```

**Aggregation job (`cloudflare-workers/benchmark-worker/src/aggregate.ts`):**
- Trigger: Cloudflare Cron Trigger, weekly Sundays at 2 AM UTC.
- Query D1: join `chat_logs`, `faq_usage`, `businesses` where business not opted out.
- Group by: `vertical` + `geography` (city-level). No zip-code grouping in v1.
- Pseudonymize `business_id` with a salted hash (one-way, no cross-reference).
- Suppress: if `business_count < 5`, do not write the row.
- Retention: keep 12 weeks of history for trend calculation.

**Suppression logic (`cloudflare-workers/benchmark-worker/src/suppress.ts`):**
- On `GET /benchmarks`: if no aggregate row exists for the bucket (suppressed or never computed), return:
  ```json
  { "status": "building", "message": "You're building something. Check back soon." }
  ```
- If row exists and `business_count >= 5`: compute rank and return structured response.

**Privacy helpers (`cloudflare-workers/benchmark-worker/src/privacy.ts`):**
- `pseudonymize(id)` — SHA-256 with a weekly rotating salt.
- `isOptedOut(business_id)` — check `businesses.opt_out_benchmarks` boolean.

**API endpoint (`cloudflare-workers/benchmark-worker/src/index.ts`):**
- `GET /benchmarks?business_id=xxx&vertical=restaurant&geography=Chicago`
- Validate params. Look up aggregate for current period. Compute rank from stored data.
- Return:
  ```json
  {
    "rank": 3,
    "total": 47,
    "percentile": 94,
    "score": 87,
    "trend": "up",
    "top_in_bucket": { "avg_questions": 34, "your_questions": 41 }
  }
  ```

### 2.5 Widget Frontend (Vanilla JS, <10KB)

**Files:**
- `spark.js` — compiled/minified from source (see decisions file structure)
- `spark.css` — widget styles

**Behavior:**
- Floating bubble (bottom-right or bottom-left per config).
- Expand/collapse animation (CSS transitions, no JS animation libraries).
- Chat interface: message list, input field, send button, loading state.
- API call to Worker `/chat` endpoint with timeout.
- Three theme presets: `light`, `dark`, `brand`. Brand uses `theme-color` meta tag or favicon dominant color (lightweight library). Fallback to light if detection fails.
- Warm, direct copy. No "AI-powered" labels.

### 2.6 Brand / Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Surface | `#F8FAFC` | Admin background |
| Border | `#E2E8F0` | Admin dividers |
| Text | `#0F172A` | Admin primary text |
| Accent | `#38BDF8` | Links, active states |
| High urgency | `#EF4444` | Errors only |
| Success | `#22C55E` | Confirmations |

**Admin CSS rules:**
- System font stack (Inter-like fallbacks).
- No animations that conflict with caching plugins.
- Contrast ratios meet WCAG AA.

---

## 3. Verification Criteria

### 3.1 WordPress Plugin

| Criterion | How to Prove |
|-----------|--------------|
| Plugin installs without fatal error | `php -l spark.php` and all includes/*.php pass syntax check; activate in WP test env |
| One admin screen only | `grep -c 'add_submenu_page' admin/class-spark-admin.php` must return `0` |
| No live scraping in plugin | `grep -r 'curl\|file_get_contents\|wp_remote_get.*site_url' includes/` must not show on-demand scraping logic |
| Widget injects into wp_footer | Load frontend; view source; assert `spark.min.js` appears before `</body>` |
| Widget config is properly escaped | View source; `window.SPARK_CONFIG` contains no unescaped HTML or user input |
| FAQ toggles persist | Toggle 3 FAQs off in admin; reload admin; assert same 3 are off |
| Transient caching works | Call API twice within 5 minutes; second call must not hit Worker (mock or intercept) |
| Nonce verification on all admin actions | POST to admin AJAX endpoint without nonce; assert `wp_die(-1)` |
| Capability check | Attempt admin screen as subscriber; assert `wp_die('cheatin' uh?)` or redirect |
| PHP 7.4 compatible | No union types, named args, match expressions, `str_contains()` in any PHP file |
| WPCS compliant | Run `phpcs --standard=WordPress` on all `.php` files; zero errors |
| Plugin size | `spark.zip` < 100KB total |

### 3.2 Static Demo

| Criterion | How to Prove |
|-----------|--------------|
| Demo endpoint serves cached data | `curl /detect?url=...` returns JSON in <200ms (KV hit) |
| No live scraping on miss | `curl /detect?url=unknown.example.com` returns generic preview, not a scraped result |
| Rate limiting enforced | 6th request from same IP in 1 hour returns HTTP 429 |
| 100 sites in KV | `wrangler kv:key list --namespace-id=... | wc -l` returns ≥ 100 |
| Demo previews JSON exists | `test -f infra/demo-data/demo-previews.json` |

### 3.3 Benchmark Engine Lite

| Criterion | How to Prove |
|-----------|--------------|
| D1 schema migrated | `wrangler d1 execute` with `benchmark-schema.sql` returns success |
| Aggregation cron runs | Trigger cron manually; assert new rows in `benchmark_aggregates` |
| Suppression works | Query a bucket with 2 businesses; assert no row exists; API returns `status: building` |
| Pseudonymization is one-way | Assert `pseudonymize(id1) === pseudonymize(id1)` and `pseudonymize(id1) !== id1` |
| Opt-out respected | Set `opt_out_benchmarks = 1`; run aggregation; assert business not counted |
| Rank API returns valid JSON | `curl /benchmarks?...` returns JSON matching spec schema; validate with `jq` |
| 12-week retention | Assert rows older than 12 weeks are absent or pruned |
| No PII in aggregates | `grep -i 'name\|email\|phone' benchmark_aggregates` returns nothing (via query) |

### 3.4 Widget Frontend

| Criterion | How to Prove |
|-----------|--------------|
| Bundle size <10KB | `wc -c spark.min.js` + `wc -c spark.min.css` < 10,240 bytes gzipped |
| Renders on 3+ WordPress themes | Test on TwentyTwentyFour, GeneratePress, Astra; assert bubble visible and clickable |
| Three theme presets work | Toggle theme in admin; reload frontend; assert CSS variables change |
| Warm voice — no banned words | `grep -Ei 'leverage|optimize.*outcomes|ai-powered|artificial intelligence' spark.js` returns nothing |
| Responsive on mobile | Viewport 375px wide; assert bubble does not overlap critical content |

---

## 4. Files to Create or Modify

### 4.1 New Files (WordPress Plugin)

| # | Path | Purpose | Approx. Size |
|---|------|---------|--------------|
| 1 | `spark/spark.php` | Main plugin file: headers, activation, singleton loader | 80 LOC |
| 2 | `spark/readme.txt` | WordPress.org readme | 60 lines |
| 3 | `spark/LICENSE` | GPL v2 | standard |
| 4 | `spark/admin/class-spark-admin.php` | One-screen admin: onboarding + widget toggle | 250 LOC |
| 5 | `spark/admin/css/spark-admin.css` | Admin styles | 150 LOC |
| 6 | `spark/admin/js/spark-admin.js` | URL validation, AJAX auto-save, toggle | 120 LOC |
| 7 | `spark/includes/class-spark.php` | Singleton bootstrap | 60 LOC |
| 8 | `spark/includes/class-spark-api.php` | Cloudflare Worker API client + transient cache | 180 LOC |
| 9 | `spark/includes/class-spark-widget.php` | wp_footer script injection + config object | 80 LOC |
| 10 | `spark/includes/class-spark-faq.php` | FAQ toggle logic + template fetch | 100 LOC |
| 11 | `spark/includes/class-spark-assets.php` | Asset enqueue (admin only) | 50 LOC |
| 12 | `spark/assets/js/spark.min.js` | Compiled widget JS (<10KB) | — |
| 13 | `spark/assets/css/spark.min.css` | Compiled widget CSS | — |
| 14 | `spark/languages/spark.pot` | i18n stub | 30 strings |

### 4.2 New Files (Cloudflare Workers — Static Demo)

| # | Path | Purpose | Approx. Size |
|---|------|---------|--------------|
| 15 | `cloudflare-workers/demo-worker/src/index.ts` | KV serve + static preview mapping | 120 LOC |
| 16 | `cloudflare-workers/demo-worker/wrangler.toml` | KV namespace binding | 20 lines |

### 4.3 New Files (Cloudflare Workers — Benchmark)

| # | Path | Purpose | Approx. Size |
|---|------|---------|--------------|
| 17 | `cloudflare-workers/benchmark-worker/src/index.ts` | Weekly cron + aggregation endpoint | 100 LOC |
| 18 | `cloudflare-workers/benchmark-worker/src/aggregate.ts` | D1 GROUP BY logic (broad buckets) | 150 LOC |
| 19 | `cloudflare-workers/benchmark-worker/src/suppress.ts` | <5 business suppression rules | 40 LOC |
| 20 | `cloudflare-workers/benchmark-worker/src/privacy.ts` | Pseudonymization helpers | 30 LOC |
| 21 | `cloudflare-workers/benchmark-worker/wrangler.toml` | D1 database binding | 20 lines |

### 4.4 New Files (Infrastructure & Data)

| # | Path | Purpose | Approx. Size |
|---|------|---------|--------------|
| 22 | `infra/sql/benchmark-schema.sql` | D1 table creation (businesses, aggregates, buckets) | 40 lines |
| 23 | `infra/scripts/scrape-demo-batch.ts` | One-time: scrape 100 sites → KV | 100 LOC |
| 24 | `infra/demo-data/demo-previews.json` | Source of truth for 100 cached previews | 500 lines |

### 4.5 Modified Files

| # | Path | Modification |
|---|------|--------------|
| M1 | `docs/EMDASH-GUIDE.md` | Review only — confirm no Emdash APIs are used (this is a standalone WordPress plugin) |
| M2 | Existing Cloudflare Worker (`localgenius-api.seth-a02.workers.dev` or equivalent) | Add `/detect`, `/faqs`, `/benchmarks`, `/chat`, `/subscribe` routes |
| M3 | Existing D1 database | Execute `benchmark-schema.sql` migration |
| M4 | Existing Stripe Products/Prices | Verify Base ($29/mo) and Pro ($83/mo) exist and are referenced by Worker |

---

## 5. Dependency Map

```
Wave 1 (Parallel) — Infrastructure & Scaffold
  ├─ infra/sql/benchmark-schema.sql  →  D1 migration
  ├─ infra/demo-data/demo-previews.json  →  KV upload
  ├─ spark/spark.php + includes/class-spark.php  →  Plugin bootstrap
  └─ cloudflare-workers/*/wrangler.toml  →  Bindings

Wave 2 (Parallel) — Core Logic
  ├─ spark/includes/class-spark-api.php  →  needs Worker endpoints live
  ├─ spark/includes/class-spark-faq.php  →  needs class-spark-api.php
  ├─ spark/includes/class-spark-widget.php  →  needs class-spark-faq.php
  ├─ cloudflare-workers/demo-worker/src/index.ts  →  needs KV data
  └─ cloudflare-workers/benchmark-worker/src/aggregate.ts  →  needs D1 schema

Wave 3 (Parallel) — Integration & UI
  ├─ spark/admin/class-spark-admin.php  →  needs all includes
  ├─ spark/admin/css/spark-admin.css  →  design tokens
  ├─ spark/admin/js/spark-admin.js  →  needs admin PHP for AJAX URL
  └─ spark/assets/js/spark.min.js + css  →  needs widget PHP for config injection

Wave 4 (Sequential) — Hardening & Packaging
  ├─ i18n wrappers across all PHP
  ├─ PHPCS audit
  ├─ readme.txt finalization
  └─ spark.zip build
```

---

## 6. Risk Mitigations (Build-Time)

| Risk | Mitigation in Build |
|------|---------------------|
| Benchmark buckets remain empty (city too narrow) | Build suppression logic first; test with 2 dummy businesses; confirm "building" message shows |
| WordPress hosting incompatibility (PHP 5.6, memory limits) | Strict PHP 7.4 check on activation; minimal CSS/JS; no animations |
| One session cannot finish MVP | Ruthless enforcement of "one screen" rule; benchmark lite = one aggregation query + one endpoint |
| Static demo becomes stale | Accept stale data for v1; architect quarterly refresh in infra/scripts/ |
| WP.org rejects plugin | Run PHPCS before any commit; follow Plugin Handbook rigorously; keep direct .zip fallback |

---

## 7. Success Metrics (30-Day Check)

| Metric | Target | Verification Method |
|--------|--------|---------------------|
| Plugin installs | 50 | WP.org stats + direct download counter |
| Onboarding completion rate | >60% | Admin opt-in analytics (anonymized) |
| Auto-detection accuracy | >80% | Static cache hit rate on demo page |
| Plugin submitted to WP.org | Yes | SVN tag exists |
| Live demo conversions | >5% | Demo page CTA click-through rate |
| Benchmark buckets live | 3 verticals | D1 query: `COUNT(DISTINCT vertical)` |
| Businesses with benchmark data | 20 | D1 query: `SUM(business_count)` |
| Paying customers | 10 | Stripe dashboard |
| MRR | $290 | Stripe dashboard |
