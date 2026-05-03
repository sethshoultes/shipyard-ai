<?php
/**
 * AgentPress REST API
 *
 * Single REST endpoint for agent orchestration.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress;

use AgentPress\Router;
use AgentPress\Agents;
use AgentPress\Logger;
use AgentPress\Parser;

/**
 * REST_API class for AgentPress.
 */
class REST_API {

    /**
     * REST namespace.
     *
     * @var string
     */
    const REST_NAMESPACE = 'agentpress/v1';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST routes.
     */
    public function register_routes() {
        register_rest_route(self::REST_NAMESPACE, '/run', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_run_request'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'task' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_task'),
                ),
                'context' => array(
                    'required' => false,
                    'type' => 'object',
                    'sanitize_callback' => array($this, 'sanitize_context'),
                ),
            ),
        ));
    }

    /**
     * Check if the user has permission to access the API.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|WP_Error True if permission granted, WP_Error otherwise.
     */
    public function check_permissions($request) {
        // Check if user is authenticated (Application Password or logged in)
        if (!is_user_logged_in()) {
            // Try application password authentication
            $user = wp_authenticate_application_password(null, wp_get_current_user()->user_login, $request->get_header('authorization'));
            if (is_wp_error($user)) {
                return new \WP_Error(
                    'rest_forbidden',
                    __('Authentication required.', 'agentpress'),
                    array('status' => 401)
                );
            }
        }

        // Check if user can manage options (admin level)
        if (!current_user_can('manage_options')) {
            return new \WP_Error(
                'rest_forbidden',
                __('You do not have permission to access this endpoint.', 'agentpress'),
                array('status' => 403)
            );
        }

        return true;
    }

    /**
     * Validate the task parameter.
     *
     * @param mixed $value The task value.
     * @param WP_REST_Request $request The request object.
     * @param string $param The parameter name.
     * @return bool|WP_Error True if valid, WP_Error otherwise.
     */
    public function validate_task($value, $request, $param) {
        if (empty($value) || !is_string($value)) {
            return new \WP_Error(
                'rest_invalid_param',
                __('The task parameter is required and must be a non-empty string.', 'agentpress'),
                array('status' => 400)
            );
        }

        if (strlen($value) > 1000) {
            return new \WP_Error(
                'rest_invalid_param',
                __('The task parameter must be less than 1000 characters.', 'agentpress'),
                array('status' => 400)
            );
        }

        return true;
    }

    /**
     * Sanitize the context parameter.
     *
     * @param mixed $value The context value.
     * @param WP_REST_Request $request The request object.
     * @param string $param The parameter name.
     * @return array Sanitized context.
     */
    public function sanitize_context($value, $request, $param) {
        if (!is_array($value)) {
            return array();
        }

        // Sanitize all string values in context
        return array_map(function($item) {
            return is_string($item) ? sanitize_text_field($item) : $item;
        }, $value);
    }

    /**
     * Handle the run request.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function handle_run_request($request) {
        $start_time = microtime(true);

        $task = $request->get_param('task');
        $context = $request->get_param('context');

        try {
            // Route the task to appropriate agent
            $routing = Router::route($task, $context);

            // Check for routing errors
            if (isset($routing['error']) && is_wp_error($routing['error'])) {
                $error = $routing['error'];
                $response_data = array(
                    'success' => false,
                    'code' => $error->get_error_code(),
                    'message' => $error->get_error_message(),
                    'data' => array(
                        'status' => 500,
                    ),
                );

                // Log the error
                $this->log_execution($task, 'error', $routing, $start_time, $error);

                return new \WP_REST_Response($response_data, 500);
            }

            // Check for no match
            if (empty($routing['capability'])) {
                $response_data = array(
                    'success' => false,
                    'code' => 'agentpress_no_match',
                    'message' => __('No suitable agent found for this task.', 'agentpress'),
                    'data' => array(
                        'status' => 400,
                    ),
                );

                // Log the no match
                $this->log_execution($task, 'error', $routing, $start_time,
                    new \WP_Error('agentpress_no_match', $response_data['message'])
                );

                return new \WP_REST_Response($response_data, 400);
            }

            // Execute the agent
            $result = Agents::run_internal($routing['capability'], array(
                'task' => $task,
                'context' => $context,
            ));

            // Check for execution errors
            if (is_wp_error($result)) {
                $response_data = array(
                    'success' => false,
                    'code' => $result->get_error_code(),
                    'message' => $result->get_error_message(),
                    'data' => array(
                        'status' => 500,
                    ),
                );

                // Log the error
                $this->log_execution($routing['capability'], 'error', $routing, $start_time, $result);

                return new \WP_REST_Response($response_data, 500);
            }

            // Calculate latency
            $latency_ms = round((microtime(true) - $start_time) * 1000);

            // Success response
            $response_data = array(
                'success' => true,
                'routing' => array(
                    'capability' => $routing['capability'],
                    'source' => $routing['source'],
                    'confidence' => isset($routing['confidence']) ? $routing['confidence'] : null,
                ),
                'result' => $result,
                'latency_ms' => $latency_ms,
            );

            // Log the success
            $this->log_execution($routing['capability'], 'success', $routing, $start_time, $result);

            return new \WP_REST_Response($response_data, 200);

        } catch (Exception $e) {
            $error = new \WP_Error(
                'agentpress_internal_error',
                __('Internal server error.', 'agentpress'),
                array('status' => 500)
            );

            $response_data = array(
                'success' => false,
                'code' => $error->get_error_code(),
                'message' => $error->get_error_message(),
                'data' => array(
                    'status' => 500,
                ),
            );

            // Log the exception
            $this->log_execution($task, 'error', array(), $start_time, $error);

            return new \WP_REST_Response($response_data, 500);
        }
    }

    /**
     * Log execution details.
     *
     * @param string $capability The capability used.
     * @param string $status Execution status (success/error).
     * @param array $routing Routing information.
     * @param float $start_time Start timestamp.
     * @param mixed $result Result or error.
     * @return void
     */
    private function log_execution($capability, $status, $routing, $start_time, $result) {
        $latency_ms = round((microtime(true) - $start_time) * 1000);
        $task = isset($_POST['task']) ? sanitize_text_field($_POST['task']) : 'Unknown task';

        // Use the Logger to log the execution
        Logger::log($capability, $task, $status, $latency_ms, is_wp_error($result) ? $result->get_error_message() : $result, $routing);
    }

    /**
     * Register routes statically (for WordPress hook).
     *
     * @return void
     */
    public static function register_routes() {
        static $instance = null;
        if ($instance === null) {
            $instance = new self();
        }
    }
}