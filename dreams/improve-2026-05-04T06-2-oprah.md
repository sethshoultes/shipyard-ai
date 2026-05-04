# Board Review — Oprah Winfrey
**Date:** 2026-05-04
**Agent:** Oprah Winfrey
**Focus:** New User Confusion, First-5-Minutes
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

Two days ago I scored our portfolio average at 4.4/10 for first-5-minutes experience. After learning what actually shipped, I need to lower that score. Two of our products don't survive the first 5 *seconds* — they throw fatal errors on activation.

A user who installs a plugin and immediately sees a white screen of death doesn't feel confused. They feel betrayed. And betrayal travels faster than delight.

---

## Product-by-Product Analysis

### 1. LocalGenius — ❌ FIRST 5 MINUTES STILL BROKEN

**The Scenario:** Maria, restaurant owner, 8 minutes before lunch rush.

**What Changed Since May 2:**
Nothing meaningful for Maria. The Maria's Kitchen demo still exists, but we learned from the codebase exploration that the widget frontend — the actual chat interface Maria would use — is not activated. She can see the admin panel, but her customers can't see the AI on her site.

**The New Confusion Point:**
"I signed up, I connected my Google Business Profile, but where's the chat widget on my actual website?" The invisible widget is worse than no widget. It creates a trust gap. Maria thinks she's done something wrong.

**First-5-Minutes Score:** 3/10 (down from 4/10 — the gap between promise and delivery is now visible)

**Fix This Week:**
- Make the widget visible by default. Auto-inject it with a "Powered by LocalGenius — Click to chat" badge.
- Do not require a separate "activation" step. If the plugin is installed and the API key is set, the widget should render.

---

### 2. Shipyard AI — ❌ FIRST 5 SECONDS = 404

**The Scenario:** Jake, freelance designer, hears about Shipyard AI. Goes to www.shipyard.company.

**What Changed Since May 2:**
Nothing. Issue #98 is still in the `failed/` directory. The custom domain DNS points to Vercel IPs that return 404s. The `.pages.dev` URL works, but Jake doesn't know that.

**The Confusion Point:**
Jake types `shipyard.company`. He sees a 404. He thinks the company is dead. He leaves. That is not a first-5-minutes problem. That is a first-5-seconds extinction event.

**First-5-Minutes Score:** 0/10

**Fix Today:**
- Update DNS records or redirect `shipyard.company` to the working `.pages.dev` URL.
- Add post-deploy domain verification to the pipeline. This cannot happen again.

---

### 3. Beam (Cmd+K) — ✅ GREAT FIRST 5 SECONDS, POOR FIRST 30 DAYS

**The Scenario:** Sarah, WordPress content manager. Presses Cmd+K.

**What Changed:**
No changes since May 2. The palette still works beautifully on first open. But I now see that the actual product in our portfolio is "Beam," not "Dash." The naming confusion means Sarah might search for "Dash" help docs and find nothing.

**The Confusion Points:**
1. **No onboarding tooltip.** Sarah discovers Cmd+K by accident or blog post. Never by the product itself.
2. **No empty-state help.** When search returns nothing, the modal just... closes. No "Try searching for 'post' or 'user'" guidance.
3. **Keyboard collision with Gutenberg.** `Cmd+K` is used by Gutenberg for link insertion. On post-edit screens, Dash (Beam) and Gutenberg fight. Sarah doesn't know why her link dialog is suddenly a command palette.

**First-5-Minutes Score:** 7/10
**First-30-Days Score:** 4/10 (down from 5/10 — collision issue discovered)

**Fix This Week:**
- Add a floating "Cmd+K" hint in wp-admin that dismisses after first use.
- On empty search results, show: "Tip: Try 'post', 'page', 'user', or 'settings'."
- Detect Gutenberg context and remap to `Cmd+Shift+K` on post-edit screens.

---

### 4. Pinned (WP Intelligence Suite) — ❌ FIRST 5 SECONDS = FATAL ERROR

**The Scenario:** Marcus, marketing lead. Installs Pinned from the WP Intelligence Suite.

**What Happens:**
White screen. `Fatal error: Class 'Pinned_Agreements_List_Table' not found.`

**First-5-Seconds Score:** 0/10

**Fix Today:**
Either ship the missing `class-agreements-list-table.php` file or remove Pinned from the distribution until it's fixed. A broken plugin is not a product. It's a liability.

---

### 5. Great Minds Plugin — ❌ STILL EXPERTS-ONLY

**The Scenario:** Priya, senior developer.

**What Changed:**
`MANUAL.md` is still 49KB. The three install paths (Full, Lite, DXT) still create decision fatigue. No 2-minute setup page has been created.

**New Confusion Point:**
The `prds/completed/prd-agentpress-2026-05-03.md` proves we can ship complex PRDs quickly. But Great Minds — our own product — has no equivalent "hello world" PRD that a new user can run to verify everything works. The first command a user should run is `/great-minds-demo`, which spins up a toy project end-to-end. It doesn't exist.

**First-5-Minutes Score:** 2/10

**Fix This Week:**
- Create `/great-minds-demo` — one command that runs a 5-minute toy project (e.g., "Build a landing page for a fictional coffee shop") so Priya can see the magic before she commits her own project.

---

## Cross-Portfolio First-5-Minutes Audit (Revised)

| Product | Clarity of Value | Ease of First Step | Emotional Reward | Score |
|---------|------------------|-------------------|------------------|-------|
| LocalGenius | 6/10 | 2/10 | 3/10 | 3/10 |
| Shipyard AI | 0/10 | 0/10 | 0/10 | 0/10 |
| Beam (Cmd+K) | 8/10 | 9/10 | 5/10 | 7/10 |
| Pinned (WP Suite) | 0/10 | 0/10 | 0/10 | 0/10 |
| Great Minds | 3/10 | 2/10 | 2/10 | 2/10 |

**Average: 2.4/10**

We dropped from 4.4 to 2.4 because we discovered two products are broken and one storefront is 404ing. This is not acceptable.

---

## The Oprah Test — Updated

1. **"Would my mother understand this in 30 seconds?"**
   - She'd understand Beam. She'd see a 404 for Shipyard. She'd see a white screen for Pinned. She'd give up on Great Minds before the install finished.

2. **"Does the user feel smarter or dumber after 5 minutes?"**
   - A fatal error makes a user feel incompetent. They think they broke something. We broke it. We made them feel dumb.

3. **"Where is the hug?"**
   - Right now, the only hug is Beam's Cmd+K open animation. Every other product either slaps the user (fatal error) or ignores them (404).

---

## Recommendations (Ranked by User Impact)

### P0: Fix the Fatal Errors
Shipyard 404 + Pinned fatal = immediate user loss. These are not improvements. They are emergency repairs.

### P1: Make the LocalGenius Widget Auto-Render
Remove the activation barrier. If the plugin is installed, the widget should appear. Let Maria see it on her site in minute 4, not day 4.

### P2: Beam Onboarding + Collision Fix
Add the floating hint and the Gutenberg collision detection. First-5-minutes magic dies if the shortcut breaks link insertion.

### P3: Great Minds Demo Command
One command. One toy project. Five minutes of visible magic.

---

## Closing Thought

I said on May 2: "Technology is easy. Making people feel capable is hard."

Today I need to add: Making people feel capable is impossible if the product doesn't even load.

We are not in the business of impressing ourselves with shipped PRDs. We are in the business of making tired, distracted humans feel like heroes.

A 404 is not a hero moment. A fatal error is not a hero moment.

Let's fix what breaks. Then let's build what delights.

*Oprah Winfrey*
*Board Member, Shipyard AI*
