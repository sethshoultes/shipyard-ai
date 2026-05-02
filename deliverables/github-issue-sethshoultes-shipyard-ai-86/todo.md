# WorkerForge (Anvil) — Build To-Do List

> GitHub Issue: sethshoultes/shipyard-ai#86
> **Status:** In Progress
> **Last Updated:** 2026-05-02

---

## Wave 1: Project Scaffolding

- [ ] Create `anvil/` directory structure — verify: `ls -la anvil/` shows directory exists
- [ ] Create `anvil/package.json` with name "anvil", type "module", empty dependencies — verify: `cat anvil/package.json | jq '.dependencies | length'` returns 0
- [ ] Create `anvil/tsconfig.json` with NodeNext module resolution, strict mode — verify: `cat anvil/tsconfig.json | jq '.compilerOptions.module'` returns "NodeNext"
- [ ] Create `anvil/src/` directory — verify: `test -d anvil/src` exits 0
- [ ] Create `anvil/src/commands/` directory — verify: `test -d anvil/src/commands` exits 0
- [ ] Create `anvil/src/generators/` directory — verify: `test -d anvil/src/generators` exits 0
- [ ] Create `anvil/src/utils/` directory — verify: `test -d anvil/src/utils` exits 0
- [ ] Create `anvil/bin/` directory — verify: `test -d anvil/bin` exits 0
- [ ] Create `anvil/github-template/` directory — verify: `test -d anvil/github-template` exits 0
- [ ] Create `anvil/github-template/src/` directory — verify: `test -d anvil/github-template/src` exits 0

---

## Wave 2: CLI Entry Point

- [ ] Create `anvil/src/index.ts` with CLI entry point — verify: file exists and contains `import` statements
- [ ] Implement flag parsing for `--llm` and `--stream` — verify: grep for `--llm` and `--stream` in index.ts returns 2 matches
- [ ] Implement `create` command routing — verify: grep for `create` command handler returns 1 match
- [ ] Add human-friendly error handling (no raw stack traces) — verify: grep for `console.error` shows custom messages, no "Error:" prefixes
- [ ] Ensure no interactive prompts (no readline, prompts, inquirer) — verify: `grep -E 'readline|prompts|inquirer' anvil/src/index.ts` returns 0 matches
- [ ] Create `anvil/bin/anvil` executable shebang — verify: file starts with `#!/usr/bin/env node`
- [ ] Make `anvil/bin/anvil` executable — verify: `test -x anvil/bin/anvil` exits 0

---

## Wave 3: Create Command

- [ ] Create `anvil/src/commands/create.ts` — verify: file exists
- [ ] Import spec fetcher from `../generators/spec.js` — verify: grep for `import.*spec` returns 1 match
- [ ] Import worker generator from `../generators/worker.js` — verify: grep for `import.*worker` returns 1 match
- [ ] Import deploy wrapper from `../utils/deploy.js` — verify: grep for `import.*deploy` returns 1 match
- [ ] Implement sequential pipeline: fetch spec → generate worker → deploy — verify: code shows sequential await calls in order
- [ ] Add progress spinner output — verify: grep for spinner (ora or custom) returns ≥1 match
- [ ] Add triumphant success message (grin quality) — verify: manual review confirms non-generic success language
- [ ] No TODO/FIXME placeholders — verify: `grep -iE 'TODO|FIXME' anvil/src/commands/create.ts` returns 0 matches

---

## Wave 4: Spec Fetcher

- [ ] Create `anvil/src/generators/spec.ts` — verify: file exists
- [ ] Implement fetch to Cloudflare Workers AI OpenAPI spec URL — verify: grep for `fetch(` with Cloudflare URL
- [ ] Parse JSON response from spec — verify: grep for `.json()` on fetch response
- [ ] Extract highest-version `text-generation` model — verify: grep for `text-generation` and version comparison logic
- [ ] Implement dynamic fallback on fetch failure — verify: grep for `catch` or `try` block with fallback logic
- [ ] Fallback must NOT use hard-coded model name — verify: grep for model names in fallback — should reference dynamic source
- [ ] Extract and return AI binding name — verify: function returns binding name string
- [ ] Export `fetchSpec()` and `parseSpec()` functions — verify: grep for `export` statements
- [ ] No TODO/FIXME placeholders — verify: `grep -iE 'TODO|FIXME' anvil/src/generators/spec.ts` returns 0 matches

---

## Wave 5: Worker Generator

