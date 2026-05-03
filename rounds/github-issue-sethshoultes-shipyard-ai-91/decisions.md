# Locked Decisions — Build Phase Blueprint

*Synthesized by Phil Jackson, Zen Master*
*Source debates: Round 1–2 (Elon Musk vs. Steve Jobs)*
*Essence brief: aura — sacred dark gallery*

---

## Decision Ledger

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Static SaaS architecture** — one file in, one static bundle out, CDN-hosted | Elon (R1) | **Zen Master ruling** | Steve held WordPress as a top non-negotiable in R2 ("WordPress as the primary vehicle"). Elon's physics argument — zero marginal cost, no PHP version hell, no plugin conflicts, no support tickets scaling linearly with installs — is unrefuted and existential for a one-session build. For v1, we ship static. WordPress is a v2 expansion only if organic demand forces it. |
| 2 | **Zero configuration, one sacred template** | Steve (R1) | **Shared** | Steve declared "NO to theme panels with 400 options" and "NO to template libraries" in R1. Elon agreed in R2 verbatim: "One template, obsessed over, is correct. Template libraries are an admission that you have no opinion." Zero knobs. Zero theme marketplace. |
| 3 | **Dark mode as native environment** | Elon (R1) / essence.md | **Zen Master ruling** | Elon argued for one dark template (R1: "Build one dark template that actually looks good"). Steve argued against dark mode as a toggled feature, wanting it to "work in any light" (R1). In R2, Elon said: "Steve is also right about dark mode. One beautiful mode is enough." Both agree on *one* mode; essence.md locks the soul as "sacred dark gallery." v1 ships dark only. No toggle. No adaptive light layout. |
| 4 | **CUT: "Try this prompt" widget** | Elon (R1) | **Elon** | Steve conceded in R2 verbatim: "The 'Try this prompt' widget is a second startup. Cut it immediately." API keys, rate limits, abuse vectors, and inference burn ($300+/month at scale) — all liability, no love. |
| 5 | **One-click file upload (not manual paste)** | Steve (R1, R2) | **Zen Master ruling** | Steve held one-click import as non-negotiable in R2 ("One-click ChatGPT JSON import. Manual paste is a friction wall that kills activation"). Elon argued manual paste (R1/R2) citing schema churn. Resolution: a single file drop-zone. One click = select file. Client-side parsing handles the payload. The paste box is retired. |
| 6 | **Single-format import: Claude JSON only for v1** | Elon (R1, implied) | **Zen Master ruling** | Steve conceded multi-format is a maintenance nightmare in R2 ("Ship one perfect parser, validate, then expand") but argued OpenAI/ChatGPT is the 80/20 format. Elon argued: "Ship the parser that exists." The builder has Claude export context today. Building a new ChatGPT parser risks a second session. Zen Master locks Claude JSON as the v1 path. ChatGPT / OpenAI / Gemini / Perplexity exports are v2. |
| 7 | **Client-side parsing for large exports** | Elon (R1, R2) | **Elon** | Elon's physics argument — 10MB+ JSON blobs, cheap hosting timeouts, 30-second PHP limits — went unrefuted across both rounds. Steve did not contest this mechanism in R2. The browser does the heavy lifting via Web Workers or async parsing. |
| 8 | **Open Graph cards are non-negotiable** | Elon (R1) | **Shared** | Steve conceded in R2: "Distribution is shareability, not directory placement. Every portfolio must be a billboard when shared on X or LinkedIn. Elon nailed this." Every portfolio URL must render a stunning social card. |
| 9 | **Quiet confidence brand voice** | Steve (R1) | **Shared** | Elon conceded in R2: "'Show your work' is the exact voice — no adverbs, no 'unlock potential.' And the emotional hook is dead-on: users share what makes them look exceptional." No exclamation points. No "unlock your potential." |
| 10 | **Gasp-worthy design quality** | Steve (R1) | **Shared** | Elon conceded in R2 verbatim: "If the output portfolio doesn't make someone gasp, nothing else matters. Steve is absolutely right about that." Aesthetics is not lipstick; for a portfolio, it *is* the product. |
| 11 | **No auth / no accounts / no database** | Elon (R1) | **Elon** | Steve never contested this. Elon cut it in R1: "Adding auth means password resets, email verification, and GDPR headaches. Skip it for v1." v1 is public-by-default, anonymous-by-design. |
| 12 | **No analytics or view counters** | Elon (R1) | **Elon** | Steve conceded in R2: "Analytics and view counters are vanity infrastructure — agree completely." Users embed Plausible or Google Analytics if they care. We do not build metrics infrastructure. |
| 13 | **No workflows / case studies taxonomies for v1** | Elon (R1) | **Zen Master ruling** | Steve defended workflows in R2: "Workflows are not 'taxonomy theater.' A prompt in isolation is a party trick. The magic is the arc." Elon called it "v2 taxonomy theater." Zen Master ruling: Steve's instinct is correct for the product soul, but wrong for v1 scope. v1 ships prompts only. Workflows and narrative arcs are v2. |

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
- Static HTML/CSS/JS export (zero server-side rendering per request)
- OG image / social card generation (PNG, generated at build time per portfolio)
- CDN deployment with instant, anonymous URL
- Responsive layout
- Defensive parser with schema validation and human-readable error handling
- Native Web Share API + copy-link affordance on portfolio pages

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

