# Phase 1 Plan — Shipyard Client Portal (MVP v1)

**Generated**: 2026-04-15
**Project**: shipyard-client-portal
**Requirements**: `/home/agent/shipyard-ai/.planning/shipyard-client-portal-REQUIREMENTS.md`
**PRD**: `/home/agent/shipyard-ai/prds/shipyard-client-portal.md`
**Decisions**: `/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md`
**Total Tasks**: 23
**Waves**: 4

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-AUTH-001 (Signup) | phase-1-task-01 | 1 |
| REQ-AUTH-002 (Login) | phase-1-task-02 | 1 |
| REQ-AUTH-003 (Password Reset) | phase-1-task-03 | 1 |
| REQ-AUTH-004 (Sessions) | phase-1-task-04 | 1 |
| REQ-DB-001-005 (Schema) | phase-1-task-05 | 1 |
| REQ-INTAKE-001 (Intake Form) | phase-1-task-06 | 2 |
| REQ-INTAKE-003 (Stripe Checkout) | phase-1-task-07 | 2 |
| REQ-INTAKE-004 (Project Creation) | phase-1-task-08 | 2 |
| REQ-RETAINER-001 (Subscription) | phase-1-task-09 | 2 |
| REQ-RETAINER-002 (Subscription Details) | phase-1-task-10 | 2 |
| REQ-DASH-001 (Project List) | phase-1-task-11 | 3 |
| REQ-DASH-002 (Status Display) | phase-1-task-12 | 3 |
| REQ-DASH-003 (View Site Button) | phase-1-task-13 | 3 |
| REQ-WEBHOOK-001 (Pipeline Webhook) | phase-1-task-14 | 3 |
| REQ-WEBHOOK-002 (Stripe Webhook) | phase-1-task-15 | 3 |
| REQ-EMAIL-001 (Email Service) | phase-1-task-16 | 3 |
| REQ-EMAIL-002 (Site Live Email) | phase-1-task-17 | 3 |
| REQ-EMAIL-003 (Build Failed Email) | phase-1-task-18 | 3 |
| REQ-NFR-001 (Voice Principles) | phase-1-task-19 | 4 |
| REQ-NFR-002 (Clean UI) | phase-1-task-20 | 4 |
| REQ-NFR-005 (Performance) | phase-1-task-21 | 4 |
| REQ-NFR-008-011 (Security) | phase-1-task-22 | 4 |
| Deployment | phase-1-task-23 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel — Foundation & Auth)

These tasks are independent and establish the foundation. All can run in parallel.

---

