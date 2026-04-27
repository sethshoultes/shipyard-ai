# WP Sentinel — Build Todo

## Scaffold & Foundation

- [ ] Create plugin directory `wp-sentinel/` with `admin/`, `includes/`, `assets/`, `tests/` subdirs — verify: `ls -R wp-sentinel/`
- [ ] Create `wp-sentinel.php` with WordPress plugin header (Name, Version, Requires PHP 7.4, License GPLv2+) — verify: `grep "Plugin Name:" wp-sentinel.php`
- [ ] Add `ABSPATH` security guard to `wp-sentinel.php` — verify: `grep "ABSPATH" wp-sentinel.php`
- [ ] Define constants `WPSENTINEL_VERSION`, `WPSENTINEL_DIR`, `WPSENTINEL_URL` in main file — verify: `grep "define('WPSENTINEL_VERSION'" wp-sentinel.php`
- [ ] Add `register_activation_hook` stub in main file — verify: `grep "register_activation_hook" wp-sentinel.php`
- [ ] Add `register_deactivation_hook` stub in main file — verify: `grep "register_deactivation_hook" wp-sentinel.php`
- [ ] Create `uninstall.php` with `ABSPATH` guard and cleanup stub — verify: `php -l uninstall.php`
- [ ] Create `includes/class-health-scanner.php` with namespace `WPSentinel\Health` and class skeleton — verify: `grep "namespace WPSentinel" includes/class-health-scanner.php`
- [ ] Create `includes/class-remediation.php` with namespace `WPSentinel` and class skeleton — verify: `grep "class Remediation" includes/class-remediation.php`
- [ ] Create `includes/class-settings.php` with namespace `WPSentinel` and class skeleton — verify: `grep "class Settings" includes/class-settings.php`
- [ ] Create `includes/class-ajax.php` with namespace `WPSentinel` and class skeleton — verify: `grep "class AJAX" includes/class-ajax.php`
- [ ] Create `includes/class-chat-proxy.php` with namespace `WPSentinel\Chat` and class skeleton — verify: `grep "class Proxy" includes/class-chat-proxy.php`
- [ ] Add autoloader or `require_once` chain in `wp-sentinel.php` to load all includes — verify: `php -l wp-sentinel.php`

## Health Scanner

- [ ] Implement `Scanner::get_php_status()` — returns version, recommended check, extensions — verify: grep for `function get_php_status` and `phpversion`
- [ ] Implement `Scanner::get_plugin_update_status()` — returns pending update count — verify: grep for `get_site_transient('update_plugins')`
- [ ] Implement `Scanner::get_permalink_status()` — returns rewrite rules integrity check — verify: grep for `flush_rewrite_rules` or `get_option('permalink_structure')`
- [ ] Implement `Scanner::get_cache_status()` — detects known cache plugins — verify: grep for `W3 Total Cache`, `WP Super Cache`, `LiteSpeed`
- [ ] Implement `Scanner::get_thumbnail_status()` — samples 10 recent attachments for missing sizes — verify: grep for `wp_generate_attachment_metadata` or `get_intermediate_image_sizes`
- [ ] Implement `Scanner::get_all()` that aggregates 5 methods into JSON array — verify: grep for `function get_all`
- [ ] Add 5-minute transient caching to `get_all()` via `set_transient`/`get_transient` — verify: grep for `set_transient('wpsentinel_health'`
- [ ] Create AJAX handler `wp_ajax_wpsentinel_get_health` in `class-ajax.php` with nonce check — verify: grep for `wp_ajax_wpsentinel_get_health`
- [ ] Add capability check `manage_options` or `activate_plugins` to health AJAX endpoint — verify: grep for `current_user_can` inside health handler
- [ ] Register dashboard widget via `wp_add_dashboard_widget` in main file or settings class — verify: grep for `wp_add_dashboard_widget`
- [ ] Create dashboard widget PHP wrapper that enqueues React build and mounts `#wp-sentinel-chat-root` — verify: `grep "wp-sentinel-chat-root" wp-sentinel.php`

