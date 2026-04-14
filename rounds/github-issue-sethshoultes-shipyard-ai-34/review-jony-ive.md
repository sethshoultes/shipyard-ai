# Design Review: SEODash Plugin Fix

## Verdict
**Remove half of it. Then remove half again.**

---

## Visual Hierarchy

**SUMMARY.md (Line 1-7)**
- Title screams. Everything else whispers. Wrong.
- Status emoji (✅) fights with text. Pick one language.
- Lines 3-6: four labels doing job of one.

**Line 34-48: Commit Table**
- Beautiful. Clean. Every column earns its space.
- But why "Wave" column when already in wave sections?

**Line 52-62: Performance Table**
- **100x** yells. Good. Most important wins surface first.
- Three columns instead of five. Restraint.

**Line 66-74: Files Modified**
- Buried. Should be higher. What changed matters more than how we labeled commits.

---

## Whitespace

**Lines 8, 32, 49, 63, 79, 91, 108, 138, 152, 162, 187**
- Eleven horizontal rules. That's not separation, it's walls.
- Remove all. Replace with single blank line.

**Line 12: "Successfully executed **8 tasks across 4 waves**"**
- Breathing room exists. Wave sections (14-31) have space.
- But line 95-106 crams 20 checkmarks into breathless list.

---

## Consistency

**Inconsistent boldface:**
- Line 17: "Deliverable:" bold
- Line 76: "New Files:" bold
- Line 84: "Build:" bold
- Line 85: "Tests:" bold
- Choose: bold the label or the value. Never both formats.

**Inconsistent list syntax:**
- Lines 20-22: numbered list inside wave section
- Lines 24-25: numbered list with different indent
- Lines 114-127: numbered list with H3 subheads
- Pick one list grammar. Use everywhere.

**Wave headers (14, 19, 24, 28):**
- Three have ✅. Wave 0 has ✅ inline.
- Make identical or make meaningfully different.

---

## Craft

**Line 189-191: Attribution**
- "Executed by," "Supervised by," "Date," "Status"
- Too much ceremony. Credits don't need four lines.
- Reduce: "Claude Sonnet 4.5 · 2026-04-14"

**Line 134: "Ship Gate"**
- Single most important decision on page.
- Set in quotes like throwaway phrase.
- Should be H2 or pull quote. Current treatment disrespects weight.

**Line 142-149: Key Decisions Table**
- Impact column says "100x performance improvement"
- Performance table already said this (line 55-56).
- Repetition isn't emphasis. It's noise.

**Lines 95-106: Requirements checkmarks**
- All ✅. No ❌. No ⚠️.
- Homogeneous = invisible.
- State fact once: "20/20 requirements met." Delete list.

---

## What Would Make It Quieter But More Powerful

**Remove entirely:**
1. All 11 horizontal rules (lines 8, 32, 49, 63, 79, 91, 108, 138, 152, 162, 187)
2. Requirements traceability section (93-107) — summary sufficient
3. Key Decisions table (140-150) — duplicates Performance table
4. How to Deploy section (163-185) — belongs in README, not summary
5. Status emoji ✅ next to wave headers — already says "Complete" in line 5

**Collapse:**
- Lines 3-6 into single line: "Issue #34 · feature/seodash-fix-github-issue-34 · 2026-04-14"
- Lines 189-192 into: "Claude Sonnet 4.5 · Phil Jackson · 2026-04-14"

**Elevate:**
- Move "Ship Gate" (line 134) to top, below title
- Move Files Modified (66-77) above Commits table
- Make Performance Improvements (51-62) H2 instead of H2 buried mid-doc

**Strengthen:**
- Line 1 title: remove emoji, version, phase cruft. Just "SEODash Plugin Fix"
- Line 12: delete "Successfully executed" — just "8 tasks across 4 waves"
- Line 85-89: delete explanation. "25/44 tests passing" sufficient. Trust reader.

**Single biggest fix:**
Replace lines 114-135 (What's Next) with:
```
## Next

Wave 4: Dashboard UI
Wave 5: Social previews
Wave 6: **Deploy to Peak Dental — ship gate**
Wave 7: Structured data

Ship when Peak Dental runs without errors.
```

Current version: 193 lines.
Needed: ~80 lines.

---

## Files & Lines

| File | Lines | Issue |
|------|-------|-------|
| SUMMARY.md | 8, 32, 49, 63, 79, 91, 108, 138, 152, 162, 187 | Remove horizontal rules |
| SUMMARY.md | 3-6 | Collapse metadata |
| SUMMARY.md | 93-107 | Delete requirements list |
| SUMMARY.md | 140-150 | Delete decisions table |
| SUMMARY.md | 163-185 | Move deploy to separate doc |
| SUMMARY.md | 189-192 | Collapse attribution |
| SUMMARY.md | 134 | Elevate ship gate |
| SUMMARY.md | 66-77 | Move files higher |

---

Form follows function. Currently: form follows anxiety.
