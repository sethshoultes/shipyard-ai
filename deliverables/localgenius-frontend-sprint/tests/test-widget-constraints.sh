#!/usr/bin/env bash
# test-widget-constraints.sh
# Verifies the Sous widget meets size, dependency, and architecture constraints.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

WIDGET_FILE="${WIDGET_FILE:-widget/sous-widget.js}"
MAX_SIZE_BYTES=20480
ERRORS=0

echo "=== Widget Constraint Audit ==="
echo "Widget file: $WIDGET_FILE"
echo ""

if [[ ! -f "$WIDGET_FILE" ]]; then
  echo "[FAIL] widget file not found: $WIDGET_FILE"
  exit 1
fi

# 1. Size check (gzipped)
GZIP_SIZE=$(gzip -c "$WIDGET_FILE" | wc -c)
if [[ "$GZIP_SIZE" -lt "$MAX_SIZE_BYTES" ]]; then
  echo "[PASS] gzipped size: $GZIP_SIZE bytes (< $MAX_SIZE_BYTES)"
else
  echo "[FAIL] gzipped size: $GZIP_SIZE bytes (>= $MAX_SIZE_BYTES limit)"
  ERRORS=$((ERRORS + 1))
fi

# 2. Zero external dependencies (no import/require/from)
DEP_MATCHES=$(grep -cE "(import\b|require\s*\(|from\s+['\"])" "$WIDGET_FILE" || true)
if [[ "$DEP_MATCHES" -eq 0 ]]; then
  echo "[PASS] zero external dependency statements found"
else
  echo "[FAIL] found $DEP_MATCHES import/require/from statements"
  ERRORS=$((ERRORS + 1))
fi

# 3. Inline styles only (must inject a <style> tag)
STYLE_MATCHES=$(grep -c '<style>' "$WIDGET_FILE" || true)
if [[ "$STYLE_MATCHES" -ge 1 ]]; then
  echo "[PASS] inline <style> injection found ($STYLE_MATCHES match(es))"
else
  echo "[FAIL] no inline <style> injection found"
  ERRORS=$((ERRORS + 1))
fi

# 4. No separate CSS file linked
CSS_LINK_MATCHES=$(grep -cE 'link.*stylesheet|\.css' "$WIDGET_FILE" || true)
if [[ "$CSS_LINK_MATCHES" -eq 0 ]]; then
  echo "[PASS] no external CSS link references"
else
  echo "[FAIL] found $CSS_LINK_MATCHES external CSS references"
  ERRORS=$((ERRORS + 1))
fi

# 5. One fetch call only (to the Worker endpoint)
FETCH_MATCHES=$(grep -cE 'fetch\s*\(' "$WIDGET_FILE" || true)
if [[ "$FETCH_MATCHES" -eq 1 ]]; then
  echo "[PASS] exactly one fetch() call found"
else
  echo "[FAIL] found $FETCH_MATCHES fetch() calls (expected exactly 1)"
  ERRORS=$((ERRORS + 1))
fi

# 6. Timeout / AbortController exists
TIMEOUT_MATCHES=$(grep -ciE 'abortcontroller|timeout' "$WIDGET_FILE" || true)
if [[ "$TIMEOUT_MATCHES" -ge 1 ]]; then
  echo "[PASS] timeout/abort handling found ($TIMEOUT_MATCHES match(es))"
else
  echo "[FAIL] no timeout or AbortController found"
  ERRORS=$((ERRORS + 1))
fi

# 7. Typing indicator exists
TYPING_MATCHES=$(grep -ciE 'typing|indicator' "$WIDGET_FILE" || true)
if [[ "$TYPING_MATCHES" -ge 1 ]]; then
  echo "[PASS] typing indicator found ($TYPING_MATCHES match(es))"
else
  echo "[FAIL] no typing indicator found"
  ERRORS=$((ERRORS + 1))
fi

# 8. Input sanitization exists
SANITIZE_MATCHES=$(grep -ciE 'sanitize|escape|clean' "$WIDGET_FILE" || true)
if [[ "$SANITIZE_MATCHES" -ge 1 ]]; then
  echo "[PASS] input sanitization found ($SANITIZE_MATCHES match(es))"
else
  echo "[FAIL] no input sanitization found"
  ERRORS=$((ERRORS + 1))
fi

# 9. IIFE wrapper
IIFE_MATCHES=$(grep -cE '\(function\s*\(' "$WIDGET_FILE" || true)
if [[ "$IIFE_MATCHES" -ge 1 ]]; then
  echo "[PASS] IIFE wrapper found"
else
  echo "[FAIL] no IIFE wrapper found"
  ERRORS=$((ERRORS + 1))
fi

# 10. No localStorage usage
LS_MATCHES=$(grep -ciE 'localStorage' "$WIDGET_FILE" || true)
if [[ "$LS_MATCHES" -eq 0 ]]; then
  echo "[PASS] no localStorage usage"
else
  echo "[FAIL] found $LS_MATCHES localStorage references"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [[ "$ERRORS" -eq 0 ]]; then
  echo "=== ALL WIDGET CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS WIDGET FAILURE(S) ==="
  exit 1
fi
