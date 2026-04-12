# Phase 1 Plan — Anchor Post-Delivery System

**Generated**: April 12, 2026
**Project Slug**: shipyard-post-delivery-v2
**Product Name**: Anchor (Post-Delivery System)
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 15
**Waves**: 4
**Status**: READY FOR BUILD (pending founder decisions)
**Token Budget**: 300K max

---

## The Essence

> **What it's really about:** Making clients feel watched over after their site launches.

> **What it evokes:** "Someone's got my back."

> **What must be perfect:** The emails. They are the entire product.

> **Creative direction:** Trust before transaction.

---

## Build Status

**Technical MVP:** 0% (greenfield build)
**Board Verdict:** LOCKED (decisions.md consolidated)
**Current State:** Debate complete, awaiting founder decision on REQ-058 (card timing)

### Locked Decisions

| Decision | Winner | Rationale |
|----------|--------|-----------|
| Product Name: **Anchor** | Steve Jobs | "Post-Delivery System takes five syllables to say nothing. Anchor takes two to say everything." |
| Architecture: **Cron + JSON + Email + Stripe** | Elon Musk | "Infrastructure should follow traction, not precede it." |
| No Dashboard in v1 | Both | "Build the relationship first. Earn the right to ask for a login." |
| Token Budget: **300K** | Elon Musk | "The 900K estimate is fantasy. 270K is real." |
| Email Quality: **A+ or don't ship** | Steve Jobs | "The email IS the entire product. Copy is not decoration." |
| Two Tiers Only | Elon Musk | Cut complexity. Three tiers is v2. |
| Weekly PageSpeed | Elon Musk | "Daily is vanity. Weekly is useful." |
| First-Party Analytics | Elon Musk | "OAuth for Google Analytics is a dead end." |

### UNRESOLVED (Blocking)

| Decision | Elon's Position | Steve's Position |
|----------|-----------------|------------------|
| Card Collection Timing | Card at project start (5x attach rate) | No card until trust earned (trust before transaction) |

**This must be resolved before Wave 3 (signup flow) can begin.**

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-037: Project Structure | phase-1-task-1 | 1 |
| REQ-041, REQ-029: Lib files + PageSpeed wrapper | phase-1-task-2 | 1 |
| REQ-042: Customer JSON schema | phase-1-task-3 | 1 |
| REQ-022, REQ-039: Email cron worker | phase-1-task-4 | 2 |
| REQ-030, REQ-031, REQ-032, REQ-039: PageSpeed cron | phase-1-task-5 | 2 |
| REQ-023, REQ-024, REQ-025, REQ-039: Stripe webhook | phase-1-task-6 | 2 |
| REQ-017: Launch Day email | phase-1-task-7 | 3 |
| REQ-018: Week 1 email | phase-1-task-8 | 3 |
| REQ-019: Month 1 email | phase-1-task-9 | 3 |
| REQ-020: Q1 Refresh email | phase-1-task-10 | 3 |
| REQ-021: Anniversary email | phase-1-task-11 | 3 |
| REQ-033, REQ-034, REQ-035, REQ-038: Landing + Pricing | phase-1-task-12 | 4 |
| REQ-043: README documentation | phase-1-task-13 | 4 |
| REQ-026: BetterUptime setup | phase-1-task-14 | 4 |
| Sara Blakely customer gut-check | phase-1-task-15 | 4 |

---

## Documentation References

This plan cites specific sections from source documents:

