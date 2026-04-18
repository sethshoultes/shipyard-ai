# LocalGenius Engagement System (Pulse) — Build To-Do List

**Project:** Pulse v1
**Total Tasks:** 18 (across 3 waves)
**Estimated Duration:** 14 days
**Status:** Ready for Execution

---

## Wave 1: Foundation (Days 1-7) — PARALLEL EXECUTION

### Database Setup (Critical Path)

- [ ] Create migration 001: notifications table — verify: query shows table with id, user_id, type, content, scheduled_for, sent_at, clicked, created_at columns
- [ ] Create migration 002: journal_entries table — verify: query shows table with id, business_id, week, tags, note, created_at columns
- [ ] Create migration 003: achievements table — verify: query shows table with id, user_id, badge_type, unlocked_at, image_url, shared columns
- [ ] Create migration 004: user preferences fields — verify: users table has sms_opt_in, notification_time, notification_frequency, preferred_channels columns
- [ ] Create migration 005: badge_definitions table — verify: table exists with badge_type, threshold_metric, threshold_value, title, message columns
- [ ] Create migration 006: analytics tables — verify: badge_analytics, journal_analytics, upgrade_prompt_analytics tables exist
- [ ] Add indexes on notifications(user_id, scheduled_for) — verify: EXPLAIN query shows index used
- [ ] Add indexes on journal_entries(business_id, week) — verify: EXPLAIN query shows index used
- [ ] Add indexes on achievements(user_id, badge_type, unlocked_at) — verify: EXPLAIN query shows index used
- [ ] Run npm run db:migrate on clean database — verify: all migrations complete without errors

### Email Notification Infrastructure (task-001)

- [ ] Install/verify resend dependency in package.json — verify: resend listed in dependencies
- [ ] Create /src/services/notifications/email-sender.ts file — verify: file exists and exports sendNotificationEmail function
- [ ] Implement sendNotificationEmail() with Resend integration — verify: sends test email within 60 seconds
- [ ] Add template rendering for insight notification type — verify: insight template renders with dynamic data
- [ ] Add template rendering for badge notification type — verify: badge template renders with badge data
- [ ] Add template rendering for journal_prompt notification type — verify: journal_prompt template renders with weekly data
- [ ] Add template rendering for cliffhanger notification type — verify: cliffhanger template renders with context
- [ ] Add template rendering for quiet notification type — verify: quiet template renders with reassurance message
- [ ] Create email HTML templates in /src/services/notifications/templates/email/ directory — verify: directory contains 5 template files
- [ ] Implement retry logic with exponential backoff (max 3 attempts) — verify: failed send retries 3 times before marking failed
- [ ] Add delivery tracking: update notifications.sent_at on success — verify: sent_at timestamp populated after send
- [ ] Add click tracking: append ?notification_id={id} to links — verify: clicking link updates notifications.clicked=true
- [ ] Write unit tests for email-sender.ts — verify: npm run test -- --grep "email.*notification" passes

### SMS Notification Infrastructure (task-002)

- [ ] Install twilio dependency in package.json — verify: twilio listed in dependencies
- [ ] Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env.example — verify: environment variables exist in .env.example
- [ ] Create /src/services/notifications/sms-sender.ts file — verify: file exists and exports sendNotificationSMS function
- [ ] Implement Twilio client initialization from env vars — verify: client initializes without error in dev
- [ ] Implement sendNotificationSMS() with opt-in check — verify: SMS not sent if user.sms_opt_in=false
- [ ] Create SMS template renderer (max 160 chars) — verify: insight rendered as SMS <160 chars
- [ ] Add cost tracking: log estimated cost per SMS ($0.03) — verify: cost logged in analytics
- [ ] Create /src/api/settings/sms-opt-in.ts route — verify: POST updates user.sms_opt_in field
- [ ] Write unit tests for sms-sender.ts — verify: npm run test -- --grep "sms.*notification" passes
- [ ] Send test SMS to real phone number with opt-in=true — verify: SMS received within 60 seconds
- [ ] Verify SMS NOT sent when opt-in=false — verify: no SMS sent, no error thrown

### Midnight Batch Generator (task-003)

