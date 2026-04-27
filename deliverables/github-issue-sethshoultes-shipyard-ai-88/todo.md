# To-Do — Scribe (GitHub Issue #88)

## Wave 1: Plugin Scaffold

- [ ] Create plugin directory `projects/scribe/build/scribe/` — verify: `ls` shows directory exists
- [ ] Create `scribe.php` with plugin header and ABSPATH guard — verify: `php -l scribe.php` exits 0 and `grep -q "Plugin Name:" scribe.php`
- [ ] Create `block.json` with `name`, `title`, `editorScript`, `style`, `script` fields — verify: `python3 -m json.tool block.json` exits 0
- [ ] Create `src/edit.js` exporting default edit function — verify: `node --check src/edit.js` exits 0
- [ ] Create `src/save.js` exporting default save function — verify: `node --check src/save.js` exits 0
- [ ] Create `src/style.scss` with `.wp-block-scribe-transcript` base rules — verify: file exists
- [ ] Create `src/editor.scss` with `.wp-block-scribe-editor` chrome rules — verify: file exists
- [ ] Create `includes/class-scribe-api.php` with `Scribe_API` class stub — verify: `php -l` exits 0
- [ ] Create `includes/class-job-queue.php` with `Scribe_Job_Queue` class stub — verify: `php -l` exits 0
- [ ] Create `includes/class-storage.php` with `Scribe_Storage` class stub — verify: `php -l` exits 0
- [ ] Create `includes/class-settings.php` with `Scribe_Settings` class stub — verify: `php -l` exits 0
- [ ] Add `register_block_type()` call in `scribe.php` pointing to `block.json` — verify: `grep -q "register_block_type" scribe.php`
- [ ] Add `register_activation_hook` and `register_deactivation_hook` stubs in `scribe.php` — verify: `grep -q "register_activation_hook" scribe.php`
- [ ] Create `readme.txt` with WordPress.org standard headers — verify: `grep -q "=== Scribe ===" readme.txt`
- [ ] Add `@wordpress/scripts` and `build` script to `package.json` — verify: `grep -q "wp-scripts build" package.json`
- [ ] Run `npm install` in plugin directory — verify: `node_modules/.bin/wp-scripts` exists

## Wave 2: Block Editor UI

- [ ] Implement `AudioDropZone` drag event handlers in `src/components/AudioDropZone.js` — verify: `node --check` exits 0
- [ ] Add file type validation (MP3, M4A, WAV) in `AudioDropZone` — verify: manual test rejects `.txt` drag
- [ ] Implement `JobStatus` component with pending/processing/completed/error states — verify: `node --check` exits 0
- [ ] Implement `Transcript` component rendering sentences with data-start attributes — verify: `node --check` exits 0
- [ ] Implement `Word` component with `onClick` seek handler — verify: `node --check` exits 0
- [ ] Wire `edit.js` to render `AudioDropZone` when no audio attached — verify: `npm run build` succeeds
- [ ] Wire `edit.js` to render `JobStatus` when job is pending — verify: `npm run build` succeeds
- [ ] Wire `edit.js` to render `Transcript` preview when job is done — verify: `npm run build` succeeds
- [ ] Run `npm run build` and confirm `build/block.js` and `build/block.css` are generated — verify: `ls build/block.js build/block.css`
- [ ] Verify block appears in Gutenberg inserter — verify: manual admin check or grep for block name in `build/block.js`

## Wave 3: PHP Proxy & Async Queue

- [ ] Add `Scribe_API::get_api_key()` reading option then `SCRIBE_API_KEY` constant — verify: unit test asserts constant overrides option
- [ ] Add `Scribe_API::send($file_path)` skeleton with `wp_remote_post` to OpenAI — verify: `php -l` exits 0
- [ ] Map file upload to multipart body in `Scribe_API::send()` — verify: mock test asserts `body` contains file
- [ ] Add response JSON decoding in `Scribe_API::send()` — verify: returns array on HTTP 200
- [ ] Add error mapping (4xx/5xx → `WP_Error`) in `Scribe_API::send()` — verify: returns `is_wp_error()` true on failure
- [ ] Register custom cron schedule on activation in `scribe.php` — verify: `grep -A 5 "register_activation_hook" scribe.php | grep -q "wp_schedule_event"`
- [ ] Add `Scribe_Job_Queue::add_job($post_id, $file_path)` creating `pending` post_meta — verify: `get_post_meta` returns `pending`
- [ ] Add `Scribe_Job_Queue::process_job($post_id)` calling API and saving result — verify: transitions meta to `completed`
- [ ] Add `Scribe_Job_Queue::get_job_status($post_id)` returning status string — verify: returns expected string
- [ ] Implement exponential backoff retry on API failure in `process_job()` — verify: retry count increments, dead-letters after 3 tries
- [ ] Add capability check (`current_user_can('upload_files')`) to proxy handler — verify: `grep -q "current_user_can" includes/class-scribe-api.php`

