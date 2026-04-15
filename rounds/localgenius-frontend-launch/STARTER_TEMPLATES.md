# LocalGenius: Starter Code Templates

Ready-to-adapt code snippets from the codebase, organized by file.

---

## 1. localgenius.php (Main Plugin File)

**Based on:** `/plugins/adminpulse/adminpulse.php`

```php
<?php
/**
 * LocalGenius
 *
 * @package LocalGenius
 * @version 1.0.0
 */

/**
 * Plugin Name: LocalGenius
 * Description: AI chat widget for local businesses. Never miss a customer question.
 * Version: 1.0.0
 * Requires at least: 6.2
 * Requires PHP: 8.0
 * Author: LocalGenius Team
 * License: GPL-2.0-or-later
 * Text Domain: localgenius
 */

// Security check
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define constants
define( 'LOCALGENIUS_VERSION', '1.0.0' );
define( 'LOCALGENIUS_DIR', plugin_dir_path( __FILE__ ) );
define( 'LOCALGENIUS_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation hook
 */
function localgenius_activate() {
    // Initialize default options
    if ( ! get_option( 'localgenius_settings' ) ) {
        update_option( 'localgenius_settings', array(
            'activated' => false,
            'business_type' => '',
            'api_key' => '',
        ) );
    }
}

/**
 * Deactivation hook
 */
function localgenius_deactivate() {
    // Cleanup if needed
    // Keep settings for reactivation
}

/**
 * Bootstrap the plugin
 */
function localgenius_boot() {
    // Load admin hooks
    if ( is_admin() ) {
        require_once LOCALGENIUS_DIR . 'includes/admin-settings.php';
    }

    // Load frontend hooks
    add_action( 'wp_enqueue_scripts', 'localgenius_enqueue_frontend_assets' );
    add_action( 'wp_ajax_localgenius_generate_faqs', 'localgenius_ajax_generate_faqs' );
    add_action( 'wp_ajax_localgenius_save_faq', 'localgenius_ajax_save_faq' );
    add_action( 'wp_ajax_localgenius_delete_faq', 'localgenius_ajax_delete_faq' );
    add_action( 'wp_ajax_localgenius_activate', 'localgenius_ajax_activate' );
}

/**
 * Enqueue frontend assets
 */
function localgenius_enqueue_frontend_assets() {
    $settings = get_option( 'localgenius_settings', array() );

    // Only enqueue if activated and API key exists
    if ( empty( $settings['api_key'] ) || empty( $settings['activated'] ) ) {
        return;
    }

    // Enqueue widget script
    wp_enqueue_script(
        'localgenius-widget',
        LOCALGENIUS_URL . 'assets/js/chat-bubble.min.js',
        array(),
        LOCALGENIUS_VERSION,
        true
    );

    // Pass config to JavaScript
    wp_localize_script(
        'localgenius-widget',
        'localgeniusConfig',
        array(
            'apiKey'   => $settings['api_key'],
            'apiUrl'   => '/api/v1/chat', // Or your Cloudflare Worker URL
            'siteUrl'  => site_url(),
        )
    );
}

/**
 * AJAX: Generate FAQs based on business type
 */
function localgenius_ajax_generate_faqs() {
    check_ajax_referer( 'localgenius_nonce', 'nonce' );

    $business_type = sanitize_text_field( $_POST['business_type'] ?? '' );

    if ( empty( $business_type ) ) {
        wp_send_json_error( 'Business type required' );
    }

    // Get FAQ templates for business type
    $faqs = localgenius_get_faq_templates( $business_type );

    wp_send_json_success( array( 'faqs' => $faqs ) );
}

/**
 * AJAX: Save FAQ
 */
function localgenius_ajax_save_faq() {
    check_ajax_referer( 'localgenius_nonce', 'nonce' );

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized', 403 );
    }

    $faq_id = sanitize_text_field( $_POST['faq_id'] ?? '' );
    $question = sanitize_text_field( $_POST['question'] ?? '' );
    $answer = wp_kses_post( $_POST['answer'] ?? '' );

    if ( empty( $question ) || empty( $answer ) ) {
        wp_send_json_error( 'Question and answer required' );
    }

    // TODO: Save to WordPress options or custom table
    // For now, store in options as JSON array
    $faqs = get_option( 'localgenius_faqs', array() );

    if ( ! $faq_id ) {
        $faq_id = 'faq_' . time();
    }

    $faqs[ $faq_id ] = array(
        'id'       => $faq_id,
        'question' => $question,
        'answer'   => $answer,
        'created'  => current_time( 'mysql' ),
    );

    update_option( 'localgenius_faqs', $faqs );

    wp_send_json_success( array( 'faq_id' => $faq_id ) );
}

/**
 * AJAX: Delete FAQ
 */
function localgenius_ajax_delete_faq() {
    check_ajax_referer( 'localgenius_nonce', 'nonce' );

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized', 403 );
    }

    $faq_id = sanitize_text_field( $_POST['faq_id'] ?? '' );

    $faqs = get_option( 'localgenius_faqs', array() );
    unset( $faqs[ $faq_id ] );
    update_option( 'localgenius_faqs', $faqs );

    wp_send_json_success();
}

/**
 * AJAX: Activate plugin (save API key)
 */
function localgenius_ajax_activate() {
    check_ajax_referer( 'localgenius_nonce', 'nonce' );

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized', 403 );
    }

    $api_key = sanitize_text_field( $_POST['api_key'] ?? '' );
    $business_type = sanitize_text_field( $_POST['business_type'] ?? '' );
    $faqs = isset( $_POST['faqs'] ) ? array_map( 'sanitize_textarea_field', (array) $_POST['faqs'] ) : array();

    if ( empty( $api_key ) ) {
        wp_send_json_error( 'API key required' );
    }

    // Save settings
    $settings = get_option( 'localgenius_settings', array() );
    $settings['api_key'] = $api_key;
    $settings['business_type'] = $business_type;
    $settings['activated'] = true;
    $settings['activated_at'] = current_time( 'mysql' );

    update_option( 'localgenius_settings', $settings );
    update_option( 'localgenius_faqs', $faqs );

    wp_send_json_success( array( 'message' => 'LocalGenius activated!' ) );
}

/**
 * Get FAQ templates by business type
 */
function localgenius_get_faq_templates( $business_type ) {
    $templates = array(
        'restaurant' => array(
            array(
                'question' => 'Do you deliver?',
                'answer' => 'Yes, we deliver within a 5-mile radius. Orders are typically delivered within 30 minutes.',
            ),
            array(
                'question' => 'What are your hours?',
                'answer' => 'We are open Monday-Sunday, 11am-10pm.',
            ),
            array(
                'question' => 'Do you offer catering?',
                'answer' => 'Yes! We offer catering for events of 10 or more people. Please contact us at least 48 hours in advance.',
            ),
        ),
        'dentist' => array(
            array(
                'question' => 'Do you accept insurance?',
                'answer' => 'Yes, we accept most major dental insurance plans. Please bring your insurance card to your appointment.',
            ),
            array(
                'question' => 'How do I schedule an appointment?',
                'answer' => 'You can schedule online at our website or call us at (555) 123-4567.',
            ),
            array(
                'question' => 'Do you offer teeth whitening?',
                'answer' => 'Yes, we offer professional teeth whitening. Ask about our special promotions!',
            ),
        ),
        'general' => array(
            array(
                'question' => 'How can I contact you?',
                'answer' => 'You can reach us by phone, email, or by visiting us in person. Check our Contact page for details.',
            ),
            array(
                'question' => 'What are your hours of operation?',
                'answer' => 'Please visit our website to see our current hours.',
            ),
        ),
    );

    return $templates[ $business_type ] ?? $templates['general'];
}

// Register activation and deactivation hooks
register_activation_hook( __FILE__, 'localgenius_activate' );
register_deactivation_hook( __FILE__, 'localgenius_deactivate' );

// Bootstrap plugin
add_action( 'plugins_loaded', 'localgenius_boot' );
```

