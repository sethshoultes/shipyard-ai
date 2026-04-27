# PRD: WP Sentinel
## AI Support Agent for WordPress
**Date:** 2026-04-27
**Status:** Ready for Build
**Cycle:** DREAM-2026-04-27T07-1
**Winning Votes:** 3 (Elon, Phil, Naval)

---

## 1. Overview
WP Sentinel is a WordPress plugin that installs an AI support agent directly inside wp-admin. It monitors site health, answers user questions via a Claude-powered chat interface, and executes safe remediation actions with explicit user confirmation. The goal is a one-session MVP that ships to the WordPress.org plugin repository.

## 2. Problem
WordPress powers 43% of the web, yet site owners — especially non-developers — struggle with:
- Deciphering cryptic site health warnings
- Knowing which plugin update broke their site
- Finding trustworthy, immediate support without a $200/month retainer
- Taking safe remediation steps without fear of breaking things further

## 3. Solution
A single wp-admin widget that acts as a site guardian:
1. **Health Monitor:** Passive scan of PHP version, plugin update status, permalink health, cache state, and thumbnail integrity.
2. **AI Chat:** Context-aware support agent that knows the site's current health state and WordPress best practices.
3. **Safe Actions:** One-click fixes (with confirmation dialogs) for common issues, using only reversible, non-destructive WordPress APIs.

## 4. User & Distribution
**Primary User:** Freelancers, small agency owners, and non-technical site admins managing 1–10 WordPress sites.
**Distribution:** WordPress.org plugin repository (free health monitoring). AI chat and remediation actions require a Cloudflare Worker API key (freemium upgrade). Organic growth through wp-admin plugin search, hosting provider recommendations, and "Site Health" tab integration.

## 5. Core Features (MVP)

### 5.1 Site Health Dashboard Widget
- Injects a widget into the existing WordPress Dashboard home screen
- Displays 5 health signals with color-coded status: PHP version, pending plugin updates, permalink state, cache status, media thumbnail health
- Updates via AJAX on page load; no external API call required

### 5.2 AI Support Chat (React)
- Fixed-position chat button (bottom-right of wp-admin)
- Opens a slide-over panel with message history
- Sends site health context + user message to Cloudflare Worker
- Worker proxies to Claude with a system prompt embedding current health state
- Supports markdown rendering for responses
- Typing indicator and error states

### 5.3 Safe Remediation Actions
From the chat interface or health widget, users can trigger (with confirmation):
1. **Regenerate Permalinks:** Calls `flush_rewrite_rules()` via admin AJAX
2. **Regenerate Thumbnails:** Queues WP-CLI-style regeneration for missing image sizes (uses native `wp_generate_attachment_metadata`)
3. **Clear Plugin Cache:** Dispatches a safe action hook that popular cache plugins (W3 Total Cache, WP Super Cache, LiteSpeed) listen to; if none detected, explains manual steps
4. **Deactivate Last Plugin:** Shows the most recently activated plugin and offers one-click deactivation (standard WP API)
5. **Check File Permissions:** Scans `wp-content/uploads` for incorrect permissions and reports only (no auto-fix for MVP)

### 5.4 Settings Page
- Menu item under "Tools" → "Sentinel"
- Field: Cloudflare Worker URL (for AI chat)
- Field: API Key (basic auth header to Worker)
- Toggle: Enable/disable health widget
- Toggle: Enable/disable chat widget
- Link to upgrade / documentation

## 6. Technical Architecture

### 6.1 WordPress Plugin (PHP)
- **File:** `wp-sentinel.php` (main plugin file)
- **Namespace:** `WPSentinel`
- **Structure:**
  - `admin/` — React build output, enqueues, AJAX handlers
  - `includes/` — Health scanner class, remediation class, settings class
  - `assets/` — Compiled JS/CSS
- **PHP Requirements:** 7.4+ (matches WordPress core support)
- **Enqueues:** `wp_enqueue_scripts` on `admin_enqueue_scripts`, React app mounts into `#wp-sentinel-chat-root`

### 6.2 React Frontend (wp-admin)
- Built with Vite, compiled to a single `sentinel-admin.js` + `sentinel-admin.css`
- Uses vanilla React + Fetch (no external UI lib to keep bundle small; inline SVG icons)
- Chat state managed with `useReducer`
- Markdown rendered with a lightweight lib (e.g., `marked`)

