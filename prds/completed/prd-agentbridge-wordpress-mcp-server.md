# PRD: AgentBridge — WordPress MCP Server

**Status:** Approved for build
**Date:** 2026-05-01
**Owner:** Phil Jackson / Shipyard AI
**Cycle:** DREAM-2026-05-01T08-5
**Estimate:** 1 agency session (6–8 hours)

---

## 1. Elevator Pitch

AgentBridge turns any WordPress site into a Model Context Protocol (MCP) server. Install the plugin, copy one URL, paste it into Claude Desktop, Cursor, or any MCP client. Your AI agent can now read posts, write drafts, update meta fields, manage media, and query WooCommerce data—directly, safely, via a standard protocol.

**Why now:** MCP is becoming the USB-C of AI integrations. WordPress powers 43% of the web. Nobody has built the bridge between them. We ship first, we set the standard.

---

## 2. Goals

- Ship a production-ready WordPress plugin in one session.
- Expose a standards-compliant MCP server over HTTP+SSE transport.
- Support 10 core tools covering 90% of common WP admin workflows.
- Require zero configuration beyond copying an endpoint URL and token.
- Dogfood our own multi-agent orchestration stack.

## 3. Non-Goals

- No stdio transport in v1 (HTTP+SSE only; local stdio bridges are community territory).
- No write access to plugins/themes/core files (security boundary).
- No real-time collaboration / multi-user locking.
- No WooCommerce-specific tools in v1 (framework is there; WC tools come in v1.1).
- No built-in AI generation (MCP clients bring their own LLM).

---

## 4. User & Distribution

**Primary user:** Developers, AI agencies, technical content managers who want agents to interact with WP sites.

**Distribution:**
1. WordPress.org plugin directory (free, open-source).
2. Hacker News "Show HN" launch post.
3. MCP community Discord / GitHub discussions.
4. Claude Desktop / Cursor community forums.

---

## 5. Architecture

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
                                    │  │  create_post             │ │
                                    │  │  update_post             │ │
                                    │  │  upload_media            │ │
                                    │  └──────────────────────────┘ │
                                    └─────────────────────────────┘
```

**Stack:**
- Pure WordPress plugin (PHP 7.4+, no external dependencies).
- Admin UI: Vanilla JS + WP REST API.
- Transport: JSON-RPC 2.0 over HTTP+SSE (MCP spec 2024-11-05).
- Auth: Application Passwords or custom Bearer token.

---

## 6. MCP Protocol Implementation

### 6.1 Transport Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/wp-json/agentbridge/v1/sse` | Client opens SSE stream. Server sends `endpoint` event with a unique `session_id` and POST URL. |
| POST | `/wp-json/agentbridge/v1/messages?session_id={uuid}` | Client sends JSON-RPC requests. Server queues responses back to the matching SSE stream. |

### 6.2 SSE Stream Events

```
event: endpoint
data: {"uri": "/wp-json/agentbridge/v1/messages?session_id=abc123"}

event: message
data: {"jsonrpc": "2.0", "id": 1, "result": {...}}
```

### 6.3 JSON-RPC Methods

**Required:**
- `initialize` — protocolVersion `2024-11-05`, serverInfo `{name: "agentbridge", version: "1.0.0"}`.
- `initialized` — client confirmation (acknowledged, no response needed).
- `tools/list` — returns array of tool definitions.
- `tools/call` — executes named tool with provided arguments.

**Lifecycle:**
1. Client opens SSE to `/sse`.
2. Server responds with `endpoint` event containing POST URL.
3. Client POSTs `initialize` → server returns capabilities.
4. Client POSTs `initialized`.
5. Client POSTs `tools/list` → server returns schema.
6. Client POSTs `tools/call` → server executes and returns result via SSE.

### 6.4 Authentication

- Every POST request must include `Authorization: Bearer {token}`.
- Token can be a WordPress **Application Password** (recommended) or a plugin-generated token stored in `wp_options` (`agentbridge_api_key`).
- Admin settings page lets user regenerate the plugin token and copy it.
- SSE endpoint itself is unauthenticated (it only establishes a pipe); auth happens on POST.

---

## 7. Tool Schema

All tools are exposed via `tools/list` with JSON Schema parameters.

