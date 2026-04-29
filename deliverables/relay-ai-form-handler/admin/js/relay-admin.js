/* Relay Admin JS */

(function () {
	'use strict';

	// Inbox polling every 30 seconds
	function pollInbox() {
		if ( ! document.querySelector( '.relay-inbox' ) ) {
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', relay_admin_ajax.rest_url + 'relay/v1/inbox-poll?_wpnonce=' + encodeURIComponent( relay_admin_ajax.rest_nonce ), true );
		xhr.setRequestHeader( 'X-WP-Nonce', relay_admin_ajax.rest_nonce );
		xhr.onreadystatechange = function () {
			if ( xhr.readyState !== 4 ) {
				return;
			}
			if ( xhr.status === 200 ) {
				try {
					var data = JSON.parse( xhr.responseText );
					if ( data.hasOwnProperty( 'pending_count' ) ) {
						var countEls = document.querySelectorAll( '.relay-pending-count' );
						for ( var i = 0; i < countEls.length; i++ ) {
							countEls[ i ].textContent = String( data.pending_count );
						}
					}
				} catch ( e ) {
					// ignore parse errors
				}
			}
		};
		xhr.send();
	}

	if ( document.querySelector( '.relay-inbox' ) ) {
		pollInbox();
		setInterval( pollInbox, 30000 );
	}

	// Process Now button on dashboard widget
	function initProcessNow() {
		var btn = document.getElementById( 'relay-process-now' );
		if ( ! btn ) {
			return;
		}

		btn.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			var statusEl = document.getElementById( 'relay-process-status' );
			if ( statusEl ) {
				statusEl.textContent = 'Processing...';
			}

			var data = new FormData();
			data.append( 'action', 'relay_process_now' );
			data.append( 'relay_nonce', relay_admin_ajax.nonce );

			var xhr = new XMLHttpRequest();
			xhr.open( 'POST', relay_admin_ajax.ajax_url, true );
			xhr.onreadystatechange = function () {
				if ( xhr.readyState !== 4 ) {
					return;
				}
				if ( xhr.status === 200 ) {
					try {
						var resp = JSON.parse( xhr.responseText );
						if ( resp.success && statusEl ) {
							statusEl.textContent = resp.data.message || 'Done';
						} else if ( statusEl ) {
							statusEl.textContent = 'Failed';
						}
					} catch ( err ) {
						if ( statusEl ) {
							statusEl.textContent = 'Done';
						}
					}
				} else {
					if ( statusEl ) {
						statusEl.textContent = 'Failed';
					}
				}
			};
			xhr.send( data );
		} );
	}

	if ( document.getElementById( 'relay-process-now' ) ) {
		initProcessNow();
	}

	// Reply confirmation
	function initReplyLinks() {
		var links = document.querySelectorAll( '.relay-reply-link' );
		for ( var i = 0; i < links.length; i++ ) {
			links[ i ].addEventListener( 'click', function ( e ) {
				var email = this.getAttribute( 'data-email' );
				if ( ! email ) {
					e.preventDefault();
					return;
				}
				if ( ! confirm( 'Open your email client to reply to ' + email + '?' ) ) {
					e.preventDefault();
				}
			} );
		}
	}

	if ( document.querySelector( '.relay-leads-table' ) ) {
		initReplyLinks();
	}

	// Password reveal toggle for API key field
	function initPasswordToggle() {
		var field = document.getElementById( 'relay_api_key' );
		if ( ! field ) {
			return;
		}

		var btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'button';
		btn.textContent = 'Show';
		btn.style.marginLeft = '6px';
		btn.addEventListener( 'click', function () {
			if ( field.type === 'password' ) {
				field.type = 'text';
				btn.textContent = 'Hide';
			} else {
				field.type = 'password';
				btn.textContent = 'Show';
			}
		} );

		field.parentNode.insertBefore( btn, field.nextSibling );
	}

	if ( document.getElementById( 'relay_api_key' ) ) {
		initPasswordToggle();
	}
})();
