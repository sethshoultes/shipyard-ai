<?php
/**
 * Plugin Name: SPARK
 * Plugin URI: https://usespark.ai
 * Description: A warm, human chat widget for local businesses. One-screen setup. No AI jargon.
 * Version: 1.0.0
 * Author: Shipyard AI
 * Author URI: https://shipyard.ai
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: spark
 * Domain Path: /languages
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SPARK_VERSION', '1.0.0' );
define( 'SPARK_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SPARK_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation hook.
 */
function spark_activate() {
	if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
		wp_die( esc_html__( 'SPARK requires PHP 7.4 or higher.', 'spark' ) );
	}

	if ( ! wp_next_scheduled( 'spark_cleanup_transients' ) ) {
		wp_schedule_event( time(), 'daily', 'spark_cleanup_transients' );
	}
}
register_activation_hook( __FILE__, 'spark_activate' );

/**
 * Deactivation hook.
 */
function spark_deactivate() {
	wp_clear_scheduled_hook( 'spark_cleanup_transients' );
}
register_deactivation_hook( __FILE__, 'spark_deactivate' );

/**
 * Load plugin textdomain.
 */
function spark_load_textdomain() {
	load_plugin_textdomain( 'spark', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
}
add_action( 'plugins_loaded', 'spark_load_textdomain' );

/**
 * Bootstrap SPARK.
 */
function spark_bootstrap() {
	require_once SPARK_PLUGIN_DIR . 'includes/class-spark.php';
	SPARK::instance();
}
add_action( 'plugins_loaded', 'spark_bootstrap', 11 );
