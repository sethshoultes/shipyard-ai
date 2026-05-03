# Steve's Take — Round 2

Elon wants to ship a heartbeat monitor and declare victory. HTTP 200 with a `<title>` tag? That's not verification — it's theater. The bug that cost us six days wasn't a dead server; it was the *wrong build* serving a 200. If we ship v1 without build-id matching, we haven't solved the problem. We've solved the metric.

Elon is right about three things. Retry logic with exponential backoff is non-negotiable — DNS propagation and CDN cache invalidation will kill us otherwise. He's right that we shouldn't scrape `wrangler` CLI output like amateurs. And he's right that building a separate microservice is absurd for v1. A CI step is the correct integration point; I just refuse to let it feel like a cron job.

Where Elon is dangerously wrong is distribution. "Make it impossible to skip" is how you get shadow IT. Engineers disable noisy, ugly checks. At 100x projects, enforcement doesn't scale — desire does. A beautiful tool becomes a ritual. An ugly tool becomes a todo list item that mysteriously stays unchecked.

Elon will say "design is scope creep." But design IS the distribution strategy. If the output is a log dump, people learn to ignore it. If the output is one perfect line — `Canary verified: shipyard.company is you, build a1f2d9` — people remember it. They trust it. They *want* it running.

My non-negotiables:

1. **Build ID verification in v1.** Not v2. Without it we are monitoring liveness, not correctness.

2. **Canary is the product name and voice.** One word. No hedging. Confidence is the feature.

3. **One-line diagnosis.** Exact domain, exact build, exact mismatch. No dashboards. No log archaeology.

Everything else is implementation detail.
