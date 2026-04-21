# Shipyard Showcase — Running Todo

## Data Layer
- [ ] Create `/website/src/lib/products.ts` with TypeScript `Product` interface — verify: `grep -q "interface Product" /website/src/lib/products.ts`
- [ ] Add Poster Child entry to `products.ts` — verify: `grep -q "Poster" /website/src/lib/products.ts`
- [ ] Add WP-Agent entry to `products.ts` — verify: `grep -q "Agent" /website/src/lib/products.ts`
- [ ] Add LocalGenius Lite entry to `products.ts` — verify: `grep -q "Local" /website/src/lib/products.ts`
- [ ] Add AgentBench entry to `products.ts` — verify: `grep -q "Bench" /website/src/lib/products.ts`
- [ ] Add PromptOps entry to `products.ts` — verify: `grep -q "Ops" /website/src/lib/products.ts`
- [ ] Add AgentLog entry to `products.ts` — verify: `grep -q "Log" /website/src/lib/products.ts`
- [ ] Add MemberShip entry to `products.ts` — verify: `grep -q "MemberShip\|Membership" /website/src/lib/products.ts`
- [ ] Add EventDash entry to `products.ts` — verify: `grep -q "EventDash\|Eventdash" /website/src/lib/products.ts`
- [ ] Add ReviewPulse entry to `products.ts` — verify: `grep -q "ReviewPulse\|Reviewpulse" /website/src/lib/products.ts`
- [ ] Add FormForge entry to `products.ts` — verify: `grep -q "FormForge\|Formforge" /website/src/lib/products.ts`
- [ ] Add SEODash entry to `products.ts` — verify: `grep -q "SEODash\|Seodash" /website/src/lib/products.ts`
- [ ] Add CommerceKit entry to `products.ts` — verify: `grep -q "CommerceKit\|Commercekit" /website/src/lib/products.ts`
- [ ] Add AdminPulse entry to `products.ts` — verify: `grep -q "AdminPulse\|Adminpulse" /website/src/lib/products.ts`
- [ ] Type-check `products.ts` — verify: `cd /website && npx tsc --noEmit src/lib/products.ts` exits 0

## Components
- [ ] Create `ProductCard.tsx` component shell — verify: file exists at `/website/src/components/ProductCard.tsx`
- [ ] Add `ProductCard` props interface — verify: `grep -q "interface ProductCardProps" /website/src/components/ProductCard.tsx`
- [ ] Add lazy-loaded image to `ProductCard` — verify: `grep -q 'loading="lazy"' /website/src/components/ProductCard.tsx`
- [ ] Add one-word title rendering to `ProductCard` — verify: `grep -q "props.displayName\|props.name" /website/src/components/ProductCard.tsx`
- [ ] Add carved description to `ProductCard` — verify: `grep -q "props.tagline\|props.description" /website/src/components/ProductCard.tsx`
- [ ] Add live demo + repo links to `ProductCard` — verify: `grep -q "href" /website/src/components/ProductCard.tsx`
- [ ] Create `ProductGrid.tsx` with responsive grid classes — verify: `grep -q "grid-cols-1\|grid-cols-2\|grid-cols-3" /website/src/components/ProductGrid.tsx`
- [ ] Create `Nav.tsx` with logo and `/work` link — verify: `grep -q '/work' /website/src/components/Nav.tsx`
- [ ] Create `Hero.tsx` importing 3 hardcoded products — verify: `grep -q "import.*products" /website/src/components/Hero.tsx` and `grep -c "ProductCard" /website/src/components/Hero.tsx` equals 3 or more
- [ ] Update `/website/src/app/work/page.tsx` to render `ProductGrid` — verify: `grep -q "ProductGrid" /website/src/app/work/page.tsx`
- [ ] Update `/website/src/app/page.tsx` to render `Hero` — verify: `grep -q "Hero" /website/src/app/page.tsx`

