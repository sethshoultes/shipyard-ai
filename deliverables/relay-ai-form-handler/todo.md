# Relay — AI Form Handler & Lead Router
## Build To-Do List (v1 MVP)

> One session — ships or it doesn't count.
> When a task is checked off, its verification step must have been run and passed.

---

## Wave 1 — Foundation (Parallel)

### Task 1: Plugin scaffold
- [ ] Create `relay.php` with WordPress plugin headers (Name, Version, Author, Text Domain, Requires PHP 7.4, Requires at least 5.8)
  — verify: `grep -q "Plugin Name: Relay" relay.php && grep -q "Requires PHP: 7.4" relay.php`
- [ ] Add `register_activation_hook` that calls `Relay_Storage::activate()`, schedules `relay_process_leads` cron, flushes rewrite rules
  — verify: `grep -q "register_activation_hook" relay.php && grep -q "relay_process_leads" relay.php`
- [ ] Add `register_deactivation_hook` that clears cron and flushes rewrite rules
  — verify: `grep -q "register_deactivation_hook" relay.php && grep -q "wp_clear_scheduled_hook.*relay_process_leads" relay.php`
- [ ] Create `includes/class-relay.php` with singleton `Relay` class, constructor instantiates all components, `Relay::instance()` static accessor
  — verify: `grep -q "class Relay" includes/class-relay.php && grep -q "public static function instance" includes/class-relay.php`
- [ ] Hook `Relay::init()` into `plugins_loaded` at priority 10
  — verify: `grep -q "add_action( 'plugins_loaded'," relay.php`
- [ ] Run `php -l relay.php && php -l includes/class-relay.php`
  — verify: both commands output "No syntax errors"

### Task 2: CPT + taxonomy storage
- [ ] Create `includes/class-storage.php` with `Relay_Storage` class and static `activate()` method
  — verify: `grep -q "class Relay_Storage" includes/class-storage.php && grep -q "public static function activate" includes/class-storage.php`
- [ ] Register `relay_lead` CPT with `public => false`, `show_ui => true`, `show_in_menu => false`, `supports => ['title']`
  — verify: `grep -q "register_post_type.*relay_lead" includes/class-storage.php`
- [ ] Register `relay_category` taxonomy (hierarchical) with default terms: Sales, Support, Spam, General
  — verify: `grep -q "register_taxonomy.*relay_category" includes/class-storage.php`
- [ ] Register `relay_urgency` taxonomy (non-hierarchical) with default terms: High, Medium, Low
  — verify: `grep -q "register_taxonomy.*relay_urgency" includes/class-storage.php`
- [ ] Register post meta keys: `_relay_email`, `_relay_message`, `_relay_source`, `_relay_raw_json`, `_relay_classification_json`, `_relay_status`
  — verify: `grep -q "register_post_meta.*relay_lead.*_relay_email" includes/class-storage.php`
- [ ] Add `Relay_Storage::create_lead($data)` helper that inserts CPT with sanitized title + post meta
  — verify: `grep -q "function create_lead" includes/class-storage.php`
- [ ] Run `php -l includes/class-storage.php`
  — verify: outputs "No syntax errors"

### Task 3: Settings page
- [ ] Create `includes/class-admin.php` with `Relay_Admin` class, hook `admin_menu` for top-level page with `manage_options`
  — verify: `grep -q "add_menu_page.*Relay" includes/class-admin.php`
- [ ] Add Settings submenu page slug `relay-settings` rendering `admin/views/settings.php`
  — verify: `grep -q "add_submenu_page.*relay-settings" includes/class-admin.php`
- [ ] Register `relay_api_key` setting with `sanitize_callback` using `openssl_encrypt` (key from `AUTH_KEY` + `SECURE_AUTH_KEY`, fallback `wp_salt()`)
  — verify: `grep -q "register_setting.*relay_options.*relay_api_key" includes/class-admin.php && grep -q "openssl_encrypt" includes/class-admin.php`
- [ ] Implement `relay_decrypt_api_key()` that checks `RELAY_API_KEY` constant first, then decrypts DB value
  — verify: `grep -q "RELAY_API_KEY" includes/class-admin.php && grep -q "openssl_decrypt" includes/class-admin.php`
