<?php
/**
 * AgentPress Activity Logger
 *
 * Logs agent executions to custom post type with auto-pruning.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress;

/**
 * Logger class for activity logging with auto-prune.
 */
class Logger {

    /**
     * Maximum number of log entries to keep.
     *
     * @var int
     */
    const MAX_LOGS = 500;

    /**
     * Number of entries to prune when over max.
     *
     * @var int
     */
    const PRUNE_COUNT = 50;

    /**
     * Log an agent execution.
     *
     * @param string $capability Capability slug.
     * @param string $task Original task description.
     * @param string $status Execution status (success, error).
     * @param int $latency_ms Execution time in milliseconds.
     * @param array $result Result data from agent.
     * @param array $routing Routing information.
     * @return int|WP_Error Log post ID or WP_Error on failure.
     */
    public static function log($capability, $task, $status, $latency_ms, $result = array(), $routing = array()) {
        $post_data = array(
            'post_type' => 'agentpress_log',
            'post_title' => sprintf('%s - %s', $capability, wp_trim_words($task, 10)),
            'post_status' => 'publish',
        );

        $post_id = wp_insert_post($post_data, true);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Store meta fields
        update_post_meta($post_id, '_agentpress_capability', $capability);
        update_post_meta($post_id, '_agentpress_task', $task);
        update_post_meta($post_id, '_agentpress_status', $status);
        update_post_meta($post_id, '_agentpress_latency_ms', (int) $latency_ms);
        update_post_meta($post_id, '_agentpress_result', maybe_serialize($result));
        update_post_meta($post_id, '_agentpress_routing_source', isset($routing['source']) ? $routing['source'] : '');
        update_post_meta($post_id, '_agentpress_timestamp', current_time('mysql'));

        // Auto-prune after logging
        self::prune();

        return $post_id;
    }

    /**
     * Prune old log entries when count exceeds max.
     *
     * Deletes oldest PRUNE_COUNT entries when count > MAX_LOGS.
     *
     * @return int Number of entries pruned.
     */
    public static function prune() {
        $count = self::get_log_count();

        if ($count <= self::MAX_LOGS) {
            return 0;
        }

        $to_delete = $count - self::MAX_LOGS;
        if ($to_delete < self::PRUNE_COUNT) {
            $to_delete = self::PRUNE_COUNT;
        }

        // Get oldest log IDs
        $old_logs = get_posts(array(
            'post_type' => 'agentpress_log',
            'posts_per_page' => $to_delete,
            'orderby' => 'date',
            'order' => 'ASC',
            'fields' => 'ids',
            'post_status' => 'any',
        ));

        $pruned = 0;
        foreach ($old_logs as $log_id) {
            wp_delete_post($log_id, true);
            $pruned++;
        }

        return $pruned;
    }

    /**
     * Get recent log entries.
     *
     * @param int $limit Number of entries to retrieve.
     * @return array Array of log entry data.
     */
    public static function get_recent($limit = 50) {
        $logs = get_posts(array(
            'post_type' => 'agentpress_log',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'any',
        ));

        $result = array();
        foreach ($logs as $log) {
            $result[] = array(
                'id' => $log->ID,
                'title' => $log->post_title,
                'date' => $log->post_date,
                'capability' => get_post_meta($log->ID, '_agentpress_capability', true),
                'status' => get_post_meta($log->ID, '_agentpress_status', true),
                'latency_ms' => get_post_meta($log->ID, '_agentpress_latency_ms', true),
                'task' => get_post_meta($log->ID, '_agentpress_task', true),
                'routing_source' => get_post_meta($log->ID, '_agentpress_routing_source', true),
            );
        }

        return $result;
    }

    /**
     * Get total log count.
     *
     * @return int Number of log entries.
     */
    public static function get_log_count() {
        $count = wp_count_posts('agentpress_log');
        return $count->publish + $count->draft + $count->private;
    }

    /**
     * Get a single log entry by ID.
     *
     * @param int $log_id Log post ID.
     * @return array|null Log entry data or null if not found.
     */
    public static function get_log($log_id) {
        $log = get_post($log_id);
        if (!$log || $log->post_type !== 'agentpress_log') {
            return null;
        }

        return array(
            'id' => $log->ID,
            'title' => $log->post_title,
            'date' => $log->post_date,
            'capability' => get_post_meta($log->ID, '_agentpress_capability', true),
            'status' => get_post_meta($log->ID, '_agentpress_status', true),
            'latency_ms' => get_post_meta($log->ID, '_agentpress_latency_ms', true),
            'task' => get_post_meta($log->ID, '_agentpress_task', true),
            'result' => maybe_unserialize(get_post_meta($log->ID, '_agentpress_result', true)),
            'routing_source' => get_post_meta($log->ID, '_agentpress_routing_source', true),
        );
    }

    /**
     * Clear all logs.
     *
     * @return int Number of logs deleted.
     */
    public static function clear_all() {
        $logs = get_posts(array(
            'post_type' => 'agentpress_log',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'post_status' => 'any',
        ));

        $deleted = 0;
        foreach ($logs as $log_id) {
            wp_delete_post($log_id, true);
            $deleted++;
        }

        return $deleted;
    }
}
