<?php
/**
 * OpenAI Whisper API proxy.
 */
class Whisper_API {

	/**
	 * Maximum file size in bytes (50 MB).
	 *
	 * @var int
	 */
	const MAX_FILE_SIZE = 52428800;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		register_rest_route(
			'whisper/v1',
			'/transcribe',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_transcribe' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Handle the transcribe request.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function handle_transcribe( \WP_REST_Request $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error( 'whisper_unauthorized', __( 'You do not have permission to transcribe audio.', 'whisper' ), array( 'status' => 403 ) );
		}

		$files = $request->get_file_params();
		if ( empty( $files['audio'] ) ) {
			return new \WP_Error( 'whisper_no_file', __( 'No audio file provided.', 'whisper' ), array( 'status' => 400 ) );
		}

		$audio = $files['audio'];

		if ( $audio['size'] > self::MAX_FILE_SIZE ) {
			return new \WP_Error( 'whisper_file_too_large', __( 'File exceeds 50 MB limit.', 'whisper' ), array( 'status' => 413 ) );
		}

		$valid_mimes = array( 'audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/m4a', 'audio/wav', 'audio/x-wav' );
		$file_type   = wp_check_filetype( $audio['name'], array_flip( $valid_mimes ) );
		if ( empty( $file_type['type'] ) ) {
			$check = wp_check_filetype( $audio['name'] );
			if ( empty( $check['type'] ) || ! in_array( $check['type'], $valid_mimes, true ) ) {
				return new \WP_Error( 'whisper_invalid_type', __( 'Invalid audio file type.', 'whisper' ), array( 'status' => 415 ) );
			}
		}

		$upload = wp_handle_upload( $audio, array( 'test_form' => false ) );
		if ( isset( $upload['error'] ) ) {
			return new \WP_Error( 'whisper_upload_failed', $upload['error'], array( 'status' => 500 ) );
		}

		$api_key = $this->get_api_key();
		if ( empty( $api_key ) ) {
			return new \WP_Error( 'whisper_no_key', __( 'OpenAI API key is not configured.', 'whisper' ), array( 'status' => 500 ) );
		}

		$result = $this->send_transcription_request( $upload['file'], $api_key );

		wp_delete_file( $upload['file'] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response(
			array(
				'success'    => true,
				'transcript' => isset( $result['words'] ) ? $result['words'] : array(),
				'text'       => isset( $result['text'] ) ? $result['text'] : '',
			),
			200
		);
	}

	/**
	 * Send transcription request to OpenAI Whisper API.
	 *
	 * @param string $file_path Absolute path to the audio file.
	 * @param string $api_key   OpenAI API key.
	 * @return array|\WP_Error
	 */
	public function send_transcription_request( $file_path, $api_key ) {
		$filetype = wp_check_filetype( basename( $file_path ), array( 'mp3' => 'audio/mpeg', 'm4a' => 'audio/m4a', 'wav' => 'audio/wav' ) );
		$mime     = $filetype['type'] ? $filetype['type'] : 'audio/mpeg';

		$boundary = wp_generate_password( 24, false );
		$body     = $this->build_multipart_body( $file_path, $mime, $boundary );

		$response = wp_remote_post(
			'https://api.openai.com/v1/audio/transcriptions',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'    => 'multipart/form-data; boundary=' . $boundary,
				),
				'body'    => $body,
				'timeout' => 120,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $this->map_api_error( $response );
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( $code >= 400 ) {
			$message = isset( $data['error']['message'] ) ? $data['error']['message'] : __( 'OpenAI API returned an error.', 'whisper' );
			return new \WP_Error( 'whisper_api_error', $message, array( 'status' => $code ) );
		}

		return $this->parse_transcription_response( $data );
	}

	/**
	 * Build multipart form body.
	 *
	 * @param string $file_path Absolute file path.
	 * @param string $mime      MIME type.
	 * @param string $boundary  Boundary string.
	 * @return string
	 */
	private function build_multipart_body( $file_path, $mime, $boundary ) {
		$filename = basename( $file_path );
		$content  = file_get_contents( $file_path );

		$body = '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="model"' . "\r\n\r\n";
		$body .= 'whisper-1' . "\r\n";

		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="response_format"' . "\r\n\r\n";
		$body .= 'verbose_json' . "\r\n";

		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="file"; filename="' . $filename . '"' . "\r\n";
		$body .= 'Content-Type: ' . $mime . "\r\n\r\n";
		$body .= $content . "\r\n";
		$body .= '--' . $boundary . '--' . "\r\n";

		return $body;
	}

	/**
	 * Parse the Whisper API response.
	 *
	 * @param array $data Decoded JSON response.
	 * @return array
	 */
	private function parse_transcription_response( $data ) {
		$words = array();
		if ( isset( $data['words'] ) && is_array( $data['words'] ) ) {
			$words = $data['words'];
		} elseif ( isset( $data['text'] ) ) {
			$sentences = preg_split( '/(?<=[.!?])\s+/', $data['text'], -1, PREG_SPLIT_NO_EMPTY );
			$time      = 0.0;
			foreach ( $sentences as $sentence ) {
				$word_list = preg_split( '/\s+/', trim( $sentence ) );
				foreach ( $word_list as $w ) {
					$words[] = array(
						'word'  => $w,
						'start' => $time,
						'end'   => $time + 0.3,
					);
					$time += 0.3;
				}
			}
		}

		return array(
			'text'  => isset( $data['text'] ) ? $data['text'] : '',
			'words' => $words,
		);
	}

	/**
	 * Map API errors to WP_Error.
	 *
	 * @param \WP_Error $error The WP_Error from wp_remote_post.
	 * @return \WP_Error
	 */
	private function map_api_error( \WP_Error $error ) {
		$message = $error->get_error_message();
		return new \WP_Error( 'whisper_request_failed', $message, array( 'status' => 502 ) );
	}

	/**
	 * Get the API key from constant or option.
	 *
	 * @return string
	 */
	public function get_api_key() {
		if ( defined( 'WHISPER_API_KEY' ) ) {
			return WHISPER_API_KEY;
		}
		return get_option( 'whisper_api_key', '' );
	}
}
