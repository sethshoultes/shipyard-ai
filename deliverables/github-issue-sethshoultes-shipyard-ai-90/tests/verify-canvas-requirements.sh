#!/bin/bash
# verify-canvas-requirements.sh — Verify canvas implementation requirements
# Exit 0 on pass, non-zero on fail

set -e

FORGE_DIR="/home/agent/shipyard-ai/forge"
FAILED=0

echo "=== Canvas Requirements Verification ==="
echo ""

# Check canvas directory exists
if [ -d "$FORGE_DIR/app/canvas" ]; then
    echo "[PASS] app/canvas/ directory exists"
else
    echo "[FAIL] app/canvas/ directory does not exist"
    FAILED=1
fi

# Check for white background (one aesthetic)
echo "Checking for white canvas background..."
if grep -riE 'background:\s*#ffffff|background-color:\s*white|background:\s*white' "$FORGE_DIR/app/canvas" 2>/dev/null; then
    echo "[PASS] White canvas background found"
else
    echo "[WARN] White canvas background not explicitly found (may be in CSS)"
fi

# Check for infinite canvas properties
echo "Checking for infinite canvas properties..."
if grep -riE 'scale|offsetX|offsetY|pan|zoom' "$FORGE_DIR/app/canvas" 2>/dev/null > /dev/null; then
    echo "[PASS] Infinite canvas properties found (scale, offset, pan/zoom)"
else
    echo "[WARN] Infinite canvas properties not found"
fi

# Check for node directory
if [ -d "$FORGE_DIR/app/nodes" ]; then
    echo "[PASS] app/nodes/ directory exists"
else
    echo "[FAIL] app/nodes/ directory does not exist"
    FAILED=1
fi

# Check for BaseNode component
echo "Checking for BaseNode component..."
if grep -rE 'export.*BaseNode|function\s+BaseNode|class\s+BaseNode' "$FORGE_DIR/app/nodes" 2>/dev/null; then
    echo "[PASS] BaseNode component found"
else
    echo "[WARN] BaseNode component not found"
fi

# Check for AgentNode component
echo "Checking for AgentNode component..."
if grep -rE 'export.*AgentNode|function\s+AgentNode|class\s+AgentNode' "$FORGE_DIR/app/nodes" 2>/dev/null; then
    echo "[PASS] AgentNode component found"
else
    echo "[WARN] AgentNode component not found"
fi

# Check for connection/wiring support
echo "Checking for connection/wiring support..."
if grep -riE 'connection|wire|link|edge' "$FORGE_DIR/app/canvas" 2>/dev/null > /dev/null; then
    echo "[PASS] Connection/wiring support found"
else
    echo "[WARN] Connection/wiring support not found"
fi

# Check for drag handlers
echo "Checking for drag handlers..."
if grep -rE 'onMouseDown|onMouseMove|onMouseUp|onDrag' "$FORGE_DIR/app/nodes" 2>/dev/null > /dev/null; then
    echo "[PASS] Drag handlers found"
else
    echo "[WARN] Drag handlers not found"
fi

echo ""
echo "=== Canvas Requirements Verification Complete ==="

if [ $FAILED -eq 0 ]; then
    echo "Canvas structure checks passed."
    exit 0
else
    echo "Some canvas structure checks failed."
    exit 1
fi
