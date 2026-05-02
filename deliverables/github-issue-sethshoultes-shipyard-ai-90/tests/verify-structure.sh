#!/bin/bash
# verify-structure.sh — Verify Forge directory structure and file existence
# Exit 0 on pass, non-zero on fail

set -e

FORGE_DIR="/home/agent/shipyard-ai/forge"
FAILED=0

echo "=== Forge Structure Verification ==="
echo ""

# Check forge directory exists
if [ -d "$FORGE_DIR" ]; then
    echo "[PASS] forge/ directory exists"
else
    echo "[FAIL] forge/ directory does not exist"
    FAILED=1
fi

# Check required subdirectories
DIRS=(
    "app/canvas"
    "app/nodes"
    "app/executor"
    "app/preview"
    "app/voice"
    "daemon-bridge/schema"
    "daemon-bridge/validator"
    "daemon-bridge/submitter"
    "cache"
    "budgets"
    "api"
)

for dir in "${DIRS[@]}"; do
    if [ -d "$FORGE_DIR/$dir" ]; then
        echo "[PASS] forge/$dir/ exists"
    else
        echo "[FAIL] forge/$dir/ does not exist"
        FAILED=1
    fi
done

# Check required files exist
FILES=(
    "package.json"
    "tsconfig.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$FORGE_DIR/$file" ]; then
        echo "[PASS] forge/$file exists"
    else
        echo "[FAIL] forge/$file does not exist"
        FAILED=1
    fi
done

echo ""
echo "=== Structure Verification Complete ==="

if [ $FAILED -eq 0 ]; then
    echo "All structure checks passed."
    exit 0
else
    echo "Some structure checks failed."
    exit 1
fi
