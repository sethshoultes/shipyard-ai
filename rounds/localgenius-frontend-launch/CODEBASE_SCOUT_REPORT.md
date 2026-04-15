# Codebase Scout Report: LocalGenius Frontend Launch

**Scout:** Claude Agent (Haiku 4.5)
**Date:** April 15, 2026
**Mission:** Map all relevant files, patterns, and dependencies for building a WordPress plugin that delivers a vanilla JS chat widget + admin dashboard + backend API integration.

**Project Context:**
- **Tech Stack:** WordPress plugin, Vanilla JavaScript (<20KB), Cloudflare Workers backend (D1, R2, OpenAI)
- **Deliverables:** Chat widget, admin dashboard, FAQ editor, 60-second onboarding wizard
- **Scope Status:** GREENFIELD — No existing code; building from first principles

---

## Executive Summary

### What We Found

**Good News:**
1. Codebase has **proven WordPress plugin patterns** in `/plugins/adminpulse` that can be adapted
2. Vanilla JS patterns exist across multiple projects without build overhead
3. CSS patterns and design tokens from Emdash examples are reusable
4. Backend integration patterns established via EventDash and Membership plugins
5. Build and deployment infrastructure fully operational

**Gaps:**
1. **No chat widget implementations** in codebase (greenfield build required)
2. **No WordPress plugin template** suitable for LocalGenius (only adminpulse exists, needs modification)
3. **No vanilla JS bundler** configured (decision needed: raw JS vs. minimal minifier)
4. **No TypeScript in plugins** (most plugins use TS; LocalGenius uses vanilla JS)

**Risks & Decisions:**
1. <20KB constraint requires aggressive code minification and asset optimization
2. Vanilla JS means no React/Vue helpers; must build widget from DOM primitives
3. WordPress plugin admin must handle settings, API keys, FAQ CRUD without framework support
4. Design consistency across bubble widget and admin dashboard not yet established

---

## Part 1: Existing Plugin Architecture

### AdminPulse Plugin (Most Relevant Reference)

**Path:** `/home/agent/shipyard-ai/plugins/adminpulse/`

**Structure:**
```
adminpulse/
├── adminpulse.php           (Main plugin file, 592 lines)
└── assets/
    └── js/
        └── adminpulse.js    (Widget JS, 102 lines, vanilla JS)
```

**Key Patterns to Reuse:**

1. **Plugin Header (wp.org standard)**
   ```php
   <?php
   /**
    * Plugin Name: AdminPulse
    * Description: A glanceable dashboard widget...
    * Version: 1.0.0
    * Requires at least: 6.2
    * Requires PHP: 8.0
    * Author: Shipyard AI
    * License: GPL-2.0-or-later
    * Text Domain: adminpulse
    */
   ```

2. **Activation/Deactivation Hooks**
   ```php
   register_activation_hook( __FILE__, 'adminpulse_activate' );
   register_deactivation_hook( __FILE__, 'adminpulse_deactivate' );
   add_action( 'plugins_loaded', 'adminpulse_boot' );
   ```

3. **Asset Enqueuing Pattern** (for front-end scripts)
   ```php
   wp_enqueue_script(
       'adminpulse-js',
       ADMINPULSE_URL . 'assets/js/adminpulse.js',
       array(),              // no dependencies
       ADMINPULSE_VERSION,
       true                  // defer to footer
   );
   wp_localize_script(
       'adminpulse-js',
       'adminpulseConfig',   // JS global object
       array(
           'ajaxUrl' => admin_url( 'admin-ajax.php' ),
           'nonce'   => wp_create_nonce( 'adminpulse_nonce' ),
       )
   );
   ```

4. **AJAX Endpoint Pattern**
   ```php
   function adminpulse_ajax_get_health() {
       check_ajax_referer( 'adminpulse_nonce', 'nonce' );
       if ( ! current_user_can( 'manage_options' ) ) {
           wp_send_json_error( 'Unauthorized', 403 );
       }
       // ... process request
       wp_send_json_success( $data );
   }
   add_action( 'wp_ajax_adminpulse_get_health', 'adminpulse_ajax_get_health' );
   ```

