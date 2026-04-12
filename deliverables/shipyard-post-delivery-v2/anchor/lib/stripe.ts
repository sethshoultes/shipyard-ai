/**
 * Anchor — Stripe API Wrapper
 *
 * Per decisions.md: Stripe integration for subscriptions
 * Pattern from: /apps/pulse/lib/stripe.ts
 *
 * Handles:
 * - Webhook signature verification
 * - Subscription lifecycle events
 * - Idempotency key generation
 */

import type { SubscriptionTier, StripeEventType } from "./types";

/**
 * Stripe error types for user-friendly error handling
 */
export interface StripeError {
  code: string;
  message: string;
  type: "card_error" | "validation_error" | "api_error" | "unknown_error";
  userMessage: string;
}

/**
 * Subscription status enum (matches Stripe's statuses)
 */
export enum SubscriptionStatus {
  TRIALING = "trialing",
  ACTIVE = "active",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
}

/**
 * Webhook event structure (simplified for our use case)
 */
export interface StripeWebhookEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: {
      id: string;
      customer: string;
      status?: string;
      metadata?: Record<string, string>;
      items?: {
        data: Array<{
          price: {
            id: string;
            metadata?: Record<string, string>;
          };
        }>;
      };
    };
  };
  created: number;
}

/**
 * Extracted customer data from webhook event
 */
export interface WebhookCustomerData {
  email: string;
  name: string;
  siteUrl: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: string;
}

/**
 * Generate an idempotency key for Stripe API calls
 * All Stripe calls must include an idempotency key to ensure idempotent operations
 * and prevent duplicate charges/transactions.
 *
 * @returns A unique idempotency key (UUID v4 format)
 */
export function generateIdempotencyKey(): string {
  // Use crypto.randomUUID if available, otherwise generate manually
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Verify Stripe webhook signature
 *
 * Uses timing-safe comparison to prevent timing attacks
 *
 * @param payload - Raw request body as string
 * @param signature - Stripe-Signature header value
 * @param secret - Webhook signing secret
 * @returns true if signature is valid
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse signature header
    const parts = signature.split(",");
    const sigParts: Record<string, string> = {};

    for (const part of parts) {
      const [key, value] = part.split("=");
      sigParts[key] = value;
    }

    const timestamp = sigParts["t"];
    const expectedSig = sigParts["v1"];

    if (!timestamp || !expectedSig) {
      console.error("[Stripe] Invalid signature format");
      return false;
    }

    // Check timestamp is within tolerance (5 minutes)
    const timestampAge = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
    if (timestampAge > 300) {
      console.error("[Stripe] Webhook timestamp too old");
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    const computedSig = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Timing-safe comparison
    return timingSafeEqual(computedSig, expectedSig);
  } catch (error) {
    console.error("[Stripe] Signature verification error:", error);
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Parse Stripe webhook event
 *
 * @param rawBody - Raw request body as string
 * @returns Parsed event or null if invalid
 */
export function parseWebhookEvent(
  rawBody: string
): StripeWebhookEvent | null {
  try {
    return JSON.parse(rawBody) as StripeWebhookEvent;
  } catch {
    console.error("[Stripe] Failed to parse webhook event");
    return null;
  }
}

/**
 * Extract tier from Stripe price ID metadata
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  // Convention: price IDs contain tier name
  // e.g., price_anchor_basic_monthly, price_anchor_pro_monthly
  if (priceId.toLowerCase().includes("pro")) {
    return "pro" as SubscriptionTier;
  }
  return "basic" as SubscriptionTier;
}

/**
 * Handle Stripe errors and convert them to user-friendly messages
 */
export function handleStripeError(error: unknown): StripeError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("card") || message.includes("declined")) {
      return {
        code: "card_error",
        message: error.message,
        type: "card_error",
        userMessage:
          "Your card was declined. Please check your card details and try again.",
      };
    }

    if (message.includes("invalid") || message.includes("validation")) {
      return {
        code: "validation_error",
        message: error.message,
        type: "validation_error",
        userMessage:
          "There was an issue with your request. Please check your information and try again.",
      };
    }

    return {
      code: "api_error",
      message: error.message,
      type: "api_error",
      userMessage:
        "A payment processing error occurred. Please try again in a few moments.",
    };
  }

  return {
    code: "unknown_error",
    message: "Unknown error",
    type: "unknown_error",
    userMessage:
      "An unexpected error occurred. Please try again or contact support.",
  };
}

/**
 * Map Stripe subscription status to our customer status
 */
export function mapSubscriptionStatus(
  stripeStatus: string
): "active" | "paused" | "cancelled" | "past_due" {
  switch (stripeStatus) {
    case SubscriptionStatus.ACTIVE:
    case SubscriptionStatus.TRIALING:
      return "active";
    case SubscriptionStatus.PAST_DUE:
    case SubscriptionStatus.UNPAID:
      return "past_due";
    case SubscriptionStatus.CANCELED:
    case SubscriptionStatus.INCOMPLETE_EXPIRED:
      return "cancelled";
    case SubscriptionStatus.INCOMPLETE:
    default:
      return "paused";
  }
}
