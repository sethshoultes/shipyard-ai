#!/bin/bash
#
# update-scoreboard.sh — Data Extraction Engine
#
# Extracts project metrics from prds/completed/ and rounds/ directories,
# generates SCOREBOARD.md with graceful "—" fallback for missing data.
#
# Usage: ./scripts/update-scoreboard.sh
# Output: SCOREBOARD.md
# Exit codes: 0 = success, 1 = failures (but with "—" fallbacks, no blocking)
#
# Per Decision 1.9: "—" is better than delay, guessing, or blocking.
# Per Decision 1.6: No daemon log parsing (use round file timestamps only).
# Per Decision 1.4: Raw verdicts (PASS/BLOCK/REJECT) only.
#

set -euo pipefail

# === CONFIGURATION ===

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

PRDS_COMPLETED="${REPO_ROOT}/prds/completed"
PRDS_FAILED="${REPO_ROOT}/prds/failed"
ROUNDS_DIR="${REPO_ROOT}/rounds"
DELIVERABLES_DIR="${REPO_ROOT}/deliverables"
OUTPUT_FILE="${REPO_ROOT}/SCOREBOARD.md"

# Associative arrays for extracted data
declare -A PROJECT_QA
declare -A PROJECT_BOARD
declare -A PROJECT_DATE
declare -A PROJECT_DURATION
declare -A PROJECT_DELIVERABLES

# Log to stderr
log_info() {
  echo "[INFO] $1" >&2
}

log_warn() {
  echo "[WARN] $1" >&2
}

log_error() {
  echo "[ERROR] $1" >&2
}

# === STEP 1: Extract completed projects ===

extract_completed_projects() {
  local projects=()

  if [ ! -d "$PRDS_COMPLETED" ]; then
    log_error "Directory not found: $PRDS_COMPLETED"
    return 1
  fi

  while IFS= read -r file; do
    if [ -f "$file" ]; then
      local project_name
      project_name=$(basename "$file" .md)
      projects+=("$project_name")
    fi
  done < <(find "$PRDS_COMPLETED" -maxdepth 1 -name "*.md" -type f | sort)

  printf '%s\n' "${projects[@]}"
}

# === STEP 2: Extract QA verdict ===

