#!/bin/bash
# test-banned-patterns.sh
# Checks for banned code patterns that should never ship.
# Usage: ./test-banned-patterns.sh [PLUGIN_DIR]
# Exit 0 on pass, non-zero on fail.

set -e

PLUGIN_DIR="${1:-projects/scribe}"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "FAIL: Plugin directory not found: $PLUGIN_DIR"
  exit 1
fi

fail=0

# 1. Hardcoded API keys (OpenAI key pattern)
matches=$(grep -rEn "sk-[a-zA-Z0-9]{20,}" "$PLUGIN_DIR" --include="*.php" --include="*.js" 2>/dev/null || true)
if [ -n "$matches" ]; then
  echo "FAIL: Potential hardcoded API key found:"
  echo "$matches"
  fail=1
fi

# 2. console.log in production JS
matches=$(grep -rEn "console\.log" "$PLUGIN_DIR/src" "$PLUGIN_DIR/build" 2>/dev/null || true)
if [ -n "$matches" ]; then
  echo "FAIL: console.log found in production JS:"
  echo "$matches"
  fail=1
fi

# 3. Empty die()
matches=$(grep -rEn "die\s*\(\s*\)" "$PLUGIN_DIR" --include="*.php" 2>/dev/null || true)
if [ -n "$matches" ]; then
  echo "FAIL: Empty die() found:"
  echo "$matches"
  fail=1
fi

# 4. eval()
matches=$(grep -rEn "\beval\s*\(" "$PLUGIN_DIR" --include="*.php" --include="*.js" 2>/dev/null || true)
if [ -n "$matches" ]; then
  echo "FAIL: eval() found:"
  echo "$matches"
  fail=1
fi

# 5. Direct $_GET/$_POST/$_REQUEST without sanitization in PHP (basic heuristic)
matches=$(grep -rEn '\$_GET\[|\$_POST\[|\$_REQUEST\[' "$PLUGIN_DIR" --include="*.php" 2>/dev/null | grep -vE 'sanitize_|absint|wp_kses|intval|floatval|boolval|wp_unslash|check_admin_referer|wp_verify_nonce' || true)
if [ -n "$matches" ]; then
  echo "FAIL: Unsanitized superglobal access found:"
  echo "$matches"
  fail=1
fi

if [ "$fail" -eq 1 ]; then
  exit 1
fi

echo "PASS: No banned patterns found"
exit 0
