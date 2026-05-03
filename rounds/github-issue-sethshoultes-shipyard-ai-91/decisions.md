# Locked Decisions — Build Phase Blueprint

*Synthesized by Phil Jackson, Zen Master*
*Source debates: Round 1–2 (Elon vs. Steve)*
*Essence brief: sacred dark gallery — pride, invisible labor made visible*

---

## Decision Ledger

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Static SaaS architecture** — zero backend, CDN-hosted, no auth | **Essence.md** / Implicit in Steve's vision | **Zen Master ruling** | Elon (R1, R2) proposed **WordPress plugin**: one CPT, one template, PHP renders HTML. He argued shared hosting is the real user and WordPress is the forgiveness zone. Essence.md locks "No auth. No database. One static URL. Zero knobs." Steve never specified a platform but demanded a portfolio that feels like a midnight gallery. The Zen Master rules: **static SaaS for v1**. Elon's engineering constraints (no heavy build pipeline, cap file size, no server-side state) are preserved and translated into the new architecture. WordPress plugin is a v2 expansion candidate only if organic demand forces it. |
| 2 | **Product name: Promptfolio** | Steve (R1) | **Shared** | Steve R1: "Promptfolio is the name. One word. We say it with the same finality as 'iPhone' or 'Pages.'" Elon R2: "The name is Promptfolio, full stop." Essence.md does not contradict. Locked. |
| 3 | **One sacred template, zero knobs** | Steve (R1, R2) | **Shared** | Steve R1: "NO to forty-seven themes. One perfect way to show this work." Elon R2: "One template, obsessed over, is correct. Template libraries are an admission that you have no opinion." No theme marketplace. No customizer. No settings drawer. |
| 4 | **One dark mode, no toggle** | Elon (R1) / Steve (R2) | **Shared** | Elon R1: "Build one beautiful dark template. A toggle means state, cookies, FOUC bugs." Steve R1: "No settings drawer with a dark mode toggle — dark mode should be automatic, respectful, and invisible." Steve R2: "A toggle is a confession that you could not choose." Essence.md locks "sacred dark gallery" and "one palette." Midnight gallery palette only. |
| 5 | **CUT: "Try this prompt" live widget** | Elon (R1) | **Shared** | Elon R1: "Demands API key management, rate limiting, abuse detection, billing. That's a second startup. Cut. Replace with Copy to Clipboard." Steve R2 verbatim: "Kill the 'Try this prompt' widget. I never asked for it." |
| 6 | **Single-format import: Claude JSON only for v1** | Elon (R1) | **Shared** | Elon R1: "Anthropic and OpenAI change JSON schemas quarterly. 'One-click' becomes 'one-click breakage' in 90 days. Ship Claude-only JSON import for v1." Steve R2: "Claude-only JSON import for v1 is pragmatic." No multi-format parsers in v1. |
| 7 | **One-click file drop-zone import (not manual paste)** | Steve (R1, R2) | **Shared** | Steve R2 non-negotiable: "Zero-config first 30 seconds. JSON drops in; a hero card lives. No wizard, no layout picker." The magic lives in the first 30 seconds. Single file drop-zone. No manual paste box. |
| 8 | **Client-side parsing with size cap** | Elon (R1, R2) | **Shared** | Elon R1: "PHP's json_decode on cheap shared hosting dies at 128 MB memory limits. 10x path: stream-parse or cap file size at 5 MB for v1." In static SaaS, this translates to: client-side parsing in the browser with a 5 MB upload cap and streaming/Worker fallback for edge cases. Steve R2: "Stream-parse that JSON so shared hosting doesn't choke" — principle accepted, applied to browser context. |
| 9 | **Open Graph cards are non-negotiable** | Elon (R1) | **Shared** | Elon R1: "Every portfolio must generate a stunning Open Graph card." Steve R2: "Every portfolio must be a billboard when shared on X or LinkedIn. Elon nailed this." |
| 10 | **CUT: Forced "Made with Promptfolio" footer** | Steve (R2) | **Steve** | Elon R1 proposed: "Add a 'Made with Promptfolio' footer link... The only zero-cost lever to 10,000 users." Steve R2 non-negotiable: "No adware footer. No 'Made with Promptfolio' link polluting the user's page. Their work gets the final pixel. Viral coefficient is a spreadsheet fantasy; what spreads is awe." Essence.md: pride and dignity. The Zen Master sides with Steve. Forced attribution undermines the emotional promise. Distribution must come from beauty, not graffiti. |
| 11 | **Warm, human brand voice — no corporate speak** | Steve (R1) | **Shared** | Steve R1: "Warm. Proud. Human. No 'leverage our solution.' We say: 'Your prompts deserve to be seen.'" Elon R2: "Brand voice should be warm and human; nobody shares a utility, they share a statement." |
| 12 | **Gasp-worthy aesthetic ships on day one** | Steve (R1, R2) | **Zen Master ruling** | Steve R2 non-negotiable: "The aesthetic ships on day one... If it doesn't feel expensive at first glance, we have built a commodity." Elon R2: "Taste is the multiplier. But taste as a blocker to v1 is the enemy. Ship structure first; aesthetic polish is session two." The Zen Master rules: **aesthetic ships in the single session**, but within a locked design system defined before any CSS is written. No pixel-pushing without tokens. Steve's standard is the target; Elon's schedule warning is the guardrail. |
| 13 | **No auth / no accounts / no database** | Essence.md / Elon (translated) | **Shared** | Essence.md: "No auth. No database." Elon R1 did not explicitly argue for no-auth (his WordPress proposal implies auth), but in R2 his broader philosophy is "zero marginal infrastructure." Static SaaS makes no-auth the natural state. Steve never contested. |
| 14 | **No analytics dashboards or view counters** | Elon (R1) / Steve (R1) | **Shared** | Steve R1: "NO to SEO modules, analytics dashboards, and email popups." Elon R1: "Built-in analytics: Requires DB writes and privacy headaches. Use Plausible or Fathom via one-line embed." Steve R2: "Built-in analytics should be a one-line embed, not a dashboard." |
| 15 | **No workflows / case studies taxonomies for v1** | Elon (R1) | **Elon** | Elon R1: "v1 is prompts. Full stop. Adding taxonomies before you have users is schema theater." Steve R2 defends workflows: "A prompt in isolation is a party trick. The magic is the arc." The Zen Master: Steve's instinct is correct for the product soul, but wrong for v1 scope. Workflows and case-study arcs are v2. |
| 16 | **CUT: Light mode / adaptive layout** | Elon (R1) / Steve (R2) | **Shared** | Elon R1 cut the dark mode toggle. Steve R2 agreed: "A toggle is a confession that you could not choose." Essence.md: "Zero knobs." One midnight palette. |
| 17 | **CUT: Theme builder / customizer / custom CSS panel** | Elon (R1) / Steve (R1) | **Shared** | Elon R1: "Ship one exquisite template. Two themes = twice the CSS debt." Steve R1: "No custom CSS panel. If you want to customize, you don't want Promptfolio." |
| 18 | **CUT: Onboarding wizard / tooltips / tutorial** | Steve (R1) | **Steve** | Steve R1: "NO to onboarding checklist with six steps and a progress bar. If you need a manual, we blew it." Elon never argued for onboarding. v1 has zero instructional UI beyond a single contextual helper. |
| 19 | **No React build pipeline** | Elon (R2) | **Zen Master ruling** | Elon R2 non-negotiable: "No React build pipeline. PHP renders HTML. If a feature needs npm run build, it doesn't ship in one session." However, static SaaS generation requires some build orchestration. The Zen Master interprets: **no heavy React SPA toolchain** that blocks a single-session ship. A lightweight static generator (Astro, 11ty, or vanilla Node scripts) is permitted. Next.js is too heavy for this constraint. If the builder can't deploy in one session, the framework is wrong. |
| 20 | **Base64 image extraction from exports** | Elon (R1) | **Elon (translated)** | Elon R1: "Base64 images in exports bloat everything. Decode and hand off to WordPress's native media pipeline." In static SaaS: decode base64 images from Claude exports, convert to static image files, and include them in the generated bundle. Do not render inline base64. |

