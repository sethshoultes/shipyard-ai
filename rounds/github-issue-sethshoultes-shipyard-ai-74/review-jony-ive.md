# Design Review: Issue #74 Deliverables

**Reviewer:** Jony Ive (Design Philosophy)
**Date:** April 16, 2026
**Subject:** EventDash plugin entrypoint fix deliverables

---

## Visual Hierarchy: FAILED

Most important thing should be most visible.

**code-diff.patch:**
- Commit message buried at top (lines 1-33)
- Actual changes start line 35
- User must scroll through 34 lines of preamble to see code
- **Fix:** Put diff first. Metadata second.

**verification-checklist.md:**
- Title requires 4 lines (lines 1-7)
- First actual content: line 10
- Checkboxes lost in bash output noise
- Lines 16-17: Output text breaks visual rhythm
- **Fix:** Remove redundant bash output. Show result only.

**execution-summary.md:**
- "Executive Summary" header (line 11) fights with title
- Real summary starts line 13
- Two lines for metadata that could be one
- **Fix:** Remove redundant "Executive Summary" label.

**execution-report.md:**
- Clean header structure (lines 1-7) ✓
- "Executive Summary" redundant again (line 10)
- Timeline buried under metadata

---

## Whitespace: MIXED

Room to breathe matters.

**code-diff.patch:**
- No whitespace between commit message sections
- Dense paragraph blocks (lines 16-20, 26-29)
- **Fix:** Add blank line between "Changes:", "Technical Details:", "Build Status:"

**verification-checklist.md:**
- Good: Section separators with `---` (lines 8, 44, etc.)
- Bad: Bash blocks run together with checkboxes
- Bad: Line 16-17 output crushes checkbox
- **Fix:** Remove inline bash output. Trust results.

**execution-summary.md:**
- Good: Section separators present
- Bad: Dense code blocks without spacing (lines 23-47)
- Bad: Table immediately after header (line 64) — no breathing room
- **Fix:** Add blank line before tables.

**execution-report.md:**
- Excellent spacing in timeline section (lines 20-41)
- Consistent `---` separators throughout ✓
- Tables have proper spacing ✓

---

## Consistency: FAILED

Patterns must repeat.

**Across all files:**
- Two formats for status indicators:
  - `✅ COMPLETE` (execution-summary.md line 4)
  - `✅ PASS` (verification-checklist.md line 19)
  - `✅ PRODUCTION READY` (execution-report.md line 211)
- Three different checkbox styles:
  - `- [x]` in verification-checklist.md
  - `- ✅` in execution-summary.md (line 356)
  - `- ⬜` in execution-report.md (line 350)
- **Fix:** Pick one. Use everywhere.

**Headers:**
- H2 usage inconsistent:
  - "## Executive Summary" (execution-summary.md line 11)
  - "## What Was Implemented" (execution-summary.md line 19)
  - "## What Was Found" (execution-report.md line 45)
- **Fix:** Use parallel structure. All gerunds or all nouns.

---

## Craft: FAILED

Details must reward inspection.

**verification-checklist.md:**
- Lines 15-32: Bash commands with inline output
- Output format breaks reading flow
- Example (lines 15-19):
  ```
  - [x] **File exists at expected path**
    ```bash
    ls -la /home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts
    # Output: -rw-r--r-- 1 agent agent 111251 Apr 16 07:32 sandbox-entry.ts
    ```
  ```
- **Fix:** Show command OR result. Not both. Choose based on value.

**code-diff.patch:**
- Lines 5-8: Commit message title and body
- No visual distinction between title and body
- Three-line body could be one paragraph
- **Fix:** Blank line after title. Single paragraph for body.

**execution-summary.md:**
- Lines 72-103: Tables use pipes but alignment varies
- "Status" column width inconsistent
- **Fix:** Align all table columns. Equal spacing.

**execution-report.md:**
- Line 240: "(7,891 words)" — unnecessary character count
- Line 250: "(4,238 words)" — distracts from content
- **Fix:** Remove word counts. Trust quality over quantity.

---

## What Would Make This Quieter But More Powerful

### 1. Radical Reduction

**verification-checklist.md:**
Remove bash command noise entirely:

```markdown
- [x] File exists at expected path
  111,251 bytes, UTF-8 text

- [x] Contains valid TypeScript
  Starts with emdash imports
```

Current version: 656 lines
Reduced version: ~200 lines
**Impact:** Same information. 70% less noise.

---

### 2. Single Status System

Unify all status indicators:

```markdown
✅ Complete
⚠️ Blocked
❌ Failed
⏸️ Paused
```

Apply everywhere. No exceptions.

Current: 3 systems competing
Unified: 1 system, 4 states
**Impact:** Instant recognition. No interpretation needed.

---

### 3. Hierarchy Through Absence

**code-diff.patch:**
Move commit metadata to bottom:

```diff
diff --git a/plugins/eventdash/src/index.ts
[... all changes ...]

---
Commit: 7055563552f5dc16d9b577e13ef5f80acef0866e
Author: Phil Jackson
Date: Thu Apr 16 07:32:21 2026 +0000
```

Current: Metadata dominates
Revised: Code dominates
**Impact:** User sees changes immediately.

---

### 4. Eliminate Redundancy

**All summaries:**
Remove "Executive Summary" headers. Title already declares it.

**All checklists:**
Remove inline command output. Results suffice.

**All reports:**
Remove word counts. Quality > quantity signals.

Lines saved: ~150 across all files
Value lost: Zero

---

### 5. Visual Rhythm

Add consistent spacing before tables:

```markdown
## Requirements Verification

| Requirement | Status | Evidence |
```

Should be:

```markdown
## Requirements Verification

| Requirement | Status | Evidence |
```

Small change. Massive impact on readability.

---

## Specific Line Numbers

### code-diff.patch
- **Lines 1-34:** Move to end
- **Lines 16-20:** Add blank lines between sections
- **Lines 26-29:** Compress to single paragraph

### verification-checklist.md
- **Lines 1-7:** Compress to 3 lines
- **Lines 15-41:** Remove bash commands, keep results only
- **Lines 52-98:** Remove grep output text, show line numbers only
- **Entire file:** Replace `✅ PASS` with `✅`

### execution-summary.md
- **Line 11:** Remove "Executive Summary" header
- **Line 64:** Add blank line before table
- **Lines 72-103:** Align all table columns uniformly
- **Line 356-371:** Unify checkbox system

### execution-report.md
- **Line 10:** Remove "Executive Summary" header
- **Line 240:** Remove "(7,891 words)"
- **Line 250:** Remove "(4,238 words)"
- **Lines 20-41:** Keep as reference — best spacing in set

---

## Summary

These deliverables work. But they shout when they should whisper.

**Core issue:** Every detail gets equal visual weight. Reader must filter manually.

**Solution:** Hierarchy through reduction. Power through absence.

Current state: Comprehensive but exhausting
Desired state: Essential and effortless

Most important change: Remove 40% of content. Say same thing.

That's design.

---

**Status:** ⚠️ Functional but not refined
**Recommendation:** Ship functional. Refine template for next issue.
