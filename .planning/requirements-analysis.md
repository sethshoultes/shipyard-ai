# Requirements Analysis: Scoreboard Update Project

**Analysis Date:** 2026-04-15
**Analyst Role:** Requirements Analyst
**Project:** scoreboard-update (v1)
**Scope:** Extract atomic requirements from PRD and decisions debate

---

## Executive Summary

The scoreboard-update project requires **15 atomic requirements** organized across 4 categories to deliver an automated, honesty-driven scoreboard that reflects all shipped projects with hybrid detail (compact summary + expanded context for top 5).

**Total Requirements:** 15
**MUST (v1):** 13
**SHOULD (v1):** 2
**WONT (v1 cut):** 5

**Key Decisions Locked:**
- ✅ **Automated extraction** (Elon wins Decision 1.5)
- ✅ **Hybrid format:** Summary table (all projects) + Expanded details (top 5 only)
- ✅ **Raw verdicts:** "PASS/BLOCK/REJECT" not marketing speak (Decision 1.4)
- ✅ **Use "—" for missing data**, never guess (Decision 1.4, 1.9)
- ✅ **Target ~165 lines** total output (Decision 1.8)

**Critical Constraint:** v1 scope is **automated extraction + file generation**, NOT manual data entry.

---

## Requirements Summary Table

| ID | Category | Description | Priority | Source |
|:---|:---|:---|:---|:---|
| REQ-1 | Script Logic | Build automated extraction script | MUST | Dec 1.5, PRD Line 150 |
| REQ-2 | Data Extraction | Extract list of completed projects from prds/completed/ | MUST | PRD Line 14, Dec 2 |
| REQ-3 | Data Extraction | Extract QA verdict (PASS/BLOCK/REJECT) from round files | MUST | PRD Line 21, Dec 1.4 |
| REQ-4 | Data Extraction | Extract board score (0-10) from round files | MUST | PRD Line 22, Dec 2 |
| REQ-5 | Data Extraction | Extract ship date for each project | MUST | PRD Line 19, Dec 2 |
| REQ-6 | Data Extraction | Extract pipeline duration from round file timestamps | MUST | Dec 1.6 (with "—" fallback) |
| REQ-7 | Data Extraction | Identify top 5 most recent projects | MUST | Dec 1.2, Dec 2 |
| REQ-8 | Data Extraction | Extract deliverables link/path for each project | MUST | PRD Line 23, Dec 2 |
| REQ-9 | Script Logic | Calculate aggregate metrics (total shipped, failed, success rate) | MUST | PRD Line 32-35, Dec 2 |
| REQ-10 | File Generation | Generate SCOREBOARD.md with core metrics section | MUST | PRD Line 26-41, Dec 2 |
| REQ-11 | File Generation | Generate summary table (all projects, reverse chronological) | MUST | Dec 1.2, Dec 2 |
| REQ-12 | File Generation | Generate expanded details section for top 5 projects | MUST | Dec 1.2, Dec 2 |
| REQ-13 | Documentation | Implement raw brand voice (PASS/BLOCK/REJECT, no marketing) | MUST | Dec 1.4 |
| REQ-14 | Script Logic | Handle missing data gracefully with "—" fallback | MUST | Dec 1.4, 1.9, PRD Line 50 |
| REQ-15 | File Generation | Update STATUS.md with accurate current state counts | SHOULD | PRD Line 52 |
| WONT-1 | Data Extraction | Agent count metric (vanity metric, cut in Dec 1.7) | WONT v1 | Dec 1.7 |
| WONT-2 | Script Logic | Daemon log parsing for precise pipeline duration | WONT v1 | Dec 1.6 |
| WONT-3 | Data Extraction | File enumeration within deliverables/ directory | WONT v1 | Dec 2 |
| WONT-4 | File Generation | Expanded details for all 32 projects (only top 5) | WONT v1 | Dec 1.2, Dec 1.8 |
| WONT-5 | File Generation | Charts/graphs (markdown only, no visualizations) | WONT v1 | Dec 2 |

---

## Detailed Requirements Breakdown

### CATEGORY 1: DATA EXTRACTION

#### REQ-1: Extract Completed Projects List
**ID:** REQ-1
**Category:** Data Extraction
**Priority:** MUST
**Description:** Read the contents of `/home/agent/shipyard-ai/prds/completed/` directory and parse all project names (one per file).
**Acceptance Criteria:**
- [ ] Successfully lists all .md files in prds/completed/
- [ ] Extracts project name from filename (strip extension)
- [ ] Result captures all 32+ currently shipped projects
- [ ] Script handles edge cases (empty directory, missing path)

