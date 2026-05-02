# Board Review — Oprah Winfrey
**Date:** 2026-05-02
**Agent:** Oprah Winfrey
**Focus:** New User Confusion, First-5-Minutes
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

I have one question for every product: *Does a tired, distracted, non-technical person feel seen in the first five minutes?*

The honest answer: sometimes. But not consistently. And "sometimes" is not good enough when you're asking someone to trust you with their business, their website, or their daily workflow.

I see brilliant engineering. I see robust architecture. But I also see moments where we make the user *work* to understand us, instead of us working to understand the user.

---

## Product-by-Product Analysis

### 1. LocalGenius — ❌ FIRST 5 MINUTES NEED RESCUE

**The Scenario:** Maria, who runs a small restaurant, hears about LocalGenius. She goes to localgenius.company. She's skeptical. She's been burned by marketing tools before. She has 8 minutes before the lunch rush.

**What happens now:**
Maria lands on the homepage. She sees "AI marketing for local businesses." Okay, that's clear. But then what? The demo mode exists (per memory: Maria's Kitchen dataset), but I need to know: is it *front and center*? Or is it buried behind a login wall?

**The Confusion Points I Worry About:**
1. **"What do I actually DO here?"** — AI marketing is abstract. Does Maria see a concrete first step? "Connect your Google Business Profile"? "Upload your menu"? Or does she see a chatbot that says "How can I help you today?" — which puts the burden on *her* to know what to ask?
2. **The Empty State Problem** — If Maria signs up and doesn't have reviews yet, what does she see? A blank dashboard is a conversion killer. Does she get guided to solicit her first review? Does she see a sample of what her marketing could look like?
3. **The Pricing Page Cliff** — Per memory #154, `/pricing` returns 200. But what does it *say*? Is there a free tier that lets her taste the magic before paying? Or does she hit a paywall before she understands value?
4. **Login Before Value** — The login page works. But why does she need to log in before she sees the demo? The demo should be the *front door*.

**The Emotional Test:**
Does Maria feel like LocalGenius *knows* her? Or does she feel like she's talking to a generic chatbot that could be selling her anything?

**First-5-Minutes Score:** 4/10

**Fix:**
- Make the Maria's Kitchen demo the *homepage*. No login required. Let every visitor "become Maria" for 5 minutes.
- Add a "Start with your business" flow that asks 3 questions: business name, type, biggest marketing worry. Then generate a *personalized* preview of what LocalGenius would do for *them*.
- Never show an empty dashboard. Every new user should see a "Your first campaign" template ready to customize, not a blank canvas.

---

### 2. Shipyard AI — ⚠️ CONFUSING VALUE PROPOSITION

**The Scenario:** Jake, a freelance designer, hears Shipyard AI can "build websites automatically." He goes to www.shipyard.company. He's curious but skeptical. He's seen Wix. He's seen Squarespace. Why is this different?

**What happens now:**
Jake sees "Autonomous site builder." Cool. But then he sees example sites: Bella's Bistro, Craft & Co, Peak Dental, Sunrise Yoga. Are these real businesses? Demo sites? Can he click around? And if he wants one for *his* client, what does he do?

**The Confusion Points:**
1. **"Is this for me or my client?"** — The positioning is muddy. Is Shipyard a tool for agencies? For business owners? For developers? The homepage needs to pick a lane.
2. **"How do I start?"** — "Drop a PRD in prds/" — Jake doesn't know what a PRD is. He certainly doesn't have one. The entry point assumes technical fluency that 90% of users don't have.
3. **"What does it cost?"** — The SCOREBOARD.md tracks 37 projects. But where's pricing? Is it free? Pay-per-site? Subscription? The uncertainty prevents commitment.
4. **The Plugin Confusion** — 7 plugins are listed. 4 have "known issues." Jake sees EventDash working but MemberShip broken. Does he know which to trust? There's no "Start Here" plugin.

**The Emotional Test:**
Does Jake feel empowered? Or does he feel like he walked into a workshop where everyone else already knows how to use the tools?

