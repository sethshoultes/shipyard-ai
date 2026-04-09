#!/bin/bash
#
# lighthouse.sh — The Audit Script
#
# Per decisions.md: "Banned pattern count + build exit code. That IS the audit."
# Machine-generated truth only. No manual overrides.
#
# Usage: ./scripts/lighthouse.sh
# Output: docs/LIGHTHOUSE.md
# Exit codes: 0 = report generated successfully
#
# Rerun: Safe to run multiple times (deterministic output)
#
# CI Integration (separate ticket per Decision #19):
#   - Run lighthouse.sh on schedule (weekly)
#   - Add to PR checks for plugin changes
#

set -euo pipefail

# === CONFIGURATION ===

# TypeScript plugins (excludes adminpulse - PHP)
PLUGINS=(
  "eventdash"
  "formforge"
  "membership"
  "reviewpulse"
  "seodash"
  "commercekit"
)

# Example sites (excludes emdash-templates - submodule)
SITES=(
  "bellas-bistro"
  "craft-co-studio"
  "peak-dental"
  "sunrise-yoga"
  "testing-site"
)

# Banned patterns (from BANNED-PATTERNS.md)
BANNED_PATTERNS=(
  "throw new Response"
  "rc\.user"
  "rc\.pathParams"
)

# Output location
OUTPUT_FILE="docs/LIGHTHOUSE.md"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Build timeout (seconds)
BUILD_TIMEOUT=60

# === FUNCTIONS ===

# Get UTC timestamp
get_timestamp() {
  date -u "+%Y-%m-%d %H:%M UTC"
}

# Count lines of code in a directory
# $1 = directory path
# $2 = project type (plugin|site)
count_loc() {
  local dir="$1"
  local type="$2"
  local src_dir="${dir}/src"
  local result

  if [ ! -d "$src_dir" ]; then
    echo "0"
    return
  fi

  if [ "$type" = "plugin" ]; then
    # Plugins: count .ts files
    result=$(find "$src_dir" -name "*.ts" -type f ! -path "*/node_modules/*" -exec cat {} \; 2>/dev/null | wc -l)
  else
    # Sites: count .ts and .astro files
    result=$(find "$src_dir" \( -name "*.ts" -o -name "*.astro" \) -type f ! -path "*/node_modules/*" -exec cat {} \; 2>/dev/null | wc -l)
  fi

  result=$(echo "$result" | tr -d '[:space:]')
  if [ -z "$result" ]; then
    echo "0"
  else
    echo "$result"
  fi
}

# Count banned pattern violations
# $1 = directory path
count_banned() {
  local dir="$1"
  local src_dir="${dir}/src"
  local total=0

  if [ ! -d "$src_dir" ]; then
    echo "0"
    return
  fi

  for pattern in "${BANNED_PATTERNS[@]}"; do
    local count
    count=$(grep -rn "$pattern" "$src_dir" --exclude-dir=node_modules 2>/dev/null | wc -l)
    count=$(echo "$count" | tr -d '[:space:]')
    if [ -n "$count" ] && [ "$count" -gt 0 ] 2>/dev/null; then
      total=$((total + count))
    fi
  done

  echo "$total"
}

# Get banned pattern locations (for details section)
# $1 = directory path
get_banned_locations() {
  local dir="$1"
  local src_dir="${dir}/src"

  if [ ! -d "$src_dir" ]; then
    return
  fi

  for pattern in "${BANNED_PATTERNS[@]}"; do
    grep -rn "$pattern" "$src_dir" --exclude-dir=node_modules 2>/dev/null || true
  done
}

# Run build verification
# $1 = directory path
# $2 = project type (plugin|site)
# Returns: 0 = pass, non-zero = fail
run_build() {
  local dir="$1"
  local type="$2"
  local build_exit=0

  if [ ! -d "$dir" ]; then
    return 1
  fi

  # Check for package.json
  if [ ! -f "${dir}/package.json" ]; then
    return 1
  fi

  # Save current directory
  local original_dir
  original_dir=$(pwd)

  cd "$dir"

  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    npm install --silent 2>/dev/null || true
  fi

  # Run build with timeout
  if [ "$type" = "plugin" ]; then
    # Plugins: npm test
    timeout "$BUILD_TIMEOUT" npm test >/dev/null 2>&1 || build_exit=$?
  else
    # Sites: npm run build
    timeout "$BUILD_TIMEOUT" npm run build >/dev/null 2>&1 || build_exit=$?
  fi

  cd "$original_dir"

  return $build_exit
}

