<?php
/**
 * Plugin Name: Pinned
 * Plugin URI:  https://example.com/wp-intelligence-suite
 * Description: Agreements and memory module for the WP Intelligence Suite.
 * Version:     1.0.0
 * Author:      Shipyard AI
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pinned
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PINNED_VERSION', '1.0.0' );
define( 'PINNED_DIR', plugin_dir_path( __FILE__ ) );
define( 'PINNED_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation: seed a sample agreement.
 */
function pinned_activate() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( false === get_option( 'pinned_version' ) ) {
		add_option( 'pinned_version', PINNED_VERSION );
	}

	// Seed sample agreement.
	$existing = get_posts(
		array(
			'post_type'   => 'wis_agreement',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
		)
	);

	if ( empty( $existing ) ) {
		$post_id = wp_insert_post(
			array(
				'post_title'   => __( 'Sample Agreement', 'pinned' ),
				'post_content' => __( 'This is a sample agreement to help you get started with Pinned. Edit or replace it with your own agreements.', 'pinned' ),
				'post_status'  => 'publish',
				'post_type'    => 'wis_agreement',
			)
		);

		if ( ! is_wp_error( $post_id ) ) {
			$checklist = array(
				array( 'text' => __( 'Review agreement terms', 'pinned' ), 'done' => false ),
				array( 'text' => __( 'Share with team', 'pinned' ), 'done' => false ),
				array( 'text' => __( 'Finalize and pin', 'pinned' ), 'done' => false ),
			);
			update_post_meta( $post_id, '_pinned_checklist', $checklist );
		}
	}
}
register_activation_hook( __FILE__, 'pinned_activate' );

/**
 * Deactivation.
 */
function pinned_deactivate() {
	delete_transient( 'pinned_bookmarks_cache' );
}
register_deactivation_hook( __FILE__, 'pinned_deactivate' );

/**
 * Bootstrap.
 */
function pinned_bootstrap() {
	if ( ! defined( 'WIS_VERSION' ) ) {
		add_action( 'admin_notices', 'pinned_missing_core_notice' );
		return;
	}

	require_once PINNED_DIR . 'includes/class-agreements-list-table.php';

	// Register CPT and taxonomy.
	add_action( 'init', 'pinned_register_post_type' );
	add_action( 'init', 'pinned_register_taxonomy' );

	// Admin menu.
	add_action( 'admin_menu', 'pinned_register_admin_menu' );

	// Meta boxes.
	add_action( 'add_meta_boxes', 'pinned_add_checklist_meta_box' );
	add_action( 'save_post_wis_agreement', 'pinned_save_checklist_meta', 10, 2 );
}
add_action( 'plugins_loaded', 'pinned_bootstrap' );

/**
 * Dependency notice.
 */
function pinned_missing_core_notice() {
	echo '<div class="error"><p>' . esc_html__( 'Pinned requires WP Intelligence Suite Core. Please install and activate wis-core.', 'pinned' ) . '</p></div>';
}

/**
 * Register custom post type.
 */
function pinned_register_post_type() {
	$labels = array(
		'name'                  => _x( 'Agreements', 'post type general name', 'pinned' ),
		'singular_name'         => _x( 'Agreement', 'post type singular name', 'pinned' ),
		'add_new'               => __( 'Add New', 'pinned' ),
		'add_new_item'          => __( 'Add New Agreement', 'pinned' ),
		'edit_item'             => __( 'Edit Agreement', 'pinned' ),
		'new_item'              => __( 'New Agreement', 'pinned' ),
		'view_item'             => __( 'View Agreement', 'pinned' ),
		'search_items'          => __( 'Search Agreements', 'pinned' ),
		'not_found'             => __( 'No agreements found', 'pinned' ),
		'not_found_in_trash'    => __( 'No agreements found in Trash', 'pinned' ),
		'all_items'             => __( 'All Agreements', 'pinned' ),
		'menu_name'             => __( 'Pinned', 'pinned' ),
	);

	$args = array(
		'labels'            => $labels,
		'public'            => false,
		'show_ui'           => true,
		'show_in_menu'      => false,
		'capability_type'   => array( 'wis_agreement', 'wis_agreements' ),
		'map_meta_cap'      => true,
		'supports'          => array( 'title', 'editor', 'author', 'revisions' ),
		'has_archive'       => false,
		'rewrite'           => false,
		'menu_icon'         => 'dashicons-sticky',
	);

	register_post_type( 'wis_agreement', $args );
}