- [ ] Create /src/jobs/notification-generator.ts file — verify: file exists and exports generateDailyNotifications function
- [ ] Query all active users (last_active_at within 90 days) — verify: query returns expected user count in <1 second
- [ ] For each user, fetch analytics data — verify: can retrieve visits, reviews, reservations for user
- [ ] Determine if meaningful insight exists (threshold: >10% change WoW) — verify: correctly identifies insight vs. no-insight users
- [ ] Generate notification content for insight users — verify: content includes metric + context
- [ ] Generate "all quiet" content for no-insight users — verify: reassurance message generated
- [ ] Insert notification into notifications table with scheduled_for = user preference (default 9am local) — verify: scheduled_for matches user timezone
- [ ] Implement deduplication: check existing notifications before inserting — verify: running generator twice doesn't create duplicates
- [ ] Add dead man's switch: log completion timestamp — verify: completion logged in monitoring system
- [ ] Configure Vercel cron in vercel.json for midnight UTC — verify: cron expression "0 0 * * *" present
- [ ] Write unit tests for notification-generator.ts — verify: npm run test -- --grep "notification.*generator" passes
- [ ] Run generator manually for 100 test users — verify: completes in <2 minutes
- [ ] Check notifications table after run — verify: exactly 1 notification per user, no duplicates

### Badge Detection System (task-007)

- [ ] Create /src/services/badges/checker.ts file — verify: file exists and exports checkBadgeMilestones function
- [ ] Query user's current metrics (visits, reviews, streak) — verify: metrics retrieved in <100ms
- [ ] Compare metrics against badge_definitions thresholds — verify: correctly identifies met vs. unmet badges
- [ ] Insert unlocked badge into achievements table — verify: achievement record created with unlocked_at timestamp
- [ ] Prevent duplicate unlocks: check existing achievements before insert — verify: running checker twice doesn't duplicate badges
- [ ] Return list of newly unlocked badges — verify: function returns array of badge_type strings
- [ ] Create /src/jobs/badge-checker.ts cron wrapper — verify: job runs daily after metrics update
- [ ] Write unit tests for badge checker — verify: npm run test -- --grep "badge.*checker" passes
- [ ] Trigger checker for test user with 500 visits — verify: "Local Favorite" badge unlocks
- [ ] Run checker again for same user — verify: no duplicate badge created

### Badge Definitions (task-008)

- [ ] Insert "getting_started" badge definition — verify: badge_type, threshold_metric, threshold_value, title, message populated
- [ ] Insert "review_responder" badge definition (50 reviews) — verify: threshold=50, title="Review Responder"
- [ ] Insert "local_favorite" badge definition (500 visits) — verify: threshold=500, title="Local Favorite"
- [ ] Insert "destination_dining" badge definition (1000 visits) — verify: threshold=1000, title="Destination Dining"
- [ ] Insert "consistent" badge definition (4-week streak) — verify: threshold=4, title="Consistent"
- [ ] Validate thresholds with existing user data analysis — verify: thresholds are achievable but not trivial (data-backed)
- [ ] Submit all badge copy to Steve for approval — verify: Steve sign-off documented
- [ ] Query badge_definitions table — verify: 5 badges returned with correct data

### Journal System (task-013 & task-014)

- [ ] Create /src/services/journal/prompt.ts file — verify: file exports generateJournalPrompt function
- [ ] Create journal prompt notification type — verify: type="journal_prompt" handled in email sender
- [ ] Add journal prompt to weekly digest template (inline) — verify: digest contains "What worked this week?" with text input
- [ ] Add skip button that logs skip event — verify: clicking skip logs journal_prompt_skipped event
- [ ] Schedule journal prompt for Sunday evening/Monday morning — verify: scheduled_for matches user timezone Sunday 8pm or Monday 9am
- [ ] Create /src/services/journal/storage.ts file — verify: file exports CRUD functions
- [ ] Implement createJournalEntry(businessId, week, note) — verify: entry saved to database
- [ ] Implement getJournalEntry(businessId, week) — verify: retrieves single entry in <100ms
- [ ] Implement getJournalHistory(businessId, limit) — verify: returns entries in chronological order
- [ ] Implement updateJournalEntry(id, note) — verify: note appended to existing entry
- [ ] Implement softDeleteJournalEntry(id) — verify: deleted_at timestamp set, entry not returned in queries
- [ ] Create /src/api/journal.ts routes (GET/POST/PATCH/DELETE) — verify: all CRUD operations work via API
- [ ] Write unit tests for journal storage — verify: npm run test -- --grep "journal.*storage" passes
- [ ] Submit journal entry via digest email — verify: entry saved and retrievable via API
- [ ] Track journal prompt completion rate — verify: analytics shows prompt_shown and entry_created events

