<?php
/**
 * Class Relay_Tool_Registry
 *
 * Registers and dispatches MCP tools.
 */
class Relay_Tool_Registry {

	/**
	 * @var array Registered tools.
	 */
	private $tools = array();

	/**
	 * @var array Tool schemas.
	 */
	private $schemas = array();

	/**
	 * Register a tool.
	 *
	 * @param string   $name     Tool name.
	 * @param array    $schema   JSON Schema for the tool.
	 * @param callable $callback Function to call.
	 */
	public function register( $name, $schema, $callback ) {
		$this->tools[ $name ]   = $callback;
		$this->schemas[ $name ] = $schema;
	}

	/**
	 * Get all registered tool schemas.
	 *
	 * @return array
	 */
	public function get_all() {
		$tools = array();
		foreach ( $this->schemas as $name => $schema ) {
			$tools[] = array_merge(
				array( 'name' => $name ),
				$schema
			);
		}
		return $tools;
	}

	/**
	 * Get schema for a specific tool.
	 *
	 * @param string $name Tool name.
	 * @return array|null
	 */
	public function get_schema( $name ) {
		return isset( $this->schemas[ $name ] ) ? $this->schemas[ $name ] : null;
	}

	/**
	 * Call a tool.
	 *
	 * @param string $name Tool name.
	 * @param array  $args  Tool arguments.
	 * @return mixed
	 * @throws Exception If tool not found or callback fails.
	 */
	public function call( $name, $args ) {
		if ( ! isset( $this->tools[ $name ] ) ) {
			throw new Exception( 'Tool not found: ' . $name );
		}

		$callback = $this->tools[ $name ];
		if ( ! is_callable( $callback ) ) {
			throw new Exception( 'Tool callback not callable: ' . $name );
		}

		return call_user_func( $callback, $args );
	}
}
