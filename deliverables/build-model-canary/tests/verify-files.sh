#!/bin/bash
# Verify all required files exist for build-model-canary

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

REQUIRED_FILES=(
    "spec.md"
    "todo.md"
    "slugify.ts"
    "truncate.ts"
    "index.ts"
    "tests/test-slugify.ts"
    "tests/test-truncate.ts"
)

echo "Verifying required files exist..."
FAILED=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file MISSING"
        FAILED=1
    fi
done

if [ $FAILED -eq 1 ]; then
    echo ""
    echo "FAILED: One or more required files are missing"
    exit 1
fi

echo ""
echo "PASSED: All required files exist"
exit 0
