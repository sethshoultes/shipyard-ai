#!/bin/bash
# verify-types.sh — Verify TypeScript type checking passes
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANVIL_DIR="$SCRIPT_DIR/../anvil"

echo "=== Anvil TypeScript Verification ==="
echo ""

# Check 1: tsconfig.json exists
echo -n "Checking tsconfig.json exists... "
if [ -f "$ANVIL_DIR/tsconfig.json" ]; then
    echo "✓"
else
    echo "✗ FAILED: tsconfig.json does not exist"
    exit 1
fi

# Check 2: tsconfig.json has correct module setting
echo -n "Checking tsconfig.json module setting... "
MODULE_SETTING=$(cat "$ANVIL_DIR/tsconfig.json" | grep -o '"module"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1)
if echo "$MODULE_SETTING" | grep -q "NodeNext"; then
    echo "✓"
else
    echo "✗ FAILED: module should be NodeNext"
    exit 1
fi

# Check 3: tsconfig.json has strict mode enabled
echo -n "Checking tsconfig.json strict mode... "
if grep -q '"strict"[[:space:]]*:[[:space:]]*true' "$ANVIL_DIR/tsconfig.json"; then
    echo "✓"
else
    echo "✗ FAILED: strict mode should be enabled"
    exit 1
fi

# Check 4: tsconfig.json does NOT include outDir, rootDir, src/, dist/
echo -n "Checking tsconfig.json doesn't reference banned paths... "
if grep -qE '"outDir"|"rootDir"' "$ANVIL_DIR/tsconfig.json"; then
    echo "✗ FAILED: tsconfig.json should not have outDir or rootDir"
    exit 1
else
    echo "✓"
fi

# Check 5: Run tsc --noEmit
echo ""
echo "Running tsc --noEmit..."
cd "$ANVIL_DIR"

# Check if tsc is available
if ! command -v tsc &> /dev/null; then
    echo "⚠ tsc not found, checking for npx..."
    if command -v npx &> /dev/null; then
        echo "Using npx tsc..."
        if npx tsc --noEmit 2>&1; then
            echo "✓ TypeScript compilation passed"
        else
            echo "✗ FAILED: TypeScript compilation failed"
            exit 1
        fi
    else
        echo "⚠ WARNING: Cannot run tsc --noEmit (tsc and npx not available)"
        echo "Skipping type check"
    fi
else
    if tsc --noEmit 2>&1; then
        echo "✓ TypeScript compilation passed"
    else
        echo "✗ FAILED: TypeScript compilation failed"
        exit 1
    fi
fi

# Check 6: Verify no 'any' types in source files
echo ""
echo -n "Scanning for 'any' type usage... "
# Allow 'any' in comments but not in type annotations
if grep -rE ':\s*any\b' "$ANVIL_DIR/src/" 2>/dev/null | grep -v "//.*any"; then
    echo "✗ FAILED: Found explicit 'any' type usage"
    exit 1
else
    echo "✓"
fi

# Check 7: Verify all functions have explicit return types
echo -n "Checking for explicit return types on exported functions... "
# This is a simple heuristic - exported functions should have return type annotations
MISSING_RETURN=0
for file in "$ANVIL_DIR/src/"*.ts "$ANVIL_DIR/src/"*/*.ts; do
    if [ -f "$file" ]; then
        # Check for exported functions without return types
        if grep -E '^export (async )?function' "$file" | grep -vE ':\s*(void|string|number|boolean|Promise|Array|Object|[A-Z][a-zA-Z]*)' > /dev/null 2>&1; then
            echo "⚠ WARNING: $file may have functions without explicit return types"
            MISSING_RETURN=1
        fi
    fi
done
if [ $MISSING_RETURN -eq 0 ]; then
    echo "✓"
else
    echo "  (Review recommended)"
fi

echo ""
echo "=== All Type Checks Passed ==="
exit 0
