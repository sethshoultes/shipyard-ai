# Round 1: Elon — Chief Product & Growth Officer

## Architecture
This is a smoke test, not a satellite. The simplest system that works: inject `BUILD_ID` into the HTML at build time, then run a 10-line bash script post-deploy that curls the custom domain and greps for that ID. One GitHub Action step. No microservice. No database. No dashboard. If it takes more than 20 lines, you're architecting for a problem you don't have.

The PRD suggests `wrangler pages project list | grep custom-domains` — this is fragile shell parsing that breaks when CLI output formats change. Harder, better, faster, stronger: read domains from an environment variable or a `domains.json` checked into the repo. Deterministic. Testable. No external API dependencies at verify time.

## Performance
The bottleneck is DNS propagation and CDN cache invalidation, not compute. CF Pages deploys in ~15 seconds; DNS edge convergence can take 60–120 seconds globally. An immediate post-deploy check will flake and generate false failures, which teaches teams to ignore the check.

The 10x path: run checks with exponential backoff (5s, 10s, 20s, 40s), cap total wait at 90s, and parallelize across domains with `xargs -P`. The actual CPU load is zero; we're I/O-bound on network round-trips. A single runner can verify 10 domains in under 2 minutes if parallelized. Sequential checks are the enemy.

## Distribution
This is pipeline infrastructure, not a consumer app. "10,000 users without paid ads" is the wrong frame. Distribution here means template adoption: package this as a reusable GitHub Action in a shared repo so every client project gets it by default. If teams have to copy-paste bash manually, adoption dies at three repos. Make it the default, not an option.

One customer hitting a 404 at launch generates more negative word-of-mouth than ten happy customers generate positive word-of-mouth. Retention is distribution. Bake this into the platform template and let "zero failed launches" become the case study that sells the next client. No ads required — just operational excellence as a moat.

## What to CUT
- **Multi-region probing** — checking from 3 continents is v2 theater. One runner catches DNS mismatches just fine. You don't need geo-redundancy to detect a Vercel 404.
- **Persistent audit logs / S3 storage** — GitHub Actions logs are the log. Compliance paranoia is scope creep. If you need compliance later, add it later.
- **Automatic DNS remediation** — Suggesting or applying DNS fixes is v2. Fail the build, alert Slack, let a human fix it. Automation that touches DNS is automation that can take down production.
- **"Every customer launch" generalization** — Abstracting to a universal platform before shipping it for `shipyard.company` is premature optimization. Ship it selfishly first. Prove it works on your own domain for 30 days before templating it.
- **Human QA gate** — Assigning this to "Margaret Hamilton (QA)" is process theater. If a human must verify every deploy, the system is already broken. Automate it fully. Humans review alerts; they don't do the checking.
- **Body diffing / complex matchers** — The PRD suggests matching "a unique string from the new release." Just grep the `BUILD_ID`. HTML structure changes; build IDs don't. Complex matchers break on refactors and waste debug time.

## Technical Feasibility
Yes. One agent session can build this. It is a single GitHub Action step, a build-time `sed` to inject the ID into a meta tag, and a curl loop. The PRD's suggested bash snippet is 90% of the solution. The remaining 10% is retry logic and timeout tuning. This is a 2-hour task, not a 2-day task. If an agent can't deliver this in one session, the agent is broken, not the scope.

## Scaling
At 100x — say 500 domains across 50 projects — a sequential curl loop in one CI runner becomes the bottleneck. Pipeline time balloons, and you'll hit runner network limits and potentially WAF rate limits on your own origin. What breaks: the naive loop.

The fix is trivial parallelization and optionally decoupling: queue async health checks after deploy, alert on failure via Slack webhook without blocking the pipeline. Don't architect for 100x today, but write the script so swapping the loop for `xargs -P` is a one-line change. Keep the door open without building the hallway.

**Bottom line:** Build the smoke test. Nothing else.
