# Board Review: Shonda Rhimes — Narrative & Retention

**Project:** LocalGenius Engagement System (Pulse)
**Reviewer:** Shonda Rhimes (Narrative Design & Retention)
**Date:** 2026-04-18

---

## Story Arc: Signup → Aha Moment

**FAIL. No story.**

Specs show infrastructure. Database schemas. Cron jobs. Template files.

**Where's the journey?**

- Signup: Missing. No onboarding narrative defined.
- First notification: "3 people viewed your menu" — ok, but then what?
- First week: Badge unlocks, weekly digest arrives. Disconnected beats, not a rising action.
- Aha moment: Undefined. When does user realize "this thing gets me"?

PRD mentions "30-second dopamine hit" but deliverables show batch generators, not emotional payoff architecture.

**What's missing:**
- Act I setup: "Here's what I'll watch for you"
- Act II tension: "Something's changing" (trend builds)
- Act III payoff: "Look what we did together" (milestone celebration that references the journey)

One cliffhanger template exists. Not a story arc. That's one hook in isolation.

---

## Retention Hooks

**Mixed. Hooks exist, execution uncertain.**

**Tomorrow:**
- Daily micro-notifications (if "meaningful insight exists")
- Problem: Spec defines insight as ">10% WoW change"
- Restaurant traffic doesn't spike daily
- Result: "All quiet" messages (capped 2x/week)
- Hook strength: **Weak**. Most days = silence, not anticipation.

**Next week:**
- Weekly cliffhanger at digest end
- 10 templates with weighted selection
- Context-aware (journal callback, competitor observation, best week analysis)
- Hook strength: **Strong**. Good execution in deliverables.

**Next month:**
- Badge progression (350/500 visits shown in gallery)
- Milestone celebrations with confetti
- Hook strength: **Medium**. Progression visible but badges don't compound. Unlocking badge #2 doesn't make badge #1 more valuable.

**Missing:**
- Multi-week story threads ("I've been tracking your lunch rush pattern for 3 weeks — here's what I found")
- Callback to past moments ("Remember when you hit 500 visits in March? You're about to beat that record")
- Seasonal arcs (no annual narrative structure)

---

## Content Strategy: Flywheel?

**No flywheel. Linear content pipeline.**

Flywheel requires user-generated content → AI enhancement → more user engagement → more content.

**What exists:**
- Business Journal: User annotates weekly results
- Storage: Append-only table
- Utilization: "Context for cliffhangers" (one template references it)
- Problem: Journal entries don't compound. Week 12 entry doesn't make Week 1 entry more valuable.

**What's missing:**
- "Your journal from this time last year said [X]. Look at the difference now."
- Year-over-year narrative built from journal history
- AI learns writing style from journal → personalizes notification tone
- Journal prompts get smarter over time based on what user actually writes about

Spec says "proprietary training data moat" but no evidence AI adapts based on journal content. Data sits in table unused except for single cliffhanger template.

**Verdict: Data collection, not flywheel.**

---

## Emotional Cliffhangers

**PASS. Strong execution.**

Cliffhanger template file (`/src/services/notifications/templates/cliffhanger.ts`) shows craft:

**Structure:**
- 10 context-aware templates
- Weighted selection (journal-callback = 12 points, generic = 7 points)
- Tone validation (bans "promise," "guarantee," checks for first-person voice)
- Proper narrative setup: "I noticed X, testing Y, curious what happens"

**Example (journal callback):**
> "Based on your journal note about [topic], I'm testing something related next week. Curious to see what happens."

Tone: Collaborative experiment, not vendor pitch. User and AI are co-investigators.

**Example (best week analysis):**
> "Your best week was [date]. I'm studying what worked that week — might have spotted a pattern."

Sets up pattern recognition reveal. Classic cliffhanger structure.

**Example (anomaly investigation):**
> "Something unusual happened with your website traffic last Tuesday. I'm digging into what caused it."

Mystery setup. User wants resolution next week.

