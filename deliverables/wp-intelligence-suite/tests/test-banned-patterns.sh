#!/usr/bin/env bash
set -euo pipefail

# test-banned-patterns.sh
# Grep the build output for explicitly banned patterns per decisions.md and spec.md.
# Exit 0 if clean, non-zero if banned patterns are found.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BUILD_ROOT="${1:-${REPO_ROOT}/projects/wp-intelligence-suite/build/wp-intelligence-suite}"

ERRORS=0

echo "=== WP Intelligence Suite — Banned Patterns Test ==="
echo "BUILD_ROOT: ${BUILD_ROOT}"
echo ""

if [[ ! -d "${BUILD_ROOT}" ]]; then
    echo "FAIL: BUILD_ROOT does not exist."
    exit 1
fi

# Helper: grep recursively, print matches, return count
check_banned() {
    local pattern="$1"
    local reason="$2"
    local matches
    matches=$(grep -rni --include="*.php" --include="*.js" --include="*.css" --include="*.txt" --include="*.yml" --include="*.yaml" -E "$pattern" "${BUILD_ROOT}" 2>/dev/null || true)
    if [[ -n "$matches" ]]; then
        echo "FAIL: Banned pattern found — ${reason}"
        echo "$matches" | head -n 10
        ((ERRORS++)) || true
    else
        echo "PASS: Clean — ${reason}"
    fi
}

# Decision #3: Zero external API calls during activation
check_banned "wp_remote_get|wp_remote_post|curl_init|file_get_contents" \
    "Zero external API calls during activation (Decision #3)"

# Decision #4: No template marketplace in v1
check_banned "template_markplace|marketplace|buy_template|sell_template|template_store" \
    "No template marketplace in v1 (Decision #4)"

# Decision #5: No agency white-label / cross-site dashboard in v1
check_banned "white.?label|cross.?site.?dashboard|agency.?dashboard|multi.?tenant" \
    "No agency white-label / cross-site dashboard in v1 (Decision #5)"

# Decision #6: Contextual nudges, not upgrade billboards
check_banned "upgrade.?now|buy.?pro|go.?pro|limited.?trial|pay.?now|neon.?button" \
    "No upgrade billboards (Decision #6)"

# Decision #7: Annual billing hidden in checkout flow
check_banned "annual.?billing|per.?year|yearly.?plan|\\\$99.?year|\\\$199.?year" \
    "No annual billing copy in product UI (Decision #7)"

# Decision #8: Hard limits on free tier (allowed, but check for "unlimited" false promises)
check_banned "unlimited.?free|free.?forever|no.?limits" \
    "No false unlimited promises on free tier (Decision #8)"

# Decision #9: Simple Stripe Checkout link, not billing engine
check_banned "subscription.?manage|billing.?portal|invoice.?view|proration|webhook.?handler" \
    "No billing engine / portal / webhooks (Decision #9)"

# Decision #10: No anonymous analytics / data flywheel
check_banned "telemetry|anonymous.?analytics|data.?flywheel|opt.?in.?analytics|tracking.?pixel" \
    "No anonymous analytics or telemetry (Decision #10)"

# Decision #2: No onboarding wizard
check_banned "wizard|onboarding.?wizard|setup.?wizard|tour.?step|hotspot|guided.?tour" \
    "No onboarding wizard (Decision #2)"

# OQ-2 resolution: Native WordPress UI only — no custom CSS framework
check_banned "bootstrap|tailwind|bulma|foundation|materialize|custom.?ui.?framework" \
    "No custom CSS frameworks (OQ-2 native WP UI)"

# OQ-5 resolution: No LLM in v1
check_banned "openai|chatgpt|gpt-4|claude|llm|ai.?generate|lazy.?load.?llm|inference.?api" \
    "No LLM / AI generation in v1 (OQ-5 static templates)"

# PHP compatibility: No PHP 7+ syntax
check_banned "public\s+\$|private\s+\$|protected\s+\$|\?\?\s|match\s*\(" \
    "No PHP 7+ typed properties, null coalesce, or match expressions (PHP 5.6 compat)"

# Banned per spec: No Freemius SDK
check_banned "freemius|freemius_sdk|fs_dynamic_init" \
    "No Freemius SDK (Decision licensing mechanism)"

# Banned per spec: No wizard/tour/modal language in code comments either (strict)
check_banned "//.*wizard|//.*tour|//.*onboarding.?screen|/\*.*wizard" \
    "No wizard references even in comments"

# PRD constraint: No external font dependencies
check_banned "googleapis.*fonts|fonts\.gstatic|font-awesome|cdnjs.*font" \
    "No external font CDN dependencies (PRD Typography)"

echo ""
if [[ $ERRORS -gt 0 ]]; then
    echo "RESULT: ${ERRORS} banned pattern violation(s) found."
    exit 1
else
    echo "RESULT: All banned patterns clean."
    exit 0
fi