# Determine status based on build and banned count
# $1 = build exit code
# $2 = banned count
determine_status() {
  local build_exit="$1"
  local banned="$2"

  if [ "$banned" -gt 0 ]; then
    echo "BROKEN"
  elif [ "$build_exit" -ne 0 ]; then
    echo "BROKEN"
  else
    # V1: No runtime verification, so UNTESTED
    echo "UNTESTED"
  fi
}

# Determine recommended action
# $1 = status
# $2 = banned count
# $3 = loc count
determine_action() {
  local status="$1"
  local banned="$2"
  local loc="$3"

  if [ "$status" = "UNTESTED" ]; then
    echo "—"
  elif [ "$banned" -lt 10 ]; then
    echo "FIX"
  elif [ "$banned" -lt 50 ]; then
    echo "REWRITE"
  else
    echo "REWRITE"
  fi
}

# Determine verdict text
# $1 = status
# $2 = banned count
# $3 = build exit code
determine_verdict() {
  local status="$1"
  local banned="$2"
  local build_exit="$3"

  if [ "$status" = "UNTESTED" ]; then
    echo "Needs runtime verification"
  elif [ "$banned" -gt 0 ]; then
    echo "Banned patterns detected"
  elif [ "$build_exit" -ne 0 ]; then
    echo "Build failed"
  else
    echo "Clean build, zero violations"
  fi
}

# Get status badge
# $1 = status
get_badge() {
  local status="$1"
  case "$status" in
    "WORKING") echo "WORKING" ;;
    "BROKEN") echo "BROKEN" ;;
    "UNTESTED") echo "UNTESTED" ;;
    *) echo "UNKNOWN" ;;
  esac
}

# === MAIN EXECUTION ===

echo "Lighthouse Audit starting..."
echo ""

# Initialize counters
WORKING_COUNT=0
BROKEN_COUNT=0
UNTESTED_COUNT=0

# Collect audit data
declare -A AUDIT_DATA

# Audit plugins first (domain serialization per Decision #12)
echo "Auditing plugins..."
for plugin in "${PLUGINS[@]}"; do
  plugin_dir="${REPO_ROOT}/plugins/${plugin}"

  if [ ! -d "$plugin_dir" ]; then
    echo "  Warning: Plugin not found: $plugin"
    continue
  fi

  echo "  Processing: $plugin"

  loc=$(count_loc "$plugin_dir" "plugin")
  banned=$(count_banned "$plugin_dir")

  # Run build
  build_exit=0
  run_build "$plugin_dir" "plugin" || build_exit=$?

  status=$(determine_status "$build_exit" "$banned")
  action=$(determine_action "$status" "$banned" "$loc")
  verdict=$(determine_verdict "$status" "$banned" "$build_exit")
  badge=$(get_badge "$status")

  # Store data
  AUDIT_DATA["${plugin}_type"]="plugin"
  AUDIT_DATA["${plugin}_loc"]="$loc"
  AUDIT_DATA["${plugin}_banned"]="$banned"
  AUDIT_DATA["${plugin}_build_exit"]="$build_exit"
  AUDIT_DATA["${plugin}_status"]="$status"
  AUDIT_DATA["${plugin}_action"]="$action"
  AUDIT_DATA["${plugin}_verdict"]="$verdict"
  AUDIT_DATA["${plugin}_badge"]="$badge"

  # Update counters
  case "$status" in
    "WORKING") WORKING_COUNT=$((WORKING_COUNT + 1)) ;;
    "BROKEN") BROKEN_COUNT=$((BROKEN_COUNT + 1)) ;;
    "UNTESTED") UNTESTED_COUNT=$((UNTESTED_COUNT + 1)) ;;
  esac
done

