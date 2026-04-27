# Board Review: shipyard-self-serve-intake
**Reviewer**: Oprah Winfrey
**Date**: 2026-04-16

---

## First-5-Minutes Experience

**Overwhelmed.**

New user sees technical architecture, not a welcome mat.

- No README explaining what this does
- No "Quick Start" or "Getting Started"
- Dropped into webhook handlers, HMAC signatures, rate limiters
- Documentation assumes you know why you're here
- Zero onboarding — just implementation files

**What's missing:**
- "Why does this exist?" statement
- User journey map
- Simple setup guide
- What happens after I configure this?

---

## Emotional Resonance

**Cold. Transactional.**

This is infrastructure that processes requests. Nothing more.

- No human voice in docs
- No "thank you for submitting"
- No "we're excited to review your idea"
- Bot responds with... structured data?
- Users = data sources, not people

**Zero warmth. Zero connection.**

Real people submit intake requests. They're nervous, hopeful, excited.
This treats them like API payloads.

---

## Trust

**No.**

Won't recommend until I see:

1. **User-facing experience** — What does submitter actually see?
2. **Error messaging** — How do we tell users something went wrong?
3. **Human touchpoint** — Is anyone actually reading these?
4. **Privacy/security clarity** — What happens to submitted data?
5. **Accessibility statement** — Who can use this? Who can't?

**Red flags:**
- Returns 200 OK even on failures (hides problems from users)
- No user confirmation they were heard
- No timeline expectations set
- No way to check status

---

## Accessibility

**Being left out:**

- **Non-technical users** — Must use GitHub, create issues, apply labels manually
- **People without GitHub accounts** — Can't participate at all
- **Screen reader users** — No indication docs are accessible
- **Mobile users** — GitHub issues on mobile = painful
- **Non-English speakers** — All docs/logs in English only
- **People with cognitive disabilities** — Jargon-heavy, zero plain language
- **Low-bandwidth users** — No lightweight submission option

**Biggest barrier:** Requires GitHub fluency.
Average person can't easily submit requests.

---

## Score: 3/10

**Justification:** Solid infrastructure for developers; terrible experience for humans.

---

## What Would Make This a 10

1. **Public-facing landing page** — Beautiful, simple form. No GitHub required.
2. **Confirmation email/message** — "We got your request. Here's what happens next."
3. **Human language** — Replace technical logs with warm acknowledgments
4. **Status tracking** — "Your request is being reviewed" (public link)
5. **Accessibility-first design** — WCAG 2.1 AA minimum
6. **Multi-language support** — At least submission form
7. **Clear expectations** — "You'll hear back in 2-3 business days"
8. **Empathy training** — For whoever reads intake requests
9. **Alternative submission methods** — Email, phone, chat
10. **Privacy policy** — Plain language, visible upfront

---

## Bottom Line

You built a webhook processor.
You didn't build an intake *experience*.

**The question I ask:** Would my audience feel *seen* using this?

**Answer:** No. They'd feel processed.

**Fix the human layer first.** Then we'll talk infrastructure.

---

**Signed,**
Oprah Winfrey
Board Member, Great Minds Agency
