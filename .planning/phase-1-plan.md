# Phase 1 Plan — Scoreboard Update (Automated Extraction)

**Generated**: 2026-04-15
**Requirements**: /home/agent/shipyard-ai/prds/scoreboard-update.md + /home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md
**Total Tasks**: 7
**Waves**: 3

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Priority |
|-------------|---------|------|----------|
| REQ-1: Extract completed projects list | phase-1-task-1 | 1 | MUST |
| REQ-2–7: Extract QA, board, dates, duration, deliverables | phase-1-task-1, phase-1-task-2 | 1 | MUST |
| REQ-8: Calculate aggregate metrics | phase-1-task-2 | 1 | MUST |
| REQ-9: Handle missing data with "—" | phase-1-task-1, phase-1-task-2 | 1 | MUST |
| REQ-10: Sort projects reverse chronological | phase-1-task-2 | 1 | MUST |
| REQ-11: Generate core metrics section | phase-1-task-3 | 2 | MUST |
| REQ-12: Generate summary table | phase-1-task-3 | 2 | MUST |
| REQ-13: Generate expanded details for top 5 | phase-1-task-4 | 2 | MUST |
| REQ-14: Assemble complete SCOREBOARD.md | phase-1-task-5 | 3 | MUST |
| REQ-15: Implement raw brand voice | phase-1-task-3, phase-1-task-4 | 2 | MUST |
| REQ-16: Update STATUS.md | phase-1-task-6 | 3 | SHOULD |
| REQ-17: Build extraction script | phase-1-task-1, phase-1-task-2 | 1 | MUST |
| REQ-18: Test extraction accuracy | phase-1-task-5 | 3 | MUST |
| REQ-19: Commit and push | phase-1-task-7 | 3 | SHOULD |

---

## Wave Execution Order

### Wave 1 (Parallel) — Data Extraction & Script Foundation

**Focus**: Build the extraction engine and collect raw data from filesystem

<task-plan id="phase-1-task-1" wave="1">
  <title>Build Data Extraction Script Core</title>
  <requirement>REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-7, REQ-9, REQ-17: Extract all project data from prds/completed/ and rounds/ directories with graceful "—" fallback for missing data</requirement>
  <description>
    Create the automated extraction script that reads the filesystem and extracts all required data points for each project:
    - Project names from prds/completed/
    - QA verdicts (PASS/BLOCK/REJECT) from round files
    - Board scores (0-10) from board-verdict.md files
    - Ship dates from round file timestamps
    - Pipeline duration (approximate from round file timestamps)
    - Deliverables directory existence checks

    Implements graceful fallback: any missing data returns "—" (never guesses, never blocks).

    This task creates the foundation extraction script at /home/agent/shipyard-ai/scripts/update-scoreboard.sh with all core data extraction logic.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/completed/" reason="Source directory for all shipped project PRDs — enumerate all .md files to get project list" />
    <file path="/home/agent/shipyard-ai/rounds/" reason="Contains project-specific round directories with QA verdicts, board scores, and timestamps" />
    <file path="/home/agent/shipyard-ai/deliverables/" reason="Contains project deliverable artifacts — verify existence for each project" />
    <file path="/home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md" reason="Locked decisions defining extraction rules: use '—' for missing data (Decision 1.9), no daemon log parsing (Decision 1.6), raw verdicts only (Decision 1.4)" />
    <file path="/home/agent/shipyard-ai/scripts/lighthouse.sh" reason="Reference example for script structure, helper functions, associative arrays, and error handling patterns" />
    <file path="/home/agent/shipyard-ai/.planning/requirements-analysis.md" reason="Detailed requirements REQ-1 through REQ-9 with acceptance criteria and implementation notes" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/scripts/lighthouse.sh to understand existing script patterns (helper functions, associative arrays, error handling with 2>/dev/null || true)</step>
    <step order="2">Create /home/agent/shipyard-ai/scripts/update-scoreboard.sh with executable permissions (chmod +x)</step>
    <step order="3">Implement function extract_completed_projects() that lists all .md files in prds/completed/ and returns project names (strip .md extension)</step>
    <step order="4">Implement function extract_qa_verdict(project) that searches rounds/{project}/ for QA verdict files (qa-pass-*.md, final-verdict.md) and greps for PASS/BLOCK/REJECT keywords. Return "—" if not found.</step>
    <step order="5">Implement function extract_board_score(project) that searches rounds/{project}/board-verdict.md for aggregate/average score patterns (e.g., "Average: 5.5/10", "Aggregate Score: 3.75/10"). Extract numerical value 0-10, return "—" if not found.</step>
    <step order="6">Implement function extract_ship_date(project) that uses stat command to get modification date of newest file in rounds/{project}/, format as YYYY-MM-DD, return "—" if directory doesn't exist</step>
    <step order="7">Implement function extract_pipeline_duration(project) that calculates time delta between oldest and newest files in rounds/{project}/ (use stat mtime). Return human-readable format (e.g., "3.2 hours", "2 days") or "—" if insufficient data. DO NOT parse daemon logs (per Decision 1.6).</step>
    <step order="8">Implement function check_deliverables(project) that tests if /home/agent/shipyard-ai/deliverables/{project}/ directory exists. Return markdown link "[Link](/deliverables/{project}/)" or "—".</step>
    <step order="9">Add error handling to all functions: use 2>/dev/null for file operations, default to "—" on any error, never exit on missing data</step>
    <step order="10">Create main extraction loop that iterates through all completed projects and populates associative arrays with extracted data: PROJECT_QA["$project"], PROJECT_BOARD["$project"], PROJECT_DATE["$project"], PROJECT_DURATION["$project"], PROJECT_DELIVERABLES["$project"]</step>
    <step order="11">Add logging/debugging output (to stderr) showing extraction progress and any missing data warnings</step>
    <step order="12">Test extraction on 3 sample projects (e.g., shipyard-client-portal, blog-infrastructure, adminpulse) and verify output matches manual inspection of their round files</step>
  </steps>

  <verification>
    <check type="manual">Run ./scripts/update-scoreboard.sh and verify it outputs debug logs showing successful extraction for all 32 projects</check>
    <check type="manual">Spot-check 3 projects: manually inspect their rounds/ files and verify extracted QA verdict, board score, and ship date match reality</check>
    <check type="manual">Verify projects with missing data (e.g., no board-verdict.md) correctly output "—" instead of errors or empty values</check>
    <check type="manual">Confirm script completes in under 5 minutes for 32 projects</check>
  </verification>

  <dependencies>
    <!-- Independent task (wave 1) -->
  </dependencies>

  <commit-message>feat(scripts): add data extraction engine for scoreboard

