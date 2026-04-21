#!/usr/bin/env bash
# test-config.sh
# Verify package.json and wrangler.toml integrity.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-.}"
ERRORS=0

echo "=== Config Tests ==="

# package.json
if [[ -f "$PROJECT_ROOT/package.json" ]]; then
  echo "PASS: package.json exists"

  # Must have a name
  if grep -q '"name"' "$PROJECT_ROOT/package.json"; then
    echo "PASS: package.json has name field"
  else
    echo "FAIL: package.json missing name field"
    ERRORS=$((ERRORS + 1))
  fi

  # Must have wrangler as devDependency or dependency (for deploy)
  if grep -q 'wrangler' "$PROJECT_ROOT/package.json"; then
    echo "PASS: package.json references wrangler"
  else
    echo "FAIL: package.json missing wrangler"
    ERRORS=$((ERRORS + 1))
  fi

  # Must have typescript
  if grep -q 'typescript' "$PROJECT_ROOT/package.json"; then
    echo "PASS: package.json references typescript"
  else
    echo "FAIL: package.json missing typescript"
    ERRORS=$((ERRORS + 1))
  fi

  # Must have a resvg dependency
  if grep -q 'resvg' "$PROJECT_ROOT/package.json"; then
    echo "PASS: package.json references resvg"
  else
    echo "FAIL: package.json missing resvg dependency"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: package.json missing"
  ERRORS=$((ERRORS + 1))
fi

# wrangler.toml
if [[ -f "$PROJECT_ROOT/wrangler.toml" ]]; then
  echo "PASS: wrangler.toml exists"

  if grep -q 'name' "$PROJECT_ROOT/wrangler.toml"; then
    echo "PASS: wrangler.toml has name"
  else
    echo "FAIL: wrangler.toml missing name"
    ERRORS=$((ERRORS + 1))
  fi

  if grep -q 'compatibility_date\|compatibility-date' "$PROJECT_ROOT/wrangler.toml"; then
    echo "PASS: wrangler.toml has compatibility_date"
  else
    echo "FAIL: wrangler.toml missing compatibility_date"
    ERRORS=$((ERRORS + 1))
  fi

  # Must bind an R2 bucket (cache storage)
  if grep -qi 'r2_buckets\|r2-buckets\|\[\[r2_buckets\]\]' "$PROJECT_ROOT/wrangler.toml"; then
    echo "PASS: wrangler.toml binds R2 bucket"
  else
    echo "FAIL: wrangler.toml missing R2 bucket binding"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: wrangler.toml missing"
  ERRORS=$((ERRORS + 1))
fi

# tsconfig.json
if [[ -f "$PROJECT_ROOT/tsconfig.json" ]]; then
  echo "PASS: tsconfig.json exists"
else
  echo "FAIL: tsconfig.json missing"
  ERRORS=$((ERRORS + 1))
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo "=== $ERRORS failure(s) ==="
  exit 1
fi

echo "=== All config tests passed ==="
exit 0
