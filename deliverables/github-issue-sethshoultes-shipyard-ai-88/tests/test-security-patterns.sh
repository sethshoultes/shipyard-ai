#!/bin/bash
# test-security-patterns.sh
# Verifies that required security patterns are present in the codebase.
# Usage: ./test-security-patterns.sh [PLUGIN_DIR]
# Exit 0 on pass, non-zero on fail.

set -e

PLUGIN_DIR="${1:-projects/scribe}"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "FAIL: Plugin directory not found: $PLUGIN_DIR"
  exit 1
fi

fail=0

# 1. Capability checks
matches=$(grep -rEn "current_user_can" "$PLUGIN_DIR" --include="*.php" 2>/dev/null || true)
if [ -z "$matches" ]; then
  echo "FAIL: Missing current_user_can checks in PHP files"
  fail=1
fi

# 2. Nonce verification
matches=$(grep -rEn "wp_nonce_field|check_ajax_referer|wp_verify_nonce" "$PLUGIN_DIR" --include="*.php" 2>/dev/null || true)
if [ -z "$matches" ]; then
  echo "FAIL: Missing nonce verification in PHP files"
  fail=1
fi

# 3. Output escaping
matches=$(grep -rEn "esc_html|esc_attr|esc_url|esc_textarea|wp_kses" "$PLUGIN_DIR" --include="*.php" 2>/dev/null || true)
if [ -z "$matches" ]; then
  echo "FAIL: Missing output escaping in PHP files"
  fail=1
fi

# 4. i18n wrappers
matches=$(grep -rE "__\(|_e\(|esc_html__\(" "$PLUGIN_DIR" --include="*.php" --include="*.js" 2>/dev/null | grep "'scribe'" || true)
if [ -z "$matches" ]; then
  echo "FAIL: Missing i18n wrappers with 'scribe' text domain"
  fail=1
fi

# 5. REST permission callbacks
matches=$(grep -rEn "permission_callback" "$PLUGIN_DIR" --include="*.php" 2>/dev/null || true)
if [ -z "$matches" ]; then
  echo "FAIL: Missing REST permission_callback in PHP files"
  fail=1
fi

# 6. API key constant or encrypted storage
matches=$(grep -rEn "SCRIBE_API_KEY|openssl_encrypt|update_option.*scribe_api_key" "$PLUGIN_DIR" --include="*.php" 2>/dev/null || true)
if [ -z "$matches" ]; then
  echo "FAIL: Missing API key handling (constant or encrypted storage)"
  fail=1
fi

if [ "$fail" -eq 1 ]; then
  exit 1
fi

echo "PASS: Required security patterns are present"
exit 0
