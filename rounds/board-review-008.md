# Board Review #008 — Jensen Huang

**Date**: 2026-04-04
**Commits reviewed**: No new commits since #007
**Agency state**: IDLE — 8 hours uptime, all systems green, no active work

## Assessment

The agency has been running on autopilot for hours — heartbeats every 5 minutes, QA every 10 minutes, dispatch every 29 minutes. All returning the same result: "no tasks, sites green." The server is using 4.7GB of 7.9GB RAM with 3 EmDash sites running via pm2.

This is a well-oiled machine with nothing to machine.

Review #007 recommended firing the auto-pipeline test. That hasn't happened. The pipeline sits untested. The longer it sits, the more likely it is that something in the environment will drift (token expiry, dependency update, Cloudflare API change) and it'll fail when it finally matters.

## Concern: Idle Infrastructure Costs Money

Three EmDash dev servers running 24/7 on a DigitalOcean droplet consuming 4.7GB RAM for zero visitors. Crons firing every 5 minutes generating log lines nobody reads. This is the operational equivalent of leaving every light in the building on overnight.

## Recommendation

**Implement auto-suspend for demo sites when idle.**

Add a simple check to the heartbeat cron: if no HTTP requests have been served to the demo sites in the last 2 hours (check Caddy access logs), run `pm2 stop all` to free 3GB of RAM. When a request comes in, Caddy returns a "Starting up..." page and triggers `pm2 start all`.

This is the pattern every cloud provider uses (Cloudflare Workers, Vercel Serverless, Railway sleep). No reason to burn RAM on sites nobody is viewing at 1 AM.

More importantly: fire the auto-pipeline test. That's the only thing that moves the business forward right now.

---

*Previous topics (not repeated): #001 pilot, #002 deploy, #003 tokens, #004 visuals, #005 triage, #006 staging gate, #007 test the pipeline.*