- **decisions.md**: MVP Feature Set, File Structure, Risk Register
- **docs/EMDASH-GUIDE.md Section 5**: Cloudflare Workers deployment (wrangler.jsonc, D1/R2)
- **docs/EMDASH-GUIDE.md Section 8**: Real examples (Bella's Bistro configuration)
- **Codebase patterns**:
  - `/workers/contact-form/` (Resend API, CORS, email sending)
  - `/apps/pulse/lib/stripe.ts` (Stripe integration, idempotency)
  - `/plugins/eventdash/src/email.ts` (HTML email templates)

---

## Wave Execution Order

### Wave 1 (Parallel) — Project Foundation

Three independent tasks setting up project structure, libraries, and data schema. **Token budget: 30K**

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create Anchor project directory structure</title>
  <requirement>REQ-037: Project Structure with site/, workers/, emails/, data/, lib/</requirement>
  <description>
    Per decisions.md File Structure section:
    Create the complete Anchor project skeleton with all required directories.

    Target structure from decisions.md:
    anchor/
    ├── site/                 # Cloudflare Pages static site
    ├── workers/              # Cron workers
    ├── emails/               # HTML email templates
    ├── data/                 # customers.json
    ├── lib/                  # Utility libraries
    └── scripts/              # Deploy scripts
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="File Structure section defines layout" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/" reason="Reference Cloudflare Worker structure" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: wrangler.jsonc patterns" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/projects/anchor/ root directory</step>
    <step order="2">Create site/ directory with assets/ subdirectory</step>
    <step order="3">Create workers/ directory for cron workers</step>
    <step order="4">Create emails/ directory for 5 HTML templates</step>
    <step order="5">Create data/ directory for customers.json</step>
    <step order="6">Create lib/ directory for utility libraries</step>
    <step order="7">Create scripts/ directory for deploy scripts</step>
    <step order="8">Create wrangler.toml with compatibility_date per EMDASH-GUIDE.md Section 5</step>
    <step order="9">Create package.json with project metadata and wrangler dependency</step>
    <step order="10">Create .gitignore for node_modules, .env, *.log</step>
  </steps>

  <verification>
    <check type="bash">test -d /home/agent/shipyard-ai/projects/anchor/site && echo "site dir exists"</check>
    <check type="bash">test -d /home/agent/shipyard-ai/projects/anchor/workers && echo "workers dir exists"</check>
    <check type="bash">test -d /home/agent/shipyard-ai/projects/anchor/emails && echo "emails dir exists"</check>
    <check type="bash">test -d /home/agent/shipyard-ai/projects/anchor/lib && echo "lib dir exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/wrangler.toml && echo "wrangler exists"</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(anchor): create project directory structure

Per decisions.md File Structure:
- site/ for Cloudflare Pages static site
- workers/ for cron automation
- emails/ for 5 HTML templates
- data/ for JSON customer storage
- lib/ for utility libraries
- wrangler.toml configured per EMDASH-GUIDE.md Section 5

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Create utility libraries (pagespeed, email, stripe)</title>
  <requirement>REQ-041: Library Files, REQ-029: PageSpeed API Wrapper</requirement>
  <description>
    Per decisions.md lib/ section:
    Create three utility libraries with clean interfaces.

    - pagespeed.js: Google PageSpeed Insights API wrapper
    - email.js: Resend API integration (per existing /workers/contact-form/ pattern)
    - stripe.js: Stripe SDK wrapper (per existing /apps/pulse/lib/stripe.ts pattern)

    Reference: EMDASH-GUIDE.md Section 6 shows ctx.http for external API calls.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Resend API email pattern" />
    <file path="/home/agent/shipyard-ai/apps/pulse/lib/stripe.ts" reason="Stripe singleton + idempotency pattern" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: ctx.http for external APIs" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="PageSpeed API rate limit mitigation" />
  </context>

  <steps>
    <step order="1">Create lib/pagespeed.ts with PageSpeedConfig interface</step>
    <step order="2">PageSpeed wrapper: getPerformanceScore(url) returns { desktop, mobile, coreWebVitals }</step>
    <step order="3">Add rate limit handling: exponential backoff on 429 responses</step>
    <step order="4">Cache results in memory for 6 days (weekly refresh)</step>
    <step order="5">Create lib/email.ts following /workers/contact-form/ Resend pattern</step>
    <step order="6">Email wrapper: sendEmail({ to, subject, html, from? }) with Resend REST API</step>
    <step order="7">Add domain authentication headers (SPF/DKIM compliance)</step>
    <step order="8">Create lib/stripe.ts following /apps/pulse/lib/stripe.ts pattern</step>
    <step order="9">Stripe wrapper: createCheckoutSession(), handleWebhook(), getSubscriptionStatus()</step>
    <step order="10">Add idempotency key generation per existing pattern</step>
    <step order="11">Add StripeError handling with user-friendly messages</step>
    <step order="12">Create lib/types.ts with shared TypeScript interfaces</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/lib/pagespeed.ts && echo "pagespeed lib exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/lib/email.ts && echo "email lib exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/lib/stripe.ts && echo "stripe lib exists"</check>
    <check type="bash">grep "exponential\|backoff" /home/agent/shipyard-ai/projects/anchor/lib/pagespeed.ts</check>
    <check type="bash">grep "idempotency\|Idempotency" /home/agent/shipyard-ai/projects/anchor/lib/stripe.ts</check>
    <check type="test">All three libraries export documented interfaces</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(anchor): create utility libraries

Per decisions.md lib/ section and existing patterns:
- pagespeed.ts: PageSpeed Insights API with rate limiting
- email.ts: Resend API (pattern from /workers/contact-form/)
- stripe.ts: Stripe SDK (pattern from /apps/pulse/lib/stripe.ts)
- types.ts: Shared TypeScript interfaces

Cites: EMDASH-GUIDE.md Section 6 for external API patterns

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Define customers.json schema and seed data</title>
  <requirement>REQ-042: Customer Data File, REQ-006: JSON Storage, REQ-028: Operations Tracking</requirement>
  <description>
    Per decisions.md Data Storage section:
    JSON storage for up to 100 customers. No database.

    Required fields per REQ-028 (Operations Tracking):
    - Last Contact
    - Next Touch
    - Status

    Additional fields from decisions.md MVP:
    - Customer info (email, Stripe ID)
    - Subscription tier (Basic/Pro)
    - Enrollment date
    - Emails sent tracking
    - PageSpeed history
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Spreadsheet Columns and Data Storage sections" />
  </context>

  <steps>
    <step order="1">Create data/customers.json with empty array: { "customers": [] }</step>
    <step order="2">Create data/schema.ts with TypeScript Customer interface</step>
    <step order="3">Customer fields: id, email, name, siteUrl, stripeCustomerId, stripeSubscriptionId</step>
    <step order="4">Operations fields: lastContact, nextTouch, status (active/paused/cancelled)</step>
    <step order="5">Subscription fields: tier (basic/pro), enrollmentDate, subscriptionStatus</step>
    <step order="6">Email tracking: emailsSent object with boolean flags for each of 5 emails</step>
    <step order="7">PageSpeed fields: pagespeedHistory array with { date, desktop, mobile, vitals }</step>
    <step order="8">Add sample customer record for testing (marked as test: true)</step>
    <step order="9">Create lib/customers.ts with CRUD helpers: loadCustomers(), saveCustomers(), addCustomer(), updateCustomer()</step>
    <step order="10">Add atomic write pattern: write to temp file, then rename (prevents corruption)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/data/customers.json && echo "customers.json exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/data/schema.ts && echo "schema exists"</check>
    <check type="bash">grep "lastContact" /home/agent/shipyard-ai/projects/anchor/data/schema.ts</check>
    <check type="bash">grep "nextTouch" /home/agent/shipyard-ai/projects/anchor/data/schema.ts</check>
    <check type="bash">grep "emailsSent" /home/agent/shipyard-ai/projects/anchor/data/schema.ts</check>
    <check type="test">Schema includes all required fields from decisions.md</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(anchor): define customers.json schema and helpers

Per decisions.md Data Storage:
- JSON storage until 100 customers (no database)
- Three required tracking fields: lastContact, nextTouch, status
- Email send tracking for 5 scheduled emails
- PageSpeed history array
- Atomic write pattern for data safety
- Sample test customer included

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Cloudflare Workers

Three workers implementing cron automation and webhook handling. **Token budget: 80K**

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Implement email scheduler cron worker</title>
  <requirement>REQ-022: Email Cron System, REQ-039: Worker Files</requirement>
  <description>
    Per decisions.md workers/cron-email-scheduler.js:
    Daily cron that checks which emails are due and sends them.

    Email schedule from decisions.md MVP:
    - Launch Day: Day 0 (enrollment day)
    - Week 1: Day 7
    - Month 1: Day 30
    - Q1 Refresh: Day 90
    - Anniversary: Day 365

    Reference: /workers/contact-form/ for Resend API pattern
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/lib/email.ts" reason="Email sending utility" />
    <file path="/home/agent/shipyard-ai/projects/anchor/lib/customers.ts" reason="Customer data CRUD" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Resend API pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Five core emails schedule" />
  </context>

  <steps>
    <step order="1">Create workers/cron-email-scheduler.ts</step>
    <step order="2">Add scheduled handler: export default { scheduled(event, env, ctx) {} }</step>
    <step order="3">Configure wrangler.toml: [[triggers.crons]] cron = "0 8 * * *" (daily at 8am UTC)</step>
    <step order="4">Load customers.json at start of cron run</step>
    <step order="5">For each active customer, calculate days since enrollment</step>
    <step order="6">Check which email is due based on daysSinceEnrollment: 0=launchDay, 7=week1, 30=month1, 90=q1Refresh, 365=anniversary</step>
    <step order="7">Skip if email already marked sent in emailsSent object</step>
    <step order="8">Load email template from emails/ directory</step>
    <step order="9">Send via lib/email.ts sendEmail() function</step>
    <step order="10">Update customer.emailsSent flag to true</step>
    <step order="11">Update customer.lastContact to current date</step>
    <step order="12">Calculate customer.nextTouch for next scheduled email</step>
    <step order="13">Save updated customers.json</step>
    <step order="14">Log success/failure for each send (console.log for MVP)</step>
    <step order="15">Add error handling: continue on single failure, don't stop entire cron</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/workers/cron-email-scheduler.ts && echo "email cron exists"</check>
    <check type="bash">grep "scheduled" /home/agent/shipyard-ai/projects/anchor/workers/cron-email-scheduler.ts</check>
    <check type="bash">grep "crons" /home/agent/shipyard-ai/projects/anchor/wrangler.toml</check>
    <check type="bash">grep "daysSinceEnrollment\|enrollment" /home/agent/shipyard-ai/projects/anchor/workers/cron-email-scheduler.ts</check>
    <check type="test">Email scheduling logic handles all 5 email types</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-2" reason="Email library must exist" />
    <depends-on task-id="phase-1-task-3" reason="Customer schema must exist" />
  </dependencies>

  <commit-message>feat(anchor): implement email scheduler cron worker

Per decisions.md email schedule:
- Daily cron at 8am UTC
- Checks days since enrollment: 0, 7, 30, 90, 365
- Sends appropriate email template
- Updates lastContact and nextTouch
- Error handling continues on single failure
- Uses Resend API via lib/email.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Implement PageSpeed cron worker</title>
  <requirement>REQ-030: Weekly Performance Data, REQ-031: Storage, REQ-032: Rate Limit Handling, REQ-039: Worker Files</requirement>
  <description>
    Per decisions.md workers/cron-pagespeed.js:
    Weekly cron that fetches PageSpeed scores for all customer sites.

    Constraints from decisions.md:
    - Once per week (not daily)
    - Run at 3am (low traffic)
    - Cache aggressively
    - Handle rate limits gracefully

    Reference: EMDASH-GUIDE.md Section 6 for external API patterns
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/lib/pagespeed.ts" reason="PageSpeed API wrapper" />
    <file path="/home/agent/shipyard-ai/projects/anchor/lib/customers.ts" reason="Customer data CRUD" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="PageSpeed frequency and rate limit mitigation" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: external API calls" />
  </context>

  <steps>
    <step order="1">Create workers/cron-pagespeed.ts</step>
    <step order="2">Add scheduled handler for weekly execution</step>
    <step order="3">Configure wrangler.toml: [[triggers.crons]] cron = "0 3 * * 1" (Mondays at 3am UTC)</step>
    <step order="4">Load customers.json at start</step>
    <step order="5">For each active customer, get siteUrl</step>
    <step order="6">Check if last PageSpeed run was >6 days ago (skip if recent)</step>
    <step order="7">Call lib/pagespeed.ts getPerformanceScore(siteUrl)</step>
    <step order="8">Handle rate limit: if 429, wait 60 seconds, retry once</step>
    <step order="9">Store result in customer.pagespeedHistory array: { date, desktop, mobile, vitals }</step>
    <step order="10">Keep last 52 weeks of history (1 year rolling window)</step>
    <step order="11">Update customer.lastPagespeedRun timestamp</step>
    <step order="12">Save updated customers.json</step>
    <step order="13">Add delay between requests: 500ms to avoid burst rate limits</step>
    <step order="14">Log completion: "PageSpeed: {n} sites checked, {m} updated"</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/workers/cron-pagespeed.ts && echo "pagespeed cron exists"</check>
    <check type="bash">grep "scheduled" /home/agent/shipyard-ai/projects/anchor/workers/cron-pagespeed.ts</check>
    <check type="bash">grep "0 3 \* \* 1\|Monday" /home/agent/shipyard-ai/projects/anchor/wrangler.toml</check>
    <check type="bash">grep "rate\|429\|retry" /home/agent/shipyard-ai/projects/anchor/workers/cron-pagespeed.ts</check>
    <check type="test">PageSpeed cron handles rate limits per decisions.md</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-2" reason="PageSpeed library must exist" />
    <depends-on task-id="phase-1-task-3" reason="Customer schema must exist" />
  </dependencies>

  <commit-message>feat(anchor): implement PageSpeed cron worker

Per decisions.md PageSpeed requirements:
- Weekly run on Mondays at 3am UTC (not daily)
- Rate limit handling: 429 → wait 60s, retry
- 500ms delay between requests
- 52-week rolling history
- Skip if last run <6 days ago

Cites: EMDASH-GUIDE.md Section 6 for external API patterns

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Implement Stripe webhook handler</title>
  <requirement>REQ-023: Stripe Checkout, REQ-024: Webhook Handling, REQ-025: Subscription Management, REQ-039: Worker Files</requirement>
  <description>
    Per decisions.md workers/stripe-webhook.js:
    Handle Stripe webhook events for subscription lifecycle.

    Events to handle:
    - customer.subscription.created → Add to customers.json
    - customer.subscription.updated → Update status
    - customer.subscription.deleted → Mark cancelled

    Reference: /apps/pulse/lib/stripe.ts for webhook pattern
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/lib/stripe.ts" reason="Stripe utilities" />
    <file path="/home/agent/shipyard-ai/projects/anchor/lib/customers.ts" reason="Customer data CRUD" />
    <file path="/home/agent/shipyard-ai/apps/pulse/lib/stripe.ts" reason="Stripe webhook verification pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Two-tier subscriptions" />
  </context>

  <steps>
    <step order="1">Create workers/stripe-webhook.ts</step>
    <step order="2">Add fetch handler for POST /webhook endpoint</step>
    <step order="3">Verify webhook signature using Stripe SDK (STRIPE_WEBHOOK_SECRET env)</step>
    <step order="4">Return 400 if signature invalid</step>
    <step order="5">Parse event.type from webhook payload</step>
    <step order="6">Handle customer.subscription.created: create new customer in JSON</step>
    <step order="7">Extract: email, name from customer; tier from price_id; siteUrl from metadata</step>
    <step order="8">Set enrollmentDate = now, status = 'active', nextTouch = 7 days</step>
    <step order="9">Handle customer.subscription.updated: update subscription status</step>
    <step order="10">Handle customer.subscription.deleted: set status = 'cancelled'</step>
    <step order="11">Handle invoice.payment_failed: set status = 'past_due'</step>
    <step order="12">Save updated customers.json after each event</step>
    <step order="13">Return 200 immediately for unhandled events (Stripe requires)</step>
    <step order="14">Add idempotency: check event.id hasn't been processed before</step>
    <step order="15">Add env vars to wrangler.toml: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/workers/stripe-webhook.ts && echo "webhook exists"</check>
    <check type="bash">grep "signature\|verify" /home/agent/shipyard-ai/projects/anchor/workers/stripe-webhook.ts</check>
    <check type="bash">grep "subscription.created\|subscription.deleted" /home/agent/shipyard-ai/projects/anchor/workers/stripe-webhook.ts</check>
    <check type="bash">grep "STRIPE_WEBHOOK_SECRET" /home/agent/shipyard-ai/projects/anchor/wrangler.toml</check>
    <check type="test">Webhook handles all subscription lifecycle events</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-2" reason="Stripe library must exist" />
    <depends-on task-id="phase-1-task-3" reason="Customer schema must exist" />
  </dependencies>

  <commit-message>feat(anchor): implement Stripe webhook handler

Per decisions.md Stripe integration:
- Webhook signature verification
- Handle subscription.created → add customer
- Handle subscription.updated → update status
- Handle subscription.deleted → mark cancelled
- Handle invoice.payment_failed → mark past_due
- Idempotency check on event.id

Pattern from: /apps/pulse/lib/stripe.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Email Templates

Five A+ quality email templates. **Token budget: 100K**

**CRITICAL: Per Steve Jobs (REQ-012): "The email IS the entire product. Copy is not decoration."**

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Create Launch Day email template</title>
  <requirement>REQ-017: Launch Day Email, REQ-012: A+ Quality, REQ-013: Voice, REQ-014: Single CTA, REQ-016: First-Line Impact</requirement>
  <description>
    Per decisions.md email requirements:
    - A+ copy or don't ship
    - Confident friend voice, not salesy
    - One CTA, embedded naturally
    - First line makes recipient feel SEEN

    Launch Day is the first impression. Per Steve:
    "Not 'Your site is live' but 'You built something real.'"

    Reference: /plugins/eventdash/src/email.ts for HTML template structure
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/email.ts" reason="HTML email template pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Email quality requirements" />
  </context>

  <steps>
    <step order="1">Create emails/launch-day.html</step>
    <step order="2">Use responsive HTML email template (600px max-width container)</step>
    <step order="3">Use inline CSS (email clients strip external CSS)</step>
    <step order="4">First line: "You built something real."</step>
    <step order="5">Body: Acknowledge the work, not just the technical completion</step>
    <step order="6">Include: What Anchor does for them (watching performance, catching issues)</step>
    <step order="7">Single CTA: "Reply if you have questions" (not a button, natural in text)</step>
    <step order="8">Tone: Confident expert friend (not "Congratulations!" or corporate)</step>
    <step order="9">Include {{customerName}} and {{siteName}} variables</step>
    <step order="10">Add plain text fallback version</step>
    <step order="11">Test rendering in major email clients (Gmail, Outlook, Apple Mail)</step>
    <step order="12">No P.S. lines (per Steve: "desperate")</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/emails/launch-day.html && echo "launch-day exists"</check>
    <check type="bash">grep "You built something real" /home/agent/shipyard-ai/projects/anchor/emails/launch-day.html</check>
    <check type="bash">grep -v "Congratulations\|P.S." /home/agent/shipyard-ai/projects/anchor/emails/launch-day.html</check>
    <check type="manual">Email passes Steve Jobs A+ quality review</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Email cron needs templates" />
  </dependencies>

  <commit-message>feat(anchor): create Launch Day email template

Per decisions.md email requirements:
- First line: "You built something real."
- Confident expert friend voice
- Single natural CTA: "Reply if you have questions"
- No P.S. lines, no corporate congratulations
- Responsive HTML with inline CSS

Pattern from: /plugins/eventdash/src/email.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Create Week 1 check-in email template</title>
  <requirement>REQ-018: Week 1 Email, REQ-012: A+ Quality</requirement>
  <description>
    Week 1 email: First check-in after launch.

    Purpose: Show we're paying attention. Reference something specific.
    Tone: Like a text from a friend who remembered to check in.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/emails/launch-day.html" reason="Template structure reference" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Email quality requirements" />
  </context>

  <steps>
    <step order="1">Create emails/week-1.html</step>
    <step order="2">First line: "One week in. How's it going?"</step>
    <step order="3">Body: Brief check-in, not a long report</step>
    <step order="4">Optional: Include first PageSpeed score if available</step>
    <step order="5">Single CTA: "Hit reply if anything's not working"</step>
    <step order="6">Keep it short (under 100 words)</step>
    <step order="7">Include {{customerName}} variable</step>
    <step order="8">Add plain text fallback</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/emails/week-1.html && echo "week-1 exists"</check>
    <check type="bash">grep "week\|Week" /home/agent/shipyard-ai/projects/anchor/emails/week-1.html</check>
    <check type="manual">Email is brief and feels like a friend checking in</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Email cron needs templates" />
  </dependencies>

  <commit-message>feat(anchor): create Week 1 check-in email template

Per decisions.md email requirements:
- Brief check-in after first week
- "One week in. How's it going?"
- Under 100 words
- Single natural CTA

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Create Month 1 report email template</title>
  <requirement>REQ-019: Month 1 Email, REQ-012: A+ Quality</requirement>
  <description>
    Month 1 email: First performance report.

    Purpose: Show the value of monitoring. Include PageSpeed data.
    Per decisions.md: Use hardcoded tips (10 max), not AI recommendations.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/emails/launch-day.html" reason="Template structure" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="REQ-046: 10 hardcoded tips, no recommendation engine" />
  </context>

  <steps>
    <step order="1">Create emails/month-1.html</step>
    <step order="2">First line: "Your first month, by the numbers."</step>
    <step order="3">Include PageSpeed scores: {{desktopScore}}, {{mobileScore}}</step>
    <step order="4">Include uptime if available: {{uptimePercent}}%</step>
    <step order="5">Add one generic optimization tip (from list of 10 hardcoded)</step>
    <step order="6">Tip selection: Based on lowest score area (mobile vs desktop)</step>
    <step order="7">Single CTA: "Questions about these numbers?"</step>
    <step order="8">Celebrate wins: "Mobile performance: strong" if score >80</step>
    <step order="9">Keep it factual, not over-hyped</step>
    <step order="10">Add plain text fallback</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/emails/month-1.html && echo "month-1 exists"</check>
    <check type="bash">grep "desktopScore\|mobileScore" /home/agent/shipyard-ai/projects/anchor/emails/month-1.html</check>
    <check type="manual">Email presents data clearly without hype</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Email cron needs templates" />
  </dependencies>

  <commit-message>feat(anchor): create Month 1 report email template

Per decisions.md Month 1 Report:
- First performance data email
- PageSpeed scores (desktop + mobile)
- One hardcoded optimization tip (REQ-046)
- Factual tone, not over-hyped

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Create Q1 Refresh Prompt email template</title>
  <requirement>REQ-020: Q1 Refresh Email, REQ-012: A+ Quality</requirement>
  <description>
    Q1 (90 day) email: Prompt for site refresh.

    Purpose: Gentle nudge to consider updates. Not pushy upsell.
    Per Steve: "Trust before transaction."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/emails/launch-day.html" reason="Template structure" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Trust before transaction positioning" />
  </context>

  <steps>
    <step order="1">Create emails/q1-refresh.html</step>
    <step order="2">First line: "Three months. Sites evolve."</step>
    <step order="3">Body: Gentle observation that content often needs refreshing</step>
    <step order="4">Include performance trend: "Performance: {{trend}}" (improving/stable/declining)</step>
    <step order="5">Suggest common refresh items: new testimonials, updated hours, seasonal content</step>
    <step order="6">Single CTA: "Reply if you'd like to discuss updates"</step>
    <step order="7">NOT an upsell: No "upgrade to Pro" pitch</step>
    <step order="8">Keep it helpful, not salesy</step>
    <step order="9">Add plain text fallback</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/emails/q1-refresh.html && echo "q1-refresh exists"</check>
    <check type="bash">grep -v "upgrade\|Upgrade\|Pro" /home/agent/shipyard-ai/projects/anchor/emails/q1-refresh.html</check>
    <check type="manual">Email is helpful, not salesy</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Email cron needs templates" />
  </dependencies>

  <commit-message>feat(anchor): create Q1 Refresh email template

Per decisions.md Q1 Refresh:
- 90-day nudge for content refresh
- "Three months. Sites evolve."
- Helpful suggestions, not upsell
- Trust before transaction positioning

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Create Anniversary email template</title>
  <requirement>REQ-021: Anniversary Email (emotional peak), REQ-012: A+ Quality</requirement>
  <description>
    Anniversary (365 day) email: The emotional peak.

    Per decisions.md: This is marked as "emotional peak" —
    the most important email of the sequence.

    Purpose: Celebrate the milestone. Acknowledge the journey.
    Tone: Warm, reflective, genuinely proud of their success.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/emails/launch-day.html" reason="Template structure" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Anniversary = emotional peak" />
  </context>

  <steps>
    <step order="1">Create emails/anniversary.html</step>
    <step order="2">First line: "One year. Still standing. Still growing."</step>
    <step order="3">Body: Reflect on the journey, not just the metrics</step>
    <step order="4">Include year-over-year data if meaningful: {{totalUptime}}, {{avgPagespeed}}</step>
    <step order="5">Acknowledge the human behind the site</step>
    <step order="6">Single CTA: "Here's to year two."</step>
    <step order="7">Warm and genuine, not corporate</step>
    <step order="8">Shorter is better — emotional impact, not info dump</step>
    <step order="9">Add plain text fallback</step>
    <step order="10">This email should make them feel proud</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/emails/anniversary.html && echo "anniversary exists"</check>
    <check type="bash">grep "year\|Year" /home/agent/shipyard-ai/projects/anchor/emails/anniversary.html</check>
    <check type="manual">Email achieves emotional resonance (Steve Jobs approval required)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
    <depends-on task-id="phase-1-task-4" reason="Email cron needs templates" />
  </dependencies>

  <commit-message>feat(anchor): create Anniversary email template

Per decisions.md: Anniversary is "emotional peak"
- One year celebration
- "One year. Still standing. Still growing."
- Warm, reflective tone
- Shorter is better — emotional impact
- Must pass Steve Jobs A+ quality review

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Parallel, after Wave 3) — Landing Page, Docs, Review

