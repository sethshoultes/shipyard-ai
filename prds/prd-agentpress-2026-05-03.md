# PRD: AgentPress — WordPress Agent Orchestration Hub

**Status:** Approved for Build
**Date:** 2026-05-03
**Owner:** Phil Jackson (Dream Cycle)
**Build Target:** Single session, shippable MVP
**Distribution:** WordPress.org plugin repository + GitHub

---

## 1. Overview

AgentPress is a WordPress plugin that turns any WP site into an agent orchestration hub. It exposes a REST API endpoint that receives natural-language tasks, uses Claude to route them to the correct registered "agent capability," executes the task via Cloudflare Workers AI or local handlers, and returns results. Other plugins and themes can register capabilities via a single PHP helper, making AgentPress an extensible platform rather than a point solution.

**The promise:** Install AgentPress, and your WordPress site becomes the brain of an AI agency.

---

## 2. Goals

1. Ship a working WordPress plugin in one session that installs without friction via zip upload or WP CLI.
2. Provide three built-in agents: **ContentWriter**, **ImageGenerator**, **SEOMeta**.
3. Expose an extensible `agentpress_register_capability()` PHP API so third-party developers can add agents.
4. Route tasks through Claude with a system prompt that matches intent to capability.
5. Demonstrate the full pipeline on our own agency site before public release.

## 3. Non-Goals

- Real-time streaming UI (MVP returns async results via REST).
- Multi-user permission model beyond WP's existing `manage_options` capability.
- Billing, SaaS tier, or hosted Workers in MVP (free plugin only; monetize later).
- Custom model training or fine-tuning.
- Front-end chat interface (MVP is API-first; UI is wp-admin only).

---

## 4. User Stories

1. **As a WP site owner,** I want to POST a task like "write a blog intro about hiking boots" to my own site's REST API and get back generated content without leaving the WordPress ecosystem.
2. **As a plugin developer,** I want to register my "image_optimize" capability with AgentPress so my plugin receives tasks it can handle, extending the hub without forking code.
3. **As an agency operator,** I want to see which agents ran, what they cost, and whether they succeeded, all inside wp-admin, so I can debug without reading Cloudflare logs.

---

## 5. Functional Specification

### 5.1 Plugin Bootstrap
- Standard WP plugin header; namespace `AgentPress`.
- On activation: create custom post type `agentpress_capability` (private, not public, no archive).
- On activation: create custom post type `agentpress_log` (private) for task history.
- Register REST namespace: `agentpress/v1`.

### 5.2 Capability Registry
PHP API:
```php
agentpress_register_capability( string $slug, array $args );
```
`$args` schema:
- `name` (string, human label)
- `description` (string, 1-2 sentences for Claude routing context)
- `input_schema` (array, JSON Schema-like associative array stored as post meta)
- `handler` (string, either `'internal'` or a fully-qualified REST URL)

Storage mechanism:
- On registration, insert a private `agentpress_capability` post with `$slug` as post_name.
- Store args as post_meta (`_agentpress_name`, `_agentpress_description`, `_agentpress_input_schema`, `_agentpress_handler`).
- Deduplicate by slug on subsequent calls (update if exists).

### 5.3 Task Router (Claude)
**Endpoint:** `POST /wp-json/agentpress/v1/run`

**Request body:**
```json
{
  "task": "string: natural language request",
  "context": {
    "post_id": 123,
    "site_name": "Shipyard AI"
  }
}
```

**Flow:**
1. Validate authentication: accept `X-WP-Nonce` from logged-in users or Application Passwords.
2. Require `manage_options` or a custom `agentpress_run` capability.
3. Load all registered capabilities, build a manifest array of slug + description + input_schema keys.
4. Build Claude system prompt:
   > You are the AgentPress Router. Available capabilities: [manifest]. Given the user's task, return ONLY a JSON object with no markdown formatting: `{"capability":"slug","reasoning":"...","payload":{...}}`. The payload must conform to the capability's input_schema. If no capability matches, return `{"capability":"none","reasoning":"..."}`.
