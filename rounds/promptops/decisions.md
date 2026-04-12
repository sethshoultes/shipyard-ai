# PromptOps — Consolidated Decisions Document

**Arbiter:** Phil Jackson, The Zen Master
**Debate Participants:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Design Reviewer:** Jony Ive
**Copy Reviewer:** Maya Angelou
**QA Director:** Margaret Hamilton
**Board:** Warren Buffett, Jensen Huang, Oprah Winfrey, Shonda Rhimes
**Date:** 2026-04-12
**Status:** HOLD — Build Phase Not Completed

---

## I. Locked Decisions

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Drift/NERVE** | Steve | **Steve** | "PromptOps" describes a Jira ticket, not a feeling. "Drift" evokes version drift—prompts drift over time. CLI becomes `drift push`, `drift rollback`. The daemon subsystem is "NERVE"—central nervous system, essential, alive. One word names shape destiny. |
| 2 | **No Proxy in V1** | Elon | **Elon** | Proxy adds 15-80ms latency to every LLM call. That's commercial suicide. It's also a single point of failure, a security target (holds API keys), and requires trust before value is demonstrated. SDK-first: fetch prompt, cache locally (5-min TTL), inject. Zero latency impact. "Value first, trust second." |
| 3 | **SDK-First Architecture** | Elon | **Elon** | LaunchDarkly started with a client SDK, not a proxy. The adoption curve for "add 2 lines of code" is 10x better than "reroute your traffic." The proxy is v2, after trust is earned. Steve conceded in Round 2: "Critical path dependency is commercial suicide." |
| 4 | **Dashboard Minimal (Read-Only)** | Elon | **Elon** | Static HTML. Shows prompt name, version, timestamp. No rollback button (CLI handles that). "Raw HTML with Tailwind CDN is fine" for MVP. Steve pushed back: "A developer's first impression shapes trust." Compromise: clean but not elaborate. Polish is v1.1. |
| 5 | **Polished Dashboard Ships** | Steve | **Partial Steve** | Not elaborate, but not embarrassing. Clean type. Clear hierarchy. Professional appearance. "The dashboard that manages developer anxiety cannot look anxious itself." Static HTML, but considered static HTML. |
| 6 | **Bash Over Agent Prompts (NERVE)** | Both | **Consensus** | "Trust bash, not instructions." Deterministic execution is the architectural contract. When something must happen, code makes it happen. No probabilistic operations for critical paths. |
| 7 | **Zero Configuration** | Steve | **Steve** | Every option is a failure to decide. Opinionated defaults. Users trust; we decide. The product should work the moment you run it. |
| 8 | **60-Second Time-to-Value** | Both | **Consensus** | `npm install` + `drift init` + `drift push` must work in under 60 seconds. If setup takes longer than the first dopamine hit, we've failed. |
| 9 | **CLI-First, Dashboard Second** | Both | **Consensus** | Developers discover via terminal, not web UI. The CLI is the product. Dashboard is "read-only visibility" not "the product." |
| 10 | **Brand Voice: Confident, Not Clever** | Steve | **Steve** | "This prompt has a problem. Here's the fix." Not "Perhaps you might consider..." Short sentences. Active voice. No adjectives unless they add information. The voice is a senior engineer who respects your time. |
| 11 | **Cut A/B Testing from V1** | Both | **Consensus** | Adoption before optimization. A/B testing is v2 scope. |
| 12 | **Cut `diff` Command from V1** | Both | **Consensus** | Nice but not essential. Users can eyeball versions. Ship lean. |
| 13 | **One Pricing Tier** | Steve | **Steve** | No feature walls. No pricing anxiety. Full product with usage limits only. Aligns with adoption-first strategy. |

---

## II. MVP Feature Set (What Ships in V1)

### Core Product: Drift (Prompt Versioning)

| Component | Description | Implementation |
|-----------|-------------|----------------|
| **CLI** | Four commands: `init`, `push`, `list`, `rollback` | Node.js, commander.js |
| **API** | CRUD for prompts and versions | Cloudflare Worker + D1 |
| **SDK** | `getPrompt(name)` with aggressive caching | TypeScript, 5-min TTL |
| **Dashboard** | Read-only visibility of prompts/versions | Static HTML |

### CLI Commands

| Command | Function |
|---------|----------|
| `drift init` | Initialize project, generate API key. No signup wall. |
| `drift push <name> --file <path>` | Push prompt version. Auto-increment version number. |
| `drift list` | List all prompts with version history |
| `drift rollback <name> --version <n>` | Revert to specific version. Live immediately. |

### Supporting Infrastructure: NERVE (Pipeline Daemon)

| Component | Description | Implementation |
|-----------|-------------|----------------|
| **PID Lockfile** | Prevents duplicate daemon instances | `daemon.sh` with `/tmp/nerve.pid` |
| **Queue Persistence** | Survives crashes, no lost state | `queue.sh` with `/tmp/nerve-queue/` |
| **Abort Flag** | Stops runaway pipelines cleanly | `abort.sh` with `/tmp/nerve.abort` |
| **Verdict Parsing** | Unambiguous QA results (PASS/FAIL/BLOCKED) | `parse-verdict.sh` returns JSON |

