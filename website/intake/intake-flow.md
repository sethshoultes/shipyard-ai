---
title: Shipyard AI — Intake Flow Design (v0, first 5 customers)
author: dhh-engineer (great-engineers)
status: draft — pragmatic-v0
created: 2026-04-27
---

# Intake Flow — what happens after submit

This document describes the **post-submit flow** for the paid intake form. It is deliberately under-engineered for v0. The first five customers will tell us which parts are worth automating. Until then, **Seth does the commercial steps with his thumbs**.

The mantra: do the simplest thing that works. A markdown file in `prds/intake/` and a manual Stripe link from a phone is fine for the first five customers. Build the state machine when the manual version has worked five times in a row.

---

## The full flow (v0)

```
Customer submits /intake form
   │
   ▼
[1] Server writes prds/intake/{slug}.md (status: awaiting-review)
[1] Server writes prds/intake/{slug}.assets/ (any uploaded files)
[1] Server emails operator (Seth)         ← AUTOMATED
[1] Server emails customer (confirmation) ← AUTOMATED
[1] Server returns 200 → /intake/thanks   ← AUTOMATED
   │
   ▼
[2] Seth opens email → reviews intake markdown
[2] Seth replies with:                    ← MANUAL
       - Stripe payment link (50% deposit)
       - Terms of Service PDF for e-sign
   │
   ▼
[3] Customer pays Stripe + signs ToS      ← CUSTOMER ACTION
   │
   ▼
[4] Seth confirms payment in Stripe       ← MANUAL
[4] Seth confirms ToS countersigned       ← MANUAL
[4] Seth runs: scripts/promote-intake.sh {slug}  ← SEMI-AUTOMATED
       which:
         - moves prds/intake/{slug}.md → prds/{slug}.md
         - applies PAID-TEMPLATE.md frontmatter updates
         - sets engagement_status: paid
         - records stripe_payment_id, tos_signed_at
   │
   ▼
[5] Existing pipeline picks up prds/{slug}.md  ← AUTOMATED (existing)
[5] INTAKE → DEBATE → PLAN → BUILD → REVIEW → DEPLOY
   │
   ▼
[6] Build ships. Seth runs scripts/handoff.sh {slug}  ← SEMI-AUTOMATED
       which:
         - generates handoff email
         - generates 50% balance Stripe link
         - sets engagement_status: shipped
   │
   ▼
[7] Customer pays balance                 ← CUSTOMER ACTION
[7] Seth marks engagement_status: wrapped ← MANUAL
```

---

## What's automated in v0

**Yes, automated:**
1. Form validation, persistence, file upload to disk
2. Notification email to operator (with summary + link to the markdown file)
3. Confirmation email to customer (with what-happens-next copy)
4. Confirmation page render
5. The `promote-intake.sh` and `handoff.sh` scripts (small bash wrappers around `mv`, `sed`, `git add/commit`)
6. The existing PRD pipeline (debate → deploy) — already runs once `prds/{slug}.md` exists

