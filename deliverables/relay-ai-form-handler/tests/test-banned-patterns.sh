#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATTERNS=(
	'eval('
	'shell_exec('
	'base64_decode('
	'exec('
	'system('
	'passthru('
	'popen('
	'proc_open('
)

PASS=0
FAIL=0

for pattern in "${PATTERNS[@]}"; do
	matches=$(grep -rn "$pattern" "$ROOT" --include='*.php' || true)
	if [ -z "$matches" ]; then
		echo "PASS: no '$pattern' found"
		PASS=$((PASS + 1))
	else
		echo "FAIL: '$pattern' found"
		echo "$matches"
		FAIL=$((FAIL + 1))
	fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
	exit 1
fi
exit 0
