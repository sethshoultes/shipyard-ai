<?php
/**
 * Transcript storage and cleanup.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_Storage
 */
class Scribe_Storage {

	/**
	 * Retention in seconds (90 days).
	 *
	 * @var int
	 */
	const RETENTION = 7776000;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'scribe_cleanup_jobs', array( $this, 'prune_old_jobs' ) );
	}

	/**
	 * Save transcript to post meta.
	 *
	 * @param int   $post_id Post ID.
	 * @param array $transcript_json Transcript data.
	 * @return bool
	 */
	public static function save_transcript( $post_id, $transcript_json ) {
		$post_id = absint( $post_id );
		$data    = wp_json_encode( $transcript_json );
		return update_post_meta( $post_id, '_scribe_transcript', wp_slash( $data ) );
	}

	/**
	 * Get transcript from post meta.
	 *
	 * @param int $post_id Post ID.
	 * @return array|false
	 */
	public static function get_transcript( $post_id ) {
		$post_id = absint( $post_id );
		$meta    = get_post_meta( $post_id, '_scribe_transcript', true );
		if ( empty( $meta ) ) {
			return false;
		}
		$data = json_decode( wp_unslash( $meta ), true );
		return json_last_error() === JSON_ERROR_NONE ? $data : false;
	}

	/**
	 * Register post meta keys.
	 */
	public static function register_meta() {
		$meta_keys = array(
			'_scribe_transcript',
			'_scribe_job_id',
			'_scribe_audio_url',
			'_scribe_duration',
			'_scribe_job',
		);

		foreach ( $meta_keys as $key ) {
			register_post_meta(
				'',
				$key,
				array(
					'single'       => true,
					'type'         => 'string',
					'show_in_rest' => false,
				)
			);
		}
	}

	/**
	 * Prune old job artifacts without deleting published transcripts.
	 */
	public function prune_old_jobs() {
		$cutoff = time() - self::RETENTION;

		$args = array(
			'post_type'      => 'any',
			'post_status'    => 'any',
			'posts_per_page' => 50,
			'meta_query'     => array(
				'relation' => 'AND',
				array(
					'key'     => '_scribe_job',
					'compare' => 'EXISTS',
				),
				array(
					'key'     => '_scribe_job_created_at',
					'value'   => $cutoff,
					'compare' => '<',
					'type'    => 'NUMERIC',
				),
			),
		);

		$query = new WP_Query( $args );

		foreach ( $query->posts as $post ) {
			$job = get_post_meta( $post->ID, '_scribe_job', true );
			if ( is_array( $job ) && isset( $job['file_path'] ) && file_exists( $job['file_path'] ) ) {
				@unlink( $job['file_path'] );
			}

			// Only delete job metadata, not the transcript content.
			delete_post_meta( $post->ID, '_scribe_job' );
			delete_post_meta( $post->ID, '_scribe_job_id' );
		}
	}
}

add_action( 'init', array( 'Scribe_Storage', 'register_meta' ) );
