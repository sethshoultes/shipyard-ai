<?php
/**
 * SPARK_Widget
 *
 * wp_footer script injection + config object.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SPARK_Widget {

	public function __construct() {
		add_action( 'wp_footer', array( $this, 'inject' ) );
	}

	public function inject() {
		$enabled = get_option( 'spark_widget_enabled', '0' );
		if ( '1' !== $enabled ) {
			return;
		}

		$greeting = get_option( 'spark_greeting', __( 'Hi there. How can we help today?', 'spark' ) );
		$position = get_option( 'spark_position', 'bottom-right' );
		$theme    = get_option( 'spark_theme', 'light' );
		$api_base = get_option( 'spark_api_base', 'https://localgenius-api.seth-a02.workers.dev' );
		$api_key  = get_option( 'spark_api_key', '' );

		$faq     = new SPARK_FAQ();
		$faqs    = $faq->get_active();
		$enabled_faqs = array_filter(
			$faqs,
			function ( $f ) {
				return ! empty( $f['enabled'] );
			}
		);

		$quota_ok = $this->check_quota();
		if ( ! $quota_ok ) {
			$greeting = __( 'You have reached your conversation limit. Upgrade your plan to keep chatting with visitors.', 'spark' );
		}

		$config = array(
			'apiKey'   => $api_key,
			'apiBase'  => $api_base,
			'greeting' => $greeting,
			'position' => $position,
			'theme'    => $theme,
			'faqs'     => array_values( $enabled_faqs ),
			'quotaOk'  => $quota_ok,
		);

		$json = wp_json_encode( $config );
		$escaped = esc_js( $json );

		echo '<script>window.SPARK_CONFIG = JSON.parse("' . $escaped . '");</script>' . "\n";
		echo '<script src="' . esc_url( SPARK_PLUGIN_URL . 'assets/js/spark.min.js' ) . '?v=' . esc_attr( SPARK_VERSION ) . '" async defer></script>' . "\n";
	}

	private function check_quota() {
		$api = new SPARK_API();
		$res = $api->request( '/status' );
		if ( is_wp_error( $res ) ) {
			return true;
		}
		if ( isset( $res['quota_exceeded'] ) && true === $res['quota_exceeded'] ) {
			return false;
		}
		return true;
	}
}
