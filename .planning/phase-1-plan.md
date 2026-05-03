# Phase 1 Plan — AgentPress v1 WordPress Plugin

**Generated**: 2026-05-03
**Project Slug**: `prd-agentpress-2026-05-03`
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 11
**Waves**: 5
**Build Target**: Single session, shippable MVP

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R-001, R-002, R-003, R-004, R-038, R-056 | phase-1-task-1 | 1 |
| R-019, R-020, R-021, R-022, R-023 | phase-1-task-2 | 1 |
| R-050 | phase-1-task-3 | 1 |
| R-037, R-039 | phase-1-task-4 | 2 |
| R-040, R-041, R-042 | phase-1-task-5 | 2 |
| R-024, R-025, R-026, R-027, R-028 | phase-1-task-6 | 2 |
| R-029, R-030, R-031, R-032, R-033, R-034 | phase-1-task-7 | 2 |
| R-014, R-015, R-016, R-017, R-018 | phase-1-task-8 | 3 |
| R-005, R-006, R-007, R-008, R-009, R-010, R-011, R-012, R-013, R-063 | phase-1-task-9 | 4 |
| R-044, R-045, R-046, R-047, R-048, R-049, R-050, R-051, R-052, R-053 | phase-1-task-10 | 5 |
| R-057, R-058, R-059, R-060, R-061, R-062, R-064, R-065, R-066–R-075 | phase-1-task-11 | 5 |

---

## Risk Notes (from Hindsight + Risk Scanner)

**Hindsight Context**: The AgentPress plugin is a **net-new codebase** with no direct overlap with high-churn or bug-associated files from the Shipyard AI repo. Uncommitted changes exist in `.agent-logs/debate/`, `prds/`, and `rounds/` — these are debate artifacts for this PRD and do not affect the build.

**High-Risk Files** (flagged for careful sequencing):
1. `includes/class-parser.php` — Single point of failure for entire pipeline. JSON edge cases (markdown fences, truncated responses, hallucinated slugs) will sink the product if not hardened.
2. `includes/class-router.php` — Keyword map must correctly route; Claude fallback adds 4–8s latency. Wrong routing = wrong agent = broken UX.
3. `includes/class-logger.php` — CPT writes per task. Shared hosting (64MB, cheap DB) can choke. No revisions, no autosave, aggressive pruning required.
4. `includes/agents/class-image-generator.php` — Image generation timeouts on shared hosts with 30s PHP limit. Fallback strategy needed.
5. `includes/class-rest-api.php` — All errors and success flow through here. Error shape must be consistent and informative.

**Mitigation Strategy**:
- Build parser FIRST in Wave 1 and test with 10+ edge cases before any agent logic.
- Build router in Wave 3 only after agents are proven working.
- REST API in Wave 4 ties everything together.
- Admin UI in Wave 5 — after all backend behavior is locked.

---

## Wave Execution Order

### Wave 1 — Foundation (Parallel)
*Build the plugin skeleton, parser, and minimal admin CSS. These tasks have no interdependencies.*

