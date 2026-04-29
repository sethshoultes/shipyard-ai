# Decisions — Scribe

*The build blueprint. Debate is over. Board has spoken. These are the lines we play — if we play at all.*

---

## Board Verdict

**HOLD.** No production ship until five conditions are met.

Buffett (3/10) and Shonda (4/10) converged on the same diagnosis: *beautifully engineered corpse, no heartbeat*. The plugin is technically sound but commercially hollow. No toll booth, no reason to return, no distribution flywheel.

### Conditions for Proceeding to Production
1. **Monetization infrastructure must exist** — license-key validation, checkout flow, usage metering, pricing that covers Whisper API COGS.
2. **Retention mechanics must be instrumented** — transcript library/dashboard, usage streaks, "your body of work" visualization.
3. **A content flywheel must replace the dead end** — public shareable transcript URLs with timestamp deep-linking, embeddable player block.
4. **Unit economics must be modeled** — LTV/CAC projections, conversion instrumentation, finance review.
5. **Emotional hooks must be wired into the async pipeline** — waiting-room copy that teases value, unlockable precision tiers that create upgrade tension without degrading the free experience into a demo.

**Next step:** 30-day hold. Deliver monetization + retention proposal addressing conditions 1–5. Failure shifts verdict to **REJECT**.

---

## Locked Decisions

### 1. Product Name
- **Proposed by:** Steve — "Scribe. One word. Human for ten thousand years."
- **Opposed by:** Elon — "Whisper Blocks" (descriptive for repo discoverability; 12 plugins already called "Scribe").
- **Winner:** Steve.
- **Why:** Elon conceded in Round 2: "'Scribe' is a better name than 'Whisper Blocks.' I concede that immediately." The essence demands permanence, not a hardware-store descriptor. The product *slug* may carry a descriptor for WordPress.org search, but what users say and feel is Scribe.

### 2. Core Architecture
- **Proposed by:** Elon — Gutenberg block + PHP proxy endpoint + post_meta JSON.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Why:** Three moving parts. No more. Call the OpenAI Whisper API directly from PHP. Post meta means zero schema migrations; it works on Bluehost, WP Engine, or a Raspberry Pi in a closet. Complexity is the enemy of velocity and survivability.

### 3. Cloudflare Worker
- **Proposed by:** Elon — Cut.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Why:** Adds a fourth auth surface, deploy pipeline, and caching debate. Steve in Round 2: "Cloudflare Worker? Cut it. Infrastructure theater is still theater."

### 4. Speaker Detection / Diarization
- **Proposed by:** Elon — Cut.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Why:** Whisper does not do this natively. Requires pyannote or AssemblyAI — a separate product. Steve also rejected it on aesthetic grounds: speaker labels clutter beautiful text. Board explicitly praised scope discipline here.

### 5. Async Processing
- **Proposed by:** Elon — WP Cron queue, job ID, poll or webhook. Backend is queued.
- **Opposed by:** Steve — Progressive streaming, render words as they arrive, hide the machine.
- **Winner:** Elon (backend); Steve (frontend feeling).
- **Why:** Physics wins. Shared hosting PHP timeouts are real. A 30-minute file takes Whisper ~60 seconds; synchronous waits kill the product. Steve conceded the queue in Round 2: "I concede the queue, the job ID, the webhook." However, the user must never *feel* a queue. The frontend must make waiting feel invisible — but the backend architecture is queued, not streamed.

### 6. Real-Time Typewriter Animation
- **Proposed by:** Steve — Words appear "as if being written in real time."
- **Opposed by:** Elon — "SSE/WebSocket infrastructure or a client-side setInterval charade. Complexity with no thermodynamic purpose."
- **Winner:** Elon.
- **Why:** Whisper returns the entire transcript in one HTTP response. Dressing up the wait with animation theater does not reduce latency; it insults intelligence. Ship the transcript when it is ready. Progress indicator, then done.

### 7. Click-to-Play (Audio Teleportation)
- **Proposed by:** Steve — Non-negotiable for v1. "It is the soul of the experience."
- **Opposed by:** Elon — Sentence-level first; word-level is "brittle in the wild."
- **Winner:** Steve (feature ships), Elon (implementation caution retained).
- **Why:** The essence states: "Click word, hear exact moment." Steve in Round 2: "Click-to-play ships in v1. Sentence-level if we must, but the teleportation ships." Sentence-level timestamps are the floor; word-level is the ceiling if Whisper returns clean granularity. Elon's brittleness concern must be mitigated in implementation — seek buffer, fallback to sentence if word array is corrupt.

