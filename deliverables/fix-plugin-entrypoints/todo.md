# Todo: Fix Plugin Entrypoints + Register All in Sunrise Yoga

**Priority**: P0 (Hotfix)
**Generated**: 2026-04-16

---

## Wave 1: Plugin Entrypoint Fixes (Parallel)

### Commercekit Plugin
- [ ] Read `/home/agent/shipyard-ai/plugins/commercekit/src/index.ts` — verify: note current entrypoint line number
- [ ] Add imports at top: `fileURLToPath`, `dirname`, `join` — verify: run `npx tsc --noEmit plugins/commercekit/src/index.ts` (no errors)
- [ ] Add path resolution code before return statement — verify: code matches membership pattern exactly
- [ ] Replace `entrypoint: "@shipyard/commercekit/sandbox"` with `entrypoint: entrypointPath` — verify: grep shows no "@shipyard/commercekit/sandbox" in file
- [ ] Add explanatory comment above path resolution — verify: comment exists and explains why npm alias fails

### Formforge Plugin
- [ ] Read `/home/agent/shipyard-ai/plugins/formforge/src/index.ts` — verify: note current entrypoint line number
- [ ] Add imports at top: `fileURLToPath`, `dirname`, `join` — verify: run `npx tsc --noEmit plugins/formforge/src/index.ts` (no errors)
- [ ] Add path resolution code before return statement — verify: code matches membership pattern exactly
- [ ] Replace `entrypoint: "@shipyard/formforge/sandbox"` with `entrypoint: entrypointPath` — verify: grep shows no "@shipyard/formforge/sandbox" in file
- [ ] Add explanatory comment above path resolution — verify: comment exists and explains why npm alias fails

### Reviewpulse Plugin
- [ ] Read `/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts` — verify: note current entrypoint line number
- [ ] Add imports at top: `fileURLToPath`, `dirname`, `join` — verify: run `npx tsc --noEmit plugins/reviewpulse/src/index.ts` (no errors)
- [ ] Add path resolution code before return statement — verify: code matches membership pattern exactly
- [ ] Replace `entrypoint: "@shipyard/reviewpulse/sandbox"` with `entrypoint: entrypointPath` — verify: grep shows no "@shipyard/reviewpulse/sandbox" in file
- [ ] Add explanatory comment above path resolution — verify: comment exists and explains why npm alias fails

### Seodash Plugin
- [ ] Read `/home/agent/shipyard-ai/plugins/seodash/src/index.ts` — verify: note current entrypoint line number
- [ ] Add imports at top: `fileURLToPath`, `dirname`, `join` — verify: run `npx tsc --noEmit plugins/seodash/src/index.ts` (no errors)
- [ ] Add path resolution code before return statement — verify: code matches membership pattern exactly
- [ ] Replace `entrypoint: "@shipyard/seodash/sandbox"` with `entrypoint: entrypointPath` — verify: grep shows no "@shipyard/seodash/sandbox" in file
- [ ] Add explanatory comment above path resolution — verify: comment exists and explains why npm alias fails

---

## Wave 2: Plugin Registration & Build (Sequential, after Wave 1)

### Astro Config Updates
- [ ] Read `/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs` — verify: note existing plugin imports and array
- [ ] Add import: `commercekitPlugin` from `../../plugins/commercekit/src/index.js` — verify: grep shows import line exists
- [ ] Add import: `formforgePlugin` from `../../plugins/formforge/src/index.js` — verify: grep shows import line exists
- [ ] Add import: `reviewpulsePlugin` from `../../plugins/reviewpulse/src/index.js` — verify: grep shows import line exists
- [ ] Add import: `seodashPlugin` from `../../plugins/seodash/src/index.js` — verify: grep shows import line exists
- [ ] Update plugins array to include all 6 plugins — verify: grep shows all 6 plugin function calls in array

### Incremental Build Testing
- [ ] Run baseline build: `cd examples/sunrise-yoga && npm run build` — verify: exit code 0
- [ ] Add commercekit to config, build — verify: build succeeds, commercekit appears in logs
- [ ] Add formforge to config, build — verify: build succeeds, formforge appears in logs
- [ ] Add reviewpulse to config, build — verify: build succeeds, reviewpulse appears in logs
- [ ] Add seodash to config, build — verify: build succeeds, seodash appears in logs

### Final Build Verification
- [ ] Run final build: `cd examples/sunrise-yoga && npm run build 2>&1 | tee build.log` — verify: exit code 0, no errors in build.log
- [ ] Check dist folder created: `ls examples/sunrise-yoga/dist` — verify: folder exists with contents
- [ ] Check plugin registration in logs — verify: all 6 plugins show as registered in build output

---

## Wave 3: Commit and Push

### Git Operations
- [ ] Run `git status` — verify: 5 files modified (4 plugin index.ts + astro.config.mjs), no unexpected changes
- [ ] Run `git diff HEAD` — verify: review all changes look correct
- [ ] Stage files: `git add plugins/*/src/index.ts examples/sunrise-yoga/astro.config.mjs` — verify: `git status` shows 5 staged files
- [ ] Commit with conventional format and HEREDOC — verify: `git log -1` shows correct commit message with Co-Authored-By
- [ ] Push to remote: `git push` — verify: push succeeds, no errors
- [ ] Verify remote sync: `git status` — verify: shows "Your branch is up to date with 'origin/...'"

---

## Notes

- **Wave 1 tasks can run in parallel** — each plugin is independent
- **Wave 2 must wait for Wave 1** — can't register plugins until entrypoints are fixed
- **Wave 3 must wait for Wave 2** — can't commit until build verification passes
- **If any plugin fails to build** — remove it from astro.config.mjs and document the failure
- **Each task should take <5 minutes** — if longer, break it down further
