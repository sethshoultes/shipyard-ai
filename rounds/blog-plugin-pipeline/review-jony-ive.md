# Design Review: blog-post.md

## Visual Hierarchy: Fractured

**Line 7**: Lede is dense. 443 violations buried mid-paragraph.
**Line 36**: "The Board Caught It" should lead with the finding, not the reviewer.
**Line 121**: Table is perfect — this is your opening. Pattern + Impact visible at a glance.

**Fix**: Move table from line 121 to line 9. Flip "Board Caught It" to "121 Hallucinated Response Throws."

---

## Whitespace: Suffocating

**Lines 15-32**: Code block with 4-layer comment stack crushes breathing room.
**Lines 43-69**: 27 lines for one broken pattern. Exhausting.
**Lines 134-161**: Another 28-line code block. Repetitive weight.

**Fix**: One example per pattern. Remove lines 134-161 entirely — table already told the story.

---

## Consistency: Broken Rhythm

**Three examples given** (lines 15, 43, 134).
**Five patterns exist** (line 121 table).

Where are `rc.pathParams` and `JSON.parse` examples? Either show all five or show none. Table is enough.

**Fix**: Delete all three code examples. Let table carry the taxonomy. Use one 6-line before/after pair at line 244 to show transformation.

---

## Craft Details

**Line 2**: Title over-promises. "AI That Debugs Itself" — the pipeline debugged it, not the AI.
**Line 36**: "The bones are good" — gorgeous quote wasted on wrong section. Belongs at line 7.
**Lines 77-90**: First clean example. This clarity should arrive earlier.
**Line 217**: "How the Pipeline Worked" — finally, structure. Should be line 10.

**Line 34**: "121 times" in bold — good.
**Line 73**: "153 violations" in bold — consistent.
**Line 130**: "443 violations" in bold — pattern emerges. This iscraft.

---

## What to Change

**Make it quieter:**

1. Delete lines 15-74 (all code examples before the table)
2. Move table to line 9
3. Delete "Third Example" section (lines 132-201)
4. Collapse "How the Pipeline Worked" phases into 4 bullets
5. Reduce before/after code at line 244 to 6 lines total

**Make it more powerful:**

1. Open with: "443 violations. Five hallucinated APIs. Zero working code."
2. Line 2: Shonda quote becomes line 3
3. Line 4: Pattern table
4. Line 30: "How We Fixed It" (4 bullets)
5. Line 40: One before/after pair (6 lines)
6. Line 50: Results
7. Line 60: The Dare

**Result:** 30% of current length. 3x impact. Every line earns its space.

---

## Verdict

Beautiful forensics. Poor storytelling.

You documented the wreckage with surgical precision. But readers don't need to see every body. Show the crash site from above — the pattern is more horrifying than the parts.

The table at line 121 does more work than 200 lines of code blocks. Trust it.

"The bones are good. Now give it a heartbeat."
