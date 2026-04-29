<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay_Claude_Client {

	const API_URL = 'https://api.anthropic.com/v1/messages';
	const MAX_RETRIES = 3;

	public static function classify( $message ) {
		$api_key = relay_decrypt_api_key();
		if ( empty( $api_key ) ) {
			return null;
		}

		$prompt = self::build_prompt( $message );

		$body = wp_json_encode( array(
			'model'       => 'claude-3-haiku-20240307',
			'max_tokens'  => 256,
			'messages'    => array(
				array(
					'role'    => 'user',
					'content' => $prompt,
				),
			),
		) );

		$args = array(
			'method'  => 'POST',
			'timeout' => 30,
			'headers' => array(
				'Content-Type'  => 'application/json',
				'x-api-key'     => $api_key,
				'anthropic-version' => '2023-06-01',
			),
			'body'    => $body,
		);

		$attempt = 0;
		$response = null;

		while ( $attempt < self::MAX_RETRIES ) {
			$response = wp_remote_post( self::API_URL, $args );

			if ( ! is_wp_error( $response ) ) {
				$status = wp_remote_retrieve_response_code( $response );
				if ( 200 === $status ) {
					break;
				}
			}

			$attempt++;
			if ( $attempt < self::MAX_RETRIES ) {
				$backoff = (int) pow( 2, $attempt );
				sleep( $backoff );
			}
		}

		if ( is_wp_error( $response ) ) {
			return null;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status ) {
			return null;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( empty( $data['content'] ) || ! is_array( $data['content'] ) ) {
			return null;
		}

		$text = '';
		foreach ( $data['content'] as $block ) {
			if ( isset( $block['text'] ) ) {
				$text .= $block['text'];
			}
		}

		$json = self::extract_json( $text );
		if ( empty( $json ) ) {
			return null;
		}

		$parsed = json_decode( $json, true );
		if ( ! is_array( $parsed ) ) {
			return null;
		}

		$required = array( 'category', 'urgency', 'reason' );
		foreach ( $required as $key ) {
			if ( ! isset( $parsed[ $key ] ) ) {
				return null;
			}
		}

		$parsed['category'] = sanitize_text_field( $parsed['category'] );
		$parsed['urgency']  = sanitize_text_field( $parsed['urgency'] );
		$parsed['reason']   = sanitize_text_field( $parsed['reason'] );

		$valid_categories = array( 'Sales', 'Support', 'Spam', 'General' );
		$valid_urgencies  = array( 'High', 'Medium', 'Low' );

		if ( ! in_array( $parsed['category'], $valid_categories, true ) ) {
			$parsed['category'] = 'General';
		}
		if ( ! in_array( $parsed['urgency'], $valid_urgencies, true ) ) {
			$parsed['urgency'] = 'Medium';
		}

		return $parsed;
	}

	private static function build_prompt( $message ) {
		return "Classify the following form submission. Respond with ONLY a JSON object containing exactly these keys: category, urgency, reason.\n"
			. "category must be one of: Sales, Support, Spam, General.\n"
			. "urgency must be one of: High, Medium, Low.\n\n"
			. "Form submission:\n" . $message . "\n\n"
			. "JSON response:";
	}

	private static function extract_json( $text ) {
		$text = trim( $text );
		$start = strpos( $text, '{' );
		$end   = strrpos( $text, '}' );

		if ( false === $start || false === $end || $end < $start ) {
			return null;
		}

		return substr( $text, $start, $end - $start + 1 );
	}
}
