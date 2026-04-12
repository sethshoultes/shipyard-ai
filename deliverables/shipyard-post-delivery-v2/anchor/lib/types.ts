/**
 * Anchor — Shared TypeScript Interfaces
 *
 * Per decisions.md: All shared types for the post-delivery system
 */

/**
 * Subscription tier enum
 * Per decisions.md: Two tiers only (Basic/Pro)
 */
export enum SubscriptionTier {
  BASIC = "basic",
  PRO = "pro",
}

/**
 * Customer status enum
 * Per REQ-028: Operations Tracking requires Status field
 */
export enum CustomerStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  PAST_DUE = "past_due",
}

/**
 * Email types matching the 5 scheduled emails
 * Per decisions.md: Launch Day, Week 1, Month 1, Q1 Refresh, Anniversary
 */
export enum EmailType {
  LAUNCH_DAY = "launchDay",
  WEEK_1 = "week1",
  MONTH_1 = "month1",
  Q1_REFRESH = "q1Refresh",
  ANNIVERSARY = "anniversary",
}

/**
 * Email send tracking
 * Tracks which of the 5 emails have been sent to a customer
 */
export interface EmailsSent {
  launchDay: boolean;
  week1: boolean;
  month1: boolean;
  q1Refresh: boolean;
  anniversary: boolean;
}

/**
 * PageSpeed result for a single measurement
 */
export interface PageSpeedResult {
  date: string;
  desktop: number;
  mobile: number;
  vitals: CoreWebVitals;
}

/**
 * Core Web Vitals metrics
 */
export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
}

/**
 * Customer record
 * Per REQ-028: Last Contact, Next Touch, Status required
 * Per decisions.md: JSON storage until 100 customers
 */
export interface Customer {
  // Identity
  id: string;
  email: string;
  name: string;
  siteUrl: string;

  // Stripe integration
  stripeCustomerId: string;
  stripeSubscriptionId: string;

  // Subscription
  tier: SubscriptionTier;
  enrollmentDate: string; // ISO date
  subscriptionStatus: string;

  // Operations tracking (REQ-028)
  lastContact: string; // ISO date
  nextTouch: string; // ISO date
  status: CustomerStatus;

  // Email tracking
  emailsSent: EmailsSent;

  // PageSpeed history (52-week rolling window)
  pagespeedHistory: PageSpeedResult[];
  lastPagespeedRun?: string; // ISO date

  // Test flag
  test?: boolean;
}

/**
 * Customers JSON file structure
 */
export interface CustomersData {
  customers: Customer[];
  lastUpdated: string;
  version: string;
}

/**
 * Email send request
 */
export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Email send response
 */
export interface EmailResponse {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * PageSpeed API configuration
 */
export interface PageSpeedConfig {
  apiKey: string;
  strategy: "desktop" | "mobile";
}

/**
 * PageSpeed API response (simplified)
 */
export interface PageSpeedAPIResponse {
  lighthouseResult: {
    categories: {
      performance: {
        score: number;
      };
    };
    audits: {
      "largest-contentful-paint"?: { numericValue: number };
      "first-input-delay"?: { numericValue: number };
      "cumulative-layout-shift"?: { numericValue: number };
      "first-contentful-paint"?: { numericValue: number };
      "server-response-time"?: { numericValue: number };
    };
  };
}

/**
 * Stripe webhook event types we handle
 */
export type StripeEventType =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_failed";

/**
 * Environment variables for Cloudflare Workers
 */
export interface Env {
  RESEND_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAGESPEED_API_KEY: string;
  FROM_EMAIL: string;
  SUPPORT_EMAIL: string;
}

/**
 * Cron event from Cloudflare Workers
 */
export interface CronEvent {
  cron: string;
  type: "scheduled";
  scheduledTime: number;
}

/**
 * Performance trend for Q1 Refresh email
 */
export type PerformanceTrend = "improving" | "stable" | "declining";

/**
 * Calculate performance trend from history
 */
export function calculateTrend(history: PageSpeedResult[]): PerformanceTrend {
  if (history.length < 4) return "stable";

  const recent = history.slice(-4);
  const avgRecent =
    recent.reduce((sum, r) => sum + r.mobile, 0) / recent.length;
  const older = history.slice(-8, -4);
  if (older.length < 4) return "stable";

  const avgOlder = older.reduce((sum, r) => sum + r.mobile, 0) / older.length;

  const diff = avgRecent - avgOlder;
  if (diff > 5) return "improving";
  if (diff < -5) return "declining";
  return "stable";
}
