# Scribe — Locked Decisions
## The Zen Master's Verdict
*Phil Jackson, orchestrating the Great Minds Agency*

---

## Decision Ledger

### 1. Product Name: Scribe
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon conceded without resistance. "Whisper Blocks v2" is a SKU; "Scribe" is a resurrection. One word, two syllables, weight of craft. Locked.

### 2. Brand Voice: Human, Not Enterprise
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon acknowledged that "the poet gets the click." The tagline is **"Your words, finally visible."** No jargon, no acronyms, no "seamless integration with the WordPress ecosystem." If a sentence sounds like an enterprise brochure, burn it. Locked.

### 3. Async-First Architecture
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve's "drag, drop, one button" fantasy assumes Whisper returns in 200ms. It doesn't. A 30-minute podcast times out on shared hosts. Elon's async model (WordPress Action Scheduler, immediate "pending" response, poll/webhook update) is non-negotiable. Steve's UX must be built *inside* this constraint, not around it. Locked.

### 4. Zero Custom Build Tooling
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** `@wordpress/scripts` only. No custom webpack. No Babel configs. If it doesn't ship with `wp-scripts`, it doesn't ship. This removes a major risk vector in the WP block dev environment. Locked.

### 5. Permanent Caching
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Re-transcribing on every page load burns API credits and destroys performance. Transcripts store in `post_meta` with a manual cleanup toggle. No re-burning credits. Ever. Locked.

### 6. Minimal Settings Surface
- **Proposed by:** Both (converged)
- **Winner:** Both
- **Why:** Steve says no airplane cockpits. Elon says one API key field *is* a settings page, and we need an honest status UI when async jobs fail. Convergence: exactly one settings field (OpenAI API key) plus minimal, honest error/status display. No `default voice` setting (Whisper is STT, not TTS — cut the confusion). No upload-vs-URL choice. Locked.

### 7. Cut the Test Theater
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Jest tests for Gutenberg blocks and PHPUnit with mocked APIs prove you can mock, not that it works. Time sinks with near-zero value for a v1 brick. Revisit in v2. Locked.

### 8. Distribution via WordPress.org
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** 10K users without ads is absolutely doable if the plugin solves a real pain point. Users bring their own OpenAI API key (friction as a barrier, moat as a business model). Target: accessibility advocates and podcasters. SEO target: "wordpress audio transcription." Three killer blog posts on ADA compliance and audio accessibility. Locked.

### 9. Readme.txt as Source of Truth
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** WordPress.org requires `readme.txt`. `README.md` becomes a 5-line stub or symlink. One source of truth. Locked.

---

## MVP Feature Set (What Ships in v1)

The essence is this: **async transcription that never breaks. No timeouts. No re-burning credits. Brick first, gold second.**

### Core Flow
1. User drags/drops audio file into the Scribe block.
2. Plugin stores file and queues a transcription job via WordPress Action Scheduler.
3. Block immediately renders a "pending" state.
4. Background job calls OpenAI Whisper API.
5. On completion, transcript is cached in `post_meta` permanently.
6. Block renders the cached transcript — navigable, timestamped text.
7. Manual cleanup toggle available in settings.

### In Scope
- **One Gutenberg block** for audio + transcript (editing + frontend rendering)
- **Async transcription engine** (Action Scheduler integration)
- **OpenAI Whisper API integration** (with 25MB file size guardrails)
- **Permanent transcript caching** in `post_meta`
- **Minimal admin settings page** (one field: API key; one status panel)
- **Graceful error handling** for timeouts, rate limits, and oversized files
- **WordPress.org packaging** (`readme.txt`, stable tag, screenshots)

### Out of Scope (v2 or Later)
- Jest tests for Gutenberg blocks
- PHPUnit with mocked APIs
- Custom webpack / Babel configs
- Chunked upload for files >25MB
- Export buttons (not headline acts)
- URL-based audio (paste-a-link) — drag-and-drop only for v1
- Advanced formatting / speaker diarization
- Auto-cleanup / expiration of cached transcripts beyond manual toggle

---

## File Structure (What Gets Built)

~8 load-bearing files. Everything else is cargo-culting.

