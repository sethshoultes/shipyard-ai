# Locked Decisions — Build Phase Blueprint

*Synthesized by Phil Jackson, Zen Master*
*Source debates: Round 1–2 (Elon Musk vs. Steve)*

---

## Decision Ledger

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Static SaaS architecture** — one file in, one URL out, CDN-hosted | Elon (R1) | **Elon** | Steve conceded R2: *"WordPress is dead. A static SaaS... is the correct architecture."* No DB, no auth, no server-side rendering in v1. |
| 2 | **Product name: Aura** | Steve (R1) | **Steve** | Elon objected on procedural grounds (repo churn), but Steve never conceded and the entire brand thesis hangs on a name that *sings, not explains.* Rebranding cost is 30 minutes; losing the emotional hook is fatal. Promptfolio dies today. |
| 3 | **One sacred template, zero knobs** | Steve (R1) | **Steve** | Elon conceded R2: *"One exquisite template, perfected, beats forty-seven mediocre options."* No theme marketplace. No font picker. No color picker. No light mode. The designer gets one shot. |
| 4 | **Dark mode only** | Steve (R1) | **Steve** | Elon dismissed it as CSS theatre in R1 but never mounted a defense. For this product, dark mode is not a toggle; it is the air the gallery breathes. |
| 5 | **Claude import only for v1** | Elon (R1) | **Elon** | Steve mentioned ChatGPT import in R1 prose but did not defend it in R2. We ship the parser that exists. ChatGPT, OpenAI, Gemini exports are v2. |
| 6 | **OG images: pre-generate at creation time** | Steve (R2) | **Steve** | Elon wanted to cut OG images for v1. Steve rebutted: *"When someone shares their prompt on Twitter, the card is the first impression."* Compromise: generate during the static build pipeline (not edge-rendered per-request). This satisfies both beauty and Elon’s no-server mandate. |
| 7 | **No forced watermark / viral loop via organic pride** | Steve (R2) | **Steve** | Elon proposed a *"Built with Promptfolio"* backlink as compound interest. Steve: *"Viral loops born of obligation are spam."* Correct. The product must be so beautiful that users screenshot it unprompted. Apostles, not hostages. |
| 8 | **Cut "Try this prompt" widget** | Elon (R1) | **Elon** | Steve conceded R2: *"kill the widget. Barnacles."* API keys, rate limits, abuse vectors — all liability, no love. |
| 9 | **No WordPress plugin for v1** | Elon (R1) | **Elon** | Steve conceded R2. WordPress.org review queue, PHP rewrite, HostGator support tickets — all death for a v1 that needs to ship in hours, not weeks. |
| 10 | **30-second resurrection standard** | Steve (R1) | **Steve** | Upload Claude export → instant, beautiful URL. *Thirty seconds or we have failed.* Elon’s static-export pipeline makes this technically possible; Steve made it the standard. |
| 11 | **No explicit onboarding tutorial; self-evident affordance** | Steve (R1) | **Steve** (with Elon guardrail) | Steve: *"If you need a manual, the design is broken."* Elon’s valid concern: users must know where their Claude export lives. Resolution: the upload UI is a single, obvious action. No multi-step wizard. No settings before magic. |

---

## MVP Feature Set (What Ships in v1)

**Core Flow:**
1. Landing page with single, obvious upload drop-zone for Claude conversation export JSON.
2. Parser: Claude export JSON → structured prompt objects (title, body, metadata).
3. Static generator: one sacred template (dark mode only) → HTML + CSS + OG image.
4. Deployment: static files pushed to CDN → shareable URL returned to user.
5. Portfolio page: sacred whitespace, typography-forward, code blocks as sheet music, each prompt framed like art.

**What Is IN:**
- Single-file upload (Claude JSON only)
- One unchangeable template (dark mode, locked typography/spacing/color)
- Static HTML/CSS export
- OG image generation at creation time (Twitter/OpenGraph cards)
- CDN deployment with instant URL
- Responsive layout

