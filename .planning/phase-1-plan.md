# Phase 1 Plan — HARBOR (Shipyard Maintenance System)

**Generated:** 2026-04-08
**Project Slug:** shipyard-maintenance-system
**Product Name:** HARBOR
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 18
**Waves:** 4
**Timeline:** 5 weeks (per decisions.md)

---

## The Essence

> **What is this product REALLY about?**
> Proving to clients they haven't been forgotten after the check clears.

> **What's the feeling it should evoke?**
> "You're not alone."

> **What's the one thing that must be perfect?**
> The first glance — one second to feel cared for or abandoned.

> **Creative direction:**
> Warm pulse, not cold dashboard.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-ARCH-001 to REQ-ARCH-007: Core architecture, JSON storage | phase-1-task-1, phase-1-task-2 | 1 |
| REQ-BACKEND-004: Stripe webhook integration | phase-1-task-3 | 1 |
| REQ-CLIENT-001: UUIDv4 dashboard URLs | phase-1-task-1 | 1 |
| REQ-BACKEND-003: Cloudflare Analytics API | phase-1-task-4 | 2 |
| REQ-BACKEND-004: Lighthouse CI weekly batch | phase-1-task-5 | 2 |
| REQ-BACKEND-006: Health score threshold logic | phase-1-task-6 | 2 |
| REQ-DASH-001 to REQ-DASH-006: Dashboard template | phase-1-task-7 | 2 |
| REQ-EMAIL-001 to REQ-EMAIL-005: Email templates | phase-1-task-8 | 2 |
| REQ-BACKEND-001: Nightly dashboard generator | phase-1-task-9 | 3 |
| REQ-CLIENT-002: Magic link access | phase-1-task-10 | 3 |
| REQ-DESIGN-001 to REQ-DESIGN-005: Visual design, CSS | phase-1-task-11 | 3 |
| REQ-DASH-005, REQ-DESIGN-004: Copy voice audit | phase-1-task-12 | 3 |
| Cron job orchestration | phase-1-task-13 | 4 |
| End-to-end testing | phase-1-task-14 | 4 |
| Deployment and QA | phase-1-task-15 | 4 |
| Launch checklist | phase-1-task-16 | 4 |
| Sara Blakely customer gut-check | phase-1-task-17 | 4 |
| First 10 client prep | phase-1-task-18 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation: Project Setup, Data Schema, Stripe

Three independent foundational tasks setting up project structure, data storage, and payment integration.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Project structure and JSON data schema</title>
  <requirement>REQ-ARCH-001, REQ-ARCH-002, REQ-CLIENT-001: Static HTML, JSON storage, UUIDv4 URLs</requirement>
  <description>
    Create the HARBOR project structure and define JSON schemas.
    Per Elon (D-7): "Static architecture. 2008 technology that works."
    Per decision: JSON file storage until 500 clients.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Locked decisions and file structure" />
    <file path="/home/agent/shipyard-ai/examples/peak-dental/seed/seed.json" reason="JSON schema pattern reference" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-themes/palette/palette-one/" reason="Static HTML pattern" />
  </context>

  <steps>
    <step order="1">Create harbor/ directory in deliverables/</step>
    <step order="2">Create directory structure per decisions.md: dashboard/, api/, data/, emails/, cron/, static/, config/</step>
    <step order="3">Create data/clients.json with schema: { clients: [ { client_id, name, email, dashboard_url, stripe_customer_id, requests_remaining, created_at, last_updated } ] }</step>
    <step order="4">Create data/requests.json with schema: { requests: [ { request_id, client_id, type, price, status, created_at, completed_at } ] }</step>
    <step order="5">Create config/pricing.json with fixed prices: { logo_swap: 25, image_replacement: 25, text_update: 25, blog_post: 50, new_section: 75, new_page: 150 }</step>
    <step order="6">Create config/copy.json with warm voice templates</step>
    <step order="7">Implement generateClientUUID() function using UUIDv4</step>
    <step order="8">Create lib/data.ts with CRUD functions for clients.json and requests.json</step>
    <step order="9">Implement atomic write with backup on every mutation</step>
    <step order="10">Create static/clients/ directory for generated dashboards</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/deliverables/harbor/</check>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/data/clients.json</check>
    <check type="manual">JSON schemas match decisions.md specification</check>
    <check type="manual">UUIDv4 generation produces valid, unguessable IDs</check>
    <check type="manual">Backup created on data mutation</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(harbor): add project structure and JSON data schemas

Per D-7: Static architecture with JSON storage.
Schema: clients.json, requests.json, pricing.json.
UUIDv4 for unguessable dashboard URLs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Configuration constants and threshold definitions</title>
  <requirement>REQ-BACKEND-006, REQ-DOMAIN-003, REQ-DOMAIN-004: Health thresholds, hard caps, fixed pricing</requirement>
  <description>
    Define all configuration constants for HARBOR.
    Per Phil's arbitration: Green/Yellow/Red thresholds defined.
    Per Elon: Hard caps with human escalation path.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Threshold definitions in Open Questions #4" />
    <file path="/home/agent/shipyard-ai/deliverables/shipyard-care/lib/health-score.ts" reason="Existing health score pattern" />
  </context>

  <steps>
    <step order="1">Create harbor/config/thresholds.ts</step>
    <step order="2">Define HEALTH_GREEN: Performance >= 90 AND Accessibility >= 90</step>
    <step order="3">Define HEALTH_YELLOW: Performance 70-89 OR Accessibility 70-89</step>
    <step order="4">Define HEALTH_RED: Performance less than 70 OR Accessibility less than 70 OR site down</step>
    <step order="5">Create harbor/config/subscription.ts</step>
    <step order="6">Define MONTHLY_PRICE = 79</step>
    <step order="7">Define UPDATES_PER_MONTH = 3 (pending final decision, use conservative)</step>
    <step order="8">Define OVERAGE_PRICE = 35 per update</step>
    <step order="9">Create harbor/config/schedule.ts</step>
    <step order="10">Define DASHBOARD_REBUILD_HOUR = 6 (6:00 AM)</step>
    <step order="11">Define LIGHTHOUSE_DAY = 'SUNDAY' (weekly)</step>
    <step order="12">Define EMAIL_SUMMARY_DAY = 'MONDAY'</step>
    <step order="13">Export all configs from harbor/config/index.ts</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/config/thresholds.ts</check>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/config/subscription.ts</check>
    <check type="manual">Health thresholds match decisions.md Open Question #4</check>
    <check type="manual">All constants typed and documented</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(harbor): add configuration constants and thresholds