### Explicitly Deferred (V2+)

| Feature | Reason | Target |
|---------|--------|--------|
| Proxy architecture | Latency killer, trust requirement | V2+ |
| A/B testing | Adoption before optimization | V2 |
| `diff` command | Nice-to-have, not essential | V2 |
| Dashboard rollback button | CLI sufficient | V2 |
| Semantic diff (AI-powered) | Requires LLM integration | V2 |
| Analytics dashboards | "Charts are a crutch" | V2+ |
| Team collaboration | One developer, one project first | V2 |
| Prompt marketplace | Network effects play | V3 |
| Retention features (Chronicle, Streaks, Digests) | Shonda's roadmap | V1.1 |

---

## III. File Structure (What Gets Built)

### Drift (Prompt Versioning Service)

```
drift/
├── worker/
│   ├── index.ts              # Cloudflare Worker entry
│   ├── routes/
│   │   ├── prompts.ts        # CRUD endpoints
│   │   └── auth.ts           # API key validation
│   └── wrangler.toml         # Worker config
│
├── cli/
│   ├── bin/drift.ts          # CLI entry point
│   ├── commands/
│   │   ├── init.ts           # drift init
│   │   ├── push.ts           # drift push
│   │   ├── list.ts           # drift list
│   │   └── rollback.ts       # drift rollback
│   └── package.json
│
├── sdk/
│   ├── index.ts              # getPrompt() export
│   ├── cache.ts              # 5-min TTL caching
│   └── package.json
│
├── dashboard/
│   ├── index.html            # Static HTML
│   └── styles.css            # Minimal professional styling
│
├── schema/
│   └── d1.sql                # D1 database schema
│
└── README.md                 # <50 lines, setup in 60 seconds
```

### NERVE (Pipeline Daemon)

```
nerve/
├── daemon.sh              # Main daemon loop with PID lockfile
├── queue.sh               # Queue persistence and recovery
├── abort.sh               # Abort flag management
├── parse-verdict.sh       # Strict QA verdict parsing
└── README.md              # Documentation
```

---

## IV. Open Questions (Require Resolution Before Build)

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| OQ-001 | **Log format specification** — What format for NERVE logs? | **RESOLVED** | `[TIMESTAMP] [COMPONENT] message` where TIMESTAMP is ISO8601 UTC, COMPONENT is DAEMON/QUEUE/ABORT/VERDICT. Clinical, greppable, no emoji. |
| OQ-002 | **Process naming** — `nerve` or `promptops` in file paths? | **RESOLVED** | Use `nerve` consistently. PID at `/tmp/nerve.pid`. |
| OQ-003 | **Authentication model** — API keys per project? Per user? | **OPEN** | Likely: project-level API key, generated on `drift init`, hashed with SHA-256 for storage. |
| OQ-004 | **Logging backend** — D1 can't handle write volume at scale | **OPEN** | Likely: Workers Analytics Engine or Logpush. D1 for prompts only, not logs. |
| OQ-005 | **Dashboard hosting** — Cloudflare Pages? Embedded in Worker? | **OPEN** | Decision needed at build phase. Static HTML simplifies options. |
| OQ-006 | **SDK distribution** — npm package name availability? | **OPEN** | Check `@drift/cli` and `@drift/sdk` availability. Backup: scoped packages. |

---

## V. Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **No competitive moat** | High | Critical | This is a weekend project for a competent dev. LangSmith, Helicone already exist with more features. Only moat is if we pivot to intelligence (Jensen). | Board |
| **Proxy skipped = value unclear** | Medium | High | The "aha moment" (change prompt, see it live) is weaker without proxy. SDK-first means user still deploys code to use new prompts. Tradeoff accepted for adoption. | Elon |
| **No revenue mechanism** | High | High | No billing integration built. "Hobby wearing a business plan" (Buffett). Must add Stripe before product validation is real. | Buffett |
| **7-hour scope creep** | High | Critical | Ruthless cuts. Static HTML only. No React. No AI features. If it can't be built in one session, it's cut. | Elon |
| **Build phase never completed** | **REALIZED** | Critical | QA Pass 1 found 0/5 deliverables. 17 documents generated, 0 lines of code. Process collapsed at execution. | All |
| **Documentation-to-code ratio** | **REALIZED** | Medium | ~31,500 words of process documentation for ~550 lines of bash that should have shipped. "McKinsey for garage organization" (Buffett). | All |
| **No customer validation** | High | High | Zero external users. Zero revenue. Zero validated demand. Two internal tools, no customer-facing product. | Buffett |
| **D1 write limits at scale** | High | High | Logging to Analytics Engine from day 1. D1 for prompts only. | Build |
| **Edge KV cold start latency** | Medium | High | Aggressive SDK caching. 5-min TTL is floor. | Build |
| **Trust before value (proxy model)** | High | Critical | MITIGATED by SDK-first decision. Users never route traffic through us in v1. | Elon |
| **NERVE is premature optimization** | High | Medium | "40% of effort on infrastructure for 0 users" (Buffett). "B-plot that never gets screen time" (Shonda). Either integrate with Drift or kill. | Board |

