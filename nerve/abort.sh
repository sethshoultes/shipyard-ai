#!/usr/bin/env bash
# NERVE abort.sh — Abort flag management for graceful shutdown
# Part of NERVE: Operations Hardening for Autonomous Pipeline Daemon
#
# Usage:
#   ./abort.sh request  - Request daemon shutdown
#   ./abort.sh clear    - Clear abort flag
#   ./abort.sh status   - Show abort status
#   ./abort.sh check    - Check if abort requested (exit 0=yes, 1=no)
#
# As library:
#   source abort.sh
#   if abort_check; then echo "abort requested"; fi
#   abort_request
#   abort_clear

set -euo pipefail

# Bash version check (require 4.0+)
if [[ ${BASH_VERSION%%.*} -lt 4 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ABORT] ERROR: Bash 4.0+ required" >&2
    exit 2
fi

# Restrictive permissions
umask 0077

# Configuration (zero-config defaults)
readonly ABORT_FLAG="${NERVE_ABORT_FLAG:-/tmp/nerve.abort}"

# Logging function
abort_log() {
    local message="$1"
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "[${timestamp}] [ABORT] ${message}"
}

# Check if abort flag exists
# Returns: 0 (true) if abort requested, 1 (false) if not
abort_check() {
    if [[ -f "$ABORT_FLAG" ]]; then
        return 0
    else
        return 1
    fi
}

# Request abort - create the abort flag
abort_request() {
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

    echo "$timestamp" > "$ABORT_FLAG"
    abort_log "shutdown requested at ${timestamp}"
}

# Clear abort flag
abort_clear() {
    if [[ -f "$ABORT_FLAG" ]]; then
        rm -f "$ABORT_FLAG"
        abort_log "flag cleared"
    else
        abort_log "no flag to clear"
    fi
}

# Show abort status
abort_status() {
    if [[ -f "$ABORT_FLAG" ]]; then
        local requested_at
        requested_at="$(cat "$ABORT_FLAG" 2>/dev/null || echo "unknown")"
        echo "ABORT: ACTIVE"
        echo "Requested at: ${requested_at}"
        return 0
    else
        echo "ABORT: INACTIVE"
        return 1
    fi
}

# CLI interface when run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        request)
            abort_request
            ;;
        clear)
            abort_clear
            ;;
        status)
            abort_status
            ;;
        check)
            if abort_check; then
                exit 0
            else
                exit 1
            fi
            ;;
        *)
            echo "Usage: $0 {request|clear|status|check}" >&2
            echo ""
            echo "Commands:"
            echo "  request  Set abort flag to request daemon shutdown"
            echo "  clear    Clear abort flag"
            echo "  status   Show current abort status"
            echo "  check    Exit 0 if abort requested, 1 otherwise"
            exit 1
            ;;
    esac
fi
