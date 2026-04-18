#!/bin/bash
# Test: Verify all required files exist
# Exit 0 on pass, non-zero on fail

set -e

LOCALGENIUS_DIR="/home/agent/localgenius"
FAILED=0

echo "===== File Existence Test ====="
echo "Checking that all Pulse files were created..."

# Database migrations
FILES=(
  "migrations/001_create_notifications_table.sql"
  "migrations/002_create_journal_entries_table.sql"
  "migrations/003_create_achievements_table.sql"
  "migrations/004_add_user_preferences.sql"
  "migrations/005_create_badge_definitions.sql"
  "migrations/006_create_analytics_tables.sql"
)

# Backend services
FILES+=(
  "src/services/notifications/email-sender.ts"
  "src/services/notifications/sms-sender.ts"
  "src/services/notifications/templates/insight.ts"
  "src/services/notifications/templates/badge.ts"
  "src/services/notifications/templates/quiet.ts"
  "src/services/notifications/templates/cliffhanger.ts"
  "src/jobs/notification-generator.ts"
  "src/jobs/scheduled-delivery.ts"
  "src/services/badges/checker.ts"
  "src/services/badges/image-generator.ts"
  "src/jobs/badge-checker.ts"
  "src/services/journal/prompt.ts"
  "src/services/journal/storage.ts"
  "src/services/trends/calculator.ts"
  "src/services/analytics/pulse-tracker.ts"
)

# API routes
FILES+=(
  "src/api/notifications.ts"
  "src/api/journal.ts"
  "src/api/achievements.ts"
  "src/api/analytics/pulse.ts"
)

# Frontend components
FILES+=(
  "src/components/NotificationPreferences.tsx"
  "src/components/BadgeUnlockModal.tsx"
  "src/components/BadgeGallery.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$LOCALGENIUS_DIR/$file" ]; then
    echo "✓ $file"
  else
    echo "✗ MISSING: $file"
    FAILED=1
  fi
done

# Check for email template directory
if [ -d "$LOCALGENIUS_DIR/src/services/notifications/templates/email" ]; then
  echo "✓ Email templates directory exists"
else
  echo "✗ MISSING: Email templates directory"
  FAILED=1
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "PASS: All required files exist"
  exit 0
else
  echo "FAIL: Some files are missing"
  exit 1
fi