### Trend Narratives (task-015)

- [ ] Create /src/services/trends/calculator.ts file — verify: file exports calculateTrends function
- [ ] Query current week metrics — verify: data retrieved for all key metrics (visits, reviews, reservations)
- [ ] Query previous week metrics using SQL window functions (LAG) — verify: previous week data retrieved
- [ ] Calculate WoW percentage delta: ((current - previous) / previous) * 100 — verify: calculation accurate (test with known data)
- [ ] Handle edge case: zero baseline (show absolute value) — verify: "0 to 50 visits" not "infinity% increase"
- [ ] Handle edge case: missing data (skip comparison) — verify: no comparison shown if previous week data missing
- [ ] Format trend narrative with warm tone — verify: output is "up 22% from last week" not "+22% WoW"
- [ ] Integrate trend calculator into weekly digest generation — verify: digest includes WoW deltas for all metrics
- [ ] Write unit tests for trend calculator — verify: npm run test -- --grep "trend.*calculator" passes
- [ ] Generate digest for test user with known metrics — verify: WoW % matches expected calculation
- [ ] Measure trend calculation time — verify: completes in <500ms for 10 metrics

### Cliffhanger System (task-016)

- [ ] Create /src/services/notifications/templates/cliffhanger.ts file — verify: file exports generateCliffhanger function
- [ ] Write 5-10 cliffhanger templates — verify: templates exist with dynamic context variables
- [ ] Template 1: "Next week, I'm trying a different post style..." — verify: template renders with context
- [ ] Template 2: "I noticed competitors are doing X..." — verify: template renders with competitor context
- [ ] Template 3: "Your best week was [date]. I'm studying what worked." — verify: template renders with best week date
- [ ] Template 4: "Based on your journal note about [topic]..." — verify: template uses journal entry if available
- [ ] Template 5: "I'm testing a new [feature] next week..." — verify: template renders with feature name
- [ ] Implement context-aware selection logic — verify: cliffhanger chosen based on user's recent data
- [ ] Append cliffhanger to end of weekly digest template — verify: digest ends with 1-2 sentence cliffhanger
- [ ] Ensure tone is first-person, curious (uses "testing," "trying") — verify: no templates use "promising" or "guaranteeing"
- [ ] Submit all cliffhanger copy to Steve for approval — verify: Steve sign-off documented
- [ ] Generate digest with cliffhanger — verify: cliffhanger appears at end after all metrics
- [ ] Write unit tests for cliffhanger generator — verify: npm run test -- --grep "cliffhanger" passes

---

## Wave 2: Integration (Days 8-12) — PARALLEL EXECUTION

### Scheduled Delivery Queue (task-004)

- [ ] Create /src/jobs/scheduled-delivery.ts file — verify: file exports flushNotificationQueue function
- [ ] Query notifications WHERE scheduled_for <= NOW() AND sent_at IS NULL — verify: query returns pending notifications
- [ ] Determine delivery channel (email, SMS, or both) from user preferences — verify: correct channel(s) selected per user
- [ ] Call email-sender for email notifications — verify: email sent successfully
- [ ] Call sms-sender for SMS notifications (opt-in users only) — verify: SMS sent only if sms_opt_in=true
- [ ] Update sent_at timestamp on successful delivery — verify: sent_at populated after delivery
- [ ] Handle partial failure: mark email as sent even if SMS fails — verify: email marked sent, SMS marked failed separately
- [ ] Configure Vercel cron to run every 10 minutes — verify: cron expression "*/10 * * * *" present in vercel.json
- [ ] Add monitoring: alert if queue grows >1000 pending — verify: alert fires when threshold exceeded
- [ ] Write unit tests for scheduled-delivery — verify: npm run test -- --grep "scheduled.*delivery" passes
- [ ] Insert test notification with scheduled_for=NOW() — verify: notification delivered within 10 minutes
- [ ] Verify delivery within 5 minutes of scheduled_for — verify: sent_at - scheduled_for < 5 minutes

