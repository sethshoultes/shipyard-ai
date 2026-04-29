# Todo: Scribe — AI Transcription Gutenberg Block

> Issue: sethshoultes/shipyard-ai#88

Format: `- [ ] Task description — verify: how to check it worked`

---

## Wave 1 — Plugin Scaffold (Foundation)

- [ ] Create `scribe.php` with WordPress plugin header — verify: `php -l scribe.php` returns "No syntax errors"
- [ ] Define `SCRIBE_VERSION` constant (e.g., `1.0.0`) in `scribe.php` — verify: `grep "SCRIBE_VERSION" scribe.php`
- [ ] Add `register_activation_hook` that flushes rewrite rules and schedules `scribe_process_jobs` cron — verify: `grep "register_activation_hook" scribe.php`
- [ ] Add `register_deactivation_hook` that clears cron events — verify: `grep "register_deactivation_hook" scribe.php`
- [ ] Register autoloader for `includes/class-*.php` in `scribe.php` — verify: `grep "spl_autoload_register\|require_once.*class-" scribe.php`
- [ ] Create `block.json` with valid block manifest (name, title, category, icon, supports) — verify: `python3 -c "import json; json.load(open('block.json'))"` exits 0
- [ ] Register block type in `scribe.php` via `register_block_type(__DIR__)` — verify: `grep "register_block_type" scribe.php`
- [ ] Load plugin textdomain `'scribe'` in `scribe.php` — verify: `grep "load_plugin_textdomain.*scribe" scribe.php`
- [ ] Create `languages/` directory — verify: `test -d languages && echo OK`
- [ ] Create `languages/scribe.pot` stub with header — verify: `test -f languages/scribe.pot && grep "Project-Id-Version" languages/scribe.pot`

## Wave 2 — Editor Block Components (JS/SCSS)

- [ ] Create `src/edit.js` exporting default block edit component — verify: `test -f src/edit.js && grep "export default" src/edit.js`
- [ ] Create `src/save.js` exporting default save component — verify: `test -f src/save.js && grep "export default" src/save.js`
- [ ] Create `src/components/AudioDropZone.js` with drag-and-drop event handlers — verify: `test -f src/components/AudioDropZone.js && grep -E "dragover|drop|onDrop" src/components/AudioDropZone.js`
- [ ] Validate accepted file types in AudioDropZone (MP3, M4A, WAV) — verify: `grep -E "mp3|m4a|wav|audio/mpeg" src/components/AudioDropZone.js`
- [ ] Create `src/components/JobStatus.js` rendering calm progress state — verify: `test -f src/components/JobStatus.js && grep -E "progress|status|pending|processing|complete" src/components/JobStatus.js`
- [ ] Create `src/components/Transcript.js` for sentence-level render — verify: `test -f src/components/Transcript.js && grep "data-start" src/components/Transcript.js`
- [ ] Create `src/components/Word.js` for word-level timestamp click — verify: `test -f src/components/Word.js && grep "data-start" src/components/Word.js`
- [ ] Create `src/editor.scss` with zero custom fonts, native Gutenberg feel — verify: `test -f src/editor.scss && grep -v "font-family" src/editor.scss || echo "OK: no custom fonts"`
- [ ] Create `src/style.scss` with system font stack and generous line-height — verify: `test -f src/style.scss && grep "line-height" src/style.scss && grep -E "system-ui|-apple-system" src/style.scss`
- [ ] Build assets with `@wordpress/scripts` producing `build/block.js` — verify: `test -f build/block.js`
- [ ] Build assets producing `build/block.css` — verify: `test -f build/block.css`
- [ ] Build assets producing `build/frontend.js` — verify: `test -f build/frontend.js`
- [ ] Enqueue frontend CSS on posts containing the block — verify: `grep "wp_enqueue_style.*scribe-frontend" scribe.php includes/*.php`

## Wave 3 — Backend PHP Classes

