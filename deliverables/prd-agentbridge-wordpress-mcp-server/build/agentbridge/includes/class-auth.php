<?php
/**
 * Class Relay_Auth
 *
 * Validates Bearer tokens and checks user capabilities.
 */
class Relay_Auth {

	/**
	 * Validate the Authorization header.
	 *
	 * @param string $auth_header The Authorization header value.
	 * @return bool
	 */
	public function validate_token( $auth_header ) {
		if ( ! is_string( $auth_header ) ) {
			return false;
		}

		// Extract Bearer token
		if ( ! preg_match( '/Bearer\s+(\S+)/i', $auth_header, $matches ) ) {
			return false;
		}

		$token = $matches[1];

		// Check against hashed plugin token
		$stored_hash = get_option( 'agentbridge_api_key' );
		if ( $stored_hash && wp_check_password( $token, $stored_hash ) ) {
			return true;
		}

		// Fallback: check Application Passwords
		return $this->validate_application_password( $token );
	}

	/**
	 * Validate WordPress Application Password.
	 *
	 * @param string $token The token to validate.
	 * @return bool
	 */
	private function validate_application_password( $token ) {
		$users = get_users( array( 'fields' => 'ID' ) );
		foreach ( $users as $user_id ) {
			if ( wp_check_application_password( $user_id, $token ) ) {
				// Verify the user has edit_posts capability
				$user = get_userdata( $user_id );
				if ( $user && user_can( $user, 'edit_posts' ) ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Check if current user can edit posts.
	 *
	 * @return bool
	 */
	public function can_edit_posts() {
		return current_user_can( 'edit_posts' );
	}
}
