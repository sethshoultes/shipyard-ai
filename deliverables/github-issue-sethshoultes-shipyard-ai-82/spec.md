# Spec — Cut (Changelog Theatre)

> Issue: sethshoultes/shipyard-ai#82
> PRD: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-82.md`
> Decisions: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-82/decisions.md`

---

## 1. Goals

1. **Transform static changelogs into cinematic experiences.** Convert a WordPress `readme.txt` changelog section into a self-contained, animated HTML page with curated typography, restrained motion, and calm Web Speech API narration.
2. **Ship a thin WordPress plugin.** The plugin provides an admin page (paste → preview → publish) and a front-end shortcode/block to embed the animated changelog.
3. **Zero server-side rendering cost.** All rendering happens in the browser via CSS/Canvas animations and the Web Speech API. No Lambda, no ffmpeg, no Remotion runtime inside WordPress.
4. **One-session build discipline.** The parser, the renderer, and the WP enqueue are non-negotiable. Everything else is optional. Kill-switch: any feature exceeding 20 minutes is cut.
5. **Dignity and taste as default.** No template switcher, no customization panel, no forty-seven toggles. The output must evoke pride, not decoration.

---

## 2. Implementation Approach

### 2.1 Architecture

Two-layer architecture per locked Decision #9:

- **Portable client core** (`cut/client/`) — platform-agnostic renderer that works anywhere. Accepts strict-format changelog text, produces animated HTML.
- **WordPress plugin wrapper** (`cut/wordpress-plugin/`) — thin PHP that enqueues the client build, provides an admin UI for paste/preview/publish, and exposes a shortcode/block.
- **Server** (`cut/server/`) — stretch goal only. If time permits, a lightweight static-export or permalink endpoint. Otherwise, local embed only.

### 2.2 Client-Side Engine (`cut/client/`)

| File | Responsibility |
|------|----------------|
| `index.html` | Standalone hosted entry point. Loads `src/` assets and bootstraps the renderer. |
| `src/parser.js` | Strict parser for WordPress `readme.txt` changelog format. Input: raw text. Output: structured array of `{version, date, bullets}`. Rejects malformed input with a dignified error message. |
| `src/renderer.js` | Animation engine. Hybrid DOM/CSS for typography/layout; Canvas only if a specific cinematic effect demands it. Targets 60 fps on mid-range hardware. |
| `src/narrator.js` | Web Speech API wrapper. Curates a ranked voice preference list, handles calm pacing, respects browser auto-play policies (triggers on user click). TTS is optional and off-by-default if voice quality is poor. |
| `src/sequence.js` | The curated cinematic timeline. Orchestrates which version appears when, how transitions behave, and where narration cues fire. |
| `src/typography.css` | One typeface, one scale, editorial hierarchy. No external font dependencies (system font stack or a single Google Font loaded by the plugin). |
| `src/motion.css` | Restrained transitions: gentle slides, confident fades. No bounce, no wobble. |

**Parser strictness:** Locked to standard WordPress changelog convention:
- `== Changelog ==` section header
- `= 1.0 =` version lines
- Bullet points under each version
- Graceful error: *"Your changelog does not match the expected format. Here is an example."*

**Renderer constraints:**
- No external image or audio assets.
- Inline or internal CSS only.
- Vanilla JavaScript, no build step required for v1.

### 2.3 WordPress Plugin (`cut/wordpress-plugin/`)

| File | Responsibility |
|------|----------------|
| `cut.php` | Main plugin file. Standard WordPress header, `ABSPATH` guard, constants (`CUT_VERSION`, `CUT_DIR`, `CUT_URL`), activation/deactivation hooks (stubs only — no external API calls). Enqueues client assets on admin and public pages. |
| `admin/page.php` | Admin page under Tools or a top-level menu. Form with textarea (paste changelog), Preview button, Publish button. Capability check: `manage_options`. |
| `admin/preview.php` | iframe/modal wrapper that loads `client/index.html` with the pasted changelog injected via `window.postMessage` or query parameter. |
| `public/shortcode.php` | Shortcode handler `[cut changelog="..."]` or `[cut id="..."]`. Renders the animated changelog on any post/page. |
| `public/block.js` | Minimal Gutenberg block registration (client-side only). Wraps the same output as the shortcode. |

**Plugin constraints:**
- PHP 7.4+ compatible syntax.
- No REST API routes (`register_rest_route` is banned per decisions).
- No external HTTP calls during activation.
- All output sanitized with `wp_kses_post`, `esc_html`, `esc_url`.

