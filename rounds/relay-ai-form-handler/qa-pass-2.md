# QA Pass 2 — relay-ai-form-handler
**QA Director:** Margaret Hamilton
**Focus:** Integration, cross-file references, consistency, completeness
**Date:** 2026-04-29

---

## Overall Verdict: BLOCK

Multiple P0 issues detected. The build is **not shippable**.

---

## Step 1 — COMPLETENESS CHECK

### Placeholder Content Grep
```bash
grep -rni "placeholder\|coming soon\|TODO\|FIXME\|lorem ipsum\|TBD\|WIP" /home/agent/shipyard-ai/deliverables/relay-ai-form-handler/
```
**Result:** EXIT_CODE 1 (no matches). **PASS** — zero placeholder strings found in existing files.

### File Inventory vs. Locked Spec
The spec (`spec.md`) mandates **15 deliverable files**. Only **7 files** are present.

| Required File | Status | Blocker? |
|---------------|--------|----------|
| `relay.php` | EXISTS | — |
| `includes/class-relay.php` | EXISTS | — |
| `includes/class-storage.php` | EXISTS | — |
| `includes/class-admin.php` | EXISTS | — |
| `admin/views/settings.php` | EXISTS | — |
| `includes/class-form-handler.php` | **MISSING** | **P0** |
| `includes/class-claude-client.php` | **MISSING** | **P0** |
| `includes/class-cache.php` | **MISSING** | **P0** |
| `includes/class-async-processor.php` | **MISSING** | **P0** |
| `admin/views/inbox.php` | **MISSING** | **P0** |
| `admin/css/relay-admin.css` | **MISSING** | **P0** |
| `admin/js/relay-admin.js` | **MISSING** | **P0** |
| `assets/relay-badge.svg` | **MISSING** | **P0** |
| `readme.txt` | **MISSING** | **P0** |
| `languages/relay.pot` | **MISSING** | **P0** |
| `tests/*` (4 scripts per spec) | **ALL MISSING** | **P0** |

**Directories exist but are empty:**
- `admin/css/` — empty
- `admin/js/` — empty
- `assets/` — empty
- `languages/` — empty
- `tests/` — empty

**Verdict:** FAIL. The build is ~47% complete by file count and ~35% complete by functional surface area.

---

## Step 2 — CONTENT QUALITY CHECK

### Existing Files
| File | Lines | Assessment |
|------|-------|------------|
| `relay.php` | 80 | Real implementation. Activation/deactivation hooks, cron schedule, textdomain loader. |
| `includes/class-relay.php` | 41 | Real singleton loader. |
| `includes/class-storage.php` | 148 | Real CPT/taxonomy registration, meta fields, `create_lead()` helper. |
| `includes/class-admin.php` | 223 | Real admin menu, settings encryption/decryption, asset enqueue, dashboard widget. |
| `admin/views/settings.php` | 98 | Real settings form with API key field, routing emails, integration toggles, nonce. |
| `spec.md` | 248 | Real specification document. |
| `todo.md` | 195 | Real build checklist. |

**No stubs detected** in existing files — all functions have real bodies.

### Missing Implementations
Because 8 core files are absent, the following functions/classes have **zero implementation**:
- `Relay_Form_Handler::init()` / CF7 hook / REST endpoint
- `Relay_Claude_Client::classify()` / retry logic
- `Relay_Cache::get()` / `set()` / `purge()`
- `Relay_Async_Processor::process_batch()` / `route_email()`
- Inbox table rendering, filter bar, sort toggles, reply `mailto:` links
- Admin CSS (badges, design tokens)
- Admin JS (30s AJAX polling, Process Now button)

**Verdict:** PARTIAL PASS on existing files; FAIL on overall content coverage.

---

## Step 3 — BANNED PATTERNS CHECK

```bash
ls /home/agent/shipyard-ai/BANNED-PATTERNS.md
```
**Result:** `NO_BANNED_PATTERNS_FILE`

No banned-patterns file exists in the repo root. This step is **N/A**.

---

## Step 4 — REQUIREMENTS VERIFICATION