```xml
<task-plan id="phase-1-task-01" wave="1">
  <title>Implement Email/Password Signup</title>
  <requirement>REQ-AUTH-001: Clients can create account using email and password</requirement>
  <description>
    Build signup flow using Supabase Auth. Create signup page with form validation,
    password hashing via Supabase, and automatic login after signup. Redirect new users
    to dashboard or intake form.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Auth scope locked (email/password only for v1)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-AUTH-001 acceptance criteria and testable conditions" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Reference auth patterns from /deliverables/shipyard-care/lib/auth.ts (adapt for Supabase)" />
    <file path="/home/agent/shipyard-ai/website/src/app/contact/ContactForm.tsx" reason="Form validation pattern (state management, error handling, submission flow)" />
  </context>

  <steps>
    <step order="1">Install @supabase/supabase-js and configure Supabase client (create /lib/supabase/client.ts and /lib/supabase/server.ts)</step>
    <step order="2">Create signup page at /app/(auth)/signup/page.tsx with email, password, password confirmation fields</step>
    <step order="3">Add form validation: email format check, password min 8 chars, password confirmation match</step>
    <step order="4">Implement signup handler using Supabase Auth signup method</step>
    <step order="5">On successful signup, auto-login and redirect to dashboard</step>
    <step order="6">Handle errors: email already exists, weak password, network errors</step>
    <step order="7">Create client record in clients table (id from Supabase auth.user.id, email)</step>
  </steps>

  <verification>
    <check type="manual">Navigate to /signup, submit form with valid email/password, verify redirected to dashboard</check>
    <check type="manual">Attempt signup with existing email, verify error message displayed</check>
    <check type="manual">Verify client record created in Supabase clients table</check>
    <check type="test">Unit test form validation logic</check>
  </verification>

  <dependencies></dependencies>

  <commit-message>feat: implement email/password signup with Supabase Auth

- Add Supabase client configuration
- Create signup page with form validation
- Handle signup errors and auto-login
- Create client record in database

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-02" wave="1">
  <title>Implement Email/Password Login</title>
  <requirement>REQ-AUTH-002: Clients can log in with email and password</requirement>
  <description>
    Build login flow using Supabase Auth. Create login page with email/password form,
    session creation, and redirect to dashboard. Implement generic error messages to
    prevent email enumeration attacks.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Auth scope and session management requirements" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-AUTH-002 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Session patterns from /deliverables/shipyard-care" />
    <file path="/home/agent/shipyard-ai/website/src/app/contact/ContactForm.tsx" reason="Form state management pattern" />
  </context>

  <steps>
    <step order="1">Create login page at /app/(auth)/login/page.tsx with email and password fields</step>
    <step order="2">Implement login handler using Supabase Auth signIn method</step>
    <step order="3">On successful login, create session and redirect to dashboard</step>
    <step order="4">On failed login, display generic error: "Invalid credentials" (don't reveal if email exists)</step>
    <step order="5">Add "Forgot password?" link to password reset page</step>
    <step order="6">Log failed login attempts for security audit (optional, via Supabase)</step>
  </steps>

  <verification>
    <check type="manual">Log in with valid credentials, verify redirected to dashboard</check>
    <check type="manual">Log in with invalid credentials, verify generic error message</check>
    <check type="manual">Verify session persists across page reloads</check>
    <check type="test">Unit test login form validation</check>
  </verification>

  <dependencies></dependencies>

  <commit-message>feat: implement email/password login flow

- Create login page with form validation
- Integrate Supabase Auth signIn
- Handle login errors generically
- Add link to password reset

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-03" wave="1">
  <title>Implement Password Reset via Email</title>
  <requirement>REQ-AUTH-003: Clients can reset forgotten passwords using email link</requirement>
  <description>
    Build password reset flow using Supabase Auth. Create "forgot password" page where user
    enters email, receives reset link, and updates password. Reset links are time-limited
    (24 hours) and single-use.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Password reset flow scoped for v1" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-AUTH-003 acceptance criteria (24h expiry, single-use)" />
  </context>

  <steps>
    <step order="1">Create forgot password page at /app/(auth)/reset-password/page.tsx</step>
    <step order="2">Add email input field and submit button</step>
    <step order="3">Implement reset request handler using Supabase Auth resetPasswordForEmail</step>
    <step order="4">Configure email template in Supabase dashboard (or use default) with reset link</step>
    <step order="5">Create password update page at /app/(auth)/reset-password/confirm/page.tsx</step>
    <step order="6">On password update form, validate new password (min 8 chars) and confirmation match</step>
    <step order="7">Use Supabase Auth updateUser method to set new password</step>
    <step order="8">After successful reset, redirect to login page with success message</step>
  </steps>

  <verification>
    <check type="manual">Request password reset, verify email received with reset link</check>
    <check type="manual">Click reset link, update password, verify redirected to login</check>
    <check type="manual">Verify can log in with new password</check>
    <check type="manual">Verify reset link expires after 24 hours (Supabase default)</check>
  </verification>

  <dependencies></dependencies>

  <commit-message>feat: implement password reset via email

- Add forgot password page
- Integrate Supabase Auth reset flow
- Create password update page
- Verify reset link expiry and single-use

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-04" wave="1">
  <title>Implement Session Management & Auth Middleware</title>
  <requirement>REQ-AUTH-004: User sessions managed securely via Supabase Auth</requirement>
  <description>
    Configure session persistence, implement auth middleware to protect dashboard routes,
    handle session expiry (redirect to login), and implement logout functionality.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Supabase session management requirements" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-AUTH-004 acceptance criteria (7-day expiry, CSRF protection)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Session patterns reference" />
  </context>

  <steps>
    <step order="1">Create middleware.ts in project root to check auth status on protected routes</step>
    <step order="2">Use Supabase getUser() to verify session on each request to /dashboard/*</step>
    <step order="3">If no valid session, redirect to /login with returnUrl parameter</step>
    <step order="4">Configure session expiry (7 days default via Supabase)</step>
    <step order="5">Implement logout handler at /api/auth/logout/route.ts using Supabase signOut</step>
    <step order="6">Clear session cookie and redirect to login on logout</step>
    <step order="7">Verify CSRF protection via Next.js default (SameSite=strict cookies)</step>
  </steps>

  <verification>
    <check type="manual">Access /dashboard without login, verify redirected to /login</check>
    <check type="manual">Log in, verify can access /dashboard</check>
    <check type="manual">Log out, verify session cleared and redirected to /login</check>
    <check type="manual">Verify session persists across page reloads for 7 days</check>
    <check type="test">Unit test middleware redirect logic</check>
  </verification>

  <dependencies></dependencies>

  <commit-message>feat: implement session management and auth middleware

- Add Next.js middleware for protected routes
- Integrate Supabase session verification
- Implement logout handler
- Configure session expiry and CSRF protection

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-05" wave="1">
  <title>Deploy Database Schema to Supabase</title>
  <requirement>REQ-DB-001 through REQ-DB-005: Create clients, projects, retainers, retainer_updates, status_events tables</requirement>
  <description>
    Create all database tables in Supabase PostgreSQL using SQL migrations. Includes clients,
    projects, retainers, retainer_updates, and status_events tables with proper indexes,
    foreign keys, and constraints per schema spec.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Complete database schema SQL in section III" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-DB-001 through REQ-DB-005 schema specifications and acceptance criteria" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Migration patterns from /deliverables/shipyard-care/migrations/" />
    <file path="/home/agent/shipyard-ai/packages/db/schema/subscriptions.ts" reason="Existing subscription schema pattern to adapt" />
  </context>

  <steps>
    <step order="1">Create migration file: 001_create_clients_table.sql with clients schema</step>
    <step order="2">Create migration file: 002_create_projects_table.sql with projects schema and foreign key to clients</step>
    <step order="3">Create migration file: 003_create_retainers_table.sql with retainers schema and foreign key to clients</step>
    <step order="4">Create migration file: 004_create_retainer_updates_table.sql with foreign key to retainers</step>
    <step order="5">Create migration file: 005_create_status_events_table.sql with foreign key to projects</step>
    <step order="6">Add indexes: idx_projects_client_id, idx_projects_status, idx_retainers_client_id, idx_status_events_project_id</step>
    <step order="7">Run migrations in Supabase SQL Editor or via Supabase CLI</step>
    <step order="8">Verify all tables created with correct schema and relationships</step>
  </steps>

  <verification>
    <check type="manual">Query Supabase to verify all 5 tables exist</check>
    <check type="manual">Verify foreign key constraints work (insert project with valid client_id)</check>
    <check type="manual">Verify indexes created (query pg_indexes)</check>
    <check type="test">Insert test data: 1 client, 1 project, verify relationships work</check>
  </verification>

  <dependencies></dependencies>

  <commit-message>feat: deploy database schema to Supabase

- Create clients, projects, retainers, retainer_updates, status_events tables
- Add foreign key constraints and indexes
- Run migrations in Supabase

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

### Wave 2 (Parallel after Wave 1 — Intake & Retainers)

These tasks depend on Wave 1 completing (auth + database must exist first). All Wave 2 tasks can run in parallel.

---

```xml
<task-plan id="phase-1-task-06" wave="2">
  <title>Build Project Intake Form</title>
  <requirement>REQ-INTAKE-001: Clients submit new projects via intake form</requirement>
  <description>
    Create project intake form page with validation, scope selection (Emdash Site/Theme/Plugin),
    token estimation display (format per DECISION-002), and submission handler that creates
    project record with status='intake'.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Intake form requirements and token estimation decision" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-INTAKE-001, REQ-INTAKE-002 acceptance criteria" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Form pattern from /website/src/app/contact/ContactForm.tsx" />
    <file path="/home/agent/shipyard-ai/website/src/app/contact/ContactForm.tsx" reason="Client component form state, validation, submission pattern" />
  </context>

  <steps>
    <step order="1">Create intake page at /app/(dashboard)/intake/page.tsx</step>
    <step order="2">Add form fields: project name (required, min 3 chars), description (required, min 50 chars), scope dropdown (Emdash Site/Theme/Plugin)</step>
    <step order="3">Add optional fields: design references (text), integrations (text), timeline preferences (text)</step>
    <step order="4">Implement token estimation display based on scope selection (per DECISION-002 choice)</step>
    <step order="5">Add form validation: required fields, min lengths, email format</step>
    <step order="6">Create API route at /app/api/projects/route.ts to handle POST (create project)</step>
    <step order="7">On submit, call API to create project with status='intake', client_id from session</step>
    <step order="8">Redirect to Stripe checkout page on successful submission</step>
  </steps>

  <verification>
    <check type="manual">Fill out intake form, verify validation errors on empty fields</check>
    <check type="manual">Submit valid form, verify project created in DB with status='intake'</check>
    <check type="manual">Verify token estimate displays correctly based on scope</check>
    <check type="manual">Verify redirected to payment page after submission</check>
    <check type="test">Unit test form validation logic</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-05" reason="Requires projects table to exist" />
    <depends-on task-id="phase-1-task-04" reason="Requires auth session to get client_id" />
  </dependencies>

  <commit-message>feat: build project intake form with validation

