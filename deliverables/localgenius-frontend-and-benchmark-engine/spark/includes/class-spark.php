<?php
/**
 * SPARK Singleton
 *
 * Wires up all modules.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SPARK {

	private static $instance = null;

	private function __construct() {
		$this->load_dependencies();
		$this->init();
	}

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function load_dependencies() {
		require_once SPARK_PLUGIN_DIR . 'includes/class-spark-api.php';
		require_once SPARK_PLUGIN_DIR . 'includes/class-spark-faq.php';
		require_once SPARK_PLUGIN_DIR . 'includes/class-spark-widget.php';
		require_once SPARK_PLUGIN_DIR . 'includes/class-spark-assets.php';
		require_once SPARK_PLUGIN_DIR . 'admin/class-spark-admin.php';
	}

	private function init() {
		new SPARK_API();
		new SPARK_FAQ();
		new SPARK_Widget();
		new SPARK_Assets();
		new SPARK_Admin();
	}
}
