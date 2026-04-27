# WP Sentinel — Build Spec
**PRD Date:** 2026-04-27
**Status:** Ready for Build
**Target:** WordPress.org Plugin Repository MVP (v0.1.0)

---

## 1. Goals

### Primary Goal
Ship a single-session MVP WordPress plugin that installs an AI support agent inside wp-admin. It monitors site health, answers user questions via a Claude-powered chat interface, and executes safe remediation actions with explicit user confirmation.

### User Goals
- Understand cryptic site health warnings at a glance via a color-coded dashboard widget.
- Get immediate, contextual WordPress support without a $200/month retainer.
- Fix common issues safely with one-click, confirmed actions that use only reversible, non-destructive WordPress APIs.
- Retain full control — nothing happens without explicit confirmation.

### Business Goals
- WordPress.org plugin repository submission (free health monitoring as the hook).
- Freemium upgrade path: AI chat and remediation require a Cloudflare Worker API key.
- Organic growth through wp-admin plugin search and hosting provider recommendations.
- Total plugin size under 500KB (excluding readme/screenshots).

---

## 2. Implementation Approach

### 2.1 Philosophy
- **Single-session build.** The PRD assumes a 6-hour continuous execution window.
- **Ship or it doesn't count.** Every feature must reach a verifiable, working state before moving on.
- **No Emdash-specific APIs.** This is a vanilla WordPress plugin; authoritative interfaces are WordPress Hooks API, Plugin Handbook, and standard PHP.
- **Reuse verified patterns from codebase:**
  - `plugins/adminpulse/adminpulse.php` — plugin headers, `ABSPATH` guard, constants, activation hooks, AJAX nonce verification, `wp_localize_script`, transient caching.
  - `projects/whisper/build/whisper/whisper.php` — class-based `/includes/` loader architecture.

### 2.2 Architecture Overview

| Component | Tech | Output |
|-----------|------|--------|
| WordPress Plugin (PHP) | PHP 7.4+ | `wp-sentinel.php`, `includes/`, `admin/` |
| React Frontend | Vite, vanilla React + Fetch | `sentinel-admin.js` + `sentinel-admin.css` |
| Cloudflare Worker | Wrangler, Claude Workers AI binding | `/chat` endpoint proxy |
| Health Scanner | PHP class `WPSentinel\Health\Scanner` | JSON via AJAX, transient-cached 5 min |

### 2.3 Build Sequence (from PRD §7)

1. **Scaffold (0:00–0:30)**
   - `wp-sentinel.php` with plugin header, activation hook, namespace autoloader.
   - Folder structure: `admin/`, `includes/`, `assets/`.
   - Git init.

2. **Health Scanner (0:30–1:30)**
   - Implement `WPSentinel\Health\Scanner` with 5 methods: PHP version, plugin updates, permalink state, cache status, thumbnail health.
   - AJAX endpoint `wp_ajax_wpsentinel_get_health` with nonce verification.
   - Dashboard widget rendering via `wp_add_dashboard_widget`.

3. **React Chat UI (1:30–3:00)**
   - Vite project in `admin/react/`.
   - Chat button (bottom-right) + slide-over panel.
   - Message list, input, typing state, markdown rendering (`marked`).
   - Fetch to admin AJAX, which proxies to Worker (or direct Worker if CORS allows).
   - Build and enqueue bundle via `admin_enqueue_scripts`.

4. **Cloudflare Worker (3:00–4:00)**
   - `wrangler init` in `worker/`.
   - `POST /chat` endpoint with Claude Workers AI binding.
   - System prompt assembly with health context.
   - Bearer token validation against env secret.
   - Deploy.

5. **Remediation Actions (4:00–5:00)**
   - AJAX handlers for 5 safe actions: regenerate permalinks, regenerate thumbnails, clear plugin cache, deactivate last plugin, check file permissions.
   - Confirmation modals in React.
   - Nonce verification + capability checks (`manage_options` or `activate_plugins`) on all endpoints.

6. **Settings Page (5:00–5:30)**
   - `Tools → Sentinel` settings page.
   - Fields: Cloudflare Worker URL, API Key.
   - Toggles: enable/disable health widget, enable/disable chat widget.
   - Link to upgrade/documentation.

