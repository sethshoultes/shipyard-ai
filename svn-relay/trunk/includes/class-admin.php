<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay_Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
		add_action( 'admin_notices', array( __CLASS__, 'api_key_notice' ) );
		add_action( 'admin_notices', array( __CLASS__, 'cron_notice' ) );
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'add_dashboard_widget' ) );
		add_action( 'admin_post_relay_purge_cache', array( __CLASS__, 'handle_purge_cache' ) );
	}

	public static function register_menu() {
		add_menu_page(
			__( 'Relay', 'relay' ),
			__( 'Relay', 'relay' ),
			'manage_options',
			'relay',
			array( __CLASS__, 'render_inbox' ),
			RELAY_PLUGIN_URL . 'assets/relay-badge.svg',
			30
		);

		add_submenu_page(
			'relay',
			__( 'Inbox', 'relay' ),
			__( 'Inbox', 'relay' ),
			'manage_options',
			'relay',
			array( __CLASS__, 'render_inbox' )
		);

		add_submenu_page(
			'relay',
			__( 'Settings', 'relay' ),
			__( 'Settings', 'relay' ),
			'manage_options',
			'relay-settings',
			array( __CLASS__, 'render_settings' )
		);
	}

	public static function register_settings() {
		register_setting(
			'relay_options',
			'relay_options',
			array(
				'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ),
			)
		);
	}

	public static function sanitize_settings( $input ) {
		$options = get_option( 'relay_options', array() );

		if ( ! empty( $input['relay_api_key'] ) ) {
			$encrypted = relay_encrypt_api_key( sanitize_text_field( $input['relay_api_key'] ) );
			if ( false !== $encrypted ) {
				$options['relay_api_key'] = $encrypted;
			}
		}

		$options['relay_secret_token']  = ! empty( $input['relay_secret_token'] ) ? sanitize_text_field( $input['relay_secret_token'] ) : '';
		$options['relay_sales_email']   = ! empty( $input['relay_sales_email'] ) ? sanitize_email( $input['relay_sales_email'] ) : '';
		$options['relay_support_email'] = ! empty( $input['relay_support_email'] ) ? sanitize_email( $input['relay_support_email'] ) : '';
		$options['relay_general_email'] = ! empty( $input['relay_general_email'] ) ? sanitize_email( $input['relay_general_email'] ) : '';

		$options['cf7_integration']  = ! empty( $input['cf7_integration'] ) ? 1 : 0;
		$options['rest_integration'] = ! empty( $input['rest_integration'] ) ? 1 : 0;

		return $options;
	}

	public static function enqueue_assets( $hook ) {
		if ( false === strpos( $hook, 'relay' ) ) {
			return;
		}

		wp_enqueue_style( 'relay-admin-css', RELAY_PLUGIN_URL . 'admin/css/relay-admin.css', array(), RELAY_VERSION );
		wp_enqueue_script( 'relay-admin-js', RELAY_PLUGIN_URL . 'admin/js/relay-admin.js', array( 'jquery' ), RELAY_VERSION, true );

		wp_localize_script( 'relay-admin-js', 'relay_admin_ajax', array(
			'ajax_url'   => admin_url( 'admin-ajax.php' ),
			'rest_url'   => rest_url(),
			'nonce'      => wp_create_nonce( 'relay_action' ),
			'rest_nonce' => wp_create_nonce( 'wp_rest' ),
		) );
	}

	public static function render_inbox() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'relay' ) );
		}

		require_once RELAY_PLUGIN_DIR . 'admin/views/inbox.php';
	}

	public static function render_settings() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'relay' ) );
		}

		require_once RELAY_PLUGIN_DIR . 'admin/views/settings.php';
	}

	public static function api_key_notice() {
		$key = relay_decrypt_api_key();
		if ( empty( $key ) ) {
			echo '<div class="notice notice-warning"><p>';
			printf(
				/* translators: %s: Settings page URL */
				esc_html__( 'Relay needs a Claude API key. %s', 'relay' ),
				'<a href="' . esc_url( admin_url( 'admin.php?page=relay-settings' ) ) . '">' . esc_html__( 'Go to Settings', 'relay' ) . '</a>'
			);
			echo '</p></div>';
		}
	}

	public static function cron_notice() {
		$last_run = get_option( 'relay_last_cron_run', 0 );
		if ( $last_run < time() - 1800 ) {
			echo '<div class="notice notice-warning"><p>';
			esc_html_e( 'WP Cron has not run recently. For reliable lead classification, please configure a server-side cron.', 'relay' );
			echo '</p></div>';
		}
	}

	public static function add_dashboard_widget() {
		wp_add_dashboard_widget(
			'relay_dashboard_widget',
			__( 'Relay Lead Processor', 'relay' ),
			array( __CLASS__, 'render_dashboard_widget' )
		);
	}

	public static function render_dashboard_widget() {
		$pending = get_posts( array(
			'post_type'      => 'relay_lead',
			'posts_per_page' => -1,
			'meta_key'       => '_relay_status',
			'meta_value'     => 'pending',
			'fields'         => 'ids',
		) );

		echo '<p>' . esc_html__( 'Pending classifications:', 'relay' ) . ' <strong class="relay-pending-count">' . esc_html( count( $pending ) ) . '</strong></p>';
		echo '<button id="relay-process-now" class="button button-primary">' . esc_html__( 'Process Now', 'relay' ) . '</button>';
		echo '<span id="relay-process-status" style="margin-left:8px;"></span>';
	}

	public static function handle_purge_cache() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'relay' ) );
		}

		check_admin_referer( 'relay_action', 'relay_nonce' );

		if ( class_exists( 'Relay_Cache' ) ) {
			Relay_Cache::purge();
		}

		wp_redirect( admin_url( 'admin.php?page=relay-settings&cache_purged=1' ) );
		exit;
	}
}