```
scribe/
├── scribe.php                  # Main plugin file: registers block, bootstraps classes
├── package.json                # @wordpress/scripts only; zero custom build config
├── readme.txt                  # WordPress.org source of truth
├── README.md                   # 5-line stub / symlink
├── src/
│   ├── index.js                # Block registration
│   ├── edit.js                 # Block editor UI: dropzone, pending state, transcript preview
│   ├── save.js                 # Frontend render: cached transcript output
│   ├── style.scss              # Frontend transcript styles
│   └── editor.scss             # Editor-only styles
├── includes/
│   ├── class-scribe-admin.php      # Settings page (API key + status)
│   ├── class-scribe-api.php        # OpenAI Whisper client + 25MB guards
│   ├── class-scribe-scheduler.php  # Action Scheduler wrapper + job lifecycle
│   └── class-scribe-transcript.php # post_meta read/write + cache logic
└── .gitignore
```

**Note:** No `webpack.config.js`. No `babel.config.js`. No `tests/` directory for v1. If `@wordpress/scripts` doesn't provide it, we don't ship it.

---

## Open Questions (What Still Needs Resolution)

These are known unknowns. They will not block v1, but they require decisions before code is committed.

1. **Polling vs. Webhook for Async Updates**
   - Elon mentioned both. WordPress Action Scheduler does not natively push to the block editor. Do we poll from the editor? Do we store a transient flag? What is the polling interval? Does it create editor performance issues?

2. **Frontend Rendering of Long Transcripts**
   - Elon flagged 20,000+ words crushing mobile browsers. Do we implement DOM virtualization for v1, or do we render plain text with anchor links? Steve wants "living words"; Elon wants survival on mobile. The compromise is untested.

3. **Error State UX**
   - When the async job fails (HTTP 429, 25MB exceeded, invalid API key), what does the user see? Elon demands "honest status UI." Steve wants no airplane cockpits. The design of the failure state is unresolved.

4. **Export Functionality**
   - Steve said "NO to export buttons as headline acts." Does this mean export is cut entirely, or deferred to a subtle secondary action? Unresolved.

5. **Internationalization**
   - No debate mention. Does v1 ship with `__()` wrappers and a `.pot` file, or is i18n deferred to v2? WordPress.org standards suggest it should be in v1.

6. **Audio Format Support**
   - Whisper supports mp3, mp4, mpeg, mpga, m4a, wav, webm. Do we restrict the dropzone to a subset, or accept all and fail gracefully?

7. **Multisite / Network Admin**
   - Is the API key stored per-site or network-wide? No debate coverage. Default to per-site for v1?

---

## Risk Register (What Could Go Wrong)

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Shared host timeouts** on synchronous paths | Critical | High | Async-first architecture is the mitigation. Any REST path touching Whisper must return in <1s. |
| **OpenAI rate limits / 25MB wall** | Critical | High | File size guardrails before upload. Graceful error messages. No silent failures. |
| **Plugin crashes on first use → 1-star reviews kill distribution** | Critical | Medium | Test on a real $5/month Hostinger plan before shipping. Beauty that doesn't survive real hosting is broken engineering. |
| **Async job fails silently; user stuck on "pending" forever** | High | Medium | Honest status UI. Action Scheduler failure logging. Admin notification or block-level error state. |
| **Database bloat from thousands of transcripts in post_meta** | High | Low | Manual cleanup toggle in v1. Automated cleanup strategy in v2. Monitor table growth. |
| **Mobile browser choke on long transcripts** | Medium | Medium | Test 20,000+ word render on mid-tier Android. Fallback to plain text if React DOM virtualization is v2. |
| **Build tooling complexity (Gutenberg dev environment)** | Medium | Medium | `@wordpress/scripts` constraint eliminates custom configs. One agent must verify `npm run build` passes clean. |
| **User doesn't have OpenAI API key (friction barrier)** | Medium | High | This is a known tradeoff. Mitigate with crystal-clear onboarding copy. The moat is worth the friction. |
| **PRD "≥12 files" quota tempts padding** | Low | High | Ignore artificial constraints. ~8 files. If it doesn't serve the user, it doesn't ship. |

---

## Final Verdict

> *Ship a brick that works. Then paint it gold. Not the other way around.*

Steve owns the name, the voice, and the first thirty seconds.
Elon owns the architecture, the cuts, and the non-negotiables.

The poet gets the click. The engineer keeps the user.

Build the brick.
