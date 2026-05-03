# AgentPress v1 — To-Do List

**Project**: AgentPress WordPress Plugin
**Issue**: sethshoultes/shipyard-ai#90
**Total Tasks**: 11 (5 waves)
**Generated**: 2026-05-03

---

## Wave 1 — Foundation (Parallel)

### Task 1: Plugin Bootstrap + CPT Registration
- [ ] Create `agentpress/agentpress.php` with standard WP plugin header — verify: file exists and contains "Plugin Name: AgentPress"
- [ ] Define plugin constants (AGENTPRESS_VERSION, PLUGIN_DIR, PLUGIN_URL) — verify: constants defined in main file
- [ ] Write activation hook registering `agentpress_capability` CPT — verify: CPT appears in wp-admin after activation
- [ ] Write activation hook registering `agentpress_log` CPT with no revisions/autosave — verify: CPT registered with correct supports array
- [ ] Insert built-in capability posts on activation (content_writer, image_generator) — verify: two posts exist with correct slugs
- [ ] Create default settings option with wp-config.php constant support — verify: option exists in wp_options table
- [ ] Implement `agentpress_get_setting()` helper with constant fallback — verify: returns constant value when defined
- [ ] Write autoloader for classes in `includes/` and `includes/agents/` — verify: classes load without require_once
- [ ] Hook plugin initialization on `plugins_loaded` — verify: no PHP fatal errors on activation
- [ ] Write deactivation hook flushing rewrite rules — verify: plugin deactivates cleanly

### Task 2: JSON Parser Hardening (Critical)
- [ ] Create `includes/class-parser.php` with namespace — verify: class exists and is namespaced
- [ ] Implement `extract_json()` with layered extraction (direct → strip fences → regex) — verify: handles markdown-fenced JSON
- [ ] Implement `validate_routing_json()` with schema checks — verify: returns WP_Error for missing capability key
- [ ] Implement `sanitize_payload()` with recursive wp_kses_post — verify: HTML tags are stripped from string values
- [ ] Create test harness with 10+ edge cases — verify: all test cases produce expected results
- [ ] Test valid JSON parsing — verify: returns parsed array
- [ ] Test markdown fence stripping — verify: `` ```json{"test": "value"}``` `` parses correctly
- [ ] Test truncated JSON handling — verify: returns WP_Error with `agentpress_parser_error`
- [ ] Test hallucinated slug rejection — verify: `{"capability":"seo_meta"}` returns error
- [ ] Test HTML-wrapped JSON extraction — verify: extracts JSON from HTML responses

### Task 3: Admin CSS — Minimal Native Styling
- [ ] Create `admin/css/agentpress-admin.css` — verify: file exists and is under 100 lines
- [ ] Add `.agentpress-wrap` container styles — verify: max-width 1200px applied
- [ ] Style `.agentpress-form-table` with tight spacing — verify: row margin reduced to 12px
- [ ] Create `.agentpress-status-pill` styles (success/error) — verify: green/red pills display correctly
- [ ] Style `.agentpress-log-table` as compact list-table — verify: row height 36px, zebra striping
- [ ] Add `.agentpress-section-title` typography — verify: 16px font, 600 weight, proper color
- [ ] Verify no !important declarations — verify: grep for "!important" returns zero matches
- [ ] Verify all selectors prefixed with `.agentpress-` — verify: no conflicts with other plugins
- [ ] Check file size under 3KB — verify: wc -l shows under 100 lines
- [ ] Validate CSS syntax — verify: no parse errors in browser dev tools

---

## Wave 2 — Core Classes (Parallel)

### Task 4: Agents Base Class + Capability Registry
- [ ] Create `includes/class-agents.php` with namespace — verify: class loads via autoloader
- [ ] Implement `get_capabilities()` querying agentpress_capability CPT — verify: returns array with 2 capabilities
- [ ] Implement `get_capability($slug)` returning single capability — verify: returns null for missing slug
- [ ] Implement `build_manifest()` with compact schema — verify: returns JSON-serializable array
- [ ] Implement `run_internal()` calling handler functions — verify: calls `agentpress_run_content_writer()`
- [ ] Define `agentpress_init` action hook — verify: fires during plugin initialization
- [ ] Verify no public `agentpress_register_capability()` function — verify: grep returns zero matches
- [ ] Test capability retrieval with correct metadata — verify: all meta fields populated
- [ ] Test manifest serialization to JSON — verify: json_encode() succeeds without errors
- [ ] Test internal handler dispatch — verify: correct handler called for each capability