## React Chat UI (Vite)

- [ ] Initialize Vite project in `admin/react/` with `npm create vite@latest` — verify: `ls admin/react/package.json`
- [ ] Install React and `marked` dependencies — verify: `grep "marked" admin/react/package.json`
- [ ] Configure `vite.config.js` for single-file JS/CSS output — verify: `grep "rollupOptions" admin/react/vite.config.js`
- [ ] Create `admin/react/src/main.jsx` with ReactDOM render into `#wp-sentinel-chat-root` — verify: `grep "createRoot" admin/react/src/main.jsx`
- [ ] Create `App.jsx` with conditional health widget and chat widget rendering — verify: `grep "App" admin/react/src/main.jsx`
- [ ] Create `ChatButton.jsx` — fixed bottom-right button with inline SVG icon — verify: `grep "position: fixed" admin/react/src/components/ChatButton.jsx`
- [ ] Create `ChatPanel.jsx` — slide-over panel with open/close state — verify: `grep "slide" admin/react/src/components/ChatPanel.jsx`
- [ ] Create `MessageList.jsx` — renders user/AI messages, uses `marked` for markdown — verify: `grep "marked" admin/react/src/components/MessageList.jsx`
- [ ] Create `MessageInput.jsx` — controlled input with send on Enter — verify: `grep "onKeyDown" admin/react/src/components/MessageInput.jsx`
- [ ] Create `useChat.js` hook with `useReducer` for messages, typing state, error state — verify: `grep "useReducer" admin/react/src/hooks/useChat.js`
- [ ] Create `useHealth.js` hook that fetches health data via admin AJAX on mount — verify: `grep "fetch" admin/react/src/hooks/useHealth.js`
- [ ] Create `api.js` utility with `fetch` wrapper pointing to `admin-ajax.php` — verify: `grep "admin-ajax.php" admin/react/src/utils/api.js`
- [ ] Build production bundle with `npm run build` — verify: `ls assets/sentinel-admin.js assets/sentinel-admin.css`
- [ ] Enqueue built JS/CSS in PHP via `admin_enqueue_scripts` with `wp_localize_script` for AJAX URL + nonce — verify: `grep "wp_localize_script" wp-sentinel.php`

## Cloudflare Worker

- [ ] Initialize Wrangler project in `worker/` with `wrangler init` — verify: `ls worker/wrangler.toml`
- [ ] Add Claude Workers AI binding to `wrangler.toml` — verify: `grep "ai" worker/wrangler.toml`
- [ ] Create `worker/src/index.js` with `POST /chat` route handler — verify: `grep "POST /chat" worker/src/index.js`
- [ ] Implement bearer token validation against env `API_KEY` — verify: `grep "API_KEY" worker/src/index.js`
- [ ] Implement request body parsing: `{ message, healthContext, apiKey }` — verify: `grep "healthContext" worker/src/index.js`
- [ ] Assemble system prompt with embedded `healthContext` JSON — verify: `grep "You are WP Sentinel" worker/src/index.js`
- [ ] Call Claude `claude-3-haiku-20240307` via Workers AI binding — verify: `grep "claude-3-haiku" worker/src/index.js`
- [ ] Return full text response (MVP, no streaming) — verify: `grep "Response" worker/src/index.js`
- [ ] Deploy worker with `wrangler deploy` — verify: `wrangler whoami` or deployment log

## Remediation Actions