5. **Vanilla JS Fetch Pattern** (no jQuery!)
   ```javascript
   (function() {
       'use strict';
       const config = window.adminpulseConfig || {};

       function fetchHealth() {
           const formData = new FormData();
           formData.append('action', 'adminpulse_get_health');
           formData.append('nonce', config.nonce);

           fetch(config.ajaxUrl, {
               method: 'POST',
               body: formData,
               credentials: 'same-origin'
           })
           .then(response => response.json())
           .then(data => renderHealth(data))
           .catch(() => renderError());
       }
   })();
   ```

**File Size:** adminpulse.php is 592 lines; adminpulse.js is 102 lines. Combined with styles: <10KB unminified.

**Strengths:**
- Uses vanilla JS (no framework)
- Minimal dependencies
- Security-first (nonces, capability checks)
- Clean separation of concerns (PHP backend, JS frontend)

**Weaknesses for LocalGenius:**
- Focuses on admin dashboard, not public-facing widget
- Uses WordPress hooks (not suitable for front-end widget embedded on client sites)
- No state management (would need enhancing for FAQ CRUD)

---

### EventDash & Membership Plugin Patterns (Backend Reference)

**Paths:**
- `/home/agent/shipyard-ai/plugins/eventdash/` (3,442 lines TS)
- `/home/agent/shipyard-ai/plugins/membership/` (3,600 lines TS)

**Why They Matter:**
These plugins use Emdash CMS framework (TypeScript, Astro, Cloudflare Workers, D1 database). LocalGenius uses Cloudflare Workers backend, so API patterns are relevant.

**Key Backend Patterns:**

1. **Worker API Routes** (from EventDash)
   ```typescript
   // Pattern: Route handlers that return Response objects
   export async function handlePostRegister(req: Request) {
       if (req.method !== 'POST') {
           return new Response(JSON.stringify({ error: 'Method not allowed' }), {
               status: 405,
               headers: { 'Content-Type': 'application/json' }
           });
       }
       const body = await req.json();
       // ... process
       return new Response(JSON.stringify(success), { status: 200 });
   }
   ```

2. **D1 Database Schema** (from EventDash)
   - Events table, registrations table, waitlist table
   - Pattern applies to LocalGenius: create `faqs` table, `chat_logs` table, `businesses` table

3. **Stripe Integration** (from EventDash/Membership)
   - Webhook signature verification pattern
   - JWT token management pattern
   - Secret key handling via environment variables

**Constraints for LocalGenius:**
- EventDash/Membership use Emdash-specific plugin architecture (not WordPress-compatible)
- LocalGenius must be WordPress plugin + separate Cloudflare Worker
- Backend patterns are transferable; plugin architecture is not

---

## Part 2: Vanilla JavaScript Patterns in Codebase

### Where Vanilla JS Exists

**Search Results:**
- `/plugins/adminpulse/assets/js/adminpulse.js` — 102 lines, no framework
- No other vanilla JS widget implementations found
- Most example sites use Astro + React for admin UIs (not applicable to LocalGenius)

### Vanilla JS in Examples (Astro Sites)

**From Peak Dental, Sunrise Yoga, etc.:**
- Client-side scripts use vanilla JS for interactive components
- Located in `/src/components/` as `.astro` files with `<script>` tags
- Pattern: Astro hydrates with minimal JS, JavaScript handles DOM manipulation

**Example Pattern from Astro:**
```javascript
// Typical Astro client component with vanilla JS
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('[data-action]');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = btn.dataset.action;
            // Handle action
        });
    });
});
```

**Lessons:**
- Query selector-based DOM manipulation is standard
- Event delegation pattern for performance
- No build step required (vanilla JS runs in browser as-is)

---

## Part 3: CSS Patterns & Design Tokens

### Design Token Sources

**1. Emdash Theme System** (`/examples/*/src/styles/theme.css`)

**Path Example:** `/home/agent/shipyard-ai/examples/emdash-templates/blog-cloudflare/src/styles/theme.css`

**Pattern:**
```css
:root {
    /* Color tokens */
    --color-primary: #0073aa;
    --color-secondary: #00a0d2;
    --color-background: #ffffff;
    --color-text: #1d2327;

    /* Typography */
    --font-family-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
    --font-family-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
    --font-size-base: 16px;
    --font-size-large: 18px;
    --font-size-small: 14px;

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

**2. WordPress Admin Colors** (from `adminpulse.php`)

```css
/* Status indicators (used in badges) */
.adminpulse-critical {
    background-color: #dc3232;  /* Red */
    color: #ffffff;
}
.adminpulse-warning {
    background-color: #ffb900;  /* Yellow */
    color: #1d2327;
}
.adminpulse-good {
    background-color: #46b450;  /* Green */
    color: #ffffff;
}
```

**3. Accessibility Patterns**

```css
/* Screen reader only text */
.adminpulse-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect( 0, 0, 0, 0 );
    white-space: nowrap;
    border-width: 0;
}

