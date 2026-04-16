/**
 * Payments Template Generator
 *
 * Generates src/payments.ts with Stripe checkout session creation and webhook handler
 * for checkout.session.completed event.
 *
 * CRITICAL SECURITY: Webhook signature verification is mandatory to prevent payment fraud.
 * REQ-032, REQ-033, REQ-034, REQ-035, REQ-036 compliance:
 * - Stripe checkout session creation endpoint
 * - Webhook handler for checkout.session.completed
 * - REQUIRED webhook signature verification using crypto.createHmac
 * - Timing-safe comparison to prevent timing attacks
 * - Error if STRIPE_WEBHOOK_SECRET missing in production
 *
 * References:
 * - Stripe Webhook Verification: https://stripe.com/docs/webhooks/signatures
 * - Node.js crypto module: https://nodejs.org/api/crypto.html
 */

/**
 * Generate src/payments.ts with Stripe checkout session creation and webhook handler
 *
 * Features:
 * 1. POST /api/checkout - Creates a Stripe checkout session
 * 2. POST /api/stripe-webhook - Handles Stripe webhook events
 * 3. Webhook signature verification (security-critical)
 * 4. Timing-safe comparison to prevent timing attacks
 * 5. Actionable error messages for missing secrets
 *
 * @returns Complete payments.ts file content as string
 *
 * @example
 * const paymentsTs = generatePaymentsTs();
 * // Returns ready-to-write payments.ts file content
 */