---

## MVP Feature Set (What Ships in v1)

**Core Flow:**
1. Landing page with single, obvious file drop-zone for Claude conversation export JSON.
2. Client-side parser: Claude export JSON → structured prompt objects (title, body, metadata) with schema validation and graceful error messages.
3. Static generator: one sacred template (dark mode, locked typography/spacing/color) → HTML + CSS + JS bundle.
4. OG image generation: every portfolio gets a pre-rendered social card (PNG) at creation time.
5. Deployment: static files pushed to CDN → shareable URL returned to user instantly.
6. Portfolio page: sacred whitespace, typography-forward, code blocks as artifacts, each prompt framed like art in a dark gallery.

**What Is IN:**
- Single-file upload drop-zone (Claude JSON conversation export only)
- One unchangeable sacred template (dark mode, locked typography / spacing / color tokens)
- Client-side JSON parsing with progress feedback for large files
- 5 MB file size cap with graceful error messaging
- Base64 image extraction and static asset generation
- Static HTML/CSS/JS export (zero server-side rendering per request)
- OG image / social card generation (PNG, generated at build time per portfolio)
- CDN deployment with instant, anonymous URL
- Responsive layout
- Defensive parser with schema validation and human-readable error handling
- Native Web Share API + copy-link affordance on portfolio pages
- Copy-to-clipboard for individual prompts
- One-line contextual helper for export discoverability ("Claude → Settings → Data → Export")

