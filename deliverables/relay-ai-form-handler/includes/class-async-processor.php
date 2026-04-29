<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay_Async_Processor {

	public static function init() {
		add_action( 'relay_process_leads', array( __CLASS__, 'process_batch' ) );
	}

	public static function process_batch() {
		$pending = get_posts( array(
			'post_type'      => 'relay_lead',
			'posts_per_page' => 10,
			'meta_key'       => '_relay_status',
			'meta_value'     => 'pending',
			'orderby'        => 'date',
			'order'          => 'ASC',
			'fields'         => 'ids',
		) );

		if ( empty( $pending ) ) {
			update_option( 'relay_last_cron_run', time() );
			return;
		}

		foreach ( $pending as $post_id ) {
			self::classify_and_route( $post_id );
		}

		update_option( 'relay_last_cron_run', time() );
	}

	private static function classify_and_route( $post_id ) {
		$message = get_post_meta( $post_id, '_relay_message', true );
		if ( empty( $message ) ) {
			$message = get_the_title( $post_id );
		}

		$cache_hit = false;
		$result    = false;

		if ( class_exists( 'Relay_Cache' ) ) {
			$result = Relay_Cache::get( $message );
			if ( false !== $result ) {
				$cache_hit = true;
			}
		}

		if ( false === $result && class_exists( 'Relay_Claude_Client' ) ) {
			$result = Relay_Claude_Client::classify( $message );
		}

		if ( false === $result || ! is_array( $result ) ) {
			update_post_meta( $post_id, '_relay_status', 'failed' );
			return;
		}

		if ( ! $cache_hit && class_exists( 'Relay_Cache' ) ) {
			Relay_Cache::set( $message, $result );
		}

		update_post_meta( $post_id, '_relay_classification_json', wp_json_encode( $result ) );

		$category = isset( $result['category'] ) ? sanitize_text_field( $result['category'] ) : 'General';
		$urgency  = isset( $result['urgency'] ) ? sanitize_text_field( $result['urgency'] ) : 'Medium';

		wp_set_object_terms( $post_id, $category, 'relay_category', false );
		wp_set_object_terms( $post_id, $urgency, 'relay_urgency', false );

		if ( 'Spam' === $category ) {
			update_post_meta( $post_id, '_relay_status', 'quarantined' );
			return;
		}

		update_post_meta( $post_id, '_relay_status', 'classified' );
		self::route_email( $post_id, $category );
	}

	private static function route_email( $post_id, $category ) {
		$options = get_option( 'relay_options', array() );
		$email   = '';

		switch ( $category ) {
			case 'Sales':
				$email = ! empty( $options['relay_sales_email'] ) ? $options['relay_sales_email'] : '';
				break;
			case 'Support':
				$email = ! empty( $options['relay_support_email'] ) ? $options['relay_support_email'] : '';
				break;
			case 'General':
				$email = ! empty( $options['relay_general_email'] ) ? $options['relay_general_email'] : '';
				break;
		}

		if ( empty( $email ) ) {
			return;
		}

		$lead_email = get_post_meta( $post_id, '_relay_email', true );
		$subject    = sprintf(
			/* translators: %s: lead category */
			__( 'New %s Lead', 'relay' ),
			$category
		);
		$body       = sprintf(
			"From: %s\n\n%s",
			$lead_email,
			get_post_meta( $post_id, '_relay_message', true )
		);
		$headers    = array( 'Content-Type: text/plain; charset=UTF-8' );

		wp_mail( $email, $subject, $body, $headers );
	}
}