- Create intake form page with scope selection
- Add token estimation display
- Implement form validation and submission
- Create API route for project creation

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-07" wave="2">
  <title>Integrate Stripe Checkout for Project Payment</title>
  <requirement>REQ-INTAKE-003: Clients pay for projects via Stripe checkout</requirement>
  <description>
    Implement Stripe checkout integration for project payments. Create checkout session,
    handle payment success/failure, update project status to 'payment_confirmed', send
    receipt email, and redirect to dashboard.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Stripe integration locked, one-time payment flow" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-INTAKE-003 acceptance criteria (Stripe Elements, payment intent confirmation)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Stripe client from /apps/pulse/lib/stripe.ts (production-ready, copy directly)" />
    <file path="/home/agent/shipyard-ai/apps/pulse/lib/stripe.ts" reason="Stripe client setup, error handling, idempotency patterns" />
  </context>

  <steps>
    <step order="1">Copy Stripe client from /apps/pulse/lib/stripe.ts to /lib/stripe/client.ts</step>
    <step order="2">Install stripe package and configure with STRIPE_SECRET_KEY env var</step>
    <step order="3">Create API route at /app/api/stripe/checkout/route.ts to create checkout session</step>
    <step order="4">On intake form submission, call checkout API with project ID and amount</step>
    <step order="5">Create Stripe Elements checkout UI (embedded, not redirect) at /app/payment/[projectId]/page.tsx</step>
    <step order="6">Handle payment success: update project status to 'payment_confirmed', redirect to dashboard</step>
    <step order="7">Handle payment failure: display error message, keep project in 'intake' status</step>
    <step order="8">Send receipt email on payment success (integrate with email service in Wave 3)</step>
  </steps>

  <verification>
    <check type="manual">Complete intake form, verify redirected to Stripe checkout</check>
    <check type="manual">Pay with test card (4242 4242 4242 4242), verify payment succeeds</check>
    <check type="manual">Verify project status updated to 'payment_confirmed' in DB</check>
    <check type="manual">Verify redirected to dashboard showing new project</check>
    <check type="test">Test payment failure scenario with declined card (4000 0000 0000 0002)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-06" reason="Requires intake form to create project before payment" />
    <depends-on task-id="phase-1-task-05" reason="Requires projects table to update status" />
  </dependencies>

  <commit-message>feat: integrate Stripe checkout for project payment

- Copy Stripe client from pulse lib
- Create checkout session API route
- Build Stripe Elements checkout UI
- Handle payment success/failure and status updates

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-08" wave="2">
  <title>Implement Project Creation Flow</title>
  <requirement>REQ-INTAKE-004: Project intake + payment creates project record in database</requirement>
  <description>
    Complete end-to-end project creation flow: intake form submission creates project with
    status='intake', payment success updates to 'payment_confirmed', Stripe payment ID stored
    for reconciliation, project immediately visible in client dashboard.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Project creation workflow and status values" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-INTAKE-004 acceptance criteria (fields, status transitions)" />
  </context>

  <steps>
    <step order="1">Verify API route /app/api/projects/route.ts creates project with all required fields</step>
    <step order="2">Add Stripe payment intent ID field to projects table (nullable, updated on payment)</step>
    <step order="3">On payment success webhook, update project with stripe_payment_id</step>
    <step order="4">Verify project transitions: intake → payment_confirmed → (later) in_progress</step>
    <step order="5">Query dashboard to show projects WHERE client_id = current_user</step>
    <step order="6">Verify client sees new project immediately after payment</step>
  </steps>

  <verification>
    <check type="manual">Create project via intake, verify in DB with status='intake'</check>
    <check type="manual">Complete payment, verify status updated to 'payment_confirmed'</check>
    <check type="manual">Verify stripe_payment_id stored in project record</check>
    <check type="manual">Verify project appears in client dashboard immediately</check>
    <check type="test">Integration test: intake → payment → dashboard display</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-06" reason="Requires intake form to create project" />
    <depends-on task-id="phase-1-task-07" reason="Requires Stripe checkout to complete payment" />
  </dependencies>

  <commit-message>feat: complete project creation flow with payment

- Add Stripe payment ID to projects table
- Update project status on payment success
- Verify end-to-end intake to dashboard flow

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-09" wave="2">
  <title>Implement Retainer Subscription Flow</title>
  <requirement>REQ-RETAINER-001: Clients can subscribe to monthly retainer tier at $299/month</requirement>
  <description>
    Build retainer subscription page with Stripe subscription checkout. Create recurring
    subscription, store Stripe subscription ID in retainers table, enable self-service
    cancel/update via Stripe Customer Portal.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Retainer subscription requirements, $299/month tier, Stripe Customer Portal" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-RETAINER-001 acceptance criteria (subscription creation, self-service)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Subscription patterns from /packages/db/schema/subscriptions.ts" />
  </context>

  <steps>
    <step order="1">Create retainer subscription page at /app/(dashboard)/retainer/page.tsx</step>
    <step order="2">Add "Subscribe to Retainer" button ($299/month display)</step>
    <step order="3">Create API route at /app/api/stripe/subscription/route.ts for creating subscription</step>
    <step order="4">On subscribe click, create Stripe subscription with price_id (from env var STRIPE_RETAINER_PRICE_ID)</step>
    <step order="5">On subscription success, create record in retainers table with stripe_subscription_id, status='active', token_budget=500000</step>
    <step order="6">Display active subscription status on retainer page</step>
    <step order="7">Add "Manage Subscription" button linking to Stripe Customer Portal (self-service cancel/update)</step>
    <step order="8">Create Stripe Customer Portal session API route at /app/api/stripe/portal/route.ts</step>
  </steps>

  <verification>
    <check type="manual">Click Subscribe button, verify Stripe checkout opens</check>
    <check type="manual">Complete subscription with test card, verify subscription created in Stripe</check>
    <check type="manual">Verify retainer record created in DB with status='active'</check>
    <check type="manual">Click Manage Subscription, verify Stripe Customer Portal opens</check>
    <check type="manual">Cancel subscription in portal, verify status updated to 'canceled' (tested in Wave 3 webhook)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-05" reason="Requires retainers table to exist" />
    <depends-on task-id="phase-1-task-04" reason="Requires auth session to get client_id" />
  </dependencies>

  <commit-message>feat: implement retainer subscription flow

