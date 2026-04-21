#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${SRC_DIR:-/website/src}"
FAIL=0

echo "==> Banned Patterns Test"

PATTERNS=("cfat_" "ghp_" "gho_")

for pattern in "${PATTERNS[@]}"; do
  hits=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" -c "${pattern}" "${SRC_DIR}" 2>/dev/null || echo "0")
  if [ "${hits}" != "0" ] && [ "${hits}" != "" ]; then
    echo "FAIL: Found banned pattern '${pattern}' in ${hits} location(s)"
    grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" -n "${pattern}" "${SRC_DIR}" || true
    FAIL=1
  fi
done

if [ "$FAIL" -eq 1 ]; then
  echo "==> Banned patterns test FAILED"
  exit 1
fi

echo "==> Banned patterns test passed."
exit 0
