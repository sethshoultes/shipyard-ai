#!/usr/bin/env bash
# test-banned-patterns.sh — Verify no commercial or out-of-scope patterns leak into build artifacts
# Exit 0 on pass, non-zero on fail

set -euo pipefail

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

ERRORS=0

# Directories to scan for banned commercial fields
SCAN_DIRS=("schema" "prd" "build" "deploy" "components" "intake")

# Banned commercial field patterns
COMMERCIAL_PATTERNS=(
  "stripe_payment_id"
  "deposit_paid"
  "balance_paid"
  "tos_signed"
  "hubspot"
  "crm_"
  "tier_price_usd"
)

# Banned v1 scope patterns (e-commerce, auth, i18n, membership)
SCOPE_PATTERNS=(
  "register_rest_route"
  "woocommerce"
  "wp_login"
  "i18n"
  "membership"
  "subscription"
)

for dir in "${SCAN_DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    continue
  fi

  for pattern in "${COMMERCIAL_PATTERNS[@]}"; do
    MATCHES=$(grep -rni "$pattern" "$dir" 2>/dev/null || true)
    if [[ -n "$MATCHES" ]]; then
      echo "FAIL: Banned commercial pattern '$pattern' found in $dir:"
      echo "$MATCHES"
      ERRORS=$((ERRORS + 1))
    fi
  done

  for pattern in "${SCOPE_PATTERNS[@]}"; do
    MATCHES=$(grep -rni "$pattern" "$dir" 2>/dev/null || true)
    if [[ -n "$MATCHES" ]]; then
      echo "FAIL: Banned scope pattern '$pattern' found in $dir:"
      echo "$MATCHES"
      ERRORS=$((ERRORS + 1))
    fi
  done
done

# Special check: ensure no visible "Built by Shipyard" billboard in deploy/
if [[ -d "deploy" ]]; then
  BILLBOARD=$(grep -rni "built by shipyard\|shipyard badge\|billboard" deploy/ 2>/dev/null || true)
  if [[ -n "$BILLBOARD" ]]; then
    echo "FAIL: Visible billboard language found in deploy/:"
    echo "$BILLBOARD"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Special check: no localStorage in intake JS
if [[ -f "intake/mapper.js" ]]; then
  LS=$(grep -ni "localStorage" "intake/mapper.js" 2>/dev/null || true)
  if [[ -n "$LS" ]]; then
    echo "FAIL: localStorage found in intake/mapper.js:"
    echo "$LS"
    ERRORS=$((ERRORS + 1))
  fi
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo ""
  echo "BANNED PATTERNS TEST FAILED: $ERRORS violation(s)"
  exit 1
fi

echo ""
echo "BANNED PATTERNS TEST PASSED: no commercial or out-of-scope patterns found"
exit 0