Health thresholds: Green (>=90), Yellow (70-89), Red (<70).
Subscription: $79/month, 3 updates, $35 overage.
Schedule: 6am rebuild, Sunday Lighthouse, Monday email.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Stripe subscription integration with webhook handler</title>
  <requirement>REQ-CLIENT-004, REQ-CLIENT-005, REQ-ARCH-007: Stripe checkout, single tier, webhooks</requirement>
  <description>
    Implement Stripe integration for $79/month subscription.
    Per Elon: One tier at launch. Test whether anyone pays before testing upgrades.
    Handle subscription.created, subscription.cancelled, subscription.updated events.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/apps/pulse/lib/stripe.ts" reason="Existing Stripe pattern with idempotency" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="D-3: One tier at launch, $79/month" />
  </context>

  <steps>
    <step order="1">Create harbor/api/stripe-webhook.ts</step>
    <step order="2">Import Stripe SDK and configure with API key from env</step>
    <step order="3">Implement webhook signature verification</step>
    <step order="4">Handle checkout.session.completed: create client in clients.json</step>
    <step order="5">Generate UUIDv4 dashboard URL on subscription creation</step>
    <step order="6">Initialize requests_remaining to UPDATES_PER_MONTH</step>
    <step order="7">Handle customer.subscription.deleted: mark client inactive</step>
    <step order="8">Handle customer.subscription.updated: sync status</step>
    <step order="9">Handle invoice.payment_succeeded: reset requests_remaining monthly</step>
    <step order="10">Implement idempotency using Stripe event ID</step>
    <step order="11">Log all webhook events: "[HARBOR] Stripe: {event_type} for {customer_id}"</step>
    <step order="12">Create harbor/api/create-checkout.ts for initiating checkout</step>
    <step order="13">Configure single product: HARBOR Monthly ($79/month)</step>
    <step order="14">Include success_url and cancel_url</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/api/stripe-webhook.ts</check>
    <check type="manual">Webhook signature verified before processing</check>
    <check type="manual">All three subscription events handled</check>
    <check type="manual">Idempotency prevents duplicate processing</check>
    <check type="manual">Single tier ($79) configured</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs clients.json schema" />
  </dependencies>

  <commit-message>feat(harbor): add Stripe subscription with webhook handler

Per D-3: Single tier $79/month.
Handles: checkout.session.completed, subscription.deleted, subscription.updated.
Idempotent webhook processing.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Integrations: APIs, Dashboard Template, Emails

Five tasks building the core functionality: Cloudflare API, Lighthouse, health logic, dashboard template, emails.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Cloudflare Analytics API integration</title>
  <requirement>REQ-BACKEND-003, REQ-ARCH-003: Cloudflare traffic data integration</requirement>
  <description>
    Integrate Cloudflare Analytics API for traffic metrics.
    Per decisions.md: Weekly traffic data integration.
    Graceful degradation if API unavailable.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Cloudflare worker pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Traffic metrics specification" />
  </context>

  <steps>
    <step order="1">Create harbor/api/cloudflare-analytics.ts</step>
    <step order="2">Configure Cloudflare API token from environment</step>
    <step order="3">Implement fetchSiteAnalytics(zoneId, dateRange)</step>
    <step order="4">Return: { visitors, pageviews, period_start, period_end }</step>
    <step order="5">Implement 24-hour caching layer</step>
    <step order="6">If API fails, return cached data with stale flag</step>
    <step order="7">Implement exponential backoff: 1s, 2s, 4s, max 3 retries</step>
    <step order="8">Format visitor count for human display: "1,247 visitors"</step>
    <step order="9">Calculate week-over-week change percentage</step>
    <step order="10">Store cached results in data/analytics-cache.json</step>
    <step order="11">Log API calls: "[HARBOR] Cloudflare: fetched analytics for {zone_id}"</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/api/cloudflare-analytics.ts</check>
    <check type="manual">API token read from environment</check>
    <check type="manual">24-hour cache implemented</check>
    <check type="manual">Graceful degradation on failure</check>
    <check type="manual">Exponential backoff on retries</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs data directory structure" />
  </dependencies>

  <commit-message>feat(harbor): add Cloudflare Analytics API integration

