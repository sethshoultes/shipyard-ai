# Sous Activation Sprint — Running To-Do List

> Atomic tasks. Each completable in < 5 minutes. Each has a verification step.
> Format: `- [ ] Task description — verify: how to check it worked`

---

## Wave 1: Plugin Skeleton

- [ ] Create `sous/` directory — verify: `ls -d sous` returns directory
- [ ] Create `sous/sous.php` with plugin header and ABSPATH guard — verify: `grep -q "ABSPATH" sous/sous.php && echo "PASS"`
- [ ] Add `SOUS_VERSION`, `SOUS_DIR`, `SOUS_URL` constants to `sous.php` — verify: `grep -c "define('SOUS_" sous/sous.php` returns 3
- [ ] Add `register_activation_hook` stub to `sous.php` — verify: `grep -q "register_activation_hook" sous/sous.php`
- [ ] Add `register_deactivation_hook` stub to `sous.php` — verify: `grep -q "register_deactivation_hook" sous/sous.php`
- [ ] Activation hook seeds default options (`sous_business_name`, `sous_category`, `sous_detection_status`) — verify: `grep -q "sous_business_name" sous/sous.php`
- [ ] Activation hook schedules weekly digest cron — verify: `grep -q "wp_schedule_event" sous/sous.php`
- [ ] Deactivation hook clears cron — verify: `grep -q "wp_clear_scheduled_hook" sous/sous.php`
- [ ] Deactivation preserves user content (does not delete options with user data) — verify: `grep -q "delete_option" sous/sous.php` only for transient/flag options
- [ ] Create `sous/readme.txt` with WordPress.org standard headers — verify: `grep -q "Plugin Name:" sous/readme.txt`
- [ ] `readme.txt` includes Requires PHP, Tested up to, Stable tag, License — verify: `grep -c "^Requires\|^Tested\|^Stable\|^License" sous/readme.txt` returns 4
- [ ] `readme.txt` has no aggressive upsell language — verify: `grep -qi "annual billing\|buy now\|limited time offer" sous/readme.txt` returns 1 (should be 0)
- [ ] Run `php -l` on `sous.php` — verify: exit code 0
- [ ] Run `php -l` on all PHP files created so far — verify: exit code 0

---

## Wave 2: Data Layer & Detection

- [ ] Create `sous/includes/` directory — verify: `ls -d sous/includes`
- [ ] Create `sous/includes/data-store.php` with ABSPATH guard — verify: `grep -q "ABSPATH" sous/includes/data-store.php`
- [ ] Implement `sous_get_option($key)` wrapper — verify: `grep -q "function sous_get_option" sous/includes/data-store.php`
- [ ] Implement `sous_update_option($key, $value)` wrapper with `sanitize_text_field` — verify: `grep -q "sanitize_text_field" sous/includes/data-store.php`
- [ ] Create `sous/includes/detector.php` with ABSPATH guard — verify: `grep -q "ABSPATH" sous/includes/detector.php`
- [ ] Implement schema.org JSON-LD scraper function — verify: `grep -q "application/ld+json" sous/includes/detector.php`
- [ ] Implement OpenGraph tag parser — verify: `grep -q "og:" sous/includes/detector.php`
- [ ] Implement footer text scraper (phone/address regex) — verify: `grep -q "preg_match" sous/includes/detector.php`
- [ ] Implement confidence scoring per field — verify: `grep -q "confidence" sous/includes/detector.php`
- [ ] Register `wp_ajax_sous_detect_business` endpoint with `check_ajax_referer` — verify: `grep -q "check_ajax_referer" sous/includes/detector.php`
- [ ] Detection endpoint returns JSON with `business_name`, `category`, `confidence` — verify: `grep -q "wp_send_json" sous/includes/detector.php`
- [ ] Cache detection result in `wp_options` for 24 hours — verify: `grep -q "set_transient" sous/includes/detector.php`
- [ ] Graceful fallback: manual URL input if scraping fails — verify: `grep -q "manual" sous/includes/detector.php`
- [ ] Zero external HTTP calls in activation hooks — verify: `grep -r "wp_remote_get\|wp_remote_post\|curl\|file_get_contents.*http" sous/sous.php` returns 0 matches
- [ ] Run `php -l` on `data-store.php` and `detector.php` — verify: exit code 0

---

## Wave 3: Admin Page

