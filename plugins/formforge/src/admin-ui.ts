/**
 * FormForge Admin UI
 *
 * Renders admin HTML for the form management interface.
 * Imported by sandbox-entry.ts — all functions return HTML strings.
 *
 * Design system: Matches ReviewPulse/MemberShip/EventDash admin patterns.
 * - Terracotta (#C4704B) primary, Sage (#7A8B6F) labels, Gold (#D4A853) accents
 * - Lora (headings), Source Sans 3 (body)
 * - BEM-style: .formforge__element--modifier
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormSummary {
	id: string;
	name: string;
	description?: string;
	fieldCount: number;
	submissionCount: number;
	lastSubmissionAt?: string;
	createdAt: string;
}

export interface SubmissionSummary {
	id: string;
	data: Record<string, string>;
	submittedAt: string;
}

export interface PaginationInfo {
	total: number;
	limit: number;
	offset: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function formatDate(iso: string): string {
	try {
		const d = new Date(iso);
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return iso;
	}
}

function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	return text.slice(0, max).trimEnd() + "\u2026";
}

// ---------------------------------------------------------------------------
// Shared Styles
// ---------------------------------------------------------------------------

export function renderAdminStyles(): string {
	return `<style>
	/* FormForge Admin — Base */
	.formforge {
		font-family: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		color: #2c2c2c;
		line-height: 1.6;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Header */
	.formforge__header {
		margin-bottom: 2rem;
		border-bottom: 2px solid #d4a853;
		padding-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.formforge__title {
		font-family: Lora, serif;
		font-size: 2rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: #2c2c2c;
	}

	.formforge__subtitle {
		margin: 0;
		color: #666;
		font-size: 0.95rem;
	}

	/* Buttons */
	.formforge__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border: 1px solid #c4704b;
		border-radius: 4px;
		background: #c4704b;
		color: white;
		font-size: 0.85rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
	}

	.formforge__btn:hover {
		background: #a85d3e;
		border-color: #a85d3e;
	}

	.formforge__btn--secondary {
		background: white;
		color: #c4704b;
	}

	.formforge__btn--secondary:hover {
		background: #faf8f5;
	}

	.formforge__btn--small {
		padding: 0.3rem 0.6rem;
		font-size: 0.75rem;
	}

	.formforge__btn--danger {
		background: #c62828;
		border-color: #c62828;
		color: white;
	}

	.formforge__btn--danger:hover {
		background: #a31f1f;
		border-color: #a31f1f;
	}

	.formforge__header-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Table */
	.formforge__table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1.5rem;
	}

	.formforge__table th {
		text-align: left;
		padding: 0.75rem 1rem;
		background: #faf8f5;
		border-bottom: 2px solid #e5e5e5;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #7a8b6f;
	}

	.formforge__table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e5e5;
		font-size: 0.9rem;
		vertical-align: middle;
	}

	.formforge__table tr:hover td {
		background: rgba(196, 112, 75, 0.04);
	}

	.formforge__table-actions {
		display: flex;
		gap: 0.4rem;
	}

	/* Empty state */
	.formforge__empty {
		text-align: center;
		color: #999;
		font-style: italic;
		padding: 3rem 1rem;
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
	}

	/* Pagination */
	.formforge__pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.formforge__pagination-info {
		font-size: 0.85rem;
		color: #666;
	}

	.formforge__pagination-controls {
		display: flex;
		gap: 0.5rem;
	}

	.formforge__page-btn {
		padding: 0.4rem 0.8rem;
		border: 1px solid #d4c4b5;
		border-radius: 4px;
		background: white;
		font-size: 0.85rem;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s;
		color: #2c2c2c;
	}

	.formforge__page-btn:hover:not(:disabled) {
		background: #c4704b;
		color: white;
		border-color: #c4704b;
	}

	.formforge__page-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.formforge__page-btn--current {
		background: #c4704b;
		color: white;
		border-color: #c4704b;
	}

	/* Widget card */
	.formforge__widget {
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.25rem;
	}

	.formforge__widget-title {
		font-family: Lora, serif;
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #2c2c2c;
	}

	.formforge__widget-label {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #7a8b6f;
		margin: 0 0 0.5rem 0;
	}

	/* Bar chart */
	.formforge__bar-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.formforge__bar-label {
		flex: 0 0 120px;
		font-size: 0.85rem;
		color: #2c2c2c;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.formforge__bar-track {
		flex: 1;
		height: 20px;
		background: #e5e5e5;
		border-radius: 4px;
		overflow: hidden;
	}

	.formforge__bar-fill {
		height: 100%;
		background: #c4704b;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.formforge__bar-count {
		flex: 0 0 40px;
		text-align: right;
		font-size: 0.85rem;
		font-weight: 600;
		color: #2c2c2c;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.formforge {
			padding: 1rem;
		}

		.formforge__title {
			font-size: 1.5rem;
		}

		.formforge__header {
			flex-direction: column;
			align-items: flex-start;
		}

		.formforge__table {
			display: block;
			overflow-x: auto;
		}

		.formforge__pagination {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.formforge__pagination-controls {
			justify-content: center;
		}
	}
