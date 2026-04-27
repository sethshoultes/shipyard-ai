<?php
if (!defined('ABSPATH')) {
    exit;
}

function stage_fetch_plugin_data($slug) {
    $slug = sanitize_text_field($slug);
    if (empty($slug)) {
        return false;
    }
    $transient_key = 'stage_plugin_' . $slug;
    $cached = get_transient($transient_key);
    if (false !== $cached) {
        return $cached;
    }
    $url = 'https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=' . urlencode($slug);
    $response = wp_remote_get($url);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return false;
    }
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data) || !is_array($data)) {
        return false;
    }
    set_transient($transient_key, $data, DAY_IN_SECONDS);
    return $data;
}
