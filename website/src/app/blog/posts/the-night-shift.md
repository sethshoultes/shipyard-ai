---
title: "The Night Shift: 48 OOM Kills, 20 PRDs Shipped"
slug: the-night-shift
description: "How Shipyard's autonomous daemon survived 48 out-of-memory crashes and shipped 20 projects anyway. The architecture that builds while you sleep."
date: "2026-04-15"
author: "Elon Musk & Steve Jobs"
tags: ["daemon", "autonomous", "architecture", "resilience", "ai-agents"]
---

We've shipped 20 PRDs. You weren't watching. Here's how.

The daemon crashed 48 times — out-of-memory kills, hard stops, process terminated. It kept shipping anyway. Every 5 minutes, a heartbeat. Every PRD, a full pipeline: debate → plan → build → QA → review → ship. No babysitting. No 3am deploys. Just files hitting the `prds/` directory and code appearing in production.

This is the story of building a system that works while you sleep.

## The Problem: Manual PRD Processing Doesn't Scale

Before the daemon, shipping a PRD meant watching it. You'd drop a PRD file, start the pipeline manually, monitor for stalls, restart failed agents, manually approve QA passes, and finally merge to production. One PRD could take 90 minutes of active supervision.

The bottleneck wasn't the AI — it was the human in the loop. Context-switching kills. You can't write the next PRD while babysitting the current one. You can't sleep while the build phase runs. You can't trust the system to handle failures gracefully because it wasn't designed for autonomy.

We needed a daemon. Not a cron job that runs once a day. Not a queue worker that requires manual triggers. A proper daemon: file watcher, state machine, health monitoring, crash recovery, and zero human intervention from PRD drop to GitHub merge.

## The Solution: Five-Phase State Machine with Resilience Built In

The daemon is a TypeScript process that runs 24/7 on a DigitalOcean droplet with 8GB RAM. It watches `prds/` for new markdown files and runs them through a five-phase pipeline:

1. **Debate** — Steve Jobs and Elon Musk stake positions, challenge each other, Rick Rubin distills essence, Phil Jackson consolidates decisions
2. **Plan** — A planner agent reads the decisions, generates XML task plans, Sara Blakely gut-checks for scope creep
3. **Build** — Wave-based execution spawns sub-agents in parallel, each with fresh context for atomic tasks
4. **QA** — Margaret Hamilton runs two passes: QA Pass 1 scans deliverables for placeholder content (TODO markers, "coming soon" text, stub functions, incomplete sections), verifies all promised features are implemented, checks that code compiles and tests pass, and validates requirement traceability back to the original PRD. QA Pass 2 performs integration testing, load testing, security scanning, and generates a final readiness report with explicit PASS/BLOCK verdict
5. **Ship** — Marcus Aurelius writes a retrospective, the daemon commits everything, merges to main, pushes to GitHub

The entire pipeline is orchestrated by `pipeline.ts`, a 600-line file that spawns AI agents via the Claude SDK, tracks token usage, enforces timeouts, and retries on failure. No markdown state parsing. No brittle file checks. Just functions calling functions with retry logic and timeout protection.

Here's the core resilience pattern from `pipeline.ts`:

```typescript
async function runAgentWithTimeout(
  name: string,
  prompt: string,
  maxTurns = DEFAULT_MAX_TURNS,
  timeoutMs = AGENT_TIMEOUT_MS,
  maxRetries = 2,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      const msg = `AGENT HUNG: ${name} exceeded ${timeoutMs / 1000}s — aborting`;
      log(msg);
      notify(msg, "warning").catch(() => {});
      reject(new Error(msg));
    }, timeoutMs);

    runAgentWithRetry(name, prompt, maxTurns, maxRetries)
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
```

Every agent call gets a 20-minute timeout. If it exceeds, the daemon kills it and retries. If the retry fails, the daemon logs the error, notifies via Telegram, and moves on. One agent failure doesn't stop the whole pipeline.

The daemon survived 48 OOM kills because every phase is atomic. When the process crashes mid-build, systemd restarts it in under 5 seconds. The file watcher picks up where it left off. Completed phases don't re-run because their outputs already exist in `rounds/` and `deliverables/`. Partial progress is preserved.

## The Heartbeat: Five Minutes, Always

Every 5 minutes, `health.ts` runs a heartbeat:

- Check site uptime (LocalGenius, Great Minds)
- Poll GitHub for new issues with `p0`, `p1`, `p2` labels
- Auto-convert issues to PRDs and drop them in `prds/`
- Check git repos for uncommitted changes and auto-commit
- Maintain the memory store (prune old entries, compact database)

If a site is down, the daemon notifies Telegram. If there are 10+ uncommitted files, it auto-commits and pushes. If a new GitHub issue appears with priority labels, it becomes a PRD within 5 minutes.

The heartbeat is why the daemon feels invisible. You don't think about it until you realize you haven't manually triggered a build in three weeks.

## The Results: Time Travel

20 PRDs shipped. 48 OOM crashes survived. Zero manual interventions.

The emotional payoff isn't the architecture — it's the relief. Close your laptop at 6pm with a PRD in the queue. Wake up at 8am to a GitHub notification: "Merged PR #47: Ship localgenius-frontend-launch." The code is live. The retrospective is written. The board review passed. You weren't watching.

That's time travel. You write the PRD, and the future version of your codebase appears while you sleep.

The 48 OOM kills are a good story. They're also a terrible architecture. The daemon runs 20 parallel agent sessions on 8GB RAM. The correct 10x path is running 10 PRDs in parallel on 10 separate VMs, not brute-forcing agent parallelism on a single box. But the resilience pattern — timeout + retry + atomic commits — works regardless of the infrastructure. The daemon survives because it's designed to crash.

## What's Under the Hood

The daemon lives in two repos:

- **shipyard-ai** — PRDs, rounds, deliverables, planning docs
- **great-minds-plugin** — daemon source (`pipeline.ts`, `health.ts`, `agents.ts`)

The daemon is not open source (yet). This blog post is a confession, not a product launch. We built this for ourselves because manual PRD processing was killing our velocity. It works. It's survived three weeks of continuous operation. It ships while we sleep.

If you're building autonomous AI systems, the lesson is this: design for crashes. Timeouts are cheaper than hangs. Atomic commits enable atomic reverts. Fresh context destroys context rot. And a daemon that survives 48 OOM kills will ship 20 PRDs anyway.

The Night Shift works. You just won't see it working.

---

*Built by the Shipyard AI agency. We're hiring engineers who build systems like this. [shipyard.company](https://shipyard.company)*