echo ""
echo "Auditing sites..."
for site in "${SITES[@]}"; do
  site_dir="${REPO_ROOT}/examples/${site}"

  if [ ! -d "$site_dir" ]; then
    echo "  Warning: Site not found: $site"
    continue
  fi

  echo "  Processing: $site"

  loc=$(count_loc "$site_dir" "site")
  banned=$(count_banned "$site_dir")

  # Run build
  build_exit=0
  run_build "$site_dir" "site" || build_exit=$?

  status=$(determine_status "$build_exit" "$banned")
  action=$(determine_action "$status" "$banned" "$loc")
  verdict=$(determine_verdict "$status" "$banned" "$build_exit")
  badge=$(get_badge "$status")

  # Store data
  AUDIT_DATA["${site}_type"]="site"
  AUDIT_DATA["${site}_loc"]="$loc"
  AUDIT_DATA["${site}_banned"]="$banned"
  AUDIT_DATA["${site}_build_exit"]="$build_exit"
  AUDIT_DATA["${site}_status"]="$status"
  AUDIT_DATA["${site}_action"]="$action"
  AUDIT_DATA["${site}_verdict"]="$verdict"
  AUDIT_DATA["${site}_badge"]="$badge"

  # Update counters
  case "$status" in
    "WORKING") WORKING_COUNT=$((WORKING_COUNT + 1)) ;;
    "BROKEN") BROKEN_COUNT=$((BROKEN_COUNT + 1)) ;;
    "UNTESTED") UNTESTED_COUNT=$((UNTESTED_COUNT + 1)) ;;
  esac
done

echo ""
echo "Generating report..."

# === GENERATE LIGHTHOUSE.MD ===

OUTPUT_PATH="${REPO_ROOT}/${OUTPUT_FILE}"

cat > "$OUTPUT_PATH" << 'HEADER'
# Lighthouse

HEADER

# Add metadata
cat >> "$OUTPUT_PATH" << METADATA
> Last updated: $(get_timestamp)
> Generated by: lighthouse.sh
> Summary: ${WORKING_COUNT} WORKING / ${BROKEN_COUNT} BROKEN / ${UNTESTED_COUNT} UNTESTED

## Overview

| Project | Status | LOC | Banned | Action | Verdict |
|---------|--------|-----|--------|--------|---------|
METADATA

# Write summary table - plugins first
for plugin in "${PLUGINS[@]}"; do
  if [ -z "${AUDIT_DATA["${plugin}_status"]+x}" ]; then
    continue
  fi

  status="${AUDIT_DATA["${plugin}_status"]}"
  loc="${AUDIT_DATA["${plugin}_loc"]}"
  banned="${AUDIT_DATA["${plugin}_banned"]}"
  action="${AUDIT_DATA["${plugin}_action"]}"
  verdict="${AUDIT_DATA["${plugin}_verdict"]}"

  # Format with badge
  case "$status" in
    "WORKING") status_display="WORKING" ;;
    "BROKEN") status_display="BROKEN" ;;
    "UNTESTED") status_display="UNTESTED" ;;
  esac

  # Format LOC with comma
  loc_formatted=$(printf "%'d" "$loc" 2>/dev/null || echo "$loc")

  echo "| ${plugin} | ${status_display} | ${loc_formatted} | ${banned} | ${action} | ${verdict} |" >> "$OUTPUT_PATH"
done

# Write summary table - sites
for site in "${SITES[@]}"; do
  if [ -z "${AUDIT_DATA["${site}_status"]+x}" ]; then
    continue
  fi

  status="${AUDIT_DATA["${site}_status"]}"
  loc="${AUDIT_DATA["${site}_loc"]}"
  banned="${AUDIT_DATA["${site}_banned"]}"
  action="${AUDIT_DATA["${site}_action"]}"
  verdict="${AUDIT_DATA["${site}_verdict"]}"

  case "$status" in
    "WORKING") status_display="WORKING" ;;
    "BROKEN") status_display="BROKEN" ;;
    "UNTESTED") status_display="UNTESTED" ;;
  esac

  loc_formatted=$(printf "%'d" "$loc" 2>/dev/null || echo "$loc")

  echo "| ${site} | ${status_display} | ${loc_formatted} | ${banned} | ${action} | ${verdict} |" >> "$OUTPUT_PATH"
done

# Write details section
cat >> "$OUTPUT_PATH" << 'DETAILS_HEADER'

## Details

