# Reel Build — Running To-Do

> Atomic tasks. Each completable in < 5 minutes. Check off as you go.

---

## Wave 1 — Monorepo Scaffold

- [ ] Create monorepo root `reel/` with `package.json` — verify: `test -f reel/package.json && grep -q 'workspaces' reel/package.json`
- [ ] Create `reel/README.md` with build + deploy instructions — verify: `test -f reel/README.md`
- [ ] Create `reel/apps/web/package.json` with Next.js dependency — verify: `grep -q 'next' reel/apps/web/package.json`
- [ ] Create `reel/apps/web/next.config.js` — verify: `test -f reel/apps/web/next.config.js`
- [ ] Create `reel/packages/remotion/package.json` with Remotion deps — verify: `grep -q 'remotion' reel/packages/remotion/package.json`
- [ ] Create `reel/packages/remotion/tsconfig.json` — verify: `test -f reel/packages/remotion/tsconfig.json`
- [ ] Create `reel/infra/docker-compose.yml` — verify: `test -f reel/infra/docker-compose.yml`

## Wave 2 — Web App Shell

- [ ] Create `reel/apps/web/app/layout.tsx` — verify: `test -f reel/apps/web/app/layout.tsx`
- [ ] Create `reel/apps/web/app/page.tsx` landing page — verify: `grep -q 'PasteForm' reel/apps/web/app/page.tsx`
- [ ] Create `reel/apps/web/components/PasteForm.tsx` — verify: `test -f reel/apps/web/components/PasteForm.tsx`
- [ ] Create `reel/apps/web/components/VoiceSelector.tsx` with 3 voices — verify: `grep -c 'voice' reel/apps/web/components/VoiceSelector.tsx` returns ≥ 3
- [ ] Create `reel/apps/web/components/RenderStatus.tsx` — verify: `grep -q 'a few minutes' reel/apps/web/components/RenderStatus.tsx`

## Wave 3 — API Routes & Services

- [ ] Create `reel/apps/web/lib/tts.ts` with 3 voice_id mappings — verify: `grep -c 'voice_id\|voiceId' reel/apps/web/lib/tts.ts` ≥ 3
- [ ] Create `reel/apps/web/lib/queue.ts` with concurrency cap — verify: `grep -q 'concurrency\|max' reel/apps/web/lib/queue.ts`
- [ ] Create `reel/apps/web/lib/s3.ts` with upload + pre-signed URL — verify: `grep -q 'upload\|presign' reel/apps/web/lib/s3.ts`
- [ ] Create `reel/apps/web/app/api/extract/route.ts` — verify: `test -f reel/apps/web/app/api/extract/route.ts`
- [ ] Create `reel/apps/web/app/api/render/route.ts` — verify: `test -f reel/apps/web/app/api/render/route.ts`
- [ ] Create `reel/apps/web/app/api/download/route.ts` — verify: `test -f reel/apps/web/app/api/download/route.ts`

## Wave 4 — Remotion Template

- [ ] Create `reel/packages/remotion/src/compositions/ReelVertical.tsx` at 1080×1920 — verify: `grep -q '1080.*1920\|1920.*1080' reel/packages/remotion/src/compositions/ReelVertical.tsx`
- [ ] Create `reel/packages/remotion/src/components/TitleCard.tsx` — verify: `test -f reel/packages/remotion/src/components/TitleCard.tsx`
- [ ] Create `reel/packages/remotion/src/components/BulletReveal.tsx` — verify: `test -f reel/packages/remotion/src/components/BulletReveal.tsx`
- [ ] Create `reel/packages/remotion/src/components/OutroCard.tsx` — verify: `test -f reel/packages/remotion/src/components/OutroCard.tsx`
- [ ] Add curated font pair to `reel/packages/remotion/src/fonts/` — verify: `ls reel/packages/remotion/src/fonts/ | wc -l` returns ≥ 2
- [ ] Create `reel/packages/remotion/render.ts` server-side entrypoint — verify: `test -f reel/packages/remotion/render.ts`

## Wave 5 — Guardrails & QA

- [ ] Verify no WordPress references in `reel/apps/` — verify: `! grep -ri 'wordpress' reel/apps/`
- [ ] Verify no "60 seconds" promise in components — verify: `! grep -ri '60 seconds' reel/apps/web/components/`
- [ ] Verify only one Remotion composition exists — verify: `ls reel/packages/remotion/src/compositions/*.tsx | wc -l` equals 1
- [ ] Verify Docker Compose includes Redis — verify: `grep -qi 'redis' reel/infra/docker-compose.yml`
- [ ] Run `tests/test_file_structure.sh` — verify: exits 0
- [ ] Run `tests/test_v1_constraints.sh` — verify: exits 0
- [ ] Run `tests/test_architecture.sh` — verify: exits 0