---

## 2. assets/js/chat-bubble.js (Widget Component)

**Based on:** `/plugins/adminpulse/assets/js/adminpulse.js`

```javascript
(function() {
    'use strict';

    const config = window.localgeniusConfig || {};

    // Create widget container
    function createBubble() {
        // Main bubble container
        const container = document.createElement('div');
        container.id = 'lg-widget-container';
        container.innerHTML = `
            <div id="lg-bubble" class="lg-bubble">
                <button id="lg-bubble-btn" class="lg-bubble-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <div id="lg-window" class="lg-window hidden">
                    <div class="lg-header">
                        <h3>How can we help?</h3>
                        <button id="lg-close" class="lg-close">&times;</button>
                    </div>
                    <div id="lg-messages" class="lg-messages"></div>
                    <form id="lg-form" class="lg-form">
                        <input type="text" id="lg-input" placeholder="Type your question..." />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Inject styles
        injectStyles();

        // Setup event listeners
        setupEventListeners();

        // Check for saved API key
        if (!config.apiKey) {
            console.warn('LocalGenius: No API key configured');
        }
    }

    // Inject CSS styles
    function injectStyles() {
        const styles = `
            #lg-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .lg-bubble {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
            }

            .lg-bubble-btn {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: #0073aa;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 115, 170, 0.3);
                transition: transform 0.2s, box-shadow 0.2s;
                padding: 0;
            }

            .lg-bubble-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 115, 170, 0.4);
            }

            .lg-window {
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }

            .lg-window.hidden {
                display: none;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .lg-header {
                padding: 16px;
                background: #0073aa;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .lg-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .lg-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
            }

            .lg-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .lg-message {
                display: flex;
                gap: 8px;
                animation: fadeIn 0.3s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .lg-message.user {
                justify-content: flex-end;
            }

            .lg-message-text {
                max-width: 70%;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.4;
            }

            .lg-message.user .lg-message-text {
                background: #0073aa;
                color: white;
                border-bottom-right-radius: 2px;
            }

            .lg-message.bot .lg-message-text {
                background: #f0f0f0;
                color: #333;
                border-bottom-left-radius: 2px;
            }

            .lg-form {
                padding: 12px 16px;
                border-top: 1px solid #e0e0e0;
                display: flex;
                gap: 8px;
            }

            #lg-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d0d0d0;
                border-radius: 6px;
                font-size: 14px;
                outline: none;
            }

            #lg-input:focus {
                border-color: #0073aa;
                box-shadow: 0 0 0 2px rgba(0, 115, 170, 0.1);
            }

            .lg-form button {
                padding: 8px 16px;
                background: #0073aa;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: background 0.2s;
            }

            .lg-form button:hover {
                background: #005a87;
            }

            .lg-powered-by {
                font-size: 11px;
                color: #999;
                text-align: center;
                padding: 8px 0;
                margin-top: 4px;
            }

            @media (max-width: 480px) {
                .lg-window {
                    width: calc(100vw - 32px);
                    height: 70vh;
                }
            }
        `;

        const style = document.createElement('style');
        style.textContent = styles;
        document.head.appendChild(style);
    }

    // Setup event listeners
    function setupEventListeners() {
        const bubbleBtn = document.getElementById('lg-bubble-btn');
        const closeBtn = document.getElementById('lg-close');
        const form = document.getElementById('lg-form');
        const input = document.getElementById('lg-input');
        const window = document.getElementById('lg-window');

        bubbleBtn.addEventListener('click', () => {
            window.classList.toggle('hidden');
            if (!window.classList.contains('hidden')) {
                input.focus();
            }
        });

        closeBtn.addEventListener('click', () => {
            window.classList.add('hidden');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const message = input.value.trim();
            if (!message) return;

            // Display user message
            displayMessage(message, 'user');
            input.value = '';

            // Send to API
            try {
                const response = await sendMessage(message);
                displayMessage(response, 'bot');
            } catch (error) {
                displayMessage('Sorry, I couldn\'t process your request. Please try again.', 'bot');
                console.error('Chat error:', error);
            }
        });
    }

    // Display message in chat
    function displayMessage(text, sender) {
        const messagesContainer = document.getElementById('lg-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `lg-message ${sender}`;
        messageEl.innerHTML = `<div class="lg-message-text">${escapeHtml(text)}</div>`;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send message to API
    async function sendMessage(message) {
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                businessId: config.businessId || window.location.hostname,
                apiKey: config.apiKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || 'No response from server.';
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize on DOMContentLoaded or immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBubble);
    } else {
        createBubble();
    }
})();
```

---

## 3. assets/js/api-client.js (Lightweight)

```javascript
/**
 * API Client for LocalGenius
 * Handles communication with backend /chat endpoint
 */

