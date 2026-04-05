# Plugin Suite Debate — Round 1

**Date**: 2026-04-05
**Participants**: Steve Jobs (Design), Elon Musk (Engineering), Phil Jackson (Moderator)

## Question 1: What's the MVP for each plugin?

**Elon**: The v0.1 drafts are stubs — they compile but don't actually work. A real membership plugin needs:
1. Stripe Checkout session creation (not just KV storage)
2. Webhook handler for subscription lifecycle (created, renewed, cancelled, failed)
3. Content gating middleware that actually blocks unauthorized access
4. Session management (how does the plugin know who's logged in?)

The session problem is the hard part. EmDash doesn't have built-in user auth for site visitors — it only has admin auth. We need to build a visitor auth system as part of the membership plugin.

**Steve**: For EventDash, the MVP is simpler:
1. Event listing page that pulls from KV storage
2. Registration form (name, email, ticket count)
3. Confirmation email via Resend
4. Admin page to create/edit events
5. Calendar view can wait for v1.1 — a list view ships first

The critical UX question: does registration require an account? I say no — email-only registration, no login required. Lower friction = more registrations.

**Decision**: Both plugins ship with email-only interaction (no visitor auth in v1.0). MemberShip uses Stripe Checkout links (redirect to Stripe, webhook confirms). EventDash uses simple email registration.

## Question 2: How do we handle Stripe?

**Elon**: Stripe integration needs:
- API key stored in plugin settings (admin configures)
- Stripe Checkout for payments (redirect flow, not embedded)
- Webhook endpoint to handle payment confirmation
- This means the plugin needs a publicly accessible webhook URL

The webhook is the hard part in the EmDash sandbox. The plugin's API routes are accessible but Stripe needs to verify the webhook signature. We need the Stripe webhook secret in the plugin settings.

**Steve**: Keep it simple. v1.0 uses Stripe Payment Links — the admin creates them in the Stripe dashboard and pastes the URL into the plan/event settings. No webhook needed. The plugin just tracks who registered. Payment verification is manual for now.

**Decision**: v1.0 uses Stripe Payment Links (admin-configured). v1.1 adds native Stripe Checkout + webhooks.

## Question 3: Testing?

**Elon**: Both plugins need to be tested on a live EmDash site before we call them done. MemberShip on Bella's Bistro (gate the menu page behind a "VIP" membership). EventDash on Sunrise Yoga (create a class schedule).

**Decision**: Test both plugins on live sites. Margaret reviews before shipping.

## Locked Decisions

1. Email-only interaction — no visitor auth in v1.0
2. Stripe Payment Links (admin-configured URLs) — no webhook in v1.0
3. KV storage for all data (members, events, registrations)
4. Block Kit for admin UI (no React)
5. Test on live sites before shipping
6. Margaret QA review required
