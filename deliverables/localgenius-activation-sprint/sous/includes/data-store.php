<?php
/**
 * Sous Data Store — thin wrapper around WP Options.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_get_option( $key ) {
	$value = get_option( $key, '' );
	if ( is_string( $value ) ) {
		$value = sanitize_text_field( $value );
	}
	return $value;
}

function sous_update_option( $key, $value ) {
	if ( is_string( $value ) ) {
		$value = sanitize_text_field( $value );
	} elseif ( is_array( $value ) ) {
		$value = map_deep( $value, 'sanitize_text_field' );
	}
	return update_option( $key, $value );
}

function sous_get_faqs() {
	$faqs = get_option( 'sous_faqs', array() );
	if ( ! is_array( $faqs ) || empty( $faqs ) ) {
		$faqs = sous_load_default_faqs();
	}
	return $faqs;
}

function sous_save_faq( $index, $question, $answer, $enabled ) {
	$faqs = sous_get_faqs();
	if ( isset( $faqs[ $index ] ) ) {
		$faqs[ $index ]['question'] = sanitize_text_field( $question );
		$faqs[ $index ]['answer_template'] = wp_kses_post( $answer );
		$faqs[ $index ]['enabled'] = boolval( $enabled );
		update_option( 'sous_faqs', $faqs );
		return true;
	}
	return false;
}

function sous_load_default_faqs() {
	$path = SOUS_DIR . 'data/templates.json';
	if ( ! file_exists( $path ) ) {
		return array();
	}
	$json = file_get_contents( $path );
	$data = json_decode( $json, true );
	if ( ! is_array( $data ) ) {
		return array();
	}
	$category = sous_get_option( 'sous_category' );
	if ( empty( $category ) || ! isset( $data[ $category ] ) ) {
		$category = 'generic';
	}
	$defaults = isset( $data[ $category ] ) ? $data[ $category ] : array();
	$all = array();
	foreach ( $defaults as $item ) {
		$all[] = array(
			'category'       => sanitize_text_field( $category ),
			'question'       => sanitize_text_field( $item['question'] ),
			'answer_template' => wp_kses_post( $item['answer_template'] ),
			'enabled'        => true,
		);
	}
	update_option( 'sous_faqs', $all );
	return $all;
}
