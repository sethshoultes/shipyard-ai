# WP Intelligence Suite — Build Spec

**Source PRD:** `/home/agent/shipyard-ai/prds/wp-intelligence-suite.md`
**Source Plan:** `/home/agent/shipyard-ai/.planning/phase-1-plan.md`
**Source Decisions:** `/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md`
**Build Root:** `projects/wp-intelligence-suite/build/wp-intelligence-suite/` (relative to repo root)
**CI/CD:** `.github/workflows/ci.yml` (repo root)
**Phase:** 1 (Foundation & Modules)

---

## 1. Goals

Derived from the PRD and locked debate decisions. These are the outcomes the build must produce.

| # | Goal | Source |
|---|------|--------|
| G1 | **WordPress.org distribution ready** — `readme.txt`, banner, screenshot, compliant plugin headers, no aggressive upsell copy | Decision #1, PRD Integrations |
| G2 | **Zero-error activation** — activation completes in <5 seconds, <64 MB peak memory, zero external API calls, no white screens on PHP 5.6 shared hosting | Decision #3, PRD Risks |
| G3 | **Pre-seeded defaults** — at activation, LocalGenius FAQs, Dash seed note, and Pinned sample agreement exist in the database with no blank slate | Decision #12, PRD Features |
| G4 | **LocalGenius visitor widget** — front-end FAQ/chat widget rendered via `[localgenius]` shortcode or optional auto-inject; static hand-written templates only (no LLM in v1) | Decision #5, PRD Feature 8, OQ-5 |
| G5 | **Dash team tracking module** — custom post type `wis_note` with native WP admin UI (`WP_List_Table`), `@mention` support, status meta box, activity log | PRD Feature 5, OQ-2 |
| G6 | **Pinned agreements module** — custom post type `wis_agreement` with native WP admin UI, checklist meta box, pin/bookmark sidebar, category taxonomy | PRD Feature 6, OQ-2 |
| G7 | **Tier gating** — invisible free vs. pro differentiation via `get_option('wis_tier')` and feature map; no visible toggles in UI | Decision #11, PRD Tier Structure |
| G8 | **Stripe Checkout link** — one payment URL for Pro upgrades; no billing engine, webhooks, subscription management, or "annual" copy in product UI | Decision #9, #7, PRD Feature 9 |
| G9 | **Hard usage limits** — technically enforced 50-response/month free cap on LocalGenius interactions; warm contextual nudge at 80%; inline block at 100% | Decision #8, #6, PRD Cross-Promotion |
| G10 | **Single contextual tooltip** — exactly one warm, dismissible tooltip on first admin page load after activation; no wizard, no tour, no modals | Decision #2, PRD Onboarding |
| G11 | **WP-CLI compatibility** — `wp wis activate`, `wp wis status`, `wp wis deactivate`; CLI-safe (no admin hooks/assets) | MVP Feature Set #11 |
| G12 | **CI/CD pipeline** — GitHub Actions running PHP lint (5.6, 7.4, 8.0, 8.3 matrix), WordPress Coding Standards, and PHPUnit | PRD Success Metrics |
| G13 | **PHPUnit coverage** — tests for activation routines, tier gating, usage limits, and module registration; runs in CI | PRD Success Metrics |

---

## 2. Implementation Approach

### 2.1 Architecture

**Path A — Decoupled Three-Plugin Architecture** (per locked OQ-1 resolution):

- `wis-core/` — shared constants, tier logic, usage limits, settings page, onboarding tooltip, WP-CLI commands
- `localgenius/` — visitor-facing FAQ widget, admin placement settings
- `dash/` — team notes / tracking module
- `pinned/` — agreements / memory module

Each child plugin (`localgenius`, `dash`, `pinned`) has its own main file with `ABSPATH` guard, plugin header, activation/deactivation hooks, and a dependency check for `wis-core` on `plugins_loaded`.

`wis-core` registers child plugins via `include_once` with existence checks in `class-loader.php`.

### 2.2 Key Technical Constraints

