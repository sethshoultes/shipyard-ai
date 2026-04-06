# Sara Blakely Review: EmDash Plugins v1
## A Customer Obsession Gut-Check

**Reviewed:** Phase 1 Plan + Decisions for MemberShip and Convene plugins
**Reviewed by:** Sara Blakely archetype - founder obsessed with what customers actually need, not what engineers think is elegant
**Date:** 2026-04-05

---

## The Honest Assessment

I love what's *almost* here. You've got the bones of something real. But I see some engineering vanity mixed in with the actual customer magic, and I need to call it out because small business owners are going to vote with their wallet—or more likely, with their silence.

---

## 1. Would a Real Small Business Owner Pay for This? Why or Why Not?

**The answer is: Maybe. But you're banking on charity.**

Let me be specific.

**MemberShip:** A small business owner will pay for this IF—and only if—you answer their real problem:
- Yoga studio owner: "I have 45 clients. Some are serious, some are just showing up. I need to know who's paying and who's ghosting. I need to send 'Hey, your renewal is in 2 days' emails without manually counting. **That's what I'll pay for.**"
- Freelance coach: "I sell 3-month packages. I need my clients to know what they have access to without asking me 47 times. I need to stop sending renewal invoices manually. **That's worth $49/month.**"

**Convene:** This one is trickier. Most small business owners don't run events. They run **one** type of event repeatedly. The yoga studio teacher has weekly classes (not events—that's a false frame). The coach has 6-week cohorts. The fitness studio has drop-in classes.

Convene assumes "event" = a discrete, paid thing with capacity limits. That's maybe 20% of small businesses. The other 80% have recurring revenue models that don't map to "event." I see a product that solves for conferences and workshops, not the day-to-day revenue engine.

**Verdict:** MemberShip has a shot. Convene is solving for the wrong customer.

---

## 2. What Would Make Them Say "Shut Up and Take My Money"?

This is where you have blind spots.

### For MemberShip:
- **"Show me who's actually using their membership"** — Not just "active subscription." A yoga teacher wants to see: "Sarah came to 3 classes this month, haven't seen her in 4 months before that." Or: "This person is paying for premium but never logs in." That's the real pain. You're shipping billing, not intelligence.

- **"Don't make me beg for payment"** — Right now your plan is: member signs up, Stripe handles it, you hope the webhook doesn't fail. But real small business owners have one problem: people forget to renew. The thing that actually matters is: "Send me a reminder 7 days before renewal, then again 1 day before. If they cancel, don't bug them again." You're not doing this.

- **"Stop making me explain to my accountant what happened"** — Small business owners use QuickBooks, Wave, or a spreadsheet. They need exports. CSV of all members (name, email, plan, status, joined date, last payment). Right now? I don't see it in the plan.

### For Convene:
- **"I don't run events. I run classes/sessions/cohorts."** — Stop thinking "event" and start thinking "repeatable thing with fixed capacity and a price." A yoga teacher needs: "I teach 5 classes a week. Class capacity is 12. I want $15 per class." Can Convene do that? Looking at the plan... no. You've built Eventbrite, not the thing small business owners actually need.

- **"Make it dead simple to know if someone paid"** — A coach runs a 6-week cohort for $199. Needs to know immediately: "Did they pay? Are they in?" The current flow: registration → Stripe checkout → webhook → "hopefully confirmed." If one webhook fails silently, you've got a $199 problem and no visibility.

---

## 3. What in This Plan Feels Like Engineering Vanity vs. Customer Value?

**Let me be surgical here.** I see three big problems:

### Problem A: Cursor Pagination Is Table Stakes, Not a Feature

You're shipping "cursor pagination from day one" and making it *locked decision* #4. You're also spending an entire task (phase-1-task-6) to build it and celebrating it.

**Here's the truth:** Cursor pagination is not a feature. It's a competence threshold. You don't deserve credit for it any more than you deserve credit for not burning the office down. Small business owners with 50 members will never hit the KV read limit. They won't notice pagination. They will notice when they search for "sarah" and can't find her.

What they actually need: **Search.** Filter by "active" vs. "cancelled." Sort by "most recently joined." You're building the plumbing and calling it a feature.

