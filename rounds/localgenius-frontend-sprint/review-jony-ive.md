Verdict: Widget shows discipline. Dashboard feels assembled, not composed.

- `dashboard/index.html:19` — `border: 1px solid #e2e8f0` adds noise. Replace with shadow. Material should float, not fence.
- `dashboard/index.html:20` — `border-radius: 1rem` conflicts with widget 16px. Pick one radius system: 12px and 24px only.
- `dashboard/index.html:23-33` — Metric is loudest element. Good. But `.dashboard-card` max-width 480px traps it. Expand to 560px.
- `dashboard/src/views/DashboardHome.js:10` — Inline `style="margin-top:0"` is clutter. Cascade properly.
- `dashboard/src/views/DashboardHome.js:21` — "Upgrade billing" is awkward. "Billing" or "Manage plan".
- `dashboard/src/views/OnboardingDetect.js:50-51` — Two paragraphs with `-0.5rem` negative margin. Fragile. Use single label or consistent stack.
- `dashboard/src/views/OnboardingDetect.js:68` — Inline `style="width:100%;"`. Move to class.
- `dashboard/src/main.js:29` — Inline `style="width:100%;margin-top:1rem;"`. Remove.
- `widget/sous-widget.js:18` — `box-shadow:0 4px 12px rgba(0,0,0,0.15)` is generic. Soften to `0 2px 8px rgba(15,23,42,0.12)`.
- `widget/sous-widget.js:20` — Modal shadow `0 12px 40px rgba(0,0,0,0.2)` is heavy. Reduce to `0 8px 30px rgba(15,23,42,0.14)`.
- `widget/sous-widget.js:24` — `gap:10px` is arbitrary. Use 12px or 8px.
- `widget/sous-widget.js:40` — Fallback `#fefce8` screams. Mute to `#f8fafc` with `#cbd5e1` border.
- `widget/sous-widget.js:99` — Send button 36px. Too small. 44px minimum for touch truth.
- `widget/sous-widget.js:56` — Bubble uses `&#9993;` (envelope). Ambiguous. Use speech mark or question mark.
- General: Dashboard lacks view transitions. Abrupt swaps. Add 150ms opacity fade.
- General: Eight shades of slate. Reduce to four. Color should whisper, not catalog.
