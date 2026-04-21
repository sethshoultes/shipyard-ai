# Shipyard Showcase — Locked Decisions
## Consolidated by Phil Jackson, Zen Master

---

## How to Read This Document

Every decision below passed through the forge. Where Elon and Steve disagreed, the ruling follows. Where they agreed, it is law. This is the single source of truth for the build phase. No new debates in pull requests. If a question is listed as "Open," bring data. Everything else is locked.

---

## Decisions by Domain

### 1. Architecture

| Decision | Proposed By | Winner | Ruling |
|----------|-------------|--------|--------|
| **Static export only** — Next.js static export to Cloudflare Pages. No CMS, no database, no runtime data fetching. | Elon (R1) | Elon | Complexity is the enemy of shipping. A static site survives the HN front page without a 3am pager. |
| **Hardcoded data manifest** — `products.ts` is a hand-curated TypeScript array. No directory scanner for `prds/completed/`. | Elon (R1, R2) | Elon | Twelve items, not twelve thousand. A parser with error handling and rebuild coupling is v2 masquerading as infrastructure. Steve conceded this in R2. |
| **No individual product detail pages** — The showcase is a single page of cards. Each card links externally to the live product or repo. | Elon (R1) | Elon | Detail pages add routing, layout variants, and content debt for zero conversion benefit. The museum is one room. |
| **Cloudflare Worker for OG images** — Already exists in `deliverables/`. Deploy, don't rebuild. | Elon (R1) | Elon | The Worker ships as-is. One `wrangler pages deploy` call. |
| **Cache-first Worker architecture** — `Cache-Control: max-age=86400` for identical GitHub repo requests. 24hr TTL minimum. | Elon (R1, R2) | Elon | GitHub rate limits are the real enemy. A popular post burns 5,000–15,000 requests/hour in minutes. Stateless Worker + cache-first is non-negotiable. Steve conceded this in R2. |

### 2. Performance

| Decision | Proposed By | Winner | Ruling |
|----------|-------------|--------|--------|
| **Lighthouse 95+** — Not 85/70. | Elon (R1) | Elon | The bar was embarrassingly low. 95+ is the floor. |
| **<150KB critical HTML, <800ms on 4G** | Elon (R1) | Elon | The first 30 seconds are sacred, and you cannot feel the hush before the page loads. Steve conceded the performance target implicitly by making speed part of the emotional hook. |
| **50KB image budget per card** — WebP/AVIF generated at build time. | Elon (R1, R2) | Elon | A raw screenshot can be 300KB+. Multiply by 15+ cards and you have a 4.5MB page. Capping images is the single highest-leverage performance decision. |
| **Lazy-load below the fold** | Elon (R1) | Elon | Required to hit the 800ms target. No negotiation. |
| **No live embeds that block the main thread** | Elon (R1) | Elon | Steve's "proof before promise" is satisfied by a screenshot that clicks through to the live demo. An iframe is a performance liability disguised as interactivity. |
| **Zero runtime data fetching** | Elon (R1) | Elon | Everything needed to render the page must be in the static bundle at build time. |

### 3. Design & Brand

| Decision | Proposed By | Winner | Ruling |
|----------|-------------|--------|--------|
| **Museum, not marketplace** — White space is reverence. No gradients. No shadows begging for attention. No borders drawing lines in the sand. | Steve (R1) | Steve | Elon conceded the museum metaphor works for the output in R2. The page must feel like a gallery where every piece matters. |
| **Typography so quiet it's loud** — Invisible until it's bad. No custom font stacks that require layout shifts. | Steve (R1) | Steve | Good typography is noticed only when it fails. This is a design principle, not a ticket. |
| **No carousels. No testimonials. No "as seen on." No social proof badges. No feature comparison tables. No "powered by" stickers. No team photos. No "our story." No animated counters. No "coming soon."** | Steve (R1) | Steve | Elon conceded every item in this list in R2. "Social proof badges are the visual equivalent of a cough in a library." Confidence is quiet. Insecurity is loud. |
| **No dropdown menus with seventeen options** | Steve (R1) | Steve | The navigation is a minimal header and a link back to the main site. Period. |
| **Brand voice: carved, not typed** — Short sentences. Periods, not semicolons. No "leverage," "synergy," or "AI-powered." We reveal, we don't explain. | Steve (R1) | Steve | Elon conceded this in R2. Every sentence should feel inevitable. |
| **One-word names *inside the showcase*** — Display names in cards: Poster. Agent. Local. Bench. Ops. Log. | Steve (R1, R2) | Steve | Elon conceded in R2: "Single-word names inside the showcase cards work; they keep the UI ruthlessly clean." **However:** Existing repo names, README references, and backlinks keep their canonical names. The one-word names are a *presentation-layer* decision, not a rename of the products themselves. This prevents link rot. |
| **First 30 seconds: no tours, no explanations, no onboarding** — Product already on, already magical. Proof before promise. | Steve (R1, R2) | Steve | Elon never contested this. It is the emotional thesis of the project. |
| **Emotional hook: magic, not "impressive for AI"** — Every card should make visitors feel the future arrived early. | Steve (R1) | Steve | This is the purpose of the page. If it doesn't feel like magic, it is a spreadsheet. |

