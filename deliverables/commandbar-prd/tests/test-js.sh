#!/usr/bin/env bash
# test-js.sh — Verify beam.js constraints
# Pass: exits 0. Fail: exits non-zero.

set -euo pipefail

JS_FILE="projects/commandbar-prd/build/beam/beam.js"

echo "=== JS Test ==="

if [[ ! -f "$JS_FILE" ]]; then
    echo "SKIP: $JS_FILE not found yet"
    exit 0
fi

# 1. Syntax check (node --check)
if ! node --check "$JS_FILE" > /dev/null 2>&1; then
    echo "FAIL: JS syntax error in $JS_FILE"
    exit 1
fi
echo "PASS: JS syntax valid"

# 2. Line count ≤ 350
lines=$(wc -l < "$JS_FILE")
if (( lines > 350 )); then
    echo "FAIL: $JS_FILE has $lines lines (max 350)"
    exit 1
fi
echo "PASS: Line count $lines ≤ 350"

# 3. Inline style injection
if ! grep -q "<style>" "$JS_FILE"; then
    echo "FAIL: Inline <style> injection missing"
    exit 1
fi
echo "PASS: Inline style injection present"

# 4. Overlay style (rgba)
if ! grep -q "rgba(0,0,0,0.6)" "$JS_FILE"; then
    echo "FAIL: Overlay rgba style missing"
    exit 1
fi
echo "PASS: Overlay style present"

# 5. Modal background color
if ! grep -q "#1e1e1e" "$JS_FILE"; then
    echo "FAIL: Modal background color #1e1e1e missing"
    exit 1
fi
echo "PASS: Modal background color present"

# 6. Selected row background
if ! grep -q "#375a7f" "$JS_FILE"; then
    echo "FAIL: Selected row background #375a7f missing"
    exit 1
fi
echo "PASS: Selected row background present"

# 7. Hotkey listener
if ! grep -q "keydown" "$JS_FILE"; then
    echo "FAIL: keydown listener missing"
    exit 1
fi
echo "PASS: keydown listener present"

# 8. Keyboard navigation keys
for key in "ArrowUp" "ArrowDown" "Escape" "Enter" "Tab"; do
    if ! grep -q "$key" "$JS_FILE"; then
        echo "FAIL: Missing keyboard navigation key: $key"
        exit 1
    fi
done
echo "PASS: All keyboard navigation keys present"

# 9. ARIA attributes
aria_count=$(grep -c "aria-" "$JS_FILE" || true)
if (( aria_count < 2 )); then
    echo "FAIL: Only $aria_count aria- attributes found (expected ≥2)"
    exit 1
fi
echo "PASS: ARIA attributes present ($aria_count)"

# 10. Focus trap / editable guard
if ! grep -qi "contenteditable" "$JS_FILE"; then
    echo "FAIL: contenteditable guard missing"
    exit 1
fi
echo "PASS: Editable field guard present"

# 11. Array.filter for search
if ! grep -q "filter" "$JS_FILE"; then
    echo "FAIL: Array.filter search logic missing"
    exit 1
fi
echo "PASS: Array.filter present"

# 12. beamIndex reference (the localized data contract)
if ! grep -q "beamIndex" "$JS_FILE"; then
    echo "FAIL: beamIndex reference missing (data contract broken)"
    exit 1
fi
echo "PASS: beamIndex data contract referenced"

echo "=== JS Test: ALL PASSED ==="
