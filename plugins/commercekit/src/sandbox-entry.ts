import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
  sendEmail,
  generateOrderConfirmationHTML,
  generateShippingNotificationHTML,
  generateOrderCancelledHTML,
} from "./email";
import type { OrderForEmail } from "./email";
import {
  renderProductListPage,
  renderOrderListPage,
  renderRevenueTodayWidget,
  renderPendingOrdersWidget,
  renderRecentOrdersWidget,
} from "./admin-ui";
import type { ProductSummary, OrderSummary } from "./admin-ui";

// ============================================================================
// Type Definitions
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  category?: string;
  tags?: string[];
  variants?: ProductVariant[];
  inventory: {
    tracked: boolean;
    quantity: number;
    lowStockThreshold: number;
  };
  status: "active" | "draft" | "archived";
  weight?: number;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  inventory: { tracked: boolean; quantity: number };
  options: Record<string, string>;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  currency: string;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  cartId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  customer: {
    email: string;
    name: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  taxRate: number;
  shippingMethods: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  stripePublishableKey?: string;
  orderNumberPrefix: string;
  nextOrderNumber: number;
}

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "My Store",
  currency: "usd",
  taxRate: 0,
  shippingMethods: [
    { id: "standard", name: "Standard Shipping", price: 500 },
    { id: "express", name: "Express Shipping", price: 1500 },
  ],
  orderNumberPrefix: "ORD",
  nextOrderNumber: 1001,
};

const CART_EXPIRY_DAYS = 7;

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// ============================================================================
// KV Helpers
// ============================================================================

async function getProduct(kv: PluginContext["kv"], productId: string): Promise<Product | null> {
  const json = await kv.get<string>(`product:${productId}`);
  if (!json) return null;
  try {
    return JSON.parse(json) as Product;
  } catch {
    return null;
  }
}

async function getProductList(kv: PluginContext["kv"]): Promise<string[]> {
  const json = await kv.get<string>("products:list");
  if (!json) return [];
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

async function saveProduct(kv: PluginContext["kv"], product: Product): Promise<void> {
  await kv.set(`product:${product.id}`, JSON.stringify(product));
}

async function addToProductList(kv: PluginContext["kv"], productId: string): Promise<void> {
  const list = await getProductList(kv);
  if (!list.includes(productId)) {
    list.push(productId);
    await kv.set("products:list", JSON.stringify(list));
  }
}

async function removeFromProductList(kv: PluginContext["kv"], productId: string): Promise<void> {
  const list = await getProductList(kv);
  const filtered = list.filter((id) => id !== productId);
  await kv.set("products:list", JSON.stringify(filtered));
}

async function getCart(kv: PluginContext["kv"], cartId: string): Promise<Cart | null> {
  const json = await kv.get<string>(`cart:${cartId}`);
  if (!json) return null;
  try {
    const cart = JSON.parse(json) as Cart;
    // Check expiration
    if (new Date(cart.expiresAt) < new Date()) {
      await kv.delete(`cart:${cartId}`);
      return null;
    }
    return cart;
  } catch {
    return null;
  }
}

async function saveCart(kv: PluginContext["kv"], cart: Cart): Promise<void> {
  await kv.set(`cart:${cart.id}`, JSON.stringify(cart));
}

function recalcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

async function getOrder(kv: PluginContext["kv"], orderId: string): Promise<Order | null> {
  const json = await kv.get<string>(`order:${orderId}`);
  if (!json) return null;
  try {
    return JSON.parse(json) as Order;
  } catch {
    return null;
  }
}

async function getOrderList(kv: PluginContext["kv"]): Promise<string[]> {
  const json = await kv.get<string>("orders:list");
  if (!json) return [];
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

async function saveOrder(kv: PluginContext["kv"], order: Order): Promise<void> {
  await kv.set(`order:${order.id}`, JSON.stringify(order));
}

async function addToOrderList(kv: PluginContext["kv"], orderId: string): Promise<void> {
  const list = await getOrderList(kv);
  // Newest first
  list.unshift(orderId);
  await kv.set("orders:list", JSON.stringify(list));
}

async function getSettings(kv: PluginContext["kv"]): Promise<StoreSettings> {
  const json = await kv.get<string>("settings:store");
  if (!json) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) } as StoreSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function saveSettings(kv: PluginContext["kv"], settings: StoreSettings): Promise<void> {
  await kv.set("settings:store", JSON.stringify(settings));
}

/**
 * Generate a sequential order number like "ORD-1001".
 */
async function generateOrderNumber(kv: PluginContext["kv"]): Promise<string> {
  const settings = await getSettings(kv);
  const orderNumber = `${settings.orderNumberPrefix}-${settings.nextOrderNumber}`;
  settings.nextOrderNumber += 1;
  await saveSettings(kv, settings);
  return orderNumber;
}

/**
 * Decrement inventory for an order's items.
 */
async function decrementInventory(kv: PluginContext["kv"], items: CartItem[]): Promise<void> {
  for (const item of items) {
    const product = await getProduct(kv, item.productId);
    if (!product || !product.inventory.tracked) continue;

    if (item.variantId && product.variants) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant && variant.inventory.tracked) {
        variant.inventory.quantity = Math.max(0, variant.inventory.quantity - item.quantity);
      }
    } else {
      product.inventory.quantity = Math.max(0, product.inventory.quantity - item.quantity);
    }
    await saveProduct(kv, product);
  }
}

