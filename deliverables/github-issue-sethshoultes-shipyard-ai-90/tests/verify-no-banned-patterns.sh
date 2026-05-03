#!/bin/bash
# verify-no-banned-patterns.sh — Check for banned patterns in Forge codebase
# Exit 0 on pass (no matches), non-zero on fail (matches found)

set -e

FORGE_DIR="/home/agent/shipyard-ai/forge"
FAILED=0

echo "=== Banned Patterns Verification ==="
echo ""

# Check for TODO/FIXME/HACK/XXX comments
echo "Checking for TODO/FIXME/HACK/XXX comments..."
if grep -riE 'TODO|FIXME|HACK|XXX' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found TODO/FIXME/HACK/XXX comments"
    FAILED=1
else
    echo "[PASS] No TODO/FIXME/HACK/XXX comments found"
fi

# Check for placeholder code
echo "Checking for placeholder code..."
if grep -riE 'implement me|fix later|placeholder|stub' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found placeholder code markers"
    FAILED=1
else
    echo "[PASS] No placeholder code markers found"
fi

# Check for empty function bodies (naive check)
echo "Checking for empty function bodies..."
if grep -rE 'function\s+\w+\s*\(\s*\)\s*\{\s*\}' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found empty function bodies"
    FAILED=1
else
    echo "[PASS] No empty function bodies found"
fi

# Check for dark mode (explicitly NOT in v1)
echo "Checking for dark mode implementation..."
if grep -riE 'dark.*mode|darkMode|theme.*dark' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found dark mode code (not in v1 scope)"
    FAILED=1
else
    echo "[PASS] No dark mode code found"
fi

# Check for JSON editor (explicitly NOT in v1)
echo "Checking for JSON editor..."
if grep -riE 'json.*editor|json.*input|codemirror|monaco' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found JSON editor code (not in v1 scope)"
    FAILED=1
else
    echo "[PASS] No JSON editor code found"
fi

# Check for onboarding wizard (explicitly NOT in v1)
echo "Checking for onboarding wizard..."
if grep -riE 'onboarding|wizard|tour|intro\.js|driver\.js' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found onboarding wizard code (not in v1 scope)"
    FAILED=1
else
    echo "[PASS] No onboarding wizard code found"
fi

# Check for WordPress plugin code (explicitly NOT in v1)
echo "Checking for WordPress plugin code..."
if grep -riE 'wordpress|wp_|add_action|apply_filters' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found WordPress plugin code (not in v1 scope)"
    FAILED=1
else
    echo "[PASS] No WordPress plugin code found"
fi

# Check for Workers AI (explicitly NOT in v1)
echo "Checking for Workers AI code..."
if grep -riE 'workers\.ai|@cloudflare/ai|ai\.run' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found Workers AI code (not in v1 scope)"
    FAILED=1
else
    echo "[PASS] No Workers AI code found"
fi

# Check for Stripe/billing code (explicitly NOT in v1)
echo "Checking for Stripe/billing code..."
if grep -riE 'stripe|billing|subscription|checkout' "$FORGE_DIR" 2>/dev/null; then
    echo "[FAIL] Found Stripe/billing code (not in v1 scope)"
    FAILED=1
else
    echo "[PASS] No Stripe/billing code found"
fi

echo ""
echo "=== Banned Patterns Verification Complete ==="

if [ $FAILED -eq 0 ]; then
    echo "All banned pattern checks passed."
    exit 0
else
    echo "Some banned patterns were found."
    exit 1
fi
