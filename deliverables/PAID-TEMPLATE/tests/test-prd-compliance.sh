#!/usr/bin/env bash
# test-prd-compliance.sh — Verify PRD ≤50 lines and schema ≤20 lines
# Exit 0 on pass, non-zero on fail

set -euo pipefail

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

ERRORS=0

# 1. schema/template.md must be ≤20 lines
if [[ -f "schema/template.md" ]]; then
  SCHEMA_LINES=$(wc -l < "schema/template.md" | tr -d ' ')
  if [[ "$SCHEMA_LINES" -le 20 ]]; then
    echo "PASS: schema/template.md is $SCHEMA_LINES lines (≤20)"
  else
    echo "FAIL: schema/template.md is $SCHEMA_LINES lines (max 20)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: schema/template.md does not exist"
  ERRORS=$((ERRORS + 1))
fi

# 2. prd/rules.md must be ≤50 lines
if [[ -f "prd/rules.md" ]]; then
  PRD_LINES=$(wc -l < "prd/rules.md" | tr -d ' ')
  if [[ "$PRD_LINES" -le 50 ]]; then
    echo "PASS: prd/rules.md is $PRD_LINES lines (≤50)"
  else
    echo "FAIL: prd/rules.md is $PRD_LINES lines (max 50)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: prd/rules.md does not exist"
  ERRORS=$((ERRORS + 1))
fi

# 3. prd/rules.md must contain a field blacklist
if [[ -f "prd/rules.md" ]]; then
  if grep -qi "blacklist\|banned field\|commercial field" "prd/rules.md"; then
    echo "PASS: prd/rules.md contains field blacklist language"
  else
    echo "FAIL: prd/rules.md missing field blacklist language"
    ERRORS=$((ERRORS + 1))
  fi
fi

# 4. intake/index.html must be conversational, not a wall-of-form
if [[ -f "intake/index.html" ]]; then
  # Reject pure table/grid layouts as "wall of form"
  TABLE_COUNT=$(grep -cE '<table|<tr>|<td>' "intake/index.html" || true)
  if [[ "${TABLE_COUNT:-0}" -gt 5 ]]; then
    echo "FAIL: intake/index.html has $TABLE_COUNT table elements (too form-like)"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: intake/index.html is conversational (≤5 table elements)"
  fi
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo ""
  echo "PRD COMPLIANCE TEST FAILED: $ERRORS violation(s)"
  exit 1
fi

echo ""
echo "PRD COMPLIANCE TEST PASSED"
exit 0
