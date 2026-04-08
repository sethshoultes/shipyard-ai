# Shipyard AI

**PRD in. Production site out.**

Shipyard AI is an autonomous agency that turns product requirements into deployed software — without human intervention. Drop a PRD in the `prds/` directory and the multi-agent pipeline debates, plans, builds, tests, reviews, and ships it.

[www.shipyard.company](https://www.shipyard.company)

---

## How It Works

Every PRD runs through a 7-phase pipeline powered by AI agents with distinct roles and personalities:

```
PRD → Debate → Plan → Build → QA → Creative Review → Board Review → Ship
```

| Phase | What Happens | Agents |
|-------|-------------|--------|
| **Debate** | Steve Jobs and Elon Musk argue strategy across two rounds | Steve, Elon, Rick Rubin, Phil Jackson |
| **Plan** | Task breakdown with wave-based parallel execution | Planner, Sara Blakely |
| **Build** | Code written, tested, committed | Builder agents |
| **QA** | Two independent quality passes | Margaret Hamilton |
| **Creative Review** | Visual design, copy, and demo script review | Jony Ive, Maya Angelou, Aaron Sorkin |
| **Board Review** | Ship/no-ship vote with written justifications | Jensen Huang, Oprah, Warren Buffett, Shonda Rhimes |
| **Ship** | Commit, push, merge to main, retrospective | Shipper, Marcus Aurelius |

## The Team

| Agent | Role | Style |
|-------|------|-------|
| **Phil Jackson** | Orchestrator | Triangle offense — find the open player, trust the system |
| **Steve Jobs** | Creative Director | Direct, passionate, challenges mediocrity |
| **Elon Musk** | Engineering Director | First principles, ship fast, iterate |
| **Margaret Hamilton** | QA Director | Zero-defect mindset, blocks ship on P0s |
| **Jensen Huang** | Strategic Advisor | Moat analysis, compounding advantages |
| **Jony Ive** | Visual Design | Less but better, every pixel matters |
| **Maya Angelou** | Copywriter | Words that land, copy that converts |
| **Sara Blakely** | Growth Strategy | Gut-check the plan, find the blind spots |

Plus **Rick Rubin** (essence distillation), **Aaron Sorkin** (demo scripts), **Oprah** (user empathy), **Warren Buffett** (investability), **Shonda Rhimes** (retention hooks), and **Marcus Aurelius** (retrospectives).

## What We've Built

### Emdash Plugins (7)

| Plugin | Description |
|--------|-------------|
| **MemberShip** | Membership management with Stripe billing, content gating, member portals |
| **EventDash** | Event management with ticketing, multi-day events, CSV import, check-in |
| **AdminPulse** | Admin dashboard with site health monitoring |
| **ReviewPulse** | Review collection and display with Google import |
| **FormForge** | Form builder with templates, submissions, and validation |
| **SEODash** | SEO management and optimization tools |
| **CommerceKit** | E-commerce toolkit for Emdash sites |

### Example Sites (4)

Live Emdash sites running on Cloudflare Workers with D1 databases and R2 storage:

| Site | Live URL | Template |
|------|----------|----------|
| **Bella's Bistro** | [bellas.shipyard.company](https://bellas.shipyard.company) | Restaurant / Marketing |
| **Craft & Co Studio** | [craft.shipyard.company](https://craft.shipyard.company) | Design Studio / Portfolio |
| **Peak Dental Care** | [dental.shipyard.company](https://dental.shipyard.company) | Dental Practice / Marketing |
| **Sunrise Yoga Studio** | [yoga.shipyard.company](https://yoga.shipyard.company) | Yoga Studio / Marketing |

### Wardrobe Theme Marketplace

5 installable themes for Emdash with a CLI installer:

| Theme | Personality |
|-------|-------------|
| **Ember** | Bold editorial — serif headings, dark navy + burnt orange |
| **Drift** | Minimal and airy — whitespace, sage green accent |
| **Forge** | Dark and technical — monospace, neon green, terminal-inspired |
| **Bloom** | Warm and organic — rounded corners, cream + terracotta |
| **Slate** | Corporate and clean — gray palette, blue accents, structured |

**Preview:** [wardrobe-showcase.pages.dev](https://wardrobe-showcase.pages.dev)

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
