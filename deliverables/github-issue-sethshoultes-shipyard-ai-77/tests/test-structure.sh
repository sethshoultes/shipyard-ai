#!/bin/bash
#
# test-structure.sh — Verify Stage plugin file structure, existence, and size limits.
# Exits 0 on pass, non-zero on fail.
#

set -euo pipefail

PLUGIN_DIR="stage"
PHP_LIMIT=500
CSS_LIMIT=200
ERRORS=0

echo "=== Stage Structure Test ==="

# Expected directories
for dir in "$PLUGIN_DIR" "$PLUGIN_DIR/includes" "$PLUGIN_DIR/templates" "$PLUGIN_DIR/assets/css"; do
    if [[ ! -d "$dir" ]]; then
        echo "FAIL: Directory missing: $dir"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: Directory exists: $dir"
    fi
done

# Expected files
for file in \
    "$PLUGIN_DIR/stage.php" \
    "$PLUGIN_DIR/includes/post-type.php" \
    "$PLUGIN_DIR/includes/settings.php" \
    "$PLUGIN_DIR/includes/api.php" \
    "$PLUGIN_DIR/includes/template.php" \
    "$PLUGIN_DIR/templates/showcase.php" \
    "$PLUGIN_DIR/assets/css/stage.css" \
    "$PLUGIN_DIR/readme.txt"
do
    if [[ ! -f "$file" ]]; then
        echo "FAIL: File missing: $file"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: File exists: $file"
    fi
done

# PHP line count (all PHP files concatenated)
if [[ -d "$PLUGIN_DIR" ]]; then
    PHP_LINES=$(find "$PLUGIN_DIR" -name '*.php' -exec cat {} + 2>/dev/null | wc -l)
    if (( PHP_LINES > PHP_LIMIT )); then
        echo "FAIL: Total PHP lines ($PHP_LINES) exceed limit ($PHP_LIMIT)"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: PHP lines ($PHP_LINES) within limit ($PHP_LIMIT)"
    fi

    # CSS line count
    CSS_FILE="$PLUGIN_DIR/assets/css/stage.css"
    if [[ -f "$CSS_FILE" ]]; then
        CSS_LINES=$(wc -l < "$CSS_FILE")
        if (( CSS_LINES > CSS_LIMIT )); then
            echo "FAIL: CSS lines ($CSS_LINES) exceed limit ($CSS_LIMIT)"
            ERRORS=$((ERRORS + 1))
        else
            echo "PASS: CSS lines ($CSS_LINES) within limit ($CSS_LIMIT)"
        fi
    fi
fi

# Zero JS files (CSS-only mandate)
if [[ -d "$PLUGIN_DIR" ]]; then
    JS_COUNT=$(find "$PLUGIN_DIR" -name '*.js' | wc -l)
    if (( JS_COUNT > 0 )); then
        echo "FAIL: Found $JS_COUNT JS file(s); Stage must be CSS-only"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: Zero JS files found"
    fi
fi

if (( ERRORS > 0 )); then
    echo "=== FAILED: $ERRORS structure error(s) ==="
    exit 1
fi

echo "=== All structure tests passed ==="
exit 0
