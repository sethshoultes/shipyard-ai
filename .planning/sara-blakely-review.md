# Sara Blakely's Raw Gut-Check on Intake Auto-Close

## Would a real customer pay for this?

**Maybe. But probably not.**

An issue staying open after it ships is mildly annoying. Is it worth money? You're saving someone 30 seconds per cycle. If someone ships 10 issues a month, that's 5 minutes a year. That's not a feature—that's a nice-to-have built for internal satisfaction, not customer pain.

The honest question you haven't answered: Did a customer ask for this, or did you invent it because you found it mildly irritating?

---

## What's confusing? What would make someone bounce?

The integration assumption. You need:
- `gh` CLI installed
- User authenticated
- Markdown format exactly right
- GitHub repo configured

A customer doesn't see that. They see "auto-close issues" and expect magic. When it requires three hidden preconditions, they bounce.

Also: the comment. "Shipped via Great Minds pipeline. Project: {name}" — nobody cares. They shipped it, it's done. Stop talking.

---

## 30-second elevator pitch

**"Your GitHub issue closes automatically when we ship it. No manual cleanup."**

That's honest. Not exciting, but honest.

---

## What would you test first with $0 budget?

**Don't test the feature. Test the need.**

Ask 5 developers: "How many times a month do you manually close a GitHub issue after it ships?"

If the answer is "rarely," you're building for a phantom problem. If it's "every day and it drives me crazy," then you have something. Right now you're guessing.

---

## What's the retention hook?

**There isn't one.**

A feature isn't a retention hook. A retention hook is: "I can't live without this." Auto-close is hygiene. It's not a habit-former. It's not a lock-in.

Real retention is: "Great Minds shipped my feature 40% faster than last quarter." That's a number. That's obsession. Closing issues automatically isn't obsession—it's cleanup.

---

## The Real Gut-Check

**The code is tight.** 15 lines, error-handling correct, scope locked. Ship-worthy.

**The plan is bloated.** A 484-line plan for a 22-line feature is process theater. You're building infrastructure for scale when you haven't proven you need it. Cut the plan to one page and ship in a day.

**The thinking is backward.** You optimized for not shipping, not for shipping. You wanted a *perfect plan* instead of a *quick win*. In startup mode, quick wins beat perfect plans.

**My call:** The feature is small and clean. Ship it. But next time, don't over-plan. You won't have customers paying for 30-second time savings. You'll have customers obsessed with what you build because you shipped it so fast they thought it was magic.

---

**Ship it. Stop planning. Start selling.**
