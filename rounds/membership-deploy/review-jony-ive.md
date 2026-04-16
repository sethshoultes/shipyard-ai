# Design Review: Membership Deploy

**Reviewer**: Jony Ive
**Date**: 2026-04-16
**Artifact**: `/home/agent/shipyard-ai/deliverables/membership-deploy/DEPLOYMENT-STATUS.md`

---

## Visual Hierarchy: WEAK

Most important fact buried mid-document (line 42): "No commit needed - files already in correct state."

This is the verdict. Should be line 1.

**Fix**:
- Line 1-6: Move summary box to top. Single sentence: "Files already deployed. No changes needed."
- Collapse technical proof into appendix

---

## Whitespace: CLUTTERED

Tables create visual noise (lines 35-40, 62-68) when data is uniform.

**Fix**:
- Line 34-40: Replace table with single line: "Banned patterns: 0/0/0 (clean)"
- Line 62-68: Status symbols without grid. Just: `✅ Patterns: 0  ✅ Files: 3  ⚠️ Server: 500`

Lines 48-58 have three nested levels of explanation. Exhausting.

**Fix**: Compress to 3 bullets max.

---

## Consistency: FRAGMENTED

Status labels change style:
- Line 10: "MODIFIED APPROACH"
- Line 27: "COMPLETE ✅"
- Line 46: "IN PROGRESS"

Pick one system. Emoji or caps, not both.

**Fix**: Use only `✅ ⚠️ ⏸️` symbols. Remove verbal status.

---

## Craft: VERBOSE

Line 14-17: Code block for single error message. Unnecessary ceremony.

Line 50-53: Three bullet points say same thing: "server broken, not our fault."

**Fix**:
- Line 14-17: Inline the error. "`miniflare` undefined error — server config issue, not plugin."
- Line 50-53: Delete. Already stated in line 24.

---

## Quieter, More Powerful

**What it should be**:

```
# Membership Deploy: Already Complete

Files in `/plugins/membership/src/` match deliverables. Zero banned patterns. No deployment needed.

---

## Verification
✅ auth.ts — clean, unchanged
✅ email.ts — clean, unchanged
✅ sandbox-entry.ts — destination newer, kept

Banned patterns: 0

---

## Testing Blocked
sunrise-yoga server (port 4324) returns 500 on all endpoints.
`miniflare` config error — unrelated to plugin.

Per PRD: note environmental issues separately. Plugin verified clean.
```

**Result**: 17 lines vs 77. Same information. Zero ambiguity.

---

## Core Principle

Dense is not thorough. Thorough is knowing what to remove.

Status doc currently defends decisions. Should state facts.

Remove:
- Lines 12-19: explanation of "modified approach"
- Lines 48-58: three-level nesting of same point
- Lines 70-76: notes repeating body content

What remains: signal.