### 8. Settings & Configuration UI
- **Proposed by:** Steve — "NO to settings panels with twenty toggles. Pick the right defaults and have the courage to defend them."
- **Opposed by:** None. Elon concurred.
- **Winner:** Consensus.
- **Why:** Elon in Round 2: "A settings panel with twenty toggles is cowardice. Pick smart defaults and move on." One API key field. No wizards. No blocking modals. No advanced panels.

### 9. API Key Handling
- **Proposed by:** Elon — API key required, stored in `wp_options`. Non-negotiable.
- **Opposed by:** Steve — Zero visible configuration. No setup wizard. No API key field in the UI.
- **Winner:** Synthesis.
- **Why:** Elon wins on "key required" — Whisper costs money; zero-config is fraud. Steve wins on "no wizard." The locked decision: one minimal settings field under Settings > Scribe. No multi-step onboarding. No modal blocking first use. Key can also be defined as a constant in `wp-config.php` for zero-UI install. The user drops audio *after* the key is set, never before.

### 10. Export Formats — **UNRESOLVED / BLOCKS BUILD**
- **Proposed by:** Elon — SRT/VTT ships in v1. "20 lines of string formatting. Non-negotiable for podcasters."
- **Opposed by:** Steve — "HTML and plain text only. SRT is a feature for v3, never, or someone else's product. Every export format we add is an admission that we do not trust our own canvas."
- **Winner:** **NONE. No concession from either side.**
- **Why:** This is a hard creative-vs-utility conflict. Elon argues SRT is trivial and necessary for YouTube captions. Steve argues it is utilitarian bloat that undermines the product's soul. **The builder or product owner must make this call before the export button is written.** If SRT ships, it is one button, one format, no selectors. If Steve wins, there is no export button in v1 — the canvas is the product.

### 11. Freemium & Monetization
- **Proposed by:** Elon — Free for files under 10 min. Watermark removed at $29/mo. Content arbitrage SEO.
- **Opposed by:** Steve — "A watermark is a scar on the canvas. Users who see a scar do not upgrade; they leave."
- **Winner:** Steve (for v1), Elon (for scale).
- **Why:** v1 ships clean. No watermark. The free product must be good enough to pay for. However, Elon's cost guardrail is accepted: cap free usage at 60 min/month in licensing logic to prevent API bankruptcy. **Board override:** Monetization infrastructure is now condition #1 for proceeding. No ship without a working upgrade path.

### 12. Cleanup / Pruning Logic
- **Proposed by:** Elon — Add cleanup to prevent post_meta bloat.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Why:** Elon flagged scale math: 10K sites × 100 transcripts × 500KB JSON = 500GB of bloat. Steve in Round 2: "Database bloat is real. Ship the cleanup tool."

### 13. Typography & Visual Design
- **Proposed by:** Steve — Premium magazine-grade typography. "Think The New Yorker layout, not a GitHub README."
- **Opposed by:** Elon — "Gutenberg is not a magazine page... Fighting it means CSS hacks that break every WordPress update. One hour of CSS, not one week."
- **Winner:** Synthesis.
- **Why:** The essence demands "Invisible magic. Beautiful permanence." The *frontend* render gets carefully chosen system fonts, generous line-height, and warm spacing — the magazine experience. The *block editor canvas* must feel native to Gutenberg, not grafted. One beautiful theme, perfectly executed. Dark mode is v2.

### 14. Brand Voice
- **Proposed by:** Steve — "We speak like a craftsman, not a cloud service. We capture voices. We turn sound into permanence."
- **Opposed by:** None.
- **Winner:** Steve (directional).
- **Why:** Elon never contested the voice; he contested the implementation cost of specific effects. Precision without coldness. Warmth without fluff. No "AI-powered" badges or "leverage Whisper model" copy. Maya Angelou's review sharpened this: "When the wires fail, speak like a person. Say what broke and what to do next."

### 15. First 30 Seconds
- **Proposed by:** Steve — Drag. Drop. No config before value. "If the first 30 seconds feels like configuring a plugin, we have already lost."
- **Opposed by:** None. Elon concurred.
- **Winner:** Consensus.
- **Why:** Elon conceded in Round 2: "The drag-drop experience should feel seamless. No config screens before value."

### 16. Free Tier Cap
- **Proposed by:** Elon — Cap free tier at 60 min/month.
- **Opposed by:** None. Steve concurred.
- **Winner:** Consensus.
- **Why:** Steve in Round 2: "Cap the free tier at sixty minutes. Bankrupt companies ship zero great products." Board reinforced: free tier burns COGS with zero offsetting revenue.

