<?php
/**
 * Plugin Name: Sous
 * Description: A warm AI assistant widget and weekly review digest for local businesses.
 * Version: 1.0.0
 * Author: LocalGenius
 * Requires PHP: 5.6
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SOUS_VERSION', '1.0.0' );
define( 'SOUS_DIR', plugin_dir_path( __FILE__ ) );
define( 'SOUS_URL', plugin_dir_url( __FILE__ ) );

require_once SOUS_DIR . 'includes/data-store.php';
require_once SOUS_DIR . 'includes/detector.php';
require_once SOUS_DIR . 'includes/scheduler.php';
require_once SOUS_DIR . 'admin.php';

function sous_activate() {
	add_option( 'sous_business_name', '' );
	add_option( 'sous_category', 'generic' );
	add_option( 'sous_detection_status', 'pending' );
	add_option( 'sous_widget_mode', 'auto' );
	add_option( 'sous_brand_color', '#2c3e50' );
	if ( ! wp_next_scheduled( 'sous_weekly_digest' ) ) {
		wp_schedule_event( strtotime( 'next monday 9:00' ), 'weekly', 'sous_weekly_digest' );
	}
}
register_activation_hook( __FILE__, 'sous_activate' );

function sous_deactivate() {
	wp_clear_scheduled_hook( 'sous_weekly_digest' );
}
register_deactivation_hook( __FILE__, 'sous_deactivate' );

function sous_enqueue_frontend_assets() {
	if ( is_admin() ) {
		return;
	}
	wp_enqueue_style( 'sous-widget', SOUS_URL . 'assets/widget.css', array(), SOUS_VERSION );
	wp_enqueue_script( 'sous-widget', SOUS_URL . 'assets/widget.js', array(), SOUS_VERSION, true );
	$business_name = sous_get_option( 'sous_business_name' );
	if ( empty( $business_name ) ) {
		$business_name = get_bloginfo( 'name' );
	}
	wp_localize_script( 'sous-widget', 'sousConfig', array(
		'endpoint'      => esc_url_raw( rest_url( 'sous/v1/ask' ) ),
		'businessName'  => esc_html( $business_name ),
		'category'      => esc_attr( sous_get_option( 'sous_category' ) ),
		'nonce'         => wp_create_nonce( 'sous_widget_nonce' ),
		'welcomeText'   => __( 'Welcome to ', 'sous' ) . esc_html( $business_name ),
	) );
}
add_action( 'wp_enqueue_scripts', 'sous_enqueue_frontend_assets' );

function sous_enqueue_admin_assets( $hook ) {
	if ( 'toplevel_page_sous' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'sous-admin', SOUS_URL . 'assets/admin.css', array(), SOUS_VERSION );
}
add_action( 'admin_enqueue_scripts', 'sous_enqueue_admin_assets' );
