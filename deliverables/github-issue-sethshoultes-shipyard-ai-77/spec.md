# Stage — Build Spec
## Project: github-issue-sethshoultes-shipyard-ai-77

## Source Documents
- **PRD**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-77.md`
- **Decisions**: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-77/decisions.md`
- **Plan**: `/home/agent/shipyard-ai/.planning/phase-1-plan.md` (general WordPress plugin patterns)
- **Project Rules**: `/home/agent/shipyard-ai/CLAUDE.md`

---

## Goals

### From PRD
Build **Stage**, a WordPress plugin that generates a stunning, responsive demo page for any other WordPress plugin. Authors enter a plugin slug; Stage creates a shareable marketing page.

### MVP Feature Set (v1 — Locked by Debate)
1. **Custom Post Type** (`stage_showcase`) for plugin showcase pages.
2. **Settings Page** under Settings → Stage for entering plugin slugs.
3. **Frontend Template** — static HTML output, zero JS frameworks.
   - Hero section with CSS-only animated feature highlights.
   - One-click "Install on my site" deep link to `wordpress.org/plugins/{slug}`.
4. **WP.org API Fetch** with 24-hour WordPress transient caching.
5. **Social Preview / OpenGraph Tags** (`og:title`, `og:description`, `og:url`, `og:image`) for shareable URLs.
6. **Zero Configuration** — no onboarding wizard, no template picker, no brand color settings.
7. **CSS-Only Styling** — gallery-grade design, no beige, no WordPress admin blue (#0073aa), no "powered by" badges.

### CUT from v1 (Deferred to v2)
- **Interactive demo sandbox** — containerized, multi-tenant WP instances require orchestration and security audits; a separate infrastructure product.
- **Testimonials / WP.org reviews** — no stable API endpoint exists; scraping is fragile scope creep.

### Resolved Open Questions
| Question | Resolution |
|----------|------------|
| OQ-1: WP.org reviews endpoint stability | Cut from v1. Re-evaluate when a stable API exists. |
| OQ-2: "Gasp-worthy" without JS | Spotlight gradients, typographic precision, whitespace discipline, and subtle CSS `transition` hover states. |
| OQ-3: Share URL format | `/stage/{post_name}/` — clean, memorable, matches the product name. |

---

## Implementation Approach

### General Patterns (from Phase 1 Plan)
- **Plugin Headers**: Standard WordPress header with `Requires PHP`, `License: GPL-2.0-or-later`.
- **Security Guard**: `if (!defined('ABSPATH')) exit;` in every PHP file.
- **Constants Pattern**: `define('STAGE_VERSION', '1.0.0')`, `plugin_dir_path(__FILE__)`, `plugin_dir_url(__FILE__)`, `STAGE_DIR`, `STAGE_URL`.
- **Activation/Deactivation Hooks**: `register_activation_hook` / `register_deactivation_hook` with `flush_rewrite_rules()`.
- **Capability Checks**: `current_user_can('manage_options')` on all admin pages.
- **Sanitization**: `sanitize_text_field` on all user inputs.
- **PHP Compatibility**: PHP 5.6+ syntax throughout — no typed properties, no null coalescing (`??`), no `match` expressions, no trailing commas in function calls.

### Stage-Specific Architecture
- **Single Plugin**, procedural PHP to stay within the ~500-line budget.
- **Template Override**: `template_include` filter loads `stage/templates/showcase.php` for the `stage_showcase` CPT. This guarantees the page works in any theme with zero configuration.
- **API Client**: Queries `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]={slug}`.
- **Transient Caching**: Key `stage_plugin_{$slug}`, expiry `DAY_IN_SECONDS` (24 hours).
- **Dark/Light Mode**: Pure CSS via `@media (prefers-color-scheme: dark)` and CSS custom properties (`--stage-*`).
- **Hero Animation**: Subtle `background-position` gradient shift and `opacity` transitions on hover — no `@keyframes`, no JS animation libraries.
- **Install Deep Link**: Anchors to `https://wordpress.org/plugins/{slug}/` with target `_blank`.

---

## Verification Criteria

### Functional
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| F1 | CPT `stage_showcase` registers on `init` | Grep codebase for `register_post_type( 'stage_showcase'` |
| F2 | Rewrite slug `/stage/{post_name}/` works | CPT `rewrite` array contains `'slug' => 'stage'` |
| F3 | Settings page renders under **Settings → Stage** | Grep for `add_options_page` with menu title `Stage` |
| F4 | Plugin slug input saves and sanitizes | Grep settings handler for `sanitize_text_field` |
| F5 | API data fetches from WP.org and caches | Grep `api.php` for `api.wordpress.org` and `set_transient` |
| F6 | Transient expires after 24 hours | Grep `api.php` for `DAY_IN_SECONDS` |
| F7 | Showcase template renders hero + install link | Grep `showcase.php` for `.stage-hero` and `wordpress.org/plugins` |
| F8 | OpenGraph meta tags present in `<head>` | Grep `template.php` or `showcase.php` for `og:title`, `og:description`, `og:url` |
| F9 | Zero onboarding wizard or template picker | Grep codebase for `wizard`, `onboarding`, `template_picker` → 0 matches |
| F10 | No external HTTP calls during activation | Grep activation hook context for `wp_remote_`, `curl`, `file_get_contents` → 0 matches |
| F11 | ABSPATH guard in every PHP file | Loop all `*.php` and assert `defined('ABSPATH')` is present |
| F12 | No REST API routes registered | Grep codebase for `register_rest_route` → 0 matches |

### Design & Performance
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| D1 | Total PHP ≤ 500 lines | `find stage -name '*.php' -exec cat {} + \| wc -l` |
| D2 | CSS file ≤ 200 lines | `wc -l < stage/assets/css/stage.css` |
| D3 | No JS animation libraries | Grep codebase for `gsap`, `anime`, `lottie`, `velocity`, `aos`, `scrollreveal` → 0 matches |
| D4 | CSS transitions present | Grep `stage.css` for `transition:` → ≥ 3 matches |
| D5 | Dark/light mode via `prefers-color-scheme` | Grep `stage.css` for `@media (prefers-color-scheme: dark)` → 1 match |
| D6 | No admin blue (#0073aa) | Grep `stage.css` for `#0073aa` → 0 matches |
| D7 | No beige color | Grep `stage.css` for `beige` (case-insensitive) → 0 matches |
| D8 | No "powered by" badges | Grep codebase for `powered by` (case-insensitive) → 0 matches |
| D9 | PHP 5.6+ compatible syntax | No typed properties, no `??`, no `match`, no trailing commas in calls |
| D10 | Plugin header matches readme metadata | Version, `Requires at least`, `Tested up to` align between `stage.php` and `readme.txt` |
| D11 | No separate JS files enqueued | `find stage -name '*.js'` → 0 matches |
| D12 | No custom CSS framework | No `bootstrap`, `tailwind`, `bulma` references in CSS or PHP |

### Distribution
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| Dist1 | `readme.txt` exists with standard headers | File present, contains `== Description ==` |
| Dist2 | `readme.txt` has Installation and Changelog sections | Grep for `== Installation ==` and `== Changelog ==` |
| Dist3 | No aggressive upsell language in readme | Grep for `annual billing`, `upgrade now`, `buy pro` → 0 matches |
| Dist4 | `GPL-2.0-or-later` license declared | Grep `stage.php` and `readme.txt` for `GPL` |

---

## File Inventory

### Created Files
| File | Type | Est. Lines | Purpose |
|------|------|------------|---------|
| `stage/stage.php` | PHP | ~80 | Main plugin: header, constants, activation/deactivation, bootstrap |
| `stage/includes/post-type.php` | PHP | ~40 | CPT `stage_showcase` registration with rewrite |
| `stage/includes/settings.php` | PHP | ~60 | Settings API page for plugin slug input |
| `stage/includes/api.php` | PHP | ~50 | WP.org API client with 24-hour transient caching |
| `stage/includes/template.php` | PHP | ~60 | `template_include` filter + OpenGraph `wp_head` injection |
| `stage/templates/showcase.php` | PHP/HTML | ~100 | Frontend showcase template: hero, metadata, install link |
| `stage/assets/css/stage.css` | CSS | ~200 | Gallery-grade stylesheet, CSS transitions, dark/light mode |
| `stage/readme.txt` | TXT | ~60 | WordPress.org distribution metadata |

### Modified Files
None — this is a greenfield plugin build.

### Total Footprint
- **~390 lines PHP** across 6 files
- **~200 lines CSS** across 1 file
- **~60 lines TXT** across 1 file
