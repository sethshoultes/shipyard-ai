# Phase 1 Plan — Shipyard Care Subscription Service

**Generated**: 2026-04-20  
**Requirements**: `/home/agent/shipyard-ai/rounds/shipyard-maintenance-subscription/decisions.md`  
**Total Tasks**: 18  
**Waves**: 4  
**Estimated Duration**: 8 hours (locked decision)

---

## Executive Summary

Shipyard Care is a token-based subscription service ($500/month = 100K tokens) that provides dedicated agent capacity, incident-only reporting, and viral referral distribution. This plan implements the locked decisions from the Steve Jobs/Elon Musk debate synthesis.

**Key Locked Decisions**:
- Product Name: "Shipyard Care" (Steve wins)
- Pricing: Token-based not round-based (Elon wins)  
- Distribution: Referral credits $100/MRR in V1 (Elon wins)
- Billing: Stripe Subscriptions API day 1 (Elon wins)
- Reporting: Incident-only not scheduled monitoring (Synthesis)

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Priority |
|-------------|---------|------|----------|
| REQ-1: Subscribers Table | phase-1-task-1 | 1 | P0 |
| REQ-2: Token Usage Table | phase-1-task-2 | 1 | P0 |
| REQ-3: Referrals Table | phase-1-task-3 | 1 | P0 |
| REQ-58: Pricing Config | phase-1-task-18 | 1 | P0 |
| REQ-4: Subscriber Add Script | phase-1-task-4 | 2 | P0 |
| REQ-5: Subscriber Check Script | phase-1-task-5 | 2 | P0 |
| REQ-6: Token Deduct Script | phase-1-task-6 | 2 | P0 |
| REQ-9: Stripe API Setup | phase-1-task-7 | 2 | P0 |
| REQ-24: Welcome Email | phase-1-task-12 | 2 | P0 |
| REQ-25: Incident Report Email | phase-1-task-13 | 2 | P0 |
| REQ-27: Token Warning Email | phase-1-task-14 | 2 | P0 |
| REQ-10: Webhook - Subscription Created | phase-1-task-8 | 3 | P0 |
| REQ-11: Webhook - Subscription Deleted | phase-1-task-9 | 3 | P0 |
| REQ-12: Webhook - Invoice Succeeded | phase-1-task-10 | 3 | P0 |
| REQ-13: Webhook - Invoice Failed | phase-1-task-11 | 3 | P0 |
| REQ-32: Marketing Page | phase-1-task-15 | 4 | P1 |
| REQ-19: Referral Landing Page | phase-1-task-16 | 4 | P1 |
| REQ-7: Daemon Integration | phase-1-task-17 | 4 | P0 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation Layer  
Duration: 2 hours | Dependencies: None

**Tasks**: 4 foundational tasks
- phase-1-task-1: Create subscribers table schema
- phase-1-task-2: Create token_usage table schema
- phase-1-task-3: Create referrals table schema
- phase-1-task-18: Create pricing configuration file

### Wave 2 (Parallel, after Wave 1) — Business Logic Scripts & Templates  
Duration: 3 hours | Dependencies: Database schema (Wave 1)

**Tasks**: 6 implementation tasks
- phase-1-task-4: Create subscriber add script
- phase-1-task-5: Create subscriber check script
- phase-1-task-6: Create token deduct script
- phase-1-task-7: Extend Stripe API client
- phase-1-task-12: Create welcome email template
- phase-1-task-13: Create incident report email template
- phase-1-task-14: Create token warning email template

### Wave 3 (Parallel, after Wave 2) — Stripe Webhook Handlers  
Duration: 2 hours | Dependencies: Database (Wave 1), Scripts (Wave 2), Stripe client (Wave 2)

**Tasks**: 4 webhook handlers
- phase-1-task-8: Webhook handler - subscription.created
- phase-1-task-9: Webhook handler - subscription.deleted
- phase-1-task-10: Webhook handler - invoice.payment_succeeded
- phase-1-task-11: Webhook handler - invoice.payment_failed

