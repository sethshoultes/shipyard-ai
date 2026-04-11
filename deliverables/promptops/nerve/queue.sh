#!/usr/bin/env bash
# NERVE queue — Queue persistence and recovery
# Survives crashes, no lost state.

set -euo pipefail

# Configuration
readonly QUEUE_DIR="${QUEUE_DIR:-/tmp/nerve-queue}"
readonly QUEUE_PENDING="$QUEUE_DIR/pending"
readonly QUEUE_PROCESSING="$QUEUE_DIR/processing"
readonly QUEUE_COMPLETED="$QUEUE_DIR/completed"
readonly QUEUE_FAILED="$QUEUE_DIR/failed"

# Logging: [TIMESTAMP] [COMPONENT] message
log() {
    local component="$1"
    shift
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] [$component] $*"
}

# Initialize queue directories
queue_init() {
    mkdir -p "$QUEUE_PENDING" "$QUEUE_PROCESSING" "$QUEUE_COMPLETED" "$QUEUE_FAILED"

    # Recover any items left in processing state (crash recovery)
    local recovered=0
    if [[ -d "$QUEUE_PROCESSING" ]]; then
        for item in "$QUEUE_PROCESSING"/*; do
            if [[ -f "$item" ]]; then
                local item_name
                item_name=$(basename "$item")
                mv "$item" "$QUEUE_PENDING/$item_name"
                recovered=$((recovered + 1))
            fi
        done
    fi

    local pending_count
    pending_count=$(queue_depth)

    if [[ "$recovered" -gt 0 ]]; then
        log "QUEUE" "initialized with $pending_count pending items (recovered $recovered)"
    else
        log "QUEUE" "initialized with $pending_count pending items"
    fi
}

# Get queue depth (number of pending items)
queue_depth() {
    if [[ -d "$QUEUE_PENDING" ]]; then
        find "$QUEUE_PENDING" -maxdepth 1 -type f 2>/dev/null | wc -l
    else
        echo 0
    fi
}

# Add item to queue
queue_push() {
    local item_type="$1"
    local payload="$2"

    # Generate unique item ID
    local item_id
    item_id=$(date +%s%N | sha256sum | head -c 12)

    local item_file="$QUEUE_PENDING/$item_id"

    # Write item atomically (write to temp, then move)
    local temp_file="$QUEUE_DIR/.tmp-$item_id"
    cat > "$temp_file" << EOF
{"id":"$item_id","type":"$item_type","payload":"$payload","queued_at":"$(date -u '+%Y-%m-%dT%H:%M:%SZ')"}
EOF
    mv "$temp_file" "$item_file"

    log "QUEUE" "pushed item $item_id (type: $item_type)"
    echo "$item_id"
}

# Pop item from queue (moves to processing)
queue_pop() {
    # Get oldest pending item (FIFO)
    local oldest_item
    oldest_item=$(find "$QUEUE_PENDING" -maxdepth 1 -type f -printf '%T+ %p\n' 2>/dev/null | sort | head -1 | cut -d' ' -f2-)

    if [[ -z "$oldest_item" || ! -f "$oldest_item" ]]; then
        return 0
    fi

    local item_name
    item_name=$(basename "$oldest_item")

    # Move to processing atomically
    mv "$oldest_item" "$QUEUE_PROCESSING/$item_name"

    echo "$item_name"
}

# Mark item as completed
queue_complete() {
    local item_id="$1"
    local processing_file="$QUEUE_PROCESSING/$item_id"

    if [[ -f "$processing_file" ]]; then
        mv "$processing_file" "$QUEUE_COMPLETED/$item_id"
        log "QUEUE" "completed item $item_id"
    fi
}

# Mark item as failed
queue_fail() {
    local item_id="$1"
    local reason="${2:-unknown}"
    local processing_file="$QUEUE_PROCESSING/$item_id"

    if [[ -f "$processing_file" ]]; then
        # Append failure reason
        echo "\"failed_at\":\"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\",\"reason\":\"$reason\"" >> "$processing_file"
        mv "$processing_file" "$QUEUE_FAILED/$item_id"
        log "QUEUE" "failed item $item_id: $reason"
    fi
}

# List queue contents
queue_list() {
    local state="${1:-pending}"
    local dir

    case "$state" in
        pending)    dir="$QUEUE_PENDING" ;;
        processing) dir="$QUEUE_PROCESSING" ;;
        completed)  dir="$QUEUE_COMPLETED" ;;
        failed)     dir="$QUEUE_FAILED" ;;
        *)
            echo "Unknown state: $state" >&2
            return 1
            ;;
    esac

    if [[ -d "$dir" ]]; then
        find "$dir" -maxdepth 1 -type f -exec basename {} \;
    fi
}

# Get queue metrics
queue_metrics() {
    local pending processing completed failed

    pending=$(find "$QUEUE_PENDING" -maxdepth 1 -type f 2>/dev/null | wc -l)
    processing=$(find "$QUEUE_PROCESSING" -maxdepth 1 -type f 2>/dev/null | wc -l)
    completed=$(find "$QUEUE_COMPLETED" -maxdepth 1 -type f 2>/dev/null | wc -l)
    failed=$(find "$QUEUE_FAILED" -maxdepth 1 -type f 2>/dev/null | wc -l)

    log "METRICS" "depth=$pending processing=$processing completed=$completed errors=$failed"
}

# Purge completed items older than N days
queue_purge() {
    local days="${1:-7}"

    local purged=0
    while IFS= read -r file; do
        rm -f "$file"
        purged=$((purged + 1))
    done < <(find "$QUEUE_COMPLETED" -maxdepth 1 -type f -mtime +"$days" 2>/dev/null)

    if [[ "$purged" -gt 0 ]]; then
        log "QUEUE" "purged $purged completed items older than $days days"
    fi
}

# CLI interface (when run directly)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-help}" in
        init)
            queue_init
            ;;
        push)
            if [[ $# -lt 3 ]]; then
                echo "Usage: $0 push <type> <payload>" >&2
                exit 1
            fi
            queue_push "$2" "$3"
            ;;
        pop)
            queue_pop
            ;;
        complete)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 complete <item_id>" >&2
                exit 1
            fi
            queue_complete "$2"
            ;;
        fail)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 fail <item_id> [reason]" >&2
                exit 1
            fi
            queue_fail "$2" "${3:-}"
            ;;
        list)
            queue_list "${2:-pending}"
            ;;
        depth)
            queue_depth
            ;;
        metrics)
            queue_metrics
            ;;
        purge)
            queue_purge "${2:-7}"
            ;;
        help|*)
            cat << EOF
NERVE Queue Manager

Usage: $0 <command> [args]

Commands:
  init              Initialize queue directories (with crash recovery)
  push <type> <p>   Add item to queue
  pop               Get next item for processing
  complete <id>     Mark item as completed
  fail <id> [msg]   Mark item as failed
  list [state]      List items (pending|processing|completed|failed)
  depth             Show pending queue depth
  metrics           Show queue metrics
  purge [days]      Remove completed items older than N days (default: 7)
  help              Show this help

EOF
            ;;
    esac
fi
