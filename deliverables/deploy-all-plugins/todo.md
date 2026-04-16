# Deploy All Plugins — Task Checklist

**Priority:** P0 (Hotfix)
**Estimated Time:** 30-45 minutes
**Token Budget:** 100K

---

## Wave 1: Fix Prerequisites (Parallel)

### EventDash Violations Fix

- [ ] Read fixed EventDash file — verify: `cat deliverables/eventdash-fix/sandbox-entry.ts | wc -l` returns ~3400 lines
- [ ] Count current violations — verify: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` returns 95
- [ ] Backup current file — verify: `ls plugins/eventdash/src/sandbox-entry.ts.backup-* | wc -l` returns 1
- [ ] Copy fixed version — verify: `diff deliverables/eventdash-fix/sandbox-entry.ts plugins/eventdash/src/sandbox-entry.ts` returns empty (files identical)
- [ ] Verify violations fixed — verify: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` returns 0
- [ ] Verify file compiles — verify: `cd plugins/eventdash && npx tsc --noEmit src/sandbox-entry.ts` exits 0

### Formforge Entrypoint Fix

- [ ] Read current formforge index — verify: `grep "@shipyard/formforge/sandbox" plugins/formforge/src/index.ts` finds the banned pattern
- [ ] Add node:url import — verify: `grep "from \"node:url\"" plugins/formforge/src/index.ts` finds import
- [ ] Add node:path imports — verify: `grep "from \"node:path\"" plugins/formforge/src/index.ts` finds import
- [ ] Add path resolution code — verify: `grep "const currentDir = dirname" plugins/formforge/src/index.ts` finds path resolution
- [ ] Add entrypointPath variable — verify: `grep "const entrypointPath = join" plugins/formforge/src/index.ts` finds variable
- [ ] Replace entrypoint line — verify: `grep "entrypoint: entrypointPath" plugins/formforge/src/index.ts` finds usage
- [ ] Verify no npm alias remains — verify: `grep "@shipyard/formforge/sandbox" plugins/formforge/src/index.ts` returns nothing
- [ ] Verify file compiles — verify: `npx tsc --noEmit plugins/formforge/src/index.ts` exits 0

### Reviewpulse Entrypoint Fix

- [ ] Read current reviewpulse index — verify: `grep "@shipyard/reviewpulse/sandbox" plugins/reviewpulse/src/index.ts` finds the banned pattern
- [ ] Add node:url import — verify: `grep "from \"node:url\"" plugins/reviewpulse/src/index.ts` finds import
- [ ] Add node:path imports — verify: `grep "from \"node:path\"" plugins/reviewpulse/src/index.ts` finds import
- [ ] Add path resolution code — verify: `grep "const currentDir = dirname" plugins/reviewpulse/src/index.ts` finds path resolution
- [ ] Add entrypointPath variable — verify: `grep "const entrypointPath = join" plugins/reviewpulse/src/index.ts` finds variable
- [ ] Replace entrypoint line — verify: `grep "entrypoint: entrypointPath" plugins/reviewpulse/src/index.ts` finds usage
- [ ] Verify no npm alias remains — verify: `grep "@shipyard/reviewpulse/sandbox" plugins/reviewpulse/src/index.ts` returns nothing
- [ ] Verify file compiles — verify: `npx tsc --noEmit plugins/reviewpulse/src/index.ts` exits 0

### Seodash Entrypoint Fix

- [ ] Read current seodash index — verify: `grep "@shipyard/seodash/sandbox" plugins/seodash/src/index.ts` finds the banned pattern
- [ ] Add node:url import — verify: `grep "from \"node:url\"" plugins/seodash/src/index.ts` finds import
- [ ] Add node:path imports — verify: `grep "from \"node:path\"" plugins/seodash/src/index.ts` finds import
- [ ] Add path resolution code — verify: `grep "const currentDir = dirname" plugins/seodash/src/index.ts` finds path resolution
- [ ] Add entrypointPath variable — verify: `grep "const entrypointPath = join" plugins/seodash/src/index.ts` finds variable
- [ ] Replace entrypoint line — verify: `grep "entrypoint: entrypointPath" plugins/seodash/src/index.ts` finds usage
- [ ] Verify no npm alias remains — verify: `grep "@shipyard/seodash/sandbox" plugins/seodash/src/index.ts` returns nothing
- [ ] Verify file compiles — verify: `npx tsc --noEmit plugins/seodash/src/index.ts` exits 0

---

## Wave 2: Register Plugins & Build

### Plugin Registration

- [ ] Read current astro.config — verify: `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` returns 2 (only membership, eventdash)
- [ ] Add commercekit import — verify: `grep "commercekitPlugin" examples/sunrise-yoga/astro.config.mjs` finds import
- [ ] Add formforge import — verify: `grep "formforgePlugin" examples/sunrise-yoga/astro.config.mjs` finds import
- [ ] Add reviewpulse import — verify: `grep "reviewpulsePlugin" examples/sunrise-yoga/astro.config.mjs` finds import
- [ ] Add seodash import — verify: `grep "seodashPlugin" examples/sunrise-yoga/astro.config.mjs` finds import
- [ ] Update plugins array — verify: `grep -c "Plugin()" examples/sunrise-yoga/astro.config.mjs` returns 6
- [ ] Verify all 6 registered — verify: `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` returns 6

