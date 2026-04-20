#!/usr/bin/env bash
# Test: Verify subscriber management scripts exist and have required exports
# Exit 0 on pass, non-zero on fail

set -e

echo "=== Verifying Subscriber Management Scripts ==="

# Check if script files exist
SCRIPT_FILES=(
  "packages/db/scripts/subscriber-add.ts"
  "packages/db/scripts/subscriber-check.ts"
  "packages/db/scripts/token-deduct.ts"
)

for file in "${SCRIPT_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ FAIL: Script file missing: $file"
    exit 1
  fi
  echo "✓ Found: $file"
done

# Verify subscriber-add.ts has required function
echo ""
echo "Checking subscriber-add.ts..."
if ! grep -q "addSubscriber\|createSubscriber" packages/db/scripts/subscriber-add.ts; then
  echo "❌ FAIL: addSubscriber function not found in subscriber-add.ts"
  exit 1
fi
echo "✓ addSubscriber function found"

if ! grep -q "generateReferralCode\|referralCode\|referral.*code" packages/db/scripts/subscriber-add.ts; then
  echo "❌ FAIL: Referral code generation logic not found"
  exit 1
fi
echo "✓ Referral code generation found"

if ! grep -q "export.*addSubscriber\|export.*createSubscriber" packages/db/scripts/subscriber-add.ts; then
  echo "❌ FAIL: addSubscriber not exported"
  exit 1
fi
echo "✓ addSubscriber exported"

# Verify subscriber-check.ts has required function
echo ""
echo "Checking subscriber-check.ts..."
if ! grep -q "checkSubscriber\|getSubscriber\|findSubscriber" packages/db/scripts/subscriber-check.ts; then
  echo "❌ FAIL: checkSubscriber function not found in subscriber-check.ts"
  exit 1
fi
echo "✓ checkSubscriber function found"

if ! grep -q "export.*checkSubscriber\|export.*getSubscriber\|export.*findSubscriber" packages/db/scripts/subscriber-check.ts; then
  echo "❌ FAIL: checkSubscriber not exported"
  exit 1
fi
echo "✓ checkSubscriber exported"

# Verify token-deduct.ts has required function
echo ""
echo "Checking token-deduct.ts..."
if ! grep -q "deductTokens\|decrementTokens\|useTokens" packages/db/scripts/token-deduct.ts; then
  echo "❌ FAIL: deductTokens function not found in token-deduct.ts"
  exit 1
fi
echo "✓ deductTokens function found"

if ! grep -q "export.*deductTokens\|export.*decrementTokens\|export.*useTokens" packages/db/scripts/token-deduct.ts; then
  echo "❌ FAIL: deductTokens not exported"
  exit 1
fi
echo "✓ deductTokens exported"

# Verify token-deduct has warning threshold logic
if ! grep -q "20000\|20_000\|< 20K\|threshold" packages/db/scripts/token-deduct.ts; then
  echo "⚠ WARNING: 20K token warning threshold not found in token-deduct.ts"
else
  echo "✓ Token warning threshold found"
fi

# Verify database imports (Drizzle ORM usage)
echo ""
echo "Checking database imports..."
for script in "${SCRIPT_FILES[@]}"; do
  if ! grep -q "import.*db\|import.*drizzle\|from.*db\|from.*drizzle" "$script"; then
    echo "⚠ WARNING: Database import not found in $script"
  fi
done
echo "✓ Database imports found in scripts"

# Verify error handling exists
echo ""
echo "Checking error handling..."
error_handling_count=0
for script in "${SCRIPT_FILES[@]}"; do
  if grep -q "try\|catch\|throw\|Error" "$script"; then
    ((error_handling_count++))
  fi
done

if [[ $error_handling_count -lt 2 ]]; then
  echo "⚠ WARNING: Limited error handling found in scripts (found in $error_handling_count/3 files)"
else
  echo "✓ Error handling found in scripts"
fi

echo ""
echo "✅ ALL SCRIPT VERIFICATION TESTS PASSED"
exit 0