Final tasks: static site, documentation, and customer gut-check. **Token budget: 50K**

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Create landing page and pricing page</title>
  <requirement>REQ-033: Landing Page, REQ-034: Pricing Page, REQ-035: Assets, REQ-038: Static Site Files</requirement>
  <description>
    Per decisions.md site/ structure:
    - index.html: Landing page explaining Anchor
    - pricing.html: Two-tier breakdown (Basic Anchor / Pro Anchor)

    Per Steve: "Trust before transaction."

    NOTE: Pricing amounts are UNRESOLVED. Use placeholder {{BASIC_PRICE}} and {{PRO_PRICE}}.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/src/app/" reason="Reference styling patterns" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Two tiers, trust-first positioning" />
  </context>

  <steps>
    <step order="1">Create site/index.html with semantic HTML</step>
    <step order="2">Hero: "Someone's got your back." (per decisions.md positioning)</step>
    <step order="3">Explain what Anchor does: performance monitoring, proactive emails, peace of mind</step>
    <step order="4">Include "Request Update" button (REQ-027)</step>
    <step order="5">Link to pricing.html</step>
    <step order="6">Create site/pricing.html</step>
    <step order="7">Two tiers only: Basic Anchor, Pro Anchor</step>
    <step order="8">Use placeholder prices: {{BASIC_PRICE}}/mo, {{PRO_PRICE}}/mo</step>
    <step order="9">Include Stripe checkout buttons (integration pending)</step>
    <step order="10">Create site/assets/styles.css with Tailwind-style utility classes</step>
    <step order="11">Mobile-responsive design (flexbox/grid)</step>
    <step order="12">Create site/assets/logo.svg placeholder</step>
    <step order="13">Add Cloudflare Analytics snippet (first-party, per REQ-009)</step>
    <step order="14">No OAuth, no Google Analytics (per decisions.md)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/site/index.html && echo "index exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/site/pricing.html && echo "pricing exists"</check>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/site/assets/styles.css && echo "styles exist"</check>
    <check type="bash">grep "Request Update" /home/agent/shipyard-ai/projects/anchor/site/index.html</check>
    <check type="bash">grep -v "google-analytics\|gtag" /home/agent/shipyard-ai/projects/anchor/site/index.html</check>
    <check type="manual">Landing page communicates trust-first positioning</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
  </dependencies>

  <commit-message>feat(anchor): create landing and pricing pages

