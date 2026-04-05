<?php
/**
 * AdminPulse
 *
 * @package AdminPulse
 * @version 1.0.0
 */

/**
 * Plugin Name: AdminPulse
 * Description: A glanceable dashboard widget showing your WordPress site health status
 * Version: 1.0.0
 * Requires at least: 6.2
 * Requires PHP: 8.0
 * Author: Shipyard AI
 * License: GPL-2.0-or-later
 * Text Domain: adminpulse
 */

// Security check
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define constants
define( 'ADMINPULSE_VERSION', '1.0.0' );
define( 'ADMINPULSE_DIR', plugin_dir_path( __FILE__ ) );
define( 'ADMINPULSE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation hook
 */
function adminpulse_activate() {
	// Placeholder for activation logic
}

/**
 * Deactivation hook
 */
function adminpulse_deactivate() {
	// Clear cache on deactivation
	adminpulse_clear_cache();
}

/**
 * Bootstrap the plugin
 */
function adminpulse_boot() {
	// Step 4: Hook to wp_dashboard_setup
	add_action( 'wp_dashboard_setup', 'adminpulse_register_widget' );
}

/**
 * Get cache key for health data
 *
 * Generates a cache key for storing health data. Includes blog ID for multisite isolation.
 *
 * @return string Cache key
 */
function adminpulse_get_cache_key() {
	$key = 'adminpulse_health_data';

	// Append blog ID for multisite isolation
	if ( is_multisite() ) {
		$key .= '_' . get_current_blog_id();
	}

	return $key;
}

/**
 * Get cached health data with fallback
 *
 * Retrieves health data from cache. If cache miss, fetches fresh data and stores it.
 *
 * @return array Health data array or empty array on error
 */
function adminpulse_get_cached_health() {
	$cache_key = adminpulse_get_cache_key();

	// Try to get from cache
	$cached_data = get_transient( $cache_key );

	if ( false !== $cached_data ) {
		return $cached_data;
	}

	// Cache miss - get fresh data
	$data = adminpulse_get_health_issues();

	// Store in cache for 1 hour
	set_transient( $cache_key, $data, HOUR_IN_SECONDS );

	return $data;
}

/**
 * Clear health data cache
 *
 * Removes the cached health data for the current site/blog.
 */
function adminpulse_clear_cache() {
	$cache_key = adminpulse_get_cache_key();
	delete_transient( $cache_key );
}

/**
 * Register dashboard widget
 *
 * Step 1: Create adminpulse_register_widget() function
 * Step 2: Add capability check
 * Step 3: Call wp_add_dashboard_widget()
 */
function adminpulse_register_widget() {
	// Step 2: Add capability check
	if ( ! current_user_can( 'view_site_health' ) && ! current_user_can( 'manage_options' ) ) {
		return;
	}

	// Step 3: Call wp_add_dashboard_widget()
	wp_add_dashboard_widget(
		'adminpulse_health_widget',                    // Widget ID
		__( 'Site Health', 'adminpulse' ),            // Title
		'adminpulse_render_widget',                    // Callback
		null,                                          // Args
		null,                                          // Screen
		'normal',                                      // Context
		'high'                                         // Priority
	);
}

/**
 * Render dashboard widget content
 *
 * Step 5: Create adminpulse_render_widget() function that outputs:
 * - Container div with id="adminpulse-content"
 * - Loading skeleton (CSS animation placeholder)
 * - Refresh button with id="adminpulse-refresh"
 */
function adminpulse_render_widget() {
	// Add inline CSS for loading skeleton
	?>
	<style>
		/* Step 6: Add inline CSS for loading skeleton */
		.adminpulse-loading {
			animation: pulse 1.5s infinite;
			background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
			background-size: 200% 100%;
			height: 20px;
			border-radius: 4px;
			margin-bottom: 12px;
		}

		@keyframes pulse {
			0% {
				background-position: 200% 0;
			}
			100% {
				background-position: -200% 0;
			}
		}

		/* Color-coded badge classes (to be used by JS) */
		.adminpulse-badge {
			display: inline-block;
			padding: 4px 8px;
			border-radius: 3px;
			font-size: 12px;
			font-weight: 600;
			margin-right: 8px;
			margin-bottom: 8px;
		}

		.adminpulse-badge-good {
			background-color: #d4edda;
			color: #155724;
			border: 1px solid #c3e6cb;
		}

		.adminpulse-badge-warning {
			background-color: #fff3cd;
			color: #856404;
			border: 1px solid #ffeaa7;
		}

		.adminpulse-badge-critical {
			background-color: #f8d7da;
			color: #721c24;
			border: 1px solid #f5c6cb;
		}

		#adminpulse-refresh {
			margin-top: 12px;
			padding: 6px 12px;
			background-color: #0073aa;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 13px;
		}

		#adminpulse-refresh:hover {
			background-color: #005a87;
		}
	</style>

	<!-- Container div with loading skeleton -->
	<div id="adminpulse-content">
		<!-- Loading skeleton placeholders -->
		<div class="adminpulse-loading" style="width: 100%;"></div>
		<div class="adminpulse-loading" style="width: 85%;"></div>
		<div class="adminpulse-loading" style="width: 90%;"></div>
	</div>

	<!-- Refresh button -->
	<button id="adminpulse-refresh" type="button">
		<?php esc_html_e( 'Refresh', 'adminpulse' ); ?>
	</button>
	<?php
}