### Build Process

- [ ] Clear build cache — verify: `ls examples/sunrise-yoga/dist 2>&1 | grep "No such file"` confirms deletion
- [ ] Run build — verify: `cd examples/sunrise-yoga && npm run build` exits with code 0
- [ ] Check build output — verify: `tail -10 build.log | grep -i error` returns nothing (no errors)
- [ ] Verify dist created — verify: `ls examples/sunrise-yoga/dist` shows files like `_astro/`, `index.html`

---

## Wave 3: Deploy & Smoke Test

### Deployment

- [ ] Verify .env exists — verify: `test -f /home/agent/shipyard-ai/.env && echo "exists"` prints "exists"
- [ ] Source environment — verify: `source /home/agent/shipyard-ai/.env && echo $CLOUDFLARE_ACCOUNT_ID | wc -c` returns >10
- [ ] Export credentials — verify: `echo "${CLOUDFLARE_API_TOKEN:0:10}"` shows partial token
- [ ] Run deployment — verify: `cd examples/sunrise-yoga && npx wrangler deploy` exits with code 0
- [ ] Check deploy output — verify: `tail -10 deploy.log` contains "Published" or "Deployed"
- [ ] Verify no deploy errors — verify: `grep -i "error" deploy.log | grep -v "0 errors"` returns nothing
- [ ] Extract deployed URL — verify: `curl -I https://yoga.shipyard.company | grep "200 OK"` confirms site live

### Smoke Testing

- [ ] Run smoke test loop — verify: saved to `smoke-test.log`
- [ ] Check membership plugin — verify: `grep "=== membership ===" -A 3 smoke-test.log | grep UNAUTHORIZED` finds match
- [ ] Check eventdash plugin — verify: `grep "=== eventdash ===" -A 3 smoke-test.log | grep UNAUTHORIZED` finds match
- [ ] Check commercekit plugin — verify: `grep "=== commercekit ===" -A 3 smoke-test.log | grep UNAUTHORIZED` finds match
- [ ] Check formforge plugin — verify: `grep "=== formforge ===" -A 3 smoke-test.log | grep UNAUTHORIZED` finds match
- [ ] Check reviewpulse plugin — verify: `grep "=== reviewpulse ===" -A 3 smoke-test.log | grep UNAUTHORIZED` finds match
- [ ] Check seodash plugin — verify: `grep "=== seodash ===" -A 3 smoke-test.log | grep UNAUTHORIZED` finds match
- [ ] Count successes — verify: `grep -c "UNAUTHORIZED" smoke-test.log` returns 6
- [ ] Verify no NOT_FOUND — verify: `grep "NOT_FOUND" smoke-test.log` returns nothing
- [ ] Verify no INTERNAL_ERROR — verify: `grep "INTERNAL_ERROR" smoke-test.log` returns nothing

---

## Wave 4: Commit & Push

### Git Operations

- [ ] Check git status — verify: `git status` shows 5 modified files
- [ ] Review all changes — verify: `git diff HEAD | wc -l` returns >100 (substantial changes)
- [ ] Stage modified files — verify: `git diff --cached | wc -l` returns >100 (files staged)
- [ ] Create commit — verify: `git log -1 --oneline` shows new commit with "deploy:" prefix
- [ ] Verify commit message — verify: `git log -1 --grep "Co-Authored-By: Claude"` finds co-author line
- [ ] Push to remote — verify: `git push origin main` exits with code 0
- [ ] Verify push succeeded — verify: `git status` shows "Your branch is up to date with 'origin/main'"
- [ ] Check working tree clean — verify: `git status` shows "nothing to commit, working tree clean"

---

## Final Verification

- [ ] All 6 plugins registered — verify: `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` returns 6
- [ ] All violations fixed — verify: run violations check script, all show 0
- [ ] Build successful — verify: `examples/sunrise-yoga/dist` exists with files
- [ ] Deploy successful — verify: `curl -I https://yoga.shipyard.company` returns 200
- [ ] All smoke tests pass — verify: `grep -c "UNAUTHORIZED" smoke-test.log` returns 6
- [ ] Changes committed — verify: `git log -1 --grep "deploy:"` finds commit
- [ ] Changes pushed — verify: `git status` shows "up to date with 'origin/main'"

---

**Total Tasks:** 56
**Critical Path:** Wave 1 → Wave 2 → Wave 3 → Wave 4
**Parallel Opportunities:** All Wave 1 tasks can run simultaneously
**Average Task Time:** <1 minute per task
**Total Estimated Time:** 30-45 minutes