5. Send the task + context to Claude API via `wp_remote_post`.
6. Parse JSON from Claude's response text. Sanitize with `wp_kses_post` on string fields inside payload.
7. Look up the matched capability by slug.
8. **If built-in (handler = `internal`):** execute internal PHP function `agentpress_run_{slug}`.
9. **If external (handler = URL):** POST the payload to that URL via `wp_remote_post`, forward the response.
10. Log the full transaction to `agentpress_log` CPT: task text, routed capability, payload, response, latency_ms, status (`success` | `error`), timestamp.
11. Return final JSON to caller.

**Response shape (200):**
```json
{
  "success": true,
  "routing": {
    "capability": "content_writer",
    "reasoning": "User requested text generation about a plugin intro."
  },
  "result": {
    "text": "Introducing AgentPress...",
    "tokens_used": 156
  },
  "latency_ms": 2840
}
```

### 5.4 Built-In Agents (MVP)

**ContentWriter** (`content_writer`)
- Input schema keys: `topic` (string), `tone` (string, enum: friendly/professional/witty), `length` (string, enum: short/medium/long)
- Action: Builds a prompt and calls Claude via `wp_remote_post` to the Messages API.
- Output: `{"text":"...","tokens_used":42}`
- Guardrails: truncate output to 2048 chars in MVP.

**ImageGenerator** (`image_generator`)
- Input schema keys: `prompt` (string), `size` (string, enum: 512x512/1024x1024)
- Action: Calls Cloudflare Workers AI endpoint (Flux/Stable Diffusion) using the agency's existing Worker pattern.
- Output: `{"url":"https://...","format":"webp","size":"1024x1024"}`
- Guardrails: URL must be HTTPS; if Worker's response fails, return error with `wp_error` shape.

**SEOMeta** (`seo_meta`)
- Input schema keys: `content` (string), `focus_keyword` (string)
- Action: Calls Claude to generate title tag + meta description under character limits.
- Output: `{"title":"...","description":"...","focus_keyword":"..."}`
- Guardrails: title max 60 chars, description max 160 chars; enforce server-side.

### 5.5 Admin Dashboard
- Page slug: `tools-agentpress`, under Tools menu.
- **Capabilities tab:** List table of registered capabilities (slug, name, handler type). Read-only in MVP.
- **Logs tab:** List table of last 50 task logs (time, capability, status, latency). Status displayed as colored pill: green `success`, red `error`.
- **Settings tab:** Textarea for Claude API key, text field for Cloudflare Worker URL, select for default model (`claude-3-5-sonnet-20241022`). All stored as encrypted options using `wp_hash` + `base64_encode` (MVP encryption, not production-grade).
- Styling: WordPress core `.wp-list-table` and `.form-table` only. No custom CSS framework.

---

## 6. API Specification

### `POST /wp-json/agentpress/v1/run`
**Auth:** Cookie nonce or Application Password + `agentpress_run` capability.

**Request:**
```json
{
  "task": "Write a friendly intro about our new AI orchestration plugin",
  "context": {
    "post_id": 0,
    "site_name": "Shipyard AI"
  }
}
```

**Success 200:**
```json
{
  "success": true,
  "routing": {
    "capability": "content_writer",
    "reasoning": "User requested text generation about a plugin intro."
  },
  "result": {
    "text": "Introducing AgentPress...",
    "tokens_used": 156
  },
  "latency_ms": 2840
}
```

**Error 400 (bad request):**
```json
{
  "code": "agentpress_missing_task",
  "message": "Task string is required.",
  "data": { "status": 400 }
}
```

**Error 500 (router/agent failure):**
```json
{
  "code": "agentpress_agent_error",
  "message": "ContentWriter failed after 3 attempts.",
  "data": { "status": 500, "capability": "content_writer" }
}
```

---

## 7. Database / Storage

No custom tables. Use native WP primitives:

1. **`agentpress_capability` CPT** (private)
   - `post_name` = capability slug
   - `post_title` = human name
   - `post_status` = `publish` (internal visibility)
   - Meta: `_agentpress_description`, `_agentpress_input_schema` (serialized array), `_agentpress_handler`

2. **`agentpress_log` CPT** (private)
   - `post_title` = truncated task string
   - `post_status` = `publish`
   - Meta: `_agentpress_capability`, `_agentpress_payload` (serialized), `_agentpress_result` (serialized), `_agentpress_latency_ms`, `_agentpress_status`
   - Auto-prune: on insert, if count > 500, delete oldest 50 logs.

