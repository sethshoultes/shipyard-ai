# IMPROVE Cycle: Oprah Winfrey Review
**Date:** 2026-04-10 | **Focus:** New User Confusion & First-5-Minutes Experience

---

## The Emotional Audit

*"People will forget what you said, people will forget what you did, but people will never forget how you made them feel."*

Two weeks ago, I flagged empty states, jargon, and slow time-to-aha across the portfolio. Let's see what's changed — and what still makes new users feel lost.

---

## LocalGenius

### First-5-Minutes Reassessment

**What We Said Two Weeks Ago:**
- Industry mismatch creates doubt (demo shows restaurant, user is dentist)
- Conversational UI is unfamiliar — users don't know what to say
- Pricing tiers unclear

**What's Changed:**
PULSE benchmark engine is being built. This is exciting — but it's a retention feature, not an onboarding feature. The first-5-minutes experience remains largely untouched.

### Current Pain Points

**1. "Is this for MY business?"**
A dentist lands on localgenius.company. They see a restaurant example. They leave.

**The Fix (still needed):**
```
Homepage Header:
[Restaurant] [Dental] [Salon] [Retail] ← Click to see YOUR industry

"AI marketing for [YOUR TYPE] owners who'd rather
focus on [YOUR WORK] than managing six different tools."
```

**2. "What do I say to it?"**
Users stare at an empty chat interface. The cursor blinks. Anxiety builds.

**The Fix (still needed):**
- First message from LocalGenius: "Welcome to [Business Name]! I found your Google profile. You have 47 reviews with a 4.3 average. Want me to draft responses to your 2 unanswered reviews?"
- Suggested prompts: "Reply to my latest review" | "Draft a weekend special post" | "Show me my stats"

**3. "What just happened?"**
User sends a message. LocalGenius responds. Did it work? Was that good?

**The Fix (still needed):**
- Confirmation moments: "✅ Posted to Google Business Profile"
- Celebration: "🎉 Your review response is live! Most businesses take 8 hours to respond — you did it in 5 minutes."

### Emotional State Assessment

| Stage | Feeling | Target Feeling |
|-------|---------|----------------|
| Landing page | "Is this for me?" | "This is EXACTLY for me" |
| Sign up | "Let's try it" | "I can't wait to see this" |
| First prompt | "What do I say?" | "Oh, it's suggesting things!" |
| First response | "Did that work?" | "Wow, that was easy!" |
| After 5 minutes | "Maybe I'll come back" | "I need to tell my friend about this" |

**Onboarding Grade:** C+ (Good bones, missing warmth)

---

## Dash (WP Command Palette)

### First-5-Minutes Reassessment

**What We Said Two Weeks Ago:**
- Empty search bar with no hints
- Mode switching (> for commands, @ for users) is hidden
- No celebration moment

**What's Changed:**
Nothing visible. Dash remains a utility that users discover by accident or never discover at all.

### Current Pain Points

**1. The Blank Slate Problem**
User presses Cmd+K. Empty box appears. They type something random. Maybe it works. Maybe it doesn't. They close it and forget it exists.

**The Fix (still needed):**
First-time welcome modal:
```
┌─────────────────────────────────────────┐
│  Welcome to Dash! 🚀                     │
│                                          │
│  Search anything: posts, pages, settings │
│  Type > for quick commands               │
│  Type @ to find teammates                │
│                                          │
│  [Got it!]          [Show me examples]   │
└─────────────────────────────────────────┘
```

**2. No Discovery Path**
Users don't know about features they never see.

**The Fix (still needed):**
- Rotating placeholder: "Search posts... | Type > for commands... | Find @teammates..."
- Progressive disclosure: After 10 uses, show "Pro tip: Type > to create a new post instantly"

**3. Invisible Value**
Dash saves time. But users don't perceive the time saved.

**The Fix (future):**
- Monthly summary: "You saved ~45 minutes this month with Dash"
- Subtle counter: "Searches this session: 12 | Time saved: ~4 min"

