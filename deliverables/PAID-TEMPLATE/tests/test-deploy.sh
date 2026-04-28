#!/usr/bin/env bash
# test-deploy.sh — Verify deploy artifacts exist and badge is invisible
# Exit 0 on pass, non-zero on fail

set -euo pipefail

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

ERRORS=0

# 1. deploy/preview.js must exist
if [[ -f "deploy/preview.js" ]]; then
  echo "PASS: deploy/preview.js exists"
else
  echo "FAIL: deploy/preview.js missing"
  ERRORS=$((ERRORS + 1))
fi

# 2. deploy/preview.js must export or define a function
if [[ -f "deploy/preview.js" ]]; then
  if grep -qE "export|module\.exports|function|=>" "deploy/preview.js"; then
    echo "PASS: deploy/preview.js contains an exportable function"
  else
    echo "FAIL: deploy/preview.js has no exportable function"
    ERRORS=$((ERRORS + 1))
  fi
fi

# 3. deploy/badge-injector.js must exist
if [[ -f "deploy/badge-injector.js" ]]; then
  echo "PASS: deploy/badge-injector.js exists"
else
  echo "FAIL: deploy/badge-injector.js missing"
  ERRORS=$((ERRORS + 1))
fi

# 4. Badge injector must NOT contain visible billboard language
if [[ -f "deploy/badge-injector.js" ]]; then
  BILLBOARD=$(grep -ni "built by shipyard\|shipyard badge\|billboard\|banner\|graffiti" "deploy/badge-injector.js" 2>/dev/null || true)
  if [[ -n "$BILLBOARD" ]]; then
    echo "FAIL: deploy/badge-injector.js contains visible billboard language:"
    echo "$BILLBOARD"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: deploy/badge-injector.js contains no billboard language"
  fi
fi

# 5. Badge injector must contain invisible signature patterns (meta tag or svg)
if [[ -f "deploy/badge-injector.js" ]]; then
  if grep -qi "meta\|svg\|generator\|watermark" "deploy/badge-injector.js"; then
    echo "PASS: deploy/badge-injector.js contains invisible signature pattern"
  else
    echo "FAIL: deploy/badge-injector.js missing invisible signature pattern (meta/svg/generator/watermark)"
    ERRORS=$((ERRORS + 1))
  fi
fi

# 6. deploy/target-config.json must exist and be valid JSON
if [[ -f "deploy/target-config.json" ]]; then
  if python3 -m json.tool "deploy/target-config.json" > /dev/null 2>&1; then
    echo "PASS: deploy/target-config.json is valid JSON"
  else
    echo "FAIL: deploy/target-config.json is not valid JSON"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: deploy/target-config.json missing"
  ERRORS=$((ERRORS + 1))
fi

# 7. Default target must NOT be a CDN
if [[ -f "deploy/target-config.json" ]]; then
  if grep -qi "cdn\|cloudfront\|fastly\|akamai" "deploy/target-config.json"; then
    echo "FAIL: deploy/target-config.json defaults to CDN target (v1 must be local/Vercel/Netlify)"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: deploy/target-config.json does not default to CDN"
  fi
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo ""
  echo "DEPLOY TEST FAILED: $ERRORS violation(s)"
  exit 1
fi

echo ""
echo "DEPLOY TEST PASSED"
exit 0
