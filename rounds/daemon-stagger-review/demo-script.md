# Demo Script: Daemon Stagger

**Runtime:** 2 minutes
**Tone:** Conversational, urgent, human

---

NARRATOR:
It's 2 AM. You're shipping a campaign. Four AI agents are reviewing your work—Jensen's checking strategy, Oprah's gut-checking the story, Warren's running the numbers, Shonda's stress-testing the narrative.

[SCREEN: Terminal showing `shipyard daemon` launching. Four agent processes spin up simultaneously. Memory graph climbing.]

NARRATOR:
And your server just caught fire.

[SCREEN: Memory spikes to 94%. Red warning: "OOM KILLER ACTIVE." Processes start dying.]

NARRATOR:
Not literally. But close enough. Because you ran all four agents at once, and your 8-gig instance just discovered what "peak memory" actually means.

[SCREEN: Crash log scrolling. The familiar horror of truncated output.]

NARRATOR:
Here's what nobody tells you about AI agents: they're hungry. Not just for tokens. For RAM. For CPU. For every resource your little cloud instance thought it had to spare.

[SCREEN: Cut to clean terminal. New branch: `feature/breathe-batch-agents`]

NARRATOR:
So we taught the daemon to breathe.

[SCREEN: Code diff appearing line by line—the `runBoardReview()` function]

NARRATOR:
Instead of launching Jensen, Oprah, Warren, and Shonda in one frantic Promise.all—

[SCREEN: Highlight the old code: `Promise.all([jensen, oprah, warren, shonda])`]

NARRATOR:
—we run them in pairs. Jensen and Oprah first. Let them finish. *Then* Warren and Shonda.

[SCREEN: New code structure appearing:
```
// Batch 1: Jensen + Oprah
await Promise.all([jensen, oprah]);

// Batch 2: Warren + Shonda
await Promise.all([warren, shonda]);
```
]

NARRATOR:
Same four reviews. Same insights. But now your server can actually *do* it.

[SCREEN: Memory graph—two modest peaks instead of one catastrophic spike. Peak at 47% instead of 94%.]

NARRATOR:
The creative pipeline? Same idea. Jony Ive and Maya Angelou run together—visual and copy, they play well together. Then Aaron Sorkin gets the stage alone, because demo scripts deserve focus.

[SCREEN: `runCreativeReview()` code showing 2+1 batching]

NARRATOR:
We didn't add features. We didn't change signatures. We just... made room.

[SCREEN: Side-by-side comparison. LEFT: Old memory graph—violent spike, crash. RIGHT: New graph—two gentle waves, completion.]

NARRATOR:
Fifty percent reduction in peak memory. Not because we're running less. Because we're running *smarter*.

[SCREEN: Terminal showing successful completion. All four board reviews done. All three creative reviews done. Memory holding steady at 45%.]

NARRATOR:
Your 2 AM deploy? It ships now.

[SCREEN: Green checkmark. `shipyard-daemon.service: active (running)`]

NARRATOR:
Four brilliant minds, reviewing your work. They just learned to take turns.

[SCREEN: Fade to Shipyard logo. Tagline: "Great minds. Better timing."]

---

*End of demo.*
