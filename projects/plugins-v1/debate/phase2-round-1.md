# Phase 2 Debate: Stripe Integration for MemberShip & EventDash — Round 1

**Date**: 2026-04-05  
**Participants**: Steve Jobs (Design), Elon Musk (Engineering), Phil Jackson (Moderator)  
**Context**: Building on Phase 1 (email registration + Payment Links). Phase 2 adds real Stripe subscriptions, webhooks, and member dashboards.

---

## Question 1: What should the member dashboard look like?

**Steve Jobs (Design/UX):**

The dashboard is where members see the value of their subscription. It needs to feel premium and trustworthy.

Key elements:
1. **Plan summary** — Show active plan name, price, billing cycle, renewal date. Make the status crystal clear (Active / Paused / Expiring Soon).
2. **Billing history** — Last 6 months of invoices (date, amount, status). Downloadable PDF links to Stripe.
3. **Payment method** — Show card ending in X's. Button to update it. Not the horror show of entering full card details—just Stripe's payment method selector modal.
4. **Upgrade/Downgrade** — Clear CTA buttons. Upgrade should be frictionless. Downgrade has guardrails ("confirm you want to lose XYZ features").
5. **Cancel button** — Low friction. But show: "You'll lose access on [DATE]. You can re-subscribe anytime." Not angry, not guilt-tripping—just honest.
6. **Content access** — Show which gated content blocks the member can access. Maybe a "Browse exclusive content" link to Pages they have access to.

The whole thing should load in <1s, mobile-first. No fancy animations—clarity and trust over flash.

**Elon Musk (Engineering):**

From a technical angle, this is where phase 2 gets real:

1. **Session persistence** — The member needs to stay logged in across sessions. In Phase 1 we used email cookies. For Phase 2, we need:
   - JWT token stored in secure httpOnly cookie (not localStorage)
   - Token refresh endpoint (before expiry)
   - /api/member/me endpoint to fetch member profile + subscription details from Stripe
   - Auth middleware on all dashboard routes

2. **Stripe data sync** — The dashboard queries Stripe directly for current subscription state (not cached). Why? Stripe is the source of truth. We shouldn't cache subscription status.
   - /api/member/subscription → fetch active subscription from Stripe API
   - If subscription is past_due, show "Payment Failed" alert
   - If subscription is active, show "Renews on [DATE]"
   - If on trial, show "Trial ends on [DATE]"

3. **Payment method updates** — Use Stripe's customer portal (SetupIntent flow) instead of building our own form.
   - /api/member/create-portal-session → POST to Stripe
   - Returns portal URL → redirect browser to it
   - Member updates payment method in Stripe's UI (fully PCI compliant, no data on our servers)
   - Returns to our dashboard

4. **Cancellation flow** — DELETE /api/member/subscription → calls Stripe API to cancel subscription. Webhook confirms and updates our KV record.

**Decision:**
- Dashboard: Premium, minimal, trust-focused. Stripe data is source of truth.
- Auth: JWT in httpOnly cookies, refresh endpoint, /me endpoint.
- Payment updates: Stripe customer portal, not custom form.
- Cancellation: API call → webhook confirmation → KV update.

---

## Question 2: How should the upgrade/downgrade flow work?

**Steve:**

Users need to feel in control. Here's the flow:

**Upgrade:**
1. Member sees "Upgrade to Pro" button on dashboard
2. Click → shows modal: "Upgrade to Pro — $19/month. You'll be charged the difference today." (pro-ration explanation)
3. Confirm → Stripe handles it → page updates to "Pro active"
4. Show: "You've been upgraded! Your new renewal date is [DATE]."