DETAILS_HEADER

# Details - plugins first
for plugin in "${PLUGINS[@]}"; do
  if [ -z "${AUDIT_DATA["${plugin}_status"]+x}" ]; then
    continue
  fi

  status="${AUDIT_DATA["${plugin}_status"]}"
  banned="${AUDIT_DATA["${plugin}_banned"]}"
  build_exit="${AUDIT_DATA["${plugin}_build_exit"]}"
  action="${AUDIT_DATA["${plugin}_action"]}"

  case "$status" in
    "WORKING") status_display="WORKING" ;;
    "BROKEN") status_display="BROKEN" ;;
    "UNTESTED") status_display="UNTESTED" ;;
  esac

  cat >> "$OUTPUT_PATH" << PLUGIN_DETAIL
### ${plugin}
**Status:** ${status_display}
- Build: $([ "$build_exit" -eq 0 ] && echo "passed" || echo "failed")
- Banned patterns: ${banned}
PLUGIN_DETAIL

  # Add locations if banned patterns found
  if [ "$banned" -gt 0 ]; then
    echo "- Locations:" >> "$OUTPUT_PATH"
    plugin_dir="${REPO_ROOT}/plugins/${plugin}"
    while IFS= read -r line; do
      if [ -n "$line" ]; then
        # Make path relative
        relative_line="${line#$REPO_ROOT/}"
        echo "  - \`${relative_line}\`" >> "$OUTPUT_PATH"
      fi
    done < <(get_banned_locations "$plugin_dir" | head -10)
    if [ "$banned" -gt 10 ]; then
      echo "  - ... and $((banned - 10)) more" >> "$OUTPUT_PATH"
    fi
  fi

  if [ "$action" != "—" ]; then
    cat >> "$OUTPUT_PATH" << ACTION_DETAIL
- Action: ${action}
ACTION_DETAIL
  else
    cat >> "$OUTPUT_PATH" << ACTION_DETAIL
- Action: None required
ACTION_DETAIL
  fi

  echo "" >> "$OUTPUT_PATH"
done

# Details - sites
for site in "${SITES[@]}"; do
  if [ -z "${AUDIT_DATA["${site}_status"]+x}" ]; then
    continue
  fi

  status="${AUDIT_DATA["${site}_status"]}"
  banned="${AUDIT_DATA["${site}_banned"]}"
  build_exit="${AUDIT_DATA["${site}_build_exit"]}"
  action="${AUDIT_DATA["${site}_action"]}"

  case "$status" in
    "WORKING") status_display="WORKING" ;;
    "BROKEN") status_display="BROKEN" ;;
    "UNTESTED") status_display="UNTESTED" ;;
  esac

  cat >> "$OUTPUT_PATH" << SITE_DETAIL
### ${site}
**Status:** ${status_display}
- Build: $([ "$build_exit" -eq 0 ] && echo "passed" || echo "failed")
- Banned patterns: ${banned}
SITE_DETAIL

  if [ "$banned" -gt 0 ]; then
    echo "- Locations:" >> "$OUTPUT_PATH"
    site_dir="${REPO_ROOT}/examples/${site}"
    while IFS= read -r line; do
      if [ -n "$line" ]; then
        relative_line="${line#$REPO_ROOT/}"
        echo "  - \`${relative_line}\`" >> "$OUTPUT_PATH"
      fi
    done < <(get_banned_locations "$site_dir" | head -10)
  fi

  if [ "$action" != "—" ]; then
    cat >> "$OUTPUT_PATH" << ACTION_DETAIL
- Action: ${action}
ACTION_DETAIL
  else
    cat >> "$OUTPUT_PATH" << ACTION_DETAIL
- Action: None required
ACTION_DETAIL
  fi

  echo "" >> "$OUTPUT_PATH"
done

# Write footer
cat >> "$OUTPUT_PATH" << 'FOOTER'
---
*Generated by lighthouse.sh — Truth from code, not memory*
FOOTER

echo ""
echo "Lighthouse audit complete!"
echo "Output: ${OUTPUT_FILE}"
echo "Summary: ${WORKING_COUNT} WORKING / ${BROKEN_COUNT} BROKEN / ${UNTESTED_COUNT} UNTESTED"