<task-plan id="phase-1-task-1" wave="1">
  <title>Plugin Bootstrap + CPT Registration</title>
  <requirement>R-001, R-002, R-003, R-004, R-038, R-056</requirement>
  <description>
    Create the main plugin file and activation hooks. Register the two private CPTs (agentpress_capability and agentpress_log) on activation. Auto-register ContentWriter and ImageGenerator capability posts on first activation. Set up the default settings option with wp-config.php constant fallback support.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.1 (bootstrap), §5.2 (registry), §7 (CPT schema, option schema)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="File Structure (what files must exist), Decision 6 (key storage = standard options or wp-config constants), Decision 7 (CPT-based memory stays)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-001 through R-004, R-038, R-056 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/adminpulse/adminpulse.php" reason="Reusable plugin header + activation hook pattern" />
    <file path="/home/agent/shipyard-ai/deliverables/wp-intelligence-suite/wis-core/wis-core.php" reason="Default options with existence checks pattern" />
  </context>

  <steps>
    <step order="1">Create `agentpress/agentpress.php` with standard WP plugin header (Plugin Name: AgentPress, Version: 1.0.0, Author: Shipyard AI, Text Domain: agentpress). Define namespace `AgentPress`.</step>
    <step order="2">Define plugin constants: `AGENTPRESS_VERSION`, `AGENTPRESS_PLUGIN_DIR`, `AGENTPRESS_PLUGIN_URL`.</step>
    <step order="3">Write activation hook that registers CPT `agentpress_capability` with `public => false`, `show_ui => false`, `show_in_menu => false`, `supports => array('title')`, `rewrite => false`, `has_archive => false`.</step>
    <step order="4">Write activation hook that registers CPT `agentpress_log` with `public => false`, `show_ui => false`, `show_in_menu => false`, `supports => array()`, `rewrite => false`, `has_archive => false`. Explicitly disable revisions and autosave via filters.</step>
    <step order="5">On activation, insert two `agentpress_capability` posts: slug `content_writer` (title "Content Writer") and slug `image_generator` (title "Image Generator"). Store post_meta: `_agentpress_name`, `_agentpress_description`, `_agentpress_input_schema` (serialized array per PRD §5.4), `_agentpress_handler` = `internal`.</step>
    <step order="6">On activation, create default option `agentpress_settings` if it does not exist: `array('claude_api_key' => '', 'cf_worker_url' => '', 'default_model' => 'claude-3-5-sonnet-20241022', 'installed_version' => '1.0.0')`.</step>
    <step order="7">Implement `agentpress_get_setting($key)` helper that checks `wp-config.php` constants first (`AGENTPRESS_CLAUDE_KEY`, `AGENTPRESS_CF_WORKER_URL`, `AGENTPRESS_DEFAULT_MODEL`) before falling back to the option value.</step>
    <step order="8">Write autoloader in `agentpress.php` that maps class names to `includes/` and `includes/agents/` files (e.g., `AgentPress\Router` → `includes/class-router.php`).</step>
    <step order="9">Hook `plugins_loaded` to initialize core classes in order: Agents, Parser, Logger, Router, REST_API, Admin.</step>
    <step order="10">Write deactivation hook that flushes rewrite rules.</step>
  </steps>

  <verification>
    <check type="manual">Activate plugin on a clean WordPress install; verify no fatal errors in `wp-content/debug.log`.</check>
    <check type="manual">Check wp-admin → Tools menu; confirm no AgentPress menu item appears yet (Admin task is Wave 5).</check>
    <check type="manual">Query database: `SELECT post_type FROM wp_posts WHERE post_type LIKE 'agentpress_%'` should return `agentpress_capability` and `agentpress_log` rows.</check>
    <check type="manual">Query `wp_options` for `agentpress_settings`; confirm serialized array with default model set.</check>
  </verification>

  <dependencies>
    <!-- Empty: Wave 1 independent task -->
  </dependencies>

  <commit-message>feat(bootstrap): plugin main file, CPTs, activation hooks, and settings infrastructure</commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>JSON Parser Hardening</title>
  <requirement>R-019, R-020, R-021, R-022, R-023</requirement>
  <description>
    Build the JSON parser utility that extracts and validates JSON from Claude responses. This is the highest-risk file in the entire product. It must handle markdown fences, truncated JSON, hallucinated slugs, and malformed responses without crashing the pipeline. Budget 30 minutes of build time for edge-case testing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.3 (parse JSON from Claude response), §6 (error shapes)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 12 (JSON parser hardening is non-negotiable); Risk Register (JSON parsing collapses pipeline = High/Critical)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-019 through R-023 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/relay-ai-form-handler/includes/class-claude-client.php" reason="Reusable JSON extraction from Claude response text pattern" />
  </context>

  <steps>
    <step order="1">Create `includes/class-parser.php` with namespace `AgentPress`. Class `Parser` with static methods.</step>
    <step order="2">Implement `Parser::extract_json($raw_response)` with layered extraction: (1) try `json_decode()` directly with `JSON_THROW_ON_ERROR` in try/catch; (2) if that fails, regex strip markdown code fences (`/^```json\s*|\s*```$/m`); (3) if still fails, regex extract first `{...}` block using recursive brace matching; (4) if all fail, return WP_Error with `agentpress_parser_error`.</step>
    <step order="3">Implement `Parser::validate_routing_json($data)` that checks: `$data` is array, `capability` key exists and is string, `reasoning` key exists and is string (optional but recommended), `payload` key exists and is array/object (optional). Return WP_Error with specific message if validation fails.</step>
    <step order="4">Implement `Parser::sanitize_payload($payload)` that recursively walks arrays and applies `wp_kses_post` to all string values.</step>
    <step order="5">Create a test harness file `tests/parser-test.php` (outside plugin loader) with 10+ test cases: valid JSON, markdown-fenced JSON, truncated JSON, missing capability key, hallucinated slug (`{"capability":"seo_meta"}`), nested payload, empty response, HTML-wrapped JSON, extra text before/after JSON, invalid JSON syntax.</step>
    <step order="6">Run all test cases manually (CLI or browser) and verify each returns expected result (parsed array or WP_Error). Fix any failures before proceeding.</step>
  </steps>

  <verification>
    <check type="manual">Run parser test harness: all 10+ cases pass with expected results.</check>
    <check type="manual">Verify markdown fence stripping: input `` ```json{"capability":"content_writer"}``` `` returns valid parsed array.</check>
    <check type="manual">Verify truncated JSON returns WP_Error with `agentpress_parser_error` code, not PHP fatal.</check>
    <check type="manual">Verify hallucinated slug (`seo_meta`) returns WP_Error indicating invalid capability.</check>
  </verification>

  <dependencies>
    <!-- Empty: Wave 1 independent task -->
  </dependencies>

  <commit-message>feat(parser): JSON parser with markdown fence stripping, truncation handling, and schema validation</commit-message>
</task-plan>

