<?php
/**
 * Minimal admin settings page.
 */
class Whisper_Settings {

	/**
	 * Option key.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'whisper_api_key';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Register the settings page.
	 */
	public function register_menu() {
		add_options_page(
			__( 'Whisper Settings', 'whisper' ),
			__( 'Whisper', 'whisper' ),
			'manage_options',
			'whisper-settings',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting( 'whisper_settings_group', self::OPTION_KEY );
	}

	/**
	 * Render the settings page.
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions.', 'whisper' ) );
		}

		$constant_defined = defined( 'WHISPER_API_KEY' );
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( 'whisper_settings_group' );
				do_settings_sections( 'whisper-settings' );
				?&gt;
				<table class="form-table">
					<tr>
						<th scope="row"><label for="whisper_api_key"><?php esc_html_e( 'OpenAI API Key', 'whisper' ); ?></label></th>
						<td>
							<input
								type="text"
								id="whisper_api_key"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?&gt;"
								value="<?php echo esc_attr( get_option( self::OPTION_KEY, '' ) ); ?&gt;"
								class="regular-text"
								<?php disabled( $constant_defined ); ?&gt;
							/>
							<?php if ( $constant_defined ) : ?&gt;
								<p class="description"><?php esc_html_e( 'API key is defined via the WHISPER_API_KEY constant in wp-config.php.', 'whisper' ); ?&gt;</p>
							<?php endif; ?&gt;
						</td>
					</tr>
				</table>
				<?php
				wp_nonce_field( 'whisper_settings_action', 'whisper_settings_nonce' );
				submit_button( __( 'Save Changes', 'whisper' ) );
				?&gt;
			</form>
		</div>
		<?php
	}
}