### "All Quiet" Reassurance (task-005)

- [ ] Create /src/services/notifications/templates/quiet.ts file — verify: file exports generateQuietNotification function
- [ ] Add "all_quiet" notification type to enum — verify: type handled in email/SMS senders
- [ ] In notification generator, check if user has zero significant metrics — verify: correctly identifies zero-activity days
- [ ] Check last_quiet_notification_sent timestamp — verify: query retrieves last quiet notification date
- [ ] Implement frequency cap: only send if >3 days ago (2x/week) — verify: no more than 2 quiet notifications per 7 days
- [ ] Generate warm copy: "All quiet today — I'm still here." — verify: copy is reassuring, not spammy
- [ ] Update last_quiet_notification_sent timestamp — verify: timestamp updated in user preferences
- [ ] Track "all quiet" open rate separately — verify: analytics distinguishes quiet from insight notifications
- [ ] Submit copy to Steve for approval — verify: Steve sign-off documented
- [ ] Write unit tests for quiet notification — verify: npm run test -- --grep "quiet.*notification" passes
- [ ] Trigger generator for user with zero activity — verify: "all quiet" notification generated
- [ ] Run generator 5 days in a row for same user — verify: max 2 "all quiet" notifications sent

### Notification Preferences UI (task-006)

- [ ] Create /src/components/NotificationPreferences.tsx file — verify: file exists and exports NotificationPreferences component
- [ ] Add time picker dropdown (hourly options, default 9am) — verify: dropdown shows 24 hourly options
- [ ] Add frequency dropdown (daily, weekly digest only) — verify: dropdown shows 2 options
- [ ] Add channel checkboxes (email, SMS, both) — verify: checkboxes for email and SMS
- [ ] Add SMS opt-in disclaimer for TCPA compliance — verify: disclaimer text visible when SMS selected
- [ ] Add unsubscribe/pause option at bottom — verify: "Pause all notifications" button present
- [ ] Create /src/api/settings/notification-preferences.ts route — verify: GET returns current preferences, POST updates
- [ ] Persist preferences to users table — verify: database fields updated on save
- [ ] Ensure UI is clean, minimal (3-5 toggles max) — verify: no more than 5 settings visible
- [ ] Write unit tests for preferences component — verify: npm run test -- --grep "notification.*preferences" passes
- [ ] Open settings panel, change notification time to 7pm — verify: preference saved to database
- [ ] Toggle SMS off — verify: next notification is email-only
- [ ] Check unsubscribe rate after launching preferences — verify: unsubscribe rate <5%

### Badge Image Generation (task-009)

- [ ] Install @vercel/og or canvas dependency — verify: dependency listed in package.json
- [ ] Create /src/services/badges/image-generator.ts file — verify: file exports generateBadgeImage function
- [ ] Design badge card template (1200x630px OG image) — verify: template includes badge icon, stats, LocalGenius branding
- [ ] Generate test image — verify: image is exactly 1200x630px
- [ ] Implement async generation triggered by badge unlock — verify: generation queued when achievement created
- [ ] Upload generated image to S3 or Cloudflare R2 — verify: image uploaded and accessible via CDN URL
- [ ] Store image URL in achievements.image_url — verify: URL populated in database
- [ ] Add fallback: serve generic badge image if custom generation fails — verify: fallback image served on generation error
- [ ] Cache generated images in CDN — verify: subsequent requests served from cache
- [ ] Create /src/jobs/badge-image-gen.ts async job queue — verify: job processes image generation queue
- [ ] Write unit tests for badge image generator — verify: npm run test -- --grep "badge.*image" passes
- [ ] Unlock test badge — verify: OG image generated within 5 minutes
- [ ] Check image resolution — verify: 1200x630px, suitable for Instagram/Facebook
- [ ] Test fallback: force generation error — verify: generic image served
- [ ] Measure image generation latency — verify: <2 seconds per badge

