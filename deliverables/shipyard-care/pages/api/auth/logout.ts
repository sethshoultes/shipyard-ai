/**
 * Logout API Endpoint
 * Requirement: REQ-009 - Create login/logout authentication endpoints
 *
 * POST /api/auth/logout
 * Clears the session and removes the httpOnly cookie
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getSessionToken,
  destroySession,
  clearSessionCookie,
} from '../../../lib/auth';

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const token = getSessionToken(req);

    if (token) {
      // Destroy the session in the database
      await destroySession(token);
    }

    // Clear the session cookie regardless
    clearSessionCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);

    // Still clear the cookie even if database operation fails
    clearSessionCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out',
    });
  }
}