/* Focus indicators for keyboard navigation */
button:focus {
    outline: 2px solid --color-primary;
    outline-offset: 2px;
}
```

**Recommendation for LocalGenius:**
- Adopt WordPress color palette (primary blue: #0073aa) for consistency
- Use CSS custom properties (variables) for single accent color customization
- Implement minimal CSS reset to prevent theme conflicts
- Keep styles scoped to prevent cascade issues on client sites

---

## Part 4: Build Tools & Dependencies

### Package.json Patterns

**1. EventDash Plugin** (`/plugins/eventdash/package.json`)

```json
{
  "name": "@shipyard/eventdash",
  "version": "1.0.0",
  "type": "module",
  "description": "Event registration...",
  "exports": {
    ".": "./src/index.ts",
    "./sandbox": "./src/sandbox-entry.ts",
    "./astro": "./src/astro/index.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "vitest": "^4.1.2"
  }
}
```

**Key Point:** EventDash uses TypeScript + Vitest. LocalGenius needs something simpler for vanilla JS.

**2. Example Site** (`/examples/peak-dental/package.json`)

```json
{
  "name": "@emdash-cms/template-marketing",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/cloudflare": "^13.1.8",
    "astro": "^6.1.2",
    "react": "^19.2.4"
  }
}
```

**Recommended Setup for LocalGenius:**

Option A: Minimal (No build step, vanilla JS directly)
```json
{
  "name": "localgenius-wordpress-plugin",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node scripts/minify.js",
    "test": "node scripts/test-widget.js"
  },
  "devDependencies": {
    "esbuild": "^0.20.0"
  }
}
```

Option B: TypeScript with minimal overhead
```json
{
  "name": "localgenius-wordpress-plugin",
  "type": "module",
  "scripts": {
    "build": "tsc && esbuild dist/widget.js --minify --outfile=plugin/assets/js/widget.min.js",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "esbuild": "^0.20.0"
  }
}
```

**Analysis:** Option A keeps <20KB constraint easier; Option B enables type safety. Recommendation: **Start with Option A, migrate to B if complexity requires.**

---

## Part 5: File Structure Recommendation

Based on decisions document and existing patterns, here's the recommended architecture:

```
localgenius/
├── localgenius.php              # Main plugin file (300-400 lines)
│
├── includes/
│   ├── class-plugin.php         # Plugin bootstrap, hooks
│   ├── admin-settings.php       # Settings page, FAQ editor
│   ├── widget-embed.php         # Front-end script injection
│   └── api-config.php           # API key management
│
├── assets/
│   ├── js/
│   │   ├── chat-bubble.js       # Bubble UI component (5KB)
│   │   ├── chat-interface.js    # Expanded chat window (4KB)
│   │   ├── onboarding-wizard.js # Admin setup flow (3KB)
│   │   ├── faq-editor.js        # Admin FAQ CRUD (2KB)
│   │   ├── api-client.js        # Backend communication (1KB)
│   │   └── utils.js             # Shared utilities (1KB)
│   │
│   └── css/
│       ├── widget.css           # Chat bubble + interface styles
│       └── admin.css            # Admin dashboard styles
│
├── templates/
│   ├── admin-settings.html      # Settings page template
│   ├── faq-editor.html          # FAQ management template
│   └── widget-preview.html      # Live preview template
│
├── backend/
│   ├── chat-endpoint.ts         # Cloudflare Worker (/chat route)
│   ├── faq-cache.ts             # D1 FAQ cache layer
│   └── schema.sql               # D1 table definitions
│
├── package.json
├── tsconfig.json (optional)
├── README.md
└── readme.txt                   # wp.org submission doc
```

**Size Breakdown (Target: <20KB gzipped):**
- chat-bubble.js: 5KB (minified)
- chat-interface.js: 4KB (minified)
- onboarding-wizard.js: 3KB (minified)
- faq-editor.js: 2KB (minified)
- api-client.js + utils.js: 2KB (minified)
- widget.css + admin.css: 2KB (minified)
- **Total: 18KB** (leaves 2KB margin)

---

## Part 6: Dependencies Already Available

### WordPress APIs (Built-in, No Install Required)

1. **AJAX** — `wp_ajax_*` hooks, `wp_send_json_success()`, `wp_send_json_error()`
2. **Settings** — `register_setting()`, `add_settings_section()`, `add_settings_field()`
3. **Nonces** — `wp_create_nonce()`, `wp_verify_nonce()`, `check_ajax_referer()`
4. **Capabilities** — `current_user_can()`, `wp_get_current_user()`
5. **Options** — `get_option()`, `update_option()`, `delete_option()`
6. **HTTP** — `wp_remote_post()`, `wp_remote_get()`
7. **Sanitization** — `sanitize_text_field()`, `wp_kses_post()`, `esc_html()`, `esc_url()`
8. **Transients** — `get_transient()`, `set_transient()`, `delete_transient()`

### Cloudflare APIs (Already Used in EventDash/Membership)

1. **D1 Database** — SQL queries via Cloudflare runtime
2. **R2 Storage** — File upload/retrieval
3. **KV Store** — Key-value cache (if needed)
4. **Crypto** — JWT signing, hashing
5. **Fetch** — HTTP requests to OpenAI, external APIs

### No External Dependencies Needed

- **No jQuery** — Use native `fetch()`, `querySelector()`, `addEventListener()`
- **No React/Vue** — Vanilla JS handles all UI
- **No CSS Framework** — Plain CSS with custom properties
- **No Build Tools (Optional)** — Can work without compilation if needed

---

## Part 7: Existing Patterns for Reuse

### 1. Admin Settings Page Pattern

**From:** `/plugins/adminpulse/adminpulse.php` (lines 114-220)

**Applicable To:** LocalGenius admin settings page for API key, business detection override, FAQ management

```php
add_action( 'admin_menu', function() {
    add_menu_page(
        'LocalGenius Settings',      // Page title
        'LocalGenius',               // Menu title
        'manage_options',            // Capability
        'localgenius-settings',      // Menu slug
        'localgenius_render_settings' // Callback
    );
});

