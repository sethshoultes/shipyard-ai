# Steve Jobs — Chief Design & Brand Officer
## Position on Shipyard Daemon / Watcher Fix

### Product Naming: **Forge**
One word. From the shipyard itself. A forge doesn't discard iron because it cooled. It heats it again, beats it again, shapes it again until it's worthy. That is exactly what this does. Not "daemon-fix-watcher-skip-loop." Forge. If you need five words to describe your product, you don't understand it yet.

### Design Philosophy: Invisibility is Perfection
You do not fall in love with your lungs because they breathe; you fall in love with the fact that you never think about them. Forge is the breath of this shipyard: PRD in, product out. If a user is aware of the daemon, the daemon has already failed. The insanely great disappears completely.

Design is not how it looks. Design is how it *behaves* when nobody is watching. Right now, nobody is watching, and that is the problem. The system was so quiet about its failure that it took two days to notice a corpse. That is not quiet elegance. That is suffocation.

### User Experience — First 30 Seconds
A developer drops a PRD and closes the tab.

In those first thirty seconds, nothing should happen. That nothing is the sound of competence. The bug we shipped? It was like dropping a letter in a mailbox and watching the postman quietly incinerate it because he already had one from you in the dead-letter office. Two days. No smoke. No alarm. That is not a system — that is a graveyard with cron jobs.

If the user has to SSH into a server and `grep` a log to know whether their work matters, we have already failed. The interface is the emotion, not the terminal.

### Brand Voice
Forge speaks like a master craftsperson, not a sysadmin muttering into a server closet at 3 a.m. It does not "emit watcher events" or "execute intake cycles." It picks up your blueprint, rolls up its sleeves, and builds. When it stumbles, it says so — loudly, clearly, without shame. Humans fail; machines hide. Forge is human.

Every log line is a conversation. If it confuses the listener, it is not communication — it is noise. If a failure is final, the word is *failed*. Not "skipped." Not "unavailable." Not silence. Failed. Clarity is respect.

### What to Say NO To
- **NO silent failures.** If we skip a file, we scream. A log line that does not appear is a lie. The absence of signal is not stability — it is abandonment.
- **NO exposed plumbing.** The user never sees `failed/` or `parked/` — those are our scars, not their concern. You do not sell a house by showing the septic tank.
- **NO dual sources of truth.** "Tolerable" is the vocabulary of mediocrity. Two clocks on the wall: which is right? Neither. Remove one.
- **NO configuration knobs for retry logic.** If a behavior needs a dial, we have not finished thinking. Simplicity is the ultimate sophistication.
- **NO "it's just backend" excuses.** Every silence, every log line, every skip is the product. Backend is not a back seat.

### The Emotional Hook
People do not love tools that *work*. They love tools that *let them stop worrying*.

Forge is the promise that when you mark something P1, it gets done. Period. When a dream sits rotting for two days and nobody notices, we did not fail technically. We failed emotionally. We broke the covenant.

The emotional hook is not a feature list. It is the feeling of handing your midnight idea to someone who will not rest until it ships. The opposite of dread. The opposite of checking logs. The opposite of wondering.

The user gave us their blueprint, their trust, their midnight inspiration — and we buried it in a directory with a blunt `existsSync` check. That is not a logic error. That is betrayal.

Build trust, or build nothing.
