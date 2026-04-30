<?php
/**
 * SPARK_Assets
 *
 * Admin-only asset enqueue.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SPARK_Assets {

	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
	}

	public function enqueue( $hook ) {
		if ( 'toplevel_page_spark' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'spark-admin',
			SPARK_PLUGIN_URL . 'admin/css/spark-admin.css',
			array(),
			SPARK_VERSION
		);

		wp_enqueue_script(
			'spark-admin',
			SPARK_PLUGIN_URL . 'admin/js/spark-admin.js',
			array(),
			SPARK_VERSION,
			true
		);

		wp_localize_script(
			'spark-admin',
			'sparkAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'spark_admin_nonce' ),
			)
		);
	}
}
