# Phase 1 Plan — WP Intelligence Suite (Foundation & Modules)

**Generated**: 2026-04-24
**Requirements**: `/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md`, `/home/agent/shipyard-ai/prds/wp-intelligence-suite.md`
**Total Tasks**: 13
**Waves**: 5
**Estimated Duration**: 2-3 sprints

---

## Documentation Review

### Existing Plugin Patterns (Verified from Codebase)

Per the **Codebase Scout** findings, the repository contains reusable WordPress plugin patterns:

1. **AdminPulse** (`/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php`) — Demonstrates:
   - Standard plugin headers with `Requires PHP`, `License: GPL-2.0-or-later`
   - Security guard: `if (!defined('ABSPATH')) exit;`
   - Constants pattern: `define('ADMINPULSE_VERSION', '1.0.0')`, `plugin_dir_path(__FILE__)`, `plugin_dir_url(__FILE__)`
   - Activation/deactivation hooks: `register_activation_hook`, `register_deactivation_hook`
   - Capability checks: `current_user_can('manage_options')`
   - AJAX endpoints with `check_ajax_referer` nonce verification
   - `wp_localize_script` for passing config to frontend
   - Transient caching with `get_transient` / `set_transient`

2. **Whisper** (`/home/agent/shipyard-ai/projects/whisper/build/whisper/whisper.php`) — Demonstrates:
   - Class-based architecture in `/includes/` subdirectory
   - Cron schedule registration with `wp_schedule_event`
   - Activation hook for cron setup, deactivation for cleanup

3. **CI/CD Pattern** (`/home/agent/shipyard-ai/.github/workflows/auto-pipeline.yml`) — Demonstrates:
   - `actions/checkout@v4`
   - Multi-step job definitions with continue-on-error semantics
   - Environment variable injection for secrets

These patterns inform the architecture and implementation steps below. **No Emdash-specific documentation is cited** because this is a native WordPress plugin project, not an Emdash site.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| ARCH-001, ARCH-002, ARCH-003 | phase-1-task-1 | 1 |
| TIER-001, TIER-002, TIER-003 | phase-1-task-4 | 2 |
| ACT-001, ACT-002, SEED-001, SEED-002 | phase-1-task-5 | 2 |
| LG-001, LG-002, LG-003 | phase-1-task-6 | 3 |
| DASH-001, DASH-002 | phase-1-task-7 | 3 |
| PIN-001, PIN-002 | phase-1-task-8 | 3 |
| LIMIT-001, LIMIT-002 | phase-1-task-9 | 4 |
| PAY-001, PAY-002 | phase-1-task-10 | 4 |
| ONBOARD-001 | phase-1-task-11 | 4 |
| CLI-001 | phase-1-task-12 | 4 |
| DIST-001, DIST-002 | phase-1-task-2 | 1 |
| COMPAT-001, COMPAT-002 | phase-1-task-1, phase-1-task-5 | 1, 2 |
| TEST-001, TEST-002 | phase-1-task-13 | 5 |
| CI-001 | phase-1-task-3 | 1 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation
Tasks: 3 | Dependencies: None

### Wave 2 (Parallel, after Wave 1) — Core Infrastructure
Tasks: 2 | Dependencies: Wave 1

### Wave 3 (Parallel, after Wave 2) — Module Build
Tasks: 3 | Dependencies: Wave 2

### Wave 4 (Parallel, after Wave 3) — Integration & Polish
Tasks: 4 | Dependencies: Wave 3

### Wave 5 (Parallel, after Wave 4) — Verification
Tasks: 1 | Dependencies: Wave 4

---

## Task Plans

### Wave 1 (Parallel)

<task-plan id="phase-1-task-1" wave="1">
  <title>Scaffold Three-Plugin Architecture</title>
  <requirement>ARCH-001, ARCH-002, ARCH-003, COMPAT-001</requirement>
  <description>
    Create the file structure for Elon's decoupled architecture: three independent plugins (wis-core, localgenius, dash, pinned) sharing a constants file. Resolve OQ-1 through OQ-6 by baking decisions into the scaffold. This is the foundational task that every other task depends on.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Source of truth for architecture decisions, Path A file structure, and Build Phase Mandate" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php" reason="Reference pattern for plugin headers, security checks, constants, activation hooks" />
    <file path="/home/agent/shipyard-ai/projects/whisper/build/whisper/whisper.php" reason="Reference pattern for class-based includes/ loader architecture" />
  </context>

  <steps>
    <step order="1">Create directory structure under `/wp-intelligence-suite/`: `wis-core/`, `localgenius/`, `dash/`, `pinned/`, `org-assets/`</step>
    <step order="2">Create `wis-core/wis-core.php` with plugin header, `ABSPATH` security guard, and constants `WIS_VERSION`, `WIS_DIR`, `WIS_URL` (pattern from AdminPulse lines 1-28)</step>
    <step order="3">Create `wis-core/includes/class-loader.php` that registers all three child plugins using `include_once` with existence checks</step>
    <step order="4">Create `localgenius/localgenius.php` with own plugin header, dependency check for wis-core, and `plugins_loaded` bootstrap</step>
    <step order="5">Create `dash/dash.php` with same structure as localgenius</step>
    <step order="6">Create `pinned/pinned.php` with same structure as localgenius</step>
    <step order="7">Create stub subdirectories: `wis-core/includes/`, `localgenius/includes/`, `localgenius/public/css/`, `localgenius/public/js/`, `localgenius/templates/`, `dash/includes/`, `dash/admin/`, `pinned/includes/`, `pinned/admin/`</step>
    <step order="8">Verify no PHP 7+ syntax is used (no typed properties, no `??`, no match expressions) — PHP 5.6 compatibility</step>
    <step order="9">Add `GPL-2.0-or-later` license header to all main plugin files</step>
    <step order="10">Verify `register_activation_hook` and `register_deactivation_hook` stubs exist in each plugin</step>
  </steps>

  <verification>
    <check type="build">php -l wis-core/wis-core.php && php -l localgenius/localgenius.php && php -l dash/dash.php && php -l pinned/pinned.php</check>
    <check type="manual">Confirm directory tree matches Path A from decisions.md</check>
    <check type="manual">Confirm every PHP file has `if (!defined('ABSPATH')) exit;`</check>
    <check type="manual">Confirm no external API calls exist in activation hooks</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>feat(arch): scaffold three-plugin architecture

Create wis-core, localgenius, dash, and pinned plugin structure:
- Each plugin has independent main file with ABSPATH guard
- wis-core provides shared constants and loader class
- PHP 5.6+ compatible syntax throughout
- No external API calls in activation stubs
- Resolves OQ-1 (three plugins), OQ-2 (native WP UI via standard headers)

