# PULSE IMPLEMENTATION: TECHNICAL DETAILS & CODE PATTERNS

**Companion Document to:** PULSE_RISK_SCANNER_REPORT.md
**Purpose:** Detailed technical guidance for developers implementing Pulse features

---

## I. ARCHITECTURE OVERVIEW

### Current LocalGenius Stack

```
Frontend Layer:
  └─ WordPress Plugin (chat.js widget)

API Layer:
  └─ Cloudflare Workers (stateless, edge-computed)

Database Layer:
  └─ Cloudflare D1 (SQLite, serverless)

Storage Layer:
  └─ Cloudflare R2 (S3-compatible object storage)
```

### Pulse Additions

```
Scheduled Job Layer:
  └─ External Cron (Vercel, Upstash, or AWS EventBridge)
  └─ POST /api/pulse/cron/generate-notifications [MISSING]

Notification Queue:
  └─ D1 notifications table [MISSING]
  └─ scheduled_for, sent_at timestamps

Delivery Layer:
  └─ Twilio SMS [MISSING]
  └─ SendGrid Email [MISSING]

Analytics Layer:
  └─ Tracking tables + webhooks [MISSING]
```

---

## II. CRITICAL FILES TO CREATE (IN ORDER)

### Phase 1: Schema & Infrastructure (Week 1)

#### File 1: Database Migration - `001_pulse_notifications.sql`

```sql
-- Create notifications table (core queue)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  -- Types: 'insight', 'badge', 'journal_prompt', 'cliffhanger', 'quiet'
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Email/SMS tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_bounce BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_delivery_status VARCHAR(20),
  sms_delivered_at TIMESTAMP,

  -- Deduplication
  dedup_key TEXT UNIQUE,

  FOREIGN KEY(user_id) REFERENCES users(id),
  INDEX idx_user_scheduled (user_id, scheduled_for),
  INDEX idx_scheduled_sent (scheduled_for, sent_at)
);

-- Create journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY,
  business_id INTEGER NOT NULL,
  week DATE NOT NULL,
  note TEXT NOT NULL,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(business_id) REFERENCES businesses(id),
  UNIQUE KEY unique_week (business_id, week)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT,
  image_generation_status VARCHAR(20),
  shared BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMP,

  FOREIGN KEY(user_id) REFERENCES users(id),
  UNIQUE KEY unique_badge (user_id, badge_type)
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  notification_time TIME DEFAULT '09:00:00',
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(20) DEFAULT 'daily',
  -- Frequencies: 'daily', '3x_week', 'weekly'
  timezone VARCHAR(50) DEFAULT 'UTC',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id) REFERENCES users(id),
  UNIQUE KEY unique_user (user_id)
);

-- SMS/Email compliance audit trail
CREATE TABLE IF NOT EXISTS notification_compliance (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_type VARCHAR(50),
  -- Types: 'sms_opt_in', 'sms_opt_out', 'email_unsubscribe', 'consent_recorded'
  consent_given BOOLEAN,
  consent_timestamp TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id) REFERENCES users(id),
  INDEX idx_user_compliance (user_id, created_at)
);
```

**Rationale:**
- `dedup_key`: Prevent duplicate notifications if cron job runs twice
- `image_generation_status`: Track async image generation state
- `notification_compliance`: TCPA audit trail requirement
- Indexes on `(user_id, scheduled_for)` for efficient batch queries

---

#### File 2: Environment Configuration - Update `wrangler.toml`

```toml
# Existing bindings
[[d1_databases]]
binding = "DB"
database_name = "localgenius"
database_id = "YOUR_D1_ID"

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "localgenius-assets"

# NEW: Environment variables (via wrangler secret put)
# wrangler secret put TWILIO_ACCOUNT_SID
# wrangler secret put TWILIO_AUTH_TOKEN
# wrangler secret put SENDGRID_API_KEY
# wrangler secret put CRON_SECRET

[env.production]
routes = [
  { pattern = "api.localgenius.com/*", zone_name = "localgenius.com" }
]
vars = {
  ENVIRONMENT = "production",
  NOTIFICATION_BATCH_SIZE = "1000",
  NOTIFICATION_TIMEOUT_MS = "300000",
  SMS_RATE_LIMIT = "100",
  IMAGE_GENERATION_TIMEOUT = "5000"
}

[env.staging]
routes = [
  { pattern = "staging-api.localgenius.com/*", zone_name = "localgenius.com" }
]
vars = {
  ENVIRONMENT = "staging",
  NOTIFICATION_BATCH_SIZE = "100",
  NOTIFICATION_TIMEOUT_MS = "300000",
  SMS_RATE_LIMIT = "10",
  IMAGE_GENERATION_TIMEOUT = "5000"
}
```

