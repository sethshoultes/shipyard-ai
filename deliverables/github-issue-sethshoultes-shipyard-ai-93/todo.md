# Build To-Do: Still (GitHub Issue #93)

## Wave 1 — Project Skeleton
- [ ] Initialize Node.js project with `npm init -y` — verify: `package.json` exists and contains `"name": "still"`
- [ ] Add TypeScript dev dependencies (`typescript`, `@types/node`) — verify: `npm install` completes with exit 0
- [ ] Create `tsconfig.json` with Node target — verify: `npx tsc --noEmit` passes on empty project
- [ ] Add `.gitignore` for `node_modules/` and `dist/` — verify: `git check-ignore node_modules` returns `node_modules`
- [ ] Create `.github/workflows/ci.yml` scaffold — verify: YAML has `push` trigger, `build` job, and no `continue-on-error`

## Wave 2 — Core Modules (Parallel)
- [ ] Create `src/config/constants.ts` — verify: file exports `API_ENDPOINT`, `TIMEOUT_MS`, `CACHE_DIR`, `API_KEY_ENV`
- [ ] Create `src/voice/templates.ts` — verify: exports a string containing "imperative mood" and "≤72 characters"
- [ ] Create `src/git/diff.ts` with `getStagedDiff()` — verify: unit test mocks `git diff --staged` and asserts returned string includes staged filename
- [ ] Create `src/cache/store.ts` with SHA-256 keyed read/write — verify: write suggestion for hash `"abc"`, read back returns same string; second read is instant
- [ ] Create `src/llm/client.ts` with `fetch` POST to mock server — verify: mock server receives headers `x-api-key` and JSON body with `system` field
- [ ] Create `src/llm/prompt.ts` — verify: assembled string contains both system prompt and diff text

## Wave 3 — Commands & CLI
- [ ] Create `src/commands/install.ts` — verify: in a temp git repo, creates `.git/hooks/prepare-commit-msg` containing `still hook` and is executable
- [ ] Create `src/commands/uninstall.ts` — verify: in a temp git repo, removes the hook file; re-run exits 0
- [ ] Create `src/cli.ts` wiring install/uninstall/hook/version — verify: `--version` prints semver and exits 0; unknown command exits non-zero
- [ ] Add `bin` field to `package.json` pointing at compiled output — verify: `npm link` then `still --version` works globally

## Wave 4 — Integration & Polish
- [ ] Create `scripts/install.sh` with shebang and `npm install -g still` — verify: `chmod +x` and `shellcheck` passes
- [ ] Write `README.md` with install one-liner — verify: `grep -c "npm install -g still" README.md` returns 1
- [ ] Add `build`, `test`, and `lint` scripts to `package.json` — verify: `npm run build` produces `dist/cli.js`
- [ ] Run voice audit over 10 sample diffs — verify: no output line contains `!` or emoji unicode

## Wave 5 — Verification
- [ ] Run `tests/test-structure.sh` — verify: exits 0
- [ ] Run `tests/test-banned-patterns.sh` — verify: exits 0
- [ ] Run `tests/test-cli.sh` — verify: exits 0
- [ ] Run full CI pipeline locally — verify: `npm ci && npm run build && npm test` all exit 0
