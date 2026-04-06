/**
 * PageSpeed Analysis API Endpoint
 * Requirement: REQ-012 - Build PageSpeed Insights API client
 *
 * GET /api/pagespeed/analyze?url=<url>&strategy=<mobile|desktop>
 * Returns PageSpeed metrics for the specified URL
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getPageSpeedMetrics, PageSpeedResult, PageSpeedStrategy } from '../../../lib/pagespeed';
import { withAuth, User } from '../../../lib/auth';

interface AnalyzeResponse {
  success: boolean;
  data?: PageSpeedResult;
  error?: string;
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * PageSpeed analysis handler (protected by auth)
 */
async function analyzeHandler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse>,
  user: User
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { url, strategy = 'mobile', skipCache } = req.query;

    // Validate URL parameter
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required',
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL.',
      });
    }

    // Validate strategy parameter
    const validStrategies: PageSpeedStrategy[] = ['mobile', 'desktop'];
    const selectedStrategy = (
      typeof strategy === 'string' ? strategy : 'mobile'
    ) as PageSpeedStrategy;

    if (!validStrategies.includes(selectedStrategy)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid strategy. Must be "mobile" or "desktop".',
      });
    }

    // Fetch PageSpeed metrics
    const result = await getPageSpeedMetrics(
      url,
      selectedStrategy,
      skipCache === 'true'
    );

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: result.error || 'Failed to fetch PageSpeed metrics',
      });
    }

    // Set cache headers (client-side caching)
    res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[PageSpeed API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default withAuth(analyzeHandler);
