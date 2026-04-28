#!/usr/bin/env bash
# check-banned-patterns.sh — Detect hardcoded secrets, custom build tooling, and banned deps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0

# 1. Hardcoded OpenAI API keys (sk- prefix pattern)
if grep -ri "sk-[a-z0-9]" "$ROOT/src" "$ROOT/includes" "$ROOT"/*.php > /dev/null 2>&1; then
  echo "FAIL: potential hardcoded OpenAI key found"
  grep -ri "sk-[a-z0-9]" "$ROOT/src" "$ROOT/includes" "$ROOT"/*.php || true
  FAIL=1
else
  echo "OK: no hardcoded OpenAI keys"
fi

# 2. Custom webpack / babel configs
for f in webpack.config.js babel.config.js babel.config.json .babelrc; do
  if [[ -f "$ROOT/$f" ]]; then
    echo "FAIL: custom build config detected: $f"
    FAIL=1
  fi
done
if [[ "$FAIL" -eq 0 ]]; then
  echo "OK: no custom webpack/babel configs"
fi

# 3. Banned dependencies in package.json
if [[ -f "$ROOT/package.json" ]]; then
  for term in bull redis custom-webpack; do
    if grep -qi "$term" "$ROOT/package.json"; then
      echo "FAIL: banned dependency '$term' found in package.json"
      FAIL=1
    fi
  done
  if [[ "$FAIL" -eq 0 ]]; then
    echo "OK: no banned dependencies in package.json"
  fi
fi

if [[ "$FAIL" -eq 1 ]]; then
  exit 1
fi

echo "PASS: no banned patterns detected"
