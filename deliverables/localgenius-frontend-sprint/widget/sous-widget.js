(function() {
  'use strict';

  var CONFIG = window.__SOUS__ || {};
  var API = CONFIG.apiEndpoint || '/ask';
  var SITE_KEY = CONFIG.siteKey || 'default';
  var GREETING = CONFIG.greeting || "Questions? We're here to help.";
  var THEME = CONFIG.theme || { primary: '#334155', bubble: '#334155', text: '#ffffff' };

  var OPEN = false;
  var TYPING = false;
  var MESSAGES = [];

  function createStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '#lg-widget{position:fixed;bottom:24px;right:24px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}',
      '#lg-bubble{width:56px;height:56px;border-radius:50%;background:' + THEME.bubble + ';color:' + THEME.text + ';display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.2s;animation:lg-pop 0.3s ease-out;}',
      '#lg-bubble:hover{transform:scale(1.05);}',
      '#lg-modal{position:fixed;bottom:96px;right:24px;width:380px;max-width:calc(100vw - 48px);height:520px;max-height:80vh;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;transition:opacity 0.2s,transform 0.2s;opacity:0;pointer-events:none;transform:translateY(12px);}',
      '#lg-modal.lg-open{opacity:1;pointer-events:auto;transform:translateY(0);}',
      '@media(max-width:480px){#lg-modal{bottom:0;right:0;width:100%;max-width:100%;height:auto;max-height:80vh;border-radius:16px 16px 0 0;}}',
      '#lg-header{padding:16px 20px;background:' + THEME.primary + ';color:#fff;font-weight:600;font-size:15px;border-radius:16px 16px 0 0;}',
      '#lg-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;}',
      '#lg-messages::-webkit-scrollbar{width:6px;}',
      '#lg-messages::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.2);border-radius:3px;}',
      '.lg-user-bubble{align-self:flex-end;background:#1e293b;color:#fff;padding:10px 14px;border-radius:16px 16px 4px 16px;font-size:14px;line-height:1.45;max-width:80%;word-wrap:break-word;}',
      '.lg-assistant-bubble{align-self:flex-start;background:#f8fafc;color:#0f172a;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:14px;line-height:1.45;max-width:80%;word-wrap:break-word;}',
      '#lg-typing{display:none;align-self:flex-start;background:#f8fafc;padding:12px 16px;border-radius:16px 16px 16px 4px;}',
      '#lg-typing.lg-visible{display:flex;gap:4px;}',
      '#lg-typing span{width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:lg-bounce 1.2s infinite ease-in-out;}',
      '#lg-typing span:nth-child(2){animation-delay:0.15s;}',
      '#lg-typing span:nth-child(3){animation-delay:0.3s;}',
      '@keyframes lg-bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}',
      '@keyframes lg-pop{0%{transform:scale(0);}80%{transform:scale(1.1);}100%{transform:scale(1);}}',
      '#lg-footer{padding:12px 16px;border-top:1px solid #e2e8f0;display:flex;gap:8px;}',
      '#lg-input{flex:1;border:1px solid #cbd5e1;border-radius:24px;padding:8px 14px;font-size:14px;outline:none;}',
      '#lg-input:focus{border-color:' + THEME.primary + ';}',
      '#lg-send{width:36px;height:36px;border-radius:50%;background:' + THEME.primary + ';color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;}',
      '#lg-fallback{display:none;padding:16px;background:#fefce8;border-top:1px solid #fde047;}',
      '#lg-fallback.lg-visible{display:block;}',
      '#lg-fallback p{margin:0 0 8px;font-size:13px;color:#854d0e;}',
      '#lg-email{width:100%;padding:8px 12px;border:1px solid #fde047;border-radius:8px;font-size:13px;margin-bottom:8px;box-sizing:border-box;}',
      '#lg-fallback-btn{background:' + THEME.primary + ';color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;cursor:pointer;}',
      '.lg-close{position:absolute;top:12px;right:16px;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1;}',
    ].join('');
    document.head.appendChild(style);
  }

  function buildWidget() {
    var root = document.createElement('div');
    root.id = 'lg-widget';

    var bubble = document.createElement('div');
    bubble.id = 'lg-bubble';
    bubble.innerHTML = '&#9993;';
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.addEventListener('click', toggleModal);
    bubble.addEventListener('touchend', function(e) { e.preventDefault(); toggleModal(); });

    var modal = document.createElement('div');
    modal.id = 'lg-modal';

    var header = document.createElement('div');
    header.id = 'lg-header';
    header.textContent = GREETING;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'lg-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.addEventListener('click', closeModal);
    header.appendChild(closeBtn);

    var messages = document.createElement('div');
    messages.id = 'lg-messages';

    var typing = document.createElement('div');
    typing.id = 'lg-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    var fallback = document.createElement('div');
    fallback.id = 'lg-fallback';
    fallback.innerHTML = '<p>We could not reach our team right now. Leave your email and we will follow up shortly.</p>' +
      '<input type="email" id="lg-email" placeholder="owner@yourbusiness.com" />' +
      '<button id="lg-fallback-btn">Send</button>';

    var footer = document.createElement('div');
    footer.id = 'lg-footer';

    var input = document.createElement('input');
    input.id = 'lg-input';
    input.type = 'text';
    input.placeholder = 'Type your question here...';
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleSubmit();
    });

    var sendBtn = document.createElement('button');
    sendBtn.id = 'lg-send';
    sendBtn.innerHTML = '&#10148;';
    sendBtn.addEventListener('click', handleSubmit);

    footer.appendChild(input);
    footer.appendChild(sendBtn);

    modal.appendChild(header);
    modal.appendChild(messages);
    modal.appendChild(typing);
    modal.appendChild(fallback);
    modal.appendChild(footer);

    root.appendChild(modal);
    root.appendChild(bubble);
    document.body.appendChild(root);
  }

  function toggleModal() {
    OPEN = !OPEN;
    var modal = document.getElementById('lg-modal');
    if (modal) {
      modal.classList.toggle('lg-open', OPEN);
    }
    if (OPEN && MESSAGES.length === 0) {
      addAssistantMessage("What can we help you with today?");
    }
  }

  function closeModal() {
    OPEN = false;
    var modal = document.getElementById('lg-modal');
    if (modal) modal.classList.remove('lg-open');
  }

  function sanitizeInput(str) {
    var out = String(str).replace(/<[^>]*>/g, '');
    if (out.length > 500) out = out.slice(0, 500);
    return out.trim();
  }

  function addUserMessage(text) {
    var el = document.createElement('div');
    el.className = 'lg-user-bubble';
    el.textContent = text;
    var container = document.getElementById('lg-messages');
    if (container) {
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }
    MESSAGES.push({ role: 'user', text: text });
  }

  function addAssistantMessage(text) {
    var el = document.createElement('div');
    el.className = 'lg-assistant-bubble';
    el.textContent = text;
    var container = document.getElementById('lg-messages');
    if (container) {
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }
    MESSAGES.push({ role: 'assistant', text: text });
  }

  function setTyping(show) {
    TYPING = show;
    var el = document.getElementById('lg-typing');
    if (el) el.classList.toggle('lg-visible', show);
  }

  function setFallback(show) {
    var el = document.getElementById('lg-fallback');
    if (el) el.classList.toggle('lg-visible', show);
  }

  async function handleSubmit() {
    var input = document.getElementById('lg-input');
    var raw = input ? input.value : '';
    var text = sanitizeInput(raw);
    if (!text) return;

    addUserMessage(text);
    if (input) input.value = '';
    setFallback(false);
    setTyping(true);

    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, 2000);

    try {
      var res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, site_id: SITE_KEY }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      setTyping(false);

      if (!res.ok) throw new Error('Bad response');
      var data = await res.json();

      if (data && data.answer) {
        addAssistantMessage(data.answer);
      } else {
        setFallback(true);
      }
    } catch (err) {
      clearTimeout(timer);
      setTyping(false);
      setFallback(true);
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        createStyles();
        buildWidget();
      });
    } else {
      createStyles();
      buildWidget();
    }
  }

  init();
})();