class LocalGeniusAPI {
    constructor(config) {
        this.apiUrl = config.apiUrl;
        this.apiKey = config.apiKey;
        this.businessId = config.businessId;
        this.timeout = 5000; // 5 second timeout
    }

    /**
     * Send message to chat API
     * @param {string} message - User message
     * @returns {Promise<{response: string, sources?: string[]}>}
     */
    async sendMessage(message) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                },
                body: JSON.stringify({
                    message,
                    businessId: this.businessId,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { response: data.response || '' };
        } catch (error) {
            if (error.name === 'AbortError') {
                return { response: 'Request timed out. Please try again.' };
            }
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalGeniusAPI;
}
```

---

## 4. assets/css/widget.css (Minimal Styles)

```css
/* LocalGenius Widget Styles */
/* Namespaced with 'lg-' prefix to avoid conflicts */

:root {
    --lg-primary: #0073aa;
    --lg-primary-dark: #005a87;
    --lg-text-primary: #1d2327;
    --lg-text-secondary: #666;
    --lg-bg-light: #f8f8f8;
    --lg-border: #e0e0e0;
    --lg-shadow: 0 4px 12px rgba(0, 115, 170, 0.15);
}

#lg-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.lg-bubble {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
}

.lg-bubble-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--lg-primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--lg-shadow);
    transition: transform 0.2s, box-shadow 0.2s;
    padding: 0;
    font-size: 0;
}

