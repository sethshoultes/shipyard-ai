# Shipyard AI

**PRD in. Production site out.**

Shipyard AI is an autonomous agency that turns product requirements into deployed software — without human intervention. Drop a PRD in the `prds/` directory and the multi-agent pipeline debates, plans, builds, tests, reviews, and ships it.

[www.shipyard.company](https://www.shipyard.company)

---

## Status

**What works today:** [EventDash](plugins/eventdash/) — event management with ticketing, CSV import, and check-in. Start here.

**What's in progress:** 6 more plugins (MemberShip, ReviewPulse, SEODash, CommerceKit, FormForge, AdminPulse) — API migrations underway.

---

## How It Works

Every PRD runs through a 7-phase pipeline powered by AI agents with distinct roles and personalities:

```
PRD → Debate → Plan → Build → QA → Creative Review → Board Review → Ship
```

| Phase | What Happens | Agents |
|-------|-------------|--------|
| **Debate R1** | Steve and Elon each stake their position on strategy | Steve Jobs, Elon Musk |
| **Debate R2** | They challenge each other's arguments | Steve Jobs, Elon Musk |
| **Essence** | Rick Rubin distills the debate to what matters | Rick Rubin |
| **Consolidation** | Phil Jackson synthesizes decisions from the debate | Phil Jackson |
| **Plan** | Task breakdown with wave-based parallel execution | Planner, Sara Blakely (gut check) |
| **Build** | Code written, tested, committed | Builder agents |
| **QA** | Two independent quality passes | Margaret Hamilton |
| **Creative Review** | Visual design, copy, and demo script review | Jony Ive, Maya Angelou, Aaron Sorkin |
| **Board Review** | Ship/no-ship vote with written justifications | Jensen Huang, Oprah, Warren Buffett, Shonda Rhimes |
| **Ship** | Commit, push, merge to main, retrospective | Shipper, Marcus Aurelius |

## The Team (14 Agents)

### Leadership

| Agent | Role | Pipeline Phase | Style |
|-------|------|---------------|-------|
| **Phil Jackson** | Orchestrator | Debate (consolidation) | Triangle offense — find the open player, trust the system |
| **Steve Jobs** | Creative Director | Debate (R1, R2) | Direct, passionate, challenges mediocrity |
| **Elon Musk** | Engineering Director | Debate (R1, R2) | First principles, ship fast, iterate |
| **Margaret Hamilton** | QA Director | QA (2 passes) | Zero-defect mindset, blocks ship on P0s |

### Creative Team

| Agent | Role | Pipeline Phase | Style |
|-------|------|---------------|-------|
| **Jony Ive** | Visual Design | Creative Review | Less but better, every pixel matters |
| **Maya Angelou** | Copywriter | Creative Review | Words that land, copy that converts |
| **Aaron Sorkin** | Demo Scriptwriter | Creative Review | Sharp dialogue, dramatic structure |
| **Rick Rubin** | Essence Distiller | Debate (essence) | Strip away everything that isn't essential |

### Board of Directors

| Agent | Role | Pipeline Phase | Lens |
|-------|------|---------------|------|
| **Jensen Huang** | Board Member | Board Review | Moat gaps, compounding advantages |
| **Oprah Winfrey** | Board Member | Board Review | New user confusion, first-5-minutes experience |
| **Warren Buffett** | Board Member | Board Review | Revenue opportunities, investability |
| **Shonda Rhimes** | Board Member | Board Review | Retention hooks, what brings people back |

### Strategy & Operations

| Agent | Role | Pipeline Phase | Style |
|-------|------|---------------|-------|
| **Sara Blakely** | Growth Strategy | Plan (gut check) | Find the blind spots, validate the approach |
| **Marcus Aurelius** | Retrospectives | Ship | Stoic reflection, lessons for next build |

## What We've Built

### Emdash Plugins (7)

| Plugin | Status | Description |
|--------|--------|-------------|
| **EventDash** | ✅ Working | Event management with ticketing, multi-day events, CSV import, check-in |
| **MemberShip** | ❌ Known Issues | Membership management with Stripe billing — API migration needed |
| **ReviewPulse** | ❌ Known Issues | Review collection and display — API migration needed |
| **SEODash** | ❌ Known Issues | SEO management tools — API migration needed |
| **CommerceKit** | 🔧 In Progress | E-commerce toolkit — unverified |
| **FormForge** | 🔧 In Progress | Form builder with templates — unverified |
| **AdminPulse** | 🔧 In Progress | Admin dashboard — different architecture |

### Example Sites (4)

Live Emdash sites running on Cloudflare Workers with D1 databases and R2 storage:

| Site | Custom Domain | Workers Dev URL | Template |
|------|---------------|-----------------|----------|
| **Bella's Bistro** | [bellas.shipyard.company](https://bellas.shipyard.company) | [bellas-bistro.workers.dev](https://bellas-bistro.workers.dev) | Restaurant / Marketing |
| **Craft & Co Studio** | [craft.shipyard.company](https://craft.shipyard.company) | [craft-co-studio.workers.dev](https://craft-co-studio.workers.dev) | Design Studio / Portfolio |
| **Peak Dental Care** | [dental.shipyard.company](https://dental.shipyard.company) | [peak-dental.workers.dev](https://peak-dental.workers.dev) | Dental Practice / Marketing |
| **Sunrise Yoga Studio** | [yoga.shipyard.company](https://yoga.shipyard.company) | [sunrise-yoga.workers.dev](https://sunrise-yoga.workers.dev) | Yoga Studio / Marketing |

> **Note:** Custom domains route through Caddy on DO server. Workers dev URLs are direct to Cloudflare — use these if custom domains are down.

### Wardrobe Theme Marketplace

5 themes for Emdash — browse the showcase:

| Theme | Personality |
|-------|-------------|
| **Ember** | Bold editorial — serif headings, dark navy + burnt orange |
| **Drift** | Minimal and airy — whitespace, sage green accent |
| **Forge** | Dark and technical — monospace, neon green, terminal-inspired |
| **Bloom** | Warm and organic — rounded corners, cream + terracotta |
| **Slate** | Corporate and clean — gray palette, blue accents, structured |

**Browse themes:** [wardrobe-showcase.pages.dev](https://wardrobe-showcase.pages.dev)

## Usage

### Run the Pipeline

```bash
# 1. Clone the repo
git clone https://github.com/sethshoultes/shipyard-ai.git
cd shipyard-ai

# 2. Drop a PRD in the prds/ directory
cp your-prd.md prds/my-project.md

# 3. Start the daemon
cd ../great-minds-plugin/daemon
npm install
PIPELINE_REPO=/path/to/shipyard-ai npx tsx src/daemon.ts
```

The daemon watches `prds/` for new `.md` files and automatically runs the full pipeline.

### Run an Example Site Locally

```bash
cd examples/bellas-bistro
npm install
npx wrangler dev
```

## Tech Stack

- **AI:** [Claude Agent SDK](https://github.com/anthropics/claude-code) — programmatic multi-agent orchestration
- **CMS:** [Emdash](https://github.com/emdash-cms/emdash) — Astro-based CMS
- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1
- **Storage:** Cloudflare R2
- **Language:** TypeScript

## Repo Structure

```
shipyard-ai/
├── prds/              # Drop PRDs here — daemon picks them up
│   ├── completed/     # Successfully shipped PRDs
│   └── failed/        # PRDs that failed pipeline
├── rounds/            # Debate transcripts per project
├── plugins/           # 7 Emdash plugins
├── examples/          # 4 live Emdash sites
├── deliverables/      # Shipped products (themes, marketplace, etc.)
├── dreams/            # featureDream innovation loop output
├── memory-store/      # SQLite + TF-IDF persistent agent memory
├── SOUL.md            # Company values and identity
├── AGENTS.md          # Agent roster and hierarchy
└── STATUS.md          # Current pipeline state
```

## Philosophy

> *"Ship or die. Every PRD has a finish line. We hit it."*

> *"Tokens are money. Every AI call costs tokens. Be precise. Be efficient."*

> *"The pipeline is the product. Improve the pipeline and you improve every future project."*

---

Built by [Shipyard AI](https://www.shipyard.company) — an autonomous agency powered by the [Great Minds](https://greatminds.company) multi-agent framework.