### 17. Theme-Native Rendering in Editor
- **Proposed by:** Elon — Zero custom fonts in the editor. Zero layout overrides. Emit clean HTML with semantic classes and let the theme handle typography.
- **Opposed by:** Steve — "Typography is the interface... We do not inherit theme fonts."
- **Winner:** Elon (editor), Steve (frontend).
- **Why:** Elon's survival argument won in the editor: "A plugin that overrides the editor canvas is a plugin that generates one-star reviews and refund requests." The frontend is Steve's domain — magazine spacing, warm voice. The editor stays native to Gutenberg. Beautiful failure is still failure.

### 18. Honest Progress Feedback
- **Proposed by:** Elon — Progress bar, clear status. "A user whose file disappears into a 'breathing' animation with no progress indicator will assume the tab crashed."
- **Opposed by:** Steve — "No 'processing...' anxiety spinners."
- **Winner:** Synthesis.
- **Why:** Steve's "zen spinner" anxiety reduction is accepted as the emotional direction, but Elon's honesty principle stands: the UI must communicate real state. The synthesis: a calm, non-anxious progress indicator that tells truth without inducing panic. No fake "Detecting speakers..." theater unless the board's Condition 5 (emotional hooks) is implemented as a deliberate v1.1 feature.

---

## MVP Feature Set (v1)

**CRITICAL:** The board has placed a **HOLD** on v1. The feature set below is what *would* ship if conditions 1–5 are met. Until then, this is the blueprint under glass.

### What Ships

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
| Monetization infrastructure | Engineering | **Board condition #1.** License-key validation, checkout flow, usage metering, pricing wall. |
| Transcript library dashboard | Engineering + Design | **Board condition #2.** Grid view of all transcripts. "Your body of work" visualization. |
| Public transcript URLs | Engineering | **Board condition #3.** Shareable pages with timestamp deep-linking. |
| Embeddable player block | Engineering | **Board condition #3.** `<iframe>` or oEmbed for external sites. |

### What Does NOT Ship

