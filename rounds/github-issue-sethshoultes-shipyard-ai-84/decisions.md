# Decisions — Poster (Issue #84)

*Locked by the Zen Master. No further debate. Build what is written.*

---

## The Sacred Triangle

1. **One URL.** Paste it. Hold breath. Gasp. Share.
2. **One layout.** No choice. No regret. No customization.
3. **One feeling.** Respect. The gasp when spaghetti code looks like MoMA.

Everything else is scaffolding.

---

## Decisions by Combat

### 1. Product Name: "Poster"
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** One word. Iconic. No diminutive, no apology. Elon argued "Poster Child" is more discoverable and "Poster" is unsearchable — valid, but overruled. Brand identity is the product here. Searchability is a marketing problem, not a naming problem.
- **Elon objection on record:** SEO/discoverability risk. "Poster GitHub" returns GitHub's own projects. "Poster Child" has alliteration, rhythm, and irony.

### 2. One Inevitable Layout / Zero Customization
- **Proposed by:** Steve ("inevitable layout"); Elon converged ("one template at launch")
- **Winner:** Steve (framing); Mutual concession (execution)
- **Why:** Constraint breeds quality. Users are not designers — give them rope and they hang themselves, then blame you. The entire complexity budget goes into the *design template*, not the infrastructure. No sliders, no color pickers, no "brand kits," no Pro tier with extra fonts. The layout must feel like it could not have been any other way. However: Elon won on execution speed — ship the first layout that works, then iterate. Perfection is not a pre-launch luxury.

### 3. No AI Taglines in v1
- **Proposed by:** Elon (to cut); Steve fought to keep
- **Winner:** Elon
- **Why:** Physics beats poetry here. Claude adds 3 seconds and $0.02 per render. Three seconds kills the viral loop. `repo.description` is instant, free, and already exists. If the description is bad, the poster reflects reality — we don't hallucinate better copy. The "gasp" comes from the *render*, not the tagline. This is locked in the essence: "Ship the feeling, not the utility."
- **Steve concession (Round 2):** "Build your lean machine. Then fill it with something that makes people gasp."

### 4. PNG Only
- **Proposed by:** Steve; Elon argued for pragmatism
- **Winner:** Steve
- **Why:** JPG compresses text into dirt. When a developer sees their repo name rendered with artifacts, the magic dies. PNG is crisp, honest, perfect. Form follows function — and the function here is "gallery-worthy."
- **Elon objection on record:** Some platforms compress PNGs poorly; pure pragmatism says form should adapt to distribution reality.

### 5. Synchronous Generation — No Placeholders
- **Proposed by:** Steve; Elon suggested async generation with placeholder on cache miss
- **Winner:** Steve
- **Why:** "Paste, hold breath, gasp" requires instantaneity. A placeholder is a broken promise. A gray box kills the emotional hook before it starts. The 30-second gasp is the product. If we can't render it now, we don't promise it.

### 6. Stateless, Cache-First Architecture
- **Proposed by:** Elon; Steve conceded
- **Winner:** Elon
- **Why:** Every database is a team member who wakes you up at 3am. Read-only, stateless, embarrassingly parallel. Cache-first with R2/S3. The PNG cache key is `repo + commit SHA` — immutable. Metadata/API cache uses 24h TTL. Hit = 50ms from edge. A single origin behind a CDN can serve millions. The database you don't have is the database you don't need to scale.
- **Steve concession (Round 2):** "The infrastructure must not buckle. Build that exactly as you described."

### 7. Single Cloudflare Worker — One File System
- **Proposed by:** Elon; Steve conceded
- **Winner:** Elon
- **Why:** If it doesn't fit in one mental model, it doesn't ship. No queue, no auth layer, no admin panel, no dashboard. Complexity is a one-way valve — you can add, but you can never subtract under pressure. One file means one person can hold the entire system in working memory.

### 8. Distribution: Output Is the Ad
- **Proposed by:** Elon; Steve emotionally amplified
- **Winner:** Elon (strategy); Steve (execution)
- **Why:** Every generated image URL is a viral billboard. Permissionless marketing — paste `poster.dev/github.com/user/repo` into 1,000 READMEs. Shields.io didn't grow because of Product Hunt; it grew because every README became a billboard. Do renders for the top 500 starred repos, tag maintainers. One good tweet of a beautiful Rails or React poster drives more organic traffic than a PH #1.
- **Cut:** Product Hunt as primary strategy, GitHub Actions Marketplace, social scheduling.

### 9. No GitHub Actions in v1
- **Proposed by:** Elon; Steve agreed
- **Winner:** Elon
- **Why:** Integration before product-market fit is arrogance. GitHub Actions requires YAML, versioning, and kills the "paste a URL" simplicity that makes this spread. Actions is v2 — after the gravity well exists.

