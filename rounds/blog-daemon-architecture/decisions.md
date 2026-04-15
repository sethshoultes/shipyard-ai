# Build Blueprint: Blog Daemon Architecture
**Consolidated Decisions from Great Minds Debate**

---

## I. LOCKED DECISIONS

### 1.1 Naming & Positioning
**Decision:** Name it "The Night Shift"
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve Jobs
**Why:** Creates a category, not just a brand. "Ships while you sleep" is vivid, memorable, and captures the core value proposition. Names create mental models — this frames autonomous deployment as a shift that works while humans rest.

**Elon's Counter-Position (Lost):** "Premature branding — call it 'How Shipyard's Build Daemon Works' until it proves value"
**Resolution:** Hybrid approach — use "The Night Shift" as the concept/category name, but don't over-brand a product that doesn't exist yet. The blog post title remains descriptive.

---

### 1.2 Content Scope & Length
**Decision:** 800-1200 words, 3 core sections
**Proposed by:** Elon (800 words) vs Steve (1200-1500 words)
**Winner:** Compromise at 800-1200 words
**Why:** Elon right on cutting scope creep. Steve right that 800 words is too thin for emotional narrative. Middle ground: enough room to tell the war story without dwelling on minutiae.

**Structure (LOCKED):**
1. **Problem:** Manual PRD process is slow, requires babysitting
2. **Solution:** Autonomous daemon with resilience built-in
3. **Results:** 20 PRDs shipped, 48 OOM kills survived

**What Got CUT:**
- ❌ "What's Next" roadmap sections (Elon won this)
- ❌ "Hard Lessons" beyond the 48 OOM kills story (Both agreed)
- ❌ Architecture diagrams / Mermaid flowcharts (Steve won this)
- ❌ "How to Get Started" documentation (Steve won this)
- ❌ Multiple code snippets (Compromise: ONE snippet for credibility)

---

### 1.3 Voice & Tone
**Decision:** Confession, not marketing. Raw postmortem voice.
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve Jobs (Elon conceded in Round 2)
**Why:** "A raw postmortem gets 2,000 readers. A boring architecture post gets 200." (Elon, Round 2). Voice is a distribution lever.

**Writing Principles (LOCKED):**
- War story from the trenches, not product announcement
- Lead with "48 OOM kills, kept shipping" — memorability over completeness
- No adverbs, no qualifiers, no "we believe" or "we think"
- Jargon requires translation: "OOM kill = out of memory, server killed the process"
- One thing to remember: "Daemon survived 48 OOM kills and shipped 20 PRDs anyway"

**Elon's Validation:** "Steve's right that story should make developers lean forward. Lead with resilience angle, not technical specs."

---

### 1.4 Emotional Hook
**Decision:** Time travel + relief, not features
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve Jobs
**Why:** "People don't buy features. They buy freedom from 3am deploys." Hook is: write PRD, sleep, wake to shipped code.

**Core Emotion:** Relief. Closing laptop and trusting the machine.

**Elon's Pushback (Lost):** "Time travel is writer's masturbation — just say 'here's a daemon with 99% uptime'"
**Resolution:** Use resilience story (48 OOM kills) as the vehicle for the emotional hook. Grounded in facts, framed with feeling.

---

### 1.5 Product Attachment
**Decision:** Must attach to open source launch OR hiring signal
**Proposed by:** Elon (Round 1)
**Winner:** Elon
**Why:** "A blog post without a product is theater." Both agreed a devlog with no distribution path is dead content.

**Options (ONE must be chosen):**
1. Open source the daemon → blog becomes launch post → GitHub stars = growth loop
2. Keep proprietary → blog becomes hiring/credibility post → "we know what we're doing"
3. Cut the blog post entirely → make it internal documentation

**CRITICAL:** Build phase must include decision on which path. Cannot ship blog post without resolving this.

---

### 1.6 Code Snippets
**Decision:** ONE code snippet for credibility, not a dump
**Proposed by:** Steve (show craft) vs Elon (cut all code)
**Winner:** Compromise
**Why:** Steve: "The snippet isn't a tease, it's credibility. You see the decisions we made." Elon: "If it's not open source, don't dump code." Middle ground: 10-15 lines of `pipeline.ts` showing the core state machine.

