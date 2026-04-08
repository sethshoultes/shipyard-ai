import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Sites table schema
 * Represents a Shipyard customer's website being monitored by Pulse
 *
 * Each site can have multiple subscriptions (tracked in subscriptions table).
 * The subscription_id field here is nullable and tracks the primary/active subscription.
 */
export const sitesTable = pgTable("sites", {
	id: serial("id").primaryKey(),
	url: varchar("url", { length: 255 }).notNull().unique(),
	name: varchar("name", { length: 255 }).notNull(),
	subscriptionId: integer("subscription_id"),
	tier: varchar("tier", { length: 50 }),
	status: varchar("status", { length: 50 }).default("active").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

/**
 * Type definitions
 */

/**
 * Site status enum
 */
export type SiteStatus = "active" | "paused" | "cancelled";

/**
 * Site tier enum
 */
export type SiteTier = "basic" | "pro" | "enterprise" | null;

/**
 * Full Site type (from database)
 */
export type Site = typeof sitesTable.$inferSelect;

/**
 * New Site type for inserts (omits id and timestamps)
 */
export type NewSite = Omit<Site, "id" | "createdAt" | "updatedAt">;
