/**
 * AdminPulse Dashboard Widget JavaScript
 *
 * Handles AJAX lazy-loading of health data and refresh functionality.
 *
 * @package AdminPulse
 * @version 1.0.0
 */

( function() {
	'use strict';

	/**
	 * AdminPulse Widget Controller
	 */
	const AdminPulse = {
		/**
		 * Widget container element.
		 */
		container: null,

		/**
		 * Refresh button element.
		 */
		refreshButton: null,

		/**
		 * Loading state flag.
		 */
		isLoading: false,

		/**
		 * Initialize the widget.
		 */
		init: function() {
			this.container = document.getElementById( 'adminpulse-widget-content' );
			this.refreshButton = document.getElementById( 'adminpulse-refresh' );

			if ( ! this.container ) {
				return;
			}

			// Bind refresh button click handler.
			if ( this.refreshButton ) {
				this.refreshButton.addEventListener( 'click', this.handleRefresh.bind( this ) );
			}

			// Load health data on page load.
			this.loadHealthData( false );
		},

		/**
		 * Load health data via AJAX.
		 *
		 * @param {boolean} forceRefresh Whether to bypass cache.
		 */
		loadHealthData: function( forceRefresh ) {
			if ( this.isLoading ) {
				return;
			}

			this.isLoading = true;
			this.showLoading();

			const formData = new FormData();
			formData.append( 'action', 'adminpulse_get_health' );
			formData.append( 'nonce', adminpulseData.nonce );

			if ( forceRefresh ) {
				formData.append( 'refresh', 'true' );
			}

			fetch( adminpulseData.ajaxUrl, {
				method: 'POST',
				credentials: 'same-origin',
				body: formData
			} )
			.then( function( response ) {
				return response.json();
			} )
			.then( function( data ) {
				AdminPulse.isLoading = false;
				AdminPulse.hideLoading();

				if ( data.success && data.data && data.data.html ) {
					AdminPulse.container.innerHTML = data.data.html;
				} else {
					AdminPulse.showError( data.data && data.data.message ? data.data.message : "Couldn't check site health. Try refreshing." );
				}
			} )
			.catch( function( error ) {
				AdminPulse.isLoading = false;
				AdminPulse.hideLoading();
				AdminPulse.showError( "Couldn't check site health. Try refreshing." );
			} );
		},

		/**
		 * Handle refresh button click.
		 *
		 * @param {Event} event Click event.
		 */
		handleRefresh: function( event ) {
			event.preventDefault();
			this.loadHealthData( true );
		},

		/**
		 * Show loading indicator.
		 */
		showLoading: function() {
			if ( this.container ) {
				this.container.innerHTML = '<div class="adminpulse-loading">' +
					'<div class="adminpulse-skeleton adminpulse-skeleton-line"></div>' +
					'<div class="adminpulse-skeleton adminpulse-skeleton-line"></div>' +
					'<div class="adminpulse-skeleton adminpulse-skeleton-line"></div>' +
					'</div>';
			}

			if ( this.refreshButton ) {
				this.refreshButton.disabled = true;
				this.refreshButton.classList.add( 'adminpulse-loading-btn' );
			}
		},

		/**
		 * Hide loading indicator.
		 */
		hideLoading: function() {
			if ( this.refreshButton ) {
				this.refreshButton.disabled = false;
				this.refreshButton.classList.remove( 'adminpulse-loading-btn' );
			}
		},

		/**
		 * Show error message.
		 *
		 * @param {string} message Error message to display.
		 */
		showError: function( message ) {
			if ( this.container ) {
				this.container.innerHTML = '<div class="adminpulse-error">' +
					'<span class="dashicons dashicons-warning"></span>' +
					'<p>' + this.escapeHtml( message ) + '</p>' +
					'</div>';
			}
		},

		/**
		 * Escape HTML entities for safe display.
		 *
		 * @param {string} text Text to escape.
		 * @return {string} Escaped text.
		 */
		escapeHtml: function( text ) {
			const div = document.createElement( 'div' );
			div.textContent = text;
			return div.innerHTML;
		}
	};

	/**
	 * Initialize on DOMContentLoaded.
	 */
	document.addEventListener( 'DOMContentLoaded', function() {
		AdminPulse.init();
	} );

} )();
