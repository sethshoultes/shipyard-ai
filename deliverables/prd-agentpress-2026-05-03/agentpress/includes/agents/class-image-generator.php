<?php
/**
 * AgentPress ImageGenerator Agent
 *
 * Generates images using Cloudflare Workers AI.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress\Agents;

/**
 * ImageGenerator agent class.
 */
class Image_Generator {

    /**
     * Valid size options.
     *
     * @var array
     */
    private static $valid_sizes = array(
        '512x512',
        '1024x1024',
    );

    /**
     * Default size for image generation.
     *
     * @var string
     */
    private static $default_size = '1024x1024';

    /**
     * Default timeout in seconds.
     *
     * @var int
     */
    const DEFAULT_TIMEOUT = 30;

    /**
     * Run the ImageGenerator agent.
     *
     * @param array $payload Payload containing prompt, size, etc.
     * @return array|WP_Error Result with url, format, size, or WP_Error on failure.
     */
    public static function run($payload) {
        // Validate required prompt field
        if (empty($payload['prompt'])) {
            return new \WP_Error(
                'agentpress_image_generator_missing_prompt',
                __('Missing required "prompt" field.', 'agentpress')
            );
        }

        // Validate size if provided
        if (isset($payload['size']) && !in_array($payload['size'], self::$valid_sizes, true)) {
            return new \WP_Error(
                'agentpress_image_generator_invalid_size',
                sprintf(
                    /* translators: %s: invalid size */
                    __('Invalid size "%s". Valid options: %s', 'agentpress'),
                    $payload['size'],
                    implode(', ', self::$valid_sizes)
                )
            );
        }

        $prompt = sanitize_text_field($payload['prompt']);
        $size = isset($payload['size']) ? $payload['size'] : self::$default_size;

        // Get Cloudflare Worker URL
        $worker_url = agentpress_get_setting('cf_worker_url');
        if (empty($worker_url)) {
            return new \WP_Error(
                'agentpress_missing_worker_url',
                __('Cloudflare Worker URL is not configured.', 'agentpress')
            );
        }

        // Call Cloudflare Worker
        $response = self::call_worker($worker_url, $prompt, $size);

        if (is_wp_error($response)) {
            return $response;
        }

        // Validate the response
        return self::validate_response($response);
    }

    /**
     * Call the Cloudflare Worker.
     *
     * @param string $worker_url Worker endpoint URL.
     * @param string $prompt Image generation prompt.
     * @param string $size Image size.
     * @return array|WP_Error Worker response or WP_Error on failure.
     */
    private static function call_worker($worker_url, $prompt, $size) {
        $body = wp_json_encode(array(
            'prompt' => $prompt,
            'size' => $size,
        ));

        $response = wp_remote_post($worker_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => $body,
            'timeout' => self::DEFAULT_TIMEOUT,
        ));

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();

            // Check for timeout
            if (strpos($error_message, 'timeout') !== false || strpos($error_message, 'timed out') !== false) {
                return new \WP_Error(
                    'agentpress_image_generator_timeout',
                    __('Image generation timed out. Please try again with a simpler prompt.', 'agentpress')
                );
            }

            return new \WP_Error(
                'agentpress_image_generator_error',
                sprintf(
                    /* translators: %s: error message */
                    __('Worker request failed: %s', 'agentpress'),
                    $error_message
                )
            );
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        if ($status_code !== 200) {
            $error_data = json_decode($body, true);
            $error_message = isset($error_data['error'])
                ? $error_data['error']
                : __('Unknown worker error.', 'agentpress');

            return new \WP_Error(
                'agentpress_image_generator_error',
                sprintf(
                    /* translators: %d: HTTP status code, %s: error message */
                    __('Worker error %1$d: %2$s', 'agentpress'),
                    $status_code,
                    $error_message
                )
            );
        }

        return json_decode($body, true);
    }

    /**
     * Validate the worker response.
     *
     * @param array $response Decoded response data.
     * @return array|WP_Error Validated result or WP_Error on failure.
     */
    private static function validate_response($response) {
        // Check for required fields
        if (!isset($response['url'])) {
            return new \WP_Error(
                'agentpress_image_generator_invalid_response',
                __('Worker response missing required "url" field.', 'agentpress')
            );
        }

        $url = $response['url'];

        // Validate HTTPS URL scheme (security guardrail)
        if (!preg_match('/^https:\/\//', $url)) {
            return new \WP_Error(
                'agentpress_image_generator_http_url',
                __('Image URL must use HTTPS for security. HTTP URLs are not allowed.', 'agentpress')
            );
        }

        // Validate URL format
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return new \WP_Error(
                'agentpress_image_generator_invalid_url',
                __('Invalid URL format in worker response.', 'agentpress')
            );
        }

        // Build result array
        $result = array(
            'url' => $url,
            'format' => isset($response['format']) ? $response['format'] : 'png',
            'size' => isset($response['size']) ? $response['size'] : self::$default_size,
        );

        return $result;
    }
}

/**
 * Handler function for ImageGenerator agent.
 *
 * @param array $payload Payload data.
 * @return array|WP_Error Result or WP_Error.
 */
function agentpress_run_image_generator($payload) {
    return Image_Generator::run($payload);
}