/**
 * Register taxonomy.
 */
function pinned_register_taxonomy() {
	$labels = array(
		'name'          => _x( 'Categories', 'taxonomy general name', 'pinned' ),
		'singular_name' => _x( 'Category', 'taxonomy singular name', 'pinned' ),
		'search_items'  => __( 'Search Categories', 'pinned' ),
		'all_items'     => __( 'All Categories', 'pinned' ),
		'edit_item'     => __( 'Edit Category', 'pinned' ),
		'add_new_item'  => __( 'Add New Category', 'pinned' ),
		'new_item_name' => __( 'New Category Name', 'pinned' ),
		'menu_name'     => __( 'Categories', 'pinned' ),
	);

	$args = array(
		'labels'       => $labels,
		'hierarchical' => true,
		'public'       => false,
		'show_ui'      => true,
		'rewrite'      => false,
	);

	register_taxonomy( 'wis_agreement_cat', array( 'wis_agreement' ), $args );
}

/**
 * Admin menu.
 */
function pinned_register_admin_menu() {
	add_menu_page(
		__( 'Pinned', 'pinned' ),
		__( 'Pinned', 'pinned' ),
		'edit_wis_agreements',
		'pinned-agreements',
		'pinned_render_agreements_page',
		'dashicons-sticky',
		31
	);

	add_submenu_page(
		'pinned-agreements',
		__( 'All Agreements', 'pinned' ),
		__( 'All Agreements', 'pinned' ),
		'edit_wis_agreements',
		'pinned-agreements',
		'pinned_render_agreements_page'
	);
}

/**
 * Render agreements list page.
 */
function pinned_render_agreements_page() {
	if ( ! current_user_can( 'edit_wis_agreements' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'pinned' ) );
	}

	$table = new Pinned_Agreements_List_Table();
	$table->prepare_items();
	?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<?php $table->display(); ?>
	</div>
	<?php
}

/**
 * Checklist meta box.
 */
function pinned_add_checklist_meta_box() {
	add_meta_box(
		'pinned_checklist',
		__( 'Agreement Checklist', 'pinned' ),
		'pinned_checklist_meta_box_callback',
		'wis_agreement',
		'side',
		'default'
	);
}

/**
 * Meta box callback.
 *
 * @param WP_Post $post Current post.
 */
function pinned_checklist_meta_box_callback( $post ) {
	wp_nonce_field( 'pinned_save_checklist', 'pinned_checklist_nonce' );
	$checklist = get_post_meta( $post->ID, '_pinned_checklist', true );
	if ( ! is_array( $checklist ) ) {
		$checklist = array();
	}
	?>
	<div class="pinned-checklist-wrapper">
		<?php foreach ( $checklist as $index => $item ) : ?>
			<div class="pinned-checklist-item">
				<input type="checkbox" name="pinned_checklist[<?php echo esc_attr( $index ); ?>][done]" value="1" <?php checked( ! empty( $item['done'] ) ); ?> />
				<input type="text" name="pinned_checklist[<?php echo esc_attr( $index ); ?>][text]" value="<?php echo esc_attr( $item['text'] ); ?>" />
			</div>
		<?php endforeach; ?>
	</div>
	<?php
}

/**
 * Save checklist meta.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function pinned_save_checklist_meta( $post_id, $post ) {
	if ( ! isset( $_POST['pinned_checklist_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pinned_checklist_nonce'] ) ), 'pinned_save_checklist' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_wis_agreement', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['pinned_checklist'] ) && is_array( $_POST['pinned_checklist'] ) ) {
		$checklist = array();
		foreach ( wp_unslash( $_POST['pinned_checklist'] ) as $item ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$checklist[] = array(
				'text' => sanitize_text_field( isset( $item['text'] ) ? $item['text'] : '' ),
				'done' => ! empty( $item['done'] ),
			);
		}
		update_post_meta( $post_id, '_pinned_checklist', $checklist );
	}
}

/**
 * Map custom capabilities.
 */
function pinned_map_meta_caps( $caps, $cap, $user_id, $args ) {
	if ( 'edit_wis_agreement' === $cap || 'delete_wis_agreement' === $cap || 'read_wis_agreement' === $cap ) {
		$caps = array( 'edit_wis_agreements' );
	}
	return $caps;
}
add_filter( 'map_meta_cap', 'pinned_map_meta_caps', 10, 4 );
