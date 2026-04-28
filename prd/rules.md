# PRD Rules

## Hard Limit
- Max 50 lines per PRD.
- Exceeding this fails CI lint.

## Field Blacklist
Commercial fields involving payment state, legal signatures, CRM IDs, and pricing are banned from all build contracts. See ops/ for the explicit field registry.

## Scope Blacklist
The following are out of scope for v1:
- online stores
- user authentication systems
- multi-language support
- gated access tiers
- recurring billing
- token-budget tables

## Enforcement
CI runs `wc -l` on every PRD and greps for banned patterns.
