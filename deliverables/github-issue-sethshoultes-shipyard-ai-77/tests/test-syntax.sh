#!/bin/bash
#
# test-syntax.sh — Run PHP lint on every .php file in the Stage plugin.
# Exits 0 on pass, non-zero on fail.
#

set -euo pipefail

PLUGIN_DIR="stage"
ERRORS=0

echo "=== Stage Syntax Test ==="

if [[ ! -d "$PLUGIN_DIR" ]]; then
    echo "FAIL: Plugin directory $PLUGIN_DIR does not exist"
    exit 1
fi

while IFS= read -r -d '' file; do
    if ! php -l "$file" > /dev/null 2>&1; then
        echo "FAIL: Syntax error in $file"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: $file"
    fi
done < <(find "$PLUGIN_DIR" -name '*.php' -print0)

if (( ERRORS > 0 )); then
    echo "=== FAILED: $ERRORS syntax error(s) ==="
    exit 1
fi

echo "=== All syntax tests passed ==="
exit 0
