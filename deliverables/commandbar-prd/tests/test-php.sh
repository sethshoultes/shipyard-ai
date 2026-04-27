#!/usr/bin/env bash
# test-php.sh — Verify beam.php constraints
# Pass: exits 0. Fail: exits non-zero.

set -euo pipefail

PHP_FILE="projects/commandbar-prd/build/beam/beam.php"

echo "=== PHP Test ==="

if [[ ! -f "$PHP_FILE" ]]; then
    echo "SKIP: $PHP_FILE not found yet"
    exit 0
fi

# 1. Syntax check
if ! command -v php > /dev/null 2>&1; then
    echo "SKIP: php binary not available in environment"
else
    if ! php -l "$PHP_FILE" > /dev/null 2>&1; then
        echo "FAIL: PHP syntax error in $PHP_FILE"
        exit 1
    fi
    echo "PASS: PHP syntax valid"
fi

# 2. Line count ≤ 250
lines=$(wc -l < "$PHP_FILE")
if (( lines > 250 )); then
    echo "FAIL: $PHP_FILE has $lines lines (max 250)"
    exit 1
fi
echo "PASS: Line count $lines ≤ 250"

# 3. ABSPATH guard present
if ! grep -q "ABSPATH" "$PHP_FILE"; then
    echo "FAIL: ABSPATH security guard missing"
    exit 1
fi
echo "PASS: ABSPATH guard present"

# 4. No register_rest_route
if grep -q "register_rest_route" "$PHP_FILE"; then
    echo "FAIL: Found register_rest_route (REST API banned)"
    exit 1
fi
echo "PASS: No REST routes"

# 5. No settings pages
if grep -qE "add_options_page|add_menu_page|add_submenu_page" "$PHP_FILE"; then
    echo "FAIL: Found settings page registration"
    exit 1
fi
echo "PASS: No settings pages"

# 6. Extensibility hook present
if ! grep -q "apply_filters( 'beam_items'" "$PHP_FILE"; then
    echo "FAIL: beam_items filter hook missing"
    exit 1
fi
echo "PASS: beam_items filter hook present"

# 7. Exactly one wp_localize_script
count=$(grep -c "wp_localize_script" "$PHP_FILE" || true)
if (( count != 1 )); then
    echo "FAIL: Found $count wp_localize_script calls (expected 1)"
    exit 1
fi
echo "PASS: Exactly one wp_localize_script call"

# 8. Capability filtering present
if ! grep -q "current_user_can" "$PHP_FILE"; then
    echo "FAIL: current_user_can capability check missing"
    exit 1
fi
echo "PASS: Capability filtering present"

# 9. No localStorage in PHP
if grep -q "localStorage" "$PHP_FILE"; then
    echo "FAIL: Found localStorage reference in PHP file"
    exit 1
fi
echo "PASS: No localStorage in PHP"

# 10. Plugin header fields
for field in "Plugin Name:" "Version:" "Requires at least:" "Requires PHP:" "License:"; do
    if ! grep -q "$field" "$PHP_FILE"; then
        echo "FAIL: Missing plugin header field: $field"
        exit 1
    fi
done
echo "PASS: Plugin header fields complete"

echo "=== PHP Test: ALL PASSED ==="
