# Phase 1 Plan — EmDash Plugins v1 (MemberShip + Convene)

**Generated:** 2026-04-05
**Requirements:** `.planning/REQUIREMENTS.md`, `prds/completed/003-emdash-plugins.md`, `rounds/003-emdash-plugins/decisions.md`
**Total Tasks:** 24
**Waves:** 5

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-SHARED-003, REQ-SHARED-021, REQ-SHARED-022 | phase-1-task-1 | 1 |
| REQ-MS-001, REQ-SHARED-012 | phase-1-task-2 | 1 |
| REQ-CV-001, REQ-SHARED-012 | phase-1-task-3 | 1 |
| REQ-SHARED-016, REQ-SHARED-017, REQ-SHARED-018 | phase-1-task-4 | 1 |
| REQ-SHARED-001, REQ-SHARED-002, REQ-SHARED-007, REQ-SHARED-008, REQ-SHARED-014 | phase-1-task-5 | 2 |
| REQ-SHARED-004 | phase-1-task-6 | 2 |
| REQ-MS-002, REQ-MS-003 | phase-1-task-7 | 2 |
| REQ-CV-002 | phase-1-task-8 | 2 |
| REQ-MS-004, REQ-SHARED-015 | phase-1-task-9 | 3 |
| REQ-MS-005, REQ-SHARED-020 | phase-1-task-10 | 3 |
| REQ-MS-006, REQ-MS-007 | phase-1-task-11 | 3 |
| REQ-CV-003, REQ-CV-004 | phase-1-task-12 | 3 |
| REQ-CV-005 | phase-1-task-13 | 3 |
| REQ-MS-012, REQ-SHARED-006 | phase-1-task-14 | 3 |
| REQ-CV-009, REQ-SHARED-006 | phase-1-task-15 | 3 |
| REQ-MS-008, REQ-MS-013 | phase-1-task-16 | 4 |
| REQ-MS-009, REQ-MS-010 | phase-1-task-17 | 4 |
| REQ-MS-011 | phase-1-task-18 | 4 |
| REQ-CV-006 | phase-1-task-19 | 4 |
| REQ-CV-007, REQ-CV-010 | phase-1-task-20 | 4 |
| REQ-CV-008 | phase-1-task-21 | 4 |
| REQ-SHARED-009, REQ-SHARED-010 | phase-1-task-22 | 5 |
| REQ-SHARED-011 | phase-1-task-23 | 5 |
| REQ-SHARED-013, REQ-SHARED-005, REQ-SHARED-019, REQ-SHARED-023 | phase-1-task-24 | 5 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Infrastructure Foundation