- [ ] Create `anvil/src/generators/worker.ts` — verify: file exists
- [ ] Implement `generateIndexTs()` function — verify: grep for `export.*generateIndexTs`
- [ ] Generated `index.ts` uses Web Streams API — verify: output contains `ReadableStream`
- [ ] Generated `index.ts` calls Cloudflare AI binding — verify: output contains `env.AI.run` or `ai.run`
- [ ] Generated `index.ts` handles streaming response — verify: output contains streaming handler code
- [ ] Implement `generateWranglerToml()` function — verify: grep for `export.*generateWranglerToml`
- [ ] Generated `wrangler.toml` contains AI binding — verify: output contains `[[ai]]` or `ai =`
- [ ] Generated `wrangler.toml` contains rate limit config — verify: output contains `limits` or rate configuration
- [ ] Generated `wrangler.toml` has NO caching config — verify: output grep for `cache|kv|r2` returns 0 matches
- [ ] Generated `wrangler.toml` has NO monitoring config — verify: output grep for `logs|observability|dashboard` returns 0 matches
- [ ] No hand-written templates (dynamic string construction only) — verify: no template literals with static worker code
- [ ] No TODO/FIXME placeholders — verify: `grep -iE 'TODO|FIXME' anvil/src/generators/worker.ts` returns 0 matches

---

## Wave 6: Deploy Wrapper

- [ ] Create `anvil/src/utils/deploy.ts` — verify: file exists
- [ ] Implement `deploy()` function that invokes `wrangler deploy` — verify: grep for `wrangler deploy` or `exec` call
- [ ] Add human-friendly error translation — verify: error handling contains plain-language messages
- [ ] No hidden auth flows (explicit prompts only) — verify: grep for auth handling shows explicit user prompts
- [ ] No TODO/FIXME placeholders — verify: `grep -iE 'TODO|FIXME' anvil/src/utils/deploy.ts` returns 0 matches

---

## Wave 7: GitHub Template

- [ ] Create `anvil/github-template/src/index.ts` — verify: file exists with bootstrap placeholder
- [ ] Create `anvil/github-template/wrangler.toml` — verify: file exists with base config
- [ ] Create `anvil/github-template/package.json` — verify: file exists with only wrangler dependency
- [ ] Create `anvil/github-template/README.md` — verify: file exists
- [ ] README contains "Deploy to Workers" button markup — verify: grep for deploy button URL or image
- [ ] README contains 10-second onboarding instructions — verify: manual review confirms quick-start guide
- [ ] No TODO/FIXME placeholders in any template file — verify: `grep -riE 'TODO|FIXME' anvil/github-template/` returns 0 matches

---

## Wave 8: Build Validation

- [ ] Run `cd anvil && tsc --noEmit` — verify: exit code 0, no type errors
- [ ] Scan for TODO/FIXME/HACK/XXX placeholders — verify: `grep -riE 'TODO|FIXME|HACK|XXX' anvil/src/` returns 0 matches
- [ ] Verify zero runtime dependencies — verify: `cat anvil/package.json | jq '.dependencies | length'` returns 0
- [ ] Verify no devDependencies in artifact — verify: `cat anvil/package.json | jq 'has("devDependencies")'` returns false
- [ ] Verify flat structure in generated workers (no src/, lib/, tests/) — verify: generator code outputs to root only

---

## Wave 9: Test Scripts

- [ ] Create `tests/verify-structure.sh` — verify: file exists and is executable
- [ ] Create `tests/verify-types.sh` — verify: file exists and is executable
- [ ] Create `tests/verify-dependencies.sh` — verify: file exists and is executable
- [ ] Create `tests/verify-generated-output.sh` — verify: file exists and is executable
- [ ] All test scripts exit 0 on pass, non-zero on fail — verify: run each script, check exit codes
- [ ] All test scripts have shebang `#!/bin/bash` — verify: `head -1 tests/*.sh` shows shebangs
- [ ] Make all test scripts executable — verify: `test -x tests/*.sh` exits 0 for all

---

## Wave 10: Load Test Prep (Post-Build)

- [ ] Document load test requirements (100 concurrent streams) — verify: spec.md contains load test criteria
- [ ] Create load test script template — verify: test script exists with k6 or artillery config
- [ ] Document success criteria (0 errors, <500ms p95 latency) — verify: criteria documented in spec or test file

---

## Summary

| Wave | Tasks | Status |
|------|-------|--------|
| 1. Project Scaffolding | 10 | Pending |
| 2. CLI Entry Point | 7 | Pending |
| 3. Create Command | 8 | Pending |
| 4. Spec Fetcher | 9 | Pending |
| 5. Worker Generator | 12 | Pending |
| 6. Deploy Wrapper | 5 | Pending |
| 7. GitHub Template | 7 | Pending |
| 8. Build Validation | 5 | Pending |
| 9. Test Scripts | 7 | Pending |
| 10. Load Test Prep | 3 | Pending |
| **Total** | **73** | |

---

*Each task is designed to be completable in <5 minutes with a clear verification step.*
