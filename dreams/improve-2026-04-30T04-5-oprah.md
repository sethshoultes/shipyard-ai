# Board Review — Oprah Winfrey
## featureDream IMPROVE Cycle | 2026-04-30
## Lens: New User Confusion & The First 5 Minutes

---

## Executive Summary

**Verdict: We are asking people to trust us before we have earned it.**

I have spent my career watching people decide in the first five minutes whether they belong in a room. These products are losing that decision. Not because the technology is bad — the technology is often excellent. But because the *invitation* is unclear, the *path* is blocked, or the *promise* is broken before the user ever feels seen.

The pattern across this portfolio is sobering: we build for the power user and abandon the newcomer.

---

## Product-by-Product First-5-Minutes Analysis

### 1. Shipyard AI (www.shipyard.company)

**The Question That Kills Conversion: "Is this really AI, or a person pretending?"**

Your own pricing page admits the truth: "Both." I love the honesty. I hate the strategy. You are asking a small business owner — someone who has been burned by agencies before — to pay $2,500-$15,000 for something you cannot clearly define.

**First-5-minutes walkthrough:**
- **Minute 1**: Homepage is beautiful. "PRD in. Production out." Clear promise.
- **Minute 2**: Pricing page. Three tiers, token-based. Then the FAQ drops the bomb: "Is this really AI?" Both. The user now wonders: "Am I paying for a robot or a person? And if it's a person, why am I paying premium rates for something I could get on Upwork?"
- **Minute 3**: Tries to see examples. Clicks "Work." Four demo sites. Good.
- **Minute 4**: Tries to understand process. Clicks "Pipeline." 7 stages, 14 personas, token budgets. Overwhelming.
- **Minute 5**: Ready to try... but there is no "try." Only a contact form that submits a PRD. A PRD! You are asking a restaurant owner to write a Product Requirements Document.

**Critical confusion**: The gap between "autonomous AI agency" (marketing promise) and "submit a PRD and wait 48 hours for a human-managed quote" (actual experience) is a chasm. Users feel the mismatch in their gut before they can articulate it.

**First-5-minutes score: 3/10.** The website works. The story does not hold together under pressure.

---

### 2. LocalGenius (localgenius.company)

**The First-5-Minutes Score: 0/10. Because the frontend does not exist.**

This is not hyperbole. The WordPress plugin directories are empty. The onboarding flow — "60-second activation with auto-detection" — is a spec, not a shipped experience. The contact form on the marketing site uses GET requests with no backend.

What a new user actually experiences:
1. Hears about "AI marketing for local businesses"
2. Goes to localgenius.company
3. Finds... Shipyard AI's agency website
4. Cannot find a product to install, sign up for, or even see a demo of
5. Leaves

**This is not confusion. This is abandonment territory.**

The designed experience is actually beautiful — "We found Maria's Trattoria. Does this look like you?" That moment of recognition, of being *seen*, is exactly what works. But it is theater. There is no curtain, no stage, no actors. Just an empty set.

**The tragedy**: The SPARK widget (Lite version) works. It is a single script tag. Ten kilobytes. But there is no path for a restaurant owner to discover it, install it, and feel smart for having done so.

**First-5-minutes score: 0/10.** You cannot confuse someone who cannot find you.

---

### 3. Dash (WP Command Palette / Team Notes)

**Score: 5/10. Competent but invisible.**

Activation is clean. The welcome seed note is well-written: "Dash helps your team track notes, mentions, and status in one place." A new user sees value immediately.

**But:**
- The plugin requires `wis-core`, which the user may not have. The error notice is clear, but it is still a dead end.
- No guidance on what to do next after reading the welcome note.
- `@mentions` do not work. The seed note *promises* them.
- No visual distinction between Open, In Progress, and Resolved in the list table.
- The name "Dash" suggests speed and command-palette efficiency. The actual product is a slow-loading admin page with basic CRUD.

