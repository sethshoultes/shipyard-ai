# Whisper — Build Specification

> Issue: sethshoultes/shipyard-ai#88
> PRD: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-88.md`
> Decisions: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-88/decisions.md`
> Plan template: `/home/agent/shipyard-ai/.planning/phase-1-plan.md` (structural patterns applied; content diverges because the referenced plan covers the unrelated Pulse/Kimi smoke-test project)

---

## 1. Goals (from PRD)

Build **Whisper** — a WordPress Gutenberg block that accepts audio/video files and renders beautiful, synchronized transcripts with timestamps and highlight-on-hover playback.

### Primary user outcomes
1. Drag an audio file into the block → receive a transcript in seconds.
2. Click any word in the transcript → the HTML5 audio playhead jumps to that exact moment.
3. Export the transcript as a single, portable format (SRT).
4. Experience magazine-grade typography and warm spacing on both frontend and editor.

### Target users
- Podcasters, course creators, and journalists running WordPress.

### Distribution
- WordPress.org plugin directory, podcaster communities, journalism tools lists.

---

## 2. Implementation Approach

Organized in five waves. Each wave contains atomic tasks (completable in < 5 minutes) with explicit verification steps. No implementation code is written until this spec, todo, and test suite are approved.

### Architecture (locked in debate)
- **Platform:** Stand-alone WordPress plugin (not Emdash).
- **Backend:** PHP proxy directly to OpenAI Whisper API. No Cloudflare Worker.
- **Frontend:** Gutenberg block (block.json + React editor components + frontend JS).
- **Storage:** `post_meta` JSON blob for transcript data + metadata.
- **Async:** WP Cron queue with job IDs and polling. No progressive streaming for v1.
- **Build:** `@wordpress/scripts` (standard WordPress block build pipeline).

### Wave 1 — Plugin Scaffold & PHP Backend
Create the plugin foundation, register the block, and build all PHP classes before touching JavaScript.

| Task | Output |
|------|--------|
| 1.1 | `projects/whisper/build/whisper/whisper.php` — main plugin file with header, block registration, cron hooks |
| 1.2 | `projects/whisper/build/whisper/block.json` — Gutenberg block manifest |
| 1.3 | `projects/whisper/build/whisper/includes/class-whisper-api.php` — OpenAI Whisper proxy (upload, forward, error mapping) |
| 1.4 | `projects/whisper/build/whisper/includes/class-job-queue.php` — WP Cron registration, job state machine, exponential backoff |
| 1.5 | `projects/whisper/build/whisper/includes/class-storage.php` — `post_meta` read/write, JSON encode/decode, pruning |
| 1.6 | `projects/whisper/build/whisper/includes/class-settings.php` — single admin page with API key field only |
| 1.7 | `projects/whisper/build/whisper/readme.txt` — WordPress.org readme |

### Wave 2 — Build System & Editor Block
Set up `@wordpress/scripts`, implement the editor UI, and verify the build pipeline.

| Task | Output |
|------|--------|
| 2.1 | `projects/whisper/build/whisper/package.json` — `@wordpress/scripts` dependency, build scripts |
| 2.2 | `projects/whisper/build/whisper/src/edit.js` — block editor entry point |
| 2.3 | `projects/whisper/build/whisper/src/components/AudioDropZone.js` — drag-and-drop handler (MP3, M4A, WAV) |
| 2.4 | `projects/whisper/build/whisper/src/components/JobStatus.js` — async polling UI (skeleton/zen progress) |
| 2.5 | `projects/whisper/build/whisper/src/components/Transcript.js` — word-level transcript renderer |
| 2.6 | `projects/whisper/build/whisper/src/components/Word.js` — individual clickable word + timestamp |
| 2.7 | `projects/whisper/build/whisper/src/save.js` — server-side render / static fallback |
| 2.8 | `projects/whisper/build/whisper/src/editor.scss` — editor chrome styles only |
| 2.9 | Run `npm run build` → produce `build/block.js`, `build/block.css` |

