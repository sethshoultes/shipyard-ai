# Phase 2: Stripe Integration — Build Plan

**Date**: 2026-04-05  
**Directors**: Elon Musk (Engineering), Steve Jobs (Design)  
**Phase Duration**: 2 weeks  
**Token Budget**: 300K tokens (from 500K plugin base)  

**North Star**: Members feel safe, in control, and stay on-brand throughout payment and subscription lifecycle. All payment happens on-site. Stripe is invisible to the user.

---

## Architecture Summary

### Core Principles (from Rick Rubin Essence Check)
1. **Trust through simplicity** — Stripe is source of truth. Dashboard shows real data, no surprises.
2. **Seamless payment experience** — No redirects. Inline checkout + webhook confirmation in background.
3. **One source of truth** — KV syncs with Stripe via webhooks. Dashboard fetches fresh from Stripe (never cached).

### Tech Stack
- **Stripe API**: Subscriptions, PaymentIntents, SetupIntent, Webhooks
- **JWT Auth**: httpOnly cookies + refresh endpoint (replaces email-only)
- **KV Schema**: Add stripeCustomerId, stripeSubscriptionId, stripePaymentIntentId
- **Webhooks**: Resend for email, Stripe webhooks for payment confirmation
- **Frontend**: Stripe Elements + SetupIntent modal (embedded, no redirects)

### Build Phases

```
Wave 1 (Independent — parallel)    [Days 1-2]
├─ Task 1: Auth middleware (JWT)
├─ Task 2: MemberShip KV schema
└─ Task 3: EventDash KV schema

Wave 2 (Depends on Wave 1)         [Days 3-4]
├─ Task 4: MemberShip Checkout
├─ Task 5: MemberShip webhook handler
└─ Task 6: EventDash Checkout

Wave 3 (Depends on Wave 2)         [Days 5-7]
├─ Task 7: Member dashboard
├─ Task 8: EventDash email confirmation
└─ Task 9: MemberShip email automation

Wave 4 (Depends on Wave 3)         [Days 8-10]
├─ Task 10: Coupon/discount codes
├─ Task 11: Ticket types (EventDash)
└─ Task 12: README updates + ship
```

---

## WAVE 1: Infrastructure (Parallel)

### TASK 1: MemberShip Auth Middleware — JWT Token Generation & Refresh

**Owner**: Elon Musk  
**Model**: Sonnet (director decision authority)  
**Duration**: 4-6 hours  
**Token Budget**: 15K  

**Requirement Trace**:
- Phase 2 Round 1: "Session persistence — JWT token stored in secure httpOnly cookie, token refresh endpoint, /api/member/me endpoint"
- PARITY.md: "Missing: Stripe webhooks, member dashboard (self-serve portal)"
- Rick Rubin Essence: "One source of truth"

**Description**:
Create JWT-based authentication for member dashboard. Replaces Phase 1 email-only cookies with secure, refreshable tokens. Member dashboard, subscription endpoints, and billing portal require auth via httpOnly cookie + refresh flow.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (current member register/status routes)
- `/home/agent/shipyard-ai/plugins/membership/src/config.ts` (env validation)
- Debate decisions: `phase2-round-1.md` Q1 (Session persistence section)

**Steps**:

1. **Define JWT schema in plugin context**:
   - Add `jwtSecret` to plugin environment (from `.env.stripe`)
   - Add `jwtExpiry` config (15m for access token, 7d for refresh token)

2. **Create auth middleware**:
   - `POST /membership/auth/register` → create member + generate JWT
   - `POST /membership/auth/login` → validate email + password (optional for Phase 2A), generate JWT
   - `POST /membership/auth/refresh` → validate refresh token, issue new access token
   - Response sets `httpOnly` cookie: `Authorization: Bearer {token}`

3. **Create /api/member/me endpoint**:
   - Requires valid JWT from httpOnly cookie
   - Returns: `{ email, plan, subscription_id, stripe_customer_id, status, expiresAt }`
   - Queries KV for member record + Stripe API for subscription details (no cache)

4. **Create JWT helper utilities**:
   - `signJWT(payload, secret, expiresIn)` → returns token string
   - `verifyJWT(token, secret)` → returns payload or null
   - `extractToken(request.headers.authorization)` → returns token or null
   - Implement secure: no localStorage, httpOnly, SameSite=Strict

5. **Update existing routes to require auth**:
   - `/membership/status` → stays public (for gating checks)
   - `/membership/subscribe` (new) → requires JWT
   - `/membership/subscription/cancel` (new) → requires JWT
   - `/membership/subscription/upgrade` (new) → requires JWT

6. **Test**:
   - Unit: JWT sign/verify with test secret
   - Integration: register → get token in cookie → call /me → returns member data
   - Edge: token expiry, refresh failure, malformed headers

**Verification Checks**:
- [ ] JWT token created on registration
- [ ] httpOnly cookie set with Secure + SameSite
- [ ] Token expiry enforced (15m access token)
- [ ] Refresh endpoint validates old token + issues new one
- [ ] /me endpoint returns Stripe subscription data
- [ ] Unauthorized requests return 401
- [ ] Token payload includes org_id for multi-tenant isolation (future)

**Dependencies**: None (independent)

**Related**: Task 2, Task 4

**Commit Message**:
```
feat(membership): JWT auth middleware + token refresh endpoint

- Add JWT token generation on member registration
- Create httpOnly secure cookie storage (no localStorage)
- Add POST /auth/refresh endpoint for token renewal
- Add GET /member/me endpoint (requires auth) → returns member + subscription
- Implement token expiry (15m access, 7d refresh)
- Add JWT verification middleware for protected routes

Follows Phase 2 Round 1 decision: "Session persistence via JWT in httpOnly cookie"
Implements Rick Rubin Essence: "Stripe as source of truth"
```

---

### TASK 2: MemberShip KV Schema Update — Add Stripe Fields

**Owner**: Elon Musk  
**Model**: Haiku (schema work)  
**Duration**: 2-3 hours  
**Token Budget**: 8K  

**Requirement Trace**:
- PARITY.md: "Stripe Checkout integration, webhook handling"
- Debate Round 1: "Stripe is source of truth for subscription state"
- Rick Rubin Essence: "KV syncs with Stripe via webhooks"

**Description**:
Extend MemberShip KV storage schema to track Stripe customer ID, subscription ID, and payment details. KV records become the fast-access cache for member status; Stripe API is always queried for authoritative subscription state.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (current MemberRecord type)
- Debate Round 2: "Subscription details...call Stripe API (150-300ms)"
- Rick Rubin: "KV stores only what we need to quickly check access"

**Steps**:

1. **Update MemberRecord interface**:
   ```typescript
   interface MemberRecord {
     email: string;
     plan: string;
     status: "pending" | "active" | "revoked";
     createdAt: string;
     
     // NEW: Stripe fields
     stripeCustomerId?: string;      // Customer ID from Stripe
     stripeSubscriptionId?: string;  // Active subscription ID
     stripePaymentIntentId?: string; // Last payment intent
     billingEmail?: string;          // Override email for billing
     expiresAt?: string;             // Local cache of renewal date
     lastSyncAt?: string;            // Last webhook sync time
   }
   ```

2. **Create migration helper**:
   - `migrateV0toV1(kv)` → reads old member records, adds new fields with null defaults
   - Run on plugin upgrade to backfill existing members

3. **Add KV index helpers**:
   - `emailToMemberId(email)` → returns `member:{encoded_email}`
   - `stripeCustomerToMemberId(customerId)` → returns member email (reverse lookup for webhooks)

4. **Add KV expiry policies**:
   - Member records: no TTL (permanent until deleted)
   - Webhook idempotency keys: 24h TTL (prevent duplicate processing)
   - Payment intent pending: 1h TTL (cleanup after confirmation)

5. **Update register route**:
   - After Stripe customer creation, save `stripeCustomerId` to KV
   - When subscription created (webhook), save `stripeSubscriptionId` + `expiresAt`

