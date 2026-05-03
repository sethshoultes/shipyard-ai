# AgentPress v1 — To-Do List

**PRD:** `/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md`
**Plan:** `/home/agent/shipyard-ai/.planning/phase-1-plan.md`

---

## Wave 1 — Foundation

### Task 1: Plugin Bootstrap
- [ ] Create `agentpress/agentpress.php` with WP plugin header — verify: file exists with `Plugin Name: AgentPress`, `Version: 1.0.0`
- [ ] Define constants `AGENTPRESS_VERSION`, `AGENTPRESS_PLUGIN_DIR`, `AGENTPRESS_PLUGIN_URL` — verify: constants are defined and resolve to correct paths
- [ ] Write activation hook registering CPT `agentpress_capability` — verify: `post_type` query returns rows after activation
- [ ] Write activation hook registering CPT `agentpress_log` — verify: `post_type` query returns rows after activation
- [ ] Seed built-in capabilities on activation (`content_writer`, `image_generator`) — verify: two posts exist with correct slugs
- [ ] Create default `agentpress_settings` option — verify: option exists with `default_model = 'claude-3-5-sonnet-20241022'`
- [ ] Implement `agentpress_get_setting()` with wp-config fallback — verify: constant override works when defined
- [ ] Write autoloader for `includes/` and `includes/agents/` — verify: classes load without manual require
- [ ] Hook `plugins_loaded` to initialize core classes — verify: no fatal errors on load
- [ ] Write deactivation hook — verify: rewrite rules flush on deactivate

### Task 2: JSON Parser Hardening
- [ ] Create `includes/class-parser.php` with namespace `AgentPress` — verify: file exists with correct namespace
- [ ] Implement `Parser::extract_json()` with layered approach — verify: direct JSON decode works
- [ ] Add markdown fence stripping to `extract_json()` — verify: `` ```json {...} ``` `` parses correctly
- [ ] Add recursive brace matching fallback — verify: extracts `{...}` from text-wrapped JSON
- [ ] Implement `Parser::validate_routing_json()` — verify: missing `capability` returns WP_Error
- [ ] Implement `Parser::sanitize_payload()` with `wp_kses_post` — verify: `<script>` tags stripped
- [ ] Create test harness `tests/parser-test.php` with 10+ cases — verify: file exists with test cases
- [ ] Run all test cases — verify: all pass with expected results

### Task 3: Admin CSS
- [ ] Create `admin/css/agentpress-admin.css` — verify: file exists
- [ ] Add `.agentpress-wrap` container styles — verify: max-width 1200px set
- [ ] Style `.agentpress-form-table` — verify: tighter row spacing than default
- [ ] Style `.agentpress-status-pill` — verify: green/red variants with correct colors
- [ ] Style `.agentpress-log-table` — verify: zebra striping and hover state
- [ ] Style `.agentpress-section-title` — verify: font-size 16px, weight 600
- [ ] Verify no `!important` declarations — verify: grep returns nothing
- [ ] Verify file under 100 lines — verify: `wc -l` ≤ 100

---

## Wave 2 — Core Classes

### Task 4: Agents Registry
- [ ] Create `includes/class-agents.php` with namespace `AgentPress` — verify: file exists
- [ ] Implement `Agents::get_capabilities()` — verify: returns 2 capabilities
- [ ] Implement `Agents::get_capability($slug)` — verify: returns null for unknown slug
- [ ] Implement `Agents::build_manifest()` — verify: JSON-serializable output
- [ ] Implement `Agents::run_internal($slug, $payload)` — verify: WP_Error for unknown handler
- [ ] Verify no `agentpress_register_capability()` public function — verify: grep returns nothing

### Task 5: Activity Logger
- [ ] Create `includes/class-logger.php` with namespace `AgentPress` — verify: file exists
- [ ] Implement `Logger::log()` — verify: row appears in `wp_posts` after call
- [ ] Store post_meta fields on log — verify: meta exists in `wp_postmeta`
- [ ] Implement `Logger::prune()` — verify: oldest 50 deleted when count > 500
- [ ] Auto-call prune on every log — verify: count stays ≤ 550 after 505 inserts
- [ ] Implement `Logger::get_recent($limit)` — verify: returns array ordered by date DESC
- [ ] Verify no revisions for `agentpress_log` — verify: revision query returns 0

### Task 6: ContentWriter Agent
- [ ] Create `includes/agents/class-content-writer.php` — verify: file exists
- [ ] Implement `Content_Writer::run($payload)` — verify: method exists
- [ ] Validate required `topic` field — verify: WP_Error without topic
- [ ] Validate `tone` enum — verify: WP_Error with invalid tone
- [ ] Build Claude prompt — verify: prompt includes tone, length, topic
- [ ] Call Anthropic Messages API — verify: correct endpoint and headers
- [ ] Parse response with `Parser::extract_json()` — verify: handles API response
- [ ] Truncate output to 2048 chars — verify: `strlen()` ≤ 2048
- [ ] Register `agentpress_run_content_writer()` handler — verify: function exists

