<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AgentPipe_Search {

	const DEFAULT_LIMIT = 10;
	const MAX_LIMIT = 50;

	public static function search( $query, $content_types = array(), $limit = self::DEFAULT_LIMIT ) {
		$limit = (int) $limit;
		if ( $limit < 1 ) {
			$limit = self::DEFAULT_LIMIT;
		}
		if ( $limit > self::MAX_LIMIT ) {
			$limit = self::MAX_LIMIT;
		}

		if ( '' === trim( $query ) ) {
			return array();
		}

		global $wpdb;

		$allowed_types = array( 'post', 'page' );
		if ( ! empty( $content_types ) && is_array( $content_types ) ) {
			$allowed_types = array_intersect( $allowed_types, $content_types );
		}
		if ( empty( $allowed_types ) ) {
			$allowed_types = array( 'post', 'page' );
		}

		$type_placeholders = implode( ', ', array_fill( 0, count( $allowed_types ), '%s' ) );
		$args = array_merge( array( '%' . $wpdb->esc_like( $query ) . '%', '%' . $wpdb->esc_like( $query ) . '%' ), $allowed_types );

		$use_fulltext = self::has_fulltext_index();

		if ( $use_fulltext ) {
			$sql = "SELECT ID, post_title, post_type, post_excerpt, post_content,
					MATCH(post_title,post_content) AGAINST (%s) AS relevance
					FROM {$wpdb->posts}
					WHERE post_status = 'publish'
					AND post_type IN ($type_placeholders)
					AND MATCH(post_title,post_content) AGAINST (%s)
					ORDER BY relevance DESC, post_date DESC
					LIMIT %d";
			$args = array_merge( array( $query ), $allowed_types, array( $query, $limit ) );
			$sql = $wpdb->prepare( $sql, $args );
		} else {
			$sql = "SELECT ID, post_title, post_type, post_excerpt, post_content
					FROM {$wpdb->posts}
					WHERE post_status = 'publish'
					AND post_type IN ($type_placeholders)
					AND (post_title LIKE %s OR post_content LIKE %s)
					ORDER BY post_date DESC
					LIMIT %d";
			$args[] = $limit;
			$sql = $wpdb->prepare( $sql, $args );
		}

		$results = $wpdb->get_results( $sql );
		if ( ! is_array( $results ) ) {
			$results = array();
		}

		$output = array();
		foreach ( $results as $row ) {
			$type = $row->post_type === 'page' ? 'page' : 'post';
			$excerpt = $row->post_excerpt ?: wp_trim_words( $row->post_content, 30 );
			$output[] = array(
				'uri'     => 'site://' . $type . '/' . (int) $row->ID,
				'name'    => $row->post_title ?: '(no title)',
				'excerpt' => $excerpt,
			);
		}

		return $output;
	}

	private static function has_fulltext_index() {
		global $wpdb;
		$engine = $wpdb->get_var( "SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{$wpdb->posts}'" );
		if ( 'MyISAM' !== $engine ) {
			return false;
		}
		$index = $wpdb->get_var( "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{$wpdb->posts}' AND INDEX_NAME LIKE '%fulltext%'" );
		return (int) $index > 0;
	}
}