### Emotional State Assessment

| Stage | Feeling | Target Feeling |
|-------|---------|----------------|
| Install | "Cool, a command palette" | "This is going to be amazing" |
| First Cmd+K | "What do I do?" | "Oh, I can search anything!" |
| First search | "That was... fine" | "That was FAST!" |
| After 5 minutes | "I might use this sometimes" | "I can't live without this" |

**Onboarding Grade:** D (Functional but forgettable)

---

## Pinned (WP Sticky Notes)

### First-5-Minutes Reassessment

**What We Said Two Weeks Ago:**
- Empty state is lonely
- @mentions undiscoverable
- Solo user doesn't see the value

**What's Changed:**
Note threads (v1.1) was identified as priority but not shipped yet. The core onboarding experience remains unchanged.

### Current Pain Points

**1. Empty Dashboard = No Motivation**
User installs Pinned. Sees empty widget. "Double-click to add a note." They double-click. Add a note. Then what?

**The Fix (still needed):**
Pre-populated welcome note:
```
┌─────────────────────────────────────────┐
│  📝 Welcome to Pinned!                   │
│  From: The Pinned Team                   │
│                                          │
│  Use sticky notes to share updates,      │
│  leave reminders, or coordinate with     │
│  your team.                              │
│                                          │
│  Try these:                              │
│  • @mention a teammate to notify them    │
│  • Pin important notes to the top        │
│  • Set colors to categorize              │
│                                          │
│  [Acknowledge] [Delete]                  │
└─────────────────────────────────────────┘
```

**2. Solo User Confusion**
"Why would I leave notes for myself? I have a desk."

**The Fix (still needed):**
Landing page copy that addresses solo users:
- "Remember to update the homepage hero when the sale ends"
- "Note to self: Client requested blog post by Friday"
- "Track feedback across multiple logins"

**3. Team Features Hidden**
@mentions, acknowledgments, expiry — none of this is discoverable on first use.

**The Fix (still needed):**
- Tooltip on first note: "Tip: Type @ to mention a teammate"
- Visual example in empty state showing sample notes with features highlighted

### Emotional State Assessment

| Stage | Feeling | Target Feeling |
|-------|---------|----------------|
| Install | "Sticky notes? Cute" | "This could be useful" |
| Dashboard view | "It's empty" | "Look at this friendly note!" |
| First note | "Okay, I made a note" | "This is already helping me" |
| After 5 minutes | "Meh, I have Slack" | "This is perfect for WordPress-related stuff" |

**Onboarding Grade:** C- (Good concept, cold execution)

---

## Great Minds Plugin

### First-5-Minutes Reassessment

**What We Said Two Weeks Ago:**
- README overwhelm (14 agents, 17 commands)
- "Where do I even start?"
- PRD format unclear

**What's Changed:**
Product continues to mature, but onboarding for new users remains challenging. This is still a power user tool with power user friction.

### Current Pain Points

**1. The Wall of Text**
New user opens GitHub README. Sees 14 agent personas, 17 commands, architecture diagrams, deployment options. Eyes glaze over.

**The Fix (still needed):**
QUICKSTART.md — separate file, prominent link:
```markdown
# Your First Great Minds Project in 5 Minutes

## Step 1: Install
npx plugins add great-minds

## Step 2: Create Project
/agency-start hello-world

## Step 3: Add This Sample PRD
[Copy this exact text into hello-world.md]
---
Project: Hello World Landing Page
Goal: Single-page site with headline, 3 features, CTA
Pages: 1
---

## Step 4: Launch
/agency-launch

## Step 5: Watch the Magic
Your 7 agents are now debating, planning, and building.
Check back in 10-15 minutes.

## What's Next?
- Read the full documentation: [README.md]
- Try a real project: [TEMPLATES.md]
```