---

### Phase 2: Core Notification Engine (Week 1-2)

#### File 3: Notification Generator - `/pulse/notifications/generator.js`

```javascript
/**
 * Pulse Notification Generator
 * Runs at midnight UTC to pre-compute notifications for all users
 *
 * Key Design Decisions:
 * - Batch processing: 1,000 users at a time (memory safe)
 * - Idempotent: Uses dedup_key to prevent duplicates if job runs twice
 * - Graceful degradation: If notification_time not set, defaults to 9am UTC
 */

import { EmailSender } from './email-sender.js';
import { SMSSender } from './sms-sender.js';
import { BadgeChecker } from '../badges/checker.js';
import { InsightGenerator } from './templates/insight.js';
import { QuietTemplate } from './templates/quiet.js';

export class NotificationGenerator {
  constructor(db, env) {
    this.db = db;
    this.env = env;
    this.emailSender = new EmailSender(env.SENDGRID_API_KEY);
    this.smsSender = new SMSSender(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    this.badgeChecker = new BadgeChecker(db);
    this.batchSize = parseInt(env.NOTIFICATION_BATCH_SIZE || '1000');
    this.timeout = parseInt(env.NOTIFICATION_TIMEOUT_MS || '300000'); // 5 min
  }

  /**
   * Main entry point: Generate notifications for all users
   * Called by cron job at midnight UTC
   */
  async generateAll() {
    const startTime = Date.now();
    const summary = {
      total_users: 0,
      notifications_generated: 0,
      emails_queued: 0,
      sms_queued: 0,
      errors: 0,
      duration_ms: 0
    };

    try {
      // Get all users who want notifications
      const users = await this.getEligibleUsers();
      summary.total_users = users.length;

      console.log(`[Pulse] Generating notifications for ${users.length} users...`);

      // Process in batches to avoid memory overflow
      for (let i = 0; i < users.length; i += this.batchSize) {
        const batch = users.slice(i, i + this.batchSize);
        const batchResults = await this.processBatch(batch);

        summary.notifications_generated += batchResults.notifications;
        summary.emails_queued += batchResults.emails;
        summary.sms_queued += batchResults.sms;
        summary.errors += batchResults.errors;

        // Fail-safe: If approaching timeout, break and log progress
        if (Date.now() - startTime > this.timeout * 0.8) {
          console.warn(`[Pulse] Approaching timeout, processed ${i + batch.length}/${users.length} users`);
          break;
        }
      }

      summary.duration_ms = Date.now() - startTime;
      console.log(`[Pulse] Generation complete:`, summary);
      return summary;

    } catch (error) {
      console.error('[Pulse] Generator error:', error);
      throw error;
    }
  }

  /**
   * Get all users eligible for notifications today
   * Filters by:
   * - Notification preferences enabled
   * - Not opted out
   * - Has valid email or phone
   */
  async getEligibleUsers() {
    const { results } = await this.db.prepare(`
      SELECT
        u.id,
        u.email,
        u.phone_number,
        u.business_id,
        p.notification_time,
        p.email_enabled,
        p.sms_enabled,
        p.timezone
      FROM users u
      LEFT JOIN user_notification_preferences p ON u.id = p.user_id
      WHERE (p.email_enabled = TRUE OR p.sms_enabled = TRUE)
        AND u.is_active = TRUE
        AND (u.email IS NOT NULL OR u.phone_number IS NOT NULL)
    `).all();

    return results || [];
  }

  /**
   * Process a batch of users
   * Returns count of notifications generated
   */
  async processBatch(users) {
    const results = {
      notifications: 0,
      emails: 0,
      sms: 0,
      errors: 0
    };

    for (const user of users) {
      try {
        // Generate notifications for this user
        const notifications = await this.generateForUser(user);
        results.notifications += notifications.length;

        // Queue for delivery
        for (const notif of notifications) {
          // Store in database
          const dedupKey = `${user.id}-${notif.type}-${Date.now()}`;

          const { success } = await this.db.prepare(`
            INSERT INTO notifications (
              user_id, type, content, scheduled_for, dedup_key, created_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(dedup_key) DO NOTHING
          `).bind(user.id, notif.type, notif.content, notif.scheduled_for, dedupKey).run();

          if (success) {
            // Queue for immediate delivery or scheduled
            if (notif.type === 'email') {
              results.emails += await this.queueEmail(user, notif);
            } else if (notif.type === 'sms') {
              results.sms += await this.queueSMS(user, notif);
            }
          }
        }

      } catch (error) {
        console.error(`[Pulse] Error processing user ${user.id}:`, error);
        results.errors++;
      }
    }

    return results;
  }

  /**
   * Generate all notification types for a single user
   */
  async generateForUser(user) {
    const notifications = [];
    const businessMetrics = await this.getBusinessMetrics(user.business_id);

    // 1. Check for badge unlocks
    const newBadges = await this.badgeChecker.checkMilestones(user.business_id);
    for (const badge of newBadges) {
      notifications.push({
        type: 'badge',
        content: `You unlocked: ${badge.name}!`,
        scheduled_for: this.getScheduledTime(user)
      });
    }

    // 2. Generate insight notification
    if (businessMetrics.hasInsight) {
      const insight = await new InsightGenerator().generate(businessMetrics);
      notifications.push({
        type: 'insight',
        content: insight,
        scheduled_for: this.getScheduledTime(user)
      });
    } else {
      // 3. "All quiet" fallback (with frequency cap)
      const shouldSendQuiet = await this.shouldSendQuietNotification(user.id);
      if (shouldSendQuiet) {
        const quiet = await new QuietTemplate().generate();
        notifications.push({
          type: 'quiet',
          content: quiet,
          scheduled_for: this.getScheduledTime(user)
        });
      }
    }

    return notifications;
  }

  /**
   * Calculate user's notification send time
   * Converts user's timezone + preferred time to scheduled_for timestamp
   */
  getScheduledTime(user) {
    const userTz = user.timezone || 'UTC';
    const userTime = user.notification_time || '09:00:00';

    // TODO: Use Intl.DateTimeFormat or date-fns to convert
    // For MVP: Return 9am UTC as default
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setUTCHours(9, 0, 0, 0);

    return tomorrow.toISOString();
  }

  /**
   * Check if user should receive "All quiet" notification
   * Enforces frequency cap (max 2x/week per decision.md)
   */
  async shouldSendQuietNotification(userId) {
    const { results } = await this.db.prepare(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ?
        AND type = 'quiet'
        AND created_at > datetime('now', '-7 days')
    `).bind(userId).all();

    const quietCount = results[0]?.count || 0;
    return quietCount < 2; // Cap at 2x/week
  }

  /**
   * Get current business metrics for insight generation
   */
  async getBusinessMetrics(businessId) {
    const { results } = await this.db.prepare(`
      SELECT * FROM business_metrics
      WHERE business_id = ?
      ORDER BY date DESC
      LIMIT 8
    `).bind(businessId).all();

    if (!results || results.length < 2) {
      return { hasInsight: false };
    }

    // Calculate week-over-week change
    const today = results[0];
    const lastWeek = results[7];

    return {
      hasInsight: true,
      currentMetrics: today,
      previousMetrics: lastWeek,
      change: {
        visits: today.visit_count - lastWeek.visit_count,
        percentChange: ((today.visit_count - lastWeek.visit_count) / lastWeek.visit_count * 100).toFixed(1)
      }
    };
  }

  async queueEmail(user, notif) {
    // TODO: Implement SendGrid queuing
    return 1;
  }

  async queueSMS(user, notif) {
    // TODO: Implement Twilio queuing
    return 1;
  }
}
```

**Key Design Points:**
1. **Batching**: Processes 1,000 users at a time (configurable)
2. **Deduplication**: Uses dedup_key to handle cron job running twice
3. **Graceful Degradation**: Defaults to 9am UTC if timezone info missing
4. **Frequency Capping**: Enforces "max 2x/week for 'All quiet'" (decision.md IV.3)
5. **Timeout Safety**: Breaks after 80% of timeout to allow D1 commit time

---

#### File 4: Badge Checker - `/pulse/badges/checker.js`

```javascript
/**
 * Badge Milestone Checker
 * Detects when users unlock badges (visit thresholds)
 *
 * OPEN DECISION: Badge milestone thresholds (from decisions.md IV.2)
 * Current placeholder thresholds:
 * 1. Local Favorite: 500 visits
 * 2. Destination Dining: 1000 visits
 * 3. Power Player: 50 reviews
 * 4. Community Voice: 100 5-star reviews
 * 5. Rising Star: 50% growth week-over-week (2 weeks)
 */

