/**
 * Anchor — Customer Data Schema
 *
 * Per decisions.md:
 * - JSON storage until 100 customers (no database)
 * - Three required tracking fields: lastContact, nextTouch, status
 * - Email send tracking for 5 scheduled emails
 * - PageSpeed history array
 *
 * Per REQ-028 (Operations Tracking):
 * - Last Contact
 * - Next Touch
 * - Status
 */

import type {
  Customer,
  CustomersData,
  EmailsSent,
  PageSpeedResult,
  SubscriptionTier,
  CustomerStatus,
} from "../lib/types";

/**
 * Default email tracking state for new customers
 */
export function createDefaultEmailsSent(): EmailsSent {
  return {
    launchDay: false,
    week1: false,
    month1: false,
    q1Refresh: false,
    anniversary: false,
  };
}

/**
 * Calculate next touch date based on email schedule
 *
 * Email schedule from decisions.md MVP:
 * - Launch Day: Day 0 (enrollment day)
 * - Week 1: Day 7
 * - Month 1: Day 30
 * - Q1 Refresh: Day 90
 * - Anniversary: Day 365
 */
export function calculateNextTouch(
  enrollmentDate: string,
  emailsSent: EmailsSent
): string {
  const enrollment = new Date(enrollmentDate);
  const today = new Date();

  // Find next unsent email
  const schedule: Array<{ key: keyof EmailsSent; days: number }> = [
    { key: "launchDay", days: 0 },
    { key: "week1", days: 7 },
    { key: "month1", days: 30 },
    { key: "q1Refresh", days: 90 },
    { key: "anniversary", days: 365 },
  ];

  for (const { key, days } of schedule) {
    if (!emailsSent[key]) {
      const touchDate = new Date(enrollment);
      touchDate.setDate(touchDate.getDate() + days);

      // If touch date is in the past, schedule for today
      if (touchDate < today) {
        return today.toISOString().split("T")[0];
      }

      return touchDate.toISOString().split("T")[0];
    }
  }

  // All emails sent, next touch is next anniversary
  const nextAnniversary = new Date(enrollment);
  while (nextAnniversary < today) {
    nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
  }

  return nextAnniversary.toISOString().split("T")[0];
}

/**
 * Create a new customer record
 */
export function createCustomer(params: {
  id: string;
  email: string;
  name: string;
  siteUrl: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
}): Customer {
  const today = new Date().toISOString().split("T")[0];
  const emailsSent = createDefaultEmailsSent();

  return {
    id: params.id,
    email: params.email,
    name: params.name,
    siteUrl: params.siteUrl,
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    tier: params.tier,
    enrollmentDate: today,
    subscriptionStatus: "active",
    lastContact: today,
    nextTouch: calculateNextTouch(today, emailsSent),
    status: "active" as CustomerStatus,
    emailsSent,
    pagespeedHistory: [],
  };
}

/**
 * Validate customer record
 */
export function validateCustomer(customer: Partial<Customer>): string[] {
  const errors: string[] = [];

  if (!customer.id) errors.push("id is required");
  if (!customer.email) errors.push("email is required");
  if (!customer.name) errors.push("name is required");
  if (!customer.siteUrl) errors.push("siteUrl is required");
  if (!customer.stripeCustomerId) errors.push("stripeCustomerId is required");
  if (!customer.stripeSubscriptionId)
    errors.push("stripeSubscriptionId is required");
  if (!customer.tier) errors.push("tier is required");
  if (!customer.enrollmentDate) errors.push("enrollmentDate is required");
  if (!customer.status) errors.push("status is required");

  // Validate email format
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.push("email format is invalid");
  }

  // Validate URL format
  if (customer.siteUrl) {
    try {
      new URL(customer.siteUrl);
    } catch {
      errors.push("siteUrl format is invalid");
    }
  }

  // Validate tier
  if (customer.tier && !["basic", "pro"].includes(customer.tier)) {
    errors.push('tier must be "basic" or "pro"');
  }

  // Validate status
  if (
    customer.status &&
    !["active", "paused", "cancelled", "past_due"].includes(customer.status)
  ) {
    errors.push('status must be "active", "paused", "cancelled", or "past_due"');
  }

  return errors;
}

/**
 * Create empty customers data structure
 */
export function createEmptyCustomersData(): CustomersData {
  return {
    customers: [],
    lastUpdated: new Date().toISOString(),
    version: "1.0.0",
  };
}

/**
 * Get days since enrollment for a customer
 */
export function getDaysSinceEnrollment(enrollmentDate: string): number {
  const enrollment = new Date(enrollmentDate);
  const today = new Date();
  const diffTime = today.getTime() - enrollment.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine which email is due based on days since enrollment
 *
 * Returns null if no email is due
 */
export function getEmailDue(
  daysSinceEnrollment: number,
  emailsSent: EmailsSent
): keyof EmailsSent | null {
  // Check in order of schedule
  if (daysSinceEnrollment >= 0 && !emailsSent.launchDay) return "launchDay";
  if (daysSinceEnrollment >= 7 && !emailsSent.week1) return "week1";
  if (daysSinceEnrollment >= 30 && !emailsSent.month1) return "month1";
  if (daysSinceEnrollment >= 90 && !emailsSent.q1Refresh) return "q1Refresh";
  if (daysSinceEnrollment >= 365 && !emailsSent.anniversary) return "anniversary";

  return null;
}

/**
 * Trim PageSpeed history to 52 weeks (rolling window)
 */
export function trimPagespeedHistory(
  history: PageSpeedResult[]
): PageSpeedResult[] {
  if (history.length <= 52) return history;
  return history.slice(-52);
}