**2. No Feedback During Execution**
User launches pipeline. Terminal shows... something. Is it working? How long? What's happening?

**The Fix (still needed):**
- Progress visualization: "Debate Round 1/2... Planning Phase... Building Feature 3/5..."
- Estimated time: "Based on PRD complexity, this should take ~20 minutes"
- Telegram notifications (exists but not emphasized in onboarding)

**3. Intimidation Factor**
"This looks powerful but I don't have time to learn this."

**The Fix (still needed):**
- Video walkthrough (2-3 minutes) embedded at top of README
- "See Great Minds build a landing page" with actual screen recording
- Clear time commitment: "Your first project will take 30 minutes. After that, projects run themselves."

### Emotional State Assessment

| Stage | Feeling | Target Feeling |
|-------|---------|----------------|
| Discovery | "Wow, autonomous dev?" | "I need to try this" |
| README | "This is overwhelming" | "Oh, there's a quickstart!" |
| First command | "Did that work?" | "Great, it's running!" |
| During execution | "Is anything happening?" | "I can see the progress!" |
| After completion | "That was a lot of setup" | "That was AMAZING" |

**Onboarding Grade:** D+ (Powerful but intimidating)

---

## Shipyard AI

### First-5-Minutes Reassessment

**What We Said Two Weeks Ago:**
- Tokens mean nothing to non-technical buyers
- Emdash dependency unclear
- No portfolio or examples
- Quote delay creates dropout

**What's Changed:**
Shipyard Care is being built (post-delivery engagement). But this is for AFTER someone becomes a customer. The first-5-minutes experience for prospective customers remains problematic.

### Current Pain Points

**1. Token Translation Missing**
"500K-2M tokens" — Is that a lot? Does that get me a homepage or a whole website?

**The Fix (still needed):**
```
Pricing Card:
┌─────────────────────────────────────────┐
│  Emdash Sites                            │
│  500K-2M tokens                          │
│                                          │
│  What does that mean?                    │
│  • 500K ≈ 5-page marketing site          │
│  • 1M ≈ 15-page business site            │
│  • 2M ≈ 50+ page enterprise site         │
│                                          │
│  [See examples for each tier]            │
└─────────────────────────────────────────┘
```

**2. No Proof of Capability**
"100% ship rate" but... where? Show me.

**The Fix (still needed):**
"Built with Shipyard" gallery:
- 6-10 live site examples
- Each shows: Screenshot → PRD summary → Token cost → Timeline
- Filter by type: Site | Theme | Plugin

**3. Quote Wait Time**
"Quote within 24 hours" is eternity. Momentum dies.

**The Fix (future):**
- Instant ballpark estimator: "Based on your description, this looks like ~1M tokens (~$X). [Get detailed quote] or [Start now with estimate]"
- For confident buyers: Self-serve checkout option

**4. Emdash Confusion**
"What's Emdash? Do I need to know this platform?"

**The Fix (still needed):**
Brief explainer in FAQ or tooltip:
```
What's Emdash?
Emdash is a modern CMS built on Astro — lightning fast,
developer-friendly, and perfect for marketing sites.
You don't need to know Emdash to work with us.
We handle everything.
```

### Emotional State Assessment

| Stage | Feeling | Target Feeling |
|-------|---------|----------------|
| Landing | "AI builds websites? Interesting" | "This is exactly what I need" |
| Pricing | "Tokens? What's a token?" | "Oh, clear examples!" |
| Examples | "Where are the examples?" | "These sites look great" |
| Quote request | "Hope to hear back soon" | "Already have a ballpark" |
| After 5 minutes | "Let's see if they reply" | "I'm ready to buy" |

**Onboarding Grade:** C (Good concept, missing proof and clarity)

---

## Cross-Product First-5-Minutes Patterns

### Universal Improvements Needed

