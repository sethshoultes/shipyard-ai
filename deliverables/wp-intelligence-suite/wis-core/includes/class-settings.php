<?php
/**
 * Settings Page
 *
 * @package WP_Intelligence_Suite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register settings page.
 */
function wis_core_register_settings_page() {
	add_options_page(
		__( 'Intelligence', 'wis-core' ),
		__( 'Intelligence', 'wis-core' ),
		'manage_options',
		'wis-settings',
		'wis_core_render_settings_page'
	);
}
add_action( 'admin_menu', 'wis_core_register_settings_page' );

/**
 * Render settings page.
 */
function wis_core_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'wis-core' ) );
	}

	if ( isset( $_POST['wis_license_key'] ) && isset( $_POST['wis_settings_nonce'] ) ) {
		if ( wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wis_settings_nonce'] ) ), 'wis_save_settings' ) ) {
			$license = sanitize_text_field( wp_unslash( $_POST['wis_license_key'] ) );
			update_option( 'wis_license_key', $license );
			if ( ! empty( $license ) ) {
				update_option( 'wis_tier', WIS_TIER_PRO );
			} else {
				update_option( 'wis_tier', WIS_TIER_FREE );
			}
		}
	}

	$license = get_option( 'wis_license_key', '' );
	$tier    = wis_get_tier();
	$stripe_url = apply_filters( 'wis_stripe_checkout_url', WIS_STRIPE_CHECKOUT_URL );
	?
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form method="post" action="">
			<?php wp_nonce_field( 'wis_save_settings', 'wis_settings_nonce' ); ?>
			<table class="form-table">
				<tr>
					<th scope="row"><label for="wis_license_key"><?php echo esc_html__( 'License Key', 'wis-core' ); ?></label></th>
					<td>
						<input type="text" name="wis_license_key" id="wis_license_key" value="<?php echo esc_attr( $license ); ?>" class="regular-text" />
						<p class="description"><?php echo esc_html__( 'Enter your license key to activate Pro features.', 'wis-core' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__( 'Current Tier', 'wis-core' ); ?></th>
					<td><code><?php echo esc_html( $tier ); ?></code></td>
				</tr>
			</table>
			<?php submit_button( __( 'Save Changes', 'wis-core' ) ); ?>
		</form>
		<?php if ( WIS_TIER_FREE === $tier ) : ?>
			<p>
				<a href="<?php echo esc_url( $stripe_url ); ?>" class="button button-primary" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html__( 'Upgrade to Pro', 'wis-core' ); ?>
				</a>
			</p>
			<p class="description"><?php echo esc_html__( 'After payment, enter your license key above to unlock Pro features.', 'wis-core' ); ?></p>
		<?php endif; ?>
	</div>
	<?php
}