### 6.3 Cloudflare Worker (AI Proxy)
- **Endpoint:** `POST /chat`
- **Request:** `{ message: string, healthContext: object, apiKey: string }`
- **Validation:** Checks bearer token against env secret
- **System Prompt:**
  ```
  You are WP Sentinel, an expert WordPress support agent. The user's site health context is:
  {healthContext}
  Be concise, actionable, and safe. Never recommend editing core files. Always suggest backups before risky actions.
  ```
- **Response:** Streams or returns full text (MVP: full text, SSE in v2)
- **Model:** `claude-3-haiku-20240307` (fast, cheap, capable for support)

### 6.4 Health Scanner Class
- PHP class `WPSentinel\Health\Scanner`
- Methods:
  - `get_php_status()` — version vs recommended, extensions
  - `get_plugin_update_status()` — count of pending updates
  - `get_permalink_status()` — checks rewrite rules integrity
  - `get_cache_status()` — detects if a known cache plugin is active
  - `get_thumbnail_status()` — samples 10 recent attachments for missing sizes
- Returns structured JSON, cached via transients for 5 minutes

## 7. One-Session Build Plan
The agency builds this in a single session. Sequence:

1. **Scaffold (0:00–0:30)**
   - `wp-sentinel.php` with plugin header, activation hook, namespace autoloader
   - Folder structure
   - Git init

2. **Health Scanner (0:30–1:30)**
   - Implement `Scanner` class with all 5 health methods
   - AJAX endpoint `wp_ajax_wpsentinel_get_health`
   - Dashboard widget rendering PHP

3. **React Chat UI (1:30–3:00)**
   - Vite project in `admin/react/`
   - Chat button + slide-over panel
   - Message list, input, typing state
   - Fetch to admin AJAX, which proxies to Worker (or direct Worker if CORS allows)
   - Build and enqueue bundle

4. **Cloudflare Worker (3:00–4:00)**
   - `wrangler init` in `worker/`
   - `/chat` endpoint with Claude Workers AI binding
   - System prompt assembly with health context
   - API key validation
   - Deploy

5. **Remediation Actions (4:00–5:00)**
   - AJAX handlers for each safe action
   - Confirmation modals in React
   - Nonce verification on all endpoints
   - Capability checks (`manage_options` or `activate_plugins`)

6. **Settings Page (5:00–5:30)**
   - `Tools → Sentinel` page
   - Save Worker URL and key
   - Toggles for widgets

7. **Polish & Ship (5:30–6:00)**
   - Readme.txt for WordPress.org
   - Screenshots of health widget and chat
   - Version 0.1.0 tag
   - Git push, zip build

## 8. UI/UX Notes
- Color palette matches wp-admin: WP Blue `#2271b1`, success green `#00a32a`, warning yellow `#dba617`, error red `#d63638`
- Chat panel max-width 400px, z-index below WP admin notices but above content
- Health widget uses WordPress native `.postbox` styling
- All actions require two clicks (select → confirm) to prevent accidents
- Empty state for chat: "Ask me anything about your site — I'll check its health first."

## 9. Acceptance Criteria
- [ ] Plugin installs on a clean WordPress 6.4+ site without fatal errors
- [ ] Dashboard widget shows 5 health signals accurately
- [ ] Chat panel opens, sends messages, and receives contextual AI responses within 3 seconds
- [ ] All 4 remediation actions execute successfully and show success/error toasts
- [ ] Settings page persists Worker URL and API key
- [ ] No AI chat functionality works without a valid API key (graceful degraded state)
- [ ] All AJAX endpoints validate nonces and capabilities
- [ ] Cloudflare Worker returns 401 for invalid API keys
- [ ] Plugin passes WordPress.org plugin check (no forbidden functions, proper escaping)
- [ ] Total plugin size under 500KB (excluding readme/screenshots)

## 10. Open Questions / V2
- **Streaming:** Upgrade Worker to SSE streaming for chat responses
- **Multisite:** Network-wide health overview for multisite installs
- **Email alerts:** Proactive email when health score drops
- **Action history:** Log of all remediation actions taken
- **Custom actions:** Hook system for third-party plugins to register their own safe actions

## 11. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Claude latency in Worker hurts UX | Use Haiku model; implement streaming in v2 |
| WP.org rejects plugin for external API call | Disclose in readme; chat is opt-in via API key |
| Remediation action breaks site | Only use reversible WP APIs; capability checks; confirm dialogs |
| React bundle too large | Tree-shake; no UI framework; target <100KB gzipped |

---
*Shipped or it doesn't count. Let's build.*
