#!/usr/bin/env bash
set -euo pipefail

# test-exit-code.sh
# Verifies run.sh exists, is executable, runs, and exits 0.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
RUN_SH="${REPO_ROOT}/rounds/kimi-smoke-test/run.sh"

echo "=== test-exit-code ==="

# 1. File exists
if [[ ! -f "$RUN_SH" ]]; then
    echo "FAIL: run.sh does not exist at $RUN_SH"
    exit 1
fi
echo "PASS: run.sh exists"

# 2. File is executable
if [[ ! -x "$RUN_SH" ]]; then
    echo "FAIL: run.sh is not executable"
    exit 1
fi
echo "PASS: run.sh is executable"

# 3. Runs and exits 0
if ! cd "$(dirname "$RUN_SH")" && ./run.sh; then
    echo "FAIL: run.sh exited non-zero"
    exit 1
fi
echo "PASS: run.sh exits 0"

echo "=== all checks passed ==="
exit 0
