#!/usr/bin/env bash
# test-nextjs.sh
# Verifies Next.js app has required pages, API routes, and build config.
# Exit 0 if valid, non-zero if missing or malformed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "=== Test: Next.js app structure ==="

FAIL=0

require_file() {
  local path="$1"
  if [[ -f "${REPO_ROOT}/${path}" ]]; then
    echo "  [PASS] ${path}"
  else
    echo "  [FAIL] ${path} MISSING"
    FAIL=1
  fi
}

require_file "apps/web/app/page.tsx"
require_file "apps/web/app/pricing/page.tsx"
require_file "apps/web/app/portal/page.tsx"
require_file "apps/web/app/api/contact/route.ts"
require_file "apps/web/app/api/stripe/checkout/route.ts"
require_file "apps/web/app/api/stripe/webhooks/route.ts"
require_file "apps/web/app/api/portal/route.ts"
require_file "apps/web/components/mobile-nav.tsx"
require_file "apps/web/components/pricing-cards.tsx"
require_file "apps/web/components/health-badge.tsx"
require_file "apps/web/components/portal-dashboard.tsx"
require_file "apps/web/emails/welcome.tsx"
require_file "apps/web/emails/day7-checkin.tsx"
require_file "apps/web/lib/db.ts"
require_file "apps/web/lib/stripe.ts"
require_file "apps/web/lib/resend.ts"

# Verify package.json has build script
WEB_PKG="${REPO_ROOT}/apps/web/package.json"
if [[ -f "$WEB_PKG" ]]; then
  if grep -q '"build"' "$WEB_PKG"; then
    echo "  [PASS] apps/web/package.json has build script"
  else
    echo "  [FAIL] apps/web/package.json missing build script"
    FAIL=1
  fi
else
  echo "  [FAIL] apps/web/package.json MISSING"
  FAIL=1
fi

# Verify landing page contains pricing tier prices
LANDING="${REPO_ROOT}/apps/web/app/page.tsx"
if [[ -f "$LANDING" ]]; then
  PRICE_COUNT=$(grep -oE '\$[0-9]+' "$LANDING" | wc -l || true)
  if [[ "$PRICE_COUNT" -ge 3 ]]; then
    echo "  [PASS] Landing page has at least 3 price references (${PRICE_COUNT})"
  else
    echo "  [FAIL] Landing page has fewer than 3 price references (${PRICE_COUNT})"
    FAIL=1
  fi
fi

# Verify mobile nav has ARIA attributes
NAV="${REPO_ROOT}/apps/web/components/mobile-nav.tsx"
if [[ -f "$NAV" ]]; then
  ARIA_COUNT=$(grep -oE 'aria-[a-z]+' "$NAV" | sort -u | wc -l || true)
  if [[ "$ARIA_COUNT" -ge 2 ]]; then
    echo "  [PASS] mobile-nav.tsx has ${ARIA_COUNT} unique ARIA attributes"
  else
    echo "  [FAIL] mobile-nav.tsx has fewer than 2 ARIA attributes"
    FAIL=1
  fi
fi

# Verify portal page has NO auth UI strings
PORTAL="${REPO_ROOT}/apps/web/app/portal/page.tsx"
if [[ -f "$PORTAL" ]]; then
  AUTH_HITS=$(grep -icE 'login|password|magic.link|sign.in|sign.up' "$PORTAL" || true)
  if [[ "$AUTH_HITS" -eq 0 ]]; then
    echo "  [PASS] portal/page.tsx has no auth UI strings"
  else
    echo "  [FAIL] portal/page.tsx contains ${AUTH_HITS} auth UI strings"
    FAIL=1
  fi
fi

# Verify health badge has no numeric score
BADGE="${REPO_ROOT}/apps/web/components/health-badge.tsx"
if [[ -f "$BADGE" ]]; then
  # Allow CSS classes like bg-red-500; block literal 0-9 digits in JSX text or props
  SCORE_HITS=$(grep -oE '\b[0-9]{1,3}\b' "$BADGE" | wc -l || true)
  if [[ "$SCORE_HITS" -eq 0 ]]; then
    echo "  [PASS] health-badge.tsx has no numeric score"
  else
    echo "  [WARN] health-badge.tsx contains ${SCORE_HITS} numeric tokens (verify not a score)"
  fi
fi

if [[ "$FAIL" -eq 0 ]]; then
  echo ""
  echo "Next.js structure check passed."
  exit 0
else
  echo ""
  echo "Next.js structure check failed."
  exit 1
fi
