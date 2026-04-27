# Locked Decisions — Still v1
*Arbiter: Phil Jackson*

---

## Decisions by Domain

### 1. Product Name: **Still**
- **Proposed by:** Steve (Round 1)
- **Winner:** Steve
- **Why:** "Calm Commit" signals a generic utility. Still signals a state of mind. One word is memorable. The essence locked it before the second round began.

### 2. Core Architecture: `prepare-commit-msg` Git Hook CLI
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Universal coverage beats bespoke beauty in v1. It works in vim over SSH, VS Code, Emacs, IntelliJ — every editor without a plugin. Steve conceded the hook is "the right plumbing." The ghost-line experience is real but deferred; the essence reads: *"Ship the hook now. The ghost line follows."*

### 3. Interface Contract: One Suggestion, Zero Config
- **Proposed by:** Steve (Round 1)
- **Winner:** Steve (unanimous)
- **Why:** Both agreed that multiple options are decision fatigue disguised as user choice. Every settings panel is an admission of design failure. If the suggestion isn't perfect, the product doesn't deserve to exist. Locked: no onboarding wizard, no "learn your style," no configuration panels, ever.

### 4. Voice & Tone: Master Craftsman
- **Proposed by:** Steve (Round 1)
- **Winner:** Steve (unanimous)
- **Why:** Elon conceded in Round 2. The commit message itself is the primary interface. No exclamation points, no emojis, no "Hey there!" Voice is taste; taste is retention. Example: "Refactor authentication middleware. Extract token validation to reduce cyclomatic complexity."

### 5. Performance: Diff-Hash Cache
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon (Steve conceded Round 2)
- **Why:** LLM round-trip is the bottleneck (500ms–3s), not diff parsing. Cache by diff hash gives <10ms on identical changes and acts as a cost firewall at scale. Elegant and non-negotiable.

### 6. LLM Strategy: Cloud-Only for v1
- **Proposed by:** Steve (implied rebuttal in Round 2)
- **Winner:** Steve
- **Why:** Elon advocated a local 8B model for speed. Steve countered that a fast-but-wrong suggestion kills trust on first use. The essence: *"Speed without quality is a broken promise."* For v1, the suggestion must be excellent every time. Caching handles the speed concern. Cost is a scaling problem, not a v1 problem.

### 7. Scope Freeze for v1
- **Proposed by:** Elon (Round 2)
- **Winner:** Elon (Steve conceded specific items)
- **Why:** The following are **out** of v1:
  - VS Code extension / ghost-line UI (deferred: "weeks, not quarters")
  - "Learns your team's commit style" (requires embeddings/RAG — v2)
  - Commit chunking suggestions (semantic code understanding — research problem)
  - Local model support (future cost-mitigation exploration)
  - Web dashboards, team analytics, onboarding wizards

### 8. Distribution: Not Organic Prayer
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon (Steve conceded Round 2)
- **Why:** "npm/brew and developer Twitter" is not a strategy. Organic alone won't hit 10k. We need a launch partner, a viral mechanic, or bundling into an unavoidable workflow. Steve agreed: "We need a launch partner or a viral mechanic."

### 9. Monetization: Pricing Story Before Scale
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon (Steve conceded Round 2)
- **Why:** At 100× usage, LLM API costs break the business model before the code breaks. Freemium local/cloud split was debated and rejected by Steve as a "support nightmare." The locked decision: define a pricing/cost story before scaling past 1,000 users. Do not scale into bankruptcy.

---

## MVP Feature Set (What Ships in v1)

1. **Git Hook Installer** — One-command setup that registers `prepare-commit-msg`.
2. **Diff Extractor** — Reads `git diff --staged`, respects diff context.
3. **Diff-Hash Cache** — Disk-based cache (e.g., SQLite or simple KV) keyed by diff hash; returns cached suggestion instantly.
4. **LLM Client** — Cloud-only prompt path; sends diff + context to a capable model (e.g., GPT-4o / Claude 3.5 Sonnet tier).
5. **Prompt Engine** — Single-shot system prompt enforcing the Still voice: declarative, precise, concise, no marketing speak.
6. **Message Injector** — Writes the suggestion into the commit message buffer so it appears when the editor opens.
7. **CLI Binary** — Self-contained executable (Node.js compiled or Go/Rust binary) distributed via npm/brew.
8. **One Command** — `still install` / `still uninstall`. No other CLI surface.

