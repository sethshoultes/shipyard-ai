/**
 * CommerceKit Email Template Tests
 *
 * Covers:
 *   - Order confirmation HTML rendering
 *   - Shipping notification HTML rendering
 *   - Order cancellation HTML rendering
 */

import { describe, it, expect } from "vitest";
import {
  generateOrderConfirmationHTML,
  generateShippingNotificationHTML,
  generateOrderCancelledHTML,
} from "../email";
import type { OrderForEmail } from "../email";

function createTestOrderEmail(overrides?: Partial<OrderForEmail>): OrderForEmail {
  return {
    orderNumber: overrides?.orderNumber ?? "ORD-1001",
    items: overrides?.items ?? [
      { name: "Espresso Blend", quantity: 2, price: 1499 },
      { name: "Ceramic Mug", quantity: 1, price: 2500 },
    ],
    subtotal: overrides?.subtotal ?? 5498,
    tax: overrides?.tax ?? 440,
    shipping: overrides?.shipping ?? 500,
    total: overrides?.total ?? 6438,
    currency: overrides?.currency ?? "usd",
    customer: overrides?.customer ?? { name: "Jane Doe", email: "jane@example.com" },
    trackingNumber: overrides?.trackingNumber,
    shippingMethod: overrides?.shippingMethod,
  };
}

describe("generateOrderConfirmationHTML", () => {
  it("should render order confirmation with all items and totals", () => {
    const order = createTestOrderEmail();
    const html = generateOrderConfirmationHTML(order);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Order Confirmation");
    expect(html).toContain("ORD-1001");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("Espresso Blend");
    expect(html).toContain("Ceramic Mug");
    // Check price formatting
    expect(html).toContain("$54.98"); // subtotal
    expect(html).toContain("$4.40"); // tax
    expect(html).toContain("$5.00"); // shipping
    expect(html).toContain("$64.38"); // total
    // Brand color
    expect(html).toContain("#C4704B");
    expect(html).toContain("#D4A853");
  });
});

describe("generateShippingNotificationHTML", () => {
  it("should render shipping notification with tracking number", () => {
    const order = createTestOrderEmail({
      trackingNumber: "1Z999AA10123456784",
      shippingMethod: "UPS Ground",
    });
    const html = generateShippingNotificationHTML(order);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Your Order Has Shipped");
    expect(html).toContain("ORD-1001");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("1Z999AA10123456784");
    expect(html).toContain("UPS Ground");
    expect(html).toContain("Espresso Blend");
    expect(html).toContain("Ceramic Mug");
  });
});

describe("generateOrderCancelledHTML", () => {
  it("should render cancellation email with refund amount", () => {
    const order = createTestOrderEmail();
    const html = generateOrderCancelledHTML(order);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Order Cancelled");
    expect(html).toContain("ORD-1001");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("Espresso Blend");
    expect(html).toContain("$64.38"); // refund amount = total
    expect(html).toContain("refund");
    // Red theme for cancellation
    expect(html).toContain("#b91c1c");
  });
});
