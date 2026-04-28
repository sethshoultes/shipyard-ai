# To-Do — Aria (Changelog Theatre v2)

---

## Root Workspace

- [ ] Initialize root `package.json` with workspace definition — verify: `cat package.json | grep '"workspaces"'` shows `["packages/*"]`
- [ ] Create root `tsconfig.json` base config — verify: `test -f tsconfig.json`
- [ ] Create root `README.md` with usage and demo curl — verify: `test -f README.md && grep -q "curl" README.md`

---

## API Package (`packages/api/`)

- [ ] Create `packages/api/package.json` with Hono + dev deps — verify: `test -f packages/api/package.json && grep -q "hono" packages/api/package.json`
- [ ] Create `packages/api/tsconfig.json` — verify: `test -f packages/api/tsconfig.json`
- [ ] Create `packages/api/wrangler.toml` with R2 + Queue bindings (no D1) — verify: `test -f packages/api/wrangler.toml && grep -vq "d1" packages/api/wrangler.toml`
- [ ] Create `packages/api/src/types.ts` with Job, QueueMessage, RenderResult interfaces — verify: `test -f packages/api/src/types.ts && grep -q "interface Job" packages/api/src/types.ts`
- [ ] Create `packages/api/src/services/storage.ts` — R2 get/put wrapper for JSON blobs — verify: `test -f packages/api/src/services/storage.ts && grep -q "R2_BUCKET" packages/api/src/services/storage.ts`
- [ ] Create `packages/api/src/services/github.ts` — GitHub API commit fetcher — verify: `test -f packages/api/src/services/github.ts && grep -q "api.github.com" packages/api/src/services/github.ts`
- [ ] Create `packages/api/src/services/narrative.ts` — GPT-4 Sorkin-style script generator — verify: `test -f packages/api/src/services/narrative.ts && grep -q "chat.completions" packages/api/src/services/narrative.ts`
- [ ] Create `packages/api/src/services/tts.ts` — OpenAI TTS client — verify: `test -f packages/api/src/services/tts.ts && grep -q "audio.speech" packages/api/src/services/tts.ts`
- [ ] Create `packages/api/src/services/queue.ts` — Queue producer — verify: `test -f packages/api/src/services/queue.ts && grep -q "QueueMessage" packages/api/src/services/queue.ts`
- [ ] Create `packages/api/src/routes/jobs.ts` — `POST /api/changelog` handler — verify: `test -f packages/api/src/routes/jobs.ts && grep -q "/api/changelog" packages/api/src/routes/jobs.ts`
- [ ] Create `packages/api/src/routes/poll.ts` — `GET /api/changelog/:jobId` handler — verify: `test -f packages/api/src/routes/poll.ts && grep -q ":jobId" packages/api/src/routes/poll.ts`
- [ ] Create `packages/api/src/routes/complete.ts` — `POST /api/internal/complete` handler — verify: `test -f packages/api/src/routes/complete.ts && grep -q "/api/internal/complete" packages/api/src/routes/complete.ts`
- [ ] Create `packages/api/src/routes/gallery.ts` — `GET /api/gallery` handler — verify: `test -f packages/api/src/routes/gallery.ts && grep -q "/api/gallery" packages/api/src/routes/gallery.ts`
- [ ] Create `packages/api/src/index.ts` — Hono app entry with CORS and route mount — verify: `test -f packages/api/src/index.ts && grep -q "Hono" packages/api/src/index.ts`
- [ ] Create `packages/api/tests/git-fetch.test.ts` — mocked GitHub API tests — verify: `test -f packages/api/tests/git-fetch.test.ts && grep -q "describe" packages/api/tests/git-fetch.test.ts`
- [ ] Create `packages/api/tests/scene-composer.test.ts` — pure function tests for Remotion props — verify: `test -f packages/api/tests/scene-composer.test.ts && grep -q "describe" packages/api/tests/scene-composer.test.ts`
- [ ] Type-check API package — verify: `cd packages/api && npx tsc --noEmit` exits 0

---

## Renderer Package (`packages/renderer/`)

