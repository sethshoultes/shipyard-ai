# Blog Infrastructure — Design Review

## Visual Hierarchy

**Index (`page.tsx`)**

Lines 41-42: "WRITING" label screams. Should whisper.
- Remove `text-accent`, use `text-muted/60`
- Reduce from `text-sm` to `text-xs`

Lines 63-64: Date competes with title.
- Already correct at `text-xs text-muted`

Lines 68-69: Title hover jumps to accent.
- Remove `hover:text-accent`
- Keep `text-foreground`, add subtle `opacity-90` on hover

Lines 75-79: "Read more →" fights for attention.
- Remove `font-semibold`
- Use `text-sm` instead of base size

**Post Page (`[slug]/page.tsx`)**

Lines 63-73: Tags feel heavy.
- `bg-surface` → `bg-surface/30`
- `text-muted` → `text-muted/70`
- Reduce `px-3 py-1` → `px-2 py-0.5`

Lines 82-86: Prose block lacks breathing room.
- `prose` class applies tight margins
- Need custom CSS to override `prose p + p` spacing
- Target 1.5× default line-height between paragraphs

## Whitespace

**Index**

Lines 39: `py-20 sm:py-28` — Good.

Line 55: `py-16` after hero — Should be `py-24` to separate sections.

Line 56: `space-y-16` between posts — Perfect.

Lines 89-107: Subscribe CTA cramped.
- `py-16` → `py-20`
- Add `mt-2` between heading and paragraph (currently `mt-3` is acceptable)

**Post Page**

Lines 42: `py-8` for back link — Too tight. Should be `py-12`.

Lines 55: `py-16` for header — Increase to `py-20`.

Lines 81: `py-16` for content — Increase to `py-24`.

Lines 93: `py-16` for CTA — Increase to `py-20`.

## Consistency

**Typography Scale**

Index uses `text-3xl` for post titles (line 68).
Post page uses `text-4xl sm:text-5xl` for title (line 60).

Correct move. Post deserves larger treatment.

**Border Treatment**

Index: `border-b border-border` (lines 38, 60, 89)
Post: `border-b border-border` (lines 41, 54, 92)

Perfect consistency.

**CTA Buttons**

Index Subscribe: `rounded-full bg-accent px-6 py-3` (line 103)
Post CTA: `rounded-full bg-accent px-6 py-3` (line 105)

Identical. Good.

## Craft

**Blog Library (`blog.ts`)**

Lines 18-51: Validation errors are exceptionally clear.
- Specific field names
- Expected types
- Actual values shown
This rewards close inspection.

Lines 75: Sort descending by date — Correct.

Lines 86-94: Sync `processSync` instead of async.
- Intentional choice for static export
- Correct for Next.js 15 App Router constraints

**Markdown Posts**

`the-night-shift.md` — Lines 9-10: Opening graf has rhythm.
"We've shipped 20 PRDs. You weren't watching. Here's how."

Three beats. Economy. Voice.

`seven-plugins-zero-errors.md` — Lines 8: Same pattern.
"We asked an AI to build seven plugins. It hallucinated every API..."

Author understands tension through brevity.

**Detail Failures**

Index line 98-102: Email input has no validation.
- `type="email"` exists but no pattern enforcement
- Subscribe button does nothing
- This is unfinished theater

Post page line 84: `dangerouslySetInnerHTML` with no sanitization.
- Markdown comes from filesystem, not user input
- Risk is low but naming is honest

## What to Change

### 1. Reduce Visual Noise

**File: `website/src/app/blog/page.tsx`**

Line 41: `text-accent` → `text-muted/60`
Line 68: Remove `hover:text-accent transition-colors`
Line 77: Remove `font-semibold`

### 2. Add Breathing Room

**File: `website/src/app/blog/page.tsx`**

Line 55: `py-16` → `py-24`
Line 90: `py-16` → `py-20`

**File: `website/src/app/blog/[slug]/page.tsx`**

Line 42: `py-8` → `py-12`
Line 55: `py-16` → `py-20`
Line 81: `py-16` → `py-24`
Line 93: `py-16` → `py-20`

### 3. Quiet the Tags

**File: `website/src/app/blog/[slug]/page.tsx`**

Line 68: `bg-surface` → `bg-surface/30`
Line 68: `text-muted` → `text-muted/70`
Line 68: `px-3 py-1` → `px-2 py-0.5`

### 4. Fix Paragraph Spacing

**New file: `website/src/app/blog/[slug]/blog-post.css`**

```css
.prose p + p {
  margin-top: 1.75em;
}

.prose p {
  line-height: 1.7;
}
```

Import in `page.tsx` line 3.

### 5. Remove Unfinished Subscribe

**File: `website/src/app/blog/page.tsx`**

Delete lines 88-108 entirely.

Add back when functional.

## Final Verdict

Hierarchy exists but shouts too often.
Whitespace is present but needs 20% more everywhere.
Consistency is strong across components.
Craft is visible in error messages and prose rhythm.

Most important change: subtract.
Remove accent color from hover states.
Remove subscribe form until it works.
Remove weight from supporting elements.

Make the writing louder by making everything else quieter.
