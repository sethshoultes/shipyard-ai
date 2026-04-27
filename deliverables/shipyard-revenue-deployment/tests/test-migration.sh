#!/usr/bin/env bash
# test-migration.sh
# Verifies the D1 migration file exists, has required tables, and is valid SQLite syntax.
# Exit 0 if valid, non-zero if missing or malformed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
MIGRATION="${REPO_ROOT}/migrations/001_initial.sql"

echo "=== Test: D1 migration validity ==="

if [[ ! -f "$MIGRATION" ]]; then
  echo "  [FAIL] migrations/001_initial.sql does not exist"
  exit 1
fi

echo "  [PASS] migrations/001_initial.sql exists"

REQUIRED_TABLES=("customers" "sites" "health_checks" "email_log" "portal_tokens")
FAIL=0

for tbl in "${REQUIRED_TABLES[@]}"; do
  if grep -iq "CREATE TABLE.*\b${tbl}\b" "$MIGRATION"; then
    echo "  [PASS] Table '${tbl}' found"
  else
    echo "  [FAIL] Table '${tbl}' MISSING"
    FAIL=1
  fi
done

# Validate with sqlite3 if available
if command -v sqlite3 >/dev/null 2>&1; then
  TEMP_DB=$(mktemp)
  if sqlite3 "$TEMP_DB" < "$MIGRATION" 2>/dev/null; then
    echo "  [PASS] SQLite syntax is valid"
  else
    echo "  [FAIL] SQLite syntax error detected"
    FAIL=1
  fi
  rm -f "$TEMP_DB"
else
  echo "  [SKIP] sqlite3 not installed; skipping syntax validation"
fi

if [[ "$FAIL" -eq 0 ]]; then
  echo ""
  echo "Migration check passed."
  exit 0
else
  echo ""
  echo "Migration check failed."
  exit 1
fi
