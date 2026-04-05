# Phase 2 Debate: Stripe Integration — Round 2 (Directors Challenge Each Other)

**Date**: 2026-04-05  
**Format**: Structured challenges. Each director attacks the other's position with specific technical or UX concerns.

---

## Steve challenges Elon: "Your webhook architecture will break under load"

**Steve:**

Here's the problem with relying on webhooks to create registrations:

1. **Webhook latency** — Stripe webhooks have ~3-5 second latency in production. A member completes checkout and **sees nothing**. "Is it working?" they ask. Feels broken.

2. **Retry storms** — If our endpoint returns 500, Stripe retries for 3 days. If we're down (emergency maintenance, deploy), we hit spike in failed webhooks. Chaos.

3. **Event ordering** — Multiple webhooks can arrive out of order. What if `payment_intent.succeeded` arrives before `charge.succeeded`? Our code creates registration, then payment fails. Bad.

4. **Idempotency problem** — If the same webhook fires twice, we create two registrations for one person. There's no dedup.

**My push-back:** Create the registration **immediately** when the user clicks "Pay". Show a loader. Stripe confirms payment. If payment succeeds, mark it paid. If it fails, mark it failed. Don't rely on webhooks for the registration itself.

**Elon's counter:**

Fair points. Here's why immediate registration with webhook confirmation is better:

1. **Webhook as confirmation, not creation** — We create registration on POST /api/events/:id/register (immediately). Stripe returns client_secret. Frontend makes payment. On success:
   - **Optimistic**: Show "Ticket confirmed!" right away (member feels it worked)
   - **Confirmation**: Webhook fires 3-5s later, marks it officially paid in our DB
   - If webhook never fires (unlikely), admin can manually confirm in event detail page

2. **Idempotency** — Use webhook idempotency keys. Stripe won't re-send the same event twice with the same ID. We check: "Is this event already processed?" before acting.

3. **Event ordering** — Only act on `payment_intent.succeeded`. That's the single source of truth. Don't listen to intermediate events.

4. **Retry safety** — Endpoint returns 200 immediately. If we can't write to KV, we queue the job and retry. Stripe sees success, stops retrying.

**Revised decision:**
- Registration created immediately (optimistic)
- Webhook confirms + updates paid status
- Stripe customer portal handles any disputes
- Admin can manually confirm if webhook fails

---

## Elon challenges Steve: "Your dashboard design will require 3 API calls per load"

**Elon:**

Looking at your dashboard wireframe, here are the latency problems:

1. **Subscription details** — Call GET /api/member/subscription → calls Stripe API (150-300ms)
2. **Billing history** — Call GET /api/member/invoices → calls Stripe API (150-300ms)
3. **Payment methods** — Call GET /api/member/payment-methods → calls Stripe API (150-300ms)

Total: 450-900ms before render. On mobile (3G), we're looking at 2+ seconds. Members bounce.

2. **You want Stripe as source of truth, but that means every page load hits Stripe.** We can't cache because subscriptions change in real-time. What if a webhook updates the subscription while member is viewing the dashboard?

**My proposal:** Cache subscription data for 30-60 seconds. Use stale-while-revalidate pattern:
- Show cached data instantly
- Poll Stripe in background
- Update dashboard if subscription changed
- Member sees fresh data within 60s, but page loads in <500ms

**Steve's counter:**

I hear you on load time, but caching is the wrong solution. Here's why:

1. **Member cancels subscription** — They load dashboard, see "Active" for 30 seconds. Feels broken.
2. **Payment fails** — We're showing "Active" when Stripe says past_due. Member thinks they're fine.
3. **Upgrade completes** — We show old plan while new one loads. Confusing.

**Better approach:**
- Fetch subscription on initial load (30-60s for real-time sync)
- Show skeleton loaders while data loads (progressive disclosure)
- Use SWR library (stale-while-revalidate) on the API calls, not on cached state
- Show loading state, don't lie about subscription status

For invoices/payment methods:
- Load those asynchronously in background tabs (not blocking initial render)
- Show "Loading..." instead of old data

