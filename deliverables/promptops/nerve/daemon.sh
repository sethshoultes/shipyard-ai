#!/usr/bin/env bash
#
# NERVE Daemon — Main daemon loop with PID lockfile
# Prevents duplicate daemon instances
#

set -euo pipefail

# Configuration
PID_FILE="/tmp/nerve.pid"
ABORT_FLAG="/tmp/nerve.abort"
QUEUE_DIR="/tmp/nerve-queue"
POLL_INTERVAL=1

# Logging function: [TIMESTAMP] [COMPONENT] message
log() {
    local component="$1"
    local message="$2"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [${component}] ${message}"
}

# Check if daemon is already running
check_lockfile() {
    if [[ -f "$PID_FILE" ]]; then
        local existing_pid
        existing_pid=$(cat "$PID_FILE")
        if kill -0 "$existing_pid" 2>/dev/null; then
            log "DAEMON" "already running (PID: ${existing_pid})"
            exit 1
        else
            log "DAEMON" "stale lockfile found, removing"
            rm -f "$PID_FILE"
        fi
    fi
}

# Create PID lockfile
create_lockfile() {
    echo $$ > "$PID_FILE"
    log "DAEMON" "started (PID: $$)"
}

# Remove PID lockfile
remove_lockfile() {
    rm -f "$PID_FILE"
    log "DAEMON" "lockfile removed"
}

# Cleanup on exit
cleanup() {
    remove_lockfile
    rm -f "$ABORT_FLAG"
    log "DAEMON" "shutdown complete"
}

# Process queue items
process_queue() {
    if [[ ! -d "$QUEUE_DIR" ]]; then
        return 0
    fi

    local items
    items=$(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" 2>/dev/null | sort)

    for item in $items; do
        if [[ -f "$item" ]]; then
            local item_id
            item_id=$(basename "$item" .job)
            local start_time
            start_time=$(date +%s.%N)

            # Execute job (source it to run commands)
            if bash "$item" 2>/dev/null; then
                local end_time
                end_time=$(date +%s.%N)
                local duration
                duration=$(echo "$end_time - $start_time" | bc)
                log "QUEUE" "processed item ${item_id} in ${duration}s"
                rm -f "$item"
            else
                log "QUEUE" "failed to process item ${item_id}"
            fi
        fi

        # Check abort flag between items
        if [[ -f "$ABORT_FLAG" ]]; then
            return 1
        fi
    done
}

# Main daemon loop
main_loop() {
    while true; do
        # Check for abort flag
        if [[ -f "$ABORT_FLAG" ]]; then
            log "ABORT" "shutdown requested"
            break
        fi

        # Process queue
        if ! process_queue; then
            break
        fi

        # Wait before next poll
        sleep "$POLL_INTERVAL"
    done
}

# Main entry point
main() {
    local command="${1:-start}"

    case "$command" in
        start)
            check_lockfile
            create_lockfile
            trap cleanup EXIT

            # Ensure queue directory exists
            mkdir -p "$QUEUE_DIR"

            main_loop
            ;;
        status)
            if [[ -f "$PID_FILE" ]]; then
                local pid
                pid=$(cat "$PID_FILE")
                if kill -0 "$pid" 2>/dev/null; then
                    log "DAEMON" "running (PID: ${pid})"
                    exit 0
                else
                    log "DAEMON" "not running (stale PID file)"
                    exit 1
                fi
            else
                log "DAEMON" "not running"
                exit 1
            fi
            ;;
        *)
            echo "Usage: $0 {start|status}"
            exit 1
            ;;
    esac
}

main "$@"
