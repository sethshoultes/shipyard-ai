# Stripe Webhook Integration Spec

## Endpoint

`POST /webhook`

## Event Filter

The Worker listens exclusively for:

- `checkout.session.completed`

## Behavior

On receiving `checkout.session.completed`:

1. Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
2. Extract `customer`, `subscription`, and `metadata.site_id` from the session object.
3. Upsert a row in `sous_subscriptions`:
   - `stripe_customer_id` = session.customer
   - `stripe_subscription_id` = session.subscription
   - `tier` = session.metadata.tier (base or pro)
   - `status` = active
   - `responses_used` = 0
   - `responses_limit` = tier === 'pro' ? 500 : 200
   - `current_period_start` = subscription.current_period_start
   - `current_period_end` = subscription.current_period_end
4. Return HTTP 200 with `{ "received": true }`.

## Rejected Events

All other event types return HTTP 200 but are no-ops.

## Security

- Signature verification is mandatory.
- Raw body must be passed to `stripe.webhooks.constructEvent`.
- No secret keys are logged.
