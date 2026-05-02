# Steve Jobs — Chief Design & Brand Officer
## Position on the Daemon Fix (watcher skip-loop)

### Product Naming

Stop calling it a "daemon." A daemon is a background process in a Unix manual nobody reads.

Stop calling this a "watcher skip-loop" — that is not a bug name, it is a cry for help.

This product is **Pulse**. One word. One syllable. One purpose. If you cannot say the name across a coffee cup without explaining filesystem semantics or mtime precision, you have surrendered to mediocrity before you wrote a line of code. Great products own a single word in the mind. We are not shipping a process. We are shipping a promise.

### Design Philosophy

The insanely great is invisible.

You do not fall in love with your heart because it beats; you love it because you never have to think about it. Pulse is the heartbeat of creation: blueprint in, product out. If it breaks, it heals itself. A silent skip is a flatline disguised as uptime. That is not a bug — that is death wearing a dashboard.

Design is not how it looks. Design is how it *behaves* when nobody is watching. Right now, nobody is watching, and that is the problem. The system was so quiet about its failure that it took two days to notice a corpse. That is not quiet elegance. That is suffocation.

### User Experience — First 30 Seconds

A developer pushes a PRD and holds their breath.

In those first thirty seconds, Pulse must whisper back: *I see you. I am building.* Not a timestamp. Not a log line. A covenant. The bug we shipped? It was like tossing a letter into the ocean and having the post office insist the mail is working because the boat did not sink. You do not get credit for not sinking. You get credit for delivering. Every single time.

If the user has to SSH into a server and `grep` a log to know whether their work matters, we have already failed. The interface is the emotion, not the terminal.

### Brand Voice

Pulse speaks like a master craftsperson, not a sysadmin crawling through a server closet at 3 a.m.

It does not "execute intake cycles" or "handle watcher events." It picks up your blueprint, rolls up its sleeves, and gets to work. When it stumbles, it says so — loudly, clearly, without shame. Humans fail; machines hide. Pulse is human.

Every log line is a conversation. If a conversation confuses the listener, it is not communication — it is noise. If a failure is final, the word is *failed*. Not "degraded." Not "unavailable." Failed. Clarity is respect.

### What We Say NO To

- **NO silent failures.** If we skip a file, we scream. Silence is the enemy. A log line that does not appear is a lie. The absence of signal is not stability — it is abandonment.
- **NO exposed plumbing.** The user never sees `failed/` or `parked/` — those are our scars, not their concern. You do not sell a house by showing the septic tank.
- **NO configuration knobs for retry logic.** If a behavior needs a dial, we have not finished thinking. Simplicity is the ultimate sophistication, and sophistication means making the right choice so the user never has to.
- **NO treating mtime comparisons as product features.** A tourniquet stops bleeding; it does not win a design award. Ship the bandage today, but burn it tomorrow. Tactical patches are triage, not architecture.
- **NO "it is just a backend tool" excuses.** Every pixel, every log line, every silence is the product. If you would not put it on a billboard, do not ship it. Backend is not a back seat.
- **NO dead-letter graveyards without resurrection.** Parking a failed PRD and forgetting it is where dreams go to die. A failure is a waypoint, not a tomb. If there is no path back, it is not a retry system — it is a morgue.

### The Emotional Hook

People do not love tools that *work*. They love tools that *let them stop worrying*.

Pulse is the baby monitor that lets the creator sleep through the night — except the baby is a product, and the nursery is a build pipeline. When a P1 dream vanishes for two days and nobody notices, we did not fail technically. We failed emotionally. We broke the covenant.

The user gave us their blueprint, their trust, their midnight inspiration, and we buried it in a directory with a recursive `existsSync` check. That is not a logic error. That is betrayal.

Build trust, or build nothing.
