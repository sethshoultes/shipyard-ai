<?php
/**
 * SPARK_API
 *
 * Cloudflare Worker API client with transient caching.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SPARK_API {

	private $api_base;
	private $api_key;

	public function __construct() {
		$this->api_base = get_option( 'spark_api_base', 'https://localgenius-api.seth-a02.workers.dev' );
		$this->api_key  = get_option( 'spark_api_key', '' );
	}

	public function request( $endpoint, $method = 'GET', $body = null ) {
		$url = trailingslashit( $this->api_base ) . ltrim( $endpoint, '/' );

		$args = array(
			'method'  => $method,
			'timeout' => 15,
			'headers' => array(
				'Content-Type' => 'application/json',
				'X-Spark-Key'  => $this->api_key,
			),
		);

		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}

		$response = 'GET' === $method ? wp_remote_get( $url, $args ) : wp_remote_post( $url, $args );

		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'spark_api_error', $response->get_error_message() );
		}

		$code = wp_remote_retrieve_response_code( $response );
		$json = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code >= 400 ) {
			return new WP_Error( 'spark_api_http', 'HTTP ' . $code, $json );
		}

		return $json;
	}

	public function get_cached( $key, $callback, $ttl = 300 ) {
		$cached = get_transient( $key );
		if ( false !== $cached ) {
			return $cached;
		}
		$value = call_user_func( $callback );
		if ( ! is_wp_error( $value ) ) {
			set_transient( $key, $value, $ttl );
		}
		return $value;
	}

	public function get_detect_preview( $url ) {
		return $this->get_cached(
			'spark_detect_' . md5( $url ),
			function () use ( $url ) {
				return $this->request( '/detect?url=' . rawurlencode( $url ) );
			},
			300
		);
	}

	public function get_faqs( $category ) {
		return $this->get_cached(
			'spark_faqs_' . sanitize_key( $category ),
			function () use ( $category ) {
				return $this->request( '/faqs?category=' . rawurlencode( $category ) );
			},
			300
		);
	}

	public function get_benchmarks( $params ) {
		$query = http_build_query( $params );
		return $this->get_cached(
			'spark_benchmark_' . md5( $query ),
			function () use ( $query ) {
				return $this->request( '/benchmarks?' . $query );
			},
			300
		);
	}
}
