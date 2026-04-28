# QA Pass 1 — PAID-TEMPLATE

**QA Director**: Margaret Hamilton
**Date**: 2026-04-28
**Verdict**: **BLOCK** — Multiple P0 issues. Ship is STOPPED.

---

## Executive Summary

The PAID-TEMPLATE deliverables fail QA on every critical dimension. The deliverables directory contains **zero implementation code** — only a build specification, a todo list, and six shell test scripts. Worse, the deliverables describe an entirely different product (Shipyard AI v1 Platform — intake/schema/build pipeline) than what is documented in `REQUIREMENTS.md` (WordPress plugins: WP Intelligence Suite and Beam). **Zero requirements traceability.** Four of six test scripts fail. Banned commercial patterns leak into existing repo files. There is nothing to build, deploy, or test against a running system.

**This build does not ship.**

---

## Critical QA Steps Executed

### 1. COMPLETENESS CHECK — Placeholder Content Grep

**Command executed**:
```bash
grep -rni "placeholder|coming soon|TODO|FIXME|lorem ipsum|TBD|WIP" /home/agent/shipyard-ai/deliverables/PAID-TEMPLATE/
```

**Result**: No matches found within the deliverables directory.

**Verdict on deliverable files**: No placeholder text detected.
**However**: The deliverables directory contains no actual implementation files to grep. The absence of placeholders is meaningless when the files themselves are absent.

---

### 2. CONTENT QUALITY CHECK — Stub / Empty File Detection

| File | Lines | Verdict |
|------|-------|---------|
| `spec.md` | ~150 | Real content (specification document) |
| `todo.md` | ~60 | Real content (task checklist) |
| `tests/test-agent-guardrails.sh` | 98 | Real implementation |
| `tests/test-banned-patterns.sh` | 88 | Real implementation |
| `tests/test-deploy.sh` | 91 | Real implementation |
| `tests/test-intake.sh` | 71 | Real implementation |
| `tests/test-prd-compliance.sh` | 70 | Real implementation |
| `tests/test-structure.sh` | 70 | Real implementation |

**Result**: No stub files (< 10 lines) in the deliverables directory.

**However**: The actual implementation files that the test scripts expect are **missing entirely** from the repository. Stubs would at least prove someone started the work. We have void.

---

### 3. BANNED PATTERNS CHECK

**File checked**: `/home/agent/shipyard-ai/BANNED-PATTERNS.md`
**Result**: **Does not exist.** No repo-root banned-patterns file found.

**Mitigating check**: The deliverable `spec.md` defines its own banned patterns (lines 128–136):
- No `stripe_payment_id`, `deposit_paid`, `balance_paid`, `tos_signed` in build contracts
- No e-commerce, auth, i18n, membership in v1 artifacts
- No `register_rest_route` in v1
- No visible "Built by Shipyard" billboard
- No `localStorage` in intake JS

**Result of running `test-banned-patterns.sh` against the repo**:
```
BANNED PATTERNS TEST FAILED: 12 violation(s)
```

Specific failures:
- `i18n` found in `schema/template.md:13`
- `stripe_payment_id` found in `prd/rules.md:9`
- `deposit_paid` found in `prd/rules.md:10`
- `balance_paid` found in `prd/rules.md:11`
- `tos_signed` found in `prd/rules.md:12`
- `hubspot` found in `prd/rules.md:13`
- `crm_` found in `prd/rules.md:14`
- `tier_price_usd` found in `prd/rules.md:15`
- `i18n` found in `prd/rules.md:21`
- `membership` found in `prd/rules.md:22`
- `subscription` found in `prd/rules.md:23`
- `i18n` found in `intake/mapper.js:23`

**Verdict**: FAIL — Banned patterns leak into existing repo files. The `prd/rules.md` file, ironically intended to *document* the blacklist, contains every banned commercial field as example entries. This is a self-own.

---

### 4. REQUIREMENTS VERIFICATION — Traceability Matrix

