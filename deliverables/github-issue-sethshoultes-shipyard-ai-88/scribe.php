<?php
/**
 * Plugin Name:       Scribe
 * Description:       AI-powered audio transcription Gutenberg block with click-to-play sync.
 * Version:           1.0.0
 * Author:            Scribe
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       scribe
 * Domain Path:       /languages
 * Requires at least: 5.8
 * Requires PHP:      7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SCRIBE_VERSION', '1.0.0' );
define( 'SCRIBE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SCRIBE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Autoloader for Scribe classes.
 *
 * @param string $class Class name.
 */
function scribe_autoloader( $class ) {
	$prefix = 'Scribe_';
	if ( strpos( $class, $prefix ) !== 0 ) {
		return;
	}

	$relative_class = substr( $class, strlen( $prefix ) );
	$file           = SCRIBE_PLUGIN_DIR . 'includes/class-' . strtolower( str_replace( '_', '-', $relative_class ) ) . '.php';

	if ( file_exists( $file ) ) {
		require_once $file;
	}
}
spl_autoload_register( 'scribe_autoloader' );

/**
 * Load plugin textdomain.
 */
function scribe_load_textdomain() {
	load_plugin_textdomain( 'scribe', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'scribe_load_textdomain' );

/**
 * Register block type and enqueue assets.
 */
function scribe_register_block() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'scribe_register_block' );

/**
 * Enqueue frontend assets when the block is present.
 *
 * @param string $block_content Block content.
 * @param array  $block         Block array.
 */
function scribe_enqueue_frontend_assets( $block_content, $block ) {
	if ( 'scribe/transcript' === $block['blockName'] || false !== strpos( $block['blockName'], 'scribe/' ) ) {
		if ( ! wp_script_is( 'scribe-frontend', 'enqueued' ) ) {
			wp_enqueue_script(
				'scribe-frontend',
				SCRIBE_PLUGIN_URL . 'build/frontend.js',
				array(),
				SCRIBE_VERSION,
				true
			);
		}
		if ( ! wp_style_is( 'scribe-frontend', 'enqueued' ) ) {
			wp_enqueue_style(
				'scribe-frontend',
				SCRIBE_PLUGIN_URL . 'assets/css/frontend.css',
				array(),
				SCRIBE_VERSION
			);
		}
	}
	return $block_content;
}
add_filter( 'render_block', 'scribe_enqueue_frontend_assets', 10, 2 );

/**
 * Activation hook.
 */
function scribe_activate() {
	if ( ! wp_next_scheduled( 'scribe_process_jobs' ) ) {
		wp_schedule_event( time(), 'every_minute', 'scribe_process_jobs' );
	}
	if ( ! wp_next_scheduled( 'scribe_cleanup_jobs' ) ) {
		wp_schedule_event( time(), 'daily', 'scribe_cleanup_jobs' );
	}
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'scribe_activate' );

/**
 * Deactivation hook.
 */
function scribe_deactivate() {
	wp_clear_scheduled_hook( 'scribe_process_jobs' );
	wp_clear_scheduled_hook( 'scribe_cleanup_jobs' );
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'scribe_deactivate' );

/**
 * Add custom cron schedule.
 *
 * @param array $schedules Cron schedules.
 * @return array
 */
function scribe_cron_schedules( $schedules ) {
	$schedules['every_minute'] = array(
		'interval' => 60,
		'display'  => __( 'Every Minute', 'scribe' ),
	);
	return $schedules;
}
add_filter( 'cron_schedules', 'scribe_cron_schedules' );

/**
 * Initialize plugin classes.
 */
function scribe_init() {
	new Scribe_Settings();
	new Scribe_Job_Queue();
	new Scribe_Storage();
	new Scribe_Library();
	new Scribe_Public_URLs();
}
add_action( 'init', 'scribe_init', 20 );
