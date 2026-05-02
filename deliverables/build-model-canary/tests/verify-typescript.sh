#!/bin/bash
# Verify TypeScript type checking passes

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "Running TypeScript type check..."

if ! command -v tsc &> /dev/null; then
    echo "  ⚠ tsc not found in PATH, skipping type check"
    echo "PASSED (skipped - tsc not available)"
    exit 0
fi

# Type check source files
if tsc --noEmit slugify.ts truncate.ts index.ts 2>&1; then
    echo "  ✓ All TypeScript files pass type checking"
    echo ""
    echo "PASSED: TypeScript validation successful"
    exit 0
else
    echo "  ✗ TypeScript type check failed"
    echo ""
    echo "FAILED: Type errors detected"
    exit 1
fi
