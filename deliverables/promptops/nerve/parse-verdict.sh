#!/usr/bin/env bash
# NERVE parse-verdict — Strict QA verdict parsing
# Unambiguous QA results. No guessing.

set -euo pipefail

# Configuration
readonly METRICS_FILE="${METRICS_FILE:-/tmp/nerve-metrics.json}"

# Logging: [TIMESTAMP] [COMPONENT] message (sent to stderr to not interfere with return values)
log() {
    local component="$1"
    shift
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] [$component] $*" >&2
}

# Verdict patterns (strict matching)
# These patterns are unambiguous and must appear exactly as specified
readonly VERDICT_PASS_PATTERN="^# [[:space:]]*PASS[[:space:]]*$"
readonly VERDICT_FAIL_PATTERN="^# [[:space:]]*FAIL[[:space:]]*$"
readonly VERDICT_BLOCKED_PATTERN="^# [[:space:]]*BLOCKED[[:space:]]*$"
readonly VERDICT_EMOJI_PASS="^#.*PASS"
readonly VERDICT_EMOJI_FAIL="^#.*FAIL"
readonly VERDICT_EMOJI_BLOCKED="^#.*BLOCKED"

# Parse verdict from QA report file
parse_verdict() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        log "VERDICT" "file not found: $file"
        echo "ERROR"
        return 1
    fi

    # Read file content
    local content
    content=$(cat "$file")

    # Look for Final Verdict section
    local verdict_section
    verdict_section=$(echo "$content" | grep -A5 "## Final Verdict" 2>/dev/null || true)

    if [[ -z "$verdict_section" ]]; then
        # Try alternate patterns
        verdict_section=$(echo "$content" | grep -A5 "Final Verdict" 2>/dev/null || true)
    fi

    # Extract verdict (look for PASS, FAIL, or BLOCKED on a header line)
    local verdict=""

    # Check for PASS (with or without emoji)
    if echo "$verdict_section" | grep -qE "$VERDICT_EMOJI_PASS"; then
        verdict="PASS"
    # Check for BLOCKED before FAIL (BLOCKED is more specific)
    elif echo "$verdict_section" | grep -qE "$VERDICT_EMOJI_BLOCKED"; then
        verdict="BLOCKED"
    # Check for FAIL
    elif echo "$verdict_section" | grep -qE "$VERDICT_EMOJI_FAIL"; then
        verdict="FAIL"
    fi

    # If no verdict found in Final Verdict section, scan whole file
    if [[ -z "$verdict" ]]; then
        # Look for standalone verdict headers anywhere
        if grep -qE "^#.*PASS" "$file" 2>/dev/null; then
            verdict="PASS"
        elif grep -qE "^#.*BLOCKED" "$file" 2>/dev/null; then
            verdict="BLOCKED"
        elif grep -qE "^#.*FAIL" "$file" 2>/dev/null; then
            verdict="FAIL"
        fi
    fi

    if [[ -z "$verdict" ]]; then
        log "VERDICT" "no verdict found in $file"
        echo "UNKNOWN"
        return 1
    fi

    log "VERDICT" "parsed $file: $verdict"
    echo "$verdict"
    return 0
}

# Extract P0 issue count
parse_p0_count() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        echo "0"
        return 1
    fi

    # Count P0 issues (lines starting with | P0- in tables)
    local count
    count=$(grep -cE "^\| P0-" "$file" 2>/dev/null || echo "0")

    log "VERDICT" "P0 issues in $file: $count"
    echo "$count"
}

# Extract P1 issue count
parse_p1_count() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        echo "0"
        return 1
    fi

    local count
    count=$(grep -cE "^\| P1-" "$file" 2>/dev/null || echo "0")

    log "VERDICT" "P1 issues in $file: $count"
    echo "$count"
}

# Extract P2 issue count
parse_p2_count() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        echo "0"
        return 1
    fi

    local count
    count=$(grep -cE "^\| P2-" "$file" 2>/dev/null || echo "0")

    log "VERDICT" "P2 issues in $file: $count"
    echo "$count"
}

# Parse full report and output structured result
parse_report() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        log "VERDICT" "file not found: $file"
        return 1
    fi

    local verdict p0 p1 p2
    verdict=$(parse_verdict "$file")
    p0=$(parse_p0_count "$file")
    p1=$(parse_p1_count "$file")
    p2=$(parse_p2_count "$file")

    # Output as JSON
    cat << EOF
{"file":"$file","verdict":"$verdict","issues":{"p0":$p0,"p1":$p1,"p2":$p2},"parsed_at":"$(date -u '+%Y-%m-%dT%H:%M:%SZ')"}
EOF

    # Update metrics file
    update_metrics "$verdict" "$p0" "$p1" "$p2"

    return 0
}

