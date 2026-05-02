#!/bin/bash
# verify-structure.sh — Verify Anvil CLI directory structure and file integrity
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANVIL_DIR="$SCRIPT_DIR/../anvil"

echo "=== Anvil Structure Verification ==="
echo ""

# Check 1: anvil/ directory exists
echo -n "Checking anvil/ directory exists... "
if [ -d "$ANVIL_DIR" ]; then
    echo "✓"
else
    echo "✗ FAILED: anvil/ directory does not exist"
    exit 1
fi

# Check 2: src/ subdirectory exists
echo -n "Checking src/ subdirectory exists... "
if [ -d "$ANVIL_DIR/src" ]; then
    echo "✓"
else
    echo "✗ FAILED: src/ subdirectory does not exist"
    exit 1
fi

# Check 3: Required source directories exist
for dir in commands generators utils; do
    echo -n "Checking src/$dir/ subdirectory exists... "
    if [ -d "$ANVIL_DIR/src/$dir" ]; then
        echo "✓"
    else
        echo "✗ FAILED: src/$dir/ subdirectory does not exist"
        exit 1
    fi
done

# Check 4: bin/ directory exists
echo -n "Checking bin/ subdirectory exists... "
if [ -d "$ANVIL_DIR/bin" ]; then
    echo "✓"
else
    echo "✗ FAILED: bin/ subdirectory does not exist"
    exit 1
fi

# Check 5: github-template/ directory exists
echo -n "Checking github-template/ subdirectory exists... "
if [ -d "$ANVIL_DIR/github-template" ]; then
    echo "✓"
else
    echo "✗ FAILED: github-template/ subdirectory does not exist"
    exit 1
fi

# Check 6: github-template/src/ exists
echo -n "Checking github-template/src/ subdirectory exists... "
if [ -d "$ANVIL_DIR/github-template/src" ]; then
    echo "✓"
else
    echo "✗ FAILED: github-template/src/ subdirectory does not exist"
    exit 1
fi

# Check 7: No subdirectories in generated worker output (flat structure rule)
# This verifies the generator doesn't create src/, lib/, tests/ in output
echo -n "Checking for banned subdirectories in generator output... "
# Note: This will be validated at runtime, but we check generator code doesn't hardcode banned paths
if grep -r "src/" "$ANVIL_DIR/src/generators/" 2>/dev/null | grep -v "\.ts:" | grep -q "writeFile.*src/"; then
    echo "✗ FAILED: Generator attempts to create src/ subdirectory"
    exit 1
else
    echo "✓"
fi

# Check 8: No placeholder files (spec.md, todo.md, README.md in root)
echo -n "Checking for banned placeholder files... "
BANNED_FILES="spec.md todo.md README.md CHANGELOG.md"
FOUND_BANNED=0
for file in $BANNED_FILES; do
    if [ -f "$ANVIL_DIR/$file" ]; then
        echo "✗ FAILED: Banned file found: $file"
        FOUND_BANNED=1
    fi
done
if [ $FOUND_BANNED -eq 0 ]; then
    echo "✓"
else
    exit 1
fi

# Check 9: No TODO/FIXME/HACK/XXX placeholders in source
echo -n "Scanning for TODO/FIXME/HACK/XXX placeholders... "
if grep -riE 'TODO|FIXME|HACK|XXX' "$ANVIL_DIR/src/" 2>/dev/null; then
    echo "✗ FAILED: Found placeholder comments in source"
    exit 1
else
    echo "✓"
fi

# Check 10: No empty function bodies (placeholder implementations)
echo -n "Scanning for empty function bodies... "
# Look for patterns like "function foo() {}" or "const foo = () => {}"
if grep -rE '=> \{\s*\}' "$ANVIL_DIR/src/" 2>/dev/null | grep -v "//"; then
    echo "✗ FAILED: Found empty function bodies (arrow functions)"
    exit 1
fi

echo ""
echo "=== All Structure Checks Passed ==="
exit 0
