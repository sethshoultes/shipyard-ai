<?php
/**
 * License validation and usage metering.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_License
 */
class Scribe_License {

	/**
	 * Free tier cap in minutes.
	 *
	 * @var int
	 */
	const FREE_TIER_CAP = 60;

	/**
	 * Usage option key.
	 *
	 * @var string
	 */
	const USAGE_OPTION = 'scribe_usage_minutes';

	/**
	 * License option key.
	 *
	 * @var string
	 */
	const LICENSE_OPTION = 'scribe_license_key';

	/**
	 * Validate a license key.
	 *
	 * @param string $license_key License key.
	 * @return bool
	 */
	public static function validate_license( $license_key ) {
		$license_key = sanitize_text_field( $license_key );
		if ( empty( $license_key ) ) {
			return false;
		}

		// Stub: always valid for v1.
		return true;
	}

	/**
	 * Check if the site has a valid license.
	 *
	 * @return bool
	 */
	public static function is_licensed() {
		$key = get_option( self::LICENSE_OPTION, '' );
		return self::validate_license( $key );
	}

	/**
	 * Get current usage in minutes.
	 *
	 * @return int
	 */
	public static function get_usage() {
		$usage = get_option( self::USAGE_OPTION, array() );
		if ( ! is_array( $usage ) ) {
			$usage = array();
		}

		$month = gmdate( 'Y-m' );
		return isset( $usage[ $month ] ) ? absint( $usage[ $month ] ) : 0;
	}

	/**
	 * Increment usage by minutes.
	 *
	 * @param int $minutes Minutes to add.
	 */
	public static function increment_usage( $minutes ) {
		$minutes = absint( $minutes );
		$usage   = get_option( self::USAGE_OPTION, array() );
		if ( ! is_array( $usage ) ) {
			$usage = array();
		}

		$month = gmdate( 'Y-m' );
		if ( ! isset( $usage[ $month ] ) ) {
			$usage[ $month ] = 0;
		}

		$usage[ $month ] += $minutes;
		update_option( self::USAGE_OPTION, $usage );
	}

	/**
	 * Check if usage is within free tier.
	 *
	 * @param int $requested_minutes Minutes requested.
	 * @return bool
	 */
	public static function can_process( $requested_minutes = 0 ) {
		if ( self::is_licensed() ) {
			return true;
		}

		$current = self::get_usage();
		return ( $current + absint( $requested_minutes ) ) <= self::FREE_TIER_CAP;
	}

	/**
	 * Get upgrade message.
	 *
	 * @return string
	 */
	public static function get_upgrade_message() {
		return __( 'You have reached the 60-minute monthly limit. Upgrade to continue transcribing.', 'scribe' );
	}
}
