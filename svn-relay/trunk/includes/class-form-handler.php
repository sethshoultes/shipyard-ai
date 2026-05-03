<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay_Form_Handler {

	public static function init() {
		add_action( 'wpcf7_before_send_mail', array( __CLASS__, 'handle_cf7' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		add_action( 'wp_ajax_relay_process_now', array( __CLASS__, 'ajax_process_now' ) );
	}

	public static function handle_cf7( $contact_form ) {
		$options = get_option( 'relay_options', array() );
		if ( empty( $options['cf7_integration'] ) ) {
			return;
		}

		$submission = WPCF7_Submission::get_instance();
		if ( ! $submission ) {
			return;
		}

		$data = $submission->get_posted_data();
		if ( empty( $data ) || ! is_array( $data ) ) {
			return;
		}

		$lead = array(
			'name'    => isset( $data['your-name'] ) ? sanitize_text_field( $data['your-name'] ) : '',
			'email'   => isset( $data['your-email'] ) ? sanitize_email( $data['your-email'] ) : '',
			'message' => isset( $data['your-message'] ) ? sanitize_textarea_field( $data['your-message'] ) : '',
			'source'  => 'cf7',
		);

		self::create_lead_and_spawn( $lead );
	}

	public static function register_rest_routes() {
		register_rest_route(
			'relay/v1',
			'/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_submit' ),
				'permission_callback' => array( __CLASS__, 'rest_submit_permission' ),
			)
		);

		register_rest_route(
			'relay/v1',
			'/inbox-poll',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_inbox_poll' ),
				'permission_callback' => array( __CLASS__, 'rest_admin_permission' ),
			)
		);
	}

	public static function rest_submit_permission( $request ) {
		$options = get_option( 'relay_options', array() );
		if ( empty( $options['rest_integration'] ) ) {
			return new WP_Error(
				'relay_rest_disabled',
				__( 'REST integration is disabled.', 'relay' ),
				array( 'status' => 403 )
			);
		}

		$nonce = $request->get_header( 'x_wp_nonce' );
		if ( $nonce && wp_verify_nonce( sanitize_text_field( $nonce ), 'wp_rest' ) ) {
			return true;
		}

		$token = $request->get_header( 'x-relay-token' );
		if ( ! empty( $options['relay_secret_token'] ) && $token && hash_equals( $options['relay_secret_token'], sanitize_text_field( $token ) ) ) {
			return true;
		}

		return new WP_Error(
			'relay_forbidden',
			__( 'Invalid or missing authentication.', 'relay' ),
			array( 'status' => 403 )
		);
	}

	public static function rest_admin_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'relay_forbidden',
				__( 'You do not have permission to access this resource.', 'relay' ),
				array( 'status' => 403 )
			);
		}
		return true;
	}

	public static function rest_submit( $request ) {
		$params = $request->get_json_params();
		if ( empty( $params ) ) {
			$params = $request->get_body_params();
		}

		$lead = array(
			'name'    => isset( $params['name'] ) ? sanitize_text_field( $params['name'] ) : '',
			'email'   => isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '',
			'message' => isset( $params['message'] ) ? sanitize_textarea_field( $params['message'] ) : '',
			'source'  => 'rest',
		);

		$post_id = self::create_lead_and_spawn( $lead );

		if ( false === $post_id ) {
			return new WP_Error(
				'relay_create_failed',
				__( 'Failed to create lead.', 'relay' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'lead_id' => $post_id,
			),
			200
		);
	}

	public static function rest_inbox_poll() {
		$pending = get_posts( array(
			'post_type'      => 'relay_lead',
			'posts_per_page' => -1,
			'meta_key'       => '_relay_status',
			'meta_value'     => 'pending',
			'fields'         => 'ids',
		) );

		$recent = get_posts( array(
			'post_type'      => 'relay_lead',
			'posts_per_page' => 5,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'fields'         => 'ids',
		) );

		$leads = array();
		foreach ( $recent as $post_id ) {
			$leads[] = array(
				'id'     => $post_id,
				'title'  => get_the_title( $post_id ),
				'email'  => get_post_meta( $post_id, '_relay_email', true ),
				'status' => get_post_meta( $post_id, '_relay_status', true ),
			);
		}

		return new WP_REST_Response(
			array(
				'pending_count' => count( $pending ),
				'recent'        => $leads,
			),
			200
		);
	}

	private static function create_lead_and_spawn( $lead ) {
		if ( ! class_exists( 'Relay_Storage' ) ) {
			require_once RELAY_PLUGIN_DIR . 'includes/class-storage.php';
		}

		$post_id = Relay_Storage::create_lead( $lead );

		if ( $post_id ) {
			update_option( 'relay_last_cron_run', time() );
			if ( function_exists( 'spawn_cron' ) ) {
				spawn_cron();
			}
		}

		return $post_id;
	}

	public static function ajax_process_now() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'relay' ) ) );
		}

		check_ajax_referer( 'relay_action', 'relay_nonce' );

		if ( class_exists( 'Relay_Async_Processor' ) ) {
			Relay_Async_Processor::process_batch();
		}

		wp_send_json_success( array( 'message' => __( 'Processing complete.', 'relay' ) ) );
	}
}
