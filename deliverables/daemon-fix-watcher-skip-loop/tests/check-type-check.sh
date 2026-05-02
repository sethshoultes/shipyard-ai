#!/bin/bash
# check-type-check.sh
# Verifies that TypeScript type checking passes

set -e

DAEMON_DIR="/home/agent/shipyard-ai/daemon"

echo "=== Running TypeScript Type Check ==="

cd "$DAEMON_DIR"

if npx tsc --noEmit; then
    echo "PASS: TypeScript type check passed"
    exit 0
else
    echo "FAIL: TypeScript type check failed"
    exit 1
fi
