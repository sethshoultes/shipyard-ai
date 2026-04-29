<?php
/**
 * Admin settings page.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_Settings
 */
class Scribe_Settings {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Add the settings page.
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Scribe Settings', 'scribe' ),
			__( 'Scribe', 'scribe' ),
			'manage_options',
			'scribe-settings',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting(
			'scribe_settings_group',
			'scribe_api_key',
			array(
				'sanitize_callback' => array( $this, 'sanitize_api_key' ),
			)
		);
	}

	/**
	 * Sanitize and encrypt the API key.
	 *
	 * @param string $value Raw API key.
	 * @return string Encrypted key.
	 */
	public function sanitize_api_key( $value ) {
		if ( defined( 'SCRIBE_API_KEY' ) ) {
			return get_option( 'scribe_api_key', '' );
		}

		$value = sanitize_text_field( wp_unslash( $value ) );
		if ( empty( $value ) ) {
			return '';
		}

		$key = substr( hash( 'sha256', defined( 'LOGGED_IN_KEY' ) ? LOGGED_IN_KEY : 'scribe-default-key' ), 0, 16 );
		$encrypted = openssl_encrypt( $value, 'AES-128-ECB', $key );
		return base64_encode( $encrypted );
	}

	/**
	 * Render the settings page.
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'scribe' ) );
		}
		?&gt;
		<div class="wrap"&gt;
			<h1&gt;<?php echo esc_html( get_admin_page_title() ); ?&gt;</h1&gt;
			<form method="post" action="options.php"&gt;
				<?php
				settings_fields( 'scribe_settings_group' );
				do_settings_sections( 'scribe-settings' );
				?&gt;
				<table class="form-table"&gt;
					<tr&gt;
						<th scope="row"&gt;<label for="scribe_api_key"&gt;<?php esc_html_e( 'OpenAI API Key', 'scribe' ); ?&gt;</label&gt;</th&gt;
						<td&gt;
							<?php if ( defined( 'SCRIBE_API_KEY' ) ) : ?&gt;
								<p class="description"&gt;<?php esc_html_e( 'Your API key is defined in wp-config.php and cannot be edited here.', 'scribe' ); ?&gt;</p&gt;
							<?php else : ?&gt;
								<input type="password" id="scribe_api_key" name="scribe_api_key" value="" class="regular-text" /&gt;
								<p class="description"&gt;<?php esc_html_e( 'Enter your OpenAI API key to enable transcription.', 'scribe' ); ?&gt;</p&gt;
							<?php endif; ?&gt;
						</td&gt;
					</tr&gt;
				</table&gt;
				<?php submit_button( __( 'Save Settings', 'scribe' ) ); ?&gt;
			</form&gt;
		</div&gt;
		<?php
	}
}
