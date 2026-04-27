#!/usr/bin/env bash
set -euo pipefail

# WP Sentinel — Build Output Test
# Verifies compiled assets exist, bundle size constraints, and React build artifacts.

PLUGIN_DIR="${1:-wp-sentinel}"
ERRORS=0

fail() {
  echo "FAIL: $1"
  ((ERRORS++)) || true
}

pass() {
  echo "PASS: $1"
}

echo "=== WP Sentinel Build Output Test ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

if [[ ! -d "$PLUGIN_DIR" ]]; then
  fail "Plugin directory $PLUGIN_DIR does not exist"
  echo "RESULT: aborting"
  exit 1
fi

# 1. JS bundle exists
JS_FILE="$PLUGIN_DIR/assets/sentinel-admin.js"
if [[ -f "$JS_FILE" ]]; then
  pass "sentinel-admin.js exists"
else
  fail "sentinel-admin.js missing"
fi

# 2. CSS bundle exists
CSS_FILE="$PLUGIN_DIR/assets/sentinel-admin.css"
if [[ -f "$CSS_FILE" ]]; then
  pass "sentinel-admin.css exists"
else
  fail "sentinel-admin.css missing"
fi

# 3. JS bundle size check (<100KB)
if [[ -f "$JS_FILE" ]]; then
  JS_SIZE=$(stat -c%s "$JS_FILE" 2>/dev/null || stat -f%z "$JS_FILE" 2>/dev/null || echo "0")
  if [[ "$JS_SIZE" -lt 102400 ]]; then
    pass "sentinel-admin.js size OK ($JS_SIZE bytes < 102400)"
  else
    fail "sentinel-admin.js too large ($JS_SIZE bytes >= 102400)"
  fi
fi

# 4. Gzipped JS bundle size check (<100KB gzipped — more realistic)
if [[ -f "$JS_FILE" ]]; then
  GZ_SIZE=$(gzip -c "$JS_FILE" | wc -c)
  if [[ "$GZ_SIZE" -lt 102400 ]]; then
    pass "sentinel-admin.js gzipped size OK ($GZ_SIZE bytes < 102400)"
  else
    fail "sentinel-admin.js gzipped too large ($GZ_SIZE bytes >= 102400)"
  fi
fi

# 5. Total plugin size (<500KB)
TOTAL_SIZE=$(du -sk "$PLUGIN_DIR" 2>/dev/null | awk '{print $1}')
if [[ "$TOTAL_SIZE" -lt 512 ]]; then
  pass "Total plugin size OK ($TOTAL_SIZE KB < 512 KB)"
else
  fail "Total plugin size too large ($TOTAL_SIZE KB >= 512 KB)"
fi

# 6. React bundle contains no fetch to external domains in dev mode artifacts
# (sanity check that prod build was used)
if [[ -f "$JS_FILE" ]]; then
  if grep -q "localhost\|127.0.0.1\|dev\." "$JS_FILE"; then
    fail "sentinel-admin.js contains local/dev references"
  else
    pass "sentinel-admin.js appears to be a production build"
  fi
fi

# 7. CSS contains no @import of external URLs
if [[ -f "$CSS_FILE" ]]; then
  MATCHES=$(grep -Hn "@import.*http" "$CSS_FILE" 2>/dev/null || true)
  if [[ -n "$MATCHES" ]]; then
    fail "CSS imports external URLs:\n$MATCHES"
  else
    pass "CSS has no external @import"
  fi
fi

echo ""
if [[ $ERRORS -gt 0 ]]; then
  echo "RESULT: $ERRORS failure(s)"
  exit 1
else
  echo "RESULT: all build output checks passed"
  exit 0
fi
