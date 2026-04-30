# SPARK Build — Running To-Do List

**Rules:**
- One task active at a time.
- Each task must be completable in <5 minutes.
- Each task has a verification step.
- If a task fails verification, do not check it off. Fix and re-verify.

---

## Wave 1 — Infrastructure & Scaffold

### 1.1 D1 Schema

- [ ] Create `infra/sql/benchmark-schema.sql` with `benchmark_aggregates` table and index — verify: `grep -q 'CREATE TABLE benchmark_aggregates' infra/sql/benchmark-schema.sql`
- [ ] Add `businesses.opt_out_benchmarks` column migration to schema — verify: `grep -q 'opt_out_benchmarks' infra/sql/benchmark-schema.sql`
- [ ] Run schema against local/remote D1 — verify: `wrangler d1 execute` returns "Commands executed successfully"

### 1.2 Demo Data

- [ ] Create `infra/demo-data/demo-previews.json` with 3 sample records — verify: `jq '. | length' infra/demo-data/demo-previews.json` returns ≥ 3
- [ ] Add 97 more sample records to reach 100 total — verify: `jq '. | length' infra/demo-data/demo-previews.json` returns 100
- [ ] Validate every record has required keys (business_name, category, faqs, brand_color) — verify: `jq 'map(has("business_name") and has("category") and has("faqs") and has("brand_color")) | all' infra/demo-data/demo-previews.json` returns true

### 1.3 Plugin Bootstrap

- [ ] Create `spark/spark.php` with WordPress plugin headers — verify: `grep -q 'Plugin Name: SPARK' spark/spark.php`
- [ ] Add `register_activation_hook` that schedules transient cleanup cron — verify: `grep -q 'register_activation_hook' spark/spark.php`
- [ ] Add `register_deactivation_hook` that clears cron — verify: `grep -q 'register_deactivation_hook' spark/spark.php`
- [ ] Create `spark/includes/class-spark.php` singleton with `instance()` method — verify: `grep -q 'public static function instance' spark/includes/class-spark.php`
- [ ] Wire singleton to `plugins_loaded` at priority 10 — verify: `grep -q "add_action( 'plugins_loaded'" spark/spark.php`
- [ ] Verify zero PHP syntax errors in bootstrap — verify: `php -l spark/spark.php && php -l spark/includes/class-spark.php` exits 0

### 1.4 Wrangler Configs

- [ ] Create `cloudflare-workers/demo-worker/wrangler.toml` with KV binding `SPARK_DEMO_CACHE` — verify: `grep -q 'SPARK_DEMO_CACHE' cloudflare-workers/demo-worker/wrangler.toml`
- [ ] Create `cloudflare-workers/benchmark-worker/wrangler.toml` with D1 binding — verify: `grep -q 'database_name' cloudflare-workers/benchmark-worker/wrangler.toml`
- [ ] Deploy demo Worker — verify: `wrangler deploy` for demo-worker returns success
- [ ] Deploy benchmark Worker — verify: `wrangler deploy` for benchmark-worker returns success

---

## Wave 2 — Core Logic

### 2.1 API Client

- [ ] Create `spark/includes/class-spark-api.php` with `SPARK_API` class — verify: `grep -q 'class SPARK_API' spark/includes/class-spark-api.php`
- [ ] Implement `request($endpoint, $method, $body)` wrapper using `wp_remote_get`/`wp_remote_post` — verify: `grep -q 'wp_remote_get' spark/includes/class-spark-api.php`
- [ ] Add transient caching helper `get_cached($key, $callback, $ttl = 300)` — verify: `grep -q 'get_transient' spark/includes/class-spark-api.php`
- [ ] Add `get_detect_preview($url)` method — verify: `grep -q 'function get_detect_preview' spark/includes/class-spark-api.php`
- [ ] Add `get_faqs($category)` method — verify: `grep -q 'function get_faqs' spark/includes/class-spark-api.php`
- [ ] Add `get_benchmarks($params)` method — verify: `grep -q 'function get_benchmarks' spark/includes/class-spark-api.php`
- [ ] Verify PHP syntax — verify: `php -l spark/includes/class-spark-api.php` exits 0

### 2.2 FAQ Module

