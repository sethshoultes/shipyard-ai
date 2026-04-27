# Decisions — Scribe

*The build blueprint. Debate is over. These are the lines we play.*

---

## Locked Decisions

### 1. Product Name
- **Proposed by:** Steve — "Scribe. One word. A three-syllable promise."
- **Opposed by:** Elon — "Whisper Blocks" (descriptive for repo discoverability).
- **Winner:** Steve.
- **Rationale:** Elon conceded in Round 2: "'Scribe' is a better name than 'Whisper Blocks.' I concede that immediately." Steve made it non-negotiable in Round 2: "The name is Scribe. Whisper Blocks dies today." The essence demands permanence, not a hardware store. The plugin *slug* may carry a descriptor for WordPress.org search, but the product — what users say and feel — is Scribe.

### 2. Core Architecture
- **Proposed by:** Elon — Gutenberg block + PHP proxy endpoint + post_meta JSON.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Three moving parts. No more. Call the OpenAI Whisper API directly from PHP. Complexity is the enemy of velocity and survivability. Post meta means zero schema migrations; it works on Bluehost, WP Engine, or a Raspberry Pi in a closet.

### 3. Cloudflare Worker
- **Proposed by:** Elon — Cut.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Adds a fourth auth surface, deploy pipeline, and caching debate. Steve in Round 2: "Cloudflare Worker? Cut it. Infrastructure theater is still theater."

### 4. Speaker Detection / Diarization
- **Proposed by:** Elon — Cut.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Whisper does not do this natively. Requires pyannote or AssemblyAI — a separate product. Steve also rejected it on aesthetic grounds: "NO to 'speaker detection' if it means ugly colored labels cluttering beautiful text."

### 5. Async Processing
- **Proposed by:** Elon — WP Cron queue, job ID, poll or webhook. Backend is queued.
- **Opposed by:** Steve — Progressive streaming, render words as they arrive, hide the machine.
- **Winner:** Elon (backend); Steve (frontend feeling).
- **Rationale:** Physics wins. Shared hosting PHP timeouts are real. A 30-minute file takes Whisper ~60 seconds; synchronous waits kill the product. Steve conceded the queue in Round 2: "Async processing is non-negotiable... I concede the queue, the job ID, the webhook." However, the user must never *feel* a queue. The frontend must make waiting feel invisible — but the backend architecture is queued, not streamed.

### 6. Real-Time Typewriter Animation
- **Proposed by:** Steve — Words appear "as if being written in real time."
- **Opposed by:** Elon — "Faking a typewriter effect means SSE/WebSocket infrastructure or a client-side setInterval charade. Complexity with no thermodynamic purpose."
- **Winner:** Elon.
- **Rationale:** Whisper returns the entire transcript in one HTTP response. Dressing up the wait with animation theater does not reduce latency; it insults intelligence. Ship the transcript when it is ready. Progress indicator, then done. Steve did not re-fight this specific mechanic in Round 2, shifting his energy to "progressive rendering" of the queue state itself.

### 7. Click-to-Play (Audio Teleportation)
- **Proposed by:** Steve — Non-negotiable for v1. "It is the soul of the experience. Without it we are a CSV generator."
- **Opposed by:** Elon — Sentence-level first; word-level is "brittle in the wild."
- **Winner:** Steve (feature ships), Elon (implementation caution retained).
- **Rationale:** The essence states: "Click word, hear exact moment." Steve in Round 2: "Click-to-play ships in v1. Sentence-level if we must, but the teleportation ships." The feature ships. Sentence-level timestamps are the floor; word-level is the ceiling if Whisper returns clean granularity. Elon's brittleness concern must be mitigated in implementation — seek buffer, fallback to sentence if word array is corrupt.

### 8. Settings & Configuration UI
- **Proposed by:** Steve — "NO to settings panels with twenty toggles. Pick the right defaults and have the courage to defend them."
- **Opposed by:** None. Elon concurred.
- **Winner:** Consensus.
- **Rationale:** Elon in Round 2: "A settings panel with twenty toggles is cowardice. Pick smart defaults and move on." One API key field. No wizards. No blocking modals. No advanced panels.

### 9. API Key Handling
- **Proposed by:** Elon — API key required, stored in `wp_options`. Non-negotiable.
- **Opposed by:** Steve — Zero visible configuration. No setup wizard. No API key field in the UI.
- **Winner:** Synthesis.
- **Rationale:** Elon wins on "key required" — Whisper costs money; zero-config is fraud. Steve wins on "no wizard." The locked decision: one minimal settings field under Settings > Scribe. No multi-step onboarding. No modal blocking first use. Key can also be defined as a constant in `wp-config.php` for zero-UI install. The user drops audio *after* the key is set, never before.

