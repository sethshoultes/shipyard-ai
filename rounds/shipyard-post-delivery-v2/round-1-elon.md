# Round 1 Review: Shipyard Post-Delivery V2

**Reviewer:** Elon Musk — Chief Product & Growth Officer
**Date:** 2026-04-12

---

## Architecture: The Simplest System That Works

**Verdict: This IS the simplest system.** Phil learned from V1's failure. Email templates + Stripe links + spreadsheet = zero engineering dependencies. Ship it.

One refinement: Kill the spreadsheet. Use Notion. It's free, it has reminders built-in, and you can create a database that pings you automatically. Don't set 5 separate calendar reminders per client. That's O(n) manual work that breaks at 20 clients.

---

## Performance: Where Are the Bottlenecks?

The bottleneck isn't technical. It's **human bandwidth.**

- 5 emails × 20 clients = 100 manual sends in year one
- Each email requires merge field editing (6-8 fields)
- Estimated 5 minutes per email = 8+ hours/year just on email sends

**10x path:** Mailchimp, Loops, or Resend with a simple CSV upload. You template once, upload client data, schedule all 5 emails on day 0. No calendar reminders. No forgetting. This is 2 hours of setup vs. 8+ hours of ongoing manual work.

Why isn't this in V1? It should be. It's not "automation complexity." It's basic batch operations.

---

## Distribution: How Does This Reach 10,000 Users?

This doesn't reach 10,000 users. **It reaches 10,000 maintenance contracts.** Different game.

Math:
- Target: 25% attach rate on maintenance
- 10,000 contracts requires 40,000 project deliveries
- At current volume (implied ~7 projects), that's 5,700x growth

**Realistic V1 impact:** If we close 20 projects/month and hit 25% attach, that's 5 maintenance contracts/month = $395-995 MRR added monthly.

Distribution isn't the play here. **Conversion is.** The 25% target is aggressive. Industry SaaS maintenance attach rates are 15-20%. The emails are good but the CTA could be sharper. "P.S. Want us to handle ongoing updates?" is weak. Try: "80% of sites need their first update within 30 days. Lock in your support now."

---

## What to CUT

1. **Template 4 (Quarter 1 Report)** — 90 days is too long. Client has forgotten you. Move the "refresh suggestion" to Day 30. Cut this email entirely or make it optional.

2. **{{REFRESH_SUGGESTION}} merge field** — Who's writing custom refresh suggestions for each client? Nobody. This will get skipped and feel hollow. Remove it or standardize it.

3. **Token tracking in spreadsheet** — You're not actually using tokens yet. Why track them? Track "Requests Made" and "Hours Used" if anything. Token tracking is V2 theater.

4. **Two tiers at launch** — Launch with ONE tier. $99/month. Test demand. Split into tiers when you have 10 paying customers and data on usage patterns. Two tiers before any customers is premature optimization.

---

## Technical Feasibility: Can One Agent Session Build This?

**Yes, but barely.** The "build" is:
1. Copy-paste 5 email templates (10 min)
2. Create 2 Stripe products + payment links (20 min)
3. Create Notion/Sheet tracking database (15 min)
4. Backfill existing clients (variable)

This is a 1-hour task, not 5 days. The 5-day timeline suggests hidden work: stakeholder alignment, template iteration, existing client outreach. Be honest about what "build" means here.

An agent session could scaffold the Notion database, prep the Stripe product descriptions, and draft the emails — in under 30 minutes. The hard part is adoption, not creation.

---

## Scaling: What Breaks at 100x?

At 100x current volume (700 active clients):
- **Manual email sending breaks** — You cannot manually send 3,500 emails/year
- **Spreadsheet becomes unmaintainable** — 700 rows, 10 columns, multiple people editing = chaos
- **Calendar reminders explode** — 3,500 reminders/year = 10/day
- **Token tracking collapses** — Manual token counting for 700 clients is impossible

**When to automate:** The PRD says "50+ active clients" is the breaking point. I'd say 25. Start evaluating automation tools at 15 clients. Have them ready to deploy at 25. The transition cost grows exponentially with client count.

---

## Final Verdict

**Ship it.** But ship it in 1 day, not 5. Cut the second tier. Cut Template 4. Use Notion with database automations instead of calendar reminders.

The real risk isn't complexity — it's that nobody follows through on manual processes. The best system is the one that actually gets executed.

**Priority fix:** Change the CTA from "P.S." afterthought to primary email purpose. Every email should be a maintenance pitch with value-add framing, not a value-add with maintenance as P.S.

---

*"If you're not embarrassed by the first version, you launched too late." — This PRD gets it. Ship.*