| Constraint | Rule |
|------------|------|
| PHP compatibility | 5.6 through 8.3 — no typed properties, no `??`, no `match`, no named arguments |
| External API calls | **Zero** during activation hooks; lazy-load everything heavy |
| Admin UI | Native WordPress only — `WP_List_Table`, meta boxes, native CSS classes, no custom design system |
| Output sanitation | `wp_kses_post`, `esc_html`, `esc_url`, `sanitize_text_field` on all user-facing output |
| Capability checks | `manage_options` for settings; custom caps (`edit_wis_notes`, `edit_wis_agreements`) for content |
| Licensing | Honor-system license key field in settings; saving key sets `wis_tier` to `pro`; no Freemius SDK in v1 |
| Billing | Single Stripe Checkout URL constant (`WIS_STRIPE_CHECKOUT_URL`); filterable; no webhooks, no portal |
| Onboarding | One tooltip only — no wizard, no tour, no hotspots |
| Free tier limit | 50 responses/month; hard block in code; resets monthly via timestamp comparison |

### 2.3 Wave Execution

| Wave | Theme | Tasks |
|------|-------|-------|
| 1 | Foundation | Scaffold architecture, .org distribution assets, CI pipeline |
| 2 | Core Infrastructure | Tier/licensing system, zero-error activation with pre-seeded defaults |
| 3 | Module Build | LocalGenius widget, Dash tracking, Pinned agreements |
| 4 | Integration & Polish | Usage limits, Stripe link, single tooltip, WP-CLI commands |
| 5 | Verification | PHPUnit test suite, CI integration of tests |

---

## 3. Verification Criteria

For each goal, the exact method to prove it works.

### G1 — WordPress.org Distribution
- `org-assets/readme.txt` exists and contains standard headers (Plugin Name, Contributors, Tags, Requires at least, Tested up to, Requires PHP, Stable tag, License)
- Short description ≤ 150 characters
- No aggressive upsell language (no "Upgrade now!" banners, no "Pro only" in description)
- No "annual billing" or "monthly" copy in readme marketing sections
- `org-assets/banner-772x250.png` exists (772×250 PNG banner)
- `org-assets/screenshot-1.png` exists (admin UI screenshot)
- All main plugin files contain `License: GPL-2.0-or-later` header

### G2 — Zero-Error Activation
- `php -l` passes on all `.php` files with zero errors
- `grep -R "wp_remote_get\|wp_remote_post\|curl_init\|file_get_contents"` inside activation hook functions returns zero matches
- Each plugin main file contains `register_activation_hook` and `register_deactivation_hook` stubs
- Deactivation hooks clean transients but do **not** delete user content (seed posts remain)
- Activation creates options without fatal errors when run via `wp wis activate`

### G3 — Pre-Seeded Defaults
- After activation, database contains:
  - ≥5 FAQ template posts (post type `wis_faq` or stored as options) for LocalGenius
  - 1 seed `wis_note` post with title containing "Welcome to Dash"
  - 1 seed `wis_agreement` post with title containing "Sample Agreement"
- Options table contains `wis_tier` = `'free'`, `wis_usage_count` = `0`, `wis_version` set

### G4 — LocalGenius Visitor Widget
- Shortcode `[localgenius]` is registered and returns non-empty HTML containing FAQ items
- `localgenius/public/css/localgenius.css` is enqueued only on front-end (not `admin_enqueue_scripts`)
- `localgenius/public/js/localgenius.js` is enqueued with `defer`
- Widget HTML includes keyboard-navigable elements (`tabindex`, `role` attributes)
- Admin settings page exists under Settings menu with placement toggle (shortcode vs. auto-inject)
- FAQ content is loaded from static PHP array or database posts; no LLM API calls in v1

### G5 — Dash Team Tracking
- Custom post type `wis_note` is registered on `init`
- Admin menu page appears under wp-admin with Dashicon icon
- `WP_List_Table` subclass renders notes list with columns: Title, Author, Status, Date
- Note edit screen has native meta box for status: Open / In Progress / Resolved
- `@mention` support implemented via regex or user dropdown in editor
- `save_post_wis_note` hook logs basic activity (timestamp, user ID)
- `edit_wis_notes` capability is mapped and checked

