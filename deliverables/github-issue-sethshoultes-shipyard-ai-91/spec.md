# Promptfolio — Build Specification

**Issue:** sethshoultes/shipyard-ai#91
**Source PRD:** `prds/github-issue-sethshoultes-shipyard-ai-91.md`
**Locked Decisions:** `rounds/github-issue-sethshoultes-shipyard-ai-91/decisions.md`
**Product Name:** Promptfolio (per locked decision #2)
**Version:** 1.0 (MVP)
**Architecture:** Static SaaS — zero backend, no auth, no database

---

## Goals

From the PRD and locked debate decisions:

1. **Static SaaS Portfolio Generator** — Build a lightweight Node.js-based generator that transforms Claude conversation export JSON files into stunning, gallery-grade portfolio websites. No React SPA, no heavy build pipeline (per locked decision #19).

2. **One-Click Claude Import** — Single file drop-zone for Claude conversation export JSON ONLY. No ChatGPT, no manual paste in v1 (per locked decision #6).

3. **One Sacred Template** — Single "dark gallery" template with hero prompt display, elegant typography, and locked design tokens. No theme marketplace, no font picker, no color picker (per locked decision #3).

4. **Dark Mode Only** — Midnight gallery palette. No light mode toggle, no light-mode styles (per locked decision #4, #16).

5. **Auto-Generated OG Images** — Every portfolio generates a pre-rendered PNG social card at build time (per locked decision #9).

6. **Static CDN-Hosted Pages** — Public portfolios served as static HTML/CSS/JS bundles. Zero database reads, zero server-side rendering per-request.

7. **30-Second Resurrection Standard** — Upload Claude export → instant beautiful URL in under 30 seconds (per locked decision #10).

8. **No Forced Watermark** — No "Made with Promptfolio" backlinks. Viral loop via organic pride, not obligation (per locked decision #10).

9. **No "Try This Prompt" Widget** — Explicitly cut. API keys, rate limits, abuse vectors are all liability (per locked decision #5).

10. **No Barnacles** — Cut SEO wizards, newsletter widgets, popup chatbots, analytics dashboards, onboarding tutorials (per locked decision #14, #17, #18).

---

## Implementation Approach

### Architecture Lock (from decisions.md)

| Decision | Resolution |
|----------|------------|
| **Static SaaS** | One file in (Claude JSON), one URL out, CDN-hosted. No DB, no auth, no server-side rendering in v1. |
| **Product Name** | Promptfolio — locked in decision #2. |
| **No React Pipeline** | No Next.js, no heavy SPA toolchain. Lightweight static generator only (vanilla Node.js, Astro, or 11ty) per decision #19. |
| **One Sacred Template** | No theme marketplace. No font picker. No color picker. One midnight gallery palette. |
| **Dark Mode Only** | Not a toggle. The air the gallery breathes. |
| **Claude Import Only** | ChatGPT, OpenAI, Gemini exports are v2. |
| **Client-Side Parsing** | Browser-based parsing with 5 MB cap. Web Workers for off-main-thread processing. |
| **OG Images Pre-Generated** | Generate during build pipeline using Sharp or Satori, not edge-rendered per-request. |
| **No Forced Watermark** | Beauty must compel sharing. Apostles, not hostages. |
| **No Widget** | "Try this prompt" widget is barnacles. |
| **Base64 Image Extraction** | Decode base64 images from exports, convert to static files, reference in HTML. |
| **Self-Evident Affordance** | No multi-step wizard. Single obvious upload action. One-line helper text max. |

### Tech Stack

- **Runtime:** Node.js 18+ (native fetch)
- **Framework:** None (vanilla Node.js file-writing) OR Astro 4.x (lightweight, no React SPA)
- **Styling:** Vanilla CSS with locked design tokens (dark mode only)
- **Validation:** Custom schema validation in parser
- **OG Images:** Sharp or Satori (SVG→PNG, pre-generated at build time)
- **Data Persistence:** None in v1 — pure static generation from uploaded JSON
- **Deployment:** Cloudflare Pages, Vercel, or Netlify (free tier, instant deploy)

### File Structure

```
/promptfolio
├── /src
│   ├── /parser
│   │   └── claude.js        # Claude export JSON → structured Portfolio
│   ├── /template
│   │   ├── layout.html      # Single sacred layout: dark gallery
│   │   ├── prompt-card.html # Individual prompt component
│   │   └── styles.css       # Locked typography, spacing, color tokens
│   ├── /generator
│   │   ├── build.js         # Orchestrates HTML + CSS + JS write to disk
│   │   └── og-image.js      # Generates OG PNG at portfolio creation
│   └── /deploy
│       └── cdn-push.js      # Uploads static bundle to CDN, returns URL
├── /app
│   ├── index.html           # Landing page: single upload drop-zone
│   └── main.js              # Landing page logic (drop-zone, validation)
├── /public
│   └── assets               # Static assets (fonts, favicon, base CSS)
├── /lib
│   └── utils.js             # Shared utilities (UUID, validation, base64)
├── package.json             # Minimal dependencies; no React
└── README.md
```

### Build Output (per Portfolio)

```
/{uuid}/
  ├── index.html              # Portfolio page
  ├── og-image.png            # Pre-generated social card
  └── assets/
      ├── images/             # Extracted base64 images from export
      └── styles.css          # Minified, locked styles
```

### Data Flow

1. User lands on `index.html` — single, obvious file upload drop-zone for Claude JSON export.
2. User drops Claude export JSON → client-side parser validates and extracts prompts (max 5 MB).
3. Base64 images extracted and converted to binary files.
4. Static generator renders HTML + CSS bundle using sacred template.
5. OG image (PNG) generated at build time using Sharp/Satori.
6. Static bundle uploaded to CDN.
7. Shareable HTTPS URL returned to user instantly.
8. Public portfolio page at `/{uuid}/index.html` with pre-generated `og-image.png`.

### Parser Resilience

- `claude.js` wrapped in `try/catch` with graceful error message.
- Layered extraction: `JSON.parse()` → regex strip markdown fences → regex extract first `{...}` block → WP_Error-style fallback.
- If Claude export schema drifts, render as raw text blocks rather than crashing.
- 5 MB file size cap enforced before parsing begins.
- Only Claude parser in v1.

---

## Verification Criteria

| Requirement | How to Prove It Works |
|-------------|----------------------|
| **Project boots** | `cd promptfolio && npm install` completes without errors |
| **Parser handles valid JSON** | `tests/test-parser.sh` with valid Claude export returns parsed object |
| **Parser handles markdown fences** | Test input with \`\`\`json fences strips and parses correctly |
| **Parser handles truncated JSON** | Test returns graceful error, not crash |
| **Parser handles empty file** | Test returns "No prompts found" error |
| **Parser enforces 5 MB cap** | Test with >5 MB file returns "File exceeds 5 MB limit" |
| **Base64 images extracted** | Output HTML contains no `data:image/` strings; images exist as files |
| **Single template rendered** | `grep -c "sacred dark gallery" output/index.html` = 1 |
| **OG image exists** | `test -f output/og-image.png` exits 0; file is valid PNG under 500KB |
| **Dark mode only** | `grep -riE "light-mode|light_mode|prefers-color-scheme:\s*light" src/` returns zero matches |
| **No toggle logic** | `grep -ri "toggle\|theme-switch\|light.*dark" src/` returns zero matches |
| **Static pages generated** | `ls output/{uuid}/index.html` exists after build |
| **OG tags present** | `grep -o '<meta property="og:' output/index.html` returns at least 3 tags |
| **CDN push returns HTTPS URL** | URL starts with `https://` and matches `{uuid}.{cdn-domain}` pattern |
| **Anonymous access works** | `curl -I {url}` returns 200 without `WWW-Authenticate` header |
| **30-second flow** | End-to-end timing: upload → parse → generate → deploy → URL in <30s |
| **No banned patterns** | `tests/test-exclusions.sh` exits 0 |
| **No "Try This Prompt" widget** | `grep -riE "try.*prompt|tryprompt|execute.*prompt" src/ app/` returns zero |
| **No barnacles** | `grep -riE "newsletter|popup|chatbot|cookie.*banner|seo.*wizard" src/ app/` returns zero |
| **No WordPress plugin** | `find . -name "*.php"` returns nothing |
| **No manual paste UI** | `grep -riE "manual.*paste|paste.*input|markdown.*input" app/` returns zero |
| **No auth/database** | `grep -riE "prisma|drizzle|auth|login|register|session|user\." src/ lib/` returns zero |
| **No React/Next.js** | `grep -ri "next\\|react" package.json` returns nothing (or only dev deps) |
| **Bundle under 500KB** | `du -sh output/` shows under 500KB total |
| **Mobile responsive** | Page renders without horizontal scroll at 375px viewport |
| **No corporate speak** | `grep -ri "leverage\|solution\|empower" src/ app/` returns zero matches |

---

## Files to Create or Modify

### Configuration & Tooling
| File | Purpose |
|------|---------|
| `promptfolio/package.json` | Minimal dependencies: sharp (OG images), no React, no heavy framework |
| `promptfolio/.gitignore` | Standard Node ignores: `node_modules/`, `dist/`, `*.log`, `.env` |

### Parser Module
| File | Purpose |
|------|---------|
| `src/parser/claude.js` | Claude export JSON → Portfolio domain schema. Defensive validation + raw-text fallback. |
| `src/parser/schema.js` | JSON schema definition for valid Claude export structure. |

### Template Module
| File | Purpose |
|------|---------|
| `src/template/layout.html` | Single sacred layout: dark gallery, sacred whitespace, typography-forward. |
| `src/template/prompt-card.html` | Individual prompt component: the painting on the wall. |
| `src/template/styles.css` | Locked typography, spacing, color tokens (dark only). Under 200 lines. |

### Generator Module
| File | Purpose |
|------|---------|
| `src/generator/build.js` | Orchestrates HTML + CSS + JS write to disk/bundle. |
| `src/generator/og-image.js` | Generates OG PNG at portfolio creation time using Sharp/Satori. |

### Deploy Module
| File | Purpose |
|------|---------|
| `src/deploy/cdn-push.js` | Uploads static bundle to CDN, returns shareable HTTPS URL. |

### Landing Page
| File | Purpose |
|------|---------|
| `app/index.html` | Landing page: single upload drop-zone, no nav, no settings. |
| `app/main.js` | Landing page logic: drop-zone, file validation, progress indicator. |

### Utilities
| File | Purpose |
|------|---------|
| `lib/utils.js` | Shared utilities: UUID gen, validation helpers, base64 decode. |

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Three-paragraph readme: what it does, how it works, built-in agents. |

### Tests (in Deliverables)
| File | Purpose |
|------|---------|
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-parser.sh` | Verify parser handles valid/invalid input correctly. |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-generator.sh` | Verify generator output contains expected files and structure. |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-exclusions.sh` | Verify no light-mode, no widget, no barnacles, no banned patterns. |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-aesthetic.sh` | Verify aesthetic checklist: whitespace, typography, motion, mobile. |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-e2e.sh` | End-to-end flow test: upload → generate → deploy → verify URL. |

---

## Out of Scope (Locked Decisions)

The following must **not** appear in v1:

| Excluded | Locked Decision |
|----------|-----------------|
| Light mode toggle or light-mode-specific styles | #4, #16 |
| ChatGPT/OpenAI/Gemini JSON import | #6 |
| Manual markdown/JSON paste input | #7 (single file drop-zone only) |
| "Try This Prompt" widget / interactive inference | #5 |
| WordPress plugin architecture | #1 (static SaaS) |
| Multiple templates or theming system | #3, #17 |
| Font picker / color picker / theme picker / customizer | #3, #17 |
| SEO wizards, newsletter widgets, popup chatbots, cookie banners | #14 |
| Forced watermark or "Made with Promptfolio" backlink | #10 |
| User accounts / auth / login / database | #13 |
| Multi-step onboarding wizard / tutorial / tooltips | #18 |
| Analytics dashboard / view counters | #14 |
| Workflows / case studies taxonomies | #15 |
| React / Next.js build pipeline | #19 |

---

## Open Questions (To Resolve Before Build)

1. **Final folder/repo name** — "Promptfolio" is product name; confirm directory name matches.
2. **OG generation mechanics** — Sharp vs. Satori for PNG generation.
3. **Hosting/CDN target** — Cloudflare Pages, Vercel, or Netlify for free tier.
4. **Export discoverability copy** — Exact wording for helper: "Claude → Settings → Data → Export".
5. **Orphan URL cleanup** — Manual support channel vs. TTL auto-purge policy.
6. **Image extraction cap** — Maximum images per portfolio to bound bundle size.
7. **Framework escape hatch** — Plain Node.js file-writing if any framework blocks single-session ship.

---

## Acceptance Criteria (from PRD)

- [ ] Issue sethshoultes/shipyard-ai#91 requirements are met
- [ ] All tests pass
- [ ] 30-second upload-to-URL flow works end-to-end
- [ ] Claude export import works with real export files
- [ ] OG images display correctly when shared on Twitter/Slack/LinkedIn
- [ ] Dark mode renders correctly on mobile and desktop
- [ ] No barnacles shipped
- [ ] Bundle size under 500KB
- [ ] Zero React/Next.js dependencies
- [ ] Client-side parsing with 5 MB cap enforced
