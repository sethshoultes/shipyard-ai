#!/usr/bin/env bash
#
# NERVE Verdict Parser — Strict QA verdict parsing
# Returns JSON with verdict and issue counts
#

set -euo pipefail

# Logging function: [TIMESTAMP] [COMPONENT] message
log() {
    local component="$1"
    local message="$2"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [${component}] ${message}" >&2
}

# Parse verdict from QA report file
parse_file() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        log "VERDICT" "file not found: ${file}"
        echo '{"verdict": "ERROR", "error": "file not found", "p0_count": 0, "p1_count": 0, "p2_count": 0}'
        return 1
    fi

    local content
    content=$(cat "$file")
    parse_content "$content"
}

# Parse verdict from stdin or string
parse_content() {
    local content="${1:-$(cat)}"

    local verdict="UNKNOWN"
    local p0_count=0
    local p1_count=0
    local p2_count=0

    # Detect verdict patterns (case-insensitive)
    # Priority order: BLOCKED > FAIL > PASS
    if echo "$content" | grep -qiE '(BLOCKED|Status:.*BLOCKED|Verdict:.*BLOCKED)'; then
        verdict="BLOCKED"
    elif echo "$content" | grep -qiE '(FAIL|Status:.*FAIL|Verdict:.*FAIL)'; then
        verdict="FAIL"
    elif echo "$content" | grep -qiE '(PASS|Status:.*PASS|Verdict:.*PASS)'; then
        verdict="PASS"
    fi

    # Count P0 issues
    p0_count=$(echo "$content" | grep -cE '^[|].*P0.*[|]' 2>/dev/null || echo "0")
    if [[ "$p0_count" -eq 0 ]]; then
        p0_count=$(echo "$content" | grep -cE 'P0[-_]' 2>/dev/null || echo "0")
    fi

    # Count P1 issues
    p1_count=$(echo "$content" | grep -cE '^[|].*P1.*[|]' 2>/dev/null || echo "0")
    if [[ "$p1_count" -eq 0 ]]; then
        p1_count=$(echo "$content" | grep -cE 'P1[-_]' 2>/dev/null || echo "0")
    fi

    # Count P2 issues
    p2_count=$(echo "$content" | grep -cE '^[|].*P2.*[|]' 2>/dev/null || echo "0")
    if [[ "$p2_count" -eq 0 ]]; then
        p2_count=$(echo "$content" | grep -cE 'P2[-_]' 2>/dev/null || echo "0")
    fi

    local total_issues=$((p0_count + p1_count + p2_count))

    log "VERDICT" "parsed verdict=${verdict} p0=${p0_count} p1=${p1_count} p2=${p2_count}"

    # Output JSON
    cat << EOFJ
{
    "verdict": "${verdict}",
    "p0_count": ${p0_count},
    "p1_count": ${p1_count},
    "p2_count": ${p2_count},
    "total_issues": ${total_issues},
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOFJ
}

# Validate verdict is one of expected values
validate_verdict() {
    local verdict="$1"

    case "$verdict" in
        PASS|FAIL|BLOCKED)
            log "VERDICT" "valid verdict: ${verdict}"
            return 0
            ;;
        *)
            log "VERDICT" "invalid verdict: ${verdict}"
            return 1
            ;;
    esac
}

# Quick check if report passed
is_passing() {
    local file="$1"
    local result
    result=$(parse_file "$file" 2>/dev/null)
    local verdict
    verdict=$(echo "$result" | grep -oP '"verdict":\s*"\K[^"]+')

    if [[ "$verdict" == "PASS" ]]; then
        log "VERDICT" "report is passing"
        return 0
    else
        log "VERDICT" "report is not passing (verdict: ${verdict})"
        return 1
    fi
}

# Main entry point
main() {
    local command="${1:-help}"

    case "$command" in
        file)
            if [[ -z "${2:-}" ]]; then
                echo "Usage: $0 file <path>"
                exit 1
            fi
            parse_file "$2"
            ;;
        stdin)
            parse_content
            ;;
        check)
            if [[ -z "${2:-}" ]]; then
                echo "Usage: $0 check <path>"
                exit 1
            fi
            is_passing "$2"
            ;;
        validate)
            if [[ -z "${2:-}" ]]; then
                echo "Usage: $0 validate <verdict>"
                exit 1
            fi
            validate_verdict "$2"
            ;;
        help|*)
            echo "NERVE Verdict Parser"
            echo ""
            echo "Usage: $0 <command> [args]"
            echo ""
            echo "Commands:"
            echo "  file <path>       Parse QA report file, output JSON"
            echo "  stdin             Parse QA report from stdin, output JSON"
            echo "  check <path>      Check if report is passing (exit 0 if PASS)"
            echo "  validate <v>      Validate verdict string (PASS|FAIL|BLOCKED)"
            echo "  help              Show this help"
            echo ""
            echo "Output JSON format:"
            echo '  {"verdict": "PASS|FAIL|BLOCKED", "p0_count": N, "p1_count": N, "p2_count": N}'
            ;;
    esac
}

main "$@"
