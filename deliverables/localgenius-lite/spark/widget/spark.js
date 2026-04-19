/**
 * SPARK Widget - Main Entry Point
 * Self-initializing IIFE with Shadow DOM isolation
 */

import { createButton } from './components/Button.js';
import { createPanel } from './components/Panel.js';
import { createMessage, createTypingIndicator } from './components/Message.js';
import { getSiteId } from './utils/storage.js';
import { scrapePageContent, setupContentObserver } from './utils/scraper.js';
import { sendMessage } from './utils/api.js';

(function() {
  'use strict';

  // State
  let isOpen = false;
  let pageContent = null;
  let currentTypingIndicator = null;
  let lastQuestion = null;

  // Create shadow host
  const host = document.createElement('div');
  host.id = 'spark-widget-host';
  const shadow = host.attachShadow({ mode: 'open' });

  // Load styles
  const style = document.createElement('style');
  fetch(new URL('./styles/spark.css', import.meta.url))
    .then(res => res.text())
    .then(css => {
      style.textContent = css;
    })
    .catch(err => {
      console.error('SPARK: Failed to load styles', err);
      // Fallback: inject minimal inline styles
      style.textContent = ':host { all: initial; display: block; }';
    });

  shadow.appendChild(style);

  // Create components
  const button = createButton(() => {
    isOpen = !isOpen;
    panelEl.classList.toggle('open', isOpen);

    if (isOpen && messagesEl.children.length === 0) {
      // Show welcome message
      const { message } = createMessage(
        "Hi! I'm here to help you find information on this page. What would you like to know?",
        'ai'
      );
      messagesEl.appendChild(message);
    }
  });

  const { panel: panelEl, messages: messagesEl, input: inputEl, sendBtn: sendBtnEl } = createPanel(
    () => {
      isOpen = false;
      panelEl.classList.remove('open');
    },
    (text) => handleSendMessage(text)
  );

  // Add components to shadow DOM
  shadow.appendChild(button);
  shadow.appendChild(panelEl);

  // Handle message sending
  function handleSendMessage(text) {
    if (!text.trim()) return;

    lastQuestion = text;

    // Optimistic UI: show user message immediately
    const { message: userMessage } = createMessage(text, 'user');
    messagesEl.appendChild(userMessage);
    scrollToBottom();

    // Disable send button
    sendBtnEl.disabled = true;

    // Show typing indicator
    currentTypingIndicator = createTypingIndicator();
    messagesEl.appendChild(currentTypingIndicator);
    scrollToBottom();

    // Prepare AI message
    const { message: aiMessage } = createMessage('', 'ai');
    let aiMessageAdded = false;

    // Send to API
    const siteId = getSiteId();

    sendMessage(
      siteId,
      pageContent,
      text,
      // onChunk
      (chunk) => {
        if (!aiMessageAdded) {
          // Remove typing indicator and add AI message
          if (currentTypingIndicator && currentTypingIndicator.parentNode) {
            currentTypingIndicator.parentNode.removeChild(currentTypingIndicator);
          }
          messagesEl.appendChild(aiMessage);
          aiMessageAdded = true;
        }
        aiMessage.textContent += chunk;
        scrollToBottom();
      },
      // onComplete
      () => {
        if (currentTypingIndicator && currentTypingIndicator.parentNode) {
          currentTypingIndicator.parentNode.removeChild(currentTypingIndicator);
        }
        sendBtnEl.disabled = false;
        scrollToBottom();
      },
      // onError
      (errorMsg) => {
        if (currentTypingIndicator && currentTypingIndicator.parentNode) {
          currentTypingIndicator.parentNode.removeChild(currentTypingIndicator);
        }

        const { message: errorMessage, retryBtn } = createMessage(errorMsg, 'error', true);
        messagesEl.appendChild(errorMessage);

        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            // Remove error message
            errorMessage.parentNode.removeChild(errorMessage);
            // Retry last question
            handleSendMessage(lastQuestion);
          });
        }

        sendBtnEl.disabled = false;
        scrollToBottom();
      }
    );
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Initialize: scrape page content
  setupContentObserver((content) => {
    pageContent = content;
    console.log('SPARK: Page content updated', content);
  });

  // Attach to DOM when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(host);
    });
  } else {
    document.body.appendChild(host);
  }

  // Export for debugging
  window.SPARK = {
    version: '1.0.0',
    open: () => {
      isOpen = true;
      panelEl.classList.add('open');
    },
    close: () => {
      isOpen = false;
      panelEl.classList.remove('open');
    },
    getSiteId: getSiteId
  };
})();
