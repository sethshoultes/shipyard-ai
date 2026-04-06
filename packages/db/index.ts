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
