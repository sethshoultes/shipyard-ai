#!/usr/bin/env bash
set -euo pipefail

# test-structure.sh
# Verifies that every file and directory listed in spec.md Section 4 exists in the build output.
# Usage: ./test-structure.sh [BUILD_ROOT]
# Exit 0 if all present, non-zero if any missing.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BUILD_ROOT="${1:-${REPO_ROOT}/projects/wp-intelligence-suite/build/wp-intelligence-suite}"

ERRORS=0

check_path() {
    local path="$1"
    local desc="$2"
    if [[ ! -e "${BUILD_ROOT}/${path}" ]]; then
        echo "FAIL: Missing ${desc}: ${path}"
        ((ERRORS++)) || true
    else
        echo "PASS: ${desc}: ${path}"
    fi
}

echo "=== WP Intelligence Suite — Structure Test ==="
echo "BUILD_ROOT: ${BUILD_ROOT}"
echo ""

# 4.1 CI/CD
check_path ".github/workflows/ci.yml" "CI workflow"

# 4.2 wis-core
check_path "wis-core/wis-core.php" "Core main plugin"
check_path "wis-core/includes/class-loader.php" "Core loader"
check_path "wis-core/includes/class-tier.php" "Core tier"
check_path "wis-core/includes/class-settings.php" "Core settings"
check_path "wis-core/includes/class-usage.php" "Core usage"
check_path "wis-core/assets/js/tooltip.js" "Tooltip JS"
check_path "wis-core/assets/css/tooltip.css" "Tooltip CSS"
check_path "wis-core/wp-cli/class-wis-cli.php" "WP-CLI command"
check_path "wis-core/includes/" "Core includes dir"

# 4.3 localgenius
check_path "localgenius/localgenius.php" "LocalGenius main plugin"
check_path "localgenius/includes/class-widget.php" "LG widget class"
check_path "localgenius/includes/class-admin.php" "LG admin class"
check_path "localgenius/public/css/localgenius.css" "LG public CSS"
check_path "localgenius/public/js/localgenius.js" "LG public JS"
check_path "localgenius/templates/widget.php" "LG widget template"
check_path "localgenius/includes/" "LG includes dir"
check_path "localgenius/public/css/" "LG public CSS dir"
check_path "localgenius/public/js/" "LG public JS dir"
check_path "localgenius/templates/" "LG templates dir"

# 4.4 dash
check_path "dash/dash.php" "Dash main plugin"
check_path "dash/includes/class-notes-list-table.php" "Dash list table"
check_path "dash/admin/" "Dash admin dir"
check_path "dash/includes/" "Dash includes dir"
check_path "dash/assets/" "Dash assets dir"

# 4.5 pinned
check_path "pinned/pinned.php" "Pinned main plugin"
check_path "pinned/includes/class-agreements-list-table.php" "Pinned list table"
check_path "pinned/admin/" "Pinned admin dir"
check_path "pinned/includes/" "Pinned includes dir"
check_path "pinned/assets/" "Pinned assets dir"

# 4.6 org-assets
check_path "org-assets/readme.txt" "Org readme"
check_path "org-assets/banner-772x250.png" "Org banner"
check_path "org-assets/screenshot-1.png" "Org screenshot"

# 4.7 PHPUnit test suite
check_path "phpunit.xml" "PHPUnit config"
check_path "tests/bootstrap.php" "Test bootstrap"
check_path "tests/test-activation.php" "Activation tests"
check_path "tests/test-tier.php" "Tier tests"
check_path "tests/test-usage.php" "Usage tests"
check_path "tests/test-localgenius.php" "LocalGenius tests"
check_path "tests/test-dash.php" "Dash tests"
check_path "tests/test-pinned.php" "Pinned tests"

echo ""
if [[ $ERRORS -gt 0 ]]; then
    echo "RESULT: ${ERRORS} missing file(s) or directorie(s)."
    exit 1
else
    echo "RESULT: All expected files and directories present."
    exit 0
fi
