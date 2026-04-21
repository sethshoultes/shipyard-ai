#!/usr/bin/env bash
set -euo pipefail

# test-ci.sh
# Verifies CI workflow structure and semantics.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
WF="${REPO_ROOT}/.github/workflows/kimi-smoke-test.yml"

echo "=== test-ci ==="

# 1. File exists
if [[ ! -f "$WF" ]]; then
    echo "FAIL: workflow does not exist at $WF"
    exit 1
fi
echo "PASS: workflow exists"

# 2. Triggers on push and workflow_dispatch
if ! grep -q 'workflow_dispatch' "$WF"; then
    echo "FAIL: workflow does not trigger on workflow_dispatch"
    exit 1
fi
echo "PASS: workflow_dispatch trigger present"

if ! grep -q 'push:' "$WF"; then
    echo "FAIL: workflow does not trigger on push"
    exit 1
fi
echo "PASS: push trigger present"

# 3. Job name is pulse, runs on ubuntu-latest
if ! grep -q 'pulse:' "$WF"; then
    echo "FAIL: job name is not 'pulse'"
    exit 1
fi
echo "PASS: job name 'pulse' present"

if ! grep -q 'ubuntu-latest' "$WF"; then
    echo "FAIL: runner is not ubuntu-latest"
    exit 1
fi
echo "PASS: ubuntu-latest runner present"

# 4. Checkout uses actions/checkout@v4
if ! grep -q 'actions/checkout@v4' "$WF"; then
    echo "FAIL: checkout action is not actions/checkout@v4"
    exit 1
fi
echo "PASS: actions/checkout@v4 present"

# 5. Invokes run.sh
if ! grep -q 'run.sh' "$WF"; then
    echo "FAIL: workflow does not invoke run.sh"
    exit 1
fi
echo "PASS: run.sh invocation present"

# 6. Does NOT set continue-on-error: true
if grep -q 'continue-on-error.*true' "$WF"; then
    echo "FAIL: workflow masks exit codes with continue-on-error: true"
    exit 1
fi
echo "PASS: no continue-on-error: true"

# 7. Verifies pulse.txt and prints contents
if ! grep -q 'pulse.txt' "$WF"; then
    echo "FAIL: workflow does not reference pulse.txt"
    exit 1
fi
echo "PASS: pulse.txt referenced in workflow"

# 8. Valid YAML syntax
if command -v python3 >/dev/null 2>&1; then
    if ! python3 -c "import yaml; yaml.safe_load(open('$WF'))" >/dev/null 2>&1; then
        echo "FAIL: workflow is not valid YAML"
        exit 1
    fi
    echo "PASS: valid YAML syntax"
else
    echo "SKIP: python3 not available for YAML validation"
fi

echo "=== all checks passed ==="
exit 0
