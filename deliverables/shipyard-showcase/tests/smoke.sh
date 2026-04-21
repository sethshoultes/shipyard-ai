#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.shipyard.company}"
WORK_URL="${BASE_URL}/work"
OG_URL="${OG_URL:-https://poster.shipyard.company/github.com/sethshoultes/shipyard-ai}"

echo "==> Smoke Test: Shipyard Showcase"

# Test /work page returns 200
echo -n "Checking ${WORK_URL} ... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${WORK_URL}")
if [ "${HTTP_CODE}" != "200" ]; then
  echo "FAIL (HTTP ${HTTP_CODE})"
  exit 1
fi
echo "OK"

# Test OG Worker returns image/png
echo -n "Checking OG Worker ${OG_URL} ... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -I "${OG_URL}")
if [ "${HTTP_CODE}" != "200" ]; then
  echo "FAIL (HTTP ${HTTP_CODE})"
  exit 1
fi

CT=$(curl -s -o /dev/null -w "%{content_type}" --max-time 10 -I "${OG_URL}")
if [[ "${CT}" != *"image/png"* ]]; then
  echo "FAIL (content-type: ${CT})"
  exit 1
fi
echo "OK"

echo "==> All smoke tests passed."
exit 0
