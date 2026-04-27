<?php
if (!defined('ABSPATH')) {
	exit;
}

class Scribe_Storage {

	const META_KEY = '_scribe_transcript';
	const META_TIME_KEY = '_scribe_transcript_time';

	public static function save_transcript($post_id, $data) {
		$json = wp_json_encode($data);
		if (false === $json) {
			return false;
		}
		update_post_meta($post_id, self::META_KEY, $json);
		update_post_meta($post_id, self::META_TIME_KEY, time());
		return true;
	}

	public static function get_transcript($post_id) {
		$json = get_post_meta($post_id, self::META_KEY, true);
		if (empty($json)) {
			return array();
		}
		$data = json_decode($json, true);
		if (null === $data) {
			return array();
		}
		return $data;
	}

	public static function prune_old_transcripts() {
		$retention = apply_filters('scribe_transcript_retention_days', 30);
		$cutoff = time() - ($retention * DAY_IN_SECONDS);

		global $wpdb;
		$wpdb->query($wpdb->prepare(
			"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s AND post_id IN (
				SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND CAST(meta_value AS UNSIGNED) < %d
			)",
			self::META_KEY,
			self::META_TIME_KEY,
			$cutoff
		));
		$wpdb->query($wpdb->prepare(
			"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s AND CAST(meta_value AS UNSIGNED) < %d",
			self::META_TIME_KEY,
			$cutoff
		));
	}
}
