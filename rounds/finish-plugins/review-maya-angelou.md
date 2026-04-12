# Copy Review — Membership Plugin Documentation

*A review through the lens of language, rhythm, and feeling.*

**Reviewer:** Maya Angelou (in spirit)
**Date:** 2026-04-12
**Materials Reviewed:** README.md, Installation.md, API-reference.md, Configuration.md, Troubleshooting.md

---

## The Truth of It

Child, I have read these documents again—all five of them. Over three thousand lines of instruction. Every endpoint. Every environment variable. Every troubleshooting table.

And I must tell you: this documentation will help someone implement the plugin correctly. It is thorough. It is accurate. It is professionally assembled.

But it does not *move*.

The writing is correct the way a receipt is correct. Complete the way a parts list is complete. It answers every question except the one that matters: *Why should I care?*

When I finish reading, I know what the software does. But I don't feel what it makes possible—the writer who will finally gate her premium content, the teacher who will build a paying audience, the creator who steps from free to sustainable.

Technical writing need not be poetry. But it need not be paperwork, either.

---

## Does the Language Feel Human?

**Verdict: It feels like a system describing itself to other systems.**

The opening line of the README:

> "Email-based membership and gated content plugin for EmDash CMS with full Stripe integration, member dashboard, JWT authentication, email automation, coupon discount codes, drip content, and member portals."

This is not a sentence. It is a comma-separated list of features wearing a period at the end. It answers "what does it contain?" but never "what does it give me?" There is no human here—no one who stayed up late trying to make a living from their knowledge, no one who just wants their work to reach the people willing to pay for it.

The feature lists read like inventory:
- "Flexible membership plans"
- "Stripe Checkout integration"
- "JWT-based auth"

These are facts without feeling. They tell me the shape of the tool but not the weight of what it lifts.

The API Reference—all two thousand lines—speaks in pure transaction. "Request Body." "Response (200)." "Auth: Admin." Necessary, yes. But cold as a contract.

---

## Is There Rhythm in the Sentences?

**Verdict: The rhythm is the rhythm of a metronome—steady, predictable, eventually numbing.**

Consider this from the README:

> "JWT-based auth — Secure httpOnly cookies with JWT tokens (15-minute access, 7-day refresh)"

There is no breath here. No pause that lets understanding settle. Technical parentheticals interrupt what could be a simple truth: *Your members stay logged in. Securely.*

The bullets march:
- Feature — description
- Feature — description
- Feature — description

After ten of these, the eye slides. The mind drifts. Not because the information is unimportant, but because the delivery never changes its pace.

Good prose breathes. It sprints, then walks, then rests. This prose is a constant jog—never tiring exactly, but never exhilarating either.

Look at the Troubleshooting guide. Every solution is presented in the same format:
- Issue | Solution
- Issue | Solution
- Issue | Solution

Helpful? Yes. But it reads like a diagnostic manual, not like a guide written by someone who understands frustration, who has been there at 2 AM with a broken webhook and a deadline breathing down their neck.

---

## Does the Headline Stop You?

**Verdict: Not one of them.**

> "Membership Plugin for EmDash"

This is a label, not a headline. It could be on a file folder. It could be in a database. It does not make me lean in.

> "MemberShip Plugin Installation Guide"

Same energy. A filing cabinet would be proud.

> "Quick Diagnostics"

This one hints at urgency, at help arriving soon. But it's buried deep in the Troubleshooting document, not leading the way.

A headline should promise something. It should imply a before and an after. These headlines imply only: *here is a thing, and here is where it lives.*

---

## Is Anything Trying Too Hard?

**Verdict: Yes—and in the wrong direction.**

The documentation tries too hard to be *complete* and not hard enough to be *clear*.

The API reference is exhaustive—every endpoint, every parameter, every response code, every error message. This is admirable thoroughness. But thoroughness is not the same as helpfulness.

When everything is documented at the same level of detail, nothing stands out. A developer reading this does not know where to begin, what matters most, or what they can safely ignore on first pass.

The feature lists in the README are particularly guilty:

> "Flexible membership plans — Configure unlimited plans with custom prices, intervals (once, monthly, yearly), and features"

