#!/usr/bin/env bash
# test_v1_constraints.sh
# Ensures v1 guardrails are respected: no WordPress, no "60 seconds" promises,
# no social publishing, no auth/billing code in the web app.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APPS_DIR="${REPO_ROOT}/reel/apps"
COMPONENTS_DIR="${REPO_ROOT}/reel/apps/web/components"

ERRORS=0

check_absent() {
    local pattern="$1"
    local path="$2"
    local label="$3"

    if [[ ! -d "$path" ]]; then
        echo "SKIP: directory not yet present: $path"
        return 0
    fi

    local matches
    matches=$(grep -ri "$pattern" "$path" 2>/dev/null || true)
    if [[ -n "$matches" ]]; then
        echo "FAIL: $label found in $path"
        echo "$matches"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: no $label in $path"
    fi
}

echo "=== V1 Constraint Checks ==="
echo ""

# C1: No WordPress references in web service
check_absent "wordpress" "$APPS_DIR" "WordPress reference"

# C2: No "60 seconds" promise in UI copy
check_absent "60 seconds" "$COMPONENTS_DIR" "'60 seconds' promise"

# C3: No social platform export/publish code
check_absent "tiktok" "$APPS_DIR" "TikTok reference"
check_absent "linkedin.*publish\|linkedin.*upload" "$APPS_DIR" "LinkedIn publishing reference"
check_absent "youtube.*shorts.*upload\|youtube.*publish" "$APPS_DIR" "YouTube Shorts publishing reference"

# C4: No auth / billing / Stripe code in v1
check_absent "stripe" "$APPS_DIR" "Stripe reference"
check_absent "\bauth\b" "$APPS_DIR" "auth reference"
check_absent "\blogin\b" "$APPS_DIR" "login reference"
check_absent "\bbilling\b" "$APPS_DIR" "billing reference"

# C5: RenderStatus must contain honest timing message
if [[ -f "${COMPONENTS_DIR}/RenderStatus.tsx" ]]; then
    if grep -q "a few minutes" "${COMPONENTS_DIR}/RenderStatus.tsx"; then
        echo "PASS: RenderStatus contains 'a few minutes'"
    else
        echo "FAIL: RenderStatus missing 'a few minutes' honest timing copy"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "SKIP: RenderStatus.tsx not yet present"
fi

echo ""
if [[ $ERRORS -eq 0 ]]; then
    echo "=== ALL CONSTRAINT CHECKS PASSED ==="
    exit 0
else
    echo "=== $ERRORS CONSTRAINT FAILURE(S) ==="
    exit 1
fi
