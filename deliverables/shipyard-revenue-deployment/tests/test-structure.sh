#!/usr/bin/env bash
# test-structure.sh
# Verifies that every file required by the spec exists in the repo.
# Exit 0 if all present, non-zero if any missing.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "=== Test: Required file structure ==="

MISSING=0

require_file() {
  local path="$1"
  if [[ -f "${REPO_ROOT}/${path}" ]]; then
    echo "  [PASS] ${path}"
  else
    echo "  [FAIL] ${path} MISSING"
    MISSING=1
  fi
}

require_file "migrations/001_initial.sql"
require_file "package.json"
require_file "apps/web/lib/db.ts"
require_file "apps/web/lib/stripe.ts"
require_file "apps/web/lib/resend.ts"
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
require_file "worker/wrangler.toml"
require_file "worker/package.json"
require_file "worker/src/index.ts"
require_file "worker/src/health-check.ts"
require_file "worker/src/stripe-webhook.ts"

if [[ "$MISSING" -eq 0 ]]; then
  echo ""
  echo "All required files present."
  exit 0
else
  echo ""
  echo "Some required files are missing."
  exit 1
fi
