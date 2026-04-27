<?php
/**
 * Plugin Name: WP Sentinel
 * Description: AI-powered site health monitoring and support agent for WordPress.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Shipyard AI
 * License: GPL-2.0-or-later
 * Text Domain: wp-sentinel
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WPSENTINEL_VERSION', '0.1.0' );
define( 'WPSENTINEL_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPSENTINEL_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation hook.
 */
function wpsentinel_activate() {
	// Plugin activation: clear any stale transients.
	delete_transient( 'wpsentinel_health' );
}
register_activation_hook( __FILE__, 'wpsentinel_activate' );

/**
 * Deactivation hook.
 */
function wpsentinel_deactivate() {
	delete_transient( 'wpsentinel_health' );
}
register_deactivation_hook( __FILE__, 'wpsentinel_deactivate' );

/**
 * Load required classes.
 */
require_once WPSENTINEL_DIR . 'includes/class-health-scanner.php';
require_once WPSENTINEL_DIR . 'includes/class-remediation.php';
require_once WPSENTINEL_DIR . 'includes/class-settings.php';
require_once WPSENTINEL_DIR . 'includes/class-ajax.php';
require_once WPSENTINEL_DIR . 'includes/class-chat-proxy.php';

/**
 * Initialize plugin components.
 */
function wpsentinel_init() {
	new WPSentinel\Health\Scanner();
	new WPSentinel\Remediation();
	new WPSentinel\Settings();
	new WPSentinel\AJAX();
	new WPSentinel\Chat\Proxy();
}
add_action( 'init', 'wpsentinel_init' );

/**
 * Register dashboard widget.
 */
function wpsentinel_register_dashboard_widget() {
	if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$settings = get_option( 'wpsentinel_settings', array() );
	if ( isset( $settings['enable_health_widget'] ) && '0' === $settings['enable_health_widget'] ) {
		return;
	}

	wp_add_dashboard_widget(
		'wpsentinel_health_widget',
		__( 'WP Sentinel Health', 'wp-sentinel' ),
		'wpsentinel_render_dashboard_widget',
		null,
		null,
		'normal',
		'high'
	);
}
add_action( 'wp_dashboard_setup', 'wpsentinel_register_dashboard_widget' );

/**
 * Render dashboard widget content.
 */
function wpsentinel_render_dashboard_widget() {
	echo '<div id="wp-sentinel-health-root"></div>';
}

/**
 * Enqueue admin assets.
 *
 * @param string $hook_suffix Current admin page.
 */
function wpsentinel_enqueue_admin_assets( $hook_suffix ) {
	$settings = get_option( 'wpsentinel_settings', array() );

	$enqueue_health = true;
	$enqueue_chat   = true;

	if ( isset( $settings['enable_health_widget'] ) && '0' === $settings['enable_health_widget'] ) {
		$enqueue_health = false;
	}
	if ( isset( $settings['enable_chat_widget'] ) && '0' === $settings['enable_chat_widget'] ) {
		$enqueue_chat = false;
	}

	if ( ! $enqueue_health && ! $enqueue_chat ) {
		return;
	}

	if ( 'index.php' !== $hook_suffix && 'tools_page_wpsentinel' !== $hook_suffix ) {
		return;
	}

	wp_enqueue_script(
		'wpsentinel-admin',
		WPSENTINEL_URL . 'assets/sentinel-admin.js',
		array(),
		WPSENTINEL_VERSION,
		true
	);

	wp_enqueue_style(
		'wpsentinel-admin',
		WPSENTINEL_URL . 'assets/sentinel-admin.css',
		array(),
		WPSENTINEL_VERSION
	);

	$localize_data = array(
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		'nonce'   => wp_create_nonce( 'wpsentinel_nonce' ),
		'settings' => $settings,
	);

	wp_localize_script( 'wpsentinel-admin', 'wpsentinelConfig', $localize_data );
}
add_action( 'admin_enqueue_scripts', 'wpsentinel_enqueue_admin_assets' );