The double-dash structure repeats sixteen times. By the fifth one, they blur together. By the tenth, they're wallpaper.

The phrase "production-ready" appears without defining what that means. "Full access" appears without saying full access to *what*. "VIP access" is mentioned but VIP compared to *whom*?

The jargon accumulates: JWT, HMAC-SHA256, webhook, cron, KV store. These are necessary terms. But they arrive without context, without a moment to breathe between the knowing and the not-yet-knowing.

---

## The Three Weakest Lines—Rewritten to Show What They Could Be

### 1. The Opening (README.md)

**Original:**
> "Email-based membership and gated content plugin for EmDash CMS with full Stripe integration, member dashboard, JWT authentication, email automation, coupon discount codes, drip content, and member portals."

**What's Wrong:**
This is a comma-separated list of features masquerading as an introduction. It tells me what the plugin contains but not what it does for me. There is no invitation here, only inventory. It exhausts before it excites.

**Rewrite:**
> "Some of your readers want more. They'll pay for the privilege—if you make it easy. MemberShip handles what happens between their interest and their access: registration, payments, content gates, dashboards. You focus on what you're building. We'll handle who gets in."

---

### 2. The Support Section (Installation.md)

**Original:**
> "For issues or questions: Review the Troubleshooting Guide. Check EmDash documentation. Contact Shipyard AI support."

**What's Wrong:**
When someone reaches this section, they're already frustrated. This reads like three doors closing, not opening. It's the language of deflection, not embrace. It sounds like a voicemail system telling you to press different buttons.

**Rewrite:**
> "Stuck? You're not the first, and you won't be the last. The Troubleshooting Guide answers most questions before you ask them. If it doesn't, we're at Shipyard AI support—and we'd rather hear from you than have you struggle in silence."

---

### 3. The Troubleshooting Header (Troubleshooting.md)

**Original:**
> "MemberShip Plugin Troubleshooting Guide"

**What's Wrong:**
This is a label, not a lifeline. Someone arriving at a troubleshooting guide is having a bad time. They came because something broke. Meet them where they are. Acknowledge the storm before you offer the umbrella.

**Rewrite:**
> "When Things Go Wrong (And How to Make Them Right)"

---

## Summary

| Criterion | Assessment |
|-----------|------------|
| Human language | Functional but sterile. It informs without inviting. |
| Sentence rhythm | Uniform and relentless. No variation in pace or pause. |
| Headline impact | Labels, not promises. They organize; they do not compel. |
| Trying too hard | Exhaustive to the point of exhaustion. Says everything; emphasizes nothing. |

---

## What This Documentation Needs

1. **An opening that welcomes.** Before you explain what the product does, acknowledge who the reader is and what they're hoping to build. Let them feel seen before they feel instructed.

2. **Sentences that breathe.** Vary the length. Let some be short. Others can unspool like ribbon, carrying the reader gently from one understanding to the next. The current prose is a constant jog—never tiring, but never exhilarating.

3. **Headlines that promise.** Not "Environment Variables" but "Setting Up Your Foundation." Not "Error Codes Reference" but "When Things Go Wrong." Name the transformation, not just the topic.

4. **Humanity in the details.** Acknowledge that setting up payment systems is stressful. Acknowledge that broken webhooks are frustrating. Speak to the human, not just the developer. They are the same person.

5. **A sense of what matters most.** In two thousand lines of API documentation, what are the three things someone absolutely must get right? Lead with those. Let completeness serve clarity, not overwhelm it.

---

## A Final Thought

Documentation is teaching. And teaching is relationship.

The best technical writing does not pretend to be something it is not. It does not need metaphors or flourishes. But it does need to remember that on the other side of the screen is a human being—tired, perhaps. Frustrated, probably. Hoping this tool will solve their problem so they can get back to the work that matters to them.

Speak to that person. Not to the code. The code does not need to be convinced.

*When you write, remember: they may forget your syntax, but they will never forget how you made them feel—confused or capable, lost or found.*

---

*Review by: Maya Angelou (in spirit)*
*Date: 2026-04-12*
