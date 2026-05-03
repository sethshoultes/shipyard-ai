<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay_Cache {

	const TTL = DAY_IN_SECONDS;
	const OPTION_PREFIX = 'relay_cache_';

	public static function init() {
		add_action( 'relay_cache_cleanup', array( __CLASS__, 'cleanup' ) );
		if ( ! wp_next_scheduled( 'relay_cache_cleanup' ) ) {
			wp_schedule_event( time(), 'daily', 'relay_cache_cleanup' );
		}
	}

	public static function get( $content ) {
		$hash  = self::hash( $content );
		$key   = self::OPTION_PREFIX . $hash;
		$value = get_option( $key );

		if ( false === $value ) {
			return false;
		}

		if ( ! is_array( $value ) || ! isset( $value['expires'], $value['data'] ) ) {
			delete_option( $key );
			return false;
		}

		if ( time() > $value['expires'] ) {
			delete_option( $key );
			return false;
		}

		return $value['data'];
	}

	public static function set( $content, $data ) {
		$hash = self::hash( $content );
		$key  = self::OPTION_PREFIX . $hash;

		update_option(
			$key,
			array(
				'expires' => time() + self::TTL,
				'data'    => $data,
			),
			false
		);
	}

	public static function purge() {
		global $wpdb;
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( self::OPTION_PREFIX ) . '%'
			)
		);
	}

	public static function cleanup() {
		global $wpdb;
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( self::OPTION_PREFIX ) . '%'
			),
			ARRAY_A
		);

		if ( empty( $results ) || ! is_array( $results ) ) {
			return;
		}

		foreach ( $results as $row ) {
			$value = maybe_unserialize( $row['option_value'] );
			if ( ! is_array( $value ) || ! isset( $value['expires'] ) || time() > $value['expires'] ) {
				delete_option( $row['option_name'] );
			}
		}
	}

	private static function hash( $content ) {
		return hash( 'sha256', $content );
	}
}
