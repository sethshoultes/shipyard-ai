#!/usr/bin/env bash
# test-security-patterns.sh
# Scans the AgentBridge plugin for banned security patterns and
# verifies required security patterns are present.
# Exits 0 on pass, non-zero on fail.

set -euo pipefail

PLUGIN_DIR="${1:-./build/agentbridge}"
ERRORS=0

fail() {
  echo "FAIL: $1"
  ((ERRORS++)) || true
}

pass() {
  echo "PASS: $1"
}

echo "=== Security Patterns Test ==="
echo "Plugin directory: $PLUGIN_DIR"
echo

if [[ ! -d "$PLUGIN_DIR/includes" ]]; then
  echo "ERROR: Plugin includes/ directory not found"
  exit 1
fi

# Banned dangerous functions
banned_patterns=(
  "eval("
  "exec("
  "system("
  "passthru("
  "shell_exec("
  "popen("
  "proc_open("
)

for pattern in "${banned_patterns[@]}"; do
  # Use grep -r across PHP files; ignore comments if possible, but raw grep is acceptable for this test
  matches=$(grep -rn "$pattern" "$PLUGIN_DIR" --include="*.php" || true)
  if [[ -n "$matches" ]]; then
    fail "Banned pattern found: '$pattern'"
    echo "$matches"
  else
    pass "No banned pattern: '$pattern'"
  fi
done

# Must contain capability check
if grep -rq "current_user_can" "$PLUGIN_DIR/includes" --include="*.php"; then
  pass "Capability check (current_user_can) present in includes/"
else
  fail "Missing capability check (current_user_can) in includes/"
fi

# Auth class must reference edit_posts
if [[ -f "$PLUGIN_DIR/includes/class-auth.php" ]]; then
  if grep -q "edit_posts" "$PLUGIN_DIR/includes/class-auth.php"; then
    pass "class-auth.php references edit_posts capability"
  else
    fail "class-auth.php missing edit_posts capability check"
  fi
else
  fail "class-auth.php not found"
fi

# Token must be hashed with wp_hash_password
if [[ -f "$PLUGIN_DIR/includes/class-auth.php" ]]; then
  if grep -q "wp_hash_password" "$PLUGIN_DIR/includes/class-auth.php"; then
    pass "class-auth.php uses wp_hash_password for token storage"
  else
    fail "class-auth.php missing wp_hash_password usage"
  fi
fi

# Must not contain raw file writes outside upload context
# We allow file_put_contents/fwrite/fopen only if accompanied by wp_upload_dir or upload context
raw_file_write=$(grep -rn "file_put_contents\|fwrite\|fopen.*['\"]w" "$PLUGIN_DIR" --include="*.php" || true)
if [[ -n "$raw_file_write" ]]; then
  # If there are matches, ensure they reference wp_upload_dir
  unsafe=$(echo "$raw_file_write" | grep -v "wp_upload_dir" || true)
  if [[ -n "$unsafe" ]]; then
    fail "Unsafe file write found outside wp_upload_dir context"
    echo "$unsafe"
  else
    pass "File writes only inside wp_upload_dir context"
  fi
else
  pass "No raw file writes detected"
fi

# Rate limiting must exist in server class
if [[ -f "$PLUGIN_DIR/includes/class-server.php" ]]; then
  if grep -q "REMOTE_ADDR" "$PLUGIN_DIR/includes/class-server.php"; then
    pass "class-server.php references REMOTE_ADDR for rate limiting"
  else
    fail "class-server.php missing REMOTE_ADDR / rate limiting"
  fi

  if grep -q "429" "$PLUGIN_DIR/includes/class-server.php"; then
    pass "class-server.php references HTTP 429 for rate limiting"
  else
    fail "class-server.php missing HTTP 429 rate-limit response"
  fi
else
  fail "class-server.php not found"
fi

echo
echo "=== Results ==="
echo "Errors: $ERRORS"

if [[ "$ERRORS" -gt 0 ]]; then
  echo "FAILED"
  exit 1
else
  echo "PASSED"
  exit 0
fi