<task-plan id="phase-1-task-3" wave="1">
  <title>Admin CSS — Minimal Native Styling</title>
  <requirement>R-050</requirement>
  <description>
    Create the minimal admin CSS file that elevates native WordPress form-table and list-table patterns with tight spacing and precise typography. No custom CSS frameworks. The goal is "crafted but native" — sparse, confident styling that feels at home in wp-admin.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §8 (UI/UX: core styles, WP admin colors, sentence case, terse copy)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 3 (one crafted screen, no tabs, no wizards); Decision 10 (brand voice: master craftsman — sparse, every word earns its place)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-050 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create `admin/css/agentpress-admin.css`.</step>
    <step order="2">Add `.agentpress-wrap` container: max-width 1200px, consistent with WP admin wrap.</step>
    <step order="3">Style `.agentpress-form-table` (extends `.form-table`): tighten row spacing (margin-bottom 12px instead of 20px), increase label font-weight to 600, keep native WP colors.</step>
    <step order="4">Style `.agentpress-status-pill`: display inline-block, padding 4px 10px, border-radius 12px, font-size 11px, text-transform uppercase, letter-spacing 0.5px. Green: `background: #d4edda; color: #155724;`. Red: `background: #f8d7da; color: #721c24;`.</step>
    <step order="5">Style `.agentpress-log-table` (extends `.wp-list-table`): compact row height (36px), subtle zebra striping (`nth-child(even) background: #f9f9f9`), hover state `#f0f0f0`.</step>
    <step order="6">Style `.agentpress-section-title`: font-size 16px, font-weight 600, margin 24px 0 12px, color `#1d2327` (WP dark).</step>
    <step order="7">Ensure no !important declarations, no Tailwind/Bootstrap classes, no custom font imports. Keep under 100 lines total.</step>
  </steps>

  <verification>
    <check type="manual">File size is under 100 lines and under 3KB.</check>
    <check type="manual">CSS validates without errors via a CSS linter or manual review.</check>
    <check type="manual">All selectors prefixed with `.agentpress-` to avoid conflicts with other plugins.</check>
  </verification>

  <dependencies>
    <!-- Empty: Wave 1 independent task -->
  </dependencies>

  <commit-message>style(admin): minimal native WordPress admin CSS with status pills and compact tables</commit-message>
</task-plan>

---

### Wave 2 — Core Classes (Parallel, after Wave 1)
*Build the agent base, logger, and both built-in agents. These depend on the plugin bootstrap being present but not on each other (except agents need the base class interface).*

<task-plan id="phase-1-task-4" wave="2">
  <title>Agents Base Class + Capability Registry</title>
  <requirement>R-037, R-039</requirement>
  <description>
    Create the agent base class and capability registry loader. In v1 this is internal-only: no `agentpress_register_capability()` public API (Decision 8). The registry loads built-in agents from the `agentpress_capability` CPT and provides a manifest for the router.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.2 (registry), §5.4 (built-in agents), §7 (CPT schema)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 4 (two agents ship), Decision 7 (CPT-based registry), Decision 8 (no dev API in v1)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-037, R-039 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/github-issue-sethshoultes-shipyard-ai-77/stage/includes/post-type.php" reason="CPT meta save/query patterns" />
  </context>

  <steps>
    <step order="1">Create `includes/class-agents.php` with namespace `AgentPress`. Class `Agents`.</step>
    <step order="2">Implement `Agents::get_capabilities()` that queries `agentpress_capability` CPT (all published private posts) and returns array of capabilities with slug, name, description, input_schema, handler.</step>
    <step order="3">Implement `Agents::get_capability($slug)` that returns single capability by slug, or `null` if not found.</step>
    <step order="4">Implement `Agents::build_manifest()` that returns a compact array of `slug + description + input_schema keys` for the Claude system prompt.</step>
    <step order="5">Implement `Agents::run_internal($slug, $payload)` that looks up the capability and calls the matching internal handler function: `agentpress_run_content_writer($payload)` or `agentpress_run_image_generator($payload)`. Return WP_Error if slug not found or handler not internal.</step>
    <step order="6">Define action hook `agentpress_init` fired during plugin init so other classes can register after bootstrap.</step>
    <step order="7">Verify no `agentpress_register_capability()` public function is exposed.</step>
  </steps>

  <verification>
    <check type="manual">Call `Agents::get_capabilities()` and verify it returns exactly two capabilities (`content_writer`, `image_generator`) with all meta populated.</check>
    <check type="manual">Call `Agents::build_manifest()` and verify JSON-serializable array with descriptions and schema keys.</check>
    <check type="manual">Search codebase for `function agentpress_register_capability`; confirm it does not exist.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="CPT must be registered and built-in capability posts must exist before querying" />
  </dependencies>

  <commit-message>feat(agents): internal capability registry with CPT storage and manifest builder</commit-message>
</task-plan>

