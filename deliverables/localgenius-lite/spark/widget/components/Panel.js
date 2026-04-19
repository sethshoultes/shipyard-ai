/**
 * SPARK Panel Component
 * Creates the chat panel with header, messages, input, and footer
 */

export function createPanel(onClose, onSend) {
  const panel = document.createElement('div');
  panel.className = 'spark-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'spark-header';

  const title = document.createElement('h3');
  title.textContent = 'SPARK Assistant';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'spark-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.addEventListener('click', onClose);

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Messages container
  const messages = document.createElement('div');
  messages.className = 'spark-messages';

  // Input container
  const inputContainer = document.createElement('div');
  inputContainer.className = 'spark-input-container';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'spark-input';
  input.placeholder = 'Ask me anything about this page...';
  input.setAttribute('aria-label', 'Type your message');

  const sendBtn = document.createElement('button');
  sendBtn.className = 'spark-send';
  sendBtn.textContent = 'Send';
  sendBtn.setAttribute('aria-label', 'Send message');

  // Handle send
  const handleSend = () => {
    const text = input.value.trim();
    if (text && !sendBtn.disabled) {
      onSend(text);
      input.value = '';
    }
  };

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });

  inputContainer.appendChild(input);
  inputContainer.appendChild(sendBtn);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'spark-footer';
  footer.innerHTML = 'Powered by <a href="https://usespark.com" target="_blank" rel="noopener">SPARK</a>';

  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(inputContainer);
  panel.appendChild(footer);

  return {
    panel,
    messages,
    input,
    sendBtn
  };
}
