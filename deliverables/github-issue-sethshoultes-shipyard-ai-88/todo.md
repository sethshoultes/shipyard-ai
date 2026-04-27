# Whisper — Build Todo

> Issue: sethshoultes/shipyard-ai#88
> Rules: Each task is atomic (< 5 min), with a verifiable check step.

---

## Wave 1 — Plugin Scaffold & PHP Backend

- [ ] Create project directory `projects/whisper/build/whisper/` — verify: `test -d projects/whisper/build/whisper`
- [ ] Create `whisper.php` with plugin header (Name: Whisper, Version: 1.0.0, Author, License) — verify: `grep -q "Plugin Name: Whisper" projects/whisper/build/whisper/whisper.php`
- [ ] Add block registration hook in `whisper.php` (`register_block_type`) — verify: `grep -q "register_block_type" projects/whisper/build/whisper/whisper.php`
- [ ] Add WP Cron hook registration in `whisper.php` — verify: `grep -q "wp_schedule_event\|add_action.*cron" projects/whisper/build/whisper/whisper.php`
- [ ] Create `block.json` with required fields (`name`, `title`, `category`, `editorScript`, `editorStyle`, `style`) — verify: `jq -e '.name and .title and .category and .editorScript and .style' projects/whisper/build/whisper/block.json`
- [ ] Create `includes/class-whisper-api.php` with `Whisper_API` class skeleton — verify: `grep -q "class Whisper_API" projects/whisper/build/whisper/includes/class-whisper-api.php`
- [ ] Add `send_transcription_request()` method calling `wp_remote_post()` to `api.openai.com` — verify: `grep -q "wp_remote_post" projects/whisper/build/whisper/includes/class-whisper-api.php`
- [ ] Add error-mapping helper in `class-whisper-api.php` — verify: `grep -q "function.*error" projects/whisper/build/whisper/includes/class-whisper-api.php`
- [ ] Create `includes/class-job-queue.php` with `Whisper_Job_Queue` class — verify: `grep -q "class Whisper_Job_Queue" projects/whisper/build/whisper/includes/class-job-queue.php`
- [ ] Define job states: `pending`, `processing`, `complete`, `failed` — verify: `grep -Eq "pending|processing|complete|failed" projects/whisper/build/whisper/includes/class-job-queue.php`
- [ ] Register custom cron interval and hook in `class-job-queue.php` — verify: `grep -q "add_action.*cron" projects/whisper/build/whisper/includes/class-job-queue.php`
- [ ] Add exponential backoff retry logic (max 5 attempts) — verify: `grep -q "attempt\|retry\|backoff" projects/whisper/build/whisper/includes/class-job-queue.php`
- [ ] Create `includes/class-storage.php` with `Whisper_Storage` class — verify: `grep -q "class Whisper_Storage" projects/whisper/build/whisper/includes/class-storage.php`
- [ ] Add `save()`, `get()`, and `prune()` methods — verify: `grep -Eq "function save|function get|function prune" projects/whisper/build/whisper/includes/class-storage.php`
- [ ] Create `includes/class-settings.php` with `Whisper_Settings` class — verify: `grep -q "class Whisper_Settings" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Register settings page under `Settings > Whisper` — verify: `grep -q "add_options_page\|add_submenu_page" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Render exactly one API key input field — verify: `grep -q "api_key\|API_KEY" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Support `WHISPER_API_KEY` constant bypass — verify: `grep -q "WHISPER_API_KEY" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Add nonce field and `check_admin_referer()` to settings form — verify: `grep -q "wp_nonce_field\|check_admin_referer" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Create `readme.txt` with WordPress.org required sections — verify: `grep -Eq "=== Whisper ===|== Description ==|== Installation ==" projects/whisper/build/whisper/readme.txt`
- [ ] Create `languages/` stub directory — verify: `test -d projects/whisper/build/whisper/languages`
- [ ] Run `php -l` on all `.php` files — verify: `for f in projects/whisper/build/whisper/includes/*.php projects/whisper/build/whisper/whisper.php; do php -l "$f" || exit 1; done`

## Wave 2 — Build System & Editor Block

- [ ] Create `package.json` with `@wordpress/scripts` dependency — verify: `grep -q "@wordpress/scripts" projects/whisper/build/whisper/package.json`
- [ ] Add build scripts (`build`, `start`) to `package.json` — verify: `jq -e '.scripts.build and .scripts.start' projects/whisper/build/whisper/package.json`
- [ ] Create `src/edit.js` importing WordPress block components — verify: `test -f projects/whisper/build/whisper/src/edit.js`
- [ ] Create `src/save.js` returning server-renderable markup — verify: `test -f projects/whisper/build/whisper/src/save.js`
- [ ] Create `src/components/AudioDropZone.js` accepting MP3/M4A/WAV — verify: `grep -Eq "mp3|m4a|wav|audio" projects/whisper/build/whisper/src/components/AudioDropZone.js`
- [ ] Create `src/components/JobStatus.js` with skeleton/zen progress UI — verify: `test -f projects/whisper/build/whisper/src/components/JobStatus.js`
- [ ] Create `src/components/Transcript.js` rendering word array — verify: `test -f projects/whisper/build/whisper/src/components/Transcript.js`
- [ ] Create `src/components/Word.js` with `onClick` seek handler — verify: `grep -q "onClick\|currentTime" projects/whisper/build/whisper/src/components/Word.js`
- [ ] Create `src/editor.scss` for editor chrome — verify: `test -f projects/whisper/build/whisper/src/editor.scss`
- [ ] Run `npm install` in plugin directory — verify: `test -d projects/whisper/build/whisper/node_modules/@wordpress/scripts`
- [ ] Run `npm run build` — verify: `cd projects/whisper/build/whisper && npm run build` exits 0
- [ ] Confirm `build/block.js` exists and is non-empty — verify: `test -s projects/whisper/build/whisper/build/block.js`
- [ ] Confirm `build/block.css` exists and is non-empty — verify: `test -s projects/whisper/build/whisper/build/block.css`

## Wave 3 — Frontend & Typography

- [ ] Create `src/frontend.js` attaching click handlers to transcript words — verify: `grep -q "currentTime" projects/whisper/build/whisper/src/frontend.js`
- [ ] Add small negative seek offset buffer (~50 ms) for browser drift — verify: `grep -q "offset\|buffer" projects/whisper/build/whisper/src/frontend.js`
- [ ] Create `src/style.scss` with magazine-grade system-font typography — verify: `test -f projects/whisper/build/whisper/src/style.scss`
- [ ] Add generous line-height, warm spacing, no admin-panel aesthetic — verify: `grep -Eq "line-height|letter-spacing|font-family: system-ui" projects/whisper/build/whisper/src/style.scss`
- [ ] Add SRT export button handler in frontend or editor — verify: `grep -q "SRT\|srt" projects/whisper/build/whisper/src/frontend.js || grep -q "SRT\|srt" projects/whisper/build/whisper/src/edit.js`
- [ ] Re-run `npm run build` — verify: exits 0
- [ ] Confirm `build/frontend.js` exists and is non-empty — verify: `test -s projects/whisper/build/whisper/build/frontend.js`

## Wave 4 — Integration, Security & Polish

- [ ] Include all PHP classes in `whisper.php` (`require_once` or autoloader) — verify: `grep -q "class-whisper-api.php\|class-job-queue.php\|class-storage.php\|class-settings.php" projects/whisper/build/whisper/whisper.php`
- [ ] Enforce 50 MB file-size guard (client-side accept attribute + server-side check) — verify: `grep -q "50\|max_file_size\|upload_max" projects/whisper/build/whisper/src/components/AudioDropZone.js || grep -q "50\|max_file_size" projects/whisper/build/whisper/includes/class-whisper-api.php`
- [ ] Add capability check `current_user_can('edit_posts')` to REST handlers — verify: `grep -q "current_user_can.*edit_posts" projects/whisper/build/whisper/includes/class-whisper-api.php`
- [ ] Escape all rendered settings output with `esc_html()` / `esc_attr()` — verify: `grep -q "esc_html\|esc_attr" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Implement weekly cleanup cron hook in `class-storage.php` — verify: `grep -q "cleanup\|prune\|weekly" projects/whisper/build/whisper/includes/class-storage.php`
- [ ] Add sentence-level fallback render if word array is corrupt — verify: `grep -q "fallback\|sentence" projects/whisper/build/whisper/src/components/Transcript.js`
- [ ] Wrap all user-visible strings with `__()` or `_e()` — verify: `grep -q "__(\|_e(" projects/whisper/build/whisper/whisper.php && grep -q "__(\|_e(" projects/whisper/build/whisper/includes/class-settings.php`
- [ ] Final `php -l` sweep on all PHP files — verify: all pass
- [ ] Final `npm run build` — verify: exits 0

## Wave 5 — QA & Verification

- [ ] Run `tests/test-structure.sh` — verify: exits 0
- [ ] Run `tests/test-php-syntax.sh` — verify: exits 0
- [ ] Run `tests/test-block-json.sh` — verify: exits 0
- [ ] Run `tests/test-banned-patterns.sh` — verify: exits 0
- [ ] Run `tests/test-security-patterns.sh` — verify: exits 0
- [ ] Run `tests/test-build-output.sh` — verify: exits 0
- [ ] Review plugin zip size (< 500 KB excluding node_modules) — verify: `du -sh projects/whisper/build/whisper/ | awk '{print $1}'` reports reasonable size