Source: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`

| ID | Requirement | File / Evidence | Verdict |
|----|-------------|-----------------|---------|
| RELAY-001 | Plugin activates cleanly, registers all components | `class-relay.php` requires 4 files that do not exist (`class-form-handler.php`, `class-claude-client.php`, `class-cache.php`, `class-async-processor.php`). Activation will fatal-error on `plugins_loaded`. | **FAIL** |
| RELAY-002 | CPT `relay_lead` with structured fields | `includes/class-storage.php` lines 20–36: `register_post_type('relay_lead', ...)`. Meta registered lines 67–97. `create_lead()` lines 116–146. | **PASS** |
| RELAY-003 | Classification taxonomy with locked colors | `includes/class-storage.php` lines 38–65: `register_taxonomy('relay_category', ...)` and `register_taxonomy('relay_urgency', ...)`. Default terms created lines 100–114: Sales, Support, Spam, General and High, Medium, Low. | **PASS** |
| RELAY-004 | Settings page with encrypted API key | `admin/views/settings.php` has password field for API key (line 30). `includes/class-admin.php` lines 177–222 implement `relay_encrypt_api_key()` and `relay_decrypt_api_key()` using `openssl_encrypt`/`openssl_decrypt` with `AUTH_KEY` + `SECURE_AUTH_KEY` derived secret. Supports `RELAY_API_KEY` constant override. Integration toggles present. | **PASS** |
| RELAY-005 | CF7 interception before email send | `includes/class-form-handler.php` **MISSING**. No `wpcf7_before_send_mail` hook exists in codebase. | **FAIL** |
| RELAY-006 | Generic `admin_post` / REST endpoint with nonce/token | `includes/class-form-handler.php` **MISSING**. No REST route registration found. | **FAIL** |
| RELAY-007 | Claude API client via `wp_remote_post` | `includes/class-claude-client.php` **MISSING**. | **FAIL** |
| RELAY-008 | Classification cache with content hash | `includes/class-cache.php` **MISSING**. | **FAIL** |
| RELAY-009 | WP Cron async processing | `includes/class-async-processor.php` **MISSING**. Cron hook `relay_process_leads` is scheduled in `relay.php` line 56, but no callback is implemented. | **FAIL** |
| RELAY-010 | Admin inbox with badges, sort/filter | `admin/views/inbox.php` **MISSING**. `includes/class-admin.php` line 100 attempts `require_once RELAY_PLUGIN_DIR . 'admin/views/inbox.php'` which will fatal-error. | **FAIL** |
| RELAY-011 | One-click reply opening native email client | `admin/views/inbox.php` **MISSING**. No `mailto:` link implementation exists. | **FAIL** |
| RELAY-012 | `wp_mail` routing per category | `includes/class-async-processor.php` **MISSING**. No routing logic exists. | **FAIL** |
| RELAY-013 | WP.org coding standards | Existing files: ABSPATH guards present, nonces used (`check_admin_referer` line 160), capability checks (`current_user_can('manage_options')` lines 96, 104, 156), sanitization (`sanitize_text_field`, `sanitize_email`, `sanitize_textarea_field`), escaping (`esc_html`, `esc_attr`, `esc_url`). **BUT** half the surface area is missing, so full audit impossible. | **PARTIAL** |
| RELAY-014 | PHP 7.4+ compatibility, graceful degradation | Existing code uses no union types, named arguments, `match`, or `str_contains()`. No `openssl` extension check before calling `openssl_encrypt` (line 182) — will fatal on hosts without openssl. Graceful degradation for Claude API failure impossible to verify because client file is missing. | **PARTIAL** |

**Requirement Pass Rate:** 2 PASS, 2 PARTIAL, 10 FAIL.

---

## Step 5 — LIVE TESTING

### Build
No Node.js/Webpack build step required (pure PHP plugin per architecture lock). **N/A**

### PHP Syntax Lint
```bash
find . -name '*.php' -exec php -l {} \;
```
**Result:** All 5 existing PHP files pass lint ("No syntax errors detected").

### Deployment / Activation
**BLOCKED.** The plugin cannot be activated in WordPress because:
1. `class-relay.php` line 27: `require_once RELAY_PLUGIN_DIR . 'includes/class-form-handler.php';` → **fatal error** (file missing).
2. `class-relay.php` line 28: `require_once RELAY_PLUGIN_DIR . 'includes/class-claude-client.php';` → **fatal error** (file missing).
3. `class-relay.php` line 29: `require_once RELAY_PLUGIN_DIR . 'includes/class-cache.php';` → **fatal error** (file missing).
4. `class-relay.php` line 30: `require_once RELAY_PLUGIN_DIR . 'includes/class-async-processor.php';` → **fatal error** (file missing).
5. `class-admin.php` line 100: `require_once RELAY_PLUGIN_DIR . 'admin/views/inbox.php';` → **fatal error** when accessing Inbox page (file missing).

No curl endpoints available because REST routes are not registered (handler file missing).

### Screenshot
**BLOCKED.** Admin pages cannot be reliably rendered because inbox view is missing and asset enqueue will 404 on CSS/JS.

### Test Scripts
`tests/` directory is empty. Zero automated tests to run.

**Verdict:** FAIL. Cannot verify against a running system because the system cannot boot.

---

## Step 6 — GIT STATUS CHECK

```bash
git status --short deliverables/relay-ai-form-handler/
```
**Result:**
```
 M deliverables/relay-ai-form-handler/admin/views/settings.php
 M deliverables/relay-ai-form-handler/relay.php