### G6 — Pinned Agreements
- Custom post type `wis_agreement` is registered on `init`
- Admin menu page appears under wp-admin
- `WP_List_Table` subclass renders agreements list
- Meta box for checklist saves/retrieves serialized array of todo items
- Pin/bookmark functionality stores bookmarked agreement IDs in user meta
- Category taxonomy `wis_agreement_cat` is registered and available
- `edit_wis_agreements` capability is mapped and checked

### G7 — Tier Gating
- `wis_get_tier()` returns `'free'` when `wis_tier` option is missing or `'free'`
- `wis_is_pro()` returns `false` for free, `true` for `'pro'`
- `wis_is_feature_available($feature_key)` respects feature map array
- Settings page under Settings → Intelligence contains license key input
- Saving a non-empty license key updates `wis_tier` to `'pro'`
- No visible tier toggle UI exists in any admin page

### G8 — Stripe Checkout Link
- `WIS_STRIPE_CHECKOUT_URL` constant or filter is defined in `wis-core/includes/class-tier.php`
- Settings page contains "Upgrade to Pro" button linking to Stripe Checkout URL
- No subscription management UI, no webhook handlers, no invoice viewers exist in plugin code
- No "annual" or "monthly" billing language appears in plugin dashboard or settings copy
- Checkout success return URL points to plugin settings page

### G9 — Hard Usage Limits
- `wis-core/includes/class-usage.php` exists with `wis_increment_usage()` and `wis_get_usage()`
- `WIS_FREE_LIMIT` constant defaults to `50`
- Counter auto-resets when stored `month_start` < current month
- At usage ≥ 80% (40 responses), widget shows warm nudge inline (not popup/admin notice)
- At usage ≥ 100% (50 responses), widget content is replaced with nudge; no new FAQ responses render
- Pro users bypass limit entirely via `wis_is_pro()` filter

### G10 — Single Contextual Tooltip
- `wis-core/assets/js/tooltip.js` exists — vanilla JS, shows once, dismisses on click
- `wis-core/assets/css/tooltip.css` exists — warm, subtle, WordPress-native colors
- Assets enqueued via `admin_enqueue_scripts` only
- Tooltip references all three seeded modules by name
- Dismissal stored in `user_meta` as canonical source + `localStorage` as cache
- After dismissal, tooltip never reappears for that user
- No other onboarding elements exist: `grep -R "wizard\|tour\|hotspot\|modal" wis-core/ localgenius/ dash/ pinned/` returns zero matches (except in comments)

### G11 — WP-CLI Compatibility
- `wis-core/wp-cli/class-wis-cli.php` exists and extends `WP_CLI_Command`
- Commands registered: `wp wis activate`, `wp wis status`, `wp wis deactivate`
- `activate` accepts optional `--tier=pro` flag
- `status` outputs current tier, usage count, and module activation state
- Commands guarded by `defined('WP_CLI') && WP_CLI`
- CLI activation produces identical options and seed data as web activation
- No admin-specific hooks or asset enqueues triggered during CLI commands

### G12 — CI/CD Pipeline
- `.github/workflows/ci.yml` exists at repo root
- Triggers on `push` to `main` and `pull_request`
- Job `php-lint` runs on `ubuntu-latest` with PHP matrix: 5.6, 7.4, 8.0, 8.3
- Job `wpcs` installs WordPress Coding Standards via Composer and runs `phpcs`
- Job `phpunit` scaffolds test runner (tests execute in Wave 5)
- YAML syntax is valid (`yamllint` or GitHub Actions parser)

### G13 — PHPUnit Coverage
- `phpunit.xml` exists in build root with WordPress test suite bootstrap
- `tests/bootstrap.php` loads WordPress test environment and plugin files
- Test files exist:
  - `tests/test-activation.php` — options created, seed posts created, zero HTTP, <5s
  - `tests/test-tier.php` — default free, pro toggle, feature map blocking
  - `tests/test-usage.php` — counter increments, blocks at 50, monthly reset, pro bypass
  - `tests/test-localgenius.php` — shortcode registered, FAQ HTML rendered
  - `tests/test-dash.php` — CPT `wis_note` registered on `init`
  - `tests/test-pinned.php` — CPT `wis_agreement` registered on `init`
