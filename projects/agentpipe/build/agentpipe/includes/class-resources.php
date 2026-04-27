<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AgentPipe_Resources {

	const PAGE_SIZE = 1000;

	public static function list_resources( $cursor = '' ) {
		$cache_key = AgentPipe_Cache::key( 'list', $cursor );
		$cached = AgentPipe_Cache::get( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		$where = "WHERE post_status = 'publish' AND post_type IN ('post', 'page')";
		$order = 'ORDER BY post_date DESC, ID DESC';
		$limit = 'LIMIT ' . self::PAGE_SIZE;

		$args = array();
		if ( $cursor !== '' ) {
			$decoded = self::decode_cursor( $cursor );
			if ( false !== $decoded ) {
				$where .= " AND (post_date < %s OR (post_date = %s AND ID < %d))";
				$args[] = $decoded['date'];
				$args[] = $decoded['date'];
				$args[] = $decoded['id'];
			}
		}

		$sql = "SELECT ID, post_title, post_type FROM {$wpdb->posts} {$where} {$order} {$limit}";
		if ( ! empty( $args ) ) {
			$sql = $wpdb->prepare( $sql, $args );
		}

		$results = $wpdb->get_results( $sql );
		if ( ! is_array( $results ) ) {
			$results = array();
		}

		$resources = array();
		foreach ( $results as $row ) {
			$prefix = $row->post_type === 'page' ? 'site://page/' : 'site://post/';
			$resources[] = array(
				'uri'      => $prefix . (int) $row->ID,
				'mimeType' => 'application/json',
				'name'     => $row->post_title ?: '(no title)',
			);
		}

		$next_cursor = null;
		if ( count( $results ) === self::PAGE_SIZE ) {
			$last = end( $results );
			$next_cursor = self::encode_cursor( $last->post_date, (int) $last->ID );
		}

		$response = array(
			'resources' => $resources,
			'cursor'    => $next_cursor,
		);

		AgentPipe_Cache::set( $cache_key, $response, AgentPipe_Cache::TTL_LIST );
		return $response;
	}

	public static function read_resource( $uri ) {
		$cache_key = AgentPipe_Cache::key( 'read', $uri );
		$cached = AgentPipe_Cache::get( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		if ( $uri === 'site://site' ) {
			$response = array(
				'uri'      => 'site://site',
				'mimeType' => 'application/json',
				'text'     => wp_json_encode(
					array(
						'name'        => get_bloginfo( 'name' ),
						'description' => get_bloginfo( 'description' ),
						'url'         => home_url(),
					)
				),
			);
			AgentPipe_Cache::set( $cache_key, $response, AgentPipe_Cache::TTL_READ );
			return $response;
		}

		if ( ! preg_match( '/^site:\/\/(post|page)\/(\d+)$/', $uri, $matches ) ) {
			return new WP_Error( 'invalid_uri', 'Invalid resource URI.', array( 'status' => 404 ) );
		}

		$post_type = $matches[1];
		$post_id   = (int) $matches[2];

		$post = get_post( $post_id );
		if ( ! $post || $post->post_status !== 'publish' || $post->post_type !== $post_type ) {
			return new WP_Error( 'not_found', 'Resource not found.', array( 'status' => 404 ) );
		}

		$author = get_the_author_meta( 'display_name', $post->post_author );

		$response = array(
			'uri'      => $uri,
			'mimeType' => 'application/json',
			'text'     => wp_json_encode(
				array(
					'title'     => get_the_title( $post ),
					'content'   => apply_filters( 'the_content', $post->post_content ),
					'author'    => $author,
					'date'      => $post->post_date,
					'modified'  => $post->post_modified,
					'excerpt'   => get_the_excerpt( $post ),
					'permalink' => get_permalink( $post ),
					'type'      => $post->post_type,
				)
			),
		);

		AgentPipe_Cache::set( $cache_key, $response, AgentPipe_Cache::TTL_READ );
		return $response;
	}

	public static function encode_cursor( $date, $id ) {
		return base64_encode( $date . '|' . $id );
	}

	public static function decode_cursor( $cursor ) {
		$decoded = base64_decode( $cursor, true );
		if ( false === $decoded ) {
			return false;
		}
		$parts = explode( '|', $decoded );
		if ( count( $parts ) !== 2 ) {
			return false;
		}
		return array(
			'date' => $parts[0],
			'id'   => (int) $parts[1],
		);
	}
}
