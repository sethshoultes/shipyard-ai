# AgentBridge (Relay) — Build To-Do List

**Rule:** Every task must be completable in <5 minutes. If it feels bigger, split it.
**Format:** `- [ ] Task description — verify: how to check it worked`

---

## Wave 1 — Plugin Skeleton & Protocol

- [ ] Create `agentbridge.php` with plugin header (Name: Relay, slug: agentbridge) and activator hook — verify: `grep -q "Plugin Name:" agentbridge.php && grep -q "register_activation_hook" agentbridge.php`
- [ ] Add class autoloader to `agentbridge.php` mapping `Relay_*` to `includes/class-{name}.php` — verify: `grep -q "spl_autoload_register" agentbridge.php`
- [ ] Create `includes/class-server.php` with empty `Relay_Server` class skeleton — verify: `grep -q "class Relay_Server" includes/class-server.php`
- [ ] Register REST route `GET /wp-json/agentbridge/v1/sse` in `class-server.php` — verify: `grep -q "agentbridge/v1/sse" includes/class-server.php`
- [ ] Register REST route `POST /wp-json/agentbridge/v1/messages` with `session_id` param — verify: `grep -q "agentbridge/v1/messages" includes/class-server.php`
- [ ] Implement SSE stream handler: set `Content-Type: text/event-stream`, generate UUID `session_id`, store transient — verify: `grep -q "text/event-stream" includes/class-server.php && grep -q "session_id" includes/class-server.php`
- [ ] Add SSE `sleep(1)` + `ob_flush()` loop with client-disconnect detection — verify: `grep -q "sleep(1)" includes/class-server.php && grep -q "ob_flush" includes/class-server.php`
- [ ] Add transient-based message queue `send_event($session_id, $data)` — verify: `grep -q "set_transient" includes/class-server.php && grep -q "send_event" includes/class-server.php`
- [ ] Implement per-IP rate limiting on SSE connects (connection cap, e.g. 10 per 60s) — verify: `grep -q "REMOTE_ADDR" includes/class-server.php && grep -q "429" includes/class-server.php`
- [ ] Create `includes/class-auth.php` with `Relay_Auth` skeleton — verify: `grep -q "class Relay_Auth" includes/class-auth.php`
- [ ] Implement Bearer token extraction from `Authorization` header — verify: `grep -q "Authorization" includes/class-auth.php && grep -q "Bearer" includes/class-auth.php`
- [ ] Validate plugin token against `wp_options` `agentbridge_api_key` hashed with `wp_hash_password` — verify: `grep -q "wp_hash_password" includes/class-auth.php && grep -q "agentbridge_api_key" includes/class-auth.php`
- [ ] Add Application Password fallback validation — verify: `grep -q "application_passwords" includes/class-auth.php`
- [ ] Enforce `current_user_can('edit_posts')` on every POST request — verify: `grep -q "edit_posts" includes/class-auth.php`
- [ ] Create `includes/class-message-handler.php` with `Relay_Message_Handler` skeleton — verify: `grep -q "class Relay_Message_Handler" includes/class-message-handler.php`
- [ ] Implement JSON-RPC parse and method routing (`initialize`, `tools/list`, `tools/call`) — verify: `grep -q "jsonrpc" includes/class-message-handler.php && grep -q "tools/list" includes/class-message-handler.php`
- [ ] Implement `initialize` response with `protocolVersion: 2024-11-05` and `serverInfo` — verify: `grep -q "2024-11-05" includes/class-message-handler.php && grep -q "agentbridge" includes/class-message-handler.php`

---

## Wave 2 — Tool Registry & Core Tools

- [ ] Create `includes/class-tool-registry.php` with `Relay_Tool_Registry` — verify: `grep -q "class Relay_Tool_Registry" includes/class-tool-registry.php`
- [ ] Implement `register($name, $schema, $callback)` method — verify: `grep -q "function register" includes/class-tool-registry.php`
- [ ] Implement `get_all()` returning schema array for `tools/list` — verify: `grep -q "function get_all" includes/class-tool-registry.php`
- [ ] Implement `call($name, $args)` with basic arg existence check — verify: `grep -q "function call" includes/class-tool-registry.php`
- [ ] Create `includes/tools/class-tool-site.php` with `Relay_Tool_Site` — verify: `grep -q "class Relay_Tool_Site" includes/tools/class-tool-site.php`
- [ ] Implement `get_site_info` returning name, description, url, wp_version, is_multisite — verify: `grep -q "get_site_info" includes/tools/class-tool-site.php && grep -q "is_multisite" includes/tools/class-tool-site.php`
- [ ] Create `includes/tools/class-tool-posts.php` with `Relay_Tool_Posts` — verify: `grep -q "class Relay_Tool_Posts" includes/tools/class-tool-posts.php`
- [ ] Implement `list_posts` with filters (post_type, status, per_page max 50, page, search, author) — verify: `grep -q "list_posts" includes/tools/class-tool-posts.php && grep -q "per_page" includes/tools/class-tool-posts.php`
- [ ] Implement `get_post` returning full content + metadata — verify: `grep -q "get_post" includes/tools/class-tool-posts.php && grep -q "get_post_meta" includes/tools/class-tool-posts.php`
- [ ] Implement `create_post` with default status `draft` — verify: `grep -q "create_post" includes/tools/class-tool-posts.php && grep -q "draft" includes/tools/class-tool-posts.php`
- [ ] Implement `update_post` with partial field update and merged meta — verify: `grep -q "update_post" includes/tools/class-tool-posts.php && grep -q "update_post_meta" includes/tools/class-tool-posts.php`
- [ ] Implement `delete_post` respecting `force` flag — verify: `grep -q "delete_post" includes/tools/class-tool-posts.php && grep -q "force" includes/tools/class-tool-posts.php`
- [ ] Create `includes/tools/class-tool-media.php` with `Relay_Tool_Media` — verify: `grep -q "class Relay_Tool_Media" includes/tools/class-tool-media.php`
- [ ] Implement `list_media` with per_page, page, mime_type filters — verify: `grep -q "list_media" includes/tools/class-tool-media.php && grep -q "mime_type" includes/tools/class-tool-media.php`
- [ ] Instantiate and register all 7 tools in `agentbridge.php` during `rest_api_init` or plugin init — verify: `grep -c "register" agentbridge.php` returns at least 7