**Downgrade:**
1. Member sees "Downgrade to Basic" button
2. Click → modal with warnings: "You're downgrading from Pro to Basic. You'll lose: [LIST]. This takes effect on [DATE]. You'll be refunded $X for unused time."
3. Confirm → scheduled change (doesn't kill their access mid-month)
4. Show: "Downgrade scheduled for [DATE]. You keep Pro access until then."

UX principle: **Never surprise members. Always show what they're losing and when.**

**Elon:**

Upgrade and downgrade are different operations in Stripe. Let me explain:

**Upgrade (immediate, pro-rated):**
- Call `stripe.subscriptions.update(subscriptionId, { items: [{id, price_id: newPriceId}] })`
- Stripe calculates pro-ration immediately
- Customer is charged the difference (if any) today
- Renewal date stays the same
- API call succeeds → webhook confirms → show new price on dashboard

**Downgrade (can be immediate or scheduled):**
- Option A: Immediate downgrade
  - Same Stripe API call as upgrade
  - Pro-ration works backwards (refund issued)
  - Effective immediately
- Option B: Scheduled downgrade (downgrade at end of billing cycle)
  - Create a subscription schedule (Stripe scheduled update)
  - Plans.downgrade() → at_period_end: true
  - Stripe applies change on renewal date
  - No refund now, member keeps access, billing changes on [DATE]

**Decision:** Offer both options:
- "Downgrade immediately (refund issued)" → API call, instant
- "Downgrade at next renewal" → subscription schedule, no refund (better UX)

---

## Question 3: What's the checkout experience for paid events?

**Steve:**

Events are more casual than memberships. Checkout should be friction-minimal:

1. **Event detail page** — Shows: date, time, location, capacity, price (if paid)
2. **"Get ticket" button** — Click opens modal with attendee form (name, email). Below that: stripe payment element (card input)
3. **Inline checkout** — Don't redirect to Stripe. Member fills form + card → submit → creates Stripe payment intent → member sees loader → payment completes
4. **Confirmation** — "You're registered! Check your email for ticket details."
5. **Error handling** — "Payment failed. Your card was declined. Please try another card." (Not "Error 402 payment_required"—actual human copy.)

For free events: just name + email, no card shown.

The whole flow should live on the event page. No Stripe redirects.

**Elon:**

This is where stripe.js gets involved. Here's the architecture:

**For free events:**
- POST /api/events/:id/register with {name, email}
- Creates registration in KV
- Webhook from our API confirms
- Email sent (optional Resend)

**For paid events:**
- Step 1: Member submits form (name, email) → POST /api/events/:id/create-checkout
  - Backend creates Stripe payment intent: `stripe.paymentIntents.create({ amount, currency: 'usd', ... })`
  - Returns: client_secret, amount, status
- Step 2: Frontend renders Stripe Elements (card element) + attach to payment intent
- Step 3: Member enters card → click "Pay & Register"
  - Call stripe.confirmCardPayment(client_secret, { payment_method: {...} })
  - Stripe processes payment
  - If successful: webhook fires → our backend creates registration in KV
  - If failed: Stripe returns error → show message

**Why not Stripe Checkout (hosted)?**
- Stripe Checkout is a full page redirect (worse UX for events)
- Payment Elements let us keep attendee on our site throughout

**Why webhooks?**
- Ensures registration is created even if page closes after payment succeeds
- Stripe is source of truth for payment status
- Webhook: payment_intent.succeeded → create registration in KV

**Decision:**
- Free events: email-only registration
- Paid events: inline checkout with Stripe Elements
- Webhook confirms payment → creates registration

---

## Question 4: How should email notifications feel?

**Steve:**

Emails are part of the brand. They should feel personal and valuable, not corporate.

**MemberShip emails:**
1. **Welcome** — "Welcome to [Site], [Name]! Here's what you get with [Plan]:" (show feature list)
2. **Invoice sent** — "Your [Plan] is confirmed for $XX/month. Next charge: [DATE]. [Link to portal]"
3. **Renewal reminder** — "Your subscription renews in 7 days. Your next charge is $XX."
4. **Payment failed** — "We couldn't charge your card. [Update payment method link] Do this by [DATE] to keep your access."
5. **Expiring** — "Your subscription expires in 3 days. Renew to keep access to [content list]."
6. **Cancellation** — "We're sorry to see you go. [List features you'll lose]. Anytime you want to re-subscribe: [link]"

**EventDash emails:**
1. **Ticket confirmation** — "You're in! Here's your ticket for [Event]. [Date/time/location]. Questions? [Contact link]"
2. **Event reminder** — "Your event is in 1 day! See you at [Time] at [Location]."
3. **Refund issued** — "Your ticket has been cancelled. Full refund of $XX issued to your card on [DATE]."

No logo spam. No corporate jargon. Warm, clear, actionable.

**Elon:**

From engineering: we need templates + template variables.

**MemberShip emails:**
- Template IDs in Resend (or email provider)
- Variables: {memberName, planName, price, renewalDate, cancelLink, portalLink}
- Trigger: send on webhook event (subscription.updated, invoice.payment_succeeded, etc.)

**EventDash emails:**
- Template: {attendeeName, eventTitle, eventDate, eventTime, location, ticketLink}
- Trigger: on registration creation (POST /api/events/:id/register)

Code pattern:
```typescript
if (ctx.email) {
  await ctx.email.send({
    to: member.email,
    template: 'membership-welcome',
    data: {
      memberName: member.name,
      planName: plan.name,
      // ...
    }
  })
}
```

Email is **optional**. If Resend isn't configured, the plugin still works—just no emails.

**Decision:**
- Resend templates (warm, personal copy)
- Webhook triggers for MemberShip events
- Registration triggers for EventDash events
- Email gracefully optional if not configured

---

## Locked Decisions (Phase 2)

1. **Member Dashboard**: Stripe data as source of truth, JWT auth, Stripe customer portal for payment updates
2. **Upgrade**: Immediate pro-ration via Stripe API
3. **Downgrade**: Two options (immediate with refund, or at renewal with no refund)
4. **Paid Events**: Stripe Elements inline checkout (not Stripe Checkout redirect)
5. **Webhooks**: Critical for MemberShip subscription lifecycle and EventDash payment confirmation
6. **Email**: Optional Resend templates, triggered by webhooks/registration, warm + actionable copy
7. **Auth**: JWT in httpOnly cookies, refresh endpoint, /me profile endpoint
