# Decisions — Relay / AgentBridge WordPress MCP Server

*Consolidated by Phil Jackson, Chair*
*Shipyard AI, DREAM Cycle 2026-05-01*

---

## Locked Decisions

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Product name is "Relay"** | Steve | Steve | One word. Human. Motion, not infrastructure. The repo slug stays `agentbridge-wordpress-mcp-server` for SEO and velocity; rename the repo after v1 proves demand. |
| 2 | **Ship SSE over PHP with `sleep(1)` loops and transient-based message queues** | Elon (as honest constraint) | Elon | PHP is request/response. Pretending it is Node.js is how projects die. We ship the constraint, document the ~5 concurrent session ceiling on cheap hosting, and architect v1.1 to offload SSE to a lightweight companion. |
| 3 | **Primary auth: plugin-generated token with copy-button UX. Application Passwords supported as advanced fallback.** | Steve | Steve | WordPress Application Passwords are 20-character strings buried in user profiles. The 30-second mandate is sacred. We ship one hashed token in `wp_options` with a clean regenerate button. Elon's crypto concern is real but mitigated by minimal code surface (one hash, no key table, no custom crypto). |
| 4 | **Seven tools. No toggle grid. All always-on.** | Phil (synthesis) | Phil | Steve wanted ten; Elon wanted four. Both are wrong. The set that ships: `get_site_info`, `list_posts`, `get_post`, `create_post`, `update_post`, `delete_post`, `list_media`. `upload_media`, `list_users`, and `get_user` are cut from v1. `get_post` drops ACF special-casing. No configuration grid — these seven are the product. |
| 5 | **Admin UI: one white card under Tools → Relay. Endpoint URL, token field, copy buttons, auto-generated config snippet. Nothing else.** | Steve | Steve | Elon argued for `admin_notices` to save time. Overruled. The one-card screen is the entire competitive advantage — that breath of trust is why users recommend it to agencies. No connection log. No auth mode radio. No CORS textarea. |
| 6 | **CORS: default `*`, no UI. Restrict via filter hook for advanced users.** | Elon | Elon (with Steve's caveat noted) | Steve correctly warned that `*` will cause support tickets from users who paste and see errors. We accept that risk for v1 and document the filter. If support volume justifies it, a CORS UI lands in v1.1. |
| 7 | **GitHub release first, WP.org immediately after as formal v1.0.0.** | Steve (channel) + Elon (timeline) | Synthesis | Agencies and developers pull from GitHub. The forty-year-old blogger finds it in wp-admin. Both are right, but not in the same 8-hour window. One session ships to GitHub. WP.org submission (readme validation, screenshots, SVN theater) follows as the first post-session task. |
| 8 | **No onboarding wizards. Ever.** | Steve | Steve (unanimous) | A wizard is an admission of design failure. If the user needs seven steps, the product is broken. The one-card screen teaches itself. |
| 9 | **No freemium banners, purple gradients, review nags, or dark patterns in admin.** | Steve | Steve (unanimous) | The settings page is sacred ground. It looks like a system preference, not a marketplace bazaar. |
| 10 | **Brand voice: "Your site is now listening."** | Steve | Steve (unanimous) | Confident. Minimal. Human. No jargon on the admin screen — "Connection URL," not "SSE Transport Endpoint." |
| 11 | **Basic rate limiting on the SSE endpoint before any public release.** | Steve (conceded in Round 2) | Steve | An unauthenticated SSE endpoint is a DDoS welcome mat. Connection caps per IP are non-optional. |
| 12 | **No connection log in v1.** | Elon | Elon | Vanity metrics stored in custom tables or transients are a waste of an hour. If we need telemetry, we add it when we have something worth measuring. |
| 13 | **`upload_media` fetches arbitrary URLs — CUT from v1.** | Both | Both (unanimous) | Malware vector and abuse magnet. A tool that fetches the open internet does not belong in a plugin installed by non-technical users. |
| 14 | **`list_users` and `get_user` — CUT from v1.** | Elon | Elon | Low utility for an AI writing posts, high PII surface. The emotional hook dies when GDPR notices arrive. |
| 15 | **8-hour timeline ships GitHub release only. WP.org is post-session.** | Elon | Elon | One session builds a working prototype with 7 tools, bare SSE, honest constraints, and the one-card UI. It cannot also package, validate, and submit to WP.org in the same breath. The deadline breathes; the product does not. |

---

## MVP Feature Set (v1.0.0 — What Ships)

### Core Protocol
- JSON-RPC 2.0 over HTTP+SSE (MCP spec 2024-11-05)
- `/wp-json/agentbridge/v1/sse` — SSE stream with `endpoint` event + `session_id`
- `/wp-json/agentbridge/v1/messages?session_id={uuid}` — POST for JSON-RPC requests
- `initialize`, `initialized`, `tools/list`, `tools/call` lifecycle
- Basic rate limiting: connection caps per IP on SSE endpoint
- CORS: default `*`, filterable via `relay_cors_origins` hook

### Authentication
- Primary: plugin-generated Bearer token, stored hashed (`wp_hash_password`), displayed with copy button and regenerate
- Fallback: WordPress Application Passwords (documented for advanced users)
- All POST endpoints gate on `current_user_can('edit_posts')` or Application Password scope

### Tools (7 Always-On)
| Tool | R/W | Purpose |
|------|-----|---------|
| `get_site_info` | Read | Returns name, description, URL, WP version, multisite flag |
| `list_posts` | Read | Filtered listing with pagination (post_type, status, search, author) |
| `get_post` | Read | Full post content + metadata. No ACF special-casing. |
| `create_post` | Write | New post/draft with title, content, excerpt, status, meta |
| `update_post` | Write | Partial update of existing post + merged meta |
| `delete_post` | Write | Trash or force-delete |
| `list_media` | Read | Media library query with mime_type filter |

### Admin UI
- Location: `Tools → Relay`
- One white card containing:
  - Endpoint URL (read-only, copy button)
  - API Token (masked, regenerate button, copy button)
  - Auto-generated Claude Desktop / Cursor config snippet
- No tabs. No sidebars. No chrome.

### Distribution (Session 1)
- GitHub release, tagged `v1.0.0`
- ZIP packaging
- Local test against Claude Desktop

### Distribution (Post-Session)
- WP.org plugin directory submission
- Hacker News "Show HN" launch post
- 3-minute demo video (agencies share what they see)

---

## File Structure

```
agentbridge/
├── agentbridge.php              # Plugin header, activator, class autoloader
├── includes/
│   ├── class-server.php         # SSE hub: register routes, session transients, sleep loop, rate limiting
│   ├── class-message-handler.php # JSON-RPC router: initialize, tools/list, tools/call
│   ├── class-tool-registry.php  # Tool schema registration + dispatcher
│   ├── class-auth.php           # Bearer validation (plugin token + Application Passwords)
│   └── tools/
│       ├── class-tool-site.php  # get_site_info
│       ├── class-tool-posts.php # list_posts, get_post, create_post, update_post, delete_post
│       └── class-tool-media.php # list_media
├── admin/
│   ├── admin.php                # Settings page registration under Tools
│   └── js/
│       └── dashboard.js         # Copy-to-clipboard, token regenerate, snippet generator
├── readme.txt                   # WP.org standards (prepared, submitted post-session)
└── readme.md                    # GitHub README with honest constraints documented
```

**Key PHP Classes**

- `Relay_Server` — registers `/sse` and `/messages`, handles `Content-Type: text/event-stream`, generates `session_id` (transient, 5-min TTL), `sleep(1)` + `ob_flush()` loop, sends events via transient queue.
- `Relay_Message_Handler` — validates auth, parses JSON-RPC, routes to lifecycle methods or tool dispatcher.
- `Relay_Tool_Registry` — `register($name, $schema, $callback)`, `get_all()`, `call($name, $args)` with JSON Schema arg validation.
- `Relay_Auth` — checks Bearer against hashed plugin token or Application Password. Enforces `edit_posts` capability.

---

## Open Questions (Unresolved — Needs Decision in Build or v1.1)

1. **Companion binary for SSE offloading.** At 100x usage, PHP-FPM workers exhaust. Do we build a lightweight Go/Node SSE hub that proxies to WP REST, or recommend hosts with 100+ workers?
2. **`upload_media` resurrection.** If cut from v1, what is the allowlist / validation strategy that makes it safe enough for v1.1? Server-side domain allowlist? File-size + MIME hardening only?
3. **WooCommerce tools.** The framework is there; do `list_products`, `get_order`, `update_inventory` land in v1.1 or v1.2?
4. **stdio transport.** A PHP Phar companion for local MCP clients that only speak stdio — community territory or official?
5. **ACF field schema discovery.** Should the agent know what custom fields exist before calling `get_post`? How do we expose that without plugin-specific coupling?
6. **Multi-site support.** `is_multisite` is in `get_site_info`, but do we support network-activated tool scoping in v1?
7. **Token rotation audit trail.** If a token is regenerated, should the old token invalidate immediately or have a grace period? Immediate is safer; grace period is kinder to active sessions.
8. **Error telemetry.** If the SSE endpoint fails on a shared host, how does the user know why? Admin notice? Silent fail? Logging to `wp-content/debug.log` only?

---

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | **Shared hosting kills the site** — 5+ concurrent SSE connections exhaust PHP-FPM workers on $10 hosts. | High | Critical | Document ceiling honestly in README. Recommend minimum 20 workers. Architect v1.1 companion binary. Rate limit SSE per IP. | Engineering |
| R2 | **Transient table write contention** under any real load — every SSE message is a DB write. | Medium | High | Keep TTL aggressive (5 min). Monitor `wp_options` bloat. Document that this is v1 constraint, not architecture. | Engineering |
| R3 | **Unauthenticated SSE endpoint as DDoS vector** — attacker opens 1,000 connections and holds them. | Medium | Critical | Rate limiting (per IP connection cap) is mandatory before release. Consider user-agent / origin soft checks. | Engineering |
| R4 | **Plugin token theft** — single hashed token in `wp_options` is simpler but less granular than App Passwords. | Low | High | Use `wp_hash_password`. Token regenerates invalidate old instantly. No key table = smaller attack surface. Document App Passwords for multi-user sites. | Security |
| R5 | **v1 never reaches WP.org** — GitHub ships, then momentum dies. | Medium | High | Post-session WP.org submission is a tracked deliverable, not an aspirational footnote. Assign owner before build ends. | Product |
| R6 | **Claude Desktop config format changes** — MCP spec is young; endpoint schema may shift. | Medium | Medium | Keep transport layer thin. Pin to spec `2024-11-05`. Monitor MCP GitHub for breaking changes. | Engineering |
| R7 | **Agencies ignore it because it is not in WP.org** — Steve is right that agencies install via directory. | Medium | High | GitHub release is the prototype. WP.org submission is the product launch. Do not market before WP.org is live. | Distribution |
| R8 | **Support ticket avalanche from CORS `*`** — users paste URL, get browser errors, open tickets. | Medium | Medium | Document CORS clearly in readme. Provide copy-paste filter snippet for restrict. If volume exceeds threshold, v1.1 gets CORS UI. | Support |
| R9 | **Scope creep during build** — someone adds ACF, WooCommerce, or stdio "because it is easy." | High | Critical | The 7-tool list is sacred. Any addition requires Phil approval. The build stops at 8 hours; what is not done is v1.1. | Phil |
| R10 | **1-star reviews from hosts crashing** — honest documentation is not enough; users do not read. | Medium | Critical | Pre-flight check on activation: detect PHP worker pool size (if detectable) and warn if < 10. Surface the constraint before the user connects. | Engineering |

---

*Build what is written. Nothing more. Nothing less.*
*— Phil*