- [ ] Create `sous/admin.php` with ABSPATH guard — verify: `grep -q "ABSPATH" sous/admin.php`
- [ ] Register top-level menu via `add_menu_page` — verify: `grep -q "add_menu_page" sous/admin.php`
- [ ] Capability check `manage_options` on admin page render — verify: `grep -q "current_user_can" sous/admin.php`
- [ ] Add Business Profile collapsible section — verify: `grep -q "Business Profile" sous/admin.php`
- [ ] Pre-populate Business Profile with detected data — verify: `grep -q "sous_get_option" sous/admin.php`
- [ ] Add editable fields: name, category, hours, address, phone — verify: `grep -c "input" sous/admin.php` ≥ 4
- [ ] Add "We found [Business Name]. Does this look like you?" copy — verify: `grep -q "We found" sous/admin.php`
- [ ] Add FAQ Templates collapsible section — verify: `grep -q "FAQ" sous/admin.php`
- [ ] Add toggle/checkbox for each FAQ — verify: `grep -q "checkbox\|toggle" sous/admin.php`
- [ ] Add inline edit for FAQ text — verify: `grep -q "contenteditable\|textarea" sous/admin.php`
- [ ] Add "Add all" and "Select none" buttons — verify: `grep -q "Add all" sous/admin.php && grep -q "Select none" sous/admin.php`
- [ ] Add Widget Settings collapsible section — verify: `grep -q "Widget" sous/admin.php`
- [ ] Add "See Your Live Widget" external link — verify: `grep -q "See Your Live Widget" sous/admin.php`
- [ ] Implement auto-save AJAX handler — verify: `grep -q "wp_ajax_sous_save" sous/admin.php`
- [ ] All output uses `esc_html`, `esc_attr`, `esc_url`, or `wp_kses_post` — verify: `grep -c "esc_\|wp_kses" sous/admin.php` ≥ 5
- [ ] Run `php -l` on `admin.php` — verify: exit code 0

---

## Wave 4: FAQ Templates

- [ ] Create `sous/data/` directory — verify: `ls -d sous/data`
- [ ] Create `sous/data/templates.json` — verify: `test -f sous/data/templates.json`
- [ ] Add Restaurant category with ≥15 FAQs — verify: `jq '.restaurant | length' sous/data/templates.json` ≥ 15
- [ ] Add Dental category with ≥15 FAQs — verify: `jq '.dental | length' sous/data/templates.json` ≥ 15
- [ ] Add Retail category with ≥15 FAQs — verify: `jq '.retail | length' sous/data/templates.json` ≥ 15
- [ ] Add Services category with ≥15 FAQs — verify: `jq '.services | length' sous/data/templates.json` ≥ 15
- [ ] Add Generic category with ≥10 FAQs — verify: `jq '.generic | length' sous/data/templates.json` ≥ 10
- [ ] Each FAQ has `question` and `answer_template` fields — verify: `jq '.. | objects | select(has("question") and has("answer_template")) | .question' sous/data/templates.json | wc -l` ≥ 70
- [ ] Template variables like `{business_name}` and `{hours}` present — verify: `grep -q "{business_name}" sous/data/templates.json`
- [ ] `templates.json` is valid JSON — verify: `jq empty sous/data/templates.json` exit code 0
- [ ] No banned phrases in templates — verify: `grep -qi "optimize your workflow\|leverage ai\|synergy\|scalable solution" sous/data/templates.json` returns 1 (should be 0)
- [ ] Required phrase "Room to climb" present in templates — verify: `grep -qi "room to climb" sous/data/templates.json`
- [ ] Required phrase "Your AI assistant" present in templates — verify: `grep -qi "your ai assistant" sous/data/templates.json`
- [ ] Required phrase "First weekly digest arrives Monday" present — verify: `grep -qi "first weekly digest arrives monday" sous/data/templates.json`

---

## Wave 5: Widget Frontend

- [ ] Create `sous/assets/` directory — verify: `ls -d sous/assets`
- [ ] Create `sous/assets/widget.css` — verify: `test -f sous/assets/widget.css`
- [ ] Define CSS variables `--sous-brand-color`, `--sous-text-color` — verify: `grep -q "--sous-" sous/assets/widget.css`
- [ ] BEM class naming throughout — verify: `grep -c "sous-widget__" sous/assets/widget.css` ≥ 5
- [ ] Fixed bubble bottom-right style — verify: `grep -q "position: fixed" sous/assets/widget.css`
- [ ] Panel size 320px × 480px — verify: `grep -q "320px" sous/assets/widget.css && grep -q "480px" sous/assets/widget.css`
- [ ] Mobile full-screen overlay < 480px — verify: `grep -q "480px" sous/assets/widget.css` and `grep -q "max-width\|@media" sous/assets/widget.css`
- [ ] Typing indicator animation — verify: `grep -q "animation\|@keyframes" sous/assets/widget.css`
- [ ] Inline SVG icons (no external dependencies) — verify: `grep -q "<svg" sous/assets/widget.css || grep -q "data:image/svg" sous/assets/widget.css`
- [ ] Create `sous/assets/widget.js` — verify: `test -f sous/assets/widget.js`
- [ ] Widget renders bubble on page load — verify: `grep -q "document.createElement" sous/assets/widget.js || grep -q "appendChild" sous/assets/widget.js`
- [ ] Click bubble to expand panel — verify: `grep -q "addEventListener.*click" sous/assets/widget.js`
- [ ] Message input with Enter-to-send — verify: `grep -q "addEventListener.*keydown\|keypress\|keyup" sous/assets/widget.js`
- [ ] `fetch()` to Cloudflare Worker endpoint — verify: `grep -q "fetch(" sous/assets/widget.js`
- [ ] AI response renders in message history — verify: `grep -q "innerHTML\|textContent" sous/assets/widget.js`
- [ ] Close/minimize controls — verify: `grep -q "close\|minimize" sous/assets/widget.js`
- [ ] Mobile responsive behavior — verify: `grep -q "innerWidth\|matchMedia" sous/assets/widget.js`
- [ ] Graceful default state before config — verify: `grep -q "welcome\|Welcome" sous/assets/widget.js`
- [ ] Enqueue widget assets in `sous.php` via `wp_enqueue_scripts` — verify: `grep -q "wp_enqueue_script" sous/sous.php && grep -q "wp_enqueue_style" sous/sous.php`
- [ ] `wp_localize_script` passes `sousConfig` with endpoint and nonce — verify: `grep -q "wp_localize_script" sous/sous.php && grep -q "sousConfig" sous/sous.php`
- [ ] Assets only load on frontend (not admin) — verify: `grep -q "is_admin()" sous/sous.php || grep -q "!is_admin" sous/sous.php`

