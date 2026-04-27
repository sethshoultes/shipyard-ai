# Sous (LocalGenius) Activation Sprint — Build Spec

**Source documents:**
- PRD: `/home/agent/shipyard-ai/prds/localgenius-activation-sprint.md`
- Plan: `/home/agent/shipyard-ai/.planning/phase-1-plan.md`
- Decisions: `/home/agent/shipyard-ai/rounds/localgenius-activation-sprint/decisions.md`
- Project rules: `/home/agent/shipyard-ai/CLAUDE.md`

**Status:** Ready for build
**Product name:** Sous (Decision 1)
**Scope:** Single WordPress plugin, flat file structure, ~850 lines
**PHP compatibility:** 5.6+
**Frontend:** Vanilla JS/CSS, zero dependencies

---

## Goals

1. **Ship a working plugin.** No empty directories. No TODO stubs. Every file contains runnable code.
2. **Auto-detect business metadata.** Scrape schema.org, OpenGraph, and footer text asynchronously. Pre-populate the admin screen so the user sees "We found Maria's Trattoria. Does this look like you?" instead of a blank form.
3. **Single-screen onboarding.** One admin page (`admin.php`) with collapsible sections — no wizard state machine, no "Next" buttons. Auto-save every change. Continuous gesture preserved.
4. **Working chat widget on the live frontend.** Fixed-position bubble (bottom-right), expandable panel, message history, typing indicator, close/minimize, mobile-responsive full-screen overlay. Renders real AI responses via existing Cloudflare Worker endpoint.
5. **Activate benchmark query in weekly digest.** Add percentile ranking to the existing Sunday digest: "Your review response time is 4.2 hours — that's faster than 67% of Italian restaurants in Denver." Exact computation for MVP; schema supports future nightly pre-compute.
6. **WordPress.org ready.** `readme.txt`, GPL-2.0-or-later headers, no external API calls at activation, sanitize all inputs, escape all outputs.
7. **Time-to-first-value under 3 minutes.** From plugin activation to live widget must take < 3 minutes on a standard shared host.

---

## Implementation Approach

### Architecture (from locked decisions)
- **Single flat plugin** under `sous/`. No autoloader. Simple `require_once` or inline includes.
- **No multi-plugin architecture** for this sprint. The broader WP Intelligence Suite three-plugin scaffold (`wis-core` / `localgenius` / `dash` / `pinned`) is out of scope for this activation sprint.
- **PHP 5.6+ compatible syntax** throughout: no typed properties, no `??`, no `match`, no arrow functions.
- **Security:** Every PHP file starts with `if ( ! defined( 'ABSPATH' ) ) { exit; }`.
- **No external API calls during activation** (Decision 3, Risk R-1). Detection runs async after the admin screen renders.

### Plugin Skeleton (`sous.php`)
- Standard WordPress plugin header with `Requires PHP: 5.6`, `License: GPL-2.0-or-later`.
- Constants: `SOUS_VERSION`, `SOUS_DIR`, `SOUS_URL`.
- Activation hook: seed default options (`sous_business_name`, `sous_category`, `sous_detection_status`), schedule weekly digest cron.
- Deactivation hook: clear scheduled cron, preserve user content.
- Bootstrap: hook `admin_menu` to register the single admin page; hook `wp_enqueue_scripts` to inject widget assets on frontend.

### Async Business Detection (`includes/detector.php`)
- Admin-ajax endpoint `wp_ajax_sous_detect_business` with `check_ajax_referer`.
- Scraping order: schema.org JSON-LD → OpenGraph tags → WordPress site title/tagline → footer text (phone/address regexes).
- Returns JSON with confidence scores per field. Fields with confidence < 0.7 flagged for user review.
- Caches result in `wp_options` (`sous_detected_business`) for 24 hours.
- **Graceful fallback:** If scraping fails, inline URL input + manual business name entry on the same admin screen.
- Zero external HTTP calls on activation; detection fires only when admin screen loads.

### Data Store (`includes/data-store.php`)
- Thin wrapper around `get_option` / `update_option` for all Sous settings.
- Stores: detected business metadata, user-confirmed metadata, FAQ list, widget settings, dismissed notices.
- Sanitization on all writes (`sanitize_text_field`, `wp_kses_post`).

### Single Admin Page (`admin.php`)
- Registered via `add_menu_page` under a Sous top-level menu.
- **Collapsible sections** (no page reloads):
  1. *Business Profile* — pre-populated with detected data, editable inline.
  2. *FAQ Templates* — toggle on/off each seeded FAQ, inline edit text, "Add all" / "Select none".
  3. *Widget Settings* — toggle auto-inject vs. shortcode-only, brand color picker (CSS variable override).
- **Auto-save:** Individual AJAX calls per field or WordPress heartbeat. Optimistic UI — show subtle "Saved" confirmation, never a blocking spinner.
- **First impression copy:** "We found [Business Name]. Does this look like you?"
- **Prominent external link:** "See Your Live Widget" opens the actual site in a new tab (Decision 4 — no admin preview simulation).
- Capability check: `manage_options`.
- Output escaping: `esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`.

