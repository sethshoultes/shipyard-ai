<?php
/**
 * Plugin Name: Sous
 * Description: A warm, lightweight concierge widget for your site.
 * Version: 1.0.0
 * Author: Shipyard AI
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if (!defined('ABSPATH')) {
  exit;
}

define('SOUS_VERSION', '1.0.0');
define('SOUS_PLUGIN_URL', plugin_dir_url(__FILE__));

function sous_detect_category() {
  $title = get_bloginfo('name');
  $desc = get_bloginfo('description');

  $content = strtolower($title . ' ' . $desc);

  $patterns = array(
    'restaurant'  => array('restaurant', 'cafe', 'bistro', 'kitchen', 'dining', 'bar & grill', 'eatery'),
    'dental'      => array('dental', 'dentist', 'orthodontics', 'oral care', 'smile'),
    'retail'      => array('shop', 'store', 'boutique', 'retail', 'merch', 'goods'),
    'salon'       => array('salon', 'spa', 'hair', 'barber', 'beauty', 'nails', 'stylist'),
    'gym'         => array('gym', 'fitness', 'crossfit', 'yoga studio', 'pilates', 'training'),
    'medical'     => array('clinic', 'medical', 'physician', 'health center', 'urgent care'),
    'legal'       => array('law', 'attorney', 'legal', 'law firm', 'counsel'),
    'realestate'  => array('real estate', 'realtor', 'property', 'homes', 'brokerage'),
    'automotive'  => array('auto', 'car repair', 'mechanic', 'tire', 'dealership'),
    'pet'         => array('vet', 'pet', 'grooming', 'animal hospital', 'dog'),
    'florist'     => array('florist', 'flowers', 'bouquet', 'garden'),
    'bakery'      => array('bakery', 'bread', 'pastry', 'cake', 'dessert'),
    'coffeeshop'  => array('coffee', 'espresso', 'roaster', 'cafe'),
    'plumbing'    => array('plumbing', 'plumber', 'drain', 'pipe'),
    'electrical'  => array('electrician', 'electrical', 'wiring'),
    'hvac'        => array('hvac', 'heating', 'cooling', 'air conditioning'),
    'cleaning'    => array('cleaning', 'maid', 'janitorial', 'housekeeping'),
    'landscaping' => array('landscaping', 'lawn', 'gardening', 'mowing'),
    'photography' => array('photography', 'photo studio', 'portrait', 'wedding photographer'),
    'accounting'  => array('accounting', 'cpa', 'bookkeeping', 'tax'),
  );

  foreach ($patterns as $category => $keywords) {
    foreach ($keywords as $keyword) {
      if (strpos($content, $keyword) !== false) {
        return $category;
      }
    }
  }

  return 'general';
}

function sous_get_default_faqs($category) {
  $faqs = array(
    'restaurant' => array(
      "What are your hours?",
      "Do you take reservations?",
      "Do you accommodate dietary restrictions?",
      "Is there parking nearby?",
      "Do you offer takeout?",
    ),
    'dental' => array(
      "What insurance do you accept?",
      "Do you handle emergencies?",
      "What happens on a first visit?",
      "Do you offer teeth whitening?",
      "Do you see children?",
    ),
    'retail' => array(
      "What is your return policy?",
      "Do you offer shipping?",
      "How do I find my size?",
      "Do you have a loyalty program?",
      "Can I buy a gift card?",
    ),
    'salon' => array(
      "How do I book an appointment?",
      "What products do you carry?",
      "What is your cancellation policy?",
      "Do you take walk-ins?",
      "Do you offer extensions?",
    ),
    'gym' => array(
      "How much is a membership?",
      "Are classes included?",
      "What are your hours?",
      "Do you offer personal training?",
      "Can I bring a guest?",
    ),
    'general' => array(
      "What are your hours?",
      "How do I contact you?",
      "Where are you located?",
      "Do you offer gift cards?",
      "What is your refund policy?",
    ),
  );

  if (isset($faqs[$category])) {
    return $faqs[$category];
  }

  return $faqs['general'];
}

function sous_get_greeting($category) {
  $greetings = array(
    'restaurant'  => "Hungry? Let us point you in the right direction.",
    'dental'      => "Need to book or have a question? We're here.",
    'retail'      => "Looking for something specific? Ask away.",
    'salon'       => "Ready for a fresh look? Let's get you booked.",
    'gym'         => "Questions about membership or classes? Ask here.",
    'medical'     => "Your health matters. How can we assist?",
    'legal'       => "Legal questions? We'll route you to the right person.",
    'realestate'  => "Looking for a new place? Let's talk.",
    'automotive'  => "Car trouble? We're here to help.",
    'pet'         => "Your pet's wellbeing comes first. Ask us anything.",
    'florist'     => "Need something beautiful? Let's create it together.",
    'bakery'      => "Fresh from the oven. What can we get you?",
    'coffeeshop'  => "Need a pick-me-up? Ask about our roasts.",
    'plumbing'    => "Leak or clog? We'll get it sorted.",
    'electrical'  => "Electrical issue? Safety first. Tell us what's up.",
    'hvac'        => "Too hot or too cold? We'll fix it fast.",
    'cleaning'    => "Need a spotless space? We've got you covered.",
    'landscaping' => "Let's make your yard the envy of the block.",
    'photography' => "Capturing moments. Ask about sessions.",
    'accounting'  => "Taxes or books? Let's keep you on track.",
    'general'     => "Questions? We're here to help.",
  );

  return isset($greetings[$category]) ? $greetings[$category] : $greetings['general'];
}

function sous_activate() {
  $category = sous_detect_category();
  $faqs = sous_get_default_faqs($category);
  $greeting = sous_get_greeting($category);

  set_transient('sous_category', $category, YEAR_IN_SECONDS);
  set_transient('sous_faqs', $faqs, YEAR_IN_SECONDS);
  set_transient('sous_greeting', $greeting, YEAR_IN_SECONDS);
  set_transient('sous_active', '0', YEAR_IN_SECONDS);
}
register_activation_hook(__FILE__, 'sous_activate');

function sous_deactivate() {
  delete_transient('sous_category');
  delete_transient('sous_faqs');
  delete_transient('sous_greeting');
  delete_transient('sous_active');
}
register_deactivation_hook(__FILE__, 'sous_deactivate');

function sous_enqueue_widget() {
  $widget_url = SOUS_PLUGIN_URL . 'sous-widget.js';

  wp_enqueue_script(
    'sous-widget',
    $widget_url,
    array(),
    SOUS_VERSION,
    true
  );

  $category = get_transient('sous_category') ?: 'general';
  $greeting = get_transient('sous_greeting') ?: "Questions? We're here to help.";
  $active = get_transient('sous_active') === '1';

  wp_localize_script('sous-widget', '__SOUS__', array(
    'apiEndpoint' => 'https://api.sous.ai/ask',
    'siteKey'     => wp_hash(site_url(), 'auth'),
    'greeting'    => $greeting,
    'theme'       => array(
      'primary' => '#334155',
      'bubble'  => '#334155',
      'text'    => '#ffffff',
    ),
    'category'    => $category,
    'active'      => $active,
  ));
}
add_action('wp_enqueue_scripts', 'sous_enqueue_widget');
