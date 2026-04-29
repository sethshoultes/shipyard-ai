<?php
/**
 * OpenAI Whisper API proxy.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_API
 */
class Scribe_API {

	/**
	 * Max file size in bytes (50 MB).
	 *
	 * @var int
	 */
	const MAX_FILE_SIZE = 52428800;

	/**
	 * Max retries for API calls.
	 *
	 * @var int
	 */
	const MAX_RETRIES = 3;

	/**
	 * Get the OpenAI API key.
	 *
	 * @return string
	 */
	public static function get_api_key() {
		if ( defined( 'SCRIBE_API_KEY' ) ) {
			return SCRIBE_API_KEY;
		}

		$encrypted = get_option( 'scribe_api_key', '' );
		if ( empty( $encrypted ) ) {
			return '';
		}

		$key = openssl_decrypt( base64_decode( $encrypted ), 'AES-128-ECB', self::get_encryption_key() );
		return $key ? $key : '';
	}

	/**
	 * Get the encryption key.
	 *
	 * @return string
	 */
	private static function get_encryption_key() {
		$key = defined( 'LOGGED_IN_KEY' ) ? LOGGED_IN_KEY : 'scribe-default-key';
		return substr( hash( 'sha256', $key ), 0, 16 );
	}

	/**
	 * Transcribe an audio file via Whisper.
	 *
	 * @param string $file_path Absolute path to the audio file.
	 * @return array|
	 */
	public static function transcribe( $file_path ) {
		if ( ! file_exists( $file_path ) ) {
			return new WP_Error( 'file_not_found', __( 'Audio file not found.', 'scribe' ) );
		}

		$file_size = filesize( $file_path );
		if ( $file_size > self::MAX_FILE_SIZE ) {
			return new WP_Error( 'file_too_large', __( 'File exceeds 50 MB limit.', 'scribe' ) );
		}

		$api_key = self::get_api_key();
		if ( empty( $api_key ) ) {
			return new WP_Error( 'missing_key', __( 'OpenAI API key is not configured.', 'scribe' ) );
		}

		$mime_type = wp_check_filetype( basename( $file_path ) );
		$mime      = ! empty( $mime_type['type'] ) ? $mime_type['type'] : 'audio/mpeg';

		$boundary = wp_generate_password( 24, false );
		$payload  = '--' . $boundary . "\r\n";
		$payload .= 'Content-Disposition: form-data; name="model"' . "\r\n\r\n";
		$payload .= 'whisper-1' . "\r\n";
		$payload .= '--' . $boundary . "\r\n";
		$payload .= 'Content-Disposition: form-data; name="response_format"' . "\r\n\r\n";
		$payload .= 'verbose_json' . "\r\n";
		$payload .= '--' . $boundary . "\r\n";
		$payload .= 'Content-Disposition: form-data; name="file"; filename="' . basename( $file_path ) . '"' . "\r\n";
		$payload .= 'Content-Type: ' . $mime . "\r\n\r\n";
		$payload .= file_get_contents( $file_path ) . "\r\n";
		$payload .= '--' . $boundary . '--';

		$headers = array(
			'Authorization' => 'Bearer ' . $api_key,
			'Content-Type'  => 'multipart/form-data; boundary=' . $boundary,
		);

		$attempt = 0;
		$backoff = 1;

		while ( $attempt < self::MAX_RETRIES ) {
			$response = wp_remote_post(
				'https://api.openai.com/v1/audio/transcriptions',
				array(
					'headers' => $headers,
					'body'    => $payload,
					'timeout' => 120,
				)
			);

			$attempt++;

			if ( is_wp_error( $response ) ) {
				if ( $attempt >= self::MAX_RETRIES ) {
					return new WP_Error( 'request_failed', __( 'Could not reach OpenAI. Please try again.', 'scribe' ) );
				}
				sleep( $backoff );
				$backoff *= 2;
				continue;
			}

			$status_code = wp_remote_retrieve_response_code( $response );
			$body        = wp_remote_retrieve_body( $response );

			if ( 200 === $status_code ) {
				$data = json_decode( $body, true );
				if ( json_last_error() !== JSON_ERROR_NONE ) {
					return new WP_Error( 'invalid_json', __( 'Invalid response from OpenAI.', 'scribe' ) );
				}
				return $data;
			}

			if ( $status_code >= 400 && $status_code < 500 ) {
				$message = __( 'Transcription failed. Please check your API key or file format.', 'scribe' );
				if ( 429 === $status_code ) {
					$message = __( 'Rate limit exceeded. Please try again later.', 'scribe' );
				}
				return new WP_Error( 'api_error', $message, array( 'status' => $status_code ) );
			}

			if ( $status_code >= 500 ) {
				if ( $attempt >= self::MAX_RETRIES ) {
					return new WP_Error( 'server_error', __( 'OpenAI server error. Please try again later.', 'scribe' ) );
				}
				sleep( $backoff );
				$backoff *= 2;
				continue;
			}
		}

		return new WP_Error( 'unknown_error', __( 'An unexpected error occurred.', 'scribe' ) );
	}
}
