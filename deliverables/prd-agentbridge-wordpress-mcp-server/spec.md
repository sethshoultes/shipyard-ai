# Spec: AgentBridge (Relay) — WordPress MCP Server

**Derived from:** PRD `prd-agentbridge-wordpress-mcp-server.md` + Debate Decisions `decisions.md`
**Status:** Ready for build
**Scope:** v1.0.0 MVP — GitHub release in one session

---

## 1. Goals

1. **Ship** a production-ready WordPress plugin that activates cleanly on WP 6.5+ (PHP 7.4+).
2. **Expose** a standards-compliant MCP server over HTTP+SSE transport (MCP spec `2024-11-05`).
3. **Support** 7 core tools covering 90% of common WP admin workflows (read site info, list/get/create/update/delete posts, list media).
4. **Require** zero configuration beyond copying one endpoint URL and one token.
5. **Dogfood** the multi-agent orchestration stack by building a real bridge between AI agents and WordPress.
6. **Distribute** as a GitHub release tagged `v1.0.0` within the session; WP.org submission is post-session.

**Success Metrics (from PRD)**
- Plugin installs without errors on a clean WP 6.5+ site.
- Claude Desktop lists all 7 tools within 30 seconds of config paste.
- End-to-end flow works: "Create a draft post titled 'Hello from MCP'" succeeds in one shot.
- 50 GitHub stars in 48 hours; 100 active WP.org installs in 7 days (post-session).

---

## 2. Implementation Approach

