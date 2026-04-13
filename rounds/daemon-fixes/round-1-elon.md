# Round 1 — Elon Musk (Chief Product & Growth)

## TL;DR
This isn't a PRD. It's a bug fix ticket. Two lines of code. Ship it in 15 minutes.

---

## Architecture: What's the simplest system that could work?

The simplest system already exists. We're not building anything—we're calling a function that's already written and fixing a CLI syntax bug. The PRD is overcomplicated for what's needed:

1. Add `gitAutoCommit();` to end of `runHeartbeat()`
2. Split `--label p0,p1` into two calls, dedupe

Done. The architecture is fine. The execution was broken.

**Concern:** Why does `gitAutoCommit()` exist but was never wired up? This suggests the daemon was shipped incomplete. Need a code review checklist that catches "function defined but never called."

## Performance: Where are the bottlenecks?

Current bottleneck is **zero throughput**—the system doesn't work. After fix:

- Two `gh issue list` calls instead of one = ~2x latency on that operation (~15 sec worst case)
- Acceptable for a 5-minute polling interval
- Real bottleneck will be upstream: agent capacity, not intake speed

**10x path:** Not relevant here. This is infrastructure maintenance, not a growth lever.

## Distribution: How does this reach 10,000 users?

It doesn't. This is internal tooling. Daemon stability = developer velocity = faster feature shipping = faster user acquisition through actual products.

Stop treating internal bug fixes like they need distribution strategies.

## What to CUT

The PRD itself is scope creep for a bug fix. 107 lines to describe 2 changes. Here's what we cut:

- ❌ Detailed success criteria with checkboxes — just verify it works
- ❌ Lengthy code blocks showing before/after — diffs are clearer
- ❌ Restart instructions — standard deployment knowledge
- ❌ "Notes" section saying "don't refactor" — implied by "fix bug"

**Rule:** Bug fix PRDs should be <20 lines. Issue → Root cause → Fix → Done.

## Technical Feasibility: Can one agent session build this?

Yes. Trivially. One agent session could do this in under 10 minutes:
1. Read `health.ts` (~2 min)
2. Add one line to `runHeartbeat()` (~1 min)
3. Replace the label query block (~3 min)
4. Test with `gh issue list` commands (~2 min)
5. Commit + push (~1 min)

This should have been fixed the moment it was discovered. The fact it's been "the permanent state for days" is the actual problem.

## Scaling: What breaks at 100x usage?

At 100x repos (not 2, but 200):
- Sequential `gitAutoCommit()` becomes slow — need parallel execution
- Two `gh issue list` calls per repo = 400 API calls per heartbeat — will hit rate limits
- Fix: Batch by org, use GraphQL API, implement backoff

But we're at 2 repos. Premature optimization is a worse sin than the current bugs. **Fix the bugs, ship it, measure, then scale.**

---

## First-Principles Summary

1. **The system was built but not connected.** This is a checklist failure, not a design failure.
2. **CLI behavior variance bit us.** `--label a,b` vs `--label a --label b` is gh version-dependent. Pin versions or test on target.
3. **14 unpushed commits sitting for days is a process failure.** Why wasn't this caught by monitoring?

**Ship velocity > document velocity.** This fix should take 15 minutes, not a PRD review cycle.
