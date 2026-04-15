# Shipyard Client Portal — Atomic Requirements List

**Document Version:** 1.0
**Created:** 2026-04-15
**Requirements Analyst:** Claude Haiku 4.5
**Source Documents:**
- PRD: `/home/agent/shipyard-ai/prds/shipyard-client-portal.md`
- Decisions: `/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md`

**Status:** Ready for Development (6 open questions require resolution)

---

## EXECUTIVE SUMMARY

This document extracts 67 atomic requirements from the PRD and decisions, organized by functional area, database schema, and non-functional concerns. Each requirement is:
- **Atomic:** Single responsibility, testable independently
- **Traceable:** Linked to source document (PRD §X or Decisions §X.Y)
- **Prioritized:** Must-have (MVP v1), Should-have (v1.5), Nice-to-have (v2+)
- **Verifiable:** Clear acceptance criteria or success metric

---

# SECTION 1: FUNCTIONAL REQUIREMENTS (MVP v1)

## 1.1 AUTHENTICATION FEATURES

### REQ-AUTH-001: Email/Password Signup
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §2.1, Decisions §I.5, §II
**Narrative:** New clients can create an account using email and password.

**Acceptance Criteria:**
- [ ] Signup form accepts email, password (min 8 chars), password confirmation
- [ ] Email validation (valid format, not already registered)
- [ ] Password hashed before storage (bcrypt or Supabase default)
- [ ] Client record created in `clients` table
- [ ] User logged in automatically after signup
- [ ] Redirect to project intake or dashboard

**Testable:** Unit test signup flow; integration test DB insert

---

### REQ-AUTH-002: Email/Password Login
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §2.1, Decisions §I.5, §II
**Narrative:** Clients can log in with email and password.

**Acceptance Criteria:**
- [ ] Login form accepts email and password
- [ ] Validate credentials against `clients` table
- [ ] Session created via Supabase Auth
- [ ] User redirected to dashboard on success
- [ ] Error message if credentials invalid (generic to prevent email enumeration)
- [ ] Failed attempts logged for security audit

**Testable:** Login flow with valid/invalid credentials; session state verification

---

### REQ-AUTH-003: Password Reset via Email
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §2.1, Decisions §I.5
**Narrative:** Clients can reset forgotten passwords using email link.

**Acceptance Criteria:**
- [ ] "Forgot password?" link on login page
- [ ] User enters email
- [ ] Password reset email sent (via email service provider)
- [ ] Email contains unique reset link (time-limited, single-use)
- [ ] Reset link valid for 24 hours
- [ ] Clicking link opens reset form (new password, confirm password)
- [ ] Password updated in `clients` table
- [ ] Reset link invalidated after use
- [ ] User can log in with new password

**Testable:** E2E reset flow; verify email content; token expiration

---

### REQ-AUTH-004: Session Management
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.2 (Supabase sessions)
**Narrative:** User sessions managed securely via Supabase Auth.

**Acceptance Criteria:**
- [ ] Session token stored in secure, httpOnly cookie
- [ ] Session persists across page reloads
- [ ] Session expires after 7 days of inactivity (configurable)
- [ ] Logout clears session
- [ ] Middleware protects authenticated routes
- [ ] Expired sessions redirect to login
- [ ] CSRF protection on state-changing requests

**Testable:** Session persistence; token refresh; logout verification

---

### REQ-AUTH-005: Authentication Not Supported in v1
**Priority:** N/A (Explicitly cut)
**Status:** Locked
**Source:** Decisions §I.5
**Narrative:** The following auth features are **deferred to v2+**:

**Features Cut to v2:**
- ❌ Magic link (passwordless) authentication
- ❌ OAuth providers (Google, GitHub)
- ❌ Multi-user team accounts
- ❌ SSO/SAML

**Rationale:** Elon's decision to ship fast and validate demand before auth complexity.

---

## 1.2 PROJECT INTAKE + PAYMENT FEATURES

### REQ-INTAKE-001: Project Intake Form
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §2.2, Decisions §II.2
**Narrative:** Clients submit new projects via intake form.

**Acceptance Criteria:**
- [ ] Form accessible via "Start a Project" / "New Project" button
- [ ] Required fields: project name, description/scope selection
- [ ] Scope dropdown: "Emdash Site" | "Emdash Theme" | "Emdash Plugin"
- [ ] Optional fields: design references, integration requirements, timeline
- [ ] Form validation (project name min 3 chars, description min 50 chars)
- [ ] Token estimate displayed before checkout (based on scope)
- [ ] Form submission creates `projects` record with status='intake'
- [ ] User redirected to payment page on submission

**Testable:** Form validation; field requirements; DB record creation

---

### REQ-INTAKE-002: Token Budget Estimation Display
**Priority:** Must-have (blocking)
**Status:** ⚠️ UNRESOLVED
**Source:** Decisions §I.7, §IV.2
**Narrative:** Intake form displays estimated token cost for project scope.

