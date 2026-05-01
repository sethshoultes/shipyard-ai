<?php
/**
 * Class Relay_Message_Handler
 *
 * Parses JSON-RPC requests and routes to appropriate handlers.
 */
class Relay_Message_Handler {

	/**
	 * @var Relay_Tool_Registry
	 */
	private $registry;

	/**
	 * @var Relay_Server
	 */
	private $server;

	/**
	 * Constructor.
	 *
	 * @param Relay_Tool_Registry $registry Tool registry.
	 * @param Relay_Server         $server   Server instance for queuing responses.
	 */
	public function __construct( Relay_Tool_Registry $registry, Relay_Server $server ) {
		$this->registry = $registry;
		$this->server  = $server;
	}

	/**
	 * Handle JSON-RPC request.
	 *
	 * @param array $data Decoded JSON-RPC request.
	 * @return array
	 */
	public function handle( $data ) {
		if ( ! isset( $data['method'] ) ) {
			return array(
				'jsonrpc' => '2.0',
				'error'   => array(
					'code'    => -32600,
					'message' => 'Invalid Request: missing method',
				),
				'id'      => isset( $data['id'] ) ? $data['id'] : null,
			);
		}

		$method = $data['method'];
		$params = isset( $data['params'] ) ? $data['params'] : array();
		$id     = isset( $data['id'] ) ? $data['id'] : null;

		switch ( $method ) {
			case 'initialize':
				return $this->handle_initialize( $id, $params );

			case 'tools/list':
				return $this->handle_tools_list( $id );

			case 'tools/call':
				return $this->handle_tools_call( $id, $params );

			default:
				return array(
					'jsonrpc' => '2.0',
					'error'   => array(
						'code'    => -32601,
						'message' => 'Method not found: ' . $method,
					),
					'id'      => $id,
				);
		}
	}

	/**
	 * Handle initialize method.
	 *
	 * @param string|int|null $id     Request ID.
	 * @param array          $params Request params.
	 * @return array
	 */
	private function handle_initialize( $id, $params ) {
		$protocol_version = isset( $params['protocolVersion'] ) ? $params['protocolVersion'] : '2024-11-05';

		return array(
			'jsonrpc' => '2.0',
			'id'      => $id,
			'result'  => array(
				'protocolVersion' => '2024-11-05',
				'serverInfo'      => array(
					'name'    => 'agentbridge',
					'version' => '1.0.0',
				),
			),
		);
	}

	/**
	 * Handle tools/list method.
	 *
	 * @param string|int|null $id Request ID.
	 * @return array
	 */
	private function handle_tools_list( $id ) {
		$tools = $this->registry->get_all();
		return array(
			'jsonrpc' => '2.0',
			'id'      => $id,
			'result'  => array(
				'tools' => $tools,
			),
		);
	}

	/**
	 * Handle tools/call method.
	 *
	 * @param string|int|null $id     Request ID.
	 * @param array          $params Request params.
	 * @return array
	 */
	private function handle_tools_call( $id, $params ) {
		if ( ! isset( $params['name'] ) ) {
			return array(
				'jsonrpc' => '2.0',
				'error'   => array(
					'code'    => -32602,
					'message' => 'Invalid params: missing name',
				),
				'id'      => $id,
			);
		}

		$name = $params['name'];
		$args = isset( $params['arguments'] ) ? $params['arguments'] : array();

		// Validate arguments against schema
		$schema = $this->registry->get_schema( $name );
		if ( $schema && isset( $schema['parameters'] ) ) {
			$required = isset( $schema['parameters']['required'] ) ? $schema['parameters']['required'] : array();
			foreach ( $required as $param ) {
				if ( ! isset( $args[ $param ] ) ) {
					return array(
						'jsonrpc' => '2.0',
						'error'   => array(
							'code'    => -32602,
							'message' => 'Invalid params: missing required argument ' . $param,
						),
						'id'      => $id,
					);
				}
			}
		}

		try {
			$result = $this->registry->call( $name, $args );
			return array(
				'jsonrpc' => '2.0',
				'id'      => $id,
				'result'  => $result,
			);
		} catch ( Exception $e ) {
			return array(
				'jsonrpc' => '2.0',
				'error'   => array(
					'code'    => -32603,
					'message' => $e->getMessage(),
				),
				'id'      => $id,
			);
		}
	}
}