### 10. Export Formats
- **Proposed by:** Elon — SRT/VTT ships in v1. "20 lines of string formatting. Non-negotiable for podcasters."
- **Opposed by:** Steve — "HTML and plain text only. SRT is a feature for v3, never, or someone else's product. Every export format we add is an admission that we do not trust our own canvas."
- **Winner:** **UNRESOLVED.** No concession from either side.
- **Rationale:** This is a hard conflict. Elon argues SRT is trivial and necessary for YouTube captions. Steve argues it is utilitarian bloat that undermines the product's soul. The builder must resolve this before export code is written. See Open Question #1.

### 11. Freemium & Monetization
- **Proposed by:** Elon — Free for files under 10 min. Watermark removed at $29/mo. Content arbitrage SEO.
- **Opposed by:** Steve — "A watermark is a scar on the canvas. Users who see a scar do not upgrade; they leave."
- **Winner:** Steve (for v1), Elon (for scale).
- **Rationale:** v1 ships clean. No watermark. The free product must be good enough to pay for. However, Elon's cost guardrail is accepted: cap free usage at 60 min/month in licensing logic to prevent API bankruptcy. Distribution tactics (SEO hijack, podcast-host integrations) are post-MVP.

### 12. Cleanup / Pruning Logic
- **Proposed by:** Elon — Add cleanup to prevent post_meta bloat.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Elon flagged scale math: 10K sites × 100 transcripts × 500KB JSON = 500GB of bloat. Steve in Round 2: "Database bloat is real. Ship the cleanup tool."

### 13. Typography & Visual Design
- **Proposed by:** Steve — Premium magazine-grade typography. "Think The New Yorker layout, not a GitHub README."
- **Opposed by:** Elon — "Gutenberg is not a magazine page... Fighting it means CSS hacks that break every WordPress update. One hour of CSS, not one week."
- **Winner:** Synthesis.
- **Rationale:** The essence demands "Invisible magic. Beautiful permanence." The *frontend* render gets carefully chosen system fonts, generous line-height, and warm spacing — the magazine experience. The *block editor canvas* must feel native to Gutenberg, not grafted. One beautiful theme, perfectly executed. Dark mode is v2.

### 14. Brand Voice
- **Proposed by:** Steve — "We speak like a craftsman, not a cloud service. We capture voices. We turn sound into permanence."
- **Opposed by:** None.
- **Winner:** Steve (directional).
- **Rationale:** Elon never contested the voice; he contested the implementation cost of specific effects. Precision without coldness. Warmth without fluff. No "AI-powered" badges or "leverage Whisper model" copy.

### 15. First 30 Seconds
- **Proposed by:** Steve — Drag. Drop. No config before value. "If the first 30 seconds feels like configuring a plugin, we have already lost."
- **Opposed by:** None. Elon concurred.
- **Winner:** Consensus.
- **Rationale:** Elon conceded in Round 2: "The drag-drop experience should feel seamless. No config screens before value."

### 16. Free Tier Cap
- **Proposed by:** Elon — Cap free tier at 60 min/month.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Rationale:** Steve in Round 2: "Cap the free tier at sixty minutes. Bankrupt companies ship zero great products."

---

## MVP Feature Set (v1)

What ships:

| Feature | Owner | Notes |
|---|---|---|
| WordPress plugin scaffold (`scribe.php`, `block.json`) | Engineering | Standard WP plugin header, Gutenberg block registration. |
| Gutenberg block: Audio drop/upload | Engineering | Drag-and-drop in editor. Accepts MP3, M4A, WAV. No config before first drop. |
| PHP proxy to OpenAI Whisper API | Engineering | Receives file, forwards with API key. Handles errors gracefully. |
| WP Cron async transcription job | Engineering | Queues upload. Returns job ID. Polls for completion. Prevents shared-hosting timeouts. |
| Click-to-play transcript renderer | Engineering + Design | Click sentence (word-level if feasible) → HTML5 audio seeks to time. Frontend only. |
| JSON post_meta storage | Engineering | Transcript blob + metadata attached to post. |
| Minimal settings page | Engineering | API key field only. No wizards. Can be bypassed with `wp-config.php` constant. |
| Cleanup / pruning logic | Engineering | Prevents post_meta bloat. Auto-prune old job artifacts. |
| Premium frontend typography | Design | Magazine-readable spacing, warm voice, generous line-height. System fonts. One beautiful theme. |
| Native editor chrome | Design | Block feels native to Gutenberg. No admin-panel aesthetic bleeding into the canvas. |

What does **not** ship:

- Speaker diarization
- Cloudflare Worker or any edge proxy
- Real-time typewriter animation
- Dark mode
- VTT / HTML / PDF export (pending resolution of export format conflict)
- Advanced settings panels
- Setup wizard
- Watermarks or freemium gating
- Progressive streaming backend (deferred to v2)
- Custom onboarding animations
- Content arbitrage / distribution integrations (post-MVP)

