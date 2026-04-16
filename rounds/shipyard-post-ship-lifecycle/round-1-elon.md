# Round 1: Elon Musk — Chief Product & Growth Officer

## Architecture: Delete Half of This

**Simplest system that works:** Cloudflare Workers + scheduled cron + Resend API. That's it. No database initially—use KV store with project ID as key. 5 email templates in code. Ship in 2 days, not 2 weeks.

The proposed schema is over-engineered. You don't need `tokenBudget`, `tokensUsed`, `projectType` for V1. You need: email, name, project URL, ship date. Add fields when you have evidence they matter.

**Cut the "Shipped Project Database"**—use existing order/project data. Don't duplicate state. If you don't have that data structure yet, that's the real problem.

## Performance: The Wrong Bottleneck

This PRD optimizes email delivery when the actual bottleneck is **getting 10,000 shipped projects**.

If Shipyard ships 1 project/day, you're optimizing for 365 email sends/year. That's a rounding error. Any transactional email service handles this in their sleep.

The 10x path: **reduce time-to-ship by 50%**, not perfect lifecycle emails. One extra shipped project/week >>> fancy email analytics.

## Distribution: You're Solving the Wrong Problem

Target: "20% of shipped projects generate revision orders"—but where are the 10,000 users? This is a retention play when you don't have acquisition solved.

**First-principles question:** Why would someone ship with Shipyard the FIRST time? Answer that, then worry about repeat customers.

If the answer is "word of mouth from amazing shipped projects," then lifecycle emails add 5% lift. If the answer is "we don't know," this is premature optimization.

**Real distribution:** Every shipped project should have a "Built with Shipyard" footer link. That's 10,000 backlinks pointing to real, live proof. That's distribution.

## What to CUT

**Kill Phase 2 entirely.** Project telemetry is interesting but irrelevant until you have 1,000+ shipped projects. Right now it's scope creep disguised as "competitive moat."

**Kill:**
- Day 90, 180, 365 emails in V1. Ship Day 7 and Day 30 only. Validate open rates before writing more templates.
- Email open tracking dashboard—use Resend's built-in analytics. Don't build what you can buy for $0.
- "Industry trends relevant to their site type"—who writes this content? This is a time sink with no ROI measurement.
- "Special offer for returning customers"—what's the offer? If you don't know, delete this line.

**Day 7 email only needs:** "Your site is live: [URL]. Reply to this email if you need anything."

That's the MVP. Anything else is LARPing as a marketing automation platform.

## Technical Feasibility: Yes, But Wrong Scope

**Can one agent session build this?** As spec'd: no. Too many moving parts, unclear integration points, vague requirements ("industry trends").

**Can one agent session build the REAL V1?** Yes:
1. Cloudflare Worker with scheduled cron trigger
2. Two email templates (Day 7, Day 30)
3. Resend integration
4. Manual CSV of shipped projects → KV store
5. Unsubscribe link → KV update

This is 200 lines of TypeScript. Ship today.

## Scaling: What Actually Breaks

**At 100x usage (10,000 shipped projects/year):**
- Email sends: 50,000/year → any service handles this
- KV reads: negligible
- Worker invocations: 365 cron jobs/year → free tier

Nothing breaks. This system scales to 100,000 projects without architecture changes.

**What DOES break:** Manual project entry. If you're manually CSV-uploading 27 projects/day, you're dead. Auto-capture from pipeline is not V1.1—it's V1.0.

## The Real Question

Why are repeat customers 30%? Is that based on industry benchmarks, or aspirational? If traditional agencies see 60% repeat rate, then 30% means Shipyard is broken. If agencies see 10%, then 30% means you're 3x better—but why?

**Thesis to validate:** Customers don't return because they don't need a second website, not because they forgot about Shipyard. If true, lifecycle emails are a band-aid on a business model problem.

**Counter-thesis:** Customers DO need ongoing work (updates, redesigns, new pages) but Shipyard positioned itself as "one-and-done." If true, lifecycle emails unlock latent demand.

Which is it? Run the experiment, but bet small. Two emails, two weeks of dev time, manual entry. If Day 30 emails generate 10%+ revision requests, double down. If not, kill it and fix acquisition.

## Verdict

**Ship the 10% version:** Day 7 + Day 30 emails, Cloudflare Workers, Resend, manual project CSV. Live in 48 hours.

Measure reply rate and revision requests for 90 days. If hit 10% conversion, fund V2. If not, this PRD dies and you focus on the real problem: why aren't there 10,000 shipped projects yet?
