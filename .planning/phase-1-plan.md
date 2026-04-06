# Phase 1 Plan — Shipyard Pulse Core Infrastructure

**Generated:** 2026-04-06
**Project Slug:** shipyard-care
**Requirements:** `.planning/REQUIREMENTS.md`, `prds/shipyard-care.md`, `rounds/shipyard-care/decisions.md`
**Total Tasks:** 15
**Waves:** 4

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-001: Stripe API wrapper | phase-1-task-1 | 1 |
| REQ-002: Stripe checkout flow | phase-1-task-2 | 2 |
| REQ-003: Stripe webhook handler | phase-1-task-3 | 2 |
| REQ-004: Sites database schema | phase-1-task-4 | 1 |
| REQ-005: Metrics database schema | phase-1-task-5 | 1 |
| REQ-006: Subscriptions database schema | phase-1-task-6 | 1 |
| REQ-007: Database connection pooling | phase-1-task-7 | 1 |
| REQ-008: Auth middleware | phase-1-task-8 | 2 |
| REQ-009: Login/logout endpoints | phase-1-task-9 | 3 |
| REQ-010: Route protection | phase-1-task-10 | 3 |
| REQ-011: Health Score algorithm | phase-1-task-11 | 3 |
| REQ-012: PageSpeed API client | phase-1-task-12 | 3 |
| REQ-013: Uptime monitoring | phase-1-task-13 | 3 |
| REQ-014: Database indexes | phase-1-task-14 | 4 |
| REQ-015: Migration framework | phase-1-task-15 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation

These tasks have no dependencies and establish the foundation for Phase 1.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create Stripe API Integration Wrapper</title>
  <requirement>REQ-001: Create Stripe API integration wrapper with error handling</requirement>
  <description>
    Build the core Stripe API wrapper that all payment operations will use.
    Includes proper error handling, environment validation (test vs live mode),
    and idempotency key generation for all API calls.
  </description>

  <context>
    <file path="apps/pulse/lib/stripe.ts" reason="Target file for Stripe wrapper" />
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Reference existing Stripe patterns" />
    <file path="rounds/shipyard-care/decisions.md" reason="Stripe is locked as payment provider" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/lib/stripe.ts with Stripe client initialization:
      - Import Stripe SDK
      - Initialize with STRIPE_SECRET_KEY from environment
      - Add startup validation: log which mode (test/live) is active
      - Throw error if STRIPE_SECRET_KEY is missing
    </step>
    <step order="2">Implement idempotency key generator:
      - generateIdempotencyKey(): string using crypto.randomUUID()
      - Document: "All Stripe calls must include idempotency key"
    </step>
    <step order="3">Create error handling wrapper:
      - handleStripeError(error: unknown): StripError
      - Parse Stripe error types (card_error, validation_error, api_error)
      - Return user-friendly error messages
    </step>
    <step order="4">Add TypeScript types:
      - StripeError type
      - CheckoutSessionParams type
      - SubscriptionStatus enum
    </step>
    <step order="5">Export functions:
      - getStripeClient(): Stripe
      - generateIdempotencyKey(): string
      - handleStripeError(error): StripeError
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "stripe"</check>
    <check type="manual">Startup logs show test/live mode</check>
    <check type="manual">Missing STRIPE_SECRET_KEY throws clear error</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(pulse): create Stripe API integration wrapper with error handling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Create Sites Database Schema</title>
  <requirement>REQ-004: Create PostgreSQL database schema for sites table</requirement>
  <description>
    Define the sites table schema for storing customer website records.
    Each site represents a Shipyard customer's website being monitored by Pulse.
  </description>

  <context>
    <file path="packages/db/schema/sites.ts" reason="Target for sites schema" />
    <file path="rounds/shipyard-care/decisions.md" reason="File structure specification" />
    <file path="plugins/seodash/src/sandbox-entry.ts" reason="Reference existing schema patterns" />
  </context>

  <steps>
    <step order="1">Create packages/db/schema/sites.ts with Drizzle ORM schema:
      - id: serial primary key
      - url: varchar(255) not null unique
      - name: varchar(255) not null
      - subscription_id: integer (foreign key to subscriptions, nullable)
      - tier: varchar(50) (basic, pro, enterprise, or null for trial)
      - status: varchar(50) default 'active' (active, paused, cancelled)
      - created_at: timestamp default now()
      - updated_at: timestamp default now()
    </step>
    <step order="2">Add TypeScript types:
      - Site type matching schema
      - NewSite type for inserts (omit id, timestamps)
      - SiteStatus type union ('active' | 'paused' | 'cancelled')
      - SiteTier type union ('basic' | 'pro' | 'enterprise' | null)
    </step>
    <step order="3">Create query helpers in packages/db/queries/sites.ts:
      - getSiteById(db, id): Promise&lt;Site | null&gt;
      - getSiteByUrl(db, url): Promise&lt;Site | null&gt;
      - createSite(db, data: NewSite): Promise&lt;Site&gt;
      - updateSite(db, id, data: Partial&lt;Site&gt;): Promise&lt;Site&gt;
      - listSites(db, options?: { status?, tier? }): Promise&lt;Site[]&gt;
    </step>
    <step order="4">Export from packages/db/index.ts</step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="manual">Schema generates valid SQL via drizzle-kit generate</check>
    <check type="manual">All query functions are type-safe</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(db): create sites table schema with query helpers

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="1">
  <title>Create Metrics Database Schema</title>
  <requirement>REQ-005: Create PostgreSQL database table for metrics</requirement>
  <description>
    Define the metrics table for storing PageSpeed scores, uptime results,
    and calculated Health Scores. This is time-series data that powers
    the dashboard and monthly email.
  </description>

  <context>
    <file path="packages/db/schema/metrics.ts" reason="Target for metrics schema" />
    <file path="rounds/shipyard-care/decisions.md" reason="Metrics requirements" />
  </context>

  <steps>
    <step order="1">Create packages/db/schema/metrics.ts with Drizzle ORM schema:
      - id: serial primary key
      - site_id: integer not null (foreign key to sites)
      - health_score: integer (0-100, calculated)
      - lighthouse_score: integer (0-100, from PageSpeed API)
      - load_time_ms: integer (milliseconds)
      - uptime_percent: decimal(5,2) (e.g., 99.95)
      - response_time_ms: integer (from uptime check)
      - metric_type: varchar(50) ('pagespeed' | 'uptime' | 'daily_aggregate')
      - created_at: timestamp default now()
    </step>
    <step order="2">Add TypeScript types:
      - Metric type matching schema
      - NewMetric type for inserts
      - MetricType union ('pagespeed' | 'uptime' | 'daily_aggregate')
    </step>
    <step order="3">Create query helpers in packages/db/queries/metrics.ts:
      - getLatestMetrics(db, siteId): Promise&lt;Metric | null&gt;
      - getMetricsHistory(db, siteId, days: number): Promise&lt;Metric[]&gt;
      - createMetric(db, data: NewMetric): Promise&lt;Metric&gt;
      - getAverageMetrics(db, siteId, startDate, endDate): Promise&lt;AverageMetrics&gt;
    </step>
    <step order="4">Export from packages/db/index.ts</step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="manual">Schema generates valid SQL</check>
    <check type="manual">Query functions handle time ranges correctly</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(db): create metrics table schema for site performance data

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="1">
  <title>Create Subscriptions Database Schema</title>
  <requirement>REQ-006: Create PostgreSQL database table for subscriptions</requirement>
  <description>
    Define the subscriptions table that mirrors Stripe subscription state.
    Per decisions.md, Stripe is the source of truth; this table caches
    subscription data for display purposes only (60-second TTL for access checks).
  </description>

  <context>
    <file path="packages/db/schema/subscriptions.ts" reason="Target for subscriptions schema" />
    <file path="rounds/shipyard-care/decisions.md" reason="Stripe as source of truth" />
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Reference subscription patterns" />
  </context>

  <steps>
    <step order="1">Create packages/db/schema/subscriptions.ts with Drizzle ORM schema:
      - id: serial primary key
      - site_id: integer not null (foreign key to sites)
      - stripe_subscription_id: varchar(255) unique
      - stripe_customer_id: varchar(255)
      - stripe_price_id: varchar(255)
      - status: varchar(50) (active, trialing, past_due, canceled, unpaid)
      - tier: varchar(50) not null (basic, pro, enterprise)
      - trial_ends_at: timestamp nullable
      - current_period_start: timestamp
      - current_period_end: timestamp
      - canceled_at: timestamp nullable
      - created_at: timestamp default now()
      - updated_at: timestamp default now()
    </step>
    <step order="2">Add comment: "CRITICAL: This table caches Stripe data. Always verify with Stripe for access decisions."</step>
    <step order="3">Add TypeScript types:
      - Subscription type matching schema
      - NewSubscription type for inserts
      - SubscriptionStatus union ('active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid')
    </step>
    <step order="4">Create query helpers in packages/db/queries/subscriptions.ts:
      - getSubscriptionBySiteId(db, siteId): Promise&lt;Subscription | null&gt;
      - getSubscriptionByStripeId(db, stripeId): Promise&lt;Subscription | null&gt;
      - createSubscription(db, data: NewSubscription): Promise&lt;Subscription&gt;
      - updateSubscription(db, id, data: Partial&lt;Subscription&gt;): Promise&lt;Subscription&gt;
      - getActiveSubscriptions(db): Promise&lt;Subscription[]&gt;
    </step>
    <step order="5">Export from packages/db/index.ts</step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="manual">Schema generates valid SQL</check>
    <check type="manual">Critical comment is present in code</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(db): create subscriptions table schema with Stripe sync

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="1">
  <title>Setup Database Connection with Pooling</title>
  <requirement>REQ-007: Setup database connection with connection pooling</requirement>
  <description>
    Configure PostgreSQL database connection with proper connection pooling
    to handle cold starts and concurrent requests. Use Neon's connection
    pooler for serverless environments.
  </description>

  <context>
    <file path="packages/db/client.ts" reason="Target for database client" />
    <file path="memory-store/package.json" reason="Reference existing DB patterns" />
    <file path="rounds/shipyard-care/decisions.md" reason="PostgreSQL decision" />
  </context>

  <steps>
    <step order="1">Create packages/db/client.ts with connection configuration:
      - Import drizzle from drizzle-orm/neon-http (for serverless)
      - Import @neondatabase/serverless for HTTP driver
      - Accept DATABASE_URL from environment
      - Throw clear error if DATABASE_URL missing
    </step>
    <step order="2">Implement lazy initialization pattern:
      - let db: ReturnType&lt;typeof drizzle&gt; | null = null
      - getDb(): returns singleton, creates on first call
      - This prevents cold start issues with eager initialization
    </step>
    <step order="3">Add connection health check:
      - checkConnection(): Promise&lt;boolean&gt;
      - Execute simple query (SELECT 1)
      - Return true if successful, false on error
      - Log connection errors for debugging
    </step>
    <step order="4">Configure for Neon pooling:
      - Use pooled connection string (with -pooler suffix)
      - Set connection timeout: 10 seconds
      - Log "Database connected" on successful first query
    </step>
    <step order="5">Export:
      - getDb(): drizzle instance
      - checkConnection(): Promise&lt;boolean&gt;
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "database"</check>
    <check type="manual">Missing DATABASE_URL throws clear error</check>
    <check type="manual">Connection succeeds with valid credentials</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(db): setup database connection with Neon pooling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Integrations