- [ ] Implement `Remediation::regenerate_permalinks()` calling `flush_rewrite_rules()` — verify: `grep "flush_rewrite_rules" includes/class-remediation.php`
- [ ] Implement `Remediation::regenerate_thumbnails()` using `wp_generate_attachment_metadata` — verify: `grep "wp_generate_attachment_metadata" includes/class-remediation.php`
- [ ] Implement `Remediation::clear_plugin_cache()` dispatching safe action hooks for W3TC, WPSC, LiteSpeed — verify: grep for `w3tc_flush_all` or `wp_cache_clear_cache`
- [ ] Implement `Remediation::deactivate_last_plugin()` finding most recent active plugin and deactivating — verify: `grep "deactivate_plugins" includes/class-remediation.php`
- [ ] Implement `Remediation::check_file_permissions()` scanning `wp-content/uploads` for incorrect permissions (report only) — verify: `grep "fileperms" includes/class-remediation.php`
- [ ] Create AJAX handlers in `class-ajax.php` for each action with `check_ajax_referer` — verify: grep for `wp_ajax_wpsentinel_remediate`
- [ ] Add capability checks (`manage_options` or `activate_plugins`) to all remediation AJAX endpoints — verify: grep for `current_user_can` inside remediation handlers
- [ ] Create `ConfirmModal.jsx` in React requiring explicit click to confirm action — verify: `grep "confirm" admin/react/src/components/ConfirmModal.jsx`
- [ ] Wire remediation triggers from `RemediationMenu.jsx` through `ConfirmModal` to AJAX — verify: grep for `fetch.*remediate` in React source

## Settings Page

- [ ] Register `Tools → Sentinel` admin page via `add_submenu_page` — verify: `grep "add_submenu_page" includes/class-settings.php`
- [ ] Create settings form with `Worker URL` text input — verify: `grep "Worker URL" includes/class-settings.php`
- [ ] Create `API Key` password/text input — verify: `grep "API Key" includes/class-settings.php`
- [ ] Create toggle: `Enable Health Widget` checkbox — verify: `grep "health widget" includes/class-settings.php`
- [ ] Create toggle: `Enable Chat Widget` checkbox — verify: `grep "chat widget" includes/class-settings.php`
- [ ] Save settings via `register_setting` + `sanitize_text_field` — verify: `grep "register_setting" includes/class-settings.php`
- [ ] Add `manage_options` capability check on settings page render — verify: `grep "current_user_can('manage_options')" includes/class-settings.php`
- [ ] Pass saved settings to React via `wp_localize_script` — verify: grep for `wpsentinel_settings` in PHP
- [ ] Add link to upgrade/documentation in settings page footer — verify: `grep "documentation" includes/class-settings.php`

## Polish & Distribution

- [ ] Write `readme.txt` with standard WordPress.org headers — verify: `grep "Plugin Name:" readme.txt`
- [ ] Add short description ≤150 chars — verify: `wc -m < readme.txt` first line check
- [ ] Add installation, FAQ, and changelog sections — verify: `grep "== Installation ==" readme.txt`
- [ ] Add plugin banner placeholder `assets/banner-772x250.png` — verify: `file assets/banner-772x250.png`
- [ ] Add screenshot placeholders `assets/screenshot-1.png`, `assets/screenshot-2.png` — verify: `ls assets/screenshot-*.png`
- [ ] Add plugin icon `assets/icon-256x256.png` — verify: `ls assets/icon-256x256.png`
- [ ] Verify plugin size <500KB (excluding screenshots) — verify: `du -sh wp-sentinel/`
- [ ] Run `php -l` on all PHP files — verify: `find . -name "*.php" -exec php -l {} \;`
- [ ] Grep for banned functions (`eval(`, `shell_exec(`, `passthru(`, `system(`, `exec(`) — verify: `grep -r "eval(" wp-sentinel/` returns empty
- [ ] Grep for unescaped `echo` of variables — verify: manual review or regex search
- [ ] Confirm `ABSPATH` guard in every PHP file — verify: `find . -name "*.php" -exec grep -L "ABSPATH" {} \;` returns empty
- [ ] Create `phpunit.xml` and `tests/bootstrap.php` — verify: `ls phpunit.xml tests/bootstrap.php`
- [ ] Tag version 0.1.0 in Git — verify: `git tag | grep "0.1.0"`
- [ ] Build ZIP archive for WordPress.org — verify: `ls wp-sentinel-0.1.0.zip`