### 2.1 Stack & Constraints
- **Language:** PHP 7.4+, zero external Composer dependencies.
- **Frontend:** Vanilla JS on the admin screen; no build step, no frameworks.
- **Transport:** JSON-RPC 2.0 over HTTP+SSE (MCP spec `2024-11-05`). No stdio transport in v1.
- **Auth:** Plugin-generated Bearer token stored hashed with `wp_hash_password`. Application Passwords supported as documented fallback.
- **Security:** All POST endpoints gate on `current_user_can('edit_posts')` or Application Password scope check.
- **CORS:** Default `*`, restrictable via `relay_cors_origins` filter hook. No CORS UI in v1.
- **Rate Limiting:** Per-IP connection cap on the SSE endpoint before any public release (Decision #11).

### 2.2 Architecture

```
┌─────────────────┐      HTTP/SSE      ┌─────────────────────────────┐
│  Claude Desktop │◄────────────────►│  /wp-json/agentbridge/v1/   │
│  or Cursor MCP  │   Bearer Token   │         (WordPress)         │
│     client      │                  │  ┌─────────────┐ ┌─────────┐ │
└─────────────────┘                  │  │   SSE Hub   │ │ Message │ │
                                    │  │  (session)  │ │ Handler │ │
                                    │  └─────────────┘ └─────────┘ │
                                    │         │              │      │
                                    │         ▼              ▼      │
                                    │  ┌──────────────────────────┐ │
                                    │  │    Tool Dispatcher       │ │
                                    │  │  get_site_info           │ │
                                    │  │  list_posts              │ │
                                    │  │  get_post                │ │
                                    │  │  create_post             │ │
                                    │  │  update_post             │ │
                                    │  │  delete_post             │ │
                                    │  │  list_media              │ │
                                    │  └──────────────────────────┘ │
                                    └─────────────────────────────┘
```

### 2.3 Key Classes (PHP)

| Class | File | Responsibility |
|-------|------|--------------|
| `Relay_Server` | `includes/class-server.php` | Registers `/sse` and `/messages` REST routes. Handles SSE stream: `Content-Type: text/event-stream`, generates `session_id`, stores in transient (5-min TTL), `sleep(1)` + `ob_flush()` loop, sends events via transient-based message queue. Includes per-IP rate limiting on SSE connects. |
| `Relay_Message_Handler` | `includes/class-message-handler.php` | Validates auth on POST, parses JSON-RPC body, routes to `initialize`, `tools/list`, or `tools/call`. Returns JSON-RPC responses queued back to the matching SSE stream. |
| `Relay_Tool_Registry` | `includes/class-tool-registry.php` | `register($name, $schema, $callback)`, `get_all()` for `tools/list`, `call($name, $args)` with JSON Schema arg validation. |
| `Relay_Auth` | `includes/class-auth.php` | Validates `Authorization: Bearer {token}` against hashed plugin token in `wp_options` (`agentbridge_api_key`) or WordPress Application Passwords. Enforces `edit_posts` capability on every POST request. |

### 2.4 Tool Schema (7 Always-On)

| Tool | R/W | Purpose |
|------|-----|---------|
| `get_site_info` | Read | Returns name, description, URL, WP version, multisite flag |
| `list_posts` | Read | Filtered listing with pagination (post_type, status, search, author) |
| `get_post` | Read | Full post content + metadata. No ACF special-casing. |
| `create_post` | Write | New post/draft with title, content, excerpt, status, meta |
| `update_post` | Write | Partial update of existing post + merged meta |
| `delete_post` | Write | Trash or force-delete |
| `list_media` | Read | Media library query with mime_type filter |

### 2.5 Admin UI

- **Location:** `Tools → Relay`
- **Design:** One white card (Decision #5). No tabs, no sidebars, no chrome.
- **Elements:**
  1. **Endpoint URL** — read-only text field with copy button. `/wp-json/agentbridge/v1/sse`
  2. **API Token** — masked field with "Regenerate" button and copy button.
  3. **Auto-generated Config Snippet** — JSON block for Claude Desktop / Cursor `mcp.json`.
- **Constraints:** No onboarding wizards. No freemium banners, purple gradients, review nags, or dark patterns. No connection log (Decision #12).

### 2.6 Build Waves (Single Session)

**Wave 1 — Skeleton & Protocol (Hours 1–2)**
1. `agentbridge.php` with plugin header, activator, class autoloader.
2. `class-server.php` — REST routes `/sse` and `/messages`, SSE handler with session transients + rate limiting.
3. `class-auth.php` — Bearer token validation + capability check.
4. `class-message-handler.php` — JSON-RPC router: `initialize`, `tools/list`, `tools/call`.

**Wave 2 — Tool Registry & Core Tools (Hours 3–4)**
1. `class-tool-registry.php` — schema registration + dispatcher.
2. `class-tool-site.php` — `get_site_info`.
3. `class-tool-posts.php` — `list_posts`, `get_post`, `create_post`, `update_post`, `delete_post`.
4. `class-tool-media.php` — `list_media`.
5. Register all 7 tools in the main plugin file.

**Wave 3 — Admin UI (Hour 5–6)**
1. `admin/admin.php` — settings page under Tools.
2. `admin/js/dashboard.js` — copy-to-clipboard, token regeneration, snippet generator.
3. One-card screen with zero tabs/chrome.

**Wave 4 — Security, Polish & Package (Hours 7–8)**
1. CORS headers with `relay_cors_origins` filter.
2. JSON-RPC error codes and basic error handling.
3. `readme.txt` (WP.org standards, prepared for post-session submission).
4. `readme.md` (GitHub README documenting honest SSE constraints).
5. ZIP the plugin.
6. Local test against Claude Desktop.
7. Git tag `v1.0.0`.

---

## 3. Verification Criteria

### 3.1 Protocol & Transport

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V1 | SSE endpoint exists | `curl -N https://site.com/wp-json/agentbridge/v1/sse` returns `Content-Type: text/event-stream` and an `endpoint` event with a valid `session_id`. |
| V2 | Session management | After opening SSE, `transient` with key containing `session_id` exists in `wp_options` with 5-minute TTL. |
| V3 | JSON-RPC initialize | POST `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}` to `/messages?session_id={id}` returns `protocolVersion`, `serverInfo.name="agentbridge"`, `serverInfo.version="1.0.0"`. |
| V4 | JSON-RPC tools/list | POST `tools/list` returns an array of exactly 7 tool definitions with JSON Schema parameters. |
| V5 | JSON-RPC tools/call | POST `tools/call` with valid name + args returns a `result` object. Invalid tool returns JSON-RPC error `-32601`. Invalid args returns `-32602`. |
| V6 | Message queuing | Response to a JSON-RPC POST appears as an SSE `message` event within 5 seconds. |

### 3.2 Authentication & Security

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V7 | Bearer token required | POST to `/messages` without `Authorization: Bearer ...` returns HTTP 401 and JSON-RPC error. |
| V8 | Capability gate | POST with valid token but user lacking `edit_posts` returns HTTP 403. |
| V9 | Token hashing | Regenerating token in admin writes `wp_hash_password(token)` to `wp_options`; raw token is never stored. |
| V10 | Rate limiting | Opening >N SSE connections from the same IP within 60 seconds returns HTTP 429 (N = connection cap, e.g. 10). |
| V11 | CORS default | `Access-Control-Allow-Origin: *` present on REST responses. Filter `relay_cors_origins` can override. |
| V12 | No file writes outside uploads | `grep -R "file_put_contents\|fwrite\|fopen.*w" includes/tools/` returns zero hits outside `wp_upload_dir()` contexts. |

### 3.3 Tools

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V13 | `get_site_info` | Returns `name`, `description`, `url`, `wp_version`, `is_multisite`. |
| V14 | `list_posts` | Supports `post_type`, `status`, `per_page` (max 50), `page`, `search`, `author` filters. Returns paginated array. |
| V15 | `get_post` | Returns `id`, `title`, `content`, `excerpt`, `status`, `type`, `author`, `date`, `modified`, `meta`. |
| V16 | `create_post` | Creates a draft by default. Returns `id`, `title`, `status`, `link`, `edit_link`. |
| V17 | `update_post` | Partial update: only provided fields change. `meta` is merged. |
| V18 | `delete_post` | Respects `force` flag. Returns `deleted: true` and `previous_status`. Never deletes plugin/theme/core files. |
| V19 | `list_media` | Supports `per_page`, `page`, `mime_type`. Returns media array. |

### 3.4 Admin UI

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V20 | Settings page location | `Tools → Relay` renders without JS errors. |
| V21 | One-card design | Admin HTML contains exactly zero elements with class `nav-tab`, `nav-tab-wrapper`, or `wrap` containing multiple `<h2>` headings. |
| V22 | Copy buttons | Clicking copy button next to Endpoint URL copies `/wp-json/agentbridge/v1/sse` to clipboard. Clicking copy next to token copies raw token. |
| V23 | Token regeneration | Clicking "Regenerate" updates displayed token and invalidates previous Bearer token within 1 second. |
| V24 | Config snippet | Snippet contains valid JSON with `mcpServers.wordpress.url` and `headers.Authorization`. |

### 3.5 Packaging & Distribution

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V25 | File completeness | ZIP contains exactly the files listed in Section 4. No extra tool files (e.g. no `class-tool-users.php`). |
| V26 | No banned UI patterns | `grep -Ri "upgrade to pro\|leave a review\|premium\|freemium\|wizard" admin/` returns zero hits. |
| V27 | Brand voice | Admin strings contain "Your site is now listening." or equivalent human, plainspoken copy. No IBM-jargon sentences. |
| V28 | GitHub release | Repo contains tag `v1.0.0` and a release asset ZIP. |
| V29 | WP 6.5+ compatibility | Plugin activates on a clean WP 6.5 install without deprecation notices. |

---

## 4. Files to Create or Modify

### Plugin Root
| File | Action | Purpose |
|------|--------|---------|
| `agentbridge.php` | **Create** | Main plugin file: headers, activator/deactivator, class autoloader, tool registration hook. |
| `readme.txt` | **Create** | WP.org plugin directory standard readme (prepared for post-session submission). |
| `readme.md` | **Create** | GitHub README with install steps, honest SSE constraint docs, and config examples. |

### Core Includes
| File | Action | Purpose |
|------|--------|---------|
| `includes/class-server.php` | **Create** | `Relay_Server`: REST route registration, SSE stream handler, session transients, rate limiting, `send_event()`. |
| `includes/class-message-handler.php` | **Create** | `Relay_Message_Handler`: auth validation, JSON-RPC parse/route, lifecycle methods (`initialize`, `tools/list`, `tools/call`). |
| `includes/class-tool-registry.php` | **Create** | `Relay_Tool_Registry`: `register()`, `get_all()`, `call()` with JSON Schema arg validation. |
| `includes/class-auth.php` | **Create** | `Relay_Auth`: Bearer token validation against hashed `wp_options` token + Application Password fallback. Enforces `edit_posts`. |

### Tool Implementations
| File | Action | Purpose |
|------|--------|---------|
| `includes/tools/class-tool-site.php` | **Create** | `Relay_Tool_Site`: `get_site_info` implementation. |
| `includes/tools/class-tool-posts.php` | **Create** | `Relay_Tool_Posts`: `list_posts`, `get_post`, `create_post`, `update_post`, `delete_post`. |
| `includes/tools/class-tool-media.php` | **Create** | `Relay_Tool_Media`: `list_media` implementation. |

### Admin UI
| File | Action | Purpose |
|------|--------|---------|
| `admin/admin.php` | **Create** | Registers `Tools → Relay` settings page, renders one-card HTML, enqueues dashboard.js. |
| `admin/js/dashboard.js` | **Create** | Copy-to-clipboard logic, token regeneration AJAX, Claude Desktop / Cursor config snippet generator. |

### Build / Distribution Artifacts
| File | Action | Purpose |
|------|--------|---------|
| `agentbridge.zip` | **Create** | Distribution ZIP containing all plugin files at root (no nested folder inside ZIP). |
| `.github/workflows/ci.yml` | **Create** *(optional, if time)* | GitHub Actions: lint PHP, verify file structure, run test scripts. |

---

## 5. Explicitly Cut from v1 (Per Decisions)

- `upload_media` (Decision #13 — malware/abuse vector)
- `list_users`, `get_user` (Decision #14 — PII/GDPR risk)
- Connection log / telemetry (Decision #12)
- Onboarding wizard (Decision #8)
- CORS origins UI (Decision #6 — filter hook only)
- Application Passwords UI toggle (Decision #3 — documented fallback only)
- WooCommerce tools (PRD Non-Goals)
- stdio transport (PRD Non-Goals)
- Real-time collaboration / multi-user locking (PRD Non-Goals)
- Plugin/theme/core file write access (PRD Non-Goals)
- ACF field schema discovery (Open Question #5)

---

## 6. Risk Register (Build-Time)

| ID | Risk | Mitigation in Build |
|----|------|---------------------|
| R1 | Shared hosting SSE ceiling | Document honestly in readme.md. Add pre-flight worker-pool warning in activator if detectable. |
| R2 | Transient table bloat | Aggressive 5-minute TTL. No persistent session storage. |
| R3 | Unauthenticated SSE DDoS | Rate limit per IP before any public release (Decision #11). |
| R4 | Scope creep | 7-tool list is sacred. Any addition requires explicit Chair approval. |
| R5 | Token theft | Single hashed value in `wp_options`. Regeneration invalidates old instantly. No key table. |

---

*Build what is written. Nothing more. Nothing less.*
