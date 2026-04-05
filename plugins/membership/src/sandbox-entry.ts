import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";

/**
 * Type definitions
 */

interface MemberRecord {
	email: string;
	plan: string;
	status: "pending" | "active" | "revoked";
	paymentLink?: string;
	createdAt: string;
	expiresAt?: string;
	approvedAt?: string;
}

interface PlanConfig {
	id: string;
	name: string;
	price: number;
	interval: "once" | "month" | "year";
	description: string;
	paymentLink?: string;
	features: string[];
}

interface AdminInteraction {
	type: string;
	page?: string;
	widgetId?: string;
	action?: string;
	email?: string;
	plan?: PlanConfig;
	planId?: string;
}

/**
 * Utility: Validate email format
 */
function isValidEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

/**
 * Utility: Generate unique IDs
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
 * Utility: Get default plans
 */
const DEFAULT_PLANS: PlanConfig[] = [
	{
		id: "free",
		name: "Free",
		price: 0,
		interval: "once",
		description: "Basic access",
		features: ["Limited content access", "Community support"],
	},
	{
		id: "pro",
		name: "Pro",
		price: 99,
		interval: "month",
		description: "Full access with email support",
		features: ["All content", "Priority email support", "Monthly newsletter"],
	},
	{
		id: "premium",
		name: "Premium",
		price: 999,
		interval: "year",
		description: "VIP access and priority support",
		features: [
			"All content",
			"Priority support",
			"Early access to new content",
			"Annual digest report",
		],
	},
];