- [ ] Create `admin/views/settings.php` with password API key field, CF7 toggle, generic endpoint toggle, save button
  — verify: `grep -q "type=\"password\"" admin/views/settings.php && grep -q "settings_fields.*relay_options" admin/views/settings.php`
- [ ] Add admin notice for missing API key
  — verify: `grep -q "Relay needs a Claude API key" admin/views/settings.php`
- [ ] Run `php -l includes/class-admin.php && php -l admin/views/settings.php`
  — verify: both output "No syntax errors"

---

## Wave 2 — Core Logic (Parallel)

### Task 4: Form interception engine
- [ ] Create `includes/class-form-handler.php` with `Relay_Form_Handler` class, constructor hooks `wpcf7_before_send_mail` and `rest_api_init`
  — verify: `grep -q "wpcf7_before_send_mail" includes/class-form-handler.php && grep -q "rest_api_init" includes/class-form-handler.php`
- [ ] Implement CF7 handler that extracts posted_data, sanitizes with `sanitize_text_field` / `sanitize_email`, calls `Relay_Storage::create_lead()`
  — verify: `grep -q "sanitize_text_field" includes/class-form-handler.php && grep -q "Relay_Storage::create_lead" includes/class-form-handler.php`
- [ ] Register REST route `relay/v1/submit` with POST method and permission callback (nonce or secret token)
  — verify: `grep -q "register_rest_route.*relay/v1.*submit" includes/class-form-handler.php`
- [ ] REST handler returns JSON `{'success': true, 'lead_id': $post_id}` with HTTP 200
  — verify: `grep -q "'success' => true" includes/class-form-handler.php && grep -q "lead_id" includes/class-form-handler.php`
- [ ] Add integration toggle checks before hooking CF7 and registering REST route
  — verify: `grep -q "relay_integrations" includes/class-form-handler.php`
- [ ] Run `php -l includes/class-form-handler.php`
  — verify: outputs "No syntax errors"

### Task 5: Claude API client
- [ ] Create `includes/class-claude-client.php` with `Relay_Claude_Client` class, reads API key via `relay_decrypt_api_key()`
  — verify: `grep -q "class Relay_Claude_Client" includes/class-claude-client.php && grep -q "relay_decrypt_api_key" includes/class-claude-client.php`
- [ ] Implement `classify($submission)` building JSON prompt for Claude Messages API (category + urgency)
  — verify: `grep -q "api.anthropic.com/v1/messages" includes/class-claude-client.php`
- [ ] Send via `wp_remote_post` with headers `x-api-key`, `anthropic-version: 2023-06-01`, `Content-Type: application/json`
  — verify: `grep -q "x-api-key" includes/class-claude-client.php && grep -q "anthropic-version" includes/class-claude-client.php`
- [ ] Implement retry loop: 3 attempts with exponential backoff (1s, 2s, 4s), return `null` on final failure
  — verify: `grep -q "for.*3" includes/class-claude-client.php && grep -q "return null" includes/class-claude-client.php`
- [ ] Parse and validate response JSON, return structured array with `category`, `urgency`, `reason`, `raw_json`
  — verify: `grep -q "json_decode" includes/class-claude-client.php && grep -q "category" includes/class-claude-client.php`
- [ ] Run `php -l includes/class-claude-client.php`
  — verify: outputs "No syntax errors"

### Task 6: Classification cache
- [ ] Create `includes/class-cache.php` with `Relay_Cache` class using option key `relay_classification_cache`
  — verify: `grep -q "class Relay_Cache" includes/class-cache.php && grep -q "relay_classification_cache" includes/class-cache.php`
- [ ] Implement `get_cache_key($submission)` using normalized email + message `md5` hash
  — verify: `grep -q "md5" includes/class-cache.php`
- [ ] Implement `get($submission)` returning cached classification only if `expires > time()`, else `false`
  — verify: `grep -q "expires.*time()" includes/class-cache.php`
- [ ] Implement `set($submission, $classification)` with 24-hour TTL (`DAY_IN_SECONDS`)
  — verify: `grep -q "DAY_IN_SECONDS" includes/class-cache.php`
- [ ] Implement `purge()` deleting the option; expose "Purge Classification Cache" button on Settings page
  — verify: `grep -q "purge" includes/class-cache.php && grep -q "Purge Classification Cache" admin/views/settings.php`
