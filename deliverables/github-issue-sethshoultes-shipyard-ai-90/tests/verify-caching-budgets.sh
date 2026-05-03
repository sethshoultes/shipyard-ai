#!/bin/bash
# verify-caching-budgets.sh — Verify caching and token budget implementation
# Exit 0 on pass, non-zero on fail

set -e

FORGE_DIR="/home/agent/shipyard-ai/forge"
FAILED=0

echo "=== Caching & Budgets Verification ==="
echo ""

# Check cache directory
if [ -d "$FORGE_DIR/cache" ]; then
    echo "[PASS] cache/ directory exists"
else
    echo "[FAIL] cache/ directory does not exist"
    FAILED=1
fi

# Check for CacheManager
echo "Checking for CacheManager..."
if grep -rE 'CacheManager|cache.*manager|get.*set.*has' "$FORGE_DIR/cache" 2>/dev/null; then
    echo "[PASS] CacheManager found"
else
    echo "[WARN] CacheManager not found"
fi

# Check for cache key generation
echo "Checking for cache key generation..."
if grep -rE 'cacheKey|generateKey|hashKey' "$FORGE_DIR/cache" 2>/dev/null; then
    echo "[PASS] Cache key generation found"
else
    echo "[WARN] Cache key generation not found"
fi

# Check budgets directory
if [ -d "$FORGE_DIR/budgets" ]; then
    echo "[PASS] budgets/ directory exists"
else
    echo "[FAIL] budgets/ directory does not exist"
    FAILED=1
fi

# Check for TokenBudget
echo "Checking for TokenBudget..."
if grep -rE 'TokenBudget|token.*budget|check.*deduct.*remaining' "$FORGE_DIR/budgets" 2>/dev/null; then
    echo "[PASS] TokenBudget found"
else
    echo "[WARN] TokenBudget not found"
fi

# Check for request deduplication
echo "Checking for request deduplication..."
if grep -rE 'dedup|deduplicat|sameRequest|duplicate' "$FORGE_DIR/budgets" 2>/dev/null; then
    echo "[PASS] Request deduplication found"
else
    echo "[WARN] Request deduplication not found"
fi

# Check for budget exceeded handling
echo "Checking for budget exceeded handling..."
if grep -rE 'exceeded|overBudget|budgetExceeded' "$FORGE_DIR/budgets" 2>/dev/null; then
    echo "[PASS] Budget exceeded handling found"
else
    echo "[WARN] Budget exceeded handling not found"
fi

echo ""
echo "=== Caching & Budgets Verification Complete ==="

if [ $FAILED -eq 0 ]; then
    echo "Caching and budgets structure checks passed."
    exit 0
else
    echo "Some caching and budgets structure checks failed."
    exit 1
fi