.lg-bubble-btn:hover {
    transform: scale(1.1);
    background: var(--lg-primary-dark);
}

.lg-bubble-btn svg {
    display: block;
    width: 24px;
    height: 24px;
}

.lg-window {
    width: 380px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: lg-slideIn 0.3s ease-out;
}

.lg-window.hidden {
    display: none;
}

@keyframes lg-slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.lg-header {
    padding: 16px;
    background: var(--lg-primary);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.lg-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.lg-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lg-close:hover {
    opacity: 0.8;
}

.lg-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.lg-message {
    display: flex;
    gap: 8px;
    animation: lg-fadeIn 0.3s ease-out;
}

@keyframes lg-fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.lg-message.user {
    justify-content: flex-end;
}

.lg-message-text {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
}

.lg-message.user .lg-message-text {
    background: var(--lg-primary);
    color: white;
    border-bottom-right-radius: 2px;
}

.lg-message.bot .lg-message-text {
    background: var(--lg-bg-light);
    color: var(--lg-text-primary);
    border-bottom-left-radius: 2px;
}

.lg-form {
    padding: 12px 16px;
    border-top: 1px solid var(--lg-border);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

#lg-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--lg-border);
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    font-family: inherit;
}

#lg-input:focus {
    border-color: var(--lg-primary);
    box-shadow: 0 0 0 2px rgba(0, 115, 170, 0.1);
}