/**
 * Aggregates health issues from WP_Site_Health API
 *
 * Fetches health data from WordPress Site Health API, extracts relevant test results,
 * and formats them for display. Handles API errors gracefully and filters to show only
 * issues (not passing checks).
 *
 * @return array|WP_Error Array of health issues with standardized format, or WP_Error on failure
 */
function adminpulse_get_health_issues() {
	// Step 2: Get WP_Site_Health instance
	try {
		$health = WP_Site_Health::get_instance();
	} catch ( Exception $e ) {
		// Step 3: Wrap API calls in try-catch for error handling
		return new WP_Error(
			'health_api_error',
			'Failed to get WP_Site_Health instance',
			array( 'details' => $e->getMessage() )
		);
	}

	// Step 4: Get direct tests
	try {
		$tests = WP_Site_Health::get_tests();
	} catch ( Exception $e ) {
		return new WP_Error(
			'health_tests_error',
			'Failed to get health tests',
			array( 'details' => $e->getMessage() )
		);
	}

	// Ensure we have direct tests
	if ( ! isset( $tests['direct'] ) || ! is_array( $tests['direct'] ) ) {
		return array();
	}

	$health_issues = array();

	// Run each direct test and collect results
	foreach ( $tests['direct'] as $test ) {
		try {
			// Call the test function if it's callable
			if ( is_callable( $test['test'] ) ) {
				$result = call_user_func( $test['test'] );

				// Step 5: Filter results to exclude 'good' status (show only issues)
				if ( isset( $result['status'] ) && 'good' !== $result['status'] ) {
					// Step 7: Map each result to standardized format
					$mapped_result = array(
						'label'       => isset( $result['label'] ) ? sanitize_text_field( $result['label'] ) : 'Unknown Test',
						'status'      => isset( $result['status'] ) ? sanitize_text_field( $result['status'] ) : 'recommended',
						'severity'    => adminpulse_get_severity( isset( $result['status'] ) ? $result['status'] : 'recommended' ),
						'description' => isset( $result['description'] ) ? wp_kses_post( $result['description'] ) : '',
						'actions'     => isset( $result['actions'] ) ? $result['actions'] : array(),
					);

					$health_issues[] = $mapped_result;
				}
			}
		} catch ( Exception $e ) {
			// Continue processing other tests even if one fails
			continue;
		}
	}

	// Step 6: Sort by severity: 'critical' first, then 'recommended'
	usort(
		$health_issues,
		function ( $a, $b ) {
			$severity_order = array( 'critical' => 0, 'recommended' => 1, 'good' => 2 );
			$a_order        = $severity_order[ $a['status'] ] ?? 2;
			$b_order        = $severity_order[ $b['status'] ] ?? 2;
			return $a_order - $b_order;
		}
	);

	// Step 8: Return array of issues
	// Step 9: Handle empty results: return empty array (not error)
	return $health_issues;
}

