# Locked Decisions — Build Phase Blueprint

*Synthesized by Phil Jackson, Zen Master*
*Source debates: Round 1–2 (Elon Musk vs. Steve Jobs)*
*Essence brief: aura — sacred dark gallery*

---

## Decision Ledger

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Static SaaS architecture** — one file in, one URL out, CDN-hosted | Elon (R1) | **Elon** | Steve conceded in R2 that "one agent session cannot build a plugin empire." In R1, Steve himself declared: "We are not building a WordPress plugin." Elon's static-export + CDN argument for instant loads and zero support tickets went unrefuted. |
| 2 | **Product name: Promptfolio** | Steve (R1) | **Steve** | Elon conceded R2 verbatim: *"'Promptfolio' is the right name; it fuses identity instantly."* No further objection. |
| 3 | **One sacred template, zero knobs** | Steve (R1) | **Steve** (with Elon concurrence) | Steve declared "NO to theme options" in R1. Elon agreed in R2: *"NO to theme options — the instinct is correct."* Both locked on exactly one perfect template. No marketplace. No font picker. No color picker. |
| 4 | **Dark mode as native environment** | Steve (R1) | **Steve** (essence.md confirms) | Elon fought for light-theme-only in v1 (R1, R2). Steve rebutted R2: *"Dark mode is not a feature—it is the native environment."* The rounds deadlocked, but essence.md locks *"Sacred dark gallery. One frame."* Design authority prevails; v1 ships dark only. |
| 5 | **One-click import beats manual paste** | Steve (R1) | **Steve** | Elon argued for manual paste (R1/R2) citing schema churn. Steve held firm: *"One-click import. The product lives or dies in the first thirty seconds."* The 30-second promise is the soul of the product; a manual paste is a broken promise. Resolution: build a def Claude parser with validation. |
| 6 | **Claude import only for v1** | Elon (R1, implied) | **Elon** | Steve only ever argued for Claude import; other parsers were never defended. Scope pressure demands we ship the parser that exists. ChatGPT, OpenAI, Gemini exports are v2. |
| 7 | **Cut "Try this prompt" widget** | Elon (R1) | **Elon** | Steve conceded R2: *"The 'Try this prompt' widget is scope creep dressed as innovation. Cut it. He is right."* API keys, rate limits, abuse vectors — all liability, no love. |
| 8 | **Open Graph cards are non-negotiable** | Elon (R1) | **Shared** | Steve conceded R2: *"He is also right that every portfolio must be a billboard: Open Graph cards are non-negotiable."* Every URL must render beautifully on X and LinkedIn. |
| 9 | **Quiet confidence brand voice** | Steve (R1) | **Steve** | Elon conceded R2: *"The brand voice — quiet confidence, no exclamation points — is exactly right for the audience. And the emotional hook is correct."* |
| 10 | **Gasp-worthy design quality** | Steve (R1) | **Steve** | Elon conceded R2: *"If the output portfolio doesn't make someone gasp, nothing else matters. Steve is absolutely right about that."* |
| 11 | **No WordPress plugin for v1** | Elon (R1) | **Shared convergence** | Steve said in R1: *"We are not building a WordPress plugin."* Both agree. PHP, shared hosting, and wp-admin are out of scope. |

---

## MVP Feature Set (What Ships in v1)

**Core Flow:**
1. Landing page with single, obvious upload drop-zone for Claude conversation export JSON.
2. Parser: Claude export JSON → structured prompt objects (title, body, metadata) with schema validation.
3. Static generator: one sacred template (dark mode only) → HTML + CSS.
4. Deployment: static files pushed to CDN → shareable URL returned to user.
5. Portfolio page: sacred whitespace, typography-forward, code blocks as artifacts, each prompt framed like art.
6. OG image generation: every portfolio gets a social card that renders perfectly on X/LinkedIn.

**What Is IN:**
- Single-file upload (Claude JSON conversation export only)
- One unchangeable template (dark mode, locked typography/spacing/color)
- Static HTML/CSS export
- OG image / social card generation
- CDN deployment with instant URL
- Responsive layout
- Defensive parser with graceful error handling

