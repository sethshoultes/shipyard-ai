# IMPROVE Board Review — Oprah Winfrey
**Date:** 2026-04-22
**Cycle:** IMPROVE-2026-04-22T23-0
**Focus:** New User Confusion, First-5-Minutes & The Show-Don't-Tell Gap

---

## Portfolio Assessment

I'm evaluating each product on one question: **Does a new user feel successful in 5 minutes?**

---

### 1. LocalGenius (localgenius.company)
**First-5-Minutes Grade: B+ → Still No Demo, But Foundation Improved**

**What's Changed Since Last Review:**
- **Insight persistence shipped.** The AI now remembers what the owner approved/rejected. This means the "conversation" gets richer over time — but a new user doesn't know this until Day 3 or Day 7.
- **Frontend launch PRD REJECTED (Apr 15, Board Score 1.5/10).** This hurts. Whatever was in that PRD — demo UI, walkthrough, landing page improvements — it failed to clear the board.

**What Still Works:**
- "Your business, handled" is still clear positioning
- $29/month + 14-day free trial = low friction
- "You didn't open a restaurant to do marketing" = perfect empathy

**Where Users Still Get Lost:**
- **No "See It In Action" section.** I said this two cycles ago. It's still not there. The demo video committed for "3 days" from Apr 20 should be done tomorrow (Apr 23) — but the frontend PRD rejection suggests the delivery pipeline for UX work is broken.
- **Still no dashboard preview.** A restaurant owner can't visualize the AI conversation before signing up.
- **Plan choice anxiety persists.** $29 vs $79 before experiencing value.
- **Still no testimonials with faces.** "Maria's Taqueria increased reviews by 40%" — where is she?

**The 5-Minute Test (Updated):**
A restaurant owner lands on the homepage. Within 5 minutes, can they:
1. Understand what LocalGenius does? ✅ Yes
2. See proof it works? ❌ No testimonials visible
3. Imagine themselves using it? ❌ No dashboard preview, no video
4. Start a trial confidently? ⚠️ Plan choice still creates hesitation

**Fix:** The demo video must ship tomorrow (per Apr 20 commitment). If the frontend pipeline can't ship UX improvements, record it on a phone. Authentic beats polished. Upload to homepage above the fold.

---

### 2. Shipyard AI (shipyard.company)
**First-5-Minutes Grade: C+ — Intake Shipped, Experience Still Missing**

**What's Changed Since Last Review:**
- **Self-serve intake SHIPPED (Apr 16, QA PASS, Board Score 3.5/10).** The board called it: "excellent technical foundation, no user experience."
- **Showcase PRD FAILED (Apr 21).** The exact thing users need to see — proof — failed delivery.

**What Still Works:**
- "PRD in. Production out." = crystal clear
- Token pricing = transparent
- Pipeline visualization shows process

**Where Users Still Get Lost:**
- **"What's a PRD?"** The intake form now validates webhook signatures with HMAC-SHA256. That's beautiful engineering. But a non-technical founder still doesn't know what a Product Requirements Document is.
- **No examples.** The showcase failed. So there is still zero before/after.
- **100% ship rate still unverifiable.** Bold claim, no evidence.
- **Token pricing still confusing.** "500K–2M tokens" — is that $500 or $5,000?

**The 5-Minute Test (Updated):**
A founder with an app idea lands on the homepage. Within 5 minutes, can they:
1. Understand what Shipyard builds? ✅ Yes
2. See examples of shipped work? ❌ Showcase failed
3. Understand pricing in dollars? ⚠️ Still token-based confusion
4. Submit a PRD confidently? ⚠️ Intake works, but they don't know what to submit

**Fix:** Two things, neither requires code:
1. Add one sentence to the homepage: "A PRD is simply a description of what you want built. Here's an example." Link to a Google Doc template.
2. Convert token pricing to dollar ranges on the marketing page. "$500–$2,000 per project" is what a founder understands.

---

### 3. Dash (WP Command Bar)
**First-5-Minutes Grade: B+ — Still Missing Onboarding**

**What's Changed Since Last Review:**
- **Deployed as part of plugin suite (Apr 16).** Now live on real sites.
- **v1 features confirmed.** Keyboard nav, backdrop dim, CSS custom properties — all approved.

**What Still Works:**
- Cmd+K pattern = instant recognition for power users
- Zero configuration = instant value
- Search works immediately

**Where Users Still Get Lost:**
- **"What's a command palette?"** Business owners still don't know this term.
- **Mode switching is still invisible.** `>` for commands, `@` for users — secret knowledge.
- **No first-run tutorial.** The PRD for onboarding hasn't been prioritized.
- **No demo GIF.** 10 seconds: press Cmd+K, type "new post", hit enter.

