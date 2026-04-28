# Todo — Cut (Changelog Theatre)

> Issue: sethshoultes/shipyard-ai#82

---

## Wave 1 — Client Core (The Gasp)

- [ ] Create `projects/cut/build/client/src/typography.css` with system font stack and editorial scale — verify: open file, confirm `font-family` and `h1`–`h6` scales exist
- [ ] Create `projects/cut/build/client/src/motion.css` with fade and slide keyframes — verify: grep for `@keyframes fade` and `@keyframes slide`, confirm no `bounce` or `wobble`
- [ ] Create `projects/cut/build/client/src/sequence.js` with cinematic timeline (first 5 seconds) — verify: `node --check` passes, function `playSequence` exists
- [ ] Create `projects/cut/build/client/src/renderer.js` that renders one changelog version with DOM/CSS animation — verify: `node --check` passes, function `renderVersion` exists
- [ ] Wire `sequence.js` → `renderer.js` in `projects/cut/build/client/index.html` — verify: open `index.html` in browser, see animated text appear
- [ ] Gasp check: load `index.html` with sample data — verify: if it feels like a PowerPoint, stop and redesign before continuing
- [ ] Create `projects/cut/build/client/src/parser.js` with strict WordPress changelog parser — verify: `node --check` passes, function `parseChangelog` exists
- [ ] Unit-test parser with valid `readme.txt` sample — verify: `node tests/test-parser.js` returns expected version array
- [ ] Unit-test parser with malformed input — verify: parser throws or returns dignified error string
- [ ] Unit-test parser rejects GitHub Releases / npm / Keep a Changelog formats — verify: all three return error
- [ ] Wire `parser.js` → `sequence.js` in `index.html` — verify: paste valid changelog, animation plays with real parsed data
- [ ] Create `projects/cut/build/client/src/narrator.js` with Web Speech API wrapper — verify: `node --check` passes, function `speak` exists
- [ ] Verify narrator has zero `fetch`/`XMLHttpRequest` calls — verify: grep returns zero matches
- [ ] Verify client build has zero external asset references (except optional Google Font) — verify: grep for `http://`, `https://`, `cdn` returns zero matches
- [ ] Verify client build has zero `localStorage` usage — verify: grep returns zero matches

---

## Wave 2 — WordPress Plugin Wrapper

- [ ] Create `projects/cut/build/wordpress-plugin/cut.php` with standard plugin header and `ABSPATH` guard — verify: `php -l cut.php` returns no errors
- [ ] Add constants `CUT_VERSION`, `CUT_DIR`, `CUT_URL` to `cut.php` — verify: grep confirms all three defined
- [ ] Add activation/deactivation hook stubs to `cut.php` — verify: grep confirms `register_activation_hook` and `register_deactivation_hook` exist
- [ ] Verify `cut.php` has zero external HTTP calls — verify: grep for `wp_remote_get`, `wp_remote_post`, `curl` returns zero matches
- [ ] Create `projects/cut/build/wordpress-plugin/admin/page.php` with textarea and Preview button — verify: `php -l` passes, form has `method="post"`
- [ ] Add `manage_options` capability check to admin page — verify: grep for `current_user_can('manage_options')` returns match
- [ ] Create `projects/cut/build/wordpress-plugin/admin/preview.php` iframe wrapper — verify: `php -l` passes, iframe `src` points to client build
- [ ] Create `projects/cut/build/wordpress-plugin/public/shortcode.php` with `[cut]` handler — verify: `php -l` passes, function `cut_shortcode` exists
- [ ] Verify shortcode output is sanitized (`wp_kses_post`, `esc_html`, `esc_url`) — verify: code review of shortcode.php
- [ ] Create `projects/cut/build/wordpress-plugin/public/block.js` Gutenberg block stub — verify: `node --check` passes (or file exists if no Node)
- [ ] Enqueue client CSS/JS from `cut.php` on admin and public pages — verify: grep for `wp_enqueue_script` and `wp_enqueue_style` returns matches
- [ ] Verify plugin has zero `register_rest_route` calls — verify: grep returns zero matches
- [ ] Verify plugin has zero server-side Remotion/video code — verify: grep for `remotion`, `ffmpeg`, `mp4`, `renderMedia` returns zero matches

