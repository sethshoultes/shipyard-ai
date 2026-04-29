#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILES=(
	"relay.php"
	"includes/class-relay.php"
	"includes/class-storage.php"
	"includes/class-admin.php"
	"includes/class-form-handler.php"
	"includes/class-claude-client.php"
	"includes/class-cache.php"
	"includes/class-async-processor.php"
	"admin/views/settings.php"
	"admin/views/inbox.php"
	"admin/css/relay-admin.css"
	"admin/js/relay-admin.js"
	"assets/relay-badge.svg"
	"readme.txt"
	"languages/relay.pot"
)

PASS=0
FAIL=0

for f in "${FILES[@]}"; do
	if [ -f "$ROOT/$f" ]; then
		echo "PASS: $f"
		PASS=$((PASS + 1))
	else
		echo "FAIL: $f missing"
		FAIL=$((FAIL + 1))
	fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
	exit 1
fi
exit 0