function localgenius_render_settings() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'LocalGenius Settings', 'localgenius' ); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields( 'localgenius-settings' );
            do_settings_sections( 'localgenius-settings' );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
```

### 2. Frontend Widget Injection Pattern

**From:** `/plugins/adminpulse/adminpulse.php` (lines 452-481)

**Applicable To:** Injecting LocalGenius chat bubble into front-end site

```php
function localgenius_enqueue_assets( $hook_suffix ) {
    // Only enqueue on front-end (not admin)
    if ( is_admin() ) {
        return;
    }

    // Check if plugin is enabled and API key is set
    $api_key = get_option( 'localgenius_api_key' );
    if ( empty( $api_key ) ) {
        return;
    }

    wp_enqueue_script(
        'localgenius-widget',
        LOCALGENIUS_URL . 'assets/js/chat-bubble.js',
        array(),
        LOCALGENIUS_VERSION,
        true
    );

    wp_localize_script(
        'localgenius-widget',
        'localgeniusConfig',
        array(
            'apiUrl'   => get_rest_api_url() . 'localgenius/v1/chat',
            'apiKey'   => $api_key,
            'siteUrl'  => site_url(),
        )
    );
}
add_action( 'wp_enqueue_scripts', 'localgenius_enqueue_assets' );
```

### 3. AJAX + Fetch Pattern

**From:** `/plugins/adminpulse/assets/js/adminpulse.js` (lines 10-32, 77-93)

**Applicable To:** Admin FAQ editor CRUD operations and widget-to-API communication

```javascript
// Admin: Save FAQ to backend
function saveFAQ(faqData) {
    fetch(localgeniusConfig.ajaxUrl, {
        method: 'POST',
        body: JSON.stringify({
            action: 'localgenius_save_faq',
            nonce: localgeniusConfig.nonce,
            faq: faqData
        }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('FAQ saved!');
            reloadFAQList();
        } else {
            alert('Error: ' + data.data.message);
        }
    })
    .catch(err => alert('Network error: ' + err.message));
}