/**
 * Maps WP_Site_Health status to severity color
 *
 * @param string $status The status from WP_Site_Health (critical, recommended, good)
 * @return string Severity color (red, yellow, green)
 */
function adminpulse_get_severity( $status ) {
	$severity_map = array(
		'critical'    => 'red',
		'recommended' => 'yellow',
		'good'        => 'green',
	);

	return $severity_map[ $status ] ?? 'green';
}


/**
 * Get CSS class for severity level
 *
 * @param string $status The status from WordPress Site Health
 * @return string CSS class name
 */
function adminpulse_get_severity_class( $status ) {
	$severity_classes = array(
		'critical'    => 'adminpulse-critical',
		'recommended' => 'adminpulse-warning',
		'good'        => 'adminpulse-good',
	);

	return isset( $severity_classes[ $status ] ) ? $severity_classes[ $status ] : 'adminpulse-info';
}

/**
 * Get human-readable severity label
 *
 * @param string $status The status from WordPress Site Health
 * @return string Localized severity label
 */
function adminpulse_get_severity_label( $status ) {
	$severity_labels = array(
		'critical'    => __( 'Critical', 'adminpulse' ),
		'recommended' => __( 'Warning', 'adminpulse' ),
		'good'        => __( 'Good', 'adminpulse' ),
	);

	return isset( $severity_labels[ $status ] ) ? $severity_labels[ $status ] : __( 'Unknown', 'adminpulse' );
}

/**
 * Output inline CSS for severity color badges
 * Only displays on dashboard
 */
function adminpulse_output_styles() {
	// Only load on dashboard
	$screen = get_current_screen();
	if ( ! isset( $screen->id ) || 'dashboard' !== $screen->id ) {
		return;
	}

	?>
	<style>
		/* Severity badge styles */
		.adminpulse-critical,
		.adminpulse-warning,
		.adminpulse-good,
		.adminpulse-info {
			display: inline-block;
			padding: 4px 12px;
			border-radius: 3px;
			font-size: 12px;
			font-weight: 500;
		}

		/* Critical status - Red */
		.adminpulse-critical {
			background-color: #dc3232;
			color: #ffffff;
		}

		/* Recommended/Warning status - Yellow */
		.adminpulse-warning {
			background-color: #ffb900;
			color: #1d2327;
		}

		/* Good status - Green */
		.adminpulse-good {
			background-color: #46b450;
			color: #ffffff;
		}

		/* Info status - Blue */
		.adminpulse-info {
			background-color: #0073aa;
			color: #ffffff;
		}

		/* Issue list container styling */
		.adminpulse-issue {
			margin-bottom: 12px;
			padding: 8px;
			border-left: 4px solid;
		}

		/* Issue border color matches severity */
		.adminpulse-issue.adminpulse-critical {
			border-left-color: #dc3232;
		}

		.adminpulse-issue.adminpulse-warning {
			border-left-color: #ffb900;
		}

		.adminpulse-issue.adminpulse-good {
			border-left-color: #46b450;
		}

		.adminpulse-issue.adminpulse-info {
			border-left-color: #0073aa;
		}

		/* Screen reader text for accessibility */
		.adminpulse-sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect( 0, 0, 0, 0 );
			white-space: nowrap;
			border-width: 0;
		}
	</style>
	<?php
}

/**
 * Enqueue JavaScript and pass configuration via wp_localize_script
 *
 * Enqueues the adminpulse.js script only on the dashboard page and passes
 * configuration (AJAX URL and nonce) to enable secure frontend-backend communication.
 *
 * @param string $hook_suffix The current admin page hook suffix
 */
function adminpulse_enqueue_assets( $hook_suffix ) {
	// Step 2: Check if on dashboard - only enqueue on index.php
	if ( 'index.php' !== $hook_suffix ) {
		return;
	}

	// Step 3: Check if widget should display (capability check)
	if ( ! current_user_can( 'view_site_health' ) && ! current_user_can( 'manage_options' ) ) {
		return;
	}

	// Step 4: Enqueue JavaScript with defer loading
	wp_enqueue_script(
		'adminpulse-js',
		ADMINPULSE_URL . 'assets/js/adminpulse.js',
		array(),              // no dependencies
		ADMINPULSE_VERSION,
		true                  // in footer (defer)
	);

	// Step 5: Localize script with config
	wp_localize_script(
		'adminpulse-js',
		'adminpulseConfig',
		array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'adminpulse_nonce' ),
		)
	);
}