```

**Two modified files in the deliverables directory are uncommitted.**

**Verdict:** FAIL. Everything must be committed before passing QA.

---

## Issue Register (Ranked by Severity)

### P0 — Build Blockers (Ship-stoppers)

| # | Issue | Evidence | Fix Required |
|---|-------|----------|--------------|
| P0-1 | **Missing `includes/class-form-handler.php`** | Referenced by `class-relay.php:27`. File does not exist. | Create file with CF7 hook, REST endpoint registration, input sanitization, nonce/token validation. |
| P0-2 | **Missing `includes/class-claude-client.php`** | Referenced by `class-relay.php:28`. File does not exist. | Create file with `wp_remote_post` to Claude Messages API, retry loop (3× exp backoff), JSON parse, graceful `null` return. |
| P0-3 | **Missing `includes/class-cache.php`** | Referenced by `class-relay.php:29`. File does not exist. | Create file with hash-based dedup cache, 24h TTL, `purge()`, daily cleanup. |
| P0-4 | **Missing `includes/class-async-processor.php`** | Referenced by `class-relay.php:30`. Cron hook scheduled in `relay.php:56` but no handler exists. | Create file with `process_batch()`, taxonomy update, `wp_mail` routing, spam quarantine. |
| P0-5 | **Missing `admin/views/inbox.php`** | Required by `class-admin.php:100`. Accessing Inbox menu will fatal-error. | Create inbox table with category/urgency badges (locked hex codes), filter bar, sort toggles, pagination, reply `mailto:` links. |
| P0-6 | **Missing `admin/css/relay-admin.css`** | Enqueued by `class-admin.php:84`. Directory exists but empty. | Create CSS with Inter font stack, Surface `#F8FAFC`, Border `#E2E8F0`, Text `#0F172A`, pill badges with locked hex colors, transitions. |
| P0-7 | **Missing `admin/js/relay-admin.js`** | Enqueued by `class-admin.php:85`. Directory exists but empty. | Create JS with 30s AJAX polling for inbox updates, sort/filter enhancement, reply confirmation, password reveal toggle. |
| P0-8 | **Missing `assets/relay-badge.svg`** | Referenced by `class-admin.php:25` as menu icon. Directory exists but empty. | Create SVG brand mark. |
| P0-9 | **Uncommitted changes in deliverables** | `git status` shows `relay.php` and `settings.php` modified but not committed. | Commit all changes in `deliverables/relay-ai-form-handler/`. |
| P0-10 | **Empty `tests/` directory** | Spec requires `test-file-existence.sh`, `test-php-syntax.sh`, `test-banned-patterns.sh`, `test-plugin-standards.sh`, `test-design-tokens.sh`, `test-scope-guard.sh`. | Create test scripts and verify they exit 0. |
| P0-11 | **Missing `readme.txt`** | Required for WP.org distribution per spec Wave 4. | Create readme.txt with standard headers, agency pitch, installation, FAQ, changelog. |
| P0-12 | **Missing `languages/relay.pot`** | Required for i18n pipeline per spec Wave 4. | Create `.pot` stub with WP i18n headers. |

