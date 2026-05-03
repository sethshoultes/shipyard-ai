# Shonda Retention Roadmap
## What Keeps Users Coming Back — v1.1 Features

Promptfolio v1 is a campfire product: people gather once, leave with a warm artifact, and forget the path back. v1.1 must turn the artifact into a hearth.

---

## 1. The Return Triggers

- **New Conversations** — Users chat with AI daily. Every valuable conversation is a natural reason to return.
- **Living Portfolio** — A portfolio that can be updated in-place (not regenerated as a new orphan URL) turns a static tombstone into a living CV.
- **Social Validation** — Public discovery, featured portfolios, and share stats create a loop of status-seeking and peer comparison.
- **Prompt Intelligence** — AI-powered analysis that makes users better prompters, not just prettier presenters. Education is the cheapest retention drug.

---

## 2. Retention Mechanics

| Mechanic | v1.1 Feature | Essence Alignment | Board Concern Addressed |
|----------|-------------|-------------------|------------------------|
| Edit token | Magic-link edit URL (no auth required) | No auth, zero knobs | Orphan URL decay |
| Update-in-place | Re-upload same JSON → same URL refreshed | Static SaaS | Compounding |
| Portfolio index | Auto-generated index page linking all user portfolios | No accounts, token-based | Platform pathway |
| Prompt insights | LLM-generated title, tags, quality score | Zero knobs, AI leverage | Zero AI leverage |
| Discovery feed | Optional "feature in gallery" toggle | Pride, dignity | Network effects |
| Embed badge | `<iframe>` card for personal blogs / Notion | Distribution | Viral loop |
| Weekly digest | Opt-in email of new portfolio + share stats | No spam | Engagement loop |

---

## 3. v1.1 Feature Set

### Must-Have (Retention Foundation)

1. **Edit Tokens**
   On creation, generate a secret edit URL fragment (hash-based or localStorage token). The user can return, drop a new JSON, and replace the same URL. Orphan URLs become living documents. No database, no passwords.

2. **LLM Title & Tag Generation**
   Send the prompt body to a lightweight inference call to produce a gallery-quality title and 3 category tags. Cached, fast, optional. Directly addresses the board's "zero AI leverage" concern while preserving the zero-knob ethos.

3. **Portfolio Index Pages**
   If a browser has created multiple portfolios, offer a single `/index` URL (stored via localStorage or token query) that lists them all. Turns one-offs into a curated collection. The index becomes the user's real homepage.

### Should-Have (Habit Loop)

4. **Discovery Toggle**
   Opt-in public gallery feed. Users can browse others' portfolios by tag or quality score. Network effects begin the moment one user opts in. Pride is the distribution engine.

5. **Prompt Quality Score**
   A lightweight heuristic + LLM judgment that rates prompt clarity, specificity, and structure. Suggests one concrete improvement. Educational retention: users return to get better at the skill, not just to show it off.

6. **Embed Widget**
   Copy-paste HTML to embed a single prompt card on a blog, newsletter, or Notion page. Every embed is a billboard that drives traffic back to Promptfolio.

### Could-Have (Platform Signals)

7. **Claude Artifacts Rendering**
   Native rendering of Claude Artifacts (code, SVG, React components) inside the portfolio. Tool-specific depth that competitors cannot trivially clone.

8. **OG Card Refresh**
   Regenerate the social card automatically when a portfolio updates. Keeps shares looking current and rewards the user for maintaining a living document.

---

## 4. Anti-Features for v1.1

- **No auth / no passwords** — Retention must not come from account walls. Edit tokens and localStorage only.
- **No analytics dashboard** — Plausible embed or one-line third-party only. No built-in view counters.
- **No theme picker** — The sacred template stays sacred. One palette, zero knobs.
- **No onboarding wizard** — The 30-second promise remains intact.

---

## 5. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 30-day return rate | > 15% | Users who create a second portfolio or use an edit token within 30 days |
| Edit token usage | > 30% of creators | Percentage of portfolios updated in-place rather than regenerated |
| Public gallery opt-in | > 10% of portfolios | Discovery feed inventory growth |
| Embed adoption | > 5% of portfolios | Embeds detected via referral traffic |
| Share-to-visit ratio | > 1:4 | Every portfolio shared generates at least 4 new landing page visits |

**Verdict Gate:** If fewer than 1 in 6 creators return within 30 days after v1.1 ships, the retention loop is broken and v1.2 must pivot to platform features (accounts, API, or inference hosting) regardless of the essence guardrails.
