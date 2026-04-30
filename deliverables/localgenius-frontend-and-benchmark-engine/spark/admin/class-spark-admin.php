<?php
/**
 * SPARK_Admin
 *
 * One-screen admin: onboarding + widget toggle.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SPARK_Admin {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'wp_ajax_spark_save_settings', array( $this, 'ajax_save' ) );
		add_action( 'wp_ajax_spark_fetch_preview', array( $this, 'ajax_preview' ) );
	}

	public function register_menu() {
		add_menu_page(
			__( 'SPARK', 'spark' ),
			__( 'SPARK', 'spark' ),
			'manage_options',
			'spark',
			array( $this, 'render' ),
			'dashicons-format-chat',
			30
		);
	}

	public function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'spark' ) );
		}

		$api      = new SPARK_API();
		$faq      = new SPARK_FAQ();
		$business_url = get_option( 'spark_business_url', '' );
		$widget_enabled = get_option( 'spark_widget_enabled', '0' );
		$greeting   = get_option( 'spark_greeting', __( 'Hi there. How can we help today?', 'spark' ) );
		$position   = get_option( 'spark_position', 'bottom-right' );
		$theme      = get_option( 'spark_theme', 'light' );
		$api_key    = get_option( 'spark_api_key', '' );
		$active_faqs = $faq->get_active();

		if ( empty( $active_faqs ) && ! empty( $business_url ) ) {
			$detected = $api->get_detect_preview( $business_url );
			$cat = ( ! is_wp_error( $detected ) && ! empty( $detected['category'] ) ) ? $detected['category'] : 'general';
			$active_faqs = $faq->get_templates( $cat );
		}

		?&gt;
		<div class="wrap spark-admin"&gt;
			<h1><?php echo esc_html( get_admin_page_title() ); ?&gt;</h1>

			<form id="spark-admin-form" method="post"&gt;
				<?php wp_nonce_field( 'spark_admin_nonce', 'spark_admin_nonce' ); ?&gt;

				<section class="spark-card"&gt;
					<h2><?php esc_html_e( 'Get started', 'spark' ); ?&gt;</h2>
					<p class="spark-desc"&gt;<?php esc_html_e( 'Enter your business URL and we will pull in your details.', 'spark' ); ?&gt;</p>
					<label for="spark_business_url"&gt;<?php esc_html_e( 'Business URL', 'spark' ); ?&gt;</label>
					<input
						type="url"
						id="spark_business_url"
						name="spark_business_url"
						value="<?php echo esc_url( $business_url ); ?&gt;"
						placeholder="<?php echo esc_attr( get_site_url() ); ?>"
						class="regular-text"
					/>
					<button type="button" id="spark-fetch-preview" class="button"&gt;<?php esc_html_e( 'Preview', 'spark' ); ?&gt;</button>
					<div id="spark-preview-card" class="spark-preview-card" style="display:none;"&gt;</div>
				</section>

				<section class="spark-card"&gt;
					<h2><?php esc_html_e( 'Widget', 'spark' ); ?&gt;</h2>
					<p class="spark-desc"&gt;<?php esc_html_e( 'Turn the chat widget on and pick how it looks.', 'spark' ); ?&gt;</p>

					<div class="spark-field"&gt;
						<label class="spark-toggle"&gt;
							<input type="checkbox" id="spark_widget_enabled" name="spark_widget_enabled" value="1" <?php checked( '1', $widget_enabled ); ?&gt; />
							<span class="spark-toggle-slider"></span>
							<span class="spark-toggle-label"><?php esc_html_e( 'Show chat widget on site', 'spark' ); ?&gt;</span>
						</label>
					</div>

					<div class="spark-field"&gt;
						<label for="spark_greeting"><?php esc_html_e( 'Greeting message', 'spark' ); ?&gt;</label>
						<input type="text" id="spark_greeting" name="spark_greeting" value="<?php echo esc_attr( $greeting ); ?&gt;" class="regular-text" />
					</div>

					<div class="spark-field"&gt;
						<label for="spark_position"><?php esc_html_e( 'Position', 'spark' ); ?&gt;</label>
						<select id="spark_position" name="spark_position"&gt;
							<option value="bottom-right" <?php selected( 'bottom-right', $position ); ?&gt;><?php esc_html_e( 'Bottom right', 'spark' ); ?&gt;</option>
							<option value="bottom-left" <?php selected( 'bottom-left', $position ); ?&gt;><?php esc_html_e( 'Bottom left', 'spark' ); ?&gt;</option>
						</select>
					</div>

					<div class="spark-field"&gt;
						<label for="spark_theme"><?php esc_html_e( 'Theme', 'spark' ); ?&gt;</label>
						<select id="spark_theme" name="spark_theme"&gt;
							<option value="light" <?php selected( 'light', $theme ); ?&gt;><?php esc_html_e( 'Light', 'spark' ); ?&gt;</option>
							<option value="dark" <?php selected( 'dark', $theme ); ?&gt;><?php esc_html_e( 'Dark', 'spark' ); ?&gt;</option>
							<option value="brand" <?php selected( 'brand', $theme ); ?&gt;><?php esc_html_e( 'Brand', 'spark' ); ?&gt;</option>
						</select>
					</div>

					<div class="spark-field"&gt;
						<label for="spark_api_key"><?php esc_html_e( 'API Key', 'spark' ); ?&gt;</label>
						<input type="text" id="spark_api_key" name="spark_api_key" value="<?php echo esc_attr( $api_key ); ?&gt;" class="regular-text" />
					</div>
				</section>

				<section class="spark-card"&gt;
					<h2><?php esc_html_e( 'Common questions', 'spark' ); ?&gt;</h2>
					<p class="spark-desc"&gt;<?php esc_html_e( 'Toggle the questions you want visitors to see first.', 'spark' ); ?&gt;</p>
					<ul class="spark-faq-list"&gt;
						<?php foreach ( $active_faqs as $i => $f ) : ?&gt;
							<li class="spark-faq-item"&gt;
								<label class="spark-faq-toggle"&gt;
									<input
										type="checkbox"
										name="spark_faqs[<?php echo esc_attr( $i ); ?&gt;][enabled]"
										value="1"
										<?php checked( ! empty( $f['enabled'] ) ); ?&gt;
									/>
									<span class="spark-faq-text"><?php echo esc_html( $f['question'] ); ?&gt;</span>
								</label>
								<input type="hidden" name="spark_faqs[<?php echo esc_attr( $i ); ?&gt;][question]" value="<?php echo esc_attr( $f['question'] ); ?&gt;" />
								<input type="hidden" name="spark_faqs[<?php echo esc_attr( $i ); ?&gt;][answer]" value="<?php echo esc_attr( $f['answer'] ); ?&gt;" />
								<input type="hidden" name="spark_faqs[<?php echo esc_attr( $i ); ?&gt;][index]" value="<?php echo esc_attr( $i ); ?&gt;" />
							</li>
						<?php endforeach; ?&gt;
					</ul>
				</section>

				<button type="submit" class="button button-primary"><?php esc_html_e( 'Save settings', 'spark' ); ?&gt;</button>
			</form>
		</div>
		<?php
	}

	public function ajax_save() {
		check_ajax_referer( 'spark_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'Permission denied.', 'spark' ) );
		}

		$business_url = isset( $_POST['spark_business_url'] ) ? esc_url_raw( wp_unslash( $_POST['spark_business_url'] ) ) : '';
		$widget_enabled = isset( $_POST['spark_widget_enabled'] ) ? '1' : '0';
		$greeting   = isset( $_POST['spark_greeting'] ) ? sanitize_text_field( wp_unslash( $_POST['spark_greeting'] ) ) : '';
		$position   = isset( $_POST['spark_position'] ) ? sanitize_text_field( wp_unslash( $_POST['spark_position'] ) ) : 'bottom-right';
		$theme      = isset( $_POST['spark_theme'] ) ? sanitize_text_field( wp_unslash( $_POST['spark_theme'] ) ) : 'light';
		$api_key    = isset( $_POST['spark_api_key'] ) ? sanitize_text_field( wp_unslash( $_POST['spark_api_key'] ) ) : '';

		update_option( 'spark_business_url', $business_url );
		update_option( 'spark_widget_enabled', $widget_enabled );
		update_option( 'spark_greeting', $greeting );
		update_option( 'spark_position', $position );
		update_option( 'spark_theme', $theme );
		update_option( 'spark_api_key', $api_key );

		$faqs_raw = isset( $_POST['spark_faqs'] ) ? wp_unslash( $_POST['spark_faqs'] ) : array();
		$faqs = array();
		if ( is_array( $faqs_raw ) ) {
			foreach ( $faqs_raw as $f ) {
				$faqs[] = array(
					'question' => isset( $f['question'] ) ? sanitize_text_field( $f['question'] ) : '',
					'answer'   => isset( $f['answer'] ) ? sanitize_textarea_field( $f['answer'] ) : '',
					'enabled'  => isset( $f['enabled'] ) ? 1 : 0,
					'index'    => isset( $f['index'] ) ? intval( $f['index'] ) : 0,
				);
			}
		}

		$faq = new SPARK_FAQ();
		$faq->save_active( $faqs );

		wp_send_json_success( __( 'Saved.', 'spark' ) );
	}

	public function ajax_preview() {
		check_ajax_referer( 'spark_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'Permission denied.', 'spark' ) );
		}

		$url = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
		if ( empty( $url ) ) {
			wp_send_json_error( __( 'Please enter a URL.', 'spark' ) );
		}

		$api = new SPARK_API();
		$data = $api->get_detect_preview( $url );

		if ( is_wp_error( $data ) ) {
			wp_send_json_error( $data->get_error_message() );
		}

		wp_send_json_success( $data );
	}
}
