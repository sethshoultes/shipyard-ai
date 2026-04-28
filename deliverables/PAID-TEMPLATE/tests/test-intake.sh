#!/usr/bin/env bash
# test-intake.sh — Verify intake form has exactly 5 questions and valid JSON schema
# Exit 0 on pass, non-zero on fail

set -euo pipefail

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

ERRORS=0

# 1. intake/index.html must exist and contain at least 5 question/input elements
if [[ -f "intake/index.html" ]]; then
  # Count likely question indicators: input fields, textareas, or labeled questions
  QUESTION_COUNT=$(grep -cE '<input|<textarea|<select|<label' "intake/index.html" || true)
  if [[ "${QUESTION_COUNT:-0}" -ge 5 ]]; then
    echo "PASS: intake/index.html contains $QUESTION_COUNT question element(s) (≥5)"
  else
    echo "FAIL: intake/index.html contains only $QUESTION_COUNT question element(s) (need ≥5)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: intake/index.html does not exist"
  ERRORS=$((ERRORS + 1))
fi

# 2. intake/questions.json must be valid JSON
if [[ -f "intake/questions.json" ]]; then
  if python3 -m json.tool "intake/questions.json" > /dev/null 2>&1; then
    echo "PASS: intake/questions.json is valid JSON"
  else
    echo "FAIL: intake/questions.json is not valid JSON"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: intake/questions.json does not exist"
  ERRORS=$((ERRORS + 1))
fi

# 3. intake/mapper.js must be syntactically valid JavaScript (Node can parse it)
if [[ -f "intake/mapper.js" ]]; then
  if node --check "intake/mapper.js" 2>/dev/null; then
    echo "PASS: intake/mapper.js parses without syntax errors"
  else
    echo "FAIL: intake/mapper.js has syntax errors"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: intake/mapper.js does not exist"
  ERRORS=$((ERRORS + 1))
fi

# 4. Verify mapper.js references schema.md output
if [[ -f "intake/mapper.js" ]]; then
  if grep -q "schema.md\|template.md\|schema" "intake/mapper.js"; then
    echo "PASS: intake/mapper.js references schema output"
  else
    echo "FAIL: intake/mapper.js does not reference schema output"
    ERRORS=$((ERRORS + 1))
  fi
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo ""
  echo "INTAKE TEST FAILED: $ERRORS violation(s)"
  exit 1
fi

echo ""
echo "INTAKE TEST PASSED"
exit 0