The 60-second benchmark for "first event published" is good UX thinking. But cursor pagination at 50 members? That's engineering showing off.

### Problem B: The 60-Second Benchmark Is Solving the Wrong Problem

You've locked in: "Install to first success (event published or plan created) in under 60 seconds."

This is where I'm going to be harsh: **That's not the benchmark that matters.**

The benchmark that matters is:
- **For MemberShip:** "From install to my first paying member" (not "plan created"). That's 5+ steps: install → connect Stripe → create plan → share link → wait for someone to sign up → see them in dashboard. That's not 60 seconds. That's 20 minutes minimum. You're measuring the wrong thing.

- **For Convene:** Same problem. "First event published" is meaningless. The real benchmark is "I created an event, 5 people registered, I got paid, and I know who they are."

What you *should* measure: Time from install to seeing the first successful payment flow work end-to-end. That's probably 30 minutes, not 60 seconds. And that's fine—own it. But right now you're optimizing for a metric that doesn't predict retention.

### Problem C: No Automation—Just Dashboards

You're building admin dashboards to view members, view events, view attendees. You're not building what small business owners actually do with those dashboards: **act on the data.**

Real features:
- "Send reminder email to all members whose plans renew in 7 days"
- "Pause a class if it has 0 registrations"
- "Export attendee list as CSV and send it to my co-teacher"

You're not building any of this. You're building "look at the list." That's engineer-thinking: "Give them visibility, they'll figure out the rest." No. Small business owners need you to take action *for them*.

---

## 4. Is the 60-Second Benchmark Realistic and Important?

**The benchmark is realistic. But it's measuring the wrong thing.**

**Realistic:** Yes. Creating a plan in Stripe takes 30 seconds if you've got the UI right. Publishing an event takes 30 seconds. You can get "plan created" or "event created" in under 60 seconds.

**Important:** No. Here's why:

A small business owner doesn't care if their plan is created. They care if it works. They care if:
- The registration link works
- The Stripe integration actually charges people
- They see the payment in Stripe
- They see the customer in their dashboard
- The confirmation email sends

Right now, you can "create a plan in 60 seconds" but that plan is a ghost until someone actually signs up. You're measuring the install, not the success.

**What should matter instead:** "Can I prove this works with real money before I send it to my customers?" Right now, a business owner has to risk it. No sandbox environment mentioned. No "test mode" guidance. They create a plan, they send the link to a friend, they watch to see if it works. That's the real moment of truth, and it's not in your 60-second benchmark.

**Verdict:** Ship it as planned. But document the real metrics that matter and measure them obsessively. You'll find that most customers need 15-20 minutes to feel confident, not 60 seconds.

---

## 5. What's Missing That a Customer Would Desperately Want?

### Top tier (would block me from using this):

1. **Search / Filter on Admin Lists**
   You've got cursor pagination for 50 members, but you can't search for "all members paying $29/month." This is table stakes. Without it, admin lists are useless decorations.

2. **Test Mode for Stripe Integration**
   Before I send this live, I need to prove it works. Show me how to test the full flow with Stripe test cards. Right now: unclear.

3. **Visibility into Webhook Failures**
   Decision #9 says "You cannot ship payment software on vibes." Perfect. But where does a business owner see failed webhooks? If a webhook fails, do they get an email? Do they see it in the dashboard? The plan says "log alert" and "store in KV for monitoring." That's engineer-speak for "we have it but you can't see it." Make it visible.

4. **Automated Reminders for Payment Failures**
   Stripe doesn't collect payment on day 1? Now what? Crickets. A real system says: "Invoice failed on {date}. We'll retry on {date}. Here's what to do: {link}." You're missing this entirely.

5. **Dashboard Home Page**
   You've got member lists, event lists, settings pages. But where does the business owner go when they log in? What's the first thing they see? "You have 47 active members, $1,200 MRR, next event is Thursday." That's the emotional payoff. Right now, it's just settings pages and lists.

### Tier 2 (would make me choose you over competitors):

6. **QuickBooks / Wave Export**
   "Export members" or "export attendees as CSV" would be huge. Most small businesses do their accounting in QuickBooks or Wave. Make integration easy.