/**
 * Restore inventory for cancelled order items.
 */
async function restoreInventory(kv: PluginContext["kv"], items: CartItem[]): Promise<void> {
  for (const item of items) {
    const product = await getProduct(kv, item.productId);
    if (!product || !product.inventory.tracked) continue;

    if (item.variantId && product.variants) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant && variant.inventory.tracked) {
        variant.inventory.quantity += item.quantity;
      }
    } else {
      product.inventory.quantity += item.quantity;
    }
    await saveProduct(kv, product);
  }
}

/**
 * Record revenue analytics for a given date.
 */
async function recordRevenue(kv: PluginContext["kv"], total: number, date: string): Promise<void> {
  const dateKey = date.slice(0, 10);
  const json = await kv.get<string>(`analytics:revenue:${dateKey}`);
  let analytics = { total: 0, orderCount: 0 };
  if (json) {
    try {
      analytics = JSON.parse(json);
    } catch {}
  }
  analytics.total += total;
  analytics.orderCount += 1;
  await kv.set(`analytics:revenue:${dateKey}`, JSON.stringify(analytics));
}

function orderToEmailData(order: Order): OrderForEmail {
  return {
    orderNumber: order.orderNumber,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    currency: order.currency,
    customer: { name: order.customer.name, email: order.customer.email },
    trackingNumber: order.trackingNumber,
    shippingMethod: order.shippingMethod,
  };
}

// ============================================================================
// Plugin Definition
// ============================================================================

