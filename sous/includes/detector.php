<?php
/**
 * Async Business Detection — schema.org, OpenGraph, footer text scraper.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_detect_business_ajax() {
	check_ajax_referer( 'sous_admin_nonce', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => 'Permission denied.' ) );
	}

	$transient_key = 'sous_detected_business_cache';
	$cached = get_transient( $transient_key );
	if ( false !== $cached ) {
		wp_send_json_success( $cached );
	}

	$home_url = home_url();
	$business = array(
		'business_name' => '',
		'category'      => '',
		'address'       => '',
		'phone'         => '',
		'hours'         => '',
		'confidence'    => 0,
	);

	// 1. Schema.org JSON-LD
	$response = wp_remote_get( $home_url );
	$html = '';
	if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
		$html = wp_remote_retrieve_body( $response );
	}

	if ( ! empty( $html ) ) {
		if ( preg_match_all( '/<script type="application\/ld\+json"\u003e(.*?)\u003c\/script\u003e/s', $html, $matches ) ) {
			foreach ( $matches[1] as $json ) {
				$data = json_decode( $json, true );
				if ( ! is_array( $data ) ) {
					continue;
				}
				$types = array( 'Restaurant', 'LocalBusiness', 'Dentist', 'Store', 'Service' );
				if ( isset( $data['@type'] ) && in_array( $data['@type'], $types, true ) ) {
					if ( ! empty( $data['name'] ) ) {
						$business['business_name'] = sanitize_text_field( $data['name'] );
					}
					if ( ! empty( $data['@type'] ) ) {
						$business['category'] = sous_map_schema_type_to_category( $data['@type'] );
					}
					if ( ! empty( $data['address']['streetAddress'] ) ) {
						$business['address'] = sanitize_text_field( $data['address']['streetAddress'] );
						if ( ! empty( $data['address']['addressLocality'] ) ) {
							$business['address'] .= ', ' . sanitize_text_field( $data['address']['addressLocality'] );
						}
						if ( ! empty( $data['address']['addressRegion'] ) ) {
							$business['address'] .= ', ' . sanitize_text_field( $data['address']['addressRegion'] );
						}
					}
					if ( ! empty( $data['telephone'] ) ) {
						$business['phone'] = sanitize_text_field( $data['telephone'] );
					}
					if ( ! empty( $data['openingHours'] ) ) {
						$business['hours'] = is_array( $data['openingHours'] )
							? implode( ', ', array_map( 'sanitize_text_field', $data['openingHours'] ) )
							: sanitize_text_field( $data['openingHours'] );
					}
					break;
				}
			}
		}

		// 2. OpenGraph tags fallback
		if ( empty( $business['business_name'] ) ) {
			if ( preg_match( '/<meta[^\u003e]*property="og:site_name"[^\u003e]*content="([^"]*)"[^\u003e]*\u003e/i', $html, $og ) ) {
				$business['business_name'] = sanitize_text_field( $og[1] );
			} elseif ( preg_match( '/<meta[^\u003e]*property="og:title"[^\u003e]*content="([^"]*)"[^\u003e]*\u003e/i', $html, $og ) ) {
				$business['business_name'] = sanitize_text_field( $og[1] );
			}
		}

		// 3. Footer phone / address regex fallback
		if ( empty( $business['phone'] ) ) {
			if ( preg_match( '/([\(]?\d{3}[\)]?[-\.\s]?\d{3}[-\.\s]?\d{4})/', $html, $phone_match ) ) {
				$business['phone'] = sanitize_text_field( $phone_match[1] );
			}
		}
	}

	// 4. WordPress site title / tagline fallback
	if ( empty( $business['business_name'] ) ) {
		$business['business_name'] = get_bloginfo( 'name' );
	}
	if ( empty( $business['category'] ) ) {
		$tagline = get_bloginfo( 'description' );
		$business['category'] = sous_guess_category_from_text( $tagline );
	}

	// Confidence scoring
	$score = 0;
	$fields = 0;
	if ( ! empty( $business['business_name'] ) ) {
		$fields++;
	}
	if ( ! empty( $business['category'] ) ) {
		$fields++;
	}
	if ( ! empty( $business['phone'] ) ) {
		$fields++;
	}
	if ( ! empty( $business['address'] ) ) {
		$fields++;
	}
	if ( ! empty( $business['hours'] ) ) {
		$fields++;
	}
	$business['confidence'] = round( $fields / 5, 2 );

	// Cache for 24 hours
	set_transient( $transient_key, $business, DAY_IN_SECONDS );

	// Store detected business in options
	update_option( 'sous_detected_business', $business );
	update_option( 'sous_detection_status', 'complete' );

	wp_send_json_success( $business );
}
add_action( 'wp_ajax_sous_detect_business', 'sous_detect_business_ajax' );

function sous_map_schema_type_to_category( $type ) {
	$map = array(
		'Restaurant'      => 'restaurant',
		'Dentist'         => 'dental',
		'Store'           => 'retail',
		'Service'         => 'services',
		'LocalBusiness'   => 'generic',
	);
	return isset( $map[ $type ] ) ? $map[ $type ] : 'generic';
}

function sous_guess_category_from_text( $text ) {
	$text = strtolower( $text );
	$keywords = array(
		'restaurant' => array( 'restaurant', 'cafe', 'dining', 'kitchen', 'bistro' ),
		'dental'     => array( 'dental', 'dentist', 'orthodontics', 'teeth' ),
		'retail'     => array( 'shop', 'store', 'boutique', 'retail', 'merchandise' ),
		'services'   => array( 'service', 'repair', 'consulting', 'plumbing', 'hvac' ),
	);
	foreach ( $keywords as $category => $words ) {
		foreach ( $words as $word ) {
			if ( false !== strpos( $text, $word ) ) {
				return $category;
			}
		}
	}
	return 'generic';
}
