# Sara Blakely Gut-Check: MemberShip v1

## Would a real customer pay for this?

**Yes, but barely.** A yoga instructor wants to get paid for her video library. This does that. But she doesn't care about JWT tokens, webhook kill-tests, or 114 banned patterns. She cares: "Can my students sign up? Do I get the money?" The feature list reads like an engineering resume, not a sales page.

## What's confusing? What would make someone bounce?

- **Email-only auth, no password.** Sounds simple until a member asks "how do I log in?" and there's no clear answer.
- **Price in cents (9900 = $99)** — she'll set it wrong. Guaranteed.
- **The plan has 12 tasks about fixing code.** Zero tasks about making the signup feel magical.
- **Setup requires "webhooks" and ".env files"** — she's out. She teaches yoga at 6am. She's not debugging env vars at 11pm.

## 30-Second Elevator Pitch

"MemberShip lets you charge for your best content. Add it to your site, connect Stripe, and your students can subscribe in under a minute. You keep 100% minus Stripe fees. No coding. No monthly SaaS fee. You built it — you own it."

## What would I test first with $0 budget?

DM five yoga instructors on Instagram. Ask: "Would you pay $200 once to add paid memberships to your website?" If three say yes, ship it. If they ask "what's EmDash?" — you have a positioning problem, not a product problem.

## What's the retention hook?

**Drip content.** That's the only thing that makes her come back. "Your student unlocks Module 3 tomorrow" is a reason to check the dashboard. Everything else is set-and-forget.

But here's what's missing: **no notification when someone joins.** That dopamine hit — "Sarah just became a member!" — is the whole game. She needs to feel like a business owner, not a sys admin.

---

**Bottom line:** The plumbing works. The feeling doesn't. Ship it, but the first update better be that "new member" ping.
