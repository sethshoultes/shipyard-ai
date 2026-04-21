# Spec: Poster (Issue #84)

> Locked decisions from `decisions.md`. No re-litigation. Build what is written.

---

## 1. Goals

From the PRD and debate lock:

- **Primary:** Build a one-click tool that turns any public GitHub repository URL into a beautiful, gallery-worthy social preview image (PNG Open Graph card).
- **Experience:** User pastes `poster.dev/github.com/:owner/:repo`, holds breath, and gets an instant, crisp PNG poster. No sliders. No templates. No waiting.
- **Distribution:** Every rendered image URL is a viral billboard. The output *is* the ad.
- **Emotional standard:** The poster must make a scrappy side project look like it has a design team. One layout. One feeling. Respect.

---

## 2. Implementation Approach

### 2.1 Architecture
- **Runtime:** Cloudflare Worker (primary). Fallback to `$5 VPS` (Node + resvg-js) only if Worker CPU limits make rasterization unreliable.
- **State:** Stateless. No database. Embarrassingly parallel.
- **Cache:** R2/S3 cache-first with 24-hour TTL. Cache hit target = < 50 ms.
- **Generation:** Synchronous. No placeholders. On cache miss, generate the PNG immediately. If generation exceeds timeout ceiling, return a clean error — never a gray box.

### 2.2 Routing
- Single endpoint: `GET /:owner/:repo`
- Parses owner and repo from path, fetches metadata, renders PNG, returns with correct `Content-Type: image/png`.

### 2.3 Data Layer
- **GitHub REST API v3** — repo name, owner avatar/name, description, stars, forks, top 3 languages.
- **Authentication:** GitHub App auth with token pool rotation from day one. Unauthenticated API (60 req/hr) is unacceptable.
- **Tagline source:** `repo.description` only. No AI tagline generation in v1 (cut for speed + cost).

### 2.4 Rendering Pipeline
1. Fetch repo metadata from GitHub API.
2. Load SVG template string, interpolate metadata + top-3 language text labels.
3. Rasterize SVG → PNG via `resvg-wasm` (Worker) or `resvg-js` (VPS fallback).
4. Write PNG to cache (R2/S3) with 24h TTL.
5. Return PNG bytes.

### 2.5 Design Constraints (Locked)
- **One inevitable layout** — no customization, no brand kits, no Pro fonts, no color pickers.
- **PNG only** — no JPG. Crisp text is non-negotiable.
- **Top 3 languages as text labels** — no pie charts.
- **Color palette:** Open question (see decisions.md Q1). Spec placeholder: either curated 12-preset palette or repo-DNA extraction with brightness/contrast guards. Decision must be made before `template.ts` is written.
- **Typography:** Self-hosted web fonts in `assets/fonts/`. Exact typeface is a design decision to be resolved before build.

### 2.6 Cache Warming
- `scripts/warm-cache.ts` pre-generates posters for trending / top-starred repos.
- Ensures viral-loop targets are always cache hits.
- Initial seed list and refresh cadence are open questions (see decisions.md Q6) to be resolved before build.

### 2.7 Error Handling
- Empty or garbage `repo.description`: fall back to generic subtitle or omit description line entirely (decision needed per decisions.md Q3).
- GitHub API failure: propagate as HTTP 502 with minimal, on-brand error body.
- Rasterization timeout: HTTP 504. No placeholder image.

### 2.8 What Is Explicitly Out of Scope (v1)
- AI / Claude tagline generation
- Multiple design templates
- Customization panels / sliders / color pickers
- GitHub Actions integration
- Language pie charts
- Database
- Auth layer (user login)
- Frontend SPA
- JPG output
- Analytics dashboards
- Pro tier / monetization

---

## 3. Verification Criteria