// Front-end: Send chat message to API
function sendMessage(message) {
    fetch(localgeniusConfig.apiUrl, {
        method: 'POST',
        body: JSON.stringify({
            businessId: localgeniusConfig.businessId,
            message: message
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json())
    .then(data => displayChatResponse(data.response))
    .catch(err => displayChatError(err));
}
```

### 4. Business Detection Pattern

**From:** Decisions document (section IV.1)

**Implementation:** Detect business type from WordPress metadata

```javascript
// utils.js
function autoDetectBusinessType() {
    const siteTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const categories = document.querySelectorAll('[data-category]');

    // Simple pattern matching
    const keywords = {
        'restaurant': ['restaurant', 'cafe', 'pizza', 'burger', 'bistro'],
        'dentist': ['dental', 'dentist', 'teeth', 'orthodont'],
        'yoga': ['yoga', 'studio', 'fitness', 'pilates'],
        'salon': ['salon', 'hair', 'stylist', 'barber'],
        // ... add more
    };

    const text = (siteTitle + ' ' + metaDescription).toLowerCase();

    for (const [type, matches] of Object.entries(keywords)) {
        if (matches.some(keyword => text.includes(keyword))) {
            return type;
        }
    }

    return 'general'; // Fallback
}
```

---

## Part 8: Gaps & Build Decisions

### Gap 1: Chat Widget Implementation

**Status:** Does not exist in codebase

**What Needs Building:**
1. Bubble UI (floating icon, expandable interface)
2. Chat message rendering (user messages, bot responses)
3. Animation (smooth slide-in, message transitions)
4. Mobile optimization (responsive, touch-friendly)
5. Accessibility (ARIA labels, keyboard nav)

**Size Constraint:** <5KB minified (part of 20KB total)

**Recommendation:** Build iteratively:
- Week 1: Static HTML bubble + message rendering
- Week 2: Animations and interactions
- Week 3: Mobile polish and accessibility

### Gap 2: WordPress Plugin Template

**Status:** `adminpulse.php` exists but is for admin dashboard, not plugin scaffolding

**What Needs Building:**
1. Main plugin file with proper hooks
2. Admin settings page with API key storage
3. Settings page rendering
4. Settings form with nonce protection
5. Plugin activation/deactivation logic
6. Uninstall handler to clean up options

**Recommendation:** Use `adminpulse.php` as template, adapt for LocalGenius:
- Remove dashboard widget hooks
- Add front-end widget injection hooks
- Add admin settings page for API configuration
- Add FAQ management UI

### Gap 3: Onboarding Wizard

**Status:** Described in decisions document, no implementation exists

**What Needs Building:**
1. Business type auto-detection (see Part 7.4)
2. FAQ pre-population by business type
3. Live preview pane showing widget
4. One-button activation
5. Completion message with next steps

**Size Constraint:** <3KB minified

**Recommendation:** Build as single-page flow:
```javascript
// onboarding-wizard.js
class OnboardingWizard {
    constructor(container) {
        this.container = container;
        this.step = 0;
        this.data = {};
    }

    init() {
        this.detectBusinessType();
        this.showStep(0); // "Is this your business type?"
    }

    detectBusinessType() {
        this.data.businessType = autoDetectBusinessType();
    }

    async generateFAQs() {
        // Call backend to generate FAQs for detected type
        const response = await fetch(localgeniusConfig.ajaxUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'localgenius_generate_faqs',
                businessType: this.data.businessType
            })
        });
        return response.json();
    }

    activate() {
        // Save API key, FAQs, and mark plugin as activated
        fetch(localgeniusConfig.ajaxUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'localgenius_activate',
                data: this.data
            })
        });
    }
}
```

### Gap 4: FAQ Editor

**Status:** Described in decisions document, no implementation exists

**What Needs Building:**
1. FAQ list view with add/edit/delete buttons
2. Modal form for creating/editing FAQs
3. AJAX save/delete operations
4. Drag-and-drop reordering (deferred to v2, per decisions)
5. Preview pane showing how FAQ affects chat responses

**Size Constraint:** <2KB minified (CRUD logic only, no UI framework)

**Recommendation:** Simple CRUD interface:
```javascript
// faq-editor.js
async function deleteFAQ(faqId) {
    if (!confirm('Delete this FAQ?')) return;

    const response = await fetch(localgeniusConfig.ajaxUrl, {
        method: 'POST',
        body: JSON.stringify({
            action: 'localgenius_delete_faq',
            faqId: faqId,
            nonce: localgeniusConfig.nonce
        })
    });

    if (response.ok) {
        document.getElementById('faq-' + faqId).remove();
    }
}