## Wave 4: Storage, Settings & Cleanup

- [ ] Implement `Scribe_Storage::save_transcript($post_id, $data)` with JSON encoding — verify: `get_post_meta` returns valid JSON
- [ ] Implement `Scribe_Storage::get_transcript($post_id)` with JSON decoding — verify: roundtrip returns identical array
- [ ] Implement `Scribe_Storage::prune_old_transcripts()` deleting meta older than 30 days — verify: old meta removed, new meta preserved
- [ ] Add weekly pruning cron registration in `scribe.php` — verify: `wp_schedule_event` present for `scribe_prune`
- [ ] Add Settings > Scribe page with `add_options_page` in `class-settings.php` — verify: page slug `scribe-settings` exists
- [ ] Render API key input field with `sanitize_text_field` on save — verify: form field name is `scribe_api_key`
- [ ] Save API key to `wp_options` on form submit — verify: `get_option('scribe_api_key')` returns saved value
- [ ] Bypass settings UI when `SCRIBE_API_KEY` constant is defined — verify: `defined('SCRIBE_API_KEY')` skips field render
- [ ] Add `manage_options` capability check to settings page callback — verify: `current_user_can` guards page render
- [ ] Add clear inline error state in block when API key is missing — verify: block shows "Set API key" link, no fatal error

## Wave 5: Frontend Render & Click-to-Play

- [ ] Enqueue `frontend.js` and `frontend.css` only when block is present — verify: `grep -q "has_block" scribe.php` or equivalent
- [ ] Implement sentence-level click-to-play in `frontend.js` — verify: click sets `audio.currentTime` to sentence start
- [ ] Implement word-level click-to-play if Whisper returns word timestamps — verify: click seeks to word start time
- [ ] Add -0.2s seek buffer to compensate browser drift — verify: seek target is `time - 0.2`
- [ ] Add sentence-level fallback render when word array is missing — verify: renders sentences when words absent
- [ ] Add system font stack to `style.scss` — verify: no `@import` for external fonts
- [ ] Add generous line-height and warm spacing variables — verify: `line-height >= 1.7` in compiled CSS
- [ ] Add responsive transcript container styles — verify: no horizontal scroll at 375px viewport
- [ ] Compile `style.scss` to `assets/css/frontend.css` — verify: `npm run build` produces file
- [ ] Verify frontend assets are minified in production build — verify: `build/frontend.js` has no comments or line breaks

## Wave 6: Free Tier & Licensing

- [ ] Implement monthly usage option `scribe_usage_minutes` — verify: `get_option` returns integer, defaults to 0
- [ ] Increment usage counter by audio duration on successful transcription — verify: counter increases by file duration
- [ ] Implement 60-minute monthly cap check before queueing job — verify: returns `WP_Error` when `usage >= 60`
- [ ] Implement monthly auto-reset on 1st of month — verify: counter resets after month boundary
- [ ] Add filter `scribe_max_free_minutes` so cap is adjustable — verify: `apply_filters` present in cap check

## Wave 7: QA, Compliance & Packaging

- [ ] Run `php -l` on all PHP files — verify: zero syntax errors
- [ ] Run `node --check` on all `src/**/*.js` files — verify: zero syntax errors
- [ ] Run `./tests/test-structure.sh` — verify: exits 0
- [ ] Run `./tests/test-php-lint.sh` — verify: exits 0
- [ ] Run `./tests/test-decisions.sh` — verify: exits 0 (no banned patterns)
- [ ] Run `./tests/test-security.sh` — verify: exits 0
- [ ] Run `./tests/test-build.sh` — verify: exits 0
- [ ] Verify activation hook contains zero `wp_remote_*` or `curl` calls — verify: `grep` returns 0 matches
- [ ] Verify no `eval()`, `assert()`, suspicious `base64_decode` in source — verify: `grep` returns 0 matches
- [ ] Verify all PHP files have `ABSPATH` guard — verify: `find` + `grep` returns 0 missing
- [ ] Verify readme.txt has no aggressive upsell language — verify: manual review, no "annual billing" copy
- [ ] Build production ZIP excluding `src/`, `node_modules/`, `.github/` — verify: `unzip -l` shows no excluded paths
- [ ] Tag release `v1.0.0` — verify: `git tag` shows `v1.0.0`