### FAQ Templates (`data/templates.json`)
- ~200 lines of category-aware FAQ pairs.
- Categories: Restaurant, Dental, Retail, Services, Generic.
- Each entry: `category`, `question`, `answer_template` (with template variables like `{business_name}`, `{hours}`).
- Voice: warm, specific, human. Mom-test approved. No banned phrases.
- Required phrases present where appropriate: "Your AI assistant", "Room to climb", "First weekly digest arrives Monday".
- Loaded via `file_get_contents` + `json_decode` inside `sous.php` or `data-store.php` (local file, not external).

### Widget Frontend (`assets/widget.js` + `assets/widget.css`)
- **Vanilla JS, zero dependencies.** ~300 lines total.
- **CSS:** BEM naming (`sous-widget`, `sous-widget__bubble`, `sous-widget__panel`), CSS variables for theming (`--sous-brand-color`, `--sous-text-color`). No external font dependencies. Inline SVG icons.
- **Behavior:**
  - Fixed bubble bottom-right. Click to expand panel (320px × 480px).
  - Message input with Enter-to-send.
  - Typing indicator (animated dots).
  - AI responses rendered as markdown-lite (bold, links, paragraphs).
  - Close/minimize controls.
  - Mobile: full-screen overlay on viewports < 480px.
  - Graceful default state before detection completes: generic "Welcome" with Sous branding.
- **Integration:** `fetch()` to existing Cloudflare Worker endpoint. Passes `business_id` and `question`.
- Enqueued via `wp_enqueue_script` with `true` (footer) and `wp_localize_script` passing `sousConfig` (endpoint URL, business metadata, nonce).

### Admin Styles (`assets/admin.css`)
- Minimal. Uses WordPress native admin color scheme where possible.
- Warm, subtle styling for the single tooltip/notice area.
- No custom design system, no animation library.

### Weekly Digest Hook (`includes/scheduler.php`)
- Cron event `sous_weekly_digest` scheduled for Monday 9am local time via `wp_schedule_event`.
- **Query logic (exact computation for MVP):**
  ```sql
  SELECT
    me.reviews_responded,
    me.avg_response_time_hours,
    PERCENT_RANK() OVER (
      PARTITION BY benchmark_category, benchmark_city
      ORDER BY avg_response_time_hours DESC
    ) as response_time_percentile
  FROM user_metrics me
  JOIN benchmarks bm ON me.user_id = bm.user_id
  WHERE me.user_id = ?
  ```
- **Guard:** If `N < 10` users in category/city, omit percentile and show absolute metric only: "You're responding to reviews in 4.2 hours."
- **Tone:** Warm maître d'. "Room to climb 🏔️" Never shaming.
- Digest sends to admin email via `wp_mail`, using existing digest template (no new email template).

### Brand Compliance
- **Banned phrases (must NOT appear anywhere):** "Optimize your workflow", "Leverage AI", "Synergy", "Scalable solution".
- **Required phrases (must appear at least once in templates or admin copy):** "Room to climb", "Your AI assistant", "First weekly digest arrives Monday".
- Copy passes the mom test: every label sounds like a person who likes people.

---

## Verification Criteria

| # | Feature | How to Prove It Works |
|---|---------|----------------------|
| 1 | Plugin skeleton | Run `php -l sous.php` → exit 0. Confirm `ABSPATH` guard exists. Confirm activation/deactivation hooks registered. |
| 2 | Zero external API calls at activation | `grep -r "wp_remote_get\|wp_remote_post\|curl\|file_get_contents.*http" sous/` inside activation hooks → zero matches. |
| 3 | Async detection | Load wp-admin Sous page. Network tab shows `admin-ajax.php?action=sous_detect_business` returning JSON with `business_name`, `category`, `confidence`. |
| 4 | Admin page renders | `add_menu_page` callback returns valid HTML. All output escaped (no `echo $_GET` unescaped). Collapsible sections open/close via vanilla JS. |
| 5 | Auto-save | Change a field in Business Profile. Network tab shows async save. Page reload preserves value. No explicit "Save" button required. |
| 6 | FAQ templates loaded | `data/templates.json` parses with `json_decode` → valid array. ≥15 FAQs per category. Template variables like `{business_name}` present. |
| 7 | Widget renders on frontend | Visit site front-end. Widget bubble visible bottom-right. Click expands panel. `php -l` on all PHP files passes. |
| 8 | Widget accepts input | Type question in widget input, press Enter. `fetch()` request fires to Cloudflare endpoint. Response renders in message history. |
| 9 | Widget mobile responsive | Chrome DevTools → iPhone SE viewport. Widget expands to full-screen overlay. No horizontal scroll. |
| 10 | Digest cron scheduled | `wp cron event list` (or check options table) shows `sous_weekly_digest` scheduled for next Monday 9am. |
| 11 | Benchmark query | Run SQL against existing tables. Returns `response_time_percentile` for user with ≥10 peers in category/city. Returns null percentile when N < 10. |
| 12 | Brand compliance | `grep -ri "optimize your workflow\|leverage ai\|synergy\|scalable solution" sous/` → zero matches. `grep -ri "room to climb\|your ai assistant\|first weekly digest arrives monday" sous/` ≥3 matches. |
| 13 | PHP 5.6 compat | No typed properties, no `??`, no `match`, no arrow functions anywhere in PHP files. |
| 14 | Security | Every PHP file has `ABSPATH` guard. All `$_POST` / `$_GET` sanitized. All output escaped. Nonce verification on every AJAX endpoint. |
| 15 | readme.txt ready | File exists with standard WordPress.org headers: Plugin Name, Contributors, Tags, Requires at least, Tested up to, Stable tag, License. No aggressive upsell language. |

