/**
 * SPARK Storage Utilities
 * Handle localStorage for site_id persistence
 */

const STORAGE_KEY = 'spark_site_id';

export function getSiteId() {
  try {
    let siteId = localStorage.getItem(STORAGE_KEY);

    if (!siteId) {
      // Generate new UUID v4
      siteId = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, siteId);
    }

    return siteId;
  } catch (error) {
    console.error('SPARK: Failed to access localStorage', error);
    // Fallback to session-only UUID if localStorage unavailable
    return crypto.randomUUID();
  }
}

export function clearSiteId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('SPARK: Failed to clear localStorage', error);
  }
}