**No, manual (operator does these):**
1. Reviewing the intake (operator reads markdown, decides yes/no, suggests scope adjustments)
2. Generating the Stripe payment link (Stripe dashboard → "Create payment link" → email it)
3. Sending the ToS for e-sign (could be a static PDF + DocuSign / HelloSign / just an email with "reply to confirm")
4. Confirming payment cleared (look at Stripe dashboard)
5. Confirming ToS signed (look at email / DocuSign)
6. Running `promote-intake.sh` (one command on the operator's terminal)
7. Sending the handoff email at delivery
8. Confirming the balance payment cleared
9. Marking `wrapped`

This is fine. Manually doing 9 things 5 times = 45 thumb-presses. Building automation for 9 things = a week. The math is obvious.

---

## Server-side: what the form submission does

### Endpoint: `POST /api/intake` (Next.js route handler)

```
1. Validate the JSON body against the form spec
   - Reject with 400 + field-level errors on validation failure
   - No DB. The markdown file IS the database for v0.

2. Generate a slug:
   - lowercase(business_name) → strip non-alphanumeric → kebab-case
   - if slug already exists in prds/intake/ or prds/, append -2, -3, etc.

3. Persist files:
   - Write prds/intake/{slug}.md  (markdown body, see template below)
   - Write prds/intake/{slug}.assets/{filename} for any uploads
   - Write prds/intake/{slug}.json (raw form data, for forensics if the markdown gets mangled)

4. git add + commit (operator can opt out via env flag for local dev)
   - "intake: new submission from {business_name} ({tier})"

5. Send operator email (Resend):
   - Subject: "[Shipyard intake] {business_name} — {tier}"
   - Body: TL;DR fields + link to the file path on disk + Stripe-link template they can copy

6. Send customer confirmation email (Resend):
   - Subject: "We got your Shipyard project intake"
   - Body: confirmation page copy + reply-to: seth@shipyard.ai

7. Return 200 + {intake_id: slug}
```

### Where data is stored

Files only. No database in v0.

```
prds/
  intake/                                ← awaiting-payment intakes
    {slug}.md                            ← human-readable PRD draft
    {slug}.json                          ← raw form data (forensic backup)
    {slug}.assets/                       ← uploaded brand assets
      logo.svg
      ...
  {slug}.md                              ← promoted-after-payment PRDs (existing pipeline reads from here)
```

This is the right shape because:
- The pipeline already reads from `prds/`. We don't break it.
- `prds/intake/` is the holding pen. Pipeline ignores it.
- Promotion is a `mv`. No data migration, no DB, no risk.
- The whole intake is a markdown file Seth can grep, edit, and review on a phone via GitHub.

---

## The intake markdown file (`prds/intake/{slug}.md`)

It is **already** the PAID-TEMPLATE.md format with `engagement_status: intake` set in frontmatter. When Seth promotes it, the script just changes `engagement_status: paid` and `mv`s the file to `prds/{slug}.md`. No regeneration. No template re-rendering. Same file, different folder, one frontmatter field changed.

This means the form-submission code and the promotion script share a single template — `prds/PAID-TEMPLATE.md`. Single source of truth.

---

## Form-field → PAID-TEMPLATE mapping (one-to-one)

| Form field (section.field) | PAID-TEMPLATE.md location |
|----------------------------|---------------------------|
| 1.1 Full name | frontmatter: `customer.name` |
| 1.2 Email | frontmatter: `customer.email` |
| 1.3 Business name | frontmatter: `customer.business` |
| 1.4 Role | frontmatter: `customer.role` |
| 1.5 Phone | frontmatter: `customer.phone` |
| 1.6 Referral source | frontmatter: `customer.referral_source` |
| 1.7 Referrer | frontmatter: `customer.referrer` |
| 2.1 Tier | frontmatter: `tier` |
| 3.1 Beta program | frontmatter: `beta_program` |
| 3.2 Beta terms accepted | frontmatter: `beta_terms_accepted` |
| 4.1 Project name | §1 "Project name" |
| 4.2 Product type | §1 "Product type" |
| 4.3 Target URL | §1 "Target URL/domain" |
| 4.4 Need help with domain | §1 inline note |
| 4.5 Launch deadline | §1 "Deadline" + frontmatter `launch_deadline` |
| 4.6 Deadline hard | frontmatter `deadline_hard` |
| 5.1 Business description | §2 "What does this business do?" |
| 5.2 Audience | §2 "Who is the target audience?" |
| 5.3 Primary goal | §2 "Primary goal" |
| 6.1 Pages/features rows | §3 table (one row per entry) |
| 7.1 Brand colors | §4 "Brand colors" |
| 7.2 Typography | §4 "Typography" |
| 7.3 Reference sites | §4 "Reference sites" (one per line) |
| 7.4 Logo source | §4 "Logo / brand assets" radio |
| 7.5 Uploaded files | §4 footer: "Assets: see prds/intake/{slug}.assets/" |
| 8.1 Copy provider | §5 "Who provides copy" |
| 8.2 Photos source | §5 "Photos/images" |
| 8.3 Blog count | §5 "Blog posts count" |
| 9.1 Standard integrations | §6 checkboxes |
| 9.2 Stripe ready | frontmatter `integrations.stripe_ready` |
| 9.3 MemberPress | frontmatter `integrations.memberpress` |
| 9.4 Other integrations | §6 "Third-party API" line |
| 9.5 Multi-language | §6 "Multi-language" |
| 10.1 Notes | §7 "Notes" (new in PAID-TEMPLATE) |
| 11.1 Deposit acknowledged | frontmatter `deposit_acknowledged` |
| 11.2 ToS at intake | frontmatter `tos_accepted_at_intake` (timestamp) |
| 11.3 Signing authority | frontmatter `signing_authority` |

The Token Budget section (§8 in TEMPLATE.md) is **not** filled by the customer. It's filled by the operator/pipeline at the existing INTAKE stage, exactly like today.

---

## Customer-side experience

After submit, the customer sees:
1. **Thanks page** at `/intake/thanks?id={slug}` — confirms submission, says "Seth replies within one business day", offers a Calendly link if they want to talk first.
2. **Confirmation email** — same content, plus their submitted answers as plain text (so they have a copy).

That's it. **No customer dashboard. No login. No status page.** When the project status changes, Seth emails them. The dashboard for v0 is their inbox.

If they have a question between submit and Stripe-link arrival: they reply to the confirmation email. It goes to Seth.

---

## Operator-side experience

When a new intake arrives:
1. Seth gets an email at `seth@shipyard.ai` (or wherever).
2. The email contains: business name, tier, beta-yes/no, deadline, link to the file path, and a copy-pasteable Stripe-link draft.
3. Seth:
   - Opens the markdown file (laptop or phone via GitHub).
   - Reads it. Decides yes/no/needs-clarification.
   - If yes: opens Stripe dashboard, creates a payment link for 50% of the tier price, copy-pastes into a reply.
   - Attaches/links ToS PDF for e-sign.
4. Customer pays + signs.
5. Seth confirms via Stripe dashboard + email/DocuSign.
6. Seth runs `scripts/promote-intake.sh {slug}` from the repo. The PRD moves to `prds/{slug}.md`. The pipeline takes over.

**No operator dashboard either.** Email + Stripe dashboard + the repo are the operator UI.

---

## Failure modes and what to do about them

**The customer fills out the form but never pays.**
After 7 days in `prds/intake/` with no payment, Seth sends one nudge. After 14 days, the intake moves to `prds/intake/abandoned/` and the customer gets a "we're closing this out, reply to revive it" email. That's it. No CRM. No drip campaign.

**The form gets spam.**
If we get 3 spam submissions in a week, add a honeypot field (no captcha — captchas annoy real customers more than they stop bots). If honeypot doesn't help, add hCaptcha. Not before.

**The customer's uploaded brand assets are corrupt or wrong.**
Seth catches this on review. He emails the customer. There's no upload-validation feedback in v0.

**Stripe payment fails.**
Stripe emails Seth. Seth emails the customer. No automation.

**The customer wants to change their answers after submit.**
They reply to the confirmation email with the changes. Seth edits the markdown file by hand. (After 2 customers do this, we add a "request changes" link in the confirmation email that goes to a `mailto:` with a pre-filled subject. Still no edit UI.)

**The intake form bricks (server error).**
The form does a hard fail with "something broke — email seth@shipyard.ai with your info, sorry". The customer's typed data is preserved client-side (localStorage of the form state) so they can copy-paste it into the email. **This is the only client-side state we keep.**

---

## What we'll automate when (the trigger thresholds)

Be explicit about when manual stops being fine. Don't pre-build.

| Manual step | Automate when |
|-------------|---------------|
| Stripe link generation | After 5 successful intakes. Then: server creates a Stripe payment link via API on submit and includes it in the operator email. (Customer doesn't see it until Seth approves and sends.) |
| ToS e-signature | After 3 customers ask "where do I sign?" — switch to DocuSign or a `<form>` with a typed-name + checkbox + IP-stamp. |
| Payment confirmation | After 5. Then: Stripe webhook flips `engagement_status: paid` automatically and runs `promote-intake.sh`. |
| Pipeline kickoff | Already automated (existing). Stays. |
| Build status updates to customer | After 3 customers ask "what's the status?" — add a static `/p/{slug}` page that reads the project's STATUS.md. Still no login. |
| Handoff email | After 5 ships. Then: post-deploy hook generates handoff email + balance Stripe link. |
| Customer dashboard | When 10+ active customers exist simultaneously. Not before. |

If we're tempted to automate something before the threshold: don't. The first 5 are research. Manual surfaces every defect in the form.

---

## What to throw away if it's wrong

If after 3 intakes we discover:
- **Half the fields go un-filled** — cut them. The form is too long.
- **Customers confused about a field** — rewrite the help text. If it still confuses them, cut the field.
- **Operator doing manual cleanup on every intake** — bake the cleanup into validation.
- **Customers asking the same question via email** — add a FAQ link or rewrite the confirmation page.

The form is a hypothesis. Each intake is a test. Iterate.

---

Drafted by great-engineers:dhh-engineer for human review. v0 = first five customers. Iterate from there.
