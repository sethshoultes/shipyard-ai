# Board Review: Blog Infrastructure
**Reviewer:** Shonda Rhimes
**Date:** 2026-04-15
**Lens:** Narrative & Retention

---

## Story Arc: 3/10

No onboarding journey. User lands on blog index → clicks post → reads → leaves.

Missing:
- **First-time reader hook**: No "Start here" or greatest hits
- **Author connection**: Posts feel institutional, no bylines create warmth
- **Episodic momentum**: "The Night Shift" mentions 20 PRDs shipped, but no "Read Part 2" hook
- **Progress tracking**: Can't see what's new since last visit

Current flow is library, not series. Readers consume once, don't return.

## Retention Hooks: 2/10

Email subscribe form doesn't work — placeholder UI with no backend.

What brings people back:
- ❌ New post notifications (subscribe broken)
- ❌ Comment threads (no discussion)
- ❌ Related posts (no recommendations)
- ❌ Series progression (no multi-part content)
- ❌ Author updates (no personal voice)

Zero mechanical retention. Once read, no reason to revisit.

## Content Strategy: 4/10

Posts exist, but no flywheel.

**What works:**
- Technical depth (48 OOM kills = visceral detail)
- War stories (hallucinated APIs, production failures)
- Insider POV (daemon architecture, token optimization)

**What's missing:**
- Content pipeline from work → blog
- Guest voices (customers, collaborators)
- SEO targeting (no keyword strategy visible)
- Cross-linking between posts
- Social amplification (no tweet threads, no LinkedIn reposts)

Content created ≠ content distributed. No evidence posts reach beyond organic traffic.

## Emotional Cliffhangers: 5/10

Individual posts have tension:
- "48 OOM kills" → survives anyway (conflict → resolution)
- "Haiku hallucinated 100+ violations" → pipeline caught it (problem → hero moment)

But series-level cliffhangers missing:
- What's the *next* challenge the daemon can't solve?
- What happens when a PRD breaks the pipeline?
- Where's the "to be continued"?

Each post closes cleanly. Good for satisfaction, bad for "I need to check back tomorrow."

## Score: 3.5/10

**Justification:** Infrastructure works. Content exists. Retention doesn't.

### What Would Fix This

**Quick wins:**
1. Connect email subscribe (Loops, ConvertKit, whatever)
2. Add "Latest 3 posts" widget to homepage
3. Tag multi-part series with "Part 1 of 3" labels
4. Footer CTA: "Read next: [related post]"

**Medium-term:**
1. Author profiles with RSS per author
2. "New reader? Start with these 3 posts"
3. Comment system (Giscus, lightweight)
4. Social cards with pull quotes

**Structural fix:**
- Posts need **forward momentum**. End each with open question or teaser.
- "The Night Shift" should end: "Next week: what happens when the daemon ships a PRD that breaks production."
- "Model Selection" should end: "But what if the model you need doesn't exist yet? More on that soon."

Right now, blog is a **content repository**. Needs to become a **content experience**.

Readers come for technical depth. They leave because nothing pulls them back.
