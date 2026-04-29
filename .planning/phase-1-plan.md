# Phase 1 Plan — Relay: AI Form Handler & Lead Router (v1 MVP)

**Generated**: 2026-04-29
**Requirements**: `/home/agent/shipyard-ai/prds/relay-ai-form-handler.md` + `/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md` (locked)
**Total Tasks**: 9
**Waves**: 4
**Project Slug**: `relay-ai-form-handler`

---

## Documentation Review

### Verified Technical Context

1. **Platform Lock**: WordPress plugin (pure PHP), NOT Emdash/Cloudflare. The locked decisions (#2) explicitly override the PRD's Cloudflare Worker architecture with direct PHP-to-Claude via `wp_remote_post`. No Node.js build step for the backend.

2. **Data Storage Lock**: Custom Post Type (`relay_lead`) per locked decisions (Open Question #2 resolution). Custom database table deferred to v2. Post meta stores: `_relay_email`, `_relay_message`, `_relay_category`, `_relay_urgency`, `_relay_classification_json`, `_relay_status`.

3. **Admin UI Lock**: PHP-rendered inbox with heavily customized CSS and vanilla JS (Phil Jackson tie-breaker, Open Question #1). `WP_List_Table` subclass with custom CSS for color-coded badges. No React/Webpack build pipeline in v1. 30s AJAX polling for live updates.

4. **Design Tokens Verified** (PRD §4, confirmed in decisions):
   - Urgency High: `#EF4444` | Medium: `#F59E0B` | Low: `#22C55E`
   - Spam: `#64748B` | Accent (AI): `#38BDF8`
   - Surface: `#F8FAFC` | Border: `#E2E8F0` | Text: `#0F172A`

5. **Classification Taxonomy Locked** (decisions.md MVP #4):
   - Categories: `Sales`, `Support`, `Spam`, `General`
   - Urgency: `High`, `Medium`, `Low`

6. **Emdash Reference**: This project is explicitly a **WordPress plugin**, not an Emdash plugin. `docs/EMDASH-GUIDE.md` was reviewed per CLAUDE.md mandate to confirm the architectural divergence is intentional and locked. No Emdash APIs are used.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| RELAY-001 | phase-1-task-1 | 1 |
| RELAY-002 | phase-1-task-2 | 1 |
| RELAY-003 | phase-1-task-2, phase-1-task-8 | 1, 3 |
| RELAY-004 | phase-1-task-3 | 1 |
| RELAY-005 | phase-1-task-4 | 2 |
| RELAY-006 | phase-1-task-4 | 2 |
| RELAY-007 | phase-1-task-5 | 2 |
| RELAY-008 | phase-1-task-6 | 2 |
| RELAY-009 | phase-1-task-7 | 3 |
| RELAY-010 | phase-1-task-8 | 3 |
| RELAY-011 | phase-1-task-8 | 3 |
| RELAY-012 | phase-1-task-7 | 3 |
| RELAY-013 | phase-1-task-1, phase-1-task-4, phase-1-task-9 | 1, 2, 4 |
| RELAY-014 | phase-1-task-1, phase-1-task-5, phase-1-task-9 | 1, 2, 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation
Tasks: 3 | Dependencies: None
- **phase-1-task-1**: Plugin scaffold — `relay.php` headers, activation/deactivation, `class-relay.php` loader
- **phase-1-task-2**: CPT + taxonomy — `class-storage.php` with `relay_lead` CPT and classification meta
- **phase-1-task-3**: Settings page — `class-admin.php` menu registration, `settings.php` API key + toggles

### Wave 2 (Parallel, after Wave 1) — Core Logic
Tasks: 3 | Dependencies: Wave 1
- **phase-1-task-4**: Form interception — `class-form-handler.php` CF7 hook + generic REST endpoint
- **phase-1-task-5**: Claude API client — `class-claude-client.php` `wp_remote_post` wrapper + retry
- **phase-1-task-6**: Classification cache — `class-cache.php` hash-based deduplication

### Wave 3 (Parallel, after Wave 2) — Integration
Tasks: 2 | Dependencies: Wave 2
- **phase-1-task-7**: Async processor + routing — `class-async-processor.php` WP Cron classification + `wp_mail` routing
- **phase-1-task-8**: Admin inbox UI — `inbox.php`, `relay-admin.css`, `relay-admin.js`, 30s AJAX poll

### Wave 4 (Sequential, after Wave 3) — Polish & Hardening
Tasks: 1 | Dependencies: Wave 3
- **phase-1-task-9**: Security hardening — capability checks, nonces, escaping, i18n stubs, `readme.txt`

---

## XML Task Plans

### Wave 1

<task-plan id="phase-1-task-1" wave="1">
  <title>Plugin scaffold: relay.php and class-relay.php loader</title>
  <requirement>RELAY-001, RELAY-013, RELAY-014</requirement>
  <description>
    Create the main plugin file and core loader class. relay.php contains WordPress plugin headers,
    activation hook (flushes rewrite rules, schedules cron), deactivation hook (cleans cron events),
    and registers the autoloader for includes/class-*.php. class-relay.php instantiates all component
    classes in the correct order and exposes a singleton accessor.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="File structure and architecture lock" />
    <file path="/home/agent/shipyard-ai/prds/relay-ai-form-handler.md" reason="Plugin headers and WP.org standards reference" />
  </context>

  <steps>
    <step order="1">Create `projects/relay-ai-form-handler/relay.php` with WordPress plugin headers: Plugin Name: Relay, Version: 1.0.0, Author: Shipyard AI, Text Domain: relay, Requires PHP: 7.4, Requires at least: 5.8.</step>
    <step order="2">Add `register_activation_hook` that: (a) calls `Relay_Storage::activate()` to register CPT, (b) schedules the async classification cron event `relay_process_leads` if not already scheduled, (c) flushes rewrite rules.</step>
    <step order="3">Add `register_deactivation_hook` that: (a) clears the `relay_process_leads` cron event, (b) flushes rewrite rules.</step>
    <step order="4">Create `projects/relay-ai-form-handler/includes/class-relay.php` with a `Relay` singleton class. Constructor instantiates `Relay_Storage`, `Relay_Admin`, `Relay_Form_Handler`, `Relay_Claud_Client`, `Relay_Cache`, `Relay_Async_Processor` in dependency-safe order.</step>
    <step order="5">Add `Relay::instance()` static method for global access. Hook `Relay::init()` into `plugins_loaded` at priority 10.</step>
    <step order="6">Verify no syntax errors with `php -l relay.php && php -l includes/class-relay.php`.</step>
  </steps>

  <verification>
    <check type="build">`php -l relay.php && php -l includes/class-relay.php` returns no syntax errors</check>
    <check type="test">Install plugin in a WordPress test environment; activation succeeds without fatal errors</check>
    <check type="manual">Confirm plugin appears in wp-admin Plugins list with correct name and version</check>
  </verification>

  <dependencies>
    <!-- Empty — wave 1 independent task -->
  </dependencies>

  <commit-message>feat: add plugin scaffold and main loader

Creates relay.php with activation/deactivation hooks and
includes/class-relay.php as the singleton controller.
Registers CPT on activation and schedules classification cron.</commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>CPT + taxonomy: class-storage.php with relay_lead and classification meta</title>
  <requirement>RELAY-002, RELAY-003</requirement>
  <description>
    Register the Custom Post Type `relay_lead` with all required meta fields for storing submission
    data and AI classification results. Also register the hierarchical taxonomy `relay_category`
    (terms: Sales, Support, Spam, General) and the flat taxonomy `relay_urgency` (terms: High, Medium, Low).
    On activation, auto-insert default taxonomy terms if they do not exist.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="CPT vs custom table decision and taxonomy schema" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Locked hex color codes and taxonomy labels" />
  </context>

  <steps>
    <step order="1">Create `includes/class-storage.php` with `Relay_Storage` class. Static `activate()` method registers the CPT and default taxonomy terms.</step>
    <step order="2">Register `relay_lead` CPT with labels, `public => false`, `show_ui => true`, `show_in_menu => false` (custom menu added later by Relay_Admin), `supports => ['title']`, `capability_type => 'post'`.</step>
    <step order="3">Register `relay_category` taxonomy (hierarchical) attached to `relay_lead` with labels. On activation, insert terms: Sales, Support, Spam, General.</step>
    <step order="4">Register `relay_urgency` taxonomy (non-hierarchical) attached to `relay_lead` with labels. On activation, insert terms: High, Medium, Low.</step>
    <step order="5">Register post meta keys with `register_post_meta('relay_lead', ...)` for: `_relay_email` (string), `_relay_message` (string), `_relay_source` (string), `_relay_raw_json` (string), `_relay_classification_json` (string), `_relay_status` (string, default 'pending'). Use `'show_in_rest' => false` and `'single' => true`.</step>
    <step order="6">Add helper method `Relay_Storage::create_lead($data)` that inserts a new `relay_lead` post with title = sanitize_text_field($data['name'] . ' — ' . $data['subject']), and stores email/message/source/raw_json in post meta.</step>
    <step order="7">Verify `php -l includes/class-storage.php` passes. Test activation in WordPress: confirm CPT and taxonomies exist under the Relay admin menu.</step>
  </steps>

  <verification>
    <check type="build">`php -l includes/class-storage.php` passes</check>
    <check type="test">Activation creates CPT and taxonomies; default terms (Sales, Support, Spam, General, High, Medium, Low) are present</check>
    <check type="manual">`Relay Leads` appears as a hidden CPT with custom columns visible in the Relay Inbox</check>
  </verification>

  <dependencies>
    <!-- Empty — wave 1 independent task -->
  </dependencies>

  <commit-message>feat: register relay_lead CPT with classification taxonomies

Adds Relay_Storage with relay_lead CPT, relay_category and relay_urgency
taxonomies, and post meta for submission data. Default taxonomy terms
auto-created on activation.</commit-message>
</task-plan>

<task-plan id="phase-1-task-3" wave="1">
  <title>Settings page: API key encryption and integration toggles</title>
  <requirement>RELAY-004, RELAY-013</requirement>
  <description>
    Build a single-screen settings page under the Relay admin menu. The page accepts a Claude API key,
    encrypts it at rest using openssl, and provides toggles for Contact Form 7 interception and generic
    form endpoint. Include a warning if the key is stored in the database (recommend wp-config.php define).
    Use `current_user_can('manage_options')` and wp_nonce_field on all forms.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="Zero setup wizard philosophy and API key security risk #7" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Encryption-at-rest requirement" />
  </context>

  <steps>
    <step order="1">Create `includes/class-admin.php` with `Relay_Admin` class. Hook `admin_menu` to register a top-level menu page `Relay` with icon URL `assets/relay-badge.svg` and capability `manage_options`.</step>
    <step order="2">Add submenu page `Settings` slug `relay-settings` that renders `admin/views/settings.php`.</step>
    <step order="3">Register settings with `register_setting('relay_options', 'relay_api_key', ['sanitize_callback' => 'relay_encrypt_api_key'])` and `register_setting('relay_options', 'relay_integrations', ['type' => 'array'])`.</step>
    <step order="4">Implement `relay_encrypt_api_key($key)` using `openssl_encrypt` with a key derived from `AUTH_KEY` + `SECURE_AUTH_KEY` (fall back to `wp_salt()`). Store the IV alongside the ciphertext in the option value.</step>
    <step order="5">Implement `relay_decrypt_api_key()` that reads the option, splits IV/ciphertext, and decrypts. If `RELAY_API_KEY` constant is defined in wp-config.php, return that instead and show a non-writable notice in the UI.</step>
    <step order="6">Create `admin/views/settings.php` with a simple form: API key input (type=password, with reveal toggle via vanilla JS), checkboxes for "Enable Contact Form 7 interception" and "Enable generic form endpoint", and Save Changes button. Use `settings_fields('relay_options')` and `do_settings_sections('relay-settings')`.</step>
    <step order="7">Add admin notice if API key is missing: "Relay needs a Claude API key to classify leads."</step>
    <step order="8">Verify `php -l` on both files. Confirm settings save and retrieve correctly, encryption is reversible, and wp-config define takes precedence.</step>
  </steps>

  <verification>
    <check type="build">`php -l includes/class-admin.php && php -l admin/views/settings.php` passes</check>
    <check type="test">Settings form submits without nonce errors; API key encrypts and decrypts correctly; `RELAY_API_KEY` constant bypasses DB storage</check>
    <check type="manual">Visual confirmation: Relay menu appears in wp-admin sidebar; Settings page loads with one screen, password field, toggles, and orange `#F97316` accent on save button</check>
  </verification>

  <dependencies>
    <!-- Empty — wave 1 independent task -->
  </dependencies>

  <commit-message>feat: add settings page with encrypted API key storage

Registers Relay top-level admin menu and Settings subpage.
API key encrypted at rest with openssl. Supports wp-config.php
constant override. Integration toggles for CF7 and generic endpoint.</commit-message>
</task-plan>

### Wave 2

<task-plan id="phase-1-task-4" wave="2">
  <title>Form interception engine: CF7 hook + generic REST endpoint</title>
  <requirement>RELAY-005, RELAY-006, RELAY-013, RELAY-014</requirement>
  <description>
    Intercept form submissions before they hit the inbox abyss. Hook into Contact Form 7's
    `wpcf7_before_send_mail` action to capture submissions. Also register a REST API endpoint
    `/wp-json/relay/v1/submit` for generic HTML forms, with nonce validation or secret token
    authentication. Sanitize all inputs, store via Relay_Storage::create_lead(), and return 200 OK
    in under 100ms. Never block on Claude classification here.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="Async model: store instantly, return 200 OK in &lt;100ms" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="CF7 + generic hook priority; sanitization requirements" />
    <file path="projects/relay-ai-form-handler/includes/class-storage.php" reason="create_lead() helper to store submissions" />
  </context>

  <steps>
    <step order="1">Create `includes/class-form-handler.php` with `Relay_Form_Handler` class. Constructor hooks `wpcf7_before_send_mail` and `rest_api_init`.</step>
    <step order="2">Implement CF7 handler `capture_cf7($contact_form)` that extracts `posted_data`: name, email, subject, message. Sanitize each field with `sanitize_text_field` or `sanitize_email`. Build a `$submission` array.</step>
    <step order="3">Call `Relay_Storage::create_lead($submission)` to persist the lead as `relay_lead` CPT with status `pending`.</step>
    <step order="4">Implement `register_rest_route('relay/v1', '/submit', ['methods' => 'POST', 'callback' => [...], 'permission_callback' => [...]])`. Permission callback accepts either a valid WP nonce (`check_ajax_referer`) or a secret token from settings.</step>
    <step order="5">REST handler sanitizes inputs identically to CF7 handler, calls `Relay_Storage::create_lead()`, and returns JSON `{'success': true, 'lead_id': $post_id}` with HTTP 200.</step>
    <step order="6">Add integration toggle checks: only hook CF7 if `relay_integrations['cf7']` is enabled; only register REST route if `relay_integrations['generic']` is enabled.</step>
    <step order="7">Verify `php -l`. Test CF7 submission creates a lead post. Test REST endpoint with curl returns 200 and creates a lead post.</step>
  </steps>

  <verification>
    <check type="build">`php -l includes/class-form-handler.php` passes</check>
    <check type="test">CF7 form submission creates a `relay_lead` post with correct meta; REST POST to `/wp-json/relay/v1/submit` returns 200 and creates a lead</check>
    <check type="test">Missing nonce or invalid token returns 403 on REST endpoint</check>
    <check type="manual">Submit a form; check wp-admin Relay Inbox — unclassified lead appears within seconds</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin loader must be in place to instantiate Relay_Form_Handler" />
    <depends-on task-id="phase-1-task-2" reason="Relay_Storage::create_lead() must exist to store submissions" />
  </dependencies>

  <commit-message>feat: intercept CF7 and generic form submissions

Adds Relay_Form_Handler with wpcf7_before_send_mail hook and
/wp-json/relay/v1/submit REST endpoint. All inputs sanitized.
Stores leads instantly via Relay_Storage without blocking on AI.</commit-message>
</task-plan>

<task-plan id="phase-1-task-5" wave="2">
  <title>Claude API client: wp_remote_post wrapper with retry logic</title>
  <requirement>RELAY-007, RELAY-013, RELAY-014</requirement>
  <description>
    Build a PHP client that sends submission content to the Claude API via `wp_remote_post`,
    receives structured JSON classification, and implements retry logic with exponential backoff.
    Construct a prompt that asks Claude to classify into category (Sales/Support/Spam/General)
    and urgency (High/Medium/Low). Parse and validate the JSON response. Gracefully degrade:
    on failure, return `null` so the caller can mark the lead for retry.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="Direct PHP-to-Claude architecture lock; retry and graceful failure requirements" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Classification taxonomy and prompt structure" />
    <file path="projects/relay-ai-form-handler/includes/class-admin.php" reason="API key retrieval via relay_decrypt_api_key()" />
  </context>

  <steps>
    <step order="1">Create `includes/class-claude-client.php` with `Relay_Claude_Client` class. Constructor reads API key via `relay_decrypt_api_key()`.</step>
    <step order="2">Implement `classify($submission)` method that builds a JSON prompt for Claude Messages API. Prompt: "Classify this form submission into one category: Sales, Support, Spam, General. Also assign urgency: High, Medium, Low. Return ONLY JSON: {\"category\":\"...\",\"urgency\":\"...\",\"reason\":\"...\"}"</step>
    <step order="3">Send request via `wp_remote_post('https://api.anthropic.com/v1/messages', [...])` with headers: `x-api-key`, `anthropic-version: 2023-06-01`, `Content-Type: application/json`. Body: `model: 'claude-3-5-sonnet-20241022'`, `max_tokens: 256`, `messages: [{role:'user', content:$prompt}]`.</step>
    <step order="4">Implement retry loop: up to 3 attempts with exponential backoff (1s, 2s, 4s). On `WP_Error` or non-2xx HTTP status, retry. On final failure, return `null`.</step>
    <step order="5">Parse response body with `json_decode`. Validate that `category` is in the allowed set and `urgency` is in the allowed set. If invalid, return `null`.</step>
    <step order="6">Return structured array: `['category' => ..., 'urgency' => ..., 'reason' => ..., 'raw_json' => $response_body]`.</step>
    <step order="7">Verify `php -l`. Test with a mock server or valid API key: confirm classification returns correct structure and retries on 500 errors.</step>
  </steps>

  <verification>
    <check type="build">`php -l includes/class-claude-client.php` passes</check>
    <check type="test">Mock wp_remote_post returning 500 twice then 200 — confirm 3 attempts and success on third</check>
    <check type="test">Mock response with invalid category returns null; valid response returns structured array</check>
    <check type="manual">With real API key, classify a sample submission and verify JSON output matches expected schema</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin loader must instantiate Relay_Claude_Client" />
    <depends-on task-id="phase-1-task-3" reason="API key must be retrievable via relay_decrypt_api_key()" />
  </dependencies>

  <commit-message>feat: add Claude API client with retry and graceful degradation

Relay_Claude_Client sends submissions to Claude Messages API via
wp_remote_post. Exponential backoff retry (3 attempts). Returns
structured classification or null on failure. Compatible with PHP 7.4+.</commit-message>
</task-plan>

<task-plan id="phase-1-task-6" wave="2">
  <title>Classification cache: hash-based deduplication</title>
  <requirement>RELAY-008, RELAY-014</requirement>
  <description>
    Implement a hash-based classification cache to eliminate redundant Claude API calls for
    identical submissions. Hash the normalized subject + body. Store the hash → classification
    result mapping in the WordPress options table with a 24-hour TTL. Before sending a new
    submission to Claude, check the cache. On cache hit, return the stored classification instantly.
    On cache miss, classify via API and store the result. Include a cache purge option in settings.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="Scaling guardrail: classification caching from day one; hash-based deduplication required" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Cache TTL and invalidation strategy" />
  </context>

  <steps>
    <step order="1">Create `includes/class-cache.php` with `Relay_Cache` class. Option key: `relay_classification_cache`.</step>
    <step order="2">Implement `get_cache_key($submission)` that normalizes email + message (lowercase, trim whitespace) and returns `md5($normalized)`.</step>
    <step order="3">Implement `get($submission)` that looks up the hash in `get_option('relay_classification_cache', [])`. Return the cached classification array only if `['expires'] > time()`. Otherwise return `false`.</step>
    <step order="4">Implement `set($submission, $classification)` that writes the hash → `['classification' => ..., 'expires' => time() + DAY_IN_SECONDS]` into the option array, then updates the option.</step>
    <step order="5">Implement `purge()` that deletes the option entirely. Expose a "Purge Classification Cache" button on the Relay Settings page (add to class-admin.php/settings.php).</step>
    <step order="6">Add a cron cleanup job that runs daily and removes expired entries without deleting the whole cache.</step>
    <step order="7">Verify `php -l`. Test: identical submissions return cached result; submissions after TTL trigger new API call.</step>
  </steps>

  <verification>
    <check type="build">`php -l includes/class-cache.php` passes</check>
    <check type="test">Two identical submissions: first triggers API, second returns cache hit with zero API call</check>
    <check type="test">Cache entry expires after TTL; subsequent identical submission triggers fresh API call</check>
    <check type="manual">Press "Purge Cache" button; confirm option is cleared and next submission triggers API</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin loader must instantiate Relay_Cache" />
  </dependencies>

  <commit-message>feat: add hash-based classification cache with TTL

Relay_Cache deduplicates identical submissions via md5 hash.
24-hour TTL with daily expired-entry cleanup. Admin can purge
cache from Settings page. Reduces API costs at agency scale.</commit-message>
</task-plan>

### Wave 3

<task-plan id="phase-1-task-7" wave="3">
  <title>Async processor + routing: WP Cron classification and wp_mail routing</title>
  <requirement>RELAY-009, RELAY-012, RELAY-013, RELAY-014</requirement>
  <description>
    Build the WP Cron job that processes unclassified leads in the background. On each cron run,
    query for `relay_lead` posts with `_relay_status = 'pending'`, limited to 5 per batch to respect
    shared hosting limits. For each lead: check the classification cache; on miss, call Claude API;
    store the result; update taxonomy terms and post meta; set status to 'classified'. Then trigger
    email routing: if category = Sales, send wp_mail to the configured sales address; if Support,
    send to support address; if Spam, mark status 'quarantined' and skip email. Include a manual
    "Process Now" button in the admin UI for hosts with disabled WP Cron.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="Async classification pipeline; WP Cron reliability risk #9; email routing" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Classification taxonomy and routing rules" />
    <file path="projects/relay-ai-form-handler/includes/class-claude-client.php" reason="classify() method" />
    <file path="projects/relay-ai-form-handler/includes/class-cache.php" reason="get() and set() methods" />
    <file path="projects/relay-ai-form-handler/includes/class-storage.php" reason="Lead query and update helpers" />
  </context>

  <steps>
    <step order="1">Create `includes/class-async-processor.php` with `Relay_Async_Processor` class. Hook `relay_process_leads` cron event to `process_batch()`.</step>
    <step order="2">Implement `process_batch()` that queries `get_posts(['post_type' => 'relay_lead', 'post_status' => 'any', 'meta_key' => '_relay_status', 'meta_value' => 'pending', 'posts_per_page' => 5])`.</step>
    <step order="3">For each pending lead: (a) build submission array from post meta, (b) call `Relay_Cache::get()`, (c) if cache miss, call `Relay_Claude_Client::classify()`, (d) if classification is null, leave status as 'pending' and continue, (e) on success, call `Relay_Cache::set()`, update taxonomy terms (`wp_set_post_terms` for category and urgency), update `_relay_classification_json` and `_relay_status = 'classified'`.</step>
    <step order="4">Implement `route_email($lead_id, $classification)` that reads routing rules from settings. Default rules: Sales → `get_option('admin_email')`, Support → `get_option('admin_email')`, General → `get_option('admin_email')`, Spam → skip. Allow override addresses in settings. Use `wp_mail` with subject "[Relay] New {$category} Lead — {$urgency} Urgency".</step>
    <step order="5">Add admin dashboard widget showing "Pending classifications: N" with a "Process Now" button that manually triggers `do_action('relay_process_leads')` via AJAX.</step>
    <step order="6">Add admin notice if WP Cron appears disabled (no cron runs in last 30 minutes): "Relay classifications may be delayed. Consider setting up a server-side cron."</step>
    <step order="7">Verify `php -l`. Test with mock data: pending leads get classified and routed; Claude failure leaves lead pending; manual Process Now works.</step>
  </steps>

  <verification>
    <check type="build">`php -l includes/class-async-processor.php` passes</check>
    <check type="test">Create 3 pending leads; run cron batch; confirm 3 get classified, taxonomy terms updated, emails sent</check>
    <check type="test">Simulate Claude API failure; confirm leads remain pending and can be retried on next cron</check>
    <check type="test">Spam lead gets status 'quarantined' and no email sent</check>
    <check type="manual">Dashboard widget shows pending count; "Process Now" button classifies leads immediately</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Needs CPT and taxonomy to store classification results" />
    <depends-on task-id="phase-1-task-5" reason="Needs Relay_Claude_Client::classify()" />
    <depends-on task-id="phase-1-task-6" reason="Needs Relay_Cache for deduplication" />
  </dependencies>

  <commit-message>feat: add async classification processor with email routing

WP Cron batch job classifies pending leads via Claude API (with cache
lookup). Updates taxonomy terms and triggers wp_mail routing based on
category. Manual "Process Now" button for unreliable cron hosts.</commit-message>
</task-plan>

<task-plan id="phase-1-task-8" wave="3">
  <title>Admin inbox UI: PHP-rendered with color-coded badges and AJAX polling</title>
  <requirement>RELAY-010, RELAY-011</requirement>
  <description>
    Build the admin inbox view that Steve Jobs called "the reason to survive." Use a custom
    WP_List_Table subclass or clean PHP render with the locked design tokens. Display leads with
    color-coded badges for category and urgency. Provide sort/filter by category/urgency/date and
    search by name/email. Include one-click Reply that opens `mailto:` with pre-filled To and Subject.
    Add vanilla JS for 30-second AJAX polling to refresh the inbox as classifications complete.
    The UI must feel alive — smooth state transitions, heartbeat polling, calm command center aesthetic.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="PHP-rendered inbox decision; Steve's emotional requirement" />
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/essence.md" reason=""Feeling: Relief. End of inbox dread. Must be perfect: First 30 seconds."" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Locked hex color codes for badges" />
    <file path="projects/relay-ai-form-handler/includes/class-storage.php" reason="CPT query helpers" />
    <file path="projects/relay-ai-form-handler/includes/class-admin.php" reason="Menu registration and asset enqueuing" />
  </context>

  <steps>
    <step order="1">Create `admin/views/inbox.php` with a custom table or clean div-based list. Query `get_posts(['post_type' => 'relay_lead', 'posts_per_page' => 20])` with pagination.</step>
    <step order="2">Display columns: Name/Email (linked), Category badge, Urgency badge, Date, Actions (Reply, View). Badges use inline styles with locked hex codes: Sales `#F97316`, Support `#38BDF8`, Spam `#64748B`, General `#E2E8F0`. Urgency: High `#EF4444`, Medium `#F59E0B`, Low `#22C55E`.</step>
    <step order="3">Add filter bar: dropdowns for Category and Urgency, date picker, text search. Implement server-side filtering by adjusting the WP_Query args based on `$_GET` parameters with nonces.</step>
    <step order="4">Add sort toggles on column headers (Date, Category, Urgency). Use `$_GET['orderby']` and `$_GET['order']` with allowlisted values.</step>
    <step order="5">Implement Reply action: link to `mailto:{$email}?subject=Re: {$subject}` with `esc_url` and `esc_attr`.</step>
    <step order="6">Create `admin/css/relay-admin.css` with calm command center aesthetic: Inter-like system font stack, card backgrounds `#F8FAFC`, borders `#E2E8F0`, text `#0F172A`. Smooth hover transitions (0.2s). Badge styles with border-radius 9999px, padding 4px 12px, font-size 12px, font-weight 600.</step>
    <step order="7">Create `admin/js/relay-admin.js` with: (a) 30-second `setInterval` that fetches `/wp-json/relay/v1/inbox-poll` (new REST endpoint) and updates badge counts + pending rows without full reload, (b) sort/filter form enhancement (prevent default, fetch via AJAX), (c) one-click reply confirmation for spam leads.</step>
    <step order="8">Register `/wp-json/relay/v1/inbox-poll` endpoint in `class-admin.php` or `class-form-handler.php` that returns JSON with latest leads and counts. Capability check: `current_user_can('manage_options')`.</step>
    <step order="9">Enqueue CSS and JS only on Relay admin pages using `admin_enqueue_scripts` with `$hook` check.</step>
    <step order="10">Verify `php -l` on all new files. Visual QA: inbox loads, badges render correctly, AJAX polling updates counts, Reply opens email client.</step>
  </steps>

  <verification>
    <check type="build">`php -l admin/views/inbox.php` passes; CSS validates</check>
    <check type="test">Inbox page loads within 2 seconds with 50 leads; filtering by category returns correct subset</check>
    <check type="test">AJAX poll endpoint returns JSON and requires `manage_options` capability</check>
    <check type="manual">Visual QA: badges are color-coded per design tokens; hover states smooth; Reply link opens mailto with correct recipient; polling updates pending count without flash</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Needs relay_lead CPT and taxonomy terms to display" />
    <depends-on task-id="phase-1-task-3" reason="Needs Relay_Admin menu registration and asset enqueue hooks" />
  </dependencies>

  <commit-message>feat: build admin inbox with color-coded badges and AJAX polling

PHP-rendered inbox with custom CSS badges, sort/filter, search, and
one-click Reply (mailto). Vanilla JS 30s AJAX polling for live updates.
Calm command center aesthetic per design tokens.</commit-message>
</task-plan>

### Wave 4

<task-plan id="phase-1-task-9" wave="4">
  <title>Security hardening, i18n, and WP.org readiness</title>
  <requirement>RELAY-013, RELAY-014</requirement>
  <description>
    Final pass across all plugin files to ensure WordPress.org coding standards compliance.
    Add capability checks on every admin action and REST endpoint. Verify all forms use wp_nonce_field
    and check_admin_referer. Escape all output with esc_html, esc_attr, esc_url, wp_kses_post.
    Sanitize all input with sanitize_text_field, sanitize_email, wp_kses. Use $wpdb->prepare for any
    direct queries (though CPT API should be used). Add i18n wrappers (__(), _e(), esc_html__())
    with text domain 'relay'. Create readme.txt with WP.org headers and agency install pitch.
    Verify PHP 7.4+ syntax compatibility throughout.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md" reason="WP.org standards must-have; shared hosting compatibility; API key exposure risk #7" />
    <file path="/home/agent/shipyard-ai/prds/relay-ai-form-handler.md" reason="Must-have #6: WordPress.org coding standards" />
    <file path="projects/relay-ai-form-handler/relay.php" reason="Main file headers and compatibility declaration" />
    <file path="projects/relay-ai-form-handler/includes/class-admin.php" reason="Capability checks and nonce verification" />
    <file path="projects/relay-ai-form-handler/includes/class-form-handler.php" reason="REST permission callbacks and input sanitization" />
  </context>

  <steps>
    <step order="1">Audit every admin page callback: add `current_user_can('manage_options')` bail-out at the top.</step>
    <step order="2">Audit every REST `permission_callback`: ensure it returns `current_user_can('manage_options')` or valid nonce/token.</step>
    <step order="3">Audit every `echo` and print statement: replace with `esc_html()`, `esc_attr()`, `esc_url()`, or `wp_kses_post()` as appropriate.</step>
    <step order="4">Audit every `$_GET`, `$_POST`, `$_REQUEST` access: wrap in `sanitize_text_field()`, `sanitize_email()`, `absint()`, or `wp_kses()`.</step>
    <step order="5">Verify all forms use `wp_nonce_field('relay_action', 'relay_nonce')` and `check_admin_referer('relay_action', 'relay_nonce')`.</step>
    <step order="6">Wrap all user-visible strings with `__()`, `_e()`, or `esc_html__()` using text domain `'relay'`.</step>
    <step order="7">Create `languages/relay.pot` stub with `xgettext` or hand-rolled header. Add `load_plugin_textdomain('relay', false, dirname(plugin_basename(__FILE__)) . '/languages/')` to `relay.php`.</step>
    <step order="8">Create `readme.txt` with WordPress.org standard headers: === Relay ===, Contributors, Tags, Requires at least, Tested up to, Requires PHP, Stable tag, License. Include short description, long description (agency pitch), installation steps, FAQ, and changelog.</step>
    <step order="9">Verify PHP 7.4 compatibility: no union types, no named arguments, no match expressions, no str_contains(). Use `strpos()` instead.</step>
    <step order="10">Run `php -l` recursively on all `.php` files. Perform a final static review for any missed escapes or sanitization gaps.</step>
  </steps>

  <verification>
    <check type="build">`find . -name '*.php' -exec php -l {} \;` returns no errors</check>
    <check type="test">WP_DEBUG enabled; no PHP notices or warnings on any admin page or REST call</check>
    <check type="test">Plugin Check (WP-CLI `wp plugin check relay`) passes with zero errors and zero warnings</check>
    <check type="manual">readme.txt renders correctly on the WP.org plugin readme validator</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Touches relay.php for textdomain and readme" />
    <depends-on task-id="phase-1-task-2" reason="Touches class-storage.php for escaping and capabilities" />
    <depends-on task-id="phase-1-task-3" reason="Touches class-admin.php and settings.php for nonces and escaping" />
    <depends-on task-id="phase-1-task-4" reason="Touches class-form-handler.php for REST permissions and sanitization" />
    <depends-on task-id="phase-1-task-5" reason="Touches class-claude-client.php for error handling robustness" />
    <depends-on task-id="phase-1-task-7" reason="Touches class-async-processor.php for cron security" />
    <depends-on task-id="phase-1-task-8" reason="Touches inbox.php, CSS, JS for escaping and capability checks" />
  </dependencies>

  <commit-message>chore: security hardening, i18n, and WP.org standards compliance

Final pass: capability checks, nonces, input sanitization, output escaping,
i18n wrappers, readme.txt, PHP 7.4 compatibility verification.
Plugin Check passes with zero errors.</commit-message>
</task-plan>

---

## Risk Notes

### Project-Specific Risks

1. **Token Budget Overrun / Shipping Failure** (Critical)
   - The original PRD budgeted 775K tokens including React UI (+150K) and Cloudflare Worker (+75K).
   - Locked decisions cut both, reclaiming ~225K tokens for the PHP-only build.
   - **Mitigation**: Hard ceiling of 40% of session tokens for the inbox layer (per risk register #1). If inbox CSS/JS debugging exceeds budget, auto-simplify to bare WP_List_Table with inline styles. Task 8 is the highest-risk task for token overrun.

2. **Shared Hosting Incompatibility** (Critical)
   - Target environment is cheapest shared hosting (Bluehost/HostGator).
   - WP Cron may be disabled or throttled (risk register #9).
   - **Mitigation**: Task 7 includes manual "Process Now" button and admin notice for disabled cron. Task 9 verifies PHP 7.4+ syntax and zero exotic extensions.

3. **Async UX = "Dead Lead" Gap** (High)
   - User submits form, sees "Unclassified" for minutes until cron fires. Kills the 30-second magic promised in essence.md.
   - **Mitigation**: Task 7 fires `spawn_cron()` immediately on form submission event (Task 4) to trigger classification ASAP. Admin inbox (Task 8) gracefully shows unclassified leads with a pulsing "Processing" badge so nothing feels broken.

4. **Claude API Cost at Scale** (Critical — future)
   - 200K classifications/day ≈ $600/day without caching.
   - **Mitigation**: Task 6 ships hash-based deduplication from day one. Task 7 uses cache before every API call. SaaS metering hooks are out of scope for v1 but the architecture leaves room for counters.

5. **Form Plugin Fragmentation** (Medium)
   - Only CF7 + generic hook ship in v1. Gravity Forms is v1.1.
   - **Mitigation**: Task 4's generic REST endpoint (`/wp-json/relay/v1/submit`) covers most custom form use cases without plugin-specific code.

### Hindsight-Informed Risks

- **Greenfield advantage**: No high-churn or bug-associated files exist for this project. No merge conflicts expected.
- **Planning file churn**: `.planning/phase-1-plan.md` and `.planning/REQUIREMENTS.md` are high-churn files in the broader repo (48 and 44 changes). Coordinate with other active projects (`agentpipe`, `whisper`) to avoid simultaneous edits.
- **Uncommitted changes**: `prds/relay-ai-form-handler.md` and `rounds/relay-ai-form-handler/` are currently untracked. Safe to leave as-is during build.

### Sequencing Notes

- **Wave 1 tasks are fully parallel** — no shared files between task-1, task-2, and task-3 except the conceptual loader registration, which each class handles independently.
- **Wave 2 tasks are fully parallel** once Wave 1 completes — each core logic class is independent.
- **Wave 3 tasks are parallel** once Wave 2 completes. Task 7 (async processor) and Task 8 (inbox) can run simultaneously; the inbox gracefully handles both classified and unclassified leads.
- **Wave 4 must be sequential** after Wave 3 because it touches every file for final hardening.
