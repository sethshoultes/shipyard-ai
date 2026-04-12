/**
 * KV Storage module for MemberShip plugin
 * Version: 1.0.0
 *
 * Cloudflare KV-based member storage with proper typing.
 * Handles member records, status tracking, and expiration.
 */

export interface KVConfig {
  namespace: KVNamespace;
}

export interface Member {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  plan: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  metadata?: Record<string, string>;
}

export interface MemberListOptions {
  limit?: number;
  cursor?: string;
  status?: Member['status'];
}

export interface MemberListResult {
  members: Member[];
  cursor?: string;
  complete: boolean;
}

export interface MemberStats {
  total: number;
  active: number;
  pastDue: number;
  canceled: number;
}

let kvNamespace: KVNamespace | null = null;

// Key prefixes for organized storage
const MEMBER_PREFIX = 'member:';
const EMAIL_INDEX_PREFIX = 'email:';
const STRIPE_INDEX_PREFIX = 'stripe:';

/**
 * Initialize KV storage
 */
export function initKV(config: KVConfig): void {
  if (!config.namespace) {
    throw new Error('KV namespace is required');
  }
  kvNamespace = config.namespace;
}

/**
 * Get KV namespace
 */
function getKV(): KVNamespace {
  if (!kvNamespace) {
    throw new Error('KV not initialized. Call initKV() first.');
  }
  return kvNamespace;
}

/**
 * Generate a unique member ID
 */
export function generateMemberId(): string {
  return `mem_${crypto.randomUUID().replace(/-/g, '')}`;
}

/**
 * Create a new member
 */
export async function createMember(
  data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Member> {
  const kv = getKV();
  const id = generateMemberId();
  const now = new Date().toISOString();

  const member: Member = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // Store member record
  await kv.put(`${MEMBER_PREFIX}${id}`, JSON.stringify(member));

  // Store email index for lookup by email
  await kv.put(`${EMAIL_INDEX_PREFIX}${data.email.toLowerCase()}`, id);

  // Store Stripe subscription index for webhook handling
  await kv.put(`${STRIPE_INDEX_PREFIX}${data.stripeSubscriptionId}`, id);

  return member;
}

/**
 * Get member by ID
 */
export async function getMember(id: string): Promise<Member | null> {
  const kv = getKV();
  const data = await kv.get(`${MEMBER_PREFIX}${id}`);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as Member;
}

/**
 * Get member by email
 */
export async function getMemberByEmail(email: string): Promise<Member | null> {
  const kv = getKV();
  const memberId = await kv.get(`${EMAIL_INDEX_PREFIX}${email.toLowerCase()}`);

  if (!memberId) {
    return null;
  }

  return getMember(memberId);
}

/**
 * Get member by Stripe subscription ID
 */
export async function getMemberBySubscription(
  subscriptionId: string
): Promise<Member | null> {
  const kv = getKV();
  const memberId = await kv.get(`${STRIPE_INDEX_PREFIX}${subscriptionId}`);

  if (!memberId) {
    return null;
  }

  return getMember(memberId);
}

/**
 * Update a member
 */
export async function updateMember(
  id: string,
  updates: Partial<Omit<Member, 'id' | 'createdAt'>>
): Promise<Member | null> {
  const member = await getMember(id);

  if (!member) {
    return null;
  }

  const updatedMember: Member = {
    ...member,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const kv = getKV();
  await kv.put(`${MEMBER_PREFIX}${id}`, JSON.stringify(updatedMember));

  return updatedMember;
}

/**
 * Update member status
 */
export async function updateMemberStatus(
  id: string,
  status: Member['status'],
  expiresAt?: string
): Promise<Member | null> {
  return updateMember(id, { status, expiresAt });
}

/**
 * Delete a member
 */
export async function deleteMember(id: string): Promise<boolean> {
  const member = await getMember(id);

  if (!member) {
    return false;
  }

  const kv = getKV();

  // Delete all associated keys
  await Promise.all([
    kv.delete(`${MEMBER_PREFIX}${id}`),
    kv.delete(`${EMAIL_INDEX_PREFIX}${member.email.toLowerCase()}`),
    kv.delete(`${STRIPE_INDEX_PREFIX}${member.stripeSubscriptionId}`),
  ]);

  return true;
}

/**
 * List members with pagination
 * Note: KV list has performance considerations at scale (10K+ records)
 * Consider D1 migration for high-volume sites
 */
export async function listMembers(
  options: MemberListOptions = {}
): Promise<MemberListResult> {
  const kv = getKV();
  const { limit = 100, cursor, status } = options;

  const listResult = await kv.list({
    prefix: MEMBER_PREFIX,
    limit,
    cursor,
  });

  const members: Member[] = [];

  for (const key of listResult.keys) {
    const data = await kv.get(key.name);
    if (data) {
      const member = JSON.parse(data) as Member;
      if (!status || member.status === status) {
        members.push(member);
      }
    }
  }

  return {
    members,
    cursor: listResult.list_complete ? undefined : listResult.cursor,
    complete: listResult.list_complete,
  };
}

/**
 * Get member statistics
 * Note: This scans all members, use sparingly for large datasets
 */
export async function getMemberStats(): Promise<MemberStats> {
  const kv = getKV();
  let cursor: string | undefined;
  const stats: MemberStats = {
    total: 0,
    active: 0,
    pastDue: 0,
    canceled: 0,
  };

  do {
    const listResult = await kv.list({
      prefix: MEMBER_PREFIX,
      limit: 1000,
      cursor,
    });

    for (const key of listResult.keys) {
      const data = await kv.get(key.name);
      if (data) {
        const member = JSON.parse(data) as Member;
        stats.total++;
        switch (member.status) {
          case 'active':
            stats.active++;
            break;
          case 'past_due':
            stats.pastDue++;
            break;
          case 'canceled':
          case 'incomplete':
            stats.canceled++;
            break;
        }
      }
    }

    cursor = listResult.list_complete ? undefined : listResult.cursor;
  } while (cursor);

  return stats;
}

/**
 * Check if a member has active access
 */
export async function hasAccess(email: string): Promise<boolean> {
  const member = await getMemberByEmail(email);

  if (!member) {
    return false;
  }

  // Active or past_due both have access (grace period)
  if (member.status === 'active' || member.status === 'past_due') {
    // Check expiration if set
    if (member.expiresAt) {
      return new Date(member.expiresAt) > new Date();
    }
    return true;
  }

  return false;
}
