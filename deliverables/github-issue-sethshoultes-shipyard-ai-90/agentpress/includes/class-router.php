<?php
/**
 * AgentPress Router
 *
 * Routes tasks to appropriate agents using local keyword matching with Claude fallback.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress;

use AgentPress\Agents;

/**
 * Router class for task routing.
 */
class Router {

    /**
     * Keyword whitelist for ContentWriter agent.
     *
     * @var array
     */
    private static $content_writer_keywords = array(
        'write',
        'blog',
        'post',
        'article',
        'content',
        'text',
        'copy',
        'paragraph',
        'essay',
        'story',
        'description',
        'summary',
        'review',
        'guide',
        'tutorial',
        'how to',
        'explain',
        'describe',
        'compose',
        'draft',
        'create content',
        'generate text',
    );

    /**
     * Keyword whitelist for ImageGenerator agent.
     *
     * @var array
     */
    private static $image_generator_keywords = array(
        'image',
        'images',
        'photo',
        'photos',
        'picture',
        'pictures',
        'graphic',
        'graphics',
        'illustration',
        'illustrate',
        'draw',
        'drawing',
        'paint',
        'painting',
        'visual',
        'artwork',
        'art',
        'generate image',
        'create image',
        'make image',
        'show me',
        'render',
    );

    /**
     * Route a task to the appropriate agent.
     *
     * First tries local keyword matching, then falls back to Claude for ambiguous tasks.
     *
     * @param string $task Task description.
     * @param array $context Optional context data.
     * @return array Routing decision with capability, source, and confidence.
     */
    public static function route($task, $context = array()) {
        // Try local routing first
        $local_result = self::route_local($task);

        if ($local_result && $local_result['capability']) {
            return $local_result;
        }

        // Fall back to Claude for ambiguous tasks
        return self::route_claude($task, $context);
    }

    /**
     * Route using local keyword matching.
     *
     * @param string $task Task description.
     * @return array|false Routing decision or false if no match.
     */
    public static function route_local($task) {
        $task_lower = strtolower($task);
        $task_lower = trim($task_lower);

        // Check for ContentWriter keywords
        foreach (self::$content_writer_keywords as $keyword) {
            if (stripos($task_lower, $keyword) !== false) {
                return array(
                    'capability' => 'content_writer',
                    'source' => 'local',
                    'confidence' => 0.8,
                    'matched_keyword' => $keyword,
                );
            }
        }

        // Check for ImageGenerator keywords
        foreach (self::$image_generator_keywords as $keyword) {
            if (stripos($task_lower, $keyword) !== false) {
                return array(
                    'capability' => 'image_generator',
                    'source' => 'local',
                    'confidence' => 0.8,
                    'matched_keyword' => $keyword,
                );
            }
        }

        // No local match found
        return false;
    }

    /**
     * Route using Claude API for ambiguous tasks.
     *
     * @param string $task Task description.
     * @param array $context Optional context data.
     * @return array Routing decision from Claude.
     */
    public static function route_claude($task, $context = array()) {
        // Get API key
        $api_key = agentpress_get_setting('claude_api_key');
        if (empty($api_key)) {
            return array(
                'capability' => null,
                'source' => 'claude',
                'error' => new \WP_Error(
                    'agentpress_missing_api_key',
                    __('Claude API key is not configured.', 'agentpress')
                ),
            );
        }

        // Build system prompt for routing
        $system_prompt = self::build_routing_system_prompt();

        // Build user prompt
        $user_prompt = self::build_routing_user_prompt($task, $context);

        // Call Claude API
        $response = self::call_claude_api($api_key, $system_prompt, $user_prompt);

        if (is_wp_error($response)) {
            return array(
                'capability' => null,
                'source' => 'claude',
                'error' => $response,
            );
        }

        // Extract text from response
        $text = self::extract_text_from_response($response);

        if (is_wp_error($text)) {
            return array(
                'capability' => null,
                'source' => 'claude',
                'error' => $text,
            );
        }

        // Parse routing JSON from response
        $parsed = Parser::extract_json($text);

        if (is_wp_error($parsed)) {
            return array(
                'capability' => null,
                'source' => 'claude',
                'error' => $parsed,
            );
        }

        // Validate routing JSON
        $validation = Parser::validate_routing_json($parsed);
        if (is_wp_error($validation)) {
            return array(
                'capability' => null,
                'source' => 'claude',
                'error' => $validation,
            );
        }

        // Validate capability exists
        $capability = $parsed['capability'];
        if (!Agents::has_capability($capability)) {
            return array(
                'capability' => null,
                'source' => 'claude',
                'error' => new \WP_Error(
                    'agentpress_unknown_capability',
                    sprintf(
                        /* translators: %s: capability slug */
                        __('Unknown capability: %s', 'agentpress'),
                        $capability
                    )
                ),
            );
        }

        return array(
            'capability' => $capability,
            'source' => 'claude',
            'confidence' => isset($parsed['confidence']) ? floatval($parsed['confidence']) : 0.5,
            'reasoning' => isset($parsed['reasoning']) ? $parsed['reasoning'] : '',
        );
    }

