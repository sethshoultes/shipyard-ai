export interface Customer {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: 'none' | 'keep' | 'grow' | 'scale';
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  customer_id: string;
  name: string;
  url: string | null;
  status: 'building' | 'deployed' | 'maintenance' | 'archived';
  last_checked_at: string | null;
  created_at: string;
}

export interface HealthCheck {
  id: number;
  site_id: string;
  uptime_status: 'green' | 'yellow' | 'red';
  ssl_status: 'green' | 'yellow' | 'red';
  lighthouse_status: 'green' | 'yellow' | 'red';
  checked_at: string;
}

export interface EmailLog {
  id: number;
  customer_id: string;
  email_type: 'welcome' | 'day7';
  sent_at: string;
}

export interface PortalToken {
  token: string;
  customer_id: string;
  expires_at: string;
  created_at: string;
}

export function getDb(env: { DB?: D1Database }) {
  const db = env.DB;
  if (!db) {
    throw new Error('D1 database binding (DB) is not available');
  }
  return db;
}
