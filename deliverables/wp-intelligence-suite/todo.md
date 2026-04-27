# WP Intelligence Suite — Running To-Do List

> **Rule:** Each task must complete in <5 minutes. If a task feels bigger, split it before starting.
> **Rule:** Mark complete immediately after verification passes. Do not batch completions.

---

## Wave 1 — Foundation (No Dependencies)

### Task 1: Scaffold Three-Plugin Architecture

- [ ] Create `wis-core/` directory — verify: `ls wis-core/`
- [ ] Create `localgenius/` directory — verify: `ls localgenius/`
- [ ] Create `dash/` directory — verify: `ls dash/`
- [ ] Create `pinned/` directory — verify: `ls pinned/`
- [ ] Create `org-assets/` directory — verify: `ls org-assets/`
- [ ] Write `wis-core/wis-core.php` with plugin header, ABSPATH guard, constants `WIS_VERSION`/`WIS_DIR`/`WIS_URL` — verify: `php -l wis-core/wis-core.php` and `grep "ABSPATH" wis-core/wis-core.php`
- [ ] Write `wis-core/includes/class-loader.php` with child plugin registration and existence checks — verify: `php -l wis-core/includes/class-loader.php` and `grep "include_once" wis-core/includes/class-loader.php`
- [ ] Write `localgenius/localgenius.php` with plugin header, ABSPATH guard, `wis-core` dependency check, `plugins_loaded` bootstrap — verify: `php -l localgenius/localgenius.php` and `grep "wis-core" localgenius/localgenius.php`
- [ ] Write `dash/dash.php` with plugin header, ABSPATH guard, `wis-core` dependency check, `plugins_loaded` bootstrap — verify: `php -l dash/dash.php` and `grep "wis-core" dash/dash.php`
- [ ] Write `pinned/pinned.php` with plugin header, ABSPATH guard, `wis-core` dependency check, `plugins_loaded` bootstrap — verify: `php -l pinned/pinned.php` and `grep "wis-core" pinned/pinned.php`
- [ ] Create stub directories: `wis-core/includes/`, `localgenius/includes/`, `localgenius/public/css/`, `localgenius/public/js/`, `localgenius/templates/`, `dash/includes/`, `dash/admin/`, `pinned/includes/`, `pinned/admin/` — verify: `find wis-core localgenius dash pinned -type d | sort`
- [ ] Add `GPL-2.0-or-later` license header to all four main plugin files — verify: `grep "GPL-2.0-or-later" wis-core/wis-core.php localgenius/localgenius.php dash/dash.php pinned/pinned.php`
- [ ] Add `register_activation_hook` and `register_deactivation_hook` stubs to all four main plugin files — verify: `grep "register_activation_hook" wis-core/wis-core.php localgenius/localgenius.php dash/dash.php pinned/pinned.php`
- [ ] Verify no PHP 7+ syntax exists in any scaffolded file (no typed props, no `??`, no `match`) — verify: `grep -R "public \$\|private \$\|protected \$\|??\|match (" wis-core/ localgenius/ dash/ pinned/ || echo "Clean"`
- [ ] Verify no external API calls exist in activation stubs — verify: `grep -R "wp_remote_get\|wp_remote_post\|curl_init\|file_get_contents" wis-core/wis-core.php localgenius/localgenius.php dash/dash.php pinned/pinned.php || echo "Clean"`

### Task 2: Create WordPress.org Distribution Package

- [ ] Write `org-assets/readme.txt` with standard .org headers — verify: `grep "Plugin Name:" org-assets/readme.txt` and `grep "License:" org-assets/readme.txt`
- [ ] Write readme short description ≤ 150 characters — verify: `wc -c org-assets/readme.txt` (check Short Description section length)
- [ ] Write readme long description emphasizing free-tier value — verify: `grep -i "free\|visitor\|team\|agreement" org-assets/readme.txt`
- [ ] Add Installation section with two-line install instructions — verify: `grep -A2 "== Installation ==" org-assets/readme.txt`
- [ ] Add FAQ section with 3–5 real questions — verify: `grep -c "=" org-assets/readme.txt` and manual review
- [ ] Add Changelog section with v1.0.0 entry — verify: `grep "= 1.0.0 =" org-assets/readme.txt`
- [x] Add Screenshots section with descriptions in readme.txt — verify: `grep "== Screenshots ==" org-assets/readme.txt`
- [x] Create `org-assets/banner-772x250.png` (772×250 PNG) — verify: `file org-assets/banner-772x250.png | grep "772x250"` (or `test -f org-assets/banner-772x250.png`)
- [x] Create `org-assets/screenshot-1.png` (1200×800 admin UI PNG) — verify: `test -f org-assets/screenshot-1.png`
- [ ] Audit readme for aggressive upsell language — verify: `grep -i "upgrade now\|buy pro\|limited trial\|pay now" org-assets/readme.txt || echo "Clean"`

