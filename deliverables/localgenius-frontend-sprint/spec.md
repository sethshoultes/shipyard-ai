# Sous Frontend Sprint — Build Spec
*Derived from PRD `localgenius-frontend-sprint.md`, locked decisions in `rounds/localgenius-frontend-sprint/decisions.md`, and structural patterns from `.planning/phase-1-plan.md`.*

---

## 1. Goals

| Goal | Source | Target Date |
|------|--------|-------------|
| Ship a complete, usable Sous (formerly LocalGenius) frontend | PRD §2 | Day 14 |
| Widget is a single vanilla-JS IIFE, zero dependencies, <20 KB gzipped | Decisions #2 | Day 7 |
| FAQ cache serves from Cloudflare KV with p95 <200 ms | Decisions #3 | Day 7 |
| Onboarding completes in under 15 seconds (Detect → Confirm → Activate) | Decisions #8 | Day 10 |
| Stripe Checkout monthly billing functional with one webhook endpoint | Decisions #4 | Day 14 |
| Dashboard shows exactly one toggle, one number, one button | Decisions #10 | Day 12 |
| 10 paying customers at $29/month within 30 days of ship | PRD §2 | Day 44 |
| $1,000 MRR within 90 days | PRD §2 | Day 104 |

**Anti-goals (explicitly cut from v1 per locked decisions):**
- Weekly digest episodes, milestone badges, OG share cards
- Benchmark percentile UI, annual billing, FAQ drag-to-reorder
- Rich text editor, mobile bottom-sheet drag-to-dismiss
- Engagement system, mobile app, custom greeting field, border-radius picker

---

## 2. Implementation Approach

### 2.1 Architecture Principles (from locked decisions)
1. **One table. One cron. One agent session.** Migration must not exceed one new table (`sous_subscriptions`).
2. **Widget is sacred customer space.** No "powered by" backlinks, no external tracking, no React runtime on the critical path.
3. **WordPress is a door, not the house.** The plugin is a thin shim; all auth, caching, and billing logic lives in the Cloudflare Worker.
4. **Concierge voice. Never "AI."** All customer-facing strings reviewed for warmth and brevity.
5. **SaaS dashboard first.** `app.sous.ai` hosts the admin UI; WordPress admin contains only the thinnest possible settings surface.

### 2.2 Component Breakdown

#### A. Widget (`widget/sous-widget.js`)
- Single-file vanilla JS IIFE. No build step. No npm dependencies.
- Injected via `wp_localize_script` with: `apiEndpoint`, `siteKey`, `greeting`, `theme`.
- UI layers:
  - **Bubble**: 56 px fixed circle, bottom-right, `z-index: 999999`, CSS entrance animation.
  - **Modal**: 380 px × 520 px desktop; full-width bottom sheet on mobile (`max-height: 80vh`).
  - **Messages**: User bubbles (slate-800 bg, white text, right-aligned); assistant bubbles (white bg, left-aligned).
  - **Typing indicator**: three dots, CSS animation, disappears on response.
  - **Fallback state**: triggered at 2 s timeout, captures email if provided.
- Logic:
  - `sanitizeInput()` — strip HTML, limit to 500 chars.
  - `handleSubmit()` — `fetch()` to Worker `/ask` with 2 s `AbortController` timeout.
  - On KV hit: render cached answer immediately.
  - On KV miss: show typing indicator, route to LLM fallback.
  - On timeout/error: show fallback state with email capture.