### `get_site_info`
**Description:** Returns basic WordPress site information.
**Args:** none
**Returns:** `{ name, description, url, wp_version, is_multisite, active_plugins: [...] }`

### `list_posts`
**Description:** List posts or pages with filtering and pagination.
**Args:**
- `post_type` (string, default: "post") — post, page, or custom.
- `status` (string, default: "publish") — publish, draft, future, trash, any.
- `per_page` (integer, default: 10, max: 50)
- `page` (integer, default: 1)
- `search` (string, optional)
- `author` (integer, optional)
**Returns:** Array of `{ id, title, status, type, author, date, excerpt, link }`

### `get_post`
**Description:** Retrieve full post content and metadata.
**Args:**
- `id` (integer, required)
**Returns:** `{ id, title, content, excerpt, status, type, author, date, modified, meta: {...}, acf: {...} }`

### `create_post`
**Description:** Create a new post or draft.
**Args:**
- `title` (string, required)
- `content` (string, required)
- `excerpt` (string, optional)
- `status` (string, default: "draft")
- `post_type` (string, default: "post")
- `meta` (object, optional) — key/value pairs for post meta.
**Returns:** `{ id, title, status, link, edit_link }`

### `update_post`
**Description:** Update an existing post.
**Args:**
- `id` (integer, required)
- `title`, `content`, `excerpt`, `status` (optional, only provided fields updated)
- `meta` (object, optional, merged)
**Returns:** `{ id, title, status, modified }`

### `delete_post`
**Description:** Move a post to trash or permanently delete.
**Args:**
- `id` (integer, required)
- `force` (boolean, default: false)
**Returns:** `{ deleted: true, previous_status }`

### `upload_media`
**Description:** Upload an image or file to the media library.
**Args:**
- `file_url` (string, required) — publicly accessible URL to fetch.
- `title` (string, optional)
- `alt_text` (string, optional)
**Returns:** `{ id, url, file_name, mime_type, width, height }`

### `list_media`
**Description:** Query the media library.
**Args:**
- `per_page` (integer, default: 10)
- `page` (integer, default: 1)
- `mime_type` (string, optional) — e.g. "image/jpeg"
**Returns:** Array of media items.

### `list_users`
**Description:** List site users.
**Args:**
- `role` (string, optional)
- `per_page` (integer, default: 10)
**Returns:** Array of `{ id, name, email, roles }`

### `get_user`
**Description:** Get details for a specific user.
**Args:**
- `id` (integer, required)
**Returns:** `{ id, name, email, roles, registered_date }`

---

## 8. WordPress Plugin Structure

```
agentbridge/
├── agentbridge.php              # Main plugin file, headers, activator
├── includes/
│   ├── class-server.php         # SSE hub, session management
│   ├── class-message-handler.php # JSON-RPC router
│   ├── class-tool-registry.php  # Tool definitions + dispatcher
│   ├── class-auth.php           # Bearer token validation
│   └── tools/
│       ├── class-tool-posts.php
│       ├── class-tool-media.php
│       ├── class-tool-users.php
│       └── class-tool-site.php
├── admin/
│   ├── admin.php                # Settings page registration
│   └── js/
│       └── dashboard.js         # Copy-to-clipboard, token regen
└── readme.txt                   # WP.org standards
```

### 8.1 Key PHP Classes

**AgentBridge_Server**
- `register_rest_routes()` — adds `/sse` and `/messages`.
- `handle_sse()` — sets headers (`Content-Type: text/event-stream`), generates `session_id`, stores in transient (5 min TTL), loops with `sleep(1)` and `ob_flush()` until client disconnects.
- `send_event($session_id, $data)` — writes event to stored output buffer/file; in v1 use a transient-based message queue (lightweight, no Redis needed).

**AgentBridge_Message_Handler**
- `handle_post($request)` — validates auth, reads JSON-RPC body, routes to `initialize`, `tools/list`, or `tools/call`.
- `handle_tools_call($request)` — looks up tool registry, validates args against JSON Schema, executes, returns result or error.

**AgentBridge_Tool_Registry**
- `register($name, $schema, $callback)`
- `get_all()` — returns schema array for `tools/list`.
- `call($name, $args)` — executes callback with sanitized args.

### 8.2 Security Checklist

