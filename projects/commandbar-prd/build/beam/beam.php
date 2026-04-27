<?php
/**
 * Plugin Name: Beam
 * Description: A fast command palette for WordPress admin. Press Cmd/Ctrl+K to search posts, pages, users, and admin pages instantly.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 5.6
 * Author: Shipyard AI
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BEAM_VERSION', '1.0.0' );

function beam_build_index() {
	$items = array();

	// Posts
	$post_ids = get_posts(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'fields'         => 'ids',
			'posts_per_page' => 200,
		)
	);
	foreach ( $post_ids as $pid ) {
		$items[] = array(
			'title' => get_the_title( $pid ),
			'url'   => get_edit_post_link( $pid, 'raw' ),
			'type'  => 'content',
		);
	}

	// Pages
	$page_ids = get_posts(
		array(
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'fields'         => 'ids',
			'posts_per_page' => 200,
		)
	);
	foreach ( $page_ids as $pid ) {
		$items[] = array(
			'title' => get_the_title( $pid ),
			'url'   => get_edit_post_link( $pid, 'raw' ),
			'type'  => 'content',
		);
	}

	// Users
	$users = get_users(
		array(
			'fields' => array( 'ID', 'display_name', 'user_email' ),
			'number' => 200,
		)
	);
	foreach ( $users as $u ) {
		$items[] = array(
			'title' => $u->display_name . ' (' . $u->user_email . ')',
			'url'   => get_edit_user_link( $u->ID ),
			'type'  => 'users',
		);
	}

	// Admin pages
	$admin_pages = array(
		array( 'title' => __( 'Dashboard' ),         'url' => 'index.php',                                 'cap' => 'read' ),
		array( 'title' => __( 'Posts' ),              'url' => 'edit.php',                                'cap' => 'edit_posts' ),
		array( 'title' => __( 'Add New Post' ),       'url' => 'post-new.php',                            'cap' => 'edit_posts' ),
		array( 'title' => __( 'Categories' ),         'url' => 'edit-tags.php?taxonomy=category',         'cap' => 'manage_categories' ),
		array( 'title' => __( 'Tags' ),               'url' => 'edit-tags.php?taxonomy=post_tag',         'cap' => 'manage_categories' ),
		array( 'title' => __( 'Pages' ),              'url' => 'edit.php?post_type=page',                 'cap' => 'edit_pages' ),
		array( 'title' => __( 'Add New Page' ),       'url' => 'post-new.php?post_type=page',             'cap' => 'edit_pages' ),
		array( 'title' => __( 'Media Library' ),      'url' => 'upload.php',                              'cap' => 'upload_files' ),
		array( 'title' => __( 'Add New Media' ),      'url' => 'media-new.php',                           'cap' => 'upload_files' ),
		array( 'title' => __( 'Comments' ),           'url' => 'edit-comments.php',                       'cap' => 'moderate_comments' ),
		array( 'title' => __( 'Themes' ),             'url' => 'themes.php',                              'cap' => 'switch_themes' ),
		array( 'title' => __( 'Customize' ),          'url' => 'customize.php',                           'cap' => 'customize' ),
		array( 'title' => __( 'Widgets' ),            'url' => 'widgets.php',                             'cap' => 'edit_theme_options' ),
		array( 'title' => __( 'Menus' ),              'url' => 'nav-menus.php',                           'cap' => 'edit_theme_options' ),
		array( 'title' => __( 'Plugins' ),            'url' => 'plugins.php',                             'cap' => 'activate_plugins' ),
		array( 'title' => __( 'Add New Plugin' ),     'url' => 'plugin-install.php',                      'cap' => 'install_plugins' ),
		array( 'title' => __( 'Users' ),              'url' => 'users.php',                               'cap' => 'list_users' ),
		array( 'title' => __( 'Add New User' ),       'url' => 'user-new.php',                            'cap' => 'create_users' ),
		array( 'title' => __( 'Tools' ),              'url' => 'tools.php',                               'cap' => 'import' ),
		array( 'title' => __( 'Settings' ),           'url' => 'options-general.php',                     'cap' => 'manage_options' ),
	);

	foreach ( $admin_pages as $page ) {
		if ( current_user_can( $page['cap'] ) ) {
			$items[] = array(
				'title' => $page['title'],
				'url'   => admin_url( $page['url'] ),
				'type'  => 'admin',
			);
		}
	}

	// Quick actions
	if ( current_user_can( 'edit_posts' ) ) {
		$items[] = array(
			'title' => __( 'Add New Post' ),
			'url'   => admin_url( 'post-new.php' ),
			'type'  => 'actions',
		);
	}
	if ( current_user_can( 'edit_pages' ) ) {
		$items[] = array(
			'title' => __( 'Add New Page' ),
			'url'   => admin_url( 'post-new.php?post_type=page' ),
			'type'  => 'actions',
		);
	}
	if ( current_user_can( 'read' ) ) {
		$items[] = array(
			'title'  => __( 'View Site' ),
			'url'    => home_url( '/' ),
			'type'   => 'actions',
			'newTab' => true,
		);
	}

	return apply_filters( 'beam_items', $items );
}

add_action(
	'admin_enqueue_scripts',
	function () {
		$handle = 'beam';
		$src    = plugin_dir_url( __FILE__ ) . 'beam.js';
		wp_enqueue_script( $handle, $src, array(), BEAM_VERSION, true );
		wp_localize_script(
			$handle,
			'beamIndex',
			array( 'items' => beam_build_index() )
		);
	}
);