.lg-form button {
    padding: 8px 16px;
    background: var(--lg-primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
    flex-shrink: 0;
}

.lg-form button:hover {
    background: var(--lg-primary-dark);
}

.lg-form button:active {
    transform: scale(0.98);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
    .lg-window {
        width: calc(100vw - 32px);
        height: 70vh;
        max-height: 600px;
    }
}

/* Accessibility */
.lg-bubble-btn:focus,
.lg-close:focus,
#lg-input:focus,
.lg-form button:focus {
    outline: 2px solid var(--lg-primary);
    outline-offset: 2px;
}
```

---

## 5. includes/admin-settings.php (Settings Page)

```php
<?php
/**
 * Admin Settings Page for LocalGenius
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register admin menu
 */
function localgenius_register_admin_menu() {
    add_menu_page(
        'LocalGenius Settings',
        'LocalGenius',
        'manage_options',
        'localgenius-settings',
        'localgenius_render_settings_page'
    );
}
add_action( 'admin_menu', 'localgenius_register_admin_menu' );

/**
 * Render settings page
 */
function localgenius_render_settings_page() {
    $settings = get_option( 'localgenius_settings', array() );
    $faqs = get_option( 'localgenius_faqs', array() );
    $activated = $settings['activated'] ?? false;
    $business_type = $settings['business_type'] ?? '';
    ?>

    <div class="wrap">
        <h1><?php esc_html_e( 'LocalGenius Settings', 'localgenius' ); ?></h1>

        <?php if ( ! $activated ) : ?>
            <div id="localgenius-onboarding">
                <h2><?php esc_html_e( 'Welcome to LocalGenius!', 'localgenius' ); ?></h2>

                <div class="onboarding-step step-1">
                    <h3><?php esc_html_e( 'What type of business are you?', 'localgenius' ); ?></h3>

                    <p><?php esc_html_e( 'We\'ll use this to pre-populate helpful FAQs for your customers.', 'localgenius' ); ?></p>

                    <select id="business-type">
                        <option value="">Select your business type...</option>
                        <option value="restaurant"><?php esc_html_e( 'Restaurant / Cafe', 'localgenius' ); ?></option>
                        <option value="dentist"><?php esc_html_e( 'Dentist', 'localgenius' ); ?></option>
                        <option value="salon"><?php esc_html_e( 'Hair Salon / Barber', 'localgenius' ); ?></option>
                        <option value="yoga"><?php esc_html_e( 'Yoga / Fitness Studio', 'localgenius' ); ?></option>
                        <option value="plumber"><?php esc_html_e( 'Plumber / Contractor', 'localgenius' ); ?></option>
                        <option value="general"><?php esc_html_e( 'Other / General', 'localgenius' ); ?></option>
                    </select>

                    <button class="button button-primary" onclick="generateFAQs()">
                        <?php esc_html_e( 'Generate FAQs', 'localgenius' ); ?>
                    </button>
                </div>

                <div class="onboarding-step step-2 hidden">
                    <h3><?php esc_html_e( 'Review FAQs', 'localgenius' ); ?></h3>
                    <div id="faq-list"></div>
                    <button class="button button-primary" onclick="continueToPasteKey()">
                        <?php esc_html_e( 'Continue', 'localgenius' ); ?>
                    </button>
                </div>

                <div class="onboarding-step step-3 hidden">
                    <h3><?php esc_html_e( 'Paste Your API Key', 'localgenius' ); ?></h3>
                    <p><?php esc_html_e( 'Get your API key from your LocalGenius dashboard.', 'localgenius' ); ?></p>
                    <input type="text" id="api-key" placeholder="lg_..." />
                    <button class="button button-primary" onclick="activatePlugin()">
                        <?php esc_html_e( 'Activate LocalGenius', 'localgenius' ); ?>
                    </button>
                </div>
            </div>

        <?php else : ?>
            <div class="localgenius-active">
                <p><?php esc_html_e( '✓ LocalGenius is active!', 'localgenius' ); ?></p>

                <h3><?php esc_html_e( 'Manage FAQs', 'localgenius' ); ?></h3>
                <button class="button button-secondary" onclick="addFAQ()">
                    <?php esc_html_e( '+ Add FAQ', 'localgenius' ); ?>
                </button>
                <div id="faq-list"></div>
            </div>
        <?php endif; ?>

        <!-- Nonce for AJAX -->
        <?php wp_nonce_field( 'localgenius', 'localgenius_nonce' ); ?>
    </div>

    <script>
        const localgeniusConfig = {
            ajaxUrl: '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
            nonce: '<?php echo esc_attr( wp_create_nonce( 'localgenius' ) ); ?>',
        };

        async function generateFAQs() {
            const businessType = document.getElementById( 'business-type' ).value;
            if ( ! businessType ) {
                alert( 'Please select a business type' );
                return;
            }

            const formData = new FormData();
            formData.append( 'action', 'localgenius_generate_faqs' );
            formData.append( 'nonce', localgeniusConfig.nonce );
            formData.append( 'business_type', businessType );

            const response = await fetch( localgeniusConfig.ajaxUrl, {
                method: 'POST',
                body: formData,
            } );

            const data = await response.json();
            if ( data.success ) {
                window.generatedFAQs = data.data.faqs;
                renderFAQList( data.data.faqs );
                document.querySelector( '.step-1' ).classList.add( 'hidden' );
                document.querySelector( '.step-2' ).classList.remove( 'hidden' );
            }
        }

        function renderFAQList( faqs ) {
            const faqList = document.getElementById( 'faq-list' );
            faqList.innerHTML = faqs.map( ( faq, idx ) => `
                <div class="faq-item">
                    <strong>Q: ${escapeHtml( faq.question )}</strong>
                    <p>A: ${escapeHtml( faq.answer )}</p>
                </div>
            ` ).join( '' );
        }

        function continueToPasteKey() {
            document.querySelector( '.step-2' ).classList.add( 'hidden' );
            document.querySelector( '.step-3' ).classList.remove( 'hidden' );
        }

        async function activatePlugin() {
            const apiKey = document.getElementById( 'api-key' ).value;
            if ( ! apiKey ) {
                alert( 'Please paste your API key' );
                return;
            }

            const formData = new FormData();
            formData.append( 'action', 'localgenius_activate' );
            formData.append( 'nonce', localgeniusConfig.nonce );
            formData.append( 'api_key', apiKey );
            formData.append( 'business_type', document.getElementById( 'business-type' ).value );
            formData.append( 'faqs', JSON.stringify( window.generatedFAQs || [] ) );

            const response = await fetch( localgeniusConfig.ajaxUrl, {
                method: 'POST',
                body: formData,
            } );

            const data = await response.json();
            if ( data.success ) {
                alert( 'LocalGenius is now active!' );
                location.reload();
            } else {
                alert( 'Error: ' + ( data.data || 'Unknown error' ) );
            }
        }

        function escapeHtml( text ) {
            const div = document.createElement( 'div' );
            div.textContent = text;
            return div.innerHTML;
        }
    </script>

    <style>
        #localgenius-onboarding {
            max-width: 600px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        .onboarding-step {
            margin: 20px 0;
        }

        .onboarding-step.hidden {
            display: none;
        }

        #business-type,
        #api-key {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            margin: 10px 0;
        }

        .faq-item {
            padding: 12px;
            background: #f5f5f5;
            border-radius: 4px;
            margin: 8px 0;
        }
    </style>
    <?php
}
```

---

## Cleanup & Next Steps

1. **Copy these templates** into their respective files
2. **Adapt FAQ templates** for your business types
3. **Update API endpoint URL** in `localgeniusConfig` to point to your Cloudflare Worker
4. **Test AJAX endpoints** to ensure nonce verification works
5. **Minify and test size** using esbuild

---

**Generated:** April 15, 2026
**From:** Codebase patterns and existing implementations
