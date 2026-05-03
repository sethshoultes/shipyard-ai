<?php
/**
 * AgentPress Parser Test Harness
 *
 * Tests 10+ edge cases for the JSON parser.
 * Run with: php parser-test.php
 *
 * @package AgentPress
 * @since 1.0.0
 */

// Load WordPress test environment or mock WP functions
if (!defined('ABSPATH')) {
    // Mock WP functions for standalone testing
    if (!function_exists('__')) {
        function __($text, $domain = 'default') {
            return $text;
        }
    }
    if (!function_exists('wp_kses_post')) {
        function wp_kses_post($data) {
            // Simple mock: strip script tags
            return preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $data);
        }
    }
    if (!class_exists('WP_Error')) {
        class WP_Error {
            public $code;
            public $message;
            public function __construct($code, $message) {
                $this->code = $code;
                $this->message = $message;
            }
            public function get_error_code() {
                return $this->code;
            }
            public function get_error_message() {
                return $this->message;
            }
        }
    }

    // Load the Parser class
    require_once __DIR__ . '/../includes/class-parser.php';
}

use AgentPress\Parser;

/**
 * Test runner class.
 */
class ParserTestRunner {
    private $passed = 0;
    private $failed = 0;
    private $results = array();

    /**
     * Run a test case and record result.
     *
     * @param string $name Test name.
     * @param bool $condition Test condition.
     * @param string $expected Expected result description.
     * @param string $actual Actual result description.
     */
    public function run_test($name, $condition, $expected, $actual) {
        if ($condition) {
            $this->passed++;
            $this->results[] = array('name' => $name, 'passed' => true);
            echo "  [PASS] $name\n";
        } else {
            $this->failed++;
            $this->results[] = array('name' => $name, 'passed' => false, 'expected' => $expected, 'actual' => $actual);
            echo "  [FAIL] $name\n";
            echo "         Expected: $expected\n";
            echo "         Actual: $actual\n";
        }
    }

    /**
     * Print summary.
     */
    public function print_summary() {
        echo "\n=== Test Summary ===\n";
        echo "Passed: {$this->passed}\n";
        echo "Failed: {$this->failed}\n";
        echo "Total:  " . ($this->passed + $this->failed) . "\n";
    }

    /**
     * Get exit code.
     *
     * @return int 0 if all passed, 1 otherwise.
     */
    public function get_exit_code() {
        return $this->failed > 0 ? 1 : 0;
    }
}

// Initialize test runner
$runner = new ParserTestRunner();

echo "=== AgentPress Parser Test Harness ===\n\n";

// Test 1: Valid JSON parsed directly
echo "Test 1: Valid JSON direct parse\n";
$input = '{"capability":"content_writer","topic":"AI in WordPress"}';
$result = Parser::extract_json($input);
$runner->run_test(
    'Valid JSON parsed directly',
    is_array($result) && $result['capability'] === 'content_writer',
    'Array with capability=content_writer',
    is_array($result) ? 'Got array' : 'Got error: ' . ($result instanceof WP_Error ? $result->get_error_message() : 'unknown')
);

// Test 2: Markdown fence stripping
echo "\nTest 2: Markdown fence stripping\n";
$input = "```json\n{\"capability\":\"image_generator\",\"prompt\":\"sunset\"}\n```";
$result = Parser::extract_json($input);
$runner->run_test(
    'Markdown fence stripped correctly',
    is_array($result) && $result['capability'] === 'image_generator',
    'Array with capability=image_generator',
    is_array($result) ? 'Got array' : 'Got error: ' . ($result instanceof WP_Error ? $result->get_error_message() : 'unknown')
);

// Test 3: Truncated JSON handling
echo "\nTest 3: Truncated JSON handling\n";
$input = '{"capability":"content';
$result = Parser::extract_json($input);
$runner->run_test(
    'Truncated JSON returns WP_Error',
    $result instanceof WP_Error && $result->get_error_code() === 'agentpress_parser_error',
    'WP_Error with agentpress_parser_error',
    $result instanceof WP_Error ? $result->get_error_code() : 'Got array instead of error'
);

// Test 4: Missing capability key validation
echo "\nTest 4: Missing capability key\n";
$input = '{"action":"write","topic":"test"}';
$result = Parser::extract_json($input);
if (is_array($result)) {
    $validation = Parser::validate_routing_json($result);
    $runner->run_test(
        'Missing capability returns WP_Error',
        $validation instanceof WP_Error && $validation->get_error_code() === 'agentpress_parser_missing_capability',
        'WP_Error with agentpress_parser_missing_capability',
        'Validation passed or wrong error'
    );
} else {
    $runner->run_test(
        'Missing capability returns WP_Error',
        false,
        'WP_Error with agentpress_parser_missing_capability',
        'Parse failed before validation'
    );
}

