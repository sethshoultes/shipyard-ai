# Design Review: Model Selection Blog Post

**Verdict: Strong bones. Cluttered execution.**

## Visual Hierarchy

**Works:**
- Opening hook (line 7) hits hard. Concrete failure before theory.
- Section headers escalate properly: problem → solution → implementation → results
- Code blocks provide natural rhythm breaks

**Fails:**
- Table (lines 42-48) buried mid-piece. Should anchor section 2, not hide in it.
- Cost comparison boxes (lines 17-32, 168-181) visually identical. First is hypothetical, second is real. No distinction.
- "Your Move" section (line 212) weak closer. Numbered list whimpers where prose should punch.

## Whitespace

**Breathes:**
- Single-sentence paragraphs (lines 11, 38, 55) create impact
- Code blocks (61-91) well-spaced, scannable

**Suffocates:**
- Lists at 188-207 too dense. No air between categories.
- Line 104-111 example rambles. Needs half the words.
- Section 2 (lines 13-38) walls of calculation. Eyes glaze.

## Consistency

**Elegant:**
- Code comment pattern: `// [Phase] - [needs what]` (lines 64, 71, 78, 85)
- Cost formatting: dollar amounts, clear labels
- TERSE theme: introduced, explained, quantified (lines 102-148)

**Broken:**
- Token cost labels inconsistent: "Medium/High/Low" in table vs precise dollars in results
- "The" prefix on headers: "The Cost Math" (13), "The Model Selection Table" (40), "The TERSE Optimization" (102). Drop it everywhere.
- Quote formatting varies: backticks vs code blocks for single terms

## Craft

**Rewards inspection:**
- Line 7: "hallucinated 100+ API violations" — specific, visceral
- Lines 133-138: TERSE output example uses real violation codes, not Lorem Ipsum
- Line 210: "like database selection" — smart analogy, unexpected

**Punishes it:**
- Line 104: "Review phases generate massive outputs." Tell, don't show. Should open with the 100-line diff nightmare.
- Lines 215-221: Generic advice. "Build something" feels tacked on.
- Line 36: "your time" bolded. Patronizing. Reader already knows.

## Changes: Quieter, More Powerful

**1. Elevate the table (lines 42-48)**
- Move after line 38
- Remove "The Model Selection Table" header
- Let it speak without announcement

**2. Strip section headers**
- "The Cost Math" → "Cost Math"
- "The TERSE Optimization" → "TERSE: 75% Token Savings"
- "The Results" → "Results"

**3. Compress opening calculation (lines 17-32)**
- Current: 16 lines for simple math
- Target: 6 lines, visual table format like lines 168-173
- Move engineering time insight (line 36) into table row

**4. Delete lines 188-207 entirely**
- Repeats table information in worse format
- If reader missed table pattern, they won't read lists

**5. Rewrite closer (lines 212-227)**
- Replace numbered list with single paragraph
- End on "eliminated hallucinations" stat (line 162), not "Build something"
- Last line should haunt: one concrete cost they're paying right now

**6. Unify cost language**
- Table: use dollars, not "Medium/High/Low"
- Or reverse: use cognitive load terms everywhere, dollars only in results

**7. Tighten TERSE example (lines 104-111)**
- Current verbose example: 111 words
- Needs: 30 words max
- Reader gets the point at "3-4 sentences of explanation"

**File:** `/home/agent/shipyard-ai/deliverables/blog-model-selection/model-selection-multi-agent.md`

**Lines needing surgery:** 13, 17-38, 40, 102, 104-111, 150, 188-227

**What makes this piece work:** Concrete costs, real failure modes, code you can copy.

**What weakens it:** Explaining past the point of understanding. Repeating in lists what table already said. Afraid to let data stand alone.

Trust the numbers. Delete the reassurance.