<task-plan id="phase-1-task-5" wave="2">
  <title>Activity Logger</title>
  <requirement>R-040, R-041, R-042</requirement>
  <description>
    Create the CPT-based activity logger. Every task execution writes a log entry. Implement aggressive auto-pruning (delete oldest 50 when count exceeds 500) to mitigate shared-hosting DB bloat. Disable revisions and autosave explicitly.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.3 (log transaction), §7 (CPT schema, prune policy)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 7 (CPT-based memory stays); Risk Register (CPT logging strains shared hosting)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-040, R-041, R-042 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create `includes/class-logger.php` with namespace `AgentPress`. Class `Logger`.</step>
    <step order="2">Implement `Logger::log($task, $capability, $payload, $result, $latency_ms, $status)` that inserts a new `agentpress_log` post. `post_title` = truncated task string (max 100 chars). `post_status` = `publish`. `post_date` = current time.</step>
    <step order="3">Store post_meta: `_agentpress_capability` (string), `_agentpress_payload` (serialized array), `_agentpress_result` (serialized array), `_agentpress_latency_ms` (int), `_agentpress_status` (string: `success` or `error`).</step>
    <step order="4">Implement `Logger::prune()` that counts all `agentpress_log` posts; if count > 500, delete oldest 50 by `post_date` ASC. Use `wp_delete_post($id, true)` for force delete (bypass trash).</step>
    <step order="5">Call `Logger::prune()` automatically on every `log()` insertion. Wrap in try/catch so pruning failure does not block the task.</step>
    <step order="6">Implement `Logger::get_recent($limit = 50)` that queries last N logs ordered by `post_date DESC`, returns array of objects with all meta fields.</step>
    <step order="7">Verify `agentpress_log` CPT has `supports => array()` and that `wp_is_post_revision` / `wp_is_post_autosave` filters return false for this post type.</step>
  </steps>

  <verification>
    <check type="manual">Call `Logger::log()` with sample data; verify row appears in `wp_posts` and meta in `wp_postmeta`.</check>
    <check type="manual">Create 505 log entries programmatically; verify oldest 50 are auto-deleted and count stays ≤ 550.</check>
    <check type="manual">Confirm no revisions exist for `agentpress_log` posts via `wp_posts` query.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Log CPT must be registered before inserting logs" />
  </dependencies>

  <commit-message>feat(logger): CPT activity log with auto-prune and zero-revision guardrails</commit-message>
</task-plan>

<task-plan id="phase-1-task-6" wave="2">
  <title>ContentWriter Agent</title>
  <requirement>R-024, R-025, R-026, R-027, R-028</requirement>
  <description>
    Build the ContentWriter built-in agent. It accepts topic/tone/length, builds a prompt, calls Claude via wp_remote_post, and returns text + tokens_used. Output truncated to 2048 characters. This is the killer wedge — the core value proposition of AgentPress.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.4 (ContentWriter specification)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 4 (ContentWriter is the wedge); Decision 12 (JSON parser hardening — agent output must be parseable)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-024 through R-028 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/relay-ai-form-handler/includes/class-claude-client.php" reason="Reusable Claude API call pattern: headers, body, timeout, retry" />
  </context>

  <steps>
    <step order="1">Create `includes/agents/class-content-writer.php` with namespace `AgentPress\Agents`. Class `Content_Writer`.</step>
    <step order="2">Implement static `run($payload)` method that validates `$payload` contains `topic` (string, required), `tone` (string, enum friendly/professional/witty, default friendly), `length` (string, enum short/medium/long, default medium). Return WP_Error if validation fails.</step>
    <step order="3">Build Claude prompt: "Write a {$tone} {$length} piece about {$topic}. Return ONLY a JSON object: {\"text\":\"...\",\"tokens_used\":0}. No markdown."</step>
    <step order="4">Call Anthropic Messages API via `wp_remote_post`: endpoint `https://api.anthropic.com/v1/messages`, headers `Content-Type: application/json`, `x-api-key: {claude_api_key}`, `anthropic-version: 2023-06-01`, timeout 30s, max_tokens 1024, model from settings.</step>
    <step order="5">Parse response using `AgentPress\Parser::extract_json()` (from class-parser.php). Validate result contains `text` (string). Return WP_Error if parsing fails.</step>
    <step order="6">Truncate `text` to 2048 characters if longer. Set `tokens_used` from API response `usage.output_tokens` (or 0 if unavailable).</step>
    <step order="7">Return array: `['text' => $text, 'tokens_used => $tokens_used]`.</step>
    <step order="8">Register internal handler function `agentpress_run_content_writer($payload)` that instantiates and calls `Content_Writer::run($payload)`.</step>
  </steps>

  <verification>
    <check type="manual">Call `Content_Writer::run(['topic'=>'hiking boots','tone'=>'friendly','length'=>'short'])` with a valid API key; verify response contains `text` and `tokens_used`.</check>
    <check type="manual">Verify output text is truncated to 2048 chars when a long response is returned (mock if needed).</check>
    <check type="manual">Pass invalid tone (`casual`); verify WP_Error returned with clear message.</check>
    <check type="manual">Pass payload without `topic`; verify WP_Error returned.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Settings option must exist to retrieve Claude API key" />
    <depends-on task-id="phase-1-task-2" reason="Parser must be available to extract JSON from Claude response" />
  </dependencies>

  <commit-message>feat(agent): ContentWriter agent with topic/tone/length schema and Claude integration</commit-message>
</task-plan>