### Wave 3 — Frontend & Typography
Implement the public-facing transcript experience and premium default typography.

| Task | Output |
|------|--------|
| 3.1 | `projects/whisper/build/whisper/src/frontend.js` — HTML5 audio seek on word click, small negative offset buffer for drift |
| 3.2 | `projects/whisper/build/whisper/src/style.scss` — magazine-grade system-font typography, generous line-height, warm spacing |
| 3.3 | `projects/whisper/build/whisper/assets/css/frontend.css` — compiled from `src/style.scss` (or let wp-scripts emit it) |
| 3.4 | Add SRT export button to frontend transcript UI |
| 3.5 | Re-run build, verify `build/frontend.js` and `build/block.css` exist |

### Wave 4 — Integration, Security & Polish
Wire everything together, enforce WordPress security standards, and handle edge cases.

| Task | Output |
|------|--------|
| 4.1 | Wire PHP class autoloading / inclusion in `whisper.php` |
| 4.2 | Enforce 50 MB file-size guard (client-side + server-side) |
| 4.3 | Add nonce validation & `manage_options` capability checks on settings page |
| 4.4 | Add nonce validation & `edit_posts` capability checks on REST/media endpoints |
| 4.5 | Implement weekly cleanup cron (prune old job artifacts from `post_meta`) |
| 4.6 | Add sentence-level fallback render if word-level array is corrupt |
| 4.7 | i18n: wrap all user-visible strings with `__()` / `_e()`; create `languages/` stub |
| 4.8 | Final `npm run build` and `npm run lint:css` / `npm run lint:js` if available |

### Wave 5 — QA & Verification
Run the test suite in `deliverables/github-issue-sethshoultes-shipyard-ai-88/tests/`. All scripts must exit 0.

---

## 3. Verification Criteria

### 3.1 File existence & structure
- Every file listed in §4 exists at the exact relative path.
- No extra files beyond the inventory (scope guard against over-engineering).

### 3.2 PHP syntax
- All `.php` files pass `php -l` with zero errors.

### 3.3 block.json validity
- Valid JSON.
- Contains required fields: `name`, `title`, `category`, `editorScript`, `editorStyle`, `style`.
- Block name uses `whisper/` prefix.

### 3.4 Banned patterns (must be absent)
- No hardcoded API keys in any committed file.
- No references to Cloudflare Worker (cut per decisions).
- No references to speaker diarization / pyannote / AssemblyAI (cut per decisions).
- No "AI-powered" badges, footnotes, or logos (cut per decisions).
- No VTT or HTML export functions (only SRT ships in v1).
- No watermark or freemium gating logic.
- No setup wizard or multi-step onboarding.

### 3.5 Security patterns (must be present)
- Settings form uses `wp_nonce_field()` and `check_admin_referer()`.
- REST/AJAX handlers verify `current_user_can('edit_posts')`.
- Output escaped with `esc_html()`, `esc_attr()`, `wp_kses_post()` where applicable.
- File upload uses WordPress `wp_handle_upload()` or `wp_upload_bits()` with MIME-type whitelist.

### 3.6 Build output
- `npm run build` exits 0.
- `build/block.js`, `build/block.css`, `build/frontend.js` exist and are non-empty.
- No `console.log` statements remain in compiled `build/frontend.js` or `build/block.js`.

### 3.7 Functional correctness
- `whisper.php` activates without fatal errors in a WordPress environment.
- Block appears in the Gutenberg inserter under the designated category.
- Settings page appears under `Settings > Whisper` with exactly one API key field.
- API proxy class contains a method that calls `wp_remote_post()` to `api.openai.com`.
- Job queue class registers a WP Cron hook and defines a job state machine (pending → processing → complete → failed).
- Storage class has `save()`, `get()`, and `prune()` methods.
- SRT generation function exists and outputs standard SRT format (1-based index, HH:MM:SS,mmm timing).
- Frontend JS contains event listener binding words to `audio.currentTime` seeks.

