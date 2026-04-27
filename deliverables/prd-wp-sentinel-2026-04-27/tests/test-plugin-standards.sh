#!/usr/bin/env bash
set -euo pipefail

# WP Sentinel — Plugin Standards Test
# Verifies readme.txt and plugin header compliance for WordPress.org submission.

PLUGIN_DIR="${1:-wp-sentinel}"
ERRORS=0

fail() {
  echo "FAIL: $1"
  ((ERRORS++)) || true
}

pass() {
  echo "PASS: $1"
}

echo "=== WP Sentinel Plugin Standards Test ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

if [[ ! -d "$PLUGIN_DIR" ]]; then
  fail "Plugin directory $PLUGIN_DIR does not exist"
  echo "RESULT: aborting"
  exit 1
fi

MAIN_FILE="$PLUGIN_DIR/wp-sentinel.php"
README_FILE="$PLUGIN_DIR/readme.txt"

# 1. Main plugin file has required header fields
if [[ -f "$MAIN_FILE" ]]; then
  HEADERS=("Plugin Name:" "Version:" "Requires at least:" "Requires PHP:" "License:")
  for header in "${HEADERS[@]}"; do
    if grep -q "$header" "$MAIN_FILE"; then
      pass "wp-sentinel.php has '$header'"
    else
      fail "wp-sentinel.php missing '$header'"
    fi
  done
else
  fail "wp-sentinel.php not found"
fi

# 2. Plugin header PHP version matches spec (7.4+)
if [[ -f "$MAIN_FILE" ]]; then
  if grep -q "Requires PHP: 7.4" "$MAIN_FILE"; then
    pass "wp-sentinel.php requires PHP 7.4"
  else
    fail "wp-sentinel.php does not specify PHP 7.4+ requirement"
  fi
fi

# 3. readme.txt exists and has standard sections
if [[ -f "$README_FILE" ]]; then
  SECTIONS=("== Description ==" "== Installation ==" "== FAQ ==" "== Changelog ==")
  for section in "${SECTIONS[@]}"; do
    if grep -q "$section" "$README_FILE"; then
      pass "readme.txt has '$section'"
    else
      fail "readme.txt missing '$section'"
    fi
  done
else
  fail "readme.txt not found"
fi

# 4. readme.txt has standard header fields
if [[ -f "$README_FILE" ]]; then
  HEADERS=("Plugin Name:" "Contributors:" "Tags:" "Requires at least:" "Tested up to:" "Requires PHP:" "Stable tag:")
  for header in "${HEADERS[@]}"; do
    if grep -q "$header" "$README_FILE"; then
      pass "readme.txt has '$header'"
    else
      fail "readme.txt missing '$header'"
    fi
  done
fi

# 5. No aggressive upsell language in readme
if [[ -f "$README_FILE" ]]; then
  BANNED_WORDS=("annual billing" "subscribe now" "limited time offer" "act now")
  for word in "${BANNED_WORDS[@]}"; do
    MATCHES=$(grep -in "$word" "$README_FILE" 2>/dev/null || true)
    if [[ -n "$MATCHES" ]]; then
      fail "Banned upsell language '$word' in readme.txt:\n$MATCHES"
    else
      pass "No banned upsell language '$word' in readme.txt"
    fi
  done
fi

# 6. Screenshots section exists if screenshots are present
if ls "$PLUGIN_DIR/assets/screenshot-"*.png 1>/dev/null 2>&1; then
  if [[ -f "$README_FILE" ]] && grep -q "== Screenshots ==" "$README_FILE"; then
    pass "Screenshots section exists in readme.txt"
  else
    fail "Screenshots present but no == Screenshots == section in readme.txt"
  fi
fi

# 7. Plugin name consistency between header and readme
if [[ -f "$MAIN_FILE" && -f "$README_FILE" ]]; then
  HEADER_NAME=$(grep "Plugin Name:" "$MAIN_FILE" | head -n1 | sed 's/.*Plugin Name: *//' || true)
  README_NAME=$(grep "Plugin Name:" "$README_FILE" | head -n1 | sed 's/.*Plugin Name: *//' || true)
  if [[ "$HEADER_NAME" == "$README_NAME" ]]; then
    pass "Plugin name consistent between wp-sentinel.php and readme.txt"
  else
    fail "Plugin name mismatch: '$HEADER_NAME' vs '$README_NAME'"
  fi
fi

echo ""
if [[ $ERRORS -gt 0 ]]; then
  echo "RESULT: $ERRORS failure(s)"
  exit 1
else
  echo "RESULT: all plugin standards checks passed"
  exit 0
fi
