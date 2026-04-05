import type { PluginContext } from "emdash";

/**
 * Content Gating Engine — Utilities for checking member access to content
 *
 * Core concepts:
 * - GatingRule: defines what membership plans unlock a piece of content
 * - Drip content: time-released access based on member join date
 * - Access check is always fresh from KV (no caching)
 */

export interface GatingRule {
	type: "membership" | "drip";
	planIds: string[]; // ["basic", "pro", "enterprise"] — member must have one of these
	dripDays?: number; // For drip type: unlock after N days from join date
	previewText?: string; // UI hint: "Available to Pro members"
}

export interface AccessResult {
	hasAccess: boolean;
	reason?: string; // "No subscription", "Wrong plan", "Drip locked", etc.
	unlocksOn?: Date; // When drip content unlocks (if locked)
	requiredPlan?: string; // Which plan would unlock this
}

export interface DripStatus {
	isLocked: boolean;
	unlocksOn: Date;
	daysRemaining: number;
}

/**
 * Utility: Parse JSON safely
 */
function parseJSON<T>(json: string | undefined | null, fallback: T): T {
	if (!json) return fallback;
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
}

/**
 * Utility: Encode email for safe KV key usage
 */
function emailToKvKey(email: string): string {
	return encodeURIComponent(email.toLowerCase().trim());
}

/**
 * Utility: UTC midnight calculation
 * Returns midnight (00:00:00 UTC) of a given date
 */
function getUTCMidnight(date: Date): Date {
	const midnight = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
	// Convert to UTC time
	return new Date(midnight.getTime() - midnight.getTimezoneOffset() * 60000);
}

/**
 * Get drip unlock status for a member
 *
 * Input: member join date + drip days
 * Returns: { isLocked, unlocksOn, daysRemaining }
 * Uses UTC midnight for boundary calculations
 */
export function getDripStatus(memberJoinDate: Date, dripDays: number): DripStatus {
	const joinMidnight = getUTCMidnight(memberJoinDate);
	const unlocksAtMidnight = new Date(joinMidnight.getTime() + dripDays * 24 * 60 * 60 * 1000);

	const now = new Date();
	const nowMidnight = getUTCMidnight(now);

	const isLocked = nowMidnight < unlocksAtMidnight;
	const daysRemaining = isLocked ? Math.ceil((unlocksAtMidnight.getTime() - nowMidnight.getTime()) / (24 * 60 * 60 * 1000)) : 0;

	return {
		isLocked,
		unlocksOn: unlocksAtMidnight,
		daysRemaining,
	};
}

/**
 * Check if a member can access content based on a gating rule
 *
 * Input: member data, gating rule, join date
 * Returns: { hasAccess: boolean, reason?, unlocksOn? }
 *
 * Cases handled:
 * 1. Member has no subscription → hasAccess = false
 * 2. Member's plan not in rule.planIds → hasAccess = false
 * 3. Member has correct plan → hasAccess = true
 * 4. Drip content locked → hasAccess = false, unlocksOn = date
 * 5. Drip content unlocked → hasAccess = true
 */
export async function canAccessContent(
	memberId: string,
	memberEmail: string,
	gatingRule: GatingRule | undefined,
	ctx: PluginContext
): Promise<AccessResult> {
	// No rule = public content
	if (!gatingRule) {
		return { hasAccess: true };
	}

	try {
		// Load member record from KV
		const encodedEmail = emailToKvKey(memberEmail);
		const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
		const member = parseJSON<any>(memberJson, null);

		if (!member) {
			return {
				hasAccess: false,
				reason: "Member not found",
			};
		}

		// Check if subscription is active
		if (member.status !== "active" && member.status !== "trialing") {
			return {
				hasAccess: false,
				reason: "No active subscription",
				requiredPlan: gatingRule.planIds[0], // Suggest first plan
			};
		}

		// Check if member's plan is in the allowed list
		if (!gatingRule.planIds.includes(member.plan)) {
			return {
				hasAccess: false,
				reason: `Plan "${member.plan}" does not include this content`,
				requiredPlan: gatingRule.planIds[0],
			};
		}

		// If rule is membership-type, member has access
		if (gatingRule.type === "membership") {
			return { hasAccess: true };
		}

		// If rule is drip-type, check unlock date
		if (gatingRule.type === "drip" && gatingRule.dripDays !== undefined) {
			if (!member.joinDate) {
				// No join date stored — assume immediate access (legacy member)
				return { hasAccess: true };
			}

			const joinDate = new Date(member.joinDate);
			const dripStatus = getDripStatus(joinDate, gatingRule.dripDays);

			if (dripStatus.isLocked) {
				return {
					hasAccess: false,
					reason: `This content unlocks in ${dripStatus.daysRemaining} day(s)`,
					unlocksOn: dripStatus.unlocksOn,
				};
			}

			return { hasAccess: true };
		}

		// Default: no access
		return { hasAccess: false, reason: "Unknown gating rule" };
	} catch (error) {
		ctx.log.error(`canAccessContent error: ${String(error)}`);
		return {
			hasAccess: false,
			reason: "Error checking access",
		};
	}
}

/**
 * Check if a member can access a specific block
 *
 * If blockRule is undefined, content is public (return true)
 * Otherwise, delegate to canAccessContent()
 */
export async function canAccessBlock(
	memberId: string,
	memberEmail: string,
	blockRule: GatingRule | undefined,
	ctx: PluginContext
): Promise<AccessResult> {
	if (!blockRule) {
		return { hasAccess: true };
	}
	return canAccessContent(memberId, memberEmail, blockRule, ctx);
}

/**
 * Get list of all content IDs member can access
 *
 * This function:
 * 1. Loads member's subscription from KV
 * 2. Loads all gating rules from KV
 * 3. Evaluates each rule against member's plan + join date
 * 4. Returns array of accessible content IDs
 *
 * Caching: None — always fresh from KV
 */
export async function getMemberAccessList(
	memberEmail: string,
	ctx: PluginContext
): Promise<string[]> {
	try {
		// Load member
		const encodedEmail = emailToKvKey(memberEmail);
		const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
		const member = parseJSON<any>(memberJson, null);

		if (!member || member.status !== "active") {
			return [];
		}

		// Load all gating rules
		const rulesListJson = await ctx.kv.get<string>("gating-rules:list");
		const ruleIds = parseJSON<string[]>(rulesListJson, []);

		const accessibleIds: string[] = [];

		for (const ruleId of ruleIds) {
			const ruleJson = await ctx.kv.get<string>(`gating-rule:${ruleId}`);
			const rule = parseJSON<any>(ruleJson, null);

			if (!rule) continue;

			// Check if member's plan matches
			if (!rule.planIds || !Array.isArray(rule.planIds)) continue;
			if (!rule.planIds.includes(member.plan)) continue;

			// Check if drip is unlocked (if applicable)
			if (rule.type === "drip" && rule.dripDays !== undefined) {
				if (!member.joinDate) {
					// No join date — assume unlocked
					accessibleIds.push(rule.contentId);
					continue;
				}

				const joinDate = new Date(member.joinDate);
				const dripStatus = getDripStatus(joinDate, rule.dripDays);
				if (!dripStatus.isLocked) {
					accessibleIds.push(rule.contentId);
				}
			} else if (rule.type === "membership") {
				accessibleIds.push(rule.contentId);
			}
		}

		return accessibleIds;
	} catch (error) {
		ctx.log.error(`getMemberAccessList error: ${String(error)}`);
		return [];
	}
}