export default definePlugin({
	/**
	 * Hook: Initialize plugin on install
	 */
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				ctx.log.info("Membership plugin installed");
				// Initialize with default plans
				await ctx.kv.set("plans", JSON.stringify(DEFAULT_PLANS));
				await ctx.kv.set("settings:requirePaymentApproval", "true");
			},
		},
	},

	/**
	 * API Routes
	 */
	routes: {
		/**
		 * POST /membership/register
		 * Register a new member or retrieve existing membership.
		 *
		 * Expects: { email: string, plan: string }
		 * Returns: { memberId: string, status: "pending"|"active", paymentLink?: string }
		 */
		register: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();
					const planId = String(input.plan ?? "").trim();

					// Validate input
					if (!email) {
						throw new Response(
							JSON.stringify({ error: "Email is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email format" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!planId) {
						throw new Response(
							JSON.stringify({ error: "Plan is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get plans
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);

					const selectedPlan = plans.find(
						(p: PlanConfig) => p.id === planId
					);
					if (!selectedPlan) {
						throw new Response(
							JSON.stringify({ error: "Plan not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check existing member
					const existingKey = await ctx.kv.get<string>(`member:${email}`);
					if (existingKey) {
						const existingMember = parseJSON<MemberRecord>(
							existingKey,
							null
						);
						if (existingMember) {
							return {
								memberId: email,
								status: existingMember.status,
								plan: existingMember.plan,
								paymentLink:
									selectedPlan.price > 0 ? selectedPlan.paymentLink : undefined,
							};
						}
					}

					// Create new member
					const now = new Date().toISOString();
					let status: "pending" | "active" = "pending";

					// Free plans are immediately active
					if (selectedPlan.price === 0) {
						status = "active";
					} else if (
						!selectedPlan.paymentLink ||
						selectedPlan.paymentLink.trim() === ""
					) {
						// Paid plans without payment link are pending
						status = "pending";
					}

					const member: MemberRecord = {
						email,
						plan: selectedPlan.id,
						status,
						paymentLink: selectedPlan.paymentLink || undefined,
						createdAt: now,
					};

					// For paid plans, set expiry
					if (selectedPlan.price > 0) {
						const expiry = new Date();
						if (selectedPlan.interval === "month") {
							expiry.setMonth(expiry.getMonth() + 1);
						} else if (selectedPlan.interval === "year") {
							expiry.setFullYear(expiry.getFullYear() + 1);
						}
						member.expiresAt = expiry.toISOString();
					}

					await ctx.kv.set(`member:${email}`, JSON.stringify(member));

					// Add to members list for admin
					const listKey = `members:list`;
					const listJson = await ctx.kv.get<string>(listKey);
					const membersList = parseJSON<string[]>(listJson, []);
					if (!membersList.includes(email)) {
						membersList.push(email);
						await ctx.kv.set(listKey, JSON.stringify(membersList));
					}

					ctx.log.info(`Member registered: ${email} for plan ${planId}`);

					return {
						memberId: email,
						status,
						plan: selectedPlan.id,
						paymentLink:
							selectedPlan.price > 0 ? selectedPlan.paymentLink : undefined,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Register error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/status?email=user@example.com
		 * Check membership status for an email.
		 *
		 * Returns: { email: string, active: boolean, plan?: string, expiresAt?: string }
		 */
		status: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email) {
						return {
							active: false,
							reason: "Email required",
						};
					}

					if (!isValidEmail(email)) {
						return {
							active: false,
							reason: "Invalid email format",
						};
					}

					const memberJson = await ctx.kv.get<string>(`member:${email}`);
					if (!memberJson) {
						return {
							email,
							active: false,
						};
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						return {
							email,
							active: false,
						};
					}

					// Check if active
					let isActive = member.status === "active";

					// Check expiry
					if (
						isActive &&
						member.expiresAt &&
						new Date(member.expiresAt) < new Date()
					) {
						isActive = false;
					}

					return {
						email,
						active: isActive,
						plan: member.plan,
						status: member.status,
						expiresAt: member.expiresAt,
					};
				} catch (error) {
					ctx.log.error(`Status check error: ${String(error)}`);
					return {
						active: false,
						error: "Status check failed",
					};
				}
			},
		},

		/**
		 * GET /membership/plans
		 * Get available plans.
		 *
		 * Returns: { plans: PlanConfig[] }
		 */
		plans: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);
					return { plans };
				} catch (error) {
					ctx.log.error(`Plans fetch error: ${String(error)}`);
					return { plans: DEFAULT_PLANS };
				}
			},
		},

		/**
		 * POST /membership/approve
		 * Manually approve a pending member (admin only).
		 *
		 * Expects: { email: string }
		 * Returns: { success: boolean }
		 */
		approve: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const memberJson = await ctx.kv.get<string>(`member:${email}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					member.status = "active";
					member.approvedAt = new Date().toISOString();

					await ctx.kv.set(`member:${email}`, JSON.stringify(member));
					ctx.log.info(`Member approved: ${email}`);

					return { success: true };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Approve error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/revoke
		 * Revoke a member's access (admin only).
		 *
		 * Expects: { email: string }
		 * Returns: { success: boolean }
		 */
		revoke: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const memberJson = await ctx.kv.get<string>(`member:${email}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					member.status = "revoked";

					await ctx.kv.set(`member:${email}`, JSON.stringify(member));
					ctx.log.info(`Member revoked: ${email}`);

					return { success: true };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Revoke error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * Block Kit admin handler for pages and widgets
		 */
		admin: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const interaction = rc.input as AdminInteraction;

					// Members page
					if (interaction.type === "page_load" && interaction.page === "/members") {
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);

						const members = [];
						for (const email of memberEmails) {
							const memberJson = await ctx.kv.get<string>(`member:${email}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null);
								if (member) {
									members.push({
										email: member.email,
										plan: member.plan,
										status: member.status,
										createdAt: member.createdAt,
										expiresAt: member.expiresAt || "",
									});
								}
							}
						}

						// Sort by created date descending
						members.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime()
						);

						return {
							blocks: [
								{
									type: "header",
									text: "Members",
								},
								{
									type: "stats",
									stats: [
										{
											label: "Total Members",
											value: members.length.toString(),
										},
										{
											label: "Active",
											value: members
												.filter((m) => m.status === "active")
												.length.toString(),
										},
										{
											label: "Pending",
											value: members
												.filter((m) => m.status === "pending")
												.length.toString(),
										},
									],
								},
								{
									type: "table",
									blockId: "members-table",
									columns: [
										{ key: "email", label: "Email", format: "text" as const },
										{ key: "plan", label: "Plan", format: "text" as const },
										{ key: "status", label: "Status", format: "badge" as const },
										{
											key: "expiresAt",
											label: "Expires",
											format: "relative_time" as const,
										},
									],
									rows: members,
								},
								{
									type: "section",
									text: "Admin Actions",
								},
								{
									type: "form",
									blockId: "member-actions",
									fields: [
										{
											type: "text_input",
											action_id: "email",
											label: "Member Email",
											placeholder: "user@example.com",
										},
										{
											type: "select",
											action_id: "action",
											label: "Action",
											options: [
												{ label: "Approve", value: "approve" },
												{ label: "Revoke", value: "revoke" },
											],
										},
									],
									submit: { label: "Execute", action_id: "execute_action" },
								},
							],
						};
					}

					// Process member actions
					if (interaction.type === "form_submit" && interaction.action === "execute_action") {
						const email = String(interaction.email ?? "").trim().toLowerCase();
						const action = String(interaction.action ?? "");

						if (!email || !isValidEmail(email)) {
							return {
								blocks: [],
								toast: {
									message: "Invalid email address",
									type: "error" as const,
								},
							};
						}

						try {
							if (action === "approve") {
								await ctx.kv.set(
									`member:${email}`,
									JSON.stringify({
										...(parseJSON<MemberRecord>(
											await ctx.kv.get<string>(`member:${email}`),
											null
										) || { email, plan: "", createdAt: new Date().toISOString() }),
										status: "active",
										approvedAt: new Date().toISOString(),
									})
								);
								return {
									blocks: [],
									toast: { message: `Approved ${email}`, type: "success" as const },
								};
							} else if (action === "revoke") {
								await ctx.kv.set(
									`member:${email}`,
									JSON.stringify({
										...(parseJSON<MemberRecord>(
											await ctx.kv.get<string>(`member:${email}`),
											null
										) || { email, plan: "", createdAt: new Date().toISOString() }),
										status: "revoked",
									})
								);
								return {
									blocks: [],
									toast: { message: `Revoked ${email}`, type: "success" as const },
								};
							}
						} catch (error) {
							ctx.log.error(`Member action error: ${String(error)}`);
							return {
								blocks: [],
								toast: {
									message: "Action failed",
									type: "error" as const,
								},
							};
						}
					}

					// Plans page
					if (interaction.type === "page_load" && interaction.page === "/plans") {
						const plansJson = await ctx.kv.get<string>("plans");
						const plans = parseJSON(plansJson, DEFAULT_PLANS);

						return {
							blocks: [
								{
									type: "header",
									text: "Membership Plans",
								},
								{
									type: "section",
									text: "Configure your membership plans and payment links",
								},
								{
									type: "table",
									blockId: "plans-table",
									columns: [
										{ key: "name", label: "Name", format: "text" as const },
										{ key: "price", label: "Price", format: "text" as const },
										{
											key: "interval",
											label: "Interval",
											format: "text" as const,
										},
										{
											key: "paymentLink",
											label: "Payment Link",
											format: "text" as const,
										},
									],
									rows: plans.map((p: PlanConfig) => ({
										name: p.name,
										price: `$${p.price}`,
										interval: p.interval,
										paymentLink: p.paymentLink || "(not set)",
									})),
								},
								{
									type: "context",
									text: "Payment links must be created in Stripe and pasted here. Visit dashboard.stripe.com to create Payment Links.",
								},
							],
						};
					}

					// Widget: active members count
					if (interaction.type === "widget_load" && interaction.widgetId === "active-members") {
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);

						let activeCount = 0;
						for (const email of memberEmails) {
							const memberJson = await ctx.kv.get<string>(`member:${email}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null);
								if (
									member &&
									member.status === "active" &&
									(!member.expiresAt || new Date(member.expiresAt) > new Date())
								) {
									activeCount++;
								}
							}
						}

						return {
							blocks: [
								{
									type: "stats",
									stats: [
										{
											label: "Active Members",
											value: activeCount.toString(),
										},
									],
								},
							],
						};
					}

					// Widget: total revenue (MRR)
					if (interaction.type === "widget_load" && interaction.widgetId === "total-revenue") {
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);
						const plansJson = await ctx.kv.get<string>("plans");
						const plans = parseJSON(plansJson, DEFAULT_PLANS);

						let mrr = 0;
						for (const email of memberEmails) {
							const memberJson = await ctx.kv.get<string>(`member:${email}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null);
								if (
									member &&
									member.status === "active" &&
									(!member.expiresAt || new Date(member.expiresAt) > new Date())
								) {
									const plan = plans.find((p: PlanConfig) => p.id === member.plan);
									if (plan && plan.interval === "month") {
										mrr += plan.price;
									}
								}
							}
						}

						return {
							blocks: [
								{
									type: "stats",
									stats: [
										{
											label: "Monthly Revenue",
											value: `$${(mrr / 100).toFixed(2)}`,
										},
									],
								},
							],
						};
					}

					return { blocks: [] };
				} catch (error) {
					ctx.log.error(`Admin handler error: ${String(error)}`);
					return {
						blocks: [
							{
								type: "banner",
								title: "Error",
								description: "Failed to load admin page",
								variant: "error" as const,
							},
						],
					};
				}
			},
		},
	},

	/**
	 * Portable Text block types
	 */
	admin: {
		portableTextBlocks: [
			{
				type: "gated-content",
				label: "Gated Content",
				description: "Content visible only to active members",
				icon: "link",
				fields: [
					{
						type: "text_input",
						action_id: "requiredPlan",
						label: "Required Plan ID (optional)",
						placeholder: "Leave empty for any member",
					},
					{
						type: "text_input",
						action_id: "fallbackMessage",
						label: "Message for Non-Members",
						placeholder: "Please subscribe to view this content",
					},
				],
			},
		],
	},
});