6. **Add KV validation**:
   - Check that stripeCustomerId is not empty if status=active
   - Check that stripeSubscriptionId matches latest from Stripe

**Verification Checks**:
- [ ] MemberRecord interface has Stripe fields (all optional)
- [ ] Existing members migrate without error
- [ ] New members get stripeCustomerId on registration
- [ ] Webhook updates stripeSubscriptionId correctly
- [ ] KV indices lookup members by Stripe customer ID

**Dependencies**: None (independent)

**Related**: Task 1, Task 4, Task 5

**Commit Message**:
```
feat(membership): extend KV schema for Stripe integration

- Add stripeCustomerId, stripeSubscriptionId, stripePaymentIntentId to MemberRecord
- Add billingEmail override, lastSyncAt for webhook tracking
- Create migration helper for existing members (backward compatible)
- Add KV index helpers for Stripe → member lookups
- Set TTL policies: webhook idempotency 24h, pending intents 1h

Schema now stores Stripe relationships without caching subscription state.
Implements Rick Rubin principle: "KV is cache, Stripe is source of truth"
```

---

### TASK 3: EventDash KV Schema Update — Add Stripe & Ticket Fields

**Owner**: Steve Jobs  
**Model**: Haiku (schema work)  
**Duration**: 2-3 hours  
**Token Budget**: 8K  

**Requirement Trace**:
- PARITY.md: "Stripe Checkout for paid events, ticket types (early bird, VIP, general)"
- Debate Round 1: "Paid events: inline checkout with Stripe Elements"
- Phase 2 Round 2: "Webhook confirms payment → creates registration"

**Description**:
Extend EventDash KV storage to support paid events, Stripe payment intents, and ticket types. Enable per-event pricing, ticket variants (early bird, VIP, general), and payment tracking.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts` (current EventRecord, RegistrationRecord)
- Debate Round 1: "Paid events: POST /api/events/:id/create-checkout → creates Stripe payment intent"

**Steps**:

1. **Update EventRecord interface**:
   ```typescript
   interface EventRecord {
     id: string;
     title: string;
     description?: string;
     date: string; // ISO date
     time: string; // HH:MM
     endTime?: string;
     location: string;
     capacity: number;
     registered: number;
     templateId?: string;
     createdAt: string;
     
     // NEW: Stripe fields
     isPaid: boolean;                    // true = paid event
     stripePriceId?: string;             // Stripe price ID for default ticket
     ticketTypes?: TicketType[];         // Array of ticket variants
     totalRevenue?: number;              // Cumulative from successful payments
   }
   
   interface TicketType {
     id: string;                         // Unique within event
     name: string;                       // "Early Bird", "VIP", "General"
     stripePriceId: string;              // Stripe price ID
     price: number;                      // In cents
     capacity: number;                   // Seats available
     sold: number;                       // Seats sold
     description?: string;
     availableUntil?: string;            // ISO date for early bird cutoff
   }
   ```

2. **Update RegistrationRecord interface**:
   ```typescript
   interface RegistrationRecord {
     email: string;
     name: string;
     status: "registered" | "cancelled";
     ticketCount: number;
     createdAt: string;
     
     // NEW: Stripe fields
     ticketTypeId?: string;              // Which ticket type purchased
     stripePaymentIntentId?: string;     // Payment intent ID
     stripeChargeId?: string;            // Charge ID after success
     pricePaidInCents?: number;          // What they actually paid
     paidAt?: string;                    // Payment confirmation time
   }
   ```

3. **Create TicketType helpers**:
   - `createTicketType(eventId, name, price, stripePriceId, capacity)` → generates ID
   - `getAvailableTicketTypes(eventId)` → filters by availableUntil + capacity > sold
   - `decrementTicketCapacity(eventId, ticketTypeId)` → sold++, validate capacity

4. **Add KV indices**:
   - `event:{eventId}` → EventRecord with ticketTypes array
   - `event:{eventId}:tickets:{ticketTypeId}` → TicketType (optional, for fast lookup)
   - `registration:{eventId}:{email}` → RegistrationRecord

5. **Add free/paid event validation**:
   - If isPaid=true, require at least one ticketType with stripePriceId
   - If isPaid=false, ignore all Stripe fields (no checkout flow)

6. **Add capacity safeguards**:
   - Sum all ticketTypes.sold ≤ total event capacity
   - Handle overselling race conditions (lock during purchase)

**Verification Checks**:
- [ ] EventRecord supports isPaid flag
- [ ] TicketTypes array stored per event
- [ ] RegistrationRecord tracks payment intent + charge
- [ ] getAvailableTicketTypes filters by date + capacity
- [ ] Capacity validation prevents overselling
- [ ] Free events work unchanged

**Dependencies**: None (independent)

**Related**: Task 6, Task 11

**Commit Message**:
```
feat(eventdash): extend KV schema for paid events + ticket types

- Add isPaid flag, stripePriceId, ticketTypes array to EventRecord
- Add TicketType interface (early bird, VIP, general admin)
- Update RegistrationRecord with payment intent, charge ID, ticket type
- Add capacity tracking per ticket type + validation
- Add helpers: createTicketType, getAvailableTickets, decrementCapacity

Enables per-event pricing and Stripe payment tracking.
Implements Phase 2 decision: "Paid events with inline Stripe Elements checkout"
```

---

## WAVE 2: Payment Flows (Depends on Wave 1)

### TASK 4: MemberShip Stripe Checkout Session — Create & Redirect

**Owner**: Elon Musk  
**Model**: Sonnet (complex API integration)  
**Duration**: 6-8 hours  
**Token Budget**: 18K  

**Requirement Trace**:
- PARITY.md: "Stripe Checkout integration (real subscriptions)"
- Debate Round 1: "Stripe Checkout session for paid plans, redirect flow"
- Rick Rubin Essence: "Stripe is invisible — seamless payment experience"

**Description**:
Build Stripe Checkout session creation endpoint for paid membership plans. Members click "Subscribe" on pricing page → create checkout session → redirect to Stripe-hosted checkout → return to dashboard after payment. Webhook confirms subscription creation.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/stripe.ts` (new file)
- Debate Round 1: "POST /api/member/create-checkout → Stripe Checkout hosted session"
- Existing MemberRecord schema from Task 2

**Steps**:

1. **Create Stripe API wrapper module** (`stripe.ts`):
   ```typescript
   // Initialize Stripe with API key
   const stripe = new Stripe(ctx.env.STRIPE_SECRET_KEY);
   
   // Helper: createCustomer(email, name)
   // Helper: createCheckoutSession(customerId, priceId, successUrl, cancelUrl)
   // Helper: getSubscription(subscriptionId)
   // Helper: cancelSubscription(subscriptionId)
   // Helper: updateSubscription(subscriptionId, newPriceId, prorationBehavior)
   ```

2. **Create /membership/checkout/create route**:
   - Requires: email (from JWT), planId (from body)
   - Validate: planId exists, price > 0
   - Logic:
     a. Look up member in KV → get stripeCustomerId
     b. If no customer: create Stripe customer (email + name)
     c. Get plan config → look up Stripe priceId
     d. Create checkout session:
        ```
        stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          line_items: [{ price: stripePriceId, quantity: 1 }],
          mode: 'subscription',
          success_url: 'https://site.com/membership/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'https://site.com/membership/plans',
        })
        ```
     e. Save session ID to KV (for verification): `stripe:checkout:{sessionId}`
     f. Return: `{ sessionUrl, sessionId }`

3. **Create /membership/checkout/success route**:
   - Requires: sessionId (from query param)
   - Logic:
     a. Retrieve session from Stripe API
     b. Validate subscription created (session.subscription is present)
     c. Save stripeSubscriptionId to member KV
     d. Return: redirect to `/membership/dashboard?status=subscribed`

4. **Webhook integration** (handled in Task 5):
   - Stripe fires `checkout.session.completed` → webhook confirms

