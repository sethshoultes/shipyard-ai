# Stage — Running To-Do
## Project: github-issue-sethshoultes-shipyard-ai-77

---

## Wave 1 — Plugin Shell

- [ ] Create directory structure `stage/`, `stage/includes/`, `stage/templates/`, `stage/assets/css/` — verify: `ls -R stage/` shows all directories
- [ ] Write `stage/stage.php` plugin header, ABSPATH guard, and constants (`STAGE_VERSION`, `STAGE_DIR`, `STAGE_URL`) — verify: `php -l stage/stage.php` exits 0
- [ ] Add activation hook with `flush_rewrite_rules()` and deactivation hook — verify: grep `stage.php` for `register_activation_hook` and `register_deactivation_hook`
- [ ] Add `stage/includes/post-type.php` and register CPT `stage_showcase` with rewrite slug `stage` — verify: `php -l` passes and grep finds `register_post_type( 'stage_showcase'`
- [ ] Include `post-type.php` from `stage.php` via `require_once` — verify: `php -l stage/stage.php` exits 0

## Wave 2 — Admin & API

- [ ] Add `stage/includes/settings.php` with `add_options_page('Stage', ...)` under Settings menu — verify: grep finds `add_options_page` and `current_user_can('manage_options')`
- [ ] Add settings form with plugin slug input field and `sanitize_text_field` save handler — verify: grep finds `sanitize_text_field` and `update_option`
- [ ] Include `settings.php` from `stage.php` — verify: `php -l stage/stage.php` exits 0
- [ ] Add `stage/includes/api.php` with `stage_fetch_plugin_data($slug)` using `wp_remote_get` to `api.wordpress.org` — verify: `php -l` passes and grep finds `api.wordpress.org`
- [ ] Wrap API call in `get_transient` / `set_transient` with `DAY_IN_SECONDS` expiry — verify: grep finds `get_transient`, `set_transient`, and `DAY_IN_SECONDS`
- [ ] Include `api.php` from `stage.php` — verify: `php -l stage/stage.php` exits 0

## Wave 3 — Frontend Template

- [ ] Add `stage/includes/template.php` with `template_include` filter for `stage_showcase` CPT — verify: grep finds `template_include` and `is_singular( 'stage_showcase'`
- [ ] Add OpenGraph meta tags via `wp_head` hook in `template.php` — verify: grep finds `og:title`, `og:description`, `og:url`
- [ ] Include `template.php` from `stage.php` — verify: `php -l stage/stage.php` exits 0
- [ ] Create `stage/templates/showcase.php` with HTML5 document wrapper and hero section — verify: file exists and contains `.stage-hero`
- [x] Add plugin metadata display block (name, author, version, description) to showcase template — verify: grep finds metadata fields or PHP echo tags
- [ ] Add "Install on my site" deep link to `wordpress.org/plugins/{slug}` with `target="_blank"` — verify: grep finds `wordpress.org/plugins` and `target="_blank"`

## Wave 4 — Styling

- [ ] Create `stage/assets/css/stage.css` with CSS custom properties (`--stage-bg`, `--stage-text`, etc.) — verify: file exists and grep finds `--stage-`
- [ ] Add base typography and whitespace rules — verify: grep finds `font-family`, `line-height`, `margin`
- [ ] Add hero section styles with subtle gradient spotlight — verify: grep finds `background` and `radial-gradient` or `linear-gradient`
- [ ] Add CSS-only transitions (hover states, focus states) — verify: grep finds `transition:` at least 3 times
- [ ] Add dark/light mode via `@media (prefers-color-scheme: dark)` — verify: grep finds `@media (prefers-color-scheme: dark)`
- [ ] Verify no admin blue or beige colors in CSS — verify: `grep -iE '#0073aa|beige' stage/assets/css/stage.css` returns nothing

## Wave 5 — Distribution & QA

- [ ] Write `stage/readme.txt` with WordPress.org standard headers, Description, Installation, FAQ, Changelog — verify: grep finds `== Description ==`, `== Installation ==`, `== Changelog ==`
- [ ] Ensure `readme.txt` version and requirements match `stage.php` header — verify: compare version strings manually or with grep
- [ ] Run `php -l` on all PHP files — verify: `./deliverables/github-issue-sethshoultes-shipyard-ai-77/tests/test-syntax.sh` exits 0
- [ ] Run banned pattern checks (no JS anim libs, no external HTTP in activation, no REST routes) — verify: `./deliverables/github-issue-sethshoultes-shipyard-ai-77/tests/test-patterns.sh` exits 0
- [ ] Run file structure and size audit (PHP ≤ 500 lines, CSS ≤ 200 lines) — verify: `./deliverables/github-issue-sethshoultes-shipyard-ai-77/tests/test-structure.sh` exits 0
- [ ] Final manual review: confirm zero onboarding wizard, zero template picker, zero "powered by" badges — verify: grep for `wizard|onboarding|template_picker|powered by` across `stage/` returns 0 matches
