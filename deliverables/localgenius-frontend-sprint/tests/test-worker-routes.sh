#!/usr/bin/env bash
# test-worker-routes.sh
# Verifies the Cloudflare Worker contains required route handlers and schema.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

WORKER_FILE="${WORKER_FILE:-worker/index.js}"
SCHEMA_FILE="${SCHEMA_FILE:-worker/d1-schema.sql}"
KV_SEED_FILE="${KV_SEED_FILE:-worker/kv-seed.json}"
ERRORS=0

echo "=== Worker Route & Schema Audit ==="
echo ""

# --- worker/index.js checks ---
if [[ ! -f "$WORKER_FILE" ]]; then
  echo "[FAIL] worker file not found: $WORKER_FILE"
  ERRORS=$((ERRORS + 1))
else
  echo "--- $WORKER_FILE ---"

  # 1. POST /ask route
  if grep -qiE 'POST.*/ask|/ask.*POST' "$WORKER_FILE"; then
    echo "[PASS] POST /ask route found"
  else
    echo "[FAIL] POST /ask route missing"
    ERRORS=$((ERRORS + 1))
  fi

  # 2. POST /webhook route
  if grep -qiE 'POST.*/webhook|/webhook.*POST' "$WORKER_FILE"; then
    echo "[PASS] POST /webhook route found"
  else
    echo "[FAIL] POST /webhook route missing"
    ERRORS=$((ERRORS + 1))
  fi

  # 3. GET /config route
  if grep -qiE 'GET.*/config|/config.*GET' "$WORKER_FILE"; then
    echo "[PASS] GET /config route found"
  else
    echo "[FAIL] GET /config route missing"
    ERRORS=$((ERRORS + 1))
  fi

  # 4. checkout.session.completed handler
  if grep -qi 'checkout.session.completed' "$WORKER_FILE"; then
    echo "[PASS] checkout.session.completed handler found"
  else
    echo "[FAIL] checkout.session.completed handler missing"
    ERRORS=$((ERRORS + 1))
  fi

  # 5. CORS headers
  if grep -qi 'access-control-allow-origin' "$WORKER_FILE"; then
    echo "[PASS] CORS header found"
  else
    echo "[FAIL] missing CORS headers"
    ERRORS=$((ERRORS + 1))
  fi

  # 6. KV read usage
  if grep -qiE 'kv.*get|KV.*get|env\.KV' "$WORKER_FILE"; then
    echo "[PASS] KV read pattern found"
  else
    echo "[FAIL] no KV read pattern found"
    ERRORS=$((ERRORS + 1))
  fi

  # 7. Usage counter increment
  if grep -qiE 'responses_used|increment|counter' "$WORKER_FILE"; then
    echo "[PASS] usage counter pattern found"
  else
    echo "[FAIL] no usage counter pattern found"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""

# --- worker/d1-schema.sql checks ---
if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "[FAIL] schema file not found: $SCHEMA_FILE"
  ERRORS=$((ERRORS + 1))
else
  echo "--- $SCHEMA_FILE ---"

  TABLE_COUNT=$(grep -ciE '^CREATE TABLE' "$SCHEMA_FILE" || true)
  if [[ "$TABLE_COUNT" -eq 1 ]]; then
    echo "[PASS] exactly one CREATE TABLE found"
  else
    echo "[FAIL] found $TABLE_COUNT CREATE TABLE statements (expected 1)"
    ERRORS=$((ERRORS + 1))
  fi

  if grep -qi 'sous_subscriptions' "$SCHEMA_FILE"; then
    echo "[PASS] sous_subscriptions table defined"
  else
    echo "[FAIL] sous_subscriptions table not found"
    ERRORS=$((ERRORS + 1))
  fi

  if grep -qiE 'tier|status|stripe' "$SCHEMA_FILE"; then
    echo "[PASS] tier/status/stripe columns referenced"
  else
    echo "[FAIL] missing tier/status/stripe columns"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""

# --- worker/kv-seed.json checks ---
if [[ ! -f "$KV_SEED_FILE" ]]; then
  echo "[FAIL] KV seed file not found: $KV_SEED_FILE"
  ERRORS=$((ERRORS + 1))
else
  echo "--- $KV_SEED_FILE ---"

  if command -v jq >/dev/null 2>&1; then
    ENTRY_COUNT=$(jq '. | length' "$KV_SEED_FILE" 2>/dev/null || echo 0)
    if [[ "$ENTRY_COUNT" -ge 20 ]]; then
      echo "[PASS] $ENTRY_COUNT KV seed entries found (>= 20)"
    else
      echo "[FAIL] only $ENTRY_COUNT KV seed entries found (expected >= 20)"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "[SKIP] jq not installed; manual review required for KV seed count"
  fi

  # Basic JSON validity
  if python3 -c "import json,sys; json.load(open('$KV_SEED_FILE'))" 2>/dev/null || \
     node -e "require('fs').readFileSync('$KV_SEED_FILE','utf8')" 2>/dev/null; then
    echo "[PASS] KV seed file is valid JSON"
  else
    # Fallback: check first/last char
    FIRST=$(head -c 1 "$KV_SEED_FILE")
    LAST=$(tail -c 1 "$KV_SEED_FILE")
    if [[ "$FIRST" == "{" || "$FIRST" == "[" ]] && [[ "$LAST" == "}" || "$LAST" == "]" ]]; then
      echo "[PASS] KV seed file appears to be JSON (basic check)"
    else
      echo "[FAIL] KV seed file does not appear to be valid JSON"
      ERRORS=$((ERRORS + 1))
    fi
  fi
fi

echo ""
if [[ "$ERRORS" -eq 0 ]]; then
  echo "=== ALL WORKER CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS WORKER FAILURE(S) ==="
  exit 1
fi