### 10. Text Labels for Top 3 Languages (No Pie Charts)
- **Proposed by:** Elon; Steve conceded
- **Winner:** Elon
- **Why:** Pie charts are v2 scope creep. Text labels are sufficient, instant, and don't clutter the one inevitable layout. Steve conceded in Round 2: "dynamic language pie charts are v2."

### 11. One Image Size / One Aspect Ratio
- **Proposed by:** Elon; Steve conceded
- **Winner:** Elon
- **Why:** Multiple image sizes are a trap disguised as flexibility. Ship one Twitter-card size and move on. Steve conceded in Round 2.

### 12. GitHub App Auth + Token Rotation on Day One
- **Proposed by:** Elon; uncontested
- **Winner:** Elon
- **Why:** Unauthenticated GitHub API = 60 requests/hour. You'll hit this on day two. Token rotation is architecture, not an afterthought.

### 13. Pre-warm Trending Repos
- **Proposed by:** Elon; Steve conceded as "table stakes"
- **Winner:** Elon
- **Why:** Ensures cache hits for the repos most likely to be shared. Drives the viral loop by guaranteeing the 50ms gasp for high-traffic targets.

---

## MVP Feature Set (What Ships in v1)

| Feature | Status |
|---------|--------|
| Single endpoint: `GET /:owner/:repo` | In |
| GitHub REST API fetch (repo name, owner, description, stars, forks, top 3 languages) | In |
| Authenticated API calls with token rotation | In |
| One inevitable layout (excellent typography, spacing, hierarchy) | In |
| PNG rasterization (crisp text, no artifacts) | In |
| R2/S3 cache keyed by `repo + commit SHA` (immutable PNG) | In |
| 24h TTL cache for API metadata | In |
| Sub-50ms cached response | In |
| Synchronous generation (no placeholders) | In |
| Pre-warmed cache for trending/top repos | In |
| `repo.description` as tagline source | In |
| Single Cloudflare Worker runtime | In |
| AI tagline generation (Claude) | Out |
| Multiple design templates | Out |
| Customization panels / sliders / color pickers | Out |
| GitHub Actions integration | Out |
| Language pie charts | Out |
| Database | Out |
| Auth layer / user accounts | Out |
| Frontend SPA / dashboard | Out |
| JPG output | Out |
| Analytics dashboards | Out |
| Pro tier / monetization | Out |
| Multiple image sizes / aspect ratios | Out |

**Target complexity:** ~200–400 lines of code. The magic is in the template, not the infrastructure.
**Primary runtime:** Cloudflare Worker
**Fallback:** $5 VPS (Node + resvg-js) if Worker CPU limits kill rasterization.

---

## File Structure (What Gets Built)

```
├── src/
│   ├── index.ts              # Main request handler — routing, cache logic, response
│   ├── github.ts             # GitHub API client with token pool rotation
│   ├── template.ts           # The one inevitable layout — SVG string interpolation
│   ├── renderer.ts           # SVG → PNG rasterization (resvg-wasm or resvg-js)
│   └── cache.ts              # R2/S3 read/write with immutable SHA keys + TTL
├── assets/
│   └── fonts/                # Web fonts for the inevitable layout (self-hosted)
├── scripts/
│   └── warm-cache.ts         # Pre-generation for trending repos
├── wrangler.toml             # Cloudflare Worker config (primary target)
├── package.json
└── README.md                 # The billboard — every repo's README is marketing
```

**Primary runtime:** Cloudflare Worker
**Fallback:** $5 VPS (Node + resvg-js) if Worker CPU limits kill rasterization.

---

## Open Questions (Needs Resolution Before Build)

