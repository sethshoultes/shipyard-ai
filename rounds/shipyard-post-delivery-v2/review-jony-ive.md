# Design Review: Anchor Post-Delivery System

**Reviewer:** Jony Ive
**Date:** 2026-04-12
**Deliverable:** shipyard-post-delivery-v2/anchor

---

## Overall Impression

There is something profoundly honest about this work. The intent is clear: to make clients feel held, not sold to. The phrase "We don't disappear" carries emotional weight because it names a universal frustration and quietly resolves it.

But the execution, while earnest, is cluttered. There is too much. Too many headings. Too many tables. Too much explanation of why something exists rather than simply letting it exist. The work explains itself when it should simply *be* itself.

Great design whispers. This work occasionally shouts.

---

## Visual Hierarchy

### What Works

The email templates themselves (`01-launch-day.md`, lines 15-43) demonstrate strong hierarchy. The opening line—"Look what we built together."—is the most important thing, and it appears exactly where it should: first. The eye knows where to go.

The subject lines are restrained and human:
- "Your site is live!" (`01-launch-day.md`, line 11)
- "Your site's first week" (`02-day-7-checkin.md`, line 11)
- "One month in" (`03-day-30-refresh.md`, line 11)

These are quiet. They don't compete. They invite.

### What Struggles

The documentation drowns in equal-weight sections. In `README.md`, lines 19-37, the directory structure receives the same visual prominence as "Core Philosophy" (lines 41-46). But these are not equal. The philosophy *is* the product. The directory structure is implementation. One should tower; the other should recede.

In `voice-guide.md`, the "DO sound like this" and "DON'T sound like this" sections (lines 38-55) are presented with identical visual weight. But the DO list is the answer. The DON'T list is merely context. The answer should be unmistakable.

Tables proliferate (`SEND-PROCESS.md`, lines 69-76, 95-101; `anchor-pro.md`, lines 68-77). Tables suggest equivalence. But not all rows are equal. Which row matters most? The form doesn't tell you.

---

## Whitespace

### What Works

The email templates breathe. In `02-day-7-checkin.md`, lines 17-34, short paragraphs and bullet points create natural pauses. The eye rests. This is correct.

### What Struggles

The documentation files are dense with metadata that the reader must wade through before reaching substance.

`voice-guide.md` opens with:
```
**Purpose:** Ensure all Anchor emails feel human, warm, and consistent.
**Mitigates Risk:** "Emails feel robotic despite intentions" (MEDIUM/HIGH)
```

This is administrative exhaust at the top of a document about *voice*. The voice itself should speak first. Move this to the bottom, or remove it entirely. The document should demonstrate what it teaches.

`client-database-template.md` is particularly dense. Lines 18-41 present a 16-row table of database properties. This is necessary information, but it is presented as a wall. Group properties by function. Add space between the essential and the optional. Let the eye distinguish what it must do from what it might do.

The "Quick Reference Card" in `SEND-PROCESS.md` (lines 219-237) is the best part of that document. It should appear first, not buried at the end after 200 lines of process description.

---

## Consistency

### What Works

The emotional through-line is unwavering. Every email carries "We don't disappear" or a variation. This is discipline. This is brand.

The sign-off pattern is consistent:
- "— The Shipyard AI team" (formal)
- "— Shipyard" (warm)

The CTA strategy alternates predictably: hard (Day 0), soft (Day 7), hard (Day 30), soft (Month 6). This rhythm is intentional and correct.

### What Struggles

Heading styles vary without purpose. Compare:

`anchor-basic.md`, line 9: `## Product Description (for Stripe)`
`anchor-pro.md`, line 9: `## Product Description (for Stripe)`

These match. Good.

But then:

`01-launch-day.md`, line 46: `## Merge Fields Required`
`03-day-30-refresh.md`, line 42: `## Merge Fields Required`

These also match. Also good.

However:

`SEND-PROCESS.md`, line 67: `## Merge Field Inventory`

Why "Inventory" instead of "Required"? Small inconsistencies accumulate into cognitive noise.