Weekly traffic data fetch with 24-hour cache.
Graceful degradation on API failure.
Exponential backoff: 1s, 2s, 4s retries.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Lighthouse CI weekly batch runner</title>
  <requirement>REQ-BACKEND-004, REQ-ARCH-004: Lighthouse CI weekly, not daily</requirement>
  <description>
    Implement Lighthouse CI batch runner for performance scoring.
    Per Elon (D-13): "Weekly Lighthouse, not daily. 100 sites daily = compute cost + rate limits."
    Store Performance and Accessibility scores.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/shipyard-care/lib/pagespeed.ts" reason="Existing PageSpeed API pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="D-13: Weekly batch" />
  </context>

  <steps>
    <step order="1">Create harbor/api/lighthouse-runner.ts</step>
    <step order="2">Use PageSpeed Insights API (or Lighthouse CI)</step>
    <step order="3">Implement runLighthouseAudit(url): returns { performance, accessibility, seo, best_practices }</step>
    <step order="4">Store results in data/lighthouse-results.json keyed by client_id</step>
    <step order="5">Create harbor/cron/lighthouse-batch.ts</step>
    <step order="6">Schedule weekly on Sunday (per config)</step>
    <step order="7">Process all active clients in batch</step>
    <step order="8">Add 2-second delay between requests to avoid rate limits</step>
    <step order="9">Handle failures gracefully: preserve previous score, flag as stale</step>
    <step order="10">Log batch progress: "[HARBOR] Lighthouse: {n}/{total} complete"</step>
    <step order="11">Calculate estimated completion time for monitoring</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/api/lighthouse-runner.ts</check>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/cron/lighthouse-batch.ts</check>
    <check type="manual">Weekly schedule (not daily)</check>
    <check type="manual">Rate limiting with 2s delay</check>
    <check type="manual">Graceful failure handling</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs data directory and client list" />
  </dependencies>

  <commit-message>feat(harbor): add Lighthouse CI weekly batch runner

Per D-13: Weekly, not daily (cost/rate limit management).
PageSpeed API with 2s delay between requests.
Results stored per client in lighthouse-results.json.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Health score calculation with Green/Yellow/Red logic</title>
  <requirement>REQ-BACKEND-006, REQ-DASH-001: Health indicator threshold logic</requirement>
  <description>
    Implement health score calculation per Phil's arbitration.
    Green: Performance >= 90 AND Accessibility >= 90
    Yellow: Either 70-89
    Red: Either less than 70 OR site down
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/shipyard-care/lib/health-score.ts" reason="Existing health score pattern" />
    <file path="/home/agent/shipyard-ai/deliverables/harbor/config/thresholds.ts" reason="Threshold constants" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Phil's arbitration on composite vs breakdown" />
  </context>

  <steps>
    <step order="1">Create harbor/lib/health-score.ts</step>
    <step order="2">Import threshold constants from config</step>
    <step order="3">Implement calculateHealthStatus(lighthouseScores, uptimeStatus)</step>
    <step order="4">Return: { status: 'green' | 'yellow' | 'red', reason: string }</step>
    <step order="5">Check site down first: if uptimeStatus === 'down', return red</step>
    <step order="6">Check green: performance >= 90 AND accessibility >= 90</step>
    <step order="7">Check red: performance less than 70 OR accessibility less than 70</step>
    <step order="8">Otherwise yellow with reason describing which metric</step>
    <step order="9">Implement getHealthDetails(lighthouseScores, uptimeStatus, trafficData)</step>
    <step order="10">Return component breakdown for detail view click-through</step>
    <step order="11">Include: lighthouse scores, uptime %, traffic trend</step>
    <step order="12">Export both functions for dashboard use</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/lib/health-score.ts</check>
    <check type="test">Test: performance=95, accessibility=92 returns green</check>
    <check type="test">Test: performance=85, accessibility=95 returns yellow</check>
    <check type="test">Test: performance=65, accessibility=90 returns red</check>
    <check type="test">Test: site down returns red regardless of scores</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Needs threshold constants" />
    <depends-on task-id="phase-1-task-5" reason="Needs Lighthouse scores" />
  </dependencies>

  <commit-message>feat(harbor): add health score calculation with threshold logic

Per Phil's arbitration: Both composite and breakdown.
Green: Perf>=90 AND Access>=90
Yellow: Either 70-89
Red: Either <70 OR site down

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Dashboard HTML template with components</title>
  <requirement>REQ-DASH-001 to REQ-DASH-006: Health indicator, traffic summary, three metrics</requirement>
  <description>
    Create the HARBOR dashboard HTML template.
    Per Steve: "The dashboard IS the product."
    Per essence: "Warm pulse, not cold dashboard."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-themes/palette/palette-one/index.html" reason="Semantic HTML pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Dashboard specifications" />
  </context>

  <steps>
    <step order="1">Create harbor/dashboard/index.html template</step>
    <step order="2">Semantic HTML5 structure with accessibility attributes</step>
    <step order="3">Create harbor/dashboard/components/health-indicator.html</step>
    <step order="4">Large Green/Yellow/Red circle dominating viewport</step>
    <step order="5">Clickable to expand detail view</step>
    <step order="6">Create harbor/dashboard/components/health-details.html</step>
    <step order="7">Shows: Lighthouse score, uptime %, traffic trend on click</step>
    <step order="8">Create harbor/dashboard/components/traffic-summary.html</step>
    <step order="9">One sentence: "{N} people visited your site this week. Everything looks great."</step>
    <step order="10">Create harbor/dashboard/components/last-updated.html</step>
    <step order="11">Format: "Last updated: Today at 6:00 AM"</step>
    <step order="12">Add "Built by Shipyard" footer with link</step>
    <step order="13">Add placeholder tokens for data injection: {{client_name}}, {{health_status}}, {{visitor_count}}, etc.</step>
    <step order="14">Include minimal vanilla JS for click-to-expand interaction</step>
    <step order="15">Total page size target: less than 50KB including CSS</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/dashboard/index.html</check>
    <check type="manual">Health indicator dominates viewport</check>
    <check type="manual">Exactly three metrics visible: Traffic, Health, Last Updated</check>
    <check type="manual">One-sentence traffic summary</check>
    <check type="manual">"Built by Shipyard" footer present</check>
    <check type="manual">Page size less than 50KB</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs directory structure" />
    <depends-on task-id="phase-1-task-6" reason="Needs health status format" />
  </dependencies>

  <commit-message>feat(harbor): add dashboard HTML template with components

