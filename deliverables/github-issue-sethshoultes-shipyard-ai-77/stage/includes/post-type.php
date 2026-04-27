<?php
if (!defined('ABSPATH')) {
    exit;
}

function stage_register_post_type() {
    $labels = array(
        'name'          => 'Showcases',
        'singular_name' => 'Showcase',
    );
    $args = array(
        'labels'      => $labels,
        'public'      => true,
        'has_archive' => false,
        'supports'    => array('title', 'editor', 'thumbnail'),
        'rewrite'     => array('slug' => 'stage'),
        'menu_icon'   => 'dashicons-star-filled',
    );
    register_post_type('stage_showcase', $args);
}
add_action('init', 'stage_register_post_type');

function stage_add_meta_box() {
    add_meta_box(
        'stage_plugin_slug',
        'Plugin Slug',
        'stage_render_meta_box',
        'stage_showcase',
        'side'
    );
}
add_action('add_meta_boxes', 'stage_add_meta_box');

function stage_render_meta_box($post) {
    wp_nonce_field('stage_save_meta', 'stage_meta_nonce');
    $slug = get_post_meta($post->ID, '_stage_plugin_slug', true);
    echo '<input type="text" name="stage_plugin_slug" value="' . esc_attr($slug) . '" class="widefat" placeholder="hello-dolly">';
    echo '<p class="description">Enter the WordPress.org plugin slug.</p>';
}

function stage_save_meta($post_id) {
    if (!isset($_POST['stage_meta_nonce']) || !wp_verify_nonce($_POST['stage_meta_nonce'], 'stage_save_meta')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    if (isset($_POST['stage_plugin_slug'])) {
        update_post_meta($post_id, '_stage_plugin_slug', sanitize_text_field($_POST['stage_plugin_slug']));
    }
}
add_action('save_post', 'stage_save_meta');
