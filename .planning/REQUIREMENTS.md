# Requirements: Scoreboard Update Project

**Project Slug**: scoreboard-update
**Source PRD**: /home/agent/shipyard-ai/prds/scoreboard-update.md
**Source Decisions**: /home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md
**Generated**: 2026-04-15

---

## Executive Summary

The scoreboard-update project requires building an **automated extraction script** that generates SCOREBOARD.md from filesystem data. The scoreboard will display all 32 shipped projects with:

- **Hybrid format**: Compact summary table (all projects) + Expanded details (top 5 recent projects)
- **Raw brand voice**: "PASS on first try", "BLOCK (X cycles)", "REJECT" — no marketing speak
- **Graceful data handling**: "—" for missing data, never guess or block
- **Target scope**: ~165 lines total (≤200 max)

---

## Total Requirements: 15 MUST + 2 SHOULD + 5 WONT

### MUST (v1 MVP): 13 requirements
- REQ-1 through REQ-15: Core extraction, calculation, and generation

### SHOULD (v1): 2 requirements
- REQ-16: Update STATUS.md
- REQ-19: Commit and push (technically required by PRD, but not blocking for functionality)

### WONT (Cut from v1): 5 features
- Agent count metric (Decision 1.7: vanity metric)
- Daemon log parsing (Decision 1.6: scope creep)
- File enumeration in deliverables (Decision 2: link to directory is enough)
- Expanded details for all 32 projects (Decision 1.2: only top 5)
- Charts/graphs (Decision 2: markdown only)

---

## Key Locked Decisions

From `/home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md`:

| Decision | Winner | Impact |
|----------|--------|--------|
| 1.1: Product Name | Steve (Unanimous) | "Scoreboard" — one word, perfect |
| 1.2: Format Structure | SPLIT (Hybrid) | Summary table (all) + Expanded details (top 5) |
| 1.3: Transparency | Steve | Show ALL projects, failures included |
| 1.4: Brand Voice | Steve (Unanimous) | Raw verdicts: PASS/BLOCK/REJECT, no marketing |
| 1.5: Automation v1 | Elon | Automated extraction, not manual |
| 1.6: Pipeline Duration | Elon | Use round timestamps, defer daemon logs to v2 |
| 1.7: Agent Count | Elon | Cut from v1 (vanity metric) |
| 1.8: Target Length | SPLIT | ~165 lines (40 summary + 125 expanded), max 200 |
| 1.9: Missing Data | Unanimous | Use "—", never guess or block |

---

## Requirements List

### Data Extraction

**REQ-1: Extract Completed Projects List**
- **Priority**: MUST
- **Description**: Read `/home/agent/shipyard-ai/prds/completed/` and parse all project names
- **Source**: PRD Line 14, Decision 2
- **Acceptance**: Successfully lists all .md files, handles empty directory

**REQ-2: Extract QA Verdict**
- **Priority**: MUST
- **Description**: Search round files for QA verdict (PASS/BLOCK/REJECT)
- **Source**: PRD Line 21, Decision 1.4
- **Acceptance**: Finds PASS/BLOCK/REJECT in qa-pass-*.md, returns "—" if not found

**REQ-3: Extract Board Score**
- **Priority**: MUST
- **Description**: Extract board score (0-10) from board-verdict.md
- **Source**: PRD Line 22, Decision 2
- **Acceptance**: Extracts numerical score or "—", validates 0-10 range

**REQ-4: Extract Ship Date**
- **Priority**: MUST
- **Description**: Extract ship date from round file timestamps
- **Source**: PRD Line 19, Decision 2
- **Acceptance**: Returns YYYY-MM-DD format or "—"

**REQ-5: Extract Pipeline Duration**
- **Priority**: MUST
- **Description**: Calculate approximate duration from round file timestamps
- **Source**: Decision 1.6 (NO daemon log parsing)
- **Acceptance**: Returns human-readable duration or "—", does NOT parse daemon logs

**REQ-6: Identify Top 5 Recent Projects**
- **Priority**: MUST
- **Description**: Sort by ship date and select top 5 for expanded details
- **Source**: Decision 1.2
- **Acceptance**: Returns 5 most recent projects, handles <5 total projects

**REQ-7: Extract Deliverables Link**
- **Priority**: MUST
- **Description**: Check if deliverables/{project}/ exists, return link or "—"
- **Source**: PRD Line 23, Decision 2
- **Acceptance**: Returns markdown link or "—", does NOT enumerate files

