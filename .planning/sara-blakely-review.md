# Sara Blakely Gut Check — Shipyard Care

**Would a real customer pay?** Not yet. They're paying for token buckets, not outcomes. Nobody wakes up wanting "100K tokens." They want problems solved.

**What's confusing?**
- "Token-based subscription" = instant friction. Customers don't know what 100K tokens buys them.
- No answer to "how many PRDs can I get?" before committing $500.
- "Incident-only reporting" sounds reactive, not proactive care.
- Two tiers (care/care_pro) but plan only shows one price point.

**30-second pitch:**
"Your dev team ships features but maintenance PRDs slip through cracks. Shipyard Care guarantees your maintenance requests get handled—$500/month for ~7 PRDs, no waiting. Get instant reports when something breaks. Refer a friend, they pay less, you earn credits."

**What I'd test first ($0 budget):**
- Email 10 current customers: "Pay $500/month, I'll handle 7 maintenance PRDs guaranteed. Yes or no?"
- See if anyone asks "what's a token?" If yes, pricing model is dead.
- Track: do they want subscription or pay-per-PRD?

**Retention hook:**
Weak. Referral credits are acquisition, not retention. Real hook = "we caught 3 bugs before you noticed them." But plan says "incident-only" which means you only tell them AFTER things break. That's not care, that's reporting.

**Bottom line:** You're building billing infrastructure before proving anyone wants this. Start with 5 customers on manual invoices. See if they renew month 2. Then build Stripe webhooks.
