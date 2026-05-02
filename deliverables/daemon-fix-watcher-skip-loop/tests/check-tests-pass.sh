#!/bin/bash
# check-tests-pass.sh
# Verifies that the vitest tests for watcher-skip pass

set -e

DAEMON_DIR="/home/agent/shipyard-ai/daemon"

echo "=== Running Vitest Tests ==="

cd "$DAEMON_DIR"

if npx vitest run tests/watcher-skip.test.ts; then
    echo "PASS: Vitest tests passed"
    exit 0
else
    echo "FAIL: Vitest tests failed"
    exit 1
fi