/**
 * AJAX endpoint to get health data as JSON
 *
 * Handles AJAX requests to fetch health data. Includes nonce verification,
 * capability checks, and proper JSON responses. Supports both cache-hit
 * fast path and refresh (cache-clear) mode.
 *
 * Step 1: Create adminpulse_ajax_get_health() function
 * Step 2: Verify nonce
 * Step 3: Check capability
 * Step 4: Check for refresh flag
 * Step 5: If refresh, clear cache first
 * Step 6: Get health data
 * Step 7: Check for WP_Error
 * Step 8: Build response HTML
 * Step 9: Return success
 */
function adminpulse_ajax_get_health() {
	// Step 2: Verify nonce
	check_ajax_referer( 'adminpulse_nonce', 'nonce' );

	// Step 3: Check capability
	if ( ! current_user_can( 'view_site_health' ) && ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( __( 'Unauthorized', 'adminpulse' ), 403 );
	}

	// Step 4: Check for refresh flag
	$refresh = isset( $_POST['refresh'] ) && $_POST['refresh'] === 'true'; // phpcs:ignore WordPress.Security.NonceVerification.Missing

	// Step 5: If refresh, clear cache first
	if ( $refresh ) {
		adminpulse_clear_cache();
	}

	// Step 6: Get health data
	$issues = adminpulse_get_cached_health();

	// Step 7: Check for WP_Error
	if ( is_wp_error( $issues ) ) {
		wp_send_json_error( $issues->get_error_message() );
	}

	// Step 8: Build response HTML for each issue
	$html = '';

	foreach ( $issues as $issue ) {
		$severity_class = adminpulse_get_severity_class( $issue['status'] );
		$severity_label = adminpulse_get_severity_label( $issue['status'] );

		// Build issue container with severity class
		$html .= '<div class="adminpulse-issue ' . esc_attr( $severity_class ) . '">';

		// Badge with severity label
		$html .= '<span class="adminpulse-badge ' . esc_attr( 'adminpulse-badge-' . $issue['status'] ) . '">';
		$html .= esc_html( $severity_label );
		$html .= '</span>';

		// Issue label
		$html .= '<strong>';
		$html .= esc_html( $issue['label'] );
		$html .= '</strong>';

		// Issue description
		if ( ! empty( $issue['description'] ) ) {
			$html .= '<p>';
			$html .= wp_kses_post( $issue['description'] );
			$html .= '</p>';
		}

		// Action links
		if ( ! empty( $issue['actions'] ) ) {
			$html .= '<div class="adminpulse-actions">';
			foreach ( $issue['actions'] as $action ) {
				if ( isset( $action['label'] ) && isset( $action['url'] ) ) {
					$html .= '<a href="' . esc_url( $action['url'] ) . '" class="adminpulse-action-link" target="_blank" rel="noopener noreferrer">';
					$html .= esc_html( $action['label'] );
					$html .= '</a> ';
				}
			}
			$html .= '</div>';
		}

		$html .= '</div>';
	}

	// Step 9: Return success with HTML and count
	wp_send_json_success(
		array(
			'html'  => $html,
			'count' => count( $issues ),
		)
	);
}

// Register activation and deactivation hooks
register_activation_hook( __FILE__, 'adminpulse_activate' );
register_deactivation_hook( __FILE__, 'adminpulse_deactivate' );

// Register boot action
add_action( 'plugins_loaded', 'adminpulse_boot' );

// Register styles hook for admin dashboard
add_action( 'admin_head', 'adminpulse_output_styles' );

// Step 6: Hook to admin_enqueue_scripts
add_action( 'admin_enqueue_scripts', 'adminpulse_enqueue_assets' );

// Step 10: Register AJAX action for health data endpoint
add_action( 'wp_ajax_adminpulse_get_health', 'adminpulse_ajax_get_health' );
