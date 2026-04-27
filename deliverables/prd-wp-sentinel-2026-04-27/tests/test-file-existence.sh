#!/usr/bin/env bash
set -euo pipefail

# WP Sentinel — File Existence Test
# Verifies that all required files from the spec exist in the build output.

PLUGIN_DIR="${1:-wp-sentinel}"
ERRORS=0

fail() {
  echo "FAIL: $1"
  ((ERRORS++)) || true
}

pass() {
  echo "PASS: $1"
}

require_file() {
  if [[ -f "$PLUGIN_DIR/$1" ]]; then
    pass "$1 exists"
  else
    fail "$1 missing"
  fi
}

echo "=== WP Sentinel File Existence Test ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

# Root files
require_file "wp-sentinel.php"
require_file "uninstall.php"

# Includes
require_file "includes/class-health-scanner.php"
require_file "includes/class-remediation.php"
require_file "includes/class-settings.php"
require_file "includes/class-ajax.php"
require_file "includes/class-chat-proxy.php"

# Compiled assets
require_file "assets/sentinel-admin.js"
require_file "assets/sentinel-admin.css"

# WordPress.org assets
require_file "readme.txt"
require_file "assets/banner-772x250.png"
require_file "assets/screenshot-1.png"
require_file "assets/screenshot-2.png"
require_file "assets/icon-256x256.png"

# Tests
require_file "phpunit.xml"
require_file "tests/bootstrap.php"
require_file "tests/test-health-scanner.php"
require_file "tests/test-remediation.php"
require_file "tests/test-ajax.php"
require_file "tests/test-settings.php"

echo ""
if [[ $ERRORS -gt 0 ]]; then
  echo "RESULT: $ERRORS failure(s)"
  exit 1
else
  echo "RESULT: all required files present"
  exit 0
fi