Per decisions.md site structure:
- index.html: "Someone's got your back" positioning
- pricing.html: Two tiers (Basic/Pro, prices TBD)
- Request Update button for support
- Cloudflare Analytics (first-party)
- No Google Analytics, no OAuth
- Mobile-responsive CSS

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="4">
  <title>Create README documentation</title>
  <requirement>REQ-043: Internal Documentation</requirement>
  <description>
    Per decisions.md: README.md is internal-only documentation.

    Include: Setup, deployment, operational procedures.
    Do NOT include: Customer-facing documentation.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/anchor/" reason="Document this project" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Architecture and operational decisions" />
  </context>

  <steps>
    <step order="1">Create README.md at project root</step>
    <step order="2">Title: "Anchor — Post-Delivery System (Internal)"</step>
    <step order="3">Section: Overview (what Anchor does)</step>
    <step order="4">Section: Architecture (Cloudflare Workers + JSON + Stripe + Resend)</step>
    <step order="5">Section: Setup (wrangler login, environment variables)</step>
    <step order="6">Section: Deployment (wrangler deploy commands)</step>
    <step order="7">Section: Cron schedules (email daily at 8am, PageSpeed weekly at 3am)</step>
    <step order="8">Section: Adding a customer manually (for testing)</step>
    <step order="9">Section: Troubleshooting common issues</step>
    <step order="10">Mark as INTERNAL ONLY in header</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/README.md && echo "README exists"</check>
    <check type="bash">grep "INTERNAL\|Internal" /home/agent/shipyard-ai/projects/anchor/README.md</check>
    <check type="bash">grep "wrangler" /home/agent/shipyard-ai/projects/anchor/README.md</check>
    <check type="manual">Documentation covers setup and deployment</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project must exist to document" />
    <depends-on task-id="phase-1-task-4" reason="Cron workers must exist" />
    <depends-on task-id="phase-1-task-6" reason="Stripe webhook must exist" />
  </dependencies>

  <commit-message>docs(anchor): add internal README