---

## VI. Board Verdict Summary

### Scores

| Reviewer | Score | Lens | Key Critique |
|----------|-------|------|--------------|
| Warren Buffett | 4/10 | Durable Value | "Commodity infrastructure with no moat. A weekend project competing with well-funded competitors." |
| Jensen Huang | 5/10 | AI Leverage | "Zero AI in an AI tool. Stop building storage, start building intelligence." |
| Shonda Rhimes | 5/10 | Retention | "The pilot that never aired. Every interaction ends with a version number, not a cliffhanger." |
| Oprah Winfrey | 6.5/10 | Human Experience | "The soul exists but got buried. Built by experts for experts." |

**Average Score: 5.1/10**
**Verdict: HOLD**

### Points of Agreement (All Four Reviewers)

1. **Engineering quality is solid** — When code exists, it's well-crafted
2. **The proxy is the real product** — And it wasn't built
3. **Dashboard not built** — Critical gap for non-CLI users
4. **NERVE is premature** — Infrastructure for infrastructure's sake
5. **No moat** — Easily replicable in a weekend
6. **No revenue mechanism** — Can't validate willingness to pay without ability to pay
7. **Accessibility too narrow** — Built by experts, for experts

### Conditions for PROCEED

**Must Have:**
1. Ship the proxy OR validate SDK-only adoption with real users
2. Ship the dashboard (visual interface for non-CLI users)
3. Add billing integration (Stripe, 30 minutes)
4. Talk to 10 companies with prompt management pain—confirm willingness to pay

**Should Have:**
5. Instrument proxy/SDK for data collection (future intelligence layer)
6. Connect NERVE to Drift (auto-rollback on metrics) OR kill NERVE entirely
7. Build retention layer (daily/weekly touchpoints)

---

## VII. Retrospective Findings (Marcus Aurelius)

### What Worked
- Dialectic process produced genuine insight
- Scope discipline held (conceptually)
- Essence document served as north star
- QA was uncompromising (correctly blocked)

### What Failed
- **Build phase never happened** — 17 documents, 0 lines of code
- Process cost vastly exceeded output value (~31,500 words for ~550 lines of bash)
- No customer, no revenue, no moat after two projects
- "PromptOps with zero prompts" credibility gap

### Key Learning
> "A thousand pages of strategy cannot move one soldier one mile. The agency generates exceptional strategy but has not yet demonstrated it can execute."

**Process Adherence Score: 4/10**
- Planning: 8/10
- Build: 0/10
- Ship: 0/10

---

## VIII. The Essence

**What it is:** The undo button for AI—turning prompt deployment from a gamble into a system.

**The feeling:** Peace. The 3 AM panic, gone.

**The one thing that must be perfect:** The rollback. One command. Instant. No thinking.

**Creative direction:** Disappear. Work always.

---

## IX. Build Phase Acceptance Criteria

For V1 to be considered COMPLETE:

### Drift
- [ ] `drift init` creates project, generates API key, no signup wall
- [ ] `drift push` versions prompt, stores in D1, updates edge KV
- [ ] `drift list` shows all prompts with version history
- [ ] `drift rollback` reverts to specified version, live immediately
- [ ] SDK `getPrompt()` fetches from edge, caches locally, zero latency impact
- [ ] Dashboard displays prompts/versions (read-only)
- [ ] README.md <50 lines, explains setup in 60 seconds

### NERVE
- [ ] `daemon.sh` starts, creates PID lockfile, prevents duplicates
- [ ] `queue.sh` persists queue to disk, recovers state on restart
- [ ] `abort.sh` sets flag, daemon responds, clean shutdown
- [ ] `parse-verdict.sh` returns JSON with verdict and issue counts
- [ ] All scripts use `[TIMESTAMP] [COMPONENT] message` log format
- [ ] README.md documents all commands

### Meta
- [ ] All files committed to deliverables directory
- [ ] QA Pass confirms zero P0 issues
- [ ] At least one component actually runs

---

## X. Path Forward

**The Central Truth:** The agency has demonstrated it can design. It has not demonstrated it can build.

**Next Action:** Build. Ship. Then reflect.

The debates are over. The decisions are locked. The risks are documented. The board has ruled.

**Now execute.**

---

*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
*"Paths are not walked by documenting them. They are walked by walking."* — Marcus Aurelius

---

**Document Status:** Blueprint for Build Phase
**Last Updated:** 2026-04-12
**Arbiter:** Phil Jackson
