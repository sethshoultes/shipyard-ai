<?php
if (!defined('ABSPATH')) {
    exit;
}

$post_id = get_the_ID();
$slug = get_post_meta($post_id, '_stage_plugin_slug', true);
if (empty($slug)) {
    $slug = get_option('stage_plugin_slug', '');
}
$data = stage_fetch_plugin_data($slug);
$name = $data && !empty($data['name']) ? $data['name'] : get_the_title();
$author = $data && !empty($data['author']) ? strip_tags($data['author']) : '';
$version = $data && !empty($data['version']) ? $data['version'] : '';
$description = $data && !empty($data['short_description']) ? $data['short_description'] : get_the_content();
$install_url = 'https://wordpress.org/plugins/' . esc_attr($slug) . '/';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <link rel="stylesheet" href="<?php echo esc_url(STAGE_URL . 'assets/css/stage.css'); ?>">
</head>
<body class="stage-showcase">
    <section class="stage-hero">
        <div class="stage-hero-inner">
            <h1 class="stage-title"><?php echo esc_html($name); ?></h1>
            <?php if ($author) : ?>
                <p class="stage-author">by <?php echo esc_html($author); ?></p>
            <?php endif; ?>
            <?php if ($version) : ?>
                <p class="stage-version">Version <?php echo esc_html($version); ?></p>
            <?php endif; ?>
            <?php if ($description) : ?>
                <p class="stage-description"><?php echo esc_html($description); ?></p>
            <?php endif; ?>
            <a class="stage-install" href="<?php echo esc_url($install_url); ?>" target="_blank">Install on my site</a>
        </div>
    </section>
    <?php wp_footer(); ?>
</body>
</html>
