import { eq, and, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sitesTable, type Site, type NewSite, type SiteStatus, type SiteTier } from '../schema/sites';

/**
 * Query helpers for sites table
 * Provides database access functions for site records
 */

/**
 * Get a site by ID
 * Returns the site record or null if not found
 */
export async function getSiteById(
  db: NodePgDatabase,
  id: number,
): Promise<Site | null> {
  const result = await db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Get a site by URL
 * Returns the site record or null if not found
 * Useful for looking up a site by its domain
 */
export async function getSiteByUrl(
  db: NodePgDatabase,
  url: string,
): Promise<Site | null> {
  const result = await db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.url, url))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new site
 * Inserts site data and returns the created record
 */
export async function createSite(
  db: NodePgDatabase,
  data: NewSite,
): Promise<Site> {
  const result = await db
    .insert(sitesTable)
    .values(data)
    .returning();

  return result[0];
}

/**
 * Update a site record
 * Updates the site with the given ID and returns the updated record
 */
export async function updateSite(
  db: NodePgDatabase,
  id: number,
  data: Partial<NewSite>,
): Promise<Site> {
  const result = await db
    .update(sitesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(sitesTable.id, id))
    .returning();

  return result[0];
}

/**
 * List sites with optional filtering
 * Returns an array of site records matching the filter criteria
 *
 * @param db Database connection
 * @param options Filtering options
 * @param options.status Filter by site status (active, paused, cancelled)
 * @param options.tier Filter by subscription tier (basic, pro, enterprise)
 * @returns Array of matching sites
 */
export async function listSites(
  db: NodePgDatabase,
  options?: {
    status?: SiteStatus;
    tier?: SiteTier;
  },
): Promise<Site[]> {
  let query = db.select().from(sitesTable);

  const filters: any[] = [];

  if (options?.status) {
    filters.push(eq(sitesTable.status, options.status));
  }

  if (options?.tier !== undefined) {
    filters.push(eq(sitesTable.tier, options.tier));
  }

  if (filters.length > 0) {
    query = query.where(and(...filters));
  }

  return query;
}

/**
 * Get all active sites
 * Returns sites with status 'active'
 */
export async function getActiveSites(
  db: NodePgDatabase,
): Promise<Site[]> {
  return db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.status, 'active'));
}

/**
 * Delete a site by ID
 * Removes the site record from the database
 * Note: Cascading delete on subscriptions will occur per schema
 */
export async function deleteSite(
  db: NodePgDatabase,
  id: number,
): Promise<boolean> {
  const result = await db
    .delete(sitesTable)
    .where(eq(sitesTable.id, id));

  return !!result;
}

/**
 * Get sites by subscription ID
 * Returns all sites associated with a specific subscription
 */
export async function getSitesBySubscriptionId(
  db: NodePgDatabase,
  subscriptionId: number,
): Promise<Site[]> {
  return db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.subscriptionId, subscriptionId));
}
