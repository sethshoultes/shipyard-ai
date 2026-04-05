/**
 * Test helpers: mock PluginContext, KV store, and factories for CommerceKit.
 */
import { vi } from "vitest";

// ============================================================================
// Mock KV Store
// ============================================================================

export interface MockKV {
  _store: Map<string, string>;
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  list: (prefix?: string) => Promise<Array<{ key: string; value: unknown }>>;
}

export function createMockKV(): MockKV {
  const store = new Map<string, string>();

  return {
    _store: store,
    get: vi.fn(async <T>(key: string): Promise<T | null> => {
      const val = store.get(key);
      return val !== undefined ? (val as unknown as T) : null;
    }),
    set: vi.fn(async (key: string, value: unknown, _opts?: { ex?: number }): Promise<void> => {
      store.set(key, typeof value === "string" ? value : JSON.stringify(value));
    }),
    delete: vi.fn(async (key: string): Promise<boolean> => {
      return store.delete(key);
    }),
    list: vi.fn(async (prefix?: string): Promise<Array<{ key: string; value: unknown }>> => {
      const results: Array<{ key: string; value: unknown }> = [];
      for (const [k, v] of store.entries()) {
        if (!prefix || k.startsWith(prefix)) {
          results.push({ key: k, value: v });
        }
      }
      return results;
    }),
  };
}

// ============================================================================
// Mock Context
// ============================================================================

export function createMockContext(kvOverride?: MockKV) {
  const kv = kvOverride ?? createMockKV();

  return {
    kv,
    log: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    plugin: { id: "commercekit", version: "1.0.0" },
    site: { url: "https://test-store.example.com", name: "Test Store" },
    url: (path: string) => `https://test-store.example.com${path}`,
    env: {
      STRIPE_SECRET_KEY: "sk_test_123456",
      STRIPE_WEBHOOK_SECRET: "whsec_test_123456",
      RESEND_API_KEY: "re_test_123",
      STORE_FROM_EMAIL: "store@test.com",
    },
  };
}

// ============================================================================
// Route Context Builder
// ============================================================================

export function buildRouteCtx(opts: {
  input?: Record<string, unknown>;
  pathParams?: Record<string, string>;
  user?: { isAdmin?: boolean; email?: string };
}) {
  return {
    input: opts.input ?? {},
    pathParams: opts.pathParams,
    user: opts.user,
  };
}

// ============================================================================
// Test Factories
// ============================================================================

export function createTestProduct(overrides?: Partial<{
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  currency: string;
  images: string[];
  category: string;
  tags: string[];
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    inventory: { tracked: boolean; quantity: number };
    options: Record<string, string>;
  }>;
  inventory: { tracked: boolean; quantity: number; lowStockThreshold: number };
  status: "active" | "draft" | "archived";
  weight: number;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}>) {
  const name = overrides?.name ?? "Test Product";
  return {
    id: overrides?.id ?? `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    slug: overrides?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: overrides?.description ?? "A test product description",
    price: overrides?.price ?? 2999,
    compareAtPrice: overrides?.compareAtPrice,
    currency: overrides?.currency ?? "usd",
    images: overrides?.images ?? ["https://example.com/img1.jpg"],
    category: overrides?.category ?? "general",
    tags: overrides?.tags,
    variants: overrides?.variants,
    inventory: overrides?.inventory ?? { tracked: true, quantity: 50, lowStockThreshold: 5 },
    status: overrides?.status ?? "active",
    weight: overrides?.weight,
    metadata: overrides?.metadata,
    createdAt: overrides?.createdAt ?? "2026-04-01T10:00:00.000Z",
    updatedAt: overrides?.updatedAt ?? "2026-04-01T10:00:00.000Z",
  };
}

export function createTestCart(overrides?: Partial<{
  id: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  currency: string;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}>) {
  const items = overrides?.items ?? [];
  return {
    id: overrides?.id ?? `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    items,
    currency: overrides?.currency ?? "usd",
    subtotal: overrides?.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0),
    createdAt: overrides?.createdAt ?? "2026-04-01T10:00:00.000Z",
    updatedAt: overrides?.updatedAt ?? "2026-04-01T10:00:00.000Z",
    expiresAt: overrides?.expiresAt ?? "2026-04-08T10:00:00.000Z",
  };
}

export function createTestOrder(overrides?: Partial<{
  id: string;
  orderNumber: string;
  cartId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  customer: { email: string; name: string };
  stripePaymentIntentId: string;
  stripeSessionId: string;
  shippingMethod: string;
  trackingNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}>) {
  const items = overrides?.items ?? [
    { productId: "prod-1", quantity: 2, price: 2999, name: "Widget" },
  ];
  const subtotal = overrides?.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = overrides?.tax ?? 480;
  const shipping = overrides?.shipping ?? 500;
  return {
    id: overrides?.id ?? `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderNumber: overrides?.orderNumber ?? "ORD-1001",
    cartId: overrides?.cartId ?? "cart-test-1",
    items,
    subtotal,
    tax,
    shipping,
    total: overrides?.total ?? subtotal + tax + shipping,
    currency: overrides?.currency ?? "usd",
    status: overrides?.status ?? "paid",
    customer: overrides?.customer ?? { email: "jane@example.com", name: "Jane Doe" },
    stripePaymentIntentId: overrides?.stripePaymentIntentId,
    stripeSessionId: overrides?.stripeSessionId,
    shippingMethod: overrides?.shippingMethod,
    trackingNumber: overrides?.trackingNumber,
    notes: overrides?.notes,
    createdAt: overrides?.createdAt ?? "2026-04-01T10:00:00.000Z",
    updatedAt: overrides?.updatedAt ?? "2026-04-01T10:00:00.000Z",
  };
}

// ============================================================================
// Seed Helpers
// ============================================================================

export async function seedProduct(kv: MockKV, product: ReturnType<typeof createTestProduct>) {
  await kv.set(`product:${product.id}`, JSON.stringify(product));
  await kv.set(`product:slug:${product.slug}`, product.id);

  const listJson = await kv.get<string>("products:list");
  let list: string[] = [];
  if (listJson) {
    try { list = JSON.parse(listJson); } catch { list = []; }
  }
  if (!list.includes(product.id)) {
    list.push(product.id);
  }
  await kv.set("products:list", JSON.stringify(list));
}

export async function seedCart(kv: MockKV, cart: ReturnType<typeof createTestCart>) {
  await kv.set(`cart:${cart.id}`, JSON.stringify(cart));
}

export async function seedOrder(kv: MockKV, order: ReturnType<typeof createTestOrder>) {
  await kv.set(`order:${order.id}`, JSON.stringify(order));
  await kv.set(`order:number:${order.orderNumber}`, order.id);

  const listJson = await kv.get<string>("orders:list");
  let list: string[] = [];
  if (listJson) {
    try { list = JSON.parse(listJson); } catch { list = []; }
  }
  list.unshift(order.id);
  await kv.set("orders:list", JSON.stringify(list));
}