export class BadgeChecker {
  constructor(db) {
    this.db = db;
    this.badges = {
      'local_favorite': { threshold: 500, metric: 'total_visits' },
      'destination_dining': { threshold: 1000, metric: 'total_visits' },
      'power_player': { threshold: 50, metric: 'total_reviews' },
      'community_voice': { threshold: 100, metric: 'five_star_reviews' },
      'rising_star': { threshold: 0.50, metric: 'growth_rate' }
    };
  }

  /**
   * Check if business has unlocked any new badges
   */
  async checkMilestones(businessId) {
    const newBadges = [];

    // Get current metrics
    const metrics = await this.getCurrentMetrics(businessId);

    // Check each badge threshold
    for (const [badgeType, config] of Object.entries(this.badges)) {
      const alreadyUnlocked = await this.isUnlocked(businessId, badgeType);

      if (!alreadyUnlocked) {
        const meetsThreshold = this.checkThreshold(metrics, config);

        if (meetsThreshold) {
          newBadges.push({
            type: badgeType,
            name: this.getBadgeName(badgeType),
            description: this.getBadgeDescription(badgeType)
          });

          // Record unlock in achievements table
          await this.recordUnlock(businessId, badgeType);
        }
      }
    }

    return newBadges;
  }

  /**
   * Get current business metrics for threshold checking
   */
  async getCurrentMetrics(businessId) {
    const { results } = await this.db.prepare(`
      SELECT
        SUM(visit_count) as total_visits,
        SUM(review_count) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_reviews
      FROM business_metrics
      WHERE business_id = ?
    `).bind(businessId).all();

    if (!results || results.length === 0) {
      return { total_visits: 0, total_reviews: 0, five_star_reviews: 0 };
    }

    // Calculate growth rate (this week vs last week)
    const thisWeek = await this.getWeekMetrics(businessId, 0);
    const lastWeek = await this.getWeekMetrics(businessId, 7);

    const growth = lastWeek.visits > 0
      ? (thisWeek.visits - lastWeek.visits) / lastWeek.visits
      : 0;

    return {
      ...results[0],
      growth_rate: growth
    };
  }

