# IMPROVE Board Review — Oprah Winfrey
**Date:** 2026-04-20
**Cycle:** IMPROVE-2026-04-20T00-1
**Focus:** New User Confusion & First-5-Minutes Experience

---

## Portfolio Assessment

I'm evaluating each product on one question: **Does a new user feel successful in 5 minutes?**

---

### 1. LocalGenius (localgenius.company)
**First-5-Minutes Grade: B+**

**What Works:**
- "Your business, handled" is immediately clear positioning
- $29/month price point removes financial friction
- 14-day free trial, no credit card = low commitment
- "You didn't open a restaurant to do marketing" speaks directly to the pain

**Where Users Get Lost:**
- **Landing page → signup gap.** The value is clear, but what happens after I click "Start Free Trial"? No preview of the dashboard, no sample AI output, no "here's what you'll see."
- **"Conversational interface" is vague.** What does talking to LocalGenius look like? Show me a screenshot of a conversation. Show me a real suggestion it made.
- **Pro vs Base decision is premature.** I don't know what I need yet. Asking me to choose a plan before I've experienced the product creates anxiety.
- **No success stories.** I want to see "Maria's Taqueria increased reviews by 40%." Real outcomes, real people.

**The 5-Minute Test:**
A restaurant owner lands on the homepage. Within 5 minutes, can they:
1. Understand what LocalGenius does? ✅ Yes
2. See proof it works? ❌ No testimonials visible
3. Imagine themselves using it? ❌ No dashboard preview
4. Start a trial confidently? ⚠️ Maybe — plan choice creates hesitation

**Fix:** Add a "See It In Action" section with a 30-second demo video or animated walkthrough showing: (1) owner asks a question, (2) LocalGenius responds with a marketing suggestion, (3) owner approves with one click.

---

### 2. Shipyard AI (shipyard.company)
**First-5-Minutes Grade: B**

**What Works:**
- "PRD in. Production out." is crystal clear
- Token-based pricing is transparent
- Pipeline visualization shows the process
- "No hand-holding. No scope creep." speaks to agency trauma

**Where Users Get Lost:**
- **"What's a PRD?"** Non-technical founders don't know what a Product Requirements Document is. The entire value prop assumes I know how to write one.
- **No examples.** What does a good PRD look like? What comes out the other side? I can't imagine the input or the output.
- **"100% ship rate" is unverifiable.** Bold claim, zero evidence. Where's the portfolio? Where are the case studies?
- **Who is this for?** Founders? Agencies? Enterprises? The messaging is capability-focused, not audience-focused.
- **Token pricing is confusing.** "500K–2M tokens" — how many tokens do I have? What's a token worth? Give me a dollar range.

**The 5-Minute Test:**
A founder with an app idea lands on the homepage. Within 5 minutes, can they:
1. Understand what Shipyard builds? ✅ Yes
2. See examples of shipped work? ❌ No portfolio
3. Understand the pricing? ⚠️ Token confusion
4. Write a PRD confidently? ❌ No template or guidance

**Fix:** Add a "Example PRD → Shipped Product" case study. Show the before (PRD) and after (deployed site). Make the input/output transformation concrete.

---

### 3. Dash (WP Command Bar)
**First-5-Minutes Grade: B+**

**What Works:**
- Cmd+K is a universally recognized pattern for power users
- Zero configuration = instant value
- Dashboard appears on activation with no setup
- Search posts, pages, settings immediately useful

**Where Users Get Lost:**
- **"What's a command palette?"** Non-technical WordPress users (small business owners, bloggers) won't know this concept.
- **Mode switching is secret knowledge.** `>` for commands, `@` for users — these are powerful but invisible.
- **No demo.** I want to see a 10-second GIF: press Cmd+K, type "new post", hit enter, boom — new post editor opens.
- **No onboarding.** First open should show 3 example commands, not an empty search bar.

**The 5-Minute Test:**
A WordPress admin installs Dash. Within 5 minutes, can they:
1. Trigger the command bar? ⚠️ If they know Cmd+K
2. Find something useful? ✅ Search works intuitively
3. Discover advanced features? ❌ Mode switching is hidden
4. Feel faster? ⚠️ No success feedback ("That took 2 seconds!")

**Fix:** Add a first-run tutorial overlay showing Cmd+K → search → result in 3 steps. Add placeholder text that rotates: "Search posts...", "Type > for commands...", "Type @ to find users..."

---

### 4. Pinned (WP Sticky Notes)
**First-5-Minutes Grade: A-**

**What Works:**
- Dashboard widget appears immediately on activation
- Double-click to create a note = zero friction
- Colors are self-explanatory (pink = urgent makes sense)
- @mentions discoverable through natural exploration
- Note aging is visible without explanation

**Where Users Get Lost:**
- **No welcome note.** First-time users see an empty widget. One pre-populated note saying "Welcome! Double-click anywhere to create a note" would eliminate confusion.
- **@mention syntax not obvious.** How do I know to type @john? A hint when creating the first note would help.
- **Feature discovery is accidental.** The color system, aging, and mentions are all discoverable but not guided.

**The 5-Minute Test:**
A WordPress admin installs Pinned. Within 5 minutes, can they:
1. Create a note? ✅ Double-click is intuitive
2. Understand the color system? ✅ Visible and self-explanatory
3. Tag a teammate? ⚠️ If they guess @syntax
4. Feel productive? ✅ Immediate sense of organization

**Fix:** Add a single welcome note on first install: "Welcome to Pinned! Double-click to create a note. Use @name to notify teammates. Click the color dot to categorize."

**Verdict:** Best first-5-minutes in the portfolio. A- only because of the missing welcome note.

---

### 5. Great Minds Plugin
**First-5-Minutes Grade: N/A (Internal Tool)**

Great Minds is infrastructure, not a user-facing product. The "user" is another AI agent, not a human. First-5-minutes doesn't apply in the traditional sense.

**However:** If we ever open-source or productize Great Minds, the README is excellent (300 lines, comprehensive), but the setup complexity would be a barrier. One-command installation would be essential.

---

## Top 3 First-5-Minutes Priorities

### Priority 1: LocalGenius "See It In Action" (CRITICAL)
**Problem:** Users can't visualize using the product
**Fix:** Add demo video or animated walkthrough on homepage
**Impact:** Converts "interesting" to "I want this"
**Effort:** LOW (screen recording + editing)
**Timeline:** 1 week

### Priority 2: Shipyard Case Study (HIGH)
**Problem:** Bold claims with no proof
**Fix:** Publish one "PRD → Shipped" case study with visuals
**Impact:** Makes the transformation concrete and believable
**Effort:** LOW (content + screenshots)
**Timeline:** 1 week

### Priority 3: Dash/Pinned Onboarding (MEDIUM)
**Problem:** Features are discoverable but not discovered
**Fix:** First-run welcome overlay (Dash) and welcome note (Pinned)
**Impact:** Accelerates time-to-value
**Effort:** LOW (minimal code)
**Timeline:** 3 days each

---

## Oprah's Verdict

**The portfolio's biggest gap is showing, not telling.** Every product explains what it does, but none of them *demonstrate* it. Users don't read — they scan. They don't imagine — they see.

**The fix is cheap.** A 30-second video, a pre-populated example, a walkthrough GIF. These are hours of work that create days of saved customer support and abandoned signups.

**One thing to fix this week:** Record one LocalGenius demo video. Phone camera, real dashboard, real AI suggestion. Authentic beats polished. Upload to homepage.

---

*Oprah Winfrey*
*Board Member, Great Minds Agency*
