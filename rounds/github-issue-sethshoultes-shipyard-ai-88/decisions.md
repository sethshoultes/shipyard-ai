# Decisions — Whisper

*The build blueprint. Debate is over. These are the lines we play.*

---

## Locked Decisions

### 1. Product Name
- **Proposed by:** Steve — "Whisper" (one word, owns the category).
- **Opposed by:** Elon — "Whisper Blocks" (descriptive for WordPress repo discoverability).
- **Winner:** Steve.
- **Rationale:** The essence document defines the product as "a time machine," not a WordPress utility. Category ownership beats directory SEO. Elon's practical concern is valid; the plugin *slug* may include a descriptor for repo search, but the product — what users say, what the brand breathes — is Whisper.

### 2. Core Architecture
- **Proposed by:** Elon — WordPress plugin: Gutenberg block + PHP proxy endpoint + post_meta JSON.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Three moving parts. No Cloudflare Worker. No client-side presigned URL choreography. Complexity is the enemy of execution. Call the OpenAI Whisper API directly from PHP.

### 3. Infrastructure: Cloudflare Worker
- **Proposed by:** Elon — Cut.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Adds a fourth auth surface, deploy pipeline, and caching debate. Not needed for v1.

### 4. Speaker Detection / Diarization
- **Proposed by:** Elon — Cut.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Whisper does not do this natively. Requires pyannote or AssemblyAI. Separate product.

### 5. AI Branding & Badges
- **Proposed by:** Steve — Zero "AI-powered" footnotes, badges, or logos.
- **Opposed by:** None. Elon concurred.
- **Winner:** Consensus.
- **Rationale:** The user asked for their words, not our resume. Warm, confident, human voice only.

### 6. Word-Level Click-to-Play
- **Proposed by:** Steve — Non-negotiable for v1. "Teleporting into audio."
- **Opposed by:** Elon — Sentence-level first; word-level is brittle in the wild.
- **Winner:** Steve.
- **Rationale:** The essence document states: "Click any word, hear that exact moment." That is the gasp moment. Whisper supports `timestamp_granularities=word`. Elon's brittleness concern is valid and must be mitigated in implementation, but the feature ships in v1. Sentence-level is not a compromise we make.

### 7. Async Job Processing
- **Proposed by:** Elon — WP Cron queue, job ID, polling/webhook.
- **Opposed by:** Steve — Progressive streaming, render words as they arrive.
- **Winner:** Elon (for v1).
- **Rationale:** Physics wins. A 30-minute file takes Whisper ~60 seconds. Steve's progressive streaming is the right north star for v2, but v1 cannot depend on chunked streaming architecture. The async queue prevents shared-hosting PHP timeouts and one-star reviews. UX must make waiting feel invisible — skeleton states, animated arrival — but the backend is queued.

### 8. API Key Handling
- **Proposed by:** Elon — API key required, stored in `wp_options`. Non-negotiable.
- **Opposed by:** Steve — Zero visible configuration. No setup wizard. No API key field in the UI.
- **Winner:** Synthesis.
- **Rationale:** Elon wins on "key required" (Whisper costs money; zero-config is fraud). Steve wins on "no wizard." The locked decision: one minimal settings field. No multi-step onboarding. No modal blocking first use. Key can also be defined as a constant in `wp-config.php` for zero-UI install. The user drops audio *after* the key is set, never before.

### 9. Export Formats
- **Proposed by:** Elon — Keep SRT/VTT (20 lines of formatting).
- **Opposed by:** Steve — One beautiful output. No format menus.
- **Winner:** Steve (for v1).
- **Rationale:** Cognitive load is the enemy in v1. Exactly one export format ships. No dropdowns, no committees. The format is **SRT** (standard, portable). VTT and HTML export are v2.

### 10. Typography & Visual Design
- **Proposed by:** Steve — Premium magazine-grade typography. The transcript is the product.
- **Opposed by:** Elon — One hour of CSS, not one week.
- **Winner:** Steve (direction), Elon (time cap).
- **Rationale:** The essence demands "Invisible magic. Beautiful permanence." In a sea of cPanel-looking plugins, beauty is differentiation. However, v1 ships with carefully chosen system fonts, generous line-height, and warm spacing — not a custom design system. One beautiful theme, perfectly executed. Dark mode is v2.

### 11. Settings & Configuration UI
- **Proposed by:** Steve — No advanced settings panels. If you need toggles, the default is broken.
- **Opposed by:** None. Elon concurred.
- **Winner:** Consensus.
- **Rationale:** Defaults must be correct. One API key field. One export button. No panels.

### 12. Freemium & Monetization
- **Proposed by:** Elon — Free <10 min, watermark removed at $29/mo. Content arbitrage SEO.
- **Opposed by:** Steve — Watermarks punish users. Organic product-led growth only.
- **Winner:** Steve (for v1), Elon (for scale).
- **Rationale:** v1 does not ship with watermarks. The free product must be good enough to pay for. However, Elon's cost-guardrail is accepted: future tiers will cap free usage (60 min/month) to prevent API bankruptcy. Distribution tactics (SEO hijack, podcast-host integrations) are post-MVP.

---

## MVP Feature Set (v1)

What ships:

