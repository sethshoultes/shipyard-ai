/**
 * Forge - D1 Database Query Layer
 *
 * Per Decision 2: "D1 (SQLite) for all persistent data — not KV"
 * Type-safe query functions for forms and submissions.
 */

import type { FormDefinition, FormSubmission } from "../types";

/**
 * D1 Database interface (subset of Cloudflare D1)
 */
interface D1Database {
	prepare(query: string): D1PreparedStatement;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = unknown>(): Promise<T | null>;
	all<T = unknown>(): Promise<D1Result<T>>;
	run(): Promise<D1Result>;
}

interface D1Result<T = unknown> {
	results?: T[];
	success: boolean;
	meta?: Record<string, unknown>;
}

// ============================================================================
// Form Queries
// ============================================================================

/**
 * Get a form by ID
 */
export async function getForm(db: D1Database, id: string): Promise<FormDefinition | null> {
	const row = await db
		.prepare("SELECT * FROM forge_forms WHERE id = ?")
		.bind(id)
		.first<FormRow>();

	if (!row) return null;
	return rowToForm(row);
}

/**
 * List all forms, ordered by creation date descending
 */
export async function listForms(db: D1Database): Promise<FormDefinition[]> {
	const result = await db
		.prepare("SELECT * FROM forge_forms ORDER BY created_at DESC")
		.all<FormRow>();

	return (result.results || []).map(rowToForm);
}

/**
 * Save a form (insert or update)
 */
export async function saveForm(db: D1Database, form: FormDefinition): Promise<void> {
	const existing = await getForm(db, form.id);

	if (existing) {
		await db
			.prepare(`
				UPDATE forge_forms
				SET name = ?, description = ?, fields = ?, notify_emails = ?,
				    primary_color = ?, logo_url = ?, updated_at = ?
				WHERE id = ?
			`)
			.bind(
				form.name,
				form.description || null,
				JSON.stringify(form.fields),
				form.notifyEmails ? JSON.stringify(form.notifyEmails) : null,
				form.primaryColor || "#C4704B",
				form.logoUrl || null,
				form.updatedAt,
				form.id
			)
			.run();
	} else {
		await db
			.prepare(`
				INSERT INTO forge_forms (id, name, description, fields, notify_emails, primary_color, logo_url, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				form.id,
				form.name,
				form.description || null,
				JSON.stringify(form.fields),
				form.notifyEmails ? JSON.stringify(form.notifyEmails) : null,
				form.primaryColor || "#C4704B",
				form.logoUrl || null,
				form.createdAt,
				form.updatedAt
			)
			.run();
	}
}

/**
 * Delete a form (submissions cascade via foreign key)
 */
export async function deleteForm(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM forge_forms WHERE id = ?").bind(id).run();
}

// ============================================================================
// Submission Queries
// ============================================================================

/**
 * Get submissions for a form with pagination
 */
export async function getSubmissions(
	db: D1Database,
	formId: string,
	limit: number = 20,
	offset: number = 0
): Promise<FormSubmission[]> {
	const result = await db
		.prepare(`
			SELECT * FROM forge_submissions
			WHERE form_id = ?
			ORDER BY submitted_at DESC
			LIMIT ? OFFSET ?
		`)
		.bind(formId, limit, offset)
		.all<SubmissionRow>();

	return (result.results || []).map(rowToSubmission);
}

/**
 * Get a single submission by ID
 */
export async function getSubmission(
	db: D1Database,
	formId: string,
	submissionId: string
): Promise<FormSubmission | null> {
	const row = await db
		.prepare("SELECT * FROM forge_submissions WHERE id = ? AND form_id = ?")
		.bind(submissionId, formId)
		.first<SubmissionRow>();

	if (!row) return null;
	return rowToSubmission(row);
}

/**
 * Save a submission
 */
export async function saveSubmission(db: D1Database, submission: FormSubmission): Promise<void> {
	await db
		.prepare(`
			INSERT INTO forge_submissions (id, form_id, data, submitted_at, ip)
			VALUES (?, ?, ?, ?, ?)
		`)
		.bind(
			submission.id,
			submission.formId,
			JSON.stringify(submission.data),
			submission.submittedAt,
			submission.ip || null
		)
		.run();
}

/**
 * Delete a submission
 */
export async function deleteSubmission(db: D1Database, formId: string, submissionId: string): Promise<void> {
	await db
		.prepare("DELETE FROM forge_submissions WHERE id = ? AND form_id = ?")
		.bind(submissionId, formId)
		.run();
}

/**
 * Get submission count for a form
 */
export async function getSubmissionCount(db: D1Database, formId: string): Promise<number> {
	const row = await db
		.prepare("SELECT COUNT(*) as count FROM forge_submissions WHERE form_id = ?")
		.bind(formId)
		.first<{ count: number }>();

	return row?.count || 0;
}

/**
 * Get all submissions for CSV export (no pagination)
 */
export async function getAllSubmissions(db: D1Database, formId: string): Promise<FormSubmission[]> {
	const result = await db
		.prepare(`
			SELECT * FROM forge_submissions
			WHERE form_id = ?
			ORDER BY submitted_at DESC
		`)
		.bind(formId)
		.all<SubmissionRow>();

	return (result.results || []).map(rowToSubmission);
}

// ============================================================================
// Row Converters
// ============================================================================

interface FormRow {
	id: string;
	name: string;
	description: string | null;
	fields: string;
	notify_emails: string | null;
	primary_color: string | null;
	logo_url: string | null;
	created_at: string;
	updated_at: string;
}

interface SubmissionRow {
	id: string;
	form_id: string;
	data: string;
	submitted_at: string;
	ip: string | null;
}

function rowToForm(row: FormRow): FormDefinition {
	return {
		id: row.id,
		name: row.name,
		description: row.description || undefined,
		fields: JSON.parse(row.fields),
		notifyEmails: row.notify_emails ? JSON.parse(row.notify_emails) : undefined,
		primaryColor: row.primary_color || "#C4704B",
		logoUrl: row.logo_url || undefined,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function rowToSubmission(row: SubmissionRow): FormSubmission {
	return {
		id: row.id,
		formId: row.form_id,
		data: JSON.parse(row.data),
		submittedAt: row.submitted_at,
		ip: row.ip || undefined,
	};
}
