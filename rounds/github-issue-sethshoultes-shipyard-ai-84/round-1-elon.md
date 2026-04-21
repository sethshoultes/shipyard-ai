# Round 1: Elon — Poster Child

## Architecture
First principles: this is a template renderer, not an AI product. The simplest system is `GET /:owner/:repo` → GitHub REST API → HTML template → PNG. One Cloudflare Worker or one $5 VPS. No database. No auth. No frontend SPA.

Cloudflare Workers are sexy until you hit 50ms CPU limits rasterizing SVGs. Satori + resvg-wasm *might* work, but if it doesn't, don't pivot to 3 services — rent a server. Statelessness is your friend.

## Performance
Bottleneck is sequential latency, not concurrency. Naive path: GitHub API (800ms) + Claude (3000ms) + image gen (2000ms) = ~6s. That's a dead product.

10x path: Cache everything. READMEs change weekly, not secondly. Store generated PNGs in R2/S3 with a 24h TTL. Hit = 50ms from cache. Miss = generate async and return a placeholder. Better: pre-warm trending repos.

Cut Claude entirely for v1. It adds 3 seconds and $0.02 per render. Use `repo.description` — it's already there, it's free, and it's instant.

## Distribution
"Product Hunt" and "GitHub Actions marketplace" are not distribution strategies — they're launch tactics and integration catalogs. You can't scale to 10,000 users on a Product Hunt post.

Real distribution: the output IS the ad. Every generated image URL is a viral billboard. Paste `posterchild.dev/github.com/user/repo` into 1,000 READMEs. Do renders for the top 500 starred repos and tweet them with the maintainers tagged. Permissionless marketing. One good tweet of a beautiful Rails or React poster drives more organic traffic than a PH #1.

GitHub Actions is v2. It requires YAML, versioning, and kills the "paste a URL" simplicity that makes this spread.

## What to CUT
- **AI tagline generation**: Pure scope creep. v2 feature masquerading as v1. The repo has a description field. Use it.
- **GitHub Actions**: Integration before product-market fit is arrogance.
- **Language breakdown pie charts**: v2. Text labels for top 3 languages are sufficient.
- **Multiple design templates**: One excellent template beats five mediocre ones. Constraint breeds quality.

## Technical Feasibility
Yes. This is ~200 lines of code. Fetch JSON, interpolate strings, rasterize SVG. The entire complexity budget should be spent on the *design template*, not the infrastructure.

The only technical risk: image generation in a Worker environment. If resvg-wasm fails or times out, the session dies. Mitigation: build the SVG path first, test rasterization in the first 20 minutes.

## Scaling
At 100x usage, two things break:

1. **GitHub API rate limits**: Unauthenticated = 60 requests/hour. You'll hit this on day two. You need GitHub App authentication and token rotation by design, not as an afterthought.
2. **Worker CPU**: 50ms is nothing for image generation. At scale, move rasterization to a queue-backed Node service or pre-generate everything.

What doesn't break? The conceptual model. It's read-only, stateless, and embarrassingly parallel. A single origin server behind a CDN can serve millions of cached images. The database you don't have is the database you don't need to scale.
