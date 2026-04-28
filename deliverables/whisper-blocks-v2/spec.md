# Whisper Blocks v2 — Build Spec

## Product Identity
- **SKU:** whisper-blocks-v2
- **Product Name:** Scribe (per locked debate decision)
- **Tagline:** "Your words, finally visible."
- **Type:** WordPress plugin (Gutenberg block + async transcription engine)

---

## 1. Goals (from PRD + Locked Decisions)

1. **Core transcription flow** — User drags/drops an audio file into the Scribe block. The plugin stores the file and queues a transcription job.
2. **Async-first architecture** — WordPress Action Scheduler handles the OpenAI Whisper API call in the background. No synchronous paths that can timeout on shared hosts.
3. **Immediate pending state** — Block renders a "pending" UI instantly while the background job runs.
4. **Permanent transcript caching** — Completed transcripts are stored in `post_meta` and never re-fetched (no re-burning API credits).
5. **Minimal admin surface** — Exactly one settings field (OpenAI API key stored in `wp_options`) plus an honest status panel showing job state and errors.
6. **Zero custom build tooling** — `@wordpress/scripts` only. No custom `webpack.config.js`, no Babel configs, no build-tool cargo-culting.
7. **WordPress.org readiness** — `readme.txt` is the source of truth. `README.md` is a minimal stub. Plugin follows WP directory standards (headers, sanitization, i18n hooks where practical).
8. **Graceful error handling** — 25MB file guardrails, rate-limit awareness, invalid-key detection, oversized-file messaging. No silent failures.

---

## 2. Implementation Approach

### 2.1 Architecture (Locked Decisions)
- **Async engine:** WordPress Action Scheduler. REST endpoint returns immediately with a job ID; the scheduler action calls OpenAI Whisper.
- **Caching layer:** `post_meta` read/write via a dedicated transcript class. Manual cleanup toggle in settings.
- **API client:** Standalone PHP class wrapping `wp_remote_post()` to OpenAI `/v1/audio/transcriptions`. Enforces 25MB file-size guard before upload.
- **Settings:** One option field (`scribe_openai_api_key`). Settings page built with native WP Settings API.
- **Block build:** `@wordpress/scripts` handles transpilation and block asset generation. Block manifest (`block.json`) is the schema source.

### 2.2 File Map (~15 files, ≥12 source files per PRD, ~8 load-bearing per debate)

All paths are relative to `deliverables/whisper-blocks-v2/`.

| # | File | Purpose |
|---|------|---------|
| 1 | `whisper-blocks-v2.php` | Plugin header + bootstrap. Registers block type, loads includes, hooks init. |
| 2 | `package.json` | Dependencies: `@wordpress/scripts`, `@wordpress/blocks`, `@wordpress/block-editor`. Scripts: `build`, `start`, `lint:js`, `lint:css`. |
| 3 | `readme.txt` | WordPress.org source of truth: description, installation, changelog, stable tag. |
| 4 | `README.md` | GitHub stub (≤10 lines) linking to readme.txt. |
| 5 | `.gitignore` | Ignores `node_modules/`, `build/`, `vendor/`, `.env`, OS files. |
| 6 | `src/block.json` | Gutenberg block manifest (apiVersion 3). Declares name, title, icon, category, attributes (`audioId`, `transcript`, `jobStatus`), supports, editorScript, style, editorStyle. |
| 7 | `src/index.js` | Block registration entry. Imports `block.json` metadata and passes `edit`/`save` to `registerBlockType`. |
| 8 | `src/edit.js` | Editor UI: MediaUpload dropzone, "Transcribe" button, pending spinner, transcript preview once cached. Polls post meta for job completion. |
| 9 | `src/save.js` | Frontend markup: `<audio>` player + timestamped transcript HTML. Reads from serialized attributes / post_meta. |
| 10 | `src/style.scss` | Frontend transcript styles: timestamps, paragraph spacing, mobile-safe max-widths. |
| 11 | `src/editor.scss` | Editor-only styles: dropzone borders, pending-state overlay, constrained preview width. |
| 12 | `includes/class-whisper-admin.php` | Settings page: API key field, status panel (last job state, error log tail), manual cache cleanup button. |
| 13 | `includes/class-whisper-api.php` | OpenAI Whisper client: `transcribe_file($attachment_id)`, 25MB guard, `wp_remote_post` with bearer token, response normalization to `{ transcript, segments[] }`. |
| 14 | `includes/class-whisper-scheduler.php` | Action Scheduler wrapper: `queue_job($attachment_id, $post_id)`, `process_job($job_id)`, lifecycle hooks (`pending`, `processing`, `completed`, `failed`). |
| 15 | `includes/class-whisper-transcript.php` | `post_meta` read/write: `save($post_id, $data)`, `get($post_id)`, `clear($post_id)`. Key: `_scribe_transcript_v1`. |