---

## File Structure

```
scribe/
├── scribe.php                    # Main plugin file. Registers block, hooks cron.
├── block.json                    # Gutenberg block manifest.
├── build/                        # Compiled assets (wp-scripts).
│   ├── block.js
│   ├── block.css
│   └── frontend.js
├── src/
│   ├── edit.js                   # Block editor UI (drop zone, job status).
│   ├── save.js                   # Frontend render (server-side mostly).
│   ├── components/
│   │   ├── AudioDropZone.js      # Drag-and-drop handler.
│   │   ├── Transcript.js         # Sentence/word-level transcript renderer.
│   │   ├── Word.js               # Individual clickable word + timestamp (if word-level ships).
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

---

## Open Questions

These need resolution before or during build. They were not settled in debate.

1. **Export format — SRT vs. HTML/plain text (BLOCKS BUILD).**
   Elon demands SRT for podcasters. Steve rejects SRT as utilitarian bloat, wants HTML and plain text only. Neither conceded. The builder or product owner must make this call before the export button is written. If SRT ships, it is one button, one format, no selectors. If Steve wins, there is no export button in v1 — the canvas is the product.

2. **Word-level sync precision across browsers.**
   HTML5 MediaElement `currentTime` has micro-drift. How do we guarantee "click word → hear that word" does not land 200ms early on Firefox or Safari? Do we need a small negative offset buffer? Sentence-level fallback if word array is corrupt?

3. **Async progress UX design.**
   If a 30-minute file takes 60 seconds, what does the user see? A skeleton transcript? A zen progress indicator? Steve's "living canvas" metaphor needs a concrete loading pattern that does not feel like a queue.

4. **Rate-limiting and queue retry strategy.**
   OpenAI RPM limits. What is the backoff algorithm? How many retries before dead-letter? Elon flagged this but did not architect it.

5. **File size / hosting compatibility floor.**
   What is the maximum file size we support in v1? 50MB? 100MB? Do we reject client-side or server-side? Shared hosting `upload_max_filesize` and `max_execution_time` vary wildly.

6. **Cleanup logic trigger.**
   Pruning old transcripts from post_meta: on post save? on weekly cron? What is the retention policy? 30 days? 90 days?

7. **API key UX for non-technical users.**
   Steve wants zero UI; Elon demands the key exist. If the user does not edit `wp-config.php`, is a single field under Settings > Scribe acceptable, or does it violate Steve's "no visible config" rule? Can it be hidden behind a "Scribe" submenu with exactly one field?

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Export format conflict delays build** | High | High | Decision #10 is unresolved. Mitigation: Product owner makes a hard call within 24 hours. Do not let perfect consensus block the blueprint. |
| **Shared-hosting upload timeout** | High | High | Async queue handles processing, but the *upload itself* can hit `max_execution_time` on cheap hosts. Mitigation: conservative file-size limits in v1; client-side chunking deferred to v2. |
| **OpenAI API cost overrun** | Medium | Critical | Unlimited free tier = bankruptcy. Mitigation: cap free usage at 60 min/month in licensing logic (even if gating is not enforced by watermark). Monitor API dashboard obsessively. |
| **Word-level timestamp brittleness** | Medium | High | Whisper word timestamps can drift. HTML5 player seek precision varies. Mitigation: small seek buffer, sentence-level fallback render if word array is corrupt or missing. |
| **Rate-limit 500-errors at scale** | Medium | High | No retry/backoff logic = dead jobs and angry users. Mitigation: exponential backoff in job queue. Dead-letter after N tries. |
| **post_meta database bloat** | Medium | Medium | 10K sites × 100 transcripts × 500KB JSON = 500GB. Mitigation: cleanup cron, prune old jobs, store large transcripts as custom table or file attachments if JSON exceeds threshold. |
| **Gutenberg breaking changes** | Low | Medium | WordPress block API evolves. Mitigation: strict `block.json` schema, minimal deprecated API usage, test on latest WP stable. |
| **Plugin repo rejection** | Low | High | WordPress.org requires sanitized output, nonces, capability checks. Mitigation: security audit before submission. |
| **Support burden from missing API keys** | High | Medium | Users install plugin, drop audio, see error. Mitigation: clear inline error state (no modal), link to settings, do not crash editor. |
| **"One session" ambition vs. reality** | High | Medium | Elon insisted v1 ships in one session. Async queue + click-to-play sync + premium typography is more than one session of work. Mitigation: scope ruthlessly to the MVP list above; defer all v2 features before first commit. |

---

*Phil Jackson*
*Great Minds Agency*
