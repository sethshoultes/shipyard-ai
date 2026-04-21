# Todo: Poster (Issue #84)

> Atomic tasks. Each completable in < 5 minutes. Check the box only after the verification step passes.

---

## Wave 1 — Project Scaffolding

- [ ] Create `package.json` with project metadata and allowed dependencies — verify: `test -f package.json && jq -e '.dependencies' package.json`
- [ ] Create `tsconfig.json` targeting ES2022 / Worker — verify: `test -f tsconfig.json && grep -q 'ES2022' tsconfig.json`
- [ ] Create `wrangler.toml` with Worker name and R2 bucket binding — verify: `test -f wrangler.toml && grep -q 'r2_buckets' wrangler.toml`
- [ ] Create `.gitignore` excluding `node_modules/`, `.wrangler/`, `dist/` — verify: `test -f .gitignore && grep -q 'node_modules' .gitignore`

## Wave 2 — Core Source Files

### GitHub Client
- [ ] Create `src/github.ts` skeleton with `fetchRepoMetadata(owner, repo)` export — verify: `grep -q 'export.*fetchRepoMetadata' src/github.ts`
- [ ] Add authenticated token pool and rotation logic to `src/github.ts` — verify: `grep -q 'token' src/github.ts && grep -q 'rotate\|pool' src/github.ts`
- [ ] Add language-fetch logic returning top 3 languages as text labels — verify: `grep -q 'languages' src/github.ts && grep -q 'slice(0, 3)\|splice(0,3)' src/github.ts`

### Template
- [ ] Create `src/template.ts` skeleton exporting `renderTemplate(data)` — verify: `grep -q 'export.*renderTemplate' src/template.ts`
- [ ] Add SVG root element with fixed 1200×630 Open Graph dimensions — verify: `grep -q '1200' src/template.ts && grep -q '630' src/template.ts && grep -q '<svg' src/template.ts`
- [ ] Add interpolated repo name, owner, description, stars, forks to SVG — verify: `grep -q 'repo\|stars\|forks\|description' src/template.ts`
- [ ] Add top-3 language text labels (no pie charts) — verify: `grep -q 'languages' src/template.ts && ! grep -qi 'pie\|doughnut\|chart' src/template.ts`

### Renderer
- [ ] Create `src/renderer.ts` skeleton exporting `svgToPng(svgString)` — verify: `grep -q 'export.*svgToPng' src/renderer.ts`
- [ ] Import and configure `resvg-wasm` (or `resvg-js`) — verify: `grep -q 'resvg' src/renderer.ts`
- [ ] Return `Uint8Array` PNG buffer — verify: `grep -q 'Uint8Array' src/renderer.ts`

### Cache
- [ ] Create `src/cache.ts` skeleton exporting `getCache(key)` and `putCache(key, buffer)` — verify: `grep -q 'export.*getCache' src/cache.ts && grep -q 'export.*putCache' src/cache.ts`
- [ ] Implement R2/S3 read with miss-return-null — verify: `grep -q 'null' src/cache.ts`
- [ ] Implement R2/S3 write with 24h TTL / `Cache-Control: max-age=86400` — verify: `grep -q '86400\|max-age' src/cache.ts`

### Main Handler
- [ ] Create `src/index.ts` exporting default fetch handler — verify: `grep -q 'export default' src/index.ts`
- [ ] Add route parsing for `/:owner/:repo` — verify: `grep -q ':owner' src/index.ts && grep -q ':repo' src/index.ts`
- [ ] Wire cache-read → miss → GitHub fetch → template → render → cache-write → respond — verify: manual read of `src/index.ts` confirms the 5-step flow in order

## Wave 3 — Assets & Scripts

- [ ] Add at least one `.woff2` font file to `assets/fonts/` — verify: `ls assets/fonts/*.woff2 | wc -l | grep -q '[1-9]'`
- [ ] Reference self-hosted fonts in `src/template.ts` (no Google Fonts CDN) — verify: `! grep -q 'fonts.googleapis\|fonts.gstatic' src/template.ts`
- [ ] Create `scripts/warm-cache.ts` with trending-repo seed list — verify: `test -f scripts/warm-cache.ts && grep -q 'owner\|repo' scripts/warm-cache.ts`
- [ ] Make `scripts/warm-cache.ts` executable or add npm script to run it — verify: `test -x scripts/warm-cache.ts || grep -q 'warm-cache' package.json`

## Wave 4 — QA & Verification

- [ ] Run `tests/test-file-structure.sh` — verify: `bash tests/test-file-structure.sh && echo $?` prints `0`
- [ ] Run `tests/test-banned-patterns.sh` — verify: `bash tests/test-banned-patterns.sh && echo $?` prints `0`
- [ ] Run `tests/test-source-integrity.sh` — verify: `bash tests/test-source-integrity.sh && echo $?` prints `0`
- [ ] Run `tests/test-config.sh` — verify: `bash tests/test-config.sh && echo $?` prints `0`
- [ ] Run TypeScript compiler with no errors — verify: `npx tsc --noEmit` exits `0`
- [ ] Run `wrangler deploy --dry-run` (or `wrangler publish --dry-run`) — verify: exits `0`

## Wave 5 — Documentation

- [ ] Create `README.md` with endpoint format and example URLs — verify: `test -f README.md && grep -q 'poster.dev\|/:owner/:repo' README.md`
- [ ] Add cache-warming instructions to `README.md` — verify: `grep -q 'warm' README.md`

---

*Total tasks: 26. Estimated build time: < 2 hours if open questions are resolved before Wave 2.*