7. **Email Campaign Editor**
   "Send an email to all members who haven't attended in 30 days." You're shipping templates but not the ability to send campaigns. That's a big miss.

8. **Capacity Management UX**
   For Convene: "5 spots left" on the event page is nice. "This class is full, would you like to join waitlist?" is transformative. You're not doing waitlists.

---

## The Blind Spot (Read This Carefully)

Here's what I see when I read this plan:

You're building a **system** (well-architected, good decisions, solid engineering). Small business owners need a **business tool** (something that makes money easier to collect and understand).

The difference:
- **System thinking:** D1 schema, Stripe webhooks, cursor pagination, TypeScript strict mode, E2E tests. All good things.
- **Business thinking:** "Show me my money. Tell me when I'm about to lose a customer. Make it so easy my accountant doesn't have to email me asking questions."

You're 80% there on system thinking. You're 30% there on business thinking.

The dangerous part: You've locked in so many engineering decisions that there's no room to pivot toward business value. You're going to ship a beautifully structured thing that solves for 5% of small business owners' actual pain.

---

## My Recommendation

### Ship this plan, but reframe three things:

**1. Reframe the 60-Second Benchmark**
Stop calling it "install to plan created." Call it "install to first successful transaction and confirmation email sent." Measure it. Probably 15-20 minutes. Own that number.

**2. Add these to the v1 Feature Set (before launch):**
- Search / filter on member lists (by plan, by status, by email)
- Search / filter on event lists (by date, by status)
- Webhook failure visibility (show failed webhooks in dashboard, not just logs)
- CSV export for members and attendees (accountant-friendly format)
- A dashboard "home" page with key metrics (MRR, next renewal, next event, etc.)

**3. For Convene, seriously reconsider the product frame**
If you're targeting recurring classes / cohorts (the real market), rename from "Convene" to something like "CohortsAI" or "ClassPass-for-indie" and redesign:
- "Classes" not "events"
- "Weekly schedule" not "event creation"
- "Capacity management" with waitlist support
- Show: "How many attended? How many paid? Who's dropping out?"

Right now Convene is solving for 20% of the market (discrete paid events). Recurring classes are the real money.

---

## The Thing Nobody Wants to Hear

You've spent enormous energy on technical decisions (Stripe as source of truth, D1 vs. KV, cursor pagination, webhook idempotency). Those are all *correct decisions*.

But correct infrastructure isn't enough. Your customer doesn't care about your architecture. They care about three things:

1. **Does it work?** (Can I trust you with my money?)
2. **Is it easy?** (Can I figure it out in 5 minutes?)
3. **Does it show me what I need to know?** (Can I see my business happening in real time?)

Looking at the plan:
- ✅ Does it work? Yes. The webhook architecture, E2E tests, and Stripe decisions all support this.
- ✅ Is it easy? Mostly. The conversational copy and 60-second benchmark are good moves. But you need search.
- ❌ Does it show me what I need to know? Partly. You've got lists. You're missing the "story" of the business.

---

## Final Verdict

**This plan gets you to 70% of "minimum viable product" for small business owners. You're at 95% on engineering.**

Launch it. Ship MemberShip first (it's more universally valuable than Convene). Get feedback from real customers immediately. You'll be shocked by what they actually want to do with this thing.

And then—this is key—listen more than you build. Every feature not on this plan came from an engineer thinking about elegance. Every feature a customer actually uses will come from you watching what they do.

The 24 tasks in this plan are solid. But the real v1.1 will be built by customers, not project managers.

---

## What I'd Tell You If We Were in a Room Together

"You built the engine. Now you need to drive the car. Stop optimizing the engine and go sell it to ten yoga teachers. Watch them use it. Watch what they struggle with. Write down the exact words they use to describe their problem. Then you'll know what to build next.

Right now, you're guessing. And guessing at customer needs is expensive.

The good news? Your guesses are pretty good. You've got the bones right. You just need to listen."

---

*This review is submitted in the spirit of customer obsession. Everything here comes from the principle that shaped Spanx: **Give customers something so undeniably useful that they can't shut up about it.** This plan gets you 70% of the way there. The last 30% comes from listening, not planning.*