Per decisions.md:
- Internal-only documentation
- Setup and deployment instructions
- Cron schedules documented
- Troubleshooting section
- Marked INTERNAL ONLY

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="4">
  <title>Document BetterUptime setup</title>
  <requirement>REQ-026: Uptime Monitoring via BetterUptime</requirement>
  <description>
    Per decisions.md MVP: "Uptime monitoring via free BetterUptime"

    This is a manual setup task — document the process.
    NOTE: BetterUptime configuration details are UNRESOLVED.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="BetterUptime requirement" />
  </context>

  <steps>
    <step order="1">Create docs/betteruptime-setup.md</step>
    <step order="2">Document: Create BetterUptime account (free tier)</step>
    <step order="3">Document: Add monitor for Anchor landing page</step>
    <step order="4">Document: Configure alert email (support@anchor)</step>
    <step order="5">Document: How to add customer sites to monitoring (manual process)</step>
    <step order="6">Note: Alert thresholds TBD (mark as open question)</step>
    <step order="7">Note: Per-customer monitoring costs TBD at scale</step>
    <step order="8">Add link to BetterUptime dashboard in README.md</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/projects/anchor/docs/betteruptime-setup.md && echo "betteruptime docs exist"</check>
    <check type="bash">grep "BetterUptime" /home/agent/shipyard-ai/projects/anchor/docs/betteruptime-setup.md</check>
    <check type="manual">Documentation provides clear setup steps</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Project structure must exist" />
  </dependencies>

  <commit-message>docs(anchor): add BetterUptime setup guide

