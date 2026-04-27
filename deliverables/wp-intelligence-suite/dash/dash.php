<?php
/**
 * Plugin Name: Dash
 * Plugin URI:  https://example.com/wp-intelligence-suite
 * Description: Team tracking and notes module for the WP Intelligence Suite.
 * Version:     1.0.0
 * Author:      Shipyard AI
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: dash
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DASH_VERSION', '1.0.0' );
define( 'DASH_DIR', plugin_dir_path( __FILE__ ) );
define( 'DASH_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation: seed a welcome note.
 */
function dash_activate() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( false === get_option( 'dash_version' ) ) {
		add_option( 'dash_version', DASH_VERSION );
	}

	// Seed a welcome note.
	$existing = get_posts(
		array(
			'post_type'   => 'wis_note',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
		)
	);

	if ( empty( $existing ) ) {
		wp_insert_post(
			array(
				'post_title'   => __( 'Welcome to Dash', 'dash' ),
				'post_content' => __( 'Dash helps your team track notes, mentions, and status in one place. Try creating a new note and mentioning a teammate with @username.', 'dash' ),
				'post_status'  => 'publish',
				'post_type'    => 'wis_note',
			)
		);
	}
}
register_activation_hook( __FILE__, 'dash_activate' );

/**
 * Deactivation.
 */
function dash_deactivate() {
	delete_transient( 'dash_activity_feed' );
}
register_deactivation_hook( __FILE__, 'dash_deactivate' );

/**
 * Bootstrap.
 */
function dash_bootstrap() {
	if ( ! defined( 'WIS_VERSION' ) ) {
		add_action( 'admin_notices', 'dash_missing_core_notice' );
		return;
	}

	require_once DASH_DIR . 'includes/class-notes-list-table.php';

	// Register CPT.
	add_action( 'init', 'dash_register_post_type' );

	// Admin menu.
	add_action( 'admin_menu', 'dash_register_admin_menu' );

	// Meta boxes.
	add_action( 'add_meta_boxes', 'dash_add_status_meta_box' );
	add_action( 'save_post_wis_note', 'dash_save_note_meta', 10, 2 );

	// Activity log.
	add_action( 'save_post_wis_note', 'dash_log_activity', 20, 2 );
}
add_action( 'plugins_loaded', 'dash_bootstrap' );

/**
 * Dependency notice.
 */
function dash_missing_core_notice() {
	echo '<div class="error"><p>' . esc_html__( 'Dash requires WP Intelligence Suite Core. Please install and activate wis-core.', 'dash' ) . '</p></div>';
}

/**
 * Register custom post type.
 */
function dash_register_post_type() {
	$labels = array(
		'name'                  => _x( 'Notes', 'post type general name', 'dash' ),
		'singular_name'         => _x( 'Note', 'post type singular name', 'dash' ),
		'add_new'               => __( 'Add New', 'dash' ),
		'add_new_item'          => __( 'Add New Note', 'dash' ),
		'edit_item'             => __( 'Edit Note', 'dash' ),
		'new_item'              => __( 'New Note', 'dash' ),
		'view_item'             => __( 'View Note', 'dash' ),
		'search_items'          => __( 'Search Notes', 'dash' ),
		'not_found'             => __( 'No notes found', 'dash' ),
		'not_found_in_trash'    => __( 'No notes found in Trash', 'dash' ),
		'all_items'             => __( 'All Notes', 'dash' ),
		'menu_name'             => __( 'Dash', 'dash' ),
	);

	$args = array(
		'labels'            => $labels,
		'public'            => false,
		'show_ui'           => true,
		'show_in_menu'      => false,
		'capability_type'   => array( 'wis_note', 'wis_notes' ),
		'map_meta_cap'      => true,
		'supports'          => array( 'title', 'editor', 'author', 'revisions' ),
		'has_archive'       => false,
		'rewrite'           => false,
		'menu_icon'           => 'dashicons-clipboard',
	);

	register_post_type( 'wis_note', $args );
}

/**
 * Admin menu.
 */
function dash_register_admin_menu() {
	add_menu_page(
		__( 'Dash', 'dash' ),
		__( 'Dash', 'dash' ),
		'edit_wis_notes',
		'dash-notes',
		'dash_render_notes_page',
		'dashicons-clipboard',
		30
	);

	add_submenu_page(
		'dash-notes',
		__( 'All Notes', 'dash' ),
		__( 'All Notes', 'dash' ),
		'edit_wis_notes',
		'dash-notes',
		'dash_render_notes_page'
	);
}

/**
 * Render notes list page.
 */
function dash_render_notes_page() {
	if ( ! current_user_can( 'edit_wis_notes' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'dash' ) );
	}

	$table = new Dash_Notes_List_Table();
	$table->prepare_items();
	?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<?php $table->display(); ?>
	</div>
	<?php
}

/**
 * Status meta box.
 */
function dash_add_status_meta_box() {
	add_meta_box(
		'dash_note_status',
		__( 'Note Status', 'dash' ),
		'dash_status_meta_box_callback',
		'wis_note',
		'side',
		'default'
	);
}

/**
 * Meta box callback.
 *
 * @param WP_Post $post Current post.
 */
function dash_status_meta_box_callback( $post ) {
	wp_nonce_field( 'dash_save_status', 'dash_status_nonce' );
	$status = get_post_meta( $post->ID, '_dash_status', true );
	if ( empty( $status ) ) {
		$status = 'open';
	}
	?>
	<label for="dash_status"><?php echo esc_html__( 'Status:', 'dash' ); ?></label>
	<select name="dash_status" id="dash_status">
		<option value="open" <?php selected( $status, 'open' ); ?>><?php echo esc_html__( 'Open', 'dash' ); ?></option>
		<option value="in-progress" <?php selected( $status, 'in-progress' ); ?>><?php echo esc_html__( 'In Progress', 'dash' ); ?></option>
		<option value="resolved" <?php selected( $status, 'resolved' ); ?>><?php echo esc_html__( 'Resolved', 'dash' ); ?></option>
	</select>
	<?php
}

/**
 * Save note meta.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function dash_save_note_meta( $post_id, $post ) {
	if ( ! isset( $_POST['dash_status_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['dash_status_nonce'] ) ), 'dash_save_status' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_wis_note', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['dash_status'] ) ) {
		$status = sanitize_text_field( wp_unslash( $_POST['dash_status'] ) );
		update_post_meta( $post_id, '_dash_status', $status );
	}
}

/**
 * Log activity.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function dash_log_activity( $post_id, $post ) {
	$log = get_post_meta( $post_id, '_dash_activity_log', true );
	if ( ! is_array( $log ) ) {
		$log = array();
	}

	$log[] = array(
		'time'   => current_time( 'mysql' ),
		'user'   => get_current_user_id(),
		'action' => 'updated',
	);

	update_post_meta( $post_id, '_dash_activity_log', $log );
}

/**
 * Map custom capabilities.
 */
function dash_map_meta_caps( $caps, $cap, $user_id, $args ) {
	if ( 'edit_wis_note' === $cap || 'delete_wis_note' === $cap || 'read_wis_note' === $cap ) {
		$caps = array( 'edit_wis_notes' );
	}
	return $caps;
}
add_filter( 'map_meta_cap', 'dash_map_meta_caps', 10, 4 );
