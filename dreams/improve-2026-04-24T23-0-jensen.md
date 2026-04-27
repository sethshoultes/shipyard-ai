# Board Review — Jensen Huang
**Date:** 2026-04-24
**Cycle:** featureDream IMPROVE
**Scope:** LocalGenius · Shipyard AI · Dash · Pinned · Great Minds

---

## The One-Sentence Verdict

You have built five infrastructure projects and called them products. Infrastructure compounds for *you*. Products compound for *customers*. The gap between those two is why none of these have a defensible moat yet.

---

## Product-by-Product Assessment

### LocalGenius — "The Schema Is the Moat. The Query Is the Product."

**What's Working:**
- The benchmark engine architecture is genuinely clever. Cross-business anonymized comparisons create a data flywheel that gets stronger with every restaurant onboarded.
- LTV/CAC of 9.3x is not fantasy — the sensitivity analysis proves you did the work.
- `insight_actions` table means you actually built persistence, not just talked about it.

**The Gap:**
The frontend is nonexistent. I mean literally empty directories. You shipped Cloudflare Workers, D1 schemas, and Stripe webhooks — and called it a product. A restaurant owner in Omaha cannot buy a Postgres schema. She can buy "I know exactly how my review response time ranks against every Italian restaurant in my zip code." That sentence requires a widget, a dashboard, and a weekly email that actually renders in Gmail.

**The Moat Opportunity You're Squandering:**
Every week the benchmark engine sits in staging, a competitor gets closer. The moment you have 50 restaurants' data, you have something uncopyable. At 500, you have a monopoly on local-business intelligence. But network effects only compound if the network exists. Right now you have a beautiful schema and zero nodes.

**Specific Mandate:**
1. Ship the chat widget UI in 72 hours. Not redesign — ship. HTML, CSS, JS. It doesn't have to be pretty; it has to exist.
2. Activate the benchmark query. One SQL query + one email template = "You're in the top 12% for review response speed in Denver." That's the product.
3. Auto-dect business metadata from schema.org and footer content. Manual entry is a moat-killer.

---

### Shipyard AI — "Process IP Is Not Product IP"

**What's Working:**
- The multi-agent pipeline is genuinely innovative. 95% ship rate proves the process works.
- Token-credit economics are outstanding: 93-97% margins at $2.40 AI cost per site.
- The memory-store with TF-IDF is a real technical asset.

**The Gap:**
You have optimized for *output volume* instead of *outcome durability*. The "improvement delivery gap" is fatal: code PRDs ship, experience PRDs stall. That means you are building a factory that manufactures features nobody sticks with.

A client who gets a beautiful site but cannot see project status, track token burn, or request revisions without Slack-DMing Elon Musk is a client who churns at month three.

**The Compounding Fix:**
The `insight_actions` table you built for LocalGenius? Shipyard needs the same thing. Every project should generate a "Project Memory" — what we built, why we chose X over Y, what the client rejected, what maintenance tasks are due. That memory becomes the reason they renew.

**Specific Mandate:**
1. Finish the 4 plugin API migrations. EventDash works; the other four are broken promises.
2. Deploy the maintenance subscription. "$500/month, 2 revision rounds" is not a client portal dependency — it's a Stripe subscription and a cron job.
3. Build the client-facing project status page. One page: project name, current stage, tokens used, next milestone. Not a portal. A page.

---

### Dash — "16ms Is a Feature, Not a Business"

**What's Working:**
- Speed claims are credible: 16ms vs 50ms native WordPress is a 3x improvement.
- Zero dependencies is a genuine architectural virtue in the WordPress ecosystem.

**The Gap:**
You shipped a utility. Utilities get copied. WordPress 6.5 already has a command palette. In 6.7 it will be faster. In 6.8 it will have AI search. If you do not build a data moat *now*, you are building a feature for WordPress core.

The data moat is usage patterns. What do users search for? What commands do they run 10x per day? That data should inform LocalGenius feature priorities, Pinned template suggestions, and your own plugin roadmap. Right now it evaporates into the browser console.

**Specific Mandate:**
1. Add opt-in anonymous usage analytics. Not creepy — valuable. "Dash users search for 'SEO' 340x more than 'Tags.'" That's product intelligence.
2. Open a custom commands API. Let developers register commands. Ecosystem lock-in is the only moat available to a command palette.
3. Cross-promote LocalGenius Lite in settings. A free plugin with no distribution strategy is a hobby.

---

### Pinned — "Social Obligation Is a Retention Hook, Not a Business Model"

**What's Working:**
- @mentions create genuine social obligation — the strongest retention force in B2B software.
- Note aging is a subtle but excellent UX pattern.

**The Gap:**
No monetization, no template marketplace, no cross-site sync. You built a feature that Notion and Slack already give away, then stopped. The agency angle is the moat: pre-built client onboarding templates, white-labeling, cross-site note syncing for agencies managing 40 WordPress installs. That's a $199/year product. "Sticky notes" is a free plugin.

**Specific Mandate:**
1. Ship 5 agency onboarding templates on day one. "How to add a blog post." "Client handoff checklist." Make the template library the reason to upgrade.
2. Build the "WordPress Intelligence Suite" bundle with Dash + LocalGenius Lite. Three free plugins are three liabilities. One $99 bundle is an asset.
3. Add Slack integration to the paid tier. Teams that live in Slack will pay $5/user/month to not switch tabs.

---

### Great Minds Plugin — "Frameworks Don't Compound. Customers Do."

**What's Working:**
- The agent orchestration is technically impressive. 14 personas, persistent memory, autonomous deployment.
- The institutional memory concept — buglogs, retrospectives, do-not-repeat patterns — is genuinely differentiated.

**The Gap:**
This is an internal tool pretending to be a product. The setup friction is enormous: clone repo, configure Claude API keys, understand the pipeline architecture, write PRDs in the exact format. You have built something only you can use.

The compounding opportunity is "AI Agency in a Box." Hosted Great Minds. $299/month. One-click deploy. Pre-configured personas. The customer doesn't need to know what a PRD is — they fill out a form, and Great Minds builds their site.

**Specific Mandate:**
1. Package a Docker container with pre-configured environment variables. Remove "clone and configure" as a barrier.
2. Create a hosted SaaS tier. The margin on $299/month unlimited projects is absurd if the underlying cost is $2.40 per site.
3. Build the "Shipyard Certified" badge. Every site built by Great Minds should carry a badge linking back to Shipyard. That's free distribution.

---

## Portfolio-Wide Pattern

| Pattern | Evidence | Risk |
|---------|----------|------|
| Backend-first, frontend-never | LocalGenius empty dirs, Shipyard no client portal, Great Minds no UI | Customers cannot buy architecture |
| Data moats designed, not deployed | insight_actions exists but not queried; Dash analytics not collected; benchmark engine staged | Competitors catch up every week |
| Process IP > Product IP | 36 shipped PRDs, 2 failed, but "experience PRDs stall" | Factory produces outputs, not outcomes |

## My Ranked Improvements

1. **Activate LocalGenius Benchmark Query** — One SQL query + email template unlocks the only true data moat in the portfolio. Impact: Uncopyable competitive differentiation.
2. **Ship Shipyard Client Status Page** — One page prevents churn for every project shipped. Impact: Converts transactions into relationships.
3. **Bundle WordPress Plugins** — Three liabilities become one asset. Impact: Immediate revenue from zero-R&D work.

**Bottom Line:** Stop building things that make *you* feel smart. Build things that make *customers* feel smart. The benchmark query does that. The Postgres schema does not.

— Jensen
