<?php
/**
 * Remediation class.
 *
 * @package WP_Sentinel
 */

namespace WPSentinel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Remediation class.
 */
class Remediation {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_ajax_wpsentinel_remediate', array( $this, 'ajax_remediate' ) );
	}

	/**
	 * Regenerate permalinks.
	 *
	 * @return array
	 */
	public function regenerate_permalinks() {
		flush_rewrite_rules( false );
		return array(
			'success' => true,
			'message' => __( 'Permalinks regenerated successfully.', 'wp-sentinel' ),
		);
	}

	/**
	 * Regenerate thumbnails for recent attachments.
	 *
	 * @return array
	 */
	public function regenerate_thumbnails() {
		$args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'posts_per_page' => 20,
			'post_status'    => 'inherit',
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		$query   = new \WP_Query( $args );
		$regened = 0;

		foreach ( $query->posts as $attachment ) {
			$fullsize = get_attached_file( $attachment->ID );
			if ( $fullsize && file_exists( $fullsize ) ) {
				$metadata = wp_generate_attachment_metadata( $attachment->ID, $fullsize );
				if ( ! is_wp_error( $metadata ) ) {
					wp_update_attachment_metadata( $attachment->ID, $metadata );
					$regened++;
				}
			}
		}

		return array(
			'success' => true,
			'message' => sprintf(
				/* translators: %d: number of attachments processed */
				__( 'Regenerated thumbnails for %d attachment(s).', 'wp-sentinel' ),
				absint( $regened )
			),
		);
	}

	/**
	 * Clear plugin cache via known hooks.
	 *
	 * @return array
	 */
	public function clear_plugin_cache() {
		$cleared = array();

		if ( function_exists( 'w3tc_flush_all' ) ) {
			w3tc_flush_all();
			$cleared[] = 'W3 Total Cache';
		}

		if ( function_exists( 'wp_cache_clear_cache' ) ) {
			wp_cache_clear_cache();
			$cleared[] = 'WP Super Cache';
		}

		if ( class_exists( 'LiteSpeed_Cache_API' ) && method_exists( 'LiteSpeed_Cache_API', 'purge_all' ) ) {
			\LiteSpeed_Cache_API::purge_all();
			$cleared[] = 'LiteSpeed Cache';
		}

		if ( class_exists( 'WP_Rocket' ) && function_exists( 'rocket_clean_domain' ) ) {
			rocket_clean_domain();
			$cleared[] = 'WP Rocket';
		}

		if ( empty( $cleared ) ) {
			return array(
				'success' => true,
				'message' => __( 'No supported cache plugin detected to clear.', 'wp-sentinel' ),
			);
		}

		return array(
			'success' => true,
			'message' => sprintf(
				/* translators: %s: comma-separated list of cache plugins */
				__( 'Cache cleared for: %s.', 'wp-sentinel' ),
				esc_html( implode( ', ', $cleared ) )
			),
		);
	}

	/**
	 * Deactivate the most recently activated plugin (excluding this one).
	 *
	 * @return array
	 */
	public function deactivate_last_plugin() {
		$active_plugins = get_option( 'active_plugins', array() );
		$plugin_file    = plugin_basename( WPSENTINEL_DIR . 'wp-sentinel.php' );

		$candidates = array_diff( $active_plugins, array( $plugin_file ) );

		if ( empty( $candidates ) ) {
			return array(
				'success' => false,
				'message' => __( 'No other active plugins to deactivate.', 'wp-sentinel' ),
			);
		}

		$last_plugin = end( $candidates );
		deactivate_plugins( $last_plugin );

		return array(
			'success' => true,
			'message' => sprintf(
				/* translators: %s: plugin file name */
				__( 'Deactivated plugin: %s.', 'wp-sentinel' ),
				esc_html( $last_plugin )
			),
		);
	}

	/**
	 * Check file permissions in wp-content/uploads.
	 *
	 * @return array
	 */
	public function check_file_permissions() {
		$upload_dir = wp_upload_dir();
		$base_dir   = $upload_dir['basedir'];
		$issues     = array();

		if ( is_dir( $base_dir ) ) {
			$iterator = new \DirectoryIterator( $base_dir );
			$count    = 0;
			foreach ( $iterator as $fileinfo ) {
				if ( $fileinfo->isDot() ) {
					continue;
				}
				if ( $count >= 50 ) {
					break;
				}
				$count++;
				$perms = $fileinfo->getPerms() & 0777;
				if ( $fileinfo->isDir() && 0755 !== $perms ) {
					$issues[] = sprintf(
						/* translators: 1: directory name, 2: permission octal */
						__( 'Directory %1$s has permissions %2$o (expected 755).', 'wp-sentinel' ),
						esc_html( $fileinfo->getFilename() ),
						$perms
					);
				} elseif ( $fileinfo->isFile() && 0644 !== $perms ) {
					$issues[] = sprintf(
						/* translators: 1: file name, 2: permission octal */
						__( 'File %1$s has permissions %2$o (expected 644).', 'wp-sentinel' ),
						esc_html( $fileinfo->getFilename() ),
						$perms
					);
				}
			}
		}

		if ( empty( $issues ) ) {
			return array(
				'success' => true,
				'message' => __( 'File permissions in uploads directory look correct.', 'wp-sentinel' ),
			);
		}

		return array(
			'success' => true,
			'message' => __( 'Permission scan complete. Issues found:', 'wp-sentinel' ) . ' ' . implode( '; ', $issues ),
		);
	}

	/**
	 * AJAX handler for remediation actions.
	 */
	public function ajax_remediate() {
		check_ajax_referer( 'wpsentinel_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error( __( 'Unauthorized', 'wp-sentinel' ), 403 );
		}

		$action = isset( $_POST['remediation_action'] ) ? sanitize_text_field( wp_unslash( $_POST['remediation_action'] ) ) : '';

		$result = array();

		switch ( $action ) {
			case 'regenerate_permalinks':
				$result = $this->regenerate_permalinks();
				break;
			case 'regenerate_thumbnails':
				$result = $this->regenerate_thumbnails();
				break;
			case 'clear_plugin_cache':
				$result = $this->clear_plugin_cache();
				break;
			case 'deactivate_last_plugin':
				$result = $this->deactivate_last_plugin();
				break;
			case 'check_file_permissions':
				$result = $this->check_file_permissions();
				break;
			default:
				wp_send_json_error( __( 'Unknown remediation action.', 'wp-sentinel' ), 400 );
		}

		if ( isset( $result['success'] ) && true === $result['success'] ) {
			wp_send_json_success( $result );
		} else {
			wp_send_json_error( $result['message'] ?? __( 'Remediation failed.', 'wp-sentinel' ), 500 );
		}
	}
}
