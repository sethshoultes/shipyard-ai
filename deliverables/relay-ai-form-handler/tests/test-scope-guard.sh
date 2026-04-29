#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CUT_FEATURES=(
	'csv_export'
	'slack'
	'gutenberg_block'
	'react'
	'webpack'
)

PASS=0
FAIL=0

for feature in "${CUT_FEATURES[@]}"; do
	# Allow in comments if the word exists, but grep for actual code usage is hard.
	# We check for actual presence outside of comments as a heuristic.
	matches=$(grep -rni "$feature" "$ROOT" --include='*.php' --include='*.js' --include='*.css' || true)
	if [ -z "$matches" ]; then
		echo "PASS: no '$feature' found"
		PASS=$((PASS + 1))
	else
		echo "FAIL: '$feature' found (scope guard)"
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
