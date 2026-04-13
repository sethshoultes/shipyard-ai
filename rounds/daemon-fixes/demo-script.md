# Daemon Fixes — Demo Script
## Runtime: 2 minutes

---

**NARRATOR:**
You ever have that dream where you're falling and you wake up before you hit the ground?

[SCREEN: Terminal window. A cursor blinks. The words `git status` appear.]

**NARRATOR:**
This isn't that dream. This is worse. This is the one where you hit the ground and then you have to explain to everyone why the ground is broken.

[SCREEN: Output floods in — `3 files not staged for commit`. Then: `Your branch is ahead of 'origin/main' by 14 commits.`]

**NARRATOR:**
Fourteen commits. Fourteen. Sitting there. Going nowhere. For *days*.

[SCREEN: Cut to GitHub Issues page. Two issues labeled `p0` — high priority. "ReviewPulse Feature Request." "FormForge Integration." Both untouched.]

**NARRATOR:**
And these? P-zero issues. The kind that are supposed to wake you up at 3 AM. Except nobody woke up. Because the daemon — the thing whose *one job* is to watch for these — was looking right at them and seeing nothing.

[SCREEN: Terminal shows: `Found 0 p0/p1 issue(s)`. A pause. The irony hangs.]

**NARRATOR:**
Zero. Two critical issues. Zero found. You know why?

[SCREEN: Code snippet highlights: `--label p0,p1`]

**NARRATOR:**
Because someone wrote "p0 comma p1" like it was a grocery list. And the GitHub CLI said, "I don't know her."

[SCREEN: Terminal runs `gh issue list --label p0,p1`. Returns nothing. Then runs `gh issue list --label "p0"`. Two issues appear.]

**NARRATOR:**
The syntax was wrong. Not dramatically wrong. Subtly wrong. The kind of wrong that passes code review, ships to production, and then sits there for a week doing absolutely nothing while telling you everything is fine.

[SCREEN: Fade to black. Beat.]

**NARRATOR:**
So we fixed it.

[SCREEN: Code diff appears. The old single query crossed out. Two clean queries below it — one for p0, one for p1. A deduplication block merging them.]

**NARRATOR:**
Two queries. Merged. Deduplicated. The daemon now asks the right question, the right way.

[SCREEN: Terminal shows new output: `Found 2 p0/p1 issue(s): ReviewPulse, FormForge`]

**NARRATOR:**
But that was only half the problem.

[SCREEN: Code editor. Scrolls to a function called `gitAutoCommit()`. It's... beautiful. Clean. Well-written.]

**NARRATOR:**
See this? `gitAutoCommit`. Handles dirty files. Commits them. Pushes them. It's elegant. It's ready. It was *never called*.

[SCREEN: Search results: `gitAutoCommit` — 1 result. Definition only. Zero invocations.]

**NARRATOR:**
Someone built the fire escape and forgot to connect it to the building.

[SCREEN: Code diff shows `runHeartbeat()` function. At the bottom, a single new line: `gitAutoCommit();`]

**NARRATOR:**
One line. That's the fix. One function call.

[SCREEN: Terminal. The daemon restarts. Logs scroll: `Running heartbeat...`]

**NARRATOR:**
Watch.

[SCREEN: Log output: `Committed 3 files to great-minds-plugin` — `Pushed 14 commits to origin/main`]

**NARRATOR:**
Three dirty files. Gone. Fourteen stuck commits. Pushed. All of it — automatic. Silent. The way it should've been all along.

[SCREEN: GitHub Issues page refreshes. The two p0 issues now show activity — PRDs generated, status updated.]

**NARRATOR:**
And those orphan issues? They're not orphans anymore.

[SCREEN: Clean terminal. No warnings. No stuck commits. Just a cursor, waiting.]

**NARRATOR:**
Two bugs. Two fixes. Thirty lines of code changed. And the system that was supposed to watch over everything?

[SCREEN: Daemon logs, quiet. One final line: `Heartbeat complete. All systems nominal.`]

**NARRATOR:**
It's finally watching.

[SCREEN: Fade to black.]

**NARRATOR:**
Sometimes the hardest bugs to find are the ones that look like they're working.

[SCREEN: Logo. End.]

---

*Total runtime: ~2:00*