- [ ] Create `spark/includes/class-spark-faq.php` with `SPARK_FAQ` class — verify: `grep -q 'class SPARK_FAQ' spark/includes/class-spark-faq.php`
- [ ] Implement `get_templates($category)` that calls API and returns 10 FAQs — verify: `grep -q 'function get_templates' spark/includes/class-spark-faq.php`
- [ ] Implement `get_active()` that reads `spark_active_faqs` option — verify: `grep -q "get_option( 'spark_active_faqs'" spark/includes/class-spark-faq.php`
- [ ] Implement `save_active($faqs)` that writes option as JSON — verify: `grep -q "update_option( 'spark_active_faqs'" spark/includes/class-spark-faq.php`
- [ ] Verify PHP syntax — verify: `php -l spark/includes/class-spark-faq.php` exits 0

### 2.3 Widget Injector

- [ ] Create `spark/includes/class-spark-widget.php` with `SPARK_Widget` class — verify: `grep -q 'class SPARK_Widget' spark/includes/class-spark-widget.php`
- [ ] Add `wp_footer` hook that injects `window.SPARK_CONFIG` — verify: `grep -q 'wp_footer' spark/includes/class-spark-widget.php`
- [ ] Escape config with `wp_json_encode` + `esc_js` — verify: `grep -q 'wp_json_encode' spark/includes/class-spark-widget.php && grep -q 'esc_js' spark/includes/class-spark-widget.php`
- [ ] Add quota-exceeded override: if over limit, inject upgrade message in greeting — verify: `grep -q 'quota' spark/includes/class-spark-widget.php`
- [ ] Verify PHP syntax — verify: `php -l spark/includes/class-spark-widget.php` exits 0

### 2.4 Asset Loader

- [ ] Create `spark/includes/class-spark-assets.php` with `SPARK_Assets` class — verify: `grep -q 'class SPARK_Assets' spark/includes/class-spark-assets.php`
- [ ] Enqueue `spark-admin.css` and `spark-admin.js` only on SPARK admin page — verify: `grep -q 'admin_enqueue_scripts' spark/includes/class-spark-assets.php`
- [ ] Verify PHP syntax — verify: `php -l spark/includes/class-spark-assets.php` exits 0

### 2.5 Demo Worker

- [ ] Create `cloudflare-workers/demo-worker/src/index.ts` with fetch handler — verify: `grep -q 'export default' cloudflare-workers/demo-worker/src/index.ts`
- [ ] Implement `GET /detect` route that reads KV — verify: `grep -q '/detect' cloudflare-workers/demo-worker/src/index.ts`
- [ ] Add generic preview fallback for unknown URLs — verify: `grep -q 'generic' cloudflare-workers/demo-worker/src/index.ts`
- [ ] Add rate-limit response (HTTP 429) logic — verify: `grep -q '429' cloudflare-workers/demo-worker/src/index.ts`
- [ ] Deploy and test with curl — verify: `curl -s -o /dev/null -w "%{http_code}" "https://demo-worker/deployed-url/detect?url=test"` returns 200 or 404 (if no binding yet)

### 2.6 Benchmark Worker — Aggregation

- [ ] Create `cloudflare-workers/benchmark-worker/src/aggregate.ts` with `runAggregation(env)` — verify: `grep -q 'runAggregation' cloudflare-workers/benchmark-worker/src/aggregate.ts`
- [ ] Write D1 query that groups by vertical + geography — verify: `grep -q 'GROUP BY' cloudflare-workers/benchmark-worker/src/aggregate.ts`
- [ ] Insert into `benchmark_aggregates` with weekly period boundaries — verify: `grep -q 'benchmark_aggregates' cloudflare-workers/benchmark-worker/src/aggregate.ts`
- [ ] Verify TypeScript syntax — verify: `npx tsc --noEmit cloudflare-workers/benchmark-worker/src/aggregate.ts` exits 0 (or `tsc` equivalent)

### 2.7 Benchmark Worker — Suppression