### Task 7: ImageGenerator Agent
- [ ] Create `includes/agents/class-image-generator.php` — verify: file exists
- [ ] Implement `Image_Generator::run($payload)` — verify: method exists
- [ ] Validate required `prompt` field — verify: WP_Error without prompt
- [ ] Validate `size` enum — verify: WP_Error with invalid size
- [ ] Call Cloudflare Worker URL — verify: `wp_remote_post` to configured URL
- [ ] Parse Worker response — verify: expects `url`, `format`, `size` keys
- [ ] Validate HTTPS URL scheme — verify: `http://` returns WP_Error
- [ ] Handle timeout gracefully — verify: user-friendly error message
- [ ] Register `agentpress_run_image_generator()` handler — verify: function exists

---

## Wave 3 — Orchestration

### Task 8: Router
- [ ] Create `includes/class-router.php` with namespace `AgentPress` — verify: file exists
- [ ] Define keyword whitelist for ContentWriter — verify: array with write/blog/post/etc
- [ ] Define keyword whitelist for ImageGenerator — verify: array with image/photo/picture/etc
- [ ] Implement `Router::route_local($task)` — verify: stripos matching works
- [ ] Implement `Router::route_claude($task, $context)` — verify: builds system prompt
- [ ] Call Claude Messages API — verify: correct endpoint and headers
- [ ] Parse Claude response with Parser — verify: extracts routing JSON
- [ ] Implement `Router::route()` combining local + Claude — verify: local tried first
- [ ] Test local routing for `write` intent — verify: `source='local'`, no HTTP call
- [ ] Test local routing for `image` intent — verify: `source='local'`, no HTTP call
- [ ] Test Claude fallback for ambiguous intent — verify: `source='claude'`

---

## Wave 4 — Integration

### Task 9: REST API
- [ ] Create `includes/class-rest-api.php` with namespace `AgentPress` — verify: file exists
- [ ] Register `POST /agentpress/v1/run` route — verify: route appears in REST API index
- [ ] Implement permission callback — verify: 401/403 without auth
- [ ] Implement `REST_API::run_task()` — verify: method exists
- [ ] Capture start time for latency — verify: `microtime(true)` called
- [ ] Validate required `task` field — verify: 400 with `agentpress_missing_task`
- [ ] Call `Router::route()` — verify: routing decision used
- [ ] Call `Agents::run_internal()` — verify: agent executed
- [ ] Log execution via `Logger::log()` — verify: log entry created
- [ ] Return correct success shape — verify: `success`, `routing`, `result`, `latency_ms`
- [ ] Return structured errors — verify: `code`, `message`, `data` on failure
- [ ] Set 30s timeout throughout — verify: timeout in all `wp_remote_post` calls

---

## Wave 5 — Admin & Polish

### Task 10: Admin UI
- [ ] Create `admin/class-admin.php` with namespace `AgentPress` — verify: file exists
- [ ] Implement `Admin::add_menu()` — verify: page appears under Tools
- [ ] Implement `Admin::render_page()` — verify: single `div.wrap` with `h1`
- [ ] Register settings fields — verify: `register_setting()` called
- [ ] Render `claude_api_key` field — verify: password input appears
- [ ] Render `cf_worker_url` field — verify: text input appears
- [ ] Render `default_model` field — verify: select dropdown appears
- [ ] Handle wp-config constant overrides — verify: field disabled with note
- [ ] Render Activity Log section — verify: table with Time, Capability, Status, Latency
- [ ] Display status pills — verify: green/red colored badges
- [ ] Enqueue admin CSS — verify: stylesheet loaded on AgentPress page only
- [ ] Verify no tabs — verify: no `.nav-tab-wrapper` in output
- [ ] Verify no manual runner — verify: no textarea with "Run" button

### Task 11: README + Polish
- [ ] Create `readme.txt` with WP.org header — verify: valid header format
- [ ] Write three-paragraph description — verify: exactly 3 paragraphs
- [ ] Write Installation section — verify: upload, activate, configure steps
- [ ] Write API Example with cURL — verify: working cURL command included
- [ ] Add API disclosure — verify: Anthropic TOS mention present
- [ ] Create `class-agent-third.php` placeholder — verify: stub file exists
- [ ] Run exclusion audit — verify: no matches for excluded features
- [ ] Run smoke test — verify: both agents respond via cURL
- [ ] Verify plugin ZIP structure — verify: all files in `agentpress/` directory

---

## Test Scripts

- [ ] Create `tests/check-file-structure.sh` — verify: script exists and is executable
- [ ] Create `tests/check-banned-patterns.sh` — verify: script exists and is executable
- [ ] Create `tests/check-parser-edge-cases.sh` — verify: script exists and is executable
- [ ] Run all test scripts — verify: all exit 0
