# Phase 1 Plan — Deploy Verification ("Proof") v1

**Generated**: 2026-05-02
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 4
**Waves**: 3
**Project Slug**: `github-issue-sethshoultes-shipyard-ai-98`

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R-DEPLOY-001 (workflow trigger) | phase-1-task-3 | 2 |
| R-DEPLOY-002 (build step) | phase-1-task-3 | 2 |
| R-DEPLOY-003 (deploy step) | phase-1-task-3 | 2 |
| R-DEPLOY-004 (secrets refs) | phase-1-task-3 | 2 |
| R-PROOF-001 (inline default-on) | phase-1-task-3 | 2 |
| R-PROOF-002 (root path only) | phase-1-task-1, phase-1-task-2 | 1 |
| R-PROOF-003 (origin validation) | phase-1-task-2 | 1 |
| R-PROOF-004 (fail fast, no retry) | phase-1-task-2 | 1 |
| R-PROOF-005 (success output) | phase-1-task-2 | 1 |
| R-PROOF-006 (failure output) | phase-1-task-2 | 1 |
| R-PROOF-007 (no wrangler/grep) | phase-1-task-2 | 1 |
| R-PROOF-008 (parallel-ready) | phase-1-task-1, phase-1-task-2 | 1 |
| R-PROOF-009 (domains.json) | phase-1-task-1 | 1 |
| R-PROOF-010 (script separated) | phase-1-task-2, phase-1-task-3 | 1, 2 |

---

## Wave Execution Order

### Wave 1 (Parallel)

<task-plan id="phase-1-task-1" wave="1">
  <title>Create domains.json — version-controlled domain configuration</title>
  <requirement>R-PROOF-009 (domains.json replaces runtime wrangler API), R-PROOF-008 (parallel-ready schema), R-PROOF-002 (root path only)</requirement>
  <description>
    Create the human-readable, version-controlled domain configuration file that tells Proof which domains to verify and what their expected Cloudflare origin is. This eliminates the wrangler CLI dependency and makes the verification deterministic and auditable.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/decisions.md" reason="Defines the domains.json schema per Open Question 4.5: [{ domain, expected_origin }]. Also defines v1 scope: single domain, root path only." />
    <file path="/home/agent/shipyard-ai/.github/workflows/deploy-website.yml" reason="Confirms project name is shipyard-ai and deploy target is Cloudflare Pages." />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-PROOF-009 acceptance criteria and schema definition." />
  </context>

  <steps>
    <step order="1">Create `domains.json` at the repository root (`/home/agent/shipyard-ai/domains.json`).</step>
    <step order="2">Populate with the v1 domain configuration. Schema MUST be an array of objects. Each object MUST have: `domain` (string, the production custom domain), `expected_origin` (string, the expected CNAME target, e.g., "pages.cloudflare.com"), and `routes` (array of strings, reserved for v1.1; v1 ships with `["/"]`).</step>
    <step order="3">Use the exact domain(s) attached to the Cloudflare Pages project `shipyard-ai`. If unknown, default to `[{ "domain": "shipyard.company", "expected_origin": "pages.cloudflare.com", "routes": ["/"] }]` and add a comment block at the top of the JSON file (or a `_comment` field) noting that this should be verified against the CF Pages dashboard.</step>
    <step order="4">Validate the file is well-formed JSON with `node -e "JSON.parse(require('fs').readFileSync('domains.json'))"`.</step>
    <step order="5">Commit the file with a conventional commit message.</step>
  </steps>

  <verification>
    <check type="build">`node -e "JSON.parse(require('fs').readFileSync('domains.json'))"` exits 0</check>
    <check type="manual">Open `domains.json` and confirm it is a JSON array containing at least one object with `domain`, `expected_origin`, and `routes` keys.</check>
    <check type="test">Run `cat domains.json | python3 -m json.tool` (or `npx jsonlint domains.json`) to pretty-print and validate JSON syntax.</check>
  </verification>

  <dependencies>
    <!-- Empty: wave 1, independent -->
  </dependencies>

  <commit-message>feat(proof): add domains.json for post-deploy verification config