**What Is OUT:**
- User accounts / auth
- Database
- WordPress plugin
- ChatGPT/OpenAI/Gemini parsers
- Template marketplace / theme picker / font picker / color picker
- Light mode
- "Try this prompt" widget
- Forced watermark or backlink
- Onboarding tutorial / multi-step wizard
- Settings page / admin panel
- Edge-rendered OG images
- Newsletter widgets / chatbots / SEO panels / page-builder compatibility
- Manual markdown/JSON paste (out of scope; single import path only)

---

## File Structure (What Gets Built)

```
/aura                          # Project root (renamed from Promptfolio)
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
│       └── cdn-push.ts       # Uploads static bundle to CDN (Cloudflare/Vercel)
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

1. **Domain / hosting logistics.** If the name is Aura, does the repo rename happen now or post-v1? Elon is right that DNS, README, and deploy pipeline updates burn clock. Decision needed before first commit.
2. **OG generation at creation time vs. true static.** Since user uploads happen post-deploy, "pre-generate at build time" is technically impossible unless we run a micro-build pipeline on upload. Is this a serverless function (violates pure static?) or a lightweight container step? The boundary between "build" and "creation" is fuzzy.
3. **Claude export location affordance.** Users must find `claude-export.json` in their Downloads folder. If they don’t know how to export, the 30-second promise dies at second 0. Do we add a single-line helper text ("Export your Claude conversations → Settings → Data → Export") or is that a manual?
4. **CDN cost and rate limits at scale.** Static files scale, but upload-processing bandwidth and storage aren’t free. Is there a ceiling where we need auth/quotas?
5. **Edit / delete / update.** No auth means no ownership. If a user regenerates, they get a new URL. Is orphan cleanup acceptable? What if they need to remove a portfolio?
6. **Monetization.** Never debated. Hosting costs money. Do we need a simple paywall or tipping mechanism, or is this loss-leader/giftware?
7. **Parser fragility.** Claude export JSON schema is undocumented and can change. If Anthropic alters the format, the parser breaks. Do we version the parser defensively?

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users can’t find their Claude export** | High | Critical | Single-line contextual helper on upload zone. No wizard. One sentence. |
| **30-second promise broken by large exports** | Medium | High | Size limit enforced at upload (e.g., 50MB max). Async processing with progress indicator if edge case exceeds threshold. |
| **Single template alienates users who want customization** | Medium | Medium | That is the thesis. Apostles, not users. If they want customization, they are not the customer. Accept the risk. |
| **Claude JSON format changes** | Medium | High | Defensive parser with schema validation and graceful error message. Fallback to raw text display if structure unrecognized. |
| **OG image generation adds latency** | Medium | Medium | Use lightweight canvas/SVG-to-PNG pipeline (not headless Chrome). Cap prompt count per portfolio. |
| **Organic viral loop fails without watermarks** | Medium | High | Build-in share affordance (native Web Share API + copy-link) but no forced attribution. If beauty is insufficient, we lose. That is the bet. |
| **No auth = no edit/delete = support burden** | Medium | Medium | Accept orphan URLs. If user needs removal, manual support channel. Do not build auth for v1. |
| **Static generation pipeline complexity creeps** | High | Critical | Guardrail: every feature proposal must answer *"Does this require a connection string, a database, or an API key?"* If yes, it is v2. |
| **CDN costs at 10,000+ portfolios** | Low | Medium | Monitor. If reached, introduce simple token-based upload or tipping. Not a v1 problem. |
| **Rebranding to Aura delays ship date** | Low | Medium | Batch all rename operations in one 30-minute commit. Do not interleave with feature work. |

---

## The Zen Master's Final Word

Elon brought the constraints. Steve brought the soul. The winner is the product that ships with both.

Build the static SaaS. One upload. One URL. One sacred layout in dark mode. Call it Aura. Make it so beautiful they post screenshots at midnight. No barnacles. No parts that do not compound.

*The best system is the one that lets the work breathe.*

Move.