Build automated extraction script with functions to extract:
- Project names from prds/completed/
- QA verdicts (PASS/BLOCK/REJECT) from round files
- Board scores (0-10) from board-verdict.md
- Ship dates and pipeline duration from timestamps
- Deliverables directory existence

Implements graceful "—" fallback for all missing data per Decision 1.9.
No daemon log parsing (Decision 1.6).

Addresses: REQ-1 through REQ-7, REQ-9, REQ-17

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>Implement Aggregate Metrics & Sorting Logic</title>
  <requirement>REQ-8, REQ-6, REQ-10: Calculate total shipped/failed counts, success rate, average duration, identify top 5 recent projects, and sort all projects reverse chronological</requirement>
  <description>
    Extend the extraction script with calculation functions that process the raw extracted data:
    - Count total shipped projects (files in prds/completed/)
    - Count total failed projects (files in prds/failed/ if exists)
    - Calculate success rate percentage
    - Calculate average pipeline duration (excluding "—" values)
    - Sort all projects by ship date (reverse chronological)
    - Identify top 5 most recent projects for expanded details

    These functions consume the associative arrays populated by phase-1-task-1 and produce aggregate statistics and sorted project lists for markdown generation.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/scripts/update-scoreboard.sh" reason="Add calculation functions to existing extraction script created in phase-1-task-1" />
    <file path="/home/agent/shipyard-ai/prds/completed/" reason="Count files for total shipped metric" />
    <file path="/home/agent/shipyard-ai/prds/failed/" reason="Count files for total failed metric (if directory exists)" />
    <file path="/home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md" reason="Decision 1.2 specifies top 5 recent projects get expanded details; Decision 2 specifies reverse chronological sorting" />
    <file path="/home/agent/shipyard-ai/.planning/requirements-analysis.md" reason="REQ-8, REQ-6, REQ-10 with detailed acceptance criteria for calculations" />
  </context>

  <steps>
    <step order="1">Implement function calculate_total_shipped() that counts .md files in prds/completed/ directory</step>
    <step order="2">Implement function calculate_total_failed() that counts .md files in prds/failed/ directory if it exists, returns 0 if directory doesn't exist</step>
    <step order="3">Implement function calculate_success_rate() that computes: shipped / (shipped + failed) * 100, returns percentage with 1 decimal place (e.g., "94.1%"), handles division by zero</step>
    <step order="4">Implement function calculate_average_duration() that averages all PROJECT_DURATION values that are not "—", converts to common unit (hours), returns "—" if insufficient data (less than 3 projects with duration)</step>
    <step order="5">Implement function sort_projects_by_date() that sorts all projects by PROJECT_DATE in reverse chronological order (newest first), handles "—" dates by sorting them to end</step>
    <step order="6">Implement function identify_top_5_recent() that takes sorted project list and returns first 5 project names (or fewer if less than 5 total projects)</step>
    <step order="7">Create global variables to store calculated metrics: TOTAL_SHIPPED, TOTAL_FAILED, SUCCESS_RATE, AVG_DURATION, SORTED_PROJECTS (array), TOP_5_PROJECTS (array)</step>
    <step order="8">Add function calls in main script flow: after extraction loop completes, call all calculation functions and populate global variables</step>
    <step order="9">Add debug output showing calculated aggregate metrics and top 5 project names</step>
    <step order="10">Test calculations: verify totals match manual count of prds/completed/ and prds/failed/, verify success rate calculation, verify top 5 projects are actually the most recent by date</step>
  </steps>

  <verification>
    <check type="manual">Run script and verify TOTAL_SHIPPED matches manual count of files in prds/completed/ (should be 32)</check>
    <check type="manual">Verify SUCCESS_RATE calculation: manually count failed projects, compute expected percentage, compare to script output</check>
    <check type="manual">Verify TOP_5_PROJECTS list contains the 5 most recently shipped projects by checking their ship dates</check>
    <check type="manual">Verify projects with "—" dates are excluded from top 5 or sorted to end of SORTED_PROJECTS list</check>
  </verification>

  <dependencies>
    <!-- Independent task (wave 1) - can run in parallel with phase-1-task-1, though logically builds on it -->
  </dependencies>

  <commit-message>feat(scripts): add aggregate metrics and sorting logic

