# Review — ClipCraft Backend

Verdict: scaffold without conviction. one file carries entire visual promise, and it wavers.

## apps/web/app/layout.tsx

- **line 17–23**: inline styles betray systems thinking. `style={{...}}` is noise. extract to `globals.css` or a theme object. let the markup breathe.
- **line 19–20**: font stack crammed into one line. 7 families, no fallbacks hierarchy. break into a CSS custom property: `--font-sans: -apple-system, ...`. cleaner. quieter.
- **line 4**: title shouts. em dash acceptable, but consider if subtitle belongs in metadata or in the page. metadata should whisper identity, not pitch.
- **line 5–6**: description sprawls. one strong sentence beats two weak ones. trim to: "Paste a URL. Get a polished video."
- **line 21–22**: colors are arbitrary hex strings. `#0a0a0f` and `#f2f2f7` feel considered, but without tokens they are orphaned. define `--color-surface` and `--color-ink`.
- **line 12**: type `React.ReactNode` is redundant if imported properly, but here it is honest. acceptable.
- **lines 3–7**: `Metadata` block hugs top of file. separate imports from substance with whitespace. give exports room.

## structural absence

- empty `/components`, `/lib`, `/packages/remotion` directories. no placeholders, no `index.ts`, no `.gitkeep`. absence should be intentional, not accidental. if a folder exists, it should declare purpose.
- no `page.tsx`. layout alone cannot tell story.
- no design tokens file. color, type, spacing scattered nowhere.

## changes for quiet power

1. **extract all style** from `layout.tsx` into `globals.css` + `theme.css`. markup becomes invisible. content dominates.
2. **single source of truth** for tokens. `packages/ui/tokens.css` or `theme/index.ts`. repetition is clutter.
3. **reduce metadata copy** by 40%. every word must fight to stay.
4. **add `page.tsx`** — even a centered word — so hierarchy exists to judge.
5. **consistent quoting**. double quotes in TS, single in CSS. decide. enforce.

Current state asks viewer to trust what is not yet there. trust is earned through detail.
