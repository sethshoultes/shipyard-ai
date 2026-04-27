# LocalGenius Revenue & Retention Sprint — Locked Decisions
*Consolidated by Phil Jackson, Zen Master*
*"The strength of the team is each member. The strength of each member is the team."*

---

## Decision Register

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **No legal rebrand this sprint.** LocalGenius remains the legal entity, Stripe plan namespace, repo name, and DNS. | Elon | **Elon** | A rebrand is a migration, not a feature. It touches app stores, SEO, Stripe plans, and every email asset. Sprint budget cannot absorb it. |
| 2 | **"Sous" is the brand voice.** Used in every headline, button, subject line, and digest salutation. LocalGenius stays in the footer and legal copy. | Steve | **Steve** | Names are sounds that become feelings. This costs zero engineering hours and compounds retention. Legal retains the corporate name; the user experience gets intimacy. |
| 3 | **Two Stripe annual plans, one radio button.** `localgenius-annual-base` and `localgenius-annual-pro` price IDs. No new services. No new databases. | Elon | **Elon** | The existing webhook handler absorbs this. Complexity doesn't announce itself — it arrives disguised as "trivial" feature requests. |
| 4 | **Stripe owns proration entirely.** `proration_behavior: 'create_prorations'`. Zero custom proration logic. Zero explanation essays in email. Disputes route to Stripe Customer Portal. | Elon | **Elon** | Steve concedes: "Stripe handles proration." Custom billing logic is the fastest path to 3 AM pages. |
| 5 | **Async digest generation + idempotent webhooks ship in v1.** Not v2. Not "when we have time." | Elon | **Elon** | Steve fully agrees. A love note that arrives at 3 AM because the job is synchronous is a breakup letter. Idempotency keys aren't sexy, but duplicate subscription events will corrupt billing state faster than an ugly button ever will. |
| 6 | **Weekly digest is a "love note" — one number, one smile, one reason to exhale.** | Steve | **Steve** | "You saved four hours. You touched 300 souls." Data without meaning is spam. The digest is the product; everything else is plumbing. Elon accepts this on the condition the infra is async and batched. |
| 7 | **Pricing page is one emotional fork, not a feature grid.** No "Pro / Base" labels in customer-facing copy. No comparison tables. No gray explanatory text. Clear price calculation visible in under three seconds. | Steve | **Steve (with Elon's constraint)** | The emotional frame wins ("breathe annually" vs. "drown monthly"), but Elon's clarity constraint is binding: the owner must be able to calculate their bill in three seconds. Steve's "no feature lists" stance is adopted. |
| 8 | **"Time saved" single-line teaser ships.** One line. One smile. Not a dashboard screen. Not a new tracking spec. | Steve | **Steve (within Elon's guardrails)** | Steve proves that clarity prevents silent churn. Elon proves that a screen becomes a sprint. Compromise: a single interpolated line in the digest or existing UI. If it metastasizes into a design debate, it gets amputated immediately. |
| 9 | **Annual billing badge ships.** | Steve | **Steve** | Low engineering cost, high retention signal. Elon's "v2 vanity" argument loses to Steve's "psychological commitment" evidence. Pre-pay = pre-commitment. |
| 10 | **Brand voice: warm maître d', not SaaS changelog.** | Steve | **Steve** | "Your reviews are handled. Your posts went live." Costs nothing. Changes retention. Elon concedes this is "nearly free and high-leverage." |
| 11 | **No A/B testing this sprint.** | Elon | **Both** | Unanimous. Not enough traffic for significance. Steve: "We don't A/B test. We know." Elon: "My gut doesn't replace statistical inference." Agreement: ship the obviously right button. |
| 12 | **Add `(user_id, created_at)` composite index on `insight_actions` for digest query.** | Elon | **Elon** | Trivial cost. At 10K users × ~100 actions/month = 1M rows, the `GROUP BY DATE_TRUNC` query must stay under 12ms. |
| 13 | **Cut the dashboard "time saved" teaser as a standalone screen.** | Elon | **Elon** | Steve's single-line variant (Decision #8) replaces this. A screen becomes a quarter-long initiative. |
| 14 | **Cut custom proration explanation email.** | Elon | **Elon** | If the owner is confused, they use the Stripe Customer Portal. Restaurant owners don't read billing emails; they call support or churn silently. |
| 15 | **Email pipeline must batch sends.** | Elon | **Elon** | Weekly digest at 100x usage will rate-limit the email provider into oblivion if sent synchronously. Batching is table stakes. |

---

## MVP Feature Set (What Ships in v1)

### Core Billing
- [ ] Annual billing toggle (radio button: Monthly vs. Annual) on existing subscription flow
- [ ] Two Stripe price IDs: `localgenius-annual-base` and `localgenius-annual-pro`
- [ ] Stripe webhook handler updated to process annual subscription events
- [ ] Idempotency keys on all Stripe webhook handlers
- [ ] `proration_behavior: 'create_prorations'` — zero custom logic
- [ ] Stripe Customer Portal link for plan changes / cancellation

### Weekly Digest (The Retention Engine)
- [ ] Async job queue for digest generation (not synchronous sweep)
- [ ] Batched email sends
- [ ] SQL query: `GROUP BY DATE_TRUNC('week', created_at)` on `insight_actions` with `(user_id, created_at)` index
- [ ] One key metric + emotional framing per Steve's voice
- [ ] Subject line uses "Sous" brand voice
- [ ] Single-line "time saved" teaser (inline, not a screen)

### Pricing Page
- [ ] Emotional fork framing (no feature grid, no "Pro/Base" labels)
- [ ] Clear annual price visible in < 3 seconds
- [ ] Annual billing badge (commitment signal)
- [ ] Brand voice: warm, confident, never apologetic

### Confirmation / Lifecycle Email
- [ ] Post-purchase confirmation email using partner voice: "You're all set — your reviews are handled."
- [ ] No proration explanation copy

### Brand / Copy
- [ ] All headlines, buttons, subject lines use "Sous"
- [ ] Footer and legal retain "LocalGenius"
- [ ] No "we're excited to announce" language anywhere

---

## File Structure

```
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe.ts              # Idempotent event handler (annual plans added)
│   ├── jobs/
│   │   └── digest.ts                  # Async weekly digest generation + batch email send
│   ├── lib/
│   │   ├── stripe.ts                  # Plan IDs: annual-base, annual-pro
│   │   ├── email.ts                   # Batch send wrapper
│   │   └── digest-query.ts            # GROUP BY DATE_TRUNC with index hint
│   ├── components/
│   │   ├── BillingToggle.tsx          # Monthly vs Annual radio button
│   │   ├── PricingPage.tsx            # Emotional fork, clear price, annual badge
│   │   └── DigestTeaser.tsx           # Single-line "time saved" smile (inline only)
│   └── emails/
│       ├── WeeklyDigest.tsx           # Love note template: one number, one smile
│       └── Confirmation.tsx           # Partner voice: "Your reviews are handled."
├── db/
│   └── migrations/
│       └── 002_insight_actions_index.sql  # (user_id, created_at) composite index
└── config/
    └── brand.ts                       # "Sous" voice constants, LocalGenius legal fallback
```

---

## Open Questions (Blockers for Build Phase)

1. **Legal: Can "Sous" be used as a brand voice/persona in customer-facing copy without trademark conflict?** — If legal chokes, fallback is "Your AI sous chef" as descriptor, never standalone brand.
2. **Metric: What is the "one number" in the weekly digest?** Options: (a) hours saved, (b) customers touched, (c) reviews responded to. Needs product decision before copy finalization.
3. **Stripe Customer Portal: What customization is available?** If we cannot suppress proration detail in the Portal, do we need a one-sentence explanation despite Decision #4?
4. **Email provider: Current rate limit and batch size?** The batching strategy (100/batch? 500/batch?) depends on provider constraints.
5. **Annual plan naming in Stripe Checkout:** Do the checkout line items say "Annual" or do we rely on the Portal? This affects confusion/churn.
6. **Async queue: What job runner?** (Bull, Inngest, existing infrastructure?) This determines the `jobs/` implementation.
7. **Digest timing: What day/time?** Sunday evening? Monday morning? Restaurant industry rhythm matters.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Scope creep: "Time saved" single line becomes a dashboard screen** | High | High | Hard guardrail in decisions.md. If the line requires a new route, new component, or design review, it is cut immediately. |
| **Stripe webhook idempotency not implemented correctly** | Medium | Critical | Code review gate. Must pass duplicate-event simulation test before merge. |
| **Email deliverability: weekly digest marked as spam** | Medium | High | Use batched sends, consistent "From" name ("Sous"), and monitor domain reputation. Fallback to plain text if HTML triggers filters. |
| **Restaurant owners confused by proration in Customer Portal** | Medium | Medium | Monitor support tickets for 14 days post-launch. If >5% of annual conversions generate proration questions, add one sentence to confirmation email (Decision #4 exception). |
| **"Sous" usage creates trademark or legal exposure** | Low | High | Legal review of Decision #2 within 48 hours. If blocked, fallback to "Your AI sous chef" descriptor. |
| **Digest generation fails silently in async queue** | Medium | High | Add dead-letter queue + alerting. Digest failure is a P1 — it's the retention engine. |
| **Pricing page too vague — owners can't calculate cost** | Medium | High | Elon's 3-second rule is binding. User test: show pricing page to 3 non-technical users. If any hesitate on price, revise. |
| **Annual badge + emotional copy feels manipulative** | Low | Medium | Steve's brand voice constraint: "confident, warm, never apologetic." If copy crosses into pressure tactics, Steve has veto. |
| **Engineering ships async infra but design ships sync copy** | Medium | Medium | Weekly digest is the integration point. Both Elon and Steve must sign off on the template before it enters the queue. |
| **10x usage hits before batching is stress-tested** | Low | Critical | Load-test batch email send at 10x volume in staging. If provider rate-limits, implement exponential backoff before prod deploy. |

---

## The Zen Master's Closing Word

> "Elon builds the pipes. Steve builds the poetry. The restaurant owner doesn't care which of you wins — they care that someone else did the work, and that the digest arrived on time."

**Build order:**
1. Infrastructure first (webhooks, idempotency, async queue, index) — Elon leads.
2. Templates second (emails, pricing copy, digest voice) — Steve leads.
3. Integration last — both present at the table.

Ship the machine. Polish the paint. But never forget: the paint is why they stay.
