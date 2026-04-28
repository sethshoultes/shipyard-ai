# Spec — Aria (Changelog Theatre v2)

> Project: `changelog-theatre-v2` (re-queue of issue #82, shipped hollow 2026-04-27)
> PRD: `/home/agent/shipyard-ai/prds/changelog-theatre-v2.md`
> Decisions: `/home/agent/shipyard-ai/rounds/changelog-theatre-v2/decisions.md`
> Plan: *N/A — `.planning/phase-1-plan.md` covers issue #99 (CF Pages auto-deploy) and does not apply to this build.*

---

## 1. Goals

1. **Turn commit history into cinema.** Accept a GitHub repo + date range, generate a ~60-second MP4 that narrates the changelog in a dramatic voice over an ambient score.
2. **Workers-only API surface.** The public-facing API lives entirely on Cloudflare Workers (routes, queue, R2 storage). No Redis, no AWS services in any package.
3. **Real MP4 output, not a hollow mock.** The pipeline must fetch real commits, generate real narration audio, compose real Remotion scenes, and deliver a playable MP4 URL. Issue #82 shipped specs and images but zero working code — v2 must close that gap.
4. **Decoupled renderer.** Because Workers cannot run Chrome/FFmpeg, rendering happens on an external node (Fly.io VPS or Remotion Lambda) that consumes a queue and posts results back.
5. **Single-button happy path.** The web UI is one input (repo URL) and one button. No settings panels, no preview mode, no commit-hash checkboxes.
6. **Honest progress while waiting.** 6–12 min render time is physical reality. The waiting screen is a black "curtain rising" experience with truthful progress updates.
7. **≥ 10 source files.** PRD mandate. The 3-package architecture naturally produces ~20 files, so this is satisfied without padding.
8. **`tsc --noEmit` passes.** All TypeScript in `packages/api` and `packages/renderer` type-checks cleanly.

---

## 2. Implementation Approach

### 2.1 High-Level Architecture (per locked debate decisions)

Three independent packages in a workspace root:

| Package | Runtime | Responsibility |
|---------|---------|--------------|
| `packages/api` | Cloudflare Workers | Public REST API, GitHub fetch, GPT-4 narrative, OpenAI TTS, Queue producer, R2 storage, internal completion webhook |
| `packages/renderer` | Fly.io VPS (Node.js) | Queue consumer, Remotion composition + Puppeteer + FFmpeg, MP4 encode, callback to API |
| `packages/web` | Cloudflare Pages | Static single-page app: paste repo → press button → poll for MP4 URL |

**Data flow:**
```
User → web POST to /api/changelog
       → api fetches commits (GitHub API)
       → api generates narrative (GPT-4)
       → api generates TTS audio (OpenAI)
       → api writes job state to R2
       → api enqueues message { jobId, repo, since, until }
       → renderer pulls from queue
       → renderer builds Remotion composition (3 scenes)
       → renderer renders MP4 + muxes audio
       → renderer uploads MP4 to R2
       → renderer POSTs /api/internal/complete { outputUrl }
       → api updates job state
User polls GET /api/changelog/:jobId → receives outputUrl
```

### 2.2 API Package (`packages/api/`)

Built on Hono (lightweight, Workers-native). Bindings: R2 bucket, Queue, D1 is **explicitly excluded** per debate decision.

| File | Responsibility |
|------|----------------|
| `src/index.ts` | Hono app, CORS, health check, mount all routes |
| `src/types.ts` | `Job`, `QueueMessage`, `RenderResult`, `ChangelogRequest` interfaces |
| `src/routes/jobs.ts` | `POST /api/changelog` — validate body, orchestrate fetch → narrative → TTS → enqueue → return `jobId` |
| `src/routes/poll.ts` | `GET /api/changelog/:jobId` — read job state from R2, return status + `outputUrl` when ready |
| `src/routes/complete.ts` | `POST /api/internal/complete` — renderer callback, updates job state with `outputUrl` |
| `src/routes/gallery.ts` | `GET /api/gallery` — list recent completed jobs for public gallery (repo name, date, video URL) |
| `src/services/github.ts` | GitHub API client. `Authorization: Bearer ${GITHUB_TOKEN}`. Fetch commits between two dates. Handle pagination, rate limits, empty ranges. |
| `src/services/narrative.ts` | OpenAI GPT-4 call. Feed commit messages, receive dramatic Sorkin-style script. Capped at 150 tokens. Returns array of `{ text, timestamp }`. |
| `src/services/tts.ts` | OpenAI TTS call (`tts-1` model). Voices: alloy, echo, onyx. Returns audio buffer/URL. |
| `src/services/queue.ts` | Cloudflare Queue producer. Send `{ jobId, repo, since, until }`. |
| `src/services/storage.ts` | R2 wrapper. Read/write job state JSON blobs, store final MP4s. Keyed by `jobId`. |

**Job state schema (R2 JSON blob):**
```json
{
  "jobId": "uuid",
  "repo": "owner/name",
  "since": "2026-04-21",
  "until": "2026-04-28",
  "status": "pending|fetching|narrating|rendering|complete|failed",
  "createdAt": "ISO string",
  "outputUrl": "https://r2.example.com/aria/jobs/uuid.mp4",
  "error": null
}
```

**Rate limiting:** 3 free renders/day per IP. Tracked in R2 with a simple counter key `rate:{ip}:{yyyy-mm-dd}`. Paid tier unlocks more (stubbed for v1).

### 2.3 Renderer Package (`packages/renderer/`)

Node.js service running on Fly.io (Dockerized). Owns Chrome, Puppeteer, FFmpeg, Remotion.

| File | Responsibility |
|------|----------------|
| `src/index.ts` | Queue consumer loop. Polls queue (or runs as long-lived worker pulling messages). For each message: run render pipeline, post result. |
| `src/render.ts` | Remotion orchestration. Build composition props, call `renderMedia()` to produce MP4, mux with TTS audio + music bed via FFmpeg. |
| `src/api.ts` | HTTP client that POSTs back to `POST /api/internal/complete` with `{ jobId, outputUrl }`. |
| `src/env.ts` | Config validation (`API_URL`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `OPENAI_API_KEY`). Fails fast on missing vars. |
| `remotion/Video.tsx` | Root Remotion composition. 3-scene sequence, 9:16 vertical, total ~60s. |
| `remotion/scenes/TitleCard.tsx` | Scene 1: Repo name as film title, black background, subtle light-shaft gradient. ~8s. |
| `remotion/scenes/CommitList.tsx` | Scene 2: Narrated summary as cinematic text overlays. ~44s. |
| `remotion/scenes/Outro.tsx` | Scene 3: "That was you. That mattered." + "Made by Aria" end card. ~8s. |
| `remotion/styles/theme.ts` | Typography scale, color tokens (black, off-white, gold accent), pacing constants. |
| `public/music-bed.mp3` | Licensed/generated ambient loop. Mixed under narration at -18dB. |
| `package.json` | Deps: `remotion`, `@remotion/renderer`, `puppeteer`, `ffmpeg-static` (or system ffmpeg). |
| `Dockerfile` | Node + Chrome + FFmpeg base image. Pin versions for reproducibility. |

**Renderer constraints:**
- Max 2 concurrent renders (hard cap to prevent choking).
- Queue depth monitoring via health-check endpoint.
- Pin Chrome and Remotion versions — Puppeteer is brittle.

### 2.4 Web Package (`packages/web/`)

Static site deployed to Cloudflare Pages. Vanilla TypeScript, no framework (scope control).

| File | Responsibility |
|------|----------------|
| `index.html` | Single-page app shell. Black background, minimal markup. |
| `src/main.ts` | One-button app logic: input validation, POST to API, start polling, update "curtain rising" progress UI, display download link when ready. |
| `src/style.css` | Black screen, minimal UI, elegant typography, slow progress indicator animation. |
| `package.json` | Static build deps (vite or plain tsc — lightweight). |

### 2.5 Root & Shared

| File | Responsibility |
|------|----------------|
| `package.json` | Workspace root. Defines `workspaces: ["packages/*"]`. No root deps except dev tools. |
| `README.md` | Usage, demo curl, infra setup (env vars, wrangler deploy, Fly.io launch). |
| `tsconfig.json` | Shared TS config extended by packages. |

### 2.6 Tests

| File | Responsibility |
|------|----------------|
| `packages/api/tests/git-fetch.test.ts` | Mocked GitHub API responses. Verify commit parsing, pagination, empty range, rate-limit handling. |
| `packages/api/tests/scene-composer.test.ts` | Pure function tests for turning script lines + commits into Remotion-ready props. |
| `packages/renderer/tests/theme.test.ts` | Verify theme tokens are valid React/CSS values. |

### 2.7 PRD ↔ Decisions Reconciliation

| PRD Requirement | Debate Decision | Resolution in this spec |
|-----------------|-----------------|------------------------|
| `src/db.ts` + D1 migrations | No D1 / R2 for job state | Replaced with `src/services/storage.ts` (R2 JSON blobs). No migrations needed. |
| `src/scene-composer.ts` | 3 scenes, no custom animation engine | `packages/renderer/remotion/` holds 3 scene components. Composition logic in `render.ts`. |
| `wrangler.toml` with D1 binding | No D1 | `wrangler.toml` binds R2 + Queue only. |
| Workers-only stack | Renderer must be external | API is Workers-only. Renderer is decoupled Fly.io node. No AWS. |

---

## 3. Verification Criteria

### 3.1 Type Safety & Build

| # | Criterion | How to Verify |
|---|-----------|-------------|
| B1 | TypeScript compiles without errors | Run `tsc --noEmit` in `packages/api` and `packages/renderer`. Exit 0 required. |
| B2 | No banned dependencies | Grep all `package.json` files for `redis`, `aws-sdk`, `@aws-sdk`, `@aws/`. Confirm zero matches. |
| B3 | Workspace structure valid | `npm` or `pnpm` recognizes workspaces. `ls packages/api packages/renderer packages/web` succeeds. |

### 3.2 API Package

| # | Criterion | How to Verify |
|---|-----------|-------------|
| A1 | `POST /api/changelog` accepts valid body | `curl` with JSON body `{"repo":"sethshoultes/shipyard-ai","since":"2026-04-21","until":"2026-04-28","voice":"alloy"}`. Returns 200 + `{ jobId }`. |
| A2 | `GET /api/changelog/:jobId` returns job state | `curl` the jobId. Returns JSON with `status` field. |
| A3 | `POST /api/internal/complete` updates job state | Mock renderer callback with `{ jobId, outputUrl }`. Subsequent GET returns `status: "complete"` and the URL. |
| A4 | GitHub service fetches commits | Unit test with mocked `fetch`. Verify correct `Authorization: Bearer` header, pagination handling, date filtering. |
| A5 | Narrative service generates script | Unit test with mocked OpenAI response. Verify output is array of `{ text, timestamp }`. |
| A6 | TTS service generates audio | Unit test with mocked OpenAI response. Verify audio buffer returned. |
| A7 | Rate limiter caps at 3/day | Unit test: 4th request in same day returns 429. |
| A8 | R2 storage reads/writes JSON | Unit test with mocked R2 binding. Verify `get`/`put` round-trip. |

### 3.3 Renderer Package

| # | Criterion | How to Verify |
|---|-----------|-------------|
| R1 | Remotion composition builds | `npx remotion compositions` lists `Video` composition with expected duration (~60s) and 9:16 dimensions. |
| R2 | 3 scenes present | Grep `remotion/Video.tsx` for `<TitleCard`, `<CommitList`, `<Outro`. Confirm all three. |
| R3 | Theme tokens are valid | Unit test: import `theme.ts`, assert all color values are valid hex/rgba, all font sizes are positive numbers. |
| R4 | Dockerfile builds | `docker build -t aria-renderer .` completes without error. |
| R5 | Health-check endpoint exists | `curl http://localhost:3000/health` returns 200. |

### 3.4 Web Package

| # | Criterion | How to Verify |
|---|-----------|-------------|
| W1 | Static build succeeds | `npm run build` outputs to `dist/` with `index.html`, `main.js`, `style.css`. |
| W2 | No external build framework bloat | `package.json` contains no `react`, `vue`, `angular`, `svelte`. Confirm zero matches. |
| W3 | UI is single-button | Open `index.html`. Confirm exactly one text input and one submit button. No settings panels. |

### 3.5 Integration & End-to-End

| # | Criterion | How to Verify |
|---|-----------|-------------|
| I1 | Full pipeline curl test | `curl -X POST .../api/changelog` returns jobId. Poll `GET .../api/changelog/:jobId`. After renderer processes (or mock completes), `outputUrl` points to a valid MP4. |
| I2 | Gallery lists completed jobs | `GET /api/gallery` returns array with at least one completed job after E2E test. |
| I3 | Output MP4 is playable | `ffprobe -v error -show_format -show_streams $outputUrl` returns valid video stream. Width=1080, Height=1920 (9:16). |
| I4 | No D1 references in code | Grep entire repo for `D1`, `d1`, `db.ts`, `migrations/`. Confirm zero matches in source files. |
| I5 | No Redis references in code | Grep entire repo for `redis`, `ioredis`, `bull`. Confirm zero matches. |
| I6 | No AWS SDK references | Grep entire repo for `aws-sdk`, `@aws-sdk`, `@aws/`. Confirm zero matches. |

---

## 4. Files to Create or Modify

### 4.1 API Package — New Files

| Path | Purpose |
|------|---------|
| `packages/api/package.json` | Workers runtime deps (hono, openai types) |
| `packages/api/wrangler.toml` | Workers + Queue + R2 bindings, no D1 |
| `packages/api/tsconfig.json` | API-specific TS config |
| `packages/api/src/index.ts` | Hono entry, route mount |
| `packages/api/src/types.ts` | Shared TypeScript interfaces |
| `packages/api/src/routes/jobs.ts` | `POST /api/changelog` |
| `packages/api/src/routes/poll.ts` | `GET /api/changelog/:jobId` |
| `packages/api/src/routes/complete.ts` | `POST /api/internal/complete` |
| `packages/api/src/routes/gallery.ts` | `GET /api/gallery` |
| `packages/api/src/services/github.ts` | GitHub API client |
| `packages/api/src/services/narrative.ts` | GPT-4 script generation |
| `packages/api/src/services/tts.ts` | OpenAI TTS client |
| `packages/api/src/services/queue.ts` | Queue producer |
| `packages/api/src/services/storage.ts` | R2 read/write wrapper |
| `packages/api/tests/git-fetch.test.ts` | Mocked GitHub API tests |
| `packages/api/tests/scene-composer.test.ts` | Props-builder pure function tests |

### 4.2 Renderer Package — New Files

| Path | Purpose |
|------|---------|
| `packages/renderer/package.json` | Node deps (remotion, puppeteer, ffmpeg) |
| `packages/renderer/tsconfig.json` | Renderer TS config |
| `packages/renderer/Dockerfile` | Node + Chrome + FFmpeg image |
| `packages/renderer/src/index.ts` | Queue consumer loop |
| `packages/renderer/src/render.ts` | Remotion render + FFmpeg mux |
| `packages/renderer/src/api.ts` | Callback client to API |
| `packages/renderer/src/env.ts` | Config validation |
| `packages/renderer/remotion/Video.tsx` | Root composition |
| `packages/renderer/remotion/scenes/TitleCard.tsx` | Scene 1 |
| `packages/renderer/remotion/scenes/CommitList.tsx` | Scene 2 |
| `packages/renderer/remotion/scenes/Outro.tsx` | Scene 3 |
| `packages/renderer/remotion/styles/theme.ts` | Design tokens |
| `packages/renderer/public/music-bed.mp3` | Ambient music loop |
| `packages/renderer/tests/theme.test.ts` | Theme token validation |

### 4.3 Web Package — New Files

| Path | Purpose |
|------|---------|
| `packages/web/package.json` | Vite or plain static build |
| `packages/web/tsconfig.json` | Web TS config |
| `packages/web/index.html` | SPA shell |
| `packages/web/src/main.ts` | One-button app + polling |
| `packages/web/src/style.css` | Black screen, minimal UI |

### 4.4 Root — New Files

| Path | Purpose |
|------|---------|
| `package.json` | Workspace root |
| `tsconfig.json` | Shared base TS config |
| `README.md` | Usage, demo curl, infra setup |

### 4.5 QA / Tests — New Files

| Path | Purpose |
|------|---------|
| `tests/test-file-existence.sh` | Verify every file in §4 exists |
| `tests/test-banned-patterns.sh` | Grep scan for Redis, AWS, D1 |
| `tests/test-typecheck.sh` | Run `tsc --noEmit` in api + renderer |
| `tests/test-package-constraints.sh` | Verify package.json constraints |

### 4.6 Existing Files Modified

None. This is a greenfield build under `deliverables/changelog-theatre-v2/`.

---

## 5. Kill-Switch Checklist

If any of the following take longer than 20 minutes, cut them immediately:

- [ ] Public gallery page design polish
- [ ] Paid tier subscription logic (stub the cap, skip Stripe)
- [ ] Music bed composition (use any royalty-free loop; replace later)
- [ ] Fly.io auto-scaling or multi-region deploy
- [ ] Advanced rate-limiting (IP-based daily counter is enough for v1)

The non-negotiables that must ship:

- [ ] `POST /api/changelog` returns a real jobId
- [ ] `GET /api/changelog/:jobId` returns honest status
- [ ] GitHub service fetches real commits
- [ ] Narrative service generates real script from commits
- [ ] TTS service generates real audio
- [ ] Renderer produces a real MP4 with 3 scenes
- [ ] `tsc --noEmit` passes
- [ ] Zero Redis / AWS / D1 in dependency tree
