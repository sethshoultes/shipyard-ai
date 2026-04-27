# Board Review — Jensen Huang

## Verdict: 4/10
Solid plumbing. Zero acceleration. We shipped Stripe Checkout with extra steps.

---

## Moat & Compounding

- No moat. Stripe + Resend + D1 wrappers are not defensible.
- Health badges (green/yellow/red) are table stakes. Every uptime monitor does this.
- Data is orphaned. Health check history is discarded ("latest result only"). No trend lines, no failure prediction, no baseline learning across customer sites.
- What compounds? Nothing in this spec. Customer count linearly scales effort. Support load scales linearly too.

## AI Leverage

- Product is called "Shipyard AI." Where is the AI?
- Health checks: deterministic HTTP pings and SSL date parsing. A cron job from 1999 does this.
- No LLM-powered site audits. No generative fix suggestions. No anomaly detection on Lighthouse volatility.
- No AI customer support. No semantic routing of "Request Change" portal submissions.
- Missed opportunity: Train a small model on health snapshot deltas → predict SSL lapses, traffic drops, broken deployments before they happen.

## Unfair Advantage Not Built

- **Predictive health engine.** Aggregate uptime/SSL/Lighthouse across all Shipyard sites. Learn normal vs abnormal patterns. Alert customers before failure. That is a moat.
- **Automated remediation.** SSL expiry detected → auto-renew via Let's Encrypt integration. Broken link found → generate patch suggestion via LLM. Charge 10x for "Autopilot" tier.
- **AI-powered redesign pipeline.** Day-180 "refresh" email should include AI-generated before/after mockups, not just text.
- **Vertical data flywheel.** Every site health check improves the model for every other site. Network effect = platform.

## Platform vs Product

- Current state: Product. Linear transactions. Customer pays for manual peace of mind.
- Platform requirement: Third-party developers build on Shipyard health data.
- Missing:
  - Public API for health scores
  - Webhook marketplace (notify Slack, PagerDuty, Zapier when status flips)
  - Partner plugin system (LocalGenius, SEO Package should be external integrations, not hardcoded cards)
  - Agency multi-tenancy (one dashboard managing 50 client sites)
  - White-label portal (agency rebrands Shipyard infrastructure)

## Specific Cuts I Disagree With

- "No 0-100 health score gradient" — cowardly. The gradient is not the risk. The risk is building it without AI interpretation. A score without prediction is vanity. A score with prediction is product.
- "No tracking tables" — we threw away the data asset to save a migration. Open/click data trains engagement models.
- "Auth is a product, not a feature" — wrong framing. Auth is a cost center. But *identity* is platform infrastructure. Cut passwords, keep identity.

## What Would Make This a 9/10

1. Replace deterministic health checks with a lightweight prediction model running on Cloudflare GPU Workers.
2. Surface AI-generated remediation suggestions in portal, not just badges.
3. Ship a `/health` API endpoint. Let agencies and tools subscribe. Network effects begin.
4. Turn lifecycle emails into a conversation interface. Customer replies to Day-7 email → LLM parses intent → creates structured ticket → routes to Shipyard or self-heals.
5. Aggregate anonymized health benchmarks. "Your Lighthouse performance is bottom 20% of React sites." Comparative intelligence = retention lock-in.

## Bottom Line

This spec deploys revenue infrastructure. It does not deploy intelligence. Shipyard AI should mean AI. Without it, we are a Stripe billing wrapper valued like a consultancy. Fix the contact form, collect the $2K MRR, then immediately pivot the next sprint to predictive health and automated remediation. Revenue funds R&D; R&D builds the moat.