5. **Error handling**:
   - Invalid plan → 400 (Client error)
   - Stripe API error → 502 (Temporary, retry)
   - Show human-friendly error: "Payment failed. Please try again." (not Stripe error codes)

6. **Test scenarios**:
   - Create checkout for Free plan → should fail (price = 0)
   - Create checkout for Pro plan → redirects to Stripe
   - Complete payment → success redirect
   - Cancel checkout → cancel_url triggered

**Verification Checks**:
- [ ] POST /checkout/create creates Stripe session
- [ ] Returns sessionUrl for redirect
- [ ] Session success_url redirects back to site
- [ ] stripeCustomerId saved in KV
- [ ] Free plans rejected (price = 0)
- [ ] Stripe API errors handled gracefully

**Dependencies**: Task 1 (JWT auth), Task 2 (KV schema)

**Related**: Task 1, Task 2, Task 5

**Commit Message**:
```
feat(membership): Stripe Checkout session creation endpoint

- Add POST /membership/checkout/create endpoint (requires JWT)
- Create Stripe customer on first checkout
- Generate checkout session → return sessionUrl for redirect
- Add POST /membership/checkout/success for post-payment redirect
- Implement error handling with human-friendly copy
- Save stripe customer ID + session ID to KV

Enables seamless Stripe Checkout flow.
Implements Debate Round 1: "Stripe Checkout session for paid plans"
```

---

### TASK 5: MemberShip Webhook Handler — Subscription Lifecycle

**Owner**: Elon Musk  
**Model**: Sonnet (critical path)  
**Duration**: 8-10 hours  
**Token Budget**: 22K  

**Requirement Trace**:
- PARITY.md: "Stripe webhooks (subscription created, renewed, failed, cancelled)"
- Debate Round 1: "Webhook confirms and updates our KV record"
- Debate Round 2: "Use webhook idempotency keys, check 'already processed' before acting"
- Rick Rubin Essence: "Webhook silently confirms in background"

**Description**:
Create webhook endpoint to handle Stripe events: subscription created, updated (pro-rated plan change), past_due (payment failed), cancelled. Each event updates member KV record and triggers optional email notification.

**Context Files**:
- Stripe webhook docs: https://stripe.com/docs/webhooks
- Debate Round 2: "Webhook idempotency: use event ID, check already processed"
- Task 2: MemberRecord with stripeSubscriptionId + lastSyncAt
- Task 9: Email templates (welcome, expiring, payment failed)

**Steps**:

1. **Create webhook route**: `POST /membership/webhooks/stripe`
   - Public endpoint (no auth required, Stripe signs request)
   - Verify Stripe signature using secret + request body

2. **Implement idempotency check**:
   - Extract `event.id` from Stripe event
   - Check KV: `stripe:webhook:{eventId}` exists?
   - If yes, log + return 200 (already processed)
   - If no, process + save to KV with 24h TTL

3. **Handle event: `customer.subscription.created`**:
   - Extract: customerId, subscriptionId, status, currentPeriodEnd
   - Look up member by stripeCustomerId → get email
   - Update KV member record:
     - `stripeSubscriptionId = subscriptionId`
     - `status = 'active'` (if customer.subscription.status === 'active' or 'trialing')
     - `expiresAt = currentPeriodEnd`
     - `lastSyncAt = now`
   - Send email: "Welcome to [Plan]! Your subscription is active."

4. **Handle event: `customer.subscription.updated`**:
   - If items changed (plan upgrade/downgrade):
     - Update KV: `plan` and `expiresAt`
     - Send email: "Your subscription updated to [NewPlan]. New renewal: [DATE]"
   - If billing_cycle_anchor changed (pro-ration):
     - Update KV: `expiresAt`
     - Send email: "Billing adjusted. New renewal: [DATE]"

5. **Handle event: `invoice.payment_failed`**:
   - Extract: subscriptionId, customerId
   - Look up member
   - Update KV: `status = 'past_due'`
   - Send email: "Payment failed. [Update payment method link]"
   - Show on dashboard: alert "Payment failed — update card to restore access"

6. **Handle event: `customer.subscription.deleted`**:
   - Extract: subscriptionId, customerId
   - Look up member
   - Update KV: `status = 'cancelled'`, `stripeSubscriptionId = null`
   - Send email: "Your subscription has been cancelled. Re-subscribe anytime."

7. **Handle event: `checkout.session.completed`**:
   - Extract: subscriptionId, customerId
   - Confirm member KV has stripeSubscriptionId set (idempotency)
   - If first time, send welcome email

