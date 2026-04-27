<?php
/**
 * Plugin Name: Sous
 * Description: Your AI assistant for local business. Auto-detects your business info, pre-populates FAQs, and adds a chat widget to your site.
 * Version: 1.0.0
 * Author: Sous
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
	sous_update_option( 'sous_business_name', '' );
	sous_update_option( 'sous_category', '' );
	sous_update_option( 'sous_detection_status', 'pending' );
	sous_update_option( 'sous_widget_auto_inject', '1' );
	sous_update_option( 'sous_brand_color', '#d97706' );

	if ( ! wp_next_scheduled( 'sous_weekly_digest' ) ) {
		$next_monday = strtotime( 'next Monday 9:00' );
		wp_schedule_event( $next_monday, 'weekly', 'sous_weekly_digest' );
	}
}
register_activation_hook( __FILE__, 'sous_activate' );

function sous_deactivate() {
	wp_clear_scheduled_hook( 'sous_weekly_digest' );
}
register_deactivation_hook( __FILE__, 'sous_deactivate' );

function sous_enqueue_admin_assets( $hook ) {
	if ( 'toplevel_page_sous' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'sous-admin', SOUS_URL . 'assets/admin.css', array(), SOUS_VERSION );
	wp_enqueue_script( 'sous-admin', SOUS_URL . 'assets/admin.js', array( 'jquery' ), SOUS_VERSION, true );
	wp_localize_script( 'sous-admin', 'sousAdminConfig', array(
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		'nonce'   => wp_create_nonce( 'sous_admin_nonce' ),
	) );
}
add_action( 'admin_enqueue_scripts', 'sous_enqueue_admin_assets' );

function sous_enqueue_frontend_assets() {
	if ( is_admin() ) {
		return;
	}
	$auto_inject = sous_get_option( 'sous_widget_auto_inject' );
	if ( '1' !== $auto_inject && 'shortcode' !== $auto_inject ) {
		return;
	}
	wp_enqueue_style( 'sous-widget', SOUS_URL . 'assets/widget.css', array(), SOUS_VERSION );
	wp_enqueue_script( 'sous-widget', SOUS_URL . 'assets/widget.js', array(), SOUS_VERSION, true );
	wp_localize_script( 'sous-widget', 'sousConfig', array(
		'endpoint'      => esc_url_raw( 'https://api.sous.app/ask' ),
		'businessName'  => esc_html( sous_get_option( 'sous_business_name' ) ),
		'category'      => esc_html( sous_get_option( 'sous_category' ) ),
		'brandColor'    => esc_attr( sous_get_option( 'sous_brand_color' ) ),
		'nonce'         => wp_create_nonce( 'sous_widget_nonce' ),
	) );
}
add_action( 'wp_enqueue_scripts', 'sous_enqueue_frontend_assets' );
