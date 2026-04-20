# Design Review: Shipyard Care Email Templates

**Reviewer**: Jony Ive
**Date**: 2026-04-20
**Files Reviewed**: 3 email templates

---

## Verdict: Functional but cluttered. These say too much.

---

## Visual Hierarchy

**incident-report.html** (lines 101-103):
- Badge before headline is backwards. Headline should dominate. Badge is metadata.
- Move status badge below h1 or eliminate entirely.
- "✓ RESOLVED" + headline both shout resolution. Pick one.

**token-warning.html** (lines 118, 120):
- Badge ("ℹ INFO") adds nothing. Delete.
- Headline already signals update. Redundant.

**welcome-subscriber.html** (line 81):
- H1 at 28px, token balance at 24px (line 42). Too close.
- Headline should be 32-36px minimum. Token balance 18px.
- Current hierarchy is flat.

---

## Whitespace

**All templates** (padding/margin):
- 40px container padding (line 19 in all) fights with 24px internal margins.
- Reduce container to 32px. Increase section gaps to 32px.
- Let content float, not press against edges.

**incident-report.html** (lines 46-48):
- `.incident-line` at 16px bottom margin with 24px left padding creates uneven density.
- Increase to 24px bottom. Align rhythm.

**token-warning.html** (lines 64-77):
- Options stack at 16px margin (line 71). Too tight for decision-making.
- Increase to 24px. Decisions need space.

---

## Consistency

**Color inconsistency**:
- Blue varies: `#0066cc` (incident-report line 41), `#17a2b8` (token-warning line 31), `#0052a3` (hover states).
- Pick one blue. Use it everywhere. Currently 4 blues across 3 templates.

**Badge styling**:
- incident-report: 6px/12px padding (line 33)
- token-warning: identical (line 33)
- But colors differ: green vs cyan vs no badge in welcome.
- Either unify or eliminate badges entirely.

**Border-left pattern**:
- 4px left border repeated 6 times across templates.
- Good pattern. But colors shift: `#0066cc`, `#ffc107`, `#0066cc` again.
- Use border to signal hierarchy, not variety.

---

## Craft

**Typography details**:
- Letter-spacing at 0.5px (incident-report line 65) only appears once.
- Apply to all uppercase labels or remove.
- Inconsistent rhythm breaks trust.

**Token balance number** (token-warning line 48-50):
- 36px orange number works. But lives alone.
- Similar emphasis needed in incident-report token balance (line 82-84).
- Same information, different treatment.

**Bullet styling** (incident-report lines 51-58):
- Custom bullet with `::before` pseudo-element. Sophisticated.
- But bullet color `#0066cc` matches border, headline blue.
- Everything blue flattens emphasis. Make bullets neutral gray.

**Hover states** (token-warning lines 75-77, 98-100):
- Border and button both hover. Good.
- But button hover `#0052a3` is different blue than base `#0066cc`.
- Hover should darken by consistent percentage, not arbitrary color.

---

## What to Change

### Make it quieter:

1. **Eliminate badges**. Status is in headline. Info icon adds noise.

2. **Reduce color palette**:
   - One blue: `#0066cc`
   - One gray: `#666`
   - One accent: `#ffc107` (warnings only)
   - Delete: `#28a745`, `#17a2b8`, `#f57c00`, `#0052a3`

3. **Simplify borders**:
   - Left border = emphasis block (blue)
   - Left border = warning block (yellow)
   - Delete all other border colors

4. **Unify typography**:
   - H1: 32px, 600 weight
   - Subheads: 18px, 600 weight
   - Body: 16px, 400 weight
   - Labels: 14px, 600 weight, 0.5px tracking
   - Apply consistently

### Make it more powerful:

5. **incident-report.html (lines 101-135)**:
   - Remove badge
   - Increase h1 to 32px
   - Float token balance to top right as persistent indicator
   - Reduce incident-summary padding to 16px
   - One border color for all emphasis

6. **token-warning.html (lines 124-128)**:
   - Remove balance-display yellow box
   - Show number inline: "You have **[BALANCE] tokens** remaining"
   - Yellow border only when <20% threshold
   - Delete decorative boxes

7. **welcome-subscriber.html (lines 89-92, 102-107)**:
   - Token balance too decorative (blue box + border)
   - Show as simple line: "You have **100,000 tokens** each month"
   - Referral box (dashed border line 46) screams promotional
   - Solid border, subtle background, same treatment as other content

8. **Global spacing** (all templates):
   - Container: 32px padding
   - Sections: 32px margin-bottom
   - Internal elements: 16px margin-bottom
   - Rhythm = predictable

---

## Final Note

These templates work. They communicate clearly. But they try too hard.

Remove 30% of the styling. Reduce color count by half. Increase whitespace between sections.

The content is strong. Let it speak.

Quiet confidence is more powerful than decorated enthusiasm.
