/**
 * Reporting API for MemberShip plugin
 * Version: 1.0.0
 *
 * Basic reporting: members and revenue only.
 * No vanity metrics per decisions.md.
 * Admin only.
 */

import { verifyAdminAuth } from '../lib/auth';
import { getMemberStats, listMembers } from '../lib/kv';
import { getStripeClient } from '../lib/stripe';

export interface ReportingResponse {
  success: boolean;
  data?: ReportData;
  error?: string;
}

export interface ReportData {
  members: MemberMetrics;
  revenue: RevenueMetrics;
  generatedAt: string;
}

export interface MemberMetrics {
  total: number;
  active: number;
  pastDue: number;
  canceled: number;
  newThisMonth: number;
  churnedThisMonth: number;
}

export interface RevenueMetrics {
  mrr: number; // Monthly recurring revenue in cents
  mrrFormatted: string;
  currency: string;
}

/**
 * GET /api/membership/reporting
 * Get membership and revenue metrics (admin only)
 */
export async function handleReporting(request: Request): Promise<Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.success) {
    return createJsonResponse(
      { success: false, error: 'Admin access required' },
      403
    );
  }

  try {
    const [memberMetrics, revenueMetrics] = await Promise.all([
      calculateMemberMetrics(),
      calculateRevenueMetrics(),
    ]);

    const data: ReportData = {
      members: memberMetrics,
      revenue: revenueMetrics,
      generatedAt: new Date().toISOString(),
    };

    return createJsonResponse({ success: true, data });
  } catch (error) {
    console.error('[Reporting] Failed to generate report:', error);
    return createJsonResponse(
      { success: false, error: 'Failed to generate report' },
      500
    );
  }
}

/**
 * Calculate member metrics
 */
async function calculateMemberMetrics(): Promise<MemberMetrics> {
  const stats = await getMemberStats();

  // Calculate new and churned this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let newThisMonth = 0;
  let churnedThisMonth = 0;
  let cursor: string | undefined;

  do {
    const result = await listMembers({ limit: 100, cursor });

    for (const member of result.members) {
      const createdAt = new Date(member.createdAt);
      if (createdAt >= startOfMonth) {
        newThisMonth++;
      }

      if (
        member.status === 'canceled' &&
        member.expiresAt &&
        new Date(member.expiresAt) >= startOfMonth
      ) {
        churnedThisMonth++;
      }
    }

    cursor = result.cursor;
  } while (cursor);

  return {
    ...stats,
    newThisMonth,
    churnedThisMonth,
  };
}

/**
 * Calculate revenue metrics from Stripe
 */
async function calculateRevenueMetrics(): Promise<RevenueMetrics> {
  const stripe = getStripeClient();

  // Get active subscriptions to calculate MRR
  let mrr = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      starting_after: startingAfter,
    });

    for (const sub of subscriptions.data) {
      // Calculate monthly value for each subscription
      for (const item of sub.items.data) {
        const price = item.price;
        if (price.recurring) {
          let monthlyAmount = price.unit_amount || 0;

          // Normalize to monthly
          switch (price.recurring.interval) {
            case 'year':
              monthlyAmount = monthlyAmount / 12;
              break;
            case 'week':
              monthlyAmount = monthlyAmount * 4;
              break;
            case 'day':
              monthlyAmount = monthlyAmount * 30;
              break;
            // month is already correct
          }

          mrr += monthlyAmount * (item.quantity || 1);
        }
      }
    }

    hasMore = subscriptions.has_more;
    if (subscriptions.data.length > 0) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }

  return {
    mrr: Math.round(mrr),
    mrrFormatted: `$${(mrr / 100).toFixed(2)}`,
    currency: 'usd',
  };
}

/**
 * GET /api/membership/reporting/export
 * Export member list as CSV (admin only)
 */
export async function handleExport(request: Request): Promise<Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.success) {
    return createJsonResponse(
      { success: false, error: 'Admin access required' },
      403
    );
  }

  try {
    const members: string[] = ['Email,Name,Status,Plan,Created,Expires'];
    let cursor: string | undefined;

    do {
      const result = await listMembers({ limit: 100, cursor });

      for (const member of result.members) {
        const row = [
          escapeCSV(member.email),
          escapeCSV(member.name || ''),
          member.status,
          escapeCSV(member.plan),
          member.createdAt,
          member.expiresAt || '',
        ].join(',');
        members.push(row);
      }

      cursor = result.cursor;
    } while (cursor);

    const csv = members.join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="members-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[Reporting] Export failed:', error);
    return createJsonResponse(
      { success: false, error: 'Failed to export data' },
      500
    );
  }
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Create JSON response
 */
function createJsonResponse(data: ReportingResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
