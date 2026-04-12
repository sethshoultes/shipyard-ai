# Round 1: Elon Musk — EventDash Fix Review

## Architecture: This Is Already Simple — Don't Overthink It

The PRD is correct: this is a **mechanical find-and-replace** across 5 banned patterns. That's it. No architectural decisions needed. The business logic (events, RSVPs, Stripe, waitlists) already works. The KV store is the right abstraction. Block Kit for admin UI is the right abstraction.

The system that could work: **the one that already exists, minus 443 syntax errors**.

## Performance: Wrong Question for This Ticket

There are no performance bottlenecks to solve here. We're fixing API transport patterns, not optimizing hot paths. If you want 10x, that's a v2 conversation about:
- Batch KV reads for event lists
- Edge caching for public event pages
- Denormalizing registration counts

But none of that matters if the admin page shows "Failed to load." Fix the blocker first.

## Distribution: Irrelevant to This Ticket

This is a bug fix, not a product launch. EventDash is a plugin for Emdash users. The distribution question belongs in the Emdash core GTM, not here. If we're asking "how does a plugin reach 10k users" — the answer is: **be the default plugin in the Emdash starter template**. That's it. But again, wrong conversation for a p0 bug fix.

## What to CUT

The PRD is disciplined. I see no scope creep. The explicit "do not rewrite" and "do not add features" instructions are correct.

**One thing to cut:** Phase 3 (Sunrise Yoga integration) should be a separate PR. Mixing a bug fix with integration work creates review friction and deployment risk. Ship Phase 1-2, verify, then wire it up.

## Technical Feasibility: Yes, One Session Can Build This

Let's do the math:
- 121 `throw new Response` → mechanical replacement
- 153 `JSON.stringify` in kv.set → remove wrapper
- 153 `JSON.parse` on kv.get → remove wrapper
- 16 `rc.user` → delete blocks
- Unknown `rc.pathParams` → replace with `rc.input`

Total: ~450 pattern replacements in one file (`sandbox-entry.ts`). This is 2-3 hours of focused work for an agent that understands the patterns. The PRD gives exact before/after examples. No ambiguity.

**Risk:** The admin Block Kit handler needs careful testing. Form submission flows have state. But the PRD's example code is explicit enough to implement.

## Scaling: What Breaks at 100x?

Not relevant for this ticket, but since you asked:

At 100x usage, **KV key design breaks**. Storing `events:list` as a single array means:
- Every read loads all events
- Every write rewrites all events
- No pagination
- Conflict risk on concurrent writes

The fix: index by event ID (`event:{id}`), maintain a separate index (`events:index` with IDs only), paginate reads. But this is **v2 architecture** — don't touch it now.

## Verdict

**Ship it.** The PRD is tight. The scope is correct. The work is mechanical. The only change I'd make: split Phase 3 into its own PR.

Stop planning. Start replacing patterns.
