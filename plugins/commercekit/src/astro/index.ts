/**
 * Astro components for CommerceKit plugin.
 * Exported to the site for rendering e-commerce blocks.
 */

import ProductCard from "./ProductCard.astro";
import ProductGrid from "./ProductGrid.astro";
import CartWidget from "./CartWidget.astro";
import CheckoutForm from "./CheckoutForm.astro";

export const blockComponents = {
  "product-card": ProductCard,
  "product-grid": ProductGrid,
  "cart-widget": CartWidget,
  "checkout-form": CheckoutForm,
};

export { ProductCard, ProductGrid, CartWidget, CheckoutForm };