  /**
   * Check if metric meets badge threshold
   */
  checkThreshold(metrics, config) {
    const currentValue = metrics[config.metric] || 0;

    if (typeof config.threshold === 'number' && config.threshold < 1) {
      // Percentage-based (growth rate)
      return currentValue >= config.threshold;
    } else {
      // Absolute count
      return currentValue >= config.threshold;
    }
  }

  /**
   * Check if badge already unlocked
   */
  async isUnlocked(businessId, badgeType) {
    const { results } = await this.db.prepare(`
      SELECT id FROM achievements
      WHERE user_id = (SELECT owner_id FROM businesses WHERE id = ?)
        AND badge_type = ?
    `).bind(businessId, badgeType).all();

    return results && results.length > 0;
  }

  /**
   * Record badge unlock
   */
  async recordUnlock(businessId, badgeType) {
    const userId = await this.getBusinessOwner(businessId);

    return await this.db.prepare(`
      INSERT INTO achievements (user_id, badge_type, unlocked_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, badgeType).run();
  }

  getBadgeName(type) {
    const names = {
      'local_favorite': '🌟 Local Favorite',
      'destination_dining': '🎯 Destination Dining',
      'power_player': '💪 Power Player',
      'community_voice': '🗣️ Community Voice',
      'rising_star': '🚀 Rising Star'
    };
    return names[type] || 'Unknown Badge';
  }

  getBadgeDescription(type) {
    const descriptions = {
      'local_favorite': 'You\'ve reached 500 visits!',
      'destination_dining': 'You\'ve reached 1,000 visits!',
      'power_player': 'You\'ve earned 50 reviews!',
      'community_voice': 'You\'ve earned 100 five-star reviews!',
      'rising_star': 'You\'re growing 50% week-over-week!'
    };
    return descriptions[type] || 'Achievement unlocked!';
  }

  async getWeekMetrics(businessId, daysBack) {
    const { results } = await this.db.prepare(`
      SELECT SUM(visit_count) as visits
      FROM business_metrics
      WHERE business_id = ?
        AND date >= date('now', ? || ' days')
    `).bind(businessId, -daysBack).all();

    return results?.[0] || { visits: 0 };
  }

  async getBusinessOwner(businessId) {
    const { results } = await this.db.prepare(`
      SELECT owner_id FROM businesses WHERE id = ?
    `).bind(businessId).all();

    return results?.[0]?.owner_id;
  }
}
```

**Critical Note:** Badge thresholds are OPEN DECISION (decisions.md IV.2). Above values are placeholders.

---

#### File 5: SMS Sender - `/pulse/notifications/sms-sender.js`

```javascript
/**
 * Twilio SMS Sender
 * Handles SMS delivery with:
 * - Opt-in consent tracking
 * - Delivery receipt tracking
 * - Rate limiting (100 SMS/sec max)
 * - US-only validation (for v1)
 */

import { PhoneValidator } from '../compliance/phone-validator.js';
import { TCPAAudit } from '../compliance/tcpa-audit.js';

export class SMSSender {
  constructor(accountSid, authToken) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
    this.messageService = 'MG123456789'; // Twilio Messaging Service ID
    this.validator = new PhoneValidator();
    this.audit = new TCPAAudit();
  }

  /**
   * Send SMS notification
   * @param {Object} user - User with phone_number
   * @param {string} message - SMS message body
   * @param {Object} db - D1 database
   * @returns {Promise<boolean>} Success status
   */
  async send(user, message, db) {
    try {
      // 1. Validate phone number
      if (!this.validator.isValidUS(user.phone_number)) {
        console.warn(`[SMS] Invalid phone number for user ${user.id}`);
        return false;
      }

      // 2. Check consent
      const hasConsent = await this.audit.hasConsent(user.id, db);
      if (!hasConsent) {
        console.warn(`[SMS] No SMS consent for user ${user.id}`);
        return false;
      }

      // 3. Check for recent opt-outs
      const isOptedOut = await this.audit.isOptedOut(user.id, db);
      if (isOptedOut) {
        console.warn(`[SMS] User ${user.id} is opted out`);
        return false;
      }

      // 4. Validate message content (spam filtering)
      if (this.containsSpamTriggers(message)) {
        console.warn(`[SMS] Message contains spam triggers, rejecting`);
        return false;
      }

      // 5. Send via Twilio
      const response = await this.sendViaTwilio(user.phone_number, message);

      // 6. Log delivery
      await this.logDelivery(user.id, message, response.sid, 'queued', db);

      return true;

    } catch (error) {
      console.error(`[SMS] Delivery error for user ${user.id}:`, error);
      return false;
    }
  }

  /**
   * Send SMS via Twilio API
   */
  async sendViaTwilio(phoneNumber, message) {
    const auth = btoa(`${this.accountSid}:${this.authToken}`);

    const response = await fetch(`${this.baseUrl}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'From': this.messageService,
        'To': phoneNumber,
        'Body': message,
        'StatusCallback': 'https://api.localgenius.com/pulse/sms-status-webhook'
      })
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Check if message contains common spam trigger words
   * Prevents carrier filtering issues
   */
  containsSpamTriggers(message) {
    const triggers = [
      /act\s+now/i,
      /limited\s+time/i,
      /urgent/i,
      /click\s+here/i,
      /buy\s+now/i,
      /free\s+money/i,
      /you\s+won/i
    ];

    return triggers.some(trigger => trigger.test(message));
  }

