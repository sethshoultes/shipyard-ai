<?php
/**
 * Plugin Name: Relay
 * Plugin URI:  https://shipyard.ai/relay
 * Description: AI Form Handler & Lead Router
 * Version:     1.0.0
 * Author:      Shipyard AI
 * Author URI:  https://shipyard.ai
 * Text Domain: relay
 * Domain Path: /languages
 * Requires PHP: 7.4
 * Requires at least: 5.8
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RELAY_VERSION', '1.0.0' );
define( 'RELAY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RELAY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Add custom cron schedule.
 *
 * @param array $schedules Existing schedules.
 * @return array Modified schedules.
 */
function relay_cron_schedules( $schedules ) {
	$schedules['five_minutes'] = array(
		'interval' => 300,
		'display'  => __( 'Every 5 Minutes', 'relay' ),
	);
	return $schedules;
}
add_filter( 'cron_schedules', 'relay_cron_schedules' );

/**
 * Load textdomain.
 */
function relay_load_textdomain() {
	load_plugin_textdomain( 'relay', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'relay_load_textdomain' );

/**
 * Activation hook.
 */
function relay_activate() {
	require_once RELAY_PLUGIN_DIR . 'includes/class-storage.php';
	Relay_Storage::activate();

	if ( ! wp_next_scheduled( 'relay_process_leads' ) ) {
		wp_schedule_event( time(), 'five_minutes', 'relay_process_leads' );
	}

	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'relay_activate' );

/**
 * Deactivation hook.
 */
function relay_deactivate() {
	wp_clear_scheduled_hook( 'relay_process_leads' );
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'relay_deactivate' );

/**
 * Initialize the plugin.
 */
function relay_init() {
	require_once RELAY_PLUGIN_DIR . 'includes/class-relay.php';
	Relay::instance()->init();
}
add_action( 'plugins_loaded', 'relay_init', 20 );