- Create retainer subscription page
- Integrate Stripe subscription checkout
- Add Stripe Customer Portal for self-service
- Create retainer record in database

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-10" wave="2">
  <title>Implement Retainer Token Budget Tracking</title>
  <requirement>REQ-RETAINER-002: Retainer record captures subscription and token tracking</requirement>
  <description>
    Implement token budget tracking in retainers table. Initialize token_budget to 500K on
    subscription creation, track tokens_used as requests completed, display remaining budget
    on retainer dashboard (format per DECISION-002).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Token budget details, reset logic, display format decision" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-RETAINER-002, REQ-RETAINER-003 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Verify retainers table has token_budget (default 500000) and tokens_used (default 0) columns</step>
    <step order="2">On subscription creation, initialize token_budget and tokens_used</step>
    <step order="3">Display token budget on retainer page (format per DECISION-002: Option A/B/C)</step>
    <step order="4">If Option B chosen: display "185K tokens remaining (~3-5 updates)" with simple calculation</step>
    <step order="5">Create component /components/dashboard/token-counter.tsx to display budget</step>
    <step order="6">Query retainer record to get current budget and usage</step>
    <step order="7">Add placeholder for token deduction logic (completed in future when maintenance requests implemented)</step>
  </steps>

  <verification>
    <check type="manual">Subscribe to retainer, verify token_budget=500000 in DB</check>
    <check type="manual">Verify retainer page displays token budget in chosen format</check>
    <check type="manual">Manually update tokens_used in DB, refresh page, verify display updates</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-09" reason="Requires retainer subscription to exist before tracking tokens" />
    <depends-on task-id="phase-1-task-05" reason="Requires retainers table with token fields" />
  </dependencies>

  <commit-message>feat: implement retainer token budget tracking

- Initialize token_budget and tokens_used on subscription
- Create token counter display component
- Show remaining budget on retainer page

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

### Wave 3 (Parallel after Wave 2 — Dashboard, Webhooks, Emails)

These tasks depend on Wave 2 completing (projects and retainers must exist). All Wave 3 tasks can run in parallel.

---

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Build Project Dashboard with Project List</title>
  <requirement>REQ-DASH-001: Clients see list of their projects (active and completed)</requirement>
  <description>
    Create main dashboard page displaying all client projects. List shows project name, status,
    date created. Active projects sorted to top, completed projects below. Clickable to view
    project details. Includes "Start New Project" button.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Dashboard layout requirements, clean minimal UI" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-DASH-001 acceptance criteria (query, sort, display)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Layout patterns from /website/src/app/layout.tsx" />
  </context>

  <steps>
    <step order="1">Create dashboard layout at /app/(dashboard)/layout.tsx with sidebar navigation</step>
    <step order="2">Create main dashboard page at /app/(dashboard)/page.tsx</step>
    <step order="3">Query projects WHERE client_id = current_user ORDER BY status, created_at DESC</step>
    <step order="4">Create ProjectCard component at /components/dashboard/project-card.tsx</step>
    <step order="5">Display list of projects with name, status badge, created date</step>
    <step order="6">Add "Start New Project" button linking to /intake</step>
    <step order="7">Make project cards clickable to /dashboard/projects/[id]</step>
    <step order="8">Sort: in_progress/review projects first, then live, then completed</step>
  </steps>

  <verification>
    <check type="manual">Log in, verify dashboard displays all client projects</check>
    <check type="manual">Verify projects sorted with active ones at top</check>
    <check type="manual">Click project card, verify redirects to project detail page</check>
    <check type="manual">Click "Start New Project", verify redirects to intake form</check>
    <check type="test">Unit test project query and sort logic</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-08" reason="Requires projects to exist in database" />
    <depends-on task-id="phase-1-task-04" reason="Requires auth session to query client projects" />
  </dependencies>

  <commit-message>feat: build project dashboard with project list

- Create dashboard layout with sidebar
- Query and display client projects
- Add project card component with status
- Implement sorting and navigation

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Implement Project Status Display</title>
  <requirement>REQ-DASH-002: Project dashboard shows current pipeline status</requirement>
  <description>
    Display project status prominently on dashboard. Text-based status for v1: "In Progress - Build Phase"
    or "Live". Status updated from pipeline webhook. Show last updated timestamp. Create status badge component.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="v1 status display (text-based, no progress rings yet)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-DASH-002 acceptance criteria (status values, timestamp)" />
  </context>

  <steps>
    <step order="1">Create StatusBadge component at /components/dashboard/status-badge.tsx</step>
    <step order="2">Map status enum to display text: intake → "Intake", in_progress → "In Progress - Build Phase", review → "Ready for Review", live → "Live", failed → "Build Failed"</step>
    <step order="3">Add color coding: green for "live", blue for "in_progress", yellow for "review", red for "failed"</step>
    <step order="4">Display status badge on project card and project detail page</step>
    <step order="5">Show "Last updated X hours ago" timestamp below status</step>
    <step order="6">Format timestamp using relative time (e.g., "2 hours ago", "1 day ago")</step>
  </steps>

  <verification>
    <check type="manual">View project dashboard, verify status displays for each project</check>
    <check type="manual">Manually update project status in DB, refresh page, verify new status displays</check>
    <check type="manual">Verify status color coding matches spec</check>
    <check type="manual">Verify timestamp displays relative time correctly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Requires dashboard to exist to display status" />
    <depends-on task-id="phase-1-task-08" reason="Requires projects with status field" />
  </dependencies>

  <commit-message>feat: implement project status display

