# Spec: Scribe — AI Transcription Gutenberg Block

> Issue: sethshoultes/shipyard-ai#88
> PRD: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-88.md`
> Decisions: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-88/decisions.md`

**Note on sources:** The `.planning/phase-1-plan.md` file reviewed contains plans for the *Relay* project (AI form handler). This spec is derived from the PRD and debate decisions for **Scribe** (issue #88), which are internally consistent.

---

## 1. Goals

1. **Instant Transcription:** Enable WordPress users to drag-and-drop audio/video files (MP3, M4A, WAV) into a Gutenberg block and receive an AI-generated transcript via OpenAI Whisper.
2. **Click-to-Play Sync:** Clicking a sentence (or word, if Whisper returns clean granularity) jumps the HTML5 audio playhead to that exact timestamp and begins playback.
3. **Beautiful Reading Experience:** Deliver magazine-grade frontend typography — system fonts, generous line-height, warm spacing — that feels like The New Yorker, not a GitHub README.
4. **Native Editor Feel:** The block canvas must feel native to Gutenberg. No custom fonts, no layout overrides, no admin-panel aesthetic bleeding into the editor.
5. **Share & Embed:** Public shareable transcript URLs with timestamp deep-linking (`?t=123`) and an embeddable player block for external sites.
6. **Sustainable Economics:** Monetization infrastructure (license validation, usage metering, checkout flow) with a 60 min/month free tier cap to prevent API COGS bankruptcy.
7. **Retention:** Transcript library dashboard — a "your body of work" grid view that gives users a reason to return.
8. **WordPress.org Distribution:** Sanitized output, nonces, capability checks, i18n, `readme.txt` — ready for the plugin directory.

---

## 2. Implementation Approach

### 2.1 Product Identity
- **Name:** Scribe (user-facing). Slug may carry a descriptor for WP.org search.
- **Voice:** Craftsman, not cloud service. Precision without coldness. No "AI-powered" badges.

### 2.2 Core Architecture (3 moving parts)
1. **Gutenberg Block** — Drag-and-drop audio upload, job status UI, transcript renderer.
2. **PHP Proxy Endpoint** — Receives file, forwards to OpenAI Whisper API with API key. No Cloudflare Worker.
3. **Post Meta JSON Storage** — Transcript blob + metadata attached to the post. Zero schema migrations.

### 2.3 Key Technical Decisions

| Decision | Locked Choice | Rationale |
|----------|--------------|-----------|
| **Cloudflare Worker** | CUT | Adds 4th auth surface and deploy pipeline. Direct PHP-to-Whisper only. |
| **Speaker Diarization** | CUT | Whisper does not do this natively. Requires separate product. Also clutters beautiful text. |
| **Async Processing** | WP Cron queue | Shared hosting PHP timeouts are real. 30-min files take ~60s; synchronous waits kill the product. |
| **Real-Time Animation** | CUT | Whisper returns full transcript in one response. Progress indicator, then done. No typewriter theater. |
| **Click-to-Play** | Sentence-level minimum; word-level ceiling | Whisper word timestamps can drift. Implement sentence-level fallback if word array is corrupt. Small seek buffer for browser drift. |
| **Settings** | One API key field only | Under Settings > Scribe. No wizards. No modals. Key can also be set via `wp-config.php` constant. |
| **Export Formats** | **UNRESOLVED — BLOCKS BUILD** | Elon demands SRT for podcasters. Steve rejects SRT as utilitarian bloat. **Product owner must make this call before export button is written.** |
| **Freemium** | Clean v1, no watermark | Free tier capped at 60 min/month in licensing logic. The free product must be good enough to pay for. |
| **Editor Typography** | Native Gutenberg | Zero custom fonts in editor. Zero layout overrides. Emit clean HTML with semantic classes. |
| **Frontend Typography** | Magazine-grade | System fonts, generous line-height, warm spacing. One beautiful theme. Dark mode is v2. |
| **Cleanup** | Auto-prune old job artifacts | Prevents post_meta bloat. Triggered on scheduled cron. |

### 2.4 Async Pipeline
1. User drops audio in editor.
2. Frontend uploads file to PHP proxy.
3. Proxy validates file (type, size limit), enqueues job, returns job ID immediately.
4. WP Cron batch processes pending jobs: forwards to Whisper API, stores result in post_meta, updates job status.
5. Frontend polls job status endpoint or receives webhook. On complete, renders transcript.
6. Transcript renderer emits semantic HTML with `data-start` timestamps. Click handler seeks audio element.

### 2.5 Monetization & Metering
- License key validation (architecture TBD: self-hosted, WooCommerce, or Freemius).
- Per-minute usage counter stored in site options.
- Hard cap at 60 min/month for free tier. Paywall is usage-cap, not watermark/scar.

### 2.6 File Size & Hosting Floor
- Conservative file-size limit in v1 (recommend 50MB–100MB max).
- Client-side chunking deferred to v2.
- Shared hosting `upload_max_filesize` and `max_execution_time` respected.

### 2.7 Rate Limiting & Retries
- Exponential backoff on Whisper API calls (1s, 2s, 4s).
- Dead-letter after N retries (recommend 3–5).
- OpenAI RPM limits respected.

---

## 3. Verification Criteria

### 3.1 Plugin Scaffold
- `php -l scribe.php` passes with zero errors.
- Activation hook registers block type, schedules cron, flushes rewrite rules.
- Deactivation hook clears cron events.
- Plugin appears in wp-admin Plugins list with correct name and version.

### 3.2 Block Registration
- `block.json` is valid JSON and passes WordPress block schema validation.
- Block appears in Gutenberg inserter under "Scribe" category.
- `register_block_type()` called in `scribe.php`.

### 3.3 Audio Upload
- Drag-and-drop accepts MP3, M4A, WAV.
- File type validation rejects unsupported formats with inline error (no modal).
- File size check rejects files over limit before upload begins.
- Upload triggers calm, non-anxious progress indicator.

### 3.4 Whisper Proxy (`class-scribe-api.php`)
- Forwards file to `https://api.openai.com/v1/audio/transcriptions` with API key.
- Handles 200: returns structured JSON transcript.
- Handles 4xx: maps to user-friendly inline error.
- Handles 5xx: triggers retry with exponential backoff.
- Never exposes API key in frontend or logs.

### 3.5 Async Job Queue (`class-job-queue.php`)
- WP Cron event `scribe_process_jobs` scheduled on activation.
- Job state machine: `pending` → `processing` → `complete` / `failed`.
- Batch size limited (recommend 1–2 per cron run) for shared hosting safety.
- Failed jobs retry with backoff; dead-letter after max retries.

### 3.6 Post Meta Storage (`class-storage.php`)
- Transcript JSON attaches to post via `update_post_meta()`.
- Meta keys: `_scribe_transcript`, `_scribe_job_id`, `_scribe_audio_url`, `_scribe_duration`.
- `get_post_meta()` retrieves correct structure.
- JSON handles UTF-8, special characters, and large transcripts without corruption.

### 3.7 Click-to-Play (`Transcript.js`, `Word.js`)
- Clicking a sentence calls `audio.currentTime = timestamp` and `audio.play()`.
- Seek precision within ±200ms across Chrome, Firefox, Safari.
- If Whisper returns word-level timestamps, word-level click works with sentence fallback.
- If word array is corrupt or missing, gracefully falls back to sentence-level only.

### 3.8 Frontend Typography (`style.scss`)
- CSS uses system font stack (e.g., `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif`).
- Line-height ≥ 1.6 on body text.
- No layout shifts on load (CLS ≈ 0).
- Renders beautifully on mobile and desktop.

### 3.9 Editor Chrome (`editor.scss`)
- Zero custom fonts in block editor canvas.
- Block feels indistinguishable from core Gutenberg blocks.
- No admin-panel aesthetic bleeding into the canvas.

### 3.10 Settings Page (`class-settings.php`)
- Single input field: OpenAI API key (type=password).
- Saves encrypted to `wp_options` or reads from `SCRIBE_API_KEY` constant.
- If constant is defined, UI shows non-writable notice.
- No wizards, no onboarding modals, no advanced panels.

### 3.11 License & Metering (`class-license.php`)
- License key validation endpoint returns `valid`/`invalid`.
- Usage counter increments per minute of audio processed.
- Free tier hard-caps at 60 min/month; returns clear upgrade message when exceeded.
- Metering accurate to ±1 minute.

### 3.12 Library Dashboard (`class-library.php`)
- Grid view loads in <2 seconds with 50 transcripts.
- Filter by date, post, status.
- Shows transcript count, total minutes processed, "your body of work" stats.

### 3.13 Public Transcript URLs
- Custom rewrite rule `/transcript/{post-slug}` resolves to transcript page.
- `?t=123` deep-links to 123-second timestamp; page auto-seeks on load.
- oEmbed metadata present for social sharing.
- Password-protected posts respected.

### 3.14 Embeddable Player Block
- `<iframe>` or oEmbed renders correctly on external sites.
- Responsive sizing (no horizontal scroll on mobile).
- Click-to-play sync works inside embed.

### 3.15 Cleanup / Pruning (`class-storage.php`)
- Scheduled cron removes old job artifacts (recommend 90-day retention).
- Pruning does not delete published transcript content; only old job metadata and failed uploads.
- Post_meta bloat stays under threshold.

### 3.16 Security
- Every admin action checks `current_user_can('manage_options')` or `edit_posts` as appropriate.
- All REST endpoints have `permission_callback` with nonce or capability check.
- All forms use `wp_nonce_field` + `check_admin_referer`.
- All output escaped with `esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`.
- All input sanitized with `sanitize_text_field`, `sanitize_email`, `absint`, `wp_kses`.
- API key never logged, never output in HTML, never exposed via REST.

### 3.17 WordPress.org Standards
- `readme.txt` has required headers: `=== Scribe ===`, Contributors, Tags, Requires at least, Tested up to, Requires PHP, Stable tag, License.
- All user-visible strings wrapped with `__()`, `_e()`, or `esc_html__()` using text domain `'scribe'`.
- `languages/scribe.pot` stub created.
- PHP 7.4+ compatible: no union types, no named arguments, no `match`, no `str_contains()`.
- `Plugin Check` passes with zero errors and zero warnings.

---

## 4. Files to Create or Modify

All paths are relative to the plugin root (e.g., `projects/scribe/` or `wp-content/plugins/scribe/`).

### Root
| File | Action | Purpose |
|------|--------|---------|
| `scribe.php` | **Create** | Main plugin file. Headers, block registration, activation/deactivation hooks, autoloader, textdomain loader. |
| `block.json` | **Create** | Gutenberg block manifest. Name, title, category, icon, supports, editor/frontend script handles. |
| `readme.txt` | **Create** | WordPress.org plugin directory readme. Standard headers, description, install steps, FAQ, changelog. |

### Build Assets (compiled by `wp-scripts`)
| File | Action | Purpose |
|------|--------|---------|
| `build/block.js` | **Create** | Compiled block editor bundle (edit + components). |
| `build/block.css` | **Create** | Compiled editor styles. |
| `build/frontend.js` | **Create** | Compiled frontend bundle (transcript interactivity, audio seeking). |

### Source JS / SCSS
| File | Action | Purpose |
|------|--------|---------|
| `src/edit.js` | **Create** | Block editor UI. Wraps AudioDropZone, JobStatus, Transcript preview. |
| `src/save.js` | **Create** | Server-side render callback. Emits semantic HTML for frontend. |
| `src/components/AudioDropZone.js` | **Create** | Drag-and-drop handler. File validation, upload trigger, visual feedback. |
| `src/components/Transcript.js` | **Create** | Sentence-level transcript renderer. Maps over segments, emits clickable sentences with `data-start`. |
| `src/components/Word.js` | **Create** | Individual clickable word + timestamp. Used when word-level granularity is available. Falls back gracefully. |
| `src/components/JobStatus.js` | **Create** | Async polling UI. Calm, honest, non-anxious progress indicator. Shows real job state. |
| `src/style.scss` | **Create** | Frontend typography. Magazine spacing, system fonts, warm voice. The product's reading experience. |
| `src/editor.scss` | **Create** | Editor chrome only. Native Gutenberg feel. No custom fonts. Minimal, clean. |

### PHP Includes
| File | Action | Purpose |
|------|--------|---------|
| `includes/class-scribe-api.php` | **Create** | OpenAI Whisper proxy. Upload, error mapping, retry logic. |
| `includes/class-job-queue.php` | **Create** | WP Cron registration. Job state machine. Batch processing. Dead-letter handling. |
| `includes/class-storage.php` | **Create** | post_meta read/write. JSON encode/decode. Pruning/cleanup logic. |
| `includes/class-settings.php` | **Create** | Single admin settings page. API key field. Zero fluff. |
| `includes/class-license.php` | **Create** | License-key validation, usage metering, upgrade gating, 60 min/month cap. |
| `includes/class-library.php` | **Create** | Transcript library dashboard. Grid view, filter, stats, "your body of work" visualization. |

### Assets
| File | Action | Purpose |
|------|--------|---------|
| `assets/css/frontend.css` | **Create** | Compiled from `src/style.scss`. Enqueued on frontend only. |

### i18n
| File | Action | Purpose |
|------|--------|---------|
| `languages/scribe.pot` | **Create** | Translation template stub. Header + all translatable strings. |

### Optional / Conditional
| File | Action | Purpose |
|------|--------|---------|
| `includes/class-public-urls.php` | **Create** | Custom rewrite rules, transcript public page template, oEmbed endpoint. Only if public URLs ship in v1. |
| `includes/class-embed.php` | **Create** | Embeddable player block / iframe renderer. Only if embed block ships in v1. |

---

## 5. Open Questions to Resolve Before Build

1. **Export format (BLOCKS BUILD):** SRT vs. HTML/plain text only. Product owner must decide before export button is written.
2. **Word-level sync precision strategy:** Negative seek buffer size? Sentence-level fallback threshold?
3. **Async progress UX concrete design:** Skeleton transcript vs. calm progress bar vs. zen waiting state.
4. **Retry/dead-letter policy:** Exact retry count (3? 5?) and backoff multiplier.
5. **File size limit:** 50MB or 100MB? Rejected client-side or server-side?
6. **Cleanup retention policy:** 30 days? 90 days? What exactly gets pruned?
7. **License validation architecture:** Self-hosted? WooCommerce? Freemius? Determines `class-license.php` scope.
8. **Pricing model:** $29/mo unlimited? Pay-as-you-go? Tiered by minutes? Required before checkout code.
9. **Public URL routing:** Custom rewrite rule (`/transcript/slug`) or piggyback on existing post type?
10. **Embed mechanism:** `<iframe>` or oEmbed? Responsive strategy?

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Shared-hosting upload timeout | Conservative file-size limits; async queue for processing; clear error messages. |
| OpenAI API cost overrun | 60 min/month free cap; usage metering from day one. |
| Word-level timestamp brittleness | Sentence-level fallback; small seek buffer; graceful degradation if word array corrupt. |
| Rate-limit 500-errors | Exponential backoff in job queue; dead-letter after N tries. |
| post_meta database bloat | Cleanup cron; prune old job artifacts; monitor meta size. |
| Gutenberg breaking changes | Strict `block.json` schema; minimal deprecated API usage; test on latest WP stable. |
| Plugin repo rejection | Security audit before submission; sanitized output; capability checks; nonces. |
| Missing API keys before first drop | Inline error state in editor (no modal); link to settings; do not crash editor. |

---

## 7. What Does NOT Ship in v1

- Speaker diarization
- Cloudflare Worker or any edge proxy
- Real-time typewriter animation
- Dark mode
- VTT / SRT / PDF export (pending Decision #10 resolution)
- Advanced settings panels
- Setup wizard
- Watermarks or freemium gating (v1 ships clean)
- Progressive streaming backend
- Custom onboarding animations
- Content arbitrage / distribution integrations
- Emotional waiting-room theater (v1.1 candidate)
- Precision-tier unlocks (v1.1 candidate)
- Weekly email reports (v1.1 candidate)
- Template gallery (v1.1 candidate)
