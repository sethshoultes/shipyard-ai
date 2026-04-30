**Verdict: Overbuilt. Fix the async gap or no one pays.**

- **Customer would pay?** Maybe. Inbox dread is real. But waiting minutes for AI classification kills relief. Customer sees "Pending" → assumes product is broken → uninstalls.
- **Confusing:** 4 waves, 9 tasks, XML tags. Engineer theater. Customer does not care about hash-based deduplication or token budgets. Critical risk #1 should be "lead sits unclassified," not "token budget overrun."
- **Missing:** Price. No pricing anywhere. No customer interview plan. No refund policy. No demo video requirement.
- **Bounce triggers:** "Pulsing Processing badge" = broken feeling. Admin notice about disabled WP Cron = panic. Orange `#F97316` button looks like a warning, not save.

**Elevator Pitch:**
"Relay reads your website forms and instantly routes leads to right person — sales gets hot leads, support gets tickets, spam dies. No more shared inbox chaos."

**$0 Test:**
- Post in 3 WordPress agency Facebook groups: "Who still sorts contact form emails by hand?"
- DM 10 agency owners. Offer free install. Count how many keep it after 7 days.
- If zero ask to pay, kill it before Wave 1.

**Retention Hook:**
Daily "leads sorted, nothing missed" email summary. Makes invisible work visible to boss. Vanity metric = retention.

- **Cut:** REST endpoint v1. CF7 only. One route, one form plugin.
- **Cut:** Classification cache v1. Deduplication is premature optimization for zero users.
- **Fix:** Fire classification synchronously on form submit. 100ms vs 2 seconds does not matter if result is instant. Async is an excuse for sloppy UX.

**Bottom line:** Build half this. Test with 5 real sites. Then decide if waves 3-4 deserve oxygen.