**What to Show:**
- State machine logic (draft → debate → plan → build → QA → approve)
- Health check / restart resilience pattern
- NOT: Full file dumps, multiple snippets, or code without context

---

### 1.7 Debuggability vs Anti-Dashboard
**Decision:** ONE status mechanism, not a dashboard
**Proposed by:** Elon (Round 2)
**Winner:** Elon (Steve conceded)
**Why:** Steve's "anti-dashboard" aesthetic is correct (no real-time graphs, no progress bars). But Elon's right: "Absence of UI becomes absence of debuggability when a PRD stalls for 90 minutes."

**Implementation (LOCKED):**
- `/health` endpoint OR `status` CLI command
- Returns: current phase, elapsed time, last heartbeat
- NOT a dashboard — just JSON for debugging
- Elon: "This is non-negotiable for anything running unattended"

---

### 1.8 Architecture Simplification
**Decision:** Five phases, not seven
**Proposed by:** Elon (Round 1)
**Winner:** Elon (Steve didn't object)
**Why:** "Creative review" and "board review" are org-chart architecture, not software architecture. Merge into one "review" phase.

**LOCKED Pipeline:**
1. **Draft** (PRD arrives)
2. **Debate** (agents discuss it)
3. **Plan** (one agent designs solution)
4. **Build** (code is written)
5. **QA** (validation)
6. **Approve** (human sign-off)
7. **Ship** (merge & deploy)

**NOT** separate creative/board phases — just run two prompts in one review phase.

**Description (for blog):** "File watcher triggers state machine: draft → debate → plan → build → QA → approve." No flowchart needed.

---

### 1.9 Performance Architecture
**Decision:** Parallelize PRDs, not agents within a PRD
**Proposed by:** Elon (Round 1)
**Winner:** Elon (Steve conceded in Round 2)
**Why:** "48 OOM kills is a good story. It's a terrible architecture." Current approach runs 20 parallel agent sessions on 8GB RAM. Correct approach: run 10 PRDs in parallel on 10 separate machines.

**For Blog Post:**
- Mention 48 OOM kills as the resilience story
- Acknowledge this is brute force, not scaling strategy
- If asked, 10x path = parallel PRD execution on separate VMs

**Steve's Concession:** "He's right about the 10x path. 48 OOM kills is a good story, terrible architecture."

---

## II. MVP FEATURE SET (v1)

### What Ships in the Blog Post:
1. ✅ **Headline & Hook:** "The Daemon That Ships While You Sleep" OR "The Night Shift: 48 OOM Kills, 20 PRDs Shipped"
2. ✅ **Opening:** "We've shipped 20 PRDs. You weren't watching. Here's how."
3. ✅ **Core Story:** 48 OOM kill resilience + 20 PRDs shipped
4. ✅ **Architecture Summary:** Five-phase pipeline (one sentence, no diagram)
5. ✅ **Code Snippet:** 10-15 lines of state machine / health check logic
6. ✅ **Emotional Payoff:** "Close laptop, trust machine, wake to shipped code"
7. ✅ **Product Link:** GitHub repo (if open source) OR hiring CTA (if proprietary)

### What Does NOT Ship:
- ❌ "What's Next" roadmap
- ❌ "Hard Lessons" beyond OOM kills
- ❌ Multi-step getting started guide
- ❌ Architecture diagrams
- ❌ Multiple code examples
- ❌ Jargon without translation

---

## III. FILE STRUCTURE (What Gets Built)

### Blog Post Deliverable:
```
/shipyard-ai/blog/the-night-shift.md
```

**Sections:**
1. **Lede** (100 words)
   - Hook: 48 OOM kills, 20 PRDs shipped
   - Promise: Here's how a daemon ships while you sleep

2. **Problem** (200 words)
   - Manual PRD process: slow, requires babysitting, doesn't scale
   - 3am deploys, stalled builds, context-switching kills

3. **Solution** (400-500 words)
   - The Night Shift: autonomous daemon with five-phase pipeline
   - File watcher → state machine → agents execute
   - Resilience pattern: health checks, restart logic, OOM kill survival
   - Code snippet: 10-15 lines of core logic

4. **Results** (200-300 words)
   - 20 PRDs shipped, 5-min heartbeat, 48 crashes survived
   - Time travel: write PRD, sleep, wake to PR
   - Emotion: relief from closing laptop and trusting the system

5. **CTA** (100 words)
   - If open source: "Clone it here: github.com/shipyard/daemon"
   - If proprietary: "We're hiring engineers who build systems like this"

### Supporting Files (if open source path chosen):
```
/shipyard-daemon/
  - README.md (architecture overview)
  - pipeline.ts (core state machine)
  - health.ts (resilience logic)
  - examples/ (sample PRD workflows)
```

---

## IV. OPEN QUESTIONS (Need Resolution Before Build)

### Q1: Open Source or Proprietary?
**Context:** Elon's non-negotiable — blog post must link to product or hiring
**Options:**
- A) Open source daemon → blog becomes launch post → growth loop via GitHub stars
- B) Keep proprietary → blog becomes credibility/hiring post → "proof we know our stuff"
- C) Cut blog post → internal documentation only