---

### Script Logic

**REQ-8: Calculate Aggregate Metrics**
- **Priority**: MUST
- **Description**: Count total shipped/failed, calculate success rate, average duration
- **Source**: PRD Lines 32-35, Decision 2
- **Acceptance**: Totals match manual count, success rate = shipped/(shipped+failed)*100

**REQ-9: Handle Missing Data Gracefully**
- **Priority**: MUST
- **Description**: Use "—" for all missing data, never block or guess
- **Source**: Decision 1.9 (Unanimous)
- **Acceptance**: Extraction completes with many missing fields, outputs "—" consistently

**REQ-10: Sort Projects Reverse Chronological**
- **Priority**: MUST
- **Description**: Sort summary table newest → oldest
- **Source**: Decision 2
- **Acceptance**: Most recent project appears first, "—" dates sorted to end

---

### File Generation

**REQ-11: Generate Core Metrics Section**
- **Priority**: MUST
- **Description**: Create header with total shipped, failed, success rate, avg duration
- **Source**: PRD Lines 26-41, Decision 1.1
- **Acceptance**: Header displays all 4 metrics, title is "Shipyard AI — Scoreboard"

**REQ-12: Generate Summary Table (All Projects)**
- **Priority**: MUST
- **Description**: One row per project with 5 columns: Name, Ship Date, QA, Board, Deliverables
- **Source**: Decision 1.2, Decision 2
- **Acceptance**: 32 rows, reverse chronological, markdown table valid, all links work

**REQ-13: Generate Expanded Details (Top 5)**
- **Priority**: MUST
- **Description**: For top 5 projects, generate Context/QA Notes/Board Feedback/Deliverables
- **Source**: Decision 1.2
- **Acceptance**: 5 projects × ~25 lines = ~125 lines, no file enumeration

**REQ-14: Assemble Complete SCOREBOARD.md**
- **Priority**: MUST
- **Description**: Combine all sections into final file, validate length ≤200 lines
- **Source**: Decision 1.8, PRD Lines 26-48
- **Acceptance**: Total ≤200 lines (target ~165), markdown renders correctly

**REQ-15: Implement Raw Brand Voice**
- **Priority**: MUST
- **Description**: Use PASS/BLOCK/REJECT only, no marketing speak
- **Source**: Decision 1.4
- **Acceptance**: No forbidden terms (successfully validated, iterative refinement, TBD, N/A)

**REQ-16: Update STATUS.md**
- **Priority**: SHOULD
- **Description**: Update STATUS.md with total shipped, failed, success rate
- **Source**: PRD Line 52
- **Acceptance**: Numbers match SCOREBOARD.md

---

### Automation & Testing

**REQ-17: Build Extraction Script**
- **Priority**: MUST
- **Description**: Create `/home/agent/shipyard-ai/scripts/update-scoreboard.sh`
- **Source**: Decision 1.5, PRD Lines 150-169
- **Acceptance**: Executable, idempotent, completes in <5 minutes

**REQ-18: Test Extraction Accuracy**
- **Priority**: MUST
- **Description**: Validate extracted data against source files
- **Source**: PRD Lines 61-62
- **Acceptance**: Spot-check 5 projects, verify all 32 projects present

**REQ-19: Commit and Push**
- **Priority**: SHOULD
- **Description**: Commit SCOREBOARD.md, script, STATUS.md to git
- **Source**: PRD Line 64
- **Acceptance**: Files committed, pushed to main, visible on GitHub

---

## What's CUT from v1 (WONT)

| Feature | Reason | Decision |
|---------|--------|----------|
| Agent count metric | Vanity metric, wrong incentives | 1.7 |
| Daemon log parsing | Scope creep (3+ hours work) | 1.6 |
| File enumeration in deliverables | Link to directory is enough | 2 |
| Expanded details for all projects | Only top 5 (per hybrid format) | 1.2, 1.8 |
| Charts/graphs | Markdown only, no visualizations | 2 |

---

## Data Sources

All paths relative to `/home/agent/shipyard-ai/`:

