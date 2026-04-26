# Sous Frontend Sprint — Running Todo

**Rules:**
- Each task is atomic and completable in < 5 minutes.
- Mark `[x]` only after the verification step passes.
- If a task blocks, create a new sub-task and keep this list current.

---

## Wave 1: Scaffold & Foundation

- [ ] Create `widget/` directory — verify: `ls widget/` returns directory exists
- [ ] Create `dashboard/` directory with `src/views/` subdirs — verify: `find dashboard -type d | sort` matches expected tree
- [ ] Create `plugin/` directory — verify: `ls plugin/` returns directory exists
- [ ] Create `worker/` directory — verify: `ls worker/` returns directory exists
- [ ] Create `infra/` directory — verify: `ls infra/` returns directory exists
- [ ] Create `tests/` directory — verify: `ls tests/` returns directory exists
- [ ] Write `infra/wrangler.toml` with KV namespace + D1 bindings — verify: `grep -E 'kv_namespaces|d1_databases' infra/wrangler.toml` returns matches
- [ ] Write `worker/d1-schema.sql` with `sous_subscriptions` table — verify: `grep -c 'CREATE TABLE' worker/d1-schema.sql` = 1 and `grep 'sous_subscriptions' worker/d1-schema.sql` matches
- [ ] Write `infra/stripe-webhook.md` with `checkout.session.completed` spec — verify: `grep 'checkout.session.completed' infra/stripe-webhook.md` matches

## Wave 2: Widget (sous-widget.js)

- [ ] Write IIFE wrapper with strict mode — verify: `head -n 5 widget/sous-widget.js` contains `'use strict'` and `(function(`
- [ ] Inject inline `<style>` tag with CSS custom properties — verify: `grep -c '<style>' widget/sous-widget.js` ≥ 1 and `grep 'lg-primary' widget/sous-widget.js` matches
- [ ] Render bubble DOM element (56px circle, fixed position) — verify: `grep -iE '56px|fixed.*bottom|z-index.*999999' widget/sous-widget.js` matches
- [ ] Render modal DOM element (380×520 desktop, mobile bottom sheet) — verify: `grep -iE '380|520|bottom.sheet|max-height.*80vh' widget/sous-widget.js` matches
- [ ] Implement bubble toggle → open/close modal — verify: `grep -iE 'toggle|openModal|closeModal' widget/sous-widget.js` matches
- [ ] Implement `sanitizeInput()` stripping HTML + 500 char limit — verify: `grep -i 'sanitize\|500' widget/sous-widget.js` matches
- [ ] Implement `handleSubmit()` with `fetch()` to `/ask` — verify: `grep -iE 'fetch|/ask' widget/sous-widget.js` matches
- [ ] Add 2-second `AbortController` timeout — verify: `grep -i 'abortcontroller\|timeout.*2000\|2.*second' widget/sous-widget.js` matches
- [ ] Implement typing indicator (3 dots, CSS animation) — verify: `grep -i 'typing\|dot' widget/sous-widget.js` matches
- [ ] Implement KV hit path: render answer immediately — verify: `grep -i 'cache\|kv\|cached' widget/sous-widget.js` matches
- [ ] Implement fallback state on timeout/error with email capture — verify: `grep -i 'fallback\|email\|timeout' widget/sous-widget.js` matches
- [ ] Implement message bubbles (user right/slate-800, assistant left/white) — verify: `grep -iE 'user-bubble|assistant-bubble|slate' widget/sous-widget.js` matches
- [ ] Add keyboard handlers: Escape to close, Enter to send — verify: `grep -iE 'keydown|escape|enter' widget/sous-widget.js` matches
- [ ] Add mobile touch handling (bottom sheet close) — verify: `grep -i 'touch\|click.*close' widget/sous-widget.js` matches
- [ ] **Gate**: Widget size check — verify: `gzip -c widget/sous-widget.js | wc -c` < 20480; if fail, cut scope and retry

## Wave 3: Cloudflare Worker

- [ ] Write `worker/index.js` route handler skeleton — verify: `grep -iE 'addEventListener|fetch.*request' worker/index.js` matches
- [ ] Implement `POST /ask` route with KV lookup by question hash — verify: `grep -iE 'POST.*ask|kv.*get|question' worker/index.js` matches
- [ ] Implement KV miss → LLM proxy with timeout — verify: `grep -iE 'llm|openai|claude|proxy' worker/index.js` matches
- [ ] Implement `POST /webhook` route with Stripe event verification — verify: `grep -iE 'webhook|stripe|signature' worker/index.js` matches
- [ ] Implement `checkout.session.completed` handler → upsert `sous_subscriptions` — verify: `grep -i 'checkout.session.completed' worker/index.js` matches
- [ ] Implement `GET /config` route (site greeting + theme) — verify: `grep -iE 'GET.*config|greeting|theme' worker/index.js` matches
- [ ] Write `worker/kv-seed.json` with 20+ entries across 5 categories — verify: `jq '. | length' worker/kv-seed.json` ≥ 20
- [ ] Add CORS headers to all responses — verify: `grep -i 'access-control-allow-origin' worker/index.js` matches
- [ ] Add usage counter increment on each `/ask` — verify: `grep -i 'responses_used\|increment\|counter' worker/index.js` matches

## Wave 4: WordPress Plugin

