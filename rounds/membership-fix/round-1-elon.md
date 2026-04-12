# Round 1: Elon's Position — MemberShip Fix PRD

## Architecture: This Is a Find-Replace, Not a Refactor

The PRD is honest: 4,000 lines, ~230 mechanical violations of 4 patterns. This isn't architecture work—it's regex surgery. The "simplest system that could work" is already built; it's just speaking the wrong dialect.

**Position:** This is a 2-hour grep + sed job, not a design problem. Don't overthink it.

## Performance: Non-Issue at This Stage

KV auto-serialization is actually *faster* than manual `JSON.stringify`/`JSON.parse`—you're removing CPU cycles, not adding them. The 114 `throw new Response` replacements are error paths; they don't affect hot paths.

**Real bottleneck:** If this plugin hits scale, it's the KV store itself. Every member lookup is `O(1)` but every "list all members" is loading the entire `members:list` array. At 10K members, that's a 200KB+ blob on every admin page load.

**10x path:** Pagination keys (`members:list:0`, `members:list:1`, etc.) with 100-member chunks. But that's v2.

## Distribution: Wrong Question

This is an infrastructure fix, not a product launch. "Distribution" for a bugfix is: does the plugin work, can Sunrise Yoga use it, can other Emdash sites adopt it?

**The real distribution question:** How do we ensure other plugins don't ship with hallucinated APIs? Answer: a `emdash-plugin-validator` lint rule that catches these patterns *before* code lands.

## What to CUT

**Cut from v1:**
1. **Phase 3 "Wire into Sunrise Yoga"** — This is deployment, not fixing. Separate PRD, separate scope. The fix ships when patterns are corrected and TypeScript compiles.
2. **"Smoke test" success criteria** — Testing should verify the fix, not prove e2e works. That's integration testing and belongs in CI, not a P0 bugfix.
3. **The entire admin Block Kit rewrite** — PRD says "implement admin `page_load` handler" but the file already has admin routes. This is feature creep disguised as a fix. If the admin page was broken by the *same* patterns, fix those. Don't redesign the UI.

**The fix is mechanical.** Any sentence starting with "implement" or "add" is scope creep.

## Technical Feasibility: Yes, With Discipline

Can one agent session build this? **Yes, but barely.**

- 114 `throw new Response` → ~2 min each = ~4 hours if done manually
- ~50 `JSON.stringify` + ~50 `JSON.parse` = ~30 min with bulk replacement
- 14 `rc.user` removals = ~15 min

**Risk:** Agent fatigue. After 200 edits, context window bloat kills precision. The right move: regex-based bulk replace for 90%, then targeted review for edge cases.

**Hard requirement:** TypeScript must compile after fixes. If it doesn't, you've broken type inference somewhere. Build verification is non-negotiable.

## Scaling: KV List Pattern Breaks First

At 100x usage (10K → 1M members):

1. **`members:list` becomes a 20MB blob** — admin page times out
2. **Email rate limiting via KV** — `rate:email:{email}:{window}` creates millions of ephemeral keys
3. **Webhook logs** — unbounded growth, no TTL mentioned

**What doesn't break:** The core member lookup pattern is fine. `member:{encodedEmail}` is O(1) forever.

## The Uncomfortable Truth

This PRD describes a plugin that was **built without ever running against the real platform**. That's a process failure. The fix is mechanical, but the root cause is: someone shipped 4,000 lines of code against a hallucinated API.

**Recommendation:** After this fix ships, institute a mandatory "run it once" gate before any plugin exceeds 500 lines. No exceptions.
