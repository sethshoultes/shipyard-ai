<?php
/**
 * Admin Class
 *
 * @package LocalGenius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register settings page.
 */
function localgenius_register_admin_page() {
	add_submenu_page(
		'options-general.php',
		__( 'LocalGenius', 'localgenius' ),
		__( 'LocalGenius', 'localgenius' ),
		'manage_options',
		'localgenius-settings',
		'localgenius_render_admin_page'
	);
}
add_action( 'admin_menu', 'localgenius_register_admin_page' );

/**
 * Render settings page.
 */
function localgenius_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'localgenius' ) );
	}

	if ( isset( $_POST['localgenius_placement'] ) && isset( $_POST['localgenius_settings_nonce'] ) ) {
		if ( wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['localgenius_settings_nonce'] ) ), 'localgenius_save_settings' ) ) {
			$placement = sanitize_text_field( wp_unslash( $_POST['localgenius_placement'] ) );
			if ( in_array( $placement, array( 'shortcode', 'auto' ), true ) ) {
				update_option( 'localgenius_placement', $placement );
			}
		}
	}

	$placement = get_option( 'localgenius_placement', 'shortcode' );
	?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form method="post" action="">
			<?php wp_nonce_field( 'localgenius_save_settings', 'localgenius_settings_nonce' ); ?>
			<table class="form-table">
				<tr>
					<th scope="row"><?php echo esc_html__( 'Widget Placement', 'localgenius' ); ?></th>
					<td>
						<select name="localgenius_placement">
							<option value="shortcode" <?php selected( $placement, 'shortcode' ); ?>><?php echo esc_html__( 'Shortcode only', 'localgenius' ); ?></option>
							<option value="auto" <?php selected( $placement, 'auto' ); ?>><?php echo esc_html__( 'Auto-inject in footer', 'localgenius' ); ?></option>
						</select>
						<p class="description"><?php echo esc_html__( 'Choose how the widget appears on your site.', 'localgenius' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button( __( 'Save Changes', 'localgenius' ) ); ?>
		</form>
	</div>
	<?php
}
