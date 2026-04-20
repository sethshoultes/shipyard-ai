#!/usr/bin/env bash
# Test: Verify database schema files exist and are valid
# Exit 0 on pass, non-zero on fail

set -e

echo "=== Verifying Database Schema ==="

# Check if schema files exist
SCHEMA_FILES=(
  "packages/db/schema/subscribers.ts"
  "packages/db/schema/token-usage.ts"
  "packages/db/schema/referrals.ts"
  "packages/db/config/pricing.ts"
)

for file in "${SCHEMA_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ FAIL: Schema file missing: $file"
    exit 1
  fi
  echo "✓ Found: $file"
done

# Verify subscribers table has required columns
echo ""
echo "Checking subscribers table schema..."

REQUIRED_COLUMNS=(
  "id"
  "email"
  "tier"
  "tokens_monthly"
  "tokens_remaining"
  "referral_code"
  "referral_credits"
  "start_date"
  "status"
)

for column in "${REQUIRED_COLUMNS[@]}"; do
  if ! grep -q "$column" packages/db/schema/subscribers.ts; then
    echo "❌ FAIL: Missing column '$column' in subscribers table"
    exit 1
  fi
done
echo "✓ All 9 columns present in subscribers table"

# Verify unique constraints
if ! grep -q "unique" packages/db/schema/subscribers.ts; then
  echo "❌ FAIL: No unique constraints found in subscribers table"
  exit 1
fi
echo "✓ Unique constraints found"

# Verify indexes
if ! grep -q "index" packages/db/schema/subscribers.ts; then
  echo "❌ FAIL: No indexes found in subscribers table"
  exit 1
fi
echo "✓ Indexes found"

# Verify token_usage table has foreign key
echo ""
echo "Checking token_usage table schema..."
if ! grep -q "references" packages/db/schema/token-usage.ts; then
  echo "❌ FAIL: No foreign key constraint in token_usage table"
  exit 1
fi
echo "✓ Foreign key constraint found in token_usage"

# Verify referrals table has foreign key
echo ""
echo "Checking referrals table schema..."
if ! grep -q "references" packages/db/schema/referrals.ts; then
  echo "❌ FAIL: No foreign key constraint in referrals table"
  exit 1
fi
echo "✓ Foreign key constraint found in referrals"

# Verify pricing config has both tiers
echo ""
echo "Checking pricing configuration..."
if ! grep -q "care" packages/db/config/pricing.ts; then
  echo "❌ FAIL: 'care' tier not found in pricing config"
  exit 1
fi
if ! grep -q "care_pro" packages/db/config/pricing.ts; then
  echo "❌ FAIL: 'care_pro' tier not found in pricing config"
  exit 1
fi
echo "✓ Both pricing tiers (care, care_pro) found"

# Verify pricing amounts
if ! grep -q "500" packages/db/config/pricing.ts; then
  echo "❌ FAIL: $500 price not found in pricing config"
  exit 1
fi
if ! grep -q "100000\|100_000" packages/db/config/pricing.ts; then
  echo "❌ FAIL: 100K tokens not found in pricing config"
  exit 1
fi
echo "✓ Pricing amounts ($500, 100K tokens) found"

# Try to build the database package
echo ""
echo "Building database package..."
cd packages/db
if npm run build > /dev/null 2>&1; then
  echo "✓ Database package builds successfully"
else
  echo "❌ FAIL: Database package build failed"
  exit 1
fi

echo ""
echo "✅ ALL DATABASE SCHEMA TESTS PASSED"
exit 0
