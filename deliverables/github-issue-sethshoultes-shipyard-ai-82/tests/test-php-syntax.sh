#!/usr/bin/env bash
#
# test-php-syntax.sh — Run `php -l` on every PHP file in the build.
#
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

BUILD_DIR="${BUILD_DIR:-projects/cut/build}"
FAIL=0

echo "=== PHP Syntax Lint ==="
echo "BUILD_DIR: $BUILD_DIR"
echo ""

if ! command -v php >/dev/null 2>&1; then
    echo "SKIP: php binary not found in PATH"
    exit 0
fi

# Find all PHP files and lint them
while IFS= read -r -d '' file; do
    if ! php -l "$file" >/dev/null 2>&1; then
        echo "FAIL: $file"
        FAIL=1
    else
        echo "PASS: $file"
    fi
done <<( find "$BUILD_DIR" -type f -name "*.php" -print0 )

echo ""
if [[ "$FAIL" -eq 0 ]]; then
    echo "=== ALL PHP FILES PASS ==="
    exit 0
else
    echo "=== SOME PHP FILES HAVE SYNTAX ERRORS ==="
    exit 1
fi
