<?php
/**
 * AgentPress JSON Parser
 *
 * Handles JSON extraction, validation, and sanitization for API responses.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress;

/**
 * Parser class for handling JSON extraction and validation.
 */
class Parser {

    /**
     * Extract JSON from a string that may contain markdown fences or extra text.
     *
     * Uses a layered approach:
     * 1. Try direct JSON decode
     * 2. Strip markdown code fences
     * 3. Use recursive brace matching to find JSON object
     *
     * @param string $input Raw string that may contain JSON.
     * @return array|string Parsed array on success, WP_Error on failure.
     */
    public static function extract_json($input) {
        if (empty($input)) {
            return new \WP_Error(
                'agentpress_parser_empty',
                __('Empty input provided to parser.', 'agentpress')
            );
        }

        // Layer 1: Try direct JSON decode
        $decoded = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Layer 2: Strip markdown code fences
        $cleaned = self::strip_markdown_fences($input);
        $decoded = json_decode($cleaned, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Layer 3: Recursive brace matching to extract JSON object
        $extracted = self::extract_json_with_brace_matching($input);
        if ($extracted) {
            $decoded = json_decode($extracted, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        // All layers failed - return error
        $error_message = json_last_error_msg() ?: __('Invalid JSON syntax.', 'agentpress');
        return new \WP_Error(
            'agentpress_parser_error',
            sprintf(
                /* translators: %s: JSON error message */
                __('Failed to parse JSON: %s', 'agentpress'),
                $error_message
            )
        );
    }

    /**
     * Strip markdown code fences from input.
     *
     * Handles formats like:
     * ```json
     * {"key": "value"}
     * ```
     *
     * @param string $input Input string.
     * @return string Cleaned string without fences.
     */
    public static function strip_markdown_fences($input) {
        // Remove opening fence with optional language specifier
        $cleaned = preg_replace('/^```(?:json)?\s*\n/', '', $input);
        // Remove closing fence
        $cleaned = preg_replace('/\n?```$/', '', $cleaned);
        // Trim whitespace
        $cleaned = trim($cleaned);
        return $cleaned;
    }

    /**
     * Extract JSON object using recursive brace matching.
     *
     * Finds the first { and matches it with the corresponding },
     * handling nested objects correctly.
     *
     * @param string $input Input string.
     * @return string|false Extracted JSON string or false on failure.
     */
    public static function extract_json_with_brace_matching($input) {
        $start = strpos($input, '{');
        if ($start === false) {
            return false;
        }

        $brace_count = 0;
        $in_string = false;
        $escape_next = false;
        $length = strlen($input);

        for ($i = $start; $i < $length; $i++) {
            $char = $input[$i];

            // Handle escape sequences
            if ($escape_next) {
                $escape_next = false;
                continue;
            }

            if ($char === '\\' && $in_string) {
                $escape_next = true;
                continue;
            }

            // Track string boundaries (don't count braces inside strings)
            if ($char === '"') {
                $in_string = !$in_string;
                continue;
            }

            // Count braces only outside strings
            if (!$in_string) {
                if ($char === '{') {
                    $brace_count++;
                } elseif ($char === '}') {
                    $brace_count--;
                    if ($brace_count === 0) {
                        // Found matching closing brace
                        return substr($input, $start, $i - $start + 1);
                    }
                }
            }
        }

        // Unmatched braces - return what we have (may be truncated)
        return substr($input, $start);
    }

    /**
     * Validate routing JSON has required capability key.
     *
     * @param array $data Parsed JSON data.
     * @return true|\WP_Error True on success, WP_Error on failure.
     */
    public static function validate_routing_json($data) {
        if (!is_array($data)) {
            return new \WP_Error(
                'agentpress_parser_invalid_format',
                __('Parsed data is not an array.', 'agentpress')
            );
        }

        if (empty($data['capability'])) {
            return new \WP_Error(
                'agentpress_parser_missing_capability',
                __('Missing required "capability" key in routing JSON.', 'agentpress')
            );
        }

        // Validate capability slug format
        if (!is_string($data['capability']) || !preg_match('/^[a-z_]+$/', $data['capability'])) {
            return new \WP_Error(
                'agentpress_parser_invalid_capability',
                __('Invalid capability slug format.', 'agentpress')
            );
        }

        return true;
    }

    /**
     * Sanitize payload data using wp_kses_post.
     *
     * Recursively sanitizes all string values in the payload array.
     *
     * @param array|string $data Data to sanitize.
     * @return array|string Sanitized data.
     */
    public static function sanitize_payload($data) {
        if (is_array($data)) {
            $sanitized = array();
            foreach ($data as $key => $value) {
                $sanitized[$key] = self::sanitize_payload($value);
            }
            return $sanitized;
        } elseif (is_string($data)) {
            // Strip script tags and other dangerous HTML
            return wp_kses_post($data);
        }
        return $data;
    }

    /**
     * Validate a capability slug against a list of known capabilities.
     *
     * @param string $slug Capability slug to validate.
     * @param array $known_capabilities List of known capability slugs.
     * @return true|\WP_Error True on success, WP_Error if slug is unknown.
     */
    public static function validate_capability_slug($slug, $known_capabilities) {
        if (!in_array($slug, $known_capabilities, true)) {
            return new \WP_Error(
                'agentpress_parser_unknown_capability',
                sprintf(
                    /* translators: %s: capability slug */
                    __('Unknown capability: %s', 'agentpress'),
                    $slug
                )
            );
        }
        return true;
    }
}