---

## Files to Create

All files are net-new. No existing files in this repo will be modified.

### Core Plugin
| # | Path | Purpose | Est. Lines |
|---|------|---------|------------|
| 1 | `sous/sous.php` | Main plugin file: header, constants, activation/deactivation hooks, bootstrap | ~80 |
| 2 | `sous/readme.txt` | WordPress.org distribution metadata | ~60 |

### Admin & Backend
| # | Path | Purpose | Est. Lines |
|---|------|---------|------------|
| 3 | `sous/admin.php` | Single admin page renderer: collapsible sections, form markup, nonce fields | ~120 |
| 4 | `sous/includes/detector.php` | Schema.org scraper, OpenGraph parser, footer regex, admin-ajax handler | ~120 |
| 5 | `sous/includes/data-store.php` | WP Options wrapper: get/set/sanitize all Sous settings | ~60 |
| 6 | `sous/includes/scheduler.php` | Weekly digest cron registration, SQL query builder, `wp_mail` sender | ~80 |

### Frontend Assets
| # | Path | Purpose | Est. Lines |
|---|------|---------|------------|
| 7 | `sous/assets/widget.js` | Chat widget: bubble, panel, message history, typing indicator, fetch to Worker | ~180 |
| 8 | `sous/assets/widget.css` | Widget styles: BEM classes, CSS variables, responsive breakpoints, inline SVG | ~120 |
| 9 | `sous/assets/admin.css` | Minimal admin page styles: collapsible sections, auto-save confirmation, native WP harmony | ~50 |

### Data
| # | Path | Purpose | Est. Lines |
|---|------|---------|------------|
| 10 | `sous/data/templates.json` | Category FAQ templates: Restaurant, Dental, Retail, Services, Generic | ~200 |

### Build Verification (this deliverable)
| # | Path | Purpose |
|---|------|---------|
| 11 | `deliverables/localgenius-activation-sprint/tests/test-structure.sh` | Verify all 10 source files exist and directory tree matches spec |
| 12 | `deliverables/localgenius-activation-sprint/tests/test-banned-patterns.sh` | Verify no banned phrases, no missing ABSPATH guards, no external HTTP in activation |
| 13 | `deliverables/localgenius-activation-sprint/tests/test-required-content.sh` | Verify required brand phrases exist in built output |
| 14 | `deliverables/localgenius-activation-sprint/tests/test-php-syntax.sh` | Run `php -l` on all `.php` files; fail on any syntax error |

**Total estimated source lines:** ~850 (per Decision 8)
**Total files:** 14 (10 source + 4 test scripts)

---

## Decisions Applied (Reference)

| Decision | How it shows up in this spec |
|----------|------------------------------|
| 1 — Product name is Sous | All files, constants, and text domain use `sous` |
| 2 — Single pre-populated admin screen | One `admin.php`, zero wizard state machines |
| 3 — Async post-render detection | `detector.php` admin-ajax endpoint; no blocking activation hook |
| 4 — Live frontend widget, no admin preview | "See Your Live Widget" opens real site; no simulated preview panel |
| 5 — Warm human voice | Banned/required phrase lists enforced in tests |
| 6 — MVP cuts | No wizard, no tooltip, no quick-win email, no empty-state illustration |
| 7 — Pre-compute percentile schema | SQL uses exact `PERCENT_RANK()` for MVP; schema supports future nightly table |
| 8 — ~850 lines, single session | Line estimates per file sum to ~850 |

---

## Open Questions from Decisions (Resolved in Build)

| # | Question | Resolution for this build |
|---|----------|---------------------------|
| 1 | Default widget state before detection? | Generic "Welcome" with Sous branding, collapsible minimal version |
| 2 | Auto-save mechanism? | Individual AJAX calls per field (cleaner than heartbeat for single-page physics) |
| 3 | Schema.org fallback? | Inline URL input on same admin screen; no redirect |
| 4 | Digest recipients? | Admin email only (`get_option('admin_email')`) |
| 5 | Vertical coverage in v1 templates? | Restaurant + Dental + Retail + Services + Generic (5 categories) |
| 6 | Percentile baseline seed data? | Exact computation over all users; metric hidden until N ≥ 10 per category/city |

---

*This document is frozen for the build phase. If implementation reveals a constraint not covered here, resolve within the locked decisions or escalate to Phil.*