  /**
   * Log SMS delivery for analytics + compliance
   */
  async logDelivery(userId, message, sid, status, db) {
    // Update notifications table with SMS tracking
    await db.prepare(`
      UPDATE notifications
      SET sms_sent = TRUE, sms_delivery_status = ?
      WHERE id IN (
        SELECT id FROM notifications
        WHERE user_id = ? AND content LIKE ?
        ORDER BY created_at DESC LIMIT 1
      )
    `).bind(status, userId, `%${message.substring(0, 50)}%`).run();
  }
}
```

---

#### File 6: Email Sender - `/pulse/notifications/email-sender.js`

```javascript
/**
 * SendGrid Email Sender
 * Handles email delivery with:
 * - Template rendering
 * - Unsubscribe link tracking
 * - Bounce handling
 * - Reply-to configuration
 */

export class EmailSender {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.sendgrid.com/v3/mail/send';
    this.fromEmail = 'pulse@localgenius.com';
    this.fromName = 'Pulse from LocalGenius';
  }

  /**
   * Send notification email
   */
  async send(user, templateData, db) {
    try {
      // 1. Check if user wants email
      const prefs = await this.getUserPrefs(user.id, db);
      if (!prefs.email_enabled) {
        return false;
      }

      // 2. Render template
      const html = this.renderTemplate(templateData.type, templateData);

      // 3. Build SendGrid request
      const request = {
        personalizations: [{
          to: [{ email: user.email, name: user.name }],
          subject: templateData.subject
        }],
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        content: [{
          type: 'text/html',
          value: html
        }],
        reply_to: {
          email: 'support@localgenius.com'
        },
        // Tracking
        tracking_settings: {
          click_tracking: { enabled: true },
          open_tracking: { enabled: true },
          subscription_tracking: {
            enabled: true,
            text: 'Click here to unsubscribe: <% click here %>',
            html: 'Click <a href="<% click here %>">here</a> to unsubscribe'
          }
        },
        // Custom headers
        headers: {
          'X-Pulse-User-ID': user.id.toString(),
          'X-Pulse-Notification-Type': templateData.type
        }
      };

      // 4. Send via SendGrid
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.status === 202) {
        // Log successful send
        await this.logDelivery(user.id, templateData.type, 'sent', db);
        return true;
      } else {
        const error = await response.json();
        throw new Error(`SendGrid error: ${error.errors[0]?.message}`);
      }

    } catch (error) {
      console.error(`[Email] Delivery error for user ${user.id}:`, error);
      return false;
    }
  }

  /**
   * Render email template
   * Maps template type to HTML
   */
  renderTemplate(type, data) {
    const templates = {
      'insight': this.insightTemplate(data),
      'badge': this.badgeTemplate(data),
      'quiet': this.quietTemplate(data),
      'cliffhanger': this.clifhangerTemplate(data)
    };

    return templates[type] || '<p>Error: Invalid template type</p>';
  }

  insightTemplate(data) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">📊 Your Weekly Insight</h2>
          <p>Hi ${data.userName},</p>
          <p style="font-size: 18px; color: #2c3e50;">
            People are noticing you. <strong>${data.insightText}</strong>
          </p>
          <p style="color: #7f8c8d;">Last week: ${data.lastWeekMetric}</p>
          <a href="https://app.localgenius.com/dashboard" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Full Insights
          </a>
          <p style="font-size: 12px; color: #95a5a6;">
            <a href="<% unsubscribe link %>">Unsubscribe</a> |
            <a href="https://app.localgenius.com/preferences">Notification Settings</a>
          </p>
        </body>
      </html>
    `;
  }

  badgeTemplate(data) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>🏆 You've Unlocked a Badge!</h2>
          <p>Hi ${data.userName},</p>
          <p>${data.badgeDescription}</p>
          <a href="${data.badgeImageUrl}" style="max-width: 200px; height: auto;">
            <img src="${data.badgeImageUrl}" alt="${data.badgeName}" style="max-width: 200px; height: auto;">
          </a>
          <p>
            <a href="${data.shareLink}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Share to Instagram
            </a>
          </p>
        </body>
      </html>
    `;
  }

  quietTemplate(data) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>✅ All Quiet Today</h2>
          <p>Hi ${data.userName},</p>
          <p>Your business is running smoothly. No major changes to report—that's a good thing.</p>
          <p>We're watching. You're in good hands.</p>
        </body>
      </html>
    `;
  }

  clifhangerTemplate(data) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <p style="font-style: italic; color: #555;">
            ${data.cliffhangerText}
          </p>
          <p><small>See you next week!</small></p>
        </body>
      </html>
    `;
  }

  async getUserPrefs(userId, db) {
    const { results } = await this.db.prepare(`
      SELECT email_enabled FROM user_notification_preferences
      WHERE user_id = ?
    `).bind(userId).all();

    return results?.[0] || { email_enabled: true };
  }

  async logDelivery(userId, type, status, db) {
    // Track email sends for analytics
    // TODO: Implement
  }
}
```

---

### Phase 3: Supporting Infrastructure (Week 2)

#### File 7: Image Generator - `/pulse/badges/image-generator.js`

```javascript
/**
 * Badge Image Generator
 * Generates shareable OG images for badges using Canvas
 *
 * Challenge: Cloudflare Workers don't support node-canvas (C++ bindings)
 * Solution: Use Cloudflare Workers with Playwright or offload to external service
 *
 * MVP Approach: Generate pre-designed badge PNG + text overlay
 */

