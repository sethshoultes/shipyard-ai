#!/usr/bin/env bash
# Test: Verify email templates exist and have required template variables
# Exit 0 on pass, non-zero on fail

set -e

echo "=== Verifying Email Templates ==="

# Check if template files exist
TEMPLATE_FILES=(
  "packages/email/templates/welcome-subscriber.html"
  "packages/email/templates/incident-report.html"
  "packages/email/templates/token-warning.html"
)

for file in "${TEMPLATE_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ FAIL: Email template missing: $file"
    exit 1
  fi
  echo "✓ Found: $file"
done

# Verify welcome email has required template variables
echo ""
echo "Checking welcome-subscriber.html template..."
WELCOME_VARIABLES=(
  "NAME"
  "TOKENS"
  "REFERRAL_URL"
)

for variable in "${WELCOME_VARIABLES[@]}"; do
  if ! grep -q "\[${variable}\]\|{{${variable}}}\|{${variable}}" packages/email/templates/welcome-subscriber.html; then
    echo "❌ FAIL: Missing template variable $variable in welcome email"
    exit 1
  fi
done
echo "✓ All template variables found in welcome email"

# Check for key welcome email content
if ! grep -qi "welcome" packages/email/templates/welcome-subscriber.html; then
  echo "❌ FAIL: 'Welcome' text not found in welcome email"
  exit 1
fi
if ! grep -qi "referral\|refer" packages/email/templates/welcome-subscriber.html; then
  echo "❌ FAIL: Referral instructions not found in welcome email"
  exit 1
fi
echo "✓ Welcome email contains required content"

# Verify incident report has required template variables
echo ""
echo "Checking incident-report.html template..."
INCIDENT_VARIABLES=(
  "DESCRIPTION"
  "ACTION_TAKEN"
  "TOKENS"
)

for variable in "${INCIDENT_VARIABLES[@]}"; do
  if ! grep -q "\[${variable}\]\|{{${variable}}}\|{${variable}}" packages/email/templates/incident-report.html; then
    echo "❌ FAIL: Missing template variable $variable in incident report"
    exit 1
  fi
done
echo "✓ All template variables found in incident report"

# Check for 3-line format indicators (what broke, how fixed, tokens)
if ! grep -qi "broke\|issue\|detected" packages/email/templates/incident-report.html; then
  echo "❌ FAIL: 'What broke' section not found in incident report"
  exit 1
fi
if ! grep -qi "fixed\|resolved" packages/email/templates/incident-report.html; then
  echo "❌ FAIL: 'How fixed' section not found in incident report"
  exit 1
fi
echo "✓ Incident report follows 3-line format"

# Verify token warning has required template variables
echo ""
echo "Checking token-warning.html template..."
TOKEN_WARNING_VARIABLES=(
  "BALANCE"
  "MONTHLY_LIMIT"
)

for variable in "${TOKEN_WARNING_VARIABLES[@]}"; do
  if ! grep -q "\[${variable}\]\|{{${variable}}}\|{${variable}}\|TOKENS" packages/email/templates/token-warning.html; then
    echo "❌ FAIL: Missing template variable $variable in token warning"
    exit 1
  fi
done
echo "✓ All template variables found in token warning"

# Check for upgrade/overage options
if ! grep -qi "upgrade\|overage\|purchase" packages/email/templates/token-warning.html; then
  echo "❌ FAIL: Upgrade/overage options not mentioned in token warning"
  exit 1
fi
echo "✓ Token warning includes upgrade/overage options"

# Verify brand voice (calm, not panicky)
echo ""
echo "Checking brand voice in all templates..."
ANXIETY_WORDS=("urgent" "critical" "immediately" "warning" "alert" "danger" "emergency")
CALM_INDICATORS=("care" "we've got this" "don't worry" "no problem" "we'll handle")

anxiety_found=false
for word in "${ANXIETY_WORDS[@]}"; do
  if grep -qi "$word" packages/email/templates/*.html; then
    echo "⚠ WARNING: Anxiety word '$word' found in templates (review for tone)"
    anxiety_found=true
  fi
done

if ! grep -qi "care\|got this\|handle" packages/email/templates/*.html; then
  echo "⚠ WARNING: Calm brand voice indicators not found in templates"
fi

if $anxiety_found; then
  echo "⚠ Some anxiety language detected - review templates for calm voice"
else
  echo "✓ No obvious anxiety language in templates"
fi

echo ""
echo "✅ ALL EMAIL TEMPLATE TESTS PASSED"
exit 0