### 2.3 Build & Quality Bar
- `npm run build` must exit 0 and produce `build/` containing `index.js`, `index.css`, `style-index.css`, and `block.json`.
- `php -l` must pass for every `.php` file.
- No hardcoded OpenAI keys anywhere in source.
- No `webpack.config.js`, `babel.config.js`, or custom build config.
- No Bull, no Redis, no custom queue infrastructure.
- All REST inputs sanitized (`sanitize_text_field`, `absint`, `wp_kses_post` where applicable).

---

## 3. Verification Criteria

| Criterion | How to Prove |
|-----------|--------------|
| ≥12 source files exist | `find deliverables/whisper-blocks-v2 -type f | wc -l` returns ≥15 (including configs/docs). |
| Plugin header valid | `grep -q "Plugin Name:" whisper-blocks-v2.php` passes. |
| PHP syntax clean | Loop `php -l` over all `*.php`; every file exits 0. |
| Block manifest valid | `jq empty src/block.json` passes; fields `apiVersion`, `name`, `title`, `attributes` are non-null. |
| `npm run build` succeeds | `cd deliverables/whisper-blocks-v2 && npm run build` exits 0 and creates `build/index.js`, `build/block.json`. |
| No custom webpack | `test ! -f webpack.config.js && test ! -f babel.config.js` passes. |
| No banned dependencies | `package.json` does not contain strings `bull`, `redis`, `custom-webpack`. |
| No hardcoded API keys | `grep -ri "sk-[a-z0-9]" src/ includes/ *.php` returns nothing. |
| `readme.txt` WP-compliant | Contains `=== Scribe ===`, `Stable tag:`, `Requires at least:`, `Tested up to:`. |
| Settings page registers | `grep -q "add_options_page" includes/class-whisper-admin.php` passes. |
| Scheduler hooks present | `grep -q "as_schedule_single_action" includes/class-whisper-scheduler.php` passes. |
| API client guards present | `grep -q "25MB\|25 MB\|filesize" includes/class-whisper-api.php` passes. |
| Transcript cache uses post_meta | `grep -q "update_post_meta\|get_post_meta" includes/class-whisper-transcript.php` passes. |
| Editor uses dropzone | `grep -q "MediaUpload\|DropZone\|onSelect" src/edit.js` passes. |
| Frontend renders audio + transcript | `grep -q "<audio\|transcript\|segments" src/save.js` passes. |
| .gitignore covers build artifacts | `grep -q "node_modules\|build/\|vendor/" .gitignore` passes. |

---

## 4. Files to Create or Modify

### New files (15)
1. `deliverables/whisper-blocks-v2/whisper-blocks-v2.php`
2. `deliverables/whisper-blocks-v2/package.json`
3. `deliverables/whisper-blocks-v2/readme.txt`
4. `deliverables/whisper-blocks-v2/README.md`
5. `deliverables/whisper-blocks-v2/.gitignore`
6. `deliverables/whisper-blocks-v2/src/block.json`
7. `deliverables/whisper-blocks-v2/src/index.js`
8. `deliverables/whisper-blocks-v2/src/edit.js`
9. `deliverables/whisper-blocks-v2/src/save.js`
10. `deliverables/whisper-blocks-v2/src/style.scss`
11. `deliverables/whisper-blocks-v2/src/editor.scss`
12. `deliverables/whisper-blocks-v2/includes/class-whisper-admin.php`
13. `deliverables/whisper-blocks-v2/includes/class-whisper-api.php`
14. `deliverables/whisper-blocks-v2/includes/class-whisper-scheduler.php`
15. `deliverables/whisper-blocks-v2/includes/class-whisper-transcript.php`

### Modified files
- None. This is a greenfield plugin deliverable.

### Test / validation files (5 scripts, created as part of this spec)
1. `deliverables/whisper-blocks-v2/tests/check-file-existence.sh`
2. `deliverables/whisper-blocks-v2/tests/check-php-syntax.sh`
3. `deliverables/whisper-blocks-v2/tests/check-banned-patterns.sh`
4. `deliverables/whisper-blocks-v2/tests/check-block-manifest.sh`
5. `deliverables/whisper-blocks-v2/tests/check-build-output.sh`

---

## 5. Constraints & Non-Negotiables

- All source lives under `deliverables/whisper-blocks-v2/`.
- `@wordpress/scripts` is the only build tool. If it doesn't ship with it, we don't ship it.
- OpenAI API key lives in `wp_options` only; never hardcoded, never committed.
- Async-only Whisper calls. No synchronous REST path that hits OpenAI.
- Transcripts cache permanently in `post_meta`.
- No Jest or PHPUnit tests for v1 (cut per locked debate decision #7).
- No URL-based audio input for v1 — drag-and-drop / media library only.
- No export buttons, no speaker diarization, no chunked >25MB upload for v1.
