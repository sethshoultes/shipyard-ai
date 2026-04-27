<?php
/**
 * Tier and Licensing
 *
 * @package WP_Intelligence_Suite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WIS_TIER_FREE', 'free' );
define( 'WIS_TIER_PRO', 'pro' );

if ( ! defined( 'WIS_STRIPE_CHECKOUT_URL' ) ) {
	define( 'WIS_STRIPE_CHECKOUT_URL', 'https://buy.stripe.com/9AQ4gC5Tb3jF8rCdQR' );
}

/**
 * Feature map.
 *
 * @return array
 */
function wis_feature_map() {
	$map = array(
		'localgenius_basic' => true,
		'dash_basic'        => true,
		'pinned_basic'      => true,
		'usage_unlimited'   => false,
	);

	return apply_filters( 'wis_feature_map', $map );
}

/**
 * Get current tier.
 *
 * @return string
 */
function wis_get_tier() {
	$tier = get_option( 'wis_tier', WIS_TIER_FREE );
	return apply_filters( 'wis_get_tier', $tier );
}

/**
 * Check if pro.
 *
 * @return bool
 */
function wis_is_pro() {
	return WIS_TIER_PRO === wis_get_tier();
}

/**
 * Check if a feature is available.
 *
 * @param string $feature_key Feature key.
 * @return bool
 */
function wis_is_feature_available( $feature_key ) {
	$map = wis_feature_map();

	if ( wis_is_pro() ) {
		return true;
	}

	if ( isset( $map[ $feature_key ] ) ) {
		return (bool) $map[ $feature_key ];
	}

	return false;
}