### Badge Share Feature (task-010)

- [ ] Create /src/components/BadgeUnlockModal.tsx file — verify: file exports BadgeUnlockModal component
- [ ] Display badge icon, title, celebratory message — verify: modal shows badge details on unlock
- [ ] Add share button — verify: button labeled "Share" visible in modal
- [ ] Implement Web Share API integration — verify: clicking share opens native share UI on supported browsers
- [ ] Pre-fill share text: "Just hit 1000 visitors with @LocalGenius 🚀" — verify: share text includes badge achievement + mention
- [ ] Include badge OG image URL from achievements.image_url — verify: shared URL includes OG meta tags pointing to image
- [ ] Make pre-filled text editable by user — verify: user can edit text before sharing
- [ ] Track share events: POST to /api/achievements/{id}/share — verify: clicking share logs event
- [ ] Update achievements.shared=true and shared_at timestamp — verify: fields updated on share
- [ ] Fallback for browsers without Web Share API: copy link to clipboard — verify: fallback works in browsers without native share
- [ ] Write unit tests for badge share — verify: npm run test -- --grep "badge.*share" passes
- [ ] Unlock test badge — verify: celebration modal appears
- [ ] Click share button — verify: native share UI opens (or clipboard copy on unsupported browsers)
- [ ] Share to social platform — verify: share event logged in database
- [ ] Check analytics: share rate >10% target — verify: tracking dashboard shows badge share rate

### Confetti Animation (task-011)

- [ ] Install canvas-confetti or react-confetti dependency — verify: dependency in package.json
- [ ] Add confetti animation to BadgeUnlockModal — verify: animation triggers when modal opens
- [ ] Configure animation: 2-3 second duration — verify: animation completes in 2-3 seconds
- [ ] Ensure animation is colorful, celebratory — verify: multiple particle colors used
- [ ] Ensure animation doesn't block user interaction — verify: user can dismiss modal during animation
- [ ] Add dismiss button: one tap to close — verify: modal closes immediately on dismiss
- [ ] Optimize performance: >60fps on mobile — verify: animation smooth on iPhone/Android test
- [ ] Add accessibility: prefers-reduced-motion disables animation — verify: no animation when OS setting enabled
- [ ] Write unit tests for confetti animation — verify: animation component renders without errors
- [ ] Unlock test badge — verify: confetti plays smoothly
- [ ] Check animation duration — verify: 2-3 seconds (not too long)
- [ ] Test on mobile device — verify: >60fps performance
- [ ] Enable prefers-reduced-motion — verify: animation disabled, static modal shown

### Analytics Infrastructure (task-018)

- [ ] Create /src/services/analytics/pulse-tracker.ts file — verify: file exports tracking functions
- [ ] Add opened_at, clicked_at, clicked_url fields to notifications table — verify: fields exist in schema
- [ ] Create badge_analytics table (unlock_rate, share_rate) — verify: table exists with correct schema
- [ ] Create journal_analytics table (prompt_shown, completed, skipped) — verify: table exists with correct schema
- [ ] Create upgrade_prompt_analytics table (shown_at, clicked_at, converted_at) — verify: table exists with correct schema
- [ ] Implement trackNotificationSent(notificationId) — verify: function logs sent event
- [ ] Implement trackNotificationOpened(notificationId) — verify: function logs opened event
- [ ] Implement trackNotificationClicked(notificationId, url) — verify: function logs clicked event with URL
- [ ] Implement trackBadgeUnlocked(achievementId) — verify: function logs unlock event
- [ ] Implement trackBadgeShared(achievementId) — verify: function logs share event
- [ ] Implement trackJournalPromptShown(userId) — verify: function logs prompt shown event
- [ ] Implement trackJournalEntryCompleted(entryId) — verify: function logs entry completed event
- [ ] Implement trackJournalPromptSkipped(userId) — verify: function logs skip event
- [ ] Create daily aggregation job — verify: job runs and aggregates metrics
- [ ] Create /src/api/analytics/pulse.ts endpoint — verify: returns aggregated Pulse metrics
- [ ] Add real-time alerts: unsubscribe rate >10% — verify: alert fires when threshold exceeded
- [ ] Add real-time alerts: open rate <20% — verify: alert fires when threshold exceeded
- [ ] Add real-time alerts: share rate <5% — verify: alert fires when threshold exceeded
- [ ] Write unit tests for analytics tracker — verify: npm run test -- --grep "analytics.*tracker" passes
- [ ] Send test notification, click link — verify: click tracked in database
- [ ] Unlock badge, share to social — verify: share tracked in database
- [ ] Query analytics dashboard — verify: real-time metrics available (<1 second load time)

