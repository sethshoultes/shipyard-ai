# Relay — AI Form Handler & Lead Router
## Build Specification (v1 MVP)

**Project slug:** `relay-ai-form-handler`
**Status:** Planned — ready for build
**Derived from:** PRD `relay-ai-form-handler.md` + locked decisions `decisions.md` + `phase-1-plan.md`
**Build constraint:** One session — ships or it doesn't count.

---

## 1. Goals

### Business Goals
1. Replace "dumb" WordPress contact form backends with an AI-native lead intelligence engine.
2. Every form submission becomes a classified, routed opportunity instead of an unread email.
3. Drive freemium volume on WP.org; paid tiers unlock advanced routing and CRM webhooks in v2.
4. Target WordPress agencies first (one agency × 50 sites = leverage).

### Product Goals (from PRD §3 Must-Haves)
1. REST endpoint captures form submissions and stores them securely.
2. Claude AI classifies intent into Sales, Support, Spam, General + urgency High/Medium/Low.
3. Routing engine sends email notifications based on classification results.
4. Admin inbox page lists submissions with color-coded category badges and date sorting.
5. Settings page configures routing rules, API endpoint, and security token.
6. Plugin passes WordPress.org coding standards (nonces, capability checks, prepared SQL, i18n).

### Technical Goals (from locked decisions)
1. **Pure PHP plugin** — no Cloudflare Worker, no Node.js build step for backend.
2. **Direct PHP-to-Claude** via `wp_remote_post` — eliminates one deployment target and network hop.
3. **Async classification** — store instantly, return 200 OK in <100ms, classify in background via WP Cron.
4. **Classification caching (Day 1)** — hash-based deduplication to survive agency scale.
5. **Shared-hosting compatibility** — PHP 7.4+, zero exotic extensions, graceful degradation.
6. **Zero-setup wizard** — install, enter API key, submit a form, see a living classified lead.

---

## 2. Implementation Approach

### Architecture Summary
WordPress plugin (`relay/`) with a singleton loader pattern. All backend logic in PHP. No React/Webpack. No Cloudflare Worker. Admin UI is PHP-rendered with custom CSS and vanilla JS.

### Data Model
- **Custom Post Type:** `relay_lead` (`public => false`, `show_ui => true`, `show_in_menu => false`)
- **Taxonomies:**
  - `relay_category` (hierarchical): Sales, Support, Spam, General
  - `relay_urgency` (flat): High, Medium, Low
- **Post Meta:**
  - `_relay_email` (string)
  - `_relay_message` (string)
  - `_relay_source` (string)
  - `_relay_raw_json` (string)
  - `_relay_classification_json` (string)
  - `_relay_status` (string, default `pending`)

### Classification Pipeline (Async)
```
Form Submit → Relay_Form_Handler → Relay_Storage::create_lead() → 200 OK to visitor
                                      ↓
                                WP Cron (relay_process_leads)
                                      ↓
                         Relay_Async_Processor::process_batch()
                                      ↓
                    Relay_Cache::get() → hit? return cached
                                      ↓ miss
                    Relay_Claude_Client::classify() → 3 retries, exp backoff
                                      ↓
                    Relay_Cache::set() → update taxonomy + meta → wp_mail routing
```

### Design Tokens (Locked)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#F97316` | Action, save buttons, brand accent |
| Background | `#FFFFFF` | Clean admin UI |
| Surface | `#F8FAFC` | Card backgrounds |
| Border | `#E2E8F0` | Dividers, table borders |
| Text | `#0F172A` | Body text |
| Accent (AI) | `#38BDF8` | AI-generated badges, Support category |
| Urgency High | `#EF4444` | High urgency badge |
| Urgency Medium | `#F59E0B` | Medium urgency badge |
| Urgency Low | `#22C55E` | Low urgency badge |
| Spam | `#64748B` | Spam category badge |
| Category Sales | `#F97316` | Sales badge |
| Category General | `#E2E8F0` | General badge |

