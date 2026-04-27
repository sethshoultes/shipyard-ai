-- customers: created/updated by Stripe webhook
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  tier TEXT CHECK(tier IN ('none','keep','grow','scale')) DEFAULT 'none',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- sites: one per shipped project
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  name TEXT NOT NULL,
  url TEXT,
  status TEXT CHECK(status IN ('building','deployed','maintenance','archived')) DEFAULT 'deployed',
  last_checked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- health_checks: latest result only (no history table in V1)
CREATE TABLE health_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT REFERENCES sites(id),
  uptime_status TEXT CHECK(uptime_status IN ('green','yellow','red')),
  ssl_status TEXT CHECK(ssl_status IN ('green','yellow','red')),
  lighthouse_status TEXT CHECK(lighthouse_status IN ('green','yellow','red')),
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- email_log: dedup + audit only, no open/click columns
CREATE TABLE email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id TEXT REFERENCES customers(id),
  email_type TEXT CHECK(email_type IN ('welcome','day7')),
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- portal_tokens: lightweight access, NOT an auth system
CREATE TABLE portal_tokens (
  token TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
