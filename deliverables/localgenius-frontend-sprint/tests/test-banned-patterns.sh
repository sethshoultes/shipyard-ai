#!/usr/bin/env bash
# test-banned-patterns.sh
# Greps the codebase for banned copy, code patterns, and anti-patterns.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

SEARCH_ROOT="${SEARCH_ROOT:-.}"
ERRORS=0

echo "=== Banned Pattern Audit ==="
echo "Search root: $SEARCH_ROOT"
echo ""

# Banned copy phrases (case-insensitive)
declare -a BANNED_COPY=(
  "leverage AI"
  "we're excited to announce"
  "optimize"
  "AI-powered"
  "chatbot"
  "Processing your request"
  "How can I help you today"
  "Powered by Sous"
  "Powered by LocalGenius"
)

# Banned code patterns
declare -a BANNED_CODE=(
  "register_rest_route"
  "wp_remote_get"
  "wp_remote_post"
  "curl_"
  "file_get_contents"
  "eval\s*("
  "document.write"
)

# Banned dependency hints in widget
declare -a BANNED_WIDGET_DEPS=(
  "react"
  "vue"
  "jquery"
  "axios"
  "lodash"
)

# Files to scan (exclude hidden dirs, node_modules, infra docs)
FILES=$(find "$SEARCH_ROOT" -type f \( -name '*.js' -o -name '*.php' -o -name '*.html' -o -name '*.css' -o -name '*.json' -o -name '*.md' -o -name '*.txt' \) \
  ! -path '*/\.*' \
  ! -path '*/node_modules/*' \
  ! -path '*/vendor/*' \
  ! -path '*/infra/stripe-webhook.md' \
  2>/dev/null || true)

echo "--- Banned Copy Phrases ---"
for phrase in "${BANNED_COPY[@]}"; do
  COUNT=$(echo "$FILES" | xargs grep -ci "$phrase" 2>/dev/null | awk -F: '{s+=$2} END {print s}')
  if [[ "$COUNT" -gt 0 ]]; then
    echo "[FAIL] '$phrase' found $COUNT time(s)"
    echo "$FILES" | xargs grep -ni "$phrase" 2>/dev/null || true
    ERRORS=$((ERRORS + 1))
  else
    echo "[PASS] '$phrase' not found"
  fi
done

echo ""
echo "--- Banned Code Patterns ---"
for pattern in "${BANNED_CODE[@]}"; do
  # Use fixed-string for simple patterns, regex for eval/document.write
  if [[ "$pattern" == "eval"* ]] || [[ "$pattern" == "document.write" ]]; then
    COUNT=$(echo "$FILES" | xargs grep -cE "$pattern" 2>/dev/null | awk -F: '{s+=$2} END {print s}')
  else
    COUNT=$(echo "$FILES" | xargs grep -cF "$pattern" 2>/dev/null | awk -F: '{s+=$2} END {print s}')
  fi
  if [[ "$COUNT" -gt 0 ]]; then
    echo "[FAIL] '$pattern' found $COUNT time(s)"
    ERRORS=$((ERRORS + 1))
  else
    echo "[PASS] '$pattern' not found"
  fi
done

echo ""
echo "--- Widget Dependency Check ---"
WIDGET_FILE="$SEARCH_ROOT/widget/sous-widget.js"
if [[ -f "$WIDGET_FILE" ]]; then
  for dep in "${BANNED_WIDGET_DEPS[@]}"; do
    COUNT=$(grep -cwi "$dep" "$WIDGET_FILE" || true)
    if [[ "$COUNT" -gt 0 ]]; then
      echo "[FAIL] banned dependency '$dep' found $COUNT time(s) in widget"
      ERRORS=$((ERRORS + 1))
    else
      echo "[PASS] '$dep' not found in widget"
    fi
  done
else
  echo "[SKIP] widget file not found; will re-check when present"
fi

echo ""
echo "--- Stripe Secret Leak Check ---"
SECRET_COUNT=$(echo "$FILES" | xargs grep -ciE 'sk_live|sk_test|stripe.*secret' 2>/dev/null | awk -F: '{s+=$2} END {print s}')
if [[ "$SECRET_COUNT" -gt 0 ]]; then
  echo "[FAIL] potential Stripe secret found $SECRET_COUNT time(s)"
  ERRORS=$((ERRORS + 1))
else
  echo "[PASS] no Stripe secrets detected"
fi

echo ""
if [[ "$ERRORS" -eq 0 ]]; then
  echo "=== ALL BANNED PATTERN CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS BANNED PATTERN FAILURE(S) ==="
  exit 1
fi