### 3.8 Performance & constraints
- Plugin zip (excluding `node_modules/`) is < 500 KB.
- Build completes in < 30 seconds on modest hardware.
- No external runtime dependencies beyond WordPress core and OpenAI API.

---

## 4. File Inventory

### Created files

| # | Path | Purpose |
|---|------|---------|
| 1 | `projects/whisper/build/whisper/whisper.php` | Main plugin file: headers, block registration, class loading, cron hooks |
| 2 | `projects/whisper/build/whisper/block.json` | Gutenberg block manifest |
| 3 | `projects/whisper/build/whisper/readme.txt` | WordPress.org plugin directory readme |
| 4 | `projects/whisper/build/whisper/includes/class-whisper-api.php` | OpenAI Whisper API proxy |
| 5 | `projects/whisper/build/whisper/includes/class-job-queue.php` | WP Cron async job queue |
| 6 | `projects/whisper/build/whisper/includes/class-storage.php` | post_meta JSON storage + pruning |
| 7 | `projects/whisper/build/whisper/includes/class-settings.php` | Minimal admin settings page |
| 8 | `projects/whisper/build/whisper/src/edit.js` | Block editor entry |
| 9 | `projects/whisper/build/whisper/src/save.js` | Static save / server render helper |
| 10 | `projects/whisper/build/whisper/src/frontend.js` | Frontend audio seek logic |
| 11 | `projects/whisper/build/whisper/src/style.scss` | Frontend typography & layout |
| 12 | `projects/whisper/build/whisper/src/editor.scss` | Editor-only chrome styles |
| 13 | `projects/whisper/build/whisper/src/components/AudioDropZone.js` | Drag-and-drop audio upload |
| 14 | `projects/whisper/build/whisper/src/components/JobStatus.js` | Async progress / skeleton UI |
| 15 | `projects/whisper/build/whisper/src/components/Transcript.js` | Transcript container |
| 16 | `projects/whisper/build/whisper/src/components/Word.js` | Clickable word with timestamp |
| 17 | `projects/whisper/build/whisper/package.json` | npm manifest, wp-scripts |
| 18 | `projects/whisper/build/whisper/.gitignore` | Exclude node_modules, build artifacts from git if desired |
| 19 | `projects/whisper/build/whisper/languages/` | i18n stub directory |
| 20 | `projects/whisper/build/whisper/build/block.js` | Compiled editor bundle (generated) |
| 21 | `projects/whisper/build/whisper/build/block.css` | Compiled editor styles (generated) |
| 22 | `projects/whisper/build/whisper/build/frontend.js` | Compiled frontend bundle (generated) |

### Modified files

None — this is a green-field plugin build. No existing repo files are altered.

---

## 5. Open Questions to Resolve During Build

1. **Seek offset buffer** — Apply a -50 ms to -100 ms offset when seeking word timestamps to account for HTML5 MediaElement drift across browsers.
2. **File-size ceiling** — Cap uploads at 50 MB in v1 (shared-hosting safe). Reject client-side before server upload.
3. **Cleanup retention** — Prune job artifacts older than 30 days; keep transcript JSON indefinitely unless post is deleted.
4. **Rate-limit backoff** — Exponential backoff starting at 5 s, max 60 s, dead-letter after 5 retries.
5. **Settings location** — Single field lives at `Settings > Whisper`. Accept `WHISPER_API_KEY` constant in `wp-config.php` to hide UI entirely.

---

## 6. Success Criteria (Launch Gate)

- [ ] All files in §4 exist.
- [ ] All tests in `tests/` exit 0.
- [ ] `npm run build` exits 0 and outputs three build files.
- [ ] PHP lint passes on all `.php` files.
- [ ] No banned patterns found.
- [ ] Security patterns verified (nonces, capabilities, escaping).
- [ ] Plugin activates cleanly in WordPress.
