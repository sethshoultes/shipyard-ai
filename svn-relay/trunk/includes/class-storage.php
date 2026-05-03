<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay_Storage {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_cpt' ) );
		add_action( 'init', array( __CLASS__, 'register_taxonomies' ) );
	}

	public static function activate() {
		self::register_cpt();
		self::register_taxonomies();
		self::ensure_default_terms();
		flush_rewrite_rules();
	}

	public static function register_cpt() {
		$labels = array(
			'name'          => __( 'Leads', 'relay' ),
			'singular_name' => __( 'Lead', 'relay' ),
		);

		$args = array(
			'labels'       => $labels,
			'public'       => false,
			'show_ui'      => true,
			'show_in_menu' => false,
			'supports'     => array( 'title' ),
			'can_export'   => true,
		);

		register_post_type( 'relay_lead', $args );
	}

	public static function register_taxonomies() {
		register_taxonomy(
			'relay_category',
			'relay_lead',
			array(
				'hierarchical' => true,
				'labels'         => array(
					'name' => __( 'Categories', 'relay' ),
				),
				'show_ui'      => false,
				'query_var'    => true,
				'rewrite'      => false,
			)
		);

		register_taxonomy(
			'relay_urgency',
			'relay_lead',
			array(
				'hierarchical' => false,
				'labels'       => array(
					'name' => __( 'Urgency', 'relay' ),
				),
				'show_ui'      => false,
				'query_var'    => true,
				'rewrite'      => false,
			)
		);

		register_post_meta( 'relay_lead', '_relay_email', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => false,
		) );
		register_post_meta( 'relay_lead', '_relay_message', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => false,
		) );
		register_post_meta( 'relay_lead', '_relay_source', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => false,
		) );
		register_post_meta( 'relay_lead', '_relay_raw_json', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => false,
		) );
		register_post_meta( 'relay_lead', '_relay_classification_json', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => false,
		) );
		register_post_meta( 'relay_lead', '_relay_status', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => false,
			'default'      => 'pending',
		) );
	}

	public static function ensure_default_terms() {
		$categories = array( 'Sales', 'Support', 'Spam', 'General' );
		foreach ( $categories as $cat ) {
			if ( ! term_exists( $cat, 'relay_category' ) ) {
				wp_insert_term( $cat, 'relay_category' );
			}
		}

		$urgencies = array( 'High', 'Medium', 'Low' );
		foreach ( $urgencies as $urg ) {
			if ( ! term_exists( $urg, 'relay_urgency' ) ) {
				wp_insert_term( $urg, 'relay_urgency' );
			}
		}
	}

	public static function create_lead( $data ) {
		$title = isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : __( 'Unnamed Lead', 'relay' );
		if ( empty( $title ) ) {
			$title = __( 'Unnamed Lead', 'relay' );
		}

		$post_id = wp_insert_post( array(
			'post_type'   => 'relay_lead',
			'post_title'  => $title,
			'post_status' => 'publish',
		) );

		if ( is_wp_error( $post_id ) || 0 === $post_id ) {
			return false;
		}

		if ( isset( $data['email'] ) ) {
			update_post_meta( $post_id, '_relay_email', sanitize_email( $data['email'] ) );
		}
		if ( isset( $data['message'] ) ) {
			update_post_meta( $post_id, '_relay_message', sanitize_textarea_field( $data['message'] ) );
		}
		if ( isset( $data['source'] ) ) {
			update_post_meta( $post_id, '_relay_source', sanitize_text_field( $data['source'] ) );
		}

		update_post_meta( $post_id, '_relay_raw_json', wp_json_encode( $data ) );
		update_post_meta( $post_id, '_relay_status', 'pending' );

		return $post_id;
	}
}
