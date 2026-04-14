# Intake — Demo Script

*Runtime: ~2 minutes*

---

**[SCREEN: Black. A cursor blinks.]**

NARRATOR:
You filed a bug three weeks ago.

**[SCREEN: GitHub issue view. Title: "Search results don't paginate correctly." Label: p2. Status: Open. Last activity: 23 days ago.]**

NARRATOR:
You labeled it. You documented it. You did everything right.

And then... nothing.

**[SCREEN: The issue sits there. Unchanged. A timestamp reads "Last updated: 23 days ago."]**

NARRATOR:
Nobody's ignoring you. That's the thing. The system just... doesn't see you. P0 gets the sirens. P1 gets the standup mentions. But p2? P2 sits in a queue that nobody's checking.

**[SCREEN: A developer closes their laptop. Time-lapse: sun rises, sets, rises again. The laptop reopens. Same issue. Same status.]**

NARRATOR:
And every day it sits there is a day someone's telling you — without saying it out loud — that your work doesn't matter enough.

**[SCREEN: Fade to black. Beat.]**

NARRATOR:
What if the system saw you?

**[SCREEN: Terminal window. Clean. A single command being typed:]**

```
$ systemctl status intake
```

**[SCREEN: Output appears: "Active: running"]**

NARRATOR:
Intake runs in the background. No dashboard. No configuration screen. No "settings" to get lost in. It just... watches.

**[SCREEN: GitHub. A developer adds a "p2" label to an issue titled "CommerceKit checkout timeout on mobile."]**

NARRATOR:
The moment you label something p2 —

**[SCREEN: Split view. Left: the GitHub issue. Right: a terminal showing log output scrolling:]**

```
[14:32:07] INTAKE: Polling repositories...
[14:32:08] INTAKE: Found 3 p0/p1/p2 issue(s) across 2 repos
[14:32:08] INTAKE: Processing issue #35: CommerceKit checkout timeout
[14:32:09] INTAKE: PRD generated → /prds/commercekit-checkout-timeout.md
```

NARRATOR:
— the system inhales it.

**[SCREEN: The log continues, then settles. Quiet.]**

NARRATOR:
No popup. No notification. No "your request has been received and is being processed according to the configured priority matrix." Just... done.

**[SCREEN: File explorer. A new PRD file appears. Clean. Formatted. Ready for review.]**

NARRATOR:
The developer who filed that issue? They don't know Intake exists. They shouldn't have to. They go home. They come back the next morning.

**[SCREEN: Morning. Coffee. The developer opens their laptop.]**

**[SCREEN: A PRD is waiting in their queue. Title: "CommerceKit Checkout Timeout." Fully structured. Ready to assign.]**

NARRATOR:
And their work is already real.

**[SCREEN: The developer's face. The smallest smile. Recognition.]**

NARRATOR:
They didn't configure anything. They didn't request anything. They just labeled an issue and trusted that someone — something — was paying attention.

**[SCREEN: Back to the terminal. The log, quietly running:]**

```
[08:15:02] INTAKE: Polling repositories...
[08:15:03] INTAKE: Found 0 new issue(s). Queue clear.
```

NARRATOR:
And something was.

**[SCREEN: The intake log fades. A single line remains:]**

> "The best infrastructure disappears. It just works."

**[SCREEN: Logo. INTAKE. Then black.]**

NARRATOR:
Intake. Because your work matters — even when no one's watching.

**[END]**

---

*Total runtime: 1:58*
