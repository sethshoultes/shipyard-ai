/**
 * CommerceKit sandbox-entry tests.
 *
 * Covers: Product CRUD, validation, public routes, cart, checkout, orders,
 * inventory, settings, analytics, and edge cases. 35+ tests total.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createMockKV,
  createMockContext,
  buildRouteCtx,
  createTestProduct,
  createTestCart,
  createTestOrder,
  seedProduct,
  seedCart,
  seedOrder,
} from "./helpers";
import type { MockKV } from "./helpers";

vi.mock("emdash", () => ({
  definePlugin: (def: unknown) => def,
}));

// Mock fetch globally for Stripe + email
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  text: async () => "{}",
  json: async () => ({ id: "cs_test_123", url: "https://checkout.stripe.com/test", payment_status: "paid", metadata: { cartId: "cart-1", customerName: "Jane" }, customer_email: "jane@example.com", payment_intent: "pi_123" }),
});
global.fetch = mockFetch as unknown as typeof fetch;

// Import after mocks
const pluginModule = await import("../sandbox-entry");
const plugin = (pluginModule.default as unknown) as {
  hooks: Record<string, unknown>;
  routes: Record<string, { public?: boolean; handler: (routeCtx: unknown, ctx: unknown) => Promise<unknown> }>;
};
const routes = plugin.routes;

// =============================================================================
// PRODUCT CRUD (5 tests)
// =============================================================================
describe("Product CRUD", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
    mockFetch.mockClear();
  });

  it("should create a product with valid data", async () => {
    const routeCtx = buildRouteCtx({
      input: {
        name: "Espresso Blend",
        description: "Rich dark roast",
        price: 1499,
        currency: "usd",
        images: ["https://img.example.com/espresso.jpg"],
        category: "coffee",
      },
      user: { isAdmin: true },
    });

    const result = (await routes.createProduct.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.productId).toBeTruthy();
    expect(result.slug).toBe("espresso-blend");

    const stored = await kv.get<string>(`product:${result.productId}`);
    expect(stored).toBeTruthy();
    const product = JSON.parse(stored!);
    expect(product.name).toBe("Espresso Blend");
    expect(product.price).toBe(1499);
  });

  it("should get a product by ID", async () => {
    const product = createTestProduct({ id: "prod-get-1", name: "Latte Art Mug" });
    await seedProduct(kv, product);

    const routeCtx = buildRouteCtx({
      input: { productId: "prod-get-1" },
      user: { isAdmin: true },
    });
    const result = (await routes.getProduct.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.product.name).toBe("Latte Art Mug");
  });

  it("should update a product", async () => {
    const product = createTestProduct({ id: "prod-upd-1", name: "Old Name", price: 1000 });
    await seedProduct(kv, product);

    const routeCtx = buildRouteCtx({
      input: { productId: "prod-upd-1", name: "New Name", price: 1500 },
      user: { isAdmin: true },
    });
    const result = (await routes.updateProduct.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.product.name).toBe("New Name");
    expect(result.product.price).toBe(1500);
    expect(result.product.slug).toBe("new-name");
  });

  it("should soft-delete a product (archive)", async () => {
    const product = createTestProduct({ id: "prod-del-1", name: "To Archive" });
    await seedProduct(kv, product);

    const routeCtx = buildRouteCtx({
      input: { productId: "prod-del-1" },
      user: { isAdmin: true },
    });
    const result = (await routes.deleteProduct.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.deleted).toBe("soft");

    const stored = JSON.parse((await kv.get<string>("product:prod-del-1"))!);
    expect(stored.status).toBe("archived");
  });

  it("should list products with filters", async () => {
    await seedProduct(kv, createTestProduct({ id: "p1", name: "Active One", status: "active" }));
    await seedProduct(kv, createTestProduct({ id: "p2", name: "Draft One", status: "draft" }));
    await seedProduct(kv, createTestProduct({ id: "p3", name: "Active Two", status: "active", category: "tea" }));

    const routeCtx = buildRouteCtx({
      input: { status: "active" },
      user: { isAdmin: true },
    });
    const result = (await routes.listProducts.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});

// =============================================================================
// PRODUCT VALIDATION (3 tests)
// =============================================================================
describe("Product Validation", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should reject creation with missing name", async () => {
    const routeCtx = buildRouteCtx({
      input: { name: "", price: 1000 },
      user: { isAdmin: true },
    });
    await expect(routes.createProduct.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });

  it("should reject creation with invalid price", async () => {
    const routeCtx = buildRouteCtx({
      input: { name: "Good Product", price: -5 },
      user: { isAdmin: true },
    });
    await expect(routes.createProduct.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });

  it("should reject duplicate slug", async () => {
    await seedProduct(kv, createTestProduct({ id: "existing", name: "Unique Coffee", slug: "unique-coffee" }));

    const routeCtx = buildRouteCtx({
      input: { name: "Unique Coffee", price: 999 },
      user: { isAdmin: true },
    });
    await expect(routes.createProduct.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });
});

// =============================================================================
// PUBLIC PRODUCT ROUTES (2 tests)
// =============================================================================
describe("Public Product Routes", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should list only active products publicly", async () => {
    await seedProduct(kv, createTestProduct({ id: "pub-1", name: "Active", status: "active" }));
    await seedProduct(kv, createTestProduct({ id: "pub-2", name: "Draft", status: "draft", slug: "draft" }));
    await seedProduct(kv, createTestProduct({ id: "pub-3", name: "Archived", status: "archived", slug: "archived" }));

    const routeCtx = buildRouteCtx({ input: {} });
    const result = (await routes.listProductsPublic.handler(routeCtx, ctx)) as any;
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe("Active");
  });

  it("should get product by slug (only active)", async () => {
    await seedProduct(kv, createTestProduct({ id: "slug-1", name: "Coffee Beans", slug: "coffee-beans", status: "active" }));

    const routeCtx = buildRouteCtx({ input: { slug: "coffee-beans" } });
    const result = (await routes.getProductPublic.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.product.name).toBe("Coffee Beans");
  });
});

// =============================================================================
// CART (5 tests)
// =============================================================================
describe("Cart Management", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should create an empty cart", async () => {
    const routeCtx = buildRouteCtx({ input: {} });
    const result = (await routes.createCart.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.cartId).toBeTruthy();

    const stored = JSON.parse((await kv.get<string>(`cart:${result.cartId}`))!);
    expect(stored.items).toHaveLength(0);
  });

  it("should add item to cart", async () => {
    const product = createTestProduct({ id: "prod-cart-1", name: "Mug", price: 1500 });
    await seedProduct(kv, product);
    const cart = createTestCart({ id: "cart-add-1" });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { cartId: "cart-add-1", productId: "prod-cart-1", quantity: 2 },
    });
    const result = (await routes.addToCart.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.cart.items).toHaveLength(1);
    expect(result.cart.items[0].quantity).toBe(2);
    expect(result.cart.subtotal).toBe(3000);
  });

  it("should update cart item quantity", async () => {
    const product = createTestProduct({ id: "prod-cart-2", name: "Plate", price: 2000, inventory: { tracked: true, quantity: 10, lowStockThreshold: 2 } });
    await seedProduct(kv, product);
    const cart = createTestCart({
      id: "cart-upd-1",
      items: [{ productId: "prod-cart-2", quantity: 1, price: 2000, name: "Plate" }],
      subtotal: 2000,
    });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { cartId: "cart-upd-1", productId: "prod-cart-2", quantity: 3 },
    });
    const result = (await routes.updateCartItem.handler(routeCtx, ctx)) as any;
    expect(result.cart.items[0].quantity).toBe(3);
    expect(result.cart.subtotal).toBe(6000);
  });

  it("should remove item from cart", async () => {
    const cart = createTestCart({
      id: "cart-rm-1",
      items: [
        { productId: "p1", quantity: 1, price: 1000, name: "Item 1" },
        { productId: "p2", quantity: 1, price: 2000, name: "Item 2" },
      ],
      subtotal: 3000,
    });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { cartId: "cart-rm-1", productId: "p1" },
    });
    const result = (await routes.removeFromCart.handler(routeCtx, ctx)) as any;
    expect(result.cart.items).toHaveLength(1);
    expect(result.cart.items[0].productId).toBe("p2");
    expect(result.cart.subtotal).toBe(2000);
  });

  it("should clear all items from cart", async () => {
    const cart = createTestCart({
      id: "cart-clear-1",
      items: [
        { productId: "p1", quantity: 1, price: 1000, name: "Item 1" },
      ],
      subtotal: 1000,
    });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({ input: { cartId: "cart-clear-1" } });
    const result = (await routes.clearCart.handler(routeCtx, ctx)) as any;
    expect(result.cart.items).toHaveLength(0);
    expect(result.cart.subtotal).toBe(0);
  });
});

// =============================================================================
// CART VALIDATION (3 tests)
// =============================================================================
describe("Cart Validation", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should reject adding an invalid product to cart", async () => {
    const cart = createTestCart({ id: "cart-val-1" });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { cartId: "cart-val-1", productId: "nonexistent" },
    });
    await expect(routes.addToCart.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });

  it("should reject adding more than available inventory", async () => {
    const product = createTestProduct({
      id: "prod-inv-1",
      name: "Limited Item",
      price: 500,
      inventory: { tracked: true, quantity: 2, lowStockThreshold: 1 },
    });
    await seedProduct(kv, product);
    const cart = createTestCart({ id: "cart-val-2" });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { cartId: "cart-val-2", productId: "prod-inv-1", quantity: 5 },
    });
    await expect(routes.addToCart.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });

  it("should reject expired cart", async () => {
    const cart = createTestCart({
      id: "cart-expired",
      expiresAt: "2020-01-01T00:00:00.000Z",
    });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { cartId: "cart-expired", productId: "p1" },
    });
    await expect(routes.addToCart.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });
});

// =============================================================================
// CHECKOUT (3 tests)
// =============================================================================
describe("Checkout", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "{}",
      json: async () => ({ id: "cs_test_123", url: "https://checkout.stripe.com/test", payment_status: "paid", metadata: { cartId: "cart-checkout-1", customerName: "Jane Doe" }, customer_email: "jane@example.com", payment_intent: "pi_123" }),
    });
  });

  it("should create a Stripe checkout session", async () => {
    const cart = createTestCart({
      id: "cart-checkout-1",
      items: [{ productId: "p1", quantity: 1, price: 2999, name: "Widget" }],
      subtotal: 2999,
    });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: {
        cartId: "cart-checkout-1",
        customer: { name: "Jane Doe", email: "jane@example.com" },
      },
    });

    const result = (await routes.createCheckout.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe("cs_test_123");
    expect(result.checkoutUrl).toContain("stripe.com");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/checkout/sessions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should verify checkout success and create order", async () => {
    const product = createTestProduct({ id: "p-checkout", name: "Widget", price: 2999 });
    await seedProduct(kv, product);

    const cart = createTestCart({
      id: "cart-checkout-1",
      items: [{ productId: "p-checkout", quantity: 1, price: 2999, name: "Widget" }],
      subtotal: 2999,
    });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: { sessionId: "cs_test_123" },
    });

    const result = (await routes.checkoutSuccess.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.order).toBeTruthy();
    expect(result.order.orderNumber).toMatch(/^ORD-/);
    expect(result.order.status).toBe("paid");
    expect(result.order.customer.email).toBe("jane@example.com");
  });

  it("should reject empty cart at checkout", async () => {
    const cart = createTestCart({ id: "cart-empty-checkout", items: [], subtotal: 0 });
    await seedCart(kv, cart);

    const routeCtx = buildRouteCtx({
      input: {
        cartId: "cart-empty-checkout",
        customer: { name: "Jane", email: "jane@example.com" },
      },
    });
    await expect(routes.createCheckout.handler(routeCtx, ctx)).rejects.toBeInstanceOf(Response);
  });
});

// =============================================================================
// ORDER MANAGEMENT (4 tests)
// =============================================================================
describe("Order Management", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({ ok: true, text: async () => "{}", json: async () => ({}) });
  });

  it("should list orders", async () => {
    await seedOrder(kv, createTestOrder({ id: "o1", orderNumber: "ORD-1001" }));
    await seedOrder(kv, createTestOrder({ id: "o2", orderNumber: "ORD-1002", status: "shipped" }));

    const routeCtx = buildRouteCtx({ input: {}, user: { isAdmin: true } });
    const result = (await routes.listOrders.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.orders).toHaveLength(2);
  });

  it("should get order by ID", async () => {
    await seedOrder(kv, createTestOrder({ id: "o-get-1", orderNumber: "ORD-2001" }));

    const routeCtx = buildRouteCtx({
      input: { orderId: "o-get-1" },
      user: { isAdmin: true },
    });
    const result = (await routes.getOrder.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.order.orderNumber).toBe("ORD-2001");
  });

  it("should update order status and send shipping email", async () => {
    await seedOrder(kv, createTestOrder({ id: "o-ship-1", orderNumber: "ORD-3001", status: "processing" }));

    const routeCtx = buildRouteCtx({
      input: { orderId: "o-ship-1", status: "shipped", trackingNumber: "1Z999AA1" },
      user: { isAdmin: true },
    });
    const result = (await routes.updateOrderStatus.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.order.status).toBe("shipped");
    expect(result.order.trackingNumber).toBe("1Z999AA1");
    // Should have sent shipping email via fetch (Resend)
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should cancel order and restore inventory", async () => {
    const product = createTestProduct({
      id: "prod-cancel",
      name: "Widget",
      price: 2999,
      inventory: { tracked: true, quantity: 8, lowStockThreshold: 2 },
    });
    await seedProduct(kv, product);

    const order = createTestOrder({
      id: "o-cancel-1",
      orderNumber: "ORD-4001",
      status: "paid",
      items: [{ productId: "prod-cancel", quantity: 2, price: 2999, name: "Widget" }],
    });
    await seedOrder(kv, order);

    const routeCtx = buildRouteCtx({
      input: { orderId: "o-cancel-1" },
      user: { isAdmin: true },
    });
    const result = (await routes.cancelOrder.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.order.status).toBe("cancelled");

    // Inventory should be restored
    const updated = JSON.parse((await kv.get<string>("product:prod-cancel"))!);
    expect(updated.inventory.quantity).toBe(10); // 8 + 2
  });
});

// =============================================================================
// INVENTORY (4 tests)
// =============================================================================
describe("Inventory", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should get inventory for a product", async () => {
    await seedProduct(kv, createTestProduct({ id: "inv-1", name: "Cup", inventory: { tracked: true, quantity: 25, lowStockThreshold: 5 } }));

    const routeCtx = buildRouteCtx({
      input: { productId: "inv-1" },
      user: { isAdmin: true },
    });
    const result = (await routes.getInventory.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.inventory.quantity).toBe(25);
  });

  it("should decrement inventory on order creation", async () => {
    const product = createTestProduct({
      id: "p-dec",
      name: "Gadget",
      price: 5000,
      inventory: { tracked: true, quantity: 20, lowStockThreshold: 3 },
    });
    await seedProduct(kv, product);

    const cart = createTestCart({
      id: "cart-checkout-1",
      items: [{ productId: "p-dec", quantity: 3, price: 5000, name: "Gadget" }],
      subtotal: 15000,
    });
    await seedCart(kv, cart);

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "{}",
      json: async () => ({
        id: "cs_test_dec",
        url: "https://checkout.stripe.com/test",
        payment_status: "paid",
        metadata: { cartId: "cart-checkout-1", customerName: "Bob" },
        customer_email: "bob@example.com",
        payment_intent: "pi_dec",
      }),
    });

    const routeCtx = buildRouteCtx({ input: { sessionId: "cs_test_dec" } });
    await routes.checkoutSuccess.handler(routeCtx, ctx);

    const updated = JSON.parse((await kv.get<string>("product:p-dec"))!);
    expect(updated.inventory.quantity).toBe(17); // 20 - 3
  });

  it("should restore inventory on cancel", async () => {
    const product = createTestProduct({
      id: "p-restore",
      name: "Restored",
      price: 1000,
      inventory: { tracked: true, quantity: 5, lowStockThreshold: 2 },
    });
    await seedProduct(kv, product);

    const order = createTestOrder({
      id: "o-restore",
      orderNumber: "ORD-R1",
      status: "paid",
      items: [{ productId: "p-restore", quantity: 3, price: 1000, name: "Restored" }],
    });
    await seedOrder(kv, order);

    mockFetch.mockResolvedValue({ ok: true, text: async () => "{}", json: async () => ({}) });

    const routeCtx = buildRouteCtx({ input: { orderId: "o-restore" }, user: { isAdmin: true } });
    await routes.cancelOrder.handler(routeCtx, ctx);

    const updated = JSON.parse((await kv.get<string>("product:p-restore"))!);
    expect(updated.inventory.quantity).toBe(8); // 5 + 3
  });

  it("should detect low stock products", async () => {
    await seedProduct(kv, createTestProduct({ id: "low-1", name: "Low Stock", slug: "low-stock", inventory: { tracked: true, quantity: 2, lowStockThreshold: 5 } }));
    await seedProduct(kv, createTestProduct({ id: "ok-1", name: "OK Stock", slug: "ok-stock", inventory: { tracked: true, quantity: 50, lowStockThreshold: 5 } }));

    const routeCtx = buildRouteCtx({ input: {}, user: { isAdmin: true } });
    const result = (await routes.lowStockAlert.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.lowStock).toHaveLength(1);
    expect(result.lowStock[0].name).toBe("Low Stock");
  });
});

// =============================================================================
// SETTINGS (2 tests)
// =============================================================================
describe("Settings", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should return default settings", async () => {
    const routeCtx = buildRouteCtx({ input: {}, user: { isAdmin: true } });
    const result = (await routes.getSettings.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.settings.storeName).toBe("My Store");
    expect(result.settings.currency).toBe("usd");
    expect(result.settings.orderNumberPrefix).toBe("ORD");
  });

  it("should update and validate settings", async () => {
    const routeCtx = buildRouteCtx({
      input: { storeName: "Coffee Shop", taxRate: 0.08, currency: "usd" },
      user: { isAdmin: true },
    });
    const result = (await routes.updateSettings.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.settings.storeName).toBe("Coffee Shop");
    expect(result.settings.taxRate).toBe(0.08);

    // Invalid tax rate
    const bad = buildRouteCtx({
      input: { taxRate: 5 },
      user: { isAdmin: true },
    });
    await expect(routes.updateSettings.handler(bad, ctx)).rejects.toBeInstanceOf(Response);
  });
});

// =============================================================================
// ANALYTICS (2 tests)
// =============================================================================
describe("Analytics", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
  });

  it("should return revenue analytics by day", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await kv.set(`analytics:revenue:${today}`, JSON.stringify({ total: 15000, orderCount: 3 }));

    const routeCtx = buildRouteCtx({ input: { days: 7 }, user: { isAdmin: true } });
    const result = (await routes.orderAnalytics.handler(routeCtx, ctx)) as any;
    expect(result.success).toBe(true);
    expect(result.analytics.length).toBe(7);
    expect(result.summary.totalRevenue).toBeGreaterThanOrEqual(15000);
    expect(result.summary.totalOrders).toBeGreaterThanOrEqual(3);
  });

  it("should calculate average order value", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await kv.set(`analytics:revenue:${today}`, JSON.stringify({ total: 30000, orderCount: 3 }));

    const routeCtx = buildRouteCtx({ input: { days: 1 }, user: { isAdmin: true } });
    const result = (await routes.orderAnalytics.handler(routeCtx, ctx)) as any;
    expect(result.summary.avgOrderValue).toBe(10000); // 30000/3
  });
});

// =============================================================================
// EDGE CASES (3 tests)
// =============================================================================
describe("Edge Cases", () => {
  let ctx: ReturnType<typeof createMockContext>;
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
    ctx = createMockContext(kv);
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({ ok: true, text: async () => "{}", json: async () => ({}) });
  });

  it("should handle concurrent adds to cart (item dedup)", async () => {
    const product = createTestProduct({ id: "p-dup", name: "Dup Item", price: 1000 });
    await seedProduct(kv, product);
    const cart = createTestCart({ id: "cart-dup" });
    await seedCart(kv, cart);

    // Add same product twice
    const addCtx1 = buildRouteCtx({ input: { cartId: "cart-dup", productId: "p-dup", quantity: 1 } });
    await routes.addToCart.handler(addCtx1, ctx);

    const addCtx2 = buildRouteCtx({ input: { cartId: "cart-dup", productId: "p-dup", quantity: 2 } });
    const result = (await routes.addToCart.handler(addCtx2, ctx)) as any;

    // Should merge into single item with quantity 3
    expect(result.cart.items).toHaveLength(1);
    expect(result.cart.items[0].quantity).toBe(3);
    expect(result.cart.subtotal).toBe(3000);
  });

  it("should generate sequential order numbers", async () => {
    // Seed settings with nextOrderNumber
    await kv.set("settings:store", JSON.stringify({
      storeName: "Test", currency: "usd", taxRate: 0, shippingMethods: [],
      orderNumberPrefix: "ORD", nextOrderNumber: 5001,
    }));

    const product = createTestProduct({ id: "p-seq", name: "Seq", price: 1000 });
    await seedProduct(kv, product);

    // Create two orders
    for (let i = 0; i < 2; i++) {
      const cartId = `cart-seq-${i}`;
      await seedCart(kv, createTestCart({
        id: cartId,
        items: [{ productId: "p-seq", quantity: 1, price: 1000, name: "Seq" }],
        subtotal: 1000,
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => "{}",
        json: async () => ({
          id: `cs_seq_${i}`, url: "https://stripe.com/test",
          payment_status: "paid",
          metadata: { cartId, customerName: "Test" },
          customer_email: "test@example.com",
          payment_intent: `pi_seq_${i}`,
        }),
      });

      const routeCtx = buildRouteCtx({ input: { sessionId: `cs_seq_${i}` } });
      const result = (await routes.checkoutSuccess.handler(routeCtx, ctx)) as any;
      expect(result.order.orderNumber).toBe(`ORD-${5001 + i}`);
    }
  });

  it("should not return archived products in public listings", async () => {
    await seedProduct(kv, createTestProduct({ id: "arc-1", name: "Hidden", slug: "hidden", status: "archived" }));
    await seedProduct(kv, createTestProduct({ id: "vis-1", name: "Visible", slug: "visible", status: "active" }));

    const routeCtx = buildRouteCtx({ input: {} });
    const result = (await routes.listProductsPublic.handler(routeCtx, ctx)) as any;
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe("Visible");

    // Direct slug lookup for archived product should fail
    const slugCtx = buildRouteCtx({ input: { slug: "hidden" } });
    await expect(routes.getProductPublic.handler(slugCtx, ctx)).rejects.toBeInstanceOf(Response);
  });
});
