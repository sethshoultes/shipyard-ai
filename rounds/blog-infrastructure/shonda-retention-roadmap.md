# Shonda's Retention Roadmap
**What Keeps Users Coming Back: v1.1 Features**
**Author:** Shonda Rhimes, Board Member
**Date:** April 15, 2026

---

## The Core Problem

**Blogs don't fail because of bad content. They fail because nobody remembers to come back.**

Current state: Blog is a **library**, not a **series**.
Desired state: Blog is a **destination** readers return to weekly.

---

## Retention Design Principles

### 1. **Hook → Habit → Payoff**
- **Hook:** First visit creates emotional resonance (curiosity, surprise, usefulness)
- **Habit:** Mechanical triggers bring reader back (email, new post badge, unfinished series)
- **Payoff:** Return visit delivers value greater than expected (exclusive insight, community, progress)

### 2. **Story Arc Over Time**
Individual posts can be self-contained, but the *collection* tells a larger story:
- "How we built an AI that ships code" (origin story)
- "48 OOM kills and the daemon survived" (rising action)
- "The day the daemon broke production" (climax) ← *not yet written*
- "What we learned after 1,000 PRDs" (resolution) ← *future milestone*

### 3. **Episodic Momentum**
TV shows end with "Next time on..." — why don't blogs?

Every post should:
- Reference past posts (continuity)
- Tease future posts (anticipation)
- Leave one question unanswered (open loop)

---

## v1.1 Feature Roadmap

### **Tier 1: Mechanical Retention (Ship First)**
*Zero narrative skill required. Just functional hooks.*

#### Feature 1.1: **Working Email Subscription**
**Current state:** Placeholder form, no backend.
**Fix:**
- Integrate Loops or ConvertKit
- Double opt-in flow (confirm email, set preferences)
- Weekly digest: "3 new posts this week" + top excerpt
- Welcome email: "Start here" with 3 greatest hits

**Success metric:** 10% of unique visitors subscribe within 30 days.

---

#### Feature 1.2: **"New Since Your Last Visit" Badge**
**How it works:**
- Cookie or localStorage tracks last visit timestamp
- Blog index shows red dot or "NEW" label on unread posts
- Clears when user clicks post

**Why it works:** Taps into completion psychology. "I need to catch up."

**Implementation:**
```tsx
const lastVisit = localStorage.getItem('lastVisit') || 0
const newPosts = posts.filter(p => p.date > lastVisit)
// Show badge on newPosts
```

**Success metric:** 25% increase in repeat visitor engagement.

---