    /**
     * Build the system prompt for routing.
     *
     * @return string System prompt.
     */
    private static function build_routing_system_prompt() {
        $capabilities = Agents::build_manifest();
        $cap_list = json_encode($capabilities, JSON_PRETTY_PRINT);

        return <<<PROMPT
You are a task router for AgentPress, a WordPress plugin with AI agents.

Your job is to analyze user tasks and route them to the appropriate agent capability.

Available capabilities:
{$cap_list}

Respond with a JSON object containing:
- "capability": the slug of the best capability for this task
- "confidence": a number between 0 and 1 indicating your confidence
- "reasoning": brief explanation of your choice

Only return the JSON object, no additional text.
PROMPT;
    }

    /**
     * Build the user prompt for routing.
     *
     * @param string $task Task description.
     * @param array $context Context data.
     * @return string User prompt.
     */
    private static function build_routing_user_prompt($task, $context) {
        $prompt = "Route this task to the appropriate agent:\n\n";
        $prompt .= "Task: {$task}\n\n";

        if (!empty($context)) {
            $prompt .= "Context: " . json_encode($context) . "\n\n";
        }

        $prompt .= "Which capability should handle this task?";

        return $prompt;
    }

    /**
     * Call the Claude Messages API for routing.
     *
     * @param string $api_key API key.
     * @param string $system_prompt System prompt.
     * @param string $user_prompt User prompt.
     * @return array|WP_Error API response or WP_Error on failure.
     */
    private static function call_claude_api($api_key, $system_prompt, $user_prompt) {
        $url = 'https://api.anthropic.com/v1/messages';
        $model = agentpress_get_setting('default_model', 'claude-3-5-sonnet-20241022');

        $headers = array(
            'Content-Type' => 'application/json',
            'x-api-key' => $api_key,
            'anthropic-version' => '2023-06-01',
        );

        $body = wp_json_encode(array(
            'model' => $model,
            'max_tokens' => 256,
            'system' => $system_prompt,
            'messages' => array(
                array(
                    'role' => 'user',
                    'content' => $user_prompt,
                ),
            ),
        ));

        $response = wp_remote_post($url, array(
            'headers' => $headers,
            'body' => $body,
            'timeout' => 30,
        ));

        if (is_wp_error($response)) {
            return new \WP_Error(
                'agentpress_api_error',
                sprintf(
                    /* translators: %s: error message */
                    __('API request failed: %s', 'agentpress'),
                    $response->get_error_message()
                )
            );
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        if ($status_code !== 200) {
            $error_data = json_decode($body, true);
            $error_message = isset($error_data['error']) && isset($error_data['error']['message'])
                ? $error_data['error']['message']
                : __('Unknown API error.', 'agentpress');

            return new \WP_Error(
                'agentpress_api_error',
                sprintf(
                    /* translators: %d: HTTP status code, %s: error message */
                    __('API error %1$d: %2$s', 'agentpress'),
                    $status_code,
                    $error_message
                )
            );
        }

        return json_decode($body, true);
    }

    /**
     * Extract text from Claude API response.
     *
     * @param array $response API response.
     * @return string|WP_Error Extracted text or WP_Error on failure.
     */
    private static function extract_text_from_response($response) {
        if (!isset($response['content']) || !is_array($response['content'])) {
            return new \WP_Error(
                'agentpress_invalid_response',
                __('Invalid response format from API.', 'agentpress')
            );
        }

        $text = '';
        foreach ($response['content'] as $block) {
            if (isset($block['type']) && $block['type'] === 'text') {
                $text .= $block['text'];
            }
        }

        if (empty($text)) {
            return new \WP_Error(
                'agentpress_empty_response',
                __('Empty response from API.', 'agentpress')
            );
        }

        return $text;
    }

    /**
     * Get the list of content writer keywords.
     *
     * @return array Array of keywords.
     */
    public static function get_content_writer_keywords() {
        return self::$content_writer_keywords;
    }

    /**
     * Get the list of image generator keywords.
     *
     * @return array Array of keywords.
     */
    public static function get_image_generator_keywords() {
        return self::$image_generator_keywords;
    }
}