Implement calculation functions for scoreboard statistics:
- Total shipped/failed project counts
- Success rate percentage
- Average pipeline duration
- Top 5 most recent projects identification
- Reverse chronological sorting

All calculations handle missing data ("—") gracefully.

Addresses: REQ-6, REQ-8, REQ-10

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 2 (Parallel, after Wave 1) — Markdown Generation

**Focus**: Generate markdown sections using extracted and calculated data

<task-plan id="phase-1-task-3" wave="2">
  <title>Generate Core Metrics & Summary Table Sections</title>
  <requirement>REQ-11, REQ-12, REQ-15: Generate SCOREBOARD.md header with aggregate metrics and summary table (all projects, 5 columns) using raw brand voice</requirement>
  <description>
    Build markdown generation functions for the first two sections of SCOREBOARD.md:

    1. Header section with agency branding and core metrics (Total Shipped, Total Failed, Success Rate, Average Duration)
    2. Summary table with all projects (one row per project, 5 columns: Project Name linked, Ship Date, QA Verdict, Board Score, Deliverables linked)

    Implements raw brand voice per Decision 1.4: use exact verdicts "PASS on first try", "BLOCK (X cycles)", "REJECT" — no marketing speak. All missing data displayed as "—".

    Target: ~40 lines for this section (32 project rows + headers + metrics).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/scripts/update-scoreboard.sh" reason="Add markdown generation functions to script created in wave 1" />
    <file path="/home/agent/shipyard-ai/prds/scoreboard-update.md" reason="PRD lines 26-48 provide template for SCOREBOARD.md structure and table format" />
    <file path="/home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md" reason="Decision 1.4 defines raw brand voice requirements; Decision 1.1 defines product name 'Scoreboard'; Decision 2 defines 5-column summary table structure" />
    <file path="/home/agent/shipyard-ai/SCOREBOARD.md" reason="Existing scoreboard file (may have old content) — will be overwritten with new generated content" />
    <file path="/home/agent/shipyard-ai/.planning/requirements-analysis.md" reason="REQ-11, REQ-12, REQ-15 with acceptance criteria for markdown format and brand voice" />
  </context>

  <steps>
    <step order="1">Implement function generate_header() that outputs markdown with title "# Shipyard AI — Scoreboard" (per Decision 1.1) and agency metadata</step>
    <step order="2">Implement function generate_core_metrics() that outputs bulleted list or table showing: Total Shipped (from TOTAL_SHIPPED), Total Failed (from TOTAL_FAILED), Success Rate (from SUCCESS_RATE), Average Pipeline Duration (from AVG_DURATION or "—")</step>
    <step order="3">Implement function generate_summary_table_header() that outputs markdown table header with 5 columns: "| Project | Shipped | QA | Board | Deliverables |" plus separator row</step>
    <step order="4">Implement function generate_summary_table_row(project) that creates one table row with: project name as markdown link to prds/completed/{project}.md, ship date (PROJECT_DATE), QA verdict (PROJECT_QA with raw language), board score (PROJECT_BOARD), deliverables link (PROJECT_DELIVERABLES)</step>
    <step order="5">Ensure QA verdict formatting follows Decision 1.4 brand voice: output exactly "PASS on first try", "BLOCK (X cycles)", "REJECT", or "—" — validate no marketing phrases like "Successfully validated"</step>
    <step order="6">Implement function generate_summary_table() that iterates through SORTED_PROJECTS array (reverse chronological order) and calls generate_summary_table_row() for each project</step>
    <step order="7">Create function generate_metrics_and_summary_section() that combines header + core metrics + summary table into single markdown block</step>
    <step order="8">Add output redirection to write this section to temporary file or accumulate in variable for final SCOREBOARD.md assembly</step>
    <step order="9">Test output: verify markdown table syntax is valid (correct number of pipes, proper alignment), verify all 32 projects appear as rows, verify sorting is newest-first</step>
    <step order="10">Validate brand voice: grep output for forbidden marketing terms ("successfully validated", "iterative refinement", "strategic alignment") — script should error if found</step>
  </steps>

  <verification>
    <check type="manual">Run script and inspect generated markdown — verify table renders correctly in GitHub markdown preview</check>
    <check type="manual">Count rows in summary table: should be 32 (one per completed project)</check>
    <check type="manual">Verify QA column uses only: "PASS on first try", "BLOCK (X cycles)", "REJECT", or "—" (no other variants)</check>
    <check type="manual">Verify board scores are in range 0-10 or "—", no other values</check>
    <check type="manual">Verify all project links point to /prds/completed/{project}.md format</check>
    <check type="manual">Verify deliverables links point to /deliverables/{project}/ format or show "—"</check>
    <check type="manual">Verify sorting: first row is most recent project by ship date</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires PROJECT_* associative arrays populated with extracted data" />
    <depends-on task-id="phase-1-task-2" reason="Requires SORTED_PROJECTS array and calculated aggregate metrics (TOTAL_SHIPPED, SUCCESS_RATE, etc.)" />
  </dependencies>

  <commit-message>feat(scripts): generate core metrics and summary table sections

