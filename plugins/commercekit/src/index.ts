import type { PluginDescriptor } from "emdash";

/**
 * CommerceKit plugin descriptor.
 *
 * Provides e-commerce capabilities for EmDash CMS: product catalog,
 * shopping cart, Stripe checkout, order management, and inventory tracking.
 *
 * Storage: All data in KV
 * - Products: `product:{id}` -> Product JSON
 * - Product list: `products:list` -> string[] of product IDs
 * - Slug lookup: `product:slug:{slug}` -> product ID
 * - Carts: `cart:{id}` -> Cart JSON
 * - Orders: `order:{id}` -> Order JSON
 * - Order list: `orders:list` -> string[] of order IDs (newest first)
 * - Order number lookup: `order:number:{orderNumber}` -> order ID
 * - Inventory: `inventory:{productId}` -> { quantity, reserved }
 * - Settings: `settings:store` -> StoreSettings JSON
 * - Analytics: `analytics:revenue:{date}` -> { total, orderCount }
 */
export function commercekitPlugin(): PluginDescriptor {
  return {
    id: "commercekit",
    version: "1.0.0",
    format: "standard",
    entrypoint: "@shipyard/commercekit/sandbox",
    capabilities: ["email:send"],
    options: {},
    adminPages: [
      { path: "/products", label: "Products", icon: "package" },
      { path: "/orders", label: "Orders", icon: "shopping-cart" },
      { path: "/inventory", label: "Inventory", icon: "archive" },
      { path: "/settings", label: "Settings", icon: "settings" },
    ],
    adminWidgets: [
      { id: "revenue-today", title: "Revenue Today", size: "third" },
      { id: "orders-pending", title: "Pending Orders", size: "third" },
      { id: "recent-orders", title: "Recent Orders", size: "half" },
    ],
  };
}