- [ ] Create `includes/class-scribe-api.php` with `Scribe_API` class — verify: `php -l includes/class-scribe-api.php`
- [ ] Implement Whisper proxy `transcribe($file_path)` using `wp_remote_post` — verify: `grep "wp_remote_post" includes/class-scribe-api.php && grep "api.openai.com" includes/class-scribe-api.php`
- [ ] Add API key retrieval from `wp_options` or `SCRIBE_API_KEY` constant — verify: `grep -E "get_option.*scribe_api_key|SCRIBE_API_KEY" includes/class-scribe-api.php`
- [ ] Map Whisper API errors to user-friendly messages — verify: `grep -E "400|401|429|500" includes/class-scribe-api.php`
- [ ] Create `includes/class-job-queue.php` with `Scribe_Job_Queue` class — verify: `php -l includes/class-job-queue.php`
- [ ] Register WP Cron hook `scribe_process_jobs` — verify: `grep "scribe_process_jobs" includes/class-job-queue.php`
- [ ] Implement job state machine: pending, processing, complete, failed — verify: `grep -E "pending|processing|complete|failed" includes/class-job-queue.php`
- [ ] Add exponential backoff retry logic — verify: `grep -E "sleep|retry|backoff" includes/class-job-queue.php`
- [ ] Create `includes/class-storage.php` with `Scribe_Storage` class — verify: `php -l includes/class-storage.php`
- [ ] Implement `save_transcript($post_id, $transcript_json)` using `update_post_meta` — verify: `grep "update_post_meta" includes/class-storage.php`
- [ ] Implement `get_transcript($post_id)` using `get_post_meta` — verify: `grep "get_post_meta" includes/class-storage.php`
- [ ] Register meta keys with `register_post_meta` — verify: `grep "register_post_meta" includes/class-storage.php`
- [ ] Create `includes/class-settings.php` with `Scribe_Settings` class — verify: `php -l includes/class-settings.php`
- [ ] Register Settings > Scribe admin page with `manage_options` capability — verify: `grep "add_options_page\|add_menu_page" includes/class-settings.php && grep "manage_options" includes/class-settings.php`
- [ ] Render single API key input field (type=password) — verify: `grep -E "type=.*password|type=\"password\"" includes/class-settings.php admin/views/*.php 2>/dev/null || grep "password" includes/class-settings.php`
- [ ] Save API key to `wp_options` with encryption — verify: `grep -E "update_option.*scribe_api_key|openssl_encrypt" includes/class-settings.php`
- [ ] Show non-writable notice if `SCRIBE_API_KEY` constant is defined — verify: `grep "SCRIBE_API_KEY" includes/class-settings.php`
- [ ] Create `includes/class-license.php` with `Scribe_License` class — verify: `php -l includes/class-license.php`
- [ ] Implement usage metering increment per minute — verify: `grep -E "usage|minute|meter" includes/class-license.php`
- [ ] Implement 60 min/month free tier cap check — verify: `grep -E "60|MONTH_IN_SECONDS|free.*cap" includes/class-license.php`
- [ ] Implement license key validation stub — verify: `grep -E "validate_license|license_key" includes/class-license.php`
- [ ] Create `includes/class-library.php` with `Scribe_Library` class — verify: `php -l includes/class-library.php`
- [ ] Register admin submenu for transcript library — verify: `grep "add_submenu_page" includes/class-library.php`
- [ ] Render grid view of transcripts — verify: `grep -E "get_posts|relay_lead|transcript" includes/class-library.php` (adapted to scribe CPT/meta)

## Wave 4 — Frontend Interactivity

- [ ] Wire click-to-play: sentence click seeks HTML5 audio — verify: `grep -E "currentTime|audio\.play|data-start" src/components/Transcript.js build/frontend.js`
- [ ] Add sentence-level fallback if word timestamps are missing — verify: `grep -E "fallback|sentence|word.*null" src/components/Transcript.js src/components/Word.js`
- [ ] Ensure seek buffer accounts for browser drift — verify: comment or code referencing `buffer` or `drift` in frontend JS
- [ ] Test audio element exists before seeking — verify: `grep -E "audio.*exists|audio.*null|getElementById.*audio" src/components/Transcript.js build/frontend.js`
- [ ] Frontend CSS compiled to `assets/css/frontend.css` — verify: `test -f assets/css/frontend.css`

## Wave 5 — Public URLs & Embed (Conditional)

