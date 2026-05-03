<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$paged   = isset( $_GET['paged'] ) ? max( 1, absint( $_GET['paged'] ) ) : 1;
$filter  = isset( $_GET['relay_filter'] ) ? sanitize_text_field( wp_unslash( $_GET['relay_filter'] ) ) : '';
$sort    = isset( $_GET['relay_sort'] ) ? sanitize_text_field( wp_unslash( $_GET['relay_sort'] ) ) : 'date_desc';
$search  = isset( $_GET['relay_search'] ) ? sanitize_text_field( wp_unslash( $_GET['relay_search'] ) ) : '';

$args = array(
	'post_type'      => 'relay_lead',
	'posts_per_page' => 20,
	'paged'          => $paged,
	'orderby'        => 'date',
	'order'          => 'DESC',
);

if ( 'date_asc' === $sort ) {
	$args['order'] = 'ASC';
} elseif ( 'name_asc' === $sort ) {
	$args['orderby'] = 'title';
	$args['order']   = 'ASC';
} elseif ( 'name_desc' === $sort ) {
	$args['orderby'] = 'title';
	$args['order']   = 'DESC';
}

if ( $filter ) {
	$args['tax_query'] = array(
		array(
			'taxonomy' => 'relay_category',
			'field'    => 'slug',
			'terms'    => $filter,
		),
	);
}

if ( $search ) {
	$args['s'] = $search;
}

$query = new WP_Query( $args );

$categories = get_terms( array(
	'taxonomy'   => 'relay_category',
	'hide_empty' => false,
) );

$badge_colors = array(
	'Sales'    => '#F97316',
	'Support'  => '#38BDF8',
	'Spam'     => '#64748B',
	'General'  => '#E2E8F0',
	'High'     => '#EF4444',
	'Medium'   => '#F59E0B',
	'Low'      => '#22C55E',
);

$base_url = admin_url( 'admin.php?page=relay' );
?&gt;

