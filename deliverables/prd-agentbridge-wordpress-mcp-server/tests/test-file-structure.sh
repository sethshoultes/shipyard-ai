#!/usr/bin/env bash
# test-file-structure.sh
# Verifies the AgentBridge plugin contains exactly the expected files
# and none of the files CUT from v1. Exits 0 on pass, non-zero on fail.

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

echo "=== File Structure Test ==="
echo "Plugin directory: $PLUGIN_DIR"
echo

# Required files
required_files=(
  "agentbridge.php"
  "readme.txt"
  "readme.md"
  "includes/class-server.php"
  "includes/class-message-handler.php"
  "includes/class-tool-registry.php"
  "includes/class-auth.php"
  "includes/tools/class-tool-site.php"
  "includes/tools/class-tool-posts.php"
  "includes/tools/class-tool-media.php"
  "admin/admin.php"
  "admin/js/dashboard.js"
)

for f in "${required_files[@]}"; do
  if [[ -f "$PLUGIN_DIR/$f" ]]; then
    pass "Required file exists: $f"
  else
    fail "Missing required file: $f"
  fi
done

# CUT files that must NOT exist
cut_files=(
  "includes/tools/class-tool-users.php"
  "includes/tools/class-tool-upload.php"
  "includes/class-logger.php"
  "admin/css/wizard.css"
  "admin/partials/onboarding.php"
)

for f in "${cut_files[@]}"; do
  if [[ -f "$PLUGIN_DIR/$f" ]]; then
    fail "CUT file must not exist: $f"
  else
    pass "CUT file correctly absent: $f"
  fi
done

# Check main plugin header
if [[ -f "$PLUGIN_DIR/agentbridge.php" ]]; then
  if grep -q "Plugin Name:" "$PLUGIN_DIR/agentbridge.php"; then
    pass "agentbridge.php contains Plugin Name header"
  else
    fail "agentbridge.php missing Plugin Name header"
  fi

  if grep -q "spl_autoload_register" "$PLUGIN_DIR/agentbridge.php"; then
    pass "agentbridge.php contains autoloader"
  else
    fail "agentbridge.php missing autoloader"
  fi
else
  fail "agentbridge.php not found — cannot check headers"
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
