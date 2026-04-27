import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

export const tierPriceIds: Record<string, string> = {
  keep: process.env.STRIPE_PRICE_KEEP || '',
  grow: process.env.STRIPE_PRICE_GROW || '',
  scale: process.env.STRIPE_PRICE_SCALE || '',
};