Add markdown generation functions for:
- Header with agency branding and "Scoreboard" title (Decision 1.1)
- Core metrics: total shipped, failed, success rate, avg duration
- Summary table: all 32 projects with 5 columns (name, date, QA, board, deliverables)

Implements raw brand voice (Decision 1.4): PASS/BLOCK/REJECT only, no marketing speak.
Reverse chronological sorting per Decision 2.

Addresses: REQ-11, REQ-12, REQ-15

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-4" wave="2">
  <title>Generate Expanded Details Section (Top 5 Projects)</title>
  <requirement>REQ-13, REQ-15: Generate expanded context section for top 5 most recent projects with QA notes, board feedback, and deliverables list using raw brand voice</requirement>
  <description>
    Build markdown generation for the expanded details section that provides deep context on the 5 most recent projects. For each of the top 5 projects, generate:
    - Project name as H2 heading
    - Context: What was built (extract from essence.md or PRD)
    - QA Notes: Key blockers, iteration count, final verdict (extract from qa-pass-*.md files)
    - Board Feedback: Score rationale, strategic notes (extract from board-verdict.md)
    - Deliverables: Bulleted list with link to deliverables/ directory (no file enumeration per Decision 2)

    Maintains raw brand voice throughout. Target: ~25 lines per project × 5 projects = ~125 lines total for this section.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/scripts/update-scoreboard.sh" reason="Add expanded details generation functions to script" />
    <file path="/home/agent/shipyard-ai/rounds/" reason="Source for essence.md, qa-pass-*.md, board-verdict.md files to extract expanded context" />
    <file path="/home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md" reason="Decision 1.2 specifies top 5 projects get expanded details (~25 lines each); Decision 2 specifies no file enumeration in deliverables" />
    <file path="/home/agent/shipyard-ai/.planning/requirements-analysis.md" reason="REQ-13 with detailed acceptance criteria for expanded details structure and content" />
  </context>

  <steps>
    <step order="1">Implement function extract_project_context(project) that reads rounds/{project}/essence.md and extracts 1-2 sentence summary of what was built, fallback to reading PRD if essence.md doesn't exist, return "—" if neither available</step>
    <step order="2">Implement function extract_qa_notes(project) that reads rounds/{project}/qa-pass-*.md files and extracts: (a) key blockers mentioned, (b) number of BLOCK cycles if any, (c) final verdict with reasoning. Return 2-4 bullet points or "—" if no QA files found.</step>
    <step order="3">Implement function extract_board_feedback(project) that reads rounds/{project}/board-verdict.md and extracts: (a) overall verdict (HOLD/PROCEED/REJECT), (b) aggregate score, (c) 1-2 key concerns or highlights from board members. Return 2-3 bullet points or "—" if no board verdict found.</step>
    <step order="4">Implement function extract_deliverables_summary(project) that outputs single bullet: "- [View deliverables](/deliverables/{project}/)" if directory exists, or "- No deliverables directory" if not. DO NOT enumerate files (per Decision 2, WONT-3).</step>
    <step order="5">Implement function generate_expanded_detail(project) that combines: H2 heading with project name, "Context:" section with extract_project_context() output, "QA Notes:" section with extract_qa_notes() output, "Board Feedback:" section with extract_board_feedback() output, "Deliverables:" section with extract_deliverables_summary() output</step>
    <step order="6">Ensure all extracted text maintains raw brand voice: preserve original PASS/BLOCK/REJECT language from QA files, preserve HOLD/PROCEED/REJECT from board files, no marketing sanitization</step>
    <step order="7">Implement function generate_expanded_details_section() that iterates through TOP_5_PROJECTS array and calls generate_expanded_detail() for each, with H1 heading "## Expanded Details (Recent Projects)" at top</step>
    <step order="8">Add line count estimation: each project detail should target ~25 lines; log warning if any project exceeds 30 lines (indicates too verbose extraction)</step>
    <step order="9">Test on actual top 5 projects: verify essence.md, QA files, board-verdict.md are parsed correctly and output makes sense</step>
    <step order="10">Validate no file enumeration: grep output for patterns like "deliverables/{project}/file.md" (should not exist, only directory links allowed)</step>
  </steps>

  <verification>
    <check type="manual">Run script and verify expanded details section contains exactly 5 project subsections (or fewer if less than 5 total projects)</check>
    <check type="manual">Verify each project subsection has all 4 components: Context, QA Notes, Board Feedback, Deliverables</check>
    <check type="manual">Verify total line count for expanded details section is approximately 125 lines (5 projects × ~25 lines)</check>
    <check type="manual">Verify no individual project subsection exceeds 30 lines</check>
    <check type="manual">Verify deliverables section only links to directory, does not enumerate individual files</check>
    <check type="manual">Spot-check 2 projects: manually read their round files and verify extracted context/QA/board feedback is accurate</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Requires TOP_5_PROJECTS array with identified top 5 recent projects" />
  </dependencies>

  <commit-message>feat(scripts): generate expanded details for top 5 projects

