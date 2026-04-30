# Promptfolio — Build Blueprint

*Orchestrated by the Zen Master. Two egos, one triangle offense. Here's what survived the room.*

---

## Locked Decisions

### 1. Product Name: Promptfolio
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** One word. Category ownership. Already carries the emotional payload. Elon didn't contest the name; he contested the architecture beneath it. Locked.

### 2. Architecture: SaaS-First, WordPress Export Optional
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve conceded in Round 2 — "We are SaaS. One surface. One experience. Absolute control." The public gallery cannot survive inside 50,000 arbitrary WordPress themes. Host the beautiful part yourself; syndicate to WordPress as an embed or zip export. Decouple or die.

### 3. Template Strategy: One Immaculate Template Only
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon conceded in Round 2 — "One React template, edge-cached static." Forty-seven templates is a race to mediocrity. One canvas means obsessive control over every ligature and margin. Design quality is the distribution mechanism.

### 4. Aesthetic Direction: Gallery-Grade Typography, Midnight Spotlight Dark Mode
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon conceded that "taste matters." Dark mode is not an inverted color scheme; it is the default identity — a midnight gallery with spotlights on the work. Light mode is not in scope for v1. Typography is a feature, not an afterthought.

### 5. Distribution Engine: Auto-Generated OG Images for Every Portfolio
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve agreed and expanded — "The image must render the prompt itself as typography, unmistakably Promptfolio from fifty feet away." This is the viral loop. Every share is a billboard. Non-negotiable for v1.

### 6. Brand Voice: "Show Your Work." Confident. Human. Ruthlessly Simple.
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon adopted the ethos in his rebuttal. No "AI-driven synergies." No barnacles. If a feature doesn't make the prompt feel legendary within three seconds, it dies.

### 7. Input Method: Manual Markdown/JSON Paste + Scoped Claude JSON Import
- **Proposed by:** Steve (import); Elon (manual paste as robust fallback)
- **Winner:** Synthesis / Phil Jackson ruling
- **Why:** Steve made one-click import non-negotiable but narrowed the scope to Claude-only after Elon's schema-drift warning. Elon conceded that a single-schema parser is manageable. Ruling: v1 ships both. Manual paste is the universal fallback; Claude JSON drag-and-drop is the magic moment. ChatGPT import is explicitly out of scope for v1 due to schema volatility.

### 8. Performance: Edge-Cached Static HTML, Zero DB Reads on Public Face
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve agreed — "The gallery must load instantly, or the spell breaks." Database queries per portfolio load must be zero. Static generation at build/save time.

### 9. "Try This Prompt" Widget: Deferred to v1.1
- **Proposed by:** Elon (to cut)
- **Winner:** Elon
- **Why:** Steve defended interactivity but conceded it needs "hard metering, rate limits, and a credit system before it sees daylight." Without revenue infrastructure, the widget turns user growth into an OpenAI bill. v1 is a monument, not a playground.

### 10. No Barnacles Policy
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon agreed. Cut SEO wizards, newsletter widgets, popup chatbots, and every other WordPress-plugin barnacle. Simplicity is the ultimate sophistication.

---

## MVP Feature Set (What Ships in v1)

1. **SaaS Web App** — React-based, single surface, absolute control over rendering.
2. **One Gallery Template** — Hero prompt display, code blocks that sing, midnight spotlight dark mode, gallery-grade typography.
3. **Manual Prompt Entry** — Markdown/JSON paste with live preview.
4. **Claude JSON Import** — Drag-and-drop parser scoped to current Claude export schema. Single schema, single point of maintenance.
5. **Automatic OG Image Generation** — Every portfolio generates a shareable image rendering the prompt as typography, watermarked unmistakably as Promptfolio.
6. **Public Portfolio Pages** — Static HTML, edge-cached, zero database reads, served via slug-based URLs.
7. **Optional WordPress Export** — Zip download or embeddable snippet for syndication. Not a plugin. Not native architecture.
8. **Dark Mode Only** — No light-mode toggle in v1. Midnight gallery is the identity.

---

## File Structure (What Gets Built)

```
promptfolio/
├── app/
│   ├── layout.tsx                 # Root layout, dark-mode-first global styles
│   ├── page.tsx                   # Landing / editor / import surface
│   └── [slug]/
│       └── page.tsx               # Public portfolio — static, edge-cached
│   └── api/
│       ├── og/
│       │   └── route.tsx            # Dynamic OG image generation (@vercel/og)
│       └── export/
│           └── route.ts             # WordPress zip export
├── components/
│   ├── Template.tsx               # The one immaculate gallery template
│   ├── PromptCard.tsx             # Prompt hero display component
│   ├── ImportDropzone.tsx         # Claude JSON drag-and-drop with validation
│   ├── ManualPaste.tsx            # Markdown/JSON paste fallback
│   └── OGImagePreview.tsx         # Shareable image preview before publish
├── lib/
│   ├── claudeParser.ts            # Scoped Claude JSON → Promptfolio schema
│   ├── markdownRenderer.ts        # Gallery-grade prompt body renderer
│   ├── ogImageTemplate.tsx        # OG image typography layout
│   └── validators.ts              # Zod/input validation schemas
├── public/
│   └── fonts/                     # Gallery-grade typeface assets
├── types/
│   └── promptfolio.ts             # Domain types (Prompt, Portfolio, etc.)
└── next.config.js / vercel.json   # Edge caching headers, ISR config
```

---

## Open Questions (What Still Needs Resolution)

1. **Claude JSON Schema Drift Mitigation** — How do we version the parser when Anthropic changes export structure? Graceful degradation vs. hard failure?
2. **OG Image Watermarking Specifics** — Exact lockup, logo placement, and typography scale for the fifty-foot rule.
3. **WordPress Export Format** — Is it a self-contained HTML embed, a ZIP with assets, or both? What is the exact spec?
4. **Data Persistence Layer** — If public portfolios are edge-cached static HTML, where does the source of truth live? Vercel KV? Postgres? File-system blob?
5. **Slug Collision Strategy** — Username-based (`/user/slug`) or hash-based (`/p/abc123`)? SEO vs. anonymity tradeoffs.
6. **Light Mode for v1.1?** — Steve says midnight gallery is identity. Do we ever ship light mode, or is Promptfolio dark-mode-only forever?
7. **Revenue Model / Metering** — Free tier limits? Paywall for custom domains? The widget deferral assumes future metering infrastructure.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Claude export schema changes** | Medium | High | Parser wrapped in try/catch with fallback to manual paste. Schema diff alerts. Limit to one provider in v1. |
| **OG image generation cost spikes** | Medium | High | SVG/edge-based generation via `@vercel/og` (no serverless Chromium bills). Cache aggressively. |
| **Single-session scope overflow** | High | Critical | Ruthless template freeze. No design iteration spirals. If it's not in the MVP list above, it doesn't ship. |
| **WordPress export fragility** | Medium | Medium | Ship as ZIP/embed, not a plugin. Support one export format only. Document "use at your own theme" disclaimer. |
| **"Apple-esque" design taking too long** | Medium | High | One template means one obsession, but timebox typography refinement to 20% of session. Ship good, iterate to great. |
| **Viral share without retention loop** | Medium | High | OG images are the hook, but v1 has no widget/interactivity to bring viewers back. Accept this as v1 tradeoff. |
| **Inference cost exposure (post-v1 widget)** | Low (v1) / High (v1.1) | Critical | Already deferred. If resurrected, metering + credit system must ship before the widget. |

---

*The debate is over. The blueprint is locked. Build the monument.*
