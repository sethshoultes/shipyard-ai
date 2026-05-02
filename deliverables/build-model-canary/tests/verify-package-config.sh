#!/bin/bash
# Verify package.json and tsconfig.json are correctly configured

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "Verifying package.json..."

if [ ! -f "package.json" ]; then
    echo "  ✗ package.json not found"
    echo "FAILED"
    exit 1
fi

# Check for zero dependencies
DEP_COUNT=$(cat package.json | jq '.dependencies | length')
if [ "$DEP_COUNT" != "0" ]; then
    echo "  ✗ package.json has $DEP_COUNT dependencies (expected 0)"
    echo "FAILED"
    exit 1
fi
echo "  ✓ Zero runtime dependencies"

# Check for no devDependencies
if jq -e 'has("devDependencies")' package.json > /dev/null 2>&1; then
    echo "  ✗ package.json has devDependencies (not allowed)"
    echo "FAILED"
    exit 1
fi
echo "  ✓ No devDependencies"

# Check for no scripts (minimal config)
if jq -e 'has("scripts")' package.json > /dev/null 2>&1; then
    echo "  ✗ package.json has scripts (should be minimal)"
    echo "FAILED"
    exit 1
fi
echo "  ✓ No scripts field"

# Check for no exports (direct file imports only)
if jq -e 'has("exports")' package.json > /dev/null 2>&1; then
    echo "  ✗ package.json has exports field (not allowed)"
    echo "FAILED"
    exit 1
fi
echo "  ✓ No exports field"

echo ""
echo "Verifying tsconfig.json..."

if [ ! -f "tsconfig.json" ]; then
    echo "  ✗ tsconfig.json not found"
    echo "FAILED"
    exit 1
fi

# Check module resolution
MODULE=$(cat tsconfig.json | jq -r '.compilerOptions.module')
if [ "$MODULE" != "NodeNext" ]; then
    echo "  ✗ module is '$MODULE' (expected 'NodeNext')"
    echo "FAILED"
    exit 1
fi
echo "  ✓ module: NodeNext"

RESOLUTION=$(cat tsconfig.json | jq -r '.compilerOptions.moduleResolution')
if [ "$RESOLUTION" != "NodeNext" ]; then
    echo "  ✗ moduleResolution is '$RESOLUTION' (expected 'NodeNext')"
    echo "FAILED"
    exit 1
fi
echo "  ✓ moduleResolution: NodeNext"

# Check for no src/, dist/, lib/ references
if grep -E '"src/|"dist/|"lib/' tsconfig.json > /dev/null 2>&1; then
    echo "  ✗ tsconfig.json references src/, dist/, or lib/ (flat structure required)"
    echo "FAILED"
    exit 1
fi
echo "  ✓ No src/, dist/, lib/ references"

echo ""
echo "PASSED: Configuration files are correctly set up"
exit 0