### 2.4 Server (`cut/server/` — Stretch)

| File | Responsibility |
|------|----------------|
| `index.js` | Lightweight static host or Express endpoint. Accepts POST with changelog text, returns a hosted permalink to the rendered page. |
| `routes/render.js` | Static export logic: writes a self-contained HTML file (inlines all JS/CSS) to a permalink directory. |

**Decision:** If session time runs short, skip the server entirely. The client build works standalone via `file://` or any static host (GitHub Pages, Netlify, Cloudflare Pages). The WordPress plugin can generate a local preview and a shortcode embed without a backend.

### 2.5 Build Order

1. **Sequence first.** Build the first 5 seconds of `sequence.js` + `renderer.js` + `motion.css` + `typography.css` before anything else. If it does not evoke pride, redesign before adding features.
2. **Parser second.** Once the visual gasp is confirmed, add `parser.js` to feed real changelog data into the sequence.
3. **Narrator third.** Add `narrator.js` as a bonus track. If browser TTS is cringe, ship with voice off and iterate post-session.
4. **WordPress wrapper fourth.** Build `cut.php`, `admin/page.php`, and `public/shortcode.php` to wrap the working client build.
5. **Block + packaging fifth.** If time permits, add `block.js` and package a ZIP for `.org` submission.

---

## 3. Verification Criteria

### 3.1 Client Engine

| # | Criterion | How to Verify |
|---|-----------|-------------|
| C1 | `parser.js` accepts strict WordPress changelog format | Unit test: paste a valid `readme.txt` changelog → output array with correct versions and bullets. Paste malformed text → dignified error message. |
| C2 | `parser.js` rejects non-standard formats | Unit test: feed GitHub Releases format, npm format, Keep a Changelog format → all rejected with error. |
| C3 | `renderer.js` produces 60 fps animation | Browser DevTools Performance panel: record animation timeline, confirm no dropped frames on mid-range hardware. |
| C4 | `sequence.js` evokes pride in first 5 seconds | Manual review: load `client/index.html` with sample data. If it feels like a PowerPoint, fail. |
| C5 | `narrator.js` uses Web Speech API only | Grep `narrator.js` for `speechSynthesis` and `SpeechSynthesisUtterance`. Confirm zero `fetch`/`XMLHttpRequest` for audio files. |
| C6 | Zero external assets in client build | Grep `client/` for `http://`, `https://`, `cdn`, `.mp3`, `.wav`. Confirm zero matches except optional single Google Font load. |
| C7 | Client build is self-contained | Open `client/index.html` directly in browser with no server. Confirm animation and parser work. |

### 3.2 WordPress Plugin

| # | Criterion | How to Verify |
|---|-----------|-------------|
| W1 | All PHP files parse without errors | `php -l` on every `.php` file in `wordpress-plugin/`. |
| W2 | Plugin activates without fatal errors | Activate on clean WordPress install. Confirm no white screen. |
| W3 | Zero external API calls at activation | Grep all PHP files for `wp_remote_get`, `wp_remote_post`, `curl`, `file_get_contents` to external domains. Confirm zero matches. |
| W4 | Admin page respects capabilities | Load admin page as Administrator → visible. Load as Editor → 403 or hidden menu. |
| W5 | Shortcode renders on front-end | Create post with `[cut changelog="..."]` (valid format). Confirm animated changelog renders. |
| W6 | All output is sanitized | Code review: confirm `wp_kses_post`, `esc_html`, `esc_attr`, `esc_url` used on all dynamic output. |
| W7 | No REST API routes registered | Grep for `register_rest_route`. Confirm zero matches. |
| W8 | No server-side Remotion or video generation | Grep for `remotion`, `ffmpeg`, `mp4`, `renderMedia`, `renderStill`. Confirm zero matches. |

### 3.3 Integration & Packaging

| # | Criterion | How to Verify |
|---|-----------|-------------|
| I1 | Plugin header matches readme.txt | Cross-check `Plugin Name`, `Version`, `Requires at least`, `Requires PHP`, `License` between `cut.php` and `readme.txt`. |
| I2 | ZIP contains only expected files | `unzip -l` on release ZIP. Confirm no build tools, no `node_modules`, no source maps. |
| I3 | readme.txt passes .org standards | Visual inspection: standard headers, short description ≤150 chars, installation steps, FAQ, changelog. |
| I4 | Zero `localStorage` usage | Grep JS files for `localStorage`. Confirm zero matches (per decision: no localStorage). |
| I5 | No build step required | Confirm absence of `package.json`, `webpack.config.js`, `vite.config.js`, `gulpfile.js`. |

