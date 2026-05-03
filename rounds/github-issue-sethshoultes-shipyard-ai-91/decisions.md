# Locked Decisions — Build Phase Blueprint

*Synthesized by Phil Jackson, Zen Master*
*Source debates: Round 1–2 (Elon vs. Steve)*
*Essence brief: sacred dark gallery — pride, invisible labor made visible*

---

## Decision Ledger

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Static SaaS architecture** — zero backend, CDN-hosted | Elon (R1) | **Elon** | Elon: "Kill the WordPress angle. Build a static site generator." (R1). Steve in R2 concedes static generation is "the right physics" but argues for a WordPress wrapper as a distribution vehicle. The Zen Master locks static SaaS for v1; WordPress wrapper is a v2 expansion only if organic demand forces it. |
| 2 | **One sacred template, zero knobs** | Steve (R1) | **Shared** | Steve: "NO to twenty mediocre themes. There is one perfect way to show this work." (R1). Elon in R2: "One template, obsessed over, is correct. Template libraries are an admission that you have no opinion." Zero theme marketplace. Zero customizer. |
| 3 | **One dark mode, no toggle** | Elon (R1) / Steve (R2) | **Shared** | Elon R1: "Build one dark template that actually looks good... A toggle means state, cookies, FOUC bugs." Steve R2: "One dark mode that looks like a dimmed gallery at midnight — not inverted colors... We agree: no toggle. One midnight palette. Period." Essence.md locks "sacred dark gallery." |
| 4 | **CUT: "Try this prompt" live widget** | Elon (R1) | **Shared** | Elon R1: "Demands API key management, rate limiting, abuse detection, billing. That's a second startup. Cut." Steve R2 verbatim: "Cut the 'Try this prompt' widget. I never asked for it." |
| 5 | **One-click file drop-zone import (not manual paste)** | Steve (R1, R2) | **Steve** | Steve R2 non-negotiable: "One-click ChatGPT JSON import. Manual paste is a friction wall that kills activation." Elon argued manual paste citing schema churn. Zen Master rules: the magic lives in the first 30 seconds. Single file drop-zone. Paste box is retired. |
| 6 | **Single-format import: Claude JSON only for v1** | Elon (R1) | **Zen Master ruling** | Steve wanted Claude + ChatGPT "done flawlessly" (R1, R2). Elon warned multi-format parsers are brittle maintenance nightmares. Resolution: v1 ships Claude JSON only, because that is the format the builder has context for today. ChatGPT / OpenAI / Gemini / Perplexity are v2. |
| 7 | **Client-side parsing for large exports** | Elon (R1, R2) | **Shared** | Elon: "10MB+ JSON blobs... client-side parsing with Web Workers + static generation." Steve R2: "Client-side parsing with Web Workers is the right physics." No contest across rounds. |
| 8 | **Open Graph cards are non-negotiable** | Elon (R1) | **Shared** | Elon R1: "Every portfolio carries a 'Made with...' footer and generates stunning Open Graph cards." Steve R2: "Every portfolio must be a billboard when shared on X or LinkedIn. Elon nailed this." |
| 9 | **Warm, human brand voice — no corporate speak** | Steve (R1) | **Shared** | Steve: "Warm. Proud. Human. No 'leverage our solution.' We say: 'Your prompts deserve to be seen.'" Elon R2: "Brand voice should be warm and human; nobody shares a utility, they share a statement." |
| 10 | **Gasp-worthy aesthetic ships on day one** | Steve (R1, R2) | **Shared** | Steve R2 non-negotiable: "The aesthetic ships on day one... If it doesn't feel expensive at first glance, we have built a commodity." Elon R2: "Taste is the multiplier. One exceptional dark template... will outperform ten mediocre themes by orders of magnitude." |
| 11 | **No auth / no accounts / no database** | Elon (R1) | **Shared** | Elon R1: "Adding auth means password resets, email verification, and GDPR headaches. Skip it for v1." Steve never contested. Essence.md: "No auth. No database." |
| 12 | **No analytics dashboards or view counters** | Elon (R1) / Steve (R1) | **Shared** | Steve R1: "NO to SEO modules, analytics dashboards, and email popups." Elon R1: "Requires DB writes and infrastructure. Use Plausible via embed." Steve R2: "Analytics and view counters are vanity infrastructure — agree completely." |
| 13 | **No workflows / case studies taxonomies for v1** | Elon (R1) | **Zen Master ruling** | Elon R1: "v1 is prompts. Full stop. Adding taxonomies before you have users is schema theater." Steve R2 defends workflows: "A prompt in isolation is a party trick. The magic is the arc." Zen Master: Steve's instinct is correct for the product soul, but wrong for v1 scope. Workflows are v2. |
| 14 | **CUT: Light mode / adaptive layout** | Elon (R1) / Steve (R2) | **Shared** | Elon R1 cut the dark mode toggle. Steve R2 agreed: "A toggle is a confession that you could not choose." Essence.md: "Zero knobs." |
| 15 | **CUT: Theme builder / customizer** | Elon (R1) / Steve (R1) | **Shared** | Elon R1: "Ship one exquisite template. Two themes = twice the CSS debt." Steve R1: "NO to settings panels that require a tutorial." |
| 16 | **CUT: Built-in analytics** | Elon (R1) | **Shared** | See #12. |
| 17 | **CUT: Onboarding wizard / tooltips / tutorial** | Steve (R1) | **Steve** | Steve R1: "NO to settings panels that require a tutorial. If you need a manual, we blew it." Elon never argued for onboarding. v1 has zero instructional UI beyond a single contextual helper. |

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
- Forced "Made with..." attribution footer (debatable; see Open Question #3)

---

## File Structure (What Gets Built)

```
/folio                        # Working directory (name TBD; see Open Question #1)
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

1. **Shipping name.** Steve argued for a one-word permanent name: **Folio** (R1, R2 non-negotiable). Elon argued **Promptfolio** is descriptive, searchable, and domain-available; rename after product-market fit (R2). Essence.md distills the soul as *Aura*. None conceded. This burns README, DNS, OG metadata, package names, and folder paths. **Lock before the first `git init`.**

2. **OG generation pipeline mechanics.** User uploads happen post-deploy, so OG images cannot be "pre-generated at build time" in the traditional static-site sense. Is this a lightweight serverless function (Vercel/Netlify edge function, Cloudflare Worker) or a container step that runs on upload? The boundary between "static SaaS" and "serverless compute" needs definition so scope does not creep into full backend infrastructure.

3. **Forced attribution footer.** Elon R1 proposed: "Every portfolio carries a 'Made with Promptfolio' footer." Steve never addressed this. Is a subtle branded watermark required for the viral loop, or does it violate the "proudly sign your name to" promise? If the footer exists, must it be removable? This is a product-ethics and distribution question, not a technical one.

4. **Hosting and CDN target.** GitHub Pages is free but has build limitations. Cloudflare Pages is fast but adds DNS complexity. Vercel/Netlify have generous free tiers but introduce vendor lock-in. Which CDN serves the physics of zero-cost hosting at v1?

5. **Export discoverability.** Users must find their Claude export file. If they do not know how to export, the 30-second promise dies at second zero. Do we add the single-line contextual helper on the upload zone ("Claude → Settings → Data → Export") or is that out-of-scope documentation? The Zen Master leans IN on one sentence, zero wizard.

6. **Parser fragility.** Claude export JSON schema is undocumented and can change without warning. If Anthropic alters the format, the parser breaks. Do we version the parser defensively and fall back to raw-text display, or accept brittle breakage and fast iteration?

7. **Edit / delete / update.** No auth means no ownership. If a user regenerates, they get a new URL. Orphan URLs accumulate. Is orphan cleanup acceptable? What if a user needs to remove a portfolio containing sensitive data? A manual support channel is one answer; a time-to-live auto-purge is another.

8. **CDN cost and storage at scale.** Static files scale horizontally, but upload-processing bandwidth and storage are not free. Is there a ceiling where we need quotas, a tipping mechanism, or cleanup policy? Not a v1 problem, but the meter starts running at portfolio #1.

9. **Framework escape hatch.** If the chosen static-export framework introduces friction in a one-session build, can the builder swap to a lighter alternative without reopening the architecture debate? Define the escape hatch now.

10. **Aesthetic threshold — what is "gasp-worthy"?** Steve's R2 non-negotiable is that the aesthetic ships day one. Elon argues "ship structure first; aesthetic polish is session two." The Zen Master locked "gasp-worthy" as a checklist (see Risk Register), but the exact design system (typeface, spacing scale, motion details) is unresolved and must be defined before CSS is written.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users can't find their Claude export** | High | Critical | Single-line contextual helper on upload zone: "Claude → Settings → Data → Export." No wizard. One sentence. If they cannot complete step 0, the funnel dies. |
| **30-second promise broken by large exports** | Medium | High | Enforce size limit at upload (e.g., 50MB max). Async client-side processing with a minimal progress indicator if edge case exceeds visual threshold. Do not block the UI. |
| **Claude JSON format changes without warning** | Medium | High | Defensive parser with schema validation and a raw-text fallback. If structure is unrecognized, render the conversation as plain text blocks rather than crashing. Ship fast; iterate the parser weekly if needed. |
| **Single template alienates users who want customization** | Medium | Medium | That is the thesis. Apostles, not users. If they want border-radius pickers, they are not the customer. Accept the risk. The product is a Leica, not a Swiss Army knife. |
| **OG image generation adds latency to creation flow** | Medium | Medium | Use a lightweight canvas/SVG-to-PNG pipeline (e.g., Satori, node-canvas, or Sharp). Do not use headless Chrome. Cap prompt count per portfolio to bound generation time. |
| **Organic viral loop fails without forced attribution** | Medium | High | Built-in share affordance (native Web Share API + copy-link button). If beauty is insufficient to drive shares, we lose. That is the bet. Resolve Open Question #3 before ship. |
| **No auth = no edit/delete = support burden** | Medium | Medium | Accept orphan URLs. If a user needs removal, route through a lightweight manual support channel (e.g., email). Do not build auth infrastructure for v1. |
| **Static generation pipeline complexity creeps** | High | Critical | Guardrail test: every feature proposal must answer *"Does this require a connection string, a database, an API key, or server-side state?"* If yes, it is v2. Postpone until 1,000 portfolios exist. |
| **CDN egress/storage costs at 10,000+ portfolios** | Low | Medium | Monitor. If reached, introduce a simple token-based upload quota or optional tipping. Not a v1 problem, but track from day one. |
| **Naming deadlock delays ship date** | Low | Medium | Batch the rename in one commit. Do not interleave with feature work. If no consensus by first commit, ship as working title and rebrand in v2. Bikeshedding is not a feature. |
| **Steve's "museum quality" standard blocks shipping** | Medium | Critical | Define "gasp-worthy" as a checklist, not a feeling: legible hierarchy, generous whitespace, refined typography, subtle motion, flawless mobile rendering. Ship structure first; aesthetic polish is session two. A shipped beautiful thing beats a perfect imaginary thing. |
| **WordPress audience is excluded** | Medium | Medium | Acknowledged. Static SaaS abandons the 43% of web on WordPress. If v1 succeeds, a WordPress plugin wrapper becomes a high-value v2 expansion. Do not chase two architectures in one session. |
| **Aesthetic-first vs ship-first tension stalls the build** | Medium | Critical | The Zen Master's ruling: aesthetics ship on day one, but within the constraints of a single session. The template is not a mood board; it is code. Define the type scale, spacing system, and dark palette as tokens before any JSX is written. No pixel-pushing without a system. |

---

## The Zen Master's Final Word

Elon brought the constraints. Steve brought the soul. The winner is the product that ships with both.

Build the static SaaS. One upload. One URL. One sacred layout in dark mode. Zero knobs. Make it so beautiful they post screenshots at midnight. No barnacles. No parts that do not compound.

The name is **unresolved** — lock it before you move. The frame is **resolved** — sacred dark gallery. The feeling is **resolved** — pride.

Move.