- [ ] Create `cloudflare-workers/benchmark-worker/src/suppress.ts` with `shouldSuppress(row)` — verify: `grep -q 'shouldSuppress' cloudflare-workers/benchmark-worker/src/suppress.ts`
- [ ] Return `true` when `business_count < 5` — verify: `grep -q 'business_count' cloudflare-workers/benchmark-worker/src/suppress.ts`
- [ ] Verify TypeScript syntax — verify: `npx tsc --noEmit cloudflare-workers/benchmark-worker/src/suppress.ts` exits 0

### 2.8 Benchmark Worker — Privacy

- [ ] Create `cloudflare-workers/benchmark-worker/src/privacy.ts` with `pseudonymize(id, salt)` — verify: `grep -q 'pseudonymize' cloudflare-workers/benchmark-worker/src/privacy.ts`
- [ ] Use SHA-256 with weekly rotating salt — verify: `grep -q 'SHA-256\|crypto.subtle.digest' cloudflare-workers/benchmark-worker/src/privacy.ts`
- [ ] Verify TypeScript syntax — verify: `npx tsc --noEmit cloudflare-workers/benchmark-worker/src/privacy.ts` exits 0

### 2.9 Benchmark Worker — Router

- [ ] Create `cloudflare-workers/benchmark-worker/src/index.ts` with cron trigger handler — verify: `grep -q 'scheduled' cloudflare-workers/benchmark-worker/src/index.ts`
- [ ] Wire `runAggregation` to Sunday 2 AM UTC cron — verify: `grep -q 'runAggregation' cloudflare-workers/benchmark-worker/src/index.ts`
- [ ] Add `GET /benchmarks` route — verify: `grep -q '/benchmarks' cloudflare-workers/benchmark-worker/src/index.ts`
- [ ] Return suppression message when no aggregate exists — verify: `grep -q 'building' cloudflare-workers/benchmark-worker/src/index.ts`
- [ ] Return rank JSON when aggregate exists — verify: `grep -q 'rank' cloudflare-workers/benchmark-worker/src/index.ts`
- [ ] Deploy and test — verify: `curl -s "https://benchmark-worker/deployed-url/benchmarks?business_id=1&vertical=restaurant&geography=Chicago" | jq -e '.rank or .status'` exits 0

---

## Wave 3 — Integration & UI

### 3.1 Admin Screen PHP

- [ ] Create `spark/admin/class-spark-admin.php` with `SPARK_Admin` class — verify: `grep -q 'class SPARK_Admin' spark/admin/class-spark-admin.php`
- [ ] Register top-level menu page with `manage_options` capability — verify: `grep -q "add_menu_page" spark/admin/class-spark-admin.php`
- [ ] Ensure zero submenu pages registered — verify: `grep -c 'add_submenu_page' spark/admin/class-spark-admin.php` returns 0
- [ ] Render onboarding zone: URL input + fetch preview button — verify: `grep -q 'url' spark/admin/class-spark-admin.php`
- [ ] Render widget zone: on/off toggle, greeting input, position selector — verify: `grep -q 'toggle\|greeting\|position' spark/admin/class-spark-admin.php`
- [ ] Render 10 FAQ toggles from API templates — verify: `grep -q 'faq\|template' spark/admin/class-spark-admin.php`
- [ ] Add `wp_nonce_field` to form — verify: `grep -q 'wp_nonce_field' spark/admin/class-spark-admin.php`
- [ ] Verify capability check at top of screen handler — verify: `grep -q "current_user_can( 'manage_options' )" spark/admin/class-spark-admin.php`
- [ ] Verify PHP syntax — verify: `php -l spark/admin/class-spark-admin.php` exits 0

### 3.2 Admin AJAX Handlers

- [ ] Add `wp_ajax_spark_save_settings` handler in admin class — verify: `grep -q 'wp_ajax_spark_save_settings' spark/admin/class-spark-admin.php`
- [ ] Add `wp_ajax_spark_fetch_preview` handler — verify: `grep -q 'wp_ajax_spark_fetch_preview' spark/admin/class-spark-admin.php`
- [ ] Validate nonce in every AJAX handler — verify: `grep -q 'check_ajax_referer' spark/admin/class-spark-admin.php`
- [ ] Return JSON response with `wp_send_json_success` / `wp_send_json_error` — verify: `grep -q 'wp_send_json' spark/admin/class-spark-admin.php`

### 3.3 Admin CSS