### Task 3: Set Up CI/CD Pipeline

- [ ] Create `.github/workflows/ci.yml` with workflow name — verify: `grep "name:" .github/workflows/ci.yml`
- [ ] Add triggers for `push` to `main` and `pull_request` — verify: `grep -A2 "on:" .github/workflows/ci.yml | grep -E "push|pull_request"`
- [ ] Add `php-lint` job with PHP matrix 5.6, 7.4, 8.0, 8.3 — verify: `grep -A5 "php-lint" .github/workflows/ci.yml | grep -E "5\.6|7\.4|8\.0|8\.3"`
- [ ] Add checkout step using `actions/checkout@v4` — verify: `grep "actions/checkout@v4" .github/workflows/ci.yml`
- [ ] Add `php -l` recursive lint step — verify: `grep "php -l" .github/workflows/ci.yml`
- [ ] Add `wpcs` job installing WordPress Coding Standards via Composer — verify: `grep -A3 "wpcs" .github/workflows/ci.yml | grep "composer"`
- [ ] Add `phpcs` step against plugin directories — verify: `grep "phpcs" .github/workflows/ci.yml`
- [ ] Add `phpunit` job scaffold — verify: `grep -A3 "phpunit" .github/workflows/ci.yml`
- [ ] Validate YAML syntax — verify: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`

---

## Wave 2 — Core Infrastructure (Depends on Wave 1)

### Task 4: Build Core Tier and Licensing System

- [ ] Create `wis-core/includes/class-tier.php` with `WIS_TIER_FREE` and `WIS_TIER_PRO` constants — verify: `grep "WIS_TIER_FREE\|WIS_TIER_PRO" wis-core/includes/class-tier.php`
- [ ] Implement `wis_get_tier()` reading `get_option('wis_tier', 'free')` — verify: `grep "function wis_get_tier" wis-core/includes/class-tier.php`
- [ ] Implement `wis_is_pro()` boolean helper — verify: `grep "function wis_is_pro" wis-core/includes/class-tier.php`
- [ ] Implement `wis_is_feature_available($feature_key)` with feature map array — verify: `grep "function wis_is_feature_available" wis-core/includes/class-tier.php`
- [ ] Create `wis-core/includes/class-settings.php` with Settings API page under Settings menu — verify: `grep "add_options_page\|add_menu_page" wis-core/includes/class-settings.php`
- [ ] Add license key input field using `sanitize_text_field` — verify: `grep "sanitize_text_field" wis-core/includes/class-settings.php`
- [ ] Implement license save handler that updates `wis_tier` to `'pro'` on non-empty key — verify: `grep "update_option.*wis_tier.*pro" wis-core/includes/class-settings.php`
- [ ] Add usage counter option constant `wis_usage_count` with `month_start` timestamp — verify: `grep "wis_usage_count\|month_start" wis-core/includes/class-tier.php || grep "wis_usage_count" wis-core/includes/class-settings.php`
- [ ] Add `manage_options` capability check on settings page — verify: `grep "manage_options" wis-core/includes/class-settings.php`
- [ ] Verify no visible tier toggles exist in UI — verify: `grep -R "tier_toggle\|Tier Toggle\|Upgrade Banner\|pro_banner" wis-core/ || echo "Clean"`

### Task 5: Build Zero-Error Activation with Pre-Seeded Defaults

- [ ] Implement `wis_core_activate()` creating `wis_tier`, `wis_usage_count`, `wis_version`, activation timestamp — verify: `grep "wis_core_activate" wis-core/wis-core.php`
- [ ] Implement `localgenius_activate()` creating 5 FAQ template posts from static PHP array — verify: `grep "localgenius_activate" localgenius/localgenius.php` and `grep -c "Restaurant\|Dental\|Retail\|Services\|General" localgenius/localgenius.php`
- [ ] Implement `dash_activate()` creating one seed `wis_note` with welcome text — verify: `grep "dash_activate" dash/dash.php` and `grep "Welcome to Dash" dash/dash.php`
- [ ] Implement `pinned_activate()` creating one seed `wis_agreement` with checklist — verify: `grep "pinned_activate" pinned/pinned.php` and `grep "Sample Agreement" pinned/pinned.php`
- [ ] Verify zero external API calls in all activation functions — verify: `grep -n "wp_remote_get\|wp_remote_post\|curl_init\|file_get_contents" wis-core/wis-core.php localgenius/localgenius.php dash/dash.php pinned/pinned.php | grep "activate" || echo "Clean"`
- [ ] Add deactivation hooks cleaning transients but preserving user content — verify: `grep "delete_transient" wis-core/wis-core.php` and confirm no `wp_delete_post` in deactivation functions
- [ ] Add version option to each plugin for future upgrades — verify: `grep "wis_version\|localgenius_version\|dash_version\|pinned_version" wis-core/wis-core.php localgenius/localgenius.php dash/dash.php pinned/pinned.php`
- [ ] Verify activation does not register wizard screens — verify: `grep -R "wizard\|tour\|onboarding_screen" wis-core/ localgenius/ dash/ pinned/ || echo "Clean"`
- [ ] Verify PHP 5.6 syntax in activation functions — verify: `php -l wis-core/wis-core.php && php -l localgenius/localgenius.php && php -l dash/dash.php && php -l pinned/pinned.php`

---

## Wave 3 — Module Build (Depends on Wave 2)

### Task 6: Build LocalGenius Visitor Widget

- [ ] Create `localgenius/includes/class-widget.php` registering `[localgenius]` shortcode — verify: `grep "add_shortcode.*localgenius" localgenius/includes/class-widget.php`
- [ ] Add optional `wp_footer` injection for auto-inject mode — verify: `grep "wp_footer" localgenius/includes/class-widget.php`
- [ ] Create `localgenius/templates/widget.php` chat-like HTML template — verify: `test -f localgenius/templates/widget.php` and `grep "localgenius-widget" localgenius/templates/widget.php`
- [ ] Create `localgenius/public/css/localgenius.css` with responsive, accessible styles — verify: `test -f localgenius/public/css/localgenius.css` and `grep "@media" localgenius/public/css/localgenius.css`
- [ ] Create `localgenius/public/js/localgenius.js` with FAQ toggle and search filter — verify: `test -f localgenius/public/js/localgenius.js` and `grep "toggle\|search" localgenius/public/js/localgenius.js`
- [ ] Implement `localgenius_enqueue_assets()` using `wp_enqueue_script` with defer and `wp_enqueue_style` — verify: `grep "wp_enqueue_script.*defer\|wp_enqueue_style" localgenius/localgenius.php || grep "wp_enqueue_script" localgenius/includes/class-widget.php`
- [ ] Create `localgenius/includes/class-admin.php` with placement settings page — verify: `grep "add_options_page\|add_submenu_page" localgenius/includes/class-admin.php`
- [ ] Load FAQ content from static array filtered by tier — verify: `grep "wis_get_tier\|wis_is_pro" localgenius/includes/class-widget.php`
- [ ] Sanitize all output with `wp_kses_post` and `esc_html`/`esc_url` — verify: `grep "wp_kses_post\|esc_html\|esc_url" localgenius/templates/widget.php localgenius/includes/class-widget.php`
- [ ] Add `manage_options` capability check on admin settings — verify: `grep "manage_options" localgenius/includes/class-admin.php`

### Task 7: Build Dash Team Tracking Module

- [ ] Register custom post type `wis_note` on `init` with labels and supports — verify: `grep "register_post_type.*wis_note" dash/dash.php`
- [ ] Create `dash/includes/class-notes-list-table.php` extending `WP_List_Table` — verify: `grep "class.*WP_List_Table" dash/includes/class-notes-list-table.php`
- [ ] Add admin menu page under wp-admin with native styling — verify: `grep "add_menu_page" dash/dash.php`
- [ ] Implement note status meta box: Open, In Progress, Resolved — verify: `grep "add_meta_boxes" dash/dash.php` and `grep "Open\|In Progress\|Resolved" dash/dash.php`
- [ ] Add `@mention` support with user dropdown or regex — verify: `grep "@mention\|user_dropdown\|get_users" dash/dash.php || grep "@mention" dash/includes/class-notes-list-table.php`
- [ ] Implement basic team activity log on `save_post_wis_note` — verify: `grep "save_post_wis_note" dash/dash.php`
- [ ] Add capability checks: `manage_options` for settings, `edit_wis_notes` for content — verify: `grep "manage_options\|edit_wis_notes" dash/dash.php`
- [ ] Ensure admin output uses WordPress native CSS classes only — verify: `grep -R "bootstrap\|tailwind\|custom-ui" dash/ || echo "Clean"`
- [ ] Verify tier gating for any team sync features — verify: `grep "wis_is_pro" dash/dash.php || echo "No pro gating yet (acceptable for v1)"`

### Task 8: Build Pinned Agreements Module

- [ ] Register custom post type `wis_agreement` on `init` with labels and supports — verify: `grep "register_post_type.*wis_agreement" pinned/pinned.php`
- [ ] Create `pinned/includes/class-agreements-list-table.php` extending `WP_List_Table` — verify: `grep "class.*WP_List_Table" pinned/includes/class-agreements-list-table.php`
- [ ] Add admin menu page under wp-admin with native styling — verify: `grep "add_menu_page" pinned/pinned.php`
- [ ] Add meta box for agreement checklist with serialized array — verify: `grep "add_meta_boxes" pinned/pinned.php` and `grep "serialize\|update_post_meta" pinned/pinned.php`
- [ ] Add pin/bookmark functionality storing IDs in user meta — verify: `grep "update_user_meta\|get_user_meta" pinned/pinned.php`
- [ ] Register category taxonomy `wis_agreement_cat` — verify: `grep "register_taxonomy.*wis_agreement_cat" pinned/pinned.php`
- [ ] Add capability checks: `manage_options` for settings, `edit_wis_agreements` for content — verify: `grep "manage_options\|edit_wis_agreements" pinned/pinned.php`
- [ ] Ensure admin output uses WordPress native CSS classes only — verify: `grep -R "bootstrap\|tailwind\|custom-ui" pinned/ || echo "Clean"`
- [ ] Verify tier gating for any sync features — verify: `grep "wis_is_pro" pinned/pinned.php || echo "No pro gating yet (acceptable for v1)"`

---

## Wave 4 — Integration & Polish (Depends on Wave 3)

### Task 9: Implement Hard Usage Limits and Contextual Nudges

- [ ] Create `wis-core/includes/class-usage.php` with `wis_increment_usage()` and `wis_get_usage()` — verify: `grep "function wis_increment_usage\|function wis_get_usage" wis-core/includes/class-usage.php`
- [ ] Store usage count in `wp_options` as `wis_usage_count` with `month_start` timestamp — verify: `grep "wis_usage_count\|month_start" wis-core/includes/class-usage.php`
- [ ] Implement monthly auto-reset logic comparing stored month to current month — verify: `grep "date\|month\|reset" wis-core/includes/class-usage.php`
- [ ] Define `WIS_FREE_LIMIT` constant defaulting to `50` — verify: `grep "WIS_FREE_LIMIT" wis-core/includes/class-usage.php wis-core/wis-core.php`
- [ ] Hook usage increment into LocalGenius widget interactions — verify: `grep "wis_increment_usage" localgenius/includes/class-widget.php`
- [ ] Implement `wis_maybe_show_nudge()` for ≥80% usage — verify: `grep "wis_maybe_show_nudge" wis-core/includes/class-usage.php`
- [ ] Write warm nudge copy: "You're moving fast. Want me to keep up?" — verify: `grep "moving fast" localgenius/templates/widget.php || grep "moving fast" localgenius/includes/class-widget.php || grep "moving fast" wis-core/includes/class-usage.php`
- [ ] Implement hard block at 100% replacing widget content inline — verify: `grep "wis_get_usage\|WIS_FREE_LIMIT" localgenius/includes/class-widget.php`
- [ ] Verify nudge is inline, not a popup/banner/admin notice — verify: `grep -R "admin_notices\|wp_enqueue_script.*popup\|modal" localgenius/ wis-core/ || echo "Clean"`
- [ ] Add filter hook so Pro users bypass limit check — verify: `grep "wis_is_pro\|apply_filters" wis-core/includes/class-usage.php`

### Task 10: Stripe Checkout Link Integration

- [ ] Add `WIS_STRIPE_CHECKOUT_URL` constant to `wis-core/includes/class-tier.php` — verify: `grep "WIS_STRIPE_CHECKOUT_URL" wis-core/includes/class-tier.php`
- [ ] Add "Upgrade to Pro" button in settings page linking to Stripe Checkout — verify: `grep "Upgrade to Pro\|stripe" wis-core/includes/class-settings.php`
- [ ] Configure Checkout success return URL to plugin settings page — verify: `grep "return_url\|settings_page" wis-core/includes/class-settings.php || grep "success_url" wis-core/includes/class-tier.php`
- [ ] Verify no subscription management code exists — verify: `grep -R "subscription\|webhook\|invoice\|proration" wis-core/ localgenius/ dash/ pinned/ || echo "Clean"`
- [ ] Verify no "annual" language exists in plugin UI — verify: `grep -Ri "annual\|per year\|yearly" wis-core/includes/class-settings.php || echo "Clean"`
- [ ] Add post-payment instructions in settings — verify: `grep "After payment\|enter your license key" wis-core/includes/class-settings.php`
- [ ] Make Stripe Checkout URL filterable — verify: `grep "apply_filters.*stripe\|apply_filters.*checkout" wis-core/includes/class-tier.php`

### Task 11: Single Contextual Tooltip

- [ ] Create `wis-core/assets/js/tooltip.js` with vanilla JS show-once logic — verify: `test -f wis-core/assets/js/tooltip.js` and `grep "Got it\|dismiss\|localStorage" wis-core/assets/js/tooltip.js`
- [ ] Create `wis-core/assets/css/tooltip.css` with warm WordPress-native styles — verify: `test -f wis-core/assets/css/tooltip.css` and `grep "tooltip" wis-core/assets/css/tooltip.css`
- [ ] Enqueue tooltip assets only on admin via `admin_enqueue_scripts` — verify: `grep "admin_enqueue_scripts" wis-core/wis-core.php || grep "admin_enqueue_scripts" wis-core/includes/class-loader.php`
- [ ] Write tooltip copy referencing all three seeded modules — verify: `grep "LocalGenius\|Dash\|Pinned" wis-core/assets/js/tooltip.js || grep "LocalGenius\|Dash\|Pinned" wis-core/wis-core.php`
- [ ] Add "Got it" dismiss button that persists dismissal — verify: `grep "Got it" wis-core/assets/js/tooltip.js`
- [ ] Store dismissal in user meta (`update_user_meta`) — verify: `grep "update_user_meta\|get_user_meta" wis-core/wis-core.php || grep "update_user_meta" wis-core/includes/class-loader.php`
- [ ] Verify tooltip does not appear on front-end — verify: `grep -R "wp_enqueue_scripts.*tooltip\|enqueue.*tooltip" localgenius/ dash/ pinned/ || echo "Clean (only admin enqueued)"`
- [ ] Verify no other onboarding elements exist — verify: `grep -R "wizard\|tour\|hotspot\|onboarding" wis-core/ localgenius/ dash/ pinned/ | grep -v "//" | grep -v "class-usage" || echo "Clean"`
- [ ] Test tooltip mobile positioning in CSS — verify: `grep "@media\|max-width" wis-core/assets/css/tooltip.css`

### Task 12: WP-CLI Compatibility

- [ ] Create `wis-core/wp-cli/class-wis-cli.php` extending `WP_CLI_Command` — verify: `test -f wis-core/wp-cli/class-wis-cli.php` and `grep "WP_CLI_Command" wis-core/wp-cli/class-wis-cli.php`
- [ ] Implement `wp wis activate` command activating all modules — verify: `grep "activate" wis-core/wp-cli/class-wis-cli.php`
- [ ] Implement `wp wis status` outputting tier, usage, module status — verify: `grep "status" wis-core/wp-cli/class-wis-cli.php`
- [ ] Implement `wp wis deactivate` command — verify: `grep "deactivate" wis-core/wp-cli/class-wis-cli.php`
- [ ] Add `defined('WP_CLI') && WP_CLI` guard before registering commands — verify: `grep "WP_CLI" wis-core/wp-cli/class-wis-cli.php`
- [ ] Ensure CLI activation mirrors web activation exactly — verify: compare seed data and option names between `wis_core_activate()` and CLI activate method
- [ ] Add `--tier=pro` flag to activate command — verify: `grep "tier.*pro\|--tier" wis-core/wp-cli/class-wis-cli.php`
- [ ] Verify commands do not trigger admin hooks or enqueue assets — verify: `grep -R "admin_enqueue_scripts\|add_meta_boxes" wis-core/wp-cli/class-wis-cli.php || echo "Clean"`
- [ ] Document commands in `org-assets/readme.txt` under WP-CLI section — verify: `grep "WP-CLI" org-assets/readme.txt`

---

## Wave 5 — Verification (Depends on Wave 4)

### Task 13: PHPUnit Test Coverage for Critical Paths

- [ ] Create `phpunit.xml` with WordPress test suite config — verify: `test -f phpunit.xml` and `grep "bootstrap" phpunit.xml`
- [ ] Create `tests/bootstrap.php` loading WordPress test environment and plugin files — verify: `test -f tests/bootstrap.php` and `grep "wis-core.php\|localgenius.php\|dash.php\|pinned.php" tests/bootstrap.php`
- [ ] Create `tests/test-activation.php` with `test_activation_creates_options()` — verify: `grep "test_activation_creates_options" tests/test-activation.php`
- [ ] Add `test_activation_creates_seed_posts()` — verify: `grep "test_activation_creates_seed_posts" tests/test-activation.php`
- [ ] Add `test_activation_zero_external_http()` — verify: `grep "test_activation_zero_external_http" tests/test-activation.php`
- [ ] Add `test_activation_completes_under_5s()` — verify: `grep "test_activation_completes_under_5s" tests/test-activation.php`
- [ ] Create `tests/test-tier.php` with `test_default_tier_is_free()` — verify: `grep "test_default_tier_is_free" tests/test-tier.php`
- [ ] Add `test_is_pro_returns_false_for_free()` — verify: `grep "test_is_pro_returns_false_for_free" tests/test-tier.php`
- [ ] Add `test_is_pro_returns_true_after_license_save()` — verify: `grep "test_is_pro_returns_true_after_license_save" tests/test-tier.php`
- [ ] Add `test_feature_map_blocks_pro_features_for_free()` — verify: `grep "test_feature_map_blocks_pro_features_for_free" tests/test-tier.php`
- [ ] Create `tests/test-usage.php` with `test_counter_increments()` — verify: `grep "test_counter_increments" tests/test-usage.php`
- [ ] Add `test_counter_blocks_at_limit()` — verify: `grep "test_counter_blocks_at_limit" tests/test-usage.php`
- [ ] Add `test_counter_resets_monthly()` — verify: `grep "test_counter_resets_monthly" tests/test-usage.php`
- [ ] Add `test_pro_bypasses_limit()` — verify: `grep "test_pro_bypasses_limit" tests/test-usage.php`
- [ ] Create `tests/test-localgenius.php` with `test_shortcode_exists()` — verify: `grep "test_shortcode_exists" tests/test-localgenius.php`
- [ ] Add `test_widget_renders_faqs()` — verify: `grep "test_widget_renders_faqs" tests/test-localgenius.php`
- [ ] Create `tests/test-dash.php` with `test_custom_post_type_registered()` — verify: `grep "test_custom_post_type_registered" tests/test-dash.php`
- [ ] Create `tests/test-pinned.php` with `test_custom_post_type_registered()` — verify: `grep "test_custom_post_type_registered" tests/test-pinned.php`
- [ ] Run full test suite and fix failures — verify: `phpunit` exits 0
- [ ] Verify CI pipeline runs tests automatically on PRs — verify: `grep "phpunit" .github/workflows/ci.yml`
