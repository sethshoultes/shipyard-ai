#!/usr/bin/env bash
# Test: Verify Stripe integration files exist and have required functions
# Exit 0 on pass, non-zero on fail

set -e

echo "=== Verifying Stripe Integration ==="

# Check if Stripe client exists
if [[ ! -f "packages/api/stripe/client.ts" ]]; then
  echo "❌ FAIL: Stripe client file missing: packages/api/stripe/client.ts"
  exit 1
fi
echo "✓ Found: packages/api/stripe/client.ts"

# Check if webhook handler exists
if [[ ! -f "packages/api/stripe/webhooks.ts" ]]; then
  echo "❌ FAIL: Stripe webhook handler missing: packages/api/stripe/webhooks.ts"
  exit 1
fi
echo "✓ Found: packages/api/stripe/webhooks.ts"

# Verify Stripe client has required functions
echo ""
echo "Checking Stripe client functions..."
REQUIRED_CLIENT_FUNCTIONS=(
  "createSubscription"
  "cancelSubscription"
  "applyReferralCredit"
)

for func in "${REQUIRED_CLIENT_FUNCTIONS[@]}"; do
  if ! grep -q "$func" packages/api/stripe/client.ts; then
    echo "❌ FAIL: Missing function '$func' in Stripe client"
    exit 1
  fi
done
echo "✓ All required Stripe client functions found"

# Verify Stripe SDK import
if ! grep -q "import.*stripe\|from.*stripe\|require.*stripe" packages/api/stripe/client.ts; then
  echo "❌ FAIL: Stripe SDK import not found in client"
  exit 1
fi
echo "✓ Stripe SDK import found"

# Verify webhook handler has signature verification
echo ""
echo "Checking webhook security..."
if ! grep -q "constructEvent\|verifySignature\|webhook.*signature" packages/api/stripe/webhooks.ts; then
  echo "❌ FAIL: Webhook signature verification not found"
  exit 1
fi
echo "✓ Webhook signature verification found"

# Verify webhook handlers for required events
echo ""
echo "Checking webhook event handlers..."
REQUIRED_WEBHOOKS=(
  "subscription.created\|subscription\.created\|SubscriptionCreated"
  "subscription.deleted\|subscription\.deleted\|SubscriptionDeleted"
  "invoice.payment_succeeded\|invoice\.payment_succeeded\|InvoicePaymentSucceeded"
  "invoice.payment_failed\|invoice\.payment_failed\|InvoicePaymentFailed"
)

webhook_count=0
for webhook in "${REQUIRED_WEBHOOKS[@]}"; do
  if grep -q "$webhook" packages/api/stripe/webhooks.ts; then
    ((webhook_count++))
  fi
done

if [[ $webhook_count -lt 4 ]]; then
  echo "❌ FAIL: Not all 4 required webhook handlers found (found $webhook_count/4)"
  exit 1
fi
echo "✓ All 4 required webhook handlers found"

# Verify webhook handlers call database functions
echo ""
echo "Checking database integration in webhooks..."
if ! grep -q "addSubscriber\|insertSubscriber\|createSubscriber" packages/api/stripe/webhooks.ts; then
  echo "❌ FAIL: No subscriber creation call found in webhook handler"
  exit 1
fi
echo "✓ Subscriber creation logic found in webhooks"

if ! grep -q "update.*status\|status.*=.*'cancelled'\|cancelSubscriber" packages/api/stripe/webhooks.ts; then
  echo "❌ FAIL: No status update logic found for subscription deletion"
  exit 1
fi
echo "✓ Status update logic found in webhooks"

# Verify email sending in webhooks
echo ""
echo "Checking email integration in webhooks..."
if ! grep -q "sendEmail\|sendWelcomeEmail\|email.*welcome\|welcome.*email" packages/api/stripe/webhooks.ts; then
  echo "⚠ WARNING: Welcome email sending not found in webhook handler"
fi

if ! grep -q "sendEmail\|sendAlertEmail\|email.*alert\|alert.*email\|payment.*failed.*email" packages/api/stripe/webhooks.ts; then
  echo "⚠ WARNING: Alert email sending not found in payment failed webhook"
fi

# Verify idempotency handling
echo ""
echo "Checking idempotency..."
if ! grep -q "event\.id\|eventId\|idempotency\|duplicate" packages/api/stripe/webhooks.ts; then
  echo "⚠ WARNING: Idempotency check not found (duplicate events could cause issues)"
else
  echo "✓ Idempotency handling found"
fi

echo ""
echo "✅ ALL STRIPE INTEGRATION TESTS PASSED"
exit 0
