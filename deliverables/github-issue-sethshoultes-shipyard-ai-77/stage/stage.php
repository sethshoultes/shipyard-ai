<?php
/**
 * Plugin Name: Stage
 * Description: Generates stunning, responsive demo pages for WordPress plugins.
 * Version: 1.0.0
 * Author: Shipyard AI
 * Requires at least: 5.8
 * Requires PHP: 5.6
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('STAGE_VERSION', '1.0.0');
define('STAGE_DIR', plugin_dir_path(__FILE__));
define('STAGE_URL', plugin_dir_url(__FILE__));

register_activation_hook(__FILE__, 'stage_activate');
register_deactivation_hook(__FILE__, 'stage_deactivate');

function stage_activate() {
    stage_register_post_type();
    flush_rewrite_rules();
}

function stage_deactivate() {
    flush_rewrite_rules();
}

require_once STAGE_DIR . 'includes/post-type.php';
require_once STAGE_DIR . 'includes/settings.php';
require_once STAGE_DIR . 'includes/api.php';
require_once STAGE_DIR . 'includes/template.php';
