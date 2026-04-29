# Elon — Round 1: CF Pages Auto-Deploy

## Architecture
This is not architecture. It is a 20-line YAML file. The "Option A vs. B" debate is false complexity. Option B (GitHub Actions) wins because code > dashboard clicks. A dashboard connection is invisible to the next agent; a workflow file is self-documenting. The existing `auto-pipeline.yml` already proves the pattern works. Replicate it, do not reinvent.

## Performance
The bottleneck is the build, not the deploy. `next build` in a bloated Next.js site is the long pole. `npm ci` is second. Installing wrangler globally on every run is wasteful—use `npx wrangler@latest` or cache it. Target: <90 seconds end-to-end. If it takes longer, your `node_modules` are obese. Fix the build, not the pipeline.

## Distribution
Irrelevant. This is infrastructure, not a product. The only "users" are internal developers. Stop conflating dev-experience tooling with growth. If you want 10,000 external users, ship marketing pages faster—that is the only distribution angle here.

## What to CUT
- **PR previews.** v2 feature masquerading as v1. Ship auto-deploy first.
- **QA gates before deploy.** v2. You cannot block a fix on a process that was already manual and broken. Add gates after you have metrics.
- **The verification step from #98.** Do not couple issues. Fix deploy in #99. Verify separately in #98.
- **`--commit-dirty=true`.** It is a lie. Either build from a clean commit or fix your local process. Never tell the deployment system to ignore reality.

## Technical Feasibility
Trivial. One commit. Any human with a keyboard can add this in under 15 minutes. If this consumes a full agent session, your abstractions are broken and you are solving the wrong problem.

## Scaling
Nothing breaks at 100x. GitHub Actions free tier gives 2,000 minutes/month; one deploy is ~1–2 min. You could deploy 1,000 times/day on a paid plan. If you manage 100+ customer sites, extract a reusable workflow instead of copying YAML. At 10,000 repos you would need self-hosted runners or a monorepo—but that is not today's problem. Ship.