Per Steve: Dashboard IS the product.
Health indicator dominant, one-sentence summary.
Three metrics only: Traffic, Health, Last Updated.
"Built by Shipyard" footer.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Email templates for 5 touchpoints</title>
  <requirement>REQ-EMAIL-001 to REQ-EMAIL-005: Welcome, status, completed, warning, anniversary</requirement>
  <description>
    Create all 5 email templates with warm human voice.
    Per Steve (D-15): "Every notification should feel like a smart friend texting you."
    Per Elon (D-15 concession): "The dopamine hit matters."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/email.ts" reason="Email template pattern with escapeHtml" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="5 email touchpoints specification" />
  </context>

  <steps>
    <step order="1">Create harbor/emails/welcome.html</step>
    <step order="2">Subject: "Your site is live. Here's your dashboard."</step>
    <step order="3">Body: Celebration tone, dashboard link, what to expect</step>
    <step order="4">Create harbor/emails/status-summary.html</step>
    <step order="5">Subject: "Your site had a great week"</step>
    <step order="6">Body: Visitor count, health status, trends</step>
    <step order="7">Create harbor/emails/request-completed.html</step>
    <step order="8">Subject: "We noticed something - already fixed"</step>
    <step order="9">Body: What was done, proactive care messaging</step>
    <step order="10">Create harbor/emails/usage-warning.html</step>
    <step order="11">Subject: "1 update remaining this month"</step>
    <step order="12">Body: Current usage, upgrade CTA, escalation button</step>
    <step order="13">Create harbor/emails/anniversary.html</step>
    <step order="14">Subject: "We're still here. We still care."</step>
    <step order="15">Body: Year-in-review stats, celebration, renewal value</step>
    <step order="16">All emails: inline CSS, mobile responsive, max-width 600px</step>
    <step order="17">All emails: unsubscribe link, HARBOR branding</step>
    <step order="18">Create harbor/lib/email.ts with Resend integration</step>
    <step order="19">Implement escapeHtml() for XSS prevention</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/deliverables/harbor/emails/</check>
    <check type="manual">All 5 templates created</check>
    <check type="manual">Warm human voice in all copy</check>
    <check type="manual">Inline CSS (no external stylesheets)</check>
    <check type="manual">Unsubscribe link in footer</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs directory structure" />
    <depends-on task-id="phase-1-task-2" reason="Needs copy.json templates" />
  </dependencies>

  <commit-message>feat(harbor): add 5 email templates with warm voice

Per D-15: "Smart friend texting you" tone.
Templates: welcome, status-summary, request-completed, usage-warning, anniversary.
Resend integration with XSS prevention.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Generation & Access: Nightly Build, Magic Links, CSS, Copy

Four tasks for dashboard generation, access control, visual design, and copy polish.

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Nightly dashboard generator cron job</title>
  <requirement>REQ-BACKEND-001: Static HTML dashboards rebuilt nightly via cron</requirement>
  <description>
    Implement the nightly dashboard generation job.
    Per Elon (D-7): "Static HTML per client, rebuilt nightly."
    Output: One index.html per client at /static/clients/{uuid}/index.html
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/pipeline/auto/parse-prd.mjs" reason="Node script pattern" />
    <file path="/home/agent/shipyard-ai/deliverables/harbor/dashboard/index.html" reason="Template to populate" />
  </context>

  <steps>
    <step order="1">Create harbor/cron/dashboard-generator.ts</step>
    <step order="2">Import template from dashboard/index.html</step>
    <step order="3">Load all active clients from clients.json</step>
    <step order="4">For each client:</step>
    <step order="5">  - Fetch latest Cloudflare analytics (from cache)</step>
    <step order="6">  - Fetch latest Lighthouse results (from cache)</step>
    <step order="7">  - Calculate health status using health-score.ts</step>
    <step order="8">  - Replace template tokens with client data</step>
    <step order="9">  - Write to static/clients/{client_uuid}/index.html</step>
    <step order="10">Set "Last updated: Today at 6:00 AM" timestamp</step>
    <step order="11">Schedule cron for 6:00 AM daily (per config)</step>
    <step order="12">Log generation: "[HARBOR] Dashboard: generated {n} dashboards"</step>
    <step order="13">Handle errors gracefully: skip failed client, log error, continue</step>
    <step order="14">Create static/clients/.htaccess or equivalent for clean URLs</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/cron/dashboard-generator.ts</check>
    <check type="manual">Template tokens replaced with real data</check>
    <check type="manual">Output path: static/clients/{uuid}/index.html</check>
    <check type="manual">Scheduled for 6:00 AM daily</check>
    <check type="manual">Error handling doesn't abort batch</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Needs Cloudflare analytics data" />
    <depends-on task-id="phase-1-task-5" reason="Needs Lighthouse results" />
    <depends-on task-id="phase-1-task-6" reason="Needs health score calculation" />
    <depends-on task-id="phase-1-task-7" reason="Needs dashboard template" />
  </dependencies>

  <commit-message>feat(harbor): add nightly dashboard generator cron

