#!/usr/bin/env bash
# NERVE daemon — Main daemon loop with PID lockfile
# Deterministic. Invisible. Unbreakable.

set -euo pipefail

# Configuration (zero configuration philosophy — opinionated defaults)
readonly PID_FILE="/tmp/nerve.pid"
readonly ABORT_FLAG="/tmp/nerve.abort"
readonly QUEUE_DIR="/tmp/nerve-queue"
readonly POLL_INTERVAL=1

# Logging: [TIMESTAMP] [COMPONENT] message (clinical, greppable)
log() {
    local component="$1"
    shift
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] [$component] $*"
}

# Check if another daemon instance is running
check_lockfile() {
    if [[ -f "$PID_FILE" ]]; then
        local existing_pid
        existing_pid=$(cat "$PID_FILE")
        if kill -0 "$existing_pid" 2>/dev/null; then
            log "DAEMON" "another instance running (PID: $existing_pid)"
            exit 1
        else
            log "DAEMON" "stale PID file found, removing"
            rm -f "$PID_FILE"
        fi
    fi
}

# Acquire lockfile
acquire_lock() {
    echo $$ > "$PID_FILE"
    log "DAEMON" "started (PID: $$)"
}

# Release lockfile
release_lock() {
    rm -f "$PID_FILE"
    log "DAEMON" "shutdown complete"
}

# Check for abort flag
check_abort() {
    if [[ -f "$ABORT_FLAG" ]]; then
        log "ABORT" "shutdown requested"
        return 0
    fi
    return 1
}

# Main daemon loop
daemon_loop() {
    local items_processed=0
    local start_time
    start_time=$(date +%s)

    # Ensure queue directory exists
    mkdir -p "$QUEUE_DIR"

    # Initialize queue
    source "$(dirname "$0")/queue.sh"
    queue_init

    while true; do
        # Check for abort
        if check_abort; then
            rm -f "$ABORT_FLAG"
            break
        fi

        # Process queue items
        local queue_depth
        queue_depth=$(queue_depth)

        if [[ "$queue_depth" -gt 0 ]]; then
            local item_start
            item_start=$(date +%s.%N)

            local item
            item=$(queue_pop)

            if [[ -n "$item" ]]; then
                # Process the item (execute the QA pipeline for this item)
                process_item "$item"

                local item_end
                item_end=$(date +%s.%N)
                local latency
                latency=$(echo "$item_end - $item_start" | bc)

                items_processed=$((items_processed + 1))
                log "QUEUE" "processed item $item in ${latency}s"
            fi
        fi

        sleep "$POLL_INTERVAL"
    done

    local end_time
    end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    log "METRICS" "session complete: processed=$items_processed runtime=${total_time}s"
}

# Process a single queue item
process_item() {
    local item="$1"

    # Parse the item (expected format: JSON with id, type, payload)
    local item_file="$QUEUE_DIR/processing/$item"

    if [[ ! -f "$item_file" ]]; then
        log "DAEMON" "item file not found: $item"
        return 1
    fi

    # Execute the pipeline for this item
    local item_type
    item_type=$(grep -o '"type":"[^"]*"' "$item_file" | cut -d'"' -f4)

    case "$item_type" in
        "qa-pass")
            # Run QA verdict parsing
            local verdict_file
            verdict_file=$(grep -o '"payload":"[^"]*"' "$item_file" | cut -d'"' -f4)
            if [[ -f "$verdict_file" ]]; then
                source "$(dirname "$0")/parse-verdict.sh"
                parse_verdict "$verdict_file"
            fi
            ;;
        *)
            log "DAEMON" "unknown item type: $item_type"
            ;;
    esac

    # Clean up processed item
    rm -f "$item_file"
}

# Signal handlers
cleanup() {
    log "DAEMON" "received signal, shutting down"
    release_lock
    exit 0
}

trap cleanup SIGTERM SIGINT SIGHUP

# Main entry point
main() {
    case "${1:-start}" in
        start)
            check_lockfile
            acquire_lock
            daemon_loop
            release_lock
            ;;
        status)
            if [[ -f "$PID_FILE" ]]; then
                local pid
                pid=$(cat "$PID_FILE")
                if kill -0 "$pid" 2>/dev/null; then
                    log "DAEMON" "running (PID: $pid)"
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
