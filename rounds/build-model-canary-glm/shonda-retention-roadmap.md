# Shonda Retention Roadmap — What Keeps Users Coming Back

## Thesis
A green checkmark is a moment, not a reason to return. Season two happens when the canary becomes a character and the build becomes a story. We are not building a dashboard. We are building a reason to open the app tomorrow.

---

## v1.1 — "The Canary Has a Name"

### 1. Character / Protagonist
- **Name the canary.** Users pick a default or name their own. The canary has an avatar that changes expression based on build health.
- **Mood states:** Singing (all green), Preening (warning), Silent (failure), Ghost (no builds in 24h).
- **Build as episode:** Every deploy is a scene. Every model swap is a guest star. The canary either survives or doesn't. Stakes.

### 2. Progress Loops & Streaks
- **Survival streak:** "GLM has survived 12 consecutive builds." Loss aversion kicks in when the streak breaks.
- **Model wellness score:** Rolling 7-day health average per model. Users want to see their chosen model climb the leaderboard.
- **Diagnostic drama meter:** A visual tension graph that spikes before risky deploys. Humans love anticipation.

### 3. "Last Sang" Feed
- Timestamped heartbeat log: "Sang 3 minutes ago · Slugify passed · Truncate survived."
- **Emotional cliffhanger:** If a canary hasn't sung in > 24h, the feed shows a grayed-out silhouette with the copy: "No one has heard from Luna since yesterday. Run a build?"
- This turns passive telemetry into active curiosity.

### 4. Shareable Artifacts
- **Canary Cards:** Auto-generated PNG/svg summaries of a build episode. "Luna survived the GLM nightshift. 14/14 tests passed. No hollow builds detected."
- **UGC layer:** Engineers can attach 1-line "director's notes" to any build. "This one almost died on the ellipsis edge-case." Social proof + narrative annotation.
- **Season finale digest:** Weekly email/slack wrap-up with survival stats, top model, and a single "episode highlight" chosen by the system.

### 5. Onboarding as Pilot Episode
- First-time users see a 60-second cold open: "Meet Luna. Your job: keep her singing."
- First build triggers a guided "episode one" with animated survival arc.
- Non-engineers get a "producer view" — health score, streak, and mood — without needing to read `.sh` files.

---

## What This Fixes
| Problem (v1.0) | v1.1 Fix |
|---|---|
| No user | The user is the producer keeping the character alive |
| No aha moment | Streak creation = dopamine |
| No progress loop | Daily wellness pulse + streak |
| No content flywheel | Canary Cards + director's notes = UGC |
| No emotional cliffhanger | "Last sang" ghost state |
| No season two | Weekly season finale + expanding model roster |

---

## Metrics That Matter
- **Day-1 return rate:** Do they check the canary within 24h of first build?
- **Streak preservation rate:** How often do users intentionally run a build just to keep the number alive?
- **Card share rate:** Are Canary Cards escaping Slack DMs and reaching Twitter?
- **Ghost recovery rate:** When a canary goes silent, what % of users manually trigger a build to "see if she's okay"?

---

*Even internal tools need a heartbeat. v1.0 proved the canary can sing. v1.1 makes us care whether she stops.*
