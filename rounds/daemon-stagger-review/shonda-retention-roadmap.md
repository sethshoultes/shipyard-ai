# Retention Roadmap: What Keeps Users Coming Back

**Author:** Based on Shonda Rhimes' Board Review Recommendations
**Version:** 1.1
**Date:** 2026-04-13

---

## Executive Summary

The daemon-stagger fix is invisible infrastructure. It prevents churn (no crashes = no angry users), but it doesn't *create* retention. True retention requires narrative hooks, emotional investment, and reasons to return.

This roadmap translates Shonda's recommendations into actionable v1.1 features that transform the board review process from backend plumbing into a user-facing experience.

---

## Core Insight

> "Reliability IS a retention hook—just not a conscious one. Every time a user submits a project and the review pipeline doesn't crash, they don't notice. But the 49th OOM kill? That would have been noticed."
> — Shonda Rhimes

**Translation:** v1.0 prevents churn. v1.1 creates pull.

---

## V1.1 Feature Set

### Feature 1: Visible Board Review Experience

**What:** Surface the agent review process to users in real-time.

**Implementation:**
```
[User submits project]
           ↓
┌─────────────────────────────────────────┐
│  Your Board Review is in progress...    │
│                                          │
│  ● Jensen Huang      [Reviewing...]      │
│  ● Oprah Winfrey     [Reviewing...]      │
│  ○ Warren Buffett    [Waiting]           │
│  ○ Shonda Rhimes     [Waiting]           │
│                                          │
│  Estimated completion: 4 minutes         │
└─────────────────────────────────────────┘
```

**Why it retains:**
- **Anticipation:** Users watch progress, creating investment
- **Transparency:** Users understand what's happening (demystifies AI)
- **Commitment:** Users who watch are more likely to read results

**Technical Notes:**
- Leverage existing 2+2 batching as natural "waves" in the UI
- WebSocket or polling for real-time updates
- Graceful degradation if connection lost

---

### Feature 2: Staggered Feedback Reveals

**What:** Release board feedback reviewer-by-reviewer, not all at once.

**Implementation:**
```
[All reviews complete]
           ↓
┌─────────────────────────────────────────┐
│  Jensen Huang has weighed in!            │
│  [Read Jensen's Review →]                │
│                                          │
│  ○ Oprah Winfrey's review in 30 seconds  │
│  ○ 2 more reviews coming...              │
└─────────────────────────────────────────┘
           ↓
[30-60 second delays between reveals]
```

**Why it retains:**
- **Cliffhangers:** "What will Oprah say?" creates micro-curiosity
- **Extended engagement:** 4 reveals > 1 dump
- **Emotional processing:** Users digest feedback incrementally
- **Return triggers:** Notifications bring users back for each reveal

**Technical Notes:**
- Backend completes all reviews, frontend paces delivery
- User can "skip" to see all at once (respect user choice)
- Email/notification per reveal (optional, configurable)

---

### Feature 3: Distinct Reviewer Personas

**What:** Make each board member's voice instantly recognizable and anticipated.

**Persona Framework:**

| Reviewer | Voice | Focus | Signature Phrase |
|----------|-------|-------|------------------|
| **Jensen Huang** | Technical, direct, visionary | Moat, compounding, AI leverage | "What compounds?" |
| **Oprah Winfrey** | Warm, honest, empathetic | User experience, trust, accessibility | "Let me be honest with you..." |
| **Warren Buffett** | Folksy, analytical, skeptical | Unit economics, capital efficiency | "Is this a business or a hobby?" |
| **Shonda Rhimes** | Sharp, narrative-driven, dramatic | Story arc, retention hooks, emotional beats | "Honey..." |

**Why it retains:**
- **Characters users care about:** "I wonder what Warren will think"
- **Predictable unpredictability:** Users know the lens, not the verdict
- **Personality-driven engagement:** Some users will have favorites
- **Quotability:** Distinctive voices create shareable moments

**Technical Notes:**
- Already partially implemented in agent prompts
- Ensure voice consistency across all feedback
- Consider user-facing "Meet the Board" page

---

### Feature 4: "What's Next?" Hooks

**What:** End every review session with forward momentum.

**Implementation Options:**

1. **Improvement Suggestions**
   > "Jensen suggested focusing on your competitive moat. Ready to revise and resubmit?"
   > [Revise Project →]

2. **Comparison Hooks**
   > "See how this project scored vs. your previous submissions"
   > [View History →]

3. **Community Curiosity**
   > "87 other projects were reviewed this week. Explore top-rated submissions."
   > [Browse Community →]

4. **Scheduled Follow-up**
   > "We'll check back in 7 days to see your progress. Want a reminder?"
   > [Set Reminder →]

**Why it retains:**
- **Loop closure prevents drop-off:** Every endpoint becomes a starting point
- **Progress narrative:** Users see themselves on a journey
- **Social proof:** Community features validate participation

---

### Feature 5: Review Streak & History

**What:** Track user engagement over time.

**Implementation:**
```
┌─────────────────────────────────────────┐
│  Your Review History                     │
│                                          │
│  🔥 3-project streak!                    │
│                                          │
│  Project A    │ March 15 │ Score: 7.2    │
│  Project B    │ March 28 │ Score: 6.8    │
│  Project C    │ April 10 │ Score: 8.1 ↑  │
│                                          │
│  [Submit New Project →]                  │
└─────────────────────────────────────────┘
```

**Why it retains:**
- **Progress visibility:** Users see improvement over time
- **Streak psychology:** Loss aversion keeps users returning
- **Achievement narrative:** "I'm getting better at this"

---

## Retention Metrics to Track

| Metric | Definition | Target |
|--------|------------|--------|
| **D1 Return Rate** | % of users who return within 24 hours of first review | >30% |
| **D7 Return Rate** | % of users who return within 7 days | >50% |
| **Reviews per User** | Average board reviews per user per month | >2 |
| **Reveal Completion Rate** | % of users who view all 4 reviewer feedbacks | >80% |
| **Resubmission Rate** | % of projects that get revised and resubmitted | >15% |
| **Notification Engagement** | % of users who return via notification | >20% |

---

## Implementation Phases

### Phase 1: Visibility (2-3 weeks)
- [ ] Real-time review progress UI
- [ ] "Board review in progress" state
- [ ] Basic completion notification

### Phase 2: Staggered Reveals (2-3 weeks)
- [ ] Timed reveal system (30-60 second delays)
- [ ] Per-reviewer notifications
- [ ] "See all now" override option

### Phase 3: Persona Polish (1-2 weeks)
- [ ] Audit all agent prompts for voice consistency
- [ ] "Meet the Board" user-facing page
- [ ] Signature phrases in UI

### Phase 4: Forward Hooks (2-3 weeks)
- [ ] Post-review CTA system
- [ ] Review history dashboard
- [ ] Streak tracking
- [ ] Revision/resubmission flow

### Phase 5: Community (Future)
- [ ] Anonymous project showcase
- [ ] "Top reviews this week"
- [ ] Peer comparison (opt-in)

---

## Dependencies on Current Work

The `daemon-stagger-review` fix enables this roadmap by:

1. **Stabilizing the backend:** No point building reveal UX if the daemon crashes
2. **Creating natural batches:** The 2+2 split maps cleanly to "Wave 1 / Wave 2" UX
3. **Buying time:** Memory headroom allows investment in user-facing features

---

## Closing Thought

> "Infrastructure should be emotionally inert... The best infrastructure is the kind you forget exists."
> — Shonda Rhimes

The daemon fix achieves this. Now we build the memorable parts on top.

---

*v1.0: Don't crash. v1.1: Make them care.*
