<?php
/**
 * Health Scanner class.
 *
 * @package WP_Sentinel
 */

namespace WPSentinel\Health;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Scanner class.
 */
class Scanner {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_ajax_wpsentinel_get_health', array( $this, 'ajax_get_health' ) );
	}

	/**
	 * Get PHP status.
	 *
	 * @return array
	 */
	public function get_php_status() {
		$version     = phpversion();
		$recommended = '8.0';
		$status      = version_compare( $version, $recommended, '>=' ) ? 'good' : 'warning';

		$extensions = array();
		$required   = array( 'mysqli', 'curl', 'json', 'mbstring' );
		foreach ( $required as $ext ) {
			$extensions[ $ext ] = extension_loaded( $ext );
		}

		return array(
			'label'       => __( 'PHP Version', 'wp-sentinel' ),
			'value'       => $version,
			'status'      => $status,
			'description' => sprintf(
				/* translators: %s: recommended PHP version */
				__( 'Current PHP version is %s. Recommended: %s or higher.', 'wp-sentinel' ),
				esc_html( $version ),
				esc_html( $recommended )
			),
			'extensions'  => $extensions,
		);
	}

	/**
	 * Get plugin update status.
	 *
	 * @return array
	 */
	public function get_plugin_update_status() {
		$update_plugins = get_site_transient( 'update_plugins' );
		$pending        = 0;

		if ( isset( $update_plugins->response ) && is_array( $update_plugins->response ) ) {
			$pending = count( $update_plugins->response );
		}

		$status = 0 === $pending ? 'good' : 'warning';

		return array(
			'label'       => __( 'Plugin Updates', 'wp-sentinel' ),
			'value'       => $pending,
			'status'      => $status,
			'description' => 0 === $pending
				? __( 'All plugins are up to date.', 'wp-sentinel' )
				: sprintf(
					/* translators: %d: number of pending updates */
					__( '%d plugin update(s) pending.', 'wp-sentinel' ),
					absint( $pending )
				),
		);
	}

	/**
	 * Get permalink status.
	 *
	 * @return array
	 */
	public function get_permalink_status() {
		$structure = get_option( 'permalink_structure', '' );
		$status    = ! empty( $structure ) ? 'good' : 'warning';

		return array(
			'label'       => __( 'Permalinks', 'wp-sentinel' ),
			'value'       => ! empty( $structure ) ? __( 'Custom', 'wp-sentinel' ) : __( 'Plain', 'wp-sentinel' ),
			'status'      => $status,
			'description' => ! empty( $structure )
				? __( 'Permalink structure is set.', 'wp-sentinel' )
				: __( 'Permalink structure is plain. SEO-friendly URLs are recommended.', 'wp-sentinel' ),
		);
	}

	/**
	 * Get cache status.
	 *
	 * @return array
	 */
	public function get_cache_status() {
		$detected = array();

		if ( defined( 'W3TC' ) || function_exists( 'w3tc_config' ) ) {
			$detected[] = 'W3 Total Cache';
		}
		if ( defined( 'WP_CACHE' ) && WP_CACHE ) {
			$detected[] = 'WP Super Cache / Generic';
		}
		if ( defined( 'LSCWP_V' ) || class_exists( 'LiteSpeed_Cache' ) ) {
			$detected[] = 'LiteSpeed Cache';
		}
		if ( function_exists( 'wp_fastest_cache' ) ) {
			$detected[] = 'WP Fastest Cache';
		}
		if ( class_exists( 'WP_Rocket' ) ) {
			$detected[] = 'WP Rocket';
		}

		$status = empty( $detected ) ? 'warning' : 'good';

		return array(
			'label'       => __( 'Page Cache', 'wp-sentinel' ),
			'value'       => empty( $detected ) ? __( 'None detected', 'wp-sentinel' ) : implode( ', ', $detected ),
			'status'      => $status,
			'description' => empty( $detected )
				? __( 'No caching plugin detected. A cache improves performance.', 'wp-sentinel' )
				: __( 'Caching plugin detected.', 'wp-sentinel' ),
		);
	}

	/**
	 * Get thumbnail health status.
	 *
	 * @return array
	 */
	public function get_thumbnail_status() {
		$args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'posts_per_page' => 10,
			'post_status'    => 'inherit',
			'orderby'        => 'date',
			'order'            => 'DESC',
		);

		$query      = new \WP_Query( $args );
		$missing    = 0;
		$checked    = 0;
		$sizes      = get_intermediate_image_sizes();

		foreach ( $query->posts as $attachment ) {
			$checked++;
			$metadata = wp_get_attachment_metadata( $attachment->ID );
			if ( empty( $metadata['sizes'] ) ) {
				$missing++;
				continue;
			}
			foreach ( $sizes as $size ) {
				if ( ! isset( $metadata['sizes'][ $size ] ) ) {
					$missing++;
					break;
				}
			}
		}

		$status = ( 0 === $missing ) ? 'good' : 'warning';

		return array(
			'label'       => __( 'Thumbnails', 'wp-sentinel' ),
			'value'       => $checked > 0 ? sprintf( '%d / %d', $checked - $missing, $checked ) : __( 'No images', 'wp-sentinel' ),
			'status'      => $status,
			'description' => 0 === $missing
				? __( 'All sampled images have expected thumbnail sizes.', 'wp-sentinel' )
				: sprintf(
					/* translators: %d: number of missing thumbnails */
					__( '%d of %d recent images are missing thumbnail sizes.', 'wp-sentinel' ),
					absint( $missing ),
					absint( $checked )
				),
		);
	}

	/**
	 * Get all health data aggregated.
	 *
	 * @return array
	 */
	public function get_all() {
		$cached = get_transient( 'wpsentinel_health' );
		if ( false !== $cached ) {
			return $cached;
		}

		$data = array(
			'php'        => $this->get_php_status(),
			'plugins'    => $this->get_plugin_update_status(),
			'permalinks' => $this->get_permalink_status(),
			'cache'      => $this->get_cache_status(),
			'thumbnails' => $this->get_thumbnail_status(),
			'timestamp'  => time(),
		);

		set_transient( 'wpsentinel_health', $data, 5 * MINUTE_IN_SECONDS );

		return $data;
	}

	/**
	 * AJAX handler for health data.
	 */
	public function ajax_get_health() {
		check_ajax_referer( 'wpsentinel_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error( __( 'Unauthorized', 'wp-sentinel' ), 403 );
		}

		$refresh = isset( $_POST['refresh'] ) && 'true' === sanitize_text_field( wp_unslash( $_POST['refresh'] ) );
		if ( $refresh ) {
			delete_transient( 'wpsentinel_health' );
		}

		$data = $this->get_all();
		wp_send_json_success( $data );
	}
}