// Test 5: Hallucinated slug detection
echo "\nTest 5: Hallucinated slug detection\n";
$input = '{"capability":"seo_meta_writer","topic":"test"}';
$result = Parser::extract_json($input);
if (is_array($result)) {
    $known = array('content_writer', 'image_generator');
    $validation = Parser::validate_capability_slug($result['capability'], $known);
    $runner->run_test(
        'Unknown capability slug detected',
        $validation instanceof WP_Error && $validation->get_error_code() === 'agentpress_parser_unknown_capability',
        'WP_Error with agentpress_parser_unknown_capability',
        'Validation passed or wrong error'
    );
} else {
    $runner->run_test(
        'Unknown capability slug detected',
        false,
        'WP_Error with agentpress_parser_unknown_capability',
        'Parse failed before validation'
    );
}

// Test 6: Nested payload handling
echo "\nTest 6: Nested payload handling\n";
$input = '{"capability":"content_writer","data":{"nested":{"value":"test"},"array":[1,2,3]}}';
$result = Parser::extract_json($input);
$runner->run_test(
    'Nested payload parsed correctly',
    is_array($result) && isset($result['data']['nested']['value']) && $result['data']['nested']['value'] === 'test',
    'Array with nested value accessible',
    is_array($result) ? 'Got array' : 'Got error'
);

// Test 7: Empty response handling
echo "\nTest 7: Empty response handling\n";
$input = '';
$result = Parser::extract_json($input);
$runner->run_test(
    'Empty input returns WP_Error',
    $result instanceof WP_Error && $result->get_error_code() === 'agentpress_parser_empty',
    'WP_Error with agentpress_parser_empty',
    $result instanceof WP_Error ? $result->get_error_code() : 'Got array instead of error'
);

// Test 8: HTML-wrapped JSON handling
echo "\nTest 8: HTML-wrapped JSON handling\n";
$input = '<div class="response"><p>Here is the result:</p>{"capability":"content_writer"}</div>';
$result = Parser::extract_json($input);
$runner->run_test(
    'JSON extracted from HTML wrapper',
    is_array($result) && $result['capability'] === 'content_writer',
    'Array with capability=content_writer',
    is_array($result) ? 'Got array' : 'Got error'
);

// Test 9: Extra text before/after JSON
echo "\nTest 9: Extra text before/after JSON\n";
$input = "Sure! I can help with that. Here's the JSON:\n\n{\"capability\":\"image_generator\"}\n\nLet me know if you need anything else!";
$result = Parser::extract_json($input);
$runner->run_test(
    'JSON extracted from text with extra content',
    is_array($result) && $result['capability'] === 'image_generator',
    'Array with capability=image_generator',
    is_array($result) ? 'Got array' : 'Got error'
);

// Test 10: Invalid JSON syntax handling
echo "\nTest 10: Invalid JSON syntax\n";
$input = '{"capability": content_writer}'; // Missing quotes around value
$result = Parser::extract_json($input);
$runner->run_test(
    'Invalid JSON syntax returns WP_Error',
    $result instanceof WP_Error && $result->get_error_code() === 'agentpress_parser_error',
    'WP_Error with agentpress_parser_error',
    $result instanceof WP_Error ? $result->get_error_code() : 'Got array instead of error'
);

// Test 11: Script tag sanitization
echo "\nTest 11: Script tag sanitization\n";
$input = '{"capability":"content_writer","content":"<script>alert(1)</script>Hello"}';
$result = Parser::extract_json($input);
if (is_array($result)) {
    $sanitized = Parser::sanitize_payload($result);
    $runner->run_test(
        'Script tags stripped from payload',
        strpos($sanitized['content'], '<script>') === false,
        'Content without script tags',
        isset($sanitized['content']) ? 'Content: ' . $sanitized['content'] : 'No content key'
    );
} else {
    $runner->run_test(
        'Script tags stripped from payload',
        false,
        'Content without script tags',
        'Parse failed'
    );
}

// Test 12: Markdown fence without language specifier
echo "\nTest 12: Markdown fence without language\n";
$input = "```\n{\"capability\":\"content_writer\"}\n```";
$result = Parser::extract_json($input);
$runner->run_test(
    'Markdown fence without language stripped',
    is_array($result) && $result['capability'] === 'content_writer',
    'Array with capability=content_writer',
    is_array($result) ? 'Got array' : 'Got error'
);

// Test 13: Deeply nested braces
echo "\nTest 13: Deeply nested braces\n";
$input = '{"outer":{"level1":{"level2":{"level3":"deep"}}}}';
$result = Parser::extract_json($input);
$runner->run_test(
    'Deeply nested JSON parsed correctly',
    is_array($result) && $result['outer']['level1']['level2']['level3'] === 'deep',
    'Array with deeply nested value accessible',
    is_array($result) ? 'Got array' : 'Got error'
);

// Test 14: JSON with special characters
echo "\nTest 14: JSON with special characters\n";
$input = '{"capability":"content_writer","text":"Hello \"World\" with \\n newline"}';
$result = Parser::extract_json($input);
$runner->run_test(
    'JSON with escaped characters parsed',
    is_array($result) && strpos($result['text'], 'World') !== false,
    'Array with properly escaped content',
    is_array($result) ? 'Got array' : 'Got error'
);

// Print summary
$runner->print_summary();

// Exit with appropriate code
exit($runner->get_exit_code());
