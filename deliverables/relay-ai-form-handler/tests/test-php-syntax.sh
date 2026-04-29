#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0

while IFS= read -r -d '' file; do
	if php -l "$file" >/devdev/null 2>&1; then
		echo "PASS: $file"
		PASS=$((PASS + 1))
	else
		echo "FAIL: $file"
		FAIL=$((FAIL + 1))
	fi
done < <(find "$ROOT" -name '*.php' -print0)

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
	exit 1
fi
exit 0