extract_qa_verdict() {
  local project="$1"
  local rounds_path="${ROUNDS_DIR}/${project}"

  if [ ! -d "$rounds_path" ]; then
    echo "—"
    return 0
  fi

  # Search for verdict keywords in round files
  local verdict=""

  # Look for PASS pattern
  if grep -r "PASS" "$rounds_path" 2>/dev/null | grep -q "PASS on first try\|PASS\|qa-pass"; then
    verdict="PASS"
  fi

  # Look for BLOCK pattern (may include cycle count)
  if grep -r "BLOCK" "$rounds_path" 2>/dev/null | grep -q "BLOCK"; then
    # Try to extract cycle count
    local cycle_match
    cycle_match=$(grep -r "BLOCK.*([0-9]" "$rounds_path" 2>/dev/null | head -1 || true)
    if [ -n "$cycle_match" ]; then
      verdict=$(echo "$cycle_match" | grep -o "BLOCK[^)]*)" | head -1)
    else
      verdict="BLOCK"
    fi
  fi

  # Look for REJECT pattern
  if grep -r "REJECT" "$rounds_path" 2>/dev/null | grep -q "REJECT"; then
    verdict="REJECT"
  fi

  # Check for qa-pass-*.md files (indicates PASS)
  if [ -z "$verdict" ] && ls "$rounds_path"/qa-pass-*.md >/dev/null 2>&1; then
    verdict="PASS"
  fi

  # Check for BLOCK verdict in qa files
  if [ -z "$verdict" ] && grep -r "BLOCK" "$rounds_path"/*qa* 2>/dev/null | grep -q "OVERALL VERDICT: BLOCK"; then
    verdict="BLOCK"
  fi

  if [ -z "$verdict" ]; then
    echo "—"
  else
    echo "$verdict"
  fi
}

# === STEP 3: Extract board score ===

extract_board_score() {
  local project="$1"
  local board_verdict_file="${ROUNDS_DIR}/${project}/board-verdict.md"

  if [ ! -f "$board_verdict_file" ]; then
    echo "—"
    return 0
  fi

  # Look for patterns like:
  # "Average Score: X.X/10"
  # "Aggregate Score: X.X/10"
  # "Score: X/10"
  local score
  score=$(grep -i "average score\|aggregate score\|^.*score.*:" "$board_verdict_file" 2>/dev/null | \
          grep -o "[0-9]\+\(\.[0-9]\+\)\?" | head -1)

  if [ -n "$score" ]; then
    echo "$score"
  else
    echo "—"
  fi
}

# === STEP 4: Extract ship date ===

extract_ship_date() {
  local project="$1"
  local rounds_path="${ROUNDS_DIR}/${project}"

  if [ ! -d "$rounds_path" ]; then
    echo "—"
    return 0
  fi

  # Find the modification date of the most recent file in the rounds directory
  local latest_file
  latest_file=$(find "$rounds_path" -maxdepth 1 -type f -printf '%T@ %p\n' 2>/dev/null | \
                sort -rn | head -1 | cut -d' ' -f2-)

  if [ -z "$latest_file" ]; then
    echo "—"
    return 0
  fi

  # Extract date in YYYY-MM-DD format
  if command -v stat >/dev/null 2>&1; then
    stat -c "%y" "$latest_file" 2>/dev/null | cut -d' ' -f1 || echo "—"
  else
    # Fallback if stat is not available
    date -r "$latest_file" "+%Y-%m-%d" 2>/dev/null || echo "—"
  fi
}

# === STEP 5: Extract pipeline duration ===

extract_pipeline_duration() {
  local project="$1"
  local rounds_path="${ROUNDS_DIR}/${project}"

  if [ ! -d "$rounds_path" ]; then
    echo "—"
    return 0
  fi

  # Find oldest and newest files in rounds directory
  local oldest_time newest_time

  oldest_time=$(find "$rounds_path" -maxdepth 1 -type f -printf '%T@\n' 2>/dev/null | \
                sort -n | head -1)
  newest_time=$(find "$rounds_path" -maxdepth 1 -type f -printf '%T@\n' 2>/dev/null | \
                sort -n | tail -1)

  if [ -z "$oldest_time" ] || [ -z "$newest_time" ]; then
    echo "—"
    return 0
  fi

  # Calculate duration in seconds
  local duration_sec
  duration_sec=$(printf "%.0f" "$(echo "$newest_time - $oldest_time" | bc 2>/dev/null || echo 0)")

  if [ "$duration_sec" -lt 60 ]; then
    echo "—"
    return 0
  fi

  # Convert to human-readable format
  local hours minutes days
  hours=$((duration_sec / 3600))
  minutes=$(((duration_sec % 3600) / 60))
  days=$((hours / 24))

  if [ "$days" -gt 0 ]; then
    echo "${days}d ${hours}h"
  elif [ "$hours" -gt 0 ]; then
    echo "${hours}h ${minutes}m"
  else
    echo "${minutes}m"
  fi
}

# === STEP 6: Check deliverables ===

check_deliverables() {
  local project="$1"
  local deliverables_path="${DELIVERABLES_DIR}/${project}"

  if [ -d "$deliverables_path" ]; then
    echo "[Link](/deliverables/${project}/)"
  else
    echo "—"
  fi
}

# === MAIN EXTRACTION LOGIC ===

log_info "Starting data extraction..."
log_info "Completed projects directory: $PRDS_COMPLETED"

# Extract all completed projects
mapfile -t PROJECTS < <(extract_completed_projects)
TOTAL_COMPLETED=${#PROJECTS[@]}

log_info "Found $TOTAL_COMPLETED completed projects"

# Count failed projects
TOTAL_FAILED=0
if [ -d "$PRDS_FAILED" ]; then
  TOTAL_FAILED=$(find "$PRDS_FAILED" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)
fi

log_info "Found $TOTAL_FAILED failed projects"

# Extract data for each project
log_info "Extracting metrics for each project..."
for project in "${PROJECTS[@]}"; do
  log_info "  Processing: $project"

  PROJECT_QA["$project"]=$(extract_qa_verdict "$project")
  PROJECT_BOARD["$project"]=$(extract_board_score "$project")
  PROJECT_DATE["$project"]=$(extract_ship_date "$project")
  PROJECT_DURATION["$project"]=$(extract_pipeline_duration "$project")
  PROJECT_DELIVERABLES["$project"]=$(check_deliverables "$project")
done

# === CALCULATE AGGREGATE METRICS ===

log_info "Calculating aggregate metrics..."

# Count PASS, BLOCK, REJECT verdicts
PASS_COUNT=0
BLOCK_COUNT=0
REJECT_COUNT=0

for verdict in "${PROJECT_QA[@]}"; do
  case "$verdict" in
    PASS*) PASS_COUNT=$((PASS_COUNT + 1)) ;;
    BLOCK*) BLOCK_COUNT=$((BLOCK_COUNT + 1)) ;;
    REJECT) REJECT_COUNT=$((REJECT_COUNT + 1)) ;;
  esac
done

# Calculate success rate
TOTAL_EVALUATED=$((TOTAL_COMPLETED + TOTAL_FAILED))
if [ "$TOTAL_EVALUATED" -gt 0 ]; then
  SUCCESS_RATE=$((TOTAL_COMPLETED * 100 / TOTAL_EVALUATED))
else
  SUCCESS_RATE=0
fi

# Calculate average duration
DURATION_COUNT=0
TOTAL_DURATION_HOURS=0.0

for duration in "${PROJECT_DURATION[@]}"; do
  if [ "$duration" != "—" ]; then
    DURATION_COUNT=$((DURATION_COUNT + 1))
    # Parse duration (simplistic: just extract hours)
    if [[ "$duration" =~ ([0-9]+)d ]]; then
      days=${BASH_REMATCH[1]}
      TOTAL_DURATION_HOURS=$(echo "$TOTAL_DURATION_HOURS + $days * 24" | bc 2>/dev/null || echo "0")
    fi
    if [[ "$duration" =~ ([0-9]+)h ]]; then
      hours=${BASH_REMATCH[1]}
      TOTAL_DURATION_HOURS=$(echo "$TOTAL_DURATION_HOURS + $hours" | bc 2>/dev/null || echo "0")
    fi
  fi
done

AVERAGE_DURATION="—"
if [ "$DURATION_COUNT" -gt 0 ]; then
  AVERAGE_DURATION=$(echo "scale=1; $TOTAL_DURATION_HOURS / $DURATION_COUNT" | bc 2>/dev/null || echo "—")
  if [ "$AVERAGE_DURATION" != "—" ]; then
    AVERAGE_DURATION="${AVERAGE_DURATION} hours"
  fi
fi

log_info "Success rate: ${SUCCESS_RATE}% (${TOTAL_COMPLETED} shipped, ${TOTAL_FAILED} failed)"
log_info "PASS: ${PASS_COUNT}, BLOCK: ${BLOCK_COUNT}, REJECT: ${REJECT_COUNT}"
log_info "Average duration: $AVERAGE_DURATION"

# === SORT PROJECTS BY DATE (REVERSE CHRONOLOGICAL) ===

log_info "Sorting projects by ship date..."

# Create temporary array with dates for sorting
declare -a SORTED_PROJECTS

# Sort by date (reverse chronological)
# Projects with "—" date go to end
while IFS= read -r line; do
  if [ -n "$line" ]; then
    SORTED_PROJECTS+=("$line")
  fi
done < <(
  for project in "${PROJECTS[@]}"; do
    date="${PROJECT_DATE[$project]}"
    # Use YYYY-MM-DD format for sorting, with "—" at end
    if [ "$date" = "—" ]; then
      echo "0000-00-00 $project"
    else
      echo "$date $project"
    fi
  done | sort -r | cut -d' ' -f2-
)

# === IDENTIFY TOP 5 RECENT PROJECTS ===

log_info "Identifying top 5 most recent projects..."
declare -a TOP_5_PROJECTS
for i in {0..4}; do
  if [ "$i" -lt "${#SORTED_PROJECTS[@]}" ]; then
    TOP_5_PROJECTS+=("${SORTED_PROJECTS[$i]}")
  fi
done

log_info "Top 5 projects: ${TOP_5_PROJECTS[*]}"

# === GENERATE SCOREBOARD.MD ===

log_info "Generating SCOREBOARD.md..."

TIMESTAMP=$(date -u "+%Y-%m-%d %H:%M UTC")

cat > "$OUTPUT_FILE" << EOF
# Shipyard AI — Scoreboard

**Last Updated:** ${TIMESTAMP}

---

## Core Metrics

EOF

# Add core metrics section
cat >> "$OUTPUT_FILE" << METRICS
**Total Shipped:** ${TOTAL_COMPLETED}
**Total Failed:** ${TOTAL_FAILED}
**Success Rate:** ${SUCCESS_RATE}%
**Average Pipeline Duration:** ${AVERAGE_DURATION}

---

METRICS

# Add summary table header
cat >> "$OUTPUT_FILE" << TABLE_HEADER
## Summary (All Projects)

| Project | Shipped | QA | Board | Deliverables |
|---------|---------|-----|-------|-------------|
TABLE_HEADER

# Add table rows (sorted reverse chronological)
for project in "${SORTED_PROJECTS[@]}"; do
  shipped_date="${PROJECT_DATE[$project]}"
  qa_verdict="${PROJECT_QA[$project]}"
  board_score="${PROJECT_BOARD[$project]}"
  deliverables="${PROJECT_DELIVERABLES[$project]}"

  # Create markdown link to PRD
  prd_link="[${project}](/prds/completed/${project}.md)"

  echo "| ${prd_link} | ${shipped_date} | ${qa_verdict} | ${board_score} | ${deliverables} |" >> "$OUTPUT_FILE"
done

# Add expanded details section for top 5
cat >> "$OUTPUT_FILE" << DETAILS_HEADER

---

## Expanded Details (Top 5 Recent)

DETAILS_HEADER

for project in "${TOP_5_PROJECTS[@]}"; do
  cat >> "$OUTPUT_FILE" << PROJECT_DETAIL

### ${project}

**Shipped:** ${PROJECT_DATE[$project]}
**QA Verdict:** ${PROJECT_QA[$project]}
**Board Score:** ${PROJECT_BOARD[$project]}/10
**Duration:** ${PROJECT_DURATION[$project]}
**Deliverables:** ${PROJECT_DELIVERABLES[$project]}

PROJECT_DETAIL
done

# Add footer
cat >> "$OUTPUT_FILE" << 'FOOTER'

---

*Generated by update-scoreboard.sh — Machine truth, never guessed. Missing data marked as "—" per Decision 1.9.*
FOOTER

log_info "SCOREBOARD.md generated successfully at: $OUTPUT_FILE"
log_info "Total lines: $(wc -l < "$OUTPUT_FILE")"
log_info "All tasks completed."