**What Is OUT:**
- User accounts / auth / database
- WordPress plugin
- ChatGPT / OpenAI / Gemini parsers
- Template marketplace / theme picker / font picker / color picker
- Light mode toggle
- "Try this prompt" widget
- Onboarding tutorial / multi-step wizard
- Settings page / admin panel
- Manual markdown/JSON paste (single import path only)
- Edge-rendered or per-request OG image generation
- Newsletter widgets / chatbots / SEO panels / page-builder compatibility

---

## File Structure (What Gets Built)

```
/promptfolio                  # Project root
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

---

## Open Questions (What Still Needs Resolution)

1. **Aura vs. Promptfolio naming.** The debates locked on Promptfolio (Steve proposed; Elon conceded). essence.md distills the product as *Aura*. Does the repo rename to Aura before v1, or is Aura the internal codename / v2 rebrand? A rename burns README, DNS, and pipeline updates.
2. **OG generation at creation time vs. true static.** Since user uploads happen post-deploy, "pre-generate at build time" is impossible unless we run a micro-build pipeline on upload. Is this a lightweight serverless step or a container? The boundary between "static SaaS" and "serverless function" needs definition.
3. **One-click import affordance.** Users must find their Claude export file. If they don't know how to export, the 30-second promise dies at second 0. Do we add a single-line helper text ("Export: Settings → Data → Export") or is that a manual?
4. **Parser fragility.** Claude export JSON schema is undocumented and can change. If Anthropic alters the format, the parser breaks. Do we version the parser defensively and fall back to raw-text display?
5. **Edit / delete / update.** No auth means no ownership. If a user regenerates, they get a new URL. Is orphan cleanup acceptable? What if they need to remove a portfolio?
6. **CDN cost and storage at scale.** Static files scale, but upload-processing bandwidth and storage aren't free. Is there a ceiling where we need quotas or a tipping mechanism?
7. **Framework lock.** Elon mentioned Next.js or 11ty; the file structure above assumes Next.js. Is this locked, or should the builder choose the fastest static-export framework?

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users can't find their Claude export** | High | Critical | Single-line contextual helper on upload zone. No wizard. One sentence pointing to Settings → Data → Export. |
| **30-second promise broken by large exports** | Medium | High | Size limit enforced at upload (e.g., 50MB max). Async processing with progress indicator if edge case exceeds threshold. |
| **Single template alienates users who want customization** | Medium | Medium | That is the thesis. Apostles, not users. If they want customization, they are not the customer. Accept the risk. |
| **Claude JSON format changes** | Medium | High | Defensive parser with schema validation and graceful error message. Fallback to raw text display if structure unrecognized. |
| **OG image generation adds latency to creation** | Medium | Medium | Use lightweight canvas/SVG-to-PNG pipeline (not headless Chrome). Cap prompt count per portfolio. |
| **Organic viral loop fails without forced attribution** | Medium | High | Build-in share affordance (native Web Share API + copy-link) but no forced watermark. If beauty is insufficient, we lose. That is the bet. |
| **No auth = no edit/delete = support burden** | Medium | Medium | Accept orphan URLs. If user needs removal, manual support channel. Do not build auth for v1. |
| **Static generation pipeline complexity creeps** | High | Critical | Guardrail: every feature proposal must answer *"Does this require a connection string, a database, or an API key?"* If yes, it is v2. |
| **CDN costs at 10,000+ portfolios** | Low | Medium | Monitor. If reached, introduce simple token-based upload or tipping. Not a v1 problem. |
| **Rebranding to Aura delays ship date** | Low | Medium | Batch all rename operations in one 30-minute commit. Do not interleave with feature work. |

---

## The Zen Master's Final Word

Elon brought the constraints. Steve brought the soul. The winner is the product that ships with both.

Build the static SaaS. One upload. One URL. One sacred layout in dark mode. Call it Promptfolio (Aura if you must rename, but batch it). Make it so beautiful they post screenshots at midnight. No barnacles. No parts that do not compound.

*The best system is the one that lets the work breathe.*

Move.
