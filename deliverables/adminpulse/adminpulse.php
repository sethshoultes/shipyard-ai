<?php
/**
 * Plugin Name: AdminPulse
 * Plugin URI: https://example.com/adminpulse
 * Description: A lightweight dashboard widget that surfaces WordPress Site Health issues at a glance.
 * Version: 1.0.0
 * Requires at least: 6.2
 * Requires PHP: 8.0
 * Author: AdminPulse Team
 * License: GPL-2.0+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: adminpulse
 *
 * @package AdminPulse
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'ADMINPULSE_VERSION', '1.0.0' );
define( 'ADMINPULSE_DIR', plugin_dir_path( __FILE__ ) );
define( 'ADMINPULSE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Get the transient key for caching health data.
 * Includes blog ID for multisite isolation.
 *
 * @return string Transient key.
 */
function adminpulse_get_transient_key() {
	$blog_id = get_current_blog_id();
	return 'adminpulse_health_data_' . $blog_id;
}

/**
 * Plugin activation hook.
 * Performs version check and initializes transient.
 */
function adminpulse_activate() {
	// Version check for PHP.
	if ( version_compare( PHP_VERSION, '8.0', '<' ) ) {
		deactivate_plugins( plugin_basename( __FILE__ ) );
		wp_die(
			esc_html__( 'AdminPulse requires PHP 8.0 or higher.', 'adminpulse' ),
			'Plugin Activation Error',
			array( 'back_link' => true )
		);
	}

	// Version check for WordPress.
	global $wp_version;
	if ( version_compare( $wp_version, '6.2', '<' ) ) {
		deactivate_plugins( plugin_basename( __FILE__ ) );
		wp_die(
			esc_html__( 'AdminPulse requires WordPress 6.2 or higher.', 'adminpulse' ),
			'Plugin Activation Error',
			array( 'back_link' => true )
		);
	}

	// Initialize transient (will be populated on first widget load).
	delete_transient( adminpulse_get_transient_key() );
}
register_activation_hook( __FILE__, 'adminpulse_activate' );

/**
 * Plugin deactivation hook.
 * Cleans up transients.
 */
function adminpulse_deactivate() {
	delete_transient( adminpulse_get_transient_key() );
}
register_deactivation_hook( __FILE__, 'adminpulse_deactivate' );

/**
 * Enqueue scripts and styles on dashboard pages only.
 *
 * @param string $hook_suffix The current admin page hook suffix.
 */
function adminpulse_enqueue_assets( $hook_suffix ) {
	// Only load on dashboard page.
	if ( 'index.php' !== $hook_suffix ) {
		return;
	}

	// Don't load on Network Admin dashboard.
	if ( is_network_admin() ) {
		return;
	}

	// Enqueue CSS.
	wp_enqueue_style(
		'adminpulse-styles',
		ADMINPULSE_URL . 'assets/css/adminpulse.css',
		array(),
		ADMINPULSE_VERSION
	);

	// Enqueue JavaScript with defer (in_footer = true).
	wp_enqueue_script(
		'adminpulse-script',
		ADMINPULSE_URL . 'assets/js/adminpulse.js',
		array(),
		ADMINPULSE_VERSION,
		true
	);

	// Localize script with nonce and AJAX URL.
	wp_localize_script(
		'adminpulse-script',
		'adminpulseData',
		array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'adminpulse_nonce' ),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'adminpulse_enqueue_assets' );

/**
 * Register the dashboard widget.
 */
function adminpulse_register_widget() {
	// Don't register on Network Admin.
	if ( is_network_admin() ) {
		return;
	}

	// Check user capability.
	if ( ! current_user_can( 'view_site_health_checks' ) && ! current_user_can( 'manage_options' ) ) {
		return;
	}

	wp_add_dashboard_widget(
		'adminpulse_health_widget',
		__( 'Site Health', 'adminpulse' ),
		'adminpulse_render_widget'
	);
}
add_action( 'wp_dashboard_setup', 'adminpulse_register_widget' );

/**
 * Render the widget content with loading skeleton.
 */
