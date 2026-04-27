<?php
/**
 * Sous Async Business Detector.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_detect_schema_org() {
	$html = sous_get_home_html();
	$business = array(
		'business_name' => '',
		'category'      => '',
		'phone'         => '',
		'address'       => '',
		'hours'         => '',
		'confidence'    => 0,
	);
	if ( preg_match( '/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', $html, $matches ) ) {
		$json = json_decode( $matches[1], true );
		if ( is_array( $json ) ) {
			if ( isset( $json['name'] ) ) {
				$business['business_name'] = sanitize_text_field( $json['name'] );
				$business['confidence'] += 0.4;
			}
			if ( isset( $json['@type'] ) ) {
				$business['category'] = sanitize_text_field( strtolower( $json['@type'] ) );
				$business['confidence'] += 0.2;
			}
			if ( isset( $json['telephone'] ) ) {
				$business['phone'] = sanitize_text_field( $json['telephone'] );
				$business['confidence'] += 0.2;
			}
			if ( isset( $json['address'] ) ) {
				if ( is_array( $json['address'] ) ) {
					$parts = array();
					if ( isset( $json['address']['streetAddress'] ) ) {
						$parts[] = $json['address']['streetAddress'];
					}
					if ( isset( $json['address']['addressLocality'] ) ) {
						$parts[] = $json['address']['addressLocality'];
					}
					$business['address'] = sanitize_text_field( implode( ', ', $parts ) );
				} else {
					$business['address'] = sanitize_text_field( $json['address'] );
				}
				$business['confidence'] += 0.2;
			}
			if ( isset( $json['openingHours'] ) ) {
				if ( is_array( $json['openingHours'] ) ) {
					$business['hours'] = sanitize_text_field( implode( '; ', $json['openingHours'] ) );
				} else {
					$business['hours'] = sanitize_text_field( $json['openingHours'] );
				}
				$business['confidence'] += 0.1;
			}
		}
	}
	return $business;
}

function sous_detect_opengraph() {
	$html = sous_get_home_html();
	$business = array(
		'business_name' => '',
		'category'      => '',
		'confidence'    => 0,
	);
	if ( preg_match( '/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\']/i', $html, $m ) ) {
		$business['business_name'] = sanitize_text_field( $m[1] );
		$business['confidence'] += 0.3;
	}
	if ( preg_match( '/<meta[^>]*property=["\']og:type["\'][^>]*content=["\']([^"\']*)["\']/i', $html, $m ) ) {
		$business['category'] = sanitize_text_field( strtolower( $m[1] ) );
		$business['confidence'] += 0.2;
	}
	return $business;
}

function sous_detect_footer_text() {
	$html = sous_get_home_html();
	$business = array(
		'phone'   => '',
		'address' => '',
		'hours'   => '',
		'confidence' => 0,
	);
	if ( preg_match( '/\b(\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})\b/', $html, $m ) ) {
		$business['phone'] = sanitize_text_field( $m[1] );
		$business['confidence'] += 0.2;
	}
	if ( preg_match( '/([0-9]+\s+[^,<]+(?:,\s*[^,<]+){1,3})/i', $html, $m ) ) {
		$business['address'] = sanitize_text_field( $m[1] );
		$business['confidence'] += 0.2;
	}
	if ( preg_match( '/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*.*[0-9]{1,2}:?[0-9]{0,2}\s*(AM|PM|am|pm)?/i', $html, $m ) ) {
		$business['hours'] = sanitize_text_field( $m[0] );
		$business['confidence'] += 0.1;
	}
	return $business;
}

function sous_get_home_html() {
	$cached = get_transient( 'sous_home_html_cache' );
	if ( false !== $cached ) {
		return $cached;
	}
	$url = home_url( '/' );
	$response = wp_remote_get( $url, array( 'timeout' => 10 ) );
	if ( is_wp_error( $response ) ) {
		return '';
	}
	$html = wp_remote_retrieve_body( $response );
	set_transient( 'sous_home_html_cache', $html, DAY_IN_SECONDS );
	return $html;
}

function sous_merge_detection_results( $schema, $og, $footer ) {
	$merged = array(
		'business_name' => '',
		'category'      => '',
		'phone'         => '',
		'address'       => '',
		'hours'         => '',
		'confidence'    => 0,
	);
	$fields = array( 'business_name', 'category', 'phone', 'address', 'hours' );
	foreach ( $fields as $field ) {
		$sources = array( $schema, $og, $footer );
		foreach ( $sources as $source ) {
			if ( ! empty( $source[ $field ] ) ) {
				$merged[ $field ] = $source[ $field ];
				break;
			}
		}
	}
	$merged['confidence'] = min( 1.0, $schema['confidence'] + $og['confidence'] + $footer['confidence'] );
	return $merged;
}

function sous_ajax_detect_business() {
	check_ajax_referer( 'sous_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( 'Permission denied.' );
	}
	$schema = sous_detect_schema_org();
	$og     = sous_detect_opengraph();
	$footer = sous_detect_footer_text();
	$result = sous_merge_detection_results( $schema, $og, $footer );
	set_transient( 'sous_detected_business', $result, DAY_IN_SECONDS );
	sous_update_option( 'sous_detection_status', 'completed' );
	wp_send_json_success( $result );
}
add_action( 'wp_ajax_sous_detect_business', 'sous_ajax_detect_business' );
