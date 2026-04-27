<?php
if (!defined('ABSPATH')) {
    exit;
}

function stage_template_include($template) {
    if (is_singular('stage_showcase')) {
        return STAGE_DIR . 'templates/showcase.php';
    }
    return $template;
}
add_filter('template_include', 'stage_template_include');

function stage_opengraph_tags() {
    if (!is_singular('stage_showcase')) {
        return;
    }
    $post_id = get_the_ID();
    $slug = get_post_meta($post_id, '_stage_plugin_slug', true);
    if (empty($slug)) {
        $slug = get_option('stage_plugin_slug', '');
    }
    $data = stage_fetch_plugin_data($slug);
    $title = $data && !empty($data['name']) ? $data['name'] : get_the_title();
    $description = $data && !empty($data['short_description']) ? $data['short_description'] : get_the_excerpt();
    $url = get_permalink();
    $image = $data && !empty($data['banners']['high']) ? $data['banners']['high'] : '';
    if (empty($image)) {
        $image = $data && !empty($data['banners']['low']) ? $data['banners']['low'] : '';
    }
    echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
    if (!empty($image)) {
        echo '<meta property="og:image" content="' . esc_url($image) . '">' . "\n";
    }
}
add_action('wp_head', 'stage_opengraph_tags');
