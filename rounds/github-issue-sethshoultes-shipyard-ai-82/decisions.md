# Cut — Locked Decisions
## Consolidated by the Zen Master | Build Phase Blueprint

---

## 1. Decisions Ledger

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1 | **Product name is "Cut"** | Steve | Steve | Elon conceded it is "excellent." One syllable, visceral, connects film editing and shipping code. Unanimous. |
| 2 | **No server-side Remotion inside WordPress** | Elon | Elon | Steve called it "architectural madness" and "a creature that should not exist." Unanimous. |
| 3 | **No server-side video rendering in v1** | Elon | Elon | Steve conceded that burning Lambda credits for free users is "not a business; it is a bonfire." Rendering happens in the browser or not at all until revenue justifies physics. Unanimous. |
| 4 | **Zero templates / zero customization panels** | Steve | Steve | Elon agreed with "NO forty-seven toggles." Taste is the moat; democracy is creative bankruptcy. Unanimous. |
| 5 | **Design philosophy: dignity, restraint, taste** | Steve | Steve | Elon agreed taste prevents commoditization. The output must evoke pride, not decoration. Unanimous. |
| 6 | **Client-side rendering only** | Elon | Elon | Steve conceded "rendering must happen in the browser or not at all." Zero marginal cost, infinite scale. Unanimous. |
| 7 | **Scope discipline: ship a knife, not a Swiss Army knife** | Converged | Both | Elon called full server-rendered pipeline "delusional" for one session. Steve agreed: "three engineering domains in one session is fantasy." Both accept a single-session build constraint. |
| 8 | **TTS (voice) included via browser-native Web Speech API** | Steve | Steve | Steve's non-negotiable #2: "We pick the voice." Elon's cost objection evaporates when TTS is client-side (Web Speech API). Zero server cost, no API keys, no latency. The director speaks from the user's own laptop. |
| 9 | **Distribution: WordPress plugin wrapper + portable client-side core** | Zen Master ruling | Compromise | Steve demanded WP plugin first ("meet them in their kitchen"). Elon demanded SaaS-not-silo ("the link is the shareable artifact"). Ruling: build a lightweight, hosted client-side renderer that works anywhere; ship it inside a thin WordPress plugin that enqueues the same JS. One codebase, two doorways. The plugin is the distribution wedge; the core is the platform-agnostic asset. |

---

## 2. MVP Feature Set (What Ships in v1)

**Core Engine (client-side JavaScript)**
- **Input:** Accepts a single, strict changelog format (WordPress `readme.txt` changelog section as v1 standard). No universal parser.
- **Parse:** Extracts version headers and bullet points into a structured array.
- **Render:** CSS/Canvas animated changelog page with:
  - Curated typography (one typeface, breathing whitespace, editorial hierarchy)
  - Restrained motion (gentle slides, confident fades; nothing bounces, nothing wobbles)
  - Browser-native **Web Speech API** narration (one selected voice, calm pacing; off-by-default or auto-read on play)
  - One polished, cinematic sequence ("the 30-second gasp")
- **Output:** A self-contained, shareable HTML page (hosted URL) that opens instantly on any device.

**WordPress Plugin (thin PHP wrapper)**
- Admin page in `wp-admin` where user pastes their changelog text.
- "Preview" button triggers the client-side renderer in an iframe/modal.
- "Publish" generates a hosted permalink (or local endpoint serving the rendered page).
- Shortcode or block to embed the animated changelog on any post/page.

**Explicitly CUT from v1**
- Server-side video generation (Remotion, ffmpeg, MP4 export)
- Template marketplace or theme switcher
- Customization panels (colors, fonts, speed, voice selection)
- Multi-format parsers (GitHub Releases, npm, Keep a Changelog)
- Enterprise tier / white-label / custom CSS injection
- Stock music or audio beds
- API-first architecture (the API is a side effect, not a strategy)

---

## 3. File Structure

```
cut/
├── client/                     # The core asset — platform-agnostic renderer
│   ├── index.html             # Standalone hosted page entry point
│   ├── src/
│   │   ├── parser.js          # readme.txt changelog parser (strict)
│   │   ├── renderer.js        # Canvas/CSS animation engine
│   │   ├── narrator.js        # Web Speech API wrapper (voice, pacing)
│   │   ├── sequence.js        # The curated cinematic timeline
│   │   ├── typography.css     # The one typeface, the one scale
│   │   └── motion.css         # Restrained transitions (fade, slide)
│   └── assets/
│       └── (none — no images, no audio files)
│
├── wordpress-plugin/           # Distribution wedge
│   ├── cut.php                # Main plugin file
│   ├── admin/
│   │   ├── page.php           # wp-admin "Cut" page
│   │   └── preview.php        # iframe wrapper for renderer
│   ├── public/
│   │   ├── shortcode.php      # [cut changelog="..."] handler
│   │   └── block.js           # Gutenberg block registration
│   └── assets/
│       └── (enqueues client/ build)
│
├── server/                     # Minimal glue (optional, but enables SaaS link sharing)
│   ├── index.js               # Lightweight Node/Express or static host config
│   └── routes/
│       └── render.js          # Accepts POST, returns hosted permalink
│
└── decisions.md               # This document
```