- [ ] All POST endpoints require `current_user_can('edit_posts')` or Application Password scope check.
- [ ] `file_get_contents` in `upload_media` is wrapped with `wp_remote_get` + timeout + file size limit (5MB in v1).
- [ ] Only allowed MIME types pass upload (use `wp_check_filetype_and_ext`).
- [ ] No direct file system writes outside `wp_upload_dir()`.
- [ ] `delete_post` respects `force` flag; no plugin file deletion ever.
- [ ] CORS preflight handled only for configured origins (default: `*` in beta, admin can restrict).

---

## 9. Admin Experience

**Settings Page Location:** `Tools → AgentBridge`

**Elements:**
1. **Endpoint URL** — read-only text field with copy button. `/wp-json/agentbridge/v1/sse`
2. **API Token** — masked field with "Regenerate" button. Stored hashed with `wp_hash_password`.
3. **Authentication Mode** — radio: "Application Passwords (recommended)" vs "Plugin Token".
4. **CORS Origins** — textarea, one per line. Default `*`.
5. **Connection Log** — last 10 client connections (IP, time, user agent), stored in a custom table or transient. Optional for v1; skip if time-constrained.
6. **Quick Start** — 3-step visual: Install → Copy URL → Add to Claude Desktop config.

**Claude Desktop Config Snippet (auto-generated):**
```json
{
  "mcpServers": {
    "wordpress": {
      "url": "https://yoursite.com/wp-json/agentbridge/v1/sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

---

## 10. MCP Client Integration Notes

**Claude Desktop:** Add server config to `claude_desktop_config.json`. Claude will call `initialize`, then `tools/list`, then start using tools.

**Cursor:** Add to `.cursor/mcp.json` with same schema.

**Custom Clients:** Any HTTP+SSE MCP client works. Fallback: a simple Python stdio bridge can proxy to this endpoint for clients that only support stdio.

---

## 11. One-Session Build Checklist

This PRD is scoped for a single agency session. Do not expand scope beyond these checkboxes.

### Hour 1: Skeleton
- [ ] `agentbridge.php` with plugin header, activator, class autoloader.
- [ ] Register REST routes: `/sse`, `/messages`.
- [ ] SSE handler with session creation and cleanup.

### Hour 2: Protocol
- [ ] `initialize` JSON-RPC response.
- [ ] `tools/list` JSON-RPC response.
- [ ] `tools/call` router stub.
- [ ] Auth middleware (Bearer token check).

### Hour 3: Core Tools
- [ ] `get_site_info`
- [ ] `list_posts`
- [ ] `get_post`

### Hour 4: Write Tools
- [ ] `create_post`
- [ ] `update_post`
- [ ] `delete_post`

### Hour 5: Media + Users
- [ ] `upload_media` (url fetch, sideload)
- [ ] `list_media`
- [ ] `list_users`
- [ ] `get_user`

### Hour 6: Admin UI
- [ ] Settings page under Tools.
- [ ] Copy-to-clipboard for endpoint + token.
- [ ] Token regeneration.
- [ ] Claude Desktop config snippet generator.

### Hour 7: Polish
- [ ] `readme.txt` for WP.org.
- [ ] Basic error handling and JSON-RPC error codes.
- [ ] CORS headers.
- [ ] Security audit against checklist.

### Hour 8: Ship
- [ ] ZIP the plugin.
- [ ] Test against Claude Desktop locally.
- [ ] Push to GitHub, tag `v1.0.0`.
- [ ] Draft Hacker News post + WP.org submission.

---

## 12. Success Metrics

- **Ship:** Plugin installs without errors on a clean WP 6.5+ site.
- **Connect:** Claude Desktop lists all 10 tools within 30 seconds of config paste.
- **Execute:** End-to-end flow: "Create a draft post titled 'Hello from MCP'" works in one shot.
- **Stars:** 50 GitHub stars in 48 hours.
- **Installs:** 100 active installs on WP.org in 7 days.

---

## 13. Open Questions (for future cycles)

- Should we add WooCommerce tools (products, orders, inventory) in v1.1?
- Should we support stdio via a companion CLI binary (PHP Phar)?
- Should we build an ACF field schema discovery tool so agents know what custom fields exist?

---

**Board Mandate:** Build this. It ships today or it doesn't count.

*— Phil Jackson, Chair*
*Shipyard AI, DREAM Cycle 2026-05-01*