Refs: ARCH-001, ARCH-002, OQ-1, OQ-2</commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>Create WordPress.org Distribution Package</title>
  <requirement>DIST-001, DIST-002</requirement>
  <description>
    Build the WordPress.org submission assets: readme.txt optimized for SEO and conversion, plugin headers, banner placeholder, and screenshot placeholder. The free version must be described as genuinely useful to pass .org review.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason=".org distribution strategy, Decision #1 (WordPress.org as primary distribution), Decision #7 (annual billing hidden in checkout)" />
    <file path="/home/agent/shipyard-ai/prds/wp-intelligence-suite.md" reason="Original brand direction and feature descriptions for readme copy" />
  </context>

  <steps>
    <step order="1">Create `org-assets/readme.txt` with WordPress.org standard headers: Plugin Name, Contributors, Tags, Requires at least, Tested up to, Requires PHP, Stable tag, License</step>
    <step order="2">Write short description (150 chars max) emphasizing "competence you can install" — a teammate inside WordPress</step>
    <step order="3">Write long description emphasizing free-tier value: visitor FAQ, team notes, agreements — already working at activation</step>
    <step order="4">Add Installation section with standard two-line install instructions</step>
    <step order="5">Add FAQ section with 3-5 real questions (not marketing copy)</step>
    <step order="6">Add Changelog section with v1.0.0 entry</step>
    <step order="7">Add Screenshots section with placeholder descriptions</step>
    <step order="8">Create `org-assets/banner-772x250.png` placeholder (can be replaced with final design later)</step>
    <step order="9">Create `org-assets/screenshot-1.png` placeholder showing admin UI mockup</step>
    <step order="10">Verify no aggressive upsell language exists in readme.txt (per .org guidelines and Decision #6)</step>
  </steps>

  <verification>
    <check type="manual">Readme.txt passes visual inspection against WordPress.org readme standards</check>
    <check type="manual">Confirm no "annual billing" or upsell copy in readme marketing sections</check>
    <check type="manual">Confirm banner is 772x250 PNG format</check>
    <check type="manual">Confirm screenshot-1.png exists in org-assets/</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>docs(org): add WordPress.org distribution package

Create readme.txt, banner, and screenshot placeholders:
- readme.txt optimized for .org SEO without aggressive upsell
- Free tier described as genuinely useful
- No annual billing copy in public-facing text
- Resolves .org review readiness

Refs: DIST-001, DIST-002</commit-message>
</task-plan>

<task-plan id="phase-1-task-3" wave="1">
  <title>Set Up CI/CD Pipeline</title>
  <requirement>CI-001</requirement>
  <description>
    Create GitHub Actions workflow for PHP linting and WordPress Coding Standards. This provides automated quality gates for all subsequent plugin code.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.github/workflows/auto-pipeline.yml" reason="Existing CI pattern in repo (checkout, multi-step jobs, continue-on-error semantics)" />
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="CI requirement for PHP linting and WordPress Coding Standards" />
  </context>

  <steps>
    <step order="1">Create `.github/workflows/ci.yml` with `name: WP Intelligence Suite CI`</step>
    <step order="2">Set triggers: `push` to main and `pull_request`</step>
    <step order="3">Add `php-lint` job running on `ubuntu-latest` with PHP 5.6, 7.4, 8.0, 8.3 matrix</step>
    <step order="4">Add step: checkout code with `actions/checkout@v4`</step>
    <step order="5">Add step: run `php -l` recursively on all plugin PHP files</step>
    <step order="6">Add `wpcs` job: install WordPress Coding Standards via Composer</step>
    <step order="7">Add step: run `phpcs` against `wis-core/`, `localgenius/`, `dash/`, `pinned/` with WordPress ruleset</step>
    <step order="8">Add `phpunit` job: scaffold test runner (tests added in later tasks)</step>
    <step order="9">Verify YAML syntax is valid</step>
  </steps>

  <verification>
    <check type="build">yamllint .github/workflows/ci.yml (or visual validation if yamllint unavailable)</check>
    <check type="manual">Review workflow to confirm it runs on PR and push to main</check>
    <check type="manual">Confirm PHP version matrix includes 5.6 and 8.3</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>ci: add GitHub Actions workflow for PHP lint and WPCS

Add CI pipeline with:
- PHP lint across 5.6, 7.4, 8.0, 8.3 matrix
- WordPress Coding Standards check via phpcs
- PHPUnit scaffold for future test additions
- Runs on push to main and pull requests

Refs: CI-001</commit-message>
</task-plan>

### Wave 2 (Parallel, after Wave 1)

<task-plan id="phase-1-task-4" wave="2">
  <title>Build Core Tier and Licensing System</title>
  <requirement>TIER-001, TIER-002, TIER-003</requirement>
  <description>
    Implement the shared tier gating system in wis-core. Free vs. pro differentiation via constants file and `get_option('wis_tier')`. Invisible gating — users never see the mechanism, only the result. Includes a simple license key field (honor system for v1).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Tier gating requirements (Decision #11 invisible gating, Decision #8 hard limits), OQ-6 licensing mechanism" />
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/essence.md" reason="Feeling: invisible intelligence. User never sees the toggle." />
    <file path="/home/agent/shipyard-ai/prds/wp-intelligence-suite.md" reason="Tier structure table (free/pro/agency) — agency deferred to v2" />
  </context>

  <steps>
    <step order="1">Create `wis-core/includes/class-tier.php` with `WIS_TIER_FREE = 'free'` and `WIS_TIER_PRO = 'pro'` constants</step>
    <step order="2">Implement `wis_get_tier()` function reading `get_option('wis_tier', 'free')`</step>
    <step order="3">Implement `wis_is_pro()` boolean helper</step>
    <step order="4">Implement `wis_is_feature_available($feature_key)` using a feature map array</step>
    <step order="5">Create `wis-core/includes/class-settings.php` with native WordPress Settings API page under Settings menu</step>
    <step order="6">Add license key input field to settings page using `sanitize_text_field`</step>
    <step order="7">On license key save, update `wis_tier` option to `'pro'` (honor system — no external validation for v1)</step>
    <step order="8">Add usage counter option name constant `wis_usage_count` with monthly reset logic</step>
    <step order="9">Verify no visible tier toggles exist in UI — only contextual behavior changes</step>
    <step order="10">Add capability checks on settings page (`manage_options`)</step>
  </steps>

  <verification>
    <check type="test">phpunit tests verify `wis_get_tier()` returns 'free' by default</check>
    <check type="test">phpunit tests verify `wis_is_pro()` returns false when option is 'free'</check>
    <check type="test">phpunit tests verify saving license key updates tier to 'pro'</check>
    <check type="manual">Review settings page to confirm no exposed constants or toggle UI</check>
    <check type="manual">Confirm zero external API calls in settings save handler</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="wis-core directory and loader must exist before adding class-tier.php" />
  </dependencies>

  <commit-message>feat(core): add tier gating and licensing system

Implement invisible feature gating:
- class-tier.php with get_option('wis_tier') and feature map
- wis_is_pro() and wis_is_feature_available() helpers
- Settings page with license key field (honor system v1)
- No visible toggles — users see working features or contextual nudges
- Resolves OQ-6 (licensing) and OQ-5 (static templates, no LLM)

Refs: TIER-001, TIER-002, TIER-003</commit-message>
</task-plan>

<task-plan id="phase-1-task-5" wave="2">
  <title>Build Zero-Error Activation with Pre-Seeded Defaults</title>
  <requirement>ACT-001, ACT-002, SEED-001, SEED-002, COMPAT-001, COMPAT-002</requirement>
  <description>
    Build the activation routines for all four plugins. Activation must complete in under 5 seconds, make zero external API calls, and pre-seed defaults so the user sees populated content immediately. The first 30 seconds are sacred.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Activation requirements (Decision #3 zero API calls, Decision #12 first 30 seconds, Risk R-1 shared hosting)" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php" reason="Reference pattern for activation hook registration (lines 33-43) and transient caching" />
    <file path="/home/agent/shipyard-ai/projects/whisper/build/whisper/whisper.php" reason="Reference pattern for cron setup in activation hook" />
  </context>

  <steps>
    <step order="1">Implement `wis_core_activate()` in `wis-core/wis-core.php`: create options table entries for tier, usage count, activation timestamp</step>
    <step order="2">Implement `localgenius_activate()`: create FAQ template posts from static PHP array (5 verticals: Restaurant, Dental, Retail, Services, General)</step>
    <step order="3">Implement `dash_activate()`: create one seed note post with title "Welcome to Dash" and body "Try @mentioning a teammate."</step>
    <step order="4">Implement `pinned_activate()`: create one seed agreement post with title "Sample Agreement" and pre-populated checklist</step>
    <step order="5">Verify activation functions contain zero `wp_remote_get`, `wp_remote_post`, curl, `file_get_contents` to external domains</step>
    <step order="6">Add deactivation hooks that clean up transient data but preserve user content</step>
    <step order="7">Profile activation with `memory_get_usage()` to confirm under 64MB peak</step>
    <step order="8">Add version option to each plugin for future upgrade routines</step>
    <step order="9">Verify no onboarding wizard screens are registered (Decision #2)</step>
    <step order="10">Test activation on PHP 5.6 syntax compatibility</step>
  </steps>

  <verification>
    <check type="test">phpunit test: activation creates expected options and seed posts</check>
    <check type="test">phpunit test: activation makes zero external HTTP requests</check>
    <check type="test">phpunit test: deactivation preserves user content</check>
    <check type="manual">Activate plugin and verify time-to-value under 30 seconds</check>
    <check type="manual">Confirm no wizard screens appear after activation</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin files and directory structure must exist before activation hooks can be added" />
  </dependencies>

  <commit-message>feat(activation): zero-error activation with pre-seeded defaults

Build activation routines for all four plugins:
- wis-core: tier and usage options initialized
- localgenius: 5 static FAQ templates loaded from PHP array
- dash: seed note with @mention guidance
- pinned: seed agreement with checklist
- Zero external API calls, under 5 seconds, under 64MB
- No onboarding wizard (Decision #2)

Refs: ACT-001, ACT-002, SEED-001, SEED-002</commit-message>
</task-plan>

### Wave 3 (Parallel, after Wave 2)

<task-plan id="phase-1-task-6" wave="3">
  <title>Build LocalGenius Visitor Widget</title>
  <requirement>LG-001, LG-002, LG-003</requirement>
  <description>
    Build the LocalGenius module: a visitor-facing FAQ/chat widget for the front-end of WordPress sites. Uses static hand-written templates (no LLM in v1). Includes public CSS/JS and admin settings for widget placement.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="LocalGenius requirements (static templates, visitor-facing, public assets)" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php" reason="Reference pattern for wp_enqueue_script, wp_localize_script, capability checks, and AJAX endpoints (lines 452-591)" />
  </context>

  <steps>
    <step order="1">Create `localgenius/includes/class-widget.php` that registers a shortcode `[localgenius]` and optional wp_footer injection</step>
    <step order="2">Create `localgenius/templates/widget.php` HTML template for chat-like interface</step>
    <step order="3">Create `localgenius/public/css/localgenius.css` with responsive, accessible styles (no external font dependencies)</step>
    <step order="4">Create `localgenius/public/js/localgenius.js` with vanilla JS: FAQ toggle, simple search filter, dismiss logic</step>
    <step order="5">Implement `localgenius_enqueue_assets()` using `wp_enqueue_script` with defer and `wp_enqueue_style` — only on front-end</step>
    <step order="6">Create `localgenius/includes/class-admin.php` with native WP settings page for widget placement (auto-inject vs. shortcode)</step>
    <step order="7">Load FAQ content from static template array, filtered by `wis_get_tier()` for pro-only templates</step>
    <step order="8">Sanitize all output with `wp_kses_post` and `esc_html`/`esc_url`</step>
    <step order="9">Add capability checks on admin settings (`manage_options`)</step>
    <step order="10">Verify widget is keyboard-navigable and screen-reader friendly</step>
  </steps>

  <verification>
    <check type="manual">Add `[localgenius]` shortcode to a test page and confirm widget renders</check>
    <check type="manual">Confirm FAQ toggle and search filter work in browser</check>
    <check type="manual">Confirm assets only load on front-end (not admin)</check>
    <check type="test">phpunit: shortcode returns expected HTML structure</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="LocalGenius plugin file and directory structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Tier gating system needed to filter pro-only templates" />
    <depends-on task-id="phase-1-task-5" reason="Seed FAQ templates must exist in database before widget queries them" />
  </dependencies>

  <commit-message>feat(localgenius): add visitor-facing FAQ widget with static templates

Build LocalGenius module:
- Shortcode [localgenius] and optional auto-inject
- Chat-like widget UI with vanilla JS (no jQuery)
- 5 static FAQ templates loaded from database
- Responsive, accessible CSS
- Admin settings for placement control
- Output sanitized with wp_kses_post

Refs: LG-001, LG-002, LG-003</commit-message>
</task-plan>

<task-plan id="phase-1-task-7" wave="3">
  <title>Build Dash Team Tracking Module</title>
  <requirement>DASH-001, DASH-002</requirement>
  <description>
    Build the Dash module: a team tracking and notes system. Uses native WordPress admin UI (WP_List_Table, meta boxes) with capability checks. No custom CSS framework.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Dash requirements (team tracking, native WP UI per OQ-2)" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php" reason="Reference pattern for native dashboard widget rendering, capability checks, and admin page hooks" />
  </context>

  <steps>
    <step order="1">Register custom post type `wis_note` with labels, supports (title, editor, author), and menu icon</step>
    <step order="2">Create `dash/includes/class-notes-list-table.php` extending `WP_List_Table` for note management</step>
    <step order="3">Add admin menu page under wp-admin using `add_menu_page` with native WordPress styling</step>
    <step order="4">Implement note creation/edit using native WordPress post edit screen (no custom form needed)</step>
    <step order="5">Add `@mention` support in note content using simple regex pattern and user dropdown</step>
    <step order="6">Add meta box for note status: Open, In Progress, Resolved</step>
    <step order="7">Implement basic team activity log using `add_action('save_post_wis_note')`</step>
    <step order="8">Add capability checks: `manage_options` for settings, custom `edit_wis_notes` for content</step>
    <step order="9">Ensure all admin output uses WordPress native CSS classes (no custom design system per OQ-2)</step>
    <step order="10">Verify tier gating: team sync features (if any) check `wis_is_pro()`</step>
  </steps>

  <verification>
    <check type="manual">Confirm Dash menu appears in wp-admin and uses native WP styling</check>
    <check type="manual">Create, edit, and delete a note through admin UI</check>
    <check type="manual">Confirm @mention dropdown works in note editor</check>
    <check type="test">phpunit: custom post type registers correctly on init</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Dash plugin file and directory structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Tier gating needed if any team features are pro-only" />
    <depends-on task-id="phase-1-task-5" reason="Seed note must exist for testing" />
  </dependencies>

  <commit-message>feat(dash): add team tracking and notes module

Build Dash module:
- Custom post type wis_note with native WP admin UI
- WP_List_Table for note management
- @mention support with user dropdown
- Note status meta box (Open/In Progress/Resolved)
- Basic activity logging
- Capability checks and native WordPress styling

Refs: DASH-001, DASH-002</commit-message>
</task-plan>

<task-plan id="phase-1-task-8" wave="3">
  <title>Build Pinned Agreements Module</title>
  <requirement>PIN-001, PIN-002</requirement>
  <description>
    Build the Pinned module: an agreements and memory system. Uses native WordPress admin UI with capability checks. No custom CSS framework.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Pinned requirements (agreements/memory, native WP UI per OQ-2)" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php" reason="Reference pattern for capability checks and admin hooks" />
  </context>

  <steps>
    <step order="1">Register custom post type `wis_agreement` with labels, supports (title, editor), and menu icon</step>
    <step order="2">Create `pinned/includes/class-agreements-list-table.php` extending `WP_List_Table`</step>
    <step order="3">Add admin menu page under wp-admin using `add_menu_page` with native WordPress styling</step>
    <step order="4">Implement agreement creation/edit using native WordPress post edit screen</step>
    <step order="5">Add meta box for agreement checklist (serialized array of todo items)</step>
    <step order="6">Add bookmark/memory functionality: users can "pin" important agreements to a quick-access sidebar</step>
    <step order="7">Add category taxonomy for agreement organization</step>
    <step order="8">Add capability checks: `manage_options` for settings, custom `edit_wis_agreements` for content</step>
    <step order="9">Ensure all admin output uses WordPress native CSS classes (no custom design system per OQ-2)</step>
    <step order="10">Verify tier gating: any team-sync features check `wis_is_pro()`</step>
  </steps>

  <verification>
    <check type="manual">Confirm Pinned menu appears in wp-admin and uses native WP styling</check>
    <check type="manual">Create, edit, and delete an agreement through admin UI</check>
    <check type="manual">Confirm checklist meta box saves and displays items</check>
    <check type="test">phpunit: custom post type registers correctly on init</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Pinned plugin file and directory structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Tier gating needed if any sync features are pro-only" />
    <depends-on task-id="phase-1-task-5" reason="Seed agreement must exist for testing" />
  </dependencies>

  <commit-message>feat(pinned): add agreements and memory module

Build Pinned module:
- Custom post type wis_agreement with native WP admin UI
- WP_List_Table for agreement management
- Checklist meta box for todo items
- Pin/bookmark functionality for quick access
- Category taxonomy for organization
- Capability checks and native WordPress styling

Refs: PIN-001, PIN-002</commit-message>
</task-plan>

### Wave 4 (Parallel, after Wave 3)

<task-plan id="phase-1-task-9" wave="4">
  <title>Implement Hard Usage Limits and Contextual Nudges</title>
  <requirement>LIMIT-001, LIMIT-002</requirement>
  <description>
    Implement technically enforced usage caps on the free tier. Count every LocalGenius interaction. When the limit approaches or is hit, show one warm contextual message — never a billboard. Invisible gating.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Hard limits (Decision #8), contextual nudges (Decision #6), invisible gating (Decision #11)" />
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/essence.md" reason="Feeling: invisible intelligence. The user sees the result, not the mechanism." />
  </context>

  <steps>
    <step order="1">Create `wis-core/includes/class-usage.php` with `wis_increment_usage()` and `wis_get_usage()` helpers</step>
    <step order="2">Store usage count in `wp_options` as `wis_usage_count` with `month_start` timestamp</step>
    <step order="3">Implement monthly auto-reset: if current month > stored month_start, reset count to 0</step>
    <step order="4">Define `WIS_FREE_LIMIT` constant defaulting to 50 responses/month</step>
    <step order="5">Hook `wis_increment_usage()` into LocalGenius widget interactions (every FAQ click/search counts as one response)</step>
    <step order="6">Implement `wis_maybe_show_nudge()`: if usage >= 80% of limit, show warm contextual message</step>
    <step order="7">Nudge copy: "You're moving fast. Want me to keep up?" with link to Stripe Checkout</step>
    <step order="8">Implement hard block: if usage >= limit, widget shows nudge instead of new FAQ responses</step>
    <step order="9">Verify nudge is NOT a banner, popup, or billboard — it replaces the widget content inline</step>
    <step order="10">Add filter hook so Pro users bypass limit check entirely</step>
  </steps>

  <verification>
    <check type="test">phpunit: usage counter increments on each interaction</check>
    <check type="test">phpunit: counter resets at start of new month</check>
    <check type="test">phpunit: free tier blocks after 50 responses</check>
    <check type="test">phpunit: pro tier never blocks</check>
    <check type="manual">Confirm nudge message appears inline, not as a popup or admin notice</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Tier gating system must exist to distinguish free vs. pro" />
    <depends-on task-id="phase-1-task-6" reason="LocalGenius widget must exist to hook usage counting into" />
  </dependencies>

  <commit-message>feat(limits): enforce hard usage caps with contextual nudges

Implement free-tier usage enforcement:
- class-usage.php with monthly counter and auto-reset
- 50-response default limit (configurable constant)
- Usage hooked to LocalGenius interactions
- Warm contextual nudge at 80%: "You're moving fast. Want me to keep up?"
- Hard block at 100% — inline replacement, not a popup
- Pro users bypass via wis_is_pro()

Refs: LIMIT-001, LIMIT-002</commit-message>
</task-plan>

<task-plan id="phase-1-task-10" wave="4">
  <title>Stripe Checkout Link Integration</title>
  <requirement>PAY-001, PAY-002</requirement>
  <description>
    Wire a single Stripe Checkout link for upgrades. One payment URL, not a billing portal. After payment, the user returns to the plugin settings page to enter their license key. Annual billing lives entirely in Stripe Checkout.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Stripe Checkout link only (Decision #9), annual billing hidden in checkout (Decision #7)" />
  </context>

  <steps>
    <step order="1">Add Stripe Checkout URL constant `WIS_STRIPE_CHECKOUT_URL` to `wis-core/includes/class-tier.php`</step>
    <step order="2">Add "Upgrade to Pro" button in wis-core settings page linking to Stripe Checkout</step>
    <step order="3">Configure Stripe Checkout to return to plugin settings page after successful payment</step>
    <step order="4">Verify no subscription management, webhook handling, or invoice viewing code exists in plugin</step>
    <step order="5">Verify no "annual billing" copy exists in plugin UI (per Decision #7)</step>
    <step order="6">Add instructions in settings: "After payment, enter your license key below to activate Pro."</step>
    <step order="7">Confirm Stripe Checkout URL is filterable so it can be changed without code edits</step>
    <step order="8">Test link opens Stripe Checkout in new tab with correct price ($99/year Pro tier)</step>
  </steps>

  <verification>
    <check type="manual">Click "Upgrade to Pro" button and confirm Stripe Checkout loads</check>
    <check type="manual">Confirm no billing portal or subscription management UI exists in plugin</check>
    <check type="manual">Confirm no "annual" language in plugin dashboard or readme marketing copy</check>
    <check type="test">phpunit: settings page contains upgrade link</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Settings page and tier system must exist before adding upgrade button" />
  </dependencies>

  <commit-message>feat(billing): add Stripe Checkout link for upgrades

Integrate one Stripe Checkout URL:
- "Upgrade to Pro" button in settings page
- Checkout returns to settings for license key entry
- No subscription management, webhooks, or invoices
- Annual billing hidden in Stripe only (Decision #7)
- Resolves OQ-6 with honor-system licensing

Refs: PAY-001, PAY-002</commit-message>
</task-plan>

<task-plan id="phase-1-task-11" wave="4">
  <title>Single Contextual Tooltip</title>
  <requirement>ONBOARD-001</requirement>
  <description>
    Implement exactly one warm, dismissible tooltip that appears on the first admin page load after activation. Not a wizard. Not a tour. One moment of competence.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Single contextual tooltip (MVP Feature Set #10), no wizard (Decision #2), first 30 seconds sacred (Decision #12)" />
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/essence.md" reason="Must be perfect: first 30 seconds. Alive at activation." />
  </context>

  <steps>
    <step order="1">Create `wis-core/assets/js/tooltip.js` with vanilla JS: show tooltip once, dismiss on "Got it" click, store dismissal in `localStorage`</step>
    <step order="2">Create `wis-core/assets/css/tooltip.css` with warm, subtle styling matching WordPress admin colors</step>
    <step order="3">Enqueue tooltip assets only on first admin page load using `admin_enqueue_scripts`</step>
    <step order="4">Tooltip copy: "Your Intelligence Suite is ready. LocalGenius is answering visitors, Dash has your first note, and Pinned saved a sample agreement."</step>
    <step order="5">Add "Got it" dismiss button. Once dismissed, never show again for this user</step>
    <step order="6">Store dismissal flag in user meta (`update_user_meta`) as canonical source, with `localStorage` as cache</step>
    <step order="7">Verify tooltip does NOT appear on front-end</step>
    <step order="8">Verify tooltip is the ONLY onboarding element — no modals, no hotspots, no tour steps</step>
    <step order="9">Test tooltip positioning works on mobile admin (narrow viewports)</step>
  </steps>

  <verification>
    <check type="manual">Activate plugin, load wp-admin, confirm tooltip appears once</check>
    <check type="manual">Click "Got it", reload page, confirm tooltip does not reappear</check>
    <check type="manual">Confirm no other onboarding elements exist in admin</check>
    <check type="test">phpunit: user meta dismissal flag is set on interaction</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Activation must complete and seed data before tooltip references seeded content" />
    <depends-on task-id="phase-1-task-6" reason="LocalGenius must exist for tooltip to reference it" />
    <depends-on task-id="phase-1-task-7" reason="Dash must exist for tooltip to reference it" />
    <depends-on task-id="phase-1-task-8" reason="Pinned must exist for tooltip to reference it" />
  </dependencies>

  <commit-message>feat(onboarding): add single contextual tooltip

One warm tooltip on first admin load:
- References all three seeded modules
- "Got it" dismiss button with user meta persistence
- Vanilla JS + CSS, no external dependencies
- Only one onboarding element in entire suite
- Mobile-friendly positioning

Refs: ONBOARD-001</commit-message>
</task-plan>

<task-plan id="phase-1-task-12" wave="4">
  <title>WP-CLI Compatibility</title>
  <requirement>CLI-001</requirement>
  <description>
    Register WP-CLI commands for agency and power-user workflows. Commands must work in CLI environment without loading the full WordPress admin UI.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="WP-CLI compatibility requirement (MVP Feature Set #11), file structure wp-cli/class-wis-cli.php" />
  </context>

  <steps>
    <step order="1">Create `wis-core/wp-cli/class-wis-cli.php` extending `WP_CLI_Command`</step>
    <step order="2">Implement `wp wis activate` command: activates all three modules and runs seeding logic</step>
    <step order="3">Implement `wp wis status` command: outputs current tier, usage count, and module status</step>
    <step order="4">Implement `wp wis deactivate` command: safely deactivates all modules</step>
    <step order="5">Add `if (defined('WP_CLI') && WP_CLI)` guard before registering commands</step>
    <step order="6">Ensure CLI activation mirrors web activation exactly (same seed data, same options)</step>
    <step order="7">Add `--tier=pro` flag to `activate` for agency provisioning workflows</step>
    <step order="8">Verify commands do not trigger admin-specific hooks or enqueue admin assets</step>
    <step order="9">Document commands in plugin readme under "WP-CLI Commands" section</step>
  </steps>

  <verification>
    <check type="test">Run `wp wis activate` and verify modules activate without errors</check>
    <check type="test">Run `wp wis status` and verify tier/usage output is correct</check>
    <check type="test">Run `wp wis deactivate` and verify clean deactivation</check>
    <check type="manual">Confirm commands work without admin UI loaded</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin scaffold must exist before WP-CLI commands can reference classes" />
    <depends-on task-id="phase-1-task-4" reason="Tier system must exist for status command" />
    <depends-on task-id="phase-1-task-5" reason="Activation logic must exist for activate command" />
  </dependencies>

  <commit-message>feat(cli): add WP-CLI commands for agency workflows

Register WP-CLI commands:
- wp wis activate [--tier=pro]
- wp wis status (shows tier, usage, module status)
- wp wis deactivate
- CLI-safe: no admin hooks or assets loaded
- Agency provisioning support with --tier flag

Refs: CLI-001</commit-message>
</task-plan>

### Wave 5 (Parallel, after Wave 4)

<task-plan id="phase-1-task-13" wave="5">
  <title>PHPUnit Test Coverage for Critical Paths</title>
  <requirement>TEST-001, TEST-002</requirement>
  <description>
    Write PHPUnit tests covering activation routines, tier gating logic, and usage limit enforcement. Tests must run in the CI pipeline and use WordPress test suite scaffolding.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/wp-intelligence-suite/decisions.md" reason="Test coverage requirements (phpunit.xml for tier gating and activation)" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/adminpulse.php" reason="Reference for plugin patterns being tested" />
  </context>

  <steps>
    <step order="1">Create `phpunit.xml` with WordPress test suite configuration and bootstrap file</step>
    <step order="2">Create `tests/bootstrap.php` that loads WordPress test environment and plugin files</step>
    <step order="3">Create `tests/test-activation.php`:
      - test_activation_creates_options()
      - test_activation_creates_seed_posts()
      - test_activation_zero_external_http()
      - test_activation_completes_under_5s()</step>
    <step order="4">Create `tests/test-tier.php`:
      - test_default_tier_is_free()
      - test_is_pro_returns_false_for_free()
      - test_is_pro_returns_true_after_license_save()
      - test_feature_map_blocks_pro_features_for_free()</step>
    <step order="5">Create `tests/test-usage.php`:
      - test_counter_increments()
      - test_counter_blocks_at_limit()
      - test_counter_resets_monthly()
      - test_pro_bypasses_limit()</step>
    <step order="6">Create `tests/test-localgenius.php`:
      - test_shortcode_exists()
      - test_widget_renders_faqs()</step>
    <step order="7">Create `tests/test-dash.php`:
      - test_custom_post_type_registered()</step>
    <step order="8">Create `tests/test-pinned.php`:
      - test_custom_post_type_registered()</step>
    <step order="9">Run full test suite locally and fix any failures</step>
    <step order="10">Verify CI pipeline runs tests automatically on PRs</step>
  </steps>

  <verification>
    <check type="test">Run `phpunit` and confirm all tests pass</check>
    <check type="test">Confirm CI workflow includes test execution step</check>
    <check type="manual">Review test coverage: activation, tier, usage, modules</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin scaffold must exist before tests can load classes" />
    <depends-on task-id="phase-1-task-3" reason="CI pipeline must exist before tests can run in CI" />
    <depends-on task-id="phase-1-task-4" reason="Tier system must be implemented before tier tests can pass" />
    <depends-on task-id="phase-1-task-5" reason="Activation must be implemented before activation tests can pass" />
    <depends-on task-id="phase-1-task-6" reason="LocalGenius must be implemented before widget tests can pass" />
    <depends-on task-id="phase-1-task-7" reason="Dash must be implemented before CPT tests can pass" />
    <depends-on task-id="phase-1-task-8" reason="Pinned must be implemented before CPT tests can pass" />
    <depends-on task-id="phase-1-task-9" reason="Usage limits must be implemented before usage tests can pass" />
  </dependencies>

  <commit-message>test: add PHPUnit coverage for activation, tier, and usage

Add comprehensive test suite:
- test-activation.php: options, seed posts, zero HTTP, performance
- test-tier.php: default free, pro toggle, feature map
- test-usage.php: counter, blocks, monthly reset, pro bypass
- test-localgenius.php: shortcode, FAQ rendering
- test-dash.php and test-pinned.php: CPT registration
- phpunit.xml configured for WordPress test suite

Refs: TEST-001, TEST-002</commit-message>
</task-plan>

---

## Risk Notes

### Critical Risks from Risk Scanner

**R-1: Shared Hosting Fragility**
- **Severity**: High | **Likelihood**: High
- **Mitigation in plan**: Zero external API calls at activation (Task 5). PHP 5.6-8.3 compatibility enforced in Task 1. Memory profiling in Task 5.
- **Affected Tasks**: Task 1, Task 5

**R-2: AI Inference Cost Explosion**
- **Severity**: Critical | **Likelihood**: Medium
- **Mitigation in plan**: Hard limits enforced in code (Task 9). No LLM in v1 (static templates in Task 6). Count every interaction.
- **Affected Tasks**: Task 6, Task 9

**R-6: Architecture Deadlock (OQ-1)**
- **Severity**: Critical | **Likelihood**: Resolved
- **Mitigation in plan**: Defaulted to Elon's three-plugin architecture in Task 1. Documented rationale in plan. Steve's unified vision deferred to v2.
- **Affected Tasks**: Task 1

**R-7: Custom UI Breaking on WP Updates**
- **Severity**: Medium | **Likelihood**: Avoided
- **Mitigation in plan**: OQ-2 resolved to native WordPress UI. No custom CSS framework. Uses `WP_List_Table`, native meta boxes, and WordPress admin color scheme.
- **Affected Tasks**: Task 6, Task 7, Task 8

**R-8: Conversion Failure**
- **Severity**: Critical | **Likelihood**: Medium
- **Mitigation in plan**: Contextual nudges (Task 9) instead of billboards. Warm copy. Stripe Checkout link (Task 10) minimizes friction.
- **Affected Tasks**: Task 9, Task 10

**R-9: Stripe Checkout Friction**
- **Severity**: Medium | **Likelihood**: Accepted
- **Mitigation in plan**: No self-service portal in v1 (Decision #9). Support handles manual billing. Upgrade path: checkout → license key → settings page.
- **Affected Tasks**: Task 10

---

## Success Criteria (Phase 1 Launch)

From decisions.md and PRD:

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

**Plan Status**: Ready for execution
**Next Step**: Begin Wave 1 implementation (scaffold, .org assets, CI)

---

*"The strength of the team is each member. The strength of each member is the team."*
# Phase 1 Plan — Beam MVP

**Generated:** 2026-04-25
**Requirements:** `/home/agent/shipyard-ai/prds/commandbar-prd.md` + `/home/agent/shipyard-ai/rounds/commandbar-prd/decisions.md`
**Total Tasks:** 3
**Waves:** 2

---

## Research Summary

### Codebase Scout
- No existing WordPress plugin code for `commandbar-prd`. The repo contains Emdash plugins (`eventdash`, `membership`, etc.) under `plugins/` and a reference WordPress plugin (`agentpipe`) under `projects/agentpipe/build/agentpipe/`.
- The `agentpipe.php` reference demonstrates `admin_enqueue_scripts`, `wp_enqueue_script`, and `register_rest_route` patterns. Beam must **not** use `register_rest_route` per locked decisions.
- No WordPress core source is present in the repo. Technical approach was verified against:
  - **WordPress Plugin Handbook** — Header Requirements (`https://developer.wordpress.org/plugins/plugin-basics/header-requirements/`)
  - **WordPress Code Reference** — `wp_localize_script()` signature and usage (`https://developer.wordpress.org/reference/functions/wp_localize_script/`)
- **docs/EMDASH-GUIDE.md** was read per CLAUDE.md § "Emdash CMS Reference" mandate. Because Beam is a vanilla WordPress plugin (not an Emdash plugin), the Emdash plugin system (§6), Block Kit, and sandboxed Worker patterns are **not** applicable. The authoritative interfaces for this project are the WordPress Hooks API and the decisions in `decisions.md`.

### Requirements Analyst
- Extracted 11 atomic requirements (R1–R11) from PRD §4 and locked decisions. All MVP features are covered. Decisions override the PRD's REST-API-first architecture in favor of a client-side index with zero HTTP round-trips.
- Open questions (Top 20 URLs, filter hook signature, capability filtering, keyboard collisions, CPT inclusion, JS fallback) are resolved in `REQUIREMENTS.md`.

### Risk Scanner
- **Index Staleness** (High severity / High likelihood): User publishes content; index is stale until next admin page load. Accepted as a v1 limitation per Decisions § "Open Questions". Mitigation: document in `readme.txt` FAQ.
- **Index Bloat on Large Sites** (High / Medium): Sites with 10k+ posts could produce a large `wp_localize_script` payload. Mitigation: cap each dataset at 200 items (posts, pages, users). Total payload stays well under 500KB.
- **Capability Mismatch** (Medium / High): Hardcoded URLs must respect dynamic capability checks. Mitigation: wrap each admin URL in `current_user_can()` before adding to the localized index.
- **Keyboard Shortcut Collision** (Medium / High): `Cmd/Ctrl+K` conflicts with Gutenberg, Yoast, etc. Mitigation: guard against editable fields (`input`, `textarea`, `[contenteditable]`) and call `event.preventDefault()`.
- **Accessibility Gap** (Medium / Medium): Focus trapping and ARIA are non-trivial but required for WordPress.org repo approval. Task 2 allocates real implementation time; no 20-minute fantasy estimate.
- **Maintenance Debt** (Medium / Medium): Inline CSS and single-file architecture optimize for ship speed, not longevity. Budget for a v2 refactor if traction warrants it.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R1 (Global Hotkey) | phase-1-task-2 | Wave 1 |
| R2 (Post/Page Search) | phase-1-task-1 | Wave 1 |
| R3 (User Search) | phase-1-task-1 | Wave 1 |
| R4 (Admin Page Search) | phase-1-task-1 | Wave 1 |
| R5 (Quick Actions) | phase-1-task-1, phase-1-task-2 | Wave 1 |
| R6 (Visual Polish) | phase-1-task-2 | Wave 1 |
| R7 (Accessibility) | phase-1-task-2 | Wave 1 |
| R8 (Extensibility Hook) | phase-1-task-1 | Wave 1 |
| R9 (Client-Side Index) | phase-1-task-1, phase-1-task-2 | Wave 1 |
| R10 (Two-File Constraint) | phase-1-task-1, phase-1-task-2 | Wave 1 |
| R11 (Zero Configuration) | phase-1-task-1, phase-1-task-2 | Wave 1 |

---

## Wave Execution Order

### Wave 1 (Parallel)

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create beam.php — Plugin Header, Index Generation, and Asset Enqueue</title>
  <requirement>R2, R3, R4, R5, R8, R9, R10, R11</requirement>
  <description>
    Build the single PHP file that bootstraps the Beam plugin. It registers the plugin header,
    hooks into `admin_enqueue_scripts` to enqueue `beam.js`, builds a searchable JSON index of
    posts, pages, users, and hardcoded admin URLs, applies capability filtering, exposes the
    `beam_items` filter hook for third-party extensibility, and delivers the index via
    `wp_localize_script`. No REST API, no settings page, no OOP classes.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/commandbar-prd.md" reason="Original PRD specifying post/page/user search and admin URL navigation." />
    <file path="/home/agent/shipyard-ai/rounds/commandbar-prd/decisions.md" reason="Locked decisions mandating client-side index, zero REST API, minimal file structure, and procedural PHP." />
    <file path="/home/agent/shipyard-ai/projects/agentpipe/build/agentpipe/agentpipe.php" reason="Reference WordPress plugin showing `admin_enqueue_scripts` and `wp_enqueue_script` patterns." />
    <file path="https://developer.wordpress.org/plugins/plugin-basics/header-requirements/" reason="WordPress Plugin Handbook: required header fields and best practices (verified: only Plugin Name is compulsory; Requires at least / Requires PHP are best-practice)." />
    <file path="https://developer.wordpress.org/reference/functions/wp_localize_script/" reason="WordPress Code Reference: `wp_localize_script` signature and usage for passing the JSON index to JS (verified: `$handle`, `$object_name`, `$l10n` params; must be called after script is enqueued)." />
  </context>

  <steps>
    <step order="1">Create `projects/commandbar-prd/build/beam/beam.php` with the standard WordPress plugin header: `Plugin Name: Beam`, `Version: 1.0.0`, `Requires at least: 6.0`, `Requires PHP: 7.4`, `License: GPLv2 or later`, `License URI: https://www.gnu.org/licenses/gpl-2.0.html`.</step>
    <step order="2">Add `if ( ! defined( 'ABSPATH' ) ) { exit; }` guard and define `BEAM_VERSION`.</step>
    <step order="3">Implement `beam_build_index()` as a procedural function. Query up to 200 published posts (`post_status=publish`, `fields=ids` for performance) and up to 200 published pages. For each ID, fetch the post object and build an item with `title`, `url` (`get_edit_post_link()`), and `type` (`content`).</step>
    <step order="4">Query up to 200 users via `get_users( array( 'fields' => array( 'ID', 'display_name', 'user_email' ) ) )`. For each user build an item with `title` (display name + email), `url` (`get_edit_user_link()`), and `type` (`users`).</step>
    <step order="5">Define the hardcoded top-20 admin URL list as an associative array: Dashboard (`index.php`), Posts (`edit.php`), Add New Post (`post-new.php`), Categories (`edit-tags.php?taxonomy=category`), Tags (`edit-tags.php?taxonomy=post_tag`), Pages (`edit.php?post_type=page`), Add New Page (`post-new.php?post_type=page`), Media Library (`upload.php`), Add New Media (`media-new.php`), Comments (`edit-comments.php`), Themes (`themes.php`), Customize (`customize.php`), Widgets (`widgets.php`), Menus (`nav-menus.php`), Plugins (`plugins.php`), Add New Plugin (`plugin-install.php`), Users (`users.php`), Add New User (`user-new.php`), Tools (`tools.php`), Settings (`options-general.php`). Filter each URL through `current_user_can()` before adding it to the index.</step>
    <step order="6">Add quick-action items (Add New Post → `post-new.php`, Add New Page → `post-new.php?post_type=page`, View Site → `home_url( '/' )` in new tab) with `type` set to `actions`.</step>
    <step order="7">Apply the extensibility filter: `$items = apply_filters( 'beam_items', $items );`. Document the expected shape (`title`, `url`, `type`) in a PHPDoc block above the filter.</step>
    <step order="8">Hook `admin_enqueue_scripts` to enqueue `beam.js` using `plugin_dir_url( __FILE__ ) . 'beam.js'`, dependencies `array()`, version `BEAM_VERSION`, in_footer `true`. Immediately after enqueueing, call `wp_localize_script( 'beam', 'beamIndex', array( 'items' => $items ) )`.</step>
    <step order="9">Ensure no REST routes, no settings pages, no activation hooks, and no separate CSS files are registered.</step>
  </steps>

  <verification>
    <check type="build">`php -l projects/commandbar-prd/build/beam/beam.php` returns no syntax errors.</check>
    <check type="manual">Open the file and confirm it is ≤250 lines, contains exactly one `wp_localize_script` call, contains `apply_filters( 'beam_items'`, and contains zero `register_rest_route` calls.</check>
    <check type="test">Grep for `throw new Response` returns 0 matches (confirms no banned Emdash patterns were accidentally copied into the PHP file).</check>
  </verification>

  <dependencies>
    <!-- Empty: Wave 1 independent task -->
  </dependencies>

  <commit-message>feat(beam): add beam.php with client-side index and extensibility hook</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Create beam.js — Modal, Inline CSS, Keyboard Handler, and Client-Side Search</title>
  <requirement>R1, R5, R6, R7, R9, R10, R11</requirement>
  <description>
    Build the single vanilla JavaScript file that renders Beam's dark, chromeless, animated modal
    overlay. It injects inline CSS, listens for the global `Cmd/Ctrl+K` hotkey (with collision
    avoidance), traps focus, handles `Escape` to close, performs real-time `Array.filter()` against
    the `beamIndex.items` dataset, renders grouped results with category headers, and navigates on
    `Enter` selection. No build step, no external dependencies, no localStorage.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/commandbar-prd.md" reason="PRD §6 UI/UX Spec detailing modal dimensions (`max-width: 640px`), colors (`background: #1e1e1e`), input styling, result list, and keyboard interactions." />
    <file path="/home/agent/shipyard-ai/rounds/commandbar-prd/decisions.md" reason="Decisions §11 (animated chromeless modal), §7 (inline CSS, no separate file), §5 (dark-only), §4 (no localStorage)." />
    <file path="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent" reason="Reference for `metaKey`, `ctrlKey`, `key` properties and `preventDefault()` behavior." />
  </context>

  <steps>
    <step order="1">Create `projects/commandbar-prd/build/beam/beam.js` as an IIFE.</step>
    <step order="2">Inject inline CSS into a `&lt;style&gt;` tag appended to `document.head`. Styles must include:
      - Full-viewport overlay (`position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999999; opacity: 0; transition: opacity 200ms ease;`)
      - Centered modal container (`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 640px; width: 100%; background: #1e1e1e; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);`)
      - Input field (`width: 100%; background: transparent; color: #fff; border: none; font-size: 16px; padding: 16px 20px;`)
      - Results list (`max-height: 400px; overflow-y: auto;`)
      - Category headers (`text-transform: uppercase; color: #888; font-size: 11px; padding: 8px 20px;`)
      - Result rows (`padding: 10px 20px; color: #fff; display: flex; justify-content: space-between; cursor: pointer;`)
      - Selected row (`background: #375a7f;`)
      - Empty state (`text-align: center; color: #888; padding: 20px;`)
    </step>
    <step order="3">Create modal DOM structure on first invocation: overlay `div`, inner modal container, input, results list. Append to `document.body`.</step>
    <step order="4">Implement `openModal()`: inject DOM if absent, add `opacity: 1` class to trigger 200ms fade-in, set focus to input, attach document-level `keydown` listener for `Escape`, `ArrowUp`, `ArrowDown`, `Enter`, and `Tab`.</step>
    <step order="5">Implement `closeModal()`: set `opacity: 0`, wait 200ms, remove modal from DOM, detach `keydown` listener, restore focus to previously focused element.</step>
    <step order="6">Add global `keydown` listener for `Cmd/Ctrl+K`. Guard against `event.target` being `\u003cinput\u003e`, `\u003ctextarea\u003e`, or `[contenteditable]`. Call `event.preventDefault()` and `openModal()`.</step>
    <step order="7">Implement focus trap: track focusable elements inside modal (input + visible result rows). On `Tab`, move focus to the next focusable element; if at the end, wrap to the first. On `Shift+Tab`, reverse. Prevent default tab behavior outside modal.</step>
    <step order="8">Implement `renderResults(query)` using `Array.filter()` on `beamIndex.items`. Filter items where `title.toLowerCase().includes(query.toLowerCase())`. Group by `type` (`content`, `users`, `actions`, `admin`). Limit each group to 5 results. Render category headers and rows into the results list. Maintain a `selectedIndex` variable.</step>
    <step order="9">Implement keyboard navigation inside modal: `ArrowUp` decrements `selectedIndex`; `ArrowDown` increments it; `Enter` navigates to `window.location = selectedItem.url` (or `window.open(url, '_blank')` for actions with `newTab: true`); `Escape` calls `closeModal()`.</step>
    <step order="10">Add ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-label="Beam command palette"` on modal container; `aria-live="polite"` on results list container.</step>
    <step order="11">Ensure zero `localStorage` usage, zero `fetch`/`XMLHttpRequest` calls, and zero external script dependencies.</step>
  </steps>

  <verification>
    <check type="build">Run `node --check projects/commandbar-prd/build/beam/beam.js` (or equivalent lint) to verify no syntax errors.</check>
    <check type="manual">Open `beam.js` and confirm it is ≤350 lines, contains one inline `&lt;style&gt;` injection block, zero `localStorage` references, zero `fetch`/`XMLHttpRequest` references, and zero `wp.apiFetch` references.</check>
    <check type="test">In a browser console, simulate `beamIndex = { items: [...] };` and load the script. Press `Ctrl+K` (or `Cmd+K`), type a query, and confirm filtered results appear. Press `Escape` and confirm modal is removed from DOM.</check>
  </verification>

  <dependencies>
    <!-- Empty: Wave 1 independent task. The JS contract (beamIndex object shape) is defined in this plan so both tasks can proceed in parallel. -->
  </dependencies>

  <commit-message>feat(beam): add beam.js with dark modal, inline CSS, and client-side search</commit-message>
</task-plan>
```

### Wave 2 (After Wave 1)

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>readme.txt, Packaging, and Final QA Verification</title>
  <requirement>R10, Distribution</requirement>
  <description>
    Write the WordPress.org `readme.txt` with plugin metadata, description, installation
    instructions, and changelog. Package the two-file plugin into a ZIP. Run a final QA checklist
    to confirm all locked decisions are respected (no REST API, no settings, no localStorage,
    no build step, exactly two files).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/commandbar-prd.md" reason="PRD §8 Distribution & Go-to-Market and §7 One-Session Build Checklist." />
    <file path="/home/agent/shipyard-ai/rounds/commandbar-prd/decisions.md" reason="Decisions §7 (minimal files) and §12 (distribution via extensibility hook)." />
  </context>

  <steps>
    <step order="1">Create `projects/commandbar-prd/build/beam/readme.txt` with WordPress.org plugin header: `Plugin Name: Beam`, `Contributors: shipyardai`, `Tags: command-palette, keyboard, navigation, admin`, `Requires at least: 6.0`, `Tested up to: 6.7`, `Stable tag: 1.0.0`, `License: GPLv2 or later`.</step>
    <step order="2">Write a short description (≤139 characters), a longer description, installation steps (upload ZIP, activate, press `Cmd/Ctrl+K`), FAQ (index staleness, no settings page, dark mode only), and changelog for v1.0.0.</step>
    <step order="3">Zip the `beam/` directory containing exactly `beam.php`, `beam.js`, and `readme.txt`. Name the archive `beam-1.0.0.zip` and place it in `projects/commandbar-prd/deploy/`.</step>
    <step order="4">Run QA checklist: confirm no `register_rest_route`, no `add_options_page`, no `localStorage`, no `.css` file, no `package.json`, no `webpack.config.js`.</step>
    <step order="5">Verify the plugin header in `beam.php` matches the readme header fields (version, requires at least, tested up to, license).</step>
    <step order="6">Document known limitations (index staleness on page reload, no light mode, keyboard collision possibility) in `readme.txt` FAQ section.</step>
  </steps>

  <verification>
    <check type="build">`unzip -l projects/commandbar-prd/deploy/beam-1.0.0.zip` lists exactly `beam.php`, `beam.js`, and `readme.txt`.</check>
    <check type="manual">Review `readme.txt` for completeness and tone aligned with agency brand.</check>
    <check type="test">Activate the plugin on a fresh WordPress install (if available) and confirm `Cmd/Ctrl+K` opens the palette, search returns results, and `Escape` closes it.</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="beam.php must exist and contain the correct plugin header before readme.txt can reference it." />
    <depends-on task-id="phase-1-task-2" reason="beam.js must be finalized to confirm the ZIP contents are correct and no extra files are introduced." />
  </dependencies>

  <commit-message>docs(beam): add readme.txt and package v1.0.0 zip</commit-message>
</task-plan>
```

---

## Risk Notes

1. **Index Staleness** (High / High) — Accepted v1 limitation. Newly published content will not appear in Beam until the next admin page load. The `readme.txt` FAQ must be transparent about this.
2. **Keyboard Shortcut Collision** (Medium / High) — `Cmd/Ctrl+K` is claimed by Gutenberg link insertion and Yoast. We guard against editable fields, but a future v1.1 could add a customizable hotkey. No mitigation in v1 beyond `preventDefault()`.
3. **Large-Site Performance** (High / Medium) — If the localized payload exceeds ~500KB, cheap hosting may suffer. We cap each dataset at 200 items. If this proves insufficient, a future version can add server-side pagination or a heartbeat refresh.
4. **Accessibility** (Medium / Medium) — Focus trapping and ARIA implementation are required for WordPress.org repo approval and exclude users if missing. Task 2 allocates real implementation time; do not underestimate.
5. **Maintenance Debt** (Medium / Medium) — Inline CSS and single-file architecture optimize for ship speed, not longevity. Budget for a v2 refactor if the plugin gains traction.
6. **Design-Engineering Friction** (Medium / Medium) — Steve wants cathedral; Elon wants engine. This document is the tie-breaker: architecture wins disputes; feeling wins where architecture is silent.