export function generatePaymentsTs(): string {
  return `/**
 * Stripe Payments Integration
 *
 * Handles Stripe checkout session creation and webhook event processing.
 *
 * CRITICAL SECURITY WARNING:
 * ⚠️ Webhook signature verification is REQUIRED to prevent payment fraud.
 * Never trust webhook events without validating the signature with your
 * STRIPE_WEBHOOK_SECRET. A compromised webhook handler can lead to:
 * - Unauthorized payment confirmations
 * - Revenue fraud
 * - Customer account compromise
 *
 * This integration includes mandatory signature verification.
 * Do NOT remove or bypass the verification code.
 *
 * Setup:
 * 1. Get STRIPE_SECRET_KEY from https://dashboard.stripe.com/apikeys
 * 2. Get STRIPE_WEBHOOK_SECRET from https://dashboard.stripe.com/webhooks
 * 3. Configure webhook endpoint: POST /api/stripe-webhook in Stripe dashboard
 * 4. Set STRIPE_PUBLISHABLE_KEY in your frontend .env
 *
 * Documentation: https://stripe.com/docs/payments/checkout
 * Webhook Security: https://stripe.com/docs/webhooks/signatures
 */

import { Context } from 'hono';
import crypto from 'crypto';

/**
 * Create a Stripe checkout session
 *
 * This endpoint creates a Stripe checkout session for a payment.
 * The checkout session URL is returned to the client.
 *
 * Request body:
 * {
 *   "successUrl": "https://yourdomain.com/success",
 *   "cancelUrl": "https://yourdomain.com/cancel",
 *   "priceId": "price_xxx", // Stripe price ID
 *   "quantity": 1
 * }
 *
 * Example usage:
 * \`\`\`typescript
 * const response = await fetch('/api/checkout', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     successUrl: window.location.origin + '/success',
 *     cancelUrl: window.location.origin + '/cancel',
 *     priceId: 'price_xxx',
 *     quantity: 1,
 *   }),
 * });
 * const { checkoutUrl } = await response.json();
 * window.location.href = checkoutUrl;
 * \`\`\`
 *
 * @param c Hono context with Stripe secret key in env
 * @returns JSON with checkout session URL or error
 */
export async function createCheckoutSession(c: Context): Promise<Response> {
  const stripeSecretKey = c.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error('[Payments] STRIPE_SECRET_KEY not found in environment');
    return c.json(
      {
        error: 'Payment configuration incomplete',
        message: 'STRIPE_SECRET_KEY not configured',
        help: 'Get your key from: https://dashboard.stripe.com/apikeys',
      },
      500
    );
  }

  try {
    const body = await c.req.json();
    const { successUrl, cancelUrl, priceId, quantity } = body;

    if (!successUrl || !cancelUrl || !priceId) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'Missing required fields: successUrl, cancelUrl, priceId',
        },
        400
      );
    }

    // Create checkout session using Stripe API
    // Note: In production, use the official Stripe SDK:
    // import Stripe from 'stripe';
    // const stripe = new Stripe(stripeSecretKey);
    // const session = await stripe.checkout.sessions.create({ ... })

    // For this template, we'll show the API call pattern:
    const checkoutSessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${stripeSecretKey}\`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'payment',
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': String(quantity || 1),
      }),
    });

    if (!checkoutSessionResponse.ok) {
      const error = await checkoutSessionResponse.text();
      console.error('[Payments] Stripe API error:', error);
      return c.json(
        {
          error: 'Failed to create checkout session',
          message: 'Stripe API error',
        },
        500
      );
    }

    const checkoutSession = await checkoutSessionResponse.json();

    return c.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Payments] Checkout error:', message);
    return c.json(
      {
        error: 'Failed to create checkout session',
        message,
      },
      500
    );
  }
}

/**
 * CRITICAL: Timing-safe string comparison
 *
 * Prevents timing attacks by comparing signatures in constant time.
 * Never use === for comparing signatures!
 * A naive comparison leaks information about the signature through response time.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings match, false otherwise (in constant time)
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Use Node.js crypto.timingSafeEqual if both are Buffers
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    // Fall back to length check + constant-time loop for string comparison
    // This prevents leaking information about string length
    let isEqual = a.length === b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if ((a.charCodeAt(i) || 0) !== (b.charCodeAt(i) || 0)) {
        isEqual = false;
      }
    }
    return isEqual;
  }
}

/**
 * Handle Stripe webhook events
 *
 * CRITICAL SECURITY:
 * ⚠️ Signature verification is REQUIRED to prevent payment fraud.
 * Never process webhook events without verifying the signature.
 *
 * This handler validates the webhook signature using crypto.createHmac
 * with timing-safe comparison. Only verified events are processed.
 *
 * Supported events:
 * - checkout.session.completed: Payment successfully completed
 *
 * Setup:
 * 1. Get STRIPE_WEBHOOK_SECRET from https://dashboard.stripe.com/webhooks
 * 2. Configure this endpoint (POST /api/stripe-webhook) as webhook endpoint
 * 3. Test webhook: Use Stripe CLI or dashboard testing tools
 *
 * Example webhook event:
 * {
 *   "id": "evt_xxx",
 *   "type": "checkout.session.completed",
 *   "data": {
 *     "object": {
 *       "id": "cs_xxx",
 *       "status": "complete",
 *       "customer_email": "user@example.com",
 *       "payment_status": "paid"
 *     }
 *   }
 * }
 *
 * @param c Hono context with Stripe webhook secret in env
 * @returns JSON response (always 200 after verification, 403 if invalid signature)
 */
export async function handleStripeWebhook(c: Context): Promise<Response> {
  const stripeWebhookSecret = c.env.STRIPE_WEBHOOK_SECRET;

  // CRITICAL: Webhook secret MUST be configured in production
  // Without it, your payments are vulnerable to fraud
  if (!stripeWebhookSecret) {
    console.error('[Payments] CRITICAL: STRIPE_WEBHOOK_SECRET not configured. You are vulnerable to fraud.');
    return c.json(
      {
        error: 'Webhook configuration incomplete',
        message: 'STRIPE_WEBHOOK_SECRET not configured in production',
        help: 'Get your webhook secret from: https://dashboard.stripe.com/webhooks',
        critical: true,
      },
      500
    );
  }

  try {
    // Get the raw request body (needed for signature verification)
    const rawBody = await c.req.text();

    // Get the Stripe signature from headers
    const signatureHeader = c.req.header('stripe-signature');

    if (!signatureHeader) {
      console.warn('[Payments] Webhook received without signature header - rejecting unsigned request');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Missing stripe-signature header',
        },
        403
      );
    }

    // SECURITY-CRITICAL: Verify webhook signature
    // ⚠️ This verification is REQUIRED to prevent payment fraud
    // Never skip this step, even for testing
    //
    // How it works:
    // 1. Stripe signs the webhook body using STRIPE_WEBHOOK_SECRET
    // 2. We recreate the signature using crypto.createHmac
    // 3. We compare our signature to Stripe's signature
    // 4. If they match, the webhook is authentic and safe to process
    //
    // Why it's important:
    // - Prevents attackers from sending fake payment confirmations
    // - Ensures only Stripe can trigger payment events
    // - Protects your revenue from fraud
    const computedSignature = crypto
      .createHmac('sha256', stripeWebhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    const stripeSignature = signatureHeader.split('v1=')[1];

    // SECURITY-CRITICAL: Use timing-safe comparison
    // Never use === to compare signatures!
    // Timing attacks can leak information about the signature
    if (!stripeSignature || !timingSafeEqual(computedSignature, stripeSignature)) {
      console.warn('[Payments] Webhook signature verification failed - rejecting unsigned/invalid webhook');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Invalid webhook signature',
        },
        403
      );
    }

    // Signature verified! Now process the event
    const event = JSON.parse(rawBody);

    console.log(\`[Payments] Processing Stripe event: \${event.type}\`);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // TODO: In production, you would:
      // 1. Store the payment in your database
      // 2. Update user subscription/account status
      // 3. Send confirmation email
      // 4. Trigger any necessary business logic

      console.log('[Payments] Checkout session completed:', {
        sessionId: session.id,
        status: session.status,
        customerEmail: session.customer_email,
        paymentStatus: session.payment_status,
      });

      // Example: Store payment in D1 database
      // if (c.env.DB) {
      //   await c.env.DB.prepare(
      //     \`INSERT INTO payments (stripe_session_id, customer_email, status, amount)
      //      VALUES (?, ?, ?, ?)\`
      //   )
      //     .bind(session.id, session.customer_email, session.payment_status, session.amount_total)
      //     .run();
      // }

      return c.json({ received: true });
    }

    // Acknowledge receipt of event (even if we don't handle it)
    return c.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Payments] Webhook error:', message);

    // Important: Return 200 so Stripe doesn't retry
    // We've logged the error, and returning 200 acknowledges receipt
    return c.json(
      {
        error: 'Webhook processing error',
        message,
      },
      200
    );
  }
}
`;
}
