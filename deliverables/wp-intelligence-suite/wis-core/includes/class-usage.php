<?php
/**
 * Usage Limits
 *
 * @package WP_Intelligence_Suite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get current usage data.
 *
 * @return array
 */
function wis_get_usage() {
	$count = (int) get_option( 'wis_usage_count', 0 );
	$month_start = (int) get_option( 'wis_month_start', current_time( 'timestamp' ) );
	$now = current_time( 'timestamp' );

	if ( gmdate( 'Y-m', $month_start ) !== gmdate( 'Y-m', $now ) ) {
		$count = 0;
		update_option( 'wis_month_start', $now );
		update_option( 'wis_usage_count', 0 );
	}

	return array(
		'count'       => $count,
		'month_start' => $month_start,
		'limit'       => WIS_FREE_LIMIT,
		'remaining'   => max( 0, WIS_FREE_LIMIT - $count ),
	);
}

/**
 * Increment usage counter.
 *
 * @return bool
 */
function wis_increment_usage() {
	if ( wis_is_pro() ) {
		return true;
	}

	$usage = wis_get_usage();
	$count = $usage['count'] + 1;
	update_option( 'wis_usage_count', $count );

	return $count <= WIS_FREE_LIMIT;
}

/**
 * Check if usage is at or above limit.
 *
 * @return bool
 */
function wis_is_usage_blocked() {
	if ( wis_is_pro() ) {
		return false;
	}

	$usage = wis_get_usage();
	return $usage['count'] >= WIS_FREE_LIMIT;
}

/**
 * Maybe show a warm inline nudge.
 *
 * @return string
 */
function wis_maybe_show_nudge() {
	if ( wis_is_pro() ) {
		return '';
	}

	$usage = wis_get_usage();
	$percent = ( $usage['count'] / WIS_FREE_LIMIT ) * 100;

	if ( $percent >= 80 && $percent < 100 ) {
		return '<p class="wis-nudge">' . esc_html__( 'You are moving fast. Want me to keep up? Upgrade to Pro for more responses.', 'wis-core' ) . '</p>';
	}

	if ( $percent >= 100 ) {
		return '<p class="wis-nudge">' . esc_html__( 'You have reached your monthly limit. Upgrade to Pro to continue.', 'wis-core' ) . '</p>';
	}

	return '';
}
