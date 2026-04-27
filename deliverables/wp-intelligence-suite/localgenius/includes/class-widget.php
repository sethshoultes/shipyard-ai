<?php
/**
 * Widget Class
 *
 * @package LocalGenius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LocalGenius Widget
 */
class LocalGenius_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_shortcode( 'localgenius', array( $this, 'render_shortcode' ) );
		add_action( 'wp_footer', array( $this, 'maybe_auto_inject' ) );
	}

	/**
	 * Get FAQs.
	 *
	 * @return array
	 */
	public function get_faqs() {
		$seed = get_option( 'wis_faq_seed', array() );
		if ( ! is_array( $seed ) ) {
			$seed = array();
		}
		return $seed;
	}

	/**
	 * Render shortcode.
	 *
	 * @param array $atts Attributes.
	 * @return string
	 */
	public function render_shortcode( $atts ) {
		ob_start();
		$this->render_widget();
		return ob_get_clean();
	}

	/**
	 * Maybe auto-inject in footer.
	 */
	public function maybe_auto_inject() {
		$placement = get_option( 'localgenius_placement', 'shortcode' );
		if ( 'auto' === $placement ) {
			$this->render_widget();
		}
	}

	/**
	 * Render widget HTML.
	 */
	public function render_widget() {
		$faqs = $this->get_faqs();
		$usage = wis_get_usage();
		$blocked = wis_is_usage_blocked();
		$nudge = wis_maybe_show_nudge();

		if ( $blocked && ! wis_is_pro() ) {
			include LOCALGENIUS_DIR . 'templates/widget-blocked.php';
			return;
		}

		include LOCALGENIUS_DIR . 'templates/widget.php';

		if ( ! wis_is_pro() ) {
			wis_increment_usage();
		}
	}
}

new LocalGenius_Widget();