### P1 — Functional Gaps

| # | Issue | Evidence |
|---|-------|----------|
| P1-1 | REST inbox-poll endpoint missing | Spec requires `/wp-json/relay/v1/inbox-poll` for AJAX polling. No route registered. |
| P1-2 | No `openssl` extension guard | `class-admin.php:182` calls `openssl_cipher_iv_length()` without `extension_loaded('openssl')` check. Will fatal on stripped shared hosts. |
| P1-3 | No `RELAY_API_KEY` constant validation | If constant is defined but empty, `relay_decrypt_api_key()` returns empty string; admin notice logic treats empty as "missing" but decryption path could emit warnings. |

### P2 — Polish / Minor

| # | Issue | Evidence |
|---|-------|----------|
| P2-1 | `spec.md` and `todo.md` in deliverables root | These are planning artifacts, not runtime deliverables. They do not block function but clutter the plugin root. Consider moving to `docs/` or removing before zip. |
| P2-2 | `relay.php` textdomain path uses `dirname(plugin_basename(__FILE__))` which is standard but could be hardened with `RELAY_PLUGIN_DIR` constant for consistency. | Line 44. |

---

## Cross-File Consistency Audit

### Reference Integrity
| Source File | Line | Reference | Target Exists? |
|-------------|------|-----------|----------------|
| `relay.php` | 52 | `includes/class-storage.php` | YES |
| `relay.php` | 76 | `includes/class-relay.php` | YES |
| `class-relay.php` | 25 | `includes/class-storage.php` | YES |
| `class-relay.php` | 26 | `includes/class-admin.php` | YES |
| `class-relay.php` | 27 | `includes/class-form-handler.php` | **NO** |
| `class-relay.php` | 28 | `includes/class-claude-client.php` | **NO** |
| `class-relay.php` | 29 | `includes/class-cache.php` | **NO** |
| `class-relay.php` | 30 | `includes/class-async-processor.php` | **NO** |
| `class-admin.php` | 84 | `admin/css/relay-admin.css` | **NO** |
| `class-admin.php` | 85 | `admin/js/relay-admin.js` | **NO** |
| `class-admin.php` | 100 | `admin/views/inbox.php` | **NO** |
| `class-admin.php` | 108 | `admin/views/settings.php` | YES |
| `class-admin.php` | 25 | `assets/relay-badge.svg` | **NO** |

**4 of 13 cross-file references resolve to existing files.** The remaining 9 are broken references.

### Design Token Consistency (Existing Code)
- Settings page uses inline `style="color:#22c55e;"` for "Key saved" indicator — matches Low urgency token `#22C55E` (case-insensitive match). PASS.
- No other design tokens are utilized because CSS file is missing.

---

## Sign-Off

**QA Director:** Margaret Hamilton
**Pass Status:** **BLOCKED**
**P0 Count:** 12
**P1 Count:** 3
**P2 Count:** 2

### Required Actions Before Re-QA
1. Create all 8 missing core files (P0-1 through P0-8).
2. Commit all uncommitted changes in deliverables (P0-9).
3. Populate `tests/` with required verification scripts and ensure exit 0 (P0-10).
4. Add `readme.txt` and `languages/relay.pot` (P0-11, P0-12).
5. Re-run `php -l` on every `.php` file.
6. Verify `git status` in deliverables directory is clean.
7. Attempt a fresh WordPress install + activation; confirm zero fatal errors.

**No build ships with known P0 issues. Fix them all, then come back.**