- [ ] Create `spark/admin/css/spark-admin.css` with design tokens — verify: `grep -q '#F8FAFC' spark/admin/css/spark-admin.css`
- [ ] Style onboarding zone: URL input, preview card, confirm button — verify: `grep -q 'preview\|url-input' spark/admin/css/spark-admin.css`
- [ ] Style widget zone: toggle switch, greeting input, position dropdown — verify: `grep -q 'toggle\|greeting' spark/admin/css/spark-admin.css`
- [ ] Style FAQ toggles: checkbox list with question text — verify: `grep -q 'faq-toggle\|faq-list' spark/admin/css/spark-admin.css`
- [ ] Ensure no animations that conflict with caching plugins — verify: `grep -c 'animation\|transition' spark/admin/css/spark-admin.css` returns 0 or only subtle transitions
- [ ] Validate CSS with `csstree` or basic parse — verify: `node -e "require('fs').readFileSync('spark/admin/css/spark-admin.css','utf8'); console.log('OK')"` (or any CSS validator) exits 0

### 3.4 Admin JS

- [ ] Create `spark/admin/js/spark-admin.js` with IIFE or vanilla JS — verify: `test -f spark/admin/js/spark-admin.js`
- [ ] Add URL validation (basic scheme + hostname) — verify: `grep -q 'URL\|hostname' spark/admin/js/spark-admin.js`
- [ ] Add AJAX fetch-preview on URL input blur — verify: `grep -q 'fetchPreview\|fetch_preview' spark/admin/js/spark-admin.js`
- [ ] Add auto-save on toggle change (debounced 500ms) — verify: `grep -q 'setTimeout\|debounce' spark/admin/js/spark-admin.js`
- [ ] Add nonce to every AJAX request — verify: `grep -q 'nonce' spark/admin/js/spark-admin.js`
- [ ] Verify no banned words in UI strings — verify: `grep -Eci 'leverage|optimize.*outcomes|ai-powered' spark/admin/js/spark-admin.js` returns 0

### 3.5 Widget JS

- [ ] Create `spark/assets/js/spark.js` (source, unminified) — verify: `test -f spark/assets/js/spark.js`
- [ ] Render floating bubble at configured position — verify: `grep -q 'bubble\|position' spark/assets/js/spark.js`
- [ ] Expand/collapse chat interface on bubble click — verify: `grep -q 'expand\|collapse\|toggle' spark/assets/js/spark.js`
- [ ] Send message to Worker `/chat` endpoint with timeout — verify: `grep -q '/chat\|timeout' spark/assets/js/spark.js`
- [ ] Display loading state while waiting for response — verify: `grep -q 'loading\|spinner' spark/assets/js/spark.js`
- [ ] Apply theme preset (light/dark/brand) from config — verify: `grep -q 'theme\|light\|dark\|brand' spark/assets/js/spark.js`
- [ ] Minify to `spark.min.js` — verify: `test -f spark/assets/js/spark.min.js`
- [ ] Verify widget bundle <10KB gzipped — verify: `gzip -c spark/assets/js/spark.min.js | wc -c` < 10240

### 3.6 Widget CSS

- [ ] Create `spark/assets/css/spark.css` (source) — verify: `test -f spark/assets/css/spark.css`
- [ ] Style bubble: fixed position, z-index, border-radius — verify: `grep -q 'position: fixed\|border-radius' spark/assets/css/spark.css`
- [ ] Style chat interface: message list, input, send button — verify: `grep -q 'message\|input\|send' spark/assets/css/spark.css`
- [ ] Add responsive breakpoint for mobile (<768px) — verify: `grep -q '@media' spark/assets/css/spark.css`
- [ ] Minify to `spark.min.css` — verify: `test -f spark/assets/css/spark.min.css`

### 3.7 i18n Stubs

- [ ] Create `spark/languages/spark.pot` with header — verify: `grep -q 'Project-Id-Version' spark/languages/spark.pot`
- [ ] Add `load_plugin_textdomain` call in `spark.php` — verify: `grep -q 'load_plugin_textdomain' spark/spark.php`
- [ ] Wrap all user-visible strings in `__()` or `esc_html__()` — verify: `grep -c '__(' spark/spark.php` is > 0

---

## Wave 4 — Hardening & Packaging

