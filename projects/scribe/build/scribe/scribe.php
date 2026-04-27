<?php
/**
 * Plugin Name: Scribe
 * Description: AI-powered audio transcription block for WordPress. Drag, drop, transcribe.
 * Version: 1.0.0
 * Author: Shipyard AI
 * Text Domain: scribe
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
	exit;
}

define('SCRIBE_VERSION', '1.0.0');
define('SCRIBE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SCRIBE_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load includes.
require_once SCRIBE_PLUGIN_DIR . 'includes/class-scribe-api.php';
require_once SCRIBE_PLUGIN_DIR . 'includes/class-job-queue.php';
require_once SCRIBE_PLUGIN_DIR . 'includes/class-storage.php';
require_once SCRIBE_PLUGIN_DIR . 'includes/class-settings.php';

/**
 * Main plugin class.
 */
class Scribe_Plugin {

	public function __construct() {
		add_action('init', array($this, 'init'));
		add_action('enqueue_block_assets', array($this, 'enqueue_frontend_assets'));
	}

	public function init() {
		register_block_type(SCRIBE_PLUGIN_DIR . 'block.json');
		new Scribe_Settings();
		new Scribe_Job_Queue();
	}

	public function enqueue_frontend_assets() {
		if (!has_block('scribe/transcript')) {
			return;
		}
		wp_enqueue_style(
			'scribe-frontend',
			SCRIBE_PLUGIN_URL . 'assets/css/frontend.css',
			array(),
			SCRIBE_VERSION
		);
		wp_enqueue_script(
			'scribe-frontend',
			SCRIBE_PLUGIN_URL . 'build/frontend.js',
			array(),
			SCRIBE_VERSION,
			true
		);
	}
}

new Scribe_Plugin();

register_activation_hook(__FILE__, function() {
	wp_schedule_event(time(), 'hourly', 'scribe_process_queue');
	wp_schedule_event(time(), 'weekly', 'scribe_prune');
	update_option('scribe_activation_time', time());
});

register_deactivation_hook(__FILE__, function() {
	wp_clear_scheduled_hook('scribe_process_queue');
	wp_clear_scheduled_hook('scribe_prune');
});
