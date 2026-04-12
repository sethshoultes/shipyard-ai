/**
 * Anchor — PageSpeed Cron Worker
 *
 * Runs weekly on Mondays at 3am UTC
 * Per wrangler.toml: cron = "0 3 * * 1"
 *
 * Per decisions.md:
 * - Weekly checks (not daily) to respect API limits
 * - 52-week rolling history per customer
 */

import type { Env } from "../lib/types";
import { getPerformanceScore, getScoreRating } from "../lib/pagespeed";
import { getActiveCustomers, addPageSpeedResult } from "../lib/customers";

export default {
  /**
   * Handle scheduled cron trigger
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log(`[PageSpeed] Cron triggered at ${new Date().toISOString()}`);

    try {
      const customers = await getActiveCustomers();
      console.log(`[PageSpeed] Processing ${customers.length} active customers`);

      let successCount = 0;
      let errorCount = 0;

      for (const customer of customers) {
        try {
          await processCustomer(customer.id, customer.siteUrl, customer.email, env);
          successCount++;

          // Small delay between API calls to avoid rate limiting
          await sleep(1000);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(`[PageSpeed] Error for ${customer.email}: ${message}`);
          errorCount++;
        }
      }

      console.log(`[PageSpeed] Complete: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[PageSpeed] Fatal error: ${message}`);
      throw error;
    }
  },
};

/**
 * Process a single customer's site
 */
async function processCustomer(
  customerId: string,
  siteUrl: string,
  email: string,
  env: Env
): Promise<void> {
  console.log(`[PageSpeed] Analyzing ${siteUrl} for ${email}`);

  // Get performance scores
  const result = await getPerformanceScore(siteUrl, env.PAGESPEED_API_KEY);

  // Log result
  const mobileRating = getScoreRating(result.mobile);
  const desktopRating = getScoreRating(result.desktop);
  console.log(
    `[PageSpeed] ${email}: mobile=${result.mobile} (${mobileRating}), desktop=${result.desktop} (${desktopRating})`
  );

  // Save result to customer history
  await addPageSpeedResult(customerId, result);

  // Log Core Web Vitals
  console.log(
    `[PageSpeed] ${email} vitals: LCP=${result.vitals.lcp}ms, FID=${result.vitals.fid}ms, CLS=${result.vitals.cls}`
  );
}

/**
 * Sleep utility for rate limit compliance
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
