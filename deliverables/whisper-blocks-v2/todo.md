# Whisper Blocks v2 — Running To-Do

## Plugin Shell
- [ ] Create plugin header `whisper-blocks-v2.php` — verify: `php -l whisper-blocks-v2.php` exits 0 and `grep -q "Plugin Name: Scribe" whisper-blocks-v2.php` passes
- [ ] Create `.gitignore` — verify: file exists and `grep -q "node_modules" .gitignore && grep -q "build/" .gitignore` passes
- [ ] Create `package.json` with `@wordpress/scripts` — verify: `jq '.dependencies["@wordpress/scripts"]' package.json` is not null
- [ ] Create `README.md` stub (≤10 lines) — verify: `wc -l README.md` ≤ 10 and file is not empty
- [ ] Create `readme.txt` with WordPress.org headers — verify: `grep -q "=== Scribe ===" readme.txt && grep -q "Stable tag:" readme.txt` passes

## Block Assets (src/)
- [ ] Create `src/block.json` manifest (apiVersion 3) — verify: `jq empty src/block.json` passes and `jq '.apiVersion' src/block.json` returns 3
- [ ] Create `src/index.js` block registration entry — verify: `grep -q "registerBlockType" src/index.js` passes
- [ ] Create `src/edit.js` editor component — verify: `grep -q "export default" src/edit.js && grep -q "MediaUpload\|useBlockProps" src/edit.js` passes
- [ ] Create `src/save.js` frontend save component — verify: `grep -q "export default" src/save.js && grep -q "transcript\|audio" src/save.js` passes
- [ ] Create `src/style.scss` frontend styles — verify: `grep -q "\.scribe-transcript\|\.timestamp" src/style.scss` passes
- [ ] Create `src/editor.scss` editor-only styles — verify: `grep -q "\.editor\|dropzone\|pending" src/editor.scss` passes

## PHP Backend (includes/)
- [ ] Create `includes/class-whisper-admin.php` settings page — verify: `php -l includes/class-whisper-admin.php` exits 0 and `grep -q "add_options_page\|register_setting" includes/class-whisper-admin.php` passes
- [ ] Create `includes/class-whisper-api.php` OpenAI client — verify: `php -l includes/class-whisper-api.php` exits 0 and `grep -q "25MB\|filesize\|wp_remote_post" includes/class-whisper-api.php` passes
- [ ] Create `includes/class-whisper-scheduler.php` Action Scheduler wrapper — verify: `php -l includes/class-whisper-scheduler.php` exits 0 and `grep -q "as_schedule_single_action\|pending\|completed\|failed" includes/class-whisper-scheduler.php` passes
- [ ] Create `includes/class-whisper-transcript.php` post_meta cache — verify: `php -l includes/class-whisper-transcript.php` exits 0 and `grep -q "update_post_meta\|get_post_meta" includes/class-whisper-transcript.php` passes

## Build & Validation
- [ ] Install npm dependencies — verify: `test -d node_modules/@wordpress/scripts` passes
- [ ] Run `npm run build` — verify: `test -f build/index.js && test -f build/block.json` passes
- [ ] Run PHP syntax check on all `.php` files — verify: `for f in $(find . -name '*.php'); do php -l "$f" || exit 1; done` exits 0
- [ ] Verify no custom webpack config exists — verify: `test ! -f webpack.config.js && test ! -f babel.config.js` passes
- [ ] Verify no hardcoded OpenAI keys — verify: `grep -ri "sk-[a-z0-9]" src/ includes/ *.php` returns empty
- [ ] Verify no banned dependencies in `package.json` — verify: `grep -qi "bull\|redis\|custom-webpack" package.json` returns empty
- [ ] Verify file count ≥12 source files — verify: `find . -type f \( -name '*.php' -o -name '*.js' -o -name '*.scss' -o -name '*.json' -o -name '*.txt' \) | wc -l` ≥ 12
- [ ] Run all test scripts in `tests/` — verify: `for f in tests/*.sh; do bash "$f" || exit 1; done` exits 0
