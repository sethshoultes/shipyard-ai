-- LocalGenius D1 Database Schema
-- FAQ caching and business management

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    email TEXT,
    wordpress_url TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- FAQs table for caching
CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_auto_generated INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Chat logs for analytics (lightweight)
CREATE TABLE IF NOT EXISTS chat_logs (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL,
    was_cached INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_faqs_business_id ON faqs(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_business_id ON chat_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_businesses_api_key ON businesses(api_key);