8. **Error handling**:
   - If member lookup fails → log error + return 200 (can't retry)
   - If KV write fails → log error + let Stripe retry
   - If email fails (optional) → log, don't fail webhook

9. **Rate limiting**:
   - Implement per-subscription throttle: max 1 email per event type per hour
   - Prevents email flood if webhook retries spike

10. **Test scenarios**:
    - Webhook fires twice (same event.id) → second is idempotency skipped
    - Payment fails → member status changes to past_due
    - Plan upgraded → renewal date changes
    - Subscription cancelled → status = cancelled
    - Webhook arrives before member record exists → handle gracefully

**Verification Checks**:
- [ ] Stripe signature verification works
- [ ] Idempotency key prevents duplicate processing
- [ ] subscription.created updates KV + sends email
- [ ] subscription.updated handles plan changes
- [ ] invoice.payment_failed sets status to past_due
- [ ] subscription.deleted clears subscription ID
- [ ] Webhook returns 200 immediately (doesn't wait for email)
- [ ] Webhook logs all events for debugging

**Dependencies**: Task 1 (JWT), Task 2 (KV), Task 4 (checkout session), Task 9 (email)

**Related**: Task 4, Task 7, Task 9

**Commit Message**:
```
feat(membership): Stripe webhook handler for subscription lifecycle

- Add POST /membership/webhooks/stripe endpoint (Stripe-signed)
- Implement webhook idempotency using event ID + KV cache (24h TTL)
- Handle customer.subscription.created → update member record + send welcome email
- Handle customer.subscription.updated → update plan/expiry on pro-ration
- Handle invoice.payment_failed → set status to past_due + alert email
- Handle customer.subscription.deleted → clear subscription + farewell email
- Handle checkout.session.completed → confirm subscription created
- Rate limit emails (max 1 per event type per hour)

Implements Phase 2 decisions: "Webhook as confirmation, KV as cache"
Follows Debate Round 2: "Webhook idempotency prevents duplicate processing"
```

---

### TASK 6: EventDash Stripe Checkout — Paid Event Registration

**Owner**: Steve Jobs  
**Model**: Sonnet (Stripe integration)  
**Duration**: 6-8 hours  
**Token Budget**: 18K  

**Requirement Trace**:
- PARITY.md: "Stripe Checkout for paid events"
- Debate Round 1: "Paid events: inline checkout with Stripe Elements"
- Debate Round 2: "Registration created immediately (optimistic), webhook confirms payment"

**Description**:
Build inline payment flow for paid EventDash events. Member fills registration form (name, email) → selects ticket type → enters card using Stripe Elements → payment confirmed → registration created. Webhook confirms payment and marks registration as paid.

**Context Files**:
- Task 3: EventRecord with isPaid, ticketTypes, RegistrationRecord with stripePaymentIntentId
- Debate Round 1: "POST /api/events/:id/create-checkout, POST /api/events/:id/register"
- Stripe Elements docs: https://stripe.com/docs/stripe-js/elements/payment-element

**Steps**:

1. **Create `/events/:id/create-checkout` endpoint**:
   - Requires: eventId, ticketTypeId, email, name
   - Validate: event exists, isPaid=true, ticketType available (capacity > sold)
   - Logic:
     a. Get event + ticket type → price
     b. Create Stripe payment intent:
        ```
        stripe.paymentIntents.create({
          amount: price,
          currency: 'usd',
          receipt_email: email,
          metadata: { eventId, ticketTypeId, email, name }
        })
        ```
     c. Decrement ticket capacity: `ticketTypes[id].sold++`
     d. Create registration record (optimistic, status=pending):
        ```
        registration = {
          email, name, ticketTypeId,
          stripePaymentIntentId: pi.client_secret,
          status: 'pending',
          pricePaidInCents: price,
          createdAt: now
        }
        ```
     e. Save to KV: `registration:{eventId}:{email}`
     f. Return: `{ clientSecret, amount, status }`

2. **Frontend: Stripe Elements integration** (documented for site builder):
   - Load Stripe.js
   - Create Elements instance with payment element
   - On form submit:
     ```
     stripe.confirmPayment({
       elements,
       clientSecret,
       confirmParams: { return_url: 'https://site.com/events/{eventId}?registered=true' }
     })
     ```

3. **Handle payment confirmation**:
   - After `stripe.confirmPayment()` returns:
     - If successful: show "Registered! Check email for ticket details."
     - If error: show card-friendly message ("Card declined. Try another.")
   - Don't wait for webhook — show success immediately (optimistic)

4. **Create `/events/:id/check-payment` endpoint** (optional, for slow webhooks):
   - Query Stripe: get payment intent status
   - If succeeded but webhook hasn't fired yet, mark registration paid

5. **Webhook integration** (via Task 5 or separate):
   - Listen for `payment_intent.succeeded`
   - Update registration: `status = 'registered'`, `paidAt = now`
   - Send confirmation email (via Task 8)

6. **Error handling**:
   - Capacity sold out → 409 (Conflict)
   - Invalid event → 404
   - Payment intent creation error → 502
   - Show human copy: "Event is sold out" or "Payment processing error. Try again."

7. **Free events** (no change):
   - POST /events/:id/register still accepts {email, name} only
   - No payment intent, no Stripe fields

**Verification Checks**:
- [ ] POST /create-checkout creates payment intent
- [ ] Returns clientSecret for frontend
- [ ] Registration created immediately (optimistic)
- [ ] Ticket capacity decremented
- [ ] Payment intent metadata includes event + ticket info
- [ ] Free events bypass checkout
- [ ] Capacity sold out returns 409

**Dependencies**: Task 1 (auth), Task 3 (KV schema)

**Related**: Task 3, Task 8

**Commit Message**:
```
feat(eventdash): Stripe payment intent for paid events

- Add POST /events/:id/create-checkout endpoint
- Create Stripe payment intent with ticket price
- Create registration immediately (optimistic, status=pending)
- Decrement ticket capacity on checkout
- Return clientSecret for frontend Stripe Elements
- Handle free events unchanged (no payment flow)

Implements Debate Round 1: "Paid events: inline checkout"
Implements Debate Round 2: "Registration immediate, webhook confirms"
```

---

## WAVE 3: Dashboards & Automation (Depends on Wave 2)

### TASK 7: MemberShip Member Dashboard — Self-Serve Portal

**Owner**: Steve Jobs  
**Model**: Sonnet (UX + API integration)  
**Duration**: 10-12 hours  
**Token Budget**: 28K  

**Requirement Trace**:
- PARITY.md: "Member dashboard (self-serve portal: view plan, update billing, cancel)"
- Debate Round 1 Q1: "Dashboard shows active plan, billing history, payment method, upgrade/downgrade, cancel button"
- Debate Round 2: "Real-time subscription fetch (source of truth), skeleton loaders, async loading for invoices"
- Rick Rubin Essence: "Trust through simplicity — show Stripe's actual data"

**Description**:
Create premium member dashboard. Members log in with JWT → view active subscription + renewal date → see billing history → update payment method (SetupIntent modal) → upgrade/downgrade plan → cancel (with confirmation). All data from Stripe API (not cached). UX feels minimal, trustworthy, on-brand.

**Context Files**:
- Debate Round 1: "Plan summary, billing history, payment method, upgrade/downgrade, cancel"
- Debate Round 2: "SWR on API responses, skeleton loaders during fetch, async loading for invoices"
- Task 1: JWT auth + /member/me endpoint
- Task 4-5: Stripe subscription management
- Rick Rubin: "Skeleton loaders + progressive disclosure better than cache"

**Steps**:

1. **Create GET /member/me endpoint** (already in Task 1):
   - Returns: `{ email, plan, subscription_id, status, renewal_date, ... }`

2. **Create GET /member/subscription endpoint**:
   - Requires JWT
   - Fetches from Stripe API (not cached): `stripe.subscriptions.retrieve(subscriptionId)`
   - Returns:
     ```
     {
       status: 'active' | 'past_due' | 'cancelled' | 'trialing',
       currentPrice: number,
       currentPeriodStart: ISO date,
       currentPeriodEnd: ISO date,
       billingCycle: 'monthly' | 'yearly',
       items: [ { name: 'Pro', price: 1999, ... } ]
     }
     ```

3. **Create GET /member/invoices endpoint**:
   - Requires JWT
   - Fetch last 6 invoices from Stripe: `stripe.invoices.list({ customer, limit: 6 })`
   - Return: `[ { date, amount, status, pdfUrl, ... } ]`
   - Load asynchronously (not critical path)

4. **Create GET /member/payment-methods endpoint**:
   - Requires JWT
   - Fetch payment methods from Stripe
   - Return: `[ { id, brand, last4, expMonth, expYear } ]`
   - Load asynchronously

5. **Create POST /member/setup-intent endpoint** (for payment method update):
   - Requires JWT
   - Create Stripe SetupIntent: `stripe.setupIntents.create({ customer, ... })`
   - Return: `{ clientSecret }`
   - Frontend embeds SetupIntent modal on dashboard
   - After success: webhook confirms, dashboard fetches fresh payment methods

6. **Create POST /member/subscription/upgrade endpoint**:
   - Requires JWT + { newPlanId }
   - Validate: new plan exists, higher price than current
   - Call Stripe: `stripe.subscriptions.update(subscriptionId, { items: [{price_id: newPriceId}], proration_behavior: 'create_prorations' })`
   - Return: new renewal date + pro-ration info
   - Show modal: "Upgrade to Pro — $19/month. You'll be charged $X today for pro-ration."

7. **Create POST /member/subscription/downgrade endpoint**:
   - Requires JWT + { newPlanId, effectiveDate: 'immediate' | 'at_renewal' }
   - If effectiveDate='immediate':
     - Call Stripe: `stripe.subscriptions.update(subscriptionId, ...)`
     - Refund issued automatically
   - If effectiveDate='at_renewal':
     - Create subscription schedule: `stripe.subscriptionSchedules.create(...)`
     - No immediate refund, member keeps access until renewal
   - Show confirmation: "Downgrade scheduled for [DATE]. You keep [current plan] until then."

8. **Create DELETE /member/subscription endpoint**:
   - Requires JWT
   - Cancel subscription: `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`
   - Update KV: `status = 'cancelling'`
   - Webhook confirms: `customer.subscription.deleted`
   - Return: "Your subscription will end on [DATE]."

9. **Dashboard page layout** (Portable Text block or Route):
   - Header: "Your Membership"
   - Section 1: Plan summary (skeleton loader while fetching)
     - Current plan name, price, billing cycle
     - Status badge: Active / Paused / Expiring Soon
     - Renewal date: "Renews on [DATE]"
     - If past_due: "Payment failed. [Update card]"
   - Section 2: Upgrade/Downgrade buttons
     - Disabled if only plan available
     - Show comparison: "Upgrade to Pro (+$X/month)"
   - Section 3: Billing history (async load)
     - Table: Date | Amount | Status | PDF link
     - "Load more" button
   - Section 4: Payment method (async load)
     - "Card ending in XXXX"
     - "Update payment method" button → SetupIntent modal
   - Section 5: Cancel
     - "Cancel subscription" button (low-emphasis)
     - On click: confirmation modal

10. **UX details**:
    - All data loads with skeleton loaders (never show cached stale data)
    - If subscription data fails to load: show error with retry button
    - All CTA buttons have loading state during API call
    - Success/error toasts after actions
    - Mobile-responsive (single column, stack sections)

11. **Test scenarios**:
    - Load dashboard → subscription data fetches, skeleton shows while loading
    - Upgrade plan → modal confirms price, API updates, dashboard refreshes
    - Cancel subscription → confirmation modal, subscription marked for cancellation
    - Payment failed → alert banner shown, update card link prominent
    - Invoices load asynchronously → table appears after fetch

**Verification Checks**:
- [ ] GET /member/subscription fetches from Stripe (not cached)
- [ ] Skeleton loaders show during fetch (no stale cached data)
- [ ] Invoices + payment methods load async (not blocking)
- [ ] Upgrade shows pro-ration confirmation + new price
- [ ] Downgrade shows both options (immediate + at renewal)
- [ ] Cancel requires confirmation, shows end date
- [ ] All endpoints require JWT auth
- [ ] Mobile-responsive layout
- [ ] Error states show retry button

**Dependencies**: Task 1 (JWT), Task 4 (checkout), Task 5 (webhooks)

**Related**: Task 1, Task 4, Task 5, Task 9

**Commit Message**:
```
feat(membership): member dashboard (self-serve portal)

- Add GET /member/subscription (real-time from Stripe)
- Add GET /member/invoices (async, last 6 invoices)
- Add GET /member/payment-methods (async)
- Add POST /member/setup-intent (payment method update)
- Add POST /member/subscription/upgrade (pro-ration calculated)
- Add POST /member/subscription/downgrade (immediate or at renewal)
- Add DELETE /member/subscription (cancel at period end)
- Implement skeleton loaders + progressive disclosure (no cached state)
- Dashboard UI: plan summary, upgrade/downgrade buttons, billing history, payment method, cancel

Follows Rick Rubin Essence: "Trust through simplicity, Stripe is source of truth"
Implements Debate Round 2: "Real-time fetch, skeleton loaders, async invoices"
```

---

### TASK 8: EventDash Attendee Email Confirmation — Resend Integration

**Owner**: Maya Angelou  
**Model**: Haiku (email copy + integration)  
**Duration**: 4-5 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- PARITY.md: "Attendee communication (bulk email to registrants)"
- Debate Round 1: "Ticket confirmation email: You're in! Here's your ticket."
- Debate Round 2: "Webhook confirms payment, then email sent"
- Rick Rubin Essence: "Warm, clear, actionable copy"

**Description**:
Send Resend email to event attendees after registration. If paid event, send after webhook confirms payment. If free event, send immediately after registration. Include event details, ticket info, calendar link (iCal).

**Context Files**:
- Task 3: RegistrationRecord
- Task 6: Payment intent confirmed
- Debate Round 1: "Ticket confirmation — personal and valuable, not corporate"
- Resend docs: https://resend.com/docs

**Steps**:

1. **Create email helper module** (`email.ts`):
   - Initialize Resend: `const resend = new Resend(ctx.env.RESEND_API_KEY)`
   - Template IDs (create in Resend dashboard):
     - `event-registration-free` → {attendeeName, eventTitle, eventDate, eventTime, location}
     - `event-registration-paid` → {attendeeName, eventTitle, ticketType, price, eventDate, eventTime, location, icalLink}
     - `event-reminder-1day` → same fields
     - `event-refund-issued` → {attendeeName, amount, refundDate}

2. **Send email on free registration**:
   - Route: POST /events/:id/register (for free events)
   - After registration created:
     ```
     await resend.emails.send({
       from: 'events@site.com',
       to: email,
       template: 'event-registration-free',
       props: { attendeeName: name, eventTitle, eventDate, ... }
     })
     ```
   - If Resend fails, log error but don't fail registration (email optional)

3. **Send email on paid registration confirmation** (via webhook):
   - Event: `payment_intent.succeeded` (from Task 6 webhook)
   - Look up registration record + event details
   - Send:
     ```
     await resend.emails.send({
       to: email,
       template: 'event-registration-paid',
       props: { attendeeName, ticketType, price, ... }
     })
     ```

4. **Email copy template** (warm, minimal):
   ```
   Subject: You're registered for [Event]!
   
   Hi [Name],

   You're all set for [Event] on [Date] at [Time].

   📍 [Location]
   🎟️ [Ticket Type] ticket
   💰 $[Price]

   Add to calendar: [iCal link]

   Questions? Reply to this email.

   See you there!
   ```

5. **Generate iCal link**:
   - Create simple .ics file or use Google Calendar link:
     ```
     https://calendar.google.com/calendar/u/0/r/eventedit?text=[Event]&dates=[Date]T[Time]/[EndTime]&location=[Location]
     ```

6. **Error handling**:
   - If Resend API fails → log, don't crash registration
   - If email address bounces → Resend marks as bounce, we receive webhook
   - On bounce: mark registration as "contact failed" (optional)

7. **Optional: Event reminder email** (1 day before):
   - Trigger: scheduled job at event start - 1 day, 9am
   - Send to all registered attendees
   - Copy: "Your event is tomorrow!"

8. **Test**:
   - Register for free event → email sent immediately
   - Register for paid event → email sent after webhook
   - Check email has correct fields + iCal link
   - Test email address validation (bounce handling)

**Verification Checks**:
- [ ] Resend API initialized
- [ ] Email templates created in Resend
- [ ] Free event registration sends email immediately
- [ ] Paid event registration waits for webhook
- [ ] Email includes event details + iCal link
- [ ] Email copy is warm + minimal
- [ ] Resend failure doesn't crash registration
- [ ] Bounce handling (optional but nice)

**Dependencies**: Task 3 (KV), Task 6 (payment), Task 5 (webhook)

**Related**: Task 3, Task 6, Task 9

**Commit Message**:
```
feat(eventdash): email confirmation for event registration

- Add Resend email service integration
- Create email templates: event-registration-free, event-registration-paid
- Send confirmation immediately for free events
- Send confirmation after webhook confirms payment (paid events)
- Include event details, ticket info, calendar link (iCal)
- Implement graceful failure (email optional, doesn't block registration)

Follows Debate Round 1: "Personal and valuable, not corporate"
Implements warm, actionable copy (Debate Round 1 Q4)
```

---

### TASK 9: MemberShip Email Automation — Templates & Webhook Triggers

**Owner**: Maya Angelou  
**Model**: Haiku (email design + integration)  
**Duration**: 6-8 hours  
**Token Budget**: 16K  

**Requirement Trace**:
- PARITY.md: "Email automation (welcome, expiring soon, expired, payment receipt)"
- Debate Round 1: "MemberShip emails: welcome, invoice, renewal reminder, payment failed, expiring, cancellation"
- Debate Round 2: "Email on cancellation: warm farewell, re-subscribe link, no guilt-tripping"
- Rick Rubin Essence: "One source of truth — webhook first, then email"

**Description**:
Create Resend email templates for membership lifecycle events. Trigger emails from webhook events (subscription created, updated, payment failed, cancelled). Copy is warm, clear, actionable — no corporate jargon.

**Context Files**:
- Task 5: Webhook handler
- Debate Round 1: Email templates + triggers
- Debate Round 2: "Email on cancellation: humble tone"
- Rick Rubin: "Webhook first, then email (not before)"

**Steps**:

1. **Define email templates in Resend dashboard**:
   - Template variables: {memberName, planName, price, renewalDate, portalLink, cancelLink, ...}

2. **Template 1: Welcome** (on subscription.created)
   ```
   Subject: Welcome to [Site]! Your [Plan] is active.
   
   Hi [Name],

   Welcome! You're now a [Plan] member.

   What you get:
   • [Feature 1]
   • [Feature 2]
   • [Feature 3]

   Your next charge: $[Price] on [RenewalDate]

   [Portal link to manage subscription]

   Questions? Reply to this email.

   Looking forward to having you!
   ```

3. **Template 2: Invoice** (on invoice.payment_succeeded)
   ```
   Subject: Your [Site] invoice — [Plan] subscription
   
   Hi [Name],

   Your [Plan] membership has been charged.

   Amount: $[Price]
   Billing period: [StartDate] to [EndDate]
   Next charge: [RenewalDate]

   [Download PDF invoice]
   [Manage subscription]

   Thanks for being a member!
   ```

4. **Template 3: Renewal reminder** (7 days before renewal, scheduled):
   ```
   Subject: Your subscription renews in 7 days
   
   Hi [Name],

   Your [Plan] subscription renews on [RenewalDate].
   Next charge: $[Price]

   Update payment method: [Portal link]

   Questions? Reply here.

   Thanks!
   ```

5. **Template 4: Payment failed** (on invoice.payment_failed)
   ```
   Subject: We couldn't charge your card
   
   Hi [Name],

   We tried to charge your card for your [Plan] membership, but it was declined.

   Update your payment method: [Portal link]

   Do this by [DeadlineDate] to keep your access.

   Need help? Reply to this email.
   ```

6. **Template 5: Expiring soon** (on subscription cancelled, 3 days before):
   ```
   Subject: Your access expires in 3 days
   
   Hi [Name],

   Your [Plan] membership expires on [ExpiryDate].

   You'll lose access to:
   • [Feature 1]
   • [Feature 2]

   Re-subscribe anytime: [Portal link]

   See you soon!
   ```

7. **Template 6: Cancellation** (on subscription.deleted)
   ```
   Subject: Your subscription has been cancelled
   
   Hi [Name],

   Your [Plan] membership has been cancelled.

   You'll lose access to [Features] on [ExpiryDate].

   Anytime you want to re-subscribe, we're here:
   [Portal link]

   We'd love to have you back.

   Take care!
   ```

8. **Webhook triggers** (in Task 5 webhook handler):
   - `customer.subscription.created` → send Welcome
   - `invoice.payment_succeeded` → send Invoice
   - `invoice.payment_failed` → send Payment failed
   - `customer.subscription.deleted` → send Cancellation

9. **Scheduled triggers** (cron job):
   - 7 days before renewal: Renewal reminder
   - 3 days before expiry: Expiring soon
   - (Implemented in Task 5 webhook flow)

10. **Rate limiting** (prevent email spam):
    - Max 1 email per event type per member per day
    - Track in KV: `email:sent:{email}:{event_type}:last_sent_at`

11. **Graceful degradation**:
    - If Resend API key not configured → log warning, skip emails (don't fail webhook)
    - If template not found → log error, skip email

12. **Test**:
    - Webhook fires → email sent to member
    - Email has correct variables (name, plan, price, dates)
    - Rate limit prevents duplicate emails
    - Invalid email → Resend returns error (logged, not fatal)

**Verification Checks**:
- [ ] 6 templates created in Resend
- [ ] Webhook triggers email on subscription created/updated/deleted
- [ ] Email variables interpolated correctly
- [ ] Rate limiting prevents spam (max 1/day per type)
- [ ] Graceful failure (email optional)
- [ ] Copy is warm + actionable (no guilt-tripping)
- [ ] iCal/calendar events included where relevant
- [ ] Scheduled jobs fire for renewal reminders + expiry emails

**Dependencies**: Task 5 (webhook), Task 1 (member data)

**Related**: Task 5, Task 7, Task 8

**Commit Message**:
```
feat(membership): email automation + Resend templates

- Create 6 Resend email templates: welcome, invoice, reminder, payment-failed, expiring, cancellation
- Trigger emails from webhook events (subscription created/updated/deleted)
- Add scheduled jobs: renewal reminder (7d), expiring soon (3d)
- Implement rate limiting: max 1 email per event type per day
- Graceful degradation: if Resend not configured, skip emails
- Copy is warm, clear, actionable (no corporate jargon)

Follows Rick Rubin: "Webhook first, then email"
Follows Debate Round 2: "Humble cancellation copy, re-subscribe link"
Implements full Phase 2 decision: "Email automation via webhooks"
```

---

## WAVE 4: Advanced Features (Depends on Wave 3)

### TASK 10: MemberShip Coupon/Discount Codes — Percentage & Fixed Amount

**Owner**: Sara Blakely  
**Model**: Haiku (pricing strategy)  
**Duration**: 4-5 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- PARITY.md: "Coupon/discount codes (percentage, fixed amount, expiring)"
- Rick Rubin Essence: "Trust through simplicity" (coupons shouldn't feel like tricks)

**Description**:
Build coupon system for membership plans. Admin creates coupons with discount (percentage or fixed amount), optional plan restrictions, and expiry date. Members can apply coupon during checkout, receives discount on first payment and/or all future payments.

**Context Files**:
- Task 4: Checkout session creation
- Task 2: MemberRecord schema
- Sara Blakely (growth strategist): pricing + incentive design

**Steps**:

1. **Define CouponRecord KV schema**:
   ```typescript
   interface CouponRecord {
     code: string;                      // Unique, case-insensitive
     discountType: 'percent' | 'fixed';
     discountAmount: number;            // % or cents
     maxUses?: number;                  // Total uses allowed
     usedCount: number;                 // Current usage
     applicablePlans?: string[];        // Restrict to specific plans
     validFrom: string;                 // ISO date
     validUntil?: string;               // Optional expiry
     createdAt: string;
     appliesTo: 'first' | 'all';        // First payment only, or all
     description?: string;              // Admin notes
   }
   ```

2. **Create admin API routes**:
   - `POST /membership/coupons/create` (admin only)
     - Input: code, discountType, discountAmount, validUntil, applicablePlans
     - Validate: code unique, discountAmount > 0
     - Save to KV: `coupon:{code}`
   - `POST /membership/coupons/delete` (admin only)
   - `GET /membership/coupons` (admin only) → list all with usage stats

3. **Create public validation endpoint**:
   - `POST /membership/coupons/validate` (public)
   - Input: code, planId
   - Output: `{ valid: true, discountAmount: X, message: "Save $X!" }` or `{ valid: false, reason: "Expired" }`
   - Check: code exists, not expired, uses remaining, plan matches (if restricted)

4. **Integrate with checkout**:
   - During checkout: member enters coupon code (optional field)
   - Call `/coupons/validate` → get discountAmount
   - Adjust Stripe checkout line_items:
     ```
     const discount = { type: 'fixed_amount', fixed_amount: { amount: discountAmount } }
     stripe.checkout.sessions.create({ ..., discounts: [discount] })
     ```
   - Or use Stripe coupon system (native support)

5. **Track coupon usage**:
   - After successful payment: increment `usedCount`
   - Store in MemberRecord: `appliedCoupon: code` (for audit)

6. **Admin dashboard page**:
   - Table: Code | Discount | Valid Until | Used / Max | Status
   - Create button → modal with form
   - Delete button → confirm modal

7. **UX on checkout page**:
   - Optional "Have a coupon?" text field
   - Real-time validation as user types (debounced)
   - Show: "Save $X with this code!" if valid
   - Show: "Coupon expired" if invalid

8. **Test scenarios**:
   - Create % coupon (e.g., 10% off)
   - Create fixed coupon (e.g., $5 off)
   - Coupon with plan restrictions
   - Expired coupon → validation fails
   - Max uses reached → validation fails
   - Apply coupon → checkout shows discounted price

**Verification Checks**:
- [ ] Coupon creation stores in KV
- [ ] Validation checks expiry + uses + plan match
- [ ] Stripe checkout applies discount
- [ ] Admin page lists coupons + usage
- [ ] Expired/maxed coupons rejected
- [ ] UX shows discount amount to member
- [ ] appliedCoupon tracked in member record

**Dependencies**: Task 4 (checkout), Task 2 (KV)

**Related**: Task 4, Task 7

**Commit Message**:
```
feat(membership): coupon and discount codes

- Add CouponRecord KV schema (code, discount type/amount, expiry, plan restriction)
- Create POST /coupons/create endpoint (admin only)
- Create POST /coupons/validate endpoint (public, real-time validation)
- Integrate with checkout: apply discount to Stripe session
- Track coupon usage: increment usedCount per application
- Admin page: create/manage coupons, view usage stats
- Checkout UX: optional coupon field, real-time validation feedback

Enables growth initiatives (promotions, retention).
Follows Rick Rubin: "Simplicity — coupons shouldn't feel like tricks"
```

---

### TASK 11: EventDash Ticket Types — Early Bird, VIP, General Admission

**Owner**: Jony Ive  
**Model**: Haiku (product design)  
**Duration**: 5-6 hours  
**Token Budget**: 14K  

**Requirement Trace**:
- PARITY.md: "Ticket types (early bird, VIP, general admission, group)"
- Task 3: TicketType schema already defined
- Debate Round 1: "Ticket types for paid events"

**Description**:
Build ticket type management for events. Admin creates multiple ticket variants (early bird $10, general $15, VIP $30) with separate capacity per type. Attendees select ticket type during registration. Early bird tickets expire on cutoff date.

**Context Files**:
- Task 3: EventRecord.ticketTypes[], TicketType interface
- Task 6: Payment intent creation

**Steps**:

1. **Event creation/edit flow**:
   - Admin creates event with `isPaid: true`
   - Show ticket types section: "Create ticket types for this event"
   - Form for each ticket:
     - Name: "Early Bird", "General", "VIP" (pre-filled options)
     - Price: $X.XX (converted to cents for Stripe)
     - Capacity: N seats
     - Available until: [date] (for early bird)
     - Description: "Available only until..." (auto-filled for early bird)

2. **Create admin API routes**:
   - `POST /events/:id/ticket-types/create` (admin)
     - Input: eventId, name, price, capacity, availableUntil
     - Create stripePriceId via Stripe API
     - Add to EventRecord.ticketTypes array
   - `POST /events/:id/ticket-types/:typeId/delete` (admin)
   - `PATCH /events/:id/ticket-types/:typeId/update` (admin)

3. **Frontend: registration form for paid events**:
   - Step 1: Event details + ticket type selector
     ```
     [ ] Early Bird - $10 (45/50 available, until [DATE])
     [o] General - $15 (100/100 available)
     [ ] VIP - $30 (10/10 available)
     ```
   - Show availability: "only X seats left"
   - Show availability window: "Early Bird sale ends [DATE]"
   - Select → proceed to payment

4. **Pricing display on event details page**:
   - Show all ticket types + prices
   - Highlight "Early Bird" as limited-time offer
   - Show capacity: "100/150 seats sold"

5. **Capacity management**:
   - When attendee selects ticket → check capacity
   - If sold out → disable radio button
   - Decrement ticketTypes[id].sold on registration
   - Validate: sum of all sold ≤ event capacity

6. **Early bird logic**:
   - If availableUntil < now → filter out from available tickets
   - getAvailableTickets() returns only non-expired types
   - If all tickets sold/expired → show "Sold out" on event page

7. **Admin dashboard for events**:
   - Add "Ticket types" section showing:
     - Type name | Price | Capacity (sold/total) | Status (available/expired)
   - "Edit" button → modal to update capacity/price
   - "Duplicate" button → quick copy of ticket type

8. **Reporting** (nice-to-have for Task 12):
   - Track revenue per ticket type
   - Show: "Early Bird: $500 revenue" vs "VIP: $300 revenue"

9. **Test scenarios**:
   - Create event with 3 ticket types
   - Early bird expires → no longer available
   - Register with early bird → payment at early bird price
   - Early bird capacity full → option disabled in form
   - Ticket type updated → price updates for future registrations

**Verification Checks**:
- [ ] Admin creates ticket types with prices + capacity
- [ ] Stripe price IDs generated for each type
- [ ] Registration form shows available ticket types
- [ ] Early bird expires on cutoff date
- [ ] Sold out ticket types disabled
- [ ] Capacity prevents overselling
- [ ] Admin dashboard shows ticket type stats
- [ ] Revenue tracked per ticket type (reporting)

**Dependencies**: Task 3 (KV), Task 6 (checkout)

**Related**: Task 3, Task 6, Task 12

**Commit Message**:
```
feat(eventdash): ticket types (early bird, VIP, general admission)

- Add ticket type management to event creation
- Support multiple ticket variants with separate pricing + capacity
- Create Stripe price IDs per ticket type
- Display availability with "X seats left" + expiry countdown
- Auto-hide expired ticket types (e.g., early bird after cutoff)
- Registration form: select ticket type → see price + availability
- Admin dashboard: ticket type stats, edit capacity/price
- Capacity validation: prevent overselling across all types

Enables revenue optimization (pricing flexibility).
Implements PARITY requirement: "Ticket types (early bird, VIP, general)"
```

---

### TASK 12: Plugin Documentation & README Updates

**Owner**: Maya Angelou  
**Model**: Haiku (documentation + style)  
**Duration**: 4-5 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- PARITY.md: "Both plugins — comprehensive README updates"
- Pipeline format: All projects ship with docs

**Description**:
Update README.md files for both MemberShip and EventDash plugins. Document Phase 2 features: Stripe integration, member dashboard, email automation, webhooks, admin workflows. Include installation, environment setup, usage examples, troubleshooting.

**Context Files**:
- Task 1-11: All features implemented
- Current READMEs (if exist): `/home/agent/shipyard-ai/plugins/{membership,eventdash}/README.md`
- Debate decisions: full feature set

**Steps**:

1. **MemberShip README sections**:
   - Overview: "Membership plugin with Stripe subscriptions + member dashboard"
   - Installation: npm install, enable plugin
   - Environment setup:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     JWT_SECRET=random_string_here
     RESEND_API_KEY=re_...
     ```
   - Configuration:
     - Define plans (free, pro, premium)
     - Set JWT expiry times
     - Configure email templates
   - Features:
     - ✓ Membership plans (free, monthly, yearly)
     - ✓ Stripe Checkout integration
     - ✓ Member dashboard (view plan, update payment, cancel)
     - ✓ Automatic email notifications
     - ✓ Coupon codes
     - ✓ Content gating (Portable Text block)
   - API routes:
     - `POST /membership/register` → create new member
     - `POST /membership/auth/register` → register + JWT
     - `POST /membership/checkout/create` → Stripe session
     - `GET /member/me` → current member + subscription
     - `POST /member/subscription/upgrade` → plan change
     - `POST /member/subscription/downgrade` → plan downgrade
     - etc. (full list)
   - Webhook setup:
     - Stripe dashboard: add endpoint
     - Endpoint URL: `https://your-site.com/membership/webhooks/stripe`
     - Events to subscribe: subscription created/updated/deleted, invoice payment_failed
   - Email templates: which Resend templates to create
   - Content gating: how to use Portable Text block
   - Troubleshooting:
     - "Payment fails during checkout" → check Stripe test keys
     - "Webhook not triggering" → check Stripe dashboard subscription
     - "Member not seeing updated plan" → check JWT refresh
   - Examples:
     - Register free plan → list members → approve pending
     - Create paid membership → configure Stripe Checkout
     - Member upgrade → dashboard flow

2. **EventDash README sections**:
   - Overview: "Event management plugin with Stripe ticketing"
   - Installation
   - Environment setup: Stripe keys, Resend
   - Configuration:
     - Set event capacity defaults
     - Configure ticket types
   - Features:
     - ✓ Event CRUD (create, edit, delete)
     - ✓ Recurring events (templates)
     - ✓ Free + paid events
     - ✓ Ticket types (early bird, VIP, general)
     - ✓ Registration with capacity limits
     - ✓ Waitlist
     - ✓ Stripe payment for tickets
     - ✓ Attendee email confirmation
   - API routes: event CRUD, registration, payment
   - Webhook setup: payment_intent.succeeded triggers confirmation email
   - Email templates: registration (free + paid), reminder, refund
   - Event listing block: how to embed upcoming events
   - Troubleshooting:
     - "Event sold out but registrations still coming" → check capacity logic
     - "Attendee didn't receive confirmation email" → check Resend keys
     - "Payment shows in Stripe but registration not created" → check webhook
   - Examples:
     - Create free event → register attendee → send reminder
     - Create paid event with ticket types → set up Stripe prices → attendee purchases
     - Manage event capacity + waitlist

3. **Shared sections** (both plugins):
   - Security notes:
     - JWT stored in httpOnly cookies (safe)
     - Stripe API keys never exposed to client
     - Webhook signature verification
     - SQL injection prevention (N/A for KV, but mention input sanitization)
   - Performance:
     - Stripe API calls cached with SWR pattern (15m for member data)
     - Webhook responses return immediately (async confirmation)
   - Testing:
     - Use Stripe test mode keys
     - Test webhook delivery via Stripe dashboard
     - Recommended test flows (happy path + error cases)
   - Support:
     - Contact email
     - GitHub issues
     - Stripe troubleshooting links

4. **Code examples**:
   - MemberShip:
     ```typescript
     // Register + get subscription
     const response = await fetch('/membership/auth/register', {
       method: 'POST',
       body: JSON.stringify({ email: 'user@example.com', planId: 'pro' })
     });
     // Returns: { memberId, status, plan, token (in httpOnly cookie) }
     
     // Check access (for gating)
     const response = await fetch('/membership/status?email=user@example.com');
     // Returns: { active: true, plan: 'pro', expiresAt: '2026-05-05T...' }
     ```
   - EventDash:
     ```typescript
     // Register for free event
     const response = await fetch('/events/abc123/register', {
       method: 'POST',
       body: JSON.stringify({ name: 'John', email: 'john@example.com' })
     });
     // Returns: { registrationId, status: 'registered' }
     
     // Create paid event checkout
     const response = await fetch('/events/abc123/create-checkout', {
       method: 'POST',
       body: JSON.stringify({ 
         email: 'john@example.com', 
         name: 'John', 
         ticketTypeId: 'early-bird' 
       })
     });
     // Returns: { clientSecret, amount, status }
     ```

5. **Admin workflows**:
   - MemberShip:
     - Create plan → set price + Stripe price ID
     - View members → status, expiry, billing
     - Create coupon → set discount + expiry
     - Monitor webhooks → check logs for delivery
   - EventDash:
     - Create event → set capacity
     - Add ticket types → set pricing
     - View registrations → attendee list + payment status
     - Check-in: TBD (future feature, mark as note)

6. **Styling**:
   - Consistent with existing plugin docs (if available)
   - Code blocks with language syntax highlighting
   - Tables for API routes + parameters
   - Badges: [✓ Shipped] [⚠️ Beta] [📋 TODO]
   - Links to external: Stripe docs, Resend docs, Emdash docs

**Verification Checks**:
- [ ] Both READMEs include installation steps
- [ ] Environment variables documented
- [ ] All API routes listed with examples
- [ ] Webhook setup instructions clear
- [ ] Email template names + trigger events documented
- [ ] Troubleshooting section covers common issues
- [ ] Code examples work as written
- [ ] Security notes present
- [ ] Links to Stripe + Resend docs included

**Dependencies**: All Wave 1-3 tasks

**Related**: All tasks

**Commit Message**:
```
docs: comprehensive README updates for Phase 2 (Stripe integration)

MemberShip README:
- Add Stripe Checkout + subscription lifecycle
- Document member dashboard API routes
- Include email automation setup (Resend templates)
- Add troubleshooting: payment failures, webhook issues, JWT refresh
- Code examples: register, subscribe, check access, upgrade plan

EventDash README:
- Add Stripe payment for tickets
- Document ticket type management
- Include attendee email confirmation setup
- Add troubleshooting: sold out events, missing confirmations
- Code examples: register (free + paid), create checkout, manage tickets

Shared sections:
- Security notes (JWT, Stripe keys, webhook verification)
- Performance (SWR caching, async webhooks)
- Testing guide (Stripe test mode, webhook delivery)

Follows PARITY requirement: "Comprehensive README updates"
```

---

## Timeline & Sequencing

```
Week 1:

Day 1-2: WAVE 1 (Independent — parallel)
  • Task 1: JWT auth middleware (Elon, 4-6h)
  • Task 2: MemberShip KV schema (Elon, 2-3h)
  • Task 3: EventDash KV schema (Steve, 2-3h)

Day 3-4: WAVE 2 (Depends on Wave 1)
  • Task 4: MemberShip Checkout (Elon, 6-8h)
  • Task 5: MemberShip Webhook handler (Elon, 8-10h)
  • Task 6: EventDash Checkout (Steve, 6-8h)

Week 2:

Day 5-7: WAVE 3 (Depends on Wave 2)
  • Task 7: Member dashboard (Steve, 10-12h)
  • Task 8: EventDash email (Maya, 4-5h)
  • Task 9: MemberShip email automation (Maya, 6-8h)

Day 8-10: WAVE 4 (Depends on Wave 3)
  • Task 10: Coupon codes (Sara, 4-5h)
  • Task 11: Ticket types (Jony, 5-6h)
  • Task 12: README updates (Maya, 4-5h)

Day 11: QA + Review (Margaret)
  • Run all tests
  • Webhook verification
  • Email delivery checks
  • Dashboard UX review

Day 12: Board review (Jensen, Oprah, Buffett, Shonda)
  • Architecture review
  • Scaling considerations
  • Launch readiness

Day 13-14: Ship
  • Merge to main
  • Deploy to staging
  • Final QA
  • Deploy to production
```

---

## Token Budget Breakdown

| Wave | Tasks | Hours | Est. Tokens | Actual |
|------|-------|-------|-------------|--------|
| 1 | 1-3 | 10 | 31K | |
| 2 | 4-6 | 26 | 58K | |
| 3 | 7-9 | 24 | 56K | |
| 4 | 10-12 | 19 | 38K | |
| Review + Board | | 8 | 15K | |
| **Total** | **12** | **87** | **198K** | |
| **Reserve** | | | **102K** | |

**Budget: 300K tokens** (from 500K plugin base)  
**Allocated: 198K** (66%)  
**Reserve: 102K** (34% — for rework + unforeseen)

---

## Success Criteria

Phase 2 is **SHIPPED** when:

1. **Wave 1**: All schema + auth working
   - JWT tokens issued + validated
   - KV extended with Stripe fields

2. **Wave 2**: Payment flows complete
   - Stripe Checkout session created
   - Webhooks receive + process events
   - Subscriptions + payments tracked in KV

3. **Wave 3**: Dashboards + automation ready
   - Member dashboard shows real subscription data
   - Event attendees receive confirmation emails
   - Membership lifecycle emails triggered by webhooks

4. **Wave 4**: Advanced features polished
   - Coupons apply to checkout
   - Ticket types manage capacity
   - READMEs comprehensive + accurate

5. **QA Verified**:
   - All tests pass (no new bugs)
   - Webhooks verified with Stripe
   - Email templates tested (no spam)
   - Dashboard mobile-responsive
   - No PII exposed in logs

6. **Board Review Approved**:
   - Architecture scalable to 10K members
   - Security hardened (no Stripe key exposure)
   - Post-launch support plan clear

---

## Rick Rubin Gut Check: Final Verification

Before shipping, verify these 3 things matter:

1. **Trust through simplicity** ✓
   - Member sees actual Stripe data (no cache guessing)
   - Every email confirms what Stripe said
   - No surprises at renewal

2. **Seamless payment experience** ✓
   - No redirect to Stripe (Checkout embedded)
   - Events use Stripe Elements (stay on-site)
   - Webhook confirms silently in background

3. **One source of truth** ✓
   - Stripe owns subscription (KV mirrors it)
   - Webhook keeps KV in sync
   - Dashboard always fetches fresh from Stripe

**If all 3 are true → Ship. If not, rework.**