**The promise mismatch**: Users expect a command palette (Cmd+K). They get a custom post type. The cognitive dissonance is subtle but real.

**First-5-minutes score: 5/10.** Functional but forgettable. The seed content saves it from failure.

---

### 4. Pinned (WP Sticky Notes / Agreements)

**Score: 5/10. Same as Dash. Good seed, missing heart.**

The sample agreement with three checklist items is a smart onboarding move. Users see structure immediately. But:
- The "pin" functionality does not exist. The product is called Pinned.
- Checklist checkboxes require saving the post. No AJAX. The user clicks a box, feels nothing, thinks it is broken.
- No explanation of what an "agreement" is versus a page or post.
- Categories exist but have no default terms. Blank taxonomy pages feel like abandonment.

**First-5-minutes score: 5/10.** The sample content carries the weight.

---

### 5. Great Minds Plugin

**Score: 4/10. Powerful but punishing.**

This is a tool for builders, not browsers. The first-5-minutes experience assumes you are comfortable with:
- Claude Code CLI
- Git worktrees
- Writing PRDs in markdown
- Environment variables and daemon processes

**The `/constellation-start` flow is good** — two questions, routed to the right plugin. But that assumes the user already has Claude Code installed, the plugin marketplace configured, and a project repository ready.

**What a new user actually feels:**
1. Excitement: "AI agents that debate and build software?"
2. Confusion: "Where do I click?"
3. Intimidation: "I need to learn Claude Code, write a PRD, and run a daemon?"
4. Deflection: "I'll come back when I have time." (They do not come back.)

**The onboarding gap**: There is no "Hello World" project that ships in 60 seconds. No web dashboard to watch the agents work. No sample PRD that produces something delightful on first run.

**First-5-minutes score: 4/10.** Brilliant architecture, hostile first impression.

---

## Cross-Portfolio Synthesis

| Product | First-5 Score | Core Confusion |
|---------|--------------|----------------|
| Shipyard AI | 3/10 | "Am I buying AI or people?" |
| LocalGenius | 0/10 | "Does this product exist?" |
| Dash | 5/10 | "Where is the command palette?" |
| Pinned | 5/10 | "Why can't I pin anything?" |
| Great Minds | 4/10 | "Where do I even start?" |

**Pattern identified**: We are building for the user we *wish* we had (technical, patient, PRD-writing) instead of the user we *actually* have (time-starved, skeptic, needs to feel smart in 60 seconds).

---

## Recommendations (Ranked by Clarity Impact)

### 1. Ship a LocalGenius "One-Click Demo" IMMEDIATELY
A live demo where a user enters their restaurant website URL and sees the SPARK widget preview with auto-detected FAQs. No signup. No install. Just: enter URL, see magic. This is the "You get a car!" moment. It turns confusion into delight.

### 2. Rewrite Shipyard AI's FAQ and Add a "Start with a Template" Flow
Stop saying "Both" to the AI question. Say: "AI does the work. Humans ensure quality." Then add a flow where users pick from 10 pre-written PRD templates (Restaurant, Dental, Yoga Studio) instead of writing their own. Lower the bar from "write a spec" to "fill in the blanks."

### 3. Build a Great Minds "First Run Wizard"
One command: `/agency-demo`. It runs a pre-written PRD for a trivial but delightful product (a personal countdown page, a quote generator). The user sees the full pipeline in 3 minutes. They feel the power before they understand the architecture.

### 4. Fix Dash's Name or Ship the Command Palette
Either rename Dash to "Team Notes" or actually build the Cmd+K command palette that the name promises. Promise mismatch is the quietest killer of trust.

### 5. Make Pinned's Checkboxes Work Without Saving
AJAX toggle. Instant feedback. The checkbox is a micro-interaction that either builds trust or destroys it.

---

> **Bottom line**: People do not buy what they do not understand. They do not return to what made them feel foolish. Every empty directory, every broken checkbox, every "both" answer is a door closing. We need to hold the door open — and make people glad they walked through.
