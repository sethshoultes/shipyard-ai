/**
 * Authentication Module
 * Requirements: REQ-008, REQ-009, REQ-010
 *
 * Implements session-based authentication with httpOnly cookies,
 * including middleware for route protection.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes, createHash } from 'crypto';
import { query } from './db';

/**
 * Session configuration
 * REQ-008: 15-minute access tokens with refresh mechanism
 */
const SESSION_CONFIG = {
  cookieName: 'pulse_session',
  refreshCookieName: 'pulse_refresh',
  accessTokenMaxAge: 15 * 60, // 15 minutes in seconds
  refreshTokenMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  tokenLength: 32, // bytes
  refreshThreshold: 5 * 60, // 5 minutes - refresh if less than this remaining
};

/**
 * Cookie options for httpOnly session cookie
 * REQ-008: httpOnly, Secure, SameSite=Strict
 */
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: SESSION_CONFIG.accessTokenMaxAge,
};

/**
 * Cookie options for refresh token cookie
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: SESSION_CONFIG.refreshTokenMaxAge,
};

/**
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

/**
 * Session type definition
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Token pair for access and refresh tokens
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth result type
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return randomBytes(SESSION_CONFIG.tokenLength).toString('hex');
}

/**
 * Hash a session token for storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Format cookie string with options
 */
function formatCookie(name: string, value: string, options: typeof ACCESS_COOKIE_OPTIONS): string {
  const parts = [`${name}=${value}`];

  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);

  return parts.join('; ');
}

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name) {
        cookies[name] = valueParts.join('=');
      }
      return cookies;
    },
    {} as Record<string, string>
  );
}

/**
 * Create a new session for a user with access and refresh tokens
 * REQ-008: 15-minute access tokens with refresh mechanism
 * REQ-009: Login endpoint support
 *
 * @param userId - User ID to create session for
 * @returns Token pair with access and refresh tokens
 */
export async function createSession(userId: string): Promise<TokenPair> {
  const accessToken = generateSessionToken();
  const refreshToken = generateSessionToken();
  const accessTokenHash = hashToken(accessToken);
  const refreshTokenHash = hashToken(refreshToken);
  const accessExpiresAt = new Date(Date.now() + SESSION_CONFIG.accessTokenMaxAge * 1000);
  const refreshExpiresAt = new Date(Date.now() + SESSION_CONFIG.refreshTokenMaxAge * 1000);

  // Store access token session
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, accessTokenHash, accessExpiresAt]
  );

  // Store refresh token session
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, refreshTokenHash, refreshExpiresAt]
  );

  return { accessToken, refreshToken };
}

/**
 * Validate a session token and return user
 *
 * @param token - Session token from cookie
 * @returns User if session is valid, null otherwise
 */
export async function validateSession(token: string): Promise<User | null> {
  const tokenHash = hashToken(token);

  const result = await query<User & { session_id: string }>(
    `SELECT u.id, u.email, u.name, u.created_at as "createdAt", s.id as session_id
     FROM users u
     JOIN sessions s ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
  };
}

/**
 * Destroy a session (logout)
 * REQ-009: Logout endpoint support
 *
 * @param token - Session token to invalidate
 */
export async function destroySession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
}

/**
 * Set session cookies on response (access + refresh tokens)
 * REQ-008: 15-minute access tokens with refresh
 */
export function setSessionCookie(res: NextApiResponse, tokens: TokenPair): void {
  const accessCookie = formatCookie(SESSION_CONFIG.cookieName, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
  const refreshCookie = formatCookie(SESSION_CONFIG.refreshCookieName, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
}

/**
 * Clear session cookies on response
 */
export function clearSessionCookie(res: NextApiResponse): void {
  const accessCookie = formatCookie(SESSION_CONFIG.cookieName, '', {
    ...ACCESS_COOKIE_OPTIONS,
    maxAge: 0,
  });
  const refreshCookie = formatCookie(SESSION_CONFIG.refreshCookieName, '', {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
}

/**
 * Get session token from request
 */
export function getSessionToken(req: NextApiRequest): string | null {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_CONFIG.cookieName] || null;
}

/**
 * Get refresh token from request
 */
export function getRefreshToken(req: NextApiRequest): string | null {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_CONFIG.refreshCookieName] || null;
}

/**
 * Refresh an access token using a valid refresh token
 * REQ-008: Token refresh works before expiry (15-minute access tokens)
 *
 * @param refreshToken - Valid refresh token
 * @returns New token pair if refresh successful, null otherwise
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const refreshTokenHash = hashToken(refreshToken);

  // Validate refresh token and get user
  const result = await query<{ user_id: string; session_id: string }>(
    `SELECT s.user_id, s.id as session_id
     FROM sessions s
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [refreshTokenHash]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const { user_id: userId } = result.rows[0];

  // Generate new access token
  const newAccessToken = generateSessionToken();
  const newAccessTokenHash = hashToken(newAccessToken);
  const newAccessExpiresAt = new Date(Date.now() + SESSION_CONFIG.accessTokenMaxAge * 1000);

  // Store new access token
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, newAccessTokenHash, newAccessExpiresAt]
  );

  return { accessToken: newAccessToken, refreshToken };
}

/**
 * Check if session needs refresh (less than threshold remaining)
 */
export async function sessionNeedsRefresh(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);

  const result = await query<{ expires_at: Date }>(
    `SELECT expires_at FROM sessions WHERE token_hash = $1`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const expiresAt = new Date(result.rows[0].expires_at);
  const timeRemaining = expiresAt.getTime() - Date.now();
  return timeRemaining < SESSION_CONFIG.refreshThreshold * 1000;
}

/**
 * Authentication middleware for route protection
 * REQ-008: Session-based authentication middleware with token refresh
 * REQ-010: Route protection for dashboard endpoints
 *
 * Protects API routes by requiring valid session.
 * Automatically refreshes access tokens when nearing expiry.
 * Returns 401 Unauthorized for unauthenticated requests.
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const accessToken = getSessionToken(req);
    const refreshToken = getRefreshToken(req);

    if (!accessToken) {
      // No access token - try to refresh if we have a refresh token
      if (refreshToken) {
        const newTokens = await refreshAccessToken(refreshToken);
        if (newTokens) {
          setSessionCookie(res, newTokens);
          const user = await validateSession(newTokens.accessToken);
          if (user) {
            return handler(req, res, user);
          }
        }
      }

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please log in.',
      });
    }

    const user = await validateSession(accessToken);

    if (!user) {
      // Access token invalid - try refresh
      if (refreshToken) {
        const newTokens = await refreshAccessToken(refreshToken);
        if (newTokens) {
          setSessionCookie(res, newTokens);
          const refreshedUser = await validateSession(newTokens.accessToken);
          if (refreshedUser) {
            return handler(req, res, refreshedUser);
          }
        }
      }

      clearSessionCookie(res);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired or invalid. Please log in again.',
      });
    }

    // Check if access token needs refresh (proactive refresh)
    const needsRefresh = await sessionNeedsRefresh(accessToken);
    if (needsRefresh && refreshToken) {
      const newTokens = await refreshAccessToken(refreshToken);
      if (newTokens) {
        setSessionCookie(res, newTokens);
      }
    }

    // Attach user to request and call handler
    return handler(req, res, user);
  };
}

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't require it
 */
export function withOptionalAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    user: User | null
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const token = getSessionToken(req);

    if (!token) {
      return handler(req, res, null);
    }

    const user = await validateSession(token);
    return handler(req, res, user);
  };
}