3. **Options**
   - `agentpress_settings` (serialized array): `claude_api_key`, `cf_worker_url`, `default_model`, `installed_version`.

---

## 8. UI/UX

- Admin page uses WordPress core styles exclusively. No Tailwind, no Bootstrap.
- Colors: WP admin defaults (blue `#2271b1`, reds, greens).
- Layout: standard WP `wrap` container with `h1`, `.nav-tab-wrapper` for tabs, `.wp-list-table` for lists.
- Copy: terse, confident. No onboarding wizard in MVP; a 4-step README covers setup.
- Form labels: sentence case. Buttons: primary WP style.

---

## 9. Distribution Plan

1. **WordPress.org** — Submit as free plugin. Tag keywords: `ai`, `agents`, `automation`, `claude`, `orchestration`.
2. **GitHub** — Public repo with release zip. README includes installation, API example in cURL, and `register_agent_capability` example for developers.
3. **Agency Blog** — Post announcing AgentPress with embedded demo video of dogfooding on our own site.
4. **Developer Outreach** — Publish a "Building an AgentPress Agent in 10 Lines of PHP" tutorial to drive registry adoption.

---

## 10. Dogfooding Plan

Before public commit:
1. Install on `shipyard-ai.com` (our WordPress site).
2. Generate a blog post intro using ContentWriter via wp-admin Tools → AgentPress → manual task runner (add a simple textarea form on the settings page for quick tests).
3. Use ImageGenerator to create a featured image for the post.
4. Use SEOMeta to populate title/description; inject into post meta compatible with Yoast or RankMath.
5. Capture screenshots for plugin repo banner (772×250) and README assets.
6. Verify logs appear in the admin dashboard with accurate latency and status.

---

## 11. One-Session Build Plan

| Time | Task |
|------|------|
| 0:00–0:20 | Plugin scaffold: bootstrap file, headers, activation hook, CPT registration. |
| 0:20–0:45 | Capability registry: `agentpress_register_capability()` + storage layer. |
| 0:45–1:15 | REST endpoint + auth + request validation. |
| 1:15–1:45 | Claude router: system prompt builder, HTTP client, JSON parser, error handling. |
| 1:45–2:15 | Built-in agents: ContentWriter, ImageGenerator, SEOMeta (wire to AI providers). |
| 2:15–2:45 | Admin dashboard: capabilities list, logs table, settings form with API key fields. |
| 2:45–3:15 | Manual task runner textarea on settings page for immediate dogfooding. |
| 3:15–3:45 | Dogfood on live site, fix edge cases, capture screenshots. |
| 3:45–4:00 | README, plugin repo assets, GitHub push, final smoke test. |

---

## 12. File Structure

```
agentpress/
├── agentpress.php              # Main plugin file
├── includes/
│   ├── class-activator.php     # CPT + capability setup
│   ├── class-router.php          # REST endpoint + Claude routing
│   ├── class-registry.php        # register_capability API
│   ├── class-agents.php          # Built-in agent handlers
│   ├── class-logger.php          # Log CPT insertion + pruning
│   └── class-admin.php           # Menu + settings page + logs UI
├── assets/
│   └── (empty in MVP; no custom CSS/JS needed)
└── readme.txt                    # WP.org readme
```

---

## 13. Success Metrics (30 Days)

- [ ] Plugin installed on 3+ agency sites including our own.
- [ ] 1 external developer or plugin registers a custom capability.
- [ ] 100 tasks routed through the hub without manual intervention.
- [ ] Average end-to-end latency < 4 seconds for built-in agents.
- [ ] Zero fatal errors reported via WP support forum or GitHub issues.

---

## 14. Open Questions (Decided)

1. **API key strategy?** Bring-your-own-key in MVP. Store in encrypted option. Hosted key service is a future Pro feature.
2. **Router location?** PHP-based in MVP to keep the plugin self-hosted and offline-capable. Cloudflare Worker router is a future performance add-on.
3. **Output streaming?** Not in MVP. Synchronous REST response with timeout of 30s.

---

## 15. Pipeline Note

This PRD was generated by the DREAM cycle on 2026-05-03. The winning idea (AgentPress) received 4 of 5 board votes. The agency should treat this as a binding build order: no scope expansion, no pivoting, no vaporware. It ships in the next session or the cycle is a failure.

**Ready for build.**
