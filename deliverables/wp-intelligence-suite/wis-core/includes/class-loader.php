<?php
/**
 * Class Loader
 *
 * Registers child plugins with existence checks.
 *
 * @package WP_Intelligence_Suite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load child plugins if they exist.
 */
function wis_core_load_modules() {
	$base = dirname( WIS_DIR );

	$modules = array(
		$base . '/localgenius/localgenius.php',
		$base . '/dash/dash.php',
		$base . '/pinned/pinned.php',
	);

	foreach ( $modules as $module ) {
		if ( file_exists( $module ) ) {
			include_once $module;
		}
	}
}
