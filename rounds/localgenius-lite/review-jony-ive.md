# SPARK Design Review — Jony Ive

## Visual Hierarchy

**Widget button** — Perfect. 56px circle, gradient glow, bottom-right. Unmissable but not screaming.
- spark.css:15-32 — Animation subtle. Pulse opacity 1.0 → 0.7 is quiet confidence.

**Landing hero** — Type scale wrong.
- index.html:13 + styles.css:47-56 — 64px headline screams. Should be 52px. Let gradient do the work.
- styles.css:59-62 — 28px subhead fights headline. Drop to 22px, increase letter-spacing to +0.02em.

**Panel header** — Title lost.
- Panel.js:14-15 + spark.css:88-93 — "SPARK Assistant" at 18px/600 is timid. Make 20px/700. This is the entry point.
- spark.css:80-86 — Header padding 20px creates cramping. Increase to 24px vertical, reduce bottom border to hairline (0.5px).

**Message bubbles** — Good contrast but hierarchy flat.
- spark.css:143-164 — User/AI bubbles same visual weight. AI message should recede: reduce background from #f3f4f6 to #fafafa.
- Message.js:8-9 — Text fills bubble edge-to-edge. Needs optical breathing room.

**Footer branding** — Too loud.
- Panel.js:66-67 + spark.css:282-288 — Footer border, padding, link color all compete. Remove top border. Reduce padding to 8px. Make text #d1d5db, link inherit on hover.

---

## Whitespace

**Panel internal spacing** — Suffocating.
- spark.css:116-123 — Messages container padding 20px feels tight. 24px would let content breathe.
- spark.css:122 — 12px gap between messages is cramped. Make 16px. Silence is generous.

**Landing sections** — Too uniform.
- styles.css:37-39 — 80px vertical margin everywhere. Vary rhythm: 120px after hero, 64px between features, 96px before final CTA.

**Code block** — Claustrophobic.
- styles.css:109-119 — 24px padding around monospace text. Needs 32px horizontal, 28px vertical.

**Input area** — Cramped.
- spark.css:232-237 — 16px padding on input container, 8px gap between input/button. Feels rushed. Make 20px padding, 12px gap. Let user think.

**Feature cards** — Packed.
- styles.css:200-205 — 32px padding inside cards. Content hits edges. Go to 40px. Cards should feel spacious, not economical.

---

## Consistency

**Border radius** — Three different radii with no system.
- spark.css:21, 66 — Button 50% (circle), panel 16px
- spark.css:100, 244 — Close button 8px, input 8px
- spark.css:146, 219 — Message bubbles 12px, retry button 6px
- Establish scale: 6px (small), 12px (medium), 16px (large), 50% (circle). Apply consistently.

**Gradients** — Purple gradient used everywhere, different definitions.
- spark.css:22 — `#667eea → #764ba2`
- styles.css:13-14 — `#8b5cf6 → #6366f1`
- Landing and widget use different purple families. Pick one system. Widget's is better (deeper, more saturated).

**Transitions** — Inconsistent durations.
- spark.css:29, 71, 264 — 0.2s, 0.3s cubic-bezier, 0.2s
- All interactive elements should share timing: 0.2s ease for most, 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) for panel open/close.

**Typography weights** — 500, 600, 700 scattered without purpose.
- Panel.js:15 + spark.css:91 — Title is 600
- spark.css:262 — Send button is 500
- styles.css:74 — CTA is 600
- Reduce to two weights: 400 (body), 600 (emphasis). Delete 500 and 700.

**Spacing scale** — No system. Random values: 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px.
- Adopt 4px base: 8, 12, 16, 20, 24, 32, 40, 48, 64. Stick to it religiously.

---

## Craft

**Button SVG** — Chat icon generic.
- Button.js:12-17 — Stock Material Design icon. Feels borrowed, not designed. Consider: abstract symbol (single dot expanding to three dots). Ownable. Simpler.

**Typing indicator** — Nice but animation harsh.
- spark.css:202-211 — Dots jump -4px. Too much energy. Reduce to -2px. Make timing 1.8s (slower = calmer).

**Panel shadow** — Heavy-handed.
- spark.css:67 — `0 8px 32px rgba(0, 0, 0, 0.12)` feels 2015. Reduce to `0 12px 40px rgba(0, 0, 0, 0.08)`. Larger spread, lower opacity = softer edges.

**Button shadow** — Glows unnaturally.
- spark.css:24 — `rgba(102, 126, 234, 0.4)` looks neon. Drop to 0.2. Hover to 0.3. Light should suggest, not announce.

