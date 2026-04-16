#!/usr/bin/env bash
# Test: Verify TypeScript compilation succeeds for sandbox-entry.ts
# Exit 0 on pass, non-zero on fail

set -euo pipefail

PLUGIN_DIR="/home/agent/shipyard-ai/plugins/eventdash"
SANDBOX_ENTRY="src/sandbox-entry.ts"

echo "=== Testing TypeScript Compilation ==="
echo ""

# Change to plugin directory
cd "$PLUGIN_DIR"
echo "Working directory: $(pwd)"
echo ""

# Check if dependencies are installed
echo "[1/3] Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "✓ node_modules exists"
else
  echo "⚠ node_modules not found, installing dependencies..."
  npm install --silent
  if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
  else
    echo "✗ FAIL: npm install failed"
    exit 1
  fi
fi
echo ""

# Run TypeScript compilation check (no emit, just type checking)
echo "[2/3] Running TypeScript compilation check..."
if npx tsc --noEmit "$SANDBOX_ENTRY" 2>&1 | tee ts-check.log; then
  echo "✓ PASS: TypeScript compilation succeeded"
  COMPILATION_PASSED=1
else
  echo "✗ FAIL: TypeScript compilation failed"
  COMPILATION_PASSED=0
fi
echo ""

# Check for errors in output
echo "[3/3] Analyzing compilation output..."
if [ -f "ts-check.log" ]; then
  ERROR_COUNT=$(grep -c "error TS" ts-check.log || echo "0")
  if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "✓ No TypeScript errors found"
  else
    echo "✗ FAIL: Found $ERROR_COUNT TypeScript errors"
    echo ""
    echo "=== Error Details ==="
    grep "error TS" ts-check.log || true
    COMPILATION_PASSED=0
  fi
else
  echo "⚠ Warning: ts-check.log not found"
fi
echo ""

# Summary
echo "=== Test Summary ==="
if [ $COMPILATION_PASSED -eq 1 ]; then
  echo "✓ TypeScript compilation PASSED"
  echo "File: $SANDBOX_ENTRY compiles without errors"
  exit 0
else
  echo "✗ TypeScript compilation FAILED"
  echo "See ts-check.log for details"
  exit 1
fi
