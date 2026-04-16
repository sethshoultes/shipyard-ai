#!/usr/bin/env bash
# Test: Run all verification tests for plugin entrypoint fix
# Exit 0 if all tests pass, non-zero if any test fails

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILED=0

echo "========================================"
echo "Running All Plugin Entrypoint Tests"
echo "========================================"
echo ""

# Test 1: Verify entrypoints
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Verify Entrypoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/verify-entrypoints.sh"; then
  echo "✅ Test 1 PASSED"
else
  echo "❌ Test 1 FAILED"
  FAILED=1
fi
echo ""

# Test 2: Verify TypeScript compilation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Verify TypeScript Compilation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/verify-typescript.sh"; then
  echo "✅ Test 2 PASSED"
else
  echo "❌ Test 2 FAILED"
  FAILED=1
fi
echo ""

# Test 3: Verify Astro config
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Verify Astro Config"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/verify-astro-config.sh"; then
  echo "✅ Test 3 PASSED"
else
  echo "❌ Test 3 FAILED"
  FAILED=1
fi
echo ""

# Test 4: Verify build (most comprehensive, runs last)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Verify Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/verify-build.sh"; then
  echo "✅ Test 4 PASSED"
else
  echo "❌ Test 4 FAILED"
  FAILED=1
fi
echo ""

echo "========================================"
echo "Test Summary"
echo "========================================"

if [[ $FAILED -eq 0 ]]; then
  echo "✅ ALL TESTS PASSED (4/4)"
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  exit 1
fi
