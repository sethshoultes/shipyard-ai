# Tuned — Retention Roadmap v1.1

*What Keeps Users Coming Back*

*Authored by Shonda Rhimes, Chief Retention & Narrative*

---

## The Retention Problem

V1 of Tuned solves the "push problem" — getting prompts out of code and into version control. But Steve's concern is valid: *why does anyone come back after their first push?*

A CLI that you run once and forget is not a product. It's a utility. Utilities don't build companies.

**The question:** How do we turn a single `tuned push` into a daily habit?

---

## The Emotional Arc of a Tuned User

### Act 1: Discovery (Day 1)
*"Oh, this is what I've been missing."*

User discovers Tuned. Pushes their first prompt. Feels the relief of prompts being somewhere safe. Dopamine hit. End of engagement.

**Current V1 problem:** There's no Act 2. The user got what they needed. They leave.

### Act 2: Ownership (Days 2-14)
*"These are MY prompts. I need to see how they're doing."*

User starts thinking of Tuned as the home for their prompts. They push more. They check versions. They start caring about prompt performance.

**V1.1 job:** Create reasons to return during this window.

### Act 3: Mastery (Days 15-60)
*"I'm getting better at this. I can see it."*

User sees their progression. Earlier prompts look naive. New prompts are sharper. The tool helped them level up.

**V2 job:** Make growth visible.

### Act 4: Identity (Days 60+)
*"I'm someone who tunes their prompts."*

Tuned becomes part of professional identity. User recommends to others. They've internalized the practice.

**V3 job:** Community, sharing, reputation.

---

## V1.1 Features — The Retention Layer

### 1. Push Streaks

**What:** Track consecutive days with at least one prompt push. Display streak in CLI after every push.

**Why:** Streaks create micro-commitments. Missing a day feels like losing something. Duolingo proved this works.

**Implementation:**
```
$ tuned push "assistant-v3" -c "..."
Pushed assistant-v3 v4. Live at edge.

You're on a 7-day streak.
```

**Effort:** 2 hours. Store last-push timestamp per user. Simple streak logic.

### 2. Weekly Prompt Digest (Email)

**What:** Once a week, send a simple email:
- How many prompts you pushed
- Which prompt got updated most
- Total versions across all prompts

**Why:** Email brings users back. It's a touchpoint that doesn't require them to remember you exist.

**Implementation:**
- Opt-in at `tuned init`
- Cloudflare Workers scheduled trigger
- Simple text email (no HTML complexity)

**Effort:** 4 hours. Scheduled worker + email service integration (Resend or similar).

### 3. Prompt Age Indicator

**What:** In `tuned list`, show how long since each prompt was updated. Flag prompts that haven't been touched in 14+ days.

**Why:** Creates gentle pressure to revisit old prompts. "Is this still my best thinking?"

**Implementation:**
```
$ tuned list

NAME              VERSION   UPDATED         STATUS
customer-support  v5 *      2 days ago
onboarding        v2        3 weeks ago     Stale
summarizer        v8        1 day ago
```

**Effort:** 1 hour. Add timestamp diff calculation to list command.

### 4. Version Milestones

**What:** Celebrate round-number versions. When a prompt hits v5, v10, v25, v50, v100 — surface it.

**Why:** Progress markers create satisfaction. "I've iterated this prompt 25 times" feels like accomplishment.

**Implementation:**
```
$ tuned push "main-assistant" -c "..."
Pushed main-assistant v25. Live at edge.

Milestone: 25 versions of main-assistant. You're a tuner.
```

**Effort:** 30 minutes. Conditional message on push.

### 5. `tuned status` Command

**What:** New command showing account-level stats:
- Total prompts
- Total versions pushed
- Current streak
- Most-iterated prompt

**Why:** Gives users a reason to open the CLI even when they're not pushing. "How am I doing?"

