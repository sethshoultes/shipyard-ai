# Sara Blakely's Honest Customer Review: Intake Auto-Close

**Date:** 2026-04-14
**Reviewer:** Sara Blakely (Spanx founder)
**Subject:** intake-autoclose feature for Great Minds daemon
**Verdict:** SHIP IT. But the packaging nearly killed this.

---

## 1. Would A Real Customer Pay For This?

**YES. Absolutely.**

The pain point is real: You ship a feature, the PRD moves to "completed," and then you have to go close the issue manually. That's friction. It's small friction — maybe 30 seconds — but it's friction *you don't have to have*.

The time/annoyance calculation:
- **Time saved per issue:** 30 seconds (close, verify close, maybe refresh)
- **Frequency:** Every single GitHub-sourced PRD
- **Annual impact:** If you process 200 GitHub issues a year = 100 minutes saved = 1.5 hours

That doesn't sound like much. But here's what matters: **It's a ceremony you eliminate.** You ship something, it's done. No loose ends. No "wait, did I close that?" That's worth money because it's about psychological closure.

A real customer would say: "I want issues automatically closed when they ship. Can you do that?" This is a clear yes.

---

## 2. What Would Make Them Say "Shut Up and Take My Money"?

**The emotional hook:** "When you ship, it's done."

The killer feature isn't the closing—it's the *automation of the moment.* You've hit a psychological nerve: people hate open loops. In GTD (Getting Things Done) terminology, this is clearing the "tickler file." The issue is resolved. It's archived. The automation says: "We acknowledge your work is done."

**The "I can't believe I lived without this" moment:**

Day 1: Developer closes an issue manually, sees the daemon ship the PRD, remembers they need to go close the GitHub issue.

Day 2: Developer ships a PRD, immediately sees the GitHub issue auto-close, and thinks: "Holy shit, it's actually done."

That moment—*that moment*—is worth money because it removes cognitive load at exactly the moment someone is context-switching.

But here's the thing: **The feature itself is simple.** The emotional value comes from it being *invisible*. It should just happen. No alerts, no notifications, no retries visible to the user. Just: issue closed, comment posted, done.

---

## 3. Engineering Vanity vs. Customer Value

**Here's where I got concerned reading these docs.**

The **phase-1-plan.md** is 484 lines. The **actual feature** is:
- 15 lines of function code
- 5 lines of call site code
- 2 regex matches
- 1 gh CLI call

That's 22 lines of actual code.

Everything else—requirements traceability, wave execution, task plans, verification procedures—is process theater. It's well-intentioned process theater. It's *correct* process theater. But it's theater.

**What smells like vanity:**
- 5 tasks across 3 waves to ship a 22-line feature
- Negative scope requirements (REQ-18 through REQ-25) that say "no retry logic, no config options, no async workers" — these are important, but the fact that they need to be listed suggests you're worried about scope creep on a 22-line feature
- A 2-hour planning document to implement a 15-minute feature
- "Wave execution order" and "dependencies" and "critical path" for something that has zero parallelization opportunities

**The honest take:** This is a small feature. It should ship in one afternoon. The planning infrastructure is bigger than the feature.

**Why it matters:** Feature bloat kills fast iteration. If every 22-line feature requires a 5-task plan across 3 waves, you'll never ship fast. You need: code it, test it, ship it. Done in a day.

**However — the good news:** The actual plan is *correct*. The function is well-defined. The requirements are tight. The edge cases are thought through (already-closed issues, non-GitHub PRDs, error handling). This isn't over-engineered code—it's over-planned code. The distinction matters.

**What's NOT under-delivered:**
- Error handling is right (non-fatal, logs but continues)
- Timeout is reasonable (15 seconds)
- Comment is professional (single line, no emojis)
- Scope is locked (no retry logic, no config)

---

## 4. Is The Scope Right?

**Scope is tight. Almost too tight.**

**Should it ship as-is?** YES.

**What I'd ask after shipping:**
1. **Where's the observability for the operator?** The daemon logs "CLOSER: Closed GitHub issue" — but how does an operator know when this is failing at scale? If you process 100 issues a month and 5 close attempts fail silently, you'd never know. I'd want a metric: "Issues closed successfully" vs. "Close attempts failed." But that's *post-launch iteration*, not blocking this ship.

2. **Why not mention the closed issues in the daemon's summary?** When the daemon finishes a run, it could say: "Shipped 3 PRDs, closed 2 GitHub issues, 1 non-GitHub PRD." But again, that's nice-to-have, not blocking.

3. **Should non-GitHub PRDs show up differently?** Currently, non-GitHub PRDs silently skip the close logic. An operator might wonder: "Did the daemon try to close that?" Maybe log "CLOSER: Not a GitHub-sourced PRD — skipping" so it's explicit. Looking at the plan, this is already in step 88. Good.

**What should NOT be added:**
- Retry logic (correct decision)
- Config options (correct decision)
- Async/await instead of execSync (correct decision — keep it synchronous and simple)
- Label changes or other GitHub automation (correct decision — focus on the job)
- Webhook-based triggering (correct decision — use the existing pipeline)

**The missing piece:** The PRD markdown structure. The docs mention the PRD contains `> Auto-generated from GitHub issue {repo}#{number}` but I don't see where this line is set in the intake system. The plan references `health.ts` lines 227-255, which I can't verify here, but this is critical. If that line isn't in the PRD, the regex won't match and issues won't close. This dependency should be verified *before* shipping.

**Scope verdict:** Ship it. But verify the PRD format includes the "Auto-generated from GitHub issue" line before you deploy.

---

## 5. Honest, Unfiltered Take

**What you're shipping:**
A feature that eliminates a manual step and gives people psychological closure when they ship. It's small, it's clean, it's non-invasive (non-fatal error handling), and it does exactly one job.

**What concerns me:**
1. **Process overhead.** A 22-line feature doesn't need 5 tasks. This smells like process bloat that will slow iteration on the next feature. Either lean into a lightweight process or accept that some overhead is necessary. Don't do both.

2. **Dependency risk.** This feature depends on:
   - `gh` CLI installed and authenticated
   - PRD format including the "Auto-generated from GitHub issue" line
   - The GitHub API being up

   All three are documented as risks, which is good. But I'd verify the PRD format is locked *before* you start coding.

3. **Observability gap.** You're not tracking success/failure metrics. Post-launch, add: "GitHub issues closed: X, close attempts failed: Y." This is a small addition and helps operators know if something's broken.

**What excites me:**
This feature gets the fundamentals right. Simple. Non-blocking. Clear error handling. No scope creep. No ceremony. The engineering is tight. The decision-making is good (especially the "no retry logic" decision).

**My recommendation:**
Ship this. Today. Don't wait for three waves. Code it, test it manually with one real issue, deploy it. If you're going to err on process, err on the side of shipping fast. You can always iterate.

**The real test:** After this ships, can you ship the next 22-line feature in 2 hours instead of 2 days? If yes, you've got a system. If no, the process is the problem.

---

## Final Word

You've built something people actually want (automatic closure), you've kept the scope locked (no feature creep), and you've handled error cases gracefully (non-fatal). That's 3/3 on the basics.

The planning is thorough but heavy. Next time, try shipping something this size in a day with less documentation overhead. Then iterate.

Ship it.

---

**Sara Blakely**
*Founder, Spanx*
*"Build what people need, not what you think is impressive."*
