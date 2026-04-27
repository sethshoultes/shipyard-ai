# Spec — Scribe (GitHub Issue #88)

## Goals

Build **Scribe**, a WordPress Gutenberg block that turns audio into beautiful, permanent transcripts.

### From the PRD
- Drag-and-drop audio upload (MP3, M4A, WAV) directly in the block editor.
- AI-powered transcription via OpenAI Whisper API.
- Synchronized, clickable transcript: click a sentence (or word) and the audio playhead jumps to that exact moment.
- Export transcript as styled HTML (SRT/VTT deferred pending product decision).
- Gorgeous, magazine-grade typography on the frontend; native Gutenberg chrome in the editor.
- Target users: podcasters, course creators, journalists.

### From Debate Decisions
- **Product name:** Scribe (slug may carry descriptor for .org search).
- **No config before value:** First 30 seconds must be drag → drop → transcript. No setup wizard.
- **No watermark:** Free tier is capped at 60 minutes/month in licensing logic; the canvas stays clean.
- **Minimal settings:** One API key field under Settings > Scribe. Key can also be set via `wp-config.php` constant (`SCRIBE_API_KEY`).
- **Async by default:** Long files are processed via WP Cron queue to avoid shared-hosting timeouts.
- **Cleanup built-in:** Automatic pruning of old transcript meta to prevent database bloat.
- **No Cloudflare Worker, no speaker diarization, no real-time typewriter animation.**

---

## Implementation Approach

### Architecture (from decisions)
Three moving parts, no more:
1. **Gutenberg block** (`src/`, `block.json`) — Handles drag-and-drop, job-status polling, and transcript preview in the editor.
2. **PHP proxy** (`includes/class-scribe-api.php`) — Receives file, forwards to OpenAI Whisper with API key, returns transcript JSON.
3. **post_meta storage** (`includes/class-storage.php`) — JSON blob + metadata attached to the post. No custom DB tables in v1.

### File Map
```
scribe/
├── scribe.php                    # Main plugin file. Registers block, hooks cron, activation.
├── block.json                    # Gutenberg block manifest.
├── build/                        # Compiled assets (wp-scripts).
│   ├── block.js
│   ├── block.css
│   └── frontend.js
├── src/                          # Block source.
│   ├── edit.js                   # Block editor UI (drop zone, job status).
│   ├── save.js                   # Frontend render (server-side mostly).
│   ├── components/
│   │   ├── AudioDropZone.js      # Drag-and-drop handler.
│   │   ├── Transcript.js         # Sentence/word-level transcript renderer.
│   │   ├── Word.js               # Individual clickable word + timestamp.
│   │   └── JobStatus.js          # Async polling UI. Must feel invisible.
│   ├── style.scss                # Frontend typography (the product).
│   └── editor.scss               # Editor chrome only. Native feel.
├── includes/
│   ├── class-scribe-api.php      # OpenAI Whisper proxy. Upload, error mapping.
│   ├── class-job-queue.php       # WP Cron registration. Job state machine.
│   ├── class-storage.php         # post_meta read/write. JSON encode/decode. Pruning.
│   └── class-settings.php        # Single admin page. API key field. Zero fluff.
├── assets/
│   └── css/
│       └── frontend.css          # Compiled from src/style.scss.
├── languages/                    # i18n strings (prepared, not fully translated).
└── readme.txt                    # WordPress.org plugin directory readme.
```

### Key Technical Choices
- **Async queue:** `wp_schedule_event` on activation. Job IDs stored in post_meta. Poll or cron-process.
- **Click-to-play:** Sentence-level is the floor; word-level is the ceiling if Whisper returns clean granularity. HTML5 `currentTime` seek with a small negative buffer (-0.2s) to mitigate browser drift.
- **Error handling:** Clear inline error states in the block (no modals). If API key is missing, show link to Settings.
- **Typography:** System fonts only. Generous line-height, warm spacing. One light theme. Dark mode is v2.
- **No REST API:** The proxy is invoked via standard WordPress AJAX or server-side handling appropriate for the block editor context.