Add markdown generation for expanded context section with:
- Project context from essence.md
- QA notes and blockers from qa-pass-*.md files
- Board feedback and scores from board-verdict.md
- Deliverables directory link (no file enumeration)

Covers top 5 most recent projects per Decision 1.2.
Maintains raw brand voice throughout (Decision 1.4).
Target: ~25 lines per project, ~125 lines total.

Addresses: REQ-13, REQ-15

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 3 (After Wave 2) — Assembly, Validation & Finalization

**Focus**: Combine all sections, validate output, update related files, commit

<task-plan id="phase-1-task-5" wave="3">
  <title>Assemble Complete SCOREBOARD.md & Validate</title>
  <requirement>REQ-14, REQ-18: Combine all markdown sections into final SCOREBOARD.md file, validate formatting and data accuracy, ensure total length ≤200 lines (target ~165)</requirement>
  <description>
    Create the main orchestration function that assembles the complete SCOREBOARD.md file by combining:
    1. Header + Core Metrics section (from phase-1-task-3)
    2. Summary Table section (from phase-1-task-3)
    3. Expanded Details section (from phase-1-task-4)
    4. Closing metadata/notes if needed

    Write the assembled content to /home/agent/shipyard-ai/SCOREBOARD.md (overwrite existing file).

    Validate the output:
    - Total line count ≤200 lines (target ~165 per Decision 1.8)
    - Markdown syntax valid (renders correctly on GitHub)
    - All data accurate (spot-check 5 random projects)
    - No projects missing from summary table
    - Brand voice compliance (no marketing speak)

    This task represents the final output generation and quality validation before commit.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/scripts/update-scoreboard.sh" reason="Add main assembly and validation functions to complete the script" />
    <file path="/home/agent/shipyard-ai/SCOREBOARD.md" reason="Target output file — will be overwritten with newly generated content" />
    <file path="/home/agent/shipyard-ai/rounds/scoreboard-update/decisions.md" reason="Decision 1.8 specifies target length ~165 lines (max 200); Decision 1.9 requires validation of no guessed data" />
    <file path="/home/agent/shipyard-ai/.planning/requirements-analysis.md" reason="REQ-14, REQ-18 with acceptance criteria for final assembly and validation" />
  </context>

  <steps>
    <step order="1">Implement function assemble_scoreboard() that combines output from: generate_metrics_and_summary_section() + generate_expanded_details_section() into single markdown string</step>
    <step order="2">Add optional footer section with metadata: generation timestamp, script version, link to update instructions</step>
    <step order="3">Write assembled markdown to /home/agent/shipyard-ai/SCOREBOARD.md using cat or echo redirection (overwrite mode)</step>
    <step order="4">Implement function validate_line_count() that counts total lines in SCOREBOARD.md, warns if exceeds 200, errors if exceeds 250</step>
    <step order="5">Implement function validate_markdown_syntax() that checks for: balanced table pipes, no broken links (all /prds/completed/{project}.md files exist), no empty required sections</step>
    <step order="6">Implement function validate_brand_voice() that greps SCOREBOARD.md for forbidden marketing terms: "successfully validated", "iterative refinement", "strategic alignment", "TBD", "N/A", "Unknown" — error if any found (should be "PASS"/"BLOCK"/"REJECT"/"—" only)</step>
    <step order="7">Implement function spot_check_accuracy() that randomly selects 5 projects and compares SCOREBOARD.md data against source files (rounds/{project}/). Check: QA verdict matches, board score matches, ship date reasonable.</step>
    <step order="8">Create main() function that orchestrates full script execution: extract_all_data() → calculate_metrics() → generate_markdown() → assemble_scoreboard() → validate_all() → output success message</step>
    <step order="9">Add comprehensive error handling: if any validation fails, print detailed error report and exit 1 (non-zero). If all validations pass, print success summary with stats (projects processed, line count, missing data count)</step>
    <step order="10">Run full script end-to-end: ./scripts/update-scoreboard.sh should complete successfully and generate valid SCOREBOARD.md</step>
    <step order="11">Manually inspect generated SCOREBOARD.md: verify it renders correctly in markdown viewer, verify data looks accurate, verify ~165 line target met</step>
    <step order="12">Test idempotency: run script twice, diff the two outputs — should be identical (no random variation)</step>
  </steps>

  <verification>
    <check type="build">./scripts/update-scoreboard.sh (should exit 0 on success)</check>
    <check type="manual">Verify SCOREBOARD.md file exists at /home/agent/shipyard-ai/SCOREBOARD.md</check>
    <check type="manual">Count lines in SCOREBOARD.md: wc -l SCOREBOARD.md (should be ≤200, ideally ~165)</check>
    <check type="manual">Open SCOREBOARD.md in markdown preview — verify all tables render correctly, no syntax errors</check>
    <check type="manual">Verify all 32 completed projects appear in summary table</check>
    <check type="manual">Verify top 5 projects have expanded detail sections</check>
    <check type="manual">Spot-check 5 random projects: compare summary table data to actual round files, verify accuracy</check>
    <check type="manual">Run: grep -E "successfully|iterative|strategic|TBD|N/A|Unknown" SCOREBOARD.md (should return no matches)</check>
    <check type="manual">Test idempotency: run script twice, diff outputs (should be identical)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Requires generate_metrics_and_summary_section() function completed" />
    <depends-on task-id="phase-1-task-4" reason="Requires generate_expanded_details_section() function completed" />
  </dependencies>

  <commit-message>feat(scripts): assemble and validate complete SCOREBOARD.md

