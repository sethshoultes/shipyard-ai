#!/usr/bin/env bash
# test-banned-patterns.sh
# Verifies no banned patterns exist in the source tree.
# Banned per locked decisions: auth systems, tracking telemetry, localStorage, 0-100 health gradient.
# Exit 0 if clean, non-zero if banned pattern found.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "=== Test: Banned patterns ==="

FAIL=0

check_banned() {
  local label="$1"
  local pattern="$2"
  local paths=("${REPO_ROOT}/apps/web" "${REPO_ROOT}/worker")

  # Only grep if directories exist
  local found=0
  for p in "${paths[@]}"; do
    if [[ -d "$p" ]]; then
      if grep -ri --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "$pattern" "$p" 2>/dev/null; then
        found=1
      fi
    fi
  done

  if [[ "$found" -eq 0 ]]; then
    echo "  [PASS] No $label"
  else
    echo "  [FAIL] Found $label"
    FAIL=1
  fi
}

check_banned "auth framework (next-auth)" "next-auth"
check_banned "auth framework (lucia)" "lucia"
check_banned "auth framework (passport)" "passport"
check_banned "auth framework (auth.js)" "auth\.js"
check_banned "JWT usage" "jwt"
check_banned "magic-link auth UI" "magic.link.*auth\|magic.*link.*auth\|auth.*magic"
check_banned "session store references" "session.*store\|sessionStore"
check_banned "tracking column opened_at" "opened_at"
check_banned "tracking column clicked_at" "clicked_at"
check_banned "tracking pixel" "pixel\|1x1"
check_banned "Google Analytics (gtag)" "gtag"
check_banned "Mixpanel" "mixpanel"
check_banned "Segment" "segment"
check_banned "localStorage" "localStorage"
check_banned "sessionStorage" "sessionStorage"
check_banned "0-100 health gradient" "0-100\|score.*100\|gradient.*health"

if [[ "$FAIL" -eq 0 ]]; then
  echo ""
  echo "All banned-pattern checks passed."
  exit 0
else
  echo ""
  echo "Banned patterns detected."
  exit 1
fi
