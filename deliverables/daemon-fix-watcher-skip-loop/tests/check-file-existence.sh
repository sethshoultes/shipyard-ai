#!/bin/bash
# check-file-existence.sh
# Verifies that all required files exist

set -e

DAEMON_DIR="/home/agent/shipyard-ai/daemon"
ERRORS=0

echo "=== Checking File Existence ==="

# Check modified files exist
echo -n "Checking daemon/src/daemon.ts exists... "
if [ -f "$DAEMON_DIR/src/daemon.ts" ]; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

echo -n "Checking daemon/src/health.ts exists... "
if [ -f "$DAEMON_DIR/src/health.ts" ]; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check test file exists
echo -n "Checking daemon/tests/watcher-skip.test.ts exists... "
if [ -f "$DAEMON_DIR/tests/watcher-skip.test.ts" ]; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check deliverables exist
DELIVERABLES_DIR="/home/agent/shipyard-ai/deliverables/daemon-fix-watcher-skip-loop"

echo -n "Checking spec.md exists... "
if [ -f "$DELIVERABLES_DIR/spec.md" ]; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

echo -n "Checking todo.md exists... "
if [ -f "$DELIVERABLES_DIR/todo.md" ]; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== File Existence Check Complete ==="
if [ $ERRORS -eq 0 ]; then
    echo "All files exist!"
    exit 0
else
    echo "FAILED: $ERRORS file(s) missing"
    exit 1
fi