Version-controlled domain list + expected Cloudflare origin.
Replaces wrangler CLI runtime dependency per locked decision 1.2.
Schema supports parallel multi-domain checks in v1.1.

Refs: github-issue-sethshoultes-shipyard-ai-98</commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>Create scripts/proof.js — Node.js verification engine</title>
  <requirement>R-PROOF-003 (origin validation), R-PROOF-004 (fail fast), R-PROOF-005 (success output), R-PROOF-006 (failure output), R-PROOF-007 (no wrangler/grep), R-PROOF-008 (parallel-ready), R-PROOF-010 (script separated from YAML)</requirement>
  <description>
    Build the standalone Node.js verification script that checks each configured domain via HTTPS GET and validates DNS origin. The script must fail fast, print one sentence on failure, and print one green signal on success. No retries. No stack traces. No external dependencies.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/decisions.md" reason="Defines ALL locked UX and behavior constraints: one breath one answer, no retry, origin validation, human voice error messages." />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-PROOF-003 through R-PROOF-010 acceptance criteria." />
    <file path="/home/agent/shipyard-ai/domains.json" reason="The script reads this file at runtime to discover domains and expected origins." />
    <file path="/home/agent/shipyard-ai/.github/workflows/deploy-website.yml" reason="Understands the deploy context: project shipyard-ai, CF Pages, secrets available in workflow env." />
  </context>

  <steps>
    <step order="1">Create `scripts/proof.js` at the repository root (`/home/agent/shipyard-ai/scripts/proof.js`). If the `scripts/` directory does not exist at repo root, create it first.</step>
    <step order="2">Import ONLY Node.js built-in modules: `https`, `dns`, `fs`, `path`, `url`. No npm dependencies. No `child_process` calls to wrangler.</step>
    <step order="3">Read `domains.json` from the current working directory (default `./domains.json`; allow override via `PROOF_DOMAINS_PATH` env var for testability). Parse with `JSON.parse`. Exit with plain-English failure if file is missing or invalid.</step>
    <step order="4">For each domain object in the array, define an async verification function that performs two checks in parallel for speed: (a) DNS origin check, and (b) HTTPS GET to `https://{domain}/`.</step>
    <step order="5">DNS origin check: Use `dns.resolveCname(domain)` to fetch CNAME records. If any record matches the `expected_origin` from `domains.json`, pass. If CNAME fails (e.g., ENODATA), fall back to `dns.resolve4(domain)` to get A records, then perform the HTTPS GET and check for Cloudflare-specific headers (`CF-RAY` or `Server: cloudflare`). Only pass if headers are present. If neither CNAME match nor Cloudflare headers are found, fail.</step>
    <step order="6">HTTPS GET check: Use `https.get` with `headers: { 'User-Agent': 'Shipyard-Proof/1.0' }`. Accept only status code 200. Any other status (404, 500, 301 without follow, etc.) is a failure. Do NOT follow redirects (or if following, treat non-200 final status as failure).</step>
    <step order="7">Collect all domain checks with `Promise.all` so they run concurrently (parallel-ready architecture). Wait for all to settle.</step>
    <step order="8">If ANY domain fails, print exactly ONE plain-English sentence to stderr (or stdout) describing the first failure. Example: "Your domain shipyard.company isn't pointing here." Keep it under 140 characters. Exit with code `1`. No stack traces. No JSON.</step>
    <step order="9">If ALL domains pass, print one line per domain: `Verified {domain} {ISO8601_timestamp}`. Use `new Date().toISOString()` for the timestamp. Exit with code `0`.</step>
    <step order="10">Add a shebang line `#!/usr/bin/env node` at the top and make the file executable (`chmod +x scripts/proof.js`).</step>
    <step order="11">Test locally with a known-good domain (e.g., `example.com` or `shipyard.company` if accessible) to verify the script executes without runtime errors. If the target domain is unreachable from the local environment, test with a mock by temporarily editing `domains.json` to point to `httpbin.org` or a local test server, then revert.</step>
    <step order="12">Commit the file with a conventional commit message.</step>
  </steps>

  <verification>
    <check type="build">`node scripts/proof.js` runs without throwing (may fail verification legitimately if DNS is wrong — that's expected behavior).</check>
    <check type="test">`node -e "require('./scripts/proof.js')"` does not throw a syntax error.</check>
    <check type="manual">Review the source code and confirm: no `child_process`, no `wrangler`, no HTML body parsing for build IDs, no retry loops, no `setTimeout` for backoff, and only built-in Node modules are imported.</check>
    <check type="manual">Simulate a failure by temporarily creating a `domains.json` with a nonsense domain like `this-is-not-a-real-domain-12345.test`, run the script, and confirm it prints exactly one sentence and exits 1.</check>
  </verification>

  <dependencies>
    <!-- Empty: wave 1, independent. The script reads domains.json but can be authored in parallel. -->
  </dependencies>

  <commit-message>feat(proof): add verification engine with origin validation

Node.js script that checks DNS CNAME + HTTPS GET for each domain
in domains.json. Fails fast, no retries, one-sentence errors.
Uses only built-in modules (https, dns, fs).

Refs: github-issue-sethshoultes-shipyard-ai-98</commit-message>
</task-plan>

---

### Wave 2 (Parallel, after Wave 1)

<task-plan id="phase-1-task-3" wave="2">
  <title>Modify deploy-website.yml — inline Proof step after deploy</title>
  <requirement>R-DEPLOY-001 through R-DEPLOY-004 (verify existing workflow), R-PROOF-001 (inline default-on), R-PROOF-010 (script separated but wired into pipeline)</requirement>
  <description>
    Update the existing GitHub Actions workflow to add the Proof verification step inline, immediately after the Cloudflare Pages deploy step. Verify that all existing deploy requirements (trigger, build, deploy, secrets) are already satisfied before adding the new step.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.github/workflows/deploy-website.yml" reason="The existing workflow that must be modified. MUST verify it already contains trigger, build, deploy, and secrets before editing." />
    <file path="/home/agent/shipyard-ai/scripts/proof.js" reason="The script that the workflow will invoke. Must exist and be executable before this task runs." />
    <file path="/home/agent/shipyard-ai/domains.json" reason="The config file the script reads. Must exist before this task runs." />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-DEPLOY-001 through R-DEPLOY-004 and R-PROOF-001 acceptance criteria." />
    <file path="/home/agent/shipyard-ai/decisions.md" reason="Locked decisions on inline architecture (1.1), default-on (3.1), and no standalone microservice." />
  </context>

  <steps>
    <step order="1">Open `.github/workflows/deploy-website.yml` and verify the existing structure satisfies R-DEPLOY-001 through R-DEPLOY-004: (a) `on.push.branches` includes `main`, (b) `on.push.paths` includes `website/**` and `.github/workflows/deploy-website.yml`, (c) `npm ci` and `npm run build` run in `website/`, (d) `wrangler pages deploy out --project-name=shipyard-ai` runs on `github.ref == 'refs/heads/main'`, (e) `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are referenced. If any are missing, add them before proceeding.</step>
    <step order="2">Add a new step immediately after the "Deploy to Cloudflare Pages" step. Name it "Proof — verify production domain" or similar.</step>
    <step order="3">The new step MUST use `run: node scripts/proof.js` and execute from the repo root (the default working directory in `actions/checkout` is the repo root, which is correct).</step>
    <step order="4">The new step MUST have `if: github.ref == 'refs/heads/main'` to match the deploy step guard, ensuring Proof only runs on actual production deploys.</step>
    <step order="5">The new step MUST NOT require any additional secrets, input parameters, or opt-in environment variables for basic operation. It reads `domains.json` from disk by default.</step>
    <step order="6">Add `PROOF_DOMAINS_PATH: ./domains.json` to the step's `env:` block for explicit configuration and future testability.</step>
    <step order="7">Run the workflow YAML through a linter (e.g., `npx actionlint .github/workflows/deploy-website.yml` if available, or visually verify indentation and syntax). Ensure no broken YAML indentation.</step>
    <step order="8">Commit the modified workflow with a conventional commit message.</step>
  </steps>

  <verification>
    <check type="build">`npx actionlint .github/workflows/deploy-website.yml` passes (if actionlint is unavailable, use an online YAML validator or `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-website.yml'))"` after `pip install pyyaml`).</check>
    <check type="manual">Open the workflow file and visually confirm: Proof step appears AFTER deploy step, has matching `if:` guard, calls `node scripts/proof.js`, and references `PROOF_DOMAINS_PATH`.</check>
    <check type="manual">Confirm the workflow still contains the original trigger, build, install, deploy, and secrets configuration unchanged.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="The workflow references domains.json indirectly via proof.js. The config must exist in the repo before the workflow step is meaningful." />
    <depends-on task-id="phase-1-task-2" reason="The workflow step invokes scripts/proof.js. The script must exist and be committed before the workflow modification." />
  </dependencies>

  <commit-message>ci(deploy): add Proof verification step inline after CF Pages deploy

Runs scripts/proof.js automatically on every main-branch deploy.
Default-on, zero opt-in, terminal-only output per locked decisions.
Verifies production custom domain origin before marking deploy done.

Refs: github-issue-sethshoultes-shipyard-ai-98</commit-message>
</task-plan>

---

### Wave 3 (Sequential, after Wave 2)

<task-plan id="phase-1-task-4" wave="3">
  <title>Local dry-run verification — validate the full pipeline locally</title>
  <requirement>R-PROOF-010 (testability), R-PROOF-005 (success output verification), R-PROOF-006 (failure output verification), R-PROOF-003 (origin validation verification)</requirement>
  <description>
    Perform a local end-to-end sanity check of the Proof script against real and simulated domains. Confirm success formatting, failure formatting, and origin validation logic work as intended without relying on the GitHub Actions runner.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/scripts/proof.js" reason="The script under test." />
    <file path="/home/agent/shipyard-ai/domains.json" reason="The configuration under test." />
    <file path="/home/agent/shipyard-ai/.github/workflows/deploy-website.yml" reason="The pipeline definition. Used only to confirm the step wiring is correct." />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="All R-PROOF-* acceptance criteria that must be verified." />
  </context>

  <steps>
    <step order="1">Run `node scripts/proof.js` with the committed `domains.json`. If the configured domain is live and correctly pointed at Cloudflare Pages, expect: exit code 0 and output matching `Verified {domain} {ISO8601_timestamp}`.</step>
    <step order="2">Create a temporary test config file `domains-test-fail.json` with a deliberately bad domain (e.g., `{ "domain": "shipyard.company.notreal", "expected_origin": "pages.cloudflare.com", "routes": ["/"] }`). Run `PROOF_DOMAINS_PATH=./domains-test-fail.json node scripts/proof.js`. Expect: exit code 1 and exactly one plain-English sentence. No stack trace. Clean up the temp file after.</step>
    <step order="3">Create a temporary test config file `domains-test-cname.json` with a domain known to NOT CNAME to Cloudflare (e.g., `{ "domain": "vercel.com", "expected_origin": "pages.cloudflare.com", "routes": ["/"] }`). Run `PROOF_DOMAINS_PATH=./domains-test-cname.json node scripts/proof.js`. Expect: exit code 1 because DNS CNAME does not match expected_origin and CF headers won't be present. Clean up the temp file after.</step>
    <step order="4">Verify that `node scripts/proof.js` completes in under 10 seconds total (fail-fast guarantee — no retry-induced delay).</step>
    <step order="5">Review the workflow file one final time to ensure the Proof step is correctly sequenced after deploy and before any post-deploy notifications (there are none in v1, but confirm nothing was accidentally added).</step>
    <step order="6">Document any findings in a brief note. If all checks pass, mark the task complete. If failures are found, file a bug against the relevant earlier task and do NOT mark this complete until resolved.</step>
  </steps>

  <verification>
    <check type="test">`node scripts/proof.js` with real `domains.json` exits 0 and prints one `Verified ...` line.</check>
    <check type="test">`PROOF_DOMAINS_PATH=./domains-test-fail.json node scripts/proof.js` exits 1 and prints exactly one sentence ≤ 140 characters.</check>
    <check type="manual">`time node scripts/proof.js` shows elapsed &lt; 10s.</check>
    <check type="manual">No temp test files remain in the working tree after cleanup.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="domains.json must be committed and stable for the real-domain test." />
    <depends-on task-id="phase-1-task-2" reason="proof.js must be committed and stable for all script behavior tests." />
    <depends-on task-id="phase-1-task-3" reason="The workflow modification must be committed so the dry-run validates the final pipeline wiring, even though the local test does not execute the workflow itself." />
  </dependencies>

  <commit-message>test(proof): local dry-run verification passed

Validated success output, failure output, origin validation,
and fail-fast behavior against real and simulated domains.
No changes to source — verification-only commit.

Refs: github-issue-sethshoultes-shipyard-ai-98</commit-message>
</task-plan>

---

## Risk Notes

### From Hindsight Report
- **`.github/workflows/deploy-website.yml`** is relatively new (created 2026-04-29) with low churn. Modification risk is LOW.
- **`website/src/app/layout.tsx`** and **`website/src/app/page.tsx`** are moderate-churn but **NOT touched** by this plan. The Proof feature is pure CI/infrastructure.
- **No uncommitted changes** in the build surface area. All uncommitted files are debate transcripts in `rounds/github-issue-sethshoultes-shipyard-ai-98/` and do not affect deliverables.
- **No bug-associated files** in this scope. Previous bug-associated files (plugin sandbox entries, daemon deliverables) are unrelated.

### Technical Risks
1. **DNS CNAME resolution for apex domains**: Apex domains (naked domains like `shipyard.company`) often use A records rather than CNAME due to RFC constraints. The proof.js fallback to CF-RAY header detection handles this, but if Cloudflare changes header names, the fallback breaks. **Mitigation**: Document the fallback logic in code comments and test against actual domain configuration before shipping.
2. **False positive from cached 200 pages**: If Vercel (or another old host) returns a 200 status for a parked/catch-all page, the HTTP check alone would pass. The origin validation (CNAME + CF headers) is specifically designed to prevent this. **Mitigation**: Ensure both DNS and header checks are implemented and tested per R-PROOF-003.
3. **GitHub Actions runner network access**: The runner must be able to reach the public internet to perform DNS and HTTPS checks. This is standard for `ubuntu-latest` runners. **Risk accepted** — no mitigation needed.
4. **Scope creep into monitoring platform**: Any PR adding dashboards, retry loops, Slack webhooks, or cron syntax must be rejected unless it cites an explicit Open Question resolution from decisions.md §4. **Cultural guardrail**: "Proof is the verdict, not the courtroom."
5. **Slug mismatch repeat**: Decisions.md Open Question 4.3 flags a prior slug mismatch. The PRD file is `github-issue-sethshoultes-shipyard-ai-98.md` and the round directory is `github-issue-sethshoultes-shipyard-ai-98`. **Confirmed canonical**: we use `-98` everywhere.

### Customer Gut-Check Trigger
After this plan is approved, spawn a haiku sub-agent as Sara Blakely to read this plan and the original PRD, then write `.planning/sara-blakely-review.md` with a customer-value gut-check per SKILL.md §7.

---

## Documentation Review Summary

### Verified Technical Context
1. **Platform Lock**: Next.js static-export site (`output: "export"` in `next.config.ts`). Build produces `website/out/`.
2. **Deploy Target**: Cloudflare Pages via `wrangler pages deploy` (static site hosting, NOT Cloudflare Workers + D1 + R2). The `docs/EMDASH-GUIDE.md` §5 Deployment describes Workers deployment; that pattern does NOT apply here.
3. **Runtime**: GitHub Actions `ubuntu-latest` with Node.js 22. Runner has `node` by default.
4. **Secrets**: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are already present in the existing workflow.
5. **Project Name**: `shipyard-ai` (confirmed in existing `.github/workflows/deploy-website.yml`).
6. **No External API Dependencies**: Per locked decision 1.2, the verification script uses only Node.js built-ins (`https`, `dns`, `fs`) plus `domains.json`. No `wrangler` CLI calls, no HTML body grep.
