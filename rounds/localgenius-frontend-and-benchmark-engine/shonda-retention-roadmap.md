# Shonda's Retention Roadmap — What Keeps Them Coming Back

*For SPARK v1.1: The Season Premiere*

---

## The Problem

Right now, SPARK is a one-night stand. The owner installs it, toggles five FAQs, flips the switch, and never thinks about it again. The widget answers questions. The admin gathers dust. There is no reason to return on Tuesday. There is no reason to stay past episode one.

Retention is not a feature. It is a story arc. Every week, the owner needs a reason to open the door. Not a notification. A cliffhanger.

---

## v1.1 Retention Hooks

### 1. The Weekly Rank Digest

**What it is:** One email every Monday at 9 AM local time.

**Subject lines (rotating by context):**
- "You're #3 in Chicago this week."
- "You moved up. Here's what changed."
- "47 restaurants competed. You're in the top 5."

**Body:**
- Rank this week vs. last week (trend arrow)
- One sentence insight: "You answered 34 questions this week. The average restaurant answered 12."
- CTA: "See your full card →" (links to wp-admin)

**Why it works:** Monday morning is when doubt lives. The email doesn't nag. It arrives like a standing ovation in an empty room.

---

### 2. The Benchmark Card (Admin)

**What it is:** One card at the top of the single admin screen. Always visible.

**Elements:**
- **Rank:** "#3 of 47" in large type
- **Trend arrow:** Green up, red down, gray flat — with "from #5 last week" microcopy
- **Percentile:** "Top 6%" — dopamine in percentage form
- **Bucket context:** "Restaurants in Chicago" — so they know the game they're playing
- **Countdown / stakes:** If suppressed: "Unlock your rank when 5 restaurants join. Invite one." (network effect hook)

**Why it works:** People don't check dashboards. They check scores. One number, one arrow, one reason to come back.

---

### 3. The Shareable Rank Card

**What it is:** A one-click "Share this" button on the benchmark card that generates an OG image.

**The image:**
- Clean background in brand color (detected from site meta)
- Large type: "#3 of 47 Restaurants in Chicago"
- Small SPARK wordmark: "Powered by SPARK"
- Pre-written social copy: "We're #3 in Chicago for answering customer questions. Not bad for a Tuesday."

**Platforms:** Facebook, Instagram Story, Twitter/X. One tap.

**Why it works:** Restaurant owners are competitive and proud. They post their health scores. They will post their rank. The OG image is a billboard that costs us nothing.

---

### 4. The FAQ Content Flywheel

**What it is:** Turn private FAQs into public SEO pages.

**v1.1 mechanics:**
- Each FAQ toggle gets a "Make public" option
- Public FAQs live at `/spark/faq/{business-slug}` (permalinks architected in v1)
- Aggregate anonymous FAQ patterns across the city: "Top 10 questions asked to Chicago restaurants this month"
- Public page ranks on Google for "Is {Restaurant} gluten free?"
- Owner sees traffic in the admin: "Your FAQ page was viewed 127 times this month."

**Why it works:** Owners don't just want to answer questions. They want to be found. SEO is a flywheel that compounds. The more owners participate, the more Google loves the pages, the more owners participate.

---

### 5. Pulse / Streaks

**What it is:** A lightweight activity heartbeat in admin.

**Elements:**
- **Conversations this week:** "34 questions answered"
- **Streak:** "3 weeks in the top 10"
- **Milestones:** "100 questions answered" → quiet celebration in admin (no badges, no sparkle — just warm copy: "Your customers have asked 100 questions. You answered every one.")

**Why it works:** Numbers without streaks are data. Numbers with streaks are identity. "I am someone who answers every question." Identity is the deepest retention hook.

---

### 6. Competitive Tension / Invite-to-Unlock

**What it is:** Network effect gamification, but dignified.

**When suppression kicks in** (< 5 businesses in bucket):
- Current: "You're building something. Check back soon." (Passive. No stakes.)
- v1.1: "Only 2 more restaurants needed to unlock the Chicago rankings. Invite one and see where you stand." (Active. Stakes. Network effect.)
- One-click invite: pre-written email/text the owner can send to two neighboring businesses.

**Why it works:** Scarcity creates desire. Rankings hidden behind a social unlock turn every owner into a recruiter. Density follows dignity — but only if dignity is gated by density.

---

### 7. Personalized Widget Urgency

**What it is:** Dynamic greeting copy based on recent data.

**Current:** Static greeting. "Hey, we're open late."
**v1.1:**
- "3 customers asked about reservations this hour."
- "You're trending up this week. Keep it going."
- "Top question today: Do you take reservations?"

**Why it works:** Static text becomes wallpaper. Dynamic text feels like a pulse. The widget whispers that SPARK is alive, watching, counting.

---

### 8. Trend Notifications

**What it is:** Push-style alerts (email or in-admin banner) when something changes.

**Triggers:**
- Rank change: "You moved from #5 to #3."
- New competitor entered bucket: "A new restaurant joined the Chicago rankings."
- Milestone: "You hit 1,000 answered questions."
- Seasonal: "Thanksgiving week is coming. Update your holiday hours?"

**Why it works:** Notifications are annoying. Cliffhangers are addictive. The difference is stakes. "You moved up" is a cliffhanger. "Check your dashboard" is spam.

---

## v1.1 Feature Table

| Feature | Hook Type | Effort | Retention Impact |
|---------|-----------|--------|------------------|
| Weekly Rank Digest | Recurring cliffhanger | Low (email template + cron) | High |
| Benchmark Card (Admin) | Dopamine score | Low (call existing API) | High |
| Shareable Rank Card (OG) | Viral loop | Medium (image generation) | Medium |
| FAQ Content Flywheel | SEO moat | Medium (public pages + aggregates) | High (compounding) |
| Pulse / Streaks | Identity formation | Low (counter logic) | Medium |
| Invite-to-Unlock | Network effect | Low (copy change + share sheet) | High |
| Personalized Widget Urgency | Live pulse | Low (dynamic copy injection) | Medium |
| Trend Notifications | Cliffhanger alerts | Low (trigger logic) | Medium |

---

## The Story Arc of v1.1

**Episode 1 (Install):** They enter their URL. SPARK recognizes them. Shock. Delight. One toggle. One switch. Done.

**Episode 2 (Monday Morning):** The email arrives. "You're #3 in Chicago." They didn't expect that. They open admin. They see the card. They feel seen.

**Episode 3 (Wednesday):** They notice the widget greeting changed. "3 customers asked about reservations this hour." SPARK is alive.

**Episode 4 (End of Month):** They hit "Share this." The OG image posts to Instagram. #3 in Chicago. Their friend asks what SPARK is.

**Episode 5 (Quarterly):** They Google their own restaurant. The public FAQ page ranks. "Is Tasty Pizza gluten free?" Their SPARK page is result #2. They didn't build that. SPARK built it for them.

That's not a plugin. That's a season.

---

*"People don't come back for features. They come back for the next episode."*
*— Shonda Rhimes*
