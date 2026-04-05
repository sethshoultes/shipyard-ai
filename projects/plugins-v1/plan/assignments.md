# Plugin Build Plan — Agent Assignments

## MemberShip v1.0

| Agent | Role | Assignment | Model |
|-------|------|-----------|-------|
| Elon Musk | Architecture | Plugin descriptor + sandbox entry scaffold, storage schema, API route signatures | Sonnet (via Agent tool) |
| Jony Ive (sub) | Admin UI | Block Kit admin pages: member list, plan editor, manual approve | Haiku |
| Maya Angelou (sub) | Docs | README.md with installation, config, usage examples | Haiku |
| Margaret Hamilton | QA | Review all code, test on Bella's Bistro | Haiku |

## EventDash v1.0

| Agent | Role | Assignment | Model |
|-------|------|-----------|-------|
| Steve Jobs | Architecture | Plugin descriptor + sandbox entry scaffold, storage schema, API routes | Sonnet (via Agent tool) |
| Rick Rubin (sub) | Event UX | Portable Text event-card block, registration flow | Haiku |
| Maya Angelou (sub) | Docs | README.md with installation, config, usage examples | Haiku |
| Margaret Hamilton | QA | Review all code, test on Sunrise Yoga | Haiku |

## Build Order

1. Both plugin scaffolds built in parallel (Elon + Steve)
2. Sub-agents fill in admin UI + docs
3. Margaret reviews both
4. Test on live sites
5. Ship
