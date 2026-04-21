# Shonda Rhimes — Retention Roadmap: Pulse v1.1

> *"A prop becomes a character when the audience starts asking about it on Monday morning."*

---

## The Problem

Right now, `pulse.txt` is a closed loop. Seth runs the script. He reads "Kimi drove this." He closes the terminal. Tomorrow, the file is identical. There is no user, no signup, no "aha," no reason to return. A pilot that airs once is not a series. We need an **episode structure**.

---

## What Keeps Users Coming Back

### 1. A Protagonist With a Voice

Kimi is invisible. That ends today.

- **Character bible:** Kimi has moods—restless, confident, skeptical, playful. The sentence must carry a tonal signature so regular readers learn to recognize "Kimi's voice" the way viewers know Meredith Grey's opening monologue.
- **Arc over time:** Week 1: uncertain. Week 4: cocky. Week 8: collaborative. The model's output should trace an emotional journey that mirrors the team's own product development.

### 2. The Cold Open

Before the sentence hits the file, there is tension.

- **Stakes header:** A one-line status that creates a curiosity gap. *"Three tests failed last night. Kimi hasn't slept."* Then the sentence drops.
- **Contextual cold opens:** If the build is green, Kimi is triumphant. If red, Kimi is defiant. If latency spiked, Kimi is breathless. The pulse should **react** to the pipeline's vital signs.

### 3. Serialized Narrative

`pulse.txt` must become a running story, not a static billboard.

- **Append mode (optional):** Each run adds a new "episode" line, dated, creating a micro-journal readers can scroll.
- **Season arcs:** Every 10 runs = one "season" with a theme (e.g., "The Latency Arc," "The Model Swap"). A brief ASCII title card precedes the season premiere.
- **Previously on...:** The first line of each new run references the emotional cliffhanger from the previous run. *"Last time, Kimi doubted the merge. Today? Kimi drove this."*

### 4. Emotional Cliffhangers

Not every sentence ends with a period.

- **The ellipsis:** *"Kimi drove this, but..."* The reader must open the next build to finish the thought.
- **The question:** *"Kimi drove this. Will you merge it?"* A direct address to Seth (and eventually to any user) that turns a log file into a dialogue.
- **The prophecy:** Occasionally, Kimi predicts tomorrow's mood. *"Tomorrow, Kimi meets Claude."* Now there is a reason to check back.

### 5. Ritual and Habit

Retention lives in routine.

- **Morning Pulse:** The CI run is scheduled for 9:00 AM local time. The sentence becomes the team's daily horoscope.
- **Friday Finale:** Longer output on Fridays—two sentences, a reflection on the week. Like a season finale, it has more weight.
- **Streaks:** If `pulse.txt` is read within 5 minutes of generation, a counter increments. Seth starts a streak. Streaks are silly until they are not.

### 6. The Audience Grows (UGC Flywheel)

Seth is not the only viewer forever.

- **Prompt submission:** A `mood.txt` file in the repo. Any team member can write one word ("anxious," "celebratory," "noir"). Kimi absorbs the mood into the next pulse.
- **Community voting:** Three proposed opening lines are posted in Slack; the team votes; the winner seeds the next cold open.
- **Guest stars:** Rotate the protagonist. "Claude wrote this." "GPT-4 drove this." Viewers develop favorites. Rivalries emerge. Now you have a universe.

---

## v1.1 Feature Set — "The Season Premiere"

| Feature | Description | Retention Mechanic |
|---------|-------------|-------------------|
| **Mood Engine** | Kimi selects tone based on build health, commit velocity, or `mood.txt` input | The file feels alive, not logged |
| **Serialized Output** | Each run appends a dated line; `pulse.txt` becomes a micro-diary | Users scroll back to remember "last week" |
| **Cold-Open Header** | One-line tension-builder before the sentence | Curiosity gap—must read to resolve |
| **Cliffhanger Grammar** | Periodic ellipsis, question, or prophecy endings | Forces return to resolve or verify |
| **Friday Finale** | Expanded two-sentence reflection on Fridays | Weekly appointment viewing |
| **Guest Protagonists** | Rotate model attribution (Kimi, Claude, GPT-4) | Fandom, rivalry, prediction |
| **Streak Counter** | Track consecutive days the pulse is read within 5 min | Habit formation through game mechanic |
| **The B-Plot (`bpm.txt`)** | Metrics told as story: *"Latency: 0.3s — Kimi's heart is steady"* | Data nerds get lore; lore nerds get data |
| **User Mood Injection** | `mood.txt` lets any team member set the emotional theme | Ownership, anticipation, co-creation |
| **Season Arcs** | Themed 10-run blocks with ASCII title cards | Binge-reading; narrative momentum |

---

## Success Criteria (Shonda's Scorecard)

- [ ] A team member who is **not Seth** opens `pulse.txt` unprompted.
- [ ] Someone quotes the pulse in a standup or Slack channel.
- [ ] A streak reaches 5 consecutive days.
- [ ] A "guest star" episode provokes debate about which model "writes better."
- [ ] The team is annoyed when the pulse is late.

When the last box is checked, the prop has become a character. Then—and only then—do we greenlight Season 2.

---

*— SR*
