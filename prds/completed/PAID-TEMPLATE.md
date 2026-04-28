---
title: Shipyard AI — PRD Template (Paid Customer)
author: dhh-engineer (great-engineers)
status: draft — pragmatic-v0
created: 2026-04-27
---

<!--
  PAID-TEMPLATE.md — superset of prds/TEMPLATE.md.
  Generated from the website /intake form for paying customers.
  The pipeline reads the §-numbered sections below the same way it reads TEMPLATE.md.
  The frontmatter and the "Commercial Context" section are the only additions.
-->

```yaml
# ============================================================
# FRONTMATTER — commercial + status fields
# Filled progressively: intake → review → paid → building → shipped → wrapped
# ============================================================

customer:
  name:                  # 1.1  required
  email:                 # 1.2  required
  business:              # 1.3  required (legal name on invoice)
  role:                  # 1.4  optional
  phone:                 # 1.5  optional
  referral_source:       # 1.6  optional (twitter | podcast | referral | google | caseproof | other)
  referrer:              # 1.7  optional (name, only if referral_source = referral)

tier:                    # 2.1  required (starter | standard | complex | custom)
tier_price_usd:          # filled by intake handler from tier
beta_program: false      # 3.1
beta_terms_accepted: false  # 3.2

launch_deadline:         # 4.5  optional (ISO date)
deadline_hard: false     # 4.6

integrations:
  stripe_ready: false    # 9.2
  memberpress: false     # 9.3

# Commercial state — filled by operator
deposit_acknowledged: false        # 11.1 (true at intake submit)
tos_accepted_at_intake:            # 11.2 ISO timestamp at submit
signing_authority: false           # 11.3 (true at intake submit)

stripe_payment_link:               # filled by operator after generating
stripe_payment_id:                 # filled by operator after deposit clears
deposit_paid_at:                   # ISO timestamp
balance_payment_id:                # filled at handoff
balance_paid_at:                   # ISO timestamp

tos_signed: false
tos_signed_at:                     # ISO timestamp
tos_document_path:                 # path / DocuSign reference

# Engagement lifecycle
engagement_status: intake          # intake | paid | building | shipped | wrapped | abandoned
intake_submitted_at:               # ISO timestamp set by form handler
promoted_at:                       # ISO timestamp when moved from prds/intake/ → prds/
shipped_at:                        # ISO timestamp at deploy
wrapped_at:                        # ISO timestamp after balance clears

# Customer support contact for the engagement (defaults to customer.email)
escalation_contact:

# Case-study commitment (only enforced if beta_program: true)
case_study_committed: false        # mirrors beta_terms_accepted at intake; operator confirms at wrap

# Slug — derived from business name at intake; do not change after promotion
slug:
```

---

# Project: {{ project name from §1 }}

## Commercial Context

> This block is for operator + agent visibility. Pipeline agents read it to understand
> the engagement boundaries. It does not replace the PRD content below — it frames it.

- **Tier:** {{ tier }} ({{ tier_price_usd }} USD)
- **Beta program:** {{ beta_program }}{{ if beta_program: ", case study committed" }}
- **Deposit paid:** {{ deposit_paid_at or "no" }}
- **Balance paid:** {{ balance_paid_at or "no" }}
- **Launch deadline:** {{ launch_deadline or "none specified" }}{{ if deadline_hard: " (hard)" }}
- **Engagement status:** {{ engagement_status }}
- **Customer escalation contact:** {{ escalation_contact or customer.email }}
- **Case-study commitment:** {{ case_study_committed }}

**Operator notes (free text — append-only):**
<!-- Operator adds bullets here during review, build, and wrap. Agents read but do not modify. -->

---

## 1. Project Overview

**Project name:**
**Product type:** [ ] Site  [ ] Theme  [ ] Plugin
**Target URL/domain:**
**Deadline (if any):**

## 2. Business Context

**What does this business do?**
**Who is the target audience?**
**What's the primary goal of this site/theme/plugin?**

## 3. Pages / Features

List every page or feature. Be specific.

| # | Page/Feature | Description | Priority |
|---|-------------|-------------|----------|
| 1 | | | Must-have / Nice-to-have |
| 2 | | | Must-have / Nice-to-have |

## 4. Design Direction

**Brand colors (hex if available):**
**Typography preferences:**
**Reference sites (URLs of sites you like):**
**Logo / brand assets provided?** [ ] Yes (see `./{{slug}}.assets/`) [ ] No (generate)

## 5. Content

**Who provides the copy?** [ ] Client provides all text  [ ] AI generates from business info  [ ] Hybrid
**Photos/images:** [ ] Client provides  [ ] Use stock  [ ] AI-generated
**Blog posts (if applicable):** Count: ___

## 6. Integrations

Check all that apply:
- [ ] E-commerce (products, cart, checkout)
- [ ] Blog / CMS
- [ ] Contact form
- [ ] Email newsletter signup
- [ ] Social media links/feeds
- [ ] Analytics (Google Analytics, etc.)
- [ ] User authentication / accounts
- [ ] Third-party API: _______________
- [ ] Multi-language: Languages: _______________
- [ ] Search functionality

## 7. Notes from Customer

> Customer free-text from intake §10. Edge cases, concerns, things they've tried.
> Read this before debate — it often contains the real constraint.

<!-- pasted from form 10.1 -->

## 8. Must-Haves vs. Nice-to-Haves

**Must-haves (will not ship without these):**
1.
2.
3.

**Nice-to-haves (only if tokens allow):**
1.
2.

## 9. Token Budget

_Filled by Shipyard AI during INTAKE — client reviews and approves at first build update._

| Item | Tokens |
|------|--------|
| Base package (per tier) | |
| Multipliers | |
| **Total budget** | |
| Estimated revision credits needed | |

---

## Status log (append-only)

> Every meaningful state change appends a line here. Both operator and pipeline write.

- {{ intake_submitted_at }} — intake submitted via /intake form (engagement_status: intake)
<!-- - YYYY-MM-DDTHH:MM:SSZ — deposit cleared, ToS countersigned (engagement_status: paid) -->
<!-- - YYYY-MM-DDTHH:MM:SSZ — promoted to prds/{{slug}}.md, pipeline picked up -->
<!-- - YYYY-MM-DDTHH:MM:SSZ — debate complete -->
<!-- - YYYY-MM-DDTHH:MM:SSZ — build complete, in review -->
<!-- - YYYY-MM-DDTHH:MM:SSZ — deployed to staging -->
<!-- - YYYY-MM-DDTHH:MM:SSZ — production deploy, handoff email sent (engagement_status: shipped) -->
<!-- - YYYY-MM-DDTHH:MM:SSZ — balance cleared (engagement_status: wrapped) -->

---

Drafted by great-engineers:dhh-engineer for human review. v0 = first five customers. Iterate from there.