| Pattern | Problem | Fix | Products Affected |
|---------|---------|-----|-------------------|
| Empty states | Cold, lonely, no guidance | Welcome content, examples | Dash, Pinned |
| Feature discovery | Hidden capabilities | Tooltips, progressive reveal | All |
| Jargon | Tokens, API, commands | Human language translation | Shipyard, Great Minds |
| Social proof | No evidence of success | Examples, testimonials, numbers | Shipyard, LocalGenius |
| First action | User doesn't know what to do | Suggested actions, guided start | LocalGenius, Dash |

### The "Aha Moment" Gap (Revisited)

| Product | Current Aha | Time to Aha | Ideal Aha | Target Time |
|---------|-------------|-------------|-----------|-------------|
| LocalGenius | Auto-import business | ~2 min | First AI review response live | <3 min |
| Dash | First search result | ~30 sec | "I saved 6 clicks!" realization | <1 min |
| Pinned | Creating first note | ~1 min | Teammate acknowledges note | <5 min |
| Great Minds | `/agency-status` shows progress | ~15 min | Merged PR from agent | <30 min |
| Shipyard | Receiving quote | ~24 hrs | Live preview of homepage | <5 min |

---

## Top 3 First-5-Minutes Priorities

### 1. LocalGenius: System First Message + Prompt Suggestions (HIGH)

**Why:** The conversational UI is unfamiliar. Users stare at empty chat with no idea what to say.

**Implementation:**
1. System sends first message immediately after signup:
   - "Welcome, [Business]! I found your Google profile."
   - "You have [X] reviews with a [Y] average."
   - "Want me to draft responses to your [Z] unanswered reviews?"
2. Prompt suggestions below chat input:
   - "Reply to my latest review"
   - "Draft a weekend special post"
   - "Show me my performance"

**Success Metric:** First message sent by user within 60 seconds of signup (vs. current: unknown, likely 3+ minutes or never)

### 2. Shipyard: Token Translator + Portfolio Gallery (HIGH)

**Why:** Non-technical buyers don't understand token pricing, and there's no proof of quality.

**Implementation:**
1. Each pricing tier includes plain-English equivalent:
   - "500K tokens ≈ 5-page marketing site with custom design"
2. "Built with Shipyard" gallery on homepage:
   - 6 example sites with screenshots
   - PRD → Finished site comparison
   - Token cost and timeline for each

**Success Metric:** Bounce rate reduction on pricing page; quote request conversion increase

### 3. Universal Empty State Warmth (MEDIUM)

**Why:** Blank dashboards feel like abandonment. Users need a welcome.

**Implementation:**
- **Dash:** First-time welcome modal explaining search, commands, users
- **Pinned:** Pre-populated welcome note from "The Pinned Team"
- **Great Minds:** QUICKSTART.md with hello-world PRD

**Success Metric:** Plugin activation → meaningful action within 5 minutes

---

## Emotional Design Scorecard

| Product | Clarity | Warmth | Confidence | Delight | Overall |
|---------|---------|--------|------------|---------|---------|
| LocalGenius | B | B- | B | C+ | B- |
| Dash | B | D | C | D | C- |
| Pinned | B+ | D | C | C | C |
| Great Minds | C | D | C | C | C- |
| Shipyard | C+ | B | C | C | C+ |

---

## The Warmth Principle

Every first-5-minutes experience should feel like:
- Walking into a friend's home (not a corporate lobby)
- Being greeted by name (not ignored at the door)
- Receiving a gift (not an invoice)
- Understanding immediately what to do (not wandering lost)

**The test:** Would a nervous first-time user feel MORE or LESS anxious after 5 minutes?

**Current state:** Most products add anxiety through empty states, unclear next steps, and technical jargon.

**Target state:** Every product should be anxiety-reducing. "Oh, this is easy. Oh, this is helpful. Oh, I'm glad I found this."

---

*Oprah Winfrey | Shipyard AI Board*
*"Turn your wounds into wisdom, and your confusion into clarity. But first, make sure people can find the door."*