### Open Questions / Build Blockers
1. **Export format conflict (Decision #10):** SRT vs. HTML/plain text. Builder must resolve before export button is written. If unresolved, v1 ships without export.
2. **Word-level sync precision:** Need to test cross-browser `currentTime` drift and fallback to sentence-level if word array is corrupt.
3. **Async progress UX:** Concrete loading pattern for the 30–60s wait (skeleton, zen spinner, etc.).
4. **File size / hosting floor:** Define max upload size (recommend 50MB–100MB for v1). Reject client-side or server-side?
5. **Rate-limiting / retry strategy:** Exponential backoff for OpenAI RPM limits. Dead-letter after N tries.
6. **Cleanup trigger:** Weekly cron or on-post-save? Retention policy (30 days? 90 days?).

---

## Verification Criteria

### Plugin Integrity
- `php -l scribe.php` and all `includes/*.php` return zero syntax errors.
- `block.json` is valid JSON (`python3 -m json.tool block.json` exits 0).
- `readme.txt` contains WordPress.org standard headers.

### Block Editor
- Block appears in Gutenberg inserter under "Scribe" or "Media" category.
- Drag-and-drop accepts MP3, M4A, WAV; rejects other types with inline notice.
- Job status UI cycles through: uploading → queued → processing → done → error.
- Transcript preview renders in editor when job is complete.

### PHP Proxy
- Mocked OpenAI request returns expected transcript JSON shape.
- API key is injected from `get_option('scribe_api_key')` or `SCRIBE_API_KEY` constant.
- 4xx/5xx responses map to `WP_Error` with user-friendly message.
- Capability check (`upload_files` or `edit_posts`) guards proxy endpoint.

### Job Queue
- Activation hook registers a custom cron schedule.
- `wp_schedule_event` is present; `register_deactivation_hook` cleans it up.
- Job state machine transitions correctly: `pending` → `processing` → `completed` | `failed`.
- Failed jobs retry with exponential backoff; dead-letter after N attempts (recommend 3).

### Storage
- `save_transcript()` writes valid JSON to post_meta.
- `get_transcript()` returns identical array after roundtrip.
- Pruning cron removes meta older than retention policy without touching user content.
- No post_meta bloat warnings for files under threshold.

### Settings
- Settings > Scribe page exists with exactly one field: API Key.
- `sanitize_text_field` applied on save.
- When `define('SCRIBE_API_KEY', 'sk-...')` is set in `wp-config.php`, settings page shows constant is active and field is disabled.
- `manage_options` capability check required.

### Frontend
- Transcript renders with system fonts, generous line-height, warm spacing.
- Clicking a sentence (or word) seeks the `<audio>` element to the correct timestamp.
- Small negative seek buffer applied to handle browser drift.
- Graceful fallback to sentence-level if word timestamps are missing or corrupt.
- Assets only enqueue when the block is present on the current post.

### Decisions Compliance
- **No watermark:** `grep -ri "watermark" scribe/src scribe/includes scribe/assets` returns 0 matches.
- **No setup wizard:** `grep -ri "wizard\|onboarding\|tour" scribe/src scribe/includes scribe/assets` returns 0 matches.
- **No real-time typewriter:** `grep -ri "setInterval.*typewriter\|typewriter.*setInterval" scribe/src scribe/includes scribe/assets` returns 0 matches.
- **No Cloudflare Worker:** `grep -ri "cloudflare\|wrangler\|workers.dev" scribe/src scribe/includes scribe/assets` returns 0 matches.
- **No speaker diarization:** `grep -ri "diarization\|pyannote\|assemblyai" scribe/src scribe/includes scribe/assets` returns 0 matches.
- **Zero external API calls in activation hook:** `grep -A 20 "register_activation_hook" scribe.php | grep -E "wp_remote_|curl_init|file_get_contents"` returns 0 matches.
- **ABSPATH guard:** Every PHP file contains `if (!defined('ABSPATH')) exit;` or equivalent.

### Performance & Security
- Activation completes in <5 seconds on standard shared hosting.
- No `eval()`, `assert()`, or suspicious `base64_decode` usage in source.
- All output sanitized (`esc_html`, `esc_url`, `wp_kses_post`).

---

## Files Created or Modified

### New Files (Build Output)
| File | Purpose |
|------|---------|
| `scribe/scribe.php` | Main plugin bootstrap, block registration, activation/deactivation hooks |
| `scribe/block.json` | Gutenberg block manifest |
| `scribe/build/block.js` | Compiled block editor bundle |
| `scribe/build/block.css` | Compiled block editor styles |
| `scribe/build/frontend.js` | Compiled frontend interactivity (click-to-play) |
| `scribe/src/edit.js` | Block editor entry point |
| `scribe/src/save.js` | Block save/frontend render entry point |
| `scribe/src/components/AudioDropZone.js` | Drag-and-drop audio handler |
| `scribe/src/components/Transcript.js` | Transcript renderer with timestamps |
| `scribe/src/components/Word.js` | Clickable word component |
| `scribe/src/components/JobStatus.js` | Async job status indicator |
| `scribe/src/style.scss` | Frontend typography source |
| `scribe/src/editor.scss` | Editor-only styles source |
| `scribe/includes/class-scribe-api.php` | OpenAI Whisper PHP proxy |
| `scribe/includes/class-job-queue.php` | WP Cron job queue and state machine |
| `scribe/includes/class-storage.php` | post_meta JSON storage and pruning |
| `scribe/includes/class-settings.php` | Minimal settings page |
| `scribe/assets/css/frontend.css` | Compiled frontend stylesheet |
| `scribe/languages/` | i18n stubs |
| `scribe/readme.txt` | WordPress.org directory readme |
| `scribe/package.json` | Build dependencies (`@wordpress/scripts`) |

### Potentially Modified Files
| File | Change |
|------|--------|
| `wp-config.php` (developer site) | Optional `define('SCRIBE_API_KEY', '...')` for zero-UI setup |
| `.github/workflows/ci.yml` | Add Scribe build/test steps if repo-wide CI exists |

### Deliverable Test Scripts
| File | Purpose |
|------|---------|
| `deliverables/github-issue-sethshoultes-shipyard-ai-88/tests/test-structure.sh` | Verify all required files exist |
| `deliverables/github-issue-sethshoultes-shipyard-ai-88/tests/test-php-lint.sh` | Syntax-check all PHP files |
| `deliverables/github-issue-sethshoultes-shipyard-ai-88/tests/test-decisions.sh` | Enforce debate decisions (banned patterns) |
| `deliverables/github-issue-sethshoultes-shipyard-ai-88/tests/test-security.sh` | Security guards and capability checks |
| `deliverables/github-issue-sethshoultes-shipyard-ai-88/tests/test-build.sh` | Validate JSON and JS syntax |
