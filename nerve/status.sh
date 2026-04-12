#!/usr/bin/env bash
# NERVE status.sh — Quick status check for NERVE daemon
# Part of NERVE: Operations Hardening for Autonomous Pipeline Daemon
#
# Usage: ./status.sh [--json]
#   --json: Output metrics as JSON only

set -euo pipefail

# Bash version check (require 4.0+)
if [[ ${BASH_VERSION%%.*} -lt 4 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [STATUS] ERROR: Bash 4.0+ required" >&2
    exit 2
fi

# Configuration
readonly LOCK_DIR="${NERVE_LOCK_DIR:-/tmp/nerve.lock}"
readonly LOCKFILE="${LOCK_DIR}/pid"
readonly ABORT_FLAG="${NERVE_ABORT_FLAG:-/tmp/nerve.abort}"
readonly METRICS_FILE="${NERVE_METRICS_FILE:-/tmp/nerve-metrics.json}"
readonly QUEUE_DIR="${NERVE_QUEUE_DIR:-/tmp/nerve-queue}"

# Check if daemon is running
daemon_status() {
    if [[ -d "$LOCK_DIR" ]] && [[ -f "$LOCKFILE" ]]; then
        local pid
        pid="$(cat "$LOCKFILE" 2>/dev/null || echo "")"
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            echo "RUNNING (PID: ${pid})"
            return 0
        else
            echo "STOPPED (stale lock)"
            return 1
        fi
    else
        echo "STOPPED"
        return 1
    fi
}

# Check abort status
abort_status() {
    if [[ -f "$ABORT_FLAG" ]]; then
        local requested_at
        requested_at="$(cat "$ABORT_FLAG" 2>/dev/null || echo "unknown")"
        echo "ACTIVE (since: ${requested_at})"
    else
        echo "INACTIVE"
    fi
}

# Get queue counts
queue_status() {
    local pending=0 running=0 completed=0 failed=0

    if [[ -d "${QUEUE_DIR}/pending" ]]; then
        pending=$(find "${QUEUE_DIR}/pending" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi
    if [[ -d "${QUEUE_DIR}/running" ]]; then
        running=$(find "${QUEUE_DIR}/running" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi
    if [[ -d "${QUEUE_DIR}/completed" ]]; then
        completed=$(find "${QUEUE_DIR}/completed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi
    if [[ -d "${QUEUE_DIR}/failed" ]]; then
        failed=$(find "${QUEUE_DIR}/failed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi

    echo "pending=${pending} running=${running} completed=${completed} failed=${failed}"
}

# Get metrics
metrics_status() {
    if [[ -f "$METRICS_FILE" ]]; then
        cat "$METRICS_FILE"
    else
        echo '{"queue_depth":0,"latency_last":0,"error_count":0,"timestamp":"never"}'
    fi
}

# Output as JSON
json_output() {
    local daemon_running=false
    local daemon_pid=""

    if [[ -d "$LOCK_DIR" ]] && [[ -f "$LOCKFILE" ]]; then
        daemon_pid="$(cat "$LOCKFILE" 2>/dev/null || echo "")"
        if [[ -n "$daemon_pid" ]] && kill -0 "$daemon_pid" 2>/dev/null; then
            daemon_running=true
        fi
    fi

    local abort_active=false
    local abort_since=""
    if [[ -f "$ABORT_FLAG" ]]; then
        abort_active=true
        abort_since="$(cat "$ABORT_FLAG" 2>/dev/null || echo "")"
    fi

    local pending=0 running=0 completed=0 failed=0
    if [[ -d "${QUEUE_DIR}/pending" ]]; then
        pending=$(find "${QUEUE_DIR}/pending" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi
    if [[ -d "${QUEUE_DIR}/running" ]]; then
        running=$(find "${QUEUE_DIR}/running" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi
    if [[ -d "${QUEUE_DIR}/completed" ]]; then
        completed=$(find "${QUEUE_DIR}/completed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi
    if [[ -d "${QUEUE_DIR}/failed" ]]; then
        failed=$(find "${QUEUE_DIR}/failed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    fi

    local metrics
    if [[ -f "$METRICS_FILE" ]]; then
        metrics="$(cat "$METRICS_FILE")"
    else
        metrics='{"queue_depth":0,"latency_last":0,"error_count":0,"timestamp":"never"}'
    fi

    cat <<EOF
{
  "daemon": {
    "running": ${daemon_running},
    "pid": "${daemon_pid}"
  },
  "abort": {
    "active": ${abort_active},
    "since": "${abort_since}"
  },
  "queue": {
    "pending": ${pending},
    "running": ${running},
    "completed": ${completed},
    "failed": ${failed}
  },
  "metrics": ${metrics}
}
EOF
}

# Human-readable output
human_output() {
    echo "=== NERVE Status ==="
    echo ""
    echo "Daemon:  $(daemon_status 2>/dev/null || echo "STOPPED")"
    echo "Abort:   $(abort_status)"
    echo "Queue:   $(queue_status)"
    echo ""
    echo "Metrics:"
    metrics_status
}

# Main
main() {
    case "${1:-}" in
        --json|-j)
            json_output
            ;;
        --help|-h)
            echo "Usage: $0 [--json]"
            echo ""
            echo "Options:"
            echo "  --json, -j  Output as JSON"
            echo "  --help, -h  Show this help"
            ;;
        *)
            human_output
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