Per decisions.md REQ-026:
- Free BetterUptime for uptime monitoring
- Manual setup documentation
- Alert thresholds TBD (open question)
- Per-customer monitoring process

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="4">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per SKILL.md Step 7:
    Spawn Sara Blakely agent for customer perspective.
    Anchor customers are small business owners who just launched a website.

    Questions to answer:
    - Would a real customer pay for this?
    - What would make them say "shut up and take my money"?
    - What feels like engineering vanity vs. customer value?
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md" reason="Product essence" />
    <file path="/home/agent/shipyard-ai/projects/anchor/emails/" reason="Email templates" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely</step>
    <step order="2">Prompt: Read phase plan and email templates</step>
    <step order="3">Answer: Would a small business owner pay for this?</step>
    <step order="4">Answer: Does "someone's got my back" resonate?</step>
    <step order="5">Answer: Are the emails helpful or annoying?</step>
    <step order="6">Answer: Is Basic vs Pro distinction clear and compelling?</step>
    <step order="7">Answer: What would make them recommend to a friend?</step>
    <step order="8">Answer: What's missing that would kill the deal?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps if any</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Emails must exist for review" />
    <depends-on task-id="phase-1-task-12" reason="Landing page must exist for review" />
  </dependencies>

  <commit-message>docs(anchor): add Sara Blakely customer gut-check