- [ ] Add daily cron cleanup removing expired entries without full purge
  — verify: `grep -q "relay_cache_cleanup" includes/class-cache.php`
- [ ] Run `php -l includes/class-cache.php`
  — verify: outputs "No syntax errors"

---

## Wave 3 — Integration (Parallel)

### Task 7: Async processor + routing
- [ ] Create `includes/class-async-processor.php` with `Relay_Async_Processor` class, hook `relay_process_leads` to `process_batch()`
  — verify: `grep -q "class Relay_Async_Processor" includes/class-async-processor.php && grep -q "process_batch" includes/class-async-processor.php`
- [ ] `process_batch()` queries up to 5 pending `relay_lead` posts via `get_posts`
  — verify: `grep -q "posts_per_page.*5" includes/class-async-processor.php && grep -q "_relay_status.*pending" includes/class-async-processor.php`
- [ ] Per lead: check cache → miss → classify → cache set → update taxonomy + meta → status `classified`
  — verify: `grep -q "Relay_Cache::get" includes/class-async-processor.php && grep -q "Relay_Claude_Client::classify" includes/class-async-processor.php`
- [ ] On classification failure, leave status `pending` for retry on next cron
  — verify: `grep -q "pending" includes/class-async-processor.php`
- [ ] Implement `route_email($lead_id, $classification)` with `wp_mail` routing rules per category; Spam → quarantined, no email
  — verify: `grep -q "wp_mail" includes/class-async-processor.php && grep -q "quarantined" includes/class-async-processor.php`
- [ ] Add dashboard widget showing "Pending classifications: N" with manual "Process Now" AJAX button
  — verify: `grep -q "Pending classifications" includes/class-async-processor.php || grep -q "Pending classifications" includes/class-admin.php`
- [ ] Add admin notice if WP Cron appears disabled (no runs in last 30 minutes)
  — verify: `grep -q "server-side cron" includes/class-admin.php`
- [ ] Run `php -l includes/class-async-processor.php`
  — verify: outputs "No syntax errors"

### Task 8: Admin inbox UI
- [ ] Create `admin/views/inbox.php` with lead table, 20 per page, pagination via `get_posts`
  — verify: `grep -q "get_posts.*relay_lead" admin/views/inbox.php && grep -q "posts_per_page.*20" admin/views/inbox.php`
- [ ] Display columns: Name/Email, Category badge, Urgency badge, Date, Actions (Reply, View)
  — verify: `grep -q "Category" admin/views/inbox.php && grep -q "Urgency" admin/views/inbox.php`
- [ ] Badges use locked hex colors inline: Sales `#F97316`, Support `#38BDF8`, Spam `#64748B`, General `#E2E8F0`, High `#EF4444`, Medium `#F59E0B`, Low `#22C55E`
  — verify: `grep -q "F97316" admin/views/inbox.php && grep -q "EF4444" admin/views/inbox.php`
- [ ] Add filter bar: dropdowns for Category, Urgency, date picker, text search — server-side with nonces
  — verify: `grep -q "orderby" admin/views/inbox.php && grep -q "wp_nonce_field" admin/views/inbox.php`
- [ ] Implement sort toggles on Date, Category, Urgency with allowlisted `$_GET` values
  — verify: `grep -q "order" admin/views/inbox.php`
- [ ] Reply action links to `mailto:` with `esc_url` and `esc_attr`
  — verify: `grep -q "mailto:" admin/views/inbox.php`
- [ ] Create `admin/css/relay-admin.css` with Inter font stack, Surface `#F8FAFC`, Border `#E2E8F0`, Text `#0F172A`, smooth 0.2s transitions, pill badges
  — verify: `grep -q "F8FAFC" admin/css/relay-admin.css && grep -q "border-radius.*9999px" admin/css/relay-admin.css`
- [ ] Create `admin/js/relay-admin.js` with 30s `setInterval` polling `/wp-json/relay/v1/inbox-poll`
  — verify: `grep -q "setInterval" admin/js/relay-admin.js && grep -q "inbox-poll" admin/js/relay-admin.js`
