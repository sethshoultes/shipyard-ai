# Cut — Locked Decisions
## Consolidated by the Zen Master | Build Phase Blueprint
### Updated post-board review & retrospective

---

## 1. Decisions Ledger

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1 | **Product name is "Cut"** | Steve | Steve | Elon conceded it is "excellent." One syllable, visceral, connects film editing and shipping code. Unanimous. Board: approved. |
| 2 | **No server-side Remotion inside WordPress** | Elon | Elon | Steve called it "architectural madness" and "a creature that should not exist." Unanimous. |
| 3 | **No server-side video rendering in v1** | Elon | Elon | Steve conceded that burning Lambda credits for free users is "not a business; it is a bonfire." Rendering happens in the browser or not at all until revenue justifies physics. Unanimous. |
| 4 | **Zero templates / zero customization panels** | Steve | Steve | Elon agreed with "NO forty-seven toggles." Taste is the moat; democracy is creative bankruptcy. Unanimous. |
| 5 | **Design philosophy: dignity, restraint, taste** | Steve | Steve | Elon agreed taste prevents commoditization. The output must evoke pride, not decoration. Unanimous. |
| 6 | **Client-side rendering only** | Elon | Elon | Steve conceded "rendering must happen in the browser or not at all." Zero marginal cost, infinite scale. Unanimous. |
| 7 | **Scope discipline: ship a knife, not a Swiss Army knife** | Converged | Both | Elon called full server-rendered pipeline "delusional" for one session. Steve agreed: "three engineering domains in one session is fantasy." Both accept a single-session build constraint. Retrospective reinforced: ship parser.js before decisions.md. |
| 8 | **TTS (voice) included via browser-native Web Speech API** | Steve | Steve | Steve's non-negotiable #2: "We pick the voice." Elon's cost objection evaporates when TTS is client-side (Web Speech API). Zero server cost, no API keys, no latency. The director speaks from the user's own laptop. |
| 9 | **Distribution: WordPress plugin wrapper + portable client-side core** | Zen Master ruling | Compromise | Steve demanded WP plugin first ("meet them in their kitchen"). Elon demanded SaaS-not-silo ("the link is the shareable artifact"). Ruling: build a lightweight, hosted client-side renderer that works anywhere; ship it inside a thin WordPress plugin that enqueues the same JS. One codebase, two doorways. The plugin is the distribution wedge; the core is the platform-agnostic asset. |
| 10 | **No MP4 export in v1** | Elon (concession) | Steve (concession) | Elon originally wanted MP4-only output. Steve refused to ship a slideshow. Compromise: cinematic animated HTML page with voice is the v1 deliverable. MP4 deferred until server economics exist. The "gasp" must happen in the browser. |
| 11 | **Voice is optional, visual sequence is primary** | Elon | Elon | Steve wanted voice as sacred. Elon warned browser TTS quality risk. Board (Oprah/Jensen): TTS is a line item, not a product. Compromise: visual sequence is the primary value; voice is a bonus track. TTS defaults to user-triggered play, not auto-play. |
| 12 | **Copy voice: human, warm, proud** | Steve | Steve | Maya Angelou review locked the brand voice: "Give your changelog pulse." Reject corporate litany. Error messages get dignity too. |

---

## 2. MVP Feature Set (What Ships in v1)

**Core Engine (client-side JavaScript)**
- **Input:** Accepts a single, strict changelog format (WordPress `readme.txt` changelog section as v1 standard). No universal parser.
- **Parse:** Extracts version headers and bullet points into a structured array.
- **Render:** CSS/Canvas animated changelog page with:
  - Curated typography (one typeface, breathing whitespace, editorial hierarchy)
  - Restrained motion (gentle slides, confident fades; nothing bounces, nothing wobbles)
  - Browser-native **Web Speech API** narration (one selected voice, calm pacing; off-by-default, triggered by user play button)
  - One polished, cinematic sequence ("the 30-second gasp")
- **Output:** A self-contained HTML page that renders instantly on any device. Hosted permalink is a stretch goal; local embed is the v1 standard.

**WordPress Plugin (thin PHP wrapper)**
- Admin page in `wp-admin` where user pastes their changelog text.
- "Preview" button triggers the client-side renderer in an iframe/modal.
- Shortcode or block to embed the animated changelog on any post/page.
- "Publish" generates a local embed only. Hosted permalink deferred to v1.5.

