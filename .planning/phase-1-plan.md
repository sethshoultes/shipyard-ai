# Phase 1 Plan — LocalGenius Engagement System (Pulse)

**Generated:** 2026-04-18  
**Requirements:** /home/agent/shipyard-ai/.planning/REQUIREMENTS.md  
**Total Tasks:** 18  
**Waves:** 3  
**Estimated Duration:** 10-14 days

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Files Changed |
|-------------|---------|------|---------------|
| **Daily Notifications** | | | |
| REQ-001: Email infrastructure | phase-1-task-001 | 1 | +notifications/sender.js, +api/notifications.js |
| REQ-002: SMS via Twilio | phase-1-task-002 | 1 | +notifications/sms-sender.js, +api/sms.js |
| REQ-003: Midnight batch generator | phase-1-task-003 | 1 | +notifications/generator.js, +jobs/notification-batch.js |
| REQ-004: Scheduled delivery | phase-1-task-004 | 2 | +jobs/scheduled-delivery.js |
| REQ-005: "All Quiet" notifications | phase-1-task-005 | 2 | ~notifications/templates/quiet.js |
| REQ-006: Preferences UI | phase-1-task-006 | 2 | +components/NotificationPreferences.jsx, +api/preferences.js |
| **Milestone Badges** | | | |
| REQ-007: Badge detection | phase-1-task-007 | 1 | +badges/checker.js, +jobs/badge-checker.js |
| REQ-008: Badge definitions | phase-1-task-008 | 1 | +migrations/006_badge_definitions.sql |
| REQ-009: Badge image generation | phase-1-task-009 | 2 | +badges/image-generator.js, +jobs/badge-image-gen.js |
| REQ-010: Social share | phase-1-task-010 | 2 | +components/BadgeUnlockModal.jsx |
| REQ-011: Confetti animation | phase-1-task-011 | 2 | ~components/BadgeUnlockModal.jsx (CSS) |
| REQ-012: Badge gallery | phase-1-task-012 | 3 | +components/BadgeGallery.jsx, +api/achievements.js |
| **Journal & Trends** | | | |
| REQ-013: Journal prompt | phase-1-task-013 | 1 | +journal/prompt.js, ~digest/templates.js |
| REQ-014: Journal storage | phase-1-task-014 | 1 | +journal/storage.js, +api/journal.js |
| REQ-016: Trend narratives | phase-1-task-015 | 1 | +trends/calculator.js, ~digest/generator.js |
| REQ-020: Cliffhanger | phase-1-task-016 | 1 | +notifications/templates/cliffhanger.js |
| **Infrastructure** | | | |
| Database migrations | phase-1-task-017 | 1 | +migrations/*.sql |
| Analytics & tracking | phase-1-task-018 | 2 | +analytics/tracker.js |

---

## Wave Execution Order

### Wave 1: Foundation (Independent, Parallel Execution)
**Tasks:** 10  
**Duration:** 5-7 days  
**Parallelizable:** Yes

Tasks: phase-1-task-001, 002, 003, 007, 008, 013, 014, 015, 016, 017

### Wave 2: Integration (Depends on Wave 1)
**Tasks:** 6  
**Duration:** 4-5 days  
**Parallelizable:** Yes

Tasks: phase-1-task-004, 005, 006, 009, 010, 011, 018

### Wave 3: Polish (Depends on Wave 2)
**Tasks:** 2  
**Duration:** 1-2 days  
**Parallelizable:** Yes

Tasks: phase-1-task-012

---

## XML Task Plans


### Wave 1 (Parallel)

<task-plan id="phase-1-task-001" wave="1">
  <title>Email Notification Infrastructure Setup</title>
  <requirement>REQ-001: Establish email notification delivery system integrating with Resend</requirement>
  <description>
    Set up email notification sender that integrates with LocalGenius's existing Resend provider.
    Create notification sending infrastructure with error handling, delivery tracking, and retry logic.
    Supports inline templates for insight, badge, journal, and cliffhanger notifications.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/services/email.ts" reason="Existing Resend integration pattern to follow" />
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="notifications table schema (lines 186-196 in decisions.md)" />
    <file path="/home/agent/localgenius/package.json" reason="Verify resend dependency exists" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.1 - notification requirements" />
  </context>

  <steps>
    <step order="1">Create /src/services/notifications/email-sender.ts with sendNotificationEmail() function</step>
    <step order="2">Implement template rendering for 4 notification types (insight, badge, journal_prompt, cliffhanger)</step>
    <step order="3">Add error handling with exponential backoff retry (max 3 attempts)</step>
    <step order="4">Add delivery tracking: update notifications.sent_at timestamp on success</step>
    <step order="5">Create email templates in /src/services/notifications/templates/email/ directory</step>
    <step order="6">Add click tracking: append ?notification_id={id} to all email links</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "email.*notification"</check>
    <check type="manual">Send test notification to real email address, verify receipt within 60 seconds</check>
    <check type="manual">Verify click tracking updates notifications.clicked field</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(notifications): add email notification infrastructure

- Implement Resend-based email sender for Pulse notifications
- Add 4 notification templates (insight, badge, journal, cliffhanger)
- Include retry logic and delivery tracking
- Add click tracking for engagement metrics

Addresses REQ-001 from localgenius-engagement-system PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-002" wave="1">
  <title>SMS Notification via Twilio Setup</title>
  <requirement>REQ-002: Establish SMS notification delivery system via Twilio with TCPA compliance</requirement>
  <description>
    Integrate Twilio SMS provider for sending SMS notifications. Include explicit opt-in tracking,
    carrier deliverability monitoring, and cost tracking. Ensures TCPA compliance per Section II.5 decisions.
  </description>

  <context>
    <file path="/home/agent/localgenius/package.json" reason="Verify twilio dependency exists (line 46)" />
    <file path="/home/agent/localgenius/.env.example" reason="Check for Twilio credential placeholders" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.5 - SMS locked as must-have, Section V Risk 1" />
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="Add sms_opt_in field to users table" />
  </context>

  <steps>
    <step order="1">Create /src/services/notifications/sms-sender.ts with sendNotificationSMS() function</step>
    <step order="2">Add database migration for users.sms_opt_in boolean field (default false)</step>
    <step order="3">Implement Twilio client initialization with credentials from environment variables</step>
    <step order="4">Add opt-in check: only send SMS if user.sms_opt_in === true</step>
    <step order="5">Implement SMS template rendering (max 160 chars per message)</step>
    <step order="6">Add cost tracking: log each SMS sent with estimated cost ($0.03/message)</step>
    <step order="7">Create /src/api/settings/sms-opt-in route for user preference management</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "sms.*notification"</check>
    <check type="manual">Send test SMS to real phone number with opt-in=true, verify receipt</check>
    <check type="manual">Verify SMS NOT sent when opt-in=false</check>
    <check type="manual">Check Twilio dashboard shows successful delivery and cost</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(notifications): add SMS notification via Twilio

- Implement Twilio SMS sender with TCPA-compliant opt-in
- Add sms_opt_in field to users table
- Include cost tracking and delivery monitoring
- Create SMS template renderer (160 char limit)

Addresses REQ-002, Section II.5 decision (Steve wins - SMS in v1)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-003" wave="1">
  <title>Midnight UTC Batch Notification Generator</title>
  <requirement>REQ-003: Pre-compute daily notifications at midnight UTC to prevent 9am traffic spike</requirement>
  <description>
    Create midnight batch job that generates all notifications for the next day, stores them with
    scheduled_for timestamp, and queues for delivery at user's preferred time. Implements Elon's
    architecture decision from Section II.3 - prevents 9am bottleneck by pre-computing asynchronously.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="notifications table schema with scheduled_for field" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.3 - locked technical decision on batch approach" />
    <file path="/home/agent/shipyard-ai/deliverables/localgenius-benchmark-engine/jobs/daily-sync.ts" reason="Existing cron job pattern to follow" />
    <file path="/home/agent/localgenius/src/services/analytics/metrics.ts" reason="Data source for notification content generation" />
  </context>

  <steps>
    <step order="1">Create /src/jobs/notification-generator.ts with generateDailyNotifications() function</step>
    <step order="2">Query all active users with last_active_at within 90 days</step>
    <step order="3">For each user, fetch analytics data and determine if meaningful insight exists</step>
    <step order="4">Generate notification content: insight (if data exists) or "all quiet" (if no data)</step>
    <step order="5">Insert notification into notifications table with scheduled_for = user's preferred time (default 9am local)</step>
    <step order="6">Implement deduplication: check existing notifications for today before inserting</step>
    <step order="7">Add dead man's switch: log completion timestamp, alert if job doesn't finish by 1am UTC</step>
    <step order="8">Create Vercel cron config in vercel.json for daily midnight UTC execution</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "notification.*generator"</check>
    <check type="manual">Run generator manually for 100 test users, verify <2 minute completion time</check>
    <check type="manual">Check notifications table: exactly 1 notification per user, no duplicates</check>
    <check type="manual">Verify scheduled_for timestamps match user timezone preferences</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(notifications): add midnight UTC batch generator

- Implement pre-computed notification generation (Elon's architecture)
- Generate notifications at midnight UTC for next-day delivery
- Include deduplication logic to prevent duplicate notifications
- Add dead man's switch alert for job failure detection
- Configure Vercel cron for daily execution

Addresses REQ-003, Section II.3 locked decision

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-007" wave="1">
  <title>Badge Detection & Unlock Logic</title>
  <requirement>REQ-007: Implement milestone badge achievement detection system</requirement>
  <description>
    Create system that detects when users hit badge milestones (e.g., "500 visits" = Local Favorite badge).
    Runs daily as part of digest generation. Checks current metrics against badge thresholds and unlocks
    new achievements.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="achievements table schema (lines 209-216 in decisions.md)" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.2 - badge requirements, Open Question #2 for thresholds" />
    <file path="/home/agent/localgenius/src/services/analytics/metrics.ts" reason="Data source for milestone metrics" />
  </context>

  <steps>
    <step order="1">Create /src/services/badges/checker.ts with checkBadgeMilestones() function</step>
    <step order="2">Query user's current metrics: website_visits, reviews_managed, streak_weeks</step>
    <step order="3">Compare metrics against badge_definitions thresholds (from REQ-008)</step>
    <step order="4">For each unmet milestone that is now met, insert into achievements table</step>
    <step order="5">Prevent duplicate unlocks: check existing achievements before inserting</step>
    <step order="6">Return list of newly unlocked badges for notification generation</step>
    <step order="7">Create /src/jobs/badge-checker.ts cron job wrapper (runs daily after metrics update)</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "badge.*checker"</check>
    <check type="manual">Manually trigger badge checker for test user with 500 visits, verify "Local Favorite" unlocks</check>
    <check type="manual">Run checker again for same user, verify no duplicate badge</check>
    <check type="manual">Check achievements table: badge unlocked within 24 hours of metric reached</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(badges): add milestone badge detection system

- Implement badge unlock detection based on user metrics
- Check milestones: website visits, reviews managed, streak weeks
- Prevent duplicate badge unlocks with database check
- Add daily cron job for automated badge checking

Addresses REQ-007 from localgenius-engagement-system PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-008" wave="1">
  <title>Five Core Badge Definitions</title>
  <requirement>REQ-008: Define 5 milestone badge types with thresholds and celebratory messaging</requirement>
  <description>
    Create badge definitions with unlock criteria, visual messaging, and celebratory copy. Badges: 
    Getting Started, Review Responder, Local Favorite, Destination Dining, Consistent. Thresholds
    calibrated per Open Question #2 (must be validated with data before implementation).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.2 - badge requirements, Open Question #2 for threshold decisions" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-engagement-system.md" reason="Table at line 112-122 with badge definitions" />
  </context>

  <steps>
    <step order="1">Create database migration /migrations/006_badge_definitions.sql</step>
    <step order="2">Create badge_definitions table with fields: badge_type, threshold_metric, threshold_value, title, message, icon_url</step>
    <step order="3">Insert 5 badge definitions (PENDING Open Question #2 resolution):</step>
    <step order="4">  - "getting_started": First week completed, "Your first week! You're already ahead of most restaurants."</step>
    <step order="5">  - "review_responder": 50 reviews managed, "50 reviews, 50 thoughtful responses. Your reputation is growing."</step>
    <step order="6">  - "local_favorite": 500 website visitors, "500 visits! You're becoming a neighborhood go-to."</step>
    <step order="7">  - "destination_dining": 1000 website visitors, "1000 visits. People are seeking you out."</step>
    <step order="8">  - "consistent": 4-week streak, "4 weeks of engagement. Consistency builds trust."</step>
    <step order="9">Copy must be reviewed by Steve for brand voice approval</step>
  </steps>

  <verification>
    <check type="build">npm run db:migrate</check>
    <check type="manual">Query badge_definitions table, verify 5 badges inserted with correct thresholds</check>
    <check type="manual">Verify Steve has approved all badge messaging copy</check>
    <check type="manual">Check that thresholds are calibrated (not too easy, not impossible) based on existing user data</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(badges): define 5 core milestone badges

- Create badge_definitions table and migration
- Insert 5 badges: getting_started, review_responder, local_favorite, destination_dining, consistent
- Include warm, celebratory messaging per Steve's brand voice
- Thresholds calibrated based on user data analysis

Addresses REQ-008, resolves Open Question #2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-013" wave="1">
  <title>Weekly Journal Prompt Notification</title>
  <requirement>REQ-013: Generate weekly journal prompt notification asking "What worked this week?"</requirement>
  <description>
    Send weekly prompt (Sunday evening or Monday morning per user timezone) asking "What worked this week?"
    Inline in weekly digest email. Includes skip option but tracks completion for product iteration.
    Creates proprietary training data per Jensen's moat argument.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.3 - journal as must-have, Jensen endorsement in Section 10" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-engagement-system.md" reason="Section 4.2 - journal mechanics and UI" />
    <file path="/home/agent/localgenius/src/services/digest/generator.ts" reason="Existing weekly digest generation to integrate with" />
  </context>

  <steps>
    <step order="1">Create /src/services/journal/prompt.ts with generateJournalPrompt() function</step>
    <step order="2">Add journal prompt to weekly digest template (inline, not separate email)</step>
    <step order="3">Include simple text input field in digest email for one-tap response</step>
    <step order="4">Add "Skip" button that logs skip event to analytics</step>
    <step order="5">Create journal prompt notification type in notifications table</step>
    <step order="6">Schedule journal prompt for Sunday evening or Monday morning per user timezone</step>
    <step order="7">Track completion rate: log journal_prompt_shown and journal_entry_created events</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "journal.*prompt"</check>
    <check type="manual">Trigger weekly digest for test user, verify journal prompt appears inline</check>
    <check type="manual">Submit journal entry via digest email, verify entry saved to database</check>
    <check type="manual">Check analytics: journal prompt completion rate >40%</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(journal): add weekly journal prompt to digest

- Implement weekly journal prompt inline in digest email
- Add "What worked this week?" question with text input
- Include skip tracking for product iteration
- Schedule for Sunday evening/Monday morning per user timezone

Addresses REQ-013, Jensen's moat strategy (Section 10)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-014" wave="1">
  <title>Journal Entry Storage & CRUD</title>
  <requirement>REQ-014: Implement journal entry persistence and retrieval system</requirement>
  <description>
    Create system to store user's journal entries, append-only. Support create, read (single entry + 
    history view), update (add notes to existing entry), delete (soft delete). Provides foundation
    for proprietary training data pipeline.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="journal_entries table schema (lines 198-206 in decisions.md)" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.3 - journal requirements" />
  </context>

  <steps>
    <step order="1">Create database migration for journal_entries table: business_id, week, tags[], note, created_at</step>
    <step order="2">Add index on (business_id, week) for efficient queries</step>
    <step order="3">Create /src/services/journal/storage.ts with CRUD functions</step>
    <step order="4">Implement createJournalEntry(businessId, week, note) function</step>
    <step order="5">Implement getJournalEntry(businessId, week) function</step>
    <step order="6">Implement getJournalHistory(businessId, limit) function for historical entries</step>
    <step order="7">Implement updateJournalEntry(id, note) function for adding notes</step>
    <step order="8">Implement softDeleteJournalEntry(id) function (sets deleted_at timestamp)</step>
    <step order="9">Create /src/api/journal routes for API access</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck && npm run db:migrate</check>
    <check type="test">npm run test -- --grep "journal.*storage"</check>
    <check type="manual">Create journal entry via API, verify stored in database</check>
    <check type="manual">Retrieve journal history, verify returns all entries in chronological order</check>
    <check type="manual">Query single entry, verify <100ms response time</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(journal): add journal entry storage and CRUD

- Create journal_entries table with migration
- Implement CRUD operations: create, read, update, soft delete
- Add API routes for journal entry management
- Include efficient indexing for query performance

Addresses REQ-014 from localgenius-engagement-system PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-015" wave="1">
  <title>Trend Narratives with Week-over-Week Comparisons</title>
  <requirement>REQ-016: Add week-over-week percentage deltas to metrics in weekly digest</requirement>
  <description>
    Enhance weekly digest with % change for each metric vs. previous week. Example: "340 website visits 
    (up 22% from last week)". Uses SQL window functions (LAG/LEAD) for calculation. Replaces snapshot
    metrics with stories per Section II.7.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/services/digest/generator.ts" reason="Existing digest generation to enhance" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.4 - trend narrative requirements" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-engagement-system.md" reason="Section 4.4 - examples of trend narratives" />
  </context>

  <steps>
    <step order="1">Create /src/services/trends/calculator.ts with calculateTrends() function</step>
    <step order="2">Query metrics for current week and previous week using SQL window functions</step>
    <step order="3">Calculate WoW percentage delta: ((current - previous) / previous) * 100</step>
    <step order="4">Handle edge cases: zero baseline (show absolute value), missing data (skip comparison)</step>
    <step order="5">Format trend narrative: "340 visits (up 22% from last week)" or "down 15%" or "unchanged"</step>
    <step order="6">Add sparkline generation for visual trend representation (optional)</step>
    <step order="7">Integrate trend calculator into weekly digest generation</step>
    <step order="8">Ensure trend calculations complete in <500ms</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "trend.*calculator"</check>
    <check type="manual">Generate digest for test user with known metrics, verify WoW % is correct</check>
    <check type="manual">Test edge case: user with zero visits previous week, verify correct handling</check>
    <check type="manual">Measure trend calculation time, verify <500ms for 10 metrics</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(trends): add week-over-week trend narratives

- Implement trend calculator with WoW percentage deltas
- Use SQL window functions for efficient metric comparison
- Handle edge cases: zero baseline, missing data
- Integrate trend narratives into weekly digest
- Performance optimized: <500ms calculation time

Addresses REQ-016, Section II.4 (turn data into stories)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-016" wave="1">
  <title>Weekly Cliffhanger Template & Copy</title>
  <requirement>REQ-020: Create weekly cliffhanger content at end of digest email</requirement>
  <description>
    Add 1-2 sentence forward hook to end of weekly digest. Examples: "Next week, I'm trying a different 
    post style. I'll let you know if it works." Tone: First person (AI speaking), curious, experimental, 
    never promises. Per Shonda Rhimes endorsement: "turns a report into a story."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.5 - cliffhanger requirements, Shonda's endorsement" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-engagement-system.md" reason="Section 4.5 - cliffhanger examples and tone" />
    <file path="/home/agent/localgenius/src/services/digest/templates.ts" reason="Digest template to append cliffhanger to" />
  </context>

  <steps>
    <step order="1">Create /src/services/notifications/templates/cliffhanger.ts with generateCliffhanger() function</step>
    <step order="2">Create 5-10 cliffhanger templates with placeholders for context</step>
    <step order="3">  Example: "Next week, I'm trying a different post style. I'll let you know if it works."</step>
    <step order="4">  Example: "I noticed competitors are doing X. I'm going to test something."</step>
    <step order="5">  Example: "Your best week was [date]. I'm studying what worked."</step>
    <step order="6">Implement context-aware selection logic based on user's journal notes, achievements, trends</step>
    <step order="7">Append cliffhanger to end of weekly digest template (after all metrics)</step>
    <step order="8">Ensure tone is first-person, curious, never promises (uses "testing," "trying")</step>
    <step order="9">Submit all cliffhanger copy to Steve for brand voice approval</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "cliffhanger"</check>
    <check type="manual">Generate digest with cliffhanger, verify appears at end of email</check>
    <check type="manual">Verify tone is warm, first-person, creates anticipation</check>
    <check type="manual">Confirm Steve has approved all cliffhanger copy</check>
    <check type="manual">A/B test: measure re-engagement rate with vs. without cliffhanger</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(cliffhanger): add weekly cliffhanger to digest

- Implement cliffhanger generator with context-aware templates
- Add 5-10 cliffhanger templates in warm, first-person tone
- Append cliffhanger to end of weekly digest email
- Copy approved by Steve for brand voice consistency

Addresses REQ-020, Shonda Rhimes endorsement (Section 10)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-017" wave="1">
  <title>Database Migrations for Pulse Tables</title>
  <requirement>Database schema changes for notifications, journal_entries, achievements tables</requirement>
  <description>
    Create all database migrations for Pulse 3-table architecture per Elon's locked decision (Section II.2).
    Includes notifications table, journal_entries table, achievements table, and supporting indexes.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="Existing schema to extend" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section III - complete table definitions (lines 186-217)" />
    <file path="/home/agent/localgenius/drizzle.config.ts" reason="Migration configuration" />
  </context>

  <steps>
    <step order="1">Create /migrations/001_create_notifications_table.sql</step>
    <step order="2">  Add fields: id, user_id, type, content, scheduled_for, sent_at, clicked, created_at</step>
    <step order="3">  Add index on (user_id, scheduled_for) for efficient queue queries</step>
    <step order="4">Create /migrations/002_create_journal_entries_table.sql</step>
    <step order="5">  Add fields: id, business_id, week, tags[], note, created_at</step>
    <step order="6">  Add index on (business_id, week) for efficient queries</step>
    <step order="7">Create /migrations/003_create_achievements_table.sql</step>
    <step order="8">  Add fields: id, user_id, badge_type, unlocked_at, image_url, shared</step>
    <step order="9">  Add index on (user_id, badge_type, unlocked_at)</step>
    <step order="10">Create /migrations/004_add_user_preferences.sql</step>
    <step order="11">  Add fields to users: sms_opt_in, notification_time, notification_frequency, preferred_channels</step>
    <step order="12">Run all migrations via npm run db:migrate</step>
  </steps>

  <verification>
    <check type="build">npm run db:migrate</check>
    <check type="manual">Query database schema, verify all 3 tables exist with correct columns</check>
    <check type="manual">Verify indexes created correctly via EXPLAIN queries</check>
    <check type="manual">Check foreign key constraints are valid</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(database): add Pulse 3-table schema migrations

- Create notifications table with scheduled delivery support
- Create journal_entries table for proprietary training data
- Create achievements table for milestone badges
- Add user preference fields for notification settings
- Include efficient indexes for query performance

Addresses Elon's locked architecture decision (Section II.2)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

### Wave 2 (Parallel, after Wave 1)

<task-plan id="phase-1-task-004" wave="2">
  <title>Scheduled Notification Delivery Queue</title>
  <requirement>REQ-004: Flush pre-computed notifications to users at their preferred time</requirement>
  <description>
    Queue system that takes pre-computed notifications from notifications table and delivers them at 
    user's preferred scheduled_for timestamp. Respects user timezone preferences. Runs every 10 minutes
    to find notifications ready for delivery.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/services/notifications/email-sender.ts" reason="Email sender from task-001" />
    <file path="/home/agent/localgenius/src/services/notifications/sms-sender.ts" reason="SMS sender from task-002" />
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="notifications table with scheduled_for field" />
  </context>

  <steps>
    <step order="1">Create /src/jobs/scheduled-delivery.ts with flushNotificationQueue() function</step>
    <step order="2">Query notifications table: WHERE scheduled_for <= NOW() AND sent_at IS NULL</step>
    <step order="3">For each notification, determine delivery channel (email, SMS, or both)</step>
    <step order="4">Call appropriate sender function (email-sender.ts or sms-sender.ts)</step>
    <step order="5">Update sent_at timestamp on successful delivery</step>
    <step order="6">Handle partial failure: if email succeeds but SMS fails, still mark email as sent</step>
    <step order="7">Configure Vercel cron to run this job every 10 minutes</step>
    <step order="8">Add monitoring: alert if queue grows >1000 pending notifications</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "scheduled.*delivery"</check>
    <check type="manual">Insert test notification with scheduled_for = NOW(), wait 10 minutes, verify delivery</check>
    <check type="manual">Verify delivery within 5 minutes of scheduled_for timestamp</check>
    <check type="manual">Check user timezone conversion accuracy (off by <1 minute)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Requires email sender" />
    <depends-on task-id="phase-1-task-002" reason="Requires SMS sender" />
    <depends-on task-id="phase-1-task-003" reason="Requires batch generator to populate queue" />
  </dependencies>

  <commit-message>feat(notifications): add scheduled delivery queue

- Implement 10-minute cron job to flush notification queue
- Deliver notifications at user's preferred scheduled_for time
- Handle multi-channel delivery (email + SMS)
- Add monitoring for queue backlog alerts

Addresses REQ-004 from localgenius-engagement-system PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-005" wave="2">
  <title>"All Quiet" Reassurance Notification</title>
  <requirement>REQ-005: Generate reassurance notifications when no meaningful insights exist</requirement>
  <description>
    When user's business has no new activities/metrics to report, send warm "All quiet today" notification
    instead of silence. Communicates that system is still monitoring. Include frequency cap (max 2x/week)
    per Open Question #3 recommendation.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/jobs/notification-generator.ts" reason="Batch generator from task-003 to integrate with" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.6 - Steve wins, 'all quiet' is reassurance" />
  </context>

  <steps>
    <step order="1">Create /src/services/notifications/templates/quiet.ts with generateQuietNotification() function</step>
    <step order="2">Add "all quiet" notification type to notifications table enum</step>
    <step order="3">In notification generator, check if user has zero significant metrics for the day</step>
    <step order="4">Check last_quiet_notification_sent timestamp: only send if >3 days ago (2x/week cap)</step>
    <step order="5">Generate warm copy: "All quiet today — your business is steady. I'm still here."</step>
    <step order="6">Update last_quiet_notification_sent timestamp in user preferences</step>
    <step order="7">Track "all quiet" open rate separately from insight notifications</step>
    <step order="8">Submit copy to Steve for brand voice approval</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck</check>
    <check type="test">npm run test -- --grep "quiet.*notification"</check>
    <check type="manual">Trigger generator for user with zero activity, verify "all quiet" notification generated</check>
    <check type="manual">Run generator 5 days in a row for same user, verify max 2 "all quiet" notifications sent</check>
    <check type="manual">Check analytics: >30% open rate on "all quiet" messages</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-003" reason="Integrates into batch generator logic" />
  </dependencies>

  <commit-message>feat(notifications): add "all quiet" reassurance notification

- Implement reassurance notification for zero-activity days
- Add frequency cap: max 2x/week per user
- Include warm, non-spammy copy per Steve's brand voice
- Track open rates separately from insight notifications

Addresses REQ-005, Section II.6 (Steve wins - reassurance not spam)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-006" wave="2">
  <title>Notification Preference Settings Screen</title>
  <requirement>REQ-006: Create minimal notification preferences UI (3-5 toggles)</requirement>
  <description>
    Add settings screen allowing users to control notification delivery without creating decision fatigue.
    Include: Time of day, Email vs SMS channel, Frequency (daily vs weekly digest only). Per Section II.8
    compromise: sensible defaults, 3-5 toggles max, not a "preference center."
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components/settings" reason="Existing settings components pattern" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.8 - minimal settings locked decision" />
  </context>

  <steps>
    <step order="1">Create /src/components/NotificationPreferences.jsx settings panel component</step>
    <step order="2">Add time picker: notification_time (default 9am local), dropdown with hourly options</step>
    <step order="3">Add frequency dropdown: notification_frequency (daily, weekly digest only)</step>
    <step order="4">Add channel checkboxes: preferred_channels (email, SMS, both) with SMS opt-in disclaimer</step>
    <step order="5">Create /src/api/settings/notification-preferences route (GET/POST)</step>
    <step order="6">Persist preferences to users table (fields added in task-017 migration)</step>
    <step order="7">Add unsubscribe link at bottom: "Pause all notifications" option</step>
    <step order="8">Ensure UI is clean, minimal, no decision fatigue (3 settings total)</step>
  </steps>

  <verification>
    <check type="build">npm run build && npm run typecheck</check>
    <check type="test">npm run test -- --grep "notification.*preferences"</check>
    <check type="manual">Open settings panel, change notification time to 7pm, verify saved to database</check>
    <check type="manual">Toggle SMS off, verify no SMS sent in next notification</check>
    <check type="manual">Check unsubscribe rate stays <5% after launching preferences UI</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Must work with email notification system" />
    <depends-on task-id="phase-1-task-002" reason="Must work with SMS notification system" />
    <depends-on task-id="phase-1-task-017" reason="Requires user preference fields in database" />
  </dependencies>

  <commit-message>feat(settings): add notification preference UI

- Create minimal settings panel with 3-5 toggles (no decision fatigue)
- Add time picker, frequency dropdown, channel checkboxes
- Include SMS opt-in disclaimer for TCPA compliance
- Add unsubscribe/pause option
- User preferences persist and affect notification delivery

Addresses REQ-006, Section II.8 (Steve + Elon compromise)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-009" wave="2">
  <title>Async Badge Image Generation</title>
  <requirement>REQ-009: Generate shareable OG images for badge unlocks asynchronously</requirement>
  <description>
    When badge is unlocked, asynchronously generate a branded social media shareable card (OG image) with 
    badge graphic, user's stats, and LocalGenius branding. Store in S3/CDN. Per Section II.12 locked decision:
    Elon wins on async generation for performance.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/services/badges/checker.ts" reason="Badge checker from task-007" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.12 - async generation locked" />
    <file path="/home/agent/localgenius/package.json" reason="Check for image generation dependencies (canvas, sharp)" />
  </context>

  <steps>
    <step order="1">Create /src/services/badges/image-generator.ts with generateBadgeImage() function</step>
    <step order="2">Install image generation dependencies if needed: @vercel/og or canvas</step>
    <step order="3">Design badge card template: 1200x630px OG image with badge icon, stats, branding</step>
    <step order="4">Generate image asynchronously when achievement unlocked (triggered by badge checker)</step>
    <step order="5">Upload generated image to S3 or Cloudflare R2</step>
    <step order="6">Store image URL in achievements.image_url field</step>
    <step order="7">Add fallback: if custom generation fails, serve generic badge image</step>
    <step order="8">Cache generated images in CDN for fast serving</step>
    <step order="9">Create /src/jobs/badge-image-gen.ts for async job queue</step>
  </steps>

  <verification>
    <check type="build">npm run build && npm run typecheck</check>
    <check type="test">npm run test -- --grep "badge.*image"</check>
    <check type="manual">Unlock test badge, verify OG image generated within 5 minutes</check>
    <check type="manual">Check image resolution suitable for Instagram/Facebook (1200x630px)</check>
    <check type="manual">Verify fallback generic image served if custom generation fails</check>
    <check type="manual">Test image generation latency <2 seconds per badge</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-007" reason="Requires badge checker to trigger image generation" />
    <depends-on task-id="phase-1-task-008" reason="Requires badge definitions for image content" />
  </dependencies>

  <commit-message>feat(badges): add async badge image generation

- Implement OG image generator for shareable badge cards
- Generate 1200x630px images with badge icon, stats, branding
- Upload to S3/R2 and cache in CDN
- Add fallback generic image for generation failures
- Async generation prevents unlock latency

Addresses REQ-009, Section II.12 (Elon wins - async approach)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-010" wave="2">
  <title>One-Tap Badge Share to Social</title>
  <requirement>REQ-010: Implement one-tap sharing of badge achievements to Instagram/Facebook</requirement>
  <description>
    Add share button to badge unlock celebration modal that pre-fills social share text and opens native
    share UI. Pre-filled copy is warm, celebratory, not overly salesy. Tracks share events for growth
    metrics validation.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components" reason="Existing React component patterns" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section II.4 - badges must-have for viral growth" />
  </context>

  <steps>
    <step order="1">Create /src/components/BadgeUnlockModal.jsx celebration modal component</step>
    <step order="2">Display badge icon, title, and celebratory message when badge unlocks</step>
    <step order="3">Add share button that opens native share UI (Web Share API)</step>
    <step order="4">Pre-fill share text: "Just hit 1000 website visitors with @LocalGenius 🚀"</step>
    <step order="5">Include badge OG image URL from achievements.image_url (task-009)</step>
    <step order="6">Make pre-filled text editable by user before sharing</step>
    <step order="7">Track share events: POST to /api/achievements/{id}/share when user clicks share</step>
    <step order="8">Update achievements.shared=true and achievements.shared_at timestamp</step>
    <step order="9">Fallback for browsers without Web Share API: copy link to clipboard</step>
  </steps>

  <verification>
    <check type="build">npm run build && npm run typecheck</check>
    <check type="test">npm run test -- --grep "badge.*share"</check>
    <check type="manual">Unlock test badge, verify celebration modal appears with share button</check>
    <check type="manual">Click share button, verify native share UI opens with pre-filled text</check>
    <check type="manual">Share to social platform, verify share event logged in database</check>
    <check type="manual">Check analytics: >10% of badge unlocks result in social share</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-007" reason="Requires badge unlock detection" />
    <depends-on task-id="phase-1-task-008" reason="Requires badge definitions for copy" />
    <depends-on task-id="phase-1-task-009" reason="Requires badge OG images" />
  </dependencies>

  <commit-message>feat(badges): add one-tap social sharing

- Create badge unlock celebration modal with share button
- Pre-fill share text with warm, celebratory copy
- Use Web Share API for native platform sharing
- Track share events for growth metrics
- User can edit pre-filled text before sharing

Addresses REQ-010, Section II.4 (shareable badges must-have)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-011" wave="2">
  <title>Confetti Animation on Badge Unlock</title>
  <requirement>REQ-011: Add celebratory confetti animation to badge unlock experience</requirement>
  <description>
    When user unlocks a badge, display modal with confetti animation and warm messaging to create dopamine
    hit and make achievement feel special. Per Section II.2: Steve's celebratory design for emotional peaks.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components/BadgeUnlockModal.jsx" reason="Modal from task-010 to add animation to" />
  </context>

  <steps>
    <step order="1">Add confetti animation library: canvas-confetti or react-confetti</step>
    <step order="2">Trigger confetti animation when BadgeUnlockModal opens</step>
    <step order="3">Configure animation: 2-3 second duration, colorful particles, celebratory feel</step>
    <step order="4">Ensure animation doesn't block user interaction (non-blocking)</step>
    <step order="5">Add dismiss button: user can close modal with one tap</step>
    <step order="6">Optimize performance: animation maintains >60fps on mobile</step>
    <step order="7">Add accessibility: motion-reduced media query disables animation for users with vestibular disorders</step>
  </steps>

  <verification>
    <check type="build">npm run build</check>
    <check type="manual">Unlock test badge, verify confetti animation plays smoothly</check>
    <check type="manual">Check animation duration is 2-3 seconds (not too long)</check>
    <check type="manual">Verify user can dismiss modal with one tap</check>
    <check type="manual">Test on mobile device: animation maintains >60fps</check>
    <check type="manual">Enable prefers-reduced-motion, verify animation disabled</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-010" reason="Requires BadgeUnlockModal component" />
  </dependencies>

  <commit-message>feat(badges): add confetti animation to unlock

- Add celebratory confetti animation when badge unlocks
- Configure 2-3 second duration with colorful particles
- Ensure >60fps performance on mobile
- Add accessibility: respect prefers-reduced-motion
- Non-blocking: user can dismiss modal immediately

Addresses REQ-011, Steve's emotional peak design (Section II.2)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-018" wave="2">
  <title>Analytics & Tracking Infrastructure</title>
  <requirement>REQ-029 through REQ-032: Notification, badge, journal, and upgrade prompt analytics</requirement>
  <description>
    Create comprehensive tracking and analytics for all Pulse features. Track notification metrics (send, 
    open, click, unsubscribe), badge metrics (unlock, share), journal metrics (prompt, completion), and
    upgrade prompt metrics (impression, click, conversion). Enables product iteration and risk monitoring.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/services/analytics" reason="Existing analytics patterns" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md" reason="Section VI - success metrics" />
  </context>

  <steps>
    <step order="1">Create /src/services/analytics/pulse-tracker.ts with tracking functions</step>
    <step order="2">Add notification tracking: opened_at, clicked_at, clicked_url fields to notifications table</step>
    <step order="3">Track badge metrics: create badge_analytics table with unlock_rate, share_rate</step>
    <step order="4">Track journal metrics: create journal_analytics table with prompt_shown, completed, skipped</step>
    <step order="5">Track upgrade prompts: create upgrade_prompt_analytics table with shown_at, clicked_at, converted_at</step>
    <step order="6">Create aggregation job: daily rollup of all Pulse metrics</step>
    <step order="7">Create /src/api/analytics/pulse endpoint for dashboard queries</step>
    <step order="8">Add real-time alerts: unsubscribe rate >10%, open rate <20%, share rate <5%</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck && npm run db:migrate</check>
    <check type="test">npm run test -- --grep "analytics.*tracker"</check>
    <check type="manual">Send test notification, click link, verify click tracked in database</check>
    <check type="manual">Unlock badge, share to social, verify share tracked</check>
    <check type="manual">Query analytics dashboard, verify real-time metrics available</check>
    <check type="manual">Check alerts trigger correctly when thresholds exceeded</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Tracks email notifications" />
    <depends-on task-id="phase-1-task-002" reason="Tracks SMS notifications" />
    <depends-on task-id="phase-1-task-007" reason="Tracks badge unlocks" />
    <depends-on task-id="phase-1-task-013" reason="Tracks journal prompts" />
  </dependencies>

  <commit-message>feat(analytics): add Pulse tracking infrastructure

- Implement comprehensive tracking for all Pulse features
- Track notification metrics: send, open, click, unsubscribe
- Track badge metrics: unlock, share rate
- Track journal metrics: prompt completion
- Track upgrade prompt metrics: impression, conversion
- Add daily aggregation job and real-time alerts

Addresses REQ-029 through REQ-032 from PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

### Wave 3 (Parallel, after Wave 2)

<task-plan id="phase-1-task-012" wave="3">
  <title>Badge Gallery in Account Settings</title>
  <requirement>REQ-012: Create badge collection display in user settings</requirement>
  <description>
    Add section to account settings showing all unlocked badges (and locked/upcoming badges as greyed out).
    Browsable, shareable collection of achievements. Each badge card shows unlock date and has share button.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components/settings" reason="Existing settings components" />
    <file path="/home/agent/localgenius/src/services/badges/checker.ts" reason="Badge data source" />
  </context>

  <steps>
    <step order="1">Create /src/components/BadgeGallery.jsx gallery component</step>
    <step order="2">Query all badges: both unlocked (from achievements) and locked (from badge_definitions)</step>
    <step order="3">Display badges in grid layout with badge icon, title, unlock date (or "Locked")</step>
    <step order="4">For locked badges, show progression: "350/500 visits — 70% to Local Favorite"</step>
    <step order="5">Add share button to each unlocked badge card</step>
    <step order="6">Create /src/api/achievements/gallery endpoint: returns locked + unlocked badges</step>
    <step order="7">Optimize query performance: gallery loads in <1 second</step>
    <step order="8">Add badge collection page route: /settings/badges</step>
  </steps>

  <verification>
    <check type="build">npm run build && npm run typecheck</check>
    <check type="test">npm run test -- --grep "badge.*gallery"</check>
    <check type="manual">Open badge gallery, verify all badges displayed (locked + unlocked)</check>
    <check type="manual">Check locked badges show progression toward unlock</check>
    <check type="manual">Click share button on unlocked badge, verify share UI opens</check>
    <check type="manual">Measure gallery load time, verify <1 second</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-007" reason="Requires badge unlock data" />
    <depends-on task-id="phase-1-task-008" reason="Requires badge definitions" />
    <depends-on task-id="phase-1-task-009" reason="Requires badge images" />
    <depends-on task-id="phase-1-task-010" reason="Requires share functionality" />
  </dependencies>

  <commit-message>feat(badges): add badge gallery to settings

- Create browsable badge collection in account settings
- Display locked + unlocked badges in grid layout
- Show progression toward locked badges (e.g., "350/500 visits")
- Add share button to each unlocked badge
- Optimize query performance: <1 second load time

Addresses REQ-012 from localgenius-engagement-system PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

### Infrastructure Dependencies (HIGH PRIORITY)

**BLOCKER:** 4 decision blockers must be resolved before Wave 1 execution:

1. **SMS Provider Choice** (Open Question #1)
   - **Impact:** Blocks task-002 (SMS infrastructure)
   - **Recommendation:** Twilio for delivery quality
   - **Cost Model:** 10K users × 30 SMS/mo × $0.03 = $9K/month
   - **Decision Needed:** Choose provider and approve budget

2. **Badge Milestone Thresholds** (Open Question #2)
   - **Impact:** Blocks task-008 (badge definitions)
   - **Recommendation:** Validate with existing user data before setting thresholds
   - **Example:** 500 visits = Local Favorite (must confirm this is achievable but not too easy)
   - **Decision Needed:** Data analysis to calibrate thresholds

3. **"All Quiet" Frequency Cap** (Open Question #3)
   - **Impact:** Blocks task-005 ("all quiet" notifications)
   - **Recommendation:** Max 2x/week to prevent over-communication
   - **Decision Needed:** Steve + Elon approval on frequency

4. **Notification Timing** (Open Question #4)
   - **Impact:** Blocks task-006 (preferences UI)
   - **Recommendation:** Default 9am local, user override in settings
   - **Decision Needed:** Product decision on default vs. customization balance

### Technical Risks

1. **Midnight Batch Job Failure** (Section V Risk 4)
   - **Mitigation:** Dead man's switch in task-003, redundancy at 2am UTC
   - **Alert:** If job doesn't complete by 1am UTC

2. **SMS Compliance** (Section V Risk 1)
   - **Mitigation:** Explicit opt-in in task-002, TCPA-compliant templates
   - **Monitoring:** Track delivery rates, carrier filtering

3. **Badge Image Generation Latency** (Section V Risk 3)
   - **Mitigation:** Async generation in task-009, fallback generic image
   - **Target:** <5min generation, <2sec per image

4. **Notification Fatigue** (Section V Risk 2)
   - **Mitigation:** Frequency caps in task-005, unsubscribe flow in task-006
   - **Target:** <5% unsubscribe rate

### Codebase-Specific Risks (from Risk Scanner Report)

**Critical Finding:** LocalGenius has 4 major infrastructure gaps:

1. **SMS/Twilio Integration** — Zero code exists; needs 2-3 days (task-002)
2. **Email Service (SendGrid)** — Not configured; needs 2 days (task-001)
3. **Cron/Scheduler Infrastructure** — Needs external scheduler setup (Vercel cron recommended)
4. **Badge Image Generation** — No generation code; needs 2 days (task-009)

**Timeline Impact:** 2-week ship date is AT RISK unless infrastructure work (tasks 001, 002, 003, 009) happens in parallel during Wave 1.

---

## Execution Strategy

### Parallel Execution Plan

**Wave 1 (Days 1-7):**
- Run tasks 001, 002, 003 in parallel (infrastructure foundation)
- Run tasks 007, 008, 013, 014, 015, 016, 017 in parallel (feature foundations)
- **Critical Path:** task-003 (batch generator) must complete before Wave 2

**Wave 2 (Days 8-12):**
- Run tasks 004, 005, 006 in parallel (notification delivery)
- Run tasks 009, 010, 011 in parallel (badge features)
- Run task-018 (analytics) in parallel
- **Critical Path:** task-009 (badge images) must complete before Wave 3

**Wave 3 (Days 13-14):**
- Run task-012 (badge gallery) — polish and UI
- QA, testing, launch preparation

### Resource Allocation

**Backend Engineers (2):**
- Engineer A: tasks 001, 002, 003, 004, 005 (notification pipeline)
- Engineer B: tasks 007, 008, 009, 013, 014, 015, 016 (badges, journal, trends)

**Frontend Engineers (1):**
- Engineer C: tasks 006, 010, 011, 012 (UI components)

**Database Engineer (1):**
- Engineer D: task-017 (migrations), supports all teams

**DevOps (1):**
- Engineer E: Cron setup, monitoring, alerting, S3/CDN configuration

---

## Success Criteria Validation

At launch, validate these North Star metrics:

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| **Notification Open Rate** | >40% (email), >70% (SMS) | task-018 analytics |
| **First-Run Retention** | >60% open Pulse 3+ times in first week | task-018 analytics |
| **Badge Share Rate** | >10% of unlocks result in social share | task-018 analytics |
| **Pro Upgrade Rate** | >5% within 30 days | task-018 analytics |
| **Unsubscribe Rate** | <5% | task-018 analytics |

**Failure Conditions (Triggers for Pivot):**
- <20% notification open rate (we're spam)
- >10% unsubscribe rate (we're annoying)
- <2% upgrade conversion (economics don't work)
- <5% badge share rate (viral hypothesis failed)

---

## Deployment Checklist

Before launching Pulse to production:

- [ ] All 4 decision blockers resolved
- [ ] All Wave 1 tasks complete and tested
- [ ] All Wave 2 tasks complete and tested
- [ ] All Wave 3 tasks complete and tested
- [ ] Database migrations run successfully
- [ ] Cron jobs configured and tested
- [ ] Email/SMS providers configured with production credentials
- [ ] S3/CDN configured for badge images
- [ ] Analytics dashboard operational
- [ ] Monitoring and alerts configured
- [ ] Steve has approved all copy (notifications, badges, cliffhanger, "all quiet")
- [ ] Elon has approved architecture and performance benchmarks
- [ ] Zero P0 bugs in first-run experience
- [ ] Staging tested with 100 alpha users
- [ ] Notification open rate >30% in alpha test
- [ ] SMS delivery rate >95% in alpha test
- [ ] Badge unlock latency <24 hours in alpha test

---

## Post-Launch Iteration Plan

**Week 1 Post-Launch:**
- Monitor North Star metrics daily
- Track unsubscribe rate, alert if >5%
- A/B test notification copy variants (REQ-034 feature flags)
- Gather qualitative user feedback

**Week 2-4 Post-Launch:**
- Calibrate badge thresholds based on unlock rates
- Adjust "all quiet" frequency if needed
- Test cliffhanger variants for re-engagement
- Optimize notification timing based on open rate data

**Nice-to-Have Features (Post-v1):**
- REQ-036: Multi-channel preference center
- REQ-037: Additional badge tiers (beyond 5)
- REQ-038: Advanced journal features (tagging, search, export)
- REQ-039: Competitive benchmarks (requires cross-restaurant data)
- REQ-040: Push notifications (requires mobile app)

---

*Phase 1 Plan complete. Ready for agent execution.*