</style>`;
}

// ---------------------------------------------------------------------------
// Form List Page (/forms admin page)
// ---------------------------------------------------------------------------

export function renderFormListPage(forms: FormSummary[]): string {
	let tableHtml: string;

	if (forms.length === 0) {
		tableHtml = `<div class="formforge__empty">No forms yet. Create your first form to get started.</div>`;
	} else {
		const rows = forms
			.map(
				(f) => `<tr>
			<td><strong>${escapeHtml(f.name)}</strong></td>
			<td>${f.fieldCount}</td>
			<td>${f.submissionCount}</td>
			<td>${f.lastSubmissionAt ? formatDate(f.lastSubmissionAt) : "\u2014"}</td>
			<td>${formatDate(f.createdAt)}</td>
			<td>
				<div class="formforge__table-actions">
					<button class="formforge__btn formforge__btn--small formforge__btn--secondary" data-action="edit" data-id="${escapeHtml(f.id)}" aria-label="Edit ${escapeHtml(f.name)}">Edit</button>
					<button class="formforge__btn formforge__btn--small formforge__btn--secondary" data-action="submissions" data-id="${escapeHtml(f.id)}" aria-label="View submissions for ${escapeHtml(f.name)}">Submissions</button>
					<button class="formforge__btn formforge__btn--small formforge__btn--danger" data-action="delete" data-id="${escapeHtml(f.id)}" aria-label="Delete ${escapeHtml(f.name)}">Delete</button>
				</div>
			</td>
		</tr>`,
			)
			.join("");

		tableHtml = `<table class="formforge__table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Fields</th>
				<th>Submissions</th>
				<th>Last Submission</th>
				<th>Created</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>${rows}</tbody>
	</table>`;
	}

	return `<div class="formforge">
	${renderAdminStyles()}
	<div class="formforge__header">
		<div>
			<h1 class="formforge__title">Forms</h1>
			<p class="formforge__subtitle">${forms.length} form${forms.length !== 1 ? "s" : ""}</p>
		</div>
		<div class="formforge__header-actions">
			<button class="formforge__btn" data-action="create-form">Create Form</button>
			<button class="formforge__btn formforge__btn--secondary" data-action="create-from-template">Create from Template</button>
		</div>
	</div>
	${tableHtml}
