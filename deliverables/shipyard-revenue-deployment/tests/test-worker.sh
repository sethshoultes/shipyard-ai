#!/usr/bin/env bash
# test-worker.sh
# Verifies Cloudflare Worker config and source files meet structural requirements.
# Exit 0 if valid, non-zero if missing or malformed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "=== Test: Worker structure ==="

FAIL=0

WRANGLER="${REPO_ROOT}/worker/wrangler.toml"
WORKER_ENTRY="${REPO_ROOT}/worker/src/index.ts"
HEALTH="${REPO_ROOT}/worker/src/health-check.ts"
STRIPE_WEBHOOK="${REPO_ROOT}/worker/src/stripe-webhook.ts"

if [[ -f "$WRANGLER" ]]; then
  echo "  [PASS] worker/wrangler.toml exists"
else
  echo "  [FAIL] worker/wrangler.toml MISSING"
  FAIL=1
fi

if [[ -f "$WORKER_ENTRY" ]]; then
  echo "  [PASS] worker/src/index.ts exists"
else
  echo "  [FAIL] worker/src/index.ts MISSING"
  FAIL=1
fi

if [[ -f "$HEALTH" ]]; then
  echo "  [PASS] worker/src/health-check.ts exists"
else
  echo "  [FAIL] worker/src/health-check.ts MISSING"
  FAIL=1
fi

if [[ -f "$STRIPE_WEBHOOK" ]]; then
  echo "  [PASS] worker/src/stripe-webhook.ts exists"
else
  echo "  [FAIL] worker/src/stripe-webhook.ts MISSING"
  FAIL=1
fi

# Check wrangler.toml has D1 binding
if [[ -f "$WRANGLER" ]]; then
  if grep -q "database_id" "$WRANGLER"; then
    echo "  [PASS] wrangler.toml contains D1 database_id binding"
  else
    echo "  [FAIL] wrangler.toml missing D1 database_id binding"
    FAIL=1
  fi

  if grep -q "\[\[triggers.cron\]\]" "$WRANGLER"; then
    echo "  [PASS] wrangler.toml has cron trigger section"
  else
    echo "  [FAIL] wrangler.toml missing cron trigger section"
    FAIL=1
  fi
fi

# Check worker entry has export default
if [[ -f "$WORKER_ENTRY" ]]; then
  if grep -q "export default" "$WORKER_ENTRY"; then
    echo "  [PASS] worker/src/index.ts exports a default handler"
  else
    echo "  [FAIL] worker/src/index.ts missing default export"
    FAIL=1
  fi
fi

if [[ "$FAIL" -eq 0 ]]; then
  echo ""
  echo "Worker structure check passed."
  exit 0
else
  echo ""
  echo "Worker structure check failed."
  exit 1
fi
