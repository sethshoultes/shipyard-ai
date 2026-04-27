# Board Review: shipyard-self-serve-intake
**Reviewer:** Shonda Rhimes, Board Member (Narrative & Retention)
**Date:** 2026-04-16

---

## VERDICT: 4/10
Backend infrastructure with no user journey. Missing the humans.

---

## Story Arc: INCOMPLETE

**What exists:**
- Webhook receives GitHub issue
- Validates signature
- Extracts content
- [TODO comment in code]

**What's missing:**
- Where's signup?
- Where's the "aha moment"?
- Where's the payoff?

No user sees this. It's plumbing. Backend validates webhooks → extracts data → stops.

Code says "TODO: Queue async processing tasks: Content analysis, Priority detection, PRD generation, Bot comment response"

**Zero moments that matter to humans.**

---

## Retention Hooks: NONE

**What brings users back tomorrow?**
Nothing. Users don't interact with this.

**What brings users back next week?**
Nothing. This is invisible infrastructure.

**Status notifications?** No.
**Progress updates?** No.
**Email confirmations?** No.
**Bot responses visible to users?** Not implemented.

GitHub user opens issue → silence. No acknowledgment, no progress, no closure loop.

---

## Content Strategy: NO FLYWHEEL

**Content created:** None visible to users.

**Content consumed:** GitHub issue body text (extracted but never surfaces back).

**What users share:** Can't share what they can't see.

**Viral potential:** Zero. Backend code doesn't go viral.

PRD mentions "Bot Responder" - not implemented. Would create content loop:
- User posts issue
- Bot acknowledges
- Bot updates progress
- User returns to check status
- User shares their PRD

**Current state:** User posts → void.

---

## Emotional Cliffhangers: ZERO

**What makes users curious about what's next?**

Currently: Nothing.

User flow ends at issue submission. No acknowledgment. No "Your request is being processed." No "Check back in 10 minutes." No "We're analyzing your request."

Bot response (unimplemented) could create suspense:
- "🤖 Analyzing your request..."
- "Priority detected: P1 (High Impact)"
- "PRD being generated..."
- "📋 Your PRD is ready!"

**Current delivery:** Radio silence.

---

## What This Product Is

Secure webhook listener that:
- Validates GitHub HMAC signatures ✓
- Extracts issue metadata ✓
- Logs everything ✓
- Queues nothing ✗
- Responds never ✗

17/17 tests passing on backend security. Zero user-facing features.

---

## What This Product Is NOT

- Self-serve onboarding
- Visible progress tracking
- User communication system
- PRD delivery mechanism
- Retention engine

Title says "self-serve intake" but there's no serve, only intake.

---

## The Narrative Gap

**Act 1 (Setup):** Missing. No signup, no welcome, no tutorial.

**Act 2 (Conflict):** Exists. User has need, opens GitHub issue.

**Act 3 (Resolution):** Missing. No acknowledgment, no PRD, no closure.

Story stops mid-sentence.

---

## What Would Make This a 9/10

**Immediate (Hours):**
- Bot comments on issue: "🤖 Request received. Analyzing..."
- Priority detection visible: "Classified as P1"
- ETA visible: "PRD ready in ~10 min"

**Short-term (Days):**
- PRD posted as comment or linked artifact
- Status updates during processing
- User tagged when complete

**Medium-term (Weeks):**
- Email notifications at key milestones
- Personal dashboard showing all requests
- Request history with outcomes

**Long-term (Months):**
- Gamification: badges for issues resolved
- Social proof: "47 PRDs generated this week"
- Community gallery: showcase best PRDs

---

## Technical Strengths (Acknowledged)

- HMAC signature validation (prevents forgeries) ✓
- Timing-safe comparison (prevents attacks) ✓
- Rate limit handling (prevents GitHub blocks) ✓
- Circuit breaker (prevents cascading failures) ✓
- Structured logging (enables debugging) ✓
- Error handling (graceful degradation) ✓

**All invisible to users.**

---

## Missing Human Moments

Users care about:
1. **Recognition** - "We see you"
2. **Progress** - "We're working on it"
3. **Delivery** - "Here's your result"
4. **Closure** - "How did we do?"

Deliverables provide:
1. ✗
2. ✗
3. ✗
4. ✗

---

## Score Breakdown

**Story arc:** 1/10 - Backend only, no user journey
**Retention hooks:** 0/10 - Nothing brings users back
**Content flywheel:** 1/10 - Intake exists, output doesn't
**Emotional cliffhangers:** 0/10 - No suspense, no payoff
**Technical execution:** 9/10 - Excellent backend security

**Weighted score:** 4/10

Infrastructure is solid. Product is invisible.

---

## Recommendation

**DO NOT SHIP to users yet.**

Ship to staging. Complete the loop:
- Bot acknowledgment (Act 1)
- Status updates (Act 2)
- PRD delivery (Act 3)
- Feedback request (Epilogue)

Then you have a product with narrative.

Right now: secure pipe. Not a story.

---

**Approved for:** Backend deployment, internal testing
**Blocked for:** User-facing launch, marketing, growth

Make it human. Then make it viral.

—Shonda
