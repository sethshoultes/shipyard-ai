<?php
/**
 * Shortcode handler: [cut changelog="..."] or [cut id="..."]
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render the Cut changelog theatre shortcode.
 *
 * @param array $atts Shortcode attributes.
 * @return string HTML output.
 */
function cut_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'changelog' => '',
			'id'        => '',
		),
		$atts,
		'cut'
	);

	$changelog = sanitize_textarea_field( $atts['changelog'] );
	$id        = sanitize_text_field( $atts['id'] );

	if ( empty( $changelog ) && empty( $id ) ) {
		return '<p class="cut-error">' . esc_html__( 'Please provide a changelog attribute.', 'cut' ) . '</p>';
	}

	$container_id = 'cut-stage-' . wp_unique_id();

	ob_start();
	?>
	<div id="<?php echo esc_attr( $container_id ); ?>" class="cut-shortcode-wrap" style="min-height:320px;position:relative;">
		<noscript>
			<p><?php esc_html_e( 'JavaScript is required to view the Changelog Theatre.', 'cut' ); ?></p>
		</noscript>
	</div>
	<script>
	(function () {
		var container = document.getElementById('<?php echo esc_js( $container_id ); ?>');
		var text = <?php echo wp_json_encode( $changelog ); ?>;
		if (!text || !window.CutParser) {
			container.innerHTML = '<p class="cut-error"><?php echo esc_js( __( 'Unable to load Changelog Theatre.', 'cut' ) ); ?></p>';
			return;
		}
		try {
			var data = window.CutParser.parse(text);
			var seq = window.CutSequence.create(container, data, {
				versionDuration: 6000,
				transitionDuration: 700,
				autoAdvance: true
			});
			seq.play();
		} catch (err) {
			if (window.CutRenderer) {
				window.CutRenderer.renderError(container, err.message);
			} else {
				container.innerHTML = '<p class="cut-error">' + err.message + '</p>';
			}
		}
	})();
	</script>
	<?php
	return ob_get_clean();
}
add_shortcode( 'cut', 'cut_shortcode' );