- [ ] Write `plugin/sous.php` standard header — verify: `grep -iE 'Plugin Name|Version' plugin/sous.php` matches
- [ ] Add `ABSPATH` security guard — verify: `grep 'ABSPATH' plugin/sous.php` matches
- [ ] Add activation hook (zero external API calls) — verify: `grep -i 'register_activation_hook' plugin/sous.php` matches and `grep -iE 'wp_remote_get|wp_remote_post|curl|file_get_contents' plugin/sous.php` = 0
- [ ] Implement business detection from title/meta/h1 — verify: `grep -iE 'wp_title|meta|h1|detect' plugin/sous.php` matches
- [ ] Implement keyword matcher for 20 business categories — verify: `grep -iE 'restaurant|dental|retail|services|category' plugin/sous.php` matches
- [ ] Enqueue `sous-widget.js` with `wp_enqueue_script` — verify: `grep 'wp_enqueue_script' plugin/sous.php` matches
- [ ] Inject config via `wp_localize_script` — verify: `grep 'wp_localize_script' plugin/sous.php` matches
- [ ] Add deactivation hook (clean transients, preserve content) — verify: `grep -i 'register_deactivation_hook' plugin/sous.php` matches
- [ ] **Gate**: PHP syntax check — verify: `php -l plugin/sous.php` exits 0

## Wave 5: SaaS Dashboard

- [ ] Write `dashboard/index.html` shell — verify: `grep -iE 'html|head|body' dashboard/index.html` matches
- [ ] Write `dashboard/src/api.js` with fetch wrapper to Worker — verify: `grep -iE 'fetch|apiEndpoint|/ask|/config' dashboard/src/api.js` matches
- [ ] Write `dashboard/src/views/DashboardHome.js` — one toggle (widget on/off) — verify: `grep -iE 'toggle|widget.*on|checkbox' dashboard/src/views/DashboardHome.js` matches
- [ ] Write `dashboard/src/views/DashboardHome.js` — one number (questions this week) — verify: `grep -iE 'questions|week|count|number' dashboard/src/views/DashboardHome.js` matches
- [ ] Write `dashboard/src/views/DashboardHome.js` — one button (upgrade/manage billing) — verify: `grep -iE 'upgrade|billing|button' dashboard/src/views/DashboardHome.js` matches
- [ ] Write `dashboard/src/views/OnboardingDetect.js` — show detected business type — verify: `grep -iE 'detect|business|type|confirm' dashboard/src/views/OnboardingDetect.js` matches
- [ ] Write `dashboard/src/views/OnboardingDetect.js` — "Yes, that's me" + Activate flow — verify: `grep -iE "yes.*me|activate|live" dashboard/src/views/OnboardingDetect.js` matches
- [ ] Write `dashboard/src/main.js` router + auth gate — verify: `grep -iE 'route|auth|login|magic' dashboard/src/main.js` matches
- [ ] Write `dashboard/package.json` if build step needed — verify: `test -f dashboard/package.json` and `cat dashboard/package.json | jq '.name'` returns value

## Wave 6: QA, Tests & Compliance

- [ ] Write `tests/test-file-structure.sh` — verify: `bash tests/test-file-structure.sh` exits 0
- [ ] Write `tests/test-widget-constraints.sh` — verify: `bash tests/test-widget-constraints.sh` exits 0
- [ ] Write `tests/test-banned-patterns.sh` — verify: `bash tests/test-banned-patterns.sh` exits 0
- [ ] Write `tests/test-plugin-guard.sh` — verify: `bash tests/test-plugin-guard.sh` exits 0
- [ ] Write `tests/test-worker-routes.sh` — verify: `bash tests/test-worker-routes.sh` exits 0
- [ ] Make all test scripts executable — verify: `test -x tests/*.sh` for each script
- [ ] Run full test suite — verify: `for f in tests/*.sh; do bash "$f" || exit 1; done` exits 0
- [ ] Banned copy audit: grep for "leverage AI", "we're excited", "optimize", "AI-powered", "chatbot" — verify: zero matches across all source files
- [ ] Verify no empty directories shipped — verify: `find . -type d -empty | wc -l` = 0
- [ ] Verify no `node_modules` committed — verify: `test ! -d widget/node_modules && test ! -d dashboard/node_modules || .gitignore exists`

## Wave 7: Final Gates

- [ ] Widget renders on test WordPress site (TwentyTwentyFour) — verify: screenshot shows bubble bottom-right
- [ ] Widget renders on GeneratePress — verify: screenshot shows bubble, no layout breakage
- [ ] Widget renders on Astra — verify: screenshot shows bubble, no layout breakage
- [ ] Onboarding completes in < 15 seconds (screen recording) — verify: stopwatch test
- [ ] FAQ cache returns in < 200 ms (DevTools Network tab) — verify: p95 timing from 10 requests
- [ ] Stripe Checkout test-mode subscription created — verify: Stripe dashboard shows active sub
- [ ] Usage meter blocks at 50 responses for free tier — verify: manual test or PHPUnit
- [ ] Dashboard shows exactly one toggle, one number, one button — verify: DOM query count
- [ ] Cross-browser check: Chrome, Safari, Firefox latest 2 versions — verify: manual smoke test
- [ ] Mobile check: iOS Safari + Chrome Android — verify: no layout breakage, bottom sheet functional
- [ ] **Margaret Hamilton checkpoint**: all 6 artifacts listed in spec.md §5 exist — verify: checklist review

---

*Todo version: 1.0.0*
*Last updated: 2026-04-26*