- Create status badge component with color coding
- Map status enum to display text
- Add last updated timestamp
- Display on dashboard and detail pages

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-13" wave="3">
  <title>Implement View Site Button</title>
  <requirement>REQ-DASH-003: When project is live, client can click "View Site" to access deployed site</requirement>
  <description>
    Display "View Site →" button when project status is 'live' and site_url is populated.
    Button opens site in new tab. Not displayed for in-progress or failed projects. Uses
    Steve's voice for button text.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Steve's voice: 'View Site →' not 'Access Deployment'" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-DASH-003 acceptance criteria (conditional display, new tab)" />
  </context>

  <steps>
    <step order="1">In ProjectCard component, check if status === 'live' AND site_url !== null</step>
    <step order="2">If true, display button with text "View Site →"</step>
    <step order="3">Button links to site_url with target="_blank" and rel="noopener noreferrer"</step>
    <step order="4">Style button prominently (primary color, large, easy to click)</step>
    <step order="5">If status !== 'live', hide button</step>
    <step order="6">Add staging link button "View Staging →" when staging_url populated and status = 'review'</step>
  </steps>

  <verification>
    <check type="manual">Manually set project status='live' and site_url in DB, verify "View Site →" button appears</check>
    <check type="manual">Click button, verify opens site in new tab</check>
    <check type="manual">Set project status='in_progress', verify button hidden</check>
    <check type="manual">Set staging_url and status='review', verify "View Staging →" button appears</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-12" reason="Requires status display to show live status" />
    <depends-on task-id="phase-1-task-11" reason="Requires dashboard to display button" />
  </dependencies>

  <commit-message>feat: implement View Site button for live projects

- Add conditional View Site button when status='live'
- Open site in new tab with security attributes
- Add View Staging button for review status
- Apply Steve's voice to button text

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-14" wave="3">
  <title>Implement Pipeline Webhook Endpoint</title>
  <requirement>REQ-WEBHOOK-001: API endpoint receives status updates from Great Minds pipeline daemon</requirement>
  <description>
    Create webhook endpoint at /api/webhooks/pipeline to receive status updates from pipeline.
    Validate payload schema, update projects table (status, site_url, staging_url), create
    status_events audit record, trigger email notification. Handle errors gracefully.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Webhook payload schema (must be documented by pipeline team), DECISION-003" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-WEBHOOK-001 acceptance criteria (schema validation, DB update, audit trail)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Webhook patterns from /deliverables/shipyard-care/pages/api/stripe/webhook.ts" />
  </context>

  <steps>
    <step order="1">Create webhook route at /app/api/webhooks/pipeline/route.ts</step>
    <step order="2">Accept POST with expected payload: { project_id, status, site_url, staging_url, message, timestamp }</step>
    <step order="3">Validate payload schema using Zod (reject if malformed, return 400)</step>
    <step order="4">Validate webhook signature if provided by pipeline team (check header)</step>
    <step order="5">Update projects table: SET status=?, site_url=?, staging_url=?, updated_at=NOW() WHERE id=project_id</step>
    <step order="6">Insert status_events record: { project_id, status, message, created_at }</step>
    <step order="7">Trigger email notification based on status (call email service)</step>
    <step order="8">Log all webhook deliveries for debugging (success and failure)</step>
    <step order="9">Return 200 OK on success, 400 on validation failure, 500 on internal error</step>
  </steps>

  <verification>
    <check type="manual">Send test webhook payload via curl, verify 200 OK response</check>
    <check type="manual">Verify project status updated in DB</check>
    <check type="manual">Verify status_events record created</check>
    <check type="manual">Send malformed payload, verify 400 Bad Request response</check>
    <check type="test">Integration test: webhook → DB update → email trigger</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-05" reason="Requires projects and status_events tables" />
    <depends-on task-id="phase-1-task-16" reason="Requires email service to trigger notifications" />
  </dependencies>

  <commit-message>feat: implement pipeline webhook endpoint

- Create webhook route with schema validation
- Update project status and URLs in database
- Create status_events audit trail
- Trigger email notifications on status change

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-15" wave="3">
  <title>Implement Stripe Subscription Webhook Handler</title>
  <requirement>REQ-WEBHOOK-002: Stripe webhooks update retainer subscription state</requirement>
  <description>
    Create Stripe webhook endpoint to handle subscription events: updated, deleted, payment_failed,
    payment_succeeded. Update retainers table status, reset tokens on billing cycle, implement
    idempotency using Stripe event IDs.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Stripe webhook handling, idempotency requirements (RISK-003)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-WEBHOOK-002 acceptance criteria (event types, idempotency, status updates)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Webhook patterns from existing Stripe integrations" />
  </context>

  <steps>
    <step order="1">Create webhook route at /app/api/webhooks/stripe/route.ts</step>
    <step order="2">Verify Stripe webhook signature using STRIPE_WEBHOOK_SECRET env var</step>
    <step order="3">Create stripe_webhook_events table to track processed event IDs (idempotency)</step>
    <step order="4">On webhook receipt, check if event_id already processed (skip if duplicate)</step>
    <step order="5">Handle customer.subscription.updated: update retainers status, billing_cycle_start/end</step>
    <step order="6">Handle customer.subscription.deleted: set status='canceled'</step>
    <step order="7">Handle invoice.payment_failed: set status='past_due'</step>
    <step order="8">Handle invoice.payment_succeeded: set status='active', reset tokens_used=0, update billing_cycle</step>
    <step order="9">Insert event_id into stripe_webhook_events to prevent duplicate processing</step>
    <step order="10">Return 200 OK on success, log errors for debugging</step>
  </steps>

  <verification>
    <check type="manual">Trigger test webhook from Stripe dashboard, verify handler processes correctly</check>
    <check type="manual">Verify retainer status updated based on event type</check>
    <check type="manual">Send same webhook twice, verify processed only once (idempotency)</check>
    <check type="manual">Verify tokens_used reset on invoice.payment_succeeded</check>
    <check type="test">Unit test event handling for each event type</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-05" reason="Requires retainers table to update status" />
    <depends-on task-id="phase-1-task-09" reason="Requires retainer subscriptions to exist before webhooks fire" />
  </dependencies>

  <commit-message>feat: implement Stripe subscription webhook handler

