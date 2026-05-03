<?php
/**
 * AgentPress Admin Interface
 *
 * Admin screen for AgentPress settings and log viewing.
 *
 * @package AgentPress
 * @since 1.0.0
 */

namespace AgentPress;

use AgentPress\Logger;

/**
 * Admin class for AgentPress.
 */
class Admin {

    /**
     * Menu slug for the admin page.
     *
     * @var string
     */
    const MENU_SLUG = 'agentpress';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Add the admin menu item.
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            __('AgentPress', 'agentpress'),
            __('AgentPress', 'agentpress'),
            'manage_options',
            self::MENU_SLUG,
            array($this, 'render_admin_page')
        );
    }

    /**
     * Register plugin settings.
     */
    public function register_settings() {
        register_setting('agentpress_settings', 'agentpress_settings', array($this, 'sanitize_settings'));

        // API Key field
        add_settings_section(
            'agentpress_api_section',
            __('API Configuration', 'agentpress'),
            array($this, 'render_api_section'),
            'agentpress_settings'
        );

        add_settings_field(
            'claude_api_key',
            __('Claude API Key', 'agentpress'),
            array($this, 'render_api_key_field'),
            'agentpress_settings',
            'agentpress_api_section'
        );

        add_settings_field(
            'cf_worker_url',
            __('Cloudflare Worker URL', 'agentpress'),
            array($this, 'render_cf_worker_url_field'),
            'agentpress_settings',
            'agentpress_api_section'
        );

        add_settings_field(
            'default_model',
            __('Default Model', 'agentpress'),
            array($this, 'render_default_model_field'),
            'agentpress_settings',
            'agentpress_api_section'
        );
    }

    /**
     * Sanitize settings.
     *
     * @param array $input Raw input settings.
     * @return array Sanitized settings.
     */
    public function sanitize_settings($input) {
        $sanitized = array();

        // Sanitize Claude API key (password field, just keep as-is)
        if (isset($input['claude_api_key'])) {
            $sanitized['claude_api_key'] = $input['claude_api_key'];
        }

        // Sanitize Cloudflare Worker URL
        if (isset($input['cf_worker_url'])) {
            $url = esc_url_raw($input['cf_worker_url']);
            if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
                $sanitized['cf_worker_url'] = $url;
            } else {
                add_settings_error(
                    'agentpress_settings',
                    'cf_worker_url',
                    __('Invalid Cloudflare Worker URL. Please enter a valid URL.', 'agentpress')
                );
                $sanitized['cf_worker_url'] = '';
            }
        }

        // Sanitize default model
        if (isset($input['default_model'])) {
            $valid_models = array('claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229');
            if (in_array($input['default_model'], $valid_models, true)) {
                $sanitized['default_model'] = $input['default_model'];
            } else {
                $sanitized['default_model'] = 'claude-3-5-sonnet-20241022';
            }
        }

        return $sanitized;
    }

    /**
     * Render the API section description.
     */
    public function render_api_section() {
        echo '<p>' . esc_html__('Configure your API keys and worker endpoints below.', 'agentpress') . '</p>';
    }

    /**
     * Render the Claude API key field.
     */
    public function render_api_key_field() {
        $settings = get_option('agentpress_settings', array());
        $value = isset($settings['claude_api_key']) ? $settings['claude_api_key'] : '';
        $disabled = defined('AGENTPRESS_CLAUDE_KEY') ? 'disabled' : '';
        $note = defined('AGENTPRESS_CLAUDE_KEY')
            ? '<p class="description">' . __('Defined in wp-config.php with AGENTPRESS_CLAUDE_KEY constant.', 'agentpress') . '</p>'
            : '';

        printf(
            '<input type="password" name="agentpress_settings[claude_api_key]" value="%s" %s class="regular-text" />%s',
            esc_attr($value),
            $disabled,
            $note
        );
    }

    /**
     * Render the Cloudflare Worker URL field.
     */
    public function render_cf_worker_url_field() {
        $settings = get_option('agentpress_settings', array());
        $value = isset($settings['cf_worker_url']) ? $settings['cf_worker_url'] : '';
        $disabled = defined('AGENTPRESS_CF_WORKER_URL') ? 'disabled' : '';
        $note = defined('AGENTPRESS_CF_WORKER_URL')
            ? '<p class="description">' . __('Defined in wp-config.php with AGENTPRESS_CF_WORKER_URL constant.', 'agentpress') . '</p>'
            : '';

        printf(
            '<input type="url" name="agentpress_settings[cf_worker_url]" value="%s" %s class="regular-text" />%s',
            esc_attr($value),
            $disabled,
            $note
        );
    }

    /**
     * Render the default model field.
     */
    public function render_default_model_field() {
        $settings = get_option('agentpress_settings', array());
        $value = isset($settings['default_model']) ? $settings['default_model'] : 'claude-3-5-sonnet-20241022';
        $disabled = defined('AGENTPRESS_DEFAULT_MODEL') ? 'disabled' : '';
        $note = defined('AGENTPRESS_DEFAULT_MODEL')
            ? '<p class="description">' . __('Defined in wp-config.php with AGENTPRESS_DEFAULT_MODEL constant.', 'agentpress') . '</p>'
            : '';

        $models = array(
            'claude-3-5-sonnet-20241022' => 'Claude 3.5 Sonnet (Recommended)',
            'claude-3-opus-20240229' => 'Claude 3 Opus',
            'claude-3-sonnet-20240229' => 'Claude 3 Sonnet',
        );

        echo '<select name="agentpress_settings[default_model]" ' . $disabled . '>';
        foreach ($models as $model_value => $model_label) {
            printf(
                '<option value="%s" %s>%s</option>',
                esc_attr($model_value),
                selected($value, $model_value, false),
                esc_html($model_label)
            );
        }
        echo '</select>';
        echo $note;
    }

    /**
     * Enqueue admin scripts and styles.
     *
     * @param string $hook Current admin page.
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on AgentPress pages
        if ($hook !== 'tools_page_agentpress') {
            return;
        }

        // Enqueue CSS
        wp_enqueue_style(
            'agentpress-admin',
            AGENTPRESS_PLUGIN_URL . 'admin/css/agentpress-admin.css',
            array(),
            AGENTPRESS_VERSION
        );
    }

    /**
     * Render the admin page.
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Handle settings update
        if (isset($_POST['action']) && $_POST['action'] === 'update') {
            settings_errors('agentpress_settings');
        }

        ?>
        <div class="wrap agentpress-wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <div class="agentpress-section">
                <h2 class="agentpress-section-title"><?php esc_html_e('Settings', 'agentpress'); ?></h2>

                <form action="options.php" method="post" class="agentpress-form-table">
                    <?php
                    settings_fields('agentpress_settings');
                    do_settings_sections('agentpress_settings');
                    submit_button();
                    ?>
                </form>
            </div>

            <div class="agentpress-section">
                <h2 class="agentpress-section-title"><?php esc_html_e('Recent Activity', 'agentpress'); ?></h2>

                <?php $this->render_recent_logs(); ?>
            </div>
        </div>
        <?php
    }

    /**
     * Render recent logs table.
     */
    private function render_recent_logs() {
        $logs = Logger::get_recent(50);

        if (empty($logs)) {
            printf(
                '<p>%s</p>',
                sprintf(
                    /* translators: %s: API endpoint URL */
                    __('No activity yet. Use the API endpoint at %s to start generating content and images.', 'agentpress'),
                    '<code>' . esc_url(rest_url('agentpress/v1/run')) . '</code>'
                )
            );
            return;
        }

        ?>
        <table class="wp-list-table widefat fixed striped agentpress-log-table">
            <thead>
                <tr>
                    <th><?php esc_html_e('Task', 'agentpress'); ?></th>
                    <th><?php esc_html_e('Agent', 'agentpress'); ?></th>
                    <th><?php esc_html_e('Status', 'agentpress'); ?></th>
                    <th><?php esc_html_e('Latency', 'agentpress'); ?></th>
                    <th><?php esc_html_e('Time', 'agentpress'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($logs as $log): ?>
                    <tr>
                        <td>
                            <?php
                            $task = !empty($log['task']) ? $log['task'] : 'Unknown';
                            echo esc_html(wp_trim_words($task, 10));
                            ?>
                        </td>
                        <td>
                            <strong><?php echo esc_html(ucfirst(str_replace('_', ' ', $log['capability']))); ?></strong>
                            <?php if (!empty($log['routing_source'])): ?>
                                <br>
                                <span class="agentpress-routing-source">
                                    <?php echo esc_html($log['routing_source']); ?>
                                </span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php
                            $status_class = $log['status'] === 'success' ? 'success' : 'error';
                            $status_label = $log['status'] === 'success' ? __('Success', 'agentpress') : __('Error', 'agentpress');
                            ?>
                            <span class="agentpress-status-pill agentpress-status-<?php echo esc_attr($status_class); ?>">
                                <?php echo esc_html($status_label); ?>
                            </span>
                        </td>
                        <td>
                            <?php
                            if (!empty($log['latency_ms'])) {
                                echo esc_html(number_format($log['latency_ms'])) . ' ms';
                            } else {
                                echo '—';
                            }
                            ?>
                        </td>
                        <td>
                            <?php
                            $time = strtotime($log['date']);
                            echo esc_html(sprintf(
                                '%s ago',
                                human_time_diff($time, current_time('timestamp'))
                            ));
                            ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }
}