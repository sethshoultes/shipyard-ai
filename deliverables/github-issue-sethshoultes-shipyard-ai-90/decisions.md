# Forge — Locked Decisions

> **Issue:** sethshoultes/shipyard-ai#90
> **Last Updated:** 2026-05-03
> **Status:** Resolved

---

## Resolved Open Questions

### Question #1: Node Type Roster
**Resolution:** Two agent types for v1:

| Agent | Inputs | Outputs | Config Surface |
|-------|--------|---------|----------------|
| ContentWriter | `topic` (string), `tone` (enum: professional/casual/friendly), `length` (enum: short/medium/long) | `content` (string) | Form with topic input, tone dropdown, length selector |
| ImageGenerator | `prompt` (string), `size` (enum: 256x256/512x512/1024x1024) | `imageUrl` (string) | Form with prompt textarea, size dropdown |

### Question #2: Distribution Channel
**Resolution:** SEO-first approach. Forge launches as a standalone web app at forge.shipyard.ai. Viral loop deferred to v2.

### Question #3: Trial Mechanics Without Stripe
**Resolution:** Prepaid credits model. Users get 100 free tokens on signup. No credit card required. Token budgets enforce hard caps.

### Question #4: Developer API Scope
**Resolution:** API ships in v1 but marked as beta. `/api/v1/workflows` and `/api/v1/execute` endpoints available.

### Question #5: Hosting/Deployment Target
**Resolution:** Cloudflare Pages for frontend, Cloudflare Workers for API, D1 for state persistence, R2 for image assets.

### Question #6: Auth Model
**Resolution:** Simple email-based auth. State (workflows, versions) preserved per user session. No OAuth in v1.

### Question #7: Execution Runtime Substrate
**Resolution:** New lightweight executor built into Forge. Daemon bridge submits workflows to Shipyard's existing agent infrastructure.

### Question #8: First-Run Experience
**Resolution:** 30-second magic moment: User lands → sees blank canvas → clicks "Add Node" → selects ContentWriter → fills form → clicks "Run" → sees output. No tour, no wizard.

---

## Locked Architectural Decisions

| Decision # | Decision | Outcome |
|------------|----------|---------|
| 1 | Name | **Forge** (one syllable, solid) |
| 4 | Canvas | **Minimal canvas for v1** — Static node display, no drag-and-drop |
| 5 | Platform | **Web app only** — NO WordPress plugin |
| 7 | Execution | **Async by default** with daemon bridge |
| 9 | Budgets | **Hard token budgets + per-user cost caps day one** |
| 10 | Billing | **No freemium billing stack in v1** — Prepaid credits only |
| 11 | Templates | **No template marketplace in v1** |
| 12 | Aesthetic | **White, airy, optimistic** — No dark mode |
| 14 | JSON exposure | **No JSON/YAML in app UI** — Humans use forms |
| 15 | Versioning | **Workflow versioning mandatory** |

---

## Notes

- **Name:** Forge (one syllable, solid, memorable)
- **Brand voice:** Human, confident, zero acronyms, no enterprise sludge
- **Essence:** Engine first. Baton later. The engine is the product; the UI is documentation.