**Revised decision:**
- Real-time subscription fetch (source of truth)
- Invoices + payment methods load async (not critical path)
- Skeleton loaders + progressive disclosure (better UX than cached stale data)
- SWR pattern for repeat visits (cache API response, revalidate in background)

---

## Steve challenges Elon: "You're over-engineering the payment method update flow"

**Steve:**

You said: "Use Stripe customer portal for payment method updates." But that means:

1. Member clicks "Update payment method"
2. Redirect to Stripe portal
3. Stripe portal loads (another domain, another origin, context switch)
4. Member updates card
5. Stripe redirects back to us

**Problems:**
- Context switch breaks flow
- Stripe branding takes over (kills our brand consistency)
- Loading times
- Member gets lost (some customers never come back from external redirects)

**My push-back:** Use Stripe's embedded payment element on our dashboard. Member stays on our site. One click, one form, done.

```html
<form id="payment-form">
  <div id="card-element"></div> <!-- Stripe Elements -->
  <button>Update Payment Method</button>
</form>
```

Embed Stripe directly. Same trust + PCI compliance (card data never touches our servers).

**Elon's counter:**

You're right about UX. But here's why customer portal is better for this specific use case:

1. **Setup Intents vs Payment Intents** — Updating payment method for future charges is different from one-time payment. Stripe SetupIntent is the right tool.
2. **Retry logic** — Payment methods can be declined. Stripe portal handles retry flows, 3D Secure, etc. We don't have to build that.
3. **Compliance** — Stripe handles all the compliance logic. We just redirect.
4. **It's a one-way trip** — Member updates once per month. Not a critical flow. Small context switch is acceptable.

**Revised decision:**
- Use Stripe SetupIntent modal (embedded, not full portal redirect)
- Loads in our dashboard, doesn't change origin
- Member enters new card, Stripe confirms
- Back to dashboard, stays on brand
- Best of both worlds: embedded + safe + simple

---

## Elon challenges Steve: "Your 'cancellation guardrails' will confuse members"

**Elon:**

You said: "Show warnings when member cancels: 'You'll lose XYZ features. You can re-subscribe anytime.'"

Issues:

1. **Too much text** — Long warning modals get skipped. Member will click through without reading.
2. **Wrong placement** — Warning on dashboard is too late. By the time they reach it, they've already decided to leave.
3. **Doesn't address why they're cancelling** — If they're cancelling because payment failed, telling them "you'll lose access" doesn't help.

**Better approach:**
- Show subtle warning only if subscription is past_due (payment failed)
- "Payment failed. [Update card] or your access expires in 5 days."
- Let them cancel cleanly if they want to. Don't guilt them.
- On cancellation: "Your access ends [DATE]. Anytime you want back in, we'll remember you."

**Steve's counter:**

I see your point—guilt isn't good UX. But I disagree on *when* to show warnings.

Right now, we're in the "member doesn't understand subscriptions" phase. Many will accidentally cancel and then complain. A one-second pause (modal with 3 checkboxes: "I understand I'll lose X, Y, Z") reduces support tickets.

But you're right it shouldn't be a wall of text. Make it:
- Clear, short bullets (one line each)
- Checkbox to confirm
- "Still want to cancel? Click here." (de-emphasized)

**Revised decision:**
- On cancellation: show brief, checkboxed confirmation
- List features they'll lose (bullets, not paragraphs)
- Don't shame them ("we're sad to see you go")
- Make it reversible (re-subscribe anytime link in cancellation email)

---

## Locked Decisions (Round 2)

1. **Registrations**: Create immediately (optimistic), webhook confirms payment + marks paid
2. **Webhook idempotency**: Use webhook event IDs, check "already processed" before acting
3. **Dashboard loading**: Real-time subscription fetch (source of truth), async loading for invoices/methods
4. **Payment method updates**: Stripe SetupIntent modal (embedded, not full portal redirect)
5. **Cancellation flow**: Brief checkboxed confirmation (3 key features listed), reversible via email
6. **Caching strategy**: SWR on API responses (not on cached state), skeleton loaders during fetch
7. **Email on cancellation**: Warm farewell, re-subscribe link, no guilt-tripping
