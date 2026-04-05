import type { PluginContext } from "emdash";

/**
 * Email module for CommerceKit
 * Sends order confirmation, shipping notification, and cancellation emails via Resend API.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend API.
 * Graceful failure - returns false if Resend not configured or call fails.
 */
export async function sendEmail(
  ctx: PluginContext,
  options: EmailOptions
): Promise<boolean> {
  try {
    // @ts-ignore - ctx.env is available at runtime
    const resendKey = ctx.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
    // @ts-ignore - ctx.env is available at runtime
    const fromEmail = ctx.env?.STORE_FROM_EMAIL || process.env.STORE_FROM_EMAIL;

    if (!resendKey || !fromEmail) {
      ctx.log.warn("Resend API key or from email not configured — skipping email");
      return false;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      ctx.log.error(`Resend API error: ${response.status} ${error}`);
      return false;
    }

    ctx.log.info(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    ctx.log.error(`Failed to send email: ${String(error)}`);
    return false;
  }
}

/**
 * Escape HTML entities to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format price in cents to display string (e.g., 2999 -> "$29.99").
 */
function formatPrice(cents: number, currency: string): string {
  const symbol = currency.toLowerCase() === "usd" ? "$" : currency.toUpperCase() + " ";
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

export interface OrderForEmail {
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  customer: { name: string; email: string };
  trackingNumber?: string;
  shippingMethod?: string;
}

/**
 * Generate HTML email template for order confirmation.
 */
export function generateOrderConfirmationHTML(order: OrderForEmail): string {
  const itemsRows = order.items
    .map(
      (item) => `<tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px;">${escapeHtml(item.name)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: right;">${formatPrice(item.price * item.quantity, order.currency)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #C4704B; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 18px;">Order Confirmation</h2>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Order ${escapeHtml(order.orderNumber)}</p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px; font-size: 15px;">
      Hi ${escapeHtml(order.customer.name)}, thank you for your order!
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <thead>
        <tr style="background: #faf8f5;">
          <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #7A8B6F; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
          <th style="padding: 8px 12px; text-align: center; font-size: 13px; color: #7A8B6F; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 13px; color: #7A8B6F; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
      <tr>
        <td style="padding: 4px 12px; color: #666;">Subtotal</td>
        <td style="padding: 4px 12px; text-align: right;">${formatPrice(order.subtotal, order.currency)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 12px; color: #666;">Tax</td>
        <td style="padding: 4px 12px; text-align: right;">${formatPrice(order.tax, order.currency)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 12px; color: #666;">Shipping</td>
        <td style="padding: 4px 12px; text-align: right;">${formatPrice(order.shipping, order.currency)}</td>
      </tr>
      <tr style="font-weight: 700; font-size: 16px;">
        <td style="padding: 8px 12px; border-top: 2px solid #D4A853; color: #2c2c2c;">Total</td>
        <td style="padding: 8px 12px; border-top: 2px solid #D4A853; text-align: right; color: #C4704B;">${formatPrice(order.total, order.currency)}</td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 12px;" />
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      You will receive a shipping notification when your order is on its way.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML email template for shipping notification.
 */
export function generateShippingNotificationHTML(order: OrderForEmail): string {
  const trackingInfo = order.trackingNumber
    ? `<p style="margin: 0 0 12px; font-size: 15px;">
        <strong>Tracking Number:</strong> ${escapeHtml(order.trackingNumber)}
      </p>`
    : "";

  const shippingMethodInfo = order.shippingMethod
    ? `<p style="margin: 0 0 12px; font-size: 14px; color: #666;">
        <strong>Shipping Method:</strong> ${escapeHtml(order.shippingMethod)}
      </p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #7A8B6F; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 18px;">Your Order Has Shipped!</h2>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Order ${escapeHtml(order.orderNumber)}</p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px; font-size: 15px;">
      Hi ${escapeHtml(order.customer.name)}, great news! Your order is on its way.
    </p>

    ${trackingInfo}
    ${shippingMethodInfo}

    <div style="background: #faf8f5; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #7A8B6F; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Items Shipped</p>
      ${order.items
        .map(
          (item) => `<p style="margin: 4px 0; font-size: 14px;">${escapeHtml(item.name)} x ${item.quantity}</p>`
        )
        .join("")}
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 12px;" />
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      If you have any questions about your order, please reply to this email.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML email template for order cancellation.
 */
export function generateOrderCancelledHTML(order: OrderForEmail): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #b91c1c; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 18px;">Order Cancelled</h2>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Order ${escapeHtml(order.orderNumber)}</p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px; font-size: 15px;">
      Hi ${escapeHtml(order.customer.name)}, your order has been cancelled.
    </p>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Cancelled Items</p>
      ${order.items
        .map(
          (item) => `<p style="margin: 4px 0; font-size: 14px;">${escapeHtml(item.name)} x ${item.quantity} - ${formatPrice(item.price * item.quantity, order.currency)}</p>`
        )
        .join("")}
    </div>

    <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
      <tr style="font-weight: 700;">
        <td style="padding: 4px 12px; color: #666;">Refund Amount</td>
        <td style="padding: 4px 12px; text-align: right; color: #C4704B;">${formatPrice(order.total, order.currency)}</td>
      </tr>
    </table>

    <p style="margin: 0 0 12px; font-size: 14px; color: #666;">
      A refund will be processed to your original payment method within 5-10 business days.
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 12px;" />
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      If you did not request this cancellation, please contact us immediately.
    </p>
  </div>
</body>
</html>`;
}
