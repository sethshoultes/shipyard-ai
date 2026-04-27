#!/usr/bin/env bash
# test-plugin-guard.sh
# Verifies PHP syntax, security guards, and Stripe safety in the WordPress plugin.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PLUGIN_FILE="${PLUGIN_FILE:-plugin/sous.php}"
ERRORS=0

echo "=== Plugin Guard Audit ==="
echo "Plugin file: $PLUGIN_FILE"
echo ""

if [[ ! -f "$PLUGIN_FILE" ]]; then
  echo "[FAIL] plugin file not found: $PLUGIN_FILE"
  exit 1
fi

# 1. PHP syntax check
if php -l "$PLUGIN_FILE" >/dev/null 2>&1; then
  echo "[PASS] PHP syntax valid"
else
  echo "[FAIL] PHP syntax errors detected"
  php -l "$PLUGIN_FILE" || true
  ERRORS=$((ERRORS + 1))
fi

# 2. ABSPATH guard
if grep -q "ABSPATH" "$PLUGIN_FILE"; then
  echo "[PASS] ABSPATH guard present"
else
  echo "[FAIL] missing ABSPATH security guard"
  ERRORS=$((ERRORS + 1))
fi

# 3. No Stripe secrets in plugin
STRIPE_MATCHES=$(grep -ciE 'sk_live|sk_test|stripe.*secret|stripe_key' "$PLUGIN_FILE" || true)
if [[ "$STRIPE_MATCHES" -eq 0 ]]; then
  echo "[PASS] no Stripe secrets in plugin"
else
  echo "[FAIL] found $STRIPE_MATCHES potential Stripe secret reference(s)"
  ERRORS=$((ERRORS + 1))
fi

# 4. No REST routes (plugin should not expose REST API)
REST_MATCHES=$(grep -ciE 'register_rest_route' "$PLUGIN_FILE" || true)
if [[ "$REST_MATCHES" -eq 0 ]]; then
  echo "[PASS] no REST routes registered"
else
  echo "[FAIL] found $REST_MATCHES register_rest_route call(s)"
  ERRORS=$((ERRORS + 1))
fi

# 5. No external HTTP calls in plugin (all external logic lives in Worker)
EXTERNAL_HTTP=$(grep -ciE 'wp_remote_get|wp_remote_post|wp_remote_request|curl_|file_get_contents\s*\(' "$PLUGIN_FILE" || true)
if [[ "$EXTERNAL_HTTP" -eq 0 ]]; then
  echo "[PASS] no external HTTP calls in plugin"
else
  echo "[FAIL] found $EXTERNAL_HTTP external HTTP call pattern(s)"
  ERRORS=$((ERRORS + 1))
fi

# 6. wp_localize_script present
if grep -q "wp_localize_script" "$PLUGIN_FILE"; then
  echo "[PASS] wp_localize_script found"
else
  echo "[FAIL] missing wp_localize_script (required for widget config injection)"
  ERRORS=$((ERRORS + 1))
fi

# 7. Activation hook present
if grep -qiE 'register_activation_hook' "$PLUGIN_FILE"; then
  echo "[PASS] activation hook found"
else
  echo "[FAIL] missing register_activation_hook"
  ERRORS=$((ERRORS + 1))
fi

# 8. Deactivation hook present
if grep -qiE 'register_deactivation_hook' "$PLUGIN_FILE"; then
  echo "[PASS] deactivation hook found"
else
  echo "[FAIL] missing register_deactivation_hook"
  ERRORS=$((ERRORS + 1))
fi

# 9. Standard plugin header
if grep -qiE 'Plugin Name:' "$PLUGIN_FILE"; then
  echo "[PASS] plugin header present"
else
  echo "[FAIL] missing WordPress plugin header"
  ERRORS=$((ERRORS + 1))
fi

# 10. GPL license header or reference
if grep -qiE 'GPL|License:' "$PLUGIN_FILE"; then
  echo "[PASS] license reference found"
else
  echo "[FAIL] missing license reference"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [[ "$ERRORS" -eq 0 ]]; then
  echo "=== ALL PLUGIN GUARD CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS PLUGIN FAILURE(S) ==="
  exit 1
fi
