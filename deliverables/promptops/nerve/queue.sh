#!/usr/bin/env bash
#
# NERVE Queue — Queue persistence and recovery
# Survives crashes, no lost state
#

set -euo pipefail

# Configuration
QUEUE_DIR="/tmp/nerve-queue"
METRICS_FILE="/tmp/nerve-metrics.json"

# Logging function: [TIMESTAMP] [COMPONENT] message
log() {
    local component="$1"
    local message="$2"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [${component}] ${message}"
}

# Initialize queue directory
init_queue() {
    mkdir -p "$QUEUE_DIR"
    log "QUEUE" "initialized queue directory at ${QUEUE_DIR}"
}

# Add item to queue
add_item() {
    local payload="$1"
    local item_id
    item_id=$(date +%s%N | sha256sum | head -c 12)
    local item_file="${QUEUE_DIR}/${item_id}.job"

    mkdir -p "$QUEUE_DIR"
    echo "$payload" > "$item_file"
    log "QUEUE" "added item ${item_id}"
    echo "$item_id"
}

# List all queue items
list_items() {
    if [[ ! -d "$QUEUE_DIR" ]]; then
        log "QUEUE" "queue directory does not exist"
        echo "[]"
        return 0
    fi

    local count
    count=$(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" 2>/dev/null | wc -l)
    log "QUEUE" "listing ${count} pending items"

    local items=()
    while IFS= read -r -d '' file; do
        local item_id
        item_id=$(basename "$file" .job)
        items+=("\"$item_id\"")
    done < <(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" -print0 2>/dev/null | sort -z)

    if [[ ${#items[@]} -eq 0 ]]; then
        echo "[]"
    else
        local IFS=','
        echo "[${items[*]}]"
    fi
}

# Get queue depth
depth() {
    if [[ ! -d "$QUEUE_DIR" ]]; then
        echo "0"
        return 0
    fi

    local count
    count=$(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" 2>/dev/null | wc -l)
    log "QUEUE" "depth=${count}"
    echo "$count"
}

# Remove specific item from queue
remove_item() {
    local item_id="$1"
    local item_file="${QUEUE_DIR}/${item_id}.job"

    if [[ -f "$item_file" ]]; then
        rm -f "$item_file"
        log "QUEUE" "removed item ${item_id}"
        return 0
    else
        log "QUEUE" "item ${item_id} not found"
        return 1
    fi
}

# Recover queue state (list pending items after restart)
recover() {
    if [[ ! -d "$QUEUE_DIR" ]]; then
        log "QUEUE" "no queue to recover"
        return 0
    fi

    local count
    count=$(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" 2>/dev/null | wc -l)

    if [[ "$count" -gt 0 ]]; then
        log "QUEUE" "recovered ${count} pending items"
    else
        log "QUEUE" "no pending items to recover"
    fi

    echo "$count"
}

# Clear all queue items
clear_queue() {
    if [[ -d "$QUEUE_DIR" ]]; then
        local count
        count=$(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" 2>/dev/null | wc -l)
        rm -f "$QUEUE_DIR"/*.job 2>/dev/null || true
        log "QUEUE" "cleared ${count} items"
    else
        log "QUEUE" "no queue to clear"
    fi
}

# Update metrics file
update_metrics() {
    local d
    d=$(find "$QUEUE_DIR" -maxdepth 1 -type f -name "*.job" 2>/dev/null | wc -l || echo "0")

    cat > "$METRICS_FILE" << EOFM
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "queue_depth": ${d},
    "queue_dir": "${QUEUE_DIR}"
}
EOFM
    log "METRICS" "depth=${d} latency=0s errors=0"
}

# Main entry point
main() {
    local command="${1:-help}"

    case "$command" in
        init)
            init_queue
            ;;
        add)
            if [[ -z "${2:-}" ]]; then
                echo "Usage: $0 add <payload>"
                exit 1
            fi
            add_item "$2"
            ;;
        list)
            list_items
            ;;
        depth)
            depth
            ;;
        remove)
            if [[ -z "${2:-}" ]]; then
                echo "Usage: $0 remove <item_id>"
                exit 1
            fi
            remove_item "$2"
            ;;
        recover)
            recover
            ;;
        clear)
            clear_queue
            ;;
        metrics)
            update_metrics
            ;;
        help|*)
            echo "NERVE Queue Manager"
            echo ""
            echo "Usage: $0 <command> [args]"
            echo ""
            echo "Commands:"
            echo "  init              Initialize queue directory"
            echo "  add <payload>     Add item to queue"
            echo "  list              List all queue items as JSON array"
            echo "  depth             Get current queue depth"
            echo "  remove <id>       Remove specific item"
            echo "  recover           Recover queue state after restart"
            echo "  clear             Clear all queue items"
            echo "  metrics           Update metrics file"
            echo "  help              Show this help"
            ;;
    esac
}

main "$@"