## Assets
- [ ] Export Poster Child screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/poster.webp` ≤ 51200
- [ ] Export WP-Agent screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/wp-agent.webp` ≤ 51200
- [ ] Export LocalGenius Lite screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/local-genius.webp` ≤ 51200
- [ ] Export AgentBench screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/agentbench.webp` ≤ 51200
- [ ] Export PromptOps screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/promptops.webp` ≤ 51200
- [ ] Export AgentLog screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/agentlog.webp` ≤ 51200
- [ ] Export MemberShip screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/membership.webp` ≤ 51200
- [ ] Export EventDash screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/eventdash.webp` ≤ 51200
- [ ] Export ReviewPulse screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/reviewpulse.webp` ≤ 51200
- [ ] Export FormForge screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/formforge.webp` ≤ 51200
- [ ] Export SEODash screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/seodash.webp` ≤ 51200
- [ ] Export CommerceKit screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/commercekit.webp` ≤ 51200
- [ ] Export AdminPulse screenshot to WebP ≤50KB — verify: `stat -c%s /website/public/images/adminpulse.webp` ≤ 51200

## Styles & Layout
- [ ] Audit `globals.css` for banned patterns — verify: `! grep -q "gradient\|shadow" /website/src/app/globals.css` (except standard `box-shadow: none`)
- [ ] Confirm typography matches existing site — verify: visual comparison with `/website/src/app/page.tsx` font stack
- [ ] Update `layout.tsx` to include `Nav` if not present — verify: `grep -q "Nav" /website/src/app/layout.tsx`

## Configuration
- [ ] Verify `next.config.js` has `output: 'export'` — verify: `grep -q "output.*export" /website/next.config.js`
- [ ] Verify `next.config.js` has `distDir: 'out'` — verify: `grep -q "distDir.*out" /website/next.config.js`
- [ ] Verify `tailwind.config.js` has no shadow/gradient plugins — verify: `! grep -qi "shadow\|gradient" /website/tailwind.config.js` (except core plugins)
- [ ] Update `wrangler.toml` for Pages + Worker — verify: `grep -q "pages_build_output_dir" /website/wrangler.toml`

## OG Worker
- [ ] Deploy OG Worker to Cloudflare — verify: `curl -I https://poster.shipyard.company/github.com/sethshoultes/shipyard-ai` returns 200
- [ ] Set `GITHUB_TOKEN_POOL` secret via wrangler — verify: `wrangler secret list` shows `GITHUB_TOKEN_POOL`

## Testing
- [ ] Create `tests/smoke.sh` — verify: `bash -n tests/smoke.sh` exits 0
- [ ] Create `tests/image-budget.sh` — verify: `bash -n tests/image-budget.sh` exits 0
- [ ] Create `tests/banned-patterns.sh` — verify: `bash -n tests/banned-patterns.sh` exits 0
- [ ] Create `tests/build-verification.sh` — verify: `bash -n tests/build-verification.sh` exits 0
- [ ] Make all test scripts executable — verify: `test -x tests/smoke.sh && test -x tests/image-budget.sh && test -x tests/banned-patterns.sh && test -x tests/build-verification.sh`
- [ ] Run `tests/smoke.sh` against production — verify: exits 0
- [ ] Run `tests/image-budget.sh` — verify: exits 0
- [ ] Run `tests/banned-patterns.sh` — verify: exits 0
- [ ] Run `tests/build-verification.sh` after `next build` — verify: exits 0

## Build & Deploy
- [ ] Run `next build` in `/website` — verify: exits 0 and creates `out/` directory
- [ ] Run `wrangler pages deploy out/` — verify: command succeeds and URL is live
- [ ] Run manual Lighthouse audit — verify: Performance score ≥95
- [ ] Manual click-through of every card on `/work` — verify: all links work, no 404s, no broken images
- [ ] Verify homepage shows 3 products in hero — verify: visual inspection