- CSS delivery: inline `<style>` tag injected by the IIFE (Decision #2 / Open Question #1 default). One HTTP request total.

#### B. Cloudflare Worker (`worker/index.js`)
- Routes:
  - `POST /ask` — lookup KV by question hash → return answer; on miss, proxy to LLM with timeout.
  - `POST /webhook` — Stripe `checkout.session.completed` → insert/update `sous_subscriptions` tier.
  - `GET /config` — return site-specific greeting and theme vars (cached).
- KV seed: `worker/kv-seed.json` pre-populated with 3–5 FAQs per detected category.
- D1: one table (`sous_subscriptions`) only.
- Cron: daily cleanup of expired counters / stale KV entries.

#### C. WordPress Plugin (`plugin/sous.php`)
- Single PHP file (justified if a second file is required in sprint retro).
- Standard plugin header, `ABSPATH` guard, GPL-2.0-or-later.
- On activation: detect business category from `wp_title`, `meta description`, and first `<h1>` via lightweight keyword matcher; pre-load 3–5 relevant FAQ templates.
- Enqueues `sous-widget.js` with `wp_enqueue_script` + `wp_localize_script`.
- No business logic, no Stripe secrets, no REST routes.

#### D. SaaS Dashboard (`dashboard/`)
- Framework: vanilla JS or Alpine.js (no React runtime for a single-page UI).
- **DashboardHome view**: one toggle (widget on/off), one number (questions answered this week), one button (upgrade/manage billing).
- **OnboardingDetect view**: Confirm guessed business type + proposed FAQs; one-tap confirm or single-field correction; Activate button.
- `api.js`: fetch wrapper to Worker endpoints.
- `package.json` only if a build step is used for dashboard; widget must remain build-free.

#### E. Infrastructure (`infra/`)
- `wrangler.toml`: KV namespace + D1 binding + routes.
- `stripe-webhook.md`: single event spec (`checkout.session.completed`).

### 2.3 Data Model

```sql
CREATE TABLE sous_subscriptions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT CHECK(tier IN ('free', 'base', 'pro')),
  status TEXT CHECK(status IN ('active', 'canceled', 'past_due')),
  responses_used INTEGER DEFAULT 0,
  responses_limit INTEGER DEFAULT 50,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

### 2.4 Onboarding Flow
1. **Detect** — plugin reads site title, meta description, first `h1`; matches against 20 hardcoded local-business keyword patterns.
2. **Confirm** — owner sees guessed type + 3–5 proposed FAQs. "Yes, that's me" or edit.
3. **Activate** — widget goes live immediately. No additional config.

### 2.5 Voice & Copy Standards
- Banned phrases: "leverage AI," "we're excited to announce," "optimize," "Processing your request," "How can I help you today?"
- Approved tone: warm, brief, confident. Example: "Your reviews are handled. Your posts went live."
- Default greeting is contextual to detected business type.

---

## 3. Verification Criteria

### 3.1 Widget
| Criterion | Method | Pass Threshold |
|-----------|--------|----------------|
| File size | `gzip -c widget/sous-widget.js \| wc -c` | < 20,480 bytes |
| Zero dependencies | `grep -E '(import|require|from\s+["\'])' widget/sous-widget.js` | 0 matches |
| Inline styles only | `grep -c '<style>' widget/sous-widget.js` | ≥ 1 |
| No external fetch except Worker | `grep -E 'fetch\s*\(' widget/sous-widget.js` | 1 match (the `/ask` endpoint) |
| 2 s timeout exists | `grep -i 'abortcontroller\|timeout' widget/sous-widget.js` | ≥ 1 match |
| Typing indicator | `grep -i 'typing' widget/sous-widget.js` | ≥ 1 match |
| Sanitize input | `grep -i 'sanitize\|escape' widget/sous-widget.js` | ≥ 1 match |
| Cross-browser | Manual test on Chrome, Safari, Firefox latest 2 versions | No layout breakage |
| Mobile | Manual test on iOS Safari + Chrome Android | Bottom sheet renders, no overflow bugs |

### 3.2 Worker
| Criterion | Method | Pass Threshold |
|-----------|--------|----------------|
| KV read latency | `wrangler kv:key get --local` benchmark | p95 < 200 ms |
| `/ask` route exists | `grep -E 'POST.*/ask' worker/index.js` | ≥ 1 match |
| `/webhook` route exists | `grep -E 'POST.*/webhook' worker/index.js` | ≥ 1 match |
| Stripe event filter | `grep 'checkout.session.completed' worker/index.js` | ≥ 1 match |
| One table only | `grep -c 'CREATE TABLE' worker/d1-schema.sql` | = 1 |
| KV seed data | `jq '. | length' worker/kv-seed.json` | ≥ 20 entries |

### 3.3 Plugin
| Criterion | Method | Pass Threshold |
|-----------|--------|----------------|
| PHP syntax | `php -l plugin/sous.php` | 0 errors |
| ABSPATH guard | `grep "ABSPATH" plugin/sous.php` | ≥ 1 match |
| No Stripe secrets | `grep -iE 'sk_live|sk_test|stripe.*secret' plugin/sous.php` | 0 matches |
| No REST routes | `grep -i 'register_rest_route' plugin/sous.php` | 0 matches |
| One meaningful PHP file | `find plugin/ -name '*.php' | wc -l` | ≤ 2 (1 preferred) |
| `wp_localize_script` call | `grep 'wp_localize_script' plugin/sous.php` | ≥ 1 match |

### 3.4 Dashboard
| Criterion | Method | Pass Threshold |
|-----------|--------|----------------|
| One toggle | UI inspection / DOM query | Exactly 1 toggle input |
| One number | UI inspection / DOM query | Exactly 1 prominent metric display |
| One button | UI inspection / DOM query | Exactly 1 primary CTA button |
| No 47-metric panel | Manual review | No charts, tables, or analytics grids |
| Build size (if build step) | `du -sh dashboard/dist/` or equivalent | < 200 KB |

### 3.5 Integration
| Criterion | Method | Pass Threshold |
|-----------|--------|----------------|
| End-to-end onboarding | Screen recording | Completes in < 15 s |
| Free tier gates at 50 responses | PHPUnit / manual test | Blocks at 50, nudge at 40 |
| Stripe checkout creates subscription | Stripe test mode | Subscription `active` after webhook |
| Cross-theme render | TwentyTwentyFour, GeneratePress, Astra | Widget visible, no z-index or layout breakage |
| Banned pattern audit | `tests/test-banned-patterns.sh` | Exit 0 |

---

## 4. Files to Create or Modify

### Create (new files)

| # | Path | Purpose | Owner |
|---|------|---------|-------|
| 1 | `widget/sous-widget.js` | Vanilla JS IIFE: bubble, modal, chat logic, inline CSS | Widget agent |
| 2 | `dashboard/index.html` | Dashboard entry / shell | Dashboard agent |
| 3 | `dashboard/src/main.js` | Router, auth gate, state | Dashboard agent |
| 4 | `dashboard/src/views/DashboardHome.js` | Toggle + number + button UI | Dashboard agent |
| 5 | `dashboard/src/views/OnboardingDetect.js` | Detect → Confirm → Activate UI | Dashboard agent |
| 6 | `dashboard/src/api.js` | Fetch wrapper to Worker | Dashboard agent |
| 7 | `dashboard/package.json` | Build deps if dashboard uses Vite/Alpine | Dashboard agent |
| 8 | `plugin/sous.php` | Thin WP shim: enqueue, localize, detect, activate | Plugin agent |
| 9 | `worker/index.js` | Cloudflare Worker: /ask, /webhook, /config | Worker agent |
| 10 | `worker/kv-seed.json` | Pre-generated FAQ bank per category | Worker agent |
| 11 | `worker/d1-schema.sql` | One-table migration: `sous_subscriptions` | Worker agent |
| 12 | `infra/wrangler.toml` | KV namespace, D1 binding, routes | Infra agent |
| 13 | `infra/stripe-webhook.md` | Webhook integration spec for ops | Infra agent |
| 14 | `tests/test-widget-constraints.sh` | Size, dep, and pattern checks | QA / Margaret |
| 15 | `tests/test-file-structure.sh` | Verify all expected files exist | QA / Margaret |
| 16 | `tests/test-banned-patterns.sh` | grep for banned copy & code patterns | QA / Margaret |
| 17 | `tests/test-plugin-guard.sh` | PHP syntax + ABSPATH + security audit | QA / Margaret |
| 18 | `tests/test-worker-routes.sh` | Verify required route handlers exist | QA / Margaret |

### Modify (existing files)

| # | Path | Change | Reason |
|---|------|--------|--------|
| 19 | `.github/workflows/ci.yml` (if exists) | Add widget size check + banned-pattern check | CI gate per Decision #2 size ceiling |
| 20 | `README.md` (repo root) | Add Sous project link + status badge | Documentation |

### Delete (if they exist from prior failed sprints)

| # | Path | Reason |
|---|------|--------|
| 21 | Any empty `localgenius/` directories | Anti-pattern: do not ship empty directories |
| 22 | Any `class-admin.php`, `class-stripe.php`, etc. from PRD v1 | Cut per locked decisions; plugin is one file |
| 23 | Any `templates/dashboard.php`, `templates/onboarding-wizard.php` | Dashboard is SaaS-first, not WP-admin |

---

## 5. Acceptance Gates (Margaret Hamilton Checkpoint)

Before board review, the following artifacts must exist:

1. **Screenshots**: widget on TwentyTwentyFour, GeneratePress, Astra (desktop + mobile)
2. **Screen recording**: onboarding wizard end-to-end under 15 seconds
3. **Interactive demo**: dashboard toggle/number/button functional on staging `app.sous.ai`
4. **Mobile test results**: iOS Safari + Chrome Android, no layout breakage
5. **Size report**: `gzip -c widget/sous-widget.js | wc -c` printed in CI log
6. **Test pass**: all scripts in `tests/` exit 0

No board review without these artifacts.

---

## 6. Open Questions (Resolve Before Day 2)

| # | Question | Suggested Path | Decision Deadline |
|---|----------|--------------|-----------------|
| 1 | Widget CSS: inline `<style>` vs separate enqueue? | Default inline (Elon) for launch; Steve reserves split-CSS right for v1.1 | Day 1 |
| 2 | Exact Stripe price point and trial length? | Free tier 50 answers/month; Pro $9–$29/month | Day 2 |
| 3 | Dashboard frontend framework? | Vanilla JS or Alpine.js; no React runtime | Day 1 |
| 4 | KV cold-start latency mitigation? | Warm cache via synthetic requests post-deploy | Day 4 |

---

*Spec version: 1.0.0*
*Last updated: 2026-04-26*
