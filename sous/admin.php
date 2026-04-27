<?php
/**
 * Single Admin Page — collapsible sections, auto-save, no wizard.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_register_admin_menu() {
	add_menu_page(
		'Sous',
		'Sous',
		'manage_options',
		'sous',
		'sous_render_admin_page',
		'dashicons-admin-comments',
		30
	);
}
add_action( 'admin_menu', 'sous_register_admin_menu' );

function sous_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'sous' ) );
	}

	$business_name = sous_get_option( 'sous_business_name' );
	$category      = sous_get_option( 'sous_category' );
	$address       = sous_get_option( 'sous_address' );
	$phone         = sous_get_option( 'sous_phone' );
	$hours         = sous_get_option( 'sous_hours' );
	$auto_inject   = sous_get_option( 'sous_widget_auto_inject' );
	$brand_color   = sous_get_option( 'sous_brand_color' );
	$faqs          = sous_get_option( 'sous_faqs' );
	if ( ! is_array( $faqs ) ) {
		$faqs = array();
	}

	$detected = get_option( 'sous_detected_business', array() );
	$has_detected = ( is_array( $detected ) && ! empty( $detected['business_name'] ) );
	?&gt;
	<div class="wrap" id="sous-admin"&gt;
		<h1&gt;<?php echo esc_html( get_admin_page_title() ); ?&gt;</h1&gt;

		<?php if ( $has_detected ) : ?&gt;
			<div class="sous-notice sous-notice--info"&gt;
				<p&gt;<?php
					echo esc_html( sprintf( 'We found %s. Does this look like you?', $detected['business_name'] ) );
				?&gt;</p&gt;
			</div&gt;
		<?php endif; ?&gt;

		<!-- Business Profile --&gt;
		<section class="sous-section"&gt;
			<button class="sous-section__toggle" aria-expanded="true"&gt;
				<span class="sous-section__title">Business Profile</span&gt;
				<span class="sous-section__icon"&gt;−</span&gt;
			</button&gt;
			<div class="sous-section__content"&gt;
				<table class="form-table"&gt;
					<tr&gt;
						<th scope="row"><label for="sous_business_name">Business Name</label></th>
						<td><input type="text" id="sous_business_name" name="sous_business_name" value="<?php echo esc_attr( $business_name ); ?>" class="sous-autosave regular-text" data-key="sous_business_name" /></td>
					</tr&gt;
					<tr&gt;
						<th scope="row"><label for="sous_category">Category</label></th>
						<td&gt;
							<select id="sous_category" name="sous_category" class="sous-autosave" data-key="sous_category">
								<option value="" <?php selected( '', $category ); ?>>Select…</option>
								<option value="restaurant" <?php selected( 'restaurant', $category ); ?>>Restaurant</option>
								<option value="dental" <?php selected( 'dental', $category ); ?>>Dental</option>
								<option value="retail" <?php selected( 'retail', $category ); ?>>Retail</option>
								<option value="services" <?php selected( 'services', $category ); ?>>Services</option>
								<option value="generic" <?php selected( 'generic', $category ); ?>>Generic</option>
							</select>
						</td>
					</tr&gt;
					<tr&gt;
						<th scope="row"><label for="sous_address">Address</label></th>
						<td&gt;<input type="text" id="sous_address" name="sous_address" value="<?php echo esc_attr( $address ); ?>" class="sous-autosave regular-text" data-key="sous_address" /></td>
					</tr&gt;
					<tr&gt;
						<th scope="row"><label for="sous_phone">Phone</label></th>
						<td&gt;<input type="text" id="sous_phone" name="sous_phone" value="<?php echo esc_attr( $phone ); ?>" class="sous-autosave regular-text" data-key="sous_phone" /></td>
					</tr&gt;
					<tr&gt;
						<th scope="row"><label for="sous_hours">Hours</label></th>
						<td&gt;<input type="text" id="sous_hours" name="sous_hours" value="<?php echo esc_attr( $hours ); ?>" class="sous-autosave regular-text" data-key="sous_hours" /></td>
					</tr&gt;
				</table&gt;
				<p>If detection missed something, just type it in above. Your AI assistant will use whatever you enter here.</p>
			</div&gt;
		</section&gt;

		<!-- FAQ Templates --&gt;
		<section class="sous-section"&gt;
			<button class="sous-section__toggle" aria-expanded="true"&gt;
				<span class="sous-section__title">FAQ Templates</span>
				<span class="sous-section__icon"&gt;−</span&gt;
			</button&gt;
			<div class="sous-section__content"&gt;
				<p>We drafted common questions for your category. Toggle the ones that fit.</p>
				<div class="sous-faq-actions"&gt;
					<button type="button" id="sous-faq-add-all" class="button">Add all</button>
					<button type="button" id="sous-faq-select-none" class="button">Select none</button>
				</div>
				<div id="sous-faq-list"&gt;
					<?php
					$templates = sous_load_faq_templates( $category );
					foreach ( $templates as $index => $faq ) :
						$checked = isset( $faqs[ $faq['question'] ] ) ? checked( '1', $faqs[ $faq['question'] ]['enabled'], false ) : '';
						$answer  = isset( $faqs[ $faq['question'] ] ) ? $faqs[ $faq['question'] ]['answer'] : $faq['answer_template'];
					?&gt;
					<div class="sous-faq-item"&gt;
						<label&gt;
							<input type="checkbox" class="sous-faq-toggle" data-question="<?php echo esc_attr( $faq['question'] ); ?>" <?php echo $checked; ?> />
							<strong><?php echo esc_html( $faq['question'] ); ?></strong>
						</label&gt;
						<textarea class="sous-faq-answer" data-question="<?php echo esc_attr( $faq['question'] ); ?>" rows="2"&gt;<?php echo esc_textarea( $answer ); ?></textarea>
					</div&gt;
					<?php endforeach; ?&gt;
				</div&gt;
			</div&gt;
		</section&gt;

		<!-- Widget Settings --&gt;
		<section class="sous-section"&gt;
			<button class="sous-section__toggle" aria-expanded="true"&gt;
				<span class="sous-section__title">Widget Settings</span&gt;
				<span class="sous-section__icon"&gt;−</span&gt;
			</button&gt;
			<div class="sous-section__content"&gt;
				<table class="form-table"&gt;
					<tr&gt;
						<th scope="row">Auto-inject widget</th>
						<td&gt;
							<label>
								<input type="checkbox" id="sous_widget_auto_inject" class="sous-autosave" data-key="sous_widget_auto_inject" value="1" <?php checked( '1', $auto_inject ); ?> />
								Show the chat widget on every page
							</label>
						</td>
					</tr&gt;
					<tr&gt;
						<th scope="row"><label for="sous_brand_color">Brand Color</label></th>
						<td&gt;<input type="color" id="sous_brand_color" name="sous_brand_color" value="<?php echo esc_attr( $brand_color ); ?>" class="sous-autosave" data-key="sous_brand_color" /></td>
					</tr&gt;
				</table&gt;
				<p><a href="<?php echo esc_url( home_url() ); ?>" target="_blank" class="button button-primary">See Your Live Widget</a></p&gt;
			</div&gt;
		</section&gt;

		<span id="sous-save-status" class="sous-save-status" aria-live="polite"></span&gt;
	</div&gt;
	<?php
}

function sous_load_faq_templates( $category ) {
	$json_path = SOUS_DIR . 'data/templates.json';
	$all = array();
	if ( file_exists( $json_path ) ) {
		$raw = file_get_contents( $json_path );
		$all = json_decode( $raw, true );
	}
	if ( ! is_array( $all ) ) {
		$all = array();
	}
	if ( ! empty( $category ) && isset( $all[ $category ] ) && is_array( $all[ $category ] ) ) {
		return $all[ $category ];
	}
	if ( isset( $all['generic'] ) && is_array( $all['generic'] ) ) {
		return $all['generic'];
	}
	return array();
}

function sous_save_field_ajax() {
	check_ajax_referer( 'sous_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => 'Permission denied.' ) );
	}

	$key   = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
	$value = isset( $_POST['value'] ) ? sanitize_text_field( wp_unslash( $_POST['value'] ) ) : '';

	if ( empty( $key ) ) {
		wp_send_json_error( array( 'message' => 'Missing key.' ) );
	}

	sous_update_option( $key, $value );
	wp_send_json_success( array( 'saved' => true ) );
}
add_action( 'wp_ajax_sous_save_field', 'sous_save_field_ajax' );

function sous_save_faq_ajax() {
	check_ajax_referer( 'sous_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => 'Permission denied.' ) );
	}

	$question = isset( $_POST['question'] ) ? sanitize_text_field( wp_unslash( $_POST['question'] ) ) : '';
	$enabled  = isset( $_POST['enabled'] ) ? '1' : '0';
	$answer   = isset( $_POST['answer'] ) ? wp_kses_post( wp_unslash( $_POST['answer'] ) ) : '';

	$faqs = sous_get_option( 'sous_faqs' );
	if ( ! is_array( $faqs ) ) {
		$faqs = array();
	}
	$faqs[ $question ] = array(
		'enabled' => $enabled,
		'answer'  => $answer,
	);
	sous_update_faq_option( 'sous_faqs', $faqs );
	wp_send_json_success( array( 'saved' => true ) );
}
add_action( 'wp_ajax_sous_save_faq', 'sous_save_faq_ajax' );
