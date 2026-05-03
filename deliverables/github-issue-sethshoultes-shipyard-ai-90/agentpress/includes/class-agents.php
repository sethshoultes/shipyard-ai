<?php
/**
 * AgentPress Agents Registry
 *
 * Manages the capability registry and routes tasks to internal agents.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress;

/**
 * Agents class for capability registry and execution.
 */
class Agents {

    /**
     * Built-in capabilities registry.
     *
     * @var array
     */
    private static $capabilities = array(
        'content_writer' => array(
            'slug' => 'content_writer',
            'title' => 'Content Writer',
            'description' => 'Generates written content using Claude API.',
            'handler' => 'agentpress_run_content_writer',
        ),
        'image_generator' => array(
            'slug' => 'image_generator',
            'title' => 'Image Generator',
            'description' => 'Generates images using Cloudflare Workers AI.',
            'handler' => 'agentpress_run_image_generator',
        ),
        'seo_meta' => array(
            'slug' => 'seo_meta',
            'title' => 'SEO Meta',
            'description' => 'Generates SEO title tags and meta descriptions using Claude API.',
            'handler' => 'agentpress_run_seo_meta',
        ),
    );

    /**
     * Get all registered capabilities.
     *
     * @return array Array of capability definitions.
     */
    public static function get_capabilities() {
        return self::$capabilities;
    }

    /**
     * Get a specific capability by slug.
     *
     * @param string $slug Capability slug.
     * @return array|null Capability definition or null if not found.
     */
    public static function get_capability($slug) {
        return isset(self::$capabilities[$slug]) ? self::$capabilities[$slug] : null;
    }

    /**
     * Get list of capability slugs.
     *
     * @return array Array of capability slugs.
     */
    public static function get_capability_slugs() {
        return array_keys(self::$capabilities);
    }

    /**
     * Build a serializable manifest of all capabilities.
     *
     * @return array JSON-serializable capability manifest.
     */
    public static function build_manifest() {
        $manifest = array();
        foreach (self::$capabilities as $slug => $cap) {
            $manifest[$slug] = array(
                'slug' => $cap['slug'],
                'title' => $cap['title'],
                'description' => $cap['description'],
            );
        }
        return $manifest;
    }

    /**
     * Run an internal agent by slug.
     *
     * @param string $slug Capability slug.
     * @param array $payload Payload data for the agent.
     * @return array|WP_Error Agent result or WP_Error on failure.
     */
    public static function run_internal($slug, $payload) {
        $capability = self::get_capability($slug);

        if (!$capability) {
            return new \WP_Error(
                'agentpress_unknown_capability',
                sprintf(
                    /* translators: %s: capability slug */
                    __('Unknown capability: %s', 'agentpress'),
                    $slug
                )
            );
        }

        $handler = $capability['handler'];

        if (!function_exists($handler)) {
            return new \WP_Error(
                'agentpress_missing_handler',
                sprintf(
                    /* translators: %s: handler function name */
                    __('Missing handler function: %s', 'agentpress'),
                    $handler
                )
            );
        }

        // Call the handler function
        return call_user_func($handler, $payload);
    }

    /**
     * Check if a capability exists.
     *
     * @param string $slug Capability slug.
     * @return bool True if capability exists.
     */
    public static function has_capability($slug) {
        return isset(self::$capabilities[$slug]);
    }
}
