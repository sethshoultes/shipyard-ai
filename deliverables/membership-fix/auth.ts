/**
 * JWT Authentication Module
 *
 * Provides secure JWT token generation, verification, and payload management
 * for member self-serve dashboard authentication.
 *
 * Security:
 * - Tokens stored in httpOnly, Secure, SameSite=Strict cookies (no localStorage)
 * - 15-minute access token expiry
 * - 7-day refresh token expiry
 * - HMAC-SHA256 signature verification
 */

/**
 * JWT Payload structure for member authentication
 */
export interface JWTPayload {
	email: string;
	plan: string;
	status: "pending" | "active" | "revoked" | "cancelled" | "past_due";
	iat: number; // Issued at
	exp: number; // Expiration time
	type: "access" | "refresh"; // Token type
}

/**
 * Create JWT payload object
 *
 * @param email - Member email address
 * @param plan - Current membership plan
 * @param status - Member status
 * @param expiresIn - Seconds until expiration
 * @param type - Token type (access or refresh)
 * @returns JWT payload object
 */
export function createPayload(
	email: string,
	plan: string,
	status: "pending" | "active" | "revoked" | "cancelled" | "past_due",
	expiresIn: number,
	type: "access" | "refresh" = "access"
): JWTPayload {
	const now = Math.floor(Date.now() / 1000);
	return {
		email,
		plan,
		status,
		iat: now,
		exp: now + expiresIn,
		type,
	};
}

/**
 * Sign a JWT token using HMAC-SHA256
 *
 * Implements JWT structure: Base64(header).Base64(payload).Base64(signature)
 *
 * @param payload - JWT payload object
 * @param secret - Signing secret
 * @returns Signed JWT token string
 */
export async function signJWT(
	payload: JWTPayload,
	secret: string
): Promise<string> {
	// Header
	const header = {
		alg: "HS256",
		typ: "JWT",
	};

	const encodedHeader = btoa(JSON.stringify(header));
	const encodedPayload = btoa(JSON.stringify(payload));

	// Create signature
	const message = `${encodedHeader}.${encodedPayload}`;
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);

	const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));

	// Convert signature to base64url
	const encodedSignature = btoa(
		Array.from(new Uint8Array(signature))
			.map((b) => String.fromCharCode(b))
			.join("")
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");

	return `${message}.${encodedSignature}`;
}

/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token string
 * @param secret - Signing secret
 * @returns Decoded payload if valid, null if invalid or expired
 */
export async function verifyJWT(
	token: string,
	secret: string
): Promise<JWTPayload | null> {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			return null;
		}

		const [encodedHeader, encodedPayload, encodedSignature] = parts;

		// Verify signature
		const message = `${encodedHeader}.${encodedPayload}`;
		const key = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"]
		);

		const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));

		// Convert signature to base64url for comparison
		const expectedSignature = btoa(
			Array.from(new Uint8Array(signature))
				.map((b) => String.fromCharCode(b))
				.join("")
		)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");

		if (encodedSignature !== expectedSignature) {
			return null;
		}

		// Decode payload
		const payload = JSON.parse(atob(encodedPayload)) as JWTPayload;

		// Check expiration
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp < now) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}

/**
 * Extract JWT token from Authorization header
 *
 * Expects: "Bearer {token}"
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found/invalid
 */
export function extractToken(authHeader?: string): string | null {
	if (!authHeader) return null;

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return null;
	}

	return parts[1];
}

/**
 * Generate cookie header string for httpOnly JWT storage
 *
 * Security settings:
 * - httpOnly: Cannot be accessed via JavaScript
 * - Secure: HTTPS only
 * - SameSite=Strict: CSRF protection
 * - Path=/: Available across all routes
 *
 * @param token - JWT token
 * @param maxAgeSeconds - Cookie expiration in seconds
 * @param sameSite - SameSite attribute (default: "Strict")
 * @returns Set-Cookie header value
 */
export function generateCookieHeader(
	token: string,
	maxAgeSeconds: number,
	sameSite: "Strict" | "Lax" | "None" = "Strict"
): string {
	const attributes = [
		`Authorization=${encodeURIComponent(token)}`,
		`Max-Age=${maxAgeSeconds}`,
		"Path=/",
		"httpOnly",
		"Secure",
		`SameSite=${sameSite}`,
	];

	return attributes.join("; ");
}