- All tests pass when run via `phpunit`
- CI workflow executes tests automatically on PRs

---

## 4. Complete File Inventory

### 4.1 Repo-Level CI/CD (1 file)

| File | Status | Purpose |
|------|--------|---------|
| `.github/workflows/ci.yml` | **Create** | GitHub Actions: PHP lint matrix, WPCS, PHPUnit |

### 4.2 Plugin Core — `wis-core/` (8 files + 1 dir)

| File | Status | Purpose |
|------|--------|---------|
| `wis-core/wis-core.php` | **Create** | Main plugin file: headers, ABSPATH guard, constants (`WIS_VERSION`, `WIS_DIR`, `WIS_URL`), activation/deactivation hooks, loader bootstrap |
| `wis-core/includes/class-loader.php` | **Create** | Registers child plugins with `include_once` + existence checks |
| `wis-core/includes/class-tier.php` | **Create** | Tier constants, `wis_get_tier()`, `wis_is_pro()`, `wis_is_feature_available()`, `WIS_STRIPE_CHECKOUT_URL` |
| `wis-core/includes/class-settings.php` | **Create** | Settings API page, license key field, sanitize, capability check |
| `wis-core/includes/class-usage.php` | **Create** | Usage counter, monthly reset, limit enforcement, nudge logic |
| `wis-core/assets/js/tooltip.js` | **Create** | Single tooltip: show once, dismiss handler, `localStorage` cache |
| `wis-core/assets/css/tooltip.css` | **Create** | Warm, subtle tooltip styles using WordPress admin color variables |
| `wis-core/wp-cli/class-wis-cli.php` | **Create** | `WP_CLI_Command` subclass: `activate`, `status`, `deactivate` |
| `wis-core/includes/` | **Create** | Directory stub |

### 4.3 LocalGenius Module — `localgenius/` (7 files + 3 dirs)

| File | Status | Purpose |
|------|--------|---------|
| `localgenius/localgenius.php` | **Create** | Main plugin file: headers, ABSPATH guard, dependency check for wis-core, activation/deactivation, bootstrap |
| `localgenius/includes/class-widget.php` | **Create** | Shortcode `[localgenius]` registration, optional `wp_footer` injection, FAQ query/render |
| `localgenius/includes/class-admin.php` | **Create** | Settings page for widget placement (auto-inject vs. shortcode), capability check |
| `localgenius/public/css/localgenius.css` | **Create** | Responsive, accessible widget styles; no external fonts |
| `localgenius/public/js/localgenius.js` | **Create** | Vanilla JS: FAQ toggle, simple search filter, dismiss logic; enqueued with defer |
| `localgenius/templates/widget.php` | **Create** | HTML template for chat-like widget interface |
| `localgenius/includes/` | **Create** | Directory stub |
| `localgenius/public/css/` | **Create** | Directory stub |
| `localgenius/public/js/` | **Create** | Directory stub |
| `localgenius/templates/` | **Create** | Directory stub |

### 4.4 Dash Module — `dash/` (3 files + 2 dirs)

| File | Status | Purpose |
|------|--------|---------|
| `dash/dash.php` | **Create** | Main plugin file: headers, ABSPATH guard, dependency check, CPT registration, activation/deactivation, bootstrap |
| `dash/includes/class-notes-list-table.php` | **Create** | Extends `WP_List_Table` for note management |
| `dash/admin/` | **Create** | Directory stub for future admin views |
| `dash/includes/` | **Create** | Directory stub |
| `dash/assets/` | **Create** | Directory stub for future admin assets |

### 4.5 Pinned Module — `pinned/` (3 files + 2 dirs)

| File | Status | Purpose |
|------|--------|---------|
| `pinned/pinned.php` | **Create** | Main plugin file: headers, ABSPATH guard, dependency check, CPT registration, taxonomy registration, activation/deactivation, bootstrap |
| `pinned/includes/class-agreements-list-table.php` | **Create** | Extends `WP_List_Table` for agreement management |
| `pinned/admin/` | **Create** | Directory stub for future admin views |
| `pinned/includes/` | **Create** | Directory stub |
| `pinned/assets/` | **Create** | Directory stub for future admin assets |

