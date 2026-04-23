//**
 * Async Weekly Digest Generation + Batch Email Send
 *
 * DECISIONS (LOCKED):
 * - Async digest generation ships in v1. Not v2.
 * - Email pipeline must batch sends.
 * - Weekly digest is a "love note" — one number, one smile, one reason to exhale.
 */

import { inngest } from "inngest";
import { getWeeklyMetrics, getHeroMetric, estimateTimeSaved, pool } from "@/lib/digest-query";
import { sendEmailBatch } from "@/lib/email";
import { renderWeeklyDigestEmail } from "@/emails/WeeklyDigest";
import { BRAND } from "@/config/brand";

/**
 * Inngest client — configured for scheduled digest jobs.
 */
export const inngestClient = new inngest.Inngest({
  id: "localgenius-digest",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

/**
 * Scheduled function: Run every Sunday at 6 PM.
 *
 * Restaurant industry rhythm: post-service rush, pre-Monday prep.
 */
export const weeklyDigestJob = inngestClient.createFunction(
  {
    id: "weekly-digest",
    name: "Sous Weekly Digest",
    retries: 3,
    concurrency: { limit: 5 },
    // Dead-letter queue is handled by Inngest's built-in failure recovery
    onFailure: async ({ event, error }) => {
      console.error(`[Digest Job] Failed permanently for user ${event.data.userId}:`, error);
      // Alerting hook: PagerDuty, Slack, etc.
      await alertOnDigestFailure(event.data.userId, error.message);
    },
  },
  { cron: "0 18 * * 0" }, // Every Sunday at 6:00 PM
  async ({ step }) => {
    // Step 1: Fetch all users eligible for the digest
    const userIds = await step.run("fetch-eligible-users", async () => {
      return fetchEligibleUserIds();
    });

    console.log(`[Digest Job] ${userIds.length} users eligible for weekly digest.`);

    // Step 2: Generate email payloads for each user
    const payloads = await step.run("generate-digests", async () => {
      const results = await Promise.allSettled(
        userIds.map((userId) => generateDigestForUser(userId))
      );

      return results
        .filter(
          (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof generateDigestForUser>> > =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value!);
    });

    // Step 3: Send in batches with exponential backoff
    const batchResult = await step.run("send-batch-emails", async () => {
      return sendEmailBatch(payloads);
    });

    console.log(
      `[Digest Job] Sent ${batchResult.sent} emails. Failed: ${batchResult.failed}`
    );

    // Step 4: Log dead-letter failures for manual review
    if (batchResult.failures.length > 0) {
      await step.run("log-failures", async () => {
        for (const failure of batchResult.failures) {
          console.error(
            `[Digest Job] Failed to send to ${failure.payload.to}: ${failure.error}`
          );
        }
      });
    }

    return {
      usersProcessed: userIds.length,
      emailsSent: batchResult.sent,
      emailsFailed: batchResult.failed,
    };
  }
);

/**
 * Generate a digest email for a single user.
 */
async function generateDigestForUser(
  userId: string
): Promise<{
  to: string;
  subject: string;
  html: string;
  text?: string;
} | null> {
  const comparison = await getWeeklyMetrics(userId);

  if (!comparison) {
    console.log(`[Digest Job] No metrics for user ${userId}. Skipping.`);
    return null;
  }

  const hero = getHeroMetric(comparison);
  const timeSaved = estimateTimeSaved(comparison.currentWeek.totalActions);

  const subject = BRAND.digest.subjectLine(hero.label);

  const html = renderWeeklyDigestEmail({
    heroMetric: hero,
    timeSaved,
    comparison,
    userId,
  });

  const userEmail = await getUserEmail(userId);
  if (!userEmail) {
    return null;
  }

  return {
    to: userEmail,
    subject,
    html,
    text: `Sous Weekly Digest\n\n${hero.label}: ${hero.value} (${hero.delta >= 0 ? "+" : ""}${hero.delta})\nTime saved: ${timeSaved}\n\n${BRAND.digest.signOff}`,
  };
}

/**
 * Fetch all users who should receive the weekly digest.
 *
 * In production, this queries the users table for active subscribers
 * who have not opted out.
 */
async function fetchEligibleUserIds(): Promise<string[]> {
  const result = await pool.query(
    "SELECT id FROM users WHERE subscription_status = 'active' AND digest_opt_in = true"
  );
  return result.rows.map((r) => r.id);
}

/**
 * Fetch a user's email address by ID.
 */
async function getUserEmail(userId: string): Promise<string | null> {
  const result = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
  return result.rows[0]?.email || null;
}

/**
 * Alert when a digest job fails permanently.
 */
async function alertOnDigestFailure(userId: string, errorMessage: string): Promise<void> {
  // Hook into PagerDuty, Slack, or email alerting
  console.error(`[Digest Alert] Permanent failure for user ${userId}: ${errorMessage}`);
}

/**
 * Manual trigger endpoint for testing / admin use.
 */
export async function triggerDigestJob(userId?: string): Promise<void> {
  await inngestClient.send({
    name: "digest/manual-trigger",
    data: { userId },
  });
}

/**
 * Inngest event handler for manual triggers.
 */
export const manualDigestJob = inngestClient.createFunction(
  {
    id: "manual-digest",
    name: "Sous Manual Digest Trigger",
    retries: 2,
  },
  { event: "digest/manual-trigger" },
  async ({ event }) => {
    if (event.data.userId) {
      const payload = await generateDigestForUser(event.data.userId);
      if (payload) {
        await sendEmailBatch([payload]);
      }
    } else {
      // Trigger full batch if no user specified
      await weeklyDigestJob;
    }
  }
);
