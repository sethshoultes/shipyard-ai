# Sara Blakely Review: Finish-Plugins Phase 1 Plan

**Date:** 2026-04-12
**Reviewed:** Phase 1 Plan + MemberShip PRD
**Verdict:** This plan has promise, but it's missing the customer entirely. Let me be direct.

---

## The Good: You're Fixing Real Problems

You've identified the core issue: plugins were built against hallucinated APIs and don't work. That's honest. Wave 1 (fix banned patterns) is mechanical and necessary—no debate there. You know what's broken, and you have a clear roadmap to fix it.

**The yoga studio owner doesn't care about this.** But she needs it to be fixed first.

The decision to do a kill-test on the webhook (Task 12) tells me someone actually thought about failure modes. That's rare. Most teams ship and pray.

---

## The Problem: This Isn't a Product Plan, It's a Repair Manual

Here's what I see:

1. **You're shipping a plugin, not solving a customer problem.** MemberShip is buried under 12 tasks of technical debit. Where's the moment when the yoga studio owner says "shut up and take my money"?

2. **The essence statement is confused.** You wrote: *"Making people who feel inadequate feel capable."* But then the plan is entirely about fixing broken code, not about enabling that feeling. That's a disconnect.

3. **Task 8 (Brand Voice) is the only nod to customers, and it's in Wave 2.** Everything before it is engineering. That's backwards.

---

## Would a Real Customer Pay for This?

**Honestly? Not yet.**

A yoga studio owner looking for membership management wants to know:
- Can I set up different membership tiers in under 5 minutes?
- Can I gate my best yoga classes for members only?
- Do I get paid automatically?
- What happens if a payment fails?
- Can my members actually sign up without a tech background?

Your plan doesn't answer any of these. It fixes the *infrastructure* that makes these things possible, but it doesn't deliver the *experience* that makes someone want to use it.

---

## What Would Make Them Say "Shut Up and Take My Money"

You need a demo moment. Here's what I'd change:

### The Real Phase 1 Should Be:
1. **Fix Wave 1** (all the banned patterns) — fine, this is table stakes
2. **Create a 60-second setup experience** — Not "wire into Sunrise Yoga." Create a **walkthrough that a yoga studio owner can do in one sitting**
3. **Ship a member-facing signup flow that works** — The first member signup is your money moment
4. **One successful payment end-to-end** — Not three test transactions. One real payment, from a real person, to a real Stripe account
5. **Verify the email arrives** — That's the moment the yoga studio owner feels like it's real

Right now your plan has:
- 51 error fixes
- 12 rc.user removals
- 20 JSON.stringify removals
- But **zero moments where a customer can say "wow, this actually works"**

---

## Engineering Vanity vs. Customer Value

Let me call out what concerns me:

**Pure engineering vanity:**
- Task 6: Unifying version numbers to 1.0.0. A customer doesn't see this. It's necessary, but it's not valuable.
- Task 7: Four documentation files. I'm not saying docs aren't important—I'm saying a yoga studio owner won't read them. They'll read a 2-minute setup video instead.
- Task 9: Build verification (grep all banned patterns). This is hygiene, not value.

**Legitimately valuable:**
- Task 5: Securing the status endpoint. This prevents a data leak.
- Task 12: The kill-test. This proves reliability.
- Task 8: Brand voice. This is the only task that makes the plugin feel *human*.

**Missing entirely:**
- A task that gets a real person to sign up and pay. Until you've done that, you don't know if this works.

---

## Is the Plan Focused on Shipping Something Customers Can Use, or Bikeshedding?

**The plan is 90% repair, 10% product.**

It's not bikeshedding—it's genuinely necessary technical work. But a customer doesn't buy technical work. They buy an *outcome*.

Here's what I'd ask your team:

1. **Can the yoga studio owner set up their first member tier without Slack support?** If not, Task 1-8 don't matter.
2. **Can a member actually sign up and pay?** Not in staging. Not with test cards. With a real card, end-to-end.
3. **Does the yoga studio owner *feel* in control?** Or do they feel like they're using a beta?

---

## The Real Questions You Should Be Asking

1. **Who's your actual user for Wave 1?** Right now it says "Sunrise Yoga" but the plan treats them as a test bed, not a customer. If Sunrise Yoga is your first real user, they should be *driving* the priorities, not following your technical roadmap.

2. **What's the one thing that can fail and kill the product?** You identified webhook failure (Task 12). Good. But what about: member signup flows, payment processing, email delivery, admin UI usability? Are all of these equally tested?

3. **Why are docs (Task 7) a ship blocker but member signup flows aren't mentioned?** A customer will forgive bad documentation. They won't forgive if signup doesn't work.

---

## My Honest Verdict

**This plan gets you to "working," not to "wow."**

It's a solid engineering plan. But I didn't build Spanx by shipping perfect infrastructure. I shipped something that made women feel powerful in 10 seconds.

Your plan gives you technical excellence (Wave 1-3). It doesn't give you product magic (Wave 4).

**Here's what I'd do differently:**

- **Flip the priority:** Start with member signup, then fix the infrastructure around it
- **Task 8 should be Task 1:** Brand voice and customer experience first, everything else serves that
- **Add a "yoga studio owner uses it" task:** Have someone from your team actually try to set up a membership tier and sign up as a customer, without any help
- **One real transaction isn't enough:** Get five real people to sign up and pay. If you can't, there's a problem

---

## Final Word

Your team is competent. Your plan is thorough. But you're solving the wrong problem first.

You're fixing the plumbing. You haven't asked whether the shower *feels good*.

Get to the shower moment in Phase 1. Prove that a yoga studio owner can set up membership, sell a tier, and get paid. Then optimize everything else.

Everything else is engineering.

---

**Sara's Rating:** 6/10

**For:** Technical rigor, risk mitigation, clear waves
**Against:** Missing the customer, treating Phase 1 as cleanup rather than launch, no "wow" moment

**What Would Move It to 8/10:** One real yoga studio owner signs up, creates a membership, and sells it to a real member. Everything before that is preparation. Everything after is scaling.

Ship that first. Then we talk about versioning.