The decision references at document endings vary:
- `01-launch-day.md`, lines 94-97: Three decision references
- `02-day-7-checkin.md`, lines 85-86: Two decision references
- `03-day-30-refresh.md`, lines 90-92: Three decision references

If these matter, standardize them. If they don't, remove them. Inconsistency signals indecision.

---

## Craft

### What Rewards Inspection

The banned merge fields concept (`voice-guide.md`, lines 139-144) is remarkably thoughtful:

> **Never use these—they become lies or grocery receipts:**
> - `{{FEATURE_LIST}}` — Nobody writes custom features.
> - `{{REFRESH_SUGGESTION}}` — Nobody writes custom suggestions.

This anticipates human failure and designs around it. This is craft.

The "Before/After Examples" in `voice-guide.md` (lines 58-83) are precise and instructive. The contrast teaches. A junior writer could use these examples and produce correct work.

The Notion formula fields (`client-database-template.md`, lines 46-74) are elegantly simple:
```
dateAdd(prop("Launch Date"), 7, "days")
```

No over-engineering. The simplest thing that works.

### What Disappoints on Close Inspection

The checklists repeat information already in the templates. In `01-launch-day.md`, the checklist (lines 58-68) reminds you to include "We don't disappear" in paragraph one—but the template already does this. The checklist doesn't trust the template. This redundancy suggests uncertainty.

`SEND-PROCESS.md` contains three separate representations of the same information:
1. The step-by-step workflow (lines 8-18)
2. The detailed checklist (lines 22-64)
3. The quick reference card (lines 219-237)

Three versions of one process. Which is canonical? The reader must choose, and choosing is work.

The stripe setup instructions in `anchor-basic.md` (lines 61-95) and `anchor-pro.md` (lines 82-114) are nearly identical. This is copy-paste inheritance. When something changes, both files must change. This is fragile.

---

## Recommendations: Quieter But More Powerful

### 1. Lead with essence, not administration

In every document, the first thing the reader sees should be the most important thing. Not metadata. Not purpose statements. Not risk mitigations.

`README.md` should open with:

> **"We don't disappear."**
>
> Anchor is the promise that Shipyard stays.

Not with version numbers and dates.

### 2. Let the Quick Reference Card lead

In `SEND-PROCESS.md`, move lines 219-237 to the top. Most readers need only this. The detailed process becomes appendix, not primary content.

### 3. Reduce tables by half

Every table should answer: which row is most important? If all rows are equal, reconsider whether a table is the right form. Lists often breathe better.

In `anchor-pro.md`, the value comparison table (lines 68-77) is strong because it highlights differences with bold text. Apply this principle elsewhere or simplify to prose.

### 4. Trust the templates

Remove checklist items that merely confirm what the template already contains. A checklist should catch what templates cannot—the dynamic elements, the judgment calls. Not "Is the hook in paragraph one?" when the template's paragraph one *is* the hook.

### 5. Create a single source for Stripe setup

Extract the Stripe instructions from both tier files into a single `stripe/setup-guide.md`. Reference it from each tier. One source. One truth.

### 6. Remove decision references from email templates

The lines like "*Per Decision #7: 'We don't disappear' is core emotional hook*" are internal process artifacts. They belong in a changelog or decisions log, not in the working templates. When you use the template, you don't need to know why it was designed this way. You need only to use it.

### 7. Whitespace as punctuation

Add a blank line before every heading. Add a blank line after every table. Let sections complete before new ones begin. The eye needs to finish a thought before starting another.

---

## The Principle at Work

The best parts of this system disappear. When a client reads "Look what we built together," they don't see a template. They don't see a merge field. They see a human who made something with them.

The worst parts of this system explain themselves. They justify. They hedge. They add redundancy as insurance against failure.

**The work should be so clear that explanation becomes unnecessary.**

Reduce until only the essential remains. Then reduce once more. What survives will be quieter, but it will land with the force of something true.

---

*"Simplicity is not the absence of clutter; that's a consequence of simplicity. Simplicity is somehow essentially describing the purpose and place of an object and product."*

