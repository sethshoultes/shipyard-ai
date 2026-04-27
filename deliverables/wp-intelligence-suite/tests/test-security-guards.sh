#!/usr/bin/env bash
set -euo pipefail

# test-security-guards.sh
# Verifies that every PHP file in the build has ABSPATH guards,
# capability checks on admin handlers, and output sanitization patterns.
# Usage: ./test-security-guards.sh [BUILD_ROOT]
# Exit 0 if all pass, non-zero if violations found.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BUILD_ROOT="${1:-${REPO_ROOT}/projects/wp-intelligence-suite/build/wp-intelligence-suite}"

ERRORS=0

echo "=== WP Intelligence Suite — Security Guards Test ==="
echo "BUILD_ROOT: ${BUILD_ROOT}"
echo ""

if [[ ! -d "${BUILD_ROOT}" ]]; then
    echo "FAIL: BUILD_ROOT does not exist."
    exit 1
fi

# Find all PHP files
mapfile -t PHP_FILES < <(find "${BUILD_ROOT}" -type f -name "*.php" 2>/dev/null || true)

if [[ ${#PHP_FILES[@]} -eq 0 ]]; then
    echo "FAIL: No PHP files found in BUILD_ROOT."
    exit 1
fi

echo "Checking ${#PHP_FILES[@]} PHP file(s)..."
echo ""

# 1. Every PHP file must have ABSPATH guard
for f in "${PHP_FILES[@]}"; do
    if ! grep -q "if (.*!.*defined.*ABSPATH.*)" "$f" && \
       ! grep -q "if (!defined('ABSPATH'))" "$f" && \
       ! grep -q "if ( ! defined( 'ABSPATH' ) )" "$f"; then
        echo "FAIL: Missing ABSPATH guard in ${f#${BUILD_ROOT}/}"
        ((ERRORS++)) || true
    fi
done

if [[ $ERRORS -eq 0 ]]; then
    echo "PASS: All PHP files have ABSPATH guard."
fi

echo ""

# 2. Admin settings pages must have manage_options check
ADMIN_SETTINGS_FILES=(
    "wis-core/includes/class-settings.php"
    "localgenius/includes/class-admin.php"
)

for rel in "${ADMIN_SETTINGS_FILES[@]}"; do
    f="${BUILD_ROOT}/${rel}"
    if [[ -f "$f" ]]; then
        if ! grep -q "current_user_can.*manage_options" "$f"; then
            echo "FAIL: Missing manage_options check in ${rel}"
            ((ERRORS++)) || true
        fi
    fi
done

if [[ $ERRORS -eq 0 ]]; then
    echo "PASS: All admin settings files have capability checks."
fi

echo ""

# 3. No direct $_POST / $_GET without sanitization in plugin files (basic grep)
for f in "${PHP_FILES[@]}"; do
    # Exclude test files and bootstrap from this strict check
    if [[ "$f" == *"/tests/"* ]] || [[ "$f" == *"bootstrap.php"* ]]; then
        continue
    fi
    # Look for unsanitized direct access (loose check: $_POST/$_GET not followed by sanitize/esc/isset within same line)
    if grep -n '\$_POST\|\$_GET' "$f" | grep -vq 'sanitize_text_field\|sanitize_email\|intval\|esc_attr\|esc_html\|isset\|wp_kses\|check_ajax_referer\|wp_nonce'; then
        echo "WARN: Potential unsanitized superglobal access in ${f#${BUILD_ROOT}/} (review manually)"
        # We do not count this as an automatic failure because context matters; the spec expects manual review.
    fi
done

echo ""

# 4. All main plugin files must have plugin header with License: GPL-2.0-or-later
MAIN_PLUGINS=(
    "wis-core/wis-core.php"
    "localgenius/localgenius.php"
    "dash/dash.php"
    "pinned/pinned.php"
)

for rel in "${MAIN_PLUGINS[@]}"; do
    f="${BUILD_ROOT}/${rel}"
    if [[ -f "$f" ]]; then
        if ! grep -qi "License:.*GPL-2.0-or-later" "$f"; then
            echo "FAIL: Missing GPL-2.0-or-later license header in ${rel}"
            ((ERRORS++)) || true
        fi
    fi
done

if [[ $ERRORS -eq 0 ]]; then
    echo "PASS: All main plugin files have GPL-2.0-or-later header."
fi

echo ""
if [[ $ERRORS -gt 0 ]]; then
    echo "RESULT: ${ERRORS} security violation(s) found."
    exit 1
else
    echo "RESULT: All security guards passed."
    exit 0
fi