- [ ] Create `packages/renderer/package.json` with Remotion + Puppeteer deps — verify: `test -f packages/renderer/package.json && grep -q "remotion" packages/renderer/package.json`
- [ ] Create `packages/renderer/tsconfig.json` — verify: `test -f packages/renderer/tsconfig.json`
- [ ] Create `packages/renderer/Dockerfile` with Node + Chrome + FFmpeg — verify: `test -f packages/renderer/Dockerfile && grep -q "ffmpeg" packages/renderer/Dockerfile`
- [ ] Create `packages/renderer/src/env.ts` — config validation with Zod or manual checks — verify: `test -f packages/renderer/src/env.ts && grep -q "API_URL" packages/renderer/src/env.ts`
- [ ] Create `packages/renderer/src/api.ts` — callback client to API complete endpoint — verify: `test -f packages/renderer/src/api.ts && grep -q "internal/complete" packages/renderer/src/api.ts`
- [ ] Create `packages/renderer/src/render.ts` — Remotion render + FFmpeg mux — verify: `test -f packages/renderer/src/render.ts && grep -q "renderMedia" packages/renderer/src/render.ts`
- [ ] Create `packages/renderer/src/index.ts` — queue consumer loop — verify: `test -f packages/renderer/src/index.ts && grep -q "jobId" packages/renderer/src/index.ts`
- [ ] Create `packages/renderer/remotion/styles/theme.ts` — typography, color, pacing tokens — verify: `test -f packages/renderer/remotion/styles/theme.ts && grep -q "export const theme" packages/renderer/remotion/styles/theme.ts`
- [ ] Create `packages/renderer/remotion/scenes/TitleCard.tsx` — Scene 1 component — verify: `test -f packages/renderer/remotion/scenes/TitleCard.tsx && grep -q "TitleCard" packages/renderer/remotion/scenes/TitleCard.tsx`
- [ ] Create `packages/renderer/remotion/scenes/CommitList.tsx` — Scene 2 component — verify: `test -f packages/renderer/remotion/scenes/CommitList.tsx && grep -q "CommitList" packages/renderer/remotion/scenes/CommitList.tsx`
- [ ] Create `packages/renderer/remotion/scenes/Outro.tsx` — Scene 3 component — verify: `test -f packages/renderer/remotion/scenes/Outro.tsx && grep -q "Outro" packages/renderer/remotion/scenes/Outro.tsx`
- [ ] Create `packages/renderer/remotion/Video.tsx` — root composition assembling 3 scenes — verify: `test -f packages/renderer/remotion/Video.tsx && grep -q "TitleCard" packages/renderer/remotion/Video.tsx && grep -q "CommitList" packages/renderer/remotion/Video.tsx && grep -q "Outro" packages/renderer/remotion/Video.tsx`
- [ ] Place `packages/renderer/public/music-bed.mp3` — ambient audio loop — verify: `test -f packages/renderer/public/music-bed.mp3`
- [ ] Create `packages/renderer/tests/theme.test.ts` — theme token validation — verify: `test -f packages/renderer/tests/theme.test.ts && grep -q "describe" packages/renderer/tests/theme.test.ts`
- [ ] Type-check renderer package — verify: `cd packages/renderer && npx tsc --noEmit` exits 0

---

## Web Package (`packages/web/`)

- [ ] Create `packages/web/package.json` — verify: `test -f packages/web/package.json`
- [ ] Create `packages/web/tsconfig.json` — verify: `test -f packages/web/tsconfig.json`
- [ ] Create `packages/web/index.html` — SPA shell — verify: `test -f packages/web/index.html && grep -q "script" packages/web/index.html`
- [ ] Create `packages/web/src/style.css` — black screen, minimal UI, curtain-rising progress — verify: `test -f packages/web/src/style.css && grep -q "background" packages/web/src/style.css`
- [ ] Create `packages/web/src/main.ts` — one-button app with polling logic — verify: `test -f packages/web/src/main.ts && grep -q "fetch" packages/web/src/main.ts`
- [ ] Build web package — verify: `cd packages/web && npm run build` exits 0 and produces `dist/index.html`

---

## QA / Deliverable Tests

- [ ] Create `tests/test-file-existence.sh` — executable shell test for all spec'd files — verify: `test -x tests/test-file-existence.sh && ./tests/test-file-existence.sh` exits 0
- [ ] Create `tests/test-banned-patterns.sh` — executable shell test for Redis/AWS/D1 — verify: `test -x tests/test-banned-patterns.sh && ./tests/test-banned-patterns.sh` exits 0
- [ ] Create `tests/test-typecheck.sh` — executable shell test running `tsc --noEmit` — verify: `test -x tests/test-typecheck.sh && ./tests/test-typecheck.sh` exits 0
- [ ] Create `tests/test-package-constraints.sh` — executable shell test scanning package.json files — verify: `test -x tests/test-package-constraints.sh && ./tests/test-package-constraints.sh` exits 0

---

## Final Verification

- [ ] Run all shell tests together — verify: `for f in tests/*.sh; do echo "$f"; "$f" || exit 1; done` exits 0
- [ ] Count source files ≥ 10 — verify: `find packages -name "*.ts" -o -name "*.tsx" | wc -l` returns ≥ 10
- [ ] Verify no banned deps in any package.json — verify: `grep -ri "redis\|aws-sdk\|@aws-sdk" packages/*/package.json root-package.json 2>/dev/null; test $? -ne 0`