<task-plan id="phase-1-task-7" wave="2">
  <title>ImageGenerator Agent</title>
  <requirement>R-029, R-030, R-031, R-032, R-033, R-034</requirement>
  <description>
    Build the ImageGenerator built-in agent. It accepts prompt/size, calls the configured Cloudflare Workers AI endpoint, and returns a HTTPS URL + format + size. Handle timeouts and shared-hosting constraints gracefully.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.4 (ImageGenerator specification)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 4 (ImageGenerator ships); Risk Register (image generation timeout/memory on shared hosts)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-029 through R-034 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/src/generators/worker.ts" reason="Cloudflare Workers AI binding and request pattern" />
  </context>

  <steps>
    <step order="1">Create `includes/agents/class-image-generator.php` with namespace `AgentPress\Agents`. Class `Image_Generator`.</step>
    <step order="2">Implement static `run($payload)` method that validates `$payload` contains `prompt` (string, required, max 500 chars), `size` (string, enum 512x512/1024x1024, default 1024x1024). Return WP_Error if validation fails.</step>
    <step order="3">Call configured Cloudflare Worker URL (`cf_worker_url` from settings) via `wp_remote_post`. POST body: `wp_json_encode(['prompt' => $prompt, 'size' => $size])`. Timeout: 30s. Headers: `Content-Type: application/json`.</step>
    <step order="4">Parse Worker response. Expect JSON with `url` (string), `format` (string), `size` (string). If Worker returns binary or non-JSON, return WP_Error.</step>
    <step order="5">Validate URL scheme is `https://`. If `http://`, reject with WP_Error. If relative URL, prepend `https://` if the Worker domain is known, otherwise reject.</step>
    <step order="6">Return array: `['url' => $url, 'format' => $format, 'size' => $size]`.</step>
    <step order="7">Register internal handler function `agentpress_run_image_generator($payload)` that instantiates and calls `Image_Generator::run($payload)`.</step>
    <step order="8">Add timeout guard: if `wp_remote_post` returns WP_Error with `http_request_failed`, return user-friendly error: "Image generation timed out. Try a smaller size or simpler prompt."</step>
  </steps>

  <verification>
    <check type="manual">Call `Image_Generator::run(['prompt'=>'a cat in a hat','size'=>'512x512'])` with a valid Worker URL; verify response contains HTTPS `url`, `format`, `size`.</check>
    <check type="manual">Pass `http://` URL in mock response; verify WP_Error with HTTPS guardrail message.</check>
    <check type="manual">Pass invalid size (`2048x2048`); verify WPError returned.</check>
    <check type="manual">Simulate Worker timeout (mock or use unreachable URL); verify graceful WP_Error, not PHP fatal.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Settings option must exist to retrieve Cloudflare Worker URL" />
  </dependencies>

  <commit-message>feat(agent): ImageGenerator agent with Cloudflare Workers AI integration and HTTPS guardrails</commit-message>
</task-plan>

---

### Wave 3 — Orchestration (after Wave 2)
*The router ties the keyword map and Claude fallback together. It depends on the agents being registered and the parser being hardened.*

<task-plan id="phase-1-task-8" wave="3">
  <title>Router — Keyword Map + Claude Fallback</title>
  <requirement>R-014, R-015, R-016, R-017, R-018</requirement>
  <description>
    Build the orchestration layer. Local PHP keyword map short-circuits obvious intents (write/blog/post → ContentWriter; image/photo/picture → ImageGenerator). Claude fallback handles ambiguous input. This is the product's soul — "one mind, not a bag of tools."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.3 (router flow, system prompt, Claude integration)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 2 (router architecture stays: local keyword map + Claude fallback); Decisions Open Q #2 (keyword whitelist needs locking)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-014 through R-018 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/relay-ai-form-handler/includes/class-claude-client.php" reason="Reusable Claude API client pattern for Messages API" />
  </context>

  <steps>
    <step order="1">Create `includes/class-router.php` with namespace `AgentPress`. Class `Router`.</step>
    <step order="2">Define locked keyword whitelist in code as associative array:
      - ContentWriter triggers: `['write', 'content', 'blog', 'post', 'article', 'text', 'draft', 'compose', 'generate text']`
      - ImageGenerator triggers: `['image', 'picture', 'photo', 'graphic', 'generate image', 'create image', 'featured image']`
    </step>
    <step order="3">Implement `Router::route_local($task)` that checks `$task` string (case-insensitive) against keyword map using `stripos`. Returns matched capability slug or `null`.</step>
    <step order="4">Implement `Router::route_claude($task, $context)` that builds system prompt with capability manifest from `Agents::build_manifest()`. Prompt instructs Claude to return ONLY JSON: `{"capability":"slug","reasoning":"...","payload":{...}}` or `{"capability":"none","reasoning":"..."}`.</step>
    <step order="5">Call Claude Messages API via `wp_remote_post` with timeout 30s. Parse response with `Parser::extract_json()` and `Parser::validate_routing_json()`.</step>
    <step order="6">If Claude returns `capability: none` or unknown slug, return WP_Error with `agentpress_no_match` code.</step>
    <step order="7">Implement `Router::route($task, $context)` that tries local map first; if miss, calls Claude fallback; logs routing decision for debugging.</step>
    <step order="8">Return routing result array: `['capability' => $slug, 'reasoning' => $reason, 'payload' => $payload, 'source' => 'local'|'claude']`.</step>
  </steps>

  <verification>
    <check type="manual">Call `Router::route('write a blog post about hiking')` and verify `source=local`, `capability=content_writer`.</check>
    <check type="manual">Call `Router::route('generate an image of a mountain')` and verify `source=local`, `capability=image_generator`.</check>
    <check type="manual">Call `Router::route('something ambiguous')` with a valid API key; verify `source=claude` and capability is one of the two built-ins or `none`.</check>
    <check type="manual">Verify local routing does NOT call Claude API (no HTTP request made).</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Parser must be hardened to handle Claude routing response JSON" />
    <depends-on task-id="phase-1-task-4" reason="Agents registry must provide capability manifest for system prompt" />
    <depends-on task-id="phase-1-task-6" reason="ContentWriter must be registered as a routable capability" />
    <depends-on task-id="phase-1-task-7" reason="ImageGenerator must be registered as a routable capability" />
  </dependencies>

  <commit-message>feat(router): local keyword map with Claude fallback for ambiguous intent routing</commit-message>