### Task 5: Activity Logger
- [ ] Create `includes/class-logger.php` with namespace — verify: class loads without errors
- [ ] Implement `log()` method inserting agentpress_log post — verify: post appears in database
- [ ] Store post_meta fields (capability, payload, result, latency, status) — verify: meta exists in wp_postmeta
- [ ] Implement `prune()` deleting oldest 50 when count > 500 — verify: count never exceeds 550
- [ ] Call prune() automatically on every log insertion — verify: pruning triggers without manual call
- [ ] Implement `get_recent($limit)` returning last N logs — verify: returns ordered array with meta
- [ ] Disable revisions for agentpress_log CPT — verify: no _wp_post_revision rows exist
- [ ] Disable autosave for agentpress_log CPT — verify: wp_is_post_autosave returns false
- [ ] Test pruning with 505 entries — verify: oldest 50 deleted, count = 455
- [ ] Test log retrieval with limit — verify: correct number and order returned

### Task 6: ContentWriter Agent
- [ ] Create `includes/agents/class-content-writer.php` — verify: class exists under correct namespace
- [ ] Implement `run($payload)` with input validation — verify: WP_Error for missing topic
- [ ] Build Claude prompt with topic/tone/length variables — verify: prompt contains correct format
- [ ] Call Anthropic Messages API with proper headers — verify: API request succeeds with valid key
- [ ] Parse response using Parser::extract_json() — verify: extracts JSON from Claude response
- [ ] Validate result contains 'text' field — verify: WP_Error for malformed response
- [ ] Truncate text to 2048 characters — verify: longer responses trimmed correctly
- [ ] Extract tokens_used from API response — verify: returns usage.output_tokens or 0
- [ ] Register handler function `agentpress_run_content_writer()` — verify: function exists and calls class
- [ ] Test with valid API key — verify: returns array with text and tokens_used

### Task 7: ImageGenerator Agent
- [ ] Create `includes/agents/class-image-generator.php` — verify: class exists and loads
- [ ] Implement `run($payload)` with prompt/size validation — verify: WP_Error for invalid size
- [ ] Call Cloudflare Worker URL via wp_remote_post — verify: request succeeds with valid URL
- [ ] Parse Worker response JSON — verify: extracts url, format, size fields
- [ ] Validate HTTPS URL scheme — verify: WP_Error for http:// URLs
- [ ] Handle relative URLs with known Worker domain — verify: prepends https:// when appropriate
- [ ] Return array with url, format, size — verify: response structure matches spec
- [ ] Register handler function `agentpress_run_image_generator()` — verify: function calls class method
- [ ] Add timeout guard with user-friendly error — verify: timeout returns proper error message
- [ ] Test with valid Worker endpoint — verify: returns HTTPS URL with correct metadata

---

## Wave 3 — Orchestration (Sequential)

### Task 8: Router — Keyword Map + Claude Fallback
- [ ] Create `includes/class-router.php` with namespace — verify: class loads via autoloader
- [ ] Define locked keyword whitelist arrays — verify: ContentWriter and ImageGenerator triggers defined
- [ ] Implement `route_local()` with case-insensitive matching — verify: 'write' routes to content_writer
- [ ] Implement `route_claude()` with system prompt and manifest — verify: calls Claude API correctly
- [ ] Parse Claude response using parser methods — verify: validates routing JSON schema
- [ ] Return WP_Error for 'capability': 'none' — verify: agentpress_no_match error code
- [ ] Implement `route()` trying local first, then Claude — verify: local routing avoids API calls
- [ ] Log routing decisions for debugging — verify: log entries show source (local/claude)
- [ ] Test local routing with exact keywords — verify: no HTTP requests made for local matches
- [ ] Test Claude fallback with ambiguous input — verify: Claude API called for unclear intents
- [ ] Test invalid capability handling — verify: returns error for unknown capabilities

