<?php
/**
 * Plugin Name: Cut — Changelog Theatre
 * Description: Transform your readme.txt changelog into a cinematic, animated experience.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Shipyard AI
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cut
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Constants
if ( ! defined( 'CUT_VERSION' ) ) {
	define( 'CUT_VERSION', '1.0.0' );
}
if ( ! defined( 'CUT_DIR' ) ) {
	define( 'CUT_DIR', plugin_dir_path( __FILE__ ) );
}
if ( ! defined( 'CUT_URL' ) ) {
	define( 'CUT_URL', plugin_dir_url( __FILE__ ) );
}

// Activation hook
function cut_activate() {
	// Stub — no external API calls
}
register_activation_hook( __FILE__, 'cut_activate' );

// Deactivation hook
function cut_deactivate() {
	// Stub — no external API calls
}
register_deactivation_hook( __FILE__, 'cut_deactivate' );

// Enqueue client assets on admin and public pages
function cut_enqueue_assets() {
	$client_url = CUT_URL . 'client/';
	$ver        = CUT_VERSION;

	wp_enqueue_style( 'cut-typography', $client_url . 'src/typography.css', array(), $ver );
	wp_enqueue_style( 'cut-motion', $client_url . 'src/motion.css', array(), $ver );

	wp_enqueue_script( 'cut-parser', $client_url . 'src/parser.js', array(), $ver, true );
	wp_enqueue_script( 'cut-renderer', $client_url . 'src/renderer.js', array( 'cut-parser' ), $ver, true );
	wp_enqueue_script( 'cut-narrator', $client_url . 'src/narrator.js', array( 'cut-renderer' ), $ver, true );
	wp_enqueue_script( 'cut-sequence', $client_url . 'src/sequence.js', array( 'cut-narrator' ), $ver, true );
}
add_action( 'admin_enqueue_scripts', 'cut_enqueue_assets' );
add_action( 'wp_enqueue_scripts', 'cut_enqueue_assets' );

// Admin menu
function cut_admin_menu() {
	add_management_page(
		__( 'Changelog Theatre', 'cut' ),
		__( 'Changelog Theatre', 'cut' ),
		'manage_options',
		'cut-theatre',
		'cut_render_admin_page'
	);
}
add_action( 'admin_menu', 'cut_admin_menu' );

// Render admin page wrapper
function cut_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions.', 'cut' ) );
	}
	require_once CUT_DIR . 'admin/page.php';
}

// Shortcode
require_once CUT_DIR . 'public/shortcode.php';
