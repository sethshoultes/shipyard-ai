#!/usr/bin/env bash
# test-structure.sh
# Verifies the Sous plugin directory tree matches the spec.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PLUGIN_DIR="${PLUGIN_DIR:-./sous}"
ERRORS=0

required_files=(
  "sous.php"
  "admin.php"
  "readme.txt"
  "includes/detector.php"
  "includes/data-store.php"
  "includes/scheduler.php"
  "assets/widget.js"
  "assets/widget.css"
  "assets/admin.css"
  "data/templates.json"
)

echo "=== Sous Plugin Structure Test ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

for f in "${required_files[@]}"; do
  path="$PLUGIN_DIR/$f"
  if [[ -f "$path" ]]; then
    echo "[PASS] $f exists"
  else
    echo "[FAIL] $f MISSING"
    ((ERRORS++)) || true
  fi
done

echo ""

# Verify every PHP file has ABSPATH guard
php_files=()
while IFS= read -r -d '' file; do
  php_files+=("$file")
done < <(find "$PLUGIN_DIR" -type f -name "*.php" -print0 2>/dev/null || true)

if [[ ${#php_files[@]} -eq 0 ]]; then
  echo "[FAIL] No PHP files found in $PLUGIN_DIR"
  ERRORS=$((ERRORS + 1))
else
  for f in "${php_files[@]}"; do
    rel="${f#$PLUGIN_DIR/}"
    if grep -q "ABSPATH" "$f"; then
      echo "[PASS] $rel has ABSPATH guard"
    else
      echo "[FAIL] $rel MISSING ABSPATH guard"
      ((ERRORS++)) || true
    fi
  done
fi

echo ""

# Verify readme.txt has required headers
readme="$PLUGIN_DIR/readme.txt"
if [[ -f "$readme" ]]; then
  for header in "Plugin Name:" "Requires PHP:" "Tested up to:" "Stable tag:" "License:"; do
    if grep -q "^$header" "$readme"; then
      echo "[PASS] readme.txt has header: $header"
    else
      echo "[FAIL] readme.txt MISSING header: $header"
      ((ERRORS++)) || true
    fi
  done
else
  echo "[SKIP] readme.txt not found — header check skipped"
fi

echo ""

if [[ $ERRORS -eq 0 ]]; then
  echo "=== ALL STRUCTURE CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS STRUCTURE CHECK(S) FAILED ==="
  exit 1
fi