function adminpulse_render_widget() {
	?>
	<div id="adminpulse-widget-content" class="adminpulse-widget">
		<div class="adminpulse-loading">
			<div class="adminpulse-skeleton adminpulse-skeleton-line"></div>
			<div class="adminpulse-skeleton adminpulse-skeleton-line"></div>
			<div class="adminpulse-skeleton adminpulse-skeleton-line"></div>
		</div>
	</div>
	<div class="adminpulse-footer">
		<button type="button" class="button adminpulse-refresh-btn" id="adminpulse-refresh">
			<?php esc_html_e( 'Refresh', 'adminpulse' ); ?>
		</button>
	</div>
	<?php
}

/**
 * Get health data from WP Site Health API.
 *
 * @param bool $force_refresh Whether to bypass cache.
 * @return array Health data array.
 */
function adminpulse_get_health_data( $force_refresh = false ) {
	$transient_key = adminpulse_get_transient_key();

	// Check cache first (unless force refresh).
	if ( ! $force_refresh ) {
		$cached_data = get_transient( $transient_key );
		if ( false !== $cached_data ) {
			return $cached_data;
		}
	} else {
		// Clear transient on manual refresh.
		delete_transient( $transient_key );
	}

	// Load Site Health classes if not already loaded.
	if ( ! class_exists( 'WP_Site_Health' ) ) {
		require_once ABSPATH . 'wp-admin/includes/class-wp-site-health.php';
	}

	$site_health = WP_Site_Health::get_instance();
	$health_data = array(
		'issues'      => array(),
		'total_count' => 0,
		'error'       => false,
	);

	// Get direct tests.
	$tests = WP_Site_Health::get_tests();

	if ( empty( $tests ) || ! is_array( $tests ) ) {
		$health_data['error'] = true;
		return $health_data;
	}

	$issues = array();

	// Run direct tests only (no external HTTP requests).
	if ( ! empty( $tests['direct'] ) && is_array( $tests['direct'] ) ) {
		foreach ( $tests['direct'] as $test_key => $test ) {
			if ( ! is_callable( $test['test'] ) ) {
				continue;
			}

			$result = call_user_func( $test['test'] );

			if ( ! is_array( $result ) || empty( $result['status'] ) ) {
				continue;
			}

			// Filter: only show issues (exclude 'good' status).
			if ( 'good' === $result['status'] ) {
				continue;
			}

			$issues[] = adminpulse_format_issue( $result, $test_key );
		}
	}

	// Sort by severity: critical first, then recommended.
	usort( $issues, 'adminpulse_sort_by_severity' );

	$health_data['issues']      = $issues;
	$health_data['total_count'] = count( $issues );

	// Cache the result for 1 hour.
	set_transient( $transient_key, $health_data, HOUR_IN_SECONDS );

	return $health_data;
}

/**
 * Format a health issue for display.
 *
 * @param array  $result   The test result.
 * @param string $test_key The test identifier.
 * @return array Formatted issue data.
 */
function adminpulse_format_issue( $result, $test_key ) {
	$status = isset( $result['status'] ) ? $result['status'] : 'recommended';

	// Map status to severity class.
	$severity_class = 'adminpulse-warning';
	$severity_label = __( 'Recommended', 'adminpulse' );

	if ( 'critical' === $status ) {
		$severity_class = 'adminpulse-critical';
		$severity_label = __( 'Critical', 'adminpulse' );
	}

	// Transform technical messages to human-readable copy.
	$label       = isset( $result['label'] ) ? $result['label'] : $test_key;
	$description = isset( $result['description'] ) ? wp_strip_all_tags( $result['description'] ) : '';

	// Get action links.
	$actions = array();

	if ( ! empty( $result['actions'] ) ) {
		// Parse action links from HTML.
		preg_match_all( '/<a[^>]+href=["\']([^"\']+)["\'][^>]*>([^<]+)<\/a>/i', $result['actions'], $matches, PREG_SET_ORDER );
		foreach ( $matches as $match ) {
			$actions[] = array(
				'url'   => esc_url( $match[1] ),
				'label' => sanitize_text_field( $match[2] ),
			);
		}
	}

	// Add relevant WordPress admin page links based on test type.
	$admin_action = adminpulse_get_admin_action( $test_key );
	if ( $admin_action && ! in_array( $admin_action['url'], array_column( $actions, 'url' ), true ) ) {
		array_unshift( $actions, $admin_action );
	}

	return array(
		'key'            => $test_key,
		'label'          => adminpulse_humanize_label( $label ),
		'description'    => adminpulse_humanize_description( $description ),
		'status'         => $status,
		'severity_class' => $severity_class,
		'severity_label' => $severity_label,
		'actions'        => $actions,
	);
}

