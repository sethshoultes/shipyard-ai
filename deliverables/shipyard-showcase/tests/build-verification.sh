#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${OUT_DIR:-/website/out}"
MAX_INDEX_BYTES=153600  # 150KB
FAIL=0

echo "==> Build Verification Test"

if [ ! -d "${OUT_DIR}" ]; then
  echo "FAIL: Output directory ${OUT_DIR} does not exist"
  exit 1
fi

# Check /work/index.html
if [ ! -f "${OUT_DIR}/work/index.html" ]; then
  echo "FAIL: ${OUT_DIR}/work/index.html not found"
  FAIL=1
else
  echo "OK: ${OUT_DIR}/work/index.html exists"
fi

# Check root index.html
if [ ! -f "${OUT_DIR}/index.html" ]; then
  echo "FAIL: ${OUT_DIR}/index.html not found"
  FAIL=1
else
  echo "OK: ${OUT_DIR}/index.html exists"
fi

# Check index.html size
if [ -f "${OUT_DIR}/index.html" ]; then
  size=$(stat -c%s "${OUT_DIR}/index.html" 2>/dev/null || stat -f%z "${OUT_DIR}/index.html" 2>/dev/null)
  if [ "$size" -gt "$MAX_INDEX_BYTES" ]; then
    echo "FAIL: index.html is ${size} bytes (max ${MAX_INDEX_BYTES})"
    FAIL=1
  else
    echo "OK: index.html is ${size} bytes"
  fi
fi

# Verify no API routes (static export should not have them)
if [ -d "${OUT_DIR}/api" ]; then
  echo "FAIL: Static export contains /api directory"
  FAIL=1
else
  echo "OK: No /api directory in static export"
fi

if [ "$FAIL" -eq 1 ]; then
  echo "==> Build verification FAILED"
  exit 1
fi

echo "==> Build verification passed."
exit 0
