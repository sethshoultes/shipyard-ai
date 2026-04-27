<?php
/**
 * Widget Template
 *
 * @package LocalGenius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$faqs = isset( $faqs ) ? $faqs : array();
$nudge = isset( $nudge ) ? $nudge : '';
?>
<div class="localgenius-widget" role="region" aria-label="<?php echo esc_attr__( 'LocalGenius FAQ', 'localgenius' ); ?>">
	<div class="localgenius-header">
		<h3><?php echo esc_html__( 'Frequently Asked Questions', 'localgenius' ); ?></h3>
		<input type="text" class="localgenius-search" placeholder="<?php echo esc_attr__( 'Search questions...', 'localgenius' ); ?>" aria-label="<?php echo esc_attr__( 'Search FAQs', 'localgenius' ); ?>" />
	</div>
	<div class="localgenius-faq-list">
		<?php foreach ( $faqs as $index => $faq ) : ?>
			<div class="localgenius-faq-item" tabindex="0" role="button" aria-expanded="false">
				<div class="localgenius-question">
					<?php echo esc_html( $faq['question'] ); ?>
					<span class="localgenius-toggle" aria-hidden="true">+</span>
				</div>
				<div class="localgenius-answer" hidden>
					<?php echo wp_kses_post( $faq['answer'] ); ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
	<?php if ( ! empty( $nudge ) ) : ?>
		<div class="localgenius-nudge">
			<?php echo wp_kses_post( $nudge ); ?>
		</div>
	<?php endif; ?>
</div>