/**
 * Get relevant admin page action for a test type.
 *
 * @param string $test_key The test identifier.
 * @return array|null Action link data or null.
 */
function adminpulse_get_admin_action( $test_key ) {
	$admin_pages = array(
		'plugin_version'           => array(
			'url'   => admin_url( 'plugins.php' ),
			'label' => __( 'Update plugins', 'adminpulse' ),
		),
		'theme_version'            => array(
			'url'   => admin_url( 'themes.php' ),
			'label' => __( 'Update themes', 'adminpulse' ),
		),
		'wordpress_version'        => array(
			'url'   => admin_url( 'update-core.php' ),
			'label' => __( 'Update WordPress', 'adminpulse' ),
		),
		'php_version'              => array(
			'url'   => 'https://wordpress.org/documentation/article/updating-php/',
			'label' => __( 'Learn more', 'adminpulse' ),
		),
		'https_status'             => array(
			'url'   => admin_url( 'options-general.php' ),
			'label' => __( 'Site settings', 'adminpulse' ),
		),
		'ssl_support'              => array(
			'url'   => 'https://wordpress.org/documentation/article/https-for-wordpress/',
			'label' => __( 'Learn more', 'adminpulse' ),
		),
		'scheduled_events'         => array(
			'url'   => admin_url( 'tools.php' ),
			'label' => __( 'View tools', 'adminpulse' ),
		),
		'background_updates'       => array(
			'url'   => admin_url( 'update-core.php' ),
			'label' => __( 'Updates', 'adminpulse' ),
		),
		'autoloaded_options'       => array(
			'url'   => 'https://developer.wordpress.org/reference/functions/get_option/',
			'label' => __( 'Learn more', 'adminpulse' ),
		),
		'debug_enabled'            => array(
			'url'   => 'https://wordpress.org/documentation/article/debugging-in-wordpress/',
			'label' => __( 'Learn more', 'adminpulse' ),
		),
		'page_cache'               => array(
			'url'   => admin_url( 'plugins.php' ),
			'label' => __( 'View plugins', 'adminpulse' ),
		),
		'persistent_object_cache'  => array(
			'url'   => 'https://developer.wordpress.org/reference/classes/wp_object_cache/',
			'label' => __( 'Learn more', 'adminpulse' ),
		),
	);

	if ( isset( $admin_pages[ $test_key ] ) ) {
		$action = $admin_pages[ $test_key ];
		// Ensure admin URLs are properly generated.
		if ( strpos( $action['url'], 'http' ) !== 0 ) {
			$action['url'] = esc_url( $action['url'] );
		} else {
			$action['url'] = esc_url( $action['url'] );
		}
		return $action;
	}

	// Default: link to Site Health page.
	return array(
		'url'   => esc_url( admin_url( 'site-health.php' ) ),
		'label' => __( 'View Site Health', 'adminpulse' ),
	);
}

/**
 * Transform technical labels to human-readable copy.
 *
 * @param string $label The original label.
 * @return string Human-readable label.
 */
function adminpulse_humanize_label( $label ) {
	// Keep label readable but don't over-transform WordPress's already-good labels.
	return sanitize_text_field( $label );
}

/**
 * Transform technical descriptions to human-readable copy.
 *
 * @param string $description The original description.
 * @return string Human-readable description.
 */
function adminpulse_humanize_description( $description ) {
	// Truncate long descriptions for widget display.
	$max_length = 150;
	if ( strlen( $description ) > $max_length ) {
		$description = substr( $description, 0, $max_length ) . '...';
	}
	return sanitize_text_field( $description );
}

