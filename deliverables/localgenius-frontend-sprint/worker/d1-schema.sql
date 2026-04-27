-- D1 schema for Sous subscriptions
-- One table only: sous_subscriptions

CREATE TABLE sous_subscriptions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT CHECK(tier IN ('free', 'base', 'pro')),
  status TEXT CHECK(status IN ('active', 'canceled', 'past_due')),
  responses_used INTEGER DEFAULT 0,
  responses_limit INTEGER DEFAULT 50,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