</task-plan>

---

### Wave 4 — Integration (after Wave 3)
*The REST API endpoint wires auth, validation, router, agents, parser, and logger into a single synchronous interface. This is the only public API surface.*

<task-plan id="phase-1-task-9" wave="4">
  <title>REST API Endpoint — Single Public Interface</title>
  <requirement>R-005, R-006, R-007, R-008, R-009, R-010, R-011, R-012, R-013, R-063</requirement>
  <description>
    Build the single REST endpoint `POST /wp-json/agentpress/v1/run`. It authenticates, validates, routes, executes, logs, and returns the standardized response shape. No other endpoints. No streaming. Synchronous only. This is the primary interface — the only way the world talks to AgentPress.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.3 (full flow), §6 (API spec, request/response shapes)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 5 (REST endpoint is the only interface); Decision 9 (no front-end chat); Decision 11 (no streaming, synchronous only)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-005 through R-013, R-063 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/prd-agentbridge-wordpress-mcp-server/build/agentbridge/includes/class-server.php" reason="Reusable REST route registration, permission callback, JSON response pattern" />
  </context>

  <steps>
    <step order="1">Create `includes/class-rest-api.php` with namespace `AgentPress`. Class `REST_API`.</step>
    <step order="2">Implement `REST_API::register_routes()` hooked to `rest_api_init`. Register `POST /agentpress/v1/run` with:
      - `permission_callback`: check `current_user_can('manage_options')` OR `current_user_can('agentpress_run')`.
      - `callback`: `REST_API::run_task()`.
      - `args`: validate `task` is required string, `context` is optional object.
    </step>
    <step order="3">In `run_task($request)`: capture `microtime(true)` as `$start_time`. Extract `task` and `context` from request body.</step>
    <step order="4">If `task` is empty/missing, return `WP_REST_Response` with 400 and code `agentpress_missing_task`, message "Task string is required."</step>
    <step order="5">Call `Router::route($task, $context)` to determine capability and payload.</step>
    <step order="6">If routing returns WP_Error, log the error via `Logger::log()`, calculate latency, and return 500 with code `agentpress_agent_error`, message from error, data includes `capability` if known.</step>
    <step order="7">If routing succeeds, call `Agents::run_internal($capability, $payload)` to execute the agent.</step>
    <step order="8">If agent execution returns WP_Error, log via `Logger::log()`, calculate latency, return 500 with code `agentpress_agent_error`, message, data includes `capability`.</step>
    <step order="9">If execution succeeds, log via `Logger::log()` with status `success`, calculate `$latency_ms = intval((microtime(true) - $start_time) * 1000)`.</step>
    <step order="10">Return 200 JSON response: `{'success' => true, 'routing' => ['capability' => $slug, 'reasoning' => $reason], 'result' => $result, 'latency_ms' => $latency_ms}`.</step>
    <step order="11">Ensure response headers include `Content-Type: application/json`. No caching headers.</step>
    <step order="12">Set `wp_remote_post` timeout to 30s throughout the pipeline. If timeout occurs, return 500 with code `agentpress_timeout`.</step>
  </steps>

  <verification>
    <check type="manual">Send POST to `/wp-json/agentpress/v1/run` without auth; verify 401/403.</check>
    <check type="manual">Send POST with valid auth but missing `task`; verify 400 `agentpress_missing_task`.</check>
    <check type="manual">Send POST with `task=write a short intro about AI` and valid Claude key; verify 200 with `routing.capability=content_writer`, `result.text` present, `latency_ms` > 0.</check>
    <check type="manual">Send POST with `task=make an image of a cat` and valid Worker URL; verify 200 with `routing.capability=image_generator`, `result.url` is HTTPS.</check>
    <check type="manual">Verify `agentpress_log` CPT contains entries for both successful requests with correct latency and status.</check>
    <check type="manual">Send POST with ambiguous task and invalid API key; verify 500 with structured error, not PHP fatal.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin bootstrap must register REST namespace and load classes" />
    <depends-on task-id="phase-1-task-2" reason="Parser must handle JSON extraction from Claude responses" />
    <depends-on task-id="phase-1-task-5" reason="Logger must write task execution records" />
    <depends-on task-id="phase-1-task-8" reason="Router must determine which agent to execute" />
  </dependencies>

  <commit-message>feat(api): single REST endpoint with auth, routing, execution, logging, and standardized responses</commit-message>
</task-plan>

---

### Wave 5 — Admin & Polish (after Wave 4)
*The admin screen and final documentation. These depend on the backend being fully functional so the admin can display real logs and settings.*

