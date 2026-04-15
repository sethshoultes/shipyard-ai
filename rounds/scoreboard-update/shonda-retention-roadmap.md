# Shonda's Retention Roadmap: scoreboard-update v1.1

**Prepared by:** Shonda Rhimes
**Date:** 2026-04-15
**Focus:** What Keeps Users Coming Back

---

## The Problem

**Current scoreboard is a monument. Users visit once, then never return.**

Why? Zero narrative tension. No unresolved questions. No stakes. No serialization.

You built a Wikipedia article when you needed a Netflix series.

---

## Retention Psychology: The Three Hooks

### 1. **Unfinished Business**
People return when something is *incomplete*.
- Cliffhangers ("What happens next?")
- Progress bars ("How close are we?")
- Mysteries ("Why did that fail?")

### 2. **Social Comparison**
People return when they can *measure against others*.
- Leaderboards ("How do I rank?")
- Rivalries ("Our team vs theirs")
- Community validation ("Most upvoted project")

### 3. **Personalized Stakes**
People return when *their* outcome is pending.
- "My project is 67% complete"
- "My team just moved up in rankings"
- "My submission is under review"

**Scoreboard v1.0 has NONE of these.**

---

## v1.1 Feature Set: Retention Essentials

### **Feature 1: Live Pipeline Tracker**

**What:** Show in-progress projects, not just completed ones.

**Implementation:**
- Scan `/rounds/*/status.md` for projects in `RUNNING` or `IN_PROGRESS` state
- Display:
  - Project name
  - Current phase (PRD analysis, implementation, QA, etc.)
  - Time elapsed since start
  - Estimated completion (if available from agent logs)

**Retention Hook:**
- **Unfinished business:** "Will Project X ship today?"
- **Serialized updates:** Check back in 4 hours to see progress

**Scoreboard Section:**
```markdown
## 🔄 Active Pipelines (4 in flight)

| Project | Phase | Elapsed | Est. Completion |
|---------|-------|---------|-----------------|
| auth-v2-migration | QA Review | 2h 14m | ~45min |
| dashboard-widget | Implementation | 6h 03m | ~2h |
| api-rate-limiter | PRD Analysis | 18m | ~1h |
| mobile-onboarding | Blocked: awaiting user input | 4h 32m | — |
```

**Why it works:** Creates anticipation. Users return to see outcomes.

---

### **Feature 2: Project Graveyard (Failures Worth Studying)**

**What:** Spotlight BLOCK/REJECT projects with narrative autopsies.

**Implementation:**
- Filter for `verdict: BLOCK` or `verdict: REJECT` from QA reviews
- Extract failure reasons from `qa-review.md`
- Auto-generate 2-sentence summary: "What went wrong + What we learned"

**Retention Hook:**
- **Mystery:** "Why did 6% fail?"
- **Learning arc:** Failures are more interesting than successes

**Scoreboard Section:**
```markdown
## ⚠️ Projects That Didn't Ship (2 this month)

### `user-profile-redesign` — REJECTED
**Why:** Violated accessibility standards (missing ARIA labels, color contrast below WCAG AA).
**Lesson:** Front-end PRs now require automated a11y checks before QA.

### `payment-gateway-v3` — BLOCKED
**Why:** Security audit flagged SQL injection vulnerability in transaction logger.
**Lesson:** All DB queries now route through parameterized ORM (no raw SQL).
```

**Why it works:** Failures have drama. Users return to see if patterns emerge.

---

### **Feature 3: Velocity Leaderboard**

**What:** Rank projects by speed-to-ship, quality, or efficiency.

**Implementation:**
- Calculate metrics per project:
  - **Speed:** Start timestamp → completion timestamp
  - **Quality:** QA score (if numeric) or PASS/BLOCK/REJECT
  - **Efficiency:** Lines of code changed ÷ hours elapsed
- Display top 10 fastest, highest-quality, most efficient

**Retention Hook:**
- **Social comparison:** "Can my next project beat the record?"
- **Gamification:** Leaderboard refreshes weekly

**Scoreboard Section:**
```markdown
## 🏆 Speed Leaderboard (Last 30 Days)

| Rank | Project | Ship Time | Quality |
|------|---------|-----------|---------|
| 🥇 | config-hotfix | 0h 47m | PASS ✅ |
| 🥈 | docs-typo-sweep | 1h 12m | PASS ✅ |
| 🥉 | logger-refactor | 1h 58m | PASS ✅ |
| 4 | cache-invalidation | 2h 34m | PASS ✅ |
| 5 | webhook-retry-logic | 3h 09m | BLOCK ⚠️ |

*Minimum: 3 files changed, QA review completed.*
```

**Why it works:** Competition drives repeat visits. "Did anyone beat my time?"

---

### **Feature 4: Project Request Inbox**

**What:** Let users submit PRDs for pipeline consideration.

**Implementation:**
- Simple web form or `/submit-project` command
- Drops markdown file into `/rounds/_queue/` directory
- Scoreboard shows "Queued Projects (3 pending review)"

**Retention Hook:**
- **Personalized stakes:** "Is my submission approved yet?"
- **Community participation:** Users become contributors, not just observers

