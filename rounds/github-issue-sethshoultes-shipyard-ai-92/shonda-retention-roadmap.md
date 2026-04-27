# Shonda Retention Roadmap — Reel v1.1

> *"This builds the machine. It forgets the human watching it."*
> This document fixes that. v1.1 is not about new export formats or faster renders. It is about making users feel seen, talented, and slightly addicted.

---

## The Retention Thesis

People do not return to utilities. They return to **places where they have an identity, a streak, and unfinished business.**

| Why Users Leave Today | What v1.1 Replaces It With |
|:---|:---|
| Anonymous paste-and-download | **"Your Reels" — a gallery with their name on it** |
| Invisible LLM doing hidden work | **Key-point storyboard they can touch and reorder** |
| Voice chosen for them, unheard | **5-second voice preview — authorship through audition** |
| "Rendering..." spinner = dead time | **Progress beats that feel like a trailer before the movie** |
| Flat ending: download link, curtain | **Encore screen: one-click sequel, history-aware suggestions** |
| No memory of ever being here | **Email reminder + "You've made 7 Reels this month"** |

---

## v1.1 Feature Set: What Keeps Users Coming Back

### 1. "Your Reels" Library
**The product must remember them.**

- **Minimum:** Cloud-stored gallery (Supabase/Postgres + S3). Each render saved with source URL, thumbnail, date, and voice used.
- **Fallback:** If cloud auth is blocked by scope, localStorage index of job IDs + re-fetch on return. But cloud is the real fix.
- **Emotional beat:** Landing page greets returning users with *"Welcome back, [name]. Continue your streak?"* instead of the empty paste form.
- **Why it works:** The gallery is the protagonist's home. Without it, the user is a ghost.

### 2. Extracted Key Points — Surface Before Render
**Agency = emotional investment.**

- After LLM extraction, display the 3–5 key points as draggable cards.
- Let users delete, reorder, or edit wording.
- Show estimated video length in real time as they edit (e.g., *"Your Reel will be 42 seconds"*).
- **Why it works:** The "aha moment" moves from after-render to before-render. The user sees the machine understand them — then improves it. That's collaboration, not automation.

### 3. Voice Preview
**Let them audition before committing.**

- For each of the 3 curated voices, play a 5-second sample of the first extracted key point.
- Default remains pre-selected (Steve's non-negotiable: zero-config first run), but the option to audition is one tap away.
- **Why it works:** Voice is identity. Choosing a voice without hearing it is like casting a movie from headshots. The preview creates suspense and ownership.

### 4. Progress Stages — Trailer, Not Loading Bar
**Turn dead time into rising action.**

Replace the generic spinner with 4–5 named stages, each with micro-copy that respects the user's intelligence:

| Stage | Copy | Visual |
|:---|:---|:---|
| Extraction | "Finding the spine..." | Key points fade in one by one |
| Voice | "Casting the voice..." | Waveform animates |
| Composition | "Editing the frames..." | 3-second thumbnail preview generates |
| Render | "Final cut..." | Film-leader countdown aesthetic |
| Delivery | "Cinema ready." | Download button + encore CTA |

- **Thumbnail preview at Stage 3:** Generate a 3-second silent loop of the title card + first bullet. Something to *look at* while waiting.
- **Why it works:** A loading screen is a tax. A trailer is a gift. Users who see progress as narrative tolerate honest wait times.

### 5. Encore Screen — The Sequel Hook
**Don't end on the download link.**

After download, the screen shows:
- Confetti or subtle motion celebration (not cheesy — film-festival laurel aesthetic).
- **"Your Reel is 42 seconds of cinema."**
- Primary CTA: **"Turn another post into a Reel?"**
- Secondary CTA: Suggested URLs from their history, or popular URLs from the community (if privacy allows).
- Tertiary: Share intent (copy link, not social publishing — keep scope tight).
- **Why it works:** Every story needs an encore. Without it, the user exits through the side door. With it, they audition the next idea before they've left the theater.

### 6. Email Capture + Notification
**Capture the user outside the session.**

- Before first render, light email wall: *"Where should we send your Reel?"* — framed as delivery convenience, not data collection.
- Email contains: download link, thumbnail, and **"Make your next Reel"** button.
- Follow-up email at 7 days if no return: *"You made cinema once. The blank page is still waiting."* + one-click suggested URL.
- **Why it works:** The product lives in a browser tab. Email lives in their life.

### 7. Stats & Streaks
**Make usage visible and slightly competitive (with themselves).**

- **Monthly Reel count:** *"You've made 7 Reels this month."*
- **Voice affinity:** *"The Director's Cut voice is your favorite."*
- **Milestones:** First Reel, 5th Reel, 10th Reel — each unlocks a new title or subtle badge (not gamification, just recognition).
- **Why it works:** People don't binge blog posts. They binge *their own story.* Stats make the user the protagonist.

### 8. Social Proof
**Nobody wants to be first in an empty theater.**

- Subtle footer or waiting-stage line: *"847 Reels rendered today."*
- Updates live or near-live.
- **Why it works:** Validation reduces anxiety. If others are making cinema, my amateur script feels safer.

---

## Anti-Features for v1.1

Shonda's board review explicitly rejects scope creep that feels like engineering vanity. **Do not build:**

- ❌ Template marketplace (platform play — Jensen's v2, not Shonda's v1.1)
- ❌ Social publishing APIs (TikTok/YouTube direct upload)
- ❌ Aspect ratio selectors (violates zero-config first run)
- ❌ Font customization (violates "taste is the feature")
- ❌ WordPress plugin (v2 scope, per locked decisions)
- ❌ Real-time neural rendering (Jensen's obsession; v1.1 keeps Remotion, makes the wait *feel* shorter)

---

## Success Metrics for v1.1

| Metric | Target | Why |
|:---|:---|:---|
| 7-day return rate | > 20% | Proof it's not a single-session tool |
| Email capture rate | > 60% of first-time users | Channel to pull users back |
| Key-point edit rate | > 30% of sessions | Proof of emotional investment |
| Encore CTA click-through | > 15% | Sequel hook is working |
| Voice preview usage | > 50% of sessions | Users are auditioning, not accepting defaults |
| "Your Reels" pageviews | > 40% of returning sessions | Gallery is the new homepage |

---

> **Bottom line:** v1.1 does not make Reel faster or more feature-rich. It makes Reel **sticky.** The goal is that a user who makes one Reel wakes up three days later thinking, *"I have another post that deserves cinema."* That thought is the product.
