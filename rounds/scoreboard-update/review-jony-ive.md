# Scoreboard — Design Review

## Visual Hierarchy: **Weak**

**SCOREBOARD.md**
- Line 3: Timestamp fights with title for attention. Make it smaller, quieter, right-aligned
- Lines 9-12: Bold labels ("Total Shipped:") compete with values. Values are what matter — make them the hero
- Line 18: Table headers scream. They should whisper. Lower case, light weight
- Lines 58-100: Expanded details repeat table data. Redundant noise. Remove or differentiate purpose

**Verdict:** Most important thing (the table) drowns in formatting weight.

---

## Whitespace: **Compressed**

**SCOREBOARD.md**
- Line 6, 14, 53, 103: Triple horizontal rules `---` create visual stutter. Pick one rhythm: single rules or no rules
- Lines 9-12: Core metrics cramped. Give each metric breathing room — one blank line between
- Line 18-51: Table has no internal whitespace. Add padding illusion through column width consistency
- Lines 58-100: Expanded details collapse — each project needs separation. Two blank lines between projects minimum

**Verdict:** Dense. Feels rushed. No room to pause.

---

## Consistency: **Fractured**

**SCOREBOARD.md**
- Line 12 vs 387: "30.5 hours" becomes "X hours" (data inconsistency, not design, but breaks pattern)
- Line 20-23: Board scores mix precision (3.75, 1.5, 2.9). Force single decimal or none
- Lines 78-80, 89-90: "—/10" is broken. Should be "—" (clean) or "0.0/10" (honest)
- Line 105: Footer voice shifts — "Machine truth" is marketing copy. Just state the fact

**update-scoreboard.sh**
- Lines 1-15: Comment block uses mix of `#` styles. Pick one visual weight
- Lines 38-48: Three log functions when one with parameter would suffice. Code bloat = visual bloat
- Lines 383-390: Heredoc formatting inconsistent with script style. Feels borrowed, not native

**Verdict:** Patterns exist but don't repeat elegantly. Feels assembled, not designed.

---

## Craft: **Functional, Not Refined**

**SCOREBOARD.md**
- Line 1: "Shipyard AI — Scoreboard" — em dash is nice, but title could be bolder: just "Scoreboard" or iconic symbol
- Line 35: "BLOCKERS (17 issues)" — mixing verdict with data. Pick a lane. Perhaps `BLOCK` with footnote
- Line 105: Asterisk footer markup clutters. Use proper footer section or lighter text cue

**update-scoreboard.sh**
- Lines 140-141: Regex searching multiple patterns. Works, but elegant extraction would parse once
- Lines 305-312: Duration parsing uses regex + bc. Fragile. No error grace at edges
- Lines 393-413: Table generation in loop with string concat. Clean but could be data-driven template
- Line 442: Quote style changes (`'FOOTER'` vs regular). Inconsistent terminal detail

**Verdict:** Does the job. Doesn't reward inspection. No hidden refinement.

---

## What to Change: Make It Quieter But More Powerful

### SCOREBOARD.md

**Line 1-3:** Remove em dash. Make timestamp small, gray, right
```
# Scoreboard
                                                          2026-04-15 22:32 UTC
```

**Lines 7-12:** Remove bold labels. Let numbers speak. Align right
```
## At a Glance

     Shipped    32
      Failed     2
     Success    94%
    Duration    30.5 hrs avg
```

**Line 18:** Lower case headers, remove bars between, use spacing
```
project                                          shipped      qa    board    deliverables
```

**Lines 58-100:** Delete expanded details OR make them narrative summaries, not data dumps. Data already in table

**Line 103:** Remove rule. Remove footer text. Just blank

---

### update-scoreboard.sh

**Lines 1-15:** Single comment style. Lighter
```
# update-scoreboard.sh
# Extracts metrics. Writes SCOREBOARD.md. Missing data becomes "—"
```

**Lines 38-48:** Collapse log functions
```
log() { echo "[$1] $2" >&2; }
```

**Lines 140-147:** Parse once, extract cleanly
```
score=$(awk '/[Ss]core.*[0-9]/ {match($0, /[0-9]+(\.[0-9]+)?/); print substr($0, RSTART, RLENGTH); exit}' "$board_verdict_file")
```

**Lines 383-443:** Template from external file or cleaner heredoc architecture. Separate data from presentation

---

## Summary

Functional output. No elegance. Table is workhorse but dressed like show horse.

Make data the star. Remove formatting weight. One rhythm, one voice, one pattern throughout.

Scoreboard should feel inevitable, not assembled.