**Scoreboard Section:**
```markdown
## 📥 Queued Projects (3 awaiting review)

1. **E-commerce checkout optimization** — submitted by @alex, 2 days ago
2. **Real-time notification system** — submitted by @jordan, 5 hours ago
3. **Dark mode toggle** — submitted by @casey, 12 minutes ago

[Submit Your Project →](#)
```

**Why it works:** Users return to see if their submission was picked up.

---

### **Feature 5: Trend Graphs (Quality/Speed Over Time)**

**What:** Visualize pipeline health across weeks/months.

**Implementation:**
- Aggregate metrics by week:
  - Avg QA score
  - Avg ship time
  - Pass/block/reject ratios
- Generate ASCII art sparklines or link to Chart.js embeds

**Retention Hook:**
- **Pattern recognition:** "Are we getting faster?"
- **Narrative arc:** Shows improvement or decline over time

**Scoreboard Section:**
```markdown
## 📈 Pipeline Health Trends (Last 8 Weeks)

**Average Ship Time:**
```
Week: 1    2    3    4    5    6    7    8
Time: 4.2h 3.8h 5.1h 3.2h 2.9h 2.7h 3.0h 2.5h
      ▂▂▁▁▄▄▃▃▆▆▅▅▇▇▆▆████
      ↓ Improving →
```

**Quality Score (QA Avg):**
```
Week: 1    2    3    4    5    6    7    8
Score: 7.1  7.8  6.9  8.2  8.5  8.9  8.7  9.1
       ▃▃▅▅▂▂▆▆▇▇████▉▉██
       ↑ Trend: +28% vs Week 1
```

**Why it works:** Serialized data. "Let's check next week's numbers."

---

## Engagement Mechanics: What Makes Users Obsessed

### **Daily Rituals**
- **Morning check:** "What shipped overnight?"
- **Midday scan:** "Are active pipelines on track?"
- **Evening review:** "Did queued projects get picked up?"

### **Weekly Cadence**
- **Monday:** Leaderboard resets (race to top 3)
- **Friday:** "Week in Review" auto-summary (shipped vs blocked ratio)

### **Monthly Milestones**
- **Retrospective:** "Top 10 projects this month"
- **Hall of Fame:** All-time fastest/highest-quality projects
- **Lessons Learned:** Aggregated failure patterns

---

## v1.1 Implementation Priorities

| Feature | Retention Impact | Dev Effort | Priority |
|---------|------------------|------------|----------|
| **Live Pipeline Tracker** | 🔥🔥🔥 High | ~4 hours | **P0** |
| **Velocity Leaderboard** | 🔥🔥🔥 High | ~3 hours | **P0** |
| **Trend Graphs (Sparklines)** | 🔥🔥 Medium | ~2 hours | **P1** |
| **Project Graveyard** | 🔥🔥 Medium | ~3 hours | **P1** |
| **Project Request Inbox** | 🔥 Low (v1.1), High (v2.0) | ~8 hours | **P2** |

**Ship P0 first (Live Tracker + Leaderboard).** Validate retention before building P1/P2.

---

## Success Metrics: How We Know It's Working

### **Before v1.1 (Current State):**
- Scoreboard views: One-time (when project ships)
- Return rate: ~0% (no reason to revisit)
- Engagement: Passive (read-only)

### **After v1.1 (Target State):**
- **Daily active viewers:** 5+ per day (team checking pipeline status)
- **Return rate:** 40%+ (users checking leaderboard updates)
- **Engagement depth:** 3+ sections viewed per visit (not just summary stats)
- **Contribution:** 2+ user-submitted project requests per week

### **Measure via:**
- Server logs (if hosted) or Git commit timestamps (if static)
- Inline feedback form: "Was this scoreboard useful?" (Yes/No + optional comment)

---

## Anti-Patterns to Avoid

### ❌ **Over-Gamification**
- **Don't:** Turn everything into points/badges
- **Do:** Use leaderboards sparingly for *meaningful* metrics (speed, quality)

### ❌ **Notification Spam**
- **Don't:** Email users every time a project updates
- **Do:** Offer opt-in webhooks or RSS feeds for power users

### ❌ **Vanity Metrics**
- **Don't:** Track "total projects ever shipped" (grows monotonically, boring)
- **Do:** Track "improvement over last month" (dynamic, creates narrative)

### ❌ **Data Overload**
- **Don't:** Add 47 new columns to existing tables
- **Do:** Progressive disclosure (summary → details on click)

---

## The North Star

**A scoreboard users *crave* checking, not one they *have* to check.**

Retention isn't about forcing visits. It's about creating *unresolved tension* that pulls users back.

- **Unfinished pipelines** = "What happened to Project X?"
- **Leaderboards** = "Did my time get beaten?"
- **Trend graphs** = "Are we still improving?"
- **Failure autopsies** = "What lesson did we just learn?"

**v1.0 was a report card.**
**v1.1 is a season finale.**

Come back next week. The plot thickens.

---

**Roadmap Owner:** Shonda Rhimes
**Target Ship Date:** v1.1 within 2 weeks of board approval
**Dependencies:** Board verdict: HOLD → PROCEED (pending Tier 1 conditions met)