### Security Model
- All admin pages: `current_user_can('manage_options')`
- All REST endpoints: `permission_callback` with nonce OR secret token
- All forms: `wp_nonce_field('relay_action', 'relay_nonce')` + `check_admin_referer()`
- All output: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`
- All input: `sanitize_text_field()`, `sanitize_email()`, `absint()`, `wp_kses()`
- API key: encrypted at rest with `openssl_encrypt` (key derived from `AUTH_KEY` + `SECURE_AUTH_KEY`); supports `RELAY_API_KEY` constant in `wp-config.php` as secure override
- No `eval()`, `shell_exec()`, `base64_decode()`, raw SQL outside `$wpdb`

### Wave Execution Order
| Wave | Tasks | Theme |
|------|-------|-------|
| 1 | Plugin scaffold, CPT/taxonomy, Settings page | Foundation |
| 2 | Form interception, Claude client, Classification cache | Core logic |
| 3 | Async processor + routing, Admin inbox UI | Integration |
| 4 | Security hardening, i18n, readme.txt, WP.org standards | Polish |

---

## 3. Verification Criteria

### Per-Wave Verification

#### Wave 1 — Foundation
| Criterion | How to Prove |
|-----------|-------------|
| Plugin activates without fatal error | `php -l relay.php && php -l includes/class-relay.php`; install in WP test env; activation succeeds |
| CPT `relay_lead` exists | Query `post_type_exists('relay_lead')` after activation |
| Taxonomies `relay_category` and `relay_urgency` exist with default terms | Check `get_terms()` returns Sales/Support/Spam/General and High/Medium/Low |
| Settings page loads | Navigate to wp-admin → Relay → Settings; page renders with password field, toggles, save button |
| API key encrypts/decrypts | Save a test key, verify `relay_decrypt_api_key()` returns identical string; verify `RELAY_API_KEY` constant overrides DB storage |

#### Wave 2 — Core Logic
| Criterion | How to Prove |
|-----------|-------------|
| CF7 interception works | Submit a CF7 form with integration enabled; verify `relay_lead` post created with correct meta |
| Generic REST endpoint works | `curl -X POST /wp-json/relay/v1/submit` with valid nonce/token; verify 200 + `relay_lead` created |
| REST endpoint rejects bad auth | `curl` with invalid nonce/token returns 403 |
| Claude client returns structured JSON | Mock `wp_remote_post` to return valid classification JSON; verify output array has `category`, `urgency`, `reason` |
| Claude client retries on failure | Mock 500 response twice then 200; verify 3 attempts, success on third |
| Cache deduplicates identical submissions | Submit two identical payloads; second returns cache hit with zero API calls |
| Cache TTL expires correctly | Wait for TTL (or override with test hook), submit identical payload, verify fresh API call |

#### Wave 3 — Integration
| Criterion | How to Prove |
|-----------|-------------|
| Cron batch classifies pending leads | Create 3 pending leads; trigger `relay_process_leads`; verify taxonomy terms updated, status = `classified` |
| Email routing fires per category | Classify as Sales → verify `wp_mail` sent to configured address; Spam → verify no email, status = `quarantined` |
| Manual "Process Now" works | Click dashboard button; verify pending leads classified immediately via AJAX |
| Admin inbox loads with badges | Navigate to wp-admin → Relay Inbox; verify color-coded badges render with correct hex codes |
| Filtering works | Select "Sales" from category dropdown; verify only Sales leads displayed |
| AJAX polling updates counts | Open inbox, create new lead in background; verify pending count updates within 30s without full reload |
| Reply link opens email client | Click Reply on a lead; verify `mailto:` URL with pre-filled To and Subject |

#### Wave 4 — Polish & Hardening
| Criterion | How to Prove |
|-----------|-------------|
| Zero PHP syntax errors | `find . -name '*.php' -exec php -l {} \;` returns no errors |
| Zero banned patterns | `grep -r "eval("`, `shell_exec(`, `base64_decode` in PHP files returns nothing |
| ABSPATH guard in every PHP file | `find . -name "*.php" -exec grep -L "ABSPATH" {} \;` returns nothing |
| All user strings wrapped in `__()` | `grep -rn "echo.*\"" admin/views/ | grep -v "__\|esc_"` returns nothing |
| Nonce verification on all forms | `grep -r "check_admin_referer\|check_ajax_referer" includes/ admin/` returns matches for every form handler |
| Capability checks on all admin entry points | `grep -r "current_user_can" includes/ admin/` returns matches for every admin callback |
| readme.txt validates | Paste into wordpress.org plugin readme validator; zero errors |
| Plugin Check (wp-cli) passes | `wp plugin check relay` returns zero errors and zero warnings |

### End-to-End Verification
1. Fresh WordPress install → activate Relay → no errors.
2. Enter API key on Settings page → save → key encrypts successfully.
3. Submit form via CF7 → visitor sees success in <100ms.
4. Check Relay Inbox → unclassified lead appears immediately.
5. Trigger classification (cron or "Process Now") → lead shows Sales/High with orange/red badges.
6. Check email inbox → routing email received with correct subject.
7. Submit identical form again → classified instantly (cache hit).
8. Submit spammy form → status = quarantined, no routing email.

---

## 4. Files to Create or Modify

### New Files (All)
All files are new — this is a greenfield plugin build.

#### Root
| File | Purpose | Wave |
|------|---------|------|
| `relay.php` | Plugin headers, activation/deactivation hooks, textdomain loader | 1 |
| `readme.txt` | WP.org plugin readme with agency install pitch | 4 |

#### Includes
| File | Purpose | Wave |
|------|---------|------|
| `includes/class-relay.php` | Singleton loader; instantiates all component classes in dependency order | 1 |
| `includes/class-storage.php` | CPT `relay_lead` registration, taxonomy registration, default terms, `create_lead()` helper | 1 |
| `includes/class-admin.php` | Admin menu registration, submenu pages, asset enqueue, dashboard widget, REST poll endpoint | 1 |
| `includes/class-form-handler.php` | CF7 hook, generic REST endpoint `/wp-json/relay/v1/submit`, input sanitization | 2 |
| `includes/class-claude-client.php` | `wp_remote_post` to Claude Messages API, retry logic, JSON parsing, graceful degradation | 2 |
| `includes/class-cache.php` | Hash-based deduplication cache with 24h TTL, daily cleanup, purge button | 2 |
| `includes/class-async-processor.php` | WP Cron batch processor, taxonomy update, `wp_mail` routing, manual trigger AJAX | 3 |

#### Admin Views
| File | Purpose | Wave |
|------|---------|------|
| `admin/views/settings.php` | Single-screen settings form: API key (password field), integration toggles, cache purge | 1 |
| `admin/views/inbox.php` | PHP-rendered inbox: lead table, category/urgency badges, filter bar, sort toggles, pagination | 3 |

#### Admin Assets
| File | Purpose | Wave |
|------|---------|------|
| `admin/css/relay-admin.css` | Color-coded badge styles, calm command center aesthetic, Inter font stack, smooth transitions | 3 |
| `admin/js/relay-admin.js` | 30s AJAX polling for inbox updates, sort/filter form enhancement, reply confirmation, password reveal toggle | 3 |

#### Other Assets
| File | Purpose | Wave |
|------|---------|------|
| `assets/relay-badge.svg` | Brand mark for wp-admin sidebar menu icon | 1 |
| `languages/relay.pot` | i18n template stub for WP.org translation pipeline | 4 |

### Total File Count: 15

---

## 5. Explicitly Cut (v1 Scope Boundary)

Per locked decisions, these are **not** in v1. If they appear in the build, the build fails spec compliance.

| Feature | Reason Cut |
|---------|-----------|
| Cloudflare Worker | Architecture locked to direct PHP-to-Claude |
| React / Webpack / Node.js build step | Shared hosting compatibility; PHP-rendered inbox wins |
| Gutenberg form block | "Contact Form 7 and Gravity Forms exist. Relay handles what happens AFTER the form." |
| CSV export | "Copy-paste the table. Scope discipline." |
| AI reply drafts | "Nobody asked for it. v2 only if core routing is flawless." |
| Slack routing | "Core routing must be flawless before adding channels." |
| Custom database table | Deferred to v2; CPT chosen for fastest WP-native build |
| Gravity Forms integration | v1.1 feature; CF7 + generic hook ships in v1 |
| SaaS metering / billing hooks | Architecture leaves room, but not implemented |
| Setup wizard | "Zero setup wizard" philosophy — one screen, not a wizard |

---

## 6. Risk Register (Build Phase)

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Token budget overrun on inbox CSS/JS | Critical | Hard ceiling: 40% of session tokens for inbox layer. If exceeded, auto-simplify to bare `WP_List_Table` with inline styles. |
| 2 | WP Cron disabled on shared host | High | Manual "Process Now" button + admin notice recommending server-side cron. |
| 3 | Async UX feels like "dead lead" | High | Fire `spawn_cron()` immediately on submission; inbox shows pulsing "Processing" badge for unclassified leads. |
| 4 | Plugin Check fails on review | Medium | Wave 4 is entirely dedicated to standards compliance; run `wp plugin check` before calling done. |
| 5 | Claude API key exposed in DB | High | Encrypt at rest; recommend `wp-config.php` constant; UI warns if key is DB-stored. |

---

## 7. Acceptance Definition

This build is **accepted** when:
1. All 15 files exist and pass `php -l`.
2. All test scripts in `tests/` exit 0.
3. Plugin activates in a clean WordPress install without fatal errors.
4. A form submission creates a lead, classifies it (via cron or manual trigger), and routes an email.
5. Plugin Check (`wp plugin check relay`) passes with zero errors and zero warnings.
6. No cut features exist in the codebase (grep for "csv_export", "slack", "gutenberg_block", "react", "webpack" returns nothing outside comments).
