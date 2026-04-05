/**
 * ReviewPulse Admin UI
 *
 * Renders admin HTML for the review management interface.
 * Imported by sandbox-entry.ts — all functions return HTML strings.
 *
 * Design system: Matches MemberShip/EventDash admin patterns.
 * - Terracotta (#C4704B) primary, Sage (#7A8B6F) labels, Gold (#D4A853) accents
 * - Lora (headings), Source Sans 3 (body)
 * - BEM-style: .reviewpulse__element--modifier
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewRecord {
	id: string;
	source: "google" | "yelp" | "manual";
	author: string;
	rating: number; // 1-5
	text: string;
	date: string; // ISO
	featured: boolean;
	flagged: boolean;
	replyText?: string;
	repliedAt?: string;
}

export interface ReviewFilters {
	rating?: number; // 1-5 or undefined = all
	source?: "google" | "yelp" | "manual" | "";
	status?: "featured" | "flagged" | "";
	page: number;
	perPage: number;
}

export interface ReviewStats {
	averageRating: number;
	totalCount: number;
	bySource: { google: number; yelp: number; manual: number };
	trend: "up" | "down" | "stable"; // compared to previous period
	previousAverage: number;
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

function renderStars(rating: number): string {
	const full = Math.floor(rating);
	const half = rating - full >= 0.5 ? 1 : 0;
	const empty = 5 - full - half;
	let html = "";
	for (let i = 0; i < full; i++) {
		html += '<span class="reviewpulse__star reviewpulse__star--full" aria-hidden="true">\u2605</span>';
	}
	if (half) {
		html += '<span class="reviewpulse__star reviewpulse__star--half" aria-hidden="true">\u2605</span>';
	}
	for (let i = 0; i < empty; i++) {
		html += '<span class="reviewpulse__star reviewpulse__star--empty" aria-hidden="true">\u2606</span>';
	}
	html += `<span class="sr-only">${rating} out of 5 stars</span>`;
	return html;
}

function sourceBadge(source: string): string {
	const label = source.charAt(0).toUpperCase() + source.slice(1);
	return `<span class="reviewpulse__source-badge reviewpulse__source-badge--${escapeHtml(source)}">${escapeHtml(label)}</span>`;
}

function trendArrow(trend: "up" | "down" | "stable"): string {
	if (trend === "up") return '<span class="reviewpulse__trend reviewpulse__trend--up" aria-label="Trending up">\u25B2</span>';
	if (trend === "down") return '<span class="reviewpulse__trend reviewpulse__trend--down" aria-label="Trending down">\u25BC</span>';
	return '<span class="reviewpulse__trend reviewpulse__trend--stable" aria-label="Stable">\u25C6</span>';
}

// ---------------------------------------------------------------------------
// Shared Styles (injected once per page)
// ---------------------------------------------------------------------------

export function renderAdminStyles(): string {
	return `<style>
	/* ReviewPulse Admin — Base */
	.reviewpulse {
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
	.reviewpulse__header {
		margin-bottom: 2rem;
		border-bottom: 2px solid #d4a853;
		padding-bottom: 1rem;
	}

	.reviewpulse__title {
		font-family: Lora, serif;
		font-size: 2rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: #2c2c2c;
	}

	.reviewpulse__subtitle {
		margin: 0;
		color: #666;
		font-size: 0.95rem;
	}

	/* Stars */
	.reviewpulse__star {
		font-size: 1.1rem;
		letter-spacing: 1px;
	}
	.reviewpulse__star--full { color: #d4a853; }
	.reviewpulse__star--half { color: #d4a853; opacity: 0.6; }
	.reviewpulse__star--empty { color: #d4c4b5; }

	.reviewpulse__stars-large .reviewpulse__star {
		font-size: 1.75rem;
		letter-spacing: 2px;
	}

	/* Source badges */
	.reviewpulse__source-badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.reviewpulse__source-badge--google {
		background: #e8f0fe;
		color: #1a73e8;
	}
	.reviewpulse__source-badge--yelp {
		background: #fde8e8;
		color: #d32323;
	}
	.reviewpulse__source-badge--manual {
		background: #f0f0f0;
		color: #616161;
	}

	/* Trend indicators */
	.reviewpulse__trend {
		font-size: 0.85rem;
		margin-left: 0.5rem;
	}
	.reviewpulse__trend--up { color: #2e7d32; }
	.reviewpulse__trend--down { color: #c62828; }
	.reviewpulse__trend--stable { color: #7a8b6f; }

	/* Cards (dashboard widgets) */
	.reviewpulse__cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.reviewpulse__card {
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.25rem;
		transition: box-shadow 0.2s;
	}

	.reviewpulse__card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.reviewpulse__card-label {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #7a8b6f;
		margin: 0 0 0.5rem 0;
	}

	.reviewpulse__card-value {
		font-family: Lora, serif;
		font-size: 1.75rem;
		font-weight: 700;
		color: #2c2c2c;
		margin: 0;
	}

	.reviewpulse__card--highlight .reviewpulse__card-value {
		color: #c4704b;
	}

	.reviewpulse__card-detail {
		font-size: 0.8rem;
		color: #999;
		margin: 0.25rem 0 0 0;
	}

	.reviewpulse__card-breakdown {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0 0;
		font-size: 0.85rem;
		color: #666;
	}

	.reviewpulse__card-breakdown li {
		display: flex;
		justify-content: space-between;
		padding: 0.15rem 0;
	}

	/* Filters */
	.reviewpulse__filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.reviewpulse__filter-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d4c4b5;
		border-radius: 4px;
		font-size: 0.9rem;
		font-family: inherit;
		background: white;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.reviewpulse__filter-select:focus {
		outline: none;
		border-color: #c4704b;
		box-shadow: 0 0 0 2px rgba(196, 112, 75, 0.15);
	}

	/* Review list */
	.reviewpulse__list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.reviewpulse__review {
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 0;
		padding: 1rem 1.25rem;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.reviewpulse__review:first-child {
		border-radius: 8px 8px 0 0;
	}

	.reviewpulse__review:last-child {
		border-radius: 0 0 8px 8px;
	}

	.reviewpulse__review:only-child {
		border-radius: 8px;
	}

	.reviewpulse__review + .reviewpulse__review {
		border-top: none;
	}

	.reviewpulse__review:hover {
		background: rgba(196, 112, 75, 0.04);
	}

	.reviewpulse__review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.reviewpulse__review-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.reviewpulse__review-author {
		font-weight: 600;
		font-size: 0.95rem;
		color: #2c2c2c;
	}

	.reviewpulse__review-date {
		font-size: 0.8rem;
		color: #999;
	}

	.reviewpulse__review-text {
		font-size: 0.9rem;
		color: #444;
		margin: 0.4rem 0 0 0;
		line-height: 1.5;
	}

	.reviewpulse__review-text--full {
		display: none;
	}

	.reviewpulse__review.is-expanded .reviewpulse__review-text--preview {
		display: none;
	}

	.reviewpulse__review.is-expanded .reviewpulse__review-text--full {
		display: block;
	}

	.reviewpulse__review-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	/* Toggle buttons */
	.reviewpulse__toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.55rem;
		border: 1px solid #d4c4b5;
		border-radius: 4px;
		background: white;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
		color: #666;
	}

	.reviewpulse__toggle:hover {
		border-color: #c4704b;
		color: #c4704b;
	}

	.reviewpulse__toggle--active {
		background: #c4704b;
		border-color: #c4704b;
		color: white;
	}

	.reviewpulse__toggle--flagged.reviewpulse__toggle--active {
		background: #c62828;
		border-color: #c62828;
	}

	/* Empty state */
	.reviewpulse__empty {
		text-align: center;
		color: #999;
		font-style: italic;
		padding: 3rem 1rem;
		background: #faf8f5;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
	}

	/* Pagination */
	.reviewpulse__pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.reviewpulse__pagination-info {
		font-size: 0.85rem;
		color: #666;
	}

	.reviewpulse__pagination-controls {
		display: flex;
		gap: 0.5rem;
	}

	.reviewpulse__page-btn {
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

	.reviewpulse__page-btn:hover:not(:disabled) {
		background: #c4704b;
		color: white;
		border-color: #c4704b;
	}

	.reviewpulse__page-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.reviewpulse__page-btn--current {
		background: #c4704b;
		color: white;
		border-color: #c4704b;
	}

	/* Recent reviews widget (compact) */
	.reviewpulse__recent-item {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 0.6rem 0;
		border-bottom: 1px solid #e5e5e5;
	}

	.reviewpulse__recent-item:last-child {
		border-bottom: none;
	}

	.reviewpulse__recent-rating {
		flex-shrink: 0;
		font-size: 0.85rem;
	}

	.reviewpulse__recent-content {
		flex: 1;
		min-width: 0;
	}

	.reviewpulse__recent-author {
		font-weight: 600;
		font-size: 0.85rem;
		color: #2c2c2c;
	}

	.reviewpulse__recent-text {
		font-size: 0.8rem;
		color: #666;
		margin: 0.15rem 0 0 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Mobile responsive */
	@media (max-width: 900px) {
		.reviewpulse__cards {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.reviewpulse {
			padding: 1rem;
		}

		.reviewpulse__title {
			font-size: 1.5rem;
		}

		.reviewpulse__cards {
			grid-template-columns: 1fr;
		}

		.reviewpulse__card-value {
			font-size: 1.5rem;
		}

		.reviewpulse__filters {
			flex-direction: column;
		}

		.reviewpulse__filter-select {
			width: 100%;
		}

		.reviewpulse__review-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.reviewpulse__pagination {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.reviewpulse__pagination-controls {
			justify-content: center;
		}
	}
</style>`;
}

// ---------------------------------------------------------------------------
// Review List Page (/reviews admin page)
// ---------------------------------------------------------------------------

export function renderReviewList(
	reviews: ReviewRecord[],
	filters: ReviewFilters,
	totalCount: number,
): string {
	const totalPages = Math.ceil(totalCount / filters.perPage);
	const page = filters.page;

	// Filter option builders
	const ratingOptions = [
		`<option value=""${!filters.rating ? " selected" : ""}>All Ratings</option>`,
		...[5, 4, 3, 2, 1].map(
			(r) =>
				`<option value="${r}"${filters.rating === r ? " selected" : ""}>${r} Star${r > 1 ? "s" : ""}</option>`,
		),
	].join("");

	const sourceOptions = [
		`<option value=""${!filters.source ? " selected" : ""}>All Sources</option>`,
		`<option value="google"${filters.source === "google" ? " selected" : ""}>Google</option>`,
		`<option value="yelp"${filters.source === "yelp" ? " selected" : ""}>Yelp</option>`,
		`<option value="manual"${filters.source === "manual" ? " selected" : ""}>Manual</option>`,
	].join("");

	const statusOptions = [
		`<option value=""${!filters.status ? " selected" : ""}>All Status</option>`,
		`<option value="featured"${filters.status === "featured" ? " selected" : ""}>Featured</option>`,
		`<option value="flagged"${filters.status === "flagged" ? " selected" : ""}>Flagged</option>`,
	].join("");

	// Build review rows
	let reviewsHtml: string;
	if (reviews.length === 0) {
		reviewsHtml = `<div class="reviewpulse__empty">No reviews match the current filters.</div>`;
	} else {
		reviewsHtml =
			'<div class="reviewpulse__list">' +
			reviews
				.map((r) => {
					const preview = truncate(r.text, 150);
					const hasMore = r.text.length > 150;

					return `<div class="reviewpulse__review" data-review-id="${escapeHtml(r.id)}" role="button" tabindex="0" aria-expanded="false">
	<div class="reviewpulse__review-header">
		<div class="reviewpulse__review-meta">
			<span class="reviewpulse__review-author">${escapeHtml(r.author)}</span>
			<span>${renderStars(r.rating)}</span>
			${sourceBadge(r.source)}
			<span class="reviewpulse__review-date">${formatDate(r.date)}</span>
		</div>
		<div class="reviewpulse__review-actions">
			<button class="reviewpulse__toggle${r.featured ? " reviewpulse__toggle--active" : ""}" data-action="toggle-featured" data-id="${escapeHtml(r.id)}" aria-label="${r.featured ? "Unfeature" : "Feature"} review" aria-pressed="${r.featured}">
				\u2605 Featured
			</button>
			<button class="reviewpulse__toggle reviewpulse__toggle--flagged${r.flagged ? " reviewpulse__toggle--active" : ""}" data-action="toggle-flagged" data-id="${escapeHtml(r.id)}" aria-label="${r.flagged ? "Unflag" : "Flag"} review" aria-pressed="${r.flagged}">
				\u2691 Flagged
			</button>
		</div>
	</div>
	<p class="reviewpulse__review-text reviewpulse__review-text--preview">${escapeHtml(preview)}${hasMore ? ' <span style="color:#c4704b;font-size:0.8rem;">[click to expand]</span>' : ""}</p>
	<p class="reviewpulse__review-text reviewpulse__review-text--full">${escapeHtml(r.text)}</p>
</div>`;
				})
				.join("") +
			"</div>";
	}

	// Pagination
	let paginationHtml = "";
	if (totalPages > 1) {
		const start = (page - 1) * filters.perPage + 1;
		const end = Math.min(page * filters.perPage, totalCount);
		const maxButtons = Math.min(totalPages, 5);
		let startPage = Math.max(1, page - 2);
		if (startPage + maxButtons - 1 > totalPages) {
			startPage = Math.max(1, totalPages - maxButtons + 1);
		}

		let buttons = `<button class="reviewpulse__page-btn" data-page="${page - 1}"${page <= 1 ? " disabled" : ""} aria-label="Previous page">Prev</button>`;
		for (let i = startPage; i < startPage + maxButtons; i++) {
			buttons += `<button class="reviewpulse__page-btn${i === page ? " reviewpulse__page-btn--current" : ""}" data-page="${i}" aria-label="Page ${i}"${i === page ? ' aria-current="page"' : ""}>${i}</button>`;
		}
		buttons += `<button class="reviewpulse__page-btn" data-page="${page + 1}"${page >= totalPages ? " disabled" : ""} aria-label="Next page">Next</button>`;

		paginationHtml = `
<div class="reviewpulse__pagination">
	<span class="reviewpulse__pagination-info">Showing ${start}\u2013${end} of ${totalCount}</span>
	<div class="reviewpulse__pagination-controls">${buttons}</div>
</div>`;
	}

	return `<div class="reviewpulse">
	${renderAdminStyles()}
	<div class="reviewpulse__header">
		<h1 class="reviewpulse__title">Review Management</h1>
		<p class="reviewpulse__subtitle">${totalCount} review${totalCount !== 1 ? "s" : ""} across all sources</p>
	</div>

	<div class="reviewpulse__filters" id="reviewpulse-filters">
		<select class="reviewpulse__filter-select" id="rp-filter-rating" aria-label="Filter by rating">${ratingOptions}</select>
		<select class="reviewpulse__filter-select" id="rp-filter-source" aria-label="Filter by source">${sourceOptions}</select>
		<select class="reviewpulse__filter-select" id="rp-filter-status" aria-label="Filter by status">${statusOptions}</select>
	</div>

	${reviewsHtml}
	${paginationHtml}
</div>

<script>
(function() {
	// Expand/collapse reviews
	document.querySelectorAll('.reviewpulse__review').forEach(function(el) {
		el.addEventListener('click', function(e) {
			if (e.target.closest('.reviewpulse__toggle')) return;
			var expanded = el.classList.toggle('is-expanded');
			el.setAttribute('aria-expanded', String(expanded));
		});
		el.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (e.target.closest('.reviewpulse__toggle')) return;
				var expanded = el.classList.toggle('is-expanded');
				el.setAttribute('aria-expanded', String(expanded));
			}
		});
	});

	// Toggle featured/flagged via API
	document.querySelectorAll('.reviewpulse__toggle').forEach(function(btn) {
		btn.addEventListener('click', function(e) {
			e.stopPropagation();
			var action = btn.getAttribute('data-action');
			var id = btn.getAttribute('data-id');
			var isActive = btn.classList.contains('reviewpulse__toggle--active');
			var field = action === 'toggle-featured' ? 'featured' : 'flagged';

			fetch('/_emdash/api/plugins/reviewpulse/reviews/update', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: id, [field]: !isActive })
			}).then(function(res) {
				if (res.ok) {
					btn.classList.toggle('reviewpulse__toggle--active');
					var nowActive = btn.classList.contains('reviewpulse__toggle--active');
					btn.setAttribute('aria-pressed', String(nowActive));
				}
			}).catch(function(err) {
				console.error('Failed to update review:', err);
			});
		});
	});

	// Filter changes trigger page reload with params
	['rp-filter-rating', 'rp-filter-source', 'rp-filter-status'].forEach(function(id) {
		var el = document.getElementById(id);
		if (el) {
			el.addEventListener('change', function() {
				var params = new URLSearchParams(window.location.search);
				var rating = document.getElementById('rp-filter-rating').value;
				var source = document.getElementById('rp-filter-source').value;
				var status = document.getElementById('rp-filter-status').value;
				if (rating) params.set('rating', rating); else params.delete('rating');
				if (source) params.set('source', source); else params.delete('source');
				if (status) params.set('status', status); else params.delete('status');
				params.set('page', '1');
				window.location.search = params.toString();
			});
		}
	});

	// Pagination clicks
	document.querySelectorAll('.reviewpulse__page-btn').forEach(function(btn) {
		btn.addEventListener('click', function() {
			if (btn.disabled) return;
			var p = btn.getAttribute('data-page');
			var params = new URLSearchParams(window.location.search);
			params.set('page', p);
			window.location.search = params.toString();
		});
	});
})();
</script>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Average Rating
// ---------------------------------------------------------------------------

export function renderStatsWidget(stats: ReviewStats): string {
	return `<div class="reviewpulse__card reviewpulse__card--highlight">
	${renderAdminStyles()}
	<p class="reviewpulse__card-label">Average Rating</p>
	<p class="reviewpulse__card-value">
		${stats.averageRating.toFixed(1)}${trendArrow(stats.trend)}
	</p>
	<div class="reviewpulse__stars-large" aria-hidden="true">
		${renderStars(stats.averageRating)}
	</div>
	<p class="reviewpulse__card-detail">
		${stats.trend === "up" ? "Up" : stats.trend === "down" ? "Down" : "Unchanged"} from ${stats.previousAverage.toFixed(1)} previous period
	</p>
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Review Count
// ---------------------------------------------------------------------------

export function renderReviewCountWidget(stats: ReviewStats): string {
	return `<div class="reviewpulse__card">
	${renderAdminStyles()}
	<p class="reviewpulse__card-label">Review Count</p>
	<p class="reviewpulse__card-value">${stats.totalCount}</p>
	<ul class="reviewpulse__card-breakdown">
		<li><span>Google</span> <strong>${stats.bySource.google}</strong></li>
		<li><span>Yelp</span> <strong>${stats.bySource.yelp}</strong></li>
		<li><span>Manual</span> <strong>${stats.bySource.manual}</strong></li>
	</ul>
</div>`;
}

// ---------------------------------------------------------------------------
// Dashboard Widget: Recent Reviews
// ---------------------------------------------------------------------------

export function renderRecentReviewsWidget(reviews: ReviewRecord[]): string {
	const items = reviews.slice(0, 5);

	if (items.length === 0) {
		return `<div class="reviewpulse__card" style="grid-column: span 2;">
	${renderAdminStyles()}
	<p class="reviewpulse__card-label">Recent Reviews</p>
	<p class="reviewpulse__card-detail" style="text-align:center;padding:1rem 0;font-style:italic;">No reviews yet.</p>
</div>`;
	}

	const rows = items
		.map(
			(r) => `<div class="reviewpulse__recent-item">
	<div class="reviewpulse__recent-rating">${renderStars(r.rating)}</div>
	<div class="reviewpulse__recent-content">
		<span class="reviewpulse__recent-author">${escapeHtml(r.author)}</span>
		${sourceBadge(r.source)}
		<p class="reviewpulse__recent-text">${escapeHtml(truncate(r.text, 80))}</p>
	</div>
</div>`,
		)
		.join("");

	return `<div class="reviewpulse__card" style="grid-column: span 2;">
	${renderAdminStyles()}
	<p class="reviewpulse__card-label">Recent Reviews</p>
	${rows}
</div>`;
}