### Wave 4 (Parallel, after Wave 3) — Integration & Marketing  
Duration: 1 hour | Dependencies: All webhook handlers (Wave 3), Scripts (Wave 2)

**Tasks**: 3 integration tasks
- phase-1-task-15: Create Shipyard Care marketing page
- phase-1-task-16: Create referral landing page template
- phase-1-task-17: Integrate subscriber check into PRD processing

---

## Task Plans


<task-plan id="phase-1-task-1" wave="1">
  <title>Create Subscribers Table Schema (Drizzle ORM)</title>
  <requirement>REQ-1: Database Schema - Subscribers Table</requirement>
  <description>
    Create the subscribers table using Drizzle ORM. This table stores all Shipyard Care subscriber information including token balances, referral codes, and subscription status. This is the core data model for the entire subscription system.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/packages/db/schema/subscriptions.ts" reason="Existing subscription schema pattern" />
    <file path="/home/agent/shipyard-ai/packages/db/client.ts" reason="Database client configuration (Neon PostgreSQL)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-maintenance-subscription/decisions.md" reason="Lines 195-206 specify exact schema requirements" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/packages/db/schema/subscriptions.ts for Drizzle ORM pattern</step>
    <step order="2">Create /home/agent/shipyard-ai/packages/db/schema/subscribers.ts</step>
    <step order="3">Define pgEnum for tier: 'care' | 'care_pro'</step>
    <step order="4">Define pgEnum for status: 'active' | 'cancelled' | 'paused'</step>
    <step order="5">Create subscribers table with: id serial, email text unique, tier enum, tokens_monthly int, tokens_remaining int, referral_code text unique, referral_credits int default 0, start_date timestamp, status enum</step>
    <step order="6">Add NOT NULL constraints on email, tier, tokens_monthly, tokens_remaining, referral_code, start_date, status</step>
    <step order="7">Create index on email for fast lookups</step>
    <step order="8">Create index on referral_code for referral tracking</step>
    <step order="9">Export subscribers table schema</step>
    <step order="10">Update /home/agent/shipyard-ai/packages/db/index.ts to export new schema</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/shipyard-ai/packages/db && npm run build</check>
    <check type="manual">Verify subscribers table has 9 columns with correct types</check>
    <check type="manual">Verify UNIQUE constraints on email and referral_code</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>feat(db): add subscribers table schema for Shipyard Care

Create subscribers table with Drizzle ORM:
- Support for care ($500) and care_pro ($1000) tiers
- Token balance tracking (monthly + remaining)
- Referral code generation and credit tracking
- Subscription status management
- Unique constraints on email and referral_code

Refs: REQ-1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

See /home/agent/shipyard-ai/.planning/phase-1-plan.md for complete 18-task XML plan with full context, steps, verification, and dependencies for all waves.

---

## Risk Notes

**RISK-1: Daemon Architecture Mismatch**
- Expected: `bin/daemon.sh` central daemon
- Actual: Distributed Cloudflare Workers architecture
- Mitigation: Implement subscriber routing in intake processing flow
- Affected Task: phase-1-task-17

**RISK-2: Token Calculation Accuracy**
- Open question: Parse Claude API vs estimate
- Mitigation: Start with 15K tokens per PRD estimate (simple)
- Refinement: V2 can add API parsing
- Affected Task: phase-1-task-6

---

## Success Criteria (V1 Launch)

From decisions.md lines 488-493:

- [ ] 5 subscribers converted from existing customer base
- [ ] Stripe automated billing working (0 manual invoices)
- [ ] At least 1 incident report sent (proof system works)
- [ ] 0 customer complaints about token confusion
- [ ] Referral links generated for all subscribers

---

**Total Build Time**: 8 hours (locked decision)  
**Plan Status**: Ready for execution  
**Next Step**: Begin Wave 1 implementation