| Feature | Owner | Notes |
|---|---|---|
| WordPress plugin scaffold (`whisper.php`, `block.json`) | Engineering | Standard WP plugin header, Gutenberg block registration. |
| Gutenberg block: Audio drop/upload | Engineering | Drag-and-drop in editor. Accepts MP3, M4A, WAV. |
| PHP proxy to OpenAI Whisper API | Engineering | Receives file, forwards with API key. Handles errors gracefully. |
| WP Cron async transcription job | Engineering | Queues upload. Returns job ID. Polls for completion. |
| Word-level timestamp storage | Engineering | `timestamp_granularities=word` requested from Whisper. |
| Transcript renderer (frontend + editor) | Engineering + Design | Click any word → HTML5 audio seeks to exact time. |
| JSON post_meta storage | Engineering | Transcript blob + metadata attached to post. |
| Single-export SRT generation | Engineering | One button. One format. No selectors. |
| Minimal settings page | Engineering | API key field only. No wizards. Can be bypassed with `wp-config.php` constant. |
| Cleanup / pruning logic | Engineering | Prevents post_meta bloat. Auto-prune old job artifacts. |
| Premium default typography | Design | Magazine-readable spacing, warm voice, no admin-panel aesthetic. |

What does **not** ship:

- Speaker diarization
- Cloudflare Worker or any edge proxy
- Dark mode
- VTT / HTML / PDF export
- Advanced settings panels
- Setup wizard
- Watermarks or freemium gating
- Progressive streaming (deferred to v2)
- Custom onboarding animations

---

## File Structure

```
whisper/
├── whisper.php                     # Main plugin file. Registers block, hooks cron.
├── block.json                      # Gutenberg block manifest.
├── build/                          # Compiled assets (wp-scripts).
│   ├── block.js
│   ├── block.css
│   └── frontend.js
├── src/
│   ├── edit.js                     # Block editor UI (drop zone, job status).
│   ├── save.js                     # Frontend render (server-side mostly).
│   ├── components/
│   │   ├── AudioDropZone.js        # Drag-and-drop handler.
│   │   ├── Transcript.js           # Word-level transcript renderer.
│   │   ├── Word.js                 # Individual clickable word + timestamp.
│   │   └── JobStatus.js            # Async polling UI.
│   ├── style.scss                  # Frontend typography (the product).
│   └── editor.scss                 # Editor chrome only.
├── includes/
│   ├── class-whisper-api.php       # OpenAI Whisper proxy. Handles upload, error mapping.
│   ├── class-job-queue.php         # WP Cron registration. Job state machine.
│   ├── class-storage.php           # post_meta read/write. JSON encode/decode. Pruning.
│   └── class-settings.php          # Single admin page. API key field. Zero fluff.
├── assets/
│   └── css/
│       └── frontend.css            # Compiled from src/style.scss.
├── languages/                      # i18n strings (prepared, not fully translated).
└── readme.txt                      # WordPress.org plugin directory readme.
```

---

## Open Questions

These need resolution before or during build. They were not settled in debate.

1. **API key UX for non-technical users.**
   Steve wants zero UI; Elon demands the key exist. If the user does not edit `wp-config.php`, where do they paste the key without a "settings panel" feel? Is a single field under Settings > Whisper acceptable, or does it violate Steve's "no visible config" rule?

2. **Word-level sync precision across browsers.**
   HTML5 MediaElement `currentTime` has micro-drift. How do we guarantee "click word → hear that word" does not land 200ms early on Firefox or Safari? Do we need a small negative offset buffer?

3. **Which export format is the "one beautiful output"?**
   Debate locked "exactly one format" but did not choose between SRT (Elon's preference) and a custom clean HTML/JSON artifact. SRT is default, but confirm before build.

4. **Async progress UX design.**
   If a 30-minute file takes 60 seconds, what does the user see? A skeleton transcript? A zen progress indicator? Steve's "ink drying on paper" metaphor needs a concrete loading pattern.

5. **Rate-limiting and queue retry strategy.**
   OpenAI RPM limits. What is the backoff algorithm? How many retries before dead-letter? This was flagged by Elon but not architected.

6. **File size / hosting compatibility floor.**
   What is the maximum file size we support in v1? 50MB? 100MB? Do we reject client-side or server-side? Shared hosting `upload_max_filesize` varies wildly.

7. **Cleanup logic trigger.**
   Pruning old transcripts from post_meta: on save? on weekly cron? What is the retention policy?

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Shared-hosting upload timeout** | High | High | Async queue handles processing, but the *upload itself* can hit `max_execution_time` on cheap hosts. Mitigation: chunk upload client-side, or set conservative file-size limits in v1. |
| **OpenAI API cost overrun** | Medium | Critical | Unlimited free tier = bankruptcy. Cap free usage at 60 min/month in licensing logic (even if gating is not enforced by watermark). Monitor API dashboard obsessively. |
| **Word-level timestamp brittleness** | Medium | High | Whisper word timestamps can drift. HTML5 player seek precision varies. Mitigation: small seek buffer, sentence-level fallback render if word array is corrupt. |
| **Rate-limit 500-errors at scale** | Medium | High | No retry/backoff logic = dead jobs and angry users. Mitigation: exponential backoff in job queue. Dead-letter after N tries. |
| **post_meta database bloat** | Medium | Medium | 10K sites × 100 transcripts × 500KB JSON = 500GB. Mitigation: cleanup cron, prune old jobs, store large transcripts as custom table or file attachments if JSON exceeds threshold. |
| **Gutenberg breaking changes** | Low | Medium | WordPress block API evolves. Mitigation: strict `block.json` schema, minimal deprecated API usage, test on latest WP stable. |
| **Plugin repo rejection** | Low | High | WordPress.org requires sanitized output, nonces, capability checks. Mitigation: security audit before submission. |
| **Support burden from missing API keys** | High | Medium | Users install plugin, drop audio, see error. Mitigation: clear inline error state (no modal), link to settings, do not crash editor. |
| **"One session" ambition vs. reality** | High | Medium | Elon insisted v1 ships in one session. Word-level sync + async queue + premium typography is more than one session of work. Mitigation: scope ruthlessly to the MVP list above; defer all v2 features before first commit. |