| # | Question | Context | Leading Position |
|---|----------|---------|------------------|
| 1 | **Color palette: curated presets or repo DNA extraction?** | Steve wants colors extracted from the repo itself ("the project reveals its own DNA"). Elon argues a curated 12-preset palette beats an algorithm that might yield `#CCCCCC` on every Rails repo. Steve did not defend DNA extraction in Round 2 under time pressure. | **Elon** — curated palette ships faster and more reliably. |
| 2 | **Worker CPU limit vs. rasterization** | Cloudflare Workers have 50ms CPU limits. `resvg-wasm` might fail or timeout. The mitigation is "build the SVG path first, test rasterization in the first 20 minutes." If it fails, pivot to VPS immediately. | **Elon** — test in first 20 min; VPS fallback is plan B. |
| 3 | **What happens when `repo.description` is empty or garbage?** | Since we cut Claude, repos with no description or placeholder text ("A repository") will produce weak posters. Do we fall back to a generic subtitle, omit description entirely, or let the user suffer? | **Undecided** — needs product call. |
| 4 | **Typography and design specifics** | "One inevitable layout" is a philosophy, not a spec. What font? What grid? What information hierarchy? The entire product lives or dies here. | **Steve** — this is design craft, not engineering. Owner: Design. |
| 5 | **Exact caching behavior on miss** | Steve killed placeholders. On cache miss, we must generate synchronously. What is the timeout ceiling before the user gets an error? What does that error look like? | **Elon** — needs engineering spec. |
| 6 | **Pre-warm target list** | "Trending repos" and "top 500 starred" are vague. What is the initial seed list? How often does it refresh? | **Undecided** — needs ops plan. |
| 7 | **Brand voice and copy** | Steve's voice is locked (short sentences, certainty, no jargon). Who writes the homepage, the README, the error messages? | **Steve** — owner of brand voice. |
| 8 | **CJK / non-Latin font fallback** | Budget 30 minutes for debugging font paths and CJK character fallback inside WASM. What is the fallback strategy? | **Elon** — needs engineering spike. |

---

## Risk Register

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Worker rasterization timeout** | High | Critical | Build SVG path first. Test resvg-wasm in first 20 min. Fallback to Node VPS if fail. | Engineering |
| **GitHub API rate limits** | High | Critical | GitHub App auth + token rotation from day one. Not an afterthought. | Engineering |
| **"Poster" is unsearchable** | Medium | High | Own the README billboard distribution channel. SEO is secondary to virality. Accept risk or buy adwords later. | Marketing |
| **Bad repo descriptions produce weak posters** | High | Medium | No mitigation in v1 by design (Claude is cut). Accept that some repos will look like placeholders. Consider fallback copy or omission. | Product |
| **Single template doesn't resonate across repo types** | Medium | High | The "inevitable layout" must be truly excellent. If it falls flat for data science repos vs. frontend repos, v1 dies. Invest design time heavily here. | Design |
| **resvg-wasm reliability in edge environment** | Medium | High | Test early. Have VPS fallback ready. Consider pre-generation for all requested repos if sync generation proves flaky. | Engineering |
| **CJK / non-Latin font loading and fallback** | Medium | Medium | Budget 30 min for debugging font paths. Have system-font fallback. Test with CJK repo names early. | Engineering |
| **Platform PNG compression** | Medium | Medium | Some platforms (Twitter, Slack) recompress images. PNG preserves quality but file size may hurt load times. Monitor. Accept in v1. | Engineering |
| **Viral loop fails — no gasp** | Medium | Critical | If the 30-second experience isn't breathtaking, the product is a utility, not a seduction. There's no metric for this. Trust taste. Test with 10 developers before public launch. | Design / Product |
| **Color extraction produces ugly results** | Low | Medium | If repo DNA extraction is chosen over curated palette, dominant colors may be dull. Mitigation: brightness/contrast guards or fallback to curated set. | Design |
| **Scope creep post-launch** | High | Medium | Every feature request that isn't the core magic gets the same answer: "That would make it better at being worse." Lock the gate. | Product |
| **100x scaling without revenue model** | Low | High | If usage explodes, Claude inference cost is already cut. CDN + Worker costs are negligible. But GitHub token pool and R2 egress need monitoring. Fix monetization before scaling. | Product / Engineering |

---

## Coaching Notes from the Zen Master

Elon brought physics. Steve brought soul. The locked decisions keep the soul and armor it with physics.

- **Elon's greatest hits:** Stateless architecture, no database, single Worker, cache-first, immutable SHA keys, cut Claude, token rotation, output-as-distribution, one image size, no Actions in v1. These are in the build.
- **Steve's greatest hits:** "Poster," one inevitable layout, PNG-only, synchronous gasp, emotional hook, zero customization, brand voice, respect-as-drug. These are in the build.
- **Steve's Round 2 concessions (noted):** One Worker, no database, caching strategy, embed-as-billboard, PNG/WASM brittleness accepted, pre-warming is table stakes, pie charts are v2, multiple sizes are a trap, Claude cost is a pricing problem not a product problem (but accepted cut for v1).
- **What got left on the floor:** AI taglines, multiple templates, GitHub Actions v1, JPG output, placeholders, "Poster Child," repo DNA color extraction (likely v2), analytics dashboards, Pro tier, social scheduling.

**The synthesis principle:** *Cache something worth looking at.* Build Elon's lean machine. Fill it with Steve's gasp.

The team doesn't get to re-litigate these. The build phase starts now. One layout. One URL. One gasp.

*— Phil*
