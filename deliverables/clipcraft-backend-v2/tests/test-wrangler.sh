#!/usr/bin/env bash
set -euo pipefail

# Test: Verify wrangler.toml declares all required bindings.
# Required: R2 (RENDER_OUTPUT, RENDER_CACHE), Queues (RENDER_QUEUE), D1 (RENDER_DB)

DELIVERABLE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DELIVERABLE_ROOT"

TOML="wrangler.toml"
FAIL=0

if [[ ! -f "$TOML" ]]; then
  echo "[FAIL] $TOML does not exist." >&2
  exit 1
fi

check_binding() {
  local label="$1"
  local pattern="$2"
  if grep -qE "$pattern" "$TOML"; then
    echo "  [OK] $label found"
  else
    echo "  [FAIL] $label missing (expected pattern: $pattern)" >&2
    FAIL=1
  fi
}

echo "Checking wrangler.toml bindings..."

# R2 buckets
check_binding "R2 binding RENDER_OUTPUT" 'bucket_name\s*=\s*"RENDER_OUTPUT"|binding\s*=\s*"RENDER_OUTPUT"'
check_binding "R2 binding RENDER_CACHE" 'bucket_name\s*=\s*"RENDER_CACHE"|binding\s*=\s*"RENDER_CACHE"'

# Queue (producer or consumer)
check_binding "Queue binding RENDER_QUEUE" 'queue\s*=\s*"RENDER_QUEUE"|binding\s*=\s*"RENDER_QUEUE"'

# D1 database
check_binding "D1 binding RENDER_DB" 'database_name\s*=\s*"RENDER_DB"|binding\s*=\s*"RENDER_DB"'

if [[ "$FAIL" -ne 0 ]]; then
  echo "WRANGLER TEST FAILED." >&2
  exit 1
fi

echo "WRANGLER TEST PASSED."
exit 0