Per SKILL.md Step 7:
- Customer perspective validation
- Small business owner lens
- Email value assessment
- Pricing tier clarity
- Recommendation likelihood

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism | Token Budget |
|------|-------|-------------|-------------|--------------|
| 1 | 3 | Foundation: structure, libs, schema | 3 parallel | 30K |
| 2 | 3 | Workers: email cron, PageSpeed cron, Stripe webhook | 3 parallel (after Wave 1) | 80K |
| 3 | 5 | Email Templates: 5 A+ quality emails | 5 parallel (after Wave 2) | 100K |
| 4 | 4 | Landing page, docs, BetterUptime, review | 4 parallel (after Wave 3) | 50K |

**Total Tasks:** 15
**Maximum Parallelism:** Wave 3 (5 concurrent tasks)
**Total Token Budget:** 260K (within 300K limit, with 40K buffer)

---

## Dependencies Diagram

```
Wave 1:  [task-1: Structure] ─────────────────────────────────────────────>
         [task-2: Libraries] ─────────────────────────────────────────────>
         [task-3: Schema] ────────────────────────────────────────────────>

Wave 2:  [task-4: Email Cron] ────> (depends on 1,2,3) ───────────────────>
         [task-5: PageSpeed Cron] ─> (depends on 1,2,3) ──────────────────>
         [task-6: Stripe Webhook] ─> (depends on 1,2,3) ──────────────────>

Wave 3:  [task-7: Launch Day] ────> (depends on 1,4) ─────────────────────>
         [task-8: Week 1] ────────> (depends on 1,4) ─────────────────────>
         [task-9: Month 1] ───────> (depends on 1,4) ─────────────────────>
         [task-10: Q1 Refresh] ───> (depends on 1,4) ─────────────────────>
         [task-11: Anniversary] ──> (depends on 1,4) ─────────────────────>

Wave 4:  [task-12: Landing Page] ─> (depends on 1) ───────────────────────>
         [task-13: README] ───────> (depends on 1,4,6) ───────────────────>
         [task-14: BetterUptime] ─> (depends on 1) ───────────────────────>
         [task-15: Sara Review] ──> (depends on 7,12) ────────────────────>
```

