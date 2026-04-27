<?php
if (!defined('ABSPATH')) {
    exit;
}

function stage_add_settings_page() {
    add_options_page(
        'Stage',
        'Stage',
        'manage_options',
        'stage',
        'stage_render_settings_page'
    );
}
add_action('admin_menu', 'stage_add_settings_page');

function stage_render_settings_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    $slug = get_option('stage_plugin_slug', '');
    ?>
    <div class="wrap">
        <h1>Stage</h1>
        <form method="post" action="options.php">
            <?php settings_fields('stage_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="stage_plugin_slug">Plugin Slug</label></th>
                    <td>
                        <input type="text" id="stage_plugin_slug" name="stage_plugin_slug" value="<?php echo esc_attr($slug); ?>" class="regular-text">
                        <p class="description">Enter the WordPress.org plugin slug (e.g. "hello-dolly").</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

function stage_register_settings() {
    register_setting('stage_settings', 'stage_plugin_slug', 'sanitize_text_field');
}
add_action('admin_init', 'stage_register_settings');
