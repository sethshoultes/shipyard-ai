// Re-export database client
export { getDb, checkConnection } from './client';

// Re-export sites schema and types
export {
  sitesTable,
  type Site,
  type NewSite,
  type SiteStatus,
  type SiteTier,
} from './schema/sites';

// Re-export subscriptions schema and types
export {
  subscriptionsTable,
  type Subscription,
  type NewSubscription,
  type SubscriptionStatus,
  type SubscriptionTier,
} from './schema/subscriptions';

// Re-export sites query helpers
export {
  getSiteById,
  getSiteByUrl,
  createSite,
  updateSite,
  listSites,
  getActiveSites,
  deleteSite,
  getSitesBySubscriptionId,
} from './queries/sites';

// Re-export subscriptions query helpers
export {
  getSubscriptionBySiteId,
  getSubscriptionByStripeId,
  createSubscription,
  updateSubscription,
  getActiveSubscriptions,
} from './queries/subscriptions';

// Re-export metrics schema and types
export {
  metricsTable,
  type Metric,
  type NewMetric,
  type MetricType,
  type AverageMetrics,
} from './schema/metrics';

// Re-export metrics query helpers
export {
  getLatestMetrics,
  getMetricsHistory,
  createMetric,
  getAverageMetrics,
} from './queries/metrics';

// Re-export Shipyard Care subscribers schema and types
export {
  subscribersTable,
  subscribers,
  tierEnum,
  statusEnum,
  type Subscriber,
  type NewSubscriber,
  type Tier,
  type Status,
} from './schema/subscribers';

// Re-export Shipyard Care token usage schema and types
export {
  tokenUsageTable,
  tokenUsage,
  type TokenUsage,
  type NewTokenUsage,
} from './schema/token-usage';

// Re-export Shipyard Care referrals schema and types
export {
  referralsTable,
  referrals,
  type Referral,
  type NewReferral,
} from './schema/referrals';

// Re-export Shipyard Care pricing configuration
export {
  PRICING_TIERS,
  getTierConfig,
  calculateOverageCost,
  REFERRAL_CONFIG,
  TOKEN_WARNING_THRESHOLD,
  ESTIMATED_TOKENS_PER_PRD,
  type CareTier,
  type PricingTier,
} from './config/pricing';
