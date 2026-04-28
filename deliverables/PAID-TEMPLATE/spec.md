# PAID-TEMPLATE — Build Spec

## Project

Shipyard AI v1 Platform — Intake, Schema, and Build Pipeline

## Goals (from PRD + Decisions)

1. **Intake Experience** — Replace the bloated `prds/PAID-TEMPLATE.md` with a 5-question conversational form that maps to a machine-readable schema. The customer must feel understood, not processed.
2. **Build Contract (PRD)** — Enforce a hard 50-line PRD limit with zero commercial fields. Move money, legal, and CRM state to `ops/` and external systems (Stripe, HubSpot).
3. **Build Pipeline** — Single-session agent orchestrator for 5-page marketing sites. Sharded agents (Design → Component → Deploy) when context windows demand it.
4. **Output** — Live URL + deploy preview for one-shot customer approval. Invisible "Built by Shipyard" signature (whispered, not billboarded).
5. **Asset Handling** — Local storage at `./assets/[project-slug]/` for v1. CDN pipeline designed but not implemented until scale demands it.
6. **Distribution Mechanics** — Referral loop (one free month per closed deal). No manual revision arbitration; deploy preview is the approval mechanism.
7. **Scope Guardrails** — v1 ships sites only. Themes, plugins, e-commerce, auth, i18n, and token-budget tables are explicitly out of scope and blocked at intake.

---

## Implementation Approach (from Decisions + Plan Pattern)

Execution follows a 5-wave parallel pattern (derived from `.planning/phase-1-plan.md` wave semantics). Each wave contains tasks that can run in parallel; subsequent waves depend on earlier ones.

