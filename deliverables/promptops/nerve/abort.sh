#!/usr/bin/env bash
# NERVE abort — Abort flag management
# Stops runaway pipelines cleanly.

set -euo pipefail

# Configuration
readonly ABORT_FLAG="${ABORT_FLAG:-/tmp/nerve.abort}"
readonly PID_FILE="${PID_FILE:-/tmp/nerve.pid}"

# Logging: [TIMESTAMP] [COMPONENT] message
log() {
    local component="$1"
    shift
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] [$component] $*"
}

# Set abort flag
abort_set() {
    touch "$ABORT_FLAG"
    log "ABORT" "abort flag set"

    # Check if daemon is running
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "ABORT" "daemon (PID: $pid) will shutdown on next poll"
        fi
    fi
}

# Clear abort flag
abort_clear() {
    if [[ -f "$ABORT_FLAG" ]]; then
        rm -f "$ABORT_FLAG"
        log "ABORT" "abort flag cleared"
    else
        log "ABORT" "no abort flag present"
    fi
}

# Check abort flag status
abort_status() {
    if [[ -f "$ABORT_FLAG" ]]; then
        log "ABORT" "abort flag is SET"
        return 0
    else
        log "ABORT" "abort flag is CLEAR"
        return 1
    fi
}

# Force kill daemon (emergency use only)
abort_force() {
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "ABORT" "sending SIGTERM to daemon (PID: $pid)"
            kill -TERM "$pid"

            # Wait up to 5 seconds for graceful shutdown
            local wait=0
            while kill -0 "$pid" 2>/dev/null && [[ "$wait" -lt 5 ]]; do
                sleep 1
                wait=$((wait + 1))
            done

            if kill -0 "$pid" 2>/dev/null; then
                log "ABORT" "daemon not responding, sending SIGKILL"
                kill -KILL "$pid"
            fi

            rm -f "$PID_FILE"
            log "ABORT" "daemon terminated"
        else
            log "ABORT" "no daemon running (stale PID file removed)"
            rm -f "$PID_FILE"
        fi
    else
        log "ABORT" "no daemon PID file found"
    fi

    # Clear any abort flag
    rm -f "$ABORT_FLAG"
}

# Wait for daemon to shutdown after setting abort
abort_wait() {
    local timeout="${1:-30}"
    local elapsed=0

    if [[ ! -f "$PID_FILE" ]]; then
        log "ABORT" "no daemon running"
        return 0
    fi

    local pid
    pid=$(cat "$PID_FILE")

    # Set abort flag
    abort_set

    log "ABORT" "waiting for daemon (PID: $pid) to shutdown (timeout: ${timeout}s)"

    while kill -0 "$pid" 2>/dev/null && [[ "$elapsed" -lt "$timeout" ]]; do
        sleep 1
        elapsed=$((elapsed + 1))
    done

    if kill -0 "$pid" 2>/dev/null; then
        log "ABORT" "daemon did not shutdown within ${timeout}s"
        return 1
    else
        log "ABORT" "daemon shutdown complete after ${elapsed}s"
        return 0
    fi
}

# CLI interface
main() {
    case "${1:-help}" in
        set)
            abort_set
            ;;
        clear)
            abort_clear
            ;;
        status)
            abort_status
            ;;
        force)
            abort_force
            ;;
        wait)
            abort_wait "${2:-30}"
            ;;
        help|*)
            cat << EOF
NERVE Abort Manager

Usage: $0 <command> [args]

Commands:
  set           Set abort flag (graceful shutdown request)
  clear         Clear abort flag
  status        Check if abort flag is set
  force         Force kill daemon (SIGTERM, then SIGKILL)
  wait [secs]   Set abort and wait for shutdown (default: 30s)
  help          Show this help

Abort Mechanism:
  The NERVE daemon checks for the abort flag at each poll interval.
  When detected, it completes the current item and shuts down cleanly.
  Use 'force' only when graceful shutdown fails.

Files:
  Abort flag: $ABORT_FLAG
  PID file:   $PID_FILE

EOF
            ;;
    esac
}

main "$@"
