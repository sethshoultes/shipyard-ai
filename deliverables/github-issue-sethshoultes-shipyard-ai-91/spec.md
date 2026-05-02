# Aura v1 — Build Spec

**Issue:** sethshoultes/shipyard-ai#91
**Source PRD:** `prds/github-issue-sethshoultes-shipyard-ai-91.md`
**Locked Decisions:** `rounds/github-issue-sethshoultes-shipyard-ai-91/decisions.md`
**Product Name:** Aura (per locked decision #2)
**Version:** 1.0 (MVP)

---

## Goals

From the PRD and locked debate decisions:

1. **SaaS Portfolio Generator** — Build a React-based web app that lets AI practitioners create stunning, gallery-grade portfolio sites showcasing their prompts, workflows, and case studies.
2. **One-Click Claude Import** — Drag-and-drop import from Claude conversation exports ONLY. No ChatGPT, no manual paste in v1 (per locked decision #5).
3. **One Sacred Template** — Single gallery template with hero prompt display, elegant code blocks, and obsessive typography control. No theming system, no font picker, no color picker.
4. **Dark Mode Only** — Dark mode is the identity. No light mode toggle, no light-mode styles (per locked decision #4).
5. **Auto-Generated OG Images** — Every portfolio generates a typographic shareable image at creation time (pre-generated, not edge-rendered) per locked decision #6.
6. **Static CDN-Hosted Pages** — Public portfolios served as static HTML with zero database reads. Instant URL returned after upload.
7. **30-Second Resurrection Standard** — Upload Claude export → instant beautiful URL in under 30 seconds (per locked decision #10).
8. **No Forced Watermark** — No "Built with Aura" backlinks. Viral loop via organic pride, not obligation (per locked decision #7).
9. **No "Try This Prompt" Widget** — Explicitly cut. API keys, rate limits, abuse vectors are all liability (per locked decision #8).
10. **No Barnacles** — Cut SEO wizards, newsletter widgets, popup chatbots, and every other extraneous feature.

---

## Implementation Approach

### Architecture Lock (from decisions.md)

| Decision | Resolution |
|----------|------------|
| **Static SaaS** | One file in (Claude JSON), one URL out, CDN-hosted. No DB, no auth, no server-side rendering in v1. |
| **Product Name** | Aura — rebrand from Promptfolio. |
| **One Sacred Template** | No theme marketplace. No font picker. No color picker. Designer gets one shot. |
| **Dark Mode Only** | Not a toggle. The air the gallery breathes. |
| **Claude Import Only** | ChatGPT, OpenAI, Gemini exports are v2. |
| **OG Images Pre-Generated** | Generate during static build pipeline, not edge-rendered per-request. |
| **No Forced Watermark** | Beauty must compel sharing. Apostles, not hostages. |
| **No Widget** | "Try this prompt" widget is barnacles. |
| **No WordPress Plugin** | PHP rewrite, WordPress.org review queue, HostGator tickets — all death for v1. |
| **Self-Evident Affordance** | No multi-step wizard. Single obvious upload action. One-line helper text max. |

### Tech Stack

- **Framework:** Next.js 14+ (App Router) with static export
- **Runtime:** React 18+, TypeScript (strict)
- **Styling:** Tailwind CSS (dark-mode-first, locked tokens)
- **Validation:** Zod
- **OG Images:** `@vercel/og` (Satori-based SVG→PNG, pre-generated at creation time)
- **Data Persistence:** None in v1 — pure static generation from uploaded JSON
- **Deployment:** Vercel or Cloudflare Pages (edge caching, static hosting)

### Data Flow

1. User lands on `/` — single, obvious file upload drop-zone for Claude JSON export.
2. User drrops Claude export JSON → parser validates and extracts prompts.
3. Static generator renders HTML + CSS + OG image from template.
4. Static bundle uploaded to CDN.
5. Shareable URL returned to user instantly.
6. Public portfolio page at `/{uuid}/index.html` with pre-generated `og-image.png`.

### Parser Resilience

- `claudeParser.ts` wrapped in `try/catch` with graceful error message.
- If Claude export schema drifts, show helpful error: "This export format isn't recognized. Please check you exported from Claude's Settings → Data → Export."
- Only Claude parser in v1.

---

## Verification Criteria

| Requirement | How to Prove It Works |
|-------------|----------------------|
| **Project boots** | `cd projects/aura && npm install && npm run dev` starts without fatal errors on `localhost:3000` |
| **Type safety** | `npx tsc --noEmit` passes with zero errors across the entire project |
| **Production build** | `npm run build` exits 0 and outputs `.next/` or `out/` directory with static routes |
| **Dark mode only** | `grep -riE "light-mode|light_mode|prefers-color-scheme:\s*light" app/ components/ lib/` returns zero matches |
| **Static slug pages** | `curl -s http://localhost:3000/{uuid}/` returns `200` with rendered HTML containing prompt content |
| **OG image generation** | `ls projects/aura/out/{uuid}/og-image.png` exists after build; file is valid PNG |
| **Claude JSON import** | Dropping valid Claude export JSON into upload zone parses and generates portfolio within 5 seconds |
| **30-second flow** | End-to-end timing: upload → parse → generate → deploy → URL returned in <30 seconds |
| **Input validation** | Submitting invalid JSON shows user-friendly error (not blank screen or console crash) |
| **Zero banned patterns** | `tests/test-banned-patterns.sh` exits 0 |
| **No "Try This Prompt" widget** | `grep -riE "try.this.prompt|tryprompt|prompt.*widget|execute.*prompt" app/ components/ lib/` returns zero matches |
| **No barnacles** | `grep -riE "newsletter|popup|chatbot|cookie.banner|seo.wizard" app/ components/ lib/` returns zero matches |
| **No WordPress plugin** | `find projects/aura -name "*.php" -o -name "plugin.php"` returns nothing |
| **No manual paste UI** | `grep -riE "manual.*paste|paste.*input|markdown.*input" app/ components/` returns zero matches (v1 is Claude-import-only) |
| **No auth/database** | `grep -riE "prisma|drizzle|auth|login|register|session|user\." app/ lib/` returns zero matches |
| **File structure compliance** | `tests/test-file-structure.sh` exits 0 (all required files exist) |
| **Flat structure (no tests/ subdir in build)** | `find projects/aura -type d -name "tests"` returns nothing (tests live in deliverables/) |

---

## Files to Create or Modify

### Configuration & Tooling
| File | Purpose |
|------|---------|
| `projects/aura/package.json` | Dependencies: next, react, react-dom, typescript, zod, @vercel/og, tailwindcss |
| `projects/aura/tsconfig.json` | Strict TypeScript, path aliases (`@/*` → `./*`) |
| `projects/aura/next.config.js` | Static export config (`output: 'export'`) |
| `projects/aura/tailwind.config.ts` | Locked design tokens: dark mode only, midnight palette, typography scale |
| `projects/aura/postcss.config.js` | PostCSS setup for Tailwind |
| `projects/aura/.gitignore` | Standard Node/Next.js ignores |

### App Router (Next.js 14 App Router)
| File | Purpose |
|------|---------|
| `projects/aura/app/layout.tsx` | Root layout: dark-mode-first global styles, font loading, metadata base |
| `projects/aura/app/page.tsx` | Landing page: single upload drop-zone, one-line helper text for Claude export location |
| `projects/aura/app/[uuid]/page.tsx` | Public portfolio page: static generation, zero DB reads |
| `projects/aura/app/api/generate/route.ts` | Generation endpoint: receives Claude JSON, returns static bundle + URL |

### Components
| File | Purpose |
|------|---------|
| `projects/aura/components/Template.tsx` | The one sacred template: dark mode, midnight spotlight aesthetic |
| `projects/aura/components/PromptCard.tsx` | Hero prompt display: large typography, code block styling |
| `projects/aura/components/UploadDropzone.tsx` | Claude JSON drag-and-drop with validation and progress state |

### Library / Utilities
| File | Purpose |
|------|---------|
| `projects/aura/lib/claudeParser.ts` | Claude JSON → Portfolio domain schema parser. Try/catch with graceful error. |
| `projects/aura/lib/markdownRenderer.ts` | Gallery-grade prompt body renderer: syntax highlighting, typographic scale |
| `projects/aura/lib/ogImageTemplate.tsx` | Satori/React layout for OG image: prompt as typography, tasteful Aura branding |
| `projects/aura/lib/staticGenerator.ts` | Orchestrates HTML + CSS + OG image write to disk |
| `projects/aura/lib/validators.ts` | Zod schemas for Portfolio, Prompt, ClaudeExport |

### Types
| File | Purpose |
|------|---------|
| `projects/aura/types/aura.ts` | Domain types: `Portfolio`, `Prompt`, `ClaudeExport`, `OGImageProps` |

### Assets
| File | Purpose |
|------|---------|
| `projects/aura/public/fonts/` | Gallery-grade typeface files (e.g., Inter, Geist, or premium serif for headings) |
| `projects/aura/public/aura-wordmark.svg` | Wordmark for OG image branding |

### Tests (in Deliverables)
| File | Purpose |
|------|---------|
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-file-structure.sh` | Verify every file in the spec exists |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-banned-patterns.sh` | Verify no light-mode, no widget, no barnacles |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-build.sh` | Verify `npm run build` exits 0 and output contains expected routes |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-claude-parser.sh` | Verify Claude parser handles valid/invalid input correctly |

---

## Out of Scope (Locked Decisions)

The following must **not** appear in v1:

| Excluded | Locked Decision |
|----------|-----------------|
| Light mode toggle or light-mode-specific styles | #4 |
| ChatGPT/OpenAI/Gemini JSON import | #5 |
| Manual markdown/JSON paste input | #5 (Claude import only) |
| "Try This Prompt" widget / interactive inference | #8 |
| WordPress plugin architecture | #9 |
| Multiple templates or theming system | #3 |
| Font picker / color picker / theme picker | #3 |
| SEO wizards, newsletter widgets, popup chatbots, cookie banners | #10 |
| Forced watermark or "Built with Aura" backlink | #7 |
| User accounts / auth / database | #1 (static SaaS) |
| Multi-step onboarding wizard | #11 |
| Settings page before magic | #11 |

---

## Acceptance Criteria (from PRD)

- [ ] Issue sethshoultes/shipyard-ai#91 requirements are met
- [ ] All tests pass
- [ ] 30-second upload-to-URL flow works end-to-end
- [ ] Claude export import works with real export files
- [ ] OG images display correctly when shared on Twitter/Slack
- [ ] Dark mode renders correctly on mobile and desktop
- [ ] No barnacles shipped