**Build Target for Session 1:**
- `client/` fully functional: paste text → see cinematic animated page with voice.
- `wordpress-plugin/` functional enough to enqueue the client build and preview inside wp-admin.
- `server/` is a stretch goal; static hosting of the client build is acceptable for v1.

---

## 4. Open Questions (Needs Resolution Before Code)

| # | Question | Context | Suggested Path |
|---|----------|---------|----------------|
| 1 | **Does the v1 animated HTML page actually produce "the gasp"?** | Steve insists the 30-second gasp is sacred. Elon argues HTML delivers 90% of the gasp at 0.1% cost. The risk is Steve rejects the output as a "slideshow." | Build the first frame before the parser. If the first 5 seconds of the sequence do not evoke pride, stop and redesign the sequence before adding features. |
| 2 | **Hosted permalink vs. local embed?** | Elon wants shareable URLs; Steve wants presence in wp-admin. If we lack a server, the WP plugin can only embed locally. | Start with local embed (shortcode/block). If session time permits, add a static-export-to-URL feature using a free static host or a lightweight server endpoint. |
| 3 | **Web Speech API voice consistency across browsers?** | "We pick the voice" is hard when browsers ship different voices. Mac Safari sounds different from Windows Chrome. | Curate a ranked preference list (e.g., prefer `Google UK English Male`, fallback to first calm-sounding English voice). Accept that perfect consistency is v2; v1 gets "calm and intelligible." |
| 4 | **Auto-play policy vs. narration** | Browsers block audio auto-play without user interaction. A 30-second cinematic sequence with voice requires a click. | The "Paste → Press Button → Gasp" flow already includes a user click. Trigger narration on the preview/generate action. No auto-play abuse. |
| 5 | **Changelog format strictness** | "We pick one format and do it perfectly." WordPress readme.txt has variants. | Lock to the standard WordPress readme.txt changelog section (`== Changelog ==` header, `= 1.0 =` version lines). Document the strict input contract. Reject malformed input gracefully. |
| 6 | **Canvas vs. DOM/CSS animations?** | Canvas enables cinematic control but is harder to style/access. DOM/CSS is faster to build but may feel like a web page, not a title sequence. | Hybrid: DOM/CSS for typography and layout (accessible, fast), Canvas only if a specific effect (e.g., grain, fade-to-black) demands it. Do not over-engineer the renderer. |

---

## 5. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **The Gasp is not achieved** | Medium | Critical | Build the animation sequence first, before the parser or plugin wrapper. If it feels like a PowerPoint, redesign. Steve's bar is the only bar that matters for product-market fit. |
| **One-session scope creep** | High | High | Kill switch: if any feature takes longer than 20 minutes, it is cut. The parser, the renderer, and the WP enqueue are non-negotiable; everything else is optional. |
| **Browser TTS quality is cringe** | Medium | High | Keep TTS optional in v1. Ship the visual sequence as the primary value; voice is a bonus track. If the selected voice sounds robotic, default it off and iterate post-session. |
| **WP plugin review delays distribution** | Low | Medium | The plugin is a wrapper; the core works standalone. If wp.org review takes weeks, users can still use the hosted version. Build the portable core first. |
| **Changelog parsing edge cases break the illusion** | Medium | Medium | Strict format enforcement. Do not attempt to parse every variation. Show a clear error: "Your changelog does not match the expected format. Here is an example." Dignity extends to error messages. |
| **Client-side performance on low-end devices** | Medium | Medium | Target 60fps on mid-range hardware. If the animation chokes, simplify the motion (fewer simultaneous tweens). Restraint helps performance too. |
| **SaaS hosting cost if server component added** | Low | Medium | v1 server is static-file hosting (GitHub Pages, Netlify, Cloudflare Pages). Zero compute, zero bill. Do not build a dynamic render farm. |
| **Team fractures over SaaS vs. WP priority** | Medium | High | This blueprint settles it: WP plugin is the distribution wedge; portable client core is the product. Both win. Do not reopen the debate during build. |

---

## Zen Master's Closing Word

> "The strength of the team is each individual member. The strength of each member is the team."

Steve gave us the soul: the name, the taste, the gasp, the refusal to ship mediocrity. Elon gave us the physics: client-side only, no server burn, scope that fits one session. Both are right where it matters.

Build the refrigerator door. Make sure it plugs into a standard outlet.

Now cut the noise. Ship the feeling.
