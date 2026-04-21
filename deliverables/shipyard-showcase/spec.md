# Shipyard Showcase — Build Spec

## Goals

1. **Make shipped products tangible.** Visitors land and immediately see real deliverables with live, clickable examples. The page proves the pipeline is not a demo — it ships production software autonomously.
2. **Convert skepticism into trust.** Target audience: prospective clients, investors, and the developer community. Anyone who needs to believe "these agents really do ship production software."
3. **Maintain the Shipyard voice.** Sparse, confident, carved-not-typed. The showcase feels inevitable, not cluttered.

## Implementation Approach

### Architecture
- **Static export only.** Next.js App Router compiled to static HTML and deployed to Cloudflare Pages. No CMS, no database, no runtime data fetching, no server-side rendering.
- **Hardcoded data manifest.** `/website/src/lib/products.ts` is a hand-curated TypeScript array. It is the single source of content truth. No directory scanner, no markdown parser, no frontmatter reader.
- **Zero runtime dependencies.** Everything required to render the page must be in the static bundle at build time.

### Pages
1. **`/work`** — Single-page museum-style showcase. Product grid with 12–15 curated cards. No dynamic routes, no `[slug]` pages.
2. **`/`** — Homepage hero refresh. Above-the-fold block: "We ship production AI software autonomously. Here's what shipped this week." Plus hardcoded latest 3 products. CTA to `/work`.

### Components (all new)
- **`ProductCard.tsx`** — The pedestal. Screenshot (WebP/AVIF, ≤50KB, lazy-loaded), one-word display name, 1–2 carved sentences, links to live demo and repo.
- **`ProductGrid.tsx`** — Museum grid layout. 1 column mobile, 2 columns tablet, 3 columns desktop. White space is reverence.
- **`Hero.tsx`** — Hardcoded latest 3 products. Large, immediate, no carousel, no client-side state.
- **`Nav.tsx`** — Minimal header. Shipyard name/logo, link to `/work`, link back to main site. No dropdowns, no phone-book footer.

### Data
- **`/website/src/lib/products.ts`** — 12–15 entries. Interface: `{ name: string; displayName: string; tagline: string; screenshot: string; liveUrl?: string; repoUrl: string; shipDate: string; tags?: string[] }`. Display names inside cards are one word (Poster, Agent, Local, Bench, Ops, Log, etc.). Canonical repo names remain unchanged to prevent link rot.

### Assets
- **`/website/public/images/`** — WebP/AVIF screenshots. Optimized *before* commit. Build pipeline does not generate screenshots. Each file ≤50KB.

### OG Image Worker
- Deploy existing Cloudflare Worker from `deliverables/og-worker/`.
- Cache-first architecture: `Cache-Control: max-age=86400` (24hr TTL) on identical GitHub repo requests.
- Route: `poster.shipyard.company` via Cloudflare Worker route, with `*.workers.dev` fallback acceptable.
- Secrets: `CLOUDFLARE_API_TOKEN` and `GITHUB_TOKEN_POOL` injected via environment; no literals in code.

### Performance Budget
- Critical HTML payload: <150KB.
- Per-card image: ≤50KB WebP/AVIF.
- Total page renders in <800ms on simulated 4G.
- Lighthouse performance: 95+ (desktop and mobile).
- Lazy-load all images below the fold using native `loading="lazy"` with explicit `width`/`height`.
- No live embeds, iframes, or third-party scripts that block the main thread.

### Design Direction
- **Museum, not marketplace.** White space is reverence. No gradients, no shadows begging for attention, no borders drawing lines in the sand.
- **Typography so quiet it's loud.** Invisible until it fails. Match existing self-hosted font stack; no custom font stacks that cause layout shifts.
- **Carved, not typed.** Short sentences. Periods, not semicolons. No "AI-powered," "leverage," "synergy," "revolutionary."
- **Confidence is quiet.** No carousels, testimonials, "as seen on," social proof badges, feature comparisons, "powered by" stickers, team photos, "our story," animated counters, or "coming soon."
- **One-word names inside cards.** Poster. Agent. Local. Bench. Ops. Log. (Presentation layer only; canonical URLs and repos keep original names.)
- **First 30 seconds:** no tours, no explanations, no onboarding. Product already on, already magical. Proof before promise.

## Verification Criteria

### Functional
| Criterion | How to Verify |
|-----------|---------------|
| `/work` renders ≥10 product cards | `curl -s https://www.shipyard.company/work | grep -c "product-card"` ≥ 10 |
| Each card has a working link or live demo | Manual click-through of every card; `curl -I` on each `liveUrl` and `repoUrl` returns 2xx or 3xx |
| Homepage shows "Recently shipped" block with 3 products | Visual inspection; DOM contains exactly 3 hero product entries |
| OG Worker returns valid PNG | `curl -I https://poster.shipyard.company/github.com/sethshoultes/shipyard-ai` returns `200` and `content-type: image/png` |
| No broken images or 404s | Automated scan of all `<img src>` and `<a href>` on `/work` |

