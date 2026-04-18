#!/bin/bash
# Test: Verify brand voice consistency (Steve's requirements)
# Exit 0 on pass, non-zero on fail

set -e

LOCALGENIUS_DIR="/home/agent/localgenius"
FAILED=0

echo "===== Brand Voice Consistency Test ====="
echo "Checking that notification templates use warm, human tone..."

TEMPLATES_DIR="$LOCALGENIUS_DIR/src/services/notifications/templates"

if [ ! -d "$TEMPLATES_DIR" ]; then
  echo "✗ Templates directory not found"
  exit 1
fi

# Pattern: Check for warm, human language
echo ""
echo "Checking for warm, human language indicators..."
WARM_INDICATORS=("you" "your" "we" "I'm" "People are" "You're")
FOUND_WARM=0

for indicator in "${WARM_INDICATORS[@]}"; do
  MATCHES=$(grep -ri "$indicator" "$TEMPLATES_DIR" 2>/dev/null || true)
  if [ ! -z "$MATCHES" ]; then
    FOUND_WARM=1
    echo "✓ Found warm language: '$indicator'"
  fi
done

if [ $FOUND_WARM -eq 0 ]; then
  echo "✗ No warm, human language indicators found in templates"
  FAILED=1
fi

# Pattern: Check for robotic/corporate language
echo ""
echo "Checking for robotic/corporate language (should NOT be present)..."
ROBOTIC_WORDS=("utilize" "pursuant to" "herein" "aforementioned" "optimize" "synergize" "leverage")
for word in "${ROBOTIC_WORDS[@]}"; do
  MATCHES=$(grep -ri "$word" "$TEMPLATES_DIR" 2>/dev/null || true)
  if [ ! -z "$MATCHES" ]; then
    echo "✗ Found robotic language '$word' (should be removed):"
    echo "$MATCHES"
    FAILED=1
  fi
done

# Pattern: Check that cliffhanger uses first-person (AI speaking)
echo ""
echo "Checking that cliffhanger uses first-person perspective..."
if [ -f "$TEMPLATES_DIR/cliffhanger.ts" ]; then
  CLIFFHANGER=$(cat "$TEMPLATES_DIR/cliffhanger.ts")

  if echo "$CLIFFHANGER" | grep -qi "I'm\|I am\|I'm trying\|I'm testing"; then
    echo "✓ Cliffhanger uses first-person (AI speaking)"
  else
    echo "✗ Cliffhanger does NOT use first-person perspective"
    FAILED=1
  fi

  # Check that cliffhanger never promises (uses "trying," "testing," not "will" or "promise")
  if echo "$CLIFFHANGER" | grep -qi "promise\|will definitely\|guaranteed"; then
    echo "✗ Cliffhanger makes promises (should be experimental tone)"
    FAILED=1
  else
    echo "✓ Cliffhanger doesn't make promises"
  fi
else
  echo "✗ cliffhanger.ts not found"
  FAILED=1
fi

# Pattern: Check that "all quiet" template is reassuring, not spammy
echo ""
echo "Checking that 'all quiet' notification is reassuring..."
if [ -f "$TEMPLATES_DIR/quiet.ts" ]; then
  QUIET=$(cat "$TEMPLATES_DIR/quiet.ts")

  # Should contain reassuring language
  if echo "$QUIET" | grep -qi "still\|steady\|watching\|monitoring\|here"; then
    echo "✓ 'All quiet' template is reassuring"
  else
    echo "✗ 'All quiet' template lacks reassurance"
    FAILED=1
  fi

  # Should NOT contain spammy language
  if echo "$QUIET" | grep -qi "check back\|visit now\|click here"; then
    echo "✗ 'All quiet' template contains spammy CTAs"
    FAILED=1
  else
    echo "✓ 'All quiet' template is not spammy"
  fi
else
  echo "✗ quiet.ts not found"
  FAILED=1
fi

# Pattern: Check badge messaging is celebratory
echo ""
echo "Checking that badge messages are celebratory..."
if [ -f "$LOCALGENIUS_DIR/migrations/005_create_badge_definitions.sql" ]; then
  BADGES=$(cat "$LOCALGENIUS_DIR/migrations/005_create_badge_definitions.sql")

  CELEBRATORY_WORDS=("!" "growing" "favorite" "strong" "ahead" "better")
  FOUND_CELEBRATORY=0

  for word in "${CELEBRATORY_WORDS[@]}"; do
    if echo "$BADGES" | grep -qi "$word"; then
      FOUND_CELEBRATORY=1
    fi
  done

  if [ $FOUND_CELEBRATORY -eq 1 ]; then
    echo "✓ Badge messages are celebratory"
  else
    echo "✗ Badge messages lack celebratory tone"
    FAILED=1
  fi
else
  echo "⚠ Badge definitions migration not found, skipping badge message check"
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "PASS: Brand voice is consistent (warm, human, Steve-approved tone)"
  exit 0
else
  echo "FAIL: Brand voice issues detected"
  exit 1
fi
