---
title: Shipyard AI — Paid Customer Intake Form Spec
author: dhh-engineer (great-engineers)
status: draft — pragmatic-v0
created: 2026-04-27
---

# Shipyard AI — Paid Customer Intake Form

This is the **form spec** the developer adapts to a Next.js form at `/intake`. It is the customer-facing front door for paying customers. It captures everything the multi-agent pipeline already needs (via `prds/TEMPLATE.md`) **plus** the commercial fields a paid engagement requires.

Design discipline:
- One page, top to bottom. No multi-step wizard. Customers can skim and skip optional fields.
- Sensible defaults. Most fields are optional. Required fields are flagged.
- Help text is short. If a field needs more than a sentence to explain, the field is wrong.
- Validation happens on submit, not on every keystroke.
- Save-in-progress is **not** v0. If a customer bounces, they re-fill. (We'll add it when 2 of the first 5 ask for it.)

---

## Page header (above the form)

> **Start your project.** Tell us what you want to build. Most customers finish this in 10–15 minutes.
>
> After you submit, Seth (the operator) reviews within one business day, sends you a Stripe link for the 50% deposit, and a Terms of Service for e-signature. Once both clear, your project enters the build queue.

---

## Section 1 — About you

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 1.1 | Full name | text | yes | — | — | non-empty | frontmatter `customer.name` |
| 1.2 | Email | email | yes | — | We'll use this for everything — invoice, build updates, handoff. | RFC 5322 email | frontmatter `customer.email` |
| 1.3 | Business name | text | yes | — | The legal name on the invoice. | non-empty | frontmatter `customer.business` |
| 1.4 | Your role | text | no | — | e.g. Founder, Marketing Lead, Solo Operator. | — | frontmatter `customer.role` |
| 1.5 | Phone | tel | no | — | Optional. Only used if your project gets stuck and email isn't fast enough. | loose phone regex | frontmatter `customer.phone` |
| 1.6 | How did you hear about us? | select | no | — | Helps us know what's working. | one of: Twitter/X, podcast, referral, Google, Caseproof, other | frontmatter `customer.referral_source` |
| 1.7 | Referral name (if applicable) | text | no | — | Show only if 1.6 = "referral". | — | frontmatter `customer.referrer` |

---

## Section 2 — Tier selection

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 2.1 | Which tier? | radio | yes | — | Pick the one that fits. If you're unsure, pick the one closest and add a note in section 10. | one of: starter, standard, complex, custom | frontmatter `tier` |

**Radio options (with inline pricing):**

- ( ) **Starter — $4,995** — Up to 5 pages. Standard design. Up to 1 integration. 7-day build.
- ( ) **Standard — $14,995** — Up to 10 pages. Custom design. Up to 3 integrations. 14-day build.
- ( ) **Complex — $29,995** — 20+ pages. Custom design + brand. Multiple integrations. 21-day build.
- ( ) **Custom scope — let's talk** — Submitting routes you to a 30-minute call instead of the build queue.

If `2.1 = custom`, hide sections 4–9 and show only:
- A Calendly link ("Book a 30-minute scoping call")
- A 1-line "What do you want to build?" textarea (optional)
- The submit button (which sends a "scoping call requested" email to the operator)

---

## Section 3 — Beta-program eligibility

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 3.1 | Beta program | checkbox | no | unchecked | Check this to apply for the beta program (50% off, first 3–5 customers only). In exchange you agree to a written case study and let us reference your project publicly. | — | frontmatter `beta_program` (bool) |
| 3.2 | Beta program acknowledgment | checkbox | yes if 3.1 checked | unchecked | I have read the [beta-program terms](/legal/beta-terms) and agree to the case-study commitment. | required if 3.1 = true | frontmatter `beta_terms_accepted` (bool) |

> **Inline note shown if 3.1 is checked:** "Beta pricing is at Shipyard's discretion. If we've already filled the beta cohort, you'll be billed at the full tier price and we'll let you know before charging."

---

## Section 4 — Project basics

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 4.1 | Project name | text | yes | — | What should we call this project internally? | non-empty | PRD §1 "Project name" |
| 4.2 | Product type | radio | yes | site | What are we building? | one of: site, theme, plugin | PRD §1 "Product type" |
| 4.3 | Target URL/domain | text | no | — | Leave blank if you want help picking one. | loose URL/domain regex if filled | PRD §1 "Target URL/domain" |
| 4.4 | Need help picking a domain? | checkbox | no | unchecked | We'll suggest 3–5 options. | — | PRD §1 note appended |
| 4.5 | Launch deadline | date | no | — | Hard deadline only. Soft "asap" → leave blank. | future date if filled | PRD §1 "Deadline" + frontmatter `launch_deadline` |
| 4.6 | Deadline is hard? | checkbox | no | unchecked | Show only if 4.5 filled. Check if missing this date is a real problem. | — | frontmatter `deadline_hard` (bool) |

---

## Section 5 — Business context

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 5.1 | What does this business do? | textarea | yes | — | 2–4 sentences. Plain English. | min 30 chars | PRD §2 "What does this business do?" |
| 5.2 | Target audience | textarea | yes | — | Who are you trying to reach? Be specific. "Everyone" is not an answer. | min 20 chars | PRD §2 "Who is the target audience?" |
| 5.3 | Primary goal of this site | textarea | yes | — | What's the one thing you most want this site to do? Sell something? Capture leads? Inform? Build credibility? | min 20 chars | PRD §2 "Primary goal" |

---

## Section 6 — Pages and features

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 6.1 | Pages and features | repeating block | yes | one empty row | Each page or feature in its own row. Add as many as you need. Don't list every blog post — just the templates and major sections. | at least 1 row with name filled | PRD §3 table |

**Repeating block fields per row:**
- **Name** (text, required) — e.g. "Home", "About", "Pricing", "Blog index"
- **Description** (textarea, optional) — what's on it / what it does
- **Priority** (radio, required) — Must-have / Nice-to-have

UI affordance: a single "+ Add page or feature" button below the list. No drag-to-reorder in v0 — order is the order they're entered.

---

## Section 7 — Design direction

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 7.1 | Brand colors | text | no | — | Hex codes if you have them, or words ("forest green and warm white"). | — | PRD §4 "Brand colors" |
| 7.2 | Typography preferences | text | no | — | Fonts you love or hate. Or leave blank and we'll pick. | — | PRD §4 "Typography" |
| 7.3 | Reference sites | textarea | no | — | URLs of sites you admire. One per line. We're not copying them — we're calibrating. | each line is a URL or empty | PRD §4 "Reference sites" |
| 7.4 | Logo / brand assets | radio | yes | generate | Do you have a logo and brand kit? | one of: have_assets, generate | PRD §4 "Logo / brand assets" |
| 7.5 | Upload brand assets | file upload (multi) | no | — | Show only if 7.4 = have_assets. PNG, SVG, PDF, or zip. Max 25MB per file. | file types + size | stored alongside PRD; referenced in §4 |

---

## Section 8 — Content

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 8.1 | Who provides the copy? | radio | yes | hybrid | Hybrid means you give us a brief and we write, you review. | one of: client, ai, hybrid | PRD §5 "Who provides copy" |
| 8.2 | Photos / images | radio | yes | stock | — | one of: client, stock, ai | PRD §5 "Photos/images" |
| 8.3 | Number of blog posts | number | no | 0 | 0 means no blog. Leave at 0 if unsure — you can add posts later as a revision. | integer 0–50 | PRD §5 "Blog posts count" |

---

## Section 9 — Integrations

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 9.1 | Standard integrations | multi-select checkbox | no | none checked | Pick anything you need. We'll handle setup as part of the build. | — | PRD §6 checkboxes |
| 9.2 | Stripe account ready? | checkbox | no | unchecked | Show only if "E-commerce" is checked in 9.1. We'll need API keys before we can ship. | — | frontmatter `integrations.stripe_ready` |
| 9.3 | MemberPress site? | checkbox | no | unchecked | Caseproof customers — check this if you're integrating with MemberPress. | — | frontmatter `integrations.memberpress` |
| 9.4 | Other integrations | textarea | no | — | Anything not in the standard list. One per line. | — | PRD §6 "Third-party API" line |
| 9.5 | Multi-language? | text | no | — | If yes, list the languages. | — | PRD §6 "Multi-language" |

**Standard integrations checkbox options (9.1):**
- E-commerce (products, cart, checkout)
- Blog / CMS
- Contact form
- Email newsletter signup (Resend / Mailchimp / ConvertKit)
- Social media links / feeds
- Analytics (Google Analytics, Plausible, etc.)
- User authentication / accounts
- Search functionality

---

## Section 10 — Anything else?

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 10.1 | Questions or context for Shipyard | textarea | no | — | Edge cases, weird requirements, things you're worried about, things you've tried that didn't work. The more we know, the less we have to ask. | — | PRD §7 "Notes" (new section in PAID-TEMPLATE) |

---

## Section 11 — Payment readiness

| # | Field | Type | Required | Default | Help text | Validation | Maps to PAID-TEMPLATE.md |
|---|-------|------|----------|---------|-----------|------------|--------------------------|
| 11.1 | 50% deposit acknowledgment | checkbox | yes | unchecked | I understand a 50% deposit is required before the build starts. Seth will email a Stripe link within one business day. | required true | frontmatter `deposit_acknowledged` |
| 11.2 | Terms of Service | checkbox | yes | unchecked | I have read and accept the [Shipyard AI Terms of Service](/legal/terms). | required true | frontmatter `tos_accepted_at_intake` (timestamp) |
| 11.3 | Authorized to sign? | checkbox | yes | unchecked | I'm authorized to bind the business named in 1.3 to this agreement. | required true | frontmatter `signing_authority` |

---

## Section 12 — Submit

**Button label:** "Submit project intake"

**On submit:**
1. Client-side: validate all required fields. Scroll to first error if any.
2. Server-side (`POST /api/intake`): persist intake (see `intake-flow.md`).
3. Redirect to `/intake/thanks?id={intake_id}` (confirmation page).
4. Send confirmation email to customer.
5. Send notification email to operator (Seth).

**Confirmation page copy:**
> Thanks — we got it.
>
> Seth will review within one business day and email you with:
> 1. A Stripe link for the 50% deposit
> 2. A Terms of Service for e-signature
>
> Once both clear, your project enters the build queue. Estimated build time: **{tier_build_time}** from kickoff.
>
> Questions in the meantime? Reply to the confirmation email — it goes straight to Seth.

---

## What this form does NOT have (and why)

DHH discipline. Things we're NOT building until a real customer asks twice:

- **Save and resume.** If they bounce, they re-fill. Cost of re-fill: 10 minutes. Cost of building save-resume: 1–2 days. Not yet.
- **File preview after upload.** We trust the file made it. Operator opens it on review.
- **Real-time tier price calculator.** The price is on the radio label. That's enough.
- **Account creation.** No login. The intake is the account.
- **Captcha.** If we get spam, we add it. Until then, it's friction for real customers.
- **Multi-step wizard.** One page. Faster to skim. Easier to reason about.
- **Stripe element embedded in the form.** Operator sends a Stripe link manually. See `intake-flow.md` for why.
- **Auto-generated project slug visible to the customer.** They don't need to see it. Operator picks it.
- **Webhook to Slack / Discord.** An email to Seth is the notification system for v0.

---

## Validation philosophy

- Required fields: name, email, business name, tier, beta-terms-if-beta-checked, project name, product type, business-context fields, at least one page/feature, copy/photos selections, all 3 payment-readiness checkboxes.
- Everything else: optional. Empty is fine. The PRD will note "not specified" and the operator/agents will ask in follow-up.
- No async validation (no "checking if domain is available" calls). Domain availability is the operator's job at review time.
- Email format: standard regex. We'll send a confirmation email — bounces will tell us if it's bad.

---

Drafted by great-engineers:dhh-engineer for human review. v0 = first five customers. Iterate from there.
