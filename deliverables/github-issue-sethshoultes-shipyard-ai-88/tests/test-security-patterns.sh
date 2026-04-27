#!/usr/bin/env bash
set -euo pipefail

BASE="projects/whisper/build/whisper"

echo "=== Test: Security Patterns ==="

fail=0

# 1. Nonce field in settings
if ! grep -q "wp_nonce_field\|check_admin_referer" "$BASE/includes/class-settings.php" 2>/dev/null; then
  echo "FAIL: Settings must use wp_nonce_field or check_admin_referer"
  fail=1
else
  echo "OK: Settings nonce found"
fi

# 2. Capability checks in API handlers
if ! grep -q "current_user_can" "$BASE/includes/class-whisper-api.php" 2>/dev/null; then
  echo "FAIL: API handlers must verify capabilities with current_user_can"
  fail=1
else
  echo "OK: current_user_can found in API class"
fi

# 3. Escaping in settings output
if ! grep -q "esc_html\|esc_attr" "$BASE/includes/class-settings.php" 2>/dev/null; then
  echo "FAIL: Settings output must be escaped with esc_html or esc_attr"
  fail=1
else
  echo "OK: Escaping found in settings class"
fi

# 4. File upload handling
if ! grep -q "wp_handle_upload\|wp_upload_bits\|wp_check_filetype" "$BASE/includes/class-whisper-api.php" 2>/dev/null; then
  echo "FAIL: File upload must use WordPress upload functions or MIME checks"
  fail=1
else
  echo "OK: WordPress upload handling found"
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "PASS: Security patterns verified."
