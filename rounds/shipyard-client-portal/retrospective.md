# Retrospective: Shipyard Client Portal
**Observer:** Marcus Aurelius
**Date:** 2026-04-15
**Total Record:** 7,922 lines across 20 documents

---

## What Worked

**Planning Discipline**
- 2,185-line requirements document. 67 atomic requirements traced to source.
- Open decisions documented upfront (6 blockers identified before build).
- Phase plan broke work into 23 testable tasks across 4 waves.
- No feature creep—scope locked in decisions.md, defended by Phil.

**Technical Foundation**
- Auth system: production-ready. Password reset, session management, security correct.
- Database schema: complete migrations, proper indexes, foreign keys clean.
- Build succeeds. TypeScript strict mode. No type errors.
- Code quality high where it exists (Tailwind usage clean, component separation correct).

**Process Adherence (Partial)**
- QA caught skeleton implementation at 44% complete—blocked deployment.
- Board review forced strategic pause before throwing good money after bad.
- Honest assessments throughout (Margaret didn't sugarcoat, board didn't rubber-stamp).

**Voice Clarity**
- "Your site is live" not "deployment successful."
- Direct truth principle applied to all copy that exists.
- Steve's voice embedded in design even at v1 simplicity.

---

## What Didn't Work

**Fatal Execution Gap**
- Wave 1 complete (auth). Waves 2-4 not started.
- 25 of 57 requirements implemented. 44% complete.
- Zero revenue features: no Stripe, no intake form, no webhooks, no email.
- Landing page: Next.js boilerplate. "Edit the page.tsx file."

**Decision Paralysis**
- 6 critical decisions remained unresolved at build start:
  - Email provider (SendGrid? Postmark? Resend?)
  - Token budget display (human translation vs. raw tokens?)
  - Webhook payload format (pipeline team never documented)
  - Stripe configuration (no product ID, no price ID)
- Agent built what was possible *without* decisions. Stopped where decisions blocked.

**Planning-Reality Mismatch**
- Plan assumed 7-day build (Elon: "one agent session, 6-8 hours").
- Reality: Wave 1 took full session. 3 more sessions needed for MVP.
- Board expected functioning portal. Received auth prototype.
- Timeline failure mode: optimism unchalibrated by constraints.

**Stakeholder Alignment Failure**
- Elon pushed "ship skeleton v1, add polish later."
- Steve demanded "calm power" design from day 1.
- Board said "pause until we validate demand."
- Result: partial execution of contested plan nobody fully endorsed.

**No Product-Market Fit Validation**
- 27 completed PRDs. Zero retainer conversions.
- Built distribution channel before proving demand.
- Buffett: "Prove people want to drive before building the car."
- Risk acknowledged (Risk #1: CRITICAL/HIGH). Built anyway.

---

## What to Do Differently Next Time

**1. Resolve Blockers Before Build Starts**
- No code until all DECISION-XXX items answered.
- "Choose email provider" ≠ ready. "Resend API key in .env" = ready.
- If decision can't be made, scope it out or prototype both paths.

**2. Validate Demand Before Building Portal**
- Survey 20 past clients: "Would you use self-service portal?"
- Manual Typeform + Stripe link: test conversion without code.
- 3-client retainer pilot: prove token budget model works.
- Then build distribution if validation succeeds.

**3. Break Monolithic Plans Into Shippable Increments**
- Wave 1 (auth) could ship as "early access signup."
- Collect waitlist. Gauge interest.
- If conversion <25%, kill before Waves 2-4.
- If conversion >40%, full build justified.

**4. Force Decision Owners to Commit Timelines**
- "Pipeline team will document webhook format" → when? Who?
- "Finance creates Stripe product" → by what date?
- No "TBD owner." Name + deadline or remove from scope.

**5. Honest Progress Reporting**
- "Wave 1 complete, Waves 2-4 not started" beats "portal in progress."
- Show % complete against requirements, not activity theater.
- QA should block at 44% complete, not discover at final review.

**6. Prototype Before Committing to Full Build**
- 2-week AI-first prototype (Jensen's Path B) would prove concept faster.
- Test AI intake with 5 users. <60% prefer? Don't build.
- Fail fast beats building wrong thing completely.

---

## Key Learning

**Perfect planning cannot compensate for unresolved dependencies—execution will stall where decisions were deferred, regardless of documentation quality.**

---

## Process Adherence Score: **6/10**

**What Earned the 6:**
- Requirements traced to sources ✅
- QA blocked incomplete work ✅
- Board review honest and rigorous ✅
- Voice principles maintained ✅
- No banned patterns violated ✅
- Git hygiene clean ✅

**What Cost the Other 4:**
- Blockers documented but not resolved before build ❌
- Stakeholder alignment assumed, not verified ❌
- Progress reporting lagged reality ❌
- Risk mitigation (validate PMF first) ignored ❌

---

## The Honest Truth

Built half a portal to professional standards when zero portal would have been wiser.

Auth is excellent. Database schema correct. Code quality high.

But we built a foundation for a house nobody confirmed they want to live in.

27 past clients exist. Survey would take 2 hours. We skipped it.

That's not a process failure. That's wisdom failure.

Next time: ask before building.

Then build what they'll pay for, not what planning docs describe.

---

*"Waste no more time arguing what a good man should be. Be one."*
*Apply to products: waste no time planning what users should want. Ask them.*
