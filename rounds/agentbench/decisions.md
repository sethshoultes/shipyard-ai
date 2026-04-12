# AgentBench: Locked Decisions

*Consolidated by Phil Jackson, The Zen Master*

The triangle works when each player sees what the others see. After two rounds of debate, Elon and Steve have found their synthesis. This document is the blueprint.

---

## The Essence (Guiding North Star)

> **What is this product REALLY about?**
> Showing developers exactly where their AI agent breaks — and making them want to fix it.

> **The one thing that must be perfect:**
> The moment of failure. When the benchmark reveals a weakness, that moment must teach — not punish.

> **Creative direction:**
> Truth, delivered beautifully.

---

## Locked Decisions

### Decision 1: Timeline — 4 Weeks to MVP
| Proposed By | Elon |
|-------------|------|
| **Winner** | Elon |
| **Why** | Steve conceded: "4-week MVP timeline is achievable if we scope correctly." Speed compounds. Learning from real users beats theorizing about perfect users. |
| **Constraint** | Scope must be ruthless. No custom component library. Standard React components with tight design tokens. |

---

### Decision 2: Storage — SQLite + Flat Files
| Proposed By | Elon |
|-------------|------|
| **Winner** | Elon (conditional) |
| **Why** | "Premature optimization is the root of all evil." We're not at scale. Migrate when the problem exists, not before. |
| **Steve's Concern** | Transaction safety for crashed benchmark runs. |
| **Resolution** | SQLite provides ACID transactions — Steve's concern is addressed without Postgres complexity. Implement checkpoint writes for long-running evaluations. |

---

### Decision 3: CLI-First, GUI Ships Together
| Proposed By | Elon (CLI-first) |
|-------------|------------------|
| **Counter** | Steve (GUI parity) |
| **Winner** | Synthesis — both ship in v1 |
| **Why** | Elon: "Power users live in terminals." Steve: "CLI-first is the wrong moat... we're not irreplaceable yet." Both are right. CLI excellence is table stakes for CI/CD. GUI excellence is the differentiation. |
| **Resolution** | CLI and GUI ship simultaneously. Neither is second-class. |

---

### Decision 4: Results Visualization Is Core Product
| Proposed By | Steve |
|-------------|-------|
| **Winner** | Steve (Elon conceded) |
| **Why** | Elon acknowledged: "The benchmark visualization IS the product." A benchmark that can't communicate findings clearly is useless. |
| **Scope** | Radar charts for capability profiles. Pass/fail indicators. Diff comparisons between runs. Visual hierarchy that communicates at a glance. |

---

### Decision 5: Error States Get Design Investment
| Proposed By | Steve |
|-------------|-------|
| **Winner** | Steve (Elon explicitly conceded) |
| **Why** | Elon: "When an agent fails a benchmark, the feedback UX determines whether users fix it or rage-quit. Worth investing here." |
| **Scope** | Clear error messages. Specific failure analysis. Actionable suggestions. This is where most tools fail. |

---

### Decision 6: 30-Second First Impression (Not Magical Onboarding)
| Proposed By | Steve (refined from "magical onboarding") |
|-------------|------------------------------------------|
| **Winner** | Synthesis |
| **Why** | Elon: "Not the whole onboarding — just the hook." Steve scaled back from full magical onboarding to focused first impression. |
| **Scope** | One hero benchmark. Instant visual feedback. Clean typography (3 weights maximum). The hook earns the right to show complexity. |

---

### Decision 7: Standard Components, Tight Design System
| Proposed By | Elon (challenged Steve's custom components) |
|-------------|---------------------------------------------|
| **Winner** | Elon |
| **Why** | Steve conceded: "I was overengineering the component library. Standard React components with a tight design system can ship fast." |
| **Constraint** | No custom UI library. No 12 font weights. React defaults + focused design tokens. Unique effort goes into the benchmarking engine. |

---

## MVP Feature Set (What Ships in v1)

### Must Ship (Non-Negotiable)
1. **Benchmarking Engine** — Core evaluation logic, scoring rubrics, multi-turn conversation support
2. **CLI Tool** — Full programmatic access for CI/CD pipelines, flawless execution
3. **Results Dashboard** — Radar charts, pass/fail indicators, run diffs, visual clarity
4. **Error State UX** — Clear messages, failure analysis, actionable suggestions
5. **First-Run Experience** — One hero benchmark, instant visual feedback, 30-second hook
6. **Data Layer** — SQLite + flat files with checkpoint writes for crash recovery

### Explicitly Deferred (v1.1+)
- Custom component library
- PostgreSQL/Redis infrastructure
- Design awards typography (keep to 3 weights)
- "Magical" extended onboarding flows
- Enterprise SSO/team features

---

## File Structure (What Gets Built)

```
agentbench/
├── cli/                     # CLI tool (ships with v1)
│   ├── commands/            # run, compare, export
│   └── output/              # formatters (json, table, minimal)
├── core/                    # Benchmarking engine
│   ├── evaluators/          # Scoring logic per benchmark type
│   ├── runners/             # Agent execution harness
│   └── metrics/             # Accuracy, latency, cost calculations
├── web/                     # GUI dashboard
│   ├── components/          # Standard React + design tokens
│   ├── views/
│   │   ├── dashboard/       # Results visualization (radar, diffs)
│   │   ├── benchmark/       # Single benchmark detail
│   │   └── error/           # Error state UX
│   └── onboarding/          # First-run hero experience
├── data/                    # Storage layer
│   ├── sqlite/              # Transaction-safe storage
│   └── checkpoints/         # Crash recovery for long runs
├── benchmarks/              # Benchmark definitions
│   └── suites/              # Pre-built evaluation suites
└── docs/                    # API reference, getting started
```

---

## Open Questions (Still Need Resolution)

| Question | Owner | Why It Matters |
|----------|-------|----------------|
| Which benchmark suites ship in v1? | TBD | Defines scope of `benchmarks/suites/`. Too many = bloat. Too few = underwhelming. |
| Pricing model (if any)? | TBD | Affects architecture (usage tracking, auth). |
| Target agent frameworks? | TBD | LangChain, AutoGPT, custom? Determines integration surface. |
| Hosted vs. self-hosted? | TBD | SQLite works for self-hosted. Hosted requires different storage story. |
| Benchmark contribution model? | TBD | Can users create/share benchmarks? Affects data model. |

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **4-week timeline slips** | Medium | High | Ruthless scope enforcement. Cut features, not time. Weekly checkpoint reviews. |
| **SQLite doesn't scale** | Low (v1) | Medium | Documented migration path to Postgres. Abstract storage layer. |
| **CLI/GUI feature parity drift** | Medium | Medium | Shared core engine. CLI and GUI are views, not separate products. |
| **Results visualization complexity** | Medium | High | Time-box design phase. Ship "good enough" charts, iterate post-launch. |
| **Error state UX underinvested** | Low | High | Elon and Steve both locked this. Team alignment is strong. |
| **First impression doesn't hook** | Medium | High | User testing in week 2. Iterate before launch, not after. |
| **Competitors ship faster** | Medium | Medium | Speed is in our DNA. 4 weeks is aggressive. Don't let perfect be enemy of shipped. |

---

## The Synthesis

Elon wanted a rocket. Steve wanted a cathedral. We're building a rocket with a cathedral window — fast, functional, and with one moment of transcendent clarity: when the user sees exactly where their agent fails, and knows exactly what to do next.

Ship in 4 weeks. Ship ugly where it doesn't matter. Ship beautifully where it does.

The triangle is set. Run the play.

*— Phil Jackson*