- Create webhook route with signature verification
- Handle subscription lifecycle events
- Implement idempotency using event IDs
- Reset token budget on billing cycle renewal

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-16" wave="3">
  <title>Integrate Email Service Provider</title>
  <requirement>REQ-EMAIL-001: System sends transactional emails via external provider</requirement>
  <description>
    Integrate email service provider (chosen via DECISION-004). Configure API client, create
    email sending utility function, configure SPF/DKIM/DMARC records for deliverability, test
    email delivery across Gmail/Outlook/Apple Mail.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Email service provider choice (DECISION-004), deliverability requirements (RISK-006)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-EMAIL-001 acceptance criteria (provider selection, SPF/DKIM config)" />
  </context>

  <steps>
    <step order="1">Install email provider SDK (e.g., @sendgrid/mail, postmark, resend)</step>
    <step order="2">Create email client at /lib/email/send.ts with API key from env var</step>
    <step order="3">Create sendEmail function: (to, subject, html, text) => Promise&lt;void&gt;</step>
    <step order="4">Configure sender domain in email provider dashboard (e.g., team@shipyard.ai)</step>
    <step order="5">Add SPF record to DNS: "v=spf1 include:sendgrid.net ~all" (or provider equivalent)</step>
    <step order="6">Add DKIM record provided by email provider to DNS</step>
    <step order="7">Add DMARC record (optional): "v=DMARC1; p=quarantine; rua=mailto:dmarc@shipyard.ai"</step>
    <step order="8">Send test email to Gmail, Outlook, Apple Mail, verify delivery and not spam</step>
    <step order="9">Add error handling and retry logic (exponential backoff on transient failures)</step>
  </steps>

  <verification>
    <check type="manual">Send test email via sendEmail function, verify received in inbox</check>
    <check type="manual">Verify SPF/DKIM headers pass (check email headers)</check>
    <check type="manual">Test delivery to Gmail, Outlook, Apple Mail (not spam)</check>
    <check type="manual">Test error handling: invalid email address, API key error</check>
    <check type="test">Unit test sendEmail function with mocked provider</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-05" reason="Email may reference client/project data from DB" />
  </dependencies>

  <commit-message>feat: integrate email service provider

- Install and configure email provider SDK
- Create sendEmail utility function
- Configure SPF/DKIM/DMARC for deliverability
- Test email delivery across providers

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-17" wave="3">
  <title>Implement "Site Live" Email Notification</title>
  <requirement>REQ-EMAIL-002: Email sent when project status changes to 'live'</requirement>
  <description>
    Create email template for "Your site is live" notification. Triggered by pipeline webhook
    when status='live'. Email includes direct truth voice, link to live site, sent within 1 minute
    of webhook. Uses React Email or plain HTML template.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Steve's voice principles (direct truth, no corporate speak)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-EMAIL-002 acceptance criteria (subject, body, voice, timing)" />
  </context>

  <steps>
    <step order="1">Create email template at /components/email-templates/site-live-template.tsx (React Email or plain HTML)</step>
    <step order="2">Template subject: "Your site is live"</step>
    <step order="3">Template body: "Your site is live. [View Site →] {site_url}. We deployed it {X} hours ago. Everything's working."</step>
    <step order="4">Apply Steve's voice: direct, confident, no buzzwords</step>
    <step order="5">Include link to portal dashboard: "See details in your dashboard: {portal_url}"</step>
    <step order="6">In pipeline webhook handler (phase-1-task-14), trigger email on status='live'</step>
    <step order="7">Pass project.site_url and client.email to sendEmail function</step>
    <step order="8">Log email delivery success/failure</step>
  </steps>

  <verification>
    <check type="manual">Trigger webhook with status='live', verify email sent within 1 minute</check>
    <check type="manual">Verify email subject and body match spec</check>
    <check type="manual">Verify site URL link works and opens in browser</check>
    <check type="manual">Review email copy for Steve's voice compliance (no corporate speak)</check>
    <check type="test">Unit test email template rendering</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Requires email service to send emails" />
    <depends-on task-id="phase-1-task-14" reason="Requires pipeline webhook to trigger email" />
  </dependencies>

  <commit-message>feat: implement Site Live email notification

- Create email template with direct truth voice
- Trigger email on pipeline webhook status='live'
- Include site URL and dashboard link
- Log email delivery

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-18" wave="3">
  <title>Implement "Build Failed" Email Notification</title>
  <requirement>REQ-EMAIL-003: Email sent when project build fails</requirement>
  <description>
    Create email template for build failure notification. Triggered by pipeline webhook when
    status='failed'. Email includes error message (if available), expected resolution time,
    escalation contact. Uses direct truth voice: "The build failed. We're fixing it. Update in 2 hours."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Steve's voice for error messages (direct, no panic)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-EMAIL-003 acceptance criteria (timing, error message, voice)" />
  </context>

  <steps>
    <step order="1">Create email template at /components/email-templates/build-failed-template.tsx</step>
    <step order="2">Template subject: "We're fixing an issue with your project"</step>
    <step order="3">Template body: "The build failed. We're fixing it. Update in 2 hours. Error: {message}. Contact support@shipyard.ai if urgent."</step>
    <step order="4">Apply Steve's voice: direct, confident, no jargon or panic</step>
    <step order="5">Include error message from webhook payload (if provided)</step>
    <step order="6">In pipeline webhook handler, trigger email on status='failed'</step>
    <step order="7">Pass error message and client.email to sendEmail function</step>
    <step order="8">Log email delivery</step>
  </steps>

  <verification>
    <check type="manual">Trigger webhook with status='failed', verify email sent within 1 minute</check>
    <check type="manual">Verify email subject and body match spec</check>
    <check type="manual">Verify error message included in email body</check>
    <check type="manual">Review email copy for voice compliance (no panic, direct truth)</check>
    <check type="test">Unit test email template rendering</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Requires email service to send emails" />
    <depends-on task-id="phase-1-task-14" reason="Requires pipeline webhook to trigger email" />
  </dependencies>

  <commit-message>feat: implement Build Failed email notification

- Create email template with error message
- Trigger email on pipeline webhook status='failed'
- Apply direct truth voice (no panic)
- Include escalation contact

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

### Wave 4 (After Wave 3 — Polish & Deployment)

These tasks depend on all core functionality being complete. They focus on quality, security, and production deployment.

---

