<?php
/**
 * Plugin Name: Whisper
 * Description: A Gutenberg block that accepts audio/video files and renders beautiful, synchronized transcripts with timestamps and highlight-on-hover playback.
 * Version: 1.0.0
 * Author: Shipyard AI
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: whisper
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WHISPER_VERSION', '1.0.0' );
define( 'WHISPER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WHISPER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Load plugin textdomain.
 */
function whisper_load_textdomain() {
	load_plugin_textdomain( 'whisper', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'whisper_load_textdomain' );

/**
 * Include required classes.
 */
require_once WHISPER_PLUGIN_DIR . 'includes/class-whisper-api.php';
require_once WHISPER_PLUGIN_DIR . 'includes/class-job-queue.php';
require_once WHISPER_PLUGIN_DIR . 'includes/class-storage.php';
require_once WHISPER_PLUGIN_DIR . 'includes/class-settings.php';

/**
 * Initialize plugin components.
 */
function whisper_init() {
	new Whisper_API();
	new Whisper_Job_Queue();
	new Whisper_Storage();
	new Whisper_Settings();
}
add_action( 'init', 'whisper_init' );

/**
 * Register the block.
 */
function whisper_register_block() {
	register_block_type( WHISPER_PLUGIN_DIR . 'block.json' );
}
add_action( 'init', 'whisper_register_block', 20 );

/**
 * Register custom cron schedules on activation.
 */
function whisper_activate() {
	if ( ! wp_next_scheduled( 'whisper_cron_process_jobs' ) ) {
		wp_schedule_event( time(), 'every_minute', 'whisper_cron_process_jobs' );
	}
	if ( ! wp_next_scheduled( 'whisper_cron_weekly_cleanup' ) ) {
		wp_schedule_event( time(), 'weekly', 'whisper_cron_weekly_cleanup' );
	}
}
register_activation_hook( __FILE__, 'whisper_activate' );

/**
 * Clear cron schedules on deactivation.
 */
function whisper_deactivate() {
	wp_clear_scheduled_hook( 'whisper_cron_process_jobs' );
	wp_clear_scheduled_hook( 'whisper_cron_weekly_cleanup' );
}
register_deactivation_hook( __FILE__, 'whisper_deactivate' );