- [ ] Register `relay/v1/inbox-poll` REST endpoint with `current_user_can('manage_options')` permission
  — verify: `grep -q "inbox-poll" includes/class-form-handler.php`
- [ ] Enqueue CSS and JS only on Relay admin pages via `admin_enqueue_scripts` with `$hook` check
  — verify: `grep -q "admin_enqueue_scripts" includes/class-admin.php`
- [ ] Run `php -l admin/views/inbox.php`
  — verify: outputs "No syntax errors"

---

## Wave 4 — Polish & Hardening (Sequential)

### Task 9: Security hardening
- [ ] Add `current_user_can('manage_options')` bail-out at top of every admin page callback
  — verify: `grep -rn "current_user_can.*manage_options" admin/views/ includes/ | wc -l` returns ≥ number of admin callbacks
- [ ] Ensure every REST `permission_callback` returns `current_user_can('manage_options')` or valid nonce/token
  — verify: `grep -rn "permission_callback" includes/class-form-handler.php | grep -c "current_user_can\|check_ajax_referer"` equals total permission_callback count
- [ ] Replace every `echo` with `esc_html()`, `esc_attr()`, `esc_url()`, or `wp_kses_post()` as appropriate
  — verify: `grep -rn "echo.*\$" admin/views/ | grep -v "esc_\|wp_kses" | wc -l` returns 0
- [ ] Wrap all `$_GET`/`$_POST`/`$_REQUEST` access with `sanitize_text_field`, `sanitize_email`, `absint`, or `wp_kses`
  — verify: `grep -rn "\$_GET\|\$_POST\|\$_REQUEST" includes/ admin/views/ | grep -v "sanitize_\|absint\|wp_kses" | wc -l` returns 0
- [ ] All forms use `wp_nonce_field('relay_action', 'relay_nonce')` and `check_admin_referer('relay_action', 'relay_nonce')`
  — verify: `grep -rn "relay_nonce" admin/views/ includes/ | wc -l` returns ≥ 2 per form
- [ ] Wrap all user-visible strings with `__()`, `_e()`, or `esc_html__()` using text domain `'relay'`
  — verify: `grep -rn "echo.*\"" admin/views/ | grep -v "__\|esc_\|wp_kses" | wc -l` returns 0
- [ ] Add `load_plugin_textdomain('relay', false, ...)` to `relay.php`
  — verify: `grep -q "load_plugin_textdomain.*relay" relay.php`
- [ ] Create `languages/relay.pot` stub with WP i18n headers
  — verify: `test -f languages/relay.pot && grep -q "Project-Id-Version" languages/relay.pot`
- [ ] Create `readme.txt` with WP.org standard headers, agency pitch, installation, FAQ, changelog
  — verify: `test -f readme.txt && grep -q "=== Relay ===" readme.txt`
- [ ] Verify PHP 7.4 compatibility: no union types, named arguments, match expressions, `str_contains()`
  — verify: `grep -rn "str_contains\|: \?string\|: \?int\|: \?array" includes/ admin/views/ relay.php | wc -l` returns 0
- [ ] Run `php -l` recursively on all `.php` files
  — verify: `find . -name '*.php' -exec php -l {} \; | grep -c "No syntax errors"` equals total PHP file count
- [ ] Create `assets/relay-badge.svg` for wp-admin menu icon
  — verify: `test -f assets/relay-badge.svg && grep -q "svg" assets/relay-badge.svg`
- [ ] Add `ABSPATH` guard to every PHP file
  — verify: `find . -name '*.php' -exec grep -L "ABSPATH" {} \; | wc -l` returns 0

---

## Post-Build Verification (Run All Test Scripts)

- [ ] Run `tests/test-file-existence.sh` — verify: exits 0
- [ ] Run `tests/test-php-syntax.sh` — verify: exits 0
- [ ] Run `tests/test-banned-patterns.sh` — verify: exits 0
- [ ] Run `tests/test-plugin-standards.sh` — verify: exits 0
- [ ] Run `tests/test-design-tokens.sh` — verify: exits 0
- [ ] Run `tests/test-scope-guard.sh` — verify: exits 0
- [ ] Manual end-to-end: fresh WP install → activate → enter API key → submit CF7 form → classify → verify email route
  — verify: inbox shows classified lead with correct category badge and routing email received
