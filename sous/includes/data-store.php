<?php
/**
 * Data Store — thin wrapper around WP Options for all Sous settings.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_get_option( $key ) {
	$defaults = array(
		'sous_business_name'    => '',
		'sous_category'         => '',
		'sous_detection_status' => 'pending',
		'sous_widget_auto_inject' => '1',
		'sous_brand_color'      => '#d97706',
		'sous_detected_business'  => array(),
		'sous_faqs'             => array(),
		'sous_address'          => '',
		'sous_phone'            => '',
		'sous_hours'            => '',
	);

	if ( array_key_exists( $key, $defaults ) ) {
		return get_option( $key, $defaults[ $key ] );
	}
	return get_option( $key );
}

function sous_update_option( $key, $value ) {
	if ( is_string( $value ) ) {
		$value = sanitize_text_field( $value );
	} elseif ( is_array( $value ) ) {
		$value = array_map( 'sanitize_text_field', $value );
	}
	return update_option( $key, $value );
}

function sous_update_faq_option( $key, $value ) {
	if ( is_array( $value ) ) {
		$safe = array();
		foreach ( $value as $k => $v ) {
			$safe[ sanitize_text_field( $k ) ] = wp_kses_post( $v );
		}
		return update_option( $key, $safe );
	}
	return update_option( $key, wp_kses_post( $value ) );
}