Add main orchestration and validation functions:
- Assemble all sections into complete SCOREBOARD.md
- Validate line count (≤200 lines, target ~165)
- Validate markdown syntax and table formatting
- Validate brand voice compliance (no marketing speak)
- Spot-check data accuracy (5 random projects)
- Idempotency test (reproducible output)

Script now generates complete, validated scoreboard from filesystem data.

Addresses: REQ-14, REQ-18

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-6" wave="3">
  <title>Update STATUS.md with Current Counts</title>
  <requirement>REQ-16: Update STATUS.md to reflect current idle state with accurate project counts (total shipped, failed, success rate)</requirement>
  <description>
    Update the agency STATUS.md file with current statistics from the scoreboard extraction. This ensures STATUS.md reflects the same aggregate metrics as SCOREBOARD.md (single source of truth from extraction script).

    Update or add fields for:
    - Total projects shipped
    - Total projects failed
    - Success rate percentage
    - Current pipeline state (IDLE or ACTIVE)

    This task has SHOULD priority (not blocking for v1 MVP, but completes the PRD requirement).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/STATUS.md" reason="Target file to update with current project counts and success metrics" />
    <file path="/home/agent/shipyard-ai/scripts/update-scoreboard.sh" reason="Source of calculated metrics (TOTAL_SHIPPED, TOTAL_FAILED, SUCCESS_RATE) to write to STATUS.md" />
    <file path="/home/agent/shipyard-ai/prds/scoreboard-update.md" reason="PRD line 52 specifies updating STATUS.md with accurate current state counts" />
    <file path="/home/agent/shipyard-ai/.planning/requirements-analysis.md" reason="REQ-16 (SHOULD priority) with acceptance criteria for STATUS.md update" />
  </context>

  <steps>
    <step order="1">Read current /home/agent/shipyard-ai/STATUS.md to understand existing format and fields</step>
    <step order="2">Extend scripts/update-scoreboard.sh with function update_status_file() that modifies STATUS.md</step>
    <step order="3">Update or add "total_shipped: {count}" field with TOTAL_SHIPPED value</step>
    <step order="4">Update or add "total_failed: {count}" field with TOTAL_FAILED value (may be 0)</step>
    <step order="5">Update or add "success_rate: {percentage}" field with SUCCESS_RATE value</step>
    <step order="6">Update "state:" field to reflect current pipeline state (IDLE if no active projects, ACTIVE otherwise)</step>
    <step order="7">Preserve other fields in STATUS.md (don't remove existing content unrelated to project counts)</step>
    <step order="8">Add timestamp or last_updated field showing when STATUS.md was updated</step>
    <step order="9">Test: run script and verify STATUS.md is updated correctly with matching numbers from SCOREBOARD.md</step>
    <step order="10">Verify STATUS.md remains valid YAML or markdown format (don't break existing parsers)</step>
  </steps>

  <verification>
    <check type="manual">Run ./scripts/update-scoreboard.sh and verify STATUS.md file is updated</check>
    <check type="manual">Compare metrics in STATUS.md vs SCOREBOARD.md — should match exactly (total_shipped, total_failed, success_rate)</check>
    <check type="manual">Verify STATUS.md remains parseable (if YAML) or readable (if markdown)</check>
    <check type="manual">Verify other fields in STATUS.md are preserved (not deleted by update)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Requires calculated aggregate metrics (TOTAL_SHIPPED, TOTAL_FAILED, SUCCESS_RATE)" />
  </dependencies>

  <commit-message>feat(scripts): update STATUS.md with current project counts

Extend scoreboard script to update STATUS.md with:
- Total shipped projects
- Total failed projects
- Success rate percentage
- Last updated timestamp

Ensures STATUS.md reflects same metrics as SCOREBOARD.md.

Addresses: REQ-16

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-7" wave="3">
  <title>Commit and Push SCOREBOARD.md</title>
  <requirement>REQ-19: Commit generated SCOREBOARD.md, extraction script, and STATUS.md to repository and push to main</requirement>
  <description>
    Final task: commit all deliverables from this phase to git and push to origin/main. This makes the scoreboard publicly visible and completes the PRD success criteria.

    Files to commit:
    - /home/agent/shipyard-ai/scripts/update-scoreboard.sh (new extraction script)
    - /home/agent/shipyard-ai/SCOREBOARD.md (newly generated scoreboard)
    - /home/agent/shipyard-ai/STATUS.md (updated counts)

    This task has SHOULD priority (not technically blocking, but completes the "committed and pushed" success criterion from PRD line 64).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/scripts/update-scoreboard.sh" reason="New file to commit — automated extraction script" />
    <file path="/home/agent/shipyard-ai/SCOREBOARD.md" reason="Modified file to commit — newly generated scoreboard" />
    <file path="/home/agent/shipyard-ai/STATUS.md" reason="Modified file to commit — updated with current counts" />
    <file path="/home/agent/shipyard-ai/.git/" reason="Git repository for commit and push operations" />
    <file path="/home/agent/shipyard-ai/prds/scoreboard-update.md" reason="PRD line 64 success criterion: 'Committed and pushed'" />
  </context>

  <steps>
    <step order="1">Run git status to verify working tree state and see all modified/new files</step>
    <step order="2">Run git add scripts/update-scoreboard.sh SCOREBOARD.md STATUS.md to stage all deliverables</step>
    <step order="3">Run git status again to confirm all expected files are staged</step>
    <step order="4">Create comprehensive commit message following conventional commits format with co-author attribution</step>
    <step order="5">Run git commit with multi-line message describing: (1) Added automated scoreboard extraction script, (2) Generated SCOREBOARD.md with 32 projects, hybrid format, raw verdicts, (3) Updated STATUS.md with current counts, (4) Addresses PRD scoreboard-update and decisions.md locked requirements</step>
    <step order="6">Run git log -1 to verify commit was created successfully</step>
    <step order="7">Run git push origin main (or current branch if not on main)</step>
    <step order="8">Verify push succeeded (no errors, all objects uploaded)</step>
    <step order="9">Optional: visit GitHub repo in browser and verify SCOREBOARD.md renders correctly with all tables and links</step>
  </steps>

  <verification>
    <check type="manual">Run git log -1 and verify commit message is comprehensive and accurate</check>
    <check type="manual">Run git status — should show "nothing to commit, working tree clean"</check>
    <check type="manual">Run git log --oneline -5 to confirm commit appears in history</check>
    <check type="manual">Visit repository on GitHub and verify: (1) SCOREBOARD.md file visible at repo root, (2) Markdown renders correctly, (3) All tables display properly, (4) Links are clickable</check>
    <check type="manual">Visit /scripts/update-scoreboard.sh on GitHub and verify it's marked as executable</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires SCOREBOARD.md to be generated and validated before committing" />
    <depends-on task-id="phase-1-task-6" reason="Requires STATUS.md to be updated before committing (if task-6 completed)" />
  </dependencies>

  <commit-message>feat: add automated scoreboard with complete project history

Add automated extraction script and generated SCOREBOARD.md:

- scripts/update-scoreboard.sh: Automated data extraction from prds/ and rounds/
  - Extracts QA verdicts, board scores, ship dates, pipeline duration
  - Calculates aggregate metrics (32 shipped, success rate, avg duration)
  - Generates hybrid format: compact summary + top 5 expanded details
  - Handles missing data gracefully with "—" (never guesses)
  - Idempotent, completes in <5 minutes

- SCOREBOARD.md: Complete project history (32 projects)
  - Summary table: all projects with QA/board/deliverables (reverse chronological)
  - Expanded details: top 5 recent projects with context/QA notes/board feedback
  - Raw brand voice: "PASS on first try", "BLOCK (X cycles)", "REJECT" (no marketing speak)
  - Target length: ~165 lines (Decision 1.8)

- STATUS.md: Updated with current aggregate metrics

Implements decisions from rounds/scoreboard-update/decisions.md:
- Decision 1.2: Hybrid format (compact + expanded)
- Decision 1.4: Raw verdicts (Steve wins)
- Decision 1.5: Automated extraction (Elon wins)
- Decision 1.6: Round timestamps (no daemon log parsing)
- Decision 1.9: "—" for missing data (unanimous)

Addresses PRD: /home/agent/shipyard-ai/prds/scoreboard-update.md
Success criteria: All 32 projects visible, accurate data, committed & pushed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

### Risk 5.1: Inconsistent Data Formats (HIGH likelihood, MEDIUM impact)
**Concern**: QA verdicts and board scores are stored inconsistently across round files (freeform markdown). Extraction logic may fail to find data in some projects.

**Mitigation**:
- phase-1-task-1 implements multiple fallback grep patterns for QA verdicts (check qa-pass-*.md, final-verdict.md, board-verdict.md)
- phase-1-task-1 implements multiple fallback patterns for board scores (check for "Average:", "Aggregate Score:", numeric patterns)
- Liberal use of "—" when data not found (fail gracefully, don't block extraction)
- phase-1-task-5 includes spot-check validation to identify projects with extraction failures

**Owner**: Executor of phase-1-task-1

---

### Risk 5.5: Pipeline Duration Data Unavailable (MEDIUM likelihood, LOW impact)
**Concern**: Round file timestamps may be missing or inconsistent, making duration calculation impossible for some projects.

**Mitigation**:
- phase-1-task-1 uses file modification timestamps (mtime) as approximate duration source
- Accept "—" as valid data point when timestamps insufficient
- Don't block v1 on complete duration data (Decision 1.6 explicitly defers daemon log parsing to v2)
- Average duration calculation in phase-1-task-2 excludes "—" values (doesn't corrupt average)

**Owner**: Executor of phase-1-task-1, phase-1-task-2

---

### Risk 5.4: Scope Creep to 5,000-Line Monster (MEDIUM likelihood, HIGH impact)
**Concern**: Engineer adds "just one more metric" and scoreboard becomes unreadable database dump.

**Mitigation**:
- Decision 1.8 locks v1 format at ~165 lines (40 summary + 125 expanded)
- phase-1-task-5 includes line count validation (errors if >200 lines)
- Decision 2 explicitly cuts: agent count, daemon logs, file enumeration, charts (WONT-1 through WONT-5)
- This plan enforces constraint by only implementing locked v1 requirements

**Owner**: Plan reviewer (reject any task additions not in requirements-analysis.md)

---

## Execution Timeline Estimate

**Total estimated time**: 3-4 hours for complete implementation and validation

| Wave | Tasks | Estimated Time | Parallelizable |
|------|-------|----------------|----------------|
| Wave 1 | phase-1-task-1, phase-1-task-2 | 90-120 minutes | Yes (2 tasks) |
| Wave 2 | phase-1-task-3, phase-1-task-4 | 60-90 minutes | Yes (2 tasks) |
| Wave 3 | phase-1-task-5, phase-1-task-6, phase-1-task-7 | 45-60 minutes | Partial (task-6 parallel with task-5) |

**Critical Path**: task-1 → task-2 → task-3 → task-5 → task-7 (required for MVP)

**Optional Path**: task-6 (STATUS.md update) is SHOULD priority, not blocking

---

## Phase Completion Checklist

Before marking phase-1 complete, verify:

- [ ] All 7 task plans executed successfully (or 6 if task-6 skipped)
- [ ] SCOREBOARD.md exists at repo root with all required sections
- [ ] SCOREBOARD.md line count ≤200 (target ~165)
- [ ] All 32 completed projects appear in summary table
- [ ] Top 5 projects have expanded details sections
- [ ] QA verdicts use only raw language: PASS/BLOCK/REJECT/"—"
- [ ] Board scores are 0-10 or "—"
- [ ] Aggregate metrics calculated correctly (verify manually)
- [ ] Markdown renders correctly on GitHub (tables, links work)
- [ ] Extraction script is executable: `chmod +x scripts/update-scoreboard.sh`
- [ ] Script completes in <5 minutes
- [ ] Script is idempotent (running twice produces identical output)
- [ ] All deliverables committed to git
- [ ] Changes pushed to origin/main
- [ ] No scope creep: agent count, daemon logs, file enumeration, charts all absent (per WONT list)

---

**End of Phase 1 Plan**
