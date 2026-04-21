#!/usr/bin/env bash
set -euo pipefail

IMAGE_DIR="${IMAGE_DIR:-/website/public/images}"
MAX_BYTES=51200  # 50KB
FAIL=0

echo "==> Image Budget Test"

if [ ! -d "${IMAGE_DIR}" ]; then
  echo "FAIL: Directory ${IMAGE_DIR} does not exist"
  exit 1
fi

for img in "${IMAGE_DIR}"/*.{webp,avif,png,jpg,jpeg}; do
  [ -e "$img" ] || continue
  size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
  name=$(basename "$img")
  if [ "$size" -gt "$MAX_BYTES" ]; then
    echo "FAIL: ${name} is ${size} bytes (max ${MAX_BYTES})"
    FAIL=1
  else
    echo "OK: ${name} is ${size} bytes"
  fi
done

if [ "$FAIL" -eq 1 ]; then
  echo "==> Image budget test FAILED"
  exit 1
fi

echo "==> Image budget test passed."
exit 0
