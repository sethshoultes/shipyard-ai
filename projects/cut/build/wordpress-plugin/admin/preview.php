<?php
/**
 * Preview iframe wrapper
 *
 * @param string $changelog_text — raw changelog to inject into the preview
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function cut_render_preview( $changelog_text ) {
	$client_index = CUT_URL . 'client/index.html';
	$encoded      = rawurlencode( $changelog_text );
	$iframe_src   = esc_url( $client_index . '?changelog=' . $encoded );
	$height       = '480';
?>
	<div class="cut-preview-wrap" style="margin-top:1.5rem;">
		<iframe
			id="cut-preview-iframe"
			src="<?php echo $iframe_src; ?>"
			width="100%"
			height="<?php echo esc_attr( $height ); ?>"
			style="border:1px solid #c3c4c7;border-radius:2px;background:#fff;"
			title="<?php esc_attr_e( 'Changelog Theatre Preview', 'cut' ); ?>"
		></iframe>
	</div>
	<script>
	(function () {
		var iframe = document.getElementById('cut-preview-iframe');
		var text = <?php echo wp_json_encode( $changelog_text ); ?>;
		iframe.addEventListener('load', function () {
			iframe.contentWindow.postMessage({ type: 'cut-changelog', text: text }, '*');
		});
	})();
	</script>
<?php
}
