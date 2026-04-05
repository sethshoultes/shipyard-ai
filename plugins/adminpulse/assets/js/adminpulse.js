(function() {
	'use strict';

	// Get config from wp_localize_script
	const config = window.adminpulseConfig || {};

	/**
	 * Fetch health data from server via AJAX
	 */
	function fetchHealth() {
		const formData = new FormData();
		formData.append('action', 'adminpulse_get_health');
		formData.append('nonce', config.nonce);

		fetch(config.ajaxUrl, {
			method: 'POST',
			body: formData,
			credentials: 'same-origin'
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			renderHealth(data);
		})
		.catch(() => {
			renderError();
		});
	}

	/**
	 * Render health data in the widget
	 * @param {Object} data - Health data from server
	 */
	function renderHealth(data) {
		const container = document.getElementById('adminpulse-content');
		if (!container) {
			return;
		}

		// Clear loading state
		container.classList.remove('loading');

		// Build HTML from issues array
		let html = '';
		if (data.issues && data.issues.length > 0) {
			html = '<ul>' + data.issues.map(issue => {
				return '<li>' + issue + '</li>';
			}).join('') + '</ul>';
		} else {
			html = '<p>All systems operational.</p>';
		}

		// Set innerHTML (data is pre-escaped by PHP)
		container.innerHTML = html;
	}

	/**
	 * Render error message
	 */
	function renderError() {
		const container = document.getElementById('adminpulse-content');
		if (!container) {
			return;
		}

		container.classList.remove('loading');
		container.innerHTML = '<p class="error">Couldn\'t check site health. Try refreshing.</p>';
	}

	/**
	 * Initialize the widget
	 */
	function init() {
		// Set up refresh button handler
		const refreshBtn = document.getElementById('adminpulse-refresh');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', function(e) {
				e.preventDefault();
				const container = document.getElementById('adminpulse-content');
				if (container) {
					container.classList.add('loading');
				}
				fetchHealth();
			});
		}

		// Fetch health data immediately
		fetchHealth();
	}

	// Initialize on DOMContentLoaded
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
