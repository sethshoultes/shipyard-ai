#!/bin/bash
# Test: Verify configuration files are properly set up
# Exit 0 on pass, non-zero on fail

set -e

LOCALGENIUS_DIR="/home/agent/localgenius"
FAILED=0

echo "===== Configuration Check Test ====="
echo "Verifying that all required configuration is in place..."

# Check vercel.json has cron jobs
echo ""
echo "Checking Vercel cron configuration..."
if [ -f "$LOCALGENIUS_DIR/vercel.json" ]; then
  VERCEL_JSON=$(cat "$LOCALGENIUS_DIR/vercel.json")

  # Check for midnight batch job (0 0 * * *)
  if echo "$VERCEL_JSON" | grep -qi "0 0 \* \* \*\|\"cron\".*\"0 0"; then
    echo "✓ Midnight batch job configured"
  else
    echo "✗ MISSING: Midnight batch job cron"
    FAILED=1
  fi

  # Check for scheduled delivery job (every 10 minutes)
  if echo "$VERCEL_JSON" | grep -qi "\*/10 \* \* \* \*\|\"cron\".*\"\*/10"; then
    echo "✓ Scheduled delivery job configured (every 10 min)"
  else
    echo "✗ MISSING: Scheduled delivery cron"
    FAILED=1
  fi

  # Check for badge checker job (daily)
  if echo "$VERCEL_JSON" | grep -qi "badge"; then
    echo "✓ Badge checker job mentioned in config"
  else
    echo "⚠ Badge checker job not found in vercel.json"
  fi
else
  echo "✗ vercel.json not found"
  FAILED=1
fi

# Check .env.example has Twilio environment variables
echo ""
echo "Checking .env.example for required environment variables..."
if [ -f "$LOCALGENIUS_DIR/.env.example" ]; then
  ENV_EXAMPLE=$(cat "$LOCALGENIUS_DIR/.env.example")

  REQUIRED_VARS=("TWILIO_ACCOUNT_SID" "TWILIO_AUTH_TOKEN" "TWILIO_PHONE_NUMBER")
  for var in "${REQUIRED_VARS[@]}"; do
    if echo "$ENV_EXAMPLE" | grep -qi "$var"; then
      echo "✓ $var environment variable present"
    else
      echo "✗ MISSING: $var in .env.example"
      FAILED=1
    fi
  done

  # Check for Resend API key (existing or new)
  if echo "$ENV_EXAMPLE" | grep -qi "RESEND\|EMAIL_API_KEY"; then
    echo "✓ Email API key environment variable present"
  else
    echo "⚠ Email API key not found in .env.example"
  fi
else
  echo "✗ .env.example not found"
  FAILED=1
fi

# Check package.json has required dependencies
echo ""
echo "Checking package.json for required dependencies..."
if [ -f "$LOCALGENIUS_DIR/package.json" ]; then
  PACKAGE_JSON=$(cat "$LOCALGENIUS_DIR/package.json")

  REQUIRED_DEPS=("twilio" "resend")
  for dep in "${REQUIRED_DEPS[@]}"; do
    if echo "$PACKAGE_JSON" | grep -qi "\"$dep\""; then
      echo "✓ $dep dependency listed"
    else
      echo "✗ MISSING: $dep dependency"
      FAILED=1
    fi
  done

  # Check for image generation dependency
  if echo "$PACKAGE_JSON" | grep -qi "@vercel/og\|canvas\|sharp"; then
    echo "✓ Image generation library present"
  else
    echo "⚠ No image generation library found (need @vercel/og or canvas)"
  fi

  # Check for confetti library
  if echo "$PACKAGE_JSON" | grep -qi "confetti"; then
    echo "✓ Confetti animation library present"
  else
    echo "⚠ No confetti library found (need canvas-confetti or react-confetti)"
  fi
else
  echo "✗ package.json not found"
  FAILED=1
fi

# Check that existing files are properly imported/modified
echo ""
echo "Checking that existing files reference Pulse components..."
if [ -f "$LOCALGENIUS_DIR/src/services/digest/generator.ts" ]; then
  DIGEST_GEN=$(cat "$LOCALGENIUS_DIR/src/services/digest/generator.ts")

  # Should import journal prompt
  if echo "$DIGEST_GEN" | grep -qi "journal"; then
    echo "✓ Digest generator references journal"
  else
    echo "⚠ Digest generator may not integrate journal prompt"
  fi

  # Should import cliffhanger
  if echo "$DIGEST_GEN" | grep -qi "cliffhanger"; then
    echo "✓ Digest generator references cliffhanger"
  else
    echo "⚠ Digest generator may not integrate cliffhanger"
  fi
else
  echo "⚠ digest/generator.ts not found (may not exist yet)"
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "PASS: All required configuration is present"
  exit 0
else
  echo "FAIL: Configuration is incomplete"
  exit 1
fi