---

## 4. Files to Create or Modify

### 4.1 New Files (Client)

| Path | Purpose |
|------|---------|
| `projects/cut/build/client/index.html` | Standalone entry point |
| `projects/cut/build/client/src/parser.js` | Changelog parser |
| `projects/cut/build/client/src/renderer.js` | Animation engine |
| `projects/cut/build/client/src/narrator.js` | Web Speech API wrapper |
| `projects/cut/build/client/src/sequence.js` | Cinematic timeline |
| `projects/cut/build/client/src/typography.css` | Type scale & hierarchy |
| `projects/cut/build/client/src/motion.css` | Restrained transitions |

### 4.2 New Files (WordPress Plugin)

| Path | Purpose |
|------|---------|
| `projects/cut/build/wordpress-plugin/cut.php` | Main plugin file |
| `projects/cut/build/wordpress-plugin/admin/page.php` | Admin paste/preview/publish page |
| `projects/cut/build/wordpress-plugin/admin/preview.php` | iframe/modal preview wrapper |
| `projects/cut/build/wordpress-plugin/public/shortcode.php` | Front-end shortcode handler |
| `projects/cut/build/wordpress-plugin/public/block.js` | Gutenberg block registration |

### 4.3 New Files (Server — Stretch)

| Path | Purpose |
|------|---------|
| `projects/cut/build/server/index.js` | Static host / Express entry (optional) |
| `projects/cut/build/server/routes/render.js` | Permalink generation route (optional) |

### 4.4 New Files (Distribution & Docs)

| Path | Purpose |
|------|---------|
| `projects/cut/build/readme.txt` | WordPress.org submission readme |
| `projects/cut/build/org-assets/banner-772x250.png` | Plugin banner placeholder |
| `projects/cut/build/org-assets/screenshot-1.png` | Admin UI screenshot placeholder |
| `projects/cut/build/org-assets/icon-256x256.png` | Plugin icon placeholder |
| `projects/cut/deploy/cut-1.0.0.zip` | Distribution ZIP |

### 4.5 New Files (CI / Tests)

| Path | Purpose |
|------|---------|
| `.github/workflows/ci-cut.yml` | GitHub Actions: PHP lint, JS lint, banned-pattern scan |
| `projects/cut/tests/test-parser.js` | Node-based parser unit tests |
| `projects/cut/tests/test-structure.sh` | File existence and structure verification |
| `projects/cut/tests/test-banned-patterns.sh` | Grep scan for banned APIs and patterns |
| `projects/cut/tests/test-php-syntax.sh` | `php -l` on all PHP files |
| `projects/cut/tests/test-js-syntax.sh` | `node --check` on all JS files |

### 4.6 No Existing Files Modified

This is a greenfield build. No existing repository files are modified.

---

## 5. Kill-Switch Checklist

If any of the following take longer than 20 minutes, cut them immediately:

- [ ] Server/`index.js` permalink generation
- [ ] Gutenberg `block.js` registration
- [ ] Web Speech API voice ranking / fallback tuning
- [ ] Canvas-specific visual effects
- [ ] `org-assets/` final design (placeholders are acceptable)

The non-negotiables that must ship:

- [ ] `parser.js` working with strict format
- [ ] `renderer.js` + `sequence.js` + CSS producing animated output
- [ ] `cut.php` enqueueing client assets
- [ ] `admin/page.php` with textarea and preview
- [ ] `public/shortcode.php` rendering on front-end

---

## 6. Success Criteria (Aligned with PRD)

- [ ] A WordPress plugin developer can paste their `readme.txt` changelog into the admin page and see a polished, animated preview.
- [ ] The preview plays in the browser with no server-side video generation.
- [ ] The developer can publish the animated changelog to any post/page via shortcode.
- [ ] The output evokes pride, not decoration — dignity, restraint, and taste are visible in typography and motion.
- [ ] All tests pass (PHP lint, JS lint, banned-pattern scan, parser unit tests).
- [ ] No external API calls during plugin activation.
- [ ] No server-side Remotion, ffmpeg, or MP4 generation code exists in the repository.
