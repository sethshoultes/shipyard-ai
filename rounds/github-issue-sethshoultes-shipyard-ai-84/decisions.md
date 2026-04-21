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
- **Elon objection on record:** SEO/discoverability risk. "Poster GitHub" returns GitHub's own projects.

### 2. One Inevitable Layout / Zero Customization
- **Proposed by:** Steve ("inevitable layout"); Elon converged ("one template at launch")
- **Winner:** Steve (framing); Mutual concession (execution)
- **Why:** Constraint breeds quality. Users are not designers — give them rope and they hang themselves, then blame you. The entire complexity budget goes into the *design template*, not the infrastructure. No sliders, no color pickers, no "brand kits," no Pro tier with extra fonts. The layout must feel like it could not have been any other way.

### 3. No AI Taglines in v1
- **Proposed by:** Elon (to cut); Steve fought to keep
- **Winner:** Elon
- **Why:** Physics beats poetry here. Claude adds 3 seconds and $0.02 per render. Three seconds kills the viral loop. `repo.description` is instant, free, and already exists. If the description is bad, the poster reflects reality — we don't hallucinate better copy. The "gasp" comes from the *render*, not the tagline. This is locked in the essence: "Ship the feeling, not the utility."

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
- **Why:** Every database is a team member who wakes you up at 3am. Read-only, stateless, embarrassingly parallel. Cache-first with R2/S3, 24h TTL. Hit = 50ms from cache. A single origin behind a CDN can serve millions. The database you don't have is the database you don't need to scale.
- **Steve concession:** "The infrastructure must not buckle."

### 7. Distribution: Output Is the Ad
- **Proposed by:** Elon; Steve emotionally amplified
- **Winner:** Elon (strategy); Steve (execution)
- **Why:** Every generated image URL is a viral billboard. Permissionless marketing — paste `poster.dev/github.com/user/repo` into 1,000 READMEs. Shields.io didn't grow because of Product Hunt; it grew because every README became a billboard. Do renders for the top 500 starred repos, tag maintainers. One good tweet of a beautiful Rails or React poster drives more organic traffic than a PH #1.
- **Cut:** Product Hunt as primary strategy, GitHub Actions Marketplace, social scheduling.

### 8. No GitHub Actions in v1
- **Proposed by:** Elon; Steve agreed
- **Winner:** Elon
- **Why:** Integration before product-market fit is arrogance. GitHub Actions requires YAML, versioning, and kills the "paste a URL" simplicity that makes this spread. Actions is v2 — after the gravity well exists.

### 9. Text Labels for Top 3 Languages (No Pie Charts)
- **Proposed by:** Elon; uncontested
- **Winner:** Elon
- **Why:** Pie charts are v2 scope creep. Text labels are sufficient, instant, and don't clutter the one inevitable layout.

### 10. GitHub App Auth + Token Rotation on Day One
- **Proposed by:** Elon; uncontested
- **Winner:** Elon
- **Why:** Unauthenticated GitHub API = 60 requests/hour. You'll hit this on day two. Token rotation is architecture, not an afterthought.

### 11. Pre-warm Trending Repos
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
| R2/S3 cache with 24h TTL | In |
| Sub-50ms cached response | In |
| Synchronous generation (no placeholders) | In |
| Pre-warmed cache for trending/top repos | In |
| `repo.description` as tagline source | In |
| Cloudflare Worker or lightweight VPS | In |
| AI tagline generation (Claude) | Out |
| Multiple design templates | Out |
| Customization panels / sliders / color pickers | Out |
| GitHub Actions integration | Out |
| Language pie charts | Out |
| Database | Out |
| Auth layer | Out |
| Frontend SPA | Out |
| JPG output | Out |
| Analytics dashboards | Out |
| Pro tier / monetization | Out |

**Target complexity:** ~200 lines of code. The magic is in the template, not the infrastructure.

---

## File Structure (What Gets Built)

```
├── src/
│   ├── index.ts              # Main request handler — routing, cache logic, response
│   ├── github.ts             # GitHub API client with token pool rotation
│   ├── template.ts           # The one inevitable layout — SVG string interpolation
│   ├── renderer.ts           # SVG → PNG rasterization (resvg-wasm or resvg-js)
│   └── cache.ts              # R2/S3 read/write with TTL logic
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

| # | Question | Context |
|---|----------|---------|
| 1 | **Color palette: curated presets or repo DNA extraction?** | Steve wants colors extracted from the repo itself ("the project reveals its own DNA"). Elon argues a curated 12-preset palette beats an algorithm that might yield `#CCCCCC` on every Rails repo. The essence is silent. **Decision needed.** |
| 2 | **Worker CPU limit vs. rasterization** | Cloudflare Workers have 50ms CPU limits. `resvg-wasm` might fail or timeout. The mitigation is "build the SVG path first, test rasterization in the first 20 minutes." If it fails, do we pivot to a VPS immediately, or maintain a dual path? **Decision needed.** |
| 3 | **What happens when `repo.description` is empty or garbage?** | Since we cut Claude, repos with no description or placeholder text ("A repository") will produce weak posters. Do we fall back to a generic subtitle, omit description entirely, or let the user suffer? **Decision needed.** |
| 4 | **Typography and design specifics** | "One inevitable layout" is a philosophy, not a spec. What font? What grid? What information hierarchy? The entire product lives or dies here. **Needs design craft, not engineering.** |
| 5 | **Exact caching behavior on miss** | Steve killed placeholders. On cache miss, we must generate synchronously. What is the timeout ceiling before the user gets an error? What does that error look like? **Decision needed.** |
| 6 | **Pre-warm target list** | "Trending repos" and "top 500 starred" are vague. What is the initial seed list? How often does it refresh? **Decision needed.** |
| 7 | **Brand voice and copy** | Steve's voice is locked (short sentences, certainty, no jargon). Who writes the homepage, the README, the error messages? **Needs owner.** |

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
| **Platform PNG compression** | Medium | Medium | Some platforms (Twitter, Slack) recompress images. PNG preserves quality but file size may hurt load times. Monitor. Accept in v1. | Engineering |
| **Viral loop fails — no gasp** | Medium | Critical | If the 30-second experience isn't breathtaking, the product is a utility, not a seduction. There's no metric for this. Trust taste. Test with 10 developers before public launch. | Design / Product |
| **Color extraction produces ugly results** | Low | Medium | If repo DNA extraction is chosen over curated palette, dominant colors may be dull. Mitigation: brightness/contrast guards or fallback to curated set. | Design |
| **Scope creep post-launch** | High | Medium | Every feature request that isn't the core magic gets the same answer: "That would make it better at being worse." Lock the gate. | Product |

---

## Coaching Notes from the Zen Master

Elon brought physics. Steve brought soul. The locked decisions keep the soul and armor it with physics.

- **Elon's greatest hits:** Stateless architecture, no database, cache-first, cut Claude, token rotation, output-as-distribution. These are in the build.
- **Steve's greatest hits:** "Poster," one inevitable layout, PNG-only, synchronous gasp, emotional hook, zero customization. These are in the build.
- **What got left on the floor:** AI taglines, multiple templates, GitHub Actions v1, JPG output, placeholders, "Poster Child."

The team doesn't get to re-litigate these. The build phase starts now. One layout. One URL. One gasp.

*— Phil*