```xml
<task-plan id="phase-1-task-19" wave="4">
  <title>Copy Review & Voice Compliance Audit</title>
  <requirement>REQ-NFR-001: All copy uses direct truth voice, no corporate speak or passive voice</requirement>
  <description>
    Review all copy across portal (UI labels, error messages, email templates, button text) against
    Steve's voice principles. Replace any buzzwords, passive constructions, or corporate speak with
    direct, confident, human language.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Steve's voice principles (Decision #4), examples of good/bad copy" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-NFR-001 acceptance criteria (voice audit checklist)" />
  </context>

  <steps>
    <step order="1">Audit all UI text: button labels, form placeholders, headings, empty states</step>
    <step order="2">Replace passive voice: "It has been deployed" → "Your site is live"</step>
    <step order="3">Replace buzzwords: "Leverage synergies" → direct explanation</step>
    <step order="4">Address user directly: "The site" → "Your site"</step>
    <step order="5">Audit error messages: technical errors → human-friendly explanations</step>
    <step order="6">Audit email templates: ensure all use direct truth voice</step>
    <step order="7">Create copy checklist: no buzzwords, no passive voice, direct address, confidence without arrogance</step>
    <step order="8">Document voice guidelines in /docs/VOICE.md for future reference</step>
  </steps>

  <verification>
    <check type="manual">Read all UI copy, verify no buzzwords or corporate speak</check>
    <check type="manual">Verify error messages are human-friendly and direct</check>
    <check type="manual">Verify email templates use "You" and "Your" (not "The")</check>
    <check type="manual">Get Steve's approval on final copy (or designated reviewer)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Requires dashboard UI to audit copy" />
    <depends-on task-id="phase-1-task-17" reason="Requires email templates to audit copy" />
    <depends-on task-id="phase-1-task-18" reason="Requires email templates to audit copy" />
  </dependencies>

  <commit-message>feat: copy review and voice compliance audit

- Audit all UI and email copy
- Replace passive voice with direct address
- Remove buzzwords and corporate speak
- Document voice guidelines

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-20" wave="4">
  <title>UI Polish & Design Quality Audit</title>
  <requirement>REQ-NFR-002: Clean, minimal UI design conveying confidence and professionalism</requirement>
  <description>
    Polish UI to meet design quality standards. Install Shadcn/ui components, ensure clean layout
    with white space, verify typography hierarchy, check color contrast (WCAG AA), test mobile
    responsiveness, verify touch targets ≥44px.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Design principles (Decision #4), v1 scope (clean but simple)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-NFR-002 acceptance criteria (no Comic Sans, white space, responsive)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md" reason="Tailwind theme from /website/src/app/globals.css (color variables)" />
  </context>

  <steps>
    <step order="1">Install Shadcn/ui: npx shadcn-ui@latest init</step>
    <step order="2">Add components: button, input, form, card, badge, table, dialog</step>
    <step order="3">Replace custom components with Shadcn equivalents where applicable</step>
    <step order="4">Copy Tailwind color variables from /website/src/app/globals.css to portal globals.css</step>
    <step order="5">Audit typography: ensure clear h1 > h2 > body hierarchy</step>
    <step order="6">Audit white space: add margin/padding to prevent cramped layouts</step>
    <step order="7">Check color contrast: ensure ≥4.5:1 ratio for WCAG AA compliance</step>
    <step order="8">Test mobile responsiveness: forms stack vertically, buttons ≥44px, no horizontal scroll</step>
    <step order="9">Verify no "under construction" vibes: professional, finished appearance</step>
  </steps>

  <verification>
    <check type="manual">Visual review: clean layout, good white space, professional appearance</check>
    <check type="manual">Test on mobile (iPhone 12, Android): verify responsive at ≥375px width</check>
    <check type="manual">Check color contrast using browser DevTools or Lighthouse</check>
    <check type="manual">Verify typography hierarchy clear (headings stand out)</check>
    <check type="test">Lighthouse audit: accessibility score ≥90</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Requires dashboard UI to polish" />
    <depends-on task-id="phase-1-task-06" reason="Requires forms to polish" />
  </dependencies>

  <commit-message>feat: UI polish and design quality audit

- Install and integrate Shadcn/ui components
- Apply Tailwind color theme
- Verify typography hierarchy and white space
- Test mobile responsiveness and color contrast

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-21" wave="4">
  <title>Performance Optimization & Lighthouse Audit</title>
  <requirement>REQ-NFR-005: Portal pages load quickly (dashboard &lt;2s, analytics &lt;3s)</requirement>
  <description>
    Optimize portal performance to meet load time targets. Run Lighthouse audit, optimize images,
    minimize JavaScript bundles, implement lazy loading, verify First Contentful Paint &lt;2s for
    dashboard. Test on 4G throttling.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-NFR-005, REQ-NFR-006 acceptance criteria (load time targets)" />
  </context>

  <steps>
    <step order="1">Run Lighthouse audit on dashboard page, note performance score and recommendations</step>
    <step order="2">Optimize images: convert to WebP, add width/height attributes, lazy load below fold</step>
    <step order="3">Minimize JavaScript: tree-shake unused code, code-split routes</step>
    <step order="4">Implement Next.js Image component for automatic optimization</step>
    <step order="5">Enable Next.js server components where applicable (reduce client JS)</step>
    <step order="6">Test dashboard load time on 4G throttling (Chrome DevTools), verify &lt;2s FCP</step>
    <step order="7">Test forms: verify interactive within 1s</step>
    <step order="8">Monitor bundle size: ensure main bundle &lt;200KB gzipped</step>
  </steps>

  <verification>
    <check type="test">Lighthouse audit: performance score ≥90</check>
    <check type="manual">Test dashboard load on 4G throttling, verify &lt;2s FCP</check>
    <check type="manual">Test form interaction, verify &lt;1s to interactive</check>
    <check type="manual">Check bundle size in production build</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Requires dashboard to optimize" />
    <depends-on task-id="phase-1-task-20" reason="Requires UI polish to complete before perf optimization" />
  </dependencies>

  <commit-message>feat: performance optimization and Lighthouse audit

- Run Lighthouse audit and implement recommendations
- Optimize images and minimize JavaScript
- Test load times on 4G throttling
- Verify performance targets met

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-22" wave="4">
  <title>Security Audit & Compliance Verification</title>
  <requirement>REQ-NFR-008 through REQ-NFR-011: Authentication, data protection, webhook security, CSRF protection</requirement>
  <description>
    Conduct security audit to verify auth security (password hashing, session tokens), data
    protection (HTTPS, encryption), webhook signature validation, CSRF protection, no secrets
    in code. Verify compliance with security best practices.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="REQ-NFR-008 through REQ-NFR-011 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Verify Supabase password hashing enabled (bcrypt default)</step>
    <step order="2">Verify session tokens are secure, httpOnly, SameSite=strict</step>
    <step order="3">Verify HTTPS enforced (Vercel default)</step>
    <step order="4">Verify no secrets in code (check .env.example, .gitignore)</step>
    <step order="5">Verify webhook signature validation (pipeline + Stripe)</step>
    <step order="6">Verify CSRF protection via Next.js defaults (SameSite cookies)</step>
    <step order="7">Run security scan: check for SQL injection, XSS, open redirects</step>
    <step order="8">Verify failed login throttling (Supabase default or custom)</step>
    <step order="9">Document security posture in /docs/SECURITY.md</step>
  </steps>

  <verification>
    <check type="manual">Verify .env file not committed (check git log)</check>
    <check type="manual">Verify all API routes use auth middleware</check>
    <check type="manual">Test webhook signature validation (send invalid signature, verify rejected)</check>
    <check type="manual">Test CSRF: submit form without token, verify rejected</check>
    <check type="test">Run OWASP security checklist</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-04" reason="Requires auth middleware to audit" />
    <depends-on task-id="phase-1-task-14" reason="Requires webhook handlers to audit" />
    <depends-on task-id="phase-1-task-15" reason="Requires Stripe webhook to audit" />
  </dependencies>

  <commit-message>feat: security audit and compliance verification

- Verify password hashing and session security
- Verify webhook signature validation
- Check CSRF protection and HTTPS enforcement
- Document security posture

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

```xml
<task-plan id="phase-1-task-23" wave="4">
  <title>Production Deployment to Vercel</title>
  <requirement>All acceptance criteria met, deploy to production</requirement>
  <description>
    Deploy portal to production on Vercel. Configure environment variables, connect custom domain
    (per DECISION-006), configure DNS, verify HTTPS, test end-to-end signup → intake → payment →
    dashboard flow in production. Monitor for errors.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md" reason="Deployment configuration (DECISION-006)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-client-portal/REQUIREMENTS.md" reason="All METRIC-001 through METRIC-006 acceptance criteria" />
  </context>

  <steps>
    <step order="1">Create Vercel project (if not exists) and link to GitHub repo</step>
    <step order="2">Configure environment variables in Vercel: SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, EMAIL_API_KEY, etc.</step>
    <step order="3">Set production domain (e.g., app.shipyard.ai) in Vercel dashboard</step>
    <step order="4">Configure DNS: Add A/CNAME records for custom domain</step>
    <step order="5">Deploy to production: git push main or manual deploy via Vercel</step>
    <step order="6">Verify HTTPS certificate auto-provisioned by Vercel</step>
    <step order="7">Test end-to-end flow in production: signup → intake → payment → dashboard → webhook → email</step>
    <step order="8">Monitor Vercel logs and error tracking for first 24 hours</step>
    <step order="9">Set up monitoring alerts: error rate >1%, uptime <99%</step>
  </steps>

  <verification>
    <check type="manual">Visit production domain, verify site loads</check>
    <check type="manual">Create test account in production, verify signup works</check>
    <check type="manual">Submit test project, complete payment, verify project visible in dashboard</check>
    <check type="manual">Send test webhook, verify status updates and email sent</check>
    <check type="manual">Verify all environment variables set correctly</check>
    <check type="test">End-to-end smoke test in production</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-19" reason="Requires copy polish before production" />
    <depends-on task-id="phase-1-task-20" reason="Requires UI polish before production" />
    <depends-on task-id="phase-1-task-21" reason="Requires performance optimization before production" />
    <depends-on task-id="phase-1-task-22" reason="Requires security audit before production" />
  </dependencies>

  <commit-message>feat: production deployment to Vercel

