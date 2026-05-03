<?php
/**
 * Plugin Name: AgentPress
 * Plugin URI: https://emdash.com/agentpress
 * Description: AI-powered content and image generation for WordPress. Built-in agents for content writing and image generation.
 * Version: 1.0.0
 * Author: Emdash
 * Author URI: https://emdash.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: agentpress
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AGENTPRESS_VERSION', '1.0.0');
define('AGENTPRESS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AGENTPRESS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('AGENTPRESS_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Get a plugin setting with wp-config constant fallback.
 *
 * @param string $key Setting key.
 * @param mixed $default Default value if not set.
 * @return mixed Setting value.
 */
function agentpress_get_setting($key, $default = null) {
    $settings = get_option('agentpress_settings', array());

    // Check for wp-config constant override first
    $constant_map = array(
        'claude_api_key' => 'AGENTPRESS_CLAUDE_KEY',
        'cf_worker_url' => 'AGENTPRESS_CF_WORKER_URL',
        'default_model' => 'AGENTPRESS_DEFAULT_MODEL',
    );

    if (isset($constant_map[$key]) && defined($constant_map[$key])) {
        return constant($constant_map[$key]);
    }

    return isset($settings[$key]) ? $settings[$key] : $default;
}

/**
 * Register custom post types for capabilities and logs.
 */
function agentpress_register_cpts() {
    // Register agentpress_capability CPT
    register_post_type('agentpress_capability', array(
        'labels' => array(
            'name' => __('AgentPress Capabilities', 'agentpress'),
            'singular_name' => __('AgentPress Capability', 'agentpress'),
        ),
        'public' => false,
        'show_ui' => false,
        'show_in_menu' => false,
        'show_in_rest' => false,
        'capability_type' => 'post',
        'supports' => array('title'),
        'has_archive' => false,
        'rewrite' => false,
        'query_var' => false,
    ));

    // Register agentpress_log CPT
    register_post_type('agentpress_log', array(
        'labels' => array(
            'name' => __('AgentPress Logs', 'agentpress'),
            'singular_name' => __('AgentPress Log', 'agentpress'),
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => false,
        'show_in_rest' => false,
        'capability_type' => 'post',
        'supports' => array('title'),
        'has_archive' => false,
        'rewrite' => false,
        'query_var' => false,
    ));
}
add_action('init', 'agentpress_register_cpts');

/**
 * Seed built-in capabilities on activation.
 */
function agentpress_seed_capabilities() {
    $capabilities = array(
        array(
            'slug' => 'content_writer',
            'title' => 'Content Writer',
            'description' => 'Generates written content using Claude API.',
        ),
        array(
            'slug' => 'image_generator',
            'title' => 'Image Generator',
            'description' => 'Generates images using Cloudflare Workers AI.',
        ),
    );

    foreach ($capabilities as $cap) {
        // Check if capability already exists
        $existing = get_posts(array(
            'post_type' => 'agentpress_capability',
            'name' => $cap['slug'],
            'posts_per_page' => 1,
            'post_status' => 'any',
        ));

        if (empty($existing)) {
            wp_insert_post(array(
                'post_type' => 'agentpress_capability',
                'post_title' => $cap['title'],
                'post_name' => $cap['slug'],
                'post_status' => 'publish',
                'meta_input' => array(
                    '_capability_slug' => $cap['slug'],
                    '_capability_description' => $cap['description'],
                ),
            ));
        }
    }
}

/**
 * Create default settings option.
 */
function agentpress_create_default_settings() {
    $default_settings = array(
        'default_model' => 'claude-3-5-sonnet-20241022',
        'claude_api_key' => '',
        'cf_worker_url' => '',
    );

    if (get_option('agentpress_settings') === false) {
        add_option('agentpress_settings', $default_settings);
    }
}

/**
 * Plugin activation hook.
 */
function agentpress_activate() {
    // Register CPTs so we can create posts
    agentpress_register_cpts();

    // Flush rewrite rules
    flush_rewrite_rules();

    // Seed built-in capabilities
    agentpress_seed_capabilities();

    // Create default settings
    agentpress_create_default_settings();
}
register_activation_hook(__FILE__, 'agentpress_activate');

/**
 * Plugin deactivation hook.
 */
function agentpress_deactivate() {
    // Flush rewrite rules on deactivation
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'agentpress_deactivate');

/**
 * Autoloader for AgentPress classes.
 *
 * @param string $class Class name to load.
 */
function agentpress_autoloader($class) {
    // Only handle AgentPress namespace
    if (strpos($class, 'AgentPress\\') !== 0) {
        return;
    }

    // Remove namespace prefix
    $class_name = str_replace('AgentPress\\', '', $class);

    // Define class file mappings
    $class_map = array(
        'Parser' => 'includes/class-parser.php',
        'Agents' => 'includes/class-agents.php',
        'Logger' => 'includes/class-logger.php',
        'Router' => 'includes/class-router.php',
        'REST_API' => 'includes/class-rest-api.php',
        'Admin' => 'admin/class-admin.php',
        'Content_Writer' => 'includes/agents/class-content-writer.php',
        'Image_Generator' => 'includes/agents/class-image-generator.php',
    );

    // Handle sub-namespaces like AgentPress\Agents\Content_Writer
    if (strpos($class_name, '\\') !== false) {
        $parts = explode('\\', $class_name);
        $sub_namespace = strtolower($parts[0]);
        $class_name = $parts[1];

        $file = AGENTPRESS_PLUGIN_DIR . 'includes/' . $sub_namespace . '/class-' . strtolower(str_replace('_', '-', $class_name)) . '.php';
    } else {
        $file = AGENTPRESS_PLUGIN_DIR . (isset($class_map[$class_name]) ? $class_map[$class_name] : '');
    }

    if (file_exists($file)) {
        require_once $file;
    }
}
spl_autoload_register('agentpress_autoloader');

/**
 * Initialize core classes on plugins_loaded.
 */
function agentpress_init() {
    // Initialize REST API
    if (class_exists('AgentPress\\REST_API')) {
        new AgentPress\REST_API();
    }

    // Initialize Admin
    if (is_admin() && class_exists('AgentPress\\Admin')) {
        new AgentPress\Admin();
    }
}
add_action('plugins_loaded', 'agentpress_init');

/**
 * Register REST API routes.
 */
function agentpress_register_rest_routes() {
    if (class_exists('AgentPress\\REST_API')) {
        AgentPress\REST_API::register_routes();
    }
}
add_action('rest_api_init', 'agentpress_register_rest_routes');