**First-5-Minutes Score:** 3/10

**Fix:**
- Create three entry lanes on the homepage: "I'm a Business Owner" (leads to template selection), "I'm a Designer/Agency" (leads to PRD + customization), "I'm a Developer" (leads to plugin API docs).
- Add a "Generate my PRD" wizard. Ask 10 questions. Build the PRD for them. Don't make them write it.
- Put pricing front and center. Even if it's "Free during beta," say so. Ambiguity kills trust.
- Add a "Ship in 24 hours" guarantee badge. Confidence converts.

---

### 3. Dash — ✅ ALMOST THERE, ONE FRICTION POINT

**The Scenario:** Sarah, a WordPress content manager, installs Dash. She hears it makes WordPress faster to navigate.

**What happens now:**
She installs the plugin. She presses Cmd+K. A beautiful command palette appears. This is the *best* first 5 minutes in the portfolio. Immediate utility. Immediate "aha."

**The One Confusion Point:**
After the initial magic wears off, Sarah thinks: "What else can this do?" The plugin has no onboarding tour. No "Pro Tips" tooltip. No discovery path for advanced features (user search, settings jump, custom commands). She might use it for "Pages → Edit" and never know it can search users.

**The Emotional Test:**
Does Sarah feel like she discovered a superpower? Or does she use 10% of it and forget the rest?

**First-5-Minutes Score:** 7/10
**First-30-Days Score:** 5/10 (discovery failure)

**Fix:**
- Add a 3-step onboarding tour after first Cmd+K: "Try searching for a page" → "Try jumping to Settings" → "Try finding a user."
- Add a "Did you know?" hint system that surfaces one unused feature per week.
- Show command usage stats in the WP admin: "You've saved 47 clicks this week." Positive reinforcement creates habit.

---

### 4. Pinned — ✅ GOOD FIRST IMPRESSION, MUDDY ONBOARDING

**The Scenario:** Marcus, a marketing lead, installs Pinned for his team's WordPress dashboard.

**What happens now:**
He installs it. He sees a dashboard widget. He creates his first note. It's yellow. It sticks. Immediate tactile satisfaction.

**The Confusion Points:**
1. **"Who else sees this?"** — The first note's visibility is unclear. Is it just Marcus? The whole team? Does he need to @mention someone to share it? Uncertainty about visibility makes people cautious about what they write.
2. **"What do the colors mean?"** — Five colors (yellow, blue, green, pink, orange) but no legend. Teams invent their own conventions, which is fine, but a default meaning (yellow = info, red/pink = urgent, blue = task) would reduce cognitive load.
3. **"What happens when this expires?"** — Notes can have expiry dates. But what does "expiry" mean? Does it delete? Archive? Fade? The user shouldn't have to guess.
4. **"How do I organize these?"** — The v1.1 spatial drag-and-drop is "reserved but not implemented." So notes are just... a list? A grid? How do I find the note from 3 weeks ago?

**The Emotional Test:**
Does Marcus feel like this is a *team* tool? Or a personal sticky that happens to live on a shared screen?

**First-5-Minutes Score:** 6/10

**Fix:**
- Add a visibility toggle on *every* note creation: "Just me / My team / Specific people." Default to "My team" — social tools should default to social.
- Add a legend tooltip: "💛 Info | 💙 Task | 💚 Done | 🩷 Urgent | 🧡 Reminder"
- Make expiry behavior explicit: "This note will fade on [date] and archive after 30 days."
- Add search. Even a simple text search across notes. Without it, Pinned dies at 20+ notes.

---

### 5. Great Minds Plugin — ❌ EXPERTS ONLY

**The Scenario:** Priya, a senior developer, hears about Great Minds. She wants better AI assistance in Claude Code.

**What happens now:**
She finds the repo. She sees 22 personas, 17 skills, a daemon, a MANUAL.md that's 49KB. She feels overwhelmed before she installs anything.