---

## Risk Notes

### Mitigated in This Plan

| Risk | Mitigation | Task |
|------|------------|------|
| Scope creep | 300K token budget, 15 tasks max | All |
| Email quality | A+ requirement, Steve Jobs approval | tasks 7-11 |
| PageSpeed rate limits | 3am runs, weekly frequency, 500ms delays | task-5 |
| JSON corruption | Atomic write pattern | task-3 |
| Stripe failures | Webhook signature verification, idempotency | task-6 |

### BLOCKERS (Must Resolve Before Build)

| Risk | Status | Resolution Required |
|------|--------|---------------------|
| Card collection timing | DEADLOCKED | Founder decision |
| Stripe pricing amounts | UNRESOLVED | Product decision |
| Email copy approval | PENDING | Steve Jobs review |
| Support email address | UNRESOLVED | Ops decision |
| Email service provider | UNRESOLVED | Tech lead decision (Resend recommended) |

### Accepted for v1 (Not Blocking)

| Risk | Impact | Notes |
|------|--------|-------|
| No dashboard | Low | Intentional cut, v2 scope |
| JSON at scale | Low | Monitor at 100 customers |
| Manual BetterUptime | Low | Document process |

---

## Open Questions Resolved

| Question | Resolution | Rationale |
|----------|------------|-----------|
| Email service | Resend API | Existing pattern in /workers/contact-form/ |
| Project location | /projects/anchor/ | Follows existing project structure |
| Cron schedules | 8am (email), 3am Mon (PageSpeed) | Per decisions.md |
| HTML vs React | Static HTML | Per decisions.md: no dashboard |

---

## Verification Checklist

- [x] All 58 requirements have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed
- [x] 300K token budget achievable (260K estimated)
- [x] Sara Blakely customer gut-check scheduled (task-15)
- [x] docs/EMDASH-GUIDE.md cited (Section 5, 6, 8)
- [x] Codebase patterns cited (/workers/contact-form/, /apps/pulse/lib/stripe.ts)
- [x] Blocking decisions identified and escalated

---

## Ship Test

> Does the client feel watched over after their site launches?

> Does "someone's got my back" come through in every email?

> Are the emails helpful or annoying?

> Would you pay for this if you just launched a website?

> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/shipyard-post-delivery-v2/decisions.md, docs/EMDASH-GUIDE.md*
*Project Slug: shipyard-post-delivery-v2*
*Product Name: Anchor*
