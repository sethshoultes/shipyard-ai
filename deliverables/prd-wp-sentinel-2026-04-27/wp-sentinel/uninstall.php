<?php
/**
 * Uninstall routine for WP Sentinel.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove options.
delete_option( 'wpsentinel_settings' );

// Remove transients.
delete_transient( 'wpsentinel_health' );