| Feature | How to Prove It Works |
|---------|----------------------|
| `GET /:owner/:repo` returns PNG | `curl -s -o /tmp/out.png -w "%{content_type}" https://worker.dev/vercel/next.js \| grep -q "image/png" && file /tmp/out.png \| grep -q "PNG"` |
| Cache hit < 50 ms | `curl -w "%{time_total}"` on second request shows < 0.050s |
| Synchronous generation (no placeholder) | First request for a new repo returns a valid PNG, not a 202 or HTML page |
| GitHub auth + token rotation | `src/github.ts` contains no unauthenticated `api.github.com` calls; token pool rotation logic is present |
| PNG only | Source code contains no `.jpg`, `.jpeg`, or `image/jpeg` references |
| No AI taglines | Source code contains no `claude`, `anthropic`, `generateTagline`, or `aiTagline` references |
| No pie charts | Source code contains no `pie`, `doughnut`, or chart-library imports |
| No database | No `prisma`, `drizzle`, `postgres`, `mysql`, `sqlite`, `mongodb` in `package.json` dependencies |
| Stateless | No env vars for DB connection strings; no `CREATE TABLE` or migration files |
| One template | `src/template.ts` exports exactly one template function; no template registry or switch statement on template IDs |
| Cache TTL 24h | `src/cache.ts` writes objects with `Cache-Control: max-age=86400` or R2 metadata equivalent |
| Cache warming script | `scripts/warm-cache.ts` exists and is executable via `npx tsx` or `node` |
| Sub-50ms cached response | Load-test with `wrk` or `autocannon`: 95th percentile < 50 ms on cached URLs |
| End-to-end < 5s on miss | `time curl` for uncached repo completes in < 5 seconds |
| Exit code discipline | All shell scripts in `tests/` exit 0 on pass, non-zero on fail |
| No customization UI | No HTML forms, no CSS for sliders/pickers, no query-param parsing for `theme` or `color` |
| Font assets self-hosted | `assets/fonts/` contains at least one `.woff2` file; no Google Fonts CDN links in template |

---

## 4. Files Created or Modified

### Source
| File | Status | Purpose |
|------|--------|---------|
| `src/index.ts` | **Create** | Main request handler — routing, cache read/write, orchestration |
| `src/github.ts` | **Create** | GitHub API client with authenticated token pool rotation |
| `src/template.ts` | **Create** | The one inevitable layout — SVG string interpolation function |
| `src/renderer.ts` | **Create** | SVG → PNG rasterization wrapper (`resvg-wasm` or `resvg-js`) |
| `src/cache.ts` | **Create** | R2/S3 read/write with TTL logic and cache-key generation |

### Assets
| File | Status | Purpose |
|------|--------|---------|
| `assets/fonts/` | **Create** | Self-hosted web fonts for the inevitable layout |

### Scripts
| File | Status | Purpose |
|------|--------|---------|
| `scripts/warm-cache.ts` | **Create** | Pre-generation for trending/top repos |

### Config
| File | Status | Purpose |
|------|--------|---------|
| `wrangler.toml` | **Create** | Cloudflare Worker config (name, routes, vars, R2 bucket binding) |
| `package.json` | **Create** | Dependencies (`resvg-wasm` or `resvg-js`, `typescript`, `wrangler`, etc.) |
| `tsconfig.json` | **Create** | TypeScript compiler options for Worker / Node target |

### Documentation
| File | Status | Purpose |
|------|--------|---------|
| `README.md` | **Create** | Billboard copy — usage, endpoint format, examples |

### Tests (this deliverable)
| File | Status | Purpose |
|------|--------|---------|
| `tests/test-file-structure.sh` | **Create** | Verify all required files exist |
| `tests/test-banned-patterns.sh` | **Create** | Verify no banned patterns (jpg, db, pie charts, AI taglines, etc.) |
| `tests/test-source-integrity.sh` | **Create** | Verify source files contain expected exports / function signatures |
| `tests/test-config.sh` | **Create** | Verify package.json and wrangler.toml integrity |

### CI (optional but recommended)
| File | Status | Purpose |
|------|--------|---------|
| `.github/workflows/poster-ci.yml` | **Create** | Run test scripts on push/PR, validate build |

---

## 5. Open Questions to Resolve Before Build Starts

Per `decisions.md`:

1. **Color palette:** Curated 12-preset vs. repo-DNA extraction with guards?
2. **Worker CPU limit:** If `resvg-wasm` fails in first 20 min, pivot to VPS fallback immediately or maintain dual path?
3. **Empty description fallback:** Generic subtitle, omit line, or let it suffer?
4. **Typography & grid specifics:** Exact font, sizing scale, information hierarchy.
5. **Cache-miss timeout ceiling:** Hard limit before error response.
6. **Pre-warm seed list:** Exact repos and refresh cadence.
7. **Brand voice owner:** Homepage, README, error message copywriter.

---

*Spec version: 1.0 — locked by debate decisions. Any deviation requires director re-approval.*