---

## File Structure (What Gets Built)

```
still/
├── cmd/still/              # CLI entrypoint (install, uninstall, --version)
├── internal/
│   ├── hook/               # prepare-commit-msg hook template & injection
│   ├── git/                # git diff --staged parser
│   ├── cache/              # diff-hash → suggestion store
│   ├── llm/                # cloud API client + prompt builder
│   └── config/             # zero-user-config internal constants (model endpoint, timeout)
├── pkg/
│   └── voice/              # prompt templates enforcing Still tone
├── scripts/
│   └── install.sh          # curl-pipe bootstrap
├── go.mod / Cargo.toml / package.json  # TBD by build agent
└── README.md               # One-line description + install instruction
```

**Notes:**
- No `config/` for user settings.
- No `extension/` or `plugins/` in v1.
- No `web/` or `dashboard/`.
- The entire surface area should fit in a single agent build session.

---

## Open Questions (Needs Resolution Before Build or During)

1. **Language/runtime:** Node.js (distribution ease) vs. Go (single binary, speed) vs. Rust (smallest binary). Elon favors shipping; Node may win on time-to-brew. Pick one in the first 5 minutes of build.
2. **Cache backend:** SQLite for portability, or a simple JSON/flat-file store? Must work without a running daemon.
3. **Cloud LLM provider:** OpenAI, Anthropic, or abstracted? If abstracted, what's the default? Decision needed before prompt tuning.
4. **Pricing model:** Flat subscription? Per-user? Pay-as-you-go? "Pricing story" is mandated but undefined.
5. **Launch partner:** Who is the partner? Do we have an inbound channel, or is this speculative?
6. **Diff-hash algorithm:** Git's own diff hash, or a content hash of the diff text? Must be stable across rebases and file renames.
7. **Rebase workflow behavior:** Steve said "NO supporting rebase workflows we're not proud of." Elon said "If it doesn't work with rebase, it doesn't work for real developers." The hook fires during rebase commits. We must test and document behavior; this tension is unresolved in the debate.

---

## Risk Register (What Could Go Wrong)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **LLM latency kills the ritual** | Medium | High | Diff-hash cache is the primary defense. If cache miss latency still feels slow, the "one line above your cursor" promise breaks. Monitor p95 latency. |
| **LLM cost scales unexpectedly** | High | High | Cloud-only + caching buys time, but viral growth without pricing is fatal. Lock pricing model before any Hacker News front-page moment. |
| **Suggestion quality is inconsistent** | Medium | Critical | One bad suggestion = churn. Invest in prompt engineering. Have a fallback: if the model returns low-confidence garbage, abort and leave the buffer empty rather than poison the user's history. |
| **Git hook conflicts with existing hooks** | Medium | Medium | Many developers already have commitlint, husky, etc. Installer must detect and chain hooks, not overwrite them. Document conflict resolution. |
| **"No config" becomes hostile power-users** | Low | Medium | Power users will want to swap models, change tone, or disable per-repo. Without an escape hatch, they fork or uninstall. v2 may need a minimal `.stillignore`/`.stillconfig` — but not in v1. |
| **Distribution remains a prayer** | High | Critical | Even with a perfect hook, 10k users don't appear. If launch partner falls through, have a backup: targeted influencer outreach, a killer demo GIF, or an integration with a popular CLI toolkit. |
| **Local model demand emerges quickly** | Medium | Medium | If cloud costs or privacy concerns surface before v2 is ready, we may be forced to ship local support hastily. Keep the LLM client interface abstracted enough to plug in a local runner later. |

---

*Last word from the Zen Master:*

Steve fought for the soul. Elon fought for the body. Both were right. v1 ships the body — the hook, the cache, the voice — because a soul without a body is a ghost. The ghost line follows. Build the ritual first. The rest is decoration.
