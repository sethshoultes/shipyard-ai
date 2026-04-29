<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$options = get_option( 'relay_options', array() );
$api_key = relay_decrypt_api_key();
$cf7_enabled  = ! empty( $options['cf7_integration'] );
$rest_enabled = ! empty( $options['rest_integration'] );
$secret_token = ! empty( $options['relay_secret_token'] ) ? $options['relay_secret_token'] : '';

$sales_email   = ! empty( $options['relay_sales_email'] ) ? $options['relay_sales_email'] : '';
$support_email = ! empty( $options['relay_support_email'] ) ? $options['relay_support_email'] : '';
$general_email = ! empty( $options['relay_general_email'] ) ? $options['relay_general_email'] : '';
?>
<div class="wrap">
	<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
	<form method="post" action="options.php">
		<?php settings_fields( 'relay_options' ); ?>
		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="relay_api_key"><?php esc_html_e( 'Claude API Key', 'relay' ); ?></label>
				</th>
				<td>
					<input type="password" id="relay_api_key" name="relay_options[relay_api_key]" value="" placeholder="<?php echo $api_key ? esc_attr__( 'Key saved (enter to change)', 'relay' ) : ''; ?>" class="regular-text" />
					<p class="description">
						<?php esc_html_e( 'Your API key is encrypted at rest. You can also define RELAY_API_KEY in wp-config.php.', 'relay' ); ?>
					</p>
					<?php if ( defined( 'RELAY_API_KEY' ) ) : ?>
						<p class="description" style="color:#22c55e;">
							<?php esc_html_e( 'Currently overridden by RELAY_API_KEY constant.', 'relay' ); ?>
						</p>
					<?php endif; ?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="relay_secret_token"><?php esc_html_e( 'REST Secret Token', 'relay' ); ?></label>
				</th>
				<td>
					<input type="text" id="relay_secret_token" name="relay_options[relay_secret_token]" value="<?php echo esc_attr( $secret_token ); ?>" class="regular-text" />
					<p class="description">
						<?php esc_html_e( 'Send this token in the x-relay-token header for REST submissions.', 'relay' ); ?>
					</p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<?php esc_html_e( 'Routing Emails', 'relay' ); ?>
				</th>
				<td>
					<label for="relay_sales_email"><?php esc_html_e( 'Sales', 'relay' ); ?></label><br/>
					<input type="email" id="relay_sales_email" name="relay_options[relay_sales_email]" value="<?php echo esc_attr( $sales_email ); ?>" class="regular-text" /><br/><br/>
					<label for="relay_support_email"><?php esc_html_e( 'Support', 'relay' ); ?></label><br/>
					<input type="email" id="relay_support_email" name="relay_options[relay_support_email]" value="<?php echo esc_attr( $support_email ); ?>" class="regular-text" /><br/><br/>
					<label for="relay_general_email"><?php esc_html_e( 'General', 'relay' ); ?></label><br/>
					<input type="email" id="relay_general_email" name="relay_options[relay_general_email]" value="<?php echo esc_attr( $general_email ); ?>" class="regular-text" />
				</td>
			</tr>
			<tr>
				<th scope="row">
					<?php esc_html_e( 'Integrations', 'relay' ); ?>
				</th>
				<td>
					<label>
						<input type="checkbox" name="relay_options[cf7_integration]" value="1" <?php checked( $cf7_enabled ); ?> />
						<?php esc_html_e( 'Enable Contact Form 7 interception', 'relay' ); ?>
					</label>
					<br/>
					<label>
						<input type="checkbox" name="relay_options[rest_integration]" value="1" <?php checked( $rest_enabled ); ?> />
						<?php esc_html_e( 'Enable generic REST endpoint', 'relay' ); ?>
					</label>
				</td>
			</tr>
		</table>
		<?php submit_button( __( 'Save Settings', 'relay' ) ); ?>
	</form>

	<?php if ( ! defined( 'RELAY_API_KEY' ) ) : ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<?php wp_nonce_field( 'relay_action', 'relay_nonce' ); ?>
			<input type="hidden" name="action" value="relay_purge_cache" />
			<?php submit_button( __( 'Purge Classification Cache', 'relay' ), 'secondary' ); ?>
		</form>
	<?php endif; ?>
</div>
