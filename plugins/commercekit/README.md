# CommerceKit

E-commerce toolkit plugin for EmDash CMS. Provides product catalog management, shopping cart, Stripe checkout, order management, and inventory tracking.

## Features

- **Product Management** — CRUD with variants, categories, tags, images, sale prices
- **Shopping Cart** — Session-based carts with inventory validation, 7-day expiry
- **Stripe Checkout** — Hosted checkout sessions with tax and shipping calculation
- **Order Management** — Status tracking, cancellation with inventory restore, email notifications
- **Inventory Tracking** — Per-product and per-variant stock levels, low-stock alerts
- **Email Notifications** — Order confirmation, shipping, and cancellation via Resend API
- **Admin Dashboard** — Product list, order list, revenue widget, pending orders widget
- **Astro Components** — ProductCard, ProductGrid, CartWidget, CheckoutForm

## Quick Start

```bash
npm install
npm test          # Run 39 tests
npm run test:watch # Watch mode
```

## Routes

### Admin (requires auth)
- `createProduct` / `updateProduct` / `deleteProduct` / `getProduct` / `listProducts`
- `listOrders` / `getOrder` / `updateOrderStatus` / `cancelOrder` / `orderAnalytics`
- `getInventory` / `updateInventory` / `lowStockAlert`
- `getSettings` / `updateSettings`

### Public
- `getProductPublic` / `listProductsPublic`
- `createCart` / `addToCart` / `updateCartItem` / `removeFromCart` / `getCart` / `clearCart`
- `createCheckout` / `checkoutSuccess` / `stripeWebhook`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for checkout |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `RESEND_API_KEY` | For emails | Resend API key for transactional email |
| `STORE_FROM_EMAIL` | For emails | Sender email address |