### 4. Content

| Decision | Proposed By | Winner | Ruling |
|----------|-------------|--------|--------|
| **Seven individual Emdash plugin cards** — Not grouped into one card, not seven detail pages. Seven cards in the main grid. | Steve (R2) | Steve | Elon wanted to group them. Steve's rebuttal: "Grouping them says 'we make plugins.' Separating them says 'we ship with obsessive specificity.'" On a static page, seven extra entries in `products.ts` add zero technical complexity. The conviction argument wins. |
| **Hardcoded hero section** — Latest 3 products baked into source. Rebuild and redeploy when something new ships. | Elon (R1, R2) | Elon | A dynamic rotating hero is client-side state for a problem solved by `git commit`. A build hook is simpler and faster. |
| **Products are the distribution channel** — Every shipped tool carries Shipyard branding and a backlink. The showcase page converts inbound prospects; it does not acquire them. | Elon (R1) | Elon | Steve did not contest this. A `/work` page does not reach 10,000 users. The shipped products do. |

### 5. Testing & QA

| Decision | Proposed By | Winner | Ruling |
|----------|-------------|--------|--------|
| **No Cypress/Playwright automation** — Manual click-through + `curl` smoke tests. | Elon (R1, R2) | Elon | Massive overkill for a static page. Steve conceded this in R2. Automation is a v2 investment. |

### 6. Scope Cuts (v1 Explicitly Excludes)

| Cut | Champion | Reason |
|-----|----------|--------|
| Auto-generating product index from `prds/completed/` | Elon | Hand-curate first 12. Automate at 50. |
| Cypress/Playwright test suite | Elon + Steve | Manual + curl for v1. |
| "Warm cache" scripts for top repos | Elon | If it's not one `curl` command, skip it. The cache-first Worker handles this. |
| Dynamic rotating hero | Elon | Hardcode in source. Rebuild on new ship. |
| Emdash plugin individual detail pages | Elon | Group into cards on the main page, not into separate routes. |
| CMS / database backend | Elon | `products.ts` is the CMS. |
| Live iframe embeds | Elon | Static screenshots link to live demos. |

---

## MVP Feature Set (What Ships in v1)

### Core
1. **Single-page showcase (`/work`)** — Next.js static export, Cloudflare Pages.
2. **Hardcoded `products.ts`** — 12–15 curated items. Each entry: name (one word), description (1–2 carved sentences), screenshot URL, live demo URL, repo URL, ship date, tags.
3. **Hero section** — Hardcoded latest 3 products. Large, immediate, no carousel.
4. **Product grid** — Museum layout. White space. No shadows. No gradients. Cards are pedestals.
5. **Card anatomy** — Screenshot (WebP/AVIF, ≤50KB), one-word title, 1–2 sentence description, link to live product, link to repo.
6. **Emdash plugins as 7 individual cards** — Evidence of depth. No grouping.
7. **Minimal global navigation** — Shipyard logo/name, link to `/work`, link back to main site. No dropdowns. No phone-book footer.
8. **Cloudflare OG Image Worker** — Deployed from existing `deliverables/`.
9. **Cache-first Worker** — 24hr TTL on GitHub API calls.

### Performance Budget
- Critical HTML: <150KB
- Per-card image: ≤50KB WebP/AVIF
- Total page: renders in <800ms on 4G
- Lighthouse: 95+
- Zero runtime data fetching

### Brand & Copy
- Headline and subhead: ≤20 words total. Carved, not typed.
- No "AI-powered," "leverage," "synergy," "revolutionary."
- No testimonials, social proof, team photos, "our story," "as seen on."
- No "coming soon" — if it didn't ship, it doesn't exist.

### Testing
- Manual click-through of every card link.
- `curl` smoke test for 200s on `/work` and the OG Worker endpoint.
- Lighthouse CI or manual Lighthouse run before merge.

---

## File Structure (What Gets Built)

```
shipyard-showcase/
├── app/
│   ├── page.tsx                 # Main /work page (museum grid)
│   ├── layout.tsx               # Root layout, minimal nav, carved metadata
│   └── globals.css              # Typography, white space, no gradients
├── components/
│   ├── Hero.tsx                 # Hardcoded latest 3 products
│   ├── ProductCard.tsx          # Pedestal: image, one-word name, sentence, links
│   ├── ProductGrid.tsx          # Museum grid layout
│   └── Nav.tsx                  # Minimal header, no dropdowns
├── data/
│   └── products.ts              # Hardcoded manifest (12–15 items)
├── public/
│   └── images/                  # WebP/AVIF screenshots, ≤50KB each
├── deliverables/
│   └── og-worker/               # Existing Cloudflare Worker for OG images
├── tests/
│   └── smoke.sh                 # curl smoke tests
├── next.config.js               # Static export config
├── tsconfig.json
├── tailwind.config.js           # No custom shadow/gradient plugins
└── wrangler.toml                # Cloudflare Pages + Worker deploy config
```

