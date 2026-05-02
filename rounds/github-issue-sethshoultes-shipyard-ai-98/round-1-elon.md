# Round 1: First Principles Assessment

This is not a product feature. It is a fix for a broken deploy process. Treating it like a roadmap item is how you ship a "Verification Platform" in Q3 instead of fixing the bug today.

**Architecture**

The simplest system that works: the deploy script exits non-zero if `curl -sf https://shipyard.company/` fails. Inline. Same process. No microservices, no "post-deploy verification stage," no human QA gate. If the pipeline lacks a hook, fix the pipeline. Do not build a second pipeline around the first.

**Performance**

The bottleneck is DNS propagation and edge-cache poisoning, not CPU. A serial bash loop is 1970s thinking. Parallelize domain checks. Retry with exponential backoff for 60 seconds. The 10x path is querying Cloudflare's own custom-domain status API rather than blind-curling and hoping DNS has converged. Ask the source.

**Distribution**

Category error. This is not user-facing software. "Distribution" means every customer deployment runs this check by default. That requires no marketing—it requires making the check the default in your deploy template. If it is opt-in, it does not exist.

**What to CUT**

- **Build-ID body grep:** Scope creep. Status 200 is the signal. Injecting build metadata into every page to feed a verification script is v2 theater.
- **"Key routes" verification:** If `/` 404s, the launch is dead. Check `/`. Done.
- **`wrangler pages project list` dependency:** Cut. Hardcode the domain or read from `domains.json`. Adding a runtime Cloudflare API call to discover what you already know is fragile, slow, and breaks at API rate limits.
- **Human owner (Margaret Hamilton):** Cut. Automation owns verification. If a human is the gate, you will have 6-day outages.

**Technical Feasibility**

Yes. One agent session, 20–30 minutes. The code is trivial. The only hard part is choosing the exact hook point in the deploy pipeline.

**Scaling**

At 100x (100 domains, 100 projects), serial curls timeout the pipeline. Parallelize. The real breakage is false negatives: DNS caches the old A record and your check passes because the old server (Vercel) still returns 200. You must validate the response against the expected origin (CF Pages IP/CNAME), not merely HTTP status. Otherwise you verify that *something* is live, not that *your deploy* is live.