export class ImageGenerator {
  constructor(r2Binding) {
    this.r2 = r2Binding;
    this.cdnUrl = 'https://cdn.localgenius.com/badges';
  }

  /**
   * Generate OG image for badge
   * Returns URL to shareable image
   */
  async generate(badge, userMetrics) {
    try {
      // For MVP: Use pre-designed badge template + text overlay
      // Full implementation would use Sharp or similar

      const svgImage = this.generateSVG(badge, userMetrics);
      const imageKey = `${badge.type}-${Date.now()}.png`;

      // Upload to R2
      await this.uploadToR2(imageKey, svgImage);

      // Record in achievements table
      const imageUrl = `${this.cdnUrl}/${imageKey}`;
      return imageUrl;

    } catch (error) {
      console.error('[ImageGen] Error:', error);
      return null; // Fallback to generic badge
    }
  }

  /**
   * Generate SVG (vector) representation
   * Can be converted to PNG server-side or client-side
   */
  generateSVG(badge, metrics) {
    const badgeData = {
      'local_favorite': {
        title: '🌟 Local Favorite',
        description: '500+ Visits',
        color: '#f39c12'
      },
      'destination_dining': {
        title: '🎯 Destination Dining',
        description: '1000+ Visits',
        color: '#e74c3c'
      },
      'power_player': {
        title: '💪 Power Player',
        description: '50+ Reviews',
        color: '#3498db'
      },
      'community_voice': {
        title: '🗣️ Community Voice',
        description: '100+ 5-Star Reviews',
        color: '#2ecc71'
      },
      'rising_star': {
        title: '🚀 Rising Star',
        description: '50% Growth',
        color: '#9b59b6'
      }
    };

    const info = badgeData[badge.type];

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${info.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#333;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>
  <text x="600" y="250" font-size="80" font-weight="bold" text-anchor="middle" fill="white">
    ${info.title}
  </text>
  <text x="600" y="350" font-size="40" text-anchor="middle" fill="white" opacity="0.9">
    ${info.description}
  </text>
  <text x="600" y="550" font-size="24" text-anchor="middle" fill="white" opacity="0.7">
    LocalGenius • ${new Date().toLocaleDateString()}
  </text>
</svg>`;
  }

  /**
   * Upload generated image to R2
   */
  async uploadToR2(key, svgContent) {
    // Convert SVG string to Buffer
    const buffer = new TextEncoder().encode(svgContent);

    const response = await this.r2.put(key, buffer, {
      httpMetadata: {
        contentType: 'image/svg+xml',
        cacheControl: 'public, max-age=86400'
      }
    });

    return response;
  }

  /**
   * Fallback: Generic badge card if image generation fails
   */
  getFallbackCardUrl(badgeType) {
    // Return pre-generated fallback image from CDN
    return `https://cdn.localgenius.com/badges/fallback-${badgeType}.png`;
  }
}
```

---

#### File 8: Cron Handler - `/pulse/cron/notification-scheduler.js`

```javascript
/**
 * Cron Endpoint Handler
 * Called by external scheduler (Vercel Cron, Upstash, etc.) at midnight UTC
 *
 * Endpoint: POST /api/pulse/cron/generate-notifications
 * Secret: CRON_SECRET (validate request)
 * Timeout: 5 minutes (Cloudflare Workers soft limit)
 */

import { NotificationGenerator } from '../notifications/generator.js';

export async function handleNotificationCron(request, env) {
  // 1. Validate cron secret
  const cronSecret = request.headers.get('X-Cron-Secret');
  if (cronSecret !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // 2. Initialize generator
    const generator = new NotificationGenerator(env.DB, env);

    // 3. Generate all notifications
    const summary = await generator.generateAll();

    // 4. Log job execution
    await logJobExecution(env.DB, 'success', summary);

    // 5. Return summary
    return new Response(JSON.stringify({
      status: 'success',
      ...summary,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Pulse Cron] Error:', error);

    // Log failure
    await logJobExecution(env.DB, 'failure', { error: error.message });

    // Alert (could send to PagerDuty, Sentry, etc.)
    await sendAlert(env, `Pulse notification generation failed: ${error.message}`);

    return new Response(JSON.stringify({
      status: 'error',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Log cron job execution for monitoring
 */
async function logJobExecution(db, status, data) {
  await db.prepare(`
    INSERT INTO cron_execution_log (job_name, status, result_data, executed_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).bind('pulse_notification_generation', status, JSON.stringify(data)).run();
}

/**
 * Send alert on failure
 */
async function sendAlert(env, message) {
  // TODO: Send to PagerDuty/Sentry/email
  // For MVP: Just log
  console.error('[Pulse Alert]', message);
}
```

---

## III. CONFIGURATION CHECKLIST

### Pre-Launch Configuration

**[ ] Twilio Setup**
- [ ] Create Twilio account (www.twilio.com)
- [ ] Create Messaging Service (for A/B testing across numbers)
- [ ] Get Account SID and Auth Token
- [ ] Add TWILIO_ACCOUNT_SID to wrangler secrets
- [ ] Add TWILIO_AUTH_TOKEN to wrangler secrets
- [ ] Configure webhook URL for delivery receipts

**[ ] SendGrid Setup**
- [ ] Create SendGrid account
- [ ] Verify from email (pulse@localgenius.com)
- [ ] Add API key to wrangler secrets
- [ ] Create unsubscribe link template
- [ ] Test email sending in sandbox

**[ ] Cron Scheduler Setup**
- [ ] Choose scheduler (Vercel Cron / Upstash Qstash)
- [ ] Create cron job pointing to POST /api/pulse/cron/generate-notifications
- [ ] Set schedule: Daily at 00:00 UTC
- [ ] Add X-Cron-Secret header with value from env
- [ ] Configure error alerting

**[ ] R2/CDN Setup**
- [ ] Verify R2 bucket exists and is accessible
- [ ] Create CloudFlare CDN rule for R2 (origin)
- [ ] Set caching headers (30-day TTL)
- [ ] Configure CORS for badge sharing

**[ ] Database Configuration**
- [ ] Run migration: 001_pulse_notifications.sql
- [ ] Verify all 5 tables created
- [ ] Create indexes
- [ ] Test read/write performance with 10K rows

**[ ] Monitoring Setup**
- [ ] Configure alerts for job failure (via PagerDuty/Sentry)
- [ ] Create dashboard for metrics (open rate, delivery rate, unsubscribe rate)
- [ ] Set up logging (Cloudflare tail workers)

---

## IV. LOCAL TESTING GUIDE

### Setup Local Environment

```bash
# Install Wrangler
npm install -g @cloudflare/wrangler

# Install dependencies
npm install twilio sendgrid sharp date-fns

# Create .env.local for testing
cat > .env.local <<EOF
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CRON_SECRET=test-secret-12345
EOF

# Run local D1
wrangler d1 create localgenius --local

# Run tests
npm run test
```

### Test Scenarios

**Scenario 1: Single User Notification**
```javascript
// tests/notification-generator.test.js
test('Generate notification for single user', async () => {
  const generator = new NotificationGenerator(mockDb, mockEnv);
  const result = await generator.generateForUser({ id: 1, business_id: 1 });
  expect(result).toHaveLength(1);
  expect(result[0].type).toBe('insight');
});
```

**Scenario 2: Frequency Capping**
```javascript
test('Enforce max 2x/week "All quiet" notifications', async () => {
  // Insert 2 quiet notifications this week
  // Try to generate a 3rd
  // Verify it's not generated
});
```

**Scenario 3: SMS Opt-Out**
```javascript
test('Do not send SMS to opted-out users', async () => {
  // Mark user as SMS opted-out
  // Try to generate notification
  // Verify SMS not queued
});
```

---

## V. ROLLBACK PROCEDURES

### Database Rollback

If migration fails:
```sql
-- Rollback script
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS user_notification_preferences;
DROP TABLE IF EXISTS notification_compliance;
```

### Code Rollback

If notification generator breaks:
```bash
# Revert cron job temporarily
# Stop calling POST /api/pulse/cron/generate-notifications
# Revert to previous git commit
git revert <commit-hash>
wrangler publish --env production
```

### Manual Recovery

If batch job failed:
```javascript
// Admin endpoint to manually trigger generation
POST /api/pulse/admin/generate-notifications?api_key=xxx
// Response: { generated: 9850, errors: 150 }
```

---

## VI. SUMMARY: Implementation Order

1. **Schema + Config** (2-3 days)
   - Database migration
   - wrangler.toml configuration
   - Environment variables

2. **Core Engine** (3-4 days)
   - NotificationGenerator
   - BadgeChecker
   - EmailSender
   - SMSSender

3. **Supporting Services** (2-3 days)
   - ImageGenerator
   - PreferencesManager
   - ComplianceAudit

4. **Integration** (2-3 days)
   - Cron handler
   - Webhooks (SMS delivery receipts)
   - Analytics tracking

5. **Testing** (2-3 days)
   - Unit tests
   - Load tests (10K users)
   - Compliance validation

6. **Launch** (0.5 days)
   - Final checks
   - Enable cron job
   - Monitor first 24 hours

**Total: ~2 weeks** ✓ (matches Elon's original estimate, if executed in parallel)

---
