<?php
if (!defined('ABSPATH')) {
	exit;
}

class Scribe_API {

	public static function get_api_key() {
		if (defined('SCRIBE_API_KEY') && SCRIBE_API_KEY) {
			return SCRIBE_API_KEY;
		}
		return get_option('scribe_api_key', '');
	}

	public function send($file_path) {
		$api_key = self::get_api_key();
		if (empty($api_key)) {
			return new WP_Error('scribe_no_api_key', __('OpenAI API key is not configured. Please add it in Settings > Scribe.', 'scribe'));
		}

		if (!file_exists($file_path)) {
			return new WP_Error('scribe_file_missing', __('Audio file could not be found.', 'scribe'));
		}

		$file_type = wp_check_filetype(basename($file_path), array(
			'mp3'  => 'audio/mpeg',
			'm4a'  => 'audio/mp4',
			'wav'  => 'audio/wav',
		));
		if (empty($file_type['type'])) {
			return new WP_Error('scribe_invalid_type', __('Invalid audio file type. Only MP3, M4A, and WAV are supported.', 'scribe'));
		}

		$boundary = wp_generate_password(24, false);
		$body = '';
		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="model"' . "\r\n\r\n";
		$body .= 'whisper-1' . "\r\n";
		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="response_format"' . "\r\n\r\n";
		$body .= 'verbose_json' . "\r\n";
		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="file"; filename="' . basename($file_path) . '"' . "\r\n";
		$body .= 'Content-Type: ' . $file_type['type'] . "\r\n\r\n";
		$body .= file_get_contents($file_path) . "\r\n";
		$body .= '--' . $boundary . '--' . "\r\n";

		$response = wp_remote_post(
			'https://api.openai.com/v1/audio/transcriptions',
			array(
				'timeout' => 120,
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'multipart/form-data; boundary=' . $boundary,
				),
				'body'    => $body,
			)
		);

		if (is_wp_error($response)) {
			return new WP_Error('scribe_request_failed', __('Failed to connect to OpenAI. Please try again later.', 'scribe'));
		}

		$code = wp_remote_retrieve_response_code($response);
		$body_raw = wp_remote_retrieve_body($response);

		if ($code >= 500) {
			return new WP_Error('scribe_openai_error', __('OpenAI server error. Please try again later.', 'scribe'));
		}

		if ($code >= 400) {
			$message = __('OpenAI request failed.', 'scribe');
			$data = json_decode($body_raw, true);
			if (!empty($data['error']['message'])) {
				$message = sanitize_text_field($data['error']['message']);
			}
			return new WP_Error('scribe_openai_error', $message);
		}

		$data = json_decode($body_raw, true);
		if (empty($data)) {
			return new WP_Error('scribe_invalid_response', __('Invalid response from OpenAI.', 'scribe'));
		}

		return $data;
	}
}