7. **Polish & Ship (5:30–6:00)**
   - `readme.txt` for WordPress.org.
   - Screenshots.
   - Version 0.1.0 tag.
   - Git push, ZIP build.

### 2.4 Security & Quality Rules
- Every PHP file opens with `if (!defined('ABSPATH')) exit;`.
- Every AJAX endpoint verifies nonce via `check_ajax_referer` and capability via `current_user_can`.
- All output escaped with `esc_html`, `esc_attr`, `esc_url`, or `wp_kses_post`.
- No `eval`, no `shell_exec`, no direct DB manipulation for remediation.
- Only reversible WordPress APIs for safe actions.

### 2.5 UI/UX Rules
- Color palette matches wp-admin: WP Blue `#2271b1`, success `#00a32a`, warning `#dba617`, error `#d63638`.
- Chat panel max-width 400px, z-index below admin notices but above content.
- Health widget uses native `.postbox` styling.
- All actions require two clicks (select → confirm).
- React bundle target <100KB gzipped (no UI framework, inline SVG icons).

---

## 3. Verification Criteria

### 3.1 Functional Verification

| ID | Criterion | How to Prove |
|----|-----------|--------------|
| V-01 | Plugin installs cleanly on WordPress 6.4+ | Activate on fresh install; zero fatal errors in `wp-content/debug.log` |
| V-02 | Dashboard widget shows 5 health signals | Load `/wp-admin`; widget displays PHP, plugins, permalinks, cache, thumbnails with color-coded status |
| V-03 | Health data updates via AJAX | Open browser Network tab; confirm `admin-ajax.php?action=wpsentinel_get_health` returns JSON with 5 keys |
| V-04 | Chat panel opens and closes | Click bottom-right chat button; panel slides in. Click X or outside; panel closes |
| V-05 | Chat sends message and receives AI response | Type message; confirm POST to Worker returns text within 3s; markdown renders correctly |
| V-06 | Health context embedded in AI prompt | Inspect Worker logs; confirm system prompt contains serialized `healthContext` object |
| V-07 | Remediation actions execute successfully | Trigger each of 4+ actions from chat/widget; confirm success toast appears and state changes |
| V-08 | Remediation actions show errors gracefully | Simulate failure (e.g., remove write permissions); confirm error toast with readable message |
| V-09 | Settings page persists Worker URL and API key | Save values on `Tools → Sentinel`; reload page; values remain; verify in DB `wp_options` table |
| V-10 | AI chat degrades gracefully without API key | Clear API key; chat shows inline message: "Enter your API key in Tools → Sentinel to enable AI chat" |
| V-11 | All AJAX endpoints validate nonces | Attempt POST without `_wpnonce`; confirm `wp_die(-1)` or `403` response |
| V-12 | All AJAX endpoints validate capabilities | Attempt as subscriber role; confirm `403` or `cheatin' uh?` response |
| V-13 | Cloudflare Worker returns 401 for invalid API key | POST to `/chat` with wrong bearer token; confirm HTTP 401 |
| V-14 | Plugin passes WordPress.org plugin check | Run `wp-org-plugin-check` or manual grep for forbidden functions; zero findings |
| V-15 | Total plugin size under 500KB | Run `du -sh` on plugin directory; confirm <500KB |
| V-16 | React bundle under 100KB gzipped | Run `gzip -c sentinel-admin.js | wc -c`; confirm <102400 |

### 3.2 Code Quality Verification

| ID | Criterion | How to Prove |
|----|-----------|--------------|
| V-17 | No PHP syntax errors | Run `php -l` on every `.php` file; all return "No syntax errors" |
| V-18 | No banned functions | Grep for `eval(`, `shell_exec(`, `passthru(`, `system(`, `exec(` in PHP files; zero matches |
| V-19 | Proper escaping on all output | Grep for `echo \$` without `esc_` wrapper in PHP files; zero unescaped direct variable echoes |
| V-20 | ABSPATH guard on all PHP files | Grep for `defined('ABSPATH')` or `defined("ABSPATH")` in every `.php` file; 100% coverage |

---

## 4. Files to Create or Modify

### 4.1 New Files

