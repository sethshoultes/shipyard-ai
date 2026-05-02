#!/bin/bash
# check-code-changes.sh
# Verifies that the required code changes have been applied to daemon.ts and health.ts

set -e

DAEMON_DIR="/home/agent/shipyard-ai/daemon"
ERRORS=0

echo "=== Checking Code Changes ==="

# Check 1: statSync imported in daemon.ts
echo -n "Checking statSync import in daemon.ts... "
if grep -q "import.*statSync.*from.*['\"]fs['\"]" "$DAEMON_DIR/src/daemon.ts"; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: isAlreadyProcessed contains mtime logic
echo -n "Checking isAlreadyProcessed has mtime logic... "
if grep -q "mtimeMs" "$DAEMON_DIR/src/daemon.ts" && \
   grep -q "liveMtime" "$DAEMON_DIR/src/daemon.ts" && \
   grep -q "archiveMtime" "$DAEMON_DIR/src/daemon.ts"; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: isAlreadyProcessed has <= comparison for mtime
echo -n "Checking mtime comparison uses <=... "
if grep -q "liveMtime <= archiveMtime" "$DAEMON_DIR/src/daemon.ts"; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Skip log strengthened with reason
echo -n "Checking skip log includes (completed/failed/parked)... "
if grep -q "already processed (completed/failed/parked)" "$DAEMON_DIR/src/daemon.ts"; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Intake log for failed copy
echo -n "Checking intake log for failed copy warning... "
if grep -q "recreating.*copy in failed/" "$DAEMON_DIR/src/health.ts"; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Intake log for parked copy
echo -n "Checking intake log for parked copy warning... "
if grep -q "recreating.*copy in parked/" "$DAEMON_DIR/src/health.ts"; then
    echo "PASS"
else
    echo "FAIL"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Code Changes Check Complete ==="
if [ $ERRORS -eq 0 ]; then
    echo "All checks passed!"
    exit 0
else
    echo "FAILED: $ERRORS check(s) failed"
    exit 1
fi
