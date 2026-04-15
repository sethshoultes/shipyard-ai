-- Migration: Create retainers table
-- Description: Retainer subscriptions table with foreign key to clients
-- Created: 2026-04-15

CREATE TABLE IF NOT EXISTS retainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  token_budget INTEGER DEFAULT 500000,
  tokens_used INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE retainers IS 'Retainer subscription information for clients';
COMMENT ON COLUMN retainers.id IS 'Unique identifier for each retainer subscription';
COMMENT ON COLUMN retainers.client_id IS 'Foreign key reference to clients table';
COMMENT ON COLUMN retainers.stripe_subscription_id IS 'Stripe subscription ID for billing integration';
COMMENT ON COLUMN retainers.status IS 'Subscription status (active, canceled, past_due)';
COMMENT ON COLUMN retainers.token_budget IS 'Monthly token budget for AI updates (default 500000)';
COMMENT ON COLUMN retainers.tokens_used IS 'Tokens consumed in current billing cycle';
COMMENT ON COLUMN retainers.billing_cycle_start IS 'Start of current billing cycle';
COMMENT ON COLUMN retainers.billing_cycle_end IS 'End of current billing cycle';
COMMENT ON COLUMN retainers.created_at IS 'Subscription creation timestamp';
COMMENT ON COLUMN retainers.updated_at IS 'Last update timestamp';