| Source | Path | Purpose |
|--------|------|---------|
| Completed PRDs | `prds/completed/*.md` | Project list (32 files) |
| Round files | `rounds/{project}/` | QA verdicts, board scores, timestamps |
| Board verdicts | `rounds/{project}/board-verdict.md` | Board scores and verdicts |
| QA reports | `rounds/{project}/qa-pass-*.md` | QA verdicts and blockers |
| Essence files | `rounds/{project}/essence.md` | Project context for expanded details |
| Deliverables | `deliverables/{project}/` | Proof of work (existence check only) |
| Failed PRDs | `prds/failed/*.md` | Failed project count (if exists) |

**Confirmed counts** (from codebase research):
- 32 completed projects
- 42 round directories
- 31 deliverables directories

---

## Success Criteria (from PRD Line 59-64)

- [ ] Every project in `prds/completed/` has a row in summary table
- [ ] Stats derived from actual files, not guessed
- [ ] Failed projects listed (visible alongside successes)
- [ ] Committed and pushed to main
- [ ] Total file length ≤200 lines (target ~165)
- [ ] Raw verdict language used (no marketing speak)
- [ ] Missing data marked as "—"
- [ ] Top 5 projects have expanded details
- [ ] Extraction script is executable and idempotent
- [ ] No agent count, daemon logs, or file enumeration (v1 cut)

---

## Risk Summary

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Inconsistent data formats in round files | HIGH | Multiple grep fallback patterns, liberal "—" use |
| Missing pipeline duration data | MEDIUM | Accept "—", don't block on missing timestamps |
| Scope creep to 5,000 lines | MEDIUM | Line count validation (error >200), locked format |

---

## Implementation Notes

### Script Structure (from lighthouse.sh reference)

1. **Configuration**: Hardcoded paths at top
2. **Helper Functions**: One function per extraction (extract_qa_verdict, etc.)
3. **Associative Arrays**: Store data (PROJECT_QA["$project"])
4. **Error Handling**: `2>/dev/null || true` for graceful failures
5. **Markdown Generation**: Build output incrementally
6. **Main Orchestration**: main() calls helpers in sequence

### Brand Voice Enforcement

**Forbidden terms** (automated validation):
- ❌ "Successfully validated with zero blockers"
- ❌ "Required iterative refinement"
- ❌ "Deferred pending strategic alignment"
- ❌ "TBD", "N/A", "Unknown"

**Required terms only**:
- ✅ "PASS on first try"
- ✅ "BLOCK (X cycles)"
- ✅ "REJECT"
- ✅ "—" (for missing data)

### Extraction Patterns (from research)

**QA Verdict patterns**:
```bash
grep -i "VERDICT.*PASS" rounds/{project}/qa-pass-*.md
grep -i "VERDICT.*BLOCK" rounds/{project}/qa-pass-*.md
grep -i "VERDICT.*REJECT" rounds/{project}/*.md
```

**Board Score patterns**:
```bash
grep "Average.*[0-9]\+/10" rounds/{project}/board-verdict.md
grep "Aggregate Score.*[0-9]\+" rounds/{project}/board-verdict.md
```

**Timestamp extraction**:
```bash
stat -c %Y rounds/{project}/*.md  # modification time in epoch
```

---

## Traceability Matrix

| PRD Requirement | Decision | Requirement IDs |
|----------------|----------|-----------------|
| Update SCOREBOARD.md with all projects | 1.3 (Show ALL) | REQ-1, REQ-12 |
| Extract QA verdict | 1.4 (Raw voice) | REQ-2, REQ-15 |
| Extract board score | 2 (Summary table) | REQ-3 |
| Extract ship date | 2 (Summary table) | REQ-4 |
| Extract pipeline duration | 1.6 (Round timestamps) | REQ-5 |
| Extract deliverables | 2 (Summary table) | REQ-7 |
| Calculate aggregate metrics | 2 (Core metrics) | REQ-8 |
| Automated extraction | 1.5 (Elon wins) | REQ-17 |
| Hybrid format | 1.2 (SPLIT) | REQ-11, REQ-12, REQ-13 |
| Top 5 expanded details | 1.2 (Hybrid) | REQ-6, REQ-13 |
| Missing data handling | 1.9 (Unanimous) | REQ-9 |
| Target length ~165 lines | 1.8 (SPLIT) | REQ-14 |
| Update STATUS.md | PRD Line 52 | REQ-16 |
| Commit and push | PRD Line 64 | REQ-19 |

---

**End of Requirements Document**
