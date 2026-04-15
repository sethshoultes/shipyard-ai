# Retrospective: blog-daemon-architecture

## What Worked

**Two-round debate structure**
- Forced positions early, then synthesis
- Elon vs Steve tension surfaced core tradeoffs (speed vs craft)
- Round 2 concessions created hybrid approach

**Essence.md as north star**
- "48 OOM kills, kept shipping" became spine
- Locked emotional hook before debates
- Prevented scope drift

**Board review caught missing business model**
- Unanimous: no product = theater
- Forced honest assessment: 5.25/10 average
- Retention gap identified before ship

**Creative reviews (Ive, Angelou) surfaced fatal flaws**
- Code block disrupts flow
- Emotion arrives too late (line 87)
- "Elon Musk & Steve Jobs" byline undercuts authenticity

**QA blocked on placeholder**
- Caught incomplete content in line 31
- Two-pass structure worked as designed

## What Didn't Work

**QA failures consumed 2 iterations**
- Both passes blocked on same line
- Could have caught in single read
- Agent missed obvious fix between passes

**Open questions never resolved**
- Open source vs proprietary? No decision
- Distribution channel? Unknown
- Timeline? Debated but not locked
- Build proceeded despite blockers

**Board feedback arrived too late**
- Conditions for proceeding came after deliverable
- Should have run board review before build phase
- Sequence error: debate → build → review should be debate → review → build

**Deliverable ignored creative review input**
- Ive said "cut code block, link to GitHub instead" — ignored
- Angelou rewrote weak lines — not integrated
- Reviews generated, not applied

**No decision-maker role**
- Decisions.md has "locked" items, but who locked them?
- Open questions remain open
- Hybrid position defined but not executed

## What Should Change Next Time

**Run board review BEFORE build phase**
- Board spots business model gaps
- Cheaper to pivot at decisions stage than after deliverable exists
- Board verdict becomes build input, not post-ship commentary

**Assign decision authority**
- Who resolves open questions?
- "Locked" means nothing without lock-holder
- Need PM role: reads debates, picks path, updates decisions.md

**Integrate creative reviews into revision cycle**
- Creative review → revision → final QA
- Not creative review → ship anyway
- Ive/Angelou feedback = requirements, not suggestions

**Resolve blockers before build**
- 4 open questions in decisions.md = not ready
- Build phase should error on unresolved questions
- Force human decision on forks in the road

**Tighten QA iteration loop**
- Pass 1 fails? Show agent the failure
- Pass 2 should fix Pass 1's exact error
- Same error twice = agent context problem

**Cut placeholder author bylines**
- "Elon Musk & Steve Jobs" is cute in debate docs
- Undercuts credibility in deliverable
- Decide: Shipyard AI byline or real human name

## Key Learning

Process adherence beats individual brilliance — run phases in order, resolve decisions before building, integrate feedback before shipping, or waste cycles rebuilding.

## Process Adherence Score

**4/10**

Strong: Essence definition, debate structure, QA blocking
Weak: Build before board review, open questions unresolved, creative feedback ignored, revision cycle skipped