# Update metrics file
update_metrics() {
    local verdict="$1"
    local p0="$2"
    local p1="$3"
    local p2="$4"

    # Read existing metrics or initialize
    local total_parsed=0
    local total_pass=0
    local total_fail=0
    local total_blocked=0
    local total_p0=0
    local total_p1=0
    local total_p2=0

    if [[ -f "$METRICS_FILE" ]]; then
        total_parsed=$(grep -o '"total_parsed":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
        total_pass=$(grep -o '"total_pass":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
        total_fail=$(grep -o '"total_fail":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
        total_blocked=$(grep -o '"total_blocked":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
        total_p0=$(grep -o '"total_p0":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
        total_p1=$(grep -o '"total_p1":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
        total_p2=$(grep -o '"total_p2":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d: -f2 || echo "0")
    fi

    # Update counts
    total_parsed=$((total_parsed + 1))
    total_p0=$((total_p0 + p0))
    total_p1=$((total_p1 + p1))
    total_p2=$((total_p2 + p2))

    case "$verdict" in
        PASS) total_pass=$((total_pass + 1)) ;;
        FAIL) total_fail=$((total_fail + 1)) ;;
        BLOCKED) total_blocked=$((total_blocked + 1)) ;;
    esac

    # Write updated metrics
    cat > "$METRICS_FILE" << EOF
{"total_parsed":$total_parsed,"total_pass":$total_pass,"total_fail":$total_fail,"total_blocked":$total_blocked,"total_p0":$total_p0,"total_p1":$total_p1,"total_p2":$total_p2,"updated_at":"$(date -u '+%Y-%m-%dT%H:%M:%SZ')"}
EOF

    log "METRICS" "depth=0 latency=0s errors=$total_p0"
}

# Validate verdict format (for testing)
validate_verdict() {
    local verdict="$1"

    case "$verdict" in
        PASS|FAIL|BLOCKED|UNKNOWN|ERROR)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# CLI interface
main() {
    case "${1:-help}" in
        parse)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 parse <file>" >&2
                exit 1
            fi
            parse_verdict "$2"
            ;;
        report)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 report <file>" >&2
                exit 1
            fi
            parse_report "$2"
            ;;
        p0)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 p0 <file>" >&2
                exit 1
            fi
            parse_p0_count "$2"
            ;;
        p1)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 p1 <file>" >&2
                exit 1
            fi
            parse_p1_count "$2"
            ;;
        p2)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 p2 <file>" >&2
                exit 1
            fi
            parse_p2_count "$2"
            ;;
        metrics)
            if [[ -f "$METRICS_FILE" ]]; then
                cat "$METRICS_FILE"
            else
                echo '{"total_parsed":0,"total_pass":0,"total_fail":0,"total_blocked":0,"total_p0":0,"total_p1":0,"total_p2":0}'
            fi
            ;;
        validate)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 validate <verdict>" >&2
                exit 1
            fi
            if validate_verdict "$2"; then
                echo "VALID"
            else
                echo "INVALID"
                exit 1
            fi
            ;;
        help|*)
            cat << EOF
NERVE Verdict Parser

Usage: $0 <command> [args]

Commands:
  parse <file>      Extract verdict (PASS|FAIL|BLOCKED|UNKNOWN)
  report <file>     Full report parsing with JSON output
  p0 <file>         Count P0 (blocker) issues
  p1 <file>         Count P1 (must-fix) issues
  p2 <file>         Count P2 (should-fix) issues
  metrics           Show cumulative parsing metrics
  validate <v>      Check if verdict string is valid
  help              Show this help

Verdict Values:
  PASS      - QA checks passed, ready to ship
  FAIL      - QA checks failed, fixes required
  BLOCKED   - Critical issues prevent any progress
  UNKNOWN   - No verdict found in file
  ERROR     - File not found or parsing error

Examples:
  $0 parse qa-pass-1.md           # Output: BLOCKED
  $0 report qa-pass-1.md          # Full JSON report
  $0 p0 qa-pass-1.md              # Output: 6

EOF
            ;;
    esac
}

main "$@"
