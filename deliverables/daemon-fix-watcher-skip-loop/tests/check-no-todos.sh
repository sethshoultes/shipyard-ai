#!/bin/bash
# check-no-todos.sh
# Verifies that no TODOs, FIXMEs, or placeholders exist in modified files

set -e

DAEMON_DIR="/home/agent/shipyard-ai/daemon"
ERRORS=0

echo "=== Checking for TODOs and Placeholders ==="

# Check daemon.ts
echo -n "Checking daemon.ts for TODOs... "
if grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' "$DAEMON_DIR/src/daemon.ts" 2>/dev/null; then
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS"
fi

# Check health.ts
echo -n "Checking health.ts for TODOs... "
if grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' "$DAEMON_DIR/src/health.ts" 2>/dev/null; then
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS"
fi

# Check test file if it exists
if [ -f "$DAEMON_DIR/tests/watcher-skip.test.ts" ]; then
    echo -n "Checking watcher-skip.test.ts for TODOs... "
    if grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' "$DAEMON_DIR/tests/watcher-skip.test.ts" 2>/dev/null; then
        echo "FAIL"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS"
    fi
fi

echo ""
echo "=== TODO Check Complete ==="
if [ $ERRORS -eq 0 ]; then
    echo "All checks passed!"
    exit 0
else
    echo "FAILED: $ERRORS check(s) failed"
    exit 1
fi
