# Sara Blakely Gut-Check — Phase 1 Plan

- **Verdict**: Overdressed for a first date. Strip it down.
- Customer is the developer at 2am asking "did my deploy stick?". They won't pay cash, but they'll pay attention if it saves a panic attack.

**Confusing / Bounce-worthy**
- 3 waves, 4 tasks, traceability matrices. Smells like consulting, not shipping.
- `domains.json` is another config file to rot. One more thing to lie to you.
- DNS CNAME + CF-RAY header + HTTPS GET + parallel-ready. Too clever for v1. Pick one check that hurts if it breaks.
- Testing against `vercel.com` as a negative case? That's not your product. Test your own broken state.

**30-Second Pitch**
> "Proof is the green light after deploy. One command tells you your domain actually points to Cloudflare, not your old host. No dashboards. No guessing."

**$0 Marketing Budget — Test First**
- Break your own DNS on purpose. Point `shipyard.company` somewhere wrong. Run the script. Did it scream loud enough to wake you up? If not, fix the error message, not the architecture.
- Ask one engineer who didn't write this to read the failure output. If they need a README, you failed.

**Retention Hook**
- Deploy anxiety. Developers will keep using it because "last time I didn't check, I looked like an idiot for 3 hours." The hook is fear, not delight. Own that.

**One Hard Truth**
- If the deploy step already passes, people assume it worked. Proof only wins if it catches the edge case where deploy passes but domain is wrong. Your plan spends 200 lines on process and 2 lines on that edge case. Flip the ratio.
