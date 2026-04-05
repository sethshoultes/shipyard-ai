/**
 * CommerceKit Admin UI
 *
 * Renders admin HTML for the store management interface.
 * Imported by sandbox-entry.ts -- all functions return HTML strings.
 *
 * Design system: Matches MemberShip/EventDash/ReviewPulse admin patterns.
 * - Terracotta (#C4704B) primary, Sage (#7A8B6F) labels, Gold (#D4A853) accents
 * - Lora (headings), Source Sans 3 (body)
 * - BEM-style: .commercekit__element--modifier
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductSummary {
  id: string;
  name: string;
  price: number; // cents
  compareAtPrice?: number;
  currency: string;
  images: string[];
  status: "active" | "draft" | "archived";
  category?: string;
  inventory: { tracked: boolean; quantity: number; lowStockThreshold: number };
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  total: number; // cents
  currency: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  createdAt: string;
  itemCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPrice(cents: number, currency: string): string {
  const symbol = currency.toLowerCase() === "usd" ? "$" : currency.toUpperCase() + " ";
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

function statusBadge(status: string): string {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: "#e8f5e9", text: "#2e7d32" },
    draft: { bg: "#f0f0f0", text: "#616161" },
    archived: { bg: "#fce4ec", text: "#c62828" },
    pending: { bg: "#fff3e0", text: "#e65100" },
    paid: { bg: "#e8f5e9", text: "#2e7d32" },
    processing: { bg: "#e3f2fd", text: "#1565c0" },
    shipped: { bg: "#f3e5f5", text: "#7b1fa2" },
    delivered: { bg: "#e8f5e9", text: "#2e7d32" },
    cancelled: { bg: "#fce4ec", text: "#c62828" },
    refunded: { bg: "#fff3e0", text: "#e65100" },
  };
  const c = colors[status] || { bg: "#f0f0f0", text: "#616161" };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;background:${c.bg};color:${c.text};">${escapeHtml(label)}</span>`;
}

// ---------------------------------------------------------------------------
// Shared Styles
// ---------------------------------------------------------------------------

export function renderAdminStyles(): string {
  return `<style>
  .commercekit {
    font-family: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #2c2c2c;
    line-height: 1.6;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  .commercekit__header {
    margin-bottom: 2rem;
    border-bottom: 2px solid #d4a853;
    padding-bottom: 1rem;
  }
  .commercekit__title {
    font-family: Lora, serif;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: #2c2c2c;
  }
  .commercekit__subtitle {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
  }
  .commercekit__card {
    background: #faf8f5;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 1.25rem;
    transition: box-shadow 0.2s;
  }
  .commercekit__card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .commercekit__card-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #7a8b6f;
    margin: 0 0 0.5rem 0;
  }
  .commercekit__card-value {
    font-family: Lora, serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0;
  }
  .commercekit__card--highlight .commercekit__card-value {
    color: #c4704b;
  }
  .commercekit__card-detail {
    font-size: 0.8rem;
    color: #999;
    margin: 0.25rem 0 0 0;
  }
  .commercekit__table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
  }
  .commercekit__table th {
    text-align: left;
    padding: 0.6rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #7a8b6f;
    background: #faf8f5;
    border-bottom: 2px solid #e5e5e5;
  }
  .commercekit__table td {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    border-bottom: 1px solid #e5e5e5;
    vertical-align: middle;
  }
  .commercekit__table tr:hover td {
    background: rgba(196, 112, 75, 0.04);
  }
  .commercekit__product-img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    background: #e5e5e5;
  }
  .commercekit__empty {
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 3rem 1rem;
    background: #faf8f5;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
  }
  .commercekit__recent-item {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid #e5e5e5;
  }
  .commercekit__recent-item:last-child {
    border-bottom: none;
  }
  @media (max-width: 640px) {
    .commercekit { padding: 1rem; }
    .commercekit__title { font-size: 1.5rem; }
    .commercekit__card-value { font-size: 1.5rem; }
  }
</style>`;
}

// ---------------------------------------------------------------------------
// Product List Page
// ---------------------------------------------------------------------------

export function renderProductListPage(products: ProductSummary[]): string {
  if (products.length === 0) {
    return `<div class="commercekit">
  ${renderAdminStyles()}
  <div class="commercekit__header">
    <h1 class="commercekit__title">Products</h1>
    <p class="commercekit__subtitle">Manage your product catalog</p>
  </div>
  <div class="commercekit__empty">No products yet. Create your first product to get started.</div>
</div>`;
  }

  const rows = products
    .map((p) => {
      const imgHtml = p.images.length > 0
        ? `<img class="commercekit__product-img" src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" />`
        : `<div class="commercekit__product-img" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:0.7rem;">No img</div>`;
      const priceHtml = p.compareAtPrice
        ? `<span style="text-decoration:line-through;color:#999;margin-right:0.5rem;">${formatPrice(p.compareAtPrice, p.currency)}</span>${formatPrice(p.price, p.currency)}`
        : formatPrice(p.price, p.currency);
      const inventoryHtml = p.inventory.tracked
        ? `${p.inventory.quantity}${p.inventory.quantity <= p.inventory.lowStockThreshold ? ' <span style="color:#c62828;font-weight:600;">Low</span>' : ""}`
        : "Not tracked";

      return `<tr data-product-id="${escapeHtml(p.id)}">
    <td>${imgHtml}</td>
    <td><strong>${escapeHtml(p.name)}</strong>${p.category ? `<br><span style="font-size:0.8rem;color:#7a8b6f;">${escapeHtml(p.category)}</span>` : ""}</td>
    <td>${priceHtml}</td>
    <td>${statusBadge(p.status)}</td>
    <td>${inventoryHtml}</td>
  </tr>`;
    })
    .join("");

  return `<div class="commercekit">
  ${renderAdminStyles()}
  <div class="commercekit__header">
    <h1 class="commercekit__title">Products</h1>
    <p class="commercekit__subtitle">${products.length} product${products.length !== 1 ? "s" : ""} in catalog</p>
  </div>
  <table class="commercekit__table">
    <thead>
      <tr>
        <th style="width:50px;">Image</th>
        <th>Name</th>
        <th>Price</th>
        <th>Status</th>
        <th>Inventory</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
}

// ---------------------------------------------------------------------------
// Order List Page
// ---------------------------------------------------------------------------

export function renderOrderListPage(orders: OrderSummary[]): string {
  if (orders.length === 0) {
    return `<div class="commercekit">
  ${renderAdminStyles()}
  <div class="commercekit__header">
    <h1 class="commercekit__title">Orders</h1>
    <p class="commercekit__subtitle">Manage customer orders</p>
  </div>
  <div class="commercekit__empty">No orders yet.</div>
</div>`;
  }

  const rows = orders
    .map(
      (o) => `<tr data-order-id="${escapeHtml(o.id)}">
    <td><strong>${escapeHtml(o.orderNumber)}</strong></td>
    <td>${escapeHtml(o.customer.name)}<br><span style="font-size:0.8rem;color:#7a8b6f;">${escapeHtml(o.customer.email)}</span></td>
    <td>${o.itemCount} item${o.itemCount !== 1 ? "s" : ""}</td>
    <td>${formatPrice(o.total, o.currency)}</td>
    <td>${statusBadge(o.status)}</td>
    <td>${formatDate(o.createdAt)}</td>
  </tr>`
    )
    .join("");

  return `<div class="commercekit">
  ${renderAdminStyles()}
  <div class="commercekit__header">
    <h1 class="commercekit__title">Orders</h1>
    <p class="commercekit__subtitle">${orders.length} order${orders.length !== 1 ? "s" : ""}</p>
  </div>
  <table class="commercekit__table">
    <thead>
      <tr>
        <th>Order</th>
        <th>Customer</th>
        <th>Items</th>
        <th>Total</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Revenue Today
// ---------------------------------------------------------------------------

export function renderRevenueTodayWidget(revenue: { total: number; orderCount: number; currency: string }): string {
  return `<div class="commercekit__card commercekit__card--highlight">
  ${renderAdminStyles()}
  <p class="commercekit__card-label">Revenue Today</p>
  <p class="commercekit__card-value">${formatPrice(revenue.total, revenue.currency)}</p>
  <p class="commercekit__card-detail">${revenue.orderCount} order${revenue.orderCount !== 1 ? "s" : ""} today</p>
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Pending Orders
// ---------------------------------------------------------------------------

export function renderPendingOrdersWidget(count: number): string {
  return `<div class="commercekit__card">
  ${renderAdminStyles()}
  <p class="commercekit__card-label">Pending Orders</p>
  <p class="commercekit__card-value">${count}</p>
  <p class="commercekit__card-detail">${count === 0 ? "All caught up!" : "Awaiting processing"}</p>
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Recent Orders
// ---------------------------------------------------------------------------

export function renderRecentOrdersWidget(orders: OrderSummary[]): string {
  const items = orders.slice(0, 5);

  if (items.length === 0) {
    return `<div class="commercekit__card" style="grid-column: span 2;">
  ${renderAdminStyles()}
  <p class="commercekit__card-label">Recent Orders</p>
  <p class="commercekit__card-detail" style="text-align:center;padding:1rem 0;font-style:italic;">No orders yet.</p>
</div>`;
  }

  const rows = items
    .map(
      (o) => `<div class="commercekit__recent-item">
  <div style="flex-shrink:0;">${statusBadge(o.status)}</div>
  <div style="flex:1;min-width:0;">
    <span style="font-weight:600;font-size:0.85rem;">${escapeHtml(o.orderNumber)}</span>
    <span style="color:#7a8b6f;font-size:0.8rem;margin-left:0.5rem;">${escapeHtml(o.customer.name)}</span>
  </div>
  <div style="flex-shrink:0;font-weight:600;font-size:0.85rem;color:#c4704b;">${formatPrice(o.total, o.currency)}</div>
</div>`
    )
    .join("");

  return `<div class="commercekit__card" style="grid-column: span 2;">
  ${renderAdminStyles()}
  <p class="commercekit__card-label">Recent Orders</p>
  ${rows}
</div>`;
}
