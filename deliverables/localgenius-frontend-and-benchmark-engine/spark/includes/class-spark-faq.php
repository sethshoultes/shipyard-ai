<?php
/**
 * SPARK_FAQ
 *
 * FAQ template fetch and toggle persistence.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SPARK_FAQ {

	public function get_templates( $category ) {
		$api  = new SPARK_API();
		$data = $api->get_faqs( $category );

		if ( is_wp_error( $data ) || empty( $data['faqs'] ) ) {
			return $this->default_templates();
		}

		$out = array();
		foreach ( $data['faqs'] as $i => $item ) {
			$out[] = array(
				'question' => isset( $item['q'] ) ? $item['q'] : ( isset( $item['question'] ) ? $item['question'] : '' ),
				'answer'   => isset( $item['a'] ) ? $item['a'] : ( isset( $item['answer'] ) ? $item['answer'] : '' ),
				'enabled'  => false,
				'index'    => $i,
			);
		}
		return $out;
	}

	public function get_active() {
		$raw = get_option( 'spark_active_faqs', '[]' );
		$arr = json_decode( $raw, true );
		return is_array( $arr ) ? $arr : array();
	}

	public function save_active( $faqs ) {
		$clean = array();
		foreach ( $faqs as $f ) {
			$clean[] = array(
				'question' => sanitize_text_field( $f['question'] ),
				'answer'   => sanitize_textarea_field( $f['answer'] ),
				'enabled'  => ! empty( $f['enabled'] ) ? 1 : 0,
				'index'    => intval( $f['index'] ),
			);
		}
		update_option( 'spark_active_faqs', wp_json_encode( $clean ) );
		return $clean;
	}

	private function default_templates() {
		$defaults = array(
			array( 'question' => __( 'What are your hours?', 'spark' ), 'answer' => __( 'We are open daily from 9am to 9pm.', 'spark' ), 'enabled' => false, 'index' => 0 ),
			array( 'question' => __( 'Do you take reservations?', 'spark' ), 'answer' => __( 'Walk-ins are welcome. Call ahead for parties of 6 or more.', 'spark' ), 'enabled' => false, 'index' => 1 ),
			array( 'question' => __( 'Is there parking?', 'spark' ), 'answer' => __( 'Street parking is available nearby.', 'spark' ), 'enabled' => false, 'index' => 2 ),
			array( 'question' => __( 'Do you offer takeout?', 'spark' ), 'answer' => __( 'Yes, call or order online.', 'spark' ), 'enabled' => false, 'index' => 3 ),
			array( 'question' => __( 'Do you have vegetarian options?', 'spark' ), 'answer' => __( 'Yes, ask your server for the vegetarian menu.', 'spark' ), 'enabled' => false, 'index' => 4 ),
			array( 'question' => __( 'Can I order online?', 'spark' ), 'answer' => __( 'Yes, through our website.', 'spark' ), 'enabled' => false, 'index' => 5 ),
			array( 'question' => __( 'Do you cater events?', 'spark' ), 'answer' => __( 'Yes, contact us for catering packages.', 'spark' ), 'enabled' => false, 'index' => 6 ),
			array( 'question' => __( 'Do you have gluten-free options?', 'spark' ), 'answer' => __( 'Several dishes can be made gluten-free.', 'spark' ), 'enabled' => false, 'index' => 7 ),
			array( 'question' => __( 'Is there outdoor seating?', 'spark' ), 'answer' => __( 'Patio seating is available seasonally.', 'spark' ), 'enabled' => false, 'index' => 8 ),
			array( 'question' => __( 'Do you offer gift cards?', 'spark' ), 'answer' => __( 'Available in-store and online.', 'spark' ), 'enabled' => false, 'index' => 9 ),
		);
		return $defaults;
	}
}