**The Confusion Points:**
1. **"Which install is for me?"** — Full (Claude Code), Lite (Cowork + Code), DXT (Desktop app). Priya doesn't know what DXT is. She doesn't know if she's "Full" or "Lite." The decision fatigue is real.
2. **"What does this actually DO?"** — The feature list is huge: `/agency-start`, `/agency-debate`, `/agency-plan`, `/constellation-start`... but what problem does it solve? "Multi-agent framework" is a mechanism, not a benefit.
3. **"How do I know it's working?"** — The daemon has resilience features, crash recovery, Telegram notifications. But Priya just wants to know: did my command run? Is the agent alive? The observability is built for operators, not users.
4. **The First Command Panic** — She types `/agency-start`. What happens? Does it ask questions? Does it run immediately? Does it cost money (API tokens)? The uncertainty prevents the first step.

**The Emotional Test:**
Does Priya feel like she's joining a powerful movement? Or does she feel like she's signing up for a second job as a DevOps engineer?

**First-5-Minutes Score:** 2/10

**Fix:**
- Create a "2-Minute Setup" page. One install path. One command to verify. One "Hello World" project.
- Lead with a *use case*, not a feature list: "Ship a WordPress plugin in 3 hours with 5 AI agents." Then show how.
- Add a `/great-minds-status` command that says: "✅ Daemon running | ✅ 22 personas loaded | ✅ Last agent: Jobs (2 min ago) | 💰 Tokens used today: $0.42"
- Record a 90-second video. Not a tutorial. A *demonstration*. Let people see the magic before they install.

---

## Cross-Portfolio First-5-Minutes Audit

| Product | Clarity of Value | Ease of First Step | Emotional Reward | Score |
|---------|------------------|-------------------|------------------|-------|
| LocalGenius | 6/10 | 3/10 | 4/10 | 4/10 |
| Shipyard AI | 4/10 | 2/10 | 3/10 | 3/10 |
| Dash | 8/10 | 9/10 | 6/10 | 7/10 |
| Pinned | 7/10 | 7/10 | 5/10 | 6/10 |
| Great Minds | 3/10 | 2/10 | 2/10 | 2/10 |

**Average: 4.4/10**

That is unacceptable. We are making people *work* to love us.

---

## The Oprah Test — 3 Questions for Every Product

I want these asked in every standup, every design review, every board meeting:

1. **"Would my mother understand this in 30 seconds?"** — Not "could she eventually figure it out." Would she *immediately* know what it is and why she needs it?
2. **"Does the user feel smarter or dumber after 5 minutes?"** — Great products make users feel capable. Confusing products make users feel inadequate.
3. **"Where is the hug?"** — Where is the moment of warmth, delight, or recognition that tells the user "we see you, we're glad you're here"?

Right now:
- Dash gives a hug on Cmd+K, then forgets to keep hugging.
- Pinned gives a hug on the first sticky, then gets messy.
- LocalGenius, Shipyard, and Great Minds are waiting for the user to knock on the door instead of opening it with a smile.

---

## Recommendations (Ranked by User Impact)

### P0: Shipyard AI "Start Here" Lane
Add the three-entry-point homepage (Business Owner / Designer / Developer) and the PRD wizard. This is our most visible product. It should not require a CS degree to begin.

### P1: LocalGenius Demo-First Homepage
Make Maria's Kitchen the homepage. Every visitor becomes Maria for 5 minutes. Add the 3-question personalization flow. No one should see a login wall before they see value.

### P2: Great Minds "2-Minute Setup"
One install path. One verification command. One video. Cut the 49KB MANUAL.md down to a 1-page Quick Start. The full manual stays, but it's not the front door.

### P3: Dash Feature Discovery + Pinned Organization
Add the onboarding tour and weekly tips to Dash. Add visibility toggles, color legend, and search to Pinned.

---

## Closing Thought

You can have the best engineering in the world. You can have 770 tests and 95% success rates and sub-2% AI cost ratios. But if a tired person doesn't feel welcomed, seen, and empowered in the first five minutes, none of that matters.

Technology is easy. *Making people feel capable* is hard. That's our job.

*Oprah Winfrey*
*Board Member, Shipyard AI*
