<?php
/**
 * Plugin Name: AgentPipe
 * Description: Turn any WordPress site into an AI-native data source via the Model Context Protocol (MCP).
 * Version: 1.0.0
 * Author: Shipyard AI
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AGENTPIPE_VERSION', '1.0.0' );

define( 'AGENTPIPE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

require_once AGENTPIPE_PLUGIN_DIR . 'includes/class-cache.php';
require_once AGENTPIPE_PLUGIN_DIR . 'includes/class-resources.php';
require_once AGENTPIPE_PLUGIN_DIR . 'includes/class-search.php';
require_once AGENTPIPE_PLUGIN_DIR . 'includes/class-mcp-server.php';

function agentpipe_get_label( $default ) {
	if ( defined( 'AGENTPIPE_WHITE_LABEL' ) && AGENTPIPE_WHITE_LABEL && defined( 'AGENTPIPE_LABEL_NAME' ) ) {
		return AGENTPIPE_LABEL_NAME;
	}
	return $default;
}

function agentpipe_activate() {
	$key = bin2hex( random_bytes( 32 ) );
	update_option( 'agentpipe_api_key', $key, false );
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'agentpipe_activate' );

function agentpipe_deactivate() {
	delete_option( 'agentpipe_api_key' );
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'agentpipe_deactivate' );

function agentpipe_rest_route() {
	register_rest_route(
		'agentpipe/v1',
		'/mcp',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( 'AgentPipe_MCP_Server', 'handle_request' ),
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'agentpipe_rest_route' );

function agentpipe_admin_notice() {
	$screen = get_current_screen();
	if ( ! $screen || $screen->id !== 'dashboard' ) {
		return;
	}

	$notice_dismissed = get_option( 'agentpipe_notice_dismissed', false );
	if ( $notice_dismissed ) {
		return;
	}

	$key = get_option( 'agentpipe_api_key', '' );
	if ( empty( $key ) ) {
		return;
	}

	$label  = agentpipe_get_label( 'AgentPipe' );
	$mcp_url = esc_url_raw( rest_url( 'agentpipe/v1/mcp' ) );
	?>
	<div class="notice notice-success is-dismissible" id="agentpipe-notice">
		<p>
			<strong><?php echo esc_html( $label ); ?></strong> &mdash;
			<?php esc_html_e( 'Your site is now an AI data source. Copy this URL into Claude Desktop:', 'agentpipe' ); ?>
			<code id="agentpipe-mcp-url">POST <?php echo esc_html( $mcp_url ); ?></code>
			<button type="button" class="button" id="agentpipe-copy-btn"><?php esc_html_e( 'Copy URL', 'agentpipe' ); ?></button>
		</p>
	</div>
	<?php
}
add_action( 'admin_notices', 'agentpipe_admin_notice' );

function agentpipe_admin_assets( $hook ) {
	if ( 'index.php' !== $hook ) {
		return;
	}
	wp_enqueue_script(
		'agentpipe-activation',
		plugin_dir_url( __FILE__ ) . 'assets/js/activation.js',
		array(),
		AGENTPIPE_VERSION,
		true
	);
}
add_action( 'admin_enqueue_scripts', 'agentpipe_admin_assets' );