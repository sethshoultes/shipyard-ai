<?php
/**
 * Blocked Widget Template
 *
 * @package LocalGenius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$nudge = isset( $nudge ) ? $nudge : '';
?>
<div class="localgenius-widget localgenius-blocked" role="region" aria-label="<?php echo esc_attr__( 'LocalGenius FAQ', 'localgenius' ); ?>">
	<div class="localgenius-header">
		<h3><?php echo esc_html__( 'Frequently Asked Questions', 'localgenius' ); ?></h3>
	</div>
	<?php if ( ! empty( $nudge ) ) : ?>
		<div class="localgenius-nudge">
			<?php echo wp_kses_post( $nudge ); ?>
		</div>
	<?php endif; ?>
</div>
