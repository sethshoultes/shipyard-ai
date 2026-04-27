<?php
if (!defined('ABSPATH')) {
	exit;
}

class Scribe_Settings {

	public function __construct() {
		add_action('admin_menu', array($this, 'add_menu'));
		add_action('admin_init', array($this, 'register_settings'));
	}

	public function add_menu() {
		add_options_page(
			__('Scribe Settings', 'scribe'),
			__('Scribe', 'scribe'),
			'manage_options',
			'scribe-settings',
			array($this, 'render_page')
		);
	}

	public function register_settings() {
		register_setting('scribe_settings', 'scribe_api_key', array(
			'sanitize_callback' => 'sanitize_text_field',
		));
	}

	public function render_page() {
		if (!current_user_can('manage_options')) {
			wp_die(esc_html__('You do not have sufficient permissions.', 'scribe'));
		}
		$constant_defined = defined('SCRIBE_API_KEY') && SCRIBE_API_KEY;
		?>
		<div class="wrap">
			<h1><?php echo esc_html(get_admin_page_title()); ?></h1>
			<form method="post" action="options.php">
				<?php settings_fields('scribe_settings'); ?>
				<?php do_settings_sections('scribe-settings'); ?>
				<table class="form-table">
					<tr>
						<th scope="row"><label for="scribe_api_key"><?php esc_html_e('OpenAI API Key', 'scribe'); ?></label></th>
						<td>
							<?php if ($constant_defined) : ?>
								<input type="text" id="scribe_api_key" value="********************************" class="regular-text" disabled>
								<p class="description"><?php esc_html_e('API key is defined via the SCRIBE_API_KEY constant in wp-config.php.', 'scribe'); ?></p>
							<?php else : ?>
								<input type="text" name="scribe_api_key" id="scribe_api_key" value="<?php echo esc_attr(get_option('scribe_api_key', '')); ?>" class="regular-text">
								<p class="description"><?php esc_html_e('Your OpenAI API key is required for transcription.', 'scribe'); ?></p>
							<?php endif; ?>
						</td>
					</tr>
				</table>
				<?php if (!$constant_defined) : ?>
					<?php submit_button(); ?>
				<?php endif; ?>
			</form>
		</div>
		<?php
	}
}