These tasks depend on Wave 1 foundation and implement core integration points.

```xml
<task-plan id="phase-1-task-2" wave="2">
  <title>Build Stripe Checkout Flow</title>
  <requirement>REQ-002: Build Stripe checkout flow for subscription creation</requirement>
  <description>
    Implement Stripe Checkout session creation for all three subscription tiers.
    Customers select a tier, we create a checkout session, and redirect them
    to Stripe's hosted checkout page.
  </description>

  <context>
    <file path="apps/pulse/pages/api/stripe/checkout.ts" reason="Target for checkout API" />
    <file path="apps/pulse/lib/stripe.ts" reason="Stripe wrapper from task-1" />
    <file path="rounds/shipyard-care/decisions.md" reason="Tier pricing" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/pages/api/stripe/checkout.ts:
      - POST handler for creating checkout sessions
      - Accept: { tier: 'basic' | 'pro' | 'enterprise', siteId: string, email?: string }
      - Validate tier is valid
    </step>
    <step order="2">Define tier pricing configuration:
      - TIER_PRICES = {
          basic: { priceId: env.STRIPE_BASIC_PRICE_ID, amount: 9900 },
          pro: { priceId: env.STRIPE_PRO_PRICE_ID, amount: 24900 },
          enterprise: { priceId: env.STRIPE_ENTERPRISE_PRICE_ID, amount: 49900 }
        }
    </step>
    <step order="3">Create Stripe Checkout session:
      - mode: 'subscription'
      - line_items: [{ price: priceId, quantity: 1 }]
      - success_url: /dashboard/{siteId}?session_id={CHECKOUT_SESSION_ID}
      - cancel_url: /pricing?canceled=true
      - metadata: { siteId, tier }
      - Include idempotency key
    </step>
    <step order="4">Return checkout URL:
      - { sessionId: session.id, url: session.url }
    </step>
    <step order="5">Handle errors gracefully:
      - Invalid tier: 400 with message
      - Stripe error: 500 with user-friendly message
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "checkout"</check>
    <check type="manual">Can create checkout session for Basic tier</check>
    <check type="manual">Can create checkout session for Pro tier</check>
    <check type="manual">Can create checkout session for Enterprise tier</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires Stripe wrapper" />
    <depends-on task-id="phase-1-task-4" reason="Requires sites schema for siteId validation" />
  </dependencies>

  <commit-message>feat(pulse): implement Stripe checkout flow for subscription tiers

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>Implement Stripe Webhook Handler</title>
  <requirement>REQ-003: Implement Stripe webhook endpoint with signature verification and idempotency</requirement>
  <description>
    Create webhook endpoint to handle Stripe subscription events. CRITICAL:
    Must verify webhook signatures and handle events idempotently to prevent
    duplicate processing and security issues.
  </description>

  <context>
    <file path="apps/pulse/pages/api/stripe/webhook.ts" reason="Target for webhook handler" />
    <file path="apps/pulse/lib/stripe.ts" reason="Stripe wrapper" />
    <file path="packages/db/queries/subscriptions.ts" reason="Subscription updates" />
    <file path="rounds/shipyard-care/decisions.md" reason="Webhook requirements" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/pages/api/stripe/webhook.ts:
      - POST handler for Stripe webhooks
      - Disable body parsing (need raw body for signature verification)
      - export const config = { api: { bodyParser: false } }
    </step>
    <step order="2">Implement signature verification:
      - Get raw body from request
      - Get stripe-signature header
      - Call stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
      - On invalid signature: return 400, log [ALERT] for monitoring
    </step>
    <step order="3">Implement idempotency check:
      - Store processed event IDs in database or KV
      - Check if event.id already exists before processing
      - If exists: return 200 (tell Stripe success, skip processing)
      - If new: process event, then store event.id
    </step>
    <step order="4">Handle subscription events:
      - customer.subscription.created: Create subscription record, update site tier
      - customer.subscription.updated: Update subscription status, sync tier
      - customer.subscription.deleted: Mark subscription canceled, update site
      - invoice.payment_succeeded: Log success
      - invoice.payment_failed: Log failure, consider alerting
    </step>
    <step order="5">Always return 200 on successful processing:
      - Stripe retries on non-2xx
      - Even on errors, log and return 200 to prevent retry storms
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "webhook"</check>
    <check type="manual">Valid webhook updates subscription</check>
    <check type="manual">Invalid signature returns 400 and logs alert</check>
    <check type="manual">Duplicate event ID is skipped (idempotent)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires Stripe wrapper" />
    <depends-on task-id="phase-1-task-6" reason="Requires subscriptions schema" />
    <depends-on task-id="phase-1-task-7" reason="Requires database connection" />
  </dependencies>

  <commit-message>feat(pulse): implement Stripe webhook handler with signature verification

CRITICAL: Includes idempotency protection to prevent duplicate processing.
All webhook events are verified using STRIPE_WEBHOOK_SECRET.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Implement Session-Based Authentication Middleware</title>
  <requirement>REQ-008: Implement session-based authentication middleware (httpOnly cookies)</requirement>
  <description>
    Create authentication middleware that uses httpOnly cookies for session
    management. CRITICAL: Tokens must NEVER be stored in localStorage or
    sessionStorage to prevent XSS attacks.
  </description>

  <context>
    <file path="apps/pulse/lib/auth.ts" reason="Target for auth utilities" />
    <file path="apps/pulse/middleware.ts" reason="Next.js middleware" />
    <file path="rounds/shipyard-care/decisions.md" reason="Auth requirements" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/lib/auth.ts with session utilities:
      - generateSessionToken(): string (crypto.randomUUID())
      - hashToken(token: string): string (SHA-256 hash for storage)
      - SESSION_COOKIE_NAME = 'pulse_session'
      - SESSION_EXPIRY_MS = 15 * 60 * 1000 (15 minutes for access tokens)
    </step>
    <step order="2">Implement cookie configuration:
      - createSessionCookie(token: string): cookie string
      - Options: httpOnly: true, secure: true, sameSite: 'strict', path: '/'
      - Set maxAge based on SESSION_EXPIRY_MS
      - CRITICAL comment: "NEVER store tokens in localStorage"
    </step>
    <step order="3">Create session validation:
      - validateSession(request: Request): Promise&lt;Session | null&gt;
      - Parse cookie from request
      - Look up session in database/KV
      - Check expiry
      - Return session data or null
    </step>
    <step order="4">Create Next.js middleware (apps/pulse/middleware.ts):
      - Check for session cookie on protected routes
      - Protected routes: /dashboard/*, /api/pulse/*
      - If no valid session: redirect to /login
      - If valid: continue to handler
    </step>
    <step order="5">Export utilities:
      - createSession(userId, siteId): Promise&lt;{ token, expiresAt }&gt;
      - validateSession(request): Promise&lt;Session | null&gt;
      - destroySession(token): Promise&lt;void&gt;
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "auth"</check>
    <check type="manual">Session cookie has httpOnly, Secure, SameSite flags</check>
    <check type="manual">Protected routes redirect without valid session</check>
    <check type="manual">NO localStorage or sessionStorage usage</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Requires database for session storage" />
  </dependencies>

  <commit-message>feat(pulse): implement session-based auth with httpOnly cookies

SECURITY: Tokens are ONLY stored in httpOnly cookies, never localStorage.
Session expiry: 15 minutes, requires refresh for continued access.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Feature Implementation

These tasks implement the core features that depend on integration points.

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Create Login/Logout Authentication Endpoints</title>
  <requirement>REQ-009: Create login/logout authentication endpoints</requirement>
  <description>
    Build the login and logout API endpoints. Login validates credentials
    and creates a session; logout destroys the session and clears the cookie.
  </description>

  <context>
    <file path="apps/pulse/pages/api/auth/login.ts" reason="Target for login endpoint" />
    <file path="apps/pulse/pages/api/auth/logout.ts" reason="Target for logout endpoint" />
    <file path="apps/pulse/lib/auth.ts" reason="Auth utilities from task-8" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/pages/api/auth/login.ts:
      - POST handler
      - Accept: { email: string, siteUrl?: string }
      - Validate email format
    </step>
    <step order="2">Implement login flow:
      - Look up site by email or URL
      - Verify subscription exists and is active (check Stripe)
      - If valid: create session, set cookie
      - Return: { success: true, redirectUrl: '/dashboard/{siteId}' }
    </step>
    <step order="3">Create apps/pulse/pages/api/auth/logout.ts:
      - POST handler
      - Get session token from cookie
      - Destroy session in database
      - Clear cookie (set maxAge: 0)
      - Return: { success: true }
    </step>
    <step order="4">Handle errors:
      - Invalid email: 400 with friendly message
      - No subscription: 403 with "No active subscription found"
      - Server error: 500 with generic message
    </step>
    <step order="5">Add rate limiting:
      - Track login attempts by IP
      - After 5 failed attempts: require 5-minute cooldown
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "login|logout"</check>
    <check type="manual">Login creates session cookie</check>
    <check type="manual">Logout clears session cookie</check>
    <check type="manual">Invalid credentials rejected</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Requires auth middleware" />
    <depends-on task-id="phase-1-task-6" reason="Requires subscriptions for validation" />
  </dependencies>

  <commit-message>feat(pulse): create login/logout authentication endpoints

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Implement Route Protection</title>
  <requirement>REQ-010: Implement route protection for dashboard endpoints</requirement>
  <description>
    Configure route protection to require authentication for dashboard
    and API endpoints. Unauthenticated requests return 401 or redirect to login.
  </description>

  <context>
    <file path="apps/pulse/middleware.ts" reason="Next.js middleware from task-8" />
    <file path="apps/pulse/lib/auth.ts" reason="Auth utilities" />
  </context>

  <steps>
    <step order="1">Update apps/pulse/middleware.ts with route matching:
      - Protected routes: /dashboard/*, /api/pulse/*, /api/auth/logout
      - Public routes: /api/auth/login, /api/stripe/webhook, /api/health
    </step>
    <step order="2">Implement protection logic:
      - For protected routes: validate session
      - If invalid: redirect to /login for pages, return 401 for APIs
      - If valid: add session data to request headers for handlers
    </step>
    <step order="3">Add session refresh logic:
      - If session expires within 5 minutes: auto-refresh
      - Set new cookie with extended expiry
      - This prevents logout during active use
    </step>
    <step order="4">Create wrapper for API handlers:
      - withAuth(handler): protected handler that requires valid session
      - Extracts session from middleware headers
      - Provides typed session object to handler
    </step>
    <step order="5">Export route config:
      - Define PROTECTED_ROUTES array for documentation
      - Define PUBLIC_ROUTES array
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "route protection"</check>
    <check type="manual">Protected routes return 401 without session</check>
    <check type="manual">Protected routes work with valid session</check>
    <check type="manual">Session auto-refreshes before expiry</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Requires auth middleware" />
    <depends-on task-id="phase-1-task-9" reason="Requires login endpoint" />
  </dependencies>

  <commit-message>feat(pulse): implement route protection for dashboard endpoints

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Design Health Score Calculation Algorithm</title>
  <requirement>REQ-011: Design Health Score calculation algorithm</requirement>
  <description>
    Create the Health Score algorithm that combines PageSpeed, uptime, and
    load time into a single 0-100 score. This is the central metric displayed
    on the dashboard and in the monthly email.
  </description>

  <context>
    <file path="apps/pulse/lib/health-score.ts" reason="Target for algorithm" />
    <file path="rounds/shipyard-care/decisions.md" reason="Health Score with context" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/lib/health-score.ts with calculation:
      - calculateHealthScore(metrics: MetricInput): HealthScoreResult
      - Input: { lighthouseScore, loadTimeMs, uptimePercent }
      - Output: { score: number, grade: string, trend: string | null }
    </step>
    <step order="2">Define weighted formula:
      - Lighthouse score: 40% weight (performance is key)
      - Uptime: 35% weight (reliability is critical)
      - Load time: 25% weight (user experience)
      - Formula: (lighthouse * 0.4) + (uptime * 0.35) + (loadTimeScore * 0.25)
    </step>
    <step order="3">Convert load time to 0-100 score:
      - &lt;1000ms = 100 (excellent)
      - 1000-2000ms = 80 (good)
      - 2000-3000ms = 60 (needs work)
      - 3000-5000ms = 40 (poor)
      - &gt;5000ms = 20 (critical)
    </step>
    <step order="4">Implement grade mapping (per open question #4):
      - 90-100: A (Excellent)
      - 80-89: B (Good)
      - 70-79: C (Needs Attention)
      - 60-69: D (Poor)
      - 0-59: F (Critical)
    </step>
    <step order="5">Calculate trend (compared to last month):
      - getHealthScoreTrend(currentScore, previousScore): TrendResult
      - Return: { direction: 'up' | 'down' | 'stable', points: number }
      - Threshold: +/- 5 points = stable
    </step>
    <step order="6">Document formula in code comments for transparency</step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "health score"</check>
    <check type="manual">Score 90-100 returns grade A</check>
    <check type="manual">Fast load time increases score</check>
    <check type="manual">Formula is documented in code</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires metrics schema" />
  </dependencies>

  <commit-message>feat(pulse): implement Health Score calculation algorithm

Weighted formula: Lighthouse (40%) + Uptime (35%) + Load Time (25%)
Includes grade mapping (A-F) and trend calculation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Build PageSpeed Insights API Client</title>
  <requirement>REQ-012: Build PageSpeed Insights API client</requirement>
  <description>
    Create client for Google PageSpeed Insights API. This fetches performance
    metrics for customer sites. Per decisions.md, we use this instead of
    self-hosted Lighthouse to save compute costs.
  </description>

  <context>
    <file path="apps/pulse/lib/pagespeed.ts" reason="Target for API client" />
    <file path="rounds/shipyard-care/decisions.md" reason="PageSpeed API decision" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/lib/pagespeed.ts with API client:
      - fetchPageSpeedMetrics(url: string): Promise&lt;PageSpeedResult&gt;
      - API URL: https://www.googleapis.com/pagespeedonline/v5/runPagespeed
      - Parameters: url, key (PAGESPEED_API_KEY), strategy='mobile'
    </step>
    <step order="2">Parse response for relevant metrics:
      - lighthouseResult.categories.performance.score (0-1, convert to 0-100)
      - lighthouseResult.audits['server-response-time'].numericValue (TTFB in ms)
      - lighthouseResult.audits['speed-index'].numericValue
      - lighthouseResult.audits['largest-contentful-paint'].numericValue
    </step>
    <step order="3">Implement caching (5-minute TTL):
      - Cache key: `pagespeed:${url}`
      - Check cache before API call
      - Store result with timestamp
      - Return cached result if within TTL
    </step>
    <step order="4">Handle errors and rate limits:
      - On 429 (rate limit): return cached data if available, log warning
      - On API error: return null, log error
      - Implement exponential backoff for retries
    </step>
    <step order="5">Return typed result:
      - PageSpeedResult = { score, loadTimeMs, ttfb, lcp, fetchedAt }
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "pagespeed"</check>
    <check type="manual">API returns valid score for known URL</check>
    <check type="manual">Second request within 5 min returns cached data</check>
    <check type="manual">Rate limit handled gracefully</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Stores results in metrics table" />
    <depends-on task-id="phase-1-task-7" reason="Requires database for caching" />
  </dependencies>

  <commit-message>feat(pulse): implement PageSpeed Insights API client with caching

Uses Google's free API per locked decision.
5-minute cache TTL to avoid rate limits.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="3">
  <title>Create Uptime Monitoring Mechanism</title>
  <requirement>REQ-013: Create uptime monitoring ping check mechanism</requirement>
  <description>
    Build the uptime monitoring system that performs health checks on customer
    sites. Tracks response time and availability for uptime percentage calculation.
  </description>

  <context>
    <file path="apps/pulse/lib/uptime.ts" reason="Target for uptime client" />
    <file path="rounds/shipyard-care/decisions.md" reason="Uptime requirements" />
  </context>

  <steps>
    <step order="1">Create apps/pulse/lib/uptime.ts with ping function:
      - checkUptime(url: string): Promise&lt;UptimeResult&gt;
      - Use fetch() with HEAD request (minimal data)
      - Set timeout: 10 seconds
    </step>
    <step order="2">Measure response time:
      - startTime = Date.now()
      - await fetch(url, { method: 'HEAD' })
      - responseTimeMs = Date.now() - startTime
    </step>
    <step order="3">Determine status:
      - isUp: boolean based on response.ok (2xx status)
      - statusCode: number
      - Handle timeouts: isUp = false, statusCode = null
    </step>
    <step order="4">Calculate uptime percentage:
      - calculateUptimePercent(checks: UptimeCheck[]): number
      - Formula: (successfulChecks / totalChecks) * 100
      - Round to 2 decimal places (e.g., 99.95%)
    </step>
    <step order="5">Return typed result:
      - UptimeResult = { isUp, statusCode, responseTimeMs, checkedAt }
    </step>
    <step order="6">Add error categorization:
      - Timeout: 'TIMEOUT'
      - DNS error: 'DNS_FAILURE'
      - SSL error: 'SSL_ERROR'
      - Connection refused: 'CONNECTION_REFUSED'
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm test -- --grep "uptime"</check>
    <check type="manual">Returns isUp: true for valid URL</check>
    <check type="manual">Returns responseTimeMs for successful check</check>
    <check type="manual">Handles timeout gracefully</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Stores results in metrics table" />
    <depends-on task-id="phase-1-task-7" reason="Requires database connection" />
  </dependencies>

  <commit-message>feat(pulse): create uptime monitoring ping check mechanism

HEAD requests for minimal overhead.
10-second timeout with error categorization.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Parallel, after Wave 3) — Optimization & Finalization

Final tasks for database optimization and migration framework.

```xml
<task-plan id="phase-1-task-14" wave="4">
  <title>Create Database Indexes for Performance</title>
  <requirement>REQ-014: Create database indexes for performance (&lt;100ms p95)</requirement>
  <description>
    Add database indexes to ensure all dashboard queries meet the &lt;100ms
    p95 latency requirement. Focus on the most common query patterns.
  </description>

  <context>
    <file path="packages/db/schema/" reason="Schema files to add indexes" />
    <file path="rounds/shipyard-care/decisions.md" reason="Performance requirements" />
  </context>

  <steps>
    <step order="1">Identify common query patterns:
      - Get latest metrics by site_id
      - Get metrics history by site_id + date range
      - Get subscription by site_id
      - Get subscription by stripe_subscription_id
      - List active subscriptions
    </step>
    <step order="2">Add indexes to metrics table:
      - CREATE INDEX idx_metrics_site_created ON metrics(site_id, created_at DESC)
      - CREATE INDEX idx_metrics_type_created ON metrics(metric_type, created_at DESC)
    </step>
    <step order="3">Add indexes to subscriptions table:
      - CREATE INDEX idx_subscriptions_site ON subscriptions(site_id)
      - CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id)
      - CREATE INDEX idx_subscriptions_status ON subscriptions(status)
    </step>
    <step order="4">Add indexes to sites table:
      - CREATE UNIQUE INDEX idx_sites_url ON sites(url)
      - CREATE INDEX idx_sites_status ON sites(status)
    </step>
    <step order="5">Create migration file:
      - packages/db/migrations/002_add_indexes.sql
      - Make idempotent: IF NOT EXISTS
    </step>
    <step order="6">Verify with EXPLAIN ANALYZE:
      - Run common queries with EXPLAIN ANALYZE
      - Document expected query times in comments
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="manual">Indexes created successfully</check>
    <check type="manual">Common queries use indexes (check EXPLAIN)</check>
    <check type="manual">Query latency &lt;100ms</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Requires sites schema" />
    <depends-on task-id="phase-1-task-5" reason="Requires metrics schema" />
    <depends-on task-id="phase-1-task-6" reason="Requires subscriptions schema" />
  </dependencies>

  <commit-message>perf(db): add indexes for &lt;100ms p95 query latency

