#!/usr/bin/env bash
#
# test-js-syntax.sh — Run `node --check` on every JS file in the build.
#
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

BUILD_DIR="${BUILD_DIR:-projects/cut/build}"
FAIL=0

echo "=== JS Syntax Check ==="
echo "BUILD_DIR: $BUILD_DIR"
echo ""

if ! command -v node >/dev/null 2>&1; then
    echo "SKIP: node binary not found in PATH"
    exit 0
fi

# Find all JS files and syntax-check them
while IFS= read -r -d '' file; do
    if ! node --check "$file" >/dev/null 2>&1; then
        echo "FAIL: $file"
        FAIL=1
    else
        echo "PASS: $file"
    fi
done <<( find "$BUILD_DIR" -type f -name "*.js" -print0 )

echo ""
if [[ "$FAIL" -eq 0 ]]; then
    echo "=== ALL JS FILES PASS ==="
    exit 0
else
    echo "=== SOME JS FILES HAVE SYNTAX ERRORS ==="
    exit 1
fi
