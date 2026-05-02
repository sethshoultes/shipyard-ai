# Shonda Retention Roadmap — Anvil v1.1
**Product:** Anvil (WorkerForge CLI)
**Mandate:** Turn the pilot episode into a series users binge.

---

## Philosophy

Retention is not a feature. It is a *story arc*.

- **Signup → aha:** Already solved. One command, 60 seconds, streaming response.
- **Episode 2 → cliffhanger:** Unsolved. That is v1.1.

---

## What Keeps Users Coming Back

| Timeframe | Why They Leave Today | v1.1 Retention Hook |
|-----------|----------------------|---------------------|
| **Tomorrow** | Template is generated. User moves on. | **Deploy summary screen** — endpoint URL, curl snippet, "test it now" payoff. Instant gratification, not just completion. |
| **Next week** | No reason to reinstall or rerun. | **`anvil status`** — weekly check-in showing requests, latency, model version. Habit formation via CLI ritual. |
| **Next month** | No updates, no changelog, no ping. | **Model update alerts** — "Llama 4 dropped. Run `anvil upgrade`?" Retention through FOMO and novelty. |
| **Ongoing** | Zero curiosity loop. | **Built-in analytics** — "Your worker handled X requests today." Users become protagonists in their own story. |
| **Social** | Generated code has zero Anvil branding. Invisible. | **"Built with Anvil" header** in every deployed worker. Viral watermark + showcase gallery loop. |

---

## v1.1 Feature Episodes

### Episode 1: The Curtain Call (Post-Deploy)
- Deploy summary screen
  - Live endpoint URL with copy button
  - Pre-filled curl snippet
  - One-click "test it now" that hits the worker and prints the response
  - Preview of next episode: "Image models unlock in v1.2 — `anvil --preview`"

### Episode 2: The Weekly Habit (`anvil status`)
- `anvil status` command
  - Request count (24h / 7d)
  - p99 latency sparkline
  - Current model version vs. latest available
  - Health indicator (green/yellow/red)
- Goal: Make `anvil status` the Monday-morning coffee ritual for devops characters.

### Episode 3: The FOMO Loop (Model Alerts)
- Background check for new Workers AI models
- Notification: "Llama 4 available. Run `anvil upgrade` to swap models without downtime."
- Changelog in CLI: `anvil whatsnew`

### Episode 4: The Dashboard of Self (`anvil analytics`)
- Stream anonymized usage stats back to user
  - "Your worker handled 12,400 requests this week."
  - "Busiest hour: Tuesday 14:00 UTC."
  - "Error rate: 0.3% (top cause: timeout)."
- Curiosity loop: every number is a reason to return.

### Episode 5: The Ensemble Cast (Template Marketplace)
- `anvil create --template sentiment-analysis`
- `anvil create --template image-caption-pipeline`
- Community submissions + curated official templates
- Each template is a new season premiere for the user.

### Episode 6: The Branding Beat (Distribution)
- Auto-insert "Built with Anvil" comment header in generated worker files
- Optional `--badge` flag for README snippet
- Showcase gallery page + "tweet this deploy" button in deploy summary
- Network effect: every deployed worker is a billboard.

### Episode 7: The Character Continuity (Identity & Versioning)
- Persistent user identity across runs (local config / token)
- Project versioning: `anvil update`, `anvil rollback`, `anvil diff`
- Cross-machine sync: `anvil pull <project-id>`

### Episode 8: The Deferred Promises (Image, Audio, Caching, Monitoring)
- Re-introduce cut features as visible v1.2 teases in v1.1 CLI
- `anvil deploy --with-cache` (preview flag)
- Image/audio model stubs that show "coming next season" instead of silent omission
- Monitoring integration: `anvil logs --tail`

---

## Emotional Beat Sheet for v1.1

| Moment | Emotion | CLI Output Example |
|--------|---------|-------------------|
| Deploy ends | Pride | `🎬 Your worker is live. Time to grin.` |
| Test succeeds | Delight | `✨ First response in 89ms. Your AI is awake.` |
| Weekly check-in | Competence | `📊 This week: 8.2k requests, 0.2% errors. You're trending green.` |
| Model alert | Anticipation | `🔔 Llama 4 is here. Your upgrade is one command away.` |
| Analytics peak | Curiosity | `🚀 Spike detected: 3x traffic on Tuesday. Want to see why?` |
| Template install | Expansion | `🎭 New cast member added: sentiment-analysis worker.` |

---

## Success Metrics

- **Week-1 retention:** % of users who run a second Anvil command within 7 days of first deploy.
- **Status habit:** % of active users running `anvil status` at least once per 14 days.
- **Upgrade conversion:** % of users who run `anvil upgrade` within 48h of a model alert.
- **Template reuse:** % of users who create a second worker from a marketplace template.
- **Organic distribution:** % of deployed workers that include "Built with Anvil" branding.

---

*Current state: excellent first act. v1.1 must deliver the second act, the cliffhanger, and the season renewal.*
