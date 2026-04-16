# Jony Ive Design Review

## Visual Hierarchy: FAILING

**decisions.md** (lines 1-384)
- Structure drowns the verdict
- 76 lines before any decision
- Emoji taxonomy creates noise, not clarity
- Headers compete rather than cascade

**essence.md** (lines 1-25)
- Perfect. Lead with feeling.
- "Relief. Zero surprise. It just works." — this IS the product

**round-2-steve.md** & **round-2-elon.md**
- Buried ledes everywhere
- Arguments before conclusions
- Reader must excavate to find position

**Fix:**
- decisions.md: Move line 338 synthesis to line 5
- Kill emoji system. Use weight, not decoration.
- Round files: verdict first, reasoning after

## Whitespace: SUFFOCATING

**decisions.md:**
- Lines 78-155: 77 consecutive lines with zero breathing room
- Nested lists collapse into texture
- Eye has nowhere to rest

**essence.md:**
- Correct rhythm. Short bursts. Space between.
- This is the reference for all other files.

**Fix:**
- Single blank line between every decision (not just sections)
- Max 5 consecutive lines of text
- Use silence as punctuation

## Consistency: FRACTURED

**Binding name:**
- Line 40 (decisions.md): `LOADER`
- Line 83: `worker_loaders`
- Line 362: "the binding"
- Three names for one thing. Unacceptable.

**Tone:**
- essence.md: Declarative, confident
- decisions.md: Corporate project management
- round files: Personality-driven argumentation
- No shared voice

**Fix:**
- Choose one binding reference, never vary
- Unify voice: declarative imperatives throughout
- Kill "decision-speak" ("Proposed by," "Winner")

## Craft: DETAILS MISSING INTEGRITY

**Line 383 (decisions.md):**
- "*Orchestrated by Phil Jackson*"
- Novelty footnote undermines seriousness
- Attribution doesn't belong in build blueprint

**Lines 112-118 (decisions.md):**
- "What's NOT in v1" section
- Negative space defined by what was rejected
- Shows seams. Should be invisible.

**Lines 228-237 (decisions.md):**
- Risk mitigation uses conversational quotes
- "They never do" breaks professional register
- Personality inserted where precision belongs

**Fix:**
- Delete line 383 entirely
- Delete "What's NOT in v1" — document what IS
- Purge all quoted personality fragments from decisions.md

## Quiet Power: WHERE IT'S LOST

**Current state:**
- Shouting through formatting
- Explaining through volume
- 384 lines where 80 would dominate

**essence.md proves less is more:**
- 25 lines
- No decoration
- Maximum impact

**What would make deliverables quieter but more powerful:**

1. **decisions.md → decisions.md (reductive edit)**
   - Lines 1-76: Compress to 10
   - Lines 338-348: Move to top
   - Delete lines 169-220 (open questions belong elsewhere)
   - Delete lines 222-313 (risk register is process artifact, not deliverable)
   - Target: 120 lines maximum

2. **Create single-page primer: ship.md**
   - 30 lines
   - What ships when
   - Zero context, pure action
   - Replace decisions.md for 90% of readers

3. **Round files: invert structure**
   - Line 1: Position
   - Lines 2-5: Why
   - Everything else: optional appendix

4. **Typography over decoration**
   - Remove all emoji (lines 9, 78, 169, 222, 316, 338, 352)
   - Use line weight: **bold** for verdicts, normal for reasoning
   - Whitespace creates hierarchy, not symbols

5. **Invisible seams**
   - Never show debate process in final blueprint
   - "Elon vs Steve" is internal. User sees synthesis only.
   - Lines 12-14, 22-24, 33-42: Delete attribution

## Final Verdict

**These deliverables document the design process.**
**They should BE the design.**

Essence is perfect. Everything else is commentary.

Strip to essence. Then ship.

— Jony