#### Feature 1.3: **Related Posts Footer**
**Current state:** Post ends, reader leaves.
**Fix:**
- Add `related: [slug1, slug2]` to frontmatter (manual curation)
- Display at bottom: "If you liked this, read:"
  - [The Night Shift](#)
  - [Model Selection in Multi-Agent Systems](#)

**Advanced version (Phase 3):** AI-generated via semantic embeddings (Jensen's suggestion).

**Success metric:** 30% of readers click through to related post.

---

#### Feature 1.4: **RSS Feed with Summaries**
**Why:** Power users still use RSS. Don't abandon them.

**Implementation:**
- Generate `/blog/rss.xml` at build time
- Include full post content or excerpt (user preference)
- Support Feedly, Inoreader, NetNewsWire

**Success metric:** 50+ RSS subscribers in first month.

---

### **Tier 2: Narrative Retention (Ship After Tier 1)**
*Requires editorial judgment. Higher impact, more effort.*

#### Feature 2.1: **Series Tagging**
**Concept:** Multi-part content with explicit progression.

**Example series:**
- **"Building the Daemon" (4 parts)**
  - Part 1: The Night Shift (published)
  - Part 2: When the Daemon Hallucinates ← *draft this*
  - Part 3: 48 OOM Kills and a Funeral ← *inspiration from existing post*
  - Part 4: Shipping 1,000 PRDs

**UI:**
- Tag at top: "Part 2 of 4 in *Building the Daemon* series"
- Series nav: `← Part 1 | Part 3 →`
- Series page: `/blog/series/building-the-daemon` (all posts listed)

**Why it works:** Creates binge-reading behavior. Readers finish Part 1, immediately click Part 2.

**Success metric:** Series posts have 2x time-on-page vs. standalone posts.

---

#### Feature 2.2: **Cliffhanger Endings**
**Bad ending (current):**
> "The daemon shipped 20 PRDs that night. Production was stable."

**Good ending:**
> "The daemon shipped 20 PRDs that night. Production was stable. But three weeks later, a hallucinated API spec would bring everything down. More on that soon."

**Formula:**
1. Resolve immediate tension (daemon survived)
2. Introduce new tension (future failure)
3. Promise resolution (coming soon)

**Implementation:** Editorial guideline, not code. Review all post endings before publish.

**Success metric:** Email click-through rate increases 15% when teaser is included.

---

#### Feature 2.3: **Author Profiles & Bylines**
**Current state:** Posts feel institutional, no human voice.
**Fix:**
- Add `author: "Name"` to frontmatter
- Author bio at bottom of post:
  - Photo, 2-sentence bio, Twitter/LinkedIn
  - "More posts by [Author]" link

**Why:** Readers follow people, not brands. Personal connection = retention.

**Example:**
> **Written by Alex Chen**
> Staff engineer at Shipyard, survived 48 OOM kills. Tweets about AI agents and production nightmares.
> [More posts by Alex](#) | [@alexchen](https://twitter.com)

**Success metric:** Posts with bylines get 20% more social shares.

---

#### Feature 2.4: **"Start Here" Onboarding**
**Problem:** New reader lands on random post via Google. Where do they go next?

**Solution:** Dedicated page: `/blog/start-here`

**Contents:**
- "New to Shipyard? Read these 3 posts first:"
  1. What is the EmDash Daemon? (explainer)
  2. The Night Shift (flagship narrative)
  3. Why AI Agents Ship Better Code (philosophy)
- Link in site nav: "Blog → Start Here"
- Footer CTA on all posts: "New reader? [Start here](#)"

**Success metric:** 40% of first-time visitors who land on `/blog/start-here` read 2+ posts.

---

### **Tier 3: Community Retention (Ship After Product-Market Fit)**
*Highest leverage, hardest to build. Only pursue if Tier 1 + 2 prove traction.*

#### Feature 3.1: **Lightweight Comments (Giscus)**
**Why not Disqus/Facebook:** Privacy concerns, slow load times, spam.
**Why Giscus:** GitHub Discussions backend, Markdown support, owned by you.

**Use case:**
- Engineers ask follow-up questions ("How did you configure the OOM threshold?")
- Readers share their own war stories
- Authors respond, build relationship

**Guardrail:** Moderation required. Assign someone to respond within 24 hours.

**Success metric:** 5% of posts generate 3+ comments.

---

#### Feature 3.2: **Reader-Requested Topics**
**Concept:** Turn audience into editorial board.

**Implementation:**
- Footer widget: "What should we write about next?"
- Upvote system (simple form → Airtable/Notion)
- Monthly: Publish most-requested topic

**Why it works:** Readers invested in content creation = loyal readers.

**Example:**
> 📝 **Requested by readers:**
> "How do you test AI-generated code?" (47 votes)
> "Daemon vs. human: speed comparison" (32 votes)

**Success metric:** 1 reader-requested post per month, 50% higher engagement than average.

---

#### Feature 3.3: **Exclusive Content for Subscribers**
**Concept:** Tiered access model.

**Public posts:** Case studies, technical deep dives (SEO-friendly)
**Subscriber-only:** Behind-the-scenes, early access, office hours Q&A

**Example:**
- Public: "How the Daemon Shipped 20 PRDs in One Night"
- Subscriber: "The 5 PRDs the Daemon Failed + Why" (lessons learned, more raw)

**Why:** Gives reason to subscribe beyond "get notified."

**Success metric:** 20% of email subscribers engage with exclusive content.

---

## Retention Metrics Dashboard

**Track weekly:**

| Metric | Current | Target (30 days) | Target (90 days) |
|--------|---------|------------------|------------------|
| Email subscribers | 0 | 100 | 500 |
| Repeat visitor % | Unknown | 15% | 30% |
| Avg posts per session | 1.0 | 1.5 | 2.0 |
| Email open rate | N/A | 30% | 40% |
| Click-through rate (email) | N/A | 10% | 15% |
| Social shares per post | Unknown | 20 | 50 |
| Comments per post | 0 | 2 | 5 |

**Leading indicator:** If email open rate > 30%, retention is working.
**Lagging indicator:** If repeat visitor % < 15% after 60 days, revisit strategy.

---

## Content Calendar: Next 8 Weeks

**Week 1-2:** Fix broken build, ship Tier 1 features
**Week 3:** Publish "Behind the Scenes: When the Daemon Hallucinates" (Part 2 of series)
**Week 4:** Publish "Model Selection: The 3-Step Framework" (evergreen, SEO-focused)
**Week 5:** Publish "48 OOM Kills: A Survival Guide" (narrative, series Part 3)
**Week 6:** Reader-requested topic (poll audience Week 4)
**Week 7:** Case study: "Client X: From 2-Week Builds to 2-Day Deploys"
**Week 8:** Retrospective: "What We Learned from 100 Blog Subscribers"

**Cadence:** 1 post/week minimum. Consistency > volume.

---

## The Narrative Northstar

**Question to ask before publishing every post:**

> "If a reader finishes this, what makes them want to come back next week?"

**Answers that work:**
- ✅ "I need to know what happens in Part 3"
- ✅ "I want to see how they solve the next problem"
- ✅ "The author promised a follow-up on X topic"
- ✅ "I'm part of a community learning this together"

**Answers that don't work:**
- ❌ "That was interesting" (one-time satisfaction, no return trigger)
- ❌ "I learned something" (educational but not compelling)

---

## Final Thought

**Retention isn't a feature. It's a philosophy.**

Every design choice either:
- Creates a reason to return (series, cliffhangers, email)
- Or removes friction to return (RSS, new post badges, related links)

The best content in the world doesn't matter if nobody remembers it exists.

Make the blog **unforgettable**, then make it **unavoidable**.

---

**Next Steps:**
1. Fix broken build (Phase 1 from board verdict)
2. Ship Tier 1 features (2 weeks max)
3. Measure baseline metrics (Week 3)
4. Iterate based on data (Weeks 4-8)

Retention is earned, not assumed. Build the hooks, then watch them work.

— Shonda Rhimes
Board Member, Shipyard AI
