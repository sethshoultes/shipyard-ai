/**
 * Members API for MemberShip plugin
 * Version: 1.0.0
 *
 * CRUD operations for member management.
 * Admin endpoints protected by verifyAdminAuth().
 *
 * SECURITY: Status endpoint requires authentication (no public email lookup).
 */

import { verifyAuth, verifyAdminAuth } from '../lib/auth';
import {
  getMember,
  getMemberByEmail,
  listMembers,
  updateMember,
  deleteMember,
  hasAccess,
  type Member,
  type MemberListOptions,
} from '../lib/kv';
import { cancelSubscription } from '../lib/stripe';

export interface MemberResponse {
  success: boolean;
  member?: Partial<Member>;
  members?: Partial<Member>[];
  error?: string;
  cursor?: string;
}

export interface StatusResponse {
  success: boolean;
  hasAccess: boolean;
  member?: {
    status: Member['status'];
    plan: string;
    expiresAt?: string;
  };
}

/**
 * GET /api/membership/status
 * Check membership status for authenticated user
 * SECURITY: Requires authentication - no public email lookup
 */
export async function handleStatus(request: Request): Promise<Response> {
  const authResult = await verifyAuth(request);

  if (!authResult.success || !authResult.payload) {
    return createJsonResponse(
      { success: false, hasAccess: false, error: 'Authentication required' },
      401
    );
  }

  const member = await getMemberByEmail(authResult.payload.email);
  const memberHasAccess = await hasAccess(authResult.payload.email);

  const response: StatusResponse = {
    success: true,
    hasAccess: memberHasAccess,
  };

  if (member) {
    response.member = {
      status: member.status,
      plan: member.plan,
      expiresAt: member.expiresAt,
    };
  }

  return createJsonResponse(response, 200);
}

/**
 * GET /api/membership/members
 * List all members (admin only)
 */
export async function handleListMembers(request: Request): Promise<Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.success) {
    return createJsonResponse(
      { success: false, error: 'Admin access required' },
      403
    );
  }

  const url = new URL(request.url);
  const options: MemberListOptions = {
    limit: parseInt(url.searchParams.get('limit') || '50', 10),
    cursor: url.searchParams.get('cursor') || undefined,
    status: url.searchParams.get('status') as Member['status'] | undefined,
  };

  const result = await listMembers(options);

  // Sanitize member data for response (exclude sensitive fields)
  const sanitizedMembers = result.members.map(sanitizeMember);

  return createJsonResponse({
    success: true,
    members: sanitizedMembers,
    cursor: result.cursor,
  });
}

/**
 * GET /api/membership/members/:id
 * Get single member (admin only)
 */
export async function handleGetMember(
  request: Request,
  memberId: string
): Promise<Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.success) {
    return createJsonResponse(
      { success: false, error: 'Admin access required' },
      403
    );
  }

  const member = await getMember(memberId);

  if (!member) {
    return createJsonResponse(
      { success: false, error: "We couldn't find that member" },
      404
    );
  }

  return createJsonResponse({
    success: true,
    member: sanitizeMember(member),
  });
}

/**
 * PATCH /api/membership/members/:id
 * Update member (admin only)
 */
export async function handleUpdateMember(
  request: Request,
  memberId: string
): Promise<Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.success) {
    return createJsonResponse(
      { success: false, error: 'Admin access required' },
      403
    );
  }

  let updates: Partial<Member>;
  try {
    updates = await request.json();
  } catch {
    return createJsonResponse(
      { success: false, error: 'Invalid request body' },
      400
    );
  }

  // Prevent updating protected fields
  delete updates.id;
  delete updates.createdAt;
  delete updates.stripeCustomerId;
  delete updates.stripeSubscriptionId;

  const member = await updateMember(memberId, updates);

  if (!member) {
    return createJsonResponse(
      { success: false, error: "We couldn't find that member" },
      404
    );
  }

  return createJsonResponse({
    success: true,
    member: sanitizeMember(member),
  });
}

/**
 * DELETE /api/membership/members/:id
 * Delete member (admin only)
 */
export async function handleDeleteMember(
  request: Request,
  memberId: string
): Promise<Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.success) {
    return createJsonResponse(
      { success: false, error: 'Admin access required' },
      403
    );
  }

  const member = await getMember(memberId);

  if (!member) {
    return createJsonResponse(
      { success: false, error: "We couldn't find that member" },
      404
    );
  }

  // Cancel subscription in Stripe first
  if (member.stripeSubscriptionId) {
    try {
      await cancelSubscription(member.stripeSubscriptionId, true);
    } catch (error) {
      console.error('[Members] Failed to cancel Stripe subscription:', error);
      // Continue with deletion even if Stripe fails
    }
  }

  const deleted = await deleteMember(memberId);

  if (!deleted) {
    return createJsonResponse(
      { success: false, error: 'Failed to delete member' },
      500
    );
  }

  return createJsonResponse({ success: true });
}

/**
 * POST /api/membership/cancel
 * Cancel own membership (authenticated member)
 */
export async function handleCancelMembership(request: Request): Promise<Response> {
  const authResult = await verifyAuth(request);

  if (!authResult.success || !authResult.payload) {
    return createJsonResponse(
      { success: false, error: 'Authentication required' },
      401
    );
  }

  const member = await getMemberByEmail(authResult.payload.email);

  if (!member) {
    return createJsonResponse(
      { success: false, error: "We couldn't find your account" },
      404
    );
  }

  if (member.status === 'canceled') {
    return createJsonResponse(
      { success: false, error: 'Your membership is already canceled' },
      400
    );
  }

  // Cancel at end of period (graceful)
  try {
    await cancelSubscription(member.stripeSubscriptionId, false);
    return createJsonResponse({ success: true });
  } catch (error) {
    console.error('[Members] Cancel failed:', error);
    return createJsonResponse(
      { success: false, error: 'Failed to cancel. Please contact support.' },
      500
    );
  }
}

/**
 * Sanitize member data for API response
 * Removes sensitive internal fields
 */
function sanitizeMember(member: Member): Partial<Member> {
  return {
    id: member.id,
    email: member.email,
    name: member.name,
    status: member.status,
    plan: member.plan,
    createdAt: member.createdAt,
    expiresAt: member.expiresAt,
  };
}

/**
 * Create JSON response
 */
function createJsonResponse(data: MemberResponse | StatusResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
