#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${PLUGIN_DIR:-projects/scribe/build/scribe}"

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo "FAIL: plugin directory does not exist: $PLUGIN_DIR"
  exit 1
fi

fail=0

# No eval or assert
if grep -Eriq "\beval\s*\(" "$PLUGIN_DIR"; then
  echo "FAIL: eval() found"
  fail=1
else
  echo "PASS: no eval()"
fi

if grep -Eriq "\bassert\s*\(" "$PLUGIN_DIR"; then
  echo "FAIL: assert() found"
  fail=1
else
  echo "PASS: no assert()"
fi

# Capability checks in admin-facing PHP files
for f in "$PLUGIN_DIR/includes/class-scribe-api.php" "$PLUGIN_DIR/includes/class-settings.php"; do
  if [[ -f "$f" ]]; then
    if grep -iq "current_user_can" "$f"; then
      echo "PASS: $f has capability check"
    else
      echo "WARN: $f missing capability check (manual review required)"
    fi
  fi
done

# ABSPATH guard in all PHP files
for f in $(find "$PLUGIN_DIR" -name "*.php"); do
  if grep -iq "ABSPATH" "$f"; then
    :
  else
    echo "FAIL: missing ABSPATH guard in $f"
    fail=1
  fi
done

# No raw echo of user input (basic heuristic)
if grep -Eriq "echo.*\\\$_GET|echo.*\\\$_POST|echo.*\\\$_REQUEST" "$PLUGIN_DIR"; then
  echo "FAIL: raw echo of user input detected"
  fail=1
else
  echo "PASS: no raw echo of user input"
fi

if [[ $fail -eq 1 ]]; then
  echo "Security test FAILED."
  exit 1
fi

echo "Security checks passed."
exit 0
