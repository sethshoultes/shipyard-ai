# Round 1: Elon Musk — Chief Product & Growth Officer

## Architecture: What's the Simplest System That Could Work?

**Strip this down to physics.** You need: (1) Store email + ship date, (2) Cron job checks timestamps, (3) Send email. That's it.

The data model is bloated. You don't need `lifecycleEmails` object tracking every send state. **One field:** `lastEmailSentAt: Date`. Scheduler logic: `daysSinceShip = now - shippedAt`. Send email based on thresholds (7, 30, 90, 180, 365). Idempotency: don't send twice if already sent within threshold window.

**No dashboard in MVP.** You're building retention mechanics, not analytics porn. Track sends, yes. Pretty graphs? V2.

Use **Cloudflare Workers + D1** (SQL at the edge). No separate database service. No KV complexity. SQL `SELECT * FROM projects WHERE shippedAt < DATE('now', '-7 days')` is faster to write and debug than KV key management.

## Performance: Where Are the Bottlenecks?

Daily cron scanning all projects is O(n). At 10,000 projects, this is still <100ms query with proper indexing. **Non-issue.**

Real bottleneck: **email deliverability**. Transactional email services rate-limit. Postmark: 10,000/month free tier, then $1.50/1k. At scale, you'll batch sends. Use `Promise.allSettled()` with concurrency limit (50 concurrent).

**Email template rendering:** Don't use heavy frameworks. Plain HTML + template literals. Render time should be <1ms per email.

## Distribution: How Does This Reach 10,000 Users Without Paid Ads?

This feature **is** the distribution engine. Each email is a reminder that Shipyard exists.

Do the math:
- 1,000 shipped projects
- 5 emails/year/project = 5,000 touchpoints
- 50% open rate = 2,500 opens
- 20% click-through on "Schedule an update" = 500 warm leads
- 10% conversion = **50 new projects** from lifecycle emails alone

**Viral loop:** Day 7 email includes "Built with Shipyard" badge. Prompt customer to add it to footer. Every shipped site becomes a billboard.

**Content play:** Day 90 email's "case study of similar project" is growth leverage. Customer sees "We built 50 e-commerce sites last quarter" = social proof + FOMO.

## What to CUT: Scope Creep Detection

**Cut from MVP:**
1. **"Basic performance metrics (uptime, page speed)"** — You don't monitor sites. Don't promise what you can't deliver. Say "Hope your site is performing well" instead of fake metrics.
2. **Open tracking in MVP** — Just send emails. Track later. You need 100 sends before open rates matter statistically.
3. **Click tracking in MVP** — Use UTM parameters to measure in existing analytics. Don't build custom tracking.
4. **A/B testing** — You have no volume. Write good copy, ship it, iterate when you have 1,000 sends.
5. **"Industry trends relevant to their site type"** — Hand-waving. You'll spend 10 hours researching trends per email. Just say "Web is evolving, let's refresh your site."

**Phase 2 (Project Telemetry)** is the real product. Emails are customer retention. Telemetry is **operational AI** — knowing "React sites ship 40% faster than Vue" lets you guide customers better. But email sequence proves retention value first. Correct sequencing.

## Technical Feasibility: Can One Agent Session Build This?

**Yes.**

Scope for single session:
1. Cloudflare Worker with scheduled trigger (50 lines)
2. D1 database schema (10 lines SQL)
3. 5 email templates (HTML, 100 lines each = 500 lines total)
4. Postmark API integration (20 lines)
5. Manual project entry endpoint (30 lines)

Total: ~600 lines of code. **4-6 hour session** for competent agent.

Pipeline integration (auto-populate shipped projects) is separate session. Don't couple it to MVP.

## Scaling: What Breaks at 100x Usage?

At 100,000 shipped projects:
- Daily cron queries entire table: **Needs indexing** on `shippedAt`. Add compound index on `(shippedAt, lastEmailSentAt)`.
- 100k projects × 5 emails/year = **500k emails/year** = 1,370/day. Well within Postmark limits. Cost: ~$75/month.
- D1 storage: 100k rows × ~500 bytes = **50MB**. Free tier is 5GB. Non-issue.

**What actually breaks:** Email reputation. If 5% spam complaints, you're blacklisted. Mitigation: Double opt-in (customer confirms email at project start), clear unsubscribe, reputable transactional service with good defaults.

## First-Principles Challenges to PRD

**1. "Repeat customer rate 30% within 12 months" is vanity metric.**
Real metric: **Revenue from lifecycle emails ÷ Cost of system**. If you spend $500/month (email service + maintenance) and generate $5k/month in repeat business, ROI is 10x. That's the number that matters.

**2. "Special offer for returning customers" (Day 180 email) is discount poison.**
You're training customers to wait for discounts. Instead: "Priority scheduling for past customers" or "Free site audit." Scarcity > Discounts.

**3. Manual project entry is technical debt from day 1.**
Just build the pipeline integration. It's 30 lines of code to call `createShippedProject()` when deployment completes. Don't create two-week lag for automation you know you need.

**4. "2-week MVP, 2-week V1.1" timeline is padded.**
Single competent engineer ships MVP in 3 days. Week 1 if you're being conservative. Two weeks suggests you're building the bloated version (dashboard, tracking, etc.). Resist.

## Bottom Line

This is a **good bet**. Low cost ($500/month at scale), measurable revenue impact, defensible (operational data moat in Phase 2).

Execute fast, measure ruthlessly, cut mercilessly. If Day 7 emails have <30% open rate after 100 sends, the copy is bad or customers don't care. Fix or kill. Don't build V1.1 until MVP proves the hypothesis.

Ship it.
