/**
 * SPARK Message Component
 * Creates message bubbles for user and AI messages
 */

export function createMessage(text, type = 'ai', showRetry = false) {
  const message = document.createElement('div');
  message.className = `spark-message ${type}`;
  message.textContent = text;

  if (showRetry) {
    const retryBtn = document.createElement('button');
    retryBtn.className = 'spark-retry';
    retryBtn.textContent = 'Retry';
    message.appendChild(retryBtn);
    return { message, retryBtn };
  }

  return { message };
}

export function createTypingIndicator() {
  const typing = document.createElement('div');
  typing.className = 'spark-typing';

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'spark-typing-dot';
    typing.appendChild(dot);
  }

  return typing;
}