/**
 * Sort issues by severity (critical first, then recommended).
 *
 * @param array $a First issue.
 * @param array $b Second issue.
 * @return int Sort order.
 */
function adminpulse_sort_by_severity( $a, $b ) {
	$severity_order = array(
		'critical'    => 0,
		'recommended' => 1,
	);

	$a_order = isset( $severity_order[ $a['status'] ] ) ? $severity_order[ $a['status'] ] : 2;
	$b_order = isset( $severity_order[ $b['status'] ] ) ? $severity_order[ $b['status'] ] : 2;

	return $a_order - $b_order;
}

/**
 * AJAX handler for getting health data.
 */
function adminpulse_ajax_get_health() {
	// Verify nonce.
	if ( ! check_ajax_referer( 'adminpulse_nonce', 'nonce', false ) ) {
		wp_send_json_error(
			array( 'message' => __( 'Security check failed.', 'adminpulse' ) ),
			403
		);
	}

	// Check user capability.
	if ( ! current_user_can( 'view_site_health_checks' ) && ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array( 'message' => __( 'You do not have permission to view site health.', 'adminpulse' ) ),
			403
		);
	}

	// Check if this is a force refresh request.
	$force_refresh = isset( $_POST['refresh'] ) && 'true' === $_POST['refresh'];

	// Get health data.
	$health_data = adminpulse_get_health_data( $force_refresh );

	if ( $health_data['error'] ) {
		wp_send_json_error(
			array( 'message' => __( "Couldn't check site health. Try refreshing.", 'adminpulse' ) )
		);
	}

	// Generate HTML for the widget.
	$html = adminpulse_generate_widget_html( $health_data );

	wp_send_json_success(
		array(
			'html'        => $html,
			'total_count' => $health_data['total_count'],
		)
	);
}
add_action( 'wp_ajax_adminpulse_get_health', 'adminpulse_ajax_get_health' );

/**
 * Generate HTML content for the widget.
 *
 * @param array $health_data The health data array.
 * @return string HTML content.
 */
function adminpulse_generate_widget_html( $health_data ) {
	ob_start();

	if ( empty( $health_data['issues'] ) ) {
		// Empty state: all healthy.
		?>
		<div class="adminpulse-healthy">
			<span class="dashicons dashicons-yes-alt adminpulse-good"></span>
			<p><?php esc_html_e( 'Everything looks good!', 'adminpulse' ); ?></p>
		</div>
		<?php
	} else {
		// Issue count summary with proper plural handling.
		$count = $health_data['total_count'];
		?>
		<p class="adminpulse-summary">
			<?php
			printf(
				/* translators: %d: number of issues */
				esc_html( _n( '%d issue needs attention', '%d issues need attention', $count, 'adminpulse' ) ),
				intval( $count )
			);
			?>
		</p>
		<ul class="adminpulse-issues-list">
			<?php foreach ( $health_data['issues'] as $issue ) : ?>
				<li class="adminpulse-issue <?php echo esc_attr( $issue['severity_class'] ); ?>">
					<div class="adminpulse-issue-header">
						<span class="adminpulse-badge <?php echo esc_attr( $issue['severity_class'] ); ?>">
							<?php echo esc_html( $issue['severity_label'] ); ?>
						</span>
						<strong class="adminpulse-issue-label"><?php echo esc_html( $issue['label'] ); ?></strong>
					</div>
					<?php if ( ! empty( $issue['description'] ) ) : ?>
						<p class="adminpulse-issue-description"><?php echo esc_html( $issue['description'] ); ?></p>
					<?php endif; ?>
					<?php if ( ! empty( $issue['actions'] ) ) : ?>
						<div class="adminpulse-issue-actions">
							<?php foreach ( $issue['actions'] as $action ) : ?>
								<a href="<?php echo esc_url( $action['url'] ); ?>" class="adminpulse-action-link">
									<?php echo esc_html( $action['label'] ); ?>
								</a>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
		<?php
	}

	return ob_get_clean();
}