<div class="wrap relay-inbox"&gt;
	<h1><?php echo esc_html( get_admin_page_title() ); ?&gt;</h1>

	<div class="relay-filter-bar"&gt;
		<form method="get" action="<?php echo esc_url( admin_url( 'admin.php' ) ); ?&gt;">
			<input type="hidden" name="page" value="relay" />
			<input
				type="search"
				name="relay_search"
				value="<?php echo esc_attr( $search ); ?&gt;"
				placeholder="<?php esc_attr_e( 'Search leads...', 'relay' ); ?&gt;"
			/>
			<select name="relay_filter">
				<option value=""><?php esc_html_e( 'All Categories', 'relay' ); ?&gt;</option>
				<?php foreach ( $categories as $cat ) : ?&gt;
					<option value="<?php echo esc_attr( $cat->slug ); ?&gt;" <?php selected( $filter, $cat->slug ); ?&gt;>
						<?php echo esc_html( $cat->name ); ?&gt;
					</option>
				<?php endforeach; ?&gt;
			</select>
			<select name="relay_sort">
				<option value="date_desc" <?php selected( $sort, 'date_desc' ); ?&gt;><?php esc_html_e( 'Newest First', 'relay' ); ?&gt;</option>
				<option value="date_asc" <?php selected( $sort, 'date_asc' ); ?&gt;><?php esc_html_e( 'Oldest First', 'relay' ); ?&gt;</option>
				<option value="name_asc" <?php selected( $sort, 'name_asc' ); ?&gt;><?php esc_html_e( 'Name A-Z', 'relay' ); ?&gt;</option>
				<option value="name_desc" <?php selected( $sort, 'name_desc' ); ?&gt;><?php esc_html_e( 'Name Z-A', 'relay' ); ?&gt;</option>
			</select>
			<?php submit_button( __( 'Filter', 'relay' ), 'secondary', '', false ); ?&gt;
			<a href="<?php echo esc_url( $base_url ); ?&gt;" class="button"><?php esc_html_e( 'Reset', 'relay' ); ?&gt;</a>
		</form>
	</div>

	<div class="relay-pending-banner">
		<span class="relay-pending-count">0</span>
		<?php esc_html_e( 'pending classifications', 'relay' ); ?&gt;
	</div>

	<?php if ( $query->have_posts() ) : ?&gt;
		<table class="wp-list-table widefat fixed striped relay-leads-table">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Name', 'relay' ); ?&gt;</th>
					<th><?php esc_html_e( 'Email', 'relay' ); ?&gt;</th>
					<th><?php esc_html_e( 'Category', 'relay' ); ?&gt;</th>
					<th><?php esc_html_e( 'Urgency', 'relay' ); ?&gt;</th>
					<th><?php esc_html_e( 'Status', 'relay' ); ?&gt;</th>
					<th><?php esc_html_e( 'Date', 'relay' ); ?&gt;</th>
					<th><?php esc_html_e( 'Actions', 'relay' ); ?&gt;</th>
				</tr>
			</thead>
			<tbody>
				<?php while ( $query->have_posts() ) : $query->the_post(); ?&gt;
					<?php
					$post_id    = get_the_ID();
					$email      = get_post_meta( $post_id, '_relay_email', true );
					$status     = get_post_meta( $post_id, '_relay_status', true );
					$cat_terms  = get_the_terms( $post_id, 'relay_category' );
					$urg_terms  = get_the_terms( $post_id, 'relay_urgency' );
					$cat_name   = ( $cat_terms && ! is_wp_error( $cat_terms ) ) ? $cat_terms[0]->name : __( '—', 'relay' );
					$urg_name   = ( $urg_terms && ! is_wp_error( $urg_terms ) ) ? $urg_terms[0]->name : __( '—', 'relay' );
					$cat_color  = isset( $badge_colors[ $cat_name ] ) ? $badge_colors[ $cat_name ] : '#E2E8F0';
					$urg_color  = isset( $badge_colors[ $urg_name ] ) ? $badge_colors[ $urg_name ] : '#F59E0B';
					$cat_text   = in_array( $cat_name, array( 'Spam', 'General' ), true ) ? '#0F172A' : '#FFFFFF';
					$urg_text   = in_array( $urg_name, array( 'Medium' ), true ) ? '#0F172A' : '#FFFFFF';
					if ( 'Low' === $urg_name ) {
						$urg_text = '#FFFFFF';
					}
					$subject = rawurlencode( sprintf( __( 'Re: Your inquiry', 'relay' ) ) );
					?&gt;
					<tr>
						<td><?php echo esc_html( get_the_title() ); ?&gt;</td>
						<td><?php echo esc_html( $email ); ?&gt;</td>
						<td>
							<span class="relay-badge" style="background-color:<?php echo esc_attr( $cat_color ); ?&gt;;color:<?php echo esc_attr( $cat_text ); ?&gt;">
								<?php echo esc_html( $cat_name ); ?&gt;
							</span>
						</td>
						<td>
							<span class="relay-badge" style="background-color:<?php echo esc_attr( $urg_color ); ?&gt;;color:<?php echo esc_attr( $urg_text ); ?&gt;">
								<?php echo esc_html( $urg_name ); ?&gt;
							</span>
						</td>
						<td>
							<span class="relay-status <?php echo esc_attr( 'status-' . sanitize_html_class( $status ) ); ?&gt;">
								<?php echo esc_html( ucfirst( $status ) ); ?&gt;
							</span>
						</td>
						<td><?php echo esc_html( get_the_date() ); ?&gt;</td>
						<td>
							<a href="mailto:<?php echo esc_attr( $email ); ?&gt;?subject=<?php echo esc_attr( $subject ); ?&gt;"
							   class="button button-small relay-reply-link"
							   data-email="<?php echo esc_attr( $email ); ?&gt;">
								<?php esc_html_e( 'Reply', 'relay' ); ?&gt;
							</a>
						</td>
					</tr>
				<?php endwhile; ?&gt;
			</tbody>
		</table>

		<div class="relay-pagination">
			<?php
			$big = 999999;
			echo wp_kses_post(
				paginate_links(
					array(
						'base'      => str_replace( $big, '%#%', esc_url( add_query_arg( 'paged', $big, $base_url ) ) ),
						'format'    => '?paged=%#%',
						'current'   => max( 1, $paged ),
						'total'     => $query->max_num_pages,
						'prev_text' => __( '&larr; Previous', 'relay' ),
						'next_text' => __( 'Next &rarr;', 'relay' ),
					)
				)
			);
			?&gt;
		</div>
	<?php else : ?&gt;
		<p><?php esc_html_e( 'No leads found.', 'relay' ); ?&gt;</p>
	<?php endif; ?&gt;
	<?php wp_reset_postdata(); ?&gt;
</div>