Indexes on common query patterns: site_id, created_at, stripe_subscription_id.
Verified with EXPLAIN ANALYZE.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="4">
  <title>Implement Database Migration Framework</title>
  <requirement>REQ-015: Implement database migration framework</requirement>
  <description>
    Create a migration framework for versioned, idempotent database schema
    changes. Per risk mitigation, all migrations must be backwards-compatible.
  </description>

  <context>
    <file path="packages/db/migrations/" reason="Target for migrations" />
    <file path="packages/db/migrate.ts" reason="Migration runner" />
    <file path="rounds/shipyard-care/decisions.md" reason="Migration requirements" />
  </context>

  <steps>
    <step order="1">Create migration tracking table:
      - CREATE TABLE IF NOT EXISTS _migrations (
          id serial PRIMARY KEY,
          name varchar(255) UNIQUE NOT NULL,
          applied_at timestamp DEFAULT now()
        )
    </step>
    <step order="2">Create packages/db/migrate.ts runner:
      - runMigrations(db): Promise&lt;MigrationResult[]&gt;
      - Get list of .sql files in migrations/ directory
      - Check which are already applied (query _migrations)
      - Run pending migrations in order
      - Record each migration in _migrations table
    </step>
    <step order="3">Create initial migration:
      - packages/db/migrations/001_initial_schema.sql
      - Combine all schema definitions from tasks 4, 5, 6
      - Make idempotent: IF NOT EXISTS on all CREATE statements
    </step>
    <step order="4">Add migration CLI command:
      - npm run db:migrate - runs all pending migrations
      - npm run db:migrate:status - shows migration status
      - npm run db:migrate:rollback - NOT SUPPORTED (document why)
    </step>
    <step order="5">Document migration rules:
      - Never delete columns in v1.x
      - Always add default values for new columns
      - Test migrations in staging before production
    </step>
    <step order="6">Add pre-deployment check:
      - Verify database connectivity
      - Show pending migrations count
      - Require confirmation for production
    </step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="test">npm run db:migrate:status</check>
    <check type="manual">Fresh database: all migrations apply successfully</check>
    <check type="manual">Re-run: no duplicate migrations applied</check>
    <check type="manual">Migration rules documented in README</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Requires database connection" />
    <depends-on task-id="phase-1-task-14" reason="Indexes should be included in migrations" />
  </dependencies>

  <commit-message>feat(db): implement versioned migration framework