async function saveFAQ(faqId, question, answer) {
    const response = await fetch(localgeniusConfig.ajaxUrl, {
        method: 'POST',
        body: JSON.stringify({
            action: 'localgenius_save_faq',
            faqId: faqId,
            question: question,
            answer: answer,
            nonce: localgeniusConfig.nonce
        })
    });

    return response.json();
}
```

### Gap 5: Minification & Build Pipeline

**Status:** No build step configured for LocalGenius

**What Needs Building:**
1. Minifier script (esbuild or similar)
2. CSS minifier
3. Build verification (ensure <20KB)
4. Source maps for debugging
5. Watch mode for development

**Recommendation:** Use esbuild (simple, no config needed):

```bash
# Install
npm install --save-dev esbuild

# Build
esbuild src/chat-bubble.js --minify --outfile=plugin/assets/js/chat-bubble.min.js
esbuild src/chat-interface.js --minify --outfile=plugin/assets/js/chat-interface.min.js
# ... etc
```

---

## Part 9: Security Considerations

### WordPress Security Patterns (From AdminPulse)

1. **Nonce Verification** (already in codebase)
   ```php
   // In PHP handler
   check_ajax_referer( 'localgenius_nonce', 'nonce' );

   // In JavaScript
   formData.append('nonce', localgeniusConfig.nonce);
   ```

2. **Capability Checks** (already in codebase)
   ```php
   if ( ! current_user_can( 'manage_options' ) ) {
       wp_send_json_error( 'Unauthorized', 403 );
   }
   ```

3. **Input Sanitization** (already in codebase)
   ```php
   $api_key = sanitize_text_field( $_POST['api_key'] );
   $faq_text = wp_kses_post( $_POST['faq_answer'] );
   ```

4. **Output Escaping** (already in codebase)
   ```php
   echo esc_html( $faq['question'] );
   echo wp_kses_post( $faq['answer'] );
   ```

### Additional Security Needed

1. **API Key Storage**
   - Store in WordPress options table (encrypted)
   - Never expose in front-end JavaScript
   - Use separate endpoint for API key validation

2. **CORS/Origin Verification**
   - Widget should only load on registered WordPress site
   - Validate request origin in backend

3. **Rate Limiting**
   - Limit chat API calls per business per day (prevent abuse)
   - Implement in Cloudflare Worker

---

## Part 10: Recommended Tech Stack Summary

### Frontend (Client-Side)

| Layer | Technology | File Size | Rationale |
|-------|-----------|-----------|-----------|
| **Widget** | Vanilla JS | 5KB | No framework needed, direct DOM manipulation |
| **Chat UI** | Vanilla JS | 4KB | Simple message rendering, no state complexity |
| **Admin** | Vanilla JS + PHP forms | 5KB | WordPress forms handle CRUD, JS for preview |
| **Styles** | Plain CSS + Custom Properties | 2KB | Theme-aware via CSS variables |

### Backend (Server-Side)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **WordPress Plugin** | PHP 8.0+ | Settings, API key management, widget injection |
| **Admin Dashboard** | PHP + HTML + Vanilla JS | FAQ editor, settings, setup wizard |
| **Chat API** | Cloudflare Worker + TypeScript | `/chat` endpoint, LLM calls, response formatting |
| **FAQ Cache** | D1 SQLite | Store FAQs, enable <500ms responses |
| **File Storage** | R2 (optional) | Store chat logs, analytics data |

### Build & Deployment

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **esbuild** | JavaScript minification | Single command per file |
| **CSS Minifier** | CSS optimization | cssnano or PostCSS |
| **Git** | Version control | Standard workflow |
| **GitHub Actions** | CI/CD (optional) | Lint, test, deploy |
| **wp.org** | Distribution | Plugin directory submission |

---

## Part 11: Key Decisions to Make (Before Building)

### Decision 1: Build Step Yes/No?
- **Option A:** Vanilla JS files, no build step, serve raw
  - Pros: Simplicity, no dependencies
  - Cons: Manual minification, harder to manage multiple files
- **Option B:** Use esbuild, output minified files
  - Pros: Automated, easy to verify <20KB constraint
  - Cons: One extra npm dependency
- **Recommendation:** **Option B** (esbuild is lightweight, worth it)

### Decision 2: TypeScript or Vanilla JS?
- **Option A:** Vanilla JS throughout
  - Pros: No compilation, direct execution
  - Cons: No type safety, harder to catch errors
- **Option B:** TypeScript for backend, vanilla JS for frontend
  - Pros: Type safety where it matters (backend), simplicity on front-end
  - Cons: Requires ts-node for backend
- **Recommendation:** **Option B** (backend is complex enough to need types)

### Decision 3: FAQ Pre-Population Method?
(From decisions document, section IV.1)
- **Option A:** Hardcoded templates per business type
- **Option B:** GPT-4 generation on setup
- **Option C:** Hybrid (templates + refinement)
- **Recommendation:** **Option A** (fastest, no API cost, good enough for MVP)

### Decision 4: <20KB Measurement?
- **Option A:** Gzipped size (typical web measurement)
- **Option B:** Raw minified size
- **Recommendation:** **Option A** (more realistic for real-world performance)

### Decision 5: CSS Reset/Normalize?
- **Option A:** Use CSS reset (ensure consistency across themes)
- **Option B:** Scoped CSS only (isolate from theme)
- **Recommendation:** **Option B** + namespace all classes with `lg-` prefix
  ```css
  .lg-chat-bubble { /* styles */ }
  .lg-chat-message { /* styles */ }
  ```

---

## Part 12: File Checklist for Build Phase

### Must Create

- [x] `localgenius.php` (main plugin file)
- [x] `includes/class-plugin.php` (plugin class)
- [x] `includes/admin-settings.php` (settings page)
- [x] `includes/widget-embed.php` (front-end injection)
- [x] `assets/js/chat-bubble.js` (widget UI)
- [x] `assets/js/chat-interface.js` (message window)
- [x] `assets/js/api-client.js` (API communication)
- [x] `assets/js/onboarding-wizard.js` (setup flow)
- [x] `assets/js/faq-editor.js` (admin CRUD)
- [x] `assets/js/utils.js` (shared utilities)
- [x] `assets/css/widget.css` (widget styles)
- [x] `assets/css/admin.css` (admin styles)
- [x] `templates/admin-settings.html` (settings form)
- [x] `templates/faq-editor.html` (FAQ list + modal)
- [x] `readme.txt` (wp.org description)
- [x] `package.json` (build config)

### Can Reuse

- [x] WordPress security patterns (nonces, capability checks, sanitization)
- [x] AJAX pattern from adminpulse.js
- [x] CSS custom properties from theme.css
- [x] Vanilla JS fetch pattern from adminpulse.js
- [x] API route pattern from EventDash backend

### Backend (Cloudflare Worker) Separate Repository

- [ ] `/chat` endpoint handler
- [ ] D1 schema (faqs, chat_logs, businesses tables)
- [ ] FAQ cache layer (query, store, invalidate)
- [ ] OpenAI integration (fallback for non-cached questions)
- [ ] Response formatter (normalize LLM output)

---

## Conclusion

**Status:** Ready to build

**Critical Path:**
1. **Week 1:** WordPress plugin scaffolding + settings page + API key management
2. **Week 1:** Admin FAQ editor UI (CRUD operations)
3. **Week 1:** Onboarding wizard (business detection + FAQ pre-population)
4. **Week 1:** Chat widget bubble (UI only, no API calls yet)
5. **Week 2:** Connect widget to backend `/chat` API
6. **Week 2:** Test latency, optimize FAQ caching
7. **Week 3:** Admin dashboard, live preview pane
8. **Week 3:** Polish, accessibility, mobile responsiveness
9. **Week 4:** Beta testing, bug fixes, wp.org submission prep

**Risks Mitigated:**
- <20KB constraint: Aggressive code review + minification testing
- Vanilla JS complexity: Modular file structure, clear separation of concerns
- Theme conflicts: CSS namespacing + scoped styles
- WordPress compatibility: Use native APIs, avoid deprecated functions

**Dependencies:** All available in codebase or built-in to WordPress/Cloudflare.

**Estimated Lines of Code:**
- PHP: 400-500 lines
- JavaScript: 800-1000 lines
- CSS: 200-300 lines
- **Total:** ~1500-1800 lines (achievable in 4 weeks)

---

**Report Complete**

Generated by: Claude Agent (Haiku 4.5)
Scope: Full codebase analysis + LocalGenius plugin architecture mapping