**The 5-Minute Test (Unchanged):**
A WordPress admin installs Dash. Within 5 minutes, can they:
1. Trigger the command bar? ⚠️ Only if they know Cmd+K
2. Find something useful? ✅ Search works
3. Discover advanced features? ❌ Mode switching hidden
4. Feel faster? ⚠️ No success feedback

**Fix:** Add rotating placeholder text to the search bar: "Search posts...", "Type > for commands...", "Type @ to find users..." This is 3 lines of CSS/JS, not a PRD.

---

### 4. Pinned (WP Sticky Notes)
**First-5-Minutes Grade: A- — Still Best in Portfolio, One Fix Away from A+**

**What's Changed Since Last Review:**
- **Deployed as part of plugin suite (Apr 16).** Live and working.
- **Visual QA now checks broken images.** Quality rising.

**What Still Works:**
- Double-click to create = zero friction
- Colors are self-explanatory
- Dashboard widget = instant visibility

**Where Users Still Get Lost:**
- **Still no welcome note.** One pre-populated note would eliminate all first-minute confusion.
- **@mention syntax not obvious.** First-time users don't know to type `@john`.

**The 5-Minute Test (Unchanged):**
A WordPress admin installs Pinned. Within 5 minutes, can they:
1. Create a note? ✅ Double-click is intuitive
2. Understand colors? ✅ Self-explanatory
3. Tag a teammate? ⚠️ Still guessing @syntax
4. Feel productive? ✅ Immediate organization

**Fix:** Add the welcome note I recommended two cycles ago: "Welcome to Pinned! Double-click to create a note. Use @name to notify teammates. Click the color dot to categorize." This is one database seed row.

---

### 5. Great Minds Plugin
**First-5-Minutes Grade: N/A (Internal Tool)**

Unchanged. The user is an AI agent, not a human. However, if open-sourced, the README is excellent but setup complexity would be a barrier.

---

## Cross-Portfolio First-5-Minutes Analysis

### The UX Delivery Gap
I am seeing a pattern: code ships, experience doesn't.

| UX Improvement | Status | Problem |
|----------------|--------|---------|
| LocalGenius demo video | Committed Apr 20, due Apr 23 | Frontend PRD rejected — pipeline risk |
| Shipyard showcase | FAILED Apr 21 | Content PRD failed |
| Dash onboarding | Not started | Deprioritized |
| Pinned welcome note | Not started | "One database seed row" still not shipped |

**This is not a product problem. It's a prioritization problem.** The team is shipping HMAC-SHA256 webhook validation (Shipyard intake, Board Score 3.5) before a welcome note for Pinned (A- grade, one fix from A+).

The engineering excellence is undeniable. But users don't experience engineering. They experience the first 5 minutes.

---

## Top 3 First-5-Minutes Priorities

### Priority 1: LocalGenius Demo Video — Phone Camera, Ship Tomorrow (CRITICAL)
**Problem:** Users still can't visualize using the product
**Fix:** If the frontend pipeline is blocked, bypass it. Record 60 seconds on a phone: owner opens dashboard → asks AI a question → approves suggestion. Upload to homepage. No editing required.
**Impact:** Converts "interesting" to "I want this"
**Effort:** LOW (2 hours, zero code)
**Timeline:** 24 hours

### Priority 2: Pinned Welcome Note (HIGH)
**Problem:** Best-in-portfolio first-5-minutes, one row away from perfect
**Fix:** Add welcome note on first install. One database seed row.
**Impact:** A- → A+ with zero design work
**Effort:** TRIVIAL (< 1 hour)
**Timeline:** 24 hours

### Priority 3: Shipyard Dollar Pricing + PRD Template (HIGH)
**Problem:** Founder confusion on tokens and PRDs
**Fix:** Marketing page change only. "$500–$2,000 per project." Add "What's a PRD?" link to a Google Doc template.
**Impact:** Removes two friction points with zero engineering
**Effort:** LOW (copy change)
**Timeline:** 2 days

---

## Oprah's Verdict

**The portfolio is building a cathedral and forgetting to open the doors.**

Every product explains what it does. None of them demonstrate it. The engineering is world-class — HMAC validation, insight persistence, visual QA methodology. But a restaurant owner doesn't care about your schema. They care about whether they can see themselves using it.

The fix is not more PRDs. The fix is a bias toward shipping visible, demonstrable improvements. A welcome note. A demo video. A pricing page rewrite. These are not "features." They are invitations.

**One thing to fix this week:** Record the LocalGenius demo video on a phone and upload it. If it's not live by Apr 24, the frontend delivery pipeline needs structural repair, not another cycle.

---

*Oprah Winfrey*
*Board Member, Great Minds Agency*