Per D-7: Static HTML per client, rebuilt nightly at 6am.
Populates template with Cloudflare + Lighthouse data.
Output: static/clients/{uuid}/index.html

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Magic link access system</title>
  <requirement>REQ-CLIENT-002, REQ-ARCH-005: Magic link access, no password</requirement>
  <description>
    Implement magic link access for dashboards.
    Per Steve (D-6): "A password kills 40% of engagement."
    UUIDv4 URLs are unguessable; magic links add email verification layer.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="D-6: No password protection, magic links" />
  </context>

  <steps>
    <step order="1">Create harbor/api/magic-link.ts</step>
    <step order="2">Implement generateMagicLink(clientId, email)</step>
    <step order="3">Create short-lived token (24 hour expiry) tied to client_id + email</step>
    <step order="4">Store token in data/magic-tokens.json</step>
    <step order="5">Return magic link URL: /dashboard/verify?token={token}</step>
    <step order="6">Create harbor/api/verify-magic-link.ts</step>
    <step order="7">Validate token exists and not expired</step>
    <step order="8">Validate email matches client record</step>
    <step order="9">On success: redirect to dashboard/{client_uuid}</step>
    <step order="10">On failure: show friendly error with "Request new link" button</step>
    <step order="11">Implement sendMagicLinkEmail(clientId)</step>
    <step order="12">Use welcome email template with magic link</step>
    <step order="13">For v1: dashboard URLs work directly (UUIDv4 is security)</step>
    <step order="14">Magic link adds optional email verification layer</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/api/magic-link.ts</check>
    <check type="manual">Token expires after 24 hours</check>
    <check type="manual">Email validation on verify</check>
    <check type="manual">No password anywhere in flow</check>
    <check type="manual">Friendly error on invalid token</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs client data" />
    <depends-on task-id="phase-1-task-8" reason="Needs email sending capability" />
  </dependencies>

  <commit-message>feat(harbor): add magic link access system

Per D-6: No password - magic links + UUIDv4.
24-hour token expiry, email verification.
Friendly error with "Request new link" on failure.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>CSS design system with warm visual direction</title>
  <requirement>REQ-DESIGN-001 to REQ-DESIGN-003, REQ-DESIGN-005: Warm pulse, health colors, one-second clarity</requirement>
  <description>
    Create the CSS design system for HARBOR.
    Per essence: "Warm pulse, not cold dashboard."
    Health indicator colors: Green, Yellow (amber), Red.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-themes/palette/palette-one/css/variables.css" reason="CSS variables pattern" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-themes/palette/palette-one/css/style.css" reason="Component styles pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Emotional Risks - dashboard feels cold" />
  </context>

  <steps>
    <step order="1">Create harbor/dashboard/css/variables.css</step>
    <step order="2">Define warm color palette (no harsh grays or blues)</step>
    <step order="3">Define --color-green: warm green for healthy status</step>
    <step order="4">Define --color-yellow: warm amber for warning</step>
    <step order="5">Define --color-red: warm red for critical (not harsh)</step>
    <step order="6">Define font stack: Inter or similar warm, readable font</step>
    <step order="7">Define spacing scale for consistent rhythm</step>
    <step order="8">Create harbor/dashboard/css/style.css</step>
    <step order="9">Health indicator: large circle (200px+), centered, dominant</step>
    <step order="10">One-second clarity: high contrast, clear visual hierarchy</step>
    <step order="11">Traffic summary: friendly, readable, not data-dense</step>
    <step order="12">"Built by Shipyard" footer: subtle but visible</step>
    <step order="13">Mobile responsive: single column below 480px</step>
    <step order="14">Click state for health indicator expansion</step>
    <step order="15">Self-host fonts (or use system fonts for performance)</step>
    <step order="16">Total CSS target: less than 10KB</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/dashboard/css/variables.css</check>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/dashboard/css/style.css</check>
    <check type="manual">Warm color palette (no cold grays)</check>
    <check type="manual">Health indicator large and dominant</check>
    <check type="manual">Mobile responsive at 480px</check>
    <check type="manual">CSS under 10KB</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Needs dashboard HTML structure" />
  </dependencies>

  <commit-message>style(harbor): add warm CSS design system

Per essence: "Warm pulse, not cold dashboard."
Health colors: warm green/amber/red.
One-second clarity with dominant indicator.
Mobile responsive, under 10KB total.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Copy voice audit and warm language review</title>
  <requirement>REQ-DASH-005, REQ-DESIGN-004: Human voice, trusted friend tone</requirement>
  <description>
    Comprehensive copy review ensuring warm human voice.
    Per Steve (D-15): "Every notification should feel like a smart friend texting you."
    Per essence: "You're not alone."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/harbor/dashboard/index.html" reason="Dashboard copy to audit" />
    <file path="/home/agent/shipyard-ai/deliverables/harbor/emails/" reason="Email copy to audit" />
    <file path="/home/agent/shipyard-ai/deliverables/harbor/config/copy.json" reason="Copy templates" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="D-15: Warm human voice" />
  </context>

  <steps>
    <step order="1">Create harbor/COPY-AUDIT.md checklist</step>
    <step order="2">Audit dashboard copy:</step>
    <step order="3">  - Traffic summary uses conversational tone</step>
    <step order="4">  - "Everything looks great" vs "Status: Normal"</step>
    <step order="5">  - "{N} people visited" vs "{N} unique visitors recorded"</step>
    <step order="6">Audit email copy:</step>
    <step order="7">  - Welcome: celebratory, not transactional</step>
    <step order="8">  - Status: proud parent sharing news</step>
    <step order="9">  - Warning: helpful friend, not bill collector</step>
    <step order="10">  - Anniversary: genuine care, not upsell disguised</step>
    <step order="11">Review config/copy.json templates</step>
    <step order="12">Ensure "updates remaining" never says "tokens" or "credits"</step>
    <step order="13">Verify HARBOR branding (not "Shipyard Maintenance System")</step>
    <step order="14">Remove any passive voice</step>
    <step order="15">Remove any corporate jargon</step>
    <step order="16">Document voice guidelines for future copy</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/COPY-AUDIT.md</check>
    <check type="manual">No passive voice in any copy</check>
    <check type="manual">No "tokens" or "credits" terminology</check>
    <check type="manual">Conversational tone throughout</check>
    <check type="manual">HARBOR branding consistent</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Needs dashboard copy" />
    <depends-on task-id="phase-1-task-8" reason="Needs email copy" />
  </dependencies>

  <commit-message>docs(harbor): complete copy voice audit

