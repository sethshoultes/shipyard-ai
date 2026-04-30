# Promptfolio v1 — Build Spec

**Issue:** sethshoultes/shipyard-ai#91
**Source PRD:** `prds/github-issue-sethshoultes-shipyard-ai-91.md`
**Locked Decisions:** `rounds/github-issue-sethshoultes-shipyard-ai-91/decisions.md`
**Project Slug:** `promptfolio`
**Build Path:** `projects/promptfolio/`

---

## Goals

From the PRD and locked debate decisions:

1. **SaaS Portfolio Generator** — Build a React-based web app that lets AI practitioners create stunning, gallery-grade portfolio sites showcasing their prompts, workflows, and case studies.
2. **One-Click Claude Import** — Drag-and-drop import from Claude conversation exports (scoped to current Anthropic export schema). ChatGPT import is explicitly out of scope for v1.
3. **Manual Markdown/JSON Paste** — Universal fallback input method with live preview.
4. **One Immaculate Template** — Single gallery template with hero prompt display, elegant code blocks, and obsessive typography control. No theming system in v1.
5. **Midnight Spotlight Dark Mode** — Dark mode is the default identity, not an inverted afterthought. Light mode is explicitly out of scope for v1.
6. **Auto-Generated OG Images** — Every portfolio generates a typographic shareable image rendering the prompt itself, unmistakably branded as Promptfolio.
7. **Edge-Cached Static Public Pages** — Public portfolios are served as static HTML with zero database reads on the public face. Slug-based URLs (`/[slug]`).
8. **Optional WordPress Export** — ZIP download or embeddable HTML snippet for syndication. Not a WordPress plugin — decoupled SaaS-first architecture.
9. **"Try This Prompt" Widget** — Explicitly deferred to v1.1 (per locked decision #9). Must not ship in v1.
10. **No Barnacles** — Cut SEO wizards, newsletter widgets, popup chatbots, and every other extraneous feature. Ruthless simplicity.

---

## Implementation Approach

### Architecture Lock (from decisions.md)
- **SaaS-first, WordPress export optional** — Host the beautiful part yourself; syndicate to WordPress as embed or zip export.
- **One React template, edge-cached static** — Single canvas means obsessive control over every ligature and margin.
- **Performance: Zero DB reads on public face** — Static generation at build/save time. Database queries per portfolio load must be zero.
- **OG Generation: SVG/edge-based via `@vercel/og`** — No serverless Chromium bills. Cache aggressively.
- **Input Method: Manual paste + Claude JSON import** — Manual paste is the universal fallback; Claude JSON drag-and-drop is the magic moment.

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Runtime:** React 18+, TypeScript (strict)
- **Styling:** Tailwind CSS or CSS Modules (styling engine must support dark-mode-first token system)
- **Validation:** Zod
- **OG Images:** `@vercel/og` (edge runtime, Satori-based SVG→PNG)
- **Data Persistence:** File-system blob or lightweight KV (e.g., Vercel KV, Upstash Redis) for portfolio JSON source of truth
- **Deployment:** Vercel (edge caching, ISR/static generation)

### Data Flow
1. User lands on `/` — editor surface with manual paste and import dropzone.
2. User inputs prompt data via **ManualPaste** (markdown/JSON) or **ImportDropzone** (Claude JSON).
3. Input is validated by `validators.ts` and parsed by `claudeParser.ts`.
4. Live preview renders via **Template** → **PromptCard** → `markdownRenderer.ts`.
5. On publish, portfolio JSON is persisted to storage (KV/blob).
6. Static page is generated/revalidated at `/[slug]`.
7. OG image is served on-demand from `/api/og?slug=[slug]` (edge-cached).
8. WordPress export is generated on-demand from `/api/export` (ZIP with self-contained HTML + assets).

### Parser Resilience
- `claudeParser.ts` must be wrapped in `try/catch` with graceful fallback to manual paste.
- If Claude export schema drifts, parser returns `null` and UI prompts user to use manual paste.
- Only one provider (Claude) in v1 to limit maintenance surface.

---

## Verification Criteria

| Requirement | How to Prove It Works |
|---|---|
| **Project boots** | `cd projects/promptfolio && npm install && npm run dev` starts without fatal errors on `localhost:3000` |
| **Type safety** | `npx tsc --noEmit` passes with zero errors across the entire project |
| **Production build** | `npm run build` exits 0 and outputs `.next/` directory with static routes |
| **Dark mode only** | `grep -riE "light-mode|bg-white|text-black|@media\s*\(prefers-color-scheme:\s*light\)" app/ components/ lib/` returns zero matches |
| **Static slug pages** | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/demo-portfolio` returns `200` with rendered HTML containing prompt content |
| **OG image generation** | `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/og?title=Demo+Prompt&prompt=Hello+world"` returns `200` with `image/png` or `image/svg+xml` content-type |
| **Claude JSON import** | Dropping a valid Claude export JSON into ImportDropzone renders parsed prompts in preview within 2 seconds |
| **Manual paste live preview** | Typing markdown into ManualPaste updates the Template preview within 500ms |
| **Input validation** | Submitting invalid JSON or malformed markdown shows a Zod-derived error message (not a blank screen or console error) |
| **WordPress export** | POST to `/api/export` with `{ slug: "demo" }` returns `200` with `Content-Type: application/zip` and a ZIP containing `index.html` + asset folder |
| **Zero banned patterns** | `tests/test-banned-patterns.sh` exits 0 |
| **Edge caching headers** | `curl -I http://localhost:3000/demo-portfolio` (or staging) shows `Cache-Control` with `s-maxage` or `stale-while-revalidate` |
| **No "Try This Prompt" widget** | `grep -riE "try.this.prompt|tryprompt|promptwidget|openai.*api|anthropic.*api.*client" app/ components/ lib/` returns zero matches |
| **No barnacles** | `grep -riE "seo.wizard|newsletter|popup|chatbot|cookie.banner|analytics" app/ components/ lib/` returns zero matches |
| **File structure compliance** | `tests/test-file-structure.sh` exits 0 (all required files exist) |

---

## Files to Create or Modify

### Configuration & Tooling
| File | Purpose |
|------|---------|
| `projects/promptfolio/package.json` | Dependencies: next, react, react-dom, typescript, zod, @vercel/og, tailwindcss (or chosen CSS solution) |
| `projects/promptfolio/tsconfig.json` | Strict TypeScript, path aliases (`@/*` → `./*`) |
| `projects/promptfolio/next.config.js` | Static export / ISR config, image remotePatterns, trailingSlash optional |
| `projects/promptfolio/vercel.json` | Edge caching headers, build settings |
| `projects/promptfolio/tailwind.config.ts` *(if Tailwind)* | Dark-mode class strategy, custom font families, color tokens (midnight palette) |
| `projects/promptfolio/postcss.config.js` *(if Tailwind)* | PostCSS setup |
| `projects/promptfolio/.gitignore` | Standard Node/Next.js ignores |

### App Router (Next.js 14 App Router)
| File | Purpose |
|------|---------|
| `projects/promptfolio/app/layout.tsx` | Root layout: dark-mode-first global styles, font loading (gallery-grade typefaces), metadata base |
| `projects/promptfolio/app/page.tsx` | Landing / editor / import surface — the single surface where users create portfolios |
| `projects/promptfolio/app/[slug]/page.tsx` | Public portfolio page — static generation, edge-cached, zero DB reads at request time |
| `projects/promptfolio/app/api/og/route.tsx` | Dynamic OG image generation — edge runtime, Satori layout, typographic prompt rendering |
| `projects/promptfolio/app/api/export/route.ts` | WordPress export endpoint — generates self-contained ZIP (HTML + CSS + assets) |

### Components
| File | Purpose |
|------|---------|
| `projects/promptfolio/components/Template.tsx` | The one immaculate gallery template — layout shell, midnight spotlight aesthetic |
| `projects/promptfolio/components/PromptCard.tsx` | Hero prompt display — large typography, code block styling, visual hierarchy |
| `projects/promptfolio/components/ImportDropzone.tsx` | Claude JSON drag-and-drop with validation, progress state, error fallback to manual paste |
| `projects/promptfolio/components/ManualPaste.tsx` | Markdown/JSON textarea with live preview toggle, syntax hinting |
| `projects/promptfolio/components/OGImagePreview.tsx` | Shareable image preview before publish — shows user exactly what Twitter/LinkedIn will render |

### Library / Utilities
| File | Purpose |
|------|---------|
| `projects/promptfolio/lib/claudeParser.ts` | Scoped Claude JSON → Promptfolio domain schema parser. Wrapped in try/catch. Graceful degradation. |
| `projects/promptfolio/lib/markdownRenderer.ts` | Gallery-grade prompt body renderer — syntax highlighting, spacing, typographic scale |
| `projects/promptfolio/lib/ogImageTemplate.tsx` | Satori/React layout for OG image — prompt as typography, Promptfolio watermark/lockup |
| `projects/promptfolio/lib/validators.ts` | Zod schemas for Portfolio, Prompt, ClaudeExport, manual input shapes |

### Types
| File | Purpose |
|------|---------|
| `projects/promptfolio/types/promptfolio.ts` | Domain types: `Portfolio`, `Prompt`, `ClaudeExport`, `OGImageProps`, `ExportPayload` |

### Assets
| File | Purpose |
|------|---------|
| `projects/promptfolio/public/fonts/` | Gallery-grade typeface files (e.g., Inter, Geist, or a premium serif for display headings) |
| `projects/promptfolio/public/promptfolio-wordmark.svg` *(optional)* | Wordmark for OG image watermarking |

### Tests (Deliverables)
| File | Purpose |
|------|---------|
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-file-structure.sh` | Verify every file in the spec exists |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-banned-patterns.sh` | Verify no light-mode leaks, no widget code, no barnacles |
| `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-build.sh` | Verify `npm run build` exits 0 and `.next/` contains expected routes |

---

## Out of Scope (Locked Decisions)

The following must **not** appear in v1:
- Light mode toggle or light-mode-specific styles
- ChatGPT JSON import
- "Try This Prompt" widget / interactive inference
- WordPress plugin architecture
- Multiple templates or theming system
- SEO wizards, newsletter widgets, popup chatbots, cookie banners
- Server-side DB queries on public portfolio pages
