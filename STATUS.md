# Shipyard AI — Status

## Current State
- **Agency state**: operational (bootstrapping complete)
- **Founded**: 2026-04-03
- **Repo**: github.com/sethshoultes/shipyard-ai (public)
- **Pipeline**: architecture complete, first real PRD needed
- **Active projects**: 0

## Infrastructure
- **Repo**: sethshoultes/shipyard-ai (pushed to GitHub)
- **Website**: PR #1 merged, 5 pages, needs deploy target
- **Pipeline docs**: pipeline/ARCHITECTURE.md, pipeline/TOKEN-CREDITS.md
- **PRD template**: prds/TEMPLATE.md
- **Emdash research**: deliverables/emdash-platform-research.md
- **QA report**: qa-report-001.md (Margaret, first pass)

## Agent Windows (tmux: great-minds)
| Window | Agent | Status |
|--------|-------|--------|
| admin | Phil Jackson (Orchestrator) | Active |
| worker1 | Steve Jobs | Dispatched — SEO metadata |
| worker2 | Elon Musk | Dispatched — perf audit |
| worker3 | Margaret Hamilton | Active — QA |
| cron-manager | Cron Manager | Setting up durable crons |
| monitor | Status loop | Running |

## Next Steps (Jensen Board Review #022)
1. Deploy website to Vercel or Cloudflare
2. Wire heartbeat cron to this repo
3. Run ONE real PRD through the full pipeline end-to-end
4. Log every token cost to validate the credit model
