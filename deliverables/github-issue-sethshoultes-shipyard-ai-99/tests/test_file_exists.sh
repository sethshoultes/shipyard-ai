#!/usr/bin/env bash
set -euo pipefail

WORKFLOW=".github/workflows/deploy-website.yml"

echo "=== TEST: Workflow file exists ==="
if [[ -f "$WORKFLOW" ]]; then
  echo "PASS: $WORKFLOW exists"
else
  echo "FAIL: $WORKFLOW does not exist"
  exit 1
fi
