/**
 * Anchor — Email Scheduler Cron Worker
 *
 * Runs daily at 8am UTC to check for and send scheduled emails
 *
 * Per decisions.md:
 * - 5 scheduled emails: Launch Day, Week 1, Month 1, Q1 Refresh, Anniversary
 * - Human-centered automation: emails feel personal, not automated
 */

import type { Env, Customer, EmailType } from "../lib/types";
import { sendEmail, wrapEmailHTML, generateEmailHeader, generateEmailBody, generateEmailFooter, escapeHtml } from "../lib/email";
import { getActiveCustomers, markEmailSent, getCustomer } from "../lib/customers";
import { getDaysSinceEnrollment, getEmailDue } from "../data/schema";
import { getOptimizationTip, getScoreRating } from "../lib/pagespeed";
import { calculateTrend } from "../lib/types";

export default {
  /**
   * Handle scheduled cron trigger
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log(`[EmailScheduler] Cron triggered at ${new Date().toISOString()}`);

    try {
      const customers = await getActiveCustomers();
      console.log(`[EmailScheduler] Processing ${customers.length} active customers`);

      let emailsSent = 0;
      let errors = 0;

      for (const customer of customers) {
        try {
          const daysSinceEnrollment = getDaysSinceEnrollment(customer.enrollmentDate);
          const emailDue = getEmailDue(daysSinceEnrollment, customer.emailsSent);

          if (emailDue) {
            await sendScheduledEmail(customer, emailDue, env);
            emailsSent++;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(`[EmailScheduler] Error for ${customer.email}: ${message}`);
          errors++;
        }
      }

      console.log(`[EmailScheduler] Complete: ${emailsSent} emails sent, ${errors} errors`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[EmailScheduler] Fatal error: ${message}`);
      throw error;
    }
  },
};

/**
 * Send a scheduled email to a customer
 */
async function sendScheduledEmail(
  customer: Customer,
  emailType: keyof Customer["emailsSent"],
  env: Env
): Promise<void> {
  console.log(`[EmailScheduler] Sending ${emailType} email to ${customer.email}`);

  const { subject, html } = generateEmail(customer, emailType);

  const result = await sendEmail(
    { to: customer.email, subject, html },
    env.RESEND_API_KEY,
    env.FROM_EMAIL
  );

  if (result.success) {
    await markEmailSent(customer.id, emailType);
    console.log(`[EmailScheduler] Sent ${emailType} to ${customer.email}`);
  } else {
    console.error(`[EmailScheduler] Failed to send ${emailType} to ${customer.email}: ${result.error}`);
    throw new Error(`Email send failed: ${result.error}`);
  }
}

/**
 * Generate email content based on type
 */
function generateEmail(
  customer: Customer,
  emailType: keyof Customer["emailsSent"]
): { subject: string; html: string } {
  const firstName = customer.name.split(" ")[0];

  switch (emailType) {
    case "launchDay":
      return generateLaunchDayEmail(customer, firstName);
    case "week1":
      return generateWeek1Email(customer, firstName);
    case "month1":
      return generateMonth1Email(customer, firstName);
    case "q1Refresh":
      return generateQ1RefreshEmail(customer, firstName);
    case "anniversary":
      return generateAnniversaryEmail(customer, firstName);
    default:
      throw new Error(`Unknown email type: ${emailType}`);
  }
}

/**
 * Launch Day Email
 * Sent on enrollment day - welcome and set expectations
 */
function generateLaunchDayEmail(
  customer: Customer,
  firstName: string
): { subject: string; html: string } {
  const subject = `Welcome to Anchor, ${firstName}!`;

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px;">Hey ${escapeHtml(firstName)},</p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      I'm thrilled you've joined Anchor. Your site is now in good hands.
    </p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      Here's what happens next: every week, we'll run a comprehensive performance check on
      <strong>${escapeHtml(customer.siteUrl)}</strong>. If anything needs attention, you'll hear from me personally.
    </p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      No dashboards to check. No alerts to configure. Just peace of mind knowing someone's got your back.
    </p>

    <p style="margin: 0 0 24px; font-size: 16px;">
      Your first performance report will arrive next week. Until then, relax and focus on what you do best.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px;">
      <tr>
        <td style="background-color: #1a365d; border-radius: 6px;">
          <a href="mailto:support@shipyard.company?subject=Question about Anchor"
             style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Got Questions? Just Reply
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 16px;">
      Welcome aboard,<br>
      <strong>The Anchor Team</strong>
    </p>
  `;

  const html = wrapEmailHTML(
    generateEmailHeader("Welcome to Anchor") +
    generateEmailBody(content) +
    generateEmailFooter(),
    "Your site is now in good hands."
  );

  return { subject, html };
}

/**
 * Week 1 Email
 * First performance report with initial scores
 */
function generateWeek1Email(
  customer: Customer,
  firstName: string
): { subject: string; html: string } {
  const latestScore = customer.pagespeedHistory[customer.pagespeedHistory.length - 1];
  const mobileScore = latestScore?.mobile || 0;
  const desktopScore = latestScore?.desktop || 0;
  const rating = getScoreRating(mobileScore);

  const subject = `Your first performance report is ready`;

  const ratingMessage = rating === "good"
    ? "Great news - your site is performing well!"
    : rating === "needs-improvement"
    ? "Your site has room for improvement, but nothing urgent."
    : "I've spotted some areas where we can help.";

  const tip = latestScore
    ? getOptimizationTip(latestScore.vitals, mobileScore, desktopScore)
    : "Keep an eye on your performance as we gather more data.";

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px;">Hey ${escapeHtml(firstName)},</p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      Your first week with Anchor is complete, and I've got your initial performance report ready.
    </p>

    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">This Week's Scores</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Mobile</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 24px; color: ${getScoreColor(mobileScore)};">${mobileScore}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Desktop</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 24px; color: ${getScoreColor(desktopScore)};">${desktopScore}</strong>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px; font-size: 16px;">
      ${ratingMessage}
    </p>

    <p style="margin: 0 0 24px; font-size: 16px; background-color: #e8f4fd; border-left: 4px solid #1a365d; padding: 16px;">
      <strong>Quick tip:</strong> ${escapeHtml(tip)}
    </p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      I'll keep tracking your site and let you know if anything changes. You don't need to do anything - just know someone's watching.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px;">
      <tr>
        <td style="background-color: #1a365d; border-radius: 6px;">
          <a href="mailto:support@shipyard.company?subject=Request update for ${escapeHtml(customer.siteUrl)}"
             style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Request an Update
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 16px;">
      Talk soon,<br>
      <strong>The Anchor Team</strong>
    </p>
  `;

  const html = wrapEmailHTML(
    generateEmailHeader("Your First Performance Report") +
    generateEmailBody(content) +
    generateEmailFooter(),
    `Your site scored ${mobileScore} on mobile this week.`
  );

  return { subject, html };
}

/**
 * Month 1 Email
 * One month check-in with trend data
 */
function generateMonth1Email(
  customer: Customer,
  firstName: string
): { subject: string; html: string } {
  const history = customer.pagespeedHistory;
  const latestScore = history[history.length - 1];
  const mobileScore = latestScore?.mobile || 0;
  const trend = calculateTrend(history);

  const subject = `Your first month with Anchor`;

  const trendMessage = trend === "improving"
    ? "Even better - your performance is trending upward!"
    : trend === "declining"
    ? "I've noticed a slight dip in performance. Let's keep an eye on it."
    : "Your site has been rock-solid this month.";

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px;">Hey ${escapeHtml(firstName)},</p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      One month down with Anchor! Here's how things are looking for <strong>${escapeHtml(customer.siteUrl)}</strong>.
    </p>

    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">30-Day Summary</p>
      <p style="margin: 0 0 8px; font-size: 16px;">
        <strong>Current Mobile Score:</strong> <span style="color: ${getScoreColor(mobileScore)};">${mobileScore}</span>
      </p>
      <p style="margin: 0; font-size: 16px;">
        <strong>Trend:</strong> ${getTrendEmoji(trend)} ${trend.charAt(0).toUpperCase() + trend.slice(1)}
      </p>
    </div>

    <p style="margin: 0 0 16px; font-size: 16px;">
      ${trendMessage}
    </p>

    <p style="margin: 0 0 24px; font-size: 16px;">
      Remember: I'm checking your site every week. If something goes sideways, you'll be the first to know.
      No news from me usually means everything's running smoothly.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px;">
      <tr>
        <td style="background-color: #1a365d; border-radius: 6px;">
          <a href="mailto:support@shipyard.company?subject=Question about my site performance"
             style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Have Questions? Let's Chat
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 16px;">
      Here's to another great month,<br>
      <strong>The Anchor Team</strong>
    </p>
  `;

  const html = wrapEmailHTML(
    generateEmailHeader("Your First Month") +
    generateEmailBody(content) +
    generateEmailFooter(),
    "Your first month with Anchor - here's the summary."
  );

  return { subject, html };
}

/**
 * Q1 Refresh Email
 * 90-day check-in with quarterly insights
 */
function generateQ1RefreshEmail(
  customer: Customer,
  firstName: string
): { subject: string; html: string } {
  const history = customer.pagespeedHistory;
  const latestScore = history[history.length - 1];
  const mobileScore = latestScore?.mobile || 0;
  const desktopScore = latestScore?.desktop || 0;
  const trend = calculateTrend(history);
  const checksCount = history.length;

  const subject = `90 days of keeping watch`;

  const tip = latestScore
    ? getOptimizationTip(latestScore.vitals, mobileScore, desktopScore)
    : "Continue monitoring for consistent performance.";

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px;">Hey ${escapeHtml(firstName)},</p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      Three months in! I've now run <strong>${checksCount} performance checks</strong> on your site.
      Here's your quarterly snapshot.
    </p>

    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Q1 Performance Summary</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Mobile Score</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 20px; color: ${getScoreColor(mobileScore)};">${mobileScore}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Desktop Score</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 20px; color: ${getScoreColor(desktopScore)};">${desktopScore}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Quarterly Trend</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 20px;">${getTrendEmoji(trend)} ${trend.charAt(0).toUpperCase() + trend.slice(1)}</strong>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px; font-size: 16px; background-color: #e8f4fd; border-left: 4px solid #1a365d; padding: 16px;">
      <strong>Quarterly tip:</strong> ${escapeHtml(tip)}
    </p>

    <p style="margin: 0 0 24px; font-size: 16px;">
      The web moves fast, but your site doesn't have to struggle to keep up.
      I'll continue monitoring and let you know if anything needs your attention.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px;">
      <tr>
        <td style="background-color: #1a365d; border-radius: 6px;">
          <a href="mailto:support@shipyard.company?subject=Request detailed report for ${escapeHtml(customer.siteUrl)}"
             style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Request Detailed Report
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 16px;">
      Onwards and upwards,<br>
      <strong>The Anchor Team</strong>
    </p>
  `;

  const html = wrapEmailHTML(
    generateEmailHeader("Your Quarterly Refresh") +
    generateEmailBody(content) +
    generateEmailFooter(),
    "90 days in - here's your quarterly performance snapshot."
  );

  return { subject, html };
}

/**
 * Anniversary Email
 * One year celebration and summary
 */
function generateAnniversaryEmail(
  customer: Customer,
  firstName: string
): { subject: string; html: string } {
  const history = customer.pagespeedHistory;
  const checksCount = history.length;
  const latestScore = history[history.length - 1];
  const mobileScore = latestScore?.mobile || 0;

  // Calculate average score over the year
  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, r) => sum + r.mobile, 0) / history.length)
    : 0;

  const subject = `Happy Anniversary, ${firstName}!`;

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px;">Hey ${escapeHtml(firstName)},</p>

    <p style="margin: 0 0 16px; font-size: 16px;">
      Can you believe it's been a whole year? Time flies when your site is running smoothly!
    </p>

    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Your Year in Numbers</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Performance Checks</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 24px; color: #1a365d;">${checksCount}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Average Mobile Score</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 24px; color: ${getScoreColor(avgScore)};">${avgScore}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="font-size: 16px;">Current Score</span>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            <strong style="font-size: 24px; color: ${getScoreColor(mobileScore)};">${mobileScore}</strong>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px; font-size: 16px;">
      Thank you for trusting Anchor with your site's performance. It's been a privilege to have your back this past year.
    </p>

    <p style="margin: 0 0 24px; font-size: 16px;">
      Here's to another year of fast load times, happy visitors, and peace of mind.
      As always, I'm just an email away if you need anything.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px;">
      <tr>
        <td style="background-color: #1a365d; border-radius: 6px;">
          <a href="mailto:support@shipyard.company?subject=Thanks for a great year!"
             style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Say Hello
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 16px;">
      Cheers to year two,<br>
      <strong>The Anchor Team</strong>
    </p>
  `;

  const html = wrapEmailHTML(
    generateEmailHeader("Happy Anniversary!") +
    generateEmailBody(content) +
    generateEmailFooter(),
    "One year with Anchor - thank you!"
  );

  return { subject, html };
}

/**
 * Get color for score display
 */
function getScoreColor(score: number): string {
  if (score >= 90) return "#0d6832"; // Green
  if (score >= 50) return "#b45309"; // Orange
  return "#b91c1c"; // Red
}

/**
 * Get emoji for trend display
 */
function getTrendEmoji(trend: "improving" | "stable" | "declining"): string {
  switch (trend) {
    case "improving": return "\u2191"; // Up arrow
    case "declining": return "\u2193"; // Down arrow
    default: return "\u2192"; // Right arrow (stable)
  }
}
