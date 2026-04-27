# Requirements Traceability Matrix
# WP Intelligence Suite — Phase 1

**Generated**: 2026-04-24
**Source Documents**:
- `/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md` (PRIMARY — single source of truth)
- `/home/agent/shipyard-ai/prds/wp-intelligence-suite.md` (secondary — overridden where conflicts exist)

**Project Status**: Locked decisions — 6 Open Questions resolved in Phase 1 Plan
**Project Slug**: `wp-intelligence-suite`
**Total Requirements**: 38
**Estimated Token Budget**: 1M (scoped per decisions.md)

---

## Requirements Summary by Category

| Category | Count | Description |
|----------|-------|-------------|
| Architecture | 3 | Three-plugin scaffold, core loader, file structure |
| Core / Tier | 4 | Tier gating, licensing, constants, invisible gating |
| Activation | 4 | Zero-error activation, pre-seeded defaults, no external APIs, no wizard |
| LocalGenius | 4 | Visitor widget, static templates, public assets, admin settings |
| Dash | 3 | Team tracking, notes, admin UI |
| Pinned | 3 | Agreements, memory, admin UI |
| Monetization | 4 | Hard usage limits, Stripe Checkout, contextual nudges, no billboards |
| Distribution | 4 | readme.txt, plugin headers, .org compliance, banner/screenshots |
| Onboarding | 1 | Single contextual tooltip |
| Power-User | 2 | WP-CLI compatibility, CLI-safe activation |
| Quality | 3 | PHPUnit tests, CI pipeline, PHP 5.6-8.3 compat |
| **Killed / Deferred** | 8 | Wizard, marketplace, agency white-label, full billing engine, analytics, Freemius, upgrade billboards, LLM activation calls |

---

## Architecture Decisions (Resolved for Phase 1)

Per `decisions.md` Build Phase Mandate: *"If no consensus, Elon's architecture wins for v1 (ship fast), Steve's vision becomes v2 north star."*

| Open Question | Resolution | Rationale |
|---------------|------------|-----------|
| **OQ-1: One plugin or three?** | **Three independent plugins with shared wis-core** | Decoupled failure domains. When LocalGenius breaks on PHP 5.6, Dash and Pinned survive. Each can be toggled. File structure follows Path A in decisions.md. |
| **OQ-2: Native WP UI or custom design system?** | **Native WordPress admin UI** | Future-proof against WP 6.6+ breaking custom admin themes. Follows existing plugin patterns found in `/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php` (native dashboard widget with `wp_add_dashboard_widget`, capability checks, `wp_enqueue_script`). |
| **OQ-3: Product name** | **Slug: `wp-intelligence-suite`. Customer-facing: "Intelligence Suite"** | Preserves .org momentum. One-word rebrand deferred to v2. |
| **OQ-4: Dashboard structure** | **Separate plugin menus under wp-admin** | Logical outcome of three-plugin architecture. No N+1 query on unified dashboard load. |
| **OQ-5: FAQ content source** | **Hand-written static templates (5 per vertical)** | No LLM dependency in v1. Lazy generation deferred to v2. Elon wins; Steve conceded activation-time scrape. |
| **OQ-6: Licensing mechanism** | **Constants file + `get_option('wis_tier')`. Simple license key field. Stripe Checkout link.** | No Freemius SDK (deferred). Self-hosted validation deferred to v2. Honor-system + Stripe link for v1. |

---

## Extracted Atomic Requirements