- [ ] Add custom rewrite rule `/transcript/([^/]+)` — verify: `grep -E "add_rewrite_rule|transcript" scribe.php includes/class-public-urls.php 2>/dev/null`
- [ ] Create public transcript page template — verify: `test -f includes/class-public-urls.php && grep "template" includes/class-public-urls.php`
- [ ] Handle `?t=123` deep-link timestamp on public page — verify: `grep -E "\$_GET\[.*t\]|t=|timestamp" includes/class-public-urls.php`
- [ ] Add oEmbed metadata to public transcript pages — verify: `grep "oembed" includes/class-public-urls.php`
- [ ] Create embeddable player block or iframe renderer — verify: `grep -E "iframe|embed" includes/class-embed.php 2>/dev/null || echo "embed class not yet created"`

## Wave 6 — Cleanup & Pruning

- [ ] Implement cleanup cron in `class-storage.php` — verify: `grep -E "prune|cleanup|delete_post_meta" includes/class-storage.php`
- [ ] Define retention policy (e.g., 90 days) for old job artifacts — verify: `grep -E "90|DAY_IN_SECONDS|retention" includes/class-storage.php`
- [ ] Ensure cleanup does not delete published transcript content — verify: code comment or condition checking post_status before pruning

## Wave 7 — Security Hardening

- [ ] Add `current_user_can('manage_options')` to all admin page callbacks — verify: `grep -r "current_user_can" includes/*.php | wc -l` returns ≥ 3
- [ ] Add `permission_callback` to all REST endpoints — verify: `grep -r "permission_callback" includes/*.php`
- [ ] Add `wp_nonce_field` to all admin forms — verify: `grep -r "wp_nonce_field" includes/*.php admin/views/*.php 2>/dev/null`
- [ ] Verify all `echo` statements use escaping (`esc_html`, `esc_attr`, `esc_url`) — verify: `grep -rEn "echo\s+[^(]" includes/*.php admin/views/*.php 2>/dev/null | grep -v "esc_\|wp_kses" && exit 1 || echo "OK"`
- [ ] Verify all `$_GET`/`$_POST`/`$_REQUEST` access uses sanitization — verify: `grep -rEn "\$_GET\[|\$_POST\[|\$_REQUEST\[" includes/*.php | grep -v "sanitize_\|absint\|wp_kses" && exit 1 || echo "OK"`
- [ ] Wrap all user-visible strings with `__()`, `_e()`, or `esc_html__()` using text domain `'scribe'` — verify: `grep -rE "__\(|_e\(|esc_html__\(" includes/*.php src/*.js | grep "'scribe'" | wc -l` returns ≥ 10
- [ ] Run `php -l` recursively on all `.php` files — verify: `find . -name "*.php" -exec php -l {} \; | grep -i "error" && exit 1 || echo "PASS"`

## Wave 8 — WordPress.org Readiness

- [ ] Create `readme.txt` with WP.org standard headers — verify: `test -f readme.txt && grep "=== Scribe ===" readme.txt`
- [ ] Verify PHP 7.4 compatibility: no union types, no named arguments, no `match`, no `str_contains` — verify: `grep -rE "\bstring\|int\b|\bmatch\s*\(|str_contains\(" includes/*.php scribe.php && exit 1 || echo "PASS"`
- [ ] Confirm no `console.log` left in production JS — verify: `grep -r "console.log" build/ src/ && exit 1 || echo "PASS"`
- [ ] Confirm no hardcoded API keys in source — verify: `grep -rEn "sk-[a-zA-Z0-9]{20,}" . --include="*.php" --include="*.js" && exit 1 || echo "PASS"`

## Wave 9 — Final Integration Checks

- [ ] Activate plugin in WordPress test env without fatal errors — verify: wp-admin Plugins page shows Scribe as active
- [ ] Insert block in Gutenberg editor — verify: block appears in inserter and renders drop zone
- [ ] Drop valid MP3 file — verify: upload succeeds and JobStatus shows "Processing"
- [ ] Complete full async pipeline end-to-end — verify: transcript JSON saved to post_meta and rendered in editor
- [ ] Click transcript sentence on frontend — verify: audio seeks to correct timestamp and plays
- [ ] Verify usage counter increments — verify: option `scribe_usage_minutes` increases after transcription
- [ ] Verify free tier cap blocks overage — verify: 61st minute returns clear upgrade message
