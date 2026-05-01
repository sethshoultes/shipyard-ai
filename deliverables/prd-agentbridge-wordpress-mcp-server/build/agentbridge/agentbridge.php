<?php
/**
 * Plugin Name: AgentBridge
 * Plugin URI: https://github.com/shipyard-ai/agentbridge-wordpress-mcp-server
 * Description: Connects AI agents to your WordPress site via the Model Context Protocol (MCP).
 * Version: 1.0.0
 * Author: Shipyard AI
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: agentbridge
 * Domain Path: /languages
 * Requires at least: 6.5
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AGENTBRIDGE_VERSION', '1.0.0' );
define( 'AGENTBRIDGE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AGENTBRIDGE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Class autoloader
spl_autoload_register( function ( $class ) {
	$prefix = 'Relay_';
	$base_dir = AGENTBRIDGE_PLUGIN_DIR . 'includes/';

	$len = strlen( $prefix );
	if ( strncmp( $prefix, $class, $len ) !== 0 ) {
		return;
	}

	$relative_class = strtolower( substr( $class, $len ) );
	$file = $base_dir . 'class-' . str_replace( '_', '-', $relative_class ) . '.php';

	if ( file_exists( $file ) ) {
		require $file;
	}
} );

// Tool classes autoloader
spl_autoload_register( function ( $class ) {
	$prefix = 'Relay_Tool_';
	$base_dir = AGENTBRIDGE_PLUGIN_DIR . 'includes/tools/';

	$len = strlen( $prefix );
	if ( strncmp( $prefix, $class, $len ) !== 0 ) {
		return;
	}

	$relative_class = strtolower( substr( $class, $len ) );
	$file = $base_dir . 'class-tool-' . str_replace( '_', '-', $relative_class ) . '.php';

	if ( file_exists( $file ) ) {
		require $file;
	}
} );

/**
 * Activation hook: generate initial API token and store hashed.
 */
function agentbridge_activate() {
	$token = wp_generate_password( 32, false );
	$hashed = wp_hash_password( $token );
	update_option( 'agentbridge_api_key', $hashed );

	// Store the raw token in a transient so the admin can see it once
	set_transient( 'agentbridge_api_key_raw', $token, 300 );
}
register_activation_hook( __FILE__, 'agentbridge_activate' );

/**
 * Deactivation hook: clean up transients.
 */
function agentbridge_deactivate() {
	global $wpdb;
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_agentbridge_%'" );
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_agentbridge_%'" );
}
register_deactivation_hook( __FILE__, 'agentbridge_deactivate' );

/**
 * Initialize the plugin.
 */
function agentbridge_init() {
	$server = new Relay_Server();
	$server->register_routes();

	$registry = new Relay_Tool_Registry();

	$site_tool = new Relay_Tool_Site();
	$registry->register( 'get_site_info', $site_tool->get_schema(), array( $site_tool, 'get_site_info' ) );

	$posts_tool = new Relay_Tool_Posts();
	$registry->register( 'list_posts', $posts_tool->get_schema(), array( $posts_tool, 'list_posts' ) );
	$registry->register( 'get_post', $posts_tool->get_schema(), array( $posts_tool, 'get_post' ) );
	$registry->register( 'create_post', $posts_tool->get_schema(), array( $posts_tool, 'create_post' ) );
	$registry->register( 'update_post', $posts_tool->get_schema(), array( $posts_tool, 'update_post' ) );
	$registry->register( 'delete_post', $posts_tool->get_schema(), array( $posts_tool, 'delete_post' ) );

	$media_tool = new Relay_Tool_Media();
	$registry->register( 'list_media', $media_tool->get_schema(), array( $media_tool, 'list_media' ) );

	$server->set_registry( $registry );
}
add_action( 'rest_api_init', 'agentbridge_init' );

/**
 * Admin initialization.
 */
function agentbridge_admin_init() {
	if ( is_admin() ) {
		require_once AGENTBRIDGE_PLUGIN_DIR . 'admin/admin.php';
	}
}
add_action( 'init', 'agentbridge_admin_init' );
