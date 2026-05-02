#!/bin/bash
# Verify no placeholder comments or TODOs in source files

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "Scanning for placeholder comments..."

# Patterns to reject
PATTERNS=(
    "TODO"
    "FIXME"
    "HACK"
    "XXX"
    "placeholder"
    "implement me"
    "fix later"
)

FAILED=0

for pattern in "${PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.ts" . 2>/dev/null; then
        echo "  ✗ Found banned pattern: $pattern"
        FAILED=1
    fi
done

# Check for empty function bodies (export function name(): type { })
echo "Checking for empty function bodies..."
if grep -E '^\s*export\s+function\s+\w+\([^)]*\)\s*:\s*\w+\s*\{\s*\}' *.ts 2>/dev/null; then
    echo "  ✗ Found empty function body"
    FAILED=1
fi

if [ $FAILED -eq 1 ]; then
    echo ""
    echo "FAILED: Placeholder comments or empty functions found"
    exit 1
fi

echo "  ✓ No TODO, FIXME, HACK, XXX, or placeholder comments"
echo "  ✓ No empty function bodies"
echo ""
echo "PASSED: No placeholder content detected"
exit 0
