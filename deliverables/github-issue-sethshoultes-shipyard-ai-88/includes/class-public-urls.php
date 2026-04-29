<?php
/**
 * Public transcript URLs and deep-linking.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_Public_URLs
 */
class Scribe_Public_URLs {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'add_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'render_transcript_page' ) );
	}

	/**
	 * Add rewrite rules.
	 */
	public function add_rewrite_rules() {
		add_rewrite_rule(
			'transcript/([^/]+)/?$',
			'index.php?scribe_transcript=$matches[1]',
			'top'
		);
	}

	/**
	 * Add custom query vars.
	 *
	 * @param array $vars Query vars.
	 * @return array
	 */
	public function add_query_vars( $vars ) {
		$vars[] = 'scribe_transcript';
		return $vars;
	}

	/**
	 * Render the public transcript page.
	 */
	public function render_transcript_page() {
		$slug = get_query_var( 'scribe_transcript' );
		if ( empty( $slug ) ) {
			return;
		}

		$post = get_page_by_path( $slug, OBJECT, 'any' );
		if ( ! $post ) {
			return;
		}

		if ( post_password_required( $post->ID ) ) {
			return;
		}

		$transcript = Scribe_Storage::get_transcript( $post->ID );
		$audio_url  = get_post_meta( $post->ID, '_scribe_audio_url', true );
		$timestamp  = isset( $_GET['t'] ) ? absint( sanitize_text_field( wp_unslash( $_GET['t'] ) ) ) : 0;

		?&gt;
		<!DOCTYPE html>
		<html <?php language_attributes(); ?&gt;>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?&gt;" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title><?php echo esc_html( get_the_title( $post->ID ) ); ?&gt; <?php esc_html_e( '— Transcript', 'scribe' ); ?&gt;</title>
			<?php wp_head(); ?&gt;
			<link rel="alternate" type="application/json+oembed" href="<?php echo esc_url( get_oembed_endpoint_url( get_permalink( $post->ID ) ) ); ?&gt;" />
		</head>
		<body <?php body_class(); ?&gt;>
			<div class="scribe-public-wrap"&gt;
				<h1><?php echo esc_html( get_the_title( $post->ID ) ); ?&gt;</h1&gt;
				<?php if ( $audio_url ) : ?&gt;
					<audio id="scribe-public-audio" controls src="<?php echo esc_url( $audio_url ); ?&gt;" data-start="<?php echo esc_attr( $timestamp ); ?&gt;"></audio>
				<?php endif; ?&gt;
				<?php if ( $transcript && isset( $transcript['segments'] ) ) : ?&gt;
					<div class="scribe-transcript"&gt;
						<?php foreach ( $transcript['segments'] as $segment ) : ?&gt;
							<p data-start="<?php echo esc_attr( isset( $segment['start'] ) ? $segment['start'] : 0 ); ?>">
								<?php echo esc_html( isset( $segment['text'] ) ? $segment['text'] : '' ); ?>
							</p>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<p><?php esc_html_e( 'No transcript available.', 'scribe' ); ?></p>
				<?php endif; ?>
			</div>
			<?php wp_footer(); ?>
		</body>
		</html>
		<?php
		exit;
	}
}
