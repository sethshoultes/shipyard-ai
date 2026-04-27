<?php
/**
 * Plugin Name: WP Intelligence Suite — Core
 * Plugin URI:  https://example.com/wp-intelligence-suite
 * Description: Shared infrastructure for the WP Intelligence Suite. Activates tier logic, usage limits, and module registration.
 * Version:     1.0.0
 * Author:      Shipyard AI
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wis-core
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WIS_VERSION', '1.0.0' );
define( 'WIS_DIR', plugin_dir_path( __FILE__ ) );
define( 'WIS_URL', plugin_dir_url( __FILE__ ) );
define( 'WIS_FREE_LIMIT', 50 );

/**
 * Core activation.
 */
function wis_core_activate() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$default_options = array(
		'wis_tier'        => 'free',
		'wis_usage_count' => 0,
		'wis_month_start' => current_time( 'timestamp' ),
		'wis_version'     => WIS_VERSION,
		'wis_activated'   => current_time( 'timestamp' ),
	);

	foreach ( $default_options as $key => $value ) {
		if ( false === get_option( $key ) ) {
			add_option( $key, $value );
		}
	}

	// Create pre-seeded defaults for LocalGenius FAQs.
	$faq_seed = array(
		array(
			'question' => __( 'What are your business hours?', 'wis-core' ),
			'answer'   => __( 'We are open Monday through Friday, 9 AM to 5 PM.', 'wis-core' ),
		),
		array(
			'question' => __( 'Do you offer consultations?', 'wis-core' ),
			'answer'   => __( 'Yes, we offer free initial consultations. Contact us to schedule.', 'wis-core' ),
		),
		array(
			'question' => __( 'What services do you provide?', 'wis-core' ),
			'answer'   => __( 'We provide a full range of professional services tailored to your needs.', 'wis-core' ),
		),
		array(
			'question' => __( 'How can I contact support?', 'wis-core' ),
			'answer'   => __( 'Reach our support team via the contact form on our website.', 'wis-core' ),
		),
		array(
			'question' => __( 'Where are you located?', 'wis-core' ),
			'answer'   => __( 'Visit our Contact page for directions and office locations.', 'wis-core' ),
		),
	);

	if ( false === get_option( 'wis_faq_seed' ) ) {
		add_option( 'wis_faq_seed', $faq_seed );
	}
}
register_activation_hook( __FILE__, 'wis_core_activate' );

/**
 * Core deactivation.
 */
function wis_core_deactivate() {
	delete_transient( 'wis_tooltip_state' );
}
register_deactivation_hook( __FILE__, 'wis_core_deactivate' );

/**
 * Bootstrap.
 */
function wis_core_bootstrap() {
	require_once WIS_DIR . 'includes/class-loader.php';
	require_once WIS_DIR . 'includes/class-tier.php';
	require_once WIS_DIR . 'includes/class-settings.php';
	require_once WIS_DIR . 'includes/class-usage.php';

	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		require_once WIS_DIR . 'wp-cli/class-wis-cli.php';
	}
}
add_action( 'plugins_loaded', 'wis_core_bootstrap' );

/**
 * Enqueue tooltip assets on admin.
 */
function wis_core_admin_assets( $hook ) {
	wp_enqueue_style( 'wis-tooltip', WIS_URL . 'assets/css/tooltip.css', array(), WIS_VERSION );
	wp_enqueue_script( 'wis-tooltip', WIS_URL . 'assets/js/tooltip.js', array(), WIS_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'wis_core_admin_assets' );