---

## Wave 3 — Admin UI

- [ ] Create `admin/admin.php` and register settings page under `Tools → Relay` — verify: `grep -q "add_management_page\|add_submenu_page" admin/admin.php && grep -q "Relay" admin/admin.php`
- [ ] Render one white card HTML: no tabs, no sidebars — verify: `grep -c "nav-tab" admin/admin.php` returns 0
- [ ] Add Endpoint URL read-only field with copy button — verify: `grep -q "Endpoint URL\|Connection URL" admin/admin.php`
- [ ] Add masked API Token field with copy button — verify: `grep -q "API Token\|token" admin/admin.php`
- [ ] Add "Regenerate" button that AJAX-updates hashed token — verify: `grep -q "regenerate\|Regenerate" admin/admin.php`
- [ ] Add auto-generated Claude Desktop / Cursor config snippet — verify: `grep -q "mcpServers" admin/admin.php`
- [ ] Create `admin/js/dashboard.js` with copy-to-clipboard logic — verify: `grep -q "copy\|clipboard" admin/js/dashboard.js`
- [ ] Add token regeneration AJAX handler in `dashboard.js` — verify: `grep -q "regenerate\|fetch\|ajax" admin/js/dashboard.js`
- [ ] Add config snippet generator in `dashboard.js` — verify: `grep -q "mcpServers\|JSON.stringify" admin/js/dashboard.js`
- [ ] Enqueue `dashboard.js` only on Relay admin page — verify: `grep -q "wp_enqueue_script" admin/admin.php`

---

## Wave 4 — Security, Polish & Package

- [ ] Add CORS headers to REST responses with default `*` — verify: `grep -q "Access-Control-Allow-Origin" includes/class-server.php`
- [ ] Add `relay_cors_origins` filter hook for advanced users — verify: `grep -q "relay_cors_origins" includes/class-server.php`
- [ ] Add JSON-RPC error codes (`-32700`, `-32600`, `-32601`, `-32602`, `-32603`) — verify: `grep -E "-32700|-32600|-32601|-32602|-32603" includes/class-message-handler.php`
- [ ] Ensure `delete_post` never targets plugin/theme/core files — verify: `grep -q "delete_post" includes/tools/class-tool-posts.php` and confirm no `unlink` or `rmdir` calls exist
- [ ] Write `readme.txt` with WP.org required headers (Stable tag, Requires at least, Tested up to) — verify: `grep -q "Stable tag:" readme.txt && grep -q "Requires at least:" readme.txt`
- [ ] Write `readme.md` with install steps and honest SSE constraints — verify: `grep -q "SSE" readme.md && grep -q "constraint\|limitation\|PHP-FPM" readme.md`
- [ ] Audit admin strings for brand voice: plainspoken, zero corporate jargon — verify: `grep -ic "leverage\|synergy\|scalable\|best-in-class\|end-to-end" admin/admin.php readme.md` returns 0
- [ ] Confirm no banned UI patterns (upgrade banners, review nags, wizards) — verify: `grep -ric "upgrade to pro\|leave a review\|premium\|freemium\|wizard" admin/` returns 0
- [ ] ZIP plugin with files at archive root — verify: `unzip -l agentbridge.zip | grep "agentbridge.php"`
- [ ] Activate plugin on clean WP 6.5+ and confirm zero fatal errors — verify: `wp plugin activate agentbridge` exits 0
- [ ] Git tag `v1.0.0` — verify: `git tag | grep "v1.0.0"`

---

## Post-Session (Tracked, Not Built)

- [ ] Submit to WordPress.org plugin directory — verify: SVN commit succeeds
- [ ] Draft Hacker News "Show HN" post — verify: post draft saved
- [ ] Record 3-minute demo video — verify: video file exported
