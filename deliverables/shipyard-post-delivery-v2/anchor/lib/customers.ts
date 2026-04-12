/**
 * Anchor — Customer Data CRUD Operations
 *
 * Per decisions.md:
 * - JSON storage until 100 customers
 * - Atomic write pattern for data safety
 *
 * Note: In production with Cloudflare Workers, this would use
 * KV storage or D1 database. This file provides the interface
 * and local file implementation for development.
 */

import type { Customer, CustomersData, PageSpeedResult } from "./types";
import {
  createEmptyCustomersData,
  calculateNextTouch,
  trimPagespeedHistory,
} from "../data/schema";

// In-memory cache for customers data
let customersCache: CustomersData | null = null;

/**
 * Load customers from storage
 *
 * In production: would load from KV or D1
 * For now: returns in-memory cache or empty structure
 */
export async function loadCustomers(): Promise<CustomersData> {
  if (customersCache) {
    return customersCache;
  }

  // Initialize with empty structure
  customersCache = createEmptyCustomersData();
  return customersCache;
}

/**
 * Save customers to storage
 *
 * Per decisions.md: Atomic write pattern
 * In production: would save to KV or D1
 * For now: updates in-memory cache
 *
 * @param data - The customers data to save
 */
export async function saveCustomers(data: CustomersData): Promise<void> {
  // Update timestamp
  data.lastUpdated = new Date().toISOString();

  // Atomic update: replace entire cache
  customersCache = { ...data };

  console.log(
    `[Customers] Saved ${data.customers.length} customers at ${data.lastUpdated}`
  );
}

/**
 * Add a new customer
 *
 * @param customer - The customer to add
 * @returns The added customer
 */
export async function addCustomer(customer: Customer): Promise<Customer> {
  const data = await loadCustomers();

  // Check for duplicate
  const existing = data.customers.find(
    (c) =>
      c.id === customer.id ||
      c.stripeCustomerId === customer.stripeCustomerId ||
      c.email === customer.email
  );

  if (existing) {
    throw new Error(
      `Customer already exists: ${customer.email} (${customer.id})`
    );
  }

  data.customers.push(customer);
  await saveCustomers(data);

  console.log(`[Customers] Added customer: ${customer.email} (${customer.id})`);
  return customer;
}

/**
 * Update an existing customer
 *
 * @param id - Customer ID
 * @param updates - Partial customer updates
 * @returns The updated customer
 */
export async function updateCustomer(
  id: string,
  updates: Partial<Customer>
): Promise<Customer> {
  const data = await loadCustomers();

  const index = data.customers.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Customer not found: ${id}`);
  }

  // Merge updates
  const customer = { ...data.customers[index], ...updates };

  // Recalculate next touch if emails changed
  if (updates.emailsSent) {
    customer.nextTouch = calculateNextTouch(
      customer.enrollmentDate,
      customer.emailsSent
    );
  }

  // Trim PageSpeed history if needed
  if (updates.pagespeedHistory) {
    customer.pagespeedHistory = trimPagespeedHistory(customer.pagespeedHistory);
  }

  data.customers[index] = customer;
  await saveCustomers(data);

  console.log(`[Customers] Updated customer: ${customer.email} (${id})`);
  return customer;
}

/**
 * Get a customer by ID
 *
 * @param id - Customer ID
 * @returns The customer or null if not found
 */
export async function getCustomer(id: string): Promise<Customer | null> {
  const data = await loadCustomers();
  return data.customers.find((c) => c.id === id) || null;
}

/**
 * Get a customer by Stripe customer ID
 *
 * @param stripeCustomerId - Stripe customer ID
 * @returns The customer or null if not found
 */
export async function getCustomerByStripeId(
  stripeCustomerId: string
): Promise<Customer | null> {
  const data = await loadCustomers();
  return data.customers.find((c) => c.stripeCustomerId === stripeCustomerId) || null;
}

/**
 * Get a customer by email
 *
 * @param email - Customer email
 * @returns The customer or null if not found
 */
export async function getCustomerByEmail(
  email: string
): Promise<Customer | null> {
  const data = await loadCustomers();
  return data.customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get all active customers
 *
 * @returns Array of active customers
 */
export async function getActiveCustomers(): Promise<Customer[]> {
  const data = await loadCustomers();
  return data.customers.filter((c) => c.status === "active" && !c.test);
}

/**
 * Get all customers (including test customers)
 *
 * @returns Array of all customers
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const data = await loadCustomers();
  return data.customers;
}

/**
 * Add PageSpeed result to customer history
 *
 * @param id - Customer ID
 * @param result - PageSpeed result to add
 */
export async function addPageSpeedResult(
  id: string,
  result: PageSpeedResult
): Promise<void> {
  const customer = await getCustomer(id);
  if (!customer) {
    throw new Error(`Customer not found: ${id}`);
  }

  const history = [...customer.pagespeedHistory, result];

  await updateCustomer(id, {
    pagespeedHistory: trimPagespeedHistory(history),
    lastPagespeedRun: new Date().toISOString(),
  });
}

/**
 * Mark email as sent for a customer
 *
 * @param id - Customer ID
 * @param emailType - Type of email sent
 */
export async function markEmailSent(
  id: string,
  emailType: keyof Customer["emailsSent"]
): Promise<void> {
  const customer = await getCustomer(id);
  if (!customer) {
    throw new Error(`Customer not found: ${id}`);
  }

  const emailsSent = { ...customer.emailsSent, [emailType]: true };

  await updateCustomer(id, {
    emailsSent,
    lastContact: new Date().toISOString().split("T")[0],
  });
}

/**
 * Update customer status
 *
 * @param id - Customer ID
 * @param status - New status
 */
export async function updateCustomerStatus(
  id: string,
  status: Customer["status"]
): Promise<void> {
  await updateCustomer(id, { status });
}

/**
 * Get customer count
 */
export async function getCustomerCount(): Promise<number> {
  const data = await loadCustomers();
  return data.customers.filter((c) => !c.test).length;
}

/**
 * Check if we're approaching the JSON storage limit
 * Per decisions.md: migrate to database at 100 customers
 */
export async function isApproachingStorageLimit(): Promise<boolean> {
  const count = await getCustomerCount();
  return count >= 80; // Warn at 80% of limit
}

/**
 * Initialize customers cache with provided data
 * Useful for testing and initial setup
 */
export function initializeCache(data: CustomersData): void {
  customersCache = data;
}

/**
 * Clear customers cache
 * Useful for testing
 */
export function clearCache(): void {
  customersCache = null;
}