### Performance
| Criterion | How to Verify |
|-----------|---------------|
| Lighthouse ≥95 desktop & mobile | `tests/lighthouse.sh` (or manual Lighthouse CI run before merge) |
| Critical HTML <150KB | `tests/build-verification.sh` checks `out/index.html` size |
| Every image ≤50KB | `tests/image-budget.sh` audits `public/images/` |
| Page renders <800ms on 4G | Lighthouse "Speed Index" or WebPageTest simulated 4G |
| Zero runtime data fetching | `grep` build output and source for `fetch(`, `axios`, `swr` — none found in client bundle |

### Code Quality
| Criterion | How to Verify |
|-----------|---------------|
| `products.ts` compiles with strict TypeScript | `cd /website && npx tsc --noEmit` passes |
| No secrets in code | `tests/banned-patterns.sh` scans for `cfat_`, `ghp_`, `gho_` and other token prefixes |
| No banned literal patterns | `grep -r` across `/website/src` for banned strings exits 0 (meaning none found) |
| Static export produces `/work/index.html` | `tests/build-verification.sh` asserts file existence |
| No dynamic routes generated | `ls out/\[*/` or `ls out/work/\[*/` yields nothing |

### Build & Deploy
| Criterion | How to Verify |
|-----------|---------------|
| `next build` exits 0 | Run `npm run build` or `next build` in `/website` |
| Static export completes | `out/` directory contains `index.html` and `work/index.html` |
| Cloudflare Pages deploy succeeds | `wrangler pages deploy out/` returns success |
| Worker deploy succeeds | `wrangler deploy` in `deliverables/og-worker/` returns success |

## Files to Create or Modify

### New Files
| File | Purpose |
|------|---------|
| `/website/src/components/ProductCard.tsx` | Individual product pedestal card |
| `/website/src/components/ProductGrid.tsx` | Museum grid layout (1/2/3 col responsive) |
| `/website/src/components/Hero.tsx` | Hardcoded latest-3 hero section |
| `/website/src/components/Nav.tsx` | Minimal global navigation |
| `/website/src/lib/products.ts` | Hardcoded product manifest (single source of truth) |
| `/website/public/images/poster.webp` | Poster Child screenshot (≤50KB) |
| `/website/public/images/wp-agent.webp` | WP-Agent screenshot (≤50KB) |
| `/website/public/images/local-genius.webp` | LocalGenius Lite screenshot (≤50KB) |
| `/website/public/images/agentbench.webp` | AgentBench screenshot (≤50KB) |
| `/website/public/images/promptops.webp` | PromptOps screenshot (≤50KB) |
| `/website/public/images/agentlog.webp` | AgentLog screenshot (≤50KB) |
| `/website/public/images/membership.webp` | MemberShip screenshot (≤50KB) |
| `/website/public/images/eventdash.webp` | EventDash screenshot (≤50KB) |
| `/website/public/images/reviewpulse.webp` | ReviewPulse screenshot (≤50KB) |
| `/website/public/images/formforge.webp` | FormForge screenshot (≤50KB) |
| `/website/public/images/seodash.webp` | SEODash screenshot (≤50KB) |
| `/website/public/images/commercekit.webp` | CommerceKit screenshot (≤50KB) |
| `/website/public/images/adminpulse.webp` | AdminPulse screenshot (≤50KB) |
| `/home/agent/shipyard-ai/deliverables/shipyard-showcase/tests/smoke.sh` | curl smoke tests for 200s on `/work` and OG Worker |
| `/home/agent/shipyard-ai/deliverables/shipyard-showcase/tests/image-budget.sh` | Enforces ≤50KB per image in `public/images/` |
| `/home/agent/shipyard-ai/deliverables/shipyard-showcase/tests/banned-patterns.sh` | Scans source for `cfat_`, `ghp_`, `gho_` literals |
| `/home/agent/shipyard-ai/deliverables/shipyard-showcase/tests/build-verification.sh` | Validates static export output and HTML budget |

### Modified Files
| File | Change |
|------|--------|
| `/website/src/app/work/page.tsx` | Replace placeholder with museum grid using `ProductGrid` + `products.ts` |
| `/website/src/app/page.tsx` | Inject `Hero` component above existing content |
| `/website/src/app/layout.tsx` | Ensure `Nav` is rendered; update page metadata if needed |
| `/website/src/app/globals.css` | Confirm no gradient/shadow utility classes; verify typography scale |
| `/website/next.config.js` | Verify `output: 'export'` and `distDir: 'out'` are set |
| `/website/tailwind.config.js` | Confirm no custom shadow/gradient plugins |
| `/website/wrangler.toml` | Add Cloudflare Pages + OG Worker deploy configuration |
| `/website/tsconfig.json` | Add path alias for `@/lib/products` if not present |

### Deleted Files
None.