**Implementation:**
```
$ tuned status

TUNED STATUS
Prompts: 12
Total versions: 87
Current streak: 14 days
Most iterated: main-assistant (v31)

Keep tuning.
```

**Effort:** 2 hours. New command + API endpoint for stats.

### 6. Prompt Activity in Dashboard

**What:** Add a simple activity timeline to the dashboard. Last 20 actions across all prompts.

**Why:** Makes the dashboard worth visiting. Currently it's just a list — no narrative, no motion.

**Implementation:**
- Timeline view: "2h ago — pushed customer-support v5"
- Still read-only. No buttons.

**Effort:** 3 hours. Additional D1 query + minimal UI addition.

---

## V1.1 Feature Summary

| Feature | Retention Hook | Effort |
|---------|---------------|--------|
| Push Streaks | Daily habit formation | 2h |
| Weekly Digest | Email-driven return | 4h |
| Prompt Age Indicator | Guilt/maintenance prompt | 1h |
| Version Milestones | Progress celebration | 30m |
| `tuned status` | CLI as destination | 2h |
| Dashboard Activity | Web return visits | 3h |

**Total V1.1 effort:** ~12 hours

---

## The Retention Philosophy

### We're Not Building Stickiness. We're Building a Practice.

Cheap retention tricks (notifications, badges, gamification) feel hollow. Users see through them.

**What actually works:** Making users better at something they care about.

Every V1.1 feature answers: *"Am I getting better at prompting?"*

- Streaks = "I'm showing up."
- Milestones = "I'm iterating."
- Age indicators = "I'm maintaining."
- Status = "I'm growing."

The habit isn't using Tuned. The habit is *improving prompts*. Tuned just makes that habit visible.

### The "Come Back Tomorrow" Moment

Every session should end with a reason to return:

- **After first push:** "Push another prompt to start your streak."
- **After reaching v5:** "You're at v5. Most Tuned users see their biggest improvements between v5 and v10."
- **After a week:** "Your weekly digest is on its way."

These aren't interruptions. They're invitations.

---

## Metrics That Prove Retention

### Leading Indicators (Track in V1.1)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| DAU/MAU ratio | >15% | Daily engagement signal |
| 7-day return rate | >40% | Week 1 retention |
| Avg prompts per user | >3 | Breadth of adoption |
| Avg versions per prompt | >4 | Depth of iteration |
| Streak length median | >5 days | Habit formation |

### Lagging Indicators (Track at 60 days)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| 60-day retention | >25% | Long-term stickiness |
| NPS | >50 | Would they recommend? |
| Organic referrals | >10% of new users | Word of mouth working |

---

## The V2 Tease: Making Growth Visible

V1.1 creates return reasons. V2 shows users their journey.

**Planned V2 retention features:**

1. **Prompt Evolution View** — See how a prompt changed from v1 to v25. Celebrate the journey.

2. **Personal Stats Page** — Total prompts improved, time saved, iteration patterns.

3. **"Before Tuned" Comparison** — Show users what their workflow looked like before.

4. **Prompt of the Week** — Opt-in showcase. Best iteration stories from the community.

These features require more infrastructure (analytics, UI complexity) but they're the path to Act 3: Mastery.

---

## Implementation Priority for V1.1

### Week 1 (Ship with V1.1 launch)
1. Push Streaks
2. `tuned status`
3. Prompt Age Indicator

### Week 2
4. Version Milestones
5. Dashboard Activity Timeline

### Week 3
6. Weekly Digest (requires email service setup)

---

## The Promise

*"Every time you come back to Tuned, you'll see proof that you're getting better."*

That's the retention hook that doesn't feel like a hook. It feels like value.

Users don't return because we tricked them. They return because they're building something — and they want to see how far they've come.

---

*"The best stories make you want to see what happens next."*

V1 is the pilot episode. V1.1 is the cliffhanger that brings them back.

---

*— Shonda Rhimes, Chief Retention & Narrative*