**What Is OUT:**
- User accounts / auth / login / password resets
- Database (PostgreSQL, MySQL, MongoDB, etc.)
- WordPress plugin (v2 candidate only)
- ChatGPT / OpenAI / Gemini / Perplexity parsers
- Template marketplace / theme picker / font picker / color picker
- Light mode toggle or adaptive light layout
- "Try this prompt" live execution widget
- Onboarding tutorial / multi-step wizard / tooltips
- Settings page / admin panel / dashboard
- Manual markdown paste box (single import path only: file upload)
- Edge-rendered or per-request OG image generation
- Analytics / view counters / heatmaps
- Newsletter widgets / chatbots / SEO panels / page-builder compatibility
- Workflows / case studies / taxonomy arcs
- Forced "Made with Promptfolio" attribution footer
- Custom CSS panel or any user-facing customization

---

## File Structure (What Gets Built)

```
/promptfolio                 # Project root (name locked: see Open Question #1)
├── /src
│   ├── /parser
│   │   └── claude.js        # Claude export JSON → structured Portfolio object
│   │                        # Defensive schema validation + raw-text fallback
│   ├── /template
│   │   ├── layout.html      # Single sacred layout: dark gallery, sacred whitespace
│   │   ├── prompt-card.html # Individual prompt component (the painting on the wall)
│   │   └── styles.css       # Locked typography, spacing, color tokens (dark only)
│   ├── /generator
│   │   ├── build.js         # Orchestrates HTML + CSS + JS write to disk/bundle
│   │   └── og-image.js      # Generates OG PNG at portfolio creation time
│   └── /deploy
│       └── cdn-push.js      # Uploads static bundle to CDN, returns URL
├── /app
│   ├── index.html           # Landing page: single upload drop-zone, no nav, no settings
│   └── main.js              # Landing page logic (drop-zone, file validation, upload)
├── /public
│   └── assets               # Static assets (fonts, favicon, base CSS)
├── /lib
│   └── utils.js             # Shared utilities (UUID gen, validation helpers, base64 decode)
├── package.json             # Minimal dependencies; no React, no heavy framework
└── README.md
```

**Build Output (per portfolio):**
```
/{uuid}/
  ├── index.html              # Portfolio page
  ├── og-image.png            # Pre-generated social card
  └── assets/
      └── images/             # Extracted base64 images from export
      └── styles.css          # Minified, locked styles
```

**Framework Constraint:** No React build pipeline. No Next.js. The builder may use a lightweight static generator (Astro, 11ty, Vite with vanilla JS) or plain Node.js scripts that write HTML/CSS files to disk. The contract is: one upload → one static bundle → one CDN URL. No server-side request-time rendering. No database queries at runtime. If the chosen framework prevents a single-session ship, swap it without reopening architecture debate.

---

## Open Questions (What Still Needs Resolution)

1. **Final folder/repo name.** "Promptfolio" is the product name. The working directory in the blueprint is `/promptfolio`, but this burns README, DNS, OG metadata, and package names. Lock before the first `git init`.

2. **OG generation pipeline mechanics.** User uploads happen post-deploy, so OG images cannot be "pre-generated at build time" in the traditional static-site sense. Is this a lightweight serverless function (Vercel/Netlify edge function, Cloudflare Worker) or a container step that runs on upload? The boundary between "static SaaS" and "serverless compute" needs definition so scope does not creep into full backend infrastructure.

3. **Hosting and CDN target.** GitHub Pages is free but has build limitations. Cloudflare Pages is fast but adds DNS complexity. Vercel/Netlify have generous free tiers but introduce vendor lock-in. Which CDN serves the physics of zero-cost hosting at v1? The decision affects the `/deploy` module.

4. **Export discoverability.** Users must find their Claude export file. If they do not know how to export, the 30-second promise dies at second zero. The Zen Master leans IN on one sentence on the upload zone ("Claude → Settings → Data → Export"), zero wizard. But the exact wording and placement need final design.

5. **Parser fragility.** Claude export JSON schema is undocumented and can change without warning. If Anthropic alters the format, the parser breaks. Do we version the parser defensively and fall back to raw-text display, or accept brittle breakage and fast iteration? The fallback strategy needs to be coded, not theorized.

6. **Edit / delete / update.** No auth means no ownership. If a user regenerates, they get a new URL. Orphan URLs accumulate. Is orphan cleanup acceptable? What if a user needs to remove a portfolio containing sensitive data? A manual support channel is one answer; a time-to-live auto-purge is another. Resolve before first upload.

7. **CDN cost and storage at scale.** Static files scale horizontally, but upload-processing bandwidth and storage are not free. Is there a ceiling where we need quotas, a tipping mechanism, or cleanup policy? Not a v1 problem, but the meter starts running at portfolio #1.

