<?php
/**
 * post_meta JSON storage for transcript data.
 */
class Whisper_Storage {

	/**
	 * Meta key used for post meta.
	 *
	 * @var string
	 */
	const META_KEY = '_whisper_transcript_data';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'whisper_cron_weekly_cleanup', array( $this, 'prune' ) );
	}

	/**
	 * Save transcript data for a post.
	 *
	 * @param int   $post_id Post ID.
	 * @param array $data    Data to store.
	 * @return int|bool
	 */
	public function save( $post_id, $data ) {
		$data['updated'] = time();
		return update_post_meta( $post_id, self::META_KEY, wp_slash( wp_json_encode( $data ) ) );
	}

	/**
	 * Get transcript data for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return array
	 */
	public function get( $post_id ) {
		$raw = get_post_meta( $post_id, self::META_KEY, true );
		if ( empty( $raw ) ) {
			return array();
		}
		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : array();
	}

	/**
	 * Prune old job artifacts from post_meta.
	 *
	 * Keeps transcript JSON indefinitely unless the post is deleted.
	 * Removes orphaned job metadata older than 30 days.
	 */
	public function prune() {
		global $wpdb;
		$cutoff = time() - ( 30 * DAY_IN_SECONDS );

		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value LIKE %s AND meta_id IN (
					SELECT meta_id FROM (
						SELECT meta_id FROM {$wpdb->postmeta}
						WHERE meta_key = %s
						AND meta_value LIKE %s
						AND meta_id < %d
					) AS tmp
				)",
				self::META_KEY,
				'%"job_id"%',
				self::META_KEY,
				'%"job_id"%',
				$cutoff
			)
		);
	}

	/**
	 * Delete transcript data for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return bool
	 */
	public function delete( $post_id ) {
		return delete_post_meta( $post_id, self::META_KEY );
	}
}
