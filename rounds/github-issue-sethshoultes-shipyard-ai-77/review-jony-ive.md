Verdict: Almost resolved. Four coarse motions betray the calm.

- `stage.css:108` — Hardcoded `#d63050` hover. Brittle. Add `--stage-accent-hover`.
- `stage.css:43-44` — Gradient RGBA hardcoded to accent hex. Use `color-mix()` or opacity variable so tint shifts with theme.
- `stage.css:79-85` — Author and version compete with title. Drop to `0.85rem`. Increase `letter-spacing` to `0.02em`. Separate with `margin-bottom: 0.75rem`.
- `stage.css:109` — `scale(1.03)` feels anxious. Quieter: `translateY(-2px)` only. Or remove motion entirely.
- `stage.css:67` — Card lifts `4px` on hover. Too eager. Reduce to `2px` or remove.
- `stage.css:52-54` — Hero gradient drifts on hover. Restless. Remove. Let spotlight stay fixed.
- `stage.css:70-77` — Title `line-height: 1.1` creates uneven gaps. Tighten to `1.0`. `letter-spacing: -0.04em` for denser confidence.
- `stage.css:61,68` — Shadows too loud. Reduce to `0 4px 24px` and `0 8px 32px` on hover.
- `stage.css:84,92` — Dead `transition: color` on author, version, description. No state change. Remove.
- `stage.css:29-35` — Missing `-webkit-font-smoothing: antialiased`. Add for crisper type.
- `stage.css` — Missing `::selection`. Add `background: rgba(233,69,96,0.2)` for tactile feedback.
- `showcase.php:39` — "Install on my site" is verbose. Shorten to "Install".
