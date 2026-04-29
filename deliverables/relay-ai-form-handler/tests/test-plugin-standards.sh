#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0

# ABSPATH guard in every PHP file
while IFS= read -r -d '' file; do
	if grep -q 'ABSPATH' "$file"; then
		PASS=$((PASS + 1))
	else
		echo "FAIL: ABSPATH guard missing in $file"
		FAIL=$((FAIL + 1))
	fi
done < <(find "$ROOT" -name '*.php' -print0)

# Check for current_user_can in admin entry points
for file in "$ROOT/includes/class-admin.php" "$ROOT/admin/views/settings.php" "$ROOT/admin/views/inbox.php"; do
	if grep -q 'current_user_can' "$file"; then
		PASS=$((PASS + 1))
	else
		echo "FAIL: current_user_can missing in $file"
		FAIL=$((FAIL + 1))
	fi
done

# Check for nonces in form handlers
for file in "$ROOT/includes/class-admin.php" "$ROOT/includes/class-form-handler.php"; do
	if grep -q 'check_admin_referer\|check_ajax_referer\|wp_verify_nonce' "$file"; then
		PASS=$((PASS + 1))
	else
		echo "FAIL: nonce check missing in $file"
		FAIL=$((FAIL + 1))
	fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
	exit 1
fi
exit 0