Per D-15: "Smart friend texting you" tone.
No passive voice, no tokens/credits terminology.
Conversational throughout, HARBOR branding.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Polish: Cron Orchestration, Testing, Launch

Six tasks for final integration, testing, and launch readiness.

```xml
<task-plan id="phase-1-task-13" wave="4">
  <title>Cron job orchestration and email scheduler</title>
  <requirement>REQ-BACKEND-005: Email templates via cron/webhook triggers</requirement>
  <description>
    Orchestrate all cron jobs: dashboard rebuild, Lighthouse batch, email scheduler.
    Ensure jobs don't collide and run in correct order.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/harbor/cron/" reason="Cron jobs to orchestrate" />
    <file path="/home/agent/shipyard-ai/deliverables/harbor/config/schedule.ts" reason="Schedule constants" />
  </context>

  <steps>
    <step order="1">Create harbor/cron/email-scheduler.ts</step>
    <step order="2">Implement checkAnniversaries(): send anniversary emails on Day 365</step>
    <step order="3">Implement checkUsageWarnings(): send warning when requests_remaining == 1</step>
    <step order="4">Implement sendWeeklySummaries(): send status summary emails</step>
    <step order="5">Create harbor/cron/orchestrator.ts</step>
    <step order="6">Define cron schedule:</step>
    <step order="7">  - Sunday 2am: Lighthouse batch</step>
    <step order="8">  - Daily 6am: Dashboard rebuild</step>
    <step order="9">  - Monday 8am: Weekly summary emails</step>
    <step order="10">  - Daily 9am: Anniversary and usage warning checks</step>
    <step order="11">Implement job locking to prevent overlapping runs</step>
    <step order="12">Log job start/end: "[HARBOR] Cron: {job_name} started/completed"</step>
    <step order="13">Alert on job failure (log + email to admin)</step>
    <step order="14">Create health check endpoint for monitoring cron status</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/cron/orchestrator.ts</check>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/cron/email-scheduler.ts</check>
    <check type="manual">All cron jobs scheduled correctly</check>
    <check type="manual">No schedule collisions</check>
    <check type="manual">Job locking implemented</check>
    <check type="manual">Failure alerts configured</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Needs Lighthouse batch job" />
    <depends-on task-id="phase-1-task-8" reason="Needs email templates" />
    <depends-on task-id="phase-1-task-9" reason="Needs dashboard generator" />
  </dependencies>

  <commit-message>feat(harbor): add cron orchestration and email scheduler

Schedule: Sunday Lighthouse, daily dashboard, Monday emails.
Job locking prevents overlaps.
Anniversary and usage warning checks daily.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="4">
  <title>End-to-end testing suite</title>
  <requirement>System verification before launch</requirement>
  <description>
    Comprehensive testing of all HARBOR functionality.
    Test full flow: subscription -> dashboard generation -> email delivery.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/harbor/" reason="All components to test" />
  </context>

  <steps>
    <step order="1">Create harbor/tests/ directory</step>
    <step order="2">Create harbor/tests/health-score.test.ts</step>
    <step order="3">Test all threshold combinations: green, yellow, red, site down</step>
    <step order="4">Create harbor/tests/data-layer.test.ts</step>
    <step order="5">Test CRUD operations on clients.json, requests.json</step>
    <step order="6">Test backup creation on write</step>
    <step order="7">Create harbor/tests/stripe-webhook.test.ts</step>
    <step order="8">Test subscription.created, subscription.deleted events</step>
    <step order="9">Test idempotency (same event twice)</step>
    <step order="10">Create harbor/tests/dashboard-generator.test.ts</step>
    <step order="11">Test template token replacement</step>
    <step order="12">Test output file creation</step>
    <step order="13">Create harbor/tests/e2e.test.ts</step>
    <step order="14">Full flow: create client -> generate dashboard -> verify output</step>
    <step order="15">Verify dashboard loads in browser</step>
    <step order="16">Verify health indicator displays correctly</step>
  </steps>

  <verification>
    <check type="bash">npm run test -- harbor/tests/</check>
    <check type="manual">All tests pass</check>
    <check type="manual">Health score edge cases covered</check>
    <check type="manual">E2E flow verified</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Needs dashboard generator" />
    <depends-on task-id="phase-1-task-13" reason="Needs cron orchestration" />
  </dependencies>

  <commit-message>test(harbor): add comprehensive testing suite

Health score thresholds, data layer, Stripe webhooks.
E2E: subscription -> dashboard -> verification.
All edge cases covered.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="4">
  <title>Deployment configuration and QA</title>
  <requirement>Production deployment readiness</requirement>
  <description>
    Prepare HARBOR for production deployment.
    Configure Cloudflare Pages, environment variables, monitoring.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/pipeline/deploy/deploy.sh" reason="Existing deploy pattern" />
    <file path="/home/agent/shipyard-ai/.github/workflows/auto-pipeline.yml" reason="GitHub Actions pattern" />
  </context>

  <steps>
    <step order="1">Create harbor/wrangler.toml for Cloudflare Pages</step>
    <step order="2">Configure static asset serving from static/clients/</step>
    <step order="3">Create harbor/.env.example with required variables</step>
    <step order="4">Document: STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET</step>
    <step order="5">Document: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID</step>
    <step order="6">Document: RESEND_API_KEY, FROM_EMAIL</step>
    <step order="7">Create harbor/README.md with setup instructions</step>
    <step order="8">Create .github/workflows/harbor-deploy.yml</step>
    <step order="9">Deploy on push to main (harbor/ directory)</step>
    <step order="10">Run tests before deploy</step>
    <step order="11">QA checklist:</step>
    <step order="12">  - Dashboard loads in less than 2 seconds</step>
    <step order="13">  - Health indicator visible above fold</step>
    <step order="14">  - Mobile responsive (test at 375px)</step>
    <step order="15">  - Click-through to details works</step>
    <step order="16">  - Emails render correctly in Gmail, Outlook</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/wrangler.toml</check>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/.env.example</check>
    <check type="manual">All environment variables documented</check>
    <check type="manual">Deployment workflow configured</check>
    <check type="manual">QA checklist passed</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-14" reason="Tests must pass before deploy" />
  </dependencies>

  <commit-message>chore(harbor): add deployment config and QA checklist

Cloudflare Pages deployment via wrangler.
Environment variables documented.
QA: load time, mobile, email rendering.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-16" wave="4">
  <title>Launch readiness checklist</title>
  <requirement>Final verification before launch</requirement>
  <description>
    Verify all requirements met and HARBOR ready for first 10 clients.
    Per decisions.md: "This document is the contract."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="All requirements" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="18 locked decisions" />
  </context>

  <steps>
    <step order="1">Create harbor/LAUNCH-CHECKLIST.md</step>
    <step order="2">Verify all requirements from REQUIREMENTS.md</step>
    <step order="3">Verify all 18 locked decisions implemented</step>
    <step order="4">Verify "NOT in V1" features absent:</step>
    <step order="5">  - No white-labeling</step>
    <step order="6">  - No geographic metrics</step>
    <step order="7">  - No suggestions engine</step>
    <step order="8">  - No triggered alerts</step>
    <step order="9">  - No multi-tier pricing</step>
    <step order="10">  - No token visibility</step>
    <step order="11">Verify environment setup:</step>
    <step order="12">  - Stripe product configured ($79/month)</step>
    <step order="13">  - Cloudflare API access</step>
    <step order="14">  - Resend email configured</step>
    <step order="15">Run ship test: "One second to feel cared for or abandoned"</step>
    <step order="16">Document known limitations for V1</step>
    <step order="17">Get stakeholder sign-off</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/LAUNCH-CHECKLIST.md</check>
    <check type="manual">All requirements verified</check>
    <check type="manual">All 18 decisions implemented</check>
    <check type="manual">Ship test passed</check>
    <check type="manual">Stakeholder sign-off received</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-15" reason="Deployment must be ready" />
  </dependencies>

  <commit-message>docs(harbor): add launch readiness checklist

All requirements, 18 decisions verified.
Ship test: "One second to feel cared for."
Ready for first 10 clients.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-17" wave="4">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent to gut-check from real customer perspective.
    "Would a real customer pay for this? What feels like engineering vanity vs. customer value?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This phase plan" />
    <file path="/home/agent/shipyard-ai/prds/failed/shipyard-maintenance-system.md" reason="Original PRD" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="Build decisions" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely (growth-mindset entrepreneur)</step>
    <step order="2">Prompt: Read phase plan and PRD</step>
    <step order="3">Answer: Would Sarah (marketing manager from PRD persona) actually use HARBOR?</step>
    <step order="4">Answer: What would make her say "shut up and take my money"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. customer value?</step>
    <step order="6">Answer: Is $79/month the right price for perceived value?</step>
    <step order="7">Answer: Does the warm voice feel authentic or corporate trying too hard?</step>
    <step order="8">Write findings to .planning/sara-blakely-review.md</step>
    <step order="9">Review and address major gaps before launch</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Review after launch checklist" />
  </dependencies>

  <commit-message>docs(harbor): add Sara Blakely customer gut-check

Per SKILL.md: Validate customer value.
Would Sarah pay $79/month?
Engineering vanity vs. customer value analysis.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-18" wave="4">
  <title>First 10 client preparation</title>
  <requirement>D-8: First 10 contracts hand-sold</requirement>
  <description>
    Prepare for hand-selling first 10 clients.
    Per Elon (D-8): "Zero clients have ever bought maintenance. This is a cold-start problem."
    Automation amplifies success; it can't create it.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-system/decisions.md" reason="D-8: Hand-sell first 10, Open Question #5: Selection criteria" />
  </context>

  <steps>
    <step order="1">Create harbor/SALES-PLAYBOOK.md</step>
    <step order="2">Document selection criteria for first 10:</step>
    <step order="3">  - Launched within last 6 months (still warm)</step>
    <step order="4">  - Project value greater than $20K (invested in quality)</step>
    <step order="5">  - Responsive communication (likely to engage)</step>
    <step order="6">Create outreach email template (warm, not salesy)</step>
    <step order="7">Create demo script showing dashboard value</step>
    <step order="8">Document objection handling:</step>
    <step order="9">  - "I don't need maintenance" -> Show invisible work made visible</step>
    <step order="10">  - "Too expensive" -> Compare to agency retainers ($1000+/mo)</step>
    <step order="11">  - "I can do it myself" -> Time value, peace of mind</step>
    <step order="12">Create feedback collection template for first 10</step>
    <step order="13">Document what to learn from first 10:</step>
    <step order="14">  - Which features matter most?</step>
    <step order="15">  - What's missing?</step>
    <step order="16">  - Is $79 right?</step>
    <step order="17">Schedule client review sessions at week 2 and week 4</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/harbor/SALES-PLAYBOOK.md</check>
    <check type="manual">Selection criteria documented</check>
    <check type="manual">Outreach template ready</step>
    <check type="manual">Objection handling prepared</check>
    <check type="manual">Feedback collection planned</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Product must be ready before sales" />
  </dependencies>

  <commit-message>docs(harbor): add sales playbook for first 10 clients

Per D-8: Hand-sell first 10, automation amplifies later.
Selection criteria, outreach templates, objection handling.
Feedback collection for product learning.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 3 | Foundation: Project setup, config, Stripe | 3 parallel |
| 2 | 5 | Core Integrations: Cloudflare, Lighthouse, health, template, emails | 5 parallel (after Wave 1) |
| 3 | 4 | Generation & Access: Nightly build, magic links, CSS, copy | 4 parallel (after Wave 2) |
| 4 | 6 | Polish: Cron, testing, deploy, launch, review, sales | Sequential (after Wave 3) |

**Total Tasks:** 18
**Maximum Parallelism:** Wave 2 (5 concurrent tasks)
**Timeline:** 5 weeks per decisions.md

---

## Dependencies Diagram

```
Wave 1:  [task-1: Project] ───────────────────────────────────────────────────>
         [task-2: Config]  ───────────────────────────────────────────────────>
         [task-3: Stripe]  ───> (depends on task-1) ──────────────────────────>

