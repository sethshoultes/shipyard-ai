<?php
if (!defined('ABSPATH')) {
	exit;
}

class Scribe_Job_Queue {

	const META_STATUS = '_scribe_job_status';
	const META_RETRY = '_scribe_job_retries';
	const META_FILE = '_scribe_job_file';

	public function __construct() {
		add_action('scribe_process_queue', array($this, 'process_cron'));
		add_action('wp_ajax_scribe_check_job', array($this, 'ajax_check_job'));
		add_action('wp_ajax_scribe_upload', array($this, 'ajax_upload'));
	}

	public static function add_job($post_id, $file_path) {
		$usage = (int) get_option('scribe_usage_minutes', 0);
		$max_minutes = apply_filters('scribe_max_free_minutes', 60);
		if ($usage >= $max_minutes) {
			return new WP_Error('scribe_quota_exceeded', __('Monthly transcription limit reached.', 'scribe'));
		}

		update_post_meta($post_id, self::META_STATUS, 'pending');
		update_post_meta($post_id, self::META_FILE, $file_path);
		update_post_meta($post_id, self::META_RETRY, 0);
		return true;
	}

	public static function get_job_status($post_id) {
		$status = get_post_meta($post_id, self::META_STATUS, true);
		return $status ?: 'idle';
	}

	public function process_job($post_id) {
		$status = get_post_meta($post_id, self::META_STATUS, true);
		if ($status !== 'pending') {
			return;
		}

		update_post_meta($post_id, self::META_STATUS, 'processing');
		$file_path = get_post_meta($post_id, self::META_FILE, true);
		$retries = (int) get_post_meta($post_id, self::META_RETRY, true);

		$api = new Scribe_API();
		$result = $api->send($file_path);

		if (is_wp_error($result)) {
			$retries++;
			update_post_meta($post_id, self::META_RETRY, $retries);
			if ($retries >= 3) {
				update_post_meta($post_id, self::META_STATUS, 'failed');
			} else {
				update_post_meta($post_id, self::META_STATUS, 'pending');
				wp_schedule_single_event(time() + pow(2, $retries) * 60, 'scribe_process_queue');
			}
			return;
		}

		Scribe_Storage::save_transcript($post_id, $result);

		if (!empty($result['duration'])) {
			$duration = ceil((float) $result['duration'] / 60);
			$usage = (int) get_option('scribe_usage_minutes', 0);
			update_option('scribe_usage_minutes', $usage + $duration);
		}

		update_post_meta($post_id, self::META_STATUS, 'completed');
	}

	public function process_cron() {
		global $wpdb;
		$post_ids = $wpdb->get_col($wpdb->prepare(
			"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s LIMIT 10",
			self::META_STATUS,
			'pending'
		));
		foreach ($post_ids as $post_id) {
			$this->process_job($post_id);
		}
	}

	public function ajax_check_job() {
		if (!current_user_can('edit_posts')) {
			wp_send_json_error(array('message' => __('Unauthorized.', 'scribe')));
		}
		$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
		if (!$post_id) {
			wp_send_json_error(array('message' => __('Invalid post ID.', 'scribe')));
		}
		$status = self::get_job_status($post_id);
		$response = array('status' => $status);
		if ($status === 'completed') {
			$response['transcript'] = Scribe_Storage::get_transcript($post_id);
		}
		wp_send_json_success($response);
	}

	public function ajax_upload() {
		if (!current_user_can('upload_files')) {
			wp_send_json_error(array('message' => __('Unauthorized.', 'scribe')));
		}

		if (empty($_FILES['audio'])) {
			wp_send_json_error(array('message' => __('No file uploaded.', 'scribe')));
		}

		$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
		if (!$post_id) {
			wp_send_json_error(array('message' => __('Invalid post ID.', 'scribe')));
		}

		$upload = wp_handle_upload($_FILES['audio'], array('test_form' => false));
		if (isset($upload['error'])) {
			wp_send_json_error(array('message' => $upload['error']));
		}

		$ext = strtolower(pathinfo($upload['file'], PATHINFO_EXTENSION));
		if (!in_array($ext, array('mp3', 'm4a', 'wav'), true)) {
			wp_delete_file($upload['file']);
			wp_send_json_error(array('message' => __('Invalid file type. Only MP3, M4A, and WAV are allowed.', 'scribe')));
		}

		$api_key = Scribe_API::get_api_key();
		if (empty($api_key)) {
			wp_delete_file($upload['file']);
			wp_send_json_error(array(
				'message' => __('OpenAI API key is not configured.', 'scribe'),
				'link' => admin_url('options-general.php?page=scribe-settings'),
			));
		}

		self::add_job($post_id, $upload['file']);
		wp_send_json_success(array('status' => 'pending'));
	}
}
