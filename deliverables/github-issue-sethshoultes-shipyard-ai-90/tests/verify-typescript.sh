#!/bin/bash
# verify-typescript.sh — Verify TypeScript configuration and type checking
# Exit 0 on pass, non-zero on fail

set -e

FORGE_DIR="/home/agent/shipyard-ai/forge"
FAILED=0

echo "=== TypeScript Verification ==="
echo ""

# Check package.json exists and is valid JSON
echo "Checking package.json..."
if [ -f "$FORGE_DIR/package.json" ]; then
    if cat "$FORGE_DIR/package.json" | python3 -m json.tool > /dev/null 2>&1; then
        echo "[PASS] package.json is valid JSON"
    else
        echo "[FAIL] package.json is not valid JSON"
        FAILED=1
    fi
else
    echo "[FAIL] package.json does not exist"
    FAILED=1
fi

# Check tsconfig.json exists and is valid JSON
echo "Checking tsconfig.json..."
if [ -f "$FORGE_DIR/tsconfig.json" ]; then
    if cat "$FORGE_DIR/tsconfig.json" | python3 -m json.tool > /dev/null 2>&1; then
        echo "[PASS] tsconfig.json is valid JSON"
    else
        echo "[FAIL] tsconfig.json is not valid JSON"
        FAILED=1
    fi
else
    echo "[FAIL] tsconfig.json does not exist"
    FAILED=1
fi

# Check for zero runtime dependencies
echo "Checking for zero runtime dependencies..."
if [ -f "$FORGE_DIR/package.json" ]; then
    DEP_COUNT=$(cat "$FORGE_DIR/package.json" | python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('dependencies', {})))" 2>/dev/null || echo "-1")
    if [ "$DEP_COUNT" = "0" ]; then
        echo "[PASS] Zero runtime dependencies"
    else
        echo "[FAIL] Found $DEP_COUNT runtime dependencies (should be 0)"
        FAILED=1
    fi
fi

# Check for no devDependencies
echo "Checking for no devDependencies..."
if [ -f "$FORGE_DIR/package.json" ]; then
    HAS_DEV_DEPS=$(cat "$FORGE_DIR/package.json" | python3 -c "import sys, json; d=json.load(sys.stdin); print('yes' if 'devDependencies' in d else 'no')" 2>/dev/null || echo "error")
    if [ "$HAS_DEV_DEPS" = "no" ]; then
        echo "[PASS] No devDependencies"
    else
        echo "[FAIL] devDependencies section exists (should not exist in artifact)"
        FAILED=1
    fi
fi

# Check tsconfig.json has required settings
echo "Checking tsconfig.json settings..."
if [ -f "$FORGE_DIR/tsconfig.json" ]; then
    # Check for NodeNext module
    MODULE=$(cat "$FORGE_DIR/tsconfig.json" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('compilerOptions', {}).get('module', ''))" 2>/dev/null || echo "")
    if [ "$MODULE" = "NodeNext" ]; then
        echo "[PASS] Module set to NodeNext"
    else
        echo "[FAIL] Module should be NodeNext, got: $MODULE"
        FAILED=1
    fi

    # Check for strict mode
    STRICT=$(cat "$FORGE_DIR/tsconfig.json" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('compilerOptions', {}).get('strict', False))" 2>/dev/null || echo "False")
    if [ "$STRICT" = "True" ]; then
        echo "[PASS] Strict mode enabled"
    else
        echo "[FAIL] Strict mode should be true, got: $STRICT"
        FAILED=1
    fi
fi

# Check for forbidden directory references in tsconfig
echo "Checking for forbidden directory references..."
if [ -f "$FORGE_DIR/tsconfig.json" ]; then
    if grep -E '"src/"|"dist/"|"lib/"|"tests/"' "$FORGE_DIR/tsconfig.json" > /dev/null 2>&1; then
        echo "[FAIL] Found forbidden directory references (src/, dist/, lib/, tests/)"
        FAILED=1
    else
        echo "[PASS] No forbidden directory references"
    fi
fi

# Run tsc --noEmit if TypeScript is available
echo "Running TypeScript type check..."
if command -v tsc &> /dev/null; then
    cd "$FORGE_DIR"
    if tsc --noEmit 2>&1; then
        echo "[PASS] TypeScript type check passed"
    else
        echo "[FAIL] TypeScript type check failed"
        FAILED=1
    fi
else
    echo "[SKIP] TypeScript compiler not available"
fi

echo ""
echo "=== TypeScript Verification Complete ==="

if [ $FAILED -eq 0 ]; then
    echo "All TypeScript checks passed."
    exit 0
else
    echo "Some TypeScript checks failed."
    exit 1
fi
