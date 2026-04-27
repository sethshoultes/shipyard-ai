Verdict: competent. Not calm. Too many voices shouting at once.

- **PricingPage.tsx**
  - Line 34–160: `styled-jsx` with 12+ raw hex values. No token system. Color becomes noise.
  - Line 41–52: Headline at `1.875rem` competes with price at `2.25rem`. Two things cannot be loudest.
  - Line 85–95 + 137–149: Two "Annual" badges. One black pill, one green pill with icon. Pick one. The green (#065f46) is the only color in an otherwise monochrome room. It screams.
  - Line 77–83: Hover lifts card, darkens border, adds shadow. Three animations for one intent. Reduce to border-color only.
  - Line 200–202: Inline style fragment inside JSX. Fragments betray uncertainty.
  - Line 59–61: `grid-template-columns: 1fr` then `1fr 1fr` at 640px. Gap is `1rem`. Too tight. Cards breathe at `1.5rem` minimum.
  - Line 154–159: Footer legal is `0.75rem` gray. It looks like an apology. Make it `0.875rem` and give it space.

- **BillingToggle.tsx**
  - Line 36–87: Same color chaos. `#111827` ring shadow on selected vs. border+shadow on PricingPage cards. Two selection languages. Unify: selected state = single 2px border, no glow.
  - Line 77–86: Green badge again (`#d1fae5`). Same accent problem.

- **brand.ts**
  - Line 11–84: Voice is warm. Visual system is absent. Add `colors`, `space`, `type` objects. Lock the palette here.

- **What would change**
  - One accent. Kill the green. Annual savings whisper in `gray-600`, not shout in emerald.
  - Price becomes hero: `3rem`, `letter-spacing: -0.02em`, margin-top `2rem`. Headline steps back to `1.5rem`.
  - Remove card hover lift entirely. Stillness is confidence.
  - Single selected state: `border-color: #111827`. No shadow ring. No box-shadow.
  - Increase `tier-cards` gap to `1.5rem`. Increase page padding to `4rem`.
  - Move annual badge inside the price note or eliminate entirely. Three savings callouts is two too many.
  - Extract all colors to `brand.ts`. One source of truth.
