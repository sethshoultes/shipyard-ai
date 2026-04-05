import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import { z } from "astro/zod";

interface Member {
	email: string;
	plan: string;
	status: "active" | "cancelled" | "expired";
	created: string;
	expires?: string;
}

interface MembershipPlan {
	name: string;
	price: number;
	interval: "monthly" | "yearly";
	features: string[];
}

const DEFAULT_PLANS: MembershipPlan[] = [
	{
		name: "Basic",
		price: 9.99,
		interval: "monthly",
		features: ["Access to all content", "Email support"],
	},
	{
		name: "Pro",
		price: 19.99,
		interval: "monthly",
		features: [
			"Access to all content",
			"Priority support",
			"Advanced features",
			"API access",
		],
	},
	{
		name: "Premium",
		price: 199.99,
		interval: "yearly",
		features: [
			"All Pro features",
			"Dedicated support",
			"Custom integrations",
			"Advanced analytics",
		],
	},
];

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: any, ctx: PluginContext) => {
				ctx.log.info("Membership plugin installed");
				await ctx.kv.set("settings:enabled", true);
				await ctx.kv.set("settings:plans", JSON.stringify(DEFAULT_PLANS));
			},
		},

		"content:beforeRender": {
			handler: async (event: any, ctx: PluginContext) => {
				const isGated = event.content?.gated === true;
				if (!isGated) return;

				const userId = event.userId;
				if (!userId) {
					throw new Response("Membership required", { status: 403 });
				}

				const member = await ctx.storage.members!.query({
					where: { email: userId },
					limit: 1,
				});

				if (!member.items.length) {
					throw new Response("Not a member", { status: 403 });
				}

				const memberData = member.items[0].data as Member;
				if (memberData.status !== "active") {
					throw new Response("Membership expired or cancelled", {
						status: 403,
					});
				}

				if (memberData.expires) {
					const expiryDate = new Date(memberData.expires);
					if (expiryDate < new Date()) {
						throw new Response("Membership expired", { status: 403 });
					}
				}
			},
		},
	},

	routes: {
		register: {
			public: true,
			input: z.object({
				email: z.string().email(),
				plan: z.string(),
			}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { email, plan } = routeCtx.input as {
					email: string;
					plan: string;
				};

				const existing = await ctx.storage.members!.query({
					where: { email },
					limit: 1,
				});

				if (existing.items.length) {
					throw new Response(
						JSON.stringify({ error: "Member already exists" }),
						{ status: 400, headers: { "Content-Type": "application/json" } }
					);
				}

				const plans = (
					JSON.parse(await ctx.kv.get<string>("settings:plans")) ||
						DEFAULT_PLANS
				) as MembershipPlan[];

				const selectedPlan = plans.find((p) => p.name === plan);
				if (!selectedPlan) {
					throw new Response(
						JSON.stringify({ error: "Invalid plan" }),
						{ status: 400, headers: { "Content-Type": "application/json" } }
					);
				}

				const memberId = `member_${Date.now()}_${Math.random().toString(36).slice(2)}`;
				const created = new Date().toISOString();
				let expires: string | undefined;

				if (selectedPlan.interval === "monthly") {
					const expiry = new Date();
					expiry.setMonth(expiry.getMonth() + 1);
					expires = expiry.toISOString();
				} else if (selectedPlan.interval === "yearly") {
					const expiry = new Date();
					expiry.setFullYear(expiry.getFullYear() + 1);
					expires = expiry.toISOString();
				}

				const member: Member = {
					email,
					plan: selectedPlan.name,
					status: "active",
					created,
					expires,
				};

				await ctx.storage.members!.put(memberId, member);

				return {
					success: true,
					memberId,
					member,
				};
			},
		},

		check: {
			input: z.object({
				email: z.string().email().optional(),
			}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { email } = routeCtx.input as { email?: string };

				if (!email) {
					return { hasAccess: false, reason: "No email provided" };
				}

				const result = await ctx.storage.members!.query({
					where: { email },
					limit: 1,
				});

				if (!result.items.length) {
					return { hasAccess: false, reason: "Not a member" };
				}

				const member = result.items[0].data as Member;

				if (member.status !== "active") {
					return { hasAccess: false, reason: "Membership cancelled" };
				}

				if (member.expires) {
					const expiryDate = new Date(member.expires);
					if (expiryDate < new Date()) {
						return { hasAccess: false, reason: "Membership expired" };
					}
				}

				return {
					hasAccess: true,
					member: {
						email: member.email,
						plan: member.plan,
						expires: member.expires,
					},
				};
			},
		},

		plans: {
			public: true,
			handler: async (_routeCtx: any, ctx: PluginContext) => {
				const plansJson =
					(await ctx.kv.get<string>("settings:plans")) ||
					JSON.stringify(DEFAULT_PLANS);

				return {
					plans: JSON.parse(plansJson) as MembershipPlan[],
				};
			},
		},

		cancel: {
			input: z.object({
				email: z.string().email(),
			}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { email } = routeCtx.input as { email: string };

				const result = await ctx.storage.members!.query({
					where: { email },
					limit: 1,
				});

				if (!result.items.length) {
					throw new Response(
						JSON.stringify({ error: "Member not found" }),
						{ status: 404, headers: { "Content-Type": "application/json" } }
					);
				}

				const memberId = result.items[0].id;
				const member = result.items[0].data as Member;

				const updated: Member = {
					...member,
					status: "cancelled",
				};

				await ctx.storage.members!.put(memberId, updated);

				return {
					success: true,
					message: "Membership cancelled",
				};
			},
		},

		admin: {
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const interaction = routeCtx.input as {
					type: string;
					page?: string;
				};

				if (interaction.type === "page_load" && interaction.page === "/members") {
					const result = await ctx.storage.members!.query({
						orderBy: { created: "desc" as any },
						limit: 50,
					});

					const members = result.items.map((item) => ({
						id: item.id,
						...(item.data as Member),
					}));

					return {
						blocks: [
							{ type: "header", text: "Members" },
							{
								type: "table",
								blockId: "members-table",
								columns: [
									{ key: "email", label: "Email", format: "text" },
									{ key: "plan", label: "Plan", format: "text" },
									{ key: "status", label: "Status", format: "badge" },
									{
										key: "expires",
										label: "Expires",
										format: "relative_time",
									},
								],
								rows: members,
							},
						],
					};
				}

				if (interaction.type === "widget_load" && "widget_id" in interaction) {
					const count = await ctx.storage.members!.count({
						status: "active",
					});

					return {
						blocks: [
							{
								type: "stats",
								stats: [{ label: "Active Members", value: count.toString() }],
							},
						],
					};
				}

				return { blocks: [] };
			},
		},
	},
});