---

## Wave 3: Polish (Days 13-14)

### Badge Gallery (task-012)

- [ ] Create /src/components/BadgeGallery.tsx file — verify: file exports BadgeGallery component
- [ ] Create /src/components/BadgeCard.tsx file — verify: file exports BadgeCard component
- [ ] Query all badges: unlocked (from achievements) + locked (from badge_definitions) — verify: query returns both locked and unlocked badges
- [ ] Display badges in grid layout — verify: responsive grid (3-4 columns on desktop, 1-2 on mobile)
- [ ] For unlocked badges: show icon, title, unlock date — verify: unlocked badges display full details
- [ ] For locked badges: show greyed out icon, title, "Locked" — verify: locked badges visually distinct
- [ ] For locked badges: show progression "350/500 visits — 70%" — verify: progress calculation accurate
- [ ] Add share button to each unlocked badge card — verify: share button visible on unlocked badges only
- [ ] Create /src/api/achievements/gallery.ts endpoint — verify: GET returns locked + unlocked badges
- [ ] Optimize query performance: <1 second load — verify: gallery loads in <1 second
- [ ] Add route /settings/badges — verify: route navigable from settings menu
- [ ] Write unit tests for badge gallery — verify: npm run test -- --grep "badge.*gallery" passes
- [ ] Open badge gallery — verify: all badges displayed (locked + unlocked)
- [ ] Check locked badges show progression — verify: "350/500 visits" displayed correctly
- [ ] Click share button on unlocked badge — verify: share UI opens
- [ ] Measure gallery load time — verify: <1 second

---

## QA & Testing (Days 13-14)

### Integration Testing

- [ ] Run full notification flow: generate → schedule → deliver — verify: end-to-end flow works without errors
- [ ] Test email notification received in inbox — verify: email arrives within 5 minutes of scheduled_for
- [ ] Test SMS notification received on phone — verify: SMS arrives within 5 minutes (opt-in users only)
- [ ] Test badge unlock flow: metric threshold → detection → unlock → image generation → modal — verify: complete flow <30 seconds
- [ ] Test badge share flow: unlock → modal → share → tracking — verify: share event logged correctly
- [ ] Test journal flow: prompt → submission → storage → retrieval — verify: entry persists and is retrievable
- [ ] Test trend narrative in digest — verify: WoW deltas appear in weekly digest email
- [ ] Test cliffhanger in digest — verify: cliffhanger appears at end of weekly digest
- [ ] Test preferences UI: change settings → save → verify next notification respects settings — verify: settings applied correctly

### Performance Testing

- [ ] Run notification generator for 100 users — verify: completes in <2 minutes
- [ ] Run notification generator for 1000 users — verify: completes in <20 minutes
- [ ] Load badge gallery — verify: <1 second load time
- [ ] Calculate trends for 10 metrics — verify: <500ms completion
- [ ] Generate badge OG image — verify: <2 seconds per image
- [ ] Query journal history (100 entries) — verify: <100ms

### Edge Case Testing

- [ ] Test notification generator with user who has zero activity — verify: "all quiet" notification generated (respects 2x/week cap)
- [ ] Test trend calculation with zero baseline previous week — verify: shows "0 to 50 visits" not "infinity%"
- [ ] Test trend calculation with missing previous week data — verify: no comparison shown (graceful handling)
- [ ] Test badge unlock with user already having badge — verify: no duplicate badge created
- [ ] Test SMS send with opt-in=false — verify: no SMS sent, no error thrown
- [ ] Test badge image generation failure — verify: fallback generic image served
- [ ] Test Web Share API fallback on unsupported browser — verify: clipboard copy works
- [ ] Test confetti animation with prefers-reduced-motion — verify: animation disabled