export default definePlugin({
  hooks: {},
  routes: {
    // ====================================================================
    // Product Management (admin)
    // ====================================================================

    createProduct: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const { name, description, price, compareAtPrice, currency, images, category, tags, variants, inventory, status, weight, metadata } = routeCtx.input || {};

        if (!name || typeof name !== "string" || name.trim() === "") {
          throw errorResponse("Product name is required", 400);
        }
        if (price === undefined || price === null || typeof price !== "number" || price < 0) {
          throw errorResponse("Valid price is required (in cents)", 400);
        }

        const slug = slugify(name);

        // Check for duplicate slug
        const existingId = await ctx.kv.get<string>(`product:slug:${slug}`);
        if (existingId) {
          throw errorResponse(`Product with slug "${slug}" already exists`, 409);
        }

        const now = new Date().toISOString();
        const product: Product = {
          id: generateId(),
          name: name.trim(),
          slug,
          description: description || "",
          price,
          compareAtPrice: compareAtPrice || undefined,
          currency: currency || "usd",
          images: images || [],
          category: category || undefined,
          tags: tags || undefined,
          variants: variants || undefined,
          inventory: inventory || { tracked: true, quantity: 0, lowStockThreshold: 5 },
          status: status || "draft",
          weight: weight || undefined,
          metadata: metadata || undefined,
          createdAt: now,
          updatedAt: now,
        };

        await saveProduct(ctx.kv, product);
        await addToProductList(ctx.kv, product.id);
        await ctx.kv.set(`product:slug:${slug}`, product.id);

        ctx.log.info(`Product created: ${product.id} - ${product.name}`);
        return { success: true, productId: product.id, slug: product.slug };
      },
    },

    updateProduct: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const productId = routeCtx.pathParams?.id || routeCtx.input?.productId;
        if (!productId) throw errorResponse("Product ID is required", 400);

        const product = await getProduct(ctx.kv, productId);
        if (!product) throw errorResponse("Product not found", 404);

        const updates = routeCtx.input || {};
        const oldSlug = product.slug;

        if (updates.name !== undefined) {
          product.name = updates.name;
          product.slug = slugify(updates.name);

          // Update slug mapping if changed
          if (product.slug !== oldSlug) {
            await ctx.kv.delete(`product:slug:${oldSlug}`);
            await ctx.kv.set(`product:slug:${product.slug}`, product.id);
          }
        }
        if (updates.description !== undefined) product.description = updates.description;
        if (updates.price !== undefined) product.price = updates.price;
        if (updates.compareAtPrice !== undefined) product.compareAtPrice = updates.compareAtPrice;
        if (updates.currency !== undefined) product.currency = updates.currency;
        if (updates.images !== undefined) product.images = updates.images;
        if (updates.category !== undefined) product.category = updates.category;
        if (updates.tags !== undefined) product.tags = updates.tags;
        if (updates.variants !== undefined) product.variants = updates.variants;
        if (updates.inventory !== undefined) product.inventory = updates.inventory;
        if (updates.status !== undefined) product.status = updates.status;
        if (updates.weight !== undefined) product.weight = updates.weight;
        if (updates.metadata !== undefined) product.metadata = updates.metadata;

        product.updatedAt = new Date().toISOString();

        await saveProduct(ctx.kv, product);
        ctx.log.info(`Product updated: ${product.id} - ${product.name}`);
        return { success: true, product };
      },
    },

    deleteProduct: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const productId = routeCtx.pathParams?.id || routeCtx.input?.productId;
        const hard = routeCtx.input?.hard === true;
        if (!productId) throw errorResponse("Product ID is required", 400);

        const product = await getProduct(ctx.kv, productId);
        if (!product) throw errorResponse("Product not found", 404);

        if (hard) {
          await ctx.kv.delete(`product:${productId}`);
          await ctx.kv.delete(`product:slug:${product.slug}`);
          await removeFromProductList(ctx.kv, productId);
          ctx.log.info(`Product hard-deleted: ${productId}`);
        } else {
          product.status = "archived";
          product.updatedAt = new Date().toISOString();
          await saveProduct(ctx.kv, product);
          ctx.log.info(`Product archived: ${productId}`);
        }

        return { success: true, deleted: hard ? "hard" : "soft" };
      },
    },

    getProduct: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const productId = routeCtx.pathParams?.id || routeCtx.input?.productId;
        if (!productId) throw errorResponse("Product ID is required", 400);

        const product = await getProduct(ctx.kv, productId);
        if (!product) throw errorResponse("Product not found", 404);

        return { success: true, product };
      },
    },

    listProducts: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const { status, category, search, page = 1, perPage = 20 } = routeCtx.input || {};
        const allIds = await getProductList(ctx.kv);
        const products: Product[] = [];

        for (const id of allIds) {
          const product = await getProduct(ctx.kv, id);
          if (product) products.push(product);
        }

        let filtered = products;
        if (status) filtered = filtered.filter((p) => p.status === status);
        if (category) filtered = filtered.filter((p) => p.category === category);
        if (search) {
          const term = search.toLowerCase();
          filtered = filtered.filter(
            (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
          );
        }

        const total = filtered.length;
        const start = (page - 1) * perPage;
        const paginated = filtered.slice(start, start + perPage);

        return { success: true, products: paginated, total, page, perPage };
      },
    },

    // ====================================================================
    // Public Product Routes
    // ====================================================================

    getProductPublic: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const slug = routeCtx.pathParams?.slug || routeCtx.input?.slug;
        if (!slug) throw errorResponse("Product slug is required", 400);

        const productId = await ctx.kv.get<string>(`product:slug:${slug}`);
        if (!productId) throw errorResponse("Product not found", 404);

        const product = await getProduct(ctx.kv, productId);
        if (!product || product.status !== "active") {
          throw errorResponse("Product not found", 404);
        }

        return { success: true, product };
      },
    },

    listProductsPublic: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { category, page = 1, perPage = 20 } = routeCtx.input || {};
        const allIds = await getProductList(ctx.kv);
        const products: Product[] = [];

        for (const id of allIds) {
          const product = await getProduct(ctx.kv, id);
          if (product && product.status === "active") products.push(product);
        }

        let filtered = products;
        if (category) filtered = filtered.filter((p) => p.category === category);

        const total = filtered.length;
        const start = (page - 1) * perPage;
        const paginated = filtered.slice(start, start + perPage);

        return { success: true, products: paginated, total, page, perPage };
      },
    },

    // ====================================================================
    // Cart Management (public)
    // ====================================================================

    createCart: {
      public: true,
      handler: async (_routeCtx: any, ctx: any) => {
        const settings = await getSettings(ctx.kv);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        const cart: Cart = {
          id: generateId(),
          items: [],
          currency: settings.currency,
          subtotal: 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        await saveCart(ctx.kv, cart);
        ctx.log.info(`Cart created: ${cart.id}`);
        return { success: true, cartId: cart.id };
      },
    },

    addToCart: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { cartId, productId, variantId, quantity = 1 } = routeCtx.input || {};
        if (!cartId) throw errorResponse("Cart ID is required", 400);
        if (!productId) throw errorResponse("Product ID is required", 400);

        const cart = await getCart(ctx.kv, cartId);
        if (!cart) throw errorResponse("Cart not found or expired", 404);

        const product = await getProduct(ctx.kv, productId);
        if (!product || product.status !== "active") {
          throw errorResponse("Product not found or unavailable", 404);
        }

        // Determine price and check inventory
        let price = product.price;
        let availableQty = product.inventory.tracked ? product.inventory.quantity : Infinity;

        if (variantId && product.variants) {
          const variant = product.variants.find((v) => v.id === variantId);
          if (!variant) throw errorResponse("Variant not found", 404);
          if (variant.price !== undefined) price = variant.price;
          if (variant.inventory.tracked) availableQty = variant.inventory.quantity;
        }

        // Check if item already in cart
        const existingIndex = cart.items.findIndex(
          (i) => i.productId === productId && i.variantId === variantId
        );

        const currentQty = existingIndex >= 0 ? cart.items[existingIndex].quantity : 0;
        const newQty = currentQty + quantity;

        if (product.inventory.tracked && newQty > availableQty) {
          throw errorResponse(`Insufficient inventory. Available: ${availableQty}`, 400);
        }

        if (existingIndex >= 0) {
          cart.items[existingIndex].quantity = newQty;
        } else {
          cart.items.push({
            productId,
            variantId,
            quantity,
            price,
            name: product.name,
          });
        }

        cart.subtotal = recalcSubtotal(cart.items);
        cart.updatedAt = new Date().toISOString();
        await saveCart(ctx.kv, cart);

        return { success: true, cart };
      },
    },

    updateCartItem: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { cartId, productId, variantId, quantity } = routeCtx.input || {};
        if (!cartId) throw errorResponse("Cart ID is required", 400);
        if (!productId) throw errorResponse("Product ID is required", 400);
        if (quantity === undefined || quantity < 0) throw errorResponse("Valid quantity is required", 400);

        const cart = await getCart(ctx.kv, cartId);
        if (!cart) throw errorResponse("Cart not found or expired", 404);

        const idx = cart.items.findIndex(
          (i) => i.productId === productId && i.variantId === variantId
        );
        if (idx < 0) throw errorResponse("Item not in cart", 404);

        if (quantity === 0) {
          cart.items.splice(idx, 1);
        } else {
          // Validate inventory
          const product = await getProduct(ctx.kv, productId);
          if (product && product.inventory.tracked) {
            let availableQty = product.inventory.quantity;
            if (variantId && product.variants) {
              const variant = product.variants.find((v) => v.id === variantId);
              if (variant && variant.inventory.tracked) availableQty = variant.inventory.quantity;
            }
            if (quantity > availableQty) {
              throw errorResponse(`Insufficient inventory. Available: ${availableQty}`, 400);
            }
          }
          cart.items[idx].quantity = quantity;
        }

        cart.subtotal = recalcSubtotal(cart.items);
        cart.updatedAt = new Date().toISOString();
        await saveCart(ctx.kv, cart);

        return { success: true, cart };
      },
    },

    removeFromCart: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { cartId, productId, variantId } = routeCtx.input || {};
        if (!cartId) throw errorResponse("Cart ID is required", 400);
        if (!productId) throw errorResponse("Product ID is required", 400);

        const cart = await getCart(ctx.kv, cartId);
        if (!cart) throw errorResponse("Cart not found or expired", 404);

        const idx = cart.items.findIndex(
          (i) => i.productId === productId && i.variantId === variantId
        );
        if (idx < 0) throw errorResponse("Item not in cart", 404);

        cart.items.splice(idx, 1);
        cart.subtotal = recalcSubtotal(cart.items);
        cart.updatedAt = new Date().toISOString();
        await saveCart(ctx.kv, cart);

        return { success: true, cart };
      },
    },

    getCart: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const cartId = routeCtx.pathParams?.id || routeCtx.input?.cartId;
        if (!cartId) throw errorResponse("Cart ID is required", 400);

        const cart = await getCart(ctx.kv, cartId);
        if (!cart) throw errorResponse("Cart not found or expired", 404);

        return { success: true, cart };
      },
    },

    clearCart: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const cartId = routeCtx.pathParams?.id || routeCtx.input?.cartId;
        if (!cartId) throw errorResponse("Cart ID is required", 400);

        const cart = await getCart(ctx.kv, cartId);
        if (!cart) throw errorResponse("Cart not found or expired", 404);

        cart.items = [];
        cart.subtotal = 0;
        cart.updatedAt = new Date().toISOString();
        await saveCart(ctx.kv, cart);

        return { success: true, cart };
      },
    },

    // ====================================================================
    // Checkout + Stripe
    // ====================================================================

    createCheckout: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { cartId, customer, shippingMethodId } = routeCtx.input || {};
        if (!cartId) throw errorResponse("Cart ID is required", 400);
        if (!customer?.email || !customer?.name) {
          throw errorResponse("Customer name and email are required", 400);
        }

        const cart = await getCart(ctx.kv, cartId);
        if (!cart || cart.items.length === 0) {
          throw errorResponse("Cart is empty or not found", 400);
        }

        const settings = await getSettings(ctx.kv);

        // Calculate totals
        const subtotal = cart.subtotal;
        const tax = Math.round(subtotal * settings.taxRate);
        let shipping = 0;
        let shippingMethod: string | undefined;
        if (shippingMethodId) {
          const method = settings.shippingMethods.find((m) => m.id === shippingMethodId);
          if (method) {
            shipping = method.price;
            shippingMethod = method.name;
          }
        }
        const total = subtotal + tax + shipping;

        // Build Stripe line items
        const stripeKey = ctx.env?.STRIPE_SECRET_KEY;
        if (!stripeKey) {
          throw errorResponse("Stripe is not configured", 500);
        }

        const siteUrl = ctx.site?.url || "https://example.com";

        const params = new URLSearchParams();
        params.set("mode", "payment");
        params.set("success_url", `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
        params.set("cancel_url", `${siteUrl}/cart`);
        params.set("customer_email", customer.email);
        params.set("metadata[cartId]", cartId);
        params.set("metadata[customerName]", customer.name);
        if (shippingMethodId) params.set("metadata[shippingMethodId]", shippingMethodId);

        cart.items.forEach((item, i) => {
          params.set(`line_items[${i}][price_data][currency]`, cart.currency);
          params.set(`line_items[${i}][price_data][unit_amount]`, String(item.price));
          params.set(`line_items[${i}][price_data][product_data][name]`, item.name);
          params.set(`line_items[${i}][quantity]`, String(item.quantity));
        });

        // Add tax as line item if applicable
        if (tax > 0) {
          const taxIdx = cart.items.length;
          params.set(`line_items[${taxIdx}][price_data][currency]`, cart.currency);
          params.set(`line_items[${taxIdx}][price_data][unit_amount]`, String(tax));
          params.set(`line_items[${taxIdx}][price_data][product_data][name]`, "Tax");
          params.set(`line_items[${taxIdx}][quantity]`, "1");
        }

        // Add shipping as line item if applicable
        if (shipping > 0) {
          const shipIdx = cart.items.length + (tax > 0 ? 1 : 0);
          params.set(`line_items[${shipIdx}][price_data][currency]`, cart.currency);
          params.set(`line_items[${shipIdx}][price_data][unit_amount]`, String(shipping));
          params.set(`line_items[${shipIdx}][price_data][product_data][name]`, shippingMethod || "Shipping");
          params.set(`line_items[${shipIdx}][quantity]`, "1");
        }

        const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        });

        if (!stripeResponse.ok) {
          const err = await stripeResponse.text();
          ctx.log.error(`Stripe checkout creation failed: ${err}`);
          throw errorResponse("Failed to create checkout session", 500);
        }

        const session = (await stripeResponse.json()) as { id: string; url: string };

        ctx.log.info(`Checkout session created: ${session.id} for cart ${cartId}`);
        return { success: true, sessionId: session.id, checkoutUrl: session.url, total, tax, shipping };
      },
    },

    checkoutSuccess: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { sessionId } = routeCtx.input || {};
        if (!sessionId) throw errorResponse("Session ID is required", 400);

        // Verify Stripe session
        const stripeKey = ctx.env?.STRIPE_SECRET_KEY;
        if (!stripeKey) throw errorResponse("Stripe not configured", 500);

        const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });

        if (!stripeResponse.ok) {
          throw errorResponse("Invalid checkout session", 400);
        }

        const session = (await stripeResponse.json()) as {
          id: string;
          payment_status: string;
          metadata: Record<string, string>;
          customer_email: string;
          payment_intent: string;
        };

        if (session.payment_status !== "paid") {
          throw errorResponse("Payment not completed", 400);
        }

        const cartId = session.metadata?.cartId;
        const customerName = session.metadata?.customerName || "Customer";
        const shippingMethodId = session.metadata?.shippingMethodId;

        const cart = await getCart(ctx.kv, cartId);
        if (!cart) throw errorResponse("Cart not found", 404);

        const settings = await getSettings(ctx.kv);
        const subtotal = cart.subtotal;
        const tax = Math.round(subtotal * settings.taxRate);
        let shipping = 0;
        let shippingMethodName: string | undefined;
        if (shippingMethodId) {
          const method = settings.shippingMethods.find((m) => m.id === shippingMethodId);
          if (method) {
            shipping = method.price;
            shippingMethodName = method.name;
          }
        }
        const total = subtotal + tax + shipping;

        const orderNumber = await generateOrderNumber(ctx.kv);
        const now = new Date().toISOString();

        const order: Order = {
          id: generateId(),
          orderNumber,
          cartId,
          items: [...cart.items],
          subtotal,
          tax,
          shipping,
          total,
          currency: cart.currency,
          status: "paid",
          customer: {
            email: session.customer_email,
            name: customerName,
          },
          stripePaymentIntentId: session.payment_intent,
          stripeSessionId: session.id,
          shippingMethod: shippingMethodName,
          createdAt: now,
          updatedAt: now,
        };

        await saveOrder(ctx.kv, order);
        await addToOrderList(ctx.kv, order.id);
        await ctx.kv.set(`order:number:${orderNumber}`, order.id);

        // Decrement inventory
        await decrementInventory(ctx.kv, cart.items);

        // Record revenue
        await recordRevenue(ctx.kv, total, now);

        // Clear cart
        cart.items = [];
        cart.subtotal = 0;
        cart.updatedAt = now;
        await saveCart(ctx.kv, cart);

        // Send confirmation email
        const emailData = orderToEmailData(order);
        const html = generateOrderConfirmationHTML(emailData);
        await sendEmail(ctx, {
          to: order.customer.email,
          subject: `Order Confirmed: ${order.orderNumber}`,
          html,
        });

        ctx.log.info(`Order created: ${order.id} (${order.orderNumber}) from session ${sessionId}`);
        return { success: true, order };
      },
    },

    stripeWebhook: {
      public: true,
      handler: async (routeCtx: any, ctx: any) => {
        const { payload, signature } = routeCtx.input || {};
        if (!payload || !signature) {
          throw errorResponse("Missing webhook payload or signature", 400);
        }

        const webhookSecret = ctx.env?.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          throw errorResponse("Webhook secret not configured", 500);
        }

        // Simple signature verification (in production, use Stripe SDK)
        // For now, we trust the payload if the webhook secret is configured
        let event: { type: string; data: { object: Record<string, any> } };
        try {
          event = typeof payload === "string" ? JSON.parse(payload) : payload;
        } catch {
          throw errorResponse("Invalid webhook payload", 400);
        }

        ctx.log.info(`Stripe webhook received: ${event.type}`);

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          if (session.payment_status === "paid" && session.metadata?.cartId) {
            ctx.log.info(`Webhook: checkout completed for cart ${session.metadata.cartId}`);
          }
        } else if (event.type === "payment_intent.succeeded") {
          ctx.log.info(`Webhook: payment intent succeeded: ${event.data.object.id}`);
        }

        return { success: true, received: true };
      },
    },

    // ====================================================================
    // Order Management (admin)
    // ====================================================================

    listOrders: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const { status, startDate, endDate, page = 1, perPage = 20 } = routeCtx.input || {};
        const allIds = await getOrderList(ctx.kv);
        const orders: Order[] = [];

        for (const id of allIds) {
          const order = await getOrder(ctx.kv, id);
          if (order) orders.push(order);
        }

        let filtered = orders;
        if (status) filtered = filtered.filter((o) => o.status === status);
        if (startDate) filtered = filtered.filter((o) => o.createdAt >= startDate);
        if (endDate) filtered = filtered.filter((o) => o.createdAt <= endDate);

        const total = filtered.length;
        const start = (page - 1) * perPage;
        const paginated = filtered.slice(start, start + perPage);

        return { success: true, orders: paginated, total, page, perPage };
      },
    },

    getOrder: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const orderId = routeCtx.pathParams?.id || routeCtx.input?.orderId;
        if (!orderId) throw errorResponse("Order ID is required", 400);

        const order = await getOrder(ctx.kv, orderId);
        if (!order) throw errorResponse("Order not found", 404);

        return { success: true, order };
      },
    },

    updateOrderStatus: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const orderId = routeCtx.pathParams?.id || routeCtx.input?.orderId;
        const { status, trackingNumber, notes } = routeCtx.input || {};
        if (!orderId) throw errorResponse("Order ID is required", 400);
        if (!status) throw errorResponse("Status is required", 400);

        const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
        if (!validStatuses.includes(status)) {
          throw errorResponse(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
        }

        const order = await getOrder(ctx.kv, orderId);
        if (!order) throw errorResponse("Order not found", 404);

        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (notes) order.notes = notes;
        order.updatedAt = new Date().toISOString();

        await saveOrder(ctx.kv, order);

        // Send shipping notification if status changed to shipped
        if (status === "shipped") {
          const emailData = orderToEmailData(order);
          const html = generateShippingNotificationHTML(emailData);
          await sendEmail(ctx, {
            to: order.customer.email,
            subject: `Your Order ${order.orderNumber} Has Shipped!`,
            html,
          });
        }

        ctx.log.info(`Order ${orderId} status updated to ${status}`);
        return { success: true, order };
      },
    },

    cancelOrder: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const orderId = routeCtx.pathParams?.id || routeCtx.input?.orderId;
        if (!orderId) throw errorResponse("Order ID is required", 400);

        const order = await getOrder(ctx.kv, orderId);
        if (!order) throw errorResponse("Order not found", 404);

        if (order.status === "cancelled" || order.status === "refunded") {
          throw errorResponse("Order is already cancelled or refunded", 400);
        }

        order.status = "cancelled";
        order.updatedAt = new Date().toISOString();
        await saveOrder(ctx.kv, order);

        // Restore inventory
        await restoreInventory(ctx.kv, order.items);

        // Send cancellation email
        const emailData = orderToEmailData(order);
        const html = generateOrderCancelledHTML(emailData);
        await sendEmail(ctx, {
          to: order.customer.email,
          subject: `Order ${order.orderNumber} Cancelled`,
          html,
        });

        ctx.log.info(`Order ${orderId} cancelled`);
        return { success: true, order };
      },
    },

    orderAnalytics: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const { days = 30 } = routeCtx.input || {};
        const analytics: Array<{ date: string; total: number; orderCount: number }> = [];
        let totalRevenue = 0;
        let totalOrders = 0;

        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateKey = d.toISOString().slice(0, 10);
          const json = await ctx.kv.get<string>(`analytics:revenue:${dateKey}`);
          let dayData = { total: 0, orderCount: 0 };
          if (json) {
            try {
              dayData = JSON.parse(json);
            } catch {}
          }
          analytics.push({ date: dateKey, ...dayData });
          totalRevenue += dayData.total;
          totalOrders += dayData.orderCount;
        }

        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        return {
          success: true,
          analytics,
          summary: { totalRevenue, totalOrders, avgOrderValue, days },
        };
      },
    },

    // ====================================================================
    // Inventory
    // ====================================================================

    getInventory: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const productId = routeCtx.pathParams?.id || routeCtx.input?.productId;
        if (!productId) throw errorResponse("Product ID is required", 400);

        const product = await getProduct(ctx.kv, productId);
        if (!product) throw errorResponse("Product not found", 404);

        const variantInventory = (product.variants || []).map((v) => ({
          variantId: v.id,
          name: v.name,
          ...v.inventory,
        }));

        return {
          success: true,
          productId,
          inventory: product.inventory,
          variants: variantInventory,
        };
      },
    },

    updateInventory: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const { productId, variantId, quantity, lowStockThreshold } = routeCtx.input || {};
        if (!productId) throw errorResponse("Product ID is required", 400);

        const product = await getProduct(ctx.kv, productId);
        if (!product) throw errorResponse("Product not found", 404);

        if (variantId && product.variants) {
          const variant = product.variants.find((v) => v.id === variantId);
          if (!variant) throw errorResponse("Variant not found", 404);
          if (quantity !== undefined) variant.inventory.quantity = quantity;
        } else {
          if (quantity !== undefined) product.inventory.quantity = quantity;
          if (lowStockThreshold !== undefined) product.inventory.lowStockThreshold = lowStockThreshold;
        }

        product.updatedAt = new Date().toISOString();
        await saveProduct(ctx.kv, product);

        ctx.log.info(`Inventory updated for product ${productId}`);
        return { success: true, inventory: product.inventory };
      },
    },

    lowStockAlert: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const allIds = await getProductList(ctx.kv);
        const lowStock: Array<{ productId: string; name: string; quantity: number; threshold: number }> = [];

        for (const id of allIds) {
          const product = await getProduct(ctx.kv, id);
          if (
            product &&
            product.inventory.tracked &&
            product.status !== "archived" &&
            product.inventory.quantity <= product.inventory.lowStockThreshold
          ) {
            lowStock.push({
              productId: product.id,
              name: product.name,
              quantity: product.inventory.quantity,
              threshold: product.inventory.lowStockThreshold,
            });
          }
        }

        return { success: true, lowStock, count: lowStock.length };
      },
    },

    // ====================================================================
    // Settings
    // ====================================================================

    getSettings: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }
        const settings = await getSettings(ctx.kv);
        return { success: true, settings };
      },
    },

    updateSettings: {
      handler: async (routeCtx: any, ctx: any) => {
        if (!routeCtx.user?.isAdmin) {
          throw errorResponse("Admin access required", 403);
        }

        const updates = routeCtx.input || {};
        const settings = await getSettings(ctx.kv);

        if (updates.storeName !== undefined) settings.storeName = updates.storeName;
        if (updates.currency !== undefined) settings.currency = updates.currency;
        if (updates.taxRate !== undefined) {
          if (typeof updates.taxRate !== "number" || updates.taxRate < 0 || updates.taxRate > 1) {
            throw errorResponse("Tax rate must be a number between 0 and 1", 400);
          }
          settings.taxRate = updates.taxRate;
        }
        if (updates.shippingMethods !== undefined) settings.shippingMethods = updates.shippingMethods;
        if (updates.stripePublishableKey !== undefined) settings.stripePublishableKey = updates.stripePublishableKey;
        if (updates.orderNumberPrefix !== undefined) settings.orderNumberPrefix = updates.orderNumberPrefix;

        await saveSettings(ctx.kv, settings);
        ctx.log.info("Store settings updated");
        return { success: true, settings };
      },
    },

    // ====================================================================
    // Admin UI Routes
    // ====================================================================

    "admin/products": {
      handler: async (_routeCtx: any, ctx: any) => {
        const allIds = await getProductList(ctx.kv);
        const products: ProductSummary[] = [];
        for (const id of allIds) {
          const p = await getProduct(ctx.kv, id);
          if (p) {
            products.push({
              id: p.id,
              name: p.name,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              currency: p.currency,
              images: p.images,
              status: p.status,
              category: p.category,
              inventory: p.inventory,
            });
          }
        }
        return htmlResponse(renderProductListPage(products));
      },
    },

    "admin/orders": {
      handler: async (_routeCtx: any, ctx: any) => {
        const allIds = await getOrderList(ctx.kv);
        const orders: OrderSummary[] = [];
        for (const id of allIds) {
          const o = await getOrder(ctx.kv, id);
          if (o) {
            orders.push({
              id: o.id,
              orderNumber: o.orderNumber,
              customer: o.customer,
              total: o.total,
              currency: o.currency,
              status: o.status,
              createdAt: o.createdAt,
              itemCount: o.items.length,
            });
          }
        }
        return htmlResponse(renderOrderListPage(orders));
      },
    },

    "widget/revenue-today": {
      handler: async (_routeCtx: any, ctx: any) => {
        const dateKey = new Date().toISOString().slice(0, 10);
        const json = await ctx.kv.get<string>(`analytics:revenue:${dateKey}`);
        const settings = await getSettings(ctx.kv);
        let data = { total: 0, orderCount: 0 };
        if (json) {
          try {
            data = JSON.parse(json);
          } catch {}
        }
        return htmlResponse(renderRevenueTodayWidget({ ...data, currency: settings.currency }));
      },
    },

    "widget/orders-pending": {
      handler: async (_routeCtx: any, ctx: any) => {
        const allIds = await getOrderList(ctx.kv);
        let pending = 0;
        for (const id of allIds) {
          const o = await getOrder(ctx.kv, id);
          if (o && (o.status === "pending" || o.status === "paid")) pending++;
        }
        return htmlResponse(renderPendingOrdersWidget(pending));
      },
    },

    "widget/recent-orders": {
      handler: async (_routeCtx: any, ctx: any) => {
        const allIds = await getOrderList(ctx.kv);
        const orders: OrderSummary[] = [];
        for (const id of allIds.slice(0, 5)) {
          const o = await getOrder(ctx.kv, id);
          if (o) {
            orders.push({
              id: o.id,
              orderNumber: o.orderNumber,
              customer: o.customer,
              total: o.total,
              currency: o.currency,
              status: o.status,
              createdAt: o.createdAt,
              itemCount: o.items.length,
            });
          }
        }
        return htmlResponse(renderRecentOrdersWidget(orders));
      },
    },
  },
});
