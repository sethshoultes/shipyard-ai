<?php
/**
 * Transcript library dashboard.
 *
 * @package Scribe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Scribe_Library
 */
class Scribe_Library {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu_page' ) );
	}

	/**
	 * Add the library submenu.
	 */
	public function add_menu_page() {
		add_submenu_page(
			'options-general.php',
			__( 'Transcript Library', 'scribe' ),
			__( 'Transcript Library', 'scribe' ),
			'manage_options',
			'scribe-library',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the library page.
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'scribe' ) );
		}

		$posts = get_posts(
			array(
				'post_type'      => 'any',
				'post_status'    => 'any',
				'posts_per_page' => 50,
				'meta_query'     => array(
					array(
						'key'     => '_scribe_transcript',
						'compare' => 'EXISTS',
					),
				),
			)
		);

		$total_minutes = 0;
		$count         = 0;

		foreach ( $posts as $post ) {
			$duration = get_post_meta( $post->ID, '_scribe_duration', true );
			if ( $duration ) {
				$total_minutes += ceil( floatval( $duration ) / 60 );
			}
			$count++;
		}

		?&gt;
		<div class="wrap"&gt;
			<h1&gt;<?php esc_html_e( 'Transcript Library', 'scribe' ); ?&gt;</h1&gt;
			<p&gt;<?php echo esc_html( sprintf( __( '%1$d transcripts — %2$d total minutes processed', 'scribe' ), $count, $total_minutes ) ); ?&gt;</p&gt;
			<form method="get"&gt;
				<input type="hidden" name="page" value="scribe-library" /&gt;
				<input type="text" name="s" value="<?php echo esc_attr( isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '' ); ?&gt;" placeholder="<?php esc_attr_e( 'Search transcripts by post title...', 'scribe' ); ?&gt;" /&gt;
				<?php wp_nonce_field( 'scribe_library_search', 'scribe_library_nonce' ); ?&gt;
				<?php submit_button( __( 'Filter', 'scribe' ), 'secondary', '', false ); ?&gt;
			</form&gt;
			<table class="wp-list-table widefat fixed striped"&gt;
				<thead&gt;
					<tr&gt;
						<th&gt;<?php esc_html_e( 'Post', 'scribe' ); ?&gt;</th&gt;
						<th&gt;<?php esc_html_e( 'Date', 'scribe' ); ?&gt;</th&gt;
						<th&gt;<?php esc_html_e( 'Status', 'scribe' ); ?&gt;</th&gt;
						<th&gt;<?php esc_html_e( 'Minutes', 'scribe' ); ?&gt;</th&gt;
					</tr&gt;
				</thead&gt;
				<tbody&gt;
					<?php foreach ( $posts as $post ) : ?&gt;
						<tr&gt;
							<td&gt;<a href="<?php echo esc_url( get_edit_post_link( $post->ID ) ); ?&gt;"><?php echo esc_html( get_the_title( $post->ID ) ); ?&gt;</a&gt;</td&gt;
							<td&gt;<?php echo esc_html( get_the_date( '', $post->ID ) ); ?&gt;</td&gt;
							<td&gt;<?php echo esc_html( $post->post_status ); ?&gt;</td&gt;
							<td&gt;<?php
								$duration = get_post_meta( $post->ID, '_scribe_duration', true );
								echo esc_html( $duration ? ceil( floatval( $duration ) / 60 ) : 0 );
							?&gt;</td&gt;
						</tr&gt;
					<?php endforeach; ?&gt;
				</tbody&gt;
			</table&gt;
		</div&gt;
		<?php
	}
}