/**
 * Encrypt API key.
 *
 * @param string $key Raw API key.
 * @return string|false Encrypted string or false.
 */
function relay_encrypt_api_key( $key ) {
	$auth_key   = defined( 'AUTH_KEY' ) ? AUTH_KEY : wp_salt( 'auth' );
	$secure_key = defined( 'SECURE_AUTH_KEY' ) ? SECURE_AUTH_KEY : wp_salt( 'secure_auth' );
	$secret     = substr( hash_hmac( 'sha256', $auth_key . $secure_key, 'relay' ), 0, 32 );

	$iv_length = openssl_cipher_iv_length( 'aes-256-cbc' );
	$iv        = openssl_random_pseudo_bytes( $iv_length );
	$encrypted = openssl_encrypt( $key, 'aes-256-cbc', $secret, 0, $iv );
	if ( false === $encrypted ) {
		return false;
	}

	return bin2hex( $iv . $encrypted );
}

/**
 * Decrypt API key.
 *
 * @return string|null Decrypted key or null.
 */
function relay_decrypt_api_key() {
	if ( defined( 'RELAY_API_KEY' ) && ! empty( RELAY_API_KEY ) ) {
		return RELAY_API_KEY;
	}

	$options = get_option( 'relay_options' );
	if ( empty( $options['relay_api_key'] ) ) {
		return null;
	}

	$combined = hex2bin( $options['relay_api_key'] );
	if ( false === $combined ) {
		return null;
	}

	$iv_length = openssl_cipher_iv_length( 'aes-256-cbc' );
	$iv        = substr( $combined, 0, $iv_length );
	$encrypted = substr( $combined, $iv_length );

	$auth_key   = defined( 'AUTH_KEY' ) ? AUTH_KEY : wp_salt( 'auth' );
	$secure_key = defined( 'SECURE_AUTH_KEY' ) ? SECURE_AUTH_KEY : wp_salt( 'secure_auth' );
	$secret     = substr( hash_hmac( 'sha256', $auth_key . $secure_key, 'relay' ), 0, 32 );

	$decrypted = openssl_decrypt( $encrypted, 'aes-256-cbc', $secret, 0, $iv );
	return $decrypted;
}
