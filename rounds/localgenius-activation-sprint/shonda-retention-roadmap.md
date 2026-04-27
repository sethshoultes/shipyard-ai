# Shonda Retention Roadmap
**Product:** LocalGenius Widget & Admin Dashboard
**Version:** 1.1
**Theme:** What Keeps Users Coming Back
**Date:** 2026-04-25

---

## v1.0 Retention Hooks (Shipped)

| Hook | Cadence | Health |
|------|---------|--------|
| Weekly Digest email | Monday 9:00 AM | Strong |
| Percentile ranking ("Room to climb 🏔️") | Weekly | Strong |
| Competitive benchmark SQL | Weekly | Strong |
| FAQ templates (warm, category-aware voice) | Setup only | Static; high quality but dead after launch |

---

## v1.1 Retention Features

### 1. Day-0 Dopamine (First 24 Hours)
**Problem:** User launches widget, then silence. No reason to return tomorrow.

- **First Interaction Alert** — In-app toast and/or email: *"Your widget just answered its first question."*
- **Setup Completion Reward** — Confetti + confirmation screen: *"Your AI assistant is live. First digest arrives Monday."*
- **In-App Preview Panel** — Let users see the widget before launch so the payoff happens inside the product, not via an external link.

### 2. Mid-Week Gravity (Between Digests)
**Problem:** No dashboard reason to return between Monday digests.

- **Notification Dot / Badge** — *"3 new questions this week"* on the admin nav icon.
- **Unanswered Questions Table** — *"Your customers asked these 5 things you didn't cover."* Creates a task and starts the content flywheel.
- **Actionable Cliffhanger** — Tie digest copy to a task: *"If you respond to 2 more reviews, you'll crack the top 50%."*

### 3. Content Flywheel (Living FAQs)
**Problem:** FAQs are static JSON. Seed-and-forget.

- **Top Unanswered Questions** — Pull from widget interaction logs; surface suggestions in admin.
- **"Customers Also Asked" Insight** — Surface conversation patterns to the dashboard.
- **One-Click FAQ Publish** — Let users promote an unanswered question to a published FAQ with a single click.

### 4. Narrative Cliffhangers (Emotional Stakes)
**Problem:** No suspense at the end of onboarding; the user knows nothing happens until Monday.

- **Onboarding End Tease** — Replace flat verification ("Does this look like you?") with anticipation-building copy: *"We found Maria's Trattoria. Your AI assistant is almost ready."*
- **Digest Subject Line Upgrade** — Embed an actionable hook inside the weekly email body/preview.
- **Live Percentile Movement** — Show percentile updates in real time when new benchmark data arrives.

---

## Success Metrics for v1.1

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| D1 Retention (return next day) | > 20% | Login event 24h after setup completion |
| D7 Retention | > 40% | Login event within 7 days of setup |
| Weekly Digest Open Rate | Maintain > 35% | Email analytics |
| FAQ Edits / Month | > 1 per active user | Admin dashboard events |
| Unanswered Question Views | > 30% of active users / week | Admin dashboard events |

---

## What to Cut vs. Keep in v1.1

**Keep:**
- Single-screen admin (proven lower drop-off)
- Async detection (non-blocking UX)
- Widget JS/CSS architecture
- Benchmark SQL and "Room to climb" copy
- FAQ template voice and tone

**Add:**
- Preview panel (restores narrative climax)
- Launch confirmation state (payoff beat)
- First-interaction alert (day-1 dopamine)
- Unanswered questions table (flywheel starter)
- Badge/notification dot (mid-week gravity)