**Decision Required:** YES/NO on open sourcing daemon
**Blocker:** Cannot write blog post without knowing the CTA

---

### Q2: Which Code Snippet to Show?
**Context:** ONE snippet for credibility
**Options:**
- A) State machine transitions (draft → debate → build)
- B) Health check / restart resilience logic
- C) File watcher + queue management

**Decision Required:** Pick ONE that best demonstrates craft
**Recommendation:** Health check logic — ties to 48 OOM kills story

---

### Q3: What's the Distribution Channel?
**Context:** Elon: "TAM for daemon architecture devlogs = 500 people"
**Options:**
- A) Post to HackerNews (expect 200-2000 upvotes depending on voice quality)
- B) Post to r/programming, r/devops (smaller reach, more targeted)
- C) LinkedIn + Twitter (credibility signal for hiring)
- D) Internal only (no external distribution)

**Decision Required:** Where does this get posted?
**Impacts:** Tone, length, technical depth

---

### Q4: Timeline for Shipping?
**Context:** Elon: "Ship in <2 hours, not a multi-day branding exercise"
**Options:**
- A) One agent session writes it (45 mins), human reviews (15 mins), ship (1 hour total)
- B) Multiple revision cycles for polish (4-6 hours)
- C) Multi-day editing process (Steve's craft approach)

**Decision Required:** Speed vs polish tradeoff
**Elon's Position:** If this takes longer than 2 hours, tooling is broken
**Steve's Position:** Fast is not the goal, good is the goal

---

## V. RISK REGISTER (What Could Go Wrong)

### R1: Blog Post Ships Without Product Attachment
**Severity:** HIGH
**Impact:** "Theater" — beautiful content, zero distribution, no business outcome
**Mitigation:** LOCKED DECISION — cannot ship without open source link OR hiring CTA
**Owner:** Must resolve Open Question #1 before build starts

---

### R2: Agent Hallucinates Numbers or Lessons
**Severity:** MEDIUM
**Impact:** Blog post contains fabricated "facts" (wrong PRD count, invented crashes)
**Mitigation:** Constrain agent to ONLY cite facts from source files (pipeline.ts, health.ts, deliverables/)
**Owner:** Agent instruction must include "ground all numbers in source files"

---

### R3: Code Snippet Leaks Proprietary Logic
**Severity:** MEDIUM (if proprietary), LOW (if open source)
**Impact:** Shows internal implementation details we don't want public
**Mitigation:** Human review of code snippet before publish. Strip any API keys, internal URLs, or sensitive patterns
**Owner:** Final review checklist item

---

### R4: Voice is Too Technical or Too Fluffy
**Severity:** MEDIUM
**Impact:** Misses the tone balance — either boring devlog (200 readers) or vaporware fluff (no credibility)
**Mitigation:** Locked decision on voice = "confession not marketing, grounded in facts, framed with feeling"
**Test:** Does the first paragraph make you lean forward? Does it cite real numbers?
**Owner:** Human review against voice guidelines

---

### R5: Scope Creep During Writing
**Severity:** LOW
**Impact:** Agent adds "What's Next" sections, multiple code snippets, architecture diagrams despite locked cuts
**Mitigation:** Agent instruction must include explicit EXCLUSION list (see Section II)
**Owner:** Agent prompt engineering

---

### R6: 48 OOM Kills Story Becomes the Whole Post
**Severity:** LOW
**Impact:** Dwells on the crash story, misses the "ships while you sleep" payoff
**Mitigation:** Structure locked to 3 sections — OOM kills is the hook, not the body
**Owner:** Outline review before full draft

---

### R7: Distribution Path is Undefined
**Severity:** MEDIUM
**Impact:** Post ships to wrong audience (e.g., HackerNews when it's a hiring post) or isn't posted at all
**Mitigation:** Must resolve Open Question #3 before publish
**Owner:** Marketing/growth decision

---

## VI. SYNTHESIS: THE HYBRID POSITION

**From Elon (What We Keep):**
- ✅ 800-1200 word scope (not 1800+)
- ✅ Ship in <2 hours, not multi-day
- ✅ Must link to product or hiring (no theater)
- ✅ Five phases, not seven (simplify architecture)
- ✅ One debuggability mechanism (/health endpoint)
- ✅ Cut "what's next" and "hard lessons" scope creep

**From Steve (What We Keep):**
- ✅ "The Night Shift" as category name
- ✅ Voice = confession not marketing, raw postmortem tone
- ✅ Hook = time travel + relief ("ships while you sleep")
- ✅ No architecture diagrams ("if you need a flowchart, you've lost")
- ✅ ONE code snippet for credibility
- ✅ 48 OOM kills as the spine of the post

**The Merge:**
Write the blog post in **Steve's voice** (confession, emotional, memorable) within **Elon's constraints** (800-1200 words, ships today, needs product attachment).

---

## VII. BUILD PHASE CHECKLIST

Before agent writes the blog post:

- [ ] **RESOLVE:** Open source or proprietary? (Open Question #1)
- [ ] **DECIDE:** Which code snippet to show? (Open Question #2)
- [ ] **CONFIRM:** Distribution channel (Open Question #3)
- [ ] **SET:** Timeline expectation — 1 hour or 6 hours? (Open Question #4)

Agent Instructions:
- [ ] Ground all numbers in source files (pipeline.ts, health.ts, deliverables/)
- [ ] Follow locked structure: Problem / Solution / Results
- [ ] Use locked voice: confession not marketing, raw postmortem
- [ ] Include exclusion list: no roadmap, no diagrams, no multi-code dumps
- [ ] Single code snippet: 10-15 lines max
- [ ] End with CTA: GitHub link OR hiring link (based on Q1 resolution)

Human Review:
- [ ] Numbers accurate? (cross-check with source files)
- [ ] Voice on-brand? (first paragraph makes you lean forward?)
- [ ] Code snippet safe? (no proprietary leaks)
- [ ] Scope clean? (no forbidden sections snuck in)
- [ ] CTA present? (not theater — links to product or hiring)

---

## VIII. FINAL VERDICT

**Status:** READY TO BUILD (pending 4 open questions)

**Confidence Level:** HIGH
- Core decisions locked through 2 rounds of debate
- Both Steve and Elon conceded on key points
- Hybrid position is coherent and actionable

**Estimated Build Time:** 45-60 minutes (one agent session)
**Estimated Review Time:** 15-30 minutes (human QA)
**Total Time to Ship:** <2 hours (Elon's requirement)

**Next Action:** Resolve Open Questions #1-4, then execute build.

---

**Blueprint Authority:** Phil Jackson, Zen Master
**Source Material:** 5 debate files, 2 rounds, essence.md
**Date:** 2026-04-14
**Revision:** 1.0 (LOCKED)
