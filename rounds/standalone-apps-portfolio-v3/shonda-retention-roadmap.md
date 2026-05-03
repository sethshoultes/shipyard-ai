# Retention Roadmap — What Keeps Them Coming Back

**Shonda Rhimes, Showrunner**

**For:** Standalone Apps Portfolio v1.1 (post-distribution / post-verdict)

**Core belief:** A portfolio that does not move is a tombstone. Users do not return to read a brochure twice. They return for the next chapter.

---

## v1.0 Baseline (What Must Ship First)

Before any retention layer works, the page must pass the board verdict. That means:
- PRD-verbatim copy
- One human sentence per app (who it's for, what pain it kills)
- One living signal (something that changes without a code deploy)

Once that ships, v1.1 is the layer that turns a visitor into a subscriber.

---

## v1.1 Retention Architecture: The Binge Factor

### 1. Serialized Build Logs — "The Writer's Room"
**What:** Weekly build logs published as serialized chapters, one per app.
- Not release notes. *Scenes.*
- "Monday: The bug that almost killed the export button. Tuesday: The user who cried when it worked. Wednesday: The commit that made it 10x faster."
- Signed by the builder. Human name, human voice.

**Why it retains:** It creates appointment television. If the log drops every Tuesday morning, the user clears five minutes to read it. That is a habit. Habits are retention.

**v1.1 Feature:**
- `/work/[slug]/log` route or in-page tab.
- Auto-generated from a markdown file in the repo, parsed at build time.
- RSS feed at `/work/feed.xml` so subscribers get it in their reader without visiting.

---

### 2. Live GitHub Pulse — "The Heartbeat"
**What:** A real-time (or near-real-time) feed of commits, open issues, and merged PRs for every app with a public repo.

**Why it retains:** A BUILD status badge is a colored pill doing nothing. A commit graph is proof of life. Users return to see if the heart is still beating.

**v1.1 Features:**
- "Last commit: 2 hours ago" micro-copy on each card.
- Small sparkline or commit count for the last 7 days.
- Link to open issues with count: "3 issues open — help wanted."
- For SHIPPED apps: "Latest release: v1.2.4 (4 days ago)."

**Technical note:** GitHub API calls at build time (static) or lightweight client-side fetch for the pulse. If build-time, the site rebuilds on a schedule (daily) to keep the pulse fresh.

---

### 3. "Watch This Ship" — The Notification Hook
**What:** A button on every BUILD app: *Watch This Ship*. Click it, enter email, get notified on release.

**Why it retains:** It converts a passive visitor into an owned audience. On release day, you do not pray for traffic. You push a button and traffic arrives.

**v1.1 Features:**
- Email capture (minimal — email only, no friction).
- Auto-segment by app: Beam watchers vs. Tuned watchers.
- Release email template: "It shipped. Here's what changed. Here's why you should care."
- Optional: "+ Add to calendar" for estimated ship dates (even if they slip — tension is story).

---

### 4. The Open Loop — "Coming Next Week"
**What:** A tease for the next app before it has a name, a logo, or a repo.
- "App #4: A tool for people who hate waiting. Currently in discovery."
- Update it weekly. "App #4: Name locked. Wireframes in Figma."

**Why it retains:** Curiosity is an open loop. The human brain hates open loops. They return to close it.

**v1.1 Feature:**
- Dedicated teaser slot on `/work` landing page, below the shipped grid.
- Updates sourced from a simple JSON or markdown file — no deploy required if paired with a lightweight data refresh.

---

### 5. Content Flywheel — "The Press Room"
**What:** A blog or journal attached to the portfolio, not separate from it.
- Case studies: "How [User Name] used Beam to cut their publishing time by 40%."
- Behind-the-scenes build logs (extends the serialized chapters).
- User quotes with faces. Real names, real screenshots.
- Discord or community invite: "Join the writers' room."

**Why it retains:** Three apps is a puddle. Three apps + twelve stories is a library. Libraries have return visitors.

**v1.1 Features:**
- `/work/journal` index page.
- OG images auto-generated for every journal post (distribution + retention in one).
- Newsletter gate at the bottom of every post: "Get the next chapter."
- Tag-based navigation: #build-log, #case-study, #teaser.

---

### 6. BUILD Status as Narrative Tension
**What:** Transform "BUILD" from a static label into a living story.
- Instead of: `Status: BUILD` (amber pill)
- Use: "In Build — 47 commits this week, 2 open issues, estimated ship: March 15. Join the beta list."

**Why it retains:** Tension demands resolution. The user checks back to see if the tension resolved — if the app shipped, if the bug died, if the promise was kept.

**v1.1 Features:**
- Plain-text status rendered as narrative, not badge (complies with essence "No badges" mandate).
- Link to the live GitHub milestone or project board.
- Beta invite form for BUILD apps: "Be the first to break it."

---

## Retention Metrics (What We Track in v1.1)

| Metric | Target | Why |
|---|---|---|
| Return visitor rate | > 30% | Proof the page is alive |
| "Watch This Ship" sign-ups | > 50 per app | Owned audience, not rented traffic |
| RSS / newsletter subscribers | > 100 in first 60 days | Habit formation |
| Journal post avg. time on page | > 2:00 | Story is sticking |
| Release-day email open rate | > 40% | Distribution that compounds |

---

## What We Do NOT Build in v1.1

- **Comments section.** Trolls and maintenance overhead. If users want to talk, they join Discord.
- **User accounts / auth.** Too heavy for a portfolio. Email segmenting is enough until app #7.
- **Analytics dashboard for visitors.** We track retention; we do not show visitors their own behavior. Creepy, not sticky.
- **Gamification (badges, streaks, points).** Confetti. The essence says no badges. Story is the only reward.

---

## One-Line Mandate

> "Three great stories beat thirty catalog entries. Make each app feel inevitable — and make the next chapter impossible to miss."

---

*The story doesn't end at shipping. The story starts there.*