---

## Wave 3 — Packaging & Distribution

- [ ] Create `projects/cut/build/readme.txt` with WordPress.org standard headers — verify: headers include `Plugin Name`, `Version`, `Requires at least`, `Requires PHP`, `License`
- [ ] Write readme short description (≤150 chars) — verify: `wc -m` on description line ≤ 150
- [ ] Add Installation, FAQ, and Changelog sections to readme.txt — verify: visual inspection of file
- [ ] Create `projects/cut/build/org-assets/banner-772x250.png` placeholder — verify: `file` command confirms PNG, dimensions 772x250
- [ ] Create `projects/cut/build/org-assets/screenshot-1.png` placeholder — verify: `file` command confirms PNG
- [ ] Create `projects/cut/build/org-assets/icon-256x256.png` placeholder — verify: `file` command confirms PNG, dimensions 256x256
- [ ] Build distribution ZIP `projects/cut/deploy/cut-1.0.0.zip` with exactly expected files — verify: `unzip -l` lists only `cut.php`, `readme.txt`, CSS, JS, HTML, admin/, public/
- [ ] Cross-check plugin header fields match readme.txt fields — verify: `grep` for version and requires in both files, compare

---

## Wave 4 — CI & Automated QA

- [ ] Create `.github/workflows/ci-cut.yml` with PHP lint job — verify: `yamllint` or visual check confirms valid YAML
- [ ] Add JS lint job to CI workflow — verify: workflow contains `node --check` or `eslint` step
- [ ] Add banned-pattern scan job to CI workflow — verify: workflow contains `grep` scan steps
- [ ] Create `projects/cut/tests/test-structure.sh` verifying all expected files exist — verify: `chmod +x` and run, exits 0
- [ ] Create `projects/cut/tests/test-banned-patterns.sh` scanning for banned APIs — verify: `chmod +x` and run, exits 0
- [ ] Create `projects/cut/tests/test-php-syntax.sh` running `php -l` on all PHP files — verify: `chmod +x` and run, exits 0
- [ ] Create `projects/cut/tests/test-js-syntax.sh` running `node --check` on all JS files — verify: `chmod +x` and run, exits 0
- [ ] Run full local test suite — verify: all four shell scripts exit 0
- [ ] Verify CI workflow triggers on push to `main` and on pull requests — verify: grep for `push` and `pull_request` in `ci-cut.yml`

---

## Wave 5 — Final Validation

- [ ] Activate plugin on clean WordPress install — verify: no fatal error, no white screen
- [ ] Open admin page, paste valid changelog, click Preview — verify: animated preview loads in iframe/modal
- [ ] Open admin page as non-admin user — verify: page hidden or 403
- [ ] Create post with `[cut changelog="..."]` shortcode — verify: front-end renders animated changelog
- [ ] Confirm zero external API calls during activation — verify: no network requests in browser DevTools / server logs
- [ ] Confirm no onboarding wizard appears — verify: no modal, no tour, no hotspots after activation
- [ ] Confirm only one onboarding element exists (if any): a single contextual tooltip — verify: grep admin JS for tooltip code, confirm ≤1 instance
- [ ] Run `php -l` on every PHP file in build — verify: all pass
- [ ] Run `node --check` on every JS file in build — verify: all pass
- [ ] Run banned-pattern scan — verify: zero matches for `remotion`, `ffmpeg`, `register_rest_route`, `wp_remote_get`, `localStorage`
- [ ] Tag release `v1.0.0` in Git — verify: `git tag -l v1.0.0` shows tag

---

## Deferred to v2 (Do Not Implement Now)

- [ ] Server-side permalink generation (`server/index.js`)
- [ ] Multi-format parser (GitHub Releases, npm, Keep a Changelog)
- [ ] Template marketplace or theme switcher
- [ ] Customization panels (colors, fonts, speed, voice selection)
- [ ] Enterprise tier / white-label / custom CSS injection
- [ ] Stock music or audio beds
- [ ] API-first architecture
