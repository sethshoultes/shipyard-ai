-- Migration: 003_create_subscriptions_table
-- Description: Create the subscriptions table with Stripe sync fields
-- Created: 2026-04-06
-- Requirement: REQ-006

BEGIN;

-- Create subscriptions table with Stripe sync fields
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_price_id VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('basic', 'pro', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN (
        'trialing', 'active', 'incomplete', 'incomplete_expired',
        'past_due', 'canceled', 'unpaid'
    )),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for Stripe ID lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
    ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
    ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add foreign key constraint to sites table
ALTER TABLE sites
    ADD CONSTRAINT fk_sites_subscription
    FOREIGN KEY (subscription_id)
    REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Create updated_at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
