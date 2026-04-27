<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AgentPipe_Cache {

	const GROUP = 'agentpipe';
	const TTL_LIST = 300;
	const TTL_READ = 60;
	const TTL_SEARCH = 0;

	public static function is_available() {
		return wp_using_ext_object_cache();
	}

	public static function get( $key ) {
		if ( ! self::is_available() ) {
			return false;
		}
		return wp_cache_get( $key, self::GROUP );
	}

	public static function set( $key, $value, $ttl ) {
		if ( ! self::is_available() ) {
			return false;
		}
		return wp_cache_set( $key, $value, self::GROUP, $ttl );
	}

	public static function delete( $key ) {
		if ( ! self::is_available() ) {
			return false;
		}
		return wp_cache_delete( $key, self::GROUP );
	}

	public static function key( $prefix, $suffix = '' ) {
		return $prefix . ( $suffix ? '_' . md5( $suffix ) : '' );
	}
}
