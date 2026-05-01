<?php
/**
 * Class Relay_Server
 *
 * Registers REST routes for SSE and messages.
 * Handles SSE stream with session management and rate limiting.
 */
class Relay_Server {

	/**
	 * @var Relay_Tool_Registry
	 */
	private $registry;

	/**
	 * @var Relay_Auth
	 */
	private $auth;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->auth = new Relay_Auth();
	}

	/**
	 * Set the tool registry.
	 *
	 * @param Relay_Tool_Registry $registry Tool registry instance.
	 */
	public function set_registry( Relay_Tool_Registry $registry ) {
		$this->registry = $registry;
	}

	/**
	 * Register REST routes.
	 */
	public function register_routes() {
		register_rest_route(
			'agentbridge/v1',
			'/sse',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'handle_sse' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'agentbridge/v1',
			'/messages',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_message' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
	}

	/**
	 * Check permission for message endpoint.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return true|WP_Error
	 */
	public function check_permission( $request ) {
		$auth_header = $request->get_header( 'authorization' );
		if ( ! $auth_header || ! $this->auth->validate_token( $auth_header ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Invalid or missing bearer token.', 'agentbridge' ),
				array( 'status' => 401 )
			);
		}

		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to use AgentBridge.', 'agentbridge' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Handle SSE endpoint.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 */
	public function handle_sse( $request ) {
		// Rate limiting: max 10 connections per IP per 60 seconds
		$ip          = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		$rate_key    = 'agentbridge_rate_' . md5( $ip );
		$rate_count  = (int) get_transient( $rate_key );
		$max_connections = 10;
		$window      = 60;

		if ( $rate_count >= $max_connections ) {
			status_header( 429 );
			echo 'event: error\ndata: ' . wp_json_encode( array( 'error' => 'Rate limit exceeded. Try again later.' ) ) . "\n\n";
			exit;
		}

		set_transient( $rate_key, $rate_count + 1, $window );

		// Generate session ID
		$session_id = wp_generate_password( 32, false );
		set_transient( 'agentbridge_session_' . $session_id, array(), 300 );

		// Send SSE headers
		header( 'Content-Type: text/event-stream' );
		header( 'Cache-Control: no-cache' );
		header( 'Connection: keep-alive' );

		// Send initial endpoint event
		$this->send_event( $session_id, 'endpoint', array( 'session_id' => $session_id ) );

		// Keep connection alive
		$start_time = time();
		$max_lifetime = 300; // 5 minutes

		while ( true ) {
			if ( connection_aborted() || ( time() - $start_time ) > $max_lifetime ) {
				break;
			}

			// Check for messages in transient
			$messages = get_transient( 'agentbridge_messages_' . $session_id );
			if ( ! empty( $messages ) && is_array( $messages ) ) {
				foreach ( $messages as $message ) {
					$this->send_event( $session_id, 'message', $message );
				}
				delete_transient( 'agentbridge_messages_' . $session_id );
			}

			sleep( 1 );
			ob_flush();
			flush();
		}

		// Clean up session
		delete_transient( 'agentbridge_session_' . $session_id );
		exit;
	}

	/**
	 * Send an SSE event.
	 *
	 * @param string $session_id Session ID.
	 * @param string $event     Event name.
	 * @param mixed  $data      Event data.
	 */
	private function send_event( $session_id, $event, $data ) {
		echo 'event: ' . esc_attr( $event ) . "\n";
		echo 'data: ' . wp_json_encode( $data ) . "\n\n";
		ob_flush();
		flush();
	}

	/**
	 * Queue a message for a session.
	 *
	 * @param string $session_id Session ID.
	 * @param mixed  $data      Message data.
	 * @return bool
	 */
	public function queue_message( $session_id, $data ) {
		$messages = get_transient( 'agentbridge_messages_' . $session_id );
		if ( ! is_array( $messages ) ) {
			$messages = array();
		}
		$messages[] = $data;
		return set_transient( 'agentbridge_messages_' . $session_id, $messages, 300 );
	}

	/**
	 * Handle incoming JSON-RPC message.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_REST_Response
	 */
	public function handle_message( $request ) {
		$session_id = $request->get_param( 'session_id' );
		if ( empty( $session_id ) ) {
			return new WP_REST_Response(
				array(
					'jsonrpc' => '2.0',
					'error'   => array(
						'code'    => -32600,
						'message' => 'Invalid Request: missing session_id',
					),
					'id'      => null,
				),
				400
			);
		}

		$body = $request->get_body();
		$data = json_decode( $body, true );

		if ( null === $data || ! isset( $data['jsonrpc'] ) || '2.0' !== $data['jsonrpc'] ) {
			return new WP_REST_Response(
				array(
					'jsonrpc' => '2.0',
					'error'   => array(
						'code'    => -32600,
						'message' => 'Invalid Request',
					),
					'id'      => isset( $data['id'] ) ? $data['id'] : null,
				),
				400
			);
		}

		$handler = new Relay_Message_Handler( $this->registry, $this );
		$response = $handler->handle( $data );

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * Add CORS headers to REST responses.
	 *
	 * @param mixed $value Response value.
	 * @return mixed
	 */
	public function add_cors_headers( $value ) {
		$origins = apply_filters( 'relay_cors_origins', '*' );
		if ( is_array( $origins ) ) {
			$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '*';
			if ( in_array( $origin, $origins, true ) ) {
				header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
			}
		} else {
			header( 'Access-Control-Allow-Origin: ' . esc_attr( $origins ) );
		}
		return $value;
	}
}

// Add CORS headers filter
add_filter( 'rest_pre_serve_request', array( new Relay_Server(), 'add_cors_headers' ) );