<task-plan id="phase-1-task-10" wave="5">
  <title>Admin UI — One Crafted Screen</title>
  <requirement>R-044, R-045, R-046, R-047, R-048, R-049, R-050, R-051, R-052, R-053</requirement>
  <description>
    Build the single admin screen under Tools → AgentPress. No tabs. No manual task runner. Settings fields for API key, Worker URL, and model. Log viewer showing last 50 tasks with colored status pills. The screen should feel native to wp-admin but elevated — tight spacing, precise typography, sparse and confident.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §5.5 (admin dashboard), §8 (UI/UX: core styles, terse copy)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 3 (one crafted screen, no tabs, no wizards); Decision 5 (kill manual task runner); Decision 6 (standard key storage); Decision 10 (brand voice: master craftsman)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-044 through R-053 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/deliverables/relay-ai-form-handler/admin/views/settings.php" reason="Reusable admin settings form pattern" />
  </context>

  <steps>
    <step order="1">Create `admin/class-admin.php` with namespace `AgentPress`. Class `Admin`.</step>
    <step order="2">Implement `Admin::add_menu()` hooked to `admin_menu`. Register submenu page under Tools with slug `tools-agentpress`, page title "AgentPress", capability `manage_options`.</step>
    <step order="3">Implement `Admin::render_page()`. Output a single `div.wrap` with `h1` "AgentPress". No tab navigation. No sidebar widgets.</step>
    <step order="4">Render Settings section first. Use `settings_fields('agentpress_settings')` and `do_settings_sections('agentpress_settings')`. Register three settings fields:
      - `claude_api_key` — password input. If `AGENTPRESS_CLAUDE_KEY` constant is defined, show masked value and disable field with note "Defined in wp-config.php".
      - `cf_worker_url` — text input. Same constant override logic (`AGENTPRESS_CF_WORKER_URL`).
      - `default_model` — select dropdown with `claude-3-5-sonnet-20241022` as default. Same constant override logic (`AGENTPRESS_DEFAULT_MODEL`).
    </step>
    <step order="5">Save settings to `agentpress_settings` option using `register_setting()` with `sanitize_callback` that strips slashes and validates URL format for Worker URL.</step>
    <step order="6">Render Activity Log section second. Query `Logger::get_recent(50)`. Display as HTML table with columns: Time, Capability, Status (pill), Latency (ms).</step>
    <step order="7">Status pill markup: `<span class="agentpress-status-pill agentpress-status-success">success</span>` or `...error`. Use CSS from Wave 1.</step>
    <step order="8">If no logs exist, display terse message: "No tasks yet. Send a POST request to /wp-json/agentpress/v1/run." No "Get Started" wizard.</step>
    <step order="9">Enqueue `admin/css/agentpress-admin.css` only on the AgentPress admin page using `admin_enqueue_scripts` hook.</step>
    <step order="10">Ensure all form labels are sentence case. Buttons use WP primary style (`button-primary`). No custom components.</step>
  </steps>

  <verification>
    <check type="manual">Navigate to wp-admin → Tools → AgentPress; confirm page loads without errors.</check>
    <check type="manual">Verify no tabs, no manual task runner textarea, no "Run" button anywhere on the page.</check>
    <check type="manual">Enter a Claude API key, save, reload; verify value persists (stored in `agentpress_settings`).</check>
    <check type="manual">Define `AGENTPRESS_CLAUDE_KEY` in `wp-config.php`; reload admin; verify field is disabled and shows "Defined in wp-config.php".</check>
    <check type="manual">After running tasks via REST API, verify log table appears with correct columns, status pills, and latency values.</check>
    <check type="manual">Inspect CSS in browser dev tools; confirm no Tailwind/Bootstrap classes, all selectors prefixed `.agentpress-`.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin bootstrap must load admin class and register menu hook" />
    <depends-on task-id="phase-1-task-3" reason="Admin CSS must be enqueued for styling" />
    <depends-on task-id="phase-1-task-5" reason="Logger must provide `get_recent()` for log viewer" />
    <depends-on task-id="phase-1-task-9" reason="REST API must exist so admin can reference the endpoint URL in copy" />
  </dependencies>

  <commit-message>feat(admin): single crafted settings screen with API key fields, log viewer, and native WP styling</commit-message>
</task-plan>