### ARCH-001: Three-Plugin Architecture Scaffold
**Source**: decisions.md — Path A (Elon's architecture), OQ-1 resolution
**Priority**: P0 (BLOCKER)
**Description**: Create the file structure for three independent WordPress plugins (`wis-core`, `localgenius`, `dash`, `pinned`) sharing a constants file.

**Acceptance Criteria**:
- [ ] `wis-core/` directory exists with main loader, tier logic, shared constants
- [ ] `localgenius/` directory exists with own plugin file and subdirectories
- [ ] `dash/` directory exists with own plugin file and subdirectories
- [ ] `pinned/` directory exists with own plugin file and subdirectories
- [ ] `org-assets/` directory exists for .org distribution files
- [ ] Each plugin has standard WordPress header comment block
- [ ] Security check `if (!defined('ABSPATH')) exit;` in every PHP file

**Technical Notes**:
- Reference pattern: `/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php` lines 1-23 (plugin headers, security check, constants)
- Reference pattern: `/home/agent/shipyard-ai/projects/whisper/build/whisper/whisper.php` (class-based loader in `/includes/`)
- PHP 5.6+ compatible syntax (no typed properties, no match expressions)

---

### ARCH-002: Core Plugin Loader
**Source**: decisions.md — MVP Feature Set #1 (unified loader), Path A `wis-core.php`
**Priority**: P0
**Description**: Build `wis-core.php` as the shared loader that registers all three child plugins. Provides shared constants, text domain, and version.

**Acceptance Criteria**:
- [ ] `wis-core.php` defines `WIS_VERSION`, `WIS_DIR`, `WIS_URL`
- [ ] Loader checks for dependent plugins and shows admin notice if missing
- [ ] Shared text domain `wp-intelligence-suite` registered
- [ ] No external API calls on `plugins_loaded`

---

### ARCH-003: WordPress.org File Structure Compliance
**Source**: decisions.md — File Structure section, Build Phase Mandate #4
**Priority**: P0
**Description**: File structure must comply with WordPress.org plugin repository expectations.

**Acceptance Criteria**:
- [ ] No obfuscated code
- [ ] No "phoning home" telemetry (Decision #10)
- [ ] Proper use of WordPress APIs (`register_activation_hook`, `add_action`)
- [ ] GPL-2.0-or-later license header

---

### TIER-001: Tier Gating Constants File
**Source**: decisions.md — MVP Feature Set #7, File Structure `includes/class-tier.php`
**Priority**: P0
**Description**: Create a shared constants file that defines free vs. pro feature boundaries and reads tier from database.

**Acceptance Criteria**:
- [ ] `wis-core/includes/class-tier.php` exists
- [ ] File defines `WIS_TIER_FREE` and `WIS_TIER_PRO` constants
- [ ] `wis_get_tier()` helper reads `get_option('wis_tier')` with default `'free'`
- [ ] `wis_is_pro()` helper returns boolean
- [ ] Feature map array defines which features are pro-only

---

### TIER-002: Invisible Feature Gating
**Source**: decisions.md — Locked Decision #11
**Priority**: P0
**Description**: Feature gating must be invisible to users. No visible toggles, constants, or option checks in UI.

**Acceptance Criteria**:
- [ ] No visible "upgrade" toggles in settings pages
- [ ] No exposed constants file references in UI
- [ ] Free users see features work up to limit, then see contextual nudge (not error)
- [ ] Same product experience regardless of tier

---

### TIER-003: Simple License Key Field
**Source**: decisions.md — OQ-6 resolution
**Priority**: P0
**Description**: Provide a simple license key input field in admin settings. No validation server for v1.

**Acceptance Criteria**:
- [ ] Settings page has license key input field
- [ ] Saving key updates `wis_tier` option to `'pro'`
- [ ] No external validation API call on save
- [ ] Field is sanitized with `sanitize_text_field`

---

### ACT-001: Zero-Error Plugin Activation
**Source**: decisions.md — MVP Feature Set #2, Locked Decision #3, Risk R-1
**Priority**: P0
**Description**: All plugins activate without PHP errors, white screens, or fatal crashes on shared hosting (PHP 5.6-8.3, 30s timeouts, 128MB memory).

**Acceptance Criteria**:
- [ ] Activation completes in under 5 seconds
- [ ] No white screen of death (WSOD)
- [ ] Memory usage stays under 64MB during activation
- [ ] Graceful degradation if required functions unavailable

---

### ACT-002: No External API Calls During Activation
**Source**: decisions.md — Locked Decision #3
**Priority**: P0
**Description**: Zero HTTP requests to external domains during activation hooks.

**Acceptance Criteria**:
- [ ] Zero `wp_remote_get`, `wp_remote_post`, curl, or `file_get_contents` to external domains in activation hooks
- [ ] Zero LLM/AI API calls during activation
- [ ] Activation is purely local database/file operations

---

### SEED-001: Pre-Seeded Defaults at Activation
**Source**: decisions.md — MVP Feature Set #3, Locked Decision #12
**Priority**: P0
**Description**: Upon activation, each module populates default data so users see a populated interface immediately.

**Acceptance Criteria**:
- [ ] LocalGenius loads 5 default FAQ templates on activation
- [ ] Dash creates one seed note on activation
- [ ] Pinned creates one seed agreement on activation
- [ ] No empty states requiring user to "create first X"
- [ ] Time-to-value under 30 seconds from activation

---

### SEED-002: No Onboarding Wizard
**Source**: decisions.md — Locked Decision #2
**Priority**: P0
**Description**: No multi-step onboarding wizard, setup flow, or configuration funnel.

**Acceptance Criteria**:
- [ ] No multi-step setup wizard exists in any module
- [ ] No mandatory configuration screens
- [ ] User can access full free functionality immediately after activation

---

### LG-001: LocalGenius Visitor-Facing Widget
**Source**: decisions.md — MVP Feature Set #4
**Priority**: P0
**Description**: Build a visitor-facing FAQ/chat module that displays on the front-end of WordPress sites.

**Acceptance Criteria**:
- [ ] Widget renders on front-end via shortcode or automatic injection
- [ ] Widget displays FAQ content in chat-like interface
- [ ] `public/css/`, `public/js/`, `templates/` directories exist
- [ ] Widget is responsive and accessible

---

### LG-002: LocalGenius Static Templates
**Source**: decisions.md — OQ-5 resolution (static for v1)
**Priority**: P0
**Description**: Ship hand-written FAQ templates for common verticals. No LLM generation in v1.

**Acceptance Criteria**:
- [ ] At least 5 FAQ templates included (e.g., Restaurant, Dental, Retail, Services, General)
- [ ] Templates are JSON/PHP array format for easy loading
- [ ] Templates loaded into database on activation
- [ ] No external AI dependency

---

### LG-003: LocalGenius Public Assets
**Source**: decisions.md — File Structure (Path A public assets)
**Priority**: P0
**Description**: Include public-facing CSS and JavaScript for the visitor widget.

**Acceptance Criteria**:
- [ ] CSS file enqueued on front-end only when widget is active
- [ ] JS file enqueued with defer, no jQuery dependency
- [ ] Templates use `wp_kses_post` for output sanitization

---

### DASH-001: Dash Team Tracking Module
**Source**: decisions.md — MVP Feature Set #5
**Priority**: P0
**Description**: Build the Dash module as a team tracking and notes functionality.

**Acceptance Criteria**:
- [ ] Custom post type or custom table for notes
- [ ] Admin menu item under wp-admin (native WP styling)
- [ ] Users can create, edit, and delete notes
- [ ] Notes support basic formatting

---

### DASH-002: Dash Admin Interface (Native WP)
**Source**: decisions.md — OQ-2 resolution (native WP UI)
**Priority**: P0
**Description**: Dash admin interface uses native WordPress admin tables and forms.

**Acceptance Criteria**:
- [ ] Uses `WP_List_Table` or native meta boxes for note listing
- [ ] Follows WordPress admin color scheme
- [ ] Capability checks with `current_user_can('manage_options')` or custom capability
- [ ] No custom CSS framework

---

### PIN-001: Pinned Agreements/Memory Module
**Source**: decisions.md — MVP Feature Set #6
**Priority**: P0
**Description**: Build the Pinned module for agreements and memory/bookmarking.

**Acceptance Criteria**:
- [ ] Custom post type or custom table for agreements
- [ ] Admin menu item under wp-admin (native WP styling)
- [ ] Users can create, view, and save agreements/memories
- [ ] Supports categorization or tagging

---

### PIN-002: Pinned Admin Interface (Native WP)
**Source**: decisions.md — OQ-2 resolution
**Priority**: P0
**Description**: Pinned admin interface uses native WordPress admin styling.

**Acceptance Criteria**:
- [ ] Uses `WP_List_Table` or native meta boxes
- [ ] Follows WordPress admin color scheme
- [ ] Capability checks enforced
- [ ] No custom CSS framework

---

### LIMIT-001: Hard Usage Limits Enforcement
**Source**: decisions.md — MVP Feature Set #9, Locked Decision #8
**Priority**: P0
**Description**: Technically enforced caps on free-tier usage. Not TOS-only.

**Acceptance Criteria**:
- [ ] Usage counter tracks interactions per site
- [ ] Counter resets monthly (or configurable period)
- [ ] Free tier limit is configurable via constant (default: 50)
- [ ] Free tier cannot exceed limit without upgrade
- [ ] Counter stored in `wp_options` or custom table

---

### LIMIT-002: Contextual Limit Nudges (No Billboards)
**Source**: decisions.md — Locked Decision #6
**Priority**: P0
**Description**: When a limit is hit, show one clean contextual message.

**Acceptance Criteria**:
- [ ] Limit message is warm and contextual (e.g., "You're moving fast. Want me to keep up?")
- [ ] No banner-style upgrade prompts
- [ ] No neon buttons or "Times Square" advertising in dashboard
- [ ] Message links to Stripe Checkout

---

### PAY-001: Stripe Checkout Link Integration
**Source**: decisions.md — MVP Feature Set #8, Locked Decision #9
**Priority**: P0
**Description**: One Stripe Checkout payment URL for upgrades. Not a billing portal.

**Acceptance Criteria**:
- [ ] One configured Stripe Checkout URL per tier
- [ ] Clicking upgrade redirects to Stripe Checkout
- [ ] No subscription management code
- [ ] No webhook handling
- [ ] No invoice viewing
- [ ] Post-payment: user enters license key to activate Pro

---

### PAY-002: Annual Billing Hidden in Checkout
**Source**: decisions.md — Locked Decision #7
**Priority**: P1
**Description**: Annual billing terms live in Stripe Checkout only.

**Acceptance Criteria**:
- [ ] No "annual billing" copy in plugin UI or dashboard
- [ ] No "annual billing" copy in readme.txt marketing section
- [ ] Billing terms exist only in Stripe Checkout flow and terms of service

---

### ONBOARD-001: Single Contextual Tooltip
**Source**: decisions.md — MVP Feature Set #10
**Priority**: P0
**Description**: Exactly one contextual tooltip as warm onboarding moment.

**Acceptance Criteria**:
- [ ] Exactly one tooltip exists across entire plugin suite
- [ ] Appears on first admin page load after activation
- [ ] Provides helpful guidance (e.g., "Your team notes are ready. Try creating one.")
- [ ] Dismissible with "Got it" button
- [ ] No additional tooltips or tour steps

---

### CLI-001: WP-CLI Command Registration
**Source**: decisions.md — MVP Feature Set #11, File Structure `wp-cli/class-wis-cli.php`
**Priority**: P0
**Description**: Register WP-CLI commands for agency/power-user workflows.

**Acceptance Criteria**:
- [ ] `wp wis activate` command activates all three modules
- [ ] `wp wis status` command shows tier and usage
- [ ] Commands work in CLI environment without loading admin UI
- [ ] Commands check for WP-CLI before registering

---

### DIST-001: readme.txt for WordPress.org
**Source**: decisions.md — MVP Feature Set #1
**Priority**: P0
**Description**: Create WordPress.org-optimized readme.txt.

**Acceptance Criteria**:
- [ ] Follows WordPress.org readme standards (headers, sections)
- [ ] Includes SEO-optimized description
- [ ] Contains installation instructions, FAQ, changelog
- [ ] No aggressive upsell language that triggers .org rejection
- [ ] Free version described as genuinely useful

---

### DIST-002: Plugin Banner and Screenshots
**Source**: decisions.md — MVP Feature Set #1
**Priority**: P0
**Description**: Create .org directory assets.

**Acceptance Criteria**:
- [ ] `banner-772x250.png` in `org-assets/`
- [ ] `screenshot-1.png` in `org-assets/` (at least one)
- [ ] Screenshots show actual plugin UI (can be updated after modules built)

---

### COMPAT-001: PHP 5.6-8.3 Compatibility
**Source**: decisions.md — Risk R-1
**Priority**: P0
**Description**: Plugin must run on PHP 5.6 through 8.3.

**Acceptance Criteria**:
- [ ] No PHP 7+ only syntax (typed properties, null coalescing operator `??`, etc.)
- [ ] `Requires PHP: 5.6` in plugin header
- [ ] Tested or linted for PHP 5.6 compatibility

---

### COMPAT-002: No Anonymous Analytics
**Source**: decisions.md — Locked Decision #10
**Priority**: P0
**Description**: No telemetry, data flywheel, or opt-in analytics infrastructure.

**Acceptance Criteria**:
- [ ] No tracking pixels
- [ ] No external analytics calls
- [ ] No data collection beyond what's necessary for plugin functionality

---

### TEST-001: PHPUnit Coverage for Tier and Activation
**Source**: decisions.md — File Structure (`phpunit.xml`)
**Priority**: P0
**Description**: Tests for core activation and tier gating logic.

**Acceptance Criteria**:
- [ ] `phpunit.xml` configured for WordPress test suite
- [ ] Tests verify activation creates expected options/tables
- [ ] Tests verify tier gating returns correct values
- [ ] Tests run in CI pipeline

---

### TEST-002: PHPUnit Coverage for Usage Limits
**Source**: decisions.md — Risk R-2
**Priority**: P0
**Description**: Tests verify hard usage limits are enforced.

**Acceptance Criteria**:
- [ ] Tests verify limit counter increments correctly
- [ ] Tests verify limit blocks after threshold reached
- [ ] Tests verify monthly reset logic

---

### CI-001: GitHub Actions Workflow
**Source**: decisions.md — File Structure (Shared Regardless of Path)
**Priority**: P1
**Description**: CI for PHP linting and WordPress Coding Standards.

**Acceptance Criteria**:
- [ ] `.github/workflows/ci.yml` exists
- [ ] Runs PHP lint on all plugin files
- [ ] Runs WordPress Coding Standards (WPCS) checks
- [ ] Triggers on pull requests and pushes to main

---

## Killed Features (Explicitly Excluded from Phase 1)

| Feature | Source | Why Killed |
|---------|--------|------------|
| Onboarding wizard | decisions.md #2 | Drop-off points. Replaced with pre-seeded defaults + one tooltip. |
| Template marketplace | decisions.md #4 | Two-sided marketplace = full startup. Defer to v3. |
| Agency white-label / cross-site dashboard | decisions.md #5 | Multi-tenant SaaS = separate product. Defer to v2+. |
| AI LLM calls during activation | decisions.md #3 | Shared hosting kills PHP at 30s. |
| Full Stripe billing engine | decisions.md #9 | One payment link only. Subscriptions, webhooks, proration = v2. |
| Anonymous analytics / data flywheel | decisions.md #10 | 3% opt-in = biased data. Not a flywheel. |
| Upgrade billboards / dashboard ads | decisions.md #6 | Dashboard is a cockpit, not Times Square. |
| Freemius SDK | decisions.md OQ-6 | Rate limits at scale. Custom constants + option flag instead. |

---

## Success Criteria (Phase 1 Completion)

- [ ] Three-plugin architecture scaffolded and activatable without errors
- [ ] Tier gating system works (free vs. pro differentiation)
- [ ] Pre-seeded defaults load at activation (no blank slate)
- [ ] LocalGenius widget renders on front-end with static FAQs
- [ ] Dash and Pinned modules have native WP admin interfaces
- [ ] Hard usage limits enforced with contextual nudges (not billboards)
- [ ] Stripe Checkout link configured for upgrades
- [ ] Single contextual tooltip appears on first admin visit
- [ ] WP-CLI commands registered and functional
- [ ] readme.txt and .org assets ready for submission
- [ ] CI pipeline runs PHP lint and WPCS checks
- [ ] PHPUnit tests cover activation, tier gating, and usage limits
- [ ] Zero external API calls during activation
- [ ] PHP 5.6-8.3 compatible syntax throughout

---

**Build Mantra**:
> *"The first 30 seconds are sacred. Alive at activation. Pre-seeded. Populated. Ready. No blank slate. No 'configure me' screens. The user must feel competence the moment they land."*
# Requirements: Beam (commandbar-prd)

**Generated:** 2026-04-25
**Sources:**
- PRD: `/home/agent/shipyard-ai/prds/commandbar-prd.md`
- Locked Decisions: `/home/agent/shipyard-ai/rounds/commandbar-prd/decisions.md`
- Agency Rules: `/home/agent/shipyard-ai/CLAUDE.md`
- Docs Reviewed: `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (read per CLAUDE.md mandate; not directly applicable because Beam is a WordPress plugin, not an Emdash plugin)
- WordPress Reference: `projects/agentpipe/build/agentpipe/agentpipe.php` (existing WordPress plugin demonstrating `admin_enqueue_scripts` and `wp_enqueue_script` patterns)
- External Verification: WordPress Plugin Handbook — Header Requirements (`https://developer.wordpress.org/plugins/plugin-basics/header-requirements/`) and `wp_localize_script` Reference (`https://developer.wordpress.org/reference/functions/wp_localize_script/`)

---

## Atomic Requirements

| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| **R1** | **Global Hotkey** — `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) opens the palette from any wp-admin page. `Escape` or click-backdrop closes it. | PRD §4.1 | P0 |
| **R2** | **Post/Page Search** — Search all public post types by title. Selecting a result navigates to the edit screen. | PRD §4.2 | P0 |
| **R3** | **User Search** — Search users by display name or email. Navigate to user profile on selection. | PRD §4.3 | P0 |
| **R4** | **Admin Page Search** — Hardcode the top 20 WordPress admin URLs. Offer a clean PHP filter hook so third-party plugins can inject searchable items. Filter URLs by current user capabilities. | Decisions §8, §12 | P0 |
| **R5** | **Quick Actions** — "Add New Post", "Add New Page", "View Site" actions. | PRD §4.5 (modified by Decisions §9) | P0 |
| **R6** | **Visual Polish** — Dark-only UI, chromeless animated modal overlay (200ms fade), spotlight aesthetic, category headers (Content, Users, Actions), empty state, selected row highlight (`#375a7f`). | PRD §4.6 + Decisions §6, §11 | P0 |
| **R7** | **Accessibility** — Full keyboard navigation (Up/Down arrows, Enter to select, Escape to close), focus trap inside modal, basic ARIA roles. | PRD §4.7 | P0 |
| **R8** | **Extensibility Hook** — Provide a PHP filter (`beam_items`) returning an array of `{ title, url, type }` so other plugins can register searchable commands at runtime. | Decisions §12 | P0 |
| **R9** | **Architecture** — Client-side index built once per admin page load via `wp_localize_script`. Zero REST API. Filtered in-browser with `Array.filter()`. | Decisions §2 | P0 |
| **R10** | **Minimal File Structure** — Exactly two files: `beam.php` (~200 lines) and `beam.js` (~300 lines). No subdirectories. No build step. No npm. No webpack. No separate CSS file. Procedural PHP, functional JS. | Decisions §7 | P0 |
| **R11** | **Zero Configuration** — No settings page, no onboarding wizard, no localStorage, no recent commands, no cache-clearing integrations, no plugin activation inside the palette. | Decisions §3, §4, §5, §9, §10 | P0 (Cut) |

---

## Resolved Open Questions

| Question | Resolution |
|----------|------------|
| **Exact Top 20 Admin URLs** | Defined in plan context (see `phase-1-plan.md` Wave 1, Task 1, Step 4). List: Dashboard, Posts, Add New Post, Categories, Tags, Pages, Add New Page, Media Library, Add New Media, Comments, Themes, Customize, Widgets, Menus, Plugins, Add New Plugin, Users, Add New User, Tools, Settings. |
| **Filter Hook Signature** | `apply_filters( 'beam_items', array $items )` where each item is an associative array with keys: `title` (string), `url` (string), `type` (string: `content` | `users` | `actions` | `admin`). |
| **Capability Filtering** | Before adding any admin URL to the localized index, check the current user's capabilities with `current_user_can()`. Post/user queries respect WordPress built-in query permissions. |
| **Keyboard Shortcut Collisions** | JS guards against triggering when the active element is `<input>`, `<textarea>`, or `[contenteditable]`. Calls `event.preventDefault()` on match. |
| **Media / CPT Inclusion** | Only `post` and `page` post types are included by default in v1. Attachments and custom post types are deferred to v1.1. |
| **JS Failure Fallback** | Silent degradation. If the script fails to load or JS is disabled, Beam simply does not appear. No fallback UI is provided in v1. |
| **Index Size Ceiling** | Cap each dataset at 200 items (posts, pages, users). If the site exceeds this, the most recent 200 items are returned. Total localized payload should remain well under 500KB. |

---

## Non-Requirements (Explicitly Out of Scope)

The following items are **explicitly excluded** from v1 per the locked decisions document:

- REST API endpoints (`register_rest_route`)
- Cache plugin integrations (WP Rocket, W3 Total Cache, LiteSpeed)
- Dynamic admin menu parsing
- Plugin activation / deactivation inside the palette
- Recent commands / command history
- `localStorage` of any kind
- Settings page / options UI
- Onboarding wizard, tooltips, or tutorials
- AI suggestions or natural language processing
- Light mode / theme switching
- Separate CSS file or build step (Sass, PostCSS, webpack, etc.)
- OOP class hierarchy in PHP

---

## Requirements Traceability Matrix

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R1 | phase-1-task-2 | Wave 1 |
| R2 | phase-1-task-1 | Wave 1 |
| R3 | phase-1-task-1 | Wave 1 |
| R4 | phase-1-task-1 | Wave 1 |
| R5 | phase-1-task-1, phase-1-task-2 | Wave 1 |
| R6 | phase-1-task-2 | Wave 1 |
| R7 | phase-1-task-2 | Wave 1 |
| R8 | phase-1-task-1 | Wave 1 |
| R9 | phase-1-task-1, phase-1-task-2 | Wave 1 |
| R10 | phase-1-task-1, phase-1-task-2 | Wave 1 |
| R11 | phase-1-task-1, phase-1-task-2 | Wave 1 |
