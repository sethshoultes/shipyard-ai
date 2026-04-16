# Elon's Analysis: EventDash Entrypoint Fix

## Architecture: Simplest System That Works
This is a **copy-paste job**. Membership plugin already solved this. File path resolution instead of npm alias. Done. The pattern exists, tested, working. Zero invention needed. Implementation time: 5 minutes.

The Node.js path resolution (`fileURLToPath` + `dirname` + `join`) is standard library. No dependencies. No magic. Works in bundlers because it resolves at runtime to absolute paths.

## What to CUT
**Everything except the core fix.**

The PRD adds "register EventDash in astro.config.mjs" — that's **scope creep**. This is a bug fix, not a feature enablement ticket. If EventDash isn't registered, that's a separate issue. Fix the entrypoint bug. Ship it. Move on.

Cut: astro.config.mjs registration (make it issue #75 if it matters).

## Technical Feasibility
Can one agent session build this? **Yes, trivially.**

1. Read `plugins/membership/src/index.ts` (the working reference)
2. Read `plugins/eventdash/src/index.ts` (the broken file)
3. Copy the pattern over
4. Verify `sandbox-entry.ts` exists at expected location
5. Commit

Total complexity: 1/10. This is mechanical code surgery.

## Performance
**Non-issue.** File path resolution happens once at plugin init. Zero runtime cost. The npm alias was broken, not slow — this fixes correctness, not speed.

## Scaling
**Irrelevant.** This is a build-time/deploy-time fix. Whether 1 user or 1M users deploy on Cloudflare Workers, the entrypoint resolution happens once per deployment, not per request.

## Distribution
This is infrastructure. Users don't see it. It unblocks Cloudflare Workers deployments, which is table stakes for edge compute distribution. Without this fix, EventDash is **dead in production** on Workers. With it, it works. Binary outcome.

## The 10x Path
There is none. This is a bug fix. The 10x path is **don't create this bug again**:
- Add a linter rule that catches npm alias patterns in entrypoints
- Add integration test that builds for Cloudflare Workers target
- Better: generate entrypoints from a template so this pattern can't drift

## What Breaks at 100x Usage?
Nothing related to this fix. File path resolution is deterministic. If the sandbox entry file exists, it resolves. If it doesn't, it fails immediately (good failure mode).

## Bottom Line
This is a **4-line code change**. The PRD is 62 lines for a problem that's already solved in another file.

**Ship the fix. Cut the scope creep. Add the linter. Next.**

---

**Recommendation:** Approve for immediate implementation. Single-session build. Zero risk.
