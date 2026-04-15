# Shipyard AI — Session Handoff

**Session**: 2026-04-03 to 2026-04-04
**Duration**: ~9 hours
**PRs merged**: 27

## What Was Built

- **Agency website**: shipyard-ai.pages.dev (7 pages, dark theme, Cloudflare Pages)
- **3 EmDash demo sites**: Bella's Bistro (restaurant), Peak Dental (dental), Craft & Co (portfolio)
  - Running via pm2 on ports 4321/4322/4323
  - Caddy reverse proxy on port 80 with auto-HTTPS
  - Custom color schemes, Unsplash hero images, real content
- **PRD chat worker**: shipyard-prd-chat.seth-a02.workers.dev (Workers AI + Llama 3.1)
- **Contact form worker**: shipyard-contact.seth-a02.workers.dev (Resend email + GitHub issues)
- **Auto-pipeline**: GitHub Action + /parse + /generate-seed endpoints (UNTESTED)
- **Documentation**: Runbook, QA pipeline, CI/CD scripts, marketing messaging, case study, client onboarding flow
- **9 Jensen board reviews**

## What's Untested

**AUTO-PIPELINE** — The #1 priority. To test:
```bash
gh issue create --repo sethshoultes/shipyard-ai \
  --title "PRD: Sunrise Yoga Studio" \
  --label "prd-intake" \
  --body "Build an EmDash marketing site for Sunrise Yoga Studio in Portland, OR. Yoga and wellness studio. Pages: Home, Classes, Pricing, Contact. Warm earth tones. Target audience: women 25-45."
```

## What's Blocked

- **Cloudflare D1 production deploys**: Need API token with D1 + Workers Scripts + Zone permissions
- **shipyard.company root domain**: Returns 404 (Vercel default). www.shipyard.company works.
- **tmux worker dispatch**: send-keys doesn't reliably work with Claude Code. Use Agent tool instead.

## Active Processes

| Process | Command | Status |
|---------|---------|--------|
| pm2: bellas-bistro | npx emdash dev --port 4321 | Running |
| pm2: peak-dental | npx emdash dev --port 4322 | Running |
| pm2: craft-co-studio | npx emdash dev --port 4323 | Running |
| Caddy | ~/caddy (port 80/443) | Running |
| cloudflared | Named tunnel (shipyard-demos) | May need restart |

## Key Credentials (stored in env/config)

- Cloudflare API Token: 
- Resend API Key: re_Q3FK5pEv_FkBrWknQuNqkPqwdoyNmzANK
- GitHub: gh CLI authenticated as sethshoultes
- Vercel: vercel CLI authenticated as seth-6671
- Node 22 via nvm: `export NVM_DIR="$HOME/.nvm" && source $NVM_DIR/nvm.sh && nvm use 22`

## Next Session Priorities

1. **Fire the auto-pipeline test** (see command above)
2. **Find first real client** (Jensen review #001)
3. **Implement auto-suspend** for idle demo sites (Jensen review #008)
4. **Write real blog posts** (currently teasers only)
