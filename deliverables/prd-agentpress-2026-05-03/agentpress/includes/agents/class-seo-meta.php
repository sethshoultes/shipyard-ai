<?php
/**
 * AgentPress SEOMeta Agent
 *
 * Generates SEO title tags and meta descriptions using the Claude API.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress\Agents;

use AgentPress\Parser;

/**
 * SEOMeta agent class.
 */
class SEO_Meta {

    /**
     * Maximum title length in characters.
     *
     * @var int
     */
    const MAX_TITLE_LENGTH = 60;

    /**
     * Maximum description length in characters.
     *
     * @var int
     */
    const MAX_DESCRIPTION_LENGTH = 160;

    /**
     * Default model for SEO generation.
     *
     * @var string
     */
    private static $default_model = 'claude-3-5-sonnet-20241022';

    /**
     * Run the SEOMeta agent.
     *
     * @param array $payload Payload containing content and focus_keyword.
     * @return array|WP_Error Result with title, description, focus_keyword, or WP_Error on failure.
     */
    public static function run($payload) {
        // Validate required content field
        if (empty($payload['content'])) {
            return new \WP_Error(
                'agentpress_seo_meta_missing_content',
                __('Missing required "content" field.', 'agentpress')
            );
        }

        // Validate required focus_keyword field
        if (empty($payload['focus_keyword'])) {
            return new \WP_Error(
                'agentpress_seo_meta_missing_focus_keyword',
                __('Missing required "focus_keyword" field.', 'agentpress')
            );
        }

        $content = sanitize_textarea_field($payload['content']);
        $focus_keyword = sanitize_text_field($payload['focus_keyword']);

        // Get API key
        $api_key = agentpress_get_setting('claude_api_key');
        if (empty($api_key)) {
            return new \WP_Error(
                'agentpress_missing_api_key',
                __('Claude API key is not configured.', 'agentpress')
            );
        }

        // Get model from settings
        $model = agentpress_get_setting('default_model', self::$default_model);

        // Build Claude prompt
        $prompt = self::build_prompt($content, $focus_keyword);

        // Call Claude API
        $response = self::call_claude_api($api_key, $model, $prompt);

        if (is_wp_error($response)) {
            return $response;
        }

        // Extract result from response
        $result = self::extract_result_from_response($response);

        if (is_wp_error($result)) {
            return $result;
        }

        // Enforce character limits server-side
        $result = self::enforce_limits($result);

        return $result;
    }

    /**
     * Build the prompt for Claude.
     *
     * @param string $content     Page or post content.
     * @param string $focus_keyword Focus keyword for SEO.
     * @return string Formatted prompt.
     */
    private static function build_prompt($content, $focus_keyword) {
        $prompt = "You are an SEO expert. Given the following content and focus keyword, generate an optimized title tag and meta description.\n\n";
        $prompt .= "Content:\n" . $content . "\n\n";
        $prompt .= "Focus Keyword: " . $focus_keyword . "\n\n";
        $prompt .= "Requirements:\n";
        $prompt .= "- Title must be under 60 characters\n";
        $prompt .= "- Meta description must be under 160 characters\n";
        $prompt .= "- Include the focus keyword naturally in both title and description\n";
        $prompt .= "- Make them compelling and click-worthy\n\n";
        $prompt .= "Return your response as a JSON object with this exact structure:\n";
        $prompt .= '{"title": "Your title here", "description": "Your meta description here"}\n\n';
        $prompt .= "Only return the JSON object, no additional text.";

        return $prompt;
    }

    /**
     * Call the Claude Messages API.
     *
     * @param string $api_key API key.
     * @param string $model   Model name.
     * @param string $prompt  Prompt text.
     * @return array|WP_Error API response or WP_Error on failure.
     */
    private static function call_claude_api($api_key, $model, $prompt) {
        $url = 'https://api.anthropic.com/v1/messages';

        $headers = array(
            'Content-Type' => 'application/json',
            'x-api-key' => $api_key,
            'anthropic-version' => '2023-06-01',
        );

        $body = wp_json_encode(array(
            'model' => $model,
            'max_tokens' => 1024,
            'messages' => array(
                array(
                    'role' => 'user',
                    'content' => $prompt,
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
     * Extract result from Claude API response.
     *
     * @param array $response API response.
     * @return array|WP_Error Extracted result or WP_Error on failure.
     */
    private static function extract_result_from_response($response) {
        if (!isset($response['content']) || !is_array($response['content'])) {
            return new \WP_Error(
                'agentpress_invalid_response',
                __('Invalid response format from API.', 'agentpress')
            );
        }

        // Get text from content blocks
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

        // Try to extract JSON from the response
        $parsed = Parser::extract_json($text);
        if (is_array($parsed) && isset($parsed['title']) && isset($parsed['description'])) {
            return array(
                'title' => sanitize_text_field($parsed['title']),
                'description' => sanitize_textarea_field($parsed['description']),
            );
        }

        // If no JSON found, try to parse raw text
        return new \WP_Error(
            'agentpress_invalid_response',
            __('Could not parse title and description from API response.', 'agentpress')
        );
    }

    /**
     * Enforce character limits on title and description.
     *
     * @param array $result Result array with title and description.
     * @return array Result with enforced limits.
     */
    private static function enforce_limits($result) {
        $title = $result['title'];
        $description = $result['description'];

        // Truncate title at word boundary if over limit
        if (mb_strlen($title) > self::MAX_TITLE_LENGTH) {
            $title = mb_substr($title, 0, self::MAX_TITLE_LENGTH);
            $last_space = mb_strrpos($title, ' ');
            if ($last_space !== false) {
                $title = mb_substr($title, 0, $last_space);
            }
            $title = rtrim($title, '.,;:!?') . '...';
        }

        // Truncate description at word boundary if over limit
        if (mb_strlen($description) > self::MAX_DESCRIPTION_LENGTH) {
            $description = mb_substr($description, 0, self::MAX_DESCRIPTION_LENGTH);
            $last_space = mb_strrpos($description, ' ');
            if ($last_space !== false) {
                $description = mb_substr($description, 0, $last_space);
            }
            $description = rtrim($description, '.,;:!?') . '...';
        }

        return array(
            'title' => $title,
            'description' => $description,
        );
    }
}

/**
 * Handler function for SEOMeta agent.
 *
 * @param array $payload Payload data.
 * @return array|WP_Error Result or WP_Error.
 */
function agentpress_run_seo_meta($payload) {
    return SEO_Meta::run($payload);
}