8. **Aesthetic threshold — what is "gasp-worthy"?** Steve's R2 non-negotiable is that the aesthetic ships day one. The Zen Master locked "gasp-worthy" as a checklist (see Risk Register), but the exact design system (typeface, spacing scale, motion details, color hex codes) is unresolved and must be defined before CSS is written.

9. **Image handling strategy for large exports.** Claude exports may contain multiple base64-encoded images. Do we extract all images, cap the number, or skip images above a size threshold? This affects bundle size and CDN storage.

10. **Framework escape hatch.** If the chosen lightweight framework introduces friction in a one-session build, can the builder drop to vanilla Node.js file-writing without reopening the architecture debate? Define the escape hatch now: plain HTML templates + string replacement is the floor.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users can't find their Claude export** | High | Critical | Single-line contextual helper on upload zone: "Claude → Settings → Data → Export." No wizard. One sentence. If they cannot complete step 0, the funnel dies. |
| **30-second promise broken by large exports** | Medium | High | Enforce 5 MB size limit at upload with clear messaging. Async client-side processing with a minimal progress indicator. Do not block the UI. Elon's cap survives architecture translation. |
| **Claude JSON format changes without warning** | Medium | High | Defensive parser with schema validation and a raw-text fallback. If structure is unrecognized, render the conversation as plain text blocks rather than crashing. Ship fast; iterate the parser weekly if needed. |
| **Single template alienates users who want customization** | Medium | Medium | That is the thesis. Apostles, not users. If they want border-radius pickers, they are not the customer. Accept the risk. The product is a Leica, not a Swiss Army knife. |
| **OG image generation adds latency to creation flow** | Medium | Medium | Use a lightweight canvas/SVG-to-PNG pipeline (e.g., Satori, node-canvas, or Sharp). Do not use headless Chrome. Cap prompt count per portfolio to bound generation time. |
| **Organic viral loop fails without forced attribution** | Medium | High | Built-in share affordance (native Web Share API + copy-link button). If beauty is insufficient to drive shares, we lose. That is the bet. Steve's ruling stands: no adware footer. |
| **No auth = no edit/delete = support burden** | Medium | Medium | Accept orphan URLs. If a user needs removal, route through a lightweight manual support channel (e.g., email). Do not build auth infrastructure for v1. Resolve Open Question #6. |
| **Static generation pipeline complexity creeps** | High | Critical | Guardrail test: every feature proposal must answer *"Does this require a connection string, a database, an API key, or server-side state?"* If yes, it is v2. Postpone until 1,000 portfolios exist. Elon's law. |
| **CDN egress/storage costs at 10,000+ portfolios** | Low | Medium | Monitor. If reached, introduce a simple token-based upload quota or optional tipping. Not a v1 problem, but track from day one. |
| **Steve's "museum quality" standard blocks shipping** | Medium | Critical | Define "gasp-worthy" as a checklist, not a feeling: legible hierarchy, generous whitespace, refined typography, subtle motion, flawless mobile rendering. Ship structure first within the design system; aesthetic polish fills the system. A shipped beautiful thing beats a perfect imaginary thing. |
| **WordPress audience is excluded** | Medium | Medium | Acknowledged. Static SaaS abandons the 43% of web on WordPress. Elon was right about the addressable market, but the essence demands zero backend. If v1 succeeds, a WordPress plugin wrapper becomes a high-value v2 expansion. Do not chase two architectures in one session. |
| **Aesthetic-first vs ship-first tension stalls the build** | Medium | Critical | The Zen Master's ruling: aesthetics ship on day one, but within the constraints of a single session. The template is not a mood board; it is code. Define the type scale, spacing system, and dark palette as tokens before any HTML is written. No pixel-pushing without a system. |
| **Client-side browser memory limits on large JSON** | Medium | High | Cap at 5 MB. For edge cases, use Web Workers to parse off the main thread. If the file exceeds the cap, show a human-readable error suggesting export pruning. Do not attempt to parse 50 MB in a browser tab. |
| **Base64 image bloat in export files** | Medium | Medium | Extract base64 images during parsing, convert to binary files, and reference them statically. Reject inline base64 in the generated portfolio. Cap total image extraction per portfolio. |

---

## The Zen Master's Final Word

Elon brought the constraints: cap the file size, kill the widget, one session or death. Steve brought the soul: one sacred template, midnight gallery, pride over utility. Essence brought the physics: no auth, no database, one static URL, zero knobs.

The winner is the product that ships with all three.

Build the static SaaS. One upload. One URL. One sacred layout in dark mode. Zero knobs. Make it so beautiful they post screenshots at midnight. No barnacles. No parts that do not compound.

The name is **Promptfolio** — locked. The frame is **resolved** — sacred dark gallery. The feeling is **resolved** — pride. The architecture is **resolved** — static, anonymous, instant.

Move.
