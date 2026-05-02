#!/bin/bash
# verify-daemon-bridge.sh — Verify daemon bridge implementation
# Exit 0 on pass, non-zero on fail

set -e

FORGE_DIR="/home/agent/shipyard-ai/forge"
FAILED=0

echo "=== Daemon Bridge Verification ==="
echo ""

# Check daemon-bridge directory exists
if [ -d "$FORGE_DIR/daemon-bridge" ]; then
    echo "[PASS] daemon-bridge/ directory exists"
else
    echo "[FAIL] daemon-bridge/ directory does not exist"
    FAILED=1
fi

# Check schema subdirectory
if [ -d "$FORGE_DIR/daemon-bridge/schema" ]; then
    echo "[PASS] daemon-bridge/schema/ directory exists"
else
    echo "[FAIL] daemon-bridge/schema/ directory does not exist"
    FAILED=1
fi

# Check validator subdirectory
if [ -d "$FORGE_DIR/daemon-bridge/validator" ]; then
    echo "[PASS] daemon-bridge/validator/ directory exists"
else
    echo "[FAIL] daemon-bridge/validator/ directory does not exist"
    FAILED=1
fi

# Check submitter subdirectory
if [ -d "$FORGE_DIR/daemon-bridge/submitter" ]; then
    echo "[PASS] daemon-bridge/submitter/ directory exists"
else
    echo "[FAIL] daemon-bridge/submitter/ directory does not exist"
    FAILED=1
fi

# Check for workflow schema
echo "Checking for workflow schema..."
if grep -rE 'WorkflowSchema|workflow.*schema|nodes.*connections' "$FORGE_DIR/daemon-bridge/schema" 2>/dev/null; then
    echo "[PASS] Workflow schema found"
else
    echo "[WARN] Workflow schema not found"
fi

# Check for validation function
echo "Checking for validation function..."
if grep -rE 'validateWorkflow|validate.*workflow|isValid' "$FORGE_DIR/daemon-bridge/validator" 2>/dev/null; then
    echo "[PASS] Validation function found"
else
    echo "[WARN] Validation function not found"
fi

# Check for submit function
echo "Checking for submit function..."
if grep -rE 'submitWorkflow|submitJob|POST.*fetch' "$FORGE_DIR/daemon-bridge/submitter" 2>/dev/null; then
    echo "[PASS] Submit function found"
else
    echo "[WARN] Submit function not found"
fi

# Check for fetch POST request (daemon communication)
echo "Checking for daemon POST request..."
if grep -rE "method:\s*['\"]POST['\"]" "$FORGE_DIR/daemon-bridge" 2>/dev/null; then
    echo "[PASS] POST request found"
else
    echo "[WARN] POST request not found"
fi

echo ""
echo "=== Daemon Bridge Verification Complete ==="

if [ $FAILED -eq 0 ]; then
    echo "Daemon bridge structure checks passed."
    exit 0
else
    echo "Some daemon bridge structure checks failed."
    exit 1
fi
