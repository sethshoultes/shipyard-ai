# Locked Decisions — Pulse

> *"Elon is right about overhead. Steve is right about taste."*
> *— Essence*

## Synthesis (The Zen Master Ruling)

This is not a product. It is a heartbeat. A single beat that says "I'm here."

Don't dress it up. Don't strip it bare. Make the silence around the sentence feel intentional.

The file appears. Seth reads it. He trusts the system again.

That's the standard. Everything else is noise.

---

## Decisions

### 1. Name
- **Proposed by:** Steve (Round 1, Round 2)
- **Winner:** Steve
- **Why:** "Kimi-smoke-test" dies today. One word. Dignity, not plumbing. The essence calls this a heartbeat; the name is **Pulse**. No committee, no design review, no naming convention debate. Steve gets the word. Elon gets the process: zero overhead to arrive at it.

### 2. The Output Sentence
- **Proposed by:** Steve (Round 1, Round 2) vs. Elon (Round 1, Round 2)
- **Winner:** Steve on craft; Elon on constraints
- **Why:** The sentence must be evidence of taste — clean, inevitable, alive. Sparse, confident, warm. It is not a log, not a tag, not robot speak. However: there is no style guide, no voice documentation, no ongoing curation. The sentence ships once. If it needs rewriting, it happens in the same session, not maintained across quarters. Readable output costs nothing; we will not be maliciously obscure.

**Locked sentence:** *"Kimi drove this."* Period. Full stop. Let the silence do the work.

### 3. Architecture
- **Proposed by:** Elon (Round 1, Round 2)
- **Winner:** Elon
- **Why:** Single shell command. Zero modules. Zero imports. Zero entry points. One line in CI that exits zero or non-zero. Steve's one-command requirement is satisfied; Elon's zero-abstraction mandate wins the implementation. The interface is the exit code. Green means go. Red means wake someone up.

### 4. The Blueprint (PRD)
- **Proposed by:** Steve (Round 2) vs. Elon (Round 1, Round 2)
- **Winner:** Draw — mediated
- **Why:** Steve is correct that discipline matters. Elon is correct that a 24-line document to describe a 1-line operation is institutional self-harm. The resolution: **this document is the blueprint.** One page. No sections beyond what you see here. No priority matrices. The PRD is the decision log; the decision log is the PRD. If it doesn't fit on one page, it doesn't ship.

### 5. Configuration
- **Proposed by:** Consensus (Elon Round 1, Steve Round 2)
- **Winner:** Consensus
- **Why:** Zero configuration. If you need a `.yaml` to write twelve words, burn it down.

### 6. Distribution & Audience
- **Proposed by:** Consensus (Elon Round 1, Steve Round 2)
- **Winner:** Consensus
- **Why:** Zero distribution. One user: Seth. A stethoscope, not a loudspeaker. This is a pipeline heartbeat, not a product feature.

### 7. Performance & Success Metrics
- **Proposed by:** Elon (Round 1, Round 2) vs. Steve (Round 2)
- **Winner:** Both — dual mandate
- **Why:** Elon is right that the real bottleneck is inference latency and pipeline orchestration, not disk I/O. Wall-clock time must be measured and must be under 5 seconds end-to-end. Steve is right that the metric isn't everything — Seth must feel the exhale. The success criterion is binary: **file appears + Seth trusts the system again.** Measure time; optimize for trust.

---

## MVP Feature Set (What Ships in v1)

1. **One shell command** that writes one sentence to one text file and exits.
2. **Exit code semantics:** 0 for success, non-zero for failure. No other interface.
3. **One crafted sentence** in plain text. No formatting, no metadata, no timestamps.
4. **Zero configuration.** No env vars, no config files, no flags.
5. **One CI step** that invokes the command and checks the exit code.
6. **One output file** with a human-readable name.

---

## File Structure (What Gets Built)

```
/rounds/kimi-smoke-test/
├── decisions.md          # this blueprint (locked)
├── pulse.txt             # the output artifact (generated, not committed)
└── run.sh                # the single shell command (optional — may be inline in CI)
```

**Build constraint:** If the build produces more than one meaningful file plus this blueprint, it has already failed Elon's test and Steve's taste test.

---

## Open Questions (What Still Needs Resolution)

1. **Output filename.** `pulse.txt` honors the name. Does the file live in repo root, `/tmp`, or an artifacts directory?
2. **CI location.** Which pipeline file, which repo, which stage? (Pre-merge, post-merge, or agent-initiated?)
3. **Failure semantics.** If the file does not appear, is the failure mode a CI red light, a Slack ping, or silent? Elon says pager stops; Steve says trust breaks.
4. **Agent vs. shell.** Elon argues a bash one-liner is sufficient. Steve argues an agent must articulate intent. Does the agent generate the sentence, or is it hardcoded? This determines whether we are testing the model or the filesystem.
5. **Cleanup policy.** Running 10,000 times produces 10,000 identical files. Elon flagged disk fill. Is the file ephemeral, overwritten, or retained per run?

---

## Risk Register (What Could Go Wrong)

| Risk | Severity | Flagged By | Mitigation |
|------|----------|------------|------------|
| **Over-engineering** | High | Elon | Hard constraint: one shell command. Any PR adding a module gets rejected automatically. |
| **Style-guide creep** | Medium | Elon | No voice documentation. No comma review. The sentence ships once per cycle. |
| **Cultural rot** | Medium | Steve | If the first artifact is ugly, the thousandth will be uglier. Protect sentence quality at birth. |
| **Inference latency masks failure** | High | Elon | A 30-second pipeline that produces a perfect sentence is still broken. Measure wall-clock time separately from output quality. |
| **Disk fill at scale** | Low | Elon | Running 10,000 times produces 10,000 identical files. If this leaves the sandbox, implement cleanup or append-only rotation. |
| **Maintenance by committee** | Medium | Elon | The approval is the merge. No design review, no naming committee, no stakeholder sync. |
| **Future engineer degrades output** | Low | Steve | If a future maintainer sees this as "just a test" and strips the care, culture forms at the edges. This blueprint defends the standard. |

---

## Non-Negotiables (Walls, Not Opening Positions)

1. **One shell command.** No modules. No imports. No entry points.
2. **Zero process overhead.** No meetings, no design reviews, no stakeholder syncs for this artifact.
3. **One crafted sentence.** Not a log. Not a tag. Evidence of taste.
4. **Zero configuration.** No `.yaml`, no env vars, no flags.
5. **This blueprint is the only document.** If you need another page, you have already lost the plot.

---

*Ship the lightbulb. Make the light beautiful. Move fast, but don't move ugly.*

*— PJ*
