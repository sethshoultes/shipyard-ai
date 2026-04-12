#!/usr/bin/env bash
# NERVE parse-verdict.sh — Strict verdict parsing from QA reports
# Part of NERVE: Operations Hardening for Autonomous Pipeline Daemon
#
# Usage: ./parse-verdict.sh /path/to/qa-report.md
#
# Exit codes:
#   0 - PASS verdict found
#   1 - FAIL verdict found
#   2 - ERROR (no verdict found, or ambiguous/multiple verdicts)
#
# Integrates with pipeline/qa/run-qa.sh output format:
#   "**Status:** PASS" or "**Status:** FAIL"
#   "VERDICT: PASS" or "VERDICT: FAIL"

set -euo pipefail

# Bash version check (require 4.0+)
if [[ ${BASH_VERSION%%.*} -lt 4 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [VERDICT] ERROR: Bash 4.0+ required" >&2
    exit 2
fi

# Restrictive permissions
umask 0077

# Configuration
VERBOSE="${NERVE_VERBOSE:-0}"

# Logging function
verdict_log() {
    local message="$1"
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "[${timestamp}] [VERDICT] ${message}"
}

# Parse verdict from a file
parse_verdict() {
    local file="$1"

    # Validate file exists
    if [[ ! -f "$file" ]]; then
        verdict_log "ERROR: file not found: ${file}"
        return 2
    fi

    # Search for verdict patterns
    # Pattern 1: "**Status:** PASS" or "**Status:** FAIL" (from run-qa.sh)
    # Pattern 2: "VERDICT: PASS" or "VERDICT: FAIL" (also from run-qa.sh)
    local matches
    matches=$(grep -E '(\*\*Status:\*\*|VERDICT:)\s*(PASS|FAIL)' "$file" 2>/dev/null || echo "")

    if [[ -z "$matches" ]]; then
        verdict_log "ERROR: no verdict found in ${file}"
        return 2
    fi

    # Count unique verdicts
    local pass_count fail_count
    pass_count=$(echo "$matches" | grep -cE '(PASS)' || true)
    fail_count=$(echo "$matches" | grep -cE '(FAIL)' || true)

    # Check for ambiguity (both PASS and FAIL found)
    if [[ "$pass_count" -gt 0 ]] && [[ "$fail_count" -gt 0 ]]; then
        verdict_log "ERROR: ambiguous verdict (both PASS and FAIL found) in ${file}"
        return 2
    fi

    # Determine result
    if [[ "$fail_count" -gt 0 ]]; then
        verdict_log "parsed FAIL from ${file}"
        return 1
    elif [[ "$pass_count" -gt 0 ]]; then
        verdict_log "parsed PASS from ${file}"
        return 0
    else
        verdict_log "ERROR: no verdict found in ${file}"
        return 2
    fi
}

# Show help
show_help() {
    cat <<EOF
NERVE parse-verdict.sh — Strict verdict parsing

Usage: $0 <report-file>

Arguments:
  report-file    Path to QA report file (e.g., qa-report.md)

Exit Codes:
  0  PASS verdict found
  1  FAIL verdict found
  2  ERROR (no verdict, file not found, or ambiguous)

Supported Formats:
  "**Status:** PASS" or "**Status:** FAIL"
  "VERDICT: PASS" or "VERDICT: FAIL"

Examples:
  $0 /path/to/qa-report.md
  $0 projects/my-site/review/qa-report.md

  # Check exit code
  if $0 report.md; then
    echo "QA passed"
  else
    echo "QA failed or error"
  fi
EOF
}

# Main entry point
main() {
    if [[ $# -lt 1 ]]; then
        show_help >&2
        exit 2
    fi

    case "$1" in
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            parse_verdict "$1"
            ;;
    esac
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