Wave 2:  [task-4: Cloudflare] ───> (depends on task-1) ───────────────────────>
         [task-5: Lighthouse] ───> (depends on task-1) ───────────────────────>
         [task-6: Health]     ───> (depends on task-2, task-5) ───────────────>
         [task-7: Template]   ───> (depends on task-1, task-6) ───────────────>
         [task-8: Emails]     ───> (depends on task-1, task-2) ───────────────>

Wave 3:  [task-9: Generator]  ───> (depends on task-4,5,6,7) ─────────────────>
         [task-10: Magic Link] ───> (depends on task-1, task-8) ──────────────>
         [task-11: CSS]       ───> (depends on task-7) ───────────────────────>
         [task-12: Copy]      ───> (depends on task-7, task-8) ───────────────>

Wave 4:  [task-13: Cron]      ───> (depends on task-5,8,9) ───────────────────>
         [task-14: Testing]   ───> (depends on task-9, task-13) ──────────────>
         [task-15: Deploy]    ───> (depends on task-14) ──────────────────────>
         [task-16: Launch]    ───> (depends on task-15) ──────────────────────>
         [task-17: Sara]      ───> (depends on task-16) ──────────────────────>
         [task-18: Sales]     ───> (depends on task-16) ──────────────────────>
```

---

## Risk Notes

### Critical (Address Before Wave 1)

1. **Cloudflare API Access** — Ensure API credentials available
   - API token with Analytics read scope
   - Zone IDs for client sites
   - Test with real site first

2. **Stripe Configuration** — Payment processing
   - Product created: "HARBOR Monthly" $79/month
   - Webhook endpoint configured
   - Test mode validation

3. **Resend/Email Setup** — Email delivery
   - API key obtained
   - Domain verified for sending
   - Test email delivery

### High (Monitor During Execution)

4. **Lighthouse Rate Limits** — 100 sites weekly
   - 2-second delay between requests
   - Cache results for 7 days
   - Monitor API costs

5. **JSON File Corruption** — No ACID guarantees
   - Backup on every write
   - Plan for SQLite migration at 200 clients

6. **Dashboard URL Security** — UUID-only access
   - UUIDv4 is unguessable (122 bits)
   - Monitor for access anomalies
   - Magic link adds email verification layer

### Medium (Acceptable Risk)

7. **First 10 Attach Rate** — Cold start risk
   - Hand-sell with personal touch
   - Learn from rejections
   - Iterate based on feedback

8. **"Small Update" Disputes** — Ambiguity risk
   - Document clear boundaries before launch
   - 30-minute threshold rule
   - Fixed prices help clarity

---

## Blocking Issues

### Open Questions Requiring Resolution

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | Monthly request allowance: 3 or 5 updates? | Shipyard leadership | Before first client |
| 2 | "Small update" definition document | Shipyard leadership | Before launch |
| 3 | Request dispute resolution policy | Shipyard leadership | Before first client |

**Recommendation:** Use 3 updates/month (conservative) for v1. Document "small = under 30 min" with examples. Create simple dispute policy: client can escalate, human decides.

---

## Verification Checklist

- [x] All requirements from decisions.md have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed in relevant tasks
- [x] All 18 locked decisions respected
- [x] Cut features NOT included (white-labeling, geographic metrics, etc.)
- [x] "Warm pulse, not cold dashboard" philosophy threaded through all tasks
- [x] 5-week timeline achievable with parallel execution
- [x] Ship test defined: "One second to feel cared for or abandoned"
- [x] Sara Blakely customer gut-check scheduled (task-17)
- [x] First 10 client preparation included (task-18)

---

## Ship Test

> Does the client open their HARBOR dashboard and in one second feel cared for — not abandoned?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/shipyard-maintenance-system/decisions.md, prds/failed/shipyard-maintenance-system.md*
*Project Slug: shipyard-maintenance-system*