- Configure Vercel project and environment variables
- Connect custom domain and configure DNS
- Deploy to production and verify HTTPS
- Test end-to-end flow in production

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>
```

---

## Risk Notes

### High-Priority Risks

**RISK-001: No Product-Market Fit Validation (CRITICAL)**
- 27 completed PRDs but zero retainer conversions before portal launch
- Mitigation: Ship v1 in 1 week, validate demand with existing clients before v1.5
- Impact on plan: Strict scope adherence, no feature creep

**RISK-002: Pipeline Webhook Integration Undefined (HIGH)**
- Webhook payload schema not documented (BLOCKER: phase-1-task-14)
- Mitigation: Request schema from pipeline team before Day 5
- Impact on plan: Task 14 cannot complete without schema documentation

**RISK-003: Stripe Subscription Complexity (HIGH)**
- Billing logic, token resets, idempotency, failed payments add complexity
- Mitigation: Use Stripe Customer Portal (reduces custom code), implement idempotent webhooks
- Impact on plan: Tasks 9, 10, 15 require careful testing

**DECISION-002: Token Budget Display Format (BLOCKING)**
- Must choose Option A/B/C before Day 3 (affects tasks 6, 10)
- Options: Human translation vs Tokens + context vs Hide entirely
- Impact on plan: Task 10 implementation depends on decision

**DECISION-004: Email Service Provider (REQUIRED)**
- Must choose SendGrid/Postmark/AWS SES/Resend before Day 4 (affects task 16)
- Impact on plan: Task 16 cannot complete without provider API key

**DECISION-006: Domain & Deployment (REQUIRED)**
- Must configure Vercel project and domain before Day 7 (affects task 23)
- Impact on plan: Task 23 cannot complete without deployment config

---

## Success Criteria Summary

**Week 1 Launch Criteria:**

- [ ] Portal deployed to production domain
- [ ] 3+ test accounts created successfully
- [ ] Intake → payment flow tested end-to-end (3+ test projects)
- [ ] Webhook integration confirmed (test payload processed)
- [ ] Email notifications delivered (site live, build failed)
- [ ] Dashboard displays projects with correct status

**Week 4 Market Validation Criteria:**

- [ ] 10 self-service projects completed (no manual intervention)
- [ ] 5 active retainer subscriptions
- [ ] $1,495 MRR from retainers (5 × $299)
- [ ] Zero critical bugs reported
- [ ] Average session time < 60 seconds

---

**Plan Status:** ✅ READY FOR EXECUTION (pending open decision resolution)

**Estimated Timeline:** 7 days (Wave 1: 2 days, Wave 2: 2 days, Wave 3: 2 days, Wave 4: 1 day)

**Total Effort:** 20-26 hours of focused development work

---

*Generated by Claude Sonnet 4.5 for Great Minds Agency*
