/**
 * SEODash Admin UI
 *
 * Renders admin HTML for the SEO management interface.
 * Imported by sandbox-entry.ts — all functions return HTML strings.
 *
 * Design system: Matches Shipyard admin patterns.
 * - Terracotta (#C4704B) primary, Sage (#7A8B6F) labels, Gold (#D4A853) accents
 * - Lora (headings), Source Sans 3 (body)
 * - BEM-style: .seodash__element--modifier
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageSeoData {
	id: string;
	path: string;
	title: string;
	description: string;
	canonicalUrl?: string;
	noIndex: boolean;
	noFollow: boolean;
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	ogType?: string;
	twitterCard?: "summary" | "summary_large_image";
	twitterTitle?: string;
	twitterDescription?: string;
	twitterImage?: string;
	structuredData?: string;
	keywords?: string[];
	updatedAt: string;
	seoScore?: number;
	issues?: SeoIssue[];
}

export interface SeoIssue {
	type: "error" | "warning" | "info";
	code: string;
	message: string;
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

function scoreColor(score: number): string {
	if (score >= 80) return "#2e7d32"; // green
	if (score >= 50) return "#f9a825"; // yellow
	return "#c62828"; // red
}

function scoreLabel(score: number): string {
	if (score >= 80) return "Good";
	if (score >= 50) return "Needs Work";
	return "Poor";
}

function issueIcon(type: "error" | "warning" | "info"): string {
	if (type === "error") return '<span class="seodash__issue-icon seodash__issue-icon--error" aria-hidden="true">\u2716</span>';
	if (type === "warning") return '<span class="seodash__issue-icon seodash__issue-icon--warning" aria-hidden="true">\u26A0</span>';
	return '<span class="seodash__issue-icon seodash__issue-icon--info" aria-hidden="true">\u2139</span>';
}

// ---------------------------------------------------------------------------
// Shared Styles
// ---------------------------------------------------------------------------

export function renderAdminStyles(): string {
	return `<style>
	/* SEODash Admin — Base */
	.seodash {
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
	.seodash__header {
		margin-bottom: 2rem;
		border-bottom: 2px solid #d4a853;
		padding-bottom: 1rem;
	}

	.seodash__title {
		font-family: Lora, serif;
		font-size: 2rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: #2c2c2c;
	}

	.seodash__subtitle {
		margin: 0;
		color: #666;
		font-size: 0.95rem;
	}

	/* Cards (dashboard widgets) */
	.seodash__card {
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.25rem;
		transition: box-shadow 0.2s;
	}

	.seodash__card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.seodash__card-label {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #7a8b6f;
		margin: 0 0 0.5rem 0;
	}

	.seodash__card-value {
		font-family: Lora, serif;
		font-size: 1.75rem;
		font-weight: 700;
		color: #2c2c2c;
		margin: 0;
	}

	.seodash__card-detail {
		font-size: 0.8rem;
		color: #999;
		margin: 0.25rem 0 0 0;
	}

	/* Score display */
	.seodash__score {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		font-family: Lora, serif;
		font-size: 1.1rem;
		font-weight: 700;
		color: white;
	}

	.seodash__score--large {
		width: 4.5rem;
		height: 4.5rem;
		font-size: 1.5rem;
	}

	/* Issue list */
	.seodash__issue-icon {
		font-size: 0.85rem;
		margin-right: 0.35rem;
	}
	.seodash__issue-icon--error { color: #c62828; }
	.seodash__issue-icon--warning { color: #f9a825; }
	.seodash__issue-icon--info { color: #1565c0; }

	.seodash__issue-item {
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid #f0f0f0;
		font-size: 0.9rem;
	}

	.seodash__issue-item:last-child {
		border-bottom: none;
	}

	/* Page list */
	.seodash__list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.seodash__page-row {
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		padding: 1rem 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.seodash__page-row:first-child {
		border-radius: 8px 8px 0 0;
	}

	.seodash__page-row:last-child {
		border-radius: 0 0 8px 8px;
	}

	.seodash__page-row:only-child {
		border-radius: 8px;
	}

	.seodash__page-row + .seodash__page-row {
		border-top: none;
	}

	.seodash__page-path {
		font-weight: 600;
		font-size: 0.95rem;
		color: #c4704b;
	}

	.seodash__page-title {
		font-size: 0.85rem;
		color: #666;
		margin-top: 0.15rem;
	}

	.seodash__page-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	/* Badges */
	.seodash__badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.seodash__badge--noindex {
		background: #fde8e8;
		color: #c62828;
	}

	.seodash__badge--nofollow {
		background: #fff3e0;
		color: #e65100;
	}

	/* Empty state */
	.seodash__empty {
		text-align: center;
		color: #999;
		font-style: italic;
		padding: 3rem 1rem;
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
	}

	/* Audit report */
	.seodash__audit-section {
		margin-bottom: 2rem;
	}

	.seodash__audit-page {
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.25rem;
		margin-bottom: 1rem;
	}

	.seodash__audit-page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.seodash {
			padding: 1rem;
		}
		.seodash__title {
			font-size: 1.5rem;
		}
		.seodash__page-row {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>`;
}

// ---------------------------------------------------------------------------
// SEO Pages List
// ---------------------------------------------------------------------------

export function renderSeoPagesList(pages: PageSeoData[]): string {
	let listHtml: string;
	if (pages.length === 0) {
		listHtml = `<div class="seodash__empty">No pages with SEO data configured yet.</div>`;
	} else {
		listHtml =
			'<div class="seodash__list">' +
			pages
				.map((p) => {
					const score = p.seoScore ?? 0;
					const badges: string[] = [];
					if (p.noIndex) badges.push('<span class="seodash__badge seodash__badge--noindex">noindex</span>');
					if (p.noFollow) badges.push('<span class="seodash__badge seodash__badge--nofollow">nofollow</span>');

					return `<div class="seodash__page-row">
	<div>
		<div class="seodash__page-path">${escapeHtml(p.path)}</div>
		<div class="seodash__page-title">${escapeHtml(p.title || "(no title)")}</div>
	</div>
	<div class="seodash__page-meta">
		${badges.join(" ")}
		<span class="seodash__score" style="background:${scoreColor(score)}" aria-label="SEO Score: ${score}">${score}</span>
	</div>
</div>`;
				})
				.join("") +
			"</div>";
	}

	return `<div class="seodash">
	${renderAdminStyles()}
	<div class="seodash__header">
		<h1 class="seodash__title">SEO Pages</h1>
		<p class="seodash__subtitle">${pages.length} page${pages.length !== 1 ? "s" : ""} configured</p>
	</div>
	${listHtml}
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: SEO Score
// ---------------------------------------------------------------------------

export function renderSeoScoreWidget(score: number, issues: SeoIssue[]): string {
	const errorCount = issues.filter((i) => i.type === "error").length;
	const warningCount = issues.filter((i) => i.type === "warning").length;

	return `<div class="seodash__card">
	${renderAdminStyles()}
	<p class="seodash__card-label">SEO Score</p>
	<div style="display:flex;align-items:center;gap:1rem;">
		<span class="seodash__score seodash__score--large" style="background:${scoreColor(score)}" aria-label="Overall SEO Score: ${score}">${score}</span>
		<div>
			<p class="seodash__card-value" style="font-size:1.25rem;">${scoreLabel(score)}</p>
			<p class="seodash__card-detail">${errorCount} error${errorCount !== 1 ? "s" : ""}, ${warningCount} warning${warningCount !== 1 ? "s" : ""}</p>
		</div>
	</div>
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: SEO Issues
// ---------------------------------------------------------------------------

export function renderSeoIssuesWidget(issues: SeoIssue[]): string {
	if (issues.length === 0) {
		return `<div class="seodash__card" style="grid-column: span 2;">
	${renderAdminStyles()}
	<p class="seodash__card-label">SEO Issues</p>
	<p class="seodash__card-detail" style="text-align:center;padding:1rem 0;font-style:italic;">No issues found. Great job!</p>
</div>`;
	}

	const rows = issues
		.slice(0, 10)
		.map(
			(issue) =>
				`<div class="seodash__issue-item">${issueIcon(issue.type)}<span>${escapeHtml(issue.message)}</span></div>`,
		)
		.join("");

	return `<div class="seodash__card" style="grid-column: span 2;">
	${renderAdminStyles()}
	<p class="seodash__card-label">SEO Issues</p>
	${rows}
	${issues.length > 10 ? `<p class="seodash__card-detail">...and ${issues.length - 10} more</p>` : ""}
</div>`;
}

// ---------------------------------------------------------------------------
// Audit Report
// ---------------------------------------------------------------------------

export function renderAuditReport(pages: PageSeoData[]): string {
	if (pages.length === 0) {
		return `<div class="seodash">
	${renderAdminStyles()}
	<div class="seodash__header">
		<h1 class="seodash__title">SEO Audit</h1>
		<p class="seodash__subtitle">No pages to audit</p>
	</div>
	<div class="seodash__empty">Add SEO data to pages to see audit results.</div>
</div>`;
	}

	const totalScore = pages.reduce((sum, p) => sum + (p.seoScore ?? 0), 0);
	const avgScore = Math.round(totalScore / pages.length);
	const allIssues = pages.flatMap((p) => (p.issues ?? []).map((i) => ({ ...i, path: p.path })));
	const errorCount = allIssues.filter((i) => i.type === "error").length;
	const warningCount = allIssues.filter((i) => i.type === "warning").length;

	const pageReports = pages
		.map((p) => {
			const score = p.seoScore ?? 0;
			const issues = p.issues ?? [];
			const issueRows = issues
				.map(
					(i) =>
						`<div class="seodash__issue-item">${issueIcon(i.type)}<span>${escapeHtml(i.message)}</span></div>`,
				)
				.join("");

			return `<div class="seodash__audit-page">
	<div class="seodash__audit-page-header">
		<div>
			<div class="seodash__page-path">${escapeHtml(p.path)}</div>
			<div class="seodash__page-title">${escapeHtml(p.title || "(no title)")}</div>
		</div>
		<span class="seodash__score" style="background:${scoreColor(score)}" aria-label="Score: ${score}">${score}</span>
	</div>
	${issues.length > 0 ? issueRows : '<p class="seodash__card-detail">No issues found.</p>'}
</div>`;
		})
		.join("");

	return `<div class="seodash">
	${renderAdminStyles()}
	<div class="seodash__header">
		<h1 class="seodash__title">SEO Audit</h1>
		<p class="seodash__subtitle">${pages.length} page${pages.length !== 1 ? "s" : ""} audited &mdash; Average score: ${avgScore}</p>
	</div>
	<div style="display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;">
		<div class="seodash__card" style="flex:1;min-width:200px;">
			<p class="seodash__card-label">Average Score</p>
			<div style="display:flex;align-items:center;gap:0.75rem;">
				<span class="seodash__score seodash__score--large" style="background:${scoreColor(avgScore)}">${avgScore}</span>
				<p class="seodash__card-value" style="font-size:1.1rem;">${scoreLabel(avgScore)}</p>
			</div>
		</div>
		<div class="seodash__card" style="flex:1;min-width:200px;">
			<p class="seodash__card-label">Total Issues</p>
			<p class="seodash__card-value">${allIssues.length}</p>
			<p class="seodash__card-detail">${errorCount} errors, ${warningCount} warnings</p>
		</div>
	</div>
	<div class="seodash__audit-section">
		${pageReports}
	</div>
</div>`;
}
