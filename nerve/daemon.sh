#!/usr/bin/env bash
# NERVE daemon.sh — Main daemon loop with PID lockfile
# Part of NERVE: Operations Hardening for Autonomous Pipeline Daemon
#
# Usage: ./daemon.sh [--once]
#   --once: Process one queue item and exit (for testing)
#
# Exit codes:
#   0 - Clean shutdown
#   1 - Already running
#   2 - Initialization error

set -euo pipefail

# Bash version check (require 4.0+)
if [[ ${BASH_VERSION%%.*} -lt 4 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [DAEMON] ERROR: Bash 4.0+ required, found $BASH_VERSION" >&2
    exit 2
fi

# Restrictive permissions for files we create
umask 0077

# Configuration (zero-config defaults)
readonly NERVE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOCK_DIR="${NERVE_LOCK_DIR:-/tmp/nerve.lock}"
readonly LOCKFILE="${LOCK_DIR}/pid"
readonly POLL_INTERVAL="${NERVE_POLL_INTERVAL:-5}"
readonly HEARTBEAT_INTERVAL="${NERVE_HEARTBEAT_INTERVAL:-12}"
readonly METRICS_FILE="${NERVE_METRICS_FILE:-/tmp/nerve-metrics.json}"
readonly LOG_FILE="${NERVE_LOG_FILE:-}"

# State
ITERATION=0
ERROR_COUNT=0
LAST_LATENCY=0
SHUTDOWN_REQUESTED=0

# Source companion scripts
# shellcheck source=queue.sh
source "${NERVE_DIR}/queue.sh"
# shellcheck source=abort.sh
source "${NERVE_DIR}/abort.sh"

# Logging function - clinical format
log() {
    local component="$1"
    local message="$2"
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    local line="[${timestamp}] [${component}] ${message}"

    if [[ -n "$LOG_FILE" ]]; then
        echo "$line" >> "$LOG_FILE"
    fi
    echo "$line"
}

# Write metrics to JSON file (atomic: write temp, then mv)
metrics_update() {
    local depth="$1"
    local latency="$2"
    local errors="$3"
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    local temp_file="${METRICS_FILE}.tmp"

    cat > "$temp_file" <<EOF
{"queue_depth":${depth},"latency_last":${latency},"error_count":${errors},"timestamp":"${timestamp}"}
EOF
    mv "$temp_file" "$METRICS_FILE"
}

# Log metrics periodically
metrics_log() {
    local depth
    depth="$(queue_depth)"
    log "METRICS" "depth=${depth} latency=${LAST_LATENCY}s errors=${ERROR_COUNT}"
}

# Acquire lock - prevent duplicate daemon instances
# Uses atomic mkdir to prevent TOCTOU race condition
acquire_lock() {
    # Check for stale lock first
    if [[ -d "$LOCK_DIR" ]]; then
        local existing_pid
        existing_pid="$(cat "$LOCKFILE" 2>/dev/null || echo "")"

        if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
            log "DAEMON" "already running (PID: ${existing_pid})"
            return 1
        else
            log "DAEMON" "cleaning stale lock (was PID: ${existing_pid})"
            rm -rf "$LOCK_DIR"
        fi
    fi

    # Atomic lock acquisition using mkdir (POSIX atomic operation)
    if ! mkdir "$LOCK_DIR" 2>/dev/null; then
        # Another process acquired the lock between our check and mkdir
        log "DAEMON" "lock acquisition failed (race condition avoided)"
        return 1
    fi

    # Write PID to lock directory
    echo "$$" > "$LOCKFILE"
    log "DAEMON" "started (PID: $$)"
    return 0
}

# Release lock on shutdown
release_lock() {
    if [[ -d "$LOCK_DIR" ]]; then
        local lock_pid
        lock_pid="$(cat "$LOCKFILE" 2>/dev/null || echo "")"
        if [[ "$lock_pid" == "$$" ]]; then
            rm -rf "$LOCK_DIR"
        fi
    fi
    log "DAEMON" "shutdown complete"
}

# Signal handler for graceful shutdown
handle_shutdown() {
    SHUTDOWN_REQUESTED=1
    log "DAEMON" "shutdown signal received, completing current work"
}

# Process a single queue item
process_item() {
    local item_id="$1"
    local item_file="${QUEUE_DIR}/running/${item_id}.json"
    local start_time end_time duration

    start_time=$(date +%s.%N)

    log "QUEUE" "processing item ${item_id}"

    # Read item payload (if we need to do something with it)
    if [[ -f "$item_file" ]]; then
        # In a real implementation, parse payload and execute task
        # For now, simulate processing
        local payload
        payload="$(cat "$item_file")"

        # Check for verdict file in payload
        local verdict_file
        verdict_file="$(echo "$payload" | grep -o '"verdict_file":"[^"]*"' | cut -d'"' -f4 || echo "")"

        if [[ -n "$verdict_file" ]] && [[ -f "$verdict_file" ]]; then
            if "${NERVE_DIR}/parse-verdict.sh" "$verdict_file"; then
                queue_complete "$item_id"
            else
                queue_fail "$item_id" "verdict FAIL"
                ((ERROR_COUNT++))
            fi
        else
            # No verdict file, just complete the item
            queue_complete "$item_id"
        fi
    else
        queue_fail "$item_id" "item file missing"
        ((ERROR_COUNT++))
    fi

    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0")
    LAST_LATENCY="${duration%.*}"
    [[ -z "$LAST_LATENCY" ]] && LAST_LATENCY=0

    return 0
}

# Main daemon loop
main() {
    local run_once=0

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --once)
                run_once=1
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--once]"
                echo "  --once: Process one item and exit"
                exit 0
                ;;
            *)
                echo "Unknown argument: $1" >&2
                exit 2
                ;;
        esac
    done

    # Acquire lock or exit
    if ! acquire_lock; then
        exit 1
    fi

    # Set up signal handlers (SIGHUP for terminal hangup)
    trap 'handle_shutdown' SIGTERM SIGINT SIGHUP
    trap 'release_lock' EXIT

    # Initialize queue
    queue_init

    # Initialize metrics
    metrics_update 0 0 0

    # Main loop
    while [[ $SHUTDOWN_REQUESTED -eq 0 ]]; do
        # Check abort flag
        if abort_check; then
            log "DAEMON" "abort flag detected, draining queue"
            SHUTDOWN_REQUESTED=1
            continue
        fi

        # Process queue items
        local item_id
        item_id="$(queue_dequeue)"

        if [[ -n "$item_id" ]]; then
            process_item "$item_id"
        fi

        # Update metrics
        local depth
        depth="$(queue_depth)"
        metrics_update "$depth" "$LAST_LATENCY" "$ERROR_COUNT"

        # Heartbeat logging
        ((ITERATION++))
        if [[ $((ITERATION % HEARTBEAT_INTERVAL)) -eq 0 ]]; then
            metrics_log
        fi

        # Exit after one iteration if --once
        if [[ $run_once -eq 1 ]]; then
            break
        fi

        # Sleep if queue is empty
        if [[ -z "$item_id" ]]; then
            sleep "$POLL_INTERVAL"
        fi
    done

    # Final metrics log
    metrics_log

    exit 0
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