**Strength: 8/10**

Weakness: Only deployed at digest end (once/week). Daily notifications don't use cliffhangers. Missed opportunity for micro-hooks between digests.

---

## What Brings Users Back?

**Day 2:** Notification *might* arrive if >10% metric change. Most days: nothing.
**Day 7:** Weekly digest with cliffhanger. Strong hook.
**Week 2:** Badge progression visible (if user checks gallery). Passive, not push.
**Week 4:** "Consistent" badge unlocks. One-time dopamine hit, doesn't recur.

**Problem: Week 2-3 narrative void.**

User gets notification Day 1. Digest Day 7 with cliffhanger. But Days 8-13? Crickets unless traffic spikes >10%.

Restaurant owners don't have viral growth curves. Steady growth = no daily "insights" = no notifications = user forgets product exists.

**Fix needed:**
- Daily narrative beats even without metric spikes
- "I'm still watching your lunch rush" (reassurance, not data)
- "2 more visits until you hit 500" (proximity to milestone creates urgency)
- Progress updates ("Your average this week: 68 visits/day, up from 61 last week — slow and steady")

Spec treats "no spike" as "nothing to say." Wrong frame. Narrative finds meaning in quiet moments too.

---

## Content-Specific Critique

**Badge messaging (spec section 4.3):**
- "Getting Started" badge: "Your first week! You're already ahead of most restaurants."
- Copy works but badges don't reference each other
- Badge #5 should say: "Remember when you unlocked 'Getting Started'? Look at you now."
- Missed opportunity for callback structure

**Trend narratives (spec section 4.4):**
- Good: "340 visits, up 22% from last week — your second-best week ever"
- Problem: "Second-best week ever" creates question ("What was best week?") but doesn't answer it or set up future payoff
- Should: "340 visits — second only to March 15th. I'm studying what made that week special."

**Journal prompts:**
- Single prompt every week: "What worked this week?"
- Prompt doesn't evolve based on previous answers
- Week 1: "What worked?" → Week 12: Still "What worked?"
- Should adapt: "Last month you mentioned the new menu. Still seeing impact from that?"

---

## Missing: Multi-Week Arcs

Spec builds single-beat features (notification, badge, digest). No multi-week story threads.

**Example of missing arc:**
- Week 1: "Your lunch traffic is up. I'm going to track this."
- Week 2: "Lunch pattern holding. Might be a trend."
- Week 3: "Confirmed: lunch is your strongest segment. Here's what I learned."
- Week 4: Milestone badge: "Lunch Rush Champion" with stats from 4-week observation

Current system: Each week stands alone. No throughline. No rising action.

---

## Score: **6/10**

**Justification:** Strong cliffhanger execution, weak overall narrative structure.

**Strengths:**
- Weekly cliffhanger template quality (first-person, curious tone)
- Badge celebrations create emotional peaks
- Journal concept supports moat (even if underutilized)

**Failures:**
- No signup → aha moment story arc defined
- Daily retention hooks too dependent on traffic spikes
- Week 2-3 narrative void (between digests)
- Journal doesn't compound or personalize AI behavior
- Badges don't reference each other (no callback structure)
- No multi-week story threads

**Bottom line:**
Product has retention *moments* (weekly cliffhanger, badge unlocks), not retention *architecture*.

Moments create spikes. Architecture creates series renewal.

You shipped one good episode. Where's the season?

---

**Recommendation:** APPROVE with revisions.

**Required changes before ship:**
1. Define Day 1-7 narrative beats (not just "wait for spike")
2. Badge copy must reference previous badges (callback structure)
3. Journal prompts evolve based on user's writing patterns
4. Add multi-week story thread framework (track → observe → reveal pattern)

**Optional but high-impact:**
5. Daily micro-hooks even without spikes ("I'm watching your [X]")
6. Seasonal arc structure (month-end recap, quarter milestones, annual anniversary narrative)

Don't just send notifications. Tell a story worth following.

—Shonda
