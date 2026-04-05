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
	// Placeholder for deactivation logic
}

/**
 * Bootstrap the plugin
 */
function adminpulse_boot() {
	// Placeholder for boot logic
}

// Register activation and deactivation hooks
register_activation_hook( __FILE__, 'adminpulse_activate' );
register_deactivation_hook( __FILE__, 'adminpulse_deactivate' );

// Register boot action
add_action( 'plugins_loaded', 'adminpulse_boot' );
