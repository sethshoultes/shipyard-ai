<?php
/**
 * Settings class.
 *
 * @package WP_Sentinel
 */

namespace WPSentinel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings class.
 */
class Settings {

	/**
	 * Option key.
	 *
	 * @var string
	 */
	private $option_key = 'wpsentinel_settings';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'wp_ajax_wpsentinel_save_settings', array( $this, 'ajax_save_settings' ) );
		add_action( 'wp_ajax_wpsentinel_get_settings', array( $this, 'ajax_get_settings' ) );
	}

	/**
	 * Register admin menu page under Tools.
	 */
	public function register_menu_page() {
		add_submenu_page(
			'tools.php',
			__( 'Sentinel', 'wp-sentinel' ),
			__( 'Sentinel', 'wp-sentinel' ),
			'manage_options',
			'wpsentinel',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting(
			'wpsentinel_settings_group',
			$this->option_key,
			array( $this, 'sanitize_settings' )
		);
	}

	/**
	 * Sanitize settings.
	 *
	 * @param array $input Raw input.
	 * @return array Sanitized input.
	 */
	public function sanitize_settings( $input ) {
		$sanitized = array();

		if ( isset( $input['worker_url'] ) ) {
			$sanitized['worker_url'] = esc_url_raw( $input['worker_url'] );
		}
		if ( isset( $input['api_key'] ) ) {
			$sanitized['api_key'] = sanitize_text_field( $input['api_key'] );
		}
		if ( isset( $input['enable_health_widget'] ) ) {
			$sanitized['enable_health_widget'] = '1' === $input['enable_health_widget'] || true === $input['enable_health_widget'] ? '1' : '0';
		} else {
			$sanitized['enable_health_widget'] = '0';
		}
		if ( isset( $input['enable_chat_widget'] ) ) {
			$sanitized['enable_chat_widget'] = '1' === $input['enable_chat_widget'] || true === $input['enable_chat_widget'] ? '1' : '0';
		} else {
			$sanitized['enable_chat_widget'] = '0';
		}

		return $sanitized;
	}

	/**
	 * Get default settings.
	 *
	 * @return array
	 */
	public function get_defaults() {
		return array(
			'worker_url'          => '',
			'api_key'             => '',
			'enable_health_widget' => '1',
			'enable_chat_widget'   => '1',
		);
	}

	/**
	 * Get current settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		$stored   = get_option( $this->option_key, array() );
		$defaults = $this->get_defaults();
		return wp_parse_args( $stored, $defaults );
	}

	/**
	 * Render settings page.
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions.', 'wp-sentinel' ) );
		}

		$settings = $this->get_settings();
		?\>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( 'wpsentinel_settings_group' );
				do_settings_sections( 'wpsentinel_settings_group' );
				?\>
				<table class="form-table">
					<tr>
						<th scope="row"><label for="wpsentinel_worker_url"><?php esc_html_e( 'Worker URL', 'wp-sentinel' ); ?></label></th>
						<td>
							<input type="url" name="wpsentinel_settings[worker_url]" id="wpsentinel_worker_url" value="<?php echo esc_attr( $settings['worker_url'] ); ?>" class="regular-text" />
							<p class="description"><?php esc_html_e( 'Your Cloudflare Worker endpoint URL.', 'wp-sentinel' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="wpsentinel_api_key"><?php esc_html_e( 'API Key', 'wp-sentinel' ); ?></label></th>
						<td>
							<input type="password" name="wpsentinel_settings[api_key]" id="wpsentinel_api_key" value="<?php echo esc_attr( $settings['api_key'] ); ?>" class="regular-text" />
							<p class="description"><?php esc_html_e( 'API key for your Cloudflare Worker.', 'wp-sentinel' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Enable Health Widget', 'wp-sentinel' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="wpsentinel_settings[enable_health_widget]" value="1" <?php checked( '1', $settings['enable_health_widget'] ); ?> />
								<?php esc_html_e( 'Show the health widget on the dashboard.', 'wp-sentinel' ); ?>
							</label>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Enable Chat Widget', 'wp-sentinel' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="wpsentinel_settings[enable_chat_widget]" value="1" <?php checked( '1', $settings['enable_chat_widget'] ); ?> />
								<?php esc_html_e( 'Show the AI chat widget in the admin.', 'wp-sentinel' ); ?>
							</label>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
			<p>
				<a href="https://github.com/shipyard-ai/wp-sentinel" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Documentation', 'wp-sentinel' ); ?></a> |
				<a href="https://shipyard.ai/wp-sentinel" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Upgrade', 'wp-sentinel' ); ?></a>
			</p>
		</div>
		<?php
	}

	/**
	 * AJAX save settings.
	 */
	public function ajax_save_settings() {
		check_ajax_referer( 'wpsentinel_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'Unauthorized', 'wp-sentinel' ), 403 );
		}

		$input    = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$sanitized = $this->sanitize_settings( $input );
		update_option( $this->option_key, $sanitized );

		wp_send_json_success( $sanitized );
	}

	/**
	 * AJAX get settings.
	 */
	public function ajax_get_settings() {
		check_ajax_referer( 'wpsentinel_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error( __( 'Unauthorized', 'wp-sentinel' ), 403 );
		}

		wp_send_json_success( $this->get_settings() );
	}
}