**Rules for the build:**
- `products.ts` is the only source of content truth. No markdown parsers. No frontmatter scanners.
- Images live in `public/images/` and are optimized *before* commit. The build pipeline does not generate screenshots.
- The OG Worker deploys separately from the static site. One command each.
- No `app/[slug]/page.tsx`. No dynamic routes. No `getServerSideProps`.

---

## Open Questions (What Still Needs Resolution)

These are **not** blockers for starting the build, but they must be answered before shipping. If you pick one up, bring a recommendation and a rationale.

1. **Screenshot generation pipeline**
   - Who generates the ≤50KB WebP/AVIF screenshots? Is it a manual process (screenshot + Squoosh) or a one-time build script?
   - *Deadline:* Before first card is merged.

2. **Hero selection criteria**
   - "Latest 3 products" by ship date? By impact? By visual appeal?
   - *Deadline:* When `products.ts` is populated.

3. **Tag system**
   - Do cards have tags (e.g., "CLI", "Plugin", "API")? Steve would say no to anything that looks like a filter bar. Elon would say metadata is free in a static array.
   - *Recommendation:* Tags as plain text, no interactive filtering. Display only.
   - *Deadline:* Before visual design lock.

4. **Footer content**
   - Steve said "no footer that looks like a phone book." What *does* the footer contain? Copyright + one backlink? Nothing at all?
   - *Recommendation:* Copyright line + link to Shipyard main page. ≤10 words.
   - *Deadline:* Before copy review.

5. **Mobile layout for 7 Emdash cards**
   - 7 cards in a grid is elegant on desktop. On mobile, it becomes a long scroll. Is there a collapse strategy, or is the scroll intentional?
   - *Recommendation:* Intentional scroll. The museum is walked, not scanned.
   - *Deadline:* Responsive review.

6. **OG image default fallback**
   - The Worker generates images per-repo. What does the showcase page's own meta image look like?
   - *Deadline:* Before deploy.

7. **Analytics**
   - Do we add any analytics (Plausible, Fathom, Cloudflare Web Analytics) to know if the page converts?
   - *Elon's view:* If it adds a third-party script, it must be async and <5KB or it doesn't ship.
   - *Deadline:* Post-v1 decision. Default is none.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **GitHub API rate-limit under traffic** | Medium | Critical (Worker dies, demos break) | Cache-first Worker with 24hr TTL is mandatory. Pre-seed cache on deploy. | Elon |
| **Screenshots exceed 50KB budget** | High | High (page bloats, misses 800ms target) | Build-time audit script that fails CI if any `public/images/` file >50KB. Manual optimization gate. | Elon |
| **Design polish becomes time sink** | Medium | Medium (miss ship date) | Hard timebox: 4 hours of visual refinement post-functionality. Museum metaphor is a direction, not a deliverable. After 4 hours, ship. | Steve |
| **One-word names confuse existing users** | Low | Medium (support debt, broken expectations) | One-word names are display-only in the showcase. All canonical URLs, repos, and documentation keep original names. Document this distinction in `products.ts` comments. | Steve |
| **HN traffic overwhelms Cloudflare Pages** | Low | Medium | Static export on Cloudflare Pages scales infinitely. This is why we chose it. Risk is negligible unless Worker is uncached. | Elon |
| **Scope creep: "let's just add a blog"** | High | Medium | Any new page or feature requires a new PR and a written justification against this decisions document. No exceptions. | Phil |
| **Copy sounds like a press release** | Medium | High (undermines brand voice) | Every headline and description must pass the "tattoo test": if you wouldn't ink it, delete it. Steve has veto power on all copy. | Steve |
| **Lazy-loading implementation breaks SEO/image indexing** | Low | Low | Use native `loading="lazy"` with explicit `width`/`height` to prevent CLS. Test with Lighthouse. | Elon |

---

## Final Word from the Zen Master

> "The strength of the team is each member. The strength of each member is the team."

Elon brings the steel frame: static export, 50KB budget, cache-first Worker, hand-curated data. Without this, the museum collapses under its own weight before the first visitor arrives.

Steve brings the soul: museum metaphor, carved voice, one-word names, proof before promise. Without this, the frame is just a warehouse.

The blueprint above marries both. Build the frame first. Hang the art second. But never forget: **speed is taste, and taste is the whole argument.**

Ship the steel. Hang the art. Make them angry they didn't think of it first.

— Phil Jackson
