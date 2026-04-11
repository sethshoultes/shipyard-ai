#!/usr/bin/env bash
# NERVE queue.sh — Queue persistence and recovery
# Part of NERVE: Operations Hardening for Autonomous Pipeline Daemon
#
# Usage: Source this file, then call queue_* functions
#   source queue.sh
#   queue_init
#   queue_enqueue "item-id" '{"payload":"data"}'
#   item_id=$(queue_dequeue)
#   queue_complete "$item_id"
#   queue_fail "$item_id" "reason"
#   count=$(queue_depth)
#
# Standalone commands:
#   ./queue.sh init     - Initialize queue directories
#   ./queue.sh enqueue <id> <payload> - Add item to queue
#   ./queue.sh depth    - Show pending count
#   ./queue.sh list     - List all items by status
#   ./queue.sh recover  - Recover crashed items

set -euo pipefail

# Bash version check (require 4.0+)
if [[ ${BASH_VERSION%%.*} -lt 4 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [QUEUE] ERROR: Bash 4.0+ required" >&2
    exit 2
fi

# Restrictive permissions
umask 0077

# Configuration (zero-config defaults)
QUEUE_DIR="${NERVE_QUEUE_DIR:-/tmp/nerve-queue}"

# Logging function
queue_log() {
    local message="$1"
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "[${timestamp}] [QUEUE] ${message}"
}

# Helper: list files in a directory
_list_files() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        find "$dir" -maxdepth 1 -name "*.json" -type f 2>/dev/null || true
    fi
}

# Initialize queue directories
queue_init() {
    mkdir -p "${QUEUE_DIR}/pending"
    mkdir -p "${QUEUE_DIR}/running"
    mkdir -p "${QUEUE_DIR}/completed"
    mkdir -p "${QUEUE_DIR}/failed"

    # Crash recovery: move any items left in running/ back to pending/
    local recovered=0
    local files
    files="$(_list_files "${QUEUE_DIR}/running")"

    if [[ -n "$files" ]]; then
        while IFS= read -r item; do
            [[ -f "$item" ]] || continue
            local basename
            basename="$(basename "$item")"
            mv "$item" "${QUEUE_DIR}/pending/${basename}"
            recovered=$((recovered + 1))
        done <<< "$files"
    fi

    if [[ $recovered -gt 0 ]]; then
        queue_log "recovered ${recovered} items from crashed state"
    fi

    local pending_count
    pending_count="$(queue_depth)"
    queue_log "initialized with ${pending_count} pending items"
}

# Enqueue a new item
queue_enqueue() {
    local item_id="$1"
    local payload="${2:-{}}"
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

    # Validate item_id (alphanumeric, dashes, underscores only)
    if [[ ! "$item_id" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        queue_log "ERROR: invalid item_id: ${item_id}"
        return 1
    fi

    local item_file="${QUEUE_DIR}/pending/${item_id}.json"

    # Check for duplicate
    if [[ -f "$item_file" ]]; then
        queue_log "ERROR: item ${item_id} already exists"
        return 1
    fi

    # Write item file
    cat > "$item_file" <<EOF
{"id":"${item_id}","status":"pending","created":"${timestamp}","payload":${payload}}
EOF

    queue_log "enqueued item ${item_id}"
    return 0
}

# Dequeue the oldest pending item
queue_dequeue() {
    local oldest_file=""
    local oldest_time=""

    # Find oldest file in pending/
    local files
    files="$(_list_files "${QUEUE_DIR}/pending")"

    if [[ -n "$files" ]]; then
        while IFS= read -r item; do
            [[ -f "$item" ]] || continue

            # Get file modification time (portable)
            local mtime
            if stat --version 2>/dev/null | grep -q GNU; then
                mtime="$(stat -c %Y "$item" 2>/dev/null || echo "0")"
            else
                mtime="$(stat -f %m "$item" 2>/dev/null || echo "0")"
            fi

            if [[ -z "$oldest_time" ]] || [[ "$mtime" -lt "$oldest_time" ]]; then
                oldest_time="$mtime"
                oldest_file="$item"
            fi
        done <<< "$files"
    fi

    if [[ -z "$oldest_file" ]]; then
        # Queue is empty
        return 0
    fi

    # Extract item ID
    local item_id
    item_id="$(basename "$oldest_file" .json)"

    # Move to running/
    mv "$oldest_file" "${QUEUE_DIR}/running/${item_id}.json"

    # Update status in file
    local running_file="${QUEUE_DIR}/running/${item_id}.json"
    if [[ -f "$running_file" ]]; then
        local timestamp
        timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        # Update status field using sed (portable)
        if sed --version 2>/dev/null | grep -q GNU; then
            sed -i 's/"status":"pending"/"status":"running","started":"'"${timestamp}"'"/' "$running_file" 2>/dev/null || true
        else
            sed -i '' 's/"status":"pending"/"status":"running","started":"'"${timestamp}"'"/' "$running_file" 2>/dev/null || true
        fi
    fi

    queue_log "dequeued item ${item_id}"
    echo "$item_id"
}

# Mark item as completed
queue_complete() {
    local item_id="$1"
    local running_file="${QUEUE_DIR}/running/${item_id}.json"
    local completed_file="${QUEUE_DIR}/completed/${item_id}.json"

    if [[ ! -f "$running_file" ]]; then
        queue_log "ERROR: item ${item_id} not found in running"
        return 1
    fi

    mv "$running_file" "$completed_file"

    # Update status
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    if sed --version 2>/dev/null | grep -q GNU; then
        sed -i 's/"status":"running"/"status":"completed","completed":"'"${timestamp}"'"/' "$completed_file" 2>/dev/null || true
    else
        sed -i '' 's/"status":"running"/"status":"completed","completed":"'"${timestamp}"'"/' "$completed_file" 2>/dev/null || true
    fi

    queue_log "completed item ${item_id}"
}

# Mark item as failed
queue_fail() {
    local item_id="$1"
    local reason="${2:-unknown}"
    local running_file="${QUEUE_DIR}/running/${item_id}.json"
    local failed_file="${QUEUE_DIR}/failed/${item_id}.json"

    if [[ ! -f "$running_file" ]]; then
        queue_log "ERROR: item ${item_id} not found in running"
        return 1
    fi

    mv "$running_file" "$failed_file"

    # Update status
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    # Escape reason for JSON
    local escaped_reason
    escaped_reason="${reason//\"/\\\"}"
    if sed --version 2>/dev/null | grep -q GNU; then
        sed -i 's/"status":"running"/"status":"failed","failed":"'"${timestamp}"'","reason":"'"${escaped_reason}"'"/' "$failed_file" 2>/dev/null || true
    else
        sed -i '' 's/"status":"running"/"status":"failed","failed":"'"${timestamp}"'","reason":"'"${escaped_reason}"'"/' "$failed_file" 2>/dev/null || true
    fi

    queue_log "failed item ${item_id}: ${reason}"
}

# Get count of pending items
queue_depth() {
    local count
    count="$(_list_files "${QUEUE_DIR}/pending" | wc -l | tr -d ' ')"
    echo "${count:-0}"
}

# List all items by status
queue_list() {
    local files

    echo "=== PENDING ==="
    files="$(_list_files "${QUEUE_DIR}/pending")"
    if [[ -n "$files" ]]; then
        while IFS= read -r item; do
            [[ -f "$item" ]] && basename "$item" .json
        done <<< "$files"
    fi

    echo "=== RUNNING ==="
    files="$(_list_files "${QUEUE_DIR}/running")"
    if [[ -n "$files" ]]; then
        while IFS= read -r item; do
            [[ -f "$item" ]] && basename "$item" .json
        done <<< "$files"
    fi

    echo "=== COMPLETED ==="
    files="$(_list_files "${QUEUE_DIR}/completed")"
    if [[ -n "$files" ]]; then
        while IFS= read -r item; do
            [[ -f "$item" ]] && basename "$item" .json
        done <<< "$files"
    fi

    echo "=== FAILED ==="
    files="$(_list_files "${QUEUE_DIR}/failed")"
    if [[ -n "$files" ]]; then
        while IFS= read -r item; do
            [[ -f "$item" ]] && basename "$item" .json
        done <<< "$files"
    fi
}

# CLI interface when run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        init)
            queue_init
            ;;
        enqueue)
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 enqueue <id> [payload]" >&2
                exit 1
            fi
            queue_init 2>/dev/null || true
            queue_enqueue "$2" "${3:-'{}'}"
            ;;
        depth)
            queue_init 2>/dev/null || true
            queue_depth
            ;;
        list)
            queue_init 2>/dev/null || true
            queue_list
            ;;
        recover)
            queue_init
            ;;
        *)
            echo "Usage: $0 {init|enqueue|depth|list|recover}" >&2
            echo ""
            echo "Commands:"
            echo "  init              Initialize queue directories"
            echo "  enqueue <id> [p]  Add item with optional payload"
            echo "  depth             Show count of pending items"
            echo "  list              List all items by status"
            echo "  recover           Recover crashed items"
            exit 1
            ;;
    esac
fi