#### Plugin Root
- `wp-sentinel.php` — Main plugin file with header, activation hook, namespace autoloader.
- `uninstall.php` — Cleanup routine (remove options, transients).

#### Includes (PHP)
- `includes/class-health-scanner.php` — `WPSentinel\Health\Scanner` with 5 health methods.
- `includes/class-remediation.php` — `WPSentinel\Remediation` with safe action handlers.
- `includes/class-settings.php` — `WPSentinel\Settings` for Settings API page.
- `includes/class-ajax.php` — `WPSentinel\AJAX` — nonce verification, capability checks, endpoint registration.
- `includes/class-chat-proxy.php` — `WPSentinel\Chat\Proxy` — optional server-side proxy to Worker.

#### Admin (React Build)
- `admin/react/package.json` — Vite + React dependencies.
- `admin/react/vite.config.js` — Build config targeting single JS/CSS output.
- `admin/react/index.html` — Development entry.
- `admin/react/src/main.jsx` — React mount point.
- `admin/react/src/App.jsx` — Root component (widget + chat conditional rendering).
- `admin/react/src/components/ChatButton.jsx` — Fixed-position chat toggle.
- `admin/react/src/components/ChatPanel.jsx` — Slide-over message history.
- `admin/react/src/components/MessageList.jsx` — Renders messages + markdown.
- `admin/react/src/components/MessageInput.jsx` — Text input + send handler.
- `admin/react/src/components/HealthWidget.jsx` — Dashboard widget React layer.
- `admin/react/src/components/RemediationMenu.jsx` — Action triggers with confirmation.
- `admin/react/src/components/ConfirmModal.jsx` — Two-click confirmation dialog.
- `admin/react/src/hooks/useChat.js` — Chat state reducer, fetch logic.
- `admin/react/src/hooks/useHealth.js` — Health data fetching, polling.
- `admin/react/src/hooks/useSettings.js` — Settings read/write via AJAX.
- `admin/react/src/utils/api.js` — Fetch wrappers for admin AJAX.
- `admin/react/src/utils/icons.jsx` — Inline SVG icons.
- `admin/react/src/styles/chat.css` — Chat-specific styles (inline or imported).

#### Compiled Assets
- `assets/sentinel-admin.js` — Vite build output (enqueued).
- `assets/sentinel-admin.css` — Vite build output (enqueued).

#### Cloudflare Worker
- `worker/wrangler.toml` — Worker config, AI binding, env secret.
- `worker/src/index.js` — Worker entry: router, `/chat` handler, auth, Claude binding.
- `worker/package.json` — Wrangler + dependencies.

#### WordPress.org Assets
- `readme.txt` — Standard .org headers, description, installation, FAQ, changelog.
- `assets/banner-772x250.png` — Plugin banner.
- `assets/screenshot-1.png` — Health widget screenshot.
- `assets/screenshot-2.png` — Chat panel screenshot.
- `assets/icon-256x256.png` — Plugin icon.

#### Tests
- `tests/bootstrap.php` — PHPUnit bootstrap.
- `tests/test-health-scanner.php` — Unit tests for Scanner class.
- `tests/test-remediation.php` — Unit tests for safe actions.
- `tests/test-ajax.php` — Nonce + capability tests.
- `tests/test-settings.php` — Settings persistence tests.
- `phpunit.xml` — PHPUnit configuration.

### 4.2 Modified Files (WordPress Core — runtime only, no source changes)
- None. Plugin must be fully self-contained.

---

## 5. Acceptance Criteria Mapping

Maps directly to PRD §9:

| PRD Criterion | Covered By |
|---------------|------------|
| No fatal errors on clean install | V-01, V-17 |
| 5 health signals accurate | V-02, V-03, V-17 |
| Chat opens, sends, responds in <3s | V-04, V-05, V-06 |
| 4 remediation actions + toasts | V-07, V-08 |
| Settings persist URL + key | V-09 |
| Degraded state without key | V-10 |
| Nonces + capabilities on AJAX | V-11, V-12 |
| Worker 401 for invalid key | V-13 |
| Pass .org plugin check | V-14, V-18, V-19, V-20 |
| Size <500KB | V-15, V-16 |
