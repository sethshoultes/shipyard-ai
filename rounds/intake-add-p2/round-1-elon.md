# Round 1 Review: Expand GitHub Intake to p2

**Reviewer:** Elon Musk — Chief Product & Growth Officer

---

## Architecture: What's the Simplest System?

This PRD is already at minimum complexity. One function, one additional API call, one filter. **Ship it.**

However, the proposed solution has unnecessary allocation. You're creating three arrays then merging. First principles: fetch once with multiple labels OR stream-process into a Set directly. But for 3 labels and ~50 issues max? The optimization doesn't matter. **Premature optimization is the root of all evil.** Move on.

## Performance: Where Are the Bottlenecks?

**Current approach: 3 sequential API calls.** This is O(n) where n = priority levels. At p0-p2, who cares. At p0-p5? Still doesn't matter — GitHub API latency (~200ms/call) dominates.

The 10x path isn't here. It's in the polling interval. If you're polling every 60s and issues sit unprocessed, the bottleneck is human review, not intake speed.

**Real bottleneck:** The daemon restart requirement. You're deploying code changes via systemctl restart. That's downtime. At scale, you need zero-downtime deploys. But that's not this PRD's problem.

## Distribution: How Does This Reach 10,000 Users?

**Irrelevant question for this PRD.** This is internal tooling — it reaches exactly as many users as have GitHub repos configured. Distribution = number of repos × polling frequency.

If you want 10,000 *issues* processed: at 3 repos polling every minute, you'd need ~2,300 issues/repo/day. The GitHub API rate limit (5,000 requests/hour authenticated) becomes the ceiling, not the code.

## What to CUT

**Nothing.** This PRD is already minimal. One change. One file. Clear success criteria.

The deduplication logic? Technically optional if you trust GitHub API not to return dupes across label queries. But the Set is O(1) and defensive. Keep it.

What I *would* cut: the prescriptive code in the PRD. Tell agents WHAT, not HOW. Let them figure out implementation. The "around line 187" comment will be wrong in 2 weeks.

## Technical Feasibility: Can One Agent Session Build This?

**Yes. 100%.** This is a 15-minute task for a human, 5 minutes for an agent. Read file, add line, update log string, run tsc, commit, push, restart. Linear execution path with zero ambiguity.

If an agent can't do this, the agent is broken.

## Scaling: What Breaks at 100x Usage?

At 100x:
- **API rate limits** — 300 repos × 3 labels × polling/minute = 900 calls/min = 54,000 calls/hour. GitHub limit is 5,000/hour. **You're dead at 10x, not 100x.**
- **Memory** — Holding 100x issues in memory before processing. At 1KB/issue × 10,000 issues = 10MB. Irrelevant.
- **Database writes** — If each issue creates a PRD file, you're I/O bound on disk, not this code.

**The fix:** Batch label queries (`label:p0 OR label:p1 OR label:p2`) into single API call. GitHub Search API supports this. Reduces calls by 3x immediately.

## Verdict

**SHIP IT.** This is correctly scoped. No scope creep. No v2 features hiding. Clear exit criteria. The only sin is being too prescriptive about implementation details.

Future consideration: refactor to single batched query when you hit rate limits. Not today.