### 4.6 WordPress.org Distribution — `org-assets/` (3 files)

| File | Status | Purpose |
|------|--------|---------|
| `org-assets/readme.txt` | **Create** | .org-standard readme: headers, short/long description, installation, FAQ, changelog, screenshots |
| `org-assets/banner-772x250.png` | **Create** | 772×250 PNG banner for WordPress.org plugin page |
| `org-assets/screenshot-1.png` | **Create** | Admin UI screenshot for WordPress.org plugin page |

### 4.7 PHPUnit Test Suite — `tests/` (8 files)

| File | Status | Purpose |
|------|--------|---------|
| `phpunit.xml` | **Create** | WordPress test suite configuration, bootstrap path, test directories |
| `tests/bootstrap.php` | **Create** | Loads WordPress test environment and all plugin main files |
| `tests/test-activation.php` | **Create** | Tests: options created, seed posts created, zero HTTP requests, activation <5s |
| `tests/test-tier.php` | **Create** | Tests: default tier free, `is_pro()` false, pro after license save, feature map blocking |
| `tests/test-usage.php` | **Create** | Tests: counter increments, blocks at 50, monthly reset, pro bypass |
| `tests/test-localgenius.php` | **Create** | Tests: shortcode exists, widget renders FAQ HTML |
| `tests/test-dash.php` | **Create** | Tests: `wis_note` CPT registered on `init` |
| `tests/test-pinned.php` | **Create** | Tests: `wis_agreement` CPT registered on `init` |

### 4.8 Summary Counts

- **New files to create:** 33
- **New directories to create:** 11
- **Files to modify (repo-level):** 1 (`.github/workflows/ci.yml`)
- **Total artifacts:** 45

---

## 5. Banned Patterns Checklist

The following must **not** appear in the build output. Verification tests will grep for these.

| # | Banned Pattern | Why | Where to Check |
|---|----------------|-----|----------------|
| B1 | `Freemius` or `freemius` | Freemius SDK deferred to v2 per Decision #9/OQ-6 | All PHP files |
| B2 | `wp_remote_get`, `wp_remote_post`, `curl_init`, `file_get_contents` inside activation hooks | Zero external API calls at activation per Decision #3 | `wis-core.php`, `localgenius.php`, `dash.php`, `pinned.php` activation functions |
| B3 | `wizard`, `tour`, `hotspot`, `onboarding_wizard` in code | No wizard per Decision #2 | All PHP/JS/CSS files |
| B4 | `annual billing`, `monthly billing`, `per month` in product UI | Annual billing hidden in Stripe only per Decision #7 | Admin settings pages, readme marketing sections |
| B5 | Typed properties (`public string $foo`), null coalesce (`??`), `match` expressions | PHP 5.6 compatibility per Task 1 | All PHP files |
| B6 | Custom CSS framework enqueues (Bootstrap, Tailwind, custom design system) | Native WP UI only per OQ-2 | Admin pages |
| B7 | `admin_notices` billboard upgrade banners | Contextual nudges only per Decision #6 | All PHP files |
| B8 | Anonymous analytics / telemetry sends | No data flywheel in v1 per Decision #10 | All PHP/JS files |
| B9 | `class_suite_manager.php`, `class_onboarding.php`, `class_analytics.php` | PRD original filenames that don't match Path A architecture | Entire build |

---

## 6. Definition of Done (Phase 1)

All of the following must be true to mark Phase 1 complete:

1. Every file in Section 4 exists and `php -l` passes.
2. Every directory in Section 4 exists.
3. All verification criteria in Section 3 are satisfied by automated or manual checks.
4. All banned patterns in Section 5 return zero grep matches.
5. `phpunit` runs and all tests pass.
6. CI pipeline runs green on the latest commit.
7. No fatal errors on activation in a clean WordPress 6.5+ install running PHP 5.6.
8. `wp wis status` returns structured output with tier, usage, and module state.
9. The single tooltip appears exactly once after activation and never again after dismissal.
10. LocalGenius widget renders on the front-end with 5+ FAQ items visible.
