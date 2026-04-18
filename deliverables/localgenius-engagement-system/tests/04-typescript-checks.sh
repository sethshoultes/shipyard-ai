#!/bin/bash
# Test: Run TypeScript type checking
# Exit 0 on pass, non-zero on fail

set -e

LOCALGENIUS_DIR="/home/agent/localgenius"

echo "===== TypeScript Type Checking Test ====="
echo "Running npm run typecheck..."

cd "$LOCALGENIUS_DIR"

# Check if typecheck script exists in package.json
if ! grep -q '"typecheck"' package.json; then
  echo "⚠ No typecheck script in package.json, skipping"
  exit 0
fi

# Run typecheck
if npm run typecheck; then
  echo ""
  echo "PASS: No TypeScript errors"
  exit 0
else
  echo ""
  echo "FAIL: TypeScript errors detected"
  exit 1
fi