**Acceptance Criteria (Choose ONE before build):**
- **Option A (Steve's preference):** Display as "3 content updates worth of tokens"
  - Requires estimation logic (tokens → feature count)
  - More human-friendly but less precise

- **Option B (Elon's proposal):** Display as "185K tokens (~3-5 updates)"
  - Simpler: show raw tokens with rough context
  - More accurate but less user-friendly

- **Option C (Fallback):** Hide token budget entirely from v1
  - Show pricing only ("This project is $1,500")
  - Token display deferred to retainer dashboard post-launch

**Decision Required:** Team must choose A, B, or C before Day 1 of build.

**Testable:** Display format accuracy; estimation logic (if A or B chosen)

---

### REQ-INTAKE-003: Stripe Checkout Integration
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §2.2, §4, Decisions §II
**Narrative:** Clients pay for projects via Stripe checkout.

**Acceptance Criteria:**
- [ ] Checkout page displays project details and pricing
- [ ] Stripe Elements embedded (not Stripe-hosted redirect)
- [ ] Accept: credit card, debit card
- [ ] Payment processed synchronously (await confirmation)
- [ ] On success: Stripe payment intent confirmed, `projects.status` → 'payment_confirmed'
- [ ] On failure: Error message displayed, project remains in 'intake'
- [ ] Receipt email sent to client
- [ ] Client redirected to dashboard with new project visible

**Testable:** E2E checkout flow; payment success/failure handling; email delivery

---

### REQ-INTAKE-004: Project Creation via Intake + Payment
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §3, Decisions §II.2
**Narrative:** Project intake + payment flow creates project record in database.

**Acceptance Criteria:**
- [ ] `projects` table has: `id`, `client_id`, `title`, `description`, `scope`, `status`, `created_at`, `updated_at`, `completed_at`
- [ ] On successful payment, `projects.status` = 'payment_confirmed'
- [ ] Project visible in client dashboard immediately
- [ ] Stripe payment ID stored for reconciliation
- [ ] Project awaits pipeline integration to advance to next status

**Testable:** DB record creation; field mapping; Stripe ID correlation

---

### REQ-INTAKE-005: Self-Service Intake Without Manual Intervention
**Priority:** Must-have (success metric)
**Status:** Locked
**Source:** PRD §1, Decisions §II, §VI
**Narrative:** Clients can complete intake and payment without human contact.

**Acceptance Criteria:**
- [ ] No email to Shipyard team required
- [ ] No approval step before payment
- [ ] Form submission → payment → dashboard all automated
- [ ] Success metric: 10 self-service projects completed (PR Success Criteria #5)

**Testable:** Audit log shows zero manual intake; project count tracking

---

## 1.3 PROJECT DASHBOARD FEATURES

### REQ-DASH-001: Project List View
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §3, Decisions §II.3
**Narrative:** Clients see list of their projects (active and completed).

**Acceptance Criteria:**
- [ ] Dashboard displays all projects for authenticated client
- [ ] List shows: project name, status, date created
- [ ] Active/in-progress projects sorted to top
- [ ] Completed/live projects below
- [ ] Clickable to view project details
- [ ] "Start New Project" button to begin intake

**Testable:** Query `projects WHERE client_id = ?`; sort logic

---

### REQ-DASH-002: Project Status Display
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §3, Decisions §I.4, §II.3
**Narrative:** Project dashboard shows current pipeline status.

**Acceptance Criteria (v1 Scope):**
- [ ] Text-based status: "In Progress - Build Phase" or "Live"
- [ ] Status updated from pipeline webhook
- [ ] Possible statuses: intake, payment_pending, in_progress, review, live, failed
- [ ] Status displayed prominently (not buried in details)
- [ ] Last updated timestamp shown (e.g., "Updated 2 hours ago")

**v1.5 Enhancement (cut from v1):**
- Progress rings/visual indicators
- Estimated completion time
- 4-wave visualization

**Testable:** Status matches `projects.status` field; webhook updates reflected

---

### REQ-DASH-003: View Site Button
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.4, §II.3
**Narrative:** When project is live, client can click "View Site" to access deployed site.

**Acceptance Criteria:**
- [ ] Button displays when `projects.status = 'live'`
- [ ] Button text: "View Site →" (Steve's voice)
- [ ] Button links to `projects.site_url`
- [ ] Opens in new tab
- [ ] Button NOT displayed for in-progress or failed projects

**Testable:** Button conditional display; link accuracy

---

### REQ-DASH-004: Staging Link Display
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §3
**Narrative:** When project reaches staging, client can review before going live.

**Acceptance Criteria:**
- [ ] Staging link displayed when `projects.staging_url` populated
- [ ] Button text: "View Staging →"
- [ ] Staging link available when status = 'review' or 'staging'
- [ ] Staging link cleared after project goes live (optional)

**Testable:** Conditional display of staging link; link accuracy

---

### REQ-DASH-005: Project Details View
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §3
**Narrative:** Clicking project shows details, history, and feedback form.

**Acceptance Criteria (v1 Scope):**
- [ ] View displays: project name, description, scope, status, dates
- [ ] View displays: token budget used/remaining (if applicable)
- [ ] View displays: site URLs (staging if available, live if available)
- [ ] Simple layout, clean typography (Steve's voice)

**v1.5 Enhancement (cut from v1):**
- Communication history panel
- Feedback submission form
- 4-wave progress tracking

**Testable:** Query and render project details; URL display

---

### REQ-DASH-006: Status Change Notification Email
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §1, §6, Decisions §I.3, §II
**Narrative:** Email sent when project status changes (not displayed in portal first).

**Acceptance Criteria:**
- [ ] Email triggered by pipeline webhook status update
- [ ] Templates include: "Site live," "Build failed," "Ready for review"
- [ ] Email sent before portal updated (async)
- [ ] Email contains direct truth voice (no corporate speak)
- [ ] Email footer with link to portal dashboard
- [ ] Delivery logged for audit

**Testable:** Email delivery on status change; template accuracy; voice compliance

---

## 1.4 RETAINER SUBSCRIPTION FEATURES

### REQ-RETAINER-001: Stripe Subscription Integration
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §5, Decisions §I.8, §II.4
**Narrative:** Clients can subscribe to monthly retainer tier at $299/month.

**Acceptance Criteria:**
- [ ] Subscription management page accessible from dashboard
- [ ] "Subscribe to Retainer" button/link
- [ ] Stripe checkout for subscription (recurring, monthly)
- [ ] On success: Stripe subscription ID stored in `retainers` table
- [ ] Client can view active subscription status
- [ ] Self-service cancel/update payment method via Stripe Customer Portal

**Testable:** E2E subscription checkout; Stripe webhook handling; DB record creation

---

### REQ-RETAINER-002: Retainer Subscription Details
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §5, Decisions §I.8, §II.4
**Narrative:** Retainer record captures subscription and token tracking.

**Acceptance Criteria:**
- [ ] `retainers` table has: `id`, `client_id`, `stripe_subscription_id`, `status`, `token_budget`, `tokens_used`, `billing_cycle_start`, `billing_cycle_end`, `created_at`, `updated_at`
- [ ] `token_budget` initialized to 500K (default, may be overridden)
- [ ] `tokens_used` incremented as requests completed
- [ ] Status: active | canceled | past_due (from Stripe)
- [ ] Billing cycle tracked for token reset

**Testable:** DB schema validation; field initialization; status mapping

---

### REQ-RETAINER-003: Token Budget Display
**Priority:** Must-have (blocking)
**Status:** ⚠️ UNRESOLVED
**Source:** Decisions §I.7, §IV.2
**Narrative:** Retainer dashboard displays remaining token budget.

**Acceptance Criteria (Choose ONE before build):**
- **Option A (Steve's preference):** "You have 3 content updates remaining this month"
  - Requires token-to-feature conversion
  - More human-friendly but adds complexity

- **Option B (Elon's proposal):** "185K tokens remaining (~3-5 updates)"
  - Simpler implementation
  - Show tokens + rough context

- **Option C (Fallback):** Hide token budget in v1
  - Show usage history only ("15K tokens used this month")
  - Token budget management deferred to v1.5

**Decision Required:** Team must choose A, B, or C before Day 1 of build.

**Testable:** Display format matches chosen option; calculations accurate

---

### REQ-RETAINER-004: Token Budget Reset on Billing Cycle
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §5, Decisions §IV.5
**Narrative:** Token budget resets each month when subscription renews.

**Acceptance Criteria:**
- [ ] On billing cycle renewal (Stripe), `tokens_used` reset to 0
- [ ] `billing_cycle_start` and `billing_cycle_end` updated
- [ ] Unused tokens do NOT roll over (v1 design)
- [ ] Email notification sent with new budget

**Testable:** Stripe webhook handler; time-based reset logic; email delivery

---

### REQ-RETAINER-005: Retainer Subscription Cancellation
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.8, §II.4
**Narrative:** Clients can cancel subscription self-service.

**Acceptance Criteria:**
- [ ] Stripe Customer Portal used for cancellation (not custom UI in v1)
- [ ] Cancellation effective at end of billing period
- [ ] `retainers.status` updated to 'canceled' after Stripe webhook
- [ ] Client can re-subscribe later
- [ ] Refund policy clear (prorated refunds handled by Stripe)

**Testable:** Stripe webhook handling; status transition; re-subscription flow

---

### REQ-RETAINER-006: Retainer Maintenance Requests History
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §5, Decisions §II.4
**Narrative:** Retainer clients see history of maintenance requests and token usage.

**Acceptance Criteria:**
- [ ] `retainer_updates` table: `id`, `retainer_id`, `description`, `tokens_used`, `completed_at`
- [ ] Dashboard displays list of completed updates
- [ ] Each entry shows: description, tokens used, completion date
- [ ] Sorted by date (most recent first)
- [ ] Simple text list (no complex UI)

**Testable:** Query `retainer_updates WHERE retainer_id = ?`; display accuracy

---

### REQ-RETAINER-007: Feature Not Supported in v1
**Priority:** N/A (Explicitly cut)
**Status:** Locked
**Source:** Decisions §II.4
**Narrative:** The following retainer features are **deferred to v2+**:

**Features Cut to v2:**
- ❌ Upgrade/downgrade between subscription tiers (only one tier in v1)
- ❌ Prorated refunds (Stripe default handles this automatically)
- ❌ Usage alerts/notifications (e.g., "You've used 80% of budget")
- ❌ Multiple concurrent subscriptions

**Rationale:** Scope minimization for v1 validation.

---

## 1.5 EMAIL NOTIFICATION FEATURES

### REQ-EMAIL-001: Email Service Provider Integration
**Priority:** Must-have (required decision)
**Status:** ⚠️ UNRESOLVED
**Source:** Decisions §IV.4
**Narrative:** System sends transactional emails via external provider.

**Acceptance Criteria (Team must choose ONE before build):**
- **Option A:** SendGrid
- **Option B:** Postmark
- **Option C:** AWS SES
- **Option D:** Resend

**Decision Required:** Elon to select provider and provide API keys before email development.

**Testable:** Email delivery to multiple recipients; template rendering

---

### REQ-EMAIL-002: Site Live Notification
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §6, Decisions §I.3, §II.5
**Narrative:** Email sent when project status changes to 'live'.

**Acceptance Criteria:**
- [ ] Triggered by webhook: `status = 'live'`
- [ ] Template text: "Your site is live. [View Site →] [portal_url]"
- [ ] Uses Steve's voice: direct, confident, no corporate speak
- [ ] Subject: "Your site is live"
- [ ] Sent to client email within 1 minute of webhook
- [ ] Link goes to live site URL

**Testable:** Webhook trigger; email template; voice compliance; link accuracy

---

### REQ-EMAIL-003: Build Failed Notification
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.3, §II.5
**Narrative:** Email sent when project build fails.

**Acceptance Criteria:**
- [ ] Triggered by webhook: `status = 'failed'`
- [ ] Template includes: error message, expected resolution time (if known), escalation contact
- [ ] Uses Steve's voice: "The build failed. We're fixing it. Update in 2 hours."
- [ ] Subject: "We're fixing an issue with your project"
- [ ] Sent within 1 minute of webhook
- [ ] No panic or jargon in message

**Testable:** Webhook trigger; error message formatting; delivery timing

---

### REQ-EMAIL-004: Ready for Review Notification
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §6, Decisions §II.5
**Narrative:** Email sent when project staging is ready for client review.

**Acceptance Criteria:**
- [ ] Triggered by webhook: `status = 'review'` or when `staging_url` populated
- [ ] Template text: "Your site is ready for review. [View Staging →] [staging_url]"
- [ ] Uses Steve's voice
- [ ] Subject: "Your site is ready for review"
- [ ] Includes deadline for feedback (if applicable)

**Testable:** Webhook trigger; staging URL accuracy; email delivery

---

### REQ-EMAIL-005: Retainer Weekly Summary (Cut to v2)
**Priority:** Nice-to-have
**Status:** Cut (deferred to v2)
**Source:** PRD §6, Decisions §II.4
**Narrative:** Retainer clients receive weekly summary email.

**Status in v1:** Not built. Deferred to v2 after validation.

**v2 Scope (when implemented):**
- Weekly email: token usage, completed updates, upcoming work
- Sent on Monday morning
- Encourages new maintenance requests

---

### REQ-EMAIL-006: Payment Confirmation Email
**Priority:** Should-have
**Status:** Locked
**Source:** PRD §2.2
**Narrative:** Receipt email sent after successful project payment.

**Acceptance Criteria:**
- [ ] Triggered by Stripe payment success webhook
- [ ] Template includes: project name, scope, token budget, price, invoice ID
- [ ] Link to dashboard project view
- [ ] Professional receipt formatting

**Testable:** Stripe webhook trigger; email template accuracy

---

### REQ-EMAIL-007: Email Deliverability & Configuration
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §V.6
**Narrative:** Email infrastructure configured for high deliverability.

**Acceptance Criteria:**
- [ ] SPF, DKIM, DMARC records configured for sender domain
- [ ] "From" address: team@shipyard.ai or noreply@shipyard.ai
- [ ] Unsubscribe link (if applicable per regulations)
- [ ] Reply-to: support@shipyard.ai
- [ ] Tested across Gmail, Outlook, Apple Mail
- [ ] No spam trigger words in templates

**Testable:** Email header validation; deliverability testing; recipient surveys

---

## 1.6 WEBHOOK ENDPOINT FEATURES

### REQ-WEBHOOK-001: Pipeline Webhook Endpoint
**Priority:** Must-have (critical decision)
**Status:** ⚠️ UNRESOLVED
**Source:** Decisions §IV.3, §II.5
**Narrative:** API endpoint receives status updates from Great Minds pipeline daemon.

**Acceptance Criteria (Schema validation required):**

Expected payload format (to be confirmed by pipeline team):
```json
{
  "project_id": "uuid",
  "status": "in_progress" | "review" | "live" | "failed",
  "site_url": "https://...",
  "staging_url": "https://...",
  "message": "Human-readable status update",
  "timestamp": "ISO-8601"
}
```

**Acceptance Criteria:**
- [ ] Endpoint: `POST /api/webhooks/pipeline`
- [ ] Validates webhook signature (if provided by pipeline)
- [ ] Validates payload schema (rejects malformed)
- [ ] Updates `projects` table: `status`, `site_url`, `staging_url`, `updated_at`
- [ ] Creates `status_events` record for audit trail
- [ ] Triggers email notification (REQ-EMAIL-*)
- [ ] Returns 200 OK on success, 400 on validation failure
- [ ] Logs all deliveries for debugging

**Decision Required:** Pipeline team must document exact payload format before Day 5 of build.

**Testable:** Integration test with mock payload; schema validation; DB updates

---

### REQ-WEBHOOK-002: Stripe Subscription Webhook Handler
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §V.3
**Narrative:** Stripe webhooks update retainer subscription state.

**Acceptance Criteria:**
- [ ] Endpoint: `POST /api/webhooks/stripe`
- [ ] Validates webhook signature (Stripe secret key)
- [ ] Handles events:
  - `customer.subscription.updated` → update `retainers.status`
  - `customer.subscription.deleted` → set `retainers.status = 'canceled'`
  - `invoice.payment_failed` → set `retainers.status = 'past_due'`
  - `invoice.payment_succeeded` → set `retainers.status = 'active'`, reset `tokens_used = 0`
- [ ] Idempotent: same webhook delivered twice = same result (use Stripe event ID)
- [ ] Returns 200 OK on success
- [ ] Logs all events for audit

**Testable:** Stripe webhook test mode; idempotency verification; state transitions

---

### REQ-WEBHOOK-003: Webhook Error Handling & Monitoring
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §V.2
**Narrative:** Failed webhooks logged and alerted; manual override available for ops.

**Acceptance Criteria:**
- [ ] Failed webhook deliveries logged with timestamp, payload, error
- [ ] Alert sent to ops team if webhook fails 3+ times
- [ ] Manual override endpoint for ops team to update project status directly
- [ ] Manual override logged with admin ID and reason
- [ ] No automatic retry (pipeline team responsible for retry)

**Testable:** Webhook failure scenarios; alert delivery; override logging

---

## 1.7 ANALYTICS FEATURES (CONDITIONAL)

### REQ-ANALYTICS-001: Analytics Integration (Blocking Decision)
**Priority:** Must-have (decision required)
**Status:** ⚠️ UNRESOLVED
**Source:** Decisions §I.6, §IV.1
**Narrative:** Portal displays site analytics (3 key metrics: visitors, conversions, uptime).

**Acceptance Criteria (Team must choose ONE before build):**

**Option A: Cloudflare Analytics API**
- Pros: Sites already on Cloudflare; real-time data
- Cons: Requires Cloudflare account access
- Implementation: 2-3 API routes, simple integration

**Option B: Google Analytics API**
- Pros: Familiar to clients; rich data
- Cons: Requires OAuth setup; client GA account needed
- Implementation: Complex OAuth flow; GA query complexity

**Option C: Cut from v1**
- Pros: Reduces build scope; defer to v1.5
- Cons: Loses engagement opportunity (Shonda's success criteria)
- Implementation: Show "Analytics coming soon" placeholder

**Decision Required:** Steve + Elon must align on Option A, B, or C before build starts.

**Testable:** Analytics data accuracy; API integration; display formatting

---

### REQ-ANALYTICS-002: Weekly Visitor Count
**Priority:** Should-have (if Option A or B chosen)
**Status:** Conditional
**Source:** PRD §4, Decisions §I.6
**Narrative:** Display unique visitors for current week.

**Acceptance Criteria:**
- [ ] Dashboard shows metric: "1,247 visitors this week"
- [ ] Data from Cloudflare (Option A) or Google Analytics (Option B)
- [ ] Updated daily
- [ ] Falls back to "Data loading..." if API unavailable

**Testable:** API data accuracy; fallback display; update frequency

---

### REQ-ANALYTICS-003: Key Conversion Count
**Priority:** Should-have (if Option A or B chosen)
**Status:** Conditional
**Source:** PRD §4, Decisions §I.6
**Narrative:** Display key conversions (form submissions or client-defined metric).

**Acceptance Criteria:**
- [ ] Dashboard shows metric: "23 form submissions this week"
- [ ] Metric configurable per client (defined during intake?)
- [ ] Data from Google Analytics (Option B only, not Cloudflare)
- [ ] Falls back gracefully if unavailable

**Testable:** Metric tracking; data accuracy; fallback behavior

---

### REQ-ANALYTICS-004: Site Uptime Status
**Priority:** Should-have (if Option A or B chosen)
**Status:** Conditional
**Source:** PRD §4, Decisions §I.6
**Narrative:** Display site uptime status (green dot = up, red dot = down).

**Acceptance Criteria:**
- [ ] Simple indicator: green dot "Up" | red dot "Down"
- [ ] Data from Cloudflare Health Checks or Pingdom
- [ ] Updated every 5 minutes
- [ ] Click for last 24h status history

**Testable:** Status accuracy; update frequency; indicator display

---

### REQ-ANALYTICS-005: Analytics NOT in v1 (Fallback)
**Priority:** N/A (If Option C chosen)
**Status:** Conditional
**Source:** Decisions §IV.1
**Narrative:** If analytics deferred to v1.5, show placeholder.

**Acceptance Criteria (if Option C):**
- [ ] Analytics section shows: "Analytics dashboard coming in v1.5"
- [ ] No broken features; clean fallback message
- [ ] Success criteria #3 deferred (not measured in v1)

**Testable:** Placeholder display; no errors

---

---

# SECTION 2: DATABASE REQUIREMENTS

## 2.1 DATA SCHEMA

### REQ-DB-001: Clients Table
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §III, PRD §4.2
**Narrative:** Core table for client accounts.

**Schema:**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Requirements:**
- [ ] `id`: UUID primary key, auto-generated
- [ ] `email`: Unique, indexed, case-insensitive
- [ ] `created_at`: Timestamp of signup
- [ ] `updated_at`: Timestamp of last profile update
- [ ] No password stored in clients table (Supabase Auth handles it)

**Indexes:**
- [ ] PRIMARY KEY idx_clients_id
- [ ] UNIQUE KEY idx_clients_email

---

### REQ-DB-002: Projects Table
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §III, PRD §4.2
**Narrative:** Project records (one per intake submission).

**Schema:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL, -- 'intake', 'payment_pending', 'in_progress', 'review', 'live', 'failed'
  site_url TEXT,
  staging_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**Requirements:**
- [ ] `id`: UUID primary key
- [ ] `client_id`: FK to clients table (not null)
- [ ] `title`: Project name, min 3 chars
- [ ] `status`: Enum from specific set (lowercase)
- [ ] `site_url`: Full URL or NULL
- [ ] `staging_url`: Full URL or NULL
- [ ] `created_at`: Intake submission time
- [ ] `updated_at`: Last webhook update
- [ ] `completed_at`: When project went live (or NULL)

**Indexes:**
- [ ] PRIMARY KEY idx_projects_id
- [ ] FOREIGN KEY idx_projects_client_id
- [ ] idx_projects_status (for querying by status)
- [ ] idx_projects_client_id (for listing client projects)

---

### REQ-DB-003: Retainers Table
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §III, PRD §4.2
**Narrative:** Subscription records for retainer tier clients.

**Schema:**
```sql
CREATE TABLE retainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  token_budget INTEGER DEFAULT 500000,
  tokens_used INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Requirements:**
- [ ] `id`: UUID primary key
- [ ] `client_id`: FK to clients table (not null)
- [ ] `stripe_subscription_id`: Unique, stores Stripe subscription ID
- [ ] `status`: active | canceled | past_due (from Stripe)
- [ ] `token_budget`: 500K per month (reset on billing cycle)
- [ ] `tokens_used`: Counter incremented as requests completed
- [ ] `billing_cycle_start` / `billing_cycle_end`: Track when budget resets
- [ ] `created_at`: Subscription signup date
- [ ] `updated_at`: Last Stripe webhook update

**Indexes:**
- [ ] PRIMARY KEY idx_retainers_id
- [ ] UNIQUE KEY idx_retainers_stripe_subscription_id
- [ ] FOREIGN KEY idx_retainers_client_id
- [ ] idx_retainers_status (for active subscription queries)

---

### REQ-DB-004: Retainer Updates Table
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §III, PRD §4.2
**Narrative:** Log of completed retainer maintenance requests.

**Schema:**
```sql
CREATE TABLE retainer_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retainer_id UUID NOT NULL REFERENCES retainers(id),
  description TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);
```

**Requirements:**
- [ ] `id`: UUID primary key
- [ ] `retainer_id`: FK to retainers table (not null)
- [ ] `description`: What work was done (e.g., "Updated homepage hero image")
- [ ] `tokens_used`: Token cost for this update (integer)
- [ ] `completed_at`: When request was completed

**Indexes:**
- [ ] PRIMARY KEY idx_retainer_updates_id
- [ ] FOREIGN KEY idx_retainer_updates_retainer_id

---

### REQ-DB-005: Status Events Table
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §III
**Narrative:** Audit trail of project status changes from webhooks.

**Schema:**
```sql
CREATE TABLE status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Requirements:**
- [ ] `id`: UUID primary key
- [ ] `project_id`: FK to projects table (not null)
- [ ] `status`: Status value from webhook
- [ ] `message`: Optional webhook message or error description
- [ ] `created_at`: Timestamp of webhook receipt

**Indexes:**
- [ ] PRIMARY KEY idx_status_events_id
- [ ] FOREIGN KEY idx_status_events_project_id
- [ ] idx_status_events_created_at (for auditing recent changes)

---

## 2.2 DATA RELATIONSHIPS & QUERIES

### REQ-DB-006: Client → Projects Relationship
**Priority:** Must-have
**Status:** Locked
**Narrative:** Client has many projects (one-to-many).

**Implementation:**
- `projects.client_id` FK to `clients.id`
- Query: `SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC`
- Index on `client_id` required for performance

---

### REQ-DB-007: Client → Retainers Relationship
**Priority:** Must-have
**Status:** Locked
**Narrative:** Client has one active retainer (one-to-one or one-to-many depending on future tiers).

**Implementation (v1):**
- `retainers.client_id` FK to `clients.id`
- Query: `SELECT * FROM retainers WHERE client_id = $1 AND status = 'active'`
- Assume one active retainer per client in v1

---

### REQ-DB-008: Retainer → Updates Relationship
**Priority:** Must-have
**Status:** Locked
**Narrative:** Retainer has many completed updates (one-to-many).

**Implementation:**
- `retainer_updates.retainer_id` FK to `retainers.id`
- Query: `SELECT * FROM retainer_updates WHERE retainer_id = $1 ORDER BY completed_at DESC`
- Index on `retainer_id` required

---

### REQ-DB-009: Project → Status Events Relationship
**Priority:** Must-have
**Status:** Locked
**Narrative:** Project has many status change events (one-to-many).

**Implementation:**
- `status_events.project_id` FK to `projects.id`
- Query: `SELECT * FROM status_events WHERE project_id = $1 ORDER BY created_at DESC`
- Latest status event represents current state (denormalized to `projects.status`)

---

---

# SECTION 3: NON-FUNCTIONAL REQUIREMENTS

## 3.1 DESIGN & USER EXPERIENCE

### REQ-NFR-001: Direct Truth Voice (Non-Negotiable)
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.4
**Narrative:** All copy uses direct truth, no corporate speak or passive voice.

**Principles:**
- ✅ "Your site is live" not "deployment successful"
- ✅ "The build failed. We're fixing it. Update in 2 hours." not "Unexpected error encountered"
- ✅ Address clients directly ("You," "Your") not passive ("The")
- ✅ Use human language, not jargon
- ✅ Confidence without arrogance

**Application Areas:**
- Error messages
- Email templates
- Status displays
- Button labels
- Empty states

**Acceptance Criteria:**
- [ ] All copy reviewed against Steve's voice principles
- [ ] No buzzwords: "synergy," "leverage," "paradigm shift," etc.
- [ ] No passive constructions: "it has been determined" → "we decided"
- [ ] Addresses reader directly: "Your site" not "The site"

**Testable:** Copy review checklist; voice audit

---

### REQ-NFR-002: Clean, Minimal UI Design
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.4, §V.8
**Narrative:** Visual design conveys confidence and professionalism.

**Design Principles:**
- White space: Don't fill every pixel
- Typography: Clear hierarchy (h1 > h2 > body text)
- Color: Minimal palette (black, white, one accent color)
- Components: Pre-built Shadcn/ui (no custom complex widgets in v1)
- Information density: Show what matters, hide rest

**v1 Scope:**
- Simple project list
- Single-project detail view (centered)
- Clean forms (no fancy animations)
- Status text + buttons

**v1.5 Enhancement (cut from v1):**
- Progress rings/circular indicators
- Animated transitions
- Advanced layout options

**Acceptance Criteria:**
- [ ] No Comic Sans or clip art
- [ ] No "under construction" vibes
- [ ] Typography scales on mobile
- [ ] Touch targets ≥44px (mobile accessibility)
- [ ] Color contrast ≥4.5:1 (WCAG AA)

**Testable:** Design review; accessibility audit; responsive testing

---

### REQ-NFR-003: Mobile Responsiveness
**Priority:** Must-have
**Status:** Locked
**Source:** Implicit (SaaS standard)
**Narrative:** UI works on mobile (≥375px width).

**Acceptance Criteria:**
- [ ] Forms stack vertically on mobile
- [ ] Buttons sized for thumb clicks (≥44px)
- [ ] Text readable without pinch-zoom
- [ ] No horizontal scroll on mobile
- [ ] Tested on iPhone 12, Android (Pixel-like)

**Testable:** Device testing; responsive design audit

---

### REQ-NFR-004: Emotion: Relief & Confidence
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.4
**Narrative:** Portal should evoke relief ("They've got this") and confidence.

**Design Manifestations:**
- Clear status at a glance (big green "Live" badge when deployed)
- No surprises (status always accurate, updated quickly)
- Professional appearance (no janky UI)
- Direct communication (no hidden error messages)

**Acceptance Criteria:**
- [ ] Users can answer "Is my project working?" within 3 seconds of landing
- [ ] Status is most prominent element on page
- [ ] Error messages are clear (not hidden or minimized)
- [ ] Loading states shown (not blank pages)

**Testable:** Usability testing; time-to-answer metric

---

## 3.2 PERFORMANCE REQUIREMENTS

### REQ-NFR-005: Page Load Time
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §7
**Narrative:** Portal pages load quickly, conveying reliability.

**Acceptance Criteria:**
- [ ] Dashboard loads in < 2 seconds (First Contentful Paint)
- [ ] Analytics (if enabled) loads in < 3 seconds
- [ ] Forms interactive within 1 second
- [ ] Measured on 4G throttling (Chrome DevTools)

**Testable:** Lighthouse audit; performance monitoring

---

### REQ-NFR-006: Status Update Propagation
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §7
**Narrative:** Project status visible in portal within 5 minutes of pipeline update.

**Acceptance Criteria:**
- [ ] Webhook received and processed < 1 second
- [ ] Database updated < 1 second
- [ ] Email sent < 1 minute
- [ ] Portal shows new status within next page load (no polling)
- [ ] Define SLA: 95% of webhooks processed within 5 minutes

**Testable:** Webhook timing logs; end-to-end timing tests

---

### REQ-NFR-007: Email Delivery SLA
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.3
**Narrative:** Critical emails (site live, build failed) delivered reliably.

**Acceptance Criteria:**
- [ ] 99% delivery rate (tracked via email provider bounce/delivery feedback)
- [ ] Median delivery time: < 30 seconds
- [ ] Spam filtering: < 2% false positives (emails landing in spam)
- [ ] Bounce handling: Unsubscribe undeliverable addresses automatically

**Testable:** Email provider analytics; bounce monitoring

---

## 3.3 SECURITY REQUIREMENTS

### REQ-NFR-008: Authentication Security
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.2
**Narrative:** Authentication handled securely via Supabase.

**Acceptance Criteria:**
- [ ] Passwords hashed with bcrypt (Supabase default)
- [ ] Session tokens are secure, httpOnly, signed
- [ ] Password reset links single-use, time-limited (24h)
- [ ] No password stored in logs or error messages
- [ ] Failed login attempts throttled (5 per minute max per IP)
- [ ] Password reset emails signed (SPF/DKIM)

**Testable:** Supabase config audit; security testing

---

### REQ-NFR-009: Data Protection
**Priority:** Must-have
**Status:** Locked
**Source:** Implicit (GDPR/privacy standard)
**Narrative:** Client data protected at rest and in transit.

**Acceptance Criteria:**
- [ ] HTTPS only (Vercel provides)
- [ ] Database encryption at rest (Supabase default)
- [ ] No sensitive data in URLs (e.g., project IDs in GET params fine, API keys not)
- [ ] Environment variables not committed to repo
- [ ] Database backups encrypted
- [ ] Data retention: No automatic deletion (client owns data)

**Testable:** Security audit; env config review

---

### REQ-NFR-010: Webhook Security
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §V.2
**Narrative:** Webhook endpoints validate signature and prevent injection.

**Acceptance Criteria:**
- [ ] Pipeline webhooks validated via signature (if provided by pipeline)
- [ ] Stripe webhooks validated via Stripe secret key
- [ ] Payload size limits enforced (reject >1MB)
- [ ] Schema validation: reject malformed payloads
- [ ] No SQL injection via webhook payload
- [ ] Logging of all webhook attempts (success and failure)

**Testable:** Webhook signature validation; malformed payload handling

---

### REQ-NFR-011: CSRF Protection
**Priority:** Must-have
**Status:** Locked
**Source:** Implicit (web security standard)
**Narrative:** Forms protected from cross-site request forgery.

**Acceptance Criteria:**
- [ ] CSRF tokens on all state-changing forms (POST, PUT, DELETE)
- [ ] Same-site cookie policy (SameSite=Strict)
- [ ] Token validation on submission
- [ ] No CSRF vulnerabilities per OWASP checklist

**Testable:** CSRF attack simulation; token validation

---

## 3.4 SCALABILITY & RELIABILITY

### REQ-NFR-012: Scalability Assumptions
**Priority:** Must-have
**Status:** Locked
**Source:** Decisions §I.2, §V.9
**Narrative:** Architecture scales to 1000+ projects easily.

**Assumptions:**
- Supabase PostgreSQL: Handles 100K+ rows without issue
- Vercel: Auto-scales Next.js to handle load
- Stripe: Inherently scales (third-party)
- Email provider: Handles 10K+ emails/day

**Implementation:**
- Database indexes on `client_id`, `status`, `created_at`
- Avoid N+1 queries (use joins, batch queries)
- No in-memory caching of large datasets (use DB directly)

**Testable:** Load test with 1000 projects; query performance monitoring

---

### REQ-NFR-013: Error Handling & Logging
**Priority:** Must-have
**Status:** Locked
**Source:** Implicit
**Narrative:** System logs errors and gracefully degrades on failure.

**Acceptance Criteria:**
- [ ] All API errors logged with timestamp, endpoint, status code, error message
- [ ] Webhook failures logged and alerted
- [ ] Unhandled exceptions caught and logged (not displayed to users)
- [ ] User sees friendly error message ("Something went wrong. We're investigating.")
- [ ] Sensitive data not logged (passwords, payment tokens, API keys)

**Testable:** Error log audit; failure scenario testing

---

### REQ-NFR-014: Graceful Degradation
**Priority:** Must-have
**Status:** Locked
**Source:** PRD §8
**Narrative:** Portal works even if external services unavailable.

**Acceptance Criteria (if applicable):**
- [ ] Analytics unavailable: Show "Analytics loading..." (don't block dashboard)
- [ ] Webhook delayed: Portal still works, client not blocked
- [ ] Stripe down: Show "Unable to process payment, please try again"
- [ ] Email service down: Log error, retry, don't crash portal

**Testable:** Service unavailability simulation; fallback display verification

---

## 3.5 COMPLIANCE & POLICY

### REQ-NFR-015: Terms of Service & Privacy Policy
**Priority:** Must-have
**Status:** Required (out of scope for dev)
**Source:** Implicit (legal requirement)
**Narrative:** Portal displays ToS and privacy policy.

**Acceptance Criteria:**
- [ ] Link to ToS at footer or signup page
- [ ] Link to privacy policy at footer or signup page
- [ ] Documents exist and are approved by legal
- [ ] GDPR compliance: Data deletion requests honored

**Testable:** Link presence; legal review

---

### REQ-NFR-016: Payment Compliance (PCI DSS)
**Priority:** Must-have
**Status:** Locked
**Source:** Implicit (Stripe handles this)
**Narrative:** Payment processing compliant with PCI DSS.

**Implementation:**
- Use Stripe Elements (never store raw card data)
- No custom payment handling
- PCI responsibility delegated to Stripe

**Testable:** Stripe compliance certification; security audit

---

---

# SECTION 4: OPEN DECISIONS (BLOCKERS & CRITICAL)

## 4.1 BLOCKING DECISIONS (Must Resolve Before Build)

### DECISION-001: Analytics Integration Strategy
**Status:** ⚠️ BLOCKING
**Deadline:** Before Day 1 of build (Phase 1)
**Owner:** Steve + Elon alignment required
**Source:** Decisions §I.6, §IV.1

**Options:**
- **Option A: Cloudflare Analytics API**
  - Pros: Sites already on Cloudflare; fast integration
  - Cons: Limited data; may not show conversions
  - Effort: 1-2 days
  - Cost: None (free with Cloudflare)

- **Option B: Google Analytics API**
  - Pros: Rich data; clients understand GA
  - Cons: Requires OAuth; GA query complexity
  - Effort: 2-3 days
  - Cost: None (GA is free)

- **Option C: Cut analytics from v1 entirely**
  - Pros: Reduces scope; ships faster
  - Cons: Loses engagement feature; Shonda's success criteria deferred
  - Effort: 0 days (just skip component)
  - Cost: None

**Impact on Architecture:**
- Option A: New API route `/api/analytics/cloudflare`, lightweight DB queries
- Option B: OAuth login flow, GA query layer, client auth management
- Option C: Placeholder UI ("Analytics coming soon"), skip API routes

**Decision Needed:** One of A, B, or C must be chosen and documented before build starts.

---

### DECISION-002: Token Budget Display Format
**Status:** ⚠️ BLOCKING
**Deadline:** Before Day 3 of build (Phase 2)
**Owner:** Steve + Elon alignment required
**Source:** Decisions §I.7, §IV.2

**Options:**
- **Option A: Human Translation (Steve's preference)**
  - Display: "3 content updates remaining this month"
  - Pros: User-friendly, clear expectations
  - Cons: Requires token-to-feature estimation; if wrong, erodes trust
  - Effort: 2-3 days (estimation logic + testing)
  - Implementation: Lookup table or formula (e.g., 100K tokens = 1 update)

- **Option B: Tokens + Context (Elon's proposal)**
  - Display: "185K tokens remaining (~3-5 content updates)"
  - Pros: Simpler, transparent
  - Cons: Still estimates; not as user-friendly
  - Effort: 1 day (just format display)
  - Implementation: Simple calculation (tokens / 50K = rough updates)

- **Option C: Hide Token Budget in v1**
  - Display: Show usage history only ("15K tokens used this month")
  - Pros: No estimation needed; accurate
  - Cons: Clients don't know how much budget left; reduces trust
  - Effort: 0 days
  - Implementation: Skip budget display entirely

**Impact on Retainer Dashboard:**
- Option A: More code, more testing, better UX
- Option B: Balanced approach, simpler code
- Option C: Shows usage but not budget, defer to v1.5

**Decision Needed:** One of A, B, or C must be chosen before retainer dashboard development.

---

## 4.2 CRITICAL DECISIONS (Should Resolve Before Day 1)

### DECISION-003: Pipeline Webhook Payload Format
**Status:** ⚠️ CRITICAL (not yet documented)
**Deadline:** Before Day 5 of build (Phase 3)
**Owner:** Pipeline team documentation required
**Source:** Decisions §IV.3

**Required Specification:**
Pipeline team must provide exact webhook payload schema, including:
- Field names and types
- Possible status values (exact strings)
- Optional vs. required fields
- Webhook signature method (if any)
- Retry behavior (how many times, how often)
- Timestamp format

**Example (template):**
```json
{
  "project_id": "uuid",
  "status": "in_progress" | "review" | "live" | "failed",
  "site_url": "https://...",
  "staging_url": "https://...",
  "message": "Human-readable status update",
  "timestamp": "ISO-8601",
  "wave": 1,  // if applicable
  "error_details": { }  // if status = failed
}
```

**Impact on Development:**
- Schema affects webhook endpoint implementation
- Status values must map to `projects.status` enum
- Email templates depend on status values
- Error handling depends on error_details structure

**Action Required:** Pipeline team must document and share before Phase 3 begins.

---

### DECISION-004: Email Service Provider Selection
**Status:** ⚠️ REQUIRED (team decision)
**Deadline:** Before Day 4 of build (Phase 2)
**Owner:** Elon (decision) + DevOps (setup)
**Source:** Decisions §IV.4

**Options:**
- **SendGrid:** Industry standard, great API, $0-400/month depending on volume
- **Postmark:** Focus on transactional email, excellent support, $15-75/month
- **AWS SES:** Cheapest, steepest learning curve, $0.10 per 1000 emails
- **Resend:** Modern, Vercel-friendly, $0.20 per 1000 emails (similar to SES)

**Decision Factors:**
- Cost at 1000 emails/month?
- Deliverability track record?
- API simplicity?
- Support quality?
- Team familiarity?

**Impact on Development:**
- Provider choice affects SDK/library used
- Email template format (HTML, plain text)
- Authentication (API key, OAuth)
- Webhook setup for bounce handling

**Action Required:** Elon must choose one provider and provide:
- API key
- Verified sender domain
- DKIM/SPF/DMARC records (pre-configured)
- Email template directory (if using provider templates)

---

### DECISION-005: Stripe Subscription Configuration
**Status:** ⚠️ REQUIRED (Finance + Dev alignment)
**Deadline:** Before Day 3 of build (Phase 2)
**Owner:** Finance/Ops + Dev
**Source:** Decisions §IV.5, §I.8

**Required Stripe Setup (in Stripe Dashboard):**
- Product name: "Shipyard Retainer" (or similar)
- Price: $299/month recurring
- Billing interval: Monthly (not annual)
- Trial period: None for v1 (or specify if yes)
- Tax behavior: (to be determined by Finance)
- Webhook configuration: Verify webhook URL + events needed

**Questions to Resolve:**
- Token budget reset: On billing cycle renewal? (Assume yes)
- Trial period: Free trial for first month? (Recommend no for v1)
- Prorated refunds: Handled by Stripe automatically? (Yes)
- Subscription limits: Max concurrent? (Assume 1 per client in v1)
- Upgrades/downgrades: Allow or defer to v2? (Defer to v2)

**Impact on Development:**
- Stripe Product ID + Price ID must be in environment variables
- Webhook event types: customer.subscription.* + invoice.*
- Billing cycle tracking: billing_cycle_start/end in DB
- Token reset trigger: On invoice.payment_succeeded event

**Action Required:** Finance must:
1. Create Stripe product + price
2. Provide Product ID and Price ID
3. Configure webhook in Stripe dashboard
4. Document trial policy and refund policy

---

### DECISION-006: Domain & Deployment Configuration
**Status:** ⚠️ REQUIRED (DevOps + Marketing)
**Deadline:** Before Day 7 of build (Phase 4)
**Owner:** DevOps + Product
**Source:** Decisions §IV.6

**Required Information:**
- **Production domain:** e.g., `app.shipyard.ai` or `portal.shipyard.ai`
- **Staging domain:** e.g., `staging.shipyard.ai` (optional)
- **Vercel project name:** (create if doesn't exist)
- **Environment variables:** List of required vars (Supabase keys, Stripe keys, API secrets)
- **DNS setup:** MX records for email domain, DKIM/SPF for sender domain
- **SSL certificate:** Vercel provides free SSL (no action needed)

**Vercel Configuration:**
- Environment variables per environment (development, staging, production)
- Deployment branch (main or feature)
- Build settings (Next.js auto-detected)
- Domains connected

**Email Domain Configuration:**
- Sender domain: e.g., `team@shipyard.ai` or `noreply@shipyard.ai`
- SPF record added to DNS
- DKIM record added to DNS (email provider provides this)
- DMARC record (optional but recommended)

**Impact on Development:**
- Domain affects email links, Stripe redirect URLs, webhook URLs
- Environment variables must be set before deployment
- DNS changes may take 24-48 hours to propagate

**Action Required:** DevOps must:
1. Provision Vercel project (if new)
2. Configure production and staging domains
3. Set environment variables
4. Configure DNS (email + web)
5. Test deployment pipeline

---

## 4.3 SUMMARY TABLE

| Decision | Status | Owner | Deadline | Impact |
|----------|--------|-------|----------|--------|
| Analytics integration | ⚠️ BLOCKING | Steve + Elon | Day 1 | Architecture scope |
| Token budget display | ⚠️ BLOCKING | Steve + Elon | Day 3 | Retainer dashboard |
| Webhook payload format | ⚠️ CRITICAL | Pipeline team | Day 5 | API route implementation |
| Email service provider | ⚠️ REQUIRED | Elon | Day 4 | Email integration |
| Stripe subscription config | ⚠️ REQUIRED | Finance + Dev | Day 3 | Subscription logic |
| Domain & deployment | ⚠️ REQUIRED | DevOps | Day 7 | Final deployment |

---

---

# SECTION 5: DATABASE SCHEMA MAPPING TO REQUIREMENTS

## 5.1 Requirements Coverage by Table

### Clients Table
| Requirement | SQL Field | Type | Notes |
|-------------|-----------|------|-------|
| REQ-AUTH-001 (signup) | email | TEXT UNIQUE | Created during signup |
| REQ-AUTH-004 (sessions) | id | UUID | Session tied to client id |
| REQ-DB-001 (client record) | * | — | Full table spec |

### Projects Table
| Requirement | SQL Field | Type | Notes |
|-------------|-----------|------|-------|
| REQ-INTAKE-001 (form) | title, description (JSONB possible) | TEXT | Project metadata |
| REQ-INTAKE-004 (creation) | id, client_id, title | UUID, FK, TEXT | Project record |
| REQ-DASH-002 (status) | status | TEXT | Enum: intake/payment_pending/in_progress/review/live/failed |
| REQ-DASH-003 (view site) | site_url | TEXT | URL when live |
| REQ-DASH-004 (staging) | staging_url | TEXT | URL when in review |
| REQ-WEBHOOK-001 (pipeline) | status, site_url, staging_url, updated_at | TEXT, TEXT, TEXT, TIMESTAMP | Updated by webhook |
| REQ-DB-002 (project schema) | * | — | Full table spec |

### Retainers Table
| Requirement | SQL Field | Type | Notes |
|-------------|-----------|------|-------|
| REQ-RETAINER-001 (subscription) | stripe_subscription_id, status | TEXT, TEXT | Stripe integration |
| REQ-RETAINER-002 (details) | token_budget, tokens_used, billing_cycle_start/end | INTEGER, INTEGER, TIMESTAMP | Subscription metadata |
| REQ-RETAINER-003 (token display) | tokens_used, token_budget | INTEGER, INTEGER | Display format per DECISION-002 |
| REQ-RETAINER-004 (reset) | tokens_used, billing_cycle_start/end | INTEGER, TIMESTAMP | Reset on billing cycle |
| REQ-RETAINER-005 (cancel) | status | TEXT | Updated to 'canceled' |
| REQ-DB-003 (schema) | * | — | Full table spec |

### Retainer Updates Table
| Requirement | SQL Field | Type | Notes |
|-------------|-----------|------|-------|
| REQ-RETAINER-006 (history) | description, tokens_used, completed_at | TEXT, INTEGER, TIMESTAMP | Usage history |
| REQ-DB-004 (schema) | * | — | Full table spec |

### Status Events Table
| Requirement | SQL Field | Type | Notes |
|-------------|-----------|------|-------|
| REQ-WEBHOOK-001 (audit) | project_id, status, message, created_at | FK, TEXT, TEXT, TIMESTAMP | Webhook audit trail |
| REQ-DB-005 (schema) | * | — | Full table spec |

---

---

# SECTION 6: SUCCESS METRICS & ACCEPTANCE CRITERIA

## 6.1 Launch Success Criteria (Week 1)

### METRIC-001: Portal Deployment
**Definition:** Portal deployed to production domain.
**Target:** ✅ Deployed
**Verification:** `app.shipyard.ai` loads without 5xx errors
**Owner:** DevOps

---

### METRIC-002: Signup Flow Functional
**Definition:** New user can sign up and create account.
**Target:** ✅ 3+ test accounts created
**Verification:** Test accounts in `clients` table, can log in
**Owner:** QA

---

### METRIC-003: Intake → Payment Flow End-to-End
**Definition:** Client can submit intake, see pricing, pay via Stripe.
**Target:** ✅ 3+ test projects created and paid
**Verification:** Projects in DB with status='payment_confirmed', Stripe events logged
**Owner:** QA

---

### METRIC-004: Webhook Integration Confirmed
**Definition:** Pipeline webhook updates project status in real-time.
**Target:** ✅ Test webhook delivered and processed
**Verification:** `projects.status` updated within 5 seconds of webhook
**Owner:** Dev + Pipeline team

---

### METRIC-005: Email Notifications Delivered
**Definition:** Transactional emails sent on key events (site live, build failed).
**Target:** ✅ Emails delivered to test account
**Verification:** Email received in inbox, not spam; SPF/DKIM passing
**Owner:** QA + Email ops

---

### METRIC-006: Dashboard Displays Projects
**Definition:** Client sees projects and status after login.
**Target:** ✅ Projects visible, status matches DB
**Verification:** Dashboard loads; project status correct
**Owner:** QA

---

## 6.2 Market Validation Criteria (Week 4)

### METRIC-007: Self-Service Project Completions
**Definition:** Real clients complete projects via self-service intake.
**Target:** 10 projects (from PRD Success Criteria #5)
**Verification:** Audit log shows projects created, zero manual intervention
**Owner:** Sales/Marketing

---

### METRIC-008: Retainer Subscriptions Active
**Definition:** Clients subscribing to $299/month maintenance tier.
**Target:** 5 active subscriptions (from PRD Success Criteria #6)
**Verification:** 5 records in `retainers` table with status='active'
**Owner:** Sales

---

### METRIC-009: Monthly Recurring Revenue
**Definition:** Revenue from active retainer subscriptions.
**Target:** $1,495/month (5 × $299)
**Verification:** Stripe dashboard shows recurring revenue
**Owner:** Finance

---

### METRIC-010: Zero Critical Bugs
**Definition:** No production-blocking bugs reported.
**Target:** ✅ Zero P1 bugs
**Verification:** Bug tracking system reviewed
**Owner:** Product/QA

---

### METRIC-011: Client Session Duration
**Definition:** Average time spent in portal per session.
**Target:** < 60 seconds (from Decisions §VI)
**Rationale:** Clients should get in, see status, get out — no unnecessary friction
**Verification:** Google Analytics or Vercel analytics
**Owner:** Product

---

## 6.3 Quality Acceptance Criteria

### METRIC-012: UI/UX Quality
**Definition:** Portal meets Steve's design standards.
**Target:** ✅ Design review approved
**Verification:**
- [ ] No Comic Sans or clip art
- [ ] Typography hierarchy clear
- [ ] White space intentional
- [ ] Mobile responsive
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] Touch targets ≥44px
**Owner:** Design/QA

---

### METRIC-013: Copy & Voice Compliance
**Definition:** All text follows Steve's "direct truth" principles.
**Target:** ✅ Voice audit passed
**Verification:**
- [ ] No buzzwords or corporate speak
- [ ] Direct address ("You," "Your")
- [ ] Clear error messages
- [ ] Confident tone
**Owner:** Product/QA

---

### METRIC-014: Performance Baseline
**Definition:** Pages load within acceptable time.
**Target:**
- Dashboard: < 2s FCP
- Analytics: < 3s (if enabled)
- Forms: interactive within 1s
**Verification:** Lighthouse audit; performance monitoring
**Owner:** Dev/QA

---

### METRIC-015: Security Audit Passed
**Definition:** Portal meets security best practices.
**Target:** ✅ Zero critical/high vulns
**Verification:**
- [ ] HTTPS everywhere
- [ ] Password hashing verified
- [ ] Session security verified
- [ ] Webhook signature validation verified
- [ ] CSRF protection verified
- [ ] No secrets in code
**Owner:** Security/DevOps

---

## 6.4 v1.5 Trigger Criteria

**Advancement to v1.5 features requires:**
1. METRIC-008: ≥10 active retainer clients (currently 5 minimum)
2. Client feedback survey: Demand confirmed for enhanced design
3. Revenue validates continued investment (no major churn)

**v1.5 Roadmap (when triggered):**
- Progress rings/visual indicators
- Estimated completion time
- Enhanced analytics (if Option A/B chosen)
- Weekly summary emails
- Token budget display refinement

---

---

# SECTION 7: RISK REGISTER SUMMARY

## 7.1 High-Risk Items (Source: Decisions §V)

### RISK-001: No Product-Market Fit Validation
**Severity:** CRITICAL | **Likelihood:** HIGH
**Risk:** 27 completed PRDs but zero retainer conversions. May build full portal before demand exists.
**Mitigation:**
- Ship v1 in 1 week (reduces investment risk)
- Email 27 existing clients offering retainer during beta
- Kill project if <3 conversions after 30 days
**Owner:** Business/Sales

---

### RISK-002: Pipeline Webhook Integration Unknown
**Severity:** HIGH | **Likelihood:** MEDIUM
**Risk:** Portal depends on webhooks. If payload format unstable or changes, portal breaks.
**Mitigation:**
- Document exact webhook contract before build (DECISION-003)
- Schema validation on webhook endpoint
- Error logging + alerting for failed deliveries
- Manual status override for ops team
**Owner:** Pipeline team + Portal dev

---

### RISK-003: Stripe Subscription Complexity
**Severity:** MEDIUM | **Likelihood:** MEDIUM
**Risk:** Billing logic complex. Easy to introduce bugs in token resets or failed payments.
**Mitigation:**
- Use Stripe Customer Portal for self-service (reduce custom code)
- Idempotent webhook handlers (use Stripe event IDs)
- Test failed payment scenarios (past_due, canceled)
- Manual billing override for ops team
**Owner:** Dev + Finance

---

### RISK-004: Client Expectations Mismatch
**Severity:** MEDIUM | **Likelihood:** HIGH
**Risk:** Clients expect "calm power" design. v1 ships text-based status. Disappointment kills trust.
**Mitigation:**
- Set expectations in onboarding: "Portal in beta. Full features coming soon."
- Apply Steve's voice principles to ALL copy (even v1)
- Ship v1.5 design polish within 2-4 weeks of v1
- Offer beta discount ($249/month for early adopters)
**Owner:** Customer Success + Marketing

---

### RISK-005: Token Budget Estimation Inaccuracy
**Severity:** LOW | **Likelihood:** HIGH
**Risk:** If showing "3 updates remaining," but estimation wrong, clients run out faster. Erodes trust.
**Mitigation:**
- Choose Option B or C from DECISION-002 (not A)
- OR implement conservative estimation (e.g., assume 100K per update)
- OR hide budget in v1, show usage only
**Owner:** Product (Steve + Elon decision)

---

### RISK-006: Email Deliverability
**Severity:** MEDIUM | **Likelihood:** LOW
**Risk:** Critical emails ("Your site is live") land in spam. Clients miss updates.
**Mitigation:**
- Use reputable transactional ESP (Postmark, SendGrid)
- Configure SPF, DKIM, DMARC correctly
- Test deliverability across Gmail, Outlook, Apple Mail
- Add "Add to contacts" prompt in first email
**Owner:** DevOps + Email provider setup

---

### RISK-007: One Developer Building This
**Severity:** HIGH | **Likelihood:** MEDIUM
**Risk:** Elon claims "one agent session can scaffold v1 in 6-8 hours." If wrong, timeline blows.
**Mitigation:**
- Scope is genuinely minimal (Auth + intake + payment + status + webhooks)
- Use proven stack (Next.js + Supabase + Stripe all have excellent docs)
- Break into phases: Day 1-2 (auth), Day 3-4 (intake), Day 5-6 (dashboard), Day 7 (polish)
- Fallback: If agent stalls, hand off to human dev
**Owner:** Dev team

---

## 7.2 Medium-Risk Items

### RISK-008: Design Quality Slips in v1
**Severity:** MEDIUM | **Likelihood:** MEDIUM
**Mitigation:**
- Use Shadcn/ui for components (pre-built, beautiful defaults)
- Apply Steve's voice principles to copy (free, high-impact)
- Clean layout with white space (no Comic Sans)
**Owner:** Design oversight

---

### RISK-009: Scaling Assumptions Wrong
**Severity:** LOW | **Likelihood:** LOW
**Mitigation:**
- Supabase handles 100K+ rows easily (validated in production)
- Vercel auto-scales Next.js
- Add DB indexes on `client_id`, `status`, `created_at`
- Monitor query performance from day 1
**Owner:** DevOps

---

### RISK-010: Feature Creep During Development
**Severity:** LOW | **Likelihood:** MEDIUM
**Mitigation:**
- Lock scope in decisions doc (this one)
- No additions without Phil's approval
- Separate v1, v1.5, v2 backlogs clearly
- Ship v1 even if imperfect
**Owner:** Phil Jackson (PM)

---

---

# SECTION 8: REQUIREMENTS TRACEABILITY MATRIX

## 8.1 PRD → Requirements Mapping

| PRD Section | Requirements |
|-------------|--------------|
| Problem Statement | REQ-INTAKE-005, REQ-RETAINER-001, REQ-DASH-002 |
| Success Criteria | METRIC-001 through METRIC-015 |
| Scope: Authentication | REQ-AUTH-001 through REQ-AUTH-005 |
| Scope: Project Intake | REQ-INTAKE-001 through REQ-INTAKE-005 |
| Scope: Project Dashboard | REQ-DASH-001 through REQ-DASH-006 |
| Scope: Post-Launch Analytics | REQ-ANALYTICS-001 through REQ-ANALYTICS-005 |
| Scope: Retainer Subscription | REQ-RETAINER-001 through REQ-RETAINER-007 |
| Scope: Notifications & Email | REQ-EMAIL-001 through REQ-EMAIL-007 |
| Technical Requirements | REQ-DB-001 through REQ-DB-009, REQ-NFR-* |
| API Endpoints | REQ-WEBHOOK-001, REQ-WEBHOOK-002, REQ-WEBHOOK-003 |
| Database Schema | REQ-DB-001 through REQ-DB-009 |
| User Stories | Covered by METRIC-* and narrative requirements |
| Milestones | Dev phases in Decisions §VIII |
| Pricing | REQ-INTAKE-001, REQ-RETAINER-002 |
| Risk Mitigation | RISK-001 through RISK-010 |

---

## 8.2 Decisions → Requirements Mapping

| Decisions Section | Requirements |
|------------------|--------------|
| Decision #1 (MVP Scope) | All REQ-* with "Locked" status |
| Decision #2 (Tech Stack) | REQ-NFR-012 through REQ-NFR-014 (Supabase/Vercel) |
| Decision #3 (Notifications) | REQ-EMAIL-001 through REQ-EMAIL-007 |
| Decision #4 (Design Voice) | REQ-NFR-001 through REQ-NFR-004 |
| Decision #5 (Auth) | REQ-AUTH-001 through REQ-AUTH-004 |
| Decision #6 (Analytics) | DECISION-001, REQ-ANALYTICS-001 through REQ-ANALYTICS-005 |
| Decision #7 (Token Budget) | DECISION-002, REQ-RETAINER-003 |
| Decision #8 (Subscriptions) | REQ-RETAINER-001 through REQ-RETAINER-007 |
| File Structure | Architecture scope (not direct requirements) |
| Database Schema | REQ-DB-001 through REQ-DB-009 |
| Open Questions | DECISION-001 through DECISION-006 |
| Risk Register | RISK-001 through RISK-010 |
| Success Metrics | METRIC-001 through METRIC-015 |

---

---

# SECTION 9: DEVELOPMENT PHASE BREAKDOWN

## Phase 1: Authentication & Database (Days 1-2)

**Deliverables:**
- Supabase project created and schema deployed
- Login/signup/password reset pages functional
- Middleware protecting authenticated routes
- Test account created and can log in

**Requirements (Must Complete):**
- REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-003, REQ-AUTH-004
- REQ-DB-001 through REQ-DB-009 (schema)
- REQ-NFR-008, REQ-NFR-009 (security)

**Blockers to Resolve:**
- None (auth scope is locked)

**Success Criteria:**
- [ ] `clients` table in production Supabase
- [ ] Signup form creates client record
- [ ] Login authenticates user
- [ ] Password reset works end-to-end
- [ ] Session persists across reloads

---

## Phase 2: Intake + Payment (Days 3-4)

**Deliverables:**
- Project intake form functional
- Stripe checkout integration
- Payment confirmation flow
- Retainer subscription page

**Requirements (Must Complete):**
- REQ-INTAKE-001 through REQ-INTAKE-005
- REQ-RETAINER-001 through REQ-RETAINER-007
- REQ-DB-002 (projects), REQ-DB-003 (retainers), REQ-DB-004 (retainer_updates)
- REQ-INTAKE-002, REQ-RETAINER-003 (token budget display — use DECISION-002 choice)

**Blockers to Resolve:**
- ⚠️ DECISION-002 (token budget format) — must choose before starting
- ⚠️ DECISION-005 (Stripe config) — must have Product ID + Price ID

**Success Criteria:**
- [ ] Intake form accepts project details
- [ ] Token estimate displays (per DECISION-002 choice)
- [ ] Stripe checkout processes payment
- [ ] Project created in DB with status='payment_confirmed'
- [ ] Retainer subscription can be purchased
- [ ] Stripe subscription ID stored in DB

---

## Phase 3: Dashboard + Webhooks (Days 5-6)

**Deliverables:**
- Project dashboard displays projects and status
- Pipeline webhook endpoint implemented
- Email notifications triggered on status change
- Stripe webhook handler implemented

**Requirements (Must Complete):**
- REQ-DASH-001 through REQ-DASH-006
- REQ-WEBHOOK-001 through REQ-WEBHOOK-003
- REQ-EMAIL-001 through REQ-EMAIL-007
- REQ-DB-005 (status_events)

**Blockers to Resolve:**
- ⚠️ DECISION-003 (webhook payload format) — must have exact schema from pipeline team
- ⚠️ DECISION-004 (email provider) — must have API key + domain configured

**Success Criteria:**
- [ ] Dashboard lists client projects
- [ ] Status displays accurately (updated from DB)
- [ ] Webhook endpoint receives and processes payload
- [ ] Email sent on status change
- [ ] Stripe webhook updates subscription status
- [ ] Manual status override available for ops

---

## Phase 4: Analytics + Polish (Day 7)

**Deliverables:**
- Analytics dashboard (if DECISION-001 chosen as Option A/B) or placeholder (if Option C)
- All copy reviewed for Steve's voice principles
- UI polished (Shadcn components, clean layout)
- End-to-end testing completed
- Deployment to production

**Requirements (Must Complete):**
- REQ-ANALYTICS-001 through REQ-ANALYTICS-005 (if applicable)
- REQ-NFR-001 through REQ-NFR-015 (all non-functional requirements)
- All acceptance criteria across all sections

**Blockers to Resolve:**
- ⚠️ DECISION-001 (analytics integration) — if Option A/B, implement; if Option C, add placeholder
- ⚠️ DECISION-006 (domain & deployment) — must have Vercel project + domain configured

**Success Criteria:**
- [ ] All pages meet design quality standards
- [ ] All copy uses direct truth voice (no buzzwords)
- [ ] Analytics integrated or placeholder shown (per DECISION-001)
- [ ] Performance: Dashboard < 2s, analytics < 3s
- [ ] Security audit passed (HTTPS, session security, etc.)
- [ ] E2E test: Client can signup → intake → pay → see project → receive email
- [ ] Deployed to production domain
- [ ] DNS configured (email + web)

---

---

# SECTION 10: FINAL CHECKLIST FOR BUILD KICKOFF

## Prerequisites (Team Responsibilities)

- [ ] **DECISION-001 Resolved:** Analytics integration (Option A, B, or C chosen)
- [ ] **DECISION-002 Resolved:** Token budget display format (Option A, B, or C chosen)
- [ ] **DECISION-003 Provided:** Pipeline webhook payload schema documented
- [ ] **DECISION-004 Provided:** Email service provider chosen (SendGrid/Postmark/AWS SES/Resend) + API key
- [ ] **DECISION-005 Provided:** Stripe product + price created, Product ID + Price ID shared
- [ ] **DECISION-006 Provided:** Domain + Vercel project configured, DNS records prepared

## Dev Environment

- [ ] Supabase project created (production + staging)
- [ ] Vercel project created (production + staging)
- [ ] GitHub repo access confirmed
- [ ] Stripe test account access confirmed
- [ ] Email provider test account access confirmed
- [ ] Environment variables template prepared

## Design & Documentation

- [ ] PRD reviewed and understood
- [ ] Decisions document reviewed and understood
- [ ] **This requirements document printed/available during development**
- [ ] Steve's voice principles guide available (reference for copy review)
- [ ] Shadcn/ui component library researched
- [ ] Design mockups (wireframes) approved by Steve (optional for v1)

## QA & Launch

- [ ] QA test plan prepared (reference: METRIC-001 through METRIC-006)
- [ ] Production deployment checklist prepared
- [ ] Post-launch monitoring setup (error tracking, performance)
- [ ] Rollback plan prepared (in case critical issue)
- [ ] Customer onboarding email template prepared (for first retainer clients)
- [ ] Support team briefed on portal features

---

---

# APPENDIX A: GLOSSARY

| Term | Definition |
|------|-----------|
| **v1** | Initial MVP release (minimal features, validates demand) |
| **v1.5** | Polish release (design refinement, analytics if deferred, weekly summaries) |
| **v2+** | Future releases (advanced features, team accounts, mobile, etc.) |
| **Retainer** | $299/month subscription with 500K token budget |
| **Token** | Unit of cost for project work (1K tokens ≈ ~20 min of AI token usage) |
| **Webhook** | HTTP callback from pipeline service to portal (status updates) |
| **Stripe Elements** | Embedded payment UI (not Stripe-hosted redirect) |
| **Steve's Voice** | Direct, confident, no corporate speak ("Your site is live" not "deployment successful") |
| **Elon's Velocity** | Ship fast, minimize scope, validate demand before building feature-complete SaaS |
| **SLA** | Service Level Agreement (e.g., 99% email delivery rate) |
| **Idempotent** | Webhook handler can be called multiple times safely (same result each time) |

---

---

# APPENDIX B: REQUIREMENTS BY PRIORITY

## Must-Have (v1 MVP)

### Authentication
- REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-003, REQ-AUTH-004

### Intake + Payment
- REQ-INTAKE-001, REQ-INTAKE-002, REQ-INTAKE-003, REQ-INTAKE-004, REQ-INTAKE-005

### Dashboard
- REQ-DASH-001, REQ-DASH-002, REQ-DASH-003, REQ-DASH-004, REQ-DASH-005, REQ-DASH-006

### Retainer
- REQ-RETAINER-001, REQ-RETAINER-002, REQ-RETAINER-003, REQ-RETAINER-004, REQ-RETAINER-005, REQ-RETAINER-006

### Email
- REQ-EMAIL-001, REQ-EMAIL-002, REQ-EMAIL-003, REQ-EMAIL-004, REQ-EMAIL-006, REQ-EMAIL-007

### Webhooks
- REQ-WEBHOOK-001, REQ-WEBHOOK-002, REQ-WEBHOOK-003

### Database
- REQ-DB-001 through REQ-DB-009

### Non-Functional
- REQ-NFR-001 through REQ-NFR-015 (all)

---

## Should-Have (v1.5 or later)

### Analytics (conditional on DECISION-001)
- REQ-ANALYTICS-001, REQ-ANALYTICS-002, REQ-ANALYTICS-003, REQ-ANALYTICS-004

### Email
- REQ-EMAIL-005 (weekly summaries)

---

## Nice-to-Have (v2+)

### Authentication
- REQ-AUTH-005 (magic link, OAuth, team accounts, SSO)

### Retainer
- REQ-RETAINER-007 (upgrade/downgrade tiers, usage alerts)

### Dashboard
- Enhanced status tracking, communication history, recommendations engine

---

---

# APPENDIX C: OPEN QUESTIONS TRACKING

| # | Question | Owner | Deadline | Status | Resolution |
|---|----------|-------|----------|--------|-----------|
| 1 | Analytics integration? | Steve + Elon | Day 1 | ⚠️ OPEN | Choose A, B, or C |
| 2 | Token budget display? | Steve + Elon | Day 3 | ⚠️ OPEN | Choose A, B, or C |
| 3 | Webhook payload format? | Pipeline team | Day 5 | ⚠️ OPEN | Document schema |
| 4 | Email service provider? | Elon | Day 4 | ⚠️ OPEN | Choose provider, provide API key |
| 5 | Stripe product/price setup? | Finance + Dev | Day 3 | ⚠️ OPEN | Create in Stripe, share IDs |
| 6 | Domain & deployment? | DevOps | Day 7 | ⚠️ OPEN | Configure Vercel, DNS |

---

**Document Status:** ✅ READY FOR DEVELOPMENT

**Next Steps:**
1. Review and sign off on requirements
2. Resolve 6 open decisions (DECISION-001 through DECISION-006)
3. Begin Phase 1 development
4. Update this document as implementation reveals new requirements

**Questions or Changes?** Contact Phil Jackson (Project Manager)

---

*End of Atomic Requirements List*
