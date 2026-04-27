<?php
/**
 * Weekly Digest Scheduler — benchmark query + wp_mail sender.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_send_weekly_digest() {
	$admin_email = get_option( 'admin_email' );
	if ( empty( $admin_email ) ) {
		return;
	}

	$user_id     = get_current_user_id();
	$category    = sous_get_option( 'sous_category' );
	$business_name = sous_get_option( 'sous_business_name' );

	if ( empty( $category ) ) {
		$category = 'generic';
	}

	$subject = 'Your Weekly Sous Digest';

	$body = "Hi there,\n\n";
	$body .= "Here is your weekly digest from Sous.\n\n";

	global $wpdb;
	$table_metrics   = $wpdb-> prefix . 'sous_user_metrics';
	$table_benchmarks = $wpdb-> prefix . 'sous_benchmarks';

	$has_tables = ( $wpdb-> get_var( "SHOW TABLES LIKE '$table_metrics'" ) === $table_metrics &&
					$wpdb-> get_var( "SHOW TABLES LIKE '$table_benchmarks'" ) === $table_benchmarks );

	if ( $has_tables ) {
		$sql = "SELECT me.reviews_responded, me.avg_response_time_hours, PERCENT_RANK() OVER (PARTITION BY bm.benchmark_category, bm.benchmark_city ORDER BY me.avg_response_time_hours DESC) as response_time_percentile FROM {$table_metrics} me JOIN {$table_benchmarks} bm ON me.user_id = bm.user_id WHERE me.user_id = %d";
		$row = $wpdb-> get_row( $wpdb-> prepare( $sql, $user_id ) );

		if ( $row ) {
			$body .= "Reviews responded: " . intval( $row-> reviews_responded ) . "\n";
			$body .= "Average response time: " . round( floatval( $row-> avg_response_time_hours ), 1 ) . " hours\n";

			$peer_count = $wpdb-> get_var( $wpdb-> prepare(
				"SELECT COUNT(*) FROM {$table_benchmarks} WHERE benchmark_category = %s",
				$category
			) );

			if ( intval( $peer_count ) >= 10 && null !== $row-> response_time_percentile ) {
				$percentile = round( floatval( $row-> response_time_percentile ) * 100 );
				$body .= "That is faster than " . $percentile . "% of " . esc_html( $category ) . " businesses in your area.\n";
				$body .= "Room to climb. Keep going.\n";
			} else {
				$body .= "You are responding to reviews in " . round( floatval( $row-> avg_response_time_hours ), 1 ) . " hours.\n";
				$body .= "Once we have more businesses in your category, we will show your percentile ranking. Room to climb.\n";
			}
		}
	} else {
		$body .= "Your AI assistant is live. We will start tracking your metrics as soon as data flows in.\n";
		$body .= "First weekly digest arrives Monday with benchmarking insights.\n";
	}

	$body .= "\n— Sous\n";

	wp_mail( $admin_email, $subject, $body );
}
add_action( 'sous_weekly_digest', 'sous_send_weekly_digest' );
