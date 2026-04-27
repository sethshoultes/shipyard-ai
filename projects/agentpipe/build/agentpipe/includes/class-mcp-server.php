<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AgentPipe_MCP_Server {

	const PROTOCOL_VERSION = '2024-11-05';

	public static function handle_request( $request ) {
		$headers = $request->get_headers();
		$key_header = isset( $headers['x_agentpipe_key'] ) ? $headers['x_agentpipe_key'] : '';
		if ( is_array( $key_header ) ) {
			$key_header = reset( $key_header );
		}

		$stored_key = get_option( 'agentpipe_api_key', '' );
		if ( empty( $stored_key ) || $key_header !== $stored_key ) {
			return self::error_response( -32002, 'Unauthorized', null );
		}

		$body = $request->get_body();
		$json = json_decode( $body, true );
		if ( null === $json || ! is_array( $json ) ) {
			return self::error_response( -32600, 'Invalid request', null );
		}

		$id     = isset( $json['id'] ) ? $json['id'] : null;
		$method = isset( $json['method'] ) ? $json['method'] : '';
		$params = isset( $json['params'] ) && is_array( $json['params'] ) ? $json['params'] : array();

		if ( ! isset( $json['jsonrpc'] ) || $json['jsonrpc'] !== '2.0' ) {
			return self::error_response( -32600, 'Invalid request', $id );
		}

		switch ( $method ) {
			case 'initialize':
				return self::success_response( $id, self::handle_initialize() );

			case 'resources/list':
				$cursor = isset( $params['cursor'] ) ? $params['cursor'] : '';
				return self::success_response( $id, AgentPipe_Resources::list_resources( $cursor ) );

			case 'resources/read':
				$uri = isset( $params['uri'] ) ? $params['uri'] : '';
				$result = AgentPipe_Resources::read_resource( $uri );
				if ( is_wp_error( $result ) ) {
					return self::error_response( -32001, $result->get_error_message(), $id );
				}
				return self::success_response( $id, $result );

			case 'tools/search':
				$search_query = isset( $params['query'] ) ? $params['query'] : '';
				$content_types = isset( $params['content_types'] ) ? $params['content_types'] : array();
				$limit = isset( $params['limit'] ) ? $params['limit'] : AgentPipe_Search::DEFAULT_LIMIT;
				return self::success_response( $id, array( 'results' => AgentPipe_Search::search( $search_query, $content_types, $limit ) ) );

			default:
				return self::error_response( -32601, 'Method not found', $id );
		}
	}

	private static function handle_initialize() {
		return array(
			'protocolVersion' => self::PROTOCOL_VERSION,
			'capabilities'    => array(
				'resources' => array(
					'list' => true,
					'read' => true,
				),
				'tools' => array(
					'list' => false,
				),
			),
		);
	}

	private static function success_response( $id, $result ) {
		return new WP_REST_Response(
			array(
				'jsonrpc' => '2.0',
				'id'      => $id,
				'result'  => $result,
			),
			200
		);
	}

	private static function error_response( $code, $message, $id ) {
		return new WP_REST_Response(
			array(
				'jsonrpc' => '2.0',
				'id'      => $id,
				'error'   => array(
					'code'    => $code,
					'message' => $message,
				),
			),
			200
		);
	}
}
