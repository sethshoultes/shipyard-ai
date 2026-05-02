# Locked Decisions — Build Phase Blueprint

*Synthesized by Phil Jackson, Zen Master*
*Source debates: Round 1–2 (Elon Musk vs. Steve Jobs)*
*Essence brief: aura — sacred dark gallery*

---

## Decision Ledger

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Static SaaS architecture** — one file in, one URL out, CDN-hosted | Elon (R1) | **Elon** | Steve agreed in R1: *"We are not building a WordPress plugin."* In R2 Steve reversed and argued for WordPress, but Elon's scaling, support-ticket, and Open-Graph reliability arguments went unrefuted. Static is the only physics that supports zero marginal cost, sub-second loads, and one-session build feasibility. |
| 2 | **Zero configuration, one sacred template** | Steve (R1) | **Shared** | Steve declared *"NO to theme options"* in R1. Elon agreed in R2: *"NO to theme options — the instinct is correct."* Both locked on exactly one perfect template. No marketplace. No font picker. No color picker. |
| 3 | **Dark mode as native environment** | essence.md | **Zen Master ruling** | Steve argued for adaptive / follows-the-sun (R1, R2). Elon fought for light-only in v1 (R2). The rounds deadlocked. essence.md locks *"Sacred dark gallery. One frame."* The soul of the product is a dark room where the work breathes. v1 ships dark only. |
| 4 | **One-click import beats manual paste** | Steve (R1) | **Steve** | Elon argued for manual paste (R1) citing schema churn. Steve held firm: the 30-second promise is the soul of the product, and a paste box is a broken promise. Elon did not rebut in R2. Resolution: build a def Claude parser with validation; single upload path only. |
| 5 | **Claude import only for v1** | Elon (R1, implied) | **Shared** | Steve conceded R2: *"multi-format import is a maintenance nightmare... One perfect Claude parser, shipped with obsessive care, beats five brittle importers."* Scope pressure demands we ship the parser that exists. ChatGPT, OpenAI, Gemini exports are v2. |
| 6 | **Cut "Try this prompt" widget** | Elon (R1) | **Elon** | Steve conceded R2 verbatim: *"The 'Try this prompt' widget is a second startup disguised as a feature... Cut it. You win that round."* API keys, rate limits, abuse vectors — all liability, no love. |
| 7 | **Open Graph cards are non-negotiable** | Elon (R1) | **Shared** | Steve conceded R2: *"Open Graph cards matter... Every portfolio must be a billboard when shared on X or LinkedIn. You nailed this."* Every URL must render beautifully on social. |
| 8 | **Client-side parsing for large exports** | Elon (R1, R2) | **Elon** | Steve conceded R2: *"I also concede that client-side parsing is the right solve for the 10MB JSON problem."* Keeps heavy lifting off cheap hosting and eliminates server-side timeout risk. |
| 9 | **Quiet confidence brand voice** | Steve (R1) | **Steve** | Elon conceded R2: *"The brand voice — quiet confidence, no exclamation points — is exactly right for the audience. And the emotional hook is correct."* |
| 10 | **Gasp-worthy design quality** | Steve (R1) | **Steve** | Elon conceded R2: *"If the output portfolio doesn't make someone gasp, nothing else matters. Steve is absolutely right about that."* |

---

## MVP Feature Set (What Ships in v1)

**Core Flow:**
1. Landing page with single, obvious upload drop-zone for Claude conversation export JSON.
2. Parser: Claude export JSON → structured prompt objects (title, body, metadata) with schema validation.
3. Static generator: one sacred template (dark mode only) → HTML + CSS bundle.
4. Deployment: static files pushed to CDN → shareable URL returned to user.
5. Portfolio page: sacred whitespace, typography-forward, code blocks as artifacts, each prompt framed like art.
6. OG image generation: every portfolio gets a social card that renders perfectly on X / LinkedIn.

**What Is IN:**
- Single-file upload (Claude JSON conversation export only)
- One unchangeable template (dark mode, locked typography / spacing / color)
- Static HTML/CSS export
- OG image / social card generation
- CDN deployment with instant URL
- Responsive layout
- Defensive parser with graceful error handling
- Client-side parsing of the JSON payload

**What Is OUT:**
- User accounts / auth / database
- WordPress plugin
- ChatGPT / OpenAI / Gemini parsers
- Template marketplace / theme picker / font picker / color picker
- Light mode toggle or adaptive light layout
- "Try this prompt" widget
- Onboarding tutorial / multi-step wizard
- Settings page / admin panel
- Manual markdown/JSON paste (single import path only)
- Edge-rendered or per-request OG image generation
- Newsletter widgets / chatbots / SEO panels / page-builder compatibility

---

## File Structure (What Gets Built)