---

## File Structure (What Gets Built)

```
/promptfolio                  # Working title (see Open Question #1)
├── /src
│   ├── /parser
│   │   └── claude.ts         # Claude export JSON → structured Portfolio object
│   │                         # Defensive schema validation + graceful fallback
│   ├── /template
│   │   ├── layout.tsx        # Single sacred layout: dark gallery, sacred whitespace
│   │   ├── prompt-card.tsx   # Individual prompt component (the painting on the wall)
│   │   └── styles.css        # Locked typography, spacing, color tokens (dark only)
│   ├── /generator
│   │   ├── static-export.ts  # Orchestrates HTML + CSS + JS write to disk/bundle
│   │   └── og-image.ts       # Generates OG PNG at portfolio creation time
│   └── /deploy
│       └── cdn-push.ts       # Uploads static bundle to CDN, returns URL
├── /app
│   ├── page.tsx              # Landing page: single upload drop-zone, no nav, no settings
│   └── layout.tsx            # Root layout (no auth gate, no admin bar)
├── /public
│   └── assets                # Static assets (fonts, favicon, base CSS)
├── /lib
│   └── utils.ts              # Shared utilities (UUID gen, validation helpers)
├── next.config.js            # Static export configuration (or equivalent)
├── tailwind.config.ts        # Locked design tokens (dark palette only)
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

*Framework note: The blueprint assumes a static-export-capable framework (Next.js, Astro, Vite + SSR, or 11ty). The builder may swap the specific framework without reopening architecture debate, provided the contract holds: one upload → one static bundle → one CDN URL. No server-side request-time rendering. No database queries at runtime.*

---

## Open Questions (What Still Needs Resolution)

1. **Shipping name.** Steve argued for a one-word permanent name (Folio, Stage, Show). Elon argued Promptfolio is descriptive, searchable, and domain-available enough; rename after product-market fit. essence.md distills the soul as *Aura*. None conceded. This burns README, DNS, OG metadata, package names, and folder paths. Lock before the first `git init`.
2. **OG generation pipeline mechanics.** User uploads happen post-deploy, so OG images cannot be "pre-generated at build time" in the traditional sense. Is this a lightweight serverless function (Vercel/Netlify edge function, Cloudflare Worker) or a container step that runs on upload? The boundary between "static SaaS" and "serverless compute" needs definition so scope does not creep into full backend infrastructure.
3. **Hosting and CDN target.** GitHub Pages is free but has build limitations. Cloudflare Pages is fast but adds DNS complexity. Vercel/Netlify have generous free tiers but introduce vendor lock-in. Which CDN serves the physics of zero-cost hosting at v1?
4. **Export discoverability.** Users must find their Claude export file. If they do not know how to export, the 30-second promise dies at second zero. Do we add a single-line contextual helper on the upload zone ("Claude → Settings → Data → Export") or is that out-of-scope documentation?
5. **Parser fragility.** Claude export JSON schema is undocumented and can change without warning. If Anthropic alters the format, the parser breaks. Do we version the parser defensively and fall back to raw-text display, or accept brittle breakage and fast iteration?
6. **Edit / delete / update.** No auth means no ownership. If a user regenerates, they get a new URL. Orphan URLs accumulate. Is orphan cleanup acceptable? What if a user needs to remove a portfolio containing sensitive data? A manual support channel is one answer; a time-to-live auto-purge is another.
7. **CDN cost and storage at scale.** Static files scale horizontally, but upload-processing bandwidth and storage are not free. Is there a ceiling where we need quotas, a tipping mechanism, or cleanup policy? Not a v1 problem, but the meter starts running at portfolio #1.
8. **Framework lock.** If the chosen static-export framework introduces friction in a one-session build, can the builder swap to a lighter alternative without reopening the architecture debate? Define the escape hatch now.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users can't find their Claude export** | High | Critical | Single-line contextual helper on upload zone: "Claude → Settings → Data → Export." No wizard. One sentence. If they cannot complete step 0, the funnel dies. |
| **30-second promise broken by large exports** | Medium | High | Enforce size limit at upload (e.g., 50MB max). Async client-side processing with a minimal progress indicator if edge case exceeds visual threshold. Do not block the UI. |
| **Claude JSON format changes without warning** | Medium | High | Defensive parser with schema validation and a raw-text fallback. If structure is unrecognized, render the conversation as plain text blocks rather than crashing. Ship fast; iterate the parser weekly if needed. |
| **Single template alienates users who want customization** | Medium | Medium | That is the thesis. Apostles, not users. If they want border-radius pickers, they are not the customer. Accept the risk. The product is a Leica, not a Swiss Army knife. |
| **OG image generation adds latency to creation flow** | Medium | Medium | Use a lightweight canvas/SVG-to-PNG pipeline (e.g., Satori, node-canvas, or Sharp). Do not use headless Chrome. Cap prompt count per portfolio to bound generation time. |
| **Organic viral loop fails without forced attribution** | Medium | High | Built-in share affordance (native Web Share API + copy-link button) but no forced watermark or "Made with" footer. If beauty is insufficient to drive shares, we lose. That is the bet. |
| **No auth = no edit/delete = support burden** | Medium | Medium | Accept orphan URLs. If a user needs removal, route through a lightweight manual support channel (e.g., email). Do not build auth infrastructure for v1. |
| **Static generation pipeline complexity creeps** | High | Critical | Guardrail test: every feature proposal must answer *"Does this require a connection string, a database, an API key, or server-side state?"* If yes, it is v2. Postpone until 1,000 portfolios exist. |
| **CDN egress/storage costs at 10,000+ portfolios** | Low | Medium | Monitor. If reached, introduce a simple token-based upload quota or optional tipping. Not a v1 problem, but track from day one. |
| **Naming deadlock delays ship date** | Low | Medium | Batch the rename in one commit. Do not interleave with feature work. If no consensus by first commit, ship as working title and rebrand in v2. Bikeshedding is not a feature. |
| **Steve's "museum quality" standard blocks shipping** | Medium | Critical | Define "gasp-worthy" as a checklist, not a feeling: legible hierarchy, generous whitespace, refined typography, subtle motion, flawless mobile rendering. Ship structure first; aesthetic polish is session two. A shipped beautiful thing beats a perfect imaginary thing. |
| **WordPress audience is excluded** | Medium | Medium | Acknowledged. Static SaaS abandons the 43% of web on WordPress. If v1 succeeds, a WordPress plugin wrapper becomes a high-value v2 expansion. Do not chase two architectures in one session. |

---

## The Zen Master's Final Word

Elon brought the constraints. Steve brought the soul. The winner is the product that ships with both.

Build the static SaaS. One upload. One URL. One sacred layout in dark mode. Zero knobs. Make it so beautiful they post screenshots at midnight. No barnacles. No parts that do not compound.

The name is unresolved — lock it before you move. The frame is resolved — sacred dark gallery. The feeling is resolved — pride.

*The best system is the one that lets the work breathe.*

Move.
