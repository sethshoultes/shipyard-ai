<?php
/**
 * Admin page for AgentBridge.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Tools → Relay menu page.
 */
function agentbridge_add_admin_menu() {
	add_management_page(
		__( 'AgentBridge', 'agentbridge' ),
		__( 'Relay', 'agentbridge' ),
		'manage_options',
		'agentbridge',
		'agentbridge_render_admin_page'
	);
}
add_action( 'admin_menu', 'agentbridge_add_admin_menu' );

/**
 * Enqueue admin scripts.
 *
 * @param string $hook Current admin page hook.
 */
function agentbridge_enqueue_admin_assets( $hook ) {
	if ( 'tools_page_agentbridge' !== $hook ) {
		return;
	}

	wp_enqueue_script(
		'agentbridge-dashboard',
		AGENTBRIDGE_PLUGIN_URL . 'admin/js/dashboard.js',
		array(),
		AGENTBRIDGE_VERSION,
		true
	);

	wp_localize_script(
		'agentbridge-dashboard',
		'agentbridgeData',
		array(
			'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
			'restUrl'   => rest_url( 'agentbridge/v1' ),
			'nonce'     => wp_create_nonce( 'agentbridge_admin' ),
			'siteUrl'   => get_bloginfo( 'url' ),
			'token'     => agentbridge_get_masked_token(),
			'apiKeySet' => (bool) get_option( 'agentbridge_api_key' ),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'agentbridge_enqueue_admin_assets' );

/**
 * Get masked token for display.
 *
 * @return string
 */
function agentbridge_get_masked_token() {
	$raw = get_transient( 'agentbridge_api_key_raw' );
	if ( $raw ) {
		return $raw;
	}
	return __( 'Token hidden. Click regenerate to create a new one.', 'agentbridge' );
}

/**
 * AJAX handler to regenerate token.
 */
function agentbridge_ajax_regenerate_token() {
	check_ajax_referer( 'agentbridge_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => __( 'Permission denied.', 'agentbridge' ) ) );
	}

	$token = wp_generate_password( 32, false );
	$hashed = wp_hash_password( $token );
	update_option( 'agentbridge_api_key', $hashed );
	set_transient( 'agentbridge_api_key_raw', $token, 300 );

	wp_send_json_success( array( 'token' => $token ) );
}
add_action( 'wp_ajax_agentbridge_regenerate_token', 'agentbridge_ajax_regenerate_token' );

/**
 * Render the admin page.
 */
function agentbridge_render_admin_page() {
	$site_url   = get_bloginfo( 'url' );
	$sse_url    = rest_url( 'agentbridge/v1/sse' );
	$token       = agentbridge_get_masked_token();
	$masked      = ( strpos( $token, 'Token hidden' ) === 0 );

	// Build config snippet for Claude Desktop / Cursor
	$config = array(
		'mcpServers' => array(
			'wordpress' => array(
				'url'     => $sse_url,
				'headers' => array(
					'Authorization' => 'Bearer ' . ( $masked ? 'YOUR_TOKEN_HERE' : $token ),
				),
			),
		),
	);
	?>
	<div class="wrap agentbridge-admin">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

		<div class="agentbridge-card">
			<h2><?php _e( 'Your site is now listening.', 'agentbridge' ); ?></h2>
			<p><?php _e( 'Copy the details below into your MCP client.', 'agentbridge' ); ?></p>

			<div class="agentbridge-field">
				<label for="agentbridge-endpoint"><?php _e( 'Endpoint URL', 'agentbridge' ); ?></label>
				<div class="agentbridge-input-group">
					<input type="text" id="agentbridge-endpoint" class="regular-text" value="<?php echo esc_url( $sse_url ); ?>" readonly>
					<button type="button" class="button agentbridge-copy" data-target="agentbridge-endpoint">
						<?php _e( 'Copy', 'agentbridge' ); ?>
					</button>
				</div>
			</div>

			<div class="agentbridge-field">
				<label for="agentbridge-token"><?php _e( 'API Token', 'agentbridge' ); ?></label>
				<div class="agentbridge-input-group">
					<input type="text" id="agentbridge-token" class="regular-text" value="<?php echo esc_attr( $token ); ?>" readonly>
					<button type="button" class="button agentbridge-copy" data-target="agentbridge-token">
						<?php _e( 'Copy', 'agentbridge' ); ?>
					</button>
					<button type="button" class="button" id="agentbridge-regenerate">
						<?php _e( 'Regenerate', 'agentbridge' ); ?>
					</button>
				</div>
			</div>

			<div class="agentbridge-field">
				<label for="agentbridge-config"><?php _e( 'Config Snippet (Claude Desktop / Cursor)', 'agentbridge' ); ?></label>
				<textarea id="agentbridge-config" class="large-text" rows="8" readonly><?php echo esc_textarea( wp_json_encode( $config, JSON_PRETTY_PRINT ) ); ?></textarea>
				<button type="button" class="button agentbridge-copy" data-target="agentbridge-config">
					<?php _e( 'Copy Config', 'agentbridge' ); ?>
				</button>
			</div>
		</div>
	</div>

	<style>
		.agentbridge-admin {
			max-width: 600px;
		}
		.agentbridge-card {
			background: #fff;
			padding: 20px;
			margin-top: 20px;
			box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		}
		.agentbridge-field {
			margin-bottom: 20px;
		}
		.agentbridge-field label {
			display: block;
			font-weight: 600;
			margin-bottom: 5px;
		}
		.agentbridge-input-group {
			display: flex;
			gap: 8px;
			align-items: center;
		}
		.agentbridge-input-group input,
		.agentbridge-input-group textarea {
			flex: 1;
		}
		.agentbridge-copy.copied::after {
			content: ' <?php _e( 'Copied!', 'agentbridge' ); ?>';
			color: #4CAF50;
			margin-left: 8px;
		}
	</style>
	<?php
}