```
/promptfolio                  # Project root (working title; see Open Question #1)
├── /src
│   ├── /parser
│   │   └── claude.ts         # Claude export JSON → structured Portfolio object
│   ├── /template
│   │   ├── layout.tsx        # Single sacred layout: dark mode, sacred whitespace
│   │   ├── prompt-card.tsx   # Individual prompt component (the painting)
│   │   └── styles.css        # Locked typography, spacing, color tokens
│   ├── /generator
│   │   ├── static-export.ts  # Orchestrates HTML + CSS write to disk
│   │   └── og-image.ts       # Generates OG PNG at creation time
│   └── /deploy
│       └── cdn-push.ts       # Uploads static bundle to CDN
├── /app
│   ├── page.tsx              # Landing page: single upload drop-zone
│   └── layout.tsx            # Root layout (no settings, no navigation)
├── /public
│   └── assets                # Static assets (fonts, favicon)
├── /lib
│   └── utils.ts              # Shared utilities
├── next.config.js            # Static export configuration
├── tailwind.config.ts        # Locked design tokens (dark only)
└── package.json
```

**Build Output (per portfolio):**
```
/{uuid}/
  ├── index.html              # Portfolio page
  ├── og-image.png            # Pre-generated social card
  └── assets/
      └── styles.css          # Minified, locked styles
```

*Note: Next.js is the assumed static-export framework in this blueprint. If the builder finds a lighter static generator that still serves the OG pipeline, the folder names may shift, but the contract remains: one upload → one static bundle → one URL.*

---

## Open Questions (What Still Needs Resolution)

1. **Shipping name.** Steve argued *Folio* (permanent, one word, elegant). Elon argued *Promptfolio* (self-explanatory, fuses identity). essence.md distills the soul as *Aura*. None of the three names was conceded in debate. A rename burns README, DNS, OG metadata, and package names. Lock before the first commit.
2. **OG generation pipeline mechanics.** Since user uploads happen post-deploy, "pre-generate at build time" is impossible unless we run a micro-build pipeline on upload. Is this a lightweight serverless function (e.g., Vercel/Netlify function) or a container step? The boundary between "static SaaS" and "serverless compute" needs definition so scope doesn't creep.
3. **Export discoverability.** Users must find their Claude export file. If they don't know how to export, the 30-second promise dies at second 0. Do we add a single-line contextual helper on the upload zone ("Settings → Data → Export") or is that a manual / out-of-scope?
4. **Parser fragility.** Claude export JSON schema is undocumented and can change. If Anthropic alters the format, the parser breaks. Do we version the parser defensively and fall back to raw-text display, or accept brittle breakage?
5. **Edit / delete / update.** No auth means no ownership. If a user regenerates, they get a new URL. Is orphan cleanup acceptable? What if they need to remove a portfolio? A manual support channel is one answer; a time-to-live purge is another.
6. **CDN cost and storage at scale.** Static files scale, but upload-processing bandwidth and storage aren't free. Is there a ceiling where we need quotas, a tipping mechanism, or cleanup policy? Not a v1 problem, but the meter is running.
7. **Framework lock.** The blueprint assumes Next.js. Elon argued static-generator generically. If Next.js static export introduces friction in a one-session build, can the builder swap to 11ty, Astro, or plain Vite without reopening architecture debate?

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users can't find their Claude export** | High | Critical | Single-line contextual helper on upload zone pointing to Settings → Data → Export. No wizard. One sentence. |
| **30-second promise broken by large exports** | Medium | High | Size limit enforced at upload (e.g., 50MB max). Async processing with progress indicator if edge case exceeds threshold. |
| **Single template alienates users who want customization** | Medium | Medium | That is the thesis. Apostles, not users. If they want customization, they are not the customer. Accept the risk. |
| **Claude JSON format changes** | Medium | High | Defensive parser with schema validation and graceful error message. Fallback to raw text display if structure unrecognized. |
| **OG image generation adds latency to creation** | Medium | Medium | Use lightweight canvas/SVG-to-PNG pipeline (not headless Chrome). Cap prompt count per portfolio. |
| **Organic viral loop fails without forced attribution** | Medium | High | Built-in share affordance (native Web Share API + copy-link) but no forced watermark. If beauty is insufficient, we lose. That is the bet. |
| **No auth = no edit/delete = support burden** | Medium | Medium | Accept orphan URLs. If user needs removal, manual support channel. Do not build auth for v1. |
| **Static generation pipeline complexity creeps** | High | Critical | Guardrail: every feature proposal must answer *"Does this require a connection string, a database, or an API key?"* If yes, it is v2. |
| **CDN costs at 10,000+ portfolios** | Low | Medium | Monitor. If reached, introduce simple token-based upload or tipping. Not a v1 problem. |
| **Naming deadlock delays ship date** | Low | Medium | Batch the rename in one commit. Do not interleave with feature work. If no consensus, ship as Promptfolio and rebrand to Aura in v2. |

---

## The Zen Master's Final Word

Elon brought the constraints. Steve brought the soul. The winner is the product that ships with both.

Build the static SaaS. One upload. One URL. One sacred layout in dark mode. Zero knobs. Make it so beautiful they post screenshots at midnight. No barnacles. No parts that do not compound.

The name is unresolved—lock it before you move. The frame is resolved—sacred dark gallery. The feeling is resolved—pride.

*The best system is the one that lets the work breathe.*

Move.
