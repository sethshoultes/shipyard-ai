<?php
/**
 * AgentPress ContentWriter Agent
 *
 * Generates written content using the Claude API.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress\Agents;

use AgentPress\Parser;

/**
 * ContentWriter agent class.
 */
class Content_Writer {

    /**
     * Valid tone options.
     *
     * @var array
     */
    private static $valid_tones = array('formal', 'professional', 'friendly', 'technical', 'creative');

    /**
     * Default model for content generation.
     *
     * @var string
     */
    private static $default_model = 'claude-3-5-sonnet-20241022';

    /**
     * Maximum output length in characters.
     *
     * @var int
     */
    const MAX_OUTPUT_LENGTH = 2048;

    /**
     * Run the ContentWriter agent.
     *
     * @param array $payload Payload containing topic, tone, length, etc.
     * @return array|WP_Error Result with text and tokens_used, or WP_Error on failure.
     */
    public static function run($payload) {
        // Validate required topic field
        if (empty($payload['topic'])) {
            return new \WP_Error(
                'agentpress_content_writer_missing_topic',
                __('Missing required "topic" field.', 'agentpress')
            );
        }

        // Validate tone if provided
        if (isset($payload['tone']) && !in_array($payload['tone'], self::$valid_tones, true)) {
            return new \WP_Error(
                'agentpress_content_writer_invalid_tone',
                sprintf(
                    /* translators: %s: invalid tone */
                    __('Invalid tone "%s". Valid options: %s', 'agentpress'),
                    $payload['tone'],
                    implode(', ', self::$valid_tones)
                )
            );
        }

        // Build the prompt
        $prompt = self::build_prompt($payload);

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

        // Call Claude API
        $response = self::call_claude_api($api_key, $model, $prompt);

        if (is_wp_error($response)) {
            return $response;
        }

        // Extract text from response
        $text = self::extract_text_from_response($response);

        if (is_wp_error($text)) {
            return $text;
        }

        // Truncate to max length
        $text = self::truncate_text($text);

        // Get token count from response
        $tokens_used = isset($response['usage']) && isset($response['usage']['total_tokens'])
            ? $response['usage']['total_tokens']
            : 0;

        return array(
            'text' => $text,
            'tokens_used' => $tokens_used,
        );
    }

    /**
     * Build the prompt for Claude.
     *
     * @param array $payload Payload data.
     * @return string Formatted prompt.
     */
    private static function build_prompt($payload) {
        $topic = sanitize_text_field($payload['topic']);
        $tone = isset($payload['tone']) ? sanitize_text_field($payload['tone']) : 'professional';
        $length = isset($payload['length']) ? intval($payload['length']) : 500;

        $prompt = sprintf(
            "Write content about the following topic: %s\n\n",
            $topic
        );

        $prompt .= sprintf("Tone: %s\n", $tone);
        $prompt .= sprintf("Target length: approximately %d words\n\n", $length);

        $prompt .= "Write clear, engaging, and well-structured content. ";
        $prompt .= "Return your response as a JSON object with the following structure:\n";
        $prompt .= "{\"text\": \"your content here\"}\n\n";
        $prompt .= "Only return the JSON object, no additional text.";

        return $prompt;
    }

    /**
     * Call the Claude Messages API.
     *
     * @param string $api_key API key.
     * @param string $model Model name.
     * @param string $prompt Prompt text.
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
            'max_tokens' => 4096,
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
        if (is_array($parsed) && isset($parsed['text'])) {
            return $parsed['text'];
        }

        // Return raw text if no JSON found
        return $text;
    }

    /**
     * Truncate text to maximum length.
     *
     * @param string $text Text to truncate.
     * @return string Truncated text.
     */
    private static function truncate_text($text) {
        if (strlen($text) <= self::MAX_OUTPUT_LENGTH) {
            return $text;
        }

        // Truncate at word boundary if possible
        $truncated = substr($text, 0, self::MAX_OUTPUT_LENGTH);
        $last_space = strrpos($truncated, ' ');

        if ($last_space !== false) {
            $truncated = substr($truncated, 0, $last_space);
        }

        return $truncated . '...';
    }
}

/**
 * Handler function for ContentWriter agent.
 *
 * @param array $payload Payload data.
 * @return array|WP_Error Result or WP_Error.
 */
function agentpress_run_content_writer($payload) {
    return Content_Writer::run($payload);
}
