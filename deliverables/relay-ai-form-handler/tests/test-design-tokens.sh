#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOKENS=(
	'#F97316'
	'#F8FAFC'
	'#E2E8F0'
	'#0F172A'
	'#38BDF8'
	'#EF4444'
	'#F59E0B'
	'#22C55E'
	'#64748B'
)

PASS=0
FAIL=0

for token in "${TOKENS[@]}"; do
	if grep -ri "$token" "$ROOT/admin/css/relay-admin.css" "$ROOT/admin/views/inbox.php" >/dev/null 2>&1; then
		echo "PASS: $token found"
		PASS=$((PASS + 1))
	else
		echo "FAIL: $token missing"
		FAIL=$((FAIL + 1))
	fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
	exit 1
fi
exit 0
