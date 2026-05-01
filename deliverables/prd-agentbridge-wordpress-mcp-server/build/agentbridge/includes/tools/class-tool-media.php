<?php
/**
 * Class Relay_Tool_Media
 *
 * Provides media library tool.
 */
class Relay_Tool_Media {

	/**
	 * Get tool schema.
	 *
	 * @return array
	 */
	public function get_schema() {
		return array(
			'description' => 'List media items in the WordPress library.',
			'parameters'  => array(
				'type'       => 'object',
				'properties' => array(
					'per_page'  => array(
						'type'    => 'integer',
						'default' => 10,
					),
					'page'      => array(
						'type'    => 'integer',
						'default' => 1,
					),
					'mime_type' => array(
						'type'    => 'string',
						'default' => '',
					),
				),
			),
		);
	}

	/**
	 * List media items.
	 *
	 * @param array $args Arguments.
	 * @return array
	 */
	public function list_media( $args ) {
		$per_page = isset( $args['per_page'] ) ? min( (int) $args['per_page'], 50 ) : 10;
		$page     = isset( $args['page'] ) ? max( (int) $args['page'], 1 ) : 1;

		$query_args = array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => $per_page,
			'paged'          => $page,
		);

		if ( isset( $args['mime_type'] ) && ! empty( $args['mime_type'] ) ) {
			$query_args['post_mime_type'] = sanitize_text_field( $args['mime_type'] );
		}

		$query = new WP_Query( $query_args );
		$media = array();

		foreach ( $query->posts as $item ) {
			$meta = wp_get_attachment_metadata( $item->ID );
			$media[] = array(
				'id'          => $item->ID,
				'title'       => $item->post_title,
				'url'         => wp_get_attachment_url( $item->ID ),
				'mime_type'   => $item->post_mime_type,
				'alt'         => get_post_meta( $item->ID, '_wp_attachment_image_alt', true ),
				'caption'     => $item->post_excerpt,
				'description' => $item->post_content,
				'date'        => $item->post_date,
				'modified'    => $item->post_modified,
				'meta'        => $meta,
			);
		}

		return array(
			'media'       => $media,
			'total'        => (int) $query->found_posts,
			'total_pages' => (int) $query->max_num_pages,
			'page'        => $page,
			'per_page'    => $per_page,
		);
	}
}
