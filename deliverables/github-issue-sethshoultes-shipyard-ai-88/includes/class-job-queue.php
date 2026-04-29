<?php
/**
 * Async job queue powered by WP Cron.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_Job_Queue
 */
class Scribe_Job_Queue {

	/**
	 * Batch size per cron run.
	 *
	 * @var int
	 */
	const BATCH_SIZE = 1;

	/**
	 * Max retries before dead-letter.
	 *
	 * @var int
	 */
	const MAX_RETRIES = 3;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'scribe_process_jobs', array( $this, 'process_batch' ) );
	}

	/**
	 * Create a new transcription job.
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $file_path Absolute file path.
	 * @param string $audio_url Audio URL.
	 * @return string Job ID.
	 */
	public static function create_job( $post_id, $file_path, $audio_url ) {
		$job_id = 'scribe_' . wp_generate_password( 12, false );
		$job    = array(
			'job_id'     => $job_id,
			'post_id'    => absint( $post_id ),
			'file_path'  => sanitize_text_field( $file_path ),
			'audio_url'  => esc_url_raw( $audio_url ),
			'status'     => 'pending',
			'created_at' => time(),
			'attempts'   => 0,
		);

		update_post_meta( absint( $post_id ), '_scribe_job', $job );
		update_post_meta( absint( $post_id ), '_scribe_job_id', sanitize_text_field( $job_id ) );

		return $job_id;
	}

	/**
	 * Get a job by post ID.
	 *
	 * @param int $post_id Post ID.
	 * @return array|false
	 */
	public static function get_job( $post_id ) {
		$job = get_post_meta( absint( $post_id ), '_scribe_job', true );
		return is_array( $job ) ? $job : false;
	}

	/**
	 * Process pending jobs in batches.
	 */
	public function process_batch() {
		$args = array(
			'post_type'      => 'any',
			'post_status'    => 'any',
			'posts_per_page' => self::BATCH_SIZE,
			'meta_query'     => array(
				array(
					'key'   => '_scribe_job',
					'value' => 'pending',
					'compare' => 'LIKE',
				),
			),
		);

		$query = new WP_Query( $args );

		foreach ( $query->posts as $post ) {
			$job = self::get_job( $post->ID );
			if ( ! $job || 'pending' !== $job['status'] ) {
				continue;
			}

			$job['status']   = 'processing';
			$job['attempts'] = isset( $job['attempts'] ) ? intval( $job['attempts'] ) + 1 : 1;
			update_post_meta( $post->ID, '_scribe_job', $job );

			$result = Scribe_API::transcribe( $job['file_path'] );

			if ( is_wp_error( $result ) ) {
				if ( $job['attempts'] >= self::MAX_RETRIES ) {
					$job['status'] = 'failed';
				} else {
					$job['status'] = 'pending';
				}
				update_post_meta( $post->ID, '_scribe_job', $job );
				continue;
			}

			$duration = isset( $result['duration'] ) ? floatval( $result['duration'] ) : 0;
			$minutes  = ceil( $duration / 60 );

			Scribe_License::increment_usage( $minutes );
			Scribe_Storage::save_transcript( $post->ID, $result );

			$job['status'] = 'complete';
			update_post_meta( $post->ID, '_scribe_job', $job );
			update_post_meta( $post->ID, '_scribe_audio_url', $job['audio_url'] );
			update_post_meta( $post->ID, '_scribe_duration', $duration );
		}
	}
}
