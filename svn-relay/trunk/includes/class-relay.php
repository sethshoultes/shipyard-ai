<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Relay {

	private static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {}

	public function init() {
		$this->load_dependencies();
		$this->init_components();
	}

	private function load_dependencies() {
		require_once RELAY_PLUGIN_DIR . 'includes/class-storage.php';
		require_once RELAY_PLUGIN_DIR . 'includes/class-admin.php';
		require_once RELAY_PLUGIN_DIR . 'includes/class-form-handler.php';
		require_once RELAY_PLUGIN_DIR . 'includes/class-claude-client.php';
		require_once RELAY_PLUGIN_DIR . 'includes/class-cache.php';
		require_once RELAY_PLUGIN_DIR . 'includes/class-async-processor.php';
	}

	private function init_components() {
		Relay_Storage::init();
		Relay_Admin::init();
		Relay_Form_Handler::init();
		Relay_Cache::init();
		Relay_Async_Processor::init();
	}
}