**Explicitly CUT from v1**
- Server-side video generation (Remotion, ffmpeg, MP4 export)
- Template marketplace or theme switcher
- Customization panels (colors, fonts, speed, voice selection)
- Multi-format parsers (GitHub Releases, npm, Keep a Changelog)
- Enterprise tier / white-label / custom CSS injection
- Stock music or audio beds
- API-first architecture
- "Your last cut" library / retention layer (deferred per Shonda)
- Sharing layer / social export (deferred)

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
├── server/                     # Minimal glue (stretch goal only)
│   ├── index.js               # Lightweight Node/Express or static host config
│   └── routes/
│       └── render.js          # Accepts POST, returns hosted permalink
│
└── decisions.md               # This document
```

**Build Target for Session 1 (from retrospective: actually ship this time):**
- `client/` fully functional: paste text → see cinematic animated page.
- `wordpress-plugin/` functional enough to enqueue the client build and preview inside wp-admin.
- `server/` is explicitly cut from v1. Static hosting of the client build is acceptable.
- **Hour-one milestone:** First render breathes on screen within 60 minutes, or scope is wrong.

---

## 4. Open Questions (Needs Resolution Before Code)

| # | Question | Context | Suggested Path |
|---|----------|---------|----------------|
| 1 | **Does the v1 animated HTML page actually produce "the gasp"?** | Steve insists the 30-second gasp is sacred. Elon argues HTML delivers 90% of the gasp at 0.1% cost. The risk is Steve rejects the output as a "slideshow." Board (Shonda): "the gasp is a stage direction with no stage." | Build the first frame before the parser. If the first 5 seconds of the sequence do not evoke pride, stop and redesign the sequence before adding features. |
| 2 | **Hosted permalink vs. local embed?** | Elon wants shareable URLs; Steve wants presence in wp-admin. If we lack a server, the WP plugin can only embed locally. | Start with local embed (shortcode/block). Hosted permalink is v1.5. Do not block v1 on infrastructure. |
| 3 | **Web Speech API voice consistency across browsers?** | "We pick the voice" is hard when browsers ship different voices. Mac Safari sounds different from Windows Chrome. | Curate a ranked preference list (e.g., prefer `Google UK English Male`, fallback to first calm-sounding English voice). Accept that perfect consistency is v2; v1 gets "calm and intelligible." TTS is optional. |
| 4 | **Auto-play policy vs. narration** | Browsers block audio auto-play without user interaction. A 30-second cinematic sequence with voice requires a click. | The "Paste → Press Button → Gasp" flow already includes a user click. Trigger narration on the preview/generate action. No auto-play abuse. |
| 5 | **Changelog format strictness** | "We pick one format and do it perfectly." WordPress readme.txt has variants. | Lock to the standard WordPress readme.txt changelog section (`== Changelog ==` header, `= 1.0 =` version lines). Document the strict input contract. Reject malformed input gracefully. |
| 6 | **Canvas vs. DOM/CSS animations?** | Canvas enables cinematic control but is harder to style/access. DOM/CSS is faster to build but may feel like a web page, not a title sequence. | Hybrid: DOM/CSS for typography and layout (accessible, fast), Canvas only if a specific effect (e.g., grain, fade-to-black) demands it. Do not over-engineer the renderer. |
| 7 | **What creates a moat if CSS+TTS is a weekend clone?** | Jensen: "Competitor clones this in a weekend." Buffett: "Parser + CSS animations = weekend project." | The moat is not the tech stack. The moat is taste, sequence curation, and the "refrigerator door" emotional positioning. v2 moat: branded synthetic voice, engagement analytics, template marketplace. But v1 must ship first. |
| 8 | **Retention: how do users return?** | Shonda: "One-and-done tool: paste changelog, watch once, forget." No streaks, no library. | Deferred to v2. v1 is a single-use feeling. The plugin lives in wp-admin; users rediscover it at release time. v2 adds "Your Cuts" library and sharing analytics. |

---

## 5. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Zero code shipped (again)** | High | Critical | Hour-one milestone: screen breathes in 60 minutes or we cut scope. No test scripts until there is code to test. No placeholder architecture. Ship parser.js before decisions.md next time. |
| **The Gasp is not achieved** | Medium | Critical | Build the animation sequence first, before the parser or plugin wrapper. If it feels like PowerPoint, redesign. Steve's bar is the only bar that matters for product-market fit. |
| **One-session scope creep** | High | High | Kill switch: if any feature takes longer than 20 minutes, it is cut. The parser, the renderer, and the WP enqueue are non-negotiable; everything else is optional. |
| **Browser TTS quality is cringe** | Medium | High | Keep TTS optional in v1. Ship the visual sequence as the primary value; voice is a bonus track. If the selected voice sounds robotic, default it off and iterate post-session. |
| **WP plugin review delays distribution** | Low | Medium | The plugin is a wrapper; the core works standalone. If wp.org review takes weeks, users can still use the hosted version. Build the portable core first. |
| **Changelog parsing edge cases break the illusion** | Medium | Medium | Strict format enforcement. Do not attempt to parse every variation. Show a clear error: "Your changelog does not match the expected format. Here is an example." Dignity extends to error messages. |
| **Client-side performance on low-end devices** | Medium | Medium | Target 60fps on mid-range hardware. If the animation chokes, simplify the motion (fewer simultaneous tweens). Restraint helps performance too. |
| **SaaS hosting cost if server component added** | Low | Medium | v1 server is static-file hosting (GitHub Pages, Netlify, Cloudflare Pages). Zero compute, zero bill. Do not build a dynamic render farm. |
| **Team fractures over SaaS vs. WP priority** | Medium | High | This blueprint settles it: WP plugin is the distribution wedge; portable client core is the product. Both win. Do not reopen the debate during build. |
| **Competitor clones before moat exists** | High | Medium | Accept. v1 moat is taste and speed to ship. v2 moat requires data, network effects, or proprietary voice. You cannot defend what you have not built. |

---

## Zen Master's Closing Word

> "The strength of the team is each individual member. The strength of each member is the team."

Steve gave us the soul: the name, the taste, the gasp, the refusal to ship mediocrity. Elon gave us the physics: client-side only, no server burn, scope that fits one session. Both are right where it matters.

The board gave us the truth: a blueprint without a single compiling file is indistinguishable from a daydream. Buffett scored it 1/10. Jensen: 2/10. Oprah: 1/10. Shonda: 3/10. When four legends agree, listen.

This document is not the product. The product is the code. Build the refrigerator door. Make sure it plugs into a standard outlet. Make the screen breathe in the first hour.

Now cut the noise. Ship the feeling.