<task-plan id="phase-1-task-11" wave="5">
  <title>Readme + Integration + Exclusion Verification</title>
  <requirement>R-057, R-058, R-059, R-060, R-061, R-062, R-064, R-065, R-066–R-075</requirement>
  <description>
    Write the readme.txt, verify all v1 exclusions are honored, perform final integration smoke test, and ensure the plugin is ready for WordPress.org submission. The README is three paragraphs. Demo does the talking.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md" reason="PRD §9 (distribution), §10 (dogfooding), §13 (success metrics)" />
    <file path="/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md" reason="Decision 10 (brand voice: master craftsman); Decision 8 (no billing/SaaS); Risk Register (WordPress.org rejection risk)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-057 through R-075 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create `readme.txt` with WordPress.org header: `=== AgentPress ===`, `Contributors: shipyardai`, `Tags: ai, agents, automation, claude, orchestration`, `Requires at least: 6.0`, `Tested up to: 6.5`, `Requires PHP: 7.4`, `Stable tag: 1.0.0`, `License: GPLv2 or later`.</step>
    <step order="2">Write Description section in exactly three paragraphs:
      - Para 1: What AgentPress does ("Turns your WordPress site into an AI agent orchestration hub.")
      - Para 2: How it works ("POST a task to your site's REST API. AgentPress routes it to the right agent and returns the result.")
      - Para 3: Built-in agents ("ContentWriter generates prose. ImageGenerator creates featured images.")
    </step>
    <step order="3">Write Installation section: upload zip, activate, enter Claude API key in Tools → AgentPress.</step>
    <step order="4">Write API Example section with cURL command for `POST /wp-json/agentpress/v1/run` including `--user "username:application_password"` and JSON body with `task` and `context`.</step>
    <step order="5">Add "This plugin requires an Anthropic Claude API key. By using it, you agree to Anthropic's Terms of Service." disclosure for WordPress.org compliance.</step>
    <step order="6">Verify no mention of "Pro", "Premium", "SaaS", "tier", "billing", "upgrade", or third-party registration API in readme.txt.</step>
    <step order="7">Create placeholder `includes/agents/class-agent-third.php` with minimal stub: PHP opening tag, namespace `AgentPress\Agents`, class `Agent_Third` with empty `run()` method returning `WP_Error('agentpress_not_implemented', 'Reserved for v1 third agent.')`, and comment `// Reserved slot — ships only if zero bloat.`</step>
    <step order="8">Run exclusion audit: search codebase for `seo_meta`, `register_capability`, `stream`, `async`, `queue`, `byok`, `chat_widget`, `wizard`, `encrypt`, `base64_encode` + `wp_hash` together. Confirm zero matches for excluded features.</step>
    <step order="9">Final smoke test: activate plugin, open admin page, run one ContentWriter task via cURL, run one ImageGenerator task via cURL, verify both logs appear in admin, verify average latency < 4000ms.</step>
    <step order="10">Verify plugin ZIP structure: all files in `agentpress/` directory, no `node_modules`, no `.git`, no test files in distribution root.</step>
  </steps>

  <verification>
    <check type="manual">readme.txt validates via WP.org readme validator (or manual header check).</check>
    <check type="manual">Exclusion audit returns zero matches for all 10 excluded features.</check>
    <check type="manual">Smoke test completes successfully: both agents respond via cURL, logs appear, latency < 4000ms.</check>
    <check type="manual">Plugin ZIP is under 500KB total (no bloat).</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin bootstrap must exist for final activation test" />
    <depends-on task-id="phase-1-task-9" reason="REST API must be live for cURL smoke tests" />
    <depends-on task-id="phase-1-task-10" reason="Admin UI must be ready for log verification" />
  </dependencies>

  <commit-message>docs(readme): three-paragraph readme.txt, third-agent placeholder, and v1 exclusion audit</commit-message>
</task-plan>

---

## Wave Summary

| Wave | Tasks | Theme | Parallel? |
|------|-------|-------|-----------|
| 1 | task-1, task-2, task-3 | Foundation | Yes |
| 2 | task-4, task-5, task-6, task-7 | Core Classes | Yes |
| 3 | task-8 | Orchestration | Sequential |
| 4 | task-9 | Integration | Sequential |
| 5 | task-10, task-11 | Admin & Polish | Yes |

---

## Risk Register (Build Phase)

| Risk | Likelihood | Impact | Mitigation in Plan |
|------|------------|--------|-------------------|
| JSON parser collapses pipeline | High | Critical | Built in Wave 1 with 10+ edge-case tests before any agent logic |
| Image generation timeout on shared host | Medium | Medium | Timeout guard in agent, user-friendly error message, URL return only |
| CPT logging bloats DB | Medium | High | Auto-prune on every insert, no revisions, no autosave, force delete |
| Admin UI ugly-premium gap | Medium | Medium | CSS in Wave 1 is minimal; admin reviewed against native WP patterns |
| Keyword map misses intent | Medium | High | Claude fallback always available; conservative whitelist with room to expand |
| Third agent scope creep | Medium | Medium | Placeholder stub only; exclusion audit in task-11 catches any drift |
| WordPress.org rejection | Low | High | API disclosure in readme.txt; no encrypted storage theater |

---

## Open Questions Resolution (Before Code)

The following open questions from `decisions.md` are resolved by this plan:

1. **Third agent identity** → Reserved slot stays empty. `class-agent-third.php` is a placeholder stub (task-11, step 7).
2. **Local keyword map exact scope** → Locked whitelist defined in task-8, step 2. Content vs Image keywords explicitly enumerated.
3. **Admin page visual language** → Native WP `form-table` + `wp-list-table` elevated with 100-line CSS (task-3). No tabs, no custom frameworks.
4. **Activity log CPT schema** → Meta fields: `_agentpress_capability`, `_agentpress_payload`, `_agentpress_result`, `_agentpress_latency_ms`, `_agentpress_status`. Prune: delete oldest 50 when count > 500 (task-5).
5. **Image handling flow** → Return HTTPS URL only. Store in Media Library is NOT in v1; URL return avoids shared-host file limits (task-7, step 6).
6. **Parser hardening strategy** → Layered approach: `json_decode()` → regex strip fences → regex extract first `{...}` → WP_Error fallback (task-2, step 2).
7. **Error surfaced to user vs logged silently** → REST endpoint returns structured JSON errors (400/500) with `code`, `message`, `data`. All errors also logged to CPT (task-9, steps 6, 8, 10).

---

*Plan locked. Execute exactly what is written. No more. No less.*
