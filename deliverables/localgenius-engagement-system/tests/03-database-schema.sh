#!/bin/bash
# Test: Verify database schema is correct
# Exit 0 on pass, non-zero on fail

set -e

LOCALGENIUS_DIR="/home/agent/localgenius"
FAILED=0

echo "===== Database Schema Test ====="
echo "Checking that all migrations define correct schema..."

# Check notifications table
echo ""
echo "Checking notifications table migration..."
if [ -f "$LOCALGENIUS_DIR/migrations/001_create_notifications_table.sql" ]; then
  NOTIF_SQL=$(cat "$LOCALGENIUS_DIR/migrations/001_create_notifications_table.sql")

  # Required columns
  REQUIRED_COLS=("id" "user_id" "type" "content" "scheduled_for" "sent_at" "clicked" "created_at")
  for col in "${REQUIRED_COLS[@]}"; do
    if echo "$NOTIF_SQL" | grep -qi "$col"; then
      echo "✓ notifications.$col defined"
    else
      echo "✗ MISSING: notifications.$col"
      FAILED=1
    fi
  done

  # Check for index on (user_id, scheduled_for)
  if echo "$NOTIF_SQL" | grep -qi "index.*user_id.*scheduled_for"; then
    echo "✓ Index on (user_id, scheduled_for)"
  else
    echo "✗ MISSING: Index on (user_id, scheduled_for)"
    FAILED=1
  fi
else
  echo "✗ MISSING: 001_create_notifications_table.sql"
  FAILED=1
fi

# Check journal_entries table
echo ""
echo "Checking journal_entries table migration..."
if [ -f "$LOCALGENIUS_DIR/migrations/002_create_journal_entries_table.sql" ]; then
  JOURNAL_SQL=$(cat "$LOCALGENIUS_DIR/migrations/002_create_journal_entries_table.sql")

  REQUIRED_COLS=("id" "business_id" "week" "note" "created_at")
  for col in "${REQUIRED_COLS[@]}"; do
    if echo "$JOURNAL_SQL" | grep -qi "$col"; then
      echo "✓ journal_entries.$col defined"
    else
      echo "✗ MISSING: journal_entries.$col"
      FAILED=1
    fi
  done

  # Check for index on (business_id, week)
  if echo "$JOURNAL_SQL" | grep -qi "index.*business_id.*week"; then
    echo "✓ Index on (business_id, week)"
  else
    echo "✗ MISSING: Index on (business_id, week)"
    FAILED=1
  fi
else
  echo "✗ MISSING: 002_create_journal_entries_table.sql"
  FAILED=1
fi

# Check achievements table
echo ""
echo "Checking achievements table migration..."
if [ -f "$LOCALGENIUS_DIR/migrations/003_create_achievements_table.sql" ]; then
  ACHIEVE_SQL=$(cat "$LOCALGENIUS_DIR/migrations/003_create_achievements_table.sql")

  REQUIRED_COLS=("id" "user_id" "badge_type" "unlocked_at" "image_url" "shared")
  for col in "${REQUIRED_COLS[@]}"; do
    if echo "$ACHIEVE_SQL" | grep -qi "$col"; then
      echo "✓ achievements.$col defined"
    else
      echo "✗ MISSING: achievements.$col"
      FAILED=1
    fi
  done

  # Check for index on (user_id, badge_type, unlocked_at)
  if echo "$ACHIEVE_SQL" | grep -qi "index.*user_id.*badge_type"; then
    echo "✓ Index on (user_id, badge_type)"
  else
    echo "✗ MISSING: Index on (user_id, badge_type)"
    FAILED=1
  fi
else
  echo "✗ MISSING: 003_create_achievements_table.sql"
  FAILED=1
fi

# Check user preferences fields
echo ""
echo "Checking user preferences migration..."
if [ -f "$LOCALGENIUS_DIR/migrations/004_add_user_preferences.sql" ]; then
  PREFS_SQL=$(cat "$LOCALGENIUS_DIR/migrations/004_add_user_preferences.sql")

  REQUIRED_COLS=("sms_opt_in" "notification_time" "notification_frequency" "preferred_channels")
  for col in "${REQUIRED_COLS[@]}"; do
    if echo "$PREFS_SQL" | grep -qi "$col"; then
      echo "✓ users.$col defined"
    else
      echo "✗ MISSING: users.$col"
      FAILED=1
    fi
  done
else
  echo "✗ MISSING: 004_add_user_preferences.sql"
  FAILED=1
fi

# Check badge_definitions table
echo ""
echo "Checking badge_definitions table migration..."
if [ -f "$LOCALGENIUS_DIR/migrations/005_create_badge_definitions.sql" ]; then
  BADGE_DEF_SQL=$(cat "$LOCALGENIUS_DIR/migrations/005_create_badge_definitions.sql")

  REQUIRED_COLS=("badge_type" "threshold_metric" "threshold_value" "title" "message")
  for col in "${REQUIRED_COLS[@]}"; do
    if echo "$BADGE_DEF_SQL" | grep -qi "$col"; then
      echo "✓ badge_definitions.$col defined"
    else
      echo "✗ MISSING: badge_definitions.$col"
      FAILED=1
    fi
  done

  # Check for 5 badge inserts
  BADGE_COUNT=$(grep -ci "INSERT INTO badge_definitions" "$LOCALGENIUS_DIR/migrations/005_create_badge_definitions.sql" || echo 0)
  if [ "$BADGE_COUNT" -ge 5 ]; then
    echo "✓ At least 5 badges defined"
  else
    echo "✗ Less than 5 badges defined (found $BADGE_COUNT)"
    FAILED=1
  fi
else
  echo "✗ MISSING: 005_create_badge_definitions.sql"
  FAILED=1
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "PASS: Database schema is correct"
  exit 0
else
  echo "FAIL: Database schema has issues"
  exit 1
fi