---

## Wave 6: Admin Styles

- [ ] Create `sous/assets/admin.css` — verify: `test -f sous/assets/admin.css`
- [ ] Collapsible section styles — verify: `grep -q "collapse\|accordion" sous/assets/admin.css`
- [ ] Auto-save confirmation style — verify: `grep -q "saved\|Saved" sous/assets/admin.css`
- [ ] No custom design system — verify: file size < 5KB (`du -k sous/assets/admin.css`)
- [ ] Enqueue admin styles only on Sous admin page — verify: `grep -q "admin_enqueue_scripts" sous/sous.php || grep -q "admin_enqueue_scripts" sous/admin.php`

---

## Wave 7: Weekly Digest Scheduler

- [ ] Create `sous/includes/scheduler.php` with ABSPATH guard — verify: `grep -q "ABSPATH" sous/includes/scheduler.php`
- [ ] Register `sous_weekly_digest` cron for Monday 9am — verify: `grep -q "sous_weekly_digest" sous/includes/scheduler.php`
- [ ] SQL query selects `reviews_responded`, `avg_response_time_hours`, `PERCENT_RANK` — verify: `grep -q "PERCENT_RANK" sous/includes/scheduler.php`
- [ ] Guard: omit percentile when N < 10 in category/city — verify: `grep -q "N < 10\|count.*<.*10\|num_peers" sous/includes/scheduler.php`
- [ ] Warm tone copy: "Room to climb" included — verify: `grep -q "Room to climb" sous/includes/scheduler.php`
- [ ] Send digest via `wp_mail` to admin email — verify: `grep -q "wp_mail" sous/includes/scheduler.php`
- [ ] Run `php -l` on `scheduler.php` — verify: exit code 0

---

## Wave 8: Integration & Final Checks

- [ ] Include `detector.php`, `data-store.php`, `scheduler.php` from `sous.php` — verify: `grep -q "require_once.*detector.php" sous/sous.php`
- [ ] `sous.php` bootstraps admin page and frontend assets — verify: `grep -q "add_action.*admin_menu" sous/sous.php && grep -q "add_action.*wp_enqueue_scripts" sous/sous.php`
- [ ] All PHP files have `ABSPATH` guard — verify: `for f in sous/*.php sous/includes/*.php; do grep -q "ABSPATH" "$f" || echo "MISSING: $f"; done` prints nothing
- [ ] No `wp_remote_get` / `wp_remote_post` in activation hook — verify: `grep -A 20 "register_activation_hook" sous/sous.php | grep -q "wp_remote" && echo "FAIL" || echo "PASS"`
- [ ] No PHP 7+ syntax (typed properties, `??`, `match`, arrow functions) — verify: `grep -r "function.*:.*\bstring\b\|function.*:.*\bint\b\|??\|match\s*(\|fn\s*(" sous/` returns 0 matches
- [ ] No banned phrases anywhere in plugin — verify: `grep -ri "optimize your workflow\|leverage ai\|synergy\|scalable solution" sous/` returns 0 matches
- [ ] Required phrases present somewhere in plugin — verify: `grep -ri "room to climb" sous/ && grep -ri "your ai assistant" sous/ && grep -ri "first weekly digest arrives monday" sous/`
- [ ] Total line count under ~1000 — verify: `find sous -type f | xargs wc -l | tail -1` < 1000
- [ ] Run all 4 test scripts from deliverables — verify: all exit 0

---

## Post-Build (Review Phase)

- [ ] Admin page loads without PHP notices — verify: wp-debug.log empty after loading Sous page
- [ ] Widget renders on Twenty Twenty-Four theme — verify: visual check on test site
- [ ] Widget renders on Astra theme — verify: visual check on test site
- [ ] Cron event appears in WP-Cron tools — verify: `wp cron event list | grep sous_weekly_digest`
- [ ] Activation completes in under 5 seconds — verify: manual timer or `time wp plugin activate sous`
- [ ] Plugin deactivates cleanly without errors — verify: `wp plugin deactivate sous` exit code 0