**Scrollbar styling** — Good attention to detail.
- spark.css:125-140 — Custom scrollbar with hover state. Thoughtful. Increase track to 8px width for easier grab target.

**Close button** — X symbol lazy.
- Panel.js:18-19 — HTML entity `&times;`. Use SVG icon (two crossed lines, 1.5px stroke, rounded caps). More control, cleaner render.

**Input placeholder** — Too chatty.
- Panel.js:37 — "Ask me anything about this page..." sounds desperate. Make it: "Ask anything..." Trust is quieter.

**Welcome message** — Forced enthusiasm.
- spark.js:50 — "Hi! I'm here to help..." Exclamation mark unnecessary. Remove. Just: "Hi. I'm here to help you find information on this page. What would you like to know?"

**Copy button state** — Clunky inline styles.
- index.html:119-122 — JavaScript sets inline `background` color. Should toggle CSS class `.copied` with transition.

**Gradient text** — Overdone on landing.
- styles.css:52-55, 313-316 — Gradient text used twice (hero h1, footer strong). Pick one. Hero only. Footer should be simple white.

---

## What I'd Change

### Immediate (High Impact)

1. **Unify color system**
   - Widget purple: `#667eea → #764ba2` everywhere
   - Define CSS custom properties in :host (widget) and :root (landing)
   - spark.css:4-12, styles.css:12-20

2. **Reduce headline aggression**
   - Landing h1: 64px → 52px
   - Hero subhead: 28px → 22px, letter-spacing +0.02em
   - styles.css:47-48, 59

3. **Let panel breathe**
   - Header padding: 20px → 24px vertical
   - Messages padding: 20px → 24px
   - Message gap: 12px → 16px
   - spark.css:84, 119, 122

4. **Quiet the footer**
   - Remove top border
   - Padding: 12px → 8px
   - Text color: #9ca3af → #d1d5db
   - spark.css:282-288, Panel.js:65-67

5. **Soften shadows**
   - Panel: `0 8px 32px rgba(0,0,0,0.12)` → `0 12px 40px rgba(0,0,0,0.08)`
   - Button: `rgba(102,126,234,0.4)` → `rgba(102,126,234,0.2)`
   - spark.css:24, 67

### Secondary (Refinement)

6. **Fix border radius inconsistency**
   - Small: 6px (retry, copy button)
   - Medium: 12px (messages, input, send button)
   - Large: 16px (panel, cards, sections)
   - Circle: 50% (main button, close button)
   - Apply throughout spark.css and styles.css

7. **Typography weights reduction**
   - Remove font-weight: 500 and 700
   - Keep 400 (body), 600 (all emphasis)
   - spark.css:91, 262; styles.css:74, 312

8. **Input area expansion**
   - Container padding: 16px → 20px
   - Input/button gap: 8px → 12px
   - spark.css:233, 236

9. **Replace text with better copy**
   - Placeholder: "Ask anything..." (Panel.js:37)
   - Welcome: Remove "!" (spark.js:50)
   - Title weight: 600 → 700, size 18px → 20px (Panel.js:15, spark.css:90-91)

10. **Typing indicator timing**
    - Duration: 1.4s → 1.8s
    - translateY: -4px → -2px
    - spark.css:191, 209

### Aspirational (Deeper Craft)

11. **Design custom button icon**
    - Replace Material chat icon with abstract mark
    - Single dot → three dots (represents conversation emerging)
    - Button.js:12-17

12. **Replace close X with SVG**
    - Two 1.5px lines, rounded caps, crossed at center
    - Panel.js:18-19

13. **Implement CSS class for copy button state**
    - Remove inline style injection
    - Add `.copied` class with transition
    - index.html:113-125, styles.css (add new rule)

14. **Remove gradient from footer**
    - Keep hero gradient text only
    - Footer SPARK text: plain white, font-weight 600
    - styles.css:312-317

15. **Vary landing section rhythm**
    - Post-hero: 120px
    - Between sections: 64px
    - Before final CTA: 96px
    - styles.css:37-39 (replace fixed 80px)

---

## Verdict

Strong foundation. Functional, fast, coherent.

**But**: Design lacks restraint. Too many weights, inconsistent spacing, shadows too dark, type too loud.

**Feels**: 2018 startup (gradient everywhere, big bold type, purple glow).

**Should feel**: 2026 craft product (quiet confidence, generous space, details that reward inspection).

Fix color system, reduce type scale, increase whitespace, soften shadows. Then it's excellent.

**Biggest miss**: Visual hierarchy assumes user needs convincing. They're already here. Be quieter. Be certain.