Idempotent migrations with tracking table.
Rules: no column deletions, always add defaults.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

| Risk | Severity | Mitigation in Plan |
|------|----------|-------------------|
| Stripe webhook signature not verified | Critical | Task 3: signature verification with constructEvent |
| Duplicate webhook processing | Critical | Task 3: idempotency with event ID storage |
| Session tokens in localStorage | Critical | Task 8: httpOnly cookies only, explicit ban |
| Database indexes missing | High | Task 14: indexes on common query patterns |
| Test/Live mode confusion | High | Task 1: startup validation, log active mode |
| Database migration failures | High | Task 15: idempotent migrations, staging first |
| PageSpeed API rate limits | Medium | Task 12: 5-minute cache TTL |
| Cold start database latency | Medium | Task 7: connection pooling, lazy init |

---

## Execution Summary

| Wave | Tasks | Parallel? | Description | Est. Time |
|------|-------|-----------|-------------|-----------|
| 1 | task-1, task-4, task-5, task-6, task-7 | Yes | Foundation: Stripe wrapper, DB schemas, connection | 4-6 hours |
| 2 | task-2, task-3, task-8 | Yes | Integrations: Checkout, webhooks, auth middleware | 4-6 hours |
| 3 | task-9, task-10, task-11, task-12, task-13 | Yes | Features: Login/logout, routes, Health Score, APIs | 6-8 hours |
| 4 | task-14, task-15 | Yes | Optimization: Indexes, migrations | 2-3 hours |

**Total Estimated Time:** 16-23 hours
**Parallel Efficiency:** 4 waves instead of 15 sequential tasks

---

## Post-Plan Checklist

- [x] All 15 requirements in REQUIREMENTS.md have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed in relevant tasks
- [x] Critical security requirements (webhook sig, httpOnly) explicitly called out
- [x] Performance requirement (<100ms p95) addressed in Task 14

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/shipyard-care/decisions.md, prds/shipyard-care.md*
