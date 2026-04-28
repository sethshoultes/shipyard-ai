<?php
/**
 * Admin page — paste, preview, publish
 *
 * Capability: manage_options
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( esc_html__( 'You do not have sufficient permissions.', 'cut' ) );
}

$changelog_text = '';
if ( isset( $_POST['cut_changelog'] ) && check_admin_referer( 'cut_admin_nonce' ) ) {
	$changelog_text = sanitize_textarea_field( wp_unslash( $_POST['cut_changelog'] ) );
}
?>
<div class="wrap">
	<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
	<p><?php esc_html_e( 'Paste your readme.txt changelog below and preview the animated theatre.', 'cut' ); ?></p>

	<form method="post" action="">
		<?php wp_nonce_field( 'cut_admin_nonce' ); ?>
		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="cut_changelog"><?php esc_html_e( 'Changelog', 'cut' ); ?></label>
				</th>
				<td>
					<textarea
						id="cut_changelog"
						name="cut_changelog"
						rows="20"
						cols="80"
						class="large-text code"
						placeholder="== Changelog ==

= 1.0 =
* First release."
					><?php echo esc_textarea( $changelog_text ); ?></textarea>
				</td>
			</tr>
		</table>
		<?php submit_button( __( 'Preview', 'cut' ), 'primary', 'cut_preview', false ); ?>
	</form>

	<?php if ( ! empty( $changelog_text ) ) : ?>
		<h2><?php esc_html_e( 'Preview', 'cut' ); ?></h2>
		<?php
		$preview_url = admin_url( 'admin.php?page=cut-theatre&cut_preview=1' );
		require_once CUT_DIR . 'admin/preview.php';
		cut_render_preview( $changelog_text );
		?>
	<?php endif; ?>
</div>
