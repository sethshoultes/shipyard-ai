<?php
/**
 * WP Cron async job queue for transcription jobs.
 */
class Whisper_Job_Queue {

	/**
	 * Option key for storing jobs.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'whisper_jobs';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'whisper_cron_process_jobs', array( $this, 'process_jobs' ) );
		add_filter( 'cron_schedules', array( $this, 'add_cron_interval' ) );
	}

	/**
	 * Add a custom one-minute cron interval.
	 *
	 * @param array $schedules Existing cron schedules.
	 * @return array
	 */
	public function add_cron_interval( $schedules ) {
		$schedules['every_minute'] = array(
			'interval' => 60,
			'display'  => __( 'Every Minute', 'whisper' ),
		);
		return $schedules;
	}

	/**
	 * Create a new job.
	 *
	 * @param int    $post_id  The post ID.
	 * @param string $file_url URL to the uploaded audio file.
	 * @return string Job ID.
	 */
	public static function create_job( $post_id, $file_url ) {
		$job_id = 'whisper_job_' . wp_generate_password( 12, false );
		$jobs   = get_option( self::OPTION_KEY, array() );

		$jobs[ $job_id ] = array(
			'post_id'   => $post_id,
			'file_url'  => $file_url,
			'status'    => 'pending',
			'attempt'   => 0,
			'created'   => time(),
			'updated'   => time(),
			'error'     => '',
			'result'    => array(),
		);

		update_option( self::OPTION_KEY, $jobs );
		return $job_id;
	}

	/**
	 * Get a job by ID.
	 *
	 * @param string $job_id The job ID.
	 * @return array|null
	 */
	public static function get_job( $job_id ) {
		$jobs = get_option( self::OPTION_KEY, array() );
		return isset( $jobs[ $job_id ] ) ? $jobs[ $job_id ] : null;
	}

	/**
	 * Update a job.
	 *
	 * @param string $job_id The job ID.
	 * @param array  $data   Data to merge.
	 * @return bool
	 */
	public static function update_job( $job_id, $data ) {
		$jobs = get_option( self::OPTION_KEY, array() );
		if ( ! isset( $jobs[ $job_id ] ) ) {
			return false;
		}
		$jobs[ $job_id ] = array_merge( $jobs[ $job_id ], $data, array( 'updated' => time() ) );
		update_option( self::OPTION_KEY, $jobs );
		return true;
	}

	/**
	 * Process all pending jobs.
	 */
	public function process_jobs() {
		$jobs = get_option( self::OPTION_KEY, array() );
		if ( empty( $jobs ) ) {
			return;
		}

		foreach ( $jobs as $job_id => $job ) {
			if ( ! in_array( $job['status'], array( 'pending', 'failed' ), true ) ) {
				continue;
			}

			if ( $job['attempt'] >= 5 ) {
				$jobs[ $job_id ]['status'] = 'failed';
				$jobs[ $job_id ]['error']  = __( 'Max retry attempts exceeded.', 'whisper' );
				$jobs[ $job_id ]['updated'] = time();
				continue;
			}

			$backoff = $this->calculate_backoff( $job['attempt'] );
			if ( ( time() - $job['updated'] ) < $backoff ) {
				continue;
			}

			$jobs[ $job_id ]['status']  = 'processing';
			$jobs[ $job_id ]['attempt'] = $jobs[ $job_id ]['attempt'] + 1;
			$jobs[ $job_id ]['updated'] = time();

			$api     = new Whisper_API();
			$api_key = $api->get_api_key();

			if ( empty( $api_key ) ) {
				$jobs[ $job_id ]['status'] = 'failed';
				$jobs[ $job_id ]['error']  = __( 'API key missing.', 'whisper' );
				continue;
			}

			$tmp_file = download_url( $job['file_url'], 60 );
			if ( is_wp_error( $tmp_file ) ) {
				$jobs[ $job_id ]['status'] = 'failed';
				$jobs[ $job_id ]['error']  = $tmp_file->get_error_message();
				continue;
			}

			$result = $api->send_transcription_request( $tmp_file, $api_key );
			wp_delete_file( $tmp_file );

			if ( is_wp_error( $result ) ) {
				$jobs[ $job_id ]['status'] = 'failed';
				$jobs[ $job_id ]['error']  = $result->get_error_message();
				continue;
			}

			$jobs[ $job_id ]['status'] = 'complete';
			$jobs[ $job_id ]['result'] = $result;
			$jobs[ $job_id ]['error']  = '';

			$storage = new Whisper_Storage();
			$storage->save( $job['post_id'], array(
				'job_id'     => $job_id,
				'audio_url'  => $job['file_url'],
				'transcript' => isset( $result['words'] ) ? $result['words'] : array(),
				'text'       => isset( $result['text'] ) ? $result['text'] : '',
				'updated'    => time(),
			) );
		}

		update_option( self::OPTION_KEY, $jobs );
	}

	/**
	 * Calculate exponential backoff in seconds.
	 *
	 * @param int $attempt Number of previous attempts.
	 * @return int
	 */
	private function calculate_backoff( $attempt ) {
		$base = 5;
		$max  = 60;
		$secs = $base * pow( 2, $attempt );
		return min( $secs, $max );
	}
}