### Security & Compliance Testing

- [ ] Verify SMS opt-in explicit (TCPA-compliant) — verify: opt-in checkbox + disclaimer visible
- [ ] Verify email unsubscribe link in all emails — verify: all notification emails have unsubscribe link
- [ ] Verify no sensitive data logged in public analytics — verify: no PII in logs
- [ ] Test GDPR data export includes Pulse data — verify: export includes journal entries, notifications, achievements
- [ ] Test unsubscribe flow — verify: user can unsubscribe and stops receiving notifications

### Brand Voice Review

- [ ] Steve reviews all notification templates — verify: Steve sign-off documented
- [ ] Steve reviews all badge messaging — verify: Steve sign-off documented
- [ ] Steve reviews all cliffhanger copy — verify: Steve sign-off documented
- [ ] Steve reviews all "all quiet" messaging — verify: Steve sign-off documented
- [ ] Verify copy is warm, human, first-person where appropriate — verify: no robotic or corporate tone

### First-Run Experience Testing

- [ ] Test new user with no data — verify: demo insight shown with disclaimer
- [ ] Test new user sees something within 30 seconds — verify: no blank dashboards
- [ ] Test new user can navigate to settings — verify: settings accessible from menu
- [ ] Test new user can set notification preferences — verify: preferences save and affect next notification
- [ ] Verify zero P0 bugs in first login flow — verify: no errors, crashes, or broken links

---

## Deployment Preparation (Day 14)

### Configuration

- [ ] Add Vercel cron jobs to vercel.json — verify: 3 cron jobs configured (midnight batch, scheduled delivery, badge checker)
- [ ] Set TWILIO_ACCOUNT_SID in production env — verify: env var set in Vercel dashboard
- [ ] Set TWILIO_AUTH_TOKEN in production env — verify: env var set in Vercel dashboard
- [ ] Set TWILIO_PHONE_NUMBER in production env — verify: env var set in Vercel dashboard
- [ ] Set Resend API key in production env — verify: env var set in Vercel dashboard
- [ ] Configure S3/R2 bucket for badge images — verify: bucket created and accessible
- [ ] Set S3/R2 credentials in production env — verify: env vars set in Vercel dashboard
- [ ] Configure CDN for badge image delivery — verify: CDN URL resolves and serves test image

### Documentation

- [ ] Write PULSE.md user guide — verify: guide covers all features with screenshots
- [ ] Write PULSE-API.md API reference — verify: all endpoints documented with examples
- [ ] Write PULSE-DEPLOYMENT.md deployment checklist — verify: checklist covers all configuration steps
- [ ] Add JSDoc comments to all exported functions — verify: npm run typedoc generates docs without errors

### Monitoring & Alerts

- [ ] Configure monitoring for notification open rate — verify: alert fires if <20%
- [ ] Configure monitoring for unsubscribe rate — verify: alert fires if >10%
- [ ] Configure monitoring for badge share rate — verify: alert fires if <5%
- [ ] Configure monitoring for batch job completion — verify: alert fires if job doesn't complete by 1am UTC
- [ ] Configure monitoring for notification queue backlog — verify: alert fires if >1000 pending
- [ ] Configure monitoring for SMS delivery rate — verify: alert fires if <95%

### Final Checks

- [ ] Run npm run typecheck — verify: zero TypeScript errors
- [ ] Run npm run test — verify: all tests passing (>80% coverage for new code)
- [ ] Run npm run build — verify: builds successfully
- [ ] Run npm run db:migrate on staging — verify: migrations run cleanly
- [ ] Deploy to staging — verify: all features work in staging environment
- [ ] Test with 100 alpha users on staging — verify: notification open rate >30%
- [ ] Verify SMS delivery rate >95% on staging — verify: Twilio dashboard shows >95% delivery
- [ ] Git tag release v1.0.0-pulse — verify: tag created and pushed
- [ ] Deploy to production — verify: all features work in production environment

---

**Total Tasks:** 231 atomic tasks
**Verification:** Every task includes concrete verification criteria
**Estimated Duration:** 14 days (3 engineers working in parallel)
**Status:** Ready for Wave 1 execution
