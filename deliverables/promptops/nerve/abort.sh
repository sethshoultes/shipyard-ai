#!/usr/bin/env bash
#
# NERVE Abort — Abort flag management
# Stops runaway pipelines cleanly
#

set -euo pipefail

# Configuration
PID_FILE="/tmp/nerve.pid"
ABORT_FLAG="/tmp/nerve.abort"

# Logging function: [TIMESTAMP] [COMPONENT] message
log() {
    local component="$1"
    local message="$2"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [${component}] ${message}"
}

# Set abort flag
set_abort() {
    touch "$ABORT_FLAG"
    log "ABORT" "flag set"

    # Check if daemon is running
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "ABORT" "daemon will shutdown on next poll (PID: ${pid})"
        else
            log "ABORT" "daemon not running (stale PID file)"
        fi
    else
        log "ABORT" "no daemon running"
    fi
}

# Clear abort flag
clear_abort() {
    if [[ -f "$ABORT_FLAG" ]]; then
        rm -f "$ABORT_FLAG"
        log "ABORT" "flag cleared"
    else
        log "ABORT" "no flag to clear"
    fi
}

# Check abort flag status
check_abort() {
    if [[ -f "$ABORT_FLAG" ]]; then
        log "ABORT" "flag is set"
        return 0
    else
        log "ABORT" "flag is not set"
        return 1
    fi
}

# Force immediate shutdown (send SIGTERM)
force_abort() {
    set_abort

    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "ABORT" "sending SIGTERM to daemon (PID: ${pid})"
            kill -TERM "$pid" 2>/dev/null || true

            # Wait up to 5 seconds for graceful shutdown
            local count=0
            while kill -0 "$pid" 2>/dev/null && [[ $count -lt 5 ]]; do
                sleep 1
                ((count++))
            done

            if kill -0 "$pid" 2>/dev/null; then
                log "ABORT" "daemon did not respond to SIGTERM, sending SIGKILL"
                kill -KILL "$pid" 2>/dev/null || true
            else
                log "ABORT" "daemon shutdown complete"
            fi
        else
            log "ABORT" "daemon not running"
        fi
    else
        log "ABORT" "no PID file found"
    fi
}

# Wait for daemon to shutdown
wait_shutdown() {
    local timeout="${1:-30}"
    local count=0

    if [[ ! -f "$PID_FILE" ]]; then
        log "ABORT" "no daemon to wait for"
        return 0
    fi

    local pid
    pid=$(cat "$PID_FILE")

    log "ABORT" "waiting for daemon shutdown (timeout: ${timeout}s)"

    while kill -0 "$pid" 2>/dev/null && [[ $count -lt $timeout ]]; do
        sleep 1
        ((count++))
    done

    if kill -0 "$pid" 2>/dev/null; then
        log "ABORT" "timeout waiting for daemon shutdown"
        return 1
    else
        log "ABORT" "daemon shutdown confirmed"
        return 0
    fi
}

# Main entry point
main() {
    local command="${1:-help}"

    case "$command" in
        set)
            set_abort
            ;;
        clear)
            clear_abort
            ;;
        check)
            check_abort
            ;;
        force)
            force_abort
            ;;
        wait)
            wait_shutdown "${2:-30}"
            ;;
        help|*)
            echo "NERVE Abort Manager"
            echo ""
            echo "Usage: $0 <command> [args]"
            echo ""
            echo "Commands:"
            echo "  set               Set abort flag (graceful shutdown request)"
            echo "  clear             Clear abort flag"
            echo "  check             Check if abort flag is set (exit 0 if set, 1 if not)"
            echo "  force             Force immediate shutdown (SIGTERM, then SIGKILL)"
            echo "  wait [timeout]    Wait for daemon shutdown (default: 30s)"
            echo "  help              Show this help"
            ;;
    esac
}

main "$@"
