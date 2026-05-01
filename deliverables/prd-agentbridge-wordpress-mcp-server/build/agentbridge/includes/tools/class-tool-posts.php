<?php
/**
 * Class Relay_Tool_Posts
 *
 * Provides post management tools.
 */
class Relay_Tool_Posts {

	/**
	 * Get tool schema.
	 *
	 * @return array
	 */
	public function get_schema() {
		return array(); // Each method has its own logic, schema handled individually
	}

	/**
	 * List posts with filters.
	 *
	 * @param array $args Arguments.
	 * @return array
	 */
	public function list_posts( $args ) {
		$per_page = isset( $args['per_page'] ) ? min( (int) $args['per_page'], 50 ) : 10;
		$page     = isset( $args['page'] ) ? max( (int) $args['page'], 1 ) : 1;

		$query_args = array(
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'post_status'    => isset( $args['status'] ) ? sanitize_text_field( $args['status'] ) : 'any',
			'post_type'      => isset( $args['post_type'] ) ? sanitize_text_field( $args['post_type'] ) : 'post',
		);

		if ( isset( $args['search'] ) ) {
			$query_args['s'] = sanitize_text_field( $args['search'] );
		}

		if ( isset( $args['author'] ) ) {
			$query_args['author'] = (int) $args['author'];
		}

		$query = new WP_Query( $query_args );
		$posts = array();

		foreach ( $query->posts as $post ) {
			$posts[] = array(
				'id'      => $post->ID,
				'title'   => $post->post_title,
				'content' => $post->post_content,
				'excerpt' => $post->post_excerpt,
				'status'  => $post->post_status,
				'type'    => $post->post_type,
				'author'  => $post->post_author,
				'date'    => $post->post_date,
				'modified' => $post->post_modified,
			);
		}

		return array(
			'posts'       => $posts,
			'total'        => (int) $query->found_posts,
			'total_pages' => (int) $query->max_num_pages,
			'page'        => $page,
			'per_page'    => $per_page,
		);
	}

	/**
	 * Get a single post.
	 *
	 * @param array $args Arguments.
	 * @return array
	 * @throws Exception If post not found.
	 */
	public function get_post( $args ) {
		if ( ! isset( $args['id'] ) ) {
			throw new Exception( 'Missing required argument: id' );
		}

		$post_id = (int) $args['id'];
		$post    = get_post( $post_id );

		if ( ! $post ) {
			throw new Exception( 'Post not found: ' . $post_id );
		}

		return array(
			'id'       => $post->ID,
			'title'    => $post->post_title,
			'content'  => $post->post_content,
			'excerpt'  => $post->post_excerpt,
			'status'   => $post->post_status,
			'type'     => $post->post_type,
			'author'   => $post->post_author,
			'date'     => $post->post_date,
			'modified' => $post->post_modified,
			'meta'     => get_post_meta( $post_id ),
		);
	}

	/**
	 * Create a new post.
	 *
	 * @param array $args Arguments.
	 * @return array
	 * @throws Exception On failure.
	 */
	public function create_post( $args ) {
		$post_data = array(
			'post_title'   => isset( $args['title'] ) ? sanitize_text_field( $args['title'] ) : __( 'New Post', 'agentbridge' ),
			'post_content' => isset( $args['content'] ) ? wp_kses_post( $args['content'] ) : '',
			'post_excerpt' => isset( $args['excerpt'] ) ? sanitize_textarea_field( $args['excerpt'] ) : '',
			'post_status'  => isset( $args['status'] ) ? sanitize_text_field( $args['status'] ) : 'draft',
			'post_type'    => isset( $args['post_type'] ) ? sanitize_text_field( $args['post_type'] ) : 'post',
		);

		$post_id = wp_insert_post( $post_data, true );

		if ( is_wp_error( $post_id ) ) {
			throw new Exception( $post_id->get_error_message() );
		}

		// Handle meta if provided
		if ( isset( $args['meta'] ) && is_array( $args['meta'] ) ) {
			foreach ( $args['meta'] as $key => $value ) {
				update_post_meta( $post_id, sanitize_text_field( $key ), sanitize_text_field( $value ) );
			}
		}

		$post = get_post( $post_id );

		return array(
			'id'        => $post->ID,
			'title'     => $post->post_title,
			'status'    => $post->post_status,
			'link'      => get_permalink( $post_id ),
			'edit_link' => get_edit_post_link( $post_id, 'raw' ),
		);
	}

	/**
	 * Update an existing post.
	 *
	 * @param array $args Arguments.
	 * @return array
	 * @throws Exception On failure.
	 */
	public function update_post( $args ) {
		if ( ! isset( $args['id'] ) ) {
			throw new Exception( 'Missing required argument: id' );
		}

		$post_id = (int) $args['id'];
		$post    = get_post( $post_id );

		if ( ! $post ) {
			throw new Exception( 'Post not found: ' . $post_id );
		}

		$post_data = array( 'ID' => $post_id );

		if ( isset( $args['title'] ) ) {
			$post_data['post_title'] = sanitize_text_field( $args['title'] );
		}
		if ( isset( $args['content'] ) ) {
			$post_data['post_content'] = wp_kses_post( $args['content'] );
		}
		if ( isset( $args['excerpt'] ) ) {
			$post_data['post_excerpt'] = sanitize_textarea_field( $args['excerpt'] );
		}
		if ( isset( $args['status'] ) ) {
			$post_data['post_status'] = sanitize_text_field( $args['status'] );
		}

		$result = wp_update_post( $post_data, true );

		if ( is_wp_error( $result ) ) {
			throw new Exception( $result->get_error_message() );
		}

		// Handle meta if provided - merge with existing
		if ( isset( $args['meta'] ) && is_array( $args['meta'] ) ) {
			foreach ( $args['meta'] as $key => $value ) {
				update_post_meta( $post_id, sanitize_text_field( $key ), sanitize_text_field( $value ) );
			}
		}

		$updated_post = get_post( $post_id );

		return array(
			'id'       => $updated_post->ID,
			'title'    => $updated_post->post_title,
			'status'   => $updated_post->post_status,
			'link'     => get_permalink( $post_id ),
			'edit_link' => get_edit_post_link( $post_id, 'raw' ),
		);
	}

	/**
	 * Delete a post.
	 *
	 * @param array $args Arguments.
	 * @return array
	 * @throws Exception On failure or if trying to delete non-post content.
	 */
	public function delete_post( $args ) {
		if ( ! isset( $args['id'] ) ) {
			throw new Exception( 'Missing required argument: id' );
		}

		$post_id = (int) $args['id'];
		$post    = get_post( $post_id );

		if ( ! $post ) {
			throw new Exception( 'Post not found: ' . $post_id );
		}

		$previous_status = $post->post_status;
		$force           = isset( $args['force'] ) && $args['force'];

		// Security: ensure this is a post, not a file
		$allowed_types = get_post_types( array( 'public' => true ) );
		if ( ! in_array( $post->post_type, $allowed_types, true ) ) {
			throw new Exception( 'Cannot delete this content type' );
		}

		if ( $force ) {
			$result = wp_delete_post( $post_id, true );
		} else {
			$result = wp_trash_post( $post_id );
		}

		if ( ! $result ) {
			throw new Exception( 'Failed to delete post' );
		}

		return array(
			'deleted'         => true,
			'previous_status' => $previous_status,
		);
	}
}
