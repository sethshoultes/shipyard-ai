#!/bin/bash
# verify-dependencies.sh — Verify zero-dependency contract
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANVIL_DIR="$SCRIPT_DIR/../anvil"

echo "=== Anvil Dependency Verification ==="
echo ""

# Check 1: package.json exists
echo -n "Checking package.json exists... "
if [ -f "$ANVIL_DIR/package.json" ]; then
    echo "✓"
else
    echo "✗ FAILED: package.json does not exist"
    exit 1
fi

# Check 2: package.json is valid JSON
echo -n "Checking package.json is valid JSON... "
if command -v jq &> /dev/null; then
    if jq empty "$ANVIL_DIR/package.json" 2>/dev/null; then
        echo "✓"
    else
        echo "✗ FAILED: package.json is not valid JSON"
        exit 1
    fi
else
    echo "⚠ jq not available, using node for validation"
    if node -e "JSON.parse(require('fs').readFileSync('$ANVIL_DIR/package.json', 'utf8'))" 2>/dev/null; then
        echo "✓"
    else
        echo "✗ FAILED: package.json is not valid JSON"
        exit 1
    fi
fi

# Check 3: dependencies field exists and is empty
echo -n "Checking dependencies is empty... "
if command -v jq &> /dev/null; then
    DEP_COUNT=$(jq '.dependencies | length' "$ANVIL_DIR/package.json")
    if [ "$DEP_COUNT" -eq 0 ]; then
        echo "✓ (0 dependencies)"
    else
        echo "✗ FAILED: dependencies should be empty, found $DEP_COUNT"
        exit 1
    fi
else
    if grep -q '"dependencies"[[:space:]]*:[[:space:]]*{}' "$ANVIL_DIR/package.json"; then
        echo "✓"
    else
        echo "✗ FAILED: dependencies should be empty {}"
        exit 1
    fi
fi

# Check 4: No devDependencies field
echo -n "Checking devDependencies does not exist... "
if command -v jq &> /dev/null; then
    if jq -e 'has("devDependencies")' "$ANVIL_DIR/package.json" > /dev/null 2>&1; then
        echo "✗ FAILED: devDependencies should not exist"
        exit 1
    else
        echo "✓"
    fi
else
    if grep -q '"devDependencies"' "$ANVIL_DIR/package.json"; then
        echo "✗ FAILED: devDependencies should not exist"
        exit 1
    else
        echo "✓"
    fi
fi

# Check 5: Verify name is "anvil"
echo -n "Checking package name is 'anvil'... "
if command -v jq &> /dev/null; then
    NAME=$(jq -r '.name' "$ANVIL_DIR/package.json")
    if [ "$NAME" = "anvil" ]; then
        echo "✓"
    else
        echo "✗ FAILED: name should be 'anvil', got '$NAME'"
        exit 1
    fi
else
    if grep -q '"name"[[:space:]]*:[[:space:]]*"anvil"' "$ANVIL_DIR/package.json"; then
        echo "✓"
    else
        echo "✗ FAILED: name should be 'anvil'"
        exit 1
    fi
fi

# Check 6: Verify type is "module"
echo -n "Checking type is 'module'... "
if command -v jq &> /dev/null; then
    TYPE=$(jq -r '.type' "$ANVIL_DIR/package.json")
    if [ "$TYPE" = "module" ]; then
        echo "✓"
    else
        echo "✗ FAILED: type should be 'module', got '$TYPE'"
        exit 1
    fi
else
    if grep -q '"type"[[:space:]]*:[[:space:]]*"module"' "$ANVIL_DIR/package.json"; then
        echo "✓"
    else
        echo "✗ FAILED: type should be 'module'"
        exit 1
    fi
fi

# Check 7: No banned dependencies (wrangler should not be in CLI deps)
echo -n "Checking for banned runtime dependencies... "
BANNED_DEPS="wrangler @cloudflare/workers-types typescript ts-node tsx"
FOUND_BANNED=0
for dep in $BANNED_DEPS; do
    if grep -q "\"$dep\"" "$ANVIL_DIR/package.json"; then
        echo "✗ FAILED: Banned dependency found: $dep"
        FOUND_BANNED=1
    fi
done
if [ $FOUND_BANNED -eq 0 ]; then
    echo "✓"
else
    exit 1
fi

# Check 8: Verify github-template/package.json has minimal deps
echo ""
echo "Checking github-template/package.json..."
TEMPLATE_PKG="$ANVIL_DIR/github-template/package.json"
if [ -f "$TEMPLATE_PKG" ]; then
    echo -n "  github-template/package.json exists... "
    echo "✓"

    # Should only have wrangler as dependency
    echo -n "  Checking template has minimal dependencies... "
    if command -v jq &> /dev/null; then
        TEMPLATE_DEP_COUNT=$(jq '.dependencies | length' "$TEMPLATE_PKG")
        if [ "$TEMPLATE_DEP_COUNT" -le 2 ]; then
            echo "✓ ($TEMPLATE_DEP_COUNT dependencies)"
        else
            echo "⚠ WARNING: Template has $TEMPLATE_DEP_COUNT dependencies (expected ≤2)"
        fi
    else
        echo "✓ (jq not available, skipping count)"
    fi
else
    echo "⚠ WARNING: github-template/package.json not found (may be generated at runtime)"
fi

echo ""
echo "=== All Dependency Checks Passed ==="
exit 0
