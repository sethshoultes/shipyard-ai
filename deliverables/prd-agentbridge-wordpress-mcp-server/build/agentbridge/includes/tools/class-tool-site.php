<?php
/**
 * Class Relay_Tool_Site
 *
 * Provides site information tool.
 */
class Relay_Tool_Site {

	/**
	 * Get tool schema.
	 *
	 * @return array
	 */
	public function get_schema() {
		return array(
			'description' => 'Get basic information about the WordPress site.',
			'parameters'  => array(
				'type'       => 'object',
				'properties' => array(),
			),
		);
	}

	/**
	 * Get site info.
	 *
	 * @param array $args Empty args.
	 * @return array
	 */
	public function get_site_info( $args ) {
		return array(
			'name'          => get_bloginfo( 'name' ),
			'description'   => get_bloginfo( 'description' ),
			'url'           => get_bloginfo( 'url' ),
			'wp_version'    => get_bloginfo( 'version' ),
			'is_multisite' => is_multisite(),
		);
	}
}