- Speaker diarization
- Cloudflare Worker or any edge proxy
- Real-time typewriter animation
- Dark mode
- VTT / SRT / PDF export (pending resolution of Decision #10)
- Advanced settings panels
- Setup wizard
- Watermarks or freemium gating (v1 ships clean; paywall is usage-cap, not scar)
- Progressive streaming backend
- Custom onboarding animations
- Content arbitrage / distribution integrations (post-MVP)
- Emotional waiting-room theater (board Condition 5 — v1.1 candidate)
- Precision-tier unlocks (board Condition 5 — v1.1 candidate)
- Weekly email reports (Shonda roadmap — v1.1 candidate)
- Template gallery (Shonda roadmap — v1.1 candidate)

---

## File Structure

```
scribe/
├── scribe.php                    # Main plugin file. Registers block, hooks cron, admin menus.
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
│   │   └── JobStatus.js          # Async polling UI. Calm, honest, non-anxious.
│   ├── style.scss                # Frontend typography (the product).
│   └── editor.scss               # Editor chrome only. Native feel.
├── includes/
│   ├── class-scribe-api.php      # OpenAI Whisper proxy. Upload, error mapping.
│   ├── class-job-queue.php       # WP Cron registration. Job state machine.
│   ├── class-storage.php         # post_meta read/write. JSON encode/decode. Pruning.
│   ├── class-settings.php        # Single admin page. API key field. Zero fluff.
│   ├── class-license.php         # License-key validation, metering, upgrade gating.
│   └── class-library.php         # Transcript library dashboard. Grid, filter, stats.
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
   Elon demands SRT for podcasters. Steve rejects SRT as utilitarian bloat. Neither conceded. **The builder or product owner must make this call before the export button is written.** If SRT ships, it is one button, one format, no selectors. If Steve wins, there is no export button in v1 — the canvas is the product.

2. **Word-level sync precision across browsers.**
   HTML5 MediaElement `currentTime` has micro-drift. How do we guarantee "click word → hear that word" does not land 200ms early on Firefox or Safari? Do we need a small negative offset buffer? Sentence-level fallback if word array is corrupt?

3. **Async progress UX design.**
   If a 30-minute file takes 60 seconds, what does the user see? A skeleton transcript? A calm progress indicator? Steve's "living canvas" metaphor needs a concrete loading pattern that does not feel like a queue.

4. **Rate-limiting and queue retry strategy.**
   OpenAI RPM limits. What is the backoff algorithm? How many retries before dead-letter? Elon flagged this but did not architect it.

5. **File size / hosting compatibility floor.**
   What is the maximum file size we support in v1? 50MB? 100MB? Do we reject client-side or server-side? Shared hosting `upload_max_filesize` and `max_execution_time` vary wildly.

6. **Cleanup logic trigger.**
   Pruning old transcripts from post_meta: on post save? on weekly cron? What is the retention policy? 30 days? 90 days?

7. **API key UX for non-technical users.**
   Steve wants zero UI; Elon demands the key exist. If the user does not edit `wp-config.php`, is a single field under Settings > Scribe acceptable, or does it violate Steve's "no visible config" rule? Can it be hidden behind a "Scribe" submenu with exactly one field?

8. **Pricing model.**
   Board Condition 1 requires monetization infrastructure, but no pricing is locked. Is it $29/mo unlimited? Pay-as-you-go? Tiered by minutes? This must be modeled before checkout code is written.

9. **License-key validation architecture.**
   Self-hosted validation server? WooCommerce integration? Freemius? The choice determines engineering scope for `class-license.php`.

10. **Public transcript URL routing.**
    Custom rewrite rule (`/transcript/slug`) or piggyback on existing post type? SEO implications, slug collision handling, password-protection mode.

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Board REJECT after 30-day hold** | Medium | Critical | Conditions 1–5 must be addressed in proposal, not just promised. LTV/CAC model must be real numbers, not projections. |
| **Export format conflict delays build** | High | High | Decision #10 is unresolved. Mitigation: Product owner makes a hard call within 24 hours. Do not let perfect consensus block the blueprint. |
| **Shared-hosting upload timeout** | High | High | Async queue handles processing, but the *upload itself* can hit `max_execution_time` on cheap hosts. Mitigation: conservative file-size limits in v1; client-side chunking deferred to v2. |
| **OpenAI API cost overrun** | Medium | Critical | Unlimited free tier = bankruptcy. Mitigation: cap free usage at 60 min/month in licensing logic (even if gating is not enforced by watermark). Meter and monitor obsessively. |
| **Monetization infrastructure complexity** | High | High | Adding billing, license validation, and usage metering turns a utility plugin into a SaaS product. Mitigation: evaluate Freemius or similar platform to avoid building billing from scratch. |
| **Word-level timestamp brittleness** | Medium | High | Whisper word timestamps can drift. HTML5 player seek precision varies. Mitigation: small seek buffer, sentence-level fallback render if word array is corrupt or missing. |
| **Rate-limit 500-errors at scale** | Medium | High | No retry/backoff logic = dead jobs and angry users. Mitigation: exponential backoff in job queue. Dead-letter after N tries. |
| **post_meta database bloat** | Medium | Medium | 10K sites × 100 transcripts × 500KB JSON = 500GB. Mitigation: cleanup cron, prune old jobs, store large transcripts as custom table or file attachments if JSON exceeds threshold. |
| **Gutenberg breaking changes** | Low | Medium | WordPress block API evolves. Mitigation: strict `block.json` schema, minimal deprecated API usage, test on latest WP stable. |
| **Plugin repo rejection** | Low | High | WordPress.org requires sanitized output, nonces, capability checks. Mitigation: security audit before submission. |
| **Support burden from missing API keys** | High | Medium | Users install plugin, drop audio, see error. Mitigation: clear inline error state (no modal), link to settings, do not crash editor. |
| **"One session" ambition vs. reality** | High | Medium | Elon insisted v1 ships in one session. Async queue + click-to-play sync + premium typography + monetization infrastructure is more than one session of work. Mitigation: scope ruthlessly to the MVP list above; defer all v2/v1.1 features before first commit. |
| **Building v1.1 roadmap before v1 is cleared** | Medium | Medium | Shonda retention roadmap was written while board verdict was HOLD. Mitigation: do not engineer retention features until board clears conditions. Fix conditions or bury the project. |

---

## Retrospective Honesty

- **Zero code shipped.** A blueprint without a build is procrastination wearing architecture.
- **The unresolved export conflict (Decision #10) was flagged as BLOCKS BUILD and ignored.** Process locked 18 decisions and sidestepped the one that stops engineering.
- **Monetization was treated as v1.1 concern while free-tier COGS burned in v1.** Board said build billing first or kill it. Agency wrote a retention roadmap instead.
- **Elon's "ship in one session" constraint was noted, then abandoned.** Async queue + click-to-play + premium typography + monetization infra was never one session of work. Agency should have said so upfront.
- **A perfect spec for a product that cannot survive is not wisdom; it is cowardice dressed as craft.**

---

*Phil Jackson*
*Great Minds Agency*
*Board verdict: HOLD. Build conditions 1–5 or reject.*
