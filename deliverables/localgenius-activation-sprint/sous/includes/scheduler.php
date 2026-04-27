<?php
/**
 * Sous Weekly Digest Scheduler.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_run_weekly_digest() {
	$admin_email = get_option( 'admin_email' );
	$user_id    = get_current_user_id();
	$category   = sous_get_option( 'sous_category' );
	$city       = sous_get_option( 'sous_city' );
	if ( empty( $category ) ) {
		$category = 'generic';
	}
	if ( empty( $city ) ) {
		$city = 'Local';
	}
	global $wpdb;
	$table_metrics   = $wpdb->prefix . 'sous_metrics';
	$table_benchmark = $wpdb->prefix . 'sous_benchmarks';
	$reviews_responded       = 0;
	$avg_response_time_hours = 0;
	$percentile              = null;
	$peer_count              = 0;
	$has_tables = $wpdb->get_var( "SHOW TABLES LIKE '$table_metrics'" ) === $table_metrics;
	if ( $has_tables ) {
		$metrics = $wpdb->get_row( $wpdb->prepare(
			"SELECT reviews_responded, avg_response_time_hours FROM $table_metrics WHERE user_id = %d",
			$user_id
		) );
		if ( $metrics ) {
			$reviews_responded       = intval( $metrics->reviews_responded );
			$avg_response_time_hours = floatval( $metrics->avg_response_time_hours );
		}
		$peers = $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM $table_benchmark WHERE benchmark_category = %s AND benchmark_city = %s",
			$category, $city
		) );
		$peer_count = intval( $peers );
		if ( $peer_count >= 10 ) {
			$sql = "SELECT PERCENT_RANK() WITHIN GROUP (
				ORDER BY avg_response_time_hours DESC
			) OVER () AS p
			FROM $table_metrics m
			JOIN $table_benchmark b ON m.user_id = b.user_id
			WHERE b.benchmark_category = %s AND b.benchmark_city = %s AND m.user_id = %d";
			$rank = $wpdb->get_var( $wpdb->prepare( $sql, $category, $city, $user_id ) );
			$percentile = is_null( $rank ) ? null : round( floatval( $rank ) * 100, 1 );
		}
	}
	$business_name = sous_get_option( 'sous_business_name' );
	if ( empty( $business_name ) ) {
		$business_name = get_bloginfo( 'name' );
	}
	$subject = 'Your Sous Weekly Digest';
	$body    = "Hi there,\n\n";
	$body   .= "Here is your weekly digest for " . esc_html( $business_name ) . ".\n\n";
	$body   .= "Reviews responded to this week: " . intval( $reviews_responded ) . "\n";
	if ( $avg_response_time_hours > 0 ) {
		$body .= "Your average response time: " . round( $avg_response_time_hours, 1 ) . " hours";
		if ( ! is_null( $percentile ) ) {
			$body .= " — that is faster than " . $percentile . "% of " . esc_html( $category ) . " businesses in " . esc_html( $city ) . ".";
		} else {
			$body .= ".";
		}
		$body .= "\n";
	}
	$body .= "There is always room to climb. Your AI assistant is learning more about your guests every day.\n\n";
	$body .= "First weekly digest arrives Monday for new activations. Keep up the great work.\n\n";
	$body .= "— Sous\n";
	wp_mail( $admin_email, $subject, $body );
}
add_action( 'sous_weekly_digest', 'sous_run_weekly_digest' );