### 4.1 Security Audit

- [ ] Add `current_user_can('manage_options')` bail-out to every admin callback — verify: `grep -c "current_user_can( 'manage_options' )" spark/admin/class-spark-admin.php` ≥ 1
- [ ] Verify every REST/AJAX endpoint has permission callback — verify: `grep -c 'permission_callback\|check_ajax_referer' spark/admin/class-spark-admin.php` ≥ 1
- [ ] Escape every `echo` with `esc_html`, `esc_attr`, `esc_url`, or `wp_kses_post` — verify: manual scan of all PHP files; zero raw `echo $_GET` or `echo $_POST` patterns
- [ ] Sanitize every `$_GET`, `$_POST`, `$_REQUEST` access — verify: `grep -rn '$_GET\|$_POST\|$_REQUEST' spark/` and confirm each is wrapped in `sanitize_*`
- [ ] Verify all forms use `wp_nonce_field` and `check_admin_referer` — verify: `grep -c 'wp_nonce_field' spark/admin/class-spark-admin.php` ≥ 1

### 4.2 PHP Compatibility

- [ ] Audit for PHP 7.4+ compatibility: no union types — verify: `grep -r ': \?int\|: \?string\|: \?array' spark/` returns nothing (excluding comments)
- [ ] No named arguments — verify: `grep -r '[a-zA-Z_][a-zA-Z0-9_]*:' spark/` returns nothing outside arrays
- [ ] No match expressions — verify: `grep -r 'match (' spark/` returns nothing
- [ ] No `str_contains()` — verify: `grep -r 'str_contains' spark/` returns nothing
- [ ] Run `php -l` recursively — verify: `find spark -name '*.php' -exec php -l {} \;` returns "No syntax errors" for every file

### 4.3 WPCS Compliance

- [ ] Run PHPCS with WordPress ruleset on all PHP files — verify: `phpcs --standard=WordPress spark/` returns zero errors
- [ ] Fix any PHPCS warnings (zero tolerance for errors; warnings acceptable if justified) — verify: `phpcs --standard=WordPress spark/ | grep -c 'ERROR'` returns 0

### 4.4 WordPress.org Readiness

- [ ] Create `spark/readme.txt` with standard headers — verify: `grep -q '=== SPARK ===' spark/readme.txt`
- [ ] Add short description, long description, installation, FAQ, changelog — verify: `grep -q 'Description\|Installation\|Changelog' spark/readme.txt`
- [ ] Add GPL v2 `LICENSE` file — verify: `test -f spark/LICENSE && grep -q 'GNU GENERAL PUBLIC LICENSE' spark/LICENSE`
- [ ] Build `spark.zip` — verify: `zip -r spark.zip spark/` creates file > 1KB
- [ ] Verify zip size < 100KB — verify: `wc -c spark.zip` < 102400
- [ ] Verify zip installs in WordPress without fatal error — verify: manual install in test env; plugin activates

### 4.5 Final QA

- [ ] Test widget renders on TwentyTwentyFour theme — verify: visit frontend; bubble is visible and clickable
- [ ] Test widget renders on GeneratePress theme — verify: visit frontend; bubble is visible and clickable
- [ ] Test widget renders on Astra theme — verify: visit frontend; bubble is visible and clickable
- [ ] Test onboarding flow end-to-end: enter URL → see preview → toggle FAQs → activate widget — verify: complete in <60 seconds timer
- [ ] Test benchmark suppression: bucket with 2 businesses shows "building" message — verify: API response contains `"status": "building"`
- [ ] Test benchmark ranking: bucket with 10 businesses shows rank JSON — verify: API response contains `"rank"` and `"total"`
- [ ] Test quota exceeded: widget shows upgrade message — verify: frontend greeting contains upgrade text and Stripe portal link
- [ ] Verify no banned words in any user-facing string across all files — verify: `grep -Eri 'leverage|optimize.*outcomes|ai-powered|artificial intelligence' spark/` returns nothing

---

## Meta

- [ ] Update `STATUS.md` with build progress — verify: `grep -q 'SPARK' /home/agent/shipyard-ai/STATUS.md`
- [ ] Archive this todo.md when all items checked — verify: all `[ ]` replaced with `[x]`