</div>`;
}

// ---------------------------------------------------------------------------
// Submission List Page (/submissions admin page)
// ---------------------------------------------------------------------------

export function renderSubmissionListPage(
	form: { id: string; name: string; fields: Array<{ id: string; label: string }> },
	submissions: SubmissionSummary[],
	pagination: PaginationInfo,
): string {
	const totalPages = Math.ceil(pagination.total / pagination.limit);
	const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

	// Pick up to 3 field labels for preview columns
	const previewFields = form.fields.slice(0, 3);

	let tableHtml: string;

	if (submissions.length === 0) {
		tableHtml = `<div class="formforge__empty">No submissions yet for this form.</div>`;
	} else {
		const headerCols = previewFields
			.map((f) => `<th>${escapeHtml(f.label)}</th>`)
			.join("");

		const rows = submissions
			.map((sub) => {
				const previewCols = previewFields
					.map((f) => {
						const val = sub.data[f.id] || "";
						return `<td>${escapeHtml(truncate(val, 60))}</td>`;
					})
					.join("");

				return `<tr>
				<td>${formatDate(sub.submittedAt)}</td>
				${previewCols}
				<td>
					<div class="formforge__table-actions">
						<button class="formforge__btn formforge__btn--small formforge__btn--secondary" data-action="view" data-id="${escapeHtml(sub.id)}" aria-label="View submission">View</button>
						<button class="formforge__btn formforge__btn--small formforge__btn--danger" data-action="delete-submission" data-id="${escapeHtml(sub.id)}" aria-label="Delete submission">Delete</button>
					</div>
				</td>
			</tr>`;
			})
			.join("");

		tableHtml = `<table class="formforge__table">
		<thead>
			<tr>
				<th>Date</th>
				${headerCols}
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>${rows}</tbody>
	</table>`;
	}

	// Pagination
	let paginationHtml = "";
	if (totalPages > 1) {
		const start = pagination.offset + 1;
		const end = Math.min(pagination.offset + pagination.limit, pagination.total);
		const maxButtons = Math.min(totalPages, 5);
		let startPage = Math.max(1, currentPage - 2);
		if (startPage + maxButtons - 1 > totalPages) {
			startPage = Math.max(1, totalPages - maxButtons + 1);
		}

		let buttons = `<button class="formforge__page-btn" data-page="${currentPage - 1}"${currentPage <= 1 ? " disabled" : ""} aria-label="Previous page">Prev</button>`;
		for (let i = startPage; i < startPage + maxButtons; i++) {
			buttons += `<button class="formforge__page-btn${i === currentPage ? " formforge__page-btn--current" : ""}" data-page="${i}" aria-label="Page ${i}"${i === currentPage ? ' aria-current="page"' : ""}>${i}</button>`;
		}
		buttons += `<button class="formforge__page-btn" data-page="${currentPage + 1}"${currentPage >= totalPages ? " disabled" : ""} aria-label="Next page">Next</button>`;

		paginationHtml = `
	<div class="formforge__pagination">
		<span class="formforge__pagination-info">Showing ${start}\u2013${end} of ${pagination.total}</span>
		<div class="formforge__pagination-controls">${buttons}</div>
	</div>`;
	}

	return `<div class="formforge">
	${renderAdminStyles()}
	<div class="formforge__header">
		<div>
			<h1 class="formforge__title">${escapeHtml(form.name)}</h1>
			<p class="formforge__subtitle">${pagination.total} submission${pagination.total !== 1 ? "s" : ""}</p>
		</div>
		<div class="formforge__header-actions">
			<button class="formforge__btn formforge__btn--secondary" data-action="export-csv" data-form-id="${escapeHtml(form.id)}" aria-label="Export CSV">Export CSV</button>
			<button class="formforge__btn formforge__btn--secondary" data-action="back-to-forms" aria-label="Back to forms">Back to Forms</button>
		</div>
	</div>
	${tableHtml}
	${paginationHtml}
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Form Activity
// ---------------------------------------------------------------------------

export function renderFormActivityWidget(forms: FormSummary[]): string {
	// Sort by submission count descending, take top 5
	const topForms = [...forms]
		.sort((a, b) => b.submissionCount - a.submissionCount)
		.slice(0, 5);

	if (topForms.length === 0) {
		return `<div class="formforge__widget">
	${renderAdminStyles()}
	<p class="formforge__widget-label">Form Activity</p>
	<p style="text-align:center;color:#999;font-style:italic;padding:1rem 0;">No forms yet.</p>
</div>`;
	}

	const maxCount = Math.max(...topForms.map((f) => f.submissionCount), 1);

	const bars = topForms
		.map((f) => {
			const pct = Math.round((f.submissionCount / maxCount) * 100);
			return `<div class="formforge__bar-row">
		<span class="formforge__bar-label" title="${escapeHtml(f.name)}">${escapeHtml(truncate(f.name, 18))}</span>
		<div class="formforge__bar-track">
			<div class="formforge__bar-fill" style="width: ${pct}%;" aria-label="${f.submissionCount} submissions"></div>
		</div>
		<span class="formforge__bar-count">${f.submissionCount}</span>
	</div>`;
		})
		.join("");

	return `<div class="formforge__widget">
	${renderAdminStyles()}
	<p class="formforge__widget-label">Form Activity</p>
	<h3 class="formforge__widget-title">Top Forms by Submissions</h3>
	${bars}
</div>`;
}