**Requirements source**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`

**Critical finding**: The requirements file documents **two entirely separate WordPress plugin projects**:
1. **WP Intelligence Suite** (38 atomic requirements, ARCH-001 through CI-001)
2. **Beam / commandbar-prd** (11 atomic requirements, R1 through R11)

**The PAID-TEMPLATE deliverables describe a third, unrelated product**: "Shipyard AI v1 Platform — Intake, Schema, and Build Pipeline."

**There is zero overlap. Not one requirement maps to a deliverable.**

| Requirement | Description | Deliverable Found | Verdict |
|-------------|-------------|-------------------|---------|
| ARCH-001 | Three-plugin architecture scaffold (`wis-core/`, `localgenius/`, `dash/`, `pinned/`) | None | **FAIL — MISSING** |
| ARCH-002 | Core plugin loader (`wis-core.php`) | None | **FAIL — MISSING** |
| ARCH-003 | WordPress.org compliance (GPL headers, no obfuscation) | None | **FAIL — MISSING** |
| TIER-001 | Tier gating constants file | None | **FAIL — MISSING** |
| TIER-002 | Invisible feature gating | None | **FAIL — MISSING** |
| TIER-003 | Simple license key field | None | **FAIL — MISSING** |
| ACT-001 | Zero-error plugin activation | None | **FAIL — MISSING** |
| ACT-002 | No external API calls during activation | None | **FAIL — MISSING** |
| SEED-001 | Pre-seeded defaults at activation | None | **FAIL — MISSING** |
| SEED-002 | No onboarding wizard | None | **FAIL — MISSING** |
| LG-001 | LocalGenius visitor-facing widget | None | **FAIL — MISSING** |
| LG-002 | LocalGenius static templates (5 verticals) | None | **FAIL — MISSING** |
| LG-003 | LocalGenius public assets (CSS/JS) | None | **FAIL — MISSING** |
| DASH-001 | Dash team tracking module | None | **FAIL — MISSING** |
| DASH-002 | Dash admin interface (native WP) | None | **FAIL — MISSING** |
| PIN-001 | Pinned agreements/memory module | None | **FAIL — MISSING** |
| PIN-002 | Pinned admin interface (native WP) | None | **FAIL — MISSING** |
| LIMIT-001 | Hard usage limits enforcement | None | **FAIL — MISSING** |
| LIMIT-002 | Contextual limit nudges | None | **FAIL — MISSING** |
| PAY-001 | Stripe Checkout link integration | None | **FAIL — MISSING** |
| PAY-002 | Annual billing hidden in checkout | None | **FAIL — MISSING** |
| ONBOARD-001 | Single contextual tooltip | None | **FAIL — MISSING** |
| CLI-001 | WP-CLI command registration | None | **FAIL — MISSING** |
| DIST-001 | readme.txt for WordPress.org | None | **FAIL — MISSING** |
| DIST-002 | Plugin banner and screenshots | None | **FAIL — MISSING** |
| COMPAT-001 | PHP 5.6-8.3 compatibility | None | **FAIL — MISSING** |
| COMPAT-002 | No anonymous analytics | None | **FAIL — MISSING** |
| TEST-001 | PHPUnit coverage for tier/activation | None | **FAIL — MISSING** |
| TEST-002 | PHPUnit coverage for usage limits | None | **FAIL — MISSING** |
| CI-001 | GitHub Actions workflow | None | **FAIL — MISSING** |
| R1 | Beam global hotkey (`Cmd+K` / `Ctrl+K`) | None | **FAIL — MISSING** |
| R2 | Beam post/page search | None | **FAIL — MISSING** |
| R3 | Beam user search | None | **FAIL — MISSING** |
| R4 | Beam admin page search (top 20 URLs) | None | **FAIL — MISSING** |
| R5 | Beam quick actions | None | **FAIL — MISSING** |
| R6 | Beam visual polish (dark UI, 200ms fade) | None | **FAIL — MISSING** |
| R7 | Beam accessibility (keyboard nav, focus trap) | None | **FAIL — MISSING** |
| R8 | Beam extensibility hook (`beam_items` filter) | None | **FAIL — MISSING** |
| R9 | Beam architecture (client-side index, zero REST) | None | **FAIL — MISSING** |
| R10 | Beam minimal file structure (2 files only) | None | **FAIL — MISSING** |
| R11 | Beam zero configuration | None | **FAIL — MISSING** |

**Requirements coverage**: **0 / 49 requirements met** (0%).

---

### 5. LIVE TESTING — Build, Deploy, Endpoint Verification

**Result**: **NOT APPLICABLE / BLOCKED**

The deliverables directory contains:
- 2 Markdown documents (`spec.md`, `todo.md`)
- 6 Bash test scripts

There is **no deployable site**, **no WordPress plugin**, **no buildable artifact**, and **no package.json / webpack / build pipeline** in the deliverables directory. There are no endpoints to curl, no admin pages to screenshot, and no build command to run.

The test scripts themselves are the only runnable deliverables. Results:

| Test Script | Status | Failures |
|-------------|--------|----------|
| `test-structure.sh` | **FAIL** | 12 missing files |
| `test-prd-compliance.sh` | PASS | 0 |
| `test-banned-patterns.sh` | **FAIL** | 12 pattern violations |
| `test-intake.sh` | PASS | 0 |
| `test-agent-guardrails.sh` | **FAIL** | 5 violations |
| `test-deploy.sh` | **FAIL** | 3 missing files |

**Test pass rate**: 2/6 (33%). A 33% pass rate on the project's own test suite is an automatic BLOCK.

---

### 6. GIT STATUS CHECK

**Command executed**:
```bash
git -C /home/agent/shipyard-ai status --short deliverables/PAID-TEMPLATE/
```

**Result**: Clean. No uncommitted files in the deliverables directory.

**Note**: The broader repo contains uncommitted files in other directories (e.g., `website/public.bak/work/` permission issues), but the deliverables directory itself is committed.

---

## Issue Register — Ranked by Severity

### P0 — BLOCKER (Build cannot ship with any P0 open)

| # | Issue | Evidence | Fix Required |
|---|-------|----------|--------------|
| **P0-1** | **Catastrophic requirements traceability failure** | REQUIREMENTS.md describes WordPress plugins (WP Intelligence Suite + Beam). Deliverables describe a build-pipeline platform. 0/49 requirements have corresponding deliverables. | Either update REQUIREMENTS.md to describe PAID-TEMPLATE, or rebuild deliverables to match REQUIREMENTS.md. |
| **P0-2** | **Missing implementation files** | `test-structure.sh` reports 12 missing required files: `agent/prompts/design.txt`, `agent/prompts/component.txt`, `agent/prompts/deploy.txt`, `agent/guardrails.json`, `build/index.js`, `build/context-shard.js`, `deploy/preview.js`, `deploy/badge-injector.js`, `deploy/target-config.json`, `ops/stripe-webhook.js`, `ops/hubspot-sync.js`, `components/README.md`. | Create all missing files with real implementations per `spec.md` Waves 2–5. |
| **P0-3** | **Banned patterns in build artifacts** | `test-banned-patterns.sh` finds 12 violations: commercial fields (`stripe_payment_id`, `deposit_paid`, `balance_paid`, `tos_signed`, `hubspot`, `crm_`, `tier_price_usd`) and scope patterns (`i18n`, `membership`, `subscription`) in `prd/rules.md`, `schema/template.md`, and `intake/mapper.js`. | Remove all banned keywords from `prd/rules.md`, `schema/template.md`, and `intake/mapper.js`. If they are needed as documentation, move them to `ops/` or external docs only. |
| **P0-4** | **Test suite failure rate 67%** | 4 of 6 test scripts fail (`test-structure.sh`, `test-banned-patterns.sh`, `test-agent-guardrails.sh`, `test-deploy.sh`). | Fix underlying issues (missing files, banned patterns) and re-run all tests until 6/6 pass. |
| **P0-5** | **No deployable artifact exists** | Deliverables directory contains only `.md` and `.sh` files. No code to build, deploy, or run. | Produce the actual implementation code described in `spec.md` and `todo.md`. |

### P1 — HIGH (Must fix before next QA pass)

| # | Issue | Evidence | Fix Required |
|---|-------|----------|--------------|
| **P1-1** | **No CI pipeline** | `.github/workflows/ci.yml` is missing. `spec.md` Wave 6 and `todo.md` Wave 6 require it. | Create `.github/workflows/ci.yml` with PHP lint / WPCS jobs (if WP plugin) or Node lint jobs (if build pipeline). |
| **P1-2** | **Ambiguous deliverable boundaries** | Test scripts scan repo root (`/home/agent/shipyard-ai/`) rather than the deliverables directory. It is unclear whether the actual build artifacts should live inside `deliverables/PAID-TEMPLATE/` or at repo root. | Establish and document a canonical file structure. If repo root is correct, move or symlink deliverables appropriately. |

### P2 — MEDIUM (Polish / risk reduction)

| # | Issue | Evidence | Fix Required |
|---|-------|----------|--------------|
| **P2-1** | **`prd/rules.md` documents blacklist by listing every banned field** | The file contains every banned pattern as example text, causing the banned-pattern grep to self-trigger. | Rewrite `prd/rules.md` to describe the blacklist without using the literal banned strings, or move examples to a separate file outside the scan directories. |

---

## QA Director Sign-Off

**Margaret Hamilton**
QA Director, Shipyard AI

> "This build is not ready. We have a specification, a todo list, and a pile of red test results. We do not have code. We do not have traceability. We do not have a product. Fix P0-1 through P0-5, re-run the full test suite, and request QA Pass 2. The ship stays in drydock until every test is green and every requirement has a fingerprint in the deliverables."

**Overall Verdict**: **BLOCK**
