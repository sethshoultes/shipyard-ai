# LocalGenius Lite — First Principles Review
**Reviewer:** Elon Musk (Chief Product & Growth Officer)
**Date:** 2026-04-19
**Verdict:** Ship it, but cut the fat

---

## Architecture: What's the Simplest System That Could Work?

**Current plan is 90% correct.** Cloudflare Worker + Claude API + shadow DOM widget is the right stack. No database, no backend, no containers. Good.

**CUT THIS:** The dashboard. You don't need a "simple static site" with user accounts, Stripe, and usage tracking for v1. That's 3+ hours of work that delays shipping.

**INSTEAD:** Generate site IDs client-side (UUID v4). Store them in localStorage. No validation. The Worker just proxies to Claude. Add abuse protection later when it's actually a problem.

**New flow:**
1. Copy/paste script tag from landing page (hardcoded example with random UUID)
2. Script self-initializes
3. That's it

You just cut 40% of the work and can ship in ONE SESSION.

---

## Performance: Where Are The Bottlenecks?

**Bottleneck #1:** Claude API latency (500ms-2s time-to-first-token).
**Fix:** This is acceptable for chat. Stream immediately. Users tolerate typing indicators.

**Bottleneck #2:** Page content extraction on every message.
**Fix:** Cache scraped content in widget memory after first load. Don't re-scrape on every question.

**Bottleneck #3:** Context size bloat.
**Math:** Average web page is 30KB text. Claude Haiku supports 200K context. Even truncated to 10KB, you're using 5% of context budget. This is fine.

**The 10x path:** Pre-scrape and cache during idle time. Extract content in a Web Worker to avoid blocking main thread. But do this AFTER launch.

---

## Distribution: 10,000 Users Without Paid Ads?

**Current plan has ZERO distribution strategy.** This is a fatal flaw.

**First-principles:** You need organic discovery + viral mechanics.

**The play:**
1. **SEO land grab:** Create 100 comparison pages (`vs-intercom`, `vs-drift`) targeting "free alternative to [competitor]"
2. **Powered-by attribution:** Widget footer says "Powered by LocalGenius" with click-through. Every embedded widget is a billboard.
3. **Public stats page:** Show live count of questions answered across all sites. Social proof.
4. **Developer seeding:** One script in the `<head>` of popular open-source docs = 10K impressions/day.
5. **Twitter thread on launch day:** "I built this in 4 hours. Here's the full architecture [thread]"

**Target:** 50 devs see launch → 10 embed it → 5 tweet about it → 1 goes viral → 1,000 sites.

You need #2 (powered-by) in v1. Non-negotiable.

---

## What to CUT: Scope Creep Detection

**Cut immediately:**
- ❌ Dashboard (as stated above)
- ❌ Custom branding in v1 (just use default purple)
- ❌ Dark mode detection (ship light mode only)
- ❌ Mobile responsiveness polish (ship desktop-first, mobile gets a functional but ugly panel)
- ❌ "Nice to Have" entire section

**Keep:**
- ✅ Chat widget
- ✅ Page scraping
- ✅ Claude responses
- ✅ Basic rate limiting (10 requests/min per site_id, enforced in Worker)

**V2 features masquerading as V1:**
- "Simple dashboard" — this is a whole app. Cut it.
- "Basic styling with dark mode" — dark mode is vanity. Ship light.
- "Lead capture" — already out of scope, good.

**New MVP checklist:**
1. Widget renders
2. Sends question + page context to Worker
3. Worker calls Claude
4. Response streams back
5. Done.

That's 2 files: `widget.js` and `worker.js`. Maybe 600 lines total.

---

## Technical Feasibility: Can One Session Build This?

**Yes, IF you cut the dashboard.**

**Time breakdown (realistic):**
- Widget UI: 1 hour
- Worker + Claude integration: 1 hour
- Streaming response handling: 30 min
- Testing/debugging: 1 hour
- Deployment: 30 min
- **Total: 4 hours**

**With dashboard:** Add 2-3 hours for auth, KV writes, Stripe, usage tracking. You'll run out of time.

**Recommendation:** Ship the widget + Worker tonight. Launch with a static landing page that has copy/paste instructions. Add dashboard when 10 people ask for it.

---

## Scaling: What Breaks at 100x?

**Current estimates:**
- 100 sites → 10K sites = 100x
- 100 questions/day → 10K questions/day = 100x

**What breaks:**

1. **Claude API rate limits**
   Anthropic limits: ~50 req/sec on paid tier. At 10K questions/day = 0.1 req/sec average, 5 req/sec peak. You're fine until 500K questions/day.

2. **Cloudflare Worker limits**
   Free tier: 100K requests/day. You hit this at 100K questions/day. Solution: Upgrade to $5/mo Workers plan (10M req/month). Cost: $0.00005/question.

3. **Context costs**
   Claude Haiku: $0.25/M input tokens, $1.25/M output.
   10KB context + 100 token answer = ~3K tokens = $0.00045/question.
   At 10K questions/day = $4.50/day = $135/mo.
   **This is your real cost.** Price accordingly.

4. **Abuse**
   Without validation, someone scrapes your Worker URL and hammers it. Solution: Cloudflare rate limiting (built-in). Set to 100 req/hour per IP. Problem solved.

**Nothing breaks at 100x.** This scales to 1M users before you need real infrastructure.

---

## Final Verdict

**Ship this tonight.** But cut:
- Dashboard
- Pricing/billing
- Dark mode
- Mobile polish

**Launch with:**
- A landing page with copy/paste script tag
- A working widget
- Free for everyone

**Then:**
- Watch usage
- Talk to users
- Add billing when people ask for "remove branding"

**Key insight:** You're building a vitamin, not a painkiller. Nobody is desperately searching for this. You need viral mechanics (powered-by footer) and developer word-of-mouth. Ship fast, iterate based on real usage, not imagined pricing tiers.

**One more thing:** Rename it. "LocalGenius Lite" sounds like a diet soda. Call it "PageChat" or "AnswerWidget" — something that describes what it does in 1 second.

---

**Bottom line:** This is buildable in one session IF you resist the urge to build a SaaS company on day 1. Ship the core, measure demand, then build the business layer.
