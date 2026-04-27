<?php
/**
 * Sous Single-Screen Admin Page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sous_register_admin_page() {
	add_menu_page(
		'Sous',
		'Sous',
		'manage_options',
		'sous',
		'sous_render_admin_page',
		'dashicons-admin-generic',
		30
	);
}
add_action( 'admin_menu', 'sous_register_admin_page' );

function sous_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'sous' ) );
	}
	$detected = get_transient( 'sous_detected_business' );
	if ( false === $detected ) {
		$detected = array(
			'business_name' => '',
			'category'      => '',
			'phone'         => '',
			'address'       => '',
			'hours'         => '',
		);
	}
	$business_name = sous_get_option( 'sous_business_name' );
	if ( empty( $business_name ) ) {
		$business_name = ! empty( $detected['business_name'] ) ? $detected['business_name'] : get_bloginfo( 'name' );
	}
	$category = sous_get_option( 'sous_category' );
	if ( empty( $category ) ) {
		$category = ! empty( $detected['category'] ) ? $detected['category'] : 'generic';
	}
	$phone   = sous_get_option( 'sous_phone' );
	$address = sous_get_option( 'sous_address' );
	$hours   = sous_get_option( 'sous_hours' );
	$widget_mode = sous_get_option( 'sous_widget_mode' );
	if ( empty( $widget_mode ) ) {
		$widget_mode = 'auto';
	}
	$brand_color = sous_get_option( 'sous_brand_color' );
	if ( empty( $brand_color ) ) {
		$brand_color = '#2c3e50';
	}
	wp_nonce_field( 'sous_admin_nonce', 'sous_admin_nonce' );
	?>
	<div class="wrap" id="sous-admin-wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<?php if ( ! empty( $detected['business_name'] ) ) : ?>
			<div class="sous-notice notice notice-info">
				<p><?php printf( esc_html__( 'We found %1$s. Does this look like you?', 'sous' ), '<strong>' . esc_html( $detected['business_name'] ) . '</strong>' ); ?></p>
			</div>
		<?php endif; ?>

		<div class="sous-section">
			<h2 class="sous-section-title"><?php esc_html_e( 'Business Profile', 'sous' ); ?></h2>
			<div class="sous-section-content">
				<label><?php esc_html_e( 'Business Name', 'sous' ); ?></label>
				<input type="text" name="sous_business_name" value="<?php echo esc_attr( $business_name ); ?>" data-key="sous_business_name" />
				<label><?php esc_html_e( 'Category', 'sous' ); ?></label>
				<select name="sous_category" data-key="sous_category">
					<option value="restaurant" <?php selected( $category, 'restaurant' ); ?>><?php esc_html_e( 'Restaurant', 'sous' ); ?></option>
					<option value="dental" <?php selected( $category, 'dental' ); ?>><?php esc_html_e( 'Dental', 'sous' ); ?></option>
					<option value="retail" <?php selected( $category, 'retail' ); ?>><?php esc_html_e( 'Retail', 'sous' ); ?></option>
					<option value="services" <?php selected( $category, 'services' ); ?>><?php esc_html_e( 'Services', 'sous' ); ?></option>
					<option value="generic" <?php selected( $category, 'generic' ); ?>><?php esc_html_e( 'Generic', 'sous' ); ?></option>
				</select>
				<label><?php esc_html_e( 'Phone', 'sous' ); ?></label>
				<input type="text" name="sous_phone" value="<?php echo esc_attr( $phone ); ?>" data-key="sous_phone" />
				<label><?php esc_html_e( 'Address', 'sous' ); ?></label>
				<input type="text" name="sous_address" value="<?php echo esc_attr( $address ); ?>" data-key="sous_address" />
				<label><?php esc_html_e( 'Hours', 'sous' ); ?></label>
				<input type="text" name="sous_hours" value="<?php echo esc_attr( $hours ); ?>" data-key="sous_hours" />
			</div>
		</div>

		<div class="sous-section">
			<h2 class="sous-section-title"><?php esc_html_e( 'FAQ Templates', 'sous' ); ?></h2>
			<div class="sous-section-content">
				<div class="sous-faq-actions">
					<button type="button" id="sous-faq-add-all"><?php esc_html_e( 'Add all', 'sous' ); ?></button>
					<button type="button" id="sous-faq-select-none"><?php esc_html_e( 'Select none', 'sous' ); ?></button>
				</div>
				<div id="sous-faq-list">
					<?php
					$faqs = sous_get_faqs();
					foreach ( $faqs as $i => $faq ) :
					?>
						<div class="sous-faq-item" data-index="<?php echo esc_attr( $i ); ?>">
							<input type="checkbox" class="sous-faq-toggle" <?php checked( $faq['enabled'], true ); ?> />
							<input type="text" class="sous-faq-question" value="<?php echo esc_attr( $faq['question'] ); ?>" />
							<textarea class="sous-faq-answer"><?php echo esc_textarea( $faq['answer_template'] ); ?></textarea>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>

		<div class="sous-section">
			<h2 class="sous-section-title"><?php esc_html_e( 'Widget Settings', 'sous' ); ?></h2>
			<div class="sous-section-content">
				<label>
					<input type="radio" name="sous_widget_mode" value="auto" <?php checked( $widget_mode, 'auto' ); ?> data-key="sous_widget_mode" />
					<?php esc_html_e( 'Auto-inject on every page', 'sous' ); ?>
				</label>
				<label>
					<input type="radio" name="sous_widget_mode" value="shortcode" <?php checked( $widget_mode, 'shortcode' ); ?> data-key="sous_widget_mode" />
					<?php esc_html_e( 'Shortcode only', 'sous' ); ?>
				</label>
				<label><?php esc_html_e( 'Brand Color', 'sous' ); ?></label>
				<input type="color" name="sous_brand_color" value="<?php echo esc_attr( $brand_color ); ?>" data-key="sous_brand_color" />
				<p><a href="<?php echo esc_url( home_url( '/' ) ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'See Your Live Widget', 'sous' ); ?></a></p>
			</div>
		</div>
	</div>
	<?php
}

function sous_ajax_save_field() {
	check_ajax_referer( 'sous_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( 'Permission denied.' );
	}
	$key   = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
	$value = isset( $_POST['value'] ) ? sanitize_text_field( wp_unslash( $_POST['value'] ) ) : '';
	if ( empty( $key ) ) {
		wp_send_json_error( 'Missing key.' );
	}
	$result = sous_update_option( $key, $value );
	if ( $result ) {
		wp_send_json_success( 'Saved' );
	} else {
		wp_send_json_error( 'No change or error.' );
	}
}
add_action( 'wp_ajax_sous_save_field', 'sous_ajax_save_field' );