**Source:** PRD Lines 14, 61 | Decision 2 (Core Metrics)
**Implementation Notes:**
- Use `ls -1 /home/agent/shipyard-ai/prds/completed/` or equivalent
- Parse filenames as project identifiers
- Fallback: if directory empty, return empty list with note

---

#### REQ-2: Extract QA Verdict
**ID:** REQ-2
**Category:** Data Extraction
**Priority:** MUST
**Description:** For each project, search round files for QA verdict. Verdicts are: PASS (on first try), BLOCK (with cycle count), or REJECT.
**Acceptance Criteria:**
- [ ] Script searches `/home/agent/shipyard-ai/rounds/{project}/` for QA verdict keywords
- [ ] Correctly identifies PASS, BLOCK, REJECT status
- [ ] Extracts cycle count if BLOCK verdict (e.g., "BLOCK (3 cycles)")
- [ ] Returns "—" if verdict not found (never guesses)
- [ ] Works with inconsistent markdown formatting across round files

**Source:** PRD Line 21 | Decision 1.4 ("PASS on first try") | Decision 1.9 (graceful missing data)
**Implementation Notes:**
- Pattern match: "PASS", "PASS on first try", "BLOCK", "REJECT"
- Multiple fallback grep patterns due to freeform markdown (Risk 5.1)
- If not found in rounds/, mark "—"

---

#### REQ-3: Extract Board Score
**ID:** REQ-3
**Category:** Data Extraction
**Priority:** MUST
**Description:** For each project, extract board verdict score (0-10 scale) from final verdict files.
**Acceptance Criteria:**
- [ ] Script finds board score in rounds/{project}/ files
- [ ] Extracts numerical value (0-10) or "—" if not found
- [ ] Works with various phrasing (e.g., "score: 8", "board: 8/10", etc.)
- [ ] Never guesses or approximates missing scores

**Source:** PRD Line 22 | Decision 1.3 (Show ALL verdicts) | Decision 2 (Summary Table, "Board Score" column)
**Implementation Notes:**
- Pattern: Look for numeric values in context of board/verdict
- Fallback: "—" if not found
- Range validation: only accept 0-10

---

#### REQ-4: Extract Ship Date
**ID:** REQ-4
**Category:** Data Extraction
**Priority:** MUST
**Description:** For each project, extract the ship date (completion date from rounds or PRD metadata).
**Acceptance Criteria:**
- [ ] Script identifies ship date for each project
- [ ] Format standardized (e.g., YYYY-MM-DD)
- [ ] Uses file creation date or metadata if available
- [ ] Returns "—" if no date found

**Source:** PRD Line 19 | Decision 2 (Summary Table, "Ship Date" column)
**Implementation Notes:**
- Preferred source: `rounds/{project}/` file timestamps
- Fallback: PRD file modification date
- If nothing available: "—"

---

