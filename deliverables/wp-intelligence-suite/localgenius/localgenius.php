<?php
/**
 * Plugin Name: LocalGenius
 * Plugin URI:  https://example.com/wp-intelligence-suite
 * Description: Visitor-facing FAQ widget for the WP Intelligence Suite.
 * Version:     1.0.0
 * Author:      Shipyard AI
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: localgenius
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LOCALGENIUS_VERSION', '1.0.0' );
define( 'LOCALGENIUS_DIR', plugin_dir_path( __FILE__ ) );
define( 'LOCALGENIUS_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation: create FAQ posts/options.
 */
function localgenius_activate() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( false === get_option( 'localgenius_version' ) ) {
		add_option( 'localgenius_version', LOCALGENIUS_VERSION );
	}
}
register_activation_hook( __FILE__, 'localgenius_activate' );

/**
 * Deactivation.
 */
function localgenius_deactivate() {
	delete_transient( 'localgenius_cache' );
}
register_deactivation_hook( __FILE__, 'localgenius_deactivate' );

/**
 * Bootstrap.
 */
function localgenius_bootstrap() {
	if ( ! defined( 'WIS_VERSION' ) ) {
		add_action( 'admin_notices', 'localgenius_missing_core_notice' );
		return;
	}

	require_once LOCALGENIUS_DIR . 'includes/class-widget.php';
	require_once LOCALGENIUS_DIR . 'includes/class-admin.php';
}
add_action( 'plugins_loaded', 'localgenius_bootstrap' );

/**
 * Dependency notice.
 */
function localgenius_missing_core_notice() {
	echo '<div class="error"><p>' . esc_html__( 'LocalGenius requires WP Intelligence Suite Core. Please install and activate wis-core.', 'localgenius' ) . '</p></div>';
}

/**
 * Enqueue public assets.
 */
function localgenius_enqueue_assets() {
	wp_enqueue_style( 'localgenius-css', LOCALGENIUS_URL . 'public/css/localgenius.css', array(), LOCALGENIUS_VERSION );
	wp_enqueue_script( 'localgenius-js', LOCALGENIUS_URL . 'public/js/localgenius.js', array(), LOCALGENIUS_VERSION, true );
	wp_script_add_data( 'localgenius-js', 'defer', true );
}
add_action( 'wp_enqueue_scripts', 'localgenius_enqueue_assets' );