### Wave 1 — Foundation: Intake & Contract
- Build the 5-question conversational intake form (`intake/index.html`) with organic question flow.
- Define `intake/questions.json` as the canonical question schema with branching logic.
- Build `intake/mapper.js` to translate form answers → `schema/template.md` (20-line markdown contract).
- Write `prd/rules.md` documenting the 50-line hard limit, field blacklist, and PRD lint rules.
- **Key decision**: PRD must be ≤50 lines, zero commercial fields (Decision #4). The existing `PAID-TEMPLATE.md` frontmatter (customer, tier, stripe fields, status logs) is the anti-pattern we are eliminating from the build contract.

### Wave 2 — Agent System
- Write `agent/prompts/design.txt` — system prompt for the Design agent (Sonnet-class context, haiku-class execution).
- Write `agent/prompts/component.txt` — system prompt for the Component agent.
- Write `agent/prompts/deploy.txt` — system prompt for the Deploy agent.
- Write `agent/guardrails.json` — fixed scope rules: max 5 pages, component whitelist, banned keywords (e-commerce, auth, i18n, membership).
- **Key decision**: Sharded agents (Decision #9). A 200-line PRD plus a full codebase will not fit in one session; the orchestrator must shard context.

### Wave 3 — Build Pipeline
- Build `build/index.js` — the orchestrator that reads `schema/template.md`, dispatches agents, tracks token burn, and emits work-in-progress artifacts.
- Build `build/context-shard.js` — splits PRD + codebase across agents when context exceeds ~75% of model window.
- Integrate token tracking: budget vs. burned, burn rate, projected completion.
- **Key decision**: Retry policy — agent fails → retry once → alternative approach → mark blocked → human escalation after 3 failures (CLAUDE.md §Retry Policy).

### Wave 4 — Deploy System
- Build `deploy/preview.js` — generates a deploy preview URL for customer approval/rejection.
- Build `deploy/badge-injector.js` — injects invisible signature (semantic HTML meta tag + subtle SVG watermark, per Open Question #3).
- Write `deploy/target-config.json` — default Vercel/Netlify abstraction, swappable target.
- **Key decision**: No manual revision arbitration. Customer approves or rejects via preview (Decision #7).

### Wave 5 — Ops Integration
- Build `ops/stripe-webhook.js` — handles payment state transitions (deposit, balance). No Stripe logic leaks into PRD or build artifacts.
- Build `ops/hubspot-sync.js` — CRM sync for customer and engagement data. No CRM fields in PRD.
- **Key decision**: Commercial state lives entirely in ops/ and external systems, never in the build contract (Decision #4).

### Wave 6 — Verification & QA
- Automated QA scripts verify every locked decision is respected (file list below).
- CI pipeline runs structure checks, PRD line-count lint, banned-pattern grep, and intake form validation.

---

## Verification Criteria

| Criterion | How to Prove |
|-----------|--------------|
| Intake has exactly 5 questions | `grep -c` question identifiers in `intake/index.html` == 5 |
| Schema is ≤20 lines | `wc -l schema/template.md` ≤ 20 |
| PRD rules enforce ≤50 lines | `wc -l prd/rules.md` ≤ 50 and rules contain line-count enforcement logic |
| Zero commercial fields in PRD output | `grep` for `stripe_`, `hubspot`, `payment_id`, `balance_paid` in `prd/` returns 0 matches |
| Guardrails block out-of-scope requests | `grep` for banned keywords in `agent/guardrails.json` includes e-commerce, auth, i18n, membership |
| Invisible signature is not a billboard | `deploy/badge-injector.js` contains no visible badge HTML; only meta tag + low-opacity SVG |
| Build pipeline tracks tokens | `build/index.js` contains token burn logging and budget ceiling check |
| Retry policy is encoded | `build/index.js` contains retry counter (max 3) and human-escalation path |
| No REST API in v1 | `grep "register_rest_route"` across `build/` returns 0 matches |
| No localStorage in beam-equivalent | Not applicable; no Beam in this project. Verify no `localStorage` in `intake/` JS |
| Deploy preview exists | `deploy/preview.js` exports a function that returns a URL string |
| Asset storage is local | `deploy/target-config.json` default target is local/Vercel, not CDN |
| Referral loop is documented | `ops/` contains referral tracking logic or schema field for referrer |
| Agent prompts are ≤context window | Each prompt file in `agent/prompts/` is <4KB (safe for haiku input) |
| Components are not rigid templates | `components/` README or guardrails state "adaptable primitives, not rigid templates" |

---

## Files to Create or Modify

### New directories
```
intake/
schema/
prd/
agent/prompts/
build/
deploy/
ops/
components/
assets/
```

### New files
| # | File | Purpose | Wave |
|---|------|---------|------|
| 1 | `intake/index.html` | 5-question conversational form | 1 |
| 2 | `intake/questions.json` | Question flow + branching logic | 1 |
| 3 | `intake/mapper.js` | Maps form answers → schema.md | 1 |
| 4 | `schema/template.md` | 20-line markdown schema contract | 1 |
| 5 | `prd/rules.md` | 50-line PRD hard limit + field blacklist | 1 |
| 6 | `agent/prompts/design.txt` | Design agent system prompt | 2 |
| 7 | `agent/prompts/component.txt` | Component agent system prompt | 2 |
| 8 | `agent/prompts/deploy.txt` | Deploy agent system prompt | 2 |
| 9 | `agent/guardrails.json` | Fixed scope rules (page count, component whitelist, banned keywords) | 2 |
| 10 | `build/index.js` | Orchestrator: reads schema, dispatches agents, tracks tokens | 3 |
| 11 | `build/context-shard.js` | Splits PRD + codebase across agents at context limit | 3 |
| 12 | `deploy/preview.js` | Deploy preview generator | 4 |
| 13 | `deploy/badge-injector.js` | Invisible signature injection (meta + SVG) | 4 |
| 14 | `deploy/target-config.json` | Hosting target configuration (Vercel/Netlify default) | 4 |
| 15 | `ops/stripe-webhook.js` | Payment state handler | 5 |
| 16 | `ops/hubspot-sync.js` | CRM sync handler | 5 |
| 17 | `components/README.md` | Component philosophy: adaptable primitives, not rigid templates | 3 |
| 18 | `.github/workflows/ci.yml` | CI pipeline: lint, banned-pattern checks, line-count checks | 6 |

### Modified files
| # | File | Change | Reason |
|---|------|--------|--------|
| 1 | `prds/PAID-TEMPLATE.md` | **Do not modify.** This is the reference anti-pattern. The new system replaces it with `schema/template.md` + `prd/rules.md`. | Decisions #4: PRD ≤50 lines, zero commercial fields. The existing template is the "before" state. |
| 2 | `CLAUDE.md` | Append project-specific guardrails if needed | Ensure agents building PAID-TEMPLATE know the 50-line PRD rule |
| 3 | `STATUS.md` | Update with PAID-TEMPLATE build state | Pipeline tracking per CLAUDE.md |

---

## Banned Patterns (must never appear in build output)

Per Decisions #4, #5, #6:
- No `stripe_payment_id`, `deposit_paid`, `balance_paid`, `tos_signed` in any build contract file.
- No e-commerce, auth, i18n, membership, or token-budget table implementations in v1 build artifacts.
- No `register_rest_route` in v1 (client-side or static generation only).
- No visible "Built by Shipyard" billboard badge (invisible signature only).
- No `localStorage` usage in intake form (stateless where possible; server-side session preferred).

---

## Success Criteria (Phase 1 Launch)

- [ ] Intake form renders and accepts 5 answers without error.
- [ ] `mapper.js` produces a valid `schema/template.md` ≤20 lines.
- [ ] `prd/rules.md` is ≤50 lines and documents the field blacklist.
- [ ] Agent prompts exist and reference `guardrails.json`.
- [ ] Orchestrator can read schema and dispatch at least one agent (design) without context overflow.
- [ ] Deploy preview generates a URL.
- [ ] Invisible signature injects meta tag + SVG watermark into HTML output.
- [ ] CI pipeline blocks PRs with commercial fields in `schema/` or `prd/`.
- [ ] Zero e-commerce, auth, i18n code in v1 artifacts.
- [ ] All test scripts in `deliverables/PAID-TEMPLATE/tests/` pass (exit 0).