#### REQ-5: Extract Pipeline Duration
**ID:** REQ-5
**Category:** Data Extraction
**Priority:** MUST
**Description:** Calculate approximate pipeline duration from round file timestamps (created_at to final_verdict_at). Do NOT parse daemon logs in v1.
**Acceptance Criteria:**
- [ ] Script calculates time delta between first and last round file
- [ ] Returns duration in readable format (hours/minutes)
- [ ] Returns "—" if insufficient timestamp data
- [ ] Does NOT attempt daemon log parsing (that's v2, Decision 1.6)

**Source:** Decision 1.6 (Use round timestamps, defer daemon parsing to v2) | Risk 5.5
**Implementation Notes:**
- Use timestamp metadata from first and last round files
- Accept approximate calculation (no sub-minute precision required)
- Daemon log parsing is explicitly out of scope per Decision 1.6

---

#### REQ-6: Identify Top 5 Most Recent Projects
**ID:** REQ-6
**Category:** Data Extraction
**Priority:** MUST
**Description:** Sort all projects by ship date (descending) and select the top 5 most recent for expanded detail section.
**Acceptance Criteria:**
- [ ] Script sorts projects by ship date, most recent first
- [ ] Returns exactly 5 projects (or fewer if <5 total projects)
- [ ] Handles missing dates gracefully (projects with "—" sorted to end)
- [ ] Order is consistent and reproducible

**Source:** Decision 1.2 (Hybrid approach: "Top 5 recent projects get expanded details")
**Implementation Notes:**
- Sort by extracted ship date, reverse chronological
- Deterministic ordering for reproducibility

---

#### REQ-7: Extract Deliverables Link
**ID:** REQ-7
**Category:** Data Extraction
**Priority:** MUST
**Description:** For each project, verify or construct path to `/deliverables/{project}/` directory and include as link in scoreboard.
**Acceptance Criteria:**
- [ ] Script confirms deliverables/ directory exists for each project
- [ ] Returns markdown link: `[Link](/deliverables/{project}/)`
- [ ] Returns "—" if deliverables directory does not exist
- [ ] Does NOT enumerate files within deliverables/ (Decision 2: file enumeration is cut)

**Source:** PRD Line 23 | Decision 2 (Summary Table, "Deliverables" column)
**Implementation Notes:**
- Link format: `[Link](/deliverables/{project}/)`
- No file enumeration per Decision 2 (WONT-3)
- Existence check: `test -d /home/agent/shipyard-ai/deliverables/{project}/`

---

### CATEGORY 2: SCRIPT LOGIC

#### REQ-8: Calculate Aggregate Metrics
**ID:** REQ-8
**Category:** Script Logic
**Priority:** MUST
**Description:** Extract all completed and failed projects, then calculate: Total Shipped, Total Failed, Success Rate (%), Average Pipeline Duration.
**Acceptance Criteria:**
- [ ] Script counts files in `prds/completed/` for "Total Shipped"
- [ ] Script counts files in `prds/failed/` for "Total Failed"
- [ ] Calculates success rate: `shipped / (shipped + failed) * 100`
- [ ] Calculates average duration (or "—" if insufficient data)
- [ ] All calculations verified against manual count

**Source:** PRD Lines 32-35 | Decision 2 (Core Metrics)
**Implementation Notes:**
- Total Shipped = count of files in prds/completed/
- Total Failed = count of files in prds/failed/
- Success Rate = shipped / (shipped + failed) * 100
- Avg Duration = average of all extracted durations (exclude "—")

---

#### REQ-9: Handle Missing Data Gracefully
**ID:** REQ-9
**Category:** Script Logic
**Priority:** MUST
**Description:** Implement "—" fallback for all missing/unavailable data. Never block extraction or guess values.
**Acceptance Criteria:**
- [ ] Script outputs "—" for any missing QA verdict, board score, duration, or deliverables
- [ ] No error-blocking on missing data
- [ ] Extraction completes successfully even with many missing fields
- [ ] Missing data documented in script output (warning log)

**Source:** Decision 1.9 (Unanimous: "—" is better than delay, guessing, or blocking) | Decision 1.4 | PRD Line 50
**Implementation Notes:**
- "—" is the default fallback for all optional fields
- Never use placeholders like "TBD", "Unknown", "N/A"
- Log missing fields for v2 data standardization effort

---

#### REQ-10: Sort Projects Reverse Chronological
**ID:** REQ-10
**Category:** Script Logic
**Priority:** MUST
**Description:** Sort all projects in summary table by ship date, most recent first.
**Acceptance Criteria:**
- [ ] Summary table rows ordered newest → oldest
- [ ] Consistent sorting (reproducible output)
- [ ] Projects with "—" dates handled gracefully (sorted to end)

**Source:** Decision 2 (Summary Table: "Reverse chronological (most recent at top)")
**Implementation Notes:**
- Deterministic sort order for CI/CD compatibility

---

### CATEGORY 3: FILE GENERATION

#### REQ-11: Generate SCOREBOARD.md with Core Metrics Section
**ID:** REQ-11
**Category:** File Generation
**Priority:** MUST
**Description:** Create `/home/agent/shipyard-ai/SCOREBOARD.md` with headline section displaying Total Shipped, Total Failed, Success Rate, and Average Duration.
**Acceptance Criteria:**
- [ ] File created at repo root: `SCOREBOARD.md`
- [ ] Header: "# Shipyard AI — Scoreboard" (Decision 1.1 product name)
- [ ] Core metrics section displays all 4 aggregate metrics
- [ ] Format matches PRD Lines 28-35 template
- [ ] File is readable and properly formatted markdown

**Source:** PRD Lines 26-41 | Decision 1.1 (Product name: "Scoreboard")
**Implementation Notes:**
- Template provided in PRD
- Insert calculated metrics from REQ-8

---

#### REQ-12: Generate Summary Table (All Projects)
**ID:** REQ-12
**Category:** File Generation
**Priority:** MUST
**Description:** Generate comprehensive summary table with one row per project. Columns: Project Name (linked), Ship Date, QA Verdict, Board Score, Deliverables (linked).
**Acceptance Criteria:**
- [ ] Table header row present with all 5 columns
- [ ] One row per completed project (32 rows minimum)
- [ ] Project names are markdown links to PRD files
- [ ] Rows sorted reverse chronological (most recent first)
- [ ] Missing data marked with "—" (not blank cells)
- [ ] Markdown table syntax valid (renders correctly on GitHub)

**Source:** Decision 1.2 (Hybrid format: compact summary table), Decision 2 (Summary Table specification)
**Implementation Notes:**
- Table format:
  ```markdown
  | Project | Shipped | QA | Board | Deliverables |
  |---------|---------|-----|-------|-------------|
  | [project-name](/prds/completed/project-name.md) | YYYY-MM-DD | PASS/BLOCK/— | 0-10/— | [Link](/deliverables/{project}/) |
  ```

---

#### REQ-13: Generate Expanded Details Section (Top 5 Projects)
**ID:** REQ-13
**Category:** File Generation
**Priority:** MUST
**Description:** For each of the 5 most recent projects, generate expanded context section with: description, QA notes/blockers, board feedback, deliverables list (bulleted, no file enumeration).
**Acceptance Criteria:**
- [ ] Expanded details section includes exactly top 5 projects (by recency)
- [ ] Each project has subheading with project name
- [ ] Context explains what was built
- [ ] QA Notes include key blockers and iteration count
- [ ] Board Feedback includes score rationale
- [ ] Deliverables listed as markdown bullets (link to directory, no enumeration)
- [ ] Total expanded section is ~125 lines (5 projects × ~25 lines each)

**Source:** Decision 1.2 (Top 5 get expanded details) | Decision 1.8 (~125 lines for detail section)
**Implementation Notes:**
- Extract content from round files (essence.md, QA reports, board reviews)
- Keep each project section to ~25 lines
- No full file enumeration (Decision 2: file enumeration is cut)

---

#### REQ-14: Generate SCOREBOARD.md with Complete Structure
**ID:** REQ-14
**Category:** File Generation
**Priority:** MUST
**Description:** Assemble complete SCOREBOARD.md with all sections: Header, Core Metrics, Summary Table, Expanded Details, closing notes. Total target ~165 lines.
**Acceptance Criteria:**
- [ ] SCOREBOARD.md combines all required sections
- [ ] Total file length ≤200 lines (target ~165 per Decision 1.8)
- [ ] Markdown formatting valid (renders on GitHub)
- [ ] File committed to repo root
- [ ] No section exceeds intended allocation (40 + 125 lines)

**Source:** Decision 1.8 (Target ~165 lines total) | PRD Lines 26-48
**Implementation Notes:**
- Summary: ~40 lines (table + metrics)
- Expanded details: ~125 lines
- Headings/metadata: margin for formatting

---

#### REQ-15: Implement Raw Brand Voice
**ID:** REQ-15
**Category:** File Generation
**Priority:** MUST
**Description:** Use raw engineering verdicts throughout scoreboard: "PASS on first try", "BLOCK (X cycles)", "REJECT" — never corporate marketing speak.
**Acceptance Criteria:**
- [ ] All QA verdicts use exact decision language (PASS / BLOCK / REJECT)
- [ ] Verdicts are not softened (e.g., no "Successfully validated with zero blockers")
- [ ] Missing data uses "—" not "N/A", "TBD", or other variants
- [ ] Language is direct, technical, unambiguous
- [ ] No marketing-style phrasing in verdicts or descriptions

**Source:** Decision 1.4 ("PASS on first try" not corporate speak) | PRD Line 50 (no guessing)
**Implementation Notes:**
- Strict vocabulary enforcement in generation logic
- Automated voice validation (grep for forbidden terms)

---

#### REQ-16: Update STATUS.md with Accurate Counts
**ID:** REQ-16
**Category:** File Generation
**Priority:** SHOULD
**Description:** Update STATUS.md to reflect current idle state with accurate project counts (total shipped, failed, success rate).
**Acceptance Criteria:**
- [ ] STATUS.md updated with total shipped count
- [ ] STATUS.md updated with total failed count
- [ ] STATUS.md updated with success rate percentage
- [ ] Numbers match SCOREBOARD.md metrics

**Source:** PRD Line 52
**Implementation Notes:**
- Reuse calculated metrics from REQ-8
- May be combined with SCOREBOARD.md generation

---

### CATEGORY 4: AUTOMATION & PROCESS

#### REQ-17: Build Extraction Script
**ID:** REQ-17
**Category:** Script Logic
**Priority:** MUST
**Description:** Create automated extraction script (shell or Python) that orchestrates all data extraction and file generation. Script must be executable and idempotent.
**Acceptance Criteria:**
- [ ] Script file created: `/home/agent/shipyard-ai/scripts/update-scoreboard.sh` (or .py)
- [ ] Script is executable: `chmod +x scripts/update-scoreboard.sh`
- [ ] Manual execution generates current SCOREBOARD.md
- [ ] Script handles all 15 requirements above
- [ ] Script completes in <5 minutes
- [ ] Idempotent: running twice produces identical output
- [ ] Error handling: graceful fallback to "—" for all missing data

**Source:** Decision 1.5 (Automation from day 1, Elon wins) | PRD Lines 150-169
**Implementation Notes:**
- Responsibilities per PRD Line 152-163:
  1. `ls prds/completed/` → parse project names
  2. For each project, check `rounds/{project}/` exists
  3. Grep/parse round files for verdicts, scores, timestamps
  4. Generate markdown with all sections
  5. Write to `/SCOREBOARD.md`
- v2 consideration: Git hook or CI/CD trigger

---

#### REQ-18: Test Extraction on Current Dataset
**ID:** REQ-18
**Category:** Script Logic
**Priority:** MUST
**Description:** Run extraction script on current 32+ projects and validate accuracy of extracted data.
**Acceptance Criteria:**
- [ ] Script processes all 32 completed projects successfully
- [ ] Top 5 recent projects identified correctly
- [ ] Aggregate metrics verified against manual count
- [ ] Spot-check 5 random projects for data accuracy
- [ ] No projects missing from summary table
- [ ] No BLOCK verdicts attributed wrong cycle counts

**Source:** PRD Lines 61-62 (Success criteria)
**Implementation Notes:**
- Manual spot-check against source files
- Verify 32-project minimum threshold

---

#### REQ-19: Commit and Push SCOREBOARD.md
**ID:** REQ-19
**Category:** Documentation
**Priority:** SHOULD
**Description:** Commit generated SCOREBOARD.md with extraction script to repository and push to main branch.
**Acceptance Criteria:**
- [ ] SCOREBOARD.md committed to repo
- [ ] Commit message documents what was generated
- [ ] Changes pushed to origin/main
- [ ] File visible on GitHub

**Source:** PRD Line 64 ("Committed and pushed")
**Implementation Notes:**
- Part of completion checklist

---

---

## Traceability Matrix

### PRD → Requirements Mapping

| PRD Section | Line(s) | Requirement(s) | Notes |
|:---|:---|:---|:---|
| Problem Statement | 5-7 | REQ-1, REQ-8 | Every shipped project needs metrics |
| Data Extraction Requirements | 11-24 | REQ-1–7, REQ-9 | What data to extract, where from |
| Stats to Extract | 19-24 | REQ-2–7 | QA verdict, board score, ship date, duration, deliverables |
| Agent Count | 24 | WONT-1 | Explicitly cut (Decision 1.7) |
| SCOREBOARD.md Template | 26-41 | REQ-11–14 | File format, sections, table structure |
| Files to Modify | 54-57 | REQ-14, REQ-16 | SCOREBOARD.md (primary), STATUS.md (secondary) |
| Success Criteria | 59-64 | REQ-12, REQ-14, REQ-19 | Completeness, accuracy, commitment |

---

### Decision → Requirements Mapping

| Decision # | Topic | Winner | Requirement(s) |
|:---|:---|:---|:---|
| 1.2 | Format Structure | SPLIT (Hybrid) | REQ-11, REQ-13 (compact + expanded) |
| 1.3 | Transparency | Steve (Show ALL) | REQ-12 (include failures) |
| 1.4 | Brand Voice | Steve (Raw verdicts) | REQ-15 (PASS/BLOCK/REJECT) |
| 1.5 | Automation v1 | Elon (Automate) | REQ-17 (extraction script, not manual) |
| 1.6 | Pipeline Duration | Elon (Use timestamps) | REQ-5 (round file timestamps, not daemon logs) |
| 1.7 | Agent Count | Elon (Cut) | WONT-1 (not in v1) |
| 1.8 | Target Length | SPLIT (165 lines) | REQ-14 (scope constraint) |
| 1.9 | Missing Data | Unanimous ("—") | REQ-9 (never guess) |
| 2 | MVP Features | Unanimous | REQ-1–16 (core feature set) |

---

## Cut/Deferred Requirements (Out of V1 Scope)

| WONT ID | Feature | Reason | Deferred To | Decision |
|:---|:---|:---|:---|:---|
| WONT-1 | Agent Count Metric | Vanity metric, wrong incentives | v2 / internal logs | 1.7 |
| WONT-2 | Daemon Log Parsing | Scope creep (3+ hours work) | v2 | 1.6 |
| WONT-3 | File Enumeration in Deliverables | "Link to directory is enough" | v2 | 2 |
| WONT-4 | Expanded Details for All Projects | Only top 5 get detail per decision | v2+ | 1.2, 1.8 |
| WONT-5 | Charts/Graphs | Markdown only, no visualizations | v3+ (if needed) | 2 |

**Rationale:** These features are valuable but exceed v1 scope (165-line target, 1 session budget). v2 can implement after v1 ships and extraction pain points are known.

---

## Risk/Mitigation Summary

| Risk | Likelihood | Impact | Mitigation | Requirement |
|:---|:---|:---|:---|:---|
| Inconsistent data formats in round files | HIGH | MEDIUM | Multiple grep patterns, liberal "—" use | REQ-9 |
| Forgotten manual updates (if manual) | MEDIUM | LOW | Automated extraction eliminates this | REQ-17 |
| Success rate drops below 80% | LOW | HIGH | Add context section (monitor quarterly) | Out of scope v1 |
| Scope creep to 5,000 lines | MEDIUM | HIGH | Lock v1 format, enforce 165-line budget | REQ-14 |
| Missing pipeline duration data | MEDIUM | LOW | Accept "—", don't block v1 | REQ-5, REQ-9 |

---

## Implementation Sequence (Recommended Order)

1. **Build Extraction Script** (REQ-17)
   - Parse completed/ and rounds/ directories
   - Implement all extraction logic (REQ-1–7, REQ-9)
   - Test on current dataset (REQ-18)

2. **Calculate Aggregate Metrics** (REQ-8, REQ-10)
   - Count shipped/failed projects
   - Calculate success rate and average duration
   - Sort projects reverse chronological

3. **Generate File Sections** (REQ-11–16)
   - Core Metrics section
   - Summary Table (all projects)
   - Expanded Details (top 5)
   - Implement raw brand voice (REQ-15)

4. **Validation & Finalization**
   - Spot-check extracted data accuracy
   - Verify markdown rendering on GitHub
   - Commit and push (REQ-19)

5. **Update STATUS.md** (REQ-16, SHOULD priority)

---

## Success Criteria Verification Checklist

**Completion Requirements (from PRD Line 59-64):**
- [ ] Every project in `prds/completed/` has a row in the summary table
- [ ] Stats are derived from actual files, not guessed
- [ ] Failed projects listed (in summary, visible alongside successes)
- [ ] SCOREBOARD.md committed and pushed to main
- [ ] Total file length ≤200 lines (target ~165)
- [ ] Raw verdict language used throughout (no marketing speak)
- [ ] Missing data marked as "—" not left blank or guessed
- [ ] Top 5 projects have expanded detail sections
- [ ] Extraction script is executable and idempotent
- [ ] No agent count, daemon log parsing, or file enumeration (v1 cut)

---

## Appendix: Key Terminology

**PASS on first try:** QA verdict indicating the project passed quality gates in the first review cycle.

**BLOCK (X cycles):** QA verdict indicating the project required X review cycles to resolve blocking issues.

**REJECT:** QA verdict indicating the project was rejected and did not ship.

**Board Score:** Numerical rating (0-10) assigned by board review based on strategic fit, execution quality, delivery date.

**Deliverables:** Proof of work files/artifacts stored in `/deliverables/{project}/` directory.

**Top 5 Recent Projects:** The 5 most recently shipped projects (by ship date), eligible for expanded detail section.

**"—":** Placeholder for missing/unavailable data. Never replaced with guesses, approximations, or "TBD".

**Aggregate Metrics:** Summary statistics: Total Shipped, Total Failed, Success Rate (%), Average Pipeline Duration.

---

## Document Metadata

**Document:** Requirements Analysis
**Version:** 1.0
**Generated:** 2026-04-15
**Scope:** V1 MVP (Automated extraction, hybrid format, ~165 lines)
**Next Review:** Post-v1 shipping (v2 planning)
