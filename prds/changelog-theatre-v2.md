# PRD — Changelog Theatre v2 (file-explicit re-queue, was issue #82)

## 1. Project Overview
**Project name:** changelog-theatre-v2
**Product type:** Cloudflare Worker (CLI invokable)
**Origin:** Re-queue of issue #82, which "shipped" hollow on 2026-04-27.

## 2. What it is
Take a git repo's commit history and a date range, render a 30-60 second video that narrates the changelog in Aaron Sorkin's voice over Hans Zimmer-style score, using existing Remotion + TTS pipelines (the same stack ClipCraft uses). Output: MP4 to R2.

## 3. Files to create — non-negotiable (≥10 source files)

### Core
1. `src/index.ts` — Worker entry. Routes: `POST /api/changelog` (body: `{repo, since, until, voice}`), `GET /api/changelog/:jobId`.
2. `src/changelog-narrator.ts` — calls OpenAI to convert commits into a narrative (Sorkin-style), returning a list of timestamped script lines.
3. `src/git-fetch.ts` — uses GitHub API to fetch commits between two SHAs/dates with `Authorization: Bearer ${GITHUB_TOKEN}`.
4. `src/scene-composer.ts` — given script lines + commits, produces a Remotion-ready props array: `{ heading, body, accent, durationFrames }[]`.
5. `src/tts.ts` — OpenAI TTS, identical to the ClipCraft pattern.
6. `src/r2.ts` — R2 wrapper.
7. `src/db.ts` — D1 helpers for jobs table.
8. `migrations/001_changelog_jobs.sql`
9. `wrangler.toml` — Workers + Queues + R2 + D1 bindings
10. `package.json` — Workers-only deps; NO Redis, NO AWS.
11. `README.md` — usage, demo curl, infra setup.

### Tests
12. `tests/scene-composer.test.ts` — pure function tests
13. `tests/git-fetch.test.ts` — mocked GH responses

## 4. Success criteria
- ≥ 10 source files at the paths above
- `tsc --noEmit` passes
- `package.json` clean of Redis/AWS
- `curl -X POST .../api/changelog -d '{"repo":"sethshoultes/shipyard-ai","since":"2026-04-21","until":"2026-04-28","voice":"alloy"}'` returns a job ID, polling eventually returns an `outputUrl` to a valid MP4

## 5. Constraints
- Workers-only stack (Queues, R2, D1, Workers AI / OpenAI via fetch)
- All under `deliverables/changelog-theatre-v2/`
- Build-gate demands ≥ 3 source files; this PRD demands ≥ 10
- Do NOT analyze more than once; build the files
