/**
 * Authentication module for MemberShip plugin
 * Version: 1.0.0
 *
 * Implements JWT authentication with httpOnly cookies.
 * - 15-minute access tokens
 * - 7-day refresh tokens
 *
 * SECURITY: Admin endpoints MUST be protected by verifyAdminAuth().
 */

export interface AuthConfig {
  jwtSecret: string;
  adminEmails: string[];
  cookieDomain?: string;
  secureCookies?: boolean;
}

export interface TokenPayload {
  email: string;
  memberId: string;
  isAdmin: boolean;
  exp: number;
  iat: number;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  payload?: TokenPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

let authConfig: AuthConfig | null = null;

/**
 * Initialize authentication
 */
export function initAuth(config: AuthConfig): void {
  if (!config.jwtSecret) {
    throw new Error('JWT secret is required');
  }
  if (!config.adminEmails || config.adminEmails.length === 0) {
    throw new Error('At least one admin email is required');
  }
  authConfig = config;
}

/**
 * Get auth config
 */
function getConfig(): AuthConfig {
  if (!authConfig) {
    throw new Error('Auth not initialized. Call initAuth() first.');
  }
  return authConfig;
}

/**
 * Base64url encode
 */
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64url decode
 */
function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

/**
 * Create HMAC signature using Web Crypto API
 */
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verify HMAC signature
 */
async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await createSignature(data, secret);
  return signature === expectedSignature;
}

/**
 * Create a JWT token
 */
async function createToken(
  payload: Omit<TokenPayload, 'exp' | 'iat'>,
  expirySeconds: number
): Promise<string> {
  const config = getConfig();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expirySeconds,
  };

  const headerEncoded = base64urlEncode(JSON.stringify(header));
  const payloadEncoded = base64urlEncode(JSON.stringify(fullPayload));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = await createSignature(data, config.jwtSecret);

  return `${data}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
async function verifyToken(token: string): Promise<AuthResult> {
  const config = getConfig();

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { success: false, error: 'Invalid token format' };
  }

  const [headerEncoded, payloadEncoded, signature] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;

  const isValid = await verifySignature(data, signature, config.jwtSecret);
  if (!isValid) {
    return { success: false, error: 'Invalid signature' };
  }

  try {
    const payload: TokenPayload = JSON.parse(base64urlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return { success: false, error: 'Token expired' };
    }

    return { success: true, payload };
  } catch {
    return { success: false, error: 'Invalid token payload' };
  }
}

/**
 * Generate access and refresh tokens for a member
 */
export async function generateTokens(
  email: string,
  memberId: string
): Promise<TokenPair> {
  const config = getConfig();
  const isAdmin = config.adminEmails.includes(email.toLowerCase());

  const accessToken = await createToken(
    { email, memberId, isAdmin },
    ACCESS_TOKEN_EXPIRY
  );

  const refreshToken = await createToken(
    { email, memberId, isAdmin },
    REFRESH_TOKEN_EXPIRY
  );

  return { accessToken, refreshToken };
}

/**
 * Verify member authentication from request
 * Returns the token payload if valid
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  const cookies = request.headers.get('cookie') || '';
  const accessTokenMatch = cookies.match(/access_token=([^;]+)/);

  if (!accessTokenMatch) {
    return { success: false, error: 'No access token' };
  }

  return verifyToken(accessTokenMatch[1]);
}

/**
 * Verify admin authentication
 * REQUIRED for all admin endpoints
 */
export async function verifyAdminAuth(request: Request): Promise<AuthResult> {
  const result = await verifyAuth(request);

  if (!result.success) {
    return result;
  }

  if (!result.payload?.isAdmin) {
    return { success: false, error: 'Admin access required' };
  }

  return result;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(request: Request): Promise<AuthResult & { newAccessToken?: string }> {
  const cookies = request.headers.get('cookie') || '';
  const refreshTokenMatch = cookies.match(/refresh_token=([^;]+)/);

  if (!refreshTokenMatch) {
    return { success: false, error: 'No refresh token' };
  }

  const result = await verifyToken(refreshTokenMatch[1]);

  if (!result.success || !result.payload) {
    return result;
  }

  const newAccessToken = await createToken(
    {
      email: result.payload.email,
      memberId: result.payload.memberId,
      isAdmin: result.payload.isAdmin,
    },
    ACCESS_TOKEN_EXPIRY
  );

  return { success: true, payload: result.payload, newAccessToken };
}

/**
 * Create auth cookie headers
 */
export function createAuthCookies(tokens: TokenPair): string[] {
  const config = getConfig();
  const secure = config.secureCookies !== false;
  const domain = config.cookieDomain ? `; Domain=${config.cookieDomain}` : '';
  const secureFlag = secure ? '; Secure' : '';

  return [
    `access_token=${tokens.accessToken}; HttpOnly; SameSite=Strict; Path=/${domain}${secureFlag}; Max-Age=${ACCESS_TOKEN_EXPIRY}`,
    `refresh_token=${tokens.refreshToken}; HttpOnly; SameSite=Strict; Path=/${domain}${secureFlag}; Max-Age=${REFRESH_TOKEN_EXPIRY}`,
  ];
}

/**
 * Create logout cookie headers (clear tokens)
 */
export function createLogoutCookies(): string[] {
  return [
    'access_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
    'refresh_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
  ];
}

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string): boolean {
  const config = getConfig();
  return config.adminEmails.includes(email.toLowerCase());
}
