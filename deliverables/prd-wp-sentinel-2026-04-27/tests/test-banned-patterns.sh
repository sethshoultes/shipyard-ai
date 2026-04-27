#!/usr/bin/env bash
set -euo pipefail

# WP Sentinel — Banned Patterns Test
# Verifies no forbidden functions, missing security guards, or unescaped output.

PLUGIN_DIR="${1:-wp-sentinel}"
ERRORS=0

fail() {
  echo "FAIL: $1"
  ((ERRORS++)) || true
}

pass() {
  echo "PASS: $1"
}

echo "=== WP Sentinel Banned Patterns Test ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

# Ensure plugin directory exists
if [[ ! -d "$PLUGIN_DIR" ]]; then
  fail "Plugin directory $PLUGIN_DIR does not exist"
  echo "RESULT: aborting"
  exit 1
fi

# 1. Banned functions in PHP files
BANNED_FUNCS=("eval(" "shell_exec(" "passthru(" "system(" "exec(")
for func in "${BANNED_FUNCS[@]}"; do
  MATCHES=$(find "$PLUGIN_DIR" -name "*.php" -exec grep -Hn "$func" {} + 2>/dev/null || true)
  if [[ -n "$MATCHES" ]]; then
    fail "Banned function '$func' found:\n$MATCHES"
  else
    pass "No banned function '$func' found"
  fi
done

# 2. ABSPATH guard in every PHP file
MISSING_GUARD=$(find "$PLUGIN_DIR" -name "*.php" -exec grep -L "ABSPATH" {} \; 2>/dev/null || true)
if [[ -n "$MISSING_GUARD" ]]; then
  fail "Missing ABSPATH guard in:\n$MISSING_GUARD"
else
  pass "ABSPATH guard present in all PHP files"
fi

# 3. No direct database writes outside $wpdb (sanity check for remediation class)
MATCHES=$(find "$PLUGIN_DIR" -name "*.php" -exec grep -Hn "mysqli_query\|mysql_query\|PDO(" {} + 2>/dev/null || true)
if [[ -n "$MATCHES" ]]; then
  fail "Raw SQL/database calls found:\n$MATCHES"
else
  pass "No raw SQL database calls found"
fi

# 4. No eval or base64_decode (common obfuscation)
MATCHES=$(find "$PLUGIN_DIR" -name "*.php" -exec grep -Hn "base64_decode\|base64_encode" {} + 2>/dev/null || true)
if [[ -n "$MATCHES" ]]; then
  fail "base64 encoding/decoding found:\n$MATCHES"
else
  pass "No base64 obfuscation found"
fi

# 5. No remote requests in activation hooks
ACTIVATION_FILE="$PLUGIN_DIR/wp-sentinel.php"
if [[ -f "$ACTIVATION_FILE" ]]; then
  MATCHES=$(grep -Hn "wp_remote_get\|wp_remote_post\|curl_init\|file_get_contents" "$ACTIVATION_FILE" 2>/dev/null || true)
  if [[ -n "$MATCHES" ]]; then
    fail "External HTTP calls in main plugin file:\n$MATCHES"
  else
    pass "No external HTTP calls in main plugin file"
  fi
fi

# 6. Check for nonce verification in AJAX class
AJAX_FILE="$PLUGIN_DIR/includes/class-ajax.php"
if [[ -f "$AJAX_FILE" ]]; then
  if grep -q "check_ajax_referer" "$AJAX_FILE"; then
    pass "Nonce verification found in AJAX class"
  else
    fail "Missing nonce verification (check_ajax_referer) in class-ajax.php"
  fi
fi

# 7. Check for capability checks in AJAX class
if [[ -f "$AJAX_FILE" ]]; then
  if grep -q "current_user_can" "$AJAX_FILE"; then
    pass "Capability checks found in AJAX class"
  else
    fail "Missing capability checks (current_user_can) in class-ajax.php"
  fi
fi

echo ""
if [[ $ERRORS -gt 0 ]]; then
  echo "RESULT: $ERRORS failure(s)"
  exit 1
else
  echo "RESULT: all banned pattern checks passed"
  exit 0
fi