---

## Wave 4 — Integration (Sequential)

### Task 9: REST API Endpoint — Single Public Interface
- [ ] Create `includes/class-rest-api.php` with namespace — verify: class registers REST routes
- [ ] Register `POST /agentpress/v1/run` endpoint — verify: route appears in WP REST API index
- [ ] Implement permission callback checking capabilities — verify: returns 401 for unauthenticated requests
- [ ] Validate request args (task required, context optional) — verify: 400 error for missing task
- [ ] Capture start time for latency calculation — verify: latency_ms > 0 in responses
- [ ] Call Router::route() for capability determination — verify: routing results included in response
- [ ] Handle routing errors with proper HTTP codes — verify: 500 with structured error data
- [ ] Execute agent via Agents::run_internal() — verify: agent results returned in response
- [ ] Log all executions via Logger::log() — verify: CPT entries created for API calls
- [ ] Return standardized success response — verify: 200 with success, routing, result, latency_ms
- [ ] Test with ContentWriter task — verify: returns text and routing data
- [ ] Test with ImageGenerator task — verify: returns HTTPS URL and proper routing
- [ ] Test error handling — verify: structured errors with codes and messages
- [ ] Verify authentication requirement — verify: Application Password or manage_options required

---

## Wave 5 — Admin & Polish (Parallel)

### Task 10: Admin UI — One Crafted Screen
- [ ] Create `admin/class-admin.php` with namespace — verify: class loads without errors
- [ ] Add submenu page under Tools → AgentPress — verify: menu item appears and loads page
- [ ] Render page with single div.wrap and h1 — verify: page title "AgentPress" displays
- [ ] Register settings fields with sanitization — verify: settings save and persist correctly
- [ ] Add API key field with password input type — verify: field masks input value
- [ ] Add Worker URL field with URL validation — verify: saves only valid URLs
- [ ] Add model dropdown with default option — verify: dropdown populates and saves selection
- [ ] Implement wp-config.php constant override UI — verify: fields disabled with note when constants defined
- [ ] Query and display recent logs in table — verify: log viewer shows last 50 entries
- [ ] Add status pill styling for log entries — verify: success/error pills display with colors
- [ ] Show placeholder message when no logs exist — verify: message appears with endpoint URL
- [ ] Enqueue admin CSS only on AgentPress pages — verify: CSS loads on admin page, not elsewhere
- [ ] Test settings save and reload — verify: values persist after page refresh
- [ ] Test constant override behavior — verify: defined constants disable fields correctly

### Task 11: Readme + Integration + Exclusion Verification
- [ ] Create readme.txt with WordPress.org header — verify: proper format and metadata
- [ ] Write Description section (exactly 3 paragraphs) — verify: concise, clear description
- [ ] Write Installation instructions — verify: upload, activate, configure steps
- [ ] Add API Example section with cURL command — verify: valid curl syntax with auth
- [ ] Add Anthropic Terms of Service disclosure — verify: compliance notice present
- [ ] Create placeholder third-agent stub — verify: class-agent-third.php with not_implemented error
- [ ] Run exclusion audit for banned features — verify: zero matches for all 10 excluded patterns
- [ ] Perform smoke test with both agents — verify: cURL requests succeed with valid keys
- [ ] Verify log entries appear in admin — verify: smoke test logs show correctly
- [ ] Check plugin ZIP structure — verify: all files in agentpress/ directory, no build artifacts
- [ ] Verify plugin size under 500KB — verify: du -sh shows acceptable size
- [ ] Validate readme.txt for WordPress.org — verify: header format and required sections present

---

## Final Verification

- [ ] All PHP files load without fatal errors — verify: plugin activates on clean WordPress install
- [ ] All tests pass without exceptions — verify: test scripts return exit code 0
- [ ] Average latency under 4000ms — verify: both agents respond within time limit
- [ ] Plugin ready for WordPress.org submission — verify: meets all guidelines and requirements

---

## Notes

- Each task should be completable in under 5 minutes
- Verification steps must be concrete and testable
- Mark tasks as completed only when verification passes
- Failed verification means task is not complete
- Do not proceed to dependent tasks until prerequisites are verified
