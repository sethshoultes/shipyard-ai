# PRD Rules

## Hard Limit
- Max 50 lines per PRD.
- Exceeding this fails CI lint.

## Field Blacklist
The following commercial fields are banned from all build contracts:
- stripe_payment_id
- deposit_paid
- balance_paid
- tos_signed
- hubspot
- crm_
- tier_price_usd

## Scope Blacklist
The following are out of scope for v1:
- e-commerce
- auth
- i18n
- membership
- subscription
- token-budget tables

## Enforcement
CI runs `wc -l` on every PRD and greps for banned patterns.