These tasks have no dependencies and establish the foundation for both plugins.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create D1 Database Schema</title>
  <requirement>REQ-SHARED-003, REQ-SHARED-021, REQ-SHARED-022: D1 for filter/sort/pagination, schema versioning</requirement>
  <description>
    Define the D1 (SQLite) database schema for both MemberShip and Convene plugins.
    This replaces KV for all entities that require list operations. Schema must be
    versioned for future migrations and follow the no-delete-columns rule.
  </description>

  <context>
    <file path="plugins/membership/src/db/" reason="Target for MemberShip schema" />
    <file path="plugins/convene/src/db/" reason="Target for Convene schema" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="D1 decision and file structure" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/db/schema.ts with D1 schema:
      - members table: id, email, name, stripe_customer_id, created_at, updated_at
      - plans table: id, name, description, price_cents, interval (month/year), stripe_price_id, is_active, created_at
      - Add schema_version metadata table with version column
    </step>
    <step order="2">Create packages/plugin-convene/src/db/schema.ts with D1 schema:
      - events table: id, title, description, date, time, capacity, price_cents, stripe_price_id, is_published, created_at, updated_at
      - registrations table: id, event_id, email, name, stripe_payment_intent_id, status (confirmed/cancelled), created_at
      - Add schema_version metadata table
    </step>
    <step order="3">Create packages/plugin-membership/src/db/queries.ts with typed query functions:
      - getMemberByEmail(db, email): Promise&lt;Member | null&gt;
      - listMembers(db, cursor, limit): Promise&lt;{ members: Member[], nextCursor: string | null }&gt;
      - createMember(db, data): Promise&lt;Member&gt;
      - getActivePlans(db): Promise&lt;Plan[]&gt;
    </step>
    <step order="4">Create packages/plugin-convene/src/db/queries.ts with typed query functions:
      - getEventById(db, id): Promise&lt;Event | null&gt;
      - listEvents(db, cursor, limit): Promise&lt;{ events: Event[], nextCursor: string | null }&gt;
      - createEvent(db, data): Promise&lt;Event&gt;
      - listRegistrations(db, eventId): Promise&lt;Registration[]&gt;
    </step>
    <step order="5">Add TypeScript types in packages/plugin-membership/src/types.ts and packages/plugin-convene/src/types.ts</step>
    <step order="6">Create shared migration utilities in packages/shared/src/db/migrate.ts</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Schema files contain proper TypeScript types</check>
    <check type="manual">All query functions have cursor-based pagination</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(db): create D1 schemas for MemberShip and Convene plugins</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Scaffold MemberShip Plugin</title>
  <requirement>REQ-MS-001, REQ-SHARED-012: definePlugin registration, TypeScript strict</requirement>
  <description>
    Create the MemberShip plugin package structure with definePlugin registration,
    TypeScript strict mode configuration, and plugin descriptor. This establishes
    the plugin entry point that EmDash will load.
  </description>

  <context>
    <file path="plugins/membership/src/index.ts" reason="Reference existing pattern" />
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Reference definePlugin pattern" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="File structure specification" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/ directory structure:
      - src/index.ts (plugin descriptor)
      - src/sandbox-entry.ts (definePlugin entry)
      - src/routes/ (API route handlers)
      - src/admin/ (Block Kit admin pages)
      - src/stripe/ (Stripe integration)
      - src/email/ (email templates)
      - tests/e2e/
      - tests/unit/
    </step>
    <step order="2">Create package.json with:
      - name: "@shipyard/plugin-membership"
      - version: "1.0.0"
      - main: "dist/index.js"
      - peerDependencies: { "emdash": "^0.1.0" }
      - devDependencies: { "emdash": "^0.1.0", "typescript": "^5.5", "vitest": "^4.1.2" }
    </step>
    <step order="3">Create tsconfig.json with strict: true, noImplicitAny: true, strictNullChecks: true</step>
    <step order="4">Create src/index.ts with PluginDescriptor:
      - id: "membership"
      - version: "1.0.0"
      - format: "standard"
      - entrypoint: "@shipyard/plugin-membership/sandbox"
      - capabilities: ["email:send"]
      - adminPages: [{ path: "/members", label: "Members", icon: "users" }, { path: "/plans", label: "Plans", icon: "settings" }]
    </step>
    <step order="5">Create src/sandbox-entry.ts with empty definePlugin({ routes: {}, hooks: {} })</step>
    <step order="6">Create vitest.config.ts for test configuration</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm install &amp;&amp; npm run build</check>
    <check type="manual">TypeScript compiles with zero errors</check>
    <check type="manual">No 'any' types in codebase</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(membership): scaffold MemberShip plugin with definePlugin</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Scaffold Convene Plugin</title>
  <requirement>REQ-CV-001, REQ-SHARED-012: definePlugin registration, TypeScript strict</requirement>
  <description>
    Create the Convene plugin package structure (renamed from EventDash per Decision #1).
    Follows same pattern as MemberShip with definePlugin registration and TypeScript strict mode.
  </description>

  <context>
    <file path="plugins/eventdash/src/index.ts" reason="Reference existing pattern" />
    <file path="plugins/eventdash/src/sandbox-entry.ts" reason="Reference definePlugin pattern" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Rename to Convene, file structure" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/ directory structure:
      - src/index.ts (plugin descriptor)
      - src/sandbox-entry.ts (definePlugin entry)
      - src/routes/ (API route handlers)
      - src/admin/ (Block Kit admin pages)
      - src/stripe/ (Stripe integration)
      - src/email/ (email templates)
      - tests/e2e/
      - tests/unit/
    </step>
    <step order="2">Create package.json with:
      - name: "@shipyard/plugin-convene"
      - version: "1.0.0"
      - main: "dist/index.js"
      - peerDependencies: { "emdash": "^0.1.0" }
    </step>
    <step order="3">Create tsconfig.json with strict: true, noImplicitAny: true</step>
    <step order="4">Create src/index.ts with PluginDescriptor:
      - id: "convene"
      - version: "1.0.0"
      - format: "standard"
      - entrypoint: "@shipyard/plugin-convene/sandbox"
      - capabilities: ["email:send"]
      - adminPages: [{ path: "/events", label: "Events", icon: "calendar" }]
    </step>
    <step order="5">Create src/sandbox-entry.ts with empty definePlugin({ routes: {}, hooks: {} })</step>
    <step order="6">Create vitest.config.ts for test configuration</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm install &amp;&amp; npm run build</check>
    <check type="manual">TypeScript compiles with zero errors</check>
    <check type="manual">Plugin ID is "convene" not "eventdash"</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(convene): scaffold Convene plugin with definePlugin</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Create Email Infrastructure</title>
  <requirement>REQ-SHARED-016, REQ-SHARED-017, REQ-SHARED-018: Resend integration, queue, logging</requirement>
  <description>
    Create shared email infrastructure using Resend API. Includes rate limiting,
    queue for high-volume sends, and comprehensive failure logging. This is used
    by both MemberShip and Convene plugins.
  </description>

  <context>
    <file path="plugins/membership/src/email.ts" reason="Reference existing email patterns" />
    <file path="plugins/eventdash/src/email.ts" reason="Reference existing email patterns" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Email requirements" />
  </context>

  <steps>
    <step order="1">Create packages/shared/src/email/client.ts:
      - sendEmail(ctx, { to, subject, html, text }): Promise&lt;boolean&gt;
      - Use fetch() to call Resend API
      - Include proper error handling and retry logic (3 retries, exponential backoff)
    </step>
    <step order="2">Create packages/shared/src/email/queue.ts:
      - queueEmail(ctx, email): Promise&lt;void&gt;
      - processQueue(ctx): Promise&lt;void&gt;
      - Use KV with timestamp keys for FIFO ordering
      - Process up to 10 emails per batch
    </step>
    <step order="3">Create packages/shared/src/email/logger.ts:
      - logEmailSuccess(ctx, { to, subject, timestamp }): Promise&lt;void&gt;
      - logEmailFailure(ctx, { to, subject, error, timestamp }): Promise&lt;void&gt;
      - Store in KV with 7-day TTL for debugging
    </step>
    <step order="4">Create packages/shared/src/email/rate-limit.ts:
      - checkRateLimit(ctx, email, eventType): Promise&lt;boolean&gt;
      - Store in KV: email:sent:{email}:{eventType}:last_sent_at
      - Default: 1 email per event type per 24 hours
    </step>
    <step order="5">Export all from packages/shared/src/email/index.ts</step>
    <step order="6">Add environment variable types for RESEND_API_KEY, EMAIL_FROM</step>
  </steps>

  <verification>
    <check type="build">cd packages/shared &amp;&amp; npm run build</check>
    <check type="test">cd packages/shared &amp;&amp; npm test -- --grep "email"</check>
    <check type="manual">All failures are logged with full context</check>
  </verification>

  <dependencies>
    <!-- None - Wave 1 foundation task -->
  </dependencies>

  <commit-message>feat(shared): create email infrastructure with Resend integration</commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Integrations

These tasks depend on Wave 1 infrastructure and implement core integration points.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Create Stripe Integration Module</title>
  <requirement>REQ-SHARED-001, REQ-SHARED-002, REQ-SHARED-007, REQ-SHARED-008, REQ-SHARED-014: Stripe as source of truth, caching, idempotency</requirement>
  <description>
    Create shared Stripe integration module that enforces Stripe as the source of truth
    for subscription state. Includes KV caching with 60-second TTL for display purposes
    and "Syncing..." indicator support. All payment operations use idempotency keys.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Reference existing Stripe patterns" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Stripe as source of truth decision" />
  </context>

  <steps>
    <step order="1">Create packages/shared/src/stripe/client.ts:
      - createCheckoutSession(ctx, params): Promise&lt;{ sessionId: string, url: string }&gt;
      - getSubscription(ctx, subscriptionId): Promise&lt;Subscription&gt;
      - cancelSubscription(ctx, subscriptionId): Promise&lt;void&gt;
      - All calls include idempotency keys via crypto.randomUUID()
    </step>
    <step order="2">Create packages/shared/src/stripe/cache.ts:
      - getSubscriptionWithCache(ctx, customerId): Promise&lt;{ subscription: Subscription, fromCache: boolean }&gt;
      - Cache key: stripe:subscription:{customerId}
      - TTL: 60 seconds (NEVER longer)
      - Return fromCache flag for "Syncing..." indicator
    </step>
    <step order="3">Create packages/shared/src/stripe/webhook.ts:
      - verifyWebhookSignature(payload, signature, secret): boolean
      - parseWebhookEvent(payload): StripeEvent
      - Throw on invalid signature (trigger alert per REQ-SHARED-015)
    </step>
    <step order="4">Create packages/shared/src/stripe/types.ts:
      - Subscription, CheckoutSession, PaymentIntent types
      - WebhookEvent union type for all handled events
    </step>
    <step order="5">Add documentation comment: "CRITICAL: Never persist subscription state in KV. Always verify with Stripe for access decisions."</step>
    <step order="6">Export all from packages/shared/src/stripe/index.ts</step>
  </steps>

  <verification>
    <check type="build">cd packages/shared &amp;&amp; npm run build</check>
    <check type="test">cd packages/shared &amp;&amp; npm test -- --grep "stripe"</check>
    <check type="manual">All Stripe calls include idempotency key</check>
    <check type="manual">Cache TTL is exactly 60 seconds, no more</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Requires plugin structure for integration" />
    <depends-on task-id="phase-1-task-3" reason="Requires plugin structure for integration" />
  </dependencies>

  <commit-message>feat(shared): create Stripe integration with caching and idempotency</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Implement Cursor Pagination Utility</title>
  <requirement>REQ-SHARED-004: Cursor-based pagination for all admin lists</requirement>
  <description>
    Create shared cursor pagination utility that all admin list endpoints will use.
    This ensures consistent pagination behavior across MemberShip and Convene plugins
    and prevents the 1,001 KV reads problem identified in decisions.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Reference existing pagination patterns" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Cursor pagination requirement" />
  </context>

  <steps>
    <step order="1">Create packages/shared/src/pagination/cursor.ts:
      - encodeCursor(id: string, timestamp: number): string (base64 encode)
      - decodeCursor(cursor: string): { id: string, timestamp: number }
      - buildPaginatedQuery(table, cursor, limit, orderBy): SQL
    </step>
    <step order="2">Create packages/shared/src/pagination/types.ts:
      - PaginatedResult&lt;T&gt; = { items: T[], nextCursor: string | null, hasMore: boolean }
      - PaginationParams = { cursor?: string, limit?: number }
    </step>
    <step order="3">Create packages/shared/src/pagination/d1.ts:
      - paginate&lt;T&gt;(db, table, params): Promise&lt;PaginatedResult&lt;T&gt;&gt;
      - Use cursor-based pagination with id + created_at
      - Default limit: 50, max limit: 100
    </step>
    <step order="4">Add helper for Block Kit admin table rendering:
      - formatPaginationControls(result): BlockKitElement
    </step>
    <step order="5">Export from packages/shared/src/pagination/index.ts</step>
  </steps>

  <verification>
    <check type="build">cd packages/shared &amp;&amp; npm run build</check>
    <check type="test">cd packages/shared &amp;&amp; npm test -- --grep "pagination"</check>
    <check type="manual">Cursor encodes both id and timestamp</check>
    <check type="manual">Large result sets don't load all records</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires D1 schema for query building" />
  </dependencies>

  <commit-message>feat(shared): implement cursor-based pagination utility</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Implement MemberShip Registration + Checkout</title>
  <requirement>REQ-MS-002, REQ-MS-003: Member registration flow, Stripe Checkout for subscriptions</requirement>
  <description>
    Implement the member registration flow with a single form and Stripe Checkout
    integration for subscription creation. This is the core user-facing flow for
    the MemberShip plugin.
  </description>

  <context>
    <file path="packages/plugin-membership/src/sandbox-entry.ts" reason="Add routes" />
    <file path="packages/shared/src/stripe/client.ts" reason="Use Stripe integration" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Registration flow requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/routes/register.ts:
      - POST /register handler
      - Accept: { email, name, planId }
      - Validate email format and plan existence
      - Create or retrieve Stripe customer
      - Create Stripe Checkout session for subscription
      - Return: { sessionId, checkoutUrl }
    </step>
    <step order="2">Create packages/plugin-membership/src/routes/checkout-success.ts:
      - GET /checkout/success handler
      - Accept: { session_id } query param
      - Verify session with Stripe
      - Create member record in D1
      - Return success page/redirect
    </step>
    <step order="3">Add routes to sandbox-entry.ts definePlugin:
      - "/register": { public: true, handler: registerHandler }
      - "/checkout/success": { public: true, handler: checkoutSuccessHandler }
    </step>
    <step order="4">Create simple Astro registration form component:
      - packages/plugin-membership/src/astro/RegistrationForm.astro
      - Single form: email, name, plan selection dropdown
      - Submit to /register endpoint
    </step>
    <step order="5">Add input validation with helpful error messages (conversational tone per Decision #6)</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="manual">Registration form submits successfully</check>
    <check type="manual">Stripe Checkout session is created</check>
    <check type="manual">Member record created in D1 after successful checkout</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires D1 schema and queries" />
    <depends-on task-id="phase-1-task-2" reason="Requires plugin structure" />
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration" />
  </dependencies>

  <commit-message>feat(membership): implement registration flow with Stripe Checkout</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Implement Convene Event Creation</title>
  <requirement>REQ-CV-002: Event creation form (title, date, time, description, capacity, price)</requirement>
  <description>
    Implement the event creation form as a single-form experience. Admin can create
    events with all essential fields. Paid events create a Stripe price for checkout.
  </description>

  <context>
    <file path="packages/plugin-convene/src/sandbox-entry.ts" reason="Add routes" />
    <file path="packages/plugin-convene/src/db/schema.ts" reason="Events table" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Event creation requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/routes/events.ts:
      - POST /admin/events handler (create event)
      - Accept: { title, description, date, time, capacity, price }
      - Validate all required fields
      - If price > 0, create Stripe price
      - Store event in D1
      - Return: { event }
    </step>
    <step order="2">Create packages/plugin-convene/src/routes/events.ts:
      - GET /events handler (list public events)
      - GET /events/:id handler (single event)
      - Use cursor pagination for list
    </step>
    <step order="3">Add routes to sandbox-entry.ts definePlugin:
      - "/admin/events": { handler: createEventHandler }
      - "/events": { public: true, handler: listEventsHandler }
      - "/events/:id": { public: true, handler: getEventHandler }
    </step>
    <step order="4">Create Block Kit admin form:
      - packages/plugin-convene/src/admin/EventForm.ts
      - Single form with all fields
      - Date/time picker, capacity number input, price in dollars
    </step>
    <step order="5">Ensure 60-second benchmark: form should be submittable within 60 seconds of plugin install</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Event creation form works end-to-end</check>
    <check type="manual">Events stored in D1 with all fields</check>
    <check type="manual">Paid events have Stripe price ID</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires D1 schema and queries" />
    <depends-on task-id="phase-1-task-3" reason="Requires plugin structure" />
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration for paid events" />
  </dependencies>

  <commit-message>feat(convene): implement event creation form</commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Feature Completion

These tasks complete the core features for both plugins.

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Implement MemberShip Webhook Handler</title>
  <requirement>REQ-MS-004, REQ-SHARED-015: Stripe webhook handler, alert on signature failures</requirement>
  <description>
    Implement Stripe webhook handler for subscription lifecycle events. Handles
    subscribe, cancel, payment failed events. Invalid signatures trigger alerts
    per security requirements.
  </description>

  <context>
    <file path="packages/plugin-membership/src/sandbox-entry.ts" reason="Add webhook route" />
    <file path="packages/shared/src/stripe/webhook.ts" reason="Webhook verification" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Webhook requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/routes/webhook.ts:
      - POST /webhook handler
      - Verify signature using shared webhook module
      - On signature failure: log alert, return 400
    </step>
    <step order="2">Handle subscription events:
      - customer.subscription.created: Update member status to active
      - customer.subscription.updated: Sync plan changes
      - customer.subscription.deleted: Mark member as cancelled
      - invoice.payment_failed: Log failure, optionally notify member
    </step>
    <step order="3">Add idempotency handling:
      - Store processed event IDs in KV with 24-hour TTL
      - Skip already-processed events
    </step>
    <step order="4">Create alert function for signature failures:
      - Log to console with [ALERT] prefix
      - Store in KV for monitoring
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/webhook": { public: true, handler: webhookHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="test">npm test -- --grep "webhook"</check>
    <check type="manual">Valid webhook updates member status</check>
    <check type="manual">Invalid signature returns 400 and logs alert</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe webhook module" />
    <depends-on task-id="phase-1-task-7" reason="Requires member records to update" />
  </dependencies>

  <commit-message>feat(membership): implement Stripe webhook handler with alerts</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Implement MemberShip Access Check</title>
  <requirement>REQ-MS-005, REQ-SHARED-020: Access check endpoint, verify with Stripe for gating</requirement>
  <description>
    Create the access check endpoint that verifies member subscription status.
    CRITICAL: Always verify with Stripe for access decisions, never rely on
    stale cache per Decision #2.
  </description>

  <context>
    <file path="packages/plugin-membership/src/sandbox-entry.ts" reason="Add check-access route" />
    <file path="packages/shared/src/stripe/client.ts" reason="Subscription verification" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Stripe as source of truth" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/routes/check-access.ts:
      - GET /check-access handler
      - Accept: { email } or Authorization header with JWT
      - Look up member by email
      - Get Stripe customer ID from member record
    </step>
    <step order="2">Implement Stripe verification:
      - Call Stripe API to get current subscription status
      - DO NOT use cache for access decisions
      - Return: { hasAccess: boolean, plan: string | null, expiresAt: string | null }
    </step>
    <step order="3">Add comment in code: "CRITICAL: Access decisions MUST query Stripe directly. Cached data may be stale."</step>
    <step order="4">Handle edge cases:
      - No member found: { hasAccess: false }
      - No subscription: { hasAccess: false }
      - Subscription cancelled: { hasAccess: false }
      - Subscription past_due: { hasAccess: true } (grace period)
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/check-access": { public: true, handler: checkAccessHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="test">npm test -- --grep "access"</check>
    <check type="manual">Active subscription returns hasAccess: true</check>
    <check type="manual">Cancelled subscription returns hasAccess: false</check>
    <check type="manual">Endpoint queries Stripe, not cache</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe client" />
    <depends-on task-id="phase-1-task-7" reason="Requires member records" />
  </dependencies>

  <commit-message>feat(membership): implement access check endpoint with Stripe verification</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Implement Member Dashboard</title>
  <requirement>REQ-MS-006, REQ-MS-007: Member dashboard view and cancel functionality</requirement>
  <description>
    Build the member dashboard where users can view their subscription status
    and cancel their subscription. Uses conversational language per Decision #6.
  </description>

  <context>
    <file path="packages/plugin-membership/src/sandbox-entry.ts" reason="Add dashboard routes" />
    <file path="plugins/membership/src/astro/MemberPortal.astro" reason="Reference existing pattern" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Member dashboard requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/routes/dashboard.ts:
      - GET /dashboard handler
      - Require authentication (JWT in cookie)
      - Fetch member data from D1
      - Fetch subscription from Stripe (with cache for display)
      - Return member and subscription data
    </step>
    <step order="2">Create packages/plugin-membership/src/routes/cancel.ts:
      - POST /cancel handler
      - Require authentication
      - Call Stripe to cancel subscription at period end
      - Return confirmation
    </step>
    <step order="3">Create Astro component:
      - packages/plugin-membership/src/astro/MemberDashboard.astro
      - Show: current plan, next billing date, payment method (last 4)
      - Cancel button with confirmation dialog
      - Use conversational copy: "You're on the {plan} plan" not "Current subscription: {plan}"
    </step>
    <step order="4">Add routes to sandbox-entry.ts:
      - "/dashboard": { handler: dashboardHandler }
      - "/cancel": { handler: cancelHandler }
    </step>
    <step order="5">Show "Syncing..." indicator if Stripe data is from cache</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="manual">Dashboard shows current subscription</check>
    <check type="manual">Cancel button cancels subscription</check>
    <check type="manual">Copy uses conversational language</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration" />
    <depends-on task-id="phase-1-task-7" reason="Requires member authentication" />
  </dependencies>

  <commit-message>feat(membership): implement member dashboard with cancel</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Implement Convene Event Registration</title>
  <requirement>REQ-CV-003, REQ-CV-004: Event registration flow, Stripe Checkout for tickets</requirement>
  <description>
    Implement the event registration flow for attendees. Free events register
    immediately, paid events go through Stripe Checkout for one-time payment.
  </description>

  <context>
    <file path="packages/plugin-convene/src/sandbox-entry.ts" reason="Add registration routes" />
    <file path="packages/shared/src/stripe/client.ts" reason="Stripe Checkout" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Registration requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/routes/register.ts:
      - POST /events/:id/register handler
      - Accept: { email, name }
      - Validate event exists and has capacity
      - If free: create registration immediately
      - If paid: create Stripe Checkout session
    </step>
    <step order="2">Create packages/plugin-convene/src/routes/checkout-success.ts:
      - GET /checkout/success handler
      - Verify Stripe session
      - Create registration record in D1
      - Return success page
    </step>
    <step order="3">Add capacity management:
      - Check current registration count vs capacity
      - Reject if at capacity with friendly message
      - Consider atomic increment to prevent race conditions
    </step>
    <step order="4">Create Astro registration form:
      - packages/plugin-convene/src/astro/RegistrationForm.astro
      - Simple form: name, email
      - Show event details and price
    </step>
    <step order="5">Add routes to sandbox-entry.ts:
      - "/events/:id/register": { public: true, handler: registerHandler }
      - "/checkout/success": { public: true, handler: checkoutSuccessHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Free event registration works</check>
    <check type="manual">Paid event creates Stripe Checkout</check>
    <check type="manual">Capacity limit is enforced</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration" />
    <depends-on task-id="phase-1-task-8" reason="Requires events to register for" />
  </dependencies>

  <commit-message>feat(convene): implement event registration with Stripe Checkout</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="3">
  <title>Implement Convene Webhook Handler</title>
  <requirement>REQ-CV-005: Stripe webhook handler for payment events</requirement>
  <description>
    Implement Stripe webhook handler for Convene payment events. Handles successful
    payments and refunds for event registrations.
  </description>

  <context>
    <file path="packages/plugin-convene/src/sandbox-entry.ts" reason="Add webhook route" />
    <file path="packages/shared/src/stripe/webhook.ts" reason="Webhook verification" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Webhook requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/routes/webhook.ts:
      - POST /webhook handler
      - Verify signature using shared webhook module
      - On signature failure: log alert, return 400
    </step>
    <step order="2">Handle payment events:
      - checkout.session.completed: Confirm registration
      - charge.refunded: Cancel registration, free up capacity
    </step>
    <step order="3">Add idempotency handling:
      - Store processed event IDs in KV with 24-hour TTL
      - Skip already-processed events
    </step>
    <step order="4">Update registration status:
      - On payment success: status = 'confirmed'
      - On refund: status = 'cancelled', increment available capacity
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/webhook": { public: true, handler: webhookHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="test">npm test -- --grep "webhook"</check>
    <check type="manual">Payment success confirms registration</check>
    <check type="manual">Refund cancels registration and frees capacity</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe webhook module" />
    <depends-on task-id="phase-1-task-12" reason="Requires registrations to update" />
  </dependencies>

  <commit-message>feat(convene): implement Stripe webhook handler</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="3">
  <title>Create MemberShip Email Templates</title>
  <requirement>REQ-MS-012, REQ-SHARED-006: Registration confirmation email, conversational language</requirement>
  <description>
    Create beautiful default email templates for MemberShip. Templates use
    conversational language and are HTML-only (no WYSIWYG per Decision #8).
  </description>

  <context>
    <file path="plugins/membership/src/email.ts" reason="Reference existing templates" />
    <file path="packages/shared/src/email/client.ts" reason="Email sending" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Email requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/email/templates.ts:
      - registrationConfirmation({ memberName, planName, email }): EmailContent
      - Returns { subject, html, text }
    </step>
    <step order="2">Design beautiful HTML template:
      - Clean, modern design
      - Mobile-responsive
      - Use conversational copy: "Welcome to {site}!" not "Registration Confirmation"
      - Include: plan name, next steps, support contact
    </step>
    <step order="3">Add plain text fallback:
      - Same content without HTML formatting
      - Proper line breaks and spacing
    </step>
    <step order="4">Create sendRegistrationEmail(ctx, member, plan) function:
      - Build template with member data
      - Call shared email client
      - Log success/failure
    </step>
    <step order="5">Integrate with registration flow:
      - Call sendRegistrationEmail after successful checkout
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="manual">Email renders correctly in email client</check>
    <check type="manual">Copy is conversational, not technical</check>
    <check type="manual">Plain text version is readable</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Requires email infrastructure" />
    <depends-on task-id="phase-1-task-7" reason="Integrates with registration flow" />
  </dependencies>

  <commit-message>feat(membership): create registration confirmation email template</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="3">
  <title>Create Convene Email Templates</title>
  <requirement>REQ-CV-009, REQ-SHARED-006: Registration confirmation email, conversational language</requirement>
  <description>
    Create beautiful default email templates for Convene event registration.
    Templates use conversational language and are HTML-only.
  </description>

  <context>
    <file path="plugins/eventdash/src/email.ts" reason="Reference existing templates" />
    <file path="packages/shared/src/email/client.ts" reason="Email sending" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Email requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/email/templates.ts:
      - registrationConfirmation({ attendeeName, eventTitle, date, time, location }): EmailContent
      - Returns { subject, html, text }
    </step>
    <step order="2">Design beautiful HTML template:
      - Clean, modern design
      - Mobile-responsive
      - Use conversational copy: "You're going to {event}!" not "Event Registration Confirmation"
      - Include: event details, date/time, location (if any), add to calendar link
    </step>
    <step order="3">Add plain text fallback:
      - Same content without HTML formatting
    </step>
    <step order="4">Create sendRegistrationEmail(ctx, registration, event) function:
      - Build template with event and attendee data
      - Call shared email client
      - Log success/failure
    </step>
    <step order="5">Integrate with registration flow:
      - Call sendRegistrationEmail after successful registration/payment
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Email renders correctly</check>
    <check type="manual">Event details are clearly visible</check>
    <check type="manual">Copy is friendly and conversational</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Requires email infrastructure" />
    <depends-on task-id="phase-1-task-12" reason="Integrates with registration flow" />
  </dependencies>

  <commit-message>feat(convene): create registration confirmation email template</commit-message>
</task-plan>
```

---

### Wave 4 (Parallel, after Wave 3) — Admin UI

These tasks build the admin interfaces for both plugins.

```xml
<task-plan id="phase-1-task-16" wave="4">
  <title>Build MemberShip Admin Member List</title>
  <requirement>REQ-MS-008, REQ-MS-013: Admin member list with pagination, empty state</requirement>
  <description>
    Build the admin member list page with cursor-based pagination via Block Kit.
    Includes the empty state with copy "Your first member is one link away".
  </description>

  <context>
    <file path="packages/plugin-membership/src/admin/" reason="Admin page location" />
    <file path="packages/shared/src/pagination/" reason="Pagination utility" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Pagination and empty state requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/admin/members.ts:
      - Export Block Kit page definition
      - Fetch paginated members from D1
      - Use shared pagination utility
    </step>
    <step order="2">Build member list table:
      - Columns: Name, Email, Plan, Status, Joined
      - Each row links to member detail
      - Pagination controls (Previous/Next with cursors)
    </step>
    <step order="3">Create empty state:
      - Show when member count is 0
      - Copy: "Your first member is one link away"
      - Include link to share registration page
    </step>
    <step order="4">Add search/filter (optional):
      - Filter by plan
      - Filter by status (active, cancelled)
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/admin/members": { handler: membersPageHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="manual">Member list displays with pagination</check>
    <check type="manual">Empty state shows correct copy</check>
    <check type="manual">Pagination works correctly at 50+ members</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Requires pagination utility" />
    <depends-on task-id="phase-1-task-9" reason="Requires member data from webhooks" />
  </dependencies>

  <commit-message>feat(membership): build admin member list with pagination</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-17" wave="4">
  <title>Build MemberShip Admin Plan Management</title>
  <requirement>REQ-MS-009, REQ-MS-010: Admin create and edit membership plans</requirement>
  <description>
    Build admin interface for creating and editing membership plans via Block Kit.
    Plans sync with Stripe products/prices.
  </description>

  <context>
    <file path="packages/plugin-membership/src/admin/" reason="Admin page location" />
    <file path="packages/shared/src/stripe/client.ts" reason="Stripe product/price creation" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Plan management requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/admin/plans.ts:
      - Export Block Kit page definition
      - List existing plans
      - Create/edit plan forms
    </step>
    <step order="2">Build plan creation form:
      - Fields: Name, Description, Price, Interval (monthly/yearly)
      - On submit: Create Stripe product + price, then store in D1
    </step>
    <step order="3">Build plan edit form:
      - Load existing plan data
      - Allow editing name, description
      - Price changes create new Stripe price (existing subscriptions keep old price)
    </step>
    <step order="4">Add plan activation toggle:
      - Active plans appear in registration form
      - Inactive plans are hidden but existing subscriptions continue
    </step>
    <step order="5">Add routes to sandbox-entry.ts:
      - "/admin/plans": { handler: plansPageHandler }
      - "/admin/plans/:id": { handler: planDetailHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="manual">Can create new plan</check>
    <check type="manual">Can edit existing plan</check>
    <check type="manual">Stripe product/price created on plan creation</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration" />
    <depends-on task-id="phase-1-task-7" reason="Plans used in registration" />
  </dependencies>

  <commit-message>feat(membership): build admin plan management UI</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-18" wave="4">
  <title>Build MemberShip Admin Settings</title>
  <requirement>REQ-MS-011: Admin Stripe connection settings</requirement>
  <description>
    Build admin settings page for Stripe connection configuration.
    Guides user through connecting their Stripe account.
  </description>

  <context>
    <file path="packages/plugin-membership/src/admin/" reason="Admin page location" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="60-second onboarding benchmark" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/src/admin/settings.ts:
      - Export Block Kit page definition
      - Show Stripe connection status
    </step>
    <step order="2">Build Stripe connection UI:
      - If not connected: Show "Connect Stripe" button (conversational copy)
      - If connected: Show connected account info, "Disconnect" option
    </step>
    <step order="3">Store Stripe credentials:
      - Use environment variables for API keys
      - Store connection status in KV
    </step>
    <step order="4">Add webhook configuration helper:
      - Display webhook URL to configure in Stripe dashboard
      - Show which events to enable
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/admin/settings": { handler: settingsPageHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-membership &amp;&amp; npm run build</check>
    <check type="manual">Settings page loads</check>
    <check type="manual">Stripe connection status displays correctly</check>
    <check type="manual">Webhook URL is clearly visible</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration" />
  </dependencies>

  <commit-message>feat(membership): build admin Stripe settings UI</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-19" wave="4">
  <title>Build Convene Attendee List</title>
  <requirement>REQ-CV-006: Attendee list per event</requirement>
  <description>
    Build attendee list view for each event showing registered attendees.
    Includes status (confirmed, cancelled) and payment info for paid events.
  </description>

  <context>
    <file path="packages/plugin-convene/src/admin/" reason="Admin page location" />
    <file path="packages/plugin-convene/src/db/queries.ts" reason="Registration queries" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/admin/attendees.ts:
      - Export Block Kit page definition
      - Accept eventId parameter
      - Fetch registrations for event
    </step>
    <step order="2">Build attendee table:
      - Columns: Name, Email, Status, Registered At
      - For paid events: add Payment Status column
    </step>
    <step order="3">Add summary stats:
      - Total registered: X
      - Capacity: X/Y
      - Revenue (for paid events): $X
    </step>
    <step order="4">Add export functionality (basic):
      - Copy emails to clipboard button
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/admin/events/:id/attendees": { handler: attendeesPageHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Attendee list shows for each event</check>
    <check type="manual">Status displays correctly</check>
    <check type="manual">Summary stats are accurate</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-12" reason="Requires registration data" />
    <depends-on task-id="phase-1-task-13" reason="Requires webhook-confirmed registrations" />
  </dependencies>

  <commit-message>feat(convene): build attendee list UI</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-20" wave="4">
  <title>Build Convene Admin Event List</title>
  <requirement>REQ-CV-007, REQ-CV-010: Admin event list with pagination, empty state</requirement>
  <description>
    Build the admin event list page with cursor-based pagination.
    Includes empty state with copy "Your first event is 60 seconds away".
  </description>

  <context>
    <file path="packages/plugin-convene/src/admin/" reason="Admin page location" />
    <file path="packages/shared/src/pagination/" reason="Pagination utility" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Pagination and empty state requirements" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/admin/events.ts:
      - Export Block Kit page definition
      - Fetch paginated events from D1
      - Use shared pagination utility
    </step>
    <step order="2">Build event list table:
      - Columns: Title, Date, Registrations, Capacity, Price
      - Each row links to event detail/attendee list
      - Pagination controls
    </step>
    <step order="3">Create empty state:
      - Show when event count is 0
      - Copy: "Your first event is 60 seconds away"
      - Include "Create Event" button
    </step>
    <step order="4">Add filter options:
      - Filter: Upcoming, Past, All
      - Sort: Date (default), Title
    </step>
    <step order="5">Link to attendee list from each row</step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Event list displays with pagination</check>
    <check type="manual">Empty state shows correct copy</check>
    <check type="manual">Can navigate to attendee list</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Requires pagination utility" />
    <depends-on task-id="phase-1-task-8" reason="Requires events to list" />
  </dependencies>

  <commit-message>feat(convene): build admin event list with pagination</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-21" wave="4">
  <title>Build Convene Admin Settings</title>
  <requirement>REQ-CV-008: Admin Stripe connection settings</requirement>
  <description>
    Build admin settings page for Convene Stripe connection.
    May share connection with MemberShip per open question #3.
  </description>

  <context>
    <file path="packages/plugin-convene/src/admin/" reason="Admin page location" />
    <file path="packages/plugin-membership/src/admin/settings.ts" reason="Reference MemberShip settings" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="Shared Stripe question" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-convene/src/admin/settings.ts:
      - Export Block Kit page definition
      - Show Stripe connection status
    </step>
    <step order="2">Check for shared Stripe connection:
      - If MemberShip is installed and connected, offer to use same connection
      - Otherwise, show independent connection UI
    </step>
    <step order="3">Build connection UI (similar to MemberShip):
      - "Connect Stripe" button with conversational copy
      - Display webhook URL for Convene
    </step>
    <step order="4">Add webhook configuration helper:
      - Webhook URL specific to Convene
      - Events to enable: checkout.session.completed, charge.refunded
    </step>
    <step order="5">Add route to sandbox-entry.ts:
      - "/admin/settings": { handler: settingsPageHandler }
    </step>
  </steps>

  <verification>
    <check type="build">cd packages/plugin-convene &amp;&amp; npm run build</check>
    <check type="manual">Settings page loads</check>
    <check type="manual">Can connect Stripe independently or share</check>
    <check type="manual">Webhook URL displays correctly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires Stripe integration" />
    <depends-on task-id="phase-1-task-18" reason="May share connection with MemberShip" />
  </dependencies>

  <commit-message>feat(convene): build admin Stripe settings UI</commit-message>
</task-plan>
```

---

### Wave 5 (Sequential, after Wave 4) — Testing & Documentation

Final tasks for testing, documentation, and launch readiness.

```xml
<task-plan id="phase-1-task-22" wave="5">
  <title>Implement E2E Tests for Payment Flows</title>
  <requirement>REQ-SHARED-009, REQ-SHARED-010: E2E tests for payment workflows and subscription lifecycle</requirement>
  <description>
    Create comprehensive E2E tests for all payment workflows. This is NON-NEGOTIABLE
    per Decision #9: "You cannot ship payment software on vibes."
  </description>

  <context>
    <file path="packages/plugin-membership/tests/e2e/" reason="MemberShip E2E tests" />
    <file path="packages/plugin-convene/tests/e2e/" reason="Convene E2E tests" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="E2E testing requirement" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/tests/e2e/registration.test.ts:
      - Test: Full registration flow (form → Stripe → webhook → member created)
      - Test: Registration with invalid email fails gracefully
      - Test: Registration for non-existent plan fails
    </step>
    <step order="2">Create packages/plugin-membership/tests/e2e/webhooks.test.ts:
      - Test: Subscription created webhook creates member
      - Test: Subscription cancelled webhook updates member
      - Test: Payment failed webhook handles gracefully
      - Test: Invalid webhook signature returns 400
      - Test: Duplicate webhook is idempotent
    </step>
    <step order="3">Create packages/plugin-convene/tests/e2e/registration.test.ts:
      - Test: Free event registration flow
      - Test: Paid event registration (form → Stripe → webhook → confirmed)
      - Test: Registration at capacity fails with friendly message
    </step>
    <step order="4">Create packages/plugin-convene/tests/e2e/webhooks.test.ts:
      - Test: Payment success confirms registration
      - Test: Refund cancels registration and frees capacity
      - Test: Invalid signature returns 400
    </step>
    <step order="5">Set up Stripe test mode fixtures:
      - Mock Stripe API responses
      - Test webhook signature generation
    </step>
  </steps>

  <verification>
    <check type="test">cd packages/plugin-membership &amp;&amp; npm run test:e2e</check>
    <check type="test">cd packages/plugin-convene &amp;&amp; npm run test:e2e</check>
    <check type="manual">All payment paths covered</check>
    <check type="manual">Webhook edge cases tested</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Tests MemberShip webhooks" />
    <depends-on task-id="phase-1-task-13" reason="Tests Convene webhooks" />
    <depends-on task-id="phase-1-task-16" reason="Tests require full feature implementation" />
    <depends-on task-id="phase-1-task-20" reason="Tests require full feature implementation" />
  </dependencies>

  <commit-message>test: add E2E tests for payment flows and webhooks</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-23" wave="5">
  <title>Implement Unit Tests for API Routes</title>
  <requirement>REQ-SHARED-011: Unit tests for all API routes</requirement>
  <description>
    Create unit tests for all API routes in both plugins. Each route handler
    should have tests for success and error cases.
  </description>

  <context>
    <file path="packages/plugin-membership/tests/unit/" reason="MemberShip unit tests" />
    <file path="packages/plugin-convene/tests/unit/" reason="Convene unit tests" />
    <file path="prds/completed/003-emdash-plugins.md" reason="Quality bar requirement" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/tests/unit/routes.test.ts:
      - Test: /register route validation
      - Test: /check-access with valid/invalid member
      - Test: /dashboard returns correct data
      - Test: /cancel calls Stripe correctly
    </step>
    <step order="2">Create packages/plugin-membership/tests/unit/queries.test.ts:
      - Test: getMemberByEmail returns null for non-existent
      - Test: listMembers pagination works correctly
      - Test: createMember validates required fields
    </step>
    <step order="3">Create packages/plugin-convene/tests/unit/routes.test.ts:
      - Test: POST /admin/events validates required fields
      - Test: GET /events returns paginated list
      - Test: POST /events/:id/register checks capacity
    </step>
    <step order="4">Create packages/plugin-convene/tests/unit/queries.test.ts:
      - Test: getEventById returns null for non-existent
      - Test: listEvents pagination
      - Test: listRegistrations filters by event
    </step>
    <step order="5">Create shared tests:
      - packages/shared/tests/pagination.test.ts
      - packages/shared/tests/stripe.test.ts
      - packages/shared/tests/email.test.ts
    </step>
  </steps>

  <verification>
    <check type="test">cd packages/plugin-membership &amp;&amp; npm test</check>
    <check type="test">cd packages/plugin-convene &amp;&amp; npm test</check>
    <check type="test">cd packages/shared &amp;&amp; npm test</check>
    <check type="manual">All routes have unit tests</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-22" reason="E2E tests should pass first" />
  </dependencies>

  <commit-message>test: add unit tests for all API routes</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-24" wave="5">
  <title>Create README and Verify Benchmarks</title>
  <requirement>REQ-SHARED-013, REQ-SHARED-005, REQ-SHARED-019, REQ-SHARED-023: README docs, 60-second benchmark, load testing, migration scripts</requirement>
  <description>
    Create comprehensive README documentation, verify the 60-second first-run
    benchmark, run load tests at 10,000 records, and finalize migration scripts.
  </description>

  <context>
    <file path="packages/plugin-membership/" reason="MemberShip README" />
    <file path="packages/plugin-convene/" reason="Convene README" />
    <file path="rounds/003-emdash-plugins/decisions.md" reason="60-second benchmark, load testing" />
  </context>

  <steps>
    <step order="1">Create packages/plugin-membership/README.md:
      - Installation instructions
      - Quick start (connect Stripe, create plan, share registration link)
      - API reference for all routes
      - Environment variables
      - Troubleshooting
    </step>
    <step order="2">Create packages/plugin-convene/README.md:
      - Installation instructions
      - Quick start (connect Stripe, create event)
      - API reference for all routes
      - Environment variables
    </step>
    <step order="3">Verify 60-second benchmark:
      - Time from npm install to first plan created (MemberShip)
      - Time from npm install to first event published (Convene)
      - Document any steps that slow this down
    </step>
    <step order="4">Run load tests:
      - Seed D1 with 10,000 member records
      - Test admin member list pagination performance
      - Seed with 10,000 events
      - Test admin event list pagination performance
      - Document response times
    </step>
    <step order="5">Create migration scripts:
      - packages/shared/src/db/migrations/001-initial.sql
      - Include schema version tracking
      - Document migration process in README
    </step>
  </steps>

  <verification>
    <check type="manual">README covers installation and usage</check>
    <check type="manual">60-second benchmark achieved</check>
    <check type="manual">Load test passes at 10,000 records</check>
    <check type="manual">Migration scripts work correctly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-22" reason="All features must be complete" />
    <depends-on task-id="phase-1-task-23" reason="All tests must pass" />
  </dependencies>

  <commit-message>docs: create README and verify launch benchmarks</commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

| Risk | Severity | Mitigation in Plan |
|------|----------|-------------------|
| Webhook signature validation failures | Critical | Task 9, 13 implement signature verification with alerts |
| Stripe data becomes stale | High | Task 5 enforces 60-second cache TTL, Task 10 always queries Stripe for access |
| D1 schema migrations break deployments | High | Task 1 includes versioning, Task 24 creates migration scripts |
| 60-second benchmark not achieved | High | Task 24 verifies benchmark, design prioritizes simplicity |
| KV used for subscription state | Medium | Task 5 explicitly documents "never persist subscription state" |
| Admin dashboard slow at scale | Medium | Task 6 implements cursor pagination, Task 24 load tests at 10,000 |
| Email delivery failures silent | Medium | Task 4 implements logging and retry |
| Payment flows untested | Critical | Task 22 implements comprehensive E2E tests |

---

## Execution Summary

| Wave | Tasks | Parallel? | Est. Time |
|------|-------|-----------|-----------|
| 1 | task-1, task-2, task-3, task-4 | Yes | 4-6 hours |
| 2 | task-5, task-6, task-7, task-8 | Yes | 6-8 hours |
| 3 | task-9, task-10, task-11, task-12, task-13, task-14, task-15 | Yes | 8-10 hours |
| 4 | task-16, task-17, task-18, task-19, task-20, task-21 | Yes | 6-8 hours |
| 5 | task-22, task-23, task-24 | Sequential | 6-8 hours |

**Total Estimated Time:** 30-40 hours
**Parallel Efficiency:** 5 waves instead of 24 sequential tasks

---

## Post-Plan Checklist

- [x] All 46 requirements in REQUIREMENTS.md have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed in relevant tasks
- [x] 60-second benchmark explicitly verified in Task 24
- [x] E2E tests for payment flows in Task 22 (non-negotiable)
